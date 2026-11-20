import * as THREE from 'three';
import { fbm, hash2, TAU } from '../core/math';
import { Rng } from '../core/rng';
import { PLAY_RADIUS, type GameMap, type ShrineKind } from '../sim/terrain';
import { model, tex, type ModelName } from './assets';
import { GeoBuilder, normalsUp, propMaterial, propUniforms, windByHeight, writeMatrix } from './geo';

const WHITE = 0xe9e2d0;
const RED = 0xb3261e;

/** Aura colour of each shrine kind: warm candlelight for gods, blue circle, amber, violet greed. */
const SHRINE_TINT: Record<ShrineKind, number> = { god: 0xffc670, circle: 0x7ec8ff, amber: 0xffa020, greed: 0xc040ff };

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

/** Side of a scenery chunk in metres. Chunks are culled by the frustum and by distance (fog hides the rest). */
const CHUNK = 44;
/** Up to this distance a chunk shows full models and casts shadows; further away the low-detail ones. */
const NEAR = 92;
/** Beyond this the fog has swallowed everything. */
const FAR = 235;
/** Small plants are only drawn close to the hero. */
const PLANTS = 78;

interface Inst {
  x: number;
  y: number;
  z: number;
  rot: number;
  s: number;
}

interface Chunk {
  x: number;
  z: number;
  near: THREE.InstancedMesh[];
  far: THREE.InstancedMesh[];
  plants: Array<{ mesh: THREE.InstancedMesh; placed: number }>;
}

type Layer = 'near' | 'far' | 'plants';

/**
 * All static scenery: trees, rocks and landmarks (models built in Blender, see tools/blender),
 * undergrowth, shrines and animated fires. Instances are grouped into square chunks, one InstancedMesh
 * per model and chunk, so the frustum and the fog distance cull most of the forest every frame.
 */
export class PropsView {
  readonly group = new THREE.Group();
  private readonly flames: FlameSet[] = [];
  private readonly shrineFlames: THREE.Group[] = [];
  /** Aura of active shrines (ground glow, halo, drifting motes), animated in update(). */
  private readonly shrineAuras: Array<{ ground: THREE.Mesh; halo: THREE.Sprite; motes: THREE.Sprite[]; phase: number }> = [];
  private readonly glowTex: THREE.Texture;
  private readonly sources: LightSource[] = [];
  private readonly lights: THREE.PointLight[] = [];
  private readonly order: number[] = [];
  private readonly chunks = new Map<number, Chunk>();
  private readonly pending = new Map<string, { geo: THREE.BufferGeometry; layer: Layer; chunk: Chunk; list: Inst[] }>();
  private readonly geos = new Map<string, THREE.BufferGeometry>();
  private plantMul = 1;
  private shadows = true;

  constructor(map: GameMap, quality: number) {
    this.glowTex = makeGlowTexture();
    propUniforms.uDetail.value = tex('detail');
    // A small pool of real lights is moved to the nearest fires each frame: constant shader cost.
    for (let i = 0; i < LIGHT_POOL; i++) {
      const l = new THREE.PointLight(0xff8838, 0, 30, 1.6);
      this.lights.push(l);
      this.group.add(l);
    }
    this.geos.set('shrine', shrineGeo());
    this.geos.set('bonfire', bonfireGeo());
    this.geos.set('fern', normalsUp(windByHeight(fernGeo(), 0.45, 0.5)));
    this.geos.set('grass', normalsUp(windByHeight(grassGeo(), 0.5, 0.55)));
    this.geos.set('lily', normalsUp(windByHeight(lilyGeo(), 0.6, 0.4), 0.5));
    this.geos.set('mushroom', mushroomGeo());
    this.geos.set('pebble', pebbleGeo());

    this.placeObstacles(map);
    this.buildBorderForest(map);
    this.buildUndergrowth(map);
    this.flush();
    this.setQuality(quality);
    this.buildFlames(map);
  }

  private geo(name: string): THREE.BufferGeometry {
    return this.geos.get(name) ?? model(name as ModelName);
  }

  private chunkAt(x: number, z: number): Chunk {
    const cx = Math.floor(x / CHUNK);
    const cz = Math.floor(z / CHUNK);
    const key = (cx + 512) * 1024 + (cz + 512);
    let c = this.chunks.get(key);
    if (!c) {
      c = { x: (cx + 0.5) * CHUNK, z: (cz + 0.5) * CHUNK, near: [], far: [], plants: [] };
      this.chunks.set(key, c);
    }
    return c;
  }

