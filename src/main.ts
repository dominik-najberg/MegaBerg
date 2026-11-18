import './ui/styles.css';
import splashUrl from './assets/ui/splash.jpg';
import { Game } from './game';
import { loadAssets } from './render/assets';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

const canvas = document.getElementById('game') as HTMLCanvasElement;
const overlay = document.getElementById('overlay') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLElement;

if (!hasWebGL()) {
  ui.innerHTML =
    '<div class="panel dim"><div class="sheet narrow"><h2>Brak WebGL</h2><p class="lead">Ta przeglądarka nie udostępnia WebGL, więc gra 3D nie może się uruchomić. Otwórz grę w aktualnym Chrome, Firefoksie lub Edge z włączoną akceleracją sprzętową.</p></div></div>';
} else {
  // Loading screen: key art with a thin progress bar while textures and models arrive.
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.style.backgroundImage = `url(${splashUrl})`;
  loading.innerHTML = '<div class="loading-box"><h1>MegaBerg</h1><h2>Słowiańskie Bory</h2><div class="loading-bar"><i></i></div><p>Bór się budzi…</p></div>';
  document.body.appendChild(loading);
  const bar = loading.querySelector('i') as HTMLElement;
  try {
    await loadAssets((done, total) => (bar.style.width = `${Math.round((done / total) * 100)}%`));
  } catch (err) {
    loading.querySelector('p')!.textContent = 'Nie udało się wczytać plików gry. Odśwież stronę (F5).';
    throw err;
  }
  const game = new Game(canvas, overlay, ui);
  game.start();
  loading.classList.add('done');
  setTimeout(() => loading.remove(), 700);

  // Debug handle + URL switches for automated playtests (see docs/DECISIONS.md):
  //   ?autostart=1&char=wojmir   skip the menu
  //   ?bot=good|novice           autopilot
  //   ?speed=4                   simulation speed multiplier
  //   ?force=500                 keep N enemies alive (performance test)
  (window as unknown as { __mb: Game }).__mb = game;
  const q = new URLSearchParams(location.search);
  if (q.get('autostart')) game.startRun(q.get('char') ?? game.store.data.character);
  const bot = q.get('bot');
  if (bot === 'good' || bot === 'novice') game.setBot(bot);
  const speed = Number(q.get('speed'));
  if (speed > 0) game.loop.timeScale = speed;
  const force = Number(q.get('force'));
  if (force > 0) game.world.spawner.forceAlive = force;
}
