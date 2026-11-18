// Quick look: a few screenshots of a bot run for judging the picture. Usage: node scripts/verify/look.mjs [prefix] [times] [quality]
import { launch, URL, sleep, report } from '../lib/browser.mjs';
const prefix = process.argv[2] || 'look';
const times = (process.argv[3] || '15,150,400').split(',').map(Number);
const quality = process.argv[4];
const out = process.env.MB_OUT || '/tmp/';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1&bot=good`);
await sleep(1500);
if (quality !== undefined) await ev((q) => { const g = window.__mb; g.store.data.options.quality = Number(q); g.gfx.applyQuality(Number(q)); }, quality);
await ev(() => { const g = window.__mb; g.debug.god(); for (const id of ['ogien', 'grom', 'wianek']) g.debug.give(id, 2); });
for (const t of times) {
  await ev(() => { window.__mb.loop.timeScale = 8; });
  for (;;) { if ((await ev(() => window.__mb.world.time)) >= t) break; await sleep(200); }
  await ev(() => { window.__mb.loop.timeScale = 1; });
  await sleep(1200);
  await page.screenshot({ path: `${out}${prefix}-${t}.png` });
  console.log('shot', `${out}${prefix}-${t}.png`);
}
report(errors);
await browser.close();
