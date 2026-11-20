import { PASSIVE_BY_ID, PASSIVES } from '../data/passives';
import { RARITIES, RARITY_ORDER, rarityWeights, rollRarity } from '../data/rarity';
import type { PassiveDef, Rarity, WeaponDef } from '../data/types';
import type { Rng } from '../core/rng';
import { EVOLVE_LEVEL, formatLines, lineOptions, LINES_PER_RARITY, lineValue, type WeaponLine } from '../data/weaponLines';
import { ITEM_BY_ID, ITEMS, type ItemDef } from '../data/items';
import { WEAPON_BY_ID, weaponMilestones, WEAPONS, weaponStatsAt } from '../data/weapons';
import { attackInterval, statCapped } from './stats';
import { minInterval } from './weapons';
import { MAX_PASSIVES, MAX_WEAPONS, type WeaponInst, type World } from './world';

export type CardKind = 'weapon' | 'passive' | 'evolve' | 'item' | 'gold' | 'heal';

export interface Card {
  kind: CardKind;
  /** Weapon / passive id (for evolve: the id of the weapon being evolved). */
  id: string;
  rarity: Rarity;
  isNew: boolean;
  /** Level after taking the card. */
  level: number;
  name: string;
  text: string;
  icon: string;
  color: number;
  /** Rolled stat lines of a weapon card. */
  lines?: WeaponLine[];
}

/** True when the weapon has reached EVOLVE_LEVEL and its evolution book is owned. */
export function canEvolve(w: World, inst: WeaponInst): boolean {
  const evo = inst.def.evolution;
  if (!evo || inst.level < EVOLVE_LEVEL) return false;
  return w.findPassive(evo.passive) !== undefined && WEAPON_BY_ID[evo.into] !== undefined;
}

/** Rolls distinct stat lines for a weapon card; a new weapon gets one line fewer. `exclude` drops lines that would do nothing. */
export function rollLines(rng: Rng, def: WeaponDef, level: number, rarity: Rarity, isNew: boolean, exclude: readonly string[] = [], extra = 0): WeaponLine[] {
  const options = lineOptions(def.kind, weaponStatsAt(def, level)).filter((l) => !exclude.includes(l));
  const n = Math.min(options.length, LINES_PER_RARITY[rarity] - (isNew ? 1 : 0) + extra);
  const lines: WeaponLine[] = [];
  for (let k = 0; k < n; k++) {
    const stat = options.splice(rng.int(options.length), 1)[0] as WeaponLine['stat'];
    lines.push({ stat, value: lineValue(stat, rarity) });
  }
  return lines;
}

function weaponCard(w: World, def: WeaponDef, inst: WeaponInst | undefined, rarity: Rarity): Card {
  const level = inst ? inst.level + 1 : 1;
  // Attack speed does nothing once the weapon already fires at the engine's minimum interval.
  const capped = inst && inst.stats.cooldown > 0 && inst.stats.cooldown * attackInterval(w.stats) <= minInterval(def.kind) + 1e-9;
  // Kowadło Swaroga: one more line per copy.
  const lines = rollLines(w.rng, def, level, rarity, !inst, capped ? ['attackSpeed'] : [], w.fx.swarogAnvil);
  const milestone = inst && level <= weaponMilestones(def) ? (def.levels[level - 2]?.note ?? '') : '';
  const text = [inst ? milestone : def.desc, formatLines(lines)].filter((t) => t).join('. ') + (lines.length ? '.' : '');
  return { kind: 'weapon', id: def.id, rarity, isNew: !inst, level, name: def.name, text, icon: def.icon, color: def.color, lines };
}

function passiveCard(def: PassiveDef, level: number, rarity: Rarity): Card {
  const r = def.fixedRarity ?? rarity;
  const power = def.fixedRarity ? 1 : RARITIES[r].power;
  const text = level === 1 ? `${def.desc} ${def.fmt(def.perLevel * power)}.` : `${def.fmt(def.perLevel * power)}.`;
  return { kind: 'passive', id: def.id, rarity: r, isNew: level === 1, level, name: def.name, text, icon: def.icon, color: def.color };
}

