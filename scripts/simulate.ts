/**
 * Headless balance simulation: plays whole runs with the bot and prints how they went.
 * Usage: npm run sim -- [runs=6] [skill=good|novice] [shop=0..5] [character=wojmir] [maxMinutes=14]
 */
import { CHARACTER_BY_ID } from '../src/data/characters';
import { PASSIVES } from '../src/data/passives';
import { SHOP } from '../src/data/shop';
import { WEAPONS } from '../src/data/weapons';
import { Bot, type BotSkill } from '../src/debug/bot';
import { GameMap } from '../src/sim/terrain';
import { World } from '../src/sim/world';

const args = Object.fromEntries(process.argv.slice(2).map((a: string) => a.split('=') as [string, string]));
const runs = Number(args.runs ?? 6);
const skill = (args.skill ?? 'good') as BotSkill;
const shopLevel = Number(args.shop ?? 0);
const character = CHARACTER_BY_ID[args.character ?? 'wojmir'];
const maxMinutes = Number(args.maxMinutes ?? 12);
const all = args.pool === 'all';
const verbose = args.verbose === '1';

const map = new GameMap();
const shop: Record<string, number> = {};
for (const item of SHOP) shop[item.id] = item.id === 'odrodzenie' ? (shopLevel >= 4 ? 1 : 0) : Math.min(item.maxLevel, shopLevel);

const fmt = (t: number): string => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let wins = 0;
let totalTime = 0;
const t0 = performance.now();
for (let r = 0; r < runs; r++) {
  const w = new World(map, {
    seed: 1000 + r * 77,
    character,
    shop,
    weaponPool: all ? WEAPONS.filter((x) => !x.evolved).map((x) => x.id) : undefined,
    passivePool: all ? PASSIVES.map((x) => x.id) : undefined,
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
