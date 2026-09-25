import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildFinanceReport, financeDetailCsv, financeSummaryCsv } from "@/lib/finance";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const today = new Date();
  const defaultFrom = `${today.getFullYear()}-01-01`;
  const defaultTo = today.toISOString().split("T")[0];
  const from = searchParams.get("from") || defaultFrom;
  const to = searchParams.get("to") || defaultTo;
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to) || from > to) {
    return NextResponse.json({ error: "Please provide a valid date range." }, { status: 400 });
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("membership_payments")
    .select(`
      id, created_at, member_id, payment_date, amount, payment_method, payment_type,
      membership_fee, additional_donation, donor_name, donor_email, source, status,
      stripe_session_id, stripe_payment_intent_id, notes,
      members!membership_payments_member_id_fkey(id, first_name, last_name, email),
      payment_allocations(id, designation_id, amount, giving_designations(id, name, kind))
    `)
    .gte("payment_date", from)
    .lte("payment_date", to)
    .eq("status", "completed")
    .order("payment_date", { ascending: false })
    .limit(5000);

  const type = searchParams.get("type");
  const method = searchParams.get("method");
  const source = searchParams.get("source");
  if (type) query = query.eq("payment_type", type);
  if (method) query = query.eq("payment_method", method);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let payments = data || [];
  const designation = searchParams.get("designation");
  if (designation) {
    payments = payments.filter((payment) => {
      const allocations = payment.payment_allocations || [];
      if (designation === "unrestricted") {
        return Number(payment.additional_donation || 0) > 0 &&
          (allocations.length === 0 || allocations.some((allocation) => !allocation.designation_id));
      }
      return allocations.some((allocation) => allocation.designation_id === designation);
    });
  }
  const report = buildFinanceReport(payments);

  const exportType = searchParams.get("export");
  if (exportType === "detail" || exportType === "summary") {
    const csv = exportType === "detail" ? financeDetailCsv(report) : financeSummaryCsv(report, from, to);
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="thm-finances-${exportType}-${from}-to-${to}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ from, to, ...report }, { headers: { "Cache-Control": "no-store" } });
}
