import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { PASSIVE_BY_ID, PASSIVES } from '../src/data/passives';
import { RARITIES, RARITY_ORDER, rarityWeights, rollRarity } from '../src/data/rarity';
import type { Rarity } from '../src/data/types';
import { WEAPON_BY_ID, weaponMaxLevel, weaponMilestones, WEAPONS, weaponStatsAt } from '../src/data/weapons';
import { ITEM_BY_ID, ITEMS } from '../src/data/items';
import { EVOLVE_LEVEL } from '../src/data/weaponLines';
import { applyCard, canEvolve, chestCards, levelUpCards, rollLines, type Card } from '../src/sim/cards';
import { GameMap } from '../src/sim/terrain';
import { MAX_PASSIVES, MAX_WEAPONS, World } from '../src/sim/world';

const map = new GameMap();
const world = (seed = 1): World => {
  const w = new World(map, { seed, weaponPool: WEAPONS.filter((x) => !x.evolved).map((x) => x.id), passivePool: PASSIVES.map((p) => p.id) });
  w.spawner.disabled = true;
  return w;
};

describe('rzadkość kart', () => {
  it('bez szczęścia wagi są bazowe i zwykłe karty wypadają najczęściej', () => {
    expect(rarityWeights(0)).toEqual(RARITY_ORDER.map((r) => RARITIES[r].weight));
    const rng = new Rng(42);
    const count: Record<Rarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (let i = 0; i < 20000; i++) count[rollRarity(rng, 0)]++;
    expect(count.common).toBeGreaterThan(count.rare);
    expect(count.rare).toBeGreaterThan(count.epic);
    expect(count.epic).toBeGreaterThan(count.legendary);
    expect(count.common / 20000).toBeCloseTo(0.6, 1);
    expect(count.legendary / 20000).toBeCloseTo(0.03, 1);
  });

  it('szczęście przesuwa losowanie w stronę lepszych kart', () => {
    const a = rarityWeights(0);
    const b = rarityWeights(1);
    expect(b[0]).toBe(a[0]);
    expect(b[3]! / b[0]!).toBeGreaterThan(a[3]! / a[0]!);
    const rng1 = new Rng(7);
    const rng2 = new Rng(7);
    let low = 0;
    let high = 0;
    for (let i = 0; i < 5000; i++) {
      if (rollRarity(rng1, 0) !== 'common') low++;
      if (rollRarity(rng2, 2) !== 'common') high++;
    }
    expect(high).toBeGreaterThan(low * 1.5);
  });

  it('ujemne szczęście nie psuje wag', () => {
    expect(rarityWeights(-3)).toEqual(rarityWeights(0));
  });
});

