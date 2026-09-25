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
    .select("id, first_name, last_name, email")
    .eq("id", body.member_id)
    .single();

  if (memberError || !member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const computed = computePayment(amount, body.payment_date, paymentType);
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

  const memberUpdate = {
    last_payment_date: data.payment_date,
    last_payment_amount: data.amount,
  };
  if (!computed.isDonation) {
    Object.assign(memberUpdate, {
      membership_tier: computed.membershipTier,
      donor_level: computed.donorLevel,
      donor_class: computed.donorLevel,
      member_label: computed.memberLabel,
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      status: computed.status,
      renewal_due_date: computed.renewalDueDate,
      expiration_date: computed.renewalDueDate,
    });
  }
  await supabase.from("members").update(memberUpdate).eq("id", member.id);

  return NextResponse.json({ payment: data });
}
