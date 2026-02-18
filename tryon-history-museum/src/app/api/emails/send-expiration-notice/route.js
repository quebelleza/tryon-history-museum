import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { expirationNoticeEmail } from "@/lib/emails/expirationNotice";

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Authenticate: either admin session or CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    const { verifyAdmin } = await import("@/lib/supabase/adminAuth");
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const supabase = createAdminClient();

  // Get members whose expiration_date is today and status just changed to expired
  const today = new Date().toISOString().split("T")[0];

  const { data: members, error } = await supabase
    .from("members")
    .select("id, first_name, email, expiration_date")
    .eq("status", "expired")
    .eq("expiration_date", today)
    .not("email", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check email_log to avoid duplicate sends today
  const memberIds = members.map((m) => m.id);
  const startOfDay = new Date(today + "T00:00:00Z").toISOString();

  const { data: recentLogs } = await supabase
    .from("email_log")
    .select("member_id")
    .eq("email_type", "expiration_notice")
    .in("member_id", memberIds)
    .gte("created_at", startOfDay);

  const alreadySent = new Set((recentLogs || []).map((l) => l.member_id));
  const toSend = members.filter((m) => !alreadySent.has(m.id));

  const results = [];

  for (const member of toSend) {
    const { subject, html } = expirationNoticeEmail({
      firstName: member.first_name,
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
        email_type: "expiration_notice",
        sent_to: member.email,
        status: sendError ? "failed" : "sent",
        resend_id: sendData?.id || null,
      });

      results.push({ memberId: member.id, status: sendError ? "failed" : "sent" });
    } catch (err) {
      await supabase.from("email_log").insert({
        member_id: member.id,
        email_type: "expiration_notice",
        sent_to: member.email,
        status: "error",
        resend_id: null,
      });
      results.push({ memberId: member.id, status: "error", error: err.message });
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
