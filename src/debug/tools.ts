import { ENEMY_INDEX } from '../data/enemies';
import { WEAPON_BY_ID, weaponMaxLevel } from '../data/weapons';
import type { Game } from '../game';

/**
 * Developer/tester helpers reachable from the browser console as `__mb.debug`.
 * Used by scripts/verify/*.mjs to stage scenes (specific enemies, weapons, bosses).
 */
export class DebugTools {
  constructor(private readonly game: Game) {}

  /** Spawns `n` enemies of a type in an arc in front of the camera at the given distance. */
  spawn(id: string, n = 1, dist = 8, elite = false, spread = 1.2): number[] {
    const w = this.game.world;
    const type = ENEMY_INDEX[id];
    if (type === undefined) return [];
    const yaw = this.game.gfx.camYaw;
    const out: number[] = [];
    for (let k = 0; k < n; k++) {
      const a = yaw + Math.PI + (n > 1 ? (k / (n - 1) - 0.5) * spread : 0);
      const i = w.spawnEnemy(type, w.player.x + Math.sin(a) * dist, w.player.z + Math.cos(a) * dist, elite);
      if (i >= 0) out.push(i);
    }
    return out;
  }

  /** Ring of enemies around the hero. */
  ring(id: string, n = 20, dist = 6): void {
    const w = this.game.world;
    const type = ENEMY_INDEX[id];
    if (type === undefined) return;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      w.spawnEnemy(type, w.player.x + Math.sin(a) * dist, w.player.z + Math.cos(a) * dist);
    }
  }

  clearEnemies(): void {
    const w = this.game.world;
    for (let i = 0; i < w.enemies.n; i++) if (w.enemies.alive[i]) w.despawn(i);
  }

  /** Replaces the whole arsenal with the given weapons at max level. */
  only(...ids: string[]): void {
    const w = this.game.world;
    w.weapons.length = 0;
    for (const id of ids) this.give(id);
  }

  /** Adds a weapon (or levels it) to the given level (default: max). */
  give(id: string, level?: number): void {
    const w = this.game.world;
    const def = WEAPON_BY_ID[id];
    if (!def) return;
    const inst = w.findWeapon(id) ?? w.addWeapon(id);
    if (!inst) return;
    inst.level = Math.min(level ?? weaponMaxLevel(def), weaponMaxLevel(def));
    w.refreshWeapon(inst);
  }

  god(on = true): void {
    const w = this.game.world;
    if (on) {
      w.stats.maxHp = 1e9;
      w.player.hp = 1e9;
      w.refreshStats = () => undefined;
    }
  }

  /** Turns enemy waves and the timed bonuses (magnet, gift chest) on or off. */
  spawner(on: boolean): void {
    this.game.world.spawner.disabled = !on;
    this.game.world.bonuses.disabled = !on;
  }

  /** Drops a magnet near the hero, as the timer would. */
  magnet(): boolean {
    return this.game.world.bonuses.dropMagnet(this.game.world);
  }

  /** Drops a gift chest near the hero, as the timer would. */
  gift(): boolean {
    return this.game.world.bonuses.dropGift(this.game.world);
  }

  time(seconds: number): void {
    this.game.world.time = seconds;
  }

  teleport(x: number, z: number): void {
    const p = this.game.world.player;
    p.x = x;
    p.z = z;
    p.y = this.game.world.map.heightAt(x, z);
    p.savePrev();
  }

  gold(n: number): void {
    this.game.world.gold += n;
  }

  xp(n: number): void {
    this.game.world.gainXp(n);
  }
}
