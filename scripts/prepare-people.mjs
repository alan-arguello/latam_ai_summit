// Frames every speaker and organizer portrait the same way: a square crop
// around the face found by Apple's Vision framework (assets/people/faces.json),
// saved as WebP in public/images/people without upscaling.
//   swift scripts/detect-faces.swift assets/people/*.{jpg,webp} > assets/people/faces.json
//   node scripts/prepare-people.mjs
//
// Sources in assets/people are each person's LinkedIn profile photo, or an
// identical higher-resolution copy of it where one exists.
import { mkdir, readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import sharp from "sharp";

const asset = (path) => new URL(`../${path}`, import.meta.url);
const faces = JSON.parse(await readFile(asset("assets/people/faces.json"), "utf8"));

// Face width × FRAME = side of the square; the face centre sits at EYE_LINE.
const FRAME = 2.5;
const EYE_LINE = 0.44;
const MAX = 480;

await mkdir(asset("public/images/people/"), { recursive: true });
for (const [file, { width, height, faces: found }] of Object.entries(faces)) {
  const face = found[0];
  if (!face) throw new Error(`No face found in ${file}`);
  const side = Math.round(Math.min(face.w * FRAME, width, height));
  const cx = face.x + face.w / 2;
  const cy = face.y + face.h / 2;
  const left = Math.round(Math.min(Math.max(cx - side / 2, 0), width - side));
  const top = Math.round(Math.min(Math.max(cy - side * EYE_LINE, 0), height - side));
  const size = Math.min(side, MAX);
  const out = `public/images/people/${basename(file, extname(file))}.webp`;
  await sharp(await readFile(asset(`assets/people/${file}`)))
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { kernel: "lanczos3" })
    .webp({ quality: 90 })
    .toFile(asset(out).pathname);
  console.log(`${out}  ${size}×${size}`);
}
