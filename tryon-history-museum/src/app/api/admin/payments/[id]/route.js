import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeMembership } from "@/lib/membershipPricing";

/**
 * PATCH /api/admin/payments/[id] — update a payment and recalculate member fields
 */
export async function PATCH(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "You don't have permission to perform this action. Please contact the Museum Administrator." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { id } = await params;
  const body = await request.json();

  // Update the payment record
  const { data: payment, error } = await supabase
    .from("membership_payments")
    .update({
      payment_date: body.payment_date,
      amount: parseFloat(body.amount),
      payment_type: body.payment_type,
      payment_method: body.payment_method,
      notes: body.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recalculate member fields from this payment
  const memberId = payment.member_id;
  const amt = parseFloat(payment.amount) || 0;
  const pType = payment.payment_type || "new_member";
  const computed = computeMembership(amt, payment.payment_date, pType);

  const memberUpdate = {
    last_payment_date: payment.payment_date,
    last_payment_amount: amt,
  };

  if (!computed.isDonation) {
    memberUpdate.membership_tier = computed.membershipTier;
    memberUpdate.donor_level = computed.donorLevel;
    memberUpdate.donor_class = computed.donorLevel;
    memberUpdate.member_label = computed.memberLabel;
    memberUpdate.membership_fee = computed.membershipFee;
    memberUpdate.additional_donation = computed.additionalDonation;
    memberUpdate.renewal_due_date = computed.renewalDueDate;
  }

  // Find the most recent payment for this member to set last_payment fields
  const { data: latestPayments } = await supabase
    .from("membership_payments")
    .select("payment_date, amount")
    .eq("member_id", memberId)
    .order("payment_date", { ascending: false })
    .limit(1);

  if (latestPayments && latestPayments.length > 0) {
    memberUpdate.last_payment_date = latestPayments[0].payment_date;
    memberUpdate.last_payment_amount = parseFloat(latestPayments[0].amount);
  }

  await supabase.from("members").update(memberUpdate).eq("id", memberId);

  // Re-fetch updated member
  const { data: updatedMember } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();

  return NextResponse.json({ payment, member: updatedMember });
}

/**
 * DELETE /api/admin/payments/[id] — delete a payment and recalculate member fields
 */
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

  // Get the payment first to know the member_id
  const { data: payment, error: fetchErr } = await supabase
    .from("membership_payments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });

  const memberId = payment.member_id;

  // Delete the payment
  const { error } = await supabase.from("membership_payments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Find the next most recent payment for this member
  const { data: remaining } = await supabase
    .from("membership_payments")
    .select("payment_date, amount, payment_type")
    .eq("member_id", memberId)
    .order("payment_date", { ascending: false })
    .limit(1);

  const memberUpdate = {};

  if (remaining && remaining.length > 0) {
    const latest = remaining[0];
    memberUpdate.last_payment_date = latest.payment_date;
    memberUpdate.last_payment_amount = parseFloat(latest.amount);

    // Recalculate membership from latest remaining payment
    const computed = computeMembership(
      parseFloat(latest.amount),
      latest.payment_date,
      latest.payment_type || "new_member"
    );
    if (!computed.isDonation) {
      memberUpdate.membership_tier = computed.membershipTier;
      memberUpdate.donor_level = computed.donorLevel;
      memberUpdate.donor_class = computed.donorLevel;
      memberUpdate.member_label = computed.memberLabel;
      memberUpdate.membership_fee = computed.membershipFee;
      memberUpdate.additional_donation = computed.additionalDonation;
      memberUpdate.renewal_due_date = computed.renewalDueDate;
    }
  } else {
    // No remaining payments
    memberUpdate.last_payment_date = null;
    memberUpdate.last_payment_amount = null;
  }

  await supabase.from("members").update(memberUpdate).eq("id", memberId);

  // Re-fetch updated member
  const { data: updatedMember } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();

  return NextResponse.json({ success: true, member: updatedMember });
}
