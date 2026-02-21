import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const VOLUNTEER_AREAS_MAP = {
  "docent": "Docent / Museum Guide",
  "exhibits": "Exhibits & Archiving",
  "coordination": "Volunteer Coordination / Scheduling",
  "visitor_center": "Visitor Center / Gift Shop",
  "events": "Special Events",
  "other": "Not Sure / Something Else",
};

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await request.json();
  const {
    full_name,
    email,
    phone,
    preferred_contact,
    interest_reason,
    prior_experience,
    volunteer_areas,
    availability,
    hours_per_month,
    public_comfort_level,
  } = body;

  if (!full_name || !email || !phone) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  if (!volunteer_areas || volunteer_areas.length === 0) {
    return NextResponse.json({ error: "Please select at least one volunteer area." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.from("volunteers").insert({
    full_name,
    email,
    phone,
    preferred_contact: preferred_contact || null,
    interest_reason: interest_reason || null,
    prior_experience: prior_experience ?? null,
    volunteer_areas,
    availability: availability || null,
    hours_per_month: hours_per_month || null,
    public_comfort_level: public_comfort_level || null,
  }).select("id, member_id").single();

  if (error) {
    console.error("[volunteer] Insert error:", error.message);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }

  // Send notification email to museum staff
  const areaLabels = (volunteer_areas || []).map((a) => VOLUNTEER_AREAS_MAP[a] || a).join(", ");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const times = ["morning", "afternoon", "evening"];
  const timeLabels = { morning: "Morning (9am–12pm)", afternoon: "Afternoon (12pm–4pm)", evening: "Evening (4pm–7pm)" };

  let availabilityText = "Not provided";
  if (availability && typeof availability === "object") {
    const lines = [];
    for (const day of days) {
      const slots = times.filter((t) => availability[day]?.[t]);
      if (slots.length > 0) {
        lines.push(`${day}: ${slots.map((s) => timeLabels[s]).join(", ")}`);
      }
    }
    availabilityText = lines.length > 0 ? lines.join("\n") : "None selected";
  }

  const isMember = !!data.member_id;

  try {
    await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: "info@tryonhistorymuseum.org",
      subject: `New Volunteer Interest Form Submission — ${full_name}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFDF9;border:1px solid rgba(123,45,38,0.08);">
        <tr>
          <td style="background:#1B2A4A;padding:24px 36px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:16px;color:#FAF7F4;letter-spacing:0.08em;">NEW VOLUNTEER INTEREST</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Name</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${full_name}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Email</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;"><a href="mailto:${email}" style="color:#7B2D26;">${email}</a></td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Phone</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${phone}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Preferred Contact</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${preferred_contact || "Not specified"}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Interest Reason</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${interest_reason || "Not provided"}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Prior Museum/Docent Experience</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${prior_experience === true ? "Yes" : prior_experience === false ? "No" : "Not specified"}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Volunteer Areas</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${areaLabels}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Availability</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:14px;color:#1A1311;white-space:pre-line;">${availabilityText}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Hours Per Month</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${hours_per_month || "Not specified"}</td></tr>
              <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#A8584F;">Public Comfort Level</td></tr>
              <tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1A1311;">${public_comfort_level ? `${public_comfort_level} / 5` : "Not specified"}</td></tr>
            </table>
            ${isMember ? '<div style="margin-top:20px;padding:12px 16px;background:rgba(45,106,79,0.08);border:1px solid rgba(45,106,79,0.15);font-family:Georgia,serif;font-size:14px;color:#2D6A4F;">✓ This volunteer is an existing Museum member.</div>' : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(123,45,38,0.08);text-align:center;">
            <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(26,19,17,0.4);margin:0;">Submitted via tryonhistorymuseum.org volunteer form</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `.trim(),
    });
  } catch (emailErr) {
    console.error("[volunteer] Email notification error:", emailErr.message);
  }

  // {TODO: send confirmation email to volunteer — Phase 5 or next iteration}

  return NextResponse.json({ success: true, isMember });
}
