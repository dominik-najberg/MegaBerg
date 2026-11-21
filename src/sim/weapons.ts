import { angleLerp, TAU, wrapAngle } from '../core/math';
import { ENEMIES } from '../data/enemies';
import type { EnemyDef, WeaponKind, WeaponStats } from '../data/types';
import { DICE_MEAN, LOWHP_BONUS, LOWHP_BONUS_EVOLVED, REAP_AREA, REAP_MUL, REAP_MUL_EVOLVED } from '../data/weapons';
import { Ev } from './events';
import { ProjKind, WEAPON_SLOTS, ZoneKind } from './pools';
import { attackInterval } from './stats';
import type { Raven, WeaponInst, World } from './world';

const PICKS = new Int32Array(32);
/** Shortest interval between attacks of a weapon kind (seconds); faster attack speed does nothing below it. */
export function minInterval(kind: WeaponKind): number {
  return kind === 'summon' ? 0.15 : kind === 'guard' ? 0.5 : 0.12;
}

/** Most traps one weapon keeps on the ground, and most vortices or tethers it makes at once. */
export const MAX_TRAPS = 24;
const MAX_VORTICES = 6;
const MAX_TETHERS = 6;
/** Turn rate of a homing projectile (rad/s) and how far it looks for a target (metres). */
const HOMING_TURN = 7;
const HOMING_SIGHT = 12;
/** Seconds before the same boomerang or whirlwind can hit the same enemy again. */
const BOOMERANG_REHIT = 0.4;
const TWISTER_REHIT = 0.5;
/** Seconds a boomerang may spend chasing the hero on its way back before it gives up. */
const BOOMERANG_RETURN = 4;
/** A trap arms this long after it lands, and springs when an enemy comes within this share of its radius. */
const TRAP_ARM = 0.5;
const TRAP_TRIGGER = 0.45;
/** A vortex drags enemies within this multiple of its radius, with this acceleration (m/s², before enemy weight). */
const VORTEX_REACH = 1.6;
const VORTEX_PULL = 30;

/** Longest distance a projectile moves between two collision checks (metres). */
const PROJ_SUBSTEP = 0.6;
/** Half-width of an orbiting sickle's cutting spoke (metres). */
const ORBIT_BLADE_R = 0.95;

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
): number {
  const pr = w.projectiles;
  const i = pr.alloc();
  if (i < 0) return -1;
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
  return i;
}

/** One swing centred on (cx, cz): the hero, or for a lunge the spot in front of the target. */
function sweep(w: World, inst: WeaponInst, angle: number, dmg: number, area: number, cx = w.player.x, cz = w.player.z): void {
  const p = w.player;
  const e = w.enemies;
  const st = inst.stats;
  const half = st.arc / 2;
  const n = w.collect(cx, cz, area);
  for (let k = 0; k < n; k++) {
    const j = w.bufA[k] as number;
    const dx = (e.x[j] as number) - cx;
    const dz = (e.z[j] as number) - cz;
    const d = Math.hypot(dx, dz);
    if (d > 1.3 && half < 3.1 && Math.abs(wrapAngle(Math.atan2(dx, dz) - angle)) > half) continue;
    const inv = d > 0.001 ? 1 / d : 0;
    w.damageEnemy(j, dmg, inst.slot, dx * inv, dz * inv, st.knockback, st);
  }
  w.events.emit(Ev.Sweep, cx, (cx === p.x && cz === p.z ? p.y : w.map.heightAt(cx, cz)) + 0.9, cz, angle, st.arc, area, inst.def.color);
}

/** Damages every enemy within `width` of the segment from (x0, z0) to (x1, z1). Uses bufA. */
function damageLine(w: World, inst: WeaponInst, x0: number, z0: number, x1: number, z1: number, width: number, dmg: number): void {
  const e = w.enemies;
  const lx = x1 - x0;
  const lz = z1 - z0;
  const len2 = lx * lx + lz * lz || 1;
  const n = w.collect((x0 + x1) / 2, (z0 + z1) / 2, Math.sqrt(len2) / 2 + width);
  for (let k = 0; k < n; k++) {
    const j = w.bufA[k] as number;
    const dx = (e.x[j] as number) - x0;
    const dz = (e.z[j] as number) - z0;
    const t = Math.min(1, Math.max(0, (dx * lx + dz * lz) / len2));
    const ox = dx - lx * t;
    const oz = dz - lz * t;
    const reach = width + (e.radius[j] as number);
    if (ox * ox + oz * oz <= reach * reach) w.damageEnemy(j, dmg, inst.slot, 0, 0, 0, inst.stats);
  }
}

