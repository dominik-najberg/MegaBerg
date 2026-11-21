import { describe, expect, it } from 'vitest';
import { ACHIEVEMENT_BY_ID } from '../src/data/achievements';
import { ENEMY_INDEX } from '../src/data/enemies';
import { ITEMS } from '../src/data/items';
import { PASSIVE_BY_ID, PASSIVES } from '../src/data/passives';
import { KIND_LINES } from '../src/data/weaponLines';
import { DICE_CAP, DICE_MEAN, FANG_CAP, LOWHP_BONUS, REAP_KILLS, REAP_MAX, REAP_MUL, WEAPON_BY_ID, weaponLine, WEAPONS } from '../src/data/weapons';
import { applyRun, buySilver, runPool, unlockedWeaponIds } from '../src/meta/progress';
import { defaultSave } from '../src/meta/save';
import { canEvolve } from '../src/sim/cards';
import type { InputState } from '../src/sim/player';
import { MAX_ZONES, ProjKind, ZoneKind } from '../src/sim/pools';
import { GameMap } from '../src/sim/terrain';
import { MAX_TRAPS } from '../src/sim/weapons';
import { SECRET_REACH, World, type WeaponInst } from '../src/sim/world';
import { icon } from '../src/ui/icons';

const map = new GameMap();
const still: InputState = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
const DT = 1 / 60;

/** Świat bez fal i bonusów, z jedną bronią gotową do ataku i bez krytów. */
const arm = (id: string, seed = 5): { w: World; inst: WeaponInst } => {
  const w = new World(map, { seed });
  w.spawner.disabled = true;
  w.bonuses.disabled = true;
  w.stats.critChance = 0;
  w.weapons.length = 0;
  const inst = w.addWeapon(id) as WeaponInst;
  inst.timer = 0;
  return { w, inst };
};
/** Wróg, który stoi w miejscu, jest w pełni „wyłoniony” i ma dużo zdrowia. */
const dummy = (w: World, type: string, x: number, z: number, hp = 1e5): number => {
  const i = w.spawnEnemy(ENEMY_INDEX[type] as number, x, z);
  w.enemies.spawnT[i] = 0;
  w.enemies.speed[i] = 0;
  w.enemies.dmg[i] = 0;
  w.enemies.hp[i] = hp;
  w.enemies.maxHp[i] = hp;
  return i;
};
const run = (w: World, seconds: number): void => {
  for (let k = 0; k < Math.round(seconds / DT); k++) w.step(DT, still);
};
const lost = (w: World, i: number, hp = 1e5): number => hp - (w.enemies.hp[i] as number);
const zonesOf = (w: World, kind: number): number => {
  let n = 0;
  for (let i = 0; i < w.zones.n; i++) if (w.zones.alive[i] && w.zones.kind[i] === kind) n++;
  return n;
};
const projOf = (w: World, kind: number): number => {
  let n = 0;
  for (let i = 0; i < w.projectiles.n; i++) if (w.projectiles.alive[i] && w.projectiles.kind[i] === kind) n++;
  return n;
};

const PLAN: Record<string, string> = {
  luk: 'lowy',
  roj: 'barc',
  wnyki: 'doly',
  miotla: 'lot',
  krzywula: 'wicher',
  wir: 'traba',
  studnia: 'otchlan',
  szabla: 'zarszabla',
  puklerz: 'mur',
  wrzeciono: 'przedza',
  wapierz: 'glod',
  kostki: 'wyrok',
  miecz: 'ostrze',
  kosisko: 'zniwo',
};

