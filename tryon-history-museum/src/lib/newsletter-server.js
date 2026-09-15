import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { createNewsletterHandlers } from './newsletter.mjs';

export const newsletter = createNewsletterHandlers({
  async rpc(name, args) {
    const { data, error } = await createAdminClient().rpc(name, args);
    if (error) throw new Error('Newsletter database unavailable');
    if (typeof data !== 'boolean') throw new Error('Unexpected newsletter database response');
    return data;
  },
  async verify(token) {
    if (!process.env.TURNSTILE_SECRET_KEY) throw new Error('Missing verification configuration');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json();
    return result.success === true && result.action === 'newsletter' && ['tryonhistorymuseum.org', 'www.tryonhistorymuseum.org'].includes(result.hostname);
  },
  async send(payload) {
    if (!process.env.RESEND_API_KEY) throw new Error('Missing email configuration');
    const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send(payload);
    if (error || !data?.id) throw new Error('Confirmation email not accepted');
  },
});
