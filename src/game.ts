import { AudioSys } from './audio/audio';
import { Input } from './core/input';
import { Loop } from './core/loop';
import { CHARACTER_BY_ID, CHARACTERS } from './data/characters';
import type { CharacterDef } from './data/types';
import { RUN_LENGTH } from './data/waves';
import { Bot, type BotSkill } from './debug/bot';
import { DebugTools } from './debug/tools';
import { applyRun, buyShopItem, buySilver, grantFromTotals, isUnlocked, runPool, togglePool, type PoolKind } from './meta/progress';
import { browserStorage, SaveStore } from './meta/save';
import { Gfx, type Quality } from './render/gfx';
import { emptyInput } from './sim/player';
import { GameMap } from './sim/terrain';
import { World } from './sim/world';
import { MapScreen } from './ui/mapScreen';
import { UI } from './ui/ui';

type State = 'menu' | 'playing' | 'paused' | 'choice' | 'ending' | 'end';

/** Glue between input, simulation, rendering, audio, UI and persistent progress. */
export class Game {
  readonly input: Input;
  readonly map = new GameMap();
  readonly gfx: Gfx;
  readonly loop: Loop;
  readonly audio = new AudioSys();
  readonly store = new SaveStore(browserStorage());
  readonly ui: UI;
  readonly mapScreen: MapScreen;
  world: World;
  state: State = 'menu';
  bot: Bot | null = null;
  readonly debug = new DebugTools(this);
  private readonly simInput = emptyInput();
  private jumpQueued = false;
  private dashQueued = false;
  private hitstopT = 0;
  private endT = 0;
  private runSaved = false;
  private character: CharacterDef;
  /** When set, every frame waits for the GPU (gl.finish) so frame times include GPU work. Perf test only. */
  perfFinish = false;
  /** Keeps the map open without the key (automated screenshots). */
  mapHeld = false;
  /** Performance counters (see docs/PERF.md). */
  readonly perf = { frames: 0, simMs: 0, renderMs: 0, steps: 0, since: 0, worst: 0 };

