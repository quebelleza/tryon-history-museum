import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateVolunteerInput, VOLUNTEER_STATUSES } from "@/lib/volunteers";

export async function GET(request, { params }) {
  const { hasAdminAccess, role } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("volunteers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }

  // Check if linked member exists
  let memberName = null;
  if (data.member_id) {
    const { data: member } = await supabase
      .from("members")
      .select("first_name, last_name")
      .eq("id", data.member_id)
      .single();
    if (member) {
      memberName = `${member.first_name} ${member.last_name}`;
    }
  }

  return NextResponse.json({ volunteer: { ...data, member_name: memberName }, role });
}

export async function PATCH(request, { params }) {
  const { hasAdminAccess, isAdmin } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const supabase = createAdminClient();
  const statusOnly = Object.keys(body).every((key) => key === "status");

  if (statusOnly) {
    if (!VOLUNTEER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { data, error } = await supabase.from("volunteers").update({ status: body.status }).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ volunteer: data });
  }

  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const validated = validateVolunteerInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });

  const { data: member } = await supabase.from("members").select("id").ilike("email", validated.data.email).maybeSingle();
  const { data, error } = await supabase
    .from("volunteers")
    .update({ ...validated.data, member_id: member?.id || null })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ volunteer: data });
}

export async function DELETE(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { error } = await createAdminClient().from("volunteers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
