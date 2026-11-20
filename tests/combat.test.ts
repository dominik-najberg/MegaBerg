import { describe, expect, it } from 'vitest';
import { CHARACTER_BY_ID } from '../src/data/characters';
import { PASSIVE_BY_ID } from '../src/data/passives';
import { SHOP } from '../src/data/shop';
import { BLESSINGS } from '../src/data/blessings';
import { BASE_STATS, type CharacterDef, type PassiveDef } from '../src/data/types';
import { enemyDamageMul, enemyHpMul, phaseAt, RUN_LENGTH, WAVE_EVENTS, WAVES, xpForLevel } from '../src/data/waves';
import { ENEMY_INDEX } from '../src/data/enemies';
import { computeStats, critChance, damageAfterArmor, weaponDamage } from '../src/sim/stats';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';

describe('obrażenia', () => {
  it('mnoży bazę przez bonus broni, statystykę obrażeń i trafienie krytyczne', () => {
    expect(weaponDamage(10, 0, 1, false)).toBe(10);
    expect(weaponDamage(10, 0.3, 1.5, false)).toBeCloseTo(19.5);
    expect(weaponDamage(10, 0.3, 1.5, true)).toBeCloseTo(39);
  });

  it('pancerz odejmuje stałą wartość, ale cios zawsze zadaje co najmniej 1', () => {
    expect(damageAfterArmor(12, 3)).toBe(9);
    expect(damageAfterArmor(2, 5)).toBe(1);
    expect(damageAfterArmor(10, 0)).toBe(10);
  });

  it('szansa na krytyk rośnie ze szczęściem i ma górny limit', () => {
    expect(critChance(0)).toBeCloseTo(0.05);
    expect(critChance(1)).toBeCloseTo(0.15);
    expect(critChance(100)).toBe(0.6);
    expect(critChance(-5)).toBe(0);
  });

  it('trafienie zabija wroga, liczy zabójstwo i zostawia bursztyn', () => {
    const w = new World(new GameMap(), { seed: 5 });
    w.spawner.disabled = true;
    const i = w.spawnEnemy(ENEMY_INDEX.chochlik as number, 3, 3);
    const hp = w.enemies.hp[i] as number;
    w.crit = 0;
    w.damageEnemy(i, hp - 1, 0, 1, 0, 0, null);
    expect(w.enemies.alive[i]).toBe(1);
    expect(w.kills).toBe(0);
    w.damageEnemy(i, 5, 0, 1, 0, 0, null);
    expect(w.enemies.alive[i]).toBe(0);
    expect(w.kills).toBe(1);
    expect(w.gems.list.count).toBe(1);
    expect(w.weapons[0]?.dealt).toBeCloseTo(hp + 4);
  });

  it('gracz traci zdrowie z uwzględnieniem pancerza i ma chwilę nietykalności', () => {
    const w = new World(new GameMap(), { seed: 5 });
    w.stats.armor = 2;
    const before = w.player.hp;
    w.hurtPlayer(10);
    expect(w.player.hp).toBe(before - 8);
    w.hurtPlayer(10);
    expect(w.player.hp).toBe(before - 8);
    w.player.invuln = 0;
    w.hurtPlayer(1000);
    expect(w.dead).toBe(true);
    expect(w.player.hp).toBe(0);
  });

  it('żywa woda wskrzesza raz', () => {
    const w = new World(new GameMap(), { seed: 5, shop: { odrodzenie: 1 } });
    expect(w.revivesLeft).toBe(1);
    w.hurtPlayer(1000);
    expect(w.dead).toBe(false);
    expect(w.player.hp).toBe(w.stats.maxHp * 0.5);
    w.player.invuln = 0;
    w.hurtPlayer(1000);
    expect(w.dead).toBe(true);
  });
});

