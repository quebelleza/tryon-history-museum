/**
 * Shared event-status logic for THM.
 *
 * All event times are interpreted in America/New_York (the museum's
 * timezone), regardless of the visitor's or server's clock.
 *
 * Data model: Sanity `event` documents carry `date` ("2026-11-12") and a
 * free-text `time` (e.g. "2:00 PM", "Doors 4:00 pm · Presentation 5:00 pm",
 * "11:00 AM - 1:00 PM"). There is no explicit end-time field.
 *
 * Status rule:
 *  - If `time` names two or more times, the LAST is treated as the end —
 *    the event is past once that instant passes.
 *  - With one or zero times there is no explicit end; the event remains
 *    upcoming through the end of its event day (ET). No duration is
 *    invented — the event simply cannot be "over" before its day ends.
 *  - An event in progress is therefore always "upcoming".
 */

export const EVENT_TIMEZONE = "America/New_York";

const tzParts = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const tzWallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** "YYYY-MM-DD" for `now` in the event timezone. */
export function todayInEventZone(now = new Date()) {
  const p = Object.fromEntries(
    tzParts.formatToParts(now).map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}`;
}

/** Extract all "H(:MM) AM/PM" times from a free-text time field. */
function parseTimes(time) {
  if (!time) return [];
  const re = /(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|am|pm|AM|PM)/g;
  const out = [];
  let m;
  while ((m = re.exec(time)) !== null) {
    let h = parseInt(m[1], 10) % 12;
    if (m[3].toLowerCase().startsWith("p")) h += 12;
    out.push({ h, mi: parseInt(m[2] || "0", 10) });
  }
  return out;
}

/** Convert a wall-clock time in EVENT_TIMEZONE to a UTC instant (ms). */
function zonedTimeToUtc(y, mo, d, h, mi) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const p = Object.fromEntries(
    tzWallClock
      .formatToParts(new Date(guess))
      .filter((x) => x.type !== "literal")
      .map((x) => [x.type, +x.value])
  );
  const offset =
    Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - guess;
  return guess - offset;
}

/**
 * Resolve an event's start/end instants (ms since epoch).
 * start = first time found, end = last time found (null if only one).
 */
export function getEventTimes(event) {
  const [y, mo, d] = String(event?.date || "")
    .split("-")
    .map(Number);
  if (!y || !mo || !d) return { start: null, end: null };
  const times = parseTimes(event?.time);
  return {
    start: times.length
      ? zonedTimeToUtc(y, mo, d, times[0].h, times[0].mi)
      : null,
    end:
      times.length > 1
        ? zonedTimeToUtc(
            y,
            mo,
            d,
            times[times.length - 1].h,
            times[times.length - 1].mi
          )
        : null,
  };
}

/** True while an event is upcoming or still in progress (ET). */
export function isEventUpcoming(event, now = new Date()) {
  const { end } = getEventTimes(event);
  if (end) return now.getTime() < end;
  // No explicit end time: upcoming through the end of the event day (ET).
  return event?.date >= todayInEventZone(now);
}

export function isEventPast(event, now = new Date()) {
  return !isEventUpcoming(event, now);
}

function byStartAsc(a, b) {
  const cmp = String(a.date || "").localeCompare(String(b.date || ""));
  if (cmp !== 0) return cmp;
  const sa = getEventTimes(a).start ?? 0;
  const sb = getEventTimes(b).start ?? 0;
  return sa - sb;
}

/**
 * Split events into chronologically sorted upcoming (soonest first)
 * and past (most recent first) buckets.
 */
export function partitionEvents(events, now = new Date()) {
  const upcoming = [];
  const past = [];
  for (const e of events || []) {
    (isEventUpcoming(e, now) ? upcoming : past).push(e);
  }
  upcoming.sort(byStartAsc);
  past.sort(byStartAsc).reverse();
  return { upcoming, past };
}
