const sizes = {
  xl: "text-[clamp(40px,6vw,68px)] leading-[1.05]",
  lg: "text-[clamp(32px,4.5vw,48px)] leading-[1.1]",
  md: "text-[clamp(26px,3vw,36px)] leading-[1.15]",
};

/**
 * Editorial display headline set in Playfair Display SC with fluid
 * sizing. `as` controls the heading level for document semantics.
 * Note: the family ships in 400/700 only — `font-normal` is the base.
 */
export default function DisplayHeadline({
  as: Tag = "h2",
  size = "lg",
  tone = "ink",
  className = "",
  children,
}) {
  const tones = {
    ink: "text-brand-ink",
    cream: "text-brand-cream",
    heritage: "text-brand-heritage",
  };
  return (
    <Tag
      className={`font-brand-display font-normal m-0 ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children}
    </Tag>
  );
}
