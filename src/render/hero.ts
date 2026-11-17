import * as THREE from 'three';
import { clamp, damp, lerp, TAU } from '../core/math';
import type { CharacterDef } from '../data/types';
import type { Player } from '../sim/player';
import { GeoBuilder } from './geo';

type Look = CharacterDef['look'];

const RED = 0xb3261e;
const LEATHER = 0x5a3a24;

/**
 * Articulated low-poly hero built from boxes. All animation is procedural:
 * run cycle from travelled distance, squash & stretch on jump/land, lean on dash.
 */
export class HeroView {
  readonly group = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly torso = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly legL = new THREE.Group();
  private readonly legR = new THREE.Group();
  private readonly mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  private readonly shadow: THREE.Mesh;
  private phase = 0;
  private jumpT = 1;
  private wasGround = true;
  private lean = 0;
  private amp = 0;

  constructor(blobTex: THREE.Texture) {
    this.group.add(this.body);
    this.body.add(this.torso, this.legL, this.legR);
    this.torso.add(this.armL, this.armR);
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: blobTex, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false }),
    );
    this.shadow.renderOrder = 2;
    this.group.add(this.shadow);
  }

  private part(parent: THREE.Group, b: GeoBuilder): void {
    const m = new THREE.Mesh(b.build(), this.mat);
    m.castShadow = true;
    parent.add(m);
  }

  private clear(g: THREE.Group): void {
    for (let i = g.children.length - 1; i >= 0; i--) {
      const c = g.children[i] as THREE.Object3D;
      if ((c as THREE.Mesh).isMesh) {
        (c as THREE.Mesh).geometry.dispose();
        g.remove(c);
      }
    }
  }

  setLook(look: Look): void {
    for (const g of [this.torso, this.armL, this.armR, this.legL, this.legR]) this.clear(g);
    const wide = look.style === 'bogumil' ? 1.18 : 1;
    this.body.scale.setScalar(look.build);
    this.torso.position.set(0, 0.85, 0);
    this.legL.position.set(0.14 * wide, 0.86, 0);
    this.legR.position.set(-0.14 * wide, 0.86, 0);
    this.armL.position.set(0.35 * wide, 0.6, 0);
    this.armR.position.set(-0.35 * wide, 0.6, 0);

    // --- legs
    for (const [leg, side] of [
      [this.legL, 1],
      [this.legR, -1],
    ] as Array<[THREE.Group, number]>) {
      const b = new GeoBuilder(31 + side);
      if (look.style === 'dobroslawa') {
        b.box(0.15, 0.5, 0.16, look.skin, { y: -0.45 });
      } else {
        b.box(0.27 * wide, 0.34, 0.29, look.pants, { y: -0.17 });
        b.box(0.3 * wide, 0.22, 0.32, look.pants, { y: -0.4 });
      }
      b.box(0.17, 0.3, 0.18, 0xe6dfcc, { y: -0.62 });
      b.box(0.18, 0.035, 0.19, LEATHER, { y: -0.55, rz: 0.35 * side });
      b.box(0.18, 0.035, 0.19, LEATHER, { y: -0.68, rz: -0.35 * side });
      b.box(0.19, 0.1, 0.31, 0x4a2f1e, { y: -0.81, z: 0.05 });
      this.part(leg, b);
    }

    // --- torso + head
    const t = new GeoBuilder(41);
    t.box(0.54 * wide, 0.62, 0.3, look.shirt, { y: 0.36 });
    t.box(0.58 * wide, 0.2, 0.34, look.shirt, { y: -0.02 });
    t.box(0.585 * wide, 0.045, 0.345, look.trim, { y: -0.1 });
    t.box(0.56 * wide, 0.09, 0.33, RED, { y: 0.1 });
    t.box(0.06, 0.34, 0.05, RED, { x: 0.15, y: -0.1, z: 0.175, rz: 0.08 });
    t.box(0.09, 0.07, 0.06, 0xd9a441, { x: 0.15, y: -0.28, z: 0.175 });
    t.box(0.24, 0.05, 0.31, look.trim, { y: 0.65 });
    t.box(0.09, 0.3, 0.31, look.trim, { y: 0.5 });
    t.box(0.04, 0.04, 0.315, 0xe6dfcc, { y: 0.52, rz: Math.PI / 4 });
    t.box(0.04, 0.04, 0.315, 0xe6dfcc, { y: 0.42, rz: Math.PI / 4 });
    // neck + head
    t.box(0.14, 0.1, 0.14, look.skin, { y: 0.71 });
    t.box(0.31, 0.32, 0.3, look.skin, { y: 0.9 });
    t.box(0.05, 0.05, 0.02, 0x2a1c14, { x: 0.08, y: 0.93, z: 0.155 });
    t.box(0.05, 0.05, 0.02, 0x2a1c14, { x: -0.08, y: 0.93, z: 0.155 });
    t.box(0.06, 0.05, 0.05, look.skin, { y: 0.87, z: 0.16 });
    if (look.style === 'wojmir') {
      t.box(0.35, 0.14, 0.34, look.hair, { y: 1.08 });
      t.box(0.35, 0.2, 0.1, look.hair, { y: 0.98, z: -0.14 });
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU;
        t.cone(0.09, 0.26, 4, look.hair, { x: Math.cos(a) * 0.11, y: 1.2, z: Math.sin(a) * 0.11 + 0.02, rz: -Math.cos(a) * 0.6, rx: Math.sin(a) * 0.6 + 0.2 });
      }
      t.cone(0.1, 0.24, 4, look.hair, { y: 1.16, z: 0.17, rx: 1.0 });
    } else if (look.style === 'dobroslawa') {
      t.box(0.35, 0.14, 0.34, look.hair, { y: 1.07 });
      t.box(0.35, 0.34, 0.1, look.hair, { y: 0.93, z: -0.15 });
      // braid
      t.box(0.1, 0.5, 0.1, look.hair, { y: 0.55, z: -0.2 });
      t.box(0.12, 0.06, 0.12, RED, { y: 0.32, z: -0.2 });
      // wreath of herbs and flowers
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        const flower = i % 3 === 0;
        t.ico(flower ? 0.065 : 0.075, 0, flower ? (i % 2 ? 0xf2e9d8 : 0xe9b83a) : 0x4f8a3a, { x: Math.cos(a) * 0.2, y: 1.12, z: Math.sin(a) * 0.2 });
      }
      // skirt + apron
      t.cyl(0.3, 0.46, 0.62, 7, look.pants, { y: -0.36 });
      t.box(0.3, 0.5, 0.04, 0xe6dfcc, { y: -0.32, z: 0.4, rx: -0.26 });
      t.box(0.3, 0.05, 0.045, RED, { y: -0.5, z: 0.445, rx: -0.26 });
      t.box(0.94, 0.045, 0.045, RED, { y: -0.66, z: 0 });
    } else if (look.style === 'bogumil') {
      t.box(0.33, 0.07, 0.32, look.hair, { y: 1.08 });
      // beard + brows
      t.box(0.3, 0.2, 0.12, look.hair, { y: 0.78, z: 0.13 });
      t.box(0.33, 0.1, 0.1, look.hair, { y: 0.84, z: 0.06 });
      t.box(0.24, 0.04, 0.03, look.hair, { y: 0.98, z: 0.155 });
      // leather apron
      t.box(0.5, 0.7, 0.04, LEATHER, { y: 0.14, z: 0.18 });
      t.box(0.05, 0.4, 0.04, LEATHER, { x: 0.2, y: 0.52, z: 0.17, rz: 0.3 });
      t.box(0.05, 0.4, 0.04, LEATHER, { x: -0.2, y: 0.52, z: 0.17, rz: -0.3 });
    } else {
      // jagna: hood and shawl
      t.box(0.38, 0.3, 0.36, look.hair, { y: 1.02, z: -0.03 });
      t.cone(0.2, 0.3, 4, look.hair, { y: 1.2, z: -0.12, rx: -0.7 });
      t.box(0.62, 0.16, 0.36, look.hair, { y: 0.6 });
      t.cyl(0.3, 0.46, 0.62, 7, look.pants, { y: -0.36 });
    }
    this.part(this.torso, t);

    // --- arms
    for (const [arm, side] of [
      [this.armL, 1],
      [this.armR, -1],
    ] as Array<[THREE.Group, number]>) {
      const b = new GeoBuilder(51 + side);
      if (look.style === 'bogumil') {
        b.box(0.2, 0.2, 0.22, look.shirt, { y: -0.08 });
        b.box(0.17, 0.42, 0.18, look.skin, { y: -0.38 });
        b.box(0.18, 0.08, 0.19, LEATHER, { y: -0.5 });
      } else {
        b.box(0.18, 0.38, 0.2, look.shirt, { y: -0.17 });
        b.box(0.19, 0.045, 0.21, look.trim, { y: -0.36 });
        b.box(0.13, 0.22, 0.14, look.skin, { y: -0.48 });
      }
      this.part(arm, b);
    }
  }

  update(p: Player, alpha: number, dt: number, time: number): void {
    const x = lerp(p.px, p.x, alpha);
    const y = lerp(p.py, p.y, alpha);
    const z = lerp(p.pz, p.z, alpha);
    this.group.position.set(x, y, z);
    this.group.rotation.y = p.yaw;

    const speed = Math.hypot(p.vx, p.vz);
    const dashing = p.dashT > 0;
    this.amp = damp(this.amp, p.onGround ? clamp(speed / 7, 0, 1.15) : 0, 14, dt);
    this.phase += speed * dt * 1.55;
    const amp = this.amp;
    const s = Math.sin(this.phase);

    if (this.wasGround && !p.onGround && p.vy > 0) this.jumpT = 0;
    this.wasGround = p.onGround;
    this.jumpT += dt;

    let legL = s * 0.95 * amp;
    let legR = -s * 0.95 * amp;
    let armL = -s * 0.8 * amp;
    let armR = s * 0.8 * amp;
    let armSpread = 0.08 + Math.sin(time * 1.7) * 0.02;
    let bob = Math.abs(Math.cos(this.phase)) * 0.07 * amp + Math.sin(time * 2.1) * 0.008;
    let targetLean = 0.16 * amp;
    let sy = 1;

    if (!p.onGround) {
      const up = clamp(p.vy / 11, -1, 1);
      legL = -0.75 + up * 0.25;
      legR = 0.35 - up * 0.2;
      armL = -1.3 * Math.max(0.3, Math.abs(up));
      armR = -1.1 * Math.max(0.3, Math.abs(up));
      armSpread = 0.7;
      targetLean = 0.1 - up * 0.12;
      sy = 1 + clamp(p.vy * 0.012, -0.08, 0.12);
    }
    // Squash & stretch: quick crouch-release at take-off, squash on landing.
    if (this.jumpT < 0.14) sy *= lerp(0.74, 1.14, this.jumpT / 0.14);
    if (p.onGround && p.landT < 0.2) sy *= 1 - (0.12 + p.landImpact * 0.22) * (1 - p.landT / 0.2);
    if (dashing) {
      targetLean = 0.85;
      armL = 1.2;
      armR = 1.2;
      legL = 0.9;
      legR = -0.5;
      sy *= 0.86;
      bob = -0.12;
    }

    this.lean = damp(this.lean, targetLean, dashing ? 30 : 12, dt);
    const sxz = 1 / Math.sqrt(sy);
    this.body.position.y = bob;
    this.body.rotation.x = this.lean;
    this.group.scale.set(sxz, sy, sxz);
    this.legL.rotation.x = legL;
    this.legR.rotation.x = legR;
    this.armL.rotation.x = armL;
    this.armR.rotation.x = armR;
    this.armL.rotation.z = armSpread;
    this.armR.rotation.z = -armSpread;
    this.torso.rotation.y = s * 0.12 * amp;

    // Hurt feedback: white flash, then blink while invulnerable.
    const flash = p.hurtT < 0.12 ? 1 : 0;
    this.mat.emissive.setScalar(flash * 0.9);
    this.body.visible = !(p.hurtT < 0.6 && p.hurtT > 0.12 && Math.floor(time * 20) % 2 === 0);

    // Blob shadow stays on the ground while jumping.
    this.shadow.position.y = 0.06;
    this.shadow.scale.setScalar(1);
  }

  /** Call after update with the terrain height under the hero so the blob shadow hugs the ground. */
  setGround(groundY: number): void {
    const h = this.group.position.y - groundY;
    this.shadow.position.y = (-h + 0.06) / this.group.scale.y;
    const k = clamp(1 - h / 6, 0.35, 1);
    this.shadow.scale.setScalar(k);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.5 * k;
  }
}
