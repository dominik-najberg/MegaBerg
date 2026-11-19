// Gifts of the forest: the timed magnet (pulls every gem and coin of the map) and the free gift chest
// (must look unlike the paid chests). Stages both by hand for the screenshots, then lets the bot play
// a real run to see them arrive on their own timers.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);

// Stand `dist` metres from a point, `side` metres off the line of sight, and look past the hero at it.
const face = (x, z, dist, side = 2) =>
  ev(
    ([x, z, dist, side]) => {
      const g = window.__mb;
      const p = g.world.player;
      const d = Math.hypot(x - p.x, z - p.z) || 1;
      const dx = (x - p.x) / d;
      const dz = (z - p.z) / d;
      g.debug.teleport(x - dx * dist + dz * side, z - dz * dist - dx * side);
      g.gfx.camYaw = Math.atan2(-dx, -dz);
      g.gfx.camPitch = 0.3;
    },
    [x, z, dist, side],
  );

// --- 1. magnet: appears with a banner and a light pillar
await ev(() => {
  const d = window.__mb.debug;
  d.spawner(false);
  // Enemies of the first second would drop gems and coins of their own and spoil the sums below.
  d.clearEnemies();
  d.god();
});
const magnet = await ev(() => {
  const g = window.__mb;
  const w = g.world;
  const ok = g.debug.magnet();
  const k = w.pickups;
  for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === 3) return { ok, x: k.x[i], z: k.z[i], d: Math.hypot(k.x[i] - w.player.x, k.z[i] - w.player.z) };
  return { ok, x: 0, z: 0, d: -1 };
});
console.log('magnes', magnet);
await face(magnet.x, magnet.z, 5);
// The banner queues behind the opening line of the run.
let magnetBanner = false;
for (let t = 0; t < 16 && !magnetBanner; t++) {
  await sleep(500);
  magnetBanner = await ev(() => document.body.innerText.includes('pojawił się magnes'));
}
await shot(page, '11-magnes.png');
// The renderer really draws it: one magnet model and one light pillar.
const magnetDrawn = await ev(() => {
  const fx = window.__mb.gfx.fx;
  return { models: fx.magnets.count, pillars: fx.magnetBeams.count, visible: fx.magnets.visible && fx.magnetBeams.visible };
});
console.log('magnes w rendererze', magnetDrawn);

// Loot all over the forest, far outside the pickup range, plus a handful in view of the camera.
const loot = await ev(() => {
  const w = window.__mb.world;
  const p = w.player;
  let coins = 0;
  let gems = 0;
  for (let i = 0; i < 60; i++) {
    const a = i * 2.399;
    const d = i < 20 ? 6 + (i % 5) * 2 : 40 + ((i * 37) % 120);
    const x = Math.max(-170, Math.min(170, p.x + Math.cos(a) * d));
    const z = Math.max(-170, Math.min(170, p.z + Math.sin(a) * d));
    const y = w.map.heightAt(x, z);
    if (Math.hypot(x - p.x, z - p.z) < 4) continue;
    if (i % 3 === 0) {
      w.pickups.spawn(0, x, y, z, 2);
      coins += 2;
    } else {
      w.gems.spawn(x, y, z, 1);
      gems++;
    }
  }
  return { coins, gems, gold: w.gold, level: w.level, xp: w.xp };
});
const gift = await ev(() => {
  const g = window.__mb;
  const w = g.world;
  const ok = g.debug.gift();
  const c = w.chests[w.chests.length - 1];
  return { ok, gift: c.gift, free: c.free, x: c.x, z: c.z, d: Math.hypot(c.x - w.player.x, c.z - w.player.z) };
});
console.log('dar boru', gift);
// Step back, so the hero's arrow on the map does not cover the magnet's marker.
await face(magnet.x, magnet.z, 22, 0);
await sleep(300);
await page.keyboard.down('Tab');
await sleep(600);
await shot(page, '11-mapa-magnes-i-dar.png');
// Markers on the map canvas: count pixels of the gift's green and of the magnet's red and pale poles
// in a small window around the place where each marker has to be.
const markers = await ev(([mx, mz, gx, gz]) => {
  const canvas = window.__mb.mapScreen.canvas;
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const extent = 180 + 15;
  const at = (v) => ((v + extent) / (extent * 2)) * S;
  const u = S / 760;
  // One readback of the whole canvas. Strokes two pixels wide are anti-aliased, so the magnet's red is
  // matched as "clearly red" rather than by its exact colour.
  const d = ctx.getImageData(0, 0, S, S).data;
  const red = (wx, wz) => {
    const half = Math.ceil(9 * u);
    const cx = Math.round(at(wx));
    const cy = Math.round(at(wz));
    let n = 0;
    for (let y = cy - half; y < cy + half; y++) {
      for (let x = cx - half; x < cx + half; x++) {
        const i = (y * S + x) * 4;
        if (d[i] > 185 && d[i + 1] < 100 && d[i + 2] < 100) n++;
      }
    }
    return n;
  };
  const count = (wx, wz, [r, g, b], tol) => {
    const half = Math.ceil(9 * u);
    const cx = Math.round(at(wx));
    const cy = Math.round(at(wz));
    let n = 0;
    for (let y = cy - half; y < cy + half; y++) {
      for (let x = cx - half; x < cx + half; x++) {
        const i = (y * S + x) * 4;
        if (Math.abs(d[i] - r) < tol && Math.abs(d[i + 1] - g) < tol && Math.abs(d[i + 2] - b) < tol) n++;
      }
    }
    return n;
  };
  return {
    giftGreen: count(gx, gz, [0x3f, 0xd0, 0xa8], 30),
    magnetRed: red(mx, mz),
    magnetPoles: count(mx, mz, [0xf2, 0xf4, 0xf6], 24),
    // The same colours far from both markers: the test must not pass on the parchment alone.
    greenElsewhere: count(120, 120, [0x3f, 0xd0, 0xa8], 30),
    redElsewhere: red(120, 120),
    polesElsewhere: count(120, 120, [0xf2, 0xf4, 0xf6], 24),
  };
}, [magnet.x, magnet.z, gift.x, gift.z]);
console.log('znaczniki na mapie', markers);
const legend = await ev(() => document.body.innerText.includes('dar boru') && document.body.innerText.includes('magnes'));
await page.keyboard.up('Tab');

