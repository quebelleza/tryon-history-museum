"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { createClient } from "@/lib/supabase/client";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const NAVY = "#1B2A4A";

const BENEFITS = [
  "Member pricing on tickets",
  "Access to members-only events",
  "Museum newsletter",
  "10% gift shop discount",
];

const TIERS = [
  {
    id: "membership",
    label: "Membership",
    priceDisplay: "$50 / year",
    tagline: "Annual museum membership",
    min: 50,
    max: 50,
    fixed: true,
  },
  {
    id: "gillette",
    label: "Gillette Circle",
    priceDisplay: "$100–$249",
    tagline: "Supporting member",
    min: 100,
    max: 249,
    fixed: false,
  },
  {
    id: "simone",
    label: "Nina Simone Circle",
    priceDisplay: "$250–$499",
    tagline: "Sustaining member",
    min: 250,
    max: 499,
    fixed: false,
  },
  {
    id: "pacolet",
    label: "Pacolet Society",
    priceDisplay: "$500–$999",
    tagline: "Patron member",
    min: 500,
    max: 999,
    fixed: false,
  },
  {
    id: "fitzgerald",
    label: "Fitzgerald Society",
    priceDisplay: "$1,000+",
    tagline: "Benefactor",
    min: 1000,
    max: null,
    fixed: false,
  },
];

