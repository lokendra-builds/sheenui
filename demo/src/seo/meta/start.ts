import { COUNTS } from "../counts";
import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Start" routes (and the pages that sit beside them). */
export const seoStart: Record<string, SeoMeta> = {
  "/404": {
    title: "Page not found (404)",
    description:
      "There is no page at this address on SheenUI, it may have moved or the link may be wrong. Start from the introduction, the components or the charts instead.",
    keyword: "",
    noindex: true,
  },
  "/": {
    title: "Glassmorphism & Liquid Glass React Components",
    description: `Free glassmorphism and Liquid Glass React components with Motion: ${COUNTS.components} components (${COUNTS.ui} UI, ${COUNTS.effects} effects), ${COUNTS.charts} charts and ${COUNTS.blocks} blocks for Tailwind v4 and shadcn.`,
    keyword: "glassmorphism react components",
    secondary: ["glassmorphism react library", "glassmorphism ui kit", "free glassmorphism components"],
  },
  "/foundations": {
    title: "Glass Design Tokens: Blur, Tint, Rim & Motion",
    description:
      "Glass design tokens behind SheenUI: blur, tint and rim at three levels, OKLCH colors, motion presets and solid fallbacks for reduced transparency.",
    keyword: "glass design tokens",
    h1: "Glass Design Tokens: Levels, Blur and Motion",
    intro:
      "Every SheenUI surface is built from a few design tokens (a tint, a backdrop blur and a lit rim at three glass levels), with motion tokens beside them.",
    secondary: ["glassmorphism css", "backdrop-filter blur", "frosted glass css"],
  },
  "/showcase": {
    title: "React Component Showcase with Live Glass Demos",
    description:
      "An animated React component showcase: 21 live SheenUI stories, from a Button to a login lamp, on glass stages that pause off-screen and for reduced motion.",
    keyword: "react component showcase",
    h1: "Live React Component Showcase",
    intro:
      "This React component showcase puts 21 SheenUI stories on one page: each card is a live glass component on a lit stage, and every card links to its docs page.",
    secondary: ["react animation examples", "animated ui components react", "glassmorphism ui examples"],
  },
  "/docs/forms": {
    title: "React Hook Form + Zod with Glass Inputs",
    description:
      "A React form recipe: react-hook-form and zod with SheenUI Field, validation messages, focus on error, an async submit and every control via Controller.",
    keyword: "react hook form zod",
    h1: "Forms with React Hook Form and Zod",
    intro:
      "A form recipe for React with react-hook-form and zod: SheenUI's Field wires labels and errors, every control forwards ref and onBlur, and the submit button shows the async state.",
    secondary: ["react-hook-form controller select", "zod form validation react", "accessible form errors react"],
  },
  "/docs/installation": {
    title: "Install Glassmorphism Components with shadcn CLI",
    description:
      "Add SheenUI's glassmorphism components to any React 19 + Tailwind CSS v4 app with one shadcn CLI command, or copy the source. Works with Vite and Next.js.",
    keyword: "shadcn glassmorphism components",
    h1: "Install shadcn Glassmorphism Components",
    intro:
      "Add SheenUI's shadcn glassmorphism components to a React 19 and Tailwind CSS v4 app with one shadcn command, or copy the source folders you need.",
    secondary: ["shadcn liquid glass", "shadcn registry glass", "copy paste react components"],
  },
  "/docs/base-ui": {
    title: "Base UI Components Styled with Glass & Motion",
    description:
      "SheenUI styles Base UI's accessible headless components with glass and Motion: Tailwind CSS v4 styling, keyboard and ARIA from Base UI. MIT.",
    keyword: "base ui components",
    h1: "Base UI Components Styled with Glass and Motion",
    intro:
      "SheenUI styles Base UI's accessible headless components with glass and Motion, so keyboard, focus and ARIA behavior comes from Base UI.",
    secondary: ["base ui shadcn", "styled base ui", "base ui tailwind"],
  },
  "/docs/tailwind-v4": {
    title: "Tailwind v4 Glass UI: Setup, Layers & Tokens",
    description:
      "Tailwind v4 glass UI in two CSS imports: no config file, the @source rule, layer order, @theme tokens, glass utilities and v3 changes. Vite and Next.js.",
    keyword: "tailwind v4 glass ui",
    h1: "Tailwind CSS v4 Glass UI: Setup, Layers and Tokens",
    intro:
      "A Tailwind v4 glass UI needs two CSS imports and no config file: the SheenUI stylesheet defines the glass tokens, the layer order, the motion variants and the dark variant.",
    secondary: ["tailwind css v4 setup", "tailwind v4 glassmorphism setup", "tailwind v4 custom variant dark"],
  },
  "/docs/dark-mode": {
    title: "React Dark Mode with Tailwind v4 and Glass",
    description:
      "Add dark mode to a React and Tailwind CSS v4 app with SheenUI: a data-theme switch, the system fallback, no flash on load and glass tuned for dark.",
    keyword: "react dark mode tailwind",
    h1: "React Dark Mode with Tailwind CSS",
    intro:
      "React dark mode with Tailwind CSS in SheenUI is one data-theme attribute that the tokens, the dark variant and the useTheme hook all read.",
    secondary: ["tailwind v4 dark mode data-theme", "react theme switcher no flash"],
  },
  "/docs/rtl": {
    title: "React RTL and Localisation: dir, Labels, Locale",
    description:
      "Right-to-left and localised React UI with SheenUI: set dir, use logical sides, translate strings through labels and format dates and numbers by locale.",
    keyword: "react rtl support",
    h1: "React RTL Support and Localisation",
    intro:
      "React RTL support in SheenUI needs no provider: components follow dir on the html element or any wrapper, so tab pills, arrow keys and drawers mirror, strings come from a partial labels prop and dates and numbers follow a locale prop.",
    secondary: ["react component library rtl", "react i18n labels prop", "react date picker locale arabic"],
  },
  "/about": {
    title: "About SheenUI: MIT Glass React Components",
    description:
      "SheenUI is an MIT-licensed, pre-1.0 library of glass React components by Lokendra Singh Rathore: what it is, its status, how it is tested, how to cite it.",
    keyword: "sheenui",
    h1: "About SheenUI: Glass React Components",
    intro:
      "SheenUI is a free, MIT-licensed library of glassmorphism and Liquid Glass React components, built on Base UI, Tailwind CSS v4 and Motion, at version 0.1 and not on npm.",
    secondary: ["sheenui author", "sheenui license", "who makes sheenui"],
  },
};
