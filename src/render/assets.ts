import * as THREE from 'three';
import detailUrl from '../assets/tex/detail.jpg';
import dirtUrl from '../assets/tex/dirt.jpg';
import forestUrl from '../assets/tex/forest_floor.jpg';
import grassUrl from '../assets/tex/grass.jpg';
import moonUrl from '../assets/tex/moon.jpg';
import mossUrl from '../assets/tex/moss.jpg';
import mudUrl from '../assets/tex/mud.jpg';
import rockUrl from '../assets/tex/rock.jpg';

const COLOR = { grass: grassUrl, forest: forestUrl, dirt: dirtUrl, mud: mudUrl, rock: rockUrl, moss: mossUrl, moon: moonUrl };
const DATA = { detail: detailUrl };

export type TexName = keyof typeof COLOR | keyof typeof DATA | 'noise';

const textures = new Map<string, THREE.Texture>();

/** Tileable value-noise texture (R = low octaves, G = finer), used to break up blends and tiling. */
function makeNoise(size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const hash = (x: number, y: number, s: number): number => {
    let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const noise = (x: number, y: number, period: number, seed: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const w = (a: number): number => ((a % period) + period) % period;
    const a = hash(w(xi), w(yi), seed);
    const b = hash(w(xi + 1), w(yi), seed);
    const c = hash(w(xi), w(yi + 1), seed);
    const d = hash(w(xi + 1), w(yi + 1), seed);
    return a + (b - a) * u + (c - a + (a - b + d - c) * u) * v;
  };
  const fbm = (x: number, y: number, base: number, seed: number): number => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let p = base;
    for (let o = 0; o < 4; o++) {
      sum += noise((x * p) / size, (y * p) / size, p, seed + o) * amp;
      norm += amp;
      amp *= 0.5;
      p *= 2;
    }
    return sum / norm;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      data[o] = Math.round(fbm(x, y, 4, 1) * 255);
      data[o + 1] = Math.round(fbm(x, y, 16, 9) * 255);
      data[o + 2] = Math.round(fbm(x, y, 8, 21) * 255);
      data[o + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

/** Loads every texture the renderer needs. Call (and await) once before creating the game. */
export async function loadAssets(onProgress?: (done: number, total: number) => void): Promise<void> {
  const loader = new THREE.TextureLoader();
  const jobs: Array<[string, string, boolean]> = [];
  for (const [k, url] of Object.entries(COLOR)) jobs.push([k, url, true]);
  for (const [k, url] of Object.entries(DATA)) jobs.push([k, url, false]);
  let done = 0;
  await Promise.all(
    jobs.map(async ([name, url, color]) => {
      const t = await loader.loadAsync(url);
      t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      if (name !== 'moon') {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
      }
      t.anisotropy = 8;
      textures.set(name, t);
      onProgress?.(++done, jobs.length);
    }),
  );
  textures.set('noise', makeNoise());
}

/** A loaded texture. Throws when loadAssets() has not finished: that is a programming error, not a runtime state. */
export function tex(name: TexName): THREE.Texture {
  const t = textures.get(name);
  if (!t) throw new Error(`Tekstura "${name}" nie jest wczytana (loadAssets).`);
  return t;
}
