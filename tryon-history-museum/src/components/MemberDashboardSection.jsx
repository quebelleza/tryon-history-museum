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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "My Profile" },
  { id: "transactions", label: "Payment History" },
  { id: "benefits", label: "Benefits" },
];

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

      setUserRole(user.app_metadata?.role || "member");

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

  const stat = statusLabel(member);
  const credBadge = getCredentialBadge(userRole, member?.member_type);
  const hasAdminAccess = userRole === "admin" || userRole === "board_member";

  return (
    <>
      {/* Hero section */}
      <section style={{ background: WARM_BLACK, paddingTop: "6rem", paddingBottom: "2rem" }}>
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
                    border: "1px solid rgba(255,255,255,0.15)",
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

          {/* Tab bar */}
          <div
            className="flex mt-8 overflow-x-auto"
            style={{ borderBottom: "1px solid rgba(250,247,244,0.1)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 font-body text-[12px] uppercase cursor-pointer transition-colors px-5 py-3"
                style={{
                  letterSpacing: "0.12em",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === tab.id ? `2px solid ${GOLD_ACCENT}` : "2px solid transparent",
                  color: activeTab === tab.id ? GOLD_ACCENT : "rgba(250,247,244,0.5)",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab content */}
      <section style={{ background: "#FAF7F4", minHeight: "60vh" }}>
        <div className="max-w-[900px] mx-auto px-5 md:px-8 py-10">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <FadeIn>
              <div
                className="p-7 md:p-10 mb-6"
                style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div
                    className="font-body text-[11px] uppercase"
                    style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                  >
                    Your Membership
                  </div>
                  <span
                    className="inline-block font-body text-[11px] font-semibold uppercase px-3.5 py-1.5"
                    style={{
                      letterSpacing: "0.1em",
                      background: stat.color + "18",
                      color: stat.color,
                      border: `1px solid ${stat.color}33`,
                    }}
                  >
                    {stat.text}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                  <div>
                    <div
                      className="font-body text-[10px] uppercase mb-1"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Membership Tier
                    </div>
                    <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                      {tierLabel(member.effective_access_tier || member.membership_tier)}
                    </div>
                  </div>
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
                      Valid Through
                    </div>
                    <div className="font-display text-xl font-semibold" style={{ color: WARM_BLACK }}>
                      {formatDate(member.renewal_due_date || member.expiration_date)}
                    </div>
                  </div>
                </div>
                {(stat.text === "Expiring Soon" || stat.text === "Overdue") && (
                  <div
                    className="p-5 mt-4"
                    style={{ background: "rgba(184,134,11,0.06)", border: "1px solid rgba(184,134,11,0.15)" }}
                  >
                    <p className="font-body text-[14px] leading-[1.6] mb-3 m-0" style={{ color: "#8B6914" }}>
                      Your membership expires soon. Renew now to keep your benefits.
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
                {stat.text === "Inactive" && (
                  <div
                    className="p-5 mt-4"
                    style={{ background: "rgba(123,45,38,0.04)", border: "1px solid rgba(123,45,38,0.12)" }}
                  >
                    <p className="font-body text-[14px] leading-[1.6] mb-3 m-0" style={{ color: DEEP_RED }}>
                      Your membership has expired. Renew today to restore your member access.
                    </p>
                    <Link
                      href="/member/renew"
                      className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
                      style={{ letterSpacing: "0.12em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "10px 24px" }}
                    >
                      Renew Now
                    </Link>
                  </div>
                )}
              </div>

              {hasAdminAccess && (
                <div
                  className="p-6 md:p-8 mb-6"
                  style={{ background: NAVY, border: "1px solid rgba(27,42,74,0.3)" }}
                >
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Members-Only Events", href: "/events", desc: "View upcoming events" },
                  { label: "My Profile", tab: "profile", desc: "Edit your profile" },
                  { label: "Contact the Museum", href: "/contact", desc: "Get in touch" },
                ].map((link) =>
                  link.tab ? (
                    <button
                      key={link.label}
                      onClick={() => setActiveTab(link.tab)}
                      className="block text-left w-full p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                    >
                      <div className="font-body text-[13px] font-semibold mb-1" style={{ color: WARM_BLACK }}>
                        {link.label}
                      </div>
                      <div className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                        {link.desc}
                      </div>
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block no-underline p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                    >
                      <div className="font-body text-[13px] font-semibold mb-1" style={{ color: WARM_BLACK }}>
                        {link.label}
                      </div>
                      <div className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                        {link.desc}
                      </div>
                    </Link>
                  )
                )}
              </div>
            </FadeIn>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && profileForm && (
            <FadeIn>
              <form onSubmit={handleProfileSave}>
                <div
                  className="font-body text-[11px] uppercase mb-5"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Contact Information
                </div>
                <div
                  className="p-7 md:p-9 mb-8"
                  style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        readOnly
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{
                          border: "1px solid rgba(123,45,38,0.08)",
                          background: "rgba(26,19,17,0.03)",
                          color: "rgba(26,19,17,0.4)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label
                      className="font-body text-[10px] uppercase block mb-1.5"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Spouse / Partner Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.spouse_partner_name}
                      onChange={(e) => setProfileForm({ ...profileForm, spouse_partner_name: e.target.value })}
                      className="w-full font-body text-sm px-3 py-2 outline-none"
                      placeholder="Optional"
                      style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      className="font-body text-[10px] uppercase block mb-1.5"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={profileForm.street_address}
                      onChange={(e) => setProfileForm({ ...profileForm, street_address: e.target.value })}
                      className="w-full font-body text-sm px-3 py-2 outline-none"
                      style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        State
                      </label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                    <div>
                      <label
                        className="font-body text-[10px] uppercase block mb-1.5"
                        style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                      >
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={profileForm.zip_code}
                        onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                        className="w-full font-body text-sm px-3 py-2 outline-none"
                        style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="font-body text-[11px] uppercase mb-5"
                  style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
                >
                  Email Preferences
                </div>
                <div
                  className="p-7 md:p-9 mb-6"
                  style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                >
                  {[
                    { key: "email_newsletter", label: "Newsletter" },
                    { key: "email_event_announcements", label: "Event Announcements" },
                    { key: "email_membership_reminders", label: "Membership Reminders" },
                    { key: "email_member_events", label: "Members-Only Events" },
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center gap-3 mb-4 cursor-pointer last:mb-0">
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
                  <p className="font-body text-[13px] mb-4" style={{ color: DEEP_RED }}>
                    {profileError}
                  </p>
                )}
                {profileSaved && (
                  <p className="font-body text-[13px] mb-4" style={{ color: "#2D6A4F" }}>
                    Profile saved successfully.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "12px 32px",
                    border: "none",
                  }}
                >
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
              </form>

              <div
                className="font-body text-[11px] uppercase mb-5 mt-12"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                Change Password
              </div>
              <form
                onSubmit={handlePasswordChange}
                className="p-7 md:p-9 mb-10"
                style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                  <div>
                    <label
                      className="font-body text-[10px] uppercase block mb-1.5"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={pwForm.password}
                      onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                      className="w-full font-body text-sm px-3 py-2 outline-none"
                      style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                    />
                  </div>
                  <div>
                    <label
                      className="font-body text-[10px] uppercase block mb-1.5"
                      style={{ letterSpacing: "0.2em", color: MUTED_RED }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      className="w-full font-body text-sm px-3 py-2 outline-none"
                      style={{ border: "1px solid rgba(123,45,38,0.15)", background: "#fff", color: WARM_BLACK }}
                    />
                  </div>
                </div>
                {pwError && (
                  <p className="font-body text-[13px] mb-3" style={{ color: DEEP_RED }}>
                    {pwError}
                  </p>
                )}
                {pwSaved && (
                  <p className="font-body text-[13px] mb-3" style={{ color: "#2D6A4F" }}>
                    Password updated successfully.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
                  style={{
                    letterSpacing: "0.12em",
                    color: WARM_BLACK,
                    background: GOLD_ACCENT,
                    padding: "12px 32px",
                    border: "none",
                  }}
                >
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </form>
            </FadeIn>
          )}

          {/* TRANSACTIONS */}
          {activeTab === "transactions" && (
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-5"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                Payment History
              </div>
              {txLoading ? (
                <p className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.5)" }}>
                  Loading…
                </p>
              ) : transactions.length === 0 ? (
                <div
                  className="p-8 text-center"
                  style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
                >
                  <p className="font-body text-[14px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                    No payment history found.
                  </p>
                </div>
              ) : (
                <div style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
                  {transactions.map((tx, i) => (
                    <div
                      key={tx.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                      style={{
                        borderBottom: i < transactions.length - 1 ? "1px solid rgba(123,45,38,0.06)" : "none",
                      }}
                    >
                      <div>
                        <div className="font-body text-[13px] font-semibold" style={{ color: WARM_BLACK }}>
                          {tx.payment_type
                            ? tx.payment_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                            : "Payment"}
                        </div>
                        <div className="font-body text-[12px] mt-0.5" style={{ color: "rgba(26,19,17,0.45)" }}>
                          {formatDate(tx.payment_date)}
                        </div>
                      </div>
                      <div className="font-display text-lg font-semibold" style={{ color: WARM_BLACK }}>
                        ${Number(tx.amount || tx.payment_amount || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
          )}

          {/* BENEFITS */}
          {activeTab === "benefits" && (
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-5"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                Your Benefits
              </div>
              <div
                className="p-7 md:p-9 mb-6"
                style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
              >
                <div className="font-display text-lg font-semibold mb-4" style={{ color: WARM_BLACK }}>
                  {tierLabel(member.effective_access_tier || member.membership_tier)} Membership
                </div>
                <ul className="space-y-3 list-none p-0 m-0">
                  {[
                    "Free admission to the museum",
                    "10% discount at the museum gift shop",
                    "Invitations to members-only events",
                    "Quarterly newsletter",
                    ...(member.effective_access_tier === "family" || member.membership_tier === "family"
                      ? ["Free admission for your entire household", "Guest passes for select special events"]
                      : []),
                  ].map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-3 font-body text-[14px]"
                      style={{ color: "rgba(26,19,17,0.7)" }}
                    >
                      <span style={{ color: GOLD_ACCENT, fontSize: "10px" }}>✦</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-5"
                style={{ background: "rgba(196,163,90,0.06)", border: "1px solid rgba(196,163,90,0.2)" }}
              >
                <p className="font-body text-[13px] leading-[1.7] m-0" style={{ color: "rgba(26,19,17,0.6)" }}>
                  Membership valid through:{" "}
                  <strong style={{ color: WARM_BLACK }}>
                    {formatDate(member.renewal_due_date || member.expiration_date)}
                  </strong>
                </p>
              </div>
            </FadeIn>
          )}

        </div>
      </section>
    </>
  );
}
