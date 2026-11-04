import Link from "next/link";

const base =
  "inline-block font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] no-underline px-7 py-3.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-brand-heritage text-brand-cream hover:bg-brand-ink focus-visible:outline-brand-heritage",
  secondary:
    "bg-transparent text-brand-ink border border-brand-ink/30 hover:border-brand-ink hover:bg-brand-ink hover:text-brand-cream focus-visible:outline-brand-ink",
};

/**
 * Editorial button styles rendered as a link.
 * `variant="primary"` is the filled heritage-red button;
 * `variant="secondary"` is the restrained outline button.
 */
export default function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant]} ${className}`;
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
