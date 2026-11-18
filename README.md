# MegaBerg: Słowiańskie Bory

Oryginalna gra 3D z gatunku „survivors-like” (roguelite z automatycznym atakiem) osadzona w słowiańskim
folklorze. Zapada zmierzch, z kniei wyłażą chochliki, utopce i strzygi, a ty masz przetrwać 10 minut
i pokonać Leszego. Bronie atakują same: ty biegasz, skaczesz, robisz zrywy i wybierasz ulepszenia.

Cała grafika i dźwięk powstają w kodzie (zero plików graficznych i audio).
Stack: **Three.js + TypeScript (strict) + Vite**, testy w **Vitest**.

![Walka o zmroku](docs/screenshots/06-zmrok.png)

## Uruchomienie

```bash
npm install
```

```bash
npm run dev
```

Gra otworzy się pod adresem `http://localhost:5173`. Wersja produkcyjna:

```bash
npm run build && npm run preview
```

Pozostałe komendy:

| Komenda | Co robi |
|---|---|
| `npm test` | testy logiki (Vitest) |
| `npm run typecheck` | sprawdzenie typów bez budowania |
| `npm run sim -- runs=10 skill=good shop=2` | rozgrywa całe runy botem bez przeglądarki (strojenie balansu) |

Wymagana przeglądarka z WebGL 2 (aktualny Chrome, Firefox, Edge).

## Sterowanie

| Klawisz | Akcja |
|---|---|
| `W` `A` `S` `D` | ruch (względem kamery) |
| Mysz (po kliknięciu w grę) lub `←` `→` `↑` `↓` | obrót kamery |
| `Spacja` | skok (przytrzymaj dłużej = wyżej; podwójny skok po zdobyciu Pióra Żar-ptaka) |
| `Shift` | zryw z krótką nietykalnością (odnowienie 1,5 s) |
| `E` (przytrzymaj) | otwieranie płatnych skrzyń, pokłon w kapliczce |
| `1` `2` `3` (`4`) | wybór karty; `R` przelosowanie; `Enter` zabranie łupu ze skrzyni |
| `Esc` lub `P` | pauza (z podglądem buildu i opcjami) |

## Jak się w to gra

- **Run trwa 10 minut.** Wrogowie nadchodzą falami według minutnika, coraz gęściej i coraz twardsi.
  W 2:30 i 7:30 przylatuje Baba Jaga, w 5:00 wychodzi Południca, w 10:00 budzi się **Leszy**.
  Pokonanie Leszego to zwycięstwo; potem można grać dalej w trybie nieskończonym.
- **Bursztyny** wypadające z wrogów to doświadczenie. Awans zatrzymuje grę i daje wybór **1 z 3 kart**:
  nowa broń, poziom broni albo pasywka. Karty mają rzadkość (zwykła, rzadka, epicka, legendarna):
  lepsza rzadkość to silniejszy bonus. Maksymalnie 6 broni i 6 pasywek.
- **Ewolucje:** broń na 5. poziomie plus odpowiednia pasywka zamienia się w potężniejszą formę
  (przez skrzynię albo legendarną kartę przy awansie).
- **Skrzynie** na mapie otwiera się za złote monety (każda kolejna jest droższa). Elitarni wrogowie
  (świecą na złoto) i mini-bossy zostawiają darmową skrzynię.
- **Kapliczki:** podejdź, przytrzymaj `E` i wybierz błogosławieństwo Peruna (obrażenia), Swaroga (ogień),
  Welesa (szczęście i złoto) albo Mokoszy (leczenie). Każdy bóg błogosławi najwyżej dwa razy na run.
- **Leczenie:** z wrogów rzadko wypada chleb ze smalcem albo dzban miodu. Jedzenie czeka na ziemi,
  dopóki masz pełne zdrowie.
- **Czerwone kręgi na ziemi** to zapowiedź ataku obszarowego. Wyjdź z kręgu albo podskocz w chwili uderzenia
  (ataki naziemne da się przeskoczyć; zielone bomby Baby Jagi wybuchają także w powietrzu).
- **Bagienne kałuże** spowalniają; wyłażą z nich utopce.
- **Złoto**, które zostanie w sakiewce na koniec runu, trafia do **Chaty**: stałe ulepszenia między runami.
- **Osiągnięcia** odblokowują postacie, bronie i pasywki albo dają złoto.

