// WebGL context loss: the run's gold must be banked, also during the death/victory animation.
import { launch, URL, sleep, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch();
for (const mode of ['playing', 'ending']) {
  await page.goto(`${URL}?autostart=1`);
  await sleep(1200);
  await page.evaluate(() => localStorage.clear());
  await page.evaluate((mode) => {
    const g = window.__mb;
    g.store.data.gold = 0;
    g.debug.gold(33);
    if (mode === 'ending') { const w = g.world; w.player.invuln = 0; w.hurtPlayer(9999); }
  }, mode);
  await sleep(mode === 'ending' ? 300 : 100);
  const before = await page.evaluate(() => window.__mb.state);
  await page.evaluate(() => window.__mb.gfx.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
  await sleep(500);
  console.log(mode, '-> state before loss:', before, await page.evaluate(() => ({ state: window.__mb.state, title: document.querySelector('.sheet h2')?.textContent, bankedGold: window.__mb.store.data.gold, runs: window.__mb.store.data.stats.runs })));
}
report(errors.filter((e) => !e.includes('CONTEXT_LOST')));
await browser.close();
