import React from "react";
import { ArrowUpRight } from "lucide-react";

// ---------------------------------------------------------------------------
// History Bits — Hub Page
// ---------------------------------------------------------------------------
// Landing page for the three categories:
//   /history-bits/notable-people
//   /history-bits/cultural-history
//   /history-bits/historic-places
//
// Each category card is clickable and previews the kind of content inside.
// ---------------------------------------------------------------------------

const categories = [
  {
    slug: "notable-people",
    title: "Notable People",
    kicker: "Portraits",
    count: 15,
    description:
      "The writers, reformers, artists, and neighbors whose lives intersected with this town — some for a season, some for a lifetime. From Governor William Tryon to Nina Simone, from Fitzgerald to the matriarchs of the Eastside, these are the biographies that give Tryon its particular shape.",
    image:
      "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1712285561681-VQ4PCYZU5Z7R0INIM72Q/Picture2341.jpg",
    accent: "#8B4513",
  },
  {
    slug: "cultural-history",
    title: "Cultural History",
    kicker: "Traditions",
    count: 3,
    description:
      "Some of what defines a place isn't a person or a building but a practice. The wooden horse on Trade Street. The toys carved by two women with a workshop and a vision. The world's smallest daily newspaper, published every afternoon since 1928. These are Tryon's cultural artifacts.",
    image:
      "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1706409366074-OTQVGNWD0ERPNAZBQ1EO/morris.jpg",
    accent: "#4A5D3A",
  },
  {
    slug: "historic-places",
    title: "Historic Places",
    kicker: "Landmarks",
    count: 3,
    description:
      "A library founded by readers who wanted more books than any one household could hold. A church whose stones mark a community's faith across generations. A network of schools — part of a nationwide partnership — that educated Black children across the American South. The places where Tryon's history took shape.",
    image:
      "https://images.squarespace-cdn.com/content/v1/63d97c255bc4c8084c6e5e50/1683233159913-8XU5XSE0UF9M6LHLZIAD/default.jpg",
    accent: "#2F4858",
  },
];

export default function HistoryBitsHub() {
  return (
    <div className="min-h-screen bg-[#f8f5ed]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        .paper-texture {
          background-image:
            radial-gradient(circle at 10% 20%, rgba(139, 90, 43, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(74, 93, 58, 0.03) 0%, transparent 50%);
        }

        .rule-fancy::before,
        .rule-fancy::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: currentColor;
          opacity: 0.3;
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="paper-texture relative overflow-hidden border-b border-stone-300/60">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32 text-center">
          <div
            className="text-xs tracking-[0.35em] uppercase text-stone-500 mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            From the Collection
          </div>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.95] text-stone-900 mb-10"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
            }}
          >
            History <span className="italic text-amber-900">Bits</span>
          </h1>
          <div className="flex items-center justify-center gap-6 mb-10 rule-fancy text-stone-400 max-w-sm mx-auto">
            <span
              className="text-xs tracking-[0.3em] uppercase text-stone-500 whitespace-nowrap"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Est. Tryon, NC
            </span>
          </div>
          <p
            className="text-xl md:text-2xl text-stone-700 leading-relaxed max-w-3xl mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontStyle: "italic",
            }}
          >
            The people, places, and things that make up Tryon's story — gathered
            here as an informal companion to what you'll find on our walls.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Three Categories                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="space-y-16 md:space-y-20">
          {categories.map((cat, i) => (
            <CategoryRow key={cat.slug} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom Note                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-stone-300/60 bg-stone-100/40">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 text-center">
          <p
            className="text-lg md:text-xl text-stone-700 leading-relaxed italic"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A small museum in a small town, holding a disproportionate share of
            the story.
          </p>
          <div
            className="mt-6 text-xs tracking-[0.25em] uppercase text-stone-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            26 Maple Street · Tryon, North Carolina
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryRow({ category, index }) {
  const isReversed = index % 2 === 1;

  return (
    <a
      href={`/history-bits/${category.slug}`}
      className="group block"
    >
      <div
        className={`grid md:grid-cols-12 gap-8 md:gap-12 items-center ${
          isReversed ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Image */}
        <div className="md:col-span-6 lg:col-span-7 relative aspect-[4/3] overflow-hidden border border-stone-300">
          <img
            src={category.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 mix-blend-multiply opacity-10"
            style={{ backgroundColor: category.accent }}
          />
          <div className="absolute top-4 left-4">
            <span
              className="inline-block px-3 py-1 bg-[#f8f5ed]/95 text-[10px] tracking-[0.2em] uppercase"
              style={{
                color: category.accent,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              {category.kicker}
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="md:col-span-6 lg:col-span-5">
          <div className="flex items-baseline gap-4 mb-4">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{
                color: category.accent,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              № 0{index + 1}
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: category.accent, opacity: 0.3 }}
            />
            <span
              className="text-xs tracking-[0.15em] uppercase text-stone-500"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {category.count} {category.count === 1 ? "entry" : "entries"}
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] text-stone-900 mb-6 group-hover:text-amber-900 transition-colors"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {category.title}
          </h2>

          <p
            className="text-base md:text-lg text-stone-700 leading-relaxed mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          >
            {category.description}
          </p>

          <div
            className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase border-b pb-1 transition-all group-hover:gap-3"
            style={{
              color: category.accent,
              borderColor: category.accent,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Explore {category.title}
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
