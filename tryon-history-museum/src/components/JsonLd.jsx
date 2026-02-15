export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Museum", "TouristInformationCenter", "NonprofitOrganization"],
    name: "Tryon History Museum & Visitor Center",
    alternateName: "Tryon History Museum",
    url: "https://tryonhistorymuseum.org",
    telephone: "(828) 440-1116",
    email: "info@tryonhistorymuseum.org",
    address: {
      "@type": "PostalAddress",
      streetAddress: "26 Maple Street",
      addressLocality: "Tryon",
      addressRegion: "NC",
      postalCode: "28782",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.2088,
      longitude: -82.2332,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        opens: "13:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "13:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "11:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "11:00",
        closes: "17:00",
      },
    ],
    sameAs: ["https://www.facebook.com/tryonhistorymuseum/"],
    description:
      "Discover the rich heritage of Tryon, North Carolina — from Cherokee origins to the railroad age, from Nina Simone's first piano notes to a world-renowned equestrian tradition.",
    isAccessibleForFree: true,
    publicAccess: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function EventJsonLd({ events }) {
  if (!events || events.length === 0) return null;

  const data = events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || "",
    startDate: event.date,
    ...(event.time && { doorTime: event.time }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || "Tryon History Museum & Visitor Center",
      address: {
        "@type": "PostalAddress",
        streetAddress: "26 Maple Street",
        addressLocality: "Tryon",
        addressRegion: "NC",
        postalCode: "28782",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Tryon History Museum",
      url: "https://tryonhistorymuseum.org",
    },
    isAccessibleForFree: true,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
