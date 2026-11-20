import { angleLerp, TAU, wrapAngle } from '../core/math';
import type { WeaponKind, WeaponStats } from '../data/types';
import { Ev } from './events';
import { ProjKind, WEAPON_SLOTS } from './pools';
import { attackInterval } from './stats';
import type { Raven, WeaponInst, World } from './world';

const PICKS = new Int32Array(32);
/** Shortest interval between attacks of a weapon kind (seconds); faster attack speed does nothing below it. */
export function minInterval(kind: WeaponKind): number {
  return kind === 'summon' ? 0.15 : 0.12;
}

/** Longest distance a projectile moves between two collision checks (metres). */
const PROJ_SUBSTEP = 0.6;

function fireProjectile(
  w: World,
  kind: number,
  inst: WeaponInst,
  angle: number,
  dmg: number,
  speed: number,
  life: number,
  radius: number,
  left: number,
): void {
  const pr = w.projectiles;
  const i = pr.alloc();
  if (i < 0) return;
  const p = w.player;
  pr.kind[i] = kind;
  pr.slot[i] = inst.slot;
  pr.x[i] = p.x + Math.sin(angle) * 0.6;
  pr.z[i] = p.z + Math.cos(angle) * 0.6;
  pr.y[i] = p.y + 1.1;
  pr.px[i] = pr.x[i] as number;
  pr.py[i] = pr.y[i] as number;
  pr.pz[i] = pr.z[i] as number;
  pr.vx[i] = Math.sin(angle) * speed;
  pr.vz[i] = Math.cos(angle) * speed;
  pr.life[i] = life;
  pr.dmg[i] = dmg;
  pr.radius[i] = radius;
  pr.left[i] = left;
}

function sweep(w: World, inst: WeaponInst, angle: number, dmg: number, area: number): void {
  const p = w.player;
  const e = w.enemies;
  const st = inst.stats;
  const half = st.arc / 2;
  const n = w.collect(p.x, p.z, area);
  for (let k = 0; k < n; k++) {
    const j = w.bufA[k] as number;
    const dx = (e.x[j] as number) - p.x;
    const dz = (e.z[j] as number) - p.z;
    const d = Math.hypot(dx, dz);
    if (d > 1.3 && half < 3.1 && Math.abs(wrapAngle(Math.atan2(dx, dz) - angle)) > half) continue;
    const inv = d > 0.001 ? 1 / d : 0;
    w.damageEnemy(j, dmg, inst.slot, dx * inv, dz * inv, st.knockback, st);
  }
  w.events.emit(Ev.Sweep, p.x, p.y + 0.9, p.z, angle, st.arc, area, inst.def.color);
}

