import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { SpatialGrid } from '../src/core/spatialGrid';
import { ENEMIES, ENEMY_INDEX } from '../src/data/enemies';
import { Bot } from '../src/debug/bot';
import { emptyInput, MOVE, MoveFx, Player, stepPlayer } from '../src/sim/player';
import { BASE_STATS } from '../src/data/types';
import { GameMap, PLAY_RADIUS } from '../src/sim/terrain';
import { BONUS_MAX, BONUS_MIN, GIFT_FIRST, MAGNET_FIRST } from '../src/sim/bonuses';
import { Ev } from '../src/sim/events';
import { PickupKind } from '../src/sim/pools';
import { BOSS_GOLD, CHEST_COST, COIN_CHANCE, COIN_EARLY_BONUS, COIN_EARLY_TIME, coinChance, World } from '../src/sim/world';

const map = new GameMap();
const DT = 1 / 60;

describe('siatka przestrzenna', () => {
  it('zwraca wszystkich sąsiadów w promieniu (zgodnie z przeszukaniem siłowym)', () => {
    const rng = new Rng(3);
    const n = 400;
    const alive = new Uint8Array(n).fill(1);
    const xs = new Float32Array(n);
    const zs = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = rng.range(-110, 110);
      zs[i] = rng.range(-110, 110);
    }
    alive[5] = 0;
    const grid = new SpatialGrid(120, 4, n);
    grid.build(n, alive, xs, zs);
    const out = new Int32Array(n);
    for (let q = 0; q < 50; q++) {
      const x = rng.range(-100, 100);
      const z = rng.range(-100, 100);
      const r = rng.range(1, 15);
      const got = new Set(Array.from(out.subarray(0, grid.query(x, z, r, out))));
      expect(got.has(5)).toBe(false);
      for (let i = 0; i < n; i++) {
        if (!alive[i]) continue;
        if (Math.hypot(xs[i]! - x, zs[i]! - z) <= r) expect(got.has(i)).toBe(true);
      }
    }
  });
});

