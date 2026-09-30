"use client";

import { useSyncExternalStore } from "react";
import { format } from "@/i18n/config";
import { endsAt, eventDate, startsAt } from "@/lib/schedule";

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

const eventStart = Date.parse(startsAt);
const eventEnd = Date.parse(endsAt);
const HOUR = 3_600_000;

export type ClockLabels = {
  date: string;
  days: string;
  hours: string;
  minutes: string;
  live: string;
  past: string;
};

export function Countdown({ labels }: { labels: ClockLabels }) {
  const now = useNow();
  let label = labels.date;
  let live = false;
  if (now !== null) {
    const remaining = eventStart - now;
    if (remaining > 48 * HOUR) {
      label = format(labels.days, { n: Math.ceil(remaining / (24 * HOUR)) });
    } else if (remaining > HOUR) {
      label = format(labels.hours, { n: Math.ceil(remaining / HOUR) });
    } else if (remaining > 0) {
      label = format(labels.minutes, { n: Math.ceil(remaining / 60_000) });
    } else if (now < eventEnd) {
      label = labels.live;
      live = true;
    } else {
      label = labels.past;
    }
  }
  return (
    <span className="lp-countdown" data-live={live}>
      {label}
    </span>
  );
}

// Marks an agenda slot as live or past, only while the event is running.
export function SlotStatus({
  start,
  end,
  label,
}: {
  start: string;
  end: string;
  label: string;
}) {
  const now = useNow();
  if (now === null || now < eventStart || now > eventEnd + 2 * HOUR)
    return null;
  const from = Date.parse(`${eventDate}T${start}:00-07:00`);
  const to = Date.parse(`${eventDate}T${end}:00-07:00`);
  if (now >= to) return <span className="lp-slot-status" data-state="past" />;
  if (now < from) return null;
  return (
    <span className="lp-slot-status" data-state="live">
      {label}
    </span>
  );
}
