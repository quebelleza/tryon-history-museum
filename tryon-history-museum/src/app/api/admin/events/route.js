import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET — all ticketed events with sales/revenue stats. */
export async function GET() {
  const { hasAdminAccess } = await verifyAdmin();
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: events, error } = await supabase
    .from("ticketed_events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: orders } = await supabase
    .from("event_orders")
    .select("event_id, status, seats, amount_cents, amount_refunded_cents, stripe_session_expires_at");

  const now = new Date();
  const statsByEvent = {};
  for (const o of orders || []) {
    const s = (statsByEvent[o.event_id] ??= {
      committedSeats: 0,
      paidSeats: 0,
      pendingSeats: 0,
      grossCents: 0,
      refundedCents: 0,
      orderCount: 0,
    });
    const live =
      o.status === "paid" ||
      o.status === "comp" ||
      (o.status === "pending" &&
        o.stripe_session_expires_at &&
        new Date(o.stripe_session_expires_at) > now);
    if (live) s.committedSeats += o.seats;
    if (o.status === "paid" || o.status === "comp") s.paidSeats += o.seats;
    if (o.status === "pending" && live) s.pendingSeats += o.seats;
    if (o.status === "paid" || o.status === "refunded") s.grossCents += o.amount_cents;
    s.refundedCents += o.amount_refunded_cents || 0;
    if (o.status !== "cancelled") s.orderCount += 1;
  }

  return NextResponse.json({
    events: (events || []).map((e) => {
      const s = statsByEvent[e.id] || {
        committedSeats: 0,
        paidSeats: 0,
        pendingSeats: 0,
        grossCents: 0,
        refundedCents: 0,
        orderCount: 0,
      };
      return {
        ...e,
        stats: {
          ...s,
          remaining: Math.max(e.capacity - s.committedSeats, 0),
        },
      };
    }),
  });
}
