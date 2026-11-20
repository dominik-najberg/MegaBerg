import { Rng } from '../core/rng';
import { SpatialGrid } from '../core/spatialGrid';
import { BLESSING_MAX, BLESSINGS, CIRCLE_BOONS, GREED_CURSE, GREED_GOLD } from '../data/blessings';
import { CHARACTERS } from '../data/characters';
import { ENEMIES } from '../data/enemies';
import { PASSIVES } from '../data/passives';
import { EXECUTE_CHANCE, ITEM_BY_ID, ITEMS, jugLevels, MIRROR_INVULN, MOSS_BONUS, MOSS_RAMP, PERUN_CHANCE, PERUN_DAMAGE, PERUN_RADIUS, PROC_CHANCE_CAP, PURSE_METRES, SKULL_CAP, SKULL_PER_KILL, SPARK_CHANCE, SPARK_DAMAGE, SPARK_RADIUS, type ItemEffect } from '../data/items';
import { WEAPON_MAX_LEVEL } from '../data/weaponLines';
import { applyLines, type LineStat } from '../data/weaponLines';
import type { BlessingDef, CharacterDef, EnemyDef, Rarity, Stats, WeaponDef, WeaponStats } from '../data/types';
import { ELITE_HP_MUL, enemyDamageMul, enemyHpMul, finalWaveMul, RUN_LENGTH, xpForLevel } from '../data/waves';
import { WEAPON_BY_ID, WEAPONS, weaponStatsAt } from '../data/weapons';
import { updateEnemies } from './ai';
import { Bonuses } from './bonuses';
import { applyCard, canBanish, chestCards, itemCard, levelUpCards, rollItem, type Card } from './cards';
import { Ev, EventQueue } from './events';
import { MoveFx, Player, stepPlayer, type InputState } from './player';
import { Enemies, Gems, Hazards, MAX_ENEMIES, PickupKind, Pickups, Projectiles, Shots, Zones } from './pools';
import { Spawner } from './spawner';
import { absorbShield, computeStats, critCount, critMultiplier, curseEffects, damageAfterArmor, dodgeChance, lifestealHeal, SHIELD_DELAY, SHIELD_RECHARGE, type ItemInst, type PassiveInst } from './stats';
import { Explored } from './fog';
import { GameMap, MAP_HALF, PLAY_RADIUS, type ShrineKind } from './terrain';
import { updateProjectiles, updateWeapons, updateZones } from './weapons';

export { RUN_LENGTH };

/** Weapon slots (stage 3: fewer, deeper weapons). */
export const MAX_WEAPONS = 4;
/** Book (Księga) slots; the code keeps the old name "passive". */
export const MAX_PASSIVES = 5;
/** `damageEnemy` slot for thorns damage (no weapon, no crit, counted separately). */
export const SLOT_THORNS = -2;
/** Highest damage bonus of Radogost's Pełna sakwa. */
export const GOLD_POWER_CAP = 0.3;
/** `damageEnemy` slot for item procs (lightning, sparks): no crit, no further procs, counted separately. */
export const SLOT_PROC = -3;

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
  /** Permanent damage bonus from rolled damage lines. */
  bonus: number;
  /** Sums of the other rolled stat lines (see src/data/weaponLines.ts). */
  lines: Partial<Record<LineStat, number>>;
  slot: number;
  timer: number;
  /** Remaining active time (orbit, cone). */
  active: number;
  /** Full active time of the current activation (weapon duration × duration stat). */
  span: number;
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
  /** A gift of the forest (see Bonuses): free, and looks unlike the paid chests. */
  gift: boolean;
  opened: boolean;
  progress: number;
}

export interface Shrine {
  x: number;
  y: number;
  z: number;
  kind: ShrineKind;
  used: boolean;
  /** Hold-E progress (seconds), or charge of a Święty krąg (seconds spent inside). */
  progress: number;
}

/** Portal of Leszy: appears at RUN_LENGTH; the hero summons the boss through it. */
export interface Portal {
  x: number;
  y: number;
  z: number;
  /** Hold-E progress in seconds. */
  progress: number;
  used: boolean;
}

/** Seconds of holding E to open the portal, and its reach. */
export const PORTAL_HOLD = 1.5;
export const PORTAL_REACH = 3.2;
/** The portal opens this far from the hero (metres). */
export const PORTAL_MIN = 25;
export const PORTAL_MAX = 40;
/** When Leszy comes out, ordinary enemies farther than this from the hero melt into the forest. */
export const HUSH_RADIUS = 22;

/** Gold price of the first paid reroll and of the first banish, and their growth. */
export const REROLL_COST = 8;
export const REROLL_COST_MUL = 1.5;
export const BANISH_COST = 12;
export const BANISH_COST_MUL = 1.5;

