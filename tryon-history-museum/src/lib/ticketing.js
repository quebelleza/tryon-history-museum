/**
 * Shared ticketing helpers — pure functions used by the checkout route,
 * admin APIs, and unit tests. No Stripe/Supabase imports here so the
 * module stays loadable in any environment.
 */

export const MAX_SEATS_PER_ORDER = 10;
export const MAX_QTY_PER_TYPE = 20;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === "string" && email.length <= 320 && EMAIL_RE.test(email);
}

/**
 * Validate the purchaser block from the checkout POST body.
 * Returns { name, email, phone } or throws with a client-safe message.
 */
export function validatePurchaser(input) {
  const name = String(input?.name ?? "").trim();
  const email = String(input?.email ?? "").trim();
  const phone = String(input?.phone ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    throw new TicketingError("Please provide the purchaser's full name.", "invalid_name");
  }
  if (!isValidEmail(email)) {
    throw new TicketingError("Please provide a valid email address.", "invalid_email");
  }
  if (phone.length < 7 || phone.length > 30) {
    throw new TicketingError("Please provide a valid telephone number.", "invalid_phone");
  }
  return { name, email, phone };
}

export class TicketingError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

/**
 * Validate + normalize order items against the event's active ticket types.
 * items: [{ code, quantity, attendees: [name, ...] }]
 * ticketTypes: rows from event_ticket_types.
 *
 * Returns { items, totalSeats, totalCents } where items carry the
 * server-side price/seat snapshot. Throws TicketingError with a
 * client-safe message on any mismatch.
 */
export function normalizeOrderItems(items, ticketTypes) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TicketingError("Please select at least one ticket.", "invalid_items");
  }

  const byCode = new Map(ticketTypes.map((t) => [t.code, t]));
  const normalized = [];
  let totalSeats = 0;
  let totalCents = 0;

  for (const item of items) {
    const code = String(item?.code ?? "");
    const type = byCode.get(code);
    if (!type) {
      throw new TicketingError(`Unknown ticket type "${code}".`, "invalid_ticket_type");
    }
    const quantity = Math.floor(Number(item?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY_PER_TYPE) {
      throw new TicketingError("Invalid ticket quantity.", "invalid_quantity");
    }
    const seats = quantity * type.seats_per_unit;

    const attendees = Array.isArray(item?.attendees)
      ? item.attendees.map((n) => String(n ?? "").trim())
      : [];
    if (attendees.length !== seats) {
      throw new TicketingError(
        `Please provide a name for every attendee — ${type.label} requires ${type.seats_per_unit} name${type.seats_per_unit > 1 ? "s" : ""} per ticket.`,
        "attendee_count_mismatch"
      );
    }
    for (const n of attendees) {
      if (n.length < 2 || n.length > 120) {
        throw new TicketingError("Each attendee name must be at least 2 characters.", "invalid_attendee_name");
      }
    }

    normalized.push({
      code,
      quantity,
      attendees,
      unit_price_cents: type.price_cents,
      seats,
    });
    totalSeats += seats;
    totalCents += type.price_cents * quantity;
  }

  if (totalSeats > MAX_SEATS_PER_ORDER) {
    throw new TicketingError(
      `Orders are limited to ${MAX_SEATS_PER_ORDER} seats. Please split larger groups into multiple orders or contact the Museum.`,
      "too_many_seats"
    );
  }

  return { items: normalized, totalSeats, totalCents };
}

/** Short human-facing reference for confirmations/emails. */
export function orderReference(orderId) {
  return `THM-${String(orderId).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Seats committed for an event given a list of order rows.
 * Mirrors event_seats_sold() in the database — kept here for the public
 * availability endpoint and tests.
 */
export function countCommittedSeats(orders, now = new Date()) {
  return orders.reduce((sum, o) => {
    if (o.status === "paid" || o.status === "comp") return sum + o.seats;
    if (
      o.status === "pending" &&
      o.stripe_session_expires_at &&
      new Date(o.stripe_session_expires_at) > now
    ) {
      return sum + o.seats;
    }
    return sum;
  }, 0);
}

/** Map a create_event_order RPC error code to { status, message }. */
export function rpcErrorToResponse(message) {
  const [code, detail] = String(message).split(":");
  switch (code) {
    case "event_not_found":
      return { status: 404, message: "Event not found." };
    case "sales_closed":
      return { status: 409, message: "Ticket sales are not currently open for this event." };
    case "invalid_items":
      return { status: 400, message: "Please select at least one ticket." };
    case "invalid_ticket_type":
      return { status: 400, message: `Unknown ticket type "${detail}".` };
    case "invalid_quantity":
      return { status: 400, message: "Invalid ticket quantity." };
    case "attendee_count_mismatch":
      return { status: 400, message: "Please provide a name for every attendee." };
    case "invalid_attendee_name":
      return { status: 400, message: "Each attendee name must be at least 2 characters." };
    case "too_many_seats":
      return { status: 400, message: `Orders are limited to ${detail ?? MAX_SEATS_PER_ORDER} seats.` };
    case "sold_out":
      return {
        status: 409,
        message:
          detail && Number(detail) > 0
            ? `Only ${detail} seat${Number(detail) === 1 ? "" : "s"} remain for this event.`
            : "This event is sold out.",
      };
    default:
      return { status: 500, message: "Unable to create the order." };
  }
}
