"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const NAVY = "#1B2A4A";
const CREAM = "#FAF7F4";

const tiers = [
  {
    name: "Presenting Sponsor",
    price: "$2,500",
    exclusive: true,
    subtitle: "Exclusive — Only One Available · Lunch Sponsor",
    benefits: [
      "Business banner with name and logo displayed in the luncheon area",
      "Business name and logo on the Sponsor Sign at the check-in table",
      "Business logo on the Tryon History Museum website for 6 months",
      "Business logo on the Museum Facebook page for 6 months",
      "Company mentioned by name in all press releases as Presenting Sponsor",
      "Company logo in the commemorative brochure given to all ticketholders",
      "Business name listed on the Sponsor page of the brochure",
      "Promotional materials included in the Ticketholder Welcome Bag",
      "4 complimentary event tickets",
    ],
  },
  {
    name: "Architecture Sponsor",
    price: "$1,500",
    exclusive: false,
    subtitle: null,
    benefits: [
      "Business name and logo on the Sponsor Sign at the check-in table",
      "Business logo on the Tryon History Museum website for 6 months",
      "Business logo on the Museum Facebook page for 6 months",
      "Company mentioned by name in all press releases as Architecture Sponsor",
      "Company logo in the commemorative brochure given to all ticketholders",
      "Business name listed on the Sponsor page of the brochure",
      "Promotional materials included in the Ticketholder Welcome Bag",
      "2 complimentary event tickets",
    ],
  },
  {
    name: "Heritage Sponsor",
    price: "$1,000",
    exclusive: false,
    subtitle: null,
    benefits: [
      "Business name and logo on the Sponsor Sign at the check-in table",
      "Business logo on the Tryon History Museum website for 3 months",
      "Business logo on the Museum Facebook page for 3 months",
      "Business name listed on the Sponsor page of the brochure",
      "Promotional materials included in the Ticketholder Welcome Bag",
    ],
  },
  {
    name: "Community Sponsor",
    price: "$750",
    exclusive: false,
    subtitle: null,
    benefits: [
      "Business name and logo on the Sponsor Sign at the check-in table",
      "Business logo on the Tryon History Museum website for 3 months",
      "Business logo on the Museum Facebook page for 3 months",
      "Business name listed on the Sponsor page of the brochure",
    ],
  },
];

const levelOptions = [
  { value: "", label: "Select a sponsorship level" },
  { value: "Presenting Sponsor — $2,500", label: "Presenting Sponsor — $2,500" },
  { value: "Architecture Sponsor — $1,500", label: "Architecture Sponsor — $1,500" },
  { value: "Heritage Sponsor — $1,000", label: "Heritage Sponsor — $1,000" },
  { value: "Community Sponsor — $750", label: "Community Sponsor — $750" },
  { value: "General Donation", label: "General Donation" },
];

