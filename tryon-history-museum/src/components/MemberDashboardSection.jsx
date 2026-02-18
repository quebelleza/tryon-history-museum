"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status) {
  switch (status) {
    case "active":
      return { text: "Active", color: "#2D6A4F" };
    case "expiring_soon":
      return { text: "Expiring Soon", color: "#B8860B" };
    case "expired":
      return { text: "Expired", color: DEEP_RED };
    case "pending":
      return { text: "Pending", color: MUTED_RED };
    default:
      return { text: status, color: MUTED_RED };
  }
}

function tierLabel(tier) {
  if (!tier) return "—";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export default function MemberDashboardSection() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMember() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

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
        setError("not_found");
        setLoading(false);
        return;
      }

      setMember(data);
      setLoading(false);
    }

    loadMember();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[800px] mx-auto px-5 md:px-8 text-center">
          <p
            className="font-body text-[15px]"
            style={{ color: "rgba(26,19,17,0.5)" }}
          >
            Loading your dashboard…
          </p>
        </div>
      </section>
    );
  }

  if (error === "not_found") {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[600px] mx-auto px-5 md:px-8 text-center">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Member Dashboard
            </div>
            <h1
              className="font-display text-3xl md:text-4xl font-light mb-6"
              style={{ color: WARM_BLACK }}
            >
              Record Not Found
            </h1>
            <p
              className="font-body text-[16px] leading-[1.7] mb-8"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              We couldn&apos;t find your membership record. Please contact us at{" "}
              <a
                href="mailto:info@tryonhistorymuseum.org"
                className="no-underline font-semibold hover:underline"
                style={{ color: DEEP_RED }}
              >
                info@tryonhistorymuseum.org
              </a>{" "}
              and we&apos;ll get this sorted out.
            </p>
            <button
              onClick={handleSignOut}
              className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "12px 28px",
                border: "none",
              }}
            >
              Sign Out
            </button>
          </FadeIn>
        </div>
      </section>
    );
  }

  const stat = statusLabel(member.status);

  return (
    <section
      className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]"
      style={{ background: "#FAF7F4" }}
    >
      <div className="max-w-[800px] mx-auto px-5 md:px-8">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-12">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-3"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Member Dashboard
            </div>
            <h1
              className="font-display text-3xl md:text-4xl font-light m-0"
              style={{ color: WARM_BLACK }}
            >
              Welcome back,{" "}
              <span className="italic font-semibold">{member.first_name}.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <button
              onClick={handleSignOut}
              className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:opacity-70 mt-2"
              style={{
                letterSpacing: "0.1em",
                color: MUTED_RED,
                background: "transparent",
                border: `1px solid ${MUTED_RED}`,
                padding: "8px 20px",
              }}
            >
              Sign Out
            </button>
          </FadeIn>
        </div>

        {/* Membership status card */}
        <FadeIn delay={0.1}>
          <div
            className="p-7 md:p-10 mb-6"
            style={{
              background: "#FFFDF9",
              border: "1px solid rgba(123,45,38,0.08)",
            }}
          >
            <div
              className="font-body text-[11px] uppercase mb-6"
              style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
            >
              Your Membership
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* Tier */}
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Membership Tier
                </div>
                <div
                  className="font-display text-xl font-semibold"
                  style={{ color: WARM_BLACK }}
                >
                  {tierLabel(member.effective_access_tier)}
                </div>
              </div>

              {/* Status */}
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Status
                </div>
                <div
                  className="font-display text-xl font-semibold"
                  style={{ color: stat.color }}
                >
                  {stat.text}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Valid Through
                </div>
                <div
                  className="font-display text-xl font-semibold"
                  style={{ color: WARM_BLACK }}
                >
                  {formatDate(member.expiration_date)}
                </div>
              </div>
            </div>

            {/* Expiration notices */}
            {member.status === "expiring_soon" && (
              <div
                className="p-5 mt-4"
                style={{
                  background: "rgba(184,134,11,0.06)",
                  border: "1px solid rgba(184,134,11,0.15)",
                }}
              >
                <p
                  className="font-body text-[14px] leading-[1.6] mb-3 m-0"
                  style={{ color: "#8B6914" }}
                >
                  Your membership expires soon. Renew now to keep your benefits.
                </p>
                <Link
                  href="#"
                  className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "10px 24px",
                  }}
                >
                  Renew Membership
                </Link>
              </div>
            )}

            {member.status === "expired" && (
              <div
                className="p-5 mt-4"
                style={{
                  background: "rgba(123,45,38,0.04)",
                  border: "1px solid rgba(123,45,38,0.12)",
                }}
              >
                <p
                  className="font-body text-[14px] leading-[1.6] mb-3 m-0"
                  style={{ color: DEEP_RED }}
                >
                  Your membership has expired. Renew today to restore your
                  member access.
                </p>
                <Link
                  href="#"
                  className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "10px 24px",
                  }}
                >
                  Renew Now
                </Link>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Donor badge */}
        {(member.donor_class === "donor" || member.donor_class === "patron") && (
          <FadeIn delay={0.15}>
            <div
              className="p-5 md:p-7 mb-6 flex items-center gap-4"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(196,163,90,0.2)",
              }}
            >
              <span className="text-2xl flex-shrink-0">✦</span>
              <div>
                <div
                  className="font-body text-[12px] uppercase font-semibold mb-1"
                  style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
                >
                  {member.donor_class === "patron" ? "Patron" : "Donor"}
                </div>
                <p
                  className="font-body text-[14px] m-0"
                  style={{ color: "rgba(26,19,17,0.6)" }}
                >
                  Thank you for your generous support.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick links */}
        <FadeIn delay={0.2}>
          <div
            className="font-body text-[11px] uppercase mb-5 mt-10"
            style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
          >
            Quick Links
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Members-Only Events",
                href: "/events",
                desc: "View upcoming events",
              },
              {
                label: "Update My Information",
                href: "#",
                desc: "Edit your profile",
              },
              {
                label: "Contact the Museum",
                href: "/contact",
                desc: "Get in touch",
              },
            ].map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="block no-underline p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.08)",
                }}
              >
                <div
                  className="font-body text-[13px] font-semibold mb-1"
                  style={{ color: WARM_BLACK }}
                >
                  {link.label}
                </div>
                <div
                  className="font-body text-[12px]"
                  style={{ color: "rgba(26,19,17,0.45)" }}
                >
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
