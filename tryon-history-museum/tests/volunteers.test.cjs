const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/lib/volunteers.js", "utf8")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ") + "\nresult = { validateVolunteerInput };";
const context = { result: null, Set, Object, Array, Number };
vm.createContext(context);
vm.runInContext(source, context);
const { validateVolunteerInput } = context.result;

const valid = {
  full_name: " Ada Lovelace ", email: " ADA@Example.com ", phone: " 828-555-0100 ",
  preferred_contact: "email", status: "active", volunteer_areas: ["docent", "events"],
  availability: { Wednesday: { morning: true, evening: false }, InvalidDay: { morning: true } },
  prior_experience: true, public_comfort_level: 4, hours_per_month: "5–10 hours",
  interest_reason: "Local history",
};

test("valid volunteer input is normalized and availability is constrained", () => {
  const result = validateVolunteerInput(valid);
  assert.equal(result.error, undefined);
  assert.equal(result.data.full_name, "Ada Lovelace");
  assert.equal(result.data.email, "ada@example.com");
  assert.deepEqual(JSON.parse(JSON.stringify(result.data.volunteer_areas)), ["docent", "events"]);
  assert.deepEqual(JSON.parse(JSON.stringify(result.data.availability)), { Wednesday: { morning: true } });
});

test("volunteer validation rejects missing contact fields", () => {
  assert.match(validateVolunteerInput({ ...valid, phone: "" }).error, /required/i);
});

test("volunteer validation rejects invalid email, status, areas, and comfort level", () => {
  assert.match(validateVolunteerInput({ ...valid, email: "invalid" }).error, /email/i);
  assert.match(validateVolunteerInput({ ...valid, status: "deleted" }).error, /status/i);
  assert.match(validateVolunteerInput({ ...valid, volunteer_areas: ["unknown"] }).error, /area/i);
  assert.match(validateVolunteerInput({ ...valid, public_comfort_level: 6 }).error, /between 1 and 5/i);
});

test("manual volunteer CRUD is restricted to full administrators", () => {
  const collection = fs.readFileSync("src/app/api/admin/volunteers/route.js", "utf8");
  const detail = fs.readFileSync("src/app/api/admin/volunteers/[id]/route.js", "utf8");
  assert.match(collection, /export async function POST[\s\S]*\{ isAdmin \} = await verifyAdmin/);
  assert.match(detail, /if \(!isAdmin\).*Unauthorized/);
  assert.match(detail, /export async function DELETE[\s\S]*\{ isAdmin \} = await verifyAdmin/);
  assert.match(detail, /statusOnly/);
  assert.match(detail, /hasAdminAccess/);
});

test("public volunteer submission route remains available", () => {
  const route = fs.readFileSync("src/app/api/volunteer/route.js", "utf8");
  assert.match(route, /export async function POST/);
  assert.doesNotMatch(route, /verifyAdmin/);
});
