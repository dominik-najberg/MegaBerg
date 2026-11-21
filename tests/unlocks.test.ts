import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { CHARACTER_BY_ID } from '../src/data/characters';
import { ENEMY_INDEX } from '../src/data/enemies';
import type { AchievementCond, AchievementDef, CharacterDef } from '../src/data/types';
import { WEAPON_BY_ID, weaponLine } from '../src/data/weapons';
import { achievementProgress, applyRun, buySilver, grantFromTotals, isSilverPurchase, purchase, unlockedWeaponIds } from '../src/meta/progress';
import { defaultSave, sanitizeSave } from '../src/meta/save';
import { applyCard, type Card } from '../src/sim/cards';
import type { InputState } from '../src/sim/player';
import { GameMap } from '../src/sim/terrain';
import { SLOT_PROC, SLOT_THORNS, World, type RunSummary } from '../src/sim/world';

const map = new GameMap();
const still: InputState = { moveX: 0, moveZ: 0, jump: false, jumpHeld: false, dash: false, interact: false, camYaw: 0 };
const world = (character = 'wojmir'): World => {
  const w = new World(map, { seed: 3, character: CHARACTER_BY_ID[character] as CharacterDef });
  w.spawner.disabled = true;
  w.bonuses.disabled = true;
  w.stats.critChance = 0;
  return w;
};
const utopiec = ENEMY_INDEX.utopiec as number;
/** Wróg daleko od bohatera, żeby nie dosięgła go żadna broń w czasie kroku symulacji. */
const far = (w: World): number => w.spawnEnemy(utopiec, 60, 60);
const book = (id: string): Card => ({ kind: 'passive', id, rarity: 'common', isNew: false, level: 1, name: '', text: '', icon: '', color: 0 });
const emptyRun = (over: Partial<RunSummary> = {}): RunSummary => ({ ...world().summary(), ...over });

/** Dodaje na czas testu osiągnięcie z danym warunkiem. */
function withAch<T>(cond: AchievementCond, fn: (ach: AchievementDef) => T): T {
  const ach: AchievementDef = { id: 'testAch', name: 'Test', desc: '', reward: '', cond };
  ACHIEVEMENTS.push(ach);
  try {
    return fn(ach);
  } finally {
    ACHIEVEMENTS.splice(ACHIEVEMENTS.indexOf(ach), 1);
  }
}

