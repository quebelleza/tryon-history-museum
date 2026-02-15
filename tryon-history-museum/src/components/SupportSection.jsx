"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const DARK_RED = "#5C1F1A";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

const tiers = [
  {
    name: "Individual",
    price: "$50",
    perks:
      "Free admission, newsletter, 10% gift shop discount, member-only events",
  },
  {
    name: "Family",
    price: "$75",
    perks:
      "All individual perks for your household, guest passes, event priority",
  },
  {
    name: "Patron",
    price: "$250",
    perks:
      "All family perks, private tours, name on donor wall, exclusive events",
    featured: true,
  },
];

function normalizeSanityTiers(sanityTiers) {
  if (!sanityTiers || sanityTiers.length === 0) return null;
  return sanityTiers.map((t) => ({
    name: t.name,
    price: `$${t.price}`,
    perks: t.perks,
    featured: t.featured || false,
  }));
}

export default function SupportSection({ sanityTiers }) {
  const displayTiers = normalizeSanityTiers(sanityTiers) || tiers;

  return (
    <section
      id="support"
      className="py-24 md:py-28 relative"
      style={{
        background: `linear-gradient(170deg, ${DEEP_RED} 0%, ${DARK_RED} 60%, ${WARM_BLACK} 100%)`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center max-w-[560px] mx-auto mb-16">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Support the Museum
            </div>
            <h2 className="font-display text-4xl md:text-[44px] font-light text-white leading-[1.15] mb-5">
              Help Us{" "}
              <span className="italic font-semibold">
                Tell Tryon&apos;s Story
              </span>
            </h2>
            <p
              className="font-body text-base leading-relaxed m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Your membership directly supports the preservation of Tryon&apos;s
              heritage and helps us grow into the future. Every level makes a
              difference.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTiers.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.12}>
              <div
                className="p-11 text-center transition-colors duration-300"
                style={{
                  border: `1px solid rgba(196,163,90,${tier.featured ? "0.4" : "0.15"})`,
                  background: tier.featured
                    ? "rgba(196,163,90,0.06)"
                    : "transparent",
                }}
              >
                <div
                  className="font-body text-[11px] uppercase mb-4"
                  style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
                >
                  {tier.name}
                </div>
                <div className="font-display text-5xl font-light text-white mb-1">
                  {tier.price}
                </div>
                <div
                  className="font-body text-xs mb-6"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  per year
                </div>
                <p
                  className="font-body text-sm leading-relaxed mb-7"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {tier.perks}
                </p>
                <a
                  href="#"
                  className="inline-block font-body text-xs font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{
                    letterSpacing: "0.14em",
                    color: tier.featured ? WARM_BLACK : "#fff",
                    background: tier.featured ? GOLD_ACCENT : "transparent",
                    border: tier.featured
                      ? "none"
                      : "1px solid rgba(255,255,255,0.25)",
                    padding: "12px 28px",
                  }}
                >
                  Join Now
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Volunteer + Donate CTAs */}
        <FadeIn delay={0.3}>
          <div
            className="flex justify-center gap-12 mt-14 pt-12"
            style={{ borderTop: "1px solid rgba(196,163,90,0.1)" }}
          >
            <a
              href="#"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-colors hover:!text-tryon-gold"
              style={{
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Become a Volunteer →
            </a>
            <a
              href="#"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-colors hover:!text-tryon-gold"
              style={{
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Make a Donation →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
