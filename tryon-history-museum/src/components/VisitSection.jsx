"use client";

import FadeIn from "./FadeIn";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const MUTED_RED = "#A8584F";

const hours = [
  { day: "Wednesday", time: "1:00 PM – 4:00 PM" },
  { day: "Thursday", time: "1:00 PM – 4:00 PM" },
  { day: "Friday", time: "11:00 AM – 5:00 PM" },
  { day: "Saturday", time: "11:00 AM – 5:00 PM" },
  { day: "Sunday – Tuesday", time: "Closed" },
];

export default function VisitSection() {
  return (
    <section id="visit" className="bg-tryon-cream py-24 md:py-28">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left: Hours */}
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: DEEP_RED }}
            >
              Visit Us
            </div>
            <h2 className="font-display text-4xl md:text-[44px] font-light text-tryon-black leading-[1.15] mb-10">
              Hours &amp;
              <br />
              <span className="italic font-semibold">Admission</span>
            </h2>
            <div
              className="p-9"
              style={{
                background: "#FFFDF9",
                border: "1px solid rgba(123,45,38,0.1)",
              }}
            >
              {hours.map((h, i) => (
                <div
                  key={h.day}
                  className="flex justify-between items-center py-3.5"
                  style={{
                    borderBottom:
                      i < hours.length - 1
                        ? "1px solid rgba(123,45,38,0.08)"
                        : "none",
                  }}
                >
                  <span className="font-body text-[15px] text-tryon-black font-medium">
                    {h.day}
                  </span>
                  <span
                    className="font-display text-[17px]"
                    style={{
                      color: h.time === "Closed" ? MUTED_RED : WARM_BLACK,
                      fontStyle: h.time === "Closed" ? "italic" : "normal",
                    }}
                  >
                    {h.time}
                  </span>
                </div>
              ))}
              <div
                className="mt-6 p-4"
                style={{
                  background: `${DEEP_RED}08`,
                  border: `1px solid ${DEEP_RED}15`,
                }}
              >
                <span
                  className="font-body text-sm font-medium"
                  style={{ color: DEEP_RED }}
                >
                  Free admission
                </span>
                <span
                  className="font-body text-[13px] ml-2"
                  style={{ color: MUTED_RED }}
                >
                  — donations gratefully accepted
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Right: Location */}
          <FadeIn delay={0.2}>
            <div className="lg:mt-14">
              {/* Map placeholder */}
              <div
                className="w-full h-60 flex items-center justify-center mb-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #F5F0EB 0%, #FAF7F4 100%)",
                  border: "1px solid rgba(123,45,38,0.1)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(123,45,38,0.03) 20px, rgba(123,45,38,0.03) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(123,45,38,0.03) 20px, rgba(123,45,38,0.03) 21px)",
                  }}
                />
                <div className="text-center relative">
                  <div className="text-2xl mb-2 opacity-30">📍</div>
                  <div
                    className="font-body text-[13px]"
                    style={{ letterSpacing: "0.1em", color: MUTED_RED }}
                  >
                    Interactive map
                  </div>
                </div>
              </div>

              <h3 className="font-display text-2xl font-semibold text-tryon-black mb-4">
                Find Us
              </h3>
              <p className="font-body text-base text-tryon-black leading-relaxed mb-2">
                26 Maple Street
                <br />
                Tryon, NC 28782
              </p>
              <p className="font-body text-[15px] mb-7" style={{ color: MUTED_RED }}>
                (828) 440-1116 &middot; info@tryonhistorymuseum.org
              </p>
              <div
                className="p-5"
                style={{
                  background: "#FFFDF9",
                  border: "1px solid rgba(123,45,38,0.1)",
                }}
              >
                <div
                  className="font-body text-[11px] uppercase mb-3"
                  style={{ letterSpacing: "0.2em", color: DEEP_RED }}
                >
                  Also a Visitor Center
                </div>
                <p
                  className="font-body text-sm leading-relaxed m-0"
                  style={{ color: "rgba(26,19,17,0.7)" }}
                >
                  The Museum also serves as Tryon&apos;s official Visitor Center.
                  Stop in for local recommendations, maps, and everything you
                  need to explore our corner of the Blue Ridge foothills.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
