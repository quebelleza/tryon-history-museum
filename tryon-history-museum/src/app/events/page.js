import Nav from "@/components/Nav";
import EventsPageSection from "@/components/EventsPageSection";
import Footer from "@/components/Footer";
import { getAllEvents } from "@/sanity/lib/events";

export const revalidate = 60;

export const metadata = {
  title: "Events | Tryon History Museum",
  description:
    "Upcoming events, lectures, walking tours, and exhibits at the Tryon History Museum & Visitor Center.",
};

export default async function EventsPage() {
  const allEvents = await getAllEvents();

  return (
    <main>
      <Nav />
      <EventsPageSection events={allEvents} />
      <Footer />
    </main>
  );
}
