import { getAllExhibits } from "@/sanity/lib/exhibits";
import { getAllEvents } from "@/sanity/lib/events";

const BASE_URL = "https://tryonhistorymuseum.org";

export default async function sitemap() {
  // Static routes
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/exhibits`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/board`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic exhibit routes (for future detail pages)
  let exhibitRoutes = [];
  try {
    const exhibits = await getAllExhibits();
    exhibitRoutes = (exhibits || [])
      .filter((e) => e.slug?.current)
      .map((exhibit) => ({
        url: `${BASE_URL}/exhibits/${exhibit.slug.current}`,
        lastModified: exhibit._updatedAt ? new Date(exhibit._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
  } catch (e) {
    // Silently skip if Sanity is unavailable
  }

  return [...staticRoutes, ...exhibitRoutes];
}
