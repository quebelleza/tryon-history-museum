import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin | Tryon History Museum",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F5F0EB" }}>
      <AdminSidebar />
      <div className="flex-1 ml-[240px]">
        {/* Top header bar */}
        <div
          className="flex items-center justify-between px-8 py-3"
          style={{ background: "#FFFDF9", borderBottom: "1px solid rgba(123,45,38,0.06)" }}
        >
          <Link
            href="/"
            className="font-body text-[12px] font-semibold no-underline transition-all hover:opacity-70"
            style={{ color: "#1B2A4A", letterSpacing: "0.03em" }}
          >
            ← Back to Museum Website
          </Link>
          <div
            className="font-body text-[10px] uppercase"
            style={{ letterSpacing: "0.15em", color: "rgba(26,19,17,0.3)" }}
          >
            Tryon History Museum · Admin
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
