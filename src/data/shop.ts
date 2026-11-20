import type { ShopItemDef } from './types';

const pct = (v: number): string => `${Math.round(v * 100)}%`;

/** "Chata": permanent upgrades bought with gold between runs. */
export const SHOP: ShopItemDef[] = [
  { id: 'sila', name: 'Kuźnia', desc: 'Obrażenia wszystkich broni.', icon: 'belt', stat: 'damage', perLevel: 0.06, maxLevel: 5, baseCost: 40, costMul: 1.6, fmt: (v) => `+${pct(v)} obrażeń` },
  { id: 'zdrowie', name: 'Spiżarnia', desc: 'Maksymalne zdrowie.', icon: 'heart', stat: 'maxHp', perLevel: 12, maxLevel: 5, baseCost: 30, costMul: 1.55, fmt: (v) => `+${Math.round(v)} zdrowia` },
  { id: 'szybkosc', name: 'Wydeptana ścieżka', desc: 'Szybkość ruchu.', icon: 'boot', stat: 'moveSpeed', perLevel: 0.03, maxLevel: 5, baseCost: 40, costMul: 1.55, fmt: (v) => `+${pct(v)} szybkości` },
  { id: 'pancerz', name: 'Kożuch', desc: 'Pancerz zmniejsza każde otrzymane obrażenia.', icon: 'shield', stat: 'armor', perLevel: 1, maxLevel: 3, baseCost: 110, costMul: 2, fmt: (v) => `+${Math.round(v)} pancerza` },
  { id: 'regeneracja', name: 'Piec chlebowy', desc: 'Regeneracja zdrowia.', icon: 'honey', stat: 'regen', perLevel: 0.2, maxLevel: 5, baseCost: 50, costMul: 1.6, fmt: (v) => `+${v.toFixed(1)} zdrowia / s` },
  { id: 'magnes', name: 'Bursztynowa skrzynia', desc: 'Zasięg zbierania.', icon: 'magnet', stat: 'pickup', perLevel: 0.12, maxLevel: 5, baseCost: 30, costMul: 1.5, fmt: (v) => `+${pct(v)} zasięgu` },
  { id: 'szczescie', name: 'Ołtarzyk Welesa', desc: 'Szczęście: lepsze karty i łupy.', icon: 'horseshoe', stat: 'luck', perLevel: 0.06, maxLevel: 5, baseCost: 60, costMul: 1.6, fmt: (v) => `+${pct(v)} szczęścia` },
  { id: 'chciwosc', name: 'Garniec na monety', desc: 'Więcej złota z każdego runu.', icon: 'coin', stat: 'goldGain', perLevel: 0.12, maxLevel: 5, baseCost: 50, costMul: 1.6, fmt: (v) => `+${pct(v)} złota` },
  { id: 'madrosc', name: 'Opowieści dziada', desc: 'Więcej doświadczenia z bursztynów.', icon: 'book', stat: 'xpGain', perLevel: 0.05, maxLevel: 5, baseCost: 60, costMul: 1.6, fmt: (v) => `+${pct(v)} doświadczenia` },
  { id: 'tempo', name: 'Osełka', desc: 'Krótszy czas odnowienia broni.', icon: 'flint', stat: 'cooldown', perLevel: -0.03, maxLevel: 5, baseCost: 80, costMul: 1.65, fmt: (v) => `-${pct(-v)} odnowienia` },
  { id: 'obszar', name: 'Święty dąb', desc: 'Większy obszar działania broni.', icon: 'amulet', stat: 'area', perLevel: 0.04, maxLevel: 5, baseCost: 60, costMul: 1.6, fmt: (v) => `+${pct(v)} obszaru` },
  { id: 'przelosowanie', name: 'Kości wróżebne', desc: 'Przelosowania kart przy awansie.', icon: 'dice', stat: 'rerolls', perLevel: 1, maxLevel: 3, baseCost: 90, costMul: 1.8, fmt: (v) => `+${Math.round(v)} przelosowanie` },
  { id: 'srebrnik', name: 'Srebrna skrzynka', desc: 'Więcej srebra z każdego runu.', icon: 'coin', stat: 'silverGain', perLevel: 0.15, maxLevel: 5, baseCost: 70, costMul: 1.6, fmt: (v) => `+${pct(v)} srebra` },
  { id: 'odrodzenie', name: 'Żywa woda', desc: 'Raz na run wskrzesza bohatera z połową zdrowia.', icon: 'water', stat: 'revives', perLevel: 1, maxLevel: 1, baseCost: 450, costMul: 1, fmt: () => '+1 wskrzeszenie' },
];

export const SHOP_BY_ID: Record<string, ShopItemDef> = Object.fromEntries(SHOP.map((s) => [s.id, s]));

/** Price of the next level of a shop item (level = currently owned). */
export function shopCost(item: ShopItemDef, level: number): number {
  return Math.round(item.baseCost * Math.pow(item.costMul, level));
}
