import FadeIn from "./FadeIn";

const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const footerLinks = [
  {
    heading: "Visit",
    links: [
      { name: "Hours & Admission", href: "#visit" },
      { name: "Plan Your Visit", href: "#visit" },
      { name: "Gift Shop", href: "#" },
    ],
  },
  {
    heading: "About",
    links: [
      { name: "Our Story", href: "#about" },
      { name: "Board of Directors", href: "/board" },
      { name: "Contact Us", href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { name: "Become a Member", href: "#support" },
      { name: "Volunteer", href: "#" },
      { name: "Donate", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="py-16 md:pt-16 md:pb-10" style={{ background: WARM_BLACK }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Identity */}
          <div>
            <div
              className="font-display text-2xl font-bold uppercase"
              style={{ letterSpacing: "0.06em", color: "#FAF7F4" }}
            >
              Tryon
            </div>
            <div
              className="font-display text-[13px] uppercase mb-5"
              style={{
                letterSpacing: "0.18em",
                color: MUTED_RED,
              }}
            >
              History Museum
            </div>
            <p
              className="font-body text-sm leading-relaxed max-w-[280px] m-0"
              style={{ color: "rgba(250,247,244,0.45)" }}
            >
              26 Maple Street
              <br />
              Tryon, NC 28782
              <br />
              (828) 440-1116
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <div
                className="font-body text-[11px] uppercase mb-5"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                {col.heading}
              </div>
              {col.links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block font-body text-sm no-underline mb-3 transition-colors hover:!text-[#FAF7F4]"
                  style={{ color: "rgba(250,247,244,0.5)" }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-wrap justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(250,247,244,0.08)" }}
        >
          <div
            className="font-body text-xs"
            style={{ color: "rgba(250,247,244,0.3)" }}
          >
            © {new Date().getFullYear()} Tryon History Museum &middot; A
            501(c)(3) nonprofit organization
          </div>
          <a
            href="https://www.facebook.com/tryonhistorymuseum/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs no-underline transition-colors hover:!text-[#FAF7F4]"
            style={{ color: "rgba(250,247,244,0.4)" }}
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
