import { fbm, hash2, smoothstep, TAU } from '../core/math';
import { Rng } from '../core/rng';

export const MAP_HALF = 220;
export const PLAY_RADIUS = 180;
export const GRID_CELL = 2;
export const GRID_N = (MAP_HALF * 2) / GRID_CELL + 1;

export type ObstacleKind = 'pine' | 'oak' | 'birch' | 'rock' | 'shrine' | 'bonfire' | 'menhir' | 'ancientOak' | 'hut' | 'idol';

export interface Obstacle {
  x: number;
  z: number;
  /** Collision radius. */
  r: number;
  kind: ObstacleKind;
  scale: number;
  rot: number;
}

export interface Puddle {
  x: number;
  z: number;
  r: number;
  /** Water surface height. */
  y: number;
}

export interface Spot {
  x: number;
  z: number;
  rot: number;
}

/** god: blessing of a god; circle: stand inside to charge it; amber: pulls every gem; greed: curse for loot. */
export type ShrineKind = 'god' | 'circle' | 'amber' | 'greed';

/** Kinds of the eight shrines (six by the trails, two deep in the woods); every map deals them in its own order. */
export const SHRINE_KINDS: ShrineKind[] = ['god', 'circle', 'god', 'amber', 'god', 'circle', 'greed', 'god'];

export interface ShrineSpot extends Spot {
  kind: ShrineKind;
}

export interface ChestSpot extends Spot {
  /** The chest of a landmark: holds a better reward than the chests scattered in the woods. */
  rich: boolean;
}

export type LandmarkKind = 'circle' | 'oak' | 'hut' | 'idol' | 'barrow' | 'lake';

/** A named place worth walking to; shown on the map once discovered. */
export interface Landmark {
  kind: LandmarkKind;
  name: string;
  x: number;
  z: number;
  /** Radius kept free of random trees and rocks. */
  r: number;
}

/**
 * [kind, name, nearest and farthest distance from the centre, clearing radius]. Every map puts each
 * place at a distance of its own within the range, in a compass sector of its own (see placeLandmarkSites).
 */
const LANDMARK_DEFS: Array<[LandmarkKind, string, number, number, number]> = [
  ['idol', 'Posąg Świętowita', 60, 100, 6],
  ['lake', 'Topielcowe Jezioro', 75, 120, 15],
  ['circle', 'Kamienny Krąg', 80, 125, 11],
  ['oak', 'Święty Dąb', 95, 140, 8],
  ['barrow', 'Kurhan', 110, 150, 12],
  ['hut', 'Chata na Kurzej Stopce', 120, 158, 8],
];
/** Share of its compass sector a landmark may land in: the rest keeps neighbours apart. */
const SECTOR_USE = 0.6;

const LAKE_R = 12.5;
const BARROW_H = 3.4;

/** Chests near the starting clearing (see placeNearChests). */
export const NEAR_CHESTS = 3;
export const NEAR_CHEST_MIN = 18;
export const NEAR_CHEST_MAX = 25;
/** The seed of the map every test and the balance simulation use. */
export const DEFAULT_MAP_SEED = 20261117;

const OB_CELL = 8;
const OB_DIM = Math.ceil((MAP_HALF * 2) / OB_CELL);

interface Flat {
  x: number;
  z: number;
  r: number;
  h: number;
}

/** The numbers 0..n-1 in a random order. */
function shuffled(rng: Rng, n: number): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [out[i], out[j]] = [out[j] as number, out[i] as number];
  }
  return out;
}

/**
 * Static world: heightmap, obstacles (trees, rocks, shrines, bonfires, landmarks), swamp puddles, trails.
 * Pure data + queries, no rendering. Generated deterministically from a seed: every seed is a different
 * forest (where the named places lie, how the trails run, the hills, the woods, the chests, the shrines).
 */
