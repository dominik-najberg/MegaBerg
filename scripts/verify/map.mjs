// Map screen check: fog of war at the start, after a walk along a trail, and with a boss marker.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);
await ev(() => { const g = window.__mb; g.debug.god(); g.world.spawner.disabled = true; });
await shot(page, '09-start.png');
await page.keyboard.down('Tab');
await sleep(500);
await shot(page, '09-mapa-poczatek.png');
await page.keyboard.up('Tab');
await sleep(300);
console.log('closed after keyup:', await ev(() => !window.__mb.mapScreen.visible));
// Walk the hero along a few routes (teleport in small steps so the fog uncovers like a real walk).
await ev(() => {
  const g = window.__mb; const w = g.world; const m = g.map;
  const visit = (tx, tz) => { const p = w.player; const n = Math.ceil(Math.hypot(tx - p.x, tz - p.z) / 2); const sx = p.x, sz = p.z;
    for (let i = 1; i <= n; i++) { const x = sx + (tx - sx) * i / n, z = sz + (tz - sz) * i / n; w.fog.reveal(x, z); p.x = x; p.z = z; } };
  for (const k of [0, 2, 3]) { const l = m.landmarks[k]; visit(l.x * 0.9, l.z * 0.9); }
  const p = w.player; p.y = m.heightAt(p.x, p.z); p.savePrev();
});
await sleep(800);
console.log(await ev(() => { const w = window.__mb.world; return { found: w.landmarksFound, cover: w.fog.coverage(180) }; }));
await shot(page, '09-punkt-orientacyjny.png');
await ev(() => { window.__mb.debug.spawn('leszy', 1, 40); window.__mb.mapHeld = true; });
await sleep(600);
await shot(page, '09-mapa-odkryta.png');
report(errors);
await browser.close();
