import * as THREE from 'three';
import { fbm, TAU } from '../core/math';
import { Rng } from '../core/rng';
import { PLAY_RADIUS, type GameMap, type Obstacle } from '../sim/terrain';
import { GeoBuilder, propMaterial, writeMatrix } from './geo';

function pineGeo(seed: number): THREE.BufferGeometry {
  const b = new GeoBuilder(seed);
  b.cyl(0.28, 0.46, 3.4, 6, 0x4a3324, { y: 1.7 });
  const greens = [0x1f3d2b, 0x25482f, 0x2c5434, 0x1b3628];
  let y = 2.4;
  let r = 2.5;
  for (let i = 0; i < 4; i++) {
    const hgt = 3.3 - i * 0.35;
    b.cone(r, hgt, 7, greens[i % greens.length] as number, { y: y + hgt / 2, ry: i * 0.7, jitter: 0.12 });
    y += hgt * 0.52;
    r *= 0.74;
  }
  return b.build();
}

function oakGeo(seed: number): THREE.BufferGeometry {
  const b = new GeoBuilder(seed);
  b.cyl(0.5, 0.78, 4.2, 7, 0x3c2b22, { y: 2.1 });
  b.cyl(0.2, 0.34, 2.4, 5, 0x3c2b22, { x: 0.9, y: 4.4, rz: -0.8 });
  b.cyl(0.18, 0.3, 2.2, 5, 0x3c2b22, { x: -0.8, y: 4.6, rz: 0.9, ry: 0.5 });
  b.ico(2.6, 1, 0x2d4a2a, { y: 6.3, sy: 0.8, jitter: 0.14 });
  b.ico(1.9, 1, 0x36562c, { x: 1.8, y: 5.4, z: 0.4, sy: 0.8, jitter: 0.14 });
  b.ico(1.8, 1, 0x284326, { x: -1.7, y: 5.6, z: -0.5, sy: 0.8, jitter: 0.14 });
  b.ico(1.5, 0, 0x3e5e2e, { x: 0.2, y: 7.6, z: -0.6, jitter: 0.14 });
  // Moss skirt at the foot of the trunk.
  b.cone(1.0, 0.7, 7, 0x44642f, { y: 0.3 });
  return b.build();
}

function rockGeo(seed: number): THREE.BufferGeometry {
  const b = new GeoBuilder(seed);
  b.ico(1, 1, 0x5d5a6c, { y: 0.45, sy: 0.72, jitter: 0.1 });
  b.ico(0.55, 0, 0x54516a, { x: 0.75, y: 0.2, z: 0.3, sy: 0.7 });
  b.crumple(0.16 + (seed % 3) * 0.04);
  b.tintUpFaces(0x4f6e33, 0.62, 0.9);
  return b.build();
}

const WHITE = 0xe9e2d0;
const RED = 0xb3261e;

