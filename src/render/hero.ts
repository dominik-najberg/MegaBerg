import * as THREE from 'three';
import { clamp, damp, lerp, TAU } from '../core/math';
import type { CharacterDef } from '../data/types';
import type { Player } from '../sim/player';
import { GeoBuilder } from './geo';

type Look = CharacterDef['look'];

const RED = 0xb3261e;
const LEATHER = 0x5a3a24;
const LINEN = 0xe6dfcc;
/** Bogumił, after the starred concept: oxblood apron, dark fur collar, forged buckles, amber. */
const APRON = 0x6e3420;
const STITCH = 0x84532e;
const FUR = 0x3b2a20;
const FUR_TIP = 0x54402e;
const IRON = 0x9a9080;
const AMBER = 0xf0a030;
const GOLD = 0xd9a441;
const EMBROIDERY = 0xa02c22;
/** Wojmir, after the starred "Perun" skin: storm-navy tunic, copper trim, smoked leather, axe amulet. */
const COPPER = 0xb5744e;
const COPPER_LIT = 0xd29a6c;
const SMOKED = 0x4a3024;
const SMOKED_DARK = 0x33211a;
/** Jagna, after the starred "Noc Kupały" skin: fern wreath, moss capelet, green skirt with red bands. */
const MOSS = 0x2f5a34;
const FERN = 0x4f8a3a;
const FERN_LIT = 0x76a84a;
const PETAL = 0xe890a0;
const FERN_FLOWER = 0xffb040;

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
    // Rim light and a little self-illumination: the hero must read at a glance in any light.
    this.mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * 0.06;
