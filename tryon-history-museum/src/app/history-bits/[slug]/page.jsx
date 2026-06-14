import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { historyBits, getBySlug } from "@/lib/historyBits";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

const DEEP_RED = "#7B2D26";
const GOLD_ACCENT = "#C4A35A";
const WARM_BLACK = "#1A1311";

export async function generateStaticParams() {
  return historyBits.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const article = getBySlug(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | History Bits | Tryon History Museum`,
    description: article.excerpt,
  };
}

export default async function HistoryBitPage({ params }) {
  const article = getBySlug(params.slug);
  if (!article) notFound();

  const siteSettings = await getSiteSettings();

  const related = historyBits
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 2);

  const paragraphs = article.body.split("\n\n").filter(Boolean);
  const additionalImages = article.images ? article.images.slice(1) : [];

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
              {article.categoryLabel}
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] m-0">
              {article.title}
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* ─── Article body ─── */}
      <section style={{ background: "#FAF7F4" }}>
        <div className="max-w-[720px] mx-auto px-5 md:px-8 py-16 md:py-24">
          {/* Back link */}
          <Link
            href="/history-bits"
            className="block font-body text-[13px] no-underline mb-8"
            style={{ color: DEEP_RED }}
          >
            ← Back to History Bits
          </Link>

          {/* Lead image */}
          <div className="relative w-full mb-10 overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              width={720}
              height={480}
              className="w-full object-cover"
              style={{ maxHeight: 480 }}
              priority
            />
          </div>

          {/* Body text */}
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="font-body text-[16px] md:text-[17px] leading-[1.85] mb-6"
              style={{ color: "rgba(26,19,17,0.8)" }}
            >
              {para}
            </p>
          ))}

          {/* Additional images */}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-12">
              {additionalImages.map((src, i) => (
                <div
                  key={i}
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "4/3" }}
                >
                  <Image
                    src={src}
                    alt={`${article.title} — photo ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 720px) 50vw, 360px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── More from category ─── */}
      {related.length > 0 && (
        <section className="py-16" style={{ background: "#FFFDF9" }}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <div
              className="font-body text-[11px] uppercase mb-8"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              More from {article.categoryLabel}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((rel) => (
                <FadeIn key={rel.slug}>
                  <Link
                    href={`/history-bits/${rel.slug}`}
                    className="group block no-underline transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(26,19,17,0.08)",
                      boxShadow: "0 1px 4px rgba(26,19,17,0.04)",
                    }}
                  >
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-6">
                      <div
                        className="font-body text-[10px] uppercase mb-2"
                        style={{ letterSpacing: "0.18em", color: GOLD_ACCENT }}
                      >
                        {rel.categoryLabel}
                      </div>
                      <h2
                        className="font-display text-[20px] font-semibold leading-[1.2] mb-3"
                        style={{ color: WARM_BLACK }}
                      >
                        {rel.title}
                      </h2>
                      <p
                        className="font-body text-[14px] leading-[1.7] mb-4"
                        style={{ color: "rgba(26,19,17,0.6)" }}
                      >
                        {rel.excerpt}
                      </p>
                      <span
                        className="font-body text-[13px]"
                        style={{ color: DEEP_RED }}
                      >
                        Read more →
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer siteSettings={siteSettings} />
    </main>
  );
}
