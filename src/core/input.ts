const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);

/** Keyboard + mouse (pointer lock) state. Uses KeyboardEvent.code so layouts do not matter. */
export class Input {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;
  locked = false;
  /** Called on any key press (used by menus for shortcuts). */
  onKey: ((code: string) => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.held.add(e.code);
      this.pressed.add(e.code);
      this.onKey?.(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
    window.addEventListener('blur', () => this.held.clear());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas;
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
  }

  down(code: string): boolean {
    return this.held.has(code);
  }

  /** True once per physical key press. */
  consume(code: string): boolean {
    return this.pressed.delete(code);
  }

  clearPressed(): void {
    this.pressed.clear();
  }

  requestLock(): void {
    if (this.locked) return;
    try {
      const p = this.canvas.requestPointerLock() as unknown;
      if (p && typeof (p as Promise<void>).catch === 'function') (p as Promise<void>).catch(() => undefined);
    } catch {
      // Pointer lock is optional: arrow keys rotate the camera as a fallback.
    }
  }

  exitLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }
}
