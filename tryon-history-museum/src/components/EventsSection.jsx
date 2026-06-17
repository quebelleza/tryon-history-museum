"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

const fallbackEvents = [
  {
    date: "Jul 23",
    title: "NC and the Revolutionary War",
    type: "Tales of Tryon",
    desc: "Join historian John Oliver for an evening exploration of North Carolina's pivotal role in the Revolutionary War — and the stories that connect Tryon's own landscape to the birth of a nation.",
    href: "/events/nc-revolutionary-war",
    membersOnly: false,
  },
  {
    date: "Sep 9",
    title: "Elettra",
    type: "Tales of Tryon",
    desc: "A fascinating evening dedicated to Elettra, one of Tryon's most intriguing public figures. Join us for an intimate look at a life that left its mark on this small mountain town.",
    href: null,
    membersOnly: false,
  },
  {
    date: "Nov 11",
    title: "Appalachian Music with Jamie Laval",
    type: "Tales of Tryon",
    desc: "Celtic artist Jamie Laval brings the sounds of Appalachia to life in an evening celebrating the musical heritage of our mountain region. A night of story, song, and history.",
    href: null,
    membersOnly: false,
  },
  {
    date: "Fall",
    title: "At Home in Tryon",
    type: "Historic Home Tour Series",
    desc: "An intimate evening in one of Tryon's most distinctive private homes — wine, appetizers, and conversation in a setting that tells its own story. Space is very limited.",
    href: null,
    membersOnly: false,
    interestList: true,
    dateIsTBD: true,
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
    month: e.dateIsTBD ? "" : e.date.split(" ")[0],
    day: e.dateIsTBD ? "TBD" : e.date.split(" ")[1],
    href: e.href || null,
    membersOnly: e.membersOnly || false,
    dateIsTBD: e.dateIsTBD || false,
    interestList: e.interestList || false,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [interestName, setInterestName] = useState("");
  const [interestEmail, setInterestEmail] = useState("");
  const [interestStatus, setInterestStatus] = useState("idle");

  async function handleInterestSubmit(e) {
    e.preventDefault();
    if (!interestName || !interestEmail) return;
    setInterestStatus("loading");
    try {
      const res = await fetch("/api/interest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: interestName,
          email: interestEmail,
          event: "At Home in Tryon",
        }),
      });
      if (res.ok) {
        setInterestStatus("success");
      } else {
        setInterestStatus("error");
      }
    } catch {
      setInterestStatus("error");
    }
  }

  const displayEvents = normalizeEvents(events);

  return (
    <>
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
                    {event.dateIsTBD ? "Fall 2026" : event.month}
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
                {event.interestList ? (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="block w-full text-left no-underline h-full bg-transparent border-none cursor-pointer p-0"
                  >
                    {cardContent}
                  </button>
                ) : event.href ? (
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

    {modalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        style={{ background: "rgba(26,19,17,0.7)" }}
        onClick={() => setModalOpen(false)}
      >
        <div
          className="w-full max-w-[440px] p-8 md:p-10 relative"
          style={{ background: "#FAF7F4" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 bg-transparent border-none cursor-pointer font-body text-lg"
            style={{ color: "rgba(26,19,17,0.4)" }}
            aria-label="Close"
          >
            ✕
          </button>

          {interestStatus === "success" ? (
            <div className="text-center">
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                You&apos;re on the list
              </div>
              <h3
                className="font-display text-2xl font-light mb-3"
                style={{ color: WARM_BLACK }}
              >
                Thank you, {interestName}.
              </h3>
              <p
                className="font-body text-[14px] leading-[1.7] m-0"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                We&apos;ll be in touch as soon as details for At Home in Tryon are confirmed. We look forward to having you.
              </p>
            </div>
          ) : (
            <>
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                Interest List
              </div>
              <h3
                className="font-display text-2xl font-light mb-2"
                style={{ color: WARM_BLACK }}
              >
                At Home in <span className="italic font-semibold">Tryon</span>
              </h3>
              <p
                className="font-body text-[14px] leading-[1.7] mb-6"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Space is very limited. Add your name to be the first to know when details are confirmed.
              </p>
              <form onSubmit={handleInterestSubmit} className="space-y-4">
                <div>
                  <label
                    className="block font-body text-[11px] uppercase mb-2"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={interestName}
                    onChange={(e) => setInterestName(e.target.value)}
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    placeholder="First and last name"
                  />
                </div>
                <div>
                  <label
                    className="block font-body text-[11px] uppercase mb-2"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={interestEmail}
                    onChange={(e) => setInterestEmail(e.target.value)}
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    placeholder="you@example.com"
                  />
                </div>
                {interestStatus === "error" && (
                  <p className="font-body text-[13px]" style={{ color: DEEP_RED }}>
                    Something went wrong. Please try again.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={interestStatus === "loading"}
                  className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ letterSpacing: "0.12em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "14px 36px", border: "none" }}
                >
                  {interestStatus === "loading" ? "Submitting\u2026" : "Add Me to the List"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    )}
  </>
  );
}
