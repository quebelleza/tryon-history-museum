import ContactSection from "@/components/ContactSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact Us | Tryon History Museum",
  description:
    "Get in touch with the Tryon History Museum & Visitor Center. Send us a message, ask a question, or plan your visit.",
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Contact Us", url: "https://tryonhistorymuseum.org/contact" },
        ]}
      />
      <Nav />
      <ContactSection />
      <Footer />
    </main>
  );
}
