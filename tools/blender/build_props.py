"""
Builds the scenery models of MegaBerg in Blender and writes them in the game's own tiny format.

    blender -b --factory-startup --python tools/blender/build_props.py -- [--preview DIR]

Output: src/assets/models/props.bin + props.json
  - every model is a triangle soup (flat shaded in the game), Y up, metres, origin on the ground
  - per vertex: position (3 x float32) and colour (4 x uint8: sRGB colour with ambient occlusion
    already multiplied in, alpha = how much the vertex sways in the wind)

Blender is used for what it is good at: icospheres, convex hulls, BVH ray casting for the ambient
occlusion bake, and Workbench renders of the result (--preview) for judging the models by eye.
"""

import bpy
import bmesh
import json
import math
import os
import random
import struct
import sys
from mathutils import Vector, Matrix, Euler, noise
from mathutils.bvhtree import BVHTree

TAU = math.pi * 2
V = Vector


# ----------------------------------------------------------------------------- colour helpers

def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin_to_srgb(c):
    c = max(0.0, min(1.0, c))
    return c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def hexc(h):
    """0xRRGGBB (sRGB) -> linear rgb tuple."""
    return (srgb_to_lin(((h >> 16) & 255) / 255), srgb_to_lin(((h >> 8) & 255) / 255), srgb_to_lin((h & 255) / 255))


def mixc(a, b, t):
    t = max(0.0, min(1.0, t))
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)


def mulc(a, k):
    return (a[0] * k, a[1] * k, a[2] * k)


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# ----------------------------------------------------------------------------- triangle soup

class Soup:
    """Triangles with a colour per corner and a wind weight per corner."""

    def __init__(self, seed=1):
        self.P = []  # Vector per corner
        self.C = []  # linear rgb per corner
        self.W = []  # wind weight per corner
        self.rng = random.Random(seed)

    def tri(self, a, b, c, col, w=0.0, inside=None, jitter=0.07):
        """Adds a triangle. `inside` is any point behind the face: the winding is fixed to face away from it."""
        wa, wb, wc = (w, w, w) if not isinstance(w, tuple) else w
        if inside is not None:
            n = (b - a).cross(c - a)
            if n.dot((a + b + c) / 3 - inside) < 0:
                b, c = c, b
                wb, wc = wc, wb
        k = 1 + (self.rng.random() - 0.5) * 2 * jitter
        col = mulc(col, k)
        self.P += [a.copy(), b.copy(), c.copy()]
        self.C += [col, col, col]
        self.W += [wa, wb, wc]

    def quad(self, a, b, c, d, col, w=0.0, inside=None, jitter=0.07):
        wa, wb, wc, wd = (w, w, w, w) if not isinstance(w, tuple) else w
        self.tri(a, b, c, col, (wa, wb, wc), inside, jitter)
        self.tri(a, c, d, col, (wa, wc, wd), inside, jitter)

    def tris(self):
        return len(self.P) // 3

    # ------------------------------------------------------------------ primitives

    def box(self, centre, size, col, rot=(0, 0, 0), w=0.0, jitter=0.07):
        m = Matrix.Translation(V(centre)) @ Euler(rot, 'YXZ').to_matrix().to_4x4()
        hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2
        c = [m @ V((x, y, z)) for x in (-hx, hx) for y in (-hy, hy) for z in (-hz, hz)]
        mid = m @ V((0, 0, 0))
        for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)):
            self.quad(c[f[0]], c[f[1]], c[f[2]], c[f[3]], col, w, mid, jitter)

    def tube(self, pts, radii, sides, col, w=0.0, cap=True, rough=0.0, phase=0.0, jitter=0.08, squash=1.0):
        """
        Swept tube through `pts`. `col` is a colour or fn(ring, side) -> colour;
        `w` is a wind weight or fn(ring) -> weight; `radii` a list as long as pts.
        """
        colf = col if callable(col) else (lambda i, k: col)
        wf = w if callable(w) else (lambda i: w)
        rings = []
        prev = None
        for i, p in enumerate(pts):
            if i == 0:
                t = pts[1] - pts[0]
            elif i == len(pts) - 1:
                t = pts[-1] - pts[-2]
            else:
                t = pts[i + 1] - pts[i - 1]
            t = t.normalized()
            if prev is None:
                ref = V((1, 0, 0)) if abs(t.x) < 0.9 else V((0, 0, 1))
                n = (ref - t * ref.dot(t)).normalized()
            else:
                n = (prev - t * prev.dot(t)).normalized()
            b = t.cross(n)
            prev = n
            ring = []
            for k in range(sides):
                a = TAU * k / sides + phase
                r = radii[i] * (1 + (self.rng.uniform(-rough, rough) if rough else 0))
                ring.append(p + (n * math.cos(a) + b * math.sin(a) * squash) * r)
            rings.append(ring)
        for i in range(len(rings) - 1):
            w0, w1 = wf(i), wf(i + 1)
            inside = (pts[i] + pts[i + 1]) / 2
            for k in range(sides):
                a = rings[i][k]
                b2 = rings[i][(k + 1) % sides]
                c = rings[i + 1][(k + 1) % sides]
                d = rings[i + 1][k]
                self.quad(a, b2, c, d, colf(i, k), (w0, w0, w1, w1), inside, jitter)
        if cap:
            tip = pts[-1] + (pts[-1] - pts[-2]).normalized() * radii[-1] * 0.6
            wl = wf(len(pts) - 1)
            for k in range(sides):
                self.tri(rings[-1][k], rings[-1][(k + 1) % sides], tip, colf(len(pts) - 1, k), wl, pts[-1], jitter)

    def blob(self, centre, rad, col_top, col_bot, sub=2, namp=0.22, nfreq=0.9, w=0.8, jitter=0.1, squash_bottom=0.0):
        """Noise-displaced icosphere: a clump of leaves. Lighter on top, darker underneath."""
        verts, faces = ico(sub)
        off = V((self.rng.uniform(-50, 50), self.rng.uniform(-50, 50), self.rng.uniform(-50, 50)))
        centre = V(centre)
        pts = []
        for v in verts:
            d = noise.noise(v * nfreq * 2.2 + off)
            p = v * (1 + d * namp * 2.0)
            if squash_bottom and p.y < 0:
                p.y *= 1 - squash_bottom
            pts.append(centre + V((p.x * rad[0], p.y * rad[1], p.z * rad[2])))
        wf = w if callable(w) else (lambda p: w)
        for f in faces:
            a, b, c = pts[f[0]], pts[f[1]], pts[f[2]]
            n = (b - a).cross(c - a).normalized()
            if n.dot((a + b + c) / 3 - centre) < 0:
                n = -n
            t = smooth(n.y * 0.6 + 0.5)
            self.tri(a, b, c, mixc(col_bot, col_top, t), (wf(a), wf(b), wf(c)), centre, jitter)

    def hull(self, points, col, w=0.0, jitter=0.1):
        """Convex hull of the points; `col` is a colour or fn(normal, centroid) -> colour."""
        verts, faces = convex_hull(points)
        mid = sum(verts, V((0, 0, 0))) / len(verts)
        colf = col if callable(col) else (lambda n, c: col)
        for f in faces:
            a, b, c = verts[f[0]], verts[f[1]], verts[f[2]]
            n = (b - a).cross(c - a)
            if n.length < 1e-9:
                continue
            n.normalize()
            cen = (a + b + c) / 3
            if n.dot(cen - mid) < 0:
                n = -n
            self.tri(a, b, c, colf(n, cen), w, mid, jitter)

    def merge(self, other, m=None):
        for p, c, w in zip(other.P, other.C, other.W):
            self.P.append((m @ p) if m is not None else p.copy())
            self.C.append(c)
            self.W.append(w)

    # ------------------------------------------------------------------ ambient occlusion

    def bake_ao(self, dist=2.5, rays=40, floor=0.3, ground=True, power=0.9):
        """Darkens every corner by how much of the hemisphere above it is blocked by the model (or the ground)."""
        verts = [p.copy() for p in self.P]
        polys = [(i, i + 1, i + 2) for i in range(0, len(verts), 3)]
        if ground:
            g = len(verts)
            verts += [V((-80, -0.02, -80)), V((80, -0.02, -80)), V((80, -0.02, 80)), V((-80, -0.02, 80))]
            polys += [(g, g + 2, g + 1), (g, g + 3, g + 2)]
        tree = BVHTree.FromPolygons(verts, polys, all_triangles=True)
        rng = random.Random(7)
        dirs = []
        for i in range(rays):
            u = (i + 0.5) / rays
            ph = i * 2.399963
            r = math.sqrt(u)
            dirs.append(V((r * math.cos(ph), math.sqrt(1 - u), r * math.sin(ph))))  # cosine weighted around +Y
        up = V((0, 1, 0))
        for t in range(0, len(self.P), 3):
            a, b, c = self.P[t], self.P[t + 1], self.P[t + 2]
            n = (b - a).cross(c - a)
            if n.length < 1e-10:
                continue
            n.normalize()
            cen = (a + b + c) / 3
            q = up.rotation_difference(n).to_matrix()
            spin = Matrix.Rotation(rng.random() * TAU, 3, 'Y')
            for j in range(3):
                p = self.P[t + j]
                o = p + (cen - p) * 0.12 + n * 0.02
                hit = 0.0
                for d in dirs:
                    wd = q @ (spin @ d)
                    loc, _, _, dd = tree.ray_cast(o, wd, dist)
                    if loc is not None:
                        hit += 1 - (dd / dist) * 0.6
                ao = max(0.0, 1 - hit / rays)
                k = floor + (1 - floor) * (ao ** power)
                self.C[t + j] = mulc(self.C[t + j], k)


