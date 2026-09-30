// Generates the share images, public/images/opengraph.png (Spanish) and
// opengraph-en.png (English), 1200×630, plus src/app/icon.png.
// The hero photograph with the title, the speakers' faces and the seven
// consulates' flags. Run with `npm run og` after changing the photo, date,
// venue or lineup.
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

// Same photograph as the hero, enlarged so the tower (at 41.7% × 33% of the
// original) stands on the right, clear of the title.
const TOWER = { x: 0.417, y: 0.333 };
const hero = sharp(await readFile(asset("public/images/photos/golden-gate-fog.webp")));
const { width: heroW, height: heroH } = await hero.metadata();
const zoom = 960 / (TOWER.x * heroW);
const top = Math.round(TOWER.y * heroH * zoom - 205);
const photo = await hero
  .resize(Math.round(heroW * zoom), Math.round(heroH * zoom))
  .extract({ left: 0, top, width, height })
  .jpeg({ quality: 90 })
  .toBuffer();

// Same geometry as <LogoMark />.
const mark = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" fill="${color}"><rect x="5" y="0" width="2.2" height="20"/><rect x="18.8" y="0" width="2.2" height="20"/><path d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12" fill="none" stroke="${color}" stroke-width="1.5"/><rect x="0" y="12.6" width="26" height="1.8"/></svg>`;

// Round portraits with a white ring, drawn at 2× and shown at AVATAR px.
const AVATAR = 66;
const ring = (inner) =>
  sharp({ create: { width: 132, height: 132, channels: 4, background: "#fff" } })
    .composite([
      { input: inner, left: 5, top: 5 },
      { input: Buffer.from('<svg width="132" height="132"><circle cx="66" cy="66" r="66"/></svg>'), blend: "dest-in" },
    ])
    .png()
    .toBuffer();
const circle = (size) =>
  Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
const portrait = async (id) =>
  ring(
    await sharp(await readFile(asset(`public/images/people/${id}.webp`)))
      .resize(122, 122)
      .composite([{ input: circle(122), blend: "dest-in" }])
      .png()
      .toBuffer(),
  );
const openaiPath = (await readFile(asset("public/images/logos/openai.svg"), "utf8")).match(/ d="([^"]+)"/)[1];
const openai = await ring(
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="122" height="122" viewBox="0 0 122 122"><circle cx="61" cy="61" r="61" fill="#111"/><g transform="translate(39 39) scale(1.833)"><path fill="#fff" d="${openaiPath}"/></g></svg>`,
    ),
  )
    .png()
    .toBuffer(),
);
// In agenda order, as on the site.
const lineup = await Promise.all(
  [
    "luisa-dalla-costa",
    "maria-gracia-lagos",
    "paolo-privitera",
    "nicolas-lopez",
    "juan-pablo-linares",
    "victor-laguna",
    "nicolas-loeff",
  ].map(portrait),
);
const faces = [...lineup, openai, await portrait("luis-hector-chavez")];

const flags = await Promise.all(
  ["co", "pe", "cl", "uy", "br", "mx", "gt"].map(async (code) =>
    sharp(await readFile(asset(`public/images/flags/${code}.webp`)))
      .resize(60, 40)
      .composite([{ input: Buffer.from('<svg width="60" height="40"><rect width="60" height="40" rx="7"/></svg>'), blend: "dest-in" }])
      .png()
      .toBuffer(),
  ),
);

const font = (name) => readFile(asset(`scripts/fonts/${name}.ttf`));
const [displayLight, displayMedium, text, textMedium] = await Promise.all([
  font("HostGrotesk-300"),
  font("HostGrotesk-500"),
  font("Inter-400"),
  font("Inter-500"),
]);

const row = (style, ...children) =>
  h("div", { style: { display: "flex", ...style } }, ...children);
// Words set apart explicitly: Satori does not tighten spaces with tracking.
// One gap per word break, set by eye ("M A" reads wider than "I S").
const words = (line, gaps, style) =>
  row(
    style,
    ...line.split(" ").map((word, index) =>
      h("span", { style: { marginLeft: index ? gaps[index - 1] : 0 } }, word),
    ),
  );
