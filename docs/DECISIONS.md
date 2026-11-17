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
