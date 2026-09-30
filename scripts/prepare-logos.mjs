// Prepares the consulates' and supporters' marks for the site from the
// originals in assets/ascii-lineup/logos and assets/supporters, trimmed and
// saved as WebP. Consulate marks sit on white cards, so they are flattened on
// white (Peru's cream ground keyed to white); supporter marks keep a
// transparent ground for the logo wall. HCCSF's seal only loses the white
// around it, not the white inside it. Torre.ai only ships a dark-background
// wordmark, so it is unmixed into ink and the olive green Torre uses on light
// surfaces. Prints each ratio for src/lib/summit.ts.
//   node scripts/prepare-logos.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const asset = (path) => new URL(`../${path}`, import.meta.url);
const smooth = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

const logos = [
  { from: "assets/ascii-lineup/logos/co.png", to: "public/images/consulates/co.webp" },
  { from: "assets/ascii-lineup/logos/pe.jpg", to: "public/images/consulates/pe.webp", key: true },
  { from: "assets/ascii-lineup/logos/gt.webp", to: "public/images/consulates/gt.webp" },
  { from: "assets/ascii-lineup/logos/hccsf.jpg", to: "public/images/supporters/hccsf.webp", clear: true, outside: true },
  { from: "assets/sponsors/american-legion-post-505.png", to: "public/images/sponsors/american-legion-post-505.webp", clear: true, flood: true },
  { from: "assets/sponsors/war-memorial.png", to: "public/images/sponsors/war-memorial.webp", clear: true },
  { from: "assets/supporters/ivy.png", to: "public/images/supporters/ivy.webp", clear: true },
  { from: "assets/supporters/emma.png", to: "public/images/supporters/emma.webp", clear: true },
  { from: "assets/supporters/torre.png", to: "public/images/supporters/torre.webp", clear: true, invert: true },
];

// Torre.ai: each pixel is the dark ground plus some amount of the light grey
// "torre" and the lime ".ai"; solve for both amounts and repaint them.
const TORRE = { ground: [42, 42, 42], grey: [234, 234, 234], lime: [204, 220, 60] };
const TORRE_LIGHT = { grey: [26, 26, 24], lime: [131, 147, 9] };
function unmix(data) {
  const g = TORRE.ground;
  const u = TORRE.grey.map((v, c) => v - g[c]);
  const v = TORRE.lime.map((x, c) => x - g[c]);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const [uu, uv, vv] = [dot(u, u), dot(u, v), dot(v, v)];
  const det = uu * vv - uv * uv;
  for (let i = 0; i < data.length; i += 4) {
    const p = [0, 1, 2].map((c) => data[i + c] - g[c]);
    const [pu, pv] = [dot(p, u), dot(p, v)];
    let a = Math.max(0, (pu * vv - pv * uv) / det);
    let b = Math.max(0, (pv * uu - pu * uv) / det);
    const total = a + b;
    if (total > 1) [a, b] = [a / total, b / total];
    // Faint residue of the ground (JPEG noise) becomes fully transparent.
    const cover = a + b < 0.04 ? 0 : a + b;
    for (let c = 0; c < 3; c++)
      data[i + c] = cover ? Math.round((TORRE_LIGHT.grey[c] * a + TORRE_LIGHT.lime[c] * b) / cover) : 255;
    data[i + 3] = Math.round(255 * cover);
  }
}

// HCCSF's seal: fits a circle to its grey rim (least squares, twice, dropping
// outliers) so everything inside the rim can stay opaque.
function sealCircle(data, width, height) {
  let points = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const mean = (r + g + b) / 3;
      if (Math.max(r, g, b) - Math.min(r, g, b) < 18 && mean > 120 && mean < 225) points.push([x, y]);
    }
  let circle;
  for (let pass = 0; pass < 3; pass++) {
    // x² + y² + Dx + Ey + F = 0, solved with the normal equations.
    const m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const v = [0, 0, 0];
    for (const [x, y] of points) {
      const row = [x, y, 1];
      const rhs = -(x * x + y * y);
      for (let a = 0; a < 3; a++) {
        v[a] += row[a] * rhs;
        for (let b = 0; b < 3; b++) m[a][b] += row[a] * row[b];
      }
    }
    const det = (q) => q[0][0] * (q[1][1] * q[2][2] - q[1][2] * q[2][1]) - q[0][1] * (q[1][0] * q[2][2] - q[1][2] * q[2][0]) + q[0][2] * (q[1][0] * q[2][1] - q[1][1] * q[2][0]);
    const d = det(m);
    const [D, E, F] = [0, 1, 2].map((k) => det(m.map((row, a) => row.map((cell, b) => (b === k ? v[a] : cell)))) / d);
    circle = { cx: -D / 2, cy: -E / 2, r: Math.sqrt((D * D + E * E) / 4 - F) };
    points = points.filter(([x, y]) => Math.abs(Math.hypot(x - circle.cx, y - circle.cy) - circle.r) < 6);
  }
  return circle;
}

