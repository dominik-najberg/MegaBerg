import { angleLerp } from '../core/math';
import type { Stats } from '../data/types';
import type { GameMap } from './terrain';

export interface InputState {
  /** Camera-space movement, -1..1. moveZ = +1 means "forward" (away from the camera). */
  moveX: number;
  moveZ: number;
  /** Edge: jump pressed this step. */
  jump: boolean;
  jumpHeld: boolean;
  /** Edge: dash pressed this step. */
  dash: boolean;
  /** Held: interact (E). */
  interact: boolean;
  camYaw: number;
}

export function emptyInput(): InputState {
  return { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
}

export const MOVE = {
  speed: 7.4,
  accelGround: 62,
  accelAir: 24,
  gravity: 30,
  jumpV: 11,
  airJumpV: 10,
  coyote: 0.12,
  jumpBuffer: 0.13,
  dashSpeed: 21,
  dashTime: 0.2,
  dashCooldown: 1.5,
  puddleSlow: 0.6,
} as const;

/** Result flags of one player step, consumed by the world to emit events. */
export const MoveFx = { None: 0, Jump: 1, AirJump: 2, Dash: 4, Land: 8 } as const;

export class Player {
  x = 0;
  y = 0;
  z = 0;
  px = 0;
  py = 0;
  pz = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  /** Facing angle of the model (0 = +Z). */
  yaw = 0;
  onGround = true;
  coyote = 0;
  jumpBuffer = 0;
  airJumps = 0;
  dashT = 0;
  dashCd = 0;
  dashX = 0;
  dashZ = 1;
  /** Seconds since the last landing (drives squash). */
  landT = 1;
  landImpact = 0;
  inPuddle = false;
  hp = 100;
  invuln = 0;
  /** Seconds since last damage taken (drives hurt flash). */
  hurtT = 1;
  readonly radius = 0.45;
  readonly height = 1.8;

  savePrev(): void {
    this.px = this.x;
    this.py = this.y;
    this.pz = this.z;
  }
}

/** Advances player movement by one fixed step. Returns MoveFx flags. */
export function stepPlayer(p: Player, input: InputState, stats: Stats, map: GameMap, dt: number): number {
  let fx: number = MoveFx.None;
  let mx = input.moveX;
  let mz = input.moveZ;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) {
    mx /= ml;
    mz /= ml;
  }
  const sin = Math.sin(input.camYaw);
  const cos = Math.cos(input.camYaw);
  // right = (cos, 0, -sin), forward = (-sin, 0, -cos)
  const wx = cos * mx - sin * mz;
  const wz = -sin * mx - cos * mz;
  const hasInput = ml > 0.05;

  p.inPuddle = p.onGround && map.inPuddle(p.x, p.z);
  const speed = MOVE.speed * stats.moveSpeed * (p.inPuddle ? MOVE.puddleSlow : 1);

  p.dashCd -= dt;
  if (input.dash && p.dashCd <= 0 && p.dashT <= 0) {
    if (hasInput) {
      const l = Math.hypot(wx, wz);
      p.dashX = wx / l;
      p.dashZ = wz / l;
    } else {
      p.dashX = Math.sin(p.yaw);
      p.dashZ = Math.cos(p.yaw);
    }
    p.dashT = MOVE.dashTime;
    p.dashCd = MOVE.dashCooldown;
    if (p.invuln < 0.3) p.invuln = 0.3;
    fx |= MoveFx.Dash;
  }

  if (p.dashT > 0) {
    p.dashT -= dt;
    const k = MOVE.dashSpeed * stats.moveSpeed * (p.inPuddle ? 0.8 : 1);
    p.vx = p.dashX * k;
    p.vz = p.dashZ * k;
    if (p.dashT <= 0) {
      p.vx = p.dashX * speed;
      p.vz = p.dashZ * speed;
    }
  } else {
    const tx = wx * speed;
    const tz = wz * speed;
    const acc = (p.onGround ? MOVE.accelGround : MOVE.accelAir) * dt;
    const dx = tx - p.vx;
    const dz = tz - p.vz;
    const dl = Math.hypot(dx, dz);
    if (dl <= acc) {
      p.vx = tx;
      p.vz = tz;
    } else {
      p.vx += (dx / dl) * acc;
      p.vz += (dz / dl) * acc;
    }
  }

  // Jumping with buffer + coyote time; extra jumps come from stats.
  if (input.jump) p.jumpBuffer = MOVE.jumpBuffer;
  if (p.jumpBuffer > 0) {
    p.jumpBuffer -= dt;
    if (p.onGround || p.coyote > 0) {
      p.vy = MOVE.jumpV;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
      fx |= MoveFx.Jump;
    } else if (p.airJumps < stats.extraJumps) {
      p.vy = MOVE.airJumpV;
      p.airJumps++;
      p.jumpBuffer = 0;
      fx |= MoveFx.AirJump;
    }
  }

  let nx = p.x + p.vx * dt;
  let nz = p.z + p.vz * dt;
  if (map.resolveCircle(nx, nz, p.radius)) {
    nx = map.outX;
    nz = map.outZ;
  }
  p.x = nx;
  p.z = nz;

  const ground = map.heightAt(p.x, p.z);
  p.landT += dt;
  if (p.onGround) {
    if (ground < p.y - 0.14) {
      // Ran off a crest faster than the ground falls away: become airborne, keep coyote time.
      p.onGround = false;
      p.coyote = MOVE.coyote;
      p.vy = 0;
    } else {
      p.y = ground;
      p.vy = 0;
    }
  } else {
    p.coyote -= dt;
    let g = MOVE.gravity;
    if (p.vy > 0 && !input.jumpHeld) g *= 2.1; // short hop when the key is released early
    p.vy -= g * dt;
    p.y += p.vy * dt;
    if (p.y <= ground && p.vy <= 0) {
      p.landImpact = Math.min(1, -p.vy / 18);
      p.y = ground;
      p.vy = 0;
      p.onGround = true;
      p.airJumps = 0;
      p.landT = 0;
      fx |= MoveFx.Land;
    }
  }

  const hs = Math.hypot(p.vx, p.vz);
  if (hs > 0.6) p.yaw = angleLerp(p.yaw, Math.atan2(p.vx, p.vz), 1 - Math.exp(-14 * dt));
  return fx;
}
