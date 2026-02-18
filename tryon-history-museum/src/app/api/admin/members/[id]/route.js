import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { id } = await params;

  // Get member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 404 });

  // Get payments
  const { data: payments } = await supabase
    .from("membership_payments")
    .select("*")
    .eq("member_id", id)
    .order("payment_date", { ascending: false });

  // Get board assignments
  const { data: assignments } = await supabase
    .from("board_assignments")
    .select("*")
    .eq("member_id", id)
    .order("assigned_date", { ascending: false });

  return NextResponse.json({
    member,
    payments: payments || [],
    assignments: assignments || [],
  });
}

export async function PATCH(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("members")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ member: data });
}

export async function DELETE(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { id } = await params;

  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
