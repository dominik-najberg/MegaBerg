// Concept editor backend: a dev-server-only Vite plugin (never part of the production build).
//
// It serves the reference library from concepts/, generates proposal images from chosen references
// and keeps the results in concepts/propozycje/<batch>/ next to a meta.json.
//
// Two kinds of engines draw the pictures: the Codex CLI (local process, the user's ChatGPT account)
// and image-edit models on WaveSpeedAI (HTTP API, key in .env as WAVESPEED). One batch can mix them,
// so the same request can be compared across models.
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
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { writeFile } from 'node:fs/promises';
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
/** One batch is at most this many pictures, across all chosen engines. */
const MAX_ITEMS = 12;
/** Runs at once per lane; the rest of a batch waits in the queue. */
const PARALLEL: Record<Lane, number> = { codex: 3, wavespeed: 6 };
const RUN_TIMEOUT_MS = 8 * 60 * 1000;

type Lane = 'codex' | 'wavespeed';

export interface Engine {
  /** `codex`, or the WaveSpeed model path used in the API URL. */
  id: string;
  label: string;
  lane: Lane;
  /** List price in USD for one picture from one reference, by resolution. Indicative only. */
  price: Record<string, number>;
  /** USD added per reference beyond the first. */
  extraRef: number;
  available?: boolean;
}

const ENGINES: Engine[] = [
  { id: 'codex', label: 'Codex', lane: 'codex', price: {}, extraRef: 0 },
  { id: 'openai/gpt-image-2.6-flare/edit', label: 'GPT Image 2.6 Flare', lane: 'wavespeed', price: { '1k': 0.065, '2k': 0.115 }, extraRef: 0.015 },
  { id: 'openai/gpt-image-2.6-sunburst/edit', label: 'GPT Image 2.6 Sunburst', lane: 'wavespeed', price: { '1k': 0.065, '2k': 0.115 }, extraRef: 0.015 },
  { id: 'google/nano-banana-2.1/edit', label: 'Nano Banana 2.1', lane: 'wavespeed', price: { '1k': 0.04, '2k': 0.06 }, extraRef: 0.002 },
  { id: 'bytedance/seedream-v5.5/edit', label: 'Seedream 5.5', lane: 'wavespeed', price: { '1k': 0.028, '2k': 0.043 }, extraRef: 0.008 },
];

const WAVESPEED_API = 'https://api.wavespeed.ai/api/v3';
const ASPECT: Record<string, string> = { kwadrat: '1:1', poziom: '16:9', pion: '2:3' };
const RESOLUTIONS = ['1k', '2k'];
/** WaveSpeed keeps uploaded files for 7 days; an upload is reused for a little less than that. */
const UPLOAD_TTL_MS = 6 * 24 * 60 * 60 * 1000;
const MAX_DOWNLOAD_BYTES = 60 * 1024 * 1024;

export type ItemStatus = 'queued' | 'running' | 'done' | 'error';

