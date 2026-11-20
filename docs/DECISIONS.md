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
- Zdrowie wrogów: `1 + minuta^1,55 × 0,37`, obrażenia: `1 + 1,3 × czas/10 min` (do zmiany monet zbieranych
  samoczynnie było `0,33` i `0,8`; patrz niżej).
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
- **Balans sprawdzony symulacją**: dobry bot bez Chaty 5/16 wygranych (przed zmianą też 5/16), z poziomem 2
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

### Review Codexem (sesja graficzna)

`codex exec review --base main` na całej gałęzi. Typy i 79 testów przeszły; dwie uwagi, **obie przyjęte**:

| # | Uwaga Codexa | Decyzja | Poprawka |
|---|---|---|---|
| 1 | [P2] Zmiana jakości grafiki nie zwalnia celów renderowania i materiałów bloomu oraz przebiegu końcowego (`EffectComposer.dispose()` zwalnia tylko własne bufory) | przyjęta | `Post.dispose()` zwalnia też `bloom` i `final` |
| 2 | [P3] Ognisko przy starcie nigdy nie powstawało: wypadało na ścieżce (`pathAt` ≈ 0,27 przy progu 0,2), a wynik `addBonfire` był ignorowany; najbliższe ognisko było 47 m od startu | przyjęta | szukanie wolnego kierunku wokół polany; test „przy starcie pali się ognisko” |

Drugi przebieg (`codex exec review --uncommitted`, na samych poprawkach): bez uwag, 80 testów przechodzi.
Po poprawce ogniska balans bez zmian (dobry bot bez Chaty 5/16).

## Wczesna ekonomia (zgłoszenie: „za trudno zdobywa się pieniądze”)

Zgłoszenie użytkownika: złoto zdobywa się za trudno i przez to trudno opędzić się od wrogów, zanim bohater
dostanie poziomy i przedmioty. Pomiar przed zmianą (`npm run sim`, tryb `career` dopisany przy tej okazji)
potwierdził trzy przyczyny:

- moneta wypadała z 6% wrogów, więc po pierwszej minucie (ok. 100 zabójstw) gracz miał 6–8 złota,
  a pierwsza skrzynia kosztowała 12;
- po powiększeniu mapy do 180 m **najbliższa skrzynia stała 51 m od startu** (wcześniej, na polanie 92 m,
  kilka było w zasięgu krótkiego spaceru); dobry bot kupował pierwszą płatną skrzynię średnio w 3:23,
  początkujący nigdy;
- początkujący kończył run z ok. 20–50 złota przy cenach Chaty od 30 w górę: po 12 runach miał 10 poziomów
  ulepszeń z 57 i nadal ginął w okolicach 3. minuty.

Zmiany:

- **Szansa na monetę maleje w czasie runu**: 26% na starcie, liniowo do bazowych 6% w 3:30
  (`coinChance` w `src/sim/world.ts`). Powód: złota brakowało na początku, nie na końcu. Pierwsza wersja
  (stałe 13% i droższe monety z silniejszych wrogów) dawała dobremu botowi 1700–5000 złota na run
  i całą Chatę w 4 runy, więc późny dochód został przy starej stawce.
- **Elita zawsze zostawia sakiewkę** (5 monet po 2 złota) obok darmowej skrzyni; dawniej miała 6% szans
  na jedną monetę za 5. Mini-boss: 10 monet po 4 (było po 3).
- **Trzy skrzynie 18–25 m od startu**, po jednej w każdej tercji róży wiatrów, widoczne na mapie od razu
  (zasięg wzroku to 30 m). Stawiane na końcu generowania mapy własnym generatorem liczb, więc reszta boru
  (drzewa, głazy, ścieżki) jest co do metra taka jak była.
- **Skrzynie: pierwsza tańsza, kolejne drożeją szybciej** (10 × 1,75ⁿ zamiast 12 × 1,45ⁿ, czyli
  10, 18, 31, 54, 94, 164). Trzy skrzynie przy starcie kosztują razem 59 złota. Powód stromego wzrostu:
  bliskie skrzynie przy starej krzywej cen podnosiły wygrane dobrego bota bez Chaty z ok. 30% do ok. 50%
  (a z poziomem 2 do 94%); stroma krzywa zostawia łatwiejszy początek, a końcówkę na dawnym poziomie.
- **Podpowiedź na banerze**, gdy pierwszy raz starcza złota na skrzynię („Stać cię na skrzynię!
  Najbliższe widać na mapie [Tab].”). Raz na run.
- **Zasada „do Chaty trafia to, co zostało w sakiewce” zostaje**: wybór między siłą teraz a ulepszeniem
  na stałe ma sens dopiero wtedy, gdy na jedno i drugie w ogóle starcza.
- **Ceny w Chacie i siła wrogów bez zmian.** Zgłoszenie wskazuje na pieniądze jako przyczynę, więc
  poprawiony jest dochód, a nie fale.
- **Bot „novice” też podchodzi do skrzyni, na którą go stać**, ale widzi ją z 28 m (dobry bot z 45 m).
  Wcześniej ignorował skrzynie całkowicie, czego nie robi nawet początkujący człowiek.

Wyniki (Wojmir, po 32 runy na konfigurację; rozrzut między przebiegami to ok. ±10 punktów):

| | przed | po |
|---|---|---|
| pierwsza płatna skrzynia, dobry bot | 3:23 | ok. 1:00 |
| pierwsza płatna skrzynia, początkujący | nigdy | 0:39 |
| początkujący bez Chaty, średni czas runu | 2:20–2:34 | 2:42–3:06 |
| początkujący z poziomem 3 ulepszeń | ok. 5:30 | 7:21–8:14 |
| kariera początkującego po 12 runach: poziomy ulepszeń / czas runu | 10,5 / 2:38 | 28–38 / 5:09–8:16 |
| kariera dobrego bota: pierwsza wygrana | run 5,3 | run 2,3 |
| dobry bot bez Chaty, wygrane | ok. 30% | 31–44% |
| dobry bot z poziomem 2 ulepszeń | 55–69% | 63–78% |
| dobry bot z poziomem 4 | 94% | 100% |

Wniosek: początek runu i pierwsze kilkanaście runów są wyraźnie łatwiejsze, a walka z Leszym bez ulepszeń
pozostaje wyzwaniem. Uwaga do pomiaru: bot trzyma się do 60 m od środka mapy, więc dalszych skrzyń
praktycznie nie używa; człowiek, który wędruje po borze, skorzysta z większego dochodu bardziej niż bot.

Sprawdzone w grze (`scripts/verify/economy.mjs`, bezgłowy Chrome): trzy skrzynie widać na mapie w 1. sekundzie,
podpowiedź pojawia się ok. 0:35, bot kupuje pierwszą skrzynię za 10 złota, konsola bez błędów.


### Review Codexem (wczesna ekonomia)

W katalogu roboczym były równolegle cudze, niezatwierdzone zmiany (`src/render/gfx.ts`, `package.json`,
`scripts/refpack.mjs`), więc zamiast `codex exec review --uncommitted` poszedł `codex exec` z samym diffem
plików ekonomii na wejściu. Codex nie znalazł błędów logiki ani exploitów i porównaniem z wyłączonym
`placeNearChests()` potwierdził na pięciu ziarnach, że teren, przeszkody, ścieżki i dotychczasowe skrzynie
są identyczne. Dwie uwagi do weryfikacji, **obie przyjęte**:

| # | Uwaga Codexa | Decyzja | Poprawka |
|---|---|---|---|
| 1 | [P2] Test „pierwszej minuty” zabijał 100 wrogów w czasie 0 i liczył upuszczone monety, a nie zebrane złoto; skrócenie premii do 1 s nadal by go przechodziło | przyjęta | test rozgrywa prawdziwą minutę początkującym botem na 8 ziarnach: każde zbiera co najmniej cenę skrzyni, co najmniej 6 ją kupuje |
| 2 | [P3] `scripts/verify/economy.mjs` kończył się sukcesem także bez skrzyń, podpowiedzi czy zakupu | przyjęta | sześć asercji (widoczność skrzyń, cena 10, podpowiedź do 60 s, bot żyje, zakup za pierwszą cenę, czysta konsola) i kod wyjścia 1 przy błędzie |

## Dary boru: magnes i darmowa skrzynia

