import * as THREE from 'three';

export interface Xf {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  /** Uniform scale. */
  s?: number;
  sx?: number;
  sy?: number;
  sz?: number;
  /** Limb swing weight (signed). Vertices below `pivot` swing forward/back in the vertex shader. */
  swing?: number;
  pivot?: number;
  /** Wing flap weight: vertices further than `flapFrom` from the body axis move up/down. */
  flap?: number;
  flapFrom?: number;
  /** Per-triangle brightness jitter, default 0.07. */
  jitter?: number;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _c = new THREE.Color();
const _v = new THREE.Vector3();

let jitterSeed = 1;
function jrand(): number {
  jitterSeed = (jitterSeed * 1664525 + 1013904223) >>> 0;
  return jitterSeed / 4294967296;
}

/**
 * Merges coloured low-poly primitives into one non-indexed BufferGeometry.
 * Non-indexed + computeVertexNormals gives flat shading for free.
 */
export class GeoBuilder {
  private readonly pos: number[] = [];
  private readonly col: number[] = [];
  private readonly anim: number[] = [];
  private hasAnim = false;
  /** Always emit the aAnim attribute (instanced enemy shaders require it). */
  forceAnim = false;

  constructor(seed = 1) {
    jitterSeed = seed;
  }

  add(geom: THREE.BufferGeometry, color: number, xf: Xf = {}): this {
    const g = geom.index ? geom.toNonIndexed() : geom;
    _e.set(xf.rx ?? 0, xf.ry ?? 0, xf.rz ?? 0);
    _q.setFromEuler(_e);
    const s = xf.s ?? 1;
    _s.set((xf.sx ?? 1) * s, (xf.sy ?? 1) * s, (xf.sz ?? 1) * s);
    _p.set(xf.x ?? 0, xf.y ?? 0, xf.z ?? 0);
    _m.compose(_p, _q, _s);
    const pa = g.getAttribute('position');
    const jitter = xf.jitter ?? 0.07;
    const swing = xf.swing ?? 0;
    const flap = xf.flap ?? 0;
    if (swing !== 0 || flap !== 0) this.hasAnim = true;
    const pivot = xf.pivot ?? 0;
    const flapFrom = xf.flapFrom ?? 0;
    for (let i = 0; i < pa.count; i += 3) {
      const k = 1 + (jrand() - 0.5) * 2 * jitter;
      _c.set(color);
      for (let j = 0; j < 3; j++) {
        _v.fromBufferAttribute(pa, i + j).applyMatrix4(_m);
        this.pos.push(_v.x, _v.y, _v.z);
        this.col.push(_c.r * k, _c.g * k, _c.b * k);
        this.anim.push(swing * Math.max(0, pivot - _v.y), flap * Math.max(0, Math.abs(_v.x) - flapFrom));
      }
    }
    if (g !== geom) g.dispose();
    geom.dispose();
    return this;
  }

  box(w: number, h: number, d: number, color: number, xf?: Xf): this {
    return this.add(new THREE.BoxGeometry(w, h, d), color, xf);
  }

  cyl(rTop: number, rBottom: number, h: number, seg: number, color: number, xf?: Xf): this {
    return this.add(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1), color, xf);
  }

  cone(r: number, h: number, seg: number, color: number, xf?: Xf): this {
    return this.add(new THREE.ConeGeometry(r, h, seg, 1), color, xf);
  }

  ico(r: number, detail: number, color: number, xf?: Xf): this {
    return this.add(new THREE.IcosahedronGeometry(r, detail), color, xf);
  }

  octa(r: number, color: number, xf?: Xf): this {
    return this.add(new THREE.OctahedronGeometry(r, 0), color, xf);
  }

  /** Recolours already-added triangles whose face normal points up (moss, snow, ...). */
  tintUpFaces(color: number, minNy: number, amount = 1): this {
    _c.set(color);
    const p = this.pos;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    for (let i = 0; i < p.length; i += 9) {
      a.set(p[i] as number, p[i + 1] as number, p[i + 2] as number);
      b.set(p[i + 3] as number, p[i + 4] as number, p[i + 5] as number);
      c.set(p[i + 6] as number, p[i + 7] as number, p[i + 8] as number);
      b.sub(a);
      c.sub(a);
      b.cross(c).normalize();
      if (b.y > minNy) {
        const k = 1 + (jrand() - 0.5) * 0.16;
        for (let j = 0; j < 9; j += 3) {
          this.col[i + j] = THREE.MathUtils.lerp(this.col[i + j] as number, _c.r * k, amount);
          this.col[i + j + 1] = THREE.MathUtils.lerp(this.col[i + j + 1] as number, _c.g * k, amount);
          this.col[i + j + 2] = THREE.MathUtils.lerp(this.col[i + j + 2] as number, _c.b * k, amount);
        }
      }
    }
    return this;
  }

  /** Displaces every vertex by deterministic noise (same position -> same offset, so no cracks). */
  crumple(amount: number): this {
    const p = this.pos;
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i] as number;
      const y = p[i + 1] as number;
      const z = p[i + 2] as number;
      const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
      const f = h - Math.floor(h);
      const k = 1 + (f - 0.5) * 2 * amount;
      p[i] = x * k;
      p[i + 1] = y * k;
      p[i + 2] = z * k;
    }
    return this;
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (this.hasAnim || this.forceAnim) g.setAttribute('aAnim', new THREE.Float32BufferAttribute(this.anim, 2));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

/** Camera and hero positions for the see-through effect of the prop material, plus wind and detail texture. */
export const propUniforms = {
  uCam: { value: new THREE.Vector3() },
  uHero: { value: new THREE.Vector3() },
  uTime: { value: 0 },
  uDetail: { value: null as THREE.Texture | null },
};

