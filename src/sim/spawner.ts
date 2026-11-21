import { TAU } from '../core/math';
import { ENEMY_INDEX } from '../data/enemies';
import type { WaveEvent } from '../data/types';
import { ELITE_FIRST, ELITE_INTERVAL, ENDLESS_BOSS_EVERY, ENDLESS_MINI_EVERY, ENDLESS_PHASE, FINAL_WAVE_PHASE, FINAL_WAVE_RAMP, FINAL_WAVE_RATE_END, phaseAt, RUN_LENGTH, SURGE_ALIVE, SURGE_RATE, surgeAt, WAVE_EVENTS } from '../data/waves';
import { Ev } from './events';
import { MAX_ENEMIES } from './pools';
import { curseEffects } from './stats';
import { PLAY_RADIUS } from './terrain';
import type { World } from './world';

const SPAWN_MIN = 25;
const SPAWN_MAX = 33;

/** Feeds enemies into the world according to the wave data (density over time + timed events). */
export class Spawner {
  private acc = 0;
  private eventIdx = 0;
  private nextElite = ELITE_FIRST;
  private nextMini = 0;
  private nextBoss = 0;
  /** Result of pickSpot. */
  private sx = 0;
  private sz = 0;
  /** Debug/perf: when > 0 the spawner keeps exactly this many chochliki+mix alive, ignoring waves. */
  forceAlive = 0;
  private finalWaveTold = false;
  private surgeTold = 0;
  private surgeOn = false;
  disabled = false;

  private pickSpot(w: World, ground: boolean): boolean {
    const p = w.player;
    for (let tries = 0; tries < 6; tries++) {
      const a = w.rng.next() * TAU;
      const d = SPAWN_MIN + w.rng.next() * (SPAWN_MAX - SPAWN_MIN);
      let x = p.x + Math.cos(a) * d;
      let z = p.z + Math.sin(a) * d;
      const md = Math.hypot(x, z);
      if (md > PLAY_RADIUS - 1.5) {
        x *= (PLAY_RADIUS - 1.5) / md;
        z *= (PLAY_RADIUS - 1.5) / md;
      }
      if (Math.hypot(x - p.x, z - p.z) < 16) continue;
      if (ground && !w.map.isFree(x, z, 0.8)) continue;
      this.sx = x;
      this.sz = z;
      return true;
    }
    return false;
  }

  /** Utopce crawl out of swamp puddles when one is at a sensible distance. */
  private puddleSpot(w: World): boolean {
    const p = w.player;
    const list = w.map.puddles;
    const start = w.rng.int(list.length);
    for (let k = 0; k < list.length; k++) {
      const pd = list[(start + k) % list.length];
      if (!pd) continue;
      const d = Math.hypot(pd.x - p.x, pd.z - p.z);
      if (d > 15 && d < 42) {
        const a = w.rng.next() * TAU;
        const r = w.rng.next() * pd.r * 0.7;
        this.sx = pd.x + Math.cos(a) * r;
        this.sz = pd.z + Math.sin(a) * r;
        return true;
      }
    }
    return false;
  }

  private spawnOne(w: World, id: string, elite = false): number {
    const type = ENEMY_INDEX[id];
    if (type === undefined) return -1;
    const ground = id !== 'kruk' && id !== 'ognik' && id !== 'jaga';
    let ok = false;
    if (id === 'utopiec' && w.rng.chance(0.5)) ok = this.puddleSpot(w);
    if (!ok) ok = this.pickSpot(w, ground);
    if (!ok) return -1;
    return w.spawnEnemy(type, this.sx, this.sz, elite);
  }

  private pickFromMix(w: World, mix: Record<string, number>): string {
    const ids = Object.keys(mix);
    const i = w.rng.weighted(ids.map((k) => mix[k] as number));
    return ids[Math.max(0, i)] as string;
  }

  private fire(w: World, ev: WaveEvent): void {
    if (ev.kind === 'portal' && (w.endless || w.won || w.bossSummoned)) return;
    if (ev.text) w.announce.push(ev.text);
    const p = w.player;
    if (ev.kind === 'portal') {
      w.openPortal();
      return;
    }
    if (ev.kind === 'swarm') {
      const type = ENEMY_INDEX[ev.enemy];
      if (type === undefined) return;
      const count = ev.count ?? 12;
      const base = w.rng.next() * TAU;
      for (let k = 0; k < count; k++) {
        const a = base + (k / count) * TAU;
        let x = p.x + Math.cos(a) * 24;
        let z = p.z + Math.sin(a) * 24;
        const md = Math.hypot(x, z);
        if (md > PLAY_RADIUS - 1.5) {
          x *= (PLAY_RADIUS - 1.5) / md;
          z *= (PLAY_RADIUS - 1.5) / md;
        }
        w.spawnEnemy(type, x, z);
      }
      return;
    }
    // Mini-bosses and the boss arrive from the direction of the map centre so they are never stuck at the edge.
    const type = ENEMY_INDEX[ev.enemy];
    if (type === undefined) return;
    let dx = -p.x;
    let dz = -p.z;
    const d = Math.hypot(dx, dz);
    if (d < 5) {
      const a = w.rng.next() * TAU;
      dx = Math.cos(a);
      dz = Math.sin(a);
    } else {
      dx /= d;
      dz /= d;
    }
    const dist = ev.kind === 'boss' ? 30 : 26;
    const i = w.spawnEnemy(type, p.x + dx * dist, p.z + dz * dist);
    if (i >= 0) w.events.emit(Ev.BossSpawn, w.enemies.x[i] as number, w.enemies.y[i] as number, w.enemies.z[i] as number, type);
  }

