import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FeaturedStories from "@/components/FeaturedStories";
import VisitMuseum from "@/components/VisitMuseum";
import EventsSection from "@/components/EventsSection";
import SupportSection from "@/components/SupportSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import { getUpcomingEvents } from "@/sanity/lib/events";
import { getAllMembershipTiers } from "@/sanity/lib/membershipTiers";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { OrganizationJsonLd } from "@/components/JsonLd";

export const revalidate = 60; // refresh from Sanity every 60 seconds

export default async function Home() {
  const [sanityEvents, sanityTiers, siteSettings] = await Promise.all([
    getUpcomingEvents(4),
    getAllMembershipTiers(),
    getSiteSettings(),
  ]);

  return (
    <main id="main-content">
      <OrganizationJsonLd />
      <Nav />
      <Hero siteSettings={siteSettings} />
      <FeaturedStories />
      <VisitMuseum siteSettings={siteSettings} />
      <EventsSection events={sanityEvents} />
      <SupportSection sanityTiers={sanityTiers} />
      <NewsletterSection />
      <Footer siteSettings={siteSettings} />
    </main>
  );
}