Pierwszy run ma prawo skończyć się porażką. Po kilku ulepszeniach z Chaty Leszy jest do pokonania.

## Treść

**Bronie (10 bazowych, każda z 5 poziomami, i 10 ewolucji)**

| Broń | Działanie | Pasywka do ewolucji | Ewolucja |
|---|---|---|---|
| Złote sierpy | krążą wokół bohatera | Pas siłacza | Żniwa Mokoszy |
| Ogień Swarożyca | kule ognia do najbliższego wroga | Krzesiwo | Krąg Swaroga |
| Grom Peruna | piorun w losowych wrogów | Dębowy amulet | Gniew Gromowładcy |
| Ciupaga | szeroki zamach z odrzutem | Lipowa tarcza | Topór Peruna |
| Wianek z ziół | aura raniąca i spowalniająca | Garnek miodu | Kwiat Paproci |
| Proca z krzemieniami | odbijające się pociski | Sakwa z krzemieniami | Gwiezdny Grad |
| Kruki Welesa | przyzwane kruki | Podkowa | Stado Welesa |
| Lodowy oddech Marzanny | stożek mrozu | Onuce szybkobiegacza | Zamieć Marzanny |
| Włócznia Świętowita | przebija szereg wrogów | Serce tura | Cztery Oblicza |
| Garniec dziegciu | płonąca kałuża smoły | Bursztynowy magnes | Smocza Smoła |

**Pasywki (12):** Pas siłacza (obrażenia), Krzesiwo (szybkość ataku), Dębowy amulet (obszar),
Onuce szybkobiegacza (ruch), Serce tura (zdrowie), Garnek miodu (regeneracja), Bursztynowy magnes (zbieranie),
Podkowa (szczęście), Lipowa tarcza (pancerz), Sakwa z krzemieniami (pociski), Pióro Żar-ptaka (skok w powietrzu),
Zielnik wiedźmy (doświadczenie).

**Wrogowie (8):** chochlik (szybki, słaby), utopiec (wolny, wytrzymały, z bagien), kruk (lata),
błędny ognik (kamikaze), strzyga (skacze), wilkołak (szarżuje), bies (rzuca pociskami), licho (teleportuje się).
**Mini-bossy:** Baba Jaga w moździerzu, Południca z kosą. **Boss:** Leszy (3 fazy).

**Postacie (4):** Wojmir (sierpy), Dobrosława (wianek, regeneracja), Bogumił (ciupaga, zdrowie i pancerz),
Jagna (kruki, szczęście). Trzy ostatnie odblokowuje się osiągnięciami.

**Chata:** 13 stałych ulepszeń (obrażenia, zdrowie, szybkość, pancerz, regeneracja, zasięg zbierania,
szczęście, złoto, doświadczenie, odnowienie, obszar, przelosowania kart, wskrzeszenie).

## Struktura kodu

```
src/
  core/      pętla o stałym kroku 60 Hz z interpolacją, wejście, RNG z ziarnem, siatka przestrzenna
  data/      CAŁA treść gry jako dane: bronie, pasywki, wrogowie, postacie, fale, sklep, osiągnięcia
  sim/       czysta symulacja (bez Three.js i DOM): świat, gracz, AI, bronie, karty, spawner, pule SoA
  render/    Three.js: niebo, teren, rekwizyty, bohater, wrogowie (InstancedMesh), efekty, cząsteczki
  audio/     Web Audio: efekty i muzyka generowane w kodzie
  ui/        DOM: HUD, menu, karty, Chata, opcje, ekran końca (po polsku)
  meta/      zapis w localStorage, osiągnięcia, zakupy
  debug/     bot-autopilot i narzędzia testera (window.__mb.debug)
  game.ts    maszyna stanów: menu → gra → pauza / wybór → koniec
tests/       testy Vitest (obrażenia, skalowanie, karty, ewolucje, zapis, ruch, symulacja)
scripts/     symulacja balansu (simulate.ts) i playtesty w bezgłowym Chrome (verify/*.mjs)
docs/        PLAN.md, DECISIONS.md, PERF.md, REPORT.md, screenshots/
```

