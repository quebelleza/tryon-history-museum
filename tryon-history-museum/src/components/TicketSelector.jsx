"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Ticket purchase flow for a ticketed event.
 * Fetches live availability, collects purchaser + per-seat attendee names,
 * then posts to /api/stripe/create-event-checkout and redirects to Stripe.
 */
export default function TicketSelector({ eventSlug }) {
  const [availability, setAvailability] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [quantities, setQuantities] = useState({ single: 0, couple: 0 });
  const [attendeeNames, setAttendeeNames] = useState({});
  const [purchaser, setPurchaser] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/event-availability?event=${encodeURIComponent(eventSlug)}`)
      .then((r) => {
        if (r.ok) return r.json();
        // Event row or ticket types not created yet → sales haven't opened.
        if (r.status === 404) return { salesPending: true };
        return Promise.reject();
      })
      .then(setAvailability)
      .catch(() => setLoadError(true));
  }, [eventSlug]);

  const types = availability?.ticketTypes || [];
  const totalSeats = useMemo(
    () =>
      types.reduce(
        (sum, t) => sum + (quantities[t.code] || 0) * t.seatsPerUnit,
        0
      ),
    [types, quantities]
  );
  const totalCents = useMemo(
    () =>
      types.reduce(
        (sum, t) => sum + (quantities[t.code] || 0) * t.priceCents,
        0
      ),
    [types, quantities]
  );

  // Attendee name slots keyed "code-index" — couple consumes two slots.
  const attendeeSlots = useMemo(() => {
    const slots = [];
    for (const t of types) {
      const qty = quantities[t.code] || 0;
      for (let i = 0; i < qty * t.seatsPerUnit; i++) {
        slots.push({ key: `${t.code}-${i}`, type: t.code, label: t.label });
      }
    }
    return slots;
  }, [types, quantities]);

  function setQty(code, qty) {
    setQuantities((q) => ({ ...q, [code]: qty }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const items = types
      .filter((t) => (quantities[t.code] || 0) > 0)
      .map((t) => {
        const attendees = [];
        for (let i = 0; i < (quantities[t.code] || 0) * t.seatsPerUnit; i++) {
          attendees.push(attendeeNames[`${t.code}-${i}`] || "");
        }
        return { code: t.code, quantity: quantities[t.code], attendees };
      });

    if (items.length === 0) {
      setError("Please select at least one ticket.");
      return;
    }
    if (!purchaser.name.trim() || !purchaser.email.trim() || !purchaser.phone.trim()) {
      setError("Please complete your name, email, and telephone number.");
      return;
    }
    if (attendeeSlots.some((s) => !(attendeeNames[s.key] || "").trim())) {
      setError("Please provide a name for every attendee.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/stripe/create-event-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_slug: eventSlug,
          purchaser,
          items,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Unable to start checkout. Please try again.");
      setStatus("idle");
    } catch {
      setError("Unable to start checkout. Please try again.");
      setStatus("idle");
    }
  }

  if (loadError) {
    return (
      <p className="font-brand-body text-base text-brand-ink/70">
        Ticket availability could not be loaded. Please call the Museum at{" "}
        <a href="tel:8284401116" className="text-brand-heritage underline">
          (828) 440-1116
        </a>{" "}
        for assistance.
      </p>
    );
  }

  if (!availability) {
    return (
      <p className="font-brand-body text-base text-brand-ink/50">
        Loading ticket availability…
      </p>
    );
  }

  if (availability.salesPending || !availability.salesEnabled) {
    return (
      <div className="border border-brand-ink/10 bg-brand-parchment p-6 text-center md:p-10">
        <p className="m-0 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-heritage">
          Ticket Sales
        </p>
        <p className="m-0 mt-3 font-brand-display text-[26px] font-normal leading-[1.2] text-brand-ink">
          Ticket sales opening soon
        </p>
        <p className="m-0 mx-auto mt-4 max-w-[400px] font-brand-body text-base leading-[1.7] text-brand-ink/70">
          Online ticketing for this event is not yet open — please check back
          soon. In the meantime, questions are welcome at{" "}
          <a
            href="mailto:info@tryonhistorymuseum.org"
            className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2"
          >
            info@tryonhistorymuseum.org
          </a>{" "}
          or{" "}
          <a
            href="tel:8284401116"
            className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2"
          >
            (828) 440-1116
          </a>
          .
        </p>
      </div>
    );
  }

  const soldOut = availability.soldOut;

  return (
    <form onSubmit={handleSubmit} className="border border-brand-ink/10 bg-brand-parchment p-6 md:p-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="m-0 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-heritage">
          Tickets
        </p>
        <p className="m-0 font-brand-body text-sm text-brand-ink/60">
          {soldOut ? "Sold out" : `${availability.remaining} of ${availability.capacity} seats remaining`}
        </p>
      </div>

      {/* Ticket types */}
      <div className="space-y-4">
        {types.map((t) => (
          <div
            key={t.code}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-ink/10 pb-4"
          >
            <div>
              <p className="m-0 font-brand-body text-base font-semibold text-brand-ink">
                {t.label}
              </p>
              <p className="m-0 font-brand-body text-sm text-brand-ink/60">
                ${(t.priceCents / 100).toFixed(0)}
                {t.seatsPerUnit > 1 ? ` · ${t.seatsPerUnit} guests` : " · per person"}
              </p>
            </div>
            <select
              value={quantities[t.code] || 0}
              onChange={(e) => setQty(t.code, Number(e.target.value))}
              disabled={soldOut}
              aria-label={`${t.label} quantity`}
              className="min-h-[44px] border border-brand-ink/20 bg-brand-cream px-3 py-2 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {soldOut && (
        <p className="m-0 mt-4 font-brand-body text-base text-brand-ink/70">
          This event is currently sold out. Contact the Museum to be notified if
          seats become available.
        </p>
      )}

      {/* Attendee names — one field per seat */}
      {attendeeSlots.length > 0 && (
        <fieldset className="m-0 mt-7 border-0 p-0">
          <legend className="mb-3 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-heritage">
            Attendee Names
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {attendeeSlots.map((s, i) => (
              <label key={s.key} className="block">
                <span className="sr-only">
                  Guest {i + 1} ({s.label})
                </span>
                <input
                  type="text"
                  required
                  placeholder={`Guest ${i + 1} — ${s.label}`}
                  value={attendeeNames[s.key] || ""}
                  onChange={(e) =>
                    setAttendeeNames((a) => ({ ...a, [s.key]: e.target.value }))
                  }
                  className="min-h-[44px] w-full border border-brand-ink/20 bg-brand-cream px-3 py-2 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Purchaser */}
      <fieldset className="m-0 mt-7 border-0 p-0">
        <legend className="mb-3 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-heritage">
          Your Information
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">Full name</span>
            <input
              type="text"
              required
              placeholder="Full name"
              autoComplete="name"
              value={purchaser.name}
              onChange={(e) => setPurchaser((p) => ({ ...p, name: e.target.value }))}
              className="min-h-[44px] w-full border border-brand-ink/20 bg-brand-cream px-3 py-2 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage"
            />
          </label>
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              type="email"
              required
              placeholder="Email address"
              autoComplete="email"
              value={purchaser.email}
              onChange={(e) => setPurchaser((p) => ({ ...p, email: e.target.value }))}
              className="min-h-[44px] w-full border border-brand-ink/20 bg-brand-cream px-3 py-2 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="sr-only">Telephone</span>
            <input
              type="tel"
              required
              placeholder="Telephone number"
              autoComplete="tel"
              value={purchaser.phone}
              onChange={(e) => setPurchaser((p) => ({ ...p, phone: e.target.value }))}
              className="min-h-[44px] w-full border border-brand-ink/20 bg-brand-cream px-3 py-2 font-brand-body text-base text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-heritage"
            />
          </label>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="m-0 mt-5 font-brand-body text-sm font-semibold text-brand-heritage">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={soldOut || totalSeats === 0 || status === "loading"}
        className="mt-7 inline-block min-h-[48px] w-full cursor-pointer border-none bg-brand-heritage px-7 py-3.5 font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-cream transition-colors duration-200 hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-heritage sm:w-auto"
      >
        {status === "loading"
          ? "Redirecting to checkout…"
          : totalCents > 0
            ? `Purchase Tickets — $${(totalCents / 100).toFixed(0)}`
            : "Purchase Tickets"}
      </button>
      <p className="m-0 mt-4 font-brand-body text-[13px] leading-[1.6] text-brand-ink/55">
        Secure checkout via Stripe. Guests must be 21 or older; valid photo ID
        is required at the door.
      </p>
    </form>
  );
}
