# MegaBerg: Słowiańskie Bory (autonomous overnight build)

Pracujesz SAMODZIELNIE przez całą noc. Użytkownik śpi i nie odpowie na żadne pytanie
aż do rana. Rano ma zastać **gotową, grywalną, dopracowaną grę**, którą uruchomi jedną komendą.

## Zasady pracy autonomicznej (najważniejsze)

- **Nie zadawaj pytań i nie czekaj na zatwierdzenie.** Każdą niejasność rozstrzygnij sam,
  rozsądnie, i zapisz w `docs/DECISIONS.md` (decyzja + krótki powód).
- **Nie używaj trybu planowania wymagającego akceptacji.** Plan zapisz w `docs/PLAN.md`
  i od razu realizuj.
- **Nie kończ pracy, dopóki wszystkie kamienie milowe poniżej nie są zrobione i zweryfikowane.**
  Jeśli coś się nie udaje po kilku próbach, uprość to rozwiązanie, zanotuj w `docs/DECISIONS.md`
  i idź dalej. Nie zostawiaj gry w stanie zepsutym.
- **Weryfikuj w przeglądarce po każdym kamieniu milowym.** Uruchom dev server przez
  `preview_start` (konfiguracja `.claude/launch.json`, nazwa `megaberg`), otwórz grę we
  wbudowanej przeglądarce, zagraj (sterowanie klawiszami), zrób zrzut ekranu, sprawdź konsolę
  (zero błędów). Zrzuty zapisuj w `docs/screenshots/NN-nazwa.png`.
- **Git lokalnie:** `git init` w tym katalogu (jeśli jeszcze nie ma repo), commit po każdym
  kamieniu milowym z czytelnym opisem. **Nie pushuj nigdzie, nie twórz zdalnego repo.**
- Nie instaluj nic globalnie w systemie ani przez `sudo`. Tylko zależności npm w projekcie.
- Bez zewnętrznych assetów pobieranych z internetu: grafika i dźwięk generowane w kodzie.
- Pracuj w tym katalogu: `/home/potworny/PhpstormProjects/MegaBerg`.

## Gra

**MegaBerg: Słowiańskie Bory**: oryginalna gra 3D z gatunku „survivors-like” (roguelite
z automatycznym atakiem). Inspiracja zasadami gatunku (Vampire Survivors, Megabonk), ale
**nie kopia**: żadnych nazw, postaci, przedmiotów, map ani grafik z istniejących gier.
Cały świat opiera się na słowiańskim folklorze. **Język interfejsu: polski.**

Referencja stylu: `concepts/02-slowianskie-bory.png` (obejrzyj ją na starcie). Ciemny las
o zmierzchu, fioletowo-pomarańczowe niebo, mgła, ogniska, drewniane kapliczki z haftowanymi
ręcznikami, paprocie, konwalie. Bohater w lnianej koszuli z czerwonym haftem i pasem.
Stylizowany **low-poly z flat shadingiem**, czytelne sylwetki, ciepłe światła ognisk
kontra zimna mgła.

### Stack

- **Three.js + TypeScript (strict) + Vite**, Vitest do testów logiki.
- Bez silnika fizyki: własne proste kolizje (kapsuły/sfery + teren z heightmapy).
- Architektura: prosty ECS albo czytelne systemy, **fixed timestep** (np. 60 Hz) z interpolacją
  renderu, stany gry (menu → gra → pauza/level-up → koniec).
- **Data-driven:** bronie, ulepszenia, przeciwnicy, postacie, fale w plikach `src/data/*.ts`,
  tak żeby dodanie nowej broni było dopisaniem jednego obiektu.
- Wydajność: **300+ przeciwników przy stabilnych 60 FPS** na zwykłym laptopie
  (InstancedMesh, object pooling, spatial hash do kolizji i targetowania, brak alokacji w pętli).

### Rdzeń rozgrywki

