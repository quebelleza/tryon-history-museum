# THM Website — Membership & Payment Fixes

Spec for Cascade. Work through the parts in order. Parts 1–3 are independent;
Part 4 depends on Part 2.

## Rules of engagement

- Migration discipline: **additive and non-destructive only.** No dropped or
  renamed columns, no removed enum values. Back up first
  (`scripts/backup-members.mjs`), apply SQL through the Supabase SQL Editor,
  verify after.
- Migrations in the repo are not necessarily applied to production. Do not
  assume a committed migration has run.
- Every Supabase call must inspect the returned `error`. Several bugs below
  exist because writes failed silently and the UI reported success.
- Do not change the Stripe webhook endpoint URL. It is correct as of now:
  `https://www.tryonhistorymuseum.org/api/stripe/webhook` (the `www` matters —
  the apex domain 308-redirects and Stripe does not follow redirects).

---

## Part 1 — Retire the Family membership tier

The museum now offers a single membership: **$50/year Individual.** The $75
Family membership is discontinued.

- Remove Family from all public-facing pricing, join, and renewal pages.
- Remove Family from the Stripe checkout session creation (any price/amount
  options offered to the public).
- Remove Family as a selectable option in admin member create/edit forms.
- Leave the `membership_tier` enum in Postgres untouched. Existing Family
  members keep their tier; the value simply stops being offered. Do not attempt
  to migrate existing family members to individual.
- `lib/membershipPricing.js` already hardcodes `INDIVIDUAL_FEE = 50` and never
  returns `family` — no change needed there, but remove any Family references
  from its comments and from `getFeeSchedule()` consumers.

Search the codebase for `family`, `Family`, and `75` to find stragglers.

---

## Part 2 — Fix payment dates in the webhook

**File:** `src/app/api/stripe/webhook/route.js`

The handler computes `const today = new Date().toISOString().split("T")[0]` and
uses it for every date field in all three branches. Two defects:

1. It records the **processing** date, not the payment date. Replayed or retried
   events get today's date, which silently extends memberships.
2. `toISOString()` is UTC. A member paying at 9:00 PM Eastern is recorded as
   paying the following day.

Replace with a payment date derived from the Stripe event and converted to
America/New_York:

```js
function paymentDateFromSession(session) {
  // session.created is a Unix timestamp (seconds)
  const ms = (session.created ?? Math.floor(Date.now() / 1000)) * 1000;
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}
```

Use this value everywhere `today` is currently used for a **date column**
(`last_payment_date`, `membership_start_date`, `start_date`, `payment_date`,
and as the input to `computeMembership`).

Keep the real current timestamp for the *staff alert email* only — that should
say when the notification was sent.

Audit `formatDatePlusYear` in `lib/membershipPricing.js` for the same UTC issue
while you are here.

---

## Part 3 — Donations must create memberships

**Current behaviour:** the `payment_type === "donation"` branch sends an email
and returns. It writes nothing to the database. This is a missing feature, not
a broken one.

**Required rules** (these supersede the "Friend $1–99, receipt only" rule in the
old schema doc):

| Total payment | Membership | Donor class | Access tier |
|---|---|---|---|
| $1–49 | none — receipt only | none | — |
| $50–99 | auto-enrolled | none | individual |
| $100–249 | auto-enrolled (comp) | gillette | family |
| $250–499 | auto-enrolled (comp) | simone | family |
| $500–999 | auto-enrolled (comp) | pacolet | family |
| $1,000+ | auto-enrolled (comp) | fitzgerald | family |

Add a new exported function to `lib/membershipPricing.js` rather than changing
the return shape of `computeMembership` for `paymentType === "donation"` — that
return shape is used elsewhere for client-side preview and must not change.

```js
/**
 * Donation-origin membership. A donation is not a dues payment, so the whole
 * amount is recorded as a gift and membership_fee is 0. This keeps donation
 * totals honest for acknowledgment letters and the annual report.
 */
export function computeDonationMembership(paymentAmount, paymentDate) {
  const amt = parseFloat(paymentAmount) || 0;

  if (amt < INDIVIDUAL_FEE) {
    return { createsMembership: false, membershipFee: 0, additionalDonation: amt,
             donorLevel: null, renewalDueDate: null };
  }

  // Reuse the existing band logic so there is one definition of donor levels.
  const base = computeMembership(amt, paymentDate, "new_member");

  return {
    createsMembership: true,
    membershipTier: "individual",
    membershipFee: 0,               // comp membership — not a dues payment
    additionalDonation: amt,        // full amount is the gift
    donorLevel: base.donorLevel,
    memberLabel: base.memberLabel,
    renewalDueDate: base.renewalDueDate,
    membershipStartDate: paymentDate,
    status: "active",
  };
}
```

In the webhook's donation branch:

1. Compute the classification. If `createsMembership` is false, send the alert
   and return as it does today.
2. Look up an existing member by email (`session.customer_email` or
   `session.customer_details.email`).
3. **Existing member:** update donor class *only if the new level is higher than
   the current one*, roll `renewal_due_date` forward to payment date + 1 year,
   set status active, update the amount fields.
4. **No existing member:** insert a new member with name parsed from
   `session.customer_details.name`, `source = 'donation'`.
5. Insert a `membership_payments` row with `payment_type: 'donation'`.
6. Send the member the welcome or renewal confirmation email as appropriate.

Do not skip the ledger row. Records written directly to `members` without a
matching `membership_payments` row are why some members show empty payment
history in the admin UI.