  constructor(canvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.input = new Input(canvas);
    // An older save may already meet achievements added later (e.g. 5000 kills in total for Księga Dzika).
    if (grantFromTotals(this.store.data).length > 0) this.store.save();
    const o = this.store.data.options;
    this.gfx = new Gfx(canvas, overlayCanvas, this.map, o.quality as Quality);
    this.character = CHARACTER_BY_ID[this.store.data.character] ?? (CHARACTERS[0] as CharacterDef);
    this.world = this.makeWorld(true);
    this.ui = new UI(
      uiRoot,
      {
        start: (id) => this.startRun(id),
        choose: (i) => this.choose(i),
        reroll: () => this.reroll(),
        banish: (i: number) => this.banish(i),
        cancelChoice: () => this.cancelChoice(),
        resume: () => this.resume(),
        restart: () => this.startRun(this.character.id),
        endRun: () => this.finishRun(),
        toMenu: () => this.toMenu(),
        endless: () => this.continueEndless(),
        buy: (id) => this.buy(id),
        toggle: (kind, id) => this.toggle(kind, id),
        option: (k, v) => this.setOption(k, v),
        resetSave: () => this.resetSave(),
        uiSound: (k) => this.audio.ui(k),
      },
      this.store.data,
    );
    this.mapScreen = new MapScreen(uiRoot, this.map);
    this.applyOptions();
    this.loop = new Loop({ step: (dt) => this.step(dt), render: (a, dt) => this.render(a, dt) });

    canvas.addEventListener('click', () => {
      if (this.state === 'playing') this.input.requestLock();
    });
    window.addEventListener('pointerdown', () => this.audio.unlock());
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.state === 'playing' && !this.bot) this.pause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing' && !this.bot) this.pause();
    });
    this.input.onKey = (code) => this.onKey(code);
    canvas.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      // 'ending' is the short death/victory animation: the run is over but not banked yet.
      if (this.state === 'playing' || this.state === 'paused' || this.state === 'choice' || this.state === 'ending') this.bankRun();
      this.state = 'end';
      this.loop.stop();
      this.input.exitLock();
      this.ui.showContextLost();
    });
    this.toMenu();
  }

  start(): void {
    this.loop.start();
  }

  // ------------------------------------------------------------------ run lifecycle

  private makeWorld(idle: boolean): World {
    const save = this.store.data;
    const w = new World(this.map, {
      seed: (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
      character: this.character,
      shop: save.shop,
      weaponPool: runPool(save, 'w'),
      passivePool: runPool(save, 'b'),
      itemPool: runPool(save, 'i'),
    });
    if (idle) w.spawner.disabled = true;
    return w;
  }

  startRun(characterId: string): void {
    const c = CHARACTER_BY_ID[characterId];
    if (c && isUnlocked(this.store.data, c.unlock)) this.character = c;
    this.store.data.character = this.character.id;
    this.store.save();
    this.world = this.makeWorld(false);
    this.runSaved = false;
    this.hitstopT = 0;
    this.gfx.hero.setLook(this.character.look);
    this.gfx.resetRun();
    this.gfx.menuOrbit = false;
    this.gfx.camYaw = 0;
    this.gfx.camPitch = 0.36;
    this.ui.close();
    this.ui.resetHud();
    this.ui.setHud(true);
    this.state = 'playing';
    this.audio.unlock();
    this.audio.intensity = 0.3;
    this.input.clearPressed();
    this.input.requestLock();
    this.world.announce.push('Zapada zmierzch. Przetrwaj do świtu złych mocy!');
  }

  toMenu(): void {
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'choice') this.bankRun();
    this.state = 'menu';
    this.input.exitLock();
    this.world = this.makeWorld(true);
    this.gfx.hero.setLook(this.character.look);
    this.gfx.resetRun();
    this.gfx.menuOrbit = true;
    this.gfx.camPitch = 0.24;
    this.audio.intensity = 0.15;
    this.ui.setHud(false);
    this.ui.save = this.store.data;
    this.ui.showMenu();
  }

  /** Banks the current run into the save exactly once. */
  private bankRun(): ReturnType<typeof applyRun> | null {
    if (this.runSaved) return null;
    this.runSaved = true;
    const res = applyRun(this.store.data, this.world.summary());
    if (!this.store.save()) this.ui.toast('Nie udało się zapisać postępu (pamięć przeglądarki niedostępna).');
    return res;
  }

  /** Ends the run now (death, victory or "Zakończ run") and shows the summary. */
  finishRun(): void {
    const summary = this.world.summary();
    const res = this.bankRun() ?? { goldBanked: 0, goldBonus: 0, silver: 0, unlocked: [] };
    this.state = 'end';
    this.input.exitLock();
    this.ui.setHud(false);
    this.ui.save = this.store.data;
    this.ui.showEnd(summary, res, this.world.won && !this.world.dead);
    this.audio.intensity = 0.15;
  }

  private continueEndless(): void {
    // The win was already banked; further gold and kills of the endless part are banked as a second entry.
    this.world.startEndless();
    this.runSaved = false;
    this.ui.close();
    this.ui.setHud(true);
    this.state = 'playing';
    this.input.requestLock();
    this.world.announce.push('Tryb nieskończony: bór nie zna litości.');
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.exitLock();
    this.ui.showPause(this.world);
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.close();
    this.input.clearPressed();
    this.input.requestLock();
  }

  private choose(i: number): void {
    if (this.state !== 'choice') return;
    this.audio.ui('card');
    this.world.choose(i);
    this.afterChoice();
  }

  private reroll(): void {
    if (this.state !== 'choice') return;
    if (this.world.reroll()) {
      this.audio.ui('click');
      this.ui.showChoice(this.world);
    } else {
      this.audio.ui('deny');
    }
  }

  private banish(i: number): void {
    if (this.state !== 'choice') return;
    if (this.world.banish(i)) {
      this.audio.ui('click');
      this.ui.showChoice(this.world);
    } else {
      this.audio.ui('deny');
    }
  }

  private cancelChoice(): void {
    if (this.state !== 'choice') return;
    this.world.cancelChoice();
    this.afterChoice();
  }

  private afterChoice(): void {
    if (this.world.choice) {
      this.ui.showChoice(this.world);
      return;
    }
    this.state = 'playing';
    this.ui.close();
    this.input.clearPressed();
    if (!this.bot) this.input.requestLock();
  }

  // ------------------------------------------------------------------ meta

  private toggle(kind: PoolKind, id: string): void {
    if (togglePool(this.store.data, kind, id)) {
      this.store.save();
      this.audio.ui('click');
    } else {
      this.audio.ui('deny');
    }
    this.ui.save = this.store.data;
    this.ui.showShop();
  }

  private buy(id: string): void {
    // Skarbiec ('item:<id>', 'toggler') is paid in silver, Chata upgrades in gold.
    const ok = id === 'toggler' || id.startsWith('item:') ? buySilver(this.store.data, id) : buyShopItem(this.store.data, id);
    if (ok) {
      this.store.save();
      this.audio.ui('buy');
    } else {
      this.audio.ui('deny');
    }
    this.ui.save = this.store.data;
    this.ui.showShop();
  }

  private setOption(key: string, value: number | boolean): void {
    const o = this.store.data.options as unknown as Record<string, number | boolean>;
    if (!(key in o)) return;
    o[key] = value;
    this.store.save();
    this.applyOptions();
  }

  private applyOptions(): void {
    const o = this.store.data.options;
    this.audio.setVolumes(o.master, o.music, o.sfx);
    this.gfx.fx.showNumbers = o.damageNumbers;
    this.gfx.shakeEnabled = o.shake;
    if (this.gfx.quality !== o.quality) this.gfx.applyQuality(o.quality as Quality);
  }

  private resetSave(): void {
    this.store.reset();
    this.ui.save = this.store.data;
    this.character = CHARACTERS[0] as CharacterDef;
  }

  // ------------------------------------------------------------------ input

  private onKey(code: string): void {
    this.audio.unlock();
    if (this.ui.key(code)) return;
    if ((code === 'Escape' || code === 'KeyP') && this.state === 'playing') this.pause();
  }

  // ------------------------------------------------------------------ loop

  private step(dt: number): void {
    if (this.state !== 'playing' && this.state !== 'ending') return;
    const w = this.world;
    if (this.state === 'ending') {
      this.endT -= dt;
      if (this.endT <= 0) this.finishRun();
      return;
    }
    if (this.hitstopT > 0) {
      this.hitstopT -= dt;
      return;
    }
    const t0 = performance.now();
    let s = this.simInput;
    if (this.bot) {
      s = this.bot.update(w, dt);
    } else {
      const inp = this.input;
      s.moveX = (inp.down('KeyD') ? 1 : 0) - (inp.down('KeyA') ? 1 : 0);
      s.moveZ = (inp.down('KeyW') ? 1 : 0) - (inp.down('KeyS') ? 1 : 0);
      s.jump = this.jumpQueued;
      s.dash = this.dashQueued;
      s.jumpHeld = inp.down('Space');
      s.interact = inp.down('KeyE');
      s.camYaw = this.gfx.camYaw;
      this.jumpQueued = false;
      this.dashQueued = false;
    }
    w.step(dt, s);
    this.gfx.fx.handleEvents(w);
    this.audio.handleEvents(w);
    this.audio.update(w, dt);
    w.events.clear();
    if (w.hitstop > 0) {
      this.hitstopT = w.hitstop;
      w.hitstop = 0;
    }
    this.perf.simMs += performance.now() - t0;
    this.perf.steps++;

    if (w.dead) {
      this.state = 'ending';
      this.endT = 1.4;
    } else if (w.won && !w.endless) {
      this.state = 'ending';
      this.endT = 2.4;
    } else if (w.choice) {
      if (this.bot) {
        while (w.choice) w.choose(this.bot.choose(w));
      } else {
        this.state = 'choice';
        this.input.exitLock();
        this.ui.showChoice(w);
      }
    }
    // Music follows the pressure of the run; the boss fight is the loudest part.
    const bossFight = w.bossIdx >= 0 && w.time >= RUN_LENGTH;
    this.audio.intensity = bossFight ? 1 : w.bossIdx >= 0 ? 0.8 : 0.3 + Math.min(1, w.time / RUN_LENGTH) * 0.4;
  }

  private render(alpha: number, frameDt: number): void {
    const t0 = performance.now();
    const inp = this.input;
    if (this.state === 'playing') {
      if (inp.consume('Space')) this.jumpQueued = true;
      if (inp.consume('ShiftLeft') || inp.consume('ShiftRight')) this.dashQueued = true;
      const sens = 0.0024 * this.store.data.options.sensitivity;
      let dYaw = -inp.mouseDX * sens;
      let dPitch = inp.mouseDY * sens;
      const keyRot = 2.2 * frameDt;
      if (inp.down('ArrowLeft')) dYaw += keyRot;
      if (inp.down('ArrowRight')) dYaw -= keyRot;
      if (inp.down('ArrowUp')) dPitch += keyRot * 0.6;
      if (inp.down('ArrowDown')) dPitch -= keyRot * 0.6;
      this.gfx.rotateCamera(dYaw, dPitch);
      this.ui.setHint(!inp.locked && !this.bot);
    } else {
      inp.clearPressed();
    }
    inp.mouseDX = 0;
    inp.mouseDY = 0;
    const frozen = this.state === 'paused' || this.state === 'choice' || this.state === 'end';
    this.gfx.render(this.world, frozen ? 1 : alpha, frozen ? Math.min(frameDt, 0.001) : frameDt);
    if (this.state === 'playing' || this.state === 'ending') this.ui.updateHud(this.world, frameDt);
    // The map is a held key, not a screen: the fight goes on underneath it.
    this.mapScreen.setVisible(this.state === 'playing' && (inp.down('Tab') || this.mapHeld));
    if (this.mapScreen.visible) this.mapScreen.draw(this.world, this.gfx.camYaw, frameDt);
    if (this.perfFinish) this.gfx.renderer.getContext().finish();
    const ms = performance.now() - t0;
    this.perf.renderMs += ms;
    this.perf.frames++;
    if (ms > this.perf.worst) this.perf.worst = ms;
  }

  // ------------------------------------------------------------------ debug / automation

  /** Autopilot on/off (used by automated playtests and the performance test). */
  setBot(skill: BotSkill | null): void {
    this.bot = skill ? new Bot(skill) : null;
    if (this.bot) this.ui.setHint(false);
  }

  resetPerf(): void {
    const p = this.perf;
    p.frames = 0;
    p.simMs = 0;
    p.renderMs = 0;
    p.steps = 0;
    p.worst = 0;
    p.since = performance.now();
  }

  perfReport(): { fps: number; simMsPerStep: number; cpuMsPerFrame: number; worstFrameMs: number; enemies: number } {
    const p = this.perf;
    const sec = (performance.now() - p.since) / 1000;
    return {
      fps: +(p.frames / sec).toFixed(1),
      simMsPerStep: +(p.simMs / Math.max(1, p.steps)).toFixed(3),
      cpuMsPerFrame: +(p.renderMs / Math.max(1, p.frames)).toFixed(3),
      worstFrameMs: +p.worst.toFixed(2),
      enemies: this.world.enemies.count,
    };
  }
}