_ico_cache = {}


def ico(sub):
    if sub not in _ico_cache:
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0)
        bmesh.ops.triangulate(bm, faces=bm.faces[:])
        bm.verts.ensure_lookup_table()
        _ico_cache[sub] = ([v.co.copy() for v in bm.verts], [tuple(v.index for v in f.verts) for f in bm.faces])
        bm.free()
    return _ico_cache[sub]


def convex_hull(points):
    bm = bmesh.new()
    for p in points:
        bm.verts.new(p)
    bmesh.ops.convex_hull(bm, input=bm.verts[:])
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    used = sorted({v for f in bm.faces for v in f.verts}, key=lambda v: v.index)
    remap = {v: i for i, v in enumerate(used)}
    verts = [v.co.copy() for v in used]
    faces = [tuple(remap[v] for v in f.verts) for f in bm.faces]
    bm.free()
    return verts, faces


# ----------------------------------------------------------------------------- trees

BARK = hexc(0x5c4230)
BARK_DARK = hexc(0x402e22)


def fir(seed, lod=0):
    """Spruce: many ragged, drooping skirts of boughs; dark inside, the bough tips catch the light."""
    s = Soup(seed)
    r = s.rng
    H = r.uniform(9.4, 11.4)
    lean = V((r.uniform(-0.35, 0.35), 0, r.uniform(-0.35, 0.35)))
    sides = 5 if lod else 7
    pts = [V((0, -0.4, 0)), V((0, 0.45, 0)), lean * 0.3 + V((0, H * 0.35, 0)), lean * 0.7 + V((0, H * 0.7, 0)), lean + V((0, H * 0.96, 0))]
    s.tube(pts, [0.7, 0.46, 0.35, 0.2, 0.05], sides, lambda i, k: mixc(BARK_DARK, hexc(0x6a4a34), r.random()), lambda i: [0, 0, 0.1, 0.3, 0.6][i], rough=0.06)
    n = 6 if lod else 11
    dark = hexc(0x1c4a30)
    mid = hexc(0x2f6a3c)
    tipc = hexc(0x8ab84c)
    under = hexc(0x122a1c)
    for i in range(n):
        t = i / (n - 1)
        y = lerp(1.7, H * 0.9, t ** 0.9)
        R = lerp(3.5, 0.55, t ** 0.78) * r.uniform(0.9, 1.1)
        h = lerp(1.55, 0.85, t)
        lobes = max(4, round(lerp(6 if lod else 9, 4 if lod else 5, t)))
        droop = lerp(0.85, 0.25, t)
        axis = lean * (y / (H * 0.96))
        rot = r.random() * TAU
        body = mixc(dark, mid, t * 0.7 + r.uniform(-0.08, 0.12))
        light = mixc(mid, tipc, 0.4 + t * 0.35 + r.uniform(-0.1, 0.1))
        wind = lerp(0.3, 1.0, t)
        m = 2 * lobes
        top = []
        mdl = []
        out = []
        rt = max(0.07, R * 0.1)
        for k in range(m):
            a = k * math.pi / lobes + rot + r.uniform(-0.08, 0.08)
            ca, sa = math.cos(a), math.sin(a)
            top.append(axis + V((ca * rt, y + h, sa * rt)))
            tip = k % 2 == 0
            rr = R * (r.uniform(0.9, 1.2) if tip else r.uniform(0.46, 0.62))
            yy = y - (droop * r.uniform(0.75, 1.3) if tip else droop * 0.12)
            o = axis + V((ca * rr, yy, sa * rr))
            out.append(o)
            # the bough bulges outwards half way down before it droops
            mdl.append(axis + V((ca * rr * 0.6, lerp(y + h, yy, 0.42) + (0.16 if tip else 0.0), sa * rr * 0.6)))
        inside = axis + V((0, y + h * 0.3, 0))
        for k in range(m):
            k1 = (k + 1) % m
            shade = 1.1 if k % 2 == 0 else 0.84
            if lod:
                s.quad(top[k], top[k1], out[k1], out[k], mulc(mixc(body, light, 0.4), shade), (wind * 0.25, wind * 0.25, wind, wind), inside, 0.1)
            else:
                s.quad(top[k], top[k1], mdl[k1], mdl[k], mulc(body, shade), (wind * 0.25, wind * 0.25, wind * 0.6, wind * 0.6), inside, 0.1)
                s.quad(mdl[k], mdl[k1], out[k1], out[k], mulc(light, shade), (wind * 0.6, wind * 0.6, wind, wind), inside, 0.1)
                s.tri(inside, out[k], out[k1], under, (wind * 0.2, wind, wind), axis + V((0, y + h, 0)), 0.1)
    tip = lean + V((0, H + 1.0, 0))
    base = lean + V((0, H * 0.9, 0))
    for k in range(5):
        a0 = k * TAU / 5
        a1 = (k + 1) * TAU / 5
        s.tri(base + V((math.cos(a0) * 0.3, 0, math.sin(a0) * 0.3)), base + V((math.cos(a1) * 0.3, 0, math.sin(a1) * 0.3)), tip, tipc, (0.8, 0.8, 1.0), base, 0.1)
    return s


