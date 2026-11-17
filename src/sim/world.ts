import { Rng } from '../core/rng';
import { BASE_STATS, type Stats } from '../data/types';
import { Ev, EventQueue } from './events';
import { MoveFx, Player, stepPlayer, type InputState } from './player';
import { GameMap } from './terrain';

export const RUN_LENGTH = 600;

/** The whole simulation state of one run. Pure logic: no rendering, no DOM. */
export class World {
  readonly map: GameMap;
  readonly rng: Rng;
  readonly player = new Player();
  readonly events = new EventQueue();
  stats: Stats = { ...BASE_STATS };
  time = 0;

  constructor(map: GameMap, seed = 1) {
    this.map = map;
    this.rng = new Rng(seed);
    this.player.y = map.heightAt(0, 0);
    this.player.yaw = Math.PI;
    this.player.savePrev();
  }

  /** 0 (dusk) .. 1 (night) for the renderer. */
  dayTime(): number {
    return Math.min(1, this.time / (RUN_LENGTH * 0.85));
  }

  step(dt: number, input: InputState): void {
    const p = this.player;
    p.savePrev();
    this.time += dt;
    const fx = stepPlayer(p, input, this.stats, this.map, dt);
    if (fx & MoveFx.Jump) this.events.emit(Ev.Jump, p.x, p.y, p.z);
    if (fx & MoveFx.AirJump) this.events.emit(Ev.AirJump, p.x, p.y, p.z);
    if (fx & MoveFx.Dash) this.events.emit(Ev.Dash, p.x, p.y, p.z);
    if (fx & MoveFx.Land) this.events.emit(Ev.Land, p.x, p.y, p.z, p.landImpact);
  }
}