/** Radius of a Święty krąg and the seconds the hero must spend inside to charge it. */
export const CIRCLE_RADIUS = 5;
export const CIRCLE_CHARGE = 5;
/** Charge a circle loses per second while the hero is outside. */
export const CIRCLE_DECAY = 0.5;

export type Choice =
  | { type: 'levelup'; cards: Card[] }
  | { type: 'chest'; cards: Card[]; gift: boolean; greed?: boolean }
  /** `circle`: boons of a charged Święty krąg instead of gods. */
  | { type: 'shrine'; index: number; options: BlessingDef[]; circle?: boolean };

export interface Prompt {
  kind: '' | 'chest' | 'shrine' | 'circle' | 'amber' | 'greed' | 'portal';
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
  /** Ids of items chests may give. Defaults to everything without an unlock requirement. */
  itemPool?: string[];
}

export interface RunSummary {
  character: string;
  time: number;
  /** Kills banked by this summary (the endless part counts only its own). */
  kills: number;
  /** Kills of the whole run, including before endless mode started. */
  runKills: number;
  /** Gold of the whole run, including before endless mode started. */
  runGold: number;
  /** Silver multiplier at the end of the run. */
  silverGain: number;
  /** Seconds already paid with silver before this summary (endless continuation). */
  bankedTime: number;
  /** Highest movement speed multiplier reached. */
  peakMoveSpeed: number;
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
  /** Book (Księga) id -> level reached. */
  books: Record<string, number>;
  lifestealHealed: number;
  burnDealt: number;
}

const PICKUP_BASE = 2.6;
/** Gold for defeating the boss (before the gold-gain multiplier). */
export const BOSS_GOLD = 150;
/** Chance that a regular enemy drops a coin (before luck). */
export const COIN_CHANCE = 0.06;
/**
 * Extra coin chance at the very start of a run, fading to zero at COIN_EARLY_TIME seconds:
 * the first chests have to be affordable while the hero still has one weapon.
 */
export const COIN_EARLY_BONUS = 0.2;
export const COIN_EARLY_TIME = 210;
/** Cost of the first paid chest and its growth per chest bought. */
export const CHEST_COST = 10;
export const CHEST_COST_MUL = 1.75;

