"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";
import MemberGate from "./MemberGate";
import { getMemberAccess } from "@/lib/supabase/memberAccess";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const NAVY = "#1B2A4A";

export default function CuratorChatSection() {
  const [access, setAccess] = useState(null);

  useEffect(() => {
    getMemberAccess().then(setAccess);
  }, []);

  // Loading state
  if (access === null) {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[60vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[800px] mx-auto px-5 md:px-8 text-center">
          <p
            className="font-body text-[15px]"
            style={{ color: "rgba(26,19,17,0.5)" }}
          >
            Loading…
          </p>
        </div>
      </section>
    );
  }

  // Gate: non-members see the gracious gate message
  if (!access.isActiveMember) {
    return (
      <>
        {/* Hero banner even for gated view */}
        <section
          className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${NAVY} 0%, #2A3D66 50%, ${NAVY} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
            }}
          />
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 relative z-10">
            <FadeIn>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
                style={{ color: GOLD_ACCENT }}
              >
                ← Back to Events
              </Link>
              <div
                className="inline-flex items-center gap-2 font-body text-[11px] uppercase mb-4"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD_ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Members Only
              </div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-light text-white leading-[1.05] mb-3">
                Curator Chat:{" "}
                <span className="italic font-semibold">WWII Veterans Tribute Exhibit</span>
              </h1>
              <div
                className="font-body text-[13px] uppercase mb-2"
                style={{ letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)" }}
              >
                Friday, February 27, 2026
              </div>
            </FadeIn>
          </div>
        </section>

        <MemberGate
          title="This event is exclusively for Museum Members."
          fullPage
        />
      </>
    );
  }

  // Active members see full event details
  return (
    <>
      {/* ─── Hero ─── */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, #2A3D66 50%, ${NAVY} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 relative z-10">
          <FadeIn>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
              style={{ color: GOLD_ACCENT }}
            >
              ← Back to Events
            </Link>
            <div
              className="inline-flex items-center gap-2 font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD_ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Members Only
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-light text-white leading-[1.05] mb-3">
              Curator Chat:{" "}
              <span className="italic font-semibold">WWII Veterans Tribute Exhibit</span>
            </h1>
            <div
              className="font-body text-[13px] uppercase mb-2"
              style={{ letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)" }}
            >
              Friday, February 27, 2026 · Tryon, North Carolina
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Event Details ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              About This Event
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-8"
              style={{ color: WARM_BLACK }}
            >
              An Intimate Conversation
            </h2>
            <p
              className="font-body text-[16px] md:text-[17px] leading-[1.85] m-0 mb-10"
              style={{ color: "rgba(26,19,17,0.7)" }}
            >
              Join us for an intimate conversation with our curator about our
              upcoming WWII Veterans tribute exhibit — honoring the Tryon natives
              who served, and the stories that connect this small town to a world
              at war. Light refreshments will be served. Space is limited.
            </p>
          </FadeIn>

          {/* Event logistics */}
          <FadeIn delay={0.1}>
            <div
              className="p-7 md:p-10 mb-10"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Date
                  </div>
                  <div
                    className="font-body text-[15px] leading-[1.6]"
                    style={{ color: WARM_BLACK }}
                  >
                    Friday, February 27, 2026
                  </div>
                </div>
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Time
                  </div>
                  <div
                    className="font-body text-[15px] leading-[1.6]"
                    style={{ color: WARM_BLACK }}
                  >
                    {"{PLACEHOLDER — add time}"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Location
                  </div>
                  <div
                    className="font-body text-[15px] leading-[1.6]"
                    style={{ color: WARM_BLACK }}
                  >
                    Tryon History Museum, 26 Maple Street
                  </div>
                </div>
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Category
                  </div>
                  <div
                    className="font-body text-[15px] leading-[1.6]"
                    style={{ color: WARM_BLACK }}
                  >
                    Members Only
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* RSVP */}
          <FadeIn delay={0.15}>
            <div className="text-center">
              {/* {TODO: connect to RSVP system} */}
              <button
                className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110"
                style={{
                  letterSpacing: "0.12em",
                  color: WARM_BLACK,
                  background: GOLD_ACCENT,
                  padding: "16px 40px",
                  border: "none",
                }}
              >
                Reserve My Spot
              </button>
              <p
                className="font-body text-[13px] mt-4"
                style={{ color: "rgba(26,19,17,0.45)" }}
              >
                Space is limited. Reserve your spot early.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Contact & Back Nav ─── */}
      <section className="py-14" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[14px] mb-6"
              style={{ color: "rgba(26,19,17,0.5)" }}
            >
              Questions? Call{" "}
              <a
                href="tel:8284401116"
                className="no-underline hover:underline"
                style={{ color: DEEP_RED }}
              >
                (828) 440-1116
              </a>{" "}
              ·{" "}
              <a
                href="mailto:info@tryonhistorymuseum.org"
                className="no-underline hover:underline"
                style={{ color: DEEP_RED }}
              >
                info@tryonhistorymuseum.org
              </a>{" "}
              · 26 Maple Street, Tryon, NC 28782
            </p>
            <Link
              href="/events"
              className="font-body text-[13px] uppercase no-underline transition-colors hover:opacity-70"
              style={{ letterSpacing: "0.12em", color: MUTED_RED }}
            >
              ← Back to All Events
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
