// Full runs in the browser with the bot at 8x speed. Usage: node scripts/verify/m7.mjs [shopLevel] [tag]
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const shopLevel = Number(process.argv[2] ?? 0);
const tag = process.argv[3] ?? `sklep${shopLevel}`;
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(URL);
await sleep(800);
await ev((lvl) => {
  const s = window.__mb.store;
  for (const id of ['sila', 'zdrowie', 'szybkosc', 'pancerz', 'regeneracja', 'magnes', 'szczescie', 'chciwosc', 'madrosc', 'tempo', 'obszar', 'przelosowanie']) s.data.shop[id] = id === 'pancerz' || id === 'przelosowanie' ? Math.min(3, lvl) : lvl;
  if (lvl >= 4) s.data.shop.odrodzenie = 1;
  s.save();
}, shopLevel);
await page.goto(`${URL}?autostart=1&bot=good&speed=8`);
await sleep(1000);
const t0 = Date.now();
let bossShot = false;
let last = -1;
for (;;) {
  await sleep(1000);
  const s = await ev(() => { const g = window.__mb; const w = g.world; return { state: g.state, t: w.time, lvl: w.level, hp: Math.round(w.player.hp), max: w.stats.maxHp, alive: w.enemies.count, kills: w.kills, boss: w.bossIdx >= 0 ? Math.round((w.enemies.hp[w.bossIdx] / w.enemies.maxHp[w.bossIdx]) * 100) : -1, weapons: w.weapons.map((x) => x.def.id + (x.def.evolved ? '*' : x.level)).join(',') }; });
  const minute = Math.floor(s.t / 60);
  if (minute !== last) { last = minute; console.log(`min ${minute}: lvl ${s.lvl} hp ${s.hp}/${s.max} alive ${s.alive} kills ${s.kills} boss ${s.boss} [${s.weapons}]`); }
  if (s.t >= 606 && !bossShot && s.state === 'playing') {
    bossShot = true;
    await ev(() => { window.__mb.loop.timeScale = 1; });
    await sleep(2500);
    await shot(page, `07-leszy-${tag}.png`);
    await ev(() => { window.__mb.loop.timeScale = 8; });
  }
  if (s.state === 'end') break;
  if (Date.now() - t0 > 240000) { console.log('timeout'); break; }
}
await sleep(500);
console.log('result', await ev(() => { const s = window.__mb.world.summary(); return { won: s.won, time: Math.round(s.time), level: s.level, kills: s.kills, gold: s.gold, evolved: s.evolved }; }));
await shot(page, `07-koniec-${tag}.png`);
report(errors);
await browser.close();
