const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function load(file, names) {
  const source = fs.readFileSync(file, "utf8").replaceAll("export function ", "function ").replaceAll("export const ", "const ") + `\nresult = { ${names.join(", ")} };`;
  const context = { result: null, Date, Intl, Math, Number, Object, String, Set };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.result;
}

const pricing = load("src/lib/membershipPricing.js", ["computePayment"]);
const finance = load("src/lib/finance.js", ["buildFinanceReport", "financeDetailCsv", "financeSummaryCsv"]);

test("standalone gifts below $50 remain donations only", () => {
  const result = pricing.computePayment(25, "2026-01-15", "donation");
  assert.equal(result.isDonation, true);
  assert.equal(result.membershipFee, 0);
  assert.equal(result.additionalDonation, 25);
});

test("qualifying gifts split the first $50 into membership", () => {
  assert.deepEqual(
    [50, 125].map((amount) => {
      const result = pricing.computePayment(amount, "2026-01-15", "donation");
      return [result.membershipFee, result.additionalDonation];
    }),
    [[50, 0], [50, 75]]
  );
});

test("finance totals reconcile dues, gifts, contributors, and designations", () => {
  const report = finance.buildFinanceReport([
    { id: "1", member_id: "m1", payment_date: "2026-01-05", amount: 125, membership_fee: 50, additional_donation: 75, payment_method: "stripe", payment_type: "new_member", source: "website", status: "completed", donor_name: "Ada", donor_email: "ada@example.com", payment_allocations: [{ id: "a1", designation_id: "d1", amount: 50, giving_designations: { name: "Exhibits", kind: "fund" } }, { id: "a2", designation_id: null, amount: 25, giving_designations: null }] },
    { id: "2", member_id: null, payment_date: "2026-02-02", amount: 20, membership_fee: 0, additional_donation: 20, payment_method: "cash", payment_type: "donation", source: "admin", status: "completed", donor_name: "Guest", donor_email: "", payment_allocations: [] },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(report.summary)), { total: 145, membership: 50, donations: 95, transactionCount: 2, uniqueContributors: 2 });
  assert.equal(report.breakdowns.designation.Exhibits, 50);
  assert.equal(report.breakdowns.designation.Unrestricted, 45);
  assert.equal(report.summary.total, report.summary.membership + report.summary.donations);
});

test("detail export emits separate membership and allocation rows", () => {
  const report = finance.buildFinanceReport([{ id: "1", member_id: "m1", payment_date: "2026-01-05", amount: 75, membership_fee: 50, additional_donation: 25, payment_method: "check", payment_type: "renewal", source: "admin", status: "completed", donor_name: "Ada", donor_email: "ada@example.com", payment_allocations: [] }]);
  const csv = finance.financeDetailCsv(report);
  assert.match(csv, /Membership,,,50/);
  assert.match(csv, /Donation,Unrestricted,unrestricted,25/);
});

test("summary export includes the selected calendar-year period", () => {
  const report = finance.buildFinanceReport([]);
  const csv = finance.financeSummaryCsv(report, "2026-01-01", "2026-12-31");
  assert.match(csv, /2026-01-01 through 2026-12-31/);
});

test("finance routes require the full administrator role", () => {
  for (const route of ["finances", "designations", "payment-allocations"]) {
    const source = fs.readFileSync(`src/app/api/admin/${route}/route.js`, "utf8");
    assert.match(source, /\{ isAdmin \} = await verifyAdmin\(\)/);
    assert.doesNotMatch(source, /hasAdminAccess/);
  }
  const page = fs.readFileSync("src/app/admin/finances/page.js", "utf8");
  assert.match(page, /if \(!isAdmin\) redirect/);
});

test("finance migration preserves records and restricts finance tables", () => {
  const migration = fs.readFileSync("supabase/migrations/016_finance_reporting.sql", "utf8");
  assert.match(migration, /on delete set null/i);
  assert.match(migration, /designation_id uuid references/i);
  assert.match(migration, /revoke all on public\.giving_designations, public\.payment_allocations from anon, authenticated/i);
  assert.match(migration, /app_metadata'.*role.*= 'admin'/i);
  assert.doesNotMatch(migration, /role.*board_member/i);
  assert.match(migration, /additional_donation = amount - case/i);
});
