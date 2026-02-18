import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { hasAdminAccess, role } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const tier = searchParams.get("tier") || "";
  const donorClass = searchParams.get("donorClass") || "";
  const sortBy = searchParams.get("sortBy") || "last_name";
  const sortDir = searchParams.get("sortDir") || "asc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = 25;

  let query = supabase.from("members").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }
  if (status) query = query.eq("status", status);
  if (tier) query = query.eq("membership_tier", tier);
  if (donorClass) query = query.eq("donor_class", donorClass);

  query = query.order(sortBy, { ascending: sortDir === "asc" });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    members: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
    role,
  });
}

export async function POST(request) {
  const { hasAdminAccess } = await verifyAdmin();
  if (!hasAdminAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = createAdminClient();
  const body = await request.json();

  // Extract payment-related fields before inserting the member
  const {
    payment_amount,
    payment_date,
    payment_method,
    membership_fee: clientFee,
    additional_donation: clientDonation,
    pricing_year,
    ...memberFields
  } = body;

  // Server-side pricing computation if payment provided
  if (payment_amount && parseFloat(payment_amount) > 0) {
    const { computeMembership } = await import("@/lib/membershipPricing");
    const computed = computeMembership(payment_amount, payment_date || new Date().toISOString().split("T")[0]);

    memberFields.membership_tier = computed.membershipTier;
    memberFields.donor_class = computed.donorClass;
    memberFields.member_label = computed.memberLabel;
    memberFields.status = computed.status;
    memberFields.expiration_date = computed.expirationDate;
    memberFields.last_payment_date = payment_date || new Date().toISOString().split("T")[0];
    memberFields.last_payment_amount = parseFloat(payment_amount);
    memberFields.membership_fee = computed.membershipFee;
    memberFields.additional_donation = computed.additionalDonation;

    if (computed.belowMinimum) {
      memberFields.notes = [memberFields.notes, computed.note].filter(Boolean).join(" | ");
    }
  }

  // Remove fields not in the members table
  delete memberFields.effective_access_tier;

  const { data, error } = await supabase.from("members").insert(memberFields).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create payment record if payment was provided
  if (payment_amount && parseFloat(payment_amount) > 0) {
    const { computeMembership } = await import("@/lib/membershipPricing");
    const computed = computeMembership(payment_amount, payment_date || new Date().toISOString().split("T")[0]);

    await supabase.from("membership_payments").insert({
      member_id: data.id,
      payment_date: payment_date || new Date().toISOString().split("T")[0],
      amount: parseFloat(payment_amount),
      payment_method: payment_method || "check",
      payment_type: "new_membership",
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      payment_year: computed.pricingYear,
      notes: computed.belowMinimum ? computed.note : null,
    });
  }

  return NextResponse.json({ member: data });
}
