import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { CHARACTERS } from '../src/data/characters';
import { SHOP_BY_ID, shopCost } from '../src/data/shop';
import { WEAPONS } from '../src/data/weapons';
import { PASSIVES } from '../src/data/passives';
import { applyRun, buyShopItem, isUnlocked, unlockedCharacterIds, unlockedWeaponIds } from '../src/meta/progress';
import { defaultSave, sanitizeSave, SAVE_KEY, SaveStore, type KeyValueStore } from '../src/meta/save';
import type { RunSummary } from '../src/sim/world';

class MemoryStore implements KeyValueStore {
  readonly map = new Map<string, string>();
  getItem(k: string): string | null {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v);
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
}

const brokenStore: KeyValueStore = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

const run = (over: Partial<RunSummary> = {}): RunSummary => ({
  character: 'wojmir',
  time: 120,
  kills: 200,
  level: 8,
  gold: 40,
  goldCollected: 55,
  won: false,
  evolved: 0,
  shrines: 0,
  damageTaken: 100,
  killsByEnemy: { chochlik: 200 },
  weapons: [],
  burnDealt: 0,
  ...over,
});

describe('zapis i odczyt', () => {
  it('zapisuje i wczytuje ten sam stan', () => {
    const mem = new MemoryStore();
    const a = new SaveStore(mem);
    a.data.gold = 321;
    a.data.shop.sila = 2;
    a.data.achievements.push('survive3');
    a.data.options.music = 0.25;
    a.data.options.damageNumbers = false;
    expect(a.save()).toBe(true);
    const b = new SaveStore(mem);
    expect(b.data).toEqual(a.data);
    expect(b.healthy).toBe(true);
  });

  it('pusty magazyn daje stan domyślny', () => {
    expect(new SaveStore(new MemoryStore()).data).toEqual(defaultSave());
    expect(new SaveStore(null).data).toEqual(defaultSave());
  });

  it('uszkodzony JSON nie wywraca gry', () => {
    const mem = new MemoryStore();
    mem.setItem(SAVE_KEY, '{to nie jest json');
    const s = new SaveStore(mem);
    expect(s.data).toEqual(defaultSave());
    expect(s.healthy).toBe(false);
  });

  it('magazyn rzucający wyjątki jest obsłużony przy odczycie, zapisie i resecie', () => {
    const s = new SaveStore(brokenStore);
    expect(s.data).toEqual(defaultSave());
    expect(s.save()).toBe(false);
    expect(s.healthy).toBe(false);
    expect(() => s.reset()).not.toThrow();
  });

  it('odrzuca błędne typy i wartości spoza zakresu', () => {
    const d = sanitizeSave({
      gold: -50,
      shop: { sila: 'dużo', zdrowie: 3.9, x: -2 },
      achievements: ['survive3', 42, null],
      stats: { kills: 'NaN', runs: 3 },
      options: { master: 7, quality: 9, sensitivity: -1, damageNumbers: 'tak' },
      character: 'nieistniejacy',
    });
    expect(d.gold).toBe(0);
    expect(d.shop).toEqual({ zdrowie: 3 });
    expect(d.achievements).toEqual(['survive3']);
    expect(d.stats.kills).toBe(0);
    expect(d.stats.runs).toBe(3);
    expect(d.options.master).toBe(1);
    expect(d.options.quality).toBe(2);
    expect(d.options.sensitivity).toBe(0.2);
    expect(d.options.damageNumbers).toBe(true);
    expect(d.character).toBe('wojmir');
    expect(sanitizeSave(null)).toEqual(defaultSave());
    expect(sanitizeSave('tekst')).toEqual(defaultSave());
  });

  it('reset czyści postęp, ale zostawia opcje', () => {
    const mem = new MemoryStore();
    const s = new SaveStore(mem);
    s.data.gold = 999;
    s.data.achievements.push('leszy');
    s.data.options.quality = 0;
    s.save();
    s.reset();
    expect(s.data.gold).toBe(0);
    expect(s.data.achievements).toEqual([]);
    expect(s.data.options.quality).toBe(0);
    expect(new SaveStore(mem).data.gold).toBe(0);
  });
});

