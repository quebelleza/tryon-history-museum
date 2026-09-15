"use client";
import { useRef, useState } from "react";
import FadeIn from "./FadeIn";
import BoardVerification from "./BoardVerification";

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
    <section id="newsletter" className="bg-tryon-warm py-16 md:py-20 scroll-mt-40">
      <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
        <FadeIn>
          <h3 className="font-display text-3xl font-normal text-tryon-black mb-3">Stay Connected</h3>
          <p className="font-body text-base mb-7 text-tryon-black">Sign up for news, event announcements, and stories from Tryon&apos;s past.</p>
          {status === "success" ? <div role="status" className="font-body text-base leading-relaxed"><h4 className="font-semibold">Check your email</h4><p>{notice}</p></div> : <form aria-label="Newsletter signup" className="flex flex-col gap-4 max-w-[440px] mx-auto text-left" onSubmit={subscribe}>
            <label htmlFor="newsletter-email" className="font-body text-sm font-semibold text-tryon-black">Email address</label>
            <input id="newsletter-email" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" autoComplete="email" className="w-full font-body text-base px-5 py-3.5 text-tryon-black border border-stone-300 focus:ring-2 focus:ring-tryon-gold" />
            <label className="flex items-start gap-3 font-body text-sm leading-relaxed text-tryon-black">
              <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
              I would like museum news, event announcements, and history stories by email. I can unsubscribe at any time.
            </label>
            <BoardVerification onToken={setToken} attempt={attempt} action="newsletter" />
            {!token && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <p className="font-body text-sm" role="status">Complete verification to request your confirmation email.</p>}
            {status === "error" && <p role="alert" className="font-body text-sm text-red-800">{notice}</p>}
            <button type="submit" disabled={!token || !consent || status === "sending"} className="bg-[#7B2D26] py-3.5 px-6 font-body text-sm font-semibold uppercase text-white cursor-pointer hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">{status === "sending" ? "Sending…" : "Sign Up"}</button>
            <p className="font-body text-sm text-tryon-black">We will email a confirmation link. Your subscription starts only after you confirm.</p>
          </form>}
        </FadeIn>
      </div>
    </section>
  );
}
