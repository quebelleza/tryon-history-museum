import { NextResponse } from "next/server";
import Stripe from "stripe";

const MEMBERSHIP_AMOUNT = 5000; // $50.00 in cents

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, email } = body;

  if (!firstName || !String(firstName).trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }
  if (!lastName || !String(lastName).trim()) {
    return NextResponse.json({ error: "Last name is required" }, { status: 400 });
  }
  if (!email || !String(email).trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!isValidEmail(String(email).trim())) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  const cleanFirst = String(firstName).trim();
  const cleanLast = String(lastName).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      allow_promotion_codes: true,
      customer_email: cleanEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Annual Membership — Tryon History Museum",
            },
            unit_amount: MEMBERSHIP_AMOUNT,
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_type: "new_member",
        first_name: cleanFirst,
        last_name: cleanLast,
        email: cleanEmail,
      },
      success_url: `${origin}/membership/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membership`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-member-checkout] Stripe error:", err.message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
