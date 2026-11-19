// Concept editor frontend: pick references from concepts/, describe what should come out,
// and let the dev server run Codex to produce proposal images. Talks to tools/edytor/plugin.ts.
import type { Batch, LibraryRef, ProposalItem } from './plugin';

const API = '/__edytor';

interface ServerState {
  refs: LibraryRef[];
  batches: Batch[];
  codex: boolean;
  formats: Record<string, string>;
  limits: { refs: number; variants: number };
}

interface Idea {
  title: string;
  prompt: string;
}

const TABS: Array<[string, string]> = [
  ['wszystko', 'Wszystko'],
  ['bohaterowie', 'Bohaterowie'],
  ['wrogowie', 'Wrogowie'],
  ['scenerie', 'Scenerie'],
  ['walka', 'Walka'],
  ['koncepty', 'Koncepty'],
  ['ulubione', '★ Propozycje'],
];

const CHARACTER_PRESETS: Idea[] = [
  {
    title: 'Dopracowany koncept',
    prompt:
      'Narysuj dopracowany concept art tej postaci. Zachowaj sylwetkę, proporcje i paletę z referencji, dodaj czytelne materiały (futro, kora, tkanina, metal) i wyraźne światło krawędziowe. Neutralne, ciemne tło.',
  },
  {
    title: 'Arkusz postaci',
    prompt:
      'Arkusz modelu tej postaci: przód, bok i tył obok siebie w tej samej pozie, na jednolitym szarym tle, w równym oświetleniu. Detale muszą się zgadzać między widokami.',
  },
  {
    title: 'Wariant elitarny',
    prompt:
      'Elitarna, groźniejsza odmiana tej postaci: ta sama sylwetka i rozpoznawalne cechy, bogatsze zdobienia, złota poświata, mocniejszy kontrast.',
  },
  {
    title: 'Więcej charakteru',
    prompt:
      'Ta sama postać z wyrazistszą twarzą i gestem: pokaż jej charakter w pozie i mimice, nie zmieniając stroju ani palety. Kadr do pasa, ciemne tło boru.',
  },
];

const PRESETS: Record<string, Idea[]> = {
  bohaterowie: CHARACTER_PRESETS,
  wrogowie: CHARACTER_PRESETS,
  scenerie: [
    {
      title: 'Malarski paintover',
      prompt:
        'Paintover tego kadru: zachowaj kompozycję i rozmieszczenie obiektów, dopracuj światło, mgłę, roślinność i faktury tak, jak mogłaby wyglądać docelowa grafika gry.',
    },
    {
      title: 'Nastrój i światło',
      prompt:
        'Ten sam kadr z mocniejszym nastrojem: snopy światła między pniami, mgła przy ziemi, ciepły blask ognia przeciw chłodnej nocy. Obiekty zostają na swoich miejscach.',
    },
    {
      title: 'Bogatsze otoczenie',
      prompt:
        'Ten sam kadr z bogatszym otoczeniem: paprocie, grzyby, korzenie, kamienie z runami, wstążki na gałęziach. Wszystko, co dałoby się zbudować jako modele 3D o niskiej liczbie wielokątów.',
    },
    {
      title: 'Inna pora',
      prompt: 'To samo miejsce o świcie we mgle: chłodne, blade światło, rosa, spokój przed kolejną nocą.',
    },
  ],
  walka: [
    {
      title: 'Paintover walki',
      prompt:
        'Paintover tego kadru z rozgrywki: zachowaj układ postaci i kamerę, dopracuj efekty broni, światło i czytelność bohatera na tle hordy.',
    },
    {
      title: 'Czytelność',
      prompt:
        'Ten sam kadr z lepszą czytelnością: bohater wyraźnie odcięty od tła, wrogowie rozróżnialni sylwetką i kolorem, efekty nie zasłaniają ziemi pod nogami.',
    },
    {
      title: 'Efekty i magia',
      prompt:
        'Ten sam kadr z efektownymi, ale czytelnymi efektami: iskry, żar, błyskawice Peruna, bursztynowe odłamki. Bez zmiany układu sceny.',
    },
  ],
  koncepty: [
    {
      title: 'Kadr z rozgrywki',
      prompt:
        'Pokaż, jak wyglądałby kadr z rozgrywki w tym kierunku artystycznym: kamera zza pleców bohatera, horda wrogów, czytelna ziemia, bez interfejsu.',
    },
    {
      title: 'Rozwiń kierunek',
      prompt: 'Rozwiń ten kierunek artystyczny w nowy obraz: inne miejsce tego samego świata, ta sama paleta, światło i poziom stylizacji.',
    },
    {
      title: 'Zestaw rekwizytów',
      prompt: 'Arkusz 6–8 rekwizytów i elementów scenografii w tym stylu, każdy osobno na jednolitym ciemnym tle.',
    },
  ],
  brak: [
    {
      title: 'Nowy wróg',
      prompt:
        'Concept art nowego wroga ze słowiańskiego folkloru (np. rusałka, wodnik, zmora): pełna postać, czytelna sylwetka z daleka, ciemne tło boru.',
    },
    {
      title: 'Nowe miejsce',
      prompt:
        'Concept art nowego miejsca w borze (np. zatopiona cerkiew, uroczysko, młyn nad strumieniem) o zmierzchu, z ciepłym źródłem światła.',
    },
  ],
};