- Kamera trzeciej osoby za i nad bohaterem, obrót myszą (pointer lock), **WASD**, **spacja: skok**
  (z podwójnym skokiem jako ulepszeniem), **shift: ślizg/zryw** z krótkim cooldownem.
  Ruch ma być płynny i przyjemny: przyspieszenie, lekka inercja, coyote time przy skoku.
- **Bronie atakują automatycznie.** Gracz tylko się porusza i wybiera ulepszenia.
- Mapa: duża polana w borze (pagórki, drzewa i głazy jako przeszkody, bagienne kałuże spowalniające,
  ogniska, kapliczki). Granica mapy ładnie zamaskowana (gęsty las + mgła).
- Przeciwnicy nadchodzą falami według minutnika rundy (**10 minut**). Co ok. 2–3 minuty
  mini-boss, w 10. minucie boss. Pokonanie bossa = zwycięstwo.
- Z przeciwników wypadają **bursztyny (XP)**; zasięg zbierania jako statystyka. Level-up = pauza
  i wybór **1 z 3** losowych kart (nowa broń, poziom broni, pasywka), z rzadkością kart
  (zwykła/rzadka/epicka/legendarna, kolory ramek). Maks. 6 broni i 6 pasywek.
- **Skrzynie** na mapie (otwierane za złote monety, które wypadają rzadziej) dają losowy przedmiot.
- **Kapliczki**: podejdź i przytrzymaj E, żeby wybrać jedno z błogosławieństw bogów
  (Perun: obrażenia, Swaróg: ogień, Weles: szczęście/złoto, Mokosz: leczenie).
- Leczenie: rzadko wypadający chleb ze smalcem / miód.
- HUD: pasek XP, poziom, minutnik, HP, ikony broni i pasywek z poziomami, licznik zabójstw i złota.
  Liczby obrażeń nad przeciwnikami (z opcją wyłączenia).

### Treść (minimum; dodaj więcej, jeśli zostanie czas)

**Bronie (min. 8, każda z 5 poziomami):**
1. Złote sierpy: krążą wokół bohatera.
2. Ogień Swarożyca: kule ognia lecące do najbliższego wroga.
3. Grom Peruna: piorun uderza w losowych wrogów w zasięgu.
4. Ciupaga: szeroki zamach przed bohaterem.
5. Wianek z ziół: obszar wokół gracza zadający obrażenia w czasie.
6. Proca z krzemieniami: odbijające się pociski.
7. Kruki Welesa: przyzwane kruki atakujące wrogów.
8. Lodowy oddech Marzanny: stożek spowalniający i zadający obrażenia.

Każda broń po maks. poziomie + odpowiednia pasywka może **ewoluować** (min. 3 ewolucje,
np. Sierpy + Pas siłacza → Żniwa Mokoszy).

**Pasywki (min. 8):** obrażenia, szybkość ataku, zasięg obszaru, szybkość ruchu, maks. HP,
regeneracja, zasięg zbierania, szczęście, pancerz, liczba pocisków.

**Przeciwnicy (min. 8 + 2 mini-bossy + boss):** utopce (wolne, wytrzymałe, z bagien),
chochliki w drewnianych maskach (szybkie, słabe), kruki (latające), błędne ogniki (kamikaze),
strzygi (skaczą na gracza), wilkołaki (szarża), bies (rzuca pociskami), licho (teleportuje się).
Mini-bossy: Baba Jaga w moździerzu, Południca z kosą. **Boss: Leszy, ogromny strażnik
lasu z porożem** (kilka faz, ataki obszarowe z czytelnym ostrzeżeniem na ziemi).
Wrogowie skalują się z czasem; elitarni wrogowie świecą i dają skrzynię.

**Postacie (min. 3 grywalne, odblokowywane):** Wojmir (zbalansowany, start: sierpy),
Zielarka Dobrosława (start: wianek, więcej regeneracji), Kowal Bogumił (start: ciupaga,
więcej HP, wolniejszy). Każda z inną bronią startową i bonusem pasywnym.

### Meta-progresja

