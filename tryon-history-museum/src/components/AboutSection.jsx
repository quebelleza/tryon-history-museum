"use client";

import FadeIn from "./FadeIn";

const WARM_BLACK = "#1A1311";
const DARK_RED = "#5C1F1A";
const GOLD_ACCENT = "#C4A35A";

const historyCards = [
  {
    era: "Cherokee Origins",
    title: "Ancient Roots",
    desc: "Long before its incorporation, this land was Cherokee territory called Xuala, occupied by tribes as early as 8,000 BC. Governor William Tryon\u2019s treaty with the Cherokee during the French and Indian War gave the town its name.",
  },
  {
    era: "1885\u20131920s",
    title: "Railroad & Renaissance",
    desc: "Incorporated in 1885 at the height of American railroad expansion, Tryon quickly drew authors, artists, and luminaries \u2014 F. Scott Fitzgerald, Ernest Hemingway, First Ladies Coolidge and Roosevelt all found their way here.",
  },
  {
    era: "Equestrian Legacy",
    title: "Horse Country",
    desc: "Since the Tryon Riding and Hunt Club formed in 1925, equestrian life has defined this community. Morris the Horse has presided over downtown since 1928, and in 1956, the U.S. Olympic equestrian team trained here.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-28 md:py-32 relative overflow-hidden"
      style={{ background: WARM_BLACK }}
    >
      {/* Decorative corner */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: 60,
          left: "5%",
          width: 120,
          height: 1,
          background: `linear-gradient(to right, ${GOLD_ACCENT}30, transparent)`,
        }}
      />
      <div
        className="absolute hidden lg:block"
        style={{
          top: 0,
          left: "5%",
          width: 1,
          height: 120,
          background: `linear-gradient(to bottom, transparent, ${GOLD_ACCENT}30)`,
        }}
      />

      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="max-w-[600px] mb-20">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Our Story
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white leading-[1.15] mb-7">
              This is Tryon&apos;s story,
              <br />
              <span className="italic font-semibold" style={{ color: GOLD_ACCENT }}>
                told by its people
              </span>
            </h2>
            <p
              className="font-body text-base leading-[1.8] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              The Tryon History Museum preserves and protects the story of a
              remarkable small town in the Blue Ridge foothills — a place where
              Cherokee heritage, railroad ambition, artistic vision, and
              equestrian tradition have woven together across centuries.
            </p>
          </FadeIn>
        </div>

        {/* History cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {historyCards.map((card, i) => (
            <FadeIn key={card.era} delay={i * 0.15}>
              <div
                className="p-6 md:p-10 h-full transition-colors duration-300 hover:border-[rgba(196,163,90,0.35)]"
                style={{
                  border: "1px solid rgba(196,163,90,0.15)",
                }}
              >
                <div
                  className="font-body text-[11px] uppercase mb-4"
                  style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
                >
                  {card.era}
                </div>
                <h3 className="font-display text-[28px] font-semibold text-white mb-4">
                  {card.title}
                </h3>
                <p
                  className="font-body text-sm leading-[1.75] m-0"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {card.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Nina Simone highlight */}
        <FadeIn delay={0.2}>
          <div
            className="mt-16 p-7 md:p-14 flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center"
            style={{
              background: `linear-gradient(135deg, ${DARK_RED}40 0%, transparent 100%)`,
              border: "1px solid rgba(196,163,90,0.15)",
            }}
          >
            <div className="flex-1">
              <div
                className="font-display text-6xl leading-none mb-2"
                style={{ color: GOLD_ACCENT, opacity: 0.3 }}
              >
                &ldquo;
              </div>
              <p
                className="font-display text-xl md:text-[22px] italic leading-relaxed m-0"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Tryon&apos;s most celebrated native daughter, Nina Simone, born
                Eunice Kathleen Waymon in 1933, began her extraordinary musical
                journey right here — a self-taught piano prodigy by age three,
                funded by a community that recognized her brilliance.
              </p>
              <div
                className="font-body text-[13px] mt-5 uppercase cursor-pointer hover:brightness-125 transition-all"
                style={{ letterSpacing: "0.1em", color: GOLD_ACCENT }}
              >
                Explore the Nina Simone exhibit →
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
