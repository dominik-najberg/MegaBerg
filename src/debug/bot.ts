import { WEAPONS } from '../data/weapons';
import { canBanish } from '../sim/cards';
import { emptyInput, type InputState } from '../sim/player';
import { PickupKind } from '../sim/pools';
import { CIRCLE_RADIUS, MAX_WEAPONS, RUN_LENGTH, type Card, type Shrine, type World } from '../sim/world';

export type BotSkill = 'novice' | 'good';

/**
 * Autopilot used for balance simulations, performance tests and automated playtests.
 * 'good' kites, dodges telegraphs, collects loot and uses chests/shrines;
 * 'novice' mostly chases gems and reacts late, like a first-time player.
 */
/** How much less the bot values a niche book (only when it does not unlock an evolution). */
const BOOK_PENALTY: Record<string, number> = { sokol: 1, dzik: 2.5, strzybog: 2, glog: 1.5, mokosz: 1, mgla: 0.5, magnes: 0.5, pioro: 1.5 };

/**
 * Card economy of the good bot (stage 8). An offer whose best card scores below REROLL_BELOW (no weapon
 * card and no evolution book) is rerolled: free while Kości wróżebne last, then for gold. A new book
 * scoring below BANISH_BELOW that no weapon could evolve with is banished for gold. Paid rerolls and banishes keep GOLD_RESERVE
 * of the next chest's price in the purse (treasures are worth more than one better card).
 */
const REROLL_BELOW = 7;
const BANISH_BELOW = 5;
const GOLD_RESERVE = 0.5;
/** At most this many rerolls of one offer, so a dry pool does not drain the purse. */
const MAX_REROLLS = 2;
/** Święty krąg: walk in only above APPROACH_HP of health, leave below LEAVE_HP. */
const CIRCLE_APPROACH_HP = 0.6;
const CIRCLE_LEAVE_HP = 0.4;
/** Boons of a Święty krąg in the order the good bot wants them (health first when hurt). */
const CIRCLE_ORDER = ['krag-sila', 'krag-tempo', 'krag-oko', 'krag-obszar', 'krag-zdrowie', 'krag-wal', 'krag-miod', 'krag-wiatr'];

/** What the bot did with the new card mechanics in one run (for `npm run sim`). */
export interface BotTally {
  rerolls: number;
  paidRerolls: number;
  banishes: number;
  circles: number;
}

/** True once Leszy's portal is open: from then on the bot heads there and ignores circles. */
const portalOpen = (w: World): boolean => w.portal !== null;

export class Bot {
  readonly input: InputState = emptyInput();
  private wanderA = 0;
  private wanderT = 0;
  private react = 0;
  private dirX = 0;
  private dirZ = 0;
  readonly tally: BotTally = { rerolls: 0, paidRerolls: 0, banishes: 0, circles: 0 };

  constructor(readonly skill: BotSkill = 'good') {}

