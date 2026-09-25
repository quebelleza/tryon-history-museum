const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const file = fs.readFileSync("src/app/api/admin/members/route.js", "utf8");
const formatDate = file.slice(file.indexOf("function formatDate"), file.indexOf("export async function GET"));
const post = file.slice(file.indexOf("export async function POST"))
  .replace("export async function POST", "async function POST")
  .replaceAll('await import("@/lib/membershipPricing")', "await Promise.resolve({ computeMembership: contextComputeMembership })");
const source = `${formatDate}\n${post}`;

const baseBody = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  payment_amount: 50,
  payment_date: "2026-09-24",
  payment_method: "check",
  payment_type: "new_member",
};

function setup({ env = { RESEND_API_KEY: "test" }, sendResult, sendThrows = false } = {}) {
  const calls = { authCreate: 0, generateLink: 0, emails: [], inserts: [], updates: [] };
  const member = { id: "member-id", ...baseBody, expiration_date: "2027-09-24" };
  const supabase = {
    auth: { admin: {
      createUser: async () => { calls.authCreate += 1; return { data: { user: { id: "auth-id" } }, error: null }; },
      generateLink: async () => { calls.generateLink += 1; return { data: { properties: { action_link: "https://example.com/setup" } }, error: null }; },
    } },
    from(table) {
      return {
        insert(value) {
          calls.inserts.push({ table, value });
          if (table === "members") return { select: () => ({ single: async () => ({ data: { ...member, ...value }, error: null }) }) };
          return Promise.resolve({ error: null });
        },
        update(value) {
          calls.updates.push({ table, value });
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  };
  const context = {
    NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) },
    verifyAdmin: async () => ({ hasAdminAccess: true }),
    createAdminClient: () => supabase,
    contextComputeMembership: (amount, date, type) => ({
      isDonation: false,
      membershipTier: "individual",
      donorLevel: "none",
      memberLabel: "member",
      status: "active",
      renewalDueDate: "2027-09-24",
      membershipStartDate: type === "new_member" ? date : null,
      membershipFee: Number(amount),
      additionalDonation: 0,
      belowMinimum: false,
    }),
    welcomeEmail: (values) => ({ subject: "Welcome", html: JSON.stringify(values) }),
    Resend: class { emails = { send: async (payload) => {
      calls.emails.push(payload);
      if (sendThrows) throw new Error("send failed");
      return sendResult || { data: { id: "resend-id" }, error: null };
    } }; },
    process: { env },
    console,
    Date,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { calls, post: (body) => context.POST({ json: async () => body }) };
}

test("manual creation remains email-free unless explicitly selected", async () => {
  const app = setup();
  const response = await app.post(baseBody);
  assert.equal(response.status, 200);
  assert.equal(response.body.welcomeEmailSent, false);
  assert.equal(app.calls.emails.length, 0);
  assert.equal(app.calls.authCreate, 0);
});

test("opt-in requires an email address", async () => {
  const app = setup();
  const response = await app.post({ ...baseBody, email: null, send_welcome_email: true });
  assert.equal(response.status, 400);
  assert.equal(app.calls.inserts.length, 0);
});

test("opt-in requires a new-member payment", async () => {
  const app = setup();
  const response = await app.post({ ...baseBody, payment_amount: 0, send_welcome_email: true });
  assert.equal(response.status, 400);
  assert.equal(app.calls.inserts.length, 0);
});

test("missing email configuration does not create the member", async () => {
  const app = setup({ env: {} });
  const response = await app.post({ ...baseBody, send_welcome_email: true });
  assert.equal(response.status, 503);
  assert.equal(app.calls.inserts.length, 0);
});

test("opt-in sends the receipt and creates account access", async () => {
  const app = setup();
  const response = await app.post({ ...baseBody, send_welcome_email: true });
  assert.equal(response.status, 200);
  assert.equal(response.body.welcomeEmailSent, true);
  assert.equal(response.body.warning, null);
  assert.equal(app.calls.authCreate, 1);
  assert.equal(app.calls.generateLink, 1);
  assert.equal(app.calls.emails.length, 1);
  assert.equal(app.calls.emails[0].to, baseBody.email);
  const log = app.calls.inserts.find(({ table }) => table === "email_log");
  assert.equal(log.value.status, "sent");
});

test("delivery failure reports a warning without hiding the created member", async () => {
  const app = setup({ sendResult: { data: null, error: { message: "failed" } } });
  const response = await app.post({ ...baseBody, send_welcome_email: true });
  assert.equal(response.status, 200);
  assert.equal(response.body.member.id, "member-id");
  assert.equal(response.body.welcomeEmailSent, false);
  assert.match(response.body.warning, /member was created/i);
});
