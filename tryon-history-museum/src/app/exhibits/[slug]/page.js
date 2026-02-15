import { notFound } from "next/navigation";
import { getExhibitBySlug, getAllExhibits } from "@/sanity/lib/exhibits";
import ExhibitDetailSection from "@/components/ExhibitDetailSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const revalidate = 60;

export async function generateStaticParams() {
  const exhibits = await getAllExhibits();
  return exhibits
    .filter((e) => e.slug?.current)
    .map((e) => ({ slug: e.slug.current }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const exhibit = await getExhibitBySlug(slug);
  if (!exhibit) return {};
  return {
    title: `${exhibit.title} | Tryon History Museum`,
    description: exhibit.description || `Learn about the ${exhibit.title} exhibit at the Tryon History Museum.`,
  };
}

export default async function ExhibitDetailPage({ params }) {
  const { slug } = await params;
  const exhibit = await getExhibitBySlug(slug);
  if (!exhibit) notFound();

  return (
    <main id="main-content">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://tryonhistorymuseum.org" },
          { name: "Exhibits", url: "https://tryonhistorymuseum.org/exhibits" },
          { name: exhibit.title, url: `https://tryonhistorymuseum.org/exhibits/${slug}` },
        ]}
      />
      <Nav />
      <ExhibitDetailSection exhibit={exhibit} />
      <Footer />
    </main>
  );
}
