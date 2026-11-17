import type * as THREE from 'three';
import { TAU } from '../core/math';
import { GeoBuilder } from './geo';

export interface EnemyModel {
  geo: THREE.BufferGeometry;
  /** Walk-cycle speed (rad/s) for the limb swing / wing flap shader. */
  cycle: number;
  /** Hop height while moving. */
  hop: number;
  /** Self-illumination colour (0 = none). */
  emissive: number;
}

function builder(seed: number): GeoBuilder {
  const b = new GeoBuilder(seed);
  b.forceAnim = true;
  return b;
}

const EYE = 0xffe9a0;

/** Chochlik: forest imp hiding behind a painted wooden mask. */
function chochlik(): THREE.BufferGeometry {
  const b = builder(101);
  const fur = 0x5a3c2a;
  const wood = 0xb9783c;
  b.box(0.36, 0.42, 0.3, fur, { y: 0.55 });
  // leaf ruff + skirt
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.cone(0.13, 0.34, 4, i % 2 ? 0x4c8a3a : 0x3d7230, { x: Math.cos(a) * 0.2, y: 0.74, z: Math.sin(a) * 0.17, rz: Math.cos(a) * 1.9, rx: -Math.sin(a) * 1.9 });
  }
  // mask
  b.box(0.44, 0.52, 0.1, wood, { y: 0.98, z: 0.17 });
  b.box(0.3, 0.1, 0.11, 0x8a5226, { y: 0.74, z: 0.18 });
  b.box(0.09, 0.07, 0.04, 0x1a120c, { x: 0.1, y: 1.04, z: 0.225 });
  b.box(0.09, 0.07, 0.04, 0x1a120c, { x: -0.1, y: 1.04, z: 0.225 });
  b.box(0.035, 0.035, 0.05, EYE, { x: 0.1, y: 1.04, z: 0.23, jitter: 0 });
  b.box(0.035, 0.035, 0.05, EYE, { x: -0.1, y: 1.04, z: 0.23, jitter: 0 });
  b.box(0.05, 0.2, 0.03, 0xb3261e, { y: 1.16, z: 0.225 });
  b.box(0.2, 0.04, 0.03, 0xb3261e, { y: 0.88, z: 0.225 });
  b.box(0.04, 0.12, 0.03, 0xe9e1cc, { x: 0.16, y: 0.9, z: 0.225 });
  b.box(0.04, 0.12, 0.03, 0xe9e1cc, { x: -0.16, y: 0.9, z: 0.225 });
  // horns
  b.cone(0.07, 0.36, 4, wood, { x: 0.2, y: 1.36, z: 0.14, rz: -0.45 });
  b.cone(0.07, 0.36, 4, wood, { x: -0.2, y: 1.36, z: 0.14, rz: 0.45 });
  // limbs
  b.box(0.09, 0.4, 0.09, fur, { x: 0.25, y: 0.5, swing: -0.9, pivot: 0.72 });
  b.box(0.09, 0.4, 0.09, fur, { x: -0.25, y: 0.5, swing: 0.9, pivot: 0.72 });
  b.box(0.11, 0.36, 0.12, 0x3a281c, { x: 0.1, y: 0.18, swing: 1.3, pivot: 0.36 });
  b.box(0.11, 0.36, 0.12, 0x3a281c, { x: -0.1, y: 0.18, swing: -1.3, pivot: 0.36 });
  return b.build();
}

