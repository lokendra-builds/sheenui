import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Guides" routes (and the pages that sit beside them). */
export const seoGuides: Record<string, SeoMeta> = {
  /* ---------- Guides ----------
   * The title, description and keywords of each guide repeat the front matter of docs/guides/<slug>.md
   * (`pnpm seo:check` fails when they differ). */
  "/guides": {
    title: "React Glass UI Guides and Tutorials",
    description:
      "Guides for accessible glass UI in React: glassmorphism, Liquid Glass with a Safari fallback, backdrop-filter speed, Motion, Base UI and installing SheenUI.",
    keyword: "react glass ui guides",
    h1: "React glass UI guides and tutorials",
    secondary: ["liquid glass react tutorial", "glassmorphism accessibility", "sheenui install"],
  },
  "/guides/install-frameworks": {
    title: "Install SheenUI Glass UI in Next.js and Vite",
    description:
      "Tested install steps for SheenUI in Next.js App Router and Vite (React Router or TanStack Router): the shadcn CLI, the packed package, or copying files.",
    keyword: "sheenui install nextjs",
    h1: "Install SheenUI Glass Components in Next.js and Vite",
    secondary: [
      "shadcn registry react glass components",
      "install glassmorphism components next.js",
      "tailwind css v4 next.js components",
    ],
  },
  "/guides/glassmorphism-react-tutorial": {
    title: "Glassmorphism React Tutorial: Step by Step",
    description:
      "Glassmorphism in React is a frosted-glass UI style: a tint, backdrop-filter blur and light border. Build it in CSS, Tailwind v4 and React, with contrast.",
    keyword: "glassmorphism react tutorial",
    h1: "Glassmorphism in React: A Step-by-Step Tutorial",
    secondary: [
      "how to make glassmorphism in react",
      "glassmorphism css backdrop-filter",
      "glassmorphism react example",
    ],
  },
  "/guides/liquid-glass-css-react": {
    title: "Liquid Glass CSS & React with Safari Fallback",
    description:
      "Liquid Glass CSS for React: Apple's iOS 26 look with an SVG displacement map, plus a frosted fallback for Safari and Firefox. Working code.",
    keyword: "liquid glass css",
    h1: "Apple Liquid Glass in CSS and React",
    secondary: ["apple liquid glass css", "liquid glass react safari", "ios 26 liquid glass css"],
  },
  "/guides/accessible-glassmorphism": {
    title: "Glassmorphism Accessibility: Contrast & Fallbacks",
    description:
      "Glassmorphism accessibility in React: WCAG contrast on glass, prefers-reduced-transparency, prefers-contrast, forced colors and reduced motion, with code.",
    keyword: "glassmorphism accessibility",
    h1: "Accessible Glassmorphism",
    secondary: ["accessible glassmorphism react", "prefers-reduced-transparency css", "glassmorphism contrast"],
  },
  "/guides/glassmorphism-vs-liquid-glass": {
    title: "Glassmorphism vs Liquid Glass vs Neumorphism",
    description:
      "Glassmorphism vs Liquid Glass vs Neumorphism: how each works in CSS, browser support, accessibility and cost, when to use which, with React code.",
    keyword: "glassmorphism vs liquid glass",
    h1: "Glassmorphism vs Liquid Glass vs Neumorphism",
    secondary: ["glassmorphism vs neumorphism", "glassmorphism vs claymorphism", "what is liquid glass"],
  },
  "/guides/backdrop-filter-performance": {
    title: "backdrop-filter Performance: Fast Glassmorphism",
    description:
      "backdrop-filter performance, measured: what blur costs, why a moving backdrop is the real problem, rules for fast glass, and a lite mode for weak devices.",
    keyword: "backdrop-filter performance",
    h1: "backdrop-filter Performance: Fast Glassmorphism",
    secondary: ["glassmorphism performance", "backdrop-filter blur lag", "css blur performance"],
  },
  "/guides/accessible-react-charts": {
    title: "Accessible React Charts with a Table Fallback",
    description:
      "Accessible React charts with a table fallback: color-blind-safe palettes, keyboard reading, screen-reader summaries, never relying on color. Tested code.",
    keyword: "accessible react charts",
    h1: "Accessible React Charts",
    secondary: ["colorblind safe chart colors", "react chart keyboard navigation", "chart accessibility"],
  },
  "/guides/framer-motion-examples": {
    title: "Framer Motion Examples for React: 12 Patterns",
    description:
      "12 Framer Motion examples for React in Motion (motion/react): springs, shared layouts, scroll reveals, drag, tilt, reduced motion. Copy-paste code.",
    keyword: "framer motion examples",
    h1: "Framer Motion Examples: 12 Animated React Patterns",
    secondary: ["motion react examples", "motion for react tutorial", "framer motion tutorial"],
  },
  "/guides/framer-motion-to-motion": {
    title: "Framer Motion to Motion: Migrating to motion/react",
    description:
      "Framer Motion to Motion migration: switch from framer-motion to the motion package and motion/react imports, with a codemod, Next.js notes and bundle size.",
    keyword: "framer motion to motion",
    h1: "Framer Motion Is Now Motion",
    secondary: ["motion/react import", "framer motion renamed motion", "migrate framer motion"],
  },
  "/guides/base-ui-vs-radix": {
    title: "Base UI vs Radix UI for React in 2026",
    description:
      "Base UI vs Radix UI for React compared on checked data: component coverage, render prop vs asChild, release dates, shadcn support and migration notes.",
    keyword: "base ui vs radix",
    h1: "Base UI vs Radix UI for React in 2026",
    secondary: ["radix ui alternative", "base ui or radix ui", "migrate radix to base ui"],
  },
  "/guides/best-glassmorphism-react-libraries": {
    title: "Best Glassmorphism React Libraries (2026)",
    description:
      "The best glassmorphism React libraries compared on checked data: components, Liquid Glass refraction, Safari fallback, accessibility, license, install.",
    keyword: "best glassmorphism react libraries",
    h1: "Best Glassmorphism React Libraries (2026)",
    secondary: ["best liquid glass react library", "glassmorphism library comparison", "react ui library 2026"],
  },
  "/guides/shadcn-alternatives": {
    title: "shadcn Alternatives with Animation in 2026",
    description:
      "shadcn alternatives with animation, glass and charts, checked on 8 Nov 2026: license, install method, primitives and paid tiers for nine libraries.",
    keyword: "shadcn alternatives",
    h1: "shadcn Alternatives with Animation: Nine Libraries Compared (2026)",
    secondary: ["shadcn ui alternatives 2026", "shadcn glass theme", "copy paste component libraries"],
  },
  "/guides/glassmorphism-ui-prompt": {
    title: "Glassmorphism UI Prompt for Claude, Cursor & v0",
    description:
      "A glassmorphism UI prompt for Claude, Cursor and v0: copy-paste prompts, a rules file and a review checklist for accessible glass and Liquid Glass UI.",
    keyword: "glassmorphism ui prompt",
    h1: "Glassmorphism UI Prompts for AI Coding Agents",
    secondary: ["liquid glass prompt claude", "glass ui skill", "shadcn mcp"],
  },
};
