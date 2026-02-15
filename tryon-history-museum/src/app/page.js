import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import VisitSection from "@/components/VisitSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import SupportSection from "@/components/SupportSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import { getUpcomingEvents } from "@/sanity/lib/events";

export const revalidate = 60; // refresh events from Sanity every 60 seconds

export default async function Home() {
  const sanityEvents = await getUpcomingEvents(4);

  return (
    <main>
      <Nav />
      <Hero />
      <VisitSection />
      <AboutSection />
      <EventsSection events={sanityEvents} />
      <SupportSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
