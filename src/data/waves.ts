import type { WaveEvent, WavePhase } from './types';

/** Run length in seconds: the portal of the boss opens and the final wave starts at this time. */
export const RUN_LENGTH = 480;

/** Enemy mix and density over the run. Phases are picked by `from` (seconds). */
export const WAVES: WavePhase[] = [
  { from: 0, alive: [8, 18], rate: 1.4, mix: { chochlik: 1 } },
  { from: 36, alive: [18, 30], rate: 2.0, mix: { chochlik: 3, utopiec: 1 } },
  { from: 72, alive: [30, 45], rate: 2.8, mix: { chochlik: 3, utopiec: 2, kruk: 1.5 } },
  { from: 120, alive: [45, 60], rate: 3.2, mix: { chochlik: 3, utopiec: 2, kruk: 2, ognik: 1 } },
  { from: 170, alive: [60, 75], rate: 3.8, mix: { chochlik: 2.5, utopiec: 3, kruk: 2, ognik: 1.3, strzyga: 1.5 } },
  { from: 215, alive: [75, 90], rate: 4.4, mix: { chochlik: 2.5, utopiec: 3, kruk: 2, ognik: 1.3, strzyga: 2, wilkolak: 1 } },
  { from: 265, alive: [90, 105], rate: 5, mix: { chochlik: 3, utopiec: 3, kruk: 2, ognik: 1.5, strzyga: 2, wilkolak: 1.5, bies: 1 } },
  { from: 310, alive: [105, 120], rate: 6, mix: { chochlik: 3, utopiec: 3, kruk: 2, ognik: 1.5, strzyga: 2, wilkolak: 1.5, bies: 1.2, licho: 1 } },
  { from: 360, alive: [120, 135], rate: 7, mix: { chochlik: 3, utopiec: 3, kruk: 2.5, ognik: 2, strzyga: 2.5, wilkolak: 2, bies: 1.5, licho: 1.3 } },
  { from: 420, alive: [135, 150], rate: 8, mix: { chochlik: 3, utopiec: 3.5, kruk: 2.5, ognik: 2, strzyga: 3, wilkolak: 2.5, bies: 1.8, licho: 1.6 } },
  { from: RUN_LENGTH, alive: [110, 130], rate: 5, mix: { chochlik: 3, utopiec: 2, kruk: 2, strzyga: 2, wilkolak: 1.5, ognik: 1 } },
];

/** Surges: every SURGE_EVERY seconds the horde swells for SURGE_LENGTH seconds (the last one runs into the final wave). */
export const SURGE_EVERY = 150;
export const SURGE_LENGTH = 30;
/** Surge multipliers of the alive target and of the spawn rate. */
export const SURGE_ALIVE = 1.6;
export const SURGE_RATE = 3;

/** 1-based number of the surge running at time t, 0 between surges and after the run length. */
export function surgeAt(t: number): number {
  if (t < SURGE_EVERY || t >= RUN_LENGTH) return 0;
  return t % SURGE_EVERY < SURGE_LENGTH ? Math.floor(t / SURGE_EVERY) : 0;
}

/** Endless mode (after the boss): the densest mix, forever, while enemy health keeps scaling with time. */
export const ENDLESS_PHASE: WavePhase = { from: RUN_LENGTH, alive: [200, 250], rate: 11, mix: { chochlik: 3, utopiec: 3.5, kruk: 2.5, ognik: 2, strzyga: 3, wilkolak: 2.5, bies: 2, licho: 2 } };
/** Endless mode: seconds between mini-bosses, and between returns of the boss. */
export const ENDLESS_MINI_EVERY = 75;
export const ENDLESS_BOSS_EVERY = 300;

export const WAVE_EVENTS: WaveEvent[] = [
  { at: 50, kind: 'swarm', enemy: 'chochlik', count: 16, text: 'Chochliki wyłażą z kniei!' },
  { at: 100, kind: 'mini', enemy: 'jaga', text: 'Baba Jaga nadlatuje w moździerzu!' },
  { at: 200, kind: 'swarm', enemy: 'kruk', count: 20, text: 'Stado kruków zasłania niebo!' },
  { at: 240, kind: 'mini', enemy: 'poludnica', text: 'Południca wychodzi z mgły!' },
  { at: 270, kind: 'swarm', enemy: 'ognik', count: 18, text: 'Błędne ogniki tańczą nad bagnem!' },
  { at: 380, kind: 'mini', enemy: 'jaga', text: 'Baba Jaga wraca po zemstę!' },
  { at: 420, kind: 'swarm', enemy: 'wilkolak', count: 10, text: 'Wataha wilkołaków wyje do księżyca!' },
  { at: RUN_LENGTH, kind: 'portal', enemy: 'leszy', text: 'Otworzył się portal Leszego! Znajdź go i wezwij strażnika boru [E].' },
];

/**
 * Final wave: from RUN_LENGTH the portal waits for the hero, the horde thickens over FINAL_WAVE_RAMP seconds
 * and enemies grow stronger every FINAL_WAVE_STEP seconds until the boss is summoned.
 */
export const FINAL_WAVE_PHASE: WavePhase = { from: RUN_LENGTH, alive: [150, 280], rate: 9, mix: { chochlik: 3, utopiec: 3.5, kruk: 2.5, ognik: 2, strzyga: 3, wilkolak: 2.5, bies: 1.8, licho: 1.6 } };
/** Spawn rate at the end of the final wave ramp. */
export const FINAL_WAVE_RATE_END = 16;
/** Seconds over which the final wave reaches its full density. */
export const FINAL_WAVE_RAMP = 90;
/** Final wave: enemy health and damage grow by this factor every FINAL_WAVE_STEP seconds. */
export const FINAL_WAVE_MUL = 1.25;
export const FINAL_WAVE_STEP = 20;

/** Extra enemy health / damage multiplier of the final wave at time t (1 before it starts). */
export function finalWaveMul(t: number): number {
  return t < RUN_LENGTH ? 1 : Math.pow(FINAL_WAVE_MUL, 1 + Math.floor((t - RUN_LENGTH) / FINAL_WAVE_STEP));
}

/** First elite spawn and interval between elites (seconds). */
export const ELITE_FIRST = 70;
export const ELITE_INTERVAL = 45;
export const ELITE_HP_MUL = 8;

/** Enemy health multiplier at run time t (seconds). */
export function enemyHpMul(t: number): number {
  const m = t / 60;
  return 1 + Math.pow(m, 1.55) * 0.52;
}

/** Enemy damage multiplier at run time t (seconds). */
export function enemyDamageMul(t: number): number {
  return 1 + (t / 600) * 1.3;
}

/** Wave phase active at time t. */
export function phaseAt(t: number): { phase: WavePhase; progress: number } {
  let idx = 0;
  for (let i = 0; i < WAVES.length; i++) {
    if (t >= (WAVES[i] as WavePhase).from) idx = i;
  }
  const phase = WAVES[idx] as WavePhase;
  const next = WAVES[idx + 1];
  const end = next ? next.from : phase.from + 120;
  const progress = Math.min(1, (t - phase.from) / (end - phase.from));
  return { phase, progress };
}

/** XP needed to advance from `level` to the next one. */
export function xpForLevel(level: number): number {
  return Math.floor(4 + level * 5 + level * level * 0.9);
}