/** Utopiec: drowned one, pale, hunched, draped in waterweed. */
function utopiec(): THREE.BufferGeometry {
  const b = builder(102);
  const skin = 0x8fb59c;
  const dark = 0x5f8a76;
  const weed = 0x55803a;
  b.box(0.72, 0.8, 0.44, skin, { y: 1.1, z: 0.05, rx: 0.3 });
  b.box(0.6, 0.4, 0.4, dark, { y: 0.62 });
  // head with gaping mouth
  b.box(0.44, 0.46, 0.42, skin, { y: 1.68, z: 0.3 });
  b.box(0.2, 0.16, 0.05, 0x1c2a22, { y: 1.56, z: 0.52 });
  b.box(0.08, 0.07, 0.05, EYE, { x: 0.11, y: 1.76, z: 0.52, jitter: 0 });
  b.box(0.08, 0.07, 0.05, EYE, { x: -0.11, y: 1.76, z: 0.52, jitter: 0 });
  // waterweed hair and shoulder moss
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    b.box(0.1, 0.55 + (i % 3) * 0.12, 0.05, i % 2 ? weed : 0x6a9a40, { x: Math.cos(a) * 0.22, y: 1.62 - (i % 3) * 0.05, z: 0.28 + Math.sin(a) * 0.2, rz: Math.cos(a) * 0.25, rx: Math.sin(a) * 0.2 });
  }
  b.box(0.9, 0.12, 0.5, weed, { y: 1.5, z: 0.1, rx: 0.3 });
  b.box(0.14, 0.5, 0.06, 0x6a9a40, { x: 0.3, y: 1.15, z: 0.3 });
  b.box(0.14, 0.4, 0.06, weed, { x: -0.26, y: 1.2, z: 0.3 });
  // long arms reaching forward
  for (const s of [-1, 1]) {
    b.box(0.17, 0.75, 0.17, skin, { x: s * 0.47, y: 1.05, z: 0.32, rx: -0.75, swing: -s * 0.5, pivot: 1.45 });
    b.box(0.2, 0.14, 0.24, dark, { x: s * 0.47, y: 0.78, z: 0.66, swing: -s * 0.5, pivot: 1.45 });
    b.cone(0.04, 0.2, 3, 0xd8e8d8, { x: s * 0.42, y: 0.72, z: 0.8, rx: 1.3, swing: -s * 0.5, pivot: 1.45 });
    b.cone(0.04, 0.2, 3, 0xd8e8d8, { x: s * 0.52, y: 0.72, z: 0.8, rx: 1.3, swing: -s * 0.5, pivot: 1.45 });
    b.box(0.22, 0.5, 0.24, dark, { x: s * 0.18, y: 0.25, swing: s * 0.9, pivot: 0.5 });
  }
  return b.build();
}

/** Kruk: raven with ember eyes. */
function kruk(): THREE.BufferGeometry {
  const b = builder(103);
  const black = 0x211c2e;
  const sheen = 0x35304a;
  b.octa(0.3, black, { sx: 0.8, sy: 0.75, sz: 1.5 });
  b.box(0.2, 0.2, 0.22, black, { y: 0.1, z: 0.42 });
  b.cone(0.07, 0.3, 4, 0xe58a2a, { y: 0.07, z: 0.66, rx: Math.PI / 2 });
  b.box(0.05, 0.05, 0.05, 0xff8a2a, { x: 0.1, y: 0.15, z: 0.48, jitter: 0 });
  b.box(0.05, 0.05, 0.05, 0xff8a2a, { x: -0.1, y: 0.15, z: 0.48, jitter: 0 });
  // tail
  b.box(0.22, 0.04, 0.4, sheen, { y: 0.02, z: -0.55, rx: -0.15 });
  // wings (flap in the shader)
  for (const s of [-1, 1]) {
    b.box(0.55, 0.04, 0.42, sheen, { x: s * 0.42, y: 0.08, flap: 1.1, flapFrom: 0.12 });
    b.box(0.5, 0.035, 0.3, black, { x: s * 0.9, y: 0.08, z: -0.05, flap: 1.1, flapFrom: 0.12 });
    b.cone(0.1, 0.34, 3, black, { x: s * 1.2, y: 0.08, z: -0.1, rz: -s * Math.PI / 2, flap: 1.1, flapFrom: 0.12 });
  }
  return b.build();
}

