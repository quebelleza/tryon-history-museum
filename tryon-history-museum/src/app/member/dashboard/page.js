import MemberDashboardSection from "@/components/MemberDashboardSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Member Dashboard | Tryon History Museum",
  description: "Your Tryon History Museum membership dashboard.",
};

export default function MemberDashboardPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Member Dashboard", href: "/member/dashboard" },
        ]}
      />
      <Nav />
      <MemberDashboardSection />
      <Footer />
    </main>
  );
}
