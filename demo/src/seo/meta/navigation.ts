import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Navigation" routes (and the pages that sit beside them). */
export const seoNavigation: Record<string, SeoMeta> = {
  "/navigation/navbar": {
    title: "Glassmorphism Navbar for React & Tailwind",
    description:
      "A glassmorphism navbar for React: a floating Apple-style pill with a morphing highlight, or a full-width glass bar. Shrinks on scroll. Tailwind v4, MIT.",
    keyword: "glassmorphism navbar react",
    h1: "Glassmorphism Navbar for React",
    intro:
      "A glassmorphism navbar for React comes in two forms: a floating Apple-style pill whose highlight morphs between items, and a full-width top bar with a sliding underline.",
    secondary: ["floating navbar react", "glass navbar tailwind", "apple style navbar"],
  },
  "/navigation/navigation-menu": {
    title: "React Navigation Menu with Mega Dropdowns",
    description:
      "A glass React navigation menu with rich dropdown panels that resize and slide between items, hover intent and full keyboard support. Base UI, Tailwind v4.",
    keyword: "react navigation menu",
    h1: "React Navigation Menu",
    intro:
      "A glass React navigation menu whose items open rich dropdown panels, with hover intent, a panel that morphs between items, and full keyboard support.",
    secondary: ["mega menu react", "navbar dropdown tailwind", "base ui navigation menu"],
  },
  "/navigation/sidebar": {
    title: "React Sidebar with Collapsible Groups",
    description:
      "A glass React sidebar for app shells: collapsible groups, badges, a footer and an icon-rail mode. Accessible nav landmark, Tailwind CSS v4, MIT.",
    keyword: "react sidebar component",
    h1: "React Sidebar Component",
    intro: "A glass React sidebar for app shells with collapsible groups, badges and a collapsed icon rail.",
    secondary: ["sidebar tailwind", "app shell sidebar react", "collapsible sidebar react"],
  },
  "/navigation/vertical-nav": {
    title: "Glass Sidebar for React: Collapsible Icon Rail",
    description:
      "A glassmorphism sidebar for React with grouped items, icons and counts, a sliding active highlight and a collapsed icon-rail mode. Tailwind CSS v4, MIT.",
    keyword: "glass sidebar react",
    h1: "Glass Sidebar for React",
    intro:
      "A glass sidebar navigation for React with grouped items, icons and counts that collapses into an icon rail with tooltips.",
    secondary: ["react sidebar tailwind", "collapsible sidebar react", "icon rail navigation"],
  },
};
