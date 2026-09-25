import Image from "next/image";
import type { Company } from "@/lib/summit";

// Pixel "AI" on an International Orange tile. Also used for the favicon.
const PIXELS = [
  // A
  [0, 1], [1, 0], [2, 1], [0, 2], [1, 2], [2, 2], [0, 3], [2, 3], [0, 4], [2, 4],
  // I
  [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
];

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      className="la-logo-mark"
      width={size}
      height={size}
      viewBox="0 0 28 28"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="3" fill="var(--la-accent)" />
      {PIXELS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={4 + x * 4}
          y={4 + y * 4}
          width="4"
          height="4"
          fill="#0b0b0b"
        />
      ))}
    </svg>
  );
}

export function CompanyLogo({
  company,
  height = 18,
  label = true,
}: {
  company: Company;
  height?: number;
  label?: boolean;
}) {
  const wordmark = company.ratio > 1;
  return (
    <span className="la-company" data-wordmark={wordmark}>
      <Image
        src={company.logo}
        alt={wordmark || !label ? company.name : ""}
        width={Math.round(height * company.ratio)}
        height={height}
      />
      {!wordmark && label && <span>{company.name}</span>}
    </span>
  );
}

const GLYPHS = " .:-=+*x#%@";
const COLUMNS = 30;
const ROWS = 27;

// A deterministic ASCII silhouette for speakers still to be announced.
function silhouette(seed: string) {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const noise = (x: number, y: number) => {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + hash;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const lines: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    let line = "";
    for (let col = 0; col < COLUMNS; col++) {
      const x = (col + 0.5) / COLUMNS;
      const y = (row + 0.5) / ROWS;
      const head = 1 - (((x - 0.5) / 0.19) ** 2 + ((y - 0.37) / 0.155) ** 2);
      const neck = Math.abs(x - 0.5) < 0.075 && y > 0.48 && y < 0.66 ? 0.3 : -1;
      const body = 1 - (((x - 0.5) / 0.42) ** 2 + ((y - 1.02) / 0.36) ** 2);
      const inside = Math.max(head, neck, body);
      if (inside > 0) {
        const depth = Math.min(1, inside * 1.8) * 0.75 + noise(col, row) * 0.25;
        line += GLYPHS[2 + Math.floor(depth * (GLYPHS.length - 3))];
      } else {
        line += noise(col, row) < 0.1 ? "." : " ";
      }
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function PlaceholderPortrait({
  seed,
  company,
}: {
  seed: string;
  company?: Company;
}) {
  return (
    <div className="la-portrait la-portrait-placeholder">
      <pre aria-hidden="true">{silhouette(seed)}</pre>
      {company && (
        <span className="la-placeholder-logo">
          <CompanyLogo company={company} height={20} label={false} />
        </span>
      )}
    </div>
  );
}
