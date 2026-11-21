# Plan: więcej broni i odblokowania przez styl gry

Źródło inspiracji: baza broni na megabonk.org (30 broni, 7 od startu, 23 do odblokowania; wersja gry 1.0.69, odczyt 2026-11-21).
Jak w `docs/MEGABONK-ANALIZA.md`: przenosimy **mechaniki** (rodzaje ataku, rodzaje warunków odblokowania), nazwy i wygląd są nasze, słowiańskie.

**Stan (2026-11-21):** plan sprawdzony z kodem (także przez Codexa), nic jeszcze nie zrobione.

## 1. Punkt wyjścia

**Megabonk:** 30 broni, bez ewolucji. Większość warunków wymaga konkretnego stylu gry: zabójstwa daną bronią, broń lub tom na wysoki poziom, wyzwanie konkretną postacią, boss pokonany kilka razy, sekret na mapie. Część broni po spełnieniu warunku trzeba jeszcze kupić.

**MegaBerg dziś:**
- 10 broni podstawowych i 10 ewolucji (`src/data/weapons.ts`), 9 typów ataku (`WeaponKind` w `src/data/types.ts`).
- 6 broni od startu, 4 odblokowywane osiągnięciami: Kruki (`jaga`), Marzanna (`survive3`), Włócznia (`level15`), Garniec (`kills3000`).
- Sloty: `MAX_WEAPONS = 4`, `MAX_PASSIVES = 5` (`src/sim/world.ts`); 3 karty przy awansie. Rózga wróżbity wyłącza rzeczy z puli (`MIN_ENABLED.w = 4`).
- Karty nowych broni (`candidates` w `src/sim/cards.ts`) mają stałą wagę 4 (albo 2 przy 3 broniach) **każda**, bez wspólnego budżetu. Księgi mają wspólny budżet (`NEW_BOOK_BUDGET`).
- Odblokowania to osiągnięcia (`unlock: '<id osiągnięcia>'`). Warunki w `met()` w `src/meta/progress.ts` sprawdzają tylko jeden run, poza `totalKills` i `totalGold`.
- Kupno za srebro po spełnieniu warunku już działa, ale tylko dla skarbów (`ITEMS[].silver`, `buySilver`; Skarbiec w `src/ui/ui.ts` rysuje tylko `ITEMS`, a `buy` w `src/game.ts` kieruje do srebra tylko `item:` i `toggler`).
- 12 ksiąg nie jest jeszcze sparowanych z żadną ewolucją: Sokół, Wilczy Kieł, Czarnobóg, Strzyga, Głóg, Mgła, Gród, Mokosz, Strzybóg, Dzik, Zielarka, Żar-ptak. Na 14 nowych broni zabraknie dwóch (sekcja 3).

## 2. Rodzaje warunków odblokowania

| Rodzaj | Przykład | Co jest | Czego brakuje |
|---|---|---|---|
| Łańcuch broni: łącznie X zabójstw bronią A | 2000 zabójstw Ciupagą odblokowuje Szablę | nic | licznik zabójstw na broń (w runie i łącznie) |
| Konkretna broń na poziom X w runie | Wianek na 15. poziom | `weaponLevel` (dowolna broń) | opcjonalne pole `weapon`, liczone dla całej linii (broń i jej ewolucja) |
| Księga na poziom X w runie | Księga Sokoła na 10. poziom | `book` | opcjonalne `before` (sekundy): poziom osiągnięty najpóźniej w tej sekundzie |
| Wyzwanie postacią | blokuj pancerzem Bogumiłem | `winWith` | licznik w runie + pole `character` przy innych warunkach |
| Wyzwanie umiejętności | 2 minuty bez obrażeń bez przerwy | `unhurt` (suma obrażeń) | najdłuższy odcinek bez utraty zdrowia w runie |
| Mini-boss lub boss pokonany N razy | Baba Jaga 3 razy | `killEnemy` (tylko jeden run) | łączne zabicia według typu wroga |
| Sekret na mapie | kij ukryty pod dębem | nic | obiekt sekretu na mapie, flaga w runie, zapis w save |
| Rzadki drop, potem zakup | fragment z niszczalnej scenerii | zakup za srebro (tylko skarby) | drop, flaga „znaleziono” w zapisie, zakup broni w Skarbcu |

