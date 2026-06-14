import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import HistoryBitsGrid from "@/components/HistoryBitsGrid";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const revalidate = 60;

export const metadata = {
  title: "History Bits | Tryon History Museum",
  description:
    "Short stories, profiles, and curiosities from Tryon's past — drawn from the Tryon History Museum's archives.",
};

const GOLD_ACCENT = "#C4A35A";

export default async function HistoryBitsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main id="main-content" style={{ background: "#1A1311" }}>
      <Nav />

      {/* ─── Hero ─── */}
      <section
        className="pt-24 pb-12 md:pt-28 md:pb-16 relative overflow-hidden"
        style={{ background: "#1A1311" }}
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
              Tryon History Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-4">
              History <span className="italic font-semibold">Bits</span>
            </h1>
            <p
              className="font-body text-[17px] md:text-[18px] leading-[1.8] max-w-[580px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Short reads on the people, places, and moments that shaped Tryon &mdash; drawn from our archives.
            </p>
          </FadeIn>
        </div>
      </section>

      <HistoryBitsGrid />

      <Footer siteSettings={siteSettings} />
    </main>
  );
}