// Walk into the magnet: everything on the map flies to the hero.
await ev(([x, z]) => window.__mb.debug.teleport(x + 0.8, z), [magnet.x, magnet.z]);
await sleep(700);
await shot(page, '11-magnes-zbieranie.png');
// Level-up cards pause the run while the loot is still in flight: take the first card and go on.
let swept = null;
for (let t = 0; t < 40; t++) {
  await sleep(500);
  swept = await ev(() => {
    const w = window.__mb.world;
    let coinsLeft = 0;
    let magnets = 0;
    const k = w.pickups;
    for (let i = 0; i < k.n; i++) {
      if (!k.alive[i]) continue;
      if (k.kind[i] === 0) coinsLeft++;
      if (k.kind[i] === 3) magnets++;
    }
    // Experience earned so far: what the passed levels cost plus what is on the bar (see xpForLevel).
    let earned = w.xp;
    for (let l = 1; l < w.level; l++) earned += Math.floor(4 + l * 5 + l * l * 0.9);
    return { gold: w.gold, gemsLeft: w.gems.list.count, coinsLeft, magnets, level: w.level, earned, choice: w.choice?.type ?? '' };
  });
  if (swept.choice) await page.keyboard.press('Digit1');
  else if (swept.gemsLeft === 0 && swept.coinsLeft === 0) break;
}
console.log('po magnesie', swept, 'rozrzucone', loot);

// --- 2. gift chest next to a paid chest and an elite's chest, for comparison
await ev(([x, z]) => {
  const w = window.__mb.world;
  const p = w.player;
  const d = Math.hypot(x - p.x, z - p.z) || 1;
  // Along the line perpendicular to the line of sight: gift, then an elite's chest, then a paid one.
  const sx = -(z - p.z) / d;
  const sz = (x - p.x) / d;
  const g = w.chests.find((c) => c.gift && !c.opened);
  const elite = w.spawnChest(x + sx * 2.4, z + sz * 2.4, true);
  const paid = w.spawnChest(x + sx * 4.8, z + sz * 4.8, false);
  // All three show their fronts to the camera.
  g.rot = paid.rot = elite.rot = Math.atan2(p.x - x, p.z - z);
  return [elite.x, elite.z];
}, [gift.x, gift.z]);
await face(gift.x, gift.z, 5.5, -2.2);
await sleep(700);
// The gift must not share its look with a paid chest or an elite's chest: own model, own material, a pillar.
const looks = await ev(() => {
  const g = window.__mb;
  const w = g.world;
  const views = g.gfx.fx.chestViews;
  const view = (pred) => views[w.chests.findIndex((c) => !c.opened && pred(c))];
  const gift = view((c) => c.gift);
  const paid = view((c) => !c.free);
  const elite = view((c) => c.free && !c.gift);
  const mesh = (v) => v.group.children[0];
  const tint = (v) => v.glow.material.color.getHex();
  return {
    ownModel: mesh(gift).geometry !== mesh(paid).geometry && mesh(gift).geometry !== mesh(elite).geometry,
    ownMaterial: mesh(gift).material !== mesh(paid).material && mesh(gift).material !== mesh(elite).material,
    pillar: !!gift.beam && gift.beam.visible && gift.group.visible,
    othersHaveNoPillar: paid.beam === null && elite.beam === null,
    ownGlow: tint(gift) !== tint(paid) && tint(gift) !== tint(elite),
  };
});
console.log('wygląd daru', looks);
await shot(page, '11-dar-boru-obok-platnej.png');

