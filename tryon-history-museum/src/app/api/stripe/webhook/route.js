import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renewalConfirmationEmail } from "@/lib/emails/renewalConfirmation";
import { computeMembership } from "@/lib/membershipPricing";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const memberId = session.metadata?.member_id;
    const tier = session.metadata?.membership_tier || "individual";
    const amountPaid = (session.amount_total || 0) / 100;

    if (!memberId) {
      console.error("[stripe-webhook] No member_id in metadata");
      return NextResponse.json({ error: "No member_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get the current member
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      console.error("[stripe-webhook] Member not found:", memberId);
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Compute new membership details
    const today = new Date().toISOString().split("T")[0];
    const computed = computeMembership(amountPaid, today);

    // Extend expiration: from today + 1 year (or from current expiration if still active)
    let baseDate = new Date();
    if (member.expiration_date) {
      const currentExp = new Date(member.expiration_date + "T12:00:00");
      if (currentExp > baseDate) {
        baseDate = currentExp;
      }
    }
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    const newExpiration = baseDate.toISOString().split("T")[0];

    // Update member record
    await supabase
      .from("members")
      .update({
        membership_tier: tier,
        status: "active",
        expiration_date: newExpiration,
        last_payment_date: today,
        last_payment_amount: amountPaid,
        membership_fee: computed.membershipFee,
        additional_donation: computed.additionalDonation,
        donor_class: computed.donorClass,
        member_label: computed.memberLabel,
      })
      .eq("id", memberId);

    // Create payment record
    await supabase.from("membership_payments").insert({
      member_id: memberId,
      payment_date: today,
      amount: amountPaid,
      payment_method: "stripe",
      payment_type: "renewal",
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      payment_year: new Date().getFullYear(),
      notes: `Stripe session ${session.id}`,
    });

    // Send renewal confirmation email
    if (member.email) {
      const { subject, html } = renewalConfirmationEmail({
        firstName: member.first_name,
        tier,
        expirationDate: formatDate(newExpiration),
      });

      try {
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: "Tryon History Museum <info@tryonhistorymuseum.org>",
          to: member.email,
          subject,
          html,
        });

        await supabase.from("email_log").insert({
          member_id: memberId,
          email_type: "renewal_confirmation",
          sent_to: member.email,
          status: sendError ? "failed" : "sent",
          resend_id: sendData?.id || null,
        });
      } catch (emailErr) {
        console.error("[stripe-webhook] Email send error:", emailErr.message);
        await supabase.from("email_log").insert({
          member_id: memberId,
          email_type: "renewal_confirmation",
          sent_to: member.email,
          status: "error",
          resend_id: null,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

