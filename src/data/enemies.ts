import type { EnemyDef } from './types';

/** Enemy bestiary. Stats are base values at minute 0; they scale with run time (see waves.ts). */
export const ENEMIES: EnemyDef[] = [
  { id: 'chochlik', name: 'Chochlik', ai: 'chase', hp: 9, speed: 4.5, damage: 6, radius: 0.42, height: 1.1, xp: 1, weight: 0, scale: 1 },
  { id: 'utopiec', name: 'Utopiec', ai: 'chase', hp: 34, speed: 2.4, damage: 12, radius: 0.66, height: 1.9, xp: 3, weight: 0.5, scale: 1 },
  { id: 'kruk', name: 'Kruk', ai: 'fly', hp: 12, speed: 5.6, damage: 7, radius: 0.45, height: 1.0, xp: 2, weight: 0, flying: true, scale: 1 },
  { id: 'ognik', name: 'Błędny ognik', ai: 'kamikaze', hp: 8, speed: 6.4, damage: 18, radius: 0.4, height: 1.0, xp: 2, weight: 0, flying: true, scale: 1 },
  { id: 'strzyga', name: 'Strzyga', ai: 'leaper', hp: 42, speed: 3.6, damage: 14, radius: 0.5, height: 1.7, xp: 4, weight: 0.2, scale: 1 },
  { id: 'wilkolak', name: 'Wilkołak', ai: 'charger', hp: 72, speed: 3.4, damage: 18, radius: 0.72, height: 1.5, xp: 6, weight: 0.6, scale: 1 },
  { id: 'bies', name: 'Bies', ai: 'ranged', hp: 56, speed: 2.9, damage: 13, radius: 0.6, height: 2.0, xp: 6, weight: 0.4, scale: 1 },
  { id: 'licho', name: 'Licho', ai: 'teleporter', hp: 60, speed: 3.0, damage: 16, radius: 0.5, height: 2.1, xp: 7, weight: 0.3, scale: 1 },
  { id: 'jaga', name: 'Baba Jaga', ai: 'jaga', hp: 1500, speed: 5.0, damage: 18, radius: 1.2, height: 2.6, xp: 60, weight: 0.95, flying: true, rank: 'mini', scale: 1 },
  { id: 'poludnica', name: 'Południca', ai: 'poludnica', hp: 2800, speed: 4.1, damage: 22, radius: 0.9, height: 2.7, xp: 100, weight: 0.95, rank: 'mini', scale: 1 },
  { id: 'leszy', name: 'Leszy', ai: 'leszy', hp: 15000, speed: 2.7, damage: 30, radius: 2.6, height: 9, xp: 0, weight: 1, rank: 'boss', scale: 1 },
];

export const ENEMY_INDEX: Record<string, number> = Object.fromEntries(ENEMIES.map((e, i) => [e.id, i]));

export function enemyDef(id: string): EnemyDef {
  const i = ENEMY_INDEX[id];
  if (i === undefined) throw new Error(`Unknown enemy: ${id}`);
  return ENEMIES[i] as EnemyDef;
}
