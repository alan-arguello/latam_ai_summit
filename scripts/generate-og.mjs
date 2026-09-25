// Generates public/images/opengraph.png (1200×630) and src/app/icon.png.
// Run with `npm run og` after changing the photo, date or venue.
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

// Same photograph as the hero, cropped so the tower sits just right of centre.
const photo = await sharp(
  await readFile(asset("public/images/photos/golden-gate-fog.webp")),
)
  .resize(width, height, { fit: "cover", position: "left" })
  .jpeg({ quality: 90 })
  .toBuffer();

// Same geometry as <LogoMark />.
const mark = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" fill="${color}"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="${color}" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`;

const font = (name) => readFile(asset(`scripts/fonts/${name}.ttf`));
const [displayLight, displayMedium, text, textMedium] = await Promise.all([
  font("HostGrotesk-300"),
  font("HostGrotesk-500"),
  font("Inter-400"),
  font("Inter-500"),
]);

const row = (style, ...children) =>
  h("div", { style: { display: "flex", ...style } }, ...children);
const pill = (label, dark = false) =>
  h(
    "span",
    {
      style: {
        display: "flex",
        alignItems: "center",
        height: 40,
        padding: "0 18px",
        borderRadius: 999,
        fontFamily: "Inter",
        fontWeight: 500,
        fontSize: 18,
        color: dark ? "#fff" : "#000",
        background: dark ? "rgba(255,255,255,0.16)" : "#fff",
        border: dark ? "1px solid rgba(255,255,255,0.32)" : "none",
      },
    },
    label,
  );

const image = new ImageResponse(
  row(
    { width, height, position: "relative", fontFamily: "Host Grotesk", color: "#fff" },
    h("img", {
      src: dataUrl(photo, "image/jpeg"),
      width,
      height,
      style: { position: "absolute", inset: 0 },
    }),
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        background:
          "linear-gradient(180deg, rgba(10,12,32,0.18) 0%, rgba(10,12,32,0) 30%, rgba(10,12,32,0.1) 55%, rgba(10,12,32,0.72) 100%)",
      },
    }),
    row(
      {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "44px 56px 50px",
      },
      row(
        { justifyContent: "space-between", alignItems: "center" },
        row(
          { alignItems: "center", gap: 12 },
          h("img", {
            src: dataUrl(Buffer.from(mark("#000")), "image/svg+xml"),
            width: 30,
            height: 23,
          }),
          row(
            { gap: 7, fontWeight: 500, fontSize: 26, letterSpacing: -0.5, color: "#000" },
            ...["LATAM", "AI", "Summit"].map((word) => h("span", null, word)),
          ),
        ),
        pill("#SFTechWeek"),
      ),
      row(
        { flexDirection: "column" },
        // Words set apart explicitly: Satori does not tighten spaces with tracking.
        row(
          { gap: 24, fontWeight: 300, fontSize: 116, lineHeight: 1, letterSpacing: -4 },
          ...["LATAM", "AI", "Summit"].map((word) => h("span", null, word)),
        ),
        h(
          "span",
          {
            style: {
              fontFamily: "Inter",
              fontSize: 26,
              marginTop: 18,
              color: "rgba(255,255,255,0.88)",
            },
          },
          "Miércoles 7 de octubre, 2026 · San Francisco",
        ),
        row(
          { gap: 10, marginTop: 30 },
          pill("Consulado General de Colombia"),
          pill("Evento en español", true),
          pill("Entrada gratuita", true),
        ),
      ),
    ),
  ),
  {
    width,
    height,
    fonts: [
      { name: "Host Grotesk", data: displayLight, weight: 300, style: "normal" },
      { name: "Host Grotesk", data: displayMedium, weight: 500, style: "normal" },
      { name: "Inter", data: text, weight: 400, style: "normal" },
      { name: "Inter", data: textMedium, weight: 500, style: "normal" },
    ],
  },
);
const og = asset("public/images/opengraph.png");
await writeFile(og, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${og.pathname}`);

// Favicon: the bridge mark in white on a black rounded tile.
const icon = asset("src/app/icon.png");
await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#000"/><g fill="#fff" transform="translate(12 16.6) scale(1.54)">${mark("#fff").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`,
  ),
  { density: 600 },
)
  .resize(256, 256)
  .png()
  .toFile(icon.pathname);
console.log(`Generated ${icon.pathname}`);
