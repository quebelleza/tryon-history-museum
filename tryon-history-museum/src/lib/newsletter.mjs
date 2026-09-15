import { createHash, randomBytes } from 'node:crypto';

const origin = 'https://www.tryonhistorymuseum.org';
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const tokenValid = (token) => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const error = (message, status = 400) => reply({ error: message }, status);
const accepted = () => reply({ success: true, message: 'If confirmation is needed, check your inbox and spam folder. Already confirmed? You are all set. For repeat requests, wait at least 10 minutes; we send at most three confirmation emails per day.' });

// Dependencies are injected so the real handlers can be tested without sending email.
export function createNewsletterHandlers({ rpc, verify, send }) {
  return {
    async subscribe(request) {
      let body;
      try { body = await request.json(); } catch { return error('Invalid request. Please try again.'); }
      if (!body || typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return error('Please enter a valid email address.');
      if (body.consent !== true) return error('Please agree to receive museum news.');
      if (typeof body.turnstileToken !== 'string' || !body.turnstileToken || body.turnstileToken.length > 2048) return error('Please complete human verification.');
      try {
        if (!await verify(body.turnstileToken)) return error('Verification expired or failed. Please verify again.');
      } catch { return error('Verification is temporarily unavailable. Please try again later.', 503); }
      const email = body.email.trim().toLowerCase();
      const confirmation = randomBytes(32).toString('hex');
      const unsubscribe = randomBytes(32).toString('hex');
      try {
        const claimed = await rpc('newsletter_request', { p_email: email, p_confirmation_hash: hashToken(confirmation), p_unsubscribe_hash: hashToken(unsubscribe) });
        if (!claimed) return accepted();
        // Fragments keep bearer tokens out of server URL logs and Referer headers.
        const confirmUrl = `${origin}/newsletter/confirm#${confirmation}`;
        const unsubscribeUrl = `${origin}/newsletter/unsubscribe#${unsubscribe}`;
        await send({
          from: 'Tryon History Museum <info@tryonhistorymuseum.org>', to: email,
          subject: 'Confirm your Tryon History Museum newsletter signup',
          text: `Please confirm that you would like museum news, events, and stories from Tryon's past.\n\nConfirm your email (valid for 24 hours):\n${confirmUrl}\n\nIf you did not request this, ignore this email. You will not be subscribed without confirming.\n\nCancel this request or unsubscribe:\n${unsubscribeUrl}\n\nTryon History Museum & Visitor Center\n26 Maple Street, Tryon, NC 28782`,
          html: `<div style="background:#FAF7F4;padding:32px;font-family:Arial,sans-serif;color:#1A1311;line-height:1.6;max-width:600px;margin:auto"><h1 style="font-family:Georgia,serif;color:#7B2D26">Stay connected with Tryon</h1><p>Confirm your email to receive museum news, upcoming events, and stories from Tryon's past.</p><p><a href="${confirmUrl}" style="display:inline-block;background:#7B2D26;color:white;padding:14px 22px;text-decoration:none">Confirm my email</a></p><p>This link is valid for 24 hours. If you did not request this, ignore this email. You will not be subscribed without confirming.</p><p><a href="${unsubscribeUrl}">Cancel this request or unsubscribe</a></p><hr><p>Tryon History Museum &amp; Visitor Center<br>26 Maple Street, Tryon, NC 28782</p></div>`,
        });
        return accepted();
      } catch { return error('We could not complete your signup. Please try again in 10 minutes or contact info@tryonhistorymuseum.org.', 503); }
    },
    async action(request, action) {
      if (!['confirm', 'unsubscribe'].includes(action)) return error('Invalid action.');
      let body;
      try { body = await request.json(); } catch { return error('Invalid request.'); }
      if (!tokenValid(body?.token)) return error('This link is incomplete. Please open the full link from your email.');
      try {
        const success = await rpc(`newsletter_${action}`, { p_hash: hashToken(body.token) });
        if (!success) return error(action === 'confirm' ? 'This confirmation link has expired or was replaced. Please sign up again for a new email.' : 'This unsubscribe link is no longer valid. Please use your most recent email or contact the museum.');
        return reply({ success: true });
      } catch { return error('We could not save your choice. Please try again later or contact info@tryonhistorymuseum.org.', 503); }
    },
  };
}
