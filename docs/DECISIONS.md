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