Prośba użytkownika: raz na jakiś czas ma się pojawiać magnes zbierający wszystkie kulki doświadczenia
i monety z całej mapy, a czasami losowa darmowa skrzynia, która różni się od zwykłych płatnych.

- **Magnes zastąpił dawny „kwiat”.** W grze był już rzadki łup z wrogów (0,12% na zabójstwo), który
  ściągał same bursztyny. Teraz to czerwony magnes, ściąga **bursztyny i monety** z całej mapy (jedzenie
  zostaje, bo leży na zapas do chwili, gdy bohater jest ranny) i poza rzadkim łupem **pojawia się
  z minutnika**: pierwszy w 1:30–2:00, kolejne co 2:10–2:50, czyli ok. 4 na run.
- **Dar boru** to osobny rodzaj skrzyni (`gift` w `Chest`): pierwszy w 2:30–3:30, kolejne co 3:20–4:40,
  czyli ok. 2 na run. Otwiera się po dotknięciu jak inne darmowe skrzynie, nie kosztuje złota i nie
  podnosi ceny płatnych. Zawartość jak w każdej skrzyni (ewolucja, jeśli gotowa, inaczej ulepszenie).
- **Wygląd daru:** biała brzoza z zielonymi okuciami, zielony klejnot i dwa listki na wieku, zielona
  poświata i słup światła; okno łupu ma tytuł „Dar boru”, a na mapie znacznik jest zielony. Płatna skrzynia
  to ciemny dąb z mosiądzem. **Skrzynia po elicie i mini-bossie zostaje, jaka była** (dębowa, pulsuje
  na złoto): prośba dotyczyła losowej darmowej skrzyni, a zmiana wyglądu łupu po elicie byłaby osobną decyzją.
- **Oba dary pojawiają się 14–24 m od bohatera**, na wolnym miejscu (bez przeszkód, bagna, innych skrzyń
  i kapliczek, 4 m od krawędzi boru), z banerem, dźwiękiem, słupem światła i znacznikiem na mapie.
  Powód: to nagroda za krótki spacer, a nie za szukanie po całym borze.
- **Nie kumulują się.** Dopóki poprzedni dar czeka w promieniu 60 m, następny tego rodzaju się nie pojawi
  (ponowna próba co 10 s). Magnes porzucony dalej niż 60 m znika, gdy przy bohaterze pojawia się nowy.
- **Własny generator liczb** (`Bonuses` w `src/sim/bonuses.ts`): fale wrogów dla danego ziarna są takie
  same z darami i bez, dopóki gracz ich nie podniesie.
- **Przyciągany łup przyspiesza** (monety tak jak bursztyny), więc łup z drugiego końca mapy dolatuje
  w kilka sekund.

Wpływ na balans (`npm run sim`, Wojmir, po 32 runy; rozrzut między przebiegami to ok. ±10 punktów):

| | bez darów | pierwsza wersja (magnes co ~1:30, dar co ~2:30) | ostateczna |
|---|---|---|---|
| dobry bot bez Chaty, wygrane | 34% | 59% | 34–47% |
| dobry bot z poziomem 2 ulepszeń | 75% | 88% | 84% |
| początkujący bez Chaty, średni czas runu | 3:20 | 3:25 | 3:16–3:32 |

Pierwsza wersja wyraźnie ułatwiała grę (sam magnes +10 punktów, sam dar +10, razem +25), więc oba dary
są rzadsze. Wersja ostateczna mieści się w dotychczasowym celu dla gracza bez Chaty (31–44%) w granicach
rozrzutu; z ulepszeniami gra jest o kilka punktów łatwiejsza. Dwie wartości w kolumnie „ostateczna”
to dwa pomiary tych samych ustawień (przed poprawką generatora liczb i po niej). Częstotliwość ustawia się
czterema stałymi na początku `src/sim/bonuses.ts`.

Sprawdzone w grze (`scripts/verify/bonus.mjs`, bezgłowy Chrome, 15 asercji): baner, model i słup światła
magnesu, znaczniki na mapie, zebranie całego łupu z mapy, wygląd daru inny niż płatnej skrzyni i skrzyni
po elicie, otwarcie za darmo, oba dary przychodzą same w prawdziwym runie, konsola bez błędów.

### Review Codexem (dary boru)

`codex exec` z diffem zmian na wejściu. Pięć uwag, **wszystkie przyjęte**:

| # | Uwaga Codexa | Decyzja | Poprawka |
|---|---|---|---|
| 1 | [P2] Dar zużywał główny generator liczb (losowy obrót skrzyni w `spawnChest`), więc nawet nietknięty zmieniał kolejne fale | przyjęta | `spawnChest` przyjmuje obrót; dar podaje własny |
| 2 | [P2] Test determinizmu nic nie sprawdzał: bohater ginął w 58. sekundzie, przed pierwszym darem | przyjęta | bohater nietykalny, test wymaga, by run trwał do końca i oba dary się pojawiły; po cofnięciu poprawki nr 1 test pada |
| 3 | [P2] Porzucone magnesy mogły się kumulować ponad limit rysowania (16), więc nowy bywałby niewidoczny | przyjęta | nowy magnes zabiera porzucone; test wędrówki po borze |
| 4 | [P3] Skrypt w przeglądarce nie sprawdzał, czy bursztyny dały doświadczenie | przyjęta | asercja zdobytego doświadczenia |
| 5 | [P3] Skrypt nie sprawdzał wyglądu ani znaczników na mapie | przyjęta | asercje modelu, materiału i słupa światła w rendererze oraz kolorów znaczników na płótnie mapy |

## Monety z zabitych wrogów zbierają się same

Prośba: „Zabicie wroga powinno dawać monety z automatu”.

- **Monety z zabicia od razu lecą do bohatera** (`World.dropCoin` w `src/sim/world.ts`): pojawiają się
  już przyciągnięte, tak jak po podniesieniu magnesu. Dotyczy każdej monety z wroga: zwykłej, sakiewki
  elity, monet mini-bossa i bossa w trybie nieskończonym. Powód: gracz widzi, skąd przyszło złoto,
  dźwięk i błysk zebrania zostają, a nie musi wracać po łup.
- **Pełna pula przedmiotów** (256): moneta, której nie da się pokazać, i tak trafia do sakiewki.
- Szanse na monetę zostają bez zmian. Jedzenie i magnes nadal leżą na ziemi.

Wpływ na balans (`npm run sim`, Wojmir, bez Chaty, po 32 runy; rozrzut ok. ±10 punktów):

| | przed | po |
|---|---|---|
| dobry bot, wygrane | 11/32 (34%) | 24/32 (75%) |
| dobry bot, średnie złoto z runu | 700 | 1121 |
| początkujący, wygrane / średni czas | 1/32, 3:31 | 0/32, 4:00 |
| początkujący, średnie złoto z runu | 175 | 203 |

Ceny skrzyń i szanse na monetę tego nie wyrównują: przy mnożniku ceny skrzyń 2,1 / 2,4 / 2,8 dobry bot
wygrywał 22 / 21 / 24 na 32, a przy szansach na monetę obciętych o połowę (mniej więcej tyle złota co
przed zmianą) 21/32. Powód okazał się inny niż złoto: na starym kodzie bot, który **nie zbacza po monety**,
wygrywa 21/32 zamiast 11/32 (większa pula przedmiotów nic nie zmienia, 11/32). Wcześniej bot wchodził po
złoto między wrogów i tam ginął; strojenie trudności zakładało ten koszt, a teraz go nie ma.

**Wyrównanie: trudność walki, nie ekonomia** (`src/data/waves.ts`):

- obrażenia wrogów `1 + 0,8 × czas/10 min` → `1 + 1,3 × czas/10 min` (w 1. minucie +5%, pod koniec +28%),
- zdrowie wrogów `1 + minuta^1,55 × 0,33` → `… × 0,37` (ok. +11% pod koniec runu).

Szukanie (dobry bot, Wojmir, bez Chaty): obrażenia 1,6 + zdrowie 0,40 dawało 25% na 64 runach (za trudno),
1,4 + 0,33 dawało 56%, wybrane 1,3 + 0,37 daje 39%.

| dobry bot bez Chaty, wygrane (32 runy, Wojmir 64) | przed | same monety | ostatecznie |
|---|---|---|---|
| Wojmir | 11/32 (34%) | 24/32 (75%) | 25/64 (39%) |
| Bogumił | 23/32 | 22/32 | 18/32 |
| Dobrosława | 16/32 | 21/32 | 11/32 |
| Jagna | 7/32 | 11/32 | 11/32 |
| wszyscy razem | 45% | 61% | ok. 41% |

