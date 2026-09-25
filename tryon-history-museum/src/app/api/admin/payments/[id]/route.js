import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { isAdmin } = await verifyAdmin();
  return isAdmin;
}

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();
  const amount = Number(body.amount);
  const paymentType = body.payment_type === "new" || body.payment_type === "new_membership"
    ? "new_member"
    : body.payment_type;
  if (!body.payment_date || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Please provide a valid date and amount." }, { status: 400 });
  }

  const { data: original, error: originalError } = await supabase
    .from("membership_payments")
    .select("member_id")
    .eq("id", id)
    .single();
  if (originalError) return NextResponse.json({ error: originalError.message }, { status: 404 });

  const { error } = await supabase
    .from("membership_payments")
    .update({
      payment_date: body.payment_date,
      amount,
      payment_type: paymentType,
      payment_method: body.payment_method,
      notes: body.notes || null,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (original.member_id) {
    const { error: replayError } = await supabase.rpc("replay_member_payment_history", { p_member_id: original.member_id });
    if (replayError) return NextResponse.json({ error: replayError.message }, { status: 500 });
  }

  const [{ data: payment }, { data: updatedMember }] = await Promise.all([
    supabase.from("membership_payments").select("*").eq("id", id).single(),
    original.member_id ? supabase.from("members").select("*").eq("id", original.member_id).single() : Promise.resolve({ data: null }),
  ]);
  return NextResponse.json({ payment, member: updatedMember });
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { id } = await params;
  const { data: payment, error: fetchError } = await supabase
    .from("membership_payments")
    .select("member_id")
    .eq("id", id)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 404 });

  const { error } = await supabase.from("membership_payments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updatedMember = null;
  if (payment.member_id) {
    const { error: replayError } = await supabase.rpc("replay_member_payment_history", { p_member_id: payment.member_id });
    if (replayError) return NextResponse.json({ error: replayError.message }, { status: 500 });
    const { data } = await supabase.from("members").select("*").eq("id", payment.member_id).single();
    updatedMember = data;
  }

  return NextResponse.json({ success: true, member: updatedMember });
}