function updateRavens(w: World, inst: WeaponInst, count: number, dmg: number, dt: number): void {
  const p = w.player;
  const e = w.enemies;
  const st = inst.stats;
  const ravens = inst.ravens;
  while (ravens.length < count) {
    ravens.push({ x: p.x, y: p.y + 2.5, z: p.z, px: p.x, py: p.y + 2.5, pz: p.z, yaw: 0, state: 0, target: -1, cd: 0.3 + ravens.length * 0.2, phase: ravens.length * 2.1 });
  }
  if (ravens.length > count) ravens.length = count;
  const cd = Math.max(minInterval('summon'), st.cooldown * attackInterval(w.stats));
  for (let k = 0; k < ravens.length; k++) {
    const r = ravens[k] as Raven;
    r.px = r.x;
    r.py = r.y;
    r.pz = r.z;
    const a = w.time * 1.7 + r.phase;
    const hx = p.x + Math.cos(a) * 2.1;
    const hy = p.y + 2.7 + Math.sin(a * 1.3) * 0.3;
    const hz = p.z + Math.sin(a) * 2.1;
    let tx = hx;
    let ty = hy;
    let tz = hz;
    let speed = st.speed;
    if (r.state === 0) {
      r.cd -= dt;
      if (r.cd <= 0) {
        const t = w.randomInRange(p.x, p.z, st.range);
        if (t >= 0) {
          r.target = t;
          r.state = 1;
        } else {
          r.cd = 0.25;
        }
      }
      speed = 12;
    } else if (r.state === 1) {
      const t = r.target;
      if (t < 0 || !e.alive[t]) {
        r.state = 0;
        r.cd = 0.15;
      } else {
        tx = e.x[t] as number;
        ty = (e.y[t] as number) + (e.oy[t] as number) + 0.8;
        tz = e.z[t] as number;
        const d = Math.hypot(tx - r.x, ty - r.y, tz - r.z);
        if (d < 0.9 + (e.radius[t] as number)) {
          const kx = tx - p.x;
          const kz = tz - p.z;
          const kl = Math.hypot(kx, kz) || 1;
          w.damageEnemy(t, dmg, inst.slot, kx / kl, kz / kl, st.knockback, st);
          r.state = 2;
        }
      }
    } else {
      if (Math.hypot(hx - r.x, hy - r.y, hz - r.z) < 1.6) {
        r.state = 0;
        r.cd = cd;
      }
    }
    const dx = tx - r.x;
    const dy = ty - r.y;
    const dz = tz - r.z;
    const d = Math.hypot(dx, dy, dz);
    const stepLen = speed * dt;
    if (d <= stepLen || d < 0.001) {
      r.x = tx;
      r.y = ty;
      r.z = tz;
    } else {
      r.x += (dx / d) * stepLen;
      r.y += (dy / d) * stepLen;
      r.z += (dz / d) * stepLen;
      r.yaw = Math.atan2(dx, dz);
    }
  }
}

