// Concept editor backend: a dev-server-only Vite plugin (never part of the production build).
//
// It serves the reference library from concepts/, runs the Codex CLI to generate proposal images
// from chosen references, and keeps the results in concepts/propozycje/<batch>/ next to a meta.json.
//
// Codex writes generated images to $CODEX_HOME/generated_images/<thread id>/, and `codex exec --json`
// reports the thread id in its first event; that is how a finished run is matched to its picture.
import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import type { Plugin } from 'vite';

const API = '/__edytor';
const PAGE = '/tools/edytor/index.html';
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const MAX_REFS = 4;
const MAX_VARIANTS = 4;
/** Codex runs at once; the rest of a batch waits in the queue. */
const PARALLEL = 3;
const RUN_TIMEOUT_MS = 8 * 60 * 1000;

export type ItemStatus = 'queued' | 'running' | 'done' | 'error';

export interface ProposalItem {
  n: number;
  status: ItemStatus;
  /** File name inside the batch directory, set when done. */
  file?: string;
  note?: string;
  error?: string;
  starred?: boolean;
  startedAt?: number;
  finishedAt?: number;
}

export interface Batch {
  id: string;
  created: number;
  prompt: string;
  refs: string[];
  format: string;
  keepStyle: boolean;
  items: ProposalItem[];
}

export interface LibraryRef {
  /** Path relative to concepts/, with forward slashes. */
  id: string;
  group: string;
  label: string;
}

const FORMATS: Record<string, string> = {
  kwadrat: 'kwadratowy 1:1',
  poziom: 'poziomy 16:9',
  pion: 'pionowy 2:3',
};

const STYLE_NOTE =
  'Trzymaj się świata gry: słowiański folklor, mroczny bór o zmierzchu, ciepłe złoto ognia i bursztynu ' +
  'przeciw chłodnym fioletom i zieleniom nocy, czytelna sylwetka, lekko stylizowane, malarskie formy. ' +
  'Bez napisów, podpisów, ramek i znaków wodnych.';

export function conceptEditor(): Plugin {
  return {
    name: 'megaberg-edytor-konceptow',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const concepts = resolve(root, 'concepts');
      const outDir = join(concepts, 'propozycje');
      const editor = new Editor(concepts, outDir);
      server.httpServer?.once('close', () => editor.stopAll());

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (url.pathname === '/edytor' || url.pathname === '/edytor/') {
          res.statusCode = 302;
          res.setHeader('Location', PAGE);
          res.end();
          return;
        }
        if (!url.pathname.startsWith(API + '/')) return next();
        editor.handle(req, res, url).catch((err: unknown) => {
          send(res, 500, { error: err instanceof Error ? err.message : String(err) });
        });
      });
    },
  };
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

class Editor {
  private batches = new Map<string, Batch>();
  private queue: Array<{ batch: Batch; item: ProposalItem }> = [];
  private running = new Map<ProposalItem, ChildProcess>();
  /** Every live Codex process, including idea requests, so shutdown can stop them all. */
  private children = new Set<ChildProcess>();
  /**
   * Attempt counter per item. Cancelling bumps it, so a process that is still shutting down
   * cannot write its result over a retry started in the meantime.
   */
  private attempts = new WeakMap<ProposalItem, number>();
  private ideasBusy = false;

  constructor(
    private readonly concepts: string,
    private readonly outDir: string,
  ) {
    this.load();
  }

  // ---------------------------------------------------------------- persistence

