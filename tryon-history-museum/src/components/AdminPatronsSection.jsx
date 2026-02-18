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

export default function AdminPatronsSection() {
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null); // patron id or null
  const [assignName, setAssignName] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  useEffect(() => {
    loadPatrons();
  }, []);

  async function loadPatrons() {
    const res = await fetch("/api/admin/members?donorClass=patron&perPage=100");
    const data = await res.json();

    // For each patron, fetch their detail (includes assignments + payments)
    const enriched = await Promise.all(
      (data.members || []).map(async (m) => {
        const detailRes = await fetch(`/api/admin/members/${m.id}`);
        const detail = await detailRes.json();
        const totalDonations = (detail.payments || []).reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        );
        const latestAssignment = (detail.assignments || [])[0] || null;
        return {
          ...m,
          totalDonations,
          boardMember: latestAssignment?.board_member_name || null,
          lastNotes: latestAssignment?.notes || null,
          assignmentId: latestAssignment?.id || null,
        };
      })
    );

    setPatrons(enriched);
    setLoading(false);
  }

  function openAssignModal(patron) {
    setAssignModal(patron.id);
    setAssignName(patron.boardMember || "");
    setAssignNotes(patron.lastNotes || "");
  }

  async function handleAssignSave() {
    setAssignSaving(true);
    const patron = patrons.find((p) => p.id === assignModal);

    if (patron?.assignmentId) {
      // Update existing
      await fetch("/api/admin/board-assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: patron.assignmentId,
          board_member_name: assignName,
          notes: assignNotes,
        }),
      });
    } else {
      // Create new
      await fetch("/api/admin/board-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: assignModal,
          board_member_name: assignName,
          assigned_date: new Date().toISOString().split("T")[0],
          notes: assignNotes,
        }),
      });
    }

    setAssignModal(null);
    setAssignSaving(false);
    // Reload
    setLoading(true);
    loadPatrons();
  }

  if (loading) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>
          Loading patrons…
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <div
          className="font-body text-[11px] uppercase mb-2"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          Patron Management
        </div>
        <h1
          className="font-display text-3xl font-light m-0"
          style={{ color: WARM_BLACK }}
        >
          Patron Relationships
          <span
            className="font-body text-[14px] font-normal ml-3"
            style={{ color: "rgba(26,19,17,0.4)" }}
          >
            ({patrons.length})
          </span>
        </h1>
      </div>

      {patrons.length === 0 ? (
        <div
          className="p-10 text-center"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.4)" }}>
            No patron members yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {patrons.map((p) => (
            <div
              key={p.id}
              className="p-6 md:p-7"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(196,163,90,0.12)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <Link
                    href={`/admin/members/${p.id}`}
                    className="font-display text-xl font-semibold no-underline hover:underline"
                    style={{ color: WARM_BLACK }}
                  >
                    {p.first_name} {p.last_name}
                  </Link>
                  <div
                    className="inline-block ml-2 font-body text-[9px] uppercase font-semibold px-2 py-0.5 rounded-sm"
                    style={{
                      background: "rgba(196,163,90,0.12)",
                      color: GOLD_ACCENT,
                      letterSpacing: "0.08em",
                    }}
                  >
                    Patron
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="font-body text-[10px] uppercase" style={{ color: MUTED_RED, letterSpacing: "0.12em", width: 90 }}>
                    Email
                  </span>
                  <span className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                    {p.email}
                  </span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] uppercase" style={{ color: MUTED_RED, letterSpacing: "0.12em", width: 90 }}>
                      Phone
                    </span>
                    <span className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                      {p.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-body text-[10px] uppercase" style={{ color: MUTED_RED, letterSpacing: "0.12em", width: 90 }}>
                    Donations
                  </span>
                  <span className="font-body text-[13px] font-semibold" style={{ color: WARM_BLACK }}>
                    ${p.totalDonations.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-[10px] uppercase" style={{ color: MUTED_RED, letterSpacing: "0.12em", width: 90 }}>
                    Board Rep
                  </span>
                  <span className="font-body text-[13px]" style={{ color: p.boardMember ? WARM_BLACK : "rgba(26,19,17,0.3)" }}>
                    {p.boardMember || "Unassigned"}
                  </span>
                </div>
                {p.lastNotes && (
                  <div className="flex items-start gap-2">
                    <span className="font-body text-[10px] uppercase pt-0.5" style={{ color: MUTED_RED, letterSpacing: "0.12em", width: 90, flexShrink: 0 }}>
                      Notes
                    </span>
                    <span className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.45)" }}>
                      {p.lastNotes}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => openAssignModal(p)}
                className="font-body text-[11px] uppercase font-semibold bg-transparent cursor-pointer transition-all hover:brightness-110"
                style={{
                  letterSpacing: "0.08em",
                  color: GOLD_ACCENT,
                  border: `1px solid ${GOLD_ACCENT}`,
                  padding: "7px 16px",
                }}
              >
                {p.boardMember ? "Reassign Board Member" : "Assign Board Member"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,19,17,0.5)" }}
          onClick={() => setAssignModal(null)}
        >
          <div
            className="w-full max-w-[440px] p-8 mx-4"
            style={{ background: "#FAF7F4", border: "1px solid rgba(196,163,90,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="font-body text-[11px] uppercase mb-4 font-semibold"
              style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
            >
              Assign Board Member
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  className="block font-body text-[10px] uppercase mb-1.5 font-semibold"
                  style={{ letterSpacing: "0.15em", color: MUTED_RED }}
                >
                  Board Member Name
                </label>
                <input
                  type="text"
                  value={assignName}
                  onChange={(e) => setAssignName(e.target.value)}
                  className="w-full font-body text-sm px-3 py-2 outline-none"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.12)",
                    color: WARM_BLACK,
                  }}
                  placeholder="Enter board member name"
                />
              </div>
              <div>
                <label
                  className="block font-body text-[10px] uppercase mb-1.5 font-semibold"
                  style={{ letterSpacing: "0.15em", color: MUTED_RED }}
                >
                  Notes
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                  className="w-full font-body text-sm px-3 py-2 outline-none resize-y"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(123,45,38,0.12)",
                    color: WARM_BLACK,
                  }}
                  placeholder="Last contact date, conversation notes, etc."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignSave}
                disabled={assignSaving || !assignName.trim()}
                className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
                style={{
                  letterSpacing: "0.1em",
                  color: WARM_BLACK,
                  background: GOLD_ACCENT,
                  padding: "10px 22px",
                  border: "none",
                }}
              >
                {assignSaving ? "Saving…" : "Save Assignment"}
              </button>
              <button
                onClick={() => setAssignModal(null)}
                className="font-body text-[12px] uppercase cursor-pointer"
                style={{
                  letterSpacing: "0.08em",
                  color: "rgba(26,19,17,0.5)",
                  background: "transparent",
                  border: "1px solid rgba(26,19,17,0.15)",
                  padding: "10px 22px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
