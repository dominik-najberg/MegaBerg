import { clamp } from '../core/math';
import { BASE_STATS, type BlessingDef, type CharacterDef, type PassiveDef, type Stats } from '../data/types';
import { SHOP } from '../data/shop';

export interface PassiveInst {
  def: PassiveDef;
  level: number;
  /** Sum of rarity powers of every level taken (1 per common level). */
  power: number;
}

/** Final player stats from character, Chata upgrades, passives and blessings. Pure function. */
export function computeStats(
  character: CharacterDef | null,
  shopLevels: Readonly<Record<string, number>>,
  passives: readonly PassiveInst[],
  blessings: readonly BlessingDef[],
): Stats {
  const s: Stats = { ...BASE_STATS };
  if (character) for (const m of character.mods) s[m.stat] += m.add;
  for (const item of SHOP) {
    const lvl = shopLevels[item.id] ?? 0;
    if (lvl > 0) s[item.stat] += item.perLevel * Math.min(lvl, item.maxLevel);
  }
  for (const p of passives) s[p.def.stat] += p.def.perLevel * p.power;
  for (const b of blessings) for (const m of b.mods) s[m.stat] += m.add;
  s.cooldown = clamp(s.cooldown, 0.35, 2);
  s.moveSpeed = clamp(s.moveSpeed, 0.5, 2.2);
  s.maxHp = Math.max(20, Math.round(s.maxHp));
  s.area = Math.max(0.5, s.area);
  s.damage = Math.max(0.1, s.damage);
  return s;
}

export function critChance(luck: number): number {
  return clamp(0.05 + luck * 0.1, 0, 0.6);
}

/** Damage of one weapon hit before enemy-side effects. */
export function weaponDamage(base: number, weaponBonus: number, damageMul: number, crit: boolean): number {
  return base * (1 + weaponBonus) * damageMul * (crit ? 2 : 1);
}

/** Damage the player actually takes after armor (never below 1). */
export function damageAfterArmor(damage: number, armor: number): number {
  return Math.max(1, damage - armor);
}
