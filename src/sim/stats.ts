import { clamp } from '../core/math';
import { BASE_STATS, type BlessingDef, type CharacterDef, type PassiveDef, type StatKey, type Stats } from '../data/types';
import { SHOES_SHARE, type ItemDef } from '../data/items';
import { SHOP } from '../data/shop';

/** Copies of one item owned in a run. */
export interface ItemInst {
  def: ItemDef;
  count: number;
}

export interface PassiveInst {
  def: PassiveDef;
  level: number;
  /** Sum of rarity powers of every level taken (1 per common level). */
  power: number;
}

/** Damage per 1.0 of movement speed above base for Strzeżymir's Pęd (1% speed = +0.5% damage). */
export const SPEED_POWER = 0.5;

/** Upper limits of stats that have one. A book of a capped stat stops being offered. */
export const STAT_CAPS: Partial<Record<StatKey, number>> = { moveSpeed: 2.2, attackSpeed: 5 };

/** True when more of this stat would do nothing. */
export function statCapped(s: Stats, stat: StatKey): boolean {
  const cap = STAT_CAPS[stat];
  return cap !== undefined && s[stat] >= cap - 1e-9;
}

/** Final player stats from character, Chata upgrades, passives and blessings. Pure function. */
export function computeStats(
  character: CharacterDef | null,
  shopLevels: Readonly<Record<string, number>>,
  passives: readonly PassiveInst[],
  blessings: readonly BlessingDef[],
  items: readonly ItemInst[] = [],
  level = 1,
): Stats {
  const s: Stats = { ...BASE_STATS };
  if (character) {
    for (const m of character.mods) s[m.stat] += m.add;
    const grown = Math.max(0, level - 1);
    for (const m of character.passive.perLevel) s[m.stat] += m.add * grown;
  }
  for (const item of SHOP) {
    const lvl = shopLevels[item.id] ?? 0;
    if (lvl > 0) s[item.stat] += item.perLevel * Math.min(lvl, item.maxLevel);
  }
  for (const p of passives) {
    s[p.def.stat] += p.def.perLevel * p.power;
    if (p.def.also) for (const m of p.def.also) s[m.stat] += m.add * p.power;
  }
  for (const b of blessings) for (const m of b.mods) s[m.stat] += m.add;
  let shoes = 0;
  for (const it of items) {
    if (it.def.mods) for (const m of it.def.mods) s[m.stat] += m.add * it.count;
    if (it.def.effect === 'wingedShoes') shoes += it.count;
  }
  s.cooldown = clamp(s.cooldown, 0.35, 2);
  s.moveSpeed = clamp(s.moveSpeed, 0.5, STAT_CAPS.moveSpeed as number);
  // Strzeżymir's Pęd: speed above base becomes damage.
  if (character?.passive.power === 'speedPower') s.damage += SPEED_POWER * Math.max(0, s.moveSpeed - 1);
  // Skrzydlate łapcie: movement speed above base also speeds up attacks.
  if (shoes > 0) s.attackSpeed += SHOES_SHARE * shoes * Math.max(0, s.moveSpeed - 1);
  s.attackSpeed = clamp(s.attackSpeed, 0.25, STAT_CAPS.attackSpeed as number);
  s.maxHp = Math.max(20, Math.round(s.maxHp));
  s.area = Math.max(0.5, s.area);
  s.damage = Math.max(0.1, s.damage);
  s.critChance = Math.max(0, s.critChance);
  s.critDamage = Math.max(1, s.critDamage);
  s.duration = Math.max(0.3, s.duration);
  s.projectileSpeed = Math.max(0.3, s.projectileSpeed);
  s.knockback = Math.max(0, s.knockback);
  s.lifesteal = Math.max(0, s.lifesteal);
  s.thorns = Math.max(0, s.thorns);
  s.evasion = Math.max(0, s.evasion);
  s.shield = Math.max(0, s.shield);
  s.curse = Math.max(0, s.curse);
  s.silverGain = Math.max(0, s.silverGain);
  return s;
}

/** Multiplier of every weapon's interval between attacks: cooldown reduction and attack speed combined. */
export function attackInterval(s: Pick<Stats, 'cooldown' | 'attackSpeed'>): number {
  return s.cooldown / s.attackSpeed;
}

/**
 * How many times one hit crits, from a single roll in [0, 1): chance 0.3 gives 0 or 1,
 * chance 1.3 gives 1 or 2 (an overcrit). One roll per hit keeps the random stream unchanged below 100%.
 */
export function critCount(chance: number, roll: number): number {
  const whole = Math.floor(chance);
  return whole + (roll < chance - whole ? 1 : 0);
}

/** Damage multiplier of a hit that crit `crits` times: 1, critDamage, then the bonus part again per overcrit. */
export function critMultiplier(crits: number, critDamage: number): number {
  return 1 + (critDamage - 1) * crits;
}

/** Damage of one weapon hit before enemy-side effects. */
export function weaponDamage(base: number, weaponBonus: number, damageMul: number, critMul: number): number {
  return base * (1 + weaponBonus) * damageMul * critMul;
}

/** Damage the player actually takes after armor (never below 1). */
export function damageAfterArmor(damage: number, armor: number): number {
  return Math.max(1, damage - armor);
}

/** Dodge chance with diminishing returns: 0.1 → 9%, 0.5 → 33%, 1 → 50%, 3 → 75%; never reaches 100%. */
export function dodgeChance(evasion: number): number {
  return evasion > 0 ? evasion / (1 + evasion) : 0;
}

/** HP healed by one weapon hit, from a single roll in [0, 1). Same rule as crits: whole part always, fraction as a chance. */
export function lifestealHeal(lifesteal: number, roll: number): number {
  return critCount(lifesteal, roll);
}

/** Seconds without taking damage before the shield starts to recharge. */
export const SHIELD_DELAY = 3;
/** Fraction of the maximum shield recharged per second once recharging. */
export const SHIELD_RECHARGE = 0.5;

/** Splits a hit between shield and HP. Returns the shield left and the damage that goes through to HP. */
export function absorbShield(shield: number, damage: number): { shield: number; through: number } {
  const taken = Math.min(shield, damage);
  return { shield: shield - taken, through: damage - taken };
}

/** What a level of curse does to the run. All are multipliers (1 at curse 0). */
export interface CurseEffects {
  enemyHp: number;
  enemyDamage: number;
  enemySpeed: number;
  /** Living-enemy target and spawn rate. */
  enemyCount: number;
  /** XP and gold gained. */
  reward: number;
}

export function curseEffects(curse: number): CurseEffects {
  const c = Math.max(0, curse);
  return {
    enemyHp: 1 + c,
    enemyDamage: 1 + c * 0.5,
    enemySpeed: 1 + c * 0.25,
    enemyCount: 1 + c,
    reward: 1 + c,
  };
}
