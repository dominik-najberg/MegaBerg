import { TAU } from '../core/math';
import { Rng } from '../core/rng';
import { Ev } from './events';
import { PickupKind } from './pools';
import { PLAY_RADIUS } from './terrain';
import type { World } from './world';

/**
 * Seconds until the first magnet of a run, and between the following ones (random within the range):
 * about four magnets in a ten-minute run. Both bonuses make the run easier, so they are kept rare;
 * the measurements behind these numbers are in docs/DECISIONS.md.
 */
export const MAGNET_FIRST: readonly [number, number] = [90, 120];
export const MAGNET_GAP: readonly [number, number] = [130, 170];
/** The same for the gift chest: rarer and less regular than the magnet, about two in a run. */
export const GIFT_FIRST: readonly [number, number] = [150, 210];
export const GIFT_GAP: readonly [number, number] = [200, 280];
/**
 * Haste (Szał bojowy): a pickup that speeds every weapon up for HASTE_TIME seconds. More frequent than
 * the magnet, because it only helps for a moment: about four in a run.
 */
export const HASTE_FIRST: readonly [number, number] = [60, 90];
export const HASTE_GAP: readonly [number, number] = [90, 130];
export const HASTE_TIME = 15;
/** Multiplier of attack speed while the haste lasts. */
export const HASTE_MUL = 1.5;
/** Bonuses appear this far from the hero: a short walk, close enough to see the light pillar. */
export const BONUS_MIN = 14;
export const BONUS_MAX = 24;
/** A bonus still waiting this close to the hero postpones the next one of its kind. */
const WAITING_NEAR = 60;
/** Seconds until the next attempt when a bonus could not be placed or the previous one is still waiting. */
const RETRY = 10;

/**
 * Gifts of the forest: every now and then a magnet (pulls every gem and coin of the map), a haste pickup
 * (faster attacks for a while) and, less often, a free gift chest appear near the hero. Uses its own random stream, so enemy waves stay the same per seed.
 */
export class Bonuses {
  disabled = false;
  nextMagnet: number;
  nextGift: number;
  nextHaste: number;
  private readonly rng: Rng;
  /** A stream of its own for the haste, so the magnets and the gifts of a seed stay where they were. */
  private readonly hasteRng: Rng;
  /** Result of pickSpot. */
  private sx = 0;
  private sz = 0;

  constructor(seed: number) {
    this.rng = new Rng((seed ^ 0x51ed270b) >>> 0);
    this.nextMagnet = this.rng.range(MAGNET_FIRST[0], MAGNET_FIRST[1]);
    this.nextGift = this.rng.range(GIFT_FIRST[0], GIFT_FIRST[1]);
    this.hasteRng = new Rng((seed ^ 0x2f6b9d31) >>> 0);
    this.nextHaste = this.hasteRng.range(HASTE_FIRST[0], HASTE_FIRST[1]);
  }

  update(w: World): void {
    if (this.disabled) return;
    if (w.time >= this.nextMagnet) {
      this.nextMagnet = w.time + (this.dropMagnet(w) ? this.rng.range(MAGNET_GAP[0], MAGNET_GAP[1]) : RETRY);
    }
    if (w.time >= this.nextGift) {
      this.nextGift = w.time + (this.dropGift(w) ? this.rng.range(GIFT_GAP[0], GIFT_GAP[1]) : RETRY);
    }
    if (w.time >= this.nextHaste) {
      this.nextHaste = w.time + (this.dropHaste(w) ? this.hasteRng.range(HASTE_GAP[0], HASTE_GAP[1]) : RETRY);
    }
  }