describe('losowanie kart awansu', () => {
  it('daje trzy różne karty', () => {
    for (let seed = 1; seed < 40; seed++) {
      const cards = levelUpCards(world(seed), 3);
      expect(cards).toHaveLength(3);
      expect(new Set(cards.map((c) => `${c.kind}:${c.id}`)).size).toBe(3);
    }
  });

  it('nigdy nie proponuje ewolucji jako zwykłej karty ani zablokowanej broni', () => {
    const w = new World(map, { seed: 3 });
    for (let i = 0; i < 200; i++) {
      for (const c of levelUpCards(w, 3)) {
        if (c.kind !== 'weapon') continue;
        const def = WEAPON_BY_ID[c.id]!;
        expect(def.evolved).toBeFalsy();
        expect(def.unlock).toBeUndefined();
      }
    }
  });

  it('nie proponuje nowych broni ani pasywek po zapełnieniu miejsc', () => {
    const w = world(9);
    for (const id of ['ogien', 'grom', 'ciupaga', 'wianek', 'proca']) w.addWeapon(id);
    expect(w.weapons).toHaveLength(MAX_WEAPONS);
    for (const p of PASSIVES.slice(0, MAX_PASSIVES)) w.passives.push({ def: p, level: 1, power: 1 });
    for (let i = 0; i < 100; i++) {
      for (const c of levelUpCards(w, 3)) {
        if (c.kind === 'weapon' || c.kind === 'passive') expect(c.isNew).toBe(false);
      }
    }
  });

  it('gdy nie ma czego ulepszać, proponuje łupy (złoto, jedzenie)', () => {
    const w = world(4);
    w.weapons.length = 0;
    w.weaponPool.clear();
    w.passivePool.clear();
    const cards = levelUpCards(w, 3);
    expect(cards).toHaveLength(3);
    expect(cards.every((c) => c.kind === 'gold' || c.kind === 'heal')).toBe(true);
    const gold = w.gold;
    applyCard(w, cards.find((c) => c.kind === 'gold') as Card);
    expect(w.gold).toBe(gold + 30);
  });

  it('karta broni podnosi poziom i dodaje wylosowane linie statów', () => {
    const w = world(5);
    const def = WEAPON_BY_ID.sierpy!;
    const lines = [
      { stat: 'damage' as const, value: 0.156 },
      { stat: 'area' as const, value: 0.13 },
    ];
    applyCard(w, { kind: 'weapon', id: 'sierpy', rarity: 'legendary', isNew: false, level: 2, name: '', text: '', icon: '', color: 0, lines });
    const inst = w.findWeapon('sierpy')!;
    expect(inst.level).toBe(2);
    expect(inst.bonus).toBeCloseTo(0.156);
    expect(inst.stats.area).toBeCloseTo(weaponStatsAt(def, 2).area * 1.13);
    expect(inst.stats.count).toBe(weaponStatsAt(def, 2).count);
    for (let i = 0; i < 30; i++) applyCard(w, { kind: 'weapon', id: 'sierpy', rarity: 'common', isNew: false, level: 0, name: '', text: '', icon: '', color: 0 });
    expect(inst.level).toBe(weaponMaxLevel(def));
    expect(weaponMaxLevel(def)).toBe(15);
  });

  it('linie na karcie są różne, ich liczba zależy od rzadkości, a nowa broń ma jedną mniej', () => {
    const w = world(5);
    for (const [rarity, n] of [['common', 1], ['rare', 2], ['epic', 3], ['legendary', 3]] as const) {
      const lines = rollLines(w.rng, WEAPON_BY_ID.ogien!, 2, rarity, false);
      expect(lines).toHaveLength(n);
      expect(new Set(lines.map((l) => l.stat)).size).toBe(n);
      expect(rollLines(w.rng, WEAPON_BY_ID.ogien!, 1, rarity, true)).toHaveLength(n - 1);
    }
    // Wieczna orbita (Żniwa Mokoszy) nie losuje szybkości ataku ani czasu działania.
    for (let i = 0; i < 50; i++) {
      for (const l of rollLines(w.rng, WEAPON_BY_ID.zniwa!, 6, 'legendary', false)) expect(['attackSpeed', 'duration']).not.toContain(l.stat);
    }
  });

  it('karta pasywki skaluje bonus rzadkością i odświeża statystyki', () => {
    const w = world(6);
    const base = w.stats.damage;
    applyCard(w, { kind: 'passive', id: 'pas', rarity: 'epic', isNew: true, level: 1, name: '', text: '', icon: '', color: 0 });
    expect(w.stats.damage).toBeCloseTo(base + PASSIVE_BY_ID.pas!.perLevel * RARITIES.epic.power);
    // Księgi całkowitoliczbowe ignorują rzadkość.
    applyCard(w, { kind: 'passive', id: 'sakwa', rarity: 'legendary', isNew: true, level: 1, name: '', text: '', icon: '', color: 0 });
    expect(w.stats.projectiles).toBe(1);
  });

  it('zwiększone maksymalne zdrowie od razu leczy o różnicę', () => {
    const w = world(6);
    w.player.hp = 50;
    applyCard(w, { kind: 'passive', id: 'serce', rarity: 'common', isNew: true, level: 1, name: '', text: '', icon: '', color: 0 });
    const gain = PASSIVE_BY_ID.serce!.perLevel;
    expect(w.stats.maxHp).toBe(100 + gain);
    expect(w.player.hp).toBe(50 + gain);
  });
});