  update(w: World, dt: number): InputState {
    const inp = this.input;
    const p = w.player;
    const e = w.enemies;
    const good = this.skill === 'good';
    inp.camYaw = 0;
    inp.jump = false;
    inp.dash = false;
    inp.jumpHeld = false;
    inp.interact = false;

    // Novices re-evaluate only a few times per second.
    this.react -= dt;
    const think = good || this.react <= 0;
    if (!good && this.react <= 0) this.react = 0.22;

    let tx = 0;
    let tz = 0;
    let threat = 0;
    // A person stays close enough for short-range weapons to connect and only backs off when
    // enemies are in their face (or health is low). Novices notice danger later.
    const hpFrac = p.hp / w.stats.maxHp;
    const comfort = good ? 2.3 + Math.max(0, 0.65 - hpFrac) * 9 : 2.5 + Math.max(0, 0.5 - hpFrac) * 5;
    let nearD = 1e9;
    let nearX = 0;
    let nearZ = 0;
    for (let i = 0; i < e.n; i++) {
      if (!e.alive[i]) continue;
      const dx = p.x - (e.x[i] as number);
      const dz = p.z - (e.z[i] as number);
      const r = e.radius[i] as number;
      const m = Math.hypot(dx, dz) || 1;
      const d = m - r;
      if (d < nearD) {
        nearD = d;
        nearX = -dx / m;
        nearZ = -dz / m;
      }
      // Sidestep telegraphed charges (wolves, Południca, Leszy, Baba Jaga's swoop).
      const st = e.state[i] as number;
      if (good && r > 0.6 && m < 16 && (st === 1 || st === 2 || st === 3)) {
        const side = dx * (e.vz[i] as number) - dz * (e.vx[i] as number) >= 0 ? 1 : -1;
        tx += (dz / m) * side * 0.9;
        tz += (-dx / m) * side * 0.9;
        threat += 0.3;
      }
      // Big or charging enemies deserve more room.
      const reach = comfort + (r > 1 ? r * 1.6 : 0) + (e.state[i] === 2 ? 2.5 : 0);
      if (d > reach) continue;
      const k = (1 / Math.max(0.25, d) ** 2) * (r > 1 ? 2 : 1);
      tx += (dx / m) * k;
      tz += (dz / m) * k;
      threat += k;
    }

    // Telegraphed hazards: leave the circle (or jump right before it goes off).
    let hazardUrgent = false;
    const h = w.hazards;
    for (let i = 0; i < h.n; i++) {
      if (!h.alive[i]) continue;
      const dx = p.x - (h.x[i] as number);
      const dz = p.z - (h.z[i] as number);
      const d = Math.hypot(dx, dz);
      const r = (h.r[i] as number) + 1.2;
      if (d < r) {
        const left = (h.delay[i] as number) - (h.t[i] as number);
        const k = (good ? 6 : 1.2) * (1 + (r - d));
        const m = d || 1;
        tx += (dx / m) * k;
        tz += (dz / m) * k;
        threat += k;
        if (good && left < 0.22 && !h.air[i]) hazardUrgent = true;
        if (good && left < 0.5 && d < r - 1.5) inp.dash = true;
      }
    }
    if (good) {
      const s = w.shots;
      for (let i = 0; i < s.n; i++) {
        if (!s.alive[i]) continue;
        const dx = p.x - (s.x[i] as number);
        const dz = p.z - (s.z[i] as number);
        const d = Math.hypot(dx, dz);
        if (d < 6) {
          // Sidestep perpendicular to the shot's velocity.
          const vx = s.vx[i] as number;
          const vz = s.vz[i] as number;
          const side = dx * vz - dz * vx > 0 ? 1 : -1;
          const vl = Math.hypot(vx, vz) || 1;
          tx += (vz / vl) * side * 1.5;
          tz += (-vx / vl) * side * 1.5;
        }
      }
    }

    // Attraction: gems, pickups, chests, shrines.
    let ax = 0;
    let az = 0;
    const g = w.gems;
    const gemR = good ? 16 : 22;
    for (let i = 0; i < g.n; i++) {
      if (!g.alive[i] || g.mag[i]) continue;
      const dx = (g.x[i] as number) - p.x;
      const dz = (g.z[i] as number) - p.z;
      const d = Math.hypot(dx, dz);
      if (d > gemR || d < 0.01) continue;
      const k = (0.4 + (g.val[i] as number) * 0.15) / (d * d + 2);
      ax += (dx / d) * k;
      az += (dz / d) * k;
    }
    const k = w.pickups;
    for (let i = 0; i < k.n; i++) {
      if (!k.alive[i] || k.mag[i]) continue;
      const dx = (k.x[i] as number) - p.x;
      const dz = (k.z[i] as number) - p.z;
      const d = Math.hypot(dx, dz);
      // A magnet is worth a detour (it was announced and shines from afar); other loot only when close.
      const magnet = k.kind[i] === PickupKind.Magnet;
      if (d > (magnet ? (good ? 45 : 28) : 25) || d < 0.01) continue;
      const wgt = magnet ? (good ? 1.6 : 1.1) / (d * 0.08 + 1) : 3 / (d + 2);
      ax += (dx / d) * wgt;
      az += (dz / d) * wgt;
    }
    {
      // Everybody walks to a chest they can afford; a first-time player only notices the close ones.
      const cost = w.chestCost();
      const sight = good ? 45 : 28;
      for (const c of w.chests) {
        if (c.opened || (!c.free && w.gold < cost)) continue;
        const dx = c.x - p.x;
        const dz = c.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d < 2.4) inp.interact = true;
        if (d > sight || d < 0.01) continue;
        const wgt = (c.free ? 2.2 : 1.2) * (good ? 1 : 0.7) / (d * 0.08 + 1);
        ax += (dx / d) * wgt;
        az += (dz / d) * wgt;
      }
    }
    if (good) {
      if (threat < 0.25) {
        for (const s of w.shrines) {
          // The careful player leaves the greed altar alone, as with the curse book.
          if (s.used || s.kind === 'greed' || s.kind === 'circle') continue;
          const dx = s.x - p.x;
          const dz = s.z - p.z;
          const d = Math.hypot(dx, dz);
          if (d < 3.2) inp.interact = true;
          if (d > 40 || d < 2.4) continue;
          const wgt = 0.9 / (d * 0.08 + 1);
          ax += (dx / d) * wgt;
          az += (dz / d) * wgt;
        }
      }
    }

