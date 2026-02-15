"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const GOLD_ACCENT = "#C4A35A";
const WARM_BLACK = "#1A1311";
const DEEP_RED = "#7B2D26";
const MUTED_RED = "#A8584F";

const navItems = [
  {
    label: "Visit",
    children: [
      { name: "Hours & Admission", href: "#visit" },
      { name: "Plan Your Visit", href: "#visit" },
      { name: "Gift Shop", href: "#" },
    ],
  },
  {
    label: "Events",
    children: [
      { name: "Upcoming Events", href: "/events" },
      { name: "Tales of Tryon", href: "/events" },
      { name: "History Bits", href: "#" },
    ],
  },
  {
    label: "About",
    children: [
      { name: "Our Story", href: "#about" },
      { name: "Board of Directors", href: "/board" },
      { name: "Contact Us", href: "#" },
    ],
  },
  {
    label: "Support",
    children: [
      { name: "Become a Member", href: "#support" },
      { name: "Volunteer", href: "#" },
      { name: "Donate", href: "#" },
    ],
  },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: scrolled ? "rgba(26,19,17,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(123,45,38,0.2)"
          : "1px solid transparent",
        padding: scrolled ? "12px 0" : "20px 0",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3.5 no-underline">
          <Image
            src="/logo-white.png"
            alt="Tryon History Museum & Visitors Center"
            width={220}
            height={124}
            className="transition-opacity"
            style={{ opacity: scrolled ? 0.9 : 1 }}
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-9">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className="bg-transparent border-none cursor-pointer font-body text-[13px] font-normal uppercase py-2 transition-colors hover:!text-tryon-gold"
                style={{
                  letterSpacing: "0.12em",
                  color: scrolled
                    ? "rgba(250,247,244,0.8)"
                    : "rgba(255,255,255,0.85)",
                }}
              >
                {item.label}
              </button>
              {/* Dropdown */}
              <div
                className="absolute top-full -left-4 min-w-[200px] transition-all duration-300"
                style={{
                  background: WARM_BLACK,
                  border: "1px solid rgba(123,45,38,0.25)",
                  padding:
                    activeDropdown === item.label ? "16px 24px" : "0 24px",
                  opacity: activeDropdown === item.label ? 1 : 0,
                  maxHeight: activeDropdown === item.label ? 300 : 0,
                  overflow: "hidden",
                  pointerEvents:
                    activeDropdown === item.label ? "auto" : "none",
                }}
              >
                {item.children.map((child) => (
                  <a
                    key={child.name}
                    href={child.href}
                    className="block font-body text-sm no-underline py-2 transition-colors hover:!text-tryon-gold"
                    style={{ color: "rgba(250,247,244,0.7)" }}
                  >
                    {child.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <a
            href="#"
            className="font-body text-xs font-semibold uppercase no-underline transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.14em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "10px 24px",
            }}
          >
            Donate
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden bg-transparent border-none cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <div
              className="w-6 h-px transition-all"
              style={{
                background: "#fff",
                transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
              }}
            />
            <div
              className="w-6 h-px transition-all"
              style={{
                background: "#fff",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <div
              className="w-6 h-px transition-all"
              style={{
                background: "#fff",
                transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-8 pb-8 pt-4"
          style={{ background: "rgba(26,19,17,0.98)" }}
        >
          {navItems.map((item) => (
            <div key={item.label} className="mb-6">
              <div
                className="font-body text-xs uppercase mb-3"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                {item.label}
              </div>
              {item.children.map((child) => (
                <a
                  key={child.name}
                  href={child.href}
                  className="block font-body text-sm no-underline py-1.5"
                  style={{ color: "rgba(250,247,244,0.6)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {child.name}
                </a>
              ))}
            </div>
          ))}
          <a
            href="#"
            className="inline-block font-body text-xs font-semibold uppercase no-underline mt-4"
            style={{
              letterSpacing: "0.14em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "10px 24px",
            }}
          >
            Donate
          </a>
        </div>
      )}
    </nav>
  );
}
