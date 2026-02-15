import Nav from "@/components/Nav";
import { SkeletonPulse, SkeletonText, EventCardSkeleton, TierCardSkeleton } from "@/components/Skeleton";

const DEEP_RED = "#7B2D26";
const DARK_RED = "#5C1F1A";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

export default function HomeLoading() {
  return (
    <main id="main-content">
      <Nav />

      {/* Hero skeleton */}
      <section
        className="relative min-h-[480px] md:min-h-[600px] h-screen flex items-end overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, ${DARK_RED} 50%, ${DEEP_RED} 100%)`,
        }}
      >
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 pb-16 md:pb-24 w-full">
          <div className="max-w-[700px]">
            <SkeletonPulse className="h-3 w-48 mb-6" style={{ background: "rgba(196,163,90,0.15)" }} />
            <SkeletonPulse className="h-14 w-80 mb-3" style={{ background: "rgba(255,255,255,0.08)" }} />
            <SkeletonPulse className="h-14 w-64 mb-7" style={{ background: "rgba(255,255,255,0.08)" }} />
            <SkeletonPulse className="h-4 w-96 mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
            <SkeletonPulse className="h-4 w-72" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        </div>
      </section>

      {/* Visit skeleton */}
      <section className="bg-tryon-cream py-24 md:py-28">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <SkeletonPulse className="h-3 w-20 mb-4" />
          <SkeletonPulse className="h-10 w-64 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-3">
                  <SkeletonPulse className="h-4 w-24" />
                  <SkeletonPulse className="h-4 w-32" />
                </div>
              ))}
            </div>
            <SkeletonPulse className="h-60 w-full" />
          </div>
        </div>
      </section>

      {/* Events skeleton */}
      <section className="bg-tryon-cream py-24 md:py-28">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <SkeletonPulse className="h-3 w-28 mb-4" />
          <SkeletonPulse className="h-10 w-56 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Support skeleton */}
      <section
        className="py-24 md:py-28"
        style={{
          background: `linear-gradient(170deg, ${DEEP_RED} 0%, ${DARK_RED} 60%, ${WARM_BLACK} 100%)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="text-center max-w-[560px] mx-auto mb-16">
            <SkeletonPulse className="h-3 w-32 mx-auto mb-4" style={{ background: "rgba(196,163,90,0.15)" }} />
            <SkeletonPulse className="h-10 w-72 mx-auto mb-5" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <TierCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
