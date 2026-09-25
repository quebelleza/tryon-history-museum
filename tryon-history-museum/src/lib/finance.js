const money = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function normalizeFinancePayment(payment) {
  const amount = money(payment.amount);
  const membership = money(payment.membership_fee);
  const donation = money(payment.additional_donation ?? (amount - membership));
  const member = payment.members;
  const contributor = payment.donor_name || (member ? `${member.first_name || ""} ${member.last_name || ""}`.trim() : "") || "Anonymous";
  const email = payment.donor_email || member?.email || "";
  const allocations = (payment.payment_allocations || []).map((allocation) => ({
    id: allocation.id,
    designationId: allocation.designation_id,
    designation: allocation.giving_designations?.name || "Unrestricted",
    kind: allocation.giving_designations?.kind || "unrestricted",
    amount: money(allocation.amount),
  }));
  if (donation > 0 && allocations.length === 0) {
    allocations.push({ id: null, designationId: null, designation: "Unrestricted", kind: "unrestricted", amount: donation });
  }
  return { ...payment, amount, membership, donation, contributor, email, allocations };
}

function addBreakdown(target, key, value) {
  const label = key || "Unknown";
  target[label] = money((target[label] || 0) + value);
}

export function buildFinanceReport(rawPayments) {
  const payments = rawPayments.map(normalizeFinancePayment);
  const summary = {
    total: 0,
    membership: 0,
    donations: 0,
    transactionCount: payments.length,
    uniqueContributors: 0,
  };
  const contributors = new Set();
  const breakdowns = { month: {}, method: {}, type: {}, source: {}, designation: {} };

  for (const payment of payments) {
    summary.total = money(summary.total + payment.amount);
    summary.membership = money(summary.membership + payment.membership);
    summary.donations = money(summary.donations + payment.donation);
    const contributorKey = payment.member_id || payment.email.toLowerCase() || (payment.contributor === "Anonymous" ? payment.id : payment.contributor);
    if (contributorKey) contributors.add(contributorKey);
    addBreakdown(breakdowns.month, String(payment.payment_date || "").slice(0, 7), payment.amount);
    addBreakdown(breakdowns.method, payment.payment_method, payment.amount);
    addBreakdown(breakdowns.type, payment.payment_type, payment.amount);
    addBreakdown(breakdowns.source, payment.source, payment.amount);
    for (const allocation of payment.allocations) addBreakdown(breakdowns.designation, allocation.designation, allocation.amount);
  }
  summary.uniqueContributors = contributors.size;
  return { summary, breakdowns, payments };
}

function csvCell(value) {
  const string = String(value ?? "");
  return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

export function financeDetailCsv(report) {
  const rows = [["date", "contributor", "email", "revenue_category", "designation", "designation_type", "amount", "payment_method", "payment_type", "source", "status", "member_id", "stripe_session_id", "notes"]];
  for (const payment of report.payments) {
    const common = [payment.payment_date, payment.contributor, payment.email];
    const tail = [payment.payment_method, payment.payment_type, payment.source, payment.status, payment.member_id, payment.stripe_session_id, payment.notes];
    if (payment.membership > 0) rows.push([...common, "Membership", "", "", payment.membership, ...tail]);
    for (const allocation of payment.allocations) rows.push([...common, "Donation", allocation.designation, allocation.kind, allocation.amount, ...tail]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function financeSummaryCsv(report, from, to) {
  const rows = [
    ["Tryon History Museum Financial Summary"],
    ["Period", `${from} through ${to}`],
    [],
    ["Metric", "Amount/Count"],
    ["Total received", report.summary.total],
    ["Membership dues", report.summary.membership],
    ["Donations", report.summary.donations],
    ["Transactions", report.summary.transactionCount],
    ["Unique contributors", report.summary.uniqueContributors],
  ];
  for (const [heading, values] of Object.entries(report.breakdowns)) {
    rows.push([], [heading, "Amount"]);
    for (const [label, amount] of Object.entries(values).sort()) rows.push([label, amount]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
