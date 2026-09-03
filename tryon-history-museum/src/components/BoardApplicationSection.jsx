"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_CRIMSON = "#8B1A1A";
const CREAM = "#FAF8F5";

const inputStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.12)",
  color: WARM_BLACK,
};

const labelClass = "block font-body text-[12px] uppercase mb-2 font-semibold";
const labelStyle = { letterSpacing: "0.15em", color: WARM_BLACK };

const QUESTIONS = [
  {
    name: "service_reason",
    label: "Why do you want to serve on the Museum Board?",
    required: true,
  },
  {
    name: "skills",
    label: "What are your best skills which might be put to use in advancing this organization?",
    required: true,
  },
  {
    name: "priorities",
    label: "In your opinion, what should be the top three priorities for the museum at this time?",
    required: true,
  },
  {
    name: "obstacles",
    label: "In your opinion, what are the top three obstacles to the museum's success?",
    required: true,
  },
  {
    name: "three_year_vision",
    label: "As you think of the museum three years from now, what do you see? What three wishes do you have for the museum?",
    required: true,
  },
  {
    name: "suggested_candidates",
    label: "Think of people in the community who love Tryon and her history and could bring needed skills to our board. Suggest three of these people.",
    required: false,
  },
];

const COMMITMENT_OPTIONS = [
  {
    value: "active_role",
    label: "Yes — I'm ready to commit to an active role.",
  },
  {
    value: "specific_projects",
    label: "I'm interested, but would prefer to start by helping on specific projects.",
  },
];

const initialForm = {
  full_name: "",
  mailing_address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  age_confirmed: false,
  service_reason: "",
  skills: "",
  priorities: "",
  obstacles: "",
  three_year_vision: "",
  suggested_candidates: "",
  commitment: "",
};

