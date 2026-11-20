import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data/items';
import { applyRun, buySilver, MIN_ENABLED, poolIds, runPool, silverFor, togglePool, TOGGLER_PRICE, unlockedItemIds } from '../src/meta/progress';
import { defaultSave, sanitizeSave } from '../src/meta/save';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';

const map = new GameMap();

describe('srebro', () => {
  it('run daje srebro za czas, zabójstwa i zwycięstwo, razy mnożnik srebra', () => {
    const w = new World(map, { seed: 1 });
    const s = w.summary();
    expect(silverFor({ ...s, time: 600, kills: 4000, won: true }, 1)).toBe(10 + 10 + 10);
    expect(silverFor({ ...s, time: 300, kills: 800, won: false }, 1.5)).toBe(Math.floor(7 * 1.5));
    const save = defaultSave();
    const res = applyRun(save, { ...s, time: 600, kills: 4000, won: true });
    expect(res.silver).toBe(30);
    expect(save.silver).toBe(30);
  });

  it('tryb nieskończony nie płaci drugi raz za minuty sprzed zwycięstwa', () => {
    const w = new World(map, { seed: 1 });
    w.time = 600;
    w.won = true;
    const save = defaultSave();
    applyRun(save, w.summary());
    const afterWin = save.silver;
    w.startEndless();
    w.time = 630;
    applyRun(save, { ...w.summary(), endless: true });
    expect(save.silver - afterWin).toBe(0);
  });

  it('Srebrna skrzynka z Chaty podnosi mnożnik srebra', () => {
    const w = new World(map, { seed: 1, shop: { srebrnik: 2 } });
    expect(w.stats.silverGain).toBeCloseTo(1.3);
    expect(w.summary().silverGain).toBeCloseTo(1.3);
  });
});

describe('Skarbiec', () => {
  it('skarb ze Skarbca trzeba najpierw odblokować osiągnięciem, potem kupić za srebro', () => {
    const save = defaultSave();
    save.silver = 100;
    const pool = unlockedItemIds(save);
    for (const it of ITEMS) expect(pool.includes(it.id), it.id).toBe(!it.silver);
    expect(buySilver(save, 'item:kosa')).toBe(false);
    save.achievements.push('itemKosa');
    expect(buySilver(save, 'item:kosa')).toBe(true);
    expect(save.silver).toBe(60);
    expect(unlockedItemIds(save)).toContain('kosa');
    expect(buySilver(save, 'item:kosa')).toBe(false);
  });

  it('bez srebra nic się nie kupi', () => {
    const save = defaultSave();
    save.achievements.push('itemLustro');
    expect(buySilver(save, 'item:lustro')).toBe(false);
    expect(buySilver(save, 'toggler')).toBe(false);
  });
});

describe('Rózga wróżbity', () => {
  it('wyłącza rzeczy z puli, ale tylko z rózgą i nie poniżej minimum', () => {
    const save = defaultSave();
    expect(togglePool(save, 'b', 'dzik')).toBe(false);
    expect(togglePool(save, 'b', 'pas')).toBe(false);
    save.silver = TOGGLER_PRICE;
    expect(buySilver(save, 'toggler')).toBe(true);
    expect(togglePool(save, 'b', 'pas')).toBe(true);
    expect(runPool(save, 'b')).not.toContain('pas');
    expect(togglePool(save, 'b', 'pas')).toBe(true);
    expect(runPool(save, 'b')).toContain('pas');
    // Do minimum, dalej nie.
    const ids = poolIds(save, 'b');
    let off = 0;
    for (const id of ids) if (togglePool(save, 'b', id)) off++;
    expect(runPool(save, 'b').length).toBe(MIN_ENABLED.b);
    expect(off).toBe(ids.length - MIN_ENABLED.b);
  });

  it('zapis odczytuje srebro, zakupy i wyłączenia, a śmieci odrzuca', () => {
    const s = sanitizeSave({ silver: 12.7, bought: ['toggler', 5], disabled: ['b:pas', null] });
    expect(s.silver).toBe(12);
    expect(s.bought).toEqual(['toggler']);
    expect(s.disabled).toEqual(['b:pas']);
    expect(sanitizeSave({}).silver).toBe(0);
  });
});
