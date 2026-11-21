// Etapy B–D z docs/BRONIE-PLAN.md: nowe bronie w Arsenale, każda w walce (zrzut, obrażenia, zabójstwa na jej konto),
// ewolucje, sekret Krzywuli i jej zakup w Skarbcu.
// Usage: MB_URL=http://localhost:5173/ node scripts/verify/bronie.mjs
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);

// --- Arsenał: wszystko odblokowane
await page.goto(URL);
await sleep(800);
await ev(() => {
  const s = window.__mb.store;
  s.reset();
  for (const id of ['luk', 'roj', 'wnyki', 'miotla', 'krzywula', 'wir', 'studnia', 'szabla', 'puklerz', 'winDobroslawa', 'wapierz', 'kostki', 'miecz', 'kosisko', 'jaga', 'survive3', 'level15', 'kills3000']) s.data.achievements.push(id);
  s.data.found.push('krzywula');
  s.data.silver = 30;
  s.save();
});
await page.goto(URL);
await sleep(800);
await page.click('[data-act="arsenal"]');
await sleep(200);
console.log('arsenał:', await ev(() => document.querySelectorAll('.arsenal-item').length), 'pozycji, zablokowanych:', await ev(() => document.querySelectorAll('.arsenal-item.locked').length));
await ev(() => document.querySelector('.arsenal-item:nth-last-child(4)')?.scrollIntoView());
await shot(page, '16-arsenal-pelny.png');

// --- Skarbiec: Krzywula do kupienia za srebro
await page.goto(URL);
await sleep(600);
console.log('krzywula w puli przed zakupem:', await ev(() => window.__mb.world.weaponPool.has('krzywula')));
await ev(() => window.__mb.buy('weapon:krzywula'));
console.log('kupiona:', await ev(() => window.__mb.store.data.bought.includes('weapon:krzywula')), 'srebro:', await ev(() => window.__mb.store.data.silver));

// --- Walka: bronie w trzech zestawach po cztery, potem ich ewolucje
const sets = [
  ['miotla', 'wnyki', 'puklerz', 'kosisko'],
  ['miecz', 'szabla', 'studnia', 'wir'],
  ['roj', 'krzywula', 'wrzeciono', 'wapierz'],
  ['kostki', 'luk'],
];
let n = 0;
for (const set of sets) {
  n++;
  await page.goto(`${URL}?autostart=1&bot=good&speed=4`);
  await sleep(1500);
  await ev((ids) => {
    const w = window.__mb.world;
    w.weapons.length = 0;
    for (const id of ids) {
      const inst = w.addWeapon(id);
      inst.level = 5;
      w.refreshWeapon(inst);
    }
  }, set);
  for (let k = 0; k < 240; k++) {
    await sleep(250);
    // Zdrowie odnawiane zamiast nieśmiertelności: puklerz blokuje tylko prawdziwe ciosy.
    if ((await ev(() => { const w = window.__mb.world; w.player.hp = w.stats.maxHp; w.choice && w.choose(0); return w.time; })) > 110) break;
  }
  await ev(() => { window.__mb.loop.timeScale = 1; });
  await sleep(1200);
  await shot(page, `17-bronie-${n}.png`);
  console.log(set.join(', '), await ev(() => { const w = window.__mb.world; return JSON.stringify({ t: Math.round(w.time), kills: w.kills, byWeapon: w.killsByWeapon, dealt: Object.fromEntries(w.weapons.map((x) => [x.def.id, Math.round(x.dealt)])), blocks: w.guardBlocks, runHp: w.runHp, runCrit: +w.runCrit.toFixed(3), zones: w.zones.list.count, proj: w.projectiles.list.count }); }));
  // Ewolucje tego zestawu.
  await ev(() => { const w = window.__mb.world; for (const inst of w.weapons) w.evolveWeapon(inst); w.choice = null; window.__mb.loop.timeScale = 4; });
  for (let k = 0; k < 160; k++) {
    await sleep(250);
    if ((await ev(() => { const w = window.__mb.world; w.player.hp = w.stats.maxHp; return w.time; })) > 150) break;
  }
  await ev(() => { window.__mb.loop.timeScale = 1; });
  await sleep(1200);
  await shot(page, `18-ewolucje-${n}.png`);
  console.log('  ewolucje:', await ev(() => { const w = window.__mb.world; return JSON.stringify({ t: Math.round(w.time), kills: w.kills, dealt: Object.fromEntries(w.weapons.map((x) => [x.def.id, Math.round(x.dealt)])), zones: w.zones.list.count, proj: w.projectiles.list.count }); }));
}

// --- Puklerz: dobry bot rzadko obrywa, więc cios zadajemy sami
await page.goto(`${URL}?autostart=1&bot=good`);
await sleep(1500);
await ev(() => { const w = window.__mb.world; w.weapons.length = 0; const i = w.addWeapon('puklerz'); i.timer = 0; w.time = 60; });
await sleep(6000);
const before = await ev(() => { const w = window.__mb.world; w.player.invuln = 0; const hp = w.player.hp; w.hurtPlayer(30); return { hp, after: w.player.hp, blocks: w.guardBlocks, dealt: Math.round(w.weapons[0].dealt) }; });
await sleep(60);
await shot(page, '17-puklerz-blok.png');
console.log('puklerz:', JSON.stringify(before));

// --- Sekret: kij pod dębem
await ev(() => { const s = window.__mb.store; s.data.found = []; s.data.bought = []; s.save(); });
await page.goto(`${URL}?autostart=1`);
await sleep(1500);
const sec = await ev(() => { const w = window.__mb.world; w.godMode = true; w.spawner.disabled = true; const s = w.secret; if (!s) return null; w.player.x = s.x + 5; w.player.z = s.z + 5; w.player.y = s.y; return { x: Math.round(s.x), z: Math.round(s.z) }; });
console.log('sekret:', sec);
await sleep(1500);
await shot(page, '19-sekret-pod-debem.png');
await ev(() => { const w = window.__mb.world; w.player.x = w.secret.x + 0.5; w.player.z = w.secret.z; });
await sleep(600);
console.log('znaleziony:', await ev(() => window.__mb.world.secrets), 'w zapisie:', await ev(() => window.__mb.store.data.found));
report(errors);
await browser.close();
