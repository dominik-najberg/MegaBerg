import { describe, expect, it } from 'vitest';
import { BLESSINGS } from '../src/data/blessings';
import { CHARACTER_BY_ID } from '../src/data/characters';
import { ENEMY_INDEX } from '../src/data/enemies';
import { PASSIVE_BY_ID } from '../src/data/passives';
import { BASE_STATS, type CharacterDef, type PassiveDef } from '../src/data/types';
import { enemyDamageMul, enemyHpMul } from '../src/data/waves';
import {
  absorbShield,
  attackInterval,
  computeStats,
  critCount,
  critMultiplier,
  curseEffects,
  dodgeChance,
  lifestealHeal,
  SHIELD_DELAY,
} from '../src/sim/stats';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { Ev } from '../src/sim/events';
import { World } from '../src/sim/world';

const map = new GameMap();
const noInput: InputState = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };

describe('nowe statystyki: wartości bazowe', () => {
  it('kryt 5% za ×2, reszta neutralna', () => {
    expect(BASE_STATS.critChance).toBe(0.05);
    expect(BASE_STATS.critDamage).toBe(2);
    expect(BASE_STATS.attackSpeed).toBe(1);
    expect(BASE_STATS.duration).toBe(1);
    expect(BASE_STATS.projectileSpeed).toBe(1);
    expect(BASE_STATS.knockback).toBe(1);
    expect(BASE_STATS.lifesteal).toBe(0);
    expect(BASE_STATS.thorns).toBe(0);
    expect(BASE_STATS.evasion).toBe(0);
    expect(BASE_STATS.shield).toBe(0);
    expect(BASE_STATS.curse).toBe(0);
    expect(BASE_STATS.silverGain).toBe(1);
  });

  it('szczęście nie podnosi już szansy na krytyk', () => {
    const s = computeStats(null, { szczescie: 5 }, [], []);
    expect(s.luck).toBeCloseTo(0.3);
    expect(s.critChance).toBeCloseTo(0.05);
  });

  it('Jagna i Weles dają kryt wprost; Księga Welesa to czyste szczęście', () => {
    const jagna = computeStats(CHARACTER_BY_ID.jagna as CharacterDef, {}, [], []);
    // Etap 1: dawne 0,05 + 0,2 × 0,1; etap 2 podniósł jej premię do +12% (balans botem).
    expect(jagna.critChance).toBeCloseTo(0.17);
    const podkowa = PASSIVE_BY_ID.podkowa as PassiveDef;
    const withBook = computeStats(null, {}, [{ def: podkowa, level: 5, power: 5 }], []);
    expect(withBook.luck).toBeCloseTo(podkowa.perLevel * 5);
    expect(withBook.critChance).toBeCloseTo(0.05);
    const weles = BLESSINGS.find((b) => b.id === 'weles')!;
    expect(computeStats(null, {}, [], [weles]).critChance).toBeCloseTo(0.075);
  });
});

