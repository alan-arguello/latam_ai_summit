// Square promo (2160×2160) for LATAM AI Summit: every speaker in one grid,
// cut out in full colour over a dark tile with an ASCII texture and an orange
// glow, with the seven consulates and HCCSF below.
//   node scripts/generate-speakers-grid.mjs
//
// Portraits are framed and cut out with Apple's Vision framework, written once with:
//   swift scripts/person-mask.swift assets/ascii-lineup/masks assets/ascii-lineup/people/*
//   swift scripts/detect-faces.swift assets/ascii-lineup/people/* > assets/ascii-lineup/faces.json
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";
import { abs, asset, box, dataUrl, fonts, img, LIVE, px, size, span, words } from "./promo-kit.mjs";

const DARK = "#090909";
const TILE = "#121212";
const dir = "assets/ascii-lineup/";

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

// --- Speakers --------------------------------------------------------------------
// Roles as the speakers present themselves on LinkedIn or their company sites.
const speakers = [
  { name: "Luis Héctor Chávez", role: "CTO · Replit", photo: "luis-hector-chavez.png" },
  { name: "Luisa Dalla Costa", role: "Partner · Latitud", photo: "luisa-dalla-costa.webp" },
  { name: "Nicolás Loeff", role: "Cofundador y CTO · Zapia", photo: "nicolas-loeff.webp" },
  { name: "María Gracia Lagos", role: "Copec WIND Ventures", photo: "maria-gracia-lagos.png" },
  { name: "Juan Pablo Linares", role: "Cofundador y CEO · Blinka", photo: "juan-pablo-linares.webp" },
  { name: "Nicolás López", role: "Cofundador y CPO · Horizon", photo: "nicolas-lopez.jpg" },
];

// --- Grid ---------------------------------------------------------------------------
const GRID = { x: 48, y: 244, w: 984, cols: 4, gap: 8, cellH: 232 };
const cellW = (GRID.w - GRID.gap * (GRID.cols - 1)) / GRID.cols;
const cell = (i) => ({
  x: GRID.x + (i % GRID.cols) * (cellW + GRID.gap),
  y: GRID.y + Math.floor(i / GRID.cols) * (GRID.cellH + GRID.gap),
});

// --- Portrait tiles ---------------------------------------------------------------
// Every face lands at the same size and height. The person is cut out with
// the Vision mask and set over a dark tile: faint ASCII characters (the
// summit's texture) and a soft orange glow behind the head.
const faces = JSON.parse(await readFile(asset(`${dir}faces.json`), "utf8"));
const FACE = { h: 96, cy: 0.4 }; // face height in units, face centre as a share of the cell
const TW = Math.round(px(cellW));
const TH = Math.round(px(GRID.cellH));

// Deterministic noise so the texture is the same on every run.
let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function texture() {
  const glyphs = ".:-=+*";
  const cw = 8.6;
  const ch = 14;
  const cols = Math.ceil(TW / cw);
  const rows = Math.ceil(TH / ch);
  let text = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fy = r / rows;
      // Denser towards the top, where the glow sits.
      if (random() > 0.55 - fy * 0.35) continue;
      const g = glyphs[Math.floor(random() * glyphs.length)];
      text += `<text x="${(c * cw).toFixed(1)}" y="${(r * ch + 11).toFixed(1)}" fill-opacity="${(0.05 + random() * 0.09).toFixed(2)}">${g}</text>`;
    }
  }
  return `<g font-family="Menlo, monospace" font-size="13" fill="#f5f3f1">${text}</g>`;
}
const TEXTURE = texture();

