/** Structure-of-arrays pools for everything that exists in large numbers. Fixed capacity, free lists, no GC. */

export const MAX_ENEMIES = 800;
export const WEAPON_SLOTS = 8;

class FreeList {
  private readonly stack: Int32Array;
  private top = 0;
  /** One past the highest index ever used: iteration bound. */
  hi = 0;
  count = 0;

  constructor(readonly capacity: number) {
    this.stack = new Int32Array(capacity);
  }

  alloc(): number {
    if (this.top > 0) {
      this.count++;
      return this.stack[--this.top] as number;
    }
    if (this.hi >= this.capacity) return -1;
    this.count++;
    return this.hi++;
  }

  free(i: number): void {
    this.stack[this.top++] = i;
    this.count--;
  }

  reset(): void {
    this.top = 0;
    this.hi = 0;
    this.count = 0;
  }
}

export class Enemies {
  readonly list = new FreeList(MAX_ENEMIES);
  readonly alive = new Uint8Array(MAX_ENEMIES);
  readonly type = new Uint8Array(MAX_ENEMIES);
  readonly elite = new Uint8Array(MAX_ENEMIES);
  readonly state = new Uint8Array(MAX_ENEMIES);
  /** Boss health phase (1..3), tracked per enemy so several bosses can coexist. */
  readonly phase = new Uint8Array(MAX_ENEMIES);
  readonly x = new Float32Array(MAX_ENEMIES);
  readonly y = new Float32Array(MAX_ENEMIES);
  readonly z = new Float32Array(MAX_ENEMIES);
  readonly px = new Float32Array(MAX_ENEMIES);
  readonly py = new Float32Array(MAX_ENEMIES);
  readonly pz = new Float32Array(MAX_ENEMIES);
  /** Knockback velocity. */
  readonly vx = new Float32Array(MAX_ENEMIES);
  readonly vz = new Float32Array(MAX_ENEMIES);
  readonly yaw = new Float32Array(MAX_ENEMIES);
  readonly hp = new Float32Array(MAX_ENEMIES);
  readonly maxHp = new Float32Array(MAX_ENEMIES);
  readonly speed = new Float32Array(MAX_ENEMIES);
  readonly dmg = new Float32Array(MAX_ENEMIES);
  readonly radius = new Float32Array(MAX_ENEMIES);
  readonly flash = new Float32Array(MAX_ENEMIES);
  readonly slowT = new Float32Array(MAX_ENEMIES);
  readonly slowK = new Float32Array(MAX_ENEMIES);
  readonly burnT = new Float32Array(MAX_ENEMIES);
  readonly burnDps = new Float32Array(MAX_ENEMIES);
  readonly burnAcc = new Float32Array(MAX_ENEMIES);
  /** Contact attack cooldown. */
  readonly atk = new Float32Array(MAX_ENEMIES);
  /** Spawn-in / fade-in timer; the enemy is harmless while > 0. */
  readonly spawnT = new Float32Array(MAX_ENEMIES);
  /** AI timers and scratch values. */
  readonly t1 = new Float32Array(MAX_ENEMIES);
  readonly t2 = new Float32Array(MAX_ENEMIES);
  readonly t3 = new Float32Array(MAX_ENEMIES);
  readonly ax = new Float32Array(MAX_ENEMIES);
  readonly az = new Float32Array(MAX_ENEMIES);
  /** Extra height above the ground (leaps, flight). */
  readonly oy = new Float32Array(MAX_ENEMIES);
  /** Last time each weapon slot hit this enemy (for orbit/aura/pierce hit cooldowns). */
  readonly hitT = new Float32Array(MAX_ENEMIES * WEAPON_SLOTS);

  get n(): number {
    return this.list.hi;
  }

  get count(): number {
    return this.list.count;
  }

