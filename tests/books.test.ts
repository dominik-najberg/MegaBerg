import { describe, expect, it } from 'vitest';
import { ACHIEVEMENT_BY_ID } from '../src/data/achievements';
import { BOOK_MAX_LEVEL, PASSIVE_BY_ID, PASSIVES } from '../src/data/passives';
import { RARITIES } from '../src/data/rarity';
import { BASE_STATS } from '../src/data/types';
import { WEAPONS } from '../src/data/weapons';
import { applyRun } from '../src/meta/progress';
import { defaultSave } from '../src/meta/save';
import { applyCard, levelUpCards, NEW_BOOK_BUDGET, type Card } from '../src/sim/cards';
import { GameMap } from '../src/sim/terrain';
import { MAX_PASSIVES, World } from '../src/sim/world';
import { icon } from '../src/ui/icons';

const map = new GameMap();
const bookCard = (id: string, rarity: Card['rarity'] = 'common'): Card => ({ kind: 'passive', id, rarity, isNew: false, level: 1, name: '', text: '', icon: '', color: 0 });

describe('księgi: dane', () => {
  it('każda księga podnosi dokładnie jeden istniejący stat', () => {
    for (const b of PASSIVES) {
      expect(b.stat in BASE_STATS, b.id).toBe(true);
      expect(b.also, b.id).toBeUndefined();
      expect(b.name.startsWith('Księga'), b.id).toBe(true);
    }
  });

  it('mają wysoki sufit poziomów; tylko księgi całkowitoliczbowe kończą się wcześniej', () => {
    for (const b of PASSIVES) {
      if (b.fixedRarity) expect(b.maxLevel, b.id).toBeLessThanOrEqual(3);
      else expect(b.maxLevel, b.id).toBe(BOOK_MAX_LEVEL);
    }
    expect(BOOK_MAX_LEVEL).toBe(20);
    expect(MAX_PASSIVES).toBe(5);
  });

  it('każda nowa statystyka z etapu 1 ma swoją księgę', () => {
    const stats = new Set(PASSIVES.map((b) => b.stat));
    for (const s of ['critChance', 'critDamage', 'curse', 'lifesteal', 'thorns', 'evasion', 'shield', 'duration', 'projectileSpeed', 'knockback', 'attackSpeed'] as const) {
      expect(stats.has(s), s).toBe(true);
    }
  });

  it('każda księga ma własną ikonę (nie zapasową gwiazdkę)', () => {
    const fallback = icon('__brak__');
    for (const b of PASSIVES) expect(icon(b.icon), b.id).not.toBe(fallback);
  });

  it('partnerzy ewolucji pierwszych dziesięciu broni są w puli od początku, a zablokowane księgi mają istniejące osiągnięcie', () => {
    // Bronie z docs/BRONIE-PLAN.md (odblokowywane stylem gry) mogą ewoluować z księgą, którą też trzeba odblokować.
    const first = ['sierpy', 'ogien', 'grom', 'ciupaga', 'wianek', 'proca', 'kruki', 'marzanna', 'wlocznia', 'dziegiec'];
    for (const w of WEAPONS) {
      if (!w.evolution) continue;
      const b = PASSIVE_BY_ID[w.evolution.passive];
      expect(b, w.id).toBeDefined();
      if (first.includes(w.id)) expect(b!.unlock, `${w.id} → ${b!.id}`).toBeUndefined();
    }
    for (const b of PASSIVES) if (b.unlock) expect(ACHIEVEMENT_BY_ID[b.unlock], b.id).toBeDefined();
  });
});