Łańcuchy broni i dwa kroki (warunek, potem srebro) są najcenniejsze. Gracz próbuje różnych broni, bo każda prowadzi do kolejnej, a srebro dostaje nowy cel.

## 3. Nowe bronie (propozycja)

Cel: 24 bronie podstawowe (10 obecnych + 14 nowych), 6 od startu jak dziś. Do 30 nie idziemy przy 4 slotach: pula by się rozmyła (sekcja 6).

| # | Broń | Mechanika | Typ | Odblokowanie | Księga do ewolucji |
|---|---|---|---|---|---|
| 1 | Miotła Jagi | ognisty ślad za bohaterem | nowy `trail` | pokonaj Babę Jagę łącznie 3 razy | Mgła |
| 2 | Rój pszczół | pszczoły naprowadzające się na wrogów | nowy `homing` | Wianek z ziół (lub Kwiat Paproci) na 15. poziom w runie | Zielarka |
| 3 | Wnyki | pułapki zostawiane na ziemi, zamykają się na wrogu | nowy `trap` | łącznie 5000 zabójstw Garncem dziegciu (lub Smoczą Smołą) | Głóg |
| 4 | Wir Pochwista | wędrujące trąby powietrzne z silnym odrzutem | nowy `wander` | Księga Dzika na 10. poziom w runie | Dzik |
| 5 | Studnia Nawii | wir, który wciąga i rani wrogów | nowy `vortex` | Księga Czarnoboga na 10. poziom w runie | Czarnobóg |
| 6 | Krzywula | rzucany kij, który wraca do bohatera | nowy `boomerang` | znajdź kij ukryty pod jednym z dębów (sekret), potem kup | Strzybóg |
| 7 | Łuk Dziewanny | daleki strzał przebijający w najsilniejszego wroga, premia na bossy | `bolt` + wybór celu | Księga Sokoła na 10. poziom w runie | Wilczy Kieł |
| 8 | Szabla | szybkie cięcia najbliższego wroga | `sweep` + doskok | łącznie 2000 zabójstw Ciupagą (lub Toporem Peruna) | Żar-ptak |
| 9 | Puklerz | blokuje cios i oddaje falą uderzeniową | nowy `guard` | zablokuj pancerzem 500 obrażeń Bogumiłem (w runie) | Gród |
| 10 | Wrzeciono Mokoszy | nić od bohatera do wroga, rani wszystko na linii | nowy `tether` | pokonaj Leszego Dobrosławą (istniejące `winDobroslawa`) | Mokosz |
| 11 | Kieł wąpierza | zabójstwa z małą szansą trwale podnoszą maks. HP w runie | `bolt` + efekt przy zabójstwie | Księga Strzygi na 12. poziom w runie | Strzyga |
| 12 | Kości wróżbity | obrażenia losowane od 1 do 6, szóstka daje trwały +kryt w runie | `bounce` + rzut kością | Księga Welesa na 12. poziom w runie | Sokół |
| 13 | Miecz Nawii | im mniej zdrowia, tym mocniej bije | `sweep` + skalowanie od HP | Księga Czarnoboga na 15. poziom przed 6:00 | brak wolnej księgi |
| 14 | Kosa żniwiarza | zamach 360°, zabite elity ładują mocny cios | `sweep` + ładunek | pokonaj Południcę łącznie 3 razy | brak wolnej księgi |