const layer = (background) =>
  h("div", { style: { position: "absolute", top: 0, left: 0, width, height, background } });
const caption = (label, value) =>
  row(
    { flexDirection: "column", gap: 4 },
    h("span", { style: { fontFamily: "Inter", fontSize: 15, color: "rgba(255,255,255,0.62)" } }, label),
    h("span", { style: { fontFamily: "Inter", fontWeight: 500, fontSize: 19, color: "#fff" } }, value),
  );

const copy = {
  es: {
    file: "public/images/opengraph.png",
    kicker: "7 consulados · 1 comunidad · #SFTechWeek",
    date: "Miércoles 7 de octubre · San Francisco",
    detail: "Consulado General de Colombia · Español e inglés · Entrada gratuita",
    speakersLabel: "Speakers",
    speakers: "Replit, OpenAI, Latitud, Zapia y más",
  },
  en: {
    file: "public/images/opengraph-en.png",
    kicker: "7 consulates · 1 community · #SFTechWeek",
    date: "Wednesday, October 7 · San Francisco",
    detail: "Consulate General of Colombia · English & Spanish · Free",
    speakersLabel: "Speakers",
    speakers: "Replit, OpenAI, Latitud, Zapia and more",
  },
};

for (const locale of Object.values(copy)) {
  const image = new ImageResponse(
    row(
      { width, height, position: "relative", fontFamily: "Host Grotesk", color: "#fff", background: "#1b1d3a" },
      h("img", {
        src: dataUrl(photo, "image/jpeg"),
        width,
        height,
        style: { position: "absolute", top: 0, left: 0 },
      }),
      // Ink from the left for the title, and from the bottom for the lineup.
      layer("linear-gradient(90deg, rgba(9,10,30,0.72) 0%, rgba(9,10,30,0.42) 42%, rgba(9,10,30,0) 72%)"),
      layer("linear-gradient(180deg, rgba(9,10,30,0.25) 0%, rgba(9,10,30,0) 22%, rgba(9,10,30,0) 50%, rgba(9,10,30,0.82) 100%)"),
      row(
        {
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "46px 56px 44px",
        },
        // Brand and date.
        row(
          { justifyContent: "space-between", alignItems: "center" },
          row(
            { alignItems: "center", gap: 12 },
            h("img", { src: dataUrl(Buffer.from(mark("#fff")), "image/svg+xml"), width: 30, height: 23 }),
            words("LATAM AI Summit", [4, 6], { fontWeight: 500, fontSize: 24, letterSpacing: -0.5 }),
          ),
          row(
            { gap: 7 },
            ...flags.map((flag) => h("img", { src: dataUrl(flag), width: 33, height: 22 })),
          ),
        ),
        // Title.
        row(
          { flexDirection: "column", marginTop: -8 },
          h(
            "span",
            { style: { fontFamily: "Inter", fontWeight: 500, fontSize: 19, letterSpacing: 0.2, color: "rgba(255,255,255,0.78)" } },
            locale.kicker,
          ),
          words("LATAM AI Summit", [13, 22], { marginTop: 14, fontWeight: 300, fontSize: 108, lineHeight: 1, letterSpacing: -4 }),
          words(locale.date, Array(8).fill(7), { marginTop: 18, fontWeight: 300, fontSize: 38, letterSpacing: -0.8 }),
          h("span", { style: { marginTop: 10, fontFamily: "Inter", fontSize: 18, color: "rgba(255,255,255,0.72)" } }, locale.detail),
        ),
        // The lineup, in agenda order.
        row(
          { justifyContent: "space-between", alignItems: "flex-end" },
          row(
            { alignItems: "center", gap: 20 },
            row(
              { alignItems: "center" },
              ...faces.map((face, index) =>
                h("img", {
                  src: dataUrl(face),
                  width: AVATAR,
                  height: AVATAR,
                  style: { marginLeft: index ? -16 : 0 },
                }),
              ),
            ),
            caption(locale.speakersLabel, locale.speakers),
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
  const og = asset(locale.file);
  await writeFile(og, Buffer.from(await image.arrayBuffer()));
  console.log(`Generated ${og.pathname}`);
}

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
