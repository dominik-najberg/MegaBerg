import { Rng } from '../core/rng';
import { SpatialGrid } from '../core/spatialGrid';
import { BLESSINGS } from '../data/blessings';
import { CHARACTERS } from '../data/characters';
import { ENEMIES } from '../data/enemies';
import { PASSIVES } from '../data/passives';
import type { BlessingDef, CharacterDef, EnemyDef, Rarity, Stats, WeaponDef, WeaponStats } from '../data/types';
import { ELITE_HP_MUL, enemyDamageMul, enemyHpMul, RUN_LENGTH, xpForLevel } from '../data/waves';
import { WEAPON_BY_ID, WEAPONS, weaponStatsAt } from '../data/weapons';
import { updateEnemies } from './ai';
import { applyCard, chestCards, levelUpCards, type Card } from './cards';
import { Ev, EventQueue } from './events';
import { MoveFx, Player, stepPlayer, type InputState } from './player';
import { Enemies, Gems, Hazards, MAX_ENEMIES, PickupKind, Pickups, Projectiles, Shots, Zones } from './pools';
import { Spawner } from './spawner';
import { computeStats, critChance, damageAfterArmor, type PassiveInst } from './stats';
import { Explored } from './fog';
import { GameMap, MAP_HALF } from './terrain';
import { updateProjectiles, updateWeapons, updateZones } from './weapons';

export { RUN_LENGTH };

export const MAX_WEAPONS = 6;
export const MAX_PASSIVES = 6;

export interface Raven {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  pz: number;
  yaw: number;
  /** 0 = circling the hero, 1 = diving at a target, 2 = returning. */
  state: number;
  target: number;
  cd: number;
  phase: number;
}

export interface WeaponInst {
  def: WeaponDef;
  level: number;
  stats: WeaponStats;
  /** Permanent damage bonus from card rarities. */
  bonus: number;
  slot: number;
  timer: number;
  /** Remaining active time (orbit, cone). */
  active: number;
  angle: number;
  queue: number;
  qT: number;
  /** Total damage dealt (run statistics). */
  dealt: number;
  /** Effective count / area this step, read by the renderer. */
  fxCount: number;
  fxArea: number;
  ravens: Raven[];
}

export interface Chest {
  x: number;
  y: number;
  z: number;
  rot: number;
  free: boolean;
  opened: boolean;
  progress: number;
}

export interface Shrine {
  x: number;
  y: number;
  z: number;
  used: boolean;
  progress: number;
}

export type Choice =
  | { type: 'levelup'; cards: Card[] }
  | { type: 'chest'; cards: Card[] }
  | { type: 'shrine'; index: number; options: BlessingDef[] };

export interface Prompt {
  kind: '' | 'chest' | 'shrine';
  cost: number;
  affordable: boolean;
  progress: number;
}

export interface WorldOptions {
  seed?: number;
  character?: CharacterDef;
  shop?: Record<string, number>;
  /** Ids of weapons / passives that may appear on cards. Defaults to everything without an unlock requirement. */
  weaponPool?: string[];
  passivePool?: string[];
}

export interface RunSummary {
  character: string;
  time: number;
  kills: number;
  level: number;
  gold: number;
  goldCollected: number;
  won: boolean;
  /** True for the part of a run played in endless mode after the boss. */
  endless: boolean;
  evolved: number;
  shrines: number;
  damageTaken: number;
  killsByEnemy: Record<string, number>;
  weapons: Array<{ id: string; name: string; level: number; dealt: number }>;
  burnDealt: number;
}

const PICKUP_BASE = 2.6;
/** Gold for defeating the boss (before the gold-gain multiplier). */
export const BOSS_GOLD = 150;

/** The whole simulation state of one run. Pure logic: no rendering, no DOM. */
export class World {
  readonly map: GameMap;
  readonly rng: Rng;
  readonly player = new Player();
  readonly events = new EventQueue();
  readonly enemies = new Enemies();
  readonly grid = new SpatialGrid(MAP_HALF, 4, MAX_ENEMIES);
  readonly gems = new Gems();
  readonly pickups = new Pickups();
  readonly projectiles = new Projectiles();
  readonly zones = new Zones();
  readonly hazards = new Hazards();
  readonly shots = new Shots();
  readonly spawner = new Spawner();
  /** Fog of war of the map screen (what the hero has seen in this run). */
  readonly fog = new Explored();
  /** Per landmark of the map: has the hero found it yet. */
  readonly landmarksFound: boolean[];
  readonly chests: Chest[] = [];
  readonly shrines: Shrine[] = [];
  readonly weapons: WeaponInst[] = [];
  readonly passives: PassiveInst[] = [];
  readonly blessings: BlessingDef[] = [];
  readonly character: CharacterDef;
  readonly shopLevels: Record<string, number>;
  readonly weaponPool: Set<string>;
  readonly passivePool: Set<string>;
  /** Texts for the announcer banner; the UI drains this. */
  readonly announce: string[] = [];
  readonly killsByType = new Int32Array(ENEMIES.length);
  readonly prompt: Prompt = { kind: '', cost: 0, affordable: false, progress: 0 };

