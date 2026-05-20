import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const revalidate = 60;

export const metadata = {
  title: "Our Story | Tryon History Museum",
  description:
    "How a group of dedicated Tryon residents came together in 2013 to build a museum worthy of this town's remarkable history.",
};

const FOREST_GREEN = "#2C5530";
const GOLD = "#B8956A";
const CREAM = "#FAF8F5";
const CHARCOAL = "#2A2A2A";

const pillars = [
  {
    heading: "The Full Arc of Tryon\u2019s Story",
    body: "From Cherokee heritage and the surveyor William Tryon, through the railroad age that put this mountain town on the map, to the artists and authors and equestrians who followed \u2014 we preserve the whole of it.",
  },
  {
    heading: "The People Who Made It",
    body: "Tryon has always been shaped by remarkable individuals. Carter Brown, who gave the town its equestrian identity. Nina Simone, who took her first piano lessons here. The Eastside community, whose contributions are woven through every chapter.",
  },
  {
    heading: "Living Memory",
    body: "Our rotating exhibits, oral histories, and the Tales of Tryon lecture series ensure that memory doesn\u2019t fade with the generation that holds it. This museum is a living institution, not an archive.",
  },
];

const stats = [
  { stat: "2013", label: "Founded" },
  { stat: "2015", label: "Opened to the Public" },
  { stat: "1,500 sq ft", label: "26 Maple Street" },
  { stat: "501(c)(3)", label: "Independent Nonprofit" },
];

const ctas = [
  { label: "Plan Your Visit", sub: "Hours & directions", href: "/visit" },
  { label: "Support the Museum", sub: "Memberships & donations", href: "/donate" },
  { label: "Meet the Board", sub: "The people behind it", href: "/board" },
];

