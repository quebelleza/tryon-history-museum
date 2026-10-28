import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JAMIE_LAVAL_EVENT } from "@/lib/events/jamieLaval";
import styles from "./page.module.css";

const event = JAMIE_LAVAL_EVENT;
const directionsUrl = "https://www.google.com/maps/search/?api=1&query=Tryon%20Presbyterian%20Church%2C%20430%20Harmon%20Field%20Road%2C%20Tryon%2C%20NC%2028782";

export const metadata = {
  title: "Tales of Tryon with Jamie Laval | Tryon History Museum",
  description: event.metadataDescription,
  alternates: { canonical: event.canonicalUrl },
  openGraph: {
    title: "Tales of Tryon with Jamie Laval | Tryon History Museum",
    description: event.metadataDescription,
    url: event.canonicalUrl,
    siteName: "Tryon History Museum",
    type: "website",
    images: [
      {
        url: event.imageUrl,
        width: event.imageWidth,
        height: event.imageHeight,
        alt: "Jamie Laval holding a fiddle in the Scottish Highlands",
      },
    ],
  },
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Tales of Tryon: From Scotland to Appalachia with Jamie Laval",
  startDate: "2026-11-12T17:00:00-05:00",
  doorTime: "2026-11-12T16:00:00-05:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  isAccessibleForFree: true,
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
    name: "Jamie Laval",
  },
};

export default function JamieLavalEventPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <Nav />
      <div className={styles.navBackdrop} aria-hidden="true" />

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <Link href="/tales-of-tryon">Tales of Tryon</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Jamie Laval</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Tryon History Museum presents</p>
          <p className={styles.series}>Tales of Tryon</p>
          <h1>From Scotland to Appalachia</h1>
          <p className={styles.subtitle}>An evening with Jamie Laval</p>
          <p className={styles.programTitle}>{event.fullTitle}</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href={`/events/${event.slug}/calendar.ics`}>
              Add to calendar
            </a>
            <a
              className={styles.secondaryButton}
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
          </div>
        </div>
        <div className={styles.heroPortrait}>
          <Image
            src={event.imagePath}
            alt="Jamie Laval holding his fiddle against a mountain landscape in the Scottish Highlands"
            fill
            priority
            sizes="(max-width: 767px) 100vw, (max-width: 1200px) 42vw, 500px"
          />
        </div>
      </section>

      <section className={styles.facts} aria-label="Event details">
        <div>
          <p>Thursday</p>
          <strong>November 12, 2026</strong>
        </div>
        <div>
          <p>Program</p>
          <strong>5:00 p.m.</strong>
          <span>Doors open at 4:00 p.m.</span>
        </div>
        <div>
          <p>Location</p>
          <strong>Tryon Presbyterian Church</strong>
          <span>Sanctuary</span>
        </div>
        <div>
          <p>Admission</p>
          <strong>Free admission</strong>
        </div>
      </section>

      <section className={styles.program}>
        <div className={styles.programMain}>
          <p className={styles.sectionEyebrow}>About the evening</p>
          <h2>Hear the history in the music.</h2>
          <p>
            Join Jamie Laval for a look at how music traveled from Scotland to
            Appalachia and changed along the way. With live fiddle demonstrations,
            Jamie will explore the connections and differences among Irish,
            Scottish, old-time, bluegrass, and newgrass music.
          </p>
          <p>Come for the history, the music, or a little of both.</p>
        </div>
        <aside className={styles.presenter}>
          <p className={styles.sectionEyebrow}>Meet the presenter</p>
          <h2>Jamie Laval</h2>
          <p>
            Tryon resident Jamie Laval won the 2002 U.S. National Scottish Fiddle
            Championship. For this Tales of Tryon program, he brings musical
            history to life through conversation and live performance.
          </p>
        </aside>
      </section>

      <section className={styles.venue}>
        <div className={styles.venueInner}>
          <div>
            <p className={styles.sectionEyebrow}>Join us</p>
            <h2>Tryon Presbyterian Church</h2>
            <address>
              430 Harmon Field Road
              <br />
              Tryon, NC 28782
            </address>
          </div>
          <div>
            <h2>Before the music begins</h2>
            <p>
              Doors open at 4 p.m., with light refreshments in the narthex. The
              program begins at 5 p.m. in the sanctuary.
            </p>
            <p>Please enjoy refreshments before entering the sanctuary.</p>
          </div>
        </div>
      </section>

      <section className={styles.attribution} aria-label="Presenter attribution">
        <p>Presented by Tryon History Museum</p>
        <strong>Tales of Tryon</strong>
      </section>

      <Footer />
    </main>
  );
}
