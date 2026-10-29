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
        alt: "Jamie Laval playing violin in a black jacket",
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 9V7a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 7v2a3 3 0 0 0 0 6v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17v-2a3 3 0 0 0 0-6Z" />
      <path d="M13 8v2m0 4v2" strokeDasharray="2 2.4" />
    </svg>
  );
}

function ThistleDecor() {
  return (
    <svg viewBox="0 0 140 110" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M70 108 C70 74 66 58 52 40" />
      <path d="M70 108 C72 78 82 62 100 48" />
      <path d="M70 108 C68 88 60 80 44 72" />
      <path d="M52 40 C46 30 48 20 58 16 C68 12 78 18 78 30 C78 42 66 50 58 48" />
      <path d="M58 48 C54 44 50 40 52 40" />
      <path d="M44 72 C36 68 32 60 36 54" />
      <path d="M100 48 C108 44 116 46 120 54" />
      <ellipse cx="64" cy="34" rx="4" ry="7" transform="rotate(24 64 34)" />
    </svg>
  );
}

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
          <p className={styles.series}><span aria-hidden="true" className={styles.seriesRule} />Tales of Tryon</p>
          <h1>{event.fullTitle}</h1>
          <p className={styles.subtitle}>An evening with Jamie Laval</p>
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
            alt="Jamie Laval playing violin in a black jacket"
            fill
            priority
            sizes="(max-width: 767px) 100vw, (max-width: 1200px) 42vw, 500px"
          />
        </div>
      </section>

      <section className={styles.infoStrip} aria-label="Event details">
        <div className={styles.infoItem}>
          <CalendarIcon />
          <div>
            <p className={styles.infoLabel}>When</p>
            <p className={styles.infoValue}>{event.dateLabel}<br />{event.programTime}</p>
          </div>
        </div>
        <div className={styles.infoItem}>
          <PinIcon />
          <div>
            <p className={styles.infoLabel}>Where</p>
            <p className={styles.infoValue}>
              {event.locationName}<br />
              {event.streetAddress}<br />
              {event.city}, {event.region} {event.postalCode}
            </p>
          </div>
        </div>
        <div className={styles.infoItem}>
          <TicketIcon />
          <div>
            <p className={styles.infoLabel}>Admission</p>
            <p className={styles.infoValue}>Free<br />Open to the public</p>
          </div>
        </div>
      </section>

      <section className={styles.aboutGrid}>
        <div className={styles.aboutMain}>
          <h2>About the Evening</h2>
          <p>
            Join acclaimed Celtic musician Jamie Laval for a fascinating
            exploration of the musical traditions Scottish immigrants carried
            into Appalachia. Through stories and live musical selections, Jamie
            will trace the connections between the melodies of the Scottish
            Highlands and the musical heritage of our mountain region.
          </p>
          <p>
            This special Tales of Tryon program offers a unique look at how
            music helped shape the people, places, and traditions that define
            our area today.
          </p>

          <h2 className={styles.meetHeading}>Meet Jamie Laval</h2>
          <p>
            Jamie Laval is a noted Celtic musician, music educator, and
            storyteller whose work explores the deep connections between
            Scottish and Appalachian musical traditions. He performs widely
            across the United States and abroad, sharing the history, culture,
            and enduring beauty of this musical heritage through engaging
            programs and live performances.
          </p>
        </div>
        <div className={styles.aboutSide}>
          <div className={styles.aboutPhoto}>
            <Image
              src="/images/events/jamie-laval-3363.jpg"
              alt="Jamie Laval holding his violin, wearing a green vest"
              fill
              sizes="(max-width: 767px) 100vw, 38vw"
            />
          </div>
          <div className={styles.meetSide}>
            <p>
              Drawing on years of research and performance, Jamie brings to life
              the stories of the people who carried their music from the
              Scottish Highlands to the mountains of the American South — and
              how those melodies continue to resonate today.
            </p>
            <ThistleDecor />
          </div>
        </div>
      </section>

      <section className={styles.venue}>
        <div className={styles.venueInner}>
          <div className={styles.churchPhoto}>
            <Image
              src="/images/events/tryon-presbyterian-church.jpg"
              alt="Tryon Presbyterian Church, a stone A-frame building set against green trees"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
            />
          </div>
          <div className={styles.venueCopy}>
            <h2>Plan Your Evening</h2>
            <p>
              Doors open at 4:00 p.m. Light refreshments will be served before
              the program. The presentation begins at 5:00 p.m. in the
              sanctuary of Tryon Presbyterian Church.
            </p>
            <a className={styles.venueAddress} href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <PinIcon />
              <span>
                {event.locationName}<br />
                {event.streetAddress}<br />
                {event.city}, {event.region} {event.postalCode}
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className={styles.funding} aria-label="Funding acknowledgment">
        <div className={styles.fundingLeft}>
          <p>With support from</p>
          <Image
            src="/images/events/polk-county-community-foundation-logo.png"
            alt="Polk County Community Foundation."
            width={1024}
            height={505}
            className={styles.pccfLogo}
          />
        </div>
        <p className={styles.fundingText}>
          This free event is made possible by the Tryon History Museum and grant
          funding from the Polk County Community Foundation.
        </p>
      </section>

      <Footer />
    </main>
  );
}
