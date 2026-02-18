"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { getMemberAccess } from "@/lib/supabase/memberAccess";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const architects = [
  {
    name: "Holland Brady",
    /* {PLACEHOLDER — replace with final bio} */
    bio: "Known for his integration of natural materials and site-responsive design across the Carolina foothills.",
  },
  {
    name: "Shannon Meriwether",
    /* {PLACEHOLDER — replace with final bio} */
    bio: "Celebrated for clean geometric forms that draw light and landscape into conversation.",
  },
  {
    name: "Ligon Flynn",
    /* {PLACEHOLDER — replace with final bio} */
    bio: "A beloved Asheville-based architect whose work bridges Appalachian vernacular and modernist discipline.",
  },
  {
    name: "Bill Moore",
    /* {PLACEHOLDER — replace with final bio} */
    bio: "Distinguished for residential work that honors both craft and restraint.",
  },
];

const pricingTiers = [
  {
    label: "Pre-Sale / Museum Members",
    price: "$100",
    note: null,
  },
  {
    label: "General Admission",
    price: "$125",
    note: "Non-members or after pre-sale closes",
  },
];

const tourHighlights = [
  { icon: "🏠", text: "6 stunning modernist homes, including Tryon Presbyterian Church featured for its modernist design" },
  { icon: "🎙️", text: "Expert docent guides at each home" },
  { icon: "🚌", text: "Hassle-free bus transportation between all stops" },
  { icon: "🍽️", text: "Catered lunch included" },
];

const logistics = [
  { label: "Date", value: "Saturday, May 16, 2026" },
  { label: "Tour Hours", value: "10:00 AM – approximately 4:00 PM · Tours run in intervals" },
  { label: "Check-in & Parking", value: "Tryon Presbyterian Church, Harmon Field Road" },
  { label: "Transportation", value: "Bus transportation provided from Tryon Presbyterian Church — no private vehicles at tour homes" },
  { label: "Lunch", value: "Catered lunch served at Tryon Presbyterian Church, included in ticket price" },
  { label: "Restrooms", value: "Available at Tryon Presbyterian Church" },
];

