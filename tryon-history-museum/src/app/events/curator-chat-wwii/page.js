import CuratorChatSection from "@/components/CuratorChatSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Curator Chat: WWII Veterans Tribute Exhibit | Tryon History Museum",
  description:
    "An intimate members-only conversation about the upcoming WWII Veterans tribute exhibit at the Tryon History Museum.",
};

export default function CuratorChatPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          {
            name: "Curator Chat: WWII Veterans Tribute Exhibit",
            href: "/events/curator-chat-wwii",
          },
        ]}
      />
      <Nav />
      <CuratorChatSection />
      <Footer />
    </main>
  );
}
