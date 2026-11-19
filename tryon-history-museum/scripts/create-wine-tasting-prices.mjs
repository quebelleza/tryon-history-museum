/**
 * Creates the dedicated Stripe product + reusable one-time prices for
 * "December Wine Tasting 2026" and prints the env vars to configure.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/create-wine-tasting-prices.mjs
 *
 * Run with a TEST key first for the preview environment, then a LIVE key
 * only after the implementation is approved for production.
 * The script is idempotent-ish: it reuses an existing product named
 * "December Wine Tasting 2026" and creates prices that don't already exist.
 */

import Stripe from "stripe";

const PRODUCT_NAME = "December Wine Tasting 2026";
const PRICES = [
  { code: "single", nickname: "Single Admission", unit_amount: 3000 },
  { code: "couple", nickname: "Couples Admission", unit_amount: 5000 },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY (sk_test_… or sk_live_…) first.");
  process.exit(1);
}
const mode = key.startsWith("sk_test") ? "TEST" : "LIVE";
console.log(`Using ${mode} mode key.`);

const stripe = new Stripe(key);

// Find or create the product.
const existing = await stripe.products.search({
  query: `name:'${PRODUCT_NAME}'`,
});
let product = existing.data[0];
if (!product) {
  product = await stripe.products.create({
    name: PRODUCT_NAME,
    description:
      "An Evening of Wine & History — Tryon History Museum fundraiser, December 2, 2026",
    metadata: { event_slug: "an-evening-of-wine-and-history" },
  });
  console.log(`Created product ${product.id}`);
} else {
  console.log(`Reusing product ${product.id}`);
}

// Create missing prices (match by unit_amount on this product).
const result = {};
for (const p of PRICES) {
  const prices = await stripe.prices.list({ product: product.id, limit: 20 });
  let price = prices.data.find(
    (x) => x.unit_amount === p.unit_amount && !x.recurring && x.active
  );
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: p.unit_amount,
      nickname: p.nickname,
      metadata: { ticket_code: p.code },
    });
    console.log(`Created price ${p.nickname}: ${price.id}`);
  } else {
    console.log(`Reusing price ${p.nickname}: ${price.id}`);
  }
  result[p.code] = price.id;
}

console.log("\nAdd these to your environment (Vercel env vars / .env.local):");
console.log(`STRIPE_WINE_TASTING_SINGLE_PRICE_ID=${result.single}`);
console.log(`STRIPE_WINE_TASTING_COUPLE_PRICE_ID=${result.couple}`);
console.log(
  "\nOptional: store these on the event_ticket_types rows (stripe_price_id column) — the checkout route prefers DB values when set."
);
