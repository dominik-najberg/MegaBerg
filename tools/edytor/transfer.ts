// "Do gry": moves a chosen proposal into the game. Models here are not textured meshes but code that
// stacks flat-coloured primitives, so the transfer is a coding job: a Codex agent rewrites the model
// after the concept, the harness renders the result in the real game (scripts/refpack.mjs, one model)
// and shows the screenshots back to the agent for up to two rounds of corrections.
//
// The agent works in the live working tree, restricted by instruction to a few files. Those files are
// snapshotted first, so a transfer can be reverted as long as nobody changed them afterwards.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type TransferKind = 'bohater' | 'wrog';

export interface TransferTarget {
  kind: TransferKind;
  id: string;
  name: string;
}

export type TransferStatus = 'running' | 'done' | 'error' | 'cancelled' | 'reverted';

export interface Transfer {
  id: string;
  batch: string;
  n: number;
  /** The proposal picture, as a path relative to concepts/. */
  proposal: string;
  target: TransferTarget;
  notes: string;
  status: TransferStatus;
  /** What is happening right now, in Polish, for the progress panel. */
  phase: string;
  round: number;
  startedAt: number;
  finishedAt?: number;
  /** Tail of what the agent said and did. */
  log: string[];
  summary?: string;
  error?: string;
  /** Files the transfer was allowed to edit and did change (repo-relative). */
  files: string[];
  /** Other files that changed meanwhile: the agent straying, or another session at work. */
  outside: string[];
  /** In-game renders before and after, as paths relative to concepts/. */
  before: string[];
  after: string[];
  /** Hash of each allowed file after the transfer; revert only touches files that still match. */
  result: Record<string, string>;
  /** Allowed files that did not exist before the transfer: reverting removes them. */
  absent: string[];
  thread?: string;
}

export interface TargetInfo extends TransferTarget {
  /** Extra facts for the agent's brief (the hero's palette, heroes sharing its style). */
  brief: string;
}

const FILES: Record<TransferKind, string[]> = {
  bohater: ['src/render/hero.ts', 'src/data/characters.ts', 'src/data/types.ts'],
  wrog: ['src/render/enemyModels.ts'],
};
const GROUP: Record<TransferKind, string> = { bohater: 'bohaterowie', wrog: 'wrogowie' };
const PREFIX: Record<TransferKind, string> = { bohater: 'bohater', wrog: 'wrog' };
const VIEWS = ['przod', 'trzy-czwarte', 'bok', 'tyl', 'w-grze'];
const VIEW_LABELS: Record<string, string> = { przod: 'front', 'trzy-czwarte': 'three-quarter', bok: 'side', tyl: 'back', 'w-grze': 'in the game' };
/** One build round plus this many rounds of corrections after seeing the render. */
const MAX_ROUNDS = 3;
const ROUND_TIMEOUT_MS = 25 * 60 * 1000;
const RENDER_TIMEOUT_MS = 3 * 60 * 1000;
const RENDER_PORT = '5197';
const DONE_WORD = 'GOTOWE';

export function transferFiles(kind: TransferKind): string[] {
  return FILES[kind];
}

export class Transfers {
  private list: Transfer[] = [];
  private child: ChildProcess | undefined;
  /** The transfer this server process is running, if any. */
  private own: Transfer | undefined;
  private cancelled = new Set<string>();
  /** Set when the dev server shuts down: the run must stop without starting anything new. */
  private shutdown = false;

  constructor(
    private readonly root: string,
    private readonly concepts: string,
    private readonly outDir: string,
  ) {
    this.sync();
  }

  all(): Transfer[] {
    return [...this.list].sort((a, b) => b.startedAt - a.startedAt);
  }

  // ---------------------------------------------------------------- lock

  /**
   * One transfer at a time across every dev server of this checkout (the game's own and a preview
   * can both serve the editor): the lock file names the process that holds it.
   */
  private lockPath(): string {
    return join(this.outDir, '.przenoszenie.lock');
  }

  /** Pid of a live process holding the lock, or 0. A lock left by a dead process does not count. */
  private lockHolder(): number {
    try {
      const pid = Number(JSON.parse(readFileSync(this.lockPath(), 'utf8')).pid);
      if (!Number.isInteger(pid) || pid <= 0) return 0;
      process.kill(pid, 0);
      return pid;
    } catch {
      return 0;
    }
  }

