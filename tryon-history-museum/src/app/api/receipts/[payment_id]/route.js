import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RECEIPT_CUTOFF = "2026-07-01";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function typeLabel(paymentType) {
  if (paymentType === "new_member") return "Annual Membership";
  if (paymentType === "renewal") return "Membership Renewal";
  if (paymentType === "donation") return "Charitable Donation";
  return "Contribution";
}

/**
 * GET /api/receipts/[payment_id]
 * Returns a printable HTML receipt for a single Stripe payment.
 *
 * Access control: the requesting user must own the payment record.
 * Never trust payment_id from the URL alone — always verify ownership.
 */
export async function GET(request, { params }) {
  const { payment_id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch the payment
  const { data: payment, error: paymentError } = await supabase
    .from("membership_payments")
    .select("id, payment_date, amount, payment_type, member_id")
    .eq("id", payment_id)
    .single();

  if (paymentError || !payment) {
    return new NextResponse("Payment not found", { status: 404 });
  }

  // Verify the requesting user owns this payment
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, first_name, last_name, email")
    .eq("auth_user_id", user.id)
    .single();

  if (memberError || !member || member.id !== payment.member_id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Only issue receipts for payments from July 2026 forward
  if (!payment.payment_date || payment.payment_date < RECEIPT_CUTOFF) {
    return new NextResponse("Receipt not available for this payment", { status: 404 });
  }

  const amountFormatted = `$${parseFloat(payment.amount).toFixed(2)}`;
  const description = typeLabel(payment.payment_type);
  const dateFormatted = formatDate(payment.payment_date);
  const memberName = `${member.first_name} ${member.last_name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt — Tryon History Museum</title>
  <style>
    @media print { .no-print { display: none; } }
    body { margin: 0; padding: 40px 20px; background: #FAF7F4; font-family: Georgia, 'Times New Roman', serif; color: #1A1311; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFDF9; border: 1px solid rgba(123,45,38,0.12); }
    .header { background: #1B2A4A; padding: 28px 40px; text-align: center; }
    .header h1 { font-family: Georgia, serif; font-size: 18px; color: #FAF7F4; letter-spacing: 0.08em; margin: 0; font-weight: normal; text-transform: uppercase; }
    .body { padding: 40px; }
    .label { font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; color: #1A1311; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    td { font-family: Arial, Helvetica, sans-serif; font-size: 13px; padding: 8px 0; border-bottom: 1px solid rgba(26,19,17,0.08); }
    td:first-child { color: rgba(26,19,17,0.55); }
    td:last-child { text-align: right; color: #1A1311; }
    td.amount { font-weight: bold; font-size: 15px; }
    .statement { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: rgba(26,19,17,0.5); line-height: 1.6; margin: 20px 0 0; padding: 16px; background: #F5F2EE; border: 1px solid rgba(26,19,17,0.08); }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(123,45,38,0.08); text-align: center; }
    .footer p { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: rgba(26,19,17,0.4); margin: 0; line-height: 1.6; }
    .print-btn { display: inline-block; margin: 20px auto; padding: 10px 28px; background: #C4A35A; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #1A1311; border: none; cursor: pointer; }
    .print-wrap { text-align: center; padding: 16px 40px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tryon History Museum</h1>
    </div>
    <div class="print-wrap no-print">
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
    <div class="body">
      <p class="label">Charitable Contribution Receipt</p>
      <table>
        <tr><td>Organization</td><td>Tryon History Museum</td></tr>
        <tr><td>Address</td><td>26 Maple Street, Tryon NC 28782</td></tr>
        <tr><td>Federal Tax ID (EIN)</td><td>47-1736984</td></tr>
        <tr><td>Donor</td><td>${memberName}</td></tr>
        <tr><td>Email</td><td>${member.email}</td></tr>
        <tr><td>Date</td><td>${dateFormatted}</td></tr>
        <tr><td>Description</td><td>${description}</td></tr>
        <tr><td>Amount</td><td class="amount">${amountFormatted}</td></tr>
      </table>
      <div class="statement">
        The Tryon History Museum is a 501(c)(3) nonprofit organization, EIN 47-1736984. No goods or services were provided in exchange for this contribution. Please retain this receipt for your tax records.
      </div>
    </div>
    <div class="footer">
      <p>
        Tryon History Museum · 26 Maple Street, Tryon NC 28782<br />
        info@tryonhistorymuseum.org · tryonhistorymuseum.org
      </p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
