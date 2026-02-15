import Nav from "@/components/Nav";
import EventsPageSection from "@/components/EventsPageSection";
import Footer from "@/components/Footer";
import { getAllEvents } from "@/sanity/lib/events";
import { EventJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

export const revalidate = 60;

export const metadata = {
  title: "Events | Tryon History Museum",
  description:
    "Upcoming events, lectures, walking tours, and exhibits at the Tryon History Museum & Visitor Center.",
};

export default async function EventsPage() {
  const allEvents = await getAllEvents();

  return (
    <main id="main-content">
      <EventJsonLd events={allEvents} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://tryonhistorymuseum.org" },
        { name: "Events", url: "https://tryonhistorymuseum.org/events" },
      ]} />
      <Nav />
      <EventsPageSection events={allEvents} />
      <Footer />
    </main>
  );
}
