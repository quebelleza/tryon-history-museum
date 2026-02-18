/**
 * Membership pricing utility — year-based pricing with payment splitting.
 * Used server-side (API routes) and can be imported client-side for live preview.
 */

const PRICING = {
  2025: { individual: 35, family: 50 },
  2026: { individual: 50, family: 75 },
  default: { individual: 50, family: 75 },
};

function getPricingForYear(year) {
  return PRICING[year] || PRICING.default;
}

/**
 * Compute membership details from a payment amount and payment date.
 *
 * @param {number} paymentAmount - Total payment amount
 * @param {string} paymentDate - ISO date string (YYYY-MM-DD)
 * @returns {object} Computed membership fields
 */
export function computeMembership(paymentAmount, paymentDate) {
  const amt = parseFloat(paymentAmount) || 0;
  const date = paymentDate ? new Date(paymentDate + "T12:00:00") : new Date();
  const year = date.getFullYear();
  const pricing = getPricingForYear(year);

  // Determine tier based on year-specific thresholds
  let membershipTier;
  let membershipFee;

  if (amt >= pricing.family) {
    membershipTier = "family";
    membershipFee = pricing.family;
  } else if (amt >= pricing.individual) {
    membershipTier = "individual";
    membershipFee = pricing.individual;
  } else {
    // Below minimum
    return {
      membershipTier: "individual",
      membershipFee: amt,
      additionalDonation: 0,
      donorClass: "none",
      effectiveAccessTier: "individual",
      memberLabel: "member",
      expirationDate: formatExpiration(date),
      status: "pending",
      pricingYear: year,
      pricingLabel: `${year}`,
      belowMinimum: true,
      note: "Payment below minimum — please verify.",
    };
  }

  const additionalDonation = Math.round((amt - membershipFee) * 100) / 100;

  // Donor class based on total payment amount (same thresholds regardless of year)
  let donorClass = "none";
  if (amt >= 1000) donorClass = "steward";
  else if (amt >= 250) donorClass = "patron";
  else if (amt >= 76) donorClass = "donor";

  // Effective access tier
  const effectiveAccessTier =
    donorClass !== "none" || membershipTier === "family" ? "family" : "individual";

  // Member label
  let memberLabel = "member";
  if (donorClass === "steward") memberLabel = "steward";
  else if (donorClass === "patron") memberLabel = "patron";
  else if (donorClass === "donor") memberLabel = "donor";

  // Expiration: 1 year from payment date
  const expirationDate = formatExpiration(date);

  // Tier label for display
  const tierWord = membershipTier === "family" ? "Family" : "Individual";
  const pricingLabel = `${year} ${tierWord}`;

  return {
    membershipTier,
    membershipFee,
    additionalDonation,
    donorClass,
    effectiveAccessTier,
    memberLabel,
    expirationDate,
    status: "active",
    pricingYear: year,
    pricingLabel,
    belowMinimum: false,
    note: null,
  };
}

function formatExpiration(date) {
  const exp = new Date(date);
  exp.setFullYear(exp.getFullYear() + 1);
  return exp.toISOString().split("T")[0];
}

/**
 * Get the pricing schedule for a given year (for display).
 */
export function getPricing(year) {
  return getPricingForYear(year);
}
