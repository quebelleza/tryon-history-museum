import Image from "next/image";
import Link from "next/link";
import { Eyebrow, ButtonLink } from "@/components/brand";
import TicketSelector from "@/components/TicketSelector";
import { WINE_TASTING_EVENT } from "@/lib/events/wineTasting";

const event = WINE_TASTING_EVENT;

const textLinkClasses =
  "font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline border-b border-brand-heritage pb-1 transition-colors hover:text-brand-ink hover:border-brand-ink";

function SectionHeading({ children }) {
  return (
    <h2 className="m-0 mb-6 font-brand-display text-[clamp(26px,3vw,36px)] font-normal leading-[1.15] text-brand-ink">
      {children}
    </h2>
  );
}

/**
 * assetFlags — which standalone artwork files exist under
 * public/images/events/ (depot photo + sponsor logos are supplied
 * separately; the page renders honest fallbacks until they arrive).
 */
export default function WineTastingSection({ refundPolicy, assets = {} }) {
  const directionsUrl =
    "https://www.google.com/maps/search/?api=1&query=Tryon%20Depot%20Room%2C%2022%20Depot%20Street%2C%20Tryon%2C%20NC%2028782";

  return (
    <>
      {/* Hero — flyer-inspired cream + heritage red */}
      <section className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>A Museum Fundraiser</Eyebrow>
              <h1 className="m-0 mt-3 font-brand-display text-[clamp(38px,5.5vw,62px)] font-normal leading-[1.08] text-brand-ink">
                An Evening of{" "}
                <span className="italic text-brand-heritage">
                  Wine &amp; History
                </span>
              </h1>
              <p className="m-0 mt-4 font-brand-display text-[clamp(18px,2.2vw,24px)] italic leading-[1.4] text-brand-heritage">
                A curated wine tasting with {event.presenter}
              </p>
              <p className="m-0 mt-6 max-w-[560px] font-brand-body text-base leading-[1.75] text-brand-ink/75">
                Discover three local wines, stories of Tryon Cellars, and
                thoughtfully paired artisan bites from {event.foodSponsor} — an
                evening in support of the Tryon History Museum.
              </p>
              {/* Date ribbon — echoes the flyer's red band */}
              <div className="mt-8 inline-block bg-brand-heritage px-6 py-3">
                <p className="m-0 font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-cream">
                  {event.dateLabel} · {event.startTime}
                </p>
              </div>
              <p className="m-0 mt-4 font-brand-body text-sm text-brand-ink/60">
                {event.locationName} · {event.streetAddress}, {event.city},{" "}
                {event.region} ·{" "}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2"
                >
                  Get Directions
                </a>
              </p>
            </div>
            <div className="mx-auto w-full max-w-[380px] border border-brand-ink/10 bg-brand-parchment p-3 lg:max-w-none">
              <Image
                src={event.imagePath}
                alt="Event flyer for An Evening of Wine & History at the Tryon Depot Room"
                width={783}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the evening */}
      <section className="bg-brand-parchment">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <SectionHeading>The Evening</SectionHeading>
              <p className="m-0 font-brand-body text-base leading-[1.75] text-brand-ink/75">
                Join us in the historic Tryon Depot Room for a guided tasting
                led by {event.presenter}. Over the course of the evening,
                Rachel will pour three wines from Tryon Cellars and share the
                story of winemaking in our corner of the Carolina foothills.
              </p>
              <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
                Each pour is paired with artisan bites provided by{" "}
                {event.foodSponsor}. All proceeds support the exhibitions,
                programs, and preservation work of the Tryon History Museum
                &amp; Visitor Center.
              </p>
              <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
                This tasting is for guests 21 and older. Valid photo
                identification is required at the door.
              </p>
            </div>
            {assets.depot ? (
              <div className="self-start border border-brand-ink/10 bg-brand-cream p-3">
                <Image
                  src="/images/events/depot-room.jpg"
                  alt="The historic Tryon Depot, home of the Depot Room event space"
                  width={900}
                  height={600}
                  className="h-auto w-full"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading>Reserve Your Seats</SectionHeading>
              <dl className="m-0">
                <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                  <dt className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink">
                    Single Admission
                  </dt>
                  <dd className="m-0 font-brand-display text-lg text-brand-heritage">
                    {event.prices.single}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3">
                  <dt className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink">
                    Couples Admission
                  </dt>
                  <dd className="m-0 font-brand-display text-lg text-brand-heritage">
                    {event.prices.couple}
                  </dd>
                </div>
              </dl>
              <p className="m-0 mt-5 font-brand-body text-sm leading-[1.7] text-brand-ink/60">
                Space is limited. Every ticket directly supports the
                Museum&apos;s work preserving Tryon&apos;s stories.
              </p>
              {refundPolicy ? (
                <p className="m-0 mt-4 font-brand-body text-sm leading-[1.7] text-brand-ink/60">
                  <span className="font-semibold text-brand-ink">
                    Refund policy:
                  </span>{" "}
                  {refundPolicy}
                </p>
              ) : null}
            </div>
            <TicketSelector eventSlug={event.slug} />
          </div>
        </div>
      </section>

      {/* Venue & logistics */}
      <section className="bg-brand-parchment">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[680px]">
            <SectionHeading>Getting There</SectionHeading>
            <p className="m-0 font-brand-display text-xl leading-[1.4] text-brand-ink">
              {event.locationName}
              <br />
              {event.streetAddress}, {event.city}, {event.region}{" "}
              {event.postalCode}
            </p>
            <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              The Depot Room sits along the tracks in the heart of downtown
              Tryon, a short walk from the Museum on Maple Street. Doors open
              at {event.startTime}.
            </p>
            <div className="mt-7">
              <ButtonLink
                href={directionsUrl}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </ButtonLink>
            </div>
            <p className="m-0 mt-8 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Questions? Contact the Museum at{" "}
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
        </div>
      </section>

      {/* Sponsors */}
      <section className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-14 md:px-8 md:py-16">
          <p className="m-0 text-center font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-stone">
            With thanks to our sponsors
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {event.sponsors.map((name) =>
              assets.sponsorLogos?.[name] ? (
                <Image
                  key={name}
                  src={assets.sponsorLogos[name]}
                  alt={`${name} logo`}
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <span
                  key={name}
                  className="font-brand-display text-xl text-brand-ink/70"
                >
                  {name}
                </span>
              )
            )}
          </div>
          <p className="m-0 mt-10 text-center">
            <Link href="/events" className={textLinkClasses}>
              All Museum Events &rarr;
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
