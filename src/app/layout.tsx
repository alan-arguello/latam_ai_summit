import type { Viewport } from "next";
import { Host_Grotesk, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import "./design-system.css";
import "./summit.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Font variables live on <html> so :root tokens can resolve them.
  return (
    <html
      lang="es"
      className={`${display.variable} ${text.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