export default function SponsorshipSection() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    level: "",
    donationAmount: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/sponsorship-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, #2A3D66 50%, ${NAVY} 100%)`,
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
              href="/events/modernist-home-tour"
              className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
              style={{ color: GOLD_ACCENT }}
            >
              ← Back to Modernist Home Tour
            </Link>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Sponsorship Prospectus
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-4">
              Become a <span className="italic font-semibold">Sponsor</span>
            </h1>
            <div
              className="font-body text-[13px] uppercase mb-8"
              style={{ letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)" }}
            >
              Modernist Home Tour · Saturday, May 16, 2026
            </div>
            <p
              className="font-body text-[17px] md:text-[18px] leading-[1.8] max-w-[660px] m-0 mb-10"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              The Tryon History Museum&apos;s inaugural Modernist Home Tour is a
              landmark cultural event — and a rare opportunity to align your
              business with Tryon&apos;s architectural legacy. Sponsorship places
              your name alongside an event that will be talked about long after
              the doors close. We invite a select group of community partners to
              make it possible.
            </p>
            <a
              href="#sponsorship-levels"
              className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "14px 32px",
              }}
            >
              View Sponsorship Levels ↓
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ─── Value Proposition Banner ─── */}
      <section
        className="py-10 md:py-12"
        style={{ background: NAVY }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <h2
              className="font-display text-xl md:text-2xl font-light m-0"
              style={{ color: GOLD_ACCENT }}
            >
              Support Tryon&apos;s architectural legacy while gaining{" "}
              <span className="italic font-semibold">6 months</span> of
              community visibility
            </h2>
          </FadeIn>
        </div>
      </section>

      {/* ─── Sponsorship Tiers ─── */}
      <section
        id="sponsorship-levels"
        className="py-20 md:py-28 scroll-mt-24"
        style={{ background: CREAM }}
      >
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Investment Levels
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-14"
              style={{ color: WARM_BLACK }}
            >
              Sponsorship Levels
            </h2>
          </FadeIn>

          <div className="space-y-6">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.08}>
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: tier.exclusive ? NAVY : "#FFFDF9",
                    border: tier.exclusive
                      ? "none"
                      : "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  {/* Exclusive badge */}
                  {tier.exclusive && (
                    <div
                      className="absolute top-0 right-0 font-body text-[10px] uppercase font-semibold px-4 py-2"
                      style={{
                        letterSpacing: "0.15em",
                        background: GOLD_ACCENT,
                        color: WARM_BLACK,
                      }}
                    >
                      Only One Available
                    </div>
                  )}

                  <div className="p-7 md:p-10">
                    {/* Tier header */}
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h3
                        className="font-display text-2xl md:text-3xl font-semibold m-0"
                        style={{ color: tier.exclusive ? "#FFFFFF" : WARM_BLACK }}
                      >
                        {tier.name}
                      </h3>
                      <span
                        className="font-display text-2xl md:text-3xl font-semibold"
                        style={{ color: tier.exclusive ? GOLD_ACCENT : DEEP_RED }}
                      >
                        {tier.price}
                      </span>
                    </div>

                    {tier.subtitle && (
                      <p
                        className="font-body text-[13px] italic mb-6 m-0"
                        style={{
                          color: tier.exclusive
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(26,19,17,0.5)",
                        }}
                      >
                        {tier.subtitle}
                      </p>
                    )}

                    {!tier.subtitle && <div className="mb-6" />}

                    {/* Benefits grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {tier.benefits.map((benefit, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <span
                            className="text-sm mt-0.5 flex-shrink-0"
                            style={{
                              color: tier.exclusive ? GOLD_ACCENT : GOLD_ACCENT,
                            }}
                          >
                            ✦
                          </span>
                          <span
                            className="font-body text-[14px] leading-[1.6]"
                            style={{
                              color: tier.exclusive
                                ? "rgba(255,255,255,0.75)"
                                : "rgba(26,19,17,0.65)",
                            }}
                          >
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Deadline & Submission ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Important Dates
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-8"
              style={{ color: WARM_BLACK }}
            >
              Deadline &amp; Submission
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div
              className="p-8 md:p-10 mb-8"
              style={{
                background: NAVY,
              }}
            >
              <p
                className="font-display text-xl md:text-2xl font-semibold mb-4 m-0"
                style={{ color: GOLD_ACCENT }}
              >
                Sponsorship commitments must be received by March 30, 2026.
              </p>
              <p
                className="font-body text-[15px] leading-[1.7] m-0"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Please submit your check to a Museum representative or mail to:
                <br />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  The Tryon History Museum, 26 Maple Street, Tryon, NC 28782
                </span>
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p
              className="font-body text-[15px] leading-[1.7] mb-6"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              Unable to sponsor at this time? We gratefully accept donations of
              any amount in support of this event.
            </p>
            <Link
              href="/donate"
              className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "14px 32px",
              }}
            >
              Make a Donation
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── Sponsorship Inquiry Form ─── */}
      <section
        id="inquiry-form"
        className="py-20 md:py-28"
        style={{ background: CREAM }}
      >
        <div className="max-w-[640px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4 text-center"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Get Involved
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light text-center mb-4"
              style={{ color: WARM_BLACK }}
            >
              Ready to Partner With Us?
            </h2>
            <p
              className="font-body text-[15px] leading-[1.7] text-center mb-10"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              We&apos;d love to have you involved. Complete the form below and a
              member of our team will be in touch promptly.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            {/* {TODO: connect form to email backend} */}
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
                  Thank you.
                </div>
                <p
                  className="font-body text-[15px] m-0"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                aria-label="Sponsorship inquiry"
              >
                {/* Company Name */}
                <div>
                  <label
                    htmlFor="sp-company"
                    className="block font-body text-[12px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Company Name
                  </label>
                  <input
                    id="sp-company"
                    name="companyName"
                    type="text"
                    required
                    value={form.companyName}
                    onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.12)",
                      color: WARM_BLACK,
                    }}
                    placeholder="Your business or organization"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label
                    htmlFor="sp-contact"
                    className="block font-body text-[12px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Contact Person
                  </label>
                  <input
                    id="sp-contact"
                    name="contactPerson"
                    type="text"
                    required
                    value={form.contactPerson}
                    onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.12)",
                      color: WARM_BLACK,
                    }}
                    placeholder="Full name"
                  />
                </div>

                {/* Phone & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="sp-phone"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Best Phone Number
                    </label>
                    <input
                      id="sp-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sp-email"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Email Address
                    </label>
                    <input
                      id="sp-email"
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
                </div>

                {/* Sponsorship Level */}
                <div>
                  <label
                    htmlFor="sp-level"
                    className="block font-body text-[12px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Sponsorship Level
                  </label>
                  <select
                    id="sp-level"
                    name="level"
                    required
                    value={form.level}
                    onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 appearance-none cursor-pointer"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.12)",
                      color: form.level ? WARM_BLACK : "rgba(26,19,17,0.4)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A8584F' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      paddingRight: "40px",
                    }}
                  >
                    {levelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={!opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Donation Amount — conditional */}
                {form.level === "General Donation" && (
                  <div>
                    <label
                      htmlFor="sp-donation"
                      className="block font-body text-[12px] uppercase mb-2 font-semibold"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Donation Amount
                    </label>
                    <input
                      id="sp-donation"
                      name="donationAmount"
                      type="text"
                      value={form.donationAmount}
                      onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={{
                        background: "#FFFDF9",
                        border: "1px solid rgba(123,45,38,0.12)",
                        color: WARM_BLACK,
                      }}
                      placeholder="$"
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label
                    htmlFor="sp-message"
                    className="block font-body text-[12px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Message <span style={{ color: "rgba(26,19,17,0.35)", fontWeight: 400, textTransform: "none" }}>(optional)</span>
                  </label>
                  <textarea
                    id="sp-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 resize-y"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.12)",
                      color: WARM_BLACK,
                    }}
                    placeholder="Anything you'd like us to know?"
                  />
                </div>

                {status === "error" && (
                  <p
                    className="font-body text-sm"
                    style={{ color: "#c53030" }}
                  >
                    Something went wrong. Please try again or contact us directly.
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
                    : "Submit Sponsorship Inquiry"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer Navigation ─── */}
      <section className="py-14" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <Link
              href="/events/modernist-home-tour"
              className="font-body text-[13px] uppercase no-underline transition-colors hover:opacity-70 mb-6 inline-block"
              style={{ letterSpacing: "0.12em", color: MUTED_RED }}
            >
              ← Back to Modernist Home Tour
            </Link>
            <p
              className="font-body text-[14px] mb-4"
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
              </a>
            </p>
            <p
              className="font-body text-[13px] italic m-0"
              style={{ color: "rgba(26,19,17,0.4)" }}
            >
              Proceeds benefit the Tryon History Museum, a 501(c)(3) nonprofit
              organization.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
