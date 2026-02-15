import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536];

/**
 * Generates responsive image props from a Sanity image source.
 * Returns { src, srcSet, sizes, width, height, blurDataURL } or null.
 */
export function sanityImageProps(source, { widths = DEFAULT_WIDTHS, quality = 80 } = {}) {
  if (!source?.asset) return null;

  const builder = urlFor(source).auto("format").quality(quality);
  const src = builder.width(1280).url();
  const srcSet = widths
    .map((w) => `${builder.width(w).url()} ${w}w`)
    .join(", ");

  // Low-quality placeholder for blur
  const blurDataURL = builder.width(24).quality(20).blur(10).url();

  return {
    src,
    srcSet,
    blurDataURL,
    width: source.asset?.metadata?.dimensions?.width || 1280,
    height: source.asset?.metadata?.dimensions?.height || 720,
  };
}

/**
 * Renders a Sanity image with responsive srcSet via Next.js Image.
 * Falls back gracefully if the image source is invalid.
 */
export default function SanityImage({
  image,
  alt = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality = 80,
  fill = false,
  priority = false,
  className = "",
  style = {},
}) {
  if (!image?.asset) return null;

  const builder = urlFor(image).auto("format").quality(quality);
  const src = builder.width(1280).url();
  const blurUrl = builder.width(24).quality(20).blur(10).url();

  // Build loader for Next.js Image
  const sanityLoader = ({ width: w }) => {
    return builder.width(w).url();
  };

  if (fill) {
    return (
      <Image
        loader={sanityLoader}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
        placeholder="blur"
        blurDataURL={blurUrl}
      />
    );
  }

  return (
    <Image
      loader={sanityLoader}
      src={src}
      alt={alt}
      width={image.asset?.metadata?.dimensions?.width || 1280}
      height={image.asset?.metadata?.dimensions?.height || 720}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      placeholder="blur"
      blurDataURL={blurUrl}
    />
  );
}
