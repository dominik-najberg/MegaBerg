import type { PassiveDef } from './types';

const pct = (v: number): string => `${Math.round(v * 100)}%`;

/** Passive items. Each level adds `perLevel` (scaled by card rarity) to one stat. */
export const PASSIVES: PassiveDef[] = [
  { id: 'pas', name: 'Pas siłacza', desc: 'Zwiększa obrażenia wszystkich broni.', icon: 'belt', color: 0xd0503a, maxLevel: 5, stat: 'damage', perLevel: 0.1, fmt: (v) => `+${pct(v)} obrażeń` },
  { id: 'krzesiwo', name: 'Krzesiwo', desc: 'Bronie atakują częściej.', icon: 'flint', color: 0xffa040, maxLevel: 5, stat: 'cooldown', perLevel: -0.07, fmt: (v) => `-${pct(-v)} czasu odnowienia` },
  { id: 'amulet', name: 'Dębowy amulet', desc: 'Powiększa obszar działania broni.', icon: 'amulet', color: 0x9a7a4a, maxLevel: 5, stat: 'area', perLevel: 0.1, fmt: (v) => `+${pct(v)} obszaru` },
  { id: 'onuce', name: 'Onuce szybkobiegacza', desc: 'Bohater biega szybciej.', icon: 'boot', color: 0xe6dfcc, maxLevel: 5, stat: 'moveSpeed', perLevel: 0.07, fmt: (v) => `+${pct(v)} szybkości ruchu` },
  { id: 'serce', name: 'Serce tura', desc: 'Zwiększa maksymalne zdrowie.', icon: 'heart', color: 0xe04a4a, maxLevel: 5, stat: 'maxHp', perLevel: 20, fmt: (v) => `+${Math.round(v)} maks. zdrowia` },
  { id: 'miod', name: 'Garnek miodu', desc: 'Powoli leczy rany.', icon: 'honey', color: 0xf0b030, maxLevel: 5, stat: 'regen', perLevel: 0.5, fmt: (v) => `+${v.toFixed(1)} zdrowia / s` },
  { id: 'magnes', name: 'Bursztynowy magnes', desc: 'Przyciąga bursztyny z większej odległości.', icon: 'magnet', color: 0xff9a2a, maxLevel: 5, stat: 'pickup', perLevel: 0.3, fmt: (v) => `+${pct(v)} zasięgu zbierania` },
  { id: 'podkowa', name: 'Podkowa', desc: 'Szczęście: lepsze karty, częstsze łupy i trafienia krytyczne.', icon: 'horseshoe', color: 0xb8c4d0, maxLevel: 5, stat: 'luck', perLevel: 0.12, fmt: (v) => `+${pct(v)} szczęścia` },
  { id: 'tarcza', name: 'Lipowa tarcza', desc: 'Zmniejsza otrzymywane obrażenia.', icon: 'shield', color: 0x8a9a6a, maxLevel: 5, stat: 'armor', perLevel: 1, fmt: (v) => `+${v.toFixed(v % 1 ? 1 : 0)} pancerza` },
  { id: 'sakwa', name: 'Sakwa z krzemieniami', desc: 'Dodatkowy pocisk, sierp lub kruk dla każdej broni.', icon: 'pouch', color: 0xa0764a, maxLevel: 2, stat: 'projectiles', perLevel: 1, fmt: () => '+1 pocisk', fixedRarity: 'epic' },
  { id: 'pioro', name: 'Pióro Żar-ptaka', desc: 'Pozwala odbić się w powietrzu (podwójny skok).', icon: 'feather', color: 0xff6a3a, maxLevel: 2, stat: 'extraJumps', perLevel: 1, fmt: () => '+1 skok w powietrzu', fixedRarity: 'rare', unlock: 'shrines3' },
  { id: 'zielnik', name: 'Zielnik wiedźmy', desc: 'Bursztyny dają więcej doświadczenia.', icon: 'book', color: 0x6ab07a, maxLevel: 5, stat: 'xpGain', perLevel: 0.08, fmt: (v) => `+${pct(v)} doświadczenia` },
];

export const PASSIVE_BY_ID: Record<string, PassiveDef> = Object.fromEntries(PASSIVES.map((p) => [p.id, p]));