export class GameMap {
  readonly heights = new Float32Array(GRID_N * GRID_N);
  /** Trodden-trail strength 0..1 on the height grid. */
  readonly path = new Float32Array(GRID_N * GRID_N);
  readonly obstacles: Obstacle[] = [];
  readonly puddles: Puddle[] = [];
  readonly bonfires: Spot[] = [];
  readonly shrines: ShrineSpot[] = [];
  readonly chestSpots: ChestSpot[] = [];
  readonly landmarks: Landmark[] = [];
  /** Trail polylines (centre -> landmark), used to put shrines and fires by the wayside. */
  private readonly trails: Array<Array<[number, number]>> = [];
  private readonly flats: Flat[] = [];
  private readonly obGrid: number[][] = [];
  /** Offset of every noise lookup, so the hills, the woods and the bends of the trails differ per seed. */
  private readonly nx: number;
  private readonly nz: number;
  /** Result of the last resolveCircle call. */
  outX = 0;
  outZ = 0;

  constructor(readonly seed = DEFAULT_MAP_SEED) {
    const rng = new Rng(seed);
    this.nx = rng.range(0, 400);
    this.nz = rng.range(0, 400);
    this.placeLandmarkSites(rng);
    this.buildTrails(rng);
    this.placePuddles(rng);
    for (const l of this.landmarks) {
      if (l.kind === 'lake' || l.kind === 'barrow') continue;
      this.flats.push({ x: l.x, z: l.z, r: l.r, h: this.noiseHeight(l.x, l.z) });
    }
    for (const p of this.puddles) this.flats.push({ x: p.x, z: p.z, r: p.r * 1.25, h: this.noiseHeight(p.x, p.z) });
    this.buildHeights();
    for (const p of this.puddles) p.y = this.heightAt(p.x, p.z) + (p.r > 8 ? 0.42 : 0.22);
    this.placeFeatures(rng);
    this.buildObstacleGrid();
  }

  // ------------------------------------------------------------------ landmarks and trails

  /** One landmark per sixth of the compass, in a random order, each at a random bearing and distance. */
  private placeLandmarkSites(rng: Rng): void {
    const n = LANDMARK_DEFS.length;
    const sectors = shuffled(rng, n);
    const turn = rng.range(0, TAU);
    LANDMARK_DEFS.forEach(([kind, name, dMin, dMax, r], i) => {
      const a = turn + (((sectors[i] as number) + 0.5 + (rng.next() - 0.5) * SECTOR_USE) / n) * TAU;
      const d = rng.range(dMin, dMax);
      this.landmarks.push({ kind, name, x: Math.cos(a) * d, z: Math.sin(a) * d, r });
    });
  }

