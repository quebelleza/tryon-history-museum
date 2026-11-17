/**
 * Curated exhibit content for /exhibits.
 *
 * This is the museum-approved introduction to current exhibits — edited
 * copy lives here, not in Sanity. Each entry reserves an `image` slot:
 * when authentic photographs are ready, add
 *   image: { src: "/images/exhibits/foo.jpg", alt: "…", credit?: "…" }
 * and the page will render it via EditorialImage without restructuring.
 *
 * Honesty rules for editors:
 *  - The Christmas ornament display is SEASONAL (holiday period only).
 *  - Gillette / Brown / equestrian materials share physical display
 *    space — describe them as subjects, never as separate rooms.
 *  - The WWII veteran's name is unconfirmed — do not add one here.
 *  - Nina Simone's exhibit is temporarily unavailable, no reopening date.
 */

export const exhibitsHero = {
  eyebrow: "Explore the Museum",
  heading: "Every Object Has a Story.",
  subheading: "And in Tryon, there are plenty worth telling.",
  intro:
    "From the remarkable craftsmanship of the Tryon Toy-Makers to the people, places, and traditions that shaped our town, our exhibits offer a glimpse into the wonderfully layered history of Tryon, North Carolina.",
};

export const exhibitSections = [
  {
    id: "made-in-tryon",
    title: "Made in Tryon",
    exhibits: [
      {
        title: "Tryon Toy-Makers & Wood-Carvers",
        description:
          "Discover Tryon\u2019s celebrated tradition of handcrafted wooden toys and decorative carving. Our collection includes an extensive assortment of wooden toys, carved craftwork, and a special display of Christmas tree ornaments presented during the holiday season.",
        note: "The Christmas ornament display is presented seasonally, during the holiday period.",
        image: null,
      },
      {
        title: "Ralph Erskine & the Tryon Chair Factory",
        description:
          "Explore a chapter of Tryon\u2019s manufacturing heritage through Ralph Erskine and the Tryon Chair Factory, where local craftsmanship became part of the town\u2019s identity.",
        image: null,
      },
    ],
  },
  {
    id: "remarkable-lives",
    title: "Remarkable Lives",
    exhibits: [
      {
        title: "William Gillette & Carter Brown",
        description:
          "Discover the stories of William Gillette and Carter Brown, two notable figures connected to Tryon\u2019s distinctive cultural history.",
        image: null,
      },
      {
        title: "Sidney Lanier",
        description:
          "Explore the life and literary legacy of Sidney Lanier, the poet and musician whose story remains part of the region\u2019s cultural heritage.",
        image: null,
      },
      {
        title: "Tryon\u2019s Writers",
        description:
          "Discover the writers and literary voices who helped shape Tryon\u2019s reputation as a community rich in creativity and storytelling.",
        image: null,
      },
      {
        title: "Harthorne Wingo",
        description:
          "Learn about Tryon\u2019s connection to professional basketball through the life and accomplishments of Harthorne Wingo.",
        image: null,
      },
    ],
  },
  {
    id: "the-town-we-know",
    title: "The Town We Know",
    exhibits: [
      {
        title: "Oak Hall Hotel",
        description:
          "Discover the story of Oak Hall Hotel and its place in Tryon\u2019s development as a mountain resort destination.",
        image: null,
      },
      {
        title: "Tryon\u2019s Equestrian History",
        description:
          "Explore the longstanding equestrian traditions that helped shape Tryon\u2019s identity and continue to influence the surrounding region.",
        image: null,
      },
      {
        title: "Tryon Golf Course",
        description:
          "Explore the history of one of Tryon\u2019s longstanding recreational traditions and its place in the community.",
        image: null,
      },
      {
        title: "The Tryon All-Stars",
        description:
          "Learn about the Tryon All-Stars and their place in the town\u2019s sporting and community history.",
        image: null,
      },
    ],
  },
  {
    id: "a-closer-look",
    title: "A Closer Look",
    exhibits: [
      {
        title: "World War II: A Tryon Veteran\u2019s Story",
        status: "display", // 'display' renders a "Currently on display" marker
        description:
          "A special temporary exhibit honoring a local Tryon veteran and offering a personal connection to the experiences of World War II.",
        image: null,
      },
      {
        title: "Nina Simone: A Tryon Legacy",
        status: "unavailable", // renders a "Temporarily unavailable" marker
        description:
          "Nina Simone\u2019s connection to Tryon is an important part of our community\u2019s history. Her exhibit is currently being reimagined and is not available for viewing at this time.",
        image: null,
      },
    ],
  },
];
