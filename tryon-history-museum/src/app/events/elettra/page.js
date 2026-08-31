import EllettraSection from "./EllettraSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "Elettra — Tales of Tryon | Tryon History Museum",
  description:
    "An evening on the life of Elettra — artist, restaurateur, and the woman who brought the world back to Tryon. Free admission. Thursday, September 24, 2026 at Holy Cross Episcopal Church, Tryon NC.",
};

export default function EllettraPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          { name: "Elettra", href: "/events/elettra" },
        ]}
      />
      <EllettraSection />
    </main>
  );
}