  private takeLock(): void {
    const holder = this.lockHolder();
    if (holder !== 0 && holder !== process.pid) throw new Error('Trwa już przenoszenie uruchomione z innego serwera deweloperskiego. Poczekaj, aż się skończy.');
    mkdirSync(this.outDir, { recursive: true });
    try {
      // `wx` fails if another server created the file between the check and now.
      rmSync(this.lockPath(), { force: true });
      writeFileSync(this.lockPath(), JSON.stringify({ pid: process.pid, at: Date.now() }), { flag: 'wx' });
    } catch {
      throw new Error('Trwa już przenoszenie uruchomione z innego serwera deweloperskiego. Poczekaj, aż się skończy.');
    }
  }

  private dropLock(): void {
    if (this.lockHolder() === process.pid) rmSync(this.lockPath(), { force: true });
  }

  busy(): boolean {
    return this.own !== undefined || this.lockHolder() !== 0;
  }

  /** Allowed files of every kind that have uncommitted changes: the agent would build on top of them. */
  dirty(): string[] {
    const files = [...new Set(Object.values(FILES).flat())];
    const out = spawnSync('git', ['status', '--porcelain', '--', ...files], { cwd: this.root, encoding: 'utf8' });
    if (out.status !== 0) return [];
    return out.stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).trim());
  }

  // ---------------------------------------------------------------- storage

  private dir(t: { batch: string; n: number }): string {
    return join(this.outDir, t.batch, `przeniesienie-${t.n}`);
  }

  private save(t: Transfer): void {
    const dir = this.dir(t);
    if (!existsSync(dirname(dir))) return; // the batch was deleted meanwhile
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'przeniesienie.json'), JSON.stringify(t, null, 2) + '\n');
  }

  /**
   * Rebuilds the list from the records on disk, so every server shows the same transfers. The one this
   * process is running stays as the live object. A record still marked as running whose owner is gone
   * was interrupted: it becomes an error, with the changed files worked out so it can still be reverted.
   */
  sync(): void {
    const list: Transfer[] = this.own ? [this.own] : [];
    const foreignAlive = this.lockHolder() !== 0 && this.lockHolder() !== process.pid;
    if (existsSync(this.outDir)) {
      for (const batch of readdirSync(this.outDir, { withFileTypes: true })) {
        if (!batch.isDirectory()) continue;
        for (const entry of readdirSync(join(this.outDir, batch.name), { withFileTypes: true })) {
          if (!entry.isDirectory() || !entry.name.startsWith('przeniesienie-')) continue;
          try {
            const t = JSON.parse(readFileSync(join(this.outDir, batch.name, entry.name, 'przeniesienie.json'), 'utf8')) as Transfer;
            if (t.batch !== batch.name || `przeniesienie-${t.n}` !== entry.name) continue;
            if (this.own && t.id === this.own.id) continue;
            t.absent ??= [];
            if (t.status === 'running' && !foreignAlive) {
              this.collect(t);
              t.status = 'error';
              t.phase = 'Nie udało się';
              t.error = 'Przerwane: serwer został zatrzymany w trakcie przenoszenia. Zmiany agenta mogły zostać w plikach.';
              t.finishedAt = Date.now();
              this.save(t);
            }
            list.push(t);
          } catch {
            // A broken or half-written record is skipped.
          }
        }
      }
    }
    this.list = list;
  }

  // ---------------------------------------------------------------- start

  start(input: { batch: string; n: number; proposal: string; proposalPath: string; refPaths: string[]; refLabels: string[]; target: TargetInfo; notes: string }): Transfer {
    if (this.busy()) throw new Error('Trwa już jedno przenoszenie. Poczekaj, aż się skończy, albo je anuluj.');
    const t: Transfer = {
      id: `${Date.now().toString(36)}-${randomBytes(2).toString('hex')}`,
      batch: input.batch,
      n: input.n,
      proposal: input.proposal,
      target: { kind: input.target.kind, id: input.target.id, name: input.target.name },
      notes: input.notes,
      status: 'running',
      phase: 'Przygotowanie',
      round: 0,
      startedAt: Date.now(),
      log: [],
      files: [],
      outside: [],
      before: [],
      after: [],
      result: {},
      absent: [],
    };
    this.takeLock();
    // A second transfer of the same proposal replaces the record (and the snapshots) of the first.
    this.list = this.list.filter((old) => !(old.batch === t.batch && old.n === t.n));
    rmSync(this.dir(t), { recursive: true, force: true });
    mkdirSync(join(this.dir(t), 'kopia'), { recursive: true });
    for (const file of FILES[t.target.kind]) {
      const full = join(this.root, file);
      if (existsSync(full)) {
        const copy = join(this.dir(t), 'kopia', file);
        mkdirSync(dirname(copy), { recursive: true });
        writeFileSync(copy, readFileSync(full));
      } else {
        t.absent.push(file);
      }
    }
    this.own = t;
    this.list.push(t);
    this.save(t);
    void this.run(t, input).catch((err: unknown) => {
      // A cancel or a shutdown that surfaces as a failed child is not an error of the transfer.
      if (this.shutdown) return;
      if (this.cancelled.has(t.id)) this.finish(t, 'cancelled');
      else this.finish(t, 'error', err instanceof Error ? err.message : String(err));
    });
    return t;
  }

  private async run(t: Transfer, input: { proposalPath: string; refPaths: string[]; refLabels: string[]; target: TargetInfo }): Promise<void> {
    // Checked after every child process exits. A cancel is only completed here, once nothing can write
    // to the files any more; a shutdown just stops, and the next server marks the record as interrupted.
    const stillOn = (): boolean => {
      if (this.shutdown) return false;
      if (this.cancelled.has(t.id)) {
        this.finish(t, 'cancelled');
        return false;
      }
      return t.status === 'running';
    };
    const world = this.hashes(this.changedPaths());

    this.step(t, 'Zrzuty modelu przed zmianą');
    t.before = (await this.render(t, 'przed')).shots;
    this.save(t);
    if (!stillOn()) return;

    let renderError = '';
    let shots: string[] = [];
    for (let round = 1; round <= MAX_ROUNDS && stillOn(); round++) {
      t.round = round;
      this.step(t, round === 1 ? 'Agent przebudowuje model' : `Agent poprawia model po obejrzeniu zrzutów (runda ${round} z ${MAX_ROUNDS})`);
      const images = round === 1 ? [input.proposalPath, ...input.refPaths] : [input.proposalPath, ...shots.map((s) => join(this.concepts, s))];
      const prompt = round === 1 ? buildPrompt(t, input.target, input.refLabels) : reviewPrompt(shots, renderError);
      const edited = this.hashes(FILES[t.target.kind]);
      const reply = await this.agent(t, prompt, images);
      if (!stillOn()) return;
      if (reply.code !== 0) throw new Error(`Agent zakończył się kodem ${reply.code}. ${reply.errors || tail(reply.message, 300)}`.trim());
      t.summary = reply.message.replace(new RegExp(`^\\s*${DONE_WORD}\\b[\\s.:–-]*`), '').trim() || t.summary;
      const changed = FILES[t.target.kind].some((f) => this.hash(f) !== edited[f]);
      const satisfied = round > 1 && new RegExp(`^\\s*${DONE_WORD}\\b`).test(reply.message);
      if (round > 1 && !changed) break; // nothing new to look at
      this.step(t, 'Zrzuty przebudowanego modelu z gry');
      const rendered = await this.render(t, `po-${round}`);
      shots = rendered.shots;
      renderError = rendered.error;
      if (shots.length > 0) t.after = shots;
      this.save(t);
      if (satisfied && !renderError) break;
    }
    if (!stillOn()) return;

    this.collect(t, world);
    if (t.files.length === 0) throw new Error('Agent nie zmienił żadnego z plików modelu. ' + (t.summary ?? ''));
    if (renderError) throw new Error('Gra nie wyświetla przebudowanego modelu: ' + renderError);
    this.finish(t, 'done');
  }

  // ---------------------------------------------------------------- agent

  private agent(t: Transfer, prompt: string, images: string[]): Promise<{ code: number | null; message: string; errors: string }> {
    return new Promise((done, fail) => {
      const args = ['exec'];
      if (t.thread) args.push('resume');
      args.push('--json', '-c', 'sandbox_mode="workspace-write"');
      if (!t.thread) args.push('-C', this.root);
      for (const image of images) args.push('-i', image);
      if (t.thread) args.push(t.thread);
      args.push('-');
      const child = spawn('codex', args, { cwd: this.root, stdio: ['pipe', 'pipe', 'pipe'] });
      this.child = child;
      let message = '';
      let errors = '';
      let buffer = '';
      const timer = setTimeout(() => {
        errors += 'Przekroczony limit czasu rundy. ';
        child.kill('SIGTERM');
      }, ROUND_TIMEOUT_MS);
      child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
        buffer += chunk;
        let nl: number;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('{')) continue;
          try {
            const event = JSON.parse(line) as AgentEvent;
            if (event.type === 'thread.started' && event.thread_id) t.thread = event.thread_id;
            if (event.type === 'error' && event.message) errors += event.message + ' ';
            if (event.type === 'turn.failed' && event.error?.message) errors += event.error.message + ' ';
            if (event.type === 'item.completed' && event.item) {
              const note = describeItem(event.item);
              if (event.item.type === 'agent_message' && event.item.text) message = event.item.text;
              if (note) this.note(t, note);
            }
          } catch {
            // Not an event line.
          }
        }
      });
      child.stderr.resume();
      child.on('error', (err) => {
        clearTimeout(timer);
        if (this.child === child) this.child = undefined;
        fail(err);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (this.child === child) this.child = undefined;
        done({ code, message: message.trim(), errors: errors.trim() });
      });
      child.stdin.on('error', () => undefined);
      child.stdin.end(prompt);
    });
  }

  // ---------------------------------------------------------------- render

  /** Renders the one model in the real game. Returns the shots it got and, on failure, why it failed. */
  private render(t: Transfer, label: string): Promise<{ shots: string[]; error: string }> {
    const out = join(this.dir(t), label);
    mkdirSync(out, { recursive: true });
    return new Promise((done) => {
      const child = spawn('node', ['scripts/refpack.mjs', GROUP[t.target.kind]], {
        cwd: this.root,
        env: { ...process.env, MB_ONLY: t.target.id, MB_OUT: out + '/', MB_PORT: RENDER_PORT, MB_URL: '' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      this.child = child;
      let output = '';
      const collect = (chunk: string): void => {
        output = (output + chunk).slice(-3000);
      };
      child.stdout.setEncoding('utf8').on('data', collect);
      child.stderr.setEncoding('utf8').on('data', collect);
      const timer = setTimeout(() => child.kill('SIGTERM'), RENDER_TIMEOUT_MS);
      const finish = (code: number | null): void => {
        clearTimeout(timer);
        if (this.child === child) this.child = undefined;
        const rel = (name: string): string => ['propozycje', t.batch, `przeniesienie-${t.n}`, label, name].join('/');
        const shots = VIEWS.map((v) => `${PREFIX[t.target.kind]}-${t.target.id}-${v}.png`)
          .filter((name) => existsSync(join(out, name)))
          .map(rel);
        const issues = /console issues:\n([\s\S]*)/.exec(output)?.[1] ?? '';
        const failed = code !== 0 || shots.length === 0;
        done({ shots, error: failed ? tail(output, 900) || `kod wyjścia ${code}` : /\[pageerror\]/.test(issues) ? tail(issues, 900) : '' });
      };
      child.on('error', () => finish(-1));
      child.on('close', finish);
    });
  }

  // ---------------------------------------------------------------- bookkeeping

  private step(t: Transfer, phase: string): void {
    t.phase = phase;
    this.note(t, `— ${phase}`);
  }

  private note(t: Transfer, line: string): void {
    // Paths in the agent's log are shown relative to the repository.
    t.log.push(line.split(this.root + '/').join('').replace(/\s+/g, ' ').trim().slice(0, 240));
    if (t.log.length > 40) t.log.splice(0, t.log.length - 40);
    this.save(t);
  }

  private finish(t: Transfer, status: TransferStatus, error?: string): void {
    if (t.status !== 'running') return;
    if (status !== 'done') this.collect(t);
    if (this.own === t) {
      this.own = undefined;
      this.dropLock();
    }
    t.status = status;
    t.error = error;
    t.phase = status === 'done' ? 'Gotowe' : status === 'cancelled' ? 'Anulowane' : 'Nie udało się';
    t.finishedAt = Date.now();
    this.cancelled.delete(t.id);
    this.save(t);
  }

  /** Works out which files the transfer changed, against the snapshots taken at the start. */
  private collect(t: Transfer, world?: Record<string, string>): void {
    t.files = [];
    t.result = {};
    for (const file of FILES[t.target.kind]) {
      const copy = join(this.dir(t), 'kopia', file);
      const now = this.hash(file);
      if (now !== (existsSync(copy) ? sha(readFileSync(copy)) : '')) {
        t.files.push(file);
        t.result[file] = now;
      }
    }
    if (world) {
      const after = this.hashes([...new Set([...Object.keys(world), ...this.changedPaths()])]);
      t.outside = Object.keys(after)
        .filter((f) => !FILES[t.target.kind].includes(f) && after[f] !== (world[f] ?? ''))
        .filter((f) => !f.startsWith('concepts/'))
        .slice(0, 20);
    }
  }

  private changedPaths(): string[] {
    const out = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: this.root, encoding: 'utf8' });
    if (out.status !== 0) return [];
    return out.stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).split(' -> ').pop()!.trim().replace(/^"|"$/g, ''));
  }

  private hash(file: string): string {
    const full = join(this.root, file);
    try {
      return sha(readFileSync(full));
    } catch {
      return '';
    }
  }

  private hashes(files: string[]): Record<string, string> {
    return Object.fromEntries(files.map((f) => [f, this.hash(f)]));
  }

  // ---------------------------------------------------------------- actions

  private find(id: string): Transfer {
    const t = this.list.find((x) => x.id === id);
    if (!t) throw new Error('Nie ma takiego przeniesienia.');
    return t;
  }

  /**
   * Asks the running transfer to stop. It is marked as cancelled only when its child process has
   * exited (see `stillOn` in run), so nothing writes to the files after the changed list is taken.
   */
  cancel(id: string): Transfer {
    const t = this.find(id);
    if (t.status !== 'running') return t;
    if (this.own !== t) throw new Error('To przenoszenie prowadzi inny serwer deweloperski: anuluj je w tamtym oknie edytora.');
    this.cancelled.add(t.id);
    t.phase = 'Anulowanie…';
    this.save(t);
    this.child?.kill('SIGTERM');
    return t;
  }

  /**
   * Puts the snapshotted files back. A file somebody changed after the transfer is left alone and
   * reported, so a revert never throws away later work.
   */
  revert(id: string): { transfer: Transfer; restored: string[]; skipped: string[] } {
    const t = this.find(id);
    if (t.status === 'running') throw new Error('Najpierw anuluj przenoszenie.');
    const restored: string[] = [];
    const skipped: string[] = [];
    for (const file of t.files) {
      const copy = join(this.dir(t), 'kopia', file);
      const created = t.absent.includes(file);
      if (this.hash(file) !== t.result[file] || (!created && !existsSync(copy))) {
        skipped.push(file);
        continue;
      }
      // A file the transfer created goes away again; any other gets its snapshot back.
      if (created) rmSync(join(this.root, file), { force: true });
      else writeFileSync(join(this.root, file), readFileSync(copy));
      restored.push(file);
    }
    if (skipped.length === 0) {
      t.status = 'reverted';
      t.phase = 'Cofnięte';
    }
    t.files = skipped;
    this.save(t);
    return { transfer: t, restored, skipped };
  }

  /** Forgets a finished transfer: the record, the renders and the snapshots go, the code stays as it is. */
  dismiss(id: string): void {
    const t = this.find(id);
    if (t.status === 'running') throw new Error('Najpierw anuluj przenoszenie.');
    this.list = this.list.filter((x) => x !== t);
    rmSync(this.dir(t), { recursive: true, force: true });
  }

  stopAll(): void {
    this.shutdown = true;
    this.child?.kill('SIGTERM');
    this.dropLock();
  }
}

