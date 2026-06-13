import React, { useState, useMemo } from "react";
import { Play, X, ArrowUpRight, Film } from "lucide-react";

// ---------------------------------------------------------------------------
// Tales of Tryon — Lecture Archive
// ---------------------------------------------------------------------------
// Complete archive of 31 lectures from the THM YouTube playlist.
// Source: https://www.youtube.com/playlist?list=PLhHjNKkbzAzThUExsTjh9Bc1aSGTJgzux
//
// To add a new lecture:
//   1. Upload to the Tryon History Museum YouTube channel
//   2. Add it to the Tales of Tryon playlist
//   3. Add a new object to the `lectures` array below (newest first)
//   4. Commit + push; Vercel rebuilds automatically
// ---------------------------------------------------------------------------

const THEMES = {
  EASTSIDE: { label: "Eastside & African American History", color: "#8B4513" },
  ARCHITECTURE: { label: "Architecture & Design", color: "#4A5D3A" },
  EQUESTRIAN: { label: "Equestrian Heritage", color: "#6B4423" },
  LITERARY: { label: "Literary & Arts", color: "#2F4858" },
  VOICES: { label: "Tryon Voices", color: "#7B3F00" },
  FOUNDING: { label: "Founding & Early Tryon", color: "#3D2817" },
};