def pine(seed, lod=0):
    """Scots pine: tall bare trunk going from grey to red-orange bark, the crown in flat layered plates."""
    s = Soup(seed)
    r = s.rng
    H = r.uniform(11.0, 13.5)
    grey = hexc(0x54403a)
    orange = hexc(0xb5622f)
    bend = V((r.uniform(-0.8, 0.8), 0, r.uniform(-0.8, 0.8)))
    seg = 6
    pts = [V((0, -0.4, 0))]
    rad = [0.64]
    for i in range(1, seg + 1):
        t = i / seg
        pts.append(bend * (math.sin(t * math.pi) * 0.5 + t * 0.4) + V((0, 0.5 + t * (H - 0.5), 0)))
        rad.append(lerp(0.42, 0.14, t))
    s.tube(pts, rad, 5 if lod else 7, lambda i, k: mixc(grey, orange, smooth((i - 1.0) / 2.6) + r.uniform(-0.12, 0.12)), lambda i: (i / seg) ** 2 * 0.5, rough=0.05)
    top = pts[-1]
    dark = hexc(0x1f4a34)
    light = hexc(0x5c9650)
    # dead stubs on the bare trunk
    if not lod:
        for i in range(4):
            t = r.uniform(0.3, 0.68)
            p = pts[0].lerp(top, t)
            a = r.random() * TAU
            d = V((math.cos(a), 0.25, math.sin(a)))
            s.tube([p, p + d * r.uniform(0.6, 1.2)], [0.07, 0.03], 4, BARK_DARK, 0.2)
    limbs = 3 if lod else 6
    sub = 1 if lod else 2
    for i in range(limbs):
        a = i * TAU / limbs * 1.9 + r.uniform(-0.4, 0.4)
        start = pts[0].lerp(top, lerp(0.74, 0.93, i / max(1, limbs - 1)))
        reach = r.uniform(1.8, 2.9)
        end = start + V((math.cos(a) * reach, r.uniform(0.4, 1.0), math.sin(a) * reach))
        mid = start.lerp(end, 0.5) + V((0, 0.35, 0))
        s.tube([start, mid, end], [0.13, 0.09, 0.05], 4 if lod else 5, orange, lambda j: 0.4 + j * 0.25)
        rr = r.uniform(1.7, 2.4)
        s.blob(end + V((0, 0.25, 0)), (rr, r.uniform(0.5, 0.68), rr * r.uniform(0.85, 1.0)), mixc(light, hexc(0x78a84e), r.random() * 0.5), dark, sub, 0.2, 0.9, 0.9, 0.12, 0.55)
    s.blob(top + V((0, 0.7, 0)), (2.7, 0.8, 2.6), light, dark, sub, 0.2, 0.9, 1.0, 0.12, 0.5)
    if not lod:
        s.blob(top + V((r.uniform(-0.5, 0.5), 1.45, r.uniform(-0.5, 0.5))), (1.6, 0.55, 1.5), hexc(0x78a84e), dark, 1, 0.2, 0.9, 1.0, 0.12, 0.5)
    return s


def oak(seed, lod=0, scale=1.0):
    s = Soup(seed)
    r = s.rng
    bark = hexc(0x4e3a2e)
    bark2 = hexc(0x3a2a22)
    lean = V((r.uniform(-0.3, 0.3), 0, r.uniform(-0.3, 0.3)))
    sides = 6 if lod else 9
    pts = [V((0, -0.4, 0)), V((0, 0.3, 0)), V((0, 1.4, 0)) + lean * 0.3, V((0, 3.0, 0)) + lean * 0.7, V((0, 4.3, 0)) + lean]
    s.tube(pts, [1.3, 0.92, 0.7, 0.62, 0.5], sides, lambda i, k: mixc(bark2, bark, r.random()), 0.0, rough=0.09)
    if not lod:
        for i in range(5):
            a = i * TAU / 5 + r.uniform(-0.3, 0.3)
            d = V((math.cos(a), 0, math.sin(a)))
            s.tube([d * 0.6 + V((0, 0.5, 0)), d * 1.3 + V((0, 0.12, 0)), d * 2.0 + V((0, -0.3, 0))], [0.34, 0.24, 0.1], 5, bark2, 0.0, rough=0.08)
    fork = pts[-1]
    top = hexc(0x6a9a40)
    mid = hexc(0x457234)
    low = hexc(0x234626)
    limbs = 4 if lod else 5
    ends = []
    for i in range(limbs):
        a = i * TAU / limbs + r.uniform(-0.35, 0.35)
        reach = r.uniform(2.2, 3.2)
        start = fork + V((0, r.uniform(-0.9, 0.0), 0))
        end = start + V((math.cos(a) * reach, r.uniform(1.2, 2.2), math.sin(a) * reach))
        m = start.lerp(end, 0.5) + V((0, 0.5, 0))
        s.tube([start, m, end], [0.3, 0.2, 0.1], 4 if lod else 6, bark, lambda j: j * 0.25, rough=0.06)
        ends.append(end)
    s.tube([fork, fork + V((0.2, 1.6, -0.1)), fork + V((0.1, 3.0, 0.2))], [0.42, 0.26, 0.12], 4 if lod else 6, bark, lambda j: j * 0.25)
    sub = 1 if lod else 2
    for e in ends:
        rr = r.uniform(1.8, 2.4)
        s.blob(e + V((0, 0.5, 0)), (rr, rr * 0.78, rr), mixc(mid, top, r.random()), low, sub, 0.24, 0.85, 0.8, 0.12, 0.3)
    s.blob(fork + V((0.1, 3.4, 0.1)), (2.7, 2.1, 2.7), top, low, sub, 0.24, 0.8, 0.9, 0.12, 0.25)
    if not lod:
        for i in range(2):
            a = r.random() * TAU
            s.blob(fork + V((math.cos(a) * 1.9, r.uniform(2.2, 3.4), math.sin(a) * 1.9)), (1.6, 1.25, 1.6), top, mid, 1, 0.25, 0.9, 0.95, 0.12)
    return s