Uwagi:
- **Linia broni.** Warunki „broń na poziom X” i „X zabójstw bronią” liczą broń razem z jej ewolucją. Inaczej gracz, który zrobi ewolucję, straciłby postęp: karta ewolucji zastępuje kartę ulepszenia, a po ewolucji zmienia się id broni.
- **Dwie brakujące księgi.** Dla Miecza Nawii i Kosy: albo dwie nowe księgi, albo ewolucja z księgą, której używa już inna broń (wtedy jedna księga otwiera dwie ewolucje). Decyzja przy etapie D.
- Nazwy robocze. Kolidują z istniejącymi: „Nić Mokoszy” jest w opisie Księgi Mokoszy, „Kosa Marzanny” to skarb z egzekucją. Do poprawki przy wdrażaniu.
- Warunki „księga na poziom” celowo wskazują księgę, która pasuje do broni. Gracz, który już gra danym stylem, dostaje do niego broń.
- Zakup za srebro (drugi krok) proponuję tylko dla sekretu (Krzywula) i ewentualnie dla broni z najprostszymi warunkami, w cenach skarbów (15–40 srebra). Pozostałe odblokowują się od razu, żeby nie dokładać grindu.

## 4. Etapy

### Etap A. Podstawy (bez nowych broni, nie zmienia balansu walki)

**Źródło zabójstwa** (`src/sim/pools.ts`, `src/sim/world.ts`):
- Osobna tablica `killSrc` na wroga, **niezależna od mechaniki obrażeń**. Nie podstawiamy slotu broni do obrażeń podpalenia, bo uruchomiłoby to kryty, kradzież życia, kolejne podpalenia i efekty skarbów, czyli zmieniło balans.
- Każde zadanie obrażeń ustawia `killSrc`: cios broni na jej slot, ciernie i skarby (wybuch Krzemienia, piorun Kamienia Peruna, egzekucja Kosy Marzanny) na „brak broni”, żeby dobicie nie szło na konto poprzedniej broni.
- Podpalenie ma własne źródło (`burnSrc`) zapisane razem z podpaleniem. Dziś kod trzyma największe DPS podpalenia, a kolejny cios tylko odświeża czas, więc źródło zmienia się tylko wtedy, gdy zmienia się DPS.
- Oba pola zerujemy, gdy miejsce w puli wrogów dostaje nowego wroga.
- `killEnemy` dolicza zabójstwo do `killsByWeapon` według linii broni (id broni podstawowej).

**Statystyki runu** (`RunSummary` w `src/sim/world.ts`):
- `killsByWeapon: Record<string, number>` (klucz: id broni podstawowej).
- `longestUnhurt`: najdłuższy odcinek bez utraty zdrowia, w sekundach, łącznie z odcinkiem trwającym na końcu runu. Nie wyprowadzamy go z `hurtT`, bo ten zeruje się też wtedy, gdy cios w całości przyjmie tarcza.
- `armorBlocked`: o ile pancerz zmniejszył ciosy, które naprawdę trafiły (przed tarczą; uniki i nietykalność się nie liczą).
- `bookTimes: Record<string, number[]>`: czas zdobycia każdego poziomu księgi, od poziomu 1, zapisywany przy udanym wyborze karty.
- `secrets: string[]`: sekrety znalezione w runie.

**Tryb nieskończony:** po wygranej run jest rozliczany dwa razy (zwycięstwo, potem dalsza część). Liczniki sumowane do zapisu (`killsByWeapon`, zabicia wrogów) muszą być przyrostowe, jak dziś `kills`: `startEndless` je zeruje. Rekordy jednego runu (`longestUnhurt`, `bookTimes`, `armorBlocked`) przechodzą do części nieskończonej bez zerowania.

