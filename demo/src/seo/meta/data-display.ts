import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Data display" routes (and the pages that sit beside them). */
export const seoDataDisplay: Record<string, SeoMeta> = {
  "/components/carousel": {
    title: "React Carousel with Swipe, Loop & Autoplay",
    description:
      "A glass React carousel: swipe, drag or flick with momentum, endless loop, responsive slides per view and autoplay that pauses on hover. Accessible, MIT.",
    keyword: "react carousel",
    h1: "React Carousel",
    intro:
      "A glass React carousel you can swipe, drag or flick, with an endless loop, responsive slides per view and autoplay that pauses on hover and focus.",
    secondary: ["react carousel with swipe", "image slider tailwind", "infinite loop carousel react"],
  },
  "/components/code-block": {
    title: "React Code Block with Copy Button & Highlighting",
    description:
      "A glass React code block with built-in syntax highlighting (no dependency), line numbers, diff lines, file tabs and a copy button. Tailwind CSS v4, MIT.",
    keyword: "react code block with copy button",
    h1: "React Code Block With Copy Button",
    intro:
      "A glass React code block with a small built-in syntax highlighter, line numbers, highlighted and diff lines, a file tab and a copy button.",
    secondary: ["syntax highlighter react", "code snippet component tailwind"],
  },
  "/components/empty-state": {
    title: "Empty State Component for React & Tailwind",
    description:
      "An animated empty state component for React: a glass orb springs in over soft rings with one clear next step, plus a compact row for tables. MIT.",
    keyword: "empty state component react",
    h1: "Empty State Component for React",
    intro:
      "An animated React empty state component that shows one clear next step when a page, list or search has nothing in it yet.",
    secondary: ["empty state ui", "no results state", "empty state tailwind"],
  },
  "/components/meter": {
    title: "React Meter: Usage, Quota & Password Strength",
    description:
      "A glass React meter for levels in a known range: storage, battery, signal or password strength. Green, amber or red by HTML meter rules. Base UI, MIT.",
    keyword: "react meter",
    h1: "React Meter",
    intro:
      "A glass React meter for a level inside a known range, such as storage, battery or password strength, that is spoken as well as colored.",
    secondary: ["password strength meter react", "storage usage bar", "base ui meter"],
  },
  "/components/table": {
    title: "React Table Component: Styled HTML Table",
    description:
      "Styled React table primitives for small static tables: real table elements in a glass region that scrolls sideways. Tailwind CSS v4, copy-paste, MIT.",
    keyword: "react table component",
    h1: "React Table Component",
    intro:
      "The React table component is a set of plain, styled table primitives for small static tables, in a glass region that scrolls sideways on narrow screens.",
    secondary: ["tailwind table component", "html table react", "simple table react"],
  },
  "/components/skeleton": {
    title: "React Skeleton Loader with Shimmer Effect",
    description:
      "Glass skeleton loaders for React that hold the exact layout while content loads, with one shimmer beam per group. Reduced-motion safe. Tailwind CSS v4.",
    keyword: "react skeleton loader",
    h1: "React Skeleton Loader",
    intro:
      "A glass React skeleton loader that holds the exact layout while content loads, so nothing jumps when it arrives.",
    secondary: ["skeleton loading tailwind", "shimmer loading react"],
  },
};
