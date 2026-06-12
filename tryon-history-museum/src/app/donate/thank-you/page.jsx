import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Thank You | Tryon History Museum",
  description: "Thank you for your donation to the Tryon History Museum.",
};

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export default function DonateThankyouPage() {
  return (
    <main id="main-content">
      <Nav />

      {/* Hero */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, #5C1F1A 50%, ${DEEP_RED} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 relative z-10">
          <div
            className="font-body text-[11px] uppercase mb-4"
            style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
          >
            Support the Museum
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-0">
            Thank you for{" "}
            <span className="italic font-semibold">supporting</span>
            <br />
            Tryon&apos;s history.
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <p
            className="font-body text-[17px] leading-relaxed mb-10"
            style={{ color: "rgba(26,19,17,0.7)" }}
          >
            Your contribution helps preserve and share the stories of this
            community. A receipt has been sent to your email.
          </p>

          <Link
            href="/"
            className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.12em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "14px 36px",
            }}
          >
            Return to Home
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