describe('bronie z planu: dane', () => {
  it('jest 24 broni podstawowych, 6 od startu, każda z ewolucją, ikoną i liniami statów', () => {
    const bases = WEAPONS.filter((w) => !w.evolved);
    expect(bases.length).toBe(24);
    expect(bases.filter((w) => !w.unlock).length).toBe(6);
    const fallback = icon('__brak__');
    for (const w of WEAPONS) {
      expect(icon(w.icon), w.id).not.toBe(fallback);
      expect(KIND_LINES[w.kind].length, w.id).toBeGreaterThan(0);
      if (w.unlock) expect(ACHIEVEMENT_BY_ID[w.unlock], w.id).toBeDefined();
    }
    for (const w of bases) {
      expect(w.levels.length, w.id).toBe(4);
      const into = WEAPON_BY_ID[w.evolution?.into ?? ''];
      expect(into?.evolved, w.id).toBe(true);
      expect(into?.kind, w.id).toBe(w.kind);
      // Ewolucja zachowuje zasadę broni i liczy się do tej samej linii.
      expect(into?.rule, w.id).toBe(w.rule);
      expect(weaponLine(into!.id)).toBe(w.id);
      expect(PASSIVE_BY_ID[w.evolution!.passive], w.id).toBeDefined();
    }
  });

  it('id broni nie pokrywa się z id żadnej księgi ani skarbu (wygnanie i pule pamiętają same id)', () => {
    const others = new Set([...PASSIVES.map((p) => p.id), ...ITEMS.map((i) => i.id)]);
    for (const w of WEAPONS) expect(others.has(w.id), w.id).toBe(false);
    expect(new Set(WEAPONS.map((w) => w.id)).size).toBe(WEAPONS.length);
  });

  it('czternaście broni planu ma ewolucje z tabeli i warunki odblokowania', () => {
    for (const [id, into] of Object.entries(PLAN)) {
      const w = WEAPON_BY_ID[id]!;
      expect(w.evolution?.into, id).toBe(into);
      expect(w.unlock, id).toBeDefined();
    }
    expect(ACHIEVEMENT_BY_ID.szabla!.cond).toEqual({ type: 'weaponKills', weapon: 'ciupaga', count: 2000 });
    expect(ACHIEVEMENT_BY_ID.wnyki!.cond).toEqual({ type: 'weaponKills', weapon: 'dziegiec', count: 5000 });
    expect(ACHIEVEMENT_BY_ID.miotla!.cond).toEqual({ type: 'enemyKills', enemy: 'jaga', count: 3 });
    expect(ACHIEVEMENT_BY_ID.kosisko!.cond).toEqual({ type: 'enemyKills', enemy: 'poludnica', count: 3 });
    expect(ACHIEVEMENT_BY_ID.roj!.cond).toEqual({ type: 'weaponLevel', weapon: 'wianek', level: 15 });
    expect(ACHIEVEMENT_BY_ID.puklerz!.cond).toEqual({ type: 'armorBlocked', amount: 500, character: 'bogumil' });
    expect(ACHIEVEMENT_BY_ID.miecz!.cond).toEqual({ type: 'book', book: 'czarnobog', level: 15, before: 360 });
    expect(ACHIEVEMENT_BY_ID.krzywula!.cond).toEqual({ type: 'secret', id: 'krzywula' });
    expect(WEAPON_BY_ID.wrzeciono!.unlock).toBe('winDobroslawa');
    // Tylko Krzywula (sekret) wymaga jeszcze zakupu za srebro.
    expect(WEAPONS.filter((w) => w.silver).map((w) => w.id)).toEqual(['krzywula']);
  });

  it('każda broń planu na 5. poziomie z właściwą księgą może ewoluować', () => {
    for (const id of Object.keys(PLAN)) {
      const { w, inst } = arm(id);
      inst.level = 5;
      expect(canEvolve(w, inst), id).toBe(false);
      w.passives.push({ def: PASSIVE_BY_ID[inst.def.evolution!.passive]!, level: 1, power: 1 });
      expect(canEvolve(w, inst), id).toBe(true);
      expect(w.evolveWeapon(inst)).toBe(true);
      expect(inst.def.id).toBe(PLAN[id]);
    }
  });
});

