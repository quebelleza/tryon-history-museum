"use client";

import Image from "next/image";
import { ButtonLink } from "@/components/brand";

const fallbackSchedule = {
  0: "Closed",
  1: "Closed",
  2: "Closed",
  3: "1:00 PM – 4:00 PM",
  4: "1:00 PM – 4:00 PM",
  5: "1:00 PM – 4:00 PM",
  6: "Closed",
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

  return (
    <section className="relative flex min-h-[480px] h-screen items-end overflow-hidden md:min-h-[600px]">
      {/* Historical photograph */}
      <Image
        src="/images/trade-street-1946.jpg"
        alt="Trade Street in downtown Tryon, North Carolina, circa 1946"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Restrained dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(34,34,34,0.92) 0%, rgba(34,34,34,0.55) 38%, rgba(34,34,34,0.15) 68%, rgba(34,34,34,0.35) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-32 md:px-8 md:pb-24">
        <div className="max-w-full md:max-w-[720px]">
          <p className="mb-4 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-stone md:mb-6">
            Tryon, North Carolina &middot; Est. 1885
          </p>
          <h1 className="m-0 font-brand-display font-normal text-[clamp(36px,7vw,64px)] leading-[1.1] text-brand-cream">
            Small town. Deep roots.
            <br />
            Endless stories.
          </h1>
          <p className="mt-5 max-w-full font-brand-body text-[15px] leading-[1.75] text-brand-cream/75 md:mt-7 md:max-w-[480px] md:text-[17px]">
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

      {/* Today's hours — mobile */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-brand-cream/10 bg-brand-ink/85 px-5 py-4 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-brand-secondary text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-stone">
              Today&apos;s Hours
            </p>
            <p className="mt-0.5 font-brand-display text-lg font-normal text-brand-cream">
              {todayHours}
            </p>
          </div>
          <a
            href="/visit"
            className="font-brand-secondary text-xs font-semibold uppercase tracking-[0.1em] text-brand-stone no-underline"
          >
            See all hours
          </a>
        </div>
      </div>

      {/* Today's hours — desktop */}
      <div className="absolute bottom-0 right-0 z-10 hidden border border-b-0 border-r-0 border-brand-cream/10 bg-brand-ink/85 px-10 py-7 backdrop-blur-md md:block">
        <p className="mb-3 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-stone">
          Today&apos;s Hours
        </p>
        <p className="font-brand-display text-[22px] font-normal text-brand-cream">
          {todayHours}
        </p>
        <p className="mt-1 font-brand-body text-xs text-brand-cream/50">
          Open Wed&ndash;Fri &middot;{" "}
          <a
            href="/visit"
            className="text-brand-stone no-underline hover:text-brand-cream"
          >
            See all hours
          </a>
        </p>
      </div>

      {/* Photo credit */}
      <p className="pointer-events-none absolute bottom-5 left-8 z-[5] hidden font-brand-secondary text-[10px] uppercase tracking-[0.05em] text-brand-cream/40 md:block">
        Trade Street &middot; Tryon, NC &middot; c. 1946
      </p>
    </section>
  );
}