| inne profile | przed | ostatecznie |
|---|---|---|
| dobry bot z poziomem 2 ulepszeń (Wojmir) | cel 63–78% | 25/32 (78%) |
| początkujący bez Chaty: wygrane / średni czas runu | 1/32, 3:31 | 0/32, 3:04 |

Średnio wróciło do poziomu sprzed zmiany, ale nie dla każdej postaci tak samo: Bogumił i Dobrosława są
o ok. 5 wygranych na 32 trudniejsi niż przedtem, Jagna o 4 łatwiejsza (rozrzut przy 32 runach to ok. ±3).
Ogólne mnożniki nie wyrównają tego osobno dla postaci. Początkujący ginie ok. 30 s wcześniej, nadal
w przedziale 2–3 minut z pierwotnego celu.

Sprawdzone w grze (`scripts/verify/coins.mjs`, bezgłowy Chrome): elita zabita 18 m od stojącego
bohatera, pięć monet doleciało samo, +10 złota, nic nie zostało na ziemi, konsola bez błędów.
Zrzut: `docs/screenshots/12-monety-leca.png`.

Review Codexem (`codex exec review --uncommitted`): bez uwag; testy i typy przechodzą, zbudowany `dist/` zgadza się ze źródłem.

## Nowe statystyki (etap 1 z `docs/MEGABONK-ANALIZA.md`)

Dodane do `Stats` (`src/data/types.ts`), z formułami w `src/sim/stats.ts`. Na razie nic poza
rekompensatą za krytyk ich nie podnosi; korzystać z nich będą księgi, przedmioty i postacie z kolejnych etapów.

| stat | baza | działanie |
|---|---|---|
| `attackSpeed` | 1 | odstęp ataku broni = baza × `cooldown` / `attackSpeed` |
| `critChance` | 0,05 | szansa na krytyk przy trafieniu bronią; powyżej 1 każdy cios kryci, reszta to szansa na overcrit |
| `critDamage` | 2 | mnożnik krytyka; overcrit dokłada premię jeszcze raz (1 + (cd − 1) × liczba krytyków) |
| `duration` | 1 | czas aktywności sierpów i stożka, życie pocisków, kałuż i odbić |
| `projectileSpeed` | 1 | prędkość pocisków (bełty, proca); kruki i obrót sierpów bez zmian |
| `knockback` | 1 | mnożnik odrzutu z trafień bronią |
| `lifesteal` | 0 | szansa na 1 HP na trafienie bronią; powyżej 100% pewne 1 HP i szansa na drugie |
| `thorns` | 0 | obrażenia (× `damage`) dla wroga, który uderzył wręcz; liczone w `thornsDealt` |
| `evasion` | 0 | szansa uniku = e / (1 + e) |
| `shield` | 0 | punkty tarczy przed HP, po pancerzu; odnawia się po 3 s bez obrażeń, 50% maks. na sekundę |
| `curse` | 0 | trudność za nagrody (niżej) |
| `silverGain` | 1 | samo pole; waluty srebra jeszcze nie ma |

**Szybkość ataku obok odnowienia, nie zamiast.** Odnowienie to dzisiejszy stat z pasywki, sklepu, postaci
i błogosławieństwa, ma granice 0,35–2 i odejmowane procenty szybko by do nich dobiły. Szybkość ataku
jest mnożnikiem: +7,5% na poziom księgi nigdy nie zbije odstępu do zera, tylko maleje coraz wolniej.
Zamiana odnowienia na szybkość ataku zmieniałaby sens każdego istniejącego źródła i zapisanych zakupów
w Chacie. Oba działają razem: odstęp = baza × odnowienie / szybkość ataku, szybkość ataku ma granice 0,25–5.

**Krytyk nie wynika już ze szczęścia** (dawniej 5% + 10% szczęścia, maks. 60%). Szczęście zostaje
od rzadkości kart i łupów. Żeby nic nie straciło siły, to, co obiecywało krytyk, dostaje go wprost:
Jagna +2% (tyle dawało jej +20% szczęścia), podkowa +1,2% na poziom obok szczęścia (pole `also`
w `PassiveDef`, skalowane rzadkością karty), Łaska Welesa +2,5%. Ołtarzyk Welesa w Chacie krytyka nie
obiecywał i go traci (najwyżej 3%). Rzut na krytyk to nadal jedno losowanie na trafienie, a kradzież
życia, unik i klątwa losują tylko, gdy są niezerowe, więc przy bazowych statach przebieg runu jest
identyczny jak przed zmianą.

**Unik z malejącymi zwrotami**: e / (1 + e), więc +10% surowego uniku daje 9%, 100% daje 50%, 300% daje 75%,
a 100% nie da się osiągnąć. Uniknięty cios daje zwykłe pół sekundy nietykalności, inaczej tłum
losowałby co klatkę i unik nic by nie znaczył.

**Tarcza** bierze to, co przeszło przez pancerz; cios w całości na tarczy nie zadaje obrażeń HP ani nie
liczy się do `damageTaken`. Odnowienie zależy od `hurtT` (czas od ostatniego trafienia), tego samego co
efekty trafienia. W HUD jest niebieski pasek na pasku zdrowia i liczba „+N” obok zdrowia, widoczne
tylko przy tarczy > 0. Pauza pokazuje szybkość ataku i krytyk zawsze, resztę nowych statów, gdy coś je podniosło.

**Klątwa** (`curseEffects`): przy klątwie c zdrowie wrogów × (1 + c), liczba żywych wrogów i tempo
pojawiania × (1 + c), obrażenia × (1 + 0,5c), szybkość × (1 + 0,25c), doświadczenie i złoto × (1 + c).
Obrażenia i szybkość rosną słabiej, bo więcej wrogów już samo zwiększa obrażenia na sekundę;
klątwa ma być wyborem „więcej i trudniej za więcej”, a nie szybką śmiercią. Liczby do strojenia,
gdy pojawi się księga klątwy.

Wpływ na balans (`npm run sim`, dobry bot, po 32 runy):

| profil | przed | po |
|---|---|---|
| Wojmir bez Chaty | 19/32 | 19/32 (te same runy) |
| Bogumił bez Chaty | 18/32 | 18/32 (te same runy) |
| Jagna bez Chaty | 11/32 | 11/32 |
| Wojmir z poziomem 4 ulepszeń | 31/32 | 29/32 |

Spadek przy poziomie 4 to brak krytyka z Ołtarzyka Welesa (+2,4% przy poz. 4); mieści się w rozrzucie
(ok. ±3 na 32 runach) i w celu ok. 94%.

### Review Codexem (nowe statystyki)

`codex exec review --uncommitted` znalazł trzy błędy, wszystkie poprawione, z testami w `tests/stats.test.ts`:

- przy dużej szybkości ataku odstęp ciupagi spadał poniżej stałych 0,2 s między zamachami i każdy nowy
  atak kasował drugi zamach (więcej szybkości = mniej obrażeń); odstęp zamachów mieści się teraz w odstępie ataku,
- sierpy i stożek z czasem trwania > 1 dawały ujemne zanikanie w renderze; `WeaponInst.span` zapamiętuje
  pełny czas bieżącej aktywacji i render liczy z niego,
- ciernie zabijające Leszego przy śmiertelnym ciosie ustawiały naraz wygraną i śmierć; teraz wygrana kończy
  obsługę ciosu.

Po poprawkach wyniki bota bez zmian (19/32, 18/32, 11/32, 29/32).

## Księgi zamiast pasywek (etap 2 z `docs/MEGABONK-ANALIZA.md`)

Pasywki stały się **Księgami**: każda podnosi dokładnie jeden stat na poziom, ma do **20 poziomów**
(`BOOK_MAX_LEVEL`), a slotów jest **5** (`MAX_PASSIVES`, wcześniej 6 pasywek po 5 poziomów).
Księga Krzemieni (+1 pocisk) i Księga Żar-ptaka (+1 skok) zostały na 2 poziomach: pocisk na każdą broń
na poziom przy 20 poziomach rozsadziłby balans.

