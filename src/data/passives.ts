import type { PassiveDef } from './types';

const pct = (v: number): string => `${Math.round(v * 100)}%`;
const pct1 = (v: number): string => `${+(v * 100).toFixed(1)}%`;
const num = (v: number): string => v.toFixed(v % 1 ? 1 : 0);

/** Default maximum level of a book. Integer-valued books (projectiles, jumps) stop much earlier. */
export const BOOK_MAX_LEVEL = 20;
const M = BOOK_MAX_LEVEL;

/**
 * Księgi (books; the code still calls them passives). Each level adds `perLevel` (scaled by card rarity)
 * to exactly one stat. Ids are kept from the old passive items, because weapon evolutions and unlocks
 * refer to them.
 */
export const PASSIVES: PassiveDef[] = [
  { id: 'pas', name: 'Księga Siłacza', desc: 'Zwiększa obrażenia wszystkich broni.', icon: 'belt', color: 0xd0503a, maxLevel: M, stat: 'damage', perLevel: 0.1, fmt: (v) => `+${pct(v)} obrażeń` },
  { id: 'krzesiwo', name: 'Księga Krzesiwa', desc: 'Bronie atakują szybciej.', icon: 'flint', color: 0xffa040, maxLevel: M, stat: 'attackSpeed', perLevel: 0.12, fmt: (v) => `+${pct(v)} szybkości ataku` },
  { id: 'amulet', name: 'Księga Dębu', desc: 'Powiększa obszar działania broni.', icon: 'amulet', color: 0x9a7a4a, maxLevel: M, stat: 'area', perLevel: 0.1, fmt: (v) => `+${pct(v)} obszaru` },
  { id: 'onuce', name: 'Księga Wędrowca', desc: 'Bohater biega szybciej.', icon: 'boot', color: 0xe6dfcc, maxLevel: M, stat: 'moveSpeed', perLevel: 0.07, fmt: (v) => `+${pct(v)} szybkości ruchu` },
  { id: 'serce', name: 'Księga Tura', desc: 'Zwiększa maksymalne zdrowie.', icon: 'heart', color: 0xe04a4a, maxLevel: M, stat: 'maxHp', perLevel: 20, fmt: (v) => `+${Math.round(v)} maks. zdrowia` },
  { id: 'miod', name: 'Księga Pszczół', desc: 'Powoli leczy rany.', icon: 'honey', color: 0xf0b030, maxLevel: M, stat: 'regen', perLevel: 0.5, fmt: (v) => `+${v.toFixed(2).replace(/0$/, '')} zdrowia / s` },
  { id: 'magnes', name: 'Księga Bursztynu', desc: 'Przyciąga bursztyny z większej odległości.', icon: 'magnet', color: 0xff9a2a, maxLevel: M, stat: 'pickup', perLevel: 0.3, fmt: (v) => `+${pct(v)} zasięgu zbierania` },
  { id: 'podkowa', name: 'Księga Welesa', desc: 'Szczęście: lepsze karty i częstsze łupy.', icon: 'horseshoe', color: 0xb8c4d0, maxLevel: M, stat: 'luck', perLevel: 0.12, fmt: (v) => `+${pct(v)} szczęścia` },
  { id: 'tarcza', name: 'Księga Lipowej Tarczy', desc: 'Pancerz zmniejsza każdy otrzymany cios.', icon: 'shield', color: 0x8a9a6a, maxLevel: M, stat: 'armor', perLevel: 1, fmt: (v) => `+${num(v)} pancerza` },
  { id: 'sakwa', name: 'Księga Krzemieni', desc: 'Dodatkowy pocisk, sierp lub kruk dla każdej broni.', icon: 'pouch', color: 0xa0764a, maxLevel: 2, stat: 'projectiles', perLevel: 1, fmt: () => '+1 pocisk', fixedRarity: 'epic' },
  { id: 'pioro', name: 'Księga Żar-ptaka', desc: 'Pozwala odbić się w powietrzu (podwójny skok).', icon: 'feather', color: 0xff6a3a, maxLevel: 2, stat: 'extraJumps', perLevel: 1, fmt: () => '+1 skok w powietrzu', fixedRarity: 'rare', unlock: 'shrines3' },
  { id: 'zielnik', name: 'Księga Zielarki', desc: 'Bursztyny dają więcej doświadczenia.', icon: 'book', color: 0x6ab07a, maxLevel: M, stat: 'xpGain', perLevel: 0.08, fmt: (v) => `+${pct(v)} doświadczenia` },
  // Books built on the stats added in stage 1 (docs/MEGABONK-ANALIZA.md). All but the crit book
  // are unlocked by achievements, so the starting pool stays small and the core books show up often.
  { id: 'sokol', name: 'Księga Sokoła', desc: 'Sokole oko: częstsze trafienia krytyczne.', icon: 'eye', color: 0xf2d06a, maxLevel: M, stat: 'critChance', perLevel: 0.04, fmt: (v) => `+${pct1(v)} szansy na krytyk` },
  { id: 'kiel', name: 'Księga Wilczego Kła', desc: 'Trafienia krytyczne bolą bardziej.', icon: 'fang', color: 0xe8e0d0, maxLevel: M, stat: 'critDamage', perLevel: 0.15, fmt: (v) => `+${pct(v)} obrażeń krytycznych`, unlock: 'bookKiel' },
  { id: 'czarnobog', name: 'Księga Czarnoboga', desc: 'Klątwa: więcej, silniejszych i szybszych wrogów, ale też więcej doświadczenia i złota.', icon: 'skull', color: 0x8a5ad0, maxLevel: M, stat: 'curse', perLevel: 0.08, fmt: (v) => `+${pct(v)} klątwy`, unlock: 'leszy' },
  { id: 'strzyga', name: 'Księga Strzygi', desc: 'Trafienia bronią mogą leczyć (1 zdrowia; ponad 100% leczy zawsze).', icon: 'water', color: 0xc0283a, maxLevel: M, stat: 'lifesteal', perLevel: 0.05, fmt: (v) => `+${pct(v)} kradzieży życia`, unlock: 'bookStrzyga' },
  { id: 'glog', name: 'Księga Głogu', desc: 'Ciernie: wróg, który uderzy wręcz, sam obrywa.', icon: 'thorn', color: 0x6a9a4a, maxLevel: M, stat: 'thorns', perLevel: 8, fmt: (v) => `+${Math.round(v)} cierni`, unlock: 'bookGlog' },
  { id: 'mgla', name: 'Księga Mgły', desc: 'Unik: szansa, że cios w ogóle nie trafi (maleje przy dużych wartościach).', icon: 'cloud', color: 0xb0c4d8, maxLevel: M, stat: 'evasion', perLevel: 0.1, fmt: (v) => `+${pct(v)} uniku`, unlock: 'bookMgla' },
  { id: 'grod', name: 'Księga Grodu', desc: 'Tarcza przyjmuje ciosy przed zdrowiem i odnawia się po chwili spokoju.', icon: 'palisade', color: 0x7ec8ff, maxLevel: M, stat: 'shield', perLevel: 15, fmt: (v) => `+${Math.round(v)} tarczy`, unlock: 'bookGrod' },
  { id: 'mokosz', name: 'Księga Mokoszy', desc: 'Nić Mokoszy: sierpy, ogień i pociski działają dłużej.', icon: 'hourglass', color: 0xd88ab8, maxLevel: M, stat: 'duration', perLevel: 0.1, fmt: (v) => `+${pct(v)} czasu działania`, unlock: 'bookMokosz' },
  { id: 'strzybog', name: 'Księga Strzyboga', desc: 'Wiatr niesie pociski szybciej i dalej.', icon: 'wind', color: 0x9ad8e8, maxLevel: M, stat: 'projectileSpeed', perLevel: 0.15, fmt: (v) => `+${pct(v)} szybkości pocisków`, unlock: 'bookStrzybog' },
  { id: 'dzik', name: 'Księga Dzika', desc: 'Ciosy mocniej odrzucają wrogów.', icon: 'tusk', color: 0x8a6a4a, maxLevel: M, stat: 'knockback', perLevel: 0.25, fmt: (v) => `+${pct(v)} odrzutu`, unlock: 'bookDzik' },
];

export const PASSIVE_BY_ID: Record<string, PassiveDef> = Object.fromEntries(PASSIVES.map((p) => [p.id, p]));