describe('statystyki', () => {
  it('sumuje bonusy postaci, sklepu, pasywek i błogosławieństw', () => {
    const wojmir = CHARACTER_BY_ID.wojmir as CharacterDef;
    const pas = PASSIVE_BY_ID.pas as PassiveDef;
    const s = computeStats(wojmir, { sila: 2, zdrowie: 1 }, [{ def: pas, level: 2, power: 2.3 }], [BLESSINGS[0]!]);
    // 1 + 0.10 (postać) + 2*0.06 (Kuźnia) + 0.1*2.3 (pas) + 0.15 (Perun)
    expect(s.damage).toBeCloseTo(1.6);
    expect(s.maxHp).toBe(112);
    expect(s.moveSpeed).toBeCloseTo(1.05);
  });

  it('bez niczego zwraca statystyki bazowe', () => {
    expect(computeStats(null, {}, [], [])).toEqual(BASE_STATS);
  });

  it('ogranicza skrajne wartości (odnowienie, szybkość, zdrowie)', () => {
    const krzesiwo = PASSIVE_BY_ID.krzesiwo as PassiveDef;
    const s = computeStats(null, {}, [{ def: krzesiwo, level: 5, power: 50 }], []);
    expect(s.cooldown).toBe(0.35);
    const low = computeStats({ ...(CHARACTER_BY_ID.wojmir as CharacterDef), mods: [{ stat: 'maxHp', add: -500 }] }, {}, [], []);
    expect(low.maxHp).toBe(20);
  });

  it('poziomy sklepu ponad maksimum nie dają dodatkowego bonusu', () => {
    const item = SHOP.find((x) => x.id === 'pancerz')!;
    const s = computeStats(null, { pancerz: 99 }, [], []);
    expect(s.armor).toBe(item.perLevel * item.maxLevel);
  });
});

describe('skalowanie', () => {
  it('zdrowie i obrażenia wrogów rosną monotonicznie z czasem', () => {
    expect(enemyHpMul(0)).toBe(1);
    expect(enemyDamageMul(0)).toBe(1);
    let hp = 0;
    let dmg = 0;
    for (let t = 0; t <= RUN_LENGTH; t += 30) {
      expect(enemyHpMul(t)).toBeGreaterThan(hp);
      expect(enemyDamageMul(t)).toBeGreaterThan(dmg);
      hp = enemyHpMul(t);
      dmg = enemyDamageMul(t);
    }
    expect(enemyHpMul(RUN_LENGTH)).toBeGreaterThan(8);
    expect(enemyDamageMul(RUN_LENGTH)).toBeCloseTo(2.3);
  });

  it('każdy kolejny poziom wymaga więcej doświadczenia', () => {
    for (let l = 1; l < 60; l++) expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    expect(xpForLevel(1)).toBeLessThan(12);
  });

  it('fazy fal są posortowane, a gęstość rośnie do bossa', () => {
    for (let i = 1; i < WAVES.length; i++) expect(WAVES[i]!.from).toBeGreaterThan(WAVES[i - 1]!.from);
    expect(phaseAt(0).phase).toBe(WAVES[0]);
    expect(phaseAt(100).phase.from).toBe(90);
    expect(phaseAt(100).progress).toBeGreaterThan(0);
    expect(phaseAt(100).progress).toBeLessThan(1);
    const before = phaseAt(RUN_LENGTH - 1).phase;
    expect(before.alive[1]).toBeGreaterThanOrEqual(300);
  });

  it('każde zdarzenie fali wskazuje istniejącego wroga, a boss przychodzi w 10. minucie', () => {
    for (const ev of WAVE_EVENTS) expect(ENEMY_INDEX[ev.enemy]).toBeDefined();
    for (const p of WAVES) for (const id of Object.keys(p.mix)) expect(ENEMY_INDEX[id]).toBeDefined();
    const boss = WAVE_EVENTS.find((e) => e.kind === 'boss');
    expect(boss?.at).toBe(600);
    expect(WAVE_EVENTS.filter((e) => e.kind === 'mini').length).toBeGreaterThanOrEqual(2);
  });

  it('elita ma wielokrotnie więcej zdrowia niż zwykły wróg', () => {
    const w = new World(new GameMap(), { seed: 2 });
    const a = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 5, 5, false);
    const b = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 8, 8, true);
    expect(w.enemies.maxHp[b]).toBeCloseTo((w.enemies.maxHp[a] as number) * 8);
    expect(w.enemies.elite[b]).toBe(1);
  });
});