- Złoto zbierane w runach przechodzi do sklepu między runami („Chata”): stałe ulepszenia statystyk.
- Odblokowywanie postaci i broni przez osiągnięcia (np. „Przetrwaj 5 minut”, „Pokonaj Leszego”).
- Zapis w `localStorage` (z obsługą błędów), przycisk resetu postępu w opcjach.

### Oprawa

- Menu główne z nazwą gry, wybór postaci, Chata (sklep), opcje (głośność, czułość myszy,
  liczby obrażeń on/off, jakość grafiki), ekran pauzy (Esc), ekran końca runu ze statystykami
  (czas, zabójstwa, poziom, obrażenia na broń).
- **Juice:** trafienia z białym błyskiem, knockback, cząsteczki, lekki screen shake, hitstop
  przy bossie, animacje proceduralne (bujanie, przysiad przed skokiem), światła ognisk z migotaniem,
  mgła, świetliki, dzień przechodzi w noc w trakcie runu.
- **Dźwięk:** proceduralne efekty przez Web Audio (trafienie, zebranie XP z rosnącą wysokością,
  level-up, piorun, śmierć) i prosta, nastrojowa pętla muzyczna generowana w kodzie (np. dron + motyw
  w skali dorycznej). Muzyka startuje po pierwszej interakcji użytkownika.
- Balans: pierwszy run ma być do przegrania przez nowicjusza, ale po kilku ulepszeniach z Chaty
  do wygrania. Zrób własny playtest (graj w przeglądarce) i stroj wartości w plikach danych.

## Kamienie milowe (realizuj po kolei, każdy kończy się weryfikacją w przeglądarce + commitem)

1. **Szkielet:** Vite + TS + Three.js, pętla gry z fixed timestep, teren, bohater, kamera,
   sterowanie (ruch, skok, ślizg), `.claude/launch.json` działa.
2. **Walka:** jeden przeciwnik, jedna broń, obrażenia, śmierć wroga, bursztyny XP, level-up
   z wyborem 3 kart, HUD, śmierć gracza i restart.
3. **Skala:** spawner fal według minutnika, InstancedMesh + pooling + spatial hash; test
   z 500 wrogami, pomiar FPS (zanotuj wynik w `docs/PERF.md`).
4. **Treść:** wszystkie bronie, pasywki, ewolucje, przeciwnicy, mini-bossy, boss Leszy,
   skrzynie, kapliczki, leczenie.
5. **Meta i menu:** menu, postacie, Chata, osiągnięcia, zapis, opcje, pauza, ekran końca.
6. **Oprawa:** grafika zgodna z koncept-artem, oświetlenie, cząsteczki, juice, dźwięk i muzyka.
7. **Balans i dopracowanie:** pełne runy w przeglądarce, strojenie, poprawki błędów,
   testy Vitest dla logiki (obrażenia, skalowanie, losowanie kart z rzadkością, ewolucje,
   zapis/odczyt), `npm run build` bez błędów i ostrzeżeń TS.
8. **Review:** uruchom `codex exec review --uncommitted` (albo na ostatnich commitach), oceń
   uwagi samodzielnie, popraw te zasadne, zapisz co przyjąłeś/odrzuciłeś w `docs/DECISIONS.md`.

Jeśli wszystko gotowe, a jest jeszcze czas: więcej broni i wrogów, druga mapa (np. „Bagna
Topielców” z własnym bossem), tryb nieskończony po pokonaniu Leszego.

## Na koniec (obowiązkowo)

- `README.md` po polsku: jak uruchomić (`npm install`, `npm run dev`, `npm run build && npm run preview`),
  sterowanie, opis mechanik, lista treści, struktura kodu, jak dodać nową broń/wroga.
- `docs/REPORT.md` dla użytkownika na rano: co zrobione, zrzuty ekranu z `docs/screenshots/`,
  znane problemy, co bym zrobił dalej, wynik testów i pomiar FPS.
- Zostaw grę zbudowaną (`dist/`) i ostatni commit z działającą wersją.