describe('formuły', () => {
  it('szybkość ataku dzieli odstęp między atakami, odnowienie go mnoży', () => {
    expect(attackInterval({ cooldown: 1, attackSpeed: 1 })).toBe(1);
    expect(attackInterval({ cooldown: 0.8, attackSpeed: 1 })).toBeCloseTo(0.8);
    expect(attackInterval({ cooldown: 1, attackSpeed: 2 })).toBeCloseTo(0.5);
    expect(attackInterval({ cooldown: 0.8, attackSpeed: 1.25 })).toBeCloseTo(0.64);
  });

  it('szybkość ataku ma granice jak odnowienie', () => {
    expect(computeStats(null, {}, [], [{ id: 'x', god: '', name: '', desc: '', icon: '', color: 0, mods: [{ stat: 'attackSpeed', add: 50 }] }]).attackSpeed).toBe(5);
    expect(computeStats(null, {}, [], [{ id: 'x', god: '', name: '', desc: '', icon: '', color: 0, mods: [{ stat: 'attackSpeed', add: -5 }] }]).attackSpeed).toBe(0.25);
  });

  it('krytyk: jeden rzut, część całkowita zawsze, ułamek jako szansa (overcrit)', () => {
    expect(critCount(0.05, 0.04)).toBe(1);
    expect(critCount(0.05, 0.06)).toBe(0);
    expect(critCount(1, 0.99)).toBe(1);
    expect(critCount(1.3, 0.2)).toBe(2);
    expect(critCount(1.3, 0.5)).toBe(1);
    expect(critCount(0, 0)).toBe(0);
  });

  it('mnożnik krytyka: ×critDamage, overcrit dokłada premię jeszcze raz', () => {
    expect(critMultiplier(0, 2)).toBe(1);
    expect(critMultiplier(1, 2)).toBe(2);
    expect(critMultiplier(2, 2)).toBe(3);
    expect(critMultiplier(1, 2.5)).toBe(2.5);
    expect(critMultiplier(2, 2.5)).toBe(4);
  });

  it('unik ma malejące zwroty i nigdy nie daje 100%', () => {
    expect(dodgeChance(0)).toBe(0);
    expect(dodgeChance(0.1)).toBeCloseTo(0.0909, 3);
    expect(dodgeChance(1)).toBeCloseTo(0.5);
    expect(dodgeChance(3)).toBeCloseTo(0.75);
    expect(dodgeChance(1000)).toBeLessThan(1);
  });

  it('kradzież życia: poniżej 100% to szansa na 1 HP, powyżej pewne 1 HP i szansa na drugie', () => {
    expect(lifestealHeal(0.3, 0.1)).toBe(1);
    expect(lifestealHeal(0.3, 0.5)).toBe(0);
    expect(lifestealHeal(1, 0.99)).toBe(1);
    expect(lifestealHeal(1.4, 0.3)).toBe(2);
    expect(lifestealHeal(1.4, 0.6)).toBe(1);
  });

  it('tarcza bierze cios przed zdrowiem', () => {
    expect(absorbShield(10, 4)).toEqual({ shield: 6, through: 0 });
    expect(absorbShield(10, 14)).toEqual({ shield: 0, through: 4 });
    expect(absorbShield(0, 5)).toEqual({ shield: 0, through: 5 });
  });

  it('klątwa: przy 0 nic nie zmienia, przy 1 podwaja zdrowie, liczbę wrogów i nagrody', () => {
    expect(curseEffects(0)).toEqual({ enemyHp: 1, enemyDamage: 1, enemySpeed: 1, enemyCount: 1, reward: 1 });
    const c = curseEffects(1);
    expect(c.enemyHp).toBe(2);
    expect(c.enemyCount).toBe(2);
    expect(c.reward).toBe(2);
    expect(c.enemyDamage).toBe(1.5);
    expect(c.enemySpeed).toBe(1.25);
    expect(curseEffects(-1)).toEqual(curseEffects(0));
  });
});

