"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return { month: "", day: "", year: "", full: "" };
  const date = new Date(dateStr + "T12:00:00");
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate().toString(),
    year: date.getFullYear().toString(),
    full: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function EventCard({ event, isPast }) {
  const { month, day, full } = formatDate(event.date);

  return (
    <div
      className={`flex gap-7 p-9 transition-all duration-300 ${isPast ? "opacity-50" : "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"}`}
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(123,45,38,0.08)",
      }}
    >
      {/* Date block */}
      <div
        className="min-w-[72px] text-center py-4 pr-7 flex-shrink-0"
        style={{ borderRight: "1px solid rgba(123,45,38,0.1)" }}
      >
        <div
          className="font-display text-[28px] font-bold leading-none"
          style={{ color: DEEP_RED }}
        >
          {day}
        </div>
        <div
          className="font-body text-[11px] uppercase mt-1"
          style={{ letterSpacing: "0.15em", color: MUTED_RED }}
        >
          {month}
        </div>
      </div>
      {/* Details */}
      <div className="flex-1">
        <div
          className="font-body text-[11px] uppercase mb-2 font-semibold"
          style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
        >
          {event.eventType || "Event"}
        </div>
        <h3 className="font-display text-[22px] font-semibold text-tryon-black mb-2">
          {event.title}
        </h3>
        {event.time && (
          <p
            className="font-body text-[13px] mb-2 m-0"
            style={{ color: DEEP_RED }}
          >
            {event.time}
            {event.location && ` · ${event.location}`}
          </p>
        )}
        {event.description && (
          <p
            className="font-body text-sm leading-relaxed m-0"
            style={{ color: "rgba(26,19,17,0.6)" }}
          >
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function EventsPageSection({ events }) {
  const today = new Date().toISOString().split("T")[0];

  const upcoming = (events || []).filter((e) => e.date >= today);
  const past = (events || []).filter((e) => e.date < today).reverse();

  const hasNoEvents = upcoming.length === 0 && past.length === 0;

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
        <div className="max-w-[1200px] mx-auto px-8 relative z-10">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              What&apos;s Happening
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Events &{" "}
              <span className="italic font-semibold">Programs</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              From our popular Tales of Tryon lecture series to walking tours,
              special exhibits, and community gatherings — there&apos;s always a
              reason to visit the museum.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-tryon-cream py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-10"
              style={{ letterSpacing: "0.25em", color: DEEP_RED }}
            >
              Upcoming Events
            </div>
          </FadeIn>

          {hasNoEvents && (
            <FadeIn>
              <div
                className="text-center py-16 px-8"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.08)",
                }}
              >
                <p
                  className="font-display text-2xl font-light mb-4"
                  style={{ color: WARM_BLACK }}
                >
                  More events coming soon
                </p>
                <p
                  className="font-body text-[15px] m-0"
                  style={{ color: "rgba(26,19,17,0.5)" }}
                >
                  Follow us on{" "}
                  <a
                    href="https://www.facebook.com/tryonhistorymuseum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: DEEP_RED }}
                  >
                    Facebook
                  </a>{" "}
                  for the latest updates.
                </p>
              </div>
            </FadeIn>
          )}

          {upcoming.length > 0 && (
            <div className="flex flex-col gap-6">
              {upcoming.map((event, i) => (
                <FadeIn key={event._id || event.title} delay={i * 0.08}>
                  <EventCard event={event} isPast={false} />
                </FadeIn>
              ))}
            </div>
          )}

          {upcoming.length === 0 && past.length > 0 && (
            <FadeIn>
              <div
                className="text-center py-12 px-8"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.08)",
                }}
              >
                <p
                  className="font-body text-[15px] m-0"
                  style={{ color: "rgba(26,19,17,0.5)" }}
                >
                  No upcoming events scheduled. Check back soon or follow us on{" "}
                  <a
                    href="https://www.facebook.com/tryonhistorymuseum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: DEEP_RED }}
                  >
                    Facebook
                  </a>
                  .
                </p>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section className="py-16 md:py-20" style={{ background: "#F5F0EB" }}>
          <div className="max-w-[900px] mx-auto px-8">
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-10"
                style={{ letterSpacing: "0.25em", color: MUTED_RED }}
              >
                Past Events
              </div>
            </FadeIn>
            <div className="flex flex-col gap-6">
              {past.map((event, i) => (
                <FadeIn key={event._id || event.title} delay={i * 0.05}>
                  <EventCard event={event} isPast={true} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