function evolveCard(inst: WeaponInst): Card {
  const into = WEAPON_BY_ID[inst.def.evolution?.into ?? ''] as WeaponDef;
  return { kind: 'evolve', id: inst.def.id, rarity: 'legendary', isNew: true, level: 1, name: into.name, text: `Ewolucja broni „${inst.def.name}”. ${into.desc}`, icon: into.icon, color: into.color };
}

/** Shown only when there is nothing left to upgrade. For gold/heal cards `level` holds the amount. */
const FILLERS: Card[] = [
  { kind: 'gold', id: 'zloto', rarity: 'common', isNew: false, level: 30, name: 'Sakiewka', text: '+30 złota.', icon: 'coin', color: 0xffd040 },
  { kind: 'heal', id: 'chleb', rarity: 'common', isNew: false, level: 40, name: 'Chleb ze smalcem', text: 'Przywraca 40 zdrowia.', icon: 'bread', color: 0xd9a05a },
  { kind: 'heal', id: 'miod', rarity: 'rare', isNew: false, level: 9999, name: 'Dzban miodu', text: 'Leczy do pełna.', icon: 'honey', color: 0xf0b030 },
];

/**
 * Weight of the next level of an owned book. Lower than a weapon level (3): books go up to level 20
 * and would otherwise keep pushing weapon cards out, delaying evolutions.
 */
export const BOOK_UPGRADE_WEIGHT = 1.6;
/** Weight of a book level in a chest (weapon level: 3). */
export const CHEST_BOOK_WEIGHT = 1;
/** Weight of one new book on a level-up card while the pool is small. */
export const NEW_BOOK_WEIGHT = 1.6;
/** Total weight shared by all new books when the pool is large. */
export const NEW_BOOK_BUDGET = 16;
/** Weight of a new book that is the evolution partner of an owned weapon. */
export const EVOLUTION_BOOK_WEIGHT = 2.6;

interface Candidate {
  weight: number;
  make: (rarity: Rarity) => Card;
  fixed?: Rarity;
}

function candidates(w: World): Candidate[] {
  const out: Candidate[] = [];
  const ownedEvolved = new Set(w.weapons.map((x) => x.def.id));
  for (const inst of w.weapons) {
    if (canEvolve(w, inst)) {
      out.push({ weight: 7, fixed: 'legendary', make: () => evolveCard(inst) });
    } else if (inst.level < w.weaponCap()) {
      out.push({ weight: 3, make: (r) => weaponCard(w, inst.def, inst, r) });
    }
  }
  for (const p of w.passives) {
    if (p.level < p.def.maxLevel && !statCapped(w.stats, p.def.stat)) out.push({ weight: BOOK_UPGRADE_WEIGHT, make: (r) => passiveCard(p.def, p.level + 1, r) });
  }
  if (w.weapons.length < MAX_WEAPONS) {
    const weight = w.weapons.length < 3 ? 4 : 2;
    for (const def of WEAPONS) {
      if (def.evolved || !w.weaponPool.has(def.id) || w.findWeapon(def.id) || w.banished.has(def.id)) continue;
      // Do not offer the base form again after it has been evolved.
      if (def.evolution && ownedEvolved.has(def.evolution.into)) continue;
      out.push({ weight, make: (r) => weaponCard(w, def, undefined, r) });
    }
  }
  if (w.passives.length < MAX_PASSIVES) {
    const fresh = PASSIVES.filter((def) => w.passivePool.has(def.id) && !w.findPassive(def.id) && !w.banished.has(def.id) && !statCapped(w.stats, def.stat));
    // The many books share one budget, so a large pool does not crowd weapons out of the cards.
    const each = Math.min(NEW_BOOK_WEIGHT, NEW_BOOK_BUDGET / Math.max(1, fresh.length));
    for (const def of fresh) {
      // Books that unlock an evolution of an owned weapon are clearly more likely.
      const synergy = w.weapons.some((x) => x.def.evolution?.passive === def.id);
      out.push({ weight: synergy ? EVOLUTION_BOOK_WEIGHT : each, make: (r) => passiveCard(def, 1, r) });
    }
  }
  return out;
}

/** Only new weapons and books can be banished from the pool. */
export function canBanish(card: Card): boolean {
  return card.isNew && (card.kind === 'weapon' || card.kind === 'passive');
}

