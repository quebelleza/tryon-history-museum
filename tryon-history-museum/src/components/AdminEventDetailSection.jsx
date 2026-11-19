"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

const fmt = (cents) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  paid: { bg: "rgba(45,106,79,0.1)", color: "#2D6A4F" },
  comp: { bg: "rgba(27,42,74,0.1)", color: "#1B2A4A" },
  pending: { bg: "rgba(184,134,11,0.1)", color: "#B8860B" },
  refunded: { bg: "rgba(123,45,38,0.1)", color: DEEP_RED },
  cancelled: { bg: "rgba(26,19,17,0.06)", color: "#888" },
};

const cardStyle = { background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" };
const inputStyle = { border: "1px solid rgba(26,19,17,0.2)", background: "#FFFDF9", color: WARM_BLACK };
const buttonStyle = { background: GOLD_ACCENT, color: WARM_BLACK, letterSpacing: "0.08em" };

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="inline-block font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm"
      style={{ background: s.bg, color: s.color, letterSpacing: "0.05em" }}
    >
      {status}
    </span>
  );
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export default function AdminEventDetailSection({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busy, setBusy] = useState(null);

  // Comp / offline registration form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", email: "", phone: "", method: "comp", notes: "",
    singleQty: 0, coupleQty: 0, singleNames: [""], coupleNames: ["", ""],
  });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/events/${slug}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, [slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.orders || []).filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        o.purchaser_name, o.purchaser_email, o.purchaser_phone,
        ...(o.event_order_attendees || []).map((a) => a.full_name),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [data, search, statusFilter]);

  async function orderAction(id, action, extra = {}) {
    setBusy(id + action);
    setActionMsg("");
    const res = await fetch(`/api/admin/event-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const d = await res.json();
    setActionMsg(res.ok ? "Done." : d.error || "Action failed.");
    setBusy(null);
    if (res.ok) load();
  }

  async function resendConfirmation(id) {
    setBusy(id + "resend");
    setActionMsg("");
    const res = await fetch(`/api/admin/event-orders/${id}/resend-confirmation`, { method: "POST" });
    const d = await res.json();
    setActionMsg(res.ok ? "Confirmation resent." : d.error || "Resend failed.");
    setBusy(null);
    if (res.ok) load();
  }

  async function toggleCheckIn(attendeeId, checked) {
    await fetch(`/api/admin/event-attendees/${attendeeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked_in: checked }),
    });
    load();
  }

  function exportCsv() {
    const rows = [["Purchaser", "Email", "Phone", "Attendee", "Ticket", "Status", "Amount", "Checked In", "Order Date", "Stripe Session"]];
    for (const o of filtered) {
      for (const a of o.event_order_attendees || []) {
        const item = (o.event_order_items || []).find((i) => i.id === a.order_item_id);
        rows.push([
          o.purchaser_name, o.purchaser_email, o.purchaser_phone,
          a.full_name, item?.ticket_label || "",
          o.status, (o.amount_cents / 100).toFixed(2),
          a.checked_in_at ? "Yes" : "",
          new Date(o.created_at).toLocaleDateString("en-US"),
          o.stripe_session_id || o.payment_method,
        ]);
      }
      if (!(o.event_order_attendees || []).length) {
        rows.push([o.purchaser_name, o.purchaser_email, o.purchaser_phone, "", "", o.status, (o.amount_cents / 100).toFixed(2), "", new Date(o.created_at).toLocaleDateString("en-US"), o.stripe_session_id || o.payment_method]);
      }
    }
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function submitAdd(e) {
    e.preventDefault();
    setActionMsg("");
    const items = [];
    const types = data?.ticketTypes || [];
    const singleType = types.find((t) => t.code === "single");
    const coupleType = types.find((t) => t.code === "couple");
    if (Number(addForm.singleQty) > 0 && singleType) {
      items.push({ code: "single", quantity: Number(addForm.singleQty), attendees: addForm.singleNames.slice(0, Number(addForm.singleQty)) });
    }
    if (Number(addForm.coupleQty) > 0 && coupleType) {
      items.push({ code: "couple", quantity: Number(addForm.coupleQty), attendees: addForm.coupleNames.slice(0, Number(addForm.coupleQty) * 2) });
    }
    if (!items.length) { setActionMsg("Select at least one ticket."); return; }
    const res = await fetch("/api/admin/event-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_slug: slug,
        purchaser: { name: addForm.name, email: addForm.email, phone: addForm.phone },
        payment_method: addForm.method,
        items,
        notes: addForm.notes || undefined,
      }),
    });
    const d = await res.json();
    setActionMsg(res.ok ? "Registration added." : d.error || "Failed.");
    if (res.ok) { setShowAdd(false); load(); }
  }

  if (loading) return <div className="p-8 md:p-10"><p className="font-body text-sm" style={{ color: "rgba(26,19,17,0.5)" }}>Loading…</p></div>;
  if (!data?.event) return <div className="p-8 md:p-10"><p className="font-body text-sm" style={{ color: DEEP_RED }}>Event not found.</p></div>;

  const { event, ticketTypes, stats } = data;

  return (
    <div className="p-8 md:p-10 max-w-[1400px]">
      <Link href="/admin/events" className="font-body text-[12px] no-underline" style={{ color: MUTED_RED }}>
        ← All events
      </Link>
      <div className="mt-3 mb-8">
        <div className="font-body text-[11px] uppercase mb-2" style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}>
          Registrations
        </div>
        <h1 className="font-display text-3xl font-light m-0" style={{ color: WARM_BLACK }}>
          {event.title}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 p-5" style={cardStyle}>
        {[
          ["Seats sold", stats.paidSeats],
          ["Pending holds", stats.pendingSeats],
          ["Capacity", event.capacity > 0 ? event.capacity : "—"],
          ["Remaining", event.capacity > 0 ? stats.remaining : "—"],
          ["Gross", fmt(stats.grossCents)],
          ["Refunded", fmt(stats.refundedCents)],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="font-body text-[10px] uppercase m-0" style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.45)" }}>{label}</p>
            <p className="font-display text-2xl m-0 mt-1" style={{ color: WARM_BLACK }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="search"
          placeholder="Search name, email, attendee…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-body text-[13px] px-4 py-2 outline-none w-[260px]"
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body text-[13px] px-3 py-2"
          style={inputStyle}
        >
          <option value="">All statuses</option>
          {["paid", "comp", "pending", "refunded", "cancelled"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button onClick={exportCsv} className="font-body text-[11px] uppercase font-semibold px-4 py-2 cursor-pointer border-none" style={buttonStyle}>
          Export CSV
        </button>
        <button onClick={() => setShowAdd(!showAdd)} className="font-body text-[11px] uppercase font-semibold px-4 py-2 cursor-pointer border-none" style={buttonStyle}>
          + Comp / Offline
        </button>
      </div>

      {actionMsg && <p className="font-body text-sm mb-4" style={{ color: DEEP_RED }}>{actionMsg}</p>}

      {/* Comp / offline form */}
      {showAdd && (
        <form onSubmit={submitAdd} className="mb-8 p-6" style={cardStyle}>
          <p className="font-body text-[11px] uppercase mb-4 font-semibold" style={{ letterSpacing: "0.15em", color: DEEP_RED }}>
            Record a complimentary or offline registration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input required placeholder="Purchaser name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} className="font-body text-sm px-3 py-2" style={inputStyle} />
            <input required type="email" placeholder="Email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} className="font-body text-sm px-3 py-2" style={inputStyle} />
            <input required placeholder="Phone" value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} className="font-body text-sm px-3 py-2" style={inputStyle} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <label className="font-body text-sm" style={{ color: WARM_BLACK }}>
              Payment
              <select value={addForm.method} onChange={(e) => setAddForm((f) => ({ ...f, method: e.target.value }))} className="mt-1 w-full font-body text-sm px-3 py-2" style={inputStyle}>
                <option value="comp">Complimentary</option>
                <option value="offline">Offline (cash / check)</option>
              </select>
            </label>
            <label className="font-body text-sm" style={{ color: WARM_BLACK }}>
              Single tickets
              <select value={addForm.singleQty} onChange={(e) => setAddForm((f) => ({ ...f, singleQty: e.target.value }))} className="mt-1 w-full font-body text-sm px-3 py-2" style={inputStyle}>
                {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="font-body text-sm" style={{ color: WARM_BLACK }}>
              Couples tickets
              <select value={addForm.coupleQty} onChange={(e) => setAddForm((f) => ({ ...f, coupleQty: e.target.value }))} className="mt-1 w-full font-body text-sm px-3 py-2" style={inputStyle}>
                {[0, 1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          {Number(addForm.singleQty) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {Array.from({ length: Number(addForm.singleQty) }, (_, i) => (
                <input key={i} required placeholder={`Guest ${i + 1} (single)`} value={addForm.singleNames[i] || ""}
                  onChange={(e) => setAddForm((f) => { const n = [...f.singleNames]; n[i] = e.target.value; return { ...f, singleNames: n }; })}
                  className="font-body text-sm px-3 py-2" style={inputStyle} />
              ))}
            </div>
          )}
          {Number(addForm.coupleQty) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {Array.from({ length: Number(addForm.coupleQty) * 2 }, (_, i) => (
                <input key={i} required placeholder={`Guest ${i + 1} (couple)`} value={addForm.coupleNames[i] || ""}
                  onChange={(e) => setAddForm((f) => { const n = [...f.coupleNames]; n[i] = e.target.value; return { ...f, coupleNames: n }; })}
                  className="font-body text-sm px-3 py-2" style={inputStyle} />
              ))}
            </div>
          )}
          <input placeholder="Notes (optional)" value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} className="mb-4 w-full font-body text-sm px-3 py-2" style={inputStyle} />
          <button type="submit" className="font-body text-[11px] uppercase font-semibold px-5 py-2.5 cursor-pointer border-none" style={buttonStyle}>
            Add Registration
          </button>
        </form>
      )}

      {/* Orders */}
      <div className="flex flex-col gap-5">
        {filtered.length === 0 && (
          <p className="font-body text-sm" style={{ color: "rgba(26,19,17,0.5)" }}>No registrations match.</p>
        )}
        {filtered.map((o) => (
          <div key={o.id} className="p-5 md:p-6" style={cardStyle}>
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="font-body text-base font-semibold m-0" style={{ color: WARM_BLACK }}>
                  {o.purchaser_name} <StatusBadge status={o.status} />
                </p>
                <p className="font-body text-[13px] m-0 mt-1" style={{ color: "rgba(26,19,17,0.55)" }}>
                  {o.purchaser_email} · {o.purchaser_phone}
                </p>
                <p className="font-body text-[12px] m-0 mt-1" style={{ color: "rgba(26,19,17,0.4)" }}>
                  {(o.event_order_items || []).map((i) => `${i.quantity}× ${i.ticket_label}`).join(" · ")} · {fmt(o.amount_cents)} · {o.payment_method}
                  {o.amount_refunded_cents > 0 && ` · refunded ${fmt(o.amount_refunded_cents)}`}
                  {" · "}{new Date(o.created_at).toLocaleDateString("en-US")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(o.status === "paid" || o.status === "comp") && (
                  <button onClick={() => resendConfirmation(o.id)} disabled={busy} className="font-body text-[10px] uppercase font-semibold px-3 py-1.5 cursor-pointer border" style={{ ...inputStyle, letterSpacing: "0.08em" }}>
                    Resend Email
                  </button>
                )}
                {o.status === "paid" && (
                  <button
                    onClick={() => {
                      const note = o.payment_method === "stripe"
                        ? window.confirm("Record this order as refunded? For Stripe payments, issue the actual refund in the Stripe Dashboard — the webhook will reconcile automatically.") && true
                        : window.confirm("Record this order as refunded?") && true;
                      if (note) orderAction(o.id, "mark_refunded");
                    }}
                    disabled={busy}
                    className="font-body text-[10px] uppercase font-semibold px-3 py-1.5 cursor-pointer border"
                    style={{ ...inputStyle, letterSpacing: "0.08em", color: DEEP_RED }}
                  >
                    Mark Refunded
                  </button>
                )}
                {(o.status === "pending" || o.status === "comp") && (
                  <button
                    onClick={() => { if (window.confirm("Cancel this order? Seats will be released.")) orderAction(o.id, "cancel"); }}
                    disabled={busy}
                    className="font-body text-[10px] uppercase font-semibold px-3 py-1.5 cursor-pointer border"
                    style={{ ...inputStyle, letterSpacing: "0.08em", color: DEEP_RED }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            {/* Attendees */}
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(26,19,17,0.08)" }}>
              {(o.event_order_attendees || []).map((a) => {
                const item = (o.event_order_items || []).find((i) => i.id === a.order_item_id);
                return (
                  <label key={a.id} className="flex items-center gap-3 py-1 font-body text-sm" style={{ color: WARM_BLACK }}>
                    <input
                      type="checkbox"
                      checked={Boolean(a.checked_in_at)}
                      disabled={o.status !== "paid" && o.status !== "comp"}
                      onChange={(e) => toggleCheckIn(a.id, e.target.checked)}
                    />
                    <span className={a.checked_in_at ? "line-through opacity-60" : ""}>
                      {a.full_name}
                    </span>
                    <span className="font-body text-[11px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                      {item?.ticket_label || ""}
                      {a.checked_in_at ? ` · checked in ${new Date(a.checked_in_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}
                    </span>
                  </label>
                );
              })}
            </div>
            {!o.email_sent_at && (o.status === "paid" || o.status === "comp") && (
              <p className="font-body text-[11px] m-0 mt-2" style={{ color: MUTED_RED }}>
                Confirmation email not yet sent — use “Resend Email”.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
