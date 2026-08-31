# THM — Member Signup, Account Access & Receipts

Spec for Cascade. Parts A and B are one piece of work. Parts C–E are the member
dashboard. Part F lists decisions needed from Heather before building.

Same rules of engagement as the webhook spec: additive migrations only, back up
first, inspect every Supabase `error`, and verify against the database rather
than the UI.

---

## Part A — Remove the password from signup

**Current:** `/membership` (or wherever the join form lives) asks for first name,
last name, email, password, and confirm, then goes to Stripe.

**Problem:** it forces account creation before the person has paid, or even
decided to. It also means a failed or abandoned checkout can leave an orphaned
auth user with no membership behind it.

**Required flow:**

1. Collect **first name, last name, email** only. Remove the password and
   confirm fields entirely.
2. On email blur (or as they type, debounced), check the `members` table — this
   check already exists and works; see Part B for the states it must handle.
3. Button reads `CONTINUE TO PAYMENT — $50` rather than `CREATE ACCOUNT — $50`.
4. Send them to Stripe Checkout.
5. **After** the webhook confirms payment, email them a link to set a password
   and access their member dashboard.

The account is a consequence of membership, not a prerequisite for it.

---

## Part B — Three identity states

The email check must distinguish three cases, not two. The current code appears
to handle only "found" and "not found."

**1. No member record.**
Proceed normally. No message.

**2. Member record exists, `auth_user_id` is null.**
They're a member but have never set up online access — this covers the 67
imported members and anyone added by an admin.

> Looks like **Heather** is already a member. Set a password to access your
> account and renew. →

Link sends a Supabase magic link to the address on file. Following it lands them
in the dashboard with a set-password prompt.

**3. Member record exists, `auth_user_id` is populated.**
They have an account already.

> Looks like **Heather** already has an account with us. Log in to view or
> renew. →

Links to the login page.

**In both cases 2 and 3, do not let them continue with a new signup.** Creating
a second member row is what produced the duplicate we already have.

**Send to the email on file, never to the email just typed.** Otherwise anyone
who guesses a member's address could request access to their account.

### Privacy note

Showing the member's first name confirms to anyone who types an email address
that the person is a member here. For a small community museum that's probably
an acceptable trade for the usability gain, but it is a deliberate choice, not a
neutral one. If it should be avoided, the message becomes:

> That email is already associated with a membership. Log in or request an
> access link. →

Heather to decide. Default to keeping the first name unless told otherwise.

---

## Part C — Dashboard actions

The member dashboard currently has no way to give money. Add to the Overview
tab, below the membership summary card:

- **Renew Membership — $50** — primary action. Goes to Stripe Checkout with
  `payment_type = renewal` and `client_reference_id` set to the member's UUID
  so the webhook matches on the ID rather than the email.
- **Make a Donation** — secondary action. Amount entry, then Checkout with
  `payment_type = donation`, same `client_reference_id`.

Because these come from an authenticated session, the webhook can match on
member UUID rather than falling back to email matching. That sidesteps the
duplicate-account problem entirely for anyone who renews while logged in.

**Renewal button state.** Don't show "Renew" as urgent year-round. Suggested:
if renewal is more than 60 days out, label it "Renew Early"; inside 60 days,
"Renew Now" with the due date shown; past due, "Renew" with the lapsed date.

---

## Part D — Transactions tab

Currently reads "No transactions on record yet" for a member who has history.

**First determine which problem this is:**

```sql
select m.member_id, m.email, m.auth_user_id, count(p.id) as payment_rows
from members m
left join membership_payments p on p.member_id = m.id
where m.email = 'heather@curatedcarolinas.com'
group by m.member_id, m.email, m.auth_user_id;
```

- **`payment_rows` = 0** — the tab is correct and there is no history to show.
  Members imported directly into `members` never received
  `membership_payments` rows. Backfilling is a separate data task; see Part F.
- **`payment_rows` > 0** — the tab's query is broken. Likely causes: joining on
  `auth_user_id` instead of `members.id`, or an RLS policy on
  `membership_payments` that blocks members from reading their own rows.

**RLS is the thing to check first.** The member dashboard runs as the
authenticated user, not the service role. If `membership_payments` has RLS
enabled with no SELECT policy for members, the query returns an empty array with
no error — which looks exactly like "no transactions."

Required policy, if missing:

```sql
alter table membership_payments enable row level security;

create policy "members read own payments"
  on membership_payments for select
  using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );
```

**Display, per row:** date, type (Membership, Renewal, Donation), amount, and
for payments dated from launch forward, a **Download Receipt** link.

Rows predating receipt generation show no link. Do not generate retroactive
receipts for payments the museum has no verified record of — see Part F.

---

## Part E — Tax receipts

The museum is a 501(c)(3), so donors need written acknowledgment for their
records.

**Receipt contents:**

