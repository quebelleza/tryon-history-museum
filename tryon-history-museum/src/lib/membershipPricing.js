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

function donorDetails(amount) {
  if (amount >= 1000) return { donorLevel: "fitzgerald", donorLevelLabel: "Fitzgerald", memberLabel: "fitzgerald" };
  if (amount >= 500) return { donorLevel: "pacolet", donorLevelLabel: "Pacolet", memberLabel: "pacolet" };
  if (amount >= 250) return { donorLevel: "simone", donorLevelLabel: "Simone", memberLabel: "simone" };
  if (amount >= 100) return { donorLevel: "gillette", donorLevelLabel: "Gillette", memberLabel: "gillette" };
  return { donorLevel: "none", donorLevelLabel: null, memberLabel: "member" };
}

function donationOnly(amount) {
  return {
    isDonation: true,
    appliesMembership: false,
    membershipTier: null,
    membershipFee: 0,
    additionalDonation: amount,
    ...donorDetails(amount),
    renewalDueDate: null,
    membershipStartDate: null,
    status: null,
    belowMinimum: amount < INDIVIDUAL_FEE,
    note: null,
  };
}

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

  if (paymentType === "donation" || amt < INDIVIDUAL_FEE) return donationOnly(amt);

  const { donorLevel, donorLevelLabel, memberLabel } = donorDetails(amt);

  // All memberships are Individual at $50; amounts above $50 accrue as additional donation
  const membershipTier = "individual";
  const membershipFee = INDIVIDUAL_FEE;

  const additionalDonation = Math.round((amt - membershipFee) * 100) / 100;

  return {
    isDonation: false,
    appliesMembership: true,
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

export function isMembershipDue(renewalDueDate, paymentDate) {
  if (!renewalDueDate) return true;
  const due = new Date(renewalDueDate + "T12:00:00");
  const payment = new Date(paymentDate + "T12:00:00");
  payment.setDate(payment.getDate() + 30);
  return due <= payment;
}

export function computePayment(paymentAmount, paymentDate, paymentType = "new_member", member = {}) {
  const amount = parseFloat(paymentAmount) || 0;
  if (amount < INDIVIDUAL_FEE) return donationOnly(amount);
  if (member.existing && !isMembershipDue(member.renewalDueDate, paymentDate)) return donationOnly(amount);
  return computeMembership(amount, paymentDate, paymentType === "new_member" ? "new_member" : "renewal");
}

export function replayMembershipPayments(payments) {
  let renewalDueDate = null;
  let membershipStartDate = null;
  const replayed = [...payments]
    .sort((a, b) => String(a.payment_date).localeCompare(String(b.payment_date)) || String(a.created_at || a.id).localeCompare(String(b.created_at || b.id)))
    .map((payment) => {
      const computed = computePayment(payment.amount, payment.payment_date, payment.payment_type, { existing: true, renewalDueDate });
      if (computed.appliesMembership) {
        renewalDueDate = computed.renewalDueDate;
        membershipStartDate ||= payment.payment_date;
      }
      return { ...payment, ...computed };
    });
  return { payments: replayed, renewalDueDate, membershipStartDate };
}

/** Fair-market value of membership benefits in dollars (string for Stripe metadata). */
export const MEMBER_BENEFIT_FMV = "0";

/**
 * Donation-origin membership. Existing members only apply dues when expired,
 * missing a renewal date, or due within 30 days of the payment date.
 */
export function computeDonationMembership(paymentAmount, paymentDate, member = {}) {
  const computed = computePayment(paymentAmount, paymentDate, "donation", member);
  return {
    ...computed,
    createsMembership: computed.appliesMembership,
  };
}
