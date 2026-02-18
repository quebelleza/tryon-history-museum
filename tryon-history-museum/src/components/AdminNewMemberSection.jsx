"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const fieldStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.12)",
  color: WARM_BLACK,
};

const labelCls = "block font-body text-[10px] uppercase mb-1.5 font-semibold";
const labelStyle = { letterSpacing: "0.15em", color: MUTED_RED };

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  membership_tier: "individual",
  donor_class: "none",
  status: "active",
  join_date: new Date().toISOString().split("T")[0],
  expiration_date: "",
  notes: "",
};

export default function AdminNewMemberSection() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
            <div>
              <label className={labelCls} style={labelStyle}>Membership Tier</label>
              <select
                value={form.membership_tier}
                onChange={(e) => handleChange("membership_tier", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer"
                style={fieldStyle}
              >
                <option value="individual">Individual</option>
                <option value="family">Family</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Donor Class</label>
              <select
                value={form.donor_class}
                onChange={(e) => handleChange("donor_class", e.target.value)}
                className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer"
                style={fieldStyle}
              >
                <option value="none">None</option>
                <option value="donor">Donor</option>
                <option value="patron">Patron</option>
              </select>
            </div>
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
              <label className={labelCls} style={labelStyle}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
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
