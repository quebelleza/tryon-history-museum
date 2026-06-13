import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renewalConfirmationEmail } from "@/lib/emails/renewalConfirmation";
import { welcomeEmail } from "@/lib/emails/welcomeEmail";
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
    const amountPaid = (session.amount_total || 0) / 100;
    const today = new Date().toISOString().split("T")[0];
    const supabase = createAdminClient();

    // ── New Member (unauthenticated public signup) ──
    if (session.metadata?.payment_type === "new_member") {
      const firstName = session.metadata?.first_name || "";
      const lastName = session.metadata?.last_name || "";
      const email = session.metadata?.email || "";

      const { data: existingMember } = await supabase
        .from("members")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existingMember) {
        // Email already on file — treat as renewal
        const computed = computeMembership(amountPaid, today, "renewal");
        await supabase.from("members").update({
          membership_tier: "individual",
          status: "active",
          renewal_due_date: computed.renewalDueDate,
          last_payment_date: today,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: computed.donorLevel,
          donor_class: computed.donorLevel,
          member_label: computed.memberLabel,
        }).eq("id", existingMember.id);

        await supabase.from("membership_payments").insert({
          member_id: existingMember.id,
          payment_date: today,
          amount: amountPaid,
          payment_method: "stripe",
          payment_type: "renewal",
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          notes: `Stripe session ${session.id}`,
        });

        if (existingMember.email) {
          const { subject, html } = renewalConfirmationEmail({
            firstName: existingMember.first_name,
            tier: "individual",
            expirationDate: formatDate(computed.renewalDueDate),
          });
          try {
            const { data: sendData, error: sendError } = await resend.emails.send({
              from: "Tryon History Museum <info@tryonhistorymuseum.org>",
              to: existingMember.email,
              subject,
              html,
            });
            await supabase.from("email_log").insert({
              member_id: existingMember.id,
              email_type: "renewal_confirmation",
              sent_to: existingMember.email,
              status: sendError ? "failed" : "sent",
              resend_id: sendData?.id || null,
            });
          } catch (emailErr) {
            console.error("[stripe-webhook] Email send error:", emailErr.message);
            await supabase.from("email_log").insert({
              member_id: existingMember.id,
              email_type: "renewal_confirmation",
              sent_to: existingMember.email,
              status: "error",
              resend_id: null,
            });
          }
        }
      } else {
        // Brand new member
        const computed = computeMembership(amountPaid, today, "new_member");
        const { data: newMember } = await supabase.from("members").insert({
          first_name: firstName,
          last_name: lastName,
          email,
          membership_tier: "individual",
          status: "active",
          membership_start_date: today,
          renewal_due_date: computed.renewalDueDate,
          last_payment_date: today,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: "none",
          donor_class: "none",
          member_label: "member",
          member_source: "online",
        }).select().single();

        if (newMember) {
          await supabase.from("membership_payments").insert({
            member_id: newMember.id,
            payment_date: today,
            amount: amountPaid,
            payment_method: "stripe",
            payment_type: "new_member",
            membership_fee: computed.membershipFee,
            additional_donation: computed.additionalDonation,
            notes: `Stripe session ${session.id}`,
          });

          if (email) {
            const { subject, html } = welcomeEmail({
              firstName,
              expirationDate: formatDate(computed.renewalDueDate),
            });
            try {
              const { data: sendData, error: sendError } = await resend.emails.send({
                from: "Tryon History Museum <info@tryonhistorymuseum.org>",
                to: email,
                subject,
                html,
              });
              await supabase.from("email_log").insert({
                member_id: newMember.id,
                email_type: "welcome",
                sent_to: email,
                status: sendError ? "failed" : "sent",
                resend_id: sendData?.id || null,
              });
            } catch (emailErr) {
              console.error("[stripe-webhook] Welcome email error:", emailErr.message);
              await supabase.from("email_log").insert({
                member_id: newMember.id,
                email_type: "welcome",
                sent_to: email,
                status: "error",
                resend_id: null,
              });
            }
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    // ── Renewal (authenticated member with member_id) ──
    const memberId = session.metadata?.member_id;

    if (!memberId) {
      console.error("[stripe-webhook] No member_id in metadata");
      return NextResponse.json({ error: "No member_id" }, { status: 400 });
    }

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
    const computed = computeMembership(amountPaid, today, "renewal");

    // Update member record
    const updateFields = {
      membership_tier: "individual",
      status: "active",
      renewal_due_date: computed.renewalDueDate,
      last_payment_date: today,
      last_payment_amount: amountPaid,
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      donor_level: computed.donorLevel,
      donor_class: computed.donorLevel,
      member_label: computed.memberLabel,
    };

    await supabase
      .from("members")
      .update(updateFields)
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
      notes: `Stripe session ${session.id}`,
    });

    // Send renewal confirmation email
    if (member.email) {
      const { subject, html } = renewalConfirmationEmail({
        firstName: member.first_name,
        tier: "individual",
        expirationDate: formatDate(computed.renewalDueDate),
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

