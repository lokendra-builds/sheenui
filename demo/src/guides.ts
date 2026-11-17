/**
 * The guides in docs/guides, as the site needs them without loading any article: the hub page lists
 * them, and every article links to its siblings. The text of an article is its Markdown file
 * (docs/guides/<slug>.md); `pnpm --filter demo seo:check` compares the title, description and related
 * routes here (and in seo/meta.ts) with the file's front matter, so the two cannot drift apart.
 */

import { guideDates } from "./guide-dates";

export type GuideInfo = {
  slug: string;
  /** Short name for the sidebar and link lists. */
  name: string;
  /** The article's h1 (the first heading of the Markdown file). */
  title: string;
  /** Front-matter description; also the meta description. */
  description: string;
  /** ISO date the guide was first published (front matter `published`). */
  published: string;
  /** ISO date of its last change (front matter `updated`). */
  updated: string;
  /** Docs routes the guide is about: it links to them, and they link back from "Related guides". */
  related: string[];
};

/** Install reference first, then the glassmorphism how-tos, then Motion, then comparisons and AI. */
const guideList: Omit<GuideInfo, "published" | "updated">[] = [
  {
    slug: "install-frameworks",
    name: "Install in Next.js and Vite",
    title: "Install SheenUI Glass Components in Next.js and Vite",
    description:
      "Tested install steps for SheenUI in Next.js App Router and Vite (React Router or TanStack Router): the shadcn CLI, the packed package, or copying files.",
    related: ["/components/button", "/components/dialog", "/components/tabs", "/components/data-table", "/foundations"],
  },
  {
    slug: "glassmorphism-react-tutorial",
    name: "Glassmorphism React tutorial",
    title: "Glassmorphism in React: A Step-by-Step Tutorial",
    description:
      "Glassmorphism in React is a frosted-glass UI style: a tint, backdrop-filter blur and light border. Build it in CSS, Tailwind v4 and React, with contrast.",
    related: [
      "/components/glass-card",
      "/foundations",
      "/components/button",
      "/blocks/glass-login",
      "/navigation/navbar",
      "/dashboards/web-analytics",
    ],
  },
  {
    slug: "liquid-glass-css-react",
    name: "Liquid Glass in CSS and React",
    title: "Apple Liquid Glass in CSS and React",
    description:
      "Liquid Glass CSS for React: Apple's iOS 26 look with an SVG displacement map, plus a frosted fallback for Safari and Firefox. Working code.",
    related: [
      "/effects/liquid-glass",
      "/components/glass-card",
      "/components/button",
      "/navigation/navbar",
      "/foundations",
    ],
  },
  {
    slug: "accessible-glassmorphism",
    name: "Accessible glassmorphism",
    title: "Accessible Glassmorphism",
    description:
      "Glassmorphism accessibility in React: WCAG contrast on glass, prefers-reduced-transparency, prefers-contrast, forced colors and reduced motion, with code.",
    related: [
      "/components/glass-card",
      "/foundations",
      "/components/switch",
      "/effects/liquid-glass",
      "/components/button",
    ],
  },
  {
    slug: "glassmorphism-vs-liquid-glass",
    name: "Glassmorphism vs Liquid Glass",
    title: "Glassmorphism vs Liquid Glass vs Neumorphism",
    description:
      "Glassmorphism vs Liquid Glass vs Neumorphism: how each works in CSS, browser support, accessibility and cost, when to use which, with React code.",
    related: ["/components/glass-card", "/effects/liquid-glass", "/foundations", "/components/button"],
  },
  {
    slug: "backdrop-filter-performance",
    name: "backdrop-filter performance",
    title: "backdrop-filter Performance: Fast Glassmorphism",
    description:
      "backdrop-filter performance, measured: what blur costs, why a moving backdrop is the real problem, rules for fast glass, and a lite mode for weak devices.",
    related: [
      "/components/glass-card",
      "/effects/liquid-glass",
      "/foundations",
      "/dashboards/web-analytics",
      "/charts",
    ],
  },
  {
    slug: "accessible-react-charts",
    name: "Accessible React charts",
    title: "Accessible React Charts",
    description:
      "Accessible React charts with a table fallback: color-blind-safe palettes, keyboard reading, screen-reader summaries, never relying on color. Tested code.",
    related: ["/charts", "/charts/heatmap", "/charts/pie-chart", "/components/meter", "/dashboards/saas"],
  },
  {
    slug: "framer-motion-examples",
    name: "Framer Motion examples",
    title: "Framer Motion Examples: 12 Animated React Patterns",
    description:
      "12 Framer Motion examples for React in Motion (motion/react): springs, shared layouts, scroll reveals, drag, tilt, reduced motion. Copy-paste code.",
    related: [
      "/components/button",
      "/components/tabs",
      "/effects/morphing-dialog",
      "/components/toast",
      "/effects/number-ticker",
      "/effects/blur-in",
      "/effects/3d-tilt-card",
      "/effects/macos-dock",
    ],
  },
  {
    slug: "framer-motion-to-motion",
    name: "Framer Motion to Motion",
    title: "Framer Motion Is Now Motion",
    description:
      "Framer Motion to Motion migration: switch from framer-motion to the motion package and motion/react imports, with a codemod, Next.js notes and bundle size.",
    related: ["/components/tabs", "/components/toast", "/effects/number-ticker", "/effects/morphing-dialog"],
  },
  {
    slug: "base-ui-vs-radix",
    name: "Base UI vs Radix",
    title: "Base UI vs Radix UI for React in 2026",
    description:
      "Base UI vs Radix UI for React compared on checked data: component coverage, render prop vs asChild, release dates, shadcn support and migration notes.",
    related: ["/components/dialog", "/components/tabs", "/components/button", "/foundations"],
  },
  {
    slug: "best-glassmorphism-react-libraries",
    name: "Best glassmorphism libraries",
    title: "Best Glassmorphism React Libraries (2026)",
    description:
      "The best glassmorphism React libraries compared on checked data: components, Liquid Glass refraction, Safari fallback, accessibility, license, install.",
    related: ["/effects/liquid-glass", "/components/glass-card", "/components/dialog", "/foundations"],
  },
  {
    slug: "shadcn-alternatives",
    name: "shadcn alternatives",
    title: "shadcn Alternatives with Animation: Nine Libraries Compared (2026)",
    description:
      "shadcn alternatives with animation, glass and charts, checked on 8 Nov 2026: license, install method, primitives and paid tiers for nine libraries.",
    related: ["/components/glass-card", "/effects/liquid-glass", "/charts", "/components/dialog"],
  },
  {
    slug: "glassmorphism-ui-prompt",
    name: "Glassmorphism UI prompts",
    title: "Glassmorphism UI Prompts for AI Coding Agents",
    description:
      "A glassmorphism UI prompt for Claude, Cursor and v0: copy-paste prompts, a rules file and a review checklist for accessible glass and Liquid Glass UI.",
    related: [
      "/components/glass-card",
      "/components/dialog",
      "/components/button",
      "/effects/liquid-glass",
      "/foundations",
    ],
  },
];

/** Every guide with its dates (guide-dates.ts). */
export const guides: GuideInfo[] = guideList.map((g) => {
  const dates = guideDates[g.slug];
  if (!dates) throw new Error(`guide-dates.ts has no dates for ${g.slug}`);
  return { ...g, ...dates };
});

export const guidePath = (slug: string) => `/guides/${slug}`;

/** The other guides that share the most related routes with `slug` (ties keep the order above). */
export function moreGuides(slug: string, count = 3): GuideInfo[] {
  const own = new Set(guides.find((g) => g.slug === slug)?.related);
  return guides
    .filter((g) => g.slug !== slug)
    .map((g, index) => ({ g, index, shared: g.related.filter((r) => own.has(r)).length }))
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, count)
    .map(({ g }) => g);
}

/** The guides that list `path` among their related routes (for a "Guides" card on that docs page). */
export function guidesFor(path: string): GuideInfo[] {
  return guides.filter((g) => g.related.includes(path));
}
