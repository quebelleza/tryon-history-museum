import Link from "next/link";
import {
  Section,
  Eyebrow,
  DisplayHeadline,
  ButtonLink,
  EditorialImage,
} from "@/components/brand";
import { exhibitsHero, exhibitSections } from "@/lib/exhibitsContent";
import { getHoursList, getContactInfo, formatHoursCompact } from "@/lib/hours";

// Centralized schedule source — Sanity siteSettings overrides when present.

const statusLabels = {
  display: "Currently on display",
  unavailable: "Temporarily unavailable",
};

const statusStyles = {
  display: "text-brand-heritage",
  unavailable: "text-brand-ink/55",
};

function ExhibitEntry({ exhibit }) {
  return (
    <article className="border-t border-brand-ink/15 pt-8">
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
      <p className="m-0 font-brand-body text-base leading-[1.6] text-brand-ink/75">
        {exhibit.description}
      </p>
      {exhibit.note && (
        <p className="m-0 mt-3 font-brand-body text-sm italic leading-[1.6] text-brand-ink/60">
          {exhibit.note}
        </p>
      )}
    </article>
  );
}

export default function ExhibitsPageSection({ siteSettings }) {
  const hours = getHoursList(siteSettings);
  const { street, cityStateZip } = getContactInfo(siteSettings);
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
          <p className="m-0 mt-7 max-w-[640px] font-brand-body text-base leading-[1.75] text-brand-ink/75">
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
          <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 md:gap-y-14">
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
                  {formatHoursCompact(hours)}
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
