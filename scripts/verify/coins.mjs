// Coins from kills are collected automatically: an elite killed 18 m away pays its purse while the
// hero stands still, and the coins visibly fly to the hero instead of lying on the ground.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);

const start = await ev(() => {
  const g = window.__mb;
  const w = g.world;
  const d = g.debug;
  d.spawner(false);
  d.clearEnemies();
  d.god();
  w.time = 500; // past the early coin bonus, so only the elite's purse counts
  const p = w.player;
  const px = p.x;
  const pz = p.z;
  // Camera looks past the hero toward the kill spot.
  g.gfx.camYaw = Math.atan2(-1, 0);
  g.gfx.camPitch = 0.3;
  const gold = w.gold;
  const i = w.spawnEnemy(5, px + 18, pz, true);
  w.damageEnemy(i, 1e9, -1, 0, 0, 0, null);
  const k = w.pickups;
  let coins = 0;
  let pulled = 0;
  for (let c = 0; c < k.n; c++)
    if (k.alive[c] && k.kind[c] === 0) {
      coins++;
      if (k.mag[c]) pulled++;
    }
  return { px, pz, gold, coins, pulled };
});
console.log('po zabiciu elity', start);
await sleep(250);
await shot(page, '12-monety-leca.png');
await sleep(2000);
const end = await ev(
  ([px, pz]) => {
    const w = window.__mb.world;
    const k = w.pickups;
    let coins = 0;
    for (let c = 0; c < k.n; c++) if (k.alive[c] && k.kind[c] === 0) coins++;
    return { gold: w.gold, coins, moved: Math.hypot(w.player.x - px, w.player.z - pz) };
  },
  [start.px, start.pz],
);
console.log('po 2 s', end);

const checks = [
  ['elita zostawiła monety', start.coins >= 5],
  ['wszystkie monety lecą do bohatera', start.pulled === start.coins],
  ['bohater stał w miejscu', end.moved < 0.01],
  ['na ziemi nie zostały monety', end.coins === 0],
  ['złoto wpłynęło do sakiewki', end.gold - start.gold >= 10],
];
let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'OK ' : 'BŁĄD'} ${name}`);
  ok &&= pass;
}
report(errors);
await browser.close();
process.exit(ok && errors.length === 0 ? 0 : 1);
