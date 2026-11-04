"use client";

import { useState } from "react";
import Link from "next/link";
import { Section, Eyebrow, DisplayHeadline, ButtonLink } from "@/components/brand";
import { JAMIE_LAVAL_EVENT } from "@/lib/events/jamieLaval";

const fallbackEvents = [
  {
    date: "Nov 12",
    title: JAMIE_LAVAL_EVENT.title,
    type: JAMIE_LAVAL_EVENT.eventType,
    desc: JAMIE_LAVAL_EVENT.description,
    href: `/events/${JAMIE_LAVAL_EVENT.slug}`,
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
      href: e.slug?.current ? `/events/${e.slug.current}` : null,
      membersOnly: e.membersOnly || false,
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
    <Section id="events" bg="cream">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <div>
          <Eyebrow>What&apos;s Happening</Eyebrow>
          <DisplayHeadline>Upcoming Events</DisplayHeadline>
        </div>
        <Link
          href="/events"
          className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline border-b border-brand-heritage pb-1 hover:text-brand-ink hover:border-brand-ink transition-colors"
        >
          View All Events &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {displayEvents.map((event) => {
          const cardContent = (
            <div className="flex h-full gap-5 border border-brand-ink/10 bg-brand-parchment p-5 transition-colors duration-200 hover:border-brand-heritage/40 md:gap-7 md:p-8">
              {/* Date block */}
              <div className="min-w-[56px] border-r border-brand-ink/10 py-2 pr-5 text-center md:min-w-[72px] md:pr-7">
                <div className="font-brand-display text-[30px] font-bold leading-none text-brand-heritage">
                  {event.day}
                </div>
                <div className="mt-1.5 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-ink/50">
                  {event.dateIsTBD ? "Fall 2026" : event.month}
                </div>
              </div>
              {/* Details */}
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-stone">
                    {event.type}
                  </span>
                  {event.membersOnly && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-brand-ink/5 px-2 py-0.5 font-brand-secondary text-[9px] font-semibold uppercase tracking-[0.1em] text-brand-ink">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Members Only
                    </span>
                  )}
                </div>
                <h3 className="m-0 mb-2 font-brand-display text-[22px] font-normal leading-[1.2] text-brand-ink">
                  {event.title}
                </h3>
                <p className="m-0 font-brand-body text-sm leading-[1.7] text-brand-ink/65">
                  {event.desc}
                </p>
              </div>
            </div>
          );

          return event.interestList ? (
            <button
              key={event.title}
              type="button"
              onClick={() => setModalOpen(true)}
              className="block h-full w-full cursor-pointer border-none bg-transparent p-0 text-left"
            >
              {cardContent}
            </button>
          ) : event.href ? (
            <Link key={event.title} href={event.href} className="block h-full no-underline">
              {cardContent}
            </Link>
          ) : (
            <div key={event.title}>{cardContent}</div>
          );
        })}
      </div>
    </Section>

    {modalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/70 p-5"
        onClick={() => setModalOpen(false)}
      >
        <div
          className="relative w-full max-w-[440px] bg-brand-cream p-8 md:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 cursor-pointer border-none bg-transparent font-brand-body text-lg text-brand-ink/40"
            aria-label="Close"
          >
            ✕
          </button>

          {interestStatus === "success" ? (
            <div className="text-center">
              <Eyebrow className="mb-3">You&apos;re on the list</Eyebrow>
              <h3 className="m-0 mb-3 font-brand-display text-2xl font-normal text-brand-ink">
                Thank you, {interestName}.
              </h3>
              <p className="m-0 font-brand-body text-sm leading-[1.7] text-brand-ink/65">
                We&apos;ll be in touch as soon as details for At Home in Tryon are confirmed. We look forward to having you.
              </p>
            </div>
          ) : (
            <>
              <Eyebrow className="mb-3">Interest List</Eyebrow>
              <h3 className="m-0 mb-2 font-brand-display text-2xl font-normal text-brand-ink">
                At Home in Tryon
              </h3>
              <p className="mb-6 font-brand-body text-sm leading-[1.7] text-brand-ink/65">
                Space is very limited. Add your name to be the first to know when details are confirmed.
              </p>
              <form onSubmit={handleInterestSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-ink">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={interestName}
                    onChange={(e) => setInterestName(e.target.value)}
                    className="w-full border border-brand-ink/15 bg-white px-4 py-3 font-brand-body text-sm text-brand-ink outline-none focus-visible:border-brand-heritage"
                    placeholder="First and last name"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-ink">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={interestEmail}
                    onChange={(e) => setInterestEmail(e.target.value)}
                    className="w-full border border-brand-ink/15 bg-white px-4 py-3 font-brand-body text-sm text-brand-ink outline-none focus-visible:border-brand-heritage"
                    placeholder="you@example.com"
                  />
                </div>
                {interestStatus === "error" && (
                  <p className="font-brand-body text-[13px] text-brand-heritage" role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}
                <ButtonLink
                  as="button"
                  type="submit"
                  variant="primary"
                  className="w-full cursor-pointer disabled:opacity-60"
                  disabled={interestStatus === "loading"}
                >
                  {interestStatus === "loading" ? "Submitting…" : "Add Me to the List"}
                </ButtonLink>
              </form>
            </>
          )}
        </div>
      </div>
    )}
  </>
  );
}
