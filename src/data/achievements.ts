import type { AchievementDef } from './types';

/**
 * Achievements. Characters, weapons and passives reference an achievement id in their `unlock` field;
 * `gold` is paid once into the Chata purse.
 */
export const ACHIEVEMENTS: (AchievementDef & { gold?: number })[] = [
  { id: 'survive3', name: 'Pierwszy zmierzch', desc: 'Przetrwaj 3 minuty.', reward: 'Broń: Lodowy oddech Marzanny', cond: { type: 'survive', seconds: 180 } },
  { id: 'survive5', name: 'Noc w borze', desc: 'Przetrwaj 5 minut.', reward: 'Postać: Dobrosława', cond: { type: 'survive', seconds: 300 } },
  { id: 'kills1000', name: 'Pogromca licha', desc: 'Pokonaj łącznie 1000 wrogów.', reward: 'Postać: Bogumił', cond: { type: 'totalKills', count: 1000 } },
  { id: 'jaga', name: 'Stłuczony moździerz', desc: 'Pokonaj Babę Jagę.', reward: 'Postać: Jagna, broń: Kruki Welesa', cond: { type: 'killEnemy', enemy: 'jaga' } },
  { id: 'level15', name: 'Zaprawiony w boju', desc: 'Osiągnij 15. poziom w jednym runie.', reward: 'Broń: Włócznia Świętowita', cond: { type: 'level', level: 15 } },
  { id: 'kills3000', name: 'Postrach kniei', desc: 'Pokonaj łącznie 3000 wrogów.', reward: 'Broń: Garniec dziegciu', cond: { type: 'totalKills', count: 3000 } },
  { id: 'shrines3', name: 'Pobożny wędrowiec', desc: 'Odwiedź 3 kapliczki w jednym runie.', reward: 'Pasywka: Pióro Żar-ptaka', cond: { type: 'shrines', count: 3 } },
  { id: 'poludnica', name: 'Zmierzch południa', desc: 'Pokonaj Południcę.', reward: '150 złota', cond: { type: 'killEnemy', enemy: 'poludnica' }, gold: 150 },
  { id: 'evolve', name: 'Dar bogów', desc: 'Ewoluuj dowolną broń.', reward: '150 złota', cond: { type: 'evolve' }, gold: 150 },
  { id: 'gold1000', name: 'Skarbnik', desc: 'Zbierz łącznie 1000 złota.', reward: '200 złota', cond: { type: 'totalGold', count: 1000 }, gold: 200 },
  { id: 'leszy', name: 'Władca boru', desc: 'Pokonaj Leszego.', reward: 'Tryb nieskończony, 500 złota', cond: { type: 'win' }, gold: 500 },
  { id: 'winDobroslawa', name: 'Zielna moc', desc: 'Pokonaj Leszego Dobrosławą.', reward: '300 złota', cond: { type: 'winWith', character: 'dobroslawa' }, gold: 300 },
  { id: 'winBogumil', name: 'Kute żelazo', desc: 'Pokonaj Leszego Bogumiłem.', reward: '300 złota', cond: { type: 'winWith', character: 'bogumil' }, gold: 300 },
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef & { gold?: number }> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
