/**
 * Headless balance simulation: plays whole runs with the bot and prints how they went.
 * Usage: npm run sim -- [runs=6] [skill=good|novice] [shop=0..5] [set=sila:2,zdrowie:1] [character=wojmir] [pool=all] [books=pas,serce] [verbose=1]
 *        npm run sim -- career=12 [skill=novice] [careers=4]
 *
 * `career=N` plays N runs in a row on one save file, the way a new player would: gold left in the purse
 * goes to the Chata, the cheapest affordable upgrade is bought until the purse is empty, and achievements
 * unlock weapons and pay gold. It answers "how fast does a player grow stronger", which single runs cannot.
 */
import { CHARACTER_BY_ID } from '../src/data/characters';
import { ITEMS } from '../src/data/items';
import { PASSIVES } from '../src/data/passives';
import { SHOP } from '../src/data/shop';
import { WEAPONS } from '../src/data/weapons';
import { Bot, type BotSkill } from '../src/debug/bot';
import { applyRun, buyShopItem, runPool } from '../src/meta/progress';
import { defaultSave } from '../src/meta/save';
import { shopCost } from '../src/data/shop';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';

const args = Object.fromEntries(process.argv.slice(2).map((a: string) => a.split('=') as [string, string]));
const runs = Number(args.runs ?? 6);
const skill = (args.skill ?? 'good') as BotSkill;
const shopLevel = Number(args.shop ?? 0);
const character = CHARACTER_BY_ID[args.character ?? 'wojmir'];
const maxMinutes = Number(args.maxMinutes ?? 15);
const all = args.pool === 'all';
const verbose = args.verbose === '1';
// Restrict the book pool, e.g. books=pas,krzesiwo,serce (for measuring what new books change).
const books = args.books ? args.books.split(',') : undefined;

const map = new GameMap();
const shop: Record<string, number> = {};
for (const item of SHOP) shop[item.id] = item.id === 'odrodzenie' ? (shopLevel >= 4 ? 1 : 0) : Math.min(item.maxLevel, shopLevel);
// Targeted purchases, e.g. set=sila:2,zdrowie:2,pancerz:1
if (args.set) for (const pair of args.set.split(',')) shop[pair.split(':')[0] as string] = Number(pair.split(':')[1]);

const fmt = (t: number): string => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

if (args.career) {
  const length = Number(args.career);
  const careers = Number(args.careers ?? 4);
  const dt = 1 / 60;
  const times: number[][] = [];
  const banked: number[][] = [];
  const levels: number[][] = [];
  const firstChest: number[] = [];
  let firstWin = 0;
  let winners = 0;
  for (let c = 0; c < careers; c++) {
    const save = defaultSave();
    let won = 0;
    for (let r = 0; r < length; r++) {
      const w = new World(map, { seed: 5000 + c * 1009 + r * 77, character, shop: save.shop, weaponPool: runPool(save, 'w'), passivePool: runPool(save, 'b'), itemPool: runPool(save, 'i') });
      const bot = new Bot(skill);
      let chestAt = -1;
      while (!w.dead && !w.won && w.time < maxMinutes * 60) {
        if (w.choice) {
          w.choose(bot.choose(w));
          continue;
        }
        w.step(dt, bot.update(w, dt));
        w.events.clear();
        w.announce.length = 0;
        if (chestAt < 0 && w.paidChests > 0) chestAt = w.time;
      }
      const sum = w.summary();
      const res = applyRun(save, sum);
      // Cheapest upgrade first: what a new player does with a small purse.
      for (;;) {
        const next = SHOP.filter((i) => (save.shop[i.id] ?? 0) < i.maxLevel)
          .map((i) => ({ id: i.id, cost: shopCost(i, save.shop[i.id] ?? 0) }))
          .sort((a, b) => a.cost - b.cost)[0];
        if (!next || !buyShopItem(save, next.id)) break;
      }
      (times[r] ??= []).push(sum.time);
      (banked[r] ??= []).push(res.goldBanked + res.goldBonus);
      (levels[r] ??= []).push(Object.values(save.shop).reduce((a, b) => a + b, 0));
      if (chestAt >= 0) firstChest.push(chestAt);
      if (sum.won && !won) won = r + 1;
    }
    if (won) {
      winners++;
      firstWin += won;
    }
  }
  const avg = (a: number[]): number => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  console.log(`kariera: ${skill}, ${character?.name}, ${careers} x ${length} runów (średnie)`);
  console.log(' run   czas   złoto do Chaty   poziomy ulepszeń');
  for (let r = 0; r < length; r++) {
    console.log(`${String(r + 1).padStart(4)}  ${fmt(avg(times[r] as number[])).padStart(5)}  ${avg(banked[r] as number[]).toFixed(0).padStart(15)}  ${avg(levels[r] as number[]).toFixed(1).padStart(17)}`);
  }
  console.log(`pierwsza płatna skrzynia: ${firstChest.length ? fmt(avg(firstChest)) : '-'} (w ${firstChest.length} z ${careers * length} runów)`);
  console.log(`pierwsza wygrana: ${winners ? `średnio w runie ${(firstWin / winners).toFixed(1)} (${winners}/${careers} karier)` : 'brak'}`);
  process.exit(0);
}
let wins = 0;
let totalTime = 0;
const t0 = performance.now();
for (let r = 0; r < runs; r++) {
  const w = new World(map, {
    seed: 1000 + r * 77,
    character,
    shop,
    weaponPool: all ? WEAPONS.filter((x) => !x.evolved).map((x) => x.id) : undefined,
    passivePool: books ?? (all ? PASSIVES.map((x) => x.id) : undefined),
    itemPool: all ? ITEMS.map((x) => x.id) : undefined,
  });
  const bot = new Bot(skill);
  const dt = 1 / 60;
  let lastMinute = 0;
  let peak = 0;
  while (!w.dead && !w.won && w.time < maxMinutes * 60) {
    if (w.choice) {
      w.choose(bot.choose(w));
      continue;
    }
    w.step(dt, bot.update(w, dt));
    w.events.clear();
    w.announce.length = 0;
    if (w.enemies.count > peak) peak = w.enemies.count;
    if (verbose && Math.floor(w.time / 60) > lastMinute) {
      lastMinute = Math.floor(w.time / 60);
      const dps = w.weapons.map((x) => `${x.def.id}${x.level}`).join(',');
      console.log(`   min ${lastMinute}: lvl ${w.level} hp ${Math.round(w.player.hp)}/${w.stats.maxHp} alive ${w.enemies.count} kills ${w.kills} gold ${Math.floor(w.gold)} [${dps}]`);
    }
  }
  const s = w.summary();
  if (s.won) wins++;
  totalTime += s.time;
  const weapons = s.weapons.map((x) => `${x.name} ${Math.round(x.dealt / 1000)}k`).join(', ');
  console.log(
    `run ${r + 1}: ${s.won ? 'WYGRANA' : w.dead ? 'śmierć ' : 'limit  '} ${fmt(s.time)} lvl ${s.level} kills ${s.kills} gold ${s.goldCollected} evo ${s.evolved} peak ${peak} boss ${w.bossIdx >= 0 ? Math.round(((w.enemies.hp[w.bossIdx] as number) / (w.enemies.maxHp[w.bossIdx] as number)) * 100) + '%' : '-'} | ${weapons}`,
  );
}
console.log(`\n${skill}, shop ${shopLevel}, ${character?.name}: ${wins}/${runs} wygranych, średni czas ${fmt(totalTime / runs)}, sim ${(performance.now() - t0).toFixed(0)} ms`);
