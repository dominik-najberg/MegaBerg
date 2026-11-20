import * as THREE from 'three';
import { TAU } from '../core/math';
import { ENEMIES } from '../data/enemies';
import { Ev, type GameEvent } from '../sim/events';
import { MAX_GEMS, MAX_HAZARDS, MAX_PICKUPS, MAX_PROJ, MAX_SHOTS, MAX_ZONES, PickupKind, ProjKind } from '../sim/pools';
import type { GameMap } from '../sim/terrain';
import type { Chest, World } from '../sim/world';
import { creatureMaterial } from './enemiesView';
import { buildEnemyModels } from './enemyModels';
import { GeoBuilder, writeMatrix } from './geo';
import type { Overlay } from './overlay';
import { Particles } from './particles';

const _c = new THREE.Color();

/** Death-burst colour per enemy id. */
const KILL_COLOR: Record<string, number> = {
  chochlik: 0xb9783c,
  utopiec: 0x8fd0a0,
  kruk: 0x4a4068,
  ognik: 0x8ff0ff,
  strzyga: 0x9a80c0,
  wilkolak: 0x8a7868,
  bies: 0xd04a3a,
  licho: 0xe0d870,
  jaga: 0xb070e0,
  poludnica: 0xfff0b0,
  leszy: 0x7ab040,
};
const KILL_COLORS = ENEMIES.map((d) => KILL_COLOR[d.id] ?? 0xffffff);

function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, cap: number, colors = false): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat, cap);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.count = 0;
  if (colors) {
    m.setColorAt(0, _c.set(0xffffff));
    (m.instanceColor as THREE.InstancedBufferAttribute).setUsage(THREE.DynamicDrawUsage);
  }
  return m;
}

function setColor(m: THREE.InstancedMesh, i: number, hex: number, mul = 1): void {
  const a = (m.instanceColor as THREE.InstancedBufferAttribute).array as Float32Array;
  _c.set(hex);
  a[i * 3] = _c.r * mul;
  a[i * 3 + 1] = _c.g * mul;
  a[i * 3 + 2] = _c.b * mul;
}

function flush(m: THREE.InstancedMesh, count: number): void {
  m.count = count;
  if (count > 0) {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
}

/** Writes a matrix that lays a unit disc on the terrain, tilted to the local slope. */
function writeGround(arr: ArrayLike<number>, index: number, map: GameMap, x: number, z: number, lift: number, scale: number, yaw = 0): void {
  const a = arr as Float32Array;
  const o = index * 16;
  const d = Math.min(2, Math.max(0.6, scale * 0.6));
  const gx = (map.heightAt(x + d, z) - map.heightAt(x - d, z)) / (2 * d);
  const gz = (map.heightAt(x, z + d) - map.heightAt(x, z - d)) / (2 * d);
  const y = map.heightAt(x, z) + lift;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  // Rotated tangent axes projected onto the slope.
  const xx = c;
  const xz = -s;
  const zx = s;
  const zz = c;
  const xy = gx * xx + gz * xz;
  const zy = gx * zx + gz * zz;
  a[o] = xx * scale;
  a[o + 1] = xy * scale;
  a[o + 2] = xz * scale;
  a[o + 3] = 0;
  a[o + 4] = -gx * scale;
  a[o + 5] = scale;
  a[o + 6] = -gz * scale;
  a[o + 7] = 0;
  a[o + 8] = zx * scale;
  a[o + 9] = zy * scale;
  a[o + 10] = zz * scale;
  a[o + 11] = 0;
  a[o + 12] = x;
  a[o + 13] = y;
  a[o + 14] = z;
  a[o + 15] = 1;
}

/** Flat ring sector on the XZ plane with a brightness gradient along the arc (for additive trails). */
function arcGeometry(inner: number, outer: number, from: number, len: number, seg: number, fadeTail: boolean): THREE.BufferGeometry {
  const g = new THREE.RingGeometry(inner, outer, seg, 1, from, len);
  g.rotateX(-Math.PI / 2);
  const pos = g.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const theta = Math.atan2(-z, x);
    const r = Math.hypot(x, z);
    let k = fadeTail ? (theta - from) / len : 1 - Math.abs((theta - from) / len - 0.5) * 2;
    k = len > 6.2 ? 1 : Math.max(0, Math.min(1, k));
    const radial = (r - inner) / (outer - inner);
    const v = fadeTail ? k * k : (0.25 + 0.75 * radial) * Math.sqrt(k);
    col[i * 3] = v;
    col[i * 3 + 1] = v;
    col[i * 3 + 2] = v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

function sickleGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(301);
  const torus = new THREE.TorusGeometry(0.46, 0.075, 4, 9, 3.3);
  torus.rotateX(Math.PI / 2);
  b.add(torus, 0xffd45a, { sy: 0.45, jitter: 0.04 });
  b.cyl(0.05, 0.05, 0.5, 5, 0x6a4526, { x: 0.46, z: 0.26, rx: Math.PI / 2 });
  return b.build();
}

function spearGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(302);
  b.cyl(0.045, 0.045, 1.5, 5, 0x8a6238, { rx: Math.PI / 2 });
  b.cone(0.13, 0.5, 4, 0xe6edf5, { z: 0.95, rx: Math.PI / 2 });
  b.box(0.2, 0.05, 0.05, 0xb3261e, { z: 0.6 });
  return b.build();
}

function potGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(303);
  b.ico(0.24, 0, 0x4a3020, { sy: 0.9 });
  b.cyl(0.12, 0.14, 0.12, 6, 0x6a4a30, { y: 0.24 });
  return b.build();
}

/**
 * Paid chests are dark oak with brass fittings. The gift chest must never be mistaken for one:
 * white birch with emerald fittings, a green gem and two sprouting leaves on the lid.
 */
function chestGeo(gift: boolean): { base: THREE.BufferGeometry; lid: THREE.BufferGeometry } {
  const wood = gift ? 0xe9e4d4 : 0x6a4526;
  const band = gift ? 0x2fae8a : 0xd9a441;
  const b = new GeoBuilder(gift ? 314 : 304);
  b.box(1.1, 0.55, 0.75, wood, { y: 0.28 });
  b.box(1.14, 0.1, 0.79, band, { y: 0.1 });
  b.box(1.14, 0.08, 0.79, band, { y: 0.5 });
  b.box(0.16, 0.24, 0.08, gift ? 0x9ff5d8 : 0xf0c860, { y: 0.42, z: 0.4 });
  const l = new GeoBuilder(gift ? 315 : 305);
  l.box(1.1, 0.2, 0.75, gift ? 0xf2eee0 : 0x7a5230, { y: 0.1, z: 0.375 });
  l.box(0.9, 0.14, 0.6, gift ? 0xdcd6c2 : 0x8a6238, { y: 0.26, z: 0.375 });
  l.box(1.14, 0.08, 0.79, band, { y: 0.04, z: 0.375 });
  l.box(0.14, 0.3, 0.8, band, { y: 0.16, z: 0.375 });
  if (gift) {
    // Birch bark flecks on the front and the sides.
    for (const [x, y, w] of [[-0.36, 0.3, 0.16], [0.3, 0.24, 0.2], [0.38, 0.38, 0.1], [-0.2, 0.36, 0.08]] as const) {
      b.box(w, 0.035, 0.02, 0x3c3a36, { x, y, z: 0.376, jitter: 0 });
    }
    b.box(0.02, 0.035, 0.18, 0x3c3a36, { x: 0.551, y: 0.32, z: 0.1, jitter: 0 });
    b.box(0.02, 0.035, 0.14, 0x3c3a36, { x: -0.551, y: 0.26, z: -0.12, jitter: 0 });
    l.octa(0.15, 0x7dffd8, { y: 0.44, z: 0.375, sy: 1.25, jitter: 0.03 });
    l.cone(0.08, 0.3, 4, 0x58c878, { x: -0.3, y: 0.42, z: 0.375, rz: 0.55 });
    l.cone(0.08, 0.3, 4, 0x58c878, { x: 0.3, y: 0.42, z: 0.375, rz: -0.55 });
  }
  return { base: b.build(), lid: l.build() };
}

function breadGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(306);
  b.ico(0.3, 0, 0xc98a45, { y: 0.16, sy: 0.5, sz: 0.75 });
  b.box(0.36, 0.06, 0.3, 0xf2ead8, { y: 0.3 });
  return b.build();
}

function honeyGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(307);
  b.cyl(0.2, 0.24, 0.34, 7, 0xb9783c, { y: 0.17 });
  b.cyl(0.22, 0.22, 0.07, 7, 0xf0b030, { y: 0.36 });
  return b.build();
}

/** Horseshoe magnet standing on its bend: red body, bright steel poles pointing up. */
function magnetGeo(): THREE.BufferGeometry {
  const b = new GeoBuilder(308);
  const r = 0.28;
  b.add(new THREE.TorusGeometry(r, 0.095, 5, 8, Math.PI), 0xd8262a, { y: 0.375, rz: Math.PI, jitter: 0.04 });
  for (const x of [-r, r]) {
    b.box(0.19, 0.3, 0.19, 0xd8262a, { x, y: 0.52, jitter: 0.04 });
    b.box(0.2, 0.17, 0.2, 0xeef3f8, { x, y: 0.75, jitter: 0.02 });
  }
  return b.build();
}

const BEAM_H = 16;

/**
 * Pillar of light over a bonus (drawn additively): dim at the ground so the object inside stays readable,
 * brightest just above it, fading to nothing at the top.
 */
function beamGeo(): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.12, 0.46, BEAM_H, 10, 16, true);
  g.translate(0, BEAM_H / 2, 0);
  const pos = g.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = 1 - y / BEAM_H;
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k * k * Math.min(1, 0.25 + y / 2.5);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

function beamMaterial(color: number): THREE.MeshBasicMaterial {
  // No scene fog: the pillar is a beacon and has to read from across the clearing at night.
  return new THREE.MeshBasicMaterial({ vertexColors: true, color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.27, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false });
}

const MAGNET_COLOR = 0xff5060;
const PORTAL_COLOR = 0x5aff8a;
const GIFT_COLOR = 0x7dffd0;
const MAX_MAGNETS = 16;

interface Timed {
  mesh: THREE.Mesh;
  t: number;
  span: number;
  r: number;
}

const BOLT_SEG = 9;

/**
 * Everything dynamic that is not an enemy or the hero: loot, weapon effects, telegraphs,
 * particles. Reads world state each frame and reacts to simulation events.
 */
export class FxView {
  readonly group = new THREE.Group();
  readonly sparks = new Particles(2600, true, 1);
  readonly dust = new Particles(700, false, 1);
  shake = 0;
  showNumbers = true;
  /** Camera yaw, so billboards can face the camera. */
  camYaw = 0;

