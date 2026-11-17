import { TAU } from '../core/math';
import { ENEMIES, ENEMY_INDEX } from '../data/enemies';
import type { AiKind, EnemyDef } from '../data/types';
import { Ev } from './events';
import { PLAY_RADIUS } from './terrain';
import type { World } from './world';

const AI_CODE: Record<AiKind, number> = {
  chase: 0,
  fly: 1,
  kamikaze: 2,
  leaper: 3,
  charger: 4,
  ranged: 5,
  teleporter: 6,
  jaga: 7,
  poludnica: 8,
  leszy: 9,
  topielec: 0,
};

const CODES = ENEMIES.map((d) => AI_CODE[d.ai]);
const SEP = new Int32Array(64);
const T_CHOCHLIK = ENEMY_INDEX.chochlik as number;
const T_WILKOLAK = ENEMY_INDEX.wilkolak as number;
const T_STRZYGA = ENEMY_INDEX.strzyga as number;
const T_KRUK = ENEMY_INDEX.kruk as number;

/** Enemies further than this from the hero are moved back to the spawn ring. */
const LEASH = 62;

function summonAround(w: World, type: number, x: number, z: number, count: number, radius: number): void {
  for (let k = 0; k < count; k++) {
    const a = (k / count) * TAU + w.rng.next();
    let sx = x + Math.cos(a) * radius;
    let sz = z + Math.sin(a) * radius;
    const d = Math.hypot(sx, sz);
    if (d > PLAY_RADIUS - 1) {
      sx *= (PLAY_RADIUS - 1) / d;
      sz *= (PLAY_RADIUS - 1) / d;
    }
    w.spawnEnemy(type, sx, sz);
  }
}

