import LoginSection from "@/components/LoginSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Member Login | Tryon History Museum",
  description:
    "Sign in to access your Tryon History Museum member benefits, exclusive event details, and more.",
};

export default function LoginPage() {
  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Member Login", href: "/login" },
        ]}
      />
      <Nav />
      <LoginSection />
      <Footer />
    </main>
  );
}