// Night: the pillar has to carry through the dark.
await ev(() => window.__mb.debug.time(520));
await sleep(900);
await shot(page, '11-dar-boru-noc.png');

// Touching the gift opens it: no gold, no key.
const before = await ev(() => ({ gold: window.__mb.world.gold, paid: window.__mb.world.paidChests }));
await ev(([x, z]) => window.__mb.debug.teleport(x + 0.9, z + 0.3), [gift.x, gift.z]);
await sleep(700);
const opened = await ev(() => {
  const w = window.__mb.world;
  return { choice: w.choice?.type, gift: w.choice?.gift, title: document.querySelector('.choice h2')?.textContent, card: w.choice?.cards?.[0]?.name, gold: w.gold, paid: w.paidChests, cost: w.chestCost() };
});
console.log('dar otwarty', opened);
await shot(page, '11-dar-boru-karta.png');
await page.keyboard.press('Enter');
await sleep(400);

// --- 3. a real run: both arrive on their own within the first four minutes
await page.goto(`${URL}?autostart=1&bot=good&speed=4`);
await sleep(1500);
await ev(() => window.__mb.debug.god());
let run = null;
let sawMagnetBanner = false;
let sawGiftBanner = false;
for (let t = 0; t < 170; t++) {
  await sleep(500);
  run = await ev(() => {
    const w = window.__mb.world;
    const text = document.body.innerText;
    return { time: +w.time.toFixed(1), nextMagnet: +w.bonuses.nextMagnet.toFixed(1), nextGift: +w.bonuses.nextGift.toFixed(1), gifts: w.chests.filter((c) => c.gift).length, giftsOpened: w.chests.filter((c) => c.gift && c.opened).length, magnetBanner: text.includes('pojawił się magnes'), giftBanner: text.includes('Dar boru!') };
  });
  sawMagnetBanner ||= run.magnetBanner;
  sawGiftBanner ||= run.giftBanner;
  if (t % 20 === 19) console.log(run);
  if (run.time >= 230) break;
}
console.log('run z botem:', run, { sawMagnetBanner, sawGiftBanner });
await shot(page, '11-run-z-darami.png');
report(errors);
await browser.close();

const checks = [
  ['magnes pojawia się 14-24 m od bohatera', magnet.ok && magnet.d >= 14 && magnet.d <= 24],
  ['baner zapowiada magnes', magnetBanner],
  ['magnes jest narysowany: model i słup światła', magnetDrawn.models === 1 && magnetDrawn.pillars === 1 && magnetDrawn.visible],
  ['legenda mapy zna magnes i dar boru', legend],
  ['mapa pokazuje znacznik magnesu i znacznik daru', !!markers && markers.giftGreen >= 12 && markers.magnetRed >= 8 && markers.magnetPoles >= 2 && markers.greenElsewhere === 0 && markers.redElsewhere === 0 && markers.polesElsewhere === 0],
  ['magnes zebrał wszystkie bursztyny i monety z mapy', swept.gemsLeft === 0 && swept.coinsLeft === 0 && swept.magnets === 0],
  ['złoto z monet trafiło do sakiewki', Math.round(swept.gold - loot.gold) === loot.coins],
  ['bursztyny dały doświadczenie (co najmniej 1 pkt za każdy)', swept.earned >= loot.gems - 0.01],
  ['dar wygląda inaczej niż płatna skrzynia i skrzynia po elicie', Object.values(looks).every(Boolean)],
  ['dar boru pojawia się 14-24 m od bohatera', gift.ok && gift.gift && gift.free && gift.d >= 14 && gift.d <= 24],
  ['dar otwiera się po dotknięciu, za darmo', opened.choice === 'chest' && opened.gift === true && opened.gold === before.gold && opened.paid === before.paid],
  ['okno daru ma własny tytuł', opened.title === 'Dar boru'],
  ['w prawdziwym runie magnes przyszedł sam', run.nextMagnet > 120 && sawMagnetBanner],
  ['w prawdziwym runie dar boru przyszedł sam', run.gifts >= 1 && sawGiftBanner],
  ['konsola bez błędów', errors.length === 0],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(ok ? 'OK  ' : 'BŁĄD', name);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
