import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  if (!UUID.test(body.payment_id || "") || !Array.isArray(body.allocations) || body.allocations.length > 50) {
    return NextResponse.json({ error: "Invalid allocation request." }, { status: 400 });
  }

  const allocations = body.allocations.map((allocation) => ({
    designation_id: allocation.designation_id || null,
    amount: Math.round(Number(allocation.amount) * 100) / 100,
  }));
  if (allocations.some((allocation) =>
    !Number.isFinite(allocation.amount) || allocation.amount <= 0 ||
    (allocation.designation_id !== null && !UUID.test(allocation.designation_id))
  )) {
    return NextResponse.json({ error: "Every allocation needs a valid designation and positive amount." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("set_payment_allocations", {
    p_payment_id: body.payment_id,
    p_allocations: allocations,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data, error: fetchError } = await supabase
    .from("payment_allocations")
    .select("id, designation_id, amount, giving_designations(id, name, kind)")
    .eq("payment_id", body.payment_id);
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json({ allocations: data || [] });
}
