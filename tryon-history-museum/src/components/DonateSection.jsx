"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const donationTiers = [
  { amount: 25, label: "Friend", description: "Help us keep the lights on and the doors open." },
  { amount: 50, label: "Supporter", description: "Fund educational materials and exhibit upkeep." },
  { amount: 250, label: "Patron", description: "Support special programs and community events." },
  { amount: 500, label: "Benefactor", description: "Make a lasting impact on Tryon's heritage preservation." },
];

export default function DonateSection() {
  return (
    <>
      {/* Header */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, #5C1F1A 50%, ${DEEP_RED} 100%)`,
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
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Make a{" "}
              <span className="italic font-semibold">Donation</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Your tax-deductible gift helps preserve Tryon&apos;s rich history
              and keeps our doors open for future generations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Donation tiers */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2
                className="font-display text-3xl md:text-4xl font-light mb-4"
                style={{ color: WARM_BLACK }}
              >
                Choose a Gift Level
              </h2>
              <p
                className="font-body text-[15px] max-w-[480px] mx-auto"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Every contribution makes a difference. Select an amount below or
                enter a custom donation.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {donationTiers.map((tier, i) => (
              <FadeIn key={tier.amount} delay={i * 0.08}>
                <div
                  className="p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  <div
                    className="font-display text-3xl font-semibold mb-1"
                    style={{ color: DEEP_RED }}
                  >
                    ${tier.amount}
                  </div>
                  <div
                    className="font-body text-[11px] uppercase mb-3"
                    style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                  >
                    {tier.label}
                  </div>
                  <p
                    className="font-body text-[14px] leading-relaxed m-0"
                    style={{ color: "rgba(26,19,17,0.6)" }}
                  >
                    {tier.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Stripe placeholder */}
          <FadeIn delay={0.3}>
            <div
              className="p-8 md:p-12 text-center"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div
                className="font-display text-2xl font-semibold mb-4"
                style={{ color: WARM_BLACK }}
              >
                Online Donations Coming Soon
              </div>
              <p
                className="font-body text-[15px] leading-relaxed max-w-[480px] mx-auto mb-6"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                We&apos;re setting up secure online payment processing. In the
                meantime, you can donate by mail or in person at the museum.
              </p>

              <div
                className="p-6 max-w-[400px] mx-auto mb-6"
                style={{
                  background: "#FAF7F4",
                  border: "1px solid rgba(123,45,38,0.06)",
                }}
              >
                <div
                  className="font-body text-[10px] uppercase mb-2"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Mail Donations To
                </div>
                <p
                  className="font-body text-[15px] leading-relaxed m-0"
                  style={{ color: WARM_BLACK }}
                >
                  Tryon History Museum
                  <br />
                  26 Maple Street
                  <br />
                  Tryon, NC 28782
                </p>
              </div>

              <a
                href="mailto:info@tryonhistorymuseum.org?subject=Donation%20Inquiry"
                className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                style={{
                  letterSpacing: "0.12em",
                  color: WARM_BLACK,
                  background: GOLD_ACCENT,
                  padding: "14px 36px",
                }}
              >
                Email Us About Donating
              </a>
            </div>
          </FadeIn>

          {/* Tax info */}
          <FadeIn delay={0.4}>
            <p
              className="font-body text-[13px] text-center mt-8 italic"
              style={{ color: "rgba(26,19,17,0.45)" }}
            >
              The Tryon History Museum is a 501(c)(3) nonprofit organization.
              All donations are tax-deductible to the extent allowed by law.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
