import { MAP_HALF } from './terrain';

export const FOG_CELL = 4;
export const FOG_DIM = (MAP_HALF * 2) / FOG_CELL;
/** How far the hero sees for the purpose of uncovering the map. */
export const SIGHT = 30;

/**
 * Fog of war for the map screen: which parts of the forest the hero has already seen in this run.
 * Each cell stores 0 (unknown) .. 255 (fully seen); the soft rim keeps the revealed area round.
 */
export class Explored {
  readonly cells = new Uint8Array(FOG_DIM * FOG_DIM);
  /** Bumped whenever a cell changes (the map view redraws its mask only then). */
  version = 0;
  private lastX = Infinity;
  private lastZ = Infinity;

  /** Uncovers a disc around the point. Cheap to call every step: does nothing until the hero has moved. */
  reveal(x: number, z: number, r: number = SIGHT): void {
    const dx = x - this.lastX;
    const dz = z - this.lastZ;
    if (dx * dx + dz * dz < 2.25) return;
    this.lastX = x;
    this.lastZ = z;
    const c = this.cells;
    const i0 = Math.max(0, Math.floor((x - r + MAP_HALF) / FOG_CELL));
    const i1 = Math.min(FOG_DIM - 1, Math.floor((x + r + MAP_HALF) / FOG_CELL));
    const j0 = Math.max(0, Math.floor((z - r + MAP_HALF) / FOG_CELL));
    const j1 = Math.min(FOG_DIM - 1, Math.floor((z + r + MAP_HALF) / FOG_CELL));
    const soft = r * 0.3;
    let changed = false;
    for (let j = j0; j <= j1; j++) {
      const cz = -MAP_HALF + (j + 0.5) * FOG_CELL - z;
      for (let i = i0; i <= i1; i++) {
        const cx = -MAP_HALF + (i + 0.5) * FOG_CELL - x;
        const d = Math.sqrt(cx * cx + cz * cz);
        if (d >= r) continue;
        const v = d <= r - soft ? 255 : Math.round(((r - d) / soft) * 255);
        const k = j * FOG_DIM + i;
        if (v > (c[k] as number)) {
          c[k] = v;
          changed = true;
        }
      }
    }
    if (changed) this.version++;
  }

  /** 0..1 visibility at a world position (nearest cell). */
  at(x: number, z: number): number {
    const i = Math.floor((x + MAP_HALF) / FOG_CELL);
    const j = Math.floor((z + MAP_HALF) / FOG_CELL);
    if (i < 0 || j < 0 || i >= FOG_DIM || j >= FOG_DIM) return 0;
    return (this.cells[j * FOG_DIM + i] as number) / 255;
  }

  /** True once the place has been properly seen (used for map markers). */
  seen(x: number, z: number): boolean {
    return this.at(x, z) > 0.5;
  }

  /** Share of the playable disc uncovered so far, 0..1. */
  coverage(playRadius: number): number {
    let seen = 0;
    let total = 0;
    for (let j = 0; j < FOG_DIM; j++) {
      const z = -MAP_HALF + (j + 0.5) * FOG_CELL;
      for (let i = 0; i < FOG_DIM; i++) {
        const x = -MAP_HALF + (i + 0.5) * FOG_CELL;
        if (x * x + z * z > playRadius * playRadius) continue;
        total++;
        if ((this.cells[j * FOG_DIM + i] as number) > 127) seen++;
      }
    }
    return total > 0 ? seen / total : 0;
  }
}
