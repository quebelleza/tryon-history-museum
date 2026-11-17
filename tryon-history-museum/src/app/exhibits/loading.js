import Nav from "@/components/Nav";
import { SkeletonPulse } from "@/components/Skeleton";

export default function ExhibitsLoading() {
  return (
    <main id="main-content">
      <Nav />
      {/* Hero skeleton */}
      <section className="bg-brand-cream pt-32 md:pt-40 pb-16 md:pb-20">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <SkeletonPulse className="h-3 w-40 mb-4" />
          <SkeletonPulse className="h-12 w-96 max-w-full mb-5" />
          <SkeletonPulse className="h-6 w-72 max-w-full mb-7" />
          <SkeletonPulse className="h-4 w-[540px] max-w-full" />
        </div>
      </section>

      {/* Exhibit entries skeleton */}
      <section className="bg-brand-parchment py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <SkeletonPulse className="h-8 w-56 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-t border-brand-ink/15 pt-6">
                <SkeletonPulse className="h-6 w-3/4 mb-3" />
                <SkeletonPulse className="h-4 w-full mb-2" />
                <SkeletonPulse className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