- **Nazwy w kodzie zostają** (`PassiveDef`, `w.passives`, karta `'passive'`, `evolution.passive`):
  zmiana byłaby kosmetyczna na całym kodzie, a ids ksiąg trzymają pary ewolucji i odblokowania.
  W UI i README wszędzie „Księga”.
- **Stare id, nowe nazwy:** pas → Księga Siłacza, krzesiwo → Krzesiwa, amulet → Dębu, onuce → Wędrowca,
  serce → Tura, miod → Pszczół, magnes → Bursztynu, podkowa → Welesa, tarcza → Lipowej Tarczy,
  sakwa → Krzemieni, pioro → Żar-ptaka, zielnik → Zielarki. Pary ewolucji bez zmian.
- **Nowe księgi** na statach z etapu 1: Sokoła (szansa na krytyk, +4%), Wilczego Kła (obrażenia
  krytyczne, +15%), Czarnoboga (klątwa, +8%), Strzygi (kradzież życia, +5%), Głogu (ciernie, +8),
  Mgły (unik, +10%), Grodu (tarcza, +15), Mokoszy (czas działania, +10%), Strzyboga (szybkość pocisków,
  +15%), Dzika (odrzut, +25%). Nowe ikony w `src/ui/icons.ts`: eye, fang, thorn, cloud, palisade,
  hourglass, wind, tusk.
- **Księga Krzesiwa daje szybkość ataku** (+12% na poziom) zamiast −7% odnowienia: zgodnie z decyzją
  z etapu 1, a przy 20 poziomach odnowienie i tak dobiłoby do granicy 0,35. Przy +8% bot wygrywał
  wyraźnie rzadziej (Wojmir 14/32, Bogumił 13/32): dawne odejmowanie od odnowienia rośnie szybciej niż
  liniowo (5 poziomów rzadkich: −45% odnowienia = ×1,8 szybciej), więc odpowiednik liniowy musi być większy.
- **Księga Welesa to czyste szczęście.** Krytyk z podkowy z etapu 1 zniknął, bo krytyk ma teraz własną
  księgę. Najbardziej odczuła to Jagna (kruki ewoluują z Księgą Welesa): 42/128 → 27/128 nawet z +6% kryt. Zamiast
  łamać zasadę „jeden stat”, Jagna dostała +12% szansy na krytyk zamiast +2% (z wariantów +12% kryt.,
  +40% szczęścia, +6% kryt. i +50% obr. kryt., +6% kryt. i +12% szybkości ataku wybrany najprostszy,
  który wraca do poziomu sprzed zmian: 44/128).
- **Pula startowa jest mała, reszta przez osiągnięcia** (jak tomy w Megabonku). Przy wszystkich
  22 księgach w puli rdzeniowe księgi pojawiały się rzadziej i Jagna spadała do 10/64. Na start:
  12 dawnych ksiąg i Księga Sokoła. Osiągnięcia związane ze stylem gry (nowy warunek `book`: księga na
  danym poziomie w jednym runie; `RunSummary.books`): Sokoła 8 → Wilczego Kła, Lipowej Tarczy 6 → Grodu,
  Tura 8 → Głogu, Wędrowca 6 → Mgły, Dębu 8 → Mokoszy, Krzemieni 2 → Strzyboga, 1500 wrogów w runie →
  Strzygi, 5000 wrogów łącznie → Dzika, pokonanie Leszego → Czarnoboga (klątwa dopiero, gdy gracz umie
  wygrać). Partnerzy ewolucji są zawsze w puli startowej (test).
- **Wagi kart** (`src/sim/cards.ts`): poziom posiadanej księgi 1,6 (było 2,4; broń 3), w skrzyni 1
  (było 2). Księgi mają 20 poziomów, więc przy starych wagach ciągle wypierały karty broni i opóźniały
  ewolucje. Nowe księgi dzielą jeden budżet wagi (`NEW_BOOK_BUDGET` = 16, najwyżej 1,6 na księgę),
  żeby duża pula nie zalewała kart; księga-partner ewolucji posiadanej broni nadal 2,6.
  Rzadkość mnoży poziom księgi jak wcześniej (×1 / 1,3 / 1,7 / 2,3).
- **Bot** (`src/debug/bot.ts`) omija Księgę Czarnoboga i niżej ceni księgi niszowe (Dzika, Strzyboga,
  Głogu, Mokoszy, Mgły, Bursztynu, Żar-ptaka, Sokoła; Wilczego Kła, póki krytyk < 15%), chyba że to
  partner ewolucji. Bez tego brał je na równi z obrażeniami i wynik mierzył słabą grę, nie balans.
- `npm run sim` ma nowy argument `books=id,id` (ograniczenie puli ksiąg), użyty do szukania przyczyn.

Wpływ na balans (`npm run sim`, dobry bot; „przed” to stan po etapie 1, który przy bazowych statach
daje te same runy co HEAD):

| profil | przed | po |
|---|---|---|
| Wojmir bez Chaty, 64 runy | 25/64 | 29/64 |
| Bogumił bez Chaty, 64 runy | 32/64 | 38/64 |
| Dobrosława bez Chaty, 64 runy | 27/64 | 23/64 |
| Jagna bez Chaty, 128 runów | 42/128 | 44/128 |
| Wojmir z poziomem 2 ulepszeń, 64 runy | 49/64 | 45/64 |
| Wojmir z poziomem 4 ulepszeń, 64 runy | 61/64 | 57/64 |
| początkujący bez Chaty, 32 runy | 0/32, 3:04 | 0/32, 2:56 |

Po 32 runy (te same ziarna co w etapie 1): Wojmir 19 → 17, Bogumił 18 → 18, Jagna 11 → 7,
Wojmir z poz. 4 29 → 26. Rozrzut przy 32 runach to ok. ±3–4, dlatego Jagnę mierzono na 128.
Z ulepszeniami wychodzi o ok. 4 wygrane na 64 mniej (pięć runów z poz. 4 kończy się limitem 12 minut
z żywym Leszym, nie śmiercią); to w granicach 1–1,5 odchylenia, zostawione do strojenia razem z etapem 3
(poziomy broni), który i tak przestawi krzywą siły.

### Review Codexem (księgi)

`codex exec review --uncommitted` (etapy 1 i 2 razem) znalazł dwa błędy, oba poprawione, z testami
w `tests/books.test.ts`:

- przy dużej szybkości pocisków (Księga Strzyboga) pocisk przelatywał przez wroga między klatkami;
  pociski poruszają się teraz krokami najwyżej 0,6 m (`PROJ_SUBSTEP`), przy bazowych prędkościach
  (do 28 m/s) to nadal jeden krok, więc runy bota bez zmian (17/32, te same runy),
- przy 20 poziomach Księga Wędrowca dobijała do limitu szybkości ruchu 2,2, a dalsze poziomy niczego nie
  dawały; limity są w `STAT_CAPS` (`src/sim/stats.ts`), a księga statu na limicie nie trafia już na
  karty awansu ani do skrzyń.

## Poziomy broni z liniami statów (etap 3 z `docs/MEGABONK-ANALIZA.md`)

Konsultacja z Codexem (`codex exec`, dwa warianty: same losowe linie albo hybryda). Wybrana **hybryda**,
jak radził Codex: ręcznie pisane poziomy 2–5 zostają, bo nadają broniom charakter (drugi zamach, +1 sierp,
wybuchające kule), a każda karta broni dolosowuje **linie statów** (`src/data/weaponLines.ts`).

- **4 sloty broni** (`MAX_WEAPONS`, było 6), **cap 15** (`WEAPON_MAX_LEVEL`). Poziomy 6–15 to same linie.
- **Linie** zależą od rodzaju broni (`KIND_LINES`): obrażenia, szybkość ataku, obszar, czas działania,
  prędkość, odrzut, a całkowite +1 przebicie / odbicie / przeskok pioruna tylko tam, gdzie mają sens.
  Linie na jednej karcie są różne. Wieczna orbita (Żniwa Mokoszy, odnowienie 0) nie losuje szybkości ataku
  ani czasu działania, bo nic by nie dały (rada Codexa). **Liczba pocisków nie jest linią**: zostaje w
  kamieniach milowych i Księdze Krzemieni, bo mnoży wszystko inne.
