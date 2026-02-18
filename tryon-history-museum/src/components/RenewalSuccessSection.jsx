"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function RenewalSuccessSection() {
  const searchParams = useSearchParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      setMember(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
          <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]" style={{ background: "#FAF7F4" }}>
      <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
        {/* Success icon */}
        <div className="mb-6">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "rgba(45,106,79,0.1)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        </div>

        <div className="font-body text-[11px] uppercase mb-3" style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}>
          Renewal Complete
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-light mb-4" style={{ color: WARM_BLACK }}>
          You&apos;re Renewed!
        </h1>
        <p className="font-body text-[16px] leading-[1.7] mb-2" style={{ color: "rgba(26,19,17,0.6)" }}>
          Thank you for renewing your membership.
          {member?.email && (
            <> A confirmation has been sent to <strong style={{ color: WARM_BLACK }}>{member.email}</strong>.</>
          )}
        </p>
        {member?.expiration_date && (
          <p className="font-body text-[16px] leading-[1.7] mb-8" style={{ color: "rgba(26,19,17,0.6)" }}>
            Your membership is now active through <strong style={{ color: WARM_BLACK }}>{formatDate(member.expiration_date)}</strong>.
          </p>
        )}

        <Link
          href="/member/dashboard"
          className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
          style={{
            letterSpacing: "0.12em",
            color: WARM_BLACK,
            background: GOLD_ACCENT,
            padding: "14px 32px",
          }}
        >
          Go to My Dashboard
        </Link>
      </div>
    </section>
  );
}
