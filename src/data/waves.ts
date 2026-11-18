import type { WaveEvent, WavePhase } from './types';

/** Run length in seconds: the boss arrives at this time. */
export const RUN_LENGTH = 600;

/** Enemy mix and density over the run. Phases are picked by `from` (seconds). */
export const WAVES: WavePhase[] = [
  { from: 0, alive: [8, 20], rate: 1.4, mix: { chochlik: 1 } },
  { from: 45, alive: [20, 36], rate: 2.0, mix: { chochlik: 3, utopiec: 1 } },
  { from: 90, alive: [36, 60], rate: 3, mix: { chochlik: 3, utopiec: 2, kruk: 1.5 } },
  { from: 150, alive: [60, 90], rate: 3.6, mix: { chochlik: 3, utopiec: 2, kruk: 2, ognik: 1 } },
  { from: 210, alive: [92, 120], rate: 4.2, mix: { chochlik: 2.5, utopiec: 3, kruk: 2, ognik: 1.3, strzyga: 1.5 } },
  { from: 270, alive: [120, 150], rate: 5, mix: { chochlik: 2.5, utopiec: 3, kruk: 2, ognik: 1.3, strzyga: 2, wilkolak: 1 } },
  { from: 330, alive: [150, 185], rate: 6, mix: { chochlik: 3, utopiec: 3, kruk: 2, ognik: 1.5, strzyga: 2, wilkolak: 1.5, bies: 1 } },
  { from: 390, alive: [185, 220], rate: 9, mix: { chochlik: 3, utopiec: 3, kruk: 2, ognik: 1.5, strzyga: 2, wilkolak: 1.5, bies: 1.2, licho: 1 } },
  { from: 450, alive: [220, 260], rate: 11, mix: { chochlik: 3, utopiec: 3, kruk: 2.5, ognik: 2, strzyga: 2.5, wilkolak: 2, bies: 1.5, licho: 1.3 } },
  { from: 520, alive: [260, 300], rate: 13, mix: { chochlik: 3, utopiec: 3.5, kruk: 2.5, ognik: 2, strzyga: 3, wilkolak: 2.5, bies: 1.8, licho: 1.6 } },
  { from: RUN_LENGTH, alive: [150, 170], rate: 6, mix: { chochlik: 3, utopiec: 2, kruk: 2, strzyga: 2, wilkolak: 1.5, ognik: 1 } },
];

/** Endless mode (after the boss): the densest mix, forever, while enemy health keeps scaling with time. */
export const ENDLESS_PHASE: WavePhase = { from: RUN_LENGTH, alive: [280, 340], rate: 14, mix: { chochlik: 3, utopiec: 3.5, kruk: 2.5, ognik: 2, strzyga: 3, wilkolak: 2.5, bies: 2, licho: 2 } };
/** Endless mode: seconds between mini-bosses, and between returns of the boss. */
export const ENDLESS_MINI_EVERY = 75;
export const ENDLESS_BOSS_EVERY = 300;

export const WAVE_EVENTS: WaveEvent[] = [
  { at: 60, kind: 'swarm', enemy: 'chochlik', count: 16, text: 'Chochliki wyłażą z kniei!' },
  { at: 150, kind: 'mini', enemy: 'jaga', text: 'Baba Jaga nadlatuje w moździerzu!' },
  { at: 225, kind: 'swarm', enemy: 'kruk', count: 20, text: 'Stado kruków zasłania niebo!' },
  { at: 300, kind: 'mini', enemy: 'poludnica', text: 'Południca wychodzi z mgły!' },
  { at: 375, kind: 'swarm', enemy: 'ognik', count: 18, text: 'Błędne ogniki tańczą nad bagnem!' },
  { at: 450, kind: 'mini', enemy: 'jaga', text: 'Baba Jaga wraca po zemstę!' },
  { at: 525, kind: 'swarm', enemy: 'wilkolak', count: 10, text: 'Wataha wilkołaków wyje do księżyca!' },
  { at: RUN_LENGTH, kind: 'boss', enemy: 'leszy', text: 'Leszy, strażnik boru, przebudził się!' },
];

/** First elite spawn and interval between elites (seconds). */
export const ELITE_FIRST = 80;
export const ELITE_INTERVAL = 50;
export const ELITE_HP_MUL = 8;

/** Enemy health multiplier at run time t (seconds). */
export function enemyHpMul(t: number): number {
  const m = t / 60;
  return 1 + Math.pow(m, 1.55) * 0.33;
}

/** Enemy damage multiplier at run time t (seconds). */
export function enemyDamageMul(t: number): number {
  return 1 + (t / RUN_LENGTH) * 0.8;
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