**Zapis** (`src/meta/save.ts`):
- `stats.killsByWeapon`, `stats.killsByEnemy` (łącznie), `found: string[]` (sekrety i dropy, bez duplikatów), `evolutionsSeen: string[]` (dla Arsenału), `best: Record<string, number>` (najlepszy wynik dla warunków z jednego runu, klucz = id osiągnięcia).
- `sanitizeSave` uzupełnia nowe pola i odrzuca złe wartości. `SAVE_VERSION` zostaje 1, bo nic nie trzeba przekształcać. Stare zapisy zaczynają te liczniki od zera, bo historii zabójstw na broń nie da się odtworzyć.
- Sekret trafia do zapisu od razu po podniesieniu (hak w `src/game.ts`), nie dopiero przy rozliczeniu runu. Inaczej zamknięcie karty w połowie runu by go zgubiło.

**Warunki** (`AchievementCond` w `src/data/types.ts`, `met()` w `src/meta/progress.ts`):
- `weaponKills { weapon, count }` (łącznie), `enemyKills { enemy, count }` (łącznie).
- `weaponLevel` + opcjonalne `weapon` (linia broni); `book` + opcjonalne `before` (warunek: `czas ≤ before`).
- `unhurtStreak { seconds }`, `armorBlocked { amount, character? }`, `secret { id }`.
- `applyRun` dolicza liczniki do `save.stats` **przed** sprawdzaniem osiągnięć (jak dziś `kills`), a potem aktualizuje `best`.
- `grantFromTotals` obsługuje też nowe warunki łączne.

**Postęp:** `achievementProgress(save, ach) → { have, need } | null` dla warunków liczbowych. Warunki łączne czytają `save.stats`, warunki z jednego runu `save.best[ach.id]`. Rekord liczy się tylko z runów, które spełniały resztę warunku (właściwa postać, termin `before`).

**Zakup broni za srebro:**
- pole `silver` w `WeaponDef`; `buySilver` przyjmuje `weapon:<id>`; `buy` w `src/game.ts` kieruje `weapon:` do srebra;
- `unlockedWeaponIds` wymaga zakupu, gdy broń ma cenę;
- Skarbiec pokazuje też bronie, w stanach: warunek niespełniony / można kupić / kupione / wyłączone z puli.

**Ekran Arsenał** (`src/ui/ui.ts`, przycisk w menu obok Osiągnięć; nowy typ ekranu, akcje i Escape jak przy innych ekranach):
- wszystkie bronie podstawowe; odblokowane z ikoną, opisem, typem ataku i ewolucją (ewolucja jako „???”, dopóki nie ma jej w `evolutionsSeen`);
- zablokowane z kłódką, warunkiem i paskiem postępu, np. „1240 / 2000 zabójstw Ciupagą”. Wzór: zablokowane postacie (`char locked`).

**Testy (Vitest):** każdy nowy warunek; `sanitizeSave` z nowymi polami i bez nich; zakup broni i jego trasa w `game.ts`; przypisanie zabójstwa: cios, podpalenie, dobicie cierniami i skarbem, ponowne użycie miejsca w puli wrogów; zabójstwa po ewolucji liczone do linii; tryb nieskończony nie liczy zabójstw podwójnie; `before` na granicy.

### Etap A2. Jedna broń jako sprawdzian całości

Łuk Dziewanny: korzysta z istniejącego typu `bolt` (zmienia się tylko wybór celu) i prostego warunku (Księga Sokoła na 10.). Sprawdza całą drogę: warunek, pasek w Arsenale, odblokowanie, pojawienie się w kartach. Dopiero potem nowe typy ataku.

### Etap B. Nowe typy ataku (bronie 1–6)

