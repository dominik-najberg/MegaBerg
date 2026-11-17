import * as THREE from 'three';

const VERT = /* glsl */ `
attribute float aSize;
attribute vec4 aColor;
varying vec4 vColor;
uniform float uScale;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
}`;

const FRAG = /* glsl */ `
varying vec4 vColor;
uniform float uSoft;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float a = mix(step(d, 1.0), smoothstep(1.0, 0.0, d), uSoft);
  if (a <= 0.01) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * a);
  #include <colorspace_fragment>
}`;

const _c = new THREE.Color();

/** Pooled CPU particle system rendered as one Points draw call. */
export class Particles {
  readonly points: THREE.Points;
  private readonly max: number;
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly size: Float32Array;
  private readonly vel: Float32Array;
  private readonly life: Float32Array;
  private readonly span: Float32Array;
  private readonly base: Float32Array;
  private readonly grav: Float32Array;
  private readonly drag: Float32Array;
  private readonly rgb: Float32Array;
  private cursor = 0;
  private readonly mat: THREE.ShaderMaterial;
  private readonly geo: THREE.BufferGeometry;
  /** 0..1: particle budget multiplier from the quality setting. */
  density = 1;

  constructor(max: number, additive: boolean, soft = 1) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 4);
    this.size = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.span = new Float32Array(max);
    this.base = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.rgb = new Float32Array(max * 3);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uScale: { value: 600 }, uSoft: { value: soft } },
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      toneMapped: false,
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  setScale(viewportHeight: number, fovDeg: number): void {
    (this.mat.uniforms.uScale as THREE.IUniform).value = viewportHeight / (2 * Math.tan((fovDeg * Math.PI) / 360));
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number, color: number, gravity = 0, drag = 0): void {
    const i = this.cursor;
    this.cursor = (i + 1) % this.max;
    const o = i * 3;
    this.pos[o] = x;
    this.pos[o + 1] = y;
    this.pos[o + 2] = z;
    this.vel[o] = vx;
    this.vel[o + 1] = vy;
    this.vel[o + 2] = vz;
    this.life[i] = life;
    this.span[i] = life;
    this.base[i] = size;
    this.grav[i] = gravity;
    this.drag[i] = drag;
    _c.set(color);
    this.rgb[o] = _c.r;
    this.rgb[o + 1] = _c.g;
    this.rgb[o + 2] = _c.b;
  }

  /** Radial burst. `up` biases velocities upwards. */
  burst(x: number, y: number, z: number, n: number, speed: number, life: number, size: number, color: number, gravity = 0, up = 0, drag = 2): void {
    const count = Math.max(1, Math.round(n * this.density));
    for (let k = 0; k < count; k++) {
      const a = Math.random() * 6.2832;
      const el = (Math.random() - 0.5) * 3.1416;
      const sp = speed * (0.35 + Math.random() * 0.65);
      const ce = Math.cos(el);
      this.emit(x, y, z, Math.cos(a) * ce * sp, Math.sin(el) * sp + up, Math.sin(a) * ce * sp, life * (0.6 + Math.random() * 0.4), size * (0.6 + Math.random() * 0.6), color, gravity, drag);
    }
  }

  update(dt: number): void {
    const { pos, vel, life, span, base, grav, drag, col, size, rgb } = this;
    for (let i = 0; i < this.max; i++) {
      const l = life[i] as number;
      if (l <= 0) {
        if (size[i] !== 0) size[i] = 0;
        continue;
      }
      const nl = l - dt;
      life[i] = nl;
      const o = i * 3;
      const dk = 1 - (drag[i] as number) * dt;
      vel[o] = (vel[o] as number) * dk;
      vel[o + 1] = ((vel[o + 1] as number) - (grav[i] as number) * dt) * dk;
      vel[o + 2] = (vel[o + 2] as number) * dk;
      pos[o] = (pos[o] as number) + (vel[o] as number) * dt;
      pos[o + 1] = (pos[o + 1] as number) + (vel[o + 1] as number) * dt;
      pos[o + 2] = (pos[o + 2] as number) + (vel[o + 2] as number) * dt;
      const f = nl > 0 ? nl / (span[i] as number) : 0;
      size[i] = (base[i] as number) * (0.4 + 0.6 * f);
      const c = i * 4;
      col[c] = rgb[o] as number;
      col[c + 1] = rgb[o + 1] as number;
      col[c + 2] = rgb[o + 2] as number;
      col[c + 3] = f < 0.5 ? f * 2 : 1;
    }
    (this.geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  }
}