  /** Queues one instance; meshes are created in flush(). `sink` buries the base a little so slopes show no gap. */
  private put(name: string, layer: Layer, map: GameMap, x: number, z: number, rot: number, s: number, sink = 0.08): void {
    const chunk = this.chunkAt(x, z);
    const key = `${name}|${layer}|${chunk.x}|${chunk.z}`;
    let p = this.pending.get(key);
    if (!p) {
      p = { geo: this.geo(name), layer, chunk, list: [] };
      this.pending.set(key, p);
    }
    p.list.push({ x, y: map.heightAt(x, z) - sink, z, rot, s });
  }

  private flush(): void {
    for (const p of this.pending.values()) {
      const mesh = new THREE.InstancedMesh(p.geo, propMaterial, p.list.length);
      p.list.forEach((o, i) => writeMatrix(mesh.instanceMatrix.array, i, o.x, o.y, o.z, o.rot, o.s, o.s, o.s));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.receiveShadow = true;
      mesh.castShadow = p.layer === 'near';
      mesh.matrixAutoUpdate = false;
      mesh.visible = false;
      this.group.add(mesh);
      if (p.layer === 'plants') p.chunk.plants.push({ mesh, placed: p.list.length });
      else p.chunk[p.layer].push(mesh);
    }
    this.pending.clear();
  }

  private placeObstacles(map: GameMap): void {
    map.obstacles.forEach((o, i) => {
      const pick = hash2(i * 31 + 7, 91);
      switch (o.kind) {
        case 'pine': {
          // Spruces and tall Scots pines share the "pine" slot of the map.
          const scots = pick < 0.38;
          const s = o.scale * (scots ? 0.9 : 0.86);
          this.put(scots ? (pick < 0.19 ? 'pine0' : 'pine1') : pick < 0.6 ? 'fir0' : pick < 0.8 ? 'fir1' : 'fir2', 'near', map, o.x, o.z, o.rot, s);
          this.put(scots ? 'pine_lod' : 'fir_lod', 'far', map, o.x, o.z, o.rot, s);
          break;
        }
        case 'oak':
          this.put(pick < 0.5 ? 'oak0' : 'oak1', 'near', map, o.x, o.z, o.rot, o.scale * 0.9);
          this.put('oak_lod', 'far', map, o.x, o.z, o.rot, o.scale * 0.9);
          break;
        case 'birch':
          this.put(pick < 0.5 ? 'birch0' : 'birch1', 'near', map, o.x, o.z, o.rot, o.scale);
          this.put('birch_lod', 'far', map, o.x, o.z, o.rot, o.scale);
          break;
        case 'rock': {
          const name = pick < 0.34 ? 'rock0' : pick < 0.67 ? 'rock1' : 'rock2';
          this.put(name, 'near', map, o.x, o.z, o.rot, o.scale, 0.12);
          this.put(name, 'far', map, o.x, o.z, o.rot, o.scale, 0.12);
          break;
        }
        case 'menhir': {
          const name = pick < 0.5 ? 'menhir0' : 'menhir1';
          this.put(name, 'near', map, o.x, o.z, o.rot, o.scale, 0.1);
          this.put(name, 'far', map, o.x, o.z, o.rot, o.scale, 0.1);
          break;
        }
        case 'ancientOak':
          this.put('ancient_oak', 'near', map, o.x, o.z, o.rot, o.scale, 0.15);
          this.put('ancient_oak', 'far', map, o.x, o.z, o.rot, o.scale, 0.15);
          break;
        case 'hut':
          this.put('hut', 'near', map, o.x, o.z, o.rot, o.scale, 0.05);
          this.put('hut', 'far', map, o.x, o.z, o.rot, o.scale, 0.05);
          break;
        case 'idol':
          this.put('idol', 'near', map, o.x, o.z, o.rot, o.scale, 0.1);
          this.put('idol', 'far', map, o.x, o.z, o.rot, o.scale, 0.1);
          break;
        case 'shrine':
          this.put('shrine', 'near', map, o.x, o.z, o.rot, 1);
          this.put('shrine', 'far', map, o.x, o.z, o.rot, 1);
          break;
        case 'bonfire':
          this.put('bonfire', 'near', map, o.x, o.z, 0, 1);
          this.put('bonfire', 'far', map, o.x, o.z, 0, 1);
          break;
      }
    });
  }

