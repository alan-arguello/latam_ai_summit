"use client";

import { useEffect, useRef } from "react";

// Fog made of characters. A slow noise field, drawn as monospaced glyphs,
// drifts left to right like the fog through the Golden Gate.
// - tone "ink": faint black glyphs on the paper around the hero copy. Cells
//   over [data-fog-clear] elements thin out (to the attribute's value, or
//   almost empty) so text stays crisp, and nothing is drawn below the
//   element matching `until`.
// - tone "light": white glyphs over a photo, only where the photo is bright
//   (the fog), sampled from the sibling <img>.
// Both layers read the field in page coordinates, so they line up. Near a
// fine pointer the glyphs thicken, like a lens. Paused off screen and when
// the tab is hidden; a single still frame with reduced motion.

const GLYPHS = " .·:-=+*#";
const FPS = 30;

// Value noise in 3D (x, y, time), two octaves.
function hash(x: number, y: number, z: number) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const fade = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const plane = (zz: number) =>
    lerp(
      lerp(hash(xi, yi, zz), hash(xi + 1, yi, zz), xf),
      lerp(hash(xi, yi + 1, zz), hash(xi + 1, yi + 1, zz), xf),
      yf,
    );
  return lerp(plane(zi), plane(zi + 1), zf);
}
const field = (x: number, y: number, t: number) =>
  noise(x, y, t) * 0.68 + noise(x * 2.3 + 17, y * 2.3 + 5, t * 1.6) * 0.32;
const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Rect = { left: number; top: number; right: number; bottom: number; keep: number };

