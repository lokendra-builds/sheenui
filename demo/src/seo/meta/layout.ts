import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Layout" routes (and the pages that sit beside them). */
export const seoLayout: Record<string, SeoMeta> = {
  "/layout/accordion": {
    title: "Animated Accordion for React with Spring Motion",
    description:
      "An animated React accordion: height follows a spring on open and a quick ease on close, the chevron turns and content drifts in. Base UI, Tailwind v4.",
    keyword: "animated accordion react",
    h1: "Animated Accordion for React",
    intro:
      "An animated React accordion whose sections open on a spring, with every trigger a real button in the tab order.",
    secondary: ["react accordion component", "faq accordion tailwind"],
  },
  "/layout/aspect-ratio": {
    title: "React Aspect Ratio Box for Images & Video",
    description:
      "A React aspect ratio component: a box that keeps its width-to-height ratio so images and video reserve space and the page never jumps. Tailwind v4, MIT.",
    keyword: "react aspect ratio",
    h1: "React Aspect Ratio Component",
    intro:
      "A React aspect ratio box that keeps images, video and maps at a fixed width-to-height ratio, preventing layout shift.",
    secondary: ["aspect ratio tailwind", "responsive video container react", "image placeholder ratio"],
  },
  "/layout/breadcrumb": {
    title: "React Breadcrumb that Collapses When Narrow",
    description:
      "A responsive React breadcrumb: when the trail runs out of room the middle folds into a menu, measured before paint so it never flickers. Tailwind v4, MIT.",
    keyword: "react breadcrumb",
    h1: "React Breadcrumb",
    intro:
      "A responsive React breadcrumb whose middle items fold into a menu when space runs out, and unfold again when there is room.",
    secondary: ["collapsible breadcrumb", "breadcrumb tailwind"],
  },
  "/layout/collapsible": {
    title: "React Collapsible with Animated Height",
    description:
      "A React collapsible section with an animated height, a turning chevron and closed content kept out of the tab order. Base UI, Tailwind CSS v4, MIT.",
    keyword: "react collapsible",
    h1: "React Collapsible Component",
    intro:
      "A React collapsible section that animates its height and keeps closed content out of the page and the tab order.",
    secondary: ["collapsible tailwind", "show more react", "expandable section react"],
  },
  "/layout/resizable": {
    title: "React Resizable Panels with Keyboard Handles",
    description:
      "Resizable panels for React with draggable, keyboard-accessible handles, min and max sizes and nesting. ARIA window splitter, Tailwind CSS v4, MIT.",
    keyword: "react resizable panels",
    h1: "React Resizable Panels",
    intro:
      "Resizable panels for React split a layout into regions with draggable, keyboard-resizable handles, size limits and nested groups.",
    secondary: ["split pane react", "resizable layout tailwind", "window splitter aria"],
  },
  "/layout/scroll-area": {
    title: "Custom Scrollbar for React: Glass Scroll Area",
    description:
      "A React scroll area with custom glass scrollbars and fading edges that keeps native wheel, touch, keyboard and find-in-page scrolling. Base UI, MIT.",
    keyword: "custom scrollbar react",
    h1: "Scroll Area with Custom Scrollbars for React",
    intro:
      "A React scroll area that keeps native scrolling but adds slim custom scrollbars in glass, with edges that fade only where there is more to see.",
    secondary: ["react scroll area", "glass scrollbar css"],
  },
  "/layout/separator": {
    title: "React Separator & Divider with Label",
    description:
      "A React separator for horizontal or vertical dividers, solid, fading or dashed, with an optional label. Built from borders, so High Contrast mode keeps it.",
    keyword: "react separator",
    h1: "Separator and Divider for React",
    intro:
      "A React separator for hairline dividers, horizontal or vertical, solid, fading or dashed, with an optional label.",
    secondary: ["divider with label tailwind", "react divider component"],
  },
  "/layout/stepper": {
    title: "React Stepper for Multi-Step Forms",
    description:
      "An animated React stepper for multi-step flows: lines fill as you advance, steps can be revisited or flag errors, and phones get a compact bar.",
    keyword: "react stepper",
    h1: "React Stepper",
    intro: "An animated React stepper for multi-step forms and checkouts that collapses to “Step 2 of 4” on phones.",
    secondary: ["multi step form react", "progress steps tailwind"],
  },
  "/layout/timeline": {
    title: "Animated React Timeline & Activity Feed",
    description:
      "An animated vertical timeline for React: markers pop in and lines draw down as events scroll into view. For audit logs, order tracking and changelogs. MIT.",
    keyword: "react timeline",
    h1: "React Timeline",
    intro:
      "An animated React timeline for activity feeds, audit logs, order tracking and changelogs that draws itself as you scroll.",
    secondary: ["activity feed react", "vertical timeline tailwind", "changelog timeline"],
  },
  "/layout/toolbar": {
    title: "Accessible React Toolbar with Toggle Groups",
    description:
      "A glass React toolbar with one tab stop and arrow-key navigation across buttons, toggles, menus and links, with a sliding pill for single-choice groups.",
    keyword: "react toolbar",
    h1: "React Toolbar",
    intro:
      "A glass React toolbar that groups related controls behind a single tab stop, moved through with the arrow keys.",
    secondary: ["editor toolbar react", "accessible toolbar roving tabindex"],
  },
  "/layout/pagination": {
    title: "React Pagination Component with Ellipses",
    description:
      "A glass React pagination component with ellipses, first and last buttons, crawlable page links and translatable labels. Accessible, Tailwind v4, MIT.",
    keyword: "react pagination component",
    h1: "React Pagination Component",
    intro:
      "A React pagination component with page numbers, ellipses and first, previous, next and last buttons in a labeled navigation landmark.",
    secondary: ["pagination tailwind", "react pagination with ellipsis"],
  },
};