describe('źródło zabójstwa', () => {
  it('cios bronią liczy zabójstwo tej broni', () => {
    const w = world();
    w.damageEnemy(far(w), 1e9, 0, 0, 0, 0, null);
    expect(w.killsByWeapon).toEqual({ sierpy: 1 });
    expect(w.summary().killsByWeapon).toEqual({ sierpy: 1 });
  });

  it('podpalenie liczy się broni, która podpaliła, a nie tej, która trafiła ostatnia', () => {
    const w = world();
    const fire = w.addWeapon('ogien');
    expect(fire?.slot).toBe(1);
    const e = w.enemies;
    const i = far(w);
    e.hp[i] = 1000;
    e.maxHp[i] = 1000;
    w.damageEnemy(i, 1, 1, 0, 0, 0, { ...w.weapons[1]!.stats, burn: 1e6 });
    expect(e.burnSrc[i]).toBe(1);
    // Słabsze podpalenie z innej broni tylko odświeża czas: źródło zostaje.
    w.damageEnemy(i, 1, 0, 0, 0, 0, { ...w.weapons[0]!.stats, burn: 5 });
    expect(e.burnSrc[i]).toBe(1);
    expect(e.killSrc[i]).toBe(0);
    for (let k = 0; k < 60 && e.alive[i]; k++) w.step(1 / 60, still);
    expect(e.alive[i]).toBe(0);
    expect(w.killsByWeapon).toEqual({ ogien: 1 });
  });

  it('dobicie cierniami, skarbem i egzekucją Kosy nie idzie na konto broni', () => {
    const w = world();
    const e = w.enemies;
    for (const slot of [SLOT_THORNS, SLOT_PROC, -1]) {
      const i = far(w);
      e.hp[i] = 1000;
      w.damageEnemy(i, 1, 0, 0, 0, 0, null);
      expect(e.killSrc[i]).toBe(0);
      w.damageEnemy(i, 1e9, slot, 0, 0, 0, null);
      expect(e.alive[i]).toBe(0);
    }
    expect(w.kills).toBe(3);
    expect(w.killsByWeapon).toEqual({});
    for (let k = 0; k < 200; k++) w.addItem('kosa');
    for (let k = 0; k < 60; k++) {
      const i = far(w);
      e.hp[i] = 1e9;
      w.damageEnemy(i, 1, 0, 0, 0, 0, null);
      if (e.alive[i]) w.despawn(i);
    }
    expect(w.executions).toBeGreaterThan(0);
    expect(w.kills).toBe(3 + w.executions);
    expect(w.killsByWeapon).toEqual({});
  });

  it('nowy wróg w tym samym miejscu puli nie dziedziczy źródła po poprzednim', () => {
    const w = world();
    const e = w.enemies;
    const i = far(w);
    e.hp[i] = 1000;
    w.damageEnemy(i, 1, 0, 0, 0, 0, { ...w.weapons[0]!.stats, burn: 50 });
    expect(e.killSrc[i]).toBe(0);
    expect(e.burnSrc[i]).toBe(0);
    w.despawn(i);
    const j = far(w);
    expect(j).toBe(i);
    expect(e.killSrc[j]).toBe(-1);
    expect(e.burnSrc[j]).toBe(-1);
    w.damageEnemy(j, 1e9, -1, 0, 0, 0, null);
    expect(w.killsByWeapon).toEqual({});
  });

  it('zabójstwa po ewolucji liczą się do linii broni podstawowej', () => {
    const w = world();
    w.damageEnemy(far(w), 1e9, 0, 0, 0, 0, null);
    expect(w.evolveWeapon(w.weapons[0]!)).toBe(true);
    expect(w.weapons[0]!.def.id).toBe('zniwa');
    expect(weaponLine('zniwa')).toBe('sierpy');
    expect(weaponLine('sierpy')).toBe('sierpy');
    w.damageEnemy(far(w), 1e9, 0, 0, 0, 0, null);
    expect(w.killsByWeapon).toEqual({ sierpy: 2 });
  });

  it('tryb nieskończony nie liczy zabójstw podwójnie', () => {
    const w = world();
    const save = defaultSave();
    for (let k = 0; k < 3; k++) w.damageEnemy(far(w), 1e9, 0, 0, 0, 0, null);
    w.damageEnemy(w.spawnEnemy(ENEMY_INDEX.leszy as number, 60, 60), 1e9, 0, 0, 0, 0, null);
    expect(w.won).toBe(true);
    applyRun(save, w.summary());
    expect(save.stats.killsByWeapon).toEqual({ sierpy: 4 });
    expect(save.stats.killsByEnemy).toEqual({ utopiec: 3, leszy: 1 });
    w.startEndless();
    for (let k = 0; k < 2; k++) w.damageEnemy(far(w), 1e9, 0, 0, 0, 0, null);
    applyRun(save, w.summary());
    expect(save.stats.killsByWeapon).toEqual({ sierpy: 6 });
    expect(save.stats.killsByEnemy).toEqual({ utopiec: 5, leszy: 1 });
  });
});

