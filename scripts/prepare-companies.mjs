// Prepares the speakers' company logos for the site from the originals in
// assets/companies (each taken from the company's own website, or sent by the
// organizers): SVGs get their viewBox cropped to the drawn art and a fixed
// size removed; rasters are trimmed and saved as WebP with transparency.
// Prints each ratio for src/lib/summit.ts.
//   node scripts/prepare-companies.mjs
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, basename } from "node:path";
import sharp from "sharp";

const asset = (path) => new URL(`../${path}`, import.meta.url);
await mkdir(asset("public/images/companies/"), { recursive: true });

for (const file of (await readdir(asset("assets/companies/"))).sort()) {
  const name = basename(file, extname(file));
  const source = await readFile(asset(`assets/companies/${file}`));
  if (extname(file) === ".svg") {
    let svg = source.toString("utf8");
    const [x, y, w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
    // Measure the art on a render; keep descenders and thin strokes.
    const scale = 2000 / w;
    const render = await sharp(
      Buffer.from(svg.replace(/<svg\b[^>]*?>/, (tag) => tag.replace(/\s(width|height)="[^"]*"/g, "").replace("<svg", `<svg width="${w * scale}" height="${h * scale}"`))),
    )
      .png()
      .toBuffer();
    const { info } = await sharp(render).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).toBuffer({ resolveWithObject: true });
    const round = (n) => +n.toFixed(2);
    const box = [x - info.trimOffsetLeft / scale, y - info.trimOffsetTop / scale, info.width / scale, info.height / scale].map(round);
    svg = svg
      .replace(/<svg\b[^>]*?>/, (tag) => tag.replace(/\s(width|height|class)="[^"]*"/g, ""))
      .replace(/viewBox="[^"]+"/, `viewBox="${box.join(" ")}"`);
    await writeFile(asset(`public/images/companies/${name}.svg`), svg);
    console.log(`public/images/companies/${name}.svg  ratio ${(box[2] / box[3]).toFixed(3)}`);
  } else {
    const out = await sharp(source)
      .ensureAlpha()
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .resize({ height: 160, withoutEnlargement: true })
      .webp({ quality: 92, alphaQuality: 100 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(asset(`public/images/companies/${name}.webp`), out.data);
    console.log(`public/images/companies/${name}.webp  ${out.info.width}×${out.info.height}  ratio ${(out.info.width / out.info.height).toFixed(3)}`);
  }
}
