// Hidden dev menu under ~: opens and pauses the run, immortality, gold, silver, levels, closes and resumes.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch();
const ev = (fn, arg) => page.evaluate(fn, arg);
const click = (id) => page.click(`[data-dev="${id}"]`);
const state = () =>
  ev(() => {
    const g = window.__mb;
    const w = g.world;
    return { state: g.state, open: g.devMenu.open, god: w.godMode, hp: Math.round(w.player.hp), gold: Math.round(w.gold), level: w.level, pending: w.pendingLevels, saveGold: g.store.data.gold, silver: g.store.data.silver };
  });

await page.goto(`${URL}?autostart=1`);
await sleep(4000);
console.log('start:', await state());

await page.keyboard.press('Backquote');
await sleep(300);
console.log('after ~:', await state());

await click('god');
await click('gold');
await click('silver');
await click('lvl1');
await sleep(200);
console.log('after clicks:', await state());
await shot(page, '13-menu-deva.png');

await page.keyboard.press('Backquote');
await sleep(300);
console.log('after ~ again (level-up cards expected):', await state());

// Immortality: a lethal blow is ignored.
await ev(() => {
  const w = window.__mb.world;
  w.player.invuln = 0;
  w.revivesLeft = 0;
  w.hurtPlayer(1e6);
});
console.log('after lethal hit with god on:', await state());

// Menu state: gold goes to the save (Chata); level buttons are disabled.
await ev(() => window.__mb.toMenu());
await sleep(300);
const g0 = (await state()).saveGold;
await page.keyboard.press('Backquote');
await click('gold');
console.log('menu: save gold +', (await state()).saveGold - g0, 'lvl disabled:', await page.$eval('[data-dev="lvl1"]', (b) => b.disabled));
console.log('god carried to new world:', (await state()).god);
await page.keyboard.press('Escape');
await sleep(200);
console.log('after Esc:', await state());

// Leave the save as it was before the test's gold/silver.
await ev(() => {
  const s = window.__mb.store;
  s.data.gold = Math.max(0, s.data.gold - 2000);
  s.data.silver = Math.max(0, s.data.silver - 100);
  s.save();
});
report(errors);
await browser.close();
