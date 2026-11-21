import { ACHIEVEMENTS } from '../data/achievements';
import { CHARACTERS } from '../data/characters';
import { ITEM_BY_ID, ITEMS } from '../data/items';
import { PASSIVES } from '../data/passives';
import { SHOP_BY_ID, shopCost } from '../data/shop';
import type { AchievementCond, AchievementDef } from '../data/types';
import { WEAPON_BY_ID, weaponLine, WEAPONS } from '../data/weapons';
import type { RunSummary } from '../sim/world';
import type { SaveData } from './save';

export function isUnlocked(save: SaveData, unlock: string | undefined): boolean {
  return !unlock || save.achievements.includes(unlock);
}

/** Weapons that may appear on cards: unlocked ones, and those with a silver price only once bought in the Skarbiec. */
export function unlockedWeaponIds(save: SaveData): string[] {
  return WEAPONS.filter((w) => !w.evolved && (w.silver ? save.bought.includes(`weapon:${w.id}`) : isUnlocked(save, w.unlock))).map((w) => w.id);
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

/** True for Skarbiec purchases, paid in silver: 'item:<id>', 'weapon:<id>' and 'toggler'. */
export function isSilverPurchase(what: string): boolean {
  return what === 'toggler' || what.startsWith('item:') || what.startsWith('weapon:');
}

/** Buys by id: Skarbiec things for silver, Chata upgrades for gold. */
export function purchase(save: SaveData, what: string): boolean {
  return isSilverPurchase(what) ? buySilver(save, what) : buyShopItem(save, what);
}

/** Buys a Skarbiec treasure or weapon (unlocked by its achievement) or Rózga wróżbity. */
export function buySilver(save: SaveData, what: string): boolean {
  if (save.bought.includes(what)) return false;
  let price: number;
  if (what === 'toggler') {
    price = TOGGLER_PRICE;
  } else if (what.startsWith('weapon:')) {
    const weapon = WEAPON_BY_ID[what.slice('weapon:'.length)];
    if (!weapon?.silver || weapon.evolved || !isUnlocked(save, weapon.unlock)) return false;
    price = weapon.silver;
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

/** Target of a condition that counts something, or null for a yes/no condition. */
function condNeed(cond: AchievementCond): number | null {
  switch (cond.type) {
    case 'survive':
    case 'unhurt':
    case 'unhurtStreak':
      return cond.seconds;
    case 'totalKills':
    case 'runKills':
    case 'totalGold':
    case 'shrines':
    case 'runGold':
    case 'evolveCount':
    case 'weaponKills':
    case 'enemyKills':
      return cond.count;
    case 'level':
    case 'book':
    case 'weaponLevel':
      return cond.level;
    case 'speed':
      // Counted as the bonus over the base speed, so the bar starts empty.
      return cond.value - 1;
    case 'lifesteal':
    case 'armorBlocked':
      return cond.amount;
    default:
      return null;
  }
}

/** What the lifetime totals of a save hold toward a condition, or null when it is not about totals. */
function totalHave(cond: AchievementCond, save: SaveData): number | null {
  switch (cond.type) {
    case 'totalKills':
      return save.stats.kills;
    case 'totalGold':
      return save.stats.gold;
    case 'weaponKills':
      return save.stats.killsByWeapon[cond.weapon] ?? 0;
    case 'enemyKills':
      return save.stats.killsByEnemy[cond.enemy] ?? 0;
    default:
      return null;
  }
}

/**
 * What one run reached toward a condition that counts something within a run. Null when the condition is
 * not of that kind, or the run does not qualify at all (another hero).
 */
function runHave(cond: AchievementCond, run: RunSummary): number | null {
  switch (cond.type) {
    case 'survive':
      return run.time;
    case 'runKills':
      return run.runKills;
    case 'level':
      return run.level;
    case 'shrines':
      return run.shrines;
    case 'book': {
      if (cond.before === undefined) return run.books[cond.book] ?? 0;
      // Levels taken in time: the times of one book only grow, so this is the level held at `before`.
      const limit = cond.before;
      return (run.bookTimes[cond.book] ?? []).filter((t) => t <= limit).length;
    }
    case 'runGold':
      return run.runGold;
    case 'speed':
      return run.peakMoveSpeed - 1;
    case 'evolveCount':
      return run.evolved;
    case 'weaponLevel':
      return run.weapons.reduce((best, w) => (cond.weapon === undefined || weaponLine(w.id) === cond.weapon ? Math.max(best, w.level) : best), 0);
    case 'unhurt':
      return run.damageTaken <= cond.damage ? run.time : 0;
    case 'lifesteal':
      return run.lifestealHealed;
    case 'unhurtStreak':
      return run.longestUnhurt;
    case 'armorBlocked':
      return cond.character === undefined || run.character === cond.character ? run.armorBlocked : null;
    default:
      return null;
  }
}

/** Adds the counters of a run to the lifetime ones. */
function addCounts(into: Record<string, number>, from: Record<string, number>): void {
  for (const [k, v] of Object.entries(from)) {
    if (v > 0) into[k] = (into[k] ?? 0) + v;
  }
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
    case 'weaponLevel':
    case 'unhurtStreak':
    case 'armorBlocked': {
      const have = runHave(cond, run);
      return have !== null && have >= (condNeed(cond) as number);
    }
    case 'weaponKills':
    case 'enemyKills':
      return (totalHave(cond, save) as number) >= cond.count;
    case 'secret':
      return save.found.includes(cond.id);
    case 'runGold':
      return run.runGold >= cond.count;
    case 'speed':
      return run.peakMoveSpeed >= cond.value - 1e-9;
    case 'evolveCount':
      return run.evolved >= cond.count;
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
  // Like `kills`: counted before the achievements are checked, so the run that reaches a total also earns it.
  addCounts(save.stats.killsByWeapon, run.killsByWeapon);
  addCounts(save.stats.killsByEnemy, run.killsByEnemy);
  for (const id of run.secrets) if (!save.found.includes(id)) save.found.push(id);
  for (const w of run.weapons) {
    if (WEAPON_BY_ID[w.id]?.evolved && !save.evolutionsSeen.includes(w.id)) save.evolutionsSeen.push(w.id);
  }
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
      delete save.best[a.id];
    } else {
      // Remember the best attempt so far for the progress bar.
      const have = runHave(a.cond, run);
      if (have !== null && have > (save.best[a.id] ?? 0)) save.best[a.id] = have;
    }
  }
  return { goldBanked: run.gold, goldBonus, silver, unlocked };
}

/**
 * Grants achievements that the lifetime totals of a save already meet (total kills and gold, kills per weapon
 * and per enemy, secrets already found), for saves
 * written before such an achievement existed: an old save with 5000 kills gets Księga Dzika at once instead
 * of after the next run. Achievements that need a single run's details are never granted from totals.
 * Idempotent; a gold reward is paid once, as in applyRun. Returns what was granted.
 */
export function grantFromTotals(save: SaveData): AchievementDef[] {
  const granted: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (save.achievements.includes(a.id)) continue;
    const c = a.cond;
    const have = totalHave(c, save);
    const met = have !== null ? have >= (condNeed(c) as number) : c.type === 'secret' && save.found.includes(c.id);
    if (!met) continue;
    save.achievements.push(a.id);
    if (a.gold) save.gold += a.gold;
    granted.push(a);
  }
  return granted;
}

/**
 * Progress toward an achievement that counts something, for progress bars: lifetime totals, or the best single
 * run so far (only runs that met the rest of the condition count). Null for yes/no achievements.
 */
export function achievementProgress(save: SaveData, ach: AchievementDef): { have: number; need: number } | null {
  const need = condNeed(ach.cond);
  if (need === null) return null;
  if (save.achievements.includes(ach.id)) return { have: need, need };
  let have = totalHave(ach.cond, save) ?? save.best[ach.id] ?? 0;
  // Saves from before `best` existed still know the longest run and the highest level.
  if (ach.cond.type === 'survive') have = Math.max(have, save.stats.bestTime);
  if (ach.cond.type === 'level') have = Math.max(have, save.stats.bestLevel);
  return { have: Math.max(0, Math.min(need, have)), need };
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
