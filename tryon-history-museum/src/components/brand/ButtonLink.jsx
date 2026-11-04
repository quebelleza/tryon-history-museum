import Link from "next/link";

const base =
  "inline-block font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] no-underline px-7 py-3.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-brand-heritage text-brand-cream hover:bg-brand-ink focus-visible:outline-brand-heritage",
  secondary:
    "bg-transparent text-brand-ink border border-brand-ink/30 hover:border-brand-ink hover:bg-brand-ink hover:text-brand-cream focus-visible:outline-brand-ink",
  light:
    "bg-brand-cream text-brand-heritage hover:bg-white focus-visible:outline-brand-cream",
  secondaryOnDark:
    "bg-transparent text-brand-cream border border-brand-cream/40 hover:border-brand-cream hover:bg-brand-cream hover:text-brand-ink focus-visible:outline-brand-cream",
};

/**
 * Editorial button styles rendered as a link.
 * `variant="primary"` is the filled heritage-red button;
 * `variant="secondary"` is the restrained outline button.
 */
export default function ButtonLink({
  href,
  variant = "primary",
  as,
  className = "",
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (as === "button") {
    return (
      <button type="button" className={classes} {...rest}>
        {children}
      </button>
    );
  }

  const isExternal = typeof href === "string" && /^https?:\/\//.test(href);

  if (isExternal) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