  /** Dense, tall forest ring that hides the edge of the map (low-detail models only: nobody gets close). */
  private buildBorderForest(map: GameMap): void {
    const rng = new Rng(4242);
    for (let i = 0; i < 1500; i++) {
      const a = rng.range(0, TAU);
      const d = PLAY_RADIUS + 3 + Math.pow(rng.next(), 1.4) * 30;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const roll = rng.next();
      const name = roll < 0.62 ? 'fir_lod' : roll < 0.9 ? 'pine_lod' : 'oak_lod';
      const s = name === 'oak_lod' ? rng.range(1.5, 2.3) : rng.range(1.3, 2.4);
      const rot = rng.range(0, TAU);
      this.put(name, 'near', map, x, z, rot, s);
      this.put(name, 'far', map, x, z, rot, s);
    }
  }

  private buildUndergrowth(map: GameMap): void {
    const rng = new Rng(999);
    const scatter = (name: string, count: number, minS: number, maxS: number, pick: (x: number, z: number) => number, layer: Layer = 'plants'): void => {
      let placed = 0;
      let guard = 0;
      while (placed < count && guard++ < count * 30) {
        const a = rng.range(0, TAU);
        const d = Math.sqrt(rng.next()) * (PLAY_RADIUS + 6);
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (map.inPuddle(x, z)) continue;
        if (rng.next() > pick(x, z)) continue;
        this.put(name, layer, map, x, z, rng.range(0, TAU), rng.range(minS, maxS), 0.02);
        placed++;
      }
    };
    const nearObstacle = (x: number, z: number): number => (map.isFree(x, z, 2.2) ? 0.12 : map.isFree(x, z, 0.3) ? 1 : 0);
    const offPath = (x: number, z: number): number => 1 - Math.min(1, map.pathAt(x, z) * 3);
    const grassy = (x: number, z: number): number => (fbm(x / 9 + 5.5, z / 9 + 1.5, 3) < 0.6 && map.isFree(x, z, 0.2) ? 1 : 0.08) * offPath(x, z);
    scatter('fern', 3400, 0.8, 1.7, (x, z) => nearObstacle(x, z) * offPath(x, z));
    scatter('grass', 20000, 0.8, 1.7, grassy);
    scatter('lily', 1600, 0.9, 1.5, (x, z) => (fbm(x / 6 + 40, z / 6 + 13, 2) > 0.6 && map.isFree(x, z, 0.2) ? 1 : 0.02) * offPath(x, z));
    scatter('mushroom', 640, 0.8, 1.6, nearObstacle);
    scatter('pebble', 1200, 0.6, 1.8, (x, z) => (map.isFree(x, z, 0.3) ? 0.6 : 0));
    // Bushes fill the space between trunks; they do not block movement.
    const bushy = (x: number, z: number): number => (map.isFree(x, z, 0.6) && !map.isFree(x, z, 3.2) ? 1 : 0.03) * offPath(x, z);
    scatter('bush0', 420, 0.8, 1.5, bushy, 'near');
    scatter('bush1', 520, 0.9, 1.7, bushy, 'near');
  }

