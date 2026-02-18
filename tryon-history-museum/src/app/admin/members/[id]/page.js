import AdminMemberDetailSection from "@/components/AdminMemberDetailSection";

export const metadata = {
  title: "Member Detail | Admin | Tryon History Museum",
};

export default async function AdminMemberDetailPage({ params }) {
  const { id } = await params;
  return <AdminMemberDetailSection memberId={id} />;
}
