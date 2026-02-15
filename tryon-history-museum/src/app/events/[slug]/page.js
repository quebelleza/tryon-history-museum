import { notFound } from "next/navigation";
import { getEventBySlug, getAllEvents } from "@/sanity/lib/events";
import EventDetailSection from "@/components/EventDetailSection";
import { BreadcrumbJsonLd, EventJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const revalidate = 60;

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events
    .filter((e) => e.slug?.current)
    .map((e) => ({ slug: e.slug.current }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} | Tryon History Museum`,
    description: event.description || `${event.title} — ${event.eventType || "Event"} at the Tryon History Museum.`,
  };
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main id="main-content">
      <EventJsonLd events={[event]} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Events", url: "https://tryonhistorymuseum.org/events" },
          { name: event.title, url: `https://tryonhistorymuseum.org/events/${slug}` },
        ]}
      />
      <Nav />
      <EventDetailSection event={event} />
      <Footer />
    </main>
  );
}