/** Błędny ognik: will-o'-the-wisp. */
function ognik(): THREE.BufferGeometry {
  const b = builder(104);
  b.ico(0.3, 0, 0xd8fbff, { y: 0, jitter: 0.03 });
  b.cone(0.26, 0.6, 5, 0x7fe8ff, { y: 0.35, jitter: 0.05 });
  b.cone(0.14, 0.4, 4, 0xaaf4ff, { x: 0.16, y: 0.3, z: 0.05, rz: -0.4, jitter: 0.05 });
  b.cone(0.12, 0.36, 4, 0x58d0f0, { x: -0.17, y: 0.26, z: -0.05, rz: 0.45, jitter: 0.05 });
  b.box(0.07, 0.09, 0.04, 0x10303a, { x: 0.09, y: 0.02, z: 0.26, jitter: 0 });
  b.box(0.07, 0.09, 0.04, 0x10303a, { x: -0.09, y: 0.02, z: 0.26, jitter: 0 });
  return b.build();
}

/** Strzyga: gaunt owl-eared night demon with claws. */
function strzyga(): THREE.BufferGeometry {
  const b = builder(105);
  const skin = 0x7a6a8c;
  const dark = 0x3e3350;
  b.box(0.44, 0.7, 0.3, skin, { y: 1.05, rx: 0.2 });
  b.box(0.36, 0.3, 0.26, dark, { y: 0.62 });
  b.box(0.36, 0.36, 0.34, skin, { y: 1.56, z: 0.14 });
  b.cone(0.08, 0.3, 4, dark, { x: 0.16, y: 1.86, z: 0.1, rz: -0.3 });
  b.cone(0.08, 0.3, 4, dark, { x: -0.16, y: 1.86, z: 0.1, rz: 0.3 });
  b.box(0.09, 0.09, 0.04, 0xff5040, { x: 0.09, y: 1.6, z: 0.32, jitter: 0 });
  b.box(0.09, 0.09, 0.04, 0xff5040, { x: -0.09, y: 1.6, z: 0.32, jitter: 0 });
  b.cone(0.05, 0.14, 3, 0xd8c8a0, { y: 1.5, z: 0.36, rx: 1.9 });
  // tattered wing-cape
  for (const s of [-1, 1]) {
    b.box(0.34, 0.8, 0.04, dark, { x: s * 0.3, y: 1.0, z: -0.2, rz: s * 0.25, rx: 0.15 });
    b.cone(0.12, 0.4, 3, dark, { x: s * 0.42, y: 0.5, z: -0.22, rx: Math.PI });
    // arms with claws
    b.box(0.11, 0.7, 0.11, skin, { x: s * 0.33, y: 0.98, z: 0.2, rx: -0.55, swing: -s * 0.8, pivot: 1.35 });
    b.cone(0.035, 0.22, 3, 0xe6dfcc, { x: s * 0.3, y: 0.62, z: 0.46, rx: 2.2, swing: -s * 0.8, pivot: 1.35 });
    b.cone(0.035, 0.22, 3, 0xe6dfcc, { x: s * 0.38, y: 0.62, z: 0.46, rx: 2.2, swing: -s * 0.8, pivot: 1.35 });
    b.box(0.13, 0.5, 0.14, dark, { x: s * 0.12, y: 0.25, swing: s * 1.1, pivot: 0.5 });
  }
  return b.build();
}

