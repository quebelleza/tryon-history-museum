"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function NCRevWarSection() {
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    function handleClick() { setCalOpen(false); }
    function handleKeyDown(e) {
      if (e.key === "Escape") setCalOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
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
            src="/images/nc-revolutionary-war-hero.jpg"
            alt="A colonial militiaman stands before the Blue Ridge Mountains, with a 13-star flag, quill, and period map — the landscape of western North Carolina during the Revolutionary War."
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "right center" }}
          />
        </div>
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>Tales of Tryon · July 2026</span>
          <h1 className={styles.heroTitle}>
            North Carolina<br />&amp; the<br /><em>Revolutionary War</em>
          </h1>
          <p className={styles.heroSubtitle}>
            An evening exploring North Carolina&apos;s role in the fight for American independence.
          </p>
        </div>
      </section>

      {/* METADATA STRIP */}
      <div className={styles.metaStrip}>
        <div className={styles.metaItem}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Thursday, July 23, 2026
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

        <div className={styles.calWrapper}>
          <button
            className={styles.btnCal}
            aria-expanded={calOpen}
            aria-haspopup="true"
            onClick={(e) => { e.stopPropagation(); setCalOpen((o) => !o); }}
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
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tales+of+Tryon%3A+NC+%26+the+Revolutionary+War&dates=20260723T160000/20260723T190000&details=Join+filmmaker+John+Oliver+for+an+evening+exploring+North+Carolina%27s+role+in+the+Revolutionary+War.+Free+admission.+Doors+at+4+pm%2C+lecture+at+5+pm.&location=Holy+Cross+Episcopal+Church%2C+150+Melrose+Ave%2C+Tryon+NC+28782"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M7 10h10v8H7z" fill="#fff"/><path d="M9 12h2v2H9zm4 0h2v2h-2zM9 15h2v2H9zm4 0h2v2h-2z" fill="#4285F4"/></svg>
              Google Calendar
            </a>
            <a
              href="data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20260723T160000%0ADTEND:20260723T190000%0ASUMMARY:Tales of Tryon: NC %26 the Revolutionary War%0ADESCRIPTION:Join filmmaker John Oliver for an evening exploring North Carolina's role in the Revolutionary War. Free admission. Doors at 4 pm%2C lecture at 5 pm.%0ALOCATION:Holy Cross Episcopal Church%2C 150 Melrose Ave%2C Tryon NC 28782%0AEND:VEVENT%0AEND:VCALENDAR"
              download="tales-of-tryon-july-2026.ics"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#f2f2f2"/><path d="M6 3h12v18H6z" fill="#fff" stroke="#ccc" strokeWidth="1"/><rect x="8" y="6" width="3" height="3" rx="1" fill="#007AFF"/><rect x="13" y="6" width="3" height="3" rx="1" fill="#007AFF"/><rect x="8" y="11" width="3" height="3" rx="1" fill="#ccc"/><rect x="13" y="11" width="3" height="3" rx="1" fill="#ccc"/></svg>
              Apple / iCal (.ics)
            </a>
            <a
              href="https://outlook.live.com/calendar/0/deeplink/compose?subject=Tales+of+Tryon%3A+NC+%26+the+Revolutionary+War&startdt=2026-07-23T16%3A00%3A00&enddt=2026-07-23T19%3A00%3A00&body=Join+filmmaker+John+Oliver+for+an+evening+exploring+North+Carolina%27s+role+in+the+Revolutionary+War.+Free+admission.+Doors+at+4+pm%2C+lecture+at+5+pm.&location=Holy+Cross+Episcopal+Church%2C+150+Melrose+Ave%2C+Tryon+NC+28782"
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
            <h2>When North Carolina answered the call.</h2>
            <p>Long before the famous battles of the Northern campaigns, the mountains and piedmont of western North Carolina were already a theater of war. The foothills we know as Polk County and the landscape stretching toward Kings Mountain witnessed some of the most consequential moments of the Southern campaign — moments that helped turn the tide of the Revolution.</p>
            <p>This July, the Tryon History Museum invites you to an evening with filmmaker John Oliver, a Polk County native who has spent years bringing this story to the screen. His forthcoming feature film <em>Revolutionary!</em> traces the events leading to the British defeat at the Battle of Kings Mountain and shines a long-overdue light on the local Battle of Earles Ford — a chapter of the war that happened in our own backyard.</p>
            <p>Doors open at 4:00 pm for refreshments. The program begins at 5:00 pm. Free and open to the public.</p>
          </div>

          <aside className={styles.eventDetailCard}>
            <div className={styles.cardLabel}>Event Details</div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
              <div className={styles.detailRowText}>
                <strong>Date</strong>
                Thursday, July 23, 2026
              </div>
            </div>
            <div className={styles.detailRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div className={styles.detailRowText}>
                <strong>Time</strong>
                Doors open 4:00 pm<br />Lecture begins 5:00 pm
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
                Tales of Tryon, sponsored by<br />Polk County Community Foundation
              </div>
            </div>
          </aside>
        </div>
      </div>

      <hr className={styles.sectionRule} />

      {/* SPEAKER SECTION */}
      <div className={styles.contentWrap}>
        <div className={styles.speakerSection}>
          <div>
            <div className={styles.speakerPortraitPlaceholder}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Photo<br />coming soon</span>
            </div>
          </div>
          <div className={styles.speakerInfo}>
            <p className={styles.sectionLabel}>About the Speaker</p>
            <h2 className={styles.speakerName}>John Oliver</h2>
            <p className={styles.speakerTitle}>Filmmaker · Polk County Native</p>
            <div className={styles.speakerBio}>
              <p>John Oliver is a Polk County native and longtime motion picture industry professional based in Columbus, NC. He is currently producing <em>Revolutionary!</em>, a forthcoming feature film set in the mountains and piedmont of western North Carolina and South Carolina.</p>
              <p>The film traces the events leading to the pivotal British defeat at the Battle of Kings Mountain and brings renewed attention to the local Battle of Earles Ford — placing Polk County at the center of a story that helped determine the outcome of the American Revolution. Oliver is collaborating with director Nick Searcy on the production.</p>
              <p>His presentation at the Tryon History Museum offers an early look at the film and the history driving it — a rare opportunity to hear a filmmaker talk about a story that began, quite literally, in these hills.</p>
              <a
                href="https://tryondailybulletin.com/2026/04/14/polk-county-history-museum-to-host-program-on-upcoming-film-revolutionary/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.filmLink}
              >
                Read more about <em>Revolutionary!</em> →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div className={styles.pullQuoteBand}>
        <blockquote>
          The past isn&apos;t behind us. It&apos;s with us.
        </blockquote>
        <p className={styles.pullQuoteSource}>Tryon History Museum</p>
      </div>

      {/* FOOTER BAND */}
      <div className={styles.footerBand}>
        <p className={styles.sponsorLabel}>Tales of Tryon is sponsored by</p>
        <p className={styles.sponsorName}>Polk County Community Foundation</p>
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