  /** Batches from earlier sessions. Anything still marked as in progress died with the old server. */
  private load(): void {
    if (!existsSync(this.outDir)) return;
    for (const dir of readdirSync(this.outDir, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const metaPath = join(this.outDir, dir.name, 'meta.json');
      if (!existsSync(metaPath)) continue;
      try {
        const batch = JSON.parse(readFileSync(metaPath, 'utf8')) as Batch;
        if (batch.id !== dir.name || !Array.isArray(batch.items)) continue;
        for (const item of batch.items) {
          if (item.status === 'queued' || item.status === 'running') {
            item.status = 'error';
            item.error = 'Przerwane: serwer został zatrzymany w trakcie generowania.';
          }
        }
        this.batches.set(batch.id, batch);
      } catch {
        // A broken meta.json is skipped, the images stay on disk.
      }
    }
  }

  private save(batch: Batch): void {
    const dir = join(this.outDir, batch.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(batch, null, 2) + '\n');
  }

  // ---------------------------------------------------------------- library

  private library(): LibraryRef[] {
    const refs: LibraryRef[] = [];
    const walk = (dir: string): void => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (full !== this.outDir && !entry.name.startsWith('.')) walk(full);
        } else if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) {
          const id = relative(this.concepts, full).split(sep).join('/');
          refs.push({ id, group: groupOf(id), label: labelOf(id) });
        }
      }
    };
    walk(this.concepts);
    return refs.sort((a, b) => a.id.localeCompare(b.id, 'pl'));
  }

  /** Resolves a library id to a file inside concepts/; rejects anything that escapes the directory. */
  private refPath(id: string): string {
    const full = resolve(this.concepts, id);
    if (!full.startsWith(this.concepts + sep)) throw new HttpError(400, `Niedozwolona ścieżka: ${id}`);
    if (!IMAGE_EXT.has(extname(full).toLowerCase())) throw new HttpError(400, `To nie obraz: ${id}`);
    if (!existsSync(full) || !statSync(full).isFile()) throw new HttpError(404, `Nie ma pliku: ${id}`);
    // A symlink inside concepts/ must not lead outside of it either.
    if (!realpathSync(full).startsWith(realpathSync(this.concepts) + sep)) throw new HttpError(400, `Niedozwolona ścieżka: ${id}`);
    return full;
  }

  // ---------------------------------------------------------------- routing

  async handle(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
    const route = url.pathname.slice(API.length);
    try {
      if (req.method === 'GET' && route === '/state') {
        send(res, 200, {
          refs: this.library(),
          batches: [...this.batches.values()].sort((a, b) => b.created - a.created),
          codex: codexAvailable(),
          formats: FORMATS,
          limits: { refs: MAX_REFS, variants: MAX_VARIANTS },
        });
      } else if (req.method === 'GET' && route.startsWith('/img/')) {
        const file = this.refPath(decodeURIComponent(route.slice('/img/'.length)));
        res.statusCode = 200;
        res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        createReadStream(file)
          .on('error', () => {
            // The file can vanish between the check and the read (a proposal deleted meanwhile).
            if (!res.headersSent) res.statusCode = 404;
            res.end();
          })
          .pipe(res);
      } else if (req.method === 'POST' && route === '/generate') {
        send(res, 200, this.generate(await body(req)));
      } else if (req.method === 'POST' && route === '/ideas') {
        send(res, 200, await this.ideas(await body(req)));
      } else if (req.method === 'POST' && route === '/item') {
        send(res, 200, this.itemAction(await body(req)));
      } else if (req.method === 'POST' && route === '/batch') {
        send(res, 200, this.batchAction(await body(req)));
      } else {
        send(res, 404, { error: 'Nie ma takiej operacji.' });
      }
    } catch (err) {
      if (err instanceof HttpError) send(res, err.status, { error: err.message });
      else throw err;
    }
  }

  // ---------------------------------------------------------------- generation

  private generate(input: Record<string, unknown>): Batch {
    const prompt = String(input.prompt ?? '').trim();
    if (prompt.length === 0) throw new HttpError(400, 'Wpisz, co ma powstać.');
    if (prompt.length > 4000) throw new HttpError(400, 'Opis jest za długi (limit 4000 znaków).');
    const refs = Array.isArray(input.refs) ? input.refs.map(String) : [];
    if (refs.length > MAX_REFS) throw new HttpError(400, `Najwyżej ${MAX_REFS} referencje.`);
    refs.forEach((id) => this.refPath(id));
    const variants = Math.min(MAX_VARIANTS, Math.max(1, Math.floor(Number(input.variants) || 1)));
    const format = typeof input.format === 'string' && input.format in FORMATS ? input.format : 'kwadrat';
    if (!codexAvailable()) throw new HttpError(503, 'Nie znaleziono polecenia `codex` w PATH.');

    const batch: Batch = {
      id: batchId(),
      created: Date.now(),
      prompt,
      refs,
      format,
      keepStyle: input.keepStyle !== false,
      items: Array.from({ length: variants }, (_, i) => ({ n: i + 1, status: 'queued' as ItemStatus })),
    };
    this.batches.set(batch.id, batch);
    this.save(batch);
    for (const item of batch.items) this.queue.push({ batch, item });
    this.pump();
    return batch;
  }

  private pump(): void {
    while (this.running.size < PARALLEL && this.queue.length > 0) {
      const job = this.queue.shift()!;
      if (job.item.status !== 'queued') continue;
      void this.run(job.batch, job.item);
    }
  }

  private async run(batch: Batch, item: ProposalItem): Promise<void> {
    const attempt = (this.attempts.get(item) ?? 0) + 1;
    this.attempts.set(item, attempt);
    const current = (): boolean => this.attempts.get(item) === attempt && item.status === 'running';
    item.status = 'running';
    item.startedAt = Date.now();
    this.save(batch);
    const work = mkdtempSync(join(tmpdir(), 'megaberg-edytor-'));
    try {
      const lastMessage = join(work, 'odpowiedz.txt');
      const args = ['exec', '--json', '--skip-git-repo-check', '-s', 'read-only', '-C', work, '-o', lastMessage];
      for (const id of batch.refs) args.push('-i', this.refPath(id));
      args.push('-');
      const result = await this.codex(args, imagePrompt(batch, item), item);
      if (!current()) return; // cancelled or deleted while Codex was working
      const image = result.threadId ? newestImage(result.threadId) : undefined;
      if (!image) {
        throw new Error(
          result.code === 0
            ? 'Codex zakończył pracę bez obrazu. ' + tail(readIfExists(lastMessage) || result.errors)
            : `Codex zakończył się kodem ${result.code}. ` + tail(result.errors || result.stderr),
        );
      }
      const file = `${item.n}${extname(image).toLowerCase() || '.png'}`;
      copyFileSync(image, join(this.outDir, batch.id, file));
      item.file = file;
      item.note = readIfExists(lastMessage).trim().slice(0, 600) || undefined;
      item.status = 'done';
    } catch (err) {
      if (current()) {
        item.status = 'error';
        item.error = err instanceof Error ? err.message : String(err);
      }
    } finally {
      rmSync(work, { recursive: true, force: true });
      if (this.attempts.get(item) === attempt) {
        item.finishedAt = Date.now();
        if (this.batches.has(batch.id)) this.save(batch);
      }
      this.pump();
    }
  }

  /** Runs `codex` with the prompt on stdin and collects the thread id from its JSONL events. */
  private codex(
    args: string[],
    prompt: string,
    owner?: ProposalItem,
  ): Promise<{ code: number | null; threadId?: string; stderr: string; errors: string }> {
    return new Promise((done, fail) => {
      const child = spawn('codex', args, { stdio: ['pipe', 'pipe', 'pipe'] });
      if (owner) this.running.set(owner, child);
      this.children.add(child);
      const release = (): void => {
        this.children.delete(child);
        if (owner && this.running.get(owner) === child) this.running.delete(owner);
      };
      let threadId: string | undefined;
      let stderr = '';
      let errors = '';
      let buffer = '';
      const timer = setTimeout(() => {
        errors += 'Przekroczony limit czasu. ';
        child.kill('SIGTERM');
      }, RUN_TIMEOUT_MS);
      child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
        buffer += chunk;
        let nl: number;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('{')) continue;
          try {
            const event = JSON.parse(line) as { type?: string; thread_id?: string; message?: string; error?: { message?: string } };
            if (event.type === 'thread.started' && event.thread_id) threadId = event.thread_id;
            if (event.type === 'error' && event.message) errors += event.message + ' ';
            if (event.type === 'turn.failed' && event.error?.message) errors += event.error.message + ' ';
          } catch {
            // Not an event line.
          }
        }
      });
      child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
        stderr = (stderr + chunk).slice(-4000);
      });
      child.on('error', (err) => {
        clearTimeout(timer);
        release();
        fail(err);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        release();
        done({ code, threadId, stderr, errors });
      });
      child.stdin.on('error', () => undefined);
      child.stdin.end(prompt);
    });
  }

  /** Asks Codex to look at the references and suggest a few directions worth generating. */
  private async ideas(input: Record<string, unknown>): Promise<{ ideas: Array<{ title: string; prompt: string }> }> {
    const refs = Array.isArray(input.refs) ? input.refs.map(String).slice(0, MAX_REFS) : [];
    const paths = refs.map((id) => this.refPath(id));
    if (!codexAvailable()) throw new HttpError(503, 'Nie znaleziono polecenia `codex` w PATH.');
    const hint = String(input.hint ?? '').trim().slice(0, 1000);
    if (this.ideasBusy) throw new HttpError(429, 'Codex już szuka pomysłów. Poczekaj na wynik.');
    this.ideasBusy = true;
    const work = mkdtempSync(join(tmpdir(), 'megaberg-edytor-'));
    try {
      const schema = join(work, 'schemat.json');
      const out = join(work, 'pomysly.json');
      writeFileSync(
        schema,
        JSON.stringify({
          type: 'object',
          additionalProperties: false,
          required: ['ideas'],
          properties: {
            ideas: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'prompt'],
                properties: { title: { type: 'string' }, prompt: { type: 'string' } },
              },
            },
          },
        }),
      );
      const args = ['exec', '--json', '--skip-git-repo-check', '-s', 'read-only', '-C', work, '--output-schema', schema, '-o', out];
      for (const p of paths) args.push('-i', p);
      args.push('-');
      const prompt = [
        'Nie uruchamiaj poleceń powłoki i nie generuj obrazów. Odpowiedz wyłącznie w zadanym schemacie JSON.',
        'Jesteś dyrektorem artystycznym gry „MegaBerg: Słowiańskie Bory” (survivors-like 3D w słowiańskim folklorze, mroczny bór o zmierzchu).',
        refs.length > 0
          ? `Załączone obrazy to zrzuty i koncepty z gry: ${refs.map(labelOf).join('; ')}.`
          : 'Nie ma załączonych referencji: zaproponuj kierunki dla świata gry ogólnie.',
        hint ? `Kierunek od autora: ${hint}` : '',
        'Zaproponuj 5 różnych pomysłów na obraz koncepcyjny, który pomógłby poprawić grafikę gry na podstawie tych referencji.',
        'Każdy pomysł: `title` to 2–4 słowa po polsku, `prompt` to gotowe polecenie dla generatora obrazów po polsku (2–3 zdania, konkretne: co zmienić, co zachować, światło, materiał, kadr).',
      ]
        .filter(Boolean)
        .join('\n');
      const result = await this.codex(args, prompt);
      const raw = readIfExists(out);
      try {
        const parsed = JSON.parse(raw) as { ideas?: Array<{ title?: unknown; prompt?: unknown }> };
        const ideas = (parsed.ideas ?? [])
          .map((i) => ({ title: String(i.title ?? '').trim(), prompt: String(i.prompt ?? '').trim() }))
          .filter((i) => i.title && i.prompt)
          .slice(0, 8);
        if (ideas.length === 0) throw new Error('pusto');
        return { ideas };
      } catch {
        throw new HttpError(502, 'Codex nie zwrócił pomysłów. ' + tail(result.errors || raw || result.stderr));
      }
    } finally {
      this.ideasBusy = false;
      rmSync(work, { recursive: true, force: true });
    }
  }

  // ---------------------------------------------------------------- actions

  private find(input: Record<string, unknown>): { batch: Batch; item?: ProposalItem } {
    const batch = this.batches.get(String(input.batch ?? ''));
    if (!batch) throw new HttpError(404, 'Nie ma takiej serii.');
    const item = batch.items.find((i) => i.n === Number(input.n));
    return { batch, item };
  }

  private itemAction(input: Record<string, unknown>): Batch | { deleted: string } {
    const { batch, item } = this.find(input);
    if (!item) throw new HttpError(404, 'Nie ma takiej propozycji.');
    if (input.action === 'star') {
      item.starred = input.value !== false;
    } else if (input.action === 'delete') {
      this.stop(item);
      if (item.file) rmSync(join(this.outDir, batch.id, basename(item.file)), { force: true });
      batch.items = batch.items.filter((i) => i !== item);
      if (batch.items.length === 0) return this.removeBatch(batch);
    } else if (input.action === 'retry') {
      if (item.status !== 'error') throw new HttpError(400, 'Ponowić można tylko nieudaną propozycję.');
      item.status = 'queued';
      item.error = undefined;
      this.queue.push({ batch, item });
      this.pump();
    } else {
      throw new HttpError(400, 'Nieznana akcja.');
    }
    this.save(batch);
    return batch;
  }

  private batchAction(input: Record<string, unknown>): Batch | { deleted: string } {
    const { batch } = this.find(input);
    if (input.action === 'cancel') {
      for (const item of batch.items) {
        if (item.status === 'queued' || item.status === 'running') {
          this.stop(item);
          item.status = 'error';
          item.error = 'Anulowane.';
        }
      }
      this.save(batch);
      return batch;
    }
    if (input.action === 'delete') {
      for (const item of batch.items) this.stop(item);
      return this.removeBatch(batch);
    }
    throw new HttpError(400, 'Nieznana akcja.');
  }

  private removeBatch(batch: Batch): { deleted: string } {
    this.batches.delete(batch.id);
    // batch.id comes from our own map, so this stays inside concepts/propozycje/.
    rmSync(join(this.outDir, batch.id), { recursive: true, force: true });
    return { deleted: batch.id };
  }

  private stop(item: ProposalItem): void {
    this.queue = this.queue.filter((job) => job.item !== item);
    this.attempts.set(item, (this.attempts.get(item) ?? 0) + 1);
    const child = this.running.get(item);
    if (child) {
      item.status = 'error';
      item.error = 'Anulowane.';
      // Freed right away: a retry of this item must not be confused with the process being stopped.
      this.running.delete(item);
      child.kill('SIGTERM');
    }
  }

  stopAll(): void {
    this.queue = [];
    for (const child of this.children) child.kill('SIGTERM');
  }
}

