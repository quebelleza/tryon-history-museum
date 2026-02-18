"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const NAVY = "#1B2A4A";

/**
 * A polished, gracious gate message for non-members trying to access
 * members-only content. Used inline or as a full-page block.
 */
export default function MemberGate({ title, fullPage = false }) {
  const content = (
    <FadeIn>
      <div
        className="p-10 md:p-14 text-center"
        style={{
          background: "#FFFDF9",
          border: "1px solid rgba(27,42,74,0.1)",
        }}
      >
        <div
          className="inline-flex items-center gap-2 font-body text-[11px] uppercase mb-5"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={GOLD_ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Members Only
        </div>
        <h2
          className="font-display text-2xl md:text-3xl font-light mb-4"
          style={{ color: WARM_BLACK }}
        >
          {title || "This content is exclusively for Museum Members."}
        </h2>
        <p
          className="font-body text-[15px] leading-[1.7] mb-8 max-w-[480px] mx-auto"
          style={{ color: "rgba(26,19,17,0.6)" }}
        >
          Log in or become a member to view details and access exclusive
          events, pre-sale pricing, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.12em",
              color: "#FFFFFF",
              background: NAVY,
              padding: "14px 32px",
            }}
          >
            Member Login
          </Link>
          <Link
            href="/membership"
            className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.12em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "14px 32px",
            }}
          >
            Become a Member
          </Link>
        </div>
      </div>
    </FadeIn>
  );

  if (fullPage) {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[60vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[640px] mx-auto px-5 md:px-8">{content}</div>
      </section>
    );
  }

  return content;
}