- **Rzadkość**: liczba linii 1 / 2 / 3 / 3, siła ×1 / 1 / 1,1 / 1,3 (całkowite linie bez mnożnika).
  Nowa broń dostaje jedną linię mniej. Dawny bonus rzadkości (+8/16/30% obrażeń broni) zniknął; linia
  obrażeń trafia do tego samego `WeaponInst.bonus`, reszta do `WeaponInst.lines`, a statystyki broni to
  `applyLines(weaponStatsAt(...), lines)` (`World.refreshWeapon`), więc kamienie milowe i ewolucja
  nie kasują linii.
- **Ewolucja od 5. poziomu** (`EVOLVE_LEVEL`) z księgą, jak dotąd. Ewolucja **zachowuje poziom i linie**
  (jeden licznik poziomu, rada Codexa) i dalej rośnie liniami do 15. W HUD broń ewoluowana ma „★” przed poziomem.
- Wartości linii strojone botem. Pierwsze (+12% obrażeń, +8% szybkości ataku, +10% obszaru) dawały za
  łatwą grę; wybrane 0,7 z nich: +8,5% obrażeń, +5,5% szybkości ataku, +7% obszaru, +8,5% czasu
  działania i prędkości, +18% odrzutu.

Wpływ na balans (`npm run sim`, dobry bot, po 64 runy; „przed” to koniec etapu 2):

| profil | przed | pierwsze linie | wariant 0,6 | 1/1/2/2 linii | **wybrane (0,7)** |
|---|---|---|---|---|---|
| Wojmir bez Chaty | 29 | 32 | 21 | 8 | **22** |
| Bogumił bez Chaty | 38 | 43 | 31 | 28 | **32** |
| Dobrosława bez Chaty | 23 | 36 | 14 | 10 | **19** |
| Jagna bez Chaty | ok. 22* | 36 | 16 | 8 | **17** |
| Wojmir z poz. 2 ulepszeń | 45 | 50 | 36 | 38 | **40** |
| Wojmir z poz. 4 ulepszeń | 57 | 64 | 56 | 54 | **58** |

\* Jagna na końcu etapu 2: 44/128. Bez ulepszeń średnio ok. 35% (cel ok. 30%), z poz. 4 91% (cel 90%+).
Początkujący bez Chaty: 0/32, średnio 3:20 (było 2:56). `npm run build` przechodzi.

### Review Codexem (poziomy broni)

Dwie uwagi, obie poprawione, z testami:

- osiągnięcie „1500 wrogów w jednym runie” (Księga Strzygi) liczyło `kills`, które tryb nieskończony
  zeruje do osobnego rozliczenia; jest nowe pole `runKills` (cały run) w `World` i `RunSummary`,
  a warunek `runKills` sprawdza je,
- linia szybkości ataku była losowana także wtedy, gdy broń już strzela z minimalnym odstępem silnika
  (0,12 s, kruki 0,15 s; `minInterval` w `src/sim/weapons.ts`); taka broń jej już nie dostaje.

## Skarby ze skrzyń (etap 4 z `docs/MEGABONK-ANALIZA.md`)

Skrzynia daje najpierw gotową ewolucję (jak dotąd), a w pozostałych przypadkach **jeden skarb**
(`src/data/items.ts`) zamiast ulepszenia posiadanej broni lub księgi. Skarbów nie ogranicza liczba miejsc,
kopie się sumują (`World.items`, licznik efektów `World.fx`), każdy ma stałą rzadkość.

- **Losowanie**: najpierw rzadkość (`rollRarity` ze szczęściem + 0,6, `CHEST_LUCK`; zwykłe są możliwe,
  wcześniej skrzynia zawsze dawała co najmniej rzadką kartę), potem losowy skarb tej rzadkości z puli
  (`World.itemPool`, gotowe pod odblokowania w etapie 7). Brak skarbu danej rzadkości: niższa rzadkość.
- **17 skarbów.** Siedem dodaje staty na kopię (Róg tura, Żelazny kołpak, Plaster miodu, Bursztynowy sznur,
  Pazur rysia, Wilcza skóra, Czara Mokoszy). Dziesięć ma efekty, a siła rośnie z liczbą kopii:
  Krzemień iskrzący (6% na wybuch 50% ciosu), Kamień Peruna (8% na piorun 80% ciosu), Kosa Marzanny
  (0,5% na zabicie zwykłego wroga; bossy i mini-bossy odporne), Czaszka upiora (+0,05% obrażeń za
  zabójstwo, do +40% na kopię), Mech pustelnika (do +30% obrażeń po sekundzie stania), Skrzydlate łapcie
  (60% premii do szybkości ruchu idzie w szybkość ataku), Sakiewka wędrowca (1 złota za 30 m),
  Dzban kowala (cap poziomu broni +5, każdy kolejny +2: `World.weaponCap()`), Kowadło Swaroga (+1 linia
  na każdej karcie broni), Lustro wiedźmy (+0,25 s nietykalności po ciosie).
- Szanse przy trafieniu mają wspólny sufit 60% (`PROC_CHANCE_CAP`). Obrażenia z efektów idą przez
  `SLOT_PROC`: bez krytyka, bez kradzieży życia i bez kolejnych efektów (żadnych łańcuchów), liczone
  osobno (`procDealt`). Wszystkie losowania odbywają się tylko przy posiadanym skarbie, więc bez skarbów
  przebieg runu się nie zmienia.
- UI: karta „Skarb” z liczbą posiadanych kopii, rząd skarbów w HUD (ramka w kolorze rzadkości, liczba kopii),
  sekcja „Skarby” w pauzie. Nowe ikony: horn, helmet, honeycomb, beads, claw, pelt, cup, moss, mirror, anvil.

Wpływ na balans (`npm run sim`, dobry bot, po 64 runy; „przed” to koniec etapu 3):

| profil | przed | po |
|---|---|---|
| Wojmir bez Chaty | 22 | 23 |
| Bogumił bez Chaty | 32 | 34 |
| Dobrosława bez Chaty | 19 | 18 |
| Jagna bez Chaty | 17 | 21 |
| Wojmir z poz. 2 ulepszeń | 40 | 48 |
| Wojmir z poz. 4 ulepszeń | 58 | 61 |
| początkujący (32 runy) | 0, 3:20 | 0, 2:51 |

Bez ulepszeń średnio ok. 37%, z poz. 4 95%. Ewolucji jest mniej (Wojmir średnio 3,1 → 1,9 na run), bo skrzynie
nie podnoszą już poziomów broni; ich siłę przejęły skarby. `npm run build` przechodzi.

### Review Codexem (skarby)

- **Poważny błąd:** wybuch Krzemienia i piorun Kamienia Peruna szły przez `damageCircle`, który zbiera cele
  do `bufB`, a ten sam bufor iteruje właśnie atak obszarowy, który wywołał efekt (piorun broni, wybuchy,
  kałuże). Część wrogów dostawała podwójnie, część wcale. Efekty mają teraz własny bufor `bufC`
  (`World.procCircle`); test sprawdza, że efekt nie rusza `bufA` ani `bufB` (z dawnym kodem nie przechodzi).
- HUD nie zdejmował „MAX” z broni po zdobyciu Dzbana kowala; klucz odświeżania obejmuje teraz `weaponCap()`.

Po poprawce (64 runy): Wojmir 26, Bogumił 31, Dobrosława 22, Jagna 20, z poz. 2 48, z poz. 4 60
(średnio ok. 39% bez ulepszeń, 94% z poz. 4).

## Pasywki postaci i nowi bohaterowie (etap 5 z `docs/MEGABONK-ANALIZA.md`)

Każda postać ma teraz **pasywkę rosnącą z poziomem** w runie (`CharacterDef.passive`: nazwa, opis,
`perLevel` dodawane raz na każdy poziom powyżej 1. w `computeStats`, opcjonalna reguła `power`).
Awans od razu odświeża statystyki (`World.gainXp`). Karta postaci pokazuje pasywkę.

