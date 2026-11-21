export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** Player statistics. Every modifier in the game is additive on one of these fields. */
export interface Stats {
  maxHp: number;
  /** HP per second. */
  regen: number;
  /** Flat damage reduction per hit. */
  armor: number;
  /** Multipliers (1 = base). */
  moveSpeed: number;
  damage: number;
  /** Cooldown multiplier, lower = faster attacks. Kept for existing sources; see `attackSpeed`. */
  cooldown: number;
  /** Attack speed multiplier (1 = base). Weapon interval = base × cooldown / attackSpeed. */
  attackSpeed: number;
  area: number;
  pickup: number;
  xpGain: number;
  goldGain: number;
  /** Extra projectiles / blades / ravens. */
  projectiles: number;
  /** 0 = base. Raises card rarity and drop rates. */
  luck: number;
  /** Chance of a critical hit per weapon hit. Above 1 every hit crits and the rest is the chance of an overcrit. */
  critChance: number;
  /** Damage multiplier of a crit (2 = double). An overcrit adds the bonus part again. */
  critDamage: number;
  /** Multiplier of weapon active time and projectile / zone lifetime. */
  duration: number;
  /** Multiplier of projectile flight speed. */
  projectileSpeed: number;
  /** Multiplier of knockback dealt by weapons. */
  knockback: number;
  /** Chance per weapon hit to heal 1 HP. Above 1 every hit heals 1 and the rest is the chance of a second HP. */
  lifesteal: number;
  /** Flat damage dealt back to an enemy that hits the hero in melee (scaled by `damage`). */
  thorns: number;
  /** Raw evasion; the chance to dodge a hit is evasion / (1 + evasion). */
  evasion: number;
  /** Shield points absorbing damage before HP; recharge after a while without damage. */
  shield: number;
  /** Curse: 0 = base. Raises enemy count, health, damage and speed, and XP and gold gained. */
  curse: number;
  /** Silver (meta currency) multiplier. Not used yet. */
  silverGain: number;
  extraJumps: number;
  revives: number;
  rerolls: number;
  /** Fraction of hit damage applied again as burn per second (Swaróg). */
  burn: number;
}

export type StatKey = keyof Stats;

export interface StatMod {
  stat: StatKey;
  add: number;
}

export const BASE_STATS: Readonly<Stats> = {
  maxHp: 100,
  regen: 0.25,
  armor: 0,
  moveSpeed: 1,
  damage: 1,
  cooldown: 1,
  attackSpeed: 1,
  area: 1,
  pickup: 1,
  xpGain: 1,
  goldGain: 1,
  projectiles: 0,
  luck: 0,
  critChance: 0.05,
  critDamage: 2,
  duration: 1,
  projectileSpeed: 1,
  knockback: 1,
  lifesteal: 0,
  thorns: 0,
  evasion: 0,
  shield: 0,
  curse: 0,
  silverGain: 1,
  extraJumps: 0,
  revives: 0,
  rerolls: 0,
  burn: 0,
};

export type WeaponKind =
  | 'orbit'
  | 'bolt'
  | 'lightning'
  | 'sweep'
  | 'aura'
  | 'bounce'
  | 'summon'
  | 'cone'
  | 'lob'
  /** Projectiles that steer toward enemies. */
  | 'homing'
  /** Traps dropped on the ground that snap shut on the first enemy to step in. */
  | 'trap'
  /** Burning ground left behind the hero. */
  | 'trail'
  /** A thrown stick that flies out and comes back. */
  | 'boomerang'
  /** Whirlwinds that roam on their own. */
  | 'wander'
  /** A zone that drags enemies to its centre. */
  | 'vortex'
  /** Blocks a blow that would land and answers with a shockwave. */
  | 'guard'
  /** A thread from the hero to an enemy that hurts everything on the line. */
  | 'tether';

/**
 * One extra rule on top of a weapon's kind (stage C of docs/BRONIE-PLAN.md). The numbers live in src/data/weapons.ts.
 * lunge: a sweep struck at the target instead of around the hero; fang: kills may raise max health for the run;
 * dice: damage rolled 1..6, a six adds crit chance for the run; lowHp: stronger the less health the hero has;
 * reap: kills charge a triple swing.
 */
export type WeaponRule = 'lunge' | 'fang' | 'dice' | 'lowHp' | 'reap';

export interface WeaponStats {
  damage: number;
  /** Seconds between activations. */
  cooldown: number;
  /** Blades / projectiles / strikes / ravens. */
  count: number;
  /** Radius, reach or size depending on kind (metres). */
  area: number;
  /** Projectile or angular speed. */
  speed: number;
  /** Active time (orbit, cone) or lifetime (projectiles, zones). */
  duration: number;
  pierce: number;
  knockback: number;
  /** Targeting range. */
  range: number;
  /** Arc width in radians (sweep, cone). */
  arc: number;
  bounces: number;
  /** Explosion radius on impact. */
  explode: number;
  /** Burn damage per second applied on hit. */
  burn: number;
  /** Slow strength 0..1 applied on hit. */
  slow: number;
  /** Chain jumps (lightning). */
  chain: number;
}