/** Wilkołak: hunched wolf-beast on all fours. */
function wilkolak(): THREE.BufferGeometry {
  const b = builder(106);
  const fur = 0x4b423c;
  const dark = 0x2f2a28;
  b.box(0.62, 0.62, 1.15, fur, { y: 0.9, rx: -0.12 });
  b.box(0.7, 0.5, 0.5, dark, { y: 1.08, z: 0.34 });
  // spine tufts
  for (let i = 0; i < 4; i++) b.cone(0.1, 0.26, 3, dark, { y: 1.34 - i * 0.05, z: 0.3 - i * 0.26 });
  // head
  b.box(0.44, 0.42, 0.44, fur, { y: 1.06, z: 0.82 });
  b.box(0.24, 0.2, 0.36, dark, { y: 0.96, z: 1.14 });
  b.box(0.08, 0.06, 0.04, 0x15100e, { y: 1.0, z: 1.33 });
  b.cone(0.09, 0.26, 3, dark, { x: 0.15, y: 1.38, z: 0.74 });
  b.cone(0.09, 0.26, 3, dark, { x: -0.15, y: 1.38, z: 0.74 });
  b.box(0.08, 0.06, 0.04, 0xffd040, { x: 0.12, y: 1.12, z: 1.05, jitter: 0 });
  b.box(0.08, 0.06, 0.04, 0xffd040, { x: -0.12, y: 1.12, z: 1.05, jitter: 0 });
  b.cone(0.03, 0.1, 3, 0xf0ead8, { x: 0.07, y: 0.84, z: 1.26, rx: Math.PI });
  b.cone(0.03, 0.1, 3, 0xf0ead8, { x: -0.07, y: 0.84, z: 1.26, rx: Math.PI });
  // legs
  for (const s of [-1, 1]) {
    b.box(0.18, 0.74, 0.2, fur, { x: s * 0.26, y: 0.37, z: 0.42, swing: s * 1.0, pivot: 0.74 });
    b.box(0.2, 0.7, 0.24, dark, { x: s * 0.26, y: 0.35, z: -0.42, swing: -s * 1.0, pivot: 0.7 });
  }
  b.cone(0.11, 0.6, 4, dark, { y: 0.84, z: -0.82, rx: -1.9 });
  return b.build();
}

/** Bies: horned forest devil that hurls cursed fire. */
function bies(): THREE.BufferGeometry {
  const b = builder(107);
  const hide = 0x6a2c2a;
  const dark = 0x3a1818;
  const horn = 0xd8c8a0;
  b.box(0.7, 0.85, 0.46, hide, { y: 1.22 });
  b.box(0.52, 0.34, 0.4, dark, { y: 0.7 });
  b.box(0.42, 0.42, 0.4, hide, { y: 1.84, z: 0.06 });
  b.box(0.2, 0.2, 0.1, dark, { y: 1.72, z: 0.28 });
  b.box(0.09, 0.06, 0.04, 0xff9a30, { x: 0.11, y: 1.9, z: 0.27, jitter: 0 });
  b.box(0.09, 0.06, 0.04, 0xff9a30, { x: -0.11, y: 1.9, z: 0.27, jitter: 0 });
  for (const s of [-1, 1]) {
    b.cone(0.09, 0.36, 4, horn, { x: s * 0.26, y: 2.12, z: 0.02, rz: -s * 0.9 });
    b.cone(0.06, 0.3, 4, horn, { x: s * 0.44, y: 2.32, z: 0.02, rz: -s * 0.15 });
    b.box(0.18, 0.7, 0.18, hide, { x: s * 0.46, y: 1.2, swing: -s * 0.7, pivot: 1.6 });
    b.box(0.2, 0.62, 0.22, dark, { x: s * 0.17, y: 0.31, swing: s * 0.9, pivot: 0.62 });
    b.box(0.22, 0.1, 0.26, 0x1a1210, { x: s * 0.17, y: 0.05, z: 0.03, swing: s * 0.9, pivot: 0.62 });
  }
  // cursed orb in the right hand
  b.ico(0.17, 0, 0xc070ff, { x: 0.5, y: 0.82, z: 0.16, jitter: 0.03, swing: -0.7, pivot: 1.6 });
  b.cone(0.08, 0.5, 4, dark, { y: 0.8, z: -0.3, rx: -2.2 });
  return b.build();
}