export default function MembershipSection() {
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [amount, setAmount] = useState(50);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingMemberName, setExistingMemberName] = useState(null);

  const selectedTier = TIERS.find((t) => t.id === selectedTierId) || null;

  function handleTierSelect(tierId) {
    const tier = TIERS.find((t) => t.id === tierId);
    setSelectedTierId(tierId);
    setAmount(tier.min);
    setError("");
    setExistingMemberName(null);
  }

  function handleSliderChange(e) {
    setAmount(Number(e.target.value));
  }

  function handleAmountInput(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) setAmount(val);
  }

  function handleAmountBlur() {
    if (!selectedTier || selectedTier.fixed) return;
    let clamped = Math.round(Math.max(selectedTier.min, amount));
    if (selectedTier.max !== null) clamped = Math.min(clamped, selectedTier.max);
    setAmount(clamped);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimFirst = firstName.trim();
    const trimLast = lastName.trim();
    const trimEmail = email.trim();

    if (!selectedTierId) { setError("Please select a membership level."); return; }
    if (!trimFirst) { setError("First name is required."); return; }
    if (!trimLast) { setError("Last name is required."); return; }
    if (!trimEmail) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setExistingMemberName(null);
    try {
      // Step 1: create auth user + pending member record
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimFirst,
          lastName: trimLast,
          email: trimEmail,
          password,
          tier: selectedTierId,
          amount,
        }),
      });
      const data = await res.json();

      if (data.existingMember) {
        setExistingMemberName(data.firstName);
        setLoading(false);
        return;
      }
      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: sign in so session is available for the checkout call
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimEmail,
        password,
      });
      if (signInError) {
        setError("Account created but sign-in failed. Please log in manually.");
        setLoading(false);
        return;
      }

      // Step 3: create Stripe checkout session and redirect directly
      const checkoutRes = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutData.url) {
        setError("Account created. Please log in to complete your payment.");
        setLoading(false);
        return;
      }
      window.location.href = checkoutData.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Support the Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-4">
              Become a <span className="italic font-semibold">Member</span>
            </h1>
            <p
              className="font-body text-[17px] md:text-[18px] leading-[1.8] max-w-[580px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Support Tryon&apos;s story — and enjoy exclusive benefits
              year-round.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Membership Card ─── */}
      <section className="py-20 md:py-28" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[560px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="p-8 md:p-10 flex flex-col"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.08)",
              }}
            >
              <div
                className="font-body text-[11px] uppercase mb-5"
                style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
              >
                Choose Your Level
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-7">
                {BENEFITS.map((benefit, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <span
                      className="text-sm mt-0.5 flex-shrink-0"
                      style={{ color: GOLD_ACCENT }}
                    >
                      ✦
                    </span>
                    <span
                      className="font-body text-[14px] leading-[1.6]"
                      style={{ color: "rgba(26,19,17,0.65)" }}
                    >
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tier picker */}
              <div className="mb-6">
                {TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div key={tier.id} className="mb-2">
                      <button
                        type="button"
                        onClick={() => handleTierSelect(tier.id)}
                        className="w-full text-left transition-all"
                        style={{
                          padding: "13px 16px",
                          border: `1px solid ${isSelected ? DEEP_RED : "rgba(26,19,17,0.12)"}`,
                          background: isSelected ? "rgba(123,45,38,0.04)" : "#FAF7F4",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div
                              className="font-body text-[13px] font-semibold"
                              style={{ color: isSelected ? DEEP_RED : WARM_BLACK }}
                            >
                              {tier.label}
                            </div>
                            <div
                              className="font-body text-[11px]"
                              style={{ color: "rgba(26,19,17,0.4)" }}
                            >
                              {tier.tagline}
                            </div>
                          </div>
                          <div
                            className="font-display text-[16px] font-semibold flex-shrink-0"
                            style={{ color: isSelected ? DEEP_RED : "rgba(26,19,17,0.55)" }}
                          >
                            {tier.priceDisplay}
                          </div>
                        </div>
                      </button>

                      {/* Amount control — variable tier */}
                      {isSelected && !tier.fixed && (
                        <div
                          className="px-4 pt-4 pb-4"
                          style={{
                            border: `1px solid ${DEEP_RED}`,
                            borderTop: "none",
                            background: "#FFFDF9",
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className="font-body text-[10px] uppercase"
                              style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.4)" }}
                            >
                              Your Amount
                            </div>
                            <div className="flex items-baseline gap-0.5">
                              <span
                                className="font-body text-[15px]"
                                style={{ color: "rgba(26,19,17,0.4)" }}
                              >
                                $
                              </span>
                              <input
                                type="number"
                                value={amount}
                                onChange={handleAmountInput}
                                onBlur={handleAmountBlur}
                                min={tier.min}
                                max={tier.max || undefined}
                                className="font-display text-[24px] font-semibold text-right outline-none"
                                style={{
                                  color: DEEP_RED,
                                  background: "transparent",
                                  border: "none",
                                  borderBottom: "1px solid rgba(123,45,38,0.25)",
                                  width: "90px",
                                }}
                              />
                            </div>
                          </div>
                          {tier.max !== null && (
                            <>
                              <input
                                type="range"
                                min={tier.min}
                                max={tier.max}
                                step={1}
                                value={amount}
                                onChange={handleSliderChange}
                                className="w-full"
                                style={{ accentColor: DEEP_RED, cursor: "pointer" }}
                              />
                              <div
                                className="flex justify-between font-body text-[10px] mt-1"
                                style={{ color: "rgba(26,19,17,0.3)" }}
                              >
                                <span>${tier.min.toLocaleString()}</span>
                                <span>${tier.max.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          {tier.max === null && (
                            <p
                              className="font-body text-[11px] m-0"
                              style={{ color: "rgba(26,19,17,0.4)" }}
                            >
                              Enter any amount of ${tier.min.toLocaleString()} or more
                            </p>
                          )}
                        </div>
                      )}

                      {/* Fixed tier confirmation */}
                      {isSelected && tier.fixed && (
                        <div
                          className="px-4 py-3"
                          style={{
                            border: `1px solid ${DEEP_RED}`,
                            borderTop: "none",
                            background: "#FFFDF9",
                          }}
                        >
                          <p
                            className="font-body text-[12px] m-0"
                            style={{ color: "rgba(26,19,17,0.45)" }}
                          >
                            Fixed annual rate — $50
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Name / email form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label
                      htmlFor="mem-firstName"
                      className="block font-body text-[10px] uppercase mb-1.5"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      First Name
                    </label>
                    <input
                      id="mem-firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full font-body text-[14px] outline-none"
                      style={{
                        border: "1px solid rgba(26,19,17,0.15)",
                        padding: "10px 12px",
                        background: "#FAF7F4",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mem-lastName"
                      className="block font-body text-[10px] uppercase mb-1.5"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      Last Name
                    </label>
                    <input
                      id="mem-lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full font-body text-[14px] outline-none"
                      style={{
                        border: "1px solid rgba(26,19,17,0.15)",
                        padding: "10px 12px",
                        background: "#FAF7F4",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="mem-email"
                    className="block font-body text-[10px] uppercase mb-1.5"
                    style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="mem-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full font-body text-[14px] outline-none"
                    style={{
                      border: "1px solid rgba(26,19,17,0.15)",
                      padding: "10px 12px",
                      background: "#FAF7F4",
                      color: WARM_BLACK,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label
                      htmlFor="mem-password"
                      className="block font-body text-[10px] uppercase mb-1.5"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      Password
                    </label>
                    <input
                      id="mem-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full font-body text-[14px] outline-none"
                      style={{
                        border: "1px solid rgba(26,19,17,0.15)",
                        padding: "10px 12px",
                        background: "#FAF7F4",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mem-confirm"
                      className="block font-body text-[10px] uppercase mb-1.5"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      Confirm
                    </label>
                    <input
                      id="mem-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full font-body text-[14px] outline-none"
                      style={{
                        border: "1px solid rgba(26,19,17,0.15)",
                        padding: "10px 12px",
                        background: "#FAF7F4",
                        color: WARM_BLACK,
                      }}
                    />
                  </div>
                </div>

                {existingMemberName && (
                  <p
                    className="font-body text-[13px] mb-4"
                    style={{ color: NAVY }}
                  >
                    Looks like {existingMemberName} already has a membership with us!{" "}
                    <Link
                      href="/login"
                      className="no-underline font-semibold hover:underline"
                      style={{ color: DEEP_RED }}
                    >
                      Log in to view or renew →
                    </Link>
                  </p>
                )}
                {error && !existingMemberName && (
                  <p
                    className="font-body text-[13px] mb-4"
                    style={{ color: DEEP_RED }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedTierId}
                  className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "14px 36px",
                    border: "none",
                  }}
                >
                  {loading
                    ? "Creating account…"
                    : selectedTierId
                    ? `Create Account — $${amount.toLocaleString()}`
                    : "Select a level above"}
                </button>
                <p
                  className="font-body text-[11px] text-center mt-3 m-0"
                  style={{ color: "rgba(26,19,17,0.35)" }}
                >
                  You&apos;ll be redirected to a secure payment page to complete your membership.
                </p>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Donor Note ─── */}
      <section className="py-14 md:py-16" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <div
              className="p-8 md:p-10"
              style={{
                background: "rgba(27,42,74,0.03)",
                border: "1px solid rgba(27,42,74,0.08)",
              }}
            >
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
              >
                Donor Benefits
              </div>
              <p
                className="font-body text-[15px] leading-[1.7] m-0"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Donors contributing $100 or more annually receive full
                membership benefits as our thank-you.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Already a member? ─── */}
      <section className="py-14" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[15px] mb-0"
              style={{ color: "rgba(26,19,17,0.55)" }}
            >
              Already a member?{" "}
              <Link
                href="/login"
                className="no-underline font-semibold hover:underline"
                style={{ color: DEEP_RED }}
              >
                Log in to access your benefits →
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Contact Footer ─── */}
      <section className="py-14" style={{ background: "#FFFDF9" }}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <p
              className="font-body text-[14px] mb-4"
              style={{ color: "rgba(26,19,17,0.5)" }}
            >
              Questions about membership? Call{" "}
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
              The Tryon History Museum is a 501(c)(3) nonprofit organization.
              Your membership supports the preservation of Tryon&apos;s history.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