  alloc(): number {
    const i = this.list.alloc();
    if (i < 0) return -1;
    this.alive[i] = 1;
    this.elite[i] = 0;
    this.state[i] = 0;
    this.phase[i] = 1;
    this.vx[i] = 0;
    this.vz[i] = 0;
    this.yaw[i] = 0;
    this.flash[i] = 0;
    this.slowT[i] = 0;
    this.slowK[i] = 0;
    this.burnT[i] = 0;
    this.burnDps[i] = 0;
    this.burnAcc[i] = 0;
    this.atk[i] = 0;
    this.spawnT[i] = 0.5;
    this.t1[i] = 0;
    this.t2[i] = 0;
    this.t3[i] = 0;
    this.ax[i] = 0;
    this.az[i] = 0;
    this.oy[i] = 0;
    this.hitT.fill(-10, i * WEAPON_SLOTS, (i + 1) * WEAPON_SLOTS);
    return i;
  }

  free(i: number): void {
    if (!this.alive[i]) return;
    this.alive[i] = 0;
    this.list.free(i);
  }
}

export const MAX_GEMS = 1400;

export class Gems {
  readonly list = new FreeList(MAX_GEMS);
  readonly alive = new Uint8Array(MAX_GEMS);
  readonly mag = new Uint8Array(MAX_GEMS);
  readonly x = new Float32Array(MAX_GEMS);
  readonly y = new Float32Array(MAX_GEMS);
  readonly z = new Float32Array(MAX_GEMS);
  readonly val = new Float32Array(MAX_GEMS);
  /** Seconds alive (spawn pop animation). */
  readonly age = new Float32Array(MAX_GEMS);
  private cursor = 0;

  get n(): number {
    return this.list.hi;
  }

  spawn(x: number, y: number, z: number, val: number): void {
    const i = this.list.alloc();
    if (i < 0) {
      // Pool full: fold the value into an existing gem instead of dropping it.
      for (let k = 0; k < MAX_GEMS; k++) {
        this.cursor = (this.cursor + 1) % MAX_GEMS;
        if (this.alive[this.cursor] && !this.mag[this.cursor]) {
          this.val[this.cursor] = (this.val[this.cursor] as number) + val;
          return;
        }
      }
      return;
    }
    this.alive[i] = 1;
    this.mag[i] = 0;
    this.x[i] = x;
    this.y[i] = y;
    this.z[i] = z;
    this.val[i] = val;
    this.age[i] = 0;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}

export const PickupKind = { Coin: 0, Bread: 1, Honey: 2, Vacuum: 3 } as const;
export const MAX_PICKUPS = 256;

export class Pickups {
  readonly list = new FreeList(MAX_PICKUPS);
  readonly alive = new Uint8Array(MAX_PICKUPS);
  readonly kind = new Uint8Array(MAX_PICKUPS);
  readonly mag = new Uint8Array(MAX_PICKUPS);
  readonly x = new Float32Array(MAX_PICKUPS);
  readonly y = new Float32Array(MAX_PICKUPS);
  readonly z = new Float32Array(MAX_PICKUPS);
  readonly val = new Float32Array(MAX_PICKUPS);
  readonly age = new Float32Array(MAX_PICKUPS);

  get n(): number {
    return this.list.hi;
  }

