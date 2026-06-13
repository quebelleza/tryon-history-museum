import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const MEMBERSHIP_AMOUNT = 5000; // $50.00 in cents — individual membership

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
    .select("id, email, first_name, last_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member record not found" }, { status: 404 });
  }

  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    allow_promotion_codes: true,
    customer_email: member.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Membership — Tryon History Museum",
            description: "Tryon History Museum — Annual Membership (1 year)",
          },
          unit_amount: MEMBERSHIP_AMOUNT,
        },
        quantity: 1,
      },
    ],
    metadata: {
      member_id: member.id,
      membership_tier: "individual",
    },
    success_url: `${origin}/member/renew/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/member/renew`,
  });

  return NextResponse.json({ url: session.url });
}
