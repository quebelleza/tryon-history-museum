import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH — manage an order: { action: "cancel" | "mark_refunded" }.
 *
 * "cancel"     → pending or comp orders (frees held seats).
 * "mark_refunded" → records that a paid order was refunded. For Stripe
 *                   payments the actual refund must be issued in the Stripe
 *                   Dashboard — the charge.refunded webhook will also
 *                   reconcile automatically. This action is for offline
 *                   payments and bookkeeping.
 */
export async function PATCH(request, { params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const action = String(body?.action ?? "");
  const supabase = createAdminClient();

  if (action === "cancel") {
    const { error, count } = await supabase
      .from("event_orders")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", id)
      .in("status", ["pending", "comp"]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "mark_refunded") {
    const amountRefunded = Math.floor(Number(body?.amount_cents));
    const { data: order } = await supabase
      .from("event_orders")
      .select("status, amount_cents")
      .eq("id", id)
      .maybeSingle();
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be marked refunded." },
        { status: 409 }
      );
    }
    const refunded = Number.isFinite(amountRefunded) ? amountRefunded : order.amount_cents;
    const update = {
      status: "refunded",
      amount_refunded_cents: refunded,
      refunded_at: new Date().toISOString(),
    };
    if (body?.notes) update.notes = String(body.notes);
    await supabase.from("event_orders").update(update).eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
