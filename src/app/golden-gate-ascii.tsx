"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const SOURCE = "/images/hero/golden-gate.webp";
const GLYPHS = " .,:;+=xX#%@";

// Renders the (mirrored) Golden Gate photo as ASCII. A second, brighter layer
// is revealed under the pointer through a CSS mask, so pointer moves never redraw.
export function GoldenGateAscii() {
  const root = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = root.current;
    const dim = base.current;
    const bright = glow.current;
    if (!container || !dim || !bright) return;
    const dimContext = dim.getContext("2d");
    const brightContext = bright.getContext("2d");
    const sample = document.createElement("canvas");
    const pixels = sample.getContext("2d", { willReadFrequently: true });
    if (!dimContext || !brightContext || !pixels) return;
    const photo = new window.Image();
    let frame = 0;
    let disposed = false;

    function draw() {
      if (!dim || !bright || !photo.naturalWidth || disposed) return;
      const { width, height } = dim.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const narrow = width < 700;
      for (const [canvas, context] of [
        [dim, dimContext],
        [bright, brightContext],
      ] as const) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context!.setTransform(ratio, 0, 0, ratio, 0, 0);
        context!.clearRect(0, 0, width, height);
      }
      const cell = narrow ? 5 : 7;
      const line = cell * 1.5;
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / line);
      sample.width = columns;
      sample.height = rows;
      // Cover crop. On narrow screens, keep the south tower in frame.
      const scale = Math.max(
        width / photo.naturalWidth,
        height / photo.naturalHeight,
      );
      const cropWidth = width / scale;
      const cropHeight = height / scale;
      pixels!.drawImage(
        photo,
        (photo.naturalWidth - cropWidth) * (narrow ? 0.7 : 0.5),
        (photo.naturalHeight - cropHeight) * 0.62,
        cropWidth,
        cropHeight,
        0,
        0,
        columns,
        rows,
      );
      const data = pixels!.getImageData(0, 0, columns, rows).data;
      const font = `${cell + 2}px monospace`;
      dimContext!.font = font;
      brightContext!.font = font;
      dimContext!.textBaseline = "top";
      brightContext!.textBaseline = "top";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const index = (row * columns + col) * 4;
          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];
          const light = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
          const x = col / columns;
          const y = row / rows;
          const glyph =
            GLYPHS[
              Math.min(
                GLYPHS.length - 1,
                Math.floor(Math.pow(light, 0.65) * GLYPHS.length),
              )
            ];
          if (glyph === " ") continue;
          // International orange: the bridge itself.
          const bridge = red > 95 && red > green * 1.45 && red > blue * 1.7;
          // Keep the title legible on the left; reveal the tower on the right.
          const reveal = narrow
            ? 0.05 + Math.pow(x, 2.4) * 1.3 + Math.max(0, y - 0.62) * 1.4
            : 0.1 + Math.pow(x, 2) * 2.3 + Math.max(0, y - 0.8) * 0.8;
          const sky = !bridge && y < 0.55 && light > 0.6 ? 0.1 : 1;
          const strength = (0.2 + light * 0.85) * sky;
          const px = col * cell;
          const py = row * line;
          const dimAlpha = Math.min(
            bridge ? 1 : 0.85,
            strength * reveal * (bridge ? 1.7 : 1),
          );
          dimContext!.fillStyle = bridge
            ? `rgba(255,90,31,${dimAlpha.toFixed(3)})`
            : `rgba(214,214,214,${dimAlpha.toFixed(3)})`;
          dimContext!.fillText(glyph, px, py);
          const brightAlpha = Math.min(1, strength * (bridge ? 1.6 : 1.15));
          brightContext!.fillStyle = bridge
            ? `rgba(255,110,60,${brightAlpha.toFixed(3)})`
            : `rgba(236,236,236,${brightAlpha.toFixed(3)})`;
          brightContext!.fillText(glyph, px, py);
        }
      }
      container!.dataset.ready = "true";
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    }

    function point(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !container) return;
      const rect = container.getBoundingClientRect();
      container.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      container.style.setProperty("--my", `${event.clientY - rect.top}px`);
      container.dataset.pointer = "true";
    }
    function leave() {
      if (container) container.dataset.pointer = "false";
    }

    photo.onload = draw;
    photo.src = SOURCE;
    const resize = new ResizeObserver(schedule);
    resize.observe(dim);
    // The hero content sits above this layer, so listen on its section.
    const section = container.parentElement;
    section?.addEventListener("pointermove", point);
    section?.addEventListener("pointerleave", leave);
    return () => {
      disposed = true;
      photo.onload = null;
      resize.disconnect();
      cancelAnimationFrame(frame);
      section?.removeEventListener("pointermove", point);
      section?.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="la-city" ref={root} aria-hidden="true">
      <Image
        className="la-city-fallback"
        src={SOURCE}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        unoptimized
      />
      <canvas ref={base} className="la-city-base" />
      <canvas ref={glow} className="la-city-glow" />
    </div>
  );
}
