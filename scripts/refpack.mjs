// Reference pack: clean, repeatable screenshots of the game for style work (AI paintovers, model sheets).
//
//   npm run refpack                      everything
//   npm run refpack -- wrogowie,walka    only the named groups
//
// Groups:
//   wrogowie     every enemy on a neutral backdrop (front, three-quarter, side, back) and staged in the forest
//   bohaterowie  every hero, the same four views
//   scenerie     the clearing, every named place, a swamp pool, a bonfire and a shrine at dusk, twilight and night
//   walka        a bot run with a fixed seed at three moments, without the interface (plus one frame with it)
//
// MB_ONLY=<id> limits the `wrogowie` and `bohaterowie` groups to one model (the concept editor uses it
// to show a freshly rebuilt model to the agent that built it); MB_PORT moves the private dev server.
//
// Output goes to concepts/zrzuty/ (override with MB_OUT). The camera, the place and the time of day are fixed,
// so running it again after a graphics change gives frames that line up with the old ones.
// Starts its own dev server, so nothing has to be running; MB_URL points it at an existing one instead.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launch, sleep, report } from './lib/browser.mjs';

const GROUPS = ['wrogowie', 'bohaterowie', 'scenerie', 'walka'];
const wanted = (process.argv[2] || GROUPS.join(',')).split(',').filter(Boolean);
const unknown = wanted.filter((g) => !GROUPS.includes(g));
if (unknown.length > 0) {
  console.error(`Nieznana grupa: ${unknown.join(', ')}. Dostępne: ${GROUPS.join(', ')}.`);
  process.exit(1);
}