// -------------------------------------------------------------------- state

let state: ServerState = { refs: [], batches: [], codex: true, formats: {}, limits: { refs: 4, variants: 4 } };
let selected: string[] = [];
let tab = 'wszystko';
let search = '';
let ideas: Idea[] = [];
let ideasFor = '';
let ideasBusy = false;
let formError = '';
let submitting = false;
let lightbox: { images: Array<{ src: string; caption: string }>; title: string } | null = null;
let lastLibraryKey = '';
let lastResultsKey = '';

// -------------------------------------------------------------------- dom helpers

type Child = Node | string | null | undefined | false;

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  const { class: cls, ...rest } = props;
  if (cls) el.className = cls;
  Object.assign(el, rest);
  for (const child of children) if (child) el.append(child);
  return el;
}

function img(id: string): string {
  return `${API}/img/${id.split('/').map(encodeURIComponent).join('/')}`;
}

function refLabel(id: string): string {
  const known = state.refs.find((r) => r.id === id);
  if (known) return known.label;
  const proposal = /^propozycje\/([^/]+)\/(\d+)\./.exec(id);
  return proposal ? `propozycja ${proposal[2]}` : id;
}

function refGroup(id: string): string {
  return state.refs.find((r) => r.id === id)?.group ?? 'koncepty';
}

