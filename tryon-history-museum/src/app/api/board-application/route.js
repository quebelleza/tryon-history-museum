import { NextResponse } from "next/server";
import { Resend } from "resend";

const REQUIRED_TEXT_FIELDS = [
  "full_name",
  "mailing_address",
  "city",
  "state",
  "zip",
  "phone",
  "email",
  "service_reason",
  "skills",
  "priorities",
  "obstacles",
  "three_year_vision",
  "commitment",
];

const COMMITMENT_LABELS = {
  active_role: "Yes — I'm ready to commit to an active role.",
  specific_projects: "I'm interested, but would prefer to start by helping on specific projects.",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fieldRow(label, value, preserveLines = false) {
  return `
    <tr><td style="padding:8px 0 5px;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#1A1311;line-height:1.5;">${escapeHtml(label)}</td></tr>
    <tr><td style="padding:0 0 18px;font-family:Georgia,serif;font-size:15px;color:#1A1311;line-height:1.65;${preserveLines ? "white-space:pre-line;" : ""}">${escapeHtml(value || "Not provided")}</td></tr>
  `;
}

async function sendEmail(resend, label, payload) {
  try {
    const { error } = await resend.emails.send(payload);
    if (error) {
      console.error(`[board-application] ${label} email error:`, error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[board-application] ${label} email error:`, error.message);
    return false;
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const missingField = REQUIRED_TEXT_FIELDS.find(
    (field) => typeof body[field] !== "string" || !body[field].trim()
  );

  if (missingField || body.age_confirmed !== true) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || body.state.trim().length !== 2) {
    return NextResponse.json({ error: "Please provide a valid email and two-letter state." }, { status: 400 });
  }

  if (!Object.hasOwn(COMMITMENT_LABELS, body.commitment)) {
    return NextResponse.json({ error: "Please select a valid board service commitment." }, { status: 400 });
  }

  const submission = {
    full_name: body.full_name.trim(),
    mailing_address: body.mailing_address.trim(),
    city: body.city.trim(),
    state: body.state.trim(),
    zip: body.zip.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    age_confirmed: true,
    service_reason: body.service_reason.trim(),
    skills: body.skills.trim(),
    priorities: body.priorities.trim(),
    obstacles: body.obstacles.trim(),
    three_year_vision: body.three_year_vision.trim(),
    suggested_candidates: typeof body.suggested_candidates === "string" && body.suggested_candidates.trim()
      ? body.suggested_candidates.trim()
      : null,
    commitment: body.commitment,
  };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const commitmentLabel = COMMITMENT_LABELS[submission.commitment];
  const notificationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFDF9;border:1px solid rgba(123,45,38,0.08);">
        <tr>
          <td style="background:#1B2A4A;padding:24px 36px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:16px;color:#FAF7F4;letter-spacing:0.08em;">BOARD MEMBER INTEREST</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${fieldRow("Full name", submission.full_name)}
              ${fieldRow("Mailing address", submission.mailing_address)}
              ${fieldRow("City", submission.city)}
              ${fieldRow("State", submission.state)}
              ${fieldRow("Zip", submission.zip)}
              ${fieldRow("Preferred contact phone", submission.phone)}
              ${fieldRow("Preferred email for museum correspondence", submission.email)}
              ${fieldRow("I am 18 years of age or older", "Yes")}
              ${fieldRow("Why do you want to serve on the Museum Board?", submission.service_reason, true)}
              ${fieldRow("What are your best skills which might be put to use in advancing this organization?", submission.skills, true)}
              ${fieldRow("In your opinion, what should be the top three priorities for the museum at this time?", submission.priorities, true)}
              ${fieldRow("In your opinion, what are the top three obstacles to the museum's success?", submission.obstacles, true)}
              ${fieldRow("As you think of the museum three years from now, what do you see? What three wishes do you have for the museum?", submission.three_year_vision, true)}
              ${fieldRow("Think of people in the community who love Tryon and her history and could bring needed skills to our board. Suggest three of these people.", submission.suggested_candidates, true)}
              ${fieldRow("Board service commitment", commitmentLabel, true)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(123,45,38,0.08);text-align:center;">
            <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(26,19,17,0.4);margin:0;">Submitted via tryonhistorymuseum.org board interest form</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const firstName = escapeHtml(submission.full_name.split(/\s+/)[0]);
  const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFDF9;border:1px solid rgba(123,45,38,0.08);">
        <tr>
          <td style="background:#1B2A4A;padding:28px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:18px;color:#FAF7F4;letter-spacing:0.08em;">TRYON HISTORY MUSEUM</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">Dear ${firstName},</p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">Thank you for your interest in serving on the Tryon History Museum Board. We have received your interest form.</p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">The board reviews interest forms and will follow up personally.</p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 28px;">Thank you for wanting to be part of preserving Tryon&apos;s history.</p>
            <p style="font-family:Georgia,serif;font-size:15px;color:#1A1311;line-height:1.7;margin:0;">Warmly,<br />The Tryon History Museum Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(123,45,38,0.08);text-align:center;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.4);margin:0;line-height:1.6;">
              Tryon History Museum · 26 Maple Street, Tryon NC 28782<br />
              <a href="mailto:info@tryonhistorymuseum.org" style="color:#C4A35A;text-decoration:none;">info@tryonhistorymuseum.org</a>
              · <a href="https://tryonhistorymuseum.org" style="color:#C4A35A;text-decoration:none;">tryonhistorymuseum.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const notificationSent = await sendEmail(resend, "notification", {
    from: "Tryon History Museum <info@tryonhistorymuseum.org>",
    to: "info@tryonhistorymuseum.org",
    replyTo: submission.email,
    subject: "THM - Board Member Interest",
    html: notificationHtml,
  });

  if (!notificationSent) {
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 502 });
  }

  await sendEmail(resend, "confirmation", {
    from: "Tryon History Museum <info@tryonhistorymuseum.org>",
    to: submission.email,
    subject: "Thank you for your interest in the Tryon History Museum Board",
    html: confirmationHtml,
  });

  return NextResponse.json({ success: true });
}
