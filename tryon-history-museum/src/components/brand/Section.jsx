const backgrounds = {
  cream: "bg-brand-cream",
  parchment: "bg-brand-parchment",
  ink: "bg-brand-ink",
  transparent: "bg-transparent",
};

/**
 * Editorial section container for redesign components.
 * Provides the standard max-width column and vertical rhythm.
 */
export default function Section({
  as: Tag = "section",
  bg = "cream",
  id,
  className = "",
  children,
}) {
  return (
    <Tag id={id} className={`py-20 md:py-28 ${backgrounds[bg]} ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">{children}</div>
    </Tag>
  );
}
