export const Ev = {
  Jump: 1,
  AirJump: 2,
  Dash: 3,
  Land: 4,
} as const;

export interface GameEvent {
  type: number;
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  c: number;
}

/** Fixed-size event buffer: the simulation emits, the renderer and audio consume. No allocations. */
export class EventQueue {
  readonly items: GameEvent[] = [];
  count = 0;

  constructor(capacity = 384) {
    for (let i = 0; i < capacity; i++) this.items.push({ type: 0, x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 });
  }

  emit(type: number, x: number, y: number, z: number, a = 0, b = 0, c = 0): void {
    if (this.count >= this.items.length) return;
    const e = this.items[this.count++] as GameEvent;
    e.type = type;
    e.x = x;
    e.y = y;
    e.z = z;
    e.a = a;
    e.b = b;
    e.c = c;
  }

  clear(): void {
    this.count = 0;
  }
}
