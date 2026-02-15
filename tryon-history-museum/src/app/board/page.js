import Nav from "@/components/Nav";
import BoardSection from "@/components/BoardSection";
import Footer from "@/components/Footer";
import { getAllBoardMembers } from "@/sanity/lib/boardMembers";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const revalidate = 60;

export const metadata = {
  title: "Board of Directors | Tryon History Museum",
  description:
    "Meet the dedicated board members of the Tryon History Museum & Visitor Center in Tryon, North Carolina.",
};

export default async function BoardPage() {
  const sanityMembers = await getAllBoardMembers();

  return (
    <main id="main-content">
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://tryonhistorymuseum.org" },
        { name: "Board of Directors", url: "https://tryonhistorymuseum.org/board" },
      ]} />
      <Nav />
      <BoardSection sanityMembers={sanityMembers} />
      <Footer />
    </main>
  );
}
