"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const shopCategories = [
  {
    title: "Local History Books",
    description:
      "A curated selection of titles on Tryon, Polk County, and the Carolina foothills — from Civil War journals to equestrian heritage.",
    icon: "📚",
  },
  {
    title: "Tryon Memorabilia",
    description:
      "Postcards, prints, and keepsakes featuring historic photographs and landmarks from Tryon's past.",
    icon: "🏛️",
  },
  {
    title: "Artisan & Local Goods",
    description:
      "Handcrafted items from local artists and makers — perfect for gifts or a memento of your visit.",
    icon: "🎨",
  },
  {
    title: "Museum Merchandise",
    description:
      "Show your support with Tryon History Museum branded items including totes, caps, and apparel.",
    icon: "🛍️",
  },
];

export default function GiftShopSection() {
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
              Take a Piece of History Home
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Museum{" "}
              <span className="italic font-semibold">Gift Shop</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Books, memorabilia, local artisan goods, and more — available
              in-store during regular museum hours.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[1000px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            {shopCategories.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 0.08}>
                <div
                  className="p-6 md:p-8 h-full"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  <div className="text-3xl mb-4">{cat.icon}</div>
                  <h3
                    className="font-display text-xl font-semibold mb-2"
                    style={{ color: WARM_BLACK }}
                  >
                    {cat.title}
                  </h3>
                  <p
                    className="font-body text-[14px] leading-relaxed m-0"
                    style={{ color: "rgba(26,19,17,0.6)" }}
                  >
                    {cat.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Visit CTA */}
          <FadeIn delay={0.3}>
            <div
              className="p-8 md:p-12 text-center"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div
                className="font-display text-2xl md:text-3xl font-semibold mb-4"
                style={{ color: WARM_BLACK }}
              >
                Visit Us In Person
              </div>
              <p
                className="font-body text-[15px] leading-relaxed max-w-[500px] mx-auto mb-2"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Our gift shop is located inside the Tryon History Museum &
                Visitor Center. Stop by during regular hours to browse our
                full collection.
              </p>
              <p
                className="font-body text-[14px] mb-8"
                style={{ color: MUTED_RED }}
              >
                26 Maple Street, Tryon, NC 28782
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#visit"
                  className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "14px 36px",
                  }}
                >
                  Plan Your Visit
                </a>
                <a
                  href="mailto:info@tryonhistorymuseum.org?subject=Gift%20Shop%20Inquiry"
                  className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:bg-black/5"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    border: "1px solid rgba(26,19,17,0.2)",
                    padding: "14px 36px",
                  }}
                >
                  Email Us
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
