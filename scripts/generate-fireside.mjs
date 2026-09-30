// Square promo (2160×2160) for the Replit fireside chat at LATAM AI Summit.
//   node scripts/generate-fireside.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import {
  abs,
  asset,
  box,
  dataUrl,
  dot,
  fonts,
  frame,
  header,
  img,
  INK,
  INK2,
  MUTED,
  PAPER,
  photo,
  pill,
  px,
  registerButton,
  REPLIT,
  replitMark,
  size,
  span,
  SURFACE,
  words,
} from "./promo-kit.mjs";

// Photo cards: both speakers cropped to the same landscape frame.
const PHOTO = { w: 444, h: 344 };
const [luis, alan, replit] = await Promise.all([
  // Portrait from Luis's interview with Braintrust; crop clear of the caption.
  photo("assets/fireside/luis-hector-chavez.jpg", { left: 330, top: 0, width: 640, height: 496 }, PHOTO.w, PHOTO.h),
  // Alan moderating a fireside, mic in hand.
  photo("assets/fireside/alan-arguello.jpg", { left: 880, top: 520, width: 1500, height: 1162 }, PHOTO.w, PHOTO.h),
  replitMark(REPLIT),
]);

const card = ({ image, badge, name, role, x }) =>
  abs(
    { left: px(x), top: px(410), width: px(460), height: px(470), flexDirection: "column", padding: px(8), borderRadius: px(22), background: SURFACE },
    box(
      { position: "relative", width: px(PHOTO.w), height: px(PHOTO.h), borderRadius: px(16), overflow: "hidden" },
      h("img", { src: dataUrl(image, "image/jpeg"), width: px(PHOTO.w), height: px(PHOTO.h), style: { position: "absolute", top: 0, left: 0 } }),
      ...(badge ? [abs({ left: px(12), top: px(12) }, badge)] : []),
    ),
    box(
      { flexDirection: "column", gap: px(8), padding: `${px(20)}px ${px(12)}px 0` },
      span(name, { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(28), letterSpacing: px(-0.6), color: INK }),
      role,
    ),
  );

const image = new ImageResponse(
  box(
    { width: size, height: size, position: "relative", background: PAPER, fontFamily: "Inter", color: INK },
    ...frame(112, 920),
    header("#SFTechWeek · 7 de octubre"),

    // Title.
    abs(
      { left: px(70), top: px(152), flexDirection: "column" },
      pill([dot(), span("Fireside chat")], { alignSelf: "flex-start", marginLeft: px(2) }),
      box(
        { flexDirection: "column", marginTop: px(24), fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(74), lineHeight: 1, letterSpacing: px(-2.8), color: INK },
        words("Construyendo una compañía", {}, 20),
        words("de $9 mil millones", { marginTop: px(6) }, 20),
      ),
    ),

    card({
      x: 72,
      image: luis,
      name: "Luis Héctor Chávez",
      badge: pill([img(replit, 18, 18), span("Replit", { fontFamily: "Host Grotesk", fontSize: px(18), letterSpacing: px(-0.3) })]),
      role: box(
        { alignItems: "center", gap: px(10), fontSize: px(18), color: INK2 },
        span("Speaker", { color: MUTED }),
        span("·", { color: MUTED }),
        span("CTO de Replit"),
      ),
    }),
    card({
      x: 548,
      image: alan,
      name: "Alan Argüello",
      role: box({ alignItems: "center", gap: px(10), fontSize: px(18), color: INK2 }, span("Moderador", { color: MUTED })),
    }),

    // Footer.
    abs(
      { left: px(72), top: px(920), width: px(936), height: px(160), alignItems: "center", justifyContent: "space-between" },
      box(
        { flexDirection: "column", gap: px(6) },
        span("Miércoles 7 de octubre, 2026", { fontSize: px(22), fontWeight: 500, color: INK }),
        span("Consulado General de Colombia · San Francisco", { fontSize: px(17), color: MUTED }),
      ),
      registerButton(),
    ),
  ),
  { width: size, height: size, fonts },
);

await mkdir(asset("marketing/"), { recursive: true });
const out = asset("marketing/fireside-replit-luis-hector-chavez.png");
await writeFile(out, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${out.pathname}`);