describe('meta-progresja', () => {
  it('run dopisuje złoto, sumy i rekordy', () => {
    const save = defaultSave();
    const res = applyRun(save, run());
    expect(res.goldBanked).toBe(40);
    expect(save.gold).toBe(40);
    expect(save.stats).toMatchObject({ runs: 1, wins: 0, kills: 200, gold: 55, bestTime: 120, bestLevel: 8 });
    applyRun(save, run({ time: 60, level: 3 }));
    expect(save.stats.bestTime).toBe(120);
    expect(save.stats.runs).toBe(2);
  });

  it('odblokowuje osiągnięcia tylko raz i wypłaca nagrody w złocie', () => {
    const save = defaultSave();
    const first = applyRun(save, run({ time: 310, killsByEnemy: { poludnica: 1 } }));
    const ids = first.unlocked.map((a) => a.id);
    expect(ids).toContain('survive3');
    expect(ids).toContain('survive5');
    expect(ids).toContain('poludnica');
    expect(first.goldBonus).toBe(150);
    expect(save.gold).toBe(40 + 150);
    const second = applyRun(save, run({ time: 310, killsByEnemy: { poludnica: 1 } }));
    expect(second.unlocked).toHaveLength(0);
    expect(second.goldBonus).toBe(0);
  });

  it('osiągnięcia odblokowują postacie, bronie i pasywki', () => {
    const save = defaultSave();
    expect(unlockedCharacterIds(save)).toEqual(['wojmir']);
    expect(unlockedWeaponIds(save)).not.toContain('kruki');
    applyRun(save, run({ time: 301, killsByEnemy: { jaga: 1 } }));
    expect(unlockedCharacterIds(save)).toEqual(expect.arrayContaining(['wojmir', 'dobroslawa', 'jagna']));
    expect(unlockedWeaponIds(save)).toContain('kruki');
    expect(unlockedWeaponIds(save)).toContain('marzanna');
    expect(isUnlocked(save, undefined)).toBe(true);
    expect(isUnlocked(save, 'leszy')).toBe(false);
  });

  it('zwycięstwo zalicza osiągnięcia czasowe i „Władcę boru”', () => {
    const save = defaultSave();
    const res = applyRun(save, run({ won: true, time: 640, character: 'dobroslawa', killsByEnemy: { leszy: 1 } }));
    const ids = res.unlocked.map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['leszy', 'winDobroslawa', 'survive5']));
    expect(ids).not.toContain('winBogumil');
    expect(save.stats.wins).toBe(1);
  });

  it('łączne zabójstwa liczą się między runami', () => {
    const save = defaultSave();
    for (let i = 0; i < 3; i++) applyRun(save, run({ kills: 333 }));
    expect(save.achievements).not.toContain('kills1000');
    applyRun(save, run({ kills: 1 }));
    expect(save.achievements).toContain('kills1000');
  });

  it('sklep pobiera rosnącą cenę i nie przekracza maksymalnego poziomu', () => {
    const save = defaultSave();
    const item = SHOP_BY_ID.pancerz!;
    expect(buyShopItem(save, 'pancerz')).toBe(false);
    save.gold = 10000;
    let spent = 0;
    for (let l = 0; l < item.maxLevel; l++) {
      spent += shopCost(item, l);
      expect(buyShopItem(save, 'pancerz')).toBe(true);
    }
    expect(save.shop.pancerz).toBe(item.maxLevel);
    expect(save.gold).toBe(10000 - spent);
    expect(buyShopItem(save, 'pancerz')).toBe(false);
    expect(buyShopItem(save, 'nie-ma-takiego')).toBe(false);
    expect(shopCost(item, 1)).toBeGreaterThan(shopCost(item, 0));
  });

  it('każde wymaganie odblokowania wskazuje istniejące osiągnięcie', () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
    for (const x of [...CHARACTERS, ...WEAPONS, ...PASSIVES]) {
      if (x.unlock) expect(ids.has(x.unlock)).toBe(true);
    }
    expect(CHARACTERS.filter((c) => !c.unlock)).toHaveLength(1);
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(3);
  });
});