  /** Undergrowth density and shadow casting follow the quality setting. */
  setQuality(quality: number): void {
    this.plantMul = quality <= 0 ? 0.35 : quality === 1 ? 0.7 : 1;
    this.shadows = quality > 0;
    for (const c of this.chunks.values()) {
      for (const u of c.plants) u.mesh.count = Math.max(1, Math.floor(u.placed * this.plantMul));
      for (const m of c.near) m.castShadow = this.shadows;
    }
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
    // The lit window of the hut on the chicken leg glows and throws light on the yard.
    for (const o of map.obstacles) {
      if (o.kind !== 'hut') continue;
      const c = Math.cos(o.rot);
      const sn = Math.sin(o.rot);
      const at = (lx: number, lz: number): [number, number] => [o.x + lx * c + lz * sn, o.z - lx * sn + lz * c];
      const y = map.heightAt(o.x, o.z) - 0.05;
      const [wx, wz] = at(0.95, 1.75);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffb050, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.75, fog: false }),
      );
      glow.scale.setScalar(3.2);
      glow.position.set(wx, y + 4.45, wz);
      this.group.add(glow);
      const [lx, lz] = at(0.6, 3.4);
      this.sources.push({ x: lx, y: y + 3.4, z: lz, intensity: 42, range: 18, phase: 2.1, on: true });
    }
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
      this.addShrineAura(g, s.kind);
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

  /**
   * Marks an active shrine without shouting: a warm pool of light on the ground, a soft halo around the box
   * and a few motes drifting upwards. All of it lives in the candle group, so it goes out together with the
   * candles once the blessing is taken.
   */
  private addShrineAura(g: THREE.Group, kind: ShrineKind): void {
    const tint = SHRINE_TINT[kind];
    const glow = (opacity: number): THREE.SpriteMaterial =>
      new THREE.SpriteMaterial({ map: this.glowTex, color: tint, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, fog: false });
    const ground = new THREE.Mesh(
      shrineGroundGeo,
      new THREE.MeshBasicMaterial({ map: this.glowTex, color: tint, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: kind === 'circle' ? 0.42 : 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.22;
    // A Święty krąg shows how far its circle reaches.
    if (kind === 'circle') ground.scale.setScalar(CIRCLE_GROUND_SCALE);
    g.add(ground);
    const halo = new THREE.Sprite(glow(0.3));
    halo.position.y = 3.3;
    halo.scale.setScalar(6);
    g.add(halo);
    const motes: THREE.Sprite[] = [];
    for (let i = 0; i < SHRINE_MOTES; i++) {
      const m = new THREE.Sprite(glow(0));
      m.scale.setScalar(0.34);
      motes.push(m);
      g.add(m);
    }
    this.shrineAuras.push({ ground, halo, motes, phase: Math.random() * 10 });
  }

  /** Extinguishes the candles of a used shrine. */
  setShrineUsed(index: number, used: boolean): void {
    const g = this.shrineFlames[index];
    if (g) g.visible = !used;
    const src = this.sources[this.sources.length - this.shrineFlames.length + index];
    if (src) src.on = !used;
  }

  update(time: number, px: number, pz: number): void {
    propUniforms.uTime.value = time;
    // Chunk visibility: full models near the hero, low-detail further out, nothing beyond the fog.
    for (const c of this.chunks.values()) {
      const dx = c.x - px;
      const dz = c.z - pz;
      const d = Math.sqrt(dx * dx + dz * dz);
      const near = d < NEAR;
      const far = !near && d < FAR;
      const plants = d < PLANTS;
      for (let i = 0; i < c.near.length; i++) (c.near[i] as THREE.InstancedMesh).visible = near;
      for (let i = 0; i < c.far.length; i++) (c.far[i] as THREE.InstancedMesh).visible = far;
      for (let i = 0; i < c.plants.length; i++) (c.plants[i] as { mesh: THREE.InstancedMesh }).mesh.visible = plants;
    }
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
    for (let i = 0; i < this.shrineAuras.length; i++) {
      const a = this.shrineAuras[i] as (typeof this.shrineAuras)[number];
      if (!(this.shrineFlames[i] as THREE.Group).visible) continue;
      const t = time + a.phase;
      const breath = 0.5 + 0.5 * Math.sin(t * 1.3);
      (a.ground.material as THREE.MeshBasicMaterial).opacity = 0.22 + breath * 0.12;
      a.halo.material.opacity = 0.24 + breath * 0.12;
      a.halo.scale.setScalar(5.6 + breath * 0.8);
      // Motes circle the shrine slowly while rising, fading in at the plinth and out above the roof.
      for (let j = 0; j < a.motes.length; j++) {
        const m = a.motes[j] as THREE.Sprite;
        const k = (t * 0.11 + j / a.motes.length) % 1;
        const ang = j * 2.4 + t * 0.35;
        const r = 1.5 + Math.sin(j * 1.7 + t * 0.5) * 0.45;
        m.position.set(Math.cos(ang) * r, 0.5 + k * 5.2, Math.sin(ang) * r);
        m.material.opacity = Math.sin(k * Math.PI) * 0.85;
      }
    }
  }
}

const SHRINE_MOTES = 7;
const shrineGroundGeo = new THREE.PlaneGeometry(11, 11);
/** Scale of the ground glow of a Święty krąg, so it covers the 5 m circle (CIRCLE_RADIUS). */
const CIRCLE_GROUND_SCALE = 1.5;

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
