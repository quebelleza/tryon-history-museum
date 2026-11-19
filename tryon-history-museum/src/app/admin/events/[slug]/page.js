import AdminEventDetailSection from "@/components/AdminEventDetailSection";

export const metadata = {
  title: "Event Registrations | Admin | Tryon History Museum",
};

export default async function AdminEventDetailPage({ params }) {
  const { slug } = await params;
  return <AdminEventDetailSection slug={slug} />;
}