async function portraitTile(speaker) {
  const info = faces[speaker.photo];
  const face = info.faces[0];
  const k = FACE.h / face.h; // units per source pixel
  const crop = {
    left: Math.round(face.x + face.w / 2 - cellW / 2 / k),
    top: Math.round(face.y + face.h / 2 - (FACE.cy * GRID.cellH) / k),
    width: Math.round(cellW / k),
    height: Math.round(GRID.cellH / k),
  };
  const pad = {
    left: Math.max(0, -crop.left),
    top: Math.max(0, -crop.top),
    right: Math.max(0, crop.left + crop.width - info.width),
    bottom: Math.max(0, crop.top + crop.height - info.height),
  };
  const area = { left: crop.left + pad.left, top: crop.top + pad.top, width: crop.width, height: crop.height };
  const framed = async (file, pipeline) => {
    const padded = await sharp(await readFile(asset(file))).removeAlpha().extend({ ...pad, background: "#000" }).toBuffer();
    return pipeline(sharp(padded).extract(area).resize(TW, TH, { fit: "fill", kernel: "lanczos3" }));
  };
  const rgb = await framed(`${dir}people/${speaker.photo}`, (s) => s.modulate({ saturation: 1.04 }).raw().toBuffer());
  const mask = await framed(`${dir}masks/${speaker.photo.replace(/\.\w+$/, ".png")}`, (s) => s.grayscale().blur(0.8).raw().toBuffer());
  // Where a photo runs out before the tile does, the person dissolves into
  // the tile instead of ending in a hard edge.
  const edge = {
    left: (pad.left / crop.width) * TW,
    right: TW - (pad.right / crop.width) * TW,
    bottom: TH - (pad.bottom / crop.height) * TH,
  };
  const FADE = 70;
  const rgba = Buffer.alloc(TW * TH * 4);
  for (let i = 0; i < TW * TH; i++) {
    const x = i % TW;
    const y = Math.floor(i / TW);
    const inside =
      (pad.bottom ? 1 - smooth((y - (edge.bottom - FADE)) / FADE) : 1) *
      (pad.left ? smooth((x - edge.left) / FADE) : 1) *
      (pad.right ? 1 - smooth((x - (edge.right - FADE)) / FADE) : 1);
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = Math.round(255 * smooth((mask[i] / 255 - 0.35) / 0.4) * inside);
  }
  const person = await sharp(rgba, { raw: { width: TW, height: TH, channels: 4 } }).png().toBuffer();
  const cx = TW / 2;
  const cy = TH * FACE.cy;
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}"><defs><radialGradient id="g" cx="${cx}" cy="${cy}" r="${TH * 0.62}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${LIVE}" stop-opacity="0.42"/><stop offset="0.55" stop-color="${LIVE}" stop-opacity="0.1"/><stop offset="1" stop-color="${LIVE}" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="${TILE}"/><rect width="100%" height="100%" fill="url(#g)"/>${TEXTURE}</svg>`,
  );
  return sharp(background).composite([{ input: person }]).jpeg({ quality: 92 }).toBuffer();
}
const portraits = await Promise.all(speakers.map(portraitTile));

// --- Logos ------------------------------------------------------------------------------
// Official consulate marks on white. The Peru mark ships on cream; its
// background is keyed to white so every logo sits on the same ground.
async function onWhite(file, key = false) {
  const input = sharp(await readFile(asset(file))).ensureAlpha();
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
  const border = [];
  for (let x = 0; x < info.width; x += 7) border.push(x * 4, ((info.height - 1) * info.width + x) * 4);
  const med = [0, 1, 2].map((ch) => border.map((i) => data[i + ch]).sort((a, b) => a - b)[border.length >> 1]);
  const keyed = key;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(data[i + ch] * a + 255 * (1 - a));
    data[i + 3] = 255;
    if (keyed) {
      const d = Math.hypot(data[i] - med[0], data[i + 1] - med[1], data[i + 2] - med[2]);
      const w = 1 - smooth((d - 12) / 40);
      for (let ch = 0; ch < 3; ch++) data[i + ch] = Math.round(data[i + ch] + (255 - data[i + ch]) * w);
    }
  }
  const png = await sharp(data, { raw: info }).trim({ background: "#ffffff", threshold: 12 }).png().toBuffer();
  const meta = await sharp(png).metadata();
  return { png, ratio: meta.width / meta.height };
}
const logoFiles = [
  ["Colombia", `${dir}logos/co.png`],
  ["México", "public/images/consulates/mx.webp"],
  ["Perú", `${dir}logos/pe.jpg`, true],
  ["Chile", "public/images/consulates/cl.webp"],
  ["Uruguay", "public/images/consulates/uy.webp"],
  ["Guatemala", `${dir}logos/gt.webp`],
  ["Brasil", "public/images/consulates/br.webp"],
  ["HCCSF", `${dir}logos/hccsf.jpg`],
];
const logos = await Promise.all(logoFiles.map(async ([label, file, key]) => ({ label, ...(await onWhite(file, key)) })));

// --- Layout -------------------------------------------------------------------------------
const bridge = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" fill="#fff"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="#fff" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`,
);

const tile = (i, span = 1, ...children) => {
  const { x, y } = cell(i);
  const width = cellW * span + GRID.gap * (span - 1);
  return abs({ left: px(x), top: px(y), width: px(width), height: px(GRID.cellH), borderRadius: px(14), overflow: "hidden", background: TILE }, ...children);
};
const portraitCell = (s, i) =>
  tile(
    i,
    1,
    h("img", { src: dataUrl(portraits[i], "image/jpeg"), width: TW, height: TH, style: { position: "absolute", top: 0, left: 0 } }),
    abs({ left: 0, top: 0, width: px(cellW), height: px(GRID.cellH), background: "linear-gradient(180deg, rgba(9,9,9,0) 54%, rgba(9,9,9,0.8) 76%, rgba(9,9,9,0.98) 100%)" }),
    nameplate(s),
  );