float mbRim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.5);
totalEmissiveRadiance += vec3(0.75, 0.62, 0.45) * mbRim * 0.22;`,
      );
    };
    this.mat.customProgramCacheKey = () => 'mb-hero';
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
      if (look.style === 'bogumil') {
        // heavy smith's boots: cuff, toe cap and a thick sole
        b.box(0.2, 0.05, 0.2, LEATHER, { y: -0.745 });
        b.box(0.21, 0.08, 0.12, LEATHER, { y: -0.8, z: 0.16 });
        b.box(0.22, 0.035, 0.35, 0x2a1a12, { y: -0.845, z: 0.05 });
      }
      this.part(leg, b);
    }

    // --- torso + head
    const perun = look.outfit === 'perun';
    const t = new GeoBuilder(41);
    t.box(0.54 * wide, 0.62, 0.3, look.shirt, { y: 0.36 });
    // jagna wears a green apron over the hips, the others the lower half of the shirt
    t.box(0.58 * wide, 0.2, 0.34, look.style === 'jagna' ? look.pants : look.shirt, { y: -0.02 });
    t.box(0.585 * wide, 0.045, 0.345, look.trim, { y: -0.1 });
    t.box(0.56 * wide, 0.09, 0.33, perun ? SMOKED : RED, { y: 0.1 });
    if (perun) {
      // smoked leather: belt loop, hanger and scabbard, with a flat copper axe amulet on top
      t.box(0.07, 0.1, 0.03, SMOKED_DARK, { x: 0.15, y: 0.1, z: 0.17 });
      t.box(0.05, 0.3, 0.035, SMOKED_DARK, { x: 0.15, y: -0.06, z: 0.185 });
      t.box(0.095, 0.2, 0.05, SMOKED, { x: 0.15, y: -0.24, z: 0.19 });
      t.box(0.068, 0.068, 0.05, SMOKED, { x: 0.15, y: -0.34, z: 0.19, rz: Math.PI / 4 });
      t.box(0.03, 0.2, 0.025, COPPER, { x: 0.15, y: -0.01, z: 0.215, jitter: 0.03 });
      t.box(0.1, 0.075, 0.025, COPPER_LIT, { x: 0.2, y: 0.045, z: 0.215, jitter: 0.03 });
      t.box(0.05, 0.11, 0.024, COPPER_LIT, { x: 0.235, y: 0.045, z: 0.215, jitter: 0.03 });
    } else if (look.style !== 'bogumil') {
      t.box(0.06, 0.34, 0.05, RED, { x: 0.15, y: -0.1, z: 0.175, rz: 0.08 });
      t.box(0.09, 0.07, 0.06, GOLD, { x: 0.15, y: -0.28, z: 0.175 });
    }
    t.box(0.24, 0.05, 0.31, look.trim, { y: 0.65 });
    if (perun) {
      // short copper neckline running into an embroidered thunderbolt, six-armed thunder mark beside it
      t.box(0.08, 0.1, 0.31, look.trim, { y: 0.6 });
      t.box(0.06, 0.17, 0.02, COPPER_LIT, { x: 0.035, y: 0.5, z: 0.155, rz: -0.45, jitter: 0.03 });
      t.box(0.1, 0.04, 0.02, COPPER_LIT, { x: 0.035, y: 0.428, z: 0.156, jitter: 0.03 });
      t.box(0.04, 0.18, 0.02, COPPER_LIT, { x: 0.03, y: 0.345, z: 0.155, rz: -0.45, jitter: 0.03 });
      for (let i = 0; i < 3; i++) t.box(0.1, 0.02, 0.02, COPPER, { x: -0.165, y: 0.5, z: 0.155, rz: (i * Math.PI) / 3, jitter: 0.03 });
    } else {
      t.box(0.09, 0.3, 0.31, look.trim, { y: 0.5 });
    }
    if (look.style !== 'bogumil' && !perun) {
      t.box(0.04, 0.04, 0.315, LINEN, { y: 0.52, rz: Math.PI / 4 });
      t.box(0.04, 0.04, 0.315, LINEN, { y: 0.42, rz: Math.PI / 4 });
    }
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
      // flat cap of hair with a brim, heavy brows, square beard
      t.box(0.35, 0.09, 0.34, look.hair, { y: 1.09 });
      t.box(0.32, 0.2, 0.14, look.hair, { y: 0.78, z: 0.13 });
      t.box(0.33, 0.1, 0.1, look.hair, { y: 0.84, z: 0.06 });
      t.box(0.12, 0.05, 0.04, look.hair, { x: 0.085, y: 0.985, z: 0.16, rz: 0.16 });
      t.box(0.12, 0.05, 0.04, look.hair, { x: -0.085, y: 0.985, z: 0.16, rz: -0.16 });
      // fur collar: a band over the shoulders with tufts at the sides and back
      t.box(0.68, 0.1, 0.39, FUR, { y: 0.68 });
      t.box(0.33, 0.22, 0.06, look.hair, { y: 0.97, z: -0.14 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        if (Math.sin(a) > 0.55) continue; // the front stays clear for the beard and straps
        t.cone(0.09, 0.22, 4, i % 2 ? FUR : FUR_TIP, { x: Math.cos(a) * 0.33, y: 0.68, z: Math.sin(a) * 0.19, rz: -Math.cos(a) * 2.0, rx: Math.sin(a) * 2.0 });
      }
      // embroidered neckline and shirt hem, amber amulet
      t.box(0.03, 0.15, 0.02, EMBROIDERY, { x: 0.05, y: 0.6, z: 0.155, rz: -0.38 });
      t.box(0.03, 0.15, 0.02, EMBROIDERY, { x: -0.05, y: 0.6, z: 0.155, rz: 0.38 });
      t.box(0.075, 0.075, 0.035, AMBER, { y: 0.555, z: 0.17, rz: Math.PI / 4, jitter: 0 });
      t.box(0.69, 0.035, 0.35, EMBROIDERY, { y: -0.04 });
      // leather apron: stitched bib, wide straps with iron buckles, straps down the back
      t.box(0.46, 0.76, 0.04, APRON, { y: 0.12, z: 0.185 });
      t.box(0.02, 0.76, 0.045, STITCH, { x: 0.225, y: 0.12, z: 0.186 });
      t.box(0.02, 0.76, 0.045, STITCH, { x: -0.225, y: 0.12, z: 0.186 });
      t.box(0.46, 0.02, 0.045, STITCH, { y: -0.25, z: 0.186 });
      t.box(0.46, 0.025, 0.045, LEATHER, { y: 0.49, z: 0.187 });
      for (const s of [-1, 1]) {
        t.box(0.09, 0.3, 0.04, LEATHER, { x: s * 0.18, y: 0.6, z: 0.17, rz: s * 0.1 });
        t.box(0.12, 0.085, 0.03, IRON, { x: s * 0.175, y: 0.53, z: 0.2 });
        t.box(0.06, 0.035, 0.035, 0x2a1c14, { x: s * 0.175, y: 0.53, z: 0.2 });
        t.box(0.09, 0.56, 0.03, LEATHER, { x: s * 0.17, y: 0.38, z: -0.16 });
      }
      t.box(0.44, 0.07, 0.03, LEATHER, { y: 0.1, z: -0.175 });
      // sash end: wrapped red cord with a gold block
      t.box(0.07, 0.3, 0.05, RED, { x: 0.13, y: -0.06, z: 0.23 });
      t.box(0.075, 0.03, 0.055, 0x7e1a14, { x: 0.13, y: 0.02, z: 0.23 });
      t.box(0.075, 0.03, 0.055, 0x7e1a14, { x: 0.13, y: -0.07, z: 0.23 });
      t.box(0.075, 0.03, 0.055, 0x7e1a14, { x: 0.13, y: -0.16, z: 0.23 });
      t.box(0.1, 0.09, 0.075, GOLD, { x: 0.13, y: -0.25, z: 0.23 });
    } else {
      // jagna on Kupala night: dark bob under a wreath of fern, herbs and flowers
      t.box(0.36, 0.14, 0.35, look.hair, { y: 1.07 });
      t.box(0.36, 0.36, 0.1, look.hair, { y: 0.92, z: -0.15 });
      for (const s of [-1, 1]) t.box(0.05, 0.3, 0.22, look.hair, { x: s * 0.17, y: 0.93, z: -0.03 });
      t.box(0.32, 0.06, 0.03, look.hair, { y: 1.03, z: 0.155 });
      t.cone(0.07, 0.12, 4, look.hair, { y: 1.18, z: -0.02 });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU + 0.22;
        const cx = Math.cos(a);
        const cz = Math.sin(a);
        // fern fronds fan outwards and up
        t.cone(0.05, 0.22, 4, i % 2 ? FERN : FERN_LIT, { x: cx * 0.23, y: 1.13, z: cz * 0.23, rz: -cx * 1.05, rx: cz * 1.05 });
        if (i % 3 === 0) t.ico(0.05, 0, i % 2 ? PETAL : 0xf2e9d8, { x: cx * 0.21, y: 1.09, z: cz * 0.21 });
      }
      t.box(0.4, 0.045, 0.39, MOSS, { y: 1.09 });
      // the fern flower itself, over the left brow
      t.octa(0.055, FERN_FLOWER, { x: 0.12, y: 1.13, z: 0.2, jitter: 0 });
      // moss capelet, green bodice sides, red shoulder straps and chest embroidery
      t.box(0.64, 0.14, 0.37, MOSS, { y: 0.61 });
      t.box(0.4, 0.07, 0.38, MOSS, { y: 0.52 });
      for (const s of [-1, 1]) {
        t.box(0.09, 0.42, 0.305, look.pants, { x: s * 0.23, y: 0.3 });
        t.box(0.045, 0.36, 0.31, RED, { x: s * 0.16, y: 0.31 });
        t.box(0.035, 0.035, 0.02, RED, { x: s * 0.085, y: 0.36, z: 0.155, rz: Math.PI / 4 });
        t.box(0.035, 0.035, 0.02, RED, { x: s * 0.085, y: 0.25, z: 0.155, rz: Math.PI / 4 });
      }
      // skirt with red woven bands and a linen hem
      t.cyl(0.3, 0.46, 0.62, 7, look.pants, { y: -0.36 });
      t.cyl(0.427, 0.443, 0.055, 7, RED, { y: -0.53 });
      t.cyl(0.444, 0.451, 0.025, 7, RED, { y: -0.59 });
      t.cyl(0.453, 0.468, 0.055, 7, LINEN, { y: -0.645 });
    }
    this.part(this.torso, t);

    // --- arms
    for (const [arm, side] of [
      [this.armL, 1],
      [this.armR, -1],
    ] as Array<[THREE.Group, number]>) {
      const b = new GeoBuilder(51 + side);
      if (look.style === 'bogumil') {
        // short wide sleeve with an embroidered hem, bare arm, studded bracer, fist
        b.box(0.24, 0.22, 0.25, look.shirt, { y: -0.07 });
        b.box(0.245, 0.04, 0.255, EMBROIDERY, { y: -0.15 });
        b.box(0.2, 0.2, 0.21, look.skin, { y: -0.28 });
        b.box(0.17, 0.3, 0.18, look.skin, { y: -0.45 });
        b.box(0.2, 0.14, 0.21, 0x4a2c1c, { y: -0.46 });
        b.box(0.03, 0.04, 0.04, IRON, { x: side * 0.105, y: -0.46 });
        b.box(0.04, 0.04, 0.03, IRON, { y: -0.46, z: 0.11 });
        b.box(0.19, 0.12, 0.2, look.skin, { y: -0.6 });
      } else {
        b.box(0.18, 0.38, 0.2, look.shirt, { y: -0.17 });
        b.box(0.19, 0.045, 0.21, look.trim, { y: -0.36 });
        if (look.style === 'jagna') {
          // embroidered sleeve: a red band with a flower under it
          b.box(0.185, 0.04, 0.205, RED, { y: -0.1 });
          b.box(0.05, 0.05, 0.02, RED, { x: side * 0.092, y: -0.21, rz: Math.PI / 4, ry: Math.PI / 2 });
        }
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
