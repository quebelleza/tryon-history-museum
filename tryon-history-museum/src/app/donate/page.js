import DonateSection from "@/components/DonateSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Donate | Tryon History Museum",
  description:
    "Support the Tryon History Museum & Visitor Center with a tax-deductible donation. Your generosity helps preserve Tryon's heritage.",
};

export default function DonatePage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Donate", url: "https://tryonhistorymuseum.org/donate" },
        ]}
      />
      <Nav />
      <DonateSection />
      <Footer />
    </main>
  );
}