describe('statystyki runu', () => {
  it('najdłuższy odcinek bez utraty zdrowia liczy też trwający i przechodzi do trybu nieskończonego', () => {
    const w = world();
    w.time = 100;
    w.hurtPlayer(10);
    expect(w.longestUnhurt()).toBe(100);
    w.time = 130;
    expect(w.longestUnhurt()).toBe(100);
    // Cios przyjęty w całości przez tarczę nie przerywa odcinka (inaczej niż hurtT).
    w.player.invuln = 0;
    w.shield = 50;
    w.hurtPlayer(5);
    expect(w.player.hurtT).toBe(0);
    w.time = 260;
    expect(w.longestUnhurt()).toBe(160);
    w.startEndless();
    w.time = 300;
    expect(w.summary().longestUnhurt).toBe(200);
  });

  it('pancerz liczy tylko to, co zdjął z ciosów, które trafiły', () => {
    const w = world();
    w.stats.armor = 4;
    w.hurtPlayer(10);
    expect(w.armorBlocked).toBe(4);
    // Nietykalność po ciosie: nic nie trafia, nic się nie liczy.
    w.hurtPlayer(10);
    expect(w.armorBlocked).toBe(4);
    w.player.invuln = 0;
    // Cios zawsze zadaje co najmniej 1: z 3 obrażeń pancerz zdejmuje 2.
    w.hurtPlayer(3);
    expect(w.armorBlocked).toBe(6);
    w.player.invuln = 0;
    w.stats.evasion = 1e9;
    w.hurtPlayer(10);
    expect(w.armorBlocked).toBe(6);
    expect(w.summary().armorBlocked).toBe(6);
  });

  it('zapamiętuje czas zdobycia każdego poziomu księgi', () => {
    const w = world();
    w.time = 10;
    applyCard(w, book('sokol'));
    w.time = 25;
    applyCard(w, book('sokol'));
    w.time = 40;
    applyCard(w, book('pas'));
    expect(w.summary().bookTimes).toEqual({ sokol: [10, 25], pas: [40] });
    expect(w.summary().books).toEqual({ sokol: 2, pas: 1 });
  });

  it('sekret zapisuje się w runie raz', () => {
    const w = world();
    w.findSecret('kij');
    w.findSecret('kij');
    expect(w.summary().secrets).toEqual(['kij']);
  });
});

