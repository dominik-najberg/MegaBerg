import { launch, URL, sleep, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch();
await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); }; Storage.prototype.getItem = () => '{broken json'; });
await page.goto(URL);
await sleep(1500);
console.log('has game:', await page.evaluate(() => !!window.__mb), 'screen:', await page.evaluate(() => window.__mb?.ui.screen), 'healthy:', await page.evaluate(() => window.__mb?.store.healthy));
// start a run and end it: saving fails, the game must keep working and tell the player
await page.keyboard.press('Enter'); await sleep(200); await page.keyboard.press('Enter'); await sleep(600);
await page.evaluate(() => window.__mb.finishRun());
await sleep(300);
console.log('state:', await page.evaluate(() => window.__mb.state), 'toasts:', await page.evaluate(() => [...document.querySelectorAll('.toast')].map((t) => t.textContent)));
report(errors);
await browser.close();
