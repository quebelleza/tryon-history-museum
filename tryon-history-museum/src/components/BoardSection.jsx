"use client";

import FadeIn from "./FadeIn";
import Image from "next/image";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";
const MUTED_RED = "#A8584F";

const boardMembers = [
  {
    name: "Dick Callaway",
    title: "President",
    term: "2026",
    photo: null,
    bio: "An avid historian and North Carolina native, Dick Callaway and his wife, Fran, moved to Tryon from Louisville, Kentucky, eleven years ago. Fran is deeply involved in Tryon\u2019s equestrian community, and together they have become an integral part of the town\u2019s civic life. Dick has served on the Tryon History Museum Board for eight years, including the past four as President. He is also deeply involved with the North Carolina Transportation Museum and is a familiar presence at community gatherings throughout Tryon. If you don\u2019t know Dick Callaway, you likely haven\u2019t been to a Tryon event. Widely respected for his deep knowledge of local and regional history, Dick is a natural storyteller and an invaluable resource to the Museum. If you ask him a historical question, be prepared to take a seat\u2014his understanding of the area\u2019s past is both expansive and enduring.",
  },
  {
    name: "Heather Brady",
    title: "Vice President",
    term: "2028",
    photo: "/board/heather-brady.jpg",
    bio: "Heather Brady came to Tryon from Greenville, SC, with a lifelong curiosity for history, place, and storytelling. Her professional background in real estate and project management has deepened her appreciation for preservation, research, and the narratives that shape communities. From tracing historic deeds to uncovering local lore, Heather is passionate about keeping Tryon\u2019s history alive and relevant. As Vice President of the Tryon History Museum, she brings a strategic, hands-on approach to her work, with a goal of strengthening the Museum\u2019s role as a vibrant destination and essential stop on the Tryon map.",
  },
  {
    name: "Wanda May",
    title: "Treasurer",
    term: "2026",
    photo: "/board/wanda-may.jpg",
    bio: "Wanda May has called Tryon home for more than three decades. A Virginia native, she is the former owner of The Book Shelf, a beloved downtown Tryon shop she operated from 1993 to 2002. A founding member of the Tryon Downtown Development Association, Wanda has long been deeply involved in the life and growth of downtown Tryon. She brings extensive experience from careers in health systems management and church administration, along with a deep love for the town and its history. Wanda dedicates an extraordinary amount of time and energy to the Tryon History Museum. Known for her quiet leadership and steady commitment, she is often the one who steps in to ensure the work gets done, making her an invaluable and trusted presence on the Board.",
  },

  {
    name: "Willard Whitson",
    title: "Board Member",
    term: "2027",
    photo: "/board/willard-whitson.jpg",
    bio: "Willard Whitson is the Executive Director of the KidSenses Children\u2019s Museum in Rutherfordton, North Carolina. An award-winning artist and former arts educator, he has spent more than four decades creating engaging, informal learning environments at institutions such as the American Museum of Natural History, the Academy of Natural Sciences, and the National Children\u2019s Museum. Willard brings creativity and exhibit expertise to the Tryon History Museum, helping expand its reach and enrich the visitor experience through thoughtful, engaging design. His passion lies in fostering curiosity and lifelong learning, particularly for young visitors, and in creating museum spaces that inspire people of all ages to ask questions and explore.",
  },
  {
    name: "Harriet Hudson",
    title: "Board Member",
    term: "2027",
    photo: "/board/harriet-hudson.jpg",
    bio: "Harriet Hudson came to Tryon five years ago after leaving Texas and quickly became an active and engaged presence in the community. An interior designer with a special interest in historic homes and furnishings, she brings a strong preservation-minded perspective to her work. Harriet has direct museum experience through her work with the Winterthur Museum in Delaware and contributes both energy and initiative to the Tryon History Museum. She is deeply involved in a number of town efforts, including downtown development and historic preservation, and is widely known as someone who sees projects through with care and precision.",
  },
  {
    name: "Frances Parker",
    title: "Board Member",
    term: "2027",
    photo: "/board/frances-parker.jpg",
    bio: "Frances Parker is a true native of the Tryon area, having grown up on a peach farm off Blackstock Road in Landrum. After graduating from high school, she attended North Greenville College and went on to build a distinguished career as a paralegal, working for 33 years at a local law firm. Following a brief hiatus, she was recruited back into the legal field, where she continued her work for an additional seven years. Frances joined the Tryon History Museum Board in January 2024 and quickly became an invaluable resource. Her deep knowledge of the area, its people, and its history enriches the Museum\u2019s work and strengthens its connection to the community. Known for her warmth and approachability, it\u2019s often said that Frances is so friendly she could \u201ceven get along with the devil\u201d\u2014a quality that makes her a trusted presence and a true gem to all who know her.",
  },
  {
    name: "Cinda Austin",
    title: "Board Member",
    term: "2027",
    photo: null,
    bio: "Cinda left big city life and settled into Tryon 17 years ago. Her main interest is in bringing people together through local agriculture and food which was served in historic hotels and homes over our history. She served as the Food Coordinator for the very successful Farm-To-Trade event put on by TDDA. She is closely involved in promoting our local wineries. Her motto is \u201cEvery Table has a Story.\u201d Cinda is excited to help promote our local history by joining the board.",
  },

  {
    name: "Dr. Warren Carson",
    title: "Board Member",
    term: "2028",
    photo: "/board/warren-carson.jpg",
    bio: "Dr. Warren Carson is a native of Tryon, having grown up on the Eastside of town. His deep knowledge of, and long-standing civic involvement in, the African American community is essential to the Museum\u2019s mission to fully and faithfully tell Tryon\u2019s history. Dr. Carson is retired after a distinguished career as an administrator and professor at USC Upstate. He continues to serve the town with dedication and generosity as President of the Roseland Community Center in Tryon, where he helps provide a vital gathering place for the community and meaningful opportunities for children. A trusted voice and invaluable resource, Dr. Carson brings both lived experience and historical insight\u2014particularly regarding Tryon\u2019s Eastside\u2014ensuring that these stories are preserved, honored, and shared for generations to come.",
  },
  {
    name: "Colin Thompson",
    title: "Board Member",
    term: "2028",
    photo: null,
    bio: "Colin Thompson is an Upstate South Carolina native with deep family roots in Western North Carolina and the Tryon area. After spending his career leading teams and organizations across both corporate and small business environments, Colin returned to Tryon over a year ago to take over and be a thoughtful steward of his family home. He joined the Tryon History Museum Board as its newest\u2014and youngest\u2014member, proudly lowering the average age of the Board by about a decade and underscoring the importance of service and stewardship at every stage of life. Colin is honored to serve and is committed to helping preserve and share the region\u2019s rich history for future generations.",
  },
];

