/**
 * Membership pricing utility — payment type aware with donor levels.
 * Used server-side (API routes) and can be imported client-side for live preview.
 *
 * Payment types: "new_member", "renewal", "donation"
 *
 * Fee schedule (new_member / renewal):
 *   $50        → Individual, $50 fee, $0 donation, donor_level none, label member
 *   $51–$99    → Individual, $50 fee, remainder donation, donor_level none, label member
 *   $100–$249  → Individual, $50 fee, remainder donation, donor_level gillette, label gillette
 *   $250–$499  → Individual, $50 fee, remainder donation, donor_level simone, label simone
 *   $500–$999  → Individual, $50 fee, remainder donation, donor_level pacolet, label pacolet
 *   $1,000+    → Individual, $50 fee, remainder donation, donor_level fitzgerald, label fitzgerald
 *
 * Donation: full amount recorded as donation, no membership changes.
 */

const INDIVIDUAL_FEE = 50;

/**
 * Compute membership details from a payment amount, date, and type.
 *
 * @param {number} paymentAmount - Total payment amount
 * @param {string} paymentDate - ISO date string (YYYY-MM-DD)
 * @param {string} [paymentType="new_member"] - "new_member" | "renewal" | "donation"
 * @returns {object} Computed membership fields
 */
export function computeMembership(paymentAmount, paymentDate, paymentType = "new_member") {
  const amt = parseFloat(paymentAmount) || 0;
  const date = paymentDate ? new Date(paymentDate + "T12:00:00") : new Date();
  const renewalDueDate = formatDatePlusYear(date);

  // ── Donation: full amount, no membership changes ──
  if (paymentType === "donation") {
    return {
      isDonation: true,
      membershipTier: null,
      membershipFee: 0,
      additionalDonation: amt,
      donorLevel: null,
      donorLevelLabel: null,
      memberLabel: null,
      renewalDueDate: null,
      membershipStartDate: null,
      status: null,
      belowMinimum: false,
      note: null,
    };
  }

  // ── New Member / Renewal ──
  if (amt < INDIVIDUAL_FEE) {
    return {
      isDonation: false,
      membershipTier: "individual",
      membershipFee: amt,
      additionalDonation: 0,
      donorLevel: "none",
      donorLevelLabel: null,
      memberLabel: "member",
      renewalDueDate,
      membershipStartDate: paymentType === "new_member" ? paymentDate : null,
      status: "active",
      belowMinimum: true,
      note: `Payment below $${INDIVIDUAL_FEE} minimum — please verify.`,
    };
  }

  // Donor level based on total payment amount
  let donorLevel = "none";
  let donorLevelLabel = null;
  let memberLabel = "member";
  if (amt >= 1000) { donorLevel = "fitzgerald"; donorLevelLabel = "Fitzgerald"; memberLabel = "fitzgerald"; }
  else if (amt >= 500) { donorLevel = "pacolet"; donorLevelLabel = "Pacolet"; memberLabel = "pacolet"; }
  else if (amt >= 250) { donorLevel = "simone"; donorLevelLabel = "Simone"; memberLabel = "simone"; }
  else if (amt >= 100) { donorLevel = "gillette"; donorLevelLabel = "Gillette"; memberLabel = "gillette"; }

  // All memberships are Individual at $50; amounts above $50 accrue as additional donation
  const membershipTier = "individual";
  const membershipFee = INDIVIDUAL_FEE;

  const additionalDonation = Math.round((amt - membershipFee) * 100) / 100;

  return {
    isDonation: false,
    membershipTier,
    membershipFee,
    additionalDonation,
    donorLevel,
    donorLevelLabel,
    memberLabel,
    renewalDueDate,
    membershipStartDate: paymentType === "new_member" ? paymentDate : null,
    status: "active",
    belowMinimum: false,
    note: null,
  };
}

function formatDatePlusYear(date) {
  const exp = new Date(date);
  exp.setFullYear(exp.getFullYear() + 1);
  return exp.toISOString().split("T")[0];
}

/** Donor level display labels */
export const DONOR_LEVEL_LABELS = {
  none: null,
  gillette: "Gillette",
  simone: "Simone",
  pacolet: "Pacolet",
  fitzgerald: "Fitzgerald",
};

/**
 * Get the static fee schedule (for display).
 */
export function getFeeSchedule() {
  return { individual: INDIVIDUAL_FEE };
}

/** Fair-market value of membership benefits in dollars (string for Stripe metadata). */
export const MEMBER_BENEFIT_FMV = "0";