describe('ruch bohatera', () => {
  const stats = { ...BASE_STATS };

  it('rozpędza się do prędkości maksymalnej i hamuje', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0);
    const inp = emptyInput();
    inp.moveZ = 1;
    for (let i = 0; i < 60; i++) stepPlayer(p, inp, stats, map, DT);
    expect(Math.hypot(p.vx, p.vz)).toBeCloseTo(MOVE.speed, 1);
    expect(p.z).toBeLessThan(-5);
    inp.moveZ = 0;
    for (let i = 0; i < 30; i++) stepPlayer(p, inp, stats, map, DT);
    expect(Math.hypot(p.vx, p.vz)).toBe(0);
  });

  it('skacze, ląduje i nie skacze drugi raz w powietrzu bez ulepszenia', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0);
    const inp = emptyInput();
    inp.jump = true;
    inp.jumpHeld = true;
    expect(stepPlayer(p, inp, stats, map, DT) & MoveFx.Jump).toBeTruthy();
    expect(p.onGround).toBe(false);
    inp.jump = false;
    for (let i = 0; i < 10; i++) stepPlayer(p, inp, stats, map, DT);
    const vy = p.vy;
    inp.jump = true;
    stepPlayer(p, inp, stats, map, DT);
    expect(p.vy).toBeLessThan(vy);
    inp.jump = false;
    let landed = false;
    for (let i = 0; i < 120 && !landed; i++) landed = (stepPlayer(p, inp, stats, map, DT) & MoveFx.Land) !== 0;
    expect(landed).toBe(true);
    expect(p.onGround).toBe(true);
  });

  it('podwójny skok działa z ulepszeniem, a bufor skoku zapamiętuje wciśnięcie tuż przed lądowaniem', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0);
    const inp = emptyInput();
    inp.jump = true;
    inp.jumpHeld = true;
    stepPlayer(p, inp, { ...stats, extraJumps: 1 }, map, DT);
    inp.jump = false;
    for (let i = 0; i < 20; i++) stepPlayer(p, inp, { ...stats, extraJumps: 1 }, map, DT);
    inp.jump = true;
    expect(stepPlayer(p, inp, { ...stats, extraJumps: 1 }, map, DT) & MoveFx.AirJump).toBeTruthy();
    expect(p.vy).toBeCloseTo(MOVE.airJumpV - MOVE.gravity * DT, 3);
    // bufor: wciśnięcie skoku 3 klatki przed lądowaniem i tak odpala skok
    inp.jump = false;
    let frames = 0;
    while (p.y - map.heightAt(p.x, p.z) > 0.45 && frames++ < 300) stepPlayer(p, inp, stats, map, DT);
    inp.jump = true;
    stepPlayer(p, inp, stats, map, DT);
    inp.jump = false;
    let jumped = false;
    for (let i = 0; i < 8 && !jumped; i++) jumped = (stepPlayer(p, inp, stats, map, DT) & MoveFx.Jump) !== 0;
    expect(jumped).toBe(true);
  });

  it('coyote time pozwala skoczyć chwilę po utracie gruntu', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0) + 0.5;
    p.onGround = true;
    const inp = emptyInput();
    stepPlayer(p, inp, stats, map, DT);
    expect(p.onGround).toBe(false);
    expect(p.coyote).toBeGreaterThan(0);
    inp.jump = true;
    expect(stepPlayer(p, inp, stats, map, DT) & MoveFx.Jump).toBeTruthy();
    expect(p.airJumps).toBe(0);
  });

  it('zryw daje krótką nietykalność i ma czas odnowienia', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0);
    const inp = emptyInput();
    inp.dash = true;
    inp.moveX = 1;
    expect(stepPlayer(p, inp, stats, map, DT) & MoveFx.Dash).toBeTruthy();
    expect(p.invuln).toBeGreaterThan(0);
    expect(Math.hypot(p.vx, p.vz)).toBeCloseTo(MOVE.dashSpeed, 1);
    expect(stepPlayer(p, inp, stats, map, DT) & MoveFx.Dash).toBeFalsy();
    inp.dash = false;
    for (let i = 0; i < 100; i++) stepPlayer(p, inp, stats, map, DT);
    inp.dash = true;
    expect(stepPlayer(p, inp, stats, map, DT) & MoveFx.Dash).toBeTruthy();
  });

  it('nie wychodzi poza polanę i nie wchodzi w przeszkody', () => {
    const p = new Player();
    p.y = map.heightAt(0, 0);
    const inp = emptyInput();
    inp.moveX = 1;
    for (let i = 0; i < 60 * 40; i++) stepPlayer(p, inp, stats, map, DT);
    expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(PLAY_RADIUS + 0.01);
    for (const o of map.obstacles) expect(Math.hypot(o.x - p.x, o.z - p.z)).toBeGreaterThanOrEqual(o.r + p.radius - 0.02);
  });
});

describe('mapa', () => {
  it('ma kapliczki, ogniska, kałuże i skrzynie', () => {
    expect(map.shrines.length).toBeGreaterThanOrEqual(4);
    expect(map.bonfires.length).toBeGreaterThanOrEqual(4);
    expect(map.puddles.length).toBeGreaterThanOrEqual(6);
    expect(map.chestSpots.length).toBeGreaterThanOrEqual(6);
    expect(map.obstacles.length).toBeGreaterThan(150);
  });

  it('środek polany jest wolny, a wysokość terenu ciągła', () => {
    expect(map.isFree(0, 0, 2)).toBe(true);
    for (let i = 0; i < 200; i++) {
      const x = -90 + i * 0.9;
      expect(Math.abs(map.heightAt(x, 3) - map.heightAt(x + 0.05, 3))).toBeLessThan(0.2);
    }
  });

  it('kałuże spowalniają', () => {
    const pd = map.puddles[0]!;
    expect(map.inPuddle(pd.x, pd.z)).toBe(true);
    expect(map.inPuddle(0, 0)).toBe(false);
  });
});

