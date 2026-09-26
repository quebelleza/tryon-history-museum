import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateVolunteerInput } from "@/lib/volunteers";

export async function GET(request) {
  const { hasAdminAccess, role } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const area = searchParams.get("area");
  const search = searchParams.get("search");

  let query = supabase
    .from("volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (area) {
    query = query.contains("volunteer_areas", [area]);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ volunteers: data || [], role });
}

export async function POST(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const validated = validateVolunteerInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data: member } = await supabase.from("members").select("id").ilike("email", validated.data.email).maybeSingle();
  const { data, error } = await supabase
    .from("volunteers")
    .insert({ ...validated.data, member_id: member?.id || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ volunteer: data }, { status: 201 });
}
