import { describe, expect, it } from 'vitest';
import { ACHIEVEMENT_BY_ID } from '../src/data/achievements';
import { CHARACTER_BY_ID, CHARACTERS } from '../src/data/characters';
import { ENEMY_INDEX } from '../src/data/enemies';
import type { CharacterDef } from '../src/data/types';
import { WEAPON_BY_ID } from '../src/data/weapons';
import { applyRun } from '../src/meta/progress';
import { defaultSave } from '../src/meta/save';
import { computeStats, SPEED_POWER } from '../src/sim/stats';
import { GameMap } from '../src/sim/terrain';
import { GOLD_POWER_CAP, World } from '../src/sim/world';

const map = new GameMap();
const hero = (id: string): CharacterDef => CHARACTER_BY_ID[id] as CharacterDef;

describe('postacie: dane', () => {
  it('każda postać ma pasywkę, istniejącą broń startową i (poza Wojmirem) istniejące osiągnięcie', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(7);
    for (const c of CHARACTERS) {
      expect(c.passive.name.length, c.id).toBeGreaterThan(0);
      expect(c.passive.perLevel.length + (c.passive.power ? 1 : 0), c.id).toBeGreaterThan(0);
      expect(WEAPON_BY_ID[c.startWeapon], c.id).toBeDefined();
      if (c.unlock) expect(ACHIEVEMENT_BY_ID[c.unlock], c.id).toBeDefined();
    }
  });
});

describe('postacie: pasywka rośnie z poziomem', () => {
  it('statystyki z pasywki dochodzą z każdym poziomem powyżej pierwszego', () => {
    const w = hero('wojmir');
    const per = w.passive.perLevel[0]!.add;
    expect(computeStats(w, {}, [], [], [], 1).damage).toBeCloseTo(1.1);
    expect(computeStats(w, {}, [], [], [], 11).damage).toBeCloseTo(1.1 + per * 10);
  });

  it('awans w trakcie runu od razu odświeża statystyki', () => {
    const w = new World(map, { seed: 2, character: hero('jagna') });
    const before = w.stats.critChance;
    w.gainXp(w.xpNeed * 3);
    expect(w.level).toBeGreaterThan(1);
    expect(w.stats.critChance).toBeCloseTo(before + hero('jagna').passive.perLevel[0]!.add * (w.level - 1));
  });

  it('Pęd Strzeżymira zamienia szybkość ponad bazę w obrażenia', () => {
    const s = computeStats(hero('strzezymir'), {}, [], [], [], 1);
    expect(s.damage).toBeCloseTo(1 + SPEED_POWER * (s.moveSpeed - 1));
  });

  it('Pełna sakwa Radogosta: obrażenia rosną z noszonym złotem do limitu', () => {
    const w = new World(map, { seed: 2, character: hero('radogost') });
    w.spawner.disabled = true;
    w.stats.critChance = 0;
    expect(w.goldPower()).toBe(0);
    w.gold = 100;
    expect(w.goldPower()).toBeCloseTo(0.1);
    w.gold = 1e6;
    expect(w.goldPower()).toBe(GOLD_POWER_CAP);
    const i = w.spawnEnemy(ENEMY_INDEX.utopiec as number, 3, 3);
    const hp = w.enemies.hp[i] as number;
    w.damageEnemy(i, 10, 0, 1, 0, 0, null);
    expect(hp - (w.enemies.hp[i] as number)).toBeCloseTo(10 * (1 + GOLD_POWER_CAP));
    // Inni bohaterowie nie mają tej premii.
    const o = new World(map, { seed: 2 });
    o.gold = 1e6;
    expect(o.goldPower()).toBe(0);
  });
});

describe('postacie: odblokowania stylem gry', () => {
  it('złoto w runie, księga i kradzież życia odblokowują nowych bohaterów', () => {
    const save = defaultSave();
    const w = new World(map, { seed: 2 });
    w.addGold(450 / w.stats.goldGain);
    w.lifestealHealed = 310;
    w.blessings.push({ id: 'x', god: '', name: '', desc: '', icon: '', color: 0, mods: [{ stat: 'moveSpeed', add: 0.6 }] });
    w.refreshStats();
    applyRun(save, w.summary());
    expect(save.achievements).toEqual(expect.arrayContaining(['heroRadogost', 'heroStrzezymir', 'heroMszczuj']));
  });

  it('złoto i szybkość liczą się z całego runu, także sprzed trybu nieskończonego', () => {
    const save = defaultSave();
    const w = new World(map, { seed: 2 });
    w.addGold(300 / w.stats.goldGain);
    w.blessings.push({ id: 'x', god: '', name: '', desc: '', icon: '', color: 0, mods: [{ stat: 'moveSpeed', add: 0.6 }] });
    w.refreshStats();
    w.blessings.length = 0;
    w.refreshStats();
    w.startEndless();
    w.addGold(150 / w.stats.goldGain);
    applyRun(save, { ...w.summary(), endless: true });
    expect(save.achievements).toEqual(expect.arrayContaining(['heroRadogost', 'heroStrzezymir']));
  });
});
