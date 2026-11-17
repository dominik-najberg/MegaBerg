// Meta & menus: shop, achievements, options, pause, save persistence, reset.
import { launch, URL, sleep, hold, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch();
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(URL);
await sleep(1000);
await ev(() => localStorage.clear());
await page.reload();
await sleep(1000);
const save = () => ev(() => JSON.parse(localStorage.getItem('megaberg-slowianskie-bory-v1') || 'null'));
const click = async (sel) => { await page.click(sel); await sleep(250); };

// Play a short run with the bot, finish it from the pause menu.
await click('[data-act="play"]');
await click('[data-act="start"]');
await ev(() => { const g = window.__mb; g.setBot('good'); g.loop.timeScale = 6; g.debug.gold(400); });
await sleep(9000);
await ev(() => { const g = window.__mb; g.loop.timeScale = 1; g.setBot(null); });
await page.keyboard.press('Escape');
await sleep(400);
console.log('paused:', await ev(() => window.__mb.state));
await shot(page, '05-pauza.png');
await click('[data-act="options"]');
await shot(page, '05-opcje.png');
// change options: toggle damage numbers, quality low, music volume
await click('[data-act="toggle"][data-arg="damageNumbers"]');
await click('[data-act="quality"][data-arg="0"]');
await page.$eval('input[data-opt="music"]', (el) => { el.value = '0.25'; el.dispatchEvent(new Event('input', { bubbles: true })); });
await sleep(200);
console.log('options saved:', JSON.stringify((await save()).options));
await click('[data-act="back"]');
console.log('back to:', await ev(() => window.__mb.ui.screen));
await click('[data-act="endrun"]');
await sleep(400);
await shot(page, '05-koniec-runu.png');
let s = await save();
console.log('after run:', JSON.stringify({ gold: s.gold, stats: s.stats, ach: s.achievements }));
await click('[data-act="shop"]');
await shot(page, '05-chata.png');
// buy three upgrades
for (const id of ['sila', 'zdrowie', 'szybkosc']) await click(`[data-act="buy"][data-arg="${id}"]`);
s = await save();
console.log('after shop:', JSON.stringify({ gold: s.gold, shop: s.shop }));
await shot(page, '05-chata-po-zakupach.png');
await click('[data-act="back"]');
await click('[data-act="achievements"]');
await shot(page, '05-osiagniecia.png');
await click('[data-act="back"]');

// Persistence across a reload; shop bonuses applied to a new run.
await page.reload();
await sleep(1000);
s = await save();
console.log('after reload:', JSON.stringify({ gold: s.gold, shop: s.shop, quality: s.options.quality }));
await click('[data-act="play"]');
await shot(page, '05-wybor-postaci.png');
await click('[data-act="start"]');
console.log('new run stats:', await ev(() => { const st = window.__mb.world.stats; return { maxHp: st.maxHp, damage: +st.damage.toFixed(2), moveSpeed: +st.moveSpeed.toFixed(2) }; }));
await page.keyboard.press('Escape');
await sleep(300);
await click('[data-act="options"]');
await click('[data-act="reset"]');
await click('[data-act="reset"]');
s = await save();
console.log('after reset:', JSON.stringify({ gold: s.gold, shop: s.shop, ach: s.achievements, quality: s.options.quality }));

// Broken storage must not crash the game.
await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); }; Storage.prototype.getItem = () => '{broken json'; });
await page.reload();
await sleep(1000);
console.log('broken storage -> screen:', await ev(() => window.__mb.ui.screen), 'healthy:', await ev(() => window.__mb.store.healthy));
report(errors);
await browser.close();
