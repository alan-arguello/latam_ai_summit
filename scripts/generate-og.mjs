// Generates public/images/opengraph.png (1200x630) and src/app/icon.png.
// Run with `npm run og` after changing the hero photo, date or venue.
import { readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const asset = (path) => new URL(path, root);
const dataUrl = (buffer, type = "image/png") =>
  `data:${type};base64,${buffer.toString("base64")}`;
const width = 1200;
const height = 630;
const accent = "#ff5a1f";

// ASCII background from the same (mirrored) Golden Gate photo as the hero.
const columns = 150;
const rows = 53;
const glyphs = " .,:;+=xX#%@";
const photo = await sharp(await readFile(asset("public/images/hero/golden-gate.webp")))
  .resize(columns, rows, { fit: "cover", position: "centre" })
  .removeAlpha()
  .raw()
  .toBuffer();
const cells = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < columns; col++) {
    const i = (row * columns + col) * 3;
    const [red, green, blue] = [photo[i], photo[i + 1], photo[i + 2]];
    const light = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
    const glyph =
      glyphs[Math.min(glyphs.length - 1, Math.floor(Math.pow(light, 0.65) * glyphs.length))];
    if (glyph === " ") continue;
    const bridge = red > 95 && red > green * 1.45 && red > blue * 1.7;
    const x = col / columns;
    const y = row / rows;
    const reveal = 0.08 + Math.pow(x, 2.2) * 1.9;
    const sky = !bridge && y < 0.55 && light > 0.6 ? 0.1 : 1;
    const alpha = Math.min(bridge ? 0.95 : 0.8, (0.2 + light * 0.85) * reveal * sky * (bridge ? 1.35 : 1));
    const fill = bridge ? `rgba(255,90,31,${alpha.toFixed(3)})` : `rgba(214,214,214,${alpha.toFixed(3)})`;
    cells.push(`<text x="${col * 8}" y="${row * 12 + 10}" fill="${fill}">${glyph}</text>`);
  }
}
const background = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#090909"/><g font-family="monospace" font-size="10">${cells.join("")}</g><rect y="${height * 0.62}" width="100%" height="${height * 0.38}" fill="url(#fade)"/><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090909" stop-opacity="0"/><stop offset="0.8" stop-color="#090909"/></linearGradient></defs></svg>`,
  ),
)
  .png()
  .toBuffer();

// 5x7 bitmap letters, drawn as squares to echo Geist Pixel on the site.
const bitmap = {
  L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  M: ["X...X", "XX.XX", "X.X.X", "X.X.X", "X...X", "X...X", "X...X"],
};
function pixelWord(word, size, fill) {
  const rects = [];
  [...word].forEach((letter, index) => {
    bitmap[letter].forEach((line, y) =>
      [...line].forEach((pixel, x) => {
        if (pixel === "X")
          rects.push(
            `<rect x="${(index * 6 + x) * size}" y="${y * size}" width="${size}" height="${size}" fill="${fill}"/>`,
          );
      }),
    );
  });
  const w = (word.length * 6 - 1) * size;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${7 * size}" viewBox="0 0 ${w} ${7 * size}">${rects.join("")}</svg>`,
    width: w,
    height: 7 * size,
  };
}

// Same pixel "AI" tile as the site's LogoMark.
const markPixels = [
  [0, 1], [1, 0], [2, 1], [0, 2], [1, 2], [2, 2], [0, 3], [2, 3], [0, 4], [2, 4],
  [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
];
const mark = (radius = 3) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" rx="${radius}" fill="${accent}"/>${markPixels
    .map(([x, y]) => `<rect x="${4 + x * 4}" y="${4 + y * 4}" width="4" height="4" fill="#0b0b0b"/>`)
    .join("")}</svg>`;

const title = pixelWord("LATAM", 17, "#f2f2f2");
const sans = await readFile(asset("node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"));
const light = await readFile(asset("node_modules/geist/dist/fonts/geist-sans/Geist-Light.ttf"));
const mono = await readFile(asset("node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"));
const row = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);

const image = new ImageResponse(
  row(
    { width, height, position: "relative", background: "#090909", color: "#f2f2f2", fontFamily: "Geist" },
    h("img", { src: dataUrl(background), width, height, style: { position: "absolute", inset: 0 } }),
    row(
      {
        position: "absolute",
        inset: 0,
        width,
        height,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "46px 60px 44px",
      },
      row(
        { justifyContent: "space-between", alignItems: "center" },
        row(
          { alignItems: "center", gap: 14 },
          h("img", { src: dataUrl(Buffer.from(mark()), "image/svg+xml"), width: 40, height: 40 }),
          row(
            { flexDirection: "column", gap: 2 },
            h("span", { style: { fontSize: 20 } }, "LATAM AI Summit"),
            h("span", { style: { fontSize: 15, color: "#9a9a9a", fontFamily: "Geist Mono" } }, "#SFTechWeek · Evento en español"),
          ),
        ),
        h("span", { style: { fontSize: 18, color: "#bbb", fontFamily: "Geist Mono" } }, "San Francisco, CA"),
      ),
      row(
        { flexDirection: "column" },
        h("img", { src: dataUrl(Buffer.from(title.svg), "image/svg+xml"), width: title.width, height: title.height }),
        row(
          { alignItems: "baseline", marginTop: 18 },
          h("span", { style: { fontSize: 64, fontWeight: 300, color: "#dedede" } }, "AI Summit"),
          h("span", { style: { fontSize: 64, fontWeight: 300, color: accent, marginLeft: 6 } }, "_"),
        ),
        h(
          "span",
          { style: { fontSize: 24, color: "#b5b5b5", marginTop: 14 } },
          "Un día. Una comunidad. Un idioma.",
        ),
      ),
      row(
        { justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #3a3a3a", paddingTop: 24 },
        row(
          { flexDirection: "column", gap: 4 },
          h("span", { style: { fontSize: 24 } }, "Miércoles 7 de octubre, 2026"),
          h("span", { style: { fontSize: 17, color: "#9a9a9a" } }, "10:00 a.m. PT · Consulado de Colombia en San Francisco"),
        ),
        h(
          "span",
          {
            style: {
              display: "flex",
              background: accent,
              color: "#150700",
              fontSize: 20,
              padding: "14px 26px",
              borderRadius: 999,
            },
          },
          "Regístrate gratis",
        ),
      ),
    ),
  ),
  {
    width,
    height,
    fonts: [
      { name: "Geist", data: sans, weight: 400, style: "normal" },
      { name: "Geist", data: light, weight: 300, style: "normal" },
      { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
    ],
  },
);
const og = asset("public/images/opengraph.png");
await writeFile(og, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${og.pathname}`);

const icon = asset("src/app/icon.png");
await sharp(Buffer.from(mark(4)), { density: 900 }).resize(256, 256).png().toFile(icon.pathname);
console.log(`Generated ${icon.pathname}`);