/** Zones of one kind that a weapon slot has on the ground. */
function countZones(w: World, slot: number, kind: number): number {
  const zn = w.zones;
  let n = 0;
  for (let i = 0; i < zn.n; i++) if (zn.alive[i] && zn.slot[i] === slot && zn.kind[i] === kind) n++;
  return n;
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
          // Each sickle cuts along its whole spoke (hero → blade), so enemies pressed against the hero
          // are hit too, not only those on the blade's circle.
          const n = w.collect(p.x, p.z, area + ORBIT_BLADE_R);
          for (let q = 0; q < n; q++) {
            const j = w.bufA[q] as number;
            const hi = j * WEAPON_SLOTS + slot;
            if (w.time - (e.hitT[hi] as number) < 0.45) continue;
            const dx = (e.x[j] as number) - p.x;
            const dz = (e.z[j] as number) - p.z;
            const reach = ORBIT_BLADE_R + (e.radius[j] as number);
            let hit = false;
            for (let k = 0; k < count && !hit; k++) {
              const a = inst.angle + (k * TAU) / count;
              const ux = Math.sin(a);
              const uz = Math.cos(a);
              const t = Math.min(area, Math.max(0, dx * ux + dz * uz));
              const ox = dx - ux * t;
              const oz = dz - uz * t;
              hit = ox * ox + oz * oz <= reach * reach;
            }
            if (!hit) continue;
            e.hitT[hi] = w.time;
            const d = Math.hypot(dx, dz) || 1;
            w.damageEnemy(j, dmg, slot, dx / d, dz / d, st.knockback, st);
          }
        }
        break;
      }
      case 'bolt': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const t = inst.def.aim === 'strongest' ? w.strongest(p.x, p.z, st.range) : w.nearest(p.x, p.z, st.range);
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
        const rule = inst.def.rule;
        const lunge = rule === 'lunge';
        // Miecz Nawii: the less health, the harder it hits.
        const sdmg = rule === 'lowHp' ? dmg * (1 + (inst.def.evolved ? LOWHP_BONUS_EVOLVED : LOWHP_BONUS) * (1 - Math.min(1, Math.max(0, p.hp / s.maxHp)))) : dmg;
        inst.fxArea = area;
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const t = w.nearest(p.x, p.z, lunge ? st.range : area * 1.25);
          // A lunge needs somebody to lunge at.
          if (lunge && t < 0) {
            inst.timer = 0.15;
            break;
          }
          inst.timer = cd;
          const aim = t >= 0 ? Math.atan2((e.x[t] as number) - p.x, (e.z[t] as number) - p.z) : p.yaw;
          inst.lx = p.x;
          inst.lz = p.z;
          if (lunge && t >= 0) {
            // The cut lands in front of the target, however far (within range) it stands.
            const off = Math.max(0, Math.hypot((e.x[t] as number) - p.x, (e.z[t] as number) - p.z) - area * 0.6);
            inst.lx += Math.sin(aim) * off;
            inst.lz += Math.cos(aim) * off;
          }
          if (rule === 'reap' && inst.charge >= 1) {
            // Kosa Południcy: a charged swing.
            inst.charge--;
            sweep(w, inst, aim, sdmg * (inst.def.evolved ? REAP_MUL_EVOLVED : REAP_MUL), area * REAP_AREA);
          } else {
            sweep(w, inst, aim, sdmg, area, inst.lx, inst.lz);
          }
          inst.queue = st.count - 1;
          // Follow-up swings fit inside the attack interval, so high attack speed never cuts them off.
          inst.qT = Math.min(0.2, cd / Math.max(1, st.count));
          inst.angle = lunge ? aim : aim + Math.PI;
        }
        if (inst.queue > 0) {
          inst.qT -= dt;
          if (inst.qT <= 0) {
            if (lunge) {
              // Follow-up cuts of a lunge land on the same spot.
              sweep(w, inst, inst.angle, sdmg, area, inst.lx, inst.lz);
            } else {
              sweep(w, inst, inst.angle, sdmg, area);
              inst.angle += Math.PI / 2;
            }
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
            let bd = dmg;
            if (inst.def.rule === 'dice') {
              // Kostki Welesa: the pips set the damage; the evolved die is rolled twice and the better roll counts.
              let roll = 1 + w.rng.int(6);
              if (inst.def.evolved) roll = Math.max(roll, 1 + w.rng.int(6));
              bd = (dmg * roll) / DICE_MEAN;
              if (roll === 6) w.diceSix(inst);
            }
            fireProjectile(w, ProjKind.Bounce, inst, a, bd, pspeed, dur, st.area, st.bounces);
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
      case 'homing': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          if (w.nearest(p.x, p.z, st.range) < 0) {
            inst.timer = 0.2;
            break;
          }
          inst.timer = cd;
          const count = st.count + extra;
          // The swarm leaves in every direction and each bee finds its own target.
          const a0 = w.rng.range(0, TAU);
          for (let k = 0; k < count; k++) fireProjectile(w, ProjKind.Homing, inst, a0 + (k * TAU) / count, dmg, pspeed, dur, st.area, st.pierce);
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 5);
        }
        break;
      }
      case 'trap': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          inst.timer = cd;
          const room = MAX_TRAPS - countZones(w, slot, ZoneKind.Trap);
          const count = Math.min(room, st.count + extra);
          for (let k = 0; k < count; k++) {
            const a = w.rng.range(0, TAU);
            const d = w.rng.range(1.5, Math.max(2, st.range));
            w.addZone(p.x + Math.sin(a) * d, p.z + Math.cos(a) * d, area, dur, dmg, slot, ZoneKind.Trap);
          }
          if (count > 0) w.events.emit(Ev.Shoot, p.x, p.y, p.z, 6);
        }
        break;
      }
      case 'trail': {
        inst.timer -= dt;
        // A new patch of fire only once the hero has left the last one (or it has burnt out), so standing
        // still does not stack patches on one spot.
        if (inst.timer <= 0 && (Math.hypot(p.x - inst.lx, p.z - inst.lz) > area * 0.7 || w.time - inst.lastT >= dur)) {
          inst.timer = cd;
          inst.lx = p.x;
          inst.lz = p.z;
          inst.lastT = w.time;
          w.addZone(p.x, p.z, area, dur, dmg, slot, ZoneKind.Fire);
        }
        break;
      }
      case 'boomerang': {
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
          // The stick slows down evenly on the way out, so it covers `range` in twice the time of a straight flight.
          const out = (2 * st.range) / Math.max(1, pspeed);
          const pr = w.projectiles;
          for (let k = 0; k < count; k++) {
            const a = aim + (k - (count - 1) / 2) * 0.5;
            const i = fireProjectile(w, ProjKind.Boomerang, inst, a, dmg, pspeed, out + BOOMERANG_RETURN, st.area * Math.sqrt(s.area), 0);
            if (i < 0) break;
            pr.span[i] = out;
            pr.sx[i] = pr.vx[i] as number;
            pr.sz[i] = pr.vz[i] as number;
            pr.sy[i] = out + BOOMERANG_RETURN;
          }
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 2);
        }
        break;
      }
      case 'wander': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          if (w.nearest(p.x, p.z, st.range) < 0) {
            inst.timer = 0.2;
            break;
          }
          inst.timer = cd;
          const count = st.count + extra;
          const a0 = w.rng.range(0, TAU);
          for (let k = 0; k < count; k++) fireProjectile(w, ProjKind.Twister, inst, a0 + (k * TAU) / count, dmg, pspeed, dur, area, 0);
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 3);
        }
        break;
      }
      case 'vortex': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          const n = w.collect(p.x, p.z, st.range);
          if (n === 0) {
            inst.timer = 0.2;
            break;
          }
          inst.timer = cd;
          const count = Math.min(MAX_VORTICES, st.count + extra);
          for (let k = 0; k < count; k++) PICKS[k] = w.bufA[w.rng.int(n)] as number;
          for (let k = 0; k < count; k++) {
            const j = PICKS[k] as number;
            w.addZone((e.x[j] as number) + w.rng.range(-1.5, 1.5) * k, (e.z[j] as number) + w.rng.range(-1.5, 1.5) * k, area, dur, dmg, slot, ZoneKind.Vortex);
          }
          w.events.emit(Ev.Shoot, p.x, p.y, p.z, 4);
        }
        break;
      }
      case 'guard': {
        // The block itself happens in World.hurtPlayer; here the buckler only gets ready again.
        inst.fxArea = area;
        if (inst.timer > 0) inst.timer -= dt;
        break;
      }
      case 'tether': {
        inst.timer -= dt;
        if (inst.timer <= 0) {
          inst.timer = cd;
          const count = Math.min(MAX_TETHERS, st.count + extra);
          const targets = inst.targets;
          targets.length = count;
          const reach = st.range + 2;
          let any = false;
          for (let k = 0; k < count; k++) {
            let t = targets[k] ?? -1;
            // A thread holds on to its enemy until it dies or walks out of reach.
            if (t >= 0 && (!e.alive[t] || Math.hypot((e.x[t] as number) - p.x, (e.z[t] as number) - p.z) > reach)) t = -1;
            for (let tries = 0; t < 0 && tries < 3; tries++) {
              const c = w.randomInRange(p.x, p.z, st.range);
              if (c < 0) break;
              if (!targets.includes(c)) t = c;
            }
            targets[k] = t;
            if (t < 0) continue;
            any = true;
            const tx = e.x[t] as number;
            const tz = e.z[t] as number;
            const ty = (e.y[t] as number) + (e.oy[t] as number) + 0.9;
            damageLine(w, inst, p.x, p.z, tx, tz, st.area * Math.sqrt(s.area), dmg);
            w.events.emit(Ev.Beam, tx, ty, tz, p.x, p.y + 1.1, p.z, inst.def.color);
          }
          if (!any) inst.timer = 0.2;
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
    if (kind === ProjKind.Homing) {
      // Steer toward the nearest enemy that was not just stung.
      const t = w.nearest(pr.x[i] as number, pr.z[i] as number, HOMING_SIGHT, pr.last[i] as number);
      if (t >= 0) {
        const cur = Math.atan2(pr.vx[i] as number, pr.vz[i] as number);
        const want = Math.atan2((e.x[t] as number) - (pr.x[i] as number), (e.z[t] as number) - (pr.z[i] as number));
        const turn = HOMING_TURN * dt;
        const a = cur + Math.min(turn, Math.max(-turn, wrapAngle(want - cur)));
        const v = Math.hypot(pr.vx[i] as number, pr.vz[i] as number);
        pr.vx[i] = Math.sin(a) * v;
        pr.vz[i] = Math.cos(a) * v;
      }
    } else if (kind === ProjKind.Boomerang) {
      const age = (pr.sy[i] as number) - (pr.life[i] as number);
      const out = pr.span[i] as number;
      if (age < out) {
        const k = 1 - age / out;
        pr.vx[i] = (pr.sx[i] as number) * k;
        pr.vz[i] = (pr.sz[i] as number) * k;
      } else {
        // Back to the hand, speeding up; caught when it gets there.
        const p = w.player;
        const dx = p.x - (pr.x[i] as number);
        const dz = p.z - (pr.z[i] as number);
        const d = Math.hypot(dx, dz);
        if (d < 1.2) {
          pr.free(i);
          continue;
        }
        const v = Math.hypot(pr.sx[i] as number, pr.sz[i] as number) * Math.min(1.5, 0.2 + ((age - out) / out) * 2);
        pr.vx[i] = (dx / d) * v;
        pr.vz[i] = (dz / d) * v;
      }
    } else if (kind === ProjKind.Twister) {
      // A whirlwind roams at random, drifting toward enemies nearby.
      const v = Math.hypot(pr.vx[i] as number, pr.vz[i] as number);
      let a = Math.atan2(pr.vx[i] as number, pr.vz[i] as number) + w.rng.range(-1, 1) * 4 * dt;
      const t = w.nearest(pr.x[i] as number, pr.z[i] as number, 9);
      if (t >= 0) a += Math.min(1.5 * dt, Math.max(-1.5 * dt, wrapAngle(Math.atan2((e.x[t] as number) - (pr.x[i] as number), (e.z[t] as number) - (pr.z[i] as number)) - a)));
      pr.vx[i] = Math.sin(a) * v;
      pr.vz[i] = Math.cos(a) * v;
    }
    const roams = kind === ProjKind.Boomerang || kind === ProjKind.Twister;
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
        if (roams || ((kind === ProjKind.Bolt || kind === ProjKind.Homing) && st.pierce > 0)) {
          const hi = j * WEAPON_SLOTS + slot;
          if (w.time - (e.hitT[hi] as number) < (kind === ProjKind.Twister ? TWISTER_REHIT : kind === ProjKind.Boomerang ? BOOMERANG_REHIT : 0.3)) continue;
          e.hitT[hi] = w.time;
        }
        const ex = e.x[j] as number;
        const ez = e.z[j] as number;
        const rank = inst.def.rankBonus && (ENEMIES[e.type[j] as number] as EnemyDef).rank ? 1 + inst.def.rankBonus : 1;
        if (kind === ProjKind.Twister) {
          // A whirlwind throws enemies outward from its eye.
          const ox = ex - x;
          const oz = ez - z;
          const od = Math.hypot(ox, oz) || 1;
          w.damageEnemy(j, pr.dmg[i] as number, slot, ox / od, oz / od, st.knockback, st);
        } else {
          w.damageEnemy(j, (pr.dmg[i] as number) * rank, slot, dirX, dirZ, st.knockback, st);
        }
        // Boomerangs and whirlwinds pass through everything and only end with their flight.
        if (roams) continue;
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
    const inst = w.weapons[zn.slot[i] as number];
    const kind = zn.kind[i] as number;
    const x = zn.x[i] as number;
    const z = zn.z[i] as number;
    const r = zn.r[i] as number;
    if (kind === ZoneKind.Trap) {
      // Springs once: everything within its radius is hurt (and slowed by the weapon's stats).
      if ((zn.span[i] as number) - (zn.life[i] as number) >= TRAP_ARM && w.collect(x, z, r * TRAP_TRIGGER) > 0) {
        w.damageCircle(x, z, r, zn.dmg[i] as number, zn.slot[i] as number, 2, inst ? inst.stats : null);
        w.events.emit(Ev.Explosion, x, (zn.y[i] as number) + 0.6, z, r, inst ? inst.def.color : 0xb8c0c8);
        zn.free(i);
      }
      continue;
    }
    if (kind === ZoneKind.Vortex) {
      const e = w.enemies;
      const n = w.collect(x, z, r * VORTEX_REACH);
      for (let k = 0; k < n; k++) {
        const j = w.bufA[k] as number;
        const dx = x - (e.x[j] as number);
        const dz = z - (e.z[j] as number);
        const d = Math.hypot(dx, dz);
        if (d < 0.3) continue;
        const pull = VORTEX_PULL * (1 - (ENEMIES[e.type[j] as number] as EnemyDef).weight) * dt;
        e.vx[j] = (e.vx[j] as number) + (dx / d) * pull;
        e.vz[j] = (e.vz[j] as number) + (dz / d) * pull;
      }
    }
    zn.tick[i] = (zn.tick[i] as number) - dt;
    if ((zn.tick[i] as number) <= 0) {
      zn.tick[i] = 0.4;
      w.damageCircle(x, z, r, zn.dmg[i] as number, zn.slot[i] as number, 0, inst ? inst.stats : null);
    }
  }
}