describe('nowe typy ataku', () => {
  it('rój: pszczoła zawraca do wroga, żądli i ginie; zabójstwo idzie na konto roju', () => {
    const { w } = arm('roj');
    const i = dummy(w, 'chochlik', 0, -7, 5);
    run(w, 2.5);
    expect(w.enemies.alive[i]).toBe(0);
    expect(w.killsByWeapon).toEqual({ roj: 1 });
    // Bez wrogów rój nie wylatuje, a stare pszczoły giną po czasie.
    run(w, 4);
    expect(projOf(w, ProjKind.Homing)).toBe(0);
  });

  it('wnyki: leżą, aż wejdzie w nie wróg; zatrzaskują się raz, ranią i spowalniają', () => {
    const { w, inst } = arm('wnyki');
    run(w, 0.1);
    expect(zonesOf(w, ZoneKind.Trap)).toBe(1);
    run(w, 1);
    expect(zonesOf(w, ZoneKind.Trap)).toBe(1);
    let zi = -1;
    for (let k = 0; k < w.zones.n; k++) if (w.zones.alive[k]) zi = k;
    inst.timer = 99;
    const i = dummy(w, 'wilkolak', w.zones.x[zi] as number, w.zones.z[zi] as number);
    const far = dummy(w, 'wilkolak', (w.zones.x[zi] as number) + 30, w.zones.z[zi] as number);
    run(w, 0.1);
    expect(zonesOf(w, ZoneKind.Trap)).toBe(0);
    expect(lost(w, i)).toBeCloseTo(inst.stats.damage * w.stats.damage, 1);
    expect(w.enemies.slowK[i]).toBeGreaterThan(0);
    expect(lost(w, far)).toBe(0);
  });

  it('wnyki: liczba leżących pułapek ma sufit, a pula stref nie pęka', () => {
    const { w, inst } = arm('wnyki');
    inst.stats = { ...inst.stats, cooldown: 0.12, count: 5, duration: 60 };
    run(w, 6);
    expect(zonesOf(w, ZoneKind.Trap)).toBe(MAX_TRAPS);
    expect(MAX_TRAPS).toBeLessThan(MAX_ZONES / 2);
  });

  it('miotła: w miejscu pali się jedna plama ognia, w biegu zostaje ślad', () => {
    const { w, inst } = arm('miotla');
    run(w, 2);
    expect(zonesOf(w, ZoneKind.Fire)).toBe(1);
    const i = dummy(w, 'wilkolak', 0.5, 0);
    run(w, 1);
    expect(lost(w, i)).toBeGreaterThan(inst.stats.damage);
    expect(w.killsByWeapon).toEqual({});
    const walk: InputState = { ...still, moveZ: 1 };
    for (let k = 0; k < 120; k++) w.step(DT, walk);
    expect(zonesOf(w, ZoneKind.Fire)).toBeGreaterThanOrEqual(3);
  });

  it('krzywula: rani w obie strony i wraca do ręki', () => {
    const { w, inst } = arm('krzywula');
    const i = dummy(w, 'wilkolak', 0, 5);
    run(w, 0.05);
    inst.timer = 99;
    expect(projOf(w, ProjKind.Boomerang)).toBe(1);
    run(w, 4);
    expect(projOf(w, ProjKind.Boomerang)).toBe(0);
    // Co najmniej dwa trafienia: w locie tam i z powrotem.
    expect(lost(w, i)).toBeGreaterThanOrEqual(inst.stats.damage * 2 - 1e-3);
  });

  it('wir: wędruje, rani co pół sekundy i odrzuca od środka', () => {
    const { w, inst } = arm('wir');
    const i = dummy(w, 'chochlik', 0, 1.2);
    run(w, 0.05);
    inst.timer = 99;
    expect(projOf(w, ProjKind.Twister)).toBe(1);
    run(w, 0.5);
    expect(lost(w, i)).toBeGreaterThanOrEqual(inst.stats.damage - 1e-3);
    expect(Math.hypot(w.enemies.x[i] as number, (w.enemies.z[i] as number) - 1.2)).toBeGreaterThan(0.3);
    run(w, inst.stats.duration);
    expect(projOf(w, ProjKind.Twister)).toBe(0);
  });

  it('studnia: wciąga zwykłych wrogów do środka, bossa nie rusza', () => {
    const { w, inst } = arm('studnia');
    const centre = dummy(w, 'chochlik', 0, 8);
    run(w, 0.05);
    inst.timer = 99;
    expect(zonesOf(w, ZoneKind.Vortex)).toBe(1);
    let zi = -1;
    for (let k = 0; k < w.zones.n; k++) if (w.zones.alive[k]) zi = k;
    const zx = w.zones.x[zi] as number;
    const zz = w.zones.z[zi] as number;
    const light = dummy(w, 'chochlik', zx + 3.5, zz);
    const boss = dummy(w, 'leszy', zx - 4, zz);
    run(w, 1.5);
    expect(Math.hypot((w.enemies.x[light] as number) - zx, (w.enemies.z[light] as number) - zz)).toBeLessThan(2.5);
    expect(Math.hypot((w.enemies.x[boss] as number) - zx, (w.enemies.z[boss] as number) - zz)).toBeGreaterThan(3.5);
    expect(lost(w, centre)).toBeGreaterThan(0);
  });

  it('puklerz: gotowy blokuje cały cios i oddaje falą; potem musi się naładować', () => {
    const { w, inst } = arm('puklerz');
    const i = dummy(w, 'wilkolak', 3, 0);
    const far = dummy(w, 'wilkolak', 30, 0);
    w.grid.build(w.enemies.n, w.enemies.alive, w.enemies.x, w.enemies.z);
    const hp = w.player.hp;
    w.hurtPlayer(40);
    expect(w.player.hp).toBe(hp);
    expect(w.guardBlocks).toBe(1);
    expect(w.damageTaken).toBe(0);
    expect(lost(w, i)).toBeCloseTo(inst.stats.damage * w.stats.damage, 3);
    expect(lost(w, far)).toBe(0);
    expect(inst.timer).toBeCloseTo(inst.stats.cooldown, 5);
    // Kolejny cios (po nietykalności) trafia, bo puklerz się ładuje.
    w.player.invuln = 0;
    w.hurtPlayer(40);
    expect(w.player.hp).toBe(hp - 40);
    run(w, inst.stats.cooldown + 0.1);
    w.player.invuln = 0;
    w.hurtPlayer(40);
    expect(w.guardBlocks).toBe(2);
  });

  it('wrzeciono: nić rani wszystko między bohaterem a celem, a nic obok', () => {
    const { w, inst } = arm('wrzeciono');
    const target = dummy(w, 'wilkolak', 0, 9);
    w.step(DT, still);
    // Dopiero teraz wrogowie na linii i obok: nić trzyma się pierwszego celu.
    const mid = dummy(w, 'chochlik', 0, 4);
    const side = dummy(w, 'chochlik', 4, 4);
    run(w, 1);
    expect(inst.targets[0]).toBe(target);
    expect(lost(w, target)).toBeGreaterThan(0);
    expect(lost(w, mid)).toBeGreaterThan(0);
    expect(lost(w, side)).toBe(0);
  });
});