- Museum name, address (26 Maple Street, Tryon NC 28782), and **EIN**
- Statement of 501(c)(3) status
- Donor name
- Date of payment
- Amount
- What the payment was for (membership, renewal, donation)
- The goods-and-services statement — see Part F, this needs confirmation

**Two delivery paths:**

1. **Emailed at time of payment.** Verify whether `welcomeEmail` and
   `renewalConfirmationEmail` already contain receipt language. If they do,
   confirm they include the EIN and the goods-and-services statement. If they
   don't, add a receipt block or send a separate receipt email. The donation
   path has no member-facing email at all right now and needs one.
2. **Downloadable from the Transactions tab.** A route such as
   `/api/receipts/[payment_id]` that renders the receipt as PDF.

**Access control on the download route is critical.** It must confirm the
requesting user owns that payment before returning anything. Never trust a
payment ID from the URL alone — that's a straightforward way to leak donor names
and amounts.

**Year-end summary** would be a natural follow-on: one statement covering all
gifts in a calendar year, which is what most donors actually want at tax time.
Not required now, but worth structuring the receipt code so it's easy later.
The unused `payment_year` column on `membership_payments` may have been intended
for exactly this.

---

## Part F — Decisions (settled)

1. **EIN: 47-1736984.** Include on every receipt.

2. **Goods and services: members receive nothing of value in return.**
   `MEMBER_BENEFIT_FMV` stays `"0"`. Receipt language:

   > The Tryon History Museum is a 501(c)(3) nonprofit organization, EIN
   > 47-1736984. No goods or services were provided in exchange for this
   > contribution.

   Heather is adjusting the published member perks to match this. If perks with
   real value are ever reintroduced, this statement and the FMV constant must
   change together.

3. **Historical payments will not be backfilled.** For members whose
   `membership_payments` history predates the website, the Transactions tab
   shows a note rather than an empty state:

   > Payment history from before our online system isn't available here. Contact
   > us at info@tryonhistorymuseum.org for records of earlier gifts.

   Show this note only when the member has zero payment rows — not beneath rows
   that do exist.

4. **Receipts are available for Stripe payments from July 2026 forward only.**
   No receipts for anything earlier, and no retroactive generation.

   Note that this includes two payments already in the ledger: Maureen's July 17
   donation and Jeff's August 30 membership. Both were written by webhook
   replays and carry correct dates, so both are legitimately in scope. Verify
   their receipts render correctly — they are the only real test data available
   until new payments come through.

5. **Privacy on the email check** — keep the first name in the message, per the
   default in Part B.

---

## Part G — Permissions and navigation

Admin status lives in **Supabase auth `app_metadata`** as `{"role": "admin"}`.
Confirmed on the live database. It is not a column on `members`, and there is no
separate roles table.

This is the correct place for it: `app_metadata` is writable only by the service
role, so a user cannot grant themselves admin, and it travels in the JWT so
middleware can check it without a database query.

### Before building

Search the codebase for `app_metadata` and for admin-role checks, and report
what currently reads this value. The dashboard renders a "MUSEUM ADMINISTRATOR"
badge and a "Museum Administration" panel, so something is checking — confirm
whether it's this role or something inferred another way. If nothing reads
`app_metadata`, the entire permission layer needs building rather than
extending.

### Reading the role

Always server-side, and always via `getUser()` so the token is verified rather
than trusted:

```js
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.app_metadata?.role === 'admin';
```

### Navigation states

Three states in the header:

| State | MY ACCOUNT menu |
|---|---|
| Signed out | Show a Log In link instead of the menu |
| Signed in, not admin | Account Management · Sign Out |
| Signed in, admin | Account Management · Museum Admin · Sign Out |

The same condition governs the **Museum Administration panel** on the dashboard
Overview tab and the "GO TO ADMIN DASHBOARD" button inside it. A non-admin
member must not see either.

### Route protection — the part that actually matters

Hiding the nav link is presentation, not security. Anyone can type
`/admin/dashboard` directly.

1. Protect **every** `/admin/*` page route. Redirect non-admins to
   `/member/dashboard`.
2. Protect **every** admin API route with the same check, returning 403. This
   matters more than the pages — the API routes are where member and donor data
   actually lives, and a hidden nav link protects none of it.
3. Middleware is the natural place, but confirm the matcher covers API routes
   and not only pages.

Report which admin routes exist and which are currently unprotected.

### Granting admin later

Not a SQL update — Supabase manages that JSON. Service-role call only:

```js
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' }
});
```

This **replaces** `app_metadata` wholesale, so fetch and merge the existing keys
(`provider`, `providers`) rather than overwriting them.

### Worth considering, not required now

Admin is currently a single on/off flag. Board members reading donor records is
a different need from editing them, and a volunteer coordinator might need
`/admin/volunteers` and nothing else. If a second role is ever likely, the
structure is easier to put in now than to retrofit once several people have
logins. Flag this rather than building it.
