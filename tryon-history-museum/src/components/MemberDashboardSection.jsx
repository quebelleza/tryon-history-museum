"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const NAVY = "#1B2A4A";

function getCredentialBadge(appRole, memberType) {
  if (appRole === "admin")
    return { label: "Museum Administrator", bg: NAVY, color: "#FAF7F4" };
  if (appRole === "board_member" || memberType === "board_member")
    return { label: "Board Member", bg: NAVY, color: "#FAF7F4" };
  if (memberType === "volunteer")
    return { label: "Volunteer", bg: "rgba(45,106,79,0.1)", color: "#2D6A4F" };
  if (memberType === "staff")
    return { label: "Museum Staff", bg: NAVY, color: "#FAF7F4" };
  return { label: "Museum Member", bg: "rgba(26,19,17,0.04)", color: WARM_BLACK };
}

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
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
  if (daysDiff !== null && daysDiff > -60)
    return { text: "Overdue", color: "#B8860B" };
  return { text: "Inactive", color: "rgba(26,19,17,0.4)" };
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
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [pwForm, setPwForm] = useState({ password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";

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

      setUserRole(user.app_metadata?.role || null);

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
      setProfileForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        spouse_partner_name: data.spouse_partner_name || "",
        street_address: data.street_address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        email_newsletter: data.email_newsletter ?? true,
        email_event_announcements: data.email_event_announcements ?? true,
        email_membership_reminders: data.email_membership_reminders ?? true,
        email_member_events: data.email_member_events ?? true,
      });
      setLoading(false);
    }

    loadMember();
  }, [router]);

  useEffect(() => {
    if (activeTab === "transactions" && member) loadTransactions();
  }, [activeTab, member]);

  useEffect(() => {
    if (member?.id) {
      const dismissed = localStorage.getItem(`welcome_nudge_dismissed_${member.id}`);
      if (dismissed) setDismissedNudge(true);
    }
  }, [member?.id]);

  async function loadTransactions() {
    if (transactions.length > 0) return;
    setTxLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("member_id", member.id)
      .order("payment_date", { ascending: false });
    setTransactions(data || []);
    setTxLoading(false);
  }

  async function handleCompletePayment() {
    setSubmittingCheckout(true);
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setSubmittingCheckout(false);
      alert("Something went wrong. Please try again.");
    }
  }

  function dismissNudge() {
    if (member?.id) {
      localStorage.setItem(`welcome_nudge_dismissed_${member.id}`, "true");
    }
    setDismissedNudge(true);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("members")
      .update({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        spouse_partner_name: profileForm.spouse_partner_name,
        street_address: profileForm.street_address,
        city: profileForm.city,
        state: profileForm.state,
        zip_code: profileForm.zip_code,
        address: [profileForm.street_address, profileForm.city, [profileForm.state, profileForm.zip_code].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null,
        email_newsletter: profileForm.email_newsletter,
        email_event_announcements: profileForm.email_event_announcements,
        email_membership_reminders: profileForm.email_membership_reminders,
        email_member_events: profileForm.email_member_events,
      })
      .eq("auth_user_id", member.auth_user_id);

    if (error) {
      setProfileError("Something went wrong saving your profile. Please try again.");
    } else {
      setProfileSaved(true);
      setMember({ ...member, ...profileForm });
    }
    setProfileSaving(false);
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) {
      setPwError("Passwords do not match.");
      return;
    }
    if (pwForm.password.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    setPwError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: pwForm.password,
    });
    if (error) {
      setPwError("Could not update password. Please try again.");
    } else {
      setPwSaved(true);
      setPwForm({ password: "", confirm: "" });
    }
    setPwSaving(false);
  }

  if (loading) {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[900px] mx-auto px-5 md:px-8 text-center">
          <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>
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

  // ── Pending state — account exists but payment not completed ──
  if (member?.status === "pending") {
    return (
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[70vh]"
        style={{ background: "#FAF7F4" }}
      >
        <div className="max-w-[520px] mx-auto px-5 md:px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              Almost There
            </div>
            <h1
              className="font-display text-3xl md:text-4xl font-light mb-4"
              style={{ color: WARM_BLACK }}
            >
              Welcome,{" "}
              <span className="italic font-semibold">{member.first_name}.</span>
            </h1>
            <p
              className="font-body text-[16px] leading-[1.8] mb-8"
              style={{ color: "rgba(26,19,17,0.6)" }}
            >
              Your account is set up, but your membership isn&apos;t active yet.
              Complete your payment below to finish joining the museum.
            </p>

            <div
              className="p-6 mb-6"
              style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Level
                  </div>
                  <div
                    className="font-display text-lg font-semibold"
                    style={{ color: WARM_BLACK }}
                  >
                    {getGivingLevel(member)}
                  </div>
                </div>
                <div>
                  <div
                    className="font-body text-[10px] uppercase mb-1"
                    style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                  >
                    Amount
                  </div>
                  <div
                    className="font-display text-lg font-semibold"
                    style={{ color: DEEP_RED }}
                  >
                    ${member.last_payment_amount
                      ? parseFloat(member.last_payment_amount).toLocaleString()
                      : "50"}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompletePayment}
              disabled={submittingCheckout}
              className="w-full font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              style={{
                letterSpacing: "0.12em",
                color: WARM_BLACK,
                background: GOLD_ACCENT,
                padding: "16px 36px",
                border: "none",
              }}
            >
              {submittingCheckout ? "Redirecting to payment…" : "Complete Your Membership →"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full font-body text-[12px] uppercase cursor-pointer transition-all hover:opacity-70"
              style={{
                letterSpacing: "0.1em",
                color: "rgba(26,19,17,0.45)",
                background: "transparent",
                border: "1px solid rgba(26,19,17,0.12)",
                padding: "12px",
              }}
            >
              Sign Out
            </button>
          </FadeIn>
        </div>
      </section>
    );
  }

  const stat = statusLabel(member);
  const credBadge = getCredentialBadge(userRole, member?.member_type);
  const hasAdminAccess = userRole === "admin" || userRole === "board_member";

  return (
    <>
      {/* Hero section */}
      <section className="pt-32 pb-0 md:pt-40" style={{ background: WARM_BLACK }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div
                className="font-body text-[11px] uppercase mb-3"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                Member Dashboard
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-light text-white m-0">
                Welcome back,{" "}
                <span className="italic font-semibold">{member.first_name}.</span>
              </h1>
              <div className="mt-2">
                <span
                  className="inline-block font-body text-[11px] font-semibold uppercase px-3 py-1"
                  style={{
                    letterSpacing: "0.1em",
                    background: credBadge.bg,
                    color: credBadge.color,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {credBadge.label}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:opacity-70 mt-2"
              style={{
                letterSpacing: "0.1em",
                color: "rgba(250,247,244,0.6)",
                background: "transparent",
                border: "1px solid rgba(250,247,244,0.2)",
                padding: "8px 20px",
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Tab navigation */}
          <div
            className="flex gap-0 mt-8 border-b"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            {[
              { key: "overview", label: "Overview" },
              { key: "profile", label: "My Profile" },
              { key: "transactions", label: "Transactions" },
              { key: "benefits", label: "Benefits" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="font-body text-[12px] uppercase px-5 py-3 bg-transparent border-none cursor-pointer transition-all"
                style={{
                  letterSpacing: "0.1em",
                  color: activeTab === tab.key ? GOLD_ACCENT : "rgba(255,255,255,0.45)",
                  borderBottom: activeTab === tab.key ? `2px solid ${GOLD_ACCENT}` : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content area */}
      <section style={{ background: "#FAF7F4", minHeight: "60vh" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8 py-12">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* ── Welcome receipt — shown once after first activation ── */}
              {isWelcome && (
                <div
                  className="relative p-7 md:p-10"
                  style={{ background: NAVY }}
                >
                  <button
                    onClick={dismissNudge}
                    aria-label="Dismiss"
                    className="absolute top-4 right-4 font-body text-[11px] uppercase cursor-pointer transition-all hover:opacity-100 bg-transparent border-none"
                    style={{ letterSpacing: "0.1em", color: "rgba(250,247,244,0.45)" }}
                  >
                    ✕
                  </button>

                  <div
                    className="font-body text-[11px] uppercase mb-3"
                    style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
                  >
                    Welcome to the Museum Family
                  </div>
                  <h2
                    className="font-display text-2xl md:text-3xl font-light text-white mb-0"
                  >
                    {member.first_name},{" "}
                    <span className="italic">your membership is active.</span>
                  </h2>

                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-7 pt-6"
                    style={{ borderTop: "1px solid rgba(250,247,244,0.1)" }}
                  >
                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: "rgba(250,247,244,0.45)" }}
                      >
                        Giving Level
                      </div>
                      <div className="font-display text-lg font-semibold text-white">
                        {getGivingLevel(member)}
                      </div>
                    </div>
                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: "rgba(250,247,244,0.45)" }}
                      >
                        Amount Paid
                      </div>
                      <div className="font-display text-lg font-semibold text-white">
                        {member.last_payment_amount
                          ? `$${parseFloat(member.last_payment_amount).toLocaleString()}`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div
                        className="font-body text-[10px] uppercase mb-1"
                        style={{ letterSpacing: "0.2em", color: "rgba(250,247,244,0.45)" }}
                      >
                        Active Through
                      </div>
                      <div className="font-display text-lg font-semibold text-white">
                        {formatDate(member.renewal_due_date)}
                      </div>
                    </div>
                  </div>

                  {/* Optional mailing address nudge */}
                  {!dismissedNudge && !member.street_address && (
                    <div
                      className="flex items-start justify-between gap-4 mt-6 pt-5"
                      style={{ borderTop: "1px solid rgba(250,247,244,0.1)" }}
                    >
                      <p
                        className="font-body text-[13px] m-0"
                        style={{ color: "rgba(250,247,244,0.6)" }}
                      >
                        Add your mailing address and phone so we can send you
                        event invitations.{" "}
                        <button
                          onClick={() => {
                            dismissNudge();
                            setActiveTab("profile");
                          }}
                          className="font-semibold underline cursor-pointer bg-transparent border-none p-0"
                          style={{
                            color: GOLD_ACCENT,
                            fontFamily: "inherit",
                            fontSize: "inherit",
                          }}
                        >
                          Complete your profile →
                        </button>
                      </p>
                      <button
                        onClick={dismissNudge}
                        className="flex-shrink-0 font-body text-[11px] uppercase cursor-pointer bg-transparent border-none hover:opacity-100 transition-all"
                        style={{ letterSpacing: "0.1em", color: "rgba(250,247,244,0.35)" }}
                      >
                        No thanks
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Membership status card */}
              <div
                className="p-7 md:p-10"
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
                      {formatDate(member.start_date || member.membership_start_date)}
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

                {(stat.text === "Expiring Soon" || stat.text === "Overdue" || stat.text === "Inactive") && (
                  <div
                    className="mt-6 p-5"
                    style={{ background: "rgba(123,45,38,0.04)", border: "1px solid rgba(123,45,38,0.12)" }}
                  >
                    <p className="font-body text-[14px] leading-[1.6] mb-3 m-0" style={{ color: DEEP_RED }}>
                      {stat.text === "Expiring Soon"
                        ? "Your membership expires soon. Renew now to keep your benefits."
                        : "Your membership has lapsed. Renew today to restore your access."}
                    </p>
                    <Link
                      href="/member/renew"
                      className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                      style={{ letterSpacing: "0.12em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "10px 24px" }}
                    >
                      Renew Membership
                    </Link>
                  </div>
                )}
              </div>

              {/* Admin access card */}
              {hasAdminAccess && (
                <div className="p-6 md:p-8" style={{ background: NAVY }}>
                  <div
                    className="font-body text-[11px] uppercase mb-2 font-semibold"
                    style={{ letterSpacing: "0.2em", color: "rgba(250,247,244,0.5)" }}
                  >
                    Museum Administration
                  </div>
                  <p
                    className="font-body text-[14px] leading-[1.6] mb-4 m-0"
                    style={{ color: "rgba(250,247,244,0.75)" }}
                  >
                    You have board-level access to the Museum&apos;s admin tools.
                  </p>
                  <Link
                    href="/admin/dashboard"
                    className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                    style={{ letterSpacing: "0.12em", color: NAVY, background: "#FAF7F4", padding: "10px 24px" }}
                  >
                    Go to Admin Dashboard →
                  </Link>
                </div>
              )}

              {/* Quick links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "My Profile", desc: "Update your information", action: () => setActiveTab("profile") },
                  { label: "Transactions", desc: "View payment history", action: () => setActiveTab("transactions") },
                  { label: "Member Benefits", desc: "Discounts & events", action: () => setActiveTab("benefits") },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="block w-full text-left no-underline p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-none"
                    style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                  >
                    <div className="font-body text-[13px] font-semibold mb-1" style={{ color: WARM_BLACK }}>
                      {link.label}
                    </div>
                    <div className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                      {link.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && profileForm && (
            <div className="space-y-8">

              {/* Member ID display */}
              <div
                className="p-6"
                style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
              >
                <div
                  className="font-body text-[10px] uppercase mb-1"
                  style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                >
                  Museum Member ID
                </div>
                <div className="font-display text-2xl font-semibold" style={{ color: WARM_BLACK }}>
                  {member.member_id || "—"}
                </div>
                <p className="font-body text-[12px] mt-1 m-0" style={{ color: "rgba(26,19,17,0.4)" }}>
                  Use this ID when contacting the museum about your membership.
                </p>
              </div>

              {/* Profile edit form */}
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div
                  className="font-body text-[11px] uppercase mb-4"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Personal Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block font-body text-[11px] uppercase mb-2"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block font-body text-[11px] uppercase mb-2"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block font-body text-[11px] uppercase mb-2"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Spouse / Partner Name{" "}
                    <span style={{ color: "rgba(26,19,17,0.4)", textTransform: "none", letterSpacing: 0 }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.spouse_partner_name}
                    onChange={(e) => setProfileForm({ ...profileForm, spouse_partner_name: e.target.value })}
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                  />
                </div>

                <div>
                  <label
                    className="block font-body text-[11px] uppercase mb-2"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "rgba(26,19,17,0.03)", color: "rgba(26,19,17,0.4)", border: "1px solid rgba(123,45,38,0.08)" }}
                  />
                  <p className="font-body text-[11px] mt-1.5" style={{ color: "rgba(26,19,17,0.4)" }}>
                    To change your email address, contact us at{" "}
                    <a href="mailto:info@tryonhistorymuseum.org" style={{ color: DEEP_RED }}>
                      info@tryonhistorymuseum.org
                    </a>
                  </p>
                </div>

                <div>
                  <label
                    className="block font-body text-[11px] uppercase mb-2"
                    style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                  />
                </div>

                <div className="space-y-4">
                  <div
                    className="font-body text-[11px] uppercase"
                    style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                  >
                    Mailing Address
                  </div>
                  <input
                    type="text"
                    value={profileForm.street_address}
                    placeholder="Street Address"
                    onChange={(e) => setProfileForm({ ...profileForm, street_address: e.target.value })}
                    className="w-full font-body text-sm px-4 py-3 outline-none"
                    style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={profileForm.city}
                      placeholder="City"
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="col-span-2 sm:col-span-1 w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                    <input
                      type="text"
                      value={profileForm.state}
                      placeholder="State"
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                    <input
                      type="text"
                      value={profileForm.zip_code}
                      placeholder="ZIP Code"
                      onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className="font-body text-[11px] uppercase"
                    style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                  >
                    Email Preferences
                  </div>
                  <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    Choose which emails you&apos;d like to receive from the museum.
                  </p>
                  {[
                    { key: "email_newsletter", label: "Museum Newsletter" },
                    { key: "email_event_announcements", label: "Event Announcements" },
                    { key: "email_membership_reminders", label: "Membership Reminders" },
                    { key: "email_member_events", label: "Members-Only Event Invitations" },
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm[pref.key]}
                        onChange={(e) => setProfileForm({ ...profileForm, [pref.key]: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: DEEP_RED }}
                      />
                      <span className="font-body text-[14px]" style={{ color: WARM_BLACK }}>
                        {pref.label}
                      </span>
                    </label>
                  ))}
                </div>

                {profileError && (
                  <p className="font-body text-[13px]" style={{ color: DEEP_RED }}>
                    {profileError}
                  </p>
                )}
                {profileSaved && (
                  <p className="font-body text-[13px]" style={{ color: "#2D6A4F" }}>
                    Profile saved successfully.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ letterSpacing: "0.12em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "14px 36px", border: "none" }}
                >
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
              </form>

              {/* Password change */}
              <div className="pt-8 border-t" style={{ borderColor: "rgba(123,45,38,0.08)" }}>
                <div
                  className="font-body text-[11px] uppercase mb-6"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Change Password
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-[440px]">
                  <div>
                    <label
                      className="block font-body text-[11px] uppercase mb-2"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={pwForm.password}
                      minLength={8}
                      onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block font-body text-[11px] uppercase mb-2"
                      style={{ letterSpacing: "0.15em", color: WARM_BLACK }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      className="w-full font-body text-sm px-4 py-3 outline-none"
                      style={{ background: "#FFFDF9", color: WARM_BLACK, border: "1px solid rgba(123,45,38,0.12)" }}
                    />
                  </div>
                  {pwError && (
                    <p className="font-body text-[13px]" style={{ color: DEEP_RED }}>
                      {pwError}
                    </p>
                  )}
                  {pwSaved && (
                    <p className="font-body text-[13px]" style={{ color: "#2D6A4F" }}>
                      Password updated successfully.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-60"
                    style={{ letterSpacing: "0.12em", color: "#FAF7F4", background: DEEP_RED, padding: "12px 28px", border: "none" }}
                  >
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div>
              <div
                className="font-body text-[11px] uppercase mb-6"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                Payment History
              </div>
              {txLoading ? (
                <p className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.5)" }}>
                  Loading transactions…
                </p>
              ) : transactions.length === 0 ? (
                <p className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.5)" }}>
                  No transactions on record yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-5"
                      style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                    >
                      <div>
                        <div className="font-body text-[14px] font-semibold" style={{ color: WARM_BLACK }}>
                          {tx.payment_type === "new_member"
                            ? "New Membership"
                            : tx.payment_type === "renewal"
                            ? "Membership Renewal"
                            : tx.payment_type === "donation"
                            ? "Donation"
                            : "Payment"}
                        </div>
                        <div className="font-body text-[12px] mt-0.5" style={{ color: "rgba(26,19,17,0.45)" }}>
                          {formatDate(tx.payment_date)}
                        </div>
                      </div>
                      <div className="font-display text-lg font-semibold" style={{ color: WARM_BLACK }}>
                        ${parseFloat(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BENEFITS TAB */}
          {activeTab === "benefits" && (
            <div className="space-y-8">
              <div>
                <div
                  className="font-body text-[11px] uppercase mb-5"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Your Member Benefits
                </div>
                <div className="p-7" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
                  <ul className="space-y-3 m-0 p-0 list-none">
                    {[
                      "Free admission to all regular museum hours",
                      "10% discount in the museum gift shop",
                      "Access to members-only events and programs",
                      "Museum newsletter delivered to your inbox",
                      "Priority notification for special exhibitions",
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span style={{ color: GOLD_ACCENT }}>✶</span>
                        <span className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.7)" }}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div
                  className="font-body text-[11px] uppercase mb-5"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Member Discount
                </div>
                <div className="p-7" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
                  <div className="font-display text-2xl font-semibold mb-2" style={{ color: DEEP_RED }}>
                    10% Off
                  </div>
                  <p className="font-body text-[14px] leading-[1.7] m-0" style={{ color: "rgba(26,19,17,0.6)" }}>
                    Show your Member ID ({member.member_id}) at the gift shop to receive your 10% member discount.
                  </p>
                </div>
              </div>

              <div>
                <div
                  className="font-body text-[11px] uppercase mb-5"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Upcoming Members-Only Events
                </div>
                <div className="p-7" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
                  <p className="font-body text-[14px] m-0" style={{ color: "rgba(26,19,17,0.5)" }}>
                    Members-only events will be listed here as they are scheduled. Keep an eye on your email for invitations.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
