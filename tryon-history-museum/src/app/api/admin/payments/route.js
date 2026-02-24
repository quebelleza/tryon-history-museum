import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("membership_payments")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Belt-and-suspenders: explicitly sync last_payment fields to member
  if (data.member_id && data.payment_date && data.amount != null) {
    await supabase
      .from("members")
      .update({
        last_payment_date: data.payment_date,
        last_payment_amount: data.amount,
      })
      .eq("id", data.member_id);
  }

  return NextResponse.json({ payment: data });
}
