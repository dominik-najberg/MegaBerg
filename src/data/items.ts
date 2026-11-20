import type { Rarity, StatMod } from './types';

/**
 * Skarby (items) from chests (stage 4 of docs/MEGABONK-ANALIZA.md). No slot limit; every copy stacks.
 * An item either adds stats per copy (`mods`) or has a special effect handled in the simulation (`effect`),
 * whose strength grows with the number of copies.
 */
export type ItemEffect =
  | 'perunStone'
  | 'sparkFlint'
  | 'marzannaScythe'
  | 'wraithSkull'
  | 'hermitMoss'
  | 'wingedShoes'
  | 'travelPurse'
  | 'swarogAnvil'
  | 'smithJug'
  | 'witchMirror';

export interface ItemDef {
  id: string;
  name: string;
  /** One copy's effect, shown on the card. */
  desc: string;
  icon: string;
  color: number;
  rarity: Rarity;
  /** Stat bonuses of one copy. */
  mods?: StatMod[];
  effect?: ItemEffect;
  /** Achievement that makes the item buyable in the Skarbiec (stage 7). */
  unlock?: string;
  /** Silver price in the Skarbiec; items with a price join the chest pool only once bought. */
  silver?: number;
}

export const ITEMS: ItemDef[] = [
  // Stats.
  { id: 'rog', name: 'Róg tura', desc: '+8% obrażeń.', icon: 'horn', color: 0xd8c08a, rarity: 'common', mods: [{ stat: 'damage', add: 0.08 }] },
  { id: 'kolpak', name: 'Żelazny kołpak', desc: '+1 pancerza.', icon: 'helmet', color: 0x9aa4ac, rarity: 'common', mods: [{ stat: 'armor', add: 1 }] },
  { id: 'plaster', name: 'Plaster miodu', desc: '+0,4 zdrowia / s.', icon: 'honeycomb', color: 0xf0b030, rarity: 'common', mods: [{ stat: 'regen', add: 0.4 }] },
  { id: 'rozaniec', name: 'Bursztynowy sznur', desc: '+10% doświadczenia.', icon: 'beads', color: 0xff9a2a, rarity: 'common', mods: [{ stat: 'xpGain', add: 0.1 }] },
  { id: 'pazur', name: 'Pazur rysia', desc: '+5% szansy na krytyk, +15% obrażeń krytycznych.', icon: 'claw', color: 0xe8d8b0, rarity: 'rare', mods: [{ stat: 'critChance', add: 0.05 }, { stat: 'critDamage', add: 0.15 }] },
  { id: 'skora', name: 'Wilcza skóra', desc: '+10% uniku, +4% szybkości ruchu.', icon: 'pelt', color: 0x8a7a6a, rarity: 'rare', mods: [{ stat: 'evasion', add: 0.1 }, { stat: 'moveSpeed', add: 0.04 }] },
  { id: 'czara', name: 'Czara Mokoszy', desc: '+40 maks. zdrowia, +8% kradzieży życia.', icon: 'cup', color: 0xc0283a, rarity: 'epic', mods: [{ stat: 'maxHp', add: 40 }, { stat: 'lifesteal', add: 0.08 }] },
  // Effects.
  { id: 'krzemien', name: 'Krzemień iskrzący', desc: 'Trafienie bronią ma 6% szansy na wybuch (50% obrażeń ciosu wokół celu).', icon: 'flint', color: 0xffa040, rarity: 'common', effect: 'sparkFlint' },
  { id: 'sakiewka', name: 'Sakiewka wędrowca', desc: '+1 złota za każde 30 m marszu.', icon: 'pouch', color: 0xc8a050, rarity: 'common', effect: 'travelPurse' },
  { id: 'kamien', name: 'Kamień Peruna', desc: 'Trafienie bronią ma 8% szansy na piorun (80% obrażeń ciosu w małym kręgu).', icon: 'bolt', color: 0x9fd0ff, rarity: 'rare', effect: 'perunStone' },
  { id: 'mech', name: 'Mech pustelnika', desc: 'Stojąc w miejscu, w ciągu sekundy zyskujesz do +30% obrażeń.', icon: 'moss', color: 0x6a9a4a, rarity: 'rare', effect: 'hermitMoss' },
  { id: 'lapcie', name: 'Skrzydlate łapcie', desc: 'Szybkość ruchu ponad bazę dodaje się w 60% do szybkości ataku.', icon: 'boot', color: 0xe6dfcc, rarity: 'rare', effect: 'wingedShoes', unlock: 'itemLapcie', silver: 20 },
  { id: 'lustro', name: 'Lustro wiedźmy', desc: 'Po otrzymaniu ciosu jesteś nietykalny o 0,25 s dłużej.', icon: 'mirror', color: 0xb0c4d8, rarity: 'rare', effect: 'witchMirror', unlock: 'itemLustro', silver: 15 },
  { id: 'czaszka', name: 'Czaszka upiora', desc: 'Każde zabójstwo: +0,05% obrażeń na stałe, do +40%.', icon: 'skull', color: 0xd0d8e0, rarity: 'epic', effect: 'wraithSkull' },
  { id: 'dzban', name: 'Dzban kowala', desc: 'Podnosi najwyższy poziom broni: pierwszy o 5, kolejne o 2.', icon: 'pot', color: 0xa0764a, rarity: 'epic', effect: 'smithJug', unlock: 'itemDzban', silver: 30 },
  { id: 'kowadlo', name: 'Kowadło Swaroga', desc: 'Każda karta broni losuje o jedną linię statów więcej.', icon: 'anvil', color: 0xff8a3a, rarity: 'legendary', effect: 'swarogAnvil', unlock: 'itemKowadlo', silver: 40 },
  { id: 'kosa', name: 'Kosa Marzanny', desc: 'Trafienie bronią ma 0,5% szansy, by od razu zabić zwykłego wroga.', icon: 'sickle', color: 0xb8e0ff, rarity: 'legendary', effect: 'marzannaScythe', unlock: 'itemKosa', silver: 40 },
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// Per-copy strengths of the effects (kept here so cards, tests and the simulation agree).
export const SPARK_CHANCE = 0.06;
export const SPARK_RADIUS = 3;
export const SPARK_DAMAGE = 0.5;
export const PERUN_CHANCE = 0.08;
export const PERUN_RADIUS = 2.5;
export const PERUN_DAMAGE = 0.8;
/** On-hit chances stop growing here, however many copies. */
export const PROC_CHANCE_CAP = 0.6;
export const EXECUTE_CHANCE = 0.005;
export const SKULL_PER_KILL = 0.0005;
export const SKULL_CAP = 0.4;
export const MOSS_BONUS = 0.3;
/** Seconds standing still before the moss bonus is full. */
export const MOSS_RAMP = 1;
export const SHOES_SHARE = 0.6;
export const PURSE_METRES = 30;
export const MIRROR_INVULN = 0.25;

/** Extra weapon levels from Dzban kowala: 5 for the first copy, 2 for each further one. */
export function jugLevels(copies: number): number {
  return copies <= 0 ? 0 : 5 + 2 * (copies - 1);
}
