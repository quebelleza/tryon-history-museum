"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

const STATUS_STYLES = {
  new: { bg: "rgba(27,42,74,0.1)", color: "#1B2A4A", label: "New" },
  contacted: { bg: "rgba(184,134,11,0.1)", color: "#B8860B", label: "Contacted" },
  active: { bg: "rgba(45,106,79,0.1)", color: "#2D6A4F", label: "Active" },
  inactive: { bg: "rgba(26,19,17,0.06)", color: "#888", label: "Inactive" },
};

const AREA_LABELS = {
  docent: "Docent / Museum Guide",
  exhibits: "Exhibits & Archiving",
  coordination: "Volunteer Coordination / Scheduling",
  visitor_center: "Visitor Center / Gift Shop",
  events: "Special Events",
  other: "Not Sure / Something Else",
};

const STATUSES = ["new", "contacted", "active", "inactive"];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_LABELS = { morning: "Morning (9am\u201312pm)", afternoon: "Afternoon (12pm\u20134pm)", evening: "Evening (4pm\u20137pm)" };
const TIMES = ["morning", "afternoon", "evening"];

const CONTACT_LABELS = { email: "Email", phone: "Phone Call", text: "Text Message" };

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <div
        className="font-body text-[10px] uppercase mb-1 font-semibold"
        style={{ letterSpacing: "0.15em", color: MUTED_RED }}
      >
        {label}
      </div>
      <div className="font-body text-[15px]" style={{ color: WARM_BLACK }}>
        {children || "\u2014"}
      </div>
    </div>
  );
}

export default function AdminVolunteerDetailSection() {
  const params = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/volunteers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setVolunteer(data.volunteer);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleStatusChange(newStatus) {
    const res = await fetch(`/api/admin/volunteers/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setVolunteer((prev) => ({ ...prev, status: newStatus }));
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>
          Loading volunteer details\u2026
        </p>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: DEEP_RED }}>Volunteer not found.</p>
        <Link href="/admin/volunteers" className="font-body text-[13px] no-underline" style={{ color: MUTED_RED }}>
          \u2190 Back to Volunteers
        </Link>
      </div>
    );
  }

  const avail = volunteer.availability || {};
  const areas = volunteer.volunteer_areas || [];

  return (
    <div className="p-8 md:p-10 max-w-[900px]">
      {/* Back */}
      <Link
        href="/admin/volunteers"
        className="inline-block font-body text-[12px] uppercase no-underline mb-6 hover:underline"
        style={{ letterSpacing: "0.1em", color: MUTED_RED }}
      >
        &larr; Back to Volunteers
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div
            className="font-body text-[11px] uppercase mb-2"
            style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
          >
            Volunteer Details
          </div>
          <h1
            className="font-display text-3xl font-light m-0"
            style={{ color: WARM_BLACK }}
          >
            {volunteer.full_name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={volunteer.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="font-body text-[12px] uppercase font-semibold px-3 py-2 outline-none cursor-pointer rounded-sm"
            style={{
              background: STATUS_STYLES[volunteer.status]?.bg || "rgba(26,19,17,0.06)",
              color: STATUS_STYLES[volunteer.status]?.color || "#888",
              border: `1px solid ${STATUS_STYLES[volunteer.status]?.color || "#888"}33`,
              letterSpacing: "0.06em",
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div
          className="p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Contact Information
          </div>
          <Field label="Email">
            <a href={`mailto:${volunteer.email}`} className="no-underline hover:underline" style={{ color: DEEP_RED }}>
              {volunteer.email}
            </a>
          </Field>
          <Field label="Phone">{volunteer.phone}</Field>
          <Field label="Preferred Contact">{CONTACT_LABELS[volunteer.preferred_contact] || volunteer.preferred_contact}</Field>
          <Field label="Submitted">{formatDate(volunteer.created_at)}</Field>
          <Field label="Museum Member">
            {volunteer.member_id ? (
              <span style={{ color: "#2D6A4F" }}>
                Yes{volunteer.member_name ? ` \u2014 ${volunteer.member_name}` : ""}
              </span>
            ) : (
              <span style={{ color: "rgba(26,19,17,0.4)" }}>No</span>
            )}
          </Field>
        </div>

        {/* Volunteer Preferences */}
        <div
          className="p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Volunteer Preferences
          </div>
          <Field label="Areas of Interest">
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <span
                  key={a}
                  className="inline-block font-body text-[11px] px-2.5 py-1 rounded-sm"
                  style={{ background: "rgba(196,163,90,0.1)", color: GOLD_ACCENT }}
                >
                  {AREA_LABELS[a] || a}
                </span>
              ))}
            </div>
          </Field>
          <Field label="Hours Per Month">{volunteer.hours_per_month}</Field>
          <Field label="Public Comfort Level">
            {volunteer.public_comfort_level ? (
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-sm font-body text-[13px] font-semibold"
                    style={{
                      background: n <= volunteer.public_comfort_level ? GOLD_ACCENT : "rgba(26,19,17,0.04)",
                      color: n <= volunteer.public_comfort_level ? WARM_BLACK : "rgba(26,19,17,0.2)",
                      border: n <= volunteer.public_comfort_level ? "none" : "1px solid rgba(26,19,17,0.08)",
                    }}
                  >
                    {n}
                  </span>
                ))}
                <span className="font-body text-[11px] ml-2" style={{ color: "rgba(26,19,17,0.4)" }}>/ 5</span>
              </div>
            ) : null}
          </Field>
          <Field label="Prior Museum / Docent Experience">
            {volunteer.prior_experience === true ? "Yes" : volunteer.prior_experience === false ? "No" : null}
          </Field>
        </div>
      </div>

      {/* Interest Reason */}
      {volunteer.interest_reason && (
        <div
          className="mt-6 p-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div
            className="font-body text-[11px] uppercase mb-3 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Why They Want to Volunteer
          </div>
          <p className="font-body text-[15px] leading-[1.7] m-0" style={{ color: "rgba(26,19,17,0.7)" }}>
            {volunteer.interest_reason}
          </p>
        </div>
      )}

      {/* Availability Grid */}
      <div
        className="mt-6 p-6"
        style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
      >
        <div
          className="font-body text-[11px] uppercase mb-4 font-semibold"
          style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
        >
          Availability
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: "400px" }}>
            <thead>
              <tr>
                <th className="text-left font-body text-[10px] uppercase font-semibold px-3 py-2" style={{ letterSpacing: "0.1em", color: MUTED_RED }}>Day</th>
                {TIMES.map((t) => (
                  <th key={t} className="text-center font-body text-[10px] uppercase font-semibold px-3 py-2" style={{ letterSpacing: "0.1em", color: MUTED_RED }}>
                    {TIME_LABELS[t]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} style={{ borderTop: "1px solid rgba(123,45,38,0.04)" }}>
                  <td className="px-3 py-2 font-body text-[13px] font-medium" style={{ color: WARM_BLACK }}>{day}</td>
                  {TIMES.map((t) => {
                    const checked = avail[day]?.[t];
                    return (
                      <td key={t} className="px-3 py-2 text-center">
                        {checked ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm" style={{ background: "rgba(45,106,79,0.12)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          </span>
                        ) : (
                          <span className="inline-block w-6 h-6 rounded-sm" style={{ background: "rgba(26,19,17,0.03)" }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
