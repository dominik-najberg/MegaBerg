import type { BlessingDef } from './types';

/** How many times one god's blessing can be taken in a run. */
export const BLESSING_MAX = 2;

/** Shrine blessings: one per god. */
export const BLESSINGS: BlessingDef[] = [
  {
    id: 'perun',
    god: 'Perun',
    name: 'Gniew Peruna',
    desc: '+15% obrażeń wszystkich broni.',
    icon: 'bolt',
    color: 0x9fd0ff,
    mods: [{ stat: 'damage', add: 0.15 }],
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
    desc: '+25% szczęścia, +2,5% szansy na krytyk, +40% złota i 25 monet od razu.',
    icon: 'coin',
    color: 0xb9a6ff,
    mods: [
      { stat: 'luck', add: 0.25 },
      { stat: 'critChance', add: 0.025 },
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

/** Boons of a charged Święty krąg (circle shrine): three are drawn, one is taken. */
export const CIRCLE_BOONS: BlessingDef[] = [
  { id: 'krag-sila', god: 'Święty krąg', name: 'Moc kręgu', desc: '+10% obrażeń.', icon: 'belt', color: 0x7ec8ff, mods: [{ stat: 'damage', add: 0.1 }] },
  { id: 'krag-tempo', god: 'Święty krąg', name: 'Rytm kręgu', desc: '+8% szybkości ataku.', icon: 'flint', color: 0x7ec8ff, mods: [{ stat: 'attackSpeed', add: 0.08 }] },
  { id: 'krag-zdrowie', god: 'Święty krąg', name: 'Krew kręgu', desc: '+25 maks. zdrowia i leczenie do pełna.', icon: 'heart', color: 0x7ec8ff, mods: [{ stat: 'maxHp', add: 25 }], instant: 'heal' },
  { id: 'krag-obszar', god: 'Święty krąg', name: 'Szerokość kręgu', desc: '+10% obszaru.', icon: 'amulet', color: 0x7ec8ff, mods: [{ stat: 'area', add: 0.1 }] },
  { id: 'krag-oko', god: 'Święty krąg', name: 'Oko kręgu', desc: '+5% szansy na krytyk.', icon: 'eye', color: 0x7ec8ff, mods: [{ stat: 'critChance', add: 0.05 }] },
  { id: 'krag-wal', god: 'Święty krąg', name: 'Wał kręgu', desc: '+20 tarczy.', icon: 'palisade', color: 0x7ec8ff, mods: [{ stat: 'shield', add: 20 }] },
  { id: 'krag-wiatr', god: 'Święty krąg', name: 'Wiatr kręgu', desc: '+10% szybkości ruchu.', icon: 'wind', color: 0x7ec8ff, mods: [{ stat: 'moveSpeed', add: 0.1 }] },
  { id: 'krag-miod', god: 'Święty krąg', name: 'Rosa kręgu', desc: '+0,6 zdrowia / s.', icon: 'honey', color: 0x7ec8ff, mods: [{ stat: 'regen', add: 0.6 }] },
];

/** The permanent price of an Ołtarz chciwości (greed shrine). */
export const GREED_CURSE: BlessingDef = {
  id: 'chciwosc',
  god: 'Ołtarz chciwości',
  name: 'Klątwa chciwości',
  desc: '+15% klątwy do końca runu.',
  icon: 'skull',
  color: 0xc040ff,
  mods: [{ stat: 'curse', add: 0.15 }],
};
/** Gold paid by an Ołtarz chciwości together with a treasure. */
export const GREED_GOLD = 30;
