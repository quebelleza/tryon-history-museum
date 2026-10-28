export const JAMIE_LAVAL_EVENT = {
  id: "scotland-to-appalachia-static",
  slug: "tales-of-tryon-jamie-laval",
  title: "From Scotland to Appalachia",
  fullTitle: "Tracing the Musical History of Scottish Immigration to Appalachia",
  eventType: "Tales of Tryon",
  date: "2026-11-12",
  dateLabel: "Thursday, November 12, 2026",
  doorTime: "4:00 p.m.",
  programTime: "5:00 p.m.",
  listingTime: "Doors 4:00 pm · Presentation 5:00 pm",
  description: "Tracing the musical history of Scottish immigration to Appalachia with Jamie Laval.",
  metadataDescription: "Join Jamie Laval on November 12, 2026, at 5 p.m. at Tryon Presbyterian Church for an evening exploring Scottish and Appalachian music. Free admission.",
  locationName: "Tryon Presbyterian Church",
  locationRoom: "Sanctuary",
  streetAddress: "430 Harmon Field Road",
  city: "Tryon",
  region: "NC",
  postalCode: "28782",
  country: "US",
  listingLocation: "Tryon Presbyterian Church · Tryon NC",
  canonicalUrl: "https://tryonhistorymuseum.org/events/tales-of-tryon-jamie-laval",
  imageUrl: "https://tryonhistorymuseum.org/images/events/jamie-laval-scotland-appalachia.jpg",
  imagePath: "/images/events/jamie-laval-scotland-appalachia.jpg",
  imageWidth: 540,
  imageHeight: 1024,
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

export function createJamieLavalIcs(now = new Date()) {
  const event = JAMIE_LAVAL_EVENT;
  const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const description = "Join Jamie Laval for a look at how music traveled from Scotland to Appalachia and changed along the way. Doors open at 4 p.m. with light refreshments in the narthex. The program begins at 5 p.m. in the sanctuary. Free admission.";
  const location = `${event.locationName}, ${event.streetAddress}, ${event.city}, ${event.region} ${event.postalCode}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tryon History Museum//Tales of Tryon//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:20261112T220000Z-jamie-laval@tryonhistorymuseum.org",
    `DTSTAMP:${dtstamp}`,
    "DTSTART:20261112T220000Z",
    `SUMMARY:${escapeIcs("Tales of Tryon: From Scotland to Appalachia with Jamie Laval")}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    `URL:${event.canonicalUrl}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
