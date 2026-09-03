import BoardApplicationSection from "@/components/BoardApplicationSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Board of Directors — Tryon History Museum",
  description:
    "Share your interest in serving on the Tryon History Museum Board of Directors and helping preserve and tell Tryon's history.",
};

export default function BoardApplicationPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Board of Directors", url: "https://tryonhistorymuseum.org/board-application" },
        ]}
      />
      <Nav />
      <BoardApplicationSection />
      <Footer />
    </main>
  );
}
