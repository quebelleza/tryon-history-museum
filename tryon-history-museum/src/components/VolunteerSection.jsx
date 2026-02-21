"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const VOLUNTEER_AREAS = [
  { key: "docent", label: "Docent / Museum Volunteer", icon: "\uD83C\uDFDB\uFE0F", desc: "Share Tryon\u2019s story with visitors as a knowledgeable guide" },
  { key: "exhibits", label: "Exhibits & Archiving", icon: "\uD83D\uDDC2\uFE0F", desc: "Help preserve and catalog our growing collection" },
  { key: "coordination", label: "Volunteer Coordination / Scheduling", icon: "\uD83D\uDCCB", desc: "Help organize and schedule our volunteer community" },
  { key: "visitor_center", label: "Visitor Center / Gift Shop", icon: "\uD83D\uDECD\uFE0F", desc: "Welcome visitors and support the gift shop" },
  { key: "events", label: "Special Events", icon: "\uD83C\uDFAA", desc: "Lend your energy to tours, lectures, and community events" },
  { key: "other", label: "Not Sure / Something Else", icon: "\u2728", desc: "Tell us about yourself and we\u2019ll find the right fit" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  { key: "morning", label: "Morning", sub: "9am\u201312pm" },
  { key: "afternoon", label: "Afternoon", sub: "12pm\u20134pm" },
  { key: "evening", label: "Evening", sub: "4pm\u20137pm" },
];

const HOURS_OPTIONS = [
  "Less than 5 hours",
  "5\u201310 hours",
  "11\u201320 hours",
  "More than 20 hours",
];

const CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "text", label: "Text Message" },
];

const inputStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.12)",
  color: WARM_BLACK,
};

const labelClass = "block font-body text-[12px] uppercase mb-2 font-semibold";
const labelStyle = { letterSpacing: "0.15em", color: WARM_BLACK };