describe('symulacja runu', () => {
  it('jest deterministyczna dla tego samego ziarna', () => {
    const play = (): string => {
      const w = new World(map, { seed: 77 });
      const bot = new Bot('good');
      for (let i = 0; i < 60 * 45; i++) {
        if (w.choice) w.choose(bot.choose(w));
        else w.step(DT, bot.update(w, DT));
        w.events.clear();
      }
      return `${w.kills}|${w.level}|${w.player.x.toFixed(3)}|${w.player.hp.toFixed(2)}|${w.enemies.count}`;
    };
    expect(play()).toBe(play());
  });

  it('bot przeżywa pierwszą minutę, zabija wrogów i awansuje; brak NaN', () => {
    const w = new World(map, { seed: 31 });
    const bot = new Bot('good');
    let steps = 0;
    while (w.time < 75 && !w.dead && steps++ < 60 * 200) {
      if (w.choice) w.choose(bot.choose(w));
      else w.step(DT, bot.update(w, DT));
      w.events.clear();
    }
    expect(w.dead).toBe(false);
    expect(w.kills).toBeGreaterThan(40);
    expect(w.level).toBeGreaterThan(3);
    expect(Number.isFinite(w.player.x + w.player.y + w.player.z + w.player.hp)).toBe(true);
    for (let i = 0; i < w.enemies.n; i++) {
      if (w.enemies.alive[i]) expect(Number.isFinite(w.enemies.x[i]! + w.enemies.z[i]! + w.enemies.hp[i]!)).toBe(true);
    }
  });

  it('awans otwiera wybór 3 kart i wstrzymuje symulację do decyzji', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.gainXp(1000);
    expect(w.pendingLevels).toBeGreaterThan(1);
    const pending = w.pendingLevels;
    w.step(DT, emptyInput());
    expect(w.choice?.type).toBe('levelup');
    const t = w.time;
    w.step(DT, emptyInput());
    expect(w.time).toBe(t);
    w.choose(0);
    // kolejne zaległe awanse otwierają się jeden po drugim
    expect(w.choice?.type).toBe('levelup');
    expect(w.pendingLevels).toBe(pending - 2);
  });

  it('pokonanie Leszego kończy run zwycięstwem', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const i = w.spawnEnemy(ENEMY_INDEX.leszy as number, 20, 0);
    expect(w.bossIdx).toBe(i);
    expect(ENEMIES[w.enemies.type[i]!]!.rank).toBe('boss');
    w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
    expect(w.won).toBe(true);
    expect(w.bossIdx).toBe(-1);
    expect(w.paused).toBe(true);
    w.startEndless();
    expect(w.paused).toBe(false);
  });

  it('zwycięstwo od razu wypłaca nagrodę za bossa i zbiera leżące monety', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.pickups.spawn(0, 40, 0, 40, 7);
    const i = w.spawnEnemy(ENEMY_INDEX.leszy as number, 20, 0);
    w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
    expect(w.won).toBe(true);
    expect(w.gold).toBe(BOSS_GOLD + 7);
    expect(w.summary().gold).toBe(BOSS_GOLD + 7);
    expect(w.pickups.list.count).toBe(0);
  });

  it('tryb nieskończony zeruje liczniki sumowane między runami, ale nie postęp kapliczek', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.shrinesUsed = 2;
    w.evolved = 1;
    w.kills = 500;
    const i = w.spawnEnemy(ENEMY_INDEX.leszy as number, 20, 0);
    w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
    w.startEndless();
    expect(w.won).toBe(false);
    expect(w.endless).toBe(true);
    expect(w.gold).toBe(0);
    expect(w.kills).toBe(0);
    expect(w.shrinesUsed).toBe(2);
    expect(w.evolved).toBe(1);
    expect(w.summary().endless).toBe(true);
    // kolejny Leszy w trybie nieskończonym zostawia monety zamiast kończyć run
    const j = w.spawnEnemy(ENEMY_INDEX.leszy as number, 20, 0);
    w.damageEnemy(j, 1e9, -1, 0, 0, 0, null);
    expect(w.won).toBe(false);
    expect(w.pickups.list.count).toBe(30);
  });

  it('pasek bossa wraca do żyjącego bossa, gdy ginie inny', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const leszy = w.spawnEnemy(ENEMY_INDEX.leszy as number, 20, 0);
    expect(w.bossIdx).toBe(leszy);
    const jaga = w.spawnEnemy(ENEMY_INDEX.jaga as number, -20, 0);
    // mini-boss nie przejmuje paska, gdy żyje Leszy
    expect(w.bossIdx).toBe(leszy);
    w.damageEnemy(jaga, 1e9, -1, 0, 0, 0, null);
    expect(w.bossIdx).toBe(leszy);
    const a = w.spawnEnemy(ENEMY_INDEX.jaga as number, -20, 0);
    const b = w.spawnEnemy(ENEMY_INDEX.poludnica as number, -25, 5);
    w.endless = true;
    w.damageEnemy(leszy, 1e9, -1, 0, 0, 0, null);
    expect([a, b]).toContain(w.bossIdx);
    w.damageEnemy(w.bossIdx, 1e9, -1, 0, 0, 0, null);
    expect([a, b]).toContain(w.bossIdx);
    w.damageEnemy(w.bossIdx, 1e9, -1, 0, 0, 0, null);
    expect(w.bossIdx).toBe(-1);
  });

  it('dwa Leszy w różnych fazach nie wywołują przejścia fazy co krok', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.stats.maxHp = 1e9;
    w.player.hp = 1e9;
    const a = w.spawnEnemy(ENEMY_INDEX.leszy as number, 40, 0);
    const b = w.spawnEnemy(ENEMY_INDEX.leszy as number, -40, 0);
    w.enemies.hp[a] = (w.enemies.maxHp[a] as number) * 0.5;
    const inp = emptyInput();
    for (let i = 0; i < 120; i++) w.step(DT, inp);
    // jedno przejście do fazy 2 = jedno przywołanie 6 pomocników, nie lawina
    expect(w.enemies.phase[a]).toBe(2);
    expect(w.enemies.phase[b]).toBe(1);
    expect(w.enemies.count).toBeLessThanOrEqual(2 + 6);
  });

  it('każdy bóg błogosławi najwyżej dwa razy', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const inp = emptyInput();
    inp.interact = true;
    const picked: string[] = [];
    for (let k = 0; k < w.shrines.length; k++) {
      const s = w.shrines[k]!;
      w.player.x = s.x + 1.5;
      w.player.z = s.z + 1.5;
      for (let i = 0; i < 90 && !w.choice; i++) w.step(DT, inp);
      expect(w.choice?.type).toBe('shrine');
      if (w.choice?.type === 'shrine') picked.push(w.choice.options[0]!.id);
      w.choose(0);
      expect(s.used).toBe(true);
    }
    expect(w.shrinesUsed).toBe(w.shrines.length);
    const perun = picked.filter((id) => id === 'perun').length;
    expect(perun).toBe(2);
  });

  it('na początku runu monety wypadają częściej, potem szansa wraca do bazowej', () => {
    expect(coinChance(0)).toBeCloseTo(COIN_CHANCE + COIN_EARLY_BONUS);
    expect(coinChance(COIN_EARLY_TIME / 2)).toBeCloseTo(COIN_CHANCE + COIN_EARLY_BONUS / 2);
    expect(coinChance(COIN_EARLY_TIME)).toBeCloseTo(COIN_CHANCE);
    expect(coinChance(COIN_EARLY_TIME * 3)).toBeCloseTo(COIN_CHANCE);
  });

  it('pierwsza minuta gry daje dość złota na pierwszą skrzynię i początkujący ją kupuje', () => {
    // prawdziwa minuta runu: fale ze spawnera, początkujący bot zbiera monety i podchodzi do skrzyń
    let bought = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const w = new World(map, { seed });
      const bot = new Bot('novice');
      while (w.time < 60 && !w.dead) {
        if (w.choice) {
          w.choose(bot.choose(w));
          continue;
        }
        w.step(DT, bot.update(w, DT));
        w.events.clear();
      }
      expect(w.dead).toBe(false);
      expect(w.goldCollected).toBeGreaterThanOrEqual(CHEST_COST);
      if (w.paidChests > 0) bought++;
    }
    expect(bought).toBeGreaterThanOrEqual(6);
  });

  it('elita zawsze zostawia darmową skrzynię i sakiewkę monet', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.time = COIN_EARLY_TIME * 2;
    const chests = w.chests.length;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 30, 0, true);
    w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
    expect(w.chests.length).toBe(chests + 1);
    expect(w.chests[chests]!.free).toBe(true);
    const k = w.pickups;
    let coins = 0;
    for (let c = 0; c < k.n; c++) if (k.alive[c] && k.kind[c] === PickupKind.Coin) coins += k.val[c] as number;
    expect(coins).toBeGreaterThanOrEqual(10);
  });

  it('podpowiedź o skrzyni pojawia się raz, gdy starcza złota na pierwszą', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const hints = (): number => w.announce.filter((t) => t.includes('skrzyni')).length;
    w.addGold(CHEST_COST - 1);
    expect(hints()).toBe(0);
    w.addGold(1);
    expect(hints()).toBe(1);
    w.addGold(50);
    expect(hints()).toBe(1);
  });

  it('pierwsze skrzynie są tanie, a cena rośnie z każdą kupioną', () => {
    const w = new World(map, { seed: 4 });
    expect(w.chestCost()).toBe(CHEST_COST);
    const costs: number[] = [];
    for (let k = 0; k < 6; k++) {
      costs.push(w.chestCost());
      w.paidChests++;
    }
    // trzy skrzynie przy starcie kosztują razem mniej niż najtańsze ulepszenia w Chacie na dwa runy
    expect((costs[0] as number) + (costs[1] as number) + (costs[2] as number)).toBeLessThanOrEqual(60);
    for (let k = 1; k < costs.length; k++) expect(costs[k] as number).toBeGreaterThan(costs[k - 1] as number);
    expect(costs[5] as number).toBeGreaterThan(150);
  });

  it('płatna skrzynia pobiera złoto, a kolejna jest droższa', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const c = w.chests[0]!;
    w.player.x = c.x + 1;
    w.player.z = c.z;
    const inp = emptyInput();
    inp.interact = true;
    for (let i = 0; i < 60; i++) w.step(DT, inp);
    expect(c.opened).toBe(false);
    const cost = w.chestCost();
    w.gold = cost + 5;
    for (let i = 0; i < 60 && !w.choice; i++) w.step(DT, inp);
    expect(c.opened).toBe(true);
    expect(w.choice?.type).toBe('chest');
    expect(w.gold).toBe(5);
    expect(w.chestCost()).toBeGreaterThan(cost);
  });
});