// The white ground reachable from the image border (flood fill), so white or
// light details enclosed by the mark keep their colour.
function outerGround(data, width, height) {
  const ground = new Uint8Array(width * height);
  const white = (p) => Math.min(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]) > 200;
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (ground[p] || !white(p)) continue;
    ground[p] = 1;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
  return ground;
}

for (const { from, to, key, invert, clear, outside, flood } of logos) {
  let input = sharp(await readFile(asset(from)));
  // The Torre original is small: upsample before repainting for clean edges.
  if (invert) input = sharp(await input.resize({ width: 1396, kernel: "lanczos3" }).toBuffer());
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (invert) unmix(data);
  if (clear && !invert) {
    // With `outside`, only what lies beyond the seal's rim is keyed.
    const seal = outside ? sealCircle(data, info.width, info.height) : null;
    if (seal) console.log(`  seal rim: centre ${seal.cx.toFixed(1)}, ${seal.cy.toFixed(1)}  radius ${seal.r.toFixed(1)}`);
    const inside = (p) => Math.hypot((p % info.width) - seal.cx, Math.floor(p / info.width) - seal.cy) < seal.r - 1;
    // With `flood`, only the ground reached from the border, plus a 2 px rim
    // for the anti-aliased edge, is keyed.
    const ground = flood ? outerGround(data, info.width, info.height) : null;
    const nearGround = (p) => {
      const x = p % info.width;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const q = p + dy * info.width + dx;
          if (q >= 0 && q < ground.length && Math.abs((q % info.width) - x) <= 2 && ground[q]) return true;
        }
      return false;
    };
    // White ground to transparency ("colour to alpha"): each pixel keeps the
    // colour that, laid over white, reproduces the original.
    for (let i = 0; i < data.length; i += 4) {
      if (seal && inside(i / 4)) continue;
      if (ground && !nearGround(i / 4)) continue;
      const alpha = Math.max(...[0, 1, 2].map((c) => 255 - data[i + c])) / 255;
      for (let c = 0; c < 3; c++)
        data[i + c] = alpha ? Math.round((data[i + c] - 255 * (1 - alpha)) / alpha) : 255;
      data[i + 3] = Math.round(data[i + 3] * (alpha < 0.03 ? 0 : alpha));
    }
  }
  if (clear) {
    const trimmed = await sharp(data, { raw: info }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).toBuffer({ resolveWithObject: true });
    const { width, height } = trimmed.info;
    const out = await sharp(trimmed.data, { raw: { width, height, channels: 4 } })
      .resize({ width: Math.min(width, 900), height: Math.min(height, 900), fit: "inside", withoutEnlargement: true })
      .webp({ quality: 92, alphaQuality: 100 })
      .toBuffer({ resolveWithObject: true });
    await mkdir(new URL(".", asset(to)), { recursive: true });
    await writeFile(asset(to), out.data);
    console.log(`${to}  ${out.info.width}×${out.info.height}  ratio ${(out.info.width / out.info.height).toFixed(3)}`);
    continue;
  }
  // Background tone: the median of the top and bottom rows.
  const border = [];
  for (let x = 0; x < info.width; x += 5) border.push(x * 4, ((info.height - 1) * info.width + x) * 4);
  const ground = [0, 1, 2].map((c) => border.map((i) => data[i + c]).sort((a, b) => a - b)[border.length >> 1]);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * a + 255 * (1 - a));
    data[i + 3] = 255;
    if (key) {
      const d = Math.hypot(data[i] - ground[0], data[i + 1] - ground[1], data[i + 2] - ground[2]);
      const w = 1 - smooth((d - 12) / 40);
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (255 - data[i + c]) * w);
    }
  }
  const trimmed = await sharp(data, { raw: info }).trim({ background: "#ffffff", threshold: 10 }).toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;
  const out = await sharp(trimmed.data, { raw: { width, height, channels: 4 } })
    .removeAlpha()
    .resize({ width: Math.min(width, 900), height: Math.min(height, 900), fit: "inside", withoutEnlargement: true })
    .webp({ quality: 92 })
    .toBuffer({ resolveWithObject: true });
  await mkdir(new URL(".", asset(to)), { recursive: true });
  await writeFile(asset(to), out.data);
  console.log(`${to}  ${out.info.width}×${out.info.height}  ratio ${(out.info.width / out.info.height).toFixed(3)}`);
}