export default function ModernistHomeTourSection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isMember: false,
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [access, setAccess] = useState({ isLoggedIn: false, isActiveMember: false, member: null });

  useEffect(() => {
    getMemberAccess().then((a) => {
      setAccess(a);
      if (a.member) {
        setForm((prev) => ({
          ...prev,
          firstName: a.member.first_name || prev.firstName,
          lastName: a.member.last_name || prev.lastName,
          email: a.member.email || prev.email,
          isMember: true,
        }));
      }
    });
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/interest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event: "modernist-home-tour" }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Hero image */}
        <div className="relative w-full aspect-[16/7] md:aspect-[21/9] min-h-[420px]">
          <Image
            src="/images/events/modernist-home-tour-hero.webp"
            alt="Watercolor illustration of a modernist home with the Blue Ridge mountains"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(26,19,17,0.25) 0%, rgba(26,19,17,0.7) 70%, ${WARM_BLACK} 100%)`,
            }}
          />
        </div>

        {/* Hero text overlay */}
        <div
          className="relative -mt-48 md:-mt-64 pb-16 md:pb-24 z-10"
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <FadeIn>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
                style={{ color: GOLD_ACCENT }}
              >
                ← Back to Events
              </Link>
              <div
                className="font-body text-[11px] uppercase mb-4"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                Home Tour
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold uppercase text-white leading-[1.05] mb-3 tracking-wide">
                Modernist Home Tour
              </h1>
              <p
                className="font-display text-lg md:text-xl italic mb-6"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                A Celebration of Architectural Innovation in Tryon
              </p>
              <div
                className="font-body text-[13px] uppercase mb-2"
                style={{ letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}
              >
                Saturday, May 16, 2026 · Tryon, North Carolina
              </div>
              <div
                className="font-body text-[12px]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Presented by the Tryon History Museum &amp; Visitors Center
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Introduction ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              About the Tour
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-8"
              style={{ color: WARM_BLACK }}
            >
              Experience Tryon&apos;s Architectural Legacy
            </h2>
            <p
              className="font-body text-[16px] md:text-[17px] leading-[1.85] m-0"
              style={{ color: "rgba(26,19,17,0.7)" }}
            >
              Step inside stunning Modernist Architecture — both historic gems
              and brand-new builds inspired by this iconic style. Tryon is known
              for its equestrian heritage and Blue Ridge character — but tucked
              into its hillsides and tree lines is another story entirely. On
              May 16th, the Tryon History Museum invites you behind the doors of
              privately owned homes designed by some of Western North
              Carolina&apos;s most celebrated modernist architects. This is a rare
              glimpse into a quietly extraordinary architectural legacy.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Tour Highlights ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1000px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              What&apos;s Included
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-14"
              style={{ color: WARM_BLACK }}
            >
              Tour Highlights
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tourHighlights.map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div
                  className="p-6 md:p-7 h-full flex items-start gap-4"
                  style={{
                    background: "#FAF7F4",
                    border: "1px solid rgba(123,45,38,0.06)",
                  }}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <p
                    className="font-body text-[15px] leading-[1.65] m-0"
                    style={{ color: "rgba(26,19,17,0.65)" }}
                  >
                    {item.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What to Expect ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Event Day Details
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-12"
              style={{ color: WARM_BLACK }}
            >
              What to Expect
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div
              className="p-7 md:p-10"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                {logistics.map((item, i) => (
                  <div key={i}>
                    <div
                      className="font-body text-[10px] uppercase mb-1.5"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="font-body text-[15px] leading-[1.6]"
                      style={{ color: WARM_BLACK }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── The Architects ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1000px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Featured Homes By
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-14"
              style={{ color: WARM_BLACK }}
            >
              The Architects
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {architects.map((arch, i) => (
              <FadeIn key={arch.name} delay={i * 0.08}>
                <div
                  className="p-7 md:p-9 h-full"
                  style={{
                    background: "#FAF7F4",
                    border: "1px solid rgba(123,45,38,0.06)",
                  }}
                >
                  <h3
                    className="font-display text-xl md:text-[22px] font-semibold mb-3"
                    style={{ color: WARM_BLACK }}
                  >
                    {arch.name}
                  </h3>
                  {/* {PLACEHOLDER — replace with final bio} */}
                  <p
                    className="font-body text-[15px] leading-[1.7] m-0"
                    style={{ color: "rgba(26,19,17,0.6)" }}
                  >
                    {arch.bio}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tickets ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Pricing
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-10"
              style={{ color: WARM_BLACK }}
            >
              Tickets
            </h2>
          </FadeIn>

          <div className="flex flex-col sm:flex-row gap-5 mb-8">
            {pricingTiers.map((tier, i) => {
              const isPreSale = i === 0;
              const locked = isPreSale && !access.isActiveMember;
              return (
                <FadeIn key={tier.label} delay={i * 0.1} className="flex-1">
                  <div
                    className="p-7 md:p-9 text-center h-full flex flex-col justify-center relative"
                    style={{
                      background: locked ? "#F5F3F0" : "#FFFDF9",
                      border: locked ? "1px solid rgba(27,42,74,0.08)" : "1px solid rgba(123,45,38,0.08)",
                      opacity: locked ? 0.7 : 1,
                    }}
                  >
                    {locked && (
                      <div className="flex justify-center mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                    )}
                    <div
                      className="font-display text-4xl font-semibold mb-2"
                      style={{ color: locked ? "rgba(26,19,17,0.35)" : DEEP_RED }}
                    >
                      {tier.price}
                    </div>
                    <div
                      className="font-body text-[13px] font-semibold uppercase"
                      style={{ letterSpacing: "0.1em", color: locked ? "rgba(26,19,17,0.4)" : WARM_BLACK }}
                    >
                      {tier.label}
                    </div>
                    {tier.note && (
                      <div
                        className="font-body text-[12px] mt-2"
                        style={{ color: "rgba(26,19,17,0.45)" }}
                      >
                        {tier.note}
                      </div>
                    )}
                    {locked && (
                      <div
                        className="font-body text-[11px] mt-3"
                        style={{ color: "#1B2A4A" }}
                      >
                        <Link href="/login" className="no-underline hover:underline" style={{ color: "#1B2A4A", fontWeight: 600 }}>Log in</Link>{" "}
                        or{" "}
                        <Link href="/membership" className="no-underline hover:underline" style={{ color: "#1B2A4A", fontWeight: 600 }}>become a member</Link>{" "}
                        for pre-sale pricing
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {access.isActiveMember && (
            <FadeIn delay={0.12}>
              <div
                className="p-4 mb-6 text-center"
                style={{
                  background: "rgba(45,106,79,0.06)",
                  border: "1px solid rgba(45,106,79,0.12)",
                }}
              >
                <p className="font-body text-[14px] m-0" style={{ color: "#2D6A4F" }}>
                  ✦ You&apos;re eligible for pre-sale pricing as a Museum Member.
                </p>
              </div>
            </FadeIn>
          )}

          {/* Ticket details callout */}
          <FadeIn delay={0.15}>
            <div
              className="p-6 md:p-8 mb-8"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5" style={{ color: GOLD_ACCENT }}>✦</span>
                  <span className="font-body text-[14px] leading-[1.6]" style={{ color: "rgba(26,19,17,0.65)" }}>
                    Each ticket includes expert docent guides, bus transportation, and a catered lunch
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5" style={{ color: GOLD_ACCENT }}>✦</span>
                  <span className="font-body text-[14px] leading-[1.6]" style={{ color: "rgba(26,19,17,0.65)" }}>
                    Capacity: 300 tickets — limited availability
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5" style={{ color: GOLD_ACCENT }}>✦</span>
                  <span className="font-body text-[14px] leading-[1.6]" style={{ color: "rgba(26,19,17,0.65)" }}>
                    Advance registration required
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5" style={{ color: GOLD_ACCENT }}>✦</span>
                  <span className="font-body text-[14px] leading-[1.6]" style={{ color: "rgba(26,19,17,0.65)" }}>
                    Available online at tryonhistorymuseum.org and in person at the Museum (Wednesday–Saturday)
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="font-body text-[15px] leading-[1.7] text-center italic"
              style={{ color: "rgba(26,19,17,0.55)" }}
            >
              Tickets are not yet on sale. Join the interest list below to be
              notified first and secure pre-sale pricing.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Presenting Partners ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Community Support
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-6"
              style={{ color: WARM_BLACK }}
            >
              Presenting Partners
            </h2>
            <p
              className="font-body text-[16px] leading-[1.8] max-w-[580px] mx-auto mb-8"
              style={{ color: "rgba(26,19,17,0.65)" }}
            >
              The Modernist Home Tour is made possible through the generous
              support of our community partners. Presenting and supporting
              sponsorship opportunities are available — we&apos;d love to have you
              involved in this landmark event.
            </p>
            <Link
              href="/events/modernist-home-tour/sponsorship"
              className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110 mb-6"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "14px 36px",
              }}
            >
              Inquire About Sponsorship
            </Link>
            <p
              className="font-body text-[13px] italic"
              style={{ color: "rgba(26,19,17,0.4)" }}
            >
              Proceeds benefit the Tryon History Museum, a 501(c)(3) nonprofit
              organization.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Interest List ─── */}
      <section
        id="interest-list"
        className="py-20 md:py-28"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[600px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4 text-center"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Don&apos;t Miss Out
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light text-center mb-4"
              style={{ color: WARM_BLACK }}
            >
              Be the First to Know
            </h2>
            <p
              className="font-body text-[15px] leading-[1.7] text-center mb-10"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              Tickets go on sale soon. Join the interest list to hear first —
              and to secure your spot at pre-sale pricing before tickets open to
              the public.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            {/* {TODO: connect to email service} */}
            {status === "success" ? (
              <div
                className="p-10 text-center"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.08)",
                }}
              >
                <div
                  className="font-display text-2xl font-semibold mb-3"
                  style={{ color: WARM_BLACK }}
                >
                  You&apos;re on the list.
                </div>
                <p
                  className="font-body text-[15px] m-0"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  We&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                aria-label="Interest list sign-up"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="il-first"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      First Name
                    </label>
                    <input
                      id="il-first"
                      name="firstName"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="il-last"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Last Name
                    </label>
                    <input
                      id="il-last"
                      name="lastName"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="il-email"
                    className="block font-body text-[12px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Email Address
                  </label>
                  <input
                    id="il-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.12)",
                      color: WARM_BLACK,
                    }}
                    placeholder="you@example.com"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMember"
                    checked={form.isMember}
                    onChange={handleChange}
                    className="mt-1 accent-[#7B2D26]"
                  />
                  <span
                    className="font-body text-[14px] leading-snug"
                    style={{ color: "rgba(26,19,17,0.65)" }}
                  >
                    I am a current Museum Member
                  </span>
                </label>

                {status === "error" && (
                  <p
                    className="font-body text-sm"
                    style={{ color: "#c53030" }}
                  >
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "16px 36px",
                    border: "none",
                  }}
                >
                  {status === "sending"
                    ? "Submitting…"
                    : "Join the Interest List"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ─── Contact & Back Nav ─── */}
      <section className="py-14" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[14px] mb-6"
              style={{ color: "rgba(26,19,17,0.5)" }}
            >
              Questions? Call{" "}
              <a
                href="tel:8284401116"
                className="no-underline hover:underline"
                style={{ color: DEEP_RED }}
              >
                (828) 440-1116
              </a>{" "}
              ·{" "}
              <a
                href="mailto:info@tryonhistorymuseum.org"
                className="no-underline hover:underline"
                style={{ color: DEEP_RED }}
              >
                info@tryonhistorymuseum.org
              </a>{" "}
              · 26 Maple Street, Tryon, NC 28782
            </p>
            <Link
              href="/events"
              className="font-body text-[13px] uppercase no-underline transition-colors hover:opacity-70"
              style={{ letterSpacing: "0.12em", color: MUTED_RED }}
            >
              ← Back to All Events
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
