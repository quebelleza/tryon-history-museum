import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TIER_BANDS = {
  membership: { min: 50,   max: 50   },
  gillette:   { min: 100,  max: 249  },
  simone:     { min: 250,  max: 499  },
  pacolet:    { min: 500,  max: 999  },
  fitzgerald: { min: 1000, max: null },
};

const TIER_TO_DONOR_LEVEL = {
  membership: "none",
  gillette:   "gillette",
  simone:     "simone",
  pacolet:    "pacolet",
  fitzgerald: "fitzgerald",
};

const TIER_LABELS = {
  membership: "Membership",
  gillette:   "Gillette Circle",
  simone:     "Nina Simone Circle",
  pacolet:    "Pacolet Society",
  fitzgerald: "Fitzgerald Society",
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { firstName, lastName, email, password, tier, amount } = body;

  if (!firstName?.trim())
    return NextResponse.json({ error: "First name is required." }, { status: 400 });
  if (!lastName?.trim())
    return NextResponse.json({ error: "Last name is required." }, { status: 400 });
  if (!email?.trim())
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!password || password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  if (!tier || !TIER_BANDS[tier])
    return NextResponse.json({ error: "Please select a valid membership level." }, { status: 400 });

  const parsedAmount = Math.round(Number(amount));
  const band = TIER_BANDS[tier];
  if (!parsedAmount || parsedAmount < band.min)
    return NextResponse.json({ error: `Minimum for this tier is $${band.min}.` }, { status: 400 });
  if (band.max !== null && parsedAmount > band.max)
    return NextResponse.json({ error: `Maximum for this tier is $${band.max}.` }, { status: 400 });

  const cleanFirst = firstName.trim();
  const cleanLast  = lastName.trim();
  const cleanEmail = email.trim().toLowerCase();

  const supabase = createAdminClient();

  // Block if an active (non-pending) member record already exists
  const { data: existingMember } = await supabase
    .from("members")
    .select("status, first_name")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (existingMember && existingMember.status !== "pending") {
    return NextResponse.json({
      existingMember: true,
      firstName: existingMember.first_name,
    });
  }

  // Create auth user via admin API — auto-confirms email so sign-in works immediately
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { first_name: cleanFirst, last_name: cleanLast },
  });

  if (authError) {
    const msg = authError.message?.toLowerCase() ?? "";
    if (
      msg.includes("already registered") ||
      msg.includes("already exists") ||
      authError.code === "email_exists" ||
      authError.status === 422
    ) {
      return NextResponse.json({
        error: "An account with this email already exists. Please log in instead.",
        existingAuth: true,
      });
    }
    console.error("[register] Auth error:", authError.message);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }

  const userId = authData.user.id;

  // Create pending members record
  const { error: memberError } = await supabase.from("members").insert({
    first_name:        cleanFirst,
    last_name:         cleanLast,
    email:             cleanEmail,
    auth_user_id:      userId,
    status:            "pending",
    membership_tier:   "individual",
    donor_level:       TIER_TO_DONOR_LEVEL[tier] || "none",
    member_label:      TIER_LABELS[tier] || "Member",
    last_payment_amount: parsedAmount,
    member_source:     "online",
  });

  if (memberError) {
    // Roll back the auth user so the email is not permanently locked
    await supabase.auth.admin.deleteUser(userId);
    console.error("[register] Member insert error:", memberError.message);
    return NextResponse.json({ error: "Could not create member record. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
