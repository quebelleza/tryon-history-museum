import React from "react";
import { ArrowUpRight, ChevronLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// History Bits — Category Page (reusable)
// ---------------------------------------------------------------------------
// Renders the listing page for any of the three categories:
//   /history-bits/notable-people
//   /history-bits/cultural-history
//   /history-bits/historic-places
//
// Each entry links to a detail page at /history-bits/{category}/{slug}.
// Until detail pages are built, the `oldSiteUrl` serves as a fallback — you
// can temporarily route the detail link to the old Squarespace page.
// ---------------------------------------------------------------------------

const categories = {
  "notable-people": {
    kicker: "Portraits",
    title: "Notable People",
    intro:
      "Tryon's story is told through the people who passed through or made a home here — writers chasing clean air and quiet, reformers and educators, pianists and portrait painters, farmers and family-shopkeepers. What follows is an informal register: a record of the figures whose work, presence, or memory continues to shape this place.",
    accent: "#8B4513",
    entries: [
      {
        slug: "william-tryon-and-the-nc-regulators",
        title: "Governor William Tryon and the NC Regulators",
        kicker: "Colonial Era",
        blurb:
          "The colonial governor whose treaty with the Cherokee gave this town its name — and the frontier conflict that tested his rule.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1712088791369-OZ4FM7Y58QPM3LDEV9FX/Gov+Tryon.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/williamtryonandthencregulators",
      },
      {
        slug: "sidney-lanier",
        title: "Sidney Lanier",
        kicker: "Poet · Musician",
        blurb:
          "The Georgia-born poet and flutist who spent his final months convalescing in the Carolina mountains, writing some of his most luminous work from here.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/0aec3893-c7ae-43b7-bcbc-49197e4d3169/SidneyLanier.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/sidney-lanier",
      },
      {
        slug: "emma-payne-erskine",
        title: "Emma Payne Erskine",
        kicker: "Writer · Painter · Civic Leader",
        blurb:
          "A novelist and artist whose vision helped transform a railroad stop into a cultural colony, and whose legacy lingers in the women she inspired.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/e6c21e24-b253-418e-aa95-ca8fea53c1b5/erskine-emma-portrait2.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/emma-payne-erskine",
      },
      {
        slug: "nina-simone",
        title: "Nina Simone",
        kicker: "Pianist · Singer · Activist",
        blurb:
          "Born Eunice Kathleen Waymon in 1933, she was a self-taught piano prodigy by age three. A community helped fund her lessons. The world knows what came next.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1712285561681-VQ4PCYZU5Z7R0INIM72Q/Picture2341.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/ninasimone",
      },
      {
        slug: "carter-brown",
        title: "Carter P. Brown",
        kicker: "Founder · Tryon Riding & Hunt Club",
        blurb:
          "The transplanted Michigander who imagined a riding club, a steeplechase, and a town built around the horse — and then proceeded to build them.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1680291209552-4NEUPCAIA90YFOYC3IEP/33.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/carter-brown",
      },
      {
        slug: "margaret-culkin-banning",
        title: "Margaret Culkin Banning",
        kicker: "Novelist",
        blurb:
          "A prolific and best-selling novelist of the mid-twentieth century whose work grappled with women's lives, labor, and interior conviction.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1681735065578-JQJEYYI43ZAXV2JH4FPH/Margaret_Culkin_Banning.png",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/margaret-culkin-banning",
      },
      {
        slug: "thomas-wolfe-and-f-scott-fitzgerald",
        title: "Thomas Wolfe & F. Scott Fitzgerald",
        kicker: "Novelists · 1930s",
        blurb:
          "Two titans of American letters who found their way to Tryon during its interwar years — one in search of quiet, one in search of escape.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1687272298656-9LWF0IW0ZR4YHZOKO2PH/Thomas_Wolfe_1937_1_%28cropped%29.jpeg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/thomas-wolfe-and-f-scott-fitzgerald",
      },
      {
        slug: "lilian-jackson-braun",
        title: "Lilian Jackson Braun",
        kicker: "Mystery Novelist",
        blurb:
          "Author of the beloved Cat Who mysteries, Braun spent decades writing from her home in the Tryon area — a community she made her own.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/943c5f55-2b5c-4cf4-8a67-c41fce52773a/lilian_jackson_braun_cat.jpg",
        oldSiteUrl: "https://www.tryonhistorymuseum.org/notablepeople/braun",
      },
      {
        slug: "famous-women-visiting-tryon",
        title: "Famous Women Who Came to Tryon",
        kicker: "Visitors · First Ladies",
        blurb:
          "First Ladies Grace Coolidge and Eleanor Roosevelt. Writers, performers, suffragists. An accounting of the women whose visits left marks on this town.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1687271979022-9KGQG9JIJSYY2AQ6TAJQ/Grace-Coolidge.jpeg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/famouswomen",
      },
      {
        slug: "el-taarn-homer-ellertson-castle",
        title: "El Taarn",
        kicker: "Artist Homer Ellertson's Castle",
        blurb:
          "A stone castle on the edge of town, built by a painter with a singular vision. An eccentric artifact of Tryon's early-20th-century artist colony.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1681823473119-R6GS2H2ZRLA4D6QQGJEH/b75a0469d9bb61e419296b61875e250f.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/el-taarn-ljw8a",
      },
      {
        slug: "james-payne",
        title: "James Payne",
        kicker: "Eastside Businessman",
        blurb:
          "Entrepreneur, property owner, and pillar of Tryon's Eastside community — a figure whose work shaped generations of African American life here.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1680289348633-3KAJ0ZEFAOODY7XKUEUW/payne.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/james-payne",
      },
      {
        slug: "dorothy-mabel-reed-mendenhall",
        title: "Dorothy Mabel Reed Mendenhall",
        kicker: "Physician · Researcher",
        blurb:
          "The pioneering medical researcher who identified the cells that bear her name in Hodgkin's disease — and who retired to Tryon in her later years.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1681735090597-OAECXC8S53IOMKFFVX6K/Dorothy_Mabel_Reed_Mendenhall.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/dorothymabelreedmendenhall",
      },
      {
        slug: "kenneth-lackey",
        title: "Kenneth Lackey",
        kicker: "Original Stooge",
        blurb:
          "The Tryon native who, briefly and improbably, performed with the Three Stooges in their earliest days on vaudeville and in early film.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/fbbc0b87-46b3-4d8e-a5be-382b0085de6f/KennethLackey.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/kennethlacke",
      },
      {
        slug: "josephine-sibley-couper",
        title: "Josephine Sibley Couper",
        kicker: "Cultural Patron",
        blurb:
          "A civic force whose philanthropy and cultural involvement helped shape the arts institutions that still define Tryon today.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/102fa74f-eb75-46fd-8f22-aebedbec38f6/JosephineSibleyCouper.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/josephine-sibley-couper",
      },
      {
        slug: "charles-austin-beard",
        title: "Charles Austin Beard",
        kicker: "Historian",
        blurb:
          "One of the most influential American historians of the twentieth century — a revisionist, an institution-builder, and, in his final years, a Tryon resident.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/047bae2a-4d7c-49d8-a832-6419865f4845/CharlesAustinBeard.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/notablepeople/charles-austin-beard",
      },
    ],
  },
  "cultural-history": {
    kicker: "Traditions",
    title: "Cultural History",
    intro:
      "Not every artifact sits behind glass. Some take the form of a painted wooden horse at the corner of Trade Street. Some live in the hands of woodcarvers or in the ink of a daily newspaper the size of a folded napkin. These are the traditions, objects, and practices that gave Tryon its texture — and continue to define it today.",
    accent: "#4A5D3A",
    entries: [
      {
        slug: "the-tryon-horse",
        title: "Morris the Horse",
        kicker: "Tryon's Wooden Mascot · Est. 1928",
        blurb:
          "The carved wooden horse who has stood watch over Trade Street for nearly a century — a mascot, a meeting place, and a civic personality in his own right.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1706409366074-OTQVGNWD0ERPNAZBQ1EO/morris.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/cultural-history/the-tryon-horse",
      },
      {
        slug: "toymakers-and-wood-carvers",
        title: "Tryon Toymakers & Wood Carvers",
        kicker: "Eleanor Vance & Charlotte Yale",
        blurb:
          "Two women, a Biltmore background, and a workshop that gave Tryon one of its earliest craft industries — and a place in the Appalachian handicraft movement.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1706460805597-RVLHDNU2ZIUPIYCBY350/Morris+toy.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/cultural-history/toymakersandwoodcarvers",
      },
      {
        slug: "the-tryon-daily-bulletin",
        title: "The Tryon Daily Bulletin",
        kicker: "The World's Smallest Daily Newspaper",
        blurb:
          "Founded in 1928 by Seth Vining and published every afternoon since — a tabloid-sized paper small enough to fit in your hand, and a civic institution larger than its dimensions suggest.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1714527771420-GTA0WA931NYC677PE9PG/Gladys+and+Seth+Vining.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/cultural-history/the-tryon-daily-bulletin",
      },
    ],
  },
  "historic-places": {
    kicker: "Landmarks",
    title: "Historic Places",
    intro:
      "Some of Tryon's history is held in its buildings — a library endowed by readers, a church whose walls have witnessed a century and a half of baptisms and burials, a school built through a philanthropic partnership that educated Black children across the South. These are the places where the town's past took physical form, and where much of it remains visible today.",
    accent: "#2F4858",
    entries: [
      {
        slug: "the-lanier-library",
        title: "The Lanier Library",
        kicker: "Est. 1890 · Melrose Avenue",
        blurb:
          "One of the oldest private subscription libraries in the South, founded by a circle of readers and named for the poet who loved these mountains.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1683233159913-8XU5XSE0UF9M6LHLZIAD/default.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/historic-places/the-lanier-library",
      },
      {
        slug: "the-good-shepherd-episcopal-church",
        title: "The Good Shepherd Episcopal Church",
        kicker: "Markham Road",
        blurb:
          "The historic Episcopal church that served Tryon's African American community for generations — and whose stones still stand at the corner of Markham and Pine.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1683233483461-UKO6U2QPU4KCG642P828/Picture1.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/historic-places/the-good-shepherd-episcopal-church",
      },
      {
        slug: "the-rosenwald-schools",
        title: "The Rosenwald Schools",
        kicker: "A National Partnership, A Local Legacy",
        blurb:
          "Part of a sweeping early-twentieth-century partnership between Booker T. Washington and philanthropist Julius Rosenwald, these schools educated Black children across the American South — including in Polk County.",
        image:
          "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1683233563498-SYC68XSYEE85NDZ7XJRQ/Picture234.jpg",
        oldSiteUrl:
          "https://www.tryonhistorymuseum.org/historic-places/the-rosenwald-schools",
      },
    ],
  },
};

// ---------------------------------------------------------------------------

export default function HistoryBitsCategory({ categorySlug = "notable-people" }) {
  const category = categories[categorySlug];

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f8f5ed] flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-xl text-stone-600"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Category not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ed]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .paper-texture {
          background-image:
            radial-gradient(circle at 10% 20%, rgba(139, 90, 43, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(74, 93, 58, 0.03) 0%, transparent 50%);
        }
      `}</style>

      {/* Category Selector (for this artifact preview only - remove in real app) */}
      <div className="bg-stone-100 border-b border-stone-300 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs">
          <span
            className="tracking-[0.2em] uppercase text-stone-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Preview:
          </span>
          {Object.entries(categories).map(([slug, cat]) => (
            <button
              key={slug}
              onClick={() => window.location.hash = slug}
              className={`px-3 py-1 text-xs tracking-[0.1em] uppercase ${
                slug === categorySlug
                  ? "bg-stone-800 text-stone-50"
                  : "bg-transparent text-stone-600 hover:text-stone-900"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb & Header                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="paper-texture border-b border-stone-300/60">
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-20 md:pb-24">
          <a
            href="/history-bits"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-stone-500 hover:text-stone-900 transition-colors mb-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <ChevronLeft className="w-3 h-3" />
            Back to History Bits
          </a>

          <div className="max-w-4xl">
            <div
              className="text-xs tracking-[0.3em] uppercase mb-6"
              style={{
                color: category.accent,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {category.kicker} · {category.entries.length} {category.entries.length === 1 ? "Entry" : "Entries"}
            </div>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-stone-900 mb-10"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
              }}
            >
              {category.title}
            </h1>
            <div
              className="w-16 h-px mb-10"
              style={{ backgroundColor: category.accent }}
            />
            <p
              className="text-lg md:text-xl text-stone-700 leading-relaxed"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              {category.intro}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Entries Grid                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-x-10 md:gap-y-16">
          {category.entries.map((entry) => (
            <EntryCard key={entry.slug} entry={entry} accent={category.accent} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom Navigation                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-stone-300/60 bg-stone-100/40">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div
            className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-8 text-center"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Continue Exploring
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(categories)
              .filter(([slug]) => slug !== categorySlug)
              .map(([slug, cat]) => (
                <a
                  key={slug}
                  href={`/history-bits/${slug}`}
                  className="group block border border-stone-300 p-8 hover:bg-stone-50 transition-colors"
                >
                  <div
                    className="text-[10px] tracking-[0.3em] uppercase mb-3"
                    style={{
                      color: cat.accent,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {cat.kicker}
                  </div>
                  <h3
                    className="text-2xl text-stone-900 group-hover:text-amber-900 transition-colors mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500,
                    }}
                  >
                    {cat.title}
                  </h3>
                  <div
                    className="text-xs tracking-[0.15em] uppercase text-stone-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {cat.entries.length} entries →
                  </div>
                </a>
              ))}
            <a
              href="/history-bits"
              className="group block border border-stone-300 p-8 hover:bg-stone-50 transition-colors"
            >
              <div
                className="text-[10px] tracking-[0.3em] uppercase mb-3 text-stone-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                The Full Collection
              </div>
              <h3
                className="text-2xl text-stone-900 group-hover:text-amber-900 transition-colors mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                All of History Bits
              </h3>
              <div
                className="text-xs tracking-[0.15em] uppercase text-stone-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Browse all three categories →
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function EntryCard({ entry, accent }) {
  return (
    <a
      href={entry.oldSiteUrl}
      className="group block"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative overflow-hidden aspect-[4/5] border border-stone-300 mb-5">
        <img
          src={entry.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-white drop-shadow-lg" />
        </div>
      </div>

      <div
        className="text-[10px] tracking-[0.25em] uppercase mb-2"
        style={{
          color: accent,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}
      >
        {entry.kicker}
      </div>
      <h3
        className="text-2xl md:text-[26px] leading-tight text-stone-900 mb-3 group-hover:text-amber-900 transition-colors"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
        }}
      >
        {entry.title}
      </h3>
      <p
        className="text-sm text-stone-600 leading-relaxed"
        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
      >
        {entry.blurb}
      </p>
    </a>
  );
}
