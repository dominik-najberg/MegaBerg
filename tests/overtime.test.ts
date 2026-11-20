import { describe, expect, it } from 'vitest';
import { CIRCLE_BOONS, GREED_CURSE } from '../src/data/blessings';
import { ENEMIES, ENEMY_INDEX } from '../src/data/enemies';
import { enemyHpMul, finalWaveMul, FINAL_WAVE_MUL, OVERTIME, RUN_LENGTH } from '../src/data/waves';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { CIRCLE_CHARGE, PORTAL_HOLD, World } from '../src/sim/world';

const map = new GameMap();
const DT = 1 / 60;
const input = (interact = false): InputState => ({ moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact, camYaw: 0 });
const quiet = (seed = 6): World => {
  const w = new World(map, { seed });
  w.spawner.disabled = true;
  w.bonuses.disabled = true;
  return w;
};
const standAt = (w: World, x: number, z: number): void => {
  w.player.x = x;
  w.player.z = z;
  w.player.y = map.heightAt(x, z);
  w.player.savePrev();
};

describe('portal Leszego i nadgodzina', () => {
  it('o 10:00 otwiera się portal zamiast bossa; przytrzymanie E przy portalu wzywa Leszego', () => {
    const w = new World(map, { seed: 6 });
    w.bonuses.disabled = true;
    w.time = RUN_LENGTH - 0.01;
    w.player.invuln = 99;
    w.step(DT, input());
    expect(w.portal).not.toBeNull();
    // Wcześniejsze zdarzenia fali (mini-bossy) też odpaliły, ale Leszego nie ma.
    const leszy = (): number => {
      let n = 0;
      for (let i = 0; i < w.enemies.n; i++) if (w.enemies.alive[i] && w.enemies.type[i] === ENEMY_INDEX.leszy) n++;
      return n;
    };
    expect(leszy()).toBe(0);
    const po = w.portal!;
    const away = Math.hypot(po.x - w.player.x, po.z - w.player.z);
    expect(away).toBeGreaterThanOrEqual(24);
    expect(away).toBeLessThanOrEqual(41);
    standAt(w, po.x + 1, po.z);
    for (let i = 0; i < (PORTAL_HOLD + 0.2) / DT && !w.bossSummoned; i++) {
      w.player.invuln = 99;
      if (w.choice) w.choose(0);
      w.step(DT, input(true));
    }
    expect(w.bossSummoned).toBe(true);
    expect(po.used).toBe(true);
    expect(leszy()).toBe(1);
  });

  it('Leszy wezwany w fali końcowej nie dostaje jej wzmocnienia', () => {
    const w = new World(map, { seed: 6 });
    w.bonuses.disabled = true;
    w.time = RUN_LENGTH - 0.01;
    w.player.invuln = 99;
    w.step(DT, input());
    w.spawner.disabled = true;
    w.time = RUN_LENGTH + OVERTIME + 45;
    w.step(DT, input());
    expect(w.hpMul).toBeGreaterThan(enemyHpMul(w.time) * 1.5);
    const po = w.portal!;
    standAt(w, po.x + 1, po.z);
    for (let i = 0; i < (PORTAL_HOLD + 0.2) / DT && !w.bossSummoned; i++) {
      w.player.invuln = 99;
      if (w.choice) w.choose(0);
      w.step(DT, input(true));
    }
    let boss = -1;
    for (let i = 0; i < w.enemies.n; i++) if (w.enemies.alive[i] && w.enemies.type[i] === ENEMY_INDEX.leszy) boss = i;
    expect(boss).toBeGreaterThanOrEqual(0);
    const plain = (ENEMIES[ENEMY_INDEX.leszy as number] as { hp: number }).hp * Math.max(1, enemyHpMul(w.time) * 0.42);
    expect(w.enemies.maxHp[boss] as number).toBeCloseTo(plain, -1);
  });

  it('fala końcowa wzmacnia wrogów co 30 s, dopóki boss nie zostanie wezwany', () => {
    expect(finalWaveMul(RUN_LENGTH + OVERTIME - 1)).toBe(1);
    expect(finalWaveMul(RUN_LENGTH + OVERTIME)).toBeCloseTo(FINAL_WAVE_MUL);
    expect(finalWaveMul(RUN_LENGTH + OVERTIME + 61)).toBeCloseTo(FINAL_WAVE_MUL ** 3);
    const w = quiet();
    w.time = RUN_LENGTH + OVERTIME + 40;
    w.step(DT, input());
    const hard = w.hpMul;
    w.bossSummoned = true;
    w.step(DT, input());
    expect(hard / w.hpMul).toBeCloseTo(FINAL_WAVE_MUL ** 2, 1);
  });
});

