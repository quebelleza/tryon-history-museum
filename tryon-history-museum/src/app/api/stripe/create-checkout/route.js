import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const PRICES = {
  individual: 5000, // $50.00 in cents
  family: 7500, // $75.00 in cents
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
    .select("id, email, first_name, last_name, membership_tier")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member record not found" }, { status: 404 });
  }

  const { tier } = await request.json();
  const selectedTier = tier === "family" ? "family" : "individual";
  const amount = PRICES[selectedTier];
  const tierLabel = selectedTier === "family" ? "Family" : "Individual";

  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: member.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tierLabel} Membership Renewal`,
            description: `Tryon History Museum — ${tierLabel} Membership (1 year)`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      member_id: member.id,
      membership_tier: selectedTier,
    },
    success_url: `${origin}/member/renew/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/member/renew`,
  });

  return NextResponse.json({ url: session.url });
}
