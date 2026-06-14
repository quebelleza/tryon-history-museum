import Nav from "@/components/Nav";
import VisitSection from "@/components/VisitSection";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const revalidate = 60;

export const metadata = {
  title: "Plan Your Visit | Tryon History Museum",
  description:
    "Hours, admission, directions, and visitor information for the Tryon History Museum & Visitor Center in Tryon, NC.",
};

export default async function VisitPage() {
  const siteSettings = await getSiteSettings();

  return (
    <main id="main-content" style={{ background: "#1A1311" }}>
      <Nav />
      <div className="pt-24 md:pt-28">
        <VisitSection siteSettings={siteSettings} />
      </div>
      <Footer siteSettings={siteSettings} />
    </main>
  );
}
