import { fbm, smoothstep, TAU } from '../core/math';
import { Rng } from '../core/rng';

export const MAP_HALF = 120;
export const PLAY_RADIUS = 92;
export const GRID_CELL = 2;
export const GRID_N = (MAP_HALF * 2) / GRID_CELL + 1;

export type ObstacleKind = 'pine' | 'oak' | 'rock' | 'shrine' | 'bonfire';

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

const OB_CELL = 8;
const OB_DIM = Math.ceil((MAP_HALF * 2) / OB_CELL);

/**
 * Static world: heightmap, obstacles (trees, rocks, shrines, bonfires), swamp puddles.
 * Pure data + queries, no rendering. Generated deterministically from a seed.
 */
export class GameMap {
  readonly heights = new Float32Array(GRID_N * GRID_N);
  readonly obstacles: Obstacle[] = [];
  readonly puddles: Puddle[] = [];
  readonly bonfires: Spot[] = [];
  readonly shrines: Spot[] = [];
  readonly chestSpots: Spot[] = [];
  private readonly obGrid: number[][] = [];
  /** Result of the last resolveCircle call. */
  outX = 0;
  outZ = 0;

  constructor(seed = 20261117) {
    const rng = new Rng(seed);
    this.placePuddles(rng);
    this.buildHeights();
    for (const p of this.puddles) p.y = this.heightAt(p.x, p.z) + 0.22;
    this.placeFeatures(rng);
    this.buildObstacleGrid();
  }

  private placePuddles(rng: Rng): void {
    let guard = 0;
    while (this.puddles.length < 10 && guard++ < 500) {
      const a = rng.range(0, TAU);
      const d = rng.range(20, 82);
      const r = rng.range(3.5, 6.5);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      let ok = true;
      for (const p of this.puddles) {
        if (Math.hypot(p.x - x, p.z - z) < p.r + r + 10) ok = false;
      }
      if (ok) this.puddles.push({ x, z, r, y: 0 });
    }
  }

  private rawHeight(x: number, z: number): number {
    const d = Math.hypot(x, z);
    let h = (fbm(x / 42 + 3.1, z / 42 + 7.7, 3) - 0.5) * 9;
    h += (fbm(x / 13 + 11.3, z / 13 + 2.9, 2) - 0.5) * 1.6;
    h *= smoothstep(5, 30, d);
    h += smoothstep(84, 118, d) * 9;
    for (const p of this.puddles) {
      const pd = Math.hypot(p.x - x, p.z - z);
      if (pd < p.r * 1.6) h -= (1 - smoothstep(p.r * 0.4, p.r * 1.6, pd)) * 0.7;
    }
    return h;
  }

  private buildHeights(): void {
    // Puddle basins need a locally flat base, so flatten the noise around them first.
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

  private placeFeatures(rng: Rng): void {
    // Bonfires: one near the start, the rest scattered.
    const bonfireRing: Array<[number, number]> = [
      [9, 0.6],
      [38, 2.2],
      [44, 4.4],
      [62, 0.2],
      [66, 3.3],
      [70, 5.4],
      [30, 5.9],
    ];
    for (const [d, a] of bonfireRing) {
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (!this.free(x, z, 1.2, 2)) continue;
      this.bonfires.push({ x, z, rot: rng.range(0, TAU) });
      this.obstacles.push({ x, z, r: 1.1, kind: 'bonfire', scale: 1, rot: 0 });
    }
    // Shrines on a rough ring.
    for (let i = 0; i < 6; i++) {
      let placed = false;
      for (let tries = 0; tries < 40 && !placed; tries++) {
        const a = (i / 6) * TAU + rng.range(-0.35, 0.35) + 0.5;
        const d = i % 2 === 0 ? rng.range(24, 36) : rng.range(52, 70);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (!this.free(x, z, 1.2, 3)) continue;
        const rot = Math.atan2(-x, -z);
        this.shrines.push({ x, z, rot });
        this.obstacles.push({ x, z, r: 0.9, kind: 'shrine', scale: 1, rot });
        placed = true;
      }
    }
    // Chest spots.
    let guard = 0;
    while (this.chestSpots.length < 10 && guard++ < 600) {
      const a = rng.range(0, TAU);
      const d = rng.range(16, 84);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (!this.free(x, z, 1, 3)) continue;
      let far = true;
      for (const c of this.chestSpots) if (Math.hypot(c.x - x, c.z - z) < 22) far = false;
      if (!far) continue;
      this.chestSpots.push({ x, z, rot: rng.range(0, TAU) });
    }
    // Rocks.
    guard = 0;
    let rocks = 0;
    while (rocks < 46 && guard++ < 2000) {
      const a = rng.range(0, TAU);
      const d = rng.range(12, PLAY_RADIUS + 4);
      const s = rng.range(0.8, 2.4);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (!this.free(x, z, s * 0.85, 1.5)) continue;
      this.obstacles.push({ x, z, r: s * 0.85, kind: 'rock', scale: s, rot: rng.range(0, TAU) });
      rocks++;
    }
    // Trees: thin on the clearing, denser towards the edge.
    guard = 0;
    let trees = 0;
    while (trees < 190 && guard++ < 8000) {
      const a = rng.range(0, TAU);
      const d = 12 + Math.sqrt(rng.next()) * (PLAY_RADIUS - 8);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const density = 0.25 + 0.75 * smoothstep(30, 90, d) + (fbm(x / 20, z / 20, 2) - 0.5) * 0.8;
      if (rng.next() > density) continue;
      const oak = rng.chance(0.22);
      const s = oak ? rng.range(1.1, 1.7) : rng.range(0.9, 1.6);
      const r = oak ? 0.75 * s : 0.5 * s;
      if (!this.free(x, z, r, 2.2)) continue;
      this.obstacles.push({ x, z, r, kind: oak ? 'oak' : 'pine', scale: s, rot: rng.range(0, TAU) });
      trees++;
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