  spawn(kind: number, x: number, y: number, z: number, val: number): void {
    const i = this.list.alloc();
    if (i < 0) return;
    this.alive[i] = 1;
    this.kind[i] = kind;
    this.mag[i] = 0;
    this.x[i] = x;
    this.y[i] = y;
    this.z[i] = z;
    this.val[i] = val;
    this.age[i] = 0;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}

/** Player projectile kinds. */
export const ProjKind = { Bolt: 0, Bounce: 1, Lob: 2 } as const;
export const MAX_PROJ = 256;

export class Projectiles {
  readonly list = new FreeList(MAX_PROJ);
  readonly alive = new Uint8Array(MAX_PROJ);
  readonly kind = new Uint8Array(MAX_PROJ);
  readonly slot = new Uint8Array(MAX_PROJ);
  readonly x = new Float32Array(MAX_PROJ);
  readonly y = new Float32Array(MAX_PROJ);
  readonly z = new Float32Array(MAX_PROJ);
  readonly px = new Float32Array(MAX_PROJ);
  readonly py = new Float32Array(MAX_PROJ);
  readonly pz = new Float32Array(MAX_PROJ);
  readonly vx = new Float32Array(MAX_PROJ);
  readonly vz = new Float32Array(MAX_PROJ);
  readonly life = new Float32Array(MAX_PROJ);
  /** Lob: total flight time; others: unused. */
  readonly span = new Float32Array(MAX_PROJ);
  /** Lob: start position. */
  readonly sx = new Float32Array(MAX_PROJ);
  readonly sy = new Float32Array(MAX_PROJ);
  readonly sz = new Float32Array(MAX_PROJ);
  readonly dmg = new Float32Array(MAX_PROJ);
  readonly radius = new Float32Array(MAX_PROJ);
  readonly left = new Int16Array(MAX_PROJ);
  readonly last = new Int16Array(MAX_PROJ);

  get n(): number {
    return this.list.hi;
  }

  alloc(): number {
    const i = this.list.alloc();
    if (i >= 0) {
      this.alive[i] = 1;
      this.last[i] = -1;
    }
    return i;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}

export const MAX_ZONES = 48;

/** Lingering damage areas left by player weapons. */
export class Zones {
  readonly list = new FreeList(MAX_ZONES);
  readonly alive = new Uint8Array(MAX_ZONES);
  readonly slot = new Uint8Array(MAX_ZONES);
  readonly x = new Float32Array(MAX_ZONES);
  readonly y = new Float32Array(MAX_ZONES);
  readonly z = new Float32Array(MAX_ZONES);
  readonly r = new Float32Array(MAX_ZONES);
  readonly life = new Float32Array(MAX_ZONES);
  readonly span = new Float32Array(MAX_ZONES);
  readonly tick = new Float32Array(MAX_ZONES);
  readonly dmg = new Float32Array(MAX_ZONES);

  get n(): number {
    return this.list.hi;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}

export const MAX_HAZARDS = 96;

/** Telegraphed enemy area attacks: a warning circle on the ground that detonates after a delay. */
export class Hazards {
  readonly list = new FreeList(MAX_HAZARDS);
  readonly alive = new Uint8Array(MAX_HAZARDS);
  /** 1 = explodes in the air too (cannot be jumped over). */
  readonly air = new Uint8Array(MAX_HAZARDS);
  readonly x = new Float32Array(MAX_HAZARDS);
  readonly y = new Float32Array(MAX_HAZARDS);
  readonly z = new Float32Array(MAX_HAZARDS);
  readonly r = new Float32Array(MAX_HAZARDS);
  readonly t = new Float32Array(MAX_HAZARDS);
  readonly delay = new Float32Array(MAX_HAZARDS);
  readonly dmg = new Float32Array(MAX_HAZARDS);

  get n(): number {
    return this.list.hi;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}

export const MAX_SHOTS = 96;

/** Enemy projectiles. */
export class Shots {
  readonly list = new FreeList(MAX_SHOTS);
  readonly alive = new Uint8Array(MAX_SHOTS);
  readonly x = new Float32Array(MAX_SHOTS);
  readonly y = new Float32Array(MAX_SHOTS);
  readonly z = new Float32Array(MAX_SHOTS);
  readonly px = new Float32Array(MAX_SHOTS);
  readonly py = new Float32Array(MAX_SHOTS);
  readonly pz = new Float32Array(MAX_SHOTS);
  readonly vx = new Float32Array(MAX_SHOTS);
  readonly vz = new Float32Array(MAX_SHOTS);
  readonly life = new Float32Array(MAX_SHOTS);
  readonly dmg = new Float32Array(MAX_SHOTS);

  get n(): number {
    return this.list.hi;
  }

  free(i: number): void {
    this.alive[i] = 0;
    this.list.free(i);
  }
}
