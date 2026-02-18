"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

const fallbackEvents = [
  {
    date: "Feb 27",
    title: "Curator Chat: WWII Veterans Tribute Exhibit",
    type: "Members Only",
    desc: "Join us for an intimate members-only conversation with our curator about our upcoming WWII Veterans tribute exhibit \u2014 honoring the Tryon natives who served, and the stories that connect this small town to a world at war.",
    href: "/events/curator-chat-wwii",
    membersOnly: true,
  },
  {
    date: "Mar 17",
    title: "Volunteer Appreciation Luncheon",
    type: "Museum Event",
    desc: "Our annual celebration honoring the volunteers, docents, and board members who give their time, talents, and energy to keep Tryon\u2019s story alive \u2014 with a special musical surprise on St. Patrick\u2019s Day.",
    href: "#",
  },
  {
    date: "Apr 5",
    title: "Dr. M.C. Palmer: A Country Doctor\u2019s Legacy",
    type: "Presentation",
    desc: "Discover the remarkable life and practice of one of Tryon\u2019s most beloved physicians.",
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
    membersOnly: e.membersOnly || false,
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
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="font-body text-[11px] uppercase font-semibold"
                      style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
                    >
                      {event.type}
                    </div>
                    {event.membersOnly && (
                      <span
                        className="inline-flex items-center gap-1 font-body text-[9px] uppercase font-semibold px-2 py-0.5"
                        style={{
                          letterSpacing: "0.1em",
                          color: "#1B2A4A",
                          background: "rgba(27,42,74,0.08)",
                          borderRadius: "2px",
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Members Only
                      </span>
                    )}
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
