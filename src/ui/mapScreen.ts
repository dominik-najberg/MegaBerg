import { hash2, TAU } from '../core/math';
import { FOG_DIM } from '../sim/fog';
import { PickupKind } from '../sim/pools';
import { MAP_HALF, PLAY_RADIUS, type GameMap, type LandmarkKind } from '../sim/terrain';
import type { World } from '../sim/world';
import parchmentUrl from '../assets/ui/parchment.jpg';

/** Side of the pre-rendered map picture in pixels. */
const BASE = 1024;
/** World metres from the centre of the map to its edge. */
const EXTENT = PLAY_RADIUS + 15;
const PX = BASE / (EXTENT * 2);
const INK = '#3b2a1a';

const toPx = (v: number): number => (v + EXTENT) * PX;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d') as CanvasRenderingContext2D];
}

/**
 * The map shown while Tab is held: an ink-on-parchment picture of the forest that starts covered
 * and is uncovered as the hero walks around (fog of war from `world.fog`).
 *
 * Three layers: `unknown` (dark, hatched parchment), `base` (the complete map, drawn once),
 * `revealed` (base masked by the fog; rebuilt only when the fog changes). Markers are drawn live.
 */
/** Map marker colours of active shrines by kind (see the aura tints in src/render/props.ts). */
const SHRINE_MAP_COLOR = { god: '#f4d98a', circle: '#7ec8ff', amber: '#ffb040', greed: '#c070ff' } as const;

export class MapScreen {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly info: HTMLElement;
  private readonly parchment = new Image();
  private base: HTMLCanvasElement | null = null;
  private unknown: HTMLCanvasElement | null = null;
  private readonly revealed: HTMLCanvasElement;
  private readonly revealedCtx: CanvasRenderingContext2D;
  private readonly fogCanvas: HTMLCanvasElement;
  private readonly fogCtx: CanvasRenderingContext2D;
  private readonly fogData: ImageData;
  private fogVersion = -1;
  private fogOwner: unknown = null;
  private size = 0;
  private clock = 0;
  visible = false;

  constructor(
    parent: HTMLElement,
    private map: GameMap,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'mapscreen';
    const sheet = document.createElement('div');
    sheet.className = 'mapsheet';
    sheet.style.backgroundImage = `url(${parchmentUrl})`;
    this.root.appendChild(sheet);
    const title = document.createElement('h3');
    title.textContent = 'Słowiańskie Bory';
    sheet.appendChild(title);
    this.canvas = document.createElement('canvas');
    sheet.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.info = document.createElement('div');
    this.info.className = 'maplegend';
    sheet.appendChild(this.info);
    parent.appendChild(this.root);

    [this.revealed, this.revealedCtx] = makeCanvas(BASE, BASE);
    [this.fogCanvas, this.fogCtx] = makeCanvas(FOG_DIM, FOG_DIM);
    this.fogData = this.fogCtx.createImageData(FOG_DIM, FOG_DIM);
    this.parchment.onload = () => {
      // Redraw the layers with the real parchment under them.
      this.base = null;
      this.unknown = null;
      this.fogVersion = -1;
    };
    this.parchment.src = parchmentUrl;
    window.addEventListener('resize', () => (this.size = 0));
  }

  /** A new run may bring a new forest: the picture of the map is drawn again. */
  setMap(map: GameMap): void {
    if (map === this.map) return;
    this.map = map;
    this.base = null;
    this.fogVersion = -1;
  }

  setVisible(v: boolean): void {
    if (v === this.visible) return;
    this.visible = v;
    this.root.classList.toggle('open', v);
  }

  // ------------------------------------------------------------------ static layers

  private paper(ctx: CanvasRenderingContext2D): void {
    if (this.parchment.complete && this.parchment.naturalWidth > 0) {
      ctx.drawImage(this.parchment, 0, 0, BASE, BASE);
    } else {
      ctx.fillStyle = '#d8c69c';
      ctx.fillRect(0, 0, BASE, BASE);
    }
  }

