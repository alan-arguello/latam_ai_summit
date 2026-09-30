// Square line-up post (2160×2160): LATAM AI Summit speakers, OpenAI's
// participation and a countdown over the Golden Gate.
//   node scripts/generate-lineup.mjs              # days until 7 Oct 2026
//   node scripts/generate-lineup.mjs --days 7     # force a number
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import {
  abs,
  arg,
  asset,
  box,
  dataUrl,
  dot,
  fonts,
  frame,
  header,
  img,
  INK,
  MUTED,
  openaiMark,
  PAPER,
  photo,
  pill,
  px,
  registerButton,
  REPLIT,
  replitMark,
  size,
  span,
  words,
} from "./promo-kit.mjs";

const EVENT_DAY = Date.parse("2026-10-07T00:00:00-07:00");
const days = arg("days")
  ? Number(arg("days"))
  : Math.max(0, Math.ceil((EVENT_DAY - Date.now()) / 86_400_000));
const dayWord = days === 1 ? "día" : "días";

// Grid geometry (design units at 1080).
const GRID = { x: 72, y: 420, w: 936, gap: 12, cols: 4 };
const cellW = (GRID.w - GRID.gap * (GRID.cols - 1)) / GRID.cols;
const cellH = 300;
const cellX = (col) => GRID.x + col * (cellW + GRID.gap);
const ROW2 = { y: GRID.y + cellH + GRID.gap, h: 184 };

const latitud = await readFile(asset("public/images/logos/latitud.svg"));
const [replit, openai] = await Promise.all([replitMark(REPLIT), openaiMark("#fff")]);

const speakers = [
  {
    name: "Luis Héctor Chávez",
    role: "CTO · Replit",
    // Startupeable podcast cover; crop clear of the Replit wordmark.
    image: await photo("assets/lineup/luis-hector-chavez.png", { left: 103, top: 0, width: 435, height: 580 }, cellW, cellH),
    badge: pill([img(replit, 16, 16), span("Replit", { fontFamily: "Host Grotesk", fontSize: px(16), letterSpacing: px(-0.3) })], { height: px(32), padding: `0 ${px(12)}px`, gap: px(7) }),
  },
  {
    name: "Luisa Dalla Costa",
    role: "Partner · Latitud",
    image: await photo("public/images/speakers/luisa-dalla-costa.webp", { left: 10, top: 0, width: 300, height: 400 }, cellW, cellH),
    badge: pill([img(latitud, 54, 16)], { height: px(32), padding: `0 ${px(12)}px` }),
  },
  {
    name: "Alan Argüello",
    role: "EiR · Emma Group",
    // Golden hour in San Francisco, the Painted Ladies behind him.
    image: await photo("assets/lineup/alan-arguello-sf.jpg", { left: 753, top: 486, width: 788, height: 1050 }, cellW, cellH),
    badge: pill([span("Emma Group", { fontFamily: "Host Grotesk", fontSize: px(16), letterSpacing: px(-0.3) })], { height: px(32), padding: `0 ${px(12)}px` }),
  },
];

// The Golden Gate in fog, as a wide band for the countdown.
const bridge = await photo("public/images/photos/golden-gate-fog.webp", { left: 0, top: 230, width: 2800, height: 551 }, GRID.w, ROW2.h);

const speakerTile = (speaker, col) =>
  abs(
    { left: px(cellX(col)), top: px(GRID.y), width: px(cellW), height: px(cellH), borderRadius: px(18), overflow: "hidden", background: "#222" },
    h("img", { src: dataUrl(speaker.image, "image/jpeg"), width: px(cellW), height: px(cellH), style: { position: "absolute", top: 0, left: 0 } }),
    abs({ left: 0, top: 0, width: px(cellW), height: px(cellH), background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 76%, rgba(0,0,0,0.82) 100%)" }),
    abs({ left: px(10), top: px(10) }, speaker.badge),
    abs(
      { left: px(16), bottom: px(15), width: px(cellW - 32), flexDirection: "column", gap: px(4) },
      span(speaker.name, { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(19), lineHeight: 1.15, letterSpacing: px(-0.3), color: "#fff" }),
      span(speaker.role, { fontSize: px(14), color: "rgba(255,255,255,0.8)" }),
    ),
  );

const openaiTile = () =>
  abs(
    { left: px(cellX(3)), top: px(GRID.y), width: px(cellW), height: px(cellH), borderRadius: px(18), background: INK, flexDirection: "column", justifyContent: "space-between", padding: `${px(18)}px ${px(18)}px ${px(16)}px` },
    span("Con la participación de", { fontSize: px(14), color: "rgba(255,255,255,0.7)" }),
    box(
      { flexDirection: "column", alignItems: "flex-start", gap: px(14) },
      img(openai, 58, 58),
      span("OpenAI", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(38), letterSpacing: px(-1), color: "#fff" }),
    ),
    span("Speaker por anunciar", { fontSize: px(14), color: "rgba(255,255,255,0.7)" }),
  );

