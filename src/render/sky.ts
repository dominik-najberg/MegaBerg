import * as THREE from 'three';
import { clamp } from '../core/math';
import { tex } from './assets';

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
uniform sampler2D uMoonTex;
varying vec3 vDir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise3(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y);
  float b = mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y);
  return mix(a, b, f.z);
}
float fbm3(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += noise3(p) * a;
    p = p * 2.03 + vec3(17.3, 9.1, 4.7);
    a *= 0.5;
  }
  return s / 0.9375;
}
/** Cloud density in a direction of the sky: big heaps, wider than tall, with smaller billows riding on them. */
float clouds(vec3 p) {
  float big = fbm3(p);
  float small = fbm3(p * 3.1 + big * 1.6);
  return big * 0.7 + small * 0.3;
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, h));
  col = mix(col, uTop, smoothstep(0.16, 0.7, h));

  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * (pow(sd, 5.0) * 0.45 + pow(sd, 90.0) * 0.9);

  // Heaped clouds drifting over the forest, sampled by direction, so they have no seam and keep their
  // size down to the horizon. The side of every heap that faces the sun or the moon is lit, the rest stays dark.
  vec3 lightDir = normalize(mix(uSunDir, uMoonDir, uNight));
  vec3 cp = vec3(d.x, d.y * 2.4, d.z) * 2.6 + vec3(uTime * 0.004, 0.0, uTime * 0.0015);
  float dens = clouds(cp);
  float lit = clamp((dens - clouds(cp + lightDir * 0.22)) * 3.2 + 0.25, 0.0, 1.0);
  float cloud = smoothstep(0.47, 0.58, dens) * smoothstep(0.0, 0.07, h);
  float thick = smoothstep(0.5, 0.75, dens);
  float ld = max(dot(d, lightDir), 0.0);
  float near = pow(ld, 3.0);
  vec3 dayBody = mix(uTop, uMid, 0.3) * 0.95;
  vec3 dayRim = uHorizon * 1.25 + uSunCol * 0.45;
  vec3 nightBody = mix(uMid, vec3(0.17, 0.11, 0.32), 0.7) * 0.8;
  vec3 nightRim = vec3(0.36, 0.29, 0.62);
  vec3 body = mix(dayBody, nightBody, uNight);
  vec3 rim = mix(dayRim, nightRim, uNight);
  vec3 cloudCol = mix(body * (1.0 - thick * 0.3), rim, lit * (0.35 + near * 0.65));
  // Silver lining where a cloud passes close to the light.
  cloudCol += rim * pow(ld, 24.0) * (1.0 - thick) * 0.6;
  // A hole in the clouds around the moon keeps it in the clear.
  cloud *= 1.0 - uNight * 0.8 * smoothstep(0.972, 0.996, dot(d, uMoonDir));
  col = mix(col, cloudCol, cloud * 0.9);

  // Stars.
  vec2 suv = vec2(atan(d.z, d.x) * 40.0, h * 70.0);
  vec2 g = floor(suv);
  float r = hash(g);
  float star = step(0.972, r) * smoothstep(0.2, 0.0, length((fract(suv) - 0.5) * vec2(1.0, 0.6)));
  col += vec3(0.9, 0.92, 1.0) * star * uNight * (0.55 + 0.45 * sin(uTime * 2.0 + r * 90.0)) * smoothstep(0.06, 0.3, h) * (1.0 - cloud);

  // Moon: a painted disc with a soft halo, rising as the night deepens.
  float md = max(dot(d, uMoonDir), 0.0);
  vec3 mr = normalize(cross(vec3(0.0, 1.0, 0.0), uMoonDir));
  vec3 mu = cross(uMoonDir, mr);
  vec2 muv = vec2(dot(d, mr), dot(d, mu)) / 0.075;
  float disc = (1.0 - smoothstep(0.92, 1.0, length(muv))) * step(0.0, dot(d, uMoonDir));
  vec3 moonCol = texture2D(uMoonTex, muv * 0.4 + 0.5).rgb;
  col = mix(col, moonCol * 1.25, disc * uNight * (1.0 - cloud * 0.7));
  col += vec3(0.32, 0.4, 0.62) * (pow(md, 60.0) * 0.5 + pow(md, 600.0) * 0.5) * uNight * (1.0 - disc);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
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
  { top: 0x3a2a6e, mid: 0x9a4a7c, horizon: 0xf2874a, fog: 0x6b5686, hemiSky: 0x9f8ad6, hemiGround: 0x6a4a36, hemiInt: 1.55, sun: 0xffa868, sunInt: 2.3, fogDensity: 0.013 },
  // twilight
  { top: 0x201c4e, mid: 0x54376f, horizon: 0xa8506a, fog: 0x45386a, hemiSky: 0x7a70c8, hemiGround: 0x4a3a40, hemiInt: 1.45, sun: 0xd08a9a, sunInt: 1.2, fogDensity: 0.0155 },
  // night
  { top: 0x080c22, mid: 0x131c40, horizon: 0x243056, fog: 0x1a2142, hemiSky: 0x6880d0, hemiGround: 0x34344e, hemiInt: 1.6, sun: 0x9fbcff, sunInt: 1.5, fogDensity: 0.016 },
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
  /** Unit vector towards the light that currently lights the scene (low sun, later the moon). */
  readonly lightDir = new THREE.Vector3(0, 1, 0);
  /** Colour of the sky a little above the horizon: what still water reflects. */
  readonly reflect = new THREE.Color();

  constructor(scene: THREE.Scene) {
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uMid: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
        uSunCol: { value: new THREE.Color() },
        // Low over the treetops, where the third-person camera actually sees it.
        uMoonDir: { value: new THREE.Vector3(0.5, 0.26, 0.6).normalize() },
        uNight: { value: 0 },
        uTime: { value: 0 },
        uMoonTex: { value: tex('moon') },
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
    // Shadows under the canopy stay readable: the fight must be visible in the thickest woods.
    this.sun.shadow.intensity = 0.72;
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
    // The light itself comes from higher up than the painted moon: long shadows would hide the fight.
    const ly = THREE.MathUtils.lerp(0.42, moon.y + 0.45, k);
    const lz = THREE.MathUtils.lerp(-0.8, moon.z, k);
    const l = Math.hypot(lx, ly, lz);
    this.lightDir.set(lx / l, ly / l, lz / l);
    this.reflect.copy(u.uMid!.value as THREE.Color).lerp(u.uHorizon!.value as THREE.Color, 0.45);
    this.sun.position.set(px + (lx / l) * 90, py + (ly / l) * 90, pz + (lz / l) * 90);
    this.sun.target.position.set(px, py, pz);
  }
}
