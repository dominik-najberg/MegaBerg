// Checks the production build served by `npm run preview` (port 4173): menu, a short bot run, zero console errors.
import { launch, sleep, shot, report } from '../lib/browser.mjs';
const url = process.env.MB_URL || 'http://localhost:4173/';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
await page.goto(url);
await sleep(1500);
console.log('menu screen:', await page.evaluate(() => window.__mb.ui.screen), '| title:', await page.title());
await page.keyboard.press('Enter');
await sleep(300);
await page.keyboard.press('Enter');
await sleep(600);
await page.evaluate(() => { const g = window.__mb; g.setBot('good'); g.loop.timeScale = 6; });
await sleep(15000);
await page.evaluate(() => { window.__mb.loop.timeScale = 1; });
await sleep(1200);
console.log('run:', await page.evaluate(() => { const g = window.__mb; const w = g.world; return { state: g.state, t: Math.round(w.time), lvl: w.level, kills: w.kills, alive: w.enemies.count, weapons: w.weapons.map((x) => x.def.id + x.level).join(',') }; }));
await shot(page, '08-build-produkcyjny.png');
report(errors);
await browser.close();
