"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";

export default function NewsletterSection() {
  return (
    <section className="bg-tryon-warm py-16 md:py-20">
      <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
        <FadeIn>
          <h3 className="font-display text-3xl font-normal text-tryon-black mb-3">
            Stay Connected
          </h3>
          <p
            className="font-body text-[15px] mb-7"
            style={{ color: "rgba(26,19,17,0.6)" }}
          >
            Sign up for news, event announcements, and stories from
            Tryon&apos;s past.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-[440px] mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 font-body text-sm px-5 py-3.5 outline-none text-tryon-black"
              style={{
                border: "1px solid rgba(123,45,38,0.15)",
                background: "#FFFDF9",
              }}
            />
            <button
              type="submit"
              className="font-body text-xs font-semibold uppercase text-white border-none cursor-pointer transition-colors hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                background: DEEP_RED,
                padding: "14px 24px",
              }}
            >
              Subscribe
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
