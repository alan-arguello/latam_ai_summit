// Print-ready PVC credentials for LATAM AI Summit: one front per role
// (Speaker, Staff, Consulate) and a shared back with the consulates. CR80
// card, portrait, 54 × 85.6 mm with a 2 mm bleed.
//
// Everything is vector except the consulates' logos, which only exist as
// images and are embedded at their full resolution: satori sets the layout
// and turns text into outlines, the ASCII Golden Gate is drawn from glyph
// outlines, and the flags come from flag-icons. Output:
//   pdf/credenciales-pvc.pdf    four pages, bleed and trim boxes set
//   svg/credencial-*.svg        with bleed (-sangrado) and at trim size
//   png/credencial-*.png        600 dpi previews
//   node scripts/generate-credentials.mjs    (Chrome renders the PDF; set
//   CHROME_PATH if it is not in /Applications)
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import opentype from "opentype.js";
import { decodePDFRawStream, PDFArray, PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer-core";
import satori from "satori";
import sharp from "sharp";
import { asset, dataUrl } from "./promo-kit.mjs";

// --- Geometry (millimetres) ------------------------------------------------------
// Layout units: 25 per millimetre, so every edge lands on a whole unit.
const PX_PER_MM = 25;
const mm = (v) => v * PX_PER_MM;
const TRIM = { w: 54, h: 85.6 };
const BLEED = 2;
const PAGE = { w: TRIM.w + BLEED * 2, h: TRIM.h + BLEED * 2 };
const W = Math.round(mm(PAGE.w));
const H = Math.round(mm(PAGE.h));
const at = (v) => mm(v + BLEED); // trim coordinates to canvas pixels
const SAFE = 4; // keep text 4 mm inside the cut
// Lanyard slot: centred at the top, roughly 14 × 3.5 mm, starting 3.5 mm down.
const SLOT = { w: 14, h: 3.5, top: 3.5 };

// --- Brand ---------------------------------------------------------------------------
const INK = "#0b0b0b";
const PAPER = "#f5f3f1";
const LIVE = "#ff4f2b";
const ROLES = {
  speaker: { label: "Speaker", bg: INK, fg: PAPER, muted: "rgba(245,243,241,0.62)", rule: "rgba(245,243,241,0.18)", ascii: [255, 79, 43], dot: LIVE },
  staff: { label: "Staff", bg: LIVE, fg: INK, muted: "rgba(11,11,11,0.65)", rule: "rgba(11,11,11,0.18)", ascii: [11, 11, 11], dot: INK },
  consulate: { label: "Consulate", bg: PAPER, fg: INK, muted: "#777169", rule: "rgba(11,11,11,0.18)", ascii: [255, 79, 43], dot: LIVE, flags: true },
};

const box = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);
const abs = (style, ...children) => box({ position: "absolute", ...style }, ...children);
const span = (value, style) => h("span", { style }, value);
const words = (value, style, gap) => box({ gap, ...style }, ...value.split(" ").map((w) => h("span", null, w)));

const font = (path) => readFile(path);
const fonts = [
  { name: "Host Grotesk", data: await font(asset("scripts/fonts/HostGrotesk-300.ttf")), weight: 300, style: "normal" },
  { name: "Host Grotesk", data: await font(asset("scripts/fonts/HostGrotesk-500.ttf")), weight: 500, style: "normal" },
  { name: "Inter", data: await font(asset("scripts/fonts/Inter-500.ttf")), weight: 500, style: "normal" },
  { name: "Geist Mono", data: await font(asset("node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.ttf")), weight: 500, style: "normal" },
];

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

