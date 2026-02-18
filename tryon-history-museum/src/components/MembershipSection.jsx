"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const NAVY = "#1B2A4A";

const tiers = [
  {
    name: "Individual",
    price: "$50",
    period: "per year",
    benefits: [
      "Member pricing on tickets",
      "Access to members-only events",
      "Museum newsletter",
      "10% gift shop discount",
    ],
  },
  {
    name: "Family",
    price: "$75",
    period: "per year",
    benefits: [
      "All Individual perks for your household",
      "Guest passes",
      "Event priority registration",
      "Museum newsletter",
      "10% gift shop discount",
    ],
  },
];

export default function MembershipSection() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 relative overflow-hidden"
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
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Support the Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-4">
              Become a <span className="italic font-semibold">Member</span>
            </h1>
            <p
              className="font-body text-[17px] md:text-[18px] leading-[1.8] max-w-[580px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Support Tryon&apos;s story — and enjoy exclusive benefits
              year-round.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Tier Cards ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div
                  className="p-8 md:p-10 h-full flex flex-col"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  <div
                    className="font-body text-[11px] uppercase mb-4"
                    style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
                  >
                    Membership
                  </div>
                  <h2
                    className="font-display text-2xl md:text-3xl font-semibold mb-2"
                    style={{ color: WARM_BLACK }}
                  >
                    {tier.name}
                  </h2>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span
                      className="font-display text-4xl font-semibold"
                      style={{ color: DEEP_RED }}
                    >
                      {tier.price}
                    </span>
                    <span
                      className="font-body text-[13px]"
                      style={{ color: "rgba(26,19,17,0.45)" }}
                    >
                      {tier.period}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 mb-8">
                    {tier.benefits.map((benefit, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span
                          className="text-sm mt-0.5 flex-shrink-0"
                          style={{ color: GOLD_ACCENT }}
                        >
                          ✦
                        </span>
                        <span
                          className="font-body text-[14px] leading-[1.6]"
                          style={{ color: "rgba(26,19,17,0.65)" }}
                        >
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* {TODO: connect to Stripe in Phase 5} */}
                  <button
                    className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110"
                    style={{
                      letterSpacing: "0.12em",
                      color: WARM_BLACK,
                      background: GOLD_ACCENT,
                      padding: "14px 36px",
                      border: "none",
                    }}
                  >
                    Join Now
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Donor Note ─── */}
      <section className="py-14 md:py-16" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <div
              className="p-8 md:p-10"
              style={{
                background: "rgba(27,42,74,0.03)",
                border: "1px solid rgba(27,42,74,0.08)",
              }}
            >
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
              >
                Donor Benefits
              </div>
              <p
                className="font-body text-[15px] leading-[1.7] m-0"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Donors contributing $100 or more annually receive Family-level
                membership benefits as our thank-you.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Already a member? ─── */}
      <section className="py-14" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[15px] mb-0"
              style={{ color: "rgba(26,19,17,0.55)" }}
            >
              Already a member?{" "}
              <Link
                href="/login"
                className="no-underline font-semibold hover:underline"
                style={{ color: DEEP_RED }}
              >
                Log in to access your benefits →
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Contact Footer ─── */}
      <section className="py-14" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[14px] mb-4"
              style={{ color: "rgba(26,19,17,0.5)" }}
            >
              Questions about membership? Call{" "}
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
              </a>
            </p>
            <p
              className="font-body text-[13px] italic m-0"
              style={{ color: "rgba(26,19,17,0.4)" }}
            >
              The Tryon History Museum is a 501(c)(3) nonprofit organization.
              Your membership supports the preservation of Tryon&apos;s history.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
