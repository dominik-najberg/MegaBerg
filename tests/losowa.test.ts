import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from '../src/data/items';
import { RUN_LENGTH, SURGE_EVERY, SURGE_LENGTH, surgeAt, surgeLeft } from '../src/data/waves';
import { BONUS_MAX, BONUS_MIN, HASTE_FIRST, HASTE_MUL, HASTE_TIME } from '../src/sim/bonuses';
import { chestCards, RICH_CHEST_ITEMS } from '../src/sim/cards';
import { Ev } from '../src/sim/events';
import { emptyInput } from '../src/sim/player';
import { PickupKind } from '../src/sim/pools';
import { attackInterval } from '../src/sim/stats';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';

const DT = 1 / 60;
const map = new GameMap();

function quiet(seed: number): World {
  const w = new World(map, { seed });
  w.spawner.disabled = true;
  return w;
}

function idle(w: World, seconds: number): void {
  const inp = emptyInput();
  for (let i = 0; i < Math.round(seconds * 60); i++) w.step(DT, inp);
}

function hastes(w: World): number[] {
  const out: number[] = [];
  for (let i = 0; i < w.pickups.n; i++) if (w.pickups.alive[i] && w.pickups.kind[i] === PickupKind.Haste) out.push(i);
  return out;
}

describe('losowa mapa', () => {
  it('to samo ziarno daje ten sam bór, inne ziarno inny', () => {
    const a = new GameMap(77);
    const b = new GameMap(77);
    const c = new GameMap(78);
    expect(a.landmarks).toEqual(b.landmarks);
    expect(a.chestSpots).toEqual(b.chestSpots);
    expect(a.obstacles.length).toBe(b.obstacles.length);
    // każde nazwane miejsce leży gdzie indziej
    for (let i = 0; i < a.landmarks.length; i++) {
      expect(a.landmarks[i]!.kind).toBe(c.landmarks[i]!.kind);
      expect(Math.hypot(a.landmarks[i]!.x - c.landmarks[i]!.x, a.landmarks[i]!.z - c.landmarks[i]!.z)).toBeGreaterThan(5);
    }
    // skrzynie przy starcie też
    const near = (m: GameMap): string => m.chestSpots.filter((s) => Math.hypot(s.x, s.z) < 26).map((s) => `${s.x.toFixed(1)},${s.z.toFixed(1)}`).join(' ');
    expect(near(a)).not.toBe(near(c));
    expect(a.heightAt(60, 60)).not.toBeCloseTo(c.heightAt(60, 60), 3);
  });

  it('miejsca wędrują po całym kompasie i na różne odległości', () => {
    const bearings = new Set<number>();
    let dMin = Infinity;
    let dMax = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const idol = new GameMap(seed).landmarks.find((l) => l.kind === 'idol')!;
      bearings.add(Math.floor(((Math.atan2(idol.z, idol.x) + Math.PI) / (Math.PI * 2)) * 8));
      dMin = Math.min(dMin, Math.hypot(idol.x, idol.z));
      dMax = Math.max(dMax, Math.hypot(idol.x, idol.z));
    }
    expect(bearings.size).toBeGreaterThanOrEqual(6);
    expect(dMax - dMin).toBeGreaterThan(20);
  });
});

describe('bogate skrzynie miejsc', () => {
  it('skrzynia miejsca daje kilka skarbów naraz i żadnego zwykłego', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const w = quiet(seed);
      const cards = chestCards(w, true);
      expect(cards.length).toBe(RICH_CHEST_ITEMS);
      for (const c of cards) {
        expect(c.kind).toBe('item');
        expect(c.rarity).not.toBe('common');
      }
      expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
      expect(chestCards(w).length).toBe(1);
    }
  });

  it('bogata skrzynia częściej niż zwykła daje skarby epickie i legendarne', () => {
    const w = quiet(9);
    const high = (rich: boolean): number => {
      let n = 0;
      for (let k = 0; k < 600; k++) {
        const c = chestCards(w, rich)[0]!;
        if (c.rarity === 'epic' || c.rarity === 'legendary') n++;
      }
      return n;
    };
    expect(high(true)).toBeGreaterThan(high(false) * 1.5);
  });

  it('otwarcie bogatej skrzyni kosztuje tyle, co zwykłej, i daje wszystkie jej skarby', () => {
    const w = quiet(4);
    const c = w.chests.find((x) => x.rich)!;
    expect(c.free).toBe(false);
    w.gold = 500;
    w.player.x = c.x + 1.2;
    w.player.z = c.z;
    const inp = emptyInput();
    inp.interact = true;
    for (let i = 0; i < 60 && !w.choice; i++) w.step(DT, inp);
    expect(c.opened).toBe(true);
    expect(w.paidChests).toBe(1);
    const ch = w.choice;
    expect(ch?.type === 'chest' && ch.rich).toBe(true);
    if (ch?.type !== 'chest') return;
    expect(ch.cards.length).toBe(RICH_CHEST_ITEMS);
    const before = w.items.reduce((n, it) => n + it.count, 0);
    w.choose(0);
    expect(w.choice).toBe(null);
    expect(w.items.reduce((n, it) => n + it.count, 0)).toBe(before + RICH_CHEST_ITEMS);
    for (const card of ch.cards) expect(ITEM_BY_ID[card.id]).toBeDefined();
  });

  it('gotowa ewolucja zajmuje jedno miejsce w bogatej skrzyni, drugie zostaje na skarb', () => {
    const w = quiet(3);
    const inst = w.weapons[0]!;
    const evo = inst.def.evolution;
    if (!evo) return;
    inst.level = w.weaponCap();
    w.passives.push({ def: { ...w.passives[0]?.def, id: evo.passive } as never, level: 1, power: 1 });
    const cards = chestCards(w, true);
    if (cards[0]!.kind !== 'evolve') return;
    expect(cards.length).toBe(RICH_CHEST_ITEMS);
    expect(cards[1]!.kind).toBe('item');
  });
});

