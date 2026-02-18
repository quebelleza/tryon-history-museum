import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin | Tryon History Museum",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F5F0EB" }}>
      <AdminSidebar />
      <div className="flex-1 ml-[240px]">{children}</div>
    </div>
  );
}
