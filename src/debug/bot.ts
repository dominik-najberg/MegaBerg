import { emptyInput, type InputState } from '../sim/player';
import type { Card, World } from '../sim/world';

export type BotSkill = 'novice' | 'good';

/**
 * Autopilot used for balance simulations, performance tests and automated playtests.
 * 'good' kites, dodges telegraphs, collects loot and uses chests/shrines;
 * 'novice' mostly chases gems and reacts late, like a first-time player.
 */
export class Bot {
  readonly input: InputState = emptyInput();
  private wanderA = 0;
  private wanderT = 0;
  private react = 0;
  private dirX = 0;
  private dirZ = 0;

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
      if (d > 25 || d < 0.01) continue;
      const wgt = 3 / (d + 2);
      ax += (dx / d) * wgt;
      az += (dz / d) * wgt;
    }
    if (good) {
      const cost = w.chestCost();
      for (const c of w.chests) {
        if (c.opened || (!c.free && w.gold < cost)) continue;
        const dx = c.x - p.x;
        const dz = c.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d < 2.4) inp.interact = true;
        if (d > 45 || d < 0.01) continue;
        const wgt = (c.free ? 2.2 : 1.2) / (d * 0.08 + 1);
        ax += (dx / d) * wgt;
        az += (dz / d) * wgt;
      }
      if (threat < 0.25) {
        for (const s of w.shrines) {
          if (s.used) continue;
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
      const threatW = good ? 5 : 1.6;
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
      if (threat > 3.5 && p.dashCd <= 0) inp.dash = true;
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
      const want = p.hp < w.stats.maxHp * 0.5 ? 'mokosz' : this.skill === 'good' ? 'perun' : c.options[w.rng.int(c.options.length)]?.id;
      const i = c.options.findIndex((o) => o.id === want);
      return i >= 0 ? i : 0;
    }
    if (c.type === 'chest') return 0;
    if (this.skill === 'novice' && w.rng.chance(0.5)) return w.rng.int(c.cards.length);
    let best = 0;
    let bestScore = -1;
    c.cards.forEach((card, i) => {
      const s = this.score(w, card);
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    });
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
        const synergy = w.weapons.some((x) => x.def.evolution?.passive === card.id);
        return (card.isNew ? (synergy ? 7.5 : 5.5) : 6) + rar;
      }
      case 'heal':
        return w.player.hp < w.stats.maxHp * 0.5 ? 4 : 1;
      default:
        return 2;
    }
  }
}