describe('bronie z dodatkową zasadą', () => {
  it('szabla: cięcie dosięga wroga kilka kroków dalej, ciupaga nie', () => {
    const hit = (id: string): number => {
      const { w } = arm(id);
      const i = dummy(w, 'wilkolak', 0, 6);
      run(w, 0.3);
      return lost(w, i);
    };
    expect(hit('szabla')).toBeGreaterThan(0);
    expect(hit('ciupaga')).toBe(0);
  });

  it('kieł wąpierza: zabójstwa podnoszą maksymalne zdrowie, ale tylko do sufitu', () => {
    const { w, inst } = arm('wapierz');
    inst.timer = 99;
    w.rng.next = () => 0;
    const base = w.stats.maxHp;
    for (let k = 0; k < FANG_CAP + 15; k++) {
      const i = dummy(w, 'chochlik', 0, 5, 1);
      w.damageEnemy(i, 5, inst.slot, 0, 0, 0, inst.stats);
    }
    expect(w.runHp).toBe(FANG_CAP);
    expect(w.stats.maxHp).toBe(base + FANG_CAP);
    // Zabójstwo inną bronią nic nie daje.
    const { w: w2, inst: other } = arm('ogien');
    w2.rng.next = () => 0;
    const j = dummy(w2, 'chochlik', 0, 5, 1);
    w2.damageEnemy(j, 5, other.slot, 0, 0, 0, other.stats);
    expect(w2.runHp).toBe(0);
  });

  it('kostki: oczka skalują obrażenia, szóstka dodaje kryt do sufitu', () => {
    const { w, inst } = arm('kostki');
    w.rng.int = () => 5;
    dummy(w, 'wilkolak', 0, 8);
    const crit = w.stats.critChance;
    run(w, 0.05);
    let pi = -1;
    for (let k = 0; k < w.projectiles.n; k++) if (w.projectiles.alive[k]) pi = k;
    expect(w.projectiles.dmg[pi]).toBeCloseTo((inst.stats.damage * w.stats.damage * 6) / DICE_MEAN, 4);
    expect(w.runCrit).toBeGreaterThan(0);
    expect(w.stats.critChance).toBeCloseTo(crit + w.runCrit, 6);
    for (let k = 0; k < 1000; k++) w.diceSix(inst);
    expect(w.runCrit).toBeCloseTo(DICE_CAP, 6);
    // Kryt z kostek zostaje po przeliczeniu statystyk.
    w.refreshStats();
    expect(w.stats.critChance).toBeCloseTo(0.05 + DICE_CAP, 6);
  });

  it('miecz Nawii: im mniej zdrowia, tym mocniejszy cios', () => {
    const hit = (hpShare: number): number => {
      const { w } = arm('miecz');
      w.stats.damage = 1;
      w.player.hp = w.stats.maxHp * hpShare;
      const i = dummy(w, 'wilkolak', 0, 2);
      w.step(DT, still);
      return lost(w, i);
    };
    const full = hit(1);
    expect(full).toBeCloseTo(WEAPON_BY_ID.miecz!.base.damage as number, 3);
    expect(hit(0.5)).toBeCloseTo(full * (1 + LOWHP_BONUS * 0.5), 1);
    expect(hit(0.1)).toBeGreaterThan(hit(0.5));
  });

  it('kosa Południcy: zabójstwa kosą i elity ładują potrójny zamach', () => {
    const { w, inst } = arm('kosisko');
    w.stats.damage = 1;
    inst.timer = 99;
    for (let k = 0; k < REAP_KILLS - 1; k++) w.damageEnemy(dummy(w, 'chochlik', 0, 50, 1), 5, inst.slot, 0, 0, 0, inst.stats);
    expect(inst.charge).toBe(0);
    w.damageEnemy(dummy(w, 'chochlik', 0, 50, 1), 5, inst.slot, 0, 0, 0, inst.stats);
    expect(inst.charge).toBe(1);
    const i = dummy(w, 'wilkolak', 0, 2);
    inst.timer = 0;
    w.step(DT, still);
    expect(lost(w, i)).toBeCloseTo(inst.stats.damage * REAP_MUL, 3);
    expect(inst.charge).toBe(0);
    // Następny zamach jest zwykły.
    inst.timer = 0;
    w.step(DT, still);
    expect(lost(w, i)).toBeCloseTo(inst.stats.damage * (REAP_MUL + 1), 3);
    // Elita zabita czymkolwiek też ładuje; zapas ma sufit.
    for (let k = 0; k < REAP_MAX + 2; k++) {
      const e = w.spawnEnemy(ENEMY_INDEX.chochlik as number, 0, 60, true);
      w.damageEnemy(e, 1e6, -1, 0, 0, 0, null);
    }
    expect(inst.charge).toBe(REAP_MAX);
  });
});

