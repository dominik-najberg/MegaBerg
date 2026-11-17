# Plan realizacji: MegaBerg: Słowiańskie Bory

Plan zapisany na starcie i realizowany od razu (bez akceptacji, zgodnie z `PROMPT-fable.md`).

## Architektura

- `src/core/` – pętla o stałym kroku (60 Hz) z interpolacją, wejście, RNG z ziarnem, siatka przestrzenna, matematyka.
- `src/data/` – **cała treść gry jako dane**: bronie, pasywki, wrogowie, postacie, fale, sklep, osiągnięcia, błogosławieństwa.
- `src/sim/` – czysta symulacja (bez Three.js i DOM): świat, gracz, wrogowie (SoA + pooling), bronie, karty, spawner.
  Dzięki temu logikę da się testować w Vitest i rozgrywać całe runy „na sucho” botem (`npm run sim`) do strojenia balansu.
- `src/render/` – Three.js: niebo, teren, rekwizyty, bohater, wrogowie (InstancedMesh), efekty.
- `src/audio/` – Web Audio: efekty i muzyka generowane w kodzie.
- `src/ui/` – DOM: HUD, menu, karty, sklep, opcje.
- `src/meta/` – zapis w `localStorage`, osiągnięcia.
- `src/debug/` – bot grający (autopilot) używany w playtestach i pomiarze wydajności.

## Kamienie milowe

1. Szkielet: Vite + TS + Three.js, pętla, teren, bohater, kamera, sterowanie.
2. Walka: wróg, broń, obrażenia, bursztyny, level-up z kartami, HUD, śmierć i restart.
3. Skala: spawner fal, InstancedMesh + pooling + siatka przestrzenna, test 500 wrogów (`docs/PERF.md`).
4. Treść: wszystkie bronie, pasywki, ewolucje, wrogowie, mini-bossy, Leszy, skrzynie, kapliczki, leczenie.
5. Meta i menu: menu, postacie, Chata, osiągnięcia, zapis, opcje, pauza, ekran końca.
6. Oprawa: grafika wg koncept-artu, światła, cząsteczki, juice, dźwięk i muzyka.
7. Balans i dopracowanie: pełne runy, strojenie, testy Vitest, `npm run build` na czysto.
8. Review Codexem, poprawki, dokumentacja (`README.md`, `docs/REPORT.md`), `dist/`.

Każdy kamień kończy się weryfikacją w przeglądarce (zrzuty w `docs/screenshots/`) i commitem.