// -------------------------------------------------------------------- helpers

function imagePrompt(batch: Batch, item: ProposalItem): string {
  const total = batch.items.length;
  const lines = [
    'Użyj wbudowanego narzędzia generowania obrazów i wygeneruj dokładnie jeden obraz. ' +
      'Nie uruchamiaj poleceń powłoki, nie czytaj i nie zapisuj żadnych plików.',
    'Kontekst: gra „MegaBerg: Słowiańskie Bory”, survivors-like 3D w słowiańskim folklorze.',
  ];
  if (batch.refs.length > 0) {
    lines.push(`Załączone obrazy to referencje z gry (w kolejności): ${batch.refs.map(labelOf).join('; ')}.`);
  }
  lines.push(`Zadanie: ${batch.prompt}`);
  lines.push(`Format obrazu: ${FORMATS[batch.format] ?? FORMATS.kwadrat}.`);
  if (batch.keepStyle) lines.push(STYLE_NOTE);
  if (total > 1) {
    lines.push(
      `To propozycja ${item.n} z ${total} generowanych niezależnie. ${VARIANT_ANGLES[(item.n - 1) % VARIANT_ANGLES.length]}`,
    );
  }
  lines.push('Na końcu odpowiedz jednym krótkim zdaniem po polsku: czym ta propozycja różni się od referencji.');
  return lines.join('\n');
}

