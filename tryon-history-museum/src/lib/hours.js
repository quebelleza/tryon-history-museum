/**
 * Single authoritative source for the museum's opening schedule.
 *
 * Priority: Sanity `siteSettings.hours` (array of {day, time, dayOfWeek})
 * overrides `fallbackHours` below. Seasonal schedule changes should be
 * made in the CMS — or in this one file — never duplicated elsewhere.
 *
 * Known limitation: the data model has NO holiday/exception closures —
 * status reflects the recurring weekly schedule only (America/New_York).
 */

import { EVENT_TIMEZONE } from "@/lib/events/status";

export const scheduleLabel = "Winter Hours";

export const fallbackHours = [
  { day: "Friday", time: "1:00 PM – 4:00 PM" },
  { day: "Saturday", time: "1:00 PM – 4:00 PM" },
  { day: "Sunday – Thursday", time: "Closed" },
];

// Structured-data fallback (schema.org). 13:00–16:00 = 1–4 PM.
export const fallbackOpeningHoursSpecification = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Friday",
    opens: "13:00",
    closes: "16:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "13:00",
    closes: "16:00",
  },
];

const fallbackContact = {
  street: "26 Maple Street",
  cityStateZip: "Tryon, NC 28782",
  phone: "(828) 440-1116",
  email: "info@tryonhistorymuseum.org",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=26+Maple+St,+Tryon,+NC+28782&t=&z=16&ie=UTF8&iwloc=&output=embed",
};

export function getContactInfo(siteSettings) {
  const addr = siteSettings?.address;
  return {
    street: addr?.street || fallbackContact.street,
    cityStateZip: addr
      ? `${addr.city}, ${addr.state} ${addr.zip}`
      : fallbackContact.cityStateZip,
    phone: siteSettings?.phone || fallbackContact.phone,
    email: siteSettings?.email || fallbackContact.email,
    mapEmbedUrl: siteSettings?.mapEmbedUrl || fallbackContact.mapEmbedUrl,
  };
}

/** Display rows for "Hours & Admission" style panels. */
export function getHoursList(siteSettings) {
  return siteSettings?.hours?.length
    ? siteSettings.hours.map((h) => ({ day: h.day, time: h.time }))
    : fallbackHours;
}

/** Weekly schedule keyed by JS day index (0=Sun … 6=Sat): "Closed" or a time string. */
export function getWeeklySchedule(siteSettings) {
  const schedule = {
    0: "Closed",
    1: "Closed",
    2: "Closed",
    3: "Closed",
    4: "Closed",
    5: "Closed",
    6: "Closed",
  };
  if (siteSettings?.hours?.length) {
    for (const h of siteSettings.hours) {
      if (typeof h.dayOfWeek === "number") schedule[h.dayOfWeek] = h.time;
    }
    return schedule;
  }
  schedule[5] = fallbackHours[0].time; // Friday
  schedule[6] = fallbackHours[1].time; // Saturday
  return schedule;
}

/** "1:00 PM – 4:00 PM" -> "1–4 PM"; falls back to the raw string. */
export function compactTime(time) {
  const m = String(time).match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );
  if (!m) return time;
  const same = m[3].toUpperCase() === m[6].toUpperCase();
  const t = (h, min) => h + (min && min !== "00" ? ":" + min : "");
  return (
    t(m[1], m[2]) +
    (same ? "" : " " + m[3].toUpperCase()) +
    "–" +
    t(m[4], m[5]) +
    " " +
    m[6].toUpperCase()
  );
}

/**
 * Days sharing identical hours collapse to "Friday & Saturday · 1–4 PM".
 * Closed days are omitted — compact display is for open hours only.
 */
export function formatHoursCompact(hours) {
  const groups = new Map();
  for (const h of hours) {
    if (h.time === "Closed") continue;
    const key = String(h.time);
    groups.set(key, [...(groups.get(key) || []), h.day]);
  }
  if (!groups.size) return "Closed";
  return [...groups.entries()]
    .map(([time, days]) => days.join(" & ") + " · " + compactTime(time))
    .join(" · ");
}

const tzWallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIMEZONE,
  weekday: "long",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseRangeMinutes(time) {
  const m = String(time).match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );
  if (!m) return null;
  const toMin = (h, min, ap) => {
    let hh = parseInt(h, 10) % 12;
    if (ap.toUpperCase() === "PM") hh += 12;
    return hh * 60 + parseInt(min || "0", 10);
  };
  return { start: toMin(m[1], m[2], m[3]), end: toMin(m[4], m[5], m[6]) };
}

/**
 * Visit status in America/New_York, computed at call time:
 *  - open now / opens later today → { state: "open", todayTime }
 *  - closed today (or today ended) → { state: "closed", nextDay, nextTime }
 * Exception closures are not modeled — recurring schedule only.
 */
export function getVisitStatus(siteSettings, now = new Date()) {
  const schedule = getWeeklySchedule(siteSettings);
  const parts = Object.fromEntries(
    tzWallClock
      .formatToParts(now)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  const dayIdx = DAY_NAMES.indexOf(parts.weekday);
  const minutes = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);

  const today = schedule[dayIdx];
  if (today && today !== "Closed") {
    const range = parseRangeMinutes(today);
    if (!range || minutes < range.end) {
      return { state: "open", todayTime: today };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const d = (dayIdx + i) % 7;
    if (schedule[d] && schedule[d] !== "Closed") {
      return {
        state: "closed",
        nextDay: DAY_NAMES[d],
        nextTime: schedule[d],
      };
    }
  }
  return { state: "closed", nextDay: null, nextTime: null };
}