---

## Part 4 — Fields no branch currently writes

Three columns are never written by any path in the webhook. Add them to every
member insert and update:

- **`effective_access_tier`** — this is the field that actually gates
  members-only content. Set to `family` when total giving is $100+, otherwise
  `individual`. The "$100+ donors get family access" rule has never worked
  because nothing writes this column.
- **`source`** (enum `member_source`) — `public_join` for new signups,
  `public_renewal` for renewals, `donation` for donation-origin members. It
  currently defaults to `other` on every row, which makes reporting useless.
  Note the webhook currently writes a non-existent field `member_source:
  "online"` in the new-member insert — remove that; the column is `source` and
  `online` is not a valid enum value.
- **`stripe_customer_id`** — from `session.customer`. Needed for refunds,
  receipts, and any future renewal automation.

Also verify these two, which appear in the code but should be confirmed against
the live schema before being written: `donor_level` and `member_label`. The
handler writes both `donor_level` and `donor_class` with the same value. If
`donor_level` does not exist as a column, that write is failing silently and
must be removed.

---

## Part 5 — Consolidated admin alert

**Every** payment must send exactly one notification to
`info@tryonhistorymuseum.org`. No other recipients.

Remove the per-branch staff notification sends entirely — they currently go to
`wmay@tds.net` and `wanda@tdowntowntryon.org`, both of which are wrong
addresses, and they duplicate the universal alert. Delete
`buildNotificationEmail` and its call sites.

Keep and extend the single universal alert at the top of the
`checkout.session.completed` handler so it includes:

- Payment type: New Membership, Membership Renewal, or Donation
- Amount
- Donor level and its display label, when one applies
- Member name and email
- Member ID (THM-####) when available
- Date of the payment (per Part 2, not the processing date)
- Stripe session id

Move this send to **after** the database work rather than before it, so the
alert can include the member ID and donor level assigned during processing. Keep
it in its own try/catch so an email failure never prevents the database write.

Fix the malformed name fallback in the current alert:

```js
const alertName =
  [session.metadata?.first_name, session.metadata?.last_name]
    .filter(Boolean).join(" ") ||
  session.customer_details?.name ||
  "Unknown";
```

---

## Part 6 — Idempotency

Nothing currently prevents the same Stripe event being processed twice. Stripe
retries automatically, and replayed events will insert duplicate
`membership_payments` rows and re-roll expiration dates.

Add a new migration (additive, new table only):

```sql
create table if not exists processed_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
```

At the top of the handler, immediately after signature verification:

1. Attempt `insert` of `event.id` into `processed_webhook_events`.
2. If the insert fails on primary key conflict, the event has already been
   processed — return `200 {received: true}` immediately and do no further work.
3. Only proceed if the insert succeeded.

Returning 200 on a duplicate is important. Returning an error causes Stripe to
keep retrying.

---

## Part 7 — Duplicate column pairs

The database has three pairs of columns holding the same information, and
different parts of the app read and write different halves. This is the root
cause of fields displaying as blank in the admin dashboard while the data is
present in Postgres.

| Authoritative | Deprecated (still present) |
|---|---|
| `renewal_due_date` | `expiration_date` |
| `start_date` | `membership_start_date` |
| `street_address` / `city` / `state` / `zip_code` | `address` |

Note the webhook writes `membership_start_date` while the admin forms write
`start_date`. Across the `members` table, 54 rows have `start_date` and only 22
have `membership_start_date`.

Required:

1. **Writes:** every code path that sets one of these must set both halves of
   the pair, so nothing displays blank regardless of which column a given view
   reads.
2. **Reads:** standardize every read on the authoritative column.
3. Search for and report any component reading `expiration_date`,
   `membership_start_date`, `join_date`, or `address`. Report the list; do not
   assume the search was exhaustive.

Do not drop the deprecated columns.

---

## Part 8 — Verification

After the changes are deployed, confirm each of the following against the live
database, not the UI:

1. A test $50 membership checkout produces: `status = active`,
   `source = public_join`, `stripe_customer_id` populated,
   `effective_access_tier = individual`, `last_payment_date` matching the
   Eastern-time date of payment, `renewal_due_date` exactly one year later,
   both `start_date` and `membership_start_date` set, a THM-#### member ID
   assigned, and one `membership_payments` row.
2. A test $250 donation from a new email produces a member with
   `donor_class = simone`, `effective_access_tier = family`,
   `membership_fee = 0`, `additional_donation = 250`, `source = donation`, and
   one `membership_payments` row with `payment_type = donation`.
3. A test $25 donation produces **no** member record and no payment row.
4. Resending any of the above events from the Stripe dashboard produces **no**
   second payment row and **no** change to the expiration date.
5. One email arrives at `info@tryonhistorymuseum.org` per payment, containing
   the correct type, amount, donor level, and date.

Use Stripe test mode for these. Test-mode webhook endpoints are configured
separately from live mode — verify the test endpoint also points at the `www`
domain.

---

## Do not do

- Do not replay the backlog of failed `checkout.session.completed` deliveries
  until Parts 2 and 6 are deployed. Replaying now stamps today's date and
  duplicates payment rows. The oldest pending event is from a July 17 payment;
  replaying it today would extend that membership by six weeks.
- Do not drop or rename any column or enum value.
- Do not change the deduplication strategy from email-only in this pass.
  Identity matching across different email addresses is a separate piece of
  work, tied to restoring member magic-link login.
