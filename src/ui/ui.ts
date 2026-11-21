import { ACHIEVEMENTS } from '../data/achievements';
import { ITEM_BY_ID, ITEMS } from '../data/items';
import { PASSIVE_BY_ID } from '../data/passives';
import { BLESSING_MAX } from '../data/blessings';
import { CHARACTERS } from '../data/characters';
import { ENEMIES } from '../data/enemies';
import { RARITIES } from '../data/rarity';
import { SHOP, shopCost } from '../data/shop';
import type { AchievementDef, EnemyDef, WeaponKind } from '../data/types';
import { WEAPON_BY_ID, WEAPONS } from '../data/weapons';
import { RUN_LENGTH, SURGE_LENGTH, surgeLeft } from '../data/waves';
import { HASTE_TIME } from '../sim/bonuses';
import { achievementProgress, isUnlocked, MIN_ENABLED, poolIds, runPool, TOGGLER_PRICE, unlockedWeaponIds, type PoolKind, type RunResult } from '../meta/progress';
import type { SaveData } from '../meta/save';
import { canBanish, type Card } from '../sim/cards';
import { dodgeChance } from '../sim/stats';
import type { RunSummary, World } from '../sim/world';
import { hex, icon } from './icons';

export interface UIActions {
  start(characterId: string): void;
  choose(index: number): void;
  reroll(): void;
  toggle(kind: PoolKind, id: string): void;
  banish(i: number): void;
  cancelChoice(): void;
  resume(): void;
  restart(): void;
  endRun(): void;
  toMenu(): void;
  endless(): void;
  buy(id: string): void;
  option(key: string, value: number | boolean): void;
  resetSave(): void;
  uiSound(kind: 'click' | 'hover' | 'buy' | 'deny'): void;
}

export type Screen = 'menu' | 'characters' | 'shop' | 'achievements' | 'arsenal' | 'options' | 'pause' | 'end' | 'choice' | 'none';

const fmtTime = (t: number): string => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

/** Polish names of the attack types, for the Arsenał. */
const KIND_NAMES: Record<WeaponKind, string> = {
  orbit: 'Krążące ostrza',
  bolt: 'Pocisk',
  lightning: 'Piorun',
  sweep: 'Zamach',
  aura: 'Aura',
  bounce: 'Rykoszet',
  summon: 'Przywołanie',
  cone: 'Stożek',
  lob: 'Rzut ze strefą',
  homing: 'Pociski naprowadzane',
  trap: 'Pułapki',
  trail: 'Ognisty ślad',
  boomerang: 'Powracający rzut',
  wander: 'Wędrujące wiry',
  vortex: 'Wir wciągający',
  guard: 'Blok i kontra',
  tether: 'Nić',
};

/** Progress bar of an achievement that counts something ("1240 / 2000"); empty for yes/no achievements. */
function progressHtml(save: SaveData, ach: AchievementDef | undefined): string {
  const p = ach ? achievementProgress(save, ach) : null;
  if (!ach || !p) return '';
  const t = ach.cond.type;
  const fmt = (v: number): string =>
    t === 'survive' || t === 'unhurt' || t === 'unhurtStreak' ? fmtTime(v) : t === 'speed' ? `+${Math.round(v * 100)}%` : Math.floor(v).toLocaleString('pl-PL');
  return `<div class="progress"><div class="dmg-bar"><i style="width:${Math.round((p.have / Math.max(1e-9, p.need)) * 100)}%"></i></div><b>${fmt(p.have)} / ${fmt(p.need)}</b></div>`;
}

function el(tag: string, cls: string, parent: HTMLElement): HTMLElement {
  const e = document.createElement(tag);
  e.className = cls;
  parent.appendChild(e);
  return e;
}

/** All DOM UI: menus, HUD, level-up cards, shop, options, end screen. Polish only. */
export class UI {
  screen: Screen = 'none';
  private readonly panel: HTMLElement;
  private readonly hud: HTMLElement;
  private readonly xpFill: HTMLElement;
  private readonly xpLevel: HTMLElement;
  private readonly timer: HTMLElement;
  private readonly hpFill: HTMLElement;
  private readonly hpText: HTMLElement;
  private readonly shieldFill: HTMLElement;
  private readonly weapons: HTMLElement;
  private readonly passives: HTMLElement;
  private readonly items: HTMLElement;
  private readonly kills: HTMLElement;
  private readonly gold: HTMLElement;
  private readonly dashFill: HTMLElement;
  private readonly prompt: HTMLElement;
  private readonly banner: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly hurt: HTMLElement;
  private readonly boss: HTMLElement;
  private readonly bossName: HTMLElement;
  private readonly bossFill: HTMLElement;
  private readonly toasts: HTMLElement;
  private readonly surge: HTMLElement;
  private readonly surgeText: HTMLElement;
  private readonly surgeFill: HTMLElement;
  private readonly haste: HTMLElement;
  private readonly hasteText: HTMLElement;
  private readonly hasteFill: HTMLElement;
  private readonly cache: Record<string, string | number> = {};
  private bannerT = 0;
  private bannerQueue: string[] = [];
  private optionsBack: Screen = 'menu';
  private selectedCharacter = 'wojmir';
  private confirmReset = false;
  save: SaveData;

