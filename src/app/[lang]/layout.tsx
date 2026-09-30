import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { Host_Grotesk, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { hasLocale, locales } from "@/i18n/config";

import "../globals.css";
import "../design-system.css";
import "../summit.css";

// Display: Host Grotesk, the closest open match to ElevenLabs' Waldenburg.
const display = Host_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

// Text: Inter, as on elevenlabs.io.
const text = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-text",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfcfc",
  colorScheme: "light",
};

// One static build per language; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  // Font variables live on <html> so :root tokens can resolve them.
  return (
    <html
      lang={lang}
      className={`${display.variable} ${text.variable} ${GeistMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
