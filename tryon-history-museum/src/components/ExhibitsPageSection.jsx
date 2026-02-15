"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";
import Image from "next/image";
import SanityImage from "./SanityImage";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

function formatDateRange(startDate, endDate, isPermanent) {
  if (isPermanent) return "Permanent Exhibit";
  if (!startDate) return "";

  const start = new Date(startDate + "T12:00:00");
  const startStr = start.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!endDate) return `Opens ${startStr}`;

  const end = new Date(endDate + "T12:00:00");
  const endStr = end.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return `${startStr} – ${endStr}`;
}

function ExhibitCard({ exhibit }) {
  const dateLabel = formatDateRange(
    exhibit.startDate,
    exhibit.endDate,
    exhibit.isPermanent
  );

  const slug = exhibit.slug?.current;

  const Wrapper = slug ? Link : "div";
  const wrapperProps = slug
    ? { href: `/exhibits/${slug}`, className: "group block no-underline" }
    : { className: "group" };

  return (
    <Wrapper
      {...wrapperProps}
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(123,45,38,0.08)",
      }}
    >
      {/* Image */}
      {exhibit.coverImage?.asset ? (
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <SanityImage
            image={exhibit.coverImage}
            alt={exhibit.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : exhibit.coverImageUrl ? (
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <Image
            src={exhibit.coverImageUrl}
            alt={exhibit.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div
          className="w-full aspect-[16/10] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #F5F0EB 0%, #FAF7F4 100%)",
          }}
        >
          <div
            className="font-display text-4xl font-light"
            style={{ color: "rgba(123,45,38,0.1)" }}
          >
            {exhibit.title?.[0] || "E"}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-8">
        {dateLabel && (
          <div
            className="font-body text-[11px] uppercase mb-3"
            style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
          >
            {dateLabel}
          </div>
        )}
        <h3
          className="font-display text-2xl font-semibold mb-3"
          style={{ color: WARM_BLACK }}
        >
          {exhibit.title}
        </h3>
        {exhibit.description && (
          <p
            className="font-body text-[15px] leading-[1.7] m-0"
            style={{ color: "rgba(26,19,17,0.6)" }}
          >
            {exhibit.description}
          </p>
        )}
      </div>
    </Wrapper>
  );
}

export default function ExhibitsPageSection({ exhibits }) {
  const permanent = (exhibits || []).filter((e) => e.isPermanent);
  const rotating = (exhibits || []).filter((e) => !e.isPermanent);
  const hasNoExhibits = permanent.length === 0 && rotating.length === 0;

  return (
    <>
      {/* Page header */}
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-24 relative overflow-hidden"
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
              Explore the Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Our{" "}
              <span className="italic font-semibold">Exhibits</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              From permanent collections to rotating showcases, discover
              the stories, artifacts, and artistry that bring Tryon&apos;s
              heritage to life.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Permanent Exhibits */}
      {permanent.length > 0 && (
        <section className="bg-tryon-cream py-16 md:py-20">
          <div className="max-w-[1000px] mx-auto px-5 md:px-8">
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-10"
                style={{ letterSpacing: "0.25em", color: DEEP_RED }}
              >
                Permanent Exhibits
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {permanent.map((exhibit, i) => (
                <FadeIn key={exhibit._id} delay={i * 0.1}>
                  <ExhibitCard exhibit={exhibit} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rotating / Temporary Exhibits */}
      {rotating.length > 0 && (
        <section
          className="py-16 md:py-20"
          style={{ background: "#F5F0EB" }}
        >
          <div className="max-w-[1000px] mx-auto px-5 md:px-8">
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-10"
                style={{ letterSpacing: "0.25em", color: DEEP_RED }}
              >
                Current &amp; Upcoming Exhibits
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rotating.map((exhibit, i) => (
                <FadeIn key={exhibit._id} delay={i * 0.1}>
                  <ExhibitCard exhibit={exhibit} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {hasNoExhibits && (
        <section className="bg-tryon-cream py-20 md:py-28">
          <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
            <FadeIn>
              <div
                className="font-display text-6xl mb-4"
                style={{ color: "rgba(123,45,38,0.12)" }}
              >
                🖼
              </div>
              <h2
                className="font-display text-2xl font-semibold mb-3"
                style={{ color: WARM_BLACK }}
              >
                Exhibits Coming Soon
              </h2>
              <p
                className="font-body text-[15px] leading-relaxed"
                style={{ color: "rgba(26,19,17,0.55)" }}
              >
                We&apos;re preparing our exhibit listings. Check back soon or
                visit the museum to see what&apos;s on display.
              </p>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  );
}
