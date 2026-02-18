"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

const fieldStyle = {
  background: "#FFFDF9",
  border: "1px solid rgba(123,45,38,0.12)",
  color: WARM_BLACK,
};

const readOnlyStyle = {
  background: "rgba(26,19,17,0.02)",
  border: "1px solid rgba(123,45,38,0.06)",
  color: "rgba(26,19,17,0.55)",
};

const labelCls = "block font-body text-[10px] uppercase mb-1.5 font-semibold";
const labelStyle = { letterSpacing: "0.15em", color: MUTED_RED };

function tierLabel(t) {
  if (!t) return "—";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function roleLabel(r) {
  if (r === "admin") return "Admin";
  if (r === "board_member") return "Board Member";
  return "Member";
}

export default function AdminMemberDetailSection({ memberId }) {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    payment_method: "check",
    payment_type: "new",
    notes: "",
  });

  // Permissions section (admin only)
  const [permRole, setPermRole] = useState("member");
  const [permSaving, setPermSaving] = useState(false);
  const [permSaved, setPermSaved] = useState(false);
  const [showPermConfirm, setShowPermConfirm] = useState(false);

  const isAdmin = role === "admin";
  const isBoardMember = role === "board_member";

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMember(data.member);
      setPayments(data.payments || []);
      setAssignments(data.assignments || []);
      setRole(data.role || null);
      setLoading(false);
    }
    load();
  }, [memberId]);

  function handleChange(field, value) {
    setMember((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const body = isBoardMember ? { member_label: member.member_label } : member;
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setMember((prev) => ({ ...prev, ...data.member }));
      setSaved(true);
    }
    setSaving(false);
  }

  async function handleAddPayment(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPayments((prev) => [data.payment, ...prev]);
      setShowPaymentForm(false);
      setPaymentForm({
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
        payment_method: "check",
        payment_type: "new",
        notes: "",
      });
    }
  }

  async function handlePermSave() {
    if (permRole === "admin" && !showPermConfirm) {
      setShowPermConfirm(true);
      return;
    }
    setPermSaving(true);
    setShowPermConfirm(false);
    const res = await fetch("/api/admin/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_user_id: member.auth_user_id, role: permRole }),
    });
    if (res.ok) {
      setPermSaved(true);
    }
    setPermSaving(false);
  }

  if (loading) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: "rgba(26,19,17,0.5)" }}>Loading member…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-10">
        <p className="font-body text-[15px]" style={{ color: DEEP_RED }}>Member not found.</p>
        <Link href="/admin/members" className="font-body text-[13px] no-underline" style={{ color: GOLD_ACCENT }}>
          ← Back to Members
        </Link>
      </div>
    );
  }

  // For board_member: display values read-only except member_label
  const ro = isBoardMember;

  return (
    <div className="p-8 md:p-10 max-w-[1000px]">
      {/* Back link + header */}
      <Link
        href="/admin/members"
        className="inline-block font-body text-[12px] uppercase no-underline mb-6 hover:underline"
        style={{ letterSpacing: "0.1em", color: MUTED_RED }}
      >
        ← Back to Members
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="font-body text-[11px] uppercase mb-2" style={{ letterSpacing: "0.25em", color: GOLD_ACCENT }}>
            Member Detail
          </div>
          <h1 className="font-display text-3xl font-light m-0" style={{ color: WARM_BLACK }}>
            {member.first_name} {member.last_name}
          </h1>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
            style={{
              letterSpacing: "0.1em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "10px 24px",
              border: "none",
            }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Member Label — always editable by both roles */}
      <div className="p-6 md:p-8 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(196,163,90,0.15)" }}>
        <div className="font-body text-[11px] uppercase mb-4 font-semibold" style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}>
          Member Label
        </div>
        <div className="max-w-[280px]">
          <select
            value={member.member_label || "member"}
            onChange={(e) => handleChange("member_label", e.target.value)}
            className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer"
            style={fieldStyle}
          >
            <option value="member">Member</option>
            <option value="donor">Donor</option>
            <option value="patron">Patron</option>
            <option value="steward">Steward</option>
            <option value="board_member">Board Member</option>
          </select>
        </div>
      </div>

      {/* Member fields — editable for admin, read-only for board_member */}
      <div className="p-6 md:p-8 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>First Name</label>
            <input type="text" readOnly={ro} value={member.first_name || ""} onChange={(e) => handleChange("first_name", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Last Name</label>
            <input type="text" readOnly={ro} value={member.last_name || ""} onChange={(e) => handleChange("last_name", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Email</label>
            <input type="email" readOnly={ro} value={member.email || ""} onChange={(e) => handleChange("email", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Phone</label>
            <input type="text" readOnly={ro} value={member.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Membership Tier</label>
            {ro ? (
              <input type="text" readOnly value={tierLabel(member.membership_tier)} className="w-full font-body text-sm px-3 py-2 outline-none" style={readOnlyStyle} />
            ) : (
              <select value={member.membership_tier || "individual"} onChange={(e) => handleChange("membership_tier", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer" style={fieldStyle}>
                <option value="individual">Individual</option>
                <option value="family">Family</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Status</label>
            {ro ? (
              <input type="text" readOnly value={tierLabel(member.status)} className="w-full font-body text-sm px-3 py-2 outline-none" style={readOnlyStyle} />
            ) : (
              <select value={member.status || "active"} onChange={(e) => handleChange("status", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer" style={fieldStyle}>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Donor Class</label>
            {ro ? (
              <input type="text" readOnly value={tierLabel(member.donor_class)} className="w-full font-body text-sm px-3 py-2 outline-none" style={readOnlyStyle} />
            ) : (
              <select value={member.donor_class || "none"} onChange={(e) => handleChange("donor_class", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer" style={fieldStyle}>
                <option value="none">None</option>
                <option value="donor">Donor</option>
                <option value="patron">Patron</option>
                <option value="steward">Steward</option>
              </select>
            )}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Join Date</label>
            <input type={ro ? "text" : "date"} readOnly={ro} value={ro ? formatDate(member.join_date) : (member.join_date || "")} onChange={(e) => handleChange("join_date", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Expiration Date</label>
            <input type={ro ? "text" : "date"} readOnly={ro} value={ro ? formatDate(member.expiration_date) : (member.expiration_date || "")} onChange={(e) => handleChange("expiration_date", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelCls} style={labelStyle}>Address</label>
            <input type="text" readOnly={ro} value={member.address || ""} onChange={(e) => handleChange("address", e.target.value)} className="w-full font-body text-sm px-3 py-2 outline-none" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelCls} style={labelStyle}>Notes</label>
            <textarea readOnly={ro} value={member.notes || ""} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="w-full font-body text-sm px-3 py-2 outline-none resize-y" style={ro ? readOnlyStyle : fieldStyle} />
          </div>
        </div>
      </div>

      {/* Board assignment (patron/steward) */}
      {(member.donor_class === "patron" || member.donor_class === "steward") && (
        <div className="p-6 md:p-8 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(196,163,90,0.15)" }}>
          <div className="font-body text-[11px] uppercase mb-4 font-semibold" style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}>
            Board Assignment
          </div>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-body text-[14px] font-semibold" style={{ color: WARM_BLACK }}>
                      {a.board_member_name}
                    </div>
                    <div className="font-body text-[12px]" style={{ color: "rgba(26,19,17,0.4)" }}>
                      Assigned {formatDate(a.assigned_date)}
                      {a.notes && ` · ${a.notes}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
              No board member assigned yet.
            </p>
          )}
        </div>
      )}

      {/* Payment history — admin only */}
      {isAdmin && (
        <div className="p-6 md:p-8 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-body text-[11px] uppercase font-semibold" style={{ letterSpacing: "0.15em", color: GOLD_ACCENT }}>
              Payment History
            </div>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="font-body text-[11px] uppercase font-semibold bg-transparent border-none cursor-pointer"
              style={{ letterSpacing: "0.05em", color: GOLD_ACCENT }}
            >
              {showPaymentForm ? "Cancel" : "+ Add Payment"}
            </button>
          </div>

          {showPaymentForm && (
            <form onSubmit={handleAddPayment} className="mb-6 p-4" style={{ background: "rgba(196,163,90,0.04)", border: "1px solid rgba(196,163,90,0.1)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={labelCls} style={labelStyle}>Date</label>
                  <input type="date" required value={paymentForm.payment_date} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))} className="w-full font-body text-sm px-3 py-2 outline-none" style={fieldStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Amount ($)</label>
                  <input type="number" step="0.01" required value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="w-full font-body text-sm px-3 py-2 outline-none" style={fieldStyle} placeholder="0.00" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Method</label>
                  <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))} className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer" style={fieldStyle}>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Type</label>
                  <select value={paymentForm.payment_type} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_type: e.target.value }))} className="w-full font-body text-sm px-3 py-2 outline-none cursor-pointer" style={fieldStyle}>
                    <option value="new">New</option>
                    <option value="renewal">Renewal</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Notes</label>
                  <input type="text" value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} className="w-full font-body text-sm px-3 py-2 outline-none" style={fieldStyle} placeholder="Optional notes" />
                </div>
              </div>
              <button type="submit" className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110" style={{ letterSpacing: "0.1em", color: WARM_BLACK, background: GOLD_ACCENT, padding: "8px 20px", border: "none" }}>
                Save Payment
              </button>
            </form>
          )}

          {payments.length === 0 ? (
            <p className="font-body text-[13px]" style={{ color: "rgba(26,19,17,0.4)" }}>
              No payment records.
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid rgba(123,45,38,0.04)" }}>
                  <div>
                    <div className="font-body text-[13px] font-semibold" style={{ color: WARM_BLACK }}>
                      ${parseFloat(p.amount).toFixed(2)}
                      <span className="font-normal ml-2" style={{ color: "rgba(26,19,17,0.4)" }}>{p.payment_type} · {p.payment_method}</span>
                    </div>
                    {p.notes && <div className="font-body text-[12px] mt-0.5" style={{ color: "rgba(26,19,17,0.4)" }}>{p.notes}</div>}
                  </div>
                  <div className="font-body text-[12px] whitespace-nowrap" style={{ color: "rgba(26,19,17,0.4)" }}>{formatDate(p.payment_date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions section — admin only, and only if member has an auth_user_id */}
      {isAdmin && member.auth_user_id && (
        <div className="p-6 md:p-8 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(27,42,74,0.12)" }}>
          <div className="font-body text-[11px] uppercase mb-4 font-semibold" style={{ letterSpacing: "0.15em", color: "#1B2A4A" }}>
            Permissions
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Role</label>
              <select
                value={permRole}
                onChange={(e) => { setPermRole(e.target.value); setPermSaved(false); setShowPermConfirm(false); }}
                className="font-body text-sm px-3 py-2 outline-none cursor-pointer"
                style={fieldStyle}
              >
                <option value="member">Member</option>
                <option value="board_member">Board Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              onClick={handlePermSave}
              disabled={permSaving}
              className="font-body text-[12px] font-semibold uppercase cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
              style={{ letterSpacing: "0.1em", color: "#FFFDF9", background: "#1B2A4A", padding: "10px 22px", border: "none" }}
            >
              {permSaving ? "Saving…" : permSaved ? "Role Updated ✓" : "Save Permission Change"}
            </button>
          </div>
          {showPermConfirm && (
            <div className="mt-4 p-4" style={{ background: "rgba(123,45,38,0.05)", border: "1px solid rgba(123,45,38,0.15)" }}>
              <p className="font-body text-[13px] mb-3" style={{ color: DEEP_RED }}>
                Admin access grants full control over all museum data. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handlePermSave}
                  className="font-body text-[11px] font-semibold uppercase cursor-pointer"
                  style={{ letterSpacing: "0.08em", color: "#FFFDF9", background: DEEP_RED, padding: "8px 18px", border: "none" }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowPermConfirm(false)}
                  className="font-body text-[11px] uppercase cursor-pointer"
                  style={{ letterSpacing: "0.08em", color: "rgba(26,19,17,0.5)", background: "transparent", border: "1px solid rgba(26,19,17,0.15)", padding: "8px 18px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
