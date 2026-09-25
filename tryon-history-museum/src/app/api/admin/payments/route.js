import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { computePayment } from "@/lib/membershipPricing";

const PAYMENT_METHODS = new Set(["stripe", "check", "cash", "other"]);
const PAYMENT_TYPES = new Set(["new_member", "renewal", "donation", "upgrade"]);

export async function POST(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const amount = Number(body.amount);
  const paymentType = body.payment_type === "new" || body.payment_type === "new_membership"
    ? "new_member"
    : body.payment_type;

  if (!body.member_id || !body.payment_date || !Number.isFinite(amount) || amount <= 0 ||
      !PAYMENT_METHODS.has(body.payment_method) || !PAYMENT_TYPES.has(paymentType)) {
    return NextResponse.json({ error: "Please provide a valid member, date, amount, method, and payment type." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, renewal_due_date, expiration_date")
    .eq("id", body.member_id)
    .single();

  if (memberError || !member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const computed = computePayment(amount, body.payment_date, paymentType, {
    existing: true,
    renewalDueDate: member.renewal_due_date || member.expiration_date,
  });
  const { data, error } = await supabase
    .from("membership_payments")
    .insert({
      member_id: member.id,
      payment_date: body.payment_date,
      amount,
      payment_method: body.payment_method,
      payment_type: paymentType,
      membership_fee: computed.isDonation ? 0 : computed.membershipFee,
      additional_donation: computed.additionalDonation,
      donor_name: `${member.first_name} ${member.last_name}`.trim(),
      donor_email: member.email,
      source: "admin",
      status: "completed",
      notes: body.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: replayError } = await supabase.rpc("replay_member_payment_history", { p_member_id: member.id });
  if (replayError) return NextResponse.json({ error: replayError.message }, { status: 500 });
  const { data: replayedPayment } = await supabase.from("membership_payments").select("*").eq("id", data.id).single();

  return NextResponse.json({ payment: replayedPayment || data });
}