  constructor(
    root: HTMLElement,
    private readonly actions: UIActions,
    save: SaveData,
  ) {
    this.save = save;
    this.selectedCharacter = save.character;
    this.hud = el('div', 'hud hidden', root);
    const xp = el('div', 'xp', this.hud);
    this.xpFill = el('div', 'xp-fill', xp);
    this.xpLevel = el('div', 'xp-level', xp);
    this.timer = el('div', 'timer', this.hud);
    this.surge = el('div', 'surge hidden', this.hud);
    this.surgeText = el('div', 'surge-text', this.surge);
    this.surgeFill = el('div', 'surge-fill', el('div', 'surge-bar', this.surge));
    this.boss = el('div', 'boss hidden', this.hud);
    this.bossName = el('div', 'boss-name', this.boss);
    this.bossFill = el('div', 'boss-fill', el('div', 'boss-bar', this.boss));
    const tl = el('div', 'tl', this.hud);
    const hp = el('div', 'hp', tl);
    this.hpFill = el('div', 'hp-fill', hp);
    this.shieldFill = el('div', 'shield-fill', hp);
    this.hpText = el('span', 'hp-text', hp);
    this.weapons = el('div', 'slots', tl);
    this.passives = el('div', 'slots small', tl);
    this.items = el('div', 'slots small items', tl);
    const tr = el('div', 'tr', this.hud);
    this.kills = el('div', 'stat', tr);
    this.gold = el('div', 'stat', tr);
    const dash = el('div', 'dash', this.hud);
    this.dashFill = el('div', 'dash-fill', dash);
    el('span', '', dash).textContent = 'ZRYW';
    this.haste = el('div', 'haste hidden', this.hud);
    this.hasteText = el('span', '', this.haste);
    this.hasteFill = el('i', '', this.haste);
    this.prompt = el('div', 'prompt hidden', this.hud);
    this.banner = el('div', 'banner hidden', this.hud);
    this.hint = el('div', 'hint hidden', this.hud);
    this.hint.textContent = 'Kliknij, aby obracać kamerę myszą  •  strzałki ← → też działają  •  Tab: mapa';
    this.hurt = el('div', 'hurt', root);
    this.toasts = el('div', 'toasts', root);
    this.panel = el('div', 'panel hidden', root);

    this.panel.addEventListener('click', (ev) => this.onClick(ev));
    this.panel.addEventListener('input', (ev) => this.onInput(ev));
    this.panel.addEventListener('mouseover', (ev) => {
      const t = (ev.target as HTMLElement).closest('[data-act]');
      if (t && t !== this.lastHover) {
        this.lastHover = t;
        this.actions.uiSound('hover');
      }
    });
  }

  private lastHover: Element | null = null;
  private openedAt = 0;

  // ------------------------------------------------------------ events

