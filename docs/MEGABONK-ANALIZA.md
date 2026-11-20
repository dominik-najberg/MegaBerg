# Reguły Megabonka i jak je przenieść do MegaBerga

Źródło: przewodniki na megabonk.org (postacie, buildy, poradnik dla początkujących, tier listy broni, tomów i przedmiotów, meta, build Sir Oofiego), wersja gry 1.0.69, odczyt 2026-11-20.
Przenosimy **mechaniki**. Nazwy, postacie i wygląd zostają nasze, słowiańskie.

**Stan (2026-11-20):** etapy 1–7 zrobione, szczegóły, liczby i odstępstwa od tego planu w `docs/DECISIONS.md`
(sekcje od „Nowe statystyki” do „Srebro, Skarbiec i Rózga wróżbity”). Najważniejsze odstępstwa: poziomy broni
to hybryda (ręczne poziomy 2–5 i linie statów do 15.), ewolucje zostały, istniejące postacie i bronie nie
wymagają zakupu za srebro.

## 1. Jak działa Megabonk (w skrócie)

**Trzy osobne tory rozwoju zamiast jednego:**

| Tor | Skąd | Co robi | Limit |
|---|---|---|---|
| Bronie | level-up | atakują; każdy poziom dodaje wylosowane linie statów (rzadkość = siła i liczba linii) | ok. 3–4 sloty; poziom broni bez niskiego sufitu (przedmiot „garnek" podnosi cap o +10) |
| Tomy | level-up | czysty stat na poziom, np. +7% szansy kryt., +1 pocisk, +10% rozmiaru | kilka slotów; poziomy do ~99 |
| Przedmioty | skrzynie, kapliczki | efekty specjalne: proc przy trafieniu, egzekucja, lifesteal, konwersje statów | bez limitu, stackują się |

**Staty, których u nas brak:** osobna szansa kryt. (Precision, ponad 100% → „overcrit"), obrażenia kryt., szybkość ataku, czas trwania, szybkość pocisków, odrzut, lifesteal (ponad 100% → pewne leczenie), ciernie, unik (malejące zwroty), tarcza odnawiająca się bez obrażeń, klątwa (trudność), mnożnik srebra.

**Klątwa (Cursed Tome):** +3,5% trudności na poziom: więcej, silniejszych i szybszych wrogów, ale więcej XP, złota i lepszy loot. Rdzeń najlepszych runów to pętla XP + Szczęście + Klątwa („Holy Trinity").

**Postacie (21):** każda ma pasywkę, która **rośnie z poziomem postaci w runie** (np. +1% kryt./lvl, +1,5% obrażeń/lvl, +2 HP/lvl, +1% lifesteal/lvl, darmowa skrzynia co X sekund, obrażenia rosną z noszonym złotem, obrażenia rosną z prędkością ruchu), własną broń startową i **warunek odblokowania związany ze stylem gry** (zabij 1000 szkieletów, wbij Damage Tome na 7, przejdź Las tier 1, uwolnij z klatki złotym kluczem), a potem zakup.

**Bieg:** etap ma 10 minut przygotowania. Portal bossa pojawia się w losowym miejscu i gracz sam decyduje, kiedy go aktywować. Po czasie przychodzi nadgodzina i „Final Swarm". Mapy mają tiery (Las 1–3, Pustynia 1–2), a tier ma kilka etapów.

**Kapliczki:** ładowania (stoisz w kręgu, dostajesz nagrodę), ssania XP, chciwości (ryzyko za nagrodę), Moai (darmowy przedmiot).

**Ekonomia:** złoto w runie (skrzynie, rerolle), srebro jako waluta meta. Reroll i banish przy kartach. „Toggler" wyłącza niechciane przedmioty z puli.

## 2. Co MegaBerg już ma

| Mechanika | MegaBerg | Megabonk |
|---|---|---|
| Sloty | 6 broni + 6 pasywek | ~3–4 bronie + tomy + nielimitowane przedmioty |
| Poziomy broni | 5 stałych, ręcznie pisanych + ewolucja | wylosowane linie statów, poziom praktycznie bez sufitu |
| Rzadkość | jest (60/27/10/3, szczęście ją podbija) | jest, podobnie |
| Kryt | wynika ze szczęścia, ×2 | osobny stat, osobne obrażenia, overcrit |
| Postacie | 4, tylko płaskie modyfikatory | 21, pasywki rosnące z poziomem |
| Skrzynie | ulepszenie posiadanej rzeczy lub ewolucja | przedmiot z efektem |
| Kapliczki | błogosławieństwo boga (4 do wyboru) | kilka typów, w tym ładowanie w kręgu |
| Boss | przychodzi sam o 10:00 | portal, gracz wybiera moment |
| Trudność | stała krzywa | klątwa jako wybór gracza |
| Reroll / banish / skip | reroll tylko ze sklepu | reroll i banish w runie |
| Meta | złoto → Chata, 13 osiągnięć | srebro, wyzwania, odblokowania „graniem" |

Rzeczy, które już pasują i zostają: rzadkość ze szczęściem, magnes, skrzynie z rosnącą ceną, minibossy dropiące skrzynie, tryb nieskończony.

## 3. Proponowany plan (kolejność ma znaczenie)

### Etap 1. Nowe staty
`src/data/types.ts` (BASE_STATS), `src/sim/stats.ts`, trafienie w `src/sim/weapons.ts`, obrażenia gracza w `src/sim/world.ts`.
Dodać: `critChance`, `critDamage`, `attackSpeed` (osobno od cooldownu albo jako jego zamiennik), `duration`, `projectileSpeed`, `knockback`, `lifesteal`, `thorns`, `evasion`, `shield`, `curse`, `silverGain`. Kryt przestaje wynikać ze szczęścia.
Bez tego dalsze etapy nie mają czego skalować.

### Etap 2. Księgi zamiast pasywek
Pasywki z `src/data/passives.ts` stają się „Księgami" (zielnik, pas, podkowa…): czysty stat na poziom, wysoki sufit poziomów (np. 20 lub 99), slotów np. 4–5.
Nowe księgi: Kryt („Oko Swarożyca"), Klątwa, Lifesteal, Ciernie, Unik, Tarcza, Czas trwania, Szybkość pocisków.
Do ustalenia: co z parowaniem pasywka → ewolucja broni. Najprościej zostawić: ewolucja wymaga broni na danym poziomie i danej księgi.

### Etap 3. Poziomy broni z losowanymi liniami statów
Zamiast 4 ręcznie pisanych poziomów: karta broni ma 1–3 linie (obrażenia, ilość, rozmiar, cooldown, czas trwania, przebicie…), liczba i siła linii zależy od rzadkości. Mniej slotów broni (3–4). Cap poziomu wyższy niż 5.
To największa zmiana balansu: trzeba przepuścić bota (`npm run sim`) i poprawić krzywe w `src/data/waves.ts`.

### Etap 4. Przedmioty ze skrzyń
Skrzynia daje **przedmiot**, nie ulepszenie. Przedmioty bez limitu, stackują się, mają rzadkość. Pierwsza pula ok. 15 sztuk, np.:
- proc pioruna przy trafieniu (szansa + ogłuszenie),
- egzekucja zwykłych wrogów z trwałym bonusem do obrażeń,
- mnożnik obrażeń przy staniu w miejscu,
- konwersja prędkości ruchu na szybkość ataku,
- złoto za przebyty dystans,
- +HP z lifestealem i nadleczeniem,
- trwały +% obrażeń za zabójstwo (z sufitem),
- dodatkowa linia statów na każdej karcie broni,
- podniesienie capu poziomu broni.

### Etap 5. Postacie z pasywką na poziom
`src/data/characters.ts` dostaje pole `perLevel` i hak w `world.ts` przy awansie. Propozycje dla obecnych:
- Wojmir: +1% obrażeń/lvl.
- Dobrosława: +1% regeneracji i +2% zasięgu zbierania/lvl.
- Bogumił: +1% pancerza i +2 HP/lvl.
- Jagna: +1% szansy kryt./lvl.
Nowi bohaterowie z pasywkami w duchu Megabonka (lifesteal, złoto → obrażenia, prędkość → obrażenia, darmowa skrzynia co X s, klątwa na poziom), każdy z własną bronią startową i warunkiem „zagraj w danym stylu".

### Etap 6. Bieg, kapliczki, klątwa
- Portal Leszego: po 10:00 nie przychodzi sam; gracz idzie do portalu w losowym miejscu. Po przekroczeniu limitu nadgodzina i fala końcowa.
- Nowe kapliczki: ładowania (stój w kręgu N sekund pod presją), chciwości (+klątwa za nagrodę), ssania XP. Obecne boże błogosławieństwa zostają jako osobny typ.
- Reroll i banish dostępne w runie za złoto.

### Etap 7. Meta
- Druga waluta (np. srebrne grosze) na stałe odblokowania; złoto zostaje w runie.
- Warunki odblokowań przez styl gry („zabij 2000 wrogów ciupagą", „wbij księgę kryt. na 10").
- Toggler w Chacie do wyłączania przedmiotów z puli.

## 4. Ryzyka i decyzje

- Etapy 2–4 razem przewracają cały balans. Każdy etap kończyć przebiegiem bota i zapisem w `docs/DECISIONS.md`.
- Ewolucje to nasza mechanika, której Megabonk nie ma. Warto ją zostawić jako wyróżnik.
- Strona nie podaje liczby kart przy awansie ani dokładnej liczby slotów. Zostawiamy nasze 3 karty, sloty broni ustalamy testami (3 lub 4).
- Część liczb z megabonk.org pochodzi ze starszych wersji gry (strona meta z 1.0.12). Traktować je jako inspirację, nie specyfikację.
