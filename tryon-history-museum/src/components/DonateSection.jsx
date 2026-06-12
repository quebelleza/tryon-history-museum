"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

const donationTiers = [
  { amount: 50, label: "Friend", description: "Help us keep the lights on and the doors open." },
  { amount: 100, label: "Gillette Circle", description: "Fund educational materials and exhibit care." },
  { amount: 250, label: "Nina Simone Circle", description: "Support special programs and community events." },
  { amount: 500, label: "Pacolet Society", description: "Make a lasting impact on Tryon's heritage preservation." },
  { amount: 1000, label: "Fitzgerald Society", description: "Champion Tryon's history at the highest level." },
];

export default function DonateSection() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customActive, setCustomActive] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectPreset(amount) {
    setSelectedAmount(amount);
    setCustomActive(false);
    setCustomAmount("");
    setError("");
  }

  function activateCustom() {
    setSelectedAmount(null);
    setCustomActive(true);
    setError("");
  }

  function handleCustomChange(e) {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setError("");
  }

  const effectiveAmount = customActive
    ? parseInt(customAmount, 10) || 0
    : selectedAmount || 0;

  async function handleDonate() {
    if (!effectiveAmount || effectiveAmount < 1) {
      setError("Please select or enter a donation amount of at least $1.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-donation-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount * 100 }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
              Support the Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              Make a{" "}
              <span className="italic font-semibold">Donation</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Your tax-deductible gift helps preserve Tryon&apos;s rich history
              and keeps our doors open for future generations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Donation tiers */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2
                className="font-display text-3xl md:text-4xl font-light mb-4"
                style={{ color: WARM_BLACK }}
              >
                Choose a Gift Level
              </h2>
              <p
                className="font-body text-[15px] max-w-[480px] mx-auto"
                style={{ color: "rgba(26,19,17,0.6)" }}
              >
                Every contribution makes a difference. Select an amount below or
                enter a custom donation.
              </p>
            </div>
          </FadeIn>

          {/* Preset tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {donationTiers.map((tier, i) => {
              const isSelected = !customActive && selectedAmount === tier.amount;
              return (
                <FadeIn key={tier.amount} delay={i * 0.08}>
                  <button
                    type="button"
                    onClick={() => selectPreset(tier.amount)}
                    className="w-full text-left p-6 md:p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      background: isSelected ? "rgba(123,45,38,0.04)" : "#FFFDF9",
                      border: isSelected
                        ? `2px solid ${DEEP_RED}`
                        : "2px solid rgba(123,45,38,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="font-display text-3xl font-semibold mb-1"
                      style={{ color: DEEP_RED }}
                    >
                      ${tier.amount.toLocaleString()}
                    </div>
                    <div
                      className="font-body text-[11px] uppercase mb-3"
                      style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                    >
                      {tier.label}
                    </div>
                    <p
                      className="font-body text-[14px] leading-relaxed m-0"
                      style={{ color: "rgba(26,19,17,0.6)" }}
                    >
                      {tier.description}
                    </p>
                  </button>
                </FadeIn>
              );
            })}
          </div>

          {/* Custom amount */}
          <FadeIn delay={0.28}>
            <button
              type="button"
              onClick={activateCustom}
              className="w-full text-left p-6 md:p-8 transition-all duration-200 mb-8"
              style={{
                background: customActive ? "rgba(123,45,38,0.04)" : "#FFFDF9",
                border: customActive
                  ? `2px solid ${DEEP_RED}`
                  : "2px solid rgba(123,45,38,0.08)",
                cursor: "pointer",
              }}
            >
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                Choose Your Own Amount
              </div>
              {customActive ? (
                <div className="flex items-center gap-1">
                  <span
                    className="font-display text-3xl font-semibold"
                    style={{ color: DEEP_RED }}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customAmount}
                    onChange={handleCustomChange}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    autoFocus
                    className="font-display text-3xl font-semibold bg-transparent outline-none border-b-2 w-full"
                    style={{
                      color: DEEP_RED,
                      borderColor: DEEP_RED,
                      caretColor: DEEP_RED,
                    }}
                  />
                </div>
              ) : (
                <p
                  className="font-body text-[14px] leading-relaxed m-0"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  Enter any amount you&apos;d like to give.
                </p>
              )}
            </button>
          </FadeIn>

          {/* Submit */}
          <FadeIn delay={0.35}>
            <div className="text-center">
              {error && (
                <p
                  className="font-body text-[14px] mb-4"
                  style={{ color: DEEP_RED }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleDonate}
                disabled={loading || effectiveAmount < 1}
                className="inline-block font-body text-[13px] font-semibold uppercase transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  letterSpacing: "0.12em",
                  color: WARM_BLACK,
                  background: GOLD_ACCENT,
                  padding: "14px 48px",
                  border: "none",
                  cursor: loading || effectiveAmount < 1 ? "not-allowed" : "pointer",
                }}
              >
                {loading
                  ? "Redirecting…"
                  : effectiveAmount >= 1
                  ? `Donate $${effectiveAmount.toLocaleString()}`
                  : "Select an Amount"}
              </button>
            </div>
          </FadeIn>

          {/* Tax info */}
          <FadeIn delay={0.4}>
            <p
              className="font-body text-[13px] text-center mt-8 italic"
              style={{ color: "rgba(26,19,17,0.45)" }}
            >
              The Tryon History Museum is a 501(c)(3) nonprofit organization.
              All donations are tax-deductible to the extent allowed by law.
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