const OUT = process.env.MB_OUT || new URL('../concepts/zrzuty/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 900;
/** Model sheets are cropped to the centre square: image models handle square subjects best. */
const SQUARE = { x: (W - H) / 2, y: 0, width: H, height: H };

const VIEWS = [
  ['przod', 0],
  ['trzy-czwarte', 0.7],
  ['bok', Math.PI / 2],
  ['tyl', Math.PI],
];
const TIMES = [
  ['zmierzch', 0],
  ['zmrok', 255],
  ['noc', 510],
];

// ------------------------------------------------------------------ server + browser

/**
 * A private dev server with hot reload and file watching off: a file saved in the middle of a run
 * (an editor, another session) must not reload the page and wreck the staged scene.
 */
async function startServer() {
  if (process.env.MB_URL) return { url: process.env.MB_URL, close: async () => undefined };
  const { createServer } = await import('vite');
  const server = await createServer({ logLevel: 'error', server: { port: Number(process.env.MB_PORT) || 5199, hmr: false, watch: null } });
  await server.listen();
  return { url: server.resolvedUrls.local[0], close: () => server.close() };
}

const server = await startServer();
const { browser, page, errors } = await launch({ width: W, height: H });
const ev = (fn, arg) => page.evaluate(fn, arg);
let count = 0;
/** Page loads we did not ask for (only possible with MB_URL and a hot-reloading server). */
let loads = 0;
let expectedLoads = 0;
page.on('load', () => loads++);

async function open(query) {
  expectedLoads++;
  await page.goto(`${server.url}?autostart=1&${query}`);
  await page.waitForFunction(() => window.__mb !== undefined);
  await page.addStyleTag({ content: 'body.clean #ui, body.clean #overlay { opacity: 0 !important; }' });
  await ev(() => {
    const g = window.__mb;
    document.body.classList.add('clean');
    g.store.data.options.quality = 2;
    g.gfx.applyQuality(2);
    g.gfx.shakeEnabled = false;
  });
  await sleep(1200);
}

/** Lets the renderer draw a few frames so camera, light and freshly compiled shaders settle. */
async function settle(ms = 350) {
  await sleep(ms);
  await ev(() => new Promise((done) => {
    let n = 0;
    const frame = () => (++n >= 4 ? done() : requestAnimationFrame(frame));
    requestAnimationFrame(frame);
  }));
}

async function shoot(name, clip) {
  if (loads !== expectedLoads) throw new Error('Strona przeładowała się w trakcie (serwer wykrył zmianę plików). Uruchom ponownie.');
  await page.screenshot({ path: join(OUT, `${name}.png`), clip });
  count++;
  console.log('zrzut', `${name}.png`);
}

/** Stops the simulation (rendering goes on) and empties the stage. */
async function freeze() {
  await ev(() => {
    const g = window.__mb;
    g.debug.god();
    g.debug.spawner(false);
    g.debug.only();
    g.debug.clearEnemies();
    g.debug.time(0);
  });
  // A few more steps so weapon effects and pickups of the first second are gone, then stop time.
  await sleep(500);
  await ev(() => {
    const g = window.__mb;
    g.debug.clearEnemies();
    g.loop.timeScale = 0;
  });
}

/** Neutral backdrop for model sheets: no terrain, plants, sky or fog; the light of dusk stays. */
async function studio(on) {
  await ev((on) => {
    const g = window.__mb.gfx;
    const Color = g.sky.fog.color.constructor;
    g.terrain.group.visible = !on;
    g.props.group.visible = !on;
    g.sky.mesh.visible = !on;
    g.fx.group.visible = !on;
    g.scene.fog = on ? null : g.sky.fog;
    g.scene.background = on ? new Color(0x8a8c94) : null;
    g.scene.traverse((o) => {
      if (o.material) o.material.needsUpdate = true;
    });
  }, on);
  await settle(600);
}

/** Puts the hero somewhere, standing still and facing `yaw`. */
async function placeHero(x, z, yaw) {
  await ev(({ x, z, yaw }) => {
    const g = window.__mb;
    g.debug.teleport(x, z);
    const p = g.world.player;
    p.vx = p.vy = p.vz = 0;
    p.yaw = yaw;
    g.gfx.focusInit = false;
  }, { x, z, yaw });
}

/** Real extent of an enemy model (the collision size in the data leaves out horns, wings and antlers). */
function sizeOf(id) {
  return ev((id) => {
    const v = window.__mb.gfx.enemies.views.find((v) => v.def.id === id);
    const geo = v.model.geo;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const b = geo.boundingBox;
    const s = v.def.scale;
    return {
      bottom: b.min.y * s,
      top: b.max.y * s,
      wide: Math.max(-b.min.x, b.max.x, -b.min.z, b.max.z) * s,
      lift: v.def.flying ? 1.3 : 0,
      big: v.def.rank !== undefined,
    };
  }, id);
}

/** Spawns enemies of one type at the given spots, fully risen and facing `yaw`. Returns the ground height at the first. */
function spawnAt(id, spots, yaw) {
  return ev(({ id, spots, yaw }) => {
    const g = window.__mb;
    const w = g.world;
    const e = w.enemies;
    g.debug.clearEnemies();
    // Slot 0 has walk-cycle phase 0, so a single creature with its cycle stopped stands in the neutral pose.
    if (e.list.count === 0) e.list.reset();
    const type = g.gfx.enemies.views.findIndex((v) => v.def.id === id);
    let ground = 0;
    spots.forEach(([x, z], k) => {
      const i = w.spawnEnemy(type, x, z);
      e.spawnT[i] = 0;
      e.yaw[i] = yaw;
      // Time stands still, so the renderer keeps blending "previous" and "current": make them the same height.
      e.py[i] = e.y[i] + e.oy[i];
      if (k === 0) ground = e.y[i];
    });
    return ground;
  }, { id, spots, yaw });
}

/** Direction (as a model yaw) from which the scene light comes at dusk. */
const lightYaw = () => ev(() => Math.atan2(window.__mb.gfx.sky.lightDir.x, window.__mb.gfx.sky.lightDir.z));

/**
 * Four views of a subject standing at (x, z) and facing `facing`; `bottom`/`top` are its vertical extent
 * and `wide` its largest horizontal reach from the axis. The camera distance fits the whole model.
 */
async function turnaround(prefix, { x, z, bottom, top, wide, facing, hideHero }) {
  const r = Math.max((top - bottom) / 2, wide);
  const dist = (r * 1.2) / Math.tan((31 * Math.PI) / 180) + wide * 0.6;
  for (const [view, turn] of VIEWS) {
    await ev((s) => {
      const g = window.__mb.gfx;
      g.photo = { x: s.x, y: (s.bottom + s.top) / 2, z: s.z, hideHero: s.hideHero };
      g.camYaw = s.yaw;
      g.camPitch = 0.1;
      g.camDist = s.dist;
    }, { x, z, bottom, top, yaw: facing + turn, dist, hideHero });
    await settle(150);
    await shoot(`${prefix}-${view}`, SQUARE);
  }
}

async function gameCamera() {
  await ev(() => {
    const g = window.__mb.gfx;
    g.photo = null;
    g.camYaw = 0;
    g.camPitch = 0.36;
    g.camDist = 9;
  });
}

const enemyIds = () => ev(() => window.__mb.gfx.enemies.views.map((v) => v.def.id));

// ------------------------------------------------------------------ groups

/** Flat ground in the middle of the starting clearing; the hero waits out of the light's reach. */
const STAGE = { x: 0, z: 0 };

/** MB_ONLY narrows a group to one model; an id the group does not have leaves it empty. */
const only = (id) => !process.env.MB_ONLY || id === process.env.MB_ONLY;

async function enemies() {
  const ids = (await enemyIds()).filter(only);
  // Subjects face a little off the light, so the front is lit and still has shading.
  const facing = (await lightYaw()) + 0.5;
  await placeHero(STAGE.x + 34, STAGE.z, 0);
  await studio(true);
  // Walk cycles stop on the neutral pose, which is what a model sheet needs.
  await ev(() => {
    for (const v of window.__mb.gfx.enemies.views) v.uniforms.uCycle.value = 0;
  });
  for (const id of ids) {
    const size = await sizeOf(id);
    const ground = (await spawnAt(id, [[STAGE.x, STAGE.z]], facing)) + size.lift;
    await turnaround(`wrog-${id}`, { x: STAGE.x, z: STAGE.z, bottom: ground + size.bottom, top: ground + size.top, wide: size.wide, facing, hideHero: true });
  }
  await ev(() => {
    for (const v of window.__mb.gfx.enemies.views) v.uniforms.uCycle.value = v.model.cycle;
  });
  await studio(false);

  // The same creatures where they live: facing the hero, seen over his shoulder.
  const fx = -Math.sin(facing);
  const fz = -Math.cos(facing);
  const at = (along, side) => [STAGE.x + fx * along + fz * side, STAGE.z + fz * along - fx * side];
  await placeHero(STAGE.x, STAGE.z, facing + Math.PI);
  for (const id of ids) {
    const size = await sizeOf(id);
    const d = size.big ? 4 + size.wide * 2 : 3.6;
    const spots = size.big ? [at(d, 0)] : [at(d, -1.6), at(d + 1.1, 0.2), at(d - 0.3, 1.9)];
    const ground = await spawnAt(id, spots, facing);
    const [x, z] = at(d * 0.55, 0);
    await ev((s) => {
      const g = window.__mb.gfx;
      g.photo = { x: s.x, y: s.y, z: s.z };
      g.camYaw = s.yaw;
      g.camPitch = 0.26;
      g.camDist = s.dist;
    }, { x, z, y: ground + 1.1 + (size.big ? size.top * 0.22 : 0), yaw: facing + 0.5, dist: 4.2 + d * 0.7 + (size.big ? size.top * 0.55 : 0) });
    await settle(500);
    await shoot(`wrog-${id}-w-grze`);
  }
  await ev(() => window.__mb.debug.clearEnemies());
  await gameCamera();
}

async function heroes() {
  // Looks come straight from the data file (dev server only): locked heroes need no save game.
  const looks = await ev(async () => {
    const m = await import('/src/data/characters.ts');
    return m.CHARACTERS.map((c) => ({ id: c.id, look: c.look }));
  });
  const first = looks[0].look;
  const facing = (await lightYaw()) + 0.5;
  await placeHero(STAGE.x, STAGE.z, facing);
  await studio(true);
  for (const { id, look } of looks.filter((l) => only(l.id))) {
    const ground = await ev((look) => {
      const g = window.__mb;
      g.gfx.hero.setLook(look);
      return g.world.player.y;
    }, look);
    await turnaround(`bohater-${id}`, { x: STAGE.x, z: STAGE.z, bottom: ground, top: ground + 2.1, wide: 0.75, facing, hideHero: false });
  }
  await ev((look) => window.__mb.gfx.hero.setLook(look), first);
  await studio(false);
}

async function scenery() {
  const places = await ev(() => {
    const map = window.__mb.map;
    const slug = { idol: 'posag-swietowita', lake: 'jezioro', circle: 'kamienny-krag', oak: 'swiety-dab', barrow: 'kurhan', hut: 'chata-na-kurzej-stopce' };
    const out = [{ name: 'polana', x: 0, z: -8, r: 0 }];
    for (const l of map.landmarks) out.push({ name: slug[l.kind], x: l.x, z: l.z, r: l.r });
    const pool = map.puddles.filter((p) => p.r < 8).sort((a, b) => b.r - a.r)[0];
    if (pool) out.push({ name: 'bagno', x: pool.x, z: pool.z, r: pool.r });
    const nearest = (list) => [...list].sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z))[0];
    const fire = nearest(map.bonfires);
    if (fire) out.push({ name: 'ognisko', x: fire.x, z: fire.z, r: 0 });
    const shrine = nearest(map.shrines);
    if (shrine) out.push({ name: 'kapliczka', x: shrine.x, z: shrine.z, r: 0 });
    // The hero stands on the side the trail comes from (the map centre), clear of trees and rocks.
    for (const p of out) {
      const d = Math.hypot(p.x, p.z) || 1;
      const back = p.r + 7;
      let hx = p.x - (p.x / d) * back;
      let hz = p.z - (p.z / d) * back;
      if (map.resolveCircle(hx, hz, 0.8)) {
        hx = map.outX;
        hz = map.outZ;
      }
      p.hx = hx;
      p.hz = hz;
    }
    return out;
  });
  await gameCamera();
  for (const p of places) {
    const toward = Math.atan2(p.x - p.hx, p.z - p.hz);
    await placeHero(p.hx, p.hz, toward);
    await ev((yaw) => {
      const g = window.__mb.gfx;
      g.camYaw = yaw;
      g.camPitch = 0.3;
    }, toward + Math.PI);
    // Scenery around the new spot is streamed in over a few frames.
    await settle(1500);
    for (const [label, seconds] of TIMES) {
      await ev((t) => window.__mb.debug.time(t), seconds);
      await settle(300);
      await shoot(`sceneria-${p.name}-${label}`);
    }
  }
  await ev(() => window.__mb.debug.time(0));
}