describe('nowe kapliczki', () => {
  it('są cztery kapliczki bogów, dwa święte kręgi, bursztynowa i ołtarz chciwości', () => {
    const w = quiet();
    const kinds = w.shrines.map((s) => s.kind).sort();
    expect(kinds).toEqual(['amber', 'circle', 'circle', 'god', 'god', 'god', 'god', 'greed']);
  });

  it('święty krąg ładuje się, gdy bohater stoi w środku, i daje wybór 3 różnych darów', () => {
    const w = quiet();
    const s = w.shrines.find((x) => x.kind === 'circle')!;
    standAt(w, s.x + 2, s.z);
    for (let i = 0; i < (CIRCLE_CHARGE - 0.5) / DT; i++) w.step(DT, input());
    expect(w.choice).toBeNull();
    for (let i = 0; i < 1 / DT && !w.choice; i++) w.step(DT, input());
    expect(w.choice?.type).toBe('shrine');
    if (w.choice?.type !== 'shrine') return;
    expect(w.choice.circle).toBe(true);
    expect(new Set(w.choice.options.map((o) => o.id)).size).toBe(3);
    for (const o of w.choice.options) expect(CIRCLE_BOONS).toContain(o);
    // Naładowanego kręgu nie da się zostawić na później.
    w.cancelChoice();
    expect(w.choice).not.toBeNull();
    w.choose(0);
    expect(s.used).toBe(true);
  });

  it('kapliczka bursztynowa przyciąga wszystkie bursztyny z mapy', () => {
    const w = quiet();
    for (let k = 0; k < 10; k++) w.gems.spawn(50 + k, 0, 50, 1);
    const s = w.shrines.find((x) => x.kind === 'amber')!;
    standAt(w, s.x + 1.5, s.z);
    for (let i = 0; i < 70; i++) w.step(DT, input(true));
    expect(s.used).toBe(true);
    let pulled = 0;
    for (let i = 0; i < w.gems.n; i++) if (w.gems.alive[i] && w.gems.mag[i]) pulled++;
    expect(pulled).toBeGreaterThan(0);
  });

  it('ołtarz chciwości daje złoto i skarb za trwałą klątwę', () => {
    const w = quiet();
    const s = w.shrines.find((x) => x.kind === 'greed')!;
    standAt(w, s.x + 1.5, s.z);
    const gold = w.gold;
    for (let i = 0; i < 70 && !w.choice; i++) w.step(DT, input(true));
    expect(s.used).toBe(true);
    expect(w.blessings).toContain(GREED_CURSE);
    expect(w.stats.curse).toBeCloseTo(0.15);
    expect(w.gold).toBeGreaterThan(gold);
    expect(w.choice?.type).toBe('chest');
    if (w.choice?.type === 'chest') expect(w.choice.cards[0]!.kind).toBe('item');
  });
});

describe('przelosowanie i wygnanie za złoto', () => {
  const levelUp = (w: World): void => {
    w.gainXp(w.xpNeed);
    w.step(DT, input());
  };

  it('po darmowych przelosowaniach kolejne kosztują coraz więcej złota', () => {
    const w = quiet();
    levelUp(w);
    expect(w.choice?.type).toBe('levelup');
    expect(w.reroll()).toBe(false);
    w.gold = 100;
    const c1 = w.rerollCost();
    expect(w.reroll()).toBe(true);
    expect(w.gold).toBe(100 - c1);
    expect(w.rerollCost()).toBeGreaterThan(c1);
  });

  it('wygnana nowa broń lub księga znika z puli do końca runu', () => {
    const w = quiet();
    levelUp(w);
    if (w.choice?.type !== 'levelup') throw new Error('brak wyboru');
    w.gold = 1000;
    const i = w.choice.cards.findIndex((c) => c.isNew && (c.kind === 'weapon' || c.kind === 'passive'));
    expect(i).toBeGreaterThanOrEqual(0);
    const id = w.choice.cards[i]!.id;
    expect(w.banish(i)).toBe(true);
    expect(w.banished.has(id)).toBe(true);
    expect(w.choice.cards.some((c) => c.id === id && c.isNew)).toBe(false);
    for (let k = 0; k < 40; k++) {
      w.gold = 1000;
      w.reroll();
      if (w.choice?.type === 'levelup') for (const c of w.choice.cards) expect(c.isNew && c.id === id).toBe(false);
    }
  });
});
