"use client";
import { useRef, useState } from "react";
import BoardVerification from "./BoardVerification";
import { Section, Eyebrow, DisplayHeadline } from "@/components/brand";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");
  const sending = useRef(false);
  async function subscribe(event) {
    event.preventDefault();
    if (!token || !consent || sending.current) return;
    sending.current = true;
    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, turnstileToken: token }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.error || "Please try again later.");
      setStatus("success");
      setNotice(data.message);
    } catch (error) {
      setStatus("error");
      setNotice(error.message || "We could not complete your signup. Please try again later.");
    } finally {
      sending.current = false;
      setToken("");
      setAttempt((value) => value + 1);
    }
  }
  return (
    <Section id="newsletter" bg="parchment" className="scroll-mt-40">
      <div className="max-w-[600px] mx-auto text-center">
        <Eyebrow>Newsletter</Eyebrow>
        <DisplayHeadline size="md" className="mb-3">Stay Connected</DisplayHeadline>
        <p className="mb-7 font-brand-body text-base leading-[1.75] text-brand-ink/70">Sign up for news, event announcements, and stories from Tryon&apos;s past.</p>
        {status === "success" ? <div role="status" className="font-brand-body text-base leading-relaxed text-brand-ink"><h4 className="font-brand-secondary text-sm font-semibold uppercase tracking-[0.15em]">Check your email</h4><p>{notice}</p></div> : <form aria-label="Newsletter signup" className="mx-auto flex max-w-[440px] flex-col gap-4 text-left" onSubmit={subscribe}>
          <label htmlFor="newsletter-email" className="font-brand-secondary text-sm font-semibold text-brand-ink">Email address</label>
          <input id="newsletter-email" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" autoComplete="email" className="w-full border border-brand-ink/20 bg-white px-5 py-3.5 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage" />
          <label className="flex items-start gap-3 font-brand-body text-sm leading-relaxed text-brand-ink/80">
            <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-brand-heritage" />
            I would like museum news, event announcements, and history stories by email. I can unsubscribe at any time.
          </label>
          <BoardVerification onToken={setToken} attempt={attempt} action="newsletter" />
          {!token && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <p className="font-brand-body text-sm text-brand-ink/60" role="status">Complete verification to request your confirmation email.</p>}
          {status === "error" && <p role="alert" className="font-brand-body text-sm text-brand-heritage">{notice}</p>}
          <button type="submit" disabled={!token || !consent || status === "sending"} className="cursor-pointer bg-brand-heritage px-6 py-3.5 font-brand-secondary text-sm font-semibold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-heritage">{status === "sending" ? "Sending…" : "Sign Up"}</button>
          <p className="font-brand-body text-sm text-brand-ink/60">We will email a confirmation link. Your subscription starts only after you confirm.</p>
        </form>}
      </div>
    </Section>
  );
}
