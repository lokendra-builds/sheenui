import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Forms" routes (and the pages that sit beside them). */
export const seoForms: Record<string, SeoMeta> = {
  "/forms/calendar": {
    title: "React Calendar Component, Localized with Intl",
    description:
      "A glass React calendar built on Intl: locale-aware week start, translated names, full keyboard navigation and a month/year jump. Tailwind CSS v4, MIT.",
    keyword: "react calendar",
    h1: "React Calendar",
    intro:
      "A glass React calendar built on Intl, so the week starts and the month names read the way the user's locale expects.",
    secondary: ["calendar tailwind", "localized calendar react", "accessible calendar"],
  },
  "/forms/color-picker": {
    title: "React Color Picker: Hex, RGB, HSL & Eyedropper",
    description:
      "A glass React color picker: saturation area, hue and opacity sliders, hex/RGB/HSL inputs, swatches and the eyedropper. Keyboard-accessible, Tailwind v4.",
    keyword: "react color picker",
    h1: "React Color Picker",
    intro:
      "A glass React color picker with a saturation area, hue and opacity sliders, typed hex, RGB and HSL values, swatches and the screen eyedropper.",
    secondary: ["color picker tailwind", "hex rgb hsl color picker", "eyedropper react"],
  },
  "/forms/date-picker": {
    title: "React Date Picker & Range Picker for Tailwind",
    description:
      "A glass React date picker and range picker: popover on desktop, swipe-to-close bottom sheet on phones, locale-aware and keyboard-friendly. Free, MIT.",
    keyword: "react date picker",
    h1: "React Date Picker",
    intro:
      "A glass React date picker that opens a calendar in a popover, or in a bottom sheet on phones, for single dates and ranges.",
    secondary: ["react date range picker", "date picker tailwind", "mobile date picker bottom sheet"],
  },
  "/forms/field": {
    title: "React Form Field with Label, Hint & Error",
    description:
      "A React form field component: label, description and error wired to any control with aria-describedby and aria-invalid. Works with react-hook-form.",
    keyword: "react form field component",
    h1: "React Form Field and Label",
    intro:
      "A composable React form field that wires a label, a description and an error message to any control, ready for react-hook-form.",
    secondary: ["react label component", "form field aria-describedby", "react-hook-form field"],
  },
  "/forms/file-upload": {
    title: "React File Upload: Drag & Drop with Progress",
    description:
      "A glass drag-and-drop file upload for React: validates type, size and count, with thumbnails, per-file progress, cancel and retry. Tailwind CSS v4, MIT.",
    keyword: "react file upload drag and drop",
    h1: "Drag-and-Drop File Upload for React",
    intro:
      "A glass drag-and-drop file upload for React that validates files on drop and lists each one with a thumbnail, progress bar, cancel and retry.",
    secondary: ["react dropzone", "file upload with progress bar", "file input tailwind"],
  },
  "/forms/input-group": {
    title: "React Input Group: Prefix, Suffix & Button",
    description:
      "A React input group that attaches a prefix, suffix, unit or button to a field inside one glass edge with a shared focus ring. Tailwind CSS v4, MIT.",
    keyword: "react input group",
    h1: "React Input Group Component",
    intro: "A React input group that attaches text, icons or buttons to a field and shares one focus ring.",
    secondary: ["input addon tailwind", "input with prefix react", "input suffix button"],
  },
  "/forms/number-field": {
    title: "React Number Input with Steppers & Formatting",
    description:
      "A glass React number input with hold-to-repeat steppers, a drag-to-scrub label and Intl formatting for currency, percent and units. Base UI, Tailwind v4.",
    keyword: "react number input",
    h1: "React Number Input",
    intro:
      "A glass React number input with steppers you can hold, a scrub label you can drag, and Intl formatting for currency, percentages and units.",
    secondary: ["number stepper react", "currency input react", "input number tailwind"],
  },
  "/forms/radio-group": {
    title: "React Radio Group & Radio Cards with Motion",
    description:
      "A glass React radio group with classic radio buttons or rich radio cards where the selection glides with Motion. Arrow keys from Base UI. Tailwind v4.",
    keyword: "react radio group",
    h1: "React Radio Group",
    intro:
      "A React radio group in two styles: glass dots whose pip springs out, or rich option cards where the selection glides from card to card.",
    secondary: ["radio card react", "custom radio button tailwind"],
  },
  "/forms/rating": {
    title: "React Star Rating Component with Half Stars",
    description:
      "An animated React star rating with hover preview, half steps and any icon. It's a radio group underneath, so keyboards and screen readers work. MIT.",
    keyword: "react star rating",
    h1: "React Star Rating",
    intro:
      "An animated React star rating with hover preview and half steps, built as a radio group so arrow keys and screen readers just work.",
    secondary: ["star rating tailwind", "half star rating react"],
  },
  "/forms/segmented-control": {
    title: "Segmented Control for React with Sliding Pill",
    description:
      "An iOS-style segmented control for React: a glass pill slides to the chosen segment with Motion and arrow keys move between options. Tailwind v4, MIT.",
    keyword: "segmented control react",
    h1: "Segmented Control for React",
    intro:
      "An iOS-style segmented control for React where a glass pill slides to the chosen segment and the arrow keys move between segments.",
    secondary: ["ios segmented control css", "toggle button group react"],
  },
  "/forms/tags-input": {
    title: "React Tags Input: Chips with Paste & Keyboard",
    description:
      "A glass React tags input: Enter or comma makes a chip, paste a list to add many, walk chips with arrow keys and remove with Backspace. Tailwind v4, MIT.",
    keyword: "react tags input",
    h1: "React Tags Input",
    intro:
      "A glass React tags input that turns typed text into chips, adds a pasted list at once and lets you walk and remove chips from the keyboard.",
    secondary: ["tag input component", "chips input react", "multi value input tailwind"],
  },
  "/forms/textarea": {
    title: "Auto-Resize Textarea for React with Counter",
    description:
      "An auto-resize textarea for React that grows with its content, with an optional character-counter ring and label, hint and errors for screen readers.",
    keyword: "auto resize textarea react",
    h1: "Auto-Resize Textarea for React",
    intro:
      "A glass React textarea that auto-resizes to fit its content and can show a character counter whose ring fills as you type.",
    secondary: ["textarea with character count", "textarea tailwind"],
  },
  "/forms/toggle": {
    title: "React Toggle Button & Toggle Group",
    description:
      "A React toggle button that stays pressed, with an accent tint that blooms from the center. Group toggles in a glass toolbar. Base UI, Tailwind v4, MIT.",
    keyword: "react toggle button",
    h1: "React Toggle Button",
    intro:
      "A React toggle button that stays pressed and is announced as “pressed”, and can be grouped in a glass toolbar.",
    secondary: ["toggle group react", "toolbar toggle tailwind"],
  },
};
