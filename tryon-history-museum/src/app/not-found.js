import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export const metadata = {
  title: "Page Not Found | Tryon History Museum",
};

export default function NotFound() {
  return (
    <main>
      <Nav />
      <section
        className="pt-40 pb-24 md:pt-48 md:pb-32 relative overflow-hidden min-h-[70vh] flex items-center"
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
        <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center relative z-10">
          <div
            className="font-display text-[120px] md:text-[160px] font-light leading-none mb-4"
            style={{ color: "rgba(196,163,90,0.12)" }}
          >
            404
          </div>
          <div
            className="font-body text-[11px] uppercase mb-4"
            style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
          >
            Page Not Found
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-white leading-[1.2] mb-5">
            This page seems to be{" "}
            <span className="italic font-semibold">lost in history</span>
          </h1>
          <p
            className="font-body text-[15px] leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on the trail.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "14px 32px",
              }}
            >
              Return Home
            </a>
            <a
              href="/events"
              className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:bg-white/10"
              style={{
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "14px 32px",
              }}
            >
              View Events
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
