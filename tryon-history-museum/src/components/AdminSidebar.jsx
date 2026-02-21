"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const DEEP_RED = "#7B2D26";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "All Members", href: "/admin/members", icon: "👥" },
  { label: "Add Member", href: "/admin/members/new", icon: "➕" },
  { label: "Patron Management", href: "/admin/patrons", icon: "✦" },
  { label: "Volunteers", href: "/admin/volunteers", icon: "🤝" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[240px] flex flex-col z-40"
      style={{ background: WARM_BLACK, borderRight: "1px solid rgba(196,163,90,0.12)" }}
    >
      {/* Back to Museum Website — always first */}
      <Link
        href="/"
        className="flex items-center gap-2.5 no-underline px-5 py-3.5 transition-all duration-200 hover:opacity-80"
        style={{ background: "rgba(250,247,244,0.06)", borderBottom: "1px solid rgba(196,163,90,0.1)" }}
      >
        <span className="font-body text-[13px]" style={{ color: "rgba(250,247,244,0.7)" }}>←</span>
        <span className="font-body text-[12px] font-semibold" style={{ color: "rgba(250,247,244,0.7)", letterSpacing: "0.03em" }}>
          Back to Museum Website
        </span>
      </Link>

      {/* Logo area */}
      <div className="px-6 pt-5 pb-5" style={{ borderBottom: "1px solid rgba(196,163,90,0.1)" }}>
        <div
          className="font-display text-[15px] font-semibold uppercase tracking-wider"
          style={{ color: GOLD_ACCENT }}
        >
          Museum Admin
        </div>
        <div
          className="font-body text-[11px] mt-1"
          style={{ color: "rgba(250,247,244,0.35)" }}
        >
          Tryon History Museum
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin/members"
              ? pathname === "/admin/members"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 no-underline px-3 py-2.5 rounded transition-all duration-200"
              style={{
                background: isActive ? "rgba(196,163,90,0.1)" : "transparent",
                color: isActive ? GOLD_ACCENT : "rgba(250,247,244,0.55)",
              }}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-body text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-5 space-y-1" style={{ borderTop: "1px solid rgba(196,163,90,0.1)", paddingTop: "12px" }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer px-3 py-2.5 rounded transition-all duration-200"
          style={{ color: "rgba(250,247,244,0.4)" }}
        >
          <span className="text-sm">🚪</span>
          <span className="font-body text-[13px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
