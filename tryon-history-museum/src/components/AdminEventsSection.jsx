"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const fmt = (cents) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const cardStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.08)",
};

const inputStyle = {
  border: "1px solid rgba(26,19,17,0.2)",
  background: "#FFFDF9",
  color: WARM_BLACK,
};

const buttonStyle = {
  background: GOLD_ACCENT,
  color: WARM_BLACK,
  letterSpacing: "0.08em",
};

export default function AdminEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
      setEdits(
        Object.fromEntries(
          (data.events || []).map((e) => [
            e.id,
            {
              capacity: e.capacity,
              sales_enabled: e.sales_enabled,
              refund_policy: e.refund_policy || "",
            },
          ])
        )
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(slug, id) {
    setSaving(id);
    setMessage("");
    const e = edits[id];
    const res = await fetch(`/api/admin/events/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capacity: Number(e.capacity),
        sales_enabled: Boolean(e.sales_enabled),
        refund_policy: e.refund_policy || null,
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Saved." : data.error || "Save failed.");
    setSaving(null);
    if (res.ok) load();
  }

  return (
    <div className="p-8 md:p-10 max-w-[1200px]">
      <div className="mb-8">
        <div
          className="font-body text-[11px] uppercase mb-2"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          Ticketed Events
        </div>
        <h1 className="font-display text-3xl font-light m-0" style={{ color: WARM_BLACK }}>
          Events &amp; Registrations
        </h1>
        <p className="font-body text-sm mt-3 m-0" style={{ color: "rgba(26,19,17,0.55)" }}>
          Ticket sales stay closed until a capacity is set and sales are
          enabled. Set both to open online purchasing.
        </p>
      </div>

      {message && (
        <p className="font-body text-sm mb-4" style={{ color: DEEP_RED }}>
          {message}
        </p>
      )}

      {loading ? (
        <p className="font-body text-sm" style={{ color: "rgba(26,19,17,0.5)" }}>
          Loading…
        </p>
      ) : events.length === 0 ? (
        <p className="font-body text-sm" style={{ color: "rgba(26,19,17,0.5)" }}>
          No ticketed events yet. Run migration 018 to seed the December Wine
          Tasting event.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {events.map((ev) => {
            const e = edits[ev.id] || {};
            const s = ev.stats || {};
            return (
              <div key={ev.id} className="p-6 md:p-8" style={cardStyle}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Link
                      href={`/admin/events/${ev.slug}`}
                      className="font-display text-2xl font-normal no-underline"
                      style={{ color: WARM_BLACK }}
                    >
                      {ev.title}
                    </Link>
                    <p className="font-body text-sm mt-1 m-0" style={{ color: MUTED_RED }}>
                      {formatDate(ev.starts_at)} · {ev.venue_name || ""}
                    </p>
                  </div>
                  <Link
                    href={`/admin/events/${ev.slug}`}
                    className="font-body text-[11px] uppercase font-semibold no-underline px-4 py-2"
                    style={buttonStyle}
                  >
                    Registrations →
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {[
                    ["Seats sold", `${s.paidSeats ?? 0}`],
                    ["Pending", `${s.pendingSeats ?? 0}`],
                    ["Remaining", ev.capacity > 0 ? `${s.remaining ?? ev.capacity}` : "—"],
                    ["Gross revenue", fmt(s.grossCents ?? 0)],
                    ["Refunded", fmt(s.refundedCents ?? 0)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p
                        className="font-body text-[10px] uppercase m-0"
                        style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                      >
                        {label}
                      </p>
                      <p className="font-display text-2xl m-0 mt-1" style={{ color: WARM_BLACK }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-[120px_auto_1fr_auto] gap-4 items-end mt-6 pt-6" style={{ borderTop: "1px solid rgba(26,19,17,0.08)" }}>
                  <label className="block">
                    <span
                      className="block font-body text-[10px] uppercase mb-1"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      Capacity
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={e.capacity ?? 0}
                      onChange={(ev2) =>
                        setEdits((prev) => ({
                          ...prev,
                          [ev.id]: { ...prev[ev.id], capacity: ev2.target.value },
                        }))
                      }
                      className="font-body text-sm px-3 py-2 w-full"
                      style={inputStyle}
                    />
                  </label>
                  <label className="flex items-center gap-2 font-body text-sm pb-2" style={{ color: WARM_BLACK }}>
                    <input
                      type="checkbox"
                      checked={Boolean(e.sales_enabled)}
                      onChange={(ev2) =>
                        setEdits((prev) => ({
                          ...prev,
                          [ev.id]: { ...prev[ev.id], sales_enabled: ev2.target.checked },
                        }))
                      }
                    />
                    Ticket sales enabled
                  </label>
                  <label className="block">
                    <span
                      className="block font-body text-[10px] uppercase mb-1"
                      style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}
                    >
                      Refund policy (shown on page + confirmation email)
                    </span>
                    <input
                      type="text"
                      value={e.refund_policy ?? ""}
                      placeholder="Not set — section hidden until confirmed"
                      onChange={(ev2) =>
                        setEdits((prev) => ({
                          ...prev,
                          [ev.id]: { ...prev[ev.id], refund_policy: ev2.target.value },
                        }))
                      }
                      className="font-body text-sm px-3 py-2 w-full"
                      style={inputStyle}
                    />
                  </label>
                  <button
                    onClick={() => save(ev.slug, ev.id)}
                    disabled={saving === ev.id}
                    className="font-body text-[11px] uppercase font-semibold px-5 py-2.5 cursor-pointer border-none"
                    style={{ ...buttonStyle, opacity: saving === ev.id ? 0.6 : 1 }}
                  >
                    {saving === ev.id ? "Saving…" : "Save"}
                  </button>
                </div>
                {!ev.sales_enabled && (
                  <p className="font-body text-[12px] mt-4 m-0" style={{ color: MUTED_RED }}>
                    Sales are currently closed for this event.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
