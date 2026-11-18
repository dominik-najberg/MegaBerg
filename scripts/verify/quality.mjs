// Same frame on the three quality levels (the hero stands still at the start). Usage: node scripts/verify/quality.mjs [prefix] [x,z] [time]
import { launch, URL, sleep, report } from '../lib/browser.mjs';
const prefix = process.argv[2] || 'q';
const at = (process.argv[3] || 'x,x').split(',').map(Number);
const time = Number(process.argv[4] || 0);
const out = process.env.MB_OUT || '/tmp/';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);
await ev(([x, z, t]) => {
  const g = window.__mb; g.debug.god(); g.world.spawner.disabled = true;
  if (Number.isFinite(x) && Number.isFinite(z)) { const p = g.world.player; p.x = x; p.z = z; p.y = g.map.heightAt(x, z); p.savePrev(); g.gfx.resetRun(); }
  if (t > 0) g.world.time = t;
}, [at[0], at[1], time]);
for (const q of (process.env.MB_Q || '2,0').split(',').map(Number)) {
  await ev((q) => { const g = window.__mb; g.store.data.options.quality = q; g.gfx.applyQuality(q); }, q);
  await sleep(900);
  await page.screenshot({ path: `${out}${prefix}-q${q}.png` });
  console.log('shot', `${out}${prefix}-q${q}.png`);
}
report(errors);
await browser.close();
