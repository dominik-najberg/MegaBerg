// Presentation check: a normal bot run at 5x speed with screenshots at several times of the run.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1&bot=good`);
await sleep(1200);
await ev(() => { const g = window.__mb; g.audio.unlock(); g.debug.god(); for (const id of ['ogien', 'grom', 'wianek']) g.debug.give(id, 2); });
const marks = [[20, '06-zmierzch.png'], [150, '06-baba-jaga.png'], [330, '06-zmrok.png'], [520, '06-noc.png']];
for (const [t, file] of marks) {
  await ev(() => { window.__mb.loop.timeScale = 8; });
  for (;;) {
    const now = await ev(() => window.__mb.world.time);
    if (now >= t) break;
    await sleep(250);
  }
  await ev(() => { window.__mb.loop.timeScale = 1; });
  await sleep(1500);
  console.log(file, await ev(() => { const w = window.__mb.world; return { t: Math.round(w.time), lvl: w.level, alive: w.enemies.count, kills: w.kills, audio: window.__mb.audio.ctx?.state }; }));
  await shot(page, file);
}
report(errors);
await browser.close();