export default function BoardApplicationSection() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/board-application", {
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
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, ${DEEP_CRIMSON} 55%, ${DEEP_RED} 100%)`,
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
            <h1
              className="font-display text-4xl md:text-6xl font-light leading-[1.1] mb-0"
              style={{ color: CREAM }}
            >
              Board of Directors
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ background: "#F5F0EB" }}>
        <div className="max-w-[720px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div className="space-y-5 mb-14">
              <p className="font-body text-[16px] leading-[1.8] m-0" style={{ color: "rgba(26,19,17,0.68)" }}>
                Tryon is a town of about 1,600 people with more history than towns fifty times its size. Keeping it — and telling it well — takes a working board.
              </p>
              <p className="font-body text-[16px] leading-[1.8] m-0" style={{ color: "rgba(26,19,17,0.68)" }}>
                Our board members don&apos;t sit and approve things. They plan exhibits, chase grants, greet visitors, staff events, and argue productively about what the museum should become. The museum is also Tryon&apos;s official Visitor Center, so the work shapes what people see of this town first.
              </p>
              <p className="font-body text-[16px] leading-[1.8] m-0" style={{ color: "rgba(26,19,17,0.68)" }}>
                If you&apos;d like a hand in that, tell us about yourself below. This is the start of a conversation, not an application for immediate appointment. We read every response and follow up personally.
              </p>
            </div>
            <div
              className="font-body text-[11px] uppercase mb-3"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Tell Us About Yourself
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-3" style={{ color: WARM_BLACK }}>
              Board Interest Form
            </h2>
            <p className="font-body text-[15px] leading-[1.7] mb-10" style={{ color: "rgba(26,19,17,0.55)" }}>
              Fill out the form below and we&apos;ll be in touch about next steps. All fields marked with * are required.
            </p>
          </FadeIn>

          {status === "success" ? (
            <FadeIn>
              <div
                className="p-10 text-center"
                style={{ background: "#FFFDF9", border: "1px solid rgba(45,106,79,0.15)" }}
              >
                <div className="mb-4">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full" style={{ background: "rgba(45,106,79,0.1)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                </div>
                <div className="font-display text-2xl font-semibold mb-3" style={{ color: WARM_BLACK }}>
                  Thank You!
                </div>
                <p className="font-body text-[16px] leading-[1.7] m-0" style={{ color: "rgba(26,19,17,0.6)" }}>
                  Thank you for your interest in serving on the Tryon History Museum Board. We&apos;ll review your response and follow up personally.
                </p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.05}>
              <form onSubmit={handleSubmit} className="space-y-7" aria-label="Board of Directors interest form">
                <div>
                  <label htmlFor="board-name" className={labelClass} style={labelStyle}>Full Name *</label>
                  <input
                    id="board-name" name="full_name" type="text" required
                    value={form.full_name} onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                    style={inputStyle}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="board-address" className={labelClass} style={labelStyle}>Mailing Address *</label>
                  <input
                    id="board-address" name="mailing_address" type="text" required
                    value={form.mailing_address} onChange={handleChange}
                    className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                    style={inputStyle}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_120px] gap-5">
                  <div>
                    <label htmlFor="board-city" className={labelClass} style={labelStyle}>City *</label>
                    <input
                      id="board-city" name="city" type="text" required
                      value={form.city} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="board-state" className={labelClass} style={labelStyle}>State *</label>
                    <input
                      id="board-state" name="state" type="text" required maxLength={2}
                      value={form.state} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                      placeholder="NC"
                    />
                  </div>
                  <div>
                    <label htmlFor="board-zip" className={labelClass} style={labelStyle}>Zip *</label>
                    <input
                      id="board-zip" name="zip" type="text" required inputMode="numeric"
                      value={form.zip} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="board-phone" className={labelClass} style={labelStyle}>Preferred Contact Phone *</label>
                    <input
                      id="board-phone" name="phone" type="tel" required
                      value={form.phone} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                      placeholder="(828) 555-1234"
                    />
                  </div>
                  <div>
                    <label htmlFor="board-email" className={labelClass} style={labelStyle}>Preferred Email for Museum Correspondence *</label>
                    <input
                      id="board-email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                      style={inputStyle}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <label
                  htmlFor="board-age"
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                  style={inputStyle}
                >
                  <input
                    id="board-age" name="age_confirmed" type="checkbox" required
                    checked={form.age_confirmed} onChange={handleChange}
                    className="mt-0.5 w-4 h-4 flex-shrink-0"
                    style={{ accentColor: GOLD_ACCENT }}
                  />
                  <span className="font-body text-[14px] leading-[1.5]" style={{ color: WARM_BLACK }}>
                    I am 18 years of age or older *
                  </span>
                </label>

                {QUESTIONS.map((question, index) => (
                  <div key={question.name}>
                    <label htmlFor={`board-${question.name}`} className={labelClass} style={labelStyle}>
                      {index + 1}. {question.label} {question.required ? "*" : "(Optional)"}
                    </label>
                    <textarea
                      id={`board-${question.name}`}
                      name={question.name}
                      rows={5}
                      required={question.required}
                      value={form[question.name]}
                      onChange={handleChange}
                      className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 resize-y"
                      style={inputStyle}
                    />
                  </div>
                ))}

                <fieldset className="border-none p-0 m-0">
                  <legend className={labelClass} style={labelStyle}>Board Service Commitment *</legend>
                  <p className="font-body text-[14px] leading-[1.7] mb-4 mt-0" style={{ color: "rgba(26,19,17,0.55)" }}>
                    Board service includes attending monthly board meetings, working on special projects, participating in planning sessions, and promoting the museum in the community.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {COMMITMENT_OPTIONS.map((option) => {
                      const selected = form.commitment === option.value;
                      return (
                        <label
                          key={option.value}
                          className="flex items-start gap-3 text-left px-4 py-3 cursor-pointer transition-all duration-200"
                          style={{
                            background: selected ? "rgba(196,163,90,0.08)" : "#FFFDF9",
                            border: selected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.12)",
                          }}
                        >
                          <input
                            type="radio"
                            name="commitment"
                            value={option.value}
                            required
                            checked={selected}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 flex-shrink-0"
                            style={{ accentColor: GOLD_ACCENT }}
                          />
                          <span className="font-body text-[13px] leading-[1.5]" style={{ color: WARM_BLACK }}>
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {status === "error" && (
                  <p className="font-body text-sm" style={{ color: "#c53030" }}>
                    Something went wrong. Please try again or email us at{" "}
                    <a href="mailto:info@tryonhistorymuseum.org" style={{ color: DEEP_RED }}>info@tryonhistorymuseum.org</a>.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full font-body text-[14px] font-semibold uppercase cursor-pointer transition-all hover:brightness-90 disabled:opacity-60 disabled:cursor-default"
                  style={{
                    letterSpacing: "0.12em",
                    color: CREAM,
                    background: DEEP_CRIMSON,
                    padding: "16px 36px",
                    border: "1.5px solid rgba(196,163,90,0.4)",
                  }}
                >
                  {status === "sending" ? "Submitting…" : "Submit Board Interest Form"}
                </button>
              </form>
            </FadeIn>
          )}
        </div>
      </section>
    </>
  );
}