  private readonly gems: THREE.InstancedMesh;
  private readonly coins: THREE.InstancedMesh;
  private readonly bread: THREE.InstancedMesh;
  private readonly honey: THREE.InstancedMesh;
  private readonly magnets: THREE.InstancedMesh;
  private readonly magnetBeams: THREE.InstancedMesh;
  private readonly beamGeo = beamGeo();
  private readonly giftBeamMat = beamMaterial(GIFT_COLOR);
  private readonly blades: THREE.InstancedMesh;
  private readonly trails: THREE.InstancedMesh;
  private readonly fire: THREE.InstancedMesh;
  private readonly stones: THREE.InstancedMesh;
  private readonly spears: THREE.InstancedMesh;
  private readonly pots: THREE.InstancedMesh;
  private readonly shots: THREE.InstancedMesh;
  private readonly ravens: THREE.InstancedMesh;
  private readonly ravenFx: THREE.InstancedBufferAttribute;
  private readonly ravenU = { uTime: { value: 0 }, uCycle: { value: 18 } };
  private readonly zones: THREE.InstancedMesh;
  private readonly hazRing: THREE.InstancedMesh;
  private readonly hazFill: THREE.InstancedMesh;
  private readonly bombs: THREE.InstancedMesh;
  private readonly aura: THREE.Mesh;
  private readonly auraMat: THREE.MeshBasicMaterial;
  private readonly cone: THREE.Mesh;
  private coneArc = 0;
  private readonly sweeps: Timed[] = [];
  private readonly sweepGeos = new Map<number, THREE.BufferGeometry>();
  private readonly bolts: Timed[] = [];
  private readonly booms: Timed[] = [];
  private readonly warns: Timed[] = [];
  private readonly flash: THREE.PointLight;
  private flashT = 0;
  private readonly chestViews: Array<{ group: THREE.Group; lid: THREE.Mesh; glow: THREE.Sprite; beam: THREE.Mesh | null; openT: number }> = [];
  private readonly chestParts = chestGeo(false);
  private readonly chestMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  private readonly giftParts = chestGeo(true);
  /** Slightly self-lit, so the white birch still reads as white deep in the night. */
  private readonly giftMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x16382e });
  private readonly gemGlow: THREE.InstancedMesh;
  private readonly heroRing: THREE.Mesh;
  private readonly mist: THREE.InstancedMesh;
  private readonly mistSeeds: Float32Array;
  private readonly ghosts: Array<{ mesh: THREE.Mesh; t: number }> = [];
  private readonly fireflies: THREE.Points;
  private readonly fireflyMat: THREE.ShaderMaterial;
  private emitAcc = 0;
  private time = 0;
  /** Leszy's portal: a slowly turning ring of leaves and light in a wide green pillar. */
  private readonly portalView: THREE.Group;
  private readonly portalRing: THREE.Mesh;

  constructor(
    private readonly map: GameMap,
    private readonly overlay: Overlay,
    private readonly glowTex: THREE.Texture,
  ) {
    const g = this.group;
    // --- Leszy's portal
    this.portalView = new THREE.Group();
    this.portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.22, 10, 40),
      new THREE.MeshBasicMaterial({ color: PORTAL_COLOR, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }),
    );
    this.portalRing.position.y = 2.6;
    const portalBeam = new THREE.Mesh(this.beamGeo, beamMaterial(PORTAL_COLOR));
    portalBeam.scale.set(5, 1.4, 5);
    const portalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: PORTAL_COLOR, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, fog: false }));
    portalGlow.position.y = 2.6;
    portalGlow.scale.setScalar(7);
    this.portalView.add(this.portalRing, portalBeam, portalGlow);
    this.portalView.visible = false;
    g.add(this.portalView);
    // --- loot
    this.gems = instanced(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshLambertMaterial({ emissive: 0xc86a08, flatShading: true }), MAX_GEMS, true);
    this.coins = instanced(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), new THREE.MeshLambertMaterial({ color: 0xffd040, emissive: 0x9a6a00, flatShading: true }), MAX_PICKUPS);
    this.bread = instanced(breadGeo(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x2a1a08 }), 64);
    this.honey = instanced(honeyGeo(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x3a2808 }), 64);
    this.magnets = instanced(magnetGeo(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x5a1414 }), MAX_MAGNETS);
    this.magnetBeams = instanced(this.beamGeo, beamMaterial(MAGNET_COLOR), MAX_MAGNETS);
    this.magnetBeams.renderOrder = 3;
    g.add(this.gems, this.coins, this.bread, this.honey, this.magnets, this.magnetBeams);
    // Soft additive glow on the ground under every gem (cheap: one instanced quad each).
    this.gemGlow = instanced(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: this.glowTex, color: 0xff9a2a, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }),
      MAX_GEMS,
    );
    this.gemGlow.renderOrder = 2;
    g.add(this.gemGlow);
    // Golden ring under the hero: keeps him readable inside a crowd.
    this.heroRing = new THREE.Mesh(
      arcGeometry(0.72, 1, 0, TAU, 32, false),
      new THREE.MeshBasicMaterial({ vertexColors: true, color: 0xffd060, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }),
    );
    this.heroRing.renderOrder = 3;
    g.add(this.heroRing);
    // Ground mist: big soft billboards drifting around the hero.
    const mistCount = 46;
    this.mistSeeds = new Float32Array(mistCount * 4);
    for (let i = 0; i < this.mistSeeds.length; i++) this.mistSeeds[i] = Math.random();
    this.mist = instanced(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: this.glowTex, color: 0x9a8ac8, transparent: true, opacity: 0.2, depthWrite: false, fog: false }),
      mistCount,
    );
    this.mist.renderOrder = 1;
    g.add(this.mist);

    // --- orbiting sickles + their additive trails
    this.blades = instanced(sickleGeo(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0xb07a10 }), 40, true);
    this.trails = instanced(
      arcGeometry(0.88, 1.06, -1.3, 1.3, 12, true),
      new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, opacity: 0.55 }),
      40,
      true,
    );
    this.trails.renderOrder = 4;
    g.add(this.blades, this.trails);

    // --- projectiles
    this.fire = instanced(new THREE.IcosahedronGeometry(0.2, 1), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false }), MAX_PROJ, true);
    this.fire.renderOrder = 4;
    this.stones = instanced(new THREE.IcosahedronGeometry(0.17, 0), new THREE.MeshLambertMaterial({ flatShading: true, emissive: 0x222222 }), MAX_PROJ, true);
    this.spears = instanced(spearGeo(), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x554422 }), MAX_PROJ);
    this.pots = instanced(potGeo(), new THREE.MeshLambertMaterial({ vertexColors: true }), 64);
    this.shots = instanced(new THREE.IcosahedronGeometry(0.36, 0), new THREE.MeshBasicMaterial({ color: 0xc070ff, toneMapped: false }), MAX_SHOTS);
    g.add(this.fire, this.stones, this.spears, this.pots, this.shots);

    // --- summoned ravens share the creature shader (wing flap)
    const ravenGeo = (buildEnemyModels().kruk as { geo: THREE.BufferGeometry }).geo;
    this.ravens = instanced(ravenGeo, creatureMaterial(0x2a1c66, this.ravenU), 24);
    this.ravenFx = new THREE.InstancedBufferAttribute(new Float32Array(24 * 4), 4);
    ravenGeo.setAttribute('aFx', this.ravenFx);
    g.add(this.ravens);

    // --- ground decals: zones, hazard telegraphs
    const disc = new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2);
    const decal = (opacity: number, additive: boolean): THREE.MeshBasicMaterial =>
      new THREE.MeshBasicMaterial({ transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.zones = instanced(disc, decal(0.5, false), MAX_ZONES, true);
    this.hazFill = instanced(disc, decal(0.4, false), MAX_HAZARDS, true);
    this.hazRing = instanced(new THREE.RingGeometry(0.93, 1, 40).rotateX(-Math.PI / 2), decal(0.95, false), MAX_HAZARDS, true);
    this.bombs = instanced(new THREE.IcosahedronGeometry(0.45, 0), new THREE.MeshBasicMaterial({ color: 0xb8ff60, toneMapped: false }), 32);
    this.zones.renderOrder = 2;
    this.hazFill.renderOrder = 3;
    this.hazRing.renderOrder = 3;
    g.add(this.zones, this.hazFill, this.hazRing, this.bombs);

    // --- aura ring (wianek) and frost cone (marzanna)
    this.auraMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: 0x7fd65a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    this.aura = new THREE.Mesh(arcGeometry(0.55, 1, 0, TAU, 40, false), this.auraMat);
    this.aura.visible = false;
    this.aura.renderOrder = 3;
    this.cone = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({ vertexColors: true, color: 0x9fe8ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    );
    this.cone.visible = false;
    this.cone.renderOrder = 3;
    g.add(this.aura, this.cone);

    // --- pooled one-shot effects
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
      mesh.visible = false;
      mesh.renderOrder = 4;
      g.add(mesh);
      this.sweeps.push({ mesh, t: 0, span: 0.22, r: 1 });
    }
    for (let i = 0; i < 14; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BOLT_SEG * 2 * 6 * 3), 3));
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xd8ecff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.renderOrder = 6;
      g.add(mesh);
      this.bolts.push({ mesh, t: 0, span: 0.16, r: 1 });
    }
    // Shockwave: a flat ring that expands along the ground.
    const boomGeo = arcGeometry(0.72, 1, 0, TAU, 36, false);
    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(boomGeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      mesh.visible = false;
      mesh.renderOrder = 4;
      g.add(mesh);
      this.booms.push({ mesh, t: 0, span: 0.28, r: 1 });
    }
    const warnGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(warnGeo, decal(0.4, false));
      (mesh.material as THREE.MeshBasicMaterial).color.set(0xff4a2a);
      mesh.visible = false;
      mesh.renderOrder = 3;
      g.add(mesh);
      this.warns.push({ mesh, t: 0, span: 0.7, r: 1 });
    }
    this.flash = new THREE.PointLight(0xbfdcff, 0, 40, 1.4);
    g.add(this.flash);

    g.add(this.sparks.points, this.dust.points);

    // --- fireflies: positions wrap around the hero in the vertex shader
    const fcount = 140;
    const seeds = new Float32Array(fcount * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute('position', new THREE.BufferAttribute(seeds, 3));
    this.fireflyMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uScale: { value: 600 }, uNight: { value: 0 } },
      vertexShader: /* glsl */ `
uniform float uTime; uniform vec3 uCenter; uniform float uScale; uniform float uNight;
varying float vA;
void main() {
  vec3 s = position;
  vec2 cell = vec2(70.0);
  vec2 base = s.xz * cell + vec2(sin(uTime * 0.21 + s.y * 40.0), cos(uTime * 0.17 + s.x * 30.0)) * 2.5;
  vec2 rel = mod(base - uCenter.xz + cell * 0.5, cell) - cell * 0.5;
  vec3 p = vec3(uCenter.x + rel.x, uCenter.y + 0.6 + s.y * 3.2 + sin(uTime * 0.9 + s.z * 50.0) * 0.5, uCenter.z + rel.y);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.5 + 0.5 * sin(uTime * (1.5 + s.z * 2.0) + s.x * 60.0);
  vA = tw * (0.35 + 0.65 * uNight) * smoothstep(34.0, 20.0, length(rel));
  gl_PointSize = (0.16 + 0.12 * tw) * uScale / max(0.1, -mv.z);
}`,
      fragmentShader: /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(vec3(0.95, 1.0, 0.45) * a * vA * 1.6, a * vA);
  #include <colorspace_fragment>
}`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    this.fireflies = new THREE.Points(fgeo, this.fireflyMat);
    this.fireflies.frustumCulled = false;
    this.fireflies.renderOrder = 5;
    g.add(this.fireflies);
  }

  setViewport(height: number, fov: number): void {
    this.sparks.setScale(height, fov);
    this.dust.setScale(height, fov);
    (this.fireflyMat.uniforms.uScale as THREE.IUniform).value = height / (2 * Math.tan((fov * Math.PI) / 360));
  }

  setDensity(k: number): void {
    this.sparks.density = k;
    this.dust.density = k;
    this.mist.visible = k > 0.6;
  }

  /** Mist takes the colour of the fog so it blends with the time of day. */
  setFogColor(c: THREE.Color): void {
    (this.mist.material as THREE.MeshBasicMaterial).color.copy(c).multiplyScalar(1.5);
  }

  /** Short-lived translucent copies of the hero left behind while dashing. */
  addGhost(source: THREE.Object3D): void {
    let slot = this.ghosts.find((x) => x.t <= 0);
    if (!slot) {
      if (this.ghosts.length >= 6) return;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.7, 0.4), new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      mesh.renderOrder = 4;
      this.group.add(mesh);
      slot = { mesh, t: 0 };
      this.ghosts.push(slot);
    }
    slot.t = 0.28;
    slot.mesh.visible = true;
    slot.mesh.position.copy(source.position);
    slot.mesh.position.y += 0.85;
    slot.mesh.rotation.set(0.7, source.rotation.y, 0, 'YXZ');
  }

  // ---------------------------------------------------------------- events

  handleEvents(world: World): void {
    const ev = world.events;
    for (let i = 0; i < ev.count; i++) this.onEvent(ev.items[i] as GameEvent, world);
  }

  private onEvent(e: GameEvent, world: World): void {
    const sp = this.sparks;
    switch (e.type) {
      case Ev.Hit: {
        if (e.b !== 2) sp.burst(e.x, e.y + e.c * 0.5, e.z, e.b === 1 ? 6 : 2, 5, 0.25, 0.22, e.b === 1 ? 0xffe060 : 0xfff4d0, 6);
        if (this.showNumbers) this.overlay.number(e.x, e.y + e.c + 0.3, e.z, e.a, e.b);
        break;
      }
      case Ev.Kill: {
        const color = KILL_COLORS[e.a] ?? 0xffffff;
        const big = e.b > 0 || e.c > 1;
        sp.burst(e.x, e.y + 0.6, e.z, big ? 26 : 9, big ? 9 : 6, 0.5, big ? 0.5 : 0.34, color, 9, 2);
        this.dust.burst(e.x, e.y + 0.3, e.z, big ? 8 : 3, 2.5, 0.6, big ? 1.6 : 0.9, 0x3a3040, -0.5, 0.6);
        if (big) this.addShake(e.c > 2 ? 1.6 : 0.5);
        if (e.c > 2) this.boom(e.x, e.y + 3, e.z, 12, 0xffc060, 0.7);
        break;
      }
      case Ev.Gem:
        sp.burst(e.x, e.y, e.z, 2, 2.5, 0.3, 0.2, 0xffb030, 0, 1.5);
        break;
      case Ev.Coin:
        sp.burst(e.x, e.y + 1, e.z, 5, 3, 0.4, 0.22, 0xffe060, 0, 2);
        break;
      case Ev.LevelUp: {
        for (let k = 0; k < 40; k++) {
          const a = (k / 40) * TAU;
          sp.emit(e.x + Math.cos(a) * 0.6, e.y + 0.2, e.z + Math.sin(a) * 0.6, Math.cos(a) * 6, 2 + Math.random() * 5, Math.sin(a) * 6, 0.8, 0.4, k % 2 ? 0xffe27a : 0xfff7d0, 3, 1.5);
        }
        this.boom(e.x, e.y + 1, e.z, 5, 0xffd860, 0.45);
        break;
      }
      case Ev.PlayerHit:
        sp.burst(e.x, e.y + 1.1, e.z, 14, 6, 0.4, 0.34, 0xff3a2a, 8, 1);
        this.addShake(0.75);
        break;
      case Ev.Dodge:
        sp.burst(e.x, e.y + 1.1, e.z, 8, 4, 0.3, 0.26, 0xe8f4ff, 0, 2);
        break;
      case Ev.ShieldHit:
        sp.burst(e.x, e.y + 1.1, e.z, 12, 5, 0.35, 0.3, 0x7ec8ff, 4, 1);
        this.addShake(0.3);
        break;
      case Ev.Lightning:
        this.bolt(e.a, e.b, e.c, e.x, e.y, e.z, e.d);
        sp.burst(e.x, e.y + 0.4, e.z, 10, 8, 0.3, 0.3, 0xd8ecff, 10, 3);
        this.flash.position.set(e.x, e.y + 3, e.z);
        this.flashT = 0.14;
        this.addShake(0.22);
        break;
      case Ev.Sweep:
        this.sweep(e.x, e.y, e.z, e.a, e.b, e.c, e.d);
        break;
      case Ev.Explosion:
        this.boom(e.x, e.y, e.z, e.a, e.b, 0.28);
        sp.burst(e.x, e.y, e.z, 10, e.a * 3, 0.4, 0.4, e.b, 4, 2);
        break;
      case Ev.Jump:
        this.dust.burst(e.x, e.y + 0.1, e.z, 5, 2.2, 0.4, 0.8, 0x8a7a66, -0.4, 0.3);
        break;
      case Ev.AirJump:
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * TAU;
          sp.emit(e.x, e.y + 0.2, e.z, Math.cos(a) * 4, -1, Math.sin(a) * 4, 0.4, 0.34, 0xff8a3a, 0, 3);
        }
        break;
      case Ev.Dash:
        this.dust.burst(e.x, e.y + 0.3, e.z, 8, 3, 0.45, 1.1, 0x9a8a78, -0.3, 0.4);
        sp.burst(e.x, e.y + 0.8, e.z, 6, 3, 0.3, 0.22, 0xfff0c0);
        break;
      case Ev.Land:
        if (e.b > 0) sp.burst(e.x, e.y + 0.2, e.z, 14, 4.5, 0.5, 0.26, 0xa8c8e8, 12, 4);
        else this.dust.burst(e.x, e.y + 0.1, e.z, 3 + Math.round(e.a * 8), 2.5 + e.a * 2, 0.45, 0.9, 0x8a7a66, -0.4, 0.3);
        break;
      case Ev.Heal:
        for (let k = 0; k < 10; k++) sp.emit(e.x + (Math.random() - 0.5) * 1.2, e.y + 0.3 + Math.random(), e.z + (Math.random() - 0.5) * 1.2, 0, 2.2, 0, 0.8, 0.3, 0x7dff7a, 0, 0.5);
        break;
      case Ev.ChestOpen: {
        const color = e.a ? GIFT_COLOR : 0xffd860;
        sp.burst(e.x, e.y + 0.8, e.z, 36, 8, 0.8, 0.4, color, 6, 4);
        this.boom(e.x, e.y + 0.8, e.z, 3.5, color, 0.4);
        break;
      }
      case Ev.Bonus: {
        // The bonus drops out of thin air: a ring on the ground and sparks rising along the pillar.
        const color = e.a === 2 ? PORTAL_COLOR : e.a ? GIFT_COLOR : MAGNET_COLOR;
        this.boom(e.x, e.y + 0.8, e.z, 4.5, color, 0.6);
        for (let k = 0; k < 36; k++) {
          const a = Math.random() * TAU;
          const r = Math.random() * 0.9;
          sp.emit(e.x + Math.cos(a) * r, e.y + Math.random() * 5, e.z + Math.sin(a) * r, 0, 2 + Math.random() * 4, 0, 1.2, 0.36, k % 3 ? color : 0xffffff, 0, 0.4);
        }
        break;
      }
      case Ev.Shrine:
        for (let k = 0; k < 30; k++) sp.emit(e.x + (Math.random() - 0.5) * 1.5, e.y + Math.random() * 4, e.z + (Math.random() - 0.5) * 1.5, 0, 3 + Math.random() * 3, 0, 1.1, 0.36, 0xffe6a0, 0, 0.4);
        break;
      case Ev.BossSpawn:
        this.addShake(1.2);
        this.dust.burst(e.x, e.y + 1, e.z, 24, 7, 1.2, 2.6, 0x2a2238, -0.3, 1);
        sp.burst(e.x, e.y + 2, e.z, 40, 10, 0.9, 0.5, 0xff8a20, 2, 3);
        break;
      case Ev.Teleport:
        sp.burst(e.x, e.y + 1, e.z, 14, 4, 0.5, 0.36, 0xe0d870, 0, 1);
        sp.burst(e.a, this.map.heightAt(e.a, e.b) + 1, e.b, 14, 4, 0.5, 0.36, 0xe0d870, 0, 1);
        break;
      case Ev.Death:
        sp.burst(e.x, e.y + 1, e.z, 60, 9, 1.1, 0.5, 0xff3a2a, 6, 3);
        this.addShake(1.5);
        break;
      case Ev.Win:
        for (let k = 0; k < 120; k++) sp.emit(e.x + (Math.random() - 0.5) * 8, e.y + Math.random() * 8, e.z + (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, 4 + Math.random() * 8, (Math.random() - 0.5) * 6, 1.6, 0.5, [0xffd860, 0x7dff7a, 0xfff7d0][k % 3] as number, 3, 0.5);
        this.addShake(2);
        break;
      case Ev.Evolve:
        for (let k = 0; k < 70; k++) {
          const a = Math.random() * TAU;
          sp.emit(e.x, e.y + 1, e.z, Math.cos(a) * (3 + Math.random() * 7), 2 + Math.random() * 8, Math.sin(a) * (3 + Math.random() * 7), 1.1, 0.46, [0xffd860, 0xff6ad5, 0x9fe8ff][k % 3] as number, 5, 1.2);
        }
        this.boom(e.x, e.y + 1, e.z, 7, 0xfff0b0, 0.5);
        this.addShake(0.8);
        break;
      case Ev.EnemyShoot:
        sp.burst(e.x, e.y, e.z, 6, 3, 0.3, 0.3, 0xc070ff);
        break;
      case Ev.Hazard: {
        this.boom(e.x, e.y + 0.4, e.z, e.a, 0xff6a2a, 0.3);
        sp.burst(e.x, e.y + 0.4, e.z, Math.round(8 + e.a * 3), e.a * 2.4, 0.5, 0.42, 0xff8a3a, 7, 4);
        this.dust.burst(e.x, e.y + 0.3, e.z, Math.round(3 + e.a), e.a, 0.7, 1.6, 0x4a3a30, -0.4, 1);
        const p = world.player;
        const d = Math.hypot(p.x - e.x, p.z - e.z);
        this.addShake(Math.max(0, 0.9 - d / 30) * (e.a > 6 ? 1.6 : 0.7));
        break;
      }
      case Ev.Revive:
        for (let k = 0; k < 80; k++) sp.emit(e.x + (Math.random() - 0.5) * 2, e.y + Math.random() * 6, e.z + (Math.random() - 0.5) * 2, 0, 4 + Math.random() * 6, 0, 1.2, 0.5, 0xbfe8ff, 0, 0.3);
        this.boom(e.x, e.y + 1, e.z, 10, 0xbfe8ff, 0.5);
        this.addShake(1.2);
        break;
      case Ev.BossPhase:
        this.addShake(2);
        sp.burst(e.x, e.y + 5, e.z, 60, 14, 1, 0.6, e.a === 3 ? 0xff4a2a : 0x7ab040, 3, 3);
        this.boom(e.x, e.y + 4, e.z, 14, e.a === 3 ? 0xff4a2a : 0x9ad060, 0.6);
        break;
      case Ev.ChargeWarn:
        this.warn(e.x, e.y, e.z, e.a, e.b, e.c);
        break;
      case Ev.Quake:
        this.addShake(1.4 * e.a);
        this.dust.burst(e.x, e.y + 0.3, e.z, 18, 9, 0.9, 2.2, 0x4a3a30, -0.3, 1);
        break;
      case Ev.Fuse:
        sp.burst(e.x, e.y + 0.9, e.z, 5, 2, 0.3, 0.3, 0xffffff);
        break;
      case Ev.Zone:
        sp.burst(e.x, e.y + 0.3, e.z, 16, e.a * 2, 0.5, 0.4, 0xff8a3a, 5, 3);
        break;
      case Ev.Magnet:
        for (let k = 0; k < 60; k++) {
          const a = (k / 60) * TAU * 3;
          sp.emit(e.x + Math.cos(a) * (1 + k * 0.1), e.y + 0.5 + k * 0.04, e.z + Math.sin(a) * (1 + k * 0.1), -Math.sin(a) * 5, 1, Math.cos(a) * 5, 0.9, 0.36, k % 2 ? MAGNET_COLOR : 0xeef3f8, 0, 1);
        }
        this.boom(e.x, e.y + 0.8, e.z, 9, MAGNET_COLOR, 0.5);
        break;
      case Ev.Pickup:
        sp.burst(e.x, e.y + 1, e.z, 8, 3, 0.5, 0.3, 0xffe0a0, 0, 2);
        break;
      default:
        break;
    }
  }

  private addShake(v: number): void {
    if (v > this.shake) this.shake = v;
  }

  private boom(x: number, y: number, z: number, r: number, color: number, span: number): void {
    let best = this.booms[0] as Timed;
    for (const b of this.booms) {
      if (!b.mesh.visible) {
        best = b;
        break;
      }
      if (b.t > best.t) best = b;
    }
    best.mesh.visible = true;
    best.mesh.position.set(x, Math.max(y - 0.6, this.map.heightAt(x, z) + 0.25), z);
    best.t = 0;
    best.span = span;
    best.r = r;
    (best.mesh.material as THREE.MeshBasicMaterial).color.set(color);
  }

  private sweep(x: number, y: number, z: number, angle: number, arc: number, reach: number, color: number): void {
    let slot = this.sweeps[0] as Timed;
    for (const s of this.sweeps) {
      if (!s.mesh.visible) {
        slot = s;
        break;
      }
      if (s.t > slot.t) slot = s;
    }
    const key = Math.round(arc * 100);
    let geo = this.sweepGeos.get(key);
    if (!geo) {
      geo = arc > 6 ? arcGeometry(0.3, 1, 0, TAU, 40, false) : arcGeometry(0.3, 1, -arc / 2, arc, 18, false);
      this.sweepGeos.set(key, geo);
    }
    slot.mesh.geometry = geo;
    slot.mesh.visible = true;
    slot.mesh.position.set(x, y, z);
    slot.mesh.rotation.y = angle - Math.PI / 2;
    slot.t = 0;
    slot.r = reach;
    (slot.mesh.material as THREE.MeshBasicMaterial).color.set(color);
  }

  private bolt(fx: number, fy: number, fz: number, tx: number, ty: number, tz: number, color: number): void {
    let slot = this.bolts[0] as Timed;
    for (const b of this.bolts) {
      if (!b.mesh.visible) {
        slot = b;
        break;
      }
      if (b.t > slot.t) slot = b;
    }
    const pos = slot.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    const len = Math.hypot(tx - fx, ty - fy, tz - fz);
    const jit = Math.min(1.6, len * 0.09);
    const w = 0.16;
    let px = fx;
    let py = fy;
    let pz = fz;
    let o = 0;
    for (let s = 1; s <= BOLT_SEG; s++) {
      const t = s / BOLT_SEG;
      const last = s === BOLT_SEG;
      const nx = fx + (tx - fx) * t + (last ? 0 : (Math.random() - 0.5) * jit);
      const ny = fy + (ty - fy) * t + (last ? 0 : (Math.random() - 0.5) * jit * 0.4);
      const nz = fz + (tz - fz) * t + (last ? 0 : (Math.random() - 0.5) * jit);
      // Two crossed ribbons so the bolt is visible from any side.
      for (let k = 0; k < 2; k++) {
        const ox = k === 0 ? w : 0;
        const oz = k === 0 ? 0 : w;
        a[o++] = px - ox; a[o++] = py; a[o++] = pz - oz;
        a[o++] = px + ox; a[o++] = py; a[o++] = pz + oz;
        a[o++] = nx + ox; a[o++] = ny; a[o++] = nz + oz;
        a[o++] = px - ox; a[o++] = py; a[o++] = pz - oz;
        a[o++] = nx + ox; a[o++] = ny; a[o++] = nz + oz;
        a[o++] = nx - ox; a[o++] = ny; a[o++] = nz - oz;
      }
      px = nx;
      py = ny;
      pz = nz;
    }
    pos.needsUpdate = true;
    slot.mesh.visible = true;
    slot.t = 0;
    (slot.mesh.material as THREE.MeshBasicMaterial).color.set(color);
  }

  private warn(x: number, y: number, z: number, dx: number, dz: number, len: number): void {
    let slot = this.warns[0] as Timed;
    for (const s of this.warns) {
      if (!s.mesh.visible) {
        slot = s;
        break;
      }
      if (s.t > slot.t) slot = s;
    }
    slot.mesh.visible = true;
    slot.mesh.position.set(x, y + 0.25, z);
    slot.mesh.rotation.y = Math.atan2(dx, dz);
    slot.mesh.scale.set(1.6, 1, len);
    slot.t = 0;
  }

  // ---------------------------------------------------------------- per-frame sync

  update(world: World, alpha: number, dt: number, night: number): void {
    this.time += dt;
    const time = this.time;
    const map = this.map;
    const p = world.player;
    const hx = p.px + (p.x - p.px) * alpha;
    const hy = p.py + (p.y - p.py) * alpha;
    const hz = p.pz + (p.z - p.pz) * alpha;
    const sp = this.sparks;
    this.emitAcc += dt;
    const emit = this.emitAcc >= 1 / 45;
    if (emit) this.emitAcc = 0;

    // Leszy's portal
    const po = world.portal;
    this.portalView.visible = po !== null && !po.used;
    if (po && !po.used) {
      this.portalView.position.set(po.x, po.y, po.z);
      this.portalRing.rotation.y = time * 0.8;
      this.portalRing.scale.setScalar(1 + Math.sin(time * 3) * 0.05 + po.progress * 0.25);
      if (emit) sp.emit(po.x + (Math.random() - 0.5) * 3, po.y + Math.random() * 1.5, po.z + (Math.random() - 0.5) * 3, 0, 2 + Math.random() * 3, 0, 1.2, 0.3, PORTAL_COLOR, 0, 0.4);
    }

    // gems
    {
      const g = world.gems;
      const arr = this.gems.instanceMatrix.array;
      let n = 0;
      for (let i = 0; i < g.n; i++) {
        if (!g.alive[i]) continue;
        const v = g.val[i] as number;
        const tier = v >= 20 ? 2 : v >= 5 ? 1 : 0;
        const s = tier === 2 ? 1.9 : tier === 1 ? 1.35 : 1;
        const age = g.age[i] as number;
        const pop = g.mag[i] ? 0 : Math.max(0, 1 - age * 2.5);
        const y = (g.y[i] as number) + (g.mag[i] ? 0 : 0.42 + Math.sin(time * 3 + i) * 0.1 + Math.sin(pop * Math.PI) * 0.9);
        writeMatrix(arr, n, g.x[i] as number, y, g.z[i] as number, time * 2 + i, s, s * 1.3, s);
        setColor(this.gems, n, tier === 2 ? 0xfff0a0 : tier === 1 ? 0xff7a30 : 0xffb030);
        const gs = (1.5 + tier * 0.9) * (0.9 + Math.sin(time * 4 + i) * 0.1);
        writeMatrix(this.gemGlow.instanceMatrix.array, n, g.x[i] as number, y - 0.3, g.z[i] as number, 0, gs, 1, gs);
        n++;
      }
      flush(this.gems, n);
      flush(this.gemGlow, n);
    }
    // pickups
    {
      const k = world.pickups;
      let nc = 0;
      let nb = 0;
      let nh = 0;
      let nm = 0;
      let nbeam = 0;
      for (let i = 0; i < k.n; i++) {
        if (!k.alive[i]) continue;
        const kind = k.kind[i] as number;
        const x = k.x[i] as number;
        const z = k.z[i] as number;
        const y = (k.y[i] as number) + (k.mag[i] ? 0 : 0.35 + Math.sin(time * 3 + i * 2) * 0.1);
        if (kind === PickupKind.Coin) writeMatrix(this.coins.instanceMatrix.array, nc++, x, y + 0.1, z, time * 4 + i, 1, 1, 1, 1.4);
        else if (kind === PickupKind.Bread && nb < 64) writeMatrix(this.bread.instanceMatrix.array, nb++, x, y, z, time + i, 1.3, 1.3, 1.3);
        else if (kind === PickupKind.Honey && nh < 64) writeMatrix(this.honey.instanceMatrix.array, nh++, x, y, z, time + i, 1.3, 1.3, 1.3);
        else if (kind === PickupKind.Magnet && nm < MAX_MAGNETS) {
          if (!k.mag[i]) {
            const gy = k.y[i] as number;
            writeMatrix(this.magnetBeams.instanceMatrix.array, nbeam++, x, gy, z, 0, 1, 1, 1);
            if (emit && Math.random() < 0.2) sp.emit(x + (Math.random() - 0.5) * 0.9, gy + 0.3, z + (Math.random() - 0.5) * 0.9, 0, 2 + Math.random() * 2.5, 0, 1.1, 0.26, MAGNET_COLOR, 0, 0.3);
          }
          writeMatrix(this.magnets.instanceMatrix.array, nm++, x, y + 0.25, z, time * 2.2, 1.7, 1.7, 1.7, 0.3);
        }
      }
      flush(this.coins, nc);
      flush(this.bread, nb);
      flush(this.honey, nh);
      flush(this.magnets, nm);
      flush(this.magnetBeams, nbeam);
      const pulse = 0.27 + Math.sin(time * 2.6) * 0.08;
      (this.magnetBeams.material as THREE.MeshBasicMaterial).opacity = pulse;
      this.giftBeamMat.opacity = pulse;
    }
    this.syncChests(world, dt, time, emit);

    // hero ring + wading splashes + dash afterimages
    {
      const ground = map.heightAt(hx, hz);
      this.heroRing.visible = !world.dead;
      this.heroRing.position.set(hx, ground + 0.12, hz);
      this.heroRing.scale.setScalar(0.95 + Math.sin(time * 3) * 0.05);
      (this.heroRing.material as THREE.MeshBasicMaterial).opacity = (p.invuln > 0 ? 0.75 : 0.42) * Math.max(0.3, 1 - (hy - ground) / 5);
      const speed = Math.hypot(p.vx, p.vz);
      if (emit && p.inPuddle && speed > 1) {
        sp.emit(hx + (Math.random() - 0.5) * 0.6, ground + 0.3, hz + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 2, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.45, 0.2, 0xa8c8e8, 12, 0);
      }
      if (emit && p.onGround && speed > 6 && Math.random() < 0.35 && !p.inPuddle) {
        this.dust.emit(hx, ground + 0.15, hz, (Math.random() - 0.5) * 0.8, 0.7, (Math.random() - 0.5) * 0.8, 0.45, 0.7, 0x8a7a66, -0.3, 1);
      }
      for (const gh of this.ghosts) {
        if (gh.t <= 0) continue;
        gh.t -= dt;
        gh.mesh.visible = gh.t > 0;
        (gh.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, gh.t / 0.28) * 0.35;
      }
    }

    // ground mist billboards (wrap around the hero, always face the camera horizontally)
    if (this.mist.visible) {
      const arr = this.mist.instanceMatrix.array;
      const seeds = this.mistSeeds;
      const cell = 110;
      const n = this.mist.instanceMatrix.count;
      for (let i = 0; i < n; i++) {
        const sx = (seeds[i * 4] as number) * cell + time * (0.35 + (seeds[i * 4 + 2] as number) * 0.5);
        const sz = (seeds[i * 4 + 1] as number) * cell + time * 0.2;
        const rx = ((((sx - hx + cell / 2) % cell) + cell) % cell) - cell / 2;
        const rz = ((((sz - hz + cell / 2) % cell) + cell) % cell) - cell / 2;
        const d = Math.hypot(rx, rz);
        // Fade out near the hero (so it never covers the fight) and at the wrap border.
        const k = Math.min(1, Math.max(0, (d - 14) / 14)) * Math.min(1, Math.max(0, (cell / 2 - d) / 12));
        const size = (16 + (seeds[i * 4 + 3] as number) * 16) * k;
        const x = hx + rx;
        const z = hz + rz;
        writeMatrix(arr, i, x, map.heightAt(x, z) + 1.2 + (seeds[i * 4 + 3] as number) * 1.5, z, this.camYaw, size, size * 0.3, 1);
      }
      this.mist.count = n;
      this.mist.instanceMatrix.needsUpdate = true;
    }

    // weapons: orbit blades, aura, cone, ravens
    {
      let nb = 0;
      let nr = 0;
      let aura = false;
      let cone = false;
      for (const w of world.weapons) {
        if (world.dead) break;
        const kind = w.def.kind;
        if (kind === 'orbit' && w.active > 0) {
          const fade = w.stats.cooldown <= 0 ? 1 : Math.min(1, w.active * 4, (w.span - w.active) * 5 + 0.2);
          const size = (w.def.evolved ? 1.35 : 1.1) * (0.4 + 0.6 * fade);
          for (let k = 0; k < w.fxCount && nb < 40; k++) {
            const a = w.angle + (k * TAU) / w.fxCount;
            const bx = hx + Math.sin(a) * w.fxArea;
            const bz = hz + Math.cos(a) * w.fxArea;
            const by = hy + 1.0 + Math.sin(time * 5 + k) * 0.06;
            writeMatrix(this.blades.instanceMatrix.array, nb, bx, by, bz, a + Math.PI / 2 + time * 0.001, size, size, size);
            writeMatrix(this.trails.instanceMatrix.array, nb, hx, hy + 1.0, hz, a - Math.PI / 2, w.fxArea, 1, w.fxArea);
            setColor(this.blades, nb, 0xffffff);
            setColor(this.trails, nb, w.def.color, fade);
            nb++;
            if (emit) sp.emit(bx, by, bz, 0, 0.6, 0, 0.3, 0.2, w.def.color, 0, 0);
          }
        } else if (kind === 'aura') {
          aura = true;
          this.aura.position.set(hx, hy + 0.12, hz);
          this.aura.rotation.y = time * 0.5;
          this.aura.scale.setScalar(w.fxArea);
          this.auraMat.color.set(w.def.color);
          this.auraMat.opacity = 0.085 + Math.sin(time * 4) * 0.02;
          if (emit) {
            const a = Math.random() * TAU;
            const r = w.fxArea * (0.5 + Math.random() * 0.5);
            sp.emit(hx + Math.cos(a) * r, hy + 0.2, hz + Math.sin(a) * r, -Math.sin(a) * 2, 1 + Math.random(), Math.cos(a) * 2, 0.8, 0.24, w.def.color, 0, 0.5);
          }
        } else if (kind === 'cone' && w.active > 0) {
          cone = true;
          const key = Math.round(w.stats.arc * 100);
          if (this.coneArc !== key) {
            this.coneArc = key;
            this.cone.geometry.dispose();
            this.cone.geometry = w.stats.arc > 6 ? arcGeometry(0.1, 1, 0, TAU, 44, false) : arcGeometry(0.08, 1, -w.stats.arc / 2, w.stats.arc, 14, false);
          }
          this.cone.position.set(hx, hy + 0.9, hz);
          this.cone.rotation.y = w.angle - Math.PI / 2;
          this.cone.scale.set(w.fxArea, 1, w.fxArea);
          (this.cone.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 20) * 0.06;
          for (let k = 0; k < 3; k++) {
            const a = w.angle + (Math.random() - 0.5) * w.stats.arc;
            const v = 10 + Math.random() * 8;
            sp.emit(hx + Math.sin(a) * 0.8, hy + 1 + Math.random() * 0.4, hz + Math.cos(a) * 0.8, Math.sin(a) * v, (Math.random() - 0.3) * 1.5, Math.cos(a) * v, w.fxArea / v, 0.34, k ? 0xe6faff : 0x9fe8ff, 0, 0.4);
          }
        } else if (kind === 'summon') {
          for (const r of w.ravens) {
            if (nr >= 24) break;
            const x = r.px + (r.x - r.px) * alpha;
            const y = r.py + (r.y - r.py) * alpha;
            const z = r.pz + (r.z - r.pz) * alpha;
            writeMatrix(this.ravens.instanceMatrix.array, nr, x, y, z, r.yaw, 0.85, 0.85, 0.85, r.state === 1 ? 0.5 : 0.1);
            const fa = this.ravenFx.array as Float32Array;
            fa[nr * 4] = 0;
            fa[nr * 4 + 1] = w.def.evolved ? 0.6 : 0;
            fa[nr * 4 + 2] = nr * 2.3;
            fa[nr * 4 + 3] = 0;
            nr++;
          }
        }
      }
      flush(this.blades, nb);
      flush(this.trails, nb);
      this.aura.visible = aura;
      this.cone.visible = cone;
      this.ravens.count = nr;
      if (nr > 0) {
        this.ravens.instanceMatrix.needsUpdate = true;
        this.ravenFx.needsUpdate = true;
      }
      this.ravenU.uTime.value = time;
    }

    // player projectiles
    {
      const pr = world.projectiles;
      let nf = 0;
      let ns = 0;
      let nsp = 0;
      let np = 0;
      for (let i = 0; i < pr.n; i++) {
        if (!pr.alive[i]) continue;
        const w = world.weapons[pr.slot[i] as number];
        if (!w) continue;
        const x = (pr.px[i] as number) + ((pr.x[i] as number) - (pr.px[i] as number)) * alpha;
        const y = (pr.py[i] as number) + ((pr.y[i] as number) - (pr.py[i] as number)) * alpha;
        const z = (pr.pz[i] as number) + ((pr.z[i] as number) - (pr.pz[i] as number)) * alpha;
        const kind = pr.kind[i] as number;
        if (kind === ProjKind.Lob) {
          if (np < 64) writeMatrix(this.pots.instanceMatrix.array, np++, x, y, z, time * 9, 1.2, 1.2, 1.2, time * 7);
          if (emit) sp.emit(x, y, z, 0, 0.5, 0, 0.3, 0.26, 0xff8a3a);
          continue;
        }
        const yaw = Math.atan2(pr.vx[i] as number, pr.vz[i] as number);
        if (w.def.icon === 'spear') {
          writeMatrix(this.spears.instanceMatrix.array, nsp++, x, y, z, yaw, 1.2, 1.2, 1.2);
          if (emit) sp.emit(x, y, z, 0, 0, 0, 0.25, 0.22, w.def.color);
        } else if (kind === ProjKind.Bounce) {
          const s = w.def.evolved ? 1.5 : 1.1;
          writeMatrix(this.stones.instanceMatrix.array, ns, x, y, z, time * 12 + i, s, s, s);
          setColor(this.stones, ns, w.def.color);
          ns++;
          if (emit && w.def.evolved) sp.emit(x, y, z, 0, 0, 0, 0.3, 0.26, w.def.color);
        } else {
          const s = ((pr.radius[i] as number) / 0.55) * (1 + Math.sin(time * 30 + i) * 0.1);
          writeMatrix(this.fire.instanceMatrix.array, nf, x, y, z, time * 8 + i, s, s, s);
          setColor(this.fire, nf, w.def.color, 1.2);
          nf++;
          sp.emit(x + (Math.random() - 0.5) * 0.3, y + (Math.random() - 0.5) * 0.3, z + (Math.random() - 0.5) * 0.3, 0, 1.2, 0, 0.35, 0.5, Math.random() < 0.5 ? 0xff5a1a : 0xffc040, -2, 1);
        }
      }
      flush(this.fire, nf);
      flush(this.stones, ns);
      flush(this.spears, nsp);
      flush(this.pots, np);
    }

    // enemy shots
    {
      const s = world.shots;
      let n = 0;
      for (let i = 0; i < s.n; i++) {
        if (!s.alive[i]) continue;
        const x = (s.px[i] as number) + ((s.x[i] as number) - (s.px[i] as number)) * alpha;
        const y = (s.py[i] as number) + ((s.y[i] as number) - (s.py[i] as number)) * alpha;
        const z = (s.pz[i] as number) + ((s.z[i] as number) - (s.pz[i] as number)) * alpha;
        const k = 1 + Math.sin(time * 25 + i) * 0.15;
        writeMatrix(this.shots.instanceMatrix.array, n++, x, y, z, time * 6, k, k, k);
        if (emit) sp.emit(x, y, z, 0, 0.4, 0, 0.3, 0.34, 0x9a40ff);
      }
      flush(this.shots, n);
    }

    // zones
    {
      const zn = world.zones;
      let n = 0;
      for (let i = 0; i < zn.n; i++) {
        if (!zn.alive[i]) continue;
        const w = world.weapons[zn.slot[i] as number];
        const r = zn.r[i] as number;
        const life = zn.life[i] as number;
        const fade = Math.min(1, life * 2, ((zn.span[i] as number) - life) * 6 + 0.1);
        writeGround(this.zones.instanceMatrix.array, n, map, zn.x[i] as number, zn.z[i] as number, 0.08, r * (0.6 + 0.4 * fade), i);
        setColor(this.zones, n, 0x2a1408, 1);
        n++;
        if (emit) {
          const a = Math.random() * TAU;
          const d = Math.sqrt(Math.random()) * r;
          const fx = (zn.x[i] as number) + Math.cos(a) * d;
          const fz = (zn.z[i] as number) + Math.sin(a) * d;
          sp.emit(fx, map.heightAt(fx, fz) + 0.2, fz, 0, 2 + Math.random() * 2, 0, 0.5, 0.5, Math.random() < 0.5 ? (w?.def.color ?? 0xff8a3a) : 0xffd060, -1, 0.5);
        }
      }
      flush(this.zones, n);
    }

    // hazard telegraphs
    {
      const h = world.hazards;
      let n = 0;
      let nb = 0;
      for (let i = 0; i < h.n; i++) {
        if (!h.alive[i]) continue;
        const r = h.r[i] as number;
        const k = Math.min(1, (h.t[i] as number) / (h.delay[i] as number));
        const x = h.x[i] as number;
        const z = h.z[i] as number;
        const air = h.air[i] as number;
        const color = air ? 0x9aff40 : 0xff3a1a;
        const pulse = k > 0.75 ? 1.5 + Math.sin(time * 40) * 0.5 : 1;
        writeGround(this.hazRing.instanceMatrix.array, n, map, x, z, 0.14, r);
        writeGround(this.hazFill.instanceMatrix.array, n, map, x, z, 0.1, r * Math.max(0.05, k));
        setColor(this.hazRing, n, color, pulse);
        setColor(this.hazFill, n, color, 0.9 * pulse);
        n++;
        if (air && nb < 32) {
          const by = (h.y[i] as number) + (1 - k) * (1 - k) * 16 + 0.4;
          writeMatrix(this.bombs.instanceMatrix.array, nb++, x, by, z, time * 6, 1, 1, 1);
          if (emit) sp.emit(x, by + 0.4, z, 0, 1, 0, 0.3, 0.34, 0xb8ff60);
        }
      }
      flush(this.hazRing, n);
      flush(this.hazFill, n);
      flush(this.bombs, nb);
    }

    // burning / frozen enemies and wisps shed particles (sampled, not all of them)
    if (emit) {
      const e = world.enemies;
      const n = e.n;
      if (n > 0) {
        for (let k = 0; k < 14; k++) {
          const i = Math.floor(Math.random() * n);
          if (!e.alive[i]) continue;
          const x = e.x[i] as number;
          const y = (e.y[i] as number) + (e.oy[i] as number);
          const z = e.z[i] as number;
          if ((e.burnT[i] as number) > 0) sp.emit(x + (Math.random() - 0.5) * 0.5, y + 0.4 + Math.random() * 0.8, z + (Math.random() - 0.5) * 0.5, 0, 2.2, 0, 0.4, 0.34, Math.random() < 0.5 ? 0xff5a1a : 0xffc040, -1, 0.5);
          else if ((e.slowT[i] as number) > 0 && (e.slowK[i] as number) > 0.3) sp.emit(x + (Math.random() - 0.5) * 0.6, y + 0.3 + Math.random(), z + (Math.random() - 0.5) * 0.6, 0, -0.5, 0, 0.5, 0.2, 0xe6faff, 0, 0);
          else if (e.elite[i]) sp.emit(x + (Math.random() - 0.5) * 0.8, y + Math.random() * 1.6, z + (Math.random() - 0.5) * 0.8, 0, 1.4, 0, 0.6, 0.24, 0xffd040, 0, 0);
        }
      }
      // bonfire embers near the hero
      for (const b of map.bonfires) {
        if (Math.abs(b.x - hx) + Math.abs(b.z - hz) > 60 || Math.random() > 0.5) continue;
        sp.emit(b.x + (Math.random() - 0.5) * 0.7, map.heightAt(b.x, b.z) + 1 + Math.random(), b.z + (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.8, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 0.8, 1.4, 0.2, Math.random() < 0.6 ? 0xff8a2a : 0xffd060, -0.3, 0.3);
      }
    }

    // timed one-shots
    for (const s of this.sweeps) {
      if (!s.mesh.visible) continue;
      s.t += dt;
      const k = s.t / s.span;
      if (k >= 1) {
        s.mesh.visible = false;
        continue;
      }
      const grow = 0.55 + 0.45 * Math.min(1, k * 3);
      s.mesh.scale.set(s.r * grow, 1, s.r * grow);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - k * k;
    }
    for (const b of this.bolts) {
      if (!b.mesh.visible) continue;
      b.t += dt;
      const k = b.t / b.span;
      if (k >= 1) {
        b.mesh.visible = false;
        continue;
      }
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (Math.floor(b.t * 60) % 2 ? 0.6 : 1);
    }
    for (const b of this.booms) {
      if (!b.mesh.visible) continue;
      b.t += dt;
      const k = b.t / b.span;
      if (k >= 1) {
        b.mesh.visible = false;
        continue;
      }
      const s = b.r * (0.3 + 0.7 * (1 - (1 - k) * (1 - k)));
      b.mesh.scale.set(s, 1, s);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k);
    }
    for (const w of this.warns) {
      if (!w.mesh.visible) continue;
      w.t += dt;
      const k = w.t / w.span;
      if (k >= 1) {
        w.mesh.visible = false;
        continue;
      }
      (w.mesh.material as THREE.MeshBasicMaterial).opacity = 0.2 + 0.3 * Math.abs(Math.sin(w.t * 18));
    }
    if (this.flashT > 0) {
      this.flashT -= dt;
      this.flash.intensity = this.flashT > 0 ? 90 * (this.flashT / 0.14) : 0;
    }

    sp.update(dt);
    this.dust.update(dt);
    const fu = this.fireflyMat.uniforms as Record<string, THREE.IUniform>;
    fu.uTime!.value = time;
    (fu.uCenter!.value as THREE.Vector3).set(hx, hy, hz);
    fu.uNight!.value = night;
  }

  private syncChests(world: World, dt: number, time: number, emit: boolean): void {
    const list = world.chests;
    while (this.chestViews.length < list.length) {
      const c = list[this.chestViews.length] as Chest;
      const group = new THREE.Group();
      const parts = c.gift ? this.giftParts : this.chestParts;
      const mat = c.gift ? this.giftMat : this.chestMat;
      const base = new THREE.Mesh(parts.base, mat);
      const lid = new THREE.Mesh(parts.lid, mat);
      lid.position.set(0, 0.56, -0.375);
      base.castShadow = true;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd860, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }));
      glow.scale.setScalar(c.gift ? 3.8 : 3.4);
      glow.position.y = 0.6;
      group.add(base, lid, glow);
      let beam: THREE.Mesh | null = null;
      if (c.gift) {
        beam = new THREE.Mesh(this.beamGeo, this.giftBeamMat);
        beam.renderOrder = 3;
        group.add(beam);
      }
      group.position.set(c.x, c.y, c.z);
      group.rotation.y = c.rot;
      this.group.add(group);
      this.chestViews.push({ group, lid, glow, beam, openT: 0 });
    }
    for (let i = 0; i < list.length; i++) {
      const c = list[i] as Chest;
      const v = this.chestViews[i] as (typeof this.chestViews)[number];
      const mat = v.glow.material;
      if (c.opened) {
        v.openT += dt;
        v.lid.rotation.x = -Math.min(1.9, v.openT * 9);
        mat.opacity = Math.max(0, 0.9 - v.openT * 0.6);
        if (v.beam) v.beam.visible = false;
        if (v.openT > 6) v.group.visible = false;
        else if (v.openT > 4) v.group.scale.setScalar(Math.max(0.01, 1 - (v.openT - 4) / 2));
      } else {
        v.group.visible = true;
        v.group.scale.setScalar(c.free ? 1.15 + Math.sin(time * 6) * 0.05 : 1);
        // The gift is already lit by its pillar: a softer halo keeps the white birch readable.
        mat.opacity = c.gift ? 0.32 + Math.sin(time * 5) * 0.1 : c.free ? 0.6 + Math.sin(time * 5) * 0.2 : 0.22 + Math.sin(time * 2 + i) * 0.08;
        mat.color.set(c.gift ? GIFT_COLOR : c.free ? 0xffe27a : 0xd9a441);
        if (c.gift && emit && Math.random() < 0.2) {
          this.sparks.emit(c.x + (Math.random() - 0.5) * 1.2, c.y + 0.4, c.z + (Math.random() - 0.5) * 1.2, 0, 2 + Math.random() * 2.5, 0, 1.1, 0.26, GIFT_COLOR, 0, 0.3);
        }
      }
    }
  }

  /** Removes chest meshes of a finished run. */
  reset(): void {
    for (const v of this.chestViews) {
      this.group.remove(v.group);
      v.glow.material.dispose();
    }
    this.chestViews.length = 0;
    for (const list of [this.sweeps, this.bolts, this.booms, this.warns]) for (const s of list) s.mesh.visible = false;
    for (const gh of this.ghosts) {
      gh.t = 0;
      gh.mesh.visible = false;
    }
    this.shake = 0;
  }
}
