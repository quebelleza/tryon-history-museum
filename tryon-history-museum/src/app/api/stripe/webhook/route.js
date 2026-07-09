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

function buildNotificationEmail({ type, name, email, amount, memberId, date }) {
  const formattedAmount = `$${parseFloat(amount).toFixed(2)}`;
  const typeLabel =
    type === "new_member" ? "New Membership" :
    type === "renewal" ? "Membership Renewal" :
    type === "donation" ? "Donation" : "Payment";

  return {
    subject: `[THM] ${typeLabel} — ${name} — ${formattedAmount}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1A1311; margin-bottom: 8px;">${typeLabel} Received</h2>
        <p style="color: #666; margin-top: 0; margin-bottom: 24px; font-size: 14px;">${date}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">Type</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Amount</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px; font-weight: bold;">${formattedAmount}</td>
          </tr>
          ${memberId ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Member ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${memberId}</td>
          </tr>` : ""}
        </table>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">
          This is an automated notification from the Tryon History Museum website. Log in to the
          <a href="https://tryonhistorymuseum.org/admin/dashboard" style="color: #7B2D26;">admin dashboard</a>
          to view full details.
        </p>
      </div>
    `,
  };
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

    // ── Universal staff alert (fires for ALL payment types) ──
    try {
      const alertPaymentType = session.metadata?.payment_type || "unknown";
      const alertTypeLabel =
        alertPaymentType === "new_member" ? "New Membership" :
        alertPaymentType === "renewal" ? "Membership Renewal" :
        alertPaymentType === "donation" ? "Donation" : "Payment";
      const alertName = session.customer_details?.name || session.metadata?.first_name
        ? `${session.metadata?.first_name || ""} ${session.metadata?.last_name || ""}`.trim() || session.customer_details?.name
        : "Unknown";
      const alertEmail = session.customer_email || session.customer_details?.email || "—";
      const alertMemberId = session.metadata?.member_id || null;
      const alertTimestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "long", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", timeZoneName: "short",
      });
      const alertAmount = `$${amountPaid.toFixed(2)}`;

      await resend.emails.send({
        from: "Tryon History Museum <info@tryonhistorymuseum.org>",
        to: ["info@tryonhistorymuseum.org"],
        subject: `New THM website payment: ${alertAmount}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1A1311; margin-bottom: 4px;">New Website Payment Received</h2>
            <p style="color: #888; margin-top: 0; margin-bottom: 24px; font-size: 13px;">${alertTimestamp}</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">Type</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${alertTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Amount</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px; font-weight: bold;">${alertAmount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${alertName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${alertEmail}</td>
              </tr>
              ${alertMemberId ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Member ID</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${alertMemberId}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Stripe Session</td>
                <td style="padding: 10px 0; color: #1A1311; font-size: 13px; font-family: monospace;">${session.id}</td>
              </tr>
            </table>
            <p style="margin-top: 24px; font-size: 12px; color: #aaa;">
              Automated alert from tryonhistorymuseum.org —
              <a href="https://tryonhistorymuseum.org/admin/dashboard" style="color: #7B2D26;">Admin dashboard</a>
            </p>
          </div>
        `,
      });
    } catch (alertErr) {
      console.error("[webhook] Universal staff alert failed:", alertErr.message);
    }

    // ── Donation ──
    if (session.metadata?.payment_type === "donation") {
      const donorEmail = session.customer_email || session.customer_details?.email || "unknown";
      const donorName = session.customer_details?.name || "Anonymous";

      try {
        const { subject, html } = buildNotificationEmail({
          type: "donation",
          name: donorName,
          email: donorEmail,
          amount: amountPaid,
          memberId: null,
          date: today,
        });
        await resend.emails.send({
          from: "Tryon History Museum <info@tryonhistorymuseum.org>",
          to: ["info@tryonhistorymuseum.org", "wanda@tdowntowntryon.org"],
          subject,
          html,
        });
      } catch (notifyErr) {
        console.error("[webhook] Donation notification error:", notifyErr.message);
      }

      return NextResponse.json({ received: true });
    }

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

        try {
          const { subject, html } = buildNotificationEmail({
            type: "renewal",
            name: `${existingMember.first_name} ${existingMember.last_name}`,
            email: existingMember.email,
            amount: amountPaid,
            memberId: existingMember.member_id,
            date: today,
          });
          await resend.emails.send({
            from: "Tryon History Museum <info@tryonhistorymuseum.org>",
            to: ["info@tryonhistorymuseum.org", "wmay@tds.net"],
            subject,
            html,
          });
        } catch (notifyErr) {
          console.error("[webhook] Staff notification error:", notifyErr.message);
        }

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
            try {
              await supabase.from("email_log").insert({
                member_id: existingMember.id,
                email_type: "renewal_confirmation",
                sent_to: existingMember.email,
                status: sendError ? "failed" : "sent",
                resend_id: sendData?.id || null,
              });
            } catch (logErr) {
              console.error("[stripe-webhook] email_log insert failed:", logErr.message);
            }
          } catch (emailErr) {
            console.error("[stripe-webhook] Email send error:", emailErr.message);
            try {
              await supabase.from("email_log").insert({
                member_id: existingMember.id,
                email_type: "renewal_confirmation",
                sent_to: existingMember.email,
                status: "error",
                resend_id: null,
              });
            } catch (logErr) {
              console.error("[stripe-webhook] email_log insert failed:", logErr.message);
            }
          }
        }
      } else {
        // Brand new member
        const computed = computeMembership(amountPaid, today, "new_member");
        const { data: newMember, error: insertError } = await supabase.from("members").insert({
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
          donor_level: computed.donorLevel || "none",
          donor_class: computed.donorLevel || "none",
          member_label: computed.memberLabel || "member",
          member_source: "online",
        }).select().single();

        if (insertError) {
          console.error("[stripe-webhook] Member insert error:", JSON.stringify(insertError));
          return NextResponse.json({ received: true });
        }

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

          try {
            const { subject, html } = buildNotificationEmail({
              type: "new_member",
              name: `${firstName} ${lastName}`,
              email,
              amount: amountPaid,
              memberId: newMember.member_id,
              date: today,
            });
            await resend.emails.send({
              from: "Tryon History Museum <info@tryonhistorymuseum.org>",
              to: ["info@tryonhistorymuseum.org", "wmay@tds.net"],
              subject,
              html,
            });
          } catch (notifyErr) {
            console.error("[webhook] Staff notification error:", notifyErr.message);
          }

          if (email) {
            const { subject, html } = welcomeEmail({
              firstName,
              expirationDate: formatDate(computed.renewalDueDate),
              amount: amountPaid,
            });
            try {
              const { data: sendData, error: sendError } = await resend.emails.send({
                from: "Tryon History Museum <info@tryonhistorymuseum.org>",
                to: email,
                subject,
                html,
              });
              try {
                await supabase.from("email_log").insert({
                  member_id: newMember.id,
                  email_type: "welcome",
                  sent_to: email,
                  status: sendError ? "failed" : "sent",
                  resend_id: sendData?.id || null,
                });
              } catch (logErr) {
                console.error("[stripe-webhook] email_log insert failed:", logErr.message);
              }
            } catch (emailErr) {
              console.error("[stripe-webhook] Welcome email error:", emailErr.message);
              try {
                await supabase.from("email_log").insert({
                  member_id: newMember.id,
                  email_type: "welcome",
                  sent_to: email,
                  status: "error",
                  resend_id: null,
                });
              } catch (logErr) {
                console.error("[stripe-webhook] email_log insert failed:", logErr.message);
              }
            }
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    // ── Authenticated member checkout (new activation or renewal) ──
    // client_reference_id is the member UUID set at checkout creation; fall back to metadata
    const refId = session.client_reference_id || session.metadata?.member_id;

    if (!refId) {
      console.error("[stripe-webhook] No client_reference_id or member_id in session");
      return NextResponse.json({ error: "No member reference" }, { status: 400 });
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("id", refId)
      .single();

    if (memberError || !member) {
      console.error("[stripe-webhook] Member not found for ref:", refId);
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const isNewActivation = member.status === "pending";
    const computed = computeMembership(amountPaid, today, isNewActivation ? "new_member" : "renewal");

    // Generate THM-#### member ID for first-time activations that don't have one yet
    let assignedMemberId = member.member_id;
    if (isNewActivation && !assignedMemberId) {
      const { data: topMember } = await supabase
        .from("members")
        .select("member_id")
        .like("member_id", "THM-%")
        .order("member_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNum = 1;
      if (topMember?.member_id) {
        const parsed = parseInt(topMember.member_id.replace("THM-", ""), 10);
        if (!isNaN(parsed)) nextNum = parsed + 1;
      }
      assignedMemberId = `THM-${String(nextNum).padStart(4, "0")}`;
    }

    // Build update fields — activation sets start date and assigns member ID
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

    if (isNewActivation) {
      updateFields.membership_start_date = today;
      if (assignedMemberId && !member.member_id) {
        updateFields.member_id = assignedMemberId;
      }
    }

    await supabase.from("members").update(updateFields).eq("id", member.id);

    // Payment record
    await supabase.from("membership_payments").insert({
      member_id: member.id,
      payment_date: today,
      amount: amountPaid,
      payment_method: "stripe",
      payment_type: isNewActivation ? "new_member" : "renewal",
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      notes: `Stripe session ${session.id}`,
    });

    // Staff notification
    try {
      const { subject, html } = buildNotificationEmail({
        type: isNewActivation ? "new_member" : "renewal",
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        amount: amountPaid,
        memberId: assignedMemberId || member.member_id,
        date: today,
      });
      await resend.emails.send({
        from: "Tryon History Museum <info@tryonhistorymuseum.org>",
        to: ["info@tryonhistorymuseum.org", "wmay@tds.net"],
        subject,
        html,
      });
    } catch (notifyErr) {
      console.error("[webhook] Staff notification error:", notifyErr.message);
    }

    // Member email — welcome for first activation, renewal confirmation for renewals
    if (member.email) {
      const emailType = isNewActivation ? "welcome" : "renewal_confirmation";
      const { subject, html } = isNewActivation
        ? welcomeEmail({
            firstName: member.first_name,
            expirationDate: formatDate(computed.renewalDueDate),
            amount: amountPaid,
          })
        : renewalConfirmationEmail({
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
          member_id: member.id,
          email_type: emailType,
          sent_to: member.email,
          status: sendError ? "failed" : "sent",
          resend_id: sendData?.id || null,
        });
      } catch (emailErr) {
        console.error("[stripe-webhook] Email send error:", emailErr.message);
        await supabase.from("email_log").insert({
          member_id: member.id,
          email_type: emailType,
          sent_to: member.email,
          status: "error",
          resend_id: null,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

