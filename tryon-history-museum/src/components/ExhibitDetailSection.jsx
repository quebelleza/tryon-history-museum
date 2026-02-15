"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import FadeIn from "./FadeIn";
import SanityImage from "./SanityImage";

const DEEP_RED = "#7B2D26";
const WARM_BLACK = "#1A1311";
const GOLD_ACCENT = "#C4A35A";

function formatDateRange(startDate, endDate, isPermanent) {
  if (isPermanent) return "Permanent Exhibit";
  if (!startDate) return "";
  const fmt = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  const startStr = fmt(startDate);
  if (!endDate) return `Since ${startStr}`;
  return `${startStr} – ${fmt(endDate)}`;
}

const portableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="font-body text-[16px] md:text-[17px] leading-[1.8] mb-5"
        style={{ color: "rgba(26,19,17,0.75)" }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2
        className="font-display text-2xl md:text-3xl font-semibold mt-10 mb-4"
        style={{ color: WARM_BLACK }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="font-display text-xl md:text-2xl font-semibold mt-8 mb-3"
        style={{ color: WARM_BLACK }}
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="pl-6 my-6 font-display text-lg italic"
        style={{
          borderLeft: `3px solid ${GOLD_ACCENT}`,
          color: "rgba(26,19,17,0.65)",
        }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-2 font-body text-[16px]" style={{ color: "rgba(26,19,17,0.75)" }}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2 font-body text-[16px]" style={{ color: "rgba(26,19,17,0.75)" }}>
        {children}
      </ol>
    ),
  },
};

function GalleryImage({ image, index, onClick }) {
  return (
    <button
      onClick={() => onClick(index)}
      className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-transparent border-0 p-0"
    >
      {image.asset ? (
        <SanityImage
          image={image}
          alt={image.caption || `Gallery image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : image.url ? (
        <Image
          src={image.url}
          alt={image.caption || `Gallery image ${index + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : null}
      {image.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-body text-xs text-white">{image.caption}</span>
        </div>
      )}
    </button>
  );
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const img = images[index];
  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl bg-transparent border-0 cursor-pointer z-10"
        aria-label="Close lightbox"
      >
        &#x2715;
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl bg-transparent border-0 cursor-pointer z-10"
            aria-label="Previous image"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl bg-transparent border-0 cursor-pointer z-10"
            aria-label="Next image"
          >
            &#8250;
          </button>
        </>
      )}
      <div
        className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {img.url ? (
          <Image
            src={img.url}
            alt={img.caption || "Gallery image"}
            fill
            className="object-contain"
            sizes="90vw"
          />
        ) : null}
      </div>
      {img.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-body text-sm text-center max-w-lg">
          {img.caption}
        </div>
      )}
    </div>
  );
}

export default function ExhibitDetailSection({ exhibit }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const dateLabel = formatDateRange(exhibit.startDate, exhibit.endDate, exhibit.isPermanent);
  const gallery = exhibit.gallery || [];

  return (
    <>
      {/* Header */}
      <section
        className="pt-40 pb-16 md:pt-48 md:pb-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${WARM_BLACK} 0%, #5C1F1A 50%, ${DEEP_RED} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 relative z-10">
          <FadeIn>
            <Link
              href="/exhibits"
              className="inline-flex items-center gap-2 font-body text-sm no-underline mb-8 transition-colors hover:opacity-80"
              style={{ color: GOLD_ACCENT }}
            >
              ← Back to Exhibits
            </Link>
            {dateLabel && (
              <div
                className="font-body text-[11px] uppercase mb-4"
                style={{ letterSpacing: "0.2em", color: GOLD_ACCENT }}
              >
                {dateLabel}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-6xl font-light text-white leading-[1.1] mb-6">
              {exhibit.title}
            </h1>
            {exhibit.description && (
              <p
                className="font-body text-[17px] leading-relaxed max-w-[600px] m-0"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {exhibit.description}
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Cover image */}
      {(exhibit.coverImage?.asset || exhibit.coverImageUrl) && (
        <section className="relative w-full max-h-[500px] overflow-hidden">
          {exhibit.coverImage?.asset ? (
            <SanityImage
              image={exhibit.coverImage}
              alt={exhibit.title}
              sizes="100vw"
              priority
              className="w-full h-auto object-cover"
            />
          ) : (
            <Image
              src={exhibit.coverImageUrl}
              alt={exhibit.title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              sizes="100vw"
              priority
            />
          )}
        </section>
      )}

      {/* Content */}
      <section className="py-16 md:py-24" style={{ background: "#FAF7F4" }}>
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeIn>
            {exhibit.longDescription ? (
              <PortableText
                value={exhibit.longDescription}
                components={portableTextComponents}
              />
            ) : exhibit.description ? (
              <p
                className="font-body text-[17px] leading-[1.8]"
                style={{ color: "rgba(26,19,17,0.75)" }}
              >
                {exhibit.description}
              </p>
            ) : (
              <p
                className="font-body text-[17px] leading-[1.8] italic"
                style={{ color: "rgba(26,19,17,0.45)" }}
              >
                More details coming soon.
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-16 md:py-24" style={{ background: "#FFFDF9" }}>
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <FadeIn>
              <div
                className="font-body text-[11px] uppercase mb-4"
                style={{ letterSpacing: "0.3em", color: GOLD_ACCENT }}
              >
                Gallery
              </div>
              <h2
                className="font-display text-3xl md:text-4xl font-light mb-10"
                style={{ color: WARM_BLACK }}
              >
                Images from this Exhibit
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <GalleryImage
                    image={img}
                    index={i}
                    onClick={setLightboxIndex}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)
          }
          onNext={() =>
            setLightboxIndex((lightboxIndex + 1) % gallery.length)
          }
        />
      )}
    </>
  );
}
