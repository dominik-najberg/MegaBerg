import * as THREE from 'three';
import { GRID_CELL, GRID_N, MAP_HALF, type GameMap } from '../sim/terrain';

/**
 * Ground-hugging decals.
 *
 * A flat disc laid on the terrain only touches it at its centre: on a bumpy forest floor the rest of the
 * disc dives under the hills and floats over the hollows, so rings and zones look cut to pieces. Materials
 * patched here move every vertex in the vertex shader onto the same heightmap triangles the terrain mesh
 * uses, keeping the height the mesh's centre has above the ground. Geometry must be finely enough
 * tessellated for this to work: a triangle wider than a terrain cell still cuts through ridges.
 */

const heights = new THREE.DataTexture(new Float32Array(GRID_N * GRID_N), GRID_N, GRID_N, THREE.RedFormat, THREE.FloatType);
heights.minFilter = THREE.NearestFilter;
heights.magFilter = THREE.NearestFilter;
heights.generateMipmaps = false;

const uniforms = {
  uGroundH: { value: heights as THREE.Texture },
  // origin (world x/z of texel 0), cell size, texels per side
  uGroundGrid: { value: new THREE.Vector3(-MAP_HALF, GRID_CELL, GRID_N) },
};

/** Uploads the heightmap of a new map; every ground decal follows it from the next frame on. */
export function setGroundMap(map: GameMap): void {
  (heights.image.data as Float32Array).set(map.heights);
  heights.needsUpdate = true;
}

const GLSL = /* glsl */ `
uniform sampler2D uGroundH;
uniform vec3 uGroundGrid;
// Same interpolation as GameMap.heightAt: two triangles per cell split along u + v = 1.
float mbGroundAt(vec2 p) {
  vec2 f = clamp((p - uGroundGrid.x) / uGroundGrid.y, vec2(0.0), vec2(uGroundGrid.z - 1.001));
  ivec2 c = ivec2(floor(f));
  vec2 uv = f - vec2(c);
  float h00 = texelFetch(uGroundH, c, 0).r;
  float h10 = texelFetch(uGroundH, c + ivec2(1, 0), 0).r;
  float h01 = texelFetch(uGroundH, c + ivec2(0, 1), 0).r;
  float h11 = texelFetch(uGroundH, c + ivec2(1, 1), 0).r;
  if (uv.x + uv.y <= 1.0) return h00 + (h10 - h00) * uv.x + (h01 - h00) * uv.y;
  return h11 + (h01 - h11) * (1.0 - uv.x) + (h10 - h11) * (1.0 - uv.y);
}
`;

const PROJECT = /* glsl */ `
vec4 mvPosition = vec4(transformed, 1.0);
vec4 mbCentre = vec4(0.0, 0.0, 0.0, 1.0);
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
  mbCentre = instanceMatrix * mbCentre;
#endif
vec4 mbWorld = modelMatrix * mvPosition;
mbCentre = modelMatrix * mbCentre;
// Keep the centre's lift above the ground, measured from the ground under each vertex instead.
mbWorld.y = mbGroundAt(mbWorld.xz) + (mbCentre.y - mbGroundAt(mbCentre.xz));
mvPosition = viewMatrix * mbWorld;
gl_Position = projectionMatrix * mvPosition;
`;

/** Patches a flat, horizontally laid material so its mesh drapes over the terrain. Returns the material. */
export function groundDecal<M extends THREE.Material>(mat: M): M {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${GLSL}`).replace('#include <project_vertex>', PROJECT);
  };
  mat.customProgramCacheKey = () => 'mb-ground-decal';
  // A decal shares the plane of the ground it hugs; pull it forward in depth instead of lifting it more.
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -2;
  return mat;
}

/** A disc of radius 1 on the XZ plane, split into rings so it can bend over the terrain. */
export function groundDisc(segments = 40, rings = 10): THREE.BufferGeometry {
  return new THREE.RingGeometry(0, 1, segments, rings).rotateX(-Math.PI / 2);
}
