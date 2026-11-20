import { ACHIEVEMENTS } from '../data/achievements';
import { CHARACTERS } from '../data/characters';
import { ITEM_BY_ID, ITEMS } from '../data/items';
import { PASSIVES } from '../data/passives';
import { SHOP_BY_ID, shopCost } from '../data/shop';
import type { AchievementCond, AchievementDef } from '../data/types';
import { WEAPONS } from '../data/weapons';
import type { RunSummary } from '../sim/world';
import type { SaveData } from './save';

export function isUnlocked(save: SaveData, unlock: string | undefined): boolean {
  return !unlock || save.achievements.includes(unlock);
}

export function unlockedWeaponIds(save: SaveData): string[] {
  return WEAPONS.filter((w) => !w.evolved && isUnlocked(save, w.unlock)).map((w) => w.id);
}

export function unlockedPassiveIds(save: SaveData): string[] {
  return PASSIVES.filter((p) => isUnlocked(save, p.unlock)).map((p) => p.id);
}

/** Treasures that may come from chests: free ones, plus Skarbiec ones once bought. */
export function unlockedItemIds(save: SaveData): string[] {
  return ITEMS.filter((i) => (i.silver ? save.bought.includes(`item:${i.id}`) : isUnlocked(save, i.unlock))).map((i) => i.id);
}

/** Smallest pools Rózga wróżbity may leave, so a run always has something to offer. */
export const MIN_ENABLED = { w: 4, b: 6, i: 6 } as const;
export type PoolKind = keyof typeof MIN_ENABLED;

/** Unlocked ids of one pool, before Rózga wróżbity. */
export function poolIds(save: SaveData, kind: PoolKind): string[] {
  return kind === 'w' ? unlockedWeaponIds(save) : kind === 'b' ? unlockedPassiveIds(save) : unlockedItemIds(save);
}

/** Pool used by a run: unlocked and not switched off. */
export function runPool(save: SaveData, kind: PoolKind): string[] {
  return poolIds(save, kind).filter((id) => !save.disabled.includes(`${kind}:${id}`));
}

/** Silver price of Rózga wróżbity. */
export const TOGGLER_PRICE = 30;

/** Buys a Skarbiec treasure (unlocked by its achievement) or Rózga wróżbity. */
export function buySilver(save: SaveData, what: string): boolean {
  if (save.bought.includes(what)) return false;
  let price: number;
  if (what === 'toggler') {
    price = TOGGLER_PRICE;
  } else {
    const item = ITEM_BY_ID[what.replace(/^item:/, '')];
    if (!item?.silver || !what.startsWith('item:') || !isUnlocked(save, item.unlock)) return false;
    price = item.silver;
  }
  if (save.silver < price) return false;
  save.silver -= price;
  save.bought.push(what);
  return true;
}

/**
 * Switches a weapon, book or treasure off (or back on) for future runs. Needs Rózga wróżbity, and
 * never leaves a pool below MIN_ENABLED.
 */
export function togglePool(save: SaveData, kind: PoolKind, id: string): boolean {
  if (!save.bought.includes('toggler') || !poolIds(save, kind).includes(id)) return false;
  const key = `${kind}:${id}`;
  const i = save.disabled.indexOf(key);
  if (i >= 0) {
    save.disabled.splice(i, 1);
    return true;
  }
  if (runPool(save, kind).length <= MIN_ENABLED[kind]) return false;
  save.disabled.push(key);
  return true;
}

/** Silver earned by a run: a minute survived is worth 1, every 400 kills 1, a victory 10; times silver gain. */
export function silverFor(run: RunSummary, silverGain: number): number {
  const base = Math.max(0, run.time - run.bankedTime) / 60 + run.kills / 400 + (run.won ? 10 : 0);
  return Math.floor(base * Math.max(0, silverGain));
}

export function unlockedCharacterIds(save: SaveData): string[] {
  return CHARACTERS.filter((c) => isUnlocked(save, c.unlock)).map((c) => c.id);
}

function met(cond: AchievementCond, save: SaveData, run: RunSummary): boolean {
  switch (cond.type) {
    case 'survive':
      return run.time >= cond.seconds || run.won;
    case 'totalKills':
      return save.stats.kills >= cond.count;
    case 'runKills':
      return run.runKills >= cond.count;
    case 'killEnemy':
      return (run.killsByEnemy[cond.enemy] ?? 0) > 0;
    case 'level':
      return run.level >= cond.level;
    case 'evolve':
      return run.evolved > 0;
    case 'totalGold':
      return save.stats.gold >= cond.count;
    case 'win':
      return run.won;
    case 'winWith':
      return run.won && run.character === cond.character;
    case 'shrines':
      return run.shrines >= cond.count;
    case 'book':
      return (run.books[cond.book] ?? 0) >= cond.level;
    case 'runGold':
      return run.runGold >= cond.count;
    case 'speed':
      return run.peakMoveSpeed >= cond.value - 1e-9;
    case 'evolveCount':
      return run.evolved >= cond.count;
    case 'weaponLevel':
      return run.weapons.some((w) => w.level >= cond.level);
    case 'unhurt':
      return run.time >= cond.seconds && run.damageTaken <= cond.damage;
    case 'lifesteal':
      return run.lifestealHealed >= cond.amount;
  }
}

export interface RunResult {
  /** Gold from the purse banked into the Chata. */
  goldBanked: number;
  /** Extra gold from achievements unlocked by this run. */
  goldBonus: number;
  /** Silver earned by this run. */
  silver: number;
  unlocked: AchievementDef[];
}

/**
 * Folds a finished run into the save: totals, banked gold, newly earned achievements.
 * Mutates `save` and returns what changed (for the end screen).
 */
export function applyRun(save: SaveData, run: RunSummary): RunResult {
  // The endless continuation of a won run is banked separately but is still the same run.
  if (!run.endless) save.stats.runs++;
  if (run.won) save.stats.wins++;
  save.stats.kills += run.kills;
  save.stats.gold += run.goldCollected;
  if (run.time > save.stats.bestTime) save.stats.bestTime = run.time;
  if (run.level > save.stats.bestLevel) save.stats.bestLevel = run.level;
  save.gold += run.gold;
  const silver = silverFor(run, run.silverGain);
  save.silver += silver;
  const unlocked: AchievementDef[] = [];
  let goldBonus = 0;
  for (const a of ACHIEVEMENTS) {
    if (save.achievements.includes(a.id)) continue;
    if (met(a.cond, save, run)) {
      save.achievements.push(a.id);
      unlocked.push(a);
      if (a.gold) {
        goldBonus += a.gold;
        save.gold += a.gold;
      }
    }
  }
  return { goldBanked: run.gold, goldBonus, silver, unlocked };
}

/** Buys the next level of a Chata upgrade. Returns false when maxed or too expensive. */
export function buyShopItem(save: SaveData, id: string): boolean {
  const item = SHOP_BY_ID[id];
  if (!item) return false;
  const level = save.shop[id] ?? 0;
  if (level >= item.maxLevel) return false;
  const cost = shopCost(item, level);
  if (save.gold < cost) return false;
  save.gold -= cost;
  save.shop[id] = level + 1;
  return true;
}