| postać | pasywka | broń | odblokowanie |
|---|---|---|---|
| Wojmir | Hart woja: +0,6% obrażeń / poz. | sierpy | od początku |
| Dobrosława | Zielna mądrość: +0,03 zdrowia/s i +2% zasięgu zbierania / poz. | wianek | 5 minut (bez zmian) |
| Bogumił | Kowalska skóra: +1,5 zdrowia i +0,03 pancerza / poz. | ciupaga | 1000 wrogów (bez zmian) |
| Jagna | Wiedźmie oko: +0,3% szansy na krytyk / poz. | kruki | Baba Jaga (bez zmian) |
| **Radogost** | Pełna sakwa: +1% obrażeń za 10 złota w sakiewce (do +30%), +1% złota / poz. | proca | 400 złota w jednym runie (warunek `runGold`) |
| **Strzeżymir** | Pęd: 1% szybkości ponad bazę = +0,5% obrażeń, +0,5% obrażeń / poz. | włócznia | +60% szybkości ruchu w runie (warunek `speed`) |
| **Mszczuj** | Krew za krew: +4% kradzieży życia, +0,5% / poz. | oddech Marzanny | 300 zdrowia z kradzieży życia w runie (warunek `lifesteal`, `RunSummary.lifestealHealed`) |

Nowi bohaterowie wyglądają jak istniejące sylwetki (`look.style`) w innych barwach: osobne modele to
praca graficzna na później. Pełna sakwa działa jak mnożnik w `damageEnemy` (`World.goldPower`), więc
Radogost wybiera między wydaniem złota na skrzynię a siłą ciosu. Przy siedmiu postaciach ekran wyboru
się przewija; przyciski są przyklejone do dołu arkusza.

**Balans.** Same pasywki dawały za łatwą grę (64 runy: Wojmir 34, Bogumił 34, Dobrosława 29, Jagna 28,
Radogost 41, Mszczuj 41, z poz. 4 64/64). Najpierw osłabione wartości z pierwszego projektu (Wojmir
1% → 0,6%, Jagna 0,5% → 0,3%, Radogost bez +10% szczęścia i z limitem 30% zamiast 50%, Mszczuj 8% + 1%
→ 4% + 0,5%), co dawało średnio ok. 46% bez ulepszeń. Ponieważ etapy 1–5 razem dodały graczowi siły,
dodatkowo **zdrowie wrogów** rośnie odrobinę szybciej: `1 + minuta^1,55 × 0,37` → `× 0,42`
(`src/data/waves.ts`, ok. +13% pod koniec runu).

| 64 runy | koniec etapu 4 | pasywki (1. projekt) | osłabione pasywki | **wybrane: + zdrowie wrogów** |
|---|---|---|---|---|
| Wojmir | 26 | 34 | 22 | **19** |
| Bogumił | 31 | 34 | 36 | **28** |
| Dobrosława | 22 | 29 | 29 | **26** |
| Jagna | 20 | 28 | 31 | **18** |
| Radogost | – | 41 | 42 | **31** |
| Strzeżymir | – | 30 | 30 | **31** |
| Mszczuj | – | 41 | 27 | **26** |
| Wojmir z poz. 2 | 48 | 53 | 45 | **43** |
| Wojmir z poz. 4 | 60 | 64 | 62 | **58** |

Wojmir bez ulepszeń 30% (cel ok. 30%), z poz. 4 91% (cel 90%+); średnia postaci ok. 40%.
Początkujący: 1/32, 2:49. `npm run build` przechodzi.

### Review Codexem (postacie)

- Strzeżymir miał się odblokowywać Księgą Wędrowca na 10. poziomie, ale przy ulepszeniach z Chaty
  i epickich kartach szybkość dobija do limitu 2,2 wcześniej, a księga statu na limicie znika z kart:
  warunek bywał nieosiągalny. Teraz warunek to „+60% szybkości ruchu w jednym runie” (`speed`,
  `RunSummary.peakMoveSpeed`), osiągalny każdą drogą (księga, Chata, skarby).
- Złoto do odblokowania Radogosta liczyło `goldCollected`, które tryb nieskończony zeruje; jest pole
  `runGold` z całego runu (jak `runKills`). Test obejmuje oba przypadki.

## Portal, nadgodzina, kapliczki, przelosowanie i wygnanie (etap 6 z `docs/MEGABONK-ANALIZA.md`)

**Portal Leszego.** Konsultacja z Codexem (`codex exec`): portal w 10:00, gracz sam wybiera chwilę walki
(przytrzymanie `E` 1,5 s), **bez automatycznego bossa** (wybór walki to sens portalu) i **bez premii za
zwlekanie** (gęstsze fale same dają więcej XP i złota). Przyjęte w całości poza liczbami gęstości:

- zdarzenie `portal` zamiast `boss` w 10:00 (`WAVE_EVENTS`), portal na wolnym miejscu 25–40 m od bohatera,
  z wolną linią marszu (żadnego drzewa ani kamienia po drodze); zielony pierścień w słupie światła,
  znacznik na mapie;
- **nadgodzina** 10:00–12:00: żywych wrogów 260 → 320, tempo 13 → 16 (`OVERTIME_PHASE`); Codex proponował
  300 → 340 i 13 → 18, ale bot ginął wtedy w drodze do portalu;
- **fala końcowa** od 12:00: zdrowie i obrażenia wrogów ×1,25 co 30 s (`finalWaveMul`), aż do wezwania;
- gdy Leszy wychodzi, zwykli wrogowie dalej niż 22 m od bohatera znikają (bez łupów i zabójstw):
  „bór cichnie przed strażnikiem”. Bez tego walka z bossem toczyła się w hordzie z nadgodziny;
- `npm run sim` ma domyślny limit 15 minut (było 12), bo run trwa teraz dłużej;
- bot idzie do portalu od razu, z siłą rosnącą co sekundę zwłoki.

Pierwsza wersja (portal 35–55 m od środka mapy, bez ciszy, gęstość wg Codexa) dała Wojmirowi 6/64,
a z poz. 4 43/64. Bot ginął w nadgodzinie albo utykał na drzewach w drodze do portalu: 16 z 64 runów
z poz. 4 skończyło się limitem czasu bez wezwanego Leszego. Stąd portal bliżej bohatera, z wolną linią
marszu, i cisza.

**Kapliczki** (`SHRINE_KINDS` w `src/sim/terrain.ts`; osiem miejsc jak dotąd): cztery kapliczki bogów
(Perun, Swaróg, Weles, Mokosz po dwa razy, czyli najwyżej cztery błogosławieństwa zamiast ośmiu),
dwa **święte kręgi** (5 s w kręgu o promieniu 5 m, poza nim ładunek spada o 0,5 s/s; wybór 1 z 3 darów
z `CIRCLE_BOONS`; naładowanego kręgu nie da się zostawić na później), **kapliczka bursztynowa**
(przyciąga wszystkie bursztyny) i **ołtarz chciwości** (skarb i 30 złota za +15% klątwy do końca runu).
Kolor poświaty i znacznika na mapie mówi, jaka to kapliczka. Bot omija ołtarz chciwości, tak jak księgę klątwy.

**Klątwa** była już w statach (etap 1) i Księdze Czarnoboga (etap 2); ołtarz chciwości to trzecie źródło.

**Przelosowanie i wygnanie za złoto.** Darmowe przelosowania z Kości wróżebnych zostają; po nich kolejne
kosztują 8 złota ×1,5 za każde (`REROLL_COST`). „Wygnaj” pod nową bronią lub księgą usuwa ją z puli do
końca runu za 12 złota ×1,5 za każde (`BANISH_COST`) i dobiera kartę na jej miejsce. Ulepszeń posiadanych
rzeczy i ewolucji wygnać się nie da. Bot z nich nie korzysta.

Wpływ na balans (`npm run sim`, dobry bot, po 64 runy; „przed” to koniec etapu 5):

| profil | przed | pierwsza wersja | **ostatecznie** |
|---|---|---|---|
| Wojmir | 19 | 6 | **16** |
| Bogumił | 28 | 14 | **32** |
| Dobrosława | 26 | 14 | **28** |
| Jagna | 18 | 12 | **17** |
| Radogost | 31 | 21 | **33** |
| Strzeżymir | 31 | 13 | **22** |
| Mszczuj | 26 | 8 | **34** |
| Wojmir z poz. 2 | 43 | 32 | **42** |
| Wojmir z poz. 4 | 58 | 43 | **59** |

Wojmir bez ulepszeń 25%, średnia postaci ok. 41%, z poz. 4 92%. Początkujący 1/32, 2:51.
`npm run build` przechodzi.

### Review Codexem (portal i kapliczki)

- Leszy wezwany w fali końcowej przejmował na stałe jej mnożniki zdrowia i obrażeń (np. w 12:40 +56%),
  bo mnożniki liczone na początku klatki trafiały do jego statystyk. Teraz po wezwaniu są przeliczane
  od razu (`updateEnemyScaling`); test porównuje zdrowie Leszego z wartością bez fali.
