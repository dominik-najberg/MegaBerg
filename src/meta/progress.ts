import { ACHIEVEMENTS } from '../data/achievements';
import { CHARACTERS } from '../data/characters';
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
      return run.kills >= cond.count;
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
  }
}

export interface RunResult {
  /** Gold from the purse banked into the Chata. */
  goldBanked: number;
  /** Extra gold from achievements unlocked by this run. */
  goldBonus: number;
  unlocked: AchievementDef[];
}

/**
 * Folds a finished run into the save: totals, banked gold, newly earned achievements.
 * Mutates `save` and returns what changed (for the end screen).
 */
export function applyRun(save: SaveData, run: RunSummary): RunResult {
  save.stats.runs++;
  if (run.won) save.stats.wins++;
  save.stats.kills += run.kills;
  save.stats.gold += run.goldCollected;
  if (run.time > save.stats.bestTime) save.stats.bestTime = run.time;
  if (run.level > save.stats.bestLevel) save.stats.bestLevel = run.level;
  save.gold += run.gold;
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
  return { goldBanked: run.gold, goldBonus, unlocked };
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
