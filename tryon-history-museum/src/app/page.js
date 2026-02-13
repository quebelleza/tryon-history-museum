import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import VisitSection from "@/components/VisitSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import SupportSection from "@/components/SupportSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <VisitSection />
      <AboutSection />
      <EventsSection />
      <SupportSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
