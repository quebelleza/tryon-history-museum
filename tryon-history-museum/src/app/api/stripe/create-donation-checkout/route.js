import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { amount } = body; // amount in cents

  if (!amount || typeof amount !== "number" || !Number.isInteger(amount) || amount < 100) {
    return NextResponse.json(
      { error: "Amount must be a whole number of cents and at least $1 (100 cents)." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";
  const amountDollars = (amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation — Tryon History Museum",
              description: `Tax-deductible donation of $${amountDollars} to the Tryon History Museum`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_type: "donation",
      },
      success_url: `${origin}/donate/thank-you`,
      cancel_url: `${origin}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-donation-checkout] Stripe error:", err.message);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
