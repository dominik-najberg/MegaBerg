import { describe, expect, it } from 'vitest';
import { BLESSINGS } from '../src/data/blessings';
import { Explored, FOG_CELL, SIGHT } from '../src/sim/fog';
import { emptyInput } from '../src/sim/player';
import { GameMap, MAP_HALF, NEAR_CHEST_MAX, NEAR_CHEST_MIN, NEAR_CHESTS, PLAY_RADIUS } from '../src/sim/terrain';
import { World } from '../src/sim/world';

const DT = 1 / 60;
const map = new GameMap();

describe('duża mapa', () => {
  it('jest wyraźnie większa niż pierwotna polana (promień 92 m)', () => {
    expect(PLAY_RADIUS).toBeGreaterThanOrEqual(170);
    expect(MAP_HALF).toBeGreaterThan(PLAY_RADIUS + 30);
  });

  it('ma nazwane miejsca w zasięgu gracza, każde z dojściem ścieżką', () => {
    expect(map.landmarks.length).toBeGreaterThanOrEqual(6);
    for (const l of map.landmarks) {
      const d = Math.hypot(l.x, l.z);
      expect(d + l.r).toBeLessThan(PLAY_RADIUS);
      // ścieżka zaczyna się przy polanie i prowadzi w stronę miejsca
      const ux = l.x / d;
      const uz = l.z / d;
      expect(map.pathAt(ux * 10, uz * 10)).toBeGreaterThan(0.5);
    }
  });

  it('na ścieżkach nie rosną drzewa ani nie leżą głazy', () => {
    for (const o of map.obstacles) {
      if (o.kind === 'pine' || o.kind === 'oak' || o.kind === 'birch' || o.kind === 'rock') expect(map.pathAt(o.x, o.z)).toBeLessThanOrEqual(0.12);
    }
  });

  it('kapliczek jest tyle, ile błogosławieństw można dostać w runie', () => {
    expect(map.shrines.length).toBe(BLESSINGS.length * 2);
  });

  it('przy każdym miejscu (poza jeziorem) czeka skrzynia', () => {
    for (const l of map.landmarks) {
      if (l.kind === 'lake') continue;
      const near = map.chestSpots.some((c) => Math.hypot(c.x - l.x, c.z - l.z) < l.r);
      expect(near).toBe(true);
    }
  });

  it('woda leży w płaskiej niecce: brzeg jeziora nie wystaje ponad lustro', () => {
    const lake = map.puddles.reduce((a, b) => (b.r > a.r ? b : a));
    expect(lake.r).toBeGreaterThan(10);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const h = map.heightAt(lake.x + Math.cos(a) * lake.r * 0.6, lake.z + Math.sin(a) * lake.r * 0.6);
      expect(h).toBeLessThan(lake.y);
    }
  });

  it('w zasięgu krótkiego spaceru od startu stoją skrzynie, każda w innej stronie świata', () => {
    const near = map.chestSpots.filter((c) => Math.hypot(c.x, c.z) <= NEAR_CHEST_MAX);
    expect(near.length).toBe(NEAR_CHESTS);
    const sectors = new Set<number>();
    for (const c of near) {
      expect(Math.hypot(c.x, c.z)).toBeGreaterThanOrEqual(NEAR_CHEST_MIN);
      // widać je na mapie od pierwszej sekundy runu
      expect(Math.hypot(c.x, c.z)).toBeLessThan(SIGHT);
      expect(map.isFree(c.x, c.z, 1)).toBe(true);
      const a = (Math.atan2(c.z, c.x) + Math.PI * 2) % (Math.PI * 2);
      sectors.add(Math.floor((a / (Math.PI * 2)) * NEAR_CHESTS));
    }
    expect(sectors.size).toBe(NEAR_CHESTS);
  });

  it('przy starcie pali się ognisko', () => {
    const nearest = Math.min(...map.bonfires.map((b) => Math.hypot(b.x, b.z)));
    expect(nearest).toBeLessThan(12);
    expect(nearest).toBeGreaterThan(6);
  });

  it('obiekty kolizyjne nie blokują punktu startu', () => {
    for (const o of map.obstacles) expect(Math.hypot(o.x, o.z)).toBeGreaterThan(o.r + 2);
  });
});

describe('mgła odkrywania', () => {
  it('na początku odkryte jest tylko otoczenie bohatera', () => {
    const w = new World(map, { seed: 1 });
    expect(w.fog.seen(0, 0)).toBe(true);
    expect(w.fog.seen(SIGHT * 0.6, 0)).toBe(true);
    expect(w.fog.seen(SIGHT + 2 * FOG_CELL, 0)).toBe(false);
    expect(w.fog.seen(120, -90)).toBe(false);
    expect(w.fog.coverage(PLAY_RADIUS)).toBeLessThan(0.05);
  });

  it('marsz odkrywa mapę, a odkryte miejsca zostają odkryte', () => {
    const w = new World(map, { seed: 2 });
    w.spawner.disabled = true;
    const before = w.fog.coverage(PLAY_RADIUS);
    const inp = emptyInput();
    inp.moveZ = 1;
    for (let i = 0; i < 60 * 12; i++) w.step(DT, inp);
    const p = w.player;
    expect(Math.hypot(p.x, p.z)).toBeGreaterThan(30);
    expect(w.fog.seen(p.x, p.z)).toBe(true);
    expect(w.fog.seen(0, 0)).toBe(true);
    expect(w.fog.coverage(PLAY_RADIUS)).toBeGreaterThan(before * 1.5);
  });

  it('nie zmienia wersji, gdy bohater stoi w miejscu', () => {
    const f = new Explored();
    f.reveal(10, 10);
    const v = f.version;
    f.reveal(10.5, 10.2);
    f.reveal(10, 10);
    expect(f.version).toBe(v);
    f.reveal(40, 10);
    expect(f.version).toBeGreaterThan(v);
  });

  it('pozycje poza mapą są po prostu nieodkryte', () => {
    const f = new Explored();
    f.reveal(MAP_HALF - 1, MAP_HALF - 1);
    expect(f.at(MAP_HALF + 50, 0)).toBe(0);
    expect(f.at(-MAP_HALF - 1, -MAP_HALF - 1)).toBe(0);
  });

  it('dojście do miejsca ogłasza odkrycie dokładnie raz', () => {
    const w = new World(map, { seed: 3 });
    w.spawner.disabled = true;
    const l = map.landmarks[0]!;
    const inp = emptyInput();
    w.player.x = l.x - 3;
    w.player.z = l.z - 3;
    w.step(DT, inp);
    w.step(DT, inp);
    expect(w.landmarksFound[0]).toBe(true);
    expect(w.announce.filter((t) => t.includes(l.name)).length).toBe(1);
    expect(w.landmarksFound.filter(Boolean).length).toBe(1);
  });

  it('nowy run zaczyna z zakrytą mapą', () => {
    const a = new World(map, { seed: 5 });
    a.fog.reveal(100, 100);
    const b = new World(map, { seed: 6 });
    expect(b.fog.seen(100, 100)).toBe(false);
  });
});