  private onClick(ev: Event): void {
    const t = (ev.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
    if (!t || t.classList.contains('disabled')) return;
    const act = t.dataset.act as string;
    const arg = t.dataset.arg ?? '';
    this.run(act, arg);
  }

  private run(act: string, arg: string): void {
    const a = this.actions;
    switch (act) {
      case 'play':
        a.uiSound('click');
        this.showCharacters();
        break;
      case 'shop':
        a.uiSound('click');
        this.showShop();
        break;
      case 'achievements':
        a.uiSound('click');
        this.showAchievements();
        break;
      case 'arsenal':
        a.uiSound('click');
        this.showArsenal();
        break;
      case 'options':
        a.uiSound('click');
        this.showOptions(this.screen === 'pause' ? 'pause' : 'menu');
        break;
      case 'back':
        a.uiSound('click');
        if (this.screen === 'options' && this.optionsBack === 'pause') this.showPause();
        else this.showMenu();
        break;
      case 'pick':
        a.uiSound('click');
        this.selectedCharacter = arg;
        this.showCharacters();
        break;
      case 'start':
        a.uiSound('click');
        a.start(this.selectedCharacter);
        break;
      case 'buy':
        a.buy(arg);
        break;
      case 'choose':
        a.choose(Number(arg));
        break;
      case 'reroll':
        a.reroll();
        break;
      case 'pool':
        a.toggle(arg.slice(0, 1) as PoolKind, arg.slice(2));
        break;
      case 'banish':
        a.banish(Number(arg));
        break;
      case 'cancel':
        a.cancelChoice();
        break;
      case 'resume':
        a.uiSound('click');
        a.resume();
        break;
      case 'restart':
        a.uiSound('click');
        a.restart();
        break;
      case 'endrun':
        a.uiSound('click');
        a.endRun();
        break;
      case 'menu':
        a.uiSound('click');
        a.toMenu();
        break;
      case 'endless':
        a.uiSound('click');
        a.endless();
        break;
      case 'toggle':
        a.uiSound('click');
        a.option(arg, !(this.save.options as unknown as Record<string, boolean>)[arg]);
        this.showOptions(this.optionsBack);
        break;
      case 'quality':
        a.uiSound('click');
        a.option('quality', Number(arg));
        this.showOptions(this.optionsBack);
        break;
      case 'reset':
        if (this.confirmReset) {
          this.confirmReset = false;
          a.resetSave();
          this.toast('Postęp został zresetowany.');
          this.showOptions(this.optionsBack);
        } else {
          this.confirmReset = true;
          a.uiSound('deny');
          this.showOptions(this.optionsBack);
        }
        break;
      default:
        break;
    }
  }

  private onInput(ev: Event): void {
    const t = ev.target as HTMLInputElement;
    const key = t.dataset.opt;
    if (!key) return;
    const v = Number(t.value);
    this.actions.option(key, v);
    const out = t.parentElement?.querySelector('.val');
    if (out) out.textContent = key === 'sensitivity' ? `${v.toFixed(1)}×` : `${Math.round(v * 100)}%`;
  }

  /** Keyboard shortcuts for whichever screen is open. Returns true when the key was used. */
  key(code: string): boolean {
    const digit = code.startsWith('Digit') ? Number(code.slice(5)) : code.startsWith('Numpad') ? Number(code.slice(6)) : NaN;
    if (this.screen === 'choice') {
      const n = this.panel.querySelectorAll('.card[data-act="choose"]').length;
      if (digit >= 1 && digit <= n) {
        this.actions.choose(digit - 1);
        return true;
      }
      // A chest has a "take" button: Enter takes it whole, however many treasures it holds.
      if ((code === 'Enter' || code === 'Space') && (n === 1 || this.panel.querySelector('button[data-act="choose"]'))) {
        this.actions.choose(0);
        return true;
      }
      if (code === 'KeyR') {
        this.actions.reroll();
        return true;
      }
      if (code === 'Escape' && this.panel.querySelector('[data-act="cancel"]')) {
        this.actions.cancelChoice();
        return true;
      }
      return false;
    }
    if (code === 'Escape') {
      if (this.screen === 'pause') {
        this.actions.resume();
        return true;
      }
      if (this.screen === 'characters' || this.screen === 'shop' || this.screen === 'achievements' || this.screen === 'arsenal' || this.screen === 'options') {
        this.run('back', '');
        return true;
      }
    }
    if (code === 'Enter' || code === 'Space') {
      if (this.screen === 'menu') {
        this.run('play', '');
        return true;
      }
      if (this.screen === 'characters') {
        this.run('start', '');
        return true;
      }
      // Only Enter, and not right away: a player still mashing jump must not skip the summary.
      if (this.screen === 'end' && code === 'Enter' && performance.now() - this.openedAt > 700) {
        this.actions.restart();
        return true;
      }
    }
    if (this.screen === 'characters' && (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD')) {
      const avail = CHARACTERS.filter((c) => isUnlocked(this.save, c.unlock));
      const i = avail.findIndex((c) => c.id === this.selectedCharacter);
      const dir = code === 'ArrowLeft' || code === 'KeyA' ? -1 : 1;
      const next = avail[(i + dir + avail.length) % avail.length];
      if (next) {
        this.selectedCharacter = next.id;
        this.showCharacters();
      }
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ panels

  private open(screen: Screen, html: string, cls = ''): void {
    if (screen !== this.screen) this.openedAt = performance.now();
    this.screen = screen;
    this.panel.className = `panel ${cls}`;
    this.panel.innerHTML = html;
    this.lastHover = null;
  }

  close(): void {
    this.screen = 'none';
    this.panel.className = 'panel hidden';
    this.panel.innerHTML = '';
  }

  showMenu(): void {
    const s = this.save;
    const best = s.stats.bestTime > 0 ? `Najdłuższy run: ${fmtTime(s.stats.bestTime)}  •  Zwycięstwa: ${s.stats.wins}  •  Pokonani wrogowie: ${s.stats.kills}` : 'Bór czeka. Zapada zmierzch.';
    this.open(
      'menu',
      `<div class="menu">
        <div class="title"><span class="t1">MegaBerg</span><span class="t2">Słowiańskie Bory</span><div class="orn"></div></div>
        <div class="menu-buttons">
          <button class="btn primary" data-act="play">${icon('sword')} Graj</button>
          <button class="btn" data-act="shop">${icon('home')} Chata <span class="pill">${icon('coin', '#ffd040', 14)} ${s.gold}</span></button>
          <button class="btn" data-act="achievements">${icon('star')} Osiągnięcia <span class="pill">${s.achievements.length}/${ACHIEVEMENTS.length}</span></button>
          <button class="btn" data-act="arsenal">${icon('sickle')} Arsenał <span class="pill">${unlockedWeaponIds(s).length}/${WEAPONS.filter((w) => !w.evolved).length}</span></button>
          <button class="btn" data-act="options">${icon('gear')} Opcje</button>
        </div>
        <div class="menu-foot">${best}</div>
        <div class="controls">
          <b>Sterowanie</b>
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ruch</span>
          <span><kbd>Mysz</kbd> / <kbd>←</kbd><kbd>→</kbd> kamera</span>
          <span><kbd>Spacja</kbd> skok</span>
          <span><kbd>Shift</kbd> zryw</span>
          <span><kbd>E</kbd> skrzynie i kapliczki</span>
          <span><kbd>Tab</kbd> mapa (przytrzymaj)</span>
          <span><kbd>Esc</kbd> pauza</span>
        </div>
      </div>`,
      'dim-soft',
    );
  }

  showCharacters(): void {
    const s = this.save;
    if (!isUnlocked(s, CHARACTERS.find((c) => c.id === this.selectedCharacter)?.unlock)) this.selectedCharacter = 'wojmir';
    const cards = CHARACTERS.map((c) => {
      const open = isUnlocked(s, c.unlock);
      const w = WEAPON_BY_ID[c.startWeapon];
      const ach = ACHIEVEMENTS.find((a) => a.id === c.unlock);
      const sel = c.id === this.selectedCharacter ? ' selected' : '';
      if (!open) {
        return `<div class="char locked"><div class="char-portrait">${icon('lock', '#8a8296', 44)}</div><h3>???</h3><p class="muted">${ach ? ach.desc : ''}</p></div>`;
      }
      return `<div class="char${sel}" data-act="pick" data-arg="${c.id}">
        <div class="char-portrait" style="--c1:${hex(c.look.shirt)};--c2:${hex(c.look.hair)};--c3:${hex(c.look.pants)}"><i></i><b></b><u></u></div>
        <h3>${c.name}</h3><div class="sub">${c.title}</div>
        <p>${c.desc}</p>
        <div class="char-row">${icon(w?.icon ?? 'star', hex(w?.color ?? 0xffffff), 18)} ${w?.name ?? ''}</div>
        <div class="char-bonus">${c.bonus}</div>
        <div class="char-passive"><b>${c.passive.name}:</b> ${c.passive.desc}</div>
      </div>`;
    }).join('');
    this.open(
      'characters',
      `<div class="sheet wide">
        <h2>Wybierz bohatera</h2>
        <div class="chars">${cards}</div>
        <div class="row">
          <button class="btn" data-act="back">Wróć</button>
          <button class="btn primary" data-act="start">Wyrusz w bór</button>
        </div>
      </div>`,
      'dim',
    );
  }

  showShop(): void {
    const s = this.save;
    const items = SHOP.map((it) => {
      const lvl = s.shop[it.id] ?? 0;
      const max = lvl >= it.maxLevel;
      const cost = shopCost(it, lvl);
      const can = !max && s.gold >= cost;
      const pips = Array.from({ length: it.maxLevel }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
      return `<div class="shop-item${max ? ' maxed' : ''}">
        <div class="shop-icon">${icon(it.icon, '#e9c46a', 30)}</div>
        <div class="shop-body"><h4>${it.name}</h4><p>${it.desc}</p><div class="shop-eff">${it.fmt(it.perLevel)} / poziom</div><div class="pips">${pips}</div></div>
        <button class="btn small${can ? ' primary' : ' disabled'}" data-act="buy" data-arg="${it.id}">${max ? 'Maks.' : `${icon('coin', '#ffd040', 14)} ${cost}`}</button>
      </div>`;
    }).join('');
    const silverPill = `<span class="pill big silver">${icon('coin', '#d8dde6', 16)} ${s.silver} srebra</span>`;
    /** One thing sold for silver: locked by its achievement, for sale, or bought (`ownedLabel`). */
    const vaultRow = (key: string, it: { name: string; desc: string; icon: string; color: number; unlock?: string; silver?: number }, tag: string, ownedLabel: string): string => {
      const owned = s.bought.includes(key);
      const open = isUnlocked(s, it.unlock);
      const ach = ACHIEVEMENTS.find((a) => a.id === it.unlock);
      const can = open && !owned && s.silver >= (it.silver ?? 0);
      const btn = owned
        ? `<button class="btn small disabled">${ownedLabel}</button>`
        : open
          ? `<button class="btn small${can ? ' primary' : ' disabled'}" data-act="buy" data-arg="${key}">${icon('coin', '#d8dde6', 14)} ${it.silver}</button>`
          : `<button class="btn small disabled">${icon('lock', '#8a8296', 14)}</button>`;
      return `<div class="shop-item${owned ? ' maxed' : ''}">
          <div class="shop-icon">${icon(it.icon, open ? hex(it.color) : '#6f6880', 30)}</div>
          <div class="shop-body"><h4>${open ? it.name : '???'}</h4><p>${open ? it.desc : `Odblokuj: ${ach?.desc ?? ''}`}</p>${open ? '' : progressHtml(s, ach)}<div class="shop-eff">${tag}</div></div>
          ${btn}
        </div>`;
    };
    const vault =
      WEAPONS.filter((w) => w.silver && !w.evolved)
        .map((w) => vaultRow(`weapon:${w.id}`, w, 'Broń', s.disabled.includes(`w:${w.id}`) ? 'Wyłączona z puli' : 'Na kartach'))
        .join('') +
      ITEMS.filter((it) => it.silver)
        .map((it) => vaultRow(`item:${it.id}`, it, RARITIES[it.rarity].name, 'W skrzyniach'))
        .join('');
    const hasToggler = s.bought.includes('toggler');
    const toggler = `<div class="shop-item${hasToggler ? ' maxed' : ''}">
        <div class="shop-icon">${icon('wand', '#d8dde6', 30)}</div>
        <div class="shop-body"><h4>Rózga wróżbity</h4><p>Pozwala wyłączyć bronie, księgi i skarby, których nie chcesz widzieć na kartach i w skrzyniach.</p></div>
        ${hasToggler ? '<button class="btn small disabled">Masz</button>' : `<button class="btn small${s.silver >= TOGGLER_PRICE ? ' primary' : ' disabled'}" data-act="buy" data-arg="toggler">${icon('coin', '#d8dde6', 14)} ${TOGGLER_PRICE}</button>`}
      </div>`;
    const chips = (kind: PoolKind, label: string, look: (id: string) => { name: string; icon: string; color: number }): string => {
      const ids = poolIds(s, kind);
      const on = runPool(s, kind).length;
      const list = ids
        .map((id) => {
          const l = look(id);
          const off = s.disabled.includes(`${kind}:${id}`);
          return `<button class="chip${off ? ' off' : ''}" data-act="pool" data-arg="${kind}:${id}" title="${off ? 'Wyłączone, kliknij, by włączyć' : 'Kliknij, by wyłączyć'}">${icon(l.icon, hex(l.color), 16)} ${l.name}</button>`;
        })
        .join('');
      return `<div class="pool"><h4>${label} <em>${on} z ${ids.length} włączonych (min. ${MIN_ENABLED[kind]})</em></h4><div class="chips">${list}</div></div>`;
    };
    const pools = hasToggler
      ? `<h3 class="shop-head">Pule (Rózga wróżbity)</h3>
        ${chips('w', 'Bronie', (id) => WEAPON_BY_ID[id] as { name: string; icon: string; color: number })}
        ${chips('b', 'Księgi', (id) => PASSIVE_BY_ID[id] as { name: string; icon: string; color: number })}
        ${chips('i', 'Skarby', (id) => ITEM_BY_ID[id] as { name: string; icon: string; color: number })}`
      : '';
    this.open(
      'shop',
      `<div class="sheet wide">
        <h2>Chata</h2>
        <p class="lead">Złoto wyniesione z boru zamienia się w trwałe ulepszenia, a srebro z każdego runu otwiera Skarbiec. <span class="pill big">${icon('coin', '#ffd040', 16)} ${s.gold}</span> ${silverPill}</p>
        <div class="shop">${items}</div>
        <h3 class="shop-head">Skarbiec (srebro)</h3>
        <p class="muted">Skarb lub broń odblokowane osiągnięciem kupisz tu za srebro; od tej chwili skarb trafia do skrzyń, a broń na karty.</p>
        <div class="shop">${vault}${toggler}</div>
        ${pools}
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,
      'dim',
    );
  }

  showAchievements(): void {
    const s = this.save;
    const rows = ACHIEVEMENTS.map((a) => {
      const done = s.achievements.includes(a.id);
      return `<div class="ach${done ? ' done' : ''}">${icon(done ? 'star' : 'lock', done ? '#ffd040' : '#6f6880', 22)}<div><h4>${a.name}</h4><p>${a.desc}</p></div><div class="ach-reward">${a.reward}</div></div>`;
    }).join('');
    this.open(
      'achievements',
      `<div class="sheet">
        <h2>Osiągnięcia</h2>
        <div class="achs">${rows}</div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,
      'dim',
    );
  }

  /** Every base weapon: what it does and what it evolves into, or how to unlock it and how far that is. */
  showArsenal(): void {
    const s = this.save;
    const rows = WEAPONS.filter((w) => !w.evolved)
      .map((w) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === w.unlock);
        if (!isUnlocked(s, w.unlock)) {
          return `<div class="shop-item arsenal-item locked">
          <div class="shop-icon">${icon('lock', '#8a8296', 28)}</div>
          <div class="shop-body"><h4>???</h4><p>Odblokuj: ${ach?.desc ?? ''}</p>${progressHtml(s, ach)}</div>
        </div>`;
        }
        const into = w.evolution ? WEAPON_BY_ID[w.evolution.into] : undefined;
        const book = w.evolution ? PASSIVE_BY_ID[w.evolution.passive] : undefined;
        const evo = !into ? '' : s.evolutionsSeen.includes(into.id) ? `Ewolucja: ${into.name}${book ? ` (${book.name})` : ''}` : 'Ewolucja: ???';
        const toBuy = w.silver && !s.bought.includes(`weapon:${w.id}`) ? `<div class="arsenal-buy">Do kupienia w Skarbcu za ${w.silver} srebra</div>` : '';
        return `<div class="shop-item arsenal-item${toBuy ? ' locked' : ''}">
          <div class="shop-icon">${icon(w.icon, hex(w.color), 30)}</div>
          <div class="shop-body"><h4>${w.name}</h4><p>${w.desc}</p><div class="shop-eff">Typ ataku: ${KIND_NAMES[w.kind]}</div><div class="arsenal-evo">${evo}</div>${toBuy}</div>
        </div>`;
      })
      .join('');
    this.open(
      'arsenal',
      `<div class="sheet wide">
        <h2>Arsenał</h2>
        <p class="lead">Bronie, które mogą trafić na karty. Kolejne odblokujesz stylem gry.</p>
        <div class="shop">${rows}</div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,
      'dim',
    );
  }

  showOptions(back: Screen): void {
    this.optionsBack = back;
    const o = this.save.options;
    const slider = (key: string, label: string, v: number, min: number, max: number, step: number): string =>
      `<label class="opt"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-opt="${key}"><span class="val">${key === 'sensitivity' ? `${v.toFixed(1)}×` : `${Math.round(v * 100)}%`}</span></label>`;
    const toggle = (key: string, label: string, v: boolean): string =>
      `<div class="opt"><span>${label}</span><button class="btn small ${v ? 'primary' : ''}" data-act="toggle" data-arg="${key}">${v ? 'Włączone' : 'Wyłączone'}</button><span class="val"></span></div>`;
    const q = ['Niska', 'Średnia', 'Wysoka'].map((n, i) => `<button class="btn small ${o.quality === i ? 'primary' : ''}" data-act="quality" data-arg="${i}">${n}</button>`).join('');
    this.open(
      'options',
      `<div class="sheet narrow">
        <h2>Opcje</h2>
        ${slider('master', 'Głośność ogólna', o.master, 0, 1, 0.05)}
        ${slider('music', 'Muzyka', o.music, 0, 1, 0.05)}
        ${slider('sfx', 'Efekty', o.sfx, 0, 1, 0.05)}
        ${slider('sensitivity', 'Czułość myszy', o.sensitivity, 0.2, 3, 0.1)}
        ${toggle('damageNumbers', 'Liczby obrażeń', o.damageNumbers)}
        ${toggle('shake', 'Wstrząsy ekranu', o.shake)}
        <div class="opt"><span>Jakość grafiki</span><div class="seg">${q}</div><span class="val"></span></div>
        <div class="opt danger"><span>Postęp gry</span><button class="btn small danger" data-act="reset">${this.confirmReset ? 'Na pewno? Kliknij ponownie' : 'Resetuj postęp'}</button><span class="val"></span></div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,
      'dim',
    );
  }

  showPause(world?: World): void {
    if (world) this.pauseWorld = world;
    const w = this.pauseWorld;
    let build = '';
    if (w) {
      const st = w.stats;
      const pct = (v: number): string => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%`;
      // Stats that are 0 / base for most builds are listed only once something raised them.
      const opt: [string, boolean, string][] = [
        ['Czas trwania', st.duration !== 1, pct(st.duration - 1)],
        ['Szybkość pocisków', st.projectileSpeed !== 1, pct(st.projectileSpeed - 1)],
        ['Odrzut', st.knockback !== 1, pct(st.knockback - 1)],
        ['Kradzież życia', st.lifesteal > 0, `${Math.round(st.lifesteal * 100)}%`],
        ['Ciernie', st.thorns > 0, st.thorns.toFixed(0)],
        ['Unik', st.evasion > 0, `${Math.round(dodgeChance(st.evasion) * 100)}%`],
        ['Tarcza', st.shield > 0, st.shield.toFixed(0)],
        ['Klątwa', st.curse > 0, pct(st.curse)],
      ];
      const extra = opt.filter((o) => o[1]).map((o) => `<div class="b-stat"><span>${o[0]}</span><b>${o[2]}</b></div>`).join('');
      const ws = w.weapons.map((x) => `<div class="b-item">${icon(x.def.icon, hex(x.def.color), 20)} ${x.def.name} <em>${x.def.evolved ? 'EWO ' : ''}poz. ${x.level}</em></div>`).join('');
      const ps = w.passives.map((x) => `<div class="b-item">${icon(x.def.icon, hex(x.def.color), 20)} ${x.def.name} <em>poz. ${x.level}</em></div>`).join('');
      const bs = w.blessings.map((x) => `<div class="b-item">${icon(x.icon, hex(x.color), 20)} ${x.name}</div>`).join('');
      const is = w.items.map((x) => `<div class="b-item">${icon(x.def.icon, hex(x.def.color), 20)} ${x.def.name} <em>×${x.count}</em></div>`).join('');
      build = `<div class="build">
        <div><h4>Bronie</h4>${ws}</div>
        <div><h4>Księgi i błogosławieństwa</h4>${ps || '<div class="muted">brak</div>'}${bs}${is ? `<h4>Skarby</h4>${is}` : ''}</div>
        <div><h4>Statystyki</h4>
          <div class="b-stat"><span>Obrażenia</span><b>${pct(st.damage - 1)}</b></div>
          <div class="b-stat"><span>Odnowienie</span><b>${pct(st.cooldown - 1)}</b></div>
          <div class="b-stat"><span>Obszar</span><b>${pct(st.area - 1)}</b></div>
          <div class="b-stat"><span>Szybkość</span><b>${pct(st.moveSpeed - 1)}</b></div>
          <div class="b-stat"><span>Pancerz</span><b>${st.armor.toFixed(st.armor % 1 ? 1 : 0)}</b></div>
          <div class="b-stat"><span>Regeneracja</span><b>${st.regen.toFixed(1)}/s</b></div>
          <div class="b-stat"><span>Szczęście</span><b>${pct(st.luck)}</b></div>
          <div class="b-stat"><span>Zasięg zbierania</span><b>${pct(st.pickup - 1)}</b></div>
          <div class="b-stat"><span>Szybkość ataku</span><b>${pct(st.attackSpeed - 1)}</b></div>
          <div class="b-stat"><span>Krytyk</span><b>${Math.round(st.critChance * 100)}% × ${st.critDamage.toFixed(1)}</b></div>
          ${extra}
        </div>
      </div>`;
    }
    this.open(
      'pause',
      `<div class="sheet">
        <h2>Pauza</h2>
        ${build}
        <div class="row">
          <button class="btn primary" data-act="resume">Wznów</button>
          <button class="btn" data-act="options">Opcje</button>
          <button class="btn" data-act="endrun">Zakończ run</button>
        </div>
      </div>`,
      'dim',
    );
  }

  private pauseWorld: World | null = null;

  private cardHtml(c: Card, i: number, key: boolean): string {
    const r = RARITIES[c.rarity];
    const tag = c.kind === 'evolve' ? 'EWOLUCJA' : c.kind === 'gold' || c.kind === 'heal' ? 'Dar boru' : c.isNew ? 'NOWE' : c.kind === 'item' ? `${c.level}. sztuka` : `Poziom ${c.level}`;
    const type = c.kind === 'weapon' || c.kind === 'evolve' ? 'Broń' : c.kind === 'passive' ? 'Księga' : c.kind === 'item' ? 'Skarb' : 'Łup';
    return `<div class="card r-${c.rarity}" data-act="choose" data-arg="${i}" style="--rc:${r.color}">
      ${key ? `<div class="card-key">${i + 1}</div>` : ''}
      <div class="card-rarity">${r.name}</div>
      <div class="card-icon" style="--ic:${hex(c.color)}">${icon(c.icon, hex(c.color), 54)}</div>
      <h3>${c.name}</h3>
      <div class="card-tag">${type} • ${tag}</div>
      <p>${c.text}</p>
    </div>`;
  }

  /** Footer of a blessing card: which level of this god's blessing the card gives, out of the per-run limit. */
  private blessLevelHtml(world: World, id: string): string {
    const next = world.blessings.filter((x) => x.id === id).length + 1;
    const max = Math.max(BLESSING_MAX, next);
    const pips = Array.from({ length: max }, (_, i) => `<i class="${i < next - 1 ? 'on' : i === next - 1 ? 'next' : ''}"></i>`).join('');
    return `<div class="bless-lvl"><span>Podnosi do poziomu <b>${next}</b> / ${max}</span><div class="pips">${pips}</div></div>`;
  }

  showChoice(world: World): void {
    const ch = world.choice;
    if (!ch) return;
    if (ch.type === 'levelup') {
      const bc = world.banishCost();
      const cards = ch.cards
        .map((c, i) => {
          const ban = canBanish(c) ? `<button class="banish${world.gold >= bc ? '' : ' off'}" data-act="banish" data-arg="${i}" title="Usuń tę kartę z puli do końca runu">Wygnaj · ${bc} zł</button>` : '';
          return `<div class="card-wrap">${this.cardHtml(c, i, true)}${ban}</div>`;
        })
        .join('');
      const rc = world.rerollCost();
      const rrLabel = world.rerollsLeft > 0 ? `Przelosuj (${world.rerollsLeft})` : `Przelosuj · ${rc} zł`;
      const rr = `<button class="btn small${world.rerollsLeft > 0 || world.gold >= rc ? '' : ' off'}" data-act="reroll">${icon('dice', '#e9c46a', 16)} ${rrLabel} <kbd>R</kbd></button>`;
      this.open('choice', `<div class="choice"><h2>Awans! Poziom ${world.level}</h2><p class="lead">Wybierz jedną kartę</p><div class="cards">${cards}</div><div class="row">${rr}</div></div>`, 'dim levelup');
    } else if (ch.type === 'chest') {
      const cards = ch.cards.map((c, i) => this.cardHtml(c, i, false)).join('');
      const head = ch.greed
        ? '<h2>Ołtarz chciwości</h2><p class="lead">Złoto i skarb… za klątwę do końca runu.</p>'
        : ch.gift
          ? '<h2 class="gift">Dar boru</h2><p class="lead">Bór obdarza cię za darmo…</p>'
          : ch.rich
            ? '<h2 class="rich">Bogata skrzynia</h2><p class="lead">Skarby strzeżone przez to miejsce są twoje, wszystkie naraz…</p>'
            : '<h2>Skrzynia</h2><p class="lead">W środku znajdujesz…</p>';
      const take = ch.rich && ch.cards.length > 1 ? 'Weź wszystko' : 'Weź';
      this.open('choice', `<div class="choice">${head}<div class="cards">${cards}</div><div class="row"><button class="btn primary" data-act="choose" data-arg="0">${take} <kbd>Enter</kbd></button></div></div>`, 'dim chest');
    } else {
      const opts = ch.options
        .map(
          (b, i) => `<div class="card bless" data-act="choose" data-arg="${i}" style="--rc:${hex(b.color)}">
          <div class="card-key">${i + 1}</div>
          <div class="card-rarity">${b.god}</div>
          <div class="card-icon" style="--ic:${hex(b.color)}">${icon(b.icon, hex(b.color), 54)}</div>
          <h3>${b.name}</h3><p>${b.desc}</p>${ch.circle ? '' : this.blessLevelHtml(world, b.id)}</div>`,
        )
        .join('');
      const head = ch.circle ? '<h2>Święty krąg</h2><p class="lead">Krąg naładowany. Wybierz jego dar.</p>' : '<h2>Kapliczka</h2><p class="lead">Któremu z bogów złożysz pokłon?</p>';
      // A charged circle cannot be left for later: its charge would be lost, so there is no "leave" button.
      const leave = ch.circle ? '' : '<button class="btn small" data-act="cancel">Odejdź <kbd>Esc</kbd></button>';
      this.open('choice', `<div class="choice">${head}<div class="cards">${opts}</div><div class="row">${leave}</div></div>`, 'dim shrine');
    }
  }

  showEnd(run: RunSummary, result: RunResult, canContinue: boolean): void {
    const total = Math.max(1, ...run.weapons.map((w) => w.dealt));
    const bars = run.weapons
      .slice()
      .sort((a, b) => b.dealt - a.dealt)
      .map((w) => {
        const def = WEAPON_BY_ID[w.id];
        return `<div class="dmg-row">${icon(def?.icon ?? 'star', hex(def?.color ?? 0xffffff), 18)}<span class="dmg-name">${w.name}</span><div class="dmg-bar"><i style="width:${Math.round((w.dealt / total) * 100)}%;background:${hex(def?.color ?? 0xffffff)}"></i></div><b>${w.dealt.toLocaleString('pl-PL')}</b></div>`;
      })
      .join('');
    const burn = run.burnDealt > 0 ? `<div class="dmg-row">${icon('flame', '#ff8a3a', 18)}<span class="dmg-name">Podpalenie</span><div class="dmg-bar"><i style="width:${Math.min(100, Math.round((run.burnDealt / total) * 100))}%;background:#ff8a3a"></i></div><b>${run.burnDealt.toLocaleString('pl-PL')}</b></div>` : '';
    const top = Object.entries(run.killsByEnemy)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, n]) => `${(ENEMIES.find((e) => e.id === id) as EnemyDef | undefined)?.name ?? id}: ${n}`)
      .join('  •  ');
    const unl = result.unlocked.length
      ? `<div class="unlocks"><h4>Nowe osiągnięcia</h4>${result.unlocked.map((a) => `<div class="unlock">${icon('star', '#ffd040', 18)} <b>${a.name}</b> — ${a.reward}</div>`).join('')}</div>`
      : '';
    this.open(
      'end',
      `<div class="sheet end ${run.won ? 'won' : 'lost'}">
        <h2>${run.won ? 'Zwycięstwo!' : run.endless ? 'Bór cię pochłonął' : 'Poległeś w borze'}</h2>
        <p class="lead">${run.won ? 'Leszy pada. Bór znów jest spokojny.' : run.endless ? 'Tryb nieskończony dobiegł końca. Leszy i tak już pokonany.' : 'Złe moce zwyciężyły tym razem. Chata czeka na twoje złoto.'}</p>
        <div class="end-stats">
          <div><span>Czas</span><b>${fmtTime(run.time)}</b></div>
          <div><span>Zabójstwa</span><b>${run.kills}</b></div>
          <div><span>Poziom</span><b>${run.level}</b></div>
          <div><span>Złoto</span><b>${icon('coin', '#ffd040', 16)} ${result.goldBanked}${result.goldBonus ? ` <em>+${result.goldBonus}</em>` : ''}</b></div>
          <div><span>Srebro</span><b>${icon('coin', '#d8dde6', 16)} ${result.silver}</b></div>
        </div>
        <h4>Obrażenia według broni</h4>
        <div class="dmg">${bars}${burn}</div>
        <p class="muted small">${top}</p>
        ${unl}
        <div class="row">
          ${canContinue ? '<button class="btn" data-act="endless">Graj dalej (tryb nieskończony)</button>' : ''}
          <button class="btn primary" data-act="restart">Jeszcze raz</button>
          <button class="btn" data-act="shop">Chata</button>
          <button class="btn" data-act="menu">Menu</button>
        </div>
      </div>`,
      'dim',
    );
  }

  /** Shown when the GPU drops the WebGL context (driver reset, GPU sleep). Progress is already saved. */
  showContextLost(): void {
    this.setHud(false);
    this.open('none', `<div class="sheet narrow"><h2>Utracono kontekst grafiki</h2><p class="lead">Karta graficzna przerwała połączenie z grą. Postęp z Chaty jest zapisany. Odśwież stronę (F5), aby grać dalej.</p></div>`, 'dim');
  }

  // ------------------------------------------------------------ HUD

  setHud(visible: boolean): void {
    this.hud.classList.toggle('hidden', !visible);
    if (!visible) this.hurt.style.opacity = '0';
  }

  setHint(visible: boolean): void {
    this.hint.classList.toggle('hidden', !visible);
  }

  private set(key: string, value: string | number, apply: (v: string | number) => void): void {
    if (this.cache[key] === value) return;
    this.cache[key] = value;
    apply(value);
  }

  resetHud(): void {
    for (const k of Object.keys(this.cache)) delete this.cache[k];
    this.surge.classList.add('hidden');
    this.haste.classList.add('hidden');
    this.hud.classList.remove('surging');
    this.bannerQueue = [];
    this.bannerT = 0;
    this.banner.classList.add('hidden');
  }

  updateHud(world: World, dt: number): void {
    const p = world.player;
    const st = world.stats;
    this.set('xp', Math.round((world.xp / world.xpNeed) * 500), (v) => (this.xpFill.style.width = `${(v as number) / 5}%`));
    this.set('lvl', world.level, (v) => (this.xpLevel.textContent = `Poziom ${v}`));
    this.set('time', Math.floor(world.time), (v) => (this.timer.textContent = fmtTime(v as number)));
    this.set('hp', Math.round((p.hp / st.maxHp) * 300), (v) => (this.hpFill.style.width = `${(v as number) / 3}%`));
    this.set('hpt', `${Math.ceil(p.hp)} / ${st.maxHp}${st.shield > 0 ? `  +${Math.ceil(world.shield)}` : ''}`, (v) => (this.hpText.textContent = v as string));
    this.set('shield', st.shield > 0 ? Math.round((world.shield / st.shield) * 300) : -1, (v) => {
      this.shieldFill.style.display = (v as number) < 0 ? 'none' : 'block';
      this.shieldFill.style.width = `${Math.max(0, v as number) / 3}%`;
    });
    this.set('kills', world.kills, (v) => (this.kills.innerHTML = `${icon('skull', '#e8dfd0', 18)} ${v}`));
    this.set('gold', Math.floor(world.gold), (v) => (this.gold.innerHTML = `${icon('coin', '#ffd040', 18)} ${v}`));
    const dash = p.dashCd <= 0 ? 100 : Math.round((1 - p.dashCd / 1.5) * 100);
    this.set('dash', dash, (v) => {
      this.dashFill.style.width = `${v}%`;
      this.dashFill.parentElement?.classList.toggle('ready', v === 100);
    });

    const wkey = world.weapons.map((w) => `${w.def.id}${w.level}`).join(',') + `/${world.weaponCap()}`;
    this.set('weapons', wkey, () => {
      this.weapons.innerHTML = world.weapons
        .map((w) => {
          const max = world.weaponCap();
          const lvl = w.level >= max ? 'MAX' : `${w.def.evolved ? '★' : ''}${w.level}`;
          return `<div class="slot${w.def.evolved ? ' evo' : ''}" style="--c:${hex(w.def.color)}" title="${w.def.name}">${icon(w.def.icon, hex(w.def.color), 26)}<b>${lvl}</b></div>`;
        })
        .join('');
    });
    const pkey = world.passives.map((x) => `${x.def.id}${x.level}`).join(',') + world.blessings.length;
    this.set('passives', pkey, () => {
      this.passives.innerHTML =
        world.passives.map((x) => `<div class="slot" style="--c:${hex(x.def.color)}" title="${x.def.name}">${icon(x.def.icon, hex(x.def.color), 18)}<b>${x.level}</b></div>`).join('') +
        world.blessings.map((b) => `<div class="slot bl" style="--c:${hex(b.color)}" title="${b.name}">${icon(b.icon, hex(b.color), 18)}</div>`).join('');
    });
    const ikey = world.items.map((x) => `${x.def.id}${x.count}`).join(',');
    this.set('items', ikey, () => {
      this.items.innerHTML = world.items
        .map((x) => `<div class="slot" style="--c:${RARITIES[x.def.rarity].color}" title="${x.def.name}: ${x.def.desc}">${icon(x.def.icon, hex(x.def.color), 18)}${x.count > 1 ? `<b>${x.count}</b>` : ''}</div>`)
        .join('');
    });

    // interaction prompt
    const pr = world.prompt;
    let ptxt = '';
    if (pr.kind === 'chest') {
      const name = pr.rich ? 'bogatą skrzynię' : 'skrzynię';
      ptxt = pr.affordable ? `Przytrzymaj [E], aby otworzyć ${name} (${pr.cost} złota)` : `${pr.rich ? 'Bogata skrzynia' : 'Skrzynia'} kosztuje ${pr.cost} złota`;
    }
    else if (pr.kind === 'shrine') ptxt = 'Przytrzymaj [E], aby pokłonić się w kapliczce';
    else if (pr.kind === 'circle') ptxt = 'Stój w świętym kręgu, aż się naładuje';
    else if (pr.kind === 'amber') ptxt = 'Przytrzymaj [E]: kapliczka bursztynowa przyciągnie bursztyny z całego boru';
    else if (pr.kind === 'greed') ptxt = 'Przytrzymaj [E]: ołtarz chciwości da skarb i złoto za klątwę (+15%)';
    else if (pr.kind === 'portal') ptxt = 'Przytrzymaj [E], aby otworzyć portal i wezwać Leszego';
    this.set('prompt', ptxt, (v) => {
      this.prompt.classList.toggle('hidden', v === '');
      this.prompt.innerHTML = `<span>${v}</span><i></i>`;
    });
    if (ptxt) {
      const bar = this.prompt.lastElementChild as HTMLElement | null;
      if (bar) bar.style.width = `${Math.round(pr.progress * 100)}%`;
    }

    // Surge: how long until the forest lets go. The final wave has no clock: it lasts until Leszy is summoned.
    const left = world.endless ? 0 : surgeLeft(world.time);
    const finalWave = !world.endless && !world.bossSummoned && world.time >= RUN_LENGTH;
    this.set('surge', left > 0 ? 1 : finalWave ? 2 : 0, (v) => {
      this.surge.classList.toggle('hidden', v === 0);
      this.surge.classList.toggle('final', v === 2);
      this.hud.classList.toggle('surging', v !== 0);
      if (v === 2) {
        this.surgeText.innerHTML = '<b>Fala końcowa</b> potrwa, dopóki nie wezwiesz Leszego';
        this.surgeFill.style.width = '100%';
      }
    });
    if (left > 0) {
      this.set('surgeT', Math.ceil(left), (v) => (this.surgeText.innerHTML = `<b>Fala boru</b> koniec za ${v} s`));
      this.set('surgeW', Math.round((left / SURGE_LENGTH) * 200), (v) => (this.surgeFill.style.width = `${(v as number) / 2}%`));
    }

    // Haste: seconds of faster attacks left.
    this.set('haste', world.hasteT > 0 ? 1 : 0, (v) => this.haste.classList.toggle('hidden', v === 0));
    if (world.hasteT > 0) {
      this.set('hasteT', Math.ceil(world.hasteT), (v) => (this.hasteText.innerHTML = `${icon('flint', '#ffe45a', 15)} Szał bojowy <b>${v} s</b>`));
      this.set('hasteW', Math.round((world.hasteT / HASTE_TIME) * 200), (v) => (this.hasteFill.style.width = `${(v as number) / 2}%`));
    }

    // boss bar
    const bi = world.bossIdx;
    if (bi >= 0 && world.enemies.alive[bi]) {
      const def = ENEMIES[world.enemies.type[bi] as number] as EnemyDef;
      this.set('boss', def.name, (v) => {
        this.boss.classList.remove('hidden');
        this.boss.classList.toggle('big', def.rank === 'boss');
        this.bossName.textContent = v as string;
      });
      this.set('bossHp', Math.round(((world.enemies.hp[bi] as number) / (world.enemies.maxHp[bi] as number)) * 400), (v) => (this.bossFill.style.width = `${(v as number) / 4}%`));
    } else {
      this.set('boss', '', () => this.boss.classList.add('hidden'));
    }

    // announcer banner
    while (world.announce.length > 0) this.bannerQueue.push(world.announce.shift() as string);
    if (this.bannerT > 0) {
      this.bannerT -= dt;
      if (this.bannerT <= 0) this.banner.classList.add('hidden');
    } else if (this.bannerQueue.length > 0) {
      this.banner.textContent = this.bannerQueue.shift() as string;
      this.banner.classList.remove('hidden');
      this.banner.style.animation = 'none';
      void this.banner.offsetWidth;
      this.banner.style.animation = '';
      this.bannerT = 3.2;
    }

    // hurt vignette + low health pulse
    const low = p.hp / st.maxHp < 0.3 ? 0.35 + Math.sin(world.time * 6) * 0.12 : 0;
    const hurt = Math.max(low, p.hurtT < 0.5 ? 0.75 * (1 - p.hurtT / 0.5) : 0);
    this.set('hurt', Math.round(hurt * 20), (v) => (this.hurt.style.opacity = String((v as number) / 20)));
  }

  toast(text: string): void {
    const t = el('div', 'toast', this.toasts);
    t.textContent = text;
    setTimeout(() => t.remove(), 4200);
  }
}

export { fmtTime };