/** Runs every weapon's behaviour for one step. Behaviour is selected by `def.kind`. */
export function updateWeapons(w: World, dt: number): void {
  const p = w.player;
  const e = w.enemies;
  const s = w.stats;
  const extra = Math.floor(s.projectiles + 1e-6);
  for (let wi = 0; wi < w.weapons.length; wi++) {
    const inst = w.weapons[wi] as WeaponInst;
    const st = inst.stats;
    const dmg = st.damage * (1 + inst.bonus) * s.damage;
    const cd = Math.max(minInterval(inst.def.kind), st.cooldown * attackInterval(s));
    const area = st.area * s.area;
    const dur = st.duration * s.duration;
    const pspeed = st.speed * s.projectileSpeed;
    const slot = inst.slot;
    switch (inst.def.kind) {
      case 'orbit': {
        const count = st.count + extra;
        inst.fxCount = count;
        inst.fxArea = area;
        if (st.cooldown <= 0) {
          inst.active = 1;
        } else if (inst.active > 0) {
          inst.active -= dt;
          if (inst.active <= 0) inst.timer = cd;
        } else {
          inst.timer -= dt;
          if (inst.timer <= 0) {
            inst.active = dur;
            inst.span = dur;
            w.events.emit(Ev.Shoot, p.x, p.y, p.z, 0);
          }
        }
        if (inst.active > 0) {
          inst.angle += st.speed * dt;
          for (let k = 0; k < count; k++) {
            const a = inst.angle + (k * TAU) / count;
            const bx = p.x + Math.sin(a) * area;
            const bz = p.z + Math.cos(a) * area;
            const n = w.collect(bx, bz, 0.95);
            for (let q = 0; q < n; q++) {
              const j = w.bufA[q] as number;
              const hi = j * WEAPON_SLOTS + slot;
              if (w.time - (e.hitT[hi] as number) < 0.45) continue;
              e.hitT[hi] = w.time;
              const dx = (e.x[j] as number) - p.x;
              const dz = (e.z[j] as number) - p.z;
              const d = Math.hypot(dx, dz) || 1;
              w.damageEnemy(j, dmg, slot, dx / d, dz / d, st.knockback, st);
            }
          }
        }
        break;
      }
      case 'bolt': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const t = w.nearest(p.x, p.z, st.range);
          if (t < 0) {
            inst.timer = 0.15;
            break;
          }
          inst.timer = cd;
          const count = st.count + extra;
          const aim = Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z);
          const full = st.arc > 6;
          const spread = full ? TAU / count : count > 1 ? (st.arc > 0 ? st.arc : 0.32) / (count - 1) : 0;
          for (let k = 0; k < count; k++) {
            const a = full ? aim + k * spread : aim + (k - (count - 1) / 2) * spread;
            fireProjectile(w, ProjKind.Bolt, inst, a, dmg, pspeed, dur, st.area * Math.sqrt(s.area), st.pierce);
          }
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 1);
        }
        break;
      }
      case 'lightning': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const n = w.collect(p.x, p.z, st.range * Math.sqrt(s.area));
          if (n === 0) {
            inst.timer = 0.2;
            break;
          }
          inst.timer = cd;
          const count = Math.min(PICKS.length, st.count + extra);
          for (let k = 0; k < count; k++) PICKS[k] = w.bufA[w.rng.int(n)] as number;
          for (let k = 0; k < count; k++) {
            let j = PICKS[k] as number;
            if (!e.alive[j]) continue;
            let x = e.x[j] as number;
            let z = e.z[j] as number;
            let y = e.y[j] as number;
            w.events.emit(Ev.Lightning, x, y, z, x + 1.5, y + 22, z - 1, inst.def.color);
            w.damageCircle(x, z, area, dmg, slot, st.knockback, st);
            for (let c = 0; c < st.chain; c++) {
              const nj = w.nearest(x, z, 9, j);
              if (nj < 0) break;
              const nx = e.x[nj] as number;
              const nz = e.z[nj] as number;
              const ny = e.y[nj] as number;
              w.events.emit(Ev.Lightning, nx, ny, nz, x, y + 1, z, inst.def.color);
              w.damageCircle(nx, nz, area * 0.6, dmg * 0.6, slot, 0, st);
              j = nj;
              x = nx;
              z = nz;
              y = ny;
            }
          }
        }
        break;
      }
      case 'sweep': {
        inst.fxArea = area;
        inst.timer -= dt;
        if (inst.timer <= 0) {
          inst.timer = cd;
          const t = w.nearest(p.x, p.z, area * 1.25);
          const aim = t >= 0 ? Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z) : p.yaw;
          sweep(w, inst, aim, dmg, area);
          inst.queue = st.count - 1;
          // Follow-up swings fit inside the attack interval, so high attack speed never cuts them off.
          inst.qT = Math.min(0.2, cd / Math.max(1, st.count));
          inst.angle = aim + Math.PI;
        }
        if (inst.queue > 0) {
          inst.qT -= dt;
          if (inst.qT <= 0) {
            sweep(w, inst, inst.angle, dmg, area);
            inst.angle += Math.PI / 2;
            inst.queue--;
            inst.qT = Math.min(0.2, cd / Math.max(1, st.count));
          }
        }
        break;
      }
      case 'aura': {
        inst.fxArea = area;
        inst.timer -= dt;
        if (inst.timer <= 0) {
          inst.timer = cd;
          const n = w.collect(p.x, p.z, area);
          for (let k = 0; k < n; k++) w.damageEnemy(w.bufA[k] as number, dmg, slot, 0, 0, 0, st);
        }
        break;
      }
      case 'bounce': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const t = w.nearest(p.x, p.z, st.range);
          if (t < 0) {
            inst.timer = 0.15;
            break;
          }
          inst.timer = cd;
          const count = st.count + extra;
          const aim = Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z);
          for (let k = 0; k < count; k++) {
            const a = aim + (k - (count - 1) / 2) * 0.22;
            fireProjectile(w, ProjKind.Bounce, inst, a, dmg, pspeed, dur, st.area, st.bounces);
          }
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 2);
        }
        break;
      }
      case 'summon': {
        updateRavens(w, inst, st.count + extra, dmg, dt);
        break;
      }
      case 'cone': {
        inst.fxArea = area;
        if (inst.active > 0) {
          inst.active -= dt;
          const t = w.nearest(p.x, p.z, area * 1.1);
          if (t >= 0 && st.arc < 6) {
            const aim = Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z);
            inst.angle = angleLerp(inst.angle, aim, Math.min(1, dt * 5));
          }
          inst.qT -= dt;
          if (inst.qT <= 0) {
            inst.qT = 0.2;
            const half = st.arc / 2;
            const n = w.collect(p.x, p.z, area);
            for (let k = 0; k < n; k++) {
              const j = w.bufA[k] as number;
              const dx = (e.x[j] as number) - p.x;
              const dz = (e.z[j] as number) - p.z;
              if (half < 3.1 && Math.hypot(dx, dz) > 1.2 && Math.abs(wrapAngle(Math.atan2(dx, dz) - inst.angle)) > half) continue;
              w.damageEnemy(j, dmg, slot, 0, 0, 0, st);
            }
          }
          if (inst.active <= 0) inst.timer = cd;
        } else {
          inst.timer -= dt;
          if (inst.timer <= 0) {
            const t = w.nearest(p.x, p.z, area * 1.2);
            if (t < 0) {
              inst.timer = 0.2;
              break;
            }
            inst.angle = Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z);
            inst.active = dur;
            inst.span = dur;
            inst.qT = 0;
            w.events.emit(Ev.Shoot, p.x, p.y, p.z, 3);
          }
        }
        break;
      }
      case 'lob': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const n = w.collect(p.x, p.z, st.range);
          if (n === 0) {
            inst.timer = 0.2;
            break;
          }
          inst.timer = cd;
          const count = Math.min(PICKS.length, st.count + extra);
          for (let k = 0; k < count; k++) PICKS[k] = w.bufA[w.rng.int(n)] as number;
          const pr = w.projectiles;
          for (let k = 0; k < count; k++) {
            const j = PICKS[k] as number;
            const i = pr.alloc();
            if (i < 0) break;
            pr.kind[i] = ProjKind.Lob;
            pr.slot[i] = slot;
            pr.sx[i] = p.x;
            pr.sy[i] = p.y + 1.5;
            pr.sz[i] = p.z;
            // Reuse vx/vz as the landing point.
            pr.vx[i] = (e.x[j] as number) + w.rng.range(-0.8, 0.8) * k;
            pr.vz[i] = (e.z[j] as number) + w.rng.range(-0.8, 0.8) * k;
            pr.x[i] = p.x;
            pr.y[i] = p.y + 1.5;
            pr.z[i] = p.z;
            pr.px[i] = p.x;
            pr.py[i] = p.y + 1.5;
            pr.pz[i] = p.z;
            pr.span[i] = 0.6;
            pr.life[i] = 0.6;
            pr.dmg[i] = dmg;
            pr.radius[i] = area;
            pr.left[i] = 0;
          }
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 4);
        }
        break;
      }
    }
  }
}

