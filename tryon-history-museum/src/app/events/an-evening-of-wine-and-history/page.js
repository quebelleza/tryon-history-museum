import fs from "node:fs";
import path from "node:path";
import Nav from "@/components/Nav";
import WineTastingSection from "@/components/WineTastingSection";
import Footer from "@/components/Footer";
import { WINE_TASTING_EVENT } from "@/lib/events/wineTasting";
import { createAdminClient } from "@/lib/supabase/admin";

const event = WINE_TASTING_EVENT;

export const revalidate = 60;

export const metadata = {
  title: "An Evening of Wine & History | Tryon History Museum",
  description: event.metadataDescription,
  alternates: { canonical: event.canonicalUrl },
  openGraph: {
    title: "An Evening of Wine & History | Tryon History Museum",
    description: event.metadataDescription,
    url: event.canonicalUrl,
    siteName: "Tryon History Museum",
    type: "website",
    images: [
      {
        url: event.imageUrl,
        width: 783,
        height: 1024,
        alt: "Event flyer for An Evening of Wine & History",
      },
    ],
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "An Evening of Wine & History",
  startDate: "2026-12-02T17:00:00-05:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  isAccessibleForFree: false,
  url: event.canonicalUrl,
  image: [event.imageUrl],
  description: event.metadataDescription,
  location: {
    "@type": "Place",
    name: event.locationName,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.streetAddress,
      addressLocality: event.city,
      addressRegion: event.region,
      postalCode: event.postalCode,
      addressCountry: event.country,
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Tryon History Museum",
    url: "https://tryonhistorymuseum.org",
  },
  performer: {
    "@type": "Person",
    name: "Rachel Vining",
    affiliation: { "@type": "Organization", name: "Tryon Cellars" },
  },
  offers: [
    {
      "@type": "Offer",
      name: "Single Admission",
      price: "30.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${event.canonicalUrl}#tickets`,
    },
    {
      "@type": "Offer",
      name: "Couples Admission",
      price: "50.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${event.canonicalUrl}#tickets`,
    },
  ],
};

function assetExists(filename) {
  return fs.existsSync(path.join(process.cwd(), "public", "images", "events", filename));
}

export default async function WineTastingPage() {
  let refundPolicy = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("ticketed_events")
      .select("refund_policy")
      .eq("slug", event.slug)
      .maybeSingle();
    refundPolicy = data?.refund_policy || null;
  } catch {
    // Ticketing tables may not be migrated yet — the page still renders
    // and the selector shows its own sales-closed/error state.
  }

  const sponsorLogos = {};
  if (assetExists("mill-spring-farm-store-logo.png")) {
    sponsorLogos["Mill Spring Farm Store"] = {
      src: "/images/events/mill-spring-farm-store-logo.png",
      width: 354,
      height: 330,
      className: "h-20",
    };
  }
  if (assetExists("new-view-realty-logo.png")) {
    sponsorLogos["New View Realty"] = {
      src: "/images/events/new-view-realty-logo.png",
      width: 534,
      height: 156,
      className: "h-14",
    };
  }

  return (
    <main id="main-content" className="bg-brand-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <Nav />
      <div className="pt-20 md:pt-24">
        <WineTastingSection
          refundPolicy={refundPolicy}
          assets={{
            depot: assetExists("depot-room.jpg"),
            magnolia: assetExists("wine-magnolia.png"),
            sponsorLogos,
          }}
        />
      </div>
      <Footer />
    </main>
  );
}