// --- The Golden Gate in characters ----------------------------------------------------
// The bridge from the site's mark, drawn at card scale (two towers, the main
// cable, suspenders and the deck) and then set in type. Fog below the deck
// fades out in light characters.
const BAND = { top: 16, h: 36 }; // trim mm
const CHAR = { w: 0.78, h: 1.3 }; // ≈3.6 pt, crisp on PVC at 600 dpi
const GLYPHS = " .:-=+*#%@";
const cols = Math.ceil(PAGE.w / CHAR.w);
const rows = Math.round(BAND.h / CHAR.h);
async function bridgeField() {
  const S = 20; // raster units per mm
  const w = PAGE.w * S;
  const hgt = BAND.h * S;
  const towers = [15.5, 42.5].map((x) => x * S);
  const top = 1.5 * S;
  const deck = 25 * S;
  const towerW = 2.4 * S;
  // Main cable: from the band edges, up to each tower top, sagging between.
  const sag = (x0, x1, y0, y1, depth) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t + depth * 4 * t * (1 - t);
      pts.push([x, y]);
    }
    return pts;
  };
  const spans = [
    sag(-2 * S, towers[0], deck - 2 * S, top + 0.6 * S, 3.4 * S),
    sag(towers[0], towers[1], top + 0.6 * S, top + 0.6 * S, 17 * S),
    sag(towers[1], w + 2 * S, top + 0.6 * S, deck - 2 * S, 3.4 * S),
  ];
  const cable = spans.map((pts) => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#fff" stroke-width="${0.55 * S}"/>`).join("");
  // Suspenders every 1.6 mm, from the cable down to the deck.
  let suspenders = "";
  for (const pts of spans) {
    for (let x = pts[0][0]; x < pts[pts.length - 1][0]; x += 1.6 * S) {
      const i = Math.round(((x - pts[0][0]) / (pts[pts.length - 1][0] - pts[0][0])) * 40);
      const y = pts[Math.min(40, Math.max(0, i))][1];
      if (y < deck) suspenders += `<line x1="${x}" y1="${y}" x2="${x}" y2="${deck}" stroke="#fff" stroke-opacity="0.45" stroke-width="${0.18 * S}"/>`;
    }
  }
  const towerSvg = towers
    .map(
      (x) =>
        `<rect x="${x - towerW / 2}" y="${top}" width="${0.8 * S}" height="${hgt}" fill="#fff"/>` +
        `<rect x="${x + towerW / 2 - 0.8 * S}" y="${top}" width="${0.8 * S}" height="${hgt}" fill="#fff"/>` +
        [0.18, 0.42, 0.66].map((f) => `<rect x="${x - towerW / 2}" y="${top + (deck - top) * f}" width="${towerW}" height="${0.55 * S}" fill="#fff"/>`).join(""),
    )
    .join("");
  // Fog: soft bands below the deck.
  const fog = `<defs><linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="0" y="${deck + 1.4 * S}" width="${w}" height="${hgt - deck}" fill="url(#fog)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}"><rect width="100%" height="100%" fill="#000"/>${fog}${suspenders}${cable}${towerSvg}<rect x="0" y="${deck}" width="${w}" height="${1.1 * S}" fill="#fff"/></svg>`;
  const data = await sharp(Buffer.from(svg)).resize(cols, rows, { fit: "fill", kernel: "cubic" }).grayscale().raw().toBuffer();
  return Float32Array.from(data, (v) => v / 255);
}
const bridgeValue = await bridgeField();
// Each glyph is defined once from Geist Mono Bold's outlines and placed with
// <use>, so the band stays sharp at any size and needs no font to print.
const mono = opentype.loadSync(asset("node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf").pathname);
const glyphSize = mm(CHAR.w * 1.66);
const glyphDefs = [...GLYPHS.slice(1)]
  .map((g, i) => `<path id="ascii-${i}" d="${mono.getPath(g, 0, 0, glyphSize).toPathData(2)}"/>`)
  .join("");
function asciiBand(color) {
  const uses = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = bridgeValue[r * cols + c];
      const index = Math.min(GLYPHS.length - 1, Math.floor(Math.pow(v, 0.7) * GLYPHS.length));
      if (index === 0) continue;
      const a = (0.45 + 0.55 * v).toFixed(2);
      uses.push(`<use href="#ascii-${index - 1}" x="${mm(c * CHAR.w).toFixed(2)}" y="${mm(r * CHAR.h + CHAR.h * 0.82).toFixed(2)}" fill-opacity="${a}"/>`);
    }
  }
  return `<defs>${glyphDefs}</defs><g transform="translate(0 ${at(BAND.top)})" fill="rgb(${color.join(",")})">${uses.join("")}</g>`;
}

