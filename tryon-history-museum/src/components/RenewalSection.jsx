"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function statusLabel(status) {
  switch (status) {
    case "active": return { text: "Active", color: "#2D6A4F" };
    case "expiring_soon": return { text: "Expiring Soon", color: "#B8860B" };
    case "expired": return { text: "Expired", color: DEEP_RED };
    default: return { text: status || "—", color: MUTED_RED };
  }
}

export default function RenewalSection() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState("individual");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data, error: dbError } = await supabase
        .from("members")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (dbError || !data) {
        setLoading(false);
        return;
      }

      setMember(data);
      setSelectedTier(data.membership_tier || "individual");
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRenew() {
    setSubmitting(true);
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: selectedTier }),
    });

    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return (
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[700px] mx-auto px-5 md:px-8 text-center">
          <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>Loading…</p>
        </div>
      </section>
    );
  }

  if (!member) {
    return (
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
          <h1 className="font-display text-3xl font-light mb-4" style={{ color: WARM_BLACK }}>Membership Not Found</h1>
          <p className="font-body text-[15px] mb-6" style={{ color: "rgba(26,19,17,0.6)" }}>
            We couldn&apos;t find your membership record. Please contact us at{" "}
            <a href="mailto:info@tryonhistorymuseum.org" className="no-underline font-semibold" style={{ color: DEEP_RED }}>info@tryonhistorymuseum.org</a>.
          </p>
        </div>
      </section>
    );
  }

  const stat = statusLabel(member.status);
  const tiers = [
    {
      key: "individual",
      label: "Individual Membership",
      price: "$50",
      period: "per year",
      desc: "Member pricing, members-only events, newsletter, 10% gift shop discount.",
    },
    {
      key: "family",
      label: "Family Membership",
      price: "$75",
      period: "per year",
      desc: "All Individual benefits for your household, plus guest passes and event priority.",
    },
  ];

  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]" style={{ background: "#FAF7F4" }}>
      <div className="max-w-[700px] mx-auto px-5 md:px-8">
        {/* Back link */}
        <Link
          href="/member/dashboard"
          className="inline-block font-body text-[12px] uppercase no-underline mb-8 hover:underline"
          style={{ letterSpacing: "0.1em", color: MUTED_RED }}
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="font-body text-[11px] uppercase mb-3" style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}>
            Membership Renewal
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light m-0" style={{ color: WARM_BLACK }}>
            Renew Your Membership
          </h1>
        </div>

        {/* Current status */}
        <div className="p-6 md:p-8 mb-8" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className="font-body text-[11px] uppercase mb-3" style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}>
            Current Membership
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="font-body text-[10px] uppercase mb-1" style={{ letterSpacing: "0.15em", color: MUTED_RED }}>Tier</div>
              <div className="font-display text-lg font-semibold" style={{ color: WARM_BLACK }}>
                {member.membership_tier ? member.membership_tier.charAt(0).toUpperCase() + member.membership_tier.slice(1) : "—"}
              </div>
            </div>
            <div>
              <div className="font-body text-[10px] uppercase mb-1" style={{ letterSpacing: "0.15em", color: MUTED_RED }}>Status</div>
              <div className="font-display text-lg font-semibold" style={{ color: stat.color }}>{stat.text}</div>
            </div>
            <div>
              <div className="font-body text-[10px] uppercase mb-1" style={{ letterSpacing: "0.15em", color: MUTED_RED }}>Expires</div>
              <div className="font-display text-lg font-semibold" style={{ color: WARM_BLACK }}>{formatDate(member.expiration_date)}</div>
            </div>
          </div>
        </div>

        {/* Tier selection */}
        <div className="font-body text-[11px] uppercase mb-4" style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}>
          Choose Your Renewal
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {tiers.map((t) => {
            const isSelected = selectedTier === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setSelectedTier(t.key)}
                className="text-left p-6 cursor-pointer transition-all duration-200"
                style={{
                  background: isSelected ? "rgba(196,163,90,0.06)" : "#FFFDF9",
                  border: isSelected ? `2px solid ${GOLD_ACCENT}` : "1px solid rgba(123,45,38,0.08)",
                  outline: "none",
                }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-display text-lg font-semibold" style={{ color: WARM_BLACK }}>{t.label}</div>
                  {isSelected && (
                    <span className="font-body text-[10px] uppercase font-semibold px-2 py-0.5" style={{ background: "rgba(196,163,90,0.15)", color: GOLD_ACCENT, letterSpacing: "0.08em" }}>
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-display text-2xl font-bold mb-2" style={{ color: isSelected ? GOLD_ACCENT : WARM_BLACK }}>
                  {t.price}<span className="font-body text-[13px] font-normal ml-1" style={{ color: "rgba(26,19,17,0.4)" }}>/{t.period}</span>
                </div>
                <p className="font-body text-[13px] m-0" style={{ color: "rgba(26,19,17,0.6)" }}>{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Renew button */}
        <button
          onClick={handleRenew}
          disabled={submitting}
          className="w-full font-body text-[14px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-default"
          style={{
            letterSpacing: "0.12em",
            color: WARM_BLACK,
            background: GOLD_ACCENT,
            padding: "16px 32px",
            border: "none",
          }}
        >
          {submitting ? "Redirecting to checkout…" : "Renew Now"}
        </button>

        <p className="font-body text-[12px] text-center mt-4" style={{ color: "rgba(26,19,17,0.4)" }}>
          You&apos;ll be redirected to a secure Stripe checkout page to complete your payment.
        </p>
      </div>
    </section>
  );
}