export default async function OurStoryPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main id="main-content">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ height: "72vh", minHeight: 500 }}
      >
        <Image
          src="/images/museum-rendering.jpg"
          alt="Artistic rendering of the Tryon History Museum at 26 Maple Street"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(42,42,42,0.82) 0%, rgba(42,42,42,0.55) 60%, rgba(42,42,42,0.35) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 pb-16 md:pb-24 w-full">
            <div
              className="font-body text-[11px] uppercase tracking-[0.35em] mb-6"
              style={{ color: GOLD }}
            >
              Our Story
            </div>
            <h1
              className="font-display font-light leading-[1.1] max-w-3xl m-0"
              style={{ fontSize: "clamp(30px, 5vw, 62px)", color: CREAM }}
            >
              A town this storied deserved
              <br />
              <span className="italic font-semibold">
                a place to keep its stories.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── FOUNDING ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: CREAM }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left: Narrative */}
            <div>
              <div
                className="font-body text-[11px] uppercase tracking-[0.3em] mb-4"
                style={{ color: GOLD }}
              >
                Est. 2013
              </div>
              <h2
                className="font-display font-light leading-[1.15] mb-10"
                style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: CHARCOAL }}
              >
                Built by the People
                <br />
                <span
                  className="italic font-semibold"
                  style={{ color: FOREST_GREEN }}
                >
                  Who Loved This Place
                </span>
              </h2>
              <div
                className="font-body leading-[1.9] space-y-6"
                style={{ fontSize: 17, color: "rgba(42,42,42,0.78)" }}
              >
                <p className="m-0">
                  In August 2013, a group of concerned Tryon residents gathered
                  with a shared conviction: that this town&apos;s story was too
                  important to leave untold — and too particular to be told by
                  anyone but the people who had lived it.
                </p>
                <p className="m-0">
                  They formed a board, borrowed space under the Tryon Downtown
                  Development Association, and began the patient work of building
                  something lasting. Not a grand institution imposed from the
                  outside, but a local museum rooted in memory, artifact, and
                  community.
                </p>
                <p className="m-0">
                  It took two years. In June 2015, the board secured a
                  1,500-square-foot space at 26 Maple Street — the former home of
                  the Tryon Painters &amp; Sculptors Gallery, a fitting
                  inheritance for a building that had always held Tryon&apos;s
                  creative spirit.
                </p>
              </div>
            </div>

            {/* Right: Rendering image */}
            <div className="lg:pt-16">
              <div
                className="relative overflow-hidden"
                style={{
                  border: "1px solid rgba(184,149,106,0.22)",
                  boxShadow:
                    "0 8px 40px rgba(42,42,42,0.1), 0 2px 8px rgba(42,42,42,0.06)",
                }}
              >
                <div className="relative aspect-[3/2]">
                  <Image
                    src="/images/museum-rendering.jpg"
                    alt="Artistic rendering of the Tryon History Museum at 26 Maple Street"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <p
                className="font-body text-[13px] italic mt-4 m-0"
                style={{ color: GOLD, letterSpacing: "0.02em" }}
              >
                Artistic rendering of the museum at 26 Maple Street
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── OPENING DAY ──────────────────────────────────────────────── */}
      <section
        className="py-28 md:py-40"
        style={{ background: FOREST_GREEN }}
      >
        <div className="max-w-[760px] mx-auto px-5 md:px-8 text-center">
          <div
            className="font-body text-[11px] uppercase tracking-[0.35em] mb-10"
            style={{ color: GOLD }}
          >
            September 26, 2015
          </div>
          <blockquote
            className="font-display italic font-light leading-[1.25] m-0 mb-10"
            style={{ fontSize: "clamp(26px, 4vw, 50px)", color: CREAM }}
          >
            &ldquo;The doors opened on a Saturday evening in September.
            Tryon came out.&rdquo;
          </blockquote>
          <div
            className="mx-auto mb-10"
            style={{
              width: 48,
              height: 1,
              background: `rgba(184,149,106,0.5)`,
            }}
          />
          <p
            className="font-body leading-[1.85] m-0"
            style={{ fontSize: 17, color: "rgba(250,248,245,0.72)" }}
          >
            The museum officially welcomed the public on September 26, 2015,
            with a community reception at 26 Maple Street. What had begun as a
            conversation among neighbors two years earlier had become a place —
            a real institution with walls, artifacts, and a mission.
          </p>
        </div>
      </section>

      {/* ── WHAT WE HOLD ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: CREAM }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="text-center mb-16 md:mb-20">
            <div
              className="font-body text-[11px] uppercase tracking-[0.3em] mb-4"
              style={{ color: GOLD }}
            >
              Our Mission
            </div>
            <h2
              className="font-display font-light m-0"
              style={{ fontSize: "clamp(26px, 3.5vw, 44px)", color: CHARCOAL }}
            >
              What We{" "}
              <span
                className="italic font-semibold"
                style={{ color: FOREST_GREEN }}
              >
                Hold
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {pillars.map((col) => (
              <div key={col.heading}>
                <div
                  className="mb-7"
                  style={{ width: 36, height: 2, background: GOLD }}
                />
                <h3
                  className="font-display text-[22px] font-semibold leading-snug mb-4"
                  style={{ color: CHARCOAL }}
                >
                  {col.heading}
                </h3>
                <p
                  className="font-body text-[15px] leading-[1.85] m-0"
                  style={{ color: "rgba(42,42,42,0.68)" }}
                >
                  {col.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BY THE NUMBERS ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div style={{ height: 1, background: `rgba(184,149,106,0.35)` }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-14 md:py-16">
            {stats.map((item) => (
              <div key={item.label}>
                <div
                  className="font-display font-light leading-none mb-3"
                  style={{
                    fontSize: "clamp(24px, 3.5vw, 46px)",
                    color: GOLD,
                  }}
                >
                  {item.stat}
                </div>
                <div
                  className="font-body text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: CHARCOAL }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: `rgba(184,149,106,0.35)` }} />
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24" style={{ background: CREAM }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ctas.map((cta) => (
              <a
                key={cta.href}
                href={cta.href}
                className="group block no-underline text-center py-10 px-6 transition-all duration-300"
                style={{
                  border: "1px solid rgba(184,149,106,0.28)",
                  background: "#FFFDF9",
                }}
              >
                <div
                  className="font-display text-[21px] font-semibold mb-2 transition-colors duration-300 group-hover:text-[#2C5530]"
                  style={{ color: CHARCOAL }}
                >
                  {cta.label}
                </div>
                <div
                  className="font-body text-[12px] uppercase tracking-[0.15em] mb-4"
                  style={{ color: GOLD }}
                >
                  {cta.sub}
                </div>
                <div
                  className="mx-auto transition-all duration-300 group-hover:w-10"
                  style={{
                    width: 24,
                    height: 1,
                    background: `rgba(184,149,106,0.5)`,
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer siteSettings={siteSettings} />
    </main>
  );
}
