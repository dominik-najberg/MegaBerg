import { describe, expect, it } from 'vitest';
import { ENEMY_INDEX } from '../src/data/enemies';
import { GameMap } from '../src/sim/terrain';
import { updateWeapons } from '../src/sim/weapons';
import { World } from '../src/sim/world';

function sickleWorld(): World {
  const w = new World(new GameMap(), { seed: 7 });
  w.spawner.disabled = true;
  w.weapons.length = 0;
  w.addWeapon('sierpy');
  w.stats.critChance = 0;
  return w;
}

/** Runs only the weapons for `secs` seconds and reports how much HP the enemy lost. */
function hpLost(w: World, x: number, z: number, secs: number): number {
  const i = w.spawnEnemy(ENEMY_INDEX.chochlik as number, w.player.x + x, w.player.z + z);
  const e = w.enemies;
  const ex = e.x[i] as number;
  const ez = e.z[i] as number;
  e.hp[i] = 1e5;
  const before = e.hp[i] as number;
  const dt = 1 / 60;
  for (let t = 0; t < secs; t += dt) {
    e.x[i] = ex; // pin the enemy in place: knockback must not push it out of the test spot
    e.z[i] = ez;
    w.grid.build(e.n, e.alive, e.x, e.z);
    w.time += dt;
    updateWeapons(w, dt);
  }
  return before - (e.hp[i] as number);
}

describe('złote sierpy', () => {
  it('tną wroga stojącego tuż przy bohaterze', () => {
    expect(hpLost(sickleWorld(), 0.5, 0.3, 3)).toBeGreaterThan(0);
  });

  it('tną wroga na okręgu ostrzy', () => {
    expect(hpLost(sickleWorld(), 2.7, 0, 3)).toBeGreaterThan(0);
  });

  it('nie sięgają wroga daleko poza ostrzami', () => {
    expect(hpLost(sickleWorld(), 6, 0, 3)).toBe(0);
  });
});
