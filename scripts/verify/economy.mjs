// Early economy check: chests near the start show on the map from the first second, the first minute
// of kills pays for a chest, the hint banner appears, and the bot buys its first chest for the new price.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);

const near = await ev(() => {
  const w = window.__mb.world;
  return w.chests.map((c) => ({ x: c.x, z: c.z, d: Math.hypot(c.x, c.z), seen: w.fog.seen(c.x, c.z) })).filter((c) => c.d < 30).sort((a, b) => a.d - b.d);
});
const firstCost = await ev(() => window.__mb.world.chestCost());
console.log('skrzynie do 30 m od startu:', near.map((c) => c.d.toFixed(1)).join(', '));
await page.keyboard.down('Tab');
await sleep(500);
await shot(page, '10-mapa-skrzynie-przy-starcie.png');
await page.keyboard.up('Tab');

// The bot plays the first 75 seconds the way a decent player would (it collects coins and walks to chests).
await page.goto(`${URL}?autostart=1&bot=good`);
await sleep(1500);
let hintAt = -1;
let chestAt = -1;
let paidFor = -1;
let state = null;
let prev = null;
for (let t = 0; t < 120; t++) {
  await sleep(1000);
  state = await ev(() => {
    const w = window.__mb.world;
    return { time: +w.time.toFixed(1), gold: Math.floor(w.gold), collected: Math.floor(w.goldCollected), kills: w.kills, level: w.level, paid: w.paidChests, cost: w.chestCost(), dead: w.dead, banner: document.body.innerText.includes('Stać cię na skrzynię') };
  });
  if (state.banner && hintAt < 0) {
    hintAt = state.time;
    await shot(page, '10-podpowiedz-skrzynia.png');
  }
  if (state.paid > 0 && chestAt < 0) {
    chestAt = state.time;
    // Gold spent between two samples = collected growth minus purse growth.
    paidFor = prev ? state.collected - prev.collected - (state.gold - prev.gold) : -1;
  }
  prev = state;
  if (t % 15 === 14) console.log(state);
  if (state.time >= 75 || state.dead) break;
}
console.log('po 75 s:', state, '| podpowiedź w', hintAt, 's | pierwsza płatna skrzynia w', chestAt, 's');

await shot(page, '10-po-pierwszej-skrzyni.png');
report(errors);
await browser.close();

// The script fails loudly: a missing chest, hint or purchase must not pass as a screenshot run.
const checks = [
  ['trzy skrzynie w zasięgu wzroku od startu', near.length === 3 && near.every((c) => c.seen)],
  ['pierwsza skrzynia kosztuje 10 złota', firstCost === 10],
  ['podpowiedź o skrzyni w pierwszej minucie', hintAt > 0 && hintAt <= 60],
  ['bot żyje po 75 s', !state.dead],
  ['bot kupił skrzynię i zapłacił za nią pierwszą cenę', chestAt > 0 && state.paid >= 1 && paidFor === 10],
  ['konsola bez błędów', errors.length === 0],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(ok ? 'OK  ' : 'BŁĄD', name);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
