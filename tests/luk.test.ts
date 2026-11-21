import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { ENEMY_INDEX } from '../src/data/enemies';
import { PASSIVES } from '../src/data/passives';
import type { AchievementDef } from '../src/data/types';
import { WEAPON_BY_ID, WEAPONS } from '../src/data/weapons';
import { achievementProgress, applyRun, runPool, unlockedWeaponIds } from '../src/meta/progress';
import { defaultSave } from '../src/meta/save';
import { applyCard, levelUpCards, NEW_WEAPON_FULL, NEW_WEAPON_WEIGHT, type Card } from '../src/sim/cards';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';
import { icon } from '../src/ui/icons';

const map = new GameMap();
const still: InputState = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
const world = (pool?: string[]): World => {
  const w = new World(map, { seed: 5, weaponPool: pool });
  w.spawner.disabled = true;
  w.bonuses.disabled = true;
  w.stats.critChance = 0;
  return w;
};
const sokol: Card = { kind: 'passive', id: 'sokol', rarity: 'common', isNew: false, level: 1, name: '', text: '', icon: '', color: 0 };
/** Wróg, który stoi w miejscu i jest już w pełni „wyłoniony”. */
const spawn = (w: World, type: string, x: number, z: number): number => {
  const i = w.spawnEnemy(ENEMY_INDEX[type] as number, x, z);
  w.enemies.spawnT[i] = 0;
  w.enemies.speed[i] = 0;
  return i;
};
const build = (w: World): void => w.grid.build(w.enemies.n, w.enemies.alive, w.enemies.x, w.enemies.z);

describe('Łuk Dziewanny: dane', () => {
  const luk = WEAPON_BY_ID.luk!;

  it('jest bronią typu bolt z własną ikoną, bez ewolucji, odblokowywaną osiągnięciem', () => {
    expect(luk.kind).toBe('bolt');
    expect(luk.aim).toBe('strongest');
    expect(luk.rankBonus).toBeGreaterThan(0);
    expect(luk.evolution).toBeUndefined();
    expect(luk.silver).toBeUndefined();
    expect(icon(luk.icon)).not.toBe(icon('__brak__'));
    expect(ACHIEVEMENTS.find((a) => a.id === luk.unlock)?.cond).toEqual({ type: 'book', book: 'sokol', level: 10 });
  });
});

describe('Łuk Dziewanny: odblokowanie', () => {
  const ach = ACHIEVEMENTS.find((a) => a.id === 'luk') as AchievementDef;

  it('Księga Sokoła na 10. poziom w runie odblokowuje łuk, a pasek pokazuje najlepszą próbę', () => {
    const save = defaultSave();
    expect(unlockedWeaponIds(save)).not.toContain('luk');
    const w = world();
    for (let k = 0; k < 7; k++) applyCard(w, sokol);
    applyRun(save, w.summary());
    expect(unlockedWeaponIds(save)).not.toContain('luk');
    expect(achievementProgress(save, ach)).toEqual({ have: 7, need: 10 });
    for (let k = 0; k < 3; k++) applyCard(w, sokol);
    const res = applyRun(save, w.summary());
    expect(res.unlocked).toContain(ach);
    expect(runPool(save, 'w')).toContain('luk');
  });

  it('odblokowany łuk pojawia się na kartach awansu, zablokowany nigdy', () => {
    const offered = (pool: string[]): boolean => {
      const w = world(pool);
      for (let k = 0; k < 200; k++) if (levelUpCards(w, 3).some((c) => c.kind === 'weapon' && c.id === 'luk')) return true;
      return false;
    };
    const save = defaultSave();
    expect(offered(runPool(save, 'w'))).toBe(false);
    save.achievements.push('luk');
    expect(offered(runPool(save, 'w'))).toBe(true);
  });
});

describe('Łuk Dziewanny: w walce', () => {
  it('celuje w najsilniejszego wroga w zasięgu, nie w najbliższego', () => {
    const w = world();
    const near = spawn(w, 'chochlik', 0, 5);
    const tough = spawn(w, 'wilkolak', 14, 0);
    const far = spawn(w, 'jaga', 0, -200);
    build(w);
    expect(w.nearest(0, 0, 30)).toBe(near);
    expect(w.strongest(0, 0, 30)).toBe(tough);
    // Poza zasięgiem nawet mini-boss się nie liczy; przy równym zdrowiu wygrywa bliższy.
    expect(w.strongest(0, 0, 30)).not.toBe(far);
    const twin = spawn(w, 'wilkolak', 6, 0);
    build(w);
    expect(w.strongest(0, 0, 30)).toBe(twin);
    expect(w.strongest(500, 500, 30)).toBe(-1);
  });

  it('strzała leci w najsilniejszego, przebija i zabija na konto łuku', () => {
    const w = world();
    w.weapons.length = 0;
    const luk = w.addWeapon('luk')!;
    luk.timer = 0;
    // Chochlik bliżej, ale z boku; dwa utopce w jednej linii z wilkołakiem.
    const near = spawn(w, 'chochlik', -6, 0);
    const a = spawn(w, 'utopiec', 0, 6);
    const b = spawn(w, 'utopiec', 0, 9);
    const tough = spawn(w, 'wilkolak', 0, 14);
    const e = w.enemies;
    const hp = [near, a, b, tough].map((i) => e.hp[i] as number);
    for (let k = 0; k < 40; k++) w.step(1 / 60, still);
    expect(e.hp[near]).toBe(hp[0]);
    expect(e.alive[a]).toBe(0);
    expect(e.alive[b]).toBe(0);
    expect(e.hp[tough]).toBeLessThan(hp[3] as number);
    expect(w.killsByWeapon).toEqual({ luk: 2 });
  });

  it('mini-bossy i bossy dostają premię do obrażeń, zwykli wrogowie nie', () => {
    const hit = (type: string): number => {
      const w = world();
      w.weapons.length = 0;
      const luk = w.addWeapon('luk')!;
      luk.timer = 0;
      const i = spawn(w, type, 0, 8);
      w.enemies.hp[i] = 1e4;
      w.enemies.maxHp[i] = 1e4;
      for (let k = 0; k < 30; k++) w.step(1 / 60, still);
      return 1e4 - (w.enemies.hp[i] as number);
    };
    const base = hit('wilkolak');
    expect(base).toBeGreaterThan(30);
    expect(hit('jaga')).toBeCloseTo(base * 1.5, 1);
    expect(hit('leszy')).toBeCloseTo(base * 1.5, 1);
  });
});

describe('wspólny budżet nowych broni', () => {
  it('większa pula nie zwiększa łącznej szansy na kartę nowej broni', () => {
    const bases = WEAPONS.filter((x) => !x.evolved).map((x) => x.id);
    expect(bases.length).toBeGreaterThan(NEW_WEAPON_FULL + 1);
    const share = (pool: string[]): number => {
      const w = new World(map, { seed: 9, weaponPool: pool, passivePool: PASSIVES.map((p) => p.id) });
      let weapons = 0;
      let total = 0;
      for (let k = 0; k < 4000; k++) {
        const c = levelUpCards(w, 1)[0] as Card;
        total++;
        if (c.kind === 'weapon' && c.isNew) weapons++;
      }
      return weapons / total;
    };
    // 10 broni (9 nowych do wyboru) to pula sprzed planu; pełna pula ma dawać tyle samo.
    const before = share(bases.filter((id) => id !== 'luk'));
    const now = share(bases);
    expect(NEW_WEAPON_WEIGHT * NEW_WEAPON_FULL).toBe(36);
    expect(Math.abs(now - before)).toBeLessThan(0.03);
  });
});
