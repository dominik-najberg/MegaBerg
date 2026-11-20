import type { Rarity, WeaponKind, WeaponStats } from './types';

/**
 * Stat lines rolled on weapon level-up cards (stage 3 of docs/MEGABONK-ANALIZA.md).
 * Levels 2..5 still apply the hand-written milestones of each weapon; every weapon card also rolls
 * lines, and levels 6..WEAPON_MAX_LEVEL are lines only.
 */
export type LineStat = 'damage' | 'attackSpeed' | 'area' | 'duration' | 'speed' | 'knockback' | 'pierce' | 'bounces' | 'chain';

export interface WeaponLine {
  stat: LineStat;
  value: number;
}

export interface LineDef {
  /** Value of one common line. */
  value: number;
  /** Whole-number lines (+1 pierce) ignore the rarity strength multiplier. */
  integer?: boolean;
  fmt: (v: number) => string;
}

/** Highest weapon level. Evolved weapons keep their level and keep levelling with lines. */
export const WEAPON_MAX_LEVEL = 15;
/** A weapon at this level or above can evolve when its paired book is owned. */
export const EVOLVE_LEVEL = 5;

const pct = (v: number): string => `+${Math.round(v * 100)}%`;

export const LINES: Record<LineStat, LineDef> = {
  damage: { value: 0.085, fmt: (v) => `${pct(v)} obrażeń` },
  attackSpeed: { value: 0.055, fmt: (v) => `${pct(v)} szybkości ataku` },
  area: { value: 0.07, fmt: (v) => `${pct(v)} obszaru` },
  duration: { value: 0.085, fmt: (v) => `${pct(v)} czasu działania` },
  speed: { value: 0.085, fmt: (v) => `${pct(v)} prędkości` },
  knockback: { value: 0.18, fmt: (v) => `${pct(v)} odrzutu` },
  pierce: { value: 1, integer: true, fmt: () => '+1 przebicie' },
  bounces: { value: 1, integer: true, fmt: () => '+1 odbicie' },
  chain: { value: 1, integer: true, fmt: () => '+1 przeskok pioruna' },
};

/** Which lines make sense for each weapon kind. Count (extra blades/projectiles) stays milestone-only. */
export const KIND_LINES: Record<WeaponKind, LineStat[]> = {
  orbit: ['damage', 'area', 'speed', 'duration', 'attackSpeed', 'knockback'],
  bolt: ['damage', 'attackSpeed', 'area', 'speed', 'duration', 'pierce', 'knockback'],
  lightning: ['damage', 'attackSpeed', 'area', 'chain'],
  sweep: ['damage', 'attackSpeed', 'area', 'knockback'],
  aura: ['damage', 'attackSpeed', 'area'],
  bounce: ['damage', 'attackSpeed', 'speed', 'bounces', 'duration'],
  summon: ['damage', 'attackSpeed', 'speed'],
  cone: ['damage', 'attackSpeed', 'area', 'duration'],
  lob: ['damage', 'attackSpeed', 'area', 'duration'],
};

/** Number of lines on a level-up card, by rarity. A new weapon gets one line fewer. */
export const LINES_PER_RARITY: Record<Rarity, number> = { common: 1, rare: 2, epic: 3, legendary: 3 };
/** Strength multiplier of each (non-integer) line, by rarity. */
export const LINE_MUL: Record<Rarity, number> = { common: 1, rare: 1, epic: 1.1, legendary: 1.3 };

/** Lines that can be rolled for a weapon with these stats (drops lines that would do nothing). */
export function lineOptions(kind: WeaponKind, st: WeaponStats): LineStat[] {
  return KIND_LINES[kind].filter((l) => {
    // A permanent orbit (cooldown 0) never re-activates: attack speed and duration are useless.
    if ((l === 'attackSpeed' || l === 'duration') && st.cooldown <= 0) return false;
    return true;
  });
}

/** Value of one line of a given rarity. */
export function lineValue(stat: LineStat, rarity: Rarity): number {
  const d = LINES[stat];
  return d.integer ? d.value : d.value * LINE_MUL[rarity];
}

export function formatLines(lines: readonly WeaponLine[]): string {
  return lines.map((l) => LINES[l.stat].fmt(l.value)).join(', ');
}

/**
 * Applies summed lines to a weapon's milestone stats. Damage lines are not applied here: they go into the
 * weapon's permanent damage bonus (`WeaponInst.bonus`), like the old rarity bonus did.
 */
export function applyLines(st: WeaponStats, sums: Readonly<Partial<Record<LineStat, number>>>): WeaponStats {
  const s = { ...st };
  const as = sums.attackSpeed ?? 0;
  if (as > 0 && s.cooldown > 0) s.cooldown /= 1 + as;
  s.area *= 1 + (sums.area ?? 0);
  s.duration *= 1 + (sums.duration ?? 0);
  s.speed *= 1 + (sums.speed ?? 0);
  s.knockback *= 1 + (sums.knockback ?? 0);
  s.pierce += sums.pierce ?? 0;
  s.bounces += sums.bounces ?? 0;
  s.chain += sums.chain ?? 0;
  return s;
}