// Vector pieces are laid out by satori as placeholder boxes in a marker
// colour, then swapped for the real artwork at the box's exact position.
const markerColor = (n) => `#fe00${n.toString(16).padStart(2, "0")}`;
const placeholder = (n, w, hgt, style = {}) => h("div", { style: { width: w, height: hgt, background: markerColor(n), ...style } });

// Same geometry as <LogoMark /> on the site.
const bridgeMark = (color, box) =>
  `<svg x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" viewBox="0 0 26 20" fill="${color}"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="${color}" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`;

// Flags from flag-icons (4:3). Their ids already carry the country code.
const FLAGS = ["co", "mx", "pe", "cl", "uy", "gt", "br"];
const FLAG = { w: 5.2, h: 3.9, gap: 1.1, radius: 0.5 };
const flagArt = Object.fromEntries(
  await Promise.all(
    FLAGS.map(async (code) => {
      const svg = await readFile(asset(`node_modules/flag-icons/flags/4x3/${code}.svg`), "utf8");
      return [code, svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")];
    }),
  ),
);
const flag = (code, box) =>
  `<clipPath id="clip-${code}"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${mm(FLAG.radius)}"/></clipPath>` +
  `<g clip-path="url(#clip-${code})"><svg x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice">${flagArt[code]}</svg></g>`;

// --- Front --------------------------------------------------------------------------------
function front(role) {
  const r = ROLES[role];
  const node = box(
    { width: W, height: H, position: "relative", background: r.bg, color: r.fg, fontFamily: "Inter" },

    // Brand, clear of the lanyard slot.
    abs(
      { left: at(SAFE), top: at(10.5), width: mm(TRIM.w - SAFE * 2), alignItems: "center", justifyContent: "space-between" },
      box(
        { alignItems: "center", gap: mm(1.6) },
        placeholder(0, mm(5.2), mm(4)),
        words("LATAM AI Summit", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: mm(3.1), letterSpacing: mm(-0.05) }, mm(0.8)),
      ),
      span("07.10.26", { fontFamily: "Geist Mono", fontSize: mm(2.2), color: r.muted }),
    ),

    // The role, as large as the card allows.
    abs(
      { left: at(SAFE - 0.4), top: at(56), flexDirection: "column" },
      box(
        { alignItems: "center", gap: mm(1.3), fontFamily: "Geist Mono", fontSize: mm(2.1), letterSpacing: mm(0.25), color: r.muted, textTransform: "uppercase", marginLeft: mm(0.5) },
        h("span", { style: { width: mm(1.6), height: mm(1.6), borderRadius: 999, background: r.dot } }),
        span("Credencial"),
      ),
      span(r.label, { marginTop: mm(1.2), fontFamily: "Host Grotesk", fontWeight: 300, fontSize: mm(role === "consulate" ? 10.2 : 12.4), lineHeight: 1, letterSpacing: mm(-0.45) }),
    ),

    // The seven countries on the consulate card.
    ...(r.flags ? [abs({ left: at(SAFE), top: at(71.2), gap: mm(FLAG.gap) }, ...FLAGS.map((_, i) => placeholder(1 + i, mm(FLAG.w), mm(FLAG.h))))] : []),

    // Footer.
    abs({ left: at(SAFE), top: at(TRIM.h - 9.6), width: mm(TRIM.w - SAFE * 2), height: 2, background: r.rule }),
    abs(
      { left: at(SAFE), top: at(TRIM.h - 8), width: mm(TRIM.w - SAFE * 2), justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: mm(1.9), letterSpacing: mm(0.1), color: r.muted, textTransform: "uppercase" },
      span("San Francisco"),
      span("#SFTechWeek"),
    ),
  );
  return {
    node,
    art: (boxes) => [bridgeMark(r.fg, boxes[0]), ...(r.flags ? FLAGS.map((code, i) => flag(code, boxes[1 + i])) : []), asciiBand(r.ascii)].join(""),
  };
}

