// Frame cost per quality level and per feature. Usage: node scripts/verify/perf.mjs [enemies=300] [dpr=1]
// GPU time is included (gl.finish after every frame), frame rate is not capped.
import { chromium } from 'playwright-core';
import { URL, sleep } from '../lib/browser.mjs';
const enemies = Number(process.argv[2] || 300);
const dpr = Number(process.argv[3] || 1);
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=gl-egl', '--mute-audio', '--disable-frame-rate-limit'],
});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr })).newPage();
await page.goto(`${URL}?autostart=1&bot=good&force=${enemies}`);
await sleep(1500);
await page.evaluate(() => {
  const g = window.__mb; const w = g.world;
  w.stats.maxHp = 1e9; w.player.hp = 1e9; w.refreshStats = () => {};
  for (const id of ['ogien', 'grom', 'wianek', 'proca', 'ciupaga']) w.addWeapon(id);
  w.time = 240; g.perfFinish = true;
});
const measure = async (label, setup) => {
  await page.evaluate(setup);
  await sleep(2500);
  await page.evaluate(() => window.__mb.resetPerf());
  await sleep(5000);
  const r = await page.evaluate(() => window.__mb.perfReport());
  console.log(label.padEnd(26), `${String(r.fps).padStart(6)} fps  ${r.cpuMsPerFrame.toFixed(2)} ms/klatkę  najgorsza ${r.worstFrameMs} ms`);
};
const q = (n) => `(() => { const g = window.__mb; g.store.data.options.quality = ${n}; g.gfx.applyQuality(${n}); })()`;
await measure('wysoka', q(2));
await measure('wysoka, bez bloom', `(() => { window.__mb.gfx.post.bloom.enabled = false; })()`);
await measure('wysoka, bez cieni', `(() => { const g = window.__mb.gfx; g.post.bloom.enabled = true; g.renderer.shadowMap.enabled = false; g.sky.sun.castShadow = false; })()`);
await measure('srednia', q(1));
await measure('niska', q(0));
await browser.close();