  stats: Stats;
  crit = 0.05;
  time = 0;
  level = 1;
  xp = 0;
  xpNeed = xpForLevel(1);
  kills = 0;
  gold = 0;
  goldCollected = 0;
  paidChests = 0;
  rerollsLeft = 0;
  revivesLeft = 0;
  pendingLevels = 0;
  choice: Choice | null = null;
  dead = false;
  won = false;
  endless = false;
  bossIdx = -1;
  bossPhase = 1;
  evolved = 0;
  shrinesUsed = 0;
  damageTaken = 0;
  burnDealt = 0;
  hpMul = 1;
  dmgMul = 1;
  /** Hit-stop request in seconds (renderer/game loop consumes it). */
  hitstop = 0;

  /** Scratch buffers for spatial queries. */
  readonly cand = new Int32Array(MAX_ENEMIES);
  readonly bufA = new Int32Array(MAX_ENEMIES);
  readonly bufB = new Int32Array(MAX_ENEMIES);

  constructor(map: GameMap, opts: WorldOptions = {}) {
    this.map = map;
    this.rng = new Rng(opts.seed ?? 1);
    this.character = opts.character ?? (CHARACTERS[0] as CharacterDef);
    this.shopLevels = opts.shop ?? {};
    this.weaponPool = new Set(opts.weaponPool ?? WEAPONS.filter((w) => !w.evolved && !w.unlock).map((w) => w.id));
    this.passivePool = new Set(opts.passivePool ?? PASSIVES.filter((p) => !p.unlock).map((p) => p.id));
    const p = this.player;
    p.y = map.heightAt(0, 0);
    p.yaw = Math.PI;
    p.savePrev();
    this.stats = computeStats(this.character, this.shopLevels, this.passives, this.blessings);
    this.crit = critChance(this.stats.luck);
    p.hp = this.stats.maxHp;
    this.rerollsLeft = Math.floor(this.stats.rerolls);
    this.revivesLeft = Math.floor(this.stats.revives);
    this.addWeapon(this.character.startWeapon);
    for (const c of map.chestSpots) {
      this.chests.push({ x: c.x, y: map.heightAt(c.x, c.z), z: c.z, rot: c.rot, free: false, opened: false, progress: 0 });
    }
    for (const s of map.shrines) this.shrines.push({ x: s.x, y: map.heightAt(s.x, s.z), z: s.z, used: false, progress: 0 });
    this.landmarksFound = map.landmarks.map(() => false);
    this.fog.reveal(p.x, p.z);
  }

  /** 0 (dusk) .. 1 (night) for the renderer. */
  dayTime(): number {
    return Math.min(1, this.time / (RUN_LENGTH * 0.85));
  }

  get paused(): boolean {
    return this.choice !== null || this.dead || (this.won && !this.endless);
  }

  // ------------------------------------------------------------------ step

  step(dt: number, input: InputState): void {
    if (this.paused) return;
    const p = this.player;
    p.savePrev();
    this.time += dt;
    this.hpMul = enemyHpMul(this.time);
    this.dmgMul = enemyDamageMul(this.time);

    const fx = stepPlayer(p, input, this.stats, this.map, dt);
    if (fx & MoveFx.Jump) this.events.emit(Ev.Jump, p.x, p.y, p.z);
    if (fx & MoveFx.AirJump) this.events.emit(Ev.AirJump, p.x, p.y, p.z);
    if (fx & MoveFx.Dash) this.events.emit(Ev.Dash, p.x, p.y, p.z);
    if (fx & MoveFx.Land) this.events.emit(Ev.Land, p.x, p.y, p.z, p.landImpact, p.inPuddle || this.map.inPuddle(p.x, p.z) ? 1 : 0);
    if (p.invuln > 0) p.invuln -= dt;
    p.hurtT += dt;
    if (this.stats.regen > 0 && p.hp < this.stats.maxHp) p.hp = Math.min(this.stats.maxHp, p.hp + this.stats.regen * dt);

    const e = this.enemies;
    this.grid.build(e.n, e.alive, e.x, e.z);
    this.spawner.update(this, dt);
    updateEnemies(this, dt);
    updateWeapons(this, dt);
    updateProjectiles(this, dt);
    updateZones(this, dt);
    this.updateHazards(dt);
    this.updateShots(dt);
    this.updatePickups(dt);
    this.updateInteract(dt, input.interact);
    this.explore();

    if (!this.dead && this.pendingLevels > 0 && this.choice === null) this.openLevelUp();
  }

