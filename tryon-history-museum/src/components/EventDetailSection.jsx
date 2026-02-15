"use client";

import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";
import SanityImage from "./SanityImage";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isPastEvent(dateStr) {
  if (!dateStr) return false;
  const eventDate = new Date(dateStr + "T23:59:59");
  return eventDate < new Date();
}

export default function EventDetailSection({ event }) {
  const past = isPastEvent(event.date);

  return (
    <>
      {/* Header */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
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
            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
              style={{ color: GOLD_ACCENT }}
            >
              ← Back to Events
            </Link>
            {event.eventType && (
              <div
                className="font-body text-[11px] uppercase mb-4"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                {event.eventType}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              {event.title}
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Event image */}
      {(event.image?.asset || event.imageUrl) && (
        <section className="relative w-full max-h-[500px] overflow-hidden">
          {event.image?.asset ? (
            <SanityImage
              image={event.image}
              alt={event.title}
              sizes="100vw"
              priority
              className="w-full h-auto object-cover"
            />
          ) : (
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              sizes="100vw"
              priority
            />
          )}
        </section>
      )}

      {/* Details */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeIn>
            {/* Date / Time / Location info card */}
            <div
              className="p-6 md:p-8 mb-10"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Date
                  </div>
                  <div
                    className="font-display text-lg"
                    style={{ color: WARM_BLACK }}
                  >
                    {formatDate(event.date)}
                  </div>
                </div>

                {/* Time */}
                {event.time && (
                  <div>
                    <div
                      className="font-body text-[10px] uppercase mb-1"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Time
                    </div>
                    <div
                      className="font-display text-lg"
                      style={{ color: WARM_BLACK }}
                    >
                      {event.time}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Location
                  </div>
                  <div
                    className="font-display text-lg"
                    style={{ color: WARM_BLACK }}
                  >
                    {event.location || "Tryon History Museum"}
                  </div>
                </div>

                {/* Type */}
                {event.eventType && (
                  <div>
                    <div
                      className="font-body text-[10px] uppercase mb-1"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Event Type
                    </div>
                    <div
                      className="font-display text-lg"
                      style={{ color: WARM_BLACK }}
                    >
                      {event.eventType}
                    </div>
                  </div>
                )}
              </div>

              {past && (
                <div
                  className="mt-6 pt-4 font-body text-sm italic"
                  style={{
                    borderTop: "1px solid rgba(123,45,38,0.08)",
                    color: MUTED_RED,
                  }}
                >
                  This event has already taken place.
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h2
                  className="font-display text-2xl md:text-3xl font-semibold mb-6"
                  style={{ color: WARM_BLACK }}
                >
                  About This Event
                </h2>
                <p
                  className="font-body text-[16px] md:text-[17px] leading-[1.8] whitespace-pre-line"
                  style={{ color: "rgba(26,19,17,0.75)" }}
                >
                  {event.description}
                </p>
              </div>
            )}

            {/* CTA */}
            {!past && (
              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "14px 32px",
                  }}
                >
                  Contact Us for Details
                </Link>
                <Link
                  href="/events"
                  className="font-body text-[13px] font-semibold uppercase no-underline transition-all hover:bg-black/5"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    border: `1px solid rgba(26,19,17,0.2)`,
                    padding: "14px 32px",
                  }}
                >
                  All Events
                </Link>
              </div>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