describe('staty w świecie gry', () => {
  function world(): World {
    const w = new World(map, { seed: 7 });
    w.spawner.disabled = true;
    return w;
  }

  it('unik pomija cios, ale daje nietykalność', () => {
    const w = world();
    w.stats.evasion = 1e9;
    const hp = w.player.hp;
    w.hurtPlayer(30);
    expect(w.player.hp).toBe(hp);
    expect(w.dodges).toBe(1);
    expect(w.player.invuln).toBeGreaterThan(0);
  });

  it('tarcza przyjmuje cios po pancerzu, a odnawia się po chwili bez obrażeń', () => {
    const w = world();
    w.stats.shield = 20;
    w.shield = 20;
    w.stats.armor = 2;
    const hp = w.player.hp;
    w.hurtPlayer(12);
    expect(w.shield).toBe(10);
    expect(w.player.hp).toBe(hp);
    w.player.invuln = 0;
    w.hurtPlayer(17);
    expect(w.shield).toBe(0);
    expect(w.player.hp).toBe(hp - 5);
    // Przed SHIELD_DELAY tarcza stoi.
    for (let t = 0; t < (SHIELD_DELAY - 0.5) * 60; t++) w.step(1 / 60, noInput);
    expect(w.shield).toBe(0);
    for (let t = 0; t < 3 * 60; t++) w.step(1 / 60, noInput);
    expect(w.shield).toBeCloseTo(20);
  });

  it('kradzież życia leczy przy trafieniu bronią', () => {
    const w = world();
    w.stats.lifesteal = 2;
    w.stats.critChance = 0;
    w.player.hp = 50;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 3, 3);
    w.damageEnemy(i, 1, 0, 1, 0, 0, null);
    expect(w.player.hp).toBe(52);
    expect(w.lifestealHealed).toBe(2);
    // Obrażenia bez broni (podpalenie, otoczenie) nie leczą.
    w.damageEnemy(i, 1, -1, 1, 0, 0, null);
    expect(w.player.hp).toBe(52);
  });

  it('ciernie ranią wroga, który uderzył wręcz', () => {
    const w = world();
    w.stats.thorns = 5;
    w.stats.damage = 2;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 1, 1);
    const hp = w.enemies.hp[i] as number;
    w.hurtPlayer(3, i);
    expect(w.enemies.hp[i]).toBeCloseTo(hp - 10);
    expect(w.thornsDealt).toBeCloseTo(10);
    expect(w.burnDealt).toBe(0);
  });

  it('krytyk używa szansy i mnożnika z nowych statów', () => {
    const w = world();
    w.stats.critChance = 2;
    w.stats.critDamage = 3;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 3, 3);
    const hp = w.enemies.hp[i] as number;
    w.damageEnemy(i, 1, 0, 1, 0, 0, null);
    // Dwa krytyki: 1 + (3 - 1) × 2 = 5.
    expect(w.enemies.hp[i]).toBeCloseTo(hp - 5);
  });

  it('klątwa wzmacnia wrogów i nagrody', () => {
    const w = world();
    w.stats.curse = 0.5;
    w.step(1 / 60, noInput);
    expect(w.hpMul).toBeCloseTo(enemyHpMul(w.time) * 1.5);
    expect(w.dmgMul).toBeCloseTo(enemyDamageMul(w.time) * 1.25);
    const gold = w.gold;
    w.addGold(10);
    expect(w.gold - gold).toBeCloseTo(15 * w.stats.goldGain);
  });

  it('ciernie zabijające Leszego dają wygraną, a śmiertelny cios już nie wchodzi', () => {
    const w = world();
    w.stats.thorns = 5;
    const i = w.spawnEnemy(ENEMY_INDEX.leszy as number, 2, 2);
    w.enemies.hp[i] = 1;
    w.player.hp = 1;
    w.hurtPlayer(50, i);
    expect(w.won).toBe(true);
    expect(w.dead).toBe(false);
    expect(w.player.hp).toBe(1);
  });

  it('przy dużej szybkości ataku ciupaga nadal robi drugi zamach', () => {
    const w = new World(map, { seed: 7, character: CHARACTER_BY_ID.bogumil as CharacterDef });
    w.spawner.disabled = true;
    const inst = w.weapons[0]!;
    inst.stats.count = 2;
    w.stats.cooldown = 0.35;
    w.stats.attackSpeed = 5;
    let sweeps = 0;
    const steps = 10 * 60;
    for (let t = 0; t < steps; t++) {
      w.step(1 / 60, noInput);
      for (let k = 0; k < w.events.count; k++) if (w.events.items[k]!.type === Ev.Sweep) sweeps++;
      w.events.clear();
    }
    const cd = Math.max(0.12, inst.stats.cooldown * 0.35 / 5);
    // Każdy atak to dwa zamachy; bez poprawki wychodził jeden.
    expect(sweeps).toBeGreaterThan((10 / cd) * 1.6);
  });
});