describe('nowe warunki osiągnięć', () => {
  it('łącznie X zabójstw bronią: sumuje runy i przyznaje w runie, który dobił do progu', () => {
    withAch({ type: 'weaponKills', weapon: 'ciupaga', count: 100 }, (ach) => {
      const save = defaultSave();
      expect(applyRun(save, emptyRun({ killsByWeapon: { ciupaga: 60, sierpy: 500 } })).unlocked).not.toContain(ach);
      expect(achievementProgress(save, ach)).toEqual({ have: 60, need: 100 });
      expect(applyRun(save, emptyRun({ killsByWeapon: { ciupaga: 40 } })).unlocked).toContain(ach);
      expect(achievementProgress(save, ach)).toEqual({ have: 100, need: 100 });
    });
  });

  it('wróg pokonany łącznie N razy', () => {
    withAch({ type: 'enemyKills', enemy: 'jaga', count: 3 }, (ach) => {
      const save = defaultSave();
      applyRun(save, emptyRun({ killsByEnemy: { jaga: 2 } }));
      expect(save.achievements).not.toContain(ach.id);
      expect(achievementProgress(save, ach)).toEqual({ have: 2, need: 3 });
      applyRun(save, emptyRun({ killsByEnemy: { jaga: 1 } }));
      expect(save.achievements).toContain(ach.id);
    });
  });

  it('konkretna broń na poziom X liczy linię broni, także po ewolucji', () => {
    withAch({ type: 'weaponLevel', level: 15, weapon: 'wianek' }, (ach) => {
      const save = defaultSave();
      const weapon = (id: string, level: number) => ({ id, name: '', level, dealt: 0 });
      applyRun(save, emptyRun({ weapons: [weapon('sierpy', 20), weapon('wianek', 9)] }));
      expect(save.achievements).not.toContain(ach.id);
      expect(achievementProgress(save, ach)).toEqual({ have: 9, need: 15 });
      applyRun(save, emptyRun({ weapons: [weapon('kwiat', 15)] }));
      expect(save.achievements).toContain(ach.id);
    });
    // Bez pola `weapon` wystarczy dowolna broń, jak dotąd.
    const save = defaultSave();
    applyRun(save, emptyRun({ weapons: [{ id: 'sierpy', name: '', level: 15, dealt: 0 }] }));
    expect(save.achievements).toContain('itemDzban');
  });

  it('księga na poziom przed czasem: równo w terminie się liczy, sekundę później nie', () => {
    withAch({ type: 'book', book: 'czarnobog', level: 3, before: 360 }, (ach) => {
      const late = defaultSave();
      applyRun(late, emptyRun({ books: { czarnobog: 3 }, bookTimes: { czarnobog: [100, 200, 360.5] } }));
      expect(late.achievements).not.toContain(ach.id);
      // Rekord to poziom zdobyty w terminie, nie końcowy poziom księgi.
      expect(achievementProgress(late, ach)).toEqual({ have: 2, need: 3 });
      const onTime = defaultSave();
      applyRun(onTime, emptyRun({ books: { czarnobog: 3 }, bookTimes: { czarnobog: [100, 200, 360] } }));
      expect(onTime.achievements).toContain(ach.id);
    });
  });

  it('odcinek bez obrażeń', () => {
    withAch({ type: 'unhurtStreak', seconds: 120 }, (ach) => {
      const save = defaultSave();
      applyRun(save, emptyRun({ longestUnhurt: 119.9 }));
      expect(save.achievements).not.toContain(ach.id);
      applyRun(save, emptyRun({ longestUnhurt: 120 }));
      expect(save.achievements).toContain(ach.id);
    });
  });

  it('blok pancerzem wymaganą postacią: inna postać nie liczy się nawet do rekordu', () => {
    withAch({ type: 'armorBlocked', amount: 500, character: 'bogumil' }, (ach) => {
      const save = defaultSave();
      applyRun(save, emptyRun({ character: 'wojmir', armorBlocked: 900 }));
      expect(save.achievements).not.toContain(ach.id);
      expect(achievementProgress(save, ach)).toEqual({ have: 0, need: 500 });
      applyRun(save, emptyRun({ character: 'bogumil', armorBlocked: 300 }));
      applyRun(save, emptyRun({ character: 'bogumil', armorBlocked: 200 }));
      expect(achievementProgress(save, ach)).toEqual({ have: 300, need: 500 });
      applyRun(save, emptyRun({ character: 'bogumil', armorBlocked: 500 }));
      expect(save.achievements).toContain(ach.id);
      expect(save.best[ach.id]).toBeUndefined();
    });
  });

  it('sekret: znaleziony w runie trafia do zapisu i spełnia warunek', () => {
    withAch({ type: 'secret', id: 'kij' }, (ach) => {
      const save = defaultSave();
      applyRun(save, emptyRun());
      expect(save.achievements).not.toContain(ach.id);
      expect(achievementProgress(save, ach)).toBeNull();
      applyRun(save, emptyRun({ secrets: ['kij'] }));
      applyRun(save, emptyRun({ secrets: ['kij'] }));
      expect(save.found).toEqual(['kij']);
      expect(save.achievements).toContain(ach.id);
    });
  });

  it('grantFromTotals przyznaje też nowe warunki łączne i znaleziony sekret', () => {
    withAch({ type: 'weaponKills', weapon: 'dziegiec', count: 50 }, (ach) => {
      const save = defaultSave();
      save.stats.killsByWeapon.dziegiec = 49;
      expect(grantFromTotals(save)).not.toContain(ach);
      save.stats.killsByWeapon.dziegiec = 50;
      expect(grantFromTotals(save)).toContain(ach);
      expect(grantFromTotals(save)).toEqual([]);
    });
    withAch({ type: 'secret', id: 'kij' }, (ach) => {
      const save = defaultSave();
      save.found.push('kij');
      expect(grantFromTotals(save)).toContain(ach);
    });
  });
});

describe('postęp osiągnięć', () => {
  const ach = (id: string): AchievementDef => ACHIEVEMENTS.find((a) => a.id === id) as AchievementDef;

  it('warunki łączne czytają statystyki, warunki z jednego runu najlepszy wynik', () => {
    const save = defaultSave();
    applyRun(save, emptyRun({ kills: 1240, level: 9, time: 100 }));
    applyRun(save, emptyRun({ kills: 10, level: 12, time: 60 }));
    expect(achievementProgress(save, ach('kills3000'))).toEqual({ have: 1250, need: 3000 });
    expect(achievementProgress(save, ach('level15'))).toEqual({ have: 12, need: 15 });
    expect(achievementProgress(save, ach('survive3'))).toEqual({ have: 100, need: 180 });
    // Tak/nie: bez paska.
    expect(achievementProgress(save, ach('jaga'))).toBeNull();
  });

  it('stary zapis bez rekordów korzysta z najdłuższego runu i najwyższego poziomu', () => {
    const save = sanitizeSave({ stats: { bestTime: 150, bestLevel: 11 } });
    expect(achievementProgress(save, ach('survive3'))).toEqual({ have: 150, need: 180 });
    expect(achievementProgress(save, ach('level15'))).toEqual({ have: 11, need: 15 });
  });

  it('ewolucje widziane w runach trafiają do zapisu', () => {
    const save = defaultSave();
    applyRun(save, emptyRun({ weapons: [{ id: 'zniwa', name: '', level: 6, dealt: 0 }, { id: 'ogien', name: '', level: 3, dealt: 0 }] }));
    applyRun(save, emptyRun({ weapons: [{ id: 'zniwa', name: '', level: 6, dealt: 0 }] }));
    expect(save.evolutionsSeen).toEqual(['zniwa']);
  });
});

