import { Section, Eyebrow, DisplayHeadline, ButtonLink } from "@/components/brand";

// Same fallbacks as the /visit page — do not invent new details here.
const fallbackHours = [
  { day: "Friday", time: "1:00 PM – 4:00 PM" },
  { day: "Saturday", time: "1:00 PM – 4:00 PM" },
  { day: "Sunday – Thursday", time: "Closed" },
];

const fallbackContact = {
  street: "26 Maple Street",
  cityStateZip: "Tryon, NC 28782",
  phone: "(828) 440-1116",
};

export default function VisitMuseum({ siteSettings }) {
  const hours = siteSettings?.hours?.length
    ? siteSettings.hours.map((h) => ({ day: h.day, time: h.time }))
    : fallbackHours;
  const addr = siteSettings?.address;
  const street = addr?.street || fallbackContact.street;
  const cityStateZip = addr
    ? `${addr.city}, ${addr.state} ${addr.zip}`
    : fallbackContact.cityStateZip;
  const phone = siteSettings?.phone || fallbackContact.phone;
  const admissionNote = siteSettings?.admissionNote || "Free admission";
  const visitorNote =
    siteSettings?.visitorCenterNote ||
    "The Museum also serves as Tryon’s official Visitor Center. Stop in for local recommendations, maps, and everything you need to explore our corner of the Blue Ridge foothills.";
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${street}, ${cityStateZip}`
  )}`;

  return (
    <Section id="visit" bg="parchment">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr] md:gap-20">
        {/* Intro */}
        <div>
          <Eyebrow>Visit the Museum</Eyebrow>
          <DisplayHeadline>
            In the heart of
            <br />
            downtown Tryon.
          </DisplayHeadline>
          <p className="mt-6 max-w-[480px] font-brand-body text-base leading-[1.8] text-brand-ink/70">
            {visitorNote}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href="/visit">Plan Your Visit</ButtonLink>
            <ButtonLink
              href={directionsUrl}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </ButtonLink>
          </div>
        </div>

        {/* Hours + address panel */}
        <div className="border border-brand-ink/10 bg-brand-cream p-7 md:p-10">
          <p className="mb-5 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-heritage">
            Hours &amp; Location
          </p>
          <dl className="m-0">
            {hours.map((row) => (
              <div
                key={row.day}
                className="flex items-baseline justify-between gap-4 border-b border-brand-ink/10 py-3 last:border-b-0"
              >
                <dt className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink">
                  {row.day}
                </dt>
                <dd className="m-0 font-brand-body text-sm text-brand-ink/70">
                  {row.time}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mb-0 mt-6 font-brand-body text-sm leading-[1.7] text-brand-ink/70">
            {street}
            <br />
            {cityStateZip}
            <br />
            {phone}
          </p>
          <p className="mb-0 mt-4 font-brand-body text-sm italic text-brand-heritage">
            {admissionNote}
          </p>
        </div>
      </div>
    </Section>
  );
}
