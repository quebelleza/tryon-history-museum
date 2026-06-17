import NCRevWarSection from "./NCRevWarSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "NC & the Revolutionary War — Tales of Tryon | Tryon History Museum",
  description:
    "Join filmmaker John Oliver for an evening exploring North Carolina's pivotal role in the Revolutionary War. Free admission. Thursday, July 23, 2026 at Holy Cross Episcopal Church, Tryon NC.",
};

export default function NCRevWarPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          {
            name: "NC & the Revolutionary War",
            href: "/events/nc-revolutionary-war",
          },
        ]}
      />
      <NCRevWarSection />
    </main>
  );
}