async function api<T>(path: string, payload?: unknown): Promise<T> {
  const res = await fetch(API + path, payload === undefined ? undefined : { method: 'POST', body: JSON.stringify(payload) });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Błąd ${res.status}`);
  return data;
}

// -------------------------------------------------------------------- skeleton

const statusEl = h('span', { class: 'status' });
const tabsEl = h('div', { class: 'tabs' });
const searchEl = h('input', { type: 'search', placeholder: 'Szukaj: leszy, bagno, tył…' });
const libraryEl = h('div', { class: 'grid' });
const refsEl = h('div', { class: 'refs' });
const promptEl = h('textarea', { placeholder: 'Co ma powstać? Np. „dopracowany concept art tej postaci, ta sama sylwetka, lepsze materiały”.' });
const chipsEl = h('div', { class: 'chips' });
const variantsEl = h('select');
const formatEl = h('select');
const styleEl = h('input', { type: 'checkbox', checked: true });
const generateEl = h('button', { class: 'primary' }, 'Generuj propozycje');
const formErrorEl = h('span', { class: 'error' });
const resultsEl = h('div');
const lightboxHost = h('div');

document.getElementById('app')!.append(
  h(
    'header',
    {},
    h('h1', {}, 'Edytor konceptów'),
    h('span', { class: 'sub' }, 'referencje z concepts/ → propozycje z Codeksa → concepts/propozycje/'),
    statusEl,
  ),
  h(
    'main',
    {},
    h(
      'section',
      {},
      h('div', { class: 'head' }, h('h2', {}, 'Biblioteka'), searchEl, tabsEl),
      h('div', { class: 'scroll' }, libraryEl),
    ),
    h(
      'section',
      {},
      h(
        'div',
        { class: 'scroll' },
        h('div', { class: 'head', style: 'padding-left:0' } as never, h('h2', {}, 'Zlecenie')),
        h('div', { class: 'field', style: 'margin-top:0' } as never, h('span', { class: 'name' }, 'Referencje'), refsEl),
        h('div', { class: 'field' }, h('span', { class: 'name' }, 'Podpowiedzi'), chipsEl),
        h('div', { class: 'field' }, h('span', { class: 'name' }, 'Opis'), promptEl),
        h(
          'div',
          { class: 'field options' },
          h('label', { class: 'row' }, 'Propozycji', variantsEl),
          h('label', { class: 'row' }, 'Format', formatEl),
          h('label', { class: 'row' }, styleEl, 'Trzymaj styl gry'),
        ),
        h('div', { class: 'actions' }, generateEl, formErrorEl),
        h(
          'p',
          { class: 'hint' },
          'Każda propozycja to osobne uruchomienie Codeksa (zwykle 1–2 minuty) i idzie na konto, na które zalogowany jest `codex`. Skrót: Ctrl+Enter.',
        ),
      ),
    ),
    h('section', { class: 'results' }, h('div', { class: 'head' }, h('h2', {}, 'Propozycje')), h('div', { class: 'scroll' }, resultsEl)),
  ),
  lightboxHost,
);

// -------------------------------------------------------------------- draft

const DRAFT_KEY = 'megaberg-edytor-szkic';

/**
 * The form survives a page reload: the dev server reloads every open page whenever a game source
 * file is saved, which happens all the time while someone works on the game next to the editor.
 */
function saveDraft(): void {
  try {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ selected, tab, prompt: promptEl.value, variants: variantsEl.value, format: formatEl.value, keepStyle: styleEl.checked }),
    );
  } catch {
    // Storage can be unavailable; the form then simply starts empty.
  }
}

function loadDraft(): { variants?: string; format?: string } {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, unknown>;
    if (Array.isArray(draft.selected)) selected = draft.selected.map(String).slice(0, 4);
    if (typeof draft.tab === 'string' && TABS.some(([id]) => id === draft.tab)) tab = draft.tab;
    if (typeof draft.prompt === 'string') promptEl.value = draft.prompt;
    if (typeof draft.keepStyle === 'boolean') styleEl.checked = draft.keepStyle;
    return { variants: typeof draft.variants === 'string' ? draft.variants : undefined, format: typeof draft.format === 'string' ? draft.format : undefined };
  } catch {
    return {};
  }
}

const draft = loadDraft();

// -------------------------------------------------------------------- library

function renderTabs(): void {
  tabsEl.replaceChildren(
    ...TABS.map(([id, label]) =>
      h('button', { class: 'small' + (tab === id ? ' on' : ''), onclick: () => ((tab = id), saveDraft(), renderTabs(), renderLibrary()) }, label),
    ),
  );
}

/** Starred proposals double as references, so a good result can be iterated on. */
function starredRefs(): LibraryRef[] {
  const out: LibraryRef[] = [];
  for (const batch of state.batches) {
    for (const item of batch.items) {
      if (item.starred && item.file) {
        out.push({ id: `propozycje/${batch.id}/${item.file}`, group: 'ulubione', label: `propozycja ${item.n}: ${batch.prompt}` });
      }
    }
  }
  return out;
}

function renderLibrary(): void {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const pool = tab === 'ulubione' ? starredRefs() : state.refs.filter((r) => tab === 'wszystko' || r.group === tab);
  const shown = pool.filter((r) => words.every((w) => r.label.toLowerCase().includes(w) || r.id.toLowerCase().includes(w)));
  if (shown.length === 0) {
    libraryEl.replaceChildren(
      h(
        'p',
        { class: 'hint', style: 'grid-column:1/-1' } as never,
        tab === 'ulubione'
          ? 'Oznacz propozycję gwiazdką, żeby użyć jej tutaj jako referencji.'
          : state.refs.length === 0
            ? 'Folder concepts/ jest pusty. Zrzuty z gry robi `npm run refpack`.'
            : 'Nic nie pasuje do filtra.',
      ),
    );
    return;
  }
  libraryEl.replaceChildren(
    ...shown.map((ref) => {
      const order = selected.indexOf(ref.id);
      return h(
        'button',
        {
          class: 'thumb' + (order >= 0 ? ' selected' : ''),
          title: ref.id,
          onclick: () => toggleRef(ref.id),
        },
        h('img', { src: img(ref.id), loading: 'lazy', alt: ref.label }),
        order >= 0 && h('span', { class: 'badge' }, String(order + 1)),
        h('span', { class: 'cap' }, ref.label),
      );
    }),
  );
}

function toggleRef(id: string): void {
  if (selected.includes(id)) selected = selected.filter((s) => s !== id);
  else if (selected.length >= state.limits.refs) {
    formError = `Najwyżej ${state.limits.refs} referencje naraz.`;
    renderForm();
    return;
  } else selected = [...selected, id];
  formError = '';
  renderLibrary();
  renderForm();
}

// -------------------------------------------------------------------- form

function renderForm(): void {
  refsEl.replaceChildren(
    ...(selected.length === 0
      ? [h('div', { class: 'empty' }, 'Wybierz z biblioteki do 4 obrazów. Bez referencji Codex narysuje obraz z samego opisu.')]
      : selected.map((id) =>
          h(
            'div',
            { class: 'ref' },
            h('img', {
              src: img(id),
              alt: refLabel(id),
              onclick: () => openLightbox(refLabel(id), [{ src: img(id), caption: refLabel(id) }]),
            }),
            h('button', { class: 'small', title: 'Usuń z referencji', onclick: () => toggleRef(id) }, '×'),
            h('span', { class: 'cap' }, refLabel(id)),
          ),
        )),
  );

  const group = selected.length > 0 ? refGroup(selected[0]!) : 'brak';
  const presets = PRESETS[group] ?? PRESETS.koncepty!;
  const key = selected.join('|');
  const fresh = ideasFor === key ? ideas : [];
  chipsEl.replaceChildren(
    ...presets.map((p) => h('button', { title: p.prompt, onclick: () => usePrompt(p.prompt) }, p.title)),
    ...fresh.map((p) => h('button', { class: 'idea', title: p.prompt, onclick: () => usePrompt(p.prompt) }, '✦ ' + p.title)),
    h(
      'button',
      { class: 'idea', disabled: ideasBusy || !state.codex, onclick: () => void askIdeas() },
      ideasBusy ? 'Codex ogląda referencje…' : '✦ Zaproponuj pomysły',
    ),
  );

  saveDraft();
  generateEl.disabled = submitting || !state.codex;
  generateEl.textContent = submitting ? 'Wysyłam…' : 'Generuj propozycje';
  formErrorEl.textContent = formError;
}

function usePrompt(text: string): void {
  promptEl.value = text;
  saveDraft();
  promptEl.focus();
}

async function askIdeas(): Promise<void> {
  const key = selected.join('|');
  ideasBusy = true;
  formError = '';
  renderForm();
  try {
    const res = await api<{ ideas: Idea[] }>('/ideas', { refs: selected, hint: promptEl.value });
    ideas = res.ideas;
    ideasFor = key;
  } catch (err) {
    formError = err instanceof Error ? err.message : String(err);
  } finally {
    ideasBusy = false;
    renderForm();
  }
}

async function generate(): Promise<void> {
  if (submitting) return;
  submitting = true;
  formError = '';
  renderForm();
  try {
    await api<Batch>('/generate', {
      refs: selected,
      prompt: promptEl.value,
      variants: Number(variantsEl.value),
      format: formatEl.value,
      keepStyle: styleEl.checked,
    });
    await refresh();
  } catch (err) {
    formError = err instanceof Error ? err.message : String(err);
  } finally {
    submitting = false;
    renderForm();
  }
}

generateEl.onclick = () => void generate();
promptEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void generate();
});
for (const el of [promptEl, variantsEl, formatEl, styleEl]) el.addEventListener('input', saveDraft);
searchEl.oninput = () => {
  search = searchEl.value;
  renderLibrary();
};

// -------------------------------------------------------------------- results

function elapsed(item: ProposalItem): string {
  const s = Math.max(0, Math.round((Date.now() - (item.startedAt ?? Date.now())) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function renderResults(): void {
  if (state.batches.length === 0) {
    resultsEl.replaceChildren(
      h('div', { class: 'empty-state' }, 'Tu pojawią się wygenerowane propozycje. Wybierz referencję, kliknij podpowiedź i „Generuj propozycje”.'),
    );
    return;
  }
  resultsEl.replaceChildren(...state.batches.map(renderBatch));
}

function renderBatch(batch: Batch): HTMLElement {
  const busy = batch.items.some((i) => i.status === 'queued' || i.status === 'running');
  const act = (action: string): void => void mutate('/batch', { batch: batch.id, action });
  return h(
    'div',
    { class: 'batch' },
    h(
      'div',
      { class: 'meta' },
      h('div', { class: 'mini' }, ...batch.refs.map((id) => h('img', { src: img(id), alt: '', title: refLabel(id) }))),
      h(
        'div',
        { class: 'text' },
        h('div', { class: 'prompt', title: batch.prompt }, batch.prompt),
        h(
          'div',
          { class: 'when' },
          `${new Date(batch.created).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })} · ${state.formats[batch.format] ?? batch.format} · concepts/propozycje/${batch.id}/`,
        ),
      ),
      h(
        'div',
        { class: 'tools' },
        h('button', { class: 'small', title: 'Wczytaj opis i referencje do formularza', onclick: () => reuse(batch) }, 'Użyj ponownie'),
        busy && h('button', { class: 'small', onclick: () => act('cancel') }, 'Anuluj'),
        h(
          'button',
          {
            class: 'small',
            onclick: () => {
              if (confirm('Usunąć całą serię razem z plikami? Tego nie da się cofnąć.')) act('delete');
            },
          },
          'Usuń',
        ),
      ),
    ),
    h('div', { class: 'items' }, ...batch.items.map((item) => renderItem(batch, item))),
  );
}

function renderItem(batch: Batch, item: ProposalItem): HTMLElement {
  const act = (action: string, value?: boolean): void => void mutate('/item', { batch: batch.id, n: item.n, action, value });
  if (item.status !== 'done' || !item.file) {
    return h(
      'div',
      { class: 'item' },
      h(
        'div',
        { class: 'pic' },
        h(
          'div',
          { class: 'wait' },
          item.status === 'error'
            ? h('div', { class: 'error' }, item.error ?? 'Nie udało się.')
            : h('div', {}, h('div', { class: 'spinner' }), item.status === 'queued' ? 'W kolejce' : `Codex rysuje… ${elapsed(item)}`),
        ),
      ),
      h(
        'div',
        { class: 'bar' },
        item.status === 'error' && h('button', { class: 'small', onclick: () => act('retry') }, 'Ponów'),
        h('button', { class: 'small', onclick: () => act('delete') }, item.status === 'error' ? 'Usuń' : 'Anuluj'),
      ),
    );
  }
  const id = `propozycje/${batch.id}/${item.file}`;
  const isRef = selected.includes(id);
  return h(
    'div',
    { class: 'item' + (item.starred ? ' starred' : '') },
    h(
      'button',
      {
        class: 'pic',
        title: 'Powiększ i porównaj z referencjami',
        onclick: () =>
          openLightbox(batch.prompt, [
            ...batch.refs.map((r) => ({ src: img(r), caption: 'referencja: ' + refLabel(r) })),
            { src: img(id), caption: `propozycja ${item.n}` + (item.note ? ` · ${item.note}` : '') },
          ]),
      },
      h('img', { src: img(id), loading: 'lazy', alt: `Propozycja ${item.n}` }),
    ),
    h(
      'div',
      { class: 'bar' },
      h(
        'button',
        { class: 'small' + (item.starred ? ' on' : ''), title: 'Ulubione trafiają do zakładki „★ Propozycje”', onclick: () => act('star', !item.starred) },
        item.starred ? '★ Ulubiona' : '☆ Ulubiona',
      ),
      h('button', { class: 'small' + (isRef ? ' on' : ''), title: 'Pracuj dalej na tym obrazie', onclick: () => toggleRefFromResult(id) }, isRef ? 'Referencja ✓' : 'Jako referencja'),
      h(
        'button',
        {
          class: 'small',
          onclick: () => {
            if (confirm('Usunąć tę propozycję z dysku? Tego nie da się cofnąć.')) {
              selected = selected.filter((s) => s !== id);
              act('delete');
            }
          },
        },
        'Usuń',
      ),
    ),
    item.note && h('div', { class: 'note' }, item.note),
  );
}

function toggleRefFromResult(id: string): void {
  toggleRef(id);
  lastResultsKey = '';
  renderResultsIfChanged();
}

function reuse(batch: Batch): void {
  selected = batch.refs.filter((id) => state.refs.some((r) => r.id === id) || starredOrExisting(id));
  promptEl.value = batch.prompt;
  formatEl.value = batch.format;
  styleEl.checked = batch.keepStyle;
  variantsEl.value = String(Math.min(state.limits.variants, Math.max(1, batch.items.length)));
  renderLibrary();
  renderForm();
  promptEl.focus();
}

function starredOrExisting(id: string): boolean {
  return state.batches.some((b) => b.items.some((i) => i.file && `propozycje/${b.id}/${i.file}` === id));
}

async function mutate(path: string, payload: unknown): Promise<void> {
  try {
    await api(path, payload);
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
  await refresh();
}

// -------------------------------------------------------------------- lightbox

function openLightbox(title: string, images: Array<{ src: string; caption: string }>): void {
  lightbox = { title, images };
  renderLightbox();
}

function renderLightbox(): void {
  if (!lightbox) {
    lightboxHost.replaceChildren();
    return;
  }
  const close = (): void => {
    lightbox = null;
    renderLightbox();
  };
  const closeBtn = h('button', { onclick: close }, 'Zamknij (Esc)');
  lightboxHost.replaceChildren(
    h(
      'div',
      {
        class: 'lightbox',
        onclick: (e: MouseEvent) => {
          if ((e.target as HTMLElement).tagName !== 'IMG' && e.target !== closeBtn) close();
        },
      },
      h('div', { class: 'top' }, h('span', { class: 'title' }, lightbox.title), closeBtn),
      h(
        'div',
        { class: 'stage' },
        ...lightbox.images.map((i) => h('figure', {}, h('img', { src: i.src, alt: i.caption }), h('figcaption', {}, i.caption))),
      ),
    ),
  );
  closeBtn.focus();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox) {
    lightbox = null;
    renderLightbox();
  }
});

// -------------------------------------------------------------------- sync

function renderResultsIfChanged(): void {
  const busy = state.batches.some((b) => b.items.some((i) => i.status === 'running'));
  // While something is running the cards show a ticking clock, so they are redrawn every poll.
  const key = JSON.stringify(state.batches) + selected.join('|') + (busy ? Date.now() : '');
  if (key === lastResultsKey) return;
  lastResultsKey = key;
  renderResults();
}

async function refresh(): Promise<void> {
  try {
    state = await api<ServerState>('/state');
    statusEl.textContent = state.codex ? 'Codex gotowy' : 'Nie znaleziono polecenia `codex` w PATH';
    statusEl.className = 'status' + (state.codex ? '' : ' bad');
  } catch {
    statusEl.textContent = 'Brak połączenia z serwerem deweloperskim';
    statusEl.className = 'status bad';
    return;
  }
  // A deleted proposal (or a file removed from concepts/) cannot stay selected as a reference.
  if (formatEl.options.length > 0) {
    const alive = selected.filter((id) => state.refs.some((r) => r.id === id) || starredOrExisting(id));
    if (alive.length !== selected.length) {
      selected = alive;
      lastLibraryKey = '';
      renderForm();
    }
  }
  const libraryKey = JSON.stringify(state.refs) + JSON.stringify(starredRefs().map((r) => r.id));
  if (libraryKey !== lastLibraryKey) {
    lastLibraryKey = libraryKey;
    renderLibrary();
  }
  renderResultsIfChanged();
  if (formatEl.options.length === 0) {
    for (const [id, label] of Object.entries(state.formats)) formatEl.append(h('option', { value: id }, label));
    for (let n = 1; n <= state.limits.variants; n++) variantsEl.append(h('option', { value: String(n) }, String(n)));
    variantsEl.value = draft.variants && Number(draft.variants) <= state.limits.variants ? draft.variants : '2';
    if (draft.format && draft.format in state.formats) formatEl.value = draft.format;
    // References from the draft that no longer exist on disk are dropped.
    selected = selected.filter((id) => state.refs.some((r) => r.id === id) || starredOrExisting(id));
    renderLibrary();
    renderForm();
  }
}

async function loop(): Promise<void> {
  await refresh();
  const busy = state.batches.some((b) => b.items.some((i) => i.status === 'queued' || i.status === 'running'));
  setTimeout(() => void loop(), busy ? 1500 : 8000);
}

renderTabs();
renderForm();
void loop();