/** Wayside shrine: carved post, little roofed box, embroidered towel, candles. */
function shrineGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(77);
  // stone plinth
  b.box(1.9, 0.35, 1.5, 0x666277, { y: 0.17 });
  b.box(1.4, 0.3, 1.1, 0x5a566b, { y: 0.48 });
  // post
  b.box(0.46, 2.3, 0.46, 0x5a3d26, { y: 1.75 });
  b.box(0.52, 0.12, 0.52, 0x6e4c2e, { y: 1.1 });
  b.box(0.52, 0.12, 0.52, 0x6e4c2e, { y: 2.3 });
  // carved rhombus on the post
  b.box(0.2, 0.2, 0.05, 0x8a6238, { y: 1.7, z: 0.24, rz: Math.PI / 4 });
  // box house
  b.box(1.15, 1.0, 0.8, 0x6b472b, { y: 3.35 });
  b.box(0.8, 0.7, 0.06, 0x3a2516, { y: 3.32, z: 0.4 });
  // six-armed rosette (sun wheel)
  for (let i = 0; i < 3; i++) {
    b.box(0.5, 0.07, 0.05, 0xc99a55, { y: 3.32, z: 0.44, rz: (i * Math.PI) / 3 });
  }
  b.box(0.14, 0.14, 0.06, 0xe0b565, { y: 3.32, z: 0.46, rz: Math.PI / 4 });
  // gabled roof with moss
  b.box(1.0, 0.1, 1.2, 0x4b3220, { x: -0.38, y: 4.1, rz: 0.72 });
  b.box(1.0, 0.1, 1.2, 0x4b3220, { x: 0.38, y: 4.1, rz: -0.72 });
  b.box(0.95, 0.06, 1.22, 0x55742f, { x: -0.4, y: 4.17, rz: 0.72 });
  b.box(0.95, 0.06, 1.22, 0x4a6a2c, { x: 0.4, y: 4.17, rz: -0.72 });
  // finial: little sun cross
  b.box(0.08, 0.6, 0.08, 0x6b472b, { y: 4.75 });
  for (let i = 0; i < 4; i++) b.box(0.5, 0.06, 0.06, 0x8a6238, { y: 4.85, rz: (i * Math.PI) / 4 });
  // embroidered towel draped over the box: top strip + two hanging ends
  b.box(1.5, 0.06, 0.3, WHITE, { y: 3.88, z: 0.3 });
  for (const sx of [-1, 1]) {
    b.box(0.34, 1.5, 0.05, WHITE, { x: sx * 0.76, y: 3.15, z: 0.3, rz: sx * 0.06 });
    b.box(0.35, 0.09, 0.06, RED, { x: sx * 0.79, y: 2.72, z: 0.3, rz: sx * 0.06 });
    b.box(0.35, 0.05, 0.06, RED, { x: sx * 0.8, y: 2.56, z: 0.3, rz: sx * 0.06 });
    b.box(0.12, 0.12, 0.062, RED, { x: sx * 0.77, y: 2.96, z: 0.3, rz: Math.PI / 4 });
    b.box(0.35, 0.05, 0.06, RED, { x: sx * 0.74, y: 3.6, z: 0.3, rz: sx * 0.06 });
    // fringe
    b.box(0.3, 0.1, 0.03, 0xd8cfb8, { x: sx * 0.81, y: 2.38, z: 0.3 });
  }
  // candles on the plinth
  const candles: Array<[number, number, number]> = [
    [-0.55, 0.45, 0.5],
    [-0.3, 0.3, 0.6],
    [0.35, 0.5, 0.55],
    [0.6, 0.3, 0.45],
    [0.05, 0.25, 0.65],
  ];
  for (const [cx, ch, cz] of candles) b.cyl(0.07, 0.08, ch, 5, 0xe8dcc0, { x: cx, y: 0.63 + ch / 2, z: cz });
  return b.build();
}

export const SHRINE_CANDLES: Array<[number, number, number]> = [
  [-0.55, 1.13, 0.5],
  [-0.3, 0.98, 0.6],
  [0.35, 1.18, 0.55],
  [0.6, 0.98, 0.45],
  [0.05, 0.93, 0.65],
];

function bonfireGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.ico(0.26, 0, 0x5c586a, { x: Math.cos(a) * 0.95, y: 0.12, z: Math.sin(a) * 0.95, sy: 0.7, ry: a });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    b.cyl(0.11, 0.14, 1.7, 5, 0x3d2a1c, {
      x: Math.cos(a) * 0.38,
      y: 0.62,
      z: Math.sin(a) * 0.38,
      rz: Math.cos(a) * 0.62,
      rx: -Math.sin(a) * 0.62,
    });
  }
  b.cyl(0.6, 0.7, 0.1, 7, 0x231a14, { y: 0.05 });
  return b.build();
}

function fernGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(9);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.2;
    const tri = new THREE.BufferGeometry();
    tri.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, -0.12, 0, 0, 0.12, 0.55, 0.42, 0, 0, 0, 0.12, 0, 0, -0.12, 0.55, 0.42, 0, 0.55, 0.42, 0.09, 0.55, 0.42, -0.09, 1.0, 0.22, 0, 0.55, 0.42, -0.09, 0.55, 0.42, 0.09, 1.0, 0.22, 0], 3),
    );
    b.add(tri, i % 2 ? 0x3f7a34 : 0x4c8a3a, { ry: a, jitter: 0.12 });
  }
  return b.build();
}

function grassGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(3);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const lean = 0.1 + (i % 3) * 0.08;
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-0.05, 0, 0, 0.05, 0, 0, lean, 0.5, 0, 0.05, 0, 0, -0.05, 0, 0, lean, 0.5, 0], 3));
    b.add(tri, i % 2 ? 0x55803a : 0x47702f, { x: Math.cos(a) * 0.12, z: Math.sin(a) * 0.12, ry: a * 1.7, jitter: 0.15 });
  }
  return b.build();
}

/** Lily of the valley: broad leaves + a stalk of white bells. */
function lilyGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(4);
  for (const s of [-1, 1]) {
    b.cone(0.09, 0.5, 4, 0x3e7a3a, { x: s * 0.06, y: 0.24, rz: s * -0.35, sz: 0.35 });
  }
  b.cyl(0.012, 0.015, 0.5, 3, 0x5a8a44, { x: 0.04, y: 0.3, rz: -0.3 });
  for (let i = 0; i < 4; i++) {
    b.ico(0.045, 0, 0xf4f1e6, { x: 0.07 + i * 0.045, y: 0.3 + i * 0.075, z: 0, jitter: 0.02 });
  }
  return b.build();
}

function mushroomGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(6);
  b.cyl(0.05, 0.07, 0.22, 5, 0xe8dfc8, { y: 0.11 });
  b.cone(0.2, 0.16, 6, 0xb5352a, { y: 0.28 });
  b.cyl(0.035, 0.045, 0.14, 5, 0xe8dfc8, { x: 0.2, y: 0.07, z: 0.08 });
  b.cone(0.12, 0.1, 6, 0xc04030, { x: 0.2, y: 0.18, z: 0.08 });
  return b.build();
}

function pebbleGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(8);
  b.ico(0.22, 0, 0x625e70, { y: 0.06, sy: 0.5 });
  return b.build();
}

interface FlameSet {
  group: THREE.Group;
  cones: THREE.Mesh[];
  phase: number;
}

interface LightSource {
  x: number;
  y: number;
  z: number;
  intensity: number;
  range: number;
  phase: number;
  on: boolean;
}

const LIGHT_POOL = 4;

const flameMatOuter = new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.9, fog: false, toneMapped: false });
const flameMatInner = new THREE.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.95, fog: false, toneMapped: false });

/** All static scenery: instanced trees/rocks/undergrowth, shrines and animated bonfires. */
export class PropsView {
  readonly group = new THREE.Group();
  private readonly flames: FlameSet[] = [];
  private readonly shrineFlames: THREE.Group[] = [];
  private readonly glowTex: THREE.Texture;
  private readonly sources: LightSource[] = [];
  private readonly lights: THREE.PointLight[] = [];
  private readonly order: number[] = [];
  private readonly undergrowth: Array<{ mesh: THREE.InstancedMesh; placed: number }> = [];

  constructor(map: GameMap, quality: number) {
    this.glowTex = makeGlowTexture();
    // A small pool of real lights is moved to the nearest fires each frame: constant shader cost.
    for (let i = 0; i < LIGHT_POOL; i++) {
      const l = new THREE.PointLight(0xff8838, 0, 30, 1.6);
      this.lights.push(l);
      this.group.add(l);
    }
    const obs = map.obstacles;
    this.addInstanced(pineGeo(11), obs.filter((o) => o.kind === 'pine'), map, 1, true);
    this.addInstanced(oakGeo(12), obs.filter((o) => o.kind === 'oak'), map, 1, true);
    const rocks = obs.filter((o) => o.kind === 'rock');
    this.addInstanced(rockGeo(21), rocks.filter((_, i) => i % 2 === 0), map, 1, true);
    this.addInstanced(rockGeo(23), rocks.filter((_, i) => i % 2 === 1), map, 1, true);
    this.addInstanced(shrineGeo(), obs.filter((o) => o.kind === 'shrine'), map, 1, true);
    this.addInstanced(bonfireGeo(), obs.filter((o) => o.kind === 'bonfire'), map, 1, false);
    this.buildBorderForest(map);
    this.buildUndergrowth(map, quality);
    this.buildFlames(map);
  }

