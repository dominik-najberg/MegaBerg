import { Input } from './core/input';
import { Loop } from './core/loop';
import { Gfx } from './render/gfx';
import { emptyInput } from './sim/player';
import { GameMap } from './sim/terrain';
import { World } from './sim/world';

/** Glue between input, simulation, rendering and UI. */
export class Game {
  readonly input: Input;
  readonly map = new GameMap();
  readonly gfx: Gfx;
  readonly loop: Loop;
  world: World;
  private readonly simInput = emptyInput();
  private jumpQueued = false;
  private dashQueued = false;
  sensitivity = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.input = new Input(canvas);
    this.gfx = new Gfx(canvas, this.map, 2);
    this.world = new World(this.map, Date.now() & 0xffff);
    this.gfx.hero.setLook({ shirt: 0xe9e1cc, trim: 0xb3261e, pants: 0x5b3a2e, hair: 0xe2b34a, skin: 0xe0a985, build: 1, style: 'wojmir' });
    this.loop = new Loop({ step: (dt) => this.step(dt), render: (a, dt) => this.render(a, dt) });
    canvas.addEventListener('click', () => this.input.requestLock());
  }

  start(): void {
    this.loop.start();
  }

  private step(dt: number): void {
    const inp = this.input;
    const s = this.simInput;
    s.moveX = (inp.down('KeyD') ? 1 : 0) - (inp.down('KeyA') ? 1 : 0);
    s.moveZ = (inp.down('KeyW') ? 1 : 0) - (inp.down('KeyS') ? 1 : 0);
    s.jump = this.jumpQueued;
    s.dash = this.dashQueued;
    s.jumpHeld = inp.down('Space');
    s.interact = inp.down('KeyE');
    s.camYaw = this.gfx.camYaw;
    this.jumpQueued = false;
    this.dashQueued = false;
    this.world.step(dt, s);
    this.world.events.clear();
  }

  private render(alpha: number, frameDt: number): void {
    const inp = this.input;
    if (inp.consume('Space')) this.jumpQueued = true;
    if (inp.consume('ShiftLeft') || inp.consume('ShiftRight')) this.dashQueued = true;
    const sens = 0.0024 * this.sensitivity;
    let dYaw = -inp.mouseDX * sens;
    let dPitch = inp.mouseDY * sens;
    inp.mouseDX = 0;
    inp.mouseDY = 0;
    const keyRot = 2.2 * frameDt;
    if (inp.down('ArrowLeft')) dYaw += keyRot;
    if (inp.down('ArrowRight')) dYaw -= keyRot;
    if (inp.down('ArrowUp')) dPitch += keyRot * 0.6;
    if (inp.down('ArrowDown')) dPitch -= keyRot * 0.6;
    this.gfx.rotateCamera(dYaw, dPitch);
    this.gfx.render(this.world, alpha, frameDt);
  }
}
