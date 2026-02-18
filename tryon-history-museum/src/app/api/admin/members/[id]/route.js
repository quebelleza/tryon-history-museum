import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request, { params }) {
  const { hasAdminAccess, role, isAdmin } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { id } = await params;

  // Get member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 404 });

  // Board members cannot view payment records
  let payments = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("member_id", id)
      .order("payment_date", { ascending: false });
    payments = data || [];
  }

  // Get board assignments
  const { data: assignments } = await supabase
    .from("board_assignments")
    .select("*")
    .eq("member_id", id)
    .order("assigned_date", { ascending: false });

  return NextResponse.json({
    member,
    payments,
    assignments: assignments || [],
    role,
  });
}

export async function PATCH(request, { params }) {
  const { hasAdminAccess, isAdmin, isBoardMember } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();

  // Board members can only update member_label
  if (isBoardMember) {
    const allowed = {};
    if (body.member_label !== undefined) allowed.member_label = body.member_label;
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
        { status: 403 }
      );
    }
    const { data, error } = await supabase
      .from("members")
      .update(allowed)
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ member: data });
  }

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
  if (!isAdmin) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { id } = await params;

  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
