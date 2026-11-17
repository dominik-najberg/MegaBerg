import { launch, URL, sleep, hold, shot, report } from '../lib/browser.mjs';

const { browser, page, errors } = await launch();
await page.goto(URL);
await sleep(1200);
await shot(page, '02-menu.png');
// Menu -> character select -> start (keyboard).
await page.keyboard.press('Enter');
await sleep(300);
await shot(page, '02-wybor-postaci.png');
await page.keyboard.press('Enter');
await sleep(800);
const info = () => page.evaluate(() => {
  const g = window.__mb; const w = g.world;
  return { state: g.state, t: +w.time.toFixed(1), hp: Math.round(w.player.hp), lvl: w.level, kills: w.kills, alive: w.enemies.count, gems: w.gems.list.count, choice: w.choice?.type ?? null, weapons: w.weapons.map(x => x.def.id + x.level).join(',') };
});
console.log('started', await info());
// Walk around manually: circle with WASD while the sickles work.
for (let i = 0; i < 14; i++) {
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][i % 4], 900);
  const s = await info();
  if (s.choice) {
    console.log('choice open', s);
    await shot(page, '02-awans-karty.png');
    await page.keyboard.press('Digit1');
    await sleep(300);
    console.log('after pick', await info());
  }
}
console.log('after walking', await info());
await shot(page, '02-walka.png');
// Let the bot fight for a while (4x speed) to see level-ups, then die on purpose.
await page.evaluate(() => { window.__mb.setBot('good'); window.__mb.loop.timeScale = 4; });
await sleep(9000);
console.log('bot 4x', await info());
await page.evaluate(() => { window.__mb.loop.timeScale = 1; });
await sleep(300);
await shot(page, '02-walka-bot.png');
await page.evaluate(() => { const g = window.__mb; g.setBot(null); g.world.player.hp = 1; g.world.player.invuln = 0; g.world.hurtPlayer(50); });
await sleep(2200);
console.log('dead', await info());
await shot(page, '02-koniec-runu.png');
await page.keyboard.press('Enter');
await sleep(600);
console.log('restarted', await info());
report(errors);
await browser.close();
