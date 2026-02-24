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

  // Backfill last_payment fields from membership_payments for members missing them
  const members = data || [];
  const needBackfill = members.filter(
    (m) => m.last_payment_date == null || m.last_payment_amount == null
  );
  if (needBackfill.length > 0) {
    const ids = needBackfill.map((m) => m.id);
    const { data: payments } = await supabase
      .from("membership_payments")
      .select("member_id, payment_date, amount")
      .in("member_id", ids)
      .order("payment_date", { ascending: false });

    if (payments && payments.length > 0) {
      // Keep only the most recent payment per member
      const latestByMember = {};
      for (const p of payments) {
        if (!latestByMember[p.member_id]) latestByMember[p.member_id] = p;
      }
      for (const m of members) {
        const lp = latestByMember[m.id];
        if (lp) {
          if (m.last_payment_date == null) m.last_payment_date = lp.payment_date;
          if (m.last_payment_amount == null) m.last_payment_amount = lp.amount;
        }
      }
    }
  }

  return NextResponse.json({
    members,
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

  const {
    payment_amount,
    payment_date,
    payment_method,
    payment_type,
    membership_fee: _mf,
    additional_donation: _ad,
    pricing_year: _py,
    effective_access_tier: _eat,
    ...memberFields
  } = body;

  const amt = parseFloat(payment_amount) || 0;
  const pDate = payment_date || new Date().toISOString().split("T")[0];
  const pType = payment_type || "new_member";

  // Always ensure donor_class has a valid new-enum value
  if (!memberFields.donor_class) memberFields.donor_class = "none";

  if (amt > 0) {
    const { computeMembership } = await import("@/lib/membershipPricing");
    const computed = computeMembership(amt, pDate, pType);

    if (!computed.isDonation) {
      memberFields.membership_tier = computed.membershipTier;
      memberFields.donor_level = computed.donorLevel;
      memberFields.donor_class = computed.donorLevel;
      memberFields.member_label = computed.memberLabel;
      memberFields.status = computed.status;
      memberFields.renewal_due_date = computed.renewalDueDate;
      memberFields.last_payment_date = pDate;
      memberFields.last_payment_amount = amt;
      memberFields.membership_fee = computed.membershipFee;
      memberFields.additional_donation = computed.additionalDonation;

      if (pType === "new_member" && computed.membershipStartDate) {
        memberFields.membership_start_date = computed.membershipStartDate;
      }

      if (computed.belowMinimum) {
        memberFields.notes = [memberFields.notes, computed.note].filter(Boolean).join(" | ");
      }
    } else {
      memberFields.last_payment_date = pDate;
      memberFields.last_payment_amount = amt;
    }
  }

  const { data, error } = await supabase.from("members").insert(memberFields).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (amt > 0) {
    const { computeMembership } = await import("@/lib/membershipPricing");
    const computed = computeMembership(amt, pDate, pType);

    await supabase.from("membership_payments").insert({
      member_id: data.id,
      payment_date: pDate,
      amount: amt,
      payment_method: payment_method || "check",
      payment_type: pType,
      membership_fee: computed.isDonation ? 0 : computed.membershipFee,
      additional_donation: computed.additionalDonation,
      notes: computed.belowMinimum ? computed.note : null,
    });
  }

  return NextResponse.json({ member: data });
}
