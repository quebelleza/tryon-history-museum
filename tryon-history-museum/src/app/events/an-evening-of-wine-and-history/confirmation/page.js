import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { WINE_TASTING_EVENT } from "@/lib/events/wineTasting";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderReference, formatCents } from "@/lib/ticketing";

const event = WINE_TASTING_EVENT;

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed | Tryon History Museum",
  robots: { index: false },
};

export default async function ConfirmationPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  let order = null;

  if (sessionId) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("event_orders")
        .select("*, event_order_items(*), event_order_attendees(full_name)")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      order = data;
    } catch {
      order = null;
    }
  }

  const attendees = order?.event_order_attendees || [];
  const items = order?.event_order_items || [];

  return (
    <main id="main-content" className="bg-brand-cream">
      <Nav />
      <div className="pt-20 md:pt-24">
        <section className="mx-auto w-full max-w-[760px] px-5 py-16 md:px-8 md:py-24">
          <p className="m-0 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-heritage">
            {event.title}
          </p>
          <h1 className="m-0 mt-3 font-brand-display text-[clamp(34px,5vw,52px)] font-normal leading-[1.1] text-brand-ink">
            Thank you — you&apos;re on the list.
          </h1>

          {order ? (
            <>
              <p className="m-0 mt-6 font-brand-body text-base leading-[1.75] text-brand-ink/75">
                A confirmation email is on its way to{" "}
                <strong className="text-brand-ink">
                  {order.purchaser_email}
                </strong>
                . Please bring valid photo ID — this tasting is for guests 21
                and older.
              </p>
              <div className="mt-8 border border-brand-ink/10 bg-brand-parchment p-6 md:p-8">
                <dl className="m-0">
                  <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Event
                    </dt>
                    <dd className="m-0 text-right font-brand-body text-base text-brand-ink">
                      {event.title}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Date &amp; Time
                    </dt>
                    <dd className="m-0 text-right font-brand-body text-base text-brand-ink">
                      {event.dateLabel} · {event.startTime}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Venue
                    </dt>
                    <dd className="m-0 text-right font-brand-body text-base text-brand-ink">
                      {event.locationName}, {event.streetAddress}, {event.city}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Tickets
                    </dt>
                    <dd className="m-0 text-right font-brand-body text-base text-brand-ink">
                      {items.map((i) => `${i.quantity} × ${i.ticket_label}`).join(" · ")}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Amount
                    </dt>
                    <dd className="m-0 text-right font-brand-body text-base font-semibold text-brand-ink">
                      {formatCents(order.amount_cents)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60">
                      Reference
                    </dt>
                    <dd className="m-0 text-right font-brand-body font-mono text-base text-brand-ink">
                      {orderReference(order.id)}
                    </dd>
                  </div>
                </dl>
                {attendees.length > 0 && (
                  <p className="m-0 mt-4 border-t border-brand-ink/10 pt-4 font-brand-body text-sm leading-[1.7] text-brand-ink/70">
                    <span className="font-semibold text-brand-ink">
                      Guest list:
                    </span>{" "}
                    {attendees.map((a) => a.full_name).join(", ")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="m-0 mt-6 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Your order has been received and a confirmation email is on its
              way. If you have any questions, contact the Museum at{" "}
              <a
                href="mailto:info@tryonhistorymuseum.org"
                className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2"
              >
                info@tryonhistorymuseum.org
              </a>
              .
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-6">
            <a
              href={event.calendarUrl}
              className="inline-block border-b border-brand-heritage pb-1 font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline"
            >
              Add to Calendar &rarr;
            </a>
            <Link
              href="/events"
              className="inline-block border-b border-brand-ink/30 pb-1 font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-ink/60 no-underline"
            >
              All Museum Events &rarr;
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
