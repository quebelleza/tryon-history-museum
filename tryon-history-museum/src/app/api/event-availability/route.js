import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Public availability for a ticketed event — counts only, never PII.
 * Used by the ticket selector to show remaining seats / sold out / sales closed.
 */
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("event");
  if (!slug) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("ticketed_events")
    .select("id, slug, title, capacity, sales_enabled, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const { data: orders } = await supabase
    .from("event_orders")
    .select("status, seats, stripe_session_expires_at")
    .eq("event_id", event.id);

  const now = new Date();
  const committed = (orders || []).reduce((sum, o) => {
    if (o.status === "paid" || o.status === "comp") return sum + o.seats;
    if (
      o.status === "pending" &&
      o.stripe_session_expires_at &&
      new Date(o.stripe_session_expires_at) > now
    ) {
      return sum + o.seats;
    }
    return sum;
  }, 0);

  const { data: types } = await supabase
    .from("event_ticket_types")
    .select("code, label, price_cents, seats_per_unit")
    .eq("event_id", event.id)
    .eq("active", true)
    .order("sort_order");

  const remaining = Math.max(event.capacity - committed, 0);
  return NextResponse.json({
    salesEnabled: Boolean(event.sales_enabled) && event.capacity > 0,
    capacity: event.capacity,
    remaining,
    soldOut: event.sales_enabled && event.capacity > 0 && remaining === 0,
    ticketTypes: (types || []).map((t) => ({
      code: t.code,
      label: t.label,
      priceCents: t.price_cents,
      seatsPerUnit: t.seats_per_unit,
    })),
  });
}