  /**
   * Puts a haste pickup near the hero right away. False when there is no room, one is already waiting
   * nearby, or the hero is still under its spell. Like magnets, the ones left behind are taken back.
   */
  dropHaste(w: World): boolean {
    if (w.hasteT > 0) return false;
    const p = w.player;
    const k = w.pickups;
    for (let i = 0; i < k.n; i++) {
      if (!k.alive[i] || k.kind[i] !== PickupKind.Haste) continue;
      if (Math.hypot((k.x[i] as number) - p.x, (k.z[i] as number) - p.z) < WAITING_NEAR) return false;
    }
    if (!this.pickSpot(w, this.hasteRng)) return false;
    for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === PickupKind.Haste) k.free(i);
    const y = w.map.heightAt(this.sx, this.sz);
    if (k.spawn(PickupKind.Haste, this.sx, y, this.sz, 0) < 0) return false;
    w.announce.push('W pobliżu błysnął szał bojowy! Na chwilę przyspieszy twoje ataki.');
    w.events.emit(Ev.Bonus, this.sx, y, this.sz, 3);
    return true;
  }

  /**
   * Puts a magnet near the hero right away. False when there is no room or one is already waiting nearby.
   * Magnets the hero walked away from are taken back, so they never pile up (the renderer draws a few at most).
   */
  dropMagnet(w: World): boolean {
    const p = w.player;
    const k = w.pickups;
    for (let i = 0; i < k.n; i++) {
      if (!k.alive[i] || k.kind[i] !== PickupKind.Magnet) continue;
      if (Math.hypot((k.x[i] as number) - p.x, (k.z[i] as number) - p.z) < WAITING_NEAR) return false;
    }
    if (!this.pickSpot(w)) return false;
    for (let i = 0; i < k.n; i++) if (k.alive[i] && k.kind[i] === PickupKind.Magnet) k.free(i);
    const y = w.map.heightAt(this.sx, this.sz);
    if (k.spawn(PickupKind.Magnet, this.sx, y, this.sz, 0) < 0) return false;
    w.announce.push('W pobliżu pojawił się magnes! Ściągnie bursztyny i monety z całego boru.');
    w.events.emit(Ev.Bonus, this.sx, y, this.sz, 0);
    return true;
  }

  /** Puts a gift chest near the hero right away. False when there is no room or one is already waiting nearby. */
  dropGift(w: World): boolean {
    const p = w.player;
    for (const c of w.chests) {
      if (c.gift && !c.opened && Math.hypot(c.x - p.x, c.z - p.z) < WAITING_NEAR) return false;
    }
    if (!this.pickSpot(w)) return false;
    // The front faces the hero, the way the chests by the starting clearing face the fire. Passing the
    // facing also keeps the world's random stream untouched: enemy waves must not depend on the gifts.
    const c = w.spawnChest(this.sx, this.sz, true, true, Math.atan2(p.x - this.sx, p.z - this.sz));
    w.announce.push('Dar boru! Darmowa skrzynia czeka w pobliżu.');
    w.events.emit(Ev.Bonus, c.x, c.y, c.z, 1);
    return true;
  }

  /** Free ground a short walk from the hero: no obstacle, no swamp, not on top of a chest or a shrine. */
  private pickSpot(w: World, rng = this.rng): boolean {
    const p = w.player;
    const map = w.map;
    for (let tries = 0; tries < 24; tries++) {
      const a = rng.next() * TAU;
      const d = rng.range(BONUS_MIN, BONUS_MAX);
      const x = p.x + Math.cos(a) * d;
      const z = p.z + Math.sin(a) * d;
      if (Math.hypot(x, z) > PLAY_RADIUS - 4) continue;
      if (!map.isFree(x, z, 1.2) || map.inPuddle(x, z)) continue;
      let clear = true;
      for (const c of w.chests) if (!c.opened && Math.hypot(c.x - x, c.z - z) < 4) clear = false;
      for (const s of w.shrines) if (Math.hypot(s.x - x, s.z - z) < 5) clear = false;
      // Not on top of another bonus still waiting to be picked up.
      const k = w.pickups;
      for (let i = 0; i < k.n; i++) {
        if (k.alive[i] && k.kind[i] >= PickupKind.Magnet && Math.hypot((k.x[i] as number) - x, (k.z[i] as number) - z) < 4) clear = false;
      }
      if (!clear) continue;
      this.sx = x;
      this.sz = z;
      return true;
    }
    return false;
  }
}
