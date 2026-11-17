import './ui/styles.css';
import { Game } from './game';

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
  const game = new Game(canvas, overlay, ui);
  game.start();

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
