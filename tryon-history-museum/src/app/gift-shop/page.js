import GiftShopSection from "@/components/GiftShopSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Gift Shop | Tryon History Museum",
  description:
    "Browse unique gifts, local books, and Tryon memorabilia at the Tryon History Museum Gift Shop.",
};

export default function GiftShopPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Gift Shop", url: "https://tryonhistorymuseum.org/gift-shop" },
        ]}
      />
      <Nav />
      <GiftShopSection />
      <Footer />
    </main>
  );
}
