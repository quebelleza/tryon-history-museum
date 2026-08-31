import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 *
 * Returns one of three states:
 *   { state: "new" }                              — no record, proceed normally
 *   { state: "member_no_auth", firstName: string } — member exists, no auth account yet
 *   { state: "member_has_auth", firstName: string } — member exists with account
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body?.email?.trim()?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ state: "new" });
  }

  const supabase = createAdminClient();
  const { data: member } = await supabase
    .from("members")
    .select("first_name, auth_user_id")
    .ilike("email", email)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ state: "new" });
  }

  if (member.auth_user_id) {
    return NextResponse.json({ state: "member_has_auth", firstName: member.first_name });
  }

  return NextResponse.json({ state: "member_no_auth", firstName: member.first_name });
}