export interface ProposalItem {
  n: number;
  status: ItemStatus;
  /** Engine id; missing in batches made before engines existed, which were all Codex. */
  engine?: string;
  /**
   * WaveSpeed task id of a submitted, not yet collected picture. Kept across a failed poll or download,
   * so that retrying picks the paid result up instead of submitting (and paying for) a new task.
   */
  task?: string;
  /** Which variant nudge this picture got (index into VARIANT_ANGLES), when the batch asked for several. */
  angle?: number;
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
  /** `skorka`: a reskin of the existing model rather than a free concept. */
  mode?: 'koncept' | 'skorka';
  /** WaveSpeed output resolution. */
  resolution?: string;
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

const SKIN_NOTE =
  'To ma być nowa skórka, czyli wariant wyglądu istniejącego modelu 3D z referencji. Zachowaj dokładnie bryłę, ' +
  'kanciaste niskopoligonowe kształty, proporcje, pozę, kadr i widok kamery. Zmień wyłącznie kolory, materiały, ' +
  'wzory i drobne dodatki, które da się nałożyć na ten sam model. Tło jednolite i neutralne, jak w referencji.';

export function conceptEditor(): Plugin {
  return {
    name: 'megaberg-edytor-konceptow',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const concepts = resolve(root, 'concepts');
      const outDir = join(concepts, 'propozycje');
      const editor = new Editor(root, concepts, outDir);
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
  private running = new Map<ProposalItem, { lane: Lane; stop: () => void }>();
  /** Reference file (path, size, mtime) to its uploaded WaveSpeed URL. */
  private uploads = new Map<string, { at: number; url: Promise<string> }>();
  /** Every live Codex process, including idea requests, so shutdown can stop them all. */
  private children = new Set<ChildProcess>();
  /**
   * Attempt counter per item. Cancelling bumps it, so a process that is still shutting down
   * cannot write its result over a retry started in the meantime.
   */
  private attempts = new WeakMap<ProposalItem, number>();
  private ideasBusy = false;

  constructor(
    private readonly root: string,
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
          wavespeed: wavespeedKey(this.root) !== undefined,
          engines: this.engines(),
          formats: FORMATS,
          resolutions: RESOLUTIONS,
          limits: { refs: MAX_REFS, variants: MAX_VARIANTS, items: MAX_ITEMS },
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
      } else if (req.method === 'POST' && route === '/cleanup') {
        send(res, 200, this.cleanup(await body(req)));
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
    const resolution = typeof input.resolution === 'string' && RESOLUTIONS.includes(input.resolution) ? input.resolution : '1k';
    const wanted = Array.isArray(input.engines) ? [...new Set(input.engines.map(String))] : ['codex'];
    const engines = wanted.map((id) => {
      const engine = ENGINES.find((e) => e.id === id);
      if (!engine) throw new HttpError(400, `Nieznany model: ${id}`);
      return engine;
    });
    if (engines.length === 0) throw new HttpError(400, 'Wybierz co najmniej jeden model.');
    if (engines.length * variants > MAX_ITEMS) {
      throw new HttpError(400, `Najwyżej ${MAX_ITEMS} obrazów w jednej serii (modele × propozycje).`);
    }
    if (engines.some((e) => e.lane === 'codex') && !codexAvailable()) {
      throw new HttpError(503, 'Nie znaleziono polecenia `codex` w PATH.');
    }
    if (engines.some((e) => e.lane === 'wavespeed')) {
      if (wavespeedKey(this.root) === undefined) throw new HttpError(503, 'Brak klucza WaveSpeed: dopisz WAVESPEED=… do pliku .env.');
      if (refs.length === 0) throw new HttpError(400, 'Modele WaveSpeed przerabiają obraz: wybierz co najmniej jedną referencję.');
    }

    const batch: Batch = {
      id: batchId(),
      created: Date.now(),
      prompt,
      refs,
      format,
      keepStyle: input.keepStyle !== false,
      mode: input.mode === 'skorka' ? 'skorka' : 'koncept',
      resolution,
      items: engines.flatMap((engine, e) =>
        Array.from({ length: variants }, (_, v) => ({
          n: e * variants + v + 1,
          status: 'queued' as ItemStatus,
          engine: engine.id,
          angle: variants > 1 ? v : undefined,
        })),
      ),
    };
    this.batches.set(batch.id, batch);
    this.save(batch);
    for (const item of batch.items) this.queue.push({ batch, item });
    this.pump();
    return batch;
  }

  private engines(): Engine[] {
    const codex = codexAvailable();
    const wavespeed = wavespeedKey(this.root) !== undefined;
    return ENGINES.map((e) => ({ ...e, available: e.lane === 'codex' ? codex : wavespeed }));
  }

  /** Starts queued jobs in order, as far as each lane has room. */
  private pump(): void {
    const busy: Record<Lane, number> = { codex: 0, wavespeed: 0 };
    for (const job of this.running.values()) busy[job.lane]++;
    const waiting: typeof this.queue = [];
    for (const job of this.queue) {
      if (job.item.status !== 'queued') continue;
      const lane = engineOf(job.item).lane;
      if (busy[lane] < PARALLEL[lane]) {
        busy[lane]++;
        void this.run(job.batch, job.item);
      } else {
        waiting.push(job);
      }
    }
    this.queue = waiting;
  }

  private async run(batch: Batch, item: ProposalItem): Promise<void> {
    const attempt = (this.attempts.get(item) ?? 0) + 1;
    this.attempts.set(item, attempt);
    const current = (): boolean => this.attempts.get(item) === attempt && item.status === 'running';
    const engine = engineOf(item);
    const abort = new AbortController();
    item.status = 'running';
    item.startedAt = Date.now();
    item.finishedAt = undefined;
    // Registered before the first await, so the lane count in pump() is right immediately.
    this.running.set(item, { lane: engine.lane, stop: () => abort.abort() });
    this.save(batch);
    try {
      const result = engine.lane === 'codex' ? await this.runCodex(batch, item, abort.signal) : await this.runWaveSpeed(batch, item, engine, abort.signal);
      // Each run writes to its own temporary file; only the run that is still current publishes it,
      // so a cancelled run finishing late can never overwrite the picture of a retry.
      if (!current()) {
        rmSync(result.temp, { force: true });
        return;
      }
      const file = `${item.n}${result.ext}`;
      renameSync(result.temp, join(this.outDir, batch.id, file));
      item.file = file;
      item.note = result.note;
      item.task = undefined;
      item.status = 'done';
    } catch (err) {
      if (current()) {
        item.status = 'error';
        item.error = err instanceof Error ? err.message : String(err);
      }
    } finally {
      if (this.attempts.get(item) === attempt) {
        this.running.delete(item);
        item.finishedAt = Date.now();
        if (this.batches.has(batch.id)) this.save(batch);
      }
      this.pump();
    }
  }

  /** A file name inside the batch directory that no other run uses; not an image extension, so nothing lists it. */
  private tempFile(batch: Batch): string {
    return join(this.outDir, batch.id, `.w-toku-${randomBytes(6).toString('hex')}`);
  }

  private async runCodex(batch: Batch, item: ProposalItem, signal: AbortSignal): Promise<{ temp: string; ext: string; note?: string }> {
    const work = mkdtempSync(join(tmpdir(), 'megaberg-edytor-'));
    try {
      const lastMessage = join(work, 'odpowiedz.txt');
      const args = ['exec', '--json', '--skip-git-repo-check', '-s', 'read-only', '-C', work, '-o', lastMessage];
      for (const id of batch.refs) args.push('-i', this.refPath(id));
      args.push('-');
      const result = await this.codex(args, imagePrompt(batch, item), signal);
      if (signal.aborted) throw new Error('Anulowane.');
      const image = result.threadId ? newestImage(result.threadId) : undefined;
      if (!image) {
        throw new Error(
          result.code === 0
            ? 'Codex zakończył pracę bez obrazu. ' + tail(readIfExists(lastMessage) || result.errors)
            : `Codex zakończył się kodem ${result.code}. ` + tail(result.errors || result.stderr),
        );
      }
      const temp = this.tempFile(batch);
      try {
        copyFileSync(image, temp);
      } catch (err) {
        rmSync(temp, { force: true });
        throw err;
      }
      return { temp, ext: extname(image).toLowerCase() || '.png', note: readIfExists(lastMessage).trim().slice(0, 600) || undefined };
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  }

  // ---------------------------------------------------------------- WaveSpeed

  /**
   * One picture from a WaveSpeed edit model: upload the references, submit the task, poll, download.
   * The submit is never retried: a response lost on the way may still be an accepted, billed task.
   */
  private async runWaveSpeed(batch: Batch, item: ProposalItem, engine: Engine, signal: AbortSignal): Promise<{ temp: string; ext: string; note?: string }> {
    const key = wavespeedKey(this.root);
    if (!key) throw new Error('Brak klucza WaveSpeed: dopisz WAVESPEED=… do pliku .env.');
    const auth = { Authorization: `Bearer ${key}` };
    const deadline = Date.now() + RUN_TIMEOUT_MS;
    if (!item.task) item.task = await this.submit(batch, item, engine, key, signal);
    const taskId = item.task;

    let failures = 0;
    for (;;) {
      await sleep(2500, signal);
      if (Date.now() > deadline) throw new Error('Przekroczony limit czasu oczekiwania na WaveSpeed.');
      let task: Record<string, unknown>;
      try {
        task = await wavespeedJson(`${WAVESPEED_API}/predictions/${encodeURIComponent(taskId)}/result`, {
          headers: auth,
          signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]),
        });
        failures = 0;
      } catch (err) {
        // A task WaveSpeed no longer knows cannot be resumed: the next retry submits a new one.
        if (err instanceof Error && err.message.includes('(HTTP 404)')) item.task = undefined;
        // Polling is safe to repeat; only a run of failures in a row gives up.
        if (signal.aborted || item.task === undefined || ++failures >= 6) throw err;
        continue;
      }
      const status = String(task.status ?? '');
      if (status === 'completed') {
        const outputs = Array.isArray(task.outputs) ? task.outputs : [];
        const url = outputs.find((o): o is string => typeof o === 'string' && o.startsWith('https://'));
        if (!url) {
          item.task = undefined;
          throw new Error('WaveSpeed zakończył zadanie bez obrazu.');
        }
        return this.download(url, this.tempFile(batch), signal);
      }
      if (['failed', 'cancelled', 'timeout', 'deleted'].includes(status)) {
        // Nothing to collect from this task any more: a retry has to submit a new one.
        item.task = undefined;
        throw new Error(`WaveSpeed: ${status}. ${tail(describe(task.error))}`.trim());
      }
    }
  }

  /** Uploads the references and submits the task; returns its id. */
  private async submit(batch: Batch, item: ProposalItem, engine: Engine, key: string, signal: AbortSignal): Promise<string> {
    const images: string[] = [];
    for (const id of batch.refs) {
      images.push(await this.upload(this.refPath(id), key));
      if (signal.aborted) throw new Error('Anulowane.');
    }
    const submitted = await wavespeedJson(`${WAVESPEED_API}/${engine.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: editPrompt(batch, item),
        images,
        aspect_ratio: ASPECT[batch.format] ?? '1:1',
        resolution: batch.resolution ?? '1k',
        output_format: 'png',
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(120_000)]),
    });
    const taskId = typeof submitted.id === 'string' ? submitted.id : '';
    if (!taskId) throw new Error('WaveSpeed nie zwrócił identyfikatora zadania.');
    item.task = taskId;
    if (this.batches.has(batch.id)) this.save(batch);
    return taskId;
  }

  /** Uploads a reference once and reuses the URL for every picture that needs it. */
  private upload(path: string, key: string): Promise<string> {
    const stat = statSync(path);
    const cacheKey = `${path}|${stat.size}|${stat.mtimeMs}`;
    const cached = this.uploads.get(cacheKey);
    if (cached && Date.now() - cached.at < UPLOAD_TTL_MS) return cached.url;
    const url = (async () => {
      const type = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
      const slot = await wavespeedJson(`${WAVESPEED_API}/media/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: basename(path), size: stat.size, content_type: type }),
        signal: AbortSignal.timeout(60_000),
      });
      const target = slot.upload as { url?: unknown; method?: unknown; headers?: unknown } | undefined;
      const download = slot.download_url;
      if (typeof target?.url !== 'string' || !target.url.startsWith('https://') || typeof download !== 'string') {
        throw new Error('WaveSpeed nie przyjął pliku referencji.');
      }
      // The signed storage URL gets the bytes and its own headers, never the API key.
      const put = await fetch(target.url, {
        method: typeof target.method === 'string' ? target.method : 'PUT',
        headers: (target.headers ?? {}) as Record<string, string>,
        body: readFileSync(path),
        signal: AbortSignal.timeout(120_000),
      });
      if (!put.ok) throw new Error(`Wysłanie referencji do WaveSpeed nie powiodło się (HTTP ${put.status}).`);
      return download;
    })();
    this.uploads.set(cacheKey, { at: Date.now(), url });
    url.catch(() => {
      if (this.uploads.get(cacheKey)?.url === url) this.uploads.delete(cacheKey);
    });
    return url;
  }

  /** Saves the picture to `temp` and reports its extension; a failed write leaves nothing behind. */
  private async download(url: string, temp: string, signal: AbortSignal): Promise<{ temp: string; ext: string }> {
    const res = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(120_000)]) });
    if (!res.ok) throw new Error(`Nie udało się pobrać obrazu z WaveSpeed (HTTP ${res.status}).`);
    const type = (res.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
    const ext = Object.entries(MIME).find(([, mime]) => mime === type)?.[0] ?? extname(new URL(url).pathname).toLowerCase();
    if (!IMAGE_EXT.has(ext)) throw new Error('WaveSpeed zwrócił plik, który nie jest obrazem.');
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_DOWNLOAD_BYTES) throw new Error('Obraz z WaveSpeed ma nieprawidłowy rozmiar.');
    try {
      await writeFile(temp, bytes);
    } catch (err) {
      rmSync(temp, { force: true });
      throw err;
    }
    return { temp, ext: ext === '.jpeg' ? '.jpg' : ext };
  }

  // ---------------------------------------------------------------- Codex

  /** Runs `codex` with the prompt on stdin and collects the thread id from its JSONL events. */
  private codex(
    args: string[],
    prompt: string,
    signal?: AbortSignal,
  ): Promise<{ code: number | null; threadId?: string; stderr: string; errors: string }> {
    return new Promise((done, fail) => {
      const child = spawn('codex', args, { stdio: ['pipe', 'pipe', 'pipe'] });
      this.children.add(child);
      const kill = (): void => void child.kill('SIGTERM');
      signal?.addEventListener('abort', kill, { once: true });
      if (signal?.aborted) kill();
      const release = (): void => {
        this.children.delete(child);
        signal?.removeEventListener('abort', kill);
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
    const skins = input.mode === 'skorka';
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
        skins
          ? 'Zaproponuj 5 różnych skórek (wariantów wyglądu do odblokowania) dla postaci z referencji: każda z innym motywem ze słowiańskiego folkloru, pór roku albo obrzędów. Skórka zmienia kolory, materiały, wzory i drobne dodatki, a bryła i sylwetka modelu zostają.'
          : 'Zaproponuj 5 różnych pomysłów na obraz koncepcyjny, który pomógłby poprawić grafikę gry na podstawie tych referencji.',
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
      this.pump();
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
      this.pump();
      return batch;
    }
    if (input.action === 'delete') {
      for (const item of batch.items) this.stop(item);
      this.pump();
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
    const job = this.running.get(item);
    if (job) {
      item.status = 'error';
      item.error = 'Anulowane.';
      // Freed right away: a retry of this item must not be confused with the run being stopped.
      this.running.delete(item);
      job.stop();
    }
  }

  /**
   * Bulk delete of finished proposals: `failed` removes the ones that ended in an error,
   * `unstarred` removes every finished one without a star. Pictures still being drawn are left alone.
   */
  private cleanup(input: Record<string, unknown>): { deleted: number } {
    const scope = input.scope;
    if (scope !== 'failed' && scope !== 'unstarred') throw new HttpError(400, 'Nieznany zakres sprzątania.');
    const only = input.batch === undefined ? undefined : String(input.batch);
    if (only !== undefined && !this.batches.has(only)) throw new HttpError(404, 'Nie ma takiej serii.');
    let deleted = 0;
    for (const batch of [...this.batches.values()]) {
      if (only !== undefined && batch.id !== only) continue;
      const doomed = batch.items.filter((i) => (i.status === 'error' ? true : scope === 'unstarred' && i.status === 'done' && !i.starred));
      if (doomed.length === 0) continue;
      for (const item of doomed) {
        if (item.file) rmSync(join(this.outDir, batch.id, basename(item.file)), { force: true });
      }
      deleted += doomed.length;
      batch.items = batch.items.filter((i) => !doomed.includes(i));
      if (batch.items.length === 0) this.removeBatch(batch);
      else this.save(batch);
    }
    return { deleted };
  }

  stopAll(): void {
    this.queue = [];
    for (const job of this.running.values()) job.stop();
    for (const child of this.children) child.kill('SIGTERM');
  }
}

// -------------------------------------------------------------------- helpers

function imagePrompt(batch: Batch, item: ProposalItem): string {
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
  if (batch.mode === 'skorka') lines.push(SKIN_NOTE);
  if (batch.keepStyle) lines.push(STYLE_NOTE);
  const angle = angleOf(batch, item);
  if (angle) lines.push(`To jedna z kilku propozycji generowanych niezależnie. ${angle}`);
  lines.push('Na końcu odpowiedz jednym krótkim zdaniem po polsku: czym ta propozycja różni się od referencji.');
  return lines.join('\n');
}

/** Prompt for an image-edit model: the references are its input images, the format goes in as a parameter. */
function editPrompt(batch: Batch, item: ProposalItem): string {
  const lines = ['Kontekst: gra „MegaBerg: Słowiańskie Bory”, survivors-like 3D w słowiańskim folklorze.'];
  if (batch.refs.length > 1) lines.push(`Obrazy wejściowe to referencje z gry (w kolejności): ${batch.refs.map(labelOf).join('; ')}.`);
  else lines.push(`Obraz wejściowy to referencja z gry: ${batch.refs.map(labelOf).join('')}.`);
  lines.push(`Zadanie: ${batch.prompt}`);
  if (batch.mode === 'skorka') lines.push(SKIN_NOTE);
  if (batch.keepStyle) lines.push(STYLE_NOTE);
  const angle = angleOf(batch, item);
  if (angle) lines.push(angle);
  return lines.join('\n');
}

function angleOf(batch: Batch, item: ProposalItem): string | undefined {
  // Batches from before engines existed numbered their variants by `n` alone.
  const index = item.angle ?? (item.engine === undefined && batch.items.length > 1 ? item.n - 1 : undefined);
  return index === undefined ? undefined : VARIANT_ANGLES[index % VARIANT_ANGLES.length];
}

function engineOf(item: ProposalItem): Engine {
  return ENGINES.find((e) => e.id === (item.engine ?? 'codex')) ?? ENGINES[0]!;
}

/** The key lives in .env (WAVESPEED=…) or the environment; it is read on demand and never sent to the page. */
function wavespeedKey(root: string): string | undefined {
  const fromEnv = process.env.WAVESPEED?.trim();
  if (fromEnv) return fromEnv;
  const match = /^\s*(?:export\s+)?WAVESPEED\s*=\s*(.*)$/m.exec(readIfExists(join(root, '.env')));
  const value = match?.[1]?.trim().replace(/^(['"])(.*)\1$/, '$2').trim();
  return value || undefined;
}

/** Calls the WaveSpeed API and unwraps its `{code, message, data}` envelope. */
async function wavespeedJson(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(url, init);
  const text = await res.text();
  let parsed: { code?: unknown; message?: unknown; data?: unknown } = {};
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch {
    // Handled below: a non-JSON body is an error either way.
  }
  const failed = !res.ok || (typeof parsed.code === 'number' && parsed.code !== 200);
  if (failed || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error(`WaveSpeed (HTTP ${res.status}): ${tail(describe(parsed.message) || text) || 'pusta odpowiedź'}`);
  }
  return parsed.data as Record<string, unknown>;
}

function describe(value: unknown): string {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((done, fail) => {
    if (signal.aborted) return fail(new Error('Anulowane.'));
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      done();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      fail(new Error('Anulowane.'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
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
