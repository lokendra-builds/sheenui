import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Components" routes (and the pages that sit beside them). */
export const seoComponents: Record<string, SeoMeta> = {
  "/components/alert": {
    title: "React Alert Component: Info, Success, Warning",
    description:
      "A glass React alert component with info, success, warning and danger tones, an action and a dismiss button. Live-region roles, Tailwind CSS v4, MIT.",
    keyword: "react alert component",
    h1: "React Alert Component",
    intro:
      "A glass React alert component for inline messages, with four tones, an optional action and a dismiss button, announced by screen readers.",
    secondary: ["alert tailwind", "callout component react", "inline message react"],
  },
  "/components/avatar": {
    title: "React Avatar Component with Status & Initials",
    description:
      "A glass React avatar component with an image, a gradient-initials fallback and an online status dot. Accessible, Tailwind CSS v4, copy-paste source. MIT.",
    keyword: "react avatar component",
    h1: "React Avatar Component",
    intro:
      "A glass React avatar component that shows an image, falls back to gradient initials, and can show an online status dot.",
    secondary: ["avatar with status react", "avatar initials fallback", "glass avatar"],
  },
  "/components/badge": {
    title: "React Badge Component: Status & Count Badges",
    description:
      "Glass status and count badges for React and Tailwind CSS v4. Every status carries words, never color alone. Accessible, MIT, copy the source.",
    keyword: "react badge",
    h1: "React Badge",
    intro:
      "A React badge is a small glass label for status and counts that stays readable on any background and never relies on color alone.",
    secondary: ["status badge tailwind", "glass badge", "count badge react"],
  },
  "/components/button": {
    title: "Glass Button for React: Animated & Accessible",
    description:
      "Glassy React buttons with Motion: they lift on hover, press on tap, and filled ones catch a sweep of light. Base UI, Tailwind CSS v4, reduced-motion safe.",
    keyword: "glass button react",
    h1: "Glass Button for React",
    intro:
      "A glass button for React is a button that lifts on hover and presses down on tap, with a sweep of light across the filled variants, animated with Motion and kept still under reduced motion.",
    secondary: ["glassy button css", "animated button react", "glass button tailwind"],
  },
  "/components/button-group": {
    title: "React Button Group with Roving Focus",
    description:
      "A React button group: buttons joined into one control with squared inner corners, one tab stop and arrow-key navigation. Tailwind CSS v4, MIT.",
    keyword: "react button group",
    h1: "React Button Group",
    intro:
      "A React button group that joins related buttons into one control, with attached corners and arrow-key roving focus.",
    secondary: ["button group tailwind", "grouped buttons react", "toolbar buttons react"],
  },
  "/components/checkbox": {
    title: "Animated Checkbox for React (Indeterminate Too)",
    description:
      "An animated glass React checkbox whose check pops in with Motion, with an indeterminate state for select-all. Built on Base UI, styled with Tailwind v4.",
    keyword: "animated checkbox react",
    h1: "Animated Checkbox for React",
    intro:
      "An animated checkbox for React whose check pops in, with an indeterminate state for “select all”, built on Base UI's accessible checkbox.",
    secondary: ["react checkbox component", "indeterminate checkbox", "checkbox tailwind"],
  },
  "/components/combobox": {
    title: "React Combobox: Searchable Multi-Select (Select2)",
    description:
      "A Select2-style React combobox: type to filter, multi-select animated chips, groups, created options and async search. Built on Base UI + Tailwind CSS v4.",
    keyword: "react combobox with search",
    h1: "React Combobox With Search",
    intro:
      "A React combobox with search in the style of Select2: type to filter, pick one or many as animated chips, group or create options, or search a server as you type.",
    secondary: ["select2 react", "react multi select dropdown with search", "autocomplete react tailwind"],
  },
  "/components/data-table": {
    title: "React Data Table on TanStack Table v9 + Tailwind",
    description:
      "A glass React data table on TanStack Table v9: search, filters, multi-sort, pagination, row selection, CSV export and server mode. Accessible, free, MIT.",
    keyword: "react data table",
    h1: "React Data Table",
    intro:
      "A typed, accessible React data table on TanStack Table v9 with search, faceted filters, multi-sort, pagination, selection and CSV export, all in glass.",
    secondary: ["tanstack table tailwind", "react table with filters and pagination", "shadcn data table alternative"],
  },
  "/components/dialog": {
    title: "Animated React Modal Dialog with Glass Effect",
    description:
      "A glassmorphism React modal dialog that springs in with Motion. Focus trap, Escape to close and focus return come from Base UI. Tailwind CSS v4, MIT.",
    keyword: "react modal dialog",
    h1: "Glass Modal Dialog for React",
    intro:
      "A strong-glass React modal dialog that springs in with Motion, with focus trapping, Escape to close and focus return handled by Base UI.",
    secondary: ["glass modal", "animated modal react", "base ui dialog"],
  },
  "/components/glass-card": {
    title: "Glassmorphism Card Component for React & Tailwind",
    description:
      "A glassmorphism card for React and Tailwind CSS v4: three frosted glass levels, a pointer-following sheen and a solid fallback for reduced transparency.",
    keyword: "glassmorphism card",
    h1: "Glassmorphism Card",
    intro:
      "The glassmorphism card is SheenUI's basic frosted-glass surface for React: pick one of three blur levels, and a soft highlight follows the pointer.",
    secondary: ["glass card react", "glassmorphism card tailwind", "frosted glass card css"],
  },
  "/components/input": {
    title: "Glass Input Field for React with Label & Errors",
    description:
      "A glassmorphism text input for React with label, description and error wired for screen readers by Base UI Field, plus a soft focus glow. Tailwind v4.",
    keyword: "glass input react",
    h1: "Glass Input for React",
    intro:
      "A glass text input for React with its label, description and error message wired up for screen readers, and a soft accent glow on focus.",
    secondary: ["react input component", "text input with label and error", "input tailwind"],
  },
  "/components/otp-input": {
    title: "React OTP Input: Animated One-Time Code Field",
    description:
      "An animated React OTP input with paste, arrow keys and SMS autofill from Base UI's OTP field. Digits pop in, errors shake. Tailwind CSS v4, free, MIT.",
    keyword: "react otp input",
    h1: "React OTP Input",
    intro:
      "A React OTP input with one slot per digit, paste and SMS autofill, and Motion feedback: digits pop in, errors shake and success ripples.",
    secondary: ["otp input tailwind", "input-otp alternative", "verification code input react"],
  },
  "/components/popover": {
    title: "React Popover Component with Glass Panel",
    description:
      "A glassmorphism popover for React, anchored to a button for small forms and details. Escape and outside click close it. Base UI, Tailwind CSS v4, MIT.",
    keyword: "react popover",
    h1: "React Popover",
    intro:
      "A glass React popover anchored to its trigger, for small forms and details; Escape or a click outside closes it.",
    secondary: ["glass popover", "popover tailwind", "base ui popover"],
  },
  "/components/progress": {
    title: "Animated React Progress Bar (Indeterminate Too)",
    description:
      "A glass React progress bar with an accent fill and a slow sweep of light. Pass null for an indeterminate loading bar. Accessible, Tailwind CSS v4, MIT.",
    keyword: "react progress bar",
    h1: "React Progress Bar",
    intro:
      "A glass React progress bar with an accent fill and a sweep of light, plus an indeterminate mode for loading states.",
    secondary: ["animated progress bar tailwind", "indeterminate progress bar", "loading bar react"],
  },
  "/components/select": {
    title: "React Select Dropdown with Glass Menu",
    description:
      "A glassmorphism React select dropdown: the chevron flips, items drift in with Motion and typing jumps to an option. Built on Base UI and Tailwind CSS v4.",
    keyword: "react select dropdown",
    h1: "React Select Dropdown",
    intro:
      "A glass React select dropdown for picking one option, with type-to-jump and items that drift in; for search or multi-select, use the Combobox.",
    secondary: ["glass select", "custom select tailwind", "base ui select"],
  },
  "/components/slider": {
    title: "React Range Slider: Single & Dual Thumb",
    description:
      "A glass React slider for one value or a range: drag, click the track or use the arrow keys. Built on Base UI Slider and Tailwind CSS v4. Free and MIT.",
    keyword: "react range slider",
    h1: "React Range Slider",
    intro:
      "A glass React slider that picks a single value or a range by dragging, clicking the track or pressing the arrow keys.",
    secondary: ["react slider component", "dual range slider tailwind", "base ui slider"],
  },
  "/components/spinner": {
    title: "React Loading Spinner with Reduced Motion",
    description:
      "A React loading spinner in five sizes and three colors with a screen-reader label; it holds still as a static arc under reduced motion. Tailwind v4, MIT.",
    keyword: "react loading spinner",
    h1: "React Loading Spinner",
    intro:
      "A React loading spinner for work with no known length, announced politely and held still as a static arc under reduced motion.",
    secondary: ["spinner tailwind", "loading indicator react", "accessible spinner"],
  },
  "/components/switch": {
    title: "Animated React Toggle Switch with Motion",
    description:
      "An iOS-style React toggle switch: the thumb springs across a glass track with Motion and fills with the accent. Base UI, Tailwind CSS v4, free, MIT.",
    keyword: "react toggle switch",
    h1: "Animated Toggle Switch for React",
    intro:
      "An animated React toggle switch, an iOS switch in Tailwind, whose thumb springs across a glass track with Motion and fills with the accent color when on.",
    secondary: ["animated switch react", "ios switch tailwind", "framer motion switch"],
  },
  "/components/tabs": {
    title: "Animated Tabs for React with Sliding Pill",
    description:
      "Animated React tabs: a glass pill slides to the active tab, arrow keys move between tabs and long tab lists scroll. Base UI Tabs, Tailwind CSS v4, MIT.",
    keyword: "animated tabs react",
    h1: "Animated Tabs for React",
    intro:
      "Animated tabs for React are a Base UI tab list where a glass pill slides to the active tab, driven by the indicator variables, with full arrow-key support.",
    secondary: ["react tabs component", "sliding tab indicator", "tabs tailwind"],
  },
  "/components/toast": {
    title: "React Toast Notifications: Stack & Swipe",
    description:
      "Glass React toast notifications that stack, fan out on hover and swipe away, in any corner. Screen readers announce them. Motion + Tailwind v4, MIT.",
    keyword: "react toast notification",
    h1: "React Toast Notifications",
    intro:
      "A React toast is a glass notification that stacks, fans out on hover and can be swiped away, announced automatically to screen readers.",
    secondary: ["sonner alternative", "animated toast react", "toast tailwind"],
  },
  "/components/tooltip": {
    title: "React Tooltip Component with Glass Style",
    description:
      "A small glass tooltip for React that opens on hover and keyboard focus, with instant hand-off between tooltips. Base UI, Tailwind CSS v4, free, MIT.",
    keyword: "react tooltip",
    h1: "React Tooltip",
    intro:
      "A glass React tooltip that appears on hover and keyboard focus; inside a provider, moving between tooltips is instant.",
    secondary: ["tooltip tailwind", "glass tooltip", "base ui tooltip"],
  },
  "/components": {
    title: "Glass UI Components for React & Tailwind (Free)",
    description:
      "Free glass UI components for React: buttons, inputs, menus, dialogs, tables and more on Base UI and Tailwind CSS v4, animated with Motion. Copy the source.",
    keyword: "glass ui components",
    h1: "Glass UI Components for React",
    intro: "Glass UI components for React: buttons, forms, dialogs, menus and tables, ready to copy.",
    secondary: ["glass ui react", "react ui components tailwind", "glass ui library react"],
  },
};
