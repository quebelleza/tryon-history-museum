"use client";

import { useState, useEffect } from "react";
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
  coordination: "Volunteer Coordination",
  visitor_center: "Visitor Center / Gift Shop",
  events: "Special Events",
  other: "Not Sure / Other",
};

const STATUSES = ["new", "contacted", "active", "inactive"];
const AREAS = ["docent", "exhibits", "coordination", "visitor_center", "events", "other"];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span
      className="inline-block font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.05em" }}
    >
      {s.label}
    </span>
  );
}

export default function AdminVolunteersSection() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterArea, setFilterArea] = useState("");

  async function loadVolunteers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    if (filterArea) params.set("area", filterArea);

    const res = await fetch(`/api/admin/volunteers?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setVolunteers(data.volunteers || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadVolunteers();
  }, [filterStatus, filterArea]);

  function handleSearch(e) {
    e.preventDefault();
    loadVolunteers();
  }

  async function handleStatusChange(id, newStatus) {
    const res = await fetch(`/api/admin/volunteers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setVolunteers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
      );
    }
  }

  return (
    <div className="p-8 md:p-10 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <div
          className="font-body text-[11px] uppercase mb-2"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          Volunteer Management
        </div>
        <h1
          className="font-display text-3xl font-light m-0"
          style={{ color: WARM_BLACK }}
        >
          Volunteers
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="font-body text-[13px] px-4 py-2 outline-none transition-all focus:ring-2 w-[260px]"
            style={{
              background: "#FFFDF9",
              border: "1px solid rgba(123,45,38,0.12)",
              color: WARM_BLACK,
            }}
          />
          <button
            type="submit"
            className="font-body text-[11px] uppercase font-semibold px-4 py-2 cursor-pointer transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.08em",
              background: GOLD_ACCENT,
              color: WARM_BLACK,
              border: "none",
            }}
          >
            Search
          </button>
        </form>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="font-body text-[13px] px-3 py-2 outline-none cursor-pointer"
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(123,45,38,0.12)",
            color: WARM_BLACK,
          }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
          ))}
        </select>

        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="font-body text-[13px] px-3 py-2 outline-none cursor-pointer"
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(123,45,38,0.12)",
            color: WARM_BLACK,
          }}
        >
          <option value="">All Areas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{AREA_LABELS[a]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
      >
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(123,45,38,0.08)" }}>
              {["Name", "Email", "Phone", "Areas of Interest", "Hours/Mo", "Status", "Submitted", "Member"].map((h) => (
                <th
                  key={h}
                  className="text-left font-body text-[10px] uppercase font-semibold px-4 py-3"
                  style={{ letterSpacing: "0.1em", color: MUTED_RED }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                  Loading…
                </td>
              </tr>
            ) : volunteers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                  No volunteers found.
                </td>
              </tr>
            ) : (
              volunteers.map((v) => (
                <tr
                  key={v.id}
                  className="transition-colors hover:bg-[rgba(196,163,90,0.03)]"
                  style={{ borderBottom: "1px solid rgba(123,45,38,0.04)" }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/volunteers/${v.id}`}
                      className="font-body text-[13px] font-semibold no-underline hover:underline"
                      style={{ color: WARM_BLACK }}
                    >
                      {v.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-[12px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {v.email}
                  </td>
                  <td className="px-4 py-3 font-body text-[12px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {v.phone}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(v.volunteer_areas || []).slice(0, 2).map((a) => (
                        <span
                          key={a}
                          className="font-body text-[10px] px-1.5 py-0.5 rounded-sm"
                          style={{ background: "rgba(196,163,90,0.1)", color: GOLD_ACCENT }}
                        >
                          {AREA_LABELS[a] || a}
                        </span>
                      ))}
                      {(v.volunteer_areas || []).length > 2 && (
                        <span className="font-body text-[10px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                          +{v.volunteer_areas.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-[12px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {v.hours_per_month || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      className="font-body text-[11px] uppercase font-semibold px-2 py-1 outline-none cursor-pointer rounded-sm"
                      style={{
                        background: STATUS_STYLES[v.status]?.bg || "rgba(26,19,17,0.06)",
                        color: STATUS_STYLES[v.status]?.color || "#888",
                        border: "none",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-body text-[12px] whitespace-nowrap" style={{ color: "rgba(26,19,17,0.5)" }}>
                    {formatDate(v.created_at)}
                  </td>
                  <td className="px-4 py-3 font-body text-[12px] text-center" style={{ color: v.member_id ? "#2D6A4F" : "rgba(26,19,17,0.3)" }}>
                    {v.member_id ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