Symulacja nie wie nic o renderowaniu. Renderer czyta stan świata co klatkę, a o zdarzeniach
(trafienie, wybuch, awans) dowiaduje się z bufora `world.events`. Dzięki temu logikę da się testować
i rozgrywać całe runy bez przeglądarki.

## Jak dodać nową broń

Dopisz jeden obiekt do tablicy `WEAPONS` w `src/data/weapons.ts` i wybierz jeden z gotowych rodzajów zachowania
(`kind`): `orbit`, `bolt`, `lightning`, `sweep`, `aura`, `bounce`, `summon`, `cone`, `lob`.

```ts
{
  id: 'toporki',
  name: 'Toporki drwala',
  desc: 'Wirujące toporki lecą w najbliższego wroga i przebijają dwóch kolejnych.',
  kind: 'bolt',
  color: 0xc0c8d0,
  icon: 'axe',
  base: { damage: 18, cooldown: 1.4, count: 1, area: 0.6, speed: 20, duration: 1.2, pierce: 2, range: 20, knockback: 3 },
  levels: [
    { damage: 24, note: 'Większe obrażenia' },
    { count: 2, note: '+1 toporek' },
    { pierce: 4, note: 'Przebija więcej wrogów' },
    { damage: 32, cooldown: 1.1, note: 'Szybsze, cięższe rzuty' },
  ],
},
```

To wystarczy: broń pojawi się na kartach, w HUD-zie, w statystykach końcowych i będzie renderowana jak inne
pociski. Opcjonalnie: `evolution: { passive: 'pas', into: 'id-ewolucji' }` (i drugi obiekt z `evolved: true`),
`unlock: 'id-osiągnięcia'`, nowa ikona w `src/ui/icons.ts`.

Nowy rodzaj zachowania (inny niż istniejące) to jeden `case` w `updateWeapons` w `src/sim/weapons.ts`.

## Jak dodać nowego wroga

1. Dopisz obiekt do `ENEMIES` w `src/data/enemies.ts` (zdrowie, szybkość, obrażenia, promień, wysokość,
   wartość bursztynu, `ai`: `chase`, `fly`, `kamikaze`, `leaper`, `charger`, `ranged`, `teleporter`).
2. Dodaj model low-poly w `src/render/enemyModels.ts` (funkcja budująca geometrię z pudełek i stożków
   przez `GeoBuilder`, wpis w `buildEnemyModels`). Parametr `swing` animuje kończyny, `flap` skrzydła.
3. Wpisz wroga do mieszanki fal w `src/data/waves.ts` (`WAVES`) albo jako zdarzenie w `WAVE_EVENTS`.
4. Opcjonalnie kolor wybuchu przy śmierci w `KILL_COLOR` (`src/render/fxView.ts`).

Nowe zachowanie AI to jeden `case` w `updateEnemies` w `src/sim/ai.ts`.

## Opcje, zapis, dostępność

- Opcje: głośność ogólna, muzyki i efektów, czułość myszy, liczby obrażeń, wstrząsy ekranu, jakość grafiki.
- Postęp zapisuje się w `localStorage` (klucz `megaberg-slowianskie-bory-v1`). Uszkodzony lub niedostępny
  zapis nie wywraca gry. Reset postępu: Opcje → „Resetuj postęp” (kliknij dwa razy).
- Kamera działa też bez myszy (strzałki). Muzyka startuje po pierwszej interakcji.

## Narzędzia dla testera

W konsoli przeglądarki dostępny jest obiekt `__mb` (gra) oraz `__mb.debug`:

```js
__mb.debug.give('grom');          // dodaj broń na maksymalnym poziomie
__mb.debug.spawn('leszy', 1, 14); // postaw wroga przed kamerą
__mb.debug.time(590);             // przeskocz do końcówki runu
__mb.debug.god();                 // nieśmiertelność
__mb.setBot('good');              // autopilot (null wyłącza)
```

Parametry adresu: `?autostart=1&bot=good&speed=4&force=500` (pominięcie menu, bot, przyspieszenie,
stała liczba wrogów do testu wydajności).

Więcej: [docs/REPORT.md](docs/REPORT.md) (raport z budowy), [docs/DECISIONS.md](docs/DECISIONS.md)
(decyzje projektowe), [docs/PERF.md](docs/PERF.md) (pomiary wydajności).
