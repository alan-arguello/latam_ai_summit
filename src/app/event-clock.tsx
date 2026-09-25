"use client";

import { useSyncExternalStore } from "react";
import { summit } from "@/lib/summit";

// One shared minute clock. The server snapshot is null so the markup that
// depends on "now" only appears after hydration, without a mismatch.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((notify) => notify()), 20_000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const minute = () => Math.floor(Date.now() / 60_000) * 60_000;
const useNow = () => useSyncExternalStore(subscribe, minute, () => null);

const eventStart = Date.parse(summit.startsAt);
const eventEnd = Date.parse(summit.endsAt);
const HOUR = 3_600_000;

export function Countdown() {
  const now = useNow();
  let label = "07.10.2026";
  let live = false;
  if (now !== null) {
    const remaining = eventStart - now;
    if (remaining > 48 * HOUR) {
      label = `Faltan ${Math.ceil(remaining / (24 * HOUR))} días`;
    } else if (remaining > HOUR) {
      label = `Faltan ${Math.ceil(remaining / HOUR)} horas`;
    } else if (remaining > 0) {
      label = `Faltan ${Math.ceil(remaining / 60_000)} min`;
    } else if (now < eventEnd) {
      label = "En vivo ahora";
      live = true;
    } else {
      label = "Gracias por venir";
    }
  }
  return (
    <span className="la-countdown" data-live={live}>
      {label}
    </span>
  );
}

// Marks an agenda slot as live or past, only while the event is running.
export function SlotStatus({ start, end }: { start: string; end: string }) {
  const now = useNow();
  if (now === null || now < eventStart || now > eventEnd + 2 * HOUR)
    return null;
  const from = Date.parse(`${summit.date}T${start}:00-07:00`);
  const to = Date.parse(`${summit.date}T${end}:00-07:00`);
  if (now >= to) return <span className="la-slot-status" data-state="past" />;
  if (now < from) return null;
  return (
    <span className="la-slot-status" data-state="live">
      Ahora
    </span>
  );
}
