"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../nc-revolutionary-war/page.module.css";

export default function EllettraSection() {
  const [calOpen, setCalOpen] = useState(false);
  const calWrapperRef = useRef(null);

  useEffect(() => {
    function handleMouseDown(e) {
      if (calWrapperRef.current && !calWrapperRef.current.contains(e.target)) {
        setCalOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setCalOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>Tryon History Museum</Link>
        <Link href="/tales-of-tryon" className={styles.navBack}>Tales of Tryon</Link>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src="/images/elettra-song-hill-hero.jpg"
            alt="Dogwoods in full bloom framing a view across wooded ridgelines toward Lake Lanier, from Song Hill in Landrum — the land Elettra bought in 1984 and shaped into three houses."
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        </div>
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>Tales of Tryon · September 2026</span>
          <h1 className={styles.heroTitle}>
            The Many Lives of <em>Elettra</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Artist. Restaurateur. Adventurer. The woman who brought the world back to Tryon.
          </p>
        </div>
      </section>

      {/* HERO CAPTION */}
      <div style={{
        background: "var(--navy-deep)",
        padding: "0.5rem 3.5rem 0.65rem",
        fontSize: "0.72rem",
        color: "rgba(255,255,255,0.38)",
        letterSpacing: "0.06em",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        Song Hill, Landrum. Elettra bought sixty-eight acres above Lake Lanier in 1984 and designed three houses on the land.
      </div>

      {/* METADATA STRIP */}
      <div className={styles.metaStrip}>
        <div className={styles.metaItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Thursday, September 24, 2026
        </div>
        <div className={styles.metaDivider}></div>
        <div className={styles.metaItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Doors 4:00 pm · Lecture 5:00 pm
        </div>
        <div className={styles.metaDivider}></div>
        <div className={styles.metaItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Holy Cross Episcopal Church · 150 Melrose Ave, Tryon NC
        </div>
        <div className={styles.metaDivider}></div>
        <div className={`${styles.metaItem} ${styles.metaFree}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Free Admission
        </div>
      </div>

      {/* CTA ROW */}
      <div className={styles.ctaRow}>
        <a
          href="https://www.facebook.com/tryonhistorymuseum/"
          className={styles.btnPrimary}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          Stay Updated on Facebook
        </a>

        <div className={styles.calWrapper} ref={calWrapperRef}>
          <button
            className={styles.btnCal}
            aria-expanded={calOpen}
            aria-haspopup="true"
            onClick={() => setCalOpen((o) => !o)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add to Calendar
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div
            className={styles.calDropdown}
            style={{ display: calOpen ? "block" : "none" }}
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tales+of+Tryon%3A+The+Many+Lives+of+Elettra&dates=20260924T160000/20260924T190000&details=An+evening+on+the+life+of+Elettra+%E2%80%94+artist%2C+restaurateur%2C+and+Tryon+original.+Free+admission.+Doors+at+4+pm%2C+program+at+5+pm.&location=Holy+Cross+Episcopal+Church%2C+150+Melrose+Ave%2C+Tryon+NC+28782"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M7 10h10v8H7z" fill="#fff"/><path d="M9 12h2v2H9zm4 0h2v2h-2zM9 15h2v2H9zm4 0h2v2h-2z" fill="#4285F4"/></svg>
              Google Calendar
            </a>
            <a
              href="data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20260924T160000%0ADTEND:20260924T190000%0ASUMMARY:Tales of Tryon: The Many Lives of Elettra%0ADESCRIPTION:An evening on the life of Elettra %E2%80%94 artist%2C restaurateur%2C and Tryon original. Free admission. Doors at 4 pm%2C program at 5 pm.%0ALOCATION:Holy Cross Episcopal Church%2C 150 Melrose Ave%2C Tryon NC 28782%0AEND:VEVENT%0AEND:VCALENDAR"
              download="tales-of-tryon-elettra-september-2026.ics"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#f2f2f2"/><path d="M6 3h12v18H6z" fill="#fff" stroke="#ccc" strokeWidth="1"/><rect x="8" y="6" width="3" height="3" rx="1" fill="#007AFF"/><rect x="13" y="6" width="3" height="3" rx="1" fill="#007AFF"/><rect x="8" y="11" width="3" height="3" rx="1" fill="#ccc"/><rect x="13" y="11" width="3" height="3" rx="1" fill="#ccc"/></svg>
              Apple / iCal (.ics)
            </a>
            <a
              href="https://outlook.live.com/calendar/0/deeplink/compose?subject=Tales+of+Tryon%3A+The+Many+Lives+of+Elettra&startdt=2026-09-24T16%3A00%3A00&enddt=2026-09-24T19%3A00%3A00&body=An+evening+on+the+life+of+Elettra+%E2%80%94+artist%2C+restaurateur%2C+and+Tryon+original.+Free+admission.+Doors+at+4+pm%2C+program+at+5+pm.&location=Holy+Cross+Episcopal+Church%2C+150+Melrose+Ave%2C+Tryon+NC+28782"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#0078D4"/><path d="M5 5h14v14H5z" fill="#fff"/><path d="M12 8v4l3 2" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Outlook
            </a>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className={styles.contentWrap}>
        <div className={styles.aboutSection}>
          <div className={styles.aboutBody}>
            <p className={styles.sectionLabel}>About This Evening</p>
            <h2>She called herself an architect.</h2>
            <p>She was born Carolyn Gale Kidd in Rochester, New York, in the early years of the twentieth century — the eldest of five children in a family that summered in Tryon. Everyone who knew her called her Elettra.</p>
            <p>She trained at the Cranbrook Academy of Art and spent her life making things: oil paintings, hand-woven textiles, and sweaters so intricate they carried pictorial scenes. She competed horses with the Genesee Valley Hunt. After her divorce she moved to Taormina, Sicily, became fluent in Italian, and sold her knitting to tourists. She spent time in Granada before political unrest sent her home.</p>
            <p>When she landed in Tryon, she designed her own house on Hogback Mountain. She called herself an architect. No one who saw what she built thought to argue.</p>

            <figure style={{ margin: "2.5rem 0", maxWidth: "480px" }}>
              <Image
                src="/images/elettra-portrait.jpg"
                alt="Elettra in a floral dress and statement earrings, photographed beneath a striped awning."
                width={480}
                height={600}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </figure>

            <p>She opened Elettra&apos;s restaurant on Trade Street, with its Blue Grotto Pub, and ran it with unmistakable flair. She was a magnificent cook and a generous host — the kind whose parties people talked about for years. In 1984 she bought sixty-eight acres above Lake Lanier in Landrum, created Song Hill, and designed and built three residences on the land. A fire in 2004 took everything she had built last: artwork, heirlooms, things that could not be replaced. She escaped with her life.</p>
            <p>Song Hill endures. It is run today as an event center by one of her granddaughters.</p>
            <p>Elettra was flamboyant, self-possessed, and wholly original. Tryon was where she chose to be.</p>
            <p>Doors open at 4:00 pm for refreshments. The program begins at 5:00 pm. Free and open to the public.</p>
          </div>

          <aside className={styles.eventDetailCard}>
            <div className={styles.cardLabel}>Event Details</div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
              <div className={styles.detailRowText}>
                <strong>Date</strong>
                Thursday, September 24, 2026
              </div>
            </div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div className={styles.detailRowText}>
                <strong>Time</strong>
                Doors open 4:00 pm<br />Program begins 5:00 pm
              </div>
            </div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div className={styles.detailRowText}>
                <strong>Location</strong>
                Holy Cross Episcopal Church<br />150 Melrose Ave, Tryon NC
              </div>
            </div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <div className={styles.detailRowText}>
                <strong>Admission</strong>
                Free and open to the public
              </div>
            </div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <div className={styles.detailRowText}>
                <strong>Series</strong>
                Tales of Tryon
              </div>
            </div>
          </aside>
        </div>
      </div>

      <hr className={styles.sectionRule} />

      {/* ABOUT THIS PROGRAM */}
      <div className={styles.contentWrap}>
        <div style={{ padding: "4rem 0" }}>
          <p className={styles.sectionLabel}>About This Program</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "var(--navy)",
            marginBottom: "1.5rem",
          }}>
            Told by family.
          </h2>
          <div style={{ maxWidth: "60ch" }}>
            <p style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              lineHeight: 1.8,
              color: "var(--text-mid)",
              marginBottom: "1.25rem",
            }}>
              Elettra&apos;s story comes to us through the people who knew her best. A member of her family will share recollections of her life, her houses, her table, and the years she spent making Tryon her own.
            </p>
            <p style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.8,
              color: "var(--text-mid)",
              marginBottom: 0,
            }}>
              Speaker to be announced.
            </p>
          </div>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div className={styles.pullQuoteBand}>
        <blockquote>
          Tryon was where she chose to be.
        </blockquote>
        <p className={styles.pullQuoteSource}>Tryon History Museum</p>
      </div>

      {/* FOOTER BAND — no sponsor block for this event */}
      <div className={styles.footerBand}>
        <div className={styles.footerDivider}></div>
        <nav className={styles.footerLinks} aria-label="Footer navigation">
          <Link href="/tales-of-tryon">Tales of Tryon Archive</Link>
          <Link href="/events">All Events</Link>
          <Link href="/membership">Become a Member</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
        <p className={styles.footerCopy}>© 2026 Tryon History Museum · A 501(c)(3) nonprofit organization · 26 Maple Street, Tryon NC 28782</p>
      </div>
    </div>
  );
}
