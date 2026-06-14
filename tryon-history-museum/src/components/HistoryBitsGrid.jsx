"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { historyBits, CATEGORIES } from "@/lib/historyBits";
import FadeIn from "@/components/FadeIn";

const DEEP_RED = "#7B2D26";
const GOLD_ACCENT = "#C4A35A";
const WARM_BLACK = "#1A1311";

export default function HistoryBitsGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? historyBits
      : historyBits.filter((a) => a.category === activeCategory);

  return (
    <section style={{ background: "#FAF7F4" }}>
      {/* Filter tabs */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-8">
        <div className="flex flex-wrap gap-4 md:gap-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="font-body text-[12px] uppercase cursor-pointer border-none bg-transparent transition-all pb-1"
                style={{
                  letterSpacing: "0.12em",
                  color: isActive ? GOLD_ACCENT : "rgba(26,19,17,0.45)",
                  fontWeight: isActive ? 700 : 400,
                  borderBottom: isActive
                    ? `2px solid ${GOLD_ACCENT}`
                    : "2px solid transparent",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pb-20 md:pb-28">
        {filtered.length === 0 ? (
          <div
            className="text-center py-20 px-8"
            style={{
              background: "#FFFDF9",
              border: "1px solid rgba(26,19,17,0.08)",
            }}
          >
            <p
              className="font-body text-[15px] m-0"
              style={{ color: "rgba(26,19,17,0.45)" }}
            >
              More stories coming soon. Check back as we continue migrating our archive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((article) => (
              <FadeIn key={article.slug}>
                <Link
                  href={`/history-bits/${article.slug}`}
                  className="group block no-underline transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#FFFDF9",
                    border: "1px solid rgba(26,19,17,0.08)",
                    boxShadow: "0 1px 4px rgba(26,19,17,0.04)",
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <div
                      className="font-body text-[10px] uppercase mb-2"
                      style={{ letterSpacing: "0.18em", color: GOLD_ACCENT }}
                    >
                      {article.categoryLabel}
                    </div>
                    <h2
                      className="font-display text-[20px] md:text-[22px] font-semibold leading-[1.2] mb-3"
                      style={{ color: WARM_BLACK }}
                    >
                      {article.title}
                    </h2>
                    <p
                      className="font-body text-[14px] leading-[1.7] mb-4"
                      style={{ color: "rgba(26,19,17,0.6)" }}
                    >
                      {article.excerpt}
                    </p>
                    <span
                      className="font-body text-[13px]"
                      style={{ color: DEEP_RED }}
                    >
                      Read more →
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