Kolejność według kosztu: Rój (`homing`), Wnyki (`trap`), Miotła (`trail`), Krzywula (`boomerang`), Wir Pochwista (`wander`), Studnia Nawii (`vortex`).
- Każdy nowy `kind`: gałąź w `src/sim/weapons.ts`, wpis w `KIND_LINES` (`src/data/weaponLines.ts`, linie statów do 15. poziomu), rysowanie w `src/render/`, ikona i dźwięk.
- Ślady i pułapki korzystają ze stref i pocisków: limity to 48 stref i 256 pocisków (`src/sim/pools.ts`). Sprawdzić przy dwóch takich broniach naraz i dużym obszarze.
- Bronie wchodzą **bez ewolucji**; ewolucje dokładamy, gdy broń się sprawdzi.
- Sekret Krzywuli: obiekt pod losowym dębem na mapie (scenerię mamy z commita „Sceneria według konceptu”), podniesienie zapisuje `found`, broń kupuje się potem w Skarbcu.
- Każda broń: przebieg bota (`npm run sim`), pomiar przy 500 wrogach (`docs/PERF.md`), zrzut ekranu w `docs/screenshots/`, wpis w `docs/DECISIONS.md`.

### Etap C. Bronie z nietypowymi zasadami (8–14)

Szabla, Puklerz, Wrzeciono, Kieł wąpierza, Kości, Miecz Nawii, Kosa. Większość korzysta z obecnych typów (`sweep`, `bolt`, `bounce`) plus jedna nowa zasada; nowe typy to tylko `guard` i `tether`.
Zasady skalujące się w runie (trwałe HP z Kła, trwały kryt z Kości) muszą mieć sufit, jak Czaszka upiora (+40%).

### Etap D. Ewolucje nowych broni

Pary z tabeli w sekcji 3, partiami po kilka. Ewolucja wymaga broni na poziomie 5 i księgi, jak dziś. Ewolucje zmieniają też losowanie ksiąg (`EVOLUTION_BOOK_WEIGHT`) i nagrody skrzyń, więc końcowy balans robimy po nich, nie przed.

## 5. Kolejność odblokowań

Gracz ma mieć poczucie, że co kilka runów coś dostaje:
- pierwsze runy: obecne 4 proste odblokowania (Marzanna za 3 minuty, Włócznia za 15. poziom, Kruki za Babę Jagę, Garniec za 3000 zabójstw);
- kilka do kilkunastu runów: bronie za księgi na 10. poziom i łańcuchy na 2000 zabójstw;
- późna gra: łańcuchy na 5000, wyzwania postaciami, bossy po 3 razy, sekret, Miecz Nawii.

Liczby do strojenia po zmierzeniu, ile zabójstw i jakie poziomy ksiąg daje typowy run (bot, tryb `career=N` w `scripts/simulate.ts`).

## 6. Ryzyka i decyzje

- **Rozmycie puli na początku runu.** Każda nieposiadana broń dostaje własną wagę 4, więc przy jednej broni w ręku pełna pula 23 broni ma łącznie wagę 92 (dziś 36) i wypycha z kart księgi i ulepszenia. Proponuję wspólny budżet wagi nowych broni, jak przy księgach (`NEW_BOOK_BUDGET`). Po zapełnieniu 4 slotów nowe bronie znikają z kart, więc później problemu nie ma.
- **Ewolucje a sloty ksiąg.** 4 bronie z ewolucjami potrzebują 4 z 5 slotów ksiąg. Przy większej liczbie broni trudniej skompletować pary. Testować botem pełną pulę 24 i pulę zawężoną Rózgą do 4.
- **Nowe bronie bez ewolucji** mogą przegrywać z obecnymi. Szybkie ataki i strefy częściej uruchamiają kradzież życia i skarby. Mierzyć całe zestawy i tempo odblokowań, nie tylko DPS jednej broni.
- **Koszt treści.** Broń z ewolucją to 2 definicje, linie statów, efekty, ikona i dźwięk. Dlatego bronie wchodzą bez ewolucji (etap D osobno).
- **Wydajność.** Ślady, pułapki i wiry przyciągające dodają pracy na każdego wroga. Każdy nowy typ mierzyć przy 500 wrogach.
- **Obecne 4 odblokowania** zostają bez zmian: są dobrym wprowadzeniem.
