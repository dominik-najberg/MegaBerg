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
  /** Cooldown multiplier, lower = faster attacks. */
  cooldown: number;
  area: number;
  pickup: number;
  xpGain: number;
  goldGain: number;
  /** Extra projectiles / blades / ravens. */
  projectiles: number;
  /** 0 = base. Raises card rarity, crit chance and drop rates. */
  luck: number;
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
  regen: 0,
  armor: 0,
  moveSpeed: 1,
  damage: 1,
  cooldown: 1,
  area: 1,
  pickup: 1,
  xpGain: 1,
  goldGain: 1,
  projectiles: 0,
  luck: 0,
  extraJumps: 0,
  revives: 0,
  rerolls: 0,
  burn: 0,
};

export type WeaponKind = 'orbit' | 'bolt' | 'lightning' | 'sweep' | 'aura' | 'bounce' | 'summon' | 'cone' | 'lob';

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
  unlock?: string;
  look: {
    shirt: number;
    trim: number;
    pants: number;
    hair: number;
    skin: number;
    build: number;
    style: 'wojmir' | 'dobroslawa' | 'bogumil' | 'jagna';
  };
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
  | { type: 'shrines'; count: number };

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
  kind: 'mini' | 'boss' | 'swarm' | 'elite';
  enemy: string;
  count?: number;
  text?: string;
}
