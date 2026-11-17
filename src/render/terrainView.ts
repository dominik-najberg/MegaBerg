import * as THREE from 'three';
import { fbm, hash2, smoothstep } from '../core/math';
import { GRID_CELL, GRID_N, MAP_HALF, PLAY_RADIUS, type GameMap } from '../sim/terrain';

const GRASS = [0x3b5a2a, 0x466a2f, 0x304c27, 0x52702f];
const DIRT = [0x5b4633, 0x4d3b2c];
const MUD = 0x3a3128;
const DEEP = 0x1c2a1e;
const NIGHT_WATER = new THREE.Color(0x0e1a2e);

/** Flat-shaded terrain mesh with per-triangle colours, plus swamp puddle water discs. */
export class TerrainView {
  readonly group = new THREE.Group();
  private readonly water: THREE.MeshPhongMaterial;

  constructor(map: GameMap) {
    const cells = GRID_N - 1;
    const pos = new Float32Array(cells * cells * 18);
    const col = new Float32Array(cells * cells * 18);
    const c = new THREE.Color();
    const c2 = new THREE.Color();
    const _t = new THREE.Color();
    let o = 0;
    const h = map.heights;
    const put = (x: number, y: number, z: number): void => {
      pos[o] = x;
      pos[o + 1] = y;
      pos[o + 2] = z;
      col[o] = c.r;
      col[o + 1] = c.g;
      col[o + 2] = c.b;
      o += 3;
    };
    const faceColor = (cx: number, cz: number, slope: number, salt: number): void => {
      const d = Math.hypot(cx, cz);
      const n = fbm(cx / 9 + 5.5, cz / 9 + 1.5, 3);
      const g = fbm(cx / 17 + 60, cz / 17 + 20, 2);
      const r = hash2(Math.floor(cx * 7.3) + salt, Math.floor(cz * 7.3));
      let dirt = smoothstep(0.54, 0.68, n) * 0.85;
      dirt = Math.max(dirt, (1 - smoothstep(3, 9, d)) * 0.9);
      dirt = Math.max(dirt, smoothstep(0.55, 1.0, slope));
      c.set(GRASS[0] as number).lerp(c2.set(GRASS[1] as number), smoothstep(0.3, 0.7, g));
      if (r > 0.82) c.lerp(c2.set(GRASS[3] as number), 0.5);
      else if (r < 0.15) c.lerp(c2.set(GRASS[2] as number), 0.5);
      c2.set(DIRT[0] as number).lerp(_t.set(DIRT[1] as number), smoothstep(0.35, 0.65, g));
      c.lerp(c2, dirt);
      let mud = 0;
      for (const p of map.puddles) {
        const pd = Math.hypot(p.x - cx, p.z - cz);
        mud = Math.max(mud, 1 - smoothstep(p.r * 0.8, p.r * 1.7, pd));
      }
      if (mud > 0) c.lerp(c2.set(MUD), mud);
      const edge = smoothstep(PLAY_RADIUS - 6, PLAY_RADIUS + 14, d);
      if (edge > 0) c.lerp(c2.set(DEEP), edge * 0.85);
      c.multiplyScalar(0.95 + r * 0.1);
    };
    for (let j = 0; j < cells; j++) {
      for (let i = 0; i < cells; i++) {
        const x0 = -MAP_HALF + i * GRID_CELL;
        const z0 = -MAP_HALF + j * GRID_CELL;
        const x1 = x0 + GRID_CELL;
        const z1 = z0 + GRID_CELL;
        const k = j * GRID_N + i;
        const h00 = h[k] as number;
        const h10 = h[k + 1] as number;
        const h01 = h[k + GRID_N] as number;
        const h11 = h[k + GRID_N + 1] as number;
        // Triangle A: (0,0) (0,1) (1,0) — matches GameMap.heightAt (u + v <= 1).
        faceColor(x0 + GRID_CELL * 0.33, z0 + GRID_CELL * 0.33, (Math.abs(h10 - h00) + Math.abs(h01 - h00)) / GRID_CELL, 0);
        put(x0, h00, z0);
        put(x0, h01, z1);
        put(x1, h10, z0);
        // Triangle B: (1,0) (0,1) (1,1)
        faceColor(x0 + GRID_CELL * 0.66, z0 + GRID_CELL * 0.66, (Math.abs(h11 - h01) + Math.abs(h11 - h10)) / GRID_CELL, 31);
        put(x1, h10, z0);
        put(x0, h01, z1);
        put(x1, h11, z1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    this.group.add(mesh);

    this.water = new THREE.MeshPhongMaterial({
      color: 0x243a4c,
      specular: 0xb8a8d8,
      shininess: 90,
      transparent: true,
      opacity: 0.86,
    });
    for (const p of map.puddles) {
      const g = new THREE.CircleGeometry(p.r * 1.25, 11);
      g.rotateX(-Math.PI / 2);
      const pa = g.getAttribute('position');
      for (let i = 1; i < pa.count; i++) {
        const k = 0.82 + hash2(i * 13 + Math.floor(p.x), Math.floor(p.z)) * 0.3;
        pa.setX(i, pa.getX(i) * k);
        pa.setZ(i, pa.getZ(i) * k);
      }
      const m = new THREE.Mesh(g, this.water);
      m.position.set(p.x, p.y, p.z);
      m.renderOrder = 1;
      this.group.add(m);
    }
  }

  /** Night makes the water darker and glossier. */
  setNight(k: number): void {
    this.water.color.set(0x243a4c).lerp(NIGHT_WATER, k);
  }
}
