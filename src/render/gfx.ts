import * as THREE from 'three';
import { clamp, damp } from '../core/math';
import type { World } from '../sim/world';
import type { GameMap } from '../sim/terrain';
import { EnemiesView } from './enemiesView';
import { FxView } from './fxView';
import { HeroView } from './hero';
import { Overlay } from './overlay';
import { Post } from './post';
import { propUniforms } from './geo';
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
  readonly enemies: EnemiesView;
  readonly fx: FxView;
  readonly overlay: Overlay;
  readonly glowTex: THREE.Texture;
  shakeEnabled = true;
  /** Extra slow orbit used behind the menus. */
  menuOrbit = false;
  private readonly heroLight: THREE.PointLight;
  private readonly focus = new THREE.Vector3();
  private focusInit = false;
  camYaw = 0;
  camPitch = 0.36;
  camDist = 9;
  shake = 0;
  private clock = 0;
  private distExtra = 0;
  private ghostAcc = 0;
  /** Bloom + grade pipeline; null on low quality (plain forward rendering). */
  private post: Post | null = null;
  quality: Quality;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    private readonly map: GameMap,
    quality: Quality,
  ) {
    this.quality = quality;
    // Anti-aliasing comes from the multisampled HDR target of the post pipeline, not from the canvas.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
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
    this.enemies = new EnemiesView();
    this.scene.add(this.enemies.group);
    this.overlay = new Overlay(overlayCanvas);
    this.fx = new FxView(map, this.overlay, this.glowTex);
    this.scene.add(this.fx.group);

    this.applyQuality(quality);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  applyQuality(q: Quality): void {
    this.quality = q;
    this.renderer.shadowMap.enabled = q > 0;
    this.sky.sun.castShadow = q > 0;
    this.sky.sun.shadow.mapSize.setScalar(q === 2 ? 2048 : 1024);
    this.sky.sun.shadow.map?.dispose();
    this.sky.sun.shadow.map = null;
    this.enemies.setShadows(q > 0);
    this.props.setQuality(q);
    this.fx.setDensity(q === 0 ? 0.5 : q === 1 ? 0.8 : 1);
    this.post?.dispose();
    this.post = q > 0 ? new Post(this.renderer, this.scene, this.camera, q === 2 ? 4 : 2) : null;
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) m.needsUpdate = true;
    });
    this.resize();
  }

  resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    // Internal resolution: the device pixel ratio, capped per quality level and by a pixel budget.
    // The HDR + MSAA + bloom pipeline is fill-rate bound, and a 4K panel has four times the pixels of 1080p.
    const q = this.quality;
    const dpr = window.devicePixelRatio || 1;
    const cap = q === 0 ? 1 : q === 1 ? 1.5 : 2;
    const budget = q === 0 ? 2.1e6 : q === 1 ? 2.3e6 : 3.2e6;
    this.renderer.setPixelRatio(Math.max(0.5, Math.min(dpr, cap, Math.sqrt(budget / Math.max(1, w * h)))));
    this.renderer.setSize(w, h, false);
    this.post?.setSize(w, h, this.renderer.getPixelRatio());
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.fx.setViewport(h, this.camera.fov);
  }

  rotateCamera(dYaw: number, dPitch: number): void {
    this.camYaw += dYaw;
    this.camPitch = clamp(this.camPitch + dPitch, 0.08, 1.25);
  }

  /** Call when a new run starts: drops per-run visuals and snaps the camera. */
  resetRun(): void {
    this.fx.reset();
    this.overlay.clear();
    this.focusInit = false;
    this.shake = 0;
  }

  render(world: World, alpha: number, frameDt: number): void {
    this.clock += frameDt;
    const p = world.player;
    if (this.menuOrbit) this.camYaw += frameDt * 0.06;
    this.hero.group.visible = !world.dead;
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
    // Pull the camera back while a boss is alive so the whole fight stays in frame.
    const bi = world.bossIdx;
    const bossR = bi >= 0 && world.enemies.alive[bi] ? (world.enemies.radius[bi] as number) : 0;
    this.distExtra = damp(this.distExtra, bossR > 2 ? 6 : bossR > 0 ? 2.5 : 0, 2, frameDt);
    const dist = this.camDist + this.distExtra;
    const pitch = this.camPitch + this.distExtra * 0.012;
    const cp = Math.cos(pitch);
    const cx = this.focus.x + Math.sin(this.camYaw) * cp * dist;
    const cz = this.focus.z + Math.cos(this.camYaw) * cp * dist;
    let cy = this.focus.y + Math.sin(pitch) * dist;
    const minY = this.map.heightAt(cx, cz) + 0.8;
    if (cy < minY) cy = minY;
    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.focus.x, this.focus.y + 0.6, this.focus.z);
    if (this.fx.shake > this.shake) this.shake = this.fx.shake;
    this.fx.shake = 0;
    if (!this.shakeEnabled) this.shake = 0;
    if (this.shake > 0.001) {
      const s = this.shake * 0.35;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.rotation.z += (Math.random() - 0.5) * s * 0.04;
      this.shake = damp(this.shake, 0, 9, frameDt);
    }

    propUniforms.uCam.value.copy(this.camera.position);
    propUniforms.uHero.value.set(hp.x, hp.y + 1.2, hp.z);

    this.sky.setTime(world.dayTime(), this.clock);
    this.sky.follow(this.camera.position, Math.round(hp.x / 2) * 2, 0, Math.round(hp.z / 2) * 2);
    this.terrain.update(this.clock, this.sky.night, this.sky.reflect, this.sky.lightDir, this.sky.sun.color);
    this.props.update(this.clock, hp.x, hp.z);
    this.heroLight.position.set(hp.x, hp.y + 2.6, hp.z);
    this.heroLight.intensity = 5 + this.sky.night * 9;

    for (let i = 0; i < world.shrines.length; i++) this.props.setShrineUsed(i, (world.shrines[i] as { used: boolean }).used);
    this.enemies.update(world, alpha, this.clock);
    this.fx.camYaw = this.camYaw;
    this.fx.setFogColor(this.sky.fog.color);
    if (p.dashT > 0 && frameDt > 0.002) {
      this.ghostAcc += frameDt;
      if (this.ghostAcc > 0.045) {
        this.ghostAcc = 0;
        this.fx.addGhost(this.hero.group);
      }
    }
    this.fx.update(world, alpha, frameDt, this.sky.night);

    if (this.post) this.post.render(frameDt, this.clock, this.sky.night, this.renderer.toneMappingExposure);
    else this.renderer.render(this.scene, this.camera);
    this.overlay.draw(this.camera, frameDt);
  }
}
