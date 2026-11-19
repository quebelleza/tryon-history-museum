import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET — one event with ticket types, stats, and orders (items + attendees).
 * PATCH — update capacity / sales_enabled / refund_policy / status.
 */
export async function GET(request, { params }) {
  const { hasAdminAccess } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("ticketed_events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const { data: types } = await supabase
    .from("event_ticket_types")
    .select("*")
    .eq("event_id", event.id)
    .order("sort_order");

  const { data: orders } = await supabase
    .from("event_orders")
    .select("*, event_order_items(*), event_order_attendees(*)")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const now = new Date();
  const stats = {
    committedSeats: 0,
    paidSeats: 0,
    pendingSeats: 0,
    grossCents: 0,
    refundedCents: 0,
  };
  for (const o of orders || []) {
    const live =
      o.status === "paid" ||
      o.status === "comp" ||
      (o.status === "pending" &&
        o.stripe_session_expires_at &&
        new Date(o.stripe_session_expires_at) > now);
    if (live) stats.committedSeats += o.seats;
    if (o.status === "paid" || o.status === "comp") stats.paidSeats += o.seats;
    if (o.status === "pending" && live) stats.pendingSeats += o.seats;
    if (o.status === "paid" || o.status === "refunded") stats.grossCents += o.amount_cents;
    stats.refundedCents += o.amount_refunded_cents || 0;
  }
  stats.remaining = Math.max(event.capacity - stats.committedSeats, 0);

  return NextResponse.json({
    event,
    ticketTypes: types || [],
    orders: orders || [],
    stats,
  });
}

export async function PATCH(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates = {};
  if (body.capacity !== undefined) {
    const capacity = Math.floor(Number(body.capacity));
    if (!Number.isFinite(capacity) || capacity < 0) {
      return NextResponse.json({ error: "Capacity must be a non-negative integer." }, { status: 400 });
    }
    updates.capacity = capacity;
  }
  if (body.sales_enabled !== undefined) {
    updates.sales_enabled = Boolean(body.sales_enabled);
  }
  if (body.refund_policy !== undefined) {
    updates.refund_policy = body.refund_policy ? String(body.refund_policy) : null;
  }
  if (body.status !== undefined) {
    if (!["draft", "published", "cancelled", "completed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("ticketed_events")
    .update(updates)
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