/** Moves player projectiles and resolves their hits. */
export function updateProjectiles(w: World, dt: number): void {
  const pr = w.projectiles;
  const e = w.enemies;
  const map = w.map;
  for (let i = 0; i < pr.n; i++) {
    if (!pr.alive[i]) continue;
    const slot = pr.slot[i] as number;
    const inst = w.weapons[slot];
    if (!inst) {
      pr.free(i);
      continue;
    }
    const st: WeaponStats = inst.stats;
    pr.px[i] = pr.x[i] as number;
    pr.py[i] = pr.y[i] as number;
    pr.pz[i] = pr.z[i] as number;
    pr.life[i] = (pr.life[i] as number) - dt;
    const kind = pr.kind[i] as number;

    if (kind === ProjKind.Lob) {
      const t = 1 - Math.max(0, pr.life[i] as number) / (pr.span[i] as number);
      const tx = pr.vx[i] as number;
      const tz = pr.vz[i] as number;
      pr.x[i] = (pr.sx[i] as number) + (tx - (pr.sx[i] as number)) * t;
      pr.z[i] = (pr.sz[i] as number) + (tz - (pr.sz[i] as number)) * t;
      const gy = map.heightAt(tx, tz);
      pr.y[i] = (pr.sy[i] as number) + (gy - (pr.sy[i] as number)) * t + Math.sin(Math.PI * t) * 3.2;
      if ((pr.life[i] as number) <= 0) {
        w.addZone(tx, tz, pr.radius[i] as number, st.duration * w.stats.duration, pr.dmg[i] as number, slot);
        w.damageCircle(tx, tz, pr.radius[i] as number, pr.dmg[i] as number, slot, 2, st);
        pr.free(i);
      }
      continue;
    }

    if ((pr.life[i] as number) <= 0) {
      pr.free(i);
      continue;
    }
    // Fast projectiles move in substeps, so a high projectile-speed stat never skips over an enemy.
    // At base speeds (< PROJ_SUBSTEP × 60 m/s) this is a single step, exactly as before.
    const steps = Math.max(1, Math.ceil((Math.hypot(pr.vx[i] as number, pr.vz[i] as number) * dt) / PROJ_SUBSTEP));
    const sdt = dt / steps;
    let flying = true;
    for (let sub = 0; sub < steps && flying; sub++) {
      const x = (pr.x[i] as number) + (pr.vx[i] as number) * sdt;
      const z = (pr.z[i] as number) + (pr.vz[i] as number) * sdt;
      pr.x[i] = x;
      pr.z[i] = z;
      pr.y[i] = map.heightAt(x, z) + 1.1;
      const n = w.collect(x, z, pr.radius[i] as number);
      const speed = Math.hypot(pr.vx[i] as number, pr.vz[i] as number) || 1;
      const dirX = (pr.vx[i] as number) / speed;
      const dirZ = (pr.vz[i] as number) / speed;
      for (let k = 0; k < n; k++) {
        const j = w.bufA[k] as number;
        if (j === pr.last[i] || !e.alive[j]) continue;
        if (kind === ProjKind.Bolt && st.pierce > 0) {
          const hi = j * WEAPON_SLOTS + slot;
          if (w.time - (e.hitT[hi] as number) < 0.3) continue;
          e.hitT[hi] = w.time;
        }
        const ex = e.x[j] as number;
        const ez = e.z[j] as number;
        w.damageEnemy(j, pr.dmg[i] as number, slot, dirX, dirZ, st.knockback, st);
        pr.last[i] = j;
        if (st.explode > 0) {
          const r = st.explode * w.stats.area;
          w.damageCircle(x, z, r, (pr.dmg[i] as number) * 0.6, slot, 3, st);
          w.events.emit(Ev.Explosion, x, pr.y[i] as number, z, r, inst.def.color);
        }
        if (kind === ProjKind.Bounce) {
          pr.left[i] = (pr.left[i] as number) - 1;
          const nj = (pr.left[i] as number) >= 0 ? w.nearest(ex, ez, 11, j) : -1;
          if (nj < 0) {
            pr.free(i);
          } else {
            const dx = (e.x[nj] as number) - x;
            const dz = (e.z[nj] as number) - z;
            const d = Math.hypot(dx, dz) || 1;
            pr.vx[i] = (dx / d) * speed;
            pr.vz[i] = (dz / d) * speed;
            pr.life[i] = st.duration * w.stats.duration;
          }
          flying = false;
          break;
        }
        pr.left[i] = (pr.left[i] as number) - 1;
        if ((pr.left[i] as number) < 0) {
          pr.free(i);
          flying = false;
          break;
        }
      }
    }
  }
}

/** Ticks lingering damage zones. */
export function updateZones(w: World, dt: number): void {
  const zn = w.zones;
  for (let i = 0; i < zn.n; i++) {
    if (!zn.alive[i]) continue;
    zn.life[i] = (zn.life[i] as number) - dt;
    if ((zn.life[i] as number) <= 0) {
      zn.free(i);
      continue;
    }
    zn.tick[i] = (zn.tick[i] as number) - dt;
    if ((zn.tick[i] as number) <= 0) {
      zn.tick[i] = 0.4;
      const inst = w.weapons[zn.slot[i] as number];
      w.damageCircle(zn.x[i] as number, zn.z[i] as number, zn.r[i] as number, zn.dmg[i] as number, zn.slot[i] as number, 0, inst ? inst.stats : null);
    }
  }
}
