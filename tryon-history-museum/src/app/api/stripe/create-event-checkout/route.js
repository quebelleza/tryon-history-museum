import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  validatePurchaser,
  normalizeOrderItems,
  rpcErrorToResponse,
  TicketingError,
} from "@/lib/ticketing";

/**
 * Public ticket checkout for ticketed events.
 *
 * Flow: validate input -> create_event_order RPC (atomic capacity check +
 * order/items/attendees insert) -> Stripe Checkout Session using the
 * dedicated event price IDs -> persist the session id + Stripe expiry on
 * the order (pending seats are held until that expiry).
 *
 * Prices and seat counts always come from event_ticket_types server-side —
 * the client sends only codes, quantities, and attendee names.
 */
export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventSlug = String(body?.event_slug ?? "");
  if (!eventSlug) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("ticketed_events")
    .select("*")
    .eq("slug", eventSlug)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const { data: ticketTypes } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", event.id)
    .eq("active", true);

  let purchaser;
  let normalized;
  try {
    purchaser = validatePurchaser(body?.purchaser);
    normalized = normalizeOrderItems(body?.items, ticketTypes || []);
  } catch (err) {
    if (err instanceof TicketingError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    throw err;
  }

  // Price IDs for this event's dedicated Stripe product. Per-type
  // stripe_price_id in the database wins; env vars are the fallback for
  // the seeded December Wine Tasting types (test vs live environments).
  const envPriceIds = {
    single: process.env.STRIPE_WINE_TASTING_SINGLE_PRICE_ID,
    couple: process.env.STRIPE_WINE_TASTING_COUPLE_PRICE_ID,
  };
  const priceIds = {};
  for (const item of normalized.items) {
    const type = (ticketTypes || []).find((t) => t.code === item.code);
    priceIds[item.code] = type?.stripe_price_id || envPriceIds[item.code];
    if (!priceIds[item.code]) {
      console.error(`[create-event-checkout] Missing Stripe price id for "${item.code}"`);
      return NextResponse.json(
        { error: "Ticket checkout is not configured yet. Please check back soon." },
        { status: 503 }
      );
    }
  }

  // 1. Atomic capacity check + order creation (rolls back on any error).
  const { data: orderId, error: rpcError } = await supabase.rpc(
    "create_event_order",
    {
      p_event_slug: eventSlug,
      p_purchaser_name: purchaser.name,
      p_purchaser_email: purchaser.email,
      p_purchaser_phone: purchaser.phone,
      p_items: normalized.items.map(({ code, quantity, attendees }) => ({
        code,
        quantity,
        attendees,
      })),
    }
  );

  if (rpcError) {
    const { status, message } = rpcErrorToResponse(rpcError.message);
    return NextResponse.json({ error: message }, { status });
  }

  // 2. Stripe Checkout Session — dedicated product prices, no promo codes.
  const origin =
    request.headers.get("origin") || "https://tryonhistorymuseum.org";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      allow_promotion_codes: false,
      customer_email: purchaser.email,
      line_items: normalized.items.map((item) => ({
        price: priceIds[item.code],
        quantity: item.quantity,
      })),
      metadata: {
        payment_type: "event_ticket",
        event_slug: eventSlug,
        order_id: orderId,
        fund: "event_ticket",
        source: "website",
      },
      payment_intent_data: {
        description: `THM Event Tickets — ${event.title}`,
        metadata: {
          payment_type: "event_ticket",
          event_slug: eventSlug,
          order_id: orderId,
          fund: "event_ticket",
          source: "website",
        },
      },
      success_url: `${origin}/events/${eventSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${eventSlug}`,
    });

    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : null;

    await supabase
      .from("event_orders")
      .update({
        stripe_session_id: session.id,
        stripe_session_expires_at: expiresAt,
      })
      .eq("id", orderId);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-event-checkout] Stripe error:", err.message);
    // Keep the order record for history but release its pending hold.
    await supabase
      .from("event_orders")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "pending");
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
