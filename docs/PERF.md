# Wydajność

Pomiar: `node scripts/verify/m3.mjs egl 300,500,700` (bezgłowy Chrome, 1920×1080, jakość „Wysoka”,
cienie 2048, bot gra, sześć broni naraz, spawner utrzymuje zadaną liczbę żywych wrogów,
`gl.finish()` po każdej klatce, więc czas klatki zawiera pracę GPU; bez ogranicznika klatek).

Sprzęt: laptop, **zintegrowany AMD Radeon 860M** (ANGLE / OpenGL ES 3.2). Pomiar z 10 s po 6 s rozgrzewki.

| Żywi wrogowie | FPS (bez limitu) | Symulacja / krok | CPU + GPU / klatkę | Najgorsza klatka |
|---:|---:|---:|---:|---:|
| 300 | 562 | 0,20 ms | 1,6 ms | 52 ms |
| 500 | 482 | 0,33 ms | 1,8 ms | 29 ms |
| 700 | 462 | 0,39 ms | 1,9 ms | 29 ms |

Wymaganie „300+ wrogów przy stabilnych 60 FPS” jest spełnione z zapasem około 8×: przy 500 wrogach
klatka zajmuje ~1,8 ms z budżetu 16,7 ms. Pojedyncze „najgorsze klatki” (29–52 ms) to kompilacja
shaderów przy pierwszym pojawieniu się nowego efektu, nie stały koszt.

Dla porównania RTX 5070 przez ANGLE/Vulkan w trybie headless dał 157 FPS przy 500 wrogach
(ścieżka headless Vulkan ma narzut na odczyt bufora; w zwykłym oknie wynik będzie wyższy).

## Skąd ta wydajność

- **InstancedMesh na typ wroga**: 11 wywołań rysowania niezależnie od liczby wrogów; macierze zapisywane
  bezpośrednio do bufora instancji, do GPU trafia tylko używany zakres (`addUpdateRange`).
- **Animacja kończyn i skrzydeł w vertex shaderze** (atrybut `aAnim`), bez kości i bez pracy CPU.
- **Pule SoA** (`Float32Array`) dla wrogów, pocisków, bursztynów, stref i zagrożeń: zero alokacji w pętli gry.
- **Siatka przestrzenna** przebudowywana co krok sortowaniem przez zliczanie: celowanie, trafienia
  i rozpychanie wrogów pytają tylko sąsiednie komórki.
- **Pula 4 świateł punktowych** przenoszonych do najbliższych ognisk i kapliczek: stały koszt shaderów
  niezależnie od liczby źródeł ognia na mapie.
- **Cząsteczki** w jednym `Points` na system (addytywny i „kurz”), **liczby obrażeń** na osobnym canvasie 2D.
- Zdarzenia symulacji w buforze o stałym rozmiarze (bez tworzenia obiektów).

## Ustawienia jakości

| Jakość | Cienie | Rozdzielczość | Roślinność | Cząsteczki |
|---|---|---|---|---|
| Niska | wyłączone | ×1 | 35% | 50% |
| Średnia | 1024 | do ×1,5 | 70% | 80% |
| Wysoka | 2048 | do ×2 | 100% | 100% |