const lectures = [
  {
    slug: "dr-mc-palmer-country-doctor",
    title: "Dr. M.C. Palmer",
    subtitle: "A Country Doctor's Practice and Vision",
    speaker: "Strat and Ellen Douglas",
    date: "November 20, 2025",
    year: 2025,
    themes: ["VOICES"],
    description:
      "Strat and Ellen Douglas share their memories of Dr. M.C. Palmer — a country doctor whose practice, vision, and presence shaped Tryon across a long career of service.",
    youtubeId: "jesJ4vqNmDA",
    featured: true,
  },
  {
    slug: "emma-payne-erskine-andy-haynes",
    title: "Emma Payne Erskine and Her Legacy",
    speaker: "Andy Haynes",
    date: "September 11, 2025",
    year: 2025,
    themes: ["LITERARY"],
    description:
      "Andy Haynes presents the life of Emma Payne Erskine — writer, painter, civic leader, and cultural force who helped shape Tryon's identity as a center of art, literature, and community life.",
    youtubeId: "9e4mGW2ne0g",
  },
  {
    slug: "riding-hunt-club-centennial",
    title: "The Tryon Riding & Hunt Club Centennial",
    speaker: "Joanne Gibbs and Gerald Pack",
    date: "June 26, 2025",
    year: 2025,
    themes: ["EQUESTRIAN"],
    description:
      "A look back at one hundred years of the Tryon Riding & Hunt Club — from Carter Brown's founding vision in 1925 through Morris the Horse, Harmon Field, the Block House Steeplechase, and the community life that has gathered around horses in this town for a century.",
    youtubeId: "lw1Ih5D9eno",
  },
  {
    slug: "flynn-brady-architectural-visionaries",
    title: "Flynn and Brady: Architectural Visionaries",
    speaker: "Tales of Tryon",
    date: "March 20, 2025",
    year: 2025,
    themes: ["ARCHITECTURE"],
    description:
      "The stories behind Ligon Flynn and Holland Brady, Jr. — the architects whose Mid-Century Modern work left an indelible mark on Tryon and on North Carolina's architectural record.",
    youtubeId: "SkuvvFsDj1U",
  },
  {
    slug: "jenny-purtill-lanier-library",
    title: "The History of the Lanier Library",
    speaker: "Jenny Purtill",
    date: "March 4, 2025",
    year: 2025,
    themes: ["LITERARY", "FOUNDING"],
    description:
      "Jenny Purtill traces the story of the Lanier Library — one of the South's oldest private subscription libraries, founded in Tryon by a circle of readers and named for the Georgia poet who loved these mountains.",
    youtubeId: "HhRxF4q0OTc",
  },
  {
    slug: "warren-carson-eastside-personalities",
    title: "Eastside Personalities",
    subtitle: "Entrepreneurs, Educators, and Everyday People",
    speaker: "Dr. Warren J. Carson",
    date: "June 13, 2024",
    year: 2024,
    themes: ["EASTSIDE", "VOICES"],
    description:
      "Dr. Warren J. Carson — Professor Emeritus of English and African American Studies at USC Upstate, lifelong Tryon resident, and President of the Roseland Community Center — turns his attention to the personalities who built and sustained life on Tryon's Eastside. Delivered at Roseland, the community center at the heart of the neighborhood he has spent his life serving.",
    youtubeId: "FNpZKIz6RNY",
  },
  {
    slug: "vining-family-tryon-daily-bulletin",
    title: "That Remarkable Couple: Gladys and Seth Vining",
    subtitle: "Founders of the World's Smallest Daily Newspaper",
    speaker:
      "Panel: John Vining, Jim Vining, Hub Arledge, Garland Goodwin · Moderated by Michael McCue",
    date: "February 29, 2024",
    year: 2024,
    themes: ["LITERARY", "VOICES"],
    description:
      "A conversation among grandsons, friends, and students of the Vining family on the founding of the Tryon Daily Bulletin — the tabloid-sized paper that has published every afternoon since 1928 and claims the title of the world's smallest daily.",
    youtubeId: "9OvgKq0cnZ0",
  },
  {
    slug: "bruce-johnson-toymakers-wood-carvers",
    title: "Tryon Toymakers & Wood Carvers",
    speaker: "Bruce Johnson",
    date: "October 26, 2023",
    year: 2023,
    themes: ["LITERARY"],
    description:
      "Bruce Johnson, author of Biltmore Industries and the Tryon Toy-Makers and Wood-Carvers, traces the lives and craft of Eleanor Vance and Charlotte Yale — the women whose Tryon workshop became a node in the broader Appalachian handicraft movement.",
    youtubeId: "Q7gVryrKvx0",
  },
  {
    slug: "dean-trakas-architects-act-3",
    title: "Tryon Architects & Architecture, Act 3",
    speaker: "Dean Trakas",
    date: "August 29, 2023",
    year: 2023,
    themes: ["ARCHITECTURE"],
    description:
      "The third installment of Dean Trakas's ongoing survey of the architects and buildings that gave Tryon its distinctive look and feel.",
    youtubeId: "_sXgPx4LPNw",
  },
  {
    slug: "dean-trakas-take-2",
    title: "Tryon Architects & Architecture, Part 3 (Take 2)",
    speaker: "Dean Trakas",
    date: "August 29, 2023",
    year: 2023,
    themes: ["ARCHITECTURE"],
    description:
      "A second recording of Dean Trakas's third-act lecture on Tryon architecture, captured in longer form with additional material and audience discussion.",
    youtubeId: "OK1O3AG3iDY",
  },
  {
    slug: "warren-carson-walk-on-the-eastside",
    title: "Walk on the East Side",
    speaker: "Dr. Warren J. Carson",
    date: "June 15, 2023",
    year: 2023,
    themes: ["EASTSIDE"],
    description:
      "A tour — in memory and in place — through the Eastside neighborhood that shaped Dr. Carson and generations of Tryon's African American community. Delivered at the Roseland Community Center.",
    youtubeId: "JDEkPS3Ilpk",
  },
  {
    slug: "reconstruction-ragged-edge",
    title: "Reconstruction's Ragged Edge",
    speaker: "Steven Nash · with Michael McCue",
    date: "February 22, 2023",
    year: 2023,
    themes: ["FOUNDING", "EASTSIDE"],
    description:
      "Historian Steven Nash examines the contested, uneven Reconstruction era in western North Carolina, followed by Michael McCue's commentary on its local legacy in Polk County.",
    youtubeId: "QYQiJYydeFk",
  },
  {
    slug: "dean-trakas-architects-part-2",
    title: "Tryon Architects & Architecture, Part Two",
    speaker: "Dean Trakas",
    date: "November 16, 2022",
    year: 2022,
    themes: ["ARCHITECTURE"],
    description:
      "Dean Trakas continues his survey of Tryon's defining buildings and the architects who drew them — the second in a three-part series that is itself an education in how a small town accumulated an outsized architectural record.",
    youtubeId: "cbTdAHKRtC8",
  },
  {
    slug: "milton-ready-william-tryon",
    title: "Governor William Tryon and the Town That Bears His Name",
    speaker: "Dr. Milton Ready",
    date: "August 25, 2022",
    year: 2022,
    themes: ["FOUNDING"],
    description:
      "Dr. Milton Ready, author and Emeritus Professor of History at UNC Asheville, traces the colonial governor's influence on the frontier settlement that would become Tryon — and the first settlers who arrived here.",
    youtubeId: "vpcDQjcpn4U",
  },
  {
    slug: "boyhood-memories-1950s-tryon",
    title: "Boyhood Memories of 1950s Tryon",
    speaker: "Hub Arledge and Bill McCall",
    date: "June 30, 2022",
    year: 2022,
    themes: ["VOICES"],
    description:
      "Two longtime Tryon residents recall the town as they knew it as boys — the shops, the streets, the characters, and the rhythms of a small town in mid-century.",
    youtubeId: "7W3xA3V6Zsk",
  },
  {
    slug: "tryons-equestrian-heritage",
    title: "Tryon's Equestrian Heritage",
    speaker: "Gerald Pack and Libbie Johnson",
    date: "March 31, 2022",
    year: 2022,
    themes: ["EQUESTRIAN"],
    description:
      "From the Tryon Riding and Hunt Club to the Block House Steeplechase, Gerald Pack and Libbie Johnson trace a century of horse culture in the Carolina foothills.",
    youtubeId: "GsCu5QONj9E",
  },
  {
    slug: "garland-goodwin-remembers",
    title: "Garland Goodwin Remembers",
    speaker: "Garland Goodwin",
    date: "November 18, 2021",
    year: 2021,
    themes: ["VOICES"],
    description:
      "Garland Goodwin, a Tryon native, shares personal memories of three towering local figures: Seth Vining Sr., founder of the Tryon Daily Bulletin and the Polk County Historical Association; Clement Stevens, Mayor of Tryon in the 1940s; and Muriel Mazzanovich, Nina Simone's piano teacher.",
    youtubeId: "oCQC7TvKv2U",
  },
  {
    slug: "white-oak-mountain",
    title: "White Oak Mountain",
    speaker: "Susan Story Speight",
    date: "October 21, 2021",
    year: 2021,
    themes: ["LITERARY", "FOUNDING"],
    description:
      "Local author and historian Susan Story Speight discusses her book White Oak Mountain and the landscape, people, and stories it gathers.",
    youtubeId: "NrG7BBqXmRA",
  },
  {
    slug: "dean-trakas-architects-part-1",
    title: "Tryon Architects & Architecture, Part 1",
    speaker: "Dean Trakas",
    date: "August 19, 2021",
    year: 2021,
    themes: ["ARCHITECTURE"],
    description:
      "The opening lecture of Dean Trakas's three-part survey of Tryon architecture — a study of the builders, designers, and patrons who gave the town its form.",
    youtubeId: "ORHvNb55EJk",
  },
  {
    slug: "ghost-walks-trinah-falgout",
    title: "Ghost Walks",
    speaker: "Trinah Falgout",
    date: "July 15, 2021",
    year: 2021,
    themes: ["VOICES"],
    description:
      "Trinah Falgout leads an evening of Tryon's lingering stories — the unsolved, the unexplained, and the remembered. Part local history, part oral tradition.",
    youtubeId: "bY356gbg7Ho",
  },
  {
    slug: "tryon-theater-murder-mystery",
    title: "The Tryon Theater Murder Mystery",
    speaker: "Alan Leonard",
    date: "September 18, 2019",
    year: 2019,
    themes: ["VOICES"],
    description:
      "Alan Leonard takes an audience through one of Tryon's strangest episodes — a murder mystery centered on the Tryon Theater.",
    youtubeId: "lu5UTIxY8l0",
  },
  {
    slug: "history-of-tryon-panel-part-1",
    title: "The History of Tryon — Part 1",
    subtitle: "Pre-History to the Civil War",
    speaker: "History of Tryon Panel",
    date: "August 30, 2019",
    year: 2019,
    themes: ["FOUNDING"],
    description:
      "The first of a two-part panel discussion covering Tryon's earliest history — from Cherokee habitation of the Xuala region through colonial settlement, the Revolutionary era, and the Civil War.",
    youtubeId: "e1WMoUydhE4",
  },
  {
    slug: "history-of-tryon-panel-part-2",
    title: "The History of Tryon — Part 2",
    subtitle: "Civil War to Nina Simone",
    speaker: "History of Tryon Panel",
    date: "August 30, 2019",
    year: 2019,
    themes: ["FOUNDING", "LITERARY"],
    description:
      "The second part of the panel — covering Reconstruction, the railroad era, Tryon's emergence as an artists' colony, and the early life of Nina Simone, who was born here in 1933.",
    youtubeId: "CkEXcycvf4Y",
  },
  {
    slug: "amber-keeran-lanier-library",
    title: "The Lanier Library",
    speaker: "Amber Keeran",
    date: "August 21, 2019",
    year: 2019,
    themes: ["LITERARY", "FOUNDING"],
    description:
      "Amber Keeran presents the history of the Lanier Library — the subscription library that has served Tryon readers since the late nineteenth century.",
    youtubeId: "pO3yzo7N4lc",
  },
  {
    slug: "fitzgerald-bruce-johnson-ambrose-mills",
    title: "F. Scott Fitzgerald in Tryon",
    speaker: "Bruce Johnson and Ambrose Mills",
    date: "June 19, 2019",
    year: 2019,
    themes: ["LITERARY"],
    description:
      "Bruce Johnson and Ambrose Mills on F. Scott Fitzgerald's time in Tryon — the years when the Great Gatsby author came to the Carolina foothills seeking quiet, recovery, and the air of a small town.",
    youtubeId: "0-zSHBkPR2Q",
  },
  {
    slug: "jamie-carpenter",
    title: "Tales of Tryon with Jamie Carpenter",
    speaker: "Jamie Carpenter",
    date: "May 15, 2019",
    year: 2019,
    themes: ["VOICES"],
    description:
      "Jamie Carpenter at the Tryon History Museum — an evening of Tryon stories from a voice deeply familiar with the town's people and places.",
    youtubeId: "gEeO7ccrJqc",
  },
  {
    slug: "robert-lange-beginnings-of-tryon",
    title: "The Beginnings of Tryon",
    speaker: "Robert Lange",
    date: "April 17, 2019",
    year: 2019,
    themes: ["FOUNDING"],
    description:
      "Robert Lange on the earliest years of Tryon — from the Cherokee presence and the arrival of settlers through the founding of the town in 1885 and the railroad's transformative arrival.",
    youtubeId: "KL9vc53fwW0",
  },
  {
    slug: "harthorne-wingo-honored",
    title: "Harthorne Wingo Honored at the Tryon History Museum",
    subtitle: "A Special Event",
    speaker: "Harthorne Wingo",
    date: "February 14, 2019",
    year: 2019,
    themes: ["EASTSIDE", "VOICES"],
    description:
      "A special event honoring Harthorne Wingo — Tryon native, Polk County High School standout, and former New York Knicks forward who won an NBA championship in 1973. Included in the Tales of Tryon archive as a community tribute.",
    youtubeId: "yI2LEnWsJpA",
  },
  {
    slug: "tank-waters-asst-fire-chief",
    title: "Reflections from the Firehouse",
    speaker: '"Tank" Waters, Assistant Fire Chief',
    date: "November 8, 2018",
    year: 2018,
    themes: ["VOICES"],
    description:
      "Assistant Fire Chief \"Tank\" Waters shares decades of service, story, and first-hand observation of the Tryon community from one of its most essential institutions.",
    youtubeId: "4Y5A4p5fd0c",
  },
  {
    slug: "cliff-marr-board-of-elections",
    title: "Reflections from the Board of Elections",
    speaker: "Cliff Marr",
    date: "October 11, 2018",
    year: 2018,
    themes: ["VOICES"],
    description:
      "Cliff Marr of the Polk County Board of Elections shares the view from one of the town's most essential civic offices.",
    youtubeId: "ZLEw6UJn9Vo",
  },
  {
    slug: "gerald-pack-tales-2018",
    title: "Tales of Tryon with Gerald Pack",
    speaker: "Gerald Pack",
    date: "September 13, 2018",
    year: 2018,
    themes: ["VOICES"],
    description:
      "Gerald Pack, whose name recurs across this archive, shares his own stories and reflections on Tryon — recorded in 2018 at the Tryon History Museum.",
    youtubeId: "vuINqMaON3I",
  },
];