  /** Uncovers the map around the hero and announces newly found landmarks. */
  private explore(): void {
    const p = this.player;
    this.fog.reveal(p.x, p.z);
    const lm = this.map.landmarks;
    for (let i = 0; i < lm.length; i++) {
      if (this.landmarksFound[i]) continue;
      const l = lm[i] as (typeof lm)[number];
      const r = l.r + 12;
      const dx = l.x - p.x;
      const dz = l.z - p.z;
      if (dx * dx + dz * dz < r * r) {
        this.landmarksFound[i] = true;
        this.announce.push(`Odkryto: ${l.name}`);
        this.events.emit(Ev.Discover, l.x, this.map.heightAt(l.x, l.z), l.z, i);
      }
    }
  }

  // ------------------------------------------------------------------ queries

  /** Fills `buf` with enemies whose body overlaps the circle. Returns the count. */
  collect(x: number, z: number, r: number, buf: Int32Array = this.bufA): number {
    const e = this.enemies;
    const n = this.grid.query(x, z, r + 4, this.cand);
    let m = 0;
    for (let k = 0; k < n; k++) {
      const j = this.cand[k] as number;
      if (!e.alive[j]) continue;
      const dx = (e.x[j] as number) - x;
      const dz = (e.z[j] as number) - z;
      const rr = r + (e.radius[j] as number);
      if (dx * dx + dz * dz <= rr * rr) buf[m++] = j;
    }
    return m;
  }