describe('księgi: w grze', () => {
  it('księgę można podnieść do 20. poziomu i ani poziomu dalej', () => {
    const w = new World(map, { seed: 3 });
    for (let k = 0; k < 25; k++) applyCard(w, bookCard('pas'));
    const inst = w.findPassive('pas')!;
    expect(inst.level).toBe(20);
    expect(w.stats.damage).toBeCloseTo(1 + 0.1 + PASSIVE_BY_ID.pas!.perLevel * 20);
  });

  it('rzadkość nadal mnoży poziom księgi', () => {
    const w = new World(map, { seed: 3 });
    applyCard(w, bookCard('krzesiwo', 'legendary'));
    expect(w.stats.attackSpeed).toBeCloseTo(1 + PASSIVE_BY_ID.krzesiwo!.perLevel * RARITIES.legendary.power);
  });

  it('nie da się mieć więcej ksiąg niż slotów', () => {
    const w = new World(map, { seed: 3 });
    for (const b of PASSIVES.slice(0, MAX_PASSIVES + 3)) applyCard(w, bookCard(b.id));
    expect(w.passives.length).toBe(MAX_PASSIVES);
  });

  it('duża pula ksiąg dzieli jeden budżet wagi i nie wypiera broni z kart', () => {
    const all = PASSIVES.map((p) => p.id);
    let books = 0;
    let weapons = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const w = new World(map, { seed, passivePool: all, weaponPool: WEAPONS.filter((x) => !x.evolved).map((x) => x.id) });
      for (const c of levelUpCards(w, 3)) {
        if (c.kind === 'passive') books++;
        if (c.kind === 'weapon') weapons++;
      }
    }
    expect(NEW_BOOK_BUDGET).toBeGreaterThan(0);
    // Na starcie (1 broń, 0 ksiąg) karty broni nadal przeważają mimo 22 ksiąg w puli.
    expect(weapons).toBeGreaterThan(books);
  });

  it('osiągnięcie za poziom księgi odblokowuje nową księgę', () => {
    const save = defaultSave();
    const w = new World(map, { seed: 3 });
    for (let k = 0; k < 8; k++) applyCard(w, bookCard('sokol'));
    applyRun(save, w.summary());
    expect(save.achievements).toContain('bookKiel');
    expect(w.summary().books.sokol).toBe(8);
  });
});

describe('księgi: limity statystyk i szybkie pociski', () => {
  it('księga statystyki, która osiągnęła limit, nie wraca na karty ani do skrzyń', () => {
    const w = new World(map, { seed: 4 });
    for (let k = 0; k < 18; k++) applyCard(w, bookCard('onuce', 'legendary'));
    expect(w.stats.moveSpeed).toBe(2.2);
    for (let s = 0; s < 40; s++) {
      for (const c of levelUpCards(w, 3)) expect(c.id).not.toBe('onuce');
    }
  });

  it('pocisk przy wielkiej szybkości nie przelatuje przez wroga', async () => {
    const { ENEMY_INDEX } = await import('../src/data/enemies');
    const w = new World(map, { seed: 5 });
    w.spawner.disabled = true;
    w.weapons.length = 0;
    w.addWeapon('wlocznia');
    w.stats.projectileSpeed = 8;
    const p = w.player;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, p.x + 6, p.z);
    const hp = w.enemies.hp[i] as number;
    const input = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
    for (let t = 0; t < 120 && w.enemies.hp[i] === hp; t++) {
      w.enemies.x[i] = p.x + 6;
      w.enemies.z[i] = p.z;
      w.step(1 / 60, input);
      w.events.clear();
    }
    expect(w.enemies.hp[i] as number).toBeLessThan(hp);
  });
});

describe('osiągnięcia: zabójstwa całego runu', () => {
  it('tryb nieskończony nie zeruje zabójstw liczonych do osiągnięcia Strzygi', () => {
    const save = defaultSave();
    const w = new World(map, { seed: 3 });
    w.kills = 1000;
    w.runKills = 1000;
    w.won = true;
    applyRun(save, w.summary());
    expect(save.achievements).not.toContain('bookStrzyga');
    w.startEndless();
    w.kills = 600;
    w.runKills += 600;
    applyRun(save, { ...w.summary(), endless: true });
    expect(save.achievements).toContain('bookStrzyga');
  });
});
