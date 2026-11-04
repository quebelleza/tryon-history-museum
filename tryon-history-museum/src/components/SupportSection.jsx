import Link from "next/link";
import { Section, Eyebrow, DisplayHeadline, ButtonLink } from "@/components/brand";

const tiers = [
  {
    name: "Individual",
    price: "$50",
    perks:
      "Free admission, newsletter, 10% gift shop discount, member-only events",
  },
];

function normalizeSanityTiers(sanityTiers) {
  if (!sanityTiers || sanityTiers.length === 0) return null;
  return sanityTiers.map((t) => ({
    name: t.name,
    price: `$${t.price}`,
    perks: t.perks,
    featured: t.featured || false,
  }));
}

export default function SupportSection({ sanityTiers }) {
  const displayTiers = normalizeSanityTiers(sanityTiers) || tiers;

  return (
    <Section id="support" bg="heritage">
      <div className="mx-auto mb-14 max-w-[560px] text-center">
        <Eyebrow tone="stone">Support the Museum</Eyebrow>
        <DisplayHeadline tone="cream">
          History doesn&apos;t preserve itself.
        </DisplayHeadline>
        <p className="m-0 mt-5 font-brand-body text-base leading-[1.75] text-brand-cream/70">
          Your support helps us protect Tryon&apos;s past for generations to
          come.
        </p>
      </div>

      {/* Membership tiers */}
      <div
        className={`mx-auto grid max-w-[1000px] grid-cols-1 gap-6 ${
          displayTiers.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "max-w-[380px]"
        }`}
      >
        {displayTiers.map((tier) => (
          <div
            key={tier.name}
            className={`border p-7 text-center md:p-9 ${
              tier.featured
                ? "border-brand-stone/50 bg-brand-stone/10"
                : "border-brand-cream/15 bg-transparent"
            }`}
          >
            <p className="mb-4 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-stone">
              {tier.name}
            </p>
            <p className="m-0 mb-1 font-brand-display text-5xl font-normal text-brand-cream">
              {tier.price}
            </p>
            <p className="m-0 mb-6 font-brand-body text-xs text-brand-cream/40">
              per year
            </p>
            <p className="mb-7 font-brand-body text-sm leading-[1.7] text-brand-cream/65">
              {tier.perks}
            </p>
            <ButtonLink href="/membership" variant="secondaryOnDark">
              Join Now
            </ButtonLink>
          </div>
        ))}
      </div>

      {/* Membership, donation, volunteer links */}
      <div className="mt-12 flex flex-col items-center justify-center gap-6 border-t border-brand-cream/10 pt-10 sm:flex-row sm:gap-12">
        <Link
          href="/membership"
          className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-cream/75 no-underline transition-colors hover:text-brand-cream"
        >
          Become a Member &rarr;
        </Link>
        <Link
          href="/donate"
          className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-cream/75 no-underline transition-colors hover:text-brand-cream"
        >
          Make a Donation &rarr;
        </Link>
        <Link
          href="/volunteer"
          className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-cream/75 no-underline transition-colors hover:text-brand-cream"
        >
          Volunteer &rarr;
        </Link>
      </div>
    </Section>
  );
}
