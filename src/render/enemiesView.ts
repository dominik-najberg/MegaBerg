import * as THREE from 'three';
import { ENEMIES } from '../data/enemies';
import type { EnemyDef } from '../data/types';
import { MAX_ENEMIES } from '../sim/pools';
import type { World } from '../sim/world';
import { buildEnemyModels, type EnemyModel } from './enemyModels';
import { writeMatrix } from './geo';

interface TypeView {
  mesh: THREE.InstancedMesh;
  fx: THREE.InstancedBufferAttribute;
  uniforms: { uTime: { value: number }; uCycle: { value: number } };
  model: EnemyModel;
  def: EnemyDef;
  count: number;
}

/**
 * Patches a Lambert material for instanced creatures:
 * limb swing / wing flap in the vertex shader, white hit flash, golden elite glow, frost tint.
 * aFx = (flash, elite, phase, slow).
 */
export function creatureMaterial(emissive: number, uniforms: { uTime: { value: number }; uCycle: { value: number } }): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uCycle = uniforms.uCycle;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute vec2 aAnim;
attribute vec4 aFx;
varying vec4 vFx;
uniform float uTime;
uniform float uCycle;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vFx = aFx;
float mbPhase = uTime * uCycle * (1.0 - aFx.w * 0.6) + aFx.z;
float mbS = sin(mbPhase);
transformed.z += aAnim.x * mbS;
transformed.y += aAnim.y * mbS;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec4 vFx;
uniform float uTime;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.85, 1.0), vFx.w * 0.6);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), vFx.x);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0) * vFx.x * 0.85;
totalEmissiveRadiance += vec3(1.0, 0.7, 0.15) * vFx.y * (0.3 + 0.2 * sin(uTime * 6.0));`,
      );
  };
  mat.customProgramCacheKey = () => 'mb-creature';
  return mat;
}

/** Draws every enemy with one InstancedMesh per enemy type. No per-frame allocations. */
export class EnemiesView {
  readonly group = new THREE.Group();
  private readonly views: TypeView[] = [];

  constructor() {
    const models = buildEnemyModels();
    for (const def of ENEMIES) {
      const model = models[def.id];
      if (!model) throw new Error(`No model for enemy ${def.id}`);
      const cap = def.rank ? 8 : MAX_ENEMIES;
      const uniforms = { uTime: { value: 0 }, uCycle: { value: model.cycle } };
      const mat = creatureMaterial(model.emissive, uniforms);
      const mesh = new THREE.InstancedMesh(model.geo, mat, cap);
      const fx = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
      fx.setUsage(THREE.DynamicDrawUsage);
      mesh.geometry.setAttribute('aFx', fx);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.count = 0;
      this.group.add(mesh);
      this.views.push({ mesh, fx, uniforms, model, def, count: 0 });
    }
  }

  setShadows(on: boolean): void {
    for (const v of this.views) v.mesh.castShadow = on;
  }

  update(world: World, alpha: number, time: number): void {
    const e = world.enemies;
    const views = this.views;
    for (let t = 0; t < views.length; t++) {
      const v = views[t] as TypeView;
      v.count = 0;
      v.uniforms.uTime.value = time;
    }
    for (let i = 0; i < e.n; i++) {
      if (!e.alive[i]) continue;
      const v = views[e.type[i] as number] as TypeView;
      const idx = v.count;
      if (idx >= v.mesh.instanceMatrix.count) continue;
      v.count++;
      const def = v.def;
      const px = e.px[i] as number;
      const pz = e.pz[i] as number;
      const x = px + ((e.x[i] as number) - px) * alpha;
      const z = pz + ((e.z[i] as number) - pz) * alpha;
      const yNow = (e.y[i] as number) + (e.oy[i] as number);
      let y = (e.py[i] as number) + (yNow - (e.py[i] as number)) * alpha;
      const elite = e.elite[i] as number;
      let s = def.scale * (elite ? 1.35 : 1);
      let sy = s;
      let tilt = def.flying ? 0.18 : 0.1;
      const state = e.state[i] as number;
      const moving = Math.abs((e.x[i] as number) - px) + Math.abs((e.z[i] as number) - pz) > 0.004;

      // Rise out of the ground / fade in while spawning.
      const sp = e.spawnT[i] as number;
      if (sp > 0) {
        const k = 1 - Math.min(1, sp / 0.5);
        y -= (1 - k) * def.height * 0.7 * (def.flying ? 0 : 1);
        s *= 0.35 + 0.65 * k;
        sy = s;
      }
      if (moving && v.model.hop > 0) y += Math.abs(Math.sin(time * v.model.cycle * 0.5 + i * 1.3)) * v.model.hop;

      switch (def.ai) {
        case 'kamikaze':
          if (state === 1) {
            const pulse = 1 + 0.3 * Math.sin(time * 34);
            s *= pulse;
            sy *= pulse;
          }
          break;
        case 'leaper':
          if (state === 1) {
            sy *= 0.68;
            s *= 1.12;
          } else if (state === 2) {
            sy *= 1.15;
            tilt = 0.5;
          }
          break;
        case 'charger':
          if (state === 1) tilt = -0.28;
          else if (state === 2) tilt = 0.32;
          break;
        case 'poludnica':
          if (state === 1) tilt = Math.sin(time * 25) * 0.25;
          else if (state === 3) tilt = 0.4;
          break;
        case 'leszy':
          if (state === 1) {
            const k = Math.min(1, (e.t2[i] as number) / 1.15);
            sy *= 1 + 0.1 * Math.sin(k * Math.PI);
            tilt = -0.12 * Math.sin(k * Math.PI);
          } else if (state === 2) tilt = -0.15;
          else if (state === 3) tilt = 0.25;
          break;
        case 'jaga':
          tilt = 0.12 + Math.sin(time * 1.7) * 0.08;
          break;
        default:
          break;
      }
      const flash = e.flash[i] as number;
      if (flash > 0.06) {
        s *= 1.07;
        sy *= 0.95;
      }
      writeMatrix(v.mesh.instanceMatrix.array, idx, x, y, z, e.yaw[i] as number, s, sy, s, tilt);
      const fa = v.fx.array as Float32Array;
      const o = idx * 4;
      fa[o] = flash > 0 ? Math.min(1, flash / 0.1) : 0;
      fa[o + 1] = elite;
      fa[o + 2] = i * 1.618;
      fa[o + 3] = (e.slowT[i] as number) > 0 ? Math.min(1, (e.slowK[i] as number) * 1.6) : 0;
    }
    for (let t = 0; t < views.length; t++) {
      const v = views[t] as TypeView;
      v.mesh.count = v.count;
      if (v.count > 0) {
        v.mesh.instanceMatrix.needsUpdate = true;
        v.fx.needsUpdate = true;
        // Only upload the used part of the buffers.
        v.mesh.instanceMatrix.clearUpdateRanges();
        v.mesh.instanceMatrix.addUpdateRange(0, v.count * 16);
        v.fx.clearUpdateRanges();
        v.fx.addUpdateRange(0, v.count * 4);
      }
    }
  }
}
