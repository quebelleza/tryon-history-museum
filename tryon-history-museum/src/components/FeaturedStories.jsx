import Image from "next/image";
import Link from "next/link";
import { Section, Eyebrow, DisplayHeadline } from "@/components/brand";
import { historyBits } from "@/lib/historyBits";

const featured = historyBits.slice(0, 3);

export default function FeaturedStories() {
  if (featured.length === 0) return null;

  return (
    <Section id="stories" bg="cream">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
        <div className="max-w-[620px]">
          <Eyebrow>The Stories That Made Us</Eyebrow>
          <DisplayHeadline>
            A remarkable place.
            <br />A thousand stories.
          </DisplayHeadline>
        </div>
        <Link
          href="/history-bits"
          className="font-brand-secondary text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-heritage no-underline border-b border-brand-heritage pb-1 hover:text-brand-ink hover:border-brand-ink transition-colors"
        >
          Browse All History Bits &rarr;
        </Link>
      </div>

      <div
        className={`grid grid-cols-1 gap-10 md:gap-12 ${
          featured.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {featured.map((story) => (
          <Link
            key={story.slug}
            href={`/history-bits/${story.slug}`}
            className="group block no-underline"
          >
            <article>
              <div className="relative aspect-[3/2] overflow-hidden border border-brand-ink/10 bg-brand-parchment">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <p className="mt-5 mb-2 font-brand-secondary text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-heritage">
                {story.categoryLabel}
              </p>
              <h3 className="m-0 font-brand-display text-2xl font-normal leading-[1.2] text-brand-ink group-hover:text-brand-heritage transition-colors">
                {story.title}
              </h3>
              <p className="mt-3 mb-4 font-brand-body text-[15px] leading-[1.7] text-brand-ink/65 line-clamp-3">
                {story.excerpt}
              </p>
              <span className="font-brand-secondary text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-heritage">
                Read the story &rarr;
              </span>
            </article>
          </Link>
        ))}
      </div>
    </Section>
  );
}
