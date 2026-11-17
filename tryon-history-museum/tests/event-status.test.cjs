const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs
  .readFileSync("src/lib/events/status.js", "utf8")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ") +
  "\nresult = { EVENT_TIMEZONE, todayInEventZone, getEventTimes, isEventUpcoming, isEventPast, partitionEvents };";
const context = { result: null, Date, Intl, String, Set, Map, parseInt };
vm.createContext(context);
vm.runInContext(source, context);
const { todayInEventZone, isEventUpcoming, isEventPast, partitionEvents } =
  context.result;

const laval = {
  title: "From Scotland to Appalachia",
  date: "2026-11-12",
  time: "Doors 4:00 pm · Presentation 5:00 pm",
};

test("completed Nov 12 2026 event is past (the reported bug)", () => {
  const now = new Date("2026-11-17T15:00:00Z");
  assert.ok(isEventPast(laval, now));
  assert.ok(!isEventUpcoming(laval, now));
});

test("future event is upcoming", () => {
  const future = { date: "2026-12-05", time: "2:00 PM" };
  assert.ok(isEventUpcoming(future, new Date("2026-11-17T15:00:00Z")));
});

test("event in progress stays upcoming until its end time (ET)", () => {
  const ranged = { date: "2026-11-17", time: "1:00 PM - 4:00 PM" };
  // 3pm ET = 20:00 UTC -> in progress
  assert.ok(isEventUpcoming(ranged, new Date("2026-11-17T20:00:00Z")));
  // 4:30pm ET = 21:30 UTC -> over
  assert.ok(isEventPast(ranged, new Date("2026-11-17T21:30:00Z")));
  // 12:30pm ET = 17:30 UTC -> not yet started but same-day upcoming
  assert.ok(isEventUpcoming(ranged, new Date("2026-11-17T17:30:00Z")));
});

test("America/New_York is used, not UTC or local time", () => {
  const ev = { date: "2026-11-17", time: "5:00 PM - 7:00 PM" };
  // 6:30pm ET = 23:30 UTC -> in progress
  assert.ok(isEventUpcoming(ev, new Date("2026-11-17T23:30:00Z")));
  // 7:30pm ET = 00:30 UTC next day -> past even though UTC date differs
  assert.ok(isEventPast(ev, new Date("2026-11-18T00:30:00Z")));
});

test("event with a single start time stays upcoming through its day", () => {
  const ev = { date: "2026-11-17", time: "5:00 PM" };
  // 9pm ET = 02:00 UTC next day -> still event day in ET
  assert.ok(isEventUpcoming(ev, new Date("2026-11-18T02:00:00Z")));
  // next day in ET -> past
  assert.ok(isEventPast(ev, new Date("2026-11-18T15:00:00Z")));
});

test("date-only event compares against the ET calendar date", () => {
  const ev = { date: "2026-11-17" };
  assert.equal(todayInEventZone(new Date("2026-11-17T20:00:00Z")), "2026-11-17");
  assert.ok(isEventUpcoming(ev, new Date("2026-11-17T20:00:00Z")));
  assert.ok(isEventPast(ev, new Date("2026-11-18T12:00:00Z")));
});

test("partitionEvents sorts upcoming soonest-first and past newest-first", () => {
  const events = [
    { title: "later", date: "2026-12-20", time: "7:00 PM" },
    { title: "past-new", date: "2026-11-12", time: "5:00 PM" },
    { title: "sooner", date: "2026-11-28", time: "2:00 PM" },
    { title: "past-old", date: "2026-07-23", time: "5:00 PM" },
  ];
  const now = new Date("2026-11-17T15:00:00Z");
  const { upcoming, past } = partitionEvents(events, now);
  assert.equal(upcoming.map((e) => e.title).join(","), "sooner,later");
  assert.equal(past.map((e) => e.title).join(","), "past-new,past-old");
});

test("same-day events order by parsed start time", () => {
  const events = [
    { title: "evening", date: "2026-12-01", time: "7:00 PM" },
    { title: "morning", date: "2026-12-01", time: "10:00 AM" },
  ];
  const { upcoming } = partitionEvents(events, new Date("2026-11-17T15:00:00Z"));
  assert.equal(upcoming.map((e) => e.title).join(","), "morning,evening");
});
