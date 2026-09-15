# Newsletter signup deployment

This stage collects confirmed newsletter subscribers. It does not send campaigns or create a newsletter editor.

## Deploy in this order

1. In the museum's Supabase project, open SQL Editor and run `supabase/migrations/015_newsletter.sql` once. This creates a separate subscriber table and three server-only functions. It does not alter members or existing contact forms.
2. Keep these existing Vercel Production environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY`. No new secret is required. Never expose the service role or secret keys with a NEXT_PUBLIC prefix.
3. Deploy the website code to Vercel. Turnstile uses the existing museum hostname allowlist, with action `newsletter`.
4. Leave click tracking disabled for confirmation emails in Resend. The confirmation and unsubscribe URLs carry random tokens in URL fragments; verify the received links still contain those fragments.
5. Run the live acceptance checks below before promoting the newsletter signup.

## Live acceptance checks

- Enter a museum-controlled test email on the homepage, agree to receive news, and complete verification.
- Check inbox/spam for the confirmation email. In Supabase Table Editor, the row must be `pending`, never `subscribed` yet.
- Open the confirmation link. Merely opening it must not change the row. Press Confirm and verify `subscribed` plus `confirmed_at` in Supabase.
- Open the email's unsubscribe link and press Unsubscribe. Verify `unsubscribed`. Repeat the action to confirm it remains successful.
- Reopen the old confirmation link: it must not reactivate an unsubscribed address.
- After 10 minutes, request signup again. A new confirmation is required; old links cannot change the new subscription.
- Verify the contact form still works. The shared verification widget retains its existing contact and board actions.

## Operational behavior

- Addresses are normalized to lowercase; each address has one row. Newsletter consent is independent of membership.
- Confirmation links expire after 24 hours. Repeat confirmation sends have a 10-minute cooldown and a maximum of 3 attempts per address per 24-hour request window. Cooldowns and state transitions are serialized by the database, so multiple Vercel instances cannot bypass them.
- Requests for an already subscribed address or during cooldown return the same generic response, without sending another email or disclosing subscriber status.
- If email delivery fails after the database claim, the row remains pending. No active subscription is created. Retry after the cooldown; the UI reports failure.
- Tokens are random 256-bit values; only hashes are stored. Confirmation and unsubscribe pages perform changes only on explicit POST. Loading a link, including by an email scanner, does not change consent.
- Browser URLs use fragments, then remove the token after loading. Reopening the original email link restores it if the page was refreshed. Session replay is not loaded on direct newsletter action pages.
- Subscriber data and RPC functions are inaccessible to anonymous and ordinary authenticated users; server service-role access only. View subscriber records in Supabase Table Editor for this first stage.
- Never add existing members automatically. Only `status = 'subscribed'` represents current newsletter consent.

## Before building campaign sending

Add an admin-only editor/preview, test sends, delivery queue, provider bounce/complaint suppression handling, and unsubscribe links on every campaign email (including email-provider one-click unsubscribe support). The campaign sender must check current subscribed status and suppression status at send time. Future campaign unsubscribe tokens must be issued and stored deliberately; the raw confirmation-email tokens cannot be recovered from the hashes. Do not bulk-send directly from the subscriber table or treat a confirmation email as a campaign system.

## Tests

`node --test --test-isolation=none tests/newsletter.test.mjs tests/newsletter-database.test.mjs tests/contact.test.cjs`

The database test uses an isolated in-memory PostgreSQL instance (PGlite). It does not access the museum's production database or send email.

