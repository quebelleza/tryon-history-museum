import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBER_BENEFIT_FMV } from "@/lib/membershipPricing";

const TIER_BANDS = {
  membership: { min: 50, max: 50 },
  gillette:   { min: 100, max: 249 },
  simone:     { min: 250, max: 499 },
  pacolet:    { min: 500, max: 999 },
  fitzgerald: { min: 1000, max: null },
};

const TIER_LABELS = {
  membership: "Annual Membership",
  gillette:   "Gillette Circle Membership",
  simone:     "Nina Simone Circle Membership",
  pacolet:    "Pacolet Society Membership",
  fitzgerald: "Fitzgerald Society Membership",
};

const TIER_LEVEL_MAP = {
  membership: "individual",
  gillette:   "gillette",
  simone:     "nina_simone",
  pacolet:    "pacolet",
  fitzgerald: "fitzgerald",
};

const TIER_DESCRIPTIONS = {
  membership: "Individual",
  gillette:   "Gillette Circle",
  simone:     "Nina Simone Circle",
  pacolet:    "Pacolet Society",
  fitzgerald: "Fitzgerald Society",
};

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

  const { firstName, lastName, email, tier, amount } = body;

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

  if (!tier || !TIER_BANDS[tier]) {
    return NextResponse.json({ error: "Please select a valid membership level." }, { status: 400 });
  }

  const parsedAmount = Math.round(Number(amount));
  const band = TIER_BANDS[tier];
  if (!parsedAmount || parsedAmount < band.min) {
    return NextResponse.json(
      { error: `Minimum for ${TIER_LABELS[tier]} is $${band.min.toLocaleString()}.` },
      { status: 400 }
    );
  }
  if (band.max !== null && parsedAmount > band.max) {
    return NextResponse.json(
      { error: `Maximum for ${TIER_LABELS[tier]} is $${band.max.toLocaleString()}.` },
      { status: 400 }
    );
  }

  const cleanFirst = String(firstName).trim();
  const cleanLast = String(lastName).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const supabase = createAdminClient();
    const { data: existingMember } = await supabase
      .from("members")
      .select("first_name, auth_user_id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({
        existingMember: true,
        firstName: existingMember.first_name,
        hasAuth: !!existingMember.auth_user_id,
      });
    }

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
              name: `${TIER_LABELS[tier]} — Tryon History Museum`,
            },
            unit_amount: parsedAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        fund:         "membership",
        level:        TIER_LEVEL_MAP[tier],
        fmv:          MEMBER_BENEFIT_FMV,
        source:       "website",
        payment_type: "new_member",
        first_name:   cleanFirst,
        last_name:    cleanLast,
        email:        cleanEmail,
        tier,
      },
      payment_intent_data: {
        description: `THM Membership — ${TIER_DESCRIPTIONS[tier] ?? "Individual"}`,
        metadata: {
          fund:   "membership",
          level:  TIER_LEVEL_MAP[tier],
          fmv:    MEMBER_BENEFIT_FMV,
          source: "website",
          tier,
        },
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