/** Licho: tall one-eyed misfortune in rags. */
function licho(): THREE.BufferGeometry {
  const b = builder(108);
  const rag = 0x2b2b3a;
  const pale = 0xc9c4b4;
  b.cone(0.48, 1.5, 6, rag, { y: 0.75 });
  b.box(0.36, 0.5, 0.26, 0x353548, { y: 1.5 });
  b.box(0.3, 0.38, 0.3, pale, { y: 1.96, z: 0.04 });
  b.ico(0.11, 0, 0xffe040, { y: 1.99, z: 0.19, jitter: 0 });
  b.box(0.05, 0.1, 0.04, 0x15100e, { y: 1.99, z: 0.28, jitter: 0 });
  b.box(0.34, 0.14, 0.34, rag, { y: 2.2 });
  b.cone(0.16, 0.34, 4, rag, { y: 2.38, z: -0.06, rx: -0.4 });
  for (const s of [-1, 1]) {
    b.box(0.08, 0.95, 0.08, pale, { x: s * 0.27, y: 1.2, z: 0.1, rx: -0.2, swing: -s * 0.6, pivot: 1.7 });
    b.cone(0.03, 0.2, 3, pale, { x: s * 0.27, y: 0.66, z: 0.2, rx: Math.PI, swing: -s * 0.6, pivot: 1.7 });
    b.box(0.2, 0.3, 0.05, 0x1f1f2c, { x: s * 0.2, y: 0.3, z: 0.3, rx: 0.3 });
  }
  return b.build();
}

/** Baba Jaga riding her stone mortar, pestle in hand. */
function jaga(): THREE.BufferGeometry {
  const b = builder(109);
  const stone = 0x6a6478;
  const shawl = 0x4a2f5a;
  // mortar
  b.cyl(0.95, 0.7, 1.3, 8, stone, { y: 0.65 });
  b.cyl(1.02, 1.02, 0.14, 8, 0x524c60, { y: 1.3 });
  b.cyl(0.74, 0.74, 0.1, 8, 0x3a3546, { y: 0.02 });
  b.box(0.3, 0.3, 0.06, 0x8a8498, { y: 0.75, z: 0.88, rz: Math.PI / 4 });
  // witch
  b.box(0.75, 0.8, 0.55, shawl, { y: 1.75, z: 0.05, rx: 0.3 });
  b.box(0.9, 0.2, 0.6, 0x5c3a70, { y: 2.08, z: 0.12, rx: 0.3 });
  b.box(0.44, 0.44, 0.42, 0xb9a08a, { y: 2.38, z: 0.36 });
  b.cone(0.09, 0.42, 4, 0xa88a72, { y: 2.3, z: 0.72, rx: 1.75 });
  b.box(0.09, 0.05, 0.04, 0xa8ff60, { x: 0.12, y: 2.44, z: 0.58, jitter: 0 });
  b.box(0.09, 0.05, 0.04, 0xa8ff60, { x: -0.12, y: 2.44, z: 0.58, jitter: 0 });
  b.box(0.5, 0.22, 0.48, 0xb3261e, { y: 2.6, z: 0.3 });
  b.cone(0.14, 0.36, 4, 0xb3261e, { y: 2.5, z: 0.0, rx: -2.0 });
  b.ico(0.2, 0, 0xcfc8c0, { y: 2.42, z: 0.02 });
  // pestle / broom
  b.cyl(0.07, 0.07, 2.6, 5, 0x6a4a2a, { x: 0.9, y: 1.7, z: 0.2, rz: 0.35, rx: 0.2 });
  b.cone(0.3, 0.7, 6, 0xc9a050, { x: 1.36, y: 0.5, z: -0.05, rz: 0.35, rx: Math.PI + 0.2 });
  b.box(0.16, 0.6, 0.16, shawl, { x: 0.62, y: 1.9, z: 0.3, rz: -0.9 });
  b.box(0.16, 0.6, 0.16, shawl, { x: -0.6, y: 1.75, z: 0.3, rz: 0.7, rx: -0.6 });
  return b.build();
}

