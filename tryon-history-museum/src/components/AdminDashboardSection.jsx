"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }) {
  const styles = {
    active: { bg: "rgba(45,106,79,0.1)", color: "#2D6A4F", label: "Active" },
    expiring_soon: { bg: "rgba(184,134,11,0.1)", color: "#B8860B", label: "Expiring Soon" },
    expired: { bg: "rgba(123,45,38,0.1)", color: DEEP_RED, label: "Expired" },
    pending: { bg: "rgba(26,19,17,0.06)", color: "#888", label: "Pending" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="inline-block font-body text-[11px] font-semibold uppercase px-2.5 py-1 rounded-sm"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.05em" }}
    >
      {s.label}
    </span>
  );
}

export default function AdminDashboardSection() {
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);

  useEffect(() => {
    async function load() {
      const [statsRes, expiringRes, expiredRes, patronsRes, stewardsRes, logsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/members?status=expiring_soon&perPage=10&sortBy=expiration_date&sortDir=asc"),
        fetch("/api/admin/members?status=expired&perPage=10&sortBy=expiration_date&sortDir=desc"),
        fetch("/api/admin/members?donorClass=patron&perPage=20"),
        fetch("/api/admin/members?donorClass=steward&perPage=20"),
        fetch("/api/admin/email-logs"),
      ]);
      const [statsData, expiringData, expiredData, patronsData, stewardsData] = await Promise.all([
        statsRes.json(),
        expiringRes.json(),
        expiredRes.json(),
        patronsRes.json(),
        stewardsRes.json(),
      ]);
      const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
      setStats(statsData);
      setExpiring(expiringData.members || []);
      setExpired(expiredData.members || []);
      setPatrons([...(stewardsData.members || []), ...(patronsData.members || [])]);
      setEmailLogs(logsData.logs || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSendReminder(memberId) {
    setSendingReminder(memberId);
    try {
      const res = await fetch("/api/emails/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      if (res.ok) {
        alert("Reminder email sent!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send reminder.");
      }
    } catch {
      alert("Failed to send reminder.");
    }
    setSendingReminder(null);
  }

  if (loading) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>
          Loading dashboard…
        </p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Members", value: stats?.total || 0, color: WARM_BLACK },
    { label: "Active", value: stats?.active || 0, color: "#2D6A4F" },
    { label: "Expiring Soon", value: stats?.expiringSoon || 0, color: "#B8860B" },
    { label: "Expired", value: stats?.expired || 0, color: DEEP_RED },
  ];

  return (
    <div className="p-8 md:p-10 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <div
          className="font-body text-[11px] uppercase mb-2"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          Admin Dashboard
        </div>
        <h1
          className="font-display text-3xl font-light m-0"
          style={{ color: WARM_BLACK }}
        >
          Membership Overview
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-5 md:p-6"
            style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
          >
            <div
              className="font-display text-3xl font-semibold mb-1"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
            <div
              className="font-body text-[11px] uppercase"
              style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
            >
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick-access panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Soon */}
        <div
          className="p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: "#B8860B" }}
          >
            Expiring Soon
          </div>
          {expiring.length === 0 ? (
            <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
              No members expiring soon.
            </p>
          ) : (
            <div className="space-y-3">
              {expiring.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="font-body text-[13px] font-semibold no-underline hover:underline"
                      style={{ color: WARM_BLACK }}
                    >
                      {m.first_name} {m.last_name}
                    </Link>
                    <div className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                      {m.membership_tier} · Exp {formatDate(m.expiration_date)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendReminder(m.id)}
                    disabled={sendingReminder === m.id}
                    className="font-body text-[10px] uppercase font-semibold px-2 py-1 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-default"
                    style={{ color: "#B8860B", border: "1px solid rgba(184,134,11,0.3)", letterSpacing: "0.05em" }}
                  >
                    {sendingReminder === m.id ? "Sending…" : "Send Reminder"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Expired */}
        <div
          className="p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: DEEP_RED }}
          >
            Recently Expired
          </div>
          {expired.length === 0 ? (
            <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
              No recently expired members.
            </p>
          ) : (
            <div className="space-y-3">
              {expired.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="font-body text-[13px] font-semibold no-underline hover:underline"
                      style={{ color: WARM_BLACK }}
                    >
                      {m.first_name} {m.last_name}
                    </Link>
                    <div className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                      {m.membership_tier} · Exp {formatDate(m.expiration_date)}
                    </div>
                  </div>
                  <Link
                    href="/member/renew"
                    className="font-body text-[10px] uppercase font-semibold px-2 py-1 no-underline"
                    style={{ color: DEEP_RED, border: `1px solid rgba(123,45,38,0.3)`, letterSpacing: "0.05em" }}
                  >
                    Reinstate
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patron Members */}
        <div
          className="p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Patron Members
          </div>
          {patrons.length === 0 ? (
            <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
              No patron members yet.
            </p>
          ) : (
            <div className="space-y-3">
              {patrons.map((m) => (
                <div key={m.id}>
                  <Link
                    href={`/admin/members/${m.id}`}
                    className="font-body text-[13px] font-semibold no-underline hover:underline"
                    style={{ color: WARM_BLACK }}
                  >
                    {m.first_name} {m.last_name}
                  </Link>
                  <div className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                    {m.email}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/patrons"
            className="inline-block font-body text-[11px] uppercase font-semibold no-underline mt-4"
            style={{ letterSpacing: "0.1em", color: GOLD_ACCENT }}
          >
            View All Patrons →
          </Link>
        </div>
      </div>

      {/* Email Log */}
      <div className="mt-10 p-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
        <div className="font-body text-[11px] uppercase mb-4 font-semibold" style={{ letterSpacing: "0.15em", color: MUTED_RED }}>
          Recent Emails
        </div>
        {emailLogs.length === 0 ? (
          <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
            No emails sent yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(123,45,38,0.08)" }}>
                  {["Date", "Member", "Type", "Sent To", "Status"].map((h) => (
                    <th key={h} className="text-left font-body text-[10px] uppercase font-semibold px-3 py-2" style={{ letterSpacing: "0.1em", color: MUTED_RED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(123,45,38,0.04)" }}>
                    <td className="px-3 py-2 font-body text-[12px] whitespace-nowrap" style={{ color: "rgba(26,19,17,0.6)" }}>
                      {log.created_at ? formatDate(log.created_at.split("T")[0]) : "—"}
                    </td>
                    <td className="px-3 py-2 font-body text-[13px] font-semibold" style={{ color: WARM_BLACK }}>
                      {log.member_name || "—"}
                    </td>
                    <td className="px-3 py-2 font-body text-[12px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                      {(log.email_type || "").replace(/_/g, " ")}
                    </td>
                    <td className="px-3 py-2 font-body text-[12px]" style={{ color: "rgba(26,19,17,0.5)" }}>
                      {log.sent_to}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block font-body text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm"
                        style={{
                          letterSpacing: "0.05em",
                          background: log.status === "sent" ? "rgba(45,106,79,0.1)" : "rgba(123,45,38,0.1)",
                          color: log.status === "sent" ? "#2D6A4F" : DEEP_RED,
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