  /** Summons the boss through the open portal (spawns it beside the portal). */
  summonBoss(w: World, x: number, z: number): void {
    const type = ENEMY_INDEX.leszy;
    if (type === undefined) return;
    w.announce.push('Leszy, strażnik boru, wychodzi z portalu!');
    const i = w.spawnEnemy(type, x, z);
    if (i >= 0) w.events.emit(Ev.BossSpawn, w.enemies.x[i] as number, w.enemies.y[i] as number, w.enemies.z[i] as number, type);
  }

  update(w: World, dt: number): void {
    if (this.disabled) return;
    const e = w.enemies;
    if (this.forceAlive > 0) {
      const { phase } = phaseAt(w.time);
      let guard = 0;
      while (e.count < this.forceAlive && guard++ < 40) this.spawnOne(w, this.pickFromMix(w, phase.mix));
      return;
    }
    while (this.eventIdx < WAVE_EVENTS.length && w.time >= (WAVE_EVENTS[this.eventIdx] as WaveEvent).at) {
      this.fire(w, WAVE_EVENTS[this.eventIdx] as WaveEvent);
      this.eventIdx++;
    }
    let { phase, progress } = phaseAt(w.time);
    let rate = phase.rate;
    let swell = 1;
    const surge = w.endless ? 0 : surgeAt(w.time);
    if (surge > 0) {
      // Surge: half a minute of a much thicker horde.
      swell = SURGE_ALIVE;
      rate *= SURGE_RATE;
      if (surge !== this.surgeTold) {
        this.surgeTold = surge;
        this.surgeOn = true;
        w.announce.push('Nadciąga fala! Bór rzuca na ciebie wszystko, co ma.');
      }
    } else if (this.surgeOn) {
      this.surgeOn = false;
      // The last surge runs straight into the final wave, which has an announcement of its own.
      if (!w.endless && w.time < RUN_LENGTH) w.announce.push('Fala minęła. Bór łapie oddech.');
    }
    if (!w.endless && w.time >= RUN_LENGTH && !w.bossSummoned) {
      // Final wave: the horde thickens (and grows stronger, see finalWaveMul) while the portal waits.
      phase = FINAL_WAVE_PHASE;
      progress = Math.min(1, (w.time - RUN_LENGTH) / FINAL_WAVE_RAMP);
      rate = FINAL_WAVE_PHASE.rate + (FINAL_WAVE_RATE_END - FINAL_WAVE_PHASE.rate) * progress;
      if (!this.finalWaveTold) {
        this.finalWaveTold = true;
        w.announce.push('Fala końcowa! Bór z każdą chwilą jest groźniejszy. Wezwij Leszego!');
      }
    }
    if (w.endless) {
      // After the boss the forest never rests: dense mixed hordes, recurring mini-bosses, Leszy returns.
      phase = ENDLESS_PHASE;
      progress = Math.min(1, (w.time - phase.from) / 240);
      if (this.nextMini === 0) {
        this.nextMini = w.time + 30;
        this.nextBoss = w.time + ENDLESS_BOSS_EVERY;
      }
      if (w.time >= this.nextMini) {
        this.nextMini += ENDLESS_MINI_EVERY;
        const jaga = w.rng.chance(0.5);
        this.fire(w, { at: w.time, kind: 'mini', enemy: jaga ? 'jaga' : 'poludnica', text: jaga ? 'Baba Jaga znów krąży nad polaną!' : 'Południca wraca z żarem!' });
      }
      if (w.time >= this.nextBoss) {
        this.nextBoss += ENDLESS_BOSS_EVERY;
        this.fire(w, { at: w.time, kind: 'boss', enemy: 'leszy', text: 'Kolejny Leszy wychodzi z kniei!' });
      }
    }
    const crowd = curseEffects(w.stats.curse).enemyCount;
    const target = (phase.alive[0] + (phase.alive[1] - phase.alive[0]) * progress) * crowd * swell;
    const alive = e.count;
    if (alive < target && alive < MAX_ENEMIES - 40) {
      const deficit = (target - alive) / target;
      this.acc += (w.endless ? phase.rate : rate) * crowd * (0.6 + deficit * 2.4) * dt;
      let guard = 0;
      while (this.acc >= 1 && guard++ < 12) {
        this.acc -= 1;
        this.spawnOne(w, this.pickFromMix(w, phase.mix));
      }
    }
    if (w.time >= this.nextElite) {
      this.nextElite += ELITE_INTERVAL;
      const id = this.pickFromMix(w, phase.mix);
      if (id !== 'ognik') {
        if (this.spawnOne(w, id, true) >= 0 && this.nextElite - ELITE_INTERVAL === ELITE_FIRST) {
          w.announce.push('Elitarny wróg! Pokonaj go, a zostawi skrzynię.');
        }
      } else {
        this.spawnOne(w, 'utopiec', true);
      }
    }
  }
}
