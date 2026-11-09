"use client";

import Image from "next/image";
import { ButtonLink } from "@/components/brand";

const fallbackSchedule = {
  0: "Closed",
  1: "Closed",
  2: "Closed",
  3: "Closed",
  4: "Closed",
  5: "1:00 PM – 4:00 PM",
  6: "1:00 PM – 4:00 PM",
};

function getTodayHours(siteSettings) {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ...
  if (siteSettings?.hours) {
    const match = siteSettings.hours.find((h) => h.dayOfWeek === day);
    if (match) return match.time;
  }
  return fallbackSchedule[day];
}

export default function Hero({ siteSettings }) {
  const todayHours = getTodayHours(siteSettings);
  const street = siteSettings?.address?.street || "26 Maple Street";
  const cityStateZip = siteSettings?.address
    ? `${siteSettings.address.city}, ${siteSettings.address.state}`
    : "Tryon, NC";

  return (
    <>
      <section className="relative flex min-h-[480px] h-[92vh] items-end overflow-hidden md:min-h-[600px]">
        {/* Historical photograph */}
        <Image
          src="/images/trade-street-1946.jpg"
          alt="Trade Street in downtown Tryon, North Carolina, circa 1946"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Restrained dark gradient — slightly stronger behind the copy */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(34,34,34,0.94) 0%, rgba(34,34,34,0.68) 36%, rgba(34,34,34,0.28) 64%, rgba(34,34,34,0.42) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-16 md:px-8 md:pb-24">
          <div className="max-w-full">
            <p className="mb-4 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-stone md:mb-6">
              Tryon, North Carolina &middot; Est. 1885
            </p>
            <h1 className="m-0 font-brand-display font-normal text-[clamp(34px,6.5vw,58px)] leading-[1.14] tracking-[0.01em] text-brand-cream">
              <span className="block">Small town.</span>
              <span className="block">Deep roots.</span>
              <span className="block">Endless stories.</span>
            </h1>
            <p className="mt-5 max-w-full font-brand-body text-[15px] leading-[1.75] text-brand-cream/80 md:mt-7 md:max-w-[480px] md:text-[17px]">
              Discover the people, places, and remarkable stories that shaped
              our corner of the Carolina foothills.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-10 md:gap-4">
              <ButtonLink href="/history-bits">Explore Our History</ButtonLink>
              <ButtonLink href="/visit" variant="secondaryOnDark">
                Plan Your Visit
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Photo credit */}
        <p className="pointer-events-none absolute bottom-5 right-5 z-[5] hidden font-brand-secondary text-[10px] uppercase tracking-[0.05em] text-brand-cream/40 md:block">
          Trade Street &middot; Tryon, NC &middot; c. 1946
        </p>
      </section>

      {/* Visitor information strip */}
      <div className="bg-brand-ink">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col divide-y divide-brand-cream/10 px-5 py-4 font-brand-body text-sm text-brand-cream/75 sm:flex-row sm:items-center sm:divide-y-0 sm:divide-x sm:py-0 md:px-8">
          <div className="flex items-baseline gap-3 py-2 sm:py-4 sm:pr-6">
            <span className="font-brand-secondary text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-stone">
              Today&apos;s Hours
            </span>
            <span className="font-brand-display text-base font-normal text-brand-cream">
              {todayHours}
            </span>
          </div>
          <div className="flex items-baseline gap-3 py-2 sm:px-6 sm:py-4">
            <span className="font-brand-secondary text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-stone">
              Location
            </span>
            <span className="text-brand-cream/75">
              {street} &middot; {cityStateZip}
            </span>
          </div>
          <a
            href="/visit"
            className="py-2 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-stone no-underline transition-colors hover:text-brand-cream sm:ml-auto sm:py-4 sm:pl-6"
          >
            Plan Your Visit &rarr;
          </a>
        </div>
      </div>
    </>
  );
}
