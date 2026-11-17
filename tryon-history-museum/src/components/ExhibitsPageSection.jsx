import Link from "next/link";
import {
  Section,
  Eyebrow,
  DisplayHeadline,
  ButtonLink,
  EditorialImage,
} from "@/components/brand";
import { exhibitsHero, exhibitSections } from "@/lib/exhibitsContent";

// Same centralized-data fallbacks as the /visit section — do not
// hardcode new hours; Sanity siteSettings overrides when present.
const fallbackHours = [
  { day: "Friday", time: "1:00 PM – 4:00 PM" },
  { day: "Saturday", time: "1:00 PM – 4:00 PM" },
];

const fallbackContact = {
  street: "26 Maple Street",
  cityStateZip: "Tryon, NC 28782",
};

const statusLabels = {
  display: "Currently on display",
  unavailable: "Temporarily unavailable",
};

const statusStyles = {
  display: "text-brand-heritage",
  unavailable: "text-brand-ink/45",
};

function ExhibitEntry({ exhibit }) {
  return (
    <article className="border-t border-brand-ink/15 pt-6">
      {exhibit.image && (
        <EditorialImage
          src={exhibit.image.src}
          alt={exhibit.image.alt}
          credit={exhibit.image.credit}
          className="mb-5"
        />
      )}
      {exhibit.status && (
        <p
          className={`m-0 mb-2 font-brand-secondary text-[10px] font-semibold uppercase tracking-[0.2em] ${statusStyles[exhibit.status]}`}
        >
          {statusLabels[exhibit.status]}
        </p>
      )}
      <h3 className="m-0 mb-3 font-brand-display text-[22px] font-normal leading-[1.25] text-brand-ink">
        {exhibit.title}
      </h3>
      <p className="m-0 font-brand-body text-[15px] leading-[1.75] text-brand-ink/65">
        {exhibit.description}
      </p>
      {exhibit.note && (
        <p className="m-0 mt-3 font-brand-body text-[13px] italic leading-[1.6] text-brand-ink/50">
          {exhibit.note}
        </p>
      )}
    </article>
  );
}

export default function ExhibitsPageSection({ siteSettings }) {
  const hours = siteSettings?.hours?.length
    ? siteSettings.hours.map((h) => ({ day: h.day, time: h.time }))
    : fallbackHours;
  const addr = siteSettings?.address;
  const street = addr?.street || fallbackContact.street;
  const cityStateZip = addr
    ? `${addr.city}, ${addr.state} ${addr.zip}`
    : fallbackContact.cityStateZip;
  const admissionNote = siteSettings?.admissionNote || "Free admission";

  const backgrounds = ["parchment", "cream", "parchment", "cream"];

  return (
    <>
      {/* Hero */}
      <Section bg="cream">
        <div className="max-w-[720px]">
          <Eyebrow>{exhibitsHero.eyebrow}</Eyebrow>
          <h1 className="m-0 font-brand-display text-[clamp(36px,5.5vw,58px)] font-normal leading-[1.12] text-brand-ink">
            {exhibitsHero.heading}
          </h1>
          <p className="m-0 mt-4 font-brand-display text-[clamp(19px,2.4vw,26px)] italic leading-[1.35] text-brand-heritage">
            {exhibitsHero.subheading}
          </p>
          <p className="m-0 mt-7 max-w-[560px] font-brand-body text-base leading-[1.8] text-brand-ink/70">
            {exhibitsHero.intro}
          </p>
          <Link
            href="/visit"
            className="mt-7 inline-block font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline border-b border-brand-heritage pb-1 transition-colors hover:text-brand-ink hover:border-brand-ink"
          >
            Plan Your Visit &rarr;
          </Link>
        </div>
      </Section>

      {/* Exhibit groups */}
      {exhibitSections.map((section, i) => (
        <Section key={section.id} bg={backgrounds[i % backgrounds.length]}>
          <div className="mb-12 md:mb-14">
            <DisplayHeadline as="h2" size="md">
              {section.title}
            </DisplayHeadline>
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {section.exhibits.map((exhibit) => (
              <ExhibitEntry key={exhibit.title} exhibit={exhibit} />
            ))}
          </div>
        </Section>
      ))}

      {/* Closing visitor invitation */}
      <Section bg="heritage">
        <div className="max-w-[720px]">
          <DisplayHeadline as="h2" tone="cream">
            Come See the Stories for Yourself.
          </DisplayHeadline>
          <p className="m-0 mt-6 max-w-[520px] font-brand-body text-base leading-[1.8] text-brand-cream/75">
            There&apos;s always something to discover at the Tryon History
            Museum &amp; Visitor Center.
          </p>

          <dl className="m-0 mt-10 border-t border-brand-cream/25 pt-8">
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
              <div>
                <dt className="font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cream/60">
                  Admission
                </dt>
                <dd className="m-0 mt-1.5 font-brand-body text-[15px] text-brand-cream">
                  {admissionNote}
                </dd>
              </div>
              <div>
                <dt className="font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cream/60">
                  Location
                </dt>
                <dd className="m-0 mt-1.5 font-brand-body text-[15px] text-brand-cream">
                  {street} &middot; {cityStateZip}
                </dd>
              </div>
              <div>
                <dt className="font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cream/60">
                  Hours
                </dt>
                <dd className="m-0 mt-1.5 font-brand-body text-[15px] text-brand-cream">
                  {hours.map((h) => `${h.day} ${h.time}`).join(" · ")}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-10">
            <ButtonLink href="/visit" variant="light">
              Plan Your Visit
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
