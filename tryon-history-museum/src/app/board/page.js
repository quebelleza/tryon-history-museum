import Nav from "@/components/Nav";
import BoardSection from "@/components/BoardSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Board of Directors | Tryon History Museum",
  description:
    "Meet the dedicated board members of the Tryon History Museum & Visitor Center in Tryon, North Carolina.",
};

export default function BoardPage() {
  return (
    <main>
      <Nav />
      <BoardSection />
      <Footer />
    </main>
  );
}
