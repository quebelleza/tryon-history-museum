const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { TextEncoder } = require("node:util");

const source = fs.readFileSync("src/lib/events/jamieLaval.js", "utf8")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ") +
  "\nresult = { JAMIE_LAVAL_EVENT, createJamieLavalIcs };";
const context = { result: null, Date, String, TextEncoder };
vm.createContext(context);
vm.runInContext(source, context);
const { JAMIE_LAVAL_EVENT, createJamieLavalIcs } = context.result;

test("Jamie Laval event data uses the canonical route and approved image", () => {
  assert.equal(JAMIE_LAVAL_EVENT.slug, "tales-of-tryon-jamie-laval");
  assert.equal(JAMIE_LAVAL_EVENT.date, "2026-11-12");
  assert.equal(JAMIE_LAVAL_EVENT.canonicalUrl, "https://tryonhistorymuseum.org/events/tales-of-tryon-jamie-laval");
  assert.equal(JAMIE_LAVAL_EVENT.imageWidth, 540);
  assert.equal(JAMIE_LAVAL_EVENT.imageHeight, 1024);
  assert.ok(fs.existsSync("public/images/events/jamie-laval-scotland-appalachia.jpg"));
});

test("calendar download has the correct time and no invented end time", () => {
  const ics = createJamieLavalIcs(new Date("2026-10-28T12:34:56Z"));
  assert.match(ics, /\r\nDTSTART:20261112T220000Z\r\n/);
  assert.match(ics, /\r\nDTSTAMP:20261028T123456Z\r\n/);
  assert.match(ics, /UID:20261112T220000Z-jamie-laval@tryonhistorymuseum\.org/);
  assert.match(ics, /Tryon Presbyterian Church\\, 430 Harmon Field Road/);
  assert.match(ics, /URL:https:\/\/tryonhistorymuseum\.org\/events\/tales-of-tryon-jamie-laval/);
  assert.doesNotMatch(ics, /DTEND|DURATION/);
  assert.equal(ics.replaceAll("\r\n", "").includes("\n"), false);
  for (const line of ics.split("\r\n").filter(Boolean)) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, `ICS line exceeds 75 octets: ${line}`);
  }
});

test("event listing links to the one canonical event route", () => {
  const eventPage = fs.readFileSync("src/components/EventsPageSection.jsx", "utf8");
  const home = fs.readFileSync("src/components/EventsSection.jsx", "utf8");
  assert.match(eventPage, /slug: \{ current: JAMIE_LAVAL_EVENT\.slug \}/);
  assert.match(home, /href: `\/events\/\$\{JAMIE_LAVAL_EVENT\.slug\}`/);
  assert.doesNotMatch(eventPage, /Appalachian Music with Jamie Laval/);
});

test("event page metadata and structured data omit unknown end and ticket fields", () => {
  const page = fs.readFileSync("src/app/events/tales-of-tryon-jamie-laval/page.js", "utf8");
  assert.match(page, /Tales of Tryon with Jamie Laval \| Tryon History Museum/);
  assert.match(page, /2026-11-12T17:00:00-05:00/);
  assert.match(page, /2026-11-12T16:00:00-05:00/);
  assert.match(page, /isAccessibleForFree: true/);
  assert.doesNotMatch(page, /endDate|offers|availability/);
});
