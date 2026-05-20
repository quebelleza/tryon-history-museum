import Nav from "@/components/Nav";
import TalesOfTryonSection from "@/components/TalesOfTryonSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Tales of Tryon — Lecture Archive | Tryon History Museum",
  description:
    "A growing archive of recorded lectures with historians, residents, and scholars on the people, places, and stories of Tryon, North Carolina.",
};

export default async function TalesOfTryonPage() {
  return (
    <main id="main-content">
      <Nav />
      <TalesOfTryonSection />
      <Footer />
    </main>
  );
}
