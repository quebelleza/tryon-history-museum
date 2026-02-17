import ModernistHomeTourSection from "@/components/ModernistHomeTourSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Modernist Home Tour — May 16, 2026 | Tryon History Museum",
  description:
    "A rare self-guided tour of privately owned homes designed by celebrated Western North Carolina modernist architects. May 16, 2026 in Tryon, NC.",
};

export default function ModernistHomeTourPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Events", url: "https://tryonhistorymuseum.org/events" },
          {
            name: "Modernist Home Tour",
            url: "https://tryonhistorymuseum.org/events/modernist-home-tour",
          },
        ]}
      />
      <Nav />
      <ModernistHomeTourSection />
      <Footer />
    </main>
  );
}
