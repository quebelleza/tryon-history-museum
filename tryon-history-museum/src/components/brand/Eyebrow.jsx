/**
 * Small uppercase section label ("eyebrow") set in the brand secondary
 * sans (Syntax slot). Defaults to heritage red; use `tone="stone"` on
 * dark backgrounds.
 */
export default function Eyebrow({ children, tone = "heritage", className = "" }) {
  const tones = {
    heritage: "text-brand-heritage",
    stone: "text-brand-stone",
    ink: "text-brand-ink",
  };
  return (
    <p
      className={`font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.28em] mb-4 ${tones[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
