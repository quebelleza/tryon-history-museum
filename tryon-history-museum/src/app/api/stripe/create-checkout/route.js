import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_AMOUNT_CENTS = 5000; // $50.00 fallback

const DONOR_LEVEL_LABELS = {
  none:       "Annual Membership",
  gillette:   "Gillette Circle Membership",
  simone:     "Nina Simone Circle Membership",
  pacolet:    "Pacolet Society Membership",
  fitzgerald: "Fitzgerald Society Membership",
};

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up member record
  const { data: member } = await supabase
    .from("members")
    .select("id, email, first_name, last_name, status, last_payment_amount, donor_level")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member record not found" }, { status: 404 });
  }

  // Pending members pay their chosen tier amount; others use the default
  const chargeAmountCents =
    member.status === "pending" && member.last_payment_amount
      ? Math.round(member.last_payment_amount * 100)
      : DEFAULT_AMOUNT_CENTS;

  const productName =
    (DONOR_LEVEL_LABELS[member.donor_level] ?? "Annual Membership") +
    " — Tryon History Museum";

  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    allow_promotion_codes: true,
    client_reference_id: String(member.id),
    customer_email: member.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: "Tryon History Museum — Annual Membership (1 year)",
          },
          unit_amount: chargeAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      member_id: member.id,
      membership_tier: "individual",
    },
    success_url: member.status === "pending"
      ? `${origin}/member/dashboard?welcome=true`
      : `${origin}/member/renew/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: member.status === "pending"
      ? `${origin}/member/dashboard`
      : `${origin}/member/renew`,
  });

  return NextResponse.json({ url: session.url });
}