// -------------------------------------------------------------------- prompts

interface AgentEvent {
  type?: string;
  thread_id?: string;
  message?: string;
  error?: { message?: string };
  item?: AgentItem;
}

interface AgentItem {
  type?: string;
  text?: string;
  command?: string;
  changes?: Array<{ path?: string; kind?: string }>;
}

function describeItem(item: AgentItem): string {
  if (item.type === 'agent_message') return item.text ?? '';
  if (item.type === 'command_execution') return `$ ${item.command ?? ''}`;
  if (item.type === 'file_change') return `zmiana: ${(item.changes ?? []).map((c) => c.path ?? '').join(', ')}`;
  return '';
}

function buildPrompt(t: Transfer, target: TargetInfo, refLabels: string[]): string {
  const hero = t.target.kind === 'bohater';
  const where = hero
    ? [
        'Where the model lives: `HeroView.setLook(look)` in src/render/hero.ts stacks the primitives; the palette, `style` and `outfit` of every hero are in src/data/characters.ts and typed in src/data/types.ts.',
        target.brief,
        'Several heroes can share one `style`. They must keep their current look, so scope your changes to this hero: give it a dedicated `outfit` value (the way existing outfits are done) and branch on it, and use the palette fields for plain colour changes.',
        'Also update this hero\'s `desc` in characters.ts if it describes clothing that changed (Polish, one sentence).',
      ]
    : [
        `Where the model lives: the function \`${t.target.id}()\` in src/render/enemyModels.ts builds the geometry. ${target.brief}`,
        'Keep the swing/flap weights and pivots of limbs and wings as they are, so the walk and flight cycles still work.',
      ];
  return [
    'You are working in the repository of "MegaBerg: Słowiańskie Bory", a Three.js survivors-like game set in Slavic folklore.',
    'Characters here are not textured meshes: every model is code that stacks flat-coloured low-poly primitives (boxes, cones, cylinders).',
    '',
    `TASK: rebuild the in-game look of the ${hero ? 'hero' : 'enemy'} "${t.target.name}" (id \`${t.target.id}\`) so that it matches the attached concept as closely as these building blocks allow. The new look REPLACES the current default look.`,
    '',
    `Images: the first one is the concept (the target).${refLabels.length > 0 ? ` The others are screenshots of the current in-game model or earlier concepts: ${refLabels.join('; ')}.` : ''}`,
    '',
    ...where,
    '',
    'Rules:',
    '- Read the file first and follow its conventions: GeoBuilder primitives and units, named colour constants at the top with a comment saying which concept they come from, comments in English.',
    '- Keep the proportions, overall height and width, pivots and animation groups, so animation, hitbox and camera still fit. Change colours, clothing layers, ornaments, hair and headgear, accessories.',
    '- The camera looks at the back of the hero most of the time and enemies are seen from every side: make the back and the silhouette carry the design too.',
    '- Stay low-poly: flat colours, a few dozen extra primitives at most, no textures, no new dependencies.',
    `- You may edit ONLY: ${FILES[t.target.kind].join(', ')}. Do not touch dist/, do not commit or run git commands that change anything, do not start dev servers or browsers: after each round the harness renders the model in the real game and shows you the screenshots.`,
    '- When you are done editing, run `npx tsc --noEmit` and `npx vitest run` and fix whatever you broke.',
    t.notes ? `\nNotes from the author: ${t.notes}` : '',
    '',
    'Finish with a short summary in Polish: 3–6 bullet points saying what changed and what could not be reproduced with primitives.',
  ].join('\n');
}

