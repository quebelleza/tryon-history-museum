import { redirect } from "next/navigation";
import AdminVolunteerFormSection from "@/components/AdminVolunteerFormSection";
import { verifyAdmin } from "@/lib/supabase/adminAuth";

export const metadata = { title: "Edit Volunteer | Admin | Tryon History Museum" };

export default async function EditVolunteerPage({ params }) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) redirect("/admin/volunteers");
  const { id } = await params;
  return <AdminVolunteerFormSection volunteerId={id} />;
}
