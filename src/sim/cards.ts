import { PASSIVE_BY_ID, PASSIVES } from '../data/passives';
import { RARITIES, RARITY_ORDER, rollRarity } from '../data/rarity';
import type { PassiveDef, Rarity, WeaponDef } from '../data/types';
import { WEAPON_BY_ID, weaponMaxLevel, WEAPONS, weaponStatsAt } from '../data/weapons';
import { MAX_PASSIVES, MAX_WEAPONS, type WeaponInst, type World } from './world';

export type CardKind = 'weapon' | 'passive' | 'evolve' | 'gold' | 'heal';

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
}

/** True when the weapon is at max level and its evolution passive is owned. */
export function canEvolve(w: World, inst: WeaponInst): boolean {
  const evo = inst.def.evolution;
  if (!evo || inst.level < weaponMaxLevel(inst.def)) return false;
  return w.findPassive(evo.passive) !== undefined && WEAPON_BY_ID[evo.into] !== undefined;
}

function weaponCard(def: WeaponDef, inst: WeaponInst | undefined, rarity: Rarity): Card {
  const level = inst ? inst.level + 1 : 1;
  let text = inst ? (def.levels[level - 2]?.note ?? '') : def.desc;
  const bonus = RARITIES[rarity].weaponBonus;
  if (bonus > 0) text += ` (+${Math.round(bonus * 100)}% obrażeń tej broni)`;
  return { kind: 'weapon', id: def.id, rarity, isNew: !inst, level, name: def.name, text, icon: def.icon, color: def.color };
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
    } else if (inst.level < weaponMaxLevel(inst.def)) {
      out.push({ weight: 3, make: (r) => weaponCard(inst.def, inst, r) });
    }
  }
  for (const p of w.passives) {
    if (p.level < p.def.maxLevel) out.push({ weight: 2.4, make: (r) => passiveCard(p.def, p.level + 1, r) });
  }
  if (w.weapons.length < MAX_WEAPONS) {
    const weight = w.weapons.length < 3 ? 4 : 2;
    for (const def of WEAPONS) {
      if (def.evolved || !w.weaponPool.has(def.id) || w.findWeapon(def.id)) continue;
      // Do not offer the base form again after it has been evolved.
      if (def.evolution && ownedEvolved.has(def.evolution.into)) continue;
      out.push({ weight, make: (r) => weaponCard(def, undefined, r) });
    }
  }
  if (w.passives.length < MAX_PASSIVES) {
    for (const def of PASSIVES) {
      if (!w.passivePool.has(def.id) || w.findPassive(def.id)) continue;
      // Passives that unlock an evolution of an owned weapon are a bit more likely.
      const synergy = w.weapons.some((x) => x.def.evolution?.passive === def.id);
      out.push({ weight: synergy ? 2.6 : 1.6, make: (r) => passiveCard(def, 1, r) });
    }
  }
  return out;
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

/** Chest reward: an evolution if one is ready, otherwise an upgrade of something owned at boosted rarity. */
export function chestCards(w: World): Card[] {
  for (const inst of w.weapons) {
    if (canEvolve(w, inst)) return [evolveCard(inst)];
  }
  const pool: Candidate[] = [];
  for (const inst of w.weapons) {
    if (inst.level < weaponMaxLevel(inst.def)) pool.push({ weight: 3, make: (r) => weaponCard(inst.def, inst, r) });
  }
  for (const p of w.passives) {
    if (p.level < p.def.maxLevel) pool.push({ weight: 2, make: (r) => passiveCard(p.def, p.level + 1, r) });
  }
  if (pool.length === 0) {
    return [{ kind: 'gold', id: 'zloto', rarity: 'rare', isNew: false, level: 60, name: 'Garniec złota', text: '+60 złota.', icon: 'coin', color: 0xffd040 }];
  }
  const c = pool[w.rng.weighted(pool.map((x) => x.weight))] as Candidate;
  let rarity = rollRarity(w.rng, w.stats.luck + 1.2);
  if (rarity === 'common') rarity = 'rare';
  return [c.make(rarity)];
}

/** Applies a card to the world's inventory. */
export function applyCard(w: World, card: Card): void {
  const r = RARITIES[card.rarity];
  switch (card.kind) {
    case 'weapon': {
      let inst = w.findWeapon(card.id);
      if (!inst) {
        inst = w.addWeapon(card.id) ?? undefined;
      } else if (inst.level < weaponMaxLevel(inst.def)) {
        inst.level++;
        inst.stats = weaponStatsAt(inst.def, inst.level);
      }
      if (inst) inst.bonus += r.weaponBonus;
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
