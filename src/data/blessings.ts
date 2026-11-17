import type { BlessingDef } from './types';

/** Shrine blessings: one per god. */
export const BLESSINGS: BlessingDef[] = [
  {
    id: 'perun',
    god: 'Perun',
    name: 'Gniew Peruna',
    desc: '+20% obrażeń wszystkich broni.',
    icon: 'bolt',
    color: 0x9fd0ff,
    mods: [{ stat: 'damage', add: 0.2 }],
  },
  {
    id: 'swarog',
    name: 'Żar Swaroga',
    god: 'Swaróg',
    desc: 'Każde trafienie podpala wroga. -6% czasu odnowienia.',
    icon: 'flame',
    color: 0xff8a3a,
    mods: [
      { stat: 'burn', add: 0.35 },
      { stat: 'cooldown', add: -0.06 },
    ],
  },
  {
    id: 'weles',
    name: 'Łaska Welesa',
    god: 'Weles',
    desc: '+25% szczęścia, +40% złota i 25 monet od razu.',
    icon: 'coin',
    color: 0xb9a6ff,
    mods: [
      { stat: 'luck', add: 0.25 },
      { stat: 'goldGain', add: 0.4 },
    ],
    instant: 'gold',
  },
  {
    id: 'mokosz',
    name: 'Opieka Mokoszy',
    god: 'Mokosz',
    desc: 'Leczy do pełna. +25 maks. zdrowia i +0,8 zdrowia / s.',
    icon: 'heart',
    color: 0x7fd65a,
    mods: [
      { stat: 'maxHp', add: 25 },
      { stat: 'regen', add: 0.8 },
    ],
    instant: 'heal',
  },
];