const nameplate = (s) =>
  abs(
    { left: px(14), bottom: px(12), width: px(cellW - 28), flexDirection: "column", gap: px(3) },
    words(s.name, { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(16), letterSpacing: px(-0.3), color: "#fff", flexWrap: "wrap", rowGap: 0 }, 4),
    span(s.role, { fontSize: px(11.5), color: "rgba(255,255,255,0.62)" }),
  );

// The date fills whatever the speakers leave in the last row.
const dateSpan = GRID.cols - (speakers.length % GRID.cols || GRID.cols) || GRID.cols;
const dateTile = () =>
  tile(
    speakers.length,
    dateSpan,
    box(
      { flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: `${px(18)}px ${px(20)}px ${px(16)}px`, background: "#f4f1ea", color: "#000" },
      box({ alignItems: "center", gap: px(8), fontSize: px(13), fontWeight: 500 }, h("span", { style: { width: px(7), height: px(7), borderRadius: 999, background: LIVE } }), span("Miércoles")),
      box(
        { alignItems: "flex-end", gap: px(14) },
        span("7", { fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(118), lineHeight: 0.8, letterSpacing: px(-5) }),
        span("de octubre", { fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(40), lineHeight: 1, letterSpacing: px(-1.4), marginBottom: px(2) }),
      ),
      box(
        { justifyContent: "space-between", fontSize: px(12.5), color: "#5d5a55" },
        span("10:00 a.m. – 3:00 p.m. PT · San Francisco"),
        span("Entrada gratuita"),
      ),
    ),
  );

const BAND = { y: 736 };
const logoCell = { w: 984 / 4, h: (1080 - BAND.y - 58) / 2 };
const logoBox = (logo, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  // Seals and wordmarks read at the same optical size.
  const maxH = logo.ratio < 1.3 ? 92 : 66;
  const maxW = 184;
  const hgt = Math.min(maxH, maxW / logo.ratio);
  return abs(
    { left: px(48 + col * logoCell.w), top: px(BAND.y + 48 + row * logoCell.h), width: px(logoCell.w), height: px(logoCell.h), alignItems: "center", justifyContent: "center", borderLeft: col ? `${px(1)}px solid rgba(0,0,0,0.08)` : "none", borderTop: row ? `${px(1)}px solid rgba(0,0,0,0.08)` : "none" },
    img(logo.png, hgt * logo.ratio, hgt, "image/png"),
  );
};

const image = new ImageResponse(
  box(
    { width: size, height: size, position: "relative", background: DARK, fontFamily: "Inter", color: "#fff" },
    ...speakers.map(portraitCell),
    dateTile(),

    abs(
      { left: px(56), top: px(40), width: px(968), height: px(40), alignItems: "center", justifyContent: "space-between" },
      box(
        { alignItems: "center", gap: px(12) },
        img(bridge, 29, 22),
        words("LATAM AI Summit", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(22), letterSpacing: px(-0.4) }, 6),
      ),
      span("#SFTechWeek", { fontSize: px(16), fontWeight: 500, color: "rgba(255,255,255,0.7)" }),
    ),
    abs(
      { left: px(54), top: px(100), flexDirection: "column" },
      box(
        { alignItems: "baseline", fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(64), lineHeight: 1.02, letterSpacing: px(-2.4) },
        words("Los latinos que construyen IA", {}, 16),
      ),
      box(
        { alignItems: "baseline", fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(64), lineHeight: 1.02, letterSpacing: px(-2.4) },
        box({ gap: px(16) }, span("en"), span("Silicon"), box({ alignItems: "baseline" }, span("Valley"), span(".", { color: LIVE, marginLeft: px(-11) }))),
      ),
    ),

    // Consulates and allies on a paper band, in their official colours.
    abs({ left: 0, top: px(BAND.y), width: size, height: px(1080 - BAND.y), background: "#fff" }),
    abs(
      { left: px(56), top: px(BAND.y + 18), width: px(968), justifyContent: "space-between", fontSize: px(13), color: "#777169" },
      span("Un evento de los consulados de Colombia, México, Perú, Chile, Uruguay, Guatemala y Brasil"),
      span("Con HCCSF"),
    ),
    ...logos.map(logoBox),
  ),
  { width: size, height: size, fonts },
);

await mkdir(asset("marketing/"), { recursive: true });
const out = asset("marketing/latam-ai-summit-speakers.png");
await writeFile(out, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${out.pathname}`);