/** Moves, animates state machines and applies contact damage for every enemy. */
export function updateEnemies(w: World, dt: number): void {
  const e = w.enemies;
  const p = w.player;
  const map = w.map;
  const rng = w.rng;
  const kbDecay = Math.exp(-7 * dt);
  const time = w.time;
  const pGround = map.heightAt(p.x, p.z);

  for (let i = 0; i < e.n; i++) {
    if (!e.alive[i]) continue;
    const type = e.type[i] as number;
    const def = ENEMIES[type] as EnemyDef;
    const code = CODES[type] as number;
    let x = e.x[i] as number;
    let z = e.z[i] as number;
    e.px[i] = x;
    e.py[i] = (e.y[i] as number) + (e.oy[i] as number);
    e.pz[i] = z;

    if ((e.flash[i] as number) > 0) e.flash[i] = (e.flash[i] as number) - dt;
    if ((e.atk[i] as number) > 0) e.atk[i] = (e.atk[i] as number) - dt;
    if ((e.spawnT[i] as number) > 0) e.spawnT[i] = (e.spawnT[i] as number) - dt;

    if ((e.burnT[i] as number) > 0) {
      e.burnT[i] = (e.burnT[i] as number) - dt;
      e.burnAcc[i] = (e.burnAcc[i] as number) + dt;
      if ((e.burnAcc[i] as number) >= 0.5) {
        e.burnAcc[i] = (e.burnAcc[i] as number) - 0.5;
        w.damageEnemy(i, (e.burnDps[i] as number) * 0.5, -1, 0, 0, 0, null);
        if (!e.alive[i]) continue;
      }
      if ((e.burnT[i] as number) <= 0) e.burnDps[i] = 0;
    }

    let sp = e.speed[i] as number;
    if ((e.slowT[i] as number) > 0) {
      e.slowT[i] = (e.slowT[i] as number) - dt;
      sp *= 1 - (e.slowK[i] as number);
      if ((e.slowT[i] as number) <= 0) e.slowK[i] = 0;
    }

    let dx = p.x - x;
    let dz = p.z - z;
    let dist = Math.hypot(dx, dz);
    if (dist > LEASH && !def.rank) {
      // Too far behind: re-enter from the ring around the hero.
      const a = rng.next() * TAU;
      let nx = p.x + Math.cos(a) * 30;
      let nz = p.z + Math.sin(a) * 30;
      const nd = Math.hypot(nx, nz);
      if (nd > PLAY_RADIUS - 1) {
        nx *= (PLAY_RADIUS - 1) / nd;
        nz *= (PLAY_RADIUS - 1) / nd;
      }
      x = nx;
      z = nz;
      e.px[i] = x;
      e.pz[i] = z;
      e.state[i] = 0;
      dx = p.x - x;
      dz = p.z - z;
      dist = Math.hypot(dx, dz);
    }
    const inv = dist > 0.001 ? 1 / dist : 0;
    const nx = dx * inv;
    const nz = dz * inv;
    let mvx = 0;
    let mvz = 0;
    let oy = def.flying ? 1.3 : 0;
    let contact = true;
    let contactMul = 1;
    let faceX = nx;
    let faceZ = nz;
    const stop = (e.radius[i] as number) + p.radius * 0.5;

    switch (code) {
      case 0: {
        // chase
        if (dist > stop) {
          mvx = nx * sp;
          mvz = nz * sp;
        }
        break;
      }
      case 1: {
        // fly: weave from side to side
        const wob = Math.sin(time * 2.4 + i * 1.7) * 0.5;
        if (dist > stop) {
          mvx = (nx - nz * wob) * sp;
          mvz = (nz + nx * wob) * sp;
        }
        oy = 1.15 + Math.sin(time * 5 + i) * 0.25;
        break;
      }
      case 2: {
        // kamikaze wisp
        contact = false;
        oy = 0.9 + Math.sin(time * 6 + i) * 0.2;
        if (e.state[i] === 0) {
          const wob = Math.sin(time * 4 + i * 2.1) * 0.7;
          mvx = (nx - nz * wob) * sp;
          mvz = (nz + nx * wob) * sp;
          if (dist < 2.3 && (e.spawnT[i] as number) <= 0) {
            e.state[i] = 1;
            e.t2[i] = 0.6;
            w.events.emit(Ev.Fuse, x, e.y[i] as number, z);
          }
        } else {
          e.t2[i] = (e.t2[i] as number) - dt;
          mvx = nx * sp * 0.25;
          mvz = nz * sp * 0.25;
          e.flash[i] = 0.06 + ((e.t2[i] as number) * 8) % 0.1;
          if ((e.t2[i] as number) <= 0) {
            w.events.emit(Ev.Explosion, x, (e.y[i] as number) + 0.8, z, 2.9, 0x6af0ff);
            if (dist < 2.9 + p.radius) w.hurtPlayer(e.dmg[i] as number);
            w.despawn(i);
            continue;
          }
        }
        break;
      }
      case 3: {
        // leaper (strzyga)
        e.t1[i] = (e.t1[i] as number) - dt;
        const st = e.state[i] as number;
        if (st === 0) {
          if (dist > stop) {
            mvx = nx * sp;
            mvz = nz * sp;
          }
          if (dist < 10 && dist > 3.5 && (e.t1[i] as number) <= 0) {
            e.state[i] = 1;
            e.t2[i] = 0.45;
          }
        } else if (st === 1) {
          e.t2[i] = (e.t2[i] as number) - dt;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 2;
            e.t2[i] = 0.62;
            e.ax[i] = (dx / 0.62) * 0.95;
            e.az[i] = (dz / 0.62) * 0.95;
          }
        } else {
          e.t2[i] = (e.t2[i] as number) - dt;
          mvx = e.ax[i] as number;
          mvz = e.az[i] as number;
          faceX = mvx;
          faceZ = mvz;
          oy = Math.sin(Math.PI * (1 - Math.max(0, e.t2[i] as number) / 0.62)) * 2.6;
          contactMul = 1.3;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            e.t1[i] = 3.2 + rng.next() * 1.5;
          }
        }
        break;
      }
      case 4: {
        // charger (wilkołak)
        e.t1[i] = (e.t1[i] as number) - dt;
        const st = e.state[i] as number;
        if (st === 0) {
          if (dist > stop) {
            mvx = nx * sp;
            mvz = nz * sp;
          }
          if (dist < 13 && dist > 4 && (e.t1[i] as number) <= 0) {
            e.state[i] = 1;
            e.t2[i] = 0.7;
            e.ax[i] = nx;
            e.az[i] = nz;
            w.events.emit(Ev.ChargeWarn, x, e.y[i] as number, z, nx, nz, 12);
          }
        } else if (st === 1) {
          e.t2[i] = (e.t2[i] as number) - dt;
          if ((e.t2[i] as number) > 0.3) {
            e.ax[i] = nx;
            e.az[i] = nz;
          }
          faceX = e.ax[i] as number;
          faceZ = e.az[i] as number;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 2;
            e.t2[i] = 0.95;
          }
        } else if (st === 2) {
          e.t2[i] = (e.t2[i] as number) - dt;
          mvx = (e.ax[i] as number) * (e.speed[i] as number) * 3.6;
          mvz = (e.az[i] as number) * (e.speed[i] as number) * 3.6;
          faceX = mvx;
          faceZ = mvz;
          contactMul = 1.4;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 3;
            e.t2[i] = 0.7;
          }
        } else {
          e.t2[i] = (e.t2[i] as number) - dt;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            e.t1[i] = 3.5 + rng.next() * 2;
          }
        }
        break;
      }
      case 5: {
        // ranged (bies): keep distance, strafe, throw
        e.t1[i] = (e.t1[i] as number) - dt;
        if (dist > 13) {
          mvx = nx * sp;
          mvz = nz * sp;
        } else if (dist < 8) {
          mvx = -nx * sp * 0.7;
          mvz = -nz * sp * 0.7;
        } else {
          const side = e.ax[i] as number;
          mvx = -nz * side * sp * 0.55;
          mvz = nx * side * sp * 0.55;
        }
        if ((e.t1[i] as number) <= 0 && dist < 19 && (e.spawnT[i] as number) <= 0) {
          e.t1[i] = 2.6 + rng.next() * 1.2;
          e.flash[i] = 0.1;
          w.addShot(x, (e.y[i] as number) + 1.5, z, nx * 11.5, nz * 11.5, e.dmg[i] as number);
        }
        break;
      }
      case 6: {
        // teleporter (licho)
        e.t1[i] = (e.t1[i] as number) - dt;
        if (dist > stop) {
          mvx = nx * sp;
          mvz = nz * sp;
        }
        if ((e.t1[i] as number) <= 0) {
          e.t1[i] = 4 + rng.next() * 2;
          if (dist > 5) {
            const a = rng.next() * TAU;
            const tx = p.x + Math.cos(a) * 5.5;
            const tz = p.z + Math.sin(a) * 5.5;
            if (map.isFree(tx, tz, 0.7)) {
              w.events.emit(Ev.Teleport, x, e.y[i] as number, z, tx, tz);
              x = tx;
              z = tz;
              e.px[i] = x;
              e.pz[i] = z;
              e.spawnT[i] = 0.65;
              e.vx[i] = 0;
              e.vz[i] = 0;
            }
          }
        }
        break;
      }
      case 7: {
        // Baba Jaga: circles the hero in her mortar dropping bombs, then swoops through him
        // (so melee builds can reach her too), and summons imps.
        const enraged = (e.hp[i] as number) < (e.maxHp[i] as number) * 0.5;
        const side = e.ax[i] as number;
        e.t2[i] = (e.t2[i] as number) - dt;
        if (e.state[i] === 0) {
          oy = 2.2 + Math.sin(time * 2.2) * 0.4;
          const want = 8.5;
          const radial = Math.max(-1, Math.min(1, (dist - want) / 4));
          mvx = (nx * radial - nz * side * 0.85) * sp;
          mvz = (nz * radial + nx * side * 0.85) * sp;
          faceX = mvx;
          faceZ = mvz;
          e.t1[i] = (e.t1[i] as number) - dt;
          if ((e.t1[i] as number) <= 0 && (e.spawnT[i] as number) <= 0) {
            e.t1[i] = enraged ? 1.6 : 2.4;
            const lead = 0.55;
            const hx = p.x + p.vx * lead;
            const hz = p.z + p.vz * lead;
            w.addHazard(hx, hz, 3, 1.1, (e.dmg[i] as number) * 1.1, true);
            if (enraged) {
              const a = rng.next() * TAU;
              w.addHazard(hx + Math.cos(a) * 4.2, hz + Math.sin(a) * 4.2, 2.6, 1.3, (e.dmg[i] as number) * 1.1, true);
              w.addHazard(hx - Math.cos(a) * 4.2, hz - Math.sin(a) * 4.2, 2.6, 1.5, (e.dmg[i] as number) * 1.1, true);
            }
            w.events.emit(Ev.EnemyShoot, x, (e.y[i] as number) + oy, z);
          }
          if ((e.t2[i] as number) <= 0) {
            // Start a swoop: lock the direction through the hero.
            e.state[i] = 1;
            e.t2[i] = 2.0;
            e.az[i] = Math.atan2(nx, nz);
            w.events.emit(Ev.ChargeWarn, x, e.y[i] as number, z, nx, nz, 14);
          }
        } else {
          // Swoop low along the locked direction, then climb back into orbit.
          const k = Math.max(0, e.t2[i] as number) / 2.0;
          oy = 0.5 + Math.abs(k - 0.5) * 3.4;
          const a = e.az[i] as number;
          const speed = k > 0.85 ? 2 : 13;
          mvx = Math.sin(a) * speed;
          mvz = Math.cos(a) * speed;
          faceX = mvx;
          faceZ = mvz;
          contactMul = 1.2;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            e.t2[i] = enraged ? 4 : 5.5;
            e.ax[i] = -side;
          }
        }
        e.t3[i] = (e.t3[i] as number) - dt;
        if ((e.t3[i] as number) <= 0) {
          e.t3[i] = 11;
          summonAround(w, T_CHOCHLIK, x, z, enraged ? 8 : 5, 2.5);
        }
        break;
      }
      case 8: {
        // Południca: scythe spin up close, dash from afar, scorching circles around the hero.
        e.t1[i] = (e.t1[i] as number) - dt;
        e.t3[i] = (e.t3[i] as number) - dt;
        const st = e.state[i] as number;
        if (st === 0) {
          if (dist > stop) {
            mvx = nx * sp;
            mvz = nz * sp;
          }
          if ((e.t1[i] as number) <= 0 && (e.spawnT[i] as number) <= 0) {
            if (dist < 6.5) {
              e.state[i] = 1;
              e.t2[i] = 1.05;
              w.addHazard(x, z, 5.4, 1.05, (e.dmg[i] as number) * 1.3);
            } else if (dist < 22) {
              e.state[i] = 2;
              e.t2[i] = 0.65;
              e.ax[i] = nx;
              e.az[i] = nz;
              w.events.emit(Ev.ChargeWarn, x, e.y[i] as number, z, nx, nz, 15);
            }
          }
        } else if (st === 1) {
          e.t2[i] = (e.t2[i] as number) - dt;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            e.t1[i] = 2.3;
          }
        } else if (st === 2) {
          e.t2[i] = (e.t2[i] as number) - dt;
          faceX = e.ax[i] as number;
          faceZ = e.az[i] as number;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 3;
            e.t2[i] = 0.75;
          }
        } else {
          e.t2[i] = (e.t2[i] as number) - dt;
          mvx = (e.ax[i] as number) * 20;
          mvz = (e.az[i] as number) * 20;
          faceX = mvx;
          faceZ = mvz;
          contactMul = 1.3;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            e.t1[i] = 2.4;
          }
        }
        if ((e.t3[i] as number) <= 0) {
          e.t3[i] = 5.5;
          for (let k = 0; k < 4; k++) {
            const a = rng.next() * TAU;
            const d = k === 0 ? 0 : 2.5 + rng.next() * 5;
            w.addHazard(p.x + Math.cos(a) * d, p.z + Math.sin(a) * d, 2.6, 1.25 + k * 0.12, (e.dmg[i] as number) * 0.9);
          }
        }
        break;
      }
      default: {
        // Leszy: slow giant with telegraphed area attacks; three phases by health.
        const frac = (e.hp[i] as number) / (e.maxHp[i] as number);
        const phase = frac > 0.66 ? 1 : frac > 0.33 ? 2 : 3;
        if (phase !== w.bossPhase) {
          w.bossPhase = phase;
          w.hitstop = 0.25;
          w.events.emit(Ev.BossPhase, x, e.y[i] as number, z, phase);
          w.announce.push(phase === 2 ? 'Leszy wzywa bór na pomoc!' : 'Leszy wpada w szał!');
          e.t1[i] = 1.2;
          summonAround(w, phase === 2 ? T_STRZYGA : T_WILKOLAK, x, z, 6, 6);
        }
        const dmg = e.dmg[i] as number;
        const st = e.state[i] as number;
        e.t1[i] = (e.t1[i] as number) - dt;
        e.t3[i] = (e.t3[i] as number) - dt;
        if (st === 0) {
          if (dist > stop) {
            const k = phase === 3 ? 1.4 : phase === 2 ? 1.15 : 1;
            mvx = nx * sp * k;
            mvz = nz * sp * k;
          }
          if ((e.t1[i] as number) <= 0 && (e.spawnT[i] as number) <= 0) {
            e.t1[i] = phase === 1 ? 3.4 : phase === 2 ? 2.8 : 2.1;
            const roll = rng.next();
            if (dist < 9.5) {
              // Stomp: big circle around the boss.
              e.state[i] = 1;
              e.t2[i] = 1.15;
              w.addHazard(x, z, 9, 1.15, dmg * 1.2);
            } else if (phase >= 3 && roll < 0.3) {
              e.state[i] = 2;
              e.t2[i] = 0.9;
              e.ax[i] = nx;
              e.az[i] = nz;
              w.events.emit(Ev.ChargeWarn, x, e.y[i] as number, z, nx, nz, 18);
            } else if (phase >= 2 && roll < 0.55) {
              // Thorn ring: jump out or get caught by the follow-up blast in the middle.
              for (let k = 0; k < 10; k++) {
                const a = (k / 10) * TAU;
                w.addHazard(p.x + Math.cos(a) * 6.5, p.z + Math.sin(a) * 6.5, 2.4, 1.3, dmg * 0.8);
              }
              w.addHazard(p.x, p.z, 4.6, 2.3, dmg);
            } else {
              // Roots erupt under and around the hero.
              const n = phase === 1 ? 5 : phase === 2 ? 8 : 11;
              for (let k = 0; k < n; k++) {
                const a = rng.next() * TAU;
                const d = k === 0 ? 0 : 2 + rng.next() * 8;
                const lead = k === 0 ? 0.4 : 0;
                w.addHazard(p.x + p.vx * lead + Math.cos(a) * d, p.z + p.vz * lead + Math.sin(a) * d, 2.6, 1.0 + k * 0.14, dmg * 0.9);
              }
            }
          }
          if (phase >= 2 && (e.t3[i] as number) <= 0) {
            e.t3[i] = 13;
            summonAround(w, rng.next() < 0.5 ? T_KRUK : T_STRZYGA, x, z, 3 + phase * 2, 7);
          }
        } else if (st === 1) {
          e.t2[i] = (e.t2[i] as number) - dt;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            w.events.emit(Ev.Quake, x, e.y[i] as number, z, 1);
          }
        } else if (st === 2) {
          e.t2[i] = (e.t2[i] as number) - dt;
          faceX = e.ax[i] as number;
          faceZ = e.az[i] as number;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 3;
            e.t2[i] = 1.25;
          }
        } else {
          e.t2[i] = (e.t2[i] as number) - dt;
          mvx = (e.ax[i] as number) * 14;
          mvz = (e.az[i] as number) * 14;
          faceX = mvx;
          faceZ = mvz;
          contactMul = 1.3;
          if ((e.t2[i] as number) <= 0) {
            e.state[i] = 0;
            w.events.emit(Ev.Quake, x, e.y[i] as number, z, 0.6);
          }
        }
        break;
      }
    }

    // Integrate movement + knockback.
    x += (mvx + (e.vx[i] as number)) * dt;
    z += (mvz + (e.vz[i] as number)) * dt;
    e.vx[i] = (e.vx[i] as number) * kbDecay;
    e.vz[i] = (e.vz[i] as number) * kbDecay;

    // Soft separation from neighbours so crowds do not collapse into one point.
    const ri = e.radius[i] as number;
    if (def.weight < 0.9) {
      const n = w.grid.query(x, z, ri + 0.8, SEP);
      const max = n < 20 ? n : 20;
      for (let k = 0; k < max; k++) {
        const j = SEP[k] as number;
        if (j === i || !e.alive[j]) continue;
        const ddx = x - (e.x[j] as number);
        const ddz = z - (e.z[j] as number);
        const min = (ri + (e.radius[j] as number)) * 0.85;
        const d2 = ddx * ddx + ddz * ddz;
        if (d2 < min * min && d2 > 1e-5) {
          const d = Math.sqrt(d2);
          const push = (min - d) * 0.45;
          x += (ddx / d) * push;
          z += (ddz / d) * push;
        }
      }
    }

    if (!def.flying && oy < 0.5) {
      if (map.resolveCircle(x, z, ri * 0.8)) {
        x = map.outX;
        z = map.outZ;
      }
    } else {
      const d = Math.hypot(x, z);
      if (d > PLAY_RADIUS + 3) {
        x *= (PLAY_RADIUS + 3) / d;
        z *= (PLAY_RADIUS + 3) / d;
      }
    }
    e.x[i] = x;
    e.z[i] = z;
    e.y[i] = map.heightAt(x, z);
    e.oy[i] = oy;
    if (faceX !== 0 || faceZ !== 0) {
      const target = Math.atan2(faceX, faceZ);
      let dy = target - (e.yaw[i] as number);
      dy = ((dy + Math.PI) % TAU + TAU) % TAU - Math.PI;
      e.yaw[i] = (e.yaw[i] as number) + dy * Math.min(1, dt * 9);
    }

    // Contact damage: bodies must overlap vertically too, so small enemies can be jumped over.
    if (contact && (e.atk[i] as number) <= 0 && (e.spawnT[i] as number) <= 0) {
      const cdx = p.x - x;
      const cdz = p.z - z;
      const reach = ri + p.radius + 0.12;
      if (cdx * cdx + cdz * cdz < reach * reach) {
        const bottom = (e.y[i] as number) + oy - (def.flying ? 0.6 : 0);
        const top = (e.y[i] as number) + oy + def.height * (e.elite[i] ? 1.35 : 1);
        const feet = p.onGround ? pGround : p.y;
        if (feet < top && feet + p.height > bottom) {
          w.hurtPlayer((e.dmg[i] as number) * contactMul);
          e.atk[i] = 1.0;
        }
      }
    }
  }
}
