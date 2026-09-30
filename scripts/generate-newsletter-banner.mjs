// Newsletter banner (1200×600, exported at 2×): the hero photograph with the
// site's ASCII fog, the event facts and latamaisummit.org, over a card with
// the organizing consulates and the supporters. No speakers.
//   node scripts/generate-newsletter-banner.mjs
// Writes marketing/newsletter/latam-ai-summit-newsletter-{es,en}.{png,jpg}.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const asset = (path) => new URL(`../${path}`, import.meta.url);
const data = async (path, type) =>
  `data:${type};base64,${(await readFile(asset(path))).toString("base64")}`;

const WIDTH = 1200;
const HEIGHT = 600;
const URL_LABEL = "latamaisummit.org";

const fonts = {
  display300: await data("scripts/fonts/HostGrotesk-300.ttf", "font/ttf"),
  display500: await data("scripts/fonts/HostGrotesk-500.ttf", "font/ttf"),
  text400: await data("scripts/fonts/Inter-400.ttf", "font/ttf"),
  text500: await data("scripts/fonts/Inter-500.ttf", "font/ttf"),
  mono: await data("node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2", "font/woff2"),
};
const photo = await data("public/images/photos/golden-gate-fog.webp", "image/webp");

// Every mark covers about the same area, whatever its shape (as on the site).
const logo = async (path, ratio, area, max, scale = 1) => ({
  src: await data(path, path.endsWith(".svg") ? "image/svg+xml" : "image/webp"),
  height: Math.min(max, Math.round(Math.sqrt(area / ratio) * scale)),
});
const consulates = await Promise.all(
  [
    ["co", 2.419],
    ["pe", 1.226],
    ["cl", 1.1],
    ["uy", 2.706],
    ["br", 2.191],
    ["mx", 3.525],
    ["gt", 1],
  ].map(([code, ratio]) => logo(`public/images/consulates/${code}.webp`, ratio, 3900, 60)),
);
const supporters = await Promise.all([
  logo("public/images/supporters/hccsf.webp", 0.967, 3900, 60, 1.05),
  logo("public/images/supporters/ivy.webp", 0.49, 3900, 60),
  logo("public/images/supporters/emma.webp", 4.73, 3900, 60, 0.82),
  logo("public/images/supporters/torre.webp", 4.592, 3900, 60, 0.82),
]);

// Same geometry as <LogoMark />.
const mark = `<svg viewBox="0 0 26 20" fill="currentColor" aria-hidden="true"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`;

const copy = {
  es: {
    kicker: "#SFTechWeek · 7 consulados · 1 comunidad",
    date: "Miércoles 7 de octubre · 10:00 a.m. – 3:00 p.m. PT",
    venue: "War Memorial Veterans Building · San Francisco",
    cta: "Regístrate gratis",
    note: "Español e inglés · Entrada gratuita",
    hosts: "Organizan",
    support: "Con el apoyo de",
  },
  en: {
    kicker: "#SFTechWeek · 7 consulates · 1 community",
    date: "Wednesday, October 7 · 10:00 AM – 3:00 PM PT",
    venue: "War Memorial Veterans Building · San Francisco",
    cta: "Register for free",
    note: "English & Spanish · Free admission",
    hosts: "Hosted by",
    support: "Supported by",
  },
};

