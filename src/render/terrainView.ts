import * as THREE from 'three';
import { fbm, hash2, smoothstep } from '../core/math';
import { GRID_CELL, GRID_N, MAP_HALF, PLAY_RADIUS, type GameMap } from '../sim/terrain';
import { tex } from './assets';

const NIGHT_WATER = new THREE.Color(0x0a1626);
const DUSK_WATER = new THREE.Color(0x1d3040);

const WATER_VERT = /* glsl */ `
attribute float aEdge;
varying float vEdge;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vEdge = aEdge;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const WATER_FRAG = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uSky;
uniform vec3 uLightDir;
uniform vec3 uLightCol;
uniform float uTime;
uniform sampler2D uNoise;
varying float vEdge;
varying vec3 vWorld;
#include <common>
#include <fog_pars_fragment>
void main() {
  // Two scrolling noise layers make a cheap, soft ripple normal.
  vec2 p = vWorld.xz;
  vec2 a = texture2D(uNoise, p * 0.11 + vec2(uTime * 0.012, uTime * 0.008)).rg;
  vec2 b = texture2D(uNoise, p * 0.23 - vec2(uTime * 0.01, -uTime * 0.014)).gb;
  vec2 rip = (a + b - 1.0) * 0.55;
  vec3 n = normalize(vec3(rip.x, 1.0, rip.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 col = mix(uDeep, uSky * 0.8, 0.12 + fres * 0.55);
  // Glitter of the low sun / the moon.
  vec3 h = normalize(uLightDir + v);
  float spec = pow(max(dot(n, h), 0.0), 180.0);
  col += uLightCol * spec * 2.2;
  // Soft shore: the rim fades into the mud, with a pale foam line just inside it.
  float shore = smoothstep(1.0, 0.72, vEdge);
  col += vec3(0.16, 0.2, 0.2) * smoothstep(0.62, 0.9, vEdge) * (0.5 + 0.5 * sin(uTime * 1.3 + vEdge * 40.0 + p.x)) * 0.35;
  gl_FragColor = vec4(col, shore * 0.9);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

/**
 * Terrain: one smooth-shaded mesh textured by splatting hand-painted ground textures
 * (grass / moss, forest floor, trail dirt, swamp mud, rock) with per-vertex weights,
 * plus the water of the swamp pools and the lake.
 */
export class TerrainView {
  readonly group = new THREE.Group();
  private readonly water: THREE.ShaderMaterial;

  constructor(map: GameMap) {
    const N = GRID_N;
    const count = N * N;
    const pos = new Float32Array(count * 3);
    const tint = new Float32Array(count * 3);
    const splat = new Float32Array(count * 4);
    const moss = new Float32Array(count);
    const h = map.heights;

    // How wooded each grid point is: trees shade out the grass and leave needles and moss.
    const woods = new Float32Array(count);
    const shade = new Float32Array(count);
    for (const o of map.obstacles) {
      const tree = o.kind === 'pine' || o.kind === 'oak' || o.kind === 'birch' || o.kind === 'ancientOak';
      const stone = o.kind === 'rock' || o.kind === 'menhir';
      if (!tree && !stone) continue;
      const R = tree ? (o.kind === 'ancientOak' ? 11 : 5.5 * o.scale) : 2.4 * o.scale;
      const i0 = Math.max(0, Math.floor((o.x - R + MAP_HALF) / GRID_CELL));
      const i1 = Math.min(N - 1, Math.ceil((o.x + R + MAP_HALF) / GRID_CELL));
      const j0 = Math.max(0, Math.floor((o.z - R + MAP_HALF) / GRID_CELL));
      const j1 = Math.min(N - 1, Math.ceil((o.z + R + MAP_HALF) / GRID_CELL));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const d = Math.hypot(-MAP_HALF + i * GRID_CELL - o.x, -MAP_HALF + j * GRID_CELL - o.z);
          const k = 1 - smoothstep(R * 0.25, R, d);
          const idx = j * N + i;
          if (tree) woods[idx] = Math.min(1, (woods[idx] as number) + k * 0.75);
          // Contact shadow: the ground right at the foot of a trunk or a boulder is darker.
          const c = 1 - smoothstep(o.r * 0.8, o.r * 2.4 + 1.2, d);
          if (c > (shade[idx] as number)) shade[idx] = c;
        }
      }
    }

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const k = j * N + i;
        const x = -MAP_HALF + i * GRID_CELL;
        const z = -MAP_HALF + j * GRID_CELL;
        const y = h[k] as number;
        pos[k * 3] = x;
        pos[k * 3 + 1] = y;
        pos[k * 3 + 2] = z;
        const d = Math.hypot(x, z);
        const hl = h[k - (i > 0 ? 1 : 0)] as number;
        const hr = h[k + (i < N - 1 ? 1 : 0)] as number;
        const hu = h[k - (j > 0 ? N : 0)] as number;
        const hd = h[k + (j < N - 1 ? N : 0)] as number;
        const slope = Math.hypot(hr - hl, hd - hu) / (GRID_CELL * 2);

        const n = fbm(x / 9 + 5.5, z / 9 + 1.5, 3);
        const g = fbm(x / 17 + 60, z / 17 + 20, 2);
        const wild = smoothstep(PLAY_RADIUS - 6, PLAY_RADIUS + 10, d);
        let dirt = smoothstep(0.6, 0.72, n) * 0.6;
        dirt = Math.max(dirt, (1 - smoothstep(3, 9, d)) * 0.95);
        dirt = Math.max(dirt, map.pathAt(x, z));
        let mud = 0;
        for (const p of map.puddles) {
          const pd = Math.hypot(p.x - x, p.z - z);
          mud = Math.max(mud, 1 - smoothstep(p.r * 0.85, p.r * 1.75, pd));
        }
        const rock = smoothstep(0.42, 0.8, slope) * (1 - wild);
        const forest = Math.max(woods[k] as number, wild);
        splat[k * 4] = forest;
        splat[k * 4 + 1] = dirt * (1 - mud);
        splat[k * 4 + 2] = mud;
        splat[k * 4 + 3] = rock;
        moss[k] = smoothstep(0.52, 0.7, fbm(x / 23 + 14.2, z / 23 + 51.7, 2)) * (1 - forest * 0.6);

        // Macro tint: slow brightness / warmth drift, darker towards the wild rim and at the foot of things.
        let v = 0.86 + g * 0.28;
        v *= 1 - (shade[k] as number) * 0.42;
        v *= 1 - wild * 0.45;
        const warm = (n - 0.5) * 0.12;
        const r = hash2(i * 7 + 3, j * 13 + 5) * 0.04;
        tint[k * 3] = v * (1 + warm) + r;
        tint[k * 3 + 1] = v + r;
        tint[k * 3 + 2] = v * (1 - warm) + r;
      }
    }

    // Two triangles per cell, split along the same diagonal GameMap.heightAt uses (u + v <= 1).
    const cells = N - 1;
    const index = new Uint32Array(cells * cells * 6);
    let o = 0;
    for (let j = 0; j < cells; j++) {
      for (let i = 0; i < cells; i++) {
        const a = j * N + i;
        index[o++] = a;
        index[o++] = a + N;
        index[o++] = a + 1;
        index[o++] = a + 1;
        index[o++] = a + N;
        index[o++] = a + N + 1;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(tint, 3));
    geo.setAttribute('aSplat', new THREE.BufferAttribute(splat, 4));
    geo.setAttribute('aMoss', new THREE.BufferAttribute(moss, 1));
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const uniforms = {
      uGrass: { value: tex('grass') },
      uMoss: { value: tex('moss') },
      uForest: { value: tex('forest') },
      uDirt: { value: tex('dirt') },
      uMud: { value: tex('mud') },
      uRock: { value: tex('rock') },
      uNoise: { value: tex('noise') },
    };
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec4 aSplat;\nattribute float aMoss;\nvarying vec4 vSplat;\nvarying float vMoss;\nvarying vec2 vGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSplat = aSplat;\nvMoss = aMoss;\nvGround = position.xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
uniform sampler2D uGrass;
uniform sampler2D uMoss;
uniform sampler2D uForest;
uniform sampler2D uDirt;
uniform sampler2D uMud;
uniform sampler2D uRock;
uniform sampler2D uNoise;
varying vec4 vSplat;
varying float vMoss;
varying vec2 vGround;
// Sharpens a soft per-vertex weight with noise so borders between materials look torn, not airbrushed.
float mbEdge(float w, float n, float soft) {
  return smoothstep(0.5 - soft, 0.5 + soft, w + (n - 0.5) * 0.7);
}`,
        )
        .replace(
          '#include <map_fragment>',
          `{
  vec2 gp = vGround;
  vec3 nz = texture2D(uNoise, gp / 37.0).rgb;
  vec3 nz2 = texture2D(uNoise, gp / 9.0 + 0.31).rgb;
  // Each layer is sampled at two unrelated scales and mixed by slow noise: no visible tiling grid.
  vec2 uvA = gp / 5.5;
  vec2 uvB = vec2(gp.y, -gp.x) / 14.0 + 0.43;
  float mixAB = smoothstep(0.3, 0.7, nz.b);
  vec3 grass = mix(texture2D(uGrass, uvA).rgb, texture2D(uGrass, uvB).rgb, mixAB * 0.6);
  grass *= vec3(1.25, 0.92, 0.78);
  vec3 moss = mix(texture2D(uMoss, uvA * 0.8).rgb, texture2D(uMoss, uvB).rgb, mixAB * 0.5) * vec3(0.92, 0.82, 0.7);
  vec3 forest = mix(texture2D(uForest, uvA * 0.9).rgb, texture2D(uForest, uvB * 1.3).rgb, mixAB * 0.5) * 0.9;
  vec3 dirt = texture2D(uDirt, gp / 6.5).rgb;
  dirt = mix(vec3(dot(dirt, vec3(0.3, 0.5, 0.2))), dirt, 0.32) * vec3(0.56, 0.56, 0.52);
  vec3 mud = texture2D(uMud, gp / 6.0).rgb * 0.85;
  vec3 rock = texture2D(uRock, gp / 8.0).rgb * 0.8;
  vec3 col = mix(grass, moss, mbEdge(vMoss, nz2.r, 0.22));
  col = mix(col, forest, mbEdge(vSplat.x, nz2.g, 0.3));
  col = mix(col, rock, mbEdge(vSplat.w, nz2.b, 0.2));
  col = mix(col, dirt, mbEdge(vSplat.y, nz2.r, 0.18));
  col = mix(col, mud, mbEdge(vSplat.z, nz2.g, 0.25));
  // Slow patches of lighter and darker ground.
  col *= 0.86 + nz.r * 0.3;
  diffuseColor.rgb *= col;
}`,
        );
    };
    mat.customProgramCacheKey = () => 'mb-terrain';
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.frustumCulled = false;
    this.group.add(mesh);

    this.water = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uDeep: { value: new THREE.Color(0x1d3040) },
          uSky: { value: new THREE.Color(0x9a4a7c) },
          uLightDir: { value: new THREE.Vector3(0, 1, 0) },
          uLightCol: { value: new THREE.Color(0xffffff) },
          uTime: { value: 0 },
          uNoise: { value: null },
        },
      ]),
    });
    (this.water.uniforms.uNoise as THREE.IUniform).value = tex('noise');
    for (const p of map.puddles) {
      const seg = p.r > 8 ? 28 : 14;
      const rings = 3;
      const verts: number[] = [0, 0, 0];
      const edge: number[] = [0];
      const idx: number[] = [];
      for (let r = 1; r <= rings; r++) {
        const f = r / rings;
        for (let s = 0; s < seg; s++) {
          const a = (s / seg) * Math.PI * 2;
          const k = p.r * 1.25 * (0.82 + hash2(s * 13 + Math.floor(p.x), Math.floor(p.z)) * 0.3) * f;
          verts.push(Math.cos(a) * k, 0, Math.sin(a) * k);
          edge.push(f);
        }
      }
      for (let s = 0; s < seg; s++) idx.push(0, 1 + ((s + 1) % seg), 1 + s);
      for (let r = 1; r < rings; r++) {
        const a0 = 1 + (r - 1) * seg;
        const b0 = 1 + r * seg;
        for (let s = 0; s < seg; s++) {
          const s1 = (s + 1) % seg;
          idx.push(a0 + s, a0 + s1, b0 + s, a0 + s1, b0 + s1, b0 + s);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('aEdge', new THREE.Float32BufferAttribute(edge, 1));
      g.setIndex(idx);
      const m = new THREE.Mesh(g, this.water);
      m.position.set(p.x, p.y, p.z);
      m.renderOrder = 1;
      this.group.add(m);
    }
  }

  /** Frees the GPU buffers of this terrain (a new run builds a new forest). Textures are shared and stay. */
  dispose(): void {
    const mats = new Set<THREE.Material>();
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      mats.add(m.material as THREE.Material);
    });
    for (const m of mats) m.dispose();
  }

  /** Per-frame water state: night darkens it, the sky colour and the light direction drive reflections. */
  update(time: number, night: number, sky: THREE.Color, lightDir: THREE.Vector3, lightCol: THREE.Color): void {
    const u = this.water.uniforms as Record<string, THREE.IUniform>;
    (u.uDeep!.value as THREE.Color).copy(DUSK_WATER).lerp(NIGHT_WATER, night);
    (u.uSky!.value as THREE.Color).copy(sky);
    (u.uLightDir!.value as THREE.Vector3).copy(lightDir);
    (u.uLightCol!.value as THREE.Color).copy(lightCol);
    u.uTime!.value = time;
  }
}
