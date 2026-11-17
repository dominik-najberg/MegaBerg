// Scale test: N enemies kept alive, bot playing, measures FPS and CPU time per frame.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';

const gpu = process.argv[2] || 'egl';
const counts = (process.argv[3] || '300,500,700').split(',').map(Number);
const { browser, page, errors } = await launch({ gpu, width: 1920, height: 1080 });
const renderer = await page.evaluate(() => {
  const g = document.createElement('canvas').getContext('webgl2');
  const d = g.getExtension('WEBGL_debug_renderer_info');
  return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
console.log('GPU:', renderer);
for (const n of counts) {
  await page.goto(`${URL}?autostart=1&bot=good&force=${n}`);
  await sleep(1500);
  // Make the hero immortal and give him a late-game build so every system is busy.
  await page.evaluate(() => {
    const w = window.__mb.world;
    w.stats.maxHp = 1e9; w.player.hp = 1e9; w.shopLevels.zdrowie = 0;
    w.refreshStats = () => {};
    for (const id of ['ogien', 'grom', 'wianek', 'proca', 'ciupaga']) w.addWeapon(id);
    w.time = 240;
    window.__mb.perfFinish = true;
  });
  await sleep(6000);
  await page.evaluate(() => window.__mb.resetPerf());
  await sleep(10000);
  const r = await page.evaluate(() => window.__mb.perfReport());
  console.log(`target ${n}:`, JSON.stringify(r));
  if (n === 500) await shot(page, '03-skala-500-wrogow.png');
}
report(errors);
await browser.close();
