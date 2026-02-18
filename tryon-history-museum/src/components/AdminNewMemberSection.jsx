"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { computeMembership } from "@/lib/membershipPricing";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";
const DEEP_RED = "#7B2D26";

const fieldStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.12)",
  color: WARM_BLACK,
};

const readOnlyFieldStyle = {
  ...fieldStyle,
  background: "rgba(196,163,90,0.06)",
  color: "rgba(26,19,17,0.55)",
};

const labelCls = "block font-body text-[10px] uppercase mb-1.5 font-semibold";
const labelStyle = { letterSpacing: "0.15em", color: MUTED_RED };

function tierLabel(t) {
  if (!t) return "—";
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function donorLabel(d) {
  if (!d || d === "none") return "None";
  return d.charAt(0).toUpperCase() + d.slice(1);
}
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function fmtCurrency(v) {
  const n = parseFloat(v) || 0;
  return "$" + n.toFixed(2);
}

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function AdminNewMemberSection() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Live computation from pricing utility
  const computed = useMemo(() => {
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return null;
    return computeMembership(amt, paymentDate);
  }, [paymentAmount, paymentDate]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const amt = parseFloat(paymentAmount) || 0;

    const payload = {
      ...form,
      join_date: paymentDate,
      payment_amount: amt > 0 ? amt : undefined,
      payment_date: amt > 0 ? paymentDate : undefined,
      payment_method: amt > 0 ? paymentMethod : undefined,
    };

    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/members/${data.member.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create member.");
      setSaving(false);
    }
  }

  const hasPayment = (parseFloat(paymentAmount) || 0) > 0;
  const summaryColor = computed
    ? computed.belowMinimum ? DEEP_RED
      : computed.donorClass === "steward" ? "#6B4F1D"
      : computed.donorClass === "patron" || computed.donorClass === "donor" ? GOLD_ACCENT
      : "#2D6A4F"
    : null;

  return (
    <div className="p-8 md:p-10 max-w-[900px]">
      <Link
        href="/admin/members"
        className="inline-block font-body text-[12px] uppercase no-underline mb-6 hover:underline"
        style={{ letterSpacing: "0.1em", color: MUTED_RED }}
      >
        ← Back to Members
      </Link>

      <div className="mb-8">
        <div
          className="font-body text-[11px] uppercase mb-2"
          style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}
        >
          New Member
        </div>
        <h1
          className="font-display text-3xl font-light m-0"
          style={{ color: WARM_BLACK }}
        >
          Add Member
        </h1>
      </div>

      {/* Info note */}
      <div
        className="p-4 mb-6"
        style={{
          background: "rgba(27,42,74,0.04)",
          border: "1px solid rgba(27,42,74,0.1)",
        }}
      >
        <p className="font-body text-[13px] m-0" style={{ color: "rgba(26,19,17,0.6)" }}>
          Adding a member here creates their database record. They will receive login
          access when they register online or when you send them an invitation. (Phase 5)
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal info */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelCls} style={labelStyle}>First Name *</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Last Name *</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} style={labelStyle}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {/* Payment & Membership Calculation */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "#FFFDF9", border: `1px solid ${hasPayment && computed && !computed.belowMinimum ? "rgba(196,163,90,0.2)" : "rgba(123,45,38,0.08)"}` }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Payment & Membership
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <div>
              <label className={labelCls} style={labelStyle}>Last Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer"
                style={fieldStyle}
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="stripe">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Live Calculation Summary */}
          {computed && (
            <div
              className="p-5 md:p-6"
              style={{
                background: computed.belowMinimum ? "rgba(123,45,38,0.03)" : "rgba(196,163,90,0.04)",
                border: `1px solid ${summaryColor}18`,
                borderLeft: `3px solid ${summaryColor}`,
              }}
            >
              <div className="font-body text-[11px] uppercase mb-3 font-semibold" style={{ letterSpacing: "0.12em", color: summaryColor }}>
                Membership Summary
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Payment Date</span>
                  <span style={{ color: WARM_BLACK }}>{fmtDate(paymentDate)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Amount Paid</span>
                  <span className="font-semibold" style={{ color: WARM_BLACK }}>{fmtCurrency(paymentAmount)}</span>
                </div>
              </div>

              <div className="my-3" style={{ borderTop: "1px solid rgba(26,19,17,0.08)" }} />

              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Membership Fee ({computed.pricingLabel})</span>
                  <span style={{ color: WARM_BLACK }}>{fmtCurrency(computed.membershipFee)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Additional Donation</span>
                  <span style={{ color: computed.additionalDonation > 0 ? GOLD_ACCENT : "rgba(26,19,17,0.4)" }}>{fmtCurrency(computed.additionalDonation)}</span>
                </div>
              </div>

              <div className="my-3" style={{ borderTop: "1px solid rgba(26,19,17,0.08)" }} />

              <div className="space-y-1.5">
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Tier</span>
                  <span className="font-semibold" style={{ color: WARM_BLACK }}>{tierLabel(computed.membershipTier)} Membership</span>
                </div>
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Donor Class</span>
                  <span style={{ color: WARM_BLACK }}>{donorLabel(computed.donorClass)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px]" style={{ color: "rgba(26,19,17,0.6)" }}>
                  <span>Membership Valid Through</span>
                  <span style={{ color: WARM_BLACK }}>{fmtDate(computed.expirationDate)}</span>
                </div>
              </div>

              {computed.belowMinimum && (
                <div className="mt-3 p-3" style={{ background: "rgba(123,45,38,0.05)" }}>
                  <p className="font-body text-[13px] m-0" style={{ color: DEEP_RED }}>{computed.note}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div>
            <label className={labelCls} style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full font-body text-sm px-3 py-2 outline-none resize-y"
              style={fieldStyle}
              placeholder="Optional notes about this member"
            />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm mb-4" style={{ color: "#c53030" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="font-body text-[13px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
          style={{
            letterSpacing: "0.12em",
            color: WARM_BLACK,
            background: GOLD_ACCENT,
            padding: "14px 36px",
            border: "none",
          }}
        >
          {saving ? "Creating…" : "Create Member"}
        </button>
      </form>
    </div>
  );
}
