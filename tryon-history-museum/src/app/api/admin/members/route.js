import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { welcomeEmail } from "@/lib/emails/welcomeEmail";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

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
    send_welcome_email,
    ...memberFields
  } = body;

  const amt = parseFloat(payment_amount) || 0;
  const pDate = payment_date || new Date().toISOString().split("T")[0];
  const pType = payment_type || "new_member";

  if (send_welcome_email === true) {
    if (typeof memberFields.email !== "string" || !memberFields.email.trim()) {
      return NextResponse.json({ error: "An email address is required to send the welcome email and receipt." }, { status: 400 });
    }
    if (amt <= 0 || pType !== "new_member") {
      return NextResponse.json({ error: "A new-member payment is required to send the welcome email and receipt." }, { status: 400 });
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email delivery is temporarily unavailable. The member was not created." }, { status: 503 });
    }
  }

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
      memberFields.expiration_date = computed.renewalDueDate;
      memberFields.last_payment_date = pDate;
      memberFields.last_payment_amount = amt;
      memberFields.membership_fee = computed.membershipFee;
      memberFields.additional_donation = computed.additionalDonation;

      if (pType === "new_member" && computed.membershipStartDate) {
        memberFields.start_date = computed.membershipStartDate;
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

  // Sync deprecated ↔ authoritative start columns
  if (memberFields.start_date && !memberFields.membership_start_date) memberFields.membership_start_date = memberFields.start_date;
  if (memberFields.membership_start_date && !memberFields.start_date) memberFields.start_date = memberFields.membership_start_date;

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

  let welcomeEmailSent = false;
  let warning = null;

  if (send_welcome_email === true) {
    let setupLink = null;
    try {
      const email = memberFields.email.trim().toLowerCase();
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { first_name: data.first_name, last_name: data.last_name },
      });

      if (!createError && createData?.user?.id) {
        await supabase.from("members").update({ auth_user_id: createData.user.id }).eq("id", data.id);
      } else if (createError) {
        console.error("[admin-members] createUser error:", createError.message);
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: "https://www.tryonhistorymuseum.org/auth/callback?next=/member/set-password",
        },
      });
      if (!linkError) setupLink = linkData?.properties?.action_link || null;
      else console.error("[admin-members] generateLink error:", linkError.message);
    } catch (error) {
      console.error("[admin-members] auth setup error:", error.message);
    }

    const { subject, html } = welcomeEmail({
      firstName: data.first_name,
      expirationDate: formatDate(data.expiration_date || data.renewal_due_date),
      amount: amt,
      paymentDate: formatDate(pDate),
      setupLink,
    });

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: "Tryon History Museum <info@tryonhistorymuseum.org>",
        to: memberFields.email.trim(),
        subject,
        html,
      });
      welcomeEmailSent = !sendError;
      if (sendError) warning = "The member was created, but the welcome email and receipt could not be sent.";
      await supabase.from("email_log").insert({
        member_id: data.id,
        email_type: "welcome",
        sent_to: memberFields.email.trim(),
        status: sendError ? "failed" : "sent",
        resend_id: sendData?.id || null,
      });
    } catch (error) {
      console.error("[admin-members] Welcome email error:", error.message);
      warning = "The member was created, but the welcome email and receipt could not be sent.";
      await supabase.from("email_log").insert({
        member_id: data.id,
        email_type: "welcome",
        sent_to: memberFields.email.trim(),
        status: "error",
        resend_id: null,
      });
    }
  }

  return NextResponse.json({ member: data, welcomeEmailSent, warning });
}