def birch(seed, lod=0):
    s = Soup(seed)
    r = s.rng
    white = hexc(0xe4dfd0)
    black = hexc(0x2a2522)
    H = r.uniform(8.2, 9.8)
    bend = V((r.uniform(-0.9, 0.9), 0, r.uniform(-0.9, 0.9)))
    seg = 8
    pts = [V((0, -0.3, 0))]
    rad = [0.42]
    for i in range(1, seg + 1):
        t = i / seg
        pts.append(bend * (t * t) + V((0, 0.3 + t * (H - 0.3), 0)))
        rad.append(lerp(0.27, 0.05, t))

    def bark_col(i, k):
        if i == 0:
            return mixc(black, white, 0.25)
        return black if r.random() < 0.2 else mulc(white, r.uniform(0.86, 1.0))

    s.tube(pts, rad, 5 if lod else 6, bark_col, lambda i: (i / seg) ** 2 * 0.7, rough=0.04, jitter=0.03)
    cols = [hexc(0x6f9438), hexc(0x8aa843), hexc(0x9db34a), hexc(0x7b9c3c)]
    low = hexc(0x41602a)
    n = 5 if lod else 9
    for i in range(n):
        t = r.uniform(0.45, 1.0)
        start = pts[0].lerp(pts[-1], t) if t < 0.99 else pts[-1]
        idx = min(seg, int(t * seg))
        start = pts[idx]
        a = i * TAU / n * 2.4 + r.uniform(-0.3, 0.3)
        reach = lerp(2.1, 0.9, t) * r.uniform(0.8, 1.15)
        end = start + V((math.cos(a) * reach, r.uniform(0.3, 1.0), math.sin(a) * reach))
        if not lod:
            s.tube([start, start.lerp(end, 0.6) + V((0, 0.35, 0)), end], [0.07, 0.05, 0.025], 4, mixc(white, black, 0.55), lambda j: 0.5 + j * 0.2, cap=False)
        rr = r.uniform(0.85, 1.3)
        s.blob(end + V((0, -0.25, 0)), (rr, rr * r.uniform(1.15, 1.5), rr), r.choice(cols), low, 1, 0.26, 1.0, 1.0, 0.13)
    s.blob(pts[-1] + V((0, 0.4, 0)), (1.0, 1.4, 1.0), cols[2], low, 1, 0.25, 1.0, 1.0, 0.13)
    return s


def bush(seed):
    """Leafy shrub: clumps with pointed leaves poking out; every other one carries bunches of red berries."""
    s = Soup(seed)
    r = s.rng
    top = hexc(0x55863a)
    low = hexc(0x234220)
    leaf = hexc(0x7fa844)
    berry = hexc(0xd2301f)
    verts, faces = ico(0)
    for i in range(4):
        a = i * TAU / 4 + r.uniform(-0.4, 0.4)
        d = r.uniform(0.0, 0.6)
        rr = r.uniform(0.48, 0.8)
        c = V((math.cos(a) * d, rr * 0.75, math.sin(a) * d))
        s.blob(c, (rr, rr * 0.85, rr), mixc(top, hexc(0x6a8c3c), r.random() * 0.6), low, 1, 0.28, 1.1, 0.7, 0.12, 0.3)
        for b in range(9):
            u = V((r.uniform(-1, 1), r.uniform(0.0, 1), r.uniform(-1, 1))).normalized()
            p = c + V((u.x * rr, u.y * rr * 0.85, u.z * rr)) * 0.92
            side = u.cross(V((0, 1, 0)))
            side = side.normalized() if side.length > 1e-3 else V((1, 0, 0))
            L = r.uniform(0.2, 0.32)
            tipp = p + u * L + V((0, r.uniform(-0.06, 0.08), 0))
            col = mixc(top, leaf, r.uniform(0.4, 1.0))
            s.tri(p - side * 0.09, p + side * 0.09, tipp, col, (0.6, 0.6, 1.0), c, 0.08)
            s.tri(p + side * 0.09, p - side * 0.09, tipp, mulc(col, 0.8), (0.6, 0.6, 1.0), c + u * 3, 0.08)
        if seed % 2 == 0:
            for b in range(4):
                u = V((r.uniform(-1, 1), r.uniform(0.1, 1), r.uniform(-1, 1))).normalized()
                bc = c + V((u.x * rr, u.y * rr * 0.85, u.z * rr)) * 1.03
                for q in range(r.choice((2, 3))):
                    cc = bc + V((r.uniform(-0.09, 0.09), r.uniform(-0.09, 0.05), r.uniform(-0.09, 0.09)))
                    for f in faces:
                        s.tri(cc + verts[f[0]] * 0.085, cc + verts[f[1]] * 0.085, cc + verts[f[2]] * 0.085, berry, 0.7, cc, 0.05)
    return s


# ----------------------------------------------------------------------------- stones

STONE = hexc(0x726c7c)
STONE2 = hexc(0x8a8290)
MOSS = hexc(0x5a8236)
LICHEN = hexc(0x8a8660)
RUNE = hexc(0xe6dcc0)


def stone_col(rng, moss_from=0.45, lichen=0.25, base=STONE, base2=STONE2):
    def f(n, c):
        col = mixc(base, base2, rng.random())
        if n.y > moss_from:
            return mixc(col, MOSS, 0.85)
        if n.y > 0.2 and rng.random() < lichen:
            return mixc(col, LICHEN, 0.6)
        if n.y < -0.1:
            return mulc(col, 0.7)
        return col
    return f


def rock(seed):
    s = Soup(seed)
    r = s.rng

    def lump(c, rx, ry, rz, n):
        pts = []
        for i in range(n):
            u = V((r.uniform(-1, 1), r.uniform(-0.35, 1), r.uniform(-1, 1))).normalized()
            k = r.uniform(0.72, 1.0)
            pts.append(V(c) + V((u.x * rx * k, max(-0.12, u.y * ry * k), u.z * rz * k)))
        s.hull(pts, stone_col(r))

    lump((0, 0.05, 0), 1.0, r.uniform(0.7, 1.0), 0.9, 20)
    a = r.random() * TAU
    lump((math.cos(a) * 0.75, 0, math.sin(a) * 0.75), 0.55, 0.5, 0.5, 12)
    if seed % 2:
        a += 2.3
        lump((math.cos(a) * 0.7, 0, math.sin(a) * 0.7), 0.42, 0.34, 0.45, 10)
    return s


