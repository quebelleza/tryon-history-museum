import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();

  const [totalRes, activeRes, expiringRes, expiredRes] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "expiring_soon"),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "expired"),
  ]);

  return NextResponse.json({
    total: totalRes.count || 0,
    active: activeRes.count || 0,
    expiringSoon: expiringRes.count || 0,
    expired: expiredRes.count || 0,
  });
}
