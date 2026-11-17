"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    label: "Explore",
    children: [
      { name: "Plan Your Visit", href: "/visit" },
      { name: "Exhibits", href: "/exhibits" },
      { name: "History Bits", href: "/history-bits" },
      { name: "Tales of Tryon", href: "/tales-of-tryon" },
      { name: "Gift Shop", href: "/gift-shop" },
    ],
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "About",
    children: [
      { name: "Our Story", href: "/about/our-story" },
      { name: "Board of Directors", href: "/board" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  {
    label: "Support",
    children: [
      { name: "Become a Member", href: "/membership" },
      { name: "Volunteer", href: "/volunteer" },
      { name: "Board Application", href: "/board-application" },
      { name: "Donate", href: "/donate" },
    ],
  },
];

const linkClasses =
  "bg-transparent border-none cursor-pointer font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] py-2 no-underline transition-colors text-brand-ink/70 hover:text-brand-heritage";

const dropdownLinkClasses =
  "block font-brand-secondary text-sm no-underline py-2 transition-colors text-brand-ink/65 hover:text-brand-heritage";

export default function Nav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const isAdmin = user?.app_metadata?.role === 'admin';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccountOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-brand-cream border-b border-brand-ink/10 transition-shadow duration-300"
      style={{
        boxShadow: scrolled ? "0 4px 16px rgba(34,34,34,0.08)" : "none",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 flex items-center justify-between">
        {/* Logo — the PNG contains ~130px transparent padding top/bottom;
            the 958:308 frame trims only that padding (object-cover), the
            artwork itself is unmodified and proportional. */}
        <a
          href="/"
          className="relative flex-none block w-[190px] lg:w-[260px] my-2 no-underline"
          aria-label="Tryon History Museum & Visitors Center — home"
        >
          <span className="relative block aspect-[958/308]">
            <Image
              src="/images/brand/thm-logo-horizontal.png"
              alt="Tryon History Museum & Visitors Center"
              fill
              priority
              sizes="(max-width: 1023px) 190px, 260px"
              className="object-cover object-center"
            />
          </span>
        </a>

        {/* Desktop nav — lg breakpoint keeps tablet widths uncrowded */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-9">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setActiveDropdown(item.label)}
              onMouseLeave={() => item.children && setActiveDropdown(null)}
            >
              {item.href ? (
                <a href={item.href} className={linkClasses}>
                  {item.label}
                </a>
              ) : (
                <button
                  aria-expanded={activeDropdown === item.label}
                  aria-haspopup="true"
                  className={linkClasses}
                >
                  {item.label}
                </button>
              )}
              {/* Dropdown */}
              {item.children && (
                <div
                  className="absolute top-full -left-4 min-w-[200px] bg-brand-cream border border-brand-ink/10 transition-all duration-200"
                  style={{
                    padding:
                      activeDropdown === item.label ? "14px 22px" : "0 22px",
                    opacity: activeDropdown === item.label ? 1 : 0,
                    maxHeight: activeDropdown === item.label ? 300 : 0,
                    overflow: "hidden",
                    pointerEvents:
                      activeDropdown === item.label ? "auto" : "none",
                    boxShadow:
                      activeDropdown === item.label
                        ? "0 12px 24px rgba(34,34,34,0.10)"
                        : "none",
                  }}
                >
                  {item.children.map((child) => (
                    <a
                      key={child.name}
                      href={child.href}
                      className={dropdownLinkClasses}
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Auth controls */}
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                aria-expanded={accountOpen}
                aria-haspopup="true"
                className={linkClasses}
              >
                My Account
              </button>
              <div
                className="absolute top-full right-0 min-w-[180px] bg-brand-cream border border-brand-ink/10 transition-all duration-200"
                style={{
                  padding: accountOpen ? "14px 22px" : "0 22px",
                  opacity: accountOpen ? 1 : 0,
                  maxHeight: accountOpen ? 200 : 0,
                  overflow: "hidden",
                  pointerEvents: accountOpen ? "auto" : "none",
                  boxShadow: accountOpen
                    ? "0 12px 24px rgba(34,34,34,0.10)"
                    : "none",
                }}
              >
                <Link href="/member/dashboard" className={dropdownLinkClasses}>
                  Account Management
                </Link>
                {isAdmin && (
                  <Link href="/admin/dashboard" className={dropdownLinkClasses}>
                    Museum Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left bg-transparent border-none cursor-pointer font-brand-secondary text-sm py-2 px-0 transition-colors text-brand-ink/65 hover:text-brand-heritage"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className={linkClasses}>
              Log In
            </Link>
          )}
          <a
            href="/donate"
            className="font-brand-secondary text-xs font-semibold uppercase tracking-[0.14em] no-underline bg-brand-heritage text-brand-cream px-6 py-2.5 transition-colors hover:bg-brand-ink"
          >
            Donate
          </a>
        </div>

        {/* Mobile hamburger — ink, turns heritage red on hover/open */}
        <button
          className={`lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] bg-transparent border-none cursor-pointer transition-colors ${
            mobileOpen ? "text-brand-heritage" : "text-brand-ink hover:text-brand-heritage"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <div className="space-y-1.5">
            <div
              className="w-6 h-px bg-current transition-all"
              style={{
                transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
              }}
            />
            <div
              className="w-6 h-px bg-current transition-all"
              style={{ opacity: mobileOpen ? 0 : 1 }}
            />
            <div
              className="w-6 h-px bg-current transition-all"
              style={{
                transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="menu"
          className="lg:hidden bg-brand-cream border-t border-brand-ink/10 px-5 pb-8 pt-4"
        >
          {navItems.map((item) => (
            <div key={item.label} className="mb-6">
              <div className="font-brand-secondary text-xs font-semibold uppercase tracking-[0.2em] text-brand-heritage mb-3">
                {item.label}
              </div>
              {item.href ? (
                <a
                  href={item.href}
                  className="block font-brand-body text-sm no-underline py-1.5 text-brand-ink/70"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                item.children.map((child) => (
                  <a
                    key={child.name}
                    href={child.href}
                    className="block font-brand-body text-sm no-underline py-1.5 text-brand-ink/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.name}
                  </a>
                ))
              )}
            </div>
          ))}
          {/* Mobile auth controls */}
          <div className="mb-6 mt-2">
            <div className="font-brand-secondary text-xs font-semibold uppercase tracking-[0.2em] text-brand-heritage mb-3">
              Account
            </div>
            {user ? (
              <>
                <Link
                  href="/member/dashboard"
                  className="block font-brand-body text-sm no-underline py-1.5 text-brand-ink/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Account Management
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="block font-brand-body text-sm no-underline py-1.5 text-brand-ink/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    Museum Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block bg-transparent border-none cursor-pointer font-brand-body text-sm py-1.5 px-0 text-brand-ink/70"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block font-brand-body text-sm no-underline py-1.5 text-brand-ink/70"
                onClick={() => setMobileOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
          <a
            href="/donate"
            className="inline-block font-brand-secondary text-xs font-semibold uppercase tracking-[0.14em] no-underline bg-brand-heritage text-brand-cream px-6 py-2.5 mt-2"
          >
            Donate
          </a>
        </div>
      )}
    </nav>
  );
}
