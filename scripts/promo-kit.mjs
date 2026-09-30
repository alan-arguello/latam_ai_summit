// Shared kit for LATAM AI Summit promo images rendered with next/og:
// design-system tokens, fonts, layout helpers, the frame and the logos.
import { readFile } from "node:fs/promises";
import { createElement as h } from "react";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
export const asset = (path) => new URL(path, root);
export const dataUrl = (buffer, type = "image/png") =>
  `data:${type};base64,${buffer.toString("base64")}`;
export const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : null;
};

export const S = 2; // Design at 1080, render at 2×.
export const px = (value) => value * S;
export const size = px(1080);

// Tokens from src/app/design-system.css.
export const PAPER = "#fdfcfc";
export const SURFACE = "#f5f3f1";
export const INK = "#000";
export const INK2 = "#2b2926";
export const MUTED = "#777169";
export const LINE = "rgba(0,0,0,0.08)";
const TICK = "rgba(0,0,0,0.22)";
export const LIVE = "#ff4f2b";
export const REPLIT = "#F26207";

// Photos: EXIF-rotated, cropped and resized to an exact design-unit frame.
export const photo = async (path, crop, width, height) =>
  sharp(await readFile(asset(path)))
    .rotate()
    .extract(crop)
    .resize(px(width), px(height), { fit: "cover", position: "north" })
    .jpeg({ quality: 92 })
    .toBuffer();

const logoPath = async (name) =>
  (await readFile(asset(`public/images/logos/${name}.svg`), "utf8")).match(/ d="([^"]+)"/)[1];
export const replitMark = async (fill) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${await logoPath("replit")}" fill="${fill}"/></svg>`);
export const openaiMark = async (fill) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${await logoPath("openai")}" fill="${fill}"/></svg>`);
// Same geometry as <LogoMark /> on the site.
export const bridge = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" fill="${INK}"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="${INK}" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`,
);

const font = (name) => readFile(asset(`scripts/fonts/${name}.ttf`));
const [displayLight, displayMedium, text, textMedium] = await Promise.all([
  font("HostGrotesk-300"),
  font("HostGrotesk-500"),
  font("Inter-400"),
  font("Inter-500"),
]);
export const fonts = [
  { name: "Host Grotesk", data: displayLight, weight: 300, style: "normal" },
  { name: "Host Grotesk", data: displayMedium, weight: 500, style: "normal" },
  { name: "Inter", data: text, weight: 400, style: "normal" },
  { name: "Inter", data: textMedium, weight: 500, style: "normal" },
];

export const box = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);
export const abs = (style, ...children) => box({ position: "absolute", ...style }, ...children);
export const span = (value, style) => h("span", { style }, value);
// Satori does not tighten word spaces with negative tracking; set words apart.
export const words = (value, style, gap) =>
  box({ gap: px(gap), ...style }, ...value.split(" ").map((w) => h("span", null, w)));
export const img = (buffer, w, hgt, type = "image/svg+xml") =>
  h("img", { src: dataUrl(buffer, type), width: px(w), height: px(hgt) });
const raise = `0 0 ${px(1)}px rgba(0,0,0,0.4), 0 ${px(1)}px ${px(1)}px rgba(0,0,0,0.04), 0 ${px(2)}px ${px(4)}px rgba(0,0,0,0.04)`;
export const pill = (children, style = {}) =>
  box(
    { alignItems: "center", gap: px(9), height: px(38), padding: `0 ${px(15)}px`, borderRadius: 999, background: "#fff", boxShadow: raise, fontFamily: "Inter", fontWeight: 500, fontSize: px(16), color: INK, ...style },
    ...children,
  );
export const dot = (color = LIVE) =>
  h("span", { style: { width: px(8), height: px(8), borderRadius: 999, background: color } });
export const arrow = (color) =>
  h("svg", { width: px(18), height: px(18), viewBox: "0 0 24 24", fill: "none" },
    h("path", { d: "M6 18 18 6M8 6h10v10", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }),
  );

const cross = (x, y) =>
  abs(
    { left: px(x - 6), top: px(y - 6), width: px(13), height: px(13) },
    abs({ left: px(6), top: 0, width: px(1), height: px(13), background: TICK }),
    abs({ left: 0, top: px(6), width: px(13), height: px(1), background: TICK }),
  );

// Hairline rails and rules with crosshairs, as on the website.
export const frame = (top, bottom) => [
  abs({ left: px(48), top: 0, width: px(1), height: size, background: LINE }),
  abs({ left: px(1032), top: 0, width: px(1), height: size, background: LINE }),
  abs({ left: 0, top: px(top), width: size, height: px(1), background: LINE }),
  abs({ left: 0, top: px(bottom), width: size, height: px(1), background: LINE }),
  cross(48, top),
  cross(1032, top),
  cross(48, bottom),
  cross(1032, bottom),
];

export const header = (label) =>
  abs(
    { left: px(72), top: px(37), width: px(936), height: px(40), alignItems: "center", justifyContent: "space-between" },
    box(
      { alignItems: "center", gap: px(12) },
      img(bridge, 29, 22),
      words("LATAM AI Summit", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(22), letterSpacing: px(-0.4) }, 6),
    ),
    pill([span(label)]),
  );

export const registerButton = (label = "Regístrate gratis") =>
  box(
    { alignItems: "center", gap: px(10), height: px(56), padding: `0 ${px(24)}px 0 ${px(28)}px`, borderRadius: 999, background: INK, color: "#fff", fontSize: px(19), fontWeight: 500 },
    span(label),
    arrow("#fff"),
  );
