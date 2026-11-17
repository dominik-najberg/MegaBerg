import './ui/styles.css';
import { Game } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
game.start();

// Debug handle for automated playtests (see docs/DECISIONS.md).
(window as unknown as { __mb: Game }).__mb = game;