// ---------------------------------------------------------------------------

function Badge({ themeKey }) {
  const theme = THEMES[themeKey];
  if (!theme) return null;
  return (
    <span
      className="inline-flex items-center text-[10px] tracking-[0.15em] uppercase px-2 py-1 border"
      style={{
        color: theme.color,
        borderColor: theme.color,
        backgroundColor: `${theme.color}0D`,
      }}
    >
      {theme.label}
    </span>
  );
}

function LectureCard({ lecture, onOpen }) {
  const thumb = `https://img.youtube.com/vi/${lecture.youtubeId}/hqdefault.jpg`;
  return (
    <article
      className="group cursor-pointer flex flex-col"
      onClick={() => onOpen(lecture)}
    >
      <div className="relative overflow-hidden bg-stone-200 aspect-[16/10] border border-stone-300">
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
            <Play
              className="w-6 h-6 text-stone-900"
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
          {lecture.themes.map((t) => (
            <Badge key={t} themeKey={t} />
          ))}
        </div>
      </div>

      <div className="pt-4 pb-6 flex-1 flex flex-col">
        <div
          className="text-[11px] tracking-[0.2em] uppercase text-stone-500 mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {lecture.date}
        </div>
        <h3
          className="text-xl leading-tight text-stone-900 mb-1 group-hover:text-amber-900 transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {lecture.title}
        </h3>
        {lecture.subtitle && (
          <p
            className="text-sm italic text-stone-600 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {lecture.subtitle}
          </p>
        )}
        <p
          className="text-sm text-stone-600 mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {lecture.speaker}
        </p>
        <p
          className="text-sm text-stone-700 leading-relaxed line-clamp-3 flex-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {lecture.description}
        </p>
      </div>
    </article>
  );
}