// --- Back (shared) ---------------------------------------------------------------------------
// The consulates' official marks on white, as on the promo.
async function onWhite(file, key = false) {
  const { data, info } = await sharp(await readFile(asset(file))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const border = [];
  for (let x = 0; x < info.width; x += 7) border.push(x * 4, ((info.height - 1) * info.width + x) * 4);
  const med = [0, 1, 2].map((ch) => border.map((i) => data[i + ch]).sort((a, b) => a - b)[border.length >> 1]);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(data[i + ch] * a + 255 * (1 - a));
    data[i + 3] = 255;
    if (key) {
      const d = Math.hypot(data[i] - med[0], data[i + 1] - med[1], data[i + 2] - med[2]);
      const w = 1 - smooth((d - 12) / 40);
      for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(data[i + ch] + (255 - data[i + ch]) * w);
    }
  }
  const png = await sharp(data, { raw: info }).trim({ background: "#ffffff", threshold: 12 }).png().toBuffer();
  const meta = await sharp(png).metadata();
  return { png, ratio: meta.width / meta.height };
}
const logos = await Promise.all(
  [
    ["assets/ascii-lineup/logos/co.png"],
    ["public/images/consulates/mx.webp"],
    ["assets/ascii-lineup/logos/pe.jpg", true],
    ["public/images/consulates/cl.webp"],
    ["public/images/consulates/uy.webp"],
    ["assets/ascii-lineup/logos/gt.webp"],
    ["public/images/consulates/br.webp"],
    ["assets/ascii-lineup/logos/hccsf.jpg"],
  ].map(([file, key]) => onWhite(file, key)),
);

function back() {
  const grid = { top: 22, cellW: (TRIM.w - SAFE * 2) / 2, cellH: 12.4 };
  const node = box(
    { width: W, height: H, position: "relative", background: "#ffffff", color: INK, fontFamily: "Inter" },
    abs(
      { left: at(SAFE), top: at(10.5), alignItems: "center", gap: mm(1.6) },
      placeholder(0, mm(5.2), mm(4)),
      words("LATAM AI Summit", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: mm(3.1), letterSpacing: mm(-0.05) }, mm(0.8)),
    ),
    abs(
      { left: at(SAFE), top: at(16.4), width: mm(TRIM.w - SAFE * 2), fontSize: mm(2.05), lineHeight: 1.35, color: "#777169" },
      span("Una iniciativa de siete consulados latinoamericanos en San Francisco."),
    ),
    ...logos.map((logo, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const maxH = logo.ratio < 1.3 ? 9.4 : 6.6;
      const hgt = Math.min(maxH, 20 / logo.ratio);
      return abs(
        {
          left: at(SAFE + col * grid.cellW),
          top: at(grid.top + row * grid.cellH),
          width: mm(grid.cellW),
          height: mm(grid.cellH),
          alignItems: "center",
          justifyContent: "center",
          borderLeft: col ? `2px solid rgba(0,0,0,0.08)` : "none",
          borderTop: row ? `2px solid rgba(0,0,0,0.08)` : "none",
        },
        h("img", { src: dataUrl(logo.png), width: mm(hgt * logo.ratio), height: mm(hgt) }),
      );
    }),
    abs(
      { left: at(SAFE), top: at(TRIM.h - 8), width: mm(TRIM.w - SAFE * 2), justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: mm(1.9), letterSpacing: mm(0.1), color: "#777169", textTransform: "uppercase" },
      span("07.10.26"),
    ),
  );
  return { node, art: (boxes) => bridgeMark(INK, boxes[0]) };
}

