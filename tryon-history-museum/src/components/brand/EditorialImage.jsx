import Image from "next/image";

/**
 * Editorial image treatment: a framed figure with an optional caption
 * and photo credit. Wraps next/image — pass `fill` for container-driven
 * crops, or width/height for intrinsic sizing.
 */
export default function EditorialImage({
  src,
  alt,
  caption,
  credit,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  fill = false,
  width,
  height,
  className = "",
}) {
  return (
    <figure className={`m-0 ${className}`}>
      <div
        className={`relative overflow-hidden border border-brand-ink/10 bg-brand-parchment ${
          fill ? "w-full h-full" : ""
        }`}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            className="h-auto w-full object-cover"
          />
        )}
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          {caption && (
            <span className="font-brand-body text-sm leading-relaxed text-brand-ink/70">
              {caption}
            </span>
          )}
          {credit && (
            <span className="font-brand-body text-[11px] uppercase tracking-[0.08em] text-brand-ink/45">
              {credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
