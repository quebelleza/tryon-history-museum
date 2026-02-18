import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";

export async function GET() {
  const { hasAdminAccess, role } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  return NextResponse.json({ role });
}