function LectureModal({ lecture, onClose }) {
  if (!lecture) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-stone-50 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white shadow-md rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-stone-800" />
        </button>

        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${lecture.youtubeId}`}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="px-8 py-8 md:px-12 md:py-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {lecture.themes.map((t) => (
              <Badge key={t} themeKey={t} />
            ))}
          </div>
          <div
            className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {lecture.date}
          </div>
          <h2
            className="text-3xl md:text-4xl text-stone-900 leading-tight mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {lecture.title}
          </h2>
          {lecture.subtitle && (
            <p
              className="text-xl italic text-stone-600 mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {lecture.subtitle}
            </p>
          )}
          <p
            className="text-base text-stone-700 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {lecture.speaker}
          </p>
          <div className="w-16 h-px bg-stone-300 mb-6" />
          <p
            className="text-lg text-stone-800 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {lecture.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TalesOfTryon() {
  const [activeTheme, setActiveTheme] = useState("ALL");
  const [selectedLecture, setSelectedLecture] = useState(null);

  const filtered = useMemo(() => {
    if (activeTheme === "ALL") return lectures;
    return lectures.filter((l) => l.themes.includes(activeTheme));
  }, [activeTheme]);

  const featured = lectures.find((l) => l.featured);
  const themeCounts = useMemo(() => {
    const counts = { ALL: lectures.length };
    Object.keys(THEMES).forEach((k) => {
      counts[k] = lectures.filter((l) => l.themes.includes(k)).length;
    });
    return counts;
  }, []);

  const earliestYear = Math.min(...lectures.map((l) => l.year));
  const latestYear = Math.max(...lectures.map((l) => l.year));

  return (
    <div className="min-h-screen bg-stone-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Hero */}
      <section className="relative bg-stone-900 text-stone-50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(184,149,106,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(44,85,48,0.3), transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div
            className="text-xs tracking-[0.3em] uppercase text-amber-200/80 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            An archive of the Tryon History Museum lecture series
          </div>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8 max-w-5xl"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Tales of <span className="italic text-amber-200/90">Tryon</span>
          </h1>
          <p
            className="text-lg md:text-xl text-stone-300 leading-relaxed max-w-2xl mb-10"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          >
            A growing archive of conversations with historians, residents, and
            scholars — recorded in Tryon, drawn from memory and research, and
            preserved here for anyone who wants to listen.
          </p>
          <div className="flex items-center gap-8 text-sm text-stone-400">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {lectures.length} lectures · {earliestYear}–{latestYear}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div
            className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Most Recent
          </div>
          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            <div
              className="md:col-span-3 relative aspect-[16/10] bg-stone-200 border border-stone-300 cursor-pointer group overflow-hidden"
              onClick={() => setSelectedLecture(featured)}
            >
              <img
                src={`https://img.youtube.com/vi/${featured.youtubeId}/maxresdefault.jpg`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                  <Play
                    className="w-7 h-7 text-stone-900 ml-1"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                {featured.themes.map((t) => (
                  <Badge key={t} themeKey={t} />
                ))}
              </div>
              <div
                className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {featured.date}
              </div>
              <h2
                className="text-3xl md:text-4xl text-stone-900 leading-tight mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {featured.title}
              </h2>
              <p
                className="text-sm text-stone-600 mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {featured.speaker}
              </p>
              <p
                className="text-base text-stone-700 leading-relaxed mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {featured.description}
              </p>
              <button
                onClick={() => setSelectedLecture(featured)}
                className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-stone-900 border-b border-stone-900 pb-1 self-start hover:gap-3 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
              >
                Watch lecture <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="border-y border-stone-300 bg-stone-100/60 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 overflow-x-auto">
          <div className="flex items-center gap-2 md:gap-4 min-w-max">
            <span
              className="text-xs tracking-[0.2em] uppercase text-stone-500 mr-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Browse by
            </span>
            <FilterButton
              label="All"
              count={themeCounts.ALL}
              active={activeTheme === "ALL"}
              onClick={() => setActiveTheme("ALL")}
            />
            {Object.entries(THEMES).map(([key, theme]) => (
              <FilterButton
                key={key}
                label={theme.label}
                count={themeCounts[key]}
                active={activeTheme === key}
                onClick={() => setActiveTheme(key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {filtered.map((lecture) => (
            <LectureCard
              key={lecture.slug}
              lecture={lecture}
              onOpen={setSelectedLecture}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p
              className="text-lg text-stone-500"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No lectures in this category yet.
            </p>
          </div>
        )}
      </section>

      {/* Sponsor */}
      <section className="border-t border-stone-300 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 text-center">
          <div
            className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Tales of Tryon is made possible by
          </div>
          <p
            className="text-2xl md:text-3xl text-stone-800"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            The Polk County Community Foundation
          </p>
        </div>
      </section>

      <LectureModal
        lecture={selectedLecture}
        onClose={() => setSelectedLecture(null)}
      />
    </div>
  );
}

function FilterButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all ${
        active
          ? "bg-stone-900 text-stone-50"
          : "bg-transparent text-stone-600 hover:text-stone-900"
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
    >
      {label}
      <span
        className={`ml-2 text-[10px] ${
          active ? "text-stone-400" : "text-stone-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
