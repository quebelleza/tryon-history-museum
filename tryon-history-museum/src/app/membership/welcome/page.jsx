import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Welcome | Tryon History Museum",
  description: "Welcome to the Tryon History Museum. You're now a member.",
};

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export default function MembershipWelcomePage() {
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
            Membership
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-3">
            Welcome to the{" "}
            <span className="italic font-semibold">Tryon History Museum.</span>
          </h1>
          <p
            className="font-display text-xl md:text-2xl font-light text-white m-0"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            You&apos;re now a member.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[640px] mx-auto px-5 md:px-8 text-center">
          <p
            className="font-body text-[17px] leading-relaxed mb-10"
            style={{ color: "rgba(26,19,17,0.7)" }}
          >
            Thank you for joining us. We look forward to seeing you at the museum.
          </p>

          <div
            className="p-8 mb-10 text-left"
            style={{ background: "#FFFDF9", border: "1px solid rgba(123,45,38,0.1)" }}
          >
            <div
              className="font-body text-[11px] uppercase mb-3"
              style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
            >
              Next Step
            </div>
            <p
              className="font-body text-[16px] leading-[1.7] mb-0"
              style={{ color: WARM_BLACK }}
            >
              <strong>Check your email.</strong> We sent you a link to set up
              your online account. Click it to create a password and access your
              member dashboard.
            </p>
          </div>

          <Link
            href="/visit"
            className="inline-block font-body text-[13px] font-semibold uppercase no-underline transition-all hover:brightness-110"
            style={{
              letterSpacing: "0.12em",
              color: WARM_BLACK,
              background: GOLD_ACCENT,
              padding: "14px 36px",
            }}
          >
            Visit the Museum →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