describe('szał bojowy', () => {
  it('pojawia się co jakiś czas w pobliżu bohatera i jest zapowiadany', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const w = quiet(seed);
      expect(w.bonuses.nextHaste).toBeGreaterThanOrEqual(HASTE_FIRST[0]);
      expect(w.bonuses.nextHaste).toBeLessThanOrEqual(HASTE_FIRST[1]);
      idle(w, HASTE_FIRST[0] - 1);
      expect(hastes(w).length).toBe(0);
      idle(w, HASTE_FIRST[1] - HASTE_FIRST[0] + 2);
      const list = hastes(w);
      expect(list.length).toBe(1);
      const i = list[0]!;
      const d = Math.hypot(w.pickups.x[i]! - w.player.x, w.pickups.z[i]! - w.player.z);
      expect(d).toBeGreaterThanOrEqual(BONUS_MIN - 0.01);
      expect(d).toBeLessThanOrEqual(BONUS_MAX + 0.01);
      expect(w.announce.some((t) => t.includes('szał bojowy'))).toBe(true);
      // kolejne pojawiają się dalej, ale nigdy nie leżą dwa naraz
      idle(w, 400);
      expect(hastes(w).length).toBe(1);
    }
  });

  it('podniesiony przyspiesza ataki na określony czas, potem szybkość wraca', () => {
    const w = quiet(5);
    w.bonuses.disabled = true;
    const base = w.stats.attackSpeed;
    expect(w.bonuses.dropHaste(w)).toBe(true);
    const i = hastes(w)[0]!;
    w.player.x = w.pickups.x[i]! - 0.5;
    w.player.z = w.pickups.z[i]!;
    let got = false;
    for (let k = 0; k < 120 && w.hasteT <= 0; k++) {
      w.step(DT, emptyInput());
      for (let e = 0; e < w.events.count; e++) if (w.events.items[e]!.type === Ev.Haste) got = true;
      w.events.clear();
    }
    expect(got).toBe(true);
    expect(hastes(w).length).toBe(0);
    expect(w.hasteT).toBeGreaterThan(HASTE_TIME - 1);
    expect(w.stats.attackSpeed).toBeCloseTo(base * HASTE_MUL);
    // nowy szał nie pojawia się, dopóki trwa poprzedni
    expect(w.bonuses.dropHaste(w)).toBe(false);
    // zmiana statystyk w trakcie nie gubi premii
    w.refreshStats();
    expect(w.stats.attackSpeed).toBeCloseTo(base * HASTE_MUL);
    idle(w, HASTE_TIME + 0.5);
    expect(w.hasteT).toBe(0);
    expect(w.stats.attackSpeed).toBeCloseTo(base);
  });

  it('z szałem przerwa między atakami każdej broni jest krótsza', () => {
    const w = quiet(8);
    const before = attackInterval(w.stats);
    w.hasteT = HASTE_TIME;
    w.refreshStats();
    expect(attackInterval(w.stats)).toBeCloseTo(before / HASTE_MUL);
  });
});

describe('koniec fali', () => {
  it('surgeLeft odlicza do końca fali i jest zerem poza nią', () => {
    expect(surgeLeft(SURGE_EVERY - 1)).toBe(0);
    expect(surgeLeft(SURGE_EVERY)).toBeCloseTo(SURGE_LENGTH);
    expect(surgeLeft(SURGE_EVERY + 10)).toBeCloseTo(SURGE_LENGTH - 10);
    expect(surgeLeft(SURGE_EVERY + SURGE_LENGTH + 0.1)).toBe(0);
    expect(surgeLeft(RUN_LENGTH + 5)).toBe(0);
    for (let t = 0; t < RUN_LENGTH; t += 0.5) expect(surgeLeft(t) > 0).toBe(surgeAt(t) > 0);
  });

  it('bór zapowiada falę i jej koniec', () => {
    const w = new World(map, { seed: 2 });
    w.bonuses.disabled = true;
    w.godMode = true;
    w.time = SURGE_EVERY - 1;
    const said: string[] = [];
    const inp = emptyInput();
    for (let k = 0; k < 60 * (SURGE_LENGTH + 3); k++) {
      w.step(DT, inp);
      while (w.choice) w.choose(0);
      while (w.announce.length > 0) said.push(w.announce.shift()!);
      w.events.clear();
    }
    const start = said.findIndex((t) => t.includes('Nadciąga fala'));
    const end = said.findIndex((t) => t.includes('Fala minęła'));
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(said.filter((t) => t.includes('Fala minęła')).length).toBe(1);
  });
});
