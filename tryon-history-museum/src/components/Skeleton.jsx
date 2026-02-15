"use client";

export function SkeletonPulse({ className = "", style = {} }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "rgba(123,45,38,0.06)", ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div
      className="flex gap-4 md:gap-7 p-5 md:p-9"
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(123,45,38,0.08)",
      }}
    >
      <div className="min-w-[56px] md:min-w-[72px] text-center py-4 pr-4 md:pr-7"
        style={{ borderRight: "1px solid rgba(123,45,38,0.1)" }}
      >
        <SkeletonPulse className="h-8 w-10 mx-auto mb-2" />
        <SkeletonPulse className="h-3 w-8 mx-auto" />
      </div>
      <div className="flex-1">
        <SkeletonPulse className="h-3 w-16 mb-3" />
        <SkeletonPulse className="h-6 w-3/4 mb-3" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function TierCardSkeleton() {
  return (
    <div
      className="p-7 md:p-11 text-center"
      style={{ border: "1px solid rgba(196,163,90,0.15)" }}
    >
      <SkeletonPulse className="h-3 w-20 mx-auto mb-4" />
      <SkeletonPulse className="h-12 w-16 mx-auto mb-1" />
      <SkeletonPulse className="h-3 w-14 mx-auto mb-6" />
      <SkeletonText lines={2} className="max-w-[200px] mx-auto mb-7" />
      <SkeletonPulse className="h-10 w-28 mx-auto" />
    </div>
  );
}

export function BoardMemberSkeleton() {
  return (
    <div
      className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 mb-6"
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(123,45,38,0.08)",
      }}
    >
      <SkeletonPulse className="w-full md:w-[200px] h-[200px] flex-shrink-0" />
      <div className="flex-1">
        <SkeletonPulse className="h-6 w-40 mb-2" />
        <SkeletonPulse className="h-4 w-24 mb-4" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}

export function ExhibitCardSkeleton() {
  return (
    <div
      style={{
        background: "#FFFDF9",
        border: "1px solid rgba(123,45,38,0.08)",
      }}
    >
      <SkeletonPulse className="w-full aspect-[16/10]" />
      <div className="p-8">
        <SkeletonPulse className="h-3 w-28 mb-3" />
        <SkeletonPulse className="h-7 w-3/4 mb-3" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}