def rune(s, kind, at, a=0.29, b=0.41, th=0.05):
    """
    A carved Slavic sign as a flat decal. `at(u, v)` maps face coordinates (u across, v up, metres from the
    middle of the face) to a point just above the stone. kind 0: the sown field (a rhombus quartered, a seed in
    every quarter); kind 1: a rhombus within a rhombus with hooked corners.
    """
    def bar(p, q, t=th):
        d = V((q[0] - p[0], q[1] - p[1], 0))
        n = V((-d.y, d.x, 0)).normalized() * (t / 2)
        e = d.normalized() * (t / 2)
        c = [at(p[0] - e.x + n.x, p[1] - e.y + n.y), at(q[0] + e.x + n.x, q[1] + e.y + n.y), at(q[0] + e.x - n.x, q[1] + e.y - n.y), at(p[0] - e.x - n.x, p[1] - e.y - n.y)]
        s.quad(c[0], c[1], c[2], c[3], RUNE, 0.0, at(0, 0, -0.5), 0.03)

    def diamond(u, v, k):
        c = [at(u, v + k * 1.3), at(u + k, v), at(u, v - k * 1.3), at(u - k, v)]
        s.quad(c[0], c[1], c[2], c[3], RUNE, 0.0, at(0, 0, -0.5), 0.03)

    T, R, B, L = (0, b), (a, 0), (0, -b), (-a, 0)
    for p, q in ((T, R), (R, B), (B, L), (L, T)):
        bar(p, q)
    if kind == 0:
        bar((-a / 2, b / 2), (a / 2, -b / 2))
        bar((a / 2, b / 2), (-a / 2, -b / 2))
        for u, v in ((0, b / 2), (a / 2, 0), (0, -b / 2), (-a / 2, 0)):
            diamond(u, v, 0.028)
        for u, v in ((0, b + 0.09), (0, -b - 0.09), (a + 0.07, 0), (-a - 0.07, 0)):
            diamond(u, v, 0.034)
    else:
        k = 0.45
        for p, q in ((T, R), (R, B), (B, L), (L, T)):
            bar((p[0] * k, p[1] * k), (q[0] * k, q[1] * k), th * 0.85)
        diamond(0, 0, 0.03)
        # hooks: every side runs on past the corner
        for (p, q) in ((T, R), (R, B), (B, L), (L, T)):
            bar(q, (q[0] + (q[0] - p[0]) * 0.3, q[1] + (q[1] - p[1]) * 0.3))


def menhir(seed, kind=0):
    """
    Standing stone: a tapering slab with chamfered edges and a chiselled top, a moss cap, moss creeping up from
    the ground and a carved sign on both broad faces (local +Z and -Z).
    """
    s = Soup(seed)
    r = s.rng
    H = r.uniform(3.3, 3.9)
    base, base2, shade = hexc(0x857a80), hexc(0x9c9094), hexc(0x5c5460)
    y0, y1 = 1.1, 2.7  # between these heights the broad faces are flat, so the carving lies flush
    # (height, half width, half depth, how crooked)
    prof = [(-0.3, 0.80, 0.52, 1.0), (0.45, 0.76, 0.50, 1.0), (y0, 0.70, 0.46, 0.0), (y1, 0.56, 0.36, 0.0), (H - 0.35, 0.46, 0.29, 1.0), (H, 0.30, 0.19, 1.0)]
    slant = r.uniform(-0.22, 0.22)
    rings = []
    for y, w, d, j in prof:
        c = 0.13 * (w / 0.7)
        ring = []
        for x, z in ((-(w - c), d), (w - c, d), (w, d - c), (w, -(d - c)), (w - c, -d), (-(w - c), -d), (-w, -(d - c)), (-w, d - c)):
            jj = 0.05 * j
            yy = y + (x * slant if y >= H - 0.01 else 0) + r.uniform(-jj, jj)
            ring.append(V((x + r.uniform(-jj, jj), yy, z + r.uniform(-jj, jj))))
        rings.append(ring)
    axis = [V((0, y, 0)) for y, _, _, _ in prof]
    moss_top = H - r.uniform(0.5, 0.9)

    def col(n, cen):
        c = mixc(base, base2, r.random())
        if n.y > 0.35 or (cen.y > moss_top and r.random() < 0.75):
            return mixc(c, MOSS, 0.9)
        if cen.y < 0.55 and r.random() < 0.6:
            return mixc(c, MOSS, 0.75)
        if abs(n.z) < 0.5:
            c = mixc(c, shade, 0.45)  # the narrow sides are darker, weathered stone
        if r.random() < 0.18:
            c = mixc(c, LICHEN, 0.5)
        return c

    def face(a, b, c, inside):
        n = (b - a).cross(c - a)
        cen = (a + b + c) / 3
        if n.dot(cen - inside) < 0:
            n = -n
        s.tri(a, b, c, col(n.normalized(), cen), 0.0, inside, 0.08)

    for i in range(len(rings) - 1):
        inside = (axis[i] + axis[i + 1]) / 2
        for k in range(8):
            a, b, c, d = rings[i][k], rings[i][(k + 1) % 8], rings[i + 1][(k + 1) % 8], rings[i + 1][k]
            face(a, b, c, inside)
            face(a, c, d, inside)
    apex = V((r.uniform(-0.12, 0.12), H + 0.22, r.uniform(-0.05, 0.05)))
    for k in range(8):
        s.tri(rings[-1][k], rings[-1][(k + 1) % 8], apex, mixc(mixc(base, base2, r.random()), MOSS, 0.9), 0.0, axis[-1], 0.1)

    # the carving, on both broad faces
    d0, d1 = prof[2][2], prof[3][2]
    ym = (y0 + y1) / 2 + 0.1
    slope = (d0 - d1) / (y1 - y0)
    for sign in (1, -1):
        def at(u, v, lift=0.035, sign=sign):
            # v runs up the tilted face: nearly vertical, leaning in by `slope`
            k = 1 / math.sqrt(1 + slope * slope)
            y = ym + v * k
            z = lerp(d0, d1, (y - y0) / (y1 - y0)) + lift
            return V((u * sign, y, z * sign))
        rune(s, kind, at)

    # moss tufts and small stones wedged at the foot
    for i in range(3):
        a = r.random() * TAU
        c = V((math.cos(a) * 0.75, 0.0, math.sin(a) * 0.55))
        s.hull([c + V((r.uniform(-0.25, 0.25), r.uniform(-0.05, 0.28), r.uniform(-0.25, 0.25))) for _ in range(9)], stone_col(r))
    for i in range(3):
        a = r.random() * TAU
        s.blob(V((math.cos(a) * 0.72, 0.08, math.sin(a) * 0.5)), (0.3, 0.16, 0.26), MOSS, mulc(MOSS, 0.55), 1, 0.25, 1.2, 0.0, 0.1)

    # a little crooked: shear the whole stone, which keeps the carved faces flat
    lean = V((r.uniform(-0.22, 0.22), 0, r.uniform(-0.1, 0.1)))
    for p in s.P:
        t = max(0.0, p.y) / H
        p.x += lean.x * t
        p.z += lean.z * t
    return s


# ----------------------------------------------------------------------------- landmarks

