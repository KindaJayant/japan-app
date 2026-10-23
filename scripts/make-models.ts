/**
 * Generates small, table-scale (~0.6 m) low-poly landmark models as .glb files
 * for <model-viewer> AR. No external assets, no licensing questions.
 *   npm run models
 * Swap in a higher-fidelity CC-BY model later by dropping it at the same path.
 */
import { mkdirSync, writeFileSync } from "node:fs";

type V3 = [number, number, number];
interface Mat { name: string; color: string; metallic?: number; roughness?: number }

const MATS = {
  vermilion: { name: "vermilion", color: "#e8442e", roughness: 0.6 },
  black: { name: "black", color: "#1c1c1c", roughness: 0.7 },
  stone: { name: "stone", color: "#9a958c", roughness: 0.95 },
  gold: { name: "gold", color: "#e2b33c", metallic: 1, roughness: 0.28 },
  wood: { name: "wood", color: "#6b4a2b", roughness: 0.85 },
  plaster: { name: "plaster", color: "#efe8da", roughness: 0.9 },
  roof: { name: "roof", color: "#3a3f3a", roughness: 0.8 },
  water: { name: "water", color: "#2f6f8f", metallic: 0.1, roughness: 0.15 },
  moss: { name: "moss", color: "#4f7a3a", roughness: 1 },
} satisfies Record<string, Mat> as Record<string, Mat>;
type MatKey = string;

/** A hexahedron from 4 bottom + 4 top corners → flat-shaded triangles. */
interface Geo { pos: number[]; nrm: number[]; idx: number[] }
const geos = new Map<MatKey, Geo>();