export function AsciiFog({
  tone,
  className,
  until,
}: {
  tone: "ink" | "light";
  className?: string;
  until?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const host = canvas.parentElement!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let width = 0, height = 0, dpr = 1;
    let cellW = 9, cellH = 15, cols = 0, rows = 0, rowsDrawn = 0;
    let atlas: HTMLCanvasElement | null = null;
    let clear: Rect[] = [];
    let light: Float32Array | null = null;
    let pointer = { x: -1e4, y: -1e4 };
    let visible = true;
    let frame = 0;
    let last = 0;
    const born = performance.now();

    const buildAtlas = () => {
      const family =
        getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() ||
        "ui-monospace, monospace";
      atlas = document.createElement("canvas");
      atlas.width = Math.ceil(cellW * dpr) * GLYPHS.length;
      atlas.height = Math.ceil(cellH * dpr);
      const a = atlas.getContext("2d")!;
      a.scale(dpr, dpr);
      a.font = `${Math.round(cellH * 0.8)}px ${family}`;
      a.textAlign = "center";
      a.textBaseline = "middle";
      a.fillStyle = tone === "ink" ? "#000" : "#fff";
      [...GLYPHS].forEach((glyph, i) =>
        a.fillText(glyph, (Math.ceil(cellW * dpr) / dpr) * (i + 0.5), cellH / 2 + 0.5),
      );
    };

    // Luminance of the photo under each cell, with the <img>'s own cover crop.
    const sampleLight = () => {
      const img = host.querySelector("img");
      if (tone !== "light" || !img || !img.naturalWidth) return;
      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const s = sample.getContext("2d", { willReadFrequently: true })!;
      const [px, py] = getComputedStyle(img)
        .objectPosition.split(" ")
        .map((v) => parseFloat(v) / 100);
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      s.scale(cols / width, rows / height);
      s.drawImage(img, (width - w) * (px ?? 0.5), (height - h) * (py ?? 0.5), w, h);
      const data = s.getImageData(0, 0, cols, rows).data;
      light = new Float32Array(cols * rows);
      for (let i = 0; i < light.length; i++) {
        const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
        light[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      }
    };

    const measure = () => {
      const box = host.getBoundingClientRect();
      width = box.width;
      height = box.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const compact = width < 700;
      cellW = compact ? 8 : 9;
      cellH = compact ? 13 : 15;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cols = Math.ceil(width / cellW);
      rows = Math.ceil(height / cellH);
      rowsDrawn = rows;
      if (until) {
        const stop = host.querySelector(until);
        if (stop) rowsDrawn = Math.min(rows, Math.ceil((stop.getBoundingClientRect().top - box.top) / cellH));
      }
      clear = [...host.querySelectorAll<HTMLElement>("[data-fog-clear]")].map((el) => {
        const r = el.getBoundingClientRect();
        const keep = parseFloat(el.dataset.fogClear ?? "");
        return {
          left: r.left - box.left - 6,
          top: r.top - box.top - 4,
          right: r.right - box.left + 6,
          bottom: r.bottom - box.top + 4,
          keep: Number.isFinite(keep) ? keep : 0.06,
        };
      });
      buildAtlas();
      sampleLight();
    };

    const draw = (now: number) => {
      if (!atlas) return;
      const t = still ? 0 : (now - born) / 1000;
      // Fade in after the title has decoded.
      const intro = still ? 1 : smoothstep(0.35, 1.8, t);
      const box = host.getBoundingClientRect();
      const originX = box.left + window.scrollX;
      const originY = box.top + window.scrollY;
      const lensX = pointer.x - box.left;
      const lensY = pointer.y - box.top;
      const glyphW = Math.ceil(cellW * dpr);
      const glyphH = Math.ceil(cellH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drift = t * 14; // px per second, left to right
      const compact = width < 700;
      const base = tone === "ink" ? (compact ? 0.1 : 0.14) : 0.62;
      for (let row = 0; row < rowsDrawn; row++) {
        const y = row * cellH;
        for (let col = 0; col < cols; col++) {
          const x = col * cellW;
          const cx = x + cellW / 2, cy = y + cellH / 2;
          const n = field((originX + cx - drift) / 260, (originY + cy) / 190, t * 0.07);
          let density = tone === "light" ? smoothstep(0.36, 0.8, n) : smoothstep(0.42, 0.82, n);
          if (tone === "light") {
            density *= smoothstep(0.2, 0.6, light ? light[row * cols + col] : 0);
          } else {
            // Stronger to the right, where the hero has air.
            density *= 0.55 + 0.45 * smoothstep(0.2, 0.9, cx / width);
            // On phones the page gutters stay empty.
            if (compact) density *= smoothstep(16, 44, Math.min(cx, width - cx));
            // Feathered clearing around text: full `keep` inside, back to
            // normal 30px away.
            let open = 1;
            for (const r of clear) {
              const dx = Math.max(r.left - cx, 0, cx - r.right);
              const dy = Math.max(r.top - cy, 0, cy - r.bottom);
              open = Math.min(open, r.keep + (1 - r.keep) * smoothstep(0, 30, Math.hypot(dx, dy)));
            }
            density *= open;
          }
          let lens = 0;
          if (finePointer) {
            const d = Math.hypot(cx - lensX, cy - lensY);
            lens = 1 - smoothstep(30, 170, d);
          }
          const value = Math.min(0.9, density * (1 + lens * 0.9) + lens * 0.1);
          if (value < 0.04) continue;
          // Each cell dithers its glyph and weight, so the fog has grain
          // instead of contour lines.
          const grain = hash(col, row, 7);
          const level = Math.pow(value, 1.25) * (GLYPHS.length - 1) + (grain - 0.5) * 2.2;
          const glyph = Math.max(1, Math.min(GLYPHS.length - 1, Math.round(level)));
          const weight = 0.65 + 0.7 * hash(row, col, 3);
          ctx.globalAlpha = Math.min(1, base * value * weight * (1 + lens * 1.5)) * intro;
          ctx.drawImage(atlas, glyph * glyphW, 0, glyphW, glyphH, Math.round(x * dpr), Math.round(y * dpr), glyphW, glyphH);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    const onPointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const onLeave = () => {
      pointer = { x: -1e4, y: -1e4 };
    };

    let ready = false;
    const start = () => {
      ready = true;
      measure();
      if (still) draw(performance.now());
      else frame = requestAnimationFrame(loop);
    };
    const img = host.querySelector("img");
    const whenImage =
      tone === "light" && img
        ? img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => img.addEventListener("load", () => resolve(), { once: true }))
        : Promise.resolve();
    let cancelled = false;
    Promise.all([document.fonts.ready, whenImage]).then(() => {
      if (!cancelled) start();
    });

    const resize = new ResizeObserver(() => {
      if (!ready) return;
      measure();
      if (still) draw(performance.now());
    });
    resize.observe(host);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    seen.observe(host);
    if (finePointer && !still) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      seen.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [tone, until]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
