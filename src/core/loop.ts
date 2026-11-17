export const STEP = 1 / 60;
const MAX_STEPS = 5;

export interface LoopHandlers {
  /** One fixed simulation step. */
  step(dt: number): void;
  /** Render with interpolation factor alpha in [0,1) and real frame delta in seconds. */
  render(alpha: number, frameDt: number): void;
}

/** Fixed-timestep loop with render interpolation. */
export class Loop {
  private acc = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  timeScale = 1;

  constructor(private readonly handlers: LoopHandlers) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const frame = (now: number): void => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(frame);
      this.tick(now);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick(now: number): void {
    let frameDt = (now - this.last) / 1000;
    this.last = now;
    if (frameDt > 0.25) frameDt = 0.25;
    this.acc += frameDt * this.timeScale;
    let steps = 0;
    const maxSteps = Math.max(MAX_STEPS, Math.ceil(MAX_STEPS * this.timeScale));
    while (this.acc >= STEP && steps < maxSteps) {
      this.handlers.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (this.acc >= STEP) this.acc = 0; // drop backlog instead of spiralling
    this.handlers.render(this.acc / STEP, frameDt);
  }

  /** Debug/testing: run the simulation synchronously for the given number of seconds, then render once. */
  advance(seconds: number): void {
    const n = Math.round(seconds / STEP);
    for (let i = 0; i < n; i++) this.handlers.step(STEP);
    this.handlers.render(0, STEP);
  }
}