def ancient_oak():
    """The Sacred Oak: a huge, gnarled trunk with a hollow, snaking roots and votive ribbons."""
    s = Soup(404)
    r = s.rng
    bark = hexc(0x40302a)
    bark2 = hexc(0x2a1e1a)
    hollow_a = 1.2  # the hollow faces the trail (local +Z is the front)

    def trunk_col(i, k):
        a = k / 14 * TAU
        if 1 <= i <= 2 and abs(((a - hollow_a + math.pi) % TAU) - math.pi) < 0.45:
            return hexc(0x0d0807)
        return mixc(bark2, bark, r.random())

    pts = [V((0, -0.5, 0)), V((0, 0.4, 0)), V((0.05, 1.6, 0)), V((0.15, 3.2, 0.1)), V((0.1, 5.0, 0.2)), V((0.3, 6.4, 0.2))]
    s.tube(pts, [3.3, 2.5, 2.15, 1.95, 1.8, 1.5], 14, trunk_col, 0.0, rough=0.1, jitter=0.1)
    for i in range(8):
        a = i * TAU / 8 + r.uniform(-0.25, 0.25)
        d = V((math.cos(a), 0, math.sin(a)))
        side = V((-d.z, 0, d.x)) * r.uniform(-0.6, 0.6)
        L = r.uniform(3.0, 4.6)
        s.tube([d * 1.7 + V((0, 0.9, 0)), d * 2.6 + side * 0.4 + V((0, 0.35, 0)), d * (L * 0.8) + side + V((0, 0.1, 0)), d * L + side * 1.4 + V((0, -0.35, 0))],
               [0.75, 0.5, 0.3, 0.1], 6, lambda i2, k: mixc(bark2, bark, r.random()), 0.0, rough=0.08)
    fork = pts[-1]
    top = hexc(0x567c38)
    mid = hexc(0x3a5e2d)
    low = hexc(0x1c351e)
    ends = []
    for i in range(7):
        a = i * TAU / 7 + r.uniform(-0.25, 0.25)
        reach = r.uniform(5.0, 7.2)
        start = fork + V((math.cos(a) * 0.5, r.uniform(-1.6, 0.0), math.sin(a) * 0.5))
        end = start + V((math.cos(a) * reach, r.uniform(2.0, 4.2), math.sin(a) * reach))
        m1 = start.lerp(end, 0.35) + V((0, 0.9, 0))
        m2 = start.lerp(end, 0.7) + V((0, 0.6, 0))
        s.tube([start, m1, m2, end], [0.72, 0.5, 0.32, 0.14], 7, lambda i2, k: mixc(bark2, bark, r.random()), lambda j: j * 0.15, rough=0.07)
        ends.append((m2, end))
    s.tube([fork, fork + V((0.3, 2.6, -0.2)), fork + V((0.0, 5.2, 0.3)), fork + V((0.4, 7.4, 0.0))], [1.1, 0.75, 0.45, 0.18], 7, bark, lambda j: j * 0.15)
    for m2, e in ends:
        rr = r.uniform(3.2, 4.3)
        s.blob(e + V((0, 0.9, 0)), (rr, rr * 0.72, rr), mixc(mid, top, r.random()), low, 3, 0.2, 1.5, 0.75, 0.12, 0.3)
        s.blob(m2 + V((0, 2.0, 0)), (2.6, 1.9, 2.6), mixc(mid, top, r.random()), low, 2, 0.24, 0.9, 0.7, 0.12, 0.3)
    s.blob(fork + V((0.3, 8.6, 0.1)), (5.2, 3.6, 5.2), top, low, 3, 0.2, 1.6, 0.85, 0.12, 0.2)
    for i in range(4):
        a = i * TAU / 4 + 0.6
        s.blob(fork + V((math.cos(a) * 3.6, 6.4, math.sin(a) * 3.6)), (3.0, 2.2, 3.0), top, mid, 2, 0.25, 0.9, 0.85, 0.12, 0.2)
    # votive ribbons tied around the trunk and hanging from the two lowest limbs
    red = hexc(0xb3261e)
    white = hexc(0xe9e2d0)
    for i in range(14):
        a = hollow_a + r.uniform(-1.9, 1.9)
        d = V((math.cos(a), 0, math.sin(a)))
        side = V((-d.z, 0, d.x))
        y = r.uniform(1.6, 2.6)
        p = d * 2.12 + V((0, y, 0))
        L = r.uniform(0.7, 1.4)
        w = 0.07
        col = red if i % 3 else white
        q = [p - side * w, p + side * w, p + side * w + d * 0.12 + V((0, -L, 0)), p - side * w + d * 0.12 + V((0, -L, 0))]
        s.quad(q[0], q[1], q[2], q[3], col, (0.1, 0.1, 1.0, 1.0), p - d, 0.04)
        s.quad(q[0], q[3], q[2], q[1], col, (0.1, 1.0, 1.0, 0.1), p + d * 3, 0.04)
    for i in range(18):
        a = hollow_a + (i / 18 - 0.5) * 4.2
        d0 = V((math.cos(a), 0, math.sin(a)))
        a1 = a + 4.2 / 18
        d1 = V((math.cos(a1), 0, math.sin(a1)))
        y = 2.55 + math.sin(i * 0.7) * 0.06
        s.quad(d0 * 2.14 + V((0, y, 0)), d1 * 2.14 + V((0, y, 0)), d1 * 2.14 + V((0, y + 0.13, 0)), d0 * 2.14 + V((0, y + 0.13, 0)), red if i % 2 else white, 0.0, V((0, y, 0)), 0.03)
    # offering stones and a clay bowl in front of the hollow
    f = V((math.cos(hollow_a), 0, math.sin(hollow_a)))
    for i in range(5):
        c = f * r.uniform(3.0, 3.8) + V((-f.z, 0, f.x)) * r.uniform(-1.2, 1.2)
        s.hull([c + V((r.uniform(-0.3, 0.3), r.uniform(-0.05, 0.3), r.uniform(-0.3, 0.3))) for _ in range(10)], stone_col(r))
    return s


