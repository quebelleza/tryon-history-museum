import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Tryon History Museum & Visitor Center | Tryon, NC",
  description:
    "Discover the rich heritage of Tryon, North Carolina — from Cherokee origins to the railroad age, from Nina Simone's first piano notes to a world-renowned equestrian tradition. Plan your visit today.",
  keywords: [
    "Tryon",
    "history museum",
    "North Carolina",
    "Nina Simone",
    "equestrian",
    "Blue Ridge",
    "visitor center",
  ],
  openGraph: {
    title: "Tryon History Museum & Visitor Center",
    description:
      "A small town with a grand story. Explore the people and moments that shaped Tryon, North Carolina.",
    url: "https://tryonhistorymuseum.org",
    siteName: "Tryon History Museum",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#C4A35A] focus:text-[#1A1311] focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
