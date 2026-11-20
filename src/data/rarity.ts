import type { Rng } from '../core/rng';
import type { Rarity } from './types';

export interface RarityDef {
  id: Rarity;
  name: string;
  color: string;
  weight: number;
  /** How strongly luck boosts this rarity's weight. */
  luckScale: number;
  /** Multiplier of a passive level's bonus. */
  power: number;
}

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITIES: Record<Rarity, RarityDef> = {
  common: { id: 'common', name: 'Zwykła', color: '#b9b2a3', weight: 60, luckScale: 0, power: 1 },
  rare: { id: 'rare', name: 'Rzadka', color: '#4f9dff', weight: 27, luckScale: 1, power: 1.3 },
  epic: { id: 'epic', name: 'Epicka', color: '#b45cff', weight: 10, luckScale: 2, power: 1.7 },
  legendary: { id: 'legendary', name: 'Legendarna', color: '#ffb338', weight: 3, luckScale: 3, power: 2.3 },
};

/** Card rarity weights for a given luck value (0 = base). */
export function rarityWeights(luck: number): number[] {
  const l = Math.max(0, luck);
  return RARITY_ORDER.map((r) => RARITIES[r].weight * (1 + RARITIES[r].luckScale * l));
}

export function rollRarity(rng: Rng, luck: number): Rarity {
  const i = rng.weighted(rarityWeights(luck));
  return RARITY_ORDER[Math.max(0, i)] as Rarity;
}
