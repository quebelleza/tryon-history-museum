# Tryon History Museum Website

A modern, editorial website for the Tryon History Museum & Visitor Center in Tryon, North Carolina.

Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/), deployed on [Vercel](https://vercel.com/).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed

### Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" and select this repo
4. Vercel will auto-detect Next.js — click "Deploy"
5. Your site will be live at `your-project-name.vercel.app`

When you're ready, you can connect your custom domain in Vercel's project settings.

## Project Structure

```
src/
  app/
    layout.js       # Root layout with metadata/SEO
    page.js         # Homepage
    globals.css     # Global styles + Tailwind
  components/
    Nav.jsx         # Navigation with dropdowns
    Hero.jsx        # Hero section with dynamic hours
    VisitSection.jsx    # Hours, admission, location
    AboutSection.jsx    # History & Nina Simone highlight
    EventsSection.jsx   # Upcoming events grid
    SupportSection.jsx  # Membership tiers
    NewsletterSection.jsx  # Email signup
    Footer.jsx      # Site footer
    FadeIn.jsx      # Scroll animation utility
public/
    logo-white.png  # Museum logo
```

## Brand Colors

| Name       | Hex       | Usage                  |
|------------|-----------|------------------------|
| Tryon Red  | `#7B2D26` | Primary brand color    |
| Dark Red   | `#5C1F1A` | Deep accent            |
| Warm Black | `#1A1311` | Text, dark backgrounds |
| Gold       | `#C4A35A` | Accent, CTAs, labels   |
| Cream      | `#FAF7F4` | Light backgrounds      |

## License

Private — Tryon History Museum. All rights reserved.
