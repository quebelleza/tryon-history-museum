import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { hasAdminAccess } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Get the 20 most recent email logs, joined with member names
  const { data: logs, error } = await supabase
    .from("email_log")
    .select("id, created_at, member_id, email_type, sent_to, status, resend_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch member names for the logs
  const memberIds = [...new Set(logs.map((l) => l.member_id).filter(Boolean))];
  let memberMap = {};

  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from("members")
      .select("id, first_name, last_name")
      .in("id", memberIds);

    if (members) {
      memberMap = Object.fromEntries(
        members.map((m) => [m.id, `${m.first_name} ${m.last_name}`])
      );
    }
  }

  const enrichedLogs = logs.map((log) => ({
    ...log,
    member_name: memberMap[log.member_id] || null,
  }));

  return NextResponse.json({ logs: enrichedLogs });
}
