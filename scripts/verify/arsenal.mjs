// Etap A z docs/BRONIE-PLAN.md: ekran Arsenał, broń w Skarbcu, liczniki zabójstw na broń w prawdziwym runie.
// Usage: MB_URL=http://localhost:5173/ node scripts/verify/arsenal.mjs
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(URL);
await sleep(800);
await ev(() => {
  const s = window.__mb.store;
  s.reset();
  Object.assign(s.data.stats, { runs: 6, kills: 1240, bestTime: 150, bestLevel: 11 });
  s.data.achievements.push('jaga');
  s.data.evolutionsSeen.push('zniwa');
  s.data.silver = 25;
  s.save();
});
await page.goto(URL);
await sleep(800);
await page.click('[data-act="arsenal"]');
await sleep(300);
console.log('arsenał:', await ev(() => [...document.querySelectorAll('.arsenal-item')].map((e) => e.innerText.replace(/\n+/g, ' | ')).join('\n')));
await shot(page, '14-arsenal.png');
await page.keyboard.press('Escape');
console.log('po Escape:', await ev(() => window.__mb.ui.screen));

// Broń z ceną w srebrze (na czas testu): odblokowana osiągnięciem, do kupienia w Skarbcu.
await ev(async () => {
  const m = await import('/src/data/weapons.ts');
  m.WEAPON_BY_ID.kruki.silver = 20;
});
await page.click('[data-act="arsenal"]');
await sleep(200);
console.log('arsenał, Kruki z ceną:', await ev(() => [...document.querySelectorAll('.arsenal-item')].map((e) => e.innerText.replace(/\n+/g, ' | ')).find((t) => t.includes('Kruki'))));
await page.keyboard.press('Escape');
await page.click('[data-act="shop"]');
await sleep(200);
await page.click('[data-arg="weapon:kruki"]');
await sleep(200);
console.log('po zakupie:', await ev(() => ({ silver: window.__mb.store.data.silver, bought: window.__mb.store.data.bought })));

// Krótki run bota: zabójstwa trafiają na konta broni, a po rozliczeniu do zapisu.
await page.goto(`${URL}?autostart=1&bot=good&speed=8`);
for (let k = 0; k < 40; k++) {
  await sleep(1000);
  if ((await ev(() => window.__mb.world.time)) > 150) break;
}
console.log('run:', await ev(() => { const w = window.__mb.world; return { t: Math.round(w.time), kills: w.kills, byWeapon: w.killsByWeapon, unhurt: Math.round(w.longestUnhurt()), armor: Math.round(w.armorBlocked), bookTimes: Object.fromEntries(Object.entries(w.bookTimes).map(([k, v]) => [k, v.map(Math.round)])) }; }));
await ev(() => window.__mb.finishRun());
await sleep(300);
console.log('zapis:', await ev(() => { const d = window.__mb.store.data; return { killsByWeapon: d.stats.killsByWeapon, killsByEnemy: d.stats.killsByEnemy, best: d.best, seen: d.evolutionsSeen }; }));
report(errors);
await browser.close();
