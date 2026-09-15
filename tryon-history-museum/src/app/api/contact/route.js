import { NextResponse } from "next/server";
import { Resend } from "resend";

const limits = { name: 150, email: 254, subject: 200, message: 10000 };
const fail = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return fail("Invalid submission. Please try again."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid submission.");
  for (const [field, max] of Object.entries(limits)) {
    if (typeof body[field] !== "string" || !body[field].trim()) return fail("Please complete all fields.");
    if (body[field].length > max) return fail(`Please shorten your ${field} to ${max} characters or fewer.`);
  }
  const { name, email, subject, message } = Object.fromEntries(
    Object.keys(limits).map((field) => [field, body[field].trim()])
  );
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(subject)) return fail("Please check your email address and subject.");
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) return fail("Please complete human verification.");
  if (!process.env.TURNSTILE_SECRET_KEY || !process.env.RESEND_API_KEY) return fail("The contact form is temporarily unavailable. Please email us directly.", 503);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: body.turnstileToken }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Verification unavailable");
    const result = await response.json();
    if (result.success !== true || result.action !== "contact" ||
      !["tryonhistorymuseum.org", "www.tryonhistorymuseum.org"].includes(result.hostname)) {
      return fail("Verification expired or failed. Please verify again and resend.");
    }
  } catch {
    return fail("Verification is temporarily unavailable. Please try again or email us directly.", 503);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: "info@tryonhistorymuseum.org",
      replyTo: email,
      subject: `[Website Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    if (error || !data?.id) return fail("Your message could not be sent. Please try again or email us directly.", 502);
    return NextResponse.json({ success: true });
  } catch {
    return fail("Your message could not be sent. Please try again or email us directly.", 502);
  }
}