// --- Output ---------------------------------------------------------------------------------
async function toSvg({ node, art }) {
  let svg = await satori(node, { width: W, height: H, fonts });
  // Find each placeholder, note its box and drop it.
  const boxes = [];
  svg = svg.replace(/<rect([^>]*)fill="#fe00([0-9a-f]{2})"([^>]*)\/>/g, (_, a, n, b) => {
    const attrs = a + b;
    const num = (key) => Number((attrs.match(new RegExp(`\\b${key}="([\\d.]+)"`)) ?? [0, 0])[1]);
    boxes[parseInt(n, 16)] = { x: num("x"), y: num("y"), w: num("width"), h: num("height") };
    return "";
  });
  if (boxes.length === 0 || boxes.includes(undefined)) throw new Error("A placeholder did not render.");
  // satori clips with luminance masks built from a white rectangle; as clip
  // paths they stay exact vector edges instead of soft-mask images.
  // Cells with a border add a black stroke to keep their content off it;
  // the content never reaches the border, so the rectangle alone is enough.
  // An element that already has its own clip path gets wrapped in a group
  // carrying the second one.
  svg = svg
    .replace(/<mask id="([^"]+)">(<rect [^>]*fill="#fff"\/>)(?:<path [^>]*stroke="#000"[^>]*\/>)*<\/mask>/g, '<clipPath id="$1">$2</clipPath>')
    .replace(/<([a-z]+)((?:(?!\/>)[^>])*?clip-path="[^"]*"(?:(?!\/>)[^>])*?) mask="url\(#(satori_[^)]+)\)"([^>]*)\/>/g, '<g clip-path="url(#$3)"><$1$2$4/></g>')
    .replace(/<([a-z]+)((?:(?!\/>)[^>])*?) mask="url\(#(satori_[^)]+)\)"((?:(?!\/>)[^>])*?clip-path="[^"]*"[^>]*)\/>/g, '<g clip-path="url(#$3)"><$1$2$4/></g>')
    .replace(/mask="url\(#(satori_[^)]+)\)"/g, 'clip-path="url(#$1)"');
  const leftover = svg.match(/<mask [\s\S]*?<\/mask>/);
  if (leftover) throw new Error(`A satori mask is not a plain rectangle: ${leftover[0].slice(0, 300)}`);
  return svg
    .replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${PAGE.w}mm" height="${PAGE.h}mm" viewBox="0 0 ${W} ${H}">`)
    .replace(/<\/svg>$/, `${art(boxes)}</svg>`);
}
// Same drawing cropped to the 54 × 85.6 mm cut.
const atTrim = (svg) =>
  svg.replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${TRIM.w}mm" height="${TRIM.h}mm" viewBox="${mm(BLEED)} ${mm(BLEED)} ${mm(TRIM.w)} ${mm(TRIM.h)}">`);

const root = asset("marketing/escarapelas/");
await rm(root, { recursive: true, force: true });
const dirs = Object.fromEntries(["pdf", "svg", "png"].map((d) => [d, new URL(`${d}/`, root)]));
for (const d of Object.values(dirs)) await mkdir(d, { recursive: true });

const pages = [
  ["speaker", front("speaker")],
  ["staff", front("staff")],
  ["consulate", front("consulate")],
  ["reverso", back()],
];
// 600 dpi previews. librsvg already converts the mm size at the given
// density and sharp scales by density / 72 on top, so 600 dpi needs
// √(600 × 72); the resize pins the exact pixel size.
const raster = (svg, wMm, hMm) =>
  sharp(Buffer.from(svg), { density: Math.sqrt(600 * 72) })
    .resize(Math.round((wMm / 25.4) * 600), Math.round((hMm / 25.4) * 600), { fit: "fill" })
    .png()
    .toBuffer();
const svgs = [];
const previews = [];
for (const [name, card] of pages) {
  const svg = await toSvg(card);
  svgs.push(svg);
  await writeFile(new URL(`credencial-${name}-sangrado.svg`, dirs.svg), svg);
  await writeFile(new URL(`credencial-${name}.svg`, dirs.svg), atTrim(svg));
  const png = await raster(svg, PAGE.w, PAGE.h);
  await writeFile(new URL(`credencial-${name}-sangrado.png`, dirs.png), png);
  const trimmed = await raster(atTrim(svg), TRIM.w, TRIM.h);
  await writeFile(new URL(`credencial-${name}.png`, dirs.png), trimmed);
  previews.push(trimmed);
  console.log(`Generated credencial-${name}`);
}

// PDF: Chrome prints each SVG as vector at the card's exact size; pdf-lib
// joins the pages and marks the trim and bleed boxes for the printer.
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const pdf = await PDFDocument.create();
const pt = (v) => (v / 25.4) * 72;
for (const svg of svgs) {
  const tab = await browser.newPage();
  await tab.setContent(
    `<!doctype html><style>@page{size:${PAGE.w}mm ${PAGE.h}mm;margin:0}html,body{margin:0}svg{display:block}</style>${svg}`,
    { waitUntil: "load" },
  );
  const one = await PDFDocument.load(await tab.pdf({ width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true, pageRanges: "1" }));
  // Chrome rounds the paper up and offsets the drawing slightly; the first
  // two cm operators place the SVG, so they give its exact box on the page.
  const source = one.getPage(0);
  const contents = source.node.Contents();
  const first = contents instanceof PDFArray ? one.context.lookup(contents.get(0)) : contents;
  const ops = Buffer.from(decodePDFRawStream(first).decode()).toString("latin1");
  const [outer, inner] = [...ops.matchAll(/([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) cm/g)].slice(0, 2).map((m) => m.slice(1).map(Number));
  const [a, , , d, e, f] = outer;
  const [s2, , , , tx, ty] = inner;
  const x0 = e + a * tx;
  const yTop = f + d * ty;
  const width = a * s2 * W;
  const height = -d * s2 * H;
  if (Math.abs(width - pt(PAGE.w)) > 0.05 || Math.abs(height - pt(PAGE.h)) > 0.05) throw new Error(`Chrome scaled the card: ${width}×${height} pt.`);
  const [page] = await pdf.copyPages(one, [0]);
  const y0 = yTop - height;
  page.setMediaBox(x0, y0, width, height);
  page.setCropBox(x0, y0, width, height);
  page.setBleedBox(x0, y0, width, height);
  page.setTrimBox(x0 + pt(BLEED), y0 + pt(BLEED), pt(TRIM.w), pt(TRIM.h));
  pdf.addPage(page);
  await tab.close();
}
await browser.close();
pdf.setTitle("LATAM AI Summit · Credenciales PVC");
await writeFile(new URL("credenciales-pvc.pdf", dirs.pdf), await pdf.save());

// Preview: the cards with CR80 rounded corners and the lanyard slot cut out.
const cardW = 560;
const cardH = Math.round((cardW * TRIM.h) / TRIM.w);
const k = cardW / TRIM.w;
const cutout = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="${k * 3.18}" fill="#fff"/><rect x="${(cardW - k * SLOT.w) / 2}" y="${k * SLOT.top}" width="${k * SLOT.w}" height="${k * SLOT.h}" rx="${(k * SLOT.h) / 2}" fill="#000"/></svg>`,
  ),
)
  .extractChannel("red")
  .raw()
  .toBuffer();
const cards = await Promise.all(
  previews.map(async (png) =>
    sharp(await sharp(png).resize(cardW, cardH).removeAlpha().toBuffer())
      .joinChannel(cutout, { raw: { width: cardW, height: cardH, channels: 1 } })
      .png()
      .toBuffer(),
  ),
);
const gap = 60;
await sharp({ create: { width: gap + cards.length * (cardW + gap), height: cardH + gap * 2, channels: 3, background: "#d9d6cf" } })
  .composite(cards.map((input, i) => ({ input, left: gap + i * (cardW + gap), top: gap })))
  .png()
  .toFile(new URL("credenciales-preview.png", root).pathname);
console.log(`Wrote pdf/credenciales-pvc.pdf (${pages.length} pages), ${pages.length * 2} SVGs and PNGs`);
