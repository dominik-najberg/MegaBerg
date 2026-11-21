// Content check: every enemy model, every weapon (base + evolved), mini-bosses, boss, chest, shrine.
import { launch, URL, sleep, hold, shot, report } from '../lib/browser.mjs';

const { browser, page, errors } = await launch();
const fresh = async () => {
  await page.goto(`${URL}?autostart=1`);
  await sleep(1200);
  await page.evaluate(() => { const d = window.__mb.debug; d.spawner(false); d.god(); });
};
const ev = (fn, arg) => page.evaluate(fn, arg);

// --- 1. bestiary line-up
await fresh();
await ev(() => {
  const g = window.__mb; const d = g.debug;
  g.world.weapons.length = 0;
  g.gfx.camPitch = 0.22; g.gfx.camDist = 7;
  const ids = ['chochlik', 'utopiec', 'kruk', 'ognik', 'strzyga', 'wilkolak', 'bies', 'licho'];
  ids.forEach((id, k) => {
    const w = g.world; const a = (k / (ids.length - 1) - 0.5) * 1.5 + Math.PI;
    const i = w.spawnEnemy(w.enemies.type.constructor === Uint8Array ? ids.indexOf(id) : 0, w.player.x + Math.sin(a) * 6.5, w.player.z + Math.cos(a) * 6.5);
    w.enemies.speed[i] = 0; w.enemies.dmg[i] = 0; w.enemies.t1[i] = 999;
  });
});
await sleep(900);
await shot(page, '04-bestiariusz.png');

// --- 2. weapons: damage dealt in 4 s against a crowd, one screenshot per base weapon
const weapons = ['sierpy', 'ogien', 'grom', 'ciupaga', 'wianek', 'proca', 'kruki', 'marzanna', 'wlocznia', 'dziegiec', 'zniwa', 'slonce', 'gniew', 'topor', 'kwiat', 'grad', 'stado', 'zamiec', 'oblicza', 'smola'];
const shots = new Set(['sierpy', 'ogien', 'grom', 'ciupaga', 'wianek', 'proca', 'kruki', 'marzanna', 'zniwa', 'gniew', 'zamiec', 'smola']);
const results = [];
for (const id of weapons) {
  await fresh();
  await ev((id) => {
    const g = window.__mb; const d = g.debug;
    d.time(200); d.only(id);
    d.ring('utopiec', 26, 7); d.ring('chochlik', 20, 10); d.ring('kruk', 10, 12);
  }, id);
  await sleep(shots.has(id) ? 2300 : 3200);
  if (shots.has(id)) await shot(page, `04-bron-${id}.png`);
  await sleep(shots.has(id) ? 900 : 0);
  const r = await ev(() => { const w = window.__mb.world; return { dealt: Math.round(w.weapons[0].dealt), kills: w.kills, name: w.weapons[0].def.name }; });
  results.push(`${r.name}: ${r.dealt} dmg, ${r.kills} zabitych`);
}
console.log(results.join('\n'));

// --- 3. mini-bosses and boss
for (const [id, file, wait] of [['jaga', '04-baba-jaga.png', 5200], ['poludnica', '04-poludnica.png', 5200], ['leszy', '04-leszy.png', 7000]]) {
  await fresh();
  await ev((id) => {
    const g = window.__mb; const d = g.debug;
    d.time(id === 'leszy' ? 480 : 200);
    d.only('sierpy', 'ogien');
    d.spawn(id, 1, id === 'leszy' ? 14 : 10);
    g.gfx.camPitch = 0.3;
  }, id);
  await sleep(wait);
  const st = await ev(() => { const w = window.__mb.world; let hz = 0; for (let i = 0; i < w.hazards.n; i++) if (w.hazards.alive[i]) hz++; return { boss: w.bossIdx, hazards: hz, hp: w.bossIdx >= 0 ? Math.round(w.enemies.hp[w.bossIdx]) : 0, alive: w.enemies.count }; });
  console.log(id, JSON.stringify(st));
  await shot(page, file);
}
// Leszy: force phase 3 and let the bot fight to the kill (victory screen).
await ev(() => { const g = window.__mb; const w = g.world; w.enemies.hp[w.bossIdx] = w.enemies.maxHp[w.bossIdx] * 0.3; g.debug.only('zniwa', 'slonce', 'gniew', 'topor'); g.setBot('good'); });
await sleep(3500);
await shot(page, '04-leszy-faza3.png');
await ev(() => { const w = window.__mb.world; w.enemies.hp[w.bossIdx] = 50; });
await sleep(5200);
console.log('after boss kill', await ev(() => ({ state: window.__mb.state, won: window.__mb.world.won })));
await shot(page, '04-zwyciestwo.png');

// --- 4. chest (paid) and shrine
await fresh();
await ev(() => {
  const g = window.__mb; const w = g.world; const c = w.chests[0];
  g.debug.gold(100); g.debug.teleport(c.x + 1.2, c.z + 0.5);
});
await sleep(400);
await shot(page, '04-skrzynia-prompt.png');
await hold(page, 'KeyE', 800);
console.log('chest', await ev(() => { const w = window.__mb.world; return { state: window.__mb.state, choice: w.choice?.type, card: w.choice?.cards?.[0]?.name, gold: Math.floor(w.gold) }; }));
await shot(page, '04-skrzynia.png');
await page.keyboard.press('Enter');
await sleep(300);
await ev(() => { const g = window.__mb; const s = g.world.shrines[0]; g.debug.teleport(s.x + 1.8, s.z + 1.2); });
await sleep(300);
await hold(page, 'KeyE', 1300);
console.log('shrine', await ev(() => ({ state: window.__mb.state, choice: window.__mb.world.choice?.type })));
await shot(page, '04-kapliczka.png');
await page.keyboard.press('Digit1');
await sleep(300);
console.log('blessing', await ev(() => { const w = window.__mb.world; return { blessings: w.blessings.map((b) => b.id), used: w.shrines[0].used, dmg: w.stats.damage }; }));
report(errors);
await browser.close();