function MemberCard({ member, index }) {
  const isEven = index % 2 === 0;

  return (
    <FadeIn delay={0.1}>
      <div
        className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 py-12 md:py-16`}
        style={{
          borderBottom: "1px solid rgba(123,45,38,0.08)",
        }}
      >
        {/* Photo */}
        <div className="md:w-[280px] flex-shrink-0">
          {member.photo ? (
            <div
              className="w-full aspect-[3/4] md:aspect-[3/4] relative overflow-hidden"
              style={{ background: "#F5F0EB" }}
            >
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[3/4] md:aspect-[3/4] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #F5F0EB 0%, #FAF7F4 100%)",
                border: "1px solid rgba(123,45,38,0.06)",
              }}
            >
              <div className="text-center">
                <div
                  className="font-display text-5xl font-light"
                  style={{ color: "rgba(123,45,38,0.12)" }}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="font-body text-[11px] uppercase mb-3 font-semibold"
            style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
          >
            {member.title} &middot; Term {member.term}
          </div>
          <h3
            className="font-display text-3xl md:text-[34px] font-semibold mb-5"
            style={{ color: WARM_BLACK }}
          >
            {member.name}
          </h3>
          <p
            className="font-body text-[15px] leading-[1.8] m-0"
            style={{ color: "rgba(26,19,17,0.65)" }}
          >
            {member.bio}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

function normalizeSanityMembers(sanityMembers) {
  if (!sanityMembers || sanityMembers.length === 0) return null;
  return sanityMembers.map((m) => ({
    name: m.name,
    title: m.role,
    term: m.term,
    photo: m.photoUrl || null,
    bio: m.bio,
  }));
}

export default function BoardSection({ sanityMembers }) {
  const normalized = normalizeSanityMembers(sanityMembers);
  const allMembers = normalized || boardMembers;

  // Separate officers and members
  const officers = allMembers.filter((m) =>
    ["President", "Vice President", "Treasurer"].includes(m.title)
  );
  const members = allMembers.filter(
    (m) => !["President", "Vice President", "Treasurer"].includes(m.title)
  );

  return (
    <>
      {/* Page header */}
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-24 relative overflow-hidden"
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
        <div className="max-w-[1200px] mx-auto px-8 relative z-10">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-4"
              style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
            >
              About the Museum
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              2025 Board of{" "}
              <span className="italic font-semibold">Directors</span>
            </h1>
            <p
              className="font-body text-[17px] leading-relaxed max-w-[540px] m-0"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              The Tryon History Museum is guided by a dedicated group of
              volunteers who share a deep love for this community and a
              commitment to preserving its story.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Officers */}
      <section className="bg-tryon-cream py-16 md:py-20">
        <div className="max-w-[1000px] mx-auto px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-12"
              style={{ letterSpacing: "0.25em", color: DEEP_RED }}
            >
              Officers
            </div>
          </FadeIn>
          {officers.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>

      {/* Board Members */}
      <section
        className="py-16 md:py-20"
        style={{ background: "#F5F0EB" }}
      >
        <div className="max-w-[1000px] mx-auto px-8">
          <FadeIn>
            <div
              className="font-body text-[11px] uppercase mb-12"
              style={{ letterSpacing: "0.25em", color: DEEP_RED }}
            >
              Board Members
            </div>
          </FadeIn>
          {members.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