describe('dary boru: magnes i darmowa skrzynia', () => {
  /** Rozgrywa `seconds` sekund bez wrogów; bohater stoi w miejscu. */
  const idle = (w: World, seconds: number): void => {
    const inp = emptyInput();
    for (let i = 0; i < seconds * 60 && !w.choice; i++) {
      w.step(DT, inp);
      w.events.clear();
    }
  };
  const magnets = (w: World): number[] => {
    const out: number[] = [];
    const k = w.pickups;
    for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === PickupKind.Magnet) out.push(i);
    return out;
  };

  it('magnes pojawia się sam w wyznaczonym oknie czasu, blisko bohatera i na wolnym miejscu', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const w = new World(map, { seed });
      w.spawner.disabled = true;
      expect(w.bonuses.nextMagnet).toBeGreaterThanOrEqual(MAGNET_FIRST[0]);
      expect(w.bonuses.nextMagnet).toBeLessThanOrEqual(MAGNET_FIRST[1]);
      idle(w, MAGNET_FIRST[0] - 1);
      expect(magnets(w).length).toBe(0);
      idle(w, MAGNET_FIRST[1] - MAGNET_FIRST[0] + 2);
      const list = magnets(w);
      expect(list.length).toBe(1);
      const i = list[0]!;
      const d = Math.hypot(w.pickups.x[i]! - w.player.x, w.pickups.z[i]! - w.player.z);
      expect(d).toBeGreaterThanOrEqual(BONUS_MIN - 0.01);
      expect(d).toBeLessThanOrEqual(BONUS_MAX + 0.01);
      expect(map.isFree(w.pickups.x[i]!, w.pickups.z[i]!, 1.2)).toBe(true);
      expect(w.announce.some((t) => t.includes('magnes'))).toBe(true);
    }
  });

  it('magnes ściąga bursztyny i monety z całej mapy, a jedzenie zostawia', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    w.bonuses.disabled = true;
    const p = w.player;
    // łup rozrzucony po całym borze, daleko poza zasięgiem zbierania
    const spots: Array<[number, number]> = [[150, 0], [-150, 20], [0, 160], [-90, -120], [60, 40]];
    for (const [x, z] of spots) {
      w.gems.spawn(x, map.heightAt(x, z), z, 3);
      w.pickups.spawn(PickupKind.Coin, x + 1, map.heightAt(x, z), z, 2);
    }
    w.pickups.spawn(PickupKind.Bread, 30, map.heightAt(30, 30), 30, 25);
    idle(w, 2);
    expect(w.gold).toBe(0);
    expect(w.xp).toBe(0);
    expect(w.level).toBe(1);
    w.pickups.spawn(PickupKind.Magnet, p.x + 1, p.y, p.z, 0);
    const inp = emptyInput();
    let pulled = false;
    for (let i = 0; i < 12 * 60; i++) {
      w.step(DT, inp);
      for (let e = 0; e < w.events.count; e++) if (w.events.items[e]!.type === Ev.Magnet) pulled = true;
      w.events.clear();
      if (w.choice) w.choose(0);
    }
    expect(pulled).toBe(true);
    expect(w.gold).toBe(spots.length * 2);
    expect(w.gems.list.count).toBe(0);
    // 15 pkt doświadczenia: awans z 1. poziomu (9) i reszta na pasku
    expect(w.level).toBe(2);
    expect(w.xp).toBeCloseTo(spots.length * 3 - 9);
    const k = w.pickups;
    let bread = 0;
    for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === PickupKind.Bread) bread++;
    expect(bread).toBe(1);
    expect(k.list.count).toBe(1);
  });

  it('kolejny magnes nie pojawia się, dopóki poprzedni czeka w pobliżu', () => {
    const w = new World(map, { seed: 2 });
    w.spawner.disabled = true;
    expect(w.bonuses.dropMagnet(w)).toBe(true);
    expect(w.bonuses.dropMagnet(w)).toBe(false);
    expect(magnets(w).length).toBe(1);
    // bohater odszedł daleko: nowy magnes pojawia się przy nim, a porzucony znika (nie kumulują się)
    w.player.x = 120;
    w.player.z = 0;
    expect(w.bonuses.dropMagnet(w)).toBe(true);
    const list = magnets(w);
    expect(list.length).toBe(1);
    expect(Math.hypot(w.pickups.x[list[0]!]! - 120, w.pickups.z[list[0]!]!)).toBeLessThanOrEqual(BONUS_MAX + 0.01);
    // wędrówka po całym borze nie zostawia za bohaterem coraz większej liczby magnesów
    for (let k = 0; k < 40; k++) {
      const a = k * 2.4;
      w.player.x = Math.cos(a) * (40 + (k % 5) * 25);
      w.player.z = Math.sin(a) * (40 + (k % 5) * 25);
      w.bonuses.dropMagnet(w);
      expect(magnets(w).length).toBe(1);
    }
  });

  it('dar boru: darmowa skrzynia pojawia się sama, różni się od płatnych i otwiera się bez złota', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const w = new World(map, { seed });
      w.spawner.disabled = true;
      const before = w.chests.length;
      expect(w.chests.every((c) => !c.gift && !c.free)).toBe(true);
      expect(w.bonuses.nextGift).toBeGreaterThanOrEqual(GIFT_FIRST[0]);
      expect(w.bonuses.nextGift).toBeLessThanOrEqual(GIFT_FIRST[1]);
      idle(w, GIFT_FIRST[0] - 1);
      expect(w.chests.length).toBe(before);
      idle(w, GIFT_FIRST[1] - GIFT_FIRST[0] + 2);
      expect(w.chests.length).toBe(before + 1);
      const c = w.chests[before]!;
      expect(c.gift).toBe(true);
      expect(c.free).toBe(true);
      const d = Math.hypot(c.x - w.player.x, c.z - w.player.z);
      expect(d).toBeGreaterThanOrEqual(BONUS_MIN - 0.01);
      expect(d).toBeLessThanOrEqual(BONUS_MAX + 0.01);
      expect(map.isFree(c.x, c.z, 1.2)).toBe(true);
      expect(map.inPuddle(c.x, c.z)).toBe(false);
      expect(w.announce.some((t) => t.includes('Dar boru'))).toBe(true);
      // podejście do skrzyni otwiera ją od razu: bez złota i bez przytrzymywania E
      expect(w.gold).toBe(0);
      w.player.x = c.x + 1;
      w.player.z = c.z;
      w.step(DT, emptyInput());
      expect(c.opened).toBe(true);
      expect(w.choice?.type === 'chest' && w.choice.gift).toBe(true);
      expect(w.paidChests).toBe(0);
      expect(w.chestCost()).toBe(CHEST_COST);
    }
  });

  it('skrzynia po elicie jest darmowa, ale nie jest darem boru', () => {
    const w = new World(map, { seed: 4 });
    w.spawner.disabled = true;
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 30, 0, true);
    w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
    const c = w.chests[w.chests.length - 1]!;
    expect(c.free).toBe(true);
    expect(c.gift).toBe(false);
  });

  it('dary nie zmieniają przebiegu fal: ten sam seed daje tych samych wrogów z darami i bez', () => {
    const end = GIFT_FIRST[1] + 10;
    const run = (bonuses: boolean): string => {
      const w = new World(map, { seed: 9 });
      w.bonuses.disabled = !bonuses;
      const inp = emptyInput();
      // bohater stoi w miejscu i jest nietykalny; dary leżą nietknięte 14-24 m dalej
      while (w.time < end) {
        w.player.invuln = 1;
        w.step(DT, inp);
        w.events.clear();
        if (w.choice) w.choose(0);
      }
      // porównanie ma sens tylko wtedy, gdy run naprawdę trwał i oba dary się pojawiły
      expect(w.dead).toBe(false);
      expect(w.damageTaken).toBe(0);
      const magnet = Array.from(w.pickups.kind.subarray(0, w.pickups.n)).some((kind, i) => w.pickups.alive[i] === 1 && kind === PickupKind.Magnet);
      expect(magnet).toBe(bonuses);
      expect(w.chests.some((c) => c.gift)).toBe(bonuses);
      const e = w.enemies;
      let sig = `${e.count}/${w.kills}`;
      for (let i = 0; i < e.n; i++) if (e.alive[i]) sig += `|${e.type[i]}:${e.x[i]!.toFixed(2)}:${e.z[i]!.toFixed(2)}`;
      return sig;
    };
    const withGifts = run(true);
    expect(withGifts.split('|').length).toBeGreaterThan(20);
    expect(withGifts).toBe(run(false));
  });
});