export interface WeaponLevel extends Partial<WeaponStats> {
  /** Polish text shown on the level-up card. */
  note: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  desc: string;
  kind: WeaponKind;
  /** Main colour of effects. */
  color: number;
  icon: string;
  base: Partial<WeaponStats>;
  /** Levels 2..N. Each entry overrides the listed stats (cumulatively). */
  levels: WeaponLevel[];
  /** Max level + this passive owned -> can evolve into another weapon. */
  evolution?: { passive: string; into: string };
  /** Evolved weapons never appear as normal cards. */
  evolved?: boolean;
  /** Achievement id required to unlock. */
  unlock?: string;
  /** Bolt weapons: aim at the toughest enemy in range instead of the nearest. */
  aim?: 'strongest';
  /** Extra damage against mini-bosses and bosses (0.5 = +50%). */
  rankBonus?: number;
  rule?: WeaponRule;
  /** Silver price in the Skarbiec: once unlocked, the weapon still has to be bought before it joins the pool. */
  silver?: number;
}

export interface PassiveDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: number;
  maxLevel: number;
  stat: StatKey;
  perLevel: number;
  /** Formats one level of the bonus for the card text, e.g. "+10% obrażeń". */
  fmt: (v: number) => string;
  /** Secondary bonuses per level, scaled by card rarity like `perLevel`. */
  also?: StatMod[];
  /** Integer-valued passives ignore card rarity and always show this one. */
  fixedRarity?: Rarity;
  unlock?: string;
}

export type AiKind =
  | 'chase'
  | 'fly'
  | 'kamikaze'
  | 'leaper'
  | 'charger'
  | 'ranged'
  | 'teleporter'
  | 'jaga'
  | 'poludnica'
  | 'leszy'
  | 'topielec';

export interface EnemyDef {
  id: string;
  name: string;
  ai: AiKind;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  height: number;
  /** XP gem value dropped. */
  xp: number;
  /** 0..1 knockback resistance. */
  weight: number;
  flying?: boolean;
  rank?: 'mini' | 'boss';
  /** Render scale applied to the model. */
  scale: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  desc: string;
  bonus: string;
  startWeapon: string;
  mods: StatMod[];
  /** Passive that grows with the hero's level in a run (stage 5 of docs/MEGABONK-ANALIZA.md). */
  passive: CharacterPassive;
  unlock?: string;
  look: {
    shirt: number;
    trim: number;
    pants: number;
    hair: number;
    skin: number;
    build: number;
    style: 'wojmir' | 'dobroslawa' | 'bogumil' | 'jagna';
    /** Extra dress on top of the style; heroes that share a style differ by it. */
    outfit?: 'perun';
  };
}

export interface CharacterPassive {
  name: string;
  /** Polish text for the character card. */
  desc: string;
  /** Added once per level above 1. */
  perLevel: StatMod[];
  /** Special rule handled in the simulation. */
  power?: 'goldPower' | 'speedPower';
}

export interface ShopItemDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  stat: StatKey;
  perLevel: number;
  maxLevel: number;
  baseCost: number;
  costMul: number;
  fmt: (v: number) => string;
}

export interface BlessingDef {
  id: string;
  god: string;
  name: string;
  desc: string;
  icon: string;
  color: number;
  mods: StatMod[];
  instant?: 'heal' | 'gold';
}

export type AchievementCond =
  | { type: 'survive'; seconds: number }
  | { type: 'totalKills'; count: number }
  | { type: 'runKills'; count: number }
  | { type: 'killEnemy'; enemy: string }
  | { type: 'level'; level: number }
  | { type: 'evolve' }
  | { type: 'totalGold'; count: number }
  | { type: 'win' }
  | { type: 'winWith'; character: string }
  | { type: 'shrines'; count: number }
  /** A book (Księga) reached this level in one run; with `before`, no later than that second of the run. */
  | { type: 'book'; book: string; level: number; before?: number }
  /** Gold collected in one run. */
  | { type: 'runGold'; count: number }
  /** Movement speed multiplier reached in one run. */
  | { type: 'speed'; value: number }
  /** HP healed by lifesteal in one run. */
  | { type: 'lifesteal'; amount: number }
  /** Weapons evolved in one run. */
  | { type: 'evolveCount'; count: number }
  /** A weapon reached this level in one run: any weapon, or the line of `weapon` (the weapon or its evolution). */
  | { type: 'weaponLevel'; level: number; weapon?: string }
  /** Survived this long while taking at most `damage` in total. */
  | { type: 'unhurt'; seconds: number; damage: number }
  /** Kills in total with one weapon line (the weapon or its evolution; burn counts for the weapon that lit it). */
  | { type: 'weaponKills'; weapon: string; count: number }
  /** One enemy type defeated this many times in total. */
  | { type: 'enemyKills'; enemy: string; count: number }
  /** This many seconds in a row without losing health, in one run. */
  | { type: 'unhurtStreak'; seconds: number }
  /** Damage taken off landed blows by armour in one run, optionally with one hero. */
  | { type: 'armorBlocked'; amount: number; character?: string }
  /** A secret found on the map. */
  | { type: 'secret'; id: string };

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  reward: string;
  cond: AchievementCond;
}

export interface WavePhase {
  /** Seconds from run start. */
  from: number;
  /** Desired number of living enemies at the start / end of the phase. */
  alive: [number, number];
  /** Spawns per second cap. */
  rate: number;
  /** Enemy id -> weight. */
  mix: Record<string, number>;
}

export interface WaveEvent {
  at: number;
  kind: 'mini' | 'boss' | 'swarm' | 'elite' | 'portal';
  enemy: string;
  count?: number;
  text?: string;
}