/** Draws `n` distinct level-up cards. Falls back to gold / food when nothing is left to upgrade. */
export function levelUpCards(w: World, n: number): Card[] {
  const pool = candidates(w);
  const cards: Card[] = [];
  while (cards.length < n && pool.length > 0) {
    const i = w.rng.weighted(pool.map((c) => c.weight));
    const c = pool.splice(i, 1)[0] as Candidate;
    cards.push(c.make(c.fixed ?? rollRarity(w.rng, w.stats.luck)));
  }
  for (let k = 0; cards.length < n && k < FILLERS.length; k++) cards.push(FILLERS[k] as Card);
  return cards.slice(0, n);
}

/** Luck bonus of the rarity roll for chest items. */
export const CHEST_LUCK = 0.6;

export function itemCard(w: World, def: ItemDef): Card {
  const owned = w.itemCount(def.id);
  const text = owned > 0 ? `${def.desc} (masz już ${owned}).` : def.desc;
  return { kind: 'item', id: def.id, rarity: def.rarity, isNew: owned === 0, level: owned + 1, name: def.name, text, icon: def.icon, color: def.color };
}

/** Rolls one item for a chest: rarity first (boosted by luck), then an item of that rarity from the pool. */
export function rollItem(w: World): ItemDef | undefined {
  const pool = ITEMS.filter((i) => w.itemPool.has(i.id));
  if (pool.length === 0) return undefined;
  // Only rarities the pool actually has can be rolled; otherwise a missing rarity would funnel every
  // such roll into the one item of the rarity below it.
  const weights = rarityWeights(w.stats.luck + CHEST_LUCK).map((wt, r) => (pool.some((i) => i.rarity === RARITY_ORDER[r]) ? wt : 0));
  const rarity = RARITY_ORDER[Math.max(0, w.rng.weighted(weights))];
  const of = pool.filter((i) => i.rarity === rarity);
  return of[w.rng.int(of.length)] ?? pool[w.rng.int(pool.length)];
}

/** Chest reward: an evolution if one is ready, otherwise one item (Skarb). */
export function chestCards(w: World): Card[] {
  for (const inst of w.weapons) {
    if (canEvolve(w, inst)) return [evolveCard(inst)];
  }
  const item = rollItem(w);
  if (!item) {
    return [{ kind: 'gold', id: 'zloto', rarity: 'rare', isNew: false, level: 60, name: 'Garniec złota', text: '+60 złota.', icon: 'coin', color: 0xffd040 }];
  }
  return [itemCard(w, item)];
}

/** Applies a card to the world's inventory. */
export function applyCard(w: World, card: Card): void {
  const r = RARITIES[card.rarity];
  switch (card.kind) {
    case 'weapon': {
      let inst = w.findWeapon(card.id);
      if (!inst) {
        inst = w.addWeapon(card.id) ?? undefined;
      } else if (inst.level < w.weaponCap()) {
        inst.level++;
      } else {
        break;
      }
      if (!inst) break;
      for (const l of card.lines ?? []) {
        if (l.stat === 'damage') inst.bonus += l.value;
        else inst.lines[l.stat] = (inst.lines[l.stat] ?? 0) + l.value;
      }
      w.refreshWeapon(inst);
      break;
    }
    case 'passive': {
      const def = PASSIVE_BY_ID[card.id];
      if (!def) break;
      const power = def.fixedRarity ? 1 : r.power;
      const inst = w.findPassive(card.id);
      if (inst) {
        if (inst.level < def.maxLevel) {
          inst.level++;
          inst.power += power;
        }
      } else if (w.passives.length < MAX_PASSIVES) {
        w.passives.push({ def, level: 1, power });
      }
      w.refreshStats();
      break;
    }
    case 'item':
      if (ITEM_BY_ID[card.id]) w.addItem(card.id);
      break;
    case 'evolve': {
      const inst = w.findWeapon(card.id);
      if (inst) w.evolveWeapon(inst);
      break;
    }
    case 'gold':
      w.addGold(card.level);
      break;
    case 'heal':
      w.heal(card.level);
      break;
  }
}

export { RARITY_ORDER };