  private stamp(x: number, z: number): void {
    const R = 3.2;
    const i0 = Math.max(0, Math.floor((x - R + MAP_HALF) / GRID_CELL));
    const i1 = Math.min(GRID_N - 1, Math.ceil((x + R + MAP_HALF) / GRID_CELL));
    const j0 = Math.max(0, Math.floor((z - R + MAP_HALF) / GRID_CELL));
    const j1 = Math.min(GRID_N - 1, Math.ceil((z + R + MAP_HALF) / GRID_CELL));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const d = Math.hypot(-MAP_HALF + i * GRID_CELL - x, -MAP_HALF + j * GRID_CELL - z);
        const v = 1 - smoothstep(1.0, R, d);
        const k = j * GRID_N + i;
        if (v > (this.path[k] as number)) this.path[k] = v;
      }
    }
  }

  /** A meandering trail between two points; the sideways drift fades out at both ends. */
  private trace(ax: number, az: number, bx: number, bz: number, salt: number): Array<[number, number]> {
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(2, Math.ceil(len / 1.5));
    const nx = -(bz - az) / len;
    const nz = (bx - ax) / len;
    const amp = Math.min(13, len * 0.13);
    const pts: Array<[number, number]> = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const off = (fbm((t * len) / 34 + salt * 7.13 + this.nx, salt * 3.7 + 0.5 + this.nz, 2) - 0.5) * 2 * amp * Math.sin(Math.PI * t);
      const x = ax + (bx - ax) * t + nx * off;
      const z = az + (bz - az) * t + nz * off;
      pts.push([x, z]);
      this.stamp(x, z);
    }
    return pts;
  }

  private buildTrails(rng: Rng): void {
    this.landmarks.forEach((l, i) => {
      const d = Math.hypot(l.x, l.z);
      const ux = l.x / d;
      const uz = l.z / d;
      // Stop at the edge of the landmark (the shore of the lake, the ring of stones).
      const stop = d - (l.kind === 'lake' ? LAKE_R + 1 : l.kind === 'circle' ? 4 : 3);
      this.trails.push(this.trace(ux * 9, uz * 9, ux * stop, uz * stop, i + 1));
    });
    // Cross-links between neighbours around the compass, one per landmark, so the outer places can be
    // visited without returning to the clearing.
    const ring = this.landmarks.slice().sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
    const inset = (l: Landmark): number => (l.kind === 'lake' ? LAKE_R + 1 : l.r - 2);
    const first = rng.int(2);
    for (let k = first; k < ring.length + first; k += 2) {
      const A = ring[k % ring.length] as Landmark;
      const B = ring[(k + 1) % ring.length] as Landmark;
      const d = Math.hypot(B.x - A.x, B.z - A.z);
      const ux = (B.x - A.x) / d;
      const uz = (B.z - A.z) / d;
      this.trace(A.x + ux * inset(A), A.z + uz * inset(A), B.x - ux * inset(B), B.z - uz * inset(B), 11 + k);
    }
  }

  /** Trail strength 0..1 (bilinear). */
  pathAt(x: number, z: number): number {
    let fx = (x + MAP_HALF) / GRID_CELL;
    let fz = (z + MAP_HALF) / GRID_CELL;
    if (fx < 0) fx = 0;
    else if (fx > GRID_N - 1.001) fx = GRID_N - 1.001;
    if (fz < 0) fz = 0;
    else if (fz > GRID_N - 1.001) fz = GRID_N - 1.001;
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const u = fx - i;
    const v = fz - j;
    const p = this.path;
    const k = j * GRID_N + i;
    const a = (p[k] as number) + ((p[k + 1] as number) - (p[k] as number)) * u;
    const b = (p[k + GRID_N] as number) + ((p[k + GRID_N + 1] as number) - (p[k + GRID_N] as number)) * u;
    return a + (b - a) * v;
  }

  // ------------------------------------------------------------------ terrain

  private placePuddles(rng: Rng): void {
    const lake = this.landmarks.find((l) => l.kind === 'lake') as Landmark;
    this.puddles.push({ x: lake.x, z: lake.z, r: LAKE_R, y: 0 });
    let guard = 0;
    while (this.puddles.length < 26 && guard++ < 3000) {
      const a = rng.range(0, TAU);
      const d = 20 + Math.sqrt(rng.next()) * (PLAY_RADIUS - 32);
      const r = rng.range(3.5, 6.5);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      let ok = this.pathAt(x, z) < 0.01 && this.pathAt(x + r, z) < 0.01 && this.pathAt(x - r, z) < 0.01 && this.pathAt(x, z + r) < 0.01 && this.pathAt(x, z - r) < 0.01;
      for (const p of this.puddles) {
        if (Math.hypot(p.x - x, p.z - z) < p.r + r + 10) ok = false;
      }
      for (const l of this.landmarks) {
        if (Math.hypot(l.x - x, l.z - z) < l.r + r + 4) ok = false;
      }
      if (ok) this.puddles.push({ x, z, r, y: 0 });
    }
  }

  /** Rolling hills: flat clearing in the middle, a rising rim around the playable disc. */
  private noiseHeight(x: number, z: number): number {
    const d = Math.hypot(x, z);
    const ox = this.nx;
    const oz = this.nz;
    let h = (fbm(x / 42 + 3.1 + ox, z / 42 + 7.7 + oz, 3) - 0.5) * 9;
    h += (fbm(x / 13 + 11.3 + ox, z / 13 + 2.9 + oz, 2) - 0.5) * 1.6;
    h += (fbm(x / 110 + 40.2 + ox, z / 110 + 18.4 + oz, 2) - 0.5) * 7 * smoothstep(60, 130, d);
    h *= smoothstep(5, 30, d);
    h += smoothstep(PLAY_RADIUS - 8, PLAY_RADIUS + 26, d) * 9;
    return h;
  }

  private rawHeight(x: number, z: number): number {
    let h = this.noiseHeight(x, z);
    // Level the ground under landmarks and water so structures and water discs sit properly.
    for (const f of this.flats) {
      const fd = Math.hypot(f.x - x, f.z - z);
      if (fd < f.r * 1.7) h += (f.h - h) * (1 - smoothstep(f.r * 0.75, f.r * 1.7, fd));
    }
    for (const p of this.puddles) {
      const pd = Math.hypot(p.x - x, p.z - z);
      if (pd < p.r * 1.6) h -= (1 - smoothstep(p.r * 0.4, p.r * 1.6, pd)) * (p.r > 8 ? 1.5 : 0.7);
    }
    for (const l of this.landmarks) {
      if (l.kind !== 'barrow') continue;
      const bd = Math.hypot(l.x - x, l.z - z);
      if (bd < 13) h += (1 - smoothstep(2.5, 12, bd)) * BARROW_H;
    }
    return h;
  }

  private buildHeights(): void {
    for (let j = 0; j < GRID_N; j++) {
      for (let i = 0; i < GRID_N; i++) {
        const x = -MAP_HALF + i * GRID_CELL;
        const z = -MAP_HALF + j * GRID_CELL;
        this.heights[j * GRID_N + i] = this.rawHeight(x, z);
      }
    }
  }

  /** Terrain height, interpolated on the same triangles the render mesh uses. */
  heightAt(x: number, z: number): number {
    let fx = (x + MAP_HALF) / GRID_CELL;
    let fz = (z + MAP_HALF) / GRID_CELL;
    if (fx < 0) fx = 0;
    else if (fx > GRID_N - 1.001) fx = GRID_N - 1.001;
    if (fz < 0) fz = 0;
    else if (fz > GRID_N - 1.001) fz = GRID_N - 1.001;
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const u = fx - i;
    const v = fz - j;
    const h = this.heights;
    const k = j * GRID_N + i;
    const h00 = h[k] as number;
    const h10 = h[k + 1] as number;
    const h01 = h[k + GRID_N] as number;
    const h11 = h[k + GRID_N + 1] as number;
    if (u + v <= 1) return h00 + (h10 - h00) * u + (h01 - h00) * v;
    return h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v);
  }

  // ------------------------------------------------------------------ features

  private free(x: number, z: number, r: number, margin: number): boolean {
    for (const o of this.obstacles) {
      if (Math.hypot(o.x - x, o.z - z) < o.r + r + margin) return false;
    }
    for (const p of this.puddles) {
      if (Math.hypot(p.x - x, p.z - z) < p.r + r + 1) return false;
    }
    for (const c of this.chestSpots) {
      if (Math.hypot(c.x - x, c.z - z) < r + 2.5) return false;
    }
    return true;
  }

  /** True inside the clearing kept around a landmark. */
  private inClearing(x: number, z: number): boolean {
    for (const l of this.landmarks) {
      if (Math.hypot(l.x - x, l.z - z) < l.r) return true;
    }
    return false;
  }

  private placeLandmarks(): void {
    for (const l of this.landmarks) {
      const toCentre = Math.atan2(-l.z, -l.x);
      const face = Math.atan2(-l.x, -l.z);
      const at = (a: number, d: number): [number, number] => [l.x + Math.cos(a) * d, l.z + Math.sin(a) * d];
      switch (l.kind) {
        case 'circle': {
          // Ring of standing stones with a gap where the trail arrives; a chest waits in the middle.
          const n = 10;
          for (let i = 1; i < n; i++) {
            const a = toCentre + (i / n) * TAU;
            const [x, z] = at(a, 7);
            // The broad, carved face of every stone looks at the middle of the ring (give or take).
            this.obstacles.push({ x, z, r: 0.85, kind: 'menhir', scale: 0.85 + hash2(i * 7, 3) * 0.5, rot: -a - Math.PI / 2 + (hash2(i, 9) - 0.5) * 0.5 });
          }
          this.chestSpots.push({ x: l.x, z: l.z, rot: face, rich: true });
          break;
        }
        case 'oak': {
          this.obstacles.push({ x: l.x, z: l.z, r: 2.3, kind: 'ancientOak', scale: 1, rot: 0.7 });
          const [x, z] = at(toCentre + 0.7, 5.2);
          this.chestSpots.push({ x, z, rot: face, rich: true });
          break;
        }
        case 'hut': {
          this.obstacles.push({ x: l.x, z: l.z, r: 2.4, kind: 'hut', scale: 1, rot: face });
          const [x, z] = at(toCentre - 0.8, 5.4);
          this.chestSpots.push({ x, z, rot: face, rich: true });
          break;
        }
        case 'idol': {
          this.obstacles.push({ x: l.x, z: l.z, r: 1.0, kind: 'idol', scale: 1, rot: face });
          const [x, z] = at(toCentre + Math.PI, 3.6);
          this.chestSpots.push({ x, z, rot: face, rich: true });
          break;
        }
        case 'barrow': {
          this.obstacles.push({ x: l.x, z: l.z, r: 0.95, kind: 'menhir', scale: 1.5, rot: 0.4 });
          const [x, z] = at(toCentre + 0.5, 2.8);
          this.chestSpots.push({ x, z, rot: face, rich: true });
          for (let i = 0; i < 5; i++) {
            const a = 0.6 + (i / 5) * TAU;
            const [rx, rz] = at(a, 9.5 + hash2(i, 5) * 1.5);
            this.obstacles.push({ x: rx, z: rz, r: 0.7, kind: 'menhir', scale: 0.55 + hash2(i, 2) * 0.25, rot: a });
          }
          break;
        }
        case 'lake':
          break;
      }
    }
  }

  private placeFeatures(rng: Rng): void {
    this.placeLandmarks();
    const kinds = shuffled(rng, SHRINE_KINDS.length).map((i) => SHRINE_KINDS[i] as ShrineKind);
    const addBonfire = (x: number, z: number): boolean => {
      if (!this.free(x, z, 1.2, 2) || this.pathAt(x, z) > 0.2) return false;
      this.bonfires.push({ x, z, rot: rng.range(0, TAU) });
      this.obstacles.push({ x, z, r: 1.1, kind: 'bonfire', scale: 1, rot: 0 });
      return true;
    };
    const addShrine = (x: number, z: number, faceX: number, faceZ: number): boolean => {
      if (!this.free(x, z, 1.2, 3) || this.pathAt(x, z) > 0.2) return false;
      const rot = Math.atan2(faceX - x, faceZ - z);
      this.shrines.push({ x, z, rot, kind: kinds[this.shrines.length] ?? 'god' });
      this.obstacles.push({ x, z, r: 0.9, kind: 'shrine', scale: 1, rot });
      return true;
    };
    /** A spot beside trail `i` at fraction `t`, `side` metres to the left (+) or right (-). */
    const wayside = (i: number, t: number, side: number): [number, number, number, number] => {
      const tr = this.trails[i] as Array<[number, number]>;
      const k = Math.min(tr.length - 2, Math.max(0, Math.floor(t * (tr.length - 1))));
      const [ax, az] = tr[k] as [number, number];
      const [bx, bz] = tr[k + 1] as [number, number];
      const l = Math.hypot(bx - ax, bz - az) || 1;
      return [ax - ((bz - az) / l) * side, az + ((bx - ax) / l) * side, ax, az];
    };

    // Bonfires: one at the start, one by every trail, the rest scattered.
    // The starting fire sits between two trails: try bearings around the clearing until one is free.
    const fireAt = rng.range(0, TAU);
    for (let k = 0; k < 16; k++) {
      const a = fireAt + k * 0.4;
      if (addBonfire(Math.cos(a) * 9.5, Math.sin(a) * 9.5)) break;
    }
    for (let i = 0; i < this.trails.length; i++) {
      for (const side of [-5.5, 5.5, -7, 7]) {
        const [x, z] = wayside(i, 0.72, side);
        if (addBonfire(x, z)) break;
      }
    }
    let guard = 0;
    while (this.bonfires.length < 16 && guard++ < 400) {
      const a = rng.range(0, TAU);
      const d = rng.range(30, PLAY_RADIUS - 14);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      let far = !this.inClearing(x, z);
      for (const b of this.bonfires) if (Math.hypot(b.x - x, b.z - z) < 42) far = false;
      if (far) addBonfire(x, z);
    }
    // Shrines: one beside every trail (facing it), two deeper in the woods. Eight in total:
    // four gods bless twice each, so every shrine on the map has something to give.
    for (let i = 0; i < this.trails.length; i++) {
      const t = i % 2 === 0 ? 0.42 : 0.3;
      for (const side of [4.6, -4.6, 6, -6]) {
        const [x, z, px, pz] = wayside(i, t, side);
        if (addShrine(x, z, px, pz)) break;
      }
    }
    guard = 0;
    while (this.shrines.length < 8 && guard++ < 400) {
      const a = rng.range(0, TAU);
      const d = rng.range(70, PLAY_RADIUS - 16);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      let far = !this.inClearing(x, z);
      for (const s of this.shrines) if (Math.hypot(s.x - x, s.z - z) < 48) far = false;
      if (far) addShrine(x, z, 0, 0);
    }
    // Chest spots (landmarks already hold one each).
    guard = 0;
    while (this.chestSpots.length < 24 && guard++ < 2000) {
      const a = rng.range(0, TAU);
      // Further out than the chests by the starting clearing (see placeNearChests).
      const d = NEAR_CHEST_MAX + 5 + Math.sqrt(rng.next()) * (PLAY_RADIUS - 15 - NEAR_CHEST_MAX);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (this.inClearing(x, z) || !this.free(x, z, 1, 3)) continue;
      let far = true;
      for (const c of this.chestSpots) if (Math.hypot(c.x - x, c.z - z) < 27) far = false;
      if (!far) continue;
      this.chestSpots.push({ x, z, rot: rng.range(0, TAU), rich: false });
    }
    // Rocks.
    guard = 0;
    let rocks = 0;
    while (rocks < 170 && guard++ < 8000) {
      const a = rng.range(0, TAU);
      const d = 12 + Math.sqrt(rng.next()) * (PLAY_RADIUS - 8);
      const s = rng.range(0.8, 2.4);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (this.inClearing(x, z) || this.pathAt(x, z) > 0.05) continue;
      if (!this.free(x, z, s * 0.85, 1.5)) continue;
      this.obstacles.push({ x, z, r: s * 0.85, kind: 'rock', scale: s, rot: rng.range(0, TAU) });
      rocks++;
    }
    // Trees: thin on the starting clearing, then glades and thick woods; birches grow in groves.
    guard = 0;
    let trees = 0;
    while (trees < 780 && guard++ < 60000) {
      const a = rng.range(0, TAU);
      const d = 12 + Math.sqrt(rng.next()) * (PLAY_RADIUS - 8);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const woods = smoothstep(0.34, 0.62, fbm(x / 46 + 9.3 + this.nx, z / 46 + 4.1 + this.nz, 2));
      const density = (0.22 + 0.78 * smoothstep(30, 90, d)) * (0.3 + 0.9 * woods) + (fbm(x / 20 + this.nx, z / 20 + this.nz, 2) - 0.5) * 0.6;
      if (rng.next() > density) continue;
      if (this.inClearing(x, z) || this.pathAt(x, z) > 0.12) continue;
      const grove = fbm(x / 64 + 31.7 + this.nx, z / 64 + 77.2 + this.nz, 2) > 0.56;
      const roll = rng.next();
      const kind: ObstacleKind = grove ? (roll < 0.78 ? 'birch' : 'pine') : roll < 0.22 ? 'oak' : 'pine';
      const s = kind === 'oak' ? rng.range(1.1, 1.7) : kind === 'birch' ? rng.range(0.95, 1.5) : rng.range(0.9, 1.6);
      const r = (kind === 'oak' ? 0.75 : kind === 'birch' ? 0.36 : 0.5) * s;
      if (!this.free(x, z, r, 2.2)) continue;
      this.obstacles.push({ x, z, r, kind, scale: s, rot: rng.range(0, TAU) });
      trees++;
    }
    this.placeNearChests(rng);
  }

  /**
   * Chests within a short walk of the starting clearing, one per third of the compass, so the first
   * coins of a run have something to buy.
   */
  private placeNearChests(rng: Rng): void {
    for (let k = 0; k < NEAR_CHESTS; k++) {
      for (let tries = 0; tries < 200; tries++) {
        const a = ((k + rng.range(0.15, 0.85)) / NEAR_CHESTS) * TAU;
        const d = rng.range(NEAR_CHEST_MIN, NEAR_CHEST_MAX);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (this.inClearing(x, z) || this.pathAt(x, z) > 0.3 || !this.free(x, z, 1, 1.2)) continue;
        this.chestSpots.push({ x, z, rot: Math.atan2(-x, -z), rich: false });
        break;
      }
    }
  }

  private buildObstacleGrid(): void {
    for (let i = 0; i < OB_DIM * OB_DIM; i++) this.obGrid.push([]);
    this.obstacles.forEach((o, idx) => {
      const x0 = this.obCoord(o.x - o.r);
      const x1 = this.obCoord(o.x + o.r);
      const z0 = this.obCoord(o.z - o.r);
      const z1 = this.obCoord(o.z + o.r);
      for (let cz = z0; cz <= z1; cz++) {
        for (let cx = x0; cx <= x1; cx++) (this.obGrid[cz * OB_DIM + cx] as number[]).push(idx);
      }
    });
  }

  private obCoord(v: number): number {
    const c = Math.floor((v + MAP_HALF) / OB_CELL);
    return c < 0 ? 0 : c >= OB_DIM ? OB_DIM - 1 : c;
  }

  /**
   * Pushes a circle out of static obstacles and back inside the playable radius.
   * Result in outX/outZ. Returns true when something was hit.
   */
  resolveCircle(x: number, z: number, r: number): boolean {
    let hit = false;
    const x0 = this.obCoord(x - r);
    const x1 = this.obCoord(x + r);
    const z0 = this.obCoord(z - r);
    const z1 = this.obCoord(z + r);
    for (let cz = z0; cz <= z1; cz++) {
      for (let cx = x0; cx <= x1; cx++) {
        const list = this.obGrid[cz * OB_DIM + cx] as number[];
        for (let k = 0; k < list.length; k++) {
          const o = this.obstacles[list[k] as number] as Obstacle;
          const dx = x - o.x;
          const dz = z - o.z;
          const min = o.r + r;
          const d2 = dx * dx + dz * dz;
          if (d2 < min * min) {
            const d = Math.sqrt(d2);
            if (d > 1e-4) {
              x = o.x + (dx / d) * min;
              z = o.z + (dz / d) * min;
            } else {
              x = o.x + min;
            }
            hit = true;
          }
        }
      }
    }
    const d = Math.hypot(x, z);
    if (d > PLAY_RADIUS) {
      x *= PLAY_RADIUS / d;
      z *= PLAY_RADIUS / d;
      hit = true;
    }
    this.outX = x;
    this.outZ = z;
    return hit;
  }

  /** True when the point is over open ground (no obstacle within `r`). */
  isFree(x: number, z: number, r: number): boolean {
    const cx = this.obCoord(x);
    const cz = this.obCoord(z);
    const list = this.obGrid[cz * OB_DIM + cx] as number[];
    for (let k = 0; k < list.length; k++) {
      const o = this.obstacles[list[k] as number] as Obstacle;
      if (Math.hypot(o.x - x, o.z - z) < o.r + r) return false;
    }
    return Math.hypot(x, z) < PLAY_RADIUS;
  }

  inPuddle(x: number, z: number): boolean {
    for (let i = 0; i < this.puddles.length; i++) {
      const p = this.puddles[i] as Puddle;
      const dx = p.x - x;
      const dz = p.z - z;
      const r = p.r * 0.92;
      if (dx * dx + dz * dz < r * r) return true;
    }
    return false;
  }
}
