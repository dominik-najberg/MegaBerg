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
  { id: 'shrines3', name: 'Pobożny wędrowiec', desc: 'Odwiedź 3 kapliczki w jednym runie.', reward: 'Księga Żar-ptaka (podwójny skok)', cond: { type: 'shrines', count: 3 } },
  { id: 'poludnica', name: 'Zmierzch południa', desc: 'Pokonaj Południcę.', reward: '150 złota', cond: { type: 'killEnemy', enemy: 'poludnica' }, gold: 150 },
  { id: 'evolve', name: 'Dar bogów', desc: 'Ewoluuj dowolną broń.', reward: '150 złota', cond: { type: 'evolve' }, gold: 150 },
  { id: 'gold1000', name: 'Skarbnik', desc: 'Zbierz łącznie 1000 złota.', reward: '200 złota', cond: { type: 'totalGold', count: 1000 }, gold: 200 },
  { id: 'leszy', name: 'Władca boru', desc: 'Pokonaj Leszego.', reward: 'Tryb nieskończony, Księga Czarnoboga (klątwa), 500 złota', cond: { type: 'win' }, gold: 500 },
  // Books unlocked by playing a style (like the tome unlocks in docs/MEGABONK-ANALIZA.md).
  { id: 'bookKiel', name: 'Sokole oko', desc: 'Podnieś Księgę Sokoła do 8. poziomu w jednym runie.', reward: 'Księga Wilczego Kła (obrażenia krytyczne)', cond: { type: 'book', book: 'sokol', level: 8 } },
  { id: 'bookGrod', name: 'Lipowy mur', desc: 'Podnieś Księgę Lipowej Tarczy do 6. poziomu w jednym runie.', reward: 'Księga Grodu (tarcza)', cond: { type: 'book', book: 'tarcza', level: 6 } },
  { id: 'bookGlog', name: 'Twardy jak tur', desc: 'Podnieś Księgę Tura do 8. poziomu w jednym runie.', reward: 'Księga Głogu (ciernie)', cond: { type: 'book', book: 'serce', level: 8 } },
  { id: 'bookMgla', name: 'Lekki krok', desc: 'Osiągnij +35% szybkości ruchu w jednym runie.', reward: 'Księga Mgły (unik)', cond: { type: 'speed', value: 1.35 } },
  { id: 'bookMokosz', name: 'Szeroki zamach', desc: 'Podnieś Księgę Dębu do 8. poziomu w jednym runie.', reward: 'Księga Mokoszy (czas działania)', cond: { type: 'book', book: 'amulet', level: 8 } },
  { id: 'bookStrzybog', name: 'Grad krzemieni', desc: 'Podnieś Księgę Krzemieni do 2. poziomu w jednym runie.', reward: 'Księga Strzyboga (szybkość pocisków)', cond: { type: 'book', book: 'sakwa', level: 2 } },
  { id: 'bookStrzyga', name: 'Krwawe żniwo', desc: 'Pokonaj 1500 wrogów w jednym runie.', reward: 'Księga Strzygi (kradzież życia)', cond: { type: 'runKills', count: 1500 } },
  { id: 'bookDzik', name: 'Taran', desc: 'Pokonaj łącznie 5000 wrogów.', reward: 'Księga Dzika (odrzut)', cond: { type: 'totalKills', count: 5000 } },
  // Heroes unlocked by a play style (stage 5 of docs/MEGABONK-ANALIZA.md).
  { id: 'heroRadogost', name: 'Pełny trzos', desc: 'Zbierz 400 złota w jednym runie.', reward: 'Postać: Radogost', cond: { type: 'runGold', count: 400 } },
  { id: 'heroStrzezymir', name: 'Wiatr w nogach', desc: 'Osiągnij +60% szybkości ruchu w jednym runie.', reward: 'Postać: Strzeżymir', cond: { type: 'speed', value: 1.6 } },
  { id: 'heroMszczuj', name: 'Pragnienie', desc: 'Ulecz 300 zdrowia kradzieżą życia w jednym runie.', reward: 'Postać: Mszczuj', cond: { type: 'lifesteal', amount: 300 } },
  // Skarby for the Skarbiec: a play style unlocks them, silver buys them (stage 7 of docs/MEGABONK-ANALIZA.md).
  { id: 'itemLapcie', name: 'Wiatr pod stopami', desc: 'Osiągnij +50% szybkości ruchu w jednym runie.', reward: 'Skarbiec: Skrzydlate łapcie', cond: { type: 'speed', value: 1.5 } },
  { id: 'itemLustro', name: 'Nietknięty', desc: 'Przetrwaj 5 minut, tracąc łącznie najwyżej 150 zdrowia.', reward: 'Skarbiec: Lustro wiedźmy', cond: { type: 'unhurt', seconds: 300, damage: 150 } },
  { id: 'itemDzban', name: 'Mistrz kuźni', desc: 'Podnieś dowolną broń do 15. poziomu w jednym runie.', reward: 'Skarbiec: Dzban kowala', cond: { type: 'weaponLevel', level: 15 } },
  { id: 'itemKowadlo', name: 'Trzy przemiany', desc: 'Ewoluuj 3 bronie w jednym runie.', reward: 'Skarbiec: Kowadło Swaroga', cond: { type: 'evolveCount', count: 3 } },
  { id: 'itemKosa', name: 'Kosiarz', desc: 'Pokonaj 3000 wrogów w jednym runie.', reward: 'Skarbiec: Kosa Marzanny', cond: { type: 'runKills', count: 3000 } },
  { id: 'winDobroslawa', name: 'Zielna moc', desc: 'Pokonaj Leszego Dobrosławą.', reward: '300 złota', cond: { type: 'winWith', character: 'dobroslawa' }, gold: 300 },
  { id: 'winBogumil', name: 'Kute żelazo', desc: 'Pokonaj Leszego Bogumiłem.', reward: '300 złota', cond: { type: 'winWith', character: 'bogumil' }, gold: 300 },
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef & { gold?: number }> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