  /** Index of the nearest living enemy within range, or -1. */
  nearest(x: number, z: number, range: number, exclude = -1): number {
    const e = this.enemies;
    const n = this.grid.query(x, z, range + 4, this.cand);
    let best = -1;
    let bestD = (range + 3) * (range + 3);
    for (let k = 0; k < n; k++) {
      const j = this.cand[k] as number;
      if (!e.alive[j] || j === exclude || (e.spawnT[j] as number) > 0.3) continue;
      const dx = (e.x[j] as number) - x;
      const dz = (e.z[j] as number) - z;
      const d = dx * dx + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    return best;
  }

  /** Random living enemy within range, or -1. Uses bufB. */
  randomInRange(x: number, z: number, range: number): number {
    const n = this.collect(x, z, range, this.bufB);
    if (n === 0) return -1;
    return this.bufB[this.rng.int(n)] as number;
  }

  // ------------------------------------------------------------------ combat

  /**
   * Damages one enemy. `slot` >= 0 attributes the hit to a weapon (crits, burn, slow, statistics);
   * slot -1 is damage over time or environmental.
   */
  damageEnemy(i: number, base: number, slot: number, kx: number, kz: number, kb: number, st: WeaponStats | null): void {
    const e = this.enemies;
    if (!e.alive[i]) return;
    const def = ENEMIES[e.type[i] as number] as EnemyDef;
    let dmg = base;
    let flag = 0;
    if (slot >= 0) {
      if (this.rng.next() < this.crit) {
        dmg *= 2;
        flag = 1;
      }
      const w = this.weapons[slot];
      if (w) w.dealt += dmg;
      const burn = (st ? st.burn * this.stats.damage : 0) + dmg * this.stats.burn;
      if (burn > 0) {
        e.burnT[i] = 3;
        if (burn > (e.burnDps[i] as number)) e.burnDps[i] = burn;
      }
      if (st && st.slow > 0) {
        const k = st.slow * (1 - def.weight * 0.7);
        e.slowT[i] = 2;
        if (k > (e.slowK[i] as number)) e.slowK[i] = k;
      }
    } else {
      flag = 2;
      this.burnDealt += dmg;
    }
    e.hp[i] = (e.hp[i] as number) - dmg;
    // Flash strength follows how much the hit matters, so aura ticks do not white out the whole crowd.
    const fl = 0.035 + 0.085 * Math.min(1, dmg / ((e.maxHp[i] as number) * 0.2));
    if (fl > (e.flash[i] as number)) e.flash[i] = fl;
    if (kb > 0) {
      const k = kb * (1 - def.weight);
      e.vx[i] = (e.vx[i] as number) + kx * k;
      e.vz[i] = (e.vz[i] as number) + kz * k;
    }
    this.events.emit(Ev.Hit, e.x[i] as number, (e.y[i] as number) + (e.oy[i] as number), e.z[i] as number, dmg, flag, def.height * (e.elite[i] ? 1.35 : 1));
    if ((e.hp[i] as number) <= 0) this.killEnemy(i);
  }

  /** Damages every enemy overlapping the circle, pushing them away from its centre. Uses bufB. */
  damageCircle(x: number, z: number, r: number, dmg: number, slot: number, kb: number, st: WeaponStats | null): number {
    const e = this.enemies;
    const n = this.collect(x, z, r, this.bufB);
    for (let k = 0; k < n; k++) {
      const j = this.bufB[k] as number;
      let dx = (e.x[j] as number) - x;
      let dz = (e.z[j] as number) - z;
      const d = Math.hypot(dx, dz);
      if (d > 0.001) {
        dx /= d;
        dz /= d;
      }
      this.damageEnemy(j, dmg, slot, dx, dz, kb, st);
    }
    return n;
  }

  killEnemy(i: number): void {
    const e = this.enemies;
    const t = e.type[i] as number;
    const def = ENEMIES[t] as EnemyDef;
    const x = e.x[i] as number;
    const z = e.z[i] as number;
    const gy = this.map.heightAt(x, z);
    const elite = e.elite[i] as number;
    this.kills++;
    this.killsByType[t] = (this.killsByType[t] as number) + 1;
    this.events.emit(Ev.Kill, x, (e.y[i] as number) + (e.oy[i] as number), z, t, elite, e.radius[i] as number);
    const luck = this.stats.luck;
    const rng = this.rng;

    const xp = def.xp * (elite ? 6 : 1);
    if (xp > 0) this.gems.spawn(x + rng.range(-0.3, 0.3), gy, z + rng.range(-0.3, 0.3), xp);

    if (def.rank === 'boss') {
      this.hitstop = 0.35;
      if (!this.endless && !this.won) {
        // The run freezes on victory, so the reward is credited directly instead of dropped,
        // and coins still lying on the clearing are swept up.
        this.addGold(BOSS_GOLD);
        const k = this.pickups;
        for (let c = 0; c < k.n; c++) {
          if (k.alive[c] && k.kind[c] === PickupKind.Coin) {
            this.addGold(k.val[c] as number);
            k.free(c);
          }
        }
        this.won = true;
        this.events.emit(Ev.Win, x, gy, z);
      } else {
        for (let k = 0; k < 30; k++) this.pickups.spawn(PickupKind.Coin, x + rng.range(-6, 6), gy, z + rng.range(-6, 6), BOSS_GOLD / 30);
      }
    } else if (def.rank === 'mini') {
      for (let k = 0; k < 10; k++) this.pickups.spawn(PickupKind.Coin, x + rng.range(-2.5, 2.5), gy, z + rng.range(-2.5, 2.5), 3);
      this.spawnChest(x, z, true);
      this.pickups.spawn(PickupKind.Bread, x + 1, gy, z + 1, 30);
      this.hitstop = 0.18;
    } else {
      if (elite) this.spawnChest(x, z, true);
      if (rng.next() < 0.06 * (1 + luck * 0.6)) this.pickups.spawn(PickupKind.Coin, x, gy, z, elite ? 5 : 1);
      else if (rng.next() < 0.007 * (1 + luck * 0.5)) {
        if (rng.next() < 0.25) this.pickups.spawn(PickupKind.Honey, x, gy, z, 60);
        else this.pickups.spawn(PickupKind.Bread, x, gy, z, 25);
      } else if (rng.next() < 0.0012) this.pickups.spawn(PickupKind.Vacuum, x, gy, z, 0);
    }
    e.free(i);
    if (def.rank) this.trackBoss();
  }

  /** Removes an enemy without drops or kill credit. */
  despawn(i: number): void {
    this.enemies.free(i);
    if (i === this.bossIdx) this.trackBoss();
  }

  /**
   * Points bossIdx (health bar, camera, music) at a living ranked enemy:
   * the boss if one is alive, otherwise the toughest mini-boss, otherwise -1.
   */
  private trackBoss(): void {
    const e = this.enemies;
    let best = -1;
    let bestBoss = false;
    for (let i = 0; i < e.n; i++) {
      if (!e.alive[i]) continue;
      const rank = (ENEMIES[e.type[i] as number] as EnemyDef).rank;
      if (!rank) continue;
      const isBoss = rank === 'boss';
      if (best < 0 || (isBoss && !bestBoss) || (isBoss === bestBoss && (e.maxHp[i] as number) >= (e.maxHp[best] as number))) {
        best = i;
        bestBoss = isBoss;
      }
    }
    this.bossIdx = best;
  }

  hurtPlayer(damage: number): void {
    const p = this.player;
    if (p.invuln > 0 || this.dead || (this.won && !this.endless)) return;
    const d = damageAfterArmor(damage, this.stats.armor);
    p.hp -= d;
    p.invuln = 0.5;
    p.hurtT = 0;
    this.damageTaken += d;
    // Heavy blows (boss attacks, charges) freeze the action for a few frames.
    if (d > this.stats.maxHp * 0.15 && this.hitstop < 0.07) this.hitstop = 0.07;
    this.events.emit(Ev.PlayerHit, p.x, p.y, p.z, d);
    if (p.hp <= 0) {
      if (this.revivesLeft > 0) {
        this.revivesLeft--;
        p.hp = this.stats.maxHp * 0.5;
        p.invuln = 2.5;
        this.events.emit(Ev.Revive, p.x, p.y, p.z);
        this.announce.push('Żywa woda przywraca cię do życia!');
        this.damageCircle(p.x, p.z, 10, 60 * this.hpMul, -1, 14, null);
      } else {
        p.hp = 0;
        this.dead = true;
        this.events.emit(Ev.Death, p.x, p.y, p.z);
      }
    }
  }

  heal(amount: number): void {
    const p = this.player;
    const before = p.hp;
    p.hp = Math.min(this.stats.maxHp, p.hp + amount);
    if (p.hp > before) this.events.emit(Ev.Heal, p.x, p.y, p.z, p.hp - before);
  }

  gainXp(value: number): void {
    this.xp += value * this.stats.xpGain;
    while (this.xp >= this.xpNeed) {
      this.xp -= this.xpNeed;
      this.level++;
      this.xpNeed = xpForLevel(this.level);
      this.pendingLevels++;
    }
  }

  addGold(value: number): void {
    const v = value * this.stats.goldGain;
    this.gold += v;
    this.goldCollected += v;
  }

  // ------------------------------------------------------------------ spawning

  spawnEnemy(typeIdx: number, x: number, z: number, elite = false): number {
    const e = this.enemies;
    const i = e.alloc();
    if (i < 0) return -1;
    const def = ENEMIES[typeIdx] as EnemyDef;
    e.type[i] = typeIdx;
    e.x[i] = x;
    e.z[i] = z;
    const y = this.map.heightAt(x, z);
    e.y[i] = y;
    e.px[i] = x;
    e.py[i] = y;
    e.pz[i] = z;
    const rankMul = def.rank ? Math.max(1, this.hpMul * 0.42) : this.hpMul;
    const hp = def.hp * rankMul * (elite ? ELITE_HP_MUL : 1);
    e.hp[i] = hp;
    e.maxHp[i] = hp;
    e.speed[i] = def.speed * (0.92 + this.rng.next() * 0.16);
    e.dmg[i] = def.damage * this.dmgMul * (elite ? 1.4 : 1);
    e.radius[i] = def.radius * (elite ? 1.35 : 1);
    e.elite[i] = elite ? 1 : 0;
    e.t1[i] = 1 + this.rng.next() * 2.5;
    e.t2[i] = def.ai === 'jaga' ? 5 : 0;
    e.t3[i] = 4 + this.rng.next() * 3;
    e.ax[i] = this.rng.next() < 0.5 ? -1 : 1;
    e.oy[i] = def.flying ? 1.3 : 0;
    if (def.rank === 'boss') {
      this.bossPhase = 1;
      e.spawnT[i] = 1.6;
    }
    if (def.rank) this.trackBoss();
    return i;
  }

  spawnChest(x: number, z: number, free: boolean): void {
    this.chests.push({ x, y: this.map.heightAt(x, z), z, rot: this.rng.range(0, 6.28), free, opened: false, progress: 0 });
  }

  addHazard(x: number, z: number, r: number, delay: number, dmg: number, air = false): void {
    const h = this.hazards;
    const i = h.list.alloc();
    if (i < 0) return;
    h.alive[i] = 1;
    h.air[i] = air ? 1 : 0;
    h.x[i] = x;
    h.z[i] = z;
    h.y[i] = this.map.heightAt(x, z);
    h.r[i] = r;
    h.t[i] = 0;
    h.delay[i] = delay;
    h.dmg[i] = dmg;
  }

  addShot(x: number, y: number, z: number, vx: number, vz: number, dmg: number): void {
    const s = this.shots;
    const i = s.list.alloc();
    if (i < 0) return;
    s.alive[i] = 1;
    s.x[i] = x;
    s.y[i] = y;
    s.z[i] = z;
    s.px[i] = x;
    s.py[i] = y;
    s.pz[i] = z;
    s.vx[i] = vx;
    s.vz[i] = vz;
    s.life[i] = 3.2;
    s.dmg[i] = dmg;
    this.events.emit(Ev.EnemyShoot, x, y, z);
  }

  addZone(x: number, z: number, r: number, life: number, dmg: number, slot: number): void {
    const zn = this.zones;
    const i = zn.list.alloc();
    if (i < 0) return;
    zn.alive[i] = 1;
    zn.slot[i] = slot;
    zn.x[i] = x;
    zn.z[i] = z;
    zn.y[i] = this.map.heightAt(x, z);
    zn.r[i] = r;
    zn.life[i] = life;
    zn.span[i] = life;
    zn.tick[i] = 0;
    zn.dmg[i] = dmg;
    this.events.emit(Ev.Zone, x, zn.y[i] as number, z, r);
  }

  // ------------------------------------------------------------------ hazards, shots, pickups

  private updateHazards(dt: number): void {
    const h = this.hazards;
    const p = this.player;
    for (let i = 0; i < h.n; i++) {
      if (!h.alive[i]) continue;
      h.t[i] = (h.t[i] as number) + dt;
      if ((h.t[i] as number) < (h.delay[i] as number)) continue;
      const dx = p.x - (h.x[i] as number);
      const dz = p.z - (h.z[i] as number);
      const r = (h.r[i] as number) + 0.15;
      let hit = 0;
      if (dx * dx + dz * dz < r * r) {
        const airborne = p.y - this.map.heightAt(p.x, p.z) > 1.0;
        if (h.air[i] || !airborne) {
          if (p.invuln <= 0) hit = 1;
          this.hurtPlayer(h.dmg[i] as number);
        }
      }
      this.events.emit(Ev.Hazard, h.x[i] as number, h.y[i] as number, h.z[i] as number, h.r[i] as number, hit);
      h.free(i);
    }
  }

  private updateShots(dt: number): void {
    const s = this.shots;
    const p = this.player;
    for (let i = 0; i < s.n; i++) {
      if (!s.alive[i]) continue;
      s.px[i] = s.x[i] as number;
      s.py[i] = s.y[i] as number;
      s.pz[i] = s.z[i] as number;
      s.x[i] = (s.x[i] as number) + (s.vx[i] as number) * dt;
      s.z[i] = (s.z[i] as number) + (s.vz[i] as number) * dt;
      s.y[i] = this.map.heightAt(s.x[i] as number, s.z[i] as number) + 1.1;
      s.life[i] = (s.life[i] as number) - dt;
      const dx = p.x - (s.x[i] as number);
      const dz = p.z - (s.z[i] as number);
      const dy = p.y + 0.9 - (s.y[i] as number);
      if (dx * dx + dz * dz < 0.75 * 0.75 && Math.abs(dy) < 1.3) {
        this.hurtPlayer(s.dmg[i] as number);
        this.events.emit(Ev.Explosion, s.x[i] as number, s.y[i] as number, s.z[i] as number, 0.8, 0x9a40ff);
        s.free(i);
      } else if ((s.life[i] as number) <= 0) {
        s.free(i);
      }
    }
  }

  private updatePickups(dt: number): void {
    const p = this.player;
    const range = PICKUP_BASE * this.stats.pickup;
    const r2 = range * range;
    const g = this.gems;
    const py = p.y + 0.9;
    for (let i = 0; i < g.n; i++) {
      if (!g.alive[i]) continue;
      g.age[i] = (g.age[i] as number) + dt;
      const dx = p.x - (g.x[i] as number);
      const dz = p.z - (g.z[i] as number);
      const d2 = dx * dx + dz * dz;
      if (g.mag[i]) {
        const dy = py - (g.y[i] as number);
        const d = Math.sqrt(d2 + dy * dy);
        const sp = (15 + (g.age[i] as number) * 12) * dt;
        if (d <= sp + 0.5) {
          this.gainXp(g.val[i] as number);
          this.events.emit(Ev.Gem, p.x, py, p.z, g.val[i] as number);
          g.free(i);
          continue;
        }
        g.x[i] = (g.x[i] as number) + (dx / d) * sp;
        g.y[i] = (g.y[i] as number) + (dy / d) * sp;
        g.z[i] = (g.z[i] as number) + (dz / d) * sp;
      } else if (d2 < r2) {
        g.mag[i] = 1;
        g.age[i] = 0;
      }
    }
    const k = this.pickups;
    for (let i = 0; i < k.n; i++) {
      if (!k.alive[i]) continue;
      k.age[i] = (k.age[i] as number) + dt;
      const dx = p.x - (k.x[i] as number);
      const dz = p.z - (k.z[i] as number);
      const d2 = dx * dx + dz * dz;
      const kind = k.kind[i] as number;
      if (k.mag[i]) {
        const dy = py - (k.y[i] as number);
        const d = Math.sqrt(d2 + dy * dy);
        const sp = 16 * dt;
        if (d <= sp + 0.5) {
          this.collectPickup(kind, k.val[i] as number);
          k.free(i);
          continue;
        }
        k.x[i] = (k.x[i] as number) + (dx / d) * sp;
        k.y[i] = (k.y[i] as number) + (dy / d) * sp;
        k.z[i] = (k.z[i] as number) + (dz / d) * sp;
      } else if (d2 < (kind === PickupKind.Coin ? r2 : 2.2 * 2.2)) {
        // Food stays on the ground while the hero is at full health.
        const food = kind === PickupKind.Bread || kind === PickupKind.Honey;
        if (!food || p.hp < this.stats.maxHp - 0.5) k.mag[i] = 1;
      }
    }
  }

  private collectPickup(kind: number, val: number): void {
    const p = this.player;
    if (kind === PickupKind.Coin) {
      this.addGold(val);
      this.events.emit(Ev.Coin, p.x, p.y, p.z, val);
    } else if (kind === PickupKind.Bread || kind === PickupKind.Honey) {
      this.heal(val);
      this.events.emit(Ev.Pickup, p.x, p.y, p.z, kind);
    } else if (kind === PickupKind.Vacuum) {
      const g = this.gems;
      for (let i = 0; i < g.n; i++) {
        if (g.alive[i] && !g.mag[i]) {
          g.mag[i] = 1;
          g.age[i] = 0;
        }
      }
      this.events.emit(Ev.Vacuum, p.x, p.y, p.z);
    }
  }

  chestCost(): number {
    return Math.round(12 * Math.pow(1.45, this.paidChests));
  }

  private updateInteract(dt: number, interact: boolean): void {
    const p = this.player;
    const pr = this.prompt;
    pr.kind = '';
    pr.progress = 0;
    for (let i = 0; i < this.chests.length; i++) {
      const c = this.chests[i] as Chest;
      if (c.opened) continue;
      const dx = p.x - c.x;
      const dz = p.z - c.z;
      if (dx * dx + dz * dz > 2.4 * 2.4) {
        c.progress = 0;
        continue;
      }
      if (c.free) {
        this.openChest(c);
        return;
      }
      const cost = this.chestCost();
      pr.kind = 'chest';
      pr.cost = cost;
      pr.affordable = this.gold >= cost;
      if (interact && pr.affordable) {
        c.progress += dt;
        if (c.progress >= 0.45) {
          this.gold -= cost;
          this.paidChests++;
          this.openChest(c);
          return;
        }
      } else {
        c.progress = 0;
      }
      pr.progress = c.progress / 0.45;
    }
    for (let i = 0; i < this.shrines.length; i++) {
      const s = this.shrines[i] as Shrine;
      if (s.used) continue;
      const dx = p.x - s.x;
      const dz = p.z - s.z;
      if (dx * dx + dz * dz > 3.4 * 3.4) {
        s.progress = 0;
        continue;
      }
      pr.kind = 'shrine';
      pr.affordable = true;
      if (interact) {
        s.progress += dt;
        if (s.progress >= 0.9) {
          s.progress = 0;
          this.choice = { type: 'shrine', index: i, options: this.blessingOptions() };
          this.events.emit(Ev.Shrine, s.x, s.y, s.z);
          return;
        }
      } else {
        s.progress = 0;
      }
      pr.progress = s.progress / 0.9;
    }
  }

  /** Each god grants at most two blessings per run. */
  private blessingOptions(): BlessingDef[] {
    const opts = BLESSINGS.filter((b) => this.blessings.filter((x) => x.id === b.id).length < 2);
    return opts.length > 0 ? opts : BLESSINGS;
  }

  private openChest(c: Chest): void {
    c.opened = true;
    this.events.emit(Ev.ChestOpen, c.x, c.y, c.z);
    this.choice = { type: 'chest', cards: chestCards(this) };
  }

  // ------------------------------------------------------------------ inventory & choices

  refreshStats(): void {
    const oldMax = this.stats.maxHp;
    this.stats = computeStats(this.character, this.shopLevels, this.passives, this.blessings);
    this.crit = critChance(this.stats.luck);
    if (this.stats.maxHp > oldMax) this.player.hp += this.stats.maxHp - oldMax;
    if (this.player.hp > this.stats.maxHp) this.player.hp = this.stats.maxHp;
  }

  findWeapon(id: string): WeaponInst | undefined {
    return this.weapons.find((w) => w.def.id === id);
  }

  findPassive(id: string): PassiveInst | undefined {
    return this.passives.find((p) => p.def.id === id);
  }

  addWeapon(id: string): WeaponInst | null {
    const def = WEAPON_BY_ID[id];
    if (!def || this.weapons.length >= MAX_WEAPONS) return null;
    const inst: WeaponInst = {
      def,
      level: 1,
      stats: weaponStatsAt(def, 1),
      bonus: 0,
      slot: this.weapons.length,
      timer: 0.4,
      active: 0,
      angle: 0,
      queue: 0,
      qT: 0,
      dealt: 0,
      fxCount: 0,
      fxArea: 0,
      ravens: [],
    };
    this.weapons.push(inst);
    return inst;
  }

  /** Swaps a maxed weapon for its evolved form, keeping slot, bonus and statistics. */
  evolveWeapon(inst: WeaponInst): boolean {
    const into = inst.def.evolution ? WEAPON_BY_ID[inst.def.evolution.into] : undefined;
    if (!into) return false;
    inst.def = into;
    inst.level = 1;
    inst.stats = weaponStatsAt(into, 1);
    inst.timer = 0.2;
    inst.active = 0;
    inst.queue = 0;
    inst.ravens.length = 0;
    this.evolved++;
    const p = this.player;
    this.events.emit(Ev.Evolve, p.x, p.y, p.z);
    this.announce.push(`Ewolucja: ${into.name}!`);
    return true;
  }

  private openLevelUp(): void {
    this.pendingLevels--;
    const p = this.player;
    this.events.emit(Ev.LevelUp, p.x, p.y, p.z, this.level);
    this.choice = { type: 'levelup', cards: levelUpCards(this, 3) };
  }

  /** Resolves the open choice with option `i`. */
  choose(i: number): void {
    const c = this.choice;
    if (!c) return;
    if (c.type === 'shrine') {
      const b = c.options[i];
      if (!b) return;
      const s = this.shrines[c.index] as Shrine;
      s.used = true;
      this.shrinesUsed++;
      this.blessings.push(b);
      this.refreshStats();
      if (b.instant === 'heal') this.heal(this.stats.maxHp);
      if (b.instant === 'gold') this.addGold(25);
      this.announce.push(`${b.god} błogosławi: ${b.name}`);
    } else {
      const card = c.cards[i];
      if (!card) return;
      applyCard(this, card);
    }
    this.choice = null;
    this.player.invuln = Math.max(this.player.invuln, 0.6);
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  /** Leaves a shrine without taking a blessing (it stays available). */
  cancelChoice(): void {
    if (this.choice?.type === 'shrine') this.choice = null;
  }

  reroll(): boolean {
    if (this.choice?.type !== 'levelup' || this.rerollsLeft <= 0) return false;
    this.rerollsLeft--;
    this.choice = { type: 'levelup', cards: levelUpCards(this, 3) };
    return true;
  }

  /**
   * Continue after defeating the boss. The victory has already been banked, so the counters that add up
   * across runs (gold, kills) restart from zero; shrine and evolution progress belong to the same run and stay.
   */
  startEndless(): void {
    this.endless = true;
    this.won = false;
    this.gold = 0;
    this.goldCollected = 0;
    this.kills = 0;
    this.killsByType.fill(0);
  }

  summary(): RunSummary {
    const killsByEnemy: Record<string, number> = {};
    ENEMIES.forEach((d, i) => {
      const k = this.killsByType[i] as number;
      if (k > 0) killsByEnemy[d.id] = k;
    });
    return {
      character: this.character.id,
      time: this.time,
      kills: this.kills,
      level: this.level,
      gold: Math.floor(this.gold),
      goldCollected: Math.floor(this.goldCollected),
      won: this.won,
      endless: this.endless,
      evolved: this.evolved,
      shrines: this.shrinesUsed,
      damageTaken: Math.round(this.damageTaken),
      killsByEnemy,
      weapons: this.weapons.map((w) => ({ id: w.def.id, name: w.def.name, level: w.level, dealt: Math.round(w.dealt) })),
      burnDealt: Math.round(this.burnDealt),
    };
  }
}

export type { Card, Rarity };
