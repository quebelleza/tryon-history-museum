"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      className="inline-block font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm whitespace-nowrap"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.05em" }}
    >
      {s.label}
    </span>
  );
}

function tierLabel(t) {
  if (!t) return "—";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function donorLabel(d) {
  if (!d || d === "none") return "—";
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export default function AdminMembersSection() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [donorFilter, setDonorFilter] = useState("");
  const [sortBy, setSortBy] = useState("last_name");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (tierFilter) params.set("tier", tierFilter);
    if (donorFilter) params.set("donorClass", donorFilter);
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", page.toString());

    const res = await fetch(`/api/admin/members?${params}`);
    const data = await res.json();
    setMembers(data.members || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [search, statusFilter, tierFilter, donorFilter, sortBy, sortDir, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, tierFilter, donorFilter]);

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  const sortArrow = (col) => {
    if (sortBy !== col) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const selectStyle = {
    background: "#FFFDF9",
    border: "1px solid rgba(123,45,38,0.12)",
    color: WARM_BLACK,
  };

  return (
    <div className="p-8 md:p-10 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div
            className="font-body text-[11px] uppercase mb-2"
            style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
          >
            Member Management
          </div>
          <h1 className="font-display text-3xl font-light m-0" style={{ color: WARM_BLACK }}>
            All Members
            <span className="font-body text-[14px] font-normal ml-3" style={{ color: "rgba(26,19,17,0.4)" }}>
              ({total})
            </span>
          </h1>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-block font-body text-[12px] font-semibold uppercase no-underline transition-all hover:brightness-110"
          style={{
            letterSpacing: "0.1em",
            color: WARM_BLACK,
            background: GOLD_ACCENT,
            padding: "10px 22px",
          }}
        >
          + Add Member
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-body text-sm px-4 py-2.5 outline-none flex-1 min-w-[200px]"
          style={{ ...selectStyle }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body text-[13px] px-3 py-2.5 outline-none cursor-pointer"
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="font-body text-[13px] px-3 py-2.5 outline-none cursor-pointer"
          style={selectStyle}
        >
          <option value="">All Tiers</option>
          <option value="individual">Individual</option>
          <option value="family">Family</option>
        </select>
        <select
          value={donorFilter}
          onChange={(e) => setDonorFilter(e.target.value)}
          className="font-body text-[13px] px-3 py-2.5 outline-none cursor-pointer"
          style={selectStyle}
        >
          <option value="">All Donor Classes</option>
          <option value="none">None</option>
          <option value="donor">Donor</option>
          <option value="patron">Patron</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(123,45,38,0.08)" }}>
              {[
                { key: "last_name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "membership_tier", label: "Tier" },
                { key: "donor_class", label: "Donor Class" },
                { key: "status", label: "Status" },
                { key: "expiration_date", label: "Exp. Date" },
                { key: null, label: "Actions" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`text-left font-body text-[10px] uppercase font-semibold px-4 py-3 ${col.key ? "cursor-pointer select-none" : ""}`}
                  style={{ letterSpacing: "0.12em", color: MUTED_RED }}
                  onClick={() => col.key && toggleSort(col.key)}
                >
                  {col.label}
                  {col.key && sortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                  Loading…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-[rgba(196,163,90,0.03)]"
                  style={{ borderBottom: "1px solid rgba(123,45,38,0.04)" }}
                >
                  <td className="px-4 py-3 font-body text-[13px] font-semibold" style={{ color: WARM_BLACK }}>
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-4 py-3 font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {m.email}
                  </td>
                  <td className="px-4 py-3 font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {tierLabel(m.membership_tier)}
                  </td>
                  <td className="px-4 py-3 font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {donorLabel(m.donor_class)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {formatDate(m.expiration_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="font-body text-[11px] uppercase font-semibold no-underline hover:underline"
                        style={{ letterSpacing: "0.05em", color: GOLD_ACCENT }}
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="font-body text-[11px] uppercase font-semibold no-underline hover:underline"
                        style={{ letterSpacing: "0.05em", color: MUTED_RED }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id, `${m.first_name} ${m.last_name}`)}
                        className="font-body text-[11px] uppercase font-semibold bg-transparent border-none cursor-pointer hover:underline"
                        style={{ letterSpacing: "0.05em", color: DEEP_RED }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.4)" }}>
            Page {page} of {totalPages} · {total} total members
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="font-body text-[12px] uppercase font-semibold px-4 py-2 cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.12)", color: WARM_BLACK, letterSpacing: "0.05em" }}
            >
              ← Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="font-body text-[12px] uppercase font-semibold px-4 py-2 cursor-pointer disabled:opacity-30 disabled:cursor-default"
              style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.12)", color: WARM_BLACK, letterSpacing: "0.05em" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
