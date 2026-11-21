# Wydajność

Pomiar: `node scripts/verify/m3.mjs egl 300,500,700` (bezgłowy Chrome, 1920×1080, jakość „Wysoka”,
cienie 2048, bot gra, sześć broni naraz, spawner utrzymuje zadaną liczbę żywych wrogów,
`gl.finish()` po każdej klatce, więc czas klatki zawiera pracę GPU; bez ogranicznika klatek).

Sprzęt: laptop, **zintegrowany AMD Radeon 860M** (ANGLE / OpenGL ES 3.2). Pomiar z 10 s po 6 s rozgrzewki.

Stan po nocnej sesji graficznej (większa mapa, tekstury, modele z Blendera, postprocessing):

| Żywi wrogowie | FPS (bez limitu) | Symulacja / krok | CPU + GPU / klatkę | Najgorsza klatka |
|---:|---:|---:|---:|---:|
| 300 | 103 | 0,27 ms | 9,0 ms | 122 ms |
| 500 | 121 | 0,31 ms | 7,7 ms | 244 ms |
| 700 | 103 | 0,42 ms | 8,9 ms | 135 ms |

Wymaganie „300+ wrogów przy stabilnych 60 FPS” jest nadal spełnione, z zapasem około 2× zamiast
dawnych 8×: klatka kosztuje 8–9 ms z budżetu 16,7 ms. Liczba wrogów prawie nie wpływa na wynik, bo
koszt przeniósł się na wypełnianie pikseli (HDR, MSAA, bloom). Rozrzut między przebiegami to kilkanaście
procent (bot stoi w innym miejscu lasu). „Najgorsze klatki” to kompilacja shaderów przy pierwszym
pojawieniu się nowego efektu; jest ich teraz więcej niż przed sesją (wtedy 29–52 ms).

Przed sesją (dla porównania): 562 / 482 / 462 FPS przy 300 / 500 / 700 wrogach, 1,6–1,9 ms na klatkę.

## Koszt poziomów jakości

`node scripts/verify/perf.mjs 500 1` (500 wrogów, 1920×1080):

| Ustawienie | FPS | ms / klatkę |
|---|---:|---:|
| Wysoka | 110 | 8,2 |
| Wysoka bez bloomu | 141 | 6,6 |
| Wysoka bez cieni | 120 | 7,9 |
| Średnia | 161 | 5,6 |
| Niska | 276 | 3,3 |

Ekran HiDPI (1920×1080 CSS przy `devicePixelRatio` 2, czyli 4K): jakość wysoka dawała 44 FPS, bo
potok postprocessingu jest ograniczony wypełnianiem pikseli. Po wprowadzeniu budżetu pikseli
(patrz niżej) to samo ustawienie daje ok. 80 FPS.

## Skąd ta wydajność

- **InstancedMesh na typ wroga**: 11 wywołań rysowania niezależnie od liczby wrogów; macierze zapisywane
  bezpośrednio do bufora instancji, do GPU trafia tylko używany zakres (`addUpdateRange`).
- **Animacja kończyn i skrzydeł w vertex shaderze** (atrybut `aAnim`), bez kości i bez pracy CPU.
- **Pule SoA** (`Float32Array`) dla wrogów, pocisków, bursztynów, stref i zagrożeń: zero alokacji w pętli gry.
- **Siatka przestrzenna** przebudowywana co krok sortowaniem przez zliczanie: celowanie, trafienia
  i rozpychanie wrogów pytają tylko sąsiednie komórki.
- **Scenografia w kafelkach 44 m**: jeden InstancedMesh na model i kafelek z własną sferą otaczającą,
  więc bryła widzenia odcina większość lasu. Do ok. 92 m pełne modele z cieniami, dalej uproszczone
  (150–250 trójkątów na drzewo), powyżej 235 m nic; trawa, paprocie i grzyby tylko do 78 m.
- **Budżet pikseli**: rozdzielczość wewnętrzna to `devicePixelRatio` ograniczone poziomem jakości
  i liczbą pikseli (wysoka 3,2 mln, średnia 2,3 mln, niska 2,1 mln przy ×1).
- **Bloom w połowie rozdzielczości**, MSAA ×4 na wysokiej i ×2 na średniej, jeden końcowy przebieg
  (mapowanie tonów, gradacja, winieta, ziarno).
- **Pula 4 świateł punktowych** przenoszonych do najbliższych ognisk i kapliczek: stały koszt shaderów
  niezależnie od liczby źródeł ognia na mapie.
- **Cząsteczki** w jednym `Points` na system (addytywny i „kurz”), **liczby obrażeń** na osobnym canvasie 2D.
- Zdarzenia symulacji w buforze o stałym rozmiarze (bez tworzenia obiektów).

## Ustawienia jakości

| Jakość | Postprocessing | Cienie | Rozdzielczość | Roślinność | Cząsteczki |
|---|---|---|---|---|---|
| Niska | brak | wyłączone | ×1 | 35% | 50% |
| Średnia | bloom, gradacja, MSAA ×2 | 1024 | do ×1,5 (maks. 2,3 mln px) | 70% | 80% |
| Wysoka | bloom, gradacja, MSAA ×4 | 2048 | do ×2 (maks. 3,2 mln px) | 100% | 100% |

## Nowe typy broni (etapy B–D planu broni)

`MB_WEAPONS=<4 bronie> node scripts/verify/perf.mjs 500 1` (500 wrogów, 1920×1080, bronie na 5. poziomie),
jeden pomiar po 5 s na ustawienie, wszystkie trzy przebiegi tego samego dnia na tej samej maszynie:

| Zestaw | Wysoka | Średnia | Niska |
|---|---:|---:|---:|
| dotychczasowy (Ogień, Grom, Wianek, Proca, Ciupaga) | 86 FPS / 10,6 ms | 134 / 7,0 | 205 / 4,6 |
| Miotła, Wnyki, Wir, Studnia (strefy i wiry) | 92 / 9,9 | 113 / 8,1 | 172 / 5,4 |
| Rój, Krzywula, Wrzeciono, Kostki | 92 / 9,9 | 116 / 8,0 | 171 / 5,2 |

Na jakości wysokiej różnicy nie widać (rządzi postprocessing). Na średniej i niskiej nowe zestawy kosztują
ok. 0,7–1 ms na klatkę więcej; to pojedyncze pomiary z rozrzutem kilku–kilkunastu procent, więc traktuję to
jako górne oszacowanie, nie dokładną liczbę. Liczby bezwzględne są niższe niż w tabeli wyżej (110 / 161 / 276),
bo maszyna była w tym czasie obciążona innymi zadaniami.
