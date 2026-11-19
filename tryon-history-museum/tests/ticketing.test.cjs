const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs
  .readFileSync("src/lib/ticketing.js", "utf8")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ")
  .replaceAll("export class ", "class ") +
  "\nresult = { MAX_SEATS_PER_ORDER, isValidEmail, validatePurchaser, TicketingError, normalizeOrderItems, orderReference, formatCents, countCommittedSeats, rpcErrorToResponse };";
const context = { result: null, Date, Map, Number, String, Math, Array };
vm.createContext(context);
vm.runInContext(source, context);
const {
  isValidEmail,
  validatePurchaser,
  normalizeOrderItems,
  orderReference,
  formatCents,
  countCommittedSeats,
  rpcErrorToResponse,
} = context.result;

const types = [
  { code: "single", label: "Single Admission", price_cents: 3000, seats_per_unit: 1 },
  { code: "couple", label: "Couples Admission", price_cents: 5000, seats_per_unit: 2 },
];

// ── normalizeOrderItems ──

test("couple ticket consumes exactly two seats", () => {
  const r = normalizeOrderItems(
    [{ code: "couple", quantity: 1, attendees: ["A B", "C D"] }],
    types
  );
  assert.equal(r.totalSeats, 2);
  assert.equal(r.totalCents, 5000);
});

test("mixed items total correctly", () => {
  const r = normalizeOrderItems(
    [
      { code: "single", quantity: 2, attendees: ["A B", "C D"] },
      { code: "couple", quantity: 1, attendees: ["E F", "G H"] },
    ],
    types
  );
  assert.equal(r.totalSeats, 4);
  assert.equal(r.totalCents, 11000);
});

test("attendee count must equal seat count", () => {
  assert.throws(
    () => normalizeOrderItems([{ code: "couple", quantity: 1, attendees: ["A B"] }], types),
    /every attendee/i
  );
});

test("rejects unknown type, empty items, bad qty, short names", () => {
  assert.throws(() => normalizeOrderItems([{ code: "vip", quantity: 1, attendees: ["A B"] }], types));
  assert.throws(() => normalizeOrderItems([], types));
  assert.throws(() => normalizeOrderItems([{ code: "single", quantity: 0, attendees: [] }], types));
  assert.throws(() => normalizeOrderItems([{ code: "single", quantity: 1, attendees: ["A"] }], types));
});

test("order seat cap of 10 enforced", () => {
  const items = [{ code: "couple", quantity: 6, attendees: Array(12).fill("A B") }];
  assert.throws(() => normalizeOrderItems(items, types), /limited to 10 seats/);
});

// ── purchaser validation ──

test("purchaser validation requires name, email, phone", () => {
  const p = validatePurchaser({ name: "  Jane Doe ", email: "j@x.co", phone: "828-555-1234" });
  assert.equal(p.name, "Jane Doe");
  assert.throws(() => validatePurchaser({ name: "J", email: "j@x.co", phone: "8285551234" }));
  assert.throws(() => validatePurchaser({ name: "Jane Doe", email: "nope", phone: "8285551234" }));
  assert.throws(() => validatePurchaser({ name: "Jane Doe", email: "j@x.co", phone: "12" }));
});

test("isValidEmail basics", () => {
  assert.ok(isValidEmail("a@b.co"));
  assert.ok(!isValidEmail("a@b"));
  assert.ok(!isValidEmail("not-an-email"));
});

// ── seat counting (mirrors event_seats_sold) ──

test("seat counting: paid + comp + live pending; ignores cancelled/expired", () => {
  const future = new Date(Date.now() + 3600e3).toISOString();
  const past = new Date(Date.now() - 3600e3).toISOString();
  const orders = [
    { status: "paid", seats: 4 },
    { status: "comp", seats: 2 },
    { status: "pending", seats: 3, stripe_session_expires_at: future },
    { status: "pending", seats: 5, stripe_session_expires_at: past },
    { status: "pending", seats: 5, stripe_session_expires_at: null },
    { status: "cancelled", seats: 9 },
    { status: "refunded", seats: 9 },
  ];
  assert.equal(countCommittedSeats(orders), 9);
});

// ── helpers ──

test("orderReference + formatCents", () => {
  assert.equal(orderReference("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "THM-A1B2C3D4");
  assert.equal(formatCents(5000), "$50.00");
  assert.equal(formatCents(0), "$0.00");
});

test("rpcErrorToResponse maps sold_out with remaining seats", () => {
  const sold3 = rpcErrorToResponse("sold_out:3");
  assert.equal(sold3.status, 409);
  assert.equal(sold3.message, "Only 3 seats remain for this event.");
  assert.equal(rpcErrorToResponse("sold_out:0").status, 409);
  assert.equal(rpcErrorToResponse("sales_closed").status, 409);
});