  /** Dark parchment with a loose hatch: the part of the forest nobody has seen yet. */
  private buildUnknown(): HTMLCanvasElement {
    const [c, ctx] = makeCanvas(BASE, BASE);
    ctx.save();
    ctx.beginPath();
    ctx.arc(BASE / 2, BASE / 2, BASE / 2 - 3, 0, TAU);
    ctx.clip();
    this.paper(ctx);
    ctx.fillStyle = 'rgba(52, 36, 22, 0.52)';
    ctx.fillRect(0, 0, BASE, BASE);
    ctx.strokeStyle = 'rgba(40, 26, 14, 0.2)';
    ctx.lineWidth = 1.2;
    for (let i = -BASE; i < BASE; i += 13) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + BASE, BASE);
      ctx.stroke();
    }
    // Scattered little firs hint that it is all forest out there.
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.3)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 260; i++) {
      const x = hash2(i, 11) * BASE;
      const y = hash2(i, 23) * BASE;
      const s = 6 + hash2(i, 5) * 5;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.6, y + s * 0.5);
      ctx.lineTo(x, y - s * 0.7);
      ctx.lineTo(x + s * 0.6, y + s * 0.5);
      ctx.stroke();
    }
    ctx.restore();
    return c;
  }

  /** The complete map: tinted relief, trails, water, trees, rocks. Drawn once. */
  private buildBase(): HTMLCanvasElement {
    const map = this.map;
    const [c, ctx] = makeCanvas(BASE, BASE);
    ctx.save();
    ctx.beginPath();
    ctx.arc(BASE / 2, BASE / 2, BASE / 2 - 3, 0, TAU);
    ctx.clip();
    this.paper(ctx);

    // Relief and ground tint at half resolution, blended over the parchment.
    const N = BASE / 2;
    const [tc, tctx] = makeCanvas(N, N);
    const img = tctx.createImageData(N, N);
    const d = img.data;
    const step = (EXTENT * 2) / N;
    for (let j = 0; j < N; j++) {
      const z = -EXTENT + (j + 0.5) * step;
      for (let i = 0; i < N; i++) {
        const x = -EXTENT + (i + 0.5) * step;
        const r = Math.hypot(x, z);
        const h = map.heightAt(x, z);
        // Light from the north-west.
        const shade = Math.max(-1, Math.min(1, (map.heightAt(x - 1.5, z - 1.5) - map.heightAt(x + 1.5, z + 1.5)) * 0.42));
        let cr = 132;
        let cg = 150;
        let cb = 88;
        const high = Math.max(0, Math.min(1, (h + 2) / 9));
        cr += high * 34;
        cg += high * 14;
        cb += high * 6;
        const path = map.pathAt(x, z);
        const clearing = Math.max(0, 1 - r / 9);
        const dirt = Math.max(path, clearing);
        if (dirt > 0) {
          cr += (196 - cr) * dirt;
          cg += (160 - cg) * dirt;
          cb += (108 - cb) * dirt;
        }
        const wild = Math.max(0, Math.min(1, (r - PLAY_RADIUS + 4) / 12));
        cr += (66 - cr) * wild;
        cg += (84 - cg) * wild;
        cb += (58 - cb) * wild;
        const k = 1 + shade * 0.3;
        const o = (j * N + i) * 4;
        d[o] = cr * k;
        d[o + 1] = cg * k;
        d[o + 2] = cb * k;
        d[o + 3] = 205;
      }
    }
    tctx.putImageData(img, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tc, 0, 0, BASE, BASE);

    // Water.
    for (const p of map.puddles) {
      ctx.beginPath();
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU;
        const k = p.r * (1.0 + (hash2((i % n) * 13 + Math.floor(p.x), Math.floor(p.z)) - 0.5) * 0.28);
        const x = toPx(p.x + Math.cos(a) * k);
        const y = toPx(p.z + Math.sin(a) * k);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.fillStyle = '#6f93a8';
      ctx.fill();
      ctx.strokeStyle = 'rgba(40, 62, 82, 0.85)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      if (p.r > 8) {
        ctx.strokeStyle = 'rgba(220, 235, 240, 0.5)';
        ctx.lineWidth = 1;
        for (let w = 0; w < 4; w++) {
          const wx = toPx(p.x - 6 + w * 3.5);
          const wy = toPx(p.z - 4 + ((w * 5) % 9));
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.quadraticCurveTo(wx + 5, wy - 3, wx + 10, wy);
          ctx.stroke();
        }
      }
    }

    // Trees and rocks as little glyphs, northern ones first so the southern ones overlap them.
    interface Glyph {
      x: number;
      z: number;
      kind: string;
      s: number;
    }
    const glyphs: Glyph[] = [];
    for (const o of map.obstacles) {
      if (o.kind === 'pine' || o.kind === 'oak' || o.kind === 'birch' || o.kind === 'rock') glyphs.push({ x: o.x, z: o.z, kind: o.kind, s: o.scale });
    }
    for (let i = 0; i < 1500; i++) {
      const a = hash2(i, 77) * TAU;
      const r = PLAY_RADIUS + 3 + hash2(i, 91) * (EXTENT - PLAY_RADIUS);
      glyphs.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, kind: 'pine', s: 1.5 + hash2(i, 3) });
    }
    glyphs.sort((a, b) => a.z - b.z);
    ctx.lineWidth = 0.9;
    ctx.lineJoin = 'round';
    for (const g of glyphs) {
      const x = toPx(g.x);
      const y = toPx(g.z);
      const s = 2.6 + g.s * 1.5;
      if (g.kind === 'pine') {
        ctx.beginPath();
        ctx.moveTo(x - s * 0.62, y + s * 0.45);
        ctx.lineTo(x, y - s * 1.15);
        ctx.lineTo(x + s * 0.62, y + s * 0.45);
        ctx.closePath();
        ctx.fillStyle = '#3f6245';
        ctx.fill();
        ctx.strokeStyle = 'rgba(24, 38, 26, 0.9)';
        ctx.stroke();
      } else if (g.kind === 'oak') {
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.82, 0, TAU);
        ctx.fillStyle = '#58793f';
        ctx.fill();
        ctx.strokeStyle = 'rgba(30, 44, 22, 0.9)';
        ctx.stroke();
      } else if (g.kind === 'birch') {
        ctx.strokeStyle = '#efe8d6';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.5);
        ctx.lineTo(x, y - s * 0.3);
        ctx.stroke();
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(x, y - s * 0.55, s * 0.55, s * 0.72, 0, 0, TAU);
        ctx.fillStyle = '#9db45a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(52, 66, 26, 0.85)';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x - s * 0.6, y + s * 0.3);
        ctx.lineTo(x - s * 0.2, y - s * 0.45);
        ctx.lineTo(x + s * 0.45, y - s * 0.3);
        ctx.lineTo(x + s * 0.65, y + s * 0.3);
        ctx.closePath();
        ctx.fillStyle = '#8d8a96';
        ctx.fill();
        ctx.strokeStyle = 'rgba(40, 38, 50, 0.85)';
        ctx.stroke();
      }
    }
    ctx.restore();
    return c;
  }

  private updateFog(world: World): void {
    const fog = world.fog;
    if (this.fogOwner === fog && this.fogVersion === fog.version && this.base) return;
    this.fogOwner = fog;
    this.fogVersion = fog.version;
    if (!this.base) this.base = this.buildBase();
    const d = this.fogData.data;
    const cells = fog.cells;
    for (let i = 0; i < cells.length; i++) d[i * 4 + 3] = cells[i] as number;
    this.fogCtx.putImageData(this.fogData, 0, 0);
    const r = this.revealedCtx;
    r.globalCompositeOperation = 'source-over';
    r.clearRect(0, 0, BASE, BASE);
    r.imageSmoothingEnabled = true;
    r.imageSmoothingQuality = 'high';
    const side = MAP_HALF * 2 * PX;
    r.drawImage(this.fogCanvas, toPx(-MAP_HALF), toPx(-MAP_HALF), side, side);
    r.globalCompositeOperation = 'source-in';
    r.drawImage(this.base, 0, 0);
  }

  // ------------------------------------------------------------------ markers

  private landmark(ctx: CanvasRenderingContext2D, kind: LandmarkKind, x: number, y: number, u: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(u, u);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    switch (kind) {
      case 'circle':
        ctx.fillStyle = '#a9a6b4';
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU;
          ctx.beginPath();
          ctx.rect(Math.cos(a) * 9 - 2, Math.sin(a) * 9 - 3.5, 4, 7);
          ctx.fill();
          ctx.stroke();
        }
        break;
      case 'oak':
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(-2.2, 0, 4.4, 10);
        ctx.strokeRect(-2.2, 0, 4.4, 10);
        ctx.fillStyle = '#4f7a38';
        ctx.beginPath();
        ctx.arc(-5, -2, 6.5, 0, TAU);
        ctx.arc(5, -2, 6.5, 0, TAU);
        ctx.arc(0, -8, 7.5, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -4, 12.5, Math.PI * 0.95, Math.PI * 2.05);
        ctx.stroke();
        break;
      case 'hut':
        // Hut on a chicken leg.
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 9);
        ctx.moveTo(-4, 11);
        ctx.lineTo(0, 8);
        ctx.lineTo(4, 11);
        ctx.stroke();
        ctx.fillStyle = '#8a6238';
        ctx.fillRect(-7, -9, 14, 9);
        ctx.strokeRect(-7, -9, 14, 9);
        ctx.fillStyle = '#5a3d26';
        ctx.beginPath();
        ctx.moveTo(-10, -9);
        ctx.lineTo(0, -18);
        ctx.lineTo(10, -9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'idol':
        ctx.fillStyle = '#b9b3a4';
        ctx.fillRect(-3.5, -14, 7, 24);
        ctx.strokeRect(-3.5, -14, 7, 24);
        ctx.fillRect(-5.5, -17, 11, 4.5);
        ctx.strokeRect(-5.5, -17, 11, 4.5);
        ctx.beginPath();
        ctx.moveTo(-3.5, -6);
        ctx.lineTo(3.5, -6);
        ctx.moveTo(-3.5, 2);
        ctx.lineTo(3.5, 2);
        ctx.stroke();
        break;
      case 'barrow':
        ctx.fillStyle = '#8fa35c';
        ctx.beginPath();
        ctx.moveTo(-13, 6);
        ctx.quadraticCurveTo(0, -14, 13, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#a9a6b4';
        ctx.fillRect(-2, -12, 4, 8);
        ctx.strokeRect(-2, -12, 4, 8);
        break;
      case 'lake':
        break;
    }
    ctx.restore();
  }

  private label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, u: number): void {
    ctx.font = `italic ${Math.round(14 * u)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.5 * u;
    ctx.strokeStyle = 'rgba(236, 222, 186, 0.9)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = INK;
    ctx.fillText(text, x, y);
  }

  /** Redraws the map. Call every frame while it is visible. */
  draw(world: World, camYaw: number, dt: number): void {
    this.clock += dt;
    if (this.size === 0) {
      const css = Math.round(Math.min(window.innerHeight * 0.74, window.innerWidth * 0.8, 860));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.size = Math.round(css * dpr);
      this.canvas.width = this.size;
      this.canvas.height = this.size;
      this.canvas.style.width = `${css}px`;
      this.canvas.style.height = `${css}px`;
    }
    if (!this.unknown) this.unknown = this.buildUnknown();
    this.updateFog(world);
    const ctx = this.ctx;
    const S = this.size;
    const k = S / BASE;
    /** Marker scale: about 1 on a 760 px map. */
    const u = S / 760;
    ctx.clearRect(0, 0, S, S);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.unknown, 0, 0, S, S);
    ctx.drawImage(this.revealed, 0, 0, S, S);
    const fog = world.fog;
    const map = this.map;
    const X = (x: number): number => toPx(x) * k;

    // Rim.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 3 * u, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1 * u;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 8 * u, 0, TAU);
    ctx.stroke();

    // Fires.
    for (const b of map.bonfires) {
      if (!fog.seen(b.x, b.z)) continue;
      const x = X(b.x);
      const y = X(b.z);
      ctx.fillStyle = '#e8792a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2 * u;
      ctx.beginPath();
      ctx.moveTo(x, y - 7 * u);
      ctx.quadraticCurveTo(x + 6 * u, y, x, y + 4 * u);
      ctx.quadraticCurveTo(x - 6 * u, y, x, y - 7 * u);
      ctx.fill();
      ctx.stroke();
    }
    // Shrines: lit (in the colour of their kind) while they still have something to give.
    for (const s of world.shrines) {
      if (!fog.seen(s.x, s.z)) continue;
      const x = X(s.x);
      const y = X(s.z);
      ctx.fillStyle = s.used ? '#9a8f7c' : SHRINE_MAP_COLOR[s.kind];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4 * u;
      ctx.beginPath();
      ctx.moveTo(x - 5 * u, y - 2 * u);
      ctx.lineTo(x, y - 9 * u);
      ctx.lineTo(x + 5 * u, y - 2 * u);
      ctx.lineTo(x + 3.2 * u, y - 2 * u);
      ctx.lineTo(x + 3.2 * u, y + 6 * u);
      ctx.lineTo(x - 3.2 * u, y + 6 * u);
      ctx.lineTo(x - 3.2 * u, y - 2 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Chests that are still closed. A gift chest was announced, so it shows even through the fog.
    for (const c of world.chests) {
      if (c.opened || (!c.gift && !fog.seen(c.x, c.z))) continue;
      const x = X(c.x);
      const y = X(c.z);
      if (c.gift) {
        ctx.fillStyle = `rgba(63, 208, 168, ${0.3 + Math.sin(this.clock * 4) * 0.12})`;
        ctx.beginPath();
        ctx.arc(x, y, 11 * u, 0, TAU);
        ctx.fill();
      }
      // The rich chest of a landmark is drawn larger, in crimson and gold.
      const k = c.rich ? 1.35 * u : u;
      if (c.rich) {
        ctx.fillStyle = `rgba(255, 200, 60, ${0.3 + Math.sin(this.clock * 3) * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, 12 * u, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = c.gift ? '#3fd0a8' : c.rich ? '#a8242e' : c.free ? '#ffd040' : '#b9772f';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3 * u;
      ctx.beginPath();
      ctx.rect(x - 5 * k, y - 3.5 * k, 10 * k, 7.5 * k);
      ctx.fill();
      ctx.stroke();
      if (c.rich) {
        ctx.strokeStyle = '#ffd24a';
        ctx.lineWidth = 1.6 * u;
      }
      ctx.beginPath();
      ctx.moveTo(x - 5 * k, y - 0.5 * k);
      ctx.lineTo(x + 5 * k, y - 0.5 * k);
      ctx.stroke();
    }
    // Haste pickups waiting to be picked up: a yellow lightning bolt on a blue glow.
    {
      const k = world.pickups;
      for (let i = 0; i < k.n; i++) {
        if (!k.alive[i] || k.kind[i] !== PickupKind.Haste || k.mag[i]) continue;
        const x = X(k.x[i] as number);
        const y = X(k.z[i] as number);
        ctx.fillStyle = `rgba(70, 150, 240, ${0.3 + Math.sin(this.clock * 4) * 0.12})`;
        ctx.beginPath();
        ctx.arc(x, y, 11 * u, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffe45a';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.2 * u;
        ctx.beginPath();
        ctx.moveTo(x + 2.5 * u, y - 7 * u);
        ctx.lineTo(x - 4.5 * u, y + 1 * u);
        ctx.lineTo(x - 0.5 * u, y + 1 * u);
        ctx.lineTo(x - 2.5 * u, y + 7 * u);
        ctx.lineTo(x + 4.5 * u, y - 1.5 * u);
        ctx.lineTo(x + 0.5 * u, y - 1.5 * u);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    // Magnets waiting to be picked up: a red horseshoe with pale poles.
    {
      const k = world.pickups;
      for (let i = 0; i < k.n; i++) {
        if (!k.alive[i] || k.kind[i] !== PickupKind.Magnet || k.mag[i]) continue;
        const x = X(k.x[i] as number);
        const y = X(k.z[i] as number);
        ctx.fillStyle = `rgba(216, 38, 42, ${0.26 + Math.sin(this.clock * 4) * 0.12})`;
        ctx.beginPath();
        ctx.arc(x, y, 11 * u, 0, TAU);
        ctx.fill();
        for (const [color, width] of [[INK, 5.6], ['#d8262a', 3.2]] as const) {
          ctx.strokeStyle = color;
          ctx.lineWidth = width * u;
          ctx.beginPath();
          ctx.moveTo(x - 4 * u, y - 6 * u);
          ctx.lineTo(x - 4 * u, y + 1 * u);
          ctx.arc(x, y + 1 * u, 4 * u, Math.PI, 0, true);
          ctx.lineTo(x + 4 * u, y - 6 * u);
          ctx.stroke();
        }
        ctx.strokeStyle = '#f2f4f6';
        ctx.lineWidth = 3.2 * u;
        ctx.beginPath();
        ctx.moveTo(x - 4 * u, y - 5.2 * u);
        ctx.lineTo(x - 4 * u, y - 2.6 * u);
        ctx.moveTo(x + 4 * u, y - 5.2 * u);
        ctx.lineTo(x + 4 * u, y - 2.6 * u);
        ctx.stroke();
      }
    }
    // Landmarks with their names.
    let found = 0;
    map.landmarks.forEach((l, i) => {
      if (!world.landmarksFound[i] && !fog.seen(l.x, l.z)) return;
      found++;
      const x = X(l.x);
      const y = X(l.z);
      this.landmark(ctx, l.kind, x, y, u);
      this.label(ctx, l.name, x, y + (l.kind === 'lake' ? 5 : 30) * u, u);
    });

    // Bosses are felt from afar: marked even in the unknown.
    const e = world.enemies;
    const bi = world.bossIdx;
    if (bi >= 0 && e.alive[bi]) {
      const x = X(e.x[bi] as number);
      const y = X(e.z[bi] as number);
      const pulse = 0.5 + 0.5 * Math.sin(this.clock * 5);
      ctx.strokeStyle = `rgba(170, 24, 20, ${0.75 - pulse * 0.45})`;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.arc(x, y, (9 + pulse * 7) * u, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#b3261e';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4 * u;
      ctx.beginPath();
      ctx.arc(x, y, 6 * u, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Leszy's portal is felt from afar too.
    const po = world.portal;
    if (po && !po.used) {
      const x = X(po.x);
      const y = X(po.z);
      const pulse = 0.5 + 0.5 * Math.sin(this.clock * 4);
      ctx.strokeStyle = `rgba(60, 220, 110, ${0.8 - pulse * 0.4})`;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.arc(x, y, (8 + pulse * 6) * u, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#3ad870';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4 * u;
      ctx.beginPath();
      ctx.arc(x, y, 5 * u, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // The hero: sight cone along the camera, arrow on top.
    const p = world.player;
    const px = X(p.x);
    const py = X(p.z);
    const dir = Math.atan2(-Math.cos(camYaw), -Math.sin(camYaw));
    const cone = ctx.createRadialGradient(px, py, 0, px, py, 46 * u);
    cone.addColorStop(0, 'rgba(255, 244, 200, 0.55)');
    cone.addColorStop(1, 'rgba(255, 244, 200, 0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 46 * u, dir - 0.5, dir + 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(dir);
    ctx.fillStyle = '#c8281e';
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = 2 * u;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(11 * u, 0);
    ctx.lineTo(-7 * u, 7 * u);
    ctx.lineTo(-3.5 * u, 0);
    ctx.lineTo(-7 * u, -7 * u);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    // Compass: north is up.
    const nx = S - 46 * u;
    const ny = 50 * u;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(nx, ny - 22 * u);
    ctx.lineTo(nx + 7 * u, ny);
    ctx.lineTo(nx, ny - 5 * u);
    ctx.lineTo(nx - 7 * u, ny);
    ctx.closePath();
    ctx.fill();
    ctx.font = `bold ${Math.round(15 * u)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('N', nx, ny + 17 * u);

    const pct = Math.round(fog.coverage(PLAY_RADIUS) * 100);
    const text = `Odkryto ${pct}% boru  •  miejsca: ${found}/${map.landmarks.length}`;
    if (this.info.dataset.t !== text) {
      this.info.dataset.t = text;
      this.info.innerHTML = `<span><i class="mk mk-hero"></i>ty</span><span><i class="mk mk-shrine"></i>kapliczka</span><span><i class="mk mk-chest"></i>skrzynia</span><span><i class="mk mk-rich"></i>bogata skrzynia</span><span><i class="mk mk-gift"></i>dar boru</span><span><i class="mk mk-magnet"></i>magnes</span><span><i class="mk mk-haste"></i>szał bojowy</span><span><i class="mk mk-fire"></i>ognisko</span><span><i class="mk mk-boss"></i>boss</span><span><i class="mk mk-portal"></i>portal</span><b>${text}</b>`;
    }
  }
}
