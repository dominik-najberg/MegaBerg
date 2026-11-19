# Decyzje podjęte samodzielnie

Każda niejasność rozstrzygnięta bez pytania użytkownika, z krótkim powodem.

## Środowisko i weryfikacja

- **Weryfikacja w bezgłowym Chrome zamiast wbudowanej przeglądarki.** Wbudowany panel podglądu ma wyłączony
  WebGL (`GL_VENDOR = Disabled`, kontekst WebGL/WebGL2 nie powstaje), więc gry 3D nie da się w nim wyrenderować.
  Serwer dev nadal startuje przez `preview_start` (`megaberg`), a granie, zrzuty ekranu i kontrola konsoli idą przez
  systemowy Google Chrome w trybie headless sterowany `playwright-core` (zależność dev w projekcie, nic globalnie).
  Skrypty: `scripts/lib/browser.mjs`, `scripts/verify/*.mjs`. Chrome dostaje prawdziwe klawisze (WASD, spacja, shift).
- **Testy na zintegrowanym GPU (AMD Radeon 860M przez ANGLE/EGL)**, nie na RTX 5070: bliżej „zwykłego laptopa”
  i bez budzenia dGPU.
- **TypeScript 7, Vite 8, Three.js r187, Vitest 5** – najnowsze wersje z npm w dniu budowy.

## Architektura

- **Symulacja oddzielona od renderu** (`src/sim` nie importuje Three.js ani DOM). Powód: testy logiki w Vitest
  i szybkie rozgrywanie całych runów botem bez przeglądarki przy strojeniu balansu.
- **Mapa generowana z ziarna, ale zawsze ta sama** (stałe ziarno): łatwiejszy balans i nauka mapy przez gracza.
- **Kolizje**: gracz i wrogowie to koła na płaszczyźnie XZ + wysokość z heightmapy; drzewa, głazy, kapliczki
  i ogniska to koła statyczne. Bez silnika fizyki.
- **Coyote time** działa, gdy bohater wybiega/zrywa się ze szczytu pagórka (teren ucieka spod nóg szybciej niż 14 cm na krok).

## Rozgrywka

- **Rzadkość kart = siła ulepszenia.** Karta broni zawsze daje +1 poziom, a rzadkość dokłada stały bonus
  obrażeń tej broni (+8% / +16% / +30%). Karta pasywki mnoży bonus poziomu (×1,3 / ×1,7 / ×2,3).
  Powód: rzadkość ma znaczenie przy każdej karcie i jest prosta do przetestowania.
- **Pasywki całkowitoliczbowe mają stałą rzadkość** (Sakwa: epicka, Pióro Żar-ptaka: rzadka), bo „+1,3 pocisku”
  nie ma sensu.
- **Ewolucja: przez skrzynię albo legendarną kartę awansu.** Skrzynia zawsze daje gotową ewolucję w pierwszej
  kolejności. Powód: gracz nie powinien czekać na elitę, kiedy warunki są już spełnione.
- **Podwójny skok to pasywka** (Pióro Żar-ptaka, odblokowywana osiągnięciem), nie ulepszenie z Chaty.
- **Złoto: do Chaty trafia to, co zostało w sakiewce.** Skrzynie w runie kosztują złoto, więc gracz wybiera:
  siła teraz czy stałe ulepszenie później.
- **Darmowe skrzynie (elity, mini-bossy) otwierają się po dotknięciu**, płatne wymagają przytrzymania `E`
  (żeby nie wydać złota przypadkiem).
- **Ataki obszarowe wrogów są telegrafowane kręgiem na ziemi i dają się przeskoczyć** (poza bombami Baby Jagi).
  Powód: skok ma mieć zastosowanie w walce, nie tylko w ruchu.
- **Mali wrogowie nie ranią bohatera będącego nad nimi**: kontakt wymaga pokrycia w pionie.
- **Baba Jaga co kilka sekund pikuje przez gracza.** Pierwotnie tylko krążyła w odległości 10 m i buildy
  z bronią białą nie mogły jej trafić (wyszło w symulacji botem).
- **Każdy bóg błogosławi najwyżej dwa razy na run** i Perun daje +15% (nie +20%). Powód: sześć kapliczek
  z samym Perunem dawało +120% obrażeń w pierwszej minucie.
- **Bazowa regeneracja 0,25 zdrowia/s** dla wszystkich postaci: łagodzi drobne błędy na początku.
- **Czwarta postać (Jagna) i dwie dodatkowe bronie** (Włócznia Świętowita, Garniec dziegciu) ponad minimum,
  bo architektura sterowana danymi czyni je tanimi.