export default function VolunteerSection() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_contact: "",
    interest_reason: "",
    prior_experience: null,
    volunteer_areas: [],
    availability: {},
    hours_per_month: "",
    public_comfort_level: null,
  });
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleArea(key) {
    setForm((prev) => {
      const areas = prev.volunteer_areas.includes(key)
        ? prev.volunteer_areas.filter((a) => a !== key)
        : [...prev.volunteer_areas, key];
      return { ...prev, volunteer_areas: areas };
    });
  }

  function toggleAvailability(day, slot) {
    setForm((prev) => {
      const dayData = prev.availability[day] || {};
      const updated = { ...dayData, [slot]: !dayData[slot] };
      return { ...prev, availability: { ...prev.availability, [day]: updated } };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        alert(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Hero */}
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
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Get Involved
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Become a{" "}
              <span className="italic font-semibold">Volunteer</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[600px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Help us keep Tryon&apos;s story alive. The Tryon History Museum runs on
              the passion and dedication of volunteers like you. Whether you love
              sharing history with visitors, helping behind the scenes, or lending
              your talents to special events &mdash; there&apos;s a place for you here.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-3"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Volunteer Opportunities
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-10"
              style={{ color: WARM_BLACK }}
            >
              Ways to Get Involved
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VOLUNTEER_AREAS.map((area, i) => (
              <FadeIn key={area.key} delay={i * 0.06}>
                <div
                  className="p-6 md:p-7 h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  <div className="text-2xl mb-3">{area.icon}</div>
                  <div
                    className="font-display text-[17px] font-semibold mb-2"
                    style={{ color: WARM_BLACK }}
                  >
                    {area.label}
                  </div>
                  <p
                    className="font-body text-[14px] leading-[1.6] m-0"
                    style={{ color: "rgba(26,19,17,0.55)" }}
                  >
                    {area.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Interest Form */}
      <section className="py-16 md:py-24" style={{ background: "#F5F0EB" }}>
        <div className="max-w-[720px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-3"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Sign Up
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-light mb-3"
              style={{ color: WARM_BLACK }}
            >
              Volunteer Interest Form
            </h2>
            <p
              className="font-body text-[15px] leading-[1.7] mb-10"
              style={{ color: "rgba(26,19,17,0.55)" }}
            >
              Fill out the form below and we&apos;ll be in touch about next steps.
              All fields marked with * are required.
            </p>
          </FadeIn>

          {status === "success" ? (
            <FadeIn>
              <div
                className="p-10 text-center"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(45,106,79,0.15)",
                }}
              >
                <div className="mb-4">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full" style={{ background: "rgba(45,106,79,0.1)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                </div>
                <div
                  className="font-display text-2xl font-semibold mb-3"
                  style={{ color: WARM_BLACK }}
                >
                  Thank You!
                </div>
                <p
                  className="font-body text-[16px] leading-[1.7] m-0"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  Thank you for your interest in volunteering at the Tryon History
                  Museum! We&apos;ll be in touch soon.
                </p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.05}>
              <form onSubmit={handleSubmit} className="space-y-7" aria-label="Volunteer interest form">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="vol-name" className={labelClass} style={labelStyle}>Full Name *</label>
                    <input
                      id="vol-name" name="full_name" type="text" required
                      value={form.full_name} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-email" className={labelClass} style={labelStyle}>Email Address *</label>
                    <input
                      id="vol-email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="vol-phone" className={labelClass} style={labelStyle}>Phone Number *</label>
                  <input
                    id="vol-phone" name="phone" type="tel" required
                    value={form.phone} onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 max-w-[320px]"
                    style={inputStyle}
                    placeholder="(828) 555-1234"
                  />
                </div>

                {/* Preferred Contact */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>Best Way to Contact You?</legend>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {CONTACT_OPTIONS.map((opt) => {
                      const selected = form.preferred_contact === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, preferred_contact: opt.value }))}
                          className="font-body text-[13px] px-5 py-2.5 cursor-pointer transition-all duration-200"
                          style={{
                            background: selected ? "rgba(196,163,90,0.1)" : "#FFFDF9",
                            border: selected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                            color: selected ? GOLD_ACCENT : WARM_BLACK,
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Interest Reason */}
                <div>
                  <label htmlFor="vol-reason" className={labelClass} style={labelStyle}>
                    Why are you interested in volunteering?
                  </label>
                  <textarea
                    id="vol-reason" name="interest_reason"
                    rows={4}
                    value={form.interest_reason} onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 resize-y"
                    style={inputStyle}
                    placeholder="Tell us a bit about yourself and what draws you to the museum..."
                  />
                </div>

                {/* Prior Experience */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>
                    Prior volunteer experience with museums or as a docent?
                  </legend>
                  <div className="flex gap-3 mt-1">
                    {[true, false].map((val) => {
                      const selected = form.prior_experience === val;
                      return (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, prior_experience: val }))}
                          className="font-body text-[13px] px-6 py-2.5 cursor-pointer transition-all duration-200"
                          style={{
                            background: selected ? "rgba(196,163,90,0.1)" : "#FFFDF9",
                            border: selected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                            color: selected ? GOLD_ACCENT : WARM_BLACK,
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {val ? "Yes" : "No"}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Volunteer Areas */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>Volunteer Areas of Interest *</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    {VOLUNTEER_AREAS.map((area) => {
                      const checked = form.volunteer_areas.includes(area.key);
                      return (
                        <button
                          key={area.key}
                          type="button"
                          onClick={() => toggleArea(area.key)}
                          className="flex items-center gap-3 text-left px-4 py-3 cursor-pointer transition-all duration-200"
                          style={{
                            background: checked ? "rgba(196,163,90,0.08)" : "#FFFDF9",
                            border: checked ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                          }}
                        >
                          <span
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm text-[12px]"
                            style={{
                              background: checked ? GOLD_ACCENT : "transparent",
                              border: checked ? "none" : "1.5px solid rgba(26,19,17,0.25)",
                              color: checked ? WARM_BLACK : "transparent",
                            }}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="font-body text-[13px]" style={{ color: WARM_BLACK }}>
                            {area.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Availability Grid */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>General Availability</legend>
                  <p className="font-body text-[13px] mb-4 mt-0" style={{ color: "rgba(26,19,17,0.45)" }}>
                    Select the times you&apos;re generally available.
                  </p>

                  {/* Desktop grid */}
                  <div className="hidden sm:block">
                    <div
                      className="p-5"
                      style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                    >
                      {/* Header row */}
                      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "100px repeat(3, 1fr)" }}>
                        <div />
                        {TIME_SLOTS.map((slot) => (
                          <div key={slot.key} className="text-center">
                            <div className="font-body text-[11px] uppercase font-semibold" style={{ letterSpacing: "0.1em", color: MUTED_RED }}>{slot.label}</div>
                            <div className="font-body text-[10px]" style={{ color: "rgba(26,19,17,0.35)" }}>{slot.sub}</div>
                          </div>
                        ))}
                      </div>
                      {/* Day rows */}
                      {DAYS.map((day) => (
                        <div
                          key={day}
                          className="grid gap-2 py-1.5"
                          style={{
                            gridTemplateColumns: "100px repeat(3, 1fr)",
                            borderTop: "1px solid rgba(123,45,38,0.04)",
                          }}
                        >
                          <div className="font-body text-[13px] font-medium flex items-center" style={{ color: WARM_BLACK }}>
                            {day}
                          </div>
                          {TIME_SLOTS.map((slot) => {
                            const checked = form.availability[day]?.[slot.key];
                            return (
                              <button
                                key={slot.key}
                                type="button"
                                onClick={() => toggleAvailability(day, slot.key)}
                                className="h-9 cursor-pointer transition-all duration-200 flex items-center justify-center rounded-sm"
                                style={{
                                  background: checked ? "rgba(196,163,90,0.15)" : "rgba(26,19,17,0.02)",
                                  border: checked ? `1.5px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.06)",
                                }}
                              >
                                {checked && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile stacked */}
                  <div className="sm:hidden space-y-3">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="p-4"
                        style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                      >
                        <div className="font-body text-[13px] font-semibold mb-2" style={{ color: WARM_BLACK }}>{day}</div>
                        <div className="flex gap-2">
                          {TIME_SLOTS.map((slot) => {
                            const checked = form.availability[day]?.[slot.key];
                            return (
                              <button
                                key={slot.key}
                                type="button"
                                onClick={() => toggleAvailability(day, slot.key)}
                                className="flex-1 py-2 cursor-pointer transition-all duration-200 rounded-sm text-center"
                                style={{
                                  background: checked ? "rgba(196,163,90,0.15)" : "rgba(26,19,17,0.02)",
                                  border: checked ? `1.5px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.06)",
                                }}
                              >
                                <div className="font-body text-[10px] uppercase font-semibold" style={{ color: checked ? GOLD_ACCENT : "rgba(26,19,17,0.4)", letterSpacing: "0.05em" }}>{slot.label}</div>
                                <div className="font-body text-[9px]" style={{ color: "rgba(26,19,17,0.3)" }}>{slot.sub}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Hours Per Month */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>Hours Per Month Available</legend>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {HOURS_OPTIONS.map((opt) => {
                      const selected = form.hours_per_month === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, hours_per_month: opt }))}
                          className="font-body text-[13px] px-5 py-2.5 cursor-pointer transition-all duration-200"
                          style={{
                            background: selected ? "rgba(196,163,90,0.1)" : "#FFFDF9",
                            border: selected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                            color: selected ? GOLD_ACCENT : WARM_BLACK,
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Public Comfort Level */}
                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>Comfort Level Interacting with the Public</legend>
                  <div className="flex items-center justify-between mt-2 mb-1">
                    <span className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>Very Uncomfortable</span>
                    <span className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>Very Comfortable</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const selected = form.public_comfort_level === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, public_comfort_level: n }))}
                          className="flex-1 py-3 cursor-pointer transition-all duration-200 rounded-sm"
                          style={{
                            background: selected ? GOLD_ACCENT : "#FFFDF9",
                            border: selected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                            color: selected ? WARM_BLACK : "rgba(26,19,17,0.5)",
                            fontWeight: selected ? 700 : 500,
                            fontSize: "18px",
                            fontFamily: "inherit",
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Error */}
                {status === "error" && (
                  <p className="font-body text-sm" style={{ color: "#c53030" }}>
                    Something went wrong. Please try again or email us at{" "}
                    <a href="mailto:info@tryonhistorymuseum.org" style={{ color: DEEP_RED }}>info@tryonhistorymuseum.org</a>.
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full font-body text-[14px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-default"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "16px 36px",
                    border: "none",
                  }}
                >
                  {status === "sending" ? "Submitting\u2026" : "Submit Volunteer Interest Form"}
                </button>
              </form>
            </FadeIn>
          )}
        </div>
      </section>
    </>
  );
}