function hexa(mat: MatKey, c: V3[]) {
  const g = geos.get(mat) ?? { pos: [], nrm: [], idx: [] };
  geos.set(mat, g);
  const centroid = c.reduce((a, p) => [a[0] + p[0] / 8, a[1] + p[1] / 8, a[2] + p[2] / 8] as V3, [0, 0, 0] as V3);
  const faces = [
    [0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
  ];
  for (let f of faces) {
    const [a, b, d] = [c[f[0]], c[f[1]], c[f[2]]];
    const u = sub(b, a), v = sub(d, a);
    let n = norm(cross(u, v));
    const faceC = f.reduce((s, i) => [s[0] + c[i][0] / 4, s[1] + c[i][1] / 4, s[2] + c[i][2] / 4] as V3, [0, 0, 0] as V3);
    if (dot(n, sub(faceC, centroid)) < 0) { f = [...f].reverse(); n = n.map((x) => -x) as V3; }
    const base = g.pos.length / 3;
    for (const i of f) { g.pos.push(...c[i]); g.nrm.push(...n); }
    g.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Frustum: bottom w×d at y, top tw×td at y+h, centred on (cx, cz). Box when tw=w, td=d. */
function frustum(mat: MatKey, cx: number, y: number, cz: number, w: number, d: number, h: number, tw = w, td = d, tiltZ = 0) {
  const ring = (yy: number, ww: number, dd: number): V3[] => [
    [cx - ww / 2, yy, cz - dd / 2], [cx + ww / 2, yy, cz - dd / 2], [cx + ww / 2, yy, cz + dd / 2], [cx - ww / 2, yy, cz + dd / 2],
  ];
  let pts = [...ring(y, w, d), ...ring(y + h, tw, td)];
  if (tiltZ) { // rotate about the box centre around Z (for upturned beam ends)
    const cy = y + h / 2, s = Math.sin(tiltZ), co = Math.cos(tiltZ);
    pts = pts.map(([x, yy, z]) => [cx + (x - cx) * co - (yy - cy) * s, cy + (x - cx) * s + (yy - cy) * co, z] as V3);
  }
  hexa(mat, pts);
}
const box = (mat: MatKey, cx: number, y: number, cz: number, w: number, h: number, d: number, tiltZ = 0) =>
  frustum(mat, cx, y, cz, w, d, h, w, d, tiltZ);

// ── Models ────────────────────────────────────────────────────────────────
function torii() {
  box("stone", 0, 0, 0, 0.7, 0.012, 0.3);
  for (const x of [-0.2, 0.2]) {
    box("black", x, 0.012, 0, 0.06, 0.04, 0.06); // nemaki
    frustum("vermilion", x, 0.052, 0, 0.048, 0.048, 0.48, 0.04, 0.04); // pillar, slight taper
  }
  box("vermilion", 0, 0.43, 0, 0.56, 0.032, 0.035); // nuki
  box("vermilion", 0, 0.462, 0, 0.03, 0.07, 0.03); // gakuzuka
  box("vermilion", 0, 0.532, 0, 0.6, 0.03, 0.05); // shimaki
  box("black", 0, 0.562, 0, 0.44, 0.035, 0.065); // kasagi centre
  for (const s of [-1, 1]) box("black", s * 0.3, 0.566, 0, 0.18, 0.035, 0.065, s * 0.14); // upturned ends
}

function pagoda() {
  box("stone", 0, 0, 0, 0.36, 0.03, 0.36);
  let y = 0.03, w = 0.2;
  for (let tier = 0; tier < 5; tier++) {
    const h = 0.075 - tier * 0.004;
    box("vermilion", 0, y, 0, w, h, w);
    box("plaster", 0, y + h * 0.35, 0, w * 1.002, h * 0.3, w * 1.002);
    y += h;
    frustum("roof", 0, y, 0, w * 1.75, w * 1.75, 0.025, w * 0.9, w * 0.9);
    y += 0.025;
    w *= 0.88;
  }
  box("gold", 0, y, 0, 0.016, 0.16, 0.016); // sōrin spire
  for (let k = 0; k < 6; k++) box("gold", 0, y + 0.03 + k * 0.018, 0, 0.034, 0.006, 0.034);
}

function pavilion() {
  box("water", 0, 0, 0, 0.9, 0.006, 0.7);
  box("moss", -0.36, 0.006, 0.26, 0.16, 0.02, 0.14);
  box("stone", 0, 0.006, 0, 0.42, 0.02, 0.3);
  let y = 0.026;
  box("wood", 0, y, 0, 0.38, 0.1, 0.26); box("plaster", 0, y + 0.03, 0, 0.382, 0.05, 0.262); y += 0.1;
  frustum("roof", 0, y, 0, 0.46, 0.34, 0.025, 0.36, 0.24); y += 0.025;
  box("gold", 0, y, 0, 0.34, 0.09, 0.22); y += 0.09;
  frustum("roof", 0, y, 0, 0.42, 0.3, 0.025, 0.3, 0.2); y += 0.025;
  box("gold", 0, y, 0, 0.2, 0.08, 0.16); y += 0.08;
  frustum("roof", 0, y, 0, 0.3, 0.24, 0.07, 0.03, 0.03); y += 0.07;
  box("gold", 0, y, 0, 0.02, 0.04, 0.03); // hōō (phoenix)
}

function hall() {
  box("stone", 0, 0, 0, 0.8, 0.04, 0.5);
  let y = 0.04;
  box("plaster", 0, y, 0, 0.66, 0.16, 0.38);
  for (let i = 0; i < 8; i++) box("wood", -0.31 + i * (0.62 / 7), y, 0.192, 0.022, 0.16, 0.012);
  y += 0.16;
  frustum("roof", 0, y, 0, 0.82, 0.54, 0.05, 0.62, 0.34); y += 0.05;
  box("wood", 0, y, 0, 0.56, 0.06, 0.28); y += 0.06;
  frustum("roof", 0, y, 0, 0.74, 0.44, 0.1, 0.5, 0.06); y += 0.1;
  for (const s of [-1, 1]) box("gold", s * 0.24, y, 0, 0.03, 0.05, 0.03); // shibi
}

// ── GLB writer ────────────────────────────────────────────────────────────
const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexToLinear = (hex: string) => [1, 3, 5].map((i) => srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255));

function writeGlb(path: string) {
  const chunks: Buffer[] = [];
  let offset = 0;
  const bufferViews: object[] = [], accessors: object[] = [], primitives: object[] = [], materials: object[] = [];
  const push = (buf: Buffer, target: number) => {
    const pad = (4 - (buf.length % 4)) % 4;
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, target });
    chunks.push(buf, Buffer.alloc(pad));
    offset += buf.length + pad;
    return bufferViews.length - 1;
  };
  for (const [key, g] of geos) {
    const m = MATS[key];
    materials.push({
      name: m.name,
      pbrMetallicRoughness: { baseColorFactor: [...hexToLinear(m.color), 1], metallicFactor: m.metallic ?? 0, roughnessFactor: m.roughness ?? 0.8 },
    });
    const pos = Float32Array.from(g.pos), nrm = Float32Array.from(g.nrm), idx = Uint16Array.from(g.idx);
    const min = [0, 1, 2].map((a) => Math.min(...g.pos.filter((_, i) => i % 3 === a)));
    const max = [0, 1, 2].map((a) => Math.max(...g.pos.filter((_, i) => i % 3 === a)));
    accessors.push({ bufferView: push(Buffer.from(pos.buffer), 34962), componentType: 5126, count: pos.length / 3, type: "VEC3", min, max });
    accessors.push({ bufferView: push(Buffer.from(nrm.buffer), 34962), componentType: 5126, count: nrm.length / 3, type: "VEC3" });
    accessors.push({ bufferView: push(Buffer.from(idx.buffer), 34963), componentType: 5123, count: idx.length, type: "SCALAR" });
    const a = accessors.length;
    primitives.push({ attributes: { POSITION: a - 3, NORMAL: a - 2 }, indices: a - 1, material: materials.length - 1 });
  }
  const bin = Buffer.concat(chunks);
  const gltf = {
    asset: { version: "2.0", generator: "japan-saathi make-models" },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives }],
    materials, accessors, bufferViews, buffers: [{ byteLength: bin.length }],
  };
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  const total = 12 + 8 + json.length + 8 + bin.length;
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(total, 8);
  const ch = (len: number, type: number) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
  writeFileSync(path, Buffer.concat([header, ch(json.length, 0x4e4f534a), json, ch(bin.length, 0x004e4942), bin]));
  console.log(`wrote ${path} (${(total / 1024).toFixed(1)} KB)`);
}

mkdirSync("public/models", { recursive: true });
for (const [name, build] of Object.entries({ torii, pagoda, pavilion, hall })) {
  geos.clear();
  build();
  writeGlb(`public/models/${name}.glb`);
}