- Osiągnięcie Księgi Mgły („Księga Wędrowca na 6. poziomie”) też mogło stać się nieosiągalne na limicie
  szybkości (np. dwa dary kręgu z szybkością plus Chata). Warunek to teraz „+35% szybkości ruchu w jednym
  runie” (`speed`), tak jak u Strzeżymira.

## Srebro, Skarbiec i Rózga wróżbity (etap 7 z `docs/MEGABONK-ANALIZA.md`)

- **Srebro** (`SaveData.silver`): każdy run daje `⌊(minuty + zabici/400 + 10 za zwycięstwo) × mnożnik srebra⌋`
  (`silverFor`, `RunResult.silver`, ekran końca runu). Wygrany run to ok. 30–40 srebra, przegrany w 7. minucie
  ok. 10. Mnożnik podnosi nowe ulepszenie Chaty „Srebrna skrzynka” (+15% na poziom, za złoto). Złoto i Chata
  działają jak dotąd.
- **Skarbiec**: pięć skarbów ma `unlock` (osiągnięcie stylu gry) i cenę w srebrze (`ItemDef.silver`).
  Do skrzyń trafiają dopiero po kupnie (`unlockedItemIds`, `SaveData.bought`). Osiągnięcia: +50% szybkości
  ruchu → Skrzydlate łapcie (20), 5 minut z najwyżej 150 straconego zdrowia → Lustro wiedźmy (15), broń na
  15. poziomie → Dzban kowala (30), 3 ewolucje w runie → Kowadło Swaroga (40), 3000 wrogów w runie → Kosa
  Marzanny (40). Nowe warunki: `evolveCount`, `weaponLevel`, `unhurt`. To ten sam dwuetapowy wzór co
  w Megabonku (najpierw zrób coś, potem kup), ale tylko dla nowych skarbów: istniejące postacie, bronie
  i księgi zostają odblokowane samym osiągnięciem, żeby nie zabrać graczom niczego z dotychczasowych zapisów.
- **Rózga wróżbity** (30 srebra, Toggler z Megabonka): w Chacie pojawiają się przełączniki broni, ksiąg
  i skarbów (`SaveData.disabled`, `togglePool`, `runPool`). Pula nie spada poniżej 4 broni, 6 ksiąg
  i 6 skarbów (`MIN_ENABLED`). Broń startowa postaci działa zawsze.
- Zapis: nowe pola są sprawdzane w `sanitizeSave` (stare zapisy dostają 0 srebra i puste listy); wersja
  zapisu bez zmian.

**Balans.** Pula skarbów na start skurczyła się, a wśród legendarnych nie zostało nic. Losowanie najpierw
rzadkości, potem skarbu spychało wtedy każdą wyrzuconą legendę na jedyny epicki skarb, Czarę Mokoszy
(+40 zdrowia, +8% kradzieży życia), i bot wygrywał dużo częściej (Wojmir 41/64). Teraz losuje się tylko
spośród rzadkości obecnych w puli (`rollItem`), a Czaszka upiora została w puli startowej. Mimo to
skrzynie z mniejszej puli są mocniejsze (słabsze dla bota skarby, jak Dzban i Kowadło, wypadły), więc
zdrowie wrogów rośnie znów odrobinę szybciej: `× 0,42` → `× 0,52` we wzorze z etapu 5.

| 64 runy | koniec etapu 6 | Skarbiec (z błędem rzadkości) | poprawka rzadkości | zdrowie 0,47 | **zdrowie 0,52** |
|---|---|---|---|---|---|
| Wojmir | 16 | 41 | 29 | 24 | **20** |
| Bogumił | 32 | 54 | 36 | 37 | **41** |
| Dobrosława | 28 | 50 | 31 | 27 | **27** |
| Jagna | 17 | 40 | 28 | 18 | **13** |
| Radogost | 33 | 52 | 40 | 39 | **28** |
| Strzeżymir | 22 | 40 | 29 | 25 | **24** |
| Mszczuj | 34 | 33 | 31 | 36 | **38** |
| Wojmir z poz. 2 | 42 | 55 | 50 | 46 | **43** |
| Wojmir z poz. 4 | 59 | 64 | 64 | 61 | **60** |

Wojmir bez ulepszeń 31%, z poz. 4 94%; średnia postaci ok. 43%. Rozrzut między postaciami jest duży
(Jagna 20%, Bogumił 64%) i to zadanie do strojenia postaci, nie mechaniki meta. Początkujący 0/32, 2:32.
Kariera (`npm run sim -- career=12`, 4 kariery): pierwsza wygrana średnio w 2,8. runie. `npm run build` przechodzi.

### Review Codexem (srebro)

Tryb nieskończony płacił srebrem drugi raz za minuty sprzed zwycięstwa (`time` nie jest zerowany przy
przejściu w tryb nieskończony). `World.bankedTime` zapamiętuje czas już rozliczony przy zwycięstwie,
a `silverFor` liczy tylko resztę; test w `tests/meta.test.ts`.

## Etap 8: bot z nowymi mechanikami, wyrównanie postaci, stare zapisy

### Bot korzysta z przelosowań, wygnań i świętego kręgu

Najpierw bot, żeby balans mierzył grę z nowymi mechanikami (`src/debug/bot.ts`). Dotyczy tylko dobrego bota;
początkujący gra jak dotąd.

- **Przelosowanie.** Ocena kart bez zmian (`score`: nowa broń 9, ulepszenie broni 7, księga do ewolucji 7,5,
  zwykła księga 5,5–6, wypełniacze 1–4, plus rzadkość). Ofertę, w której najlepsza karta ma mniej niż 7
  (czyli brak ulepszenia broni, nowej broni i księgi do ewolucji), bot przelosowuje: darmowo, póki są Kości
  wróżebne, a potem za złoto. Najwyżej 2 przelosowania jednej oferty. Pierwsza wersja dla płatnych miała
  próg 6 i dawała 0,1 płatnego przelosowania na run, więc bot w praktyce z nich nie korzystał. Przy progu 7
  jest ok. 1,3–2,1 płatnego przelosowania na run bez Chaty (z poz. 4 ok. 3,5 w sumie, w tym darmowe),
  a wyniki mieszczą się w szumie (suma 7 postaci bez Chaty 195/448 wobec 207 przy progu 6).
- **Wygnanie.** Nową księgę, którą bot ocenia poniżej 5 (niszowe księgi zwykłej rzadkości: Dzik, Strzybóg,
  Głóg, Żar-ptak, Sokół, Mokosz, Wilczy Kieł przy niskim krycie, klątwa Czarnoboga), wygania, o ile nie ewoluuje z nią żadna posiadana broń ani broń, która może jeszcze
  przyjść (wolny slot, broń w puli i niewygnana). Broni nie wygania: bot ich nie ocenia, a przy pełnych
  slotach i tak nie są oferowane. Ok. 0,6–0,9 wygnania na run.
- **Rezerwa złota.** Płatne przelosowania i wygnania zostawiają w sakiewce połowę ceny następnej skrzyni
  (`GOLD_RESERVE = 0,5`). Przy pełnej cenie skrzyni bot prawie nigdy nie miał wolnego złota; skarby ze skrzyń
  są warte więcej niż jedna lepsza karta, więc rezerwa zostaje.
- **Święty krąg.** Bot podchodzi do najbliższego niewykorzystanego kręgu, gdy w pobliżu jest spokojnie
  (zagrożenie < 1) i ma ponad 60% zdrowia. W kręgu trzyma się środka: przyciąganie rośnie z sześcianem
  odległości od środka, ucieczka przed wrogami ma wagę 1,2 zamiast 5, bez zrywu. Uniki przed pociskami
  i telegrafowanymi atakami działają dalej. Wychodzi poniżej 40% zdrowia. Po otwarciu portalu i przy
  Leszym kręgi ignoruje. Dar wybiera według kolejności: obrażenia, szybkość ataku, kryt, obszar, zdrowie
  (pierwsze, gdy ma mniej niż połowę zdrowia), tarcza, regeneracja, szybkość. Bot ładuje średnio 1,7–1,9
  z 2 kręgów na run.