  private addInstanced(geo: THREE.BufferGeometry, list: Obstacle[], map: GameMap, scaleMul: number, shadow: boolean): void {
    if (list.length === 0) return;
    const mesh = new THREE.InstancedMesh(geo, propMaterial, list.length);
    list.forEach((o, i) => {
      const s = o.scale * scaleMul;
      const y = map.heightAt(o.x, o.z) - 0.08;
      writeMatrix(mesh.instanceMatrix.array, i, o.x, y, o.z, o.rot, s, s, s);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }

  /** Dense, tall forest ring that hides the edge of the map. */
  private buildBorderForest(map: GameMap): void {
    const rng = new Rng(4242);
    const list: Obstacle[] = [];
    for (let i = 0; i < 620; i++) {
      const a = rng.range(0, TAU);
      const d = PLAY_RADIUS + 3 + Math.pow(rng.next(), 1.4) * 30;
      list.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: 0, kind: 'pine', scale: rng.range(1.5, 3.1), rot: rng.range(0, TAU) });
    }
    this.addInstanced(pineGeo(13), list, map, 1, false);
    const oaks: Obstacle[] = [];
    for (let i = 0; i < 60; i++) {
      const a = rng.range(0, TAU);
      const d = PLAY_RADIUS + 2 + rng.next() * 10;
      oaks.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: 0, kind: 'oak', scale: rng.range(1.8, 2.8), rot: rng.range(0, TAU) });
    }
    this.addInstanced(oakGeo(14), oaks, map, 1, false);
  }

  private buildUndergrowth(map: GameMap, quality: number): void {
    const rng = new Rng(999);
    const scatter = (geo: THREE.BufferGeometry, count: number, minS: number, maxS: number, pick: (x: number, z: number) => number): void => {
      const n = count;
      const mesh = new THREE.InstancedMesh(geo, propMaterial, n);
      let placed = 0;
      let guard = 0;
      while (placed < n && guard++ < n * 30) {
        const a = rng.range(0, TAU);
        const d = Math.sqrt(rng.next()) * (PLAY_RADIUS + 6);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (map.inPuddle(x, z)) continue;
        if (rng.next() > pick(x, z)) continue;
        const s = rng.range(minS, maxS);
        writeMatrix(mesh.instanceMatrix.array, placed, x, map.heightAt(x, z) - 0.02, z, rng.range(0, TAU), s, s, s);
        placed++;
      }
      mesh.count = placed;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      this.undergrowth.push({ mesh, placed });
    };
    const nearObstacle = (x: number, z: number): number => (map.isFree(x, z, 2.2) ? 0.12 : map.isFree(x, z, 0.3) ? 1 : 0);
    const grassy = (x: number, z: number): number => (fbm(x / 9 + 5.5, z / 9 + 1.5, 3) < 0.55 && map.isFree(x, z, 0.2) ? 1 : 0.08);
    scatter(fernGeo(), 900, 0.8, 1.7, nearObstacle);
    scatter(grassGeo(), 2600, 0.8, 1.6, grassy);
    scatter(lilyGeo(), 420, 0.9, 1.5, (x, z) => (fbm(x / 6 + 40, z / 6 + 13, 2) > 0.6 && map.isFree(x, z, 0.2) ? 1 : 0.02));
    scatter(mushroomGeo(), 160, 0.8, 1.6, nearObstacle);
    scatter(pebbleGeo(), 300, 0.6, 1.8, (x, z) => (map.isFree(x, z, 0.3) ? 0.6 : 0));
    this.setQuality(quality);
  }

  /** Undergrowth density follows the quality setting (instances are placed randomly, so any prefix works). */
  setQuality(quality: number): void {
    const mul = quality <= 0 ? 0.35 : quality === 1 ? 0.7 : 1;
    for (const u of this.undergrowth) u.mesh.count = Math.floor(u.placed * mul);
  }

  private makeFlame(scale: number): FlameSet {
    const group = new THREE.Group();
    const cones: THREE.Mesh[] = [];
    const defs: Array<[number, number, THREE.Material, number]> = [
      [0.52, 1.5, flameMatOuter, 0],
      [0.36, 1.15, flameMatInner, 0.05],
      [0.3, 0.95, flameMatOuter, 0.0],
    ];
    defs.forEach(([r, h, mat, y], i) => {
      const g = new THREE.ConeGeometry(r * scale, h * scale, 5, 1);
      g.translate(0, (h * scale) / 2, 0);
      const m = new THREE.Mesh(g, mat);
      m.position.set(i === 2 ? 0.22 * scale : 0, y * scale, i === 2 ? -0.12 * scale : 0);
      cones.push(m);
      group.add(m);
    });
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff8a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, fog: false }),
    );
    glow.scale.setScalar(5.5 * scale);
    glow.position.y = 0.8 * scale;
    group.add(glow);
    return { group, cones, phase: Math.random() * 10 };
  }

  private buildFlames(map: GameMap): void {
    for (const b of map.bonfires) {
      const f = this.makeFlame(1.45);
      const y = map.heightAt(b.x, b.z);
      f.group.position.set(b.x, y + 0.15, b.z);
      this.group.add(f.group);
      this.flames.push(f);
      this.sources.push({ x: b.x, y: y + 1.6, z: b.z, intensity: 95, range: 30, phase: f.phase, on: true });
    }
    for (const s of map.shrines) {
      const g = new THREE.Group();
      g.position.set(s.x, map.heightAt(s.x, s.z) - 0.08, s.z);
      g.rotation.y = s.rot;
      for (const [cx, cy, cz] of SHRINE_CANDLES) {
        const f = this.makeFlame(0.12);
        f.group.position.set(cx, cy, cz);
        g.add(f.group);
        this.flames.push(f);
      }
      this.group.add(g);
      this.shrineFlames.push(g);
      this.sources.push({
        x: s.x + Math.sin(s.rot) * 1.0,
        y: g.position.y + 1.4,
        z: s.z + Math.cos(s.rot) * 1.0,
        intensity: 16,
        range: 10,
        phase: Math.random() * 10,
        on: true,
      });
    }
  }

  /** Extinguishes the candles of a used shrine. */
  setShrineUsed(index: number, used: boolean): void {
    const g = this.shrineFlames[index];
    if (g) g.visible = !used;
    const src = this.sources[this.sources.length - this.shrineFlames.length + index];
    if (src) src.on = !used;
  }

  update(time: number, px: number, pz: number): void {
    // Assign pooled lights to the nearest active fires.
    const src = this.sources;
    const order = this.order;
    order.length = 0;
    for (let i = 0; i < src.length; i++) if ((src[i] as LightSource).on) order.push(i);
    const dist = (i: number): number => {
      const s = src[i] as LightSource;
      return (s.x - px) * (s.x - px) + (s.z - pz) * (s.z - pz);
    };
    order.sort((a, b) => dist(a) - dist(b));
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i] as THREE.PointLight;
      const idx = order[i];
      if (idx === undefined) {
        l.intensity = 0;
        continue;
      }
      const s = src[idx] as LightSource;
      const d = Math.sqrt(dist(idx));
      const fade = 1 - Math.min(1, Math.max(0, (d - 40) / 22));
      const t = time * 9 + s.phase;
      l.position.set(s.x, s.y, s.z);
      l.distance = s.range;
      l.intensity = s.intensity * fade * (0.85 + Math.sin(t) * 0.09 + Math.sin(t * 2.7 + 1.3) * 0.07);
    }
    for (let i = 0; i < this.flames.length; i++) {
      const f = this.flames[i] as FlameSet;
      const t = time * 9 + f.phase;
      const flick = 0.82 + Math.sin(t) * 0.1 + Math.sin(t * 2.7 + 1.3) * 0.08;
      for (let j = 0; j < f.cones.length; j++) {
        const c = f.cones[j] as THREE.Mesh;
        c.scale.set(1 + Math.sin(t * 1.3 + j) * 0.12, flick + Math.sin(t * 1.9 + j * 2) * 0.16, 1 + Math.cos(t * 1.1 + j) * 0.12);
        c.rotation.y = t * 0.4 + j;
      }
    }
  }
}

export function makeGlowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