- **Tryb nieskończony** po pokonaniu Leszego: najgęstsza mieszanka fal, mini-boss co 75 s, kolejny Leszy co 5 min.
  Wygrana jest zapisywana od razu; dalsza część dopisuje złoto i zabójstwa, ale nie liczy się jako osobny run.
- **Wyjście do menu w trakcie runu zapisuje zdobyte złoto** (jak „Zakończ run”), żeby nie karać za przerwanie gry.

## Balans

- Strojony symulacją całych runów botem (`npm run sim`), dwa profile: „good” (kituje, unika kręgów, używa
  skrzyń i kapliczek) i „novice” (reaguje późno, karty wybiera półlosowo). Wyniki końcowe (Wojmir):
  dobry bot wygrywa ok. 30% bez Chaty, ok. 55% z poziomem 1–2 wszystkich ulepszeń, ok. 94% z poziomem 4
  (po 16 runów na konfigurację; przy 12 runach wychodziło 25% / 42% / 92%, więc rozrzut to kilkanaście punktów);
  nowicjusz bez Chaty ginie średnio po 2–3 minutach, z poziomem 3 po ok. 5,5 minuty.
- Zdrowie wrogów: `1 + minuta^1,55 × 0,33`, obrażenia: `1 + 0,8 × czas/10 min`.
  Pierwsza wersja (wykładnik 1,4) pozwalała botowi wygrywać 4/6 bez Chaty, a 1,7 nie dawała szans.
- Ewolucje „Gniew Gromowładcy”, „Gwiezdny Grad” i „Krąg Swaroga” osłabione po tym, jak w symulacji
  zadawały ponad milion obrażeń na run; Kruki, Włócznia i Dziegieć wzmocnione (były wyraźnie najsłabsze).
- Bogumił dostał +15% obrażeń i mniejszą karę do szybkości (miał 0/10 wygranych przy 42% Wojmira; po zmianie ok. 31–42%).

## Oprawa

- **Liczby obrażeń na osobnym canvasie 2D** nad sceną (prościej i taniej niż sprite’y z teksturami).
- **Drzewa między kamerą a bohaterem rozpuszczają się ditheringiem** w shaderze, zamiast kolizji kamery.
- **Cień bohatera to „plamka”** plus prawdziwe cienie kierunkowe na jakości średniej i wysokiej.
- **Ikony interfejsu to ręcznie pisane SVG** w `src/ui/icons.ts` (bez emoji i fontów z sieci).
- **Font: systemowy szeryfowy (Georgia)**, bo zakaz pobierania zewnętrznych assetów obejmuje też fonty.
- **Leszy ignoruje drzewa i głazy** (przechodzi przez nie): olbrzym nie może utknąć w zagajniku.

## Review Codexem

Uruchomione: `codex exec review --base <tymczasowa gałąź na commicie M1>`, więc review objął cały kod gry
z M2–M7 (gałąź pomocnicza została potem usunięta). Uwaga techniczna: `codex exec review` nie przyjmuje własnego promptu razem z `--base`,
więc poszedł domyślny przegląd.

Codex potwierdził, że typy i testy przechodzą, i zgłosił cztery uwagi P2. **Przyjąłem wszystkie cztery**
(każda opisuje odtwarzalny błąd rozgrywki), odrzuconych nie ma:

| # | Uwaga Codexa | Decyzja | Poprawka |
|---|---|---|---|
| 1 | Faza Leszego trzymana globalnie (`world.bossPhase`): dwa bossy w różnych fazach wywołują przejście co krok (12 przywołań i hitstop w każdej klatce) | przyjęta | faza per wróg (`enemies.phase[i]`), przejście tylko „w górę”; test z dwoma Leszymi |
| 2 | Monety za Leszego (150 złota) nie do zebrania, bo zwycięstwo zatrzymuje symulację | przyjęta | nagroda dopisywana bezpośrednio, zwycięstwo zbiera też monety z polany; w trybie nieskończonym Leszy nadal zostawia monety; test |
| 3 | `bossIdx` nadpisywany przez każdego nowego mini-bossa, a po jego śmierci ustawiany na -1 mimo żyjącego bossa | przyjęta | `trackBoss()`: po każdym pojawieniu się i śmierci wybiera żyjącego bossa (Leszy przed mini-bossami); test |
| 4 | Kontynuacja w trybie nieskończonym zerowała `shrinesUsed`, blokując osiągnięcie za 3 kapliczki w jednym runie | przyjęta | zerowanie przeniesione do `World.startEndless()` i ograniczone do złota i zabójstw; test |

