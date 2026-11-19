import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventTicketConfirmationEmail } from "@/lib/emails/eventTicketConfirmation";
import { orderReference, formatCents } from "@/lib/ticketing";

/**
 * POST — resend the ticket confirmation email for a paid order.
 * Retryable by design: a failed or unsent confirmation never changes the
 * order's payment status.
 */
export async function POST(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("event_orders")
    .select("*, ticketed_events(*)")
    .eq("id", id)
    .maybeSingle();
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "paid" && order.status !== "comp") {
    return NextResponse.json(
      { error: "Confirmations can only be sent for paid or comp orders." },
      { status: 409 }
    );
  }

  const { data: items } = await supabase
    .from("event_order_items")
    .select("*")
    .eq("order_id", order.id);
  const { data: attendees } = await supabase
    .from("event_order_attendees")
    .select("full_name")
    .eq("order_id", order.id);

  const ev = order.ticketed_events || {};
  const start = ev.starts_at ? new Date(ev.starts_at) : null;
  const dateLabel = start
    ? start.toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "—";
  const timeLabel = start
    ? start.toLocaleTimeString("en-US", {
        timeZone: "America/New_York", hour: "numeric", minute: "2-digit",
      })
    : "—";

  const { subject, html } = eventTicketConfirmationEmail({
    firstName: (order.purchaser_name || "").split(" ")[0] || "Friend",
    eventTitle: ev.title || "Museum Event",
    eventDateLabel: dateLabel,
    eventTime: timeLabel,
    venueName: ev.venue_name || "",
    venueAddress: ev.venue_address || "",
    attendeeCount: (attendees || []).length,
    attendeeNames: (attendees || []).map((a) => a.full_name),
    ticketSummary: (items || []).map((i) => `${i.quantity} × ${i.ticket_label}`).join(" · "),
    amountFormatted: formatCents(order.amount_cents),
    orderReference: orderReference(order.id),
    calendarUrl: `https://tryonhistorymuseum.org/events/${ev.slug}/calendar.ics`,
    refundPolicy: ev.refund_policy || null,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: order.purchaser_email,
      subject,
      html,
    });
    if (!sendError) {
      await supabase
        .from("event_orders")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", order.id);
    }
    await supabase.from("email_log").insert({
      member_id: null,
      email_type: "event_ticket_confirmation",
      sent_to: order.purchaser_email,
      status: sendError ? "failed" : "sent",
      resend_id: sendData?.id || null,
    });
    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    await supabase.from("email_log").insert({
      member_id: null,
      email_type: "event_ticket_confirmation",
      sent_to: order.purchaser_email,
      status: "error",
      resend_id: null,
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
