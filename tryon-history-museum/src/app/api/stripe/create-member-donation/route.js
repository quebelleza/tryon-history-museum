import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_BENEFIT_FMV } from "@/lib/membershipPricing";

/**
 * POST /api/stripe/create-member-donation
 * Authenticated — only for logged-in members on the dashboard.
 * Body: { amount: number }  (dollars, e.g. 25 for $25)
 *
 * Sets client_reference_id = member UUID so the webhook can match
 * on ID rather than email.
 */
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("id, email, first_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member record not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedAmount = Math.round(Number(body?.amount));
  if (!parsedAmount || parsedAmount < 1) {
    return NextResponse.json({ error: "Please enter a valid donation amount." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";

  try {
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
              name: "Donation — Tryon History Museum",
            },
            unit_amount: parsedAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        fund:         "donation",
        fmv:          MEMBER_BENEFIT_FMV,
        source:       "website",
        payment_type: "donation",
        member_id:    String(member.id),
      },
      payment_intent_data: {
        description: `THM Donation — $${parsedAmount}`,
        metadata: { fund: "donation", fmv: MEMBER_BENEFIT_FMV, source: "website" },
      },
      success_url: `${origin}/member/dashboard?donated=true`,
      cancel_url:  `${origin}/member/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-member-donation] Stripe error:", err.message);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
