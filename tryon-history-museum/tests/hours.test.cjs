const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

// Reuse the real timezone constant so tests track the shared module.
const statusSource = fs.readFileSync("src/lib/events/status.js", "utf8");
const tzMatch = statusSource.match(
  /EVENT_TIMEZONE\s*=\s*["']([^"']+)["']/
);
assert.ok(tzMatch, "EVENT_TIMEZONE not found in events/status.js");

const source = fs
  .readFileSync("src/lib/hours.js", "utf8")
  .replace(/import[^;]+;/g, "")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ") +
  "\nresult = { fallbackHours, getContactInfo, getHoursList, getWeeklySchedule, compactTime, formatHoursCompact, getVisitStatus };";
const context = {
  result: null,
  EVENT_TIMEZONE: tzMatch[1],
  Date,
  Intl,
  String,
  Map,
  parseInt,
};
vm.createContext(context);
vm.runInContext(source, context);
const {
  fallbackHours,
  getContactInfo,
  getHoursList,
  getWeeklySchedule,
  compactTime,
  formatHoursCompact,
  getVisitStatus,
} = context.result;

// All datetimes below are winter dates => America/New_York is EST (UTC-5).

test("Wednesday afternoon: closed, next open Friday", () => {
  const s = getVisitStatus(null, new Date("2026-01-07T17:00:00Z")); // Wed 12:00 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Friday");
  assert.equal(s.nextTime, fallbackHours[0].time);
});

test("Friday before opening: treated as open (opens later today)", () => {
  const s = getVisitStatus(null, new Date("2026-01-09T15:00:00Z")); // Fri 10:00 ET
  assert.equal(s.state, "open");
  assert.equal(s.todayTime, "1:00 PM – 4:00 PM");
});

test("Friday during hours: open", () => {
  const s = getVisitStatus(null, new Date("2026-01-09T19:00:00Z")); // Fri 14:00 ET
  assert.equal(s.state, "open");
});

test("Friday after close: next open Saturday", () => {
  const s = getVisitStatus(null, new Date("2026-01-09T21:30:00Z")); // Fri 16:30 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Saturday");
});

test("Saturday after close: next open the following Friday", () => {
  const s = getVisitStatus(null, new Date("2026-01-10T21:30:00Z")); // Sat 16:30 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Friday");
});

test("Sunday: closed, next open Friday", () => {
  const s = getVisitStatus(null, new Date("2026-01-11T17:00:00Z")); // Sun 12:00 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Friday");
});

test("late Thursday night rolls into Friday's schedule", () => {
  const s = getVisitStatus(null, new Date("2026-01-09T05:30:00Z")); // Fri 00:30 ET
  assert.equal(s.state, "open"); // opens later today
});

test("UTC Friday morning is still Thursday night in ET", () => {
  const s = getVisitStatus(null, new Date("2026-01-09T03:00:00Z")); // Thu 22:00 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Friday");
});

test("siteSettings hours override the fallback schedule", () => {
  const settings = {
    hours: [{ day: "Saturday", dayOfWeek: 6, time: "10:00 AM – 2:00 PM" }],
  };
  const s = getVisitStatus(settings, new Date("2026-01-09T19:00:00Z")); // Fri 14:00 ET
  assert.equal(s.state, "closed");
  assert.equal(s.nextDay, "Saturday");
  assert.equal(s.nextTime, "10:00 AM – 2:00 PM");
});

test("compactTime compresses matching meridiems", () => {
  assert.equal(compactTime("1:00 PM – 4:00 PM"), "1–4 PM");
  assert.equal(compactTime("10:00 AM – 2:00 PM"), "10 AM–2 PM");
  assert.equal(compactTime("Closed"), "Closed");
});

test("formatHoursCompact groups identical open hours, omits Closed rows", () => {
  assert.equal(
    formatHoursCompact(getHoursList(null)),
    "Friday & Saturday · 1–4 PM"
  );
  assert.equal(
    formatHoursCompact([
      { day: "Friday", time: "1:00 PM – 4:00 PM" },
      { day: "Saturday", time: "10:00 AM – 2:00 PM" },
      { day: "Sunday", time: "Closed" },
    ]),
    "Friday · 1–4 PM · Saturday · 10 AM–2 PM"
  );
});

test("getWeeklySchedule honors dayOfWeek numbers from siteSettings", () => {
  const settings = {
    hours: [
      { day: "Wednesday", dayOfWeek: 3, time: "9:00 AM – 5:00 PM" },
      { day: "Sunday", dayOfWeek: 0, time: "12:00 PM – 4:00 PM" },
    ],
  };
  const sched = getWeeklySchedule(settings);
  assert.equal(sched[3], "9:00 AM – 5:00 PM");
  assert.equal(sched[0], "12:00 PM – 4:00 PM");
  assert.equal(sched[5], "Closed");
});

test("getContactInfo falls back and accepts overrides", () => {
  const fallback = getContactInfo(null);
  assert.equal(fallback.street, "26 Maple Street");
  assert.equal(fallback.email, "info@tryonhistorymuseum.org");
  const custom = getContactInfo({
    phone: "(828) 555-0000",
    address: { street: "1 Main St", city: "Tryon", state: "NC", zip: "28782" },
  });
  assert.equal(custom.phone, "(828) 555-0000");
  assert.equal(custom.cityStateZip, "Tryon, NC 28782");
});
