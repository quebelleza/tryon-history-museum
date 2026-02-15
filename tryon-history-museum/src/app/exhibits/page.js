import Nav from "@/components/Nav";
import ExhibitsPageSection from "@/components/ExhibitsPageSection";
import Footer from "@/components/Footer";
import { getAllExhibits } from "@/sanity/lib/exhibits";

export const revalidate = 60;

export const metadata = {
  title: "Exhibits | Tryon History Museum",
  description:
    "Explore the permanent and rotating exhibits at the Tryon History Museum & Visitor Center in Tryon, North Carolina.",
};

export default async function ExhibitsPage() {
  const allExhibits = await getAllExhibits();

  return (
    <main>
      <Nav />
      <ExhibitsPageSection exhibits={allExhibits} />
      <Footer />
    </main>
  );
}
