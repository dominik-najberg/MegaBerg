import * as THREE from 'three';
import { clamp, damp } from '../core/math';
import type { World } from '../sim/world';
import type { GameMap } from '../sim/terrain';
import { HeroView } from './hero';
import { makeGlowTexture, PropsView } from './props';
import { Sky } from './sky';
import { TerrainView } from './terrainView';

/** 0 = low, 1 = medium, 2 = high. */
export type Quality = 0 | 1 | 2;

/** Owns the Three.js renderer, scene and camera and draws a World. */
export class Gfx {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(62, 1, 0.3, 700);
  readonly sky: Sky;
  readonly terrain: TerrainView;
  readonly props: PropsView;
  readonly hero: HeroView;
  readonly glowTex: THREE.Texture;
  private readonly heroLight: THREE.PointLight;
  private readonly focus = new THREE.Vector3();
  private focusInit = false;
  camYaw = 0;
  camPitch = 0.4;
  camDist = 9;
  shake = 0;
  private clock = 0;
  quality: Quality;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly map: GameMap,
    quality: Quality,
  ) {
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality > 0, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.glowTex = makeGlowTexture();
    this.sky = new Sky(this.scene);
    this.terrain = new TerrainView(map);
    this.scene.add(this.terrain.group);
    this.props = new PropsView(map, quality);
    this.scene.add(this.props.group);
    this.hero = new HeroView(this.glowTex);
    this.scene.add(this.hero.group);
    this.heroLight = new THREE.PointLight(0xffc890, 6, 16, 1.5);
    this.scene.add(this.heroLight);

    this.applyQuality(quality);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  applyQuality(q: Quality): void {
    this.quality = q;
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(q === 0 ? Math.min(dpr, 1) : q === 1 ? Math.min(dpr, 1.5) : Math.min(dpr, 2));
    this.renderer.shadowMap.enabled = q > 0;
    this.sky.sun.castShadow = q > 0;
    this.sky.sun.shadow.mapSize.setScalar(q === 2 ? 2048 : 1024);
    this.sky.sun.shadow.map?.dispose();
    this.sky.sun.shadow.map = null;
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) m.needsUpdate = true;
    });
    this.resize();
  }

  resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  rotateCamera(dYaw: number, dPitch: number): void {
    this.camYaw += dYaw;
    this.camPitch = clamp(this.camPitch + dPitch, 0.08, 1.25);
  }

  render(world: World, alpha: number, frameDt: number): void {
    this.clock += frameDt;
    const p = world.player;
    this.hero.update(p, alpha, frameDt, this.clock);
    const hp = this.hero.group.position;
    this.hero.setGround(this.map.heightAt(hp.x, hp.z));

    // Camera: orbit behind/above the hero, smoothed focus point, kept above the terrain.
    if (!this.focusInit) {
      this.focus.set(hp.x, hp.y + 1.7, hp.z);
      this.focusInit = true;
    }
    this.focus.x = damp(this.focus.x, hp.x, 22, frameDt);
    this.focus.z = damp(this.focus.z, hp.z, 22, frameDt);
    this.focus.y = damp(this.focus.y, hp.y + 1.7, 9, frameDt);
    const cp = Math.cos(this.camPitch);
    const cx = this.focus.x + Math.sin(this.camYaw) * cp * this.camDist;
    const cz = this.focus.z + Math.cos(this.camYaw) * cp * this.camDist;
    let cy = this.focus.y + Math.sin(this.camPitch) * this.camDist;
    const minY = this.map.heightAt(cx, cz) + 0.8;
    if (cy < minY) cy = minY;
    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.focus.x, this.focus.y + 0.6, this.focus.z);
    if (this.shake > 0.001) {
      const s = this.shake * 0.35;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.rotation.z += (Math.random() - 0.5) * s * 0.04;
      this.shake = damp(this.shake, 0, 9, frameDt);
    }

    this.sky.setTime(world.dayTime(), this.clock);
    this.sky.follow(this.camera.position, Math.round(hp.x / 2) * 2, 0, Math.round(hp.z / 2) * 2);
    this.terrain.setNight(this.sky.night);
    this.props.update(this.clock, hp.x, hp.z);
    this.heroLight.position.set(hp.x, hp.y + 2.6, hp.z);
    this.heroLight.intensity = 5 + this.sky.night * 9;

    this.renderer.render(this.scene, this.camera);
  }
}