    // Święty krąg charges only while the hero stands inside it, so the careful player walks in when
    // the way is quiet and holds the ground (dodging inside the ring) until it pays out or health runs low.
    let hold = false;
    const circle = good && !portalOpen(w) ? this.nearestCircle(w) : null;
    if (circle) {
      const dx = circle.x - p.x;
      const dz = circle.z - p.z;
      const d = Math.hypot(dx, dz);
      const inside = d < CIRCLE_RADIUS;
      if (inside && hpFrac > CIRCLE_LEAVE_HP) {
        hold = true;
        // The farther from the centre, the harder the pull: near the rim it beats the urge to back off.
        const pull = 0.4 + 5 * (d / CIRCLE_RADIUS) ** 3;
        if (d > 0.01) {
          ax += (dx / d) * pull;
          az += (dz / d) * pull;
        }
      } else if (!inside && d < 40 && threat < 1 && hpFrac > CIRCLE_APPROACH_HP) {
        const wgt = 1.1 / (d * 0.06 + 1);
        ax += (dx / d) * wgt;
        az += (dz / d) * wgt;
      }
    }

    // Leszy's portal: the run is decided there, so it outweighs everything but immediate danger.
    const po = w.portal;
    if (po && !po.used) {
      const dx = po.x - p.x;
      const dz = po.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d < 2.8) inp.interact = true;
      if (d > 0.01) {
        // The longer the portal waits, the harder the bot pushes toward it (overtime only gets worse).
        const wgt = (good ? 3 : 1.5) * (1 + Math.max(0, w.time - RUN_LENGTH) / 20);
        ax += (dx / d) * wgt;
        az += (dz / d) * wgt;
      }
    }

    // Hunt: close the distance to the nearest enemy so the weapons have something to hit.
    if (nearD < 40 && nearD > comfort + (good ? 0.6 : 2.5)) {
      const k = good ? 0.5 : 0.12;
      ax += nearX * k;
      az += nearZ * k;
    }

    // Stay away from the map edge.
    const pd = Math.hypot(p.x, p.z);
    if (pd > 60) {
      const pull = (pd - 60) * 0.12;
      ax -= (p.x / pd) * pull;
      az -= (p.z / pd) * pull;
    }

    // Idle wandering so the bot keeps moving when nothing is around.
    this.wanderT -= dt;
    if (this.wanderT <= 0) {
      this.wanderT = 1.5 + w.rng.next() * 2;
      this.wanderA = w.rng.next() * Math.PI * 2;
    }
    ax += Math.cos(this.wanderA) * 0.05;
    az += Math.sin(this.wanderA) * 0.05;

    if (think) {
      // Holding a circle the bot only sidesteps; it does not run from the horde.
      const threatW = good ? (hold ? 1.2 : 5) : 1.6;
      let dx = tx * threatW + ax;
      let dz = tz * threatW + az;
      const dl = Math.hypot(dx, dz);
      if (dl > 0.001) {
        dx /= dl;
        dz /= dl;
      }
      this.dirX = dx;
      this.dirZ = dz;
    }
    inp.moveX = this.dirX;
    inp.moveZ = -this.dirZ;

    if (good) {
      if (threat > 3.5 && p.dashCd <= 0 && !hold) inp.dash = true;
      if (hazardUrgent && p.onGround) {
        inp.jump = true;
      }
      inp.jumpHeld = !p.onGround;
    }
    return inp;
  }

  /** Picks an option for the world's open choice. */
  choose(w: World): number {
    const c = w.choice;
    if (!c) return 0;
    if (c.type === 'shrine') {
      const p = w.player;
      const hurt = p.hp < w.stats.maxHp * 0.5;
      if (c.circle) {
        this.tally.circles++;
        if (this.skill !== 'good') return w.rng.int(c.options.length);
        const order = hurt ? ['krag-zdrowie', ...CIRCLE_ORDER] : CIRCLE_ORDER;
        const rank = (id: string): number => (order.indexOf(id) + 100) % 100;
        let bi = 0;
        c.options.forEach((o, i) => {
          if (rank(o.id) < rank((c.options[bi] as { id: string }).id)) bi = i;
        });
        return bi;
      }
      const want = hurt ? 'mokosz' : this.skill === 'good' ? 'perun' : c.options[w.rng.int(c.options.length)]?.id;
      const i = c.options.findIndex((o) => o.id === want);
      return i >= 0 ? i : 0;
    }
    if (c.type === 'chest') return 0;
    if (this.skill === 'novice' && w.rng.chance(0.5)) return w.rng.int(c.cards.length);
    if (this.skill === 'good') this.improveOffer(w);
    return this.best(w).i;
  }

  private best(w: World): { i: number; score: number } {
    const c = w.choice;
    let i = 0;
    let score = -1;
    if (c?.type !== 'levelup' && c?.type !== 'chest') return { i, score };
    c.cards.forEach((card, k) => {
      const s = this.score(w, card);
      if (s > score) {
        score = s;
        i = k;
      }
    });
    return { i, score };
  }

  /** Gold the bot may spend on cards without giving up the next chest. */
  private spare(w: World): number {
    return w.gold - w.chestCost() * GOLD_RESERVE;
  }

  /** Banishes junk books and rerolls a weak level-up offer, as a careful player does with spare gold. */
  private improveOffer(w: World): void {
    for (let rerolls = 0; w.choice?.type === 'levelup'; ) {
      const cards = w.choice.cards;
      // Banish first: a junk book that no weapon could evolve with only dilutes every later offer.
      const junk = cards.findIndex((card) => canBanish(card) && card.kind === 'passive' && this.score(w, card) < BANISH_BELOW && !this.evolvesWith(w, card.id));
      if (junk >= 0 && this.spare(w) >= w.banishCost() && w.banish(junk)) {
        this.tally.banishes++;
        continue;
      }
      if (rerolls >= MAX_REROLLS) return;
      const best = this.best(w).score;
      const free = w.rerollsLeft > 0;
      if (best >= REROLL_BELOW) return;
      if (!free && this.spare(w) < w.rerollCost()) return;
      if (!w.reroll()) return;
      rerolls++;
      this.tally.rerolls++;
      if (!free) this.tally.paidRerolls++;
    }
  }

  /** True when the book is the evolution partner of an owned weapon, or of one that may still come. */
  private evolvesWith(w: World, book: string): boolean {
    const room = w.weapons.length < MAX_WEAPONS;
    return WEAPONS.some(
      (x) => x.evolution?.passive === book && (w.findWeapon(x.id) !== undefined || (room && w.weaponPool.has(x.id) && !w.banished.has(x.id))),
    );
  }

  private nearestCircle(w: World): Shrine | null {
    if (w.bossSummoned) return null;
    const p = w.player;
    let best: Shrine | null = null;
    let bd = 1e9;
    for (const s of w.shrines) {
      if (s.used || s.kind !== 'circle') continue;
      const d = Math.hypot(s.x - p.x, s.z - p.z);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }

  private score(w: World, card: Card): number {
    const rar = { common: 0, rare: 0.5, epic: 1, legendary: 1.6 }[card.rarity];
    switch (card.kind) {
      case 'evolve':
        return 100;
      case 'weapon':
        if (card.isNew) return (w.weapons.length < 4 ? 9 : 5) + rar;
        return 7 + rar;
      case 'passive': {
        // A careful player leaves the curse book alone; the bot measures the game without it.
        if (card.id === 'czarnobog') return 1.5;
        const synergy = w.weapons.some((x) => x.def.evolution?.passive === card.id);
        // Niche books are worth less to a general build than damage, speed and survival.
        const niche = synergy ? 0 : (BOOK_PENALTY[card.id] ?? 0) + (card.id === 'kiel' && w.stats.critChance < 0.15 ? 2 : 0);
        return (card.isNew ? (synergy ? 7.5 : 5.5) : 6) + rar - niche;
      }
      case 'heal':
        return w.player.hp < w.stats.maxHp * 0.5 ? 4 : 1;
      default:
        return 2;
    }
  }
}