/** Coin drop chance of a regular enemy at run time t (seconds), before luck. */
export function coinChance(t: number): number {
  return COIN_CHANCE + COIN_EARLY_BONUS * Math.max(0, 1 - t / COIN_EARLY_TIME);
}

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
  readonly bonuses: Bonuses;
  /** Fog of war of the map screen (what the hero has seen in this run). */
  readonly fog = new Explored();
  /** Per landmark of the map: has the hero found it yet. */
  readonly landmarksFound: boolean[];
  readonly chests: Chest[] = [];
  readonly shrines: Shrine[] = [];
  readonly weapons: WeaponInst[] = [];
  readonly passives: PassiveInst[] = [];
  readonly blessings: BlessingDef[] = [];
  /** Skarby from chests: no slot limit, copies stack. */
  readonly items: ItemInst[] = [];
  /** Copies owned per item effect (kept in sync by addItem). */
  readonly fx: Record<ItemEffect, number> = {
    perunStone: 0,
    sparkFlint: 0,
    marzannaScythe: 0,
    wraithSkull: 0,
    hermitMoss: 0,
    wingedShoes: 0,
    travelPurse: 0,
    swarogAnvil: 0,
    smithJug: 0,
    witchMirror: 0,
  };
  readonly itemPool: Set<string>;
  readonly character: CharacterDef;
  readonly shopLevels: Record<string, number>;
  readonly weaponPool: Set<string>;
  readonly passivePool: Set<string>;
  /** Texts for the announcer banner; the UI drains this. */
  readonly announce: string[] = [];
  readonly killsByType = new Int32Array(ENEMIES.length);
  readonly prompt: Prompt = { kind: '', cost: 0, affordable: false, progress: 0 };

  stats: Stats;
  /** Current shield points (maximum is `stats.shield`). */
  shield = 0;
  time = 0;
  level = 1;
  xp = 0;
  xpNeed = xpForLevel(1);
  kills = 0;
  /** Kills of the whole run; unlike `kills` it is not reset when endless mode starts. */
  runKills = 0;
  gold = 0;
  goldCollected = 0;
  /** Run time already rewarded with silver (the victory, before endless mode). */
  bankedTime = 0;
  /** Gold of the whole run; unlike `goldCollected` it is not reset when endless mode starts. */
  runGold = 0;
  /** Highest movement speed reached in the run. */
  peakMoveSpeed = 1;
  paidChests = 0;
  private chestHinted = false;
  rerollsLeft = 0;
  /** Rerolls paid with gold this run (raises the next price). */
  paidRerolls = 0;
  /** Weapon and book ids banished from the card pool for this run. */
  readonly banished = new Set<string>();
  revivesLeft = 0;
  pendingLevels = 0;
  choice: Choice | null = null;
  dead = false;
  /** Dev menu immortality: every blow is ignored. */
  godMode = false;
  won = false;
  endless = false;
  bossIdx = -1;
  /** Portal of Leszy (null until RUN_LENGTH). */
  portal: Portal | null = null;
  /** True once the boss has been summoned through the portal (ends overtime). */
  bossSummoned = false;
  bossPhase = 1;
  evolved = 0;
  shrinesUsed = 0;
  damageTaken = 0;
  burnDealt = 0;
  thornsDealt = 0;
  procDealt = 0;
  executions = 0;
  /** Permanent damage bonus collected by Czaszka upiora. */
  skullBonus = 0;
  /** Seconds the hero has stood still (Mech pustelnika). */
  stillT = 0;
  /** Metres walked toward the next Sakiewka wędrowca coin. */
  purseM = 0;
  dodges = 0;
  lifestealHealed = 0;
  shieldAbsorbed = 0;
  hpMul = 1;
  dmgMul = 1;
  /** Hit-stop request in seconds (renderer/game loop consumes it). */
  hitstop = 0;

  /** Scratch buffers for spatial queries. */
  readonly cand = new Int32Array(MAX_ENEMIES);
  readonly bufA = new Int32Array(MAX_ENEMIES);
  readonly bufB = new Int32Array(MAX_ENEMIES);
  /** Targets of item effects, separate from bufA/bufB so a proc never overwrites the list of the attack that triggered it. */
  readonly bufC = new Int32Array(MAX_ENEMIES);

  constructor(map: GameMap, opts: WorldOptions = {}) {
    this.map = map;
    this.rng = new Rng(opts.seed ?? 1);
    this.bonuses = new Bonuses(opts.seed ?? 1);
    this.character = opts.character ?? (CHARACTERS[0] as CharacterDef);
    this.shopLevels = opts.shop ?? {};
    this.weaponPool = new Set(opts.weaponPool ?? WEAPONS.filter((w) => !w.evolved && !w.unlock).map((w) => w.id));
    this.passivePool = new Set(opts.passivePool ?? PASSIVES.filter((p) => !p.unlock).map((p) => p.id));
    this.itemPool = new Set(opts.itemPool ?? ITEMS.filter((i) => !i.unlock).map((i) => i.id));
    const p = this.player;
    p.y = map.heightAt(0, 0);
    p.yaw = Math.PI;
    p.savePrev();
    this.stats = computeStats(this.character, this.shopLevels, this.passives, this.blessings, this.items, this.level);
    p.hp = this.stats.maxHp;
    this.shield = this.stats.shield;
    this.rerollsLeft = Math.floor(this.stats.rerolls);
    this.revivesLeft = Math.floor(this.stats.revives);
    this.addWeapon(this.character.startWeapon);
    for (const c of map.chestSpots) {
      this.chests.push({ x: c.x, y: map.heightAt(c.x, c.z), z: c.z, rot: c.rot, free: false, gift: false, opened: false, progress: 0 });
    }
    for (const s of map.shrines) this.shrines.push({ x: s.x, y: map.heightAt(s.x, s.z), z: s.z, kind: s.kind, used: false, progress: 0 });
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
    this.updateEnemyScaling();

    const fx = stepPlayer(p, input, this.stats, this.map, dt);
    if (fx & MoveFx.Jump) this.events.emit(Ev.Jump, p.x, p.y, p.z);
    if (fx & MoveFx.AirJump) this.events.emit(Ev.AirJump, p.x, p.y, p.z);
    if (fx & MoveFx.Dash) this.events.emit(Ev.Dash, p.x, p.y, p.z);
    if (fx & MoveFx.Land) this.events.emit(Ev.Land, p.x, p.y, p.z, p.landImpact, p.inPuddle || this.map.inPuddle(p.x, p.z) ? 1 : 0);
    if (p.invuln > 0) p.invuln -= dt;
    p.hurtT += dt;
    const moved = Math.hypot(p.x - p.px, p.z - p.pz);
    this.stillT = moved < 0.001 ? this.stillT + dt : 0;
    if (this.fx.travelPurse > 0) {
      this.purseM += moved;
      while (this.purseM >= PURSE_METRES) {
        this.purseM -= PURSE_METRES;
        this.addGold(this.fx.travelPurse);
      }
    }
    if (this.stats.regen > 0 && p.hp < this.stats.maxHp) p.hp = Math.min(this.stats.maxHp, p.hp + this.stats.regen * dt);
    if (this.shield < this.stats.shield && p.hurtT >= SHIELD_DELAY) {
      this.shield = Math.min(this.stats.shield, this.shield + this.stats.shield * SHIELD_RECHARGE * dt);
    }

    const e = this.enemies;
    this.grid.build(e.n, e.alive, e.x, e.z);
    this.spawner.update(this, dt);
    this.bonuses.update(this);
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
   * Damages one enemy. `slot` >= 0 attributes the hit to a weapon (crits, burn, slow, knockback stat,
   * lifesteal, statistics); slot -1 is damage over time or environmental; SLOT_THORNS is thorns.
   */
  damageEnemy(i: number, base: number, slot: number, kx: number, kz: number, kb: number, st: WeaponStats | null): void {
    const e = this.enemies;
    if (!e.alive[i]) return;
    const def = ENEMIES[e.type[i] as number] as EnemyDef;
    let dmg = base;
    let flag = 0;
    if (slot >= 0) {
      const st0 = this.stats;
      dmg *= 1 + this.skullBonus + this.mossBonus() + this.goldPower();
      const crits = critCount(st0.critChance, this.rng.next());
      if (crits > 0) {
        dmg *= critMultiplier(crits, st0.critDamage);
        flag = 1;
      }
      kb *= st0.knockback;
      if (st0.lifesteal > 0) {
        const p = this.player;
        const heal = Math.min(lifestealHeal(st0.lifesteal, this.rng.next()), st0.maxHp - p.hp);
        if (heal > 0 && !this.dead) {
          p.hp += heal;
          this.lifestealHealed += heal;
        }
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
    } else if (slot === SLOT_THORNS) {
      flag = 2;
      this.thornsDealt += dmg;
    } else if (slot === SLOT_PROC) {
      flag = 2;
      this.procDealt += dmg;
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
    const ex = e.x[i] as number;
    const ez = e.z[i] as number;
    if ((e.hp[i] as number) <= 0) this.killEnemy(i);
    else if (slot >= 0 && this.fx.marzannaScythe > 0 && !def.rank && this.rng.next() < Math.min(PROC_CHANCE_CAP, EXECUTE_CHANCE * this.fx.marzannaScythe)) {
      // Kosa Marzanny: the rest of the enemy's health goes at once.
      this.executions++;
      e.hp[i] = 0;
      this.events.emit(Ev.Hit, ex, (e.y[i] as number) + (e.oy[i] as number), ez, 0, 1, def.height);
      this.killEnemy(i);
    }
    if (slot >= 0) this.itemProcs(ex, ez, dmg);
  }

  /** On-hit item effects of one weapon hit. They deal SLOT_PROC damage, which never procs again. */
  private itemProcs(x: number, z: number, dmg: number): void {
    const fx = this.fx;
    if (fx.perunStone > 0 && this.rng.next() < Math.min(PROC_CHANCE_CAP, PERUN_CHANCE * fx.perunStone)) {
      const y = this.map.heightAt(x, z);
      this.events.emit(Ev.Lightning, x, y, z, x + 1.5, y + 22, z - 1, 0x9fd0ff);
      this.procCircle(x, z, PERUN_RADIUS, dmg * PERUN_DAMAGE, 2);
    }
    if (fx.sparkFlint > 0 && this.rng.next() < Math.min(PROC_CHANCE_CAP, SPARK_CHANCE * fx.sparkFlint)) {
      const r = SPARK_RADIUS * Math.sqrt(this.stats.area);
      this.events.emit(Ev.Explosion, x, this.map.heightAt(x, z) + 0.8, z, r, 0xffa040);
      this.procCircle(x, z, r, dmg * SPARK_DAMAGE, 3);
    }
  }

  /** damageCircle for item effects: its own target buffer (bufC) and SLOT_PROC damage. */
  private procCircle(x: number, z: number, r: number, dmg: number, kb: number): void {
    const e = this.enemies;
    const n = this.collect(x, z, r, this.bufC);
    for (let k = 0; k < n; k++) {
      const j = this.bufC[k] as number;
      let dx = (e.x[j] as number) - x;
      let dz = (e.z[j] as number) - z;
      const d = Math.hypot(dx, dz);
      if (d > 0.001) {
        dx /= d;
        dz /= d;
      }
      this.damageEnemy(j, dmg, SLOT_PROC, dx, dz, kb, null);
    }
  }

  /** Radogost's Pełna sakwa: +1% damage per 10 gold carried, up to +50%. */
  goldPower(): number {
    return this.character.passive.power === 'goldPower' ? Math.min(GOLD_POWER_CAP, (this.gold / 10) * 0.01) : 0;
  }

  /** Mech pustelnika: damage bonus that builds up while the hero stands still. */
  mossBonus(): number {
    const n = this.fx.hermitMoss;
    return n > 0 ? MOSS_BONUS * n * Math.min(1, this.stillT / MOSS_RAMP) : 0;
  }

  /** Highest weapon level: the base cap plus Dzban kowala. */
  weaponCap(): number {
    return WEAPON_MAX_LEVEL + jugLevels(this.fx.smithJug);
  }

  /** Adds one copy of an item. */
  addItem(id: string): void {
    const def = ITEM_BY_ID[id];
    if (!def) return;
    const inst = this.items.find((x) => x.def.id === id);
    if (inst) inst.count++;
    else this.items.push({ def, count: 1 });
    if (def.effect) this.fx[def.effect]++;
    this.refreshStats();
  }

  itemCount(id: string): number {
    return this.items.find((x) => x.def.id === id)?.count ?? 0;
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
    this.runKills++;
    if (this.fx.wraithSkull > 0) this.skullBonus = Math.min(SKULL_CAP * this.fx.wraithSkull, this.skullBonus + SKULL_PER_KILL * this.fx.wraithSkull);
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
        for (let k = 0; k < 30; k++) this.dropCoin(x + rng.range(-6, 6), gy, z + rng.range(-6, 6), BOSS_GOLD / 30);
      }
    } else if (def.rank === 'mini') {
      for (let k = 0; k < 10; k++) this.dropCoin(x + rng.range(-2.5, 2.5), gy, z + rng.range(-2.5, 2.5), 4);
      this.spawnChest(x, z, true);
      this.pickups.spawn(PickupKind.Bread, x + 1, gy, z + 1, 30);
      this.hitstop = 0.18;
    } else {
      if (elite) {
        // Elites always pay: a small purse next to the free chest.
        this.spawnChest(x, z, true);
        for (let k = 0; k < 5; k++) this.dropCoin(x + rng.range(-1.5, 1.5), gy, z + rng.range(-1.5, 1.5), 2);
      }
      if (rng.next() < coinChance(this.time) * (1 + luck * 0.6)) this.dropCoin(x, gy, z, 1);
      else if (rng.next() < 0.007 * (1 + luck * 0.5)) {
        if (rng.next() < 0.25) this.pickups.spawn(PickupKind.Honey, x, gy, z, 60);
        else this.pickups.spawn(PickupKind.Bread, x, gy, z, 25);
      } else if (rng.next() < 0.0012) this.pickups.spawn(PickupKind.Magnet, x, gy, z, 0);
    }
    e.free(i);
    if (def.rank) this.trackBoss();
  }

  /**
   * Coins from a kill are collected automatically: they appear already pulled toward the hero
   * (like after a magnet), so the player never has to walk back for them.
   */
  private dropCoin(x: number, y: number, z: number, val: number): void {
    const i = this.pickups.spawn(PickupKind.Coin, x, y, z, val);
    if (i >= 0) this.pickups.mag[i] = 1;
    else this.addGold(val); // pool full: the coin still counts
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

  /** `attacker` is the enemy index for melee contact (thorns hit it back), -1 for anything else. */
  hurtPlayer(damage: number, attacker = -1): void {
    const p = this.player;
    if (this.godMode || p.invuln > 0 || this.dead || (this.won && !this.endless)) return;
    const st = this.stats;
    if (st.evasion > 0 && this.rng.next() < dodgeChance(st.evasion)) {
      // A dodged blow still grants the usual invulnerability, otherwise a crowd would re-roll every frame.
      p.invuln = 0.5;
      this.dodges++;
      this.events.emit(Ev.Dodge, p.x, p.y, p.z);
      return;
    }
    if (attacker >= 0 && st.thorns > 0 && this.enemies.alive[attacker]) {
      const e = this.enemies;
      const dx = (e.x[attacker] as number) - p.x;
      const dz = (e.z[attacker] as number) - p.z;
      const dl = Math.hypot(dx, dz) || 1;
      this.damageEnemy(attacker, st.thorns * st.damage, SLOT_THORNS, dx / dl, dz / dl, 0, null);
      // Thorns can kill the boss: the run is won and the blow that triggered them no longer lands.
      if (this.won && !this.endless) return;
    }
    let d = damageAfterArmor(damage, st.armor);
    p.invuln = 0.5 + MIRROR_INVULN * this.fx.witchMirror;
    p.hurtT = 0;
    if (this.shield > 0) {
      const r = absorbShield(this.shield, d);
      this.shieldAbsorbed += d - r.through;
      this.shield = r.shield;
      d = r.through;
      if (d <= 0) {
        this.events.emit(Ev.ShieldHit, p.x, p.y, p.z);
        return;
      }
    }
    p.hp -= d;
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
    this.xp += value * this.stats.xpGain * curseEffects(this.stats.curse).reward;
    const before = this.level;
    while (this.xp >= this.xpNeed) {
      this.xp -= this.xpNeed;
      this.level++;
      this.xpNeed = xpForLevel(this.level);
      this.pendingLevels++;
    }
    // The hero's passive grows with every level.
    if (this.level !== before && this.character.passive.perLevel.length > 0) this.refreshStats();
  }

  addGold(value: number): void {
    const v = value * this.stats.goldGain * curseEffects(this.stats.curse).reward;
    this.gold += v;
    this.goldCollected += v;
    this.runGold += v;
    // Tell a new player once what the coins are for, the moment the first chest becomes affordable.
    if (!this.chestHinted && this.paidChests === 0 && this.gold >= this.chestCost()) {
      this.chestHinted = true;
      this.announce.push('Stać cię na skrzynię! Najbliższe widać na mapie [Tab].');
    }
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
    e.speed[i] = def.speed * (0.92 + this.rng.next() * 0.16) * curseEffects(this.stats.curse).enemySpeed;
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

  /** Without `rot` the chest gets a random facing from the world's random stream. */
  spawnChest(x: number, z: number, free: boolean, gift = false, rot = this.rng.range(0, 6.28)): Chest {
    const c: Chest = { x, y: this.map.heightAt(x, z), z, rot, free, gift, opened: false, progress: 0 };
    this.chests.push(c);
    return c;
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
        // Like gems, pulled loot speeds up, so coins called by a magnet cross the whole map in seconds.
        const sp = (16 + (k.age[i] as number) * 12) * dt;
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
        if (!food || p.hp < this.stats.maxHp - 0.5) {
          k.mag[i] = 1;
          k.age[i] = 0;
        }
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
    } else if (kind === PickupKind.Magnet) {
      // Every gem and coin of the map flies to the hero; food stays where it lies.
      const g = this.gems;
      for (let i = 0; i < g.n; i++) {
        if (g.alive[i] && !g.mag[i]) {
          g.mag[i] = 1;
          g.age[i] = 0;
        }
      }
      const k = this.pickups;
      for (let i = 0; i < k.n; i++) {
        if (k.alive[i] && !k.mag[i] && k.kind[i] === PickupKind.Coin) {
          k.mag[i] = 1;
          k.age[i] = 0;
        }
      }
      this.events.emit(Ev.Magnet, p.x, p.y, p.z);
    }
  }

  chestCost(): number {
    return Math.round(CHEST_COST * Math.pow(CHEST_COST_MUL, this.paidChests));
  }

  private updateInteract(dt: number, interact: boolean): void {
    const p = this.player;
    const pr = this.prompt;
    pr.kind = '';
    pr.progress = 0;
    const po = this.portal;
    if (po && !po.used) {
      const dx = p.x - po.x;
      const dz = p.z - po.z;
      if (dx * dx + dz * dz <= PORTAL_REACH * PORTAL_REACH) {
        pr.kind = 'portal';
        pr.affordable = true;
        po.progress = interact ? po.progress + dt : 0;
        pr.progress = po.progress / PORTAL_HOLD;
        if (po.progress >= PORTAL_HOLD) {
          po.used = true;
          this.bossSummoned = true;
          // Leszy must not inherit the final wave's hardening.
          this.updateEnemyScaling();
          this.hushForest();
          this.spawner.summonBoss(this, po.x + 7, po.z);
        }
        return;
      }
      po.progress = 0;
    }
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
      const d2 = dx * dx + dz * dz;
      if (s.kind === 'circle') {
        // Święty krąg charges while the hero stands inside, under pressure from the horde; no key needed.
        if (d2 <= CIRCLE_RADIUS * CIRCLE_RADIUS) {
          s.progress += dt;
          pr.kind = 'circle';
          pr.affordable = true;
          pr.progress = s.progress / CIRCLE_CHARGE;
          if (s.progress >= CIRCLE_CHARGE) {
            s.progress = 0;
            this.choice = { type: 'shrine', index: i, options: this.circleOptions(), circle: true };
            this.events.emit(Ev.Shrine, s.x, s.y, s.z);
            return;
          }
        } else if (s.progress > 0) {
          s.progress = Math.max(0, s.progress - CIRCLE_DECAY * dt);
        }
        continue;
      }
      if (d2 > 3.4 * 3.4) {
        s.progress = 0;
        continue;
      }
      pr.kind = s.kind === 'god' ? 'shrine' : s.kind;
      pr.affordable = true;
      if (interact) {
        s.progress += dt;
        if (s.progress >= 0.9) {
          s.progress = 0;
          this.events.emit(Ev.Shrine, s.x, s.y, s.z);
          if (s.kind === 'god') this.choice = { type: 'shrine', index: i, options: this.blessingOptions() };
          else if (s.kind === 'amber') this.useAmberShrine(s);
          else this.useGreedShrine(s);
          return;
        }
      } else {
        s.progress = 0;
      }
      pr.progress = s.progress / 0.9;
    }
  }

  /** Enemy health and damage multipliers for spawns: run time, curse and (until the boss is summoned) the final wave. */
  updateEnemyScaling(): void {
    const curse = curseEffects(this.stats.curse);
    const fin = this.bossSummoned || this.endless ? 1 : finalWaveMul(this.time);
    this.hpMul = enemyHpMul(this.time) * curse.enemyHp * fin;
    this.dmgMul = enemyDamageMul(this.time) * curse.enemyDamage * fin;
  }

  /** Opens Leszy's portal at a random free spot PORTAL_MIN..PORTAL_MAX metres from the hero. */
  openPortal(): void {
    if (this.portal) return;
    const p = this.player;
    let x = p.x;
    let z = p.z + PORTAL_MIN;
    // A free spot with a clear walk from the hero (no tree or rock in the way), so the portal is reachable
    // by simply heading toward it. Falls back to the last free spot.
    let found = false;
    for (let tries = 0; tries < 60 && !found; tries++) {
      const a = this.rng.range(0, Math.PI * 2);
      const d = this.rng.range(PORTAL_MIN, PORTAL_MAX);
      const cx = p.x + Math.cos(a) * d;
      const cz = p.z + Math.sin(a) * d;
      if (Math.hypot(cx, cz) > PLAY_RADIUS - 12 || !this.map.isFree(cx, cz, 3)) continue;
      x = cx;
      z = cz;
      found = this.clearWalk(p.x, p.z, cx, cz);
    }
    this.portal = { x, y: this.map.heightAt(x, z), z, progress: 0, used: false };
    this.events.emit(Ev.Bonus, x, this.portal.y, z, 2);
  }

  /** True when nothing solid stands on the straight line between two points. */
  private clearWalk(x0: number, z0: number, x1: number, z1: number): boolean {
    const d = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.ceil(d / 1.5);
    for (let k = 1; k < n; k++) {
      const t = k / n;
      if (!this.map.isFree(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0.9)) return false;
    }
    return true;
  }

  /** The forest falls silent before Leszy: distant ordinary enemies vanish (no drops, no kill credit). */
  private hushForest(): void {
    const e = this.enemies;
    const p = this.player;
    for (let i = 0; i < e.n; i++) {
      if (!e.alive[i] || (ENEMIES[e.type[i] as number] as EnemyDef).rank) continue;
      if (Math.hypot((e.x[i] as number) - p.x, (e.z[i] as number) - p.z) > HUSH_RADIUS) this.despawn(i);
    }
  }

  /** Three different boons of a charged Święty krąg. */
  private circleOptions(): BlessingDef[] {
    const pool = CIRCLE_BOONS.slice();
    const out: BlessingDef[] = [];
    while (out.length < 3 && pool.length > 0) out.push(pool.splice(this.rng.int(pool.length), 1)[0] as BlessingDef);
    return out;
  }

  /** Kapliczka bursztynowa: every gem on the map flies to the hero. */
  private useAmberShrine(s: Shrine): void {
    s.used = true;
    this.shrinesUsed++;
    const g = this.gems;
    for (let i = 0; i < g.n; i++) {
      if (g.alive[i] && !g.mag[i]) {
        g.mag[i] = 1;
        g.age[i] = 0;
      }
    }
    const p = this.player;
    this.events.emit(Ev.Magnet, p.x, p.y, p.z);
    this.announce.push('Bursztyny z całego boru lecą do ciebie!');
  }

  /** Ołtarz chciwości: a permanent curse in exchange for a treasure and a purse of gold. */
  private useGreedShrine(s: Shrine): void {
    s.used = true;
    this.shrinesUsed++;
    this.blessings.push(GREED_CURSE);
    this.refreshStats();
    this.addGold(GREED_GOLD);
    this.announce.push('Chciwość ma swoją cenę: bór gęstnieje od wrogów.');
    const item = rollItem(this);
    if (item) this.choice = { type: 'chest', cards: [itemCard(this, item)], gift: false, greed: true };
  }

  /** Each god grants at most BLESSING_MAX blessings per run. */
  private blessingOptions(): BlessingDef[] {
    const opts = BLESSINGS.filter((b) => this.blessings.filter((x) => x.id === b.id).length < BLESSING_MAX);
    return opts.length > 0 ? opts : BLESSINGS;
  }

  private openChest(c: Chest): void {
    c.opened = true;
    this.events.emit(Ev.ChestOpen, c.x, c.y, c.z, c.gift ? 1 : 0);
    this.choice = { type: 'chest', cards: chestCards(this), gift: c.gift };
  }

  // ------------------------------------------------------------------ inventory & choices

  refreshStats(): void {
    this.refreshStatsInner();
    if (this.stats.moveSpeed > this.peakMoveSpeed) this.peakMoveSpeed = this.stats.moveSpeed;
  }

  private refreshStatsInner(): void {
    const oldMax = this.stats.maxHp;
    const oldShield = this.stats.shield;
    this.stats = computeStats(this.character, this.shopLevels, this.passives, this.blessings, this.items, this.level);
    if (this.stats.maxHp > oldMax) this.player.hp += this.stats.maxHp - oldMax;
    if (this.stats.shield > oldShield) this.shield += this.stats.shield - oldShield;
    if (this.shield > this.stats.shield) this.shield = this.stats.shield;
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
      lines: {},
      slot: this.weapons.length,
      timer: 0.4,
      active: 0,
      span: 0,
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

  /** Recomputes a weapon's stats from its milestones and rolled lines. */
  refreshWeapon(inst: WeaponInst): void {
    inst.stats = applyLines(weaponStatsAt(inst.def, inst.level), inst.lines);
  }

  /** Swaps a weapon for its evolved form, keeping slot, level, rolled lines and statistics. */
  evolveWeapon(inst: WeaponInst): boolean {
    const into = inst.def.evolution ? WEAPON_BY_ID[inst.def.evolution.into] : undefined;
    if (!into) return false;
    inst.def = into;
    this.refreshWeapon(inst);
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
      this.announce.push(c.circle ? `Święty krąg obdarza: ${b.name}` : `${b.god} błogosławi: ${b.name}`);
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
    if (this.choice?.type === 'shrine' && !this.choice.circle) this.choice = null;
  }

  /** Gold price of the next reroll once the free ones (Kości wróżebne) are used up. */
  rerollCost(): number {
    return Math.round(REROLL_COST * Math.pow(REROLL_COST_MUL, this.paidRerolls));
  }

  /** Gold price of the next banish. */
  banishCost(): number {
    return Math.round(BANISH_COST * Math.pow(BANISH_COST_MUL, this.banished.size));
  }

  /** Draws new level-up cards: free while Kości wróżebne last, then for gold. */
  reroll(): boolean {
    if (this.choice?.type !== 'levelup') return false;
    if (this.rerollsLeft > 0) {
      this.rerollsLeft--;
    } else {
      const cost = this.rerollCost();
      if (this.gold < cost) return false;
      this.gold -= cost;
      this.paidRerolls++;
    }
    this.choice = { type: 'levelup', cards: levelUpCards(this, 3) };
    return true;
  }

  /**
   * Banishes a new weapon or book offered on level-up card `i` for the rest of the run (for gold)
   * and draws a replacement card in its place.
   */
  banish(i: number): boolean {
    const c = this.choice;
    if (c?.type !== 'levelup') return false;
    const card = c.cards[i];
    if (!card || !canBanish(card)) return false;
    const cost = this.banishCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.banished.add(card.id);
    const others = new Set(c.cards.filter((_, k) => k !== i).map((x) => `${x.kind}:${x.id}`));
    const fresh = levelUpCards(this, 6).find((x) => !others.has(`${x.kind}:${x.id}`));
    if (fresh) c.cards[i] = fresh;
    else c.cards.splice(i, 1);
    return true;
  }

  /**
   * Continue after defeating the boss. The victory has already been banked, so the counters that add up
   * across runs (gold, kills) restart from zero; shrine and evolution progress belong to the same run and stay.
   */
  startEndless(): void {
    // Everything up to now was banked with the victory; the endless part is paid for from here.
    this.bankedTime = this.time;
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
      runKills: this.runKills,
      runGold: Math.floor(this.runGold),
      silverGain: this.stats.silverGain,
      bankedTime: this.bankedTime,
      peakMoveSpeed: this.peakMoveSpeed,
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
      books: Object.fromEntries(this.passives.map((p) => [p.def.id, p.level])),
      lifestealHealed: Math.round(this.lifestealHealed),
      burnDealt: Math.round(this.burnDealt),
    };
  }
}

export type { Card, Rarity };