Własny przegląd przed Codexem wyłapał dodatkowo: spację i Enter natychmiast po śmierci pomijające ekran końca
(teraz tylko Enter, po 0,7 s), Leszego mogącego utknąć między drzewami (ignoruje przeszkody), gęstość roślinności
zmienianą dopiero po przeładowaniu (teraz od razu) i brak reakcji na utratę kontekstu WebGL (komunikat + zapis złota).

Drugi przebieg (`codex exec review --uncommitted`, na samych poprawkach) zgłosił jedną uwagę P2, **przyjętą**:
utrata kontekstu WebGL w trakcie 1,4-sekundowej animacji śmierci lub 2,4-sekundowej animacji zwycięstwa
(stan `ending`) nie zapisywała runu. Obsługa utraty kontekstu bankuje teraz run także w tym stanie.

## Grafika, większa mapa i mapa pod Tab (nocna sesja)

Zlecenie: poprawić jakość grafiki (wolno użyć generatora obrazów Codeksa i Blendera), powiększyć mapę,
dodać mapę pod przytrzymanym `Tab`, na początku zakrytą. Użytkownik poszedł spać, więc wszystko poniżej
rozstrzygnąłem sam.

- **Zasada „zero plików graficznych” przestaje obowiązywać dla scenografii i tekstur**, bo zlecenie wprost
  pozwala na Blendera i generowane obrazy. Postacie, wrogowie, efekty i dźwięk zostają w kodzie.
- **Styl zostaje low-poly z płaskim cieniowaniem**, a jakość podnoszą: malowane tekstury ziemi, bogatsze
  sylwetki drzew, wypalone cieniowanie otoczenia, bloom i gradacja barw. Powód: wrogowie i bohater są
  z brył, więc fotorealistyczne drzewa by do nich nie pasowały.
- **Modele w Blenderze powstają ze skryptu** (`tools/blender/build_props.py`), nie z ręcznie zapisanych
  plików `.blend`: da się je odtworzyć i poprawić jedną komendą. Cieniowanie otoczenia liczy skrypt
  promieniami przez BVH Blendera i zapisuje w kolorach wierzchołków.
- **Własny format modeli** (`props.bin` + `props.json`) zamiast glTF: 660 kB, wczytywanie w kilkunastu
  liniach, bez `GLTFLoader` w paczce i bez zależności od ustawień eksportera.
- **Mapa: promień 180 m zamiast 92 m** (3,8× powierzchni). Gęstość drzew, głazów, kałuż i ognisk
  mniej więcej jak dawniej. **Kapliczek jest 8, nie więcej**: czterech bogów błogosławi po dwa razy,
  więc dziewiąta kapliczka nie miałaby czego dać (przy 10 pękał test limitu błogosławieństw).
- **Ścieżki i nazwane miejsca** dają większej mapie cel wędrówki. Skrzynia przy każdym miejscu to nagroda
  za dojście. Kolizje nowych obiektów to nadal koła.
- **Balans sprawdzony symulacją**: dobry bot bez Chaty 6/16 wygranych (przed zmianą 5/16), z poziomem 2
  ulepszeń 11/16, nowicjusz 0/8. Mieści się w dotychczasowym rozrzucie, więc liczb wrogów nie ruszałem.
- **Mapa pod `Tab` nie pauzuje gry** („przytrzymanie” to podgląd, nie ekran) i zasłania środek ekranu
  półprzezroczystym tłem. Mgła odkrywania jest w symulacji (`src/sim/fog.ts`, komórki 4 m, zasięg wzroku
  30 m), więc ma testy i zeruje się z każdym runem. Boss jest na mapie zawsze widoczny, żeby dało się
  go znaleźć na dużym terenie.
- **Scenografia w kafelkach 44 m**: pełne modele do ok. 92 m, uproszczone dalej, nic powyżej 235 m
  (mgła i tak wszystko zasłania), drobne rośliny do 78 m.
- **Budżet pikseli**: rozdzielczość wewnętrzna jest ograniczona do ok. 3,2 mln pikseli na jakości wysokiej
  (2,3 mln na średniej). Bez tego ekran 4K dawał 44 kl./s na zintegrowanym GPU, z limitem ok. 80.
- **Jakość niska nie ma postprocessingu** (bez bloomu, MSAA i gradacji): to tryb dla słabego sprzętu.
- **Jaśniejsze światło otoczenia i cienie o sile 0,72**: w gęstym lesie nocą walka była nieczytelna.
- **Księżyc wisi nisko nad lasem** (widać go z kamery zza pleców bohatera), ale światło pada z wyższego
  kąta, żeby długie cienie nie zasłaniały walki.
- **Commity na gałęzi `grafika-mapa-minimapa`, bez wypychania**: praca nocna bez nadzoru powinna dać się
  przejrzeć i cofnąć etapami.
