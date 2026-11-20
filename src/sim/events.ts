/** Event types emitted by the simulation for rendering and audio. Fields a..d are event-specific. */
export const Ev = {
  Jump: 1,
  AirJump: 2,
  Dash: 3,
  /** a = impact 0..1 */
  Land: 4,
  /** a = damage, b = 0 normal / 1 crit / 2 burn, c = enemy height */
  Hit: 5,
  /** a = enemy type index, b = elite, c = radius */
  Kill: 6,
  /** a = value */
  Gem: 7,
  LevelUp: 8,
  /** a = damage */
  PlayerHit: 9,
  /** xyz = target, abc = source xyz, d = colour */
  Lightning: 10,
  /** xyz = origin, a = angle, b = arc, c = reach, d = colour */
  Sweep: 11,
  /** a = radius, b = colour */
  Explosion: 12,
  /** a = weapon kind code */
  Shoot: 13,
  Coin: 14,
  /** a = amount */
  Heal: 15,
  /** a = 1 for a gift chest */
  ChestOpen: 16,
  Shrine: 17,
  /** a = enemy type index */
  BossSpawn: 18,
  /** xyz = from, a = to x, b = to z */
  Teleport: 19,
  Death: 20,
  Win: 21,
  Evolve: 22,
  EnemyShoot: 23,
  /** xyz = centre, a = radius, b = 1 when it hit the player */
  Hazard: 24,
  Revive: 25,
  /** a = phase */
  BossPhase: 26,
  /** xyz = origin, a = dir x, b = dir z, c = length */
  ChargeWarn: 27,
  /** The magnet was picked up: every gem and coin flies to the hero. */
  Magnet: 28,
  /** Boss stomp / heavy impact: a = strength */
  Quake: 29,
  Fuse: 30,
  /** a = radius */
  Zone: 31,
  Pickup: 32,
  /** A landmark of the map was found: a = landmark index */
  Discover: 33,
  /** A timed bonus appeared near the hero: a = 0 magnet, 1 gift chest */
  Bonus: 34,
  /** The hero dodged a hit (evasion). */
  Dodge: 35,
  /** The shield took a whole hit; HP untouched. */
  ShieldHit: 36,
} as const;

export interface GameEvent {
  type: number;
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Fixed-size event buffer: the simulation emits, the renderer and audio consume. No allocations. */
export class EventQueue {
  readonly items: GameEvent[] = [];
  count = 0;

  constructor(capacity = 512) {
    for (let i = 0; i < capacity; i++) this.items.push({ type: 0, x: 0, y: 0, z: 0, a: 0, b: 0, c: 0, d: 0 });
  }

  emit(type: number, x: number, y: number, z: number, a = 0, b = 0, c = 0, d = 0): void {
    if (this.count >= this.items.length) return;
    const e = this.items[this.count++] as GameEvent;
    e.type = type;
    e.x = x;
    e.y = y;
    e.z = z;
    e.a = a;
    e.b = b;
    e.c = c;
    e.d = d;
  }

  clear(): void {
    this.count = 0;
  }
}
