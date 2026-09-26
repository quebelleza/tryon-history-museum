"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WARM_BLACK = "#1A1311";
const GOLD = "#C4A35A";
const RED = "#7B2D26";
const MUTED = "#A8584F";
const inputStyle = { background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.14)", color: WARM_BLACK };
const labelClass = "block font-body text-[10px] uppercase mb-1.5 font-semibold";
const AREAS = [
  ["docent", "Docent / Museum Guide"], ["exhibits", "Exhibits & Archiving"],
  ["coordination", "Volunteer Coordination"], ["visitor_center", "Visitor Center / Gift Shop"],
  ["events", "Special Events"], ["other", "Not Sure / Other"],
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]];
const initialForm = {
  full_name: "", email: "", phone: "", preferred_contact: "", status: "new",
  interest_reason: "", prior_experience: null, volunteer_areas: [], availability: {},
  hours_per_month: "", public_comfort_level: "",
};

export default function AdminVolunteerFormSection({ volunteerId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(Boolean(volunteerId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!volunteerId) return;
    fetch(`/api/admin/volunteers/${volunteerId}`).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        const volunteer = data.volunteer;
        setForm({
          full_name: volunteer.full_name || "", email: volunteer.email || "", phone: volunteer.phone || "",
          preferred_contact: volunteer.preferred_contact || "", status: volunteer.status || "new",
          interest_reason: volunteer.interest_reason || "", prior_experience: volunteer.prior_experience,
          volunteer_areas: volunteer.volunteer_areas || [], availability: volunteer.availability || {},
          hours_per_month: volunteer.hours_per_month || "", public_comfort_level: volunteer.public_comfort_level ?? "",
        });
      } else setError(data.error || "Could not load volunteer.");
      setLoading(false);
    });
  }, [volunteerId]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleArea(area) {
    setForm((current) => ({
      ...current,
      volunteer_areas: current.volunteer_areas.includes(area)
        ? current.volunteer_areas.filter((value) => value !== area)
        : [...current.volunteer_areas, area],
    }));
  }

  function toggleAvailability(day, time) {
    setForm((current) => {
      const daySlots = { ...(current.availability[day] || {}) };
      if (daySlots[time]) delete daySlots[time];
      else daySlots[time] = true;
      const availability = { ...current.availability };
      if (Object.keys(daySlots).length) availability[day] = daySlots;
      else delete availability[day];
      return { ...current, availability };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(volunteerId ? `/api/admin/volunteers/${volunteerId}` : "/api/admin/volunteers", {
      method: volunteerId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (response.ok) router.push(`/admin/volunteers/${data.volunteer.id}`);
    else {
      setError(data.error || "Could not save volunteer.");
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 font-body text-sm">Loading volunteer…</div>;

  return (
    <div className="p-8 md:p-10 max-w-[1000px]">
      <Link href={volunteerId ? `/admin/volunteers/${volunteerId}` : "/admin/volunteers"} className="font-body text-[12px] uppercase no-underline" style={{ color: MUTED }}>← Back</Link>
      <div className="my-7"><div className="font-body text-[11px] uppercase mb-2" style={{ letterSpacing: "0.25em", color: GOLD }}>Volunteer Management</div><h1 className="font-display text-3xl font-light m-0">{volunteerId ? "Edit Volunteer" : "Add Volunteer"}</h1></div>
      <form onSubmit={submit} className="space-y-6">
        <section className="p-6 md:p-8" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass} style={{ color: MUTED }}>Full name *</label><input required maxLength={150} value={form.full_name} onChange={(event) => setField("full_name", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Email *</label><input required type="email" maxLength={254} value={form.email} onChange={(event) => setField("email", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Phone *</label><input required maxLength={50} value={form.phone} onChange={(event) => setField("phone", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle} /></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Preferred contact</label><select value={form.preferred_contact} onChange={(event) => setField("preferred_contact", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle}><option value="">Not specified</option><option value="email">Email</option><option value="phone">Phone Call</option><option value="text">Text Message</option></select></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Status</label><select value={form.status} onChange={(event) => setField("status", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle}><option value="new">New</option><option value="contacted">Contacted</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Hours per month</label><select value={form.hours_per_month} onChange={(event) => setField("hours_per_month", event.target.value)} className="w-full px-3 py-2 font-body text-sm" style={inputStyle}><option value="">Not specified</option><option>Less than 5 hours</option><option>5–10 hours</option><option>11–20 hours</option><option>More than 20 hours</option></select></div>
          </div>
        </section>

        <section className="p-6 md:p-8" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className={labelClass} style={{ color: MUTED }}>Volunteer areas *</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{AREAS.map(([value, label]) => <label key={value} className="flex gap-3 items-center p-3 cursor-pointer" style={{ border: "1px solid rgba(123,45,38,0.1)" }}><input type="checkbox" checked={form.volunteer_areas.includes(value)} onChange={() => toggleArea(value)} /><span className="font-body text-sm">{label}</span></label>)}</div>
        </section>

        <section className="p-6 md:p-8" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass} style={{ color: MUTED }}>Prior museum/docent experience</label><select value={form.prior_experience === null ? "" : String(form.prior_experience)} onChange={(event) => setField("prior_experience", event.target.value === "" ? null : event.target.value === "true")} className="w-full px-3 py-2 font-body text-sm" style={inputStyle}><option value="">Not specified</option><option value="true">Yes</option><option value="false">No</option></select></div>
            <div><label className={labelClass} style={{ color: MUTED }}>Public comfort level</label><select value={form.public_comfort_level} onChange={(event) => setField("public_comfort_level", event.target.value === "" ? "" : Number(event.target.value))} className="w-full px-3 py-2 font-body text-sm" style={inputStyle}><option value="">Not specified</option>{[1,2,3,4,5].map((number) => <option key={number} value={number}>{number} / 5</option>)}</select></div>
          </div>
          <div className="mt-5"><label className={labelClass} style={{ color: MUTED }}>Why they want to volunteer</label><textarea rows={5} maxLength={5000} value={form.interest_reason} onChange={(event) => setField("interest_reason", event.target.value)} className="w-full px-3 py-2 font-body text-sm resize-y" style={inputStyle} /></div>
        </section>

        <section className="p-6 md:p-8 overflow-x-auto" style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.08)" }}>
          <div className={labelClass} style={{ color: MUTED }}>Availability</div>
          <table className="w-full min-w-[520px] border-collapse"><thead><tr><th className="text-left p-2 font-body text-[10px] uppercase" style={{ color: MUTED }}>Day</th>{TIMES.map(([value, label]) => <th key={value} className="p-2 font-body text-[10px] uppercase" style={{ color: MUTED }}>{label}</th>)}</tr></thead><tbody>{DAYS.map((day) => <tr key={day} style={{ borderTop: "1px solid rgba(123,45,38,0.06)" }}><td className="p-2 font-body text-sm">{day}</td>{TIMES.map(([time]) => <td key={time} className="p-2 text-center"><input type="checkbox" checked={Boolean(form.availability[day]?.[time])} onChange={() => toggleAvailability(day, time)} /></td>)}</tr>)}</tbody></table>
        </section>

        {error && <p role="alert" className="font-body text-sm" style={{ color: RED }}>{error}</p>}
        <button disabled={saving} className="font-body text-[12px] uppercase font-semibold cursor-pointer disabled:opacity-50" style={{ color: WARM_BLACK, background: GOLD, border: "none", padding: "13px 26px" }}>{saving ? "Saving…" : volunteerId ? "Save Volunteer" : "Create Volunteer"}</button>
      </form>
    </div>
  );
}
