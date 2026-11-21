// Random forest per run, rich chests of the landmarks, the haste pickup and the surge countdown.
import { launch, URL, sleep, shot, report } from '../lib/browser.mjs';
const { browser, page, errors } = await launch({ width: 1600, height: 900 });
const ev = (fn, arg) => page.evaluate(fn, arg);
await page.goto(`${URL}?autostart=1`);
await sleep(1500);

const face = (x, z, dist, side = 2) =>
  ev(
    ([x, z, dist, side]) => {
      const g = window.__mb;
      const p = g.world.player;
      const d = Math.hypot(x - p.x, z - p.z) || 1;
      const dx = (x - p.x) / d;
      const dz = (z - p.z) / d;
      g.debug.teleport(x - dx * dist + dz * side, z - dz * dist - dx * side);
      g.gfx.camYaw = Math.atan2(-dx, -dz);
      g.gfx.camPitch = 0.3;
    },
    [x, z, dist, side],
  );
const layout = () => ev(() => { const m = window.__mb.map; return { seed: m.seed, places: m.landmarks.map((l) => `${l.kind}:${Math.round(l.x)},${Math.round(l.z)}`).join(' '), near: m.chestSpots.filter((c) => Math.hypot(c.x, c.z) < 26).map((c) => `${Math.round(c.x)},${Math.round(c.z)}`).join(' ') }; });

// --- 1. every run rolls a new forest
console.log('run 1', await layout());
for (let k = 2; k <= 3; k++) {
  const ms = await ev(() => { const t = performance.now(); window.__mb.startRun('wojmir'); return Math.round(performance.now() - t); });
  await sleep(1200);
  console.log(`run ${k} (startRun ${ms} ms)`, await layout());
}
console.log('gpu memory', await ev(() => window.__mb.gfx.renderer.info.memory));
await ev(() => { const g = window.__mb; g.debug.spawner(false); g.debug.clearEnemies(); g.world.godMode = true; });
await sleep(400);
await shot(page, '20-losowy-bor-start.png');

// --- 2. the rich chest of a landmark
const chest = await ev(() => { const w = window.__mb.world; const c = w.chests.find((x) => x.rich); w.gold = 300; return { x: c.x, z: c.z }; });
await face(chest.x, chest.z, 7, 1.5);
await sleep(900);
await shot(page, '20-bogata-skrzynia.png');
await face(chest.x, chest.z, 1.6, 0.4);
await sleep(300);
await shot(page, '20-bogata-skrzynia-podpowiedz.png');
// A screenshot can blur the page a moment later and drop the held key: try until the chest opens.
for (let k = 0; k < 5 && !(await ev(() => !!window.__mb.world.choice)); k++) {
  await sleep(400);
  await page.keyboard.down('KeyE');
  await sleep(900);
  await page.keyboard.up('KeyE');
}
await sleep(500);
console.log('rich chest', await ev(() => { const c = window.__mb.world.choice; return c && { type: c.type, rich: c.rich, cards: c.cards.map((x) => `${x.name} (${x.rarity})`) }; }));
await shot(page, '20-bogata-skrzynia-skarby.png');
const before = await ev(() => window.__mb.world.items.reduce((n, i) => n + i.count, 0));
for (let k = 0; k < 5 && (await ev(() => !!window.__mb.world.choice)); k++) {
  await sleep(400);
  await page.keyboard.press('Enter');
}
await sleep(400);
console.log('items taken', (await ev(() => window.__mb.world.items.reduce((n, i) => n + i.count, 0))) - before);

// --- 3. haste pickup
const haste = await ev(() => {
  const g = window.__mb; const w = g.world; const ok = g.debug.haste(); const k = w.pickups;
  for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === 4) return { ok, x: k.x[i], z: k.z[i] };
  return { ok };
});
console.log('haste dropped', haste);
await face(haste.x, haste.z, 7, 1.5);
await sleep(800);
await shot(page, '20-szal-znajdzka.png');
const as0 = await ev(() => window.__mb.world.stats.attackSpeed);
await ev(([x, z]) => window.__mb.debug.teleport(x - 0.6, z), [haste.x, haste.z]);
await sleep(700);
console.log('haste', await ev(() => { const w = window.__mb.world; return { left: +w.hasteT.toFixed(1), attackSpeed: w.stats.attackSpeed }; }), 'before', as0);
await shot(page, '20-szal-aktywny.png');
await ev(() => { window.__mb.mapHeld = true; window.__mb.debug.haste(); });
await sleep(500);
await shot(page, '20-mapa-bogate-skrzynie.png');
await ev(() => { window.__mb.mapHeld = false; });

// --- 4. surge countdown and the final wave
// The bot plays from here, so level-up cards do not stop the clock.
await ev(() => { const g = window.__mb; g.debug.teleport(0, 0); g.debug.spawner(true); g.world.bonuses.disabled = true; g.setBot('good'); g.debug.time(149); });
await sleep(6000);
console.log('surge', await ev(() => ({ t: +window.__mb.world.time.toFixed(1), hud: document.querySelector('.surge').innerText, hidden: document.querySelector('.surge').classList.contains('hidden') })));
await shot(page, '20-fala-odliczanie.png');
await ev(() => window.__mb.debug.time(178.5));
await sleep(5200);
console.log('after surge', await ev(() => ({ t: +window.__mb.world.time.toFixed(1), hidden: document.querySelector('.surge').classList.contains('hidden') })));
await shot(page, '20-fala-koniec.png');
await ev(() => window.__mb.debug.time(481));
await sleep(1500);
console.log('final wave', await ev(() => ({ hud: document.querySelector('.surge').innerText, hidden: document.querySelector('.surge').classList.contains('hidden') })));
await shot(page, '20-fala-koncowa.png');
report(errors);
await browser.close();
