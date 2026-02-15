import Nav from "@/components/Nav";
import { BoardMemberSkeleton, SkeletonPulse } from "@/components/Skeleton";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";

export default function BoardLoading() {
  return (
    <main id="main-content">
      <Nav />
      {/* Header */}
      <section
        className="pt-40 pb-20 md:pt-48 md:pb-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, #5C1F1A 50%, ${DEEP_RED} 100%)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 relative z-10">
          <SkeletonPulse className="h-3 w-28 mb-4" style={{ background: "rgba(196,163,90,0.15)" }} />
          <SkeletonPulse className="h-12 w-80 mb-6" style={{ background: "rgba(255,255,255,0.08)" }} />
          <SkeletonPulse className="h-4 w-96 max-w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </section>

      {/* Board members */}
      <section className="bg-tryon-cream py-16 md:py-20">
        <div className="max-w-[1000px] mx-auto px-5 md:px-8">
          <SkeletonPulse className="h-3 w-20 mb-12" />
          {Array.from({ length: 3 }).map((_, i) => (
            <BoardMemberSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
