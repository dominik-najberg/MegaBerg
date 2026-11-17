/**
 * Uniform grid over a square world, rebuilt every simulation step with a counting sort.
 * No allocations after construction.
 */
export class SpatialGrid {
  readonly cell: number;
  readonly half: number;
  readonly dim: number;
  private readonly cellStart: Int32Array;
  private readonly cellFill: Int32Array;
  private readonly items: Int32Array;

  constructor(half: number, cell: number, capacity: number) {
    this.half = half;
    this.cell = cell;
    this.dim = Math.ceil((half * 2) / cell);
    this.cellStart = new Int32Array(this.dim * this.dim + 1);
    this.cellFill = new Int32Array(this.dim * this.dim);
    this.items = new Int32Array(capacity);
  }

  private coord(v: number): number {
    const c = Math.floor((v + this.half) / this.cell);
    return c < 0 ? 0 : c >= this.dim ? this.dim - 1 : c;
  }

  build(n: number, alive: Uint8Array, xs: Float32Array, zs: Float32Array): void {
    const cs = this.cellStart;
    const dim = this.dim;
    cs.fill(0);
    for (let i = 0; i < n; i++) {
      if (!alive[i]) continue;
      const c = this.coord(zs[i] as number) * dim + this.coord(xs[i] as number);
      cs[c + 1] = (cs[c + 1] as number) + 1;
    }
    for (let c = 0; c < dim * dim; c++) cs[c + 1] = (cs[c + 1] as number) + (cs[c] as number);
    this.cellFill.fill(0);
    for (let i = 0; i < n; i++) {
      if (!alive[i]) continue;
      const c = this.coord(zs[i] as number) * dim + this.coord(xs[i] as number);
      const at = (cs[c] as number) + (this.cellFill[c] as number);
      this.items[at] = i;
      this.cellFill[c] = (this.cellFill[c] as number) + 1;
    }
  }

  /**
   * Writes candidate indices whose cells overlap the circle into `out`.
   * Callers still need an exact distance test. Returns the number of candidates.
   */
  query(x: number, z: number, r: number, out: Int32Array): number {
    const x0 = this.coord(x - r);
    const x1 = this.coord(x + r);
    const z0 = this.coord(z - r);
    const z1 = this.coord(z + r);
    let n = 0;
    const max = out.length;
    for (let cz = z0; cz <= z1; cz++) {
      const row = cz * this.dim;
      const a = this.cellStart[row + x0] as number;
      const b = this.cellStart[row + x1 + 1] as number;
      for (let k = a; k < b && n < max; k++) out[n++] = this.items[k] as number;
    }
    return n;
  }
}
