import * as THREE from 'three';
import { clamp } from '../core/math';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uMoonDir;
uniform float uNight;
uniform float uTime;
varying vec3 vDir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, h));
  col = mix(col, uTop, smoothstep(0.16, 0.7, h));

  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * (pow(sd, 5.0) * 0.45 + pow(sd, 90.0) * 0.9);

  // Streaky clouds lit from below by the sunset.
  vec2 cuv = vec2(atan(d.z, d.x) * 2.2, h * 9.0 - uTime * 0.004);
  float c = noise(cuv * vec2(1.0, 2.6)) * 0.6 + noise(cuv * vec2(2.3, 6.0) + 3.7) * 0.4;
  float cloud = smoothstep(0.52, 0.8, c) * smoothstep(0.02, 0.16, h) * (1.0 - smoothstep(0.35, 0.6, h));
  vec3 cloudCol = mix(uMid * 0.6, uHorizon * 1.25 + uSunCol * 0.25, pow(sd, 2.0) * 0.8 + 0.2);
  col = mix(col, cloudCol, cloud * 0.75);

  // Stars.
  vec2 suv = vec2(atan(d.z, d.x) * 40.0, h * 70.0);
  vec2 g = floor(suv);
  float r = hash(g);
  float star = step(0.975, r) * smoothstep(0.42, 0.0, length(fract(suv) - 0.5));
  col += vec3(0.9, 0.92, 1.0) * star * uNight * (0.55 + 0.45 * sin(uTime * 2.0 + r * 90.0)) * smoothstep(0.06, 0.3, h) * (1.0 - cloud);

  // Moon.
  float md = max(dot(d, uMoonDir), 0.0);
  float moon = smoothstep(0.9988, 0.9992, md);
  col += (vec3(0.95, 0.95, 0.85) * moon + vec3(0.35, 0.42, 0.6) * pow(md, 40.0) * 0.5) * uNight;

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

interface Key {
  top: number;
  mid: number;
  horizon: number;
  fog: number;
  hemiSky: number;
  hemiGround: number;
  hemiInt: number;
  sun: number;
  sunInt: number;
  fogDensity: number;
}

const KEYS: Key[] = [
  // dusk
  { top: 0x3a2a6e, mid: 0x9a4a7c, horizon: 0xf2874a, fog: 0x6b5686, hemiSky: 0x9f8ad6, hemiGround: 0x6a4a36, hemiInt: 1.25, sun: 0xffa868, sunInt: 2.3, fogDensity: 0.013 },
  // twilight
  { top: 0x201c4e, mid: 0x54376f, horizon: 0xa8506a, fog: 0x45386a, hemiSky: 0x7a70c8, hemiGround: 0x4a3a40, hemiInt: 1.0, sun: 0xd08a9a, sunInt: 1.2, fogDensity: 0.0155 },
  // night
  { top: 0x080c22, mid: 0x131c40, horizon: 0x243056, fog: 0x1a2142, hemiSky: 0x5870c0, hemiGround: 0x2a2a44, hemiInt: 0.85, sun: 0x8fb0ff, sunInt: 0.95, fogDensity: 0.017 },
];

const _a = new THREE.Color();
const _b = new THREE.Color();

function mixColor(out: THREE.Color, a: number, b: number, t: number): THREE.Color {
  _a.set(a);
  _b.set(b);
  return out.copy(_a).lerp(_b, t);
}

/** Sky dome + sun/moon light + hemisphere light + fog, driven by a 0..1 "time of day" (dusk -> night). */
export class Sky {
  readonly mesh: THREE.Mesh;
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly fog: THREE.FogExp2;
  private readonly mat: THREE.ShaderMaterial;
  private readonly sunDir = new THREE.Vector3();
  /** 0 at dusk, 1 at deep night. */
  night = 0;

  constructor(scene: THREE.Scene) {
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
      toneMapped: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uMid: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
        uSunCol: { value: new THREE.Color() },
        uMoonDir: { value: new THREE.Vector3(0.5, 0.55, 0.6).normalize() },
        uNight: { value: 0 },
        uTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), this.mat);
    this.mesh.scale.setScalar(450);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
    scene.add(this.mesh);

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -42;
    sc.right = 42;
    sc.top = 42;
    sc.bottom = -42;
    sc.near = 1;
    sc.far = 220;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.06;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.fog = new THREE.FogExp2(0x6b5686, 0.014);
    scene.fog = this.fog;
    this.setTime(0, 0);
  }

  /** t: 0 (dusk) .. 1 (night). */
  setTime(t: number, clock: number): void {
    t = clamp(t, 0, 1);
    const seg = t < 0.5 ? 0 : 1;
    const f = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    const a = KEYS[seg] as Key;
    const b = KEYS[seg + 1] as Key;
    const u = this.mat.uniforms as Record<string, THREE.IUniform>;
    mixColor(u.uTop!.value as THREE.Color, a.top, b.top, f);
    mixColor(u.uMid!.value as THREE.Color, a.mid, b.mid, f);
    mixColor(u.uHorizon!.value as THREE.Color, a.horizon, b.horizon, f);
    mixColor(this.fog.color, a.fog, b.fog, f);
    this.fog.density = a.fogDensity + (b.fogDensity - a.fogDensity) * f;
    mixColor(this.hemi.color, a.hemiSky, b.hemiSky, f);
    mixColor(this.hemi.groundColor, a.hemiGround, b.hemiGround, f);
    this.hemi.intensity = a.hemiInt + (b.hemiInt - a.hemiInt) * f;
    mixColor(this.sun.color, a.sun, b.sun, f);
    this.sun.intensity = a.sunInt + (b.sunInt - a.sunInt) * f;

    this.night = clamp((t - 0.35) / 0.5, 0, 1);
    u.uNight!.value = this.night;
    u.uTime!.value = clock;

    // Sun sinks below the horizon during the first half; afterwards the moon lights the scene.
    const sunElev = 0.2 - t * 0.55;
    this.sunDir.set(-0.55, sunElev, -0.8).normalize();
    (u.uSunDir!.value as THREE.Vector3).copy(this.sunDir);
    const glow = clamp(1 - t * 1.5, 0, 1);
    (u.uSunCol!.value as THREE.Color).set(0xff9a50).multiplyScalar(glow);
  }

  /** Keeps the dome and the shadow frustum centred on the player. */
  follow(cam: THREE.Vector3, px: number, py: number, pz: number): void {
    this.mesh.position.copy(cam);
    const u = this.mat.uniforms as Record<string, THREE.IUniform>;
    const moon = u.uMoonDir!.value as THREE.Vector3;
    // Light direction: low sun early, high moon late.
    const k = this.night;
    const lx = THREE.MathUtils.lerp(-0.55, moon.x, k);
    const ly = THREE.MathUtils.lerp(0.42, moon.y + 0.2, k);
    const lz = THREE.MathUtils.lerp(-0.8, moon.z, k);
    const l = Math.hypot(lx, ly, lz);
    this.sun.position.set(px + (lx / l) * 90, py + (ly / l) * 90, pz + (lz / l) * 90);
    this.sun.target.position.set(px, py, pz);
  }
}
