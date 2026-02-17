"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

const fallbackEvents = [
  {
    date: "Mar 17",
    title: "Volunteer Appreciation Luncheon",
    type: "Museum Event",
    desc: "{PLACEHOLDER \u2014 add description}",
    href: "#",
  },
  {
    date: "Apr 5",
    title: "Dr. M.C. Palmer: A Country Doctor\u2019s Legacy",
    type: "Presentation",
    desc: "Discover the remarkable life and practice of one of Tryon\u2019s most beloved physicians.",
  },
  {
    date: "Apr 19",
    title: "Block House Steeplechase History",
    type: "Special Exhibit Opening",
    desc: "A new exhibit celebrating nearly a century of North Carolina\u2019s longest-running steeplechase.",
  },
  {
    date: "May 16",
    title: "Modernist Home Tour",
    type: "Home Tour",
    desc: "A rare look inside 6 stunning modernist homes \u2014 with expert docent guides, bus transportation, and lunch included.",
    href: "/events/modernist-home-tour",
  },
];

function formatSanityDate(dateStr) {
  if (!dateStr) return { month: "", day: "" };
  const date = new Date(dateStr + "T12:00:00");
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate().toString();
  return { month, day };
}

function normalizeEvents(sanityEvents) {
  if (!sanityEvents || sanityEvents.length === 0) return fallbackEvents.map(e => ({
    ...e,
    month: e.date.split(" ")[0],
    day: e.date.split(" ")[1],
    href: e.href || null,
  }));

  return sanityEvents.map((e) => {
    const { month, day } = formatSanityDate(e.date);
    return {
      title: e.title,
      type: e.eventType || "Event",
      desc: e.description || "",
      month,
      day,
    };
  });
}

export default function EventsSection({ events }) {
  const displayEvents = normalizeEvents(events);

  return (
    <section id="events" className="bg-tryon-cream py-24 md:py-28">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="flex flex-wrap justify-between items-end mb-16">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: DEEP_RED }}
            >
              What&apos;s Happening
            </div>
            <h2 className="font-display text-4xl md:text-[44px] font-light text-tryon-black leading-[1.15] m-0">
              Upcoming <span className="italic font-semibold">Events</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <a
              href="/events"
              className="font-body text-[13px] font-semibold uppercase no-underline mt-4 md:mt-0"
              style={{
                letterSpacing: "0.12em",
                color: DEEP_RED,
                borderBottom: `1px solid ${DEEP_RED}`,
                paddingBottom: 4,
              }}
            >
              View All Events →
            </a>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayEvents.map((event, i) => {
            const cardContent = (
              <div
                className="flex gap-4 md:gap-7 p-5 md:p-9 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.08)",
                }}
              >
                {/* Date block */}
                <div
                  className="min-w-[56px] md:min-w-[72px] text-center py-4 pr-4 md:pr-7"
                  style={{ borderRight: "1px solid rgba(123,45,38,0.1)" }}
                >
                  <div
                    className="font-display text-[28px] font-bold leading-none"
                    style={{ color: DEEP_RED }}
                  >
                    {event.day}
                  </div>
                  <div
                    className="font-body text-[11px] uppercase mt-1"
                    style={{
                      letterSpacing: "0.15em",
                      color: "#A8584F",
                    }}
                  >
                    {event.month}
                  </div>
                </div>
                {/* Details */}
                <div className="flex-1">
                  <div
                    className="font-body text-[11px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
                  >
                    {event.type}
                  </div>
                  <h3 className="font-display text-[22px] font-semibold text-tryon-black mb-2">
                    {event.title}
                  </h3>
                  <p
                    className="font-body text-sm leading-relaxed m-0"
                    style={{ color: "rgba(26,19,17,0.6)" }}
                  >
                    {event.desc}
                  </p>
                </div>
              </div>
            );

            return (
              <FadeIn key={event.title} delay={i * 0.1}>
                {event.href ? (
                  <Link href={event.href} className="block no-underline h-full">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
