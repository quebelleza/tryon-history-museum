import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renewalConfirmationEmail } from "@/lib/emails/renewalConfirmation";
import { welcomeEmail } from "@/lib/emails/welcomeEmail";
import { computeMembership, computeDonationMembership } from "@/lib/membershipPricing";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function paymentDateFromSession(session) {
  // session.created is a Unix timestamp (seconds)
  const ms = (session.created ?? Math.floor(Date.now() / 1000)) * 1000;
  // en-CA locale gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

const DONOR_LEVEL_DISPLAY = {
  gillette:   "Gillette Circle",
  simone:     "Nina Simone Circle",
  pacolet:    "Pacolet Society",
  fitzgerald: "Fitzgerald Society",
};

function buildStaffAlert({ typeLabel, amount, donorLevel, name, email, memberId, paymentDate, sessionId, timestamp }) {
  const formattedAmount = `$${parseFloat(amount).toFixed(2)}`;
  const donorRow = donorLevel && donorLevel !== "none" ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">Donor Level</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${DONOR_LEVEL_DISPLAY[donorLevel] || donorLevel}</td>
              </tr>` : "";
  const memberIdRow = memberId ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Member ID</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${memberId}</td>
              </tr>` : "";
  return {
    subject: `[THM] ${typeLabel} — ${name} — ${formattedAmount}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1A1311; margin-bottom: 4px;">New Website Payment Received</h2>
        <p style="color: #666; margin-top: 0; margin-bottom: 24px; font-size: 14px;">${timestamp}</p>
        <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">Type</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Amount</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px; font-weight: bold;">${formattedAmount}</td>
              </tr>${donorRow}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${email}</td>
              </tr>${memberIdRow}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Payment Date</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #1A1311; font-size: 14px;">${paymentDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 13px;">Stripe Session</td>
                <td style="padding: 10px 0; color: #1A1311; font-size: 13px; font-family: monospace;">${sessionId}</td>
              </tr>
        </table>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">
          Automated alert from tryonhistorymuseum.org —
          <a href="https://tryonhistorymuseum.org/admin/dashboard" style="color: #7B2D26;">Admin dashboard</a>
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

  const supabase = createAdminClient();

  // Idempotency guard — deduplicate Stripe retries
  const { error: idempotencyError } = await supabase
    .from("processed_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
      console.log(`[stripe-webhook] Duplicate event ${event.id} — skipping`);
      return NextResponse.json({ received: true });
    }
    console.error("[stripe-webhook] Idempotency insert error:", idempotencyError.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const amountPaid = (session.amount_total || 0) / 100;
    const paymentDate = paymentDateFromSession(session);
    const notificationTimestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });

    const effectiveTier = (dl) => dl && dl !== "none" ? "family" : "individual";

    // ── Donation ──
    if (session.metadata?.payment_type === "donation") {
      const donorEmail = session.customer_email || session.customer_details?.email || "";
      const donorName = session.customer_details?.name || "";
      const computed = computeDonationMembership(amountPaid, paymentDate);

      // < $50 — receipt only, no membership created
      if (!computed.createsMembership) {
        try {
          const { subject, html } = buildStaffAlert({
            typeLabel: "Donation",
            amount: amountPaid,
            donorLevel: null,
            name: donorName || "Anonymous",
            email: donorEmail || "—",
            memberId: null,
            paymentDate,
            sessionId: session.id,
            timestamp: notificationTimestamp,
          });
          await resend.emails.send({
            from: "Tryon History Museum <info@tryonhistorymuseum.org>",
            to: ["info@tryonhistorymuseum.org"],
            subject,
            html,
          });
        } catch (alertErr) {
          console.error("[webhook] Staff alert failed:", alertErr.message);
        }
        return NextResponse.json({ received: true });
      }

      // Donor level rank for upgrade-only logic
      const DONOR_LEVEL_RANK = { none: 0, gillette: 1, simone: 2, pacolet: 3, fitzgerald: 4 };
      const newRank = DONOR_LEVEL_RANK[computed.donorLevel] ?? 0;

      const { data: existingMember } = await supabase
        .from("members")
        .select("*")
        .eq("email", donorEmail)
        .maybeSingle();

      // Collect alert data after DB work
      let alertMemberId = null;
      let alertDonorLevel = computed.donorLevel;
      let alertName = donorName || "Anonymous";

      if (existingMember) {
        // Update donor class only if new level is higher; always roll renewal date forward
        const currentRank = DONOR_LEVEL_RANK[existingMember.donor_level] ?? 0;
        const upgradedLevel = newRank > currentRank ? computed.donorLevel : existingMember.donor_level;
        const upgradedLabel = newRank > currentRank ? computed.memberLabel : existingMember.member_label;

        await supabase.from("members").update({
          status: "active",
          membership_tier: "individual",
          effective_access_tier: effectiveTier(upgradedLevel),
          renewal_due_date: computed.renewalDueDate,
          expiration_date: computed.renewalDueDate,
          last_payment_date: paymentDate,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: upgradedLevel,
          donor_class: upgradedLevel,
          member_label: upgradedLabel,
          stripe_customer_id: session.customer || null,
        }).eq("id", existingMember.id);

        await supabase.from("membership_payments").insert({
          member_id: existingMember.id,
          payment_date: paymentDate,
          amount: amountPaid,
          payment_method: "stripe",
          payment_type: "donation",
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          notes: `Stripe session ${session.id}`,
        });

        alertMemberId = existingMember.member_id;
        alertDonorLevel = upgradedLevel;
        alertName = `${existingMember.first_name} ${existingMember.last_name}`;

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
            console.error("[webhook] Donation renewal email error:", emailErr.message);
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
        // New member auto-enrolled from donation
        const nameParts = donorName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { data: newMember, error: insertError } = await supabase.from("members").insert({
          first_name: firstName,
          last_name: lastName,
          email: donorEmail,
          membership_tier: "individual",
          status: "active",
          effective_access_tier: effectiveTier(computed.donorLevel),
          source: "donation",
          start_date: computed.membershipStartDate,
          membership_start_date: computed.membershipStartDate,
          renewal_due_date: computed.renewalDueDate,
          expiration_date: computed.renewalDueDate,
          last_payment_date: paymentDate,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: computed.donorLevel || "none",
          donor_class: computed.donorLevel || "none",
          member_label: computed.memberLabel || "member",
          stripe_customer_id: session.customer || null,
        }).select().single();

        if (insertError) {
          console.error("[stripe-webhook] Donation member insert error:", JSON.stringify(insertError));
          return NextResponse.json({ received: true });
        }

        if (newMember) {
          await supabase.from("membership_payments").insert({
            member_id: newMember.id,
            payment_date: paymentDate,
            amount: amountPaid,
            payment_method: "stripe",
            payment_type: "donation",
            membership_fee: computed.membershipFee,
            additional_donation: computed.additionalDonation,
            notes: `Stripe session ${session.id}`,
          });

          alertMemberId = newMember.member_id;
          alertName = `${firstName} ${lastName}`;

          if (donorEmail) {
            const { subject, html } = welcomeEmail({
              firstName,
              expirationDate: formatDate(computed.renewalDueDate),
              amount: amountPaid,
            });
            try {
              const { data: sendData, error: sendError } = await resend.emails.send({
                from: "Tryon History Museum <info@tryonhistorymuseum.org>",
                to: donorEmail,
                subject,
                html,
              });
              await supabase.from("email_log").insert({
                member_id: newMember.id,
                email_type: "welcome",
                sent_to: donorEmail,
                status: sendError ? "failed" : "sent",
                resend_id: sendData?.id || null,
              });
            } catch (emailErr) {
              console.error("[webhook] Donation welcome email error:", emailErr.message);
              await supabase.from("email_log").insert({
                member_id: newMember.id,
                email_type: "welcome",
                sent_to: donorEmail,
                status: "error",
                resend_id: null,
              });
            }
          }
        }
      }

      // Single consolidated staff alert after all DB work
      try {
        const { subject, html } = buildStaffAlert({
          typeLabel: "Donation",
          amount: amountPaid,
          donorLevel: alertDonorLevel,
          name: alertName,
          email: donorEmail || "—",
          memberId: alertMemberId,
          paymentDate,
          sessionId: session.id,
          timestamp: notificationTimestamp,
        });
        await resend.emails.send({
          from: "Tryon History Museum <info@tryonhistorymuseum.org>",
          to: ["info@tryonhistorymuseum.org"],
          subject,
          html,
        });
      } catch (alertErr) {
        console.error("[webhook] Staff alert failed:", alertErr.message);
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

      let alertMemberId = null;
      let alertComputedDL = null;
      let alertTypeLabel = "New Membership";
      let alertPersonName = `${firstName} ${lastName}`.trim() || "Unknown";

      if (existingMember) {
        // Email already on file — treat as renewal
        const computed = computeMembership(amountPaid, paymentDate, "renewal");
        await supabase.from("members").update({
          membership_tier: "individual",
          status: "active",
          effective_access_tier: effectiveTier(computed.donorLevel),
          source: "public_renewal",
          renewal_due_date: computed.renewalDueDate,
          expiration_date: computed.renewalDueDate,
          last_payment_date: paymentDate,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: computed.donorLevel,
          donor_class: computed.donorLevel,
          member_label: computed.memberLabel,
          stripe_customer_id: session.customer || null,
        }).eq("id", existingMember.id);

        await supabase.from("membership_payments").insert({
          member_id: existingMember.id,
          payment_date: paymentDate,
          amount: amountPaid,
          payment_method: "stripe",
          payment_type: "renewal",
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          notes: `Stripe session ${session.id}`,
        });

        alertMemberId = existingMember.member_id;
        alertComputedDL = computed.donorLevel;
        alertTypeLabel = "Membership Renewal";
        alertPersonName = `${existingMember.first_name} ${existingMember.last_name}`;

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
        const computed = computeMembership(amountPaid, paymentDate, "new_member");
        const { data: newMember, error: insertError } = await supabase.from("members").insert({
          first_name: firstName,
          last_name: lastName,
          email,
          membership_tier: "individual",
          status: "active",
          effective_access_tier: effectiveTier(computed.donorLevel),
          source: "public_join",
          start_date: paymentDate,
          membership_start_date: paymentDate,
          renewal_due_date: computed.renewalDueDate,
          expiration_date: computed.renewalDueDate,
          last_payment_date: paymentDate,
          last_payment_amount: amountPaid,
          membership_fee: computed.membershipFee,
          additional_donation: computed.additionalDonation,
          donor_level: computed.donorLevel || "none",
          donor_class: computed.donorLevel || "none",
          member_label: computed.memberLabel || "member",
          stripe_customer_id: session.customer || null,
        }).select().single();

        if (insertError) {
          console.error("[stripe-webhook] Member insert error:", JSON.stringify(insertError));
          return NextResponse.json({ received: true });
        }

        if (newMember) {
          await supabase.from("membership_payments").insert({
            member_id: newMember.id,
            payment_date: paymentDate,
            amount: amountPaid,
            payment_method: "stripe",
            payment_type: "new_member",
            membership_fee: computed.membershipFee,
            additional_donation: computed.additionalDonation,
            notes: `Stripe session ${session.id}`,
          });

          alertMemberId = newMember.member_id;
          alertComputedDL = computed.donorLevel;

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

      // Single consolidated staff alert after all DB work
      try {
        const { subject, html } = buildStaffAlert({
          typeLabel: alertTypeLabel,
          amount: amountPaid,
          donorLevel: alertComputedDL,
          name: alertPersonName,
          email: email || "—",
          memberId: alertMemberId,
          paymentDate,
          sessionId: session.id,
          timestamp: notificationTimestamp,
        });
        await resend.emails.send({
          from: "Tryon History Museum <info@tryonhistorymuseum.org>",
          to: ["info@tryonhistorymuseum.org"],
          subject,
          html,
        });
      } catch (alertErr) {
        console.error("[webhook] Staff alert failed:", alertErr.message);
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
    const computed = computeMembership(amountPaid, paymentDate, isNewActivation ? "new_member" : "renewal");

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
      effective_access_tier: effectiveTier(computed.donorLevel),
      source: isNewActivation ? "public_join" : "public_renewal",
      renewal_due_date: computed.renewalDueDate,
      expiration_date: computed.renewalDueDate,
      last_payment_date: paymentDate,
      last_payment_amount: amountPaid,
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      donor_level: computed.donorLevel,
      donor_class: computed.donorLevel,
      member_label: computed.memberLabel,
      stripe_customer_id: session.customer || null,
    };

    if (isNewActivation) {
      updateFields.start_date = paymentDate;
      updateFields.membership_start_date = paymentDate;
      if (assignedMemberId && !member.member_id) {
        updateFields.member_id = assignedMemberId;
      }
    }

    await supabase.from("members").update(updateFields).eq("id", member.id);

    // Payment record
    await supabase.from("membership_payments").insert({
      member_id: member.id,
      payment_date: paymentDate,
      amount: amountPaid,
      payment_method: "stripe",
      payment_type: isNewActivation ? "new_member" : "renewal",
      membership_fee: computed.membershipFee,
      additional_donation: computed.additionalDonation,
      notes: `Stripe session ${session.id}`,
    });

    // Single consolidated staff alert after all DB work
    try {
      const { subject, html } = buildStaffAlert({
        typeLabel: isNewActivation ? "New Membership" : "Membership Renewal",
        amount: amountPaid,
        donorLevel: computed.donorLevel,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email || "—",
        memberId: assignedMemberId || member.member_id,
        paymentDate,
        sessionId: session.id,
        timestamp: notificationTimestamp,
      });
      await resend.emails.send({
        from: "Tryon History Museum <info@tryonhistorymuseum.org>",
        to: ["info@tryonhistorymuseum.org"],
        subject,
        html,
      });
    } catch (alertErr) {
      console.error("[webhook] Staff alert failed:", alertErr.message);
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