def hut():
    """Baba Yaga's hut standing on two chicken legs. The door (local +Z) faces the visitor."""
    s = Soup(77)
    r = s.rng
    ochre = hexc(0xb8923a)
    scale_dark = hexc(0x8a6a2a)
    claw = hexc(0x2a2018)
    for sx in (-1, 1):
        hip = V((sx * 0.85, 3.25, -0.2))
        knee = V((sx * 1.05, 2.0, -0.95))
        ankle = V((sx * 0.95, 0.75, 0.05))
        foot = V((sx * 0.95, 0.18, 0.15))
        s.tube([hip, hip.lerp(knee, 0.5) + V((0, 0.05, -0.1)), knee, knee.lerp(ankle, 0.5), ankle, foot], [0.42, 0.36, 0.26, 0.2, 0.17, 0.2], 7,
               lambda i, k: scale_dark if (i + k) % 3 == 0 else ochre, 0.0, rough=0.05)
        for ang in (-0.55, 0.0, 0.55, math.pi):
            d = V((math.sin(ang), 0, math.cos(ang)))
            L = 0.7 if ang == math.pi else 1.05
            s.tube([foot, foot + d * (L * 0.5) + V((0, 0.02, 0)), foot + d * L + V((0, -0.1, 0))], [0.15, 0.11, 0.06], 5, lambda i, k: scale_dark if k % 2 else ochre, 0.0)
            s.tube([foot + d * L + V((0, -0.1, 0)), foot + d * (L + 0.28) + V((0, -0.2, 0))], [0.055, 0.012], 4, claw, 0.0)
    logs = [hexc(0x5a3d26), hexc(0x6b472b), hexc(0x4b3220), hexc(0x62432a)]
    W, D, Y0, rows, lh = 3.3, 2.9, 3.2, 6, 0.4
    s.box((0, Y0 - 0.1, 0), (W + 0.2, 0.22, D + 0.2), hexc(0x3a2718))
    for i in range(rows):
        y = Y0 + lh * (i + 0.5)
        o = 0.26 if i % 2 == 0 else 0.0
        col = r.choice(logs)
        s.box((0, y, D / 2), (W + 0.5 + o, lh * 0.94, 0.34), col, jitter=0.1)
        s.box((0, y, -D / 2), (W + 0.5 + o, lh * 0.94, 0.34), r.choice(logs), jitter=0.1)
        s.box((W / 2, y, 0), (0.34, lh * 0.94, D + 0.76 - o), r.choice(logs), jitter=0.1)
        s.box((-W / 2, y, 0), (0.34, lh * 0.94, D + 0.76 - o), r.choice(logs), jitter=0.1)
    top = Y0 + rows * lh
    # door, window with shutters, lintel
    s.box((-0.55, Y0 + 0.85, D / 2 + 0.16), (0.95, 1.7, 0.1), hexc(0x2a1a10))
    s.box((-0.55, Y0 + 1.76, D / 2 + 0.2), (1.2, 0.14, 0.14), hexc(0x7a5632))
    s.box((-0.2, Y0 + 0.85, D / 2 + 0.23), (0.07, 0.07, 0.07), hexc(0xc99a55))
    s.box((0.95, Y0 + 1.25, D / 2 + 0.17), (0.62, 0.62, 0.08), hexc(0xffc45a), jitter=0.0)
    s.box((0.95, Y0 + 1.25, D / 2 + 0.22), (0.06, 0.62, 0.06), hexc(0x3a2516))
    s.box((0.95, Y0 + 1.25, D / 2 + 0.22), (0.62, 0.06, 0.06), hexc(0x3a2516))
    for sx in (-1, 1):
        s.box((0.95 + sx * 0.5, Y0 + 1.25, D / 2 + 0.2), (0.3, 0.74, 0.07), hexc(0x8a3a2a), rot=(sx * 0.5, 0, 0))
    # steep thatched roof in three overlapping courses per side
    thatch = [hexc(0x6a5a34), hexc(0x7a6a3c), hexc(0x5c4e2e)]
    rise, half = 2.7, W / 2 + 0.55
    slope = math.atan2(rise, half)
    Lr = math.hypot(rise, half)
    for sx in (-1, 1):
        for c in range(3):
            # course c runs from t0 to t1 along the slope (0 = eaves, 1 = ridge); upper courses overlap lower ones
            t = (c + 0.5) / 3
            cx = sx * half * (1 - t)
            cy = top + rise * t
            nx, ny = sx * math.sin(slope), math.cos(slope)
            lift = 0.1 + c * 0.05
            s.box((cx + nx * lift, cy + ny * lift, 0), (Lr / 3 + 0.4, 0.2, D + 1.1 - c * 0.12), thatch[c], rot=(0, 0, -sx * slope), jitter=0.12)
    s.box((0, top + rise + 0.12, 0), (0.42, 0.26, D + 1.2), hexc(0x4a3f26))
    # gable ends: planks
    for sz in (-1, 1):
        z = sz * (D / 2)
        for i in range(6):
            x0 = -W / 2 + i * (W / 6)
            xm = x0 + W / 12
            hgt = rise * (1 - abs(xm) / half) - 0.05
            if hgt > 0.1:
                s.box((xm, top + hgt / 2, z), (W / 6 * 0.94, hgt, 0.16), r.choice(logs), jitter=0.1)
    # crossed gable boards with horse heads (a Slavic roof ornament)
    for sz in (-1, 1):
        for sx in (-1, 1):
            s.box((sx * 0.28, top + rise + 0.45, sz * (D / 2 + 0.55)), (0.12, 1.0, 0.08), hexc(0x7a5632), rot=(0, 0, sx * -0.5))
    # stone chimney
    s.hull([V((1.0 + r.uniform(-0.3, 0.3), top + 1.0 + r.uniform(0, 2.3), -0.6 + r.uniform(-0.3, 0.3))) for _ in range(14)], stone_col(r, 2, 0.1))
    # skulls on stakes either side of the path to the door
    bone = hexc(0xe6dfc8)
    for sx in (-1, 1):
        base = V((sx * 2.3, 0, 2.6))
        s.tube([base + V((0, -0.3, 0)), base + V((sx * 0.05, 1.0, 0)), base + V((sx * 0.1, 1.9, 0.02))], [0.09, 0.07, 0.05], 5, hexc(0x4a3324), 0.0)
        c = base + V((sx * 0.1, 2.08, 0.02))
        s.blob(c, (0.2, 0.22, 0.24), bone, mulc(bone, 0.7), 1, 0.05, 1.0, 0.0, 0.04)
        s.box(c + V((0, -0.2, 0.05)), (0.2, 0.14, 0.2), mulc(bone, 0.9))
        for ex in (-1, 1):
            s.box(c + V((ex * 0.075, 0.02, 0.2)), (0.07, 0.07, 0.06), hexc(0x1a1210), jitter=0.0)
    return s


def idol():
    """Four-faced stone idol (after the Zbruch idol): a square pillar with three carved registers."""
    s = Soup(31)
    r = s.rng
    stone = hexc(0x8d8a96)
    stone2 = hexc(0x7b7886)
    dark = hexc(0x4a4854)
    # base of rough slabs
    for i, (rad, y, hh) in enumerate(((1.0, 0.0, 0.34), (0.8, 0.3, 0.3))):
        pts = []
        for k in range(9):
            a = k * TAU / 9 + r.uniform(-0.15, 0.15)
            rr = rad * r.uniform(0.86, 1.0)
            pts += [V((math.cos(a) * rr, y - 0.1, math.sin(a) * rr)), V((math.cos(a) * rr * 0.92, y + hh, math.sin(a) * rr * 0.92))]
        s.hull(pts, stone_col(r, 0.8, 0.3))
    y0, H = 0.55, 3.9
    s.tube([V((0, y0, 0)), V((0, y0 + H * 0.5, 0)), V((0, y0 + H, 0))], [0.62, 0.56, 0.5], 4, lambda i, k: mixc(stone2, stone, r.random()), 0.0, phase=math.pi / 4, cap=False)
    # the registers are divided by projecting bands
    for y in (y0 + 0.9, y0 + 2.2):
        s.box((0, y, 0), (0.9, 0.1, 0.9), stone2)
    hy = y0 + H
    # brim and dome of the shared hat
    hat = []
    for k in range(8):
        a = k * TAU / 8
        hat += [V((math.cos(a) * 0.68, hy - 0.02, math.sin(a) * 0.68)), V((math.cos(a) * 0.62, hy + 0.2, math.sin(a) * 0.62)), V((math.cos(a) * 0.3, hy + 0.52, math.sin(a) * 0.3))]
    hat.append(V((0, hy + 0.6, 0)))
    s.hull(hat, stone_col(r, 0.75, 0.3, stone2, stone))
    for q in range(4):
        m = Matrix.Rotation(q * math.pi / 2, 4, 'Y')
        z = 0.37

        def b(c, size, col, rot=(0, 0, 0)):
            part = Soup(q * 10 + len(s.P))
            part.box(c, size, col, rot)
            s.merge(part, m)

        fy = hy - 0.55
        b((0, fy + 0.2, z + 0.02), (0.46, 0.07, 0.08), stone)            # brow
        b((0, fy, z + 0.05), (0.09, 0.34, 0.12), stone)                   # nose
        for ex in (-1, 1):
            b((ex * 0.13, fy + 0.08, z - 0.0), (0.1, 0.06, 0.06), dark)   # eyes
        b((0, fy - 0.25, z - 0.0), (0.2, 0.04, 0.06), dark)               # mouth
        # arms laid across the chest
        b((0.06, y0 + 2.75, z + 0.0), (0.5, 0.08, 0.07), stone, (0, 0, 0.35))
        b((-0.06, y0 + 2.55, z + 0.0), (0.5, 0.08, 0.07), stone, (0, 0, -0.3))
        # middle register: a small figure; lower register: a sun wheel
        b((0, y0 + 1.75, z - 0.02), (0.1, 0.5, 0.06), stone)
        b((0, y0 + 2.02, z - 0.02), (0.16, 0.14, 0.06), stone)
        b((0, y0 + 1.8, z - 0.02), (0.4, 0.06, 0.06), stone)
        for i in range(3):
            b((0, y0 + 0.5, z + 0.0), (0.42, 0.05, 0.06), dark, (0, 0, i * math.pi / 3))
    return s


