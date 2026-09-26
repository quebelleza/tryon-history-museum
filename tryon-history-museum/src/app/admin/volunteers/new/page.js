import { redirect } from "next/navigation";
import AdminVolunteerFormSection from "@/components/AdminVolunteerFormSection";
import { verifyAdmin } from "@/lib/supabase/adminAuth";

export const metadata = { title: "Add Volunteer | Admin | Tryon History Museum" };

export default async function AddVolunteerPage() {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) redirect("/admin/volunteers");
  return <AdminVolunteerFormSection />;
}
