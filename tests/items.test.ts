import { describe, expect, it } from 'vitest';
import { ENEMY_INDEX } from '../src/data/enemies';
import { ITEMS, jugLevels, MIRROR_INVULN, MOSS_BONUS, PURSE_METRES, SHOES_SHARE, SKULL_CAP } from '../src/data/items';
import { WEAPON_BY_ID } from '../src/data/weapons';
import { applyCard, rollLines } from '../src/sim/cards';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';
import { icon } from '../src/ui/icons';

const map = new GameMap();
const still: InputState = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
const world = (seed = 3): World => {
  const w = new World(map, { seed });
  w.spawner.disabled = true;
  w.bonuses.disabled = true;
  return w;
};

describe('skarby: dane', () => {
  it('ok. 15 przedmiotów, każdy z rzadkością, ikoną i efektem albo statami', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    const fallback = icon('__brak__');
    for (const i of ITEMS) {
      expect(icon(i.icon), i.id).not.toBe(fallback);
      expect(Boolean(i.mods) !== Boolean(i.effect), i.id).toBe(true);
    }
    expect(new Set(ITEMS.map((i) => i.rarity)).size).toBe(4);
  });
});

describe('skarby: w grze', () => {
  it('kopie się stackują bez limitu, a staty rosną z liczbą kopii', () => {
    const w = world();
    for (let k = 0; k < 12; k++) applyCard(w, { kind: 'item', id: 'rog', rarity: 'common', isNew: false, level: 1, name: '', text: '', icon: '', color: 0 });
    expect(w.itemCount('rog')).toBe(12);
    expect(w.items).toHaveLength(1);
    expect(w.stats.damage).toBeCloseTo(1 + 0.1 + 0.08 * 12);
  });

  it('Kamień Peruna i Krzemień zadają obrażenia z trafień bronią, ale nie z samych siebie', () => {
    const w = world();
    for (let k = 0; k < 10; k++) {
      w.addItem('kamien');
      w.addItem('krzemien');
    }
    w.stats.critChance = 0;
    const e = w.enemies;
    for (let k = 0; k < 40; k++) {
      const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 3, 3);
      // Wybuch i piorun szukają celów w siatce przestrzennej, którą zwykle buduje krok symulacji.
      w.grid.build(e.n, e.alive, e.x, e.z);
      w.damageEnemy(i, 1, 0, 1, 0, 0, null);
    }
    expect(w.procDealt).toBeGreaterThan(0);
    const before = w.procDealt;
    const j = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 30, 30);
    for (let k = 0; k < 40; k++) w.damageEnemy(j, 1, -1, 1, 0, 0, null);
    expect(w.procDealt).toBe(before);
  });

  it('Kosa Marzanny zabija od razu zwykłych wrogów, nigdy bossów', () => {
    const w = world();
    for (let k = 0; k < 200; k++) w.addItem('kosa');
    w.stats.critChance = 0;
    let killed = 0;
    for (let k = 0; k < 30; k++) {
      const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 3, 3);
      w.damageEnemy(i, 1, 0, 1, 0, 0, null);
      if (!w.enemies.alive[i]) killed++;
    }
    expect(killed).toBeGreaterThan(5);
    expect(w.executions).toBe(killed);
    const boss = w.spawnEnemy(ENEMY_INDEX.leszy as number, 5, 5);
    for (let k = 0; k < 100; k++) w.damageEnemy(boss, 1, 0, 1, 0, 0, null);
    expect(w.enemies.alive[boss]).toBe(1);
  });

  it('Czaszka upiora rośnie z zabójstwami do limitu', () => {
    const w = world();
    w.addItem('czaszka');
    for (let k = 0; k < 2000; k++) {
      const i = w.spawnEnemy(ENEMY_INDEX.chochlik as number, 3, 3);
      w.damageEnemy(i, 1e6, -1, 1, 0, 0, null);
    }
    expect(w.skullBonus).toBeCloseTo(SKULL_CAP);
  });

  it('Mech pustelnika daje premię tylko stojącemu bohaterowi', () => {
    const w = world();
    w.addItem('mech');
    expect(w.mossBonus()).toBe(0);
    for (let t = 0; t < 90; t++) w.step(1 / 60, still);
    expect(w.mossBonus()).toBeCloseTo(MOSS_BONUS);
    w.step(1 / 60, { ...still, moveZ: 1 });
    expect(w.mossBonus()).toBe(0);
  });

  it('Skrzydlate łapcie zamieniają szybkość ruchu na szybkość ataku', () => {
    const w = world();
    const before = w.stats.attackSpeed;
    w.addItem('lapcie');
    // Wojmir: +5% szybkości ruchu.
    expect(w.stats.attackSpeed).toBeCloseTo(before + SHOES_SHARE * 0.05);
  });

  it('Sakiewka wędrowca płaci za przebyty dystans', () => {
    const w = world();
    w.addItem('sakiewka');
    const gold = w.gold;
    let walked = 0;
    while (walked < PURSE_METRES * 2.2) {
      const p = w.player;
      const x = p.x;
      const z = p.z;
      w.step(1 / 60, { ...still, moveZ: 1 });
      walked += Math.hypot(p.x - x, p.z - z);
    }
    expect(w.gold - gold).toBeCloseTo(2 * w.stats.goldGain);
  });

  it('Dzban kowala podnosi najwyższy poziom broni: +5, potem po +2', () => {
    const w = world();
    expect(w.weaponCap()).toBe(15);
    w.addItem('dzban');
    expect(w.weaponCap()).toBe(20);
    w.addItem('dzban');
    expect(w.weaponCap()).toBe(22);
    expect(jugLevels(3)).toBe(9);
  });

  it('Kowadło Swaroga dokłada linię na kartach broni', () => {
    const w = world();
    expect(rollLines(w.rng, WEAPON_BY_ID.ogien!, 6, 'common', false, [], 0)).toHaveLength(1);
    expect(rollLines(w.rng, WEAPON_BY_ID.ogien!, 6, 'common', false, [], 1)).toHaveLength(2);
  });

  it('Lustro wiedźmy wydłuża nietykalność po ciosie', () => {
    const w = world();
    w.addItem('lustro');
    w.addItem('lustro');
    w.hurtPlayer(5);
    expect(w.player.invuln).toBeCloseTo(0.5 + 2 * MIRROR_INVULN);
  });
});

describe('skarby: efekty nie psują ataków obszarowych', () => {
  it('efekt skarbu nie nadpisuje listy celów (bufA, bufB) ataku, który go wywołał', () => {
    const w = world();
    for (let k = 0; k < 20; k++) {
      w.addItem('krzemien');
      w.addItem('kamien');
    }
    const e = w.enemies;
    for (let k = 0; k < 12; k++) e.hp[w.spawnEnemy(ENEMY_INDEX.utopiec as number, 8 + (k % 4), 8 + Math.floor(k / 4))] = 1e6;
    w.grid.build(e.n, e.alive, e.x, e.z);
    w.bufA.fill(-7);
    w.bufB.fill(-7);
    const procs = (w as unknown as { itemProcs(x: number, z: number, d: number): void }).itemProcs.bind(w);
    for (let k = 0; k < 20; k++) procs(9, 9, 5);
    expect(w.procDealt).toBeGreaterThan(0);
    expect(w.bufA.every((v) => v === -7)).toBe(true);
    expect(w.bufB.every((v) => v === -7)).toBe(true);
  });
});
