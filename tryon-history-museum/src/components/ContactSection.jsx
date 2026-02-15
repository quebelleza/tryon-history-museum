"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

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
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Get in Touch
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Contact{" "}
              <span className="italic font-semibold">Us</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Have a question, want to volunteer, or just want to say hello?
              We&apos;d love to hear from you.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                {status === "success" ? (
                  <div
                    className="p-8 text-center"
                    style={{
                      background: "#FFFDF9",
                      border: "1px solid rgba(123,45,38,0.08)",
                    }}
                  >
                    <div
                      className="font-display text-2xl font-semibold mb-3"
                      style={{ color: WARM_BLACK }}
                    >
                      Message Sent!
                    </div>
                    <p
                      className="font-body text-[15px] mb-6"
                      style={{ color: "rgba(26,19,17,0.6)" }}
                    >
                      Thank you for reaching out. We&apos;ll get back to you as
                      soon as possible.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110"
                      style={{
                        letterSpacing: "0.12em",
                        color: WARM_BLACK,
                        background: GOLD_ACCENT,
                        padding: "12px 28px",
                        border: "none",
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    aria-label="Contact form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block font-body text-[12px] uppercase mb-2 font-semibold"
                          style={{
                            letterSpacing: "0.15em",
                            color: WARM_BLACK,
                          }}
                        >
                          Name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                          style={{
                            background: "#FFFDF9",
                            border: "1px solid rgba(123,45,38,0.12)",
                            color: WARM_BLACK,
                          }}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block font-body text-[12px] uppercase mb-2 font-semibold"
                          style={{
                            letterSpacing: "0.15em",
                            color: WARM_BLACK,
                          }}
                        >
                          Email
                        </label>
                        <input
                          id="contact-email"
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
                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block font-body text-[12px] uppercase mb-2 font-semibold"
                        style={{
                          letterSpacing: "0.15em",
                          color: WARM_BLACK,
                        }}
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2"
                        style={{
                          background: "#FFFDF9",
                          border: "1px solid rgba(123,45,38,0.12)",
                          color: WARM_BLACK,
                        }}
                        placeholder="What is this about?"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block font-body text-[12px] uppercase mb-2 font-semibold"
                        style={{
                          letterSpacing: "0.15em",
                          color: WARM_BLACK,
                        }}
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={6}
                        value={form.message}
                        onChange={handleChange}
                        className="w-full font-body text-sm px-4 py-3 outline-none transition-all focus:ring-2 resize-y"
                        style={{
                          background: "#FFFDF9",
                          border: "1px solid rgba(123,45,38,0.12)",
                          color: WARM_BLACK,
                        }}
                        placeholder="Your message..."
                      />
                    </div>

                    {status === "error" && (
                      <p className="font-body text-sm" style={{ color: "#c53030" }}>
                        Something went wrong. Please try again or email us
                        directly.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                      style={{
                        letterSpacing: "0.12em",
                        color: WARM_BLACK,
                        background: GOLD_ACCENT,
                        padding: "14px 36px",
                        border: "none",
                      }}
                    >
                      {status === "sending" ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.15}>
                <div
                  className="p-8"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.08)",
                  }}
                >
                  <h2
                    className="font-display text-2xl font-semibold mb-6"
                    style={{ color: WARM_BLACK }}
                  >
                    Visit Us
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Address
                      </div>
                      <p
                        className="font-body text-[15px] leading-relaxed m-0"
                        style={{ color: WARM_BLACK }}
                      >
                        Tryon History Museum
                        <br />
                        & Visitor Center
                        <br />
                        26 Maple Street
                        <br />
                        Tryon, NC 28782
                      </p>
                    </div>

                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Email
                      </div>
                      <a
                        href="mailto:info@tryonhistorymuseum.org"
                        className="font-body text-[15px] no-underline hover:underline"
                        style={{ color: DEEP_RED }}
                      >
                        info@tryonhistorymuseum.org
                      </a>
                    </div>

                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Hours
                      </div>
                      <p
                        className="font-body text-[15px] leading-relaxed m-0"
                        style={{ color: WARM_BLACK }}
                      >
                        Wednesday & Thursday: 1–4 PM
                        <br />
                        Friday & Saturday: 11 AM–5 PM
                        <br />
                        Sunday–Tuesday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div
                  className="mt-6 overflow-hidden"
                  style={{ border: "1px solid rgba(123,45,38,0.08)" }}
                >
                  <iframe
                    title="Tryon History Museum Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3278.5!2d-82.2321!3d35.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8859f1b8d1b1b1b1%3A0x0!2s229+Palmer+St%2C+Tryon%2C+NC+28782!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
