import { describe, expect, it } from 'vitest';
import { CIRCLE_BOONS, GREED_CURSE } from '../src/data/blessings';
import { ENEMIES, ENEMY_INDEX } from '../src/data/enemies';
import { enemyHpMul, finalWaveMul, FINAL_WAVE_MUL, FINAL_WAVE_STEP, RUN_LENGTH, SURGE_EVERY, SURGE_LENGTH, surgeAt } from '../src/data/waves';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { Bot } from '../src/debug/bot';
import { CIRCLE_CHARGE, CIRCLE_RADIUS, PORTAL_HOLD, World, type Card } from '../src/sim/world';

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

describe('portal Leszego i fala końcowa', () => {
  it('o 8:00 otwiera się portal zamiast bossa; przytrzymanie E przy portalu wzywa Leszego', () => {
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
    w.time = RUN_LENGTH + FINAL_WAVE_STEP * 2 + 5;
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

  it('fala końcowa zaczyna się z końcem rundy i wzmacnia wrogów co 20 s, dopóki boss nie zostanie wezwany', () => {
    expect(finalWaveMul(RUN_LENGTH - 1)).toBe(1);
    expect(finalWaveMul(RUN_LENGTH)).toBeCloseTo(FINAL_WAVE_MUL);
    expect(finalWaveMul(RUN_LENGTH + FINAL_WAVE_STEP * 2 + 1)).toBeCloseTo(FINAL_WAVE_MUL ** 3);
    // Po trzech minutach fali końcowej wrogowie są wielokrotnie groźniejsi.
    expect(finalWaveMul(RUN_LENGTH + 180)).toBeGreaterThan(7);
    const w = quiet();
    w.time = RUN_LENGTH + FINAL_WAVE_STEP + 5;
    w.step(DT, input());
    const hard = w.hpMul;
    w.bossSummoned = true;
    w.step(DT, input());
    expect(hard / w.hpMul).toBeCloseTo(FINAL_WAVE_MUL ** 2, 1);
  });
});

describe('fale co 2,5 minuty', () => {
  it('runda trwa 8 minut, a fala trwa 30 s co 2,5 minuty', () => {
    expect(RUN_LENGTH).toBe(480);
    expect(SURGE_EVERY).toBe(150);
    expect(SURGE_LENGTH).toBe(30);
    expect(surgeAt(0)).toBe(0);
    expect(surgeAt(149)).toBe(0);
    expect(surgeAt(150)).toBe(1);
    expect(surgeAt(179)).toBe(1);
    expect(surgeAt(180)).toBe(0);
    expect(surgeAt(310)).toBe(2);
    expect(surgeAt(460)).toBe(3);
    expect(surgeAt(RUN_LENGTH)).toBe(0);
  });

  it('w czasie fali wrogów jest wyraźnie więcej niż tuż przed nią', () => {
    const run = (until: number): number => {
      const w = new World(map, { seed: 6 });
      w.bonuses.disabled = true;
      w.spawner.disabled = true;
      w.time = 290;
      w.spawner.disabled = false;
      // Bohater nie walczy: liczy się sama gęstość, do której dąży spawner.
      w.weapons.length = 0;
      while (w.time < until) {
        w.player.invuln = 99;
        if (w.choice) w.choose(0);
        w.step(DT, input());
      }
      return w.enemies.count;
    };
    const calm = run(299.5);
    const surge = run(329.5);
    expect(surge).toBeGreaterThan(calm * 1.3);
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

describe('bot i nowe mechaniki (etap 8)', () => {
  const offer = (w: World, cards: Card[]): void => {
    w.choice = { type: 'levelup', cards };
  };
  const junk = (id: string): Card => ({ kind: 'passive', id, rarity: 'common', isNew: true, level: 1, name: id, text: '', icon: '', color: 0 });
  const gold: Card = { kind: 'gold', id: 'zloto', rarity: 'common', isNew: false, level: 30, name: '', text: '', icon: '', color: 0 };

  it('wygania księgę, której nie chce', () => {
    const w = quiet();
    w.gold = 200;
    const bot = new Bot('good');
    offer(w, [junk('dzik'), gold, gold]);
    bot.choose(w);
    expect(w.banished.has('dzik')).toBe(true);
    expect(bot.tally.banishes).toBe(1);
    expect(w.gold).toBeLessThan(200);
  });

  it('słabą ofertę przelosowuje za złoto, najwyżej dwa razy', () => {
    const w = quiet();
    w.gold = 200;
    const bot = new Bot('good');
    offer(w, [gold, gold, gold]);
    (bot as unknown as { score: () => number }).score = () => 1;
    bot.choose(w);
    expect(bot.tally.paidRerolls).toBe(2);
    expect(w.paidRerolls).toBe(2);
    expect(w.gold).toBeLessThan(200);
  });

  it('bez zapasu złota nie przelosowuje i nie wygania', () => {
    const w = quiet();
    w.gold = 0;
    const bot = new Bot('good');
    offer(w, [junk('dzik'), gold, gold]);
    expect(bot.choose(w)).toBe(0);
    expect(bot.tally).toEqual({ rerolls: 0, paidRerolls: 0, banishes: 0, circles: 0 });
    expect(w.banished.size).toBe(0);
  });

  it('nie wygania księgi, z którą posiadana broń może ewoluować', () => {
    const w = quiet();
    w.gold = 500;
    const bot = new Bot('good');
    // Sierpy evolve with Księga Siłacza; a weak card of it must stay in the pool.
    offer(w, [{ ...junk('pas'), rarity: 'common' }, gold, gold]);
    (bot as unknown as { score: () => number }).score = () => 1;
    bot.choose(w);
    expect(w.banished.has('pas')).toBe(false);
  });

  it('staje w świętym kręgu i trzyma się go, aż się naładuje, choć obok jest wróg', () => {
    const w = quiet();
    const s = w.shrines.find((x) => x.kind === 'circle')!;
    standAt(w, s.x + 2, s.z);
    w.player.invuln = 99;
    w.spawnEnemy(ENEMY_INDEX.chochlik as number, s.x + 3.5, s.z);
    const bot = new Bot('good');
    let maxD = 0;
    for (let t = 0; t < (CIRCLE_CHARGE + 2) / DT && !w.choice; t++) {
      w.step(DT, bot.update(w, DT));
      w.player.invuln = 99;
      maxD = Math.max(maxD, Math.hypot(w.player.x - s.x, w.player.z - s.z));
    }
    expect(maxD).toBeLessThan(CIRCLE_RADIUS);
    expect(w.choice?.type === 'shrine' && w.choice.circle).toBe(true);
    bot.choose(w);
    expect(bot.tally.circles).toBe(1);
  });
});
