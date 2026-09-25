import {
  calendarDescription,
  summit,
  venueAddress,
} from "@/lib/summit";

export const dynamic = "force-static";

// RFC 5545 text values escape backslashes, commas and semicolons.
const escape = (value: string) => value.replace(/([\\,;])/g, "\\$1");

// Lines longer than 75 octets continue on the next line after a space.
function fold(line: string) {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length ? 74 : 75;
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function GET() {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LATAM AI Summit//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:latam-ai-summit-2026-10-07@latam-ai-summit",
    "DTSTAMP:20260925T000000Z",
    "DTSTART:20261007T170000Z",
    "DTEND:20261007T220000Z",
    `SUMMARY:${escape(`${summit.name} ${summit.hashtag}`)}`,
    `LOCATION:${escape(`${summit.venue.name}, ${venueAddress}`)}`,
    `DESCRIPTION:${escape(calendarDescription)}`,
    `URL:${summit.registrationUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
    .concat("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="latam-ai-summit.ics"',
    },
  });
}