describe('zapis: nowe pola', () => {
  it('stary zapis dostaje puste liczniki', () => {
    const s = sanitizeSave({ gold: 5, stats: { kills: 10 } });
    expect(s.stats.killsByWeapon).toEqual({});
    expect(s.stats.killsByEnemy).toEqual({});
    expect(s.found).toEqual([]);
    expect(s.evolutionsSeen).toEqual([]);
    expect(s.best).toEqual({});
  });

  it('czyta nowe pola i odrzuca złe wartości', () => {
    const s = sanitizeSave({
      stats: { killsByWeapon: { ciupaga: 12.9, sierpy: -4, ogien: 'x', grom: null }, killsByEnemy: ['jaga'] },
      found: ['kij', 'kij', 7, null],
      evolutionsSeen: ['zniwa', {}, 'zniwa'],
      best: { level15: 12, survive3: 99.5, zly: Number.NaN, ujemny: -1 },
    });
    expect(s.stats.killsByWeapon).toEqual({ ciupaga: 12 });
    expect(s.stats.killsByEnemy).toEqual({});
    expect(s.found).toEqual(['kij']);
    expect(s.evolutionsSeen).toEqual(['zniwa']);
    expect(s.best).toEqual({ level15: 12, survive3: 99.5 });
    expect(sanitizeSave(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
});

describe('zakup broni za srebro', () => {
  /** Na czas testu Kruki Welesa (odblokowanie: `jaga`) dostają cenę w srebrze. */
  function withPrice<T>(fn: () => T): T {
    const kruki = WEAPON_BY_ID.kruki!;
    kruki.silver = 20;
    try {
      return fn();
    } finally {
      delete kruki.silver;
    }
  }

  it('broń z ceną trzeba odblokować, a potem kupić; dopiero wtedy trafia do puli', () => {
    withPrice(() => {
      const save = defaultSave();
      save.silver = 30;
      expect(buySilver(save, 'weapon:kruki')).toBe(false);
      save.achievements.push('jaga');
      expect(unlockedWeaponIds(save)).not.toContain('kruki');
      expect(buySilver(save, 'weapon:kruki')).toBe(true);
      expect(save.silver).toBe(10);
      expect(save.bought).toContain('weapon:kruki');
      expect(unlockedWeaponIds(save)).toContain('kruki');
      expect(buySilver(save, 'weapon:kruki')).toBe(false);
    });
    // Bez ceny nic się nie zmienia: wystarcza osiągnięcie, kupić się nie da.
    const save = defaultSave();
    save.silver = 100;
    save.achievements.push('jaga');
    expect(unlockedWeaponIds(save)).toContain('kruki');
    expect(buySilver(save, 'weapon:kruki')).toBe(false);
    expect(buySilver(save, 'weapon:zniwa')).toBe(false);
    expect(buySilver(save, 'weapon:brak')).toBe(false);
  });

  it('zakup po id trafia do srebra albo do złota', () => {
    expect(['toggler', 'item:kosa', 'weapon:kruki'].map(isSilverPurchase)).toEqual([true, true, true]);
    expect(isSilverPurchase('sila')).toBe(false);
    withPrice(() => {
      const save = defaultSave();
      save.achievements.push('jaga');
      save.silver = 20;
      save.gold = 1000;
      expect(purchase(save, 'weapon:kruki')).toBe(true);
      expect(save.silver).toBe(0);
      expect(save.gold).toBe(1000);
      expect(purchase(save, 'sila')).toBe(true);
      expect(save.shop.sila).toBe(1);
      expect(save.gold).toBeLessThan(1000);
      expect(save.silver).toBe(0);
    });
  });
});
