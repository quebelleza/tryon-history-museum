"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FadeIn from "@/components/FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const NAVY = "#1B2A4A";

function getGivingLevel(member) {
  const dl = member?.donor_level;
  if (dl === "fitzgerald") return "Fitzgerald Society";
  if (dl === "pacolet") return "Pacolet Society";
  if (dl === "simone") return "Nina Simone Circle";
  if (dl === "gillette") return "Gillette Circle";
  return "Member";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function statusLabel(member) {
  const status = member?.status;
  if (status === "pending") return { text: "Pending", color: "#1B2A4A" };
  const expDate = member?.renewal_due_date;
  const today = new Date();
  const exp = expDate ? new Date(expDate + "T12:00:00") : null;
  const daysDiff = exp ? Math.floor((exp - today) / (1000 * 60 * 60 * 24)) : null;

  if (status === "active" && daysDiff !== null && daysDiff <= 30 && daysDiff >= 0) {
    return { text: "Expiring Soon", color: "#B8860B" };
  }
  if (status === "active") return { text: "Active", color: "#2D6A4F" };
  if (daysDiff !== null && daysDiff > -60) return { text: "Overdue", color: "#B8860B" };
  return { text: "Inactive", color: "rgba(26,19,17,0.4)" };
}

export default function MemberStatusPage() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/login");
        return;
      }

      setMember(data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <section className="min-h-screen pt-40 pb-20" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>
            Loading…
          </p>
        </div>
      </section>
    );
  }

  const stat = statusLabel(member);
  const isActive = stat.text === "Active";

  return (
    <section className="min-h-screen pt-32 pb-24" style={{ background: "#FAF7F4" }}>
      <div className="max-w-[640px] mx-auto px-5 md:px-8">
        <FadeIn>
          {/* Heading */}
          <div
            className="font-body text-[11px] uppercase mb-3"
            style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
          >
            Membership
          </div>
          <h1
            className="font-display text-3xl md:text-4xl font-light mb-10"
            style={{ color: WARM_BLACK }}
          >
            Welcome back,{" "}
            <span className="italic font-semibold">{member.first_name}.</span>
          </h1>

          {/* Status card */}
          <div
            className="p-7 md:p-10 mb-6"
            style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Giving Level
                </div>
                <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                  {getGivingLevel(member)}
                </div>
              </div>
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Status
                </div>
                <div className="font-display text-xl font-semibold" style={{ color: stat.color }}>
                  {stat.text}
                </div>
              </div>
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Member Since
                </div>
                <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                  {formatDate(member.membership_start_date)}
                </div>
              </div>
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Valid Through
                </div>
                <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                  {formatDate(member.renewal_due_date)}
                </div>
              </div>
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Member ID
                </div>
                <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                  {member.member_id || "—"}
                </div>
              </div>
            </div>

            {/* Lapsed / expiring notice + renew button */}
            {!isActive && (
              <div
                className="mt-6 p-5"
                style={{ background: "rgba(123,45,38,0.04)", border: "1px solid rgba(123,45,38,0.12)" }}
              >
                <p
                  className="font-body text-[14px] leading-[1.6] mb-3"
                  style={{ color: DEEP_RED }}
                >
                  {stat.text === "Expiring Soon"
                    ? "Your membership expires soon. Renew now to keep your benefits."
                    : "Your membership has lapsed. Renew today to restore your access."}
                </p>
                <Link
                  href="/member/renew"
                  className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{ letterSpacing: "0.12em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "10px 24px" }}
                >
                  Renew &amp; Pay Now →
                </Link>
              </div>
            )}

            {/* Active confirmation */}
            {isActive && (
              <div
                className="mt-6 p-5"
                style={{ background: "rgba(45,106,79,0.05)", border: "1px solid rgba(45,106,79,0.15)" }}
              >
                <p
                  className="font-body text-[14px] leading-[1.6] m-0"
                  style={{ color: "#2D6A4F" }}
                >
                  You&apos;re all set — your membership is active through{" "}
                  {formatDate(member.renewal_due_date)}.
                </p>
              </div>
            )}
          </div>

          {/* Full dashboard link */}
          <p
            className="font-body text-[13px] text-center"
            style={{ color: "rgba(26,19,17,0.45)" }}
          >
            <Link
              href="/member/dashboard"
              className="no-underline hover:underline"
              style={{ color: MUTED_RED }}
            >
              View full dashboard →
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
