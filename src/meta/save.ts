import { CHARACTERS } from '../data/characters';

export interface Options {
  master: number;
  music: number;
  sfx: number;
  sensitivity: number;
  damageNumbers: boolean;
  shake: boolean;
  /** 0 low, 1 medium, 2 high. */
  quality: number;
}

export interface SaveData {
  version: number;
  gold: number;
  /** Silver (meta currency, stage 7): earned by every run, spent in the Skarbiec. */
  silver: number;
  /** Skarbiec purchases: 'item:<id>' for treasures, 'toggler' for Rózga wróżbity. */
  bought: string[];
  /** Ids switched off with Rózga wróżbity: 'w:<weapon>', 'b:<book>', 'i:<item>'. */
  disabled: string[];
  shop: Record<string, number>;
  achievements: string[];
  stats: {
    runs: number;
    wins: number;
    kills: number;
    /** Total gold ever collected. */
    gold: number;
    bestTime: number;
    bestLevel: number;
  };
  options: Options;
  character: string;
}

/** Minimal storage interface so tests can inject an in-memory or a failing store. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const SAVE_KEY = 'megaberg-slowianskie-bory-v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    gold: 0,
    silver: 0,
    bought: [],
    disabled: [],
    shop: {},
    achievements: [],
    stats: { runs: 0, wins: 0, kills: 0, gold: 0, bestTime: 0, bestLevel: 0 },
    options: { master: 0.8, music: 0.6, sfx: 0.8, sensitivity: 1, damageNumbers: true, shake: true, quality: 2 },
    character: (CHARACTERS[0] as { id: string }).id,
  };
}

function num(v: unknown, fallback: number, min = -Infinity, max = Infinity): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

/** Merges untrusted parsed JSON over the defaults, dropping anything malformed. */
export function sanitizeSave(raw: unknown): SaveData {
  const d = defaultSave();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  d.gold = Math.floor(num(r.gold, 0, 0));
  d.silver = Math.floor(num(r.silver, 0, 0));
  const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  d.bought = strings(r.bought);
  d.disabled = strings(r.disabled);
  if (r.shop && typeof r.shop === 'object') {
    for (const [k, v] of Object.entries(r.shop as Record<string, unknown>)) {
      const lvl = Math.floor(num(v, 0, 0, 99));
      if (lvl > 0) d.shop[k] = lvl;
    }
  }
  if (Array.isArray(r.achievements)) d.achievements = r.achievements.filter((x): x is string => typeof x === 'string');
  if (r.stats && typeof r.stats === 'object') {
    const s = r.stats as Record<string, unknown>;
    d.stats.runs = Math.floor(num(s.runs, 0, 0));
    d.stats.wins = Math.floor(num(s.wins, 0, 0));
    d.stats.kills = Math.floor(num(s.kills, 0, 0));
    d.stats.gold = Math.floor(num(s.gold, 0, 0));
    d.stats.bestTime = num(s.bestTime, 0, 0);
    d.stats.bestLevel = Math.floor(num(s.bestLevel, 0, 0));
  }
  if (r.options && typeof r.options === 'object') {
    const o = r.options as Record<string, unknown>;
    d.options.master = num(o.master, d.options.master, 0, 1);
    d.options.music = num(o.music, d.options.music, 0, 1);
    d.options.sfx = num(o.sfx, d.options.sfx, 0, 1);
    d.options.sensitivity = num(o.sensitivity, d.options.sensitivity, 0.2, 3);
    if (typeof o.damageNumbers === 'boolean') d.options.damageNumbers = o.damageNumbers;
    if (typeof o.shake === 'boolean') d.options.shake = o.shake;
    d.options.quality = Math.round(num(o.quality, d.options.quality, 0, 2));
  }
  if (typeof r.character === 'string' && CHARACTERS.some((c) => c.id === r.character)) d.character = r.character;
  return d;
}

/** Persistent meta-progression. Every storage access is guarded: a broken or full localStorage never crashes the game. */
export class SaveStore {
  data: SaveData;
  /** False when the last load/save failed (private mode, quota, disabled storage). */
  healthy = true;

  constructor(private readonly store: KeyValueStore | null) {
    this.data = this.load();
  }

  load(): SaveData {
    if (!this.store) return defaultSave();
    try {
      const txt = this.store.getItem(SAVE_KEY);
      if (!txt) return defaultSave();
      return sanitizeSave(JSON.parse(txt));
    } catch {
      this.healthy = false;
      return defaultSave();
    }
  }

  save(): boolean {
    if (!this.store) return false;
    try {
      this.store.setItem(SAVE_KEY, JSON.stringify(this.data));
      this.healthy = true;
      return true;
    } catch {
      this.healthy = false;
      return false;
    }
  }

  /** Wipes progress but keeps the player's options. */
  reset(): void {
    const options = this.data.options;
    this.data = defaultSave();
    this.data.options = options;
    try {
      this.store?.removeItem(SAVE_KEY);
    } catch {
      this.healthy = false;
    }
    this.save();
  }
}

export function browserStorage(): KeyValueStore | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}
