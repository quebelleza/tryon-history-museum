"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const WARM_BLACK = "#1A1311";
const GOLD = "#C4A35A";
const RED = "#7B2D26";
const MUTED = "#A8584F";
const fieldStyle = { background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.14)", color: WARM_BLACK };
const labelClass = "block font-body text-[10px] uppercase mb-1.5 font-semibold";
const money = (value) => Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
const today = () => new Date().toISOString().split("T")[0];
const yearStart = () => `${new Date().getFullYear()}-01-01`;

function queryString(filters, extra = {}) {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  for (const [key, value] of Object.entries({ ...filters, ...extra })) {
    if (!["from", "to"].includes(key) && value) params.set(key, value);
  }
  return params.toString();
}

function title(value) {
  return String(value || "Unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Breakdown({ title: heading, values }) {
  const entries = Object.entries(values || {}).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="p-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
      <div className="font-body text-[11px] uppercase font-semibold mb-4" style={{ letterSpacing: "0.14em", color: GOLD }}>{heading}</div>
      {entries.length === 0 ? <p className="font-body text-sm m-0" style={{ color: "rgba(26,19,17,0.4)" }}>No activity in this period.</p> : (
        <div className="space-y-2">
          {entries.map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-4 font-body text-[13px]">
              <span style={{ color: "rgba(26,19,17,0.6)" }}>{heading === "By month" ? label : title(label)}</span>
              <strong style={{ color: WARM_BLACK }}>{money(amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminFinancesSection() {
  const [filters, setFilters] = useState({ from: yearStart(), to: today(), type: "", method: "", source: "", designation: "" });
  const [report, setReport] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [designationForm, setDesignationForm] = useState({ name: "", kind: "fund", description: "", starts_on: "", ends_on: "" });
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [savingDesignation, setSavingDesignation] = useState(false);
  const [allocationPayment, setAllocationPayment] = useState(null);
  const [allocationRows, setAllocationRows] = useState([]);
  const [allocationError, setAllocationError] = useState("");
  const [savingAllocations, setSavingAllocations] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [financeResponse, designationResponse] = await Promise.all([
      fetch(`/api/admin/finances?${queryString(filters)}`),
      fetch("/api/admin/designations"),
    ]);
    const finance = await financeResponse.json();
    const designationData = await designationResponse.json();
    if (!financeResponse.ok) setError(finance.error || "Could not load finances.");
    else setReport(finance);
    if (designationResponse.ok) setDesignations(designationData.designations || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function preset(name) {
    const now = new Date();
    if (name === "ytd") setFilters((value) => ({ ...value, from: `${now.getFullYear()}-01-01`, to: today() }));
    if (name === "previousYear") setFilters((value) => ({ ...value, from: `${now.getFullYear() - 1}-01-01`, to: `${now.getFullYear() - 1}-12-31` }));
    if (name === "thisMonth") {
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setFilters((value) => ({ ...value, from: `${now.getFullYear()}-${month}-01`, to: today() }));
    }
    if (name === "lastMonth") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setFilters((value) => ({ ...value, from: first.toISOString().split("T")[0], to: last.toISOString().split("T")[0] }));
    }
  }

  async function addDesignation(event) {
    event.preventDefault();
    setSavingDesignation(true);
    setError("");
    const response = await fetch("/api/admin/designations", {
      method: editingDesignationId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...designationForm, id: editingDesignationId }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not add designation.");
    else {
      setDesignationForm({ name: "", kind: "fund", description: "", starts_on: "", ends_on: "" });
      setEditingDesignationId(null);
      await load();
    }
    setSavingDesignation(false);
  }

  async function toggleDesignation(item) {
    const response = await fetch("/api/admin/designations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, active: !item.active }),
    });
    if (response.ok) await load();
    else setError((await response.json()).error || "Could not update designation.");
  }

  function editDesignation(item) {
    setEditingDesignationId(item.id);
    setDesignationForm({
      name: item.name,
      kind: item.kind,
      description: item.description || "",
      starts_on: item.starts_on || "",
      ends_on: item.ends_on || "",
      active: item.active,
    });
  }

  function editAllocations(payment) {
    setAllocationPayment(payment);
    setAllocationError("");
    setAllocationRows(payment.allocations.map((allocation) => ({
      designation_id: allocation.designationId || "",
      amount: String(allocation.amount),
    })));
  }

  async function saveAllocations() {
    setSavingAllocations(true);
    setAllocationError("");
    const response = await fetch("/api/admin/payment-allocations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_id: allocationPayment.id,
        allocations: allocationRows.map((row) => ({ designation_id: row.designation_id || null, amount: Number(row.amount) })),
      }),
    });
    const data = await response.json();
    if (!response.ok) setAllocationError(data.error || "Could not save allocations.");
    else {
      setAllocationPayment(null);
      await load();
    }
    setSavingAllocations(false);
  }

  const allocationTotal = allocationRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const cards = report ? [
    ["Total received", report.summary.total],
    ["Membership dues", report.summary.membership],
    ["Donations", report.summary.donations],
    ["Transactions", report.summary.transactionCount, true],
    ["Contributors", report.summary.uniqueContributors, true],
  ] : [];

  return (
    <div className="p-8 md:p-10 max-w-[1400px]">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <div className="font-body text-[11px] uppercase mb-2" style={{ letterSpacing: "0.25em", color: GOLD }}>Administrator Only</div>
          <h1 className="font-display text-3xl font-light m-0" style={{ color: WARM_BLACK }}>Finances</h1>
          <p className="font-body text-[13px] mt-2 mb-0" style={{ color: "rgba(26,19,17,0.5)" }}>Calendar-year membership and contribution reporting</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/finances?${queryString(filters, { export: "detail" })}`} className="font-body text-[11px] uppercase font-semibold no-underline" style={{ color: WARM_BLACK, background: GOLD, padding: "10px 16px" }}>Export Detail CSV</a>
          <a href={`/api/admin/finances?${queryString(filters, { export: "summary" })}`} className="font-body text-[11px] uppercase font-semibold no-underline" style={{ color: RED, border: `1px solid ${RED}`, padding: "9px 16px" }}>Export Summary CSV</a>
        </div>
      </div>

      <div className="p-5 mb-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
        <div className="flex flex-wrap gap-2 mb-4">
          {[['thisMonth', 'This month'], ['lastMonth', 'Last month'], ['ytd', 'Year to date'], ['previousYear', 'Previous year']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => preset(value)} className="font-body text-[11px] uppercase cursor-pointer" style={{ color: RED, background: "transparent", border: "1px solid rgba(123,45,38,0.25)", padding: "7px 12px" }}>{label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div><label className={labelClass} style={{ color: MUTED }}>From</label><input type="date" value={filters.from} onChange={(event) => setFilters((value) => ({ ...value, from: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle} /></div>
          <div><label className={labelClass} style={{ color: MUTED }}>To</label><input type="date" value={filters.to} onChange={(event) => setFilters((value) => ({ ...value, to: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle} /></div>
          <div><label className={labelClass} style={{ color: MUTED }}>Type</label><select value={filters.type} onChange={(event) => setFilters((value) => ({ ...value, type: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle}><option value="">All types</option><option value="new_member">New membership</option><option value="renewal">Renewal</option><option value="donation">Donation</option><option value="upgrade">Upgrade</option></select></div>
          <div><label className={labelClass} style={{ color: MUTED }}>Method</label><select value={filters.method} onChange={(event) => setFilters((value) => ({ ...value, method: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle}><option value="">All methods</option><option value="stripe">Credit card</option><option value="check">Check</option><option value="cash">Cash</option><option value="other">Other</option></select></div>
          <div><label className={labelClass} style={{ color: MUTED }}>Source</label><select value={filters.source} onChange={(event) => setFilters((value) => ({ ...value, source: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle}><option value="">All sources</option><option value="website">Website</option><option value="admin">Admin entry</option><option value="import">Imported</option></select></div>
          <div><label className={labelClass} style={{ color: MUTED }}>Designation</label><select value={filters.designation} onChange={(event) => setFilters((value) => ({ ...value, designation: event.target.value }))} className="w-full px-3 py-2 font-body text-sm" style={fieldStyle}><option value="">All designations</option><option value="unrestricted">Unrestricted</option>{designations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        </div>
      </div>

      {error && <p role="alert" className="p-4 font-body text-sm" style={{ color: RED, background: "rgba(123,45,38,0.06)" }}>{error}</p>}
      {loading ? <p className="font-body text-sm">Loading financial report…</p> : report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map(([label, value, count]) => <div key={label} className="p-5" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}><div className="font-display text-2xl font-semibold" style={{ color: WARM_BLACK }}>{count ? value : money(value)}</div><div className="font-body text-[10px] uppercase mt-1" style={{ letterSpacing: "0.12em", color: MUTED }}>{label}</div></div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Breakdown title="By month" values={report.breakdowns.month} />
            <Breakdown title="By type" values={report.breakdowns.type} />
            <Breakdown title="By method" values={report.breakdowns.method} />
            <Breakdown title="By source" values={report.breakdowns.source} />
            <Breakdown title="By designation" values={report.breakdowns.designation} />
          </div>

          <div className="p-5 md:p-6 mb-8 overflow-x-auto" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
            <div className="font-body text-[11px] uppercase font-semibold mb-4" style={{ letterSpacing: "0.14em", color: GOLD }}>Transaction ledger</div>
            <table className="w-full border-collapse min-w-[1050px]">
              <thead><tr style={{ borderBottom: "1px solid rgba(123,45,38,0.1)" }}>{["Date", "Contributor", "Total", "Membership", "Donation", "Designation", "Method", "Type", "Source", ""].map((heading) => <th key={heading} className="text-left px-2 py-2 font-body text-[10px] uppercase" style={{ color: MUTED }}>{heading}</th>)}</tr></thead>
              <tbody>{report.payments.map((payment) => <tr key={payment.id} style={{ borderBottom: "1px solid rgba(123,45,38,0.06)" }}>
                <td className="px-2 py-3 font-body text-xs">{payment.payment_date}</td>
                <td className="px-2 py-3"><div className="font-body text-xs font-semibold">{payment.member_id ? <Link href={`/admin/members/${payment.member_id}`} style={{ color: WARM_BLACK }}>{payment.contributor}</Link> : payment.contributor}</div><div className="font-body text-[10px]" style={{ color: "rgba(26,19,17,0.45)" }}>{payment.email}</div></td>
                <td className="px-2 py-3 font-body text-xs font-semibold">{money(payment.amount)}</td><td className="px-2 py-3 font-body text-xs">{money(payment.membership)}</td><td className="px-2 py-3 font-body text-xs">{money(payment.donation)}</td>
                <td className="px-2 py-3 font-body text-xs">{payment.allocations.map((allocation) => `${allocation.designation} (${money(allocation.amount)})`).join(", ") || "—"}</td>
                <td className="px-2 py-3 font-body text-xs">{title(payment.payment_method)}</td><td className="px-2 py-3 font-body text-xs">{title(payment.payment_type)}</td><td className="px-2 py-3 font-body text-xs">{title(payment.source)}</td>
                <td className="px-2 py-3">{payment.donation > 0 && <button type="button" onClick={() => editAllocations(payment)} className="font-body text-[10px] uppercase cursor-pointer" style={{ color: RED, background: "transparent", border: "none" }}>Allocate</button>}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>
      )}

      <div className="p-5 md:p-6" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
        <div className="font-body text-[11px] uppercase font-semibold mb-4" style={{ letterSpacing: "0.14em", color: GOLD }}>Funds & campaigns</div>
        <form onSubmit={addDesignation} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
          <input required maxLength={120} value={designationForm.name} onChange={(event) => setDesignationForm((value) => ({ ...value, name: event.target.value }))} placeholder="Name" className="md:col-span-2 px-3 py-2 font-body text-sm" style={fieldStyle} />
          <select value={designationForm.kind} onChange={(event) => setDesignationForm((value) => ({ ...value, kind: event.target.value }))} className="px-3 py-2 font-body text-sm" style={fieldStyle}><option value="fund">Fund</option><option value="campaign">Campaign</option></select>
          <input type="date" value={designationForm.starts_on} onChange={(event) => setDesignationForm((value) => ({ ...value, starts_on: event.target.value }))} className="px-3 py-2 font-body text-sm" style={fieldStyle} aria-label="Start date" />
          <input type="date" value={designationForm.ends_on} onChange={(event) => setDesignationForm((value) => ({ ...value, ends_on: event.target.value }))} className="px-3 py-2 font-body text-sm" style={fieldStyle} aria-label="End date" />
          <button disabled={savingDesignation} className="font-body text-[11px] uppercase font-semibold cursor-pointer disabled:opacity-50" style={{ background: GOLD, color: WARM_BLACK, border: "none" }}>{savingDesignation ? "Saving…" : editingDesignationId ? "Save" : "Add"}</button>
          <input value={designationForm.description} onChange={(event) => setDesignationForm((value) => ({ ...value, description: event.target.value }))} placeholder="Description (optional)" className="md:col-span-5 px-3 py-2 font-body text-sm" style={fieldStyle} />
          {editingDesignationId && <button type="button" onClick={() => { setEditingDesignationId(null); setDesignationForm({ name: "", kind: "fund", description: "", starts_on: "", ends_on: "" }); }} className="font-body text-[11px] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(26,19,17,0.2)" }}>Cancel edit</button>}
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{designations.map((item) => <div key={item.id} className="flex justify-between items-center gap-3 p-3" style={{ border: "1px solid rgba(123,45,38,0.08)", opacity: item.active ? 1 : 0.55 }}><div><strong className="font-body text-sm">{item.name}</strong><span className="font-body text-[10px] uppercase ml-2" style={{ color: MUTED }}>{item.kind}</span>{item.description && <div className="font-body text-[11px] mt-1" style={{ color: "rgba(26,19,17,0.55)" }}>{item.description}</div>}{(item.starts_on || item.ends_on) && <div className="font-body text-[10px] mt-1" style={{ color: "rgba(26,19,17,0.45)" }}>{item.starts_on || "Open"} – {item.ends_on || "Open"}</div>}</div><div className="flex gap-2"><button type="button" onClick={() => editDesignation(item)} className="font-body text-[10px] uppercase cursor-pointer" style={{ color: GOLD, background: "transparent", border: "none" }}>Edit</button><button type="button" onClick={() => toggleDesignation(item)} className="font-body text-[10px] uppercase cursor-pointer" style={{ color: item.active ? RED : "#2D6A4F", background: "transparent", border: "none" }}>{item.active ? "Deactivate" : "Activate"}</button></div></div>)}</div>
      </div>

      {allocationPayment && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,19,17,0.65)" }} onClick={() => setAllocationPayment(null)}><div className="w-full max-w-[620px] p-6 md:p-8" style={{ background: "#FAF7F4" }} onClick={(event) => event.stopPropagation()}>
        <h2 className="font-display text-2xl mt-0 mb-2">Allocate {money(allocationPayment.donation)} donation</h2><p className="font-body text-sm mt-0 mb-5" style={{ color: "rgba(26,19,17,0.55)" }}>{allocationPayment.contributor} · {allocationPayment.payment_date}</p>
        <div className="space-y-3">{allocationRows.map((row, index) => <div key={index} className="grid grid-cols-[1fr_130px_36px] gap-2"><select value={row.designation_id} onChange={(event) => setAllocationRows((rows) => rows.map((item, i) => i === index ? { ...item, designation_id: event.target.value } : item))} className="px-3 py-2 font-body text-sm" style={fieldStyle}><option value="">Unrestricted</option>{designations.map((item) => <option key={item.id} value={item.id} disabled={!item.active && row.designation_id !== item.id}>{item.name} ({item.kind}{item.active ? "" : ", inactive"})</option>)}</select><input type="number" min="0.01" step="0.01" value={row.amount} onChange={(event) => setAllocationRows((rows) => rows.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} className="px-3 py-2 font-body text-sm" style={fieldStyle} /><button type="button" onClick={() => setAllocationRows((rows) => rows.filter((_, i) => i !== index))} className="cursor-pointer" style={{ color: RED, background: "transparent", border: "none" }}>×</button></div>)}</div>
        <button type="button" onClick={() => setAllocationRows((rows) => [...rows, { designation_id: "", amount: "" }])} className="font-body text-[11px] uppercase mt-3 cursor-pointer" style={{ color: RED, background: "transparent", border: "none" }}>+ Add split</button>
        <div className="flex justify-between font-body text-sm mt-5 p-3" style={{ background: allocationTotal === allocationPayment.donation ? "rgba(45,106,79,0.06)" : "rgba(123,45,38,0.06)" }}><span>Allocated</span><strong>{money(allocationTotal)} of {money(allocationPayment.donation)}</strong></div>
        {allocationError && <p role="alert" className="font-body text-sm" style={{ color: RED }}>{allocationError}</p>}
        <div className="flex gap-3 mt-5"><button type="button" onClick={saveAllocations} disabled={savingAllocations || Math.abs(allocationTotal - allocationPayment.donation) > 0.005} className="font-body text-[11px] uppercase font-semibold cursor-pointer disabled:opacity-50" style={{ color: WARM_BLACK, background: GOLD, border: "none", padding: "10px 18px" }}>{savingAllocations ? "Saving…" : "Save allocations"}</button><button type="button" onClick={() => setAllocationPayment(null)} className="font-body text-[11px] uppercase cursor-pointer" style={{ background: "transparent", border: "1px solid rgba(26,19,17,0.2)", padding: "10px 18px" }}>Cancel</button></div>
      </div></div>}
    </div>
  );
}