- `npm run sim` wypisuje średnie na run: przelosowania (w tym płatne), wygnania i naładowane kręgi
  (`Bot.tally`). Testy w `tests/overtime.test.ts`: wygnanie niechcianej księgi, brak wydatków bez złota,
  ochrona księgi do ewolucji, dwa płatne przelosowania słabej oferty, utrzymanie kręgu z wrogiem obok.

### Wyrównanie postaci

Strojone tylko modyfikatory i pasywki w `src/data/characters.ts`; globalne krzywe bez zmian. Wynik runu jest
dwubiegunowy: bot albo ginie przy bossie w 4.–6. minucie, albo wygrywa. Liczy się więc przeżycie wczesnej
gry, a nie siła późnej. Dlatego największy wpływ ma maks. zdrowie, a zmiany obrażeń prawie nic nie dają
(Radogost z −8% obrażeń wypadł nawet lepiej, w granicach szumu). Szum przy 64 runach to ok. ±6 pkt proc.,
a przy 128 ok. ±4, więc warianty sprawdzałem na 128 runach, a wybrane na trzech zestawach ziaren
(1000, 50000, 90000; razem 384 runy). Pomocniczy skrypt wariantów był tylko w scratchpadzie (nadpisuje
`mods`/`passive.perLevel` postaci i woła tę samą pętlę co `npm run sim`).

| postać | było | jest | dlaczego |
|---|---|---|---|
| Wojmir | bez zmian | | wzorzec |
| Dobrosława | +1 zdrowia/s, +25% zasięgu zbierania, −10 zdrowia; +0,03 zdr./s i +2% zasięgu / poz. | +1 zdrowia/s, −10 zdrowia; +0,03 zdr./s i +1% zasięgu / poz. | zmiany zdrowia (−15…−25) i regeneracji (0,6–1) dawały stale 39–46%, niemonotonicznie; siłą był zasięg zbierania (więcej doświadczenia) |
| Bogumił | +60 zdrowia, +2 pancerza, +15% obrażeń, −6% szybkości; +1,5 zdr. i +0,03 pancerza / poz. | +30 zdrowia, +1 pancerza, −8% szybkości, +8% czasu odnowienia; +1 zdr. i +0,01 pancerza / poz. | samo zdrowie, pancerz i obrażenia schodziły tylko do ok. 40%; ciupaga z dużym odrzutem chroni sama, dopiero wolniejszy zamach (cięższy młot) dał 32% |
| Jagna | bez zmian | | po zmianie bota 33% (wcześniej 20%) |
| Radogost | +15% złota | +15% złota, −45 zdrowia | kupiec, nie wojownik; −25 dawało 44%, −35 40%, −45 36% |
| Strzeżymir | Pęd: +0,5% obrażeń / poz. | Pęd: +0,2% obrażeń / poz. | wystarczyło (48% → 33%) |
| Mszczuj | +4% kradzieży życia, −15 zdrowia; +0,5% / poz. | +3% kradzieży życia, −30 zdrowia; +0,25% / poz. | −25 zdrowia dawało 37%, −30 z 0,3% / poz. 37%, wybrane 36% |

Wyniki (`npm run sim`, dobry bot, ziarna 1000+; „przed” to koniec etapu 7, „nowy bot” to bot z etapu 8
przy starych postaciach):

| 64 runy | przed | nowy bot | **po strojeniu** |
|---|---|---|---|
| Wojmir | 20 | 22 | **22** |
| Dobrosława | 27 | 21 | **27** |
| Bogumił | 41 | 35 | **19** |
| Jagna | 13 | 21 | **21** |
| Radogost | 28 | 30 | **23** |
| Strzeżymir | 24 | 31 | **22** |
| Mszczuj | 38 | 35 | **17** |
| Wojmir z poz. 4 | 60 | 58 | **58** |
| Dobrosława z poz. 4 | 61 | 63 | **61** |
| Bogumił z poz. 4 | 63 | 63 | **63** |
| Jagna z poz. 4 | 60 | 61 | **61** |
| Radogost z poz. 4 | 64 | 63 | **63** |
| Strzeżymir z poz. 4 | 63 | 61 | **55** |
| Mszczuj z poz. 4 | 64 | 64 | **62** |

Pewniejszy pomiar wybranych wartości:

| po strojeniu | 128 runów bez Chaty | 384 runy bez Chaty (3 zestawy ziaren) | 128 runów z poz. 4 |
|---|---|---|---|
| Wojmir | 45 (35%) | 135 (35%) | 122 (95%) |
| Dobrosława | 49 (38%) | 134 (35%) | 123 (96%) |
| Bogumił | 44 (34%) | 124 (32%) | 127 (99%) |
| Jagna | 42 (33%) | 121 (32%) | 121 (95%) |
| Radogost | 43 (34%) | 140 (36%) | 126 (98%) |
| Strzeżymir | 46 (36%) | 127 (33%) | 115 (90%) |
| Mszczuj | 42 (33%) | 137 (36%) | 124 (97%) |

Wszystkie postacie mają 32–36% bez Chaty (cel 25–40%) i 90–99% z poz. 4 (cel 85%+). Na 64 runach Dobrosława
ma 27/64 (42%), a Mszczuj 17/64 (27%), ale to szum: na 128 i 384 runach obie są w środku przedziału.
Wojmir ma 35% i 95%. To odrobinę więcej niż 31% z etapu 7, bo bot gra lepiej (kręgi, przelosowania).
Globalnej krzywej nie ruszałem: przesunęłaby wszystkich, a Strzeżymir z poz. 4 ma tylko 90% zapasu nad celem.
Początkujący (32 runy, Wojmir): 0/32, 2:32, bez zmian.

Kariera (`npm run sim -- career=12 careers=16`, Wojmir): pierwsza wygrana średnio w 2,8. runie (przed: 2,4).
Złoto wydane na przelosowania i wygnania nie trafia do Chaty, więc w runach 2–6 jest trochę mniej poziomów
ulepszeń (np. po 3. runie 30,9 zamiast 34,9). Od 9. runu wartości się wyrównują. Przy 4 karierach (domyślnie)
wychodziło 5,0 wobec 2,8, ale to był szum.

### Stare zapisy

Zapis sprzed commitu 452fecc (np. z 7104480) wczytuje się bez zmian i bez migracji danych. Konsultacja
z Codexem potwierdziła, że nie ma czego przemapować:

- pasywki nie były zapisywane: odblokowują je osiągnięcia, a księgi zachowały id dawnych pasywek
  (`pas`, `krzesiwo`, …, `pioro`, `zielnik`). „Pobożny wędrowiec” dalej daje Księgę Żar-ptaka, a zapisane
  zwycięstwo nad Leszym od razu otwiera też nową Księgę Czarnoboga;
- wszystkie stare id osiągnięć, ulepszeń Chaty i postaci istnieją; „Osełka” (`tempo`) dalej skraca czas
  odnowienia, choć Księga Krzesiwa daje teraz szybkość ataku (poziomów ksiąg zapis nie trzymał);
- brakujące pola (srebro, Skarbiec, Rózga) uzupełnia `sanitizeSave`.

Wersja zapisu zostaje 1 (`SAVE_VERSION`). Podbijemy ją przy pierwszej zmianie, która naprawdę przekształca
zapisane dane. Zmiana klucza zapisu bez odczytu starego wyglądałaby dla gracza jak utrata postępu. Jedyne,
co dochodzi, to **`grantFromTotals`** (`src/meta/progress.ts`, wywoływane przy starcie gry): dopisuje
osiągnięcia, które łączne statystyki zapisu już spełniają, a których w chwili zapisu nie było, np. Księgę
Dzika (5000 zabitych łącznie). Wcześniej gracz dostałby ją dopiero po następnym runie. Osiągnięć
wymagających szczegółów jednego runu nie przyznaje. Nagrodę w złocie wypłaca raz i nie dolicza jej do
`stats.gold`. Testy w `tests/save.test.ts` z przykładowym starym zapisem: wczytanie bez błędów (złoto,
Chata, osiągnięcia, statystyki, opcje, postać), odblokowane postacie i bronie, dawne pasywki jako księgi,
jednorazowe `grantFromTotals`, run na tym zapisie i ponowny odczyt w nowym formacie.

### Review Codexem

`codex exec review --uncommitted`: brak uwag do poprawienia. Codex sam uruchomił testy (171), typecheck
i build oraz sprawdził, że zbudowany pakiet odpowiada źródłom.