/** Adds an `aWind` attribute that grows with height (for grass, ferns and other code-built plants). */
export function windByHeight(geo: THREE.BufferGeometry, top: number, strength = 1): THREE.BufferGeometry {
  const pos = geo.getAttribute('position');
  const w = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) w[i] = Math.min(1, Math.max(0, pos.getY(i) / top)) * strength;
  geo.setAttribute('aWind', new THREE.BufferAttribute(w, 1));
  return geo;
}

/**
 * Points every normal mostly upwards. Thin blades and leaves are then lit like the ground they grow from,
 * instead of going black whenever a face happens to look away from the low sun.
 */
export function normalsUp(geo: THREE.BufferGeometry, keep = 0.25): THREE.BufferGeometry {
  const n = geo.getAttribute('normal');
  const v = new THREE.Vector3();
  for (let i = 0; i < n.count; i++) {
    v.fromBufferAttribute(n, i).multiplyScalar(keep);
    v.y = 1;
    v.normalize();
    n.setXYZ(i, v.x, v.y, v.z);
  }
  n.needsUpdate = true;
  return geo;
}

/**
 * Shared flat-shaded vertex-colour material for scenery (trees, rocks, shrines, undergrowth).
 * - Anything standing between the camera and the hero is dissolved with a dither pattern,
 *   so trees never hide the fight.
 * - Vertices with an `aWind` weight sway in the wind (weights come from the Blender build or windByHeight).
 * - A faint painterly detail texture breaks up the flat faces.
 */
export const propMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
propMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uCam = propUniforms.uCam;
  shader.uniforms.uHero = propUniforms.uHero;
  shader.uniforms.uTime = propUniforms.uTime;
  shader.uniforms.uDetail = propUniforms.uDetail;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vMbWorld;\nattribute float aWind;\nuniform float uTime;')
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
#ifdef USE_INSTANCING
{
  // Every instance sways with its own phase; higher and thinner parts move more (aWind).
  vec3 mbO = vec3(instanceMatrix[3]);
  float mbP = mbO.x * 0.31 + mbO.z * 0.27;
  float mbS = sin(uTime * 1.15 + mbP + transformed.y * 0.22) * 0.16 + sin(uTime * 2.9 + mbP * 1.7 + transformed.y * 0.9 + transformed.x) * 0.045;
  transformed.x += mbS * aWind;
  transformed.z += mbS * 0.6 * aWind;
}
#endif`,
    )
    .replace(
      '#include <project_vertex>',
      `#include <project_vertex>
vec4 mbWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
mbWorld = instanceMatrix * mbWorld;
#endif
vMbWorld = (modelMatrix * mbWorld).xyz;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vMbWorld;\nuniform vec3 uCam;\nuniform vec3 uHero;\nuniform sampler2D uDetail;')
    .replace(
      '#include <clipping_planes_fragment>',
      `#include <clipping_planes_fragment>
{
  vec3 mbAB = uHero - uCam;
  vec3 mbAP = vMbWorld - uCam;
  float mbT = clamp(dot(mbAP, mbAB) / dot(mbAB, mbAB), 0.0, 1.0);
  if (mbT < 0.9) {
    float mbD = length(mbAP - mbAB * mbT);
    float mbR = mix(3.4, 1.7, mbT);
    float mbA = smoothstep(mbR * 0.5, mbR, mbD);
    float mbN = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    if (mbA < mbN) discard;
  }
}`,
    )
    .replace(
      '#include <color_fragment>',
      `#include <color_fragment>
{
  // Brush-stroke detail projected along a skewed axis so it shows on walls and tops alike.
  vec2 mbUv = vMbWorld.xz * 0.37 + vMbWorld.y * vec2(0.23, 0.31);
  float mbDt = texture2D(uDetail, mbUv).r;
  diffuseColor.rgb *= 0.62 + mbDt * 0.76;
}`,
    )
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
// A trace of self-illumination: trunks and stones never sink into pure black at night.
totalEmissiveRadiance += diffuseColor.rgb * 0.1;`,
    );
};
propMaterial.customProgramCacheKey = () => 'mb-prop3';

/** Writes a TRS (yaw-only rotation) matrix straight into an instanceMatrix array. */
export function writeMatrix(
  arr: Float32Array | ArrayLike<number>,
  index: number,
  x: number,
  y: number,
  z: number,
  yaw: number,
  sx: number,
  sy: number,
  sz: number,
  tilt = 0,
): void {
  const a = arr as Float32Array;
  const o = index * 16;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  if (tilt === 0) {
    a[o] = c * sx;
    a[o + 1] = 0;
    a[o + 2] = -s * sx;
    a[o + 4] = 0;
    a[o + 5] = sy;
    a[o + 6] = 0;
    a[o + 8] = s * sz;
    a[o + 9] = 0;
    a[o + 10] = c * sz;
  } else {
    // R = Ry(yaw) * Rx(tilt): lean forward/back along the facing direction.
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    a[o] = c * sx;
    a[o + 1] = 0;
    a[o + 2] = -s * sx;
    a[o + 4] = s * st * sy;
    a[o + 5] = ct * sy;
    a[o + 6] = c * st * sy;
    a[o + 8] = s * ct * sz;
    a[o + 9] = -st * sz;
    a[o + 10] = c * ct * sz;
  }
  a[o + 3] = 0;
  a[o + 7] = 0;
  a[o + 11] = 0;
  a[o + 12] = x;
  a[o + 13] = y;
  a[o + 14] = z;
  a[o + 15] = 1;
}
