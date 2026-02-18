"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

/**
 * Smart auto-labeling: given a payment amount, return the computed fields.
 */
function computeFromAmount(amount) {
  const amt = parseFloat(amount) || 0;
  if (amt >= 1000) return { membership_tier: "family", donor_class: "steward", member_label: "steward", effective_access_tier: "family" };
  if (amt >= 250)  return { membership_tier: "family", donor_class: "patron",  member_label: "patron",  effective_access_tier: "family" };
  if (amt >= 76)   return { membership_tier: "family", donor_class: "donor",   member_label: "donor",   effective_access_tier: "family" };
  if (amt >= 51)   return { membership_tier: "family", donor_class: "none",    member_label: "member",  effective_access_tier: "family" };
  if (amt >= 50)   return { membership_tier: "individual", donor_class: "none", member_label: "member", effective_access_tier: "individual" };
  return null;
}

function getSummaryMessage(amount) {
  const amt = parseFloat(amount) || 0;
  if (amt >= 1000) return "This generous contribution qualifies for Steward recognition with Family-level access — our highest level of support.";
  if (amt >= 250)  return "This contribution qualifies for Patron membership with Family-level access.";
  if (amt >= 76)   return "This contribution qualifies for Donor membership with Family-level access.";
  if (amt >= 51)   return "This qualifies for a Family membership.";
  if (amt >= 50)   return "This qualifies for an Individual membership.";
  if (amt > 0)     return "Amount is below the minimum $50 membership. Please adjust.";
  return null;
}

function getSummaryColor(amount) {
  const amt = parseFloat(amount) || 0;
  if (amt >= 1000) return "#6B4F1D";
  if (amt >= 250)  return GOLD_ACCENT;
  if (amt >= 50)   return "#2D6A4F";
  if (amt > 0)     return DEEP_RED;
  return null;
}

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  membership_tier: "individual",
  donor_class: "none",
  member_label: "member",
  effective_access_tier: "individual",
  status: "active",
  join_date: new Date().toISOString().split("T")[0],
  expiration_date: "",
  notes: "",
};

export default function AdminNewMemberSection() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePaymentAmountChange(value) {
    setPaymentAmount(value);
    const computed = computeFromAmount(value);
    if (computed) {
      setForm((prev) => ({ ...prev, ...computed }));
    }
  }

  // Auto-set expiration to 1 year from join date
  function handleJoinDateChange(value) {
    setForm((prev) => {
      const exp = new Date(value + "T12:00:00");
      exp.setFullYear(exp.getFullYear() + 1);
      return {
        ...prev,
        join_date: value,
        expiration_date: exp.toISOString().split("T")[0],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Server-side validation: recompute from payment amount
    const amt = parseFloat(paymentAmount) || 0;
    if (amt > 0 && amt < 50) {
      setError("Payment amount must be at least $50 for membership.");
      setSaving(false);
      return;
    }

    const computed = amt > 0 ? computeFromAmount(paymentAmount) : {};
    const payload = { ...form, ...computed };
    // Remove fields not in the members table
    delete payload.effective_access_tier;

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

  const summaryMsg = getSummaryMessage(paymentAmount);
  const summaryColor = getSummaryColor(paymentAmount);
  const hasAutoLabeled = parseFloat(paymentAmount) >= 50;

  function tierLabel(t) {
    if (!t) return "—";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function donorLabel(d) {
    if (!d || d === "none") return "None";
    return d.charAt(0).toUpperCase() + d.slice(1);
  }

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

        {/* Payment amount + smart auto-labeling */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "#FFFDF9", border: `1px solid ${hasAutoLabeled ? "rgba(196,163,90,0.2)" : "rgba(123,45,38,0.08)"}` }}
        >
          <div
            className="font-body text-[11px] uppercase mb-4 font-semibold"
            style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}
          >
            Contribution & Membership Level
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelCls} style={labelStyle}>Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount}
                onChange={(e) => handlePaymentAmountChange(e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
                placeholder="Enter amount to auto-set tier"
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Membership Tier</label>
              <input
                type="text"
                readOnly
                value={tierLabel(form.membership_tier)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={readOnlyFieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Donor Class</label>
              <input
                type="text"
                readOnly
                value={donorLabel(form.donor_class)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={readOnlyFieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Member Label</label>
              <input
                type="text"
                readOnly
                value={tierLabel(form.member_label)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={readOnlyFieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Access Tier</label>
              <input
                type="text"
                readOnly
                value={tierLabel(form.effective_access_tier)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={readOnlyFieldStyle}
              />
            </div>
          </div>

          {summaryMsg && (
            <div
              className="mt-5 p-4"
              style={{
                background: `${summaryColor}08`,
                borderLeft: `3px solid ${summaryColor}`,
              }}
            >
              <p className="font-body text-[14px] leading-[1.6] m-0" style={{ color: summaryColor }}>
                {summaryMsg}
              </p>
            </div>
          )}
        </div>

        {/* Dates & status */}
        <div
          className="p-6 md:p-8 mb-6"
          style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelCls} style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer"
                style={fieldStyle}
              >
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Join Date</label>
              <input
                type="date"
                value={form.join_date}
                onChange={(e) => handleJoinDateChange(e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Expiration Date</label>
              <input
                type="date"
                value={form.expiration_date}
                onChange={(e) => handleChange("expiration_date", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none"
                style={fieldStyle}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls} style={labelStyle}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full font-body text-sm px-3 py-2 outline-none resize-y"
                style={fieldStyle}
              />
            </div>
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
