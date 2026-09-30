"use client";

import { useEffect, useState } from "react";

// The title decodes once on load: each letter flickers through ASCII glyphs
// and locks in, left to right. The server renders the plain text; while it
// animates, every letter keeps its real width (the glyph is an overlay), so
// nothing shifts, and screen readers get the plain text throughout.

const GLYPHS = "#%*+=-:.@$&/<>";
const STEP = 42; // ms between glyph changes
const STAGGER = 55; // ms between letters starting
const SPIN = 360; // ms each letter spins before locking

type Letter = { char: string; glyph: string | null; lead?: boolean };

export function DecodeTitle({ text }: { text: string }) {
  const [letters, setLetters] = useState<Letter[] | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = [...text];
    const start = performance.now();
    const random = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= STEP) {
        last = now;
        const elapsed = now - start;
        let done = true;
        const next = chars.map((char, index) => {
          const lockAt = index * STAGGER + SPIN;
          if (char === " " || elapsed >= lockAt) return { char, glyph: null };
          done = false;
          return { char, glyph: random() };
        });
        if (done) {
          setLetters(null);
          return;
        }
        setLetters(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  if (!letters) return <>{text}</>;

  // Words stay unbroken; letters sit in boxes of their real width. The next
  // letter to lock is marked as the lead.
  const lead = letters.findIndex((letter) => letter.glyph !== null);
  const words: Letter[][] = [[]];
  for (const [index, letter] of letters.entries())
    if (letter.char === " ") words.push([]);
    else words[words.length - 1].push({ ...letter, lead: index === lead });

  return (
    <>
      <span className="ds-sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            {w > 0 && " "}
            <span className="ds-decode-word">
              {word.map((letter, i) => (
                <span
                  key={i}
                  className="ds-decode"
                  data-spinning={letter.glyph !== null}
                  data-lead={letter.lead || undefined}
                >
                  {letter.char}
                  {letter.glyph !== null && <span className="ds-decode-glyph">{letter.glyph}</span>}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