describe('sekret Krzywuli', () => {
  it('kij leży pod dębem; podejście go znajduje, a znaleziony raz nie wraca na mapę', () => {
    const w = new World(map, { seed: 11 });
    const s = w.secret!;
    expect(s.id).toBe('krzywula');
    expect(map.obstacles.some((o) => o.kind === 'oak' && Math.hypot(o.x - s.x, o.z - s.z) < o.r + 1)).toBe(true);
    expect(w.secrets).toEqual([]);
    w.spawner.disabled = true;
    w.player.x = s.x + SECRET_REACH + 1;
    w.player.z = s.z;
    w.step(DT, still);
    expect(w.secrets).toEqual([]);
    w.player.x = s.x + 0.5;
    w.step(DT, still);
    expect(w.secrets).toEqual(['krzywula']);
    expect(s.found).toBe(true);
    expect(new World(map, { seed: 11, foundSecrets: ['krzywula'] }).secret).toBeNull();
    // Inny seed, inny dąb.
    const other = new World(map, { seed: 12 }).secret!;
    expect(Math.hypot(other.x - s.x, other.z - s.z)).toBeGreaterThan(1);
  });

  it('po znalezieniu broń trzeba jeszcze kupić za srebro', () => {
    const save = defaultSave();
    const w = new World(map, { seed: 11 });
    w.findSecret('krzywula');
    const res = applyRun(save, w.summary());
    expect(res.unlocked.map((a) => a.id)).toContain('krzywula');
    expect(save.found).toContain('krzywula');
    expect(unlockedWeaponIds(save)).not.toContain('krzywula');
    save.silver = WEAPON_BY_ID.krzywula!.silver as number;
    expect(buySilver(save, 'weapon:krzywula')).toBe(true);
    expect(runPool(save, 'w')).toContain('krzywula');
  });
});

describe('wszystkie bronie w walce', () => {
  it('każda broń (i ewolucja) zadaje obrażenia w tłumie i nie psuje stanu gry', () => {
    for (const def of WEAPONS) {
      const { w, inst } = arm(def.id, 21);
      w.godMode = false;
      for (let k = 0; k < 40; k++) {
        const a = (k / 40) * Math.PI * 2;
        const i = w.spawnEnemy(ENEMY_INDEX[k % 3 === 0 ? 'wilkolak' : 'chochlik'] as number, Math.sin(a) * (3 + (k % 5)), Math.cos(a) * (3 + (k % 5)));
        w.enemies.spawnT[i] = 0;
        w.enemies.dmg[i] = 0.01;
      }
      const walk: InputState = { ...still, moveX: 0.6, moveZ: 0.8 };
      for (let k = 0; k < 60 * 12; k++) w.step(DT, k % 240 < 120 ? walk : still);
      expect(inst.dealt, def.id).toBeGreaterThan(0);
      expect(Number.isFinite(w.player.hp) && Number.isFinite(w.player.x), def.id).toBe(true);
      for (let i = 0; i < w.enemies.n; i++) if (w.enemies.alive[i]) expect(Number.isFinite(w.enemies.x[i] as number) && Number.isFinite(w.enemies.hp[i] as number), def.id).toBe(true);
    }
  });
});