function reviewPrompt(shots: string[], renderError: string): string {
  if (renderError) {
    return [
      'The harness could not render your model in the game. Its output:',
      renderError,
      '',
      'Find the cause, fix it (same rules as before), then run `npx tsc --noEmit` and `npx vitest run`. End with the Polish summary of the whole change so far.',
    ].join('\n');
  }
  const views = shots.map((s) => VIEW_LABELS[/-(przod|trzy-czwarte|bok|tyl|w-grze)\.png$/.exec(s)?.[1] ?? ''] ?? 'view').join(', ');
  return [
    `The harness rendered your current model in the real game. Attached: first the concept again, then the in-game screenshots (${views}).`,
    'Compare them critically, as an art director would: silhouette, colour balance, the ornaments that make the concept recognisable, the back view.',
    'Name the three biggest differences that primitives can still fix and fix them, under the same rules as before. Then run `npx tsc --noEmit` and `npx vitest run`.',
    `If the model already matches the concept as well as the building blocks allow, change nothing and start your reply with the single word ${DONE_WORD}.`,
    'End with the Polish summary of the whole change so far (3–6 bullet points).',
  ].join('\n');
}

function sha(data: Buffer): string {
  return createHash('sha1').update(data).digest('hex');
}

function tail(text: string, max: number): string {
  const clean = text.trim();
  return clean.length > max ? '…' + clean.slice(-max) : clean;
}
