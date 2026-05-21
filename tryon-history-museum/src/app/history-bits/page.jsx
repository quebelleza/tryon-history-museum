import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const revalidate = 60;

export const metadata = {
  title: "History Bits | Tryon History Museum",
  description:
    "Short stories, profiles, and curiosities from Tryon's past — drawn from the Tryon History Museum's archives.",
};

const CHARCOAL = "#2A2A2A";
const GOLD = "#B8956A";
const CREAM = "#FAF8F5";

const ctas = [
  {
    heading: "Tales of Tryon",
    sub: "Our lecture series archive — 30+ recorded talks on Tryon\u2019s history",
    href: "/tales-of-tryon",
  },
  {
    heading: "Plan Your Visit",
    sub: "Hours, directions, and visitor information for the museum",
    href: "/visit",
  },
];

export default async function HistoryBitsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main id="main-content">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-24 relative overflow-hidden"
        style={{ background: CHARCOAL, minHeight: 420 }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div
            className="font-body text-[11px] uppercase tracking-[0.35em] mb-6"
            style={{ color: GOLD }}
          >
            Still in the Moving Boxes
          </div>
          <h1
            className="font-display font-light leading-[1.05] mb-6 m-0"
            style={{ fontSize: "clamp(40px, 7vw, 80px)", color: CREAM }}
          >
            History Bits
          </h1>
          <p
            className="font-body text-[17px] leading-relaxed max-w-[600px] m-0"
            style={{ color: "rgba(250,248,245,0.78)" }}
          >
            Short stories, profiles, and curiosities from Tryon&apos;s past
            &mdash; drawn from our archives and told in the time it takes to
            drink a cup of coffee.
          </p>
        </div>
      </section>

      {/* ── EXPLANATION ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="max-w-[700px] mx-auto px-5 md:px-8 text-center">
          <h2
            className="font-display text-3xl md:text-4xl font-light mb-8"
            style={{ color: CHARCOAL }}
          >
            What&apos;s coming.
          </h2>
          <div className="space-y-5 text-left">
            <p
              className="font-body text-[16px] leading-[1.85] m-0"
              style={{ color: "rgba(42,42,42,0.75)" }}
            >
              We&apos;re migrating the History Bits archive from our previous
              website &mdash; dozens of short reads on the people, places, and
              moments that have shaped this town. From the Cherokee
              surveyor&apos;s notes to the founding of the Lanier Library, from
              Carter Brown&apos;s vision for Tryon to Nina Simone&apos;s
              earliest piano lessons, History Bits collects the small stories
              that, taken together, make up the larger one.
            </p>
            <p
              className="font-body text-[16px] leading-[1.85] m-0"
              style={{ color: "rgba(42,42,42,0.75)" }}
            >
              It will take us a little while to bring them over and give each
              one the editorial treatment it deserves. Check back soon &mdash;
              or in the meantime, browse the Tales of Tryon lecture archive for
              video recordings of our community history series.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────── */}
      <section className="pb-20 md:pb-28" style={{ background: CREAM }}>
        <div className="max-w-[700px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="group block no-underline p-7 transition-all duration-200"
                style={{
                  border: `1px solid rgba(42,42,42,0.18)`,
                  background: "#FFFDF9",
                }}
              >
                <h3
                  className="font-display text-[21px] font-semibold mb-2 transition-colors duration-200 group-hover:underline"
                  style={{ color: CHARCOAL }}
                >
                  {cta.heading}
                </h3>
                <p
                  className="font-body text-[14px] leading-[1.6] m-0"
                  style={{ color: "rgba(42,42,42,0.58)" }}
                >
                  {cta.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer siteSettings={siteSettings} />
    </main>
  );
}
