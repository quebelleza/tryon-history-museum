import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { expirationWarningEmail } from "@/lib/emails/expirationWarning";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Authenticate: either admin session or CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    // Fall back to checking admin session
    const { verifyAdmin } = await import("@/lib/supabase/adminAuth");
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const supabase = createAdminClient();

  // Get all expiring_soon members who haven't been emailed a warning in the last 7 days
  const { data: members, error } = await supabase
    .from("members")
    .select("id, first_name, email, membership_tier, expiration_date")
    .eq("status", "expiring_soon")
    .not("email", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check email_log to avoid duplicate sends within 7 days
  const memberIds = members.map((m) => m.id);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentLogs } = await supabase
    .from("email_log")
    .select("member_id")
    .eq("email_type", "expiration_warning")
    .in("member_id", memberIds)
    .gte("created_at", sevenDaysAgo.toISOString());

  const alreadySent = new Set((recentLogs || []).map((l) => l.member_id));
  const toSend = members.filter((m) => !alreadySent.has(m.id));

  const results = [];

  for (const member of toSend) {
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
        email_type: "expiration_warning",
        sent_to: member.email,
        status: sendError ? "failed" : "sent",
        resend_id: sendData?.id || null,
      });

      results.push({ memberId: member.id, status: sendError ? "failed" : "sent" });
    } catch (err) {
      await supabase.from("email_log").insert({
        member_id: member.id,
        email_type: "expiration_warning",
        sent_to: member.email,
        status: "error",
        resend_id: null,
      });
      results.push({ memberId: member.id, status: "error", error: err.message });
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
