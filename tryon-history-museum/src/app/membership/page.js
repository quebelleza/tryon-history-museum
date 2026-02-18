import MembershipSection from "@/components/MembershipSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Become a Member | Tryon History Museum",
  description:
    "Support Tryon's story and enjoy exclusive benefits year-round. Individual and Family memberships available.",
};

export default function MembershipPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Membership", href: "/membership" },
        ]}
      />
      <Nav />
      <MembershipSection />
      <Footer />
    </main>
  );
}
