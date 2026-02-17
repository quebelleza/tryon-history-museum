import SponsorshipSection from "@/components/SponsorshipSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Sponsorship — Modernist Home Tour | Tryon History Museum",
  description:
    "Become a sponsor of the Tryon History Museum's inaugural Modernist Home Tour. Align your business with Tryon's architectural legacy on May 16, 2026.",
};

export default function SponsorshipPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          { name: "Modernist Home Tour", href: "/events/modernist-home-tour" },
          {
            name: "Sponsorship",
            href: "/events/modernist-home-tour/sponsorship",
          },
        ]}
      />
      <Nav />
      <SponsorshipSection />
      <Footer />
    </main>
  );
}
