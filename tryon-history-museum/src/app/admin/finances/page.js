import { redirect } from "next/navigation";
import AdminFinancesSection from "@/components/AdminFinancesSection";
import { verifyAdmin } from "@/lib/supabase/adminAuth";

export const metadata = {
  title: "Finances | Admin | Tryon History Museum",
};

export default async function AdminFinancesPage() {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) redirect("/admin/dashboard");
  return <AdminFinancesSection />;
}