const page = (t) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: "Host Grotesk"; font-weight: 300; src: url(${fonts.display300}); }
@font-face { font-family: "Host Grotesk"; font-weight: 500; src: url(${fonts.display500}); }
@font-face { font-family: "Inter"; font-weight: 400; src: url(${fonts.text400}); }
@font-face { font-family: "Inter"; font-weight: 500; src: url(${fonts.text500}); }
@font-face { font-family: "Geist Mono"; font-weight: 400; src: url(${fonts.mono}); }
* { box-sizing: border-box; margin: 0; }
body { background: #fdfcfc; -webkit-font-smoothing: antialiased; }
.banner { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; padding: 20px; background: #fdfcfc; display: grid; grid-template-rows: 1fr auto; gap: 12px; font-family: "Inter"; color: #000; }
.stage { position: relative; overflow: hidden; border-radius: 22px; background: #1b1d3a; color: #fff; }
.stage img { position: absolute; }
.shade { position: absolute; inset: 0; background:
  linear-gradient(90deg, rgba(9,10,30,.74) 0%, rgba(9,10,30,.46) 38%, rgba(9,10,30,0) 66%),
  linear-gradient(180deg, rgba(9,10,30,.18) 0%, rgba(9,10,30,0) 30%, rgba(9,10,30,0) 62%, rgba(9,10,30,.5) 100%); }
#fog { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: screen; }
.copy { position: absolute; left: 40px; top: 32px; bottom: 30px; display: flex; flex-direction: column; }
.kicker { display: flex; align-items: center; gap: 10px; font: 500 15px/1 "Inter"; letter-spacing: .01em; color: rgba(255,255,255,.8); }
.kicker svg { width: 22px; height: 17px; color: #fff; }
h1 { margin-top: 14px; font: 300 82px/1 "Host Grotesk"; letter-spacing: -.035em; word-spacing: -.04em; }
.date { margin-top: 16px; font: 300 26px/1.2 "Host Grotesk"; letter-spacing: -.01em; }
.venue { margin-top: 6px; font: 400 15px/1.3 "Inter"; color: rgba(255,255,255,.74); }
.actions { margin-top: auto; display: flex; align-items: center; gap: 16px; }
.cta { display: inline-flex; align-items: center; gap: 12px; height: 46px; padding: 0 8px 0 20px; border-radius: 999px; background: #fff; color: #000; font: 500 16px/1 "Inter"; box-shadow: 0 10px 30px rgba(9,10,30,.35); }
.cta b { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 14px; border-radius: 999px; background: #000; color: #fff; font: 400 14px/1 "Geist Mono"; letter-spacing: -.01em; }
.cta b::after { content: "↗"; font-family: "Inter"; }
.note { font: 400 14px/1.3 "Inter"; color: rgba(255,255,255,.78); }
.live { position: absolute; top: 28px; right: 28px; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 13px; border-radius: 999px; background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.3); backdrop-filter: blur(10px); font: 500 13px/1 "Geist Mono"; color: #fff; }
.live::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #ff4f2b; box-shadow: 0 0 0 4px rgba(255,79,43,.25); }
.partners { display: grid; grid-template-rows: 1fr 1fr; padding: 4px 28px; border-radius: 18px; background: #fff; box-shadow: 0 0 0 .5px rgba(0,0,0,.08), 0 1.5px 3px rgba(0,0,0,.04); }
.row { display: flex; align-items: center; gap: 28px; min-height: 82px; }
.row + .row { border-top: 1px dashed rgba(0,0,0,.14); }
.label { flex: 0 0 118px; font: 500 13px/1.3 "Inter"; letter-spacing: .01em; color: #777169; }
.logos { flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 22px; }
.row:last-child .logos { padding-right: 38%; }
.logos img { display: block; width: auto; }
</style></head><body>
<div class="banner">
  <div class="stage" id="stage">
    <img id="photo" src="${photo}" alt="">
    <div class="shade"></div>
    <canvas id="fog"></canvas>
    <div class="copy">
      <p class="kicker">${mark}${t.kicker}</p>
      <h1>LATAM AI Summit</h1>
      <p class="date">${t.date}</p>
      <p class="venue">${t.venue}</p>
      <div class="actions">
        <span class="cta">${t.cta} <b>${URL_LABEL}</b></span>
        <span class="note">${t.note}</span>
      </div>
    </div>
    <span class="live">07.10.2026</span>
  </div>
  <div class="partners">
    <div class="row"><span class="label">${t.hosts}</span><div class="logos">${consulates.map((l) => `<img src="${l.src}" style="height:${l.height}px" alt="">`).join("")}</div></div>
    <div class="row"><span class="label">${t.support}</span><div class="logos">${supporters.map((l) => `<img src="${l.src}" style="height:${l.height}px" alt="">`).join("")}</div></div>
  </div>
</div>
<script>
// The photo, enlarged so the tower (41.7% × 33.3% of the original) stands on
// the right, then the site's ASCII fog (src/components/ascii-fog.tsx) as a
// still frame: white glyphs where the photo is bright.
const stage = document.getElementById("stage");
const img = document.getElementById("photo");
const canvas = document.getElementById("fog");
img.decode().then(() => document.fonts.ready).then(() => {
  const W = stage.clientWidth, H = stage.clientHeight;
  const zoom = 800 / (0.417 * img.naturalWidth);
  const w = img.naturalWidth * zoom, h = img.naturalHeight * zoom;
  const left = 0, top = 64 - 0.333 * h;
  Object.assign(img.style, { width: w + "px", height: h + "px", left: left + "px", top: top + "px" });

  const dpr = 2, cellW = 9, cellH = 15, cols = Math.ceil(W / cellW), rows = Math.ceil(H / cellH);
  const sample = document.createElement("canvas");
  sample.width = cols; sample.height = rows;
  const s = sample.getContext("2d");
  s.scale(cols / W, rows / H);
  s.drawImage(img, left, top, w, h);
  const px = s.getImageData(0, 0, cols, rows).data;

  const GLYPHS = " .·:-=+*#";
  const hash = (x, y, z) => { let q = x * 374761393 + y * 668265263 + z * 2147483647; q = (q ^ (q >>> 13)) * 1274126177; return ((q ^ (q >>> 16)) >>> 0) / 4294967295; };
  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const noise = (x, y, z) => { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi); const plane = (zz) => lerp(lerp(hash(xi, yi, zz), hash(xi + 1, yi, zz), xf), lerp(hash(xi, yi + 1, zz), hash(xi + 1, yi + 1, zz), xf), yf); return lerp(plane(zi), plane(zi + 1), zf); };
  const field = (x, y, t) => noise(x, y, t) * 0.68 + noise(x * 2.3 + 17, y * 2.3 + 5, t * 1.6) * 0.32;
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = Math.round(cellH * 0.8) + 'px "Geist Mono"';
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const cx = col * cellW + cellW / 2, cy = row * cellH + cellH / 2;
    const i = (row * cols + col) * 4;
    const lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    // Fog only: not the red tower, and off the copy on the left.
    const red = smooth(30, 70, px[i] - Math.max(px[i + 1], px[i + 2]));
    const open = smooth(560, 800, cx) * 0.85 + 0.15;
    const value = smooth(0.38, 0.82, field((cx + 140) / 260, cy / 190, 3.2)) * smooth(0.25, 0.62, lum) * open * (1 - red);
    if (value < 0.04) continue;
    const level = Math.pow(value, 1.25) * (GLYPHS.length - 1) + (hash(col, row, 7) - 0.5) * 2.2;
    const glyph = Math.max(1, Math.min(GLYPHS.length - 1, Math.round(level)));
    ctx.globalAlpha = Math.min(1, 0.5 * value * (0.65 + 0.7 * hash(row, col, 3)));
    ctx.fillText(GLYPHS[glyph], cx, cy + 0.5);
  }
  document.body.dataset.ready = "1";
});
</script>
</body></html>`;

await mkdir(asset("marketing/newsletter/"), { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
for (const [lang, t] of Object.entries(copy)) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
  await tab.setContent(page(t), { waitUntil: "load" });
  await tab.waitForSelector("body[data-ready]");
  const png = await (await tab.$(".banner")).screenshot({ type: "png" });
  const base = `marketing/newsletter/latam-ai-summit-newsletter-${lang}`;
  await writeFile(asset(`${base}.png`), png);
  // Email clients prefer a light JPEG.
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(asset(`${base}.jpg`).pathname);
  console.log(`${base}.png / .jpg  ${WIDTH * 2}×${HEIGHT * 2}`);
  await tab.close();
}
await browser.close();
