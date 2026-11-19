export const WINE_TASTING_EVENT = {
  id: "wine-tasting-static",
  slug: "an-evening-of-wine-and-history",
  title: "An Evening of Wine & History",
  fullTitle: "An Evening of Wine & History — A Curated Tasting with Rachel Vining of Tryon Cellars",
  eventType: "Museum Fundraiser",
  date: "2026-12-02",
  dateLabel: "Wednesday, December 2, 2026",
  startTime: "5:00 p.m.",
  listingTime: "5:00 pm",
  description:
    "A curated wine tasting with Rachel Vining of Tryon Cellars at the Tryon Depot Room — three local wines, stories of Tryon Cellars, and thoughtfully paired artisan bites. Tickets $30 single / $50 couple.",
  metadataDescription:
    "Join the Tryon History Museum on December 2, 2026, at 5 p.m. at the Tryon Depot Room for An Evening of Wine & History — a curated tasting with Rachel Vining of Tryon Cellars. $30 single / $50 couple. Guests 21+.",
  locationName: "Tryon Depot Room",
  streetAddress: "22 Depot Street",
  city: "Tryon",
  region: "NC",
  postalCode: "28782",
  country: "US",
  listingLocation: "Tryon Depot Room · Tryon NC",
  canonicalUrl:
    "https://tryonhistorymuseum.org/events/an-evening-of-wine-and-history",
  confirmationUrl:
    "https://tryonhistorymuseum.org/events/an-evening-of-wine-and-history/confirmation",
  calendarUrl:
    "https://tryonhistorymuseum.org/events/an-evening-of-wine-and-history/calendar.ics",
  imageUrl:
    "https://tryonhistorymuseum.org/images/events/wine-and-history-flyer.jpg",
  imagePath: "/images/events/wine-and-history-flyer.jpg",
  presenter: "Rachel Vining of Tryon Cellars",
  foodSponsor: "Mill Spring Farm Store",
  sponsors: ["Mill Spring Farm Store", "New View Realty"],
  prices: { single: "$30", couple: "$50" },
};

function escapeIcs(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function foldIcsLine(line) {
  const encoder = new TextEncoder();
  const output = [];
  let current = "";
  for (const character of line) {
    if (current && encoder.encode(current + character).length > 75) {
      output.push(current);
      current = " " + character;
    } else {
      current += character;
    }
  }
  output.push(current);
  return output.join("\r\n");
}

export function createWineTastingIcs(now = new Date()) {
  const event = WINE_TASTING_EVENT;
  const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const description =
    "A curated wine tasting with Rachel Vining of Tryon Cellars at the Tryon Depot Room, 22 Depot Street, Tryon, NC. Discover three local wines, stories of Tryon Cellars, and thoughtfully paired artisan bites from Mill Spring Farm Store. Doors open at 5:00 p.m. Guests must be 21 or older with valid photo ID. A fundraiser for the Tryon History Museum.";
  const location = `${event.locationName}, ${event.streetAddress}, ${event.city}, ${event.region} ${event.postalCode}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tryon History Museum//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:20261202T220000Z-wine-tasting@tryonhistorymuseum.org",
    `DTSTAMP:${dtstamp}`,
    "DTSTART:20261202T220000Z",
    `SUMMARY:${escapeIcs("An Evening of Wine & History — Tryon History Museum")}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    `URL:${event.canonicalUrl}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
