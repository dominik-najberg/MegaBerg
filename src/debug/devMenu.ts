import type { Game } from '../game';
import { ACHIEVEMENTS } from '../data/achievements';
import { unlockAll } from '../meta/progress';

/** The concept editor exists only on the dev server (tools/edytor/plugin.ts), never in the production build. */
const EDITOR_AVAILABLE = import.meta.env.DEV;

/**
 * Hidden developer menu under the ~ key (KeyboardEvent.code 'Backquote').
 * Opening it mid-run pauses the game; closing it resumes the run it paused.
 */
export class DevMenu {
  private readonly el: HTMLElement;
  private pausedRun = false;
  /** Immortality outlives a single run: every new world gets it from here. */
  god = false;
  open = false;

  constructor(
    root: HTMLElement,
    private readonly game: Game,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'devmenu hidden';
    root.appendChild(this.el);
    this.el.addEventListener('click', (ev) => {
      // A click on the backdrop (outside the box) closes the menu, so the screen below never takes it.
      if (ev.target === this.el) {
        this.close();
        return;
      }
      const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-dev]');
      if (b && !b.hasAttribute('disabled')) this.act(b.dataset.dev ?? '');
    });
  }

  /** Handles the keys the menu owns; returns true when the key was consumed. */
  key(code: string): boolean {
    if (code === 'Backquote') {
      this.toggle();
      return true;
    }
    if (this.open && code === 'Escape') {
      this.close();
      return true;
    }
    return false;
  }

  toggle(): void {
    if (this.open) this.close();
    else this.show();
  }

  show(): void {
    this.open = true;
    if (this.game.state === 'playing') {
      this.game.pause();
      this.pausedRun = true;
    }
    this.render();
    this.el.classList.remove('hidden');
  }

  close(): void {
    this.open = false;
    this.el.classList.add('hidden');
    if (this.pausedRun && this.game.state === 'paused') this.game.resume();
    this.pausedRun = false;
  }

  private inRun(): boolean {
    const s = this.game.state;
    return s === 'playing' || s === 'paused' || s === 'choice';
  }

  private act(id: string): void {
    const g = this.game;
    const w = g.world;
    switch (id) {
      case 'god':
        this.god = !this.god;
        w.godMode = this.god;
        g.ui.toast(this.god ? 'Dev: nieśmiertelność włączona.' : 'Dev: nieśmiertelność wyłączona.');
        break;
      case 'gold':
        if (this.inRun()) {
          w.gold += 1000;
          g.ui.toast('Dev: +1000 złota w tym runie.');
        } else {
          g.store.data.gold += 1000;
          this.saveMeta();
          g.ui.toast('Dev: +1000 złota do Chaty.');
        }
        break;
      case 'silver':
        g.store.data.silver += 100;
        this.saveMeta();
        g.ui.toast('Dev: +100 srebra.');
        break;
      case 'lvl1':
      case 'lvl5': {
        if (!this.inRun() || w.dead) return;
        const n = id === 'lvl5' ? 5 : 1;
        // Exactly one level per step, regardless of XP-gain bonuses and curses.
        for (let k = 0; k < n; k++) {
          w.xp = w.xpNeed;
          w.gainXp(0);
        }
        g.ui.toast(`Dev: +${n} ${n === 1 ? 'poziom' : 'poziomów'} (karty po zamknięciu menu).`);
        break;
      }
      case 'unlock': {
        const n = unlockAll(g.store.data);
        this.saveMeta();
        g.ui.toast(n ? `Dev: odblokowano wszystko${this.inRun() ? ' (od następnego runu)' : ''}.` : 'Dev: wszystko już było odblokowane.');
        break;
      }
      case 'editor':
        if (EDITOR_AVAILABLE) window.open('/edytor', '_blank', 'noopener');
        break;
      case 'close':
        this.close();
        return;
    }
    g.audio.ui('click');
    this.render();
  }

  private saveMeta(): void {
    const g = this.game;
    g.store.save();
    g.ui.save = g.store.data;
    const screen = g.ui.screen;
    if (screen === 'shop') g.ui.showShop();
    else if (screen === 'characters') g.ui.showCharacters();
    else if (screen === 'achievements') g.ui.showAchievements();
    else if (screen === 'arsenal') g.ui.showArsenal();
    else if (screen === 'menu') g.ui.showMenu();
  }

  private render(): void {
    const run = this.inRun();
    const lvlOff = run && !this.game.world.dead ? '' : ' disabled';
    const editorOff = EDITOR_AVAILABLE ? '' : ' disabled';
    const s = this.game.store.data;
    this.el.innerHTML = `
      <div class="devmenu-box">
        <div class="devmenu-head"><b>Menu dewelopera</b><kbd>~</kbd></div>
        <button class="devmenu-row${this.god ? ' on' : ''}" data-dev="god">Nieśmiertelność <span>${this.god ? 'WŁ' : 'WYŁ'}</span></button>
        <button class="devmenu-row" data-dev="gold">+1000 złota <span>${run ? 'run' : `Chata: ${s.gold}`}</span></button>
        <button class="devmenu-row" data-dev="silver">+100 srebra <span>${s.silver}</span></button>
        <button class="devmenu-row" data-dev="lvl1"${lvlOff}>+1 poziom <span>${run ? `poz. ${this.game.world.level}` : 'tylko w runie'}</span></button>
        <button class="devmenu-row" data-dev="lvl5"${lvlOff}>+5 poziomów</button>
        <button class="devmenu-row" data-dev="unlock">Odblokuj wszystko <span>${s.achievements.length}/${ACHIEVEMENTS.length} osiągn.</span></button>
        <button class="devmenu-row" data-dev="editor"${editorOff}>Edytor konceptów <span>${EDITOR_AVAILABLE ? 'nowa karta' : 'tylko npm run dev'}</span></button>
        <button class="devmenu-row close" data-dev="close">Zamknij <span>Esc</span></button>
      </div>`;
  }
}
