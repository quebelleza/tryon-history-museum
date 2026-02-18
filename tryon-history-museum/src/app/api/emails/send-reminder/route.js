import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { expirationWarningEmail } from "@/lib/emails/expirationWarning";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Manually send a reminder email to a specific member (admin only).
 */
export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { member_id } = await request.json();
  if (!member_id) {
    return NextResponse.json({ error: "member_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("id, first_name, email, membership_tier, expiration_date")
    .eq("id", member_id)
    .single();

  if (error || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (!member.email) {
    return NextResponse.json({ error: "Member has no email address" }, { status: 400 });
  }

  const { subject, html } = expirationWarningEmail({
    firstName: member.first_name,
    tier: member.membership_tier,
    expirationDate: formatDate(member.expiration_date),
  });

  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: member.email,
      subject,
      html,
    });

    await supabase.from("email_log").insert({
      member_id: member.id,
      email_type: "manual_reminder",
      sent_to: member.email,
      status: sendError ? "failed" : "sent",
      resend_id: sendData?.id || null,
    });

    if (sendError) {
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, resend_id: sendData?.id });
  } catch (err) {
    await supabase.from("email_log").insert({
      member_id: member.id,
      email_type: "manual_reminder",
      sent_to: member.email,
      status: "error",
      resend_id: null,
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
