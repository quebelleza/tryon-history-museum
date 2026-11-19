import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  validatePurchaser,
  normalizeOrderItems,
  rpcErrorToResponse,
  TicketingError,
} from "@/lib/ticketing";

/**
 * POST — record a complimentary or offline (cash/check) registration.
 * Runs through the same create_event_order RPC so capacity is enforced
 * identically to public checkout.
 *
 * Body: { event_slug, purchaser: {name,email,phone}, payment_method:
 * "comp"|"offline", items: [{code, quantity, attendees}], notes?,
 * amount_cents? (offline override; defaults to computed ticket total,
 * comp defaults to 0) }
 */
export async function POST(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const eventSlug = String(body?.event_slug ?? "");
  const method = String(body?.payment_method ?? "");
  if (!["comp", "offline"].includes(method)) {
    return NextResponse.json(
      { error: 'payment_method must be "comp" or "offline".' },
      { status: 400 }
    );
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

  let amountOverride = null;
  if (method === "comp") {
    amountOverride = 0;
  } else if (body?.amount_cents !== undefined && body?.amount_cents !== null) {
    const a = Math.floor(Number(body.amount_cents));
    if (!Number.isFinite(a) || a < 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }
    amountOverride = a;
  }

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
      p_status: method === "comp" ? "comp" : "paid",
      p_payment_method: method,
      p_amount_cents: amountOverride,
    }
  );

  if (rpcError) {
    const { status, message } = rpcErrorToResponse(rpcError.message);
    return NextResponse.json({ error: message }, { status });
  }

  if (body?.notes) {
    await supabase
      .from("event_orders")
      .update({ notes: String(body.notes), source: "admin" })
      .eq("id", orderId);
  } else {
    await supabase.from("event_orders").update({ source: "admin" }).eq("id", orderId);
  }

  return NextResponse.json({ success: true, orderId });
}