async function combat() {
  await open('bot=good');
  // The run that autostarted has a random seed. Start it over with a fixed one and step it by hand:
  // simulation and bot are deterministic, so the same moments show the same fight every time.
  await ev(() => {
    const g = window.__mb;
    g.loop.timeScale = 0;
    const now = Date.now;
    const random = Math.random;
    Date.now = () => 20261119;
    Math.random = () => 0;
    try {
      g.startRun('wojmir');
    } finally {
      Date.now = now;
      Math.random = random;
    }
    g.setBot('good');
    g.debug.god();
    for (const id of ['ogien', 'grom', 'wianek']) g.debug.give(id, 2);
  });
  for (const t of [150, 400, 612]) {
    // In slices, so the page renders in between and effects do not pile up.
    while (await ev((t) => {
      const g = window.__mb;
      const left = t - g.world.time;
      if (left > 1 / 120) g.loop.advance(Math.min(5, left));
      return t - g.world.time > 1 / 120;
    }, t));
    // One more second frame by frame: effects started in the fast-forward get to play out.
    await ev(() => {
      for (let i = 0; i < 60; i++) window.__mb.loop.advance(1 / 60);
    });
    await settle(100);
    await shoot(`walka-${t}s`);
    if (t === 400) {
      await ev(() => document.body.classList.remove('clean'));
      await shoot(`walka-${t}s-interfejs`);
      await ev(() => document.body.classList.add('clean'));
    }
  }
}

// ------------------------------------------------------------------ run

try {
  if (wanted.some((g) => g !== 'walka')) {
    await open('char=wojmir');
    await freeze();
    if (wanted.includes('wrogowie')) await enemies();
    if (wanted.includes('bohaterowie')) await heroes();
    if (wanted.includes('scenerie')) await scenery();
  }
  if (wanted.includes('walka')) await combat();
  console.log(`\n${count} zrzutów w ${OUT}`);
  report(errors);
} finally {
  await browser.close();
  await server.close();
}