describe('ewolucje', () => {
  it('każda ewolucja wskazuje istniejącą broń i pasywkę; jest ich co najmniej 3', () => {
    const evos = WEAPONS.filter((w) => w.evolution);
    expect(evos.length).toBeGreaterThanOrEqual(3);
    const passives = new Set<string>();
    for (const w of evos) {
      const into = WEAPON_BY_ID[w.evolution!.into];
      expect(into?.evolved).toBe(true);
      expect(PASSIVE_BY_ID[w.evolution!.passive]).toBeDefined();
      passives.add(w.evolution!.passive);
    }
    // Dwie księgi otwierają po dwie ewolucje (Tura: Włócznia i Miecz Nawii; Siłacza: Sierpy i Kosa Południcy).
    expect(passives.size).toBe(evos.length - 2);
  });

  it('wymaga poziomu ewolucji broni i posiadania księgi', () => {
    const w = world(7);
    const inst = w.findWeapon('sierpy')!;
    expect(canEvolve(w, inst)).toBe(false);
    inst.level = EVOLVE_LEVEL - 1;
    w.passives.push({ def: PASSIVE_BY_ID.pas!, level: 1, power: 1 });
    expect(canEvolve(w, inst)).toBe(false);
    w.passives.length = 0;
    inst.level = EVOLVE_LEVEL;
    expect(canEvolve(w, inst)).toBe(false);
    w.passives.push({ def: PASSIVE_BY_ID.pas!, level: 1, power: 1 });
    expect(canEvolve(w, inst)).toBe(true);
  });

  it('skrzynia w pierwszej kolejności daje gotową ewolucję, a karta ją wykonuje', () => {
    const w = world(8);
    const inst = w.findWeapon('sierpy')!;
    inst.level = EVOLVE_LEVEL;
    inst.bonus = 0.3;
    inst.dealt = 1234;
    w.passives.push({ def: PASSIVE_BY_ID.pas!, level: 1, power: 1 });
    const cards = chestCards(w);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.kind).toBe('evolve');
    expect(cards[0]!.rarity).toBe('legendary');
    applyCard(w, cards[0]!);
    expect(inst.def.id).toBe('zniwa');
    expect(inst.level).toBe(EVOLVE_LEVEL);
    expect(inst.slot).toBe(0);
    expect(inst.bonus).toBe(0.3);
    expect(inst.dealt).toBe(1234);
    expect(w.evolved).toBe(1);
    // Po ewolucji bazowa broń nie wraca do puli, a ewolucja nie jest proponowana ponownie;
    // ewoluowana broń dalej dostaje poziomy z liniami statów.
    let evolvedLevels = 0;
    for (let i = 0; i < 100; i++) {
      for (const c of levelUpCards(w, 3)) {
        expect(c.id).not.toBe('sierpy');
        expect(c.kind).not.toBe('evolve');
        if (c.id === 'zniwa') {
          expect(c.isNew).toBe(false);
          evolvedLevels++;
        }
      }
    }
    expect(evolvedLevels).toBeGreaterThan(0);
  });

  it('gotowa ewolucja pojawia się także wśród kart awansu jako legendarna', () => {
    const w = world(11);
    const inst = w.findWeapon('sierpy')!;
    inst.level = EVOLVE_LEVEL;
    w.passives.push({ def: PASSIVE_BY_ID.pas!, level: 1, power: 1 });
    let seen = 0;
    for (let i = 0; i < 60; i++) {
      const evo = levelUpCards(w, 3).find((c) => c.kind === 'evolve');
      if (evo) {
        seen++;
        expect(evo.rarity).toBe('legendary');
        expect(evo.id).toBe('sierpy');
      }
    }
    expect(seen).toBeGreaterThan(20);
  });

  it('skrzynia bez ewolucji daje skarb, a jego rzadkość to rzadkość przedmiotu', () => {
    const w = world(12);
    // Pełna pula (skarby ze Skarbca też), żeby wypadały wszystkie rzadkości.
    for (const it of ITEMS) w.itemPool.add(it.id);
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const c = chestCards(w)[0]!;
      expect(c.kind).toBe('item');
      expect(c.rarity).toBe(ITEM_BY_ID[c.id]!.rarity);
      seen.add(c.rarity);
    }
    expect(seen.size).toBe(4);
  });
});

describe('dane broni', () => {
  it('każda broń bazowa ma 5 ręcznych poziomów (dalej linie do 15.), a statystyki kumulują się', () => {
    const base = WEAPONS.filter((w) => !w.evolved);
    expect(base.length).toBeGreaterThanOrEqual(8);
    for (const w of base) {
      expect(weaponMilestones(w)).toBe(5);
      expect(weaponMaxLevel(w)).toBe(15);
      for (const l of w.levels) expect(l.note.length).toBeGreaterThan(0);
    }
    const s = WEAPON_BY_ID.sierpy!;
    expect(weaponStatsAt(s, 1).count).toBe(2);
    expect(weaponStatsAt(s, 2).count).toBe(3);
    expect(weaponStatsAt(s, 3).count).toBe(3);
    expect(weaponStatsAt(s, 3).damage).toBe(14);
    expect(weaponStatsAt(s, 5).damage).toBe(20);
    expect(weaponStatsAt(s, 99)).toEqual(weaponStatsAt(s, 5));
  });

  it('ma co najmniej 8 pasywek z unikalnymi identyfikatorami', () => {
    expect(PASSIVES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PASSIVES.map((p) => p.id)).size).toBe(PASSIVES.length);
    expect(new Set(WEAPONS.map((w) => w.id)).size).toBe(WEAPONS.length);
  });
});

describe('linie statów: bez pustych ulepszeń', () => {
  it('broń strzelająca już najszybciej jak się da nie losuje szybkości ataku', () => {
    const w = new World(map, { seed: 21 });
    const inst = w.findWeapon('sierpy')!;
    inst.level = 8;
    w.stats.attackSpeed = 5;
    w.stats.cooldown = 0.35;
    w.refreshWeapon(inst);
    w.passivePool.clear();
    w.weaponPool.clear();
    let seen = 0;
    for (let i = 0; i < 80; i++) {
      for (const c of levelUpCards(w, 3)) {
        if (c.kind !== 'weapon') continue;
        seen++;
        for (const l of c.lines ?? []) expect(l.stat).not.toBe('attackSpeed');
      }
    }
    expect(seen).toBeGreaterThan(50);
  });
});
