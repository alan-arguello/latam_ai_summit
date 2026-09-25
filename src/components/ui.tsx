import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/summit";

// Design-system primitives. Styles live in src/app/design-system.css.

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  external?: boolean;
  icon?: React.ReactNode;
  className?: string;
  label?: string;
  download?: boolean;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  icon,
  className,
  label,
  download,
}: ButtonProps) {
  return (
    <a
      href={href}
      className={["ds-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      aria-label={label}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {icon ?? (external ? <ArrowUpRight aria-hidden="true" /> : null)}
    </a>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "white" | "glass";
  className?: string;
}) {
  return (
    <span
      className={["ds-pill", className].filter(Boolean).join(" ")}
      data-tone={tone}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="ds-heading">
      <div>
        <p className="ds-eyebrow">{eyebrow}</p>
        <h2 id={id} className="ds-display-m">
          {title}
        </h2>
      </div>
      {children && <div className="ds-heading-aside">{children}</div>}
    </header>
  );
}

// The Golden Gate in four strokes: two towers, the main cable and the deck.
export function LogoMark({ word = true }: { word?: boolean }) {
  return (
    <span className="ds-logo">
      <svg viewBox="0 0 26 20" aria-hidden="true">
        <rect x="5" y="0" width="2.2" height="20" />
        <rect x="18.8" y="0" width="2.2" height="20" />
        <path
          d="M0 12 Q 6 11 6.1 1.2 Q 13 13.5 19.9 1.2 Q 20 11 26 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect x="0" y="12.6" width="26" height="1.8" />
      </svg>
      {word && <span className="ds-logo-word">LATAM AI Summit</span>}
    </span>
  );
}

export function CompanyLogo({
  company,
  height = 20,
  label = true,
}: {
  company: Company;
  height?: number;
  label?: boolean;
}) {
  const wordmark = company.ratio > 1;
  const size = Math.round(height * (company.scale ?? 1));
  return (
    <span className="ds-company" data-wordmark={wordmark}>
      <Image
        src={company.logo}
        alt={wordmark || !label ? company.name : ""}
        width={Math.round(size * company.ratio)}
        height={size}
      />
      {!wordmark && label && <span>{company.name}</span>}
    </span>
  );
}