const countdownTile = () =>
  abs(
    { left: px(GRID.x), top: px(ROW2.y), width: px(GRID.w), height: px(ROW2.h), borderRadius: px(18), overflow: "hidden", color: "#fff" },
    h("img", { src: dataUrl(bridge, "image/jpeg"), width: px(GRID.w), height: px(ROW2.h), style: { position: "absolute", top: 0, left: 0 } }),
    abs({ left: 0, top: 0, width: px(GRID.w), height: px(ROW2.h), background: "linear-gradient(90deg, rgba(12,14,34,0.62) 0%, rgba(12,14,34,0.2) 55%, rgba(12,14,34,0.45) 100%)" }),
    abs(
      { left: px(24), top: 0, height: px(ROW2.h), flexDirection: "column", justifyContent: "center", gap: px(6) },
      box({ alignItems: "center", gap: px(8), fontSize: px(15), fontWeight: 500 }, dot("#fff"), span("Faltan")),
      box(
        { alignItems: "flex-end", gap: px(14) },
        span(String(days), { fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(112), lineHeight: 0.85, letterSpacing: px(-5), marginLeft: px(String(days).startsWith("1") ? -8 : -3) }),
        span(dayWord, { fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(38), lineHeight: 1, letterSpacing: px(-1.2), marginBottom: px(2) }),
      ),
    ),
    abs(
      { right: px(24), bottom: px(22), flexDirection: "column", alignItems: "flex-end", gap: px(4) },
      span("Miércoles 7 de octubre, 2026", { fontSize: px(18), fontWeight: 500 }),
      span("San Francisco, California", { fontSize: px(15), color: "rgba(255,255,255,0.85)" }),
    ),
  );

const image = new ImageResponse(
  box(
    { width: size, height: size, position: "relative", background: PAPER, fontFamily: "Inter", color: INK },
    ...frame(112, 928),
    header("#SFTechWeek · 7 de octubre"),

    abs(
      { left: px(70), top: px(146), flexDirection: "column" },
      pill([dot(), span("Evento en español · Entrada gratuita")], { alignSelf: "flex-start", marginLeft: px(2) }),
      box(
        { flexDirection: "column", marginTop: px(22), fontFamily: "Host Grotesk", fontWeight: 300, fontSize: px(64), lineHeight: 1.02, letterSpacing: px(-2.4), color: INK },
        words("Un día. Una comunidad.", {}, 17),
        words("Un idioma.", { marginTop: px(2) }, 17),
      ),
      span("La comunidad tech de Latinoamérica se reúne en San Francisco.", { marginTop: px(16), marginLeft: px(2), fontSize: px(20), color: MUTED }),
    ),

    ...speakers.map(speakerTile),
    openaiTile(),
    countdownTile(),

    abs(
      { left: px(72), top: px(928), width: px(936), height: px(152), alignItems: "center", justifyContent: "space-between" },
      box(
        { flexDirection: "column", gap: px(6) },
        span("LATAM AI Summit", { fontFamily: "Host Grotesk", fontWeight: 500, fontSize: px(22), letterSpacing: px(-0.4) }),
        span("Siete consulados latinoamericanos · Cupo limitado", { fontSize: px(16), color: MUTED }),
      ),
      registerButton(),
    ),
  ),
  { width: size, height: size, fonts },
);

await mkdir(asset("marketing/"), { recursive: true });
const out = asset(`marketing/lineup-latam-ai-summit-${days}-dias.png`);
await writeFile(out, Buffer.from(await image.arrayBuffer()));
console.log(`Generated ${out.pathname} (${days} ${dayWord})`);
