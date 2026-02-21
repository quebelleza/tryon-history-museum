import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { hasAdminAccess } = await verifyAdmin();
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

  return NextResponse.json({ volunteer: { ...data, member_name: memberName } });
}

export async function PATCH(request, { params }) {
  const { hasAdminAccess } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  // Only allow status updates from this endpoint
  const { status } = body;
  if (!status || !["new", "contacted", "active", "inactive"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("volunteers")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
