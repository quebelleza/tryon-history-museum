"use client";

const DEEP_RED = "#7B2D26";
const DARK_RED = "#5C1F1A";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

function getTodayHours() {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const schedule = {
    0: "Closed",
    1: "Closed",
    2: "Closed",
    3: "1:00 PM – 4:00 PM",
    4: "1:00 PM – 4:00 PM",
    5: "11:00 AM – 5:00 PM",
    6: "11:00 AM – 5:00 PM",
  };
  return schedule[day];
}

export default function Hero() {
  const todayHours = getTodayHours();

  return (
    <section
      className="relative min-h-[600px] h-screen flex items-end overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${WARM_BLACK} 0%, ${DARK_RED} 50%, ${DEEP_RED} 100%)`,
      }}
    >
      {/* Texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />
      {/* Decorative lines */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: "15%",
          right: "8%",
          width: 1,
          height: "35%",
          background: `linear-gradient(to bottom, transparent, ${GOLD_ACCENT}40, transparent)`,
        }}
      />
      <div
        className="absolute hidden lg:block"
        style={{
          top: "25%",
          right: "7%",
          width: 80,
          height: 1,
          background: `linear-gradient(to left, transparent, ${GOLD_ACCENT}40)`,
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-8 pb-16 md:pb-24 w-full">
        <div className="max-w-[700px]">
          <div
            className="font-body text-xs uppercase mb-6 animate-fade-up animation-delay-300"
            style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
          >
            Tryon, North Carolina &middot; Est. 1885
          </div>
          <h1 className="font-display font-light text-white leading-[1.1] m-0 animate-fade-up animation-delay-500 text-[clamp(42px,6vw,72px)]">
            A Small Town
            <br />
            <span className="font-semibold italic">with a Grand Story</span>
          </h1>
          <p
            className="font-body text-[17px] leading-relaxed max-w-[480px] mt-7 animate-fade-up animation-delay-700"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            From Cherokee heritage to the railroad age, from Nina Simone&apos;s
            first piano notes to a world-renowned equestrian tradition —
            discover the people and moments that shaped Tryon.
          </p>
          <div className="flex flex-wrap gap-4 mt-10 animate-fade-up animation-delay-900">
            <a
              href="#visit"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "14px 32px",
              }}
            >
              Plan Your Visit
            </a>
            <a
              href="#about"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:bg-white/10"
              style={{
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "14px 32px",
              }}
            >
              Our Story
            </a>
          </div>
        </div>
      </div>

      {/* Hours badge */}
      <div
        className="absolute bottom-0 right-0 animate-fade-up animation-delay-1100 hidden md:block"
        style={{
          background: "rgba(26,19,17,0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(123,45,38,0.2)",
          borderBottom: "none",
          borderRight: "none",
          padding: "28px 40px",
        }}
      >
        <div
          className="font-body text-[11px] uppercase mb-3"
          style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
        >
          Today&apos;s Hours
        </div>
        <div className="font-display text-[22px] text-white font-light">
          {todayHours}
        </div>
        <div
          className="font-body text-xs mt-1"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Open Wed–Sat &middot;{" "}
          <a href="#visit" className="no-underline" style={{ color: GOLD_ACCENT }}>
            See all hours
          </a>
        </div>
      </div>
    </section>
  );
}
