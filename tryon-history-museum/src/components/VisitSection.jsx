import Link from "next/link";
import { Eyebrow, ButtonLink } from "@/components/brand";
import {
  scheduleLabel,
  getHoursList,
  getContactInfo,
  formatHoursCompact,
} from "@/lib/hours";

const textLinkClasses =
  "font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline border-b border-brand-heritage pb-1 transition-colors hover:text-brand-ink hover:border-brand-ink";

function SectionHeading({ children }) {
  return (
    <h2 className="m-0 mb-6 font-brand-display text-[clamp(26px,3vw,36px)] font-normal leading-[1.15] text-brand-ink">
      {children}
    </h2>
  );
}

export default function VisitSection({ siteSettings }) {
  const { street, cityStateZip, phone, email, mapEmbedUrl } =
    getContactInfo(siteSettings);
  const hoursCompact = formatHoursCompact(getHoursList(siteSettings));
  const admissionNote = siteSettings?.admissionNote || "Free";
  const visitorNote =
    siteSettings?.visitorCenterNote ||
    "The Museum also serves as Tryon\u2019s official Visitor Center. Stop in for local recommendations, maps, and everything you need to explore our corner of the Blue Ridge foothills.";
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${street}, ${cityStateZip}`
  )}`;
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  const facts = [
    { label: scheduleLabel, value: hoursCompact },
    { label: "Admission", value: admissionNote },
    { label: "Typical Visit", value: "15–30 minutes" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[720px]">
            <Eyebrow>Tryon History Museum &amp; Visitor Center</Eyebrow>
            <h1 className="m-0 font-brand-display text-[clamp(38px,5.5vw,60px)] font-normal leading-[1.1] text-brand-ink">
              Plan Your Visit
            </h1>
            <p className="m-0 mt-4 font-brand-display text-[clamp(19px,2.4vw,26px)] italic leading-[1.35] text-brand-heritage">
              A little history. A lot of stories. Right in the heart of
              downtown Tryon.
            </p>
            <p className="m-0 mt-7 max-w-[620px] font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Discover the remarkable people, places, and traditions that
              shaped our town. Admission is always free, and there&apos;s
              plenty to explore.
            </p>
          </div>

          {/* Visitor facts */}
          <dl className="m-0 mt-12 grid grid-cols-1 gap-5 border-t border-brand-ink/15 pt-8 sm:grid-cols-3 sm:gap-8">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-heritage">
                  {f.label}
                </dt>
                <dd className="m-0 mt-2 font-brand-body text-base text-brand-ink">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-brand-parchment">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[680px]">
            <SectionHeading>What to Expect</SectionHeading>
            <p className="m-0 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Explore the Museum at your own pace, discovering everything from
              Tryon&apos;s celebrated Toy-Makers and Wood-Carvers to its
              equestrian traditions, notable residents, and local history.
              Period music and the sounds of Nina Simone add another layer to
              the experience.
            </p>
            <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Most visitors spend 15&ndash;30 minutes exploring independently,
              though a conversation with one of our knowledgeable volunteer
              docents might keep you a little longer. We certainly don&apos;t
              mind.
            </p>
            <Link href="/exhibits" className={`mt-7 inline-block ${textLinkClasses}`}>
              Explore Our Exhibits &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Finding Us */}
      <section className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading>Finding Us</SectionHeading>
              <p className="m-0 font-brand-display text-xl leading-[1.4] text-brand-ink">
                {street}
                <br />
                {cityStateZip}
              </p>
              <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
                Convenient street parking is available, along with a parking
                lot directly across the street.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink
                  href={directionsUrl}
                  variant="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </ButtonLink>
                <ButtonLink href={phoneHref} variant="secondary">
                  Call the Museum
                </ButtonLink>
              </div>
              <p className="m-0 mt-6 font-brand-body text-[15px] text-brand-ink/60">
                {phone} &middot;{" "}
                <a
                  href={`mailto:${email}`}
                  className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2 hover:decoration-brand-heritage"
                >
                  {email}
                </a>
              </p>
            </div>
            <div className="relative min-h-[260px] overflow-hidden border border-brand-ink/10 bg-brand-parchment">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, position: "absolute", inset: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Map to the Tryon History Museum & Visitor Center"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="bg-brand-parchment">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[680px]">
            <SectionHeading>Accessibility</SectionHeading>
            <p className="m-0 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              The Museum&apos;s front entrance has three steps, and the
              building is not currently wheelchair accessible. We recognize
              this limitation and want visitors to have accurate information
              before arriving.
            </p>
            <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              Questions before your visit? Reach us at{" "}
              <a
                href={`mailto:${email}`}
                className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2 hover:decoration-brand-heritage"
              >
                {email}
              </a>{" "}
              or{" "}
              <a
                href={phoneHref}
                className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2 hover:decoration-brand-heritage"
              >
                {phone}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Group & school visits */}
      <section className="bg-brand-cream">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[680px]">
            <SectionHeading>Visiting with a Group?</SectionHeading>
            <p className="m-0 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              School classes, community organizations, and other groups are
              welcome to arrange visits. Contact the Museum to discuss a date
              and the interests of your group.
            </p>
            <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              <a
                href={`mailto:${email}`}
                className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2 hover:decoration-brand-heritage"
              >
                {email}
              </a>{" "}
              &middot;{" "}
              <a
                href={phoneHref}
                className="text-brand-heritage underline decoration-brand-heritage/40 underline-offset-2 hover:decoration-brand-heritage"
              >
                {phone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Visitor Center */}
      <section className="bg-brand-parchment">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-[680px]">
            <SectionHeading>More Than a Museum</SectionHeading>
            <p className="m-0 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              We&apos;re also a Visitor Center. Stop in for information about
              downtown Tryon and the surrounding foothills, and discover more
              of what makes this corner of North Carolina special.
            </p>
            <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-ink/75">
              {visitorNote}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
