// Etap A2 z docs/BRONIE-PLAN.md: Łuk Dziewanny w Arsenale (zablokowany z paskiem, potem odblokowany) i w walce.
// Usage: MB_URL=http://localhost:5173/ node scripts/verify/luk.mjs
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
const row = () => ev(() => [...document.querySelectorAll('.arsenal-item')].map((e) => e.innerText.replace(/\n+/g, ' | ')).filter((t) => t.includes('Sokoła') || t.includes('Łuk')).join('\n'));
await page.goto(URL);
await sleep(800);
await ev(() => {
  const s = window.__mb.store;
  s.reset();
  s.data.best.luk = 6;
  s.save();
});
await page.goto(URL);
await sleep(800);
await page.click('[data-act="arsenal"]');
await sleep(200);
console.log('zablokowany:', await row());
await ev(() => {
  const s = window.__mb.store;
  s.data.achievements.push('luk');
  s.save();
});
await page.goto(URL);
await sleep(800);
await page.click('[data-act="arsenal"]');
await sleep(200);
console.log('odblokowany:', await row());
await shot(page, '15-arsenal-luk.png');

await page.goto(`${URL}?autostart=1&bot=good&speed=4`);
await sleep(1500);
console.log('pula ma łuk:', await ev(() => window.__mb.world.weaponPool.has('luk')));
await ev(() => { const w = window.__mb.world; const l = w.addWeapon('luk'); l.level = 5; w.refreshWeapon(l); });
for (let k = 0; k < 60; k++) {
  await sleep(1000);
  if ((await ev(() => window.__mb.world.time)) > 100) break;
}
await ev(() => { window.__mb.loop.timeScale = 1; });
for (let k = 0; k < 40; k++) {
  await sleep(120);
  if (await ev(() => { const w = window.__mb.world; const pr = w.projectiles; for (let i = 0; i < pr.n; i++) if (pr.alive[i] && w.weapons[pr.slot[i]]?.def.id === 'luk') return true; return false; })) break;
}
await shot(page, '15-luk-w-walce.png');
console.log('run:', await ev(() => { const w = window.__mb.world; return { t: Math.round(w.time), kills: w.kills, byWeapon: w.killsByWeapon, dealt: Object.fromEntries(w.weapons.map((x) => [x.def.id, Math.round(x.dealt)])) }; }));
report(errors);
await browser.close();