/** Each variant gets its own nudge, so a batch explores instead of repeating one picture. */
const VARIANT_ANGLES = [
  'Zrób wersję najbliższą referencji: wierną, tylko dopracowaną.',
  'Zrób wersję odważniejszą: mocniejsze światło, kontrast i charakter.',
  'Zrób wersję z innym pomysłem na detal i materiały (faktury, ozdoby, ornament).',
  'Zrób wersję najbardziej stylizowaną: uproszczone, wyraziste kształty i mocna sylwetka.',
];

function groupOf(id: string): string {
  const name = basename(id);
  if (name.startsWith('bohater-')) return 'bohaterowie';
  if (name.startsWith('wrog-')) return 'wrogowie';
  if (name.startsWith('sceneria-')) return 'scenerie';
  if (name.startsWith('walka-')) return 'walka';
  return 'koncepty';
}

function labelOf(id: string): string {
  return basename(id, extname(id))
    .replace(/^(bohater|wrog|sceneria|walka)-/, (_, g: string) => ({ bohater: 'bohater ', wrog: 'wróg ', sceneria: 'sceneria ', walka: 'walka ' })[g] ?? '')
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ');
}

function batchId(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${randomBytes(2).toString('hex')}`;
}

function codexHome(): string {
  return process.env.CODEX_HOME || join(homedir(), '.codex');
}

function newestImage(threadId: string): string | undefined {
  const dir = join(codexHome(), 'generated_images', basename(threadId));
  if (!existsSync(dir)) return undefined;
  return readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .map((f) => ({ path: join(dir, f), time: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time)[0]?.path;
}

let codexFound: boolean | undefined;
function codexAvailable(): boolean {
  if (codexFound === undefined) {
    codexFound = (process.env.PATH ?? '').split(':').some((dir) => dir && existsSync(join(dir, 'codex')));
  }
  return codexFound;
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function tail(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 300 ? '…' + clean.slice(-300) : clean;
}

function send(res: ServerResponse, status: number, data: unknown): void {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((done, fail) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      raw += chunk;
      if (raw.length > 100_000) {
        fail(new HttpError(413, 'Za duże żądanie.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed: unknown = raw ? JSON.parse(raw) : {};
        if (typeof parsed !== 'object' || parsed === null) throw new Error();
        done(parsed as Record<string, unknown>);
      } catch {
        fail(new HttpError(400, 'Niepoprawny JSON.'));
      }
    });
    req.on('error', fail);
  });
}
