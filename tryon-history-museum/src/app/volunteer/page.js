import VolunteerSection from "@/components/VolunteerSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Volunteer | Tryon History Museum",
  description:
    "Volunteer at the Tryon History Museum & Visitor Center. Share your passion for history, help with events, or support behind the scenes.",
};

export default function VolunteerPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Volunteer", url: "https://tryonhistorymuseum.org/volunteer" },
        ]}
      />
      <Nav />
      <VolunteerSection />
      <Footer />
    </main>
  );
}