# ----------------------------------------------------------------------------- build

def build_all():
    out = {}

    def add(name, soup, ao_dist, floor=0.32):
        soup.bake_ao(ao_dist, 40, floor)
        out[name] = soup
        print(f'{name}: {soup.tris()} tris', flush=True)

    for i in range(3):
        add(f'fir{i}', fir(11 + i * 7), 3.0)
    add('fir_lod', fir(11, 1), 3.0)
    for i in range(2):
        add(f'pine{i}', pine(21 + i * 5), 3.0)
    add('pine_lod', pine(21, 1), 3.0)
    for i in range(2):
        add(f'oak{i}', oak(31 + i * 3), 3.5)
    add('oak_lod', oak(31, 1), 3.5)
    for i in range(2):
        add(f'birch{i}', birch(41 + i * 9), 2.5)
    add('birch_lod', birch(41, 1), 2.5)
    for i in range(3):
        add(f'rock{i}', rock(51 + i), 1.5, 0.4)
    for i in range(2):
        add(f'menhir{i}', menhir(61 + i * 4, i), 2.0, 0.4)
    for i in range(2):
        add(f'bush{i}', bush(70 + i), 1.2, 0.4)
    add('ancient_oak', ancient_oak(), 6.0)
    add('hut', hut(), 3.0)
    add('idol', idol(), 1.5, 0.4)
    return out


def write(models, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    manifest = {}
    blob = bytearray()
    for name, s in models.items():
        n = len(s.P)
        manifest[name] = {'offset': len(blob), 'verts': n}
        blob += struct.pack(f'<{n * 3}f', *[c for p in s.P for c in (p.x, p.y, p.z)])
        cols = bytearray()
        for c, w in zip(s.C, s.W):
            cols += bytes((round(lin_to_srgb(c[0]) * 255), round(lin_to_srgb(c[1]) * 255), round(lin_to_srgb(c[2]) * 255), round(max(0, min(1, w)) * 255)))
        blob += cols
    with open(os.path.join(out_dir, 'props.bin'), 'wb') as f:
        f.write(blob)
    with open(os.path.join(out_dir, 'props.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f'wrote {len(blob) / 1e6:.2f} MB, {sum(m.tris() for m in models.values())} tris in {len(models)} models')


def preview(models, out_dir):
    """Workbench renders of all models in rows, coloured by the baked vertex colours."""
    os.makedirs(out_dir, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    rows = [
        ['fir0', 'fir1', 'fir2', 'fir_lod', 'pine0', 'pine1', 'pine_lod'],
        ['oak0', 'oak1', 'oak_lod', 'birch0', 'birch1', 'birch_lod'],
        ['rock0', 'rock1', 'rock2', 'menhir0', 'menhir1', 'bush0', 'bush1', 'idol'],
        ['ancient_oak', 'hut'],
    ]
    for ri, row in enumerate(rows):
        objs = []
        x = 0.0
        height = 0.0
        for name in row:
            s = models[name]
            me = bpy.data.meshes.new(name)
            # game is Y up, Blender is Z up
            verts = [(p.x, -p.z, p.y) for p in s.P]
            me.from_pydata(verts, [], [(i, i + 1, i + 2) for i in range(0, len(verts), 3)])
            attr = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
            for i, c in enumerate(s.C):
                attr.data[i].color = (c[0], c[1], c[2], 1.0)
            me.color_attributes.active_color = attr
            ob = bpy.data.objects.new(name, me)
            scene.collection.objects.link(ob)
            w = max(p.x for p in s.P) - min(p.x for p in s.P)
            x += w / 2 + 0.8
            ob.location.x = x - (max(p.x for p in s.P) + min(p.x for p in s.P)) / 2
            x += w / 2 + 0.8
            height = max(height, max(p.y for p in s.P))
            objs.append(ob)
        cam_data = bpy.data.cameras.new('cam')
        cam = bpy.data.objects.new('cam', cam_data)
        scene.collection.objects.link(cam)
        scene.camera = cam
        for ob in objs:
            ob.rotation_euler = Euler((0, 0, math.radians(28)))
        cam_data.type = 'ORTHO'
        cam_data.ortho_scale = max(x * 1.04, height * 1.12 * 1.8)
        cam.location = (x / 2, -120, height * 0.5 + 120 * math.tan(math.radians(12)))
        cam.rotation_euler = Euler((math.radians(78), 0, 0))
        cam_data.clip_end = 500
        scene.render.engine = 'BLENDER_WORKBENCH'
        sh = scene.display.shading
        sh.light = 'STUDIO'
        sh.color_type = 'VERTEX'
        sh.show_shadows = False
        sh.show_cavity = False
        scene.display.render_aa = '8'
        scene.world = bpy.data.worlds.new('w')
        scene.world.color = (0.16, 0.14, 0.2)
        scene.render.resolution_x = 1800
        scene.render.resolution_y = 1000
        scene.render.film_transparent = False
        scene.render.filepath = os.path.join(out_dir, f'props-{ri}.png')
        bpy.ops.render.render(write_still=True)
        for ob in objs:
            bpy.data.objects.remove(ob)
        bpy.data.objects.remove(cam)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    here = os.path.dirname(os.path.abspath(__file__))
    models = build_all()
    write(models, os.path.join(here, '..', '..', 'src', 'assets', 'models'))
    if '--preview' in argv:
        preview(models, argv[argv.index('--preview') + 1])