/** Południca: the noon wraith in a white dress with a great scythe. */
function poludnica(): THREE.BufferGeometry {
  const b = builder(110);
  const dress = 0xf2ecd8;
  const hair = 0xe2b040;
  b.cone(0.72, 1.9, 7, dress, { y: 0.95 });
  b.box(0.5, 0.6, 0.3, dress, { y: 1.95 });
  b.box(0.52, 0.07, 0.32, 0xb3261e, { y: 1.68 });
  b.box(0.1, 0.5, 0.31, 0xb3261e, { y: 2.0 });
  b.box(0.34, 0.38, 0.32, 0xf0dcc8, { y: 2.46, z: 0.02 });
  b.box(0.08, 0.05, 0.04, 0xffffff, { x: 0.09, y: 2.5, z: 0.18, jitter: 0 });
  b.box(0.08, 0.05, 0.04, 0xffffff, { x: -0.09, y: 2.5, z: 0.18, jitter: 0 });
  // long wheat-gold hair + wreath of wheat and poppies
  b.box(0.42, 0.9, 0.14, hair, { y: 2.1, z: -0.2 });
  b.box(0.4, 0.14, 0.38, hair, { y: 2.68 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    b.cone(0.05, 0.22, 3, i % 3 === 0 ? 0xd03020 : 0xf0c850, { x: Math.cos(a) * 0.23, y: 2.78, z: Math.sin(a) * 0.23, rz: -Math.cos(a) * 0.5, rx: Math.sin(a) * 0.5 });
  }
  // arms + scythe
  b.box(0.12, 0.7, 0.12, dress, { x: 0.36, y: 1.9, z: 0.2, rx: -0.9 });
  b.box(0.12, 0.7, 0.12, dress, { x: -0.36, y: 1.9, z: 0.2, rx: -0.6 });
  b.cyl(0.05, 0.05, 3.1, 5, 0x6a4a2a, { x: 0.5, y: 1.9, z: 0.5, rz: -0.25 });
  b.box(1.1, 0.2, 0.04, 0xc8d0dc, { x: 0.4, y: 3.38, z: 0.5, rz: 0.35 });
  b.cone(0.1, 0.5, 3, 0xdfe6f0, { x: -0.28, y: 3.12, z: 0.5, rz: 1.2, sz: 0.3 });
  return b.build();
}

/** Leszy: antlered giant of bark, moss and bone. */
function leszy(): THREE.BufferGeometry {
  const b = builder(111);
  const bark = 0x3d3026;
  const dark = 0x2a211b;
  const moss = 0x4a6e30;
  const bone = 0xd9cdb0;
  // torso: hunched mound
  b.ico(2.3, 1, bark, { y: 5.2, z: -0.3, sx: 1.15, sy: 1.0, sz: 0.95, jitter: 0.12 });
  b.ico(1.7, 1, dark, { y: 3.4, z: 0, sx: 1.0, sy: 1.0, sz: 0.85, jitter: 0.12 });
  b.ico(1.5, 0, bark, { y: 6.5, z: 0.5, sx: 1.2, sy: 0.8, sz: 1.0 });
  b.tintUpFaces(moss, 0.45, 0.92);
  // skull head with long snout
  b.box(1.0, 1.1, 1.0, bone, { y: 7.0, z: 1.7, rx: 0.25 });
  b.box(0.62, 0.6, 1.2, bone, { y: 6.5, z: 2.5, rx: 0.35 });
  b.box(0.5, 0.16, 0.9, 0xb8aa8c, { y: 6.1, z: 2.4, rx: 0.5 });
  b.box(0.24, 0.26, 0.1, 0xff8a20, { x: 0.3, y: 7.1, z: 2.22, rx: 0.25, jitter: 0 });
  b.box(0.24, 0.26, 0.1, 0xff8a20, { x: -0.3, y: 7.1, z: 2.22, rx: 0.25, jitter: 0 });
  b.box(0.3, 0.3, 0.1, 0x1a120c, { x: 0.3, y: 7.1, z: 2.18, rx: 0.25, s: 1.3 });
  b.box(0.3, 0.3, 0.1, 0x1a120c, { x: -0.3, y: 7.1, z: 2.18, rx: 0.25, s: 1.3 });
  // antlers
  for (const s of [-1, 1]) {
    b.cyl(0.12, 0.2, 2.4, 5, dark, { x: s * 0.9, y: 8.4, z: 1.3, rz: -s * 0.55 });
    b.cyl(0.08, 0.13, 1.6, 5, dark, { x: s * 1.9, y: 9.5, z: 1.3, rz: -s * 0.15 });
    b.cyl(0.06, 0.1, 1.2, 5, dark, { x: s * 1.25, y: 9.3, z: 1.5, rz: s * 0.3, rx: 0.3 });
    b.cyl(0.06, 0.1, 1.3, 5, dark, { x: s * 2.3, y: 8.9, z: 1.1, rz: -s * 1.1 });
    b.cyl(0.05, 0.08, 0.9, 5, dark, { x: s * 2.1, y: 10.3, z: 1.3, rz: s * 0.4 });
    b.box(0.12, 1.2, 0.06, moss, { x: s * 1.6, y: 8.5, z: 1.3 });
    b.box(0.1, 0.9, 0.06, 0x5a8236, { x: s * 2.4, y: 8.3, z: 1.1 });
    // arms: long, reaching to the ground
    b.cyl(0.5, 0.62, 3.2, 6, bark, { x: s * 2.6, y: 4.6, z: 0.6, rz: s * 0.25, rx: -0.25, swing: -s * 0.35, pivot: 6.2 });
    b.cyl(0.42, 0.5, 2.6, 6, dark, { x: s * 3.1, y: 2.1, z: 1.3, rx: -0.5, swing: -s * 0.35, pivot: 6.2 });
    for (let f = 0; f < 3; f++) {
      b.cone(0.16, 1.0, 4, bone, { x: s * (2.8 + f * 0.3), y: 0.55, z: 2.2, rx: 2.3, swing: -s * 0.35, pivot: 6.2 });
    }
    b.box(0.2, 1.6, 0.08, moss, { x: s * 2.7, y: 3.6, z: 0.9, swing: -s * 0.35, pivot: 6.2 });
    b.box(0.2, 1.3, 0.08, 0x5a8236, { x: s * 3.1, y: 3.9, z: 0.5, swing: -s * 0.35, pivot: 6.2 });
    // legs: trunks
    b.cyl(0.6, 0.85, 2.8, 6, dark, { x: s * 1.0, y: 1.4, z: -0.2, swing: s * 0.3, pivot: 2.8 });
    b.box(1.5, 0.4, 1.8, bark, { x: s * 1.0, y: 0.2, z: 0.1, swing: s * 0.3, pivot: 2.8 });
  }
  // hanging moss beard and back mushrooms
  for (let i = 0; i < 7; i++) {
    b.box(0.22, 1.4 + (i % 3) * 0.5, 0.08, i % 2 ? moss : 0x5a8236, { x: -1.2 + i * 0.4, y: 5.0 - (i % 3) * 0.2, z: 1.5 });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2.4 - 1.2;
    b.cyl(0.08, 0.1, 0.4, 5, 0xe8dfc8, { x: Math.sin(a) * 1.6, y: 7.2 + Math.cos(a) * 0.4, z: -0.9 });
    b.cone(0.34, 0.26, 6, 0xb5352a, { x: Math.sin(a) * 1.6, y: 7.52 + Math.cos(a) * 0.4, z: -0.9 });
  }
  return b.build();
}

/** Builds the render model for every enemy id. */
export function buildEnemyModels(): Record<string, EnemyModel> {
  return {
    chochlik: { geo: chochlik(), cycle: 15, hop: 0.14, emissive: 0 },
    utopiec: { geo: utopiec(), cycle: 6, hop: 0.05, emissive: 0 },
    kruk: { geo: kruk(), cycle: 16, hop: 0, emissive: 0 },
    ognik: { geo: ognik(), cycle: 8, hop: 0, emissive: 0x3ab8d0 },
    strzyga: { geo: strzyga(), cycle: 10, hop: 0.06, emissive: 0 },
    wilkolak: { geo: wilkolak(), cycle: 12, hop: 0.1, emissive: 0 },
    bies: { geo: bies(), cycle: 7, hop: 0.05, emissive: 0 },
    licho: { geo: licho(), cycle: 5, hop: 0.03, emissive: 0 },
    jaga: { geo: jaga(), cycle: 3, hop: 0, emissive: 0 },
    poludnica: { geo: poludnica(), cycle: 4, hop: 0.04, emissive: 0x4a4020 },
    leszy: { geo: leszy(), cycle: 2.2, hop: 0.1, emissive: 0 },
  };
}
