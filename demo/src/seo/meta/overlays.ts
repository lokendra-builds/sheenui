import type { SeoMeta } from "./types";

/** The keyword-map rows of the "Overlays" routes (and the pages that sit beside them). */
export const seoOverlays: Record<string, SeoMeta> = {
  "/overlays/alert-dialog": {
    title: "React Alert Dialog for Confirmations",
    description:
      "A glass React alert dialog for actions that matter: it focuses the safe choice, shows a spinner while it runs and keeps errors visible. Base UI.",
    keyword: "react alert dialog",
    h1: "React Alert Dialog",
    intro:
      "A glass React alert dialog that asks before destructive actions, focuses the safe choice first and stays open with the error if the action fails.",
    secondary: ["confirm dialog react", "delete confirmation modal"],
  },
  "/overlays/command-palette": {
    title: "React Command Palette (Cmd+K) with Fuzzy Search",
    description:
      "A glass ⌘K command palette for React: fuzzy search with highlighted matches, recent picks, nested pages and arrow-key navigation. A cmdk alternative. MIT.",
    keyword: "react command palette",
    h1: "React Command Palette (⌘K)",
    intro:
      "A glass React command palette that opens with ⌘K or Ctrl+K, with fuzzy search, recent picks first and nested pages.",
    secondary: ["cmdk alternative", "cmd k menu react", "spotlight search react"],
  },
  "/overlays/context-menu": {
    title: "React Context Menu: Right-Click & Long-Press",
    description:
      "A glass right-click context menu for React that also opens on long-press and Shift+F10, sharing parts with the dropdown menu. Base UI, Tailwind CSS v4.",
    keyword: "react context menu",
    h1: "React Context Menu",
    intro:
      "A glass React context menu that opens on right-click, on long-press on touch screens, or with Shift+F10, right where you pressed.",
    secondary: ["right click menu react", "long press menu"],
  },
  "/overlays/drawer": {
    title: "React Drawer & Bottom Sheet with Swipe",
    description:
      "A glass React drawer and bottom sheet: drag handle, swipe to dismiss, snap points and safe-area insets, from any edge. Focus-trapped, Tailwind v4, MIT.",
    keyword: "react drawer",
    h1: "React Drawer and Bottom Sheet",
    intro: "A glass React drawer that slides in from any edge, with bottom sheets you can drag, snap and swipe away.",
    secondary: ["bottom sheet react", "swipe to dismiss sheet", "side sheet tailwind"],
  },
  "/overlays/dropdown-menu": {
    title: "Animated React Dropdown Menu with Submenus",
    description:
      "A glass React dropdown menu with icons, shortcuts, checkbox and radio items and submenus. The highlight glides with Motion. Base UI, Tailwind CSS v4, MIT.",
    keyword: "react dropdown menu",
    h1: "React Dropdown Menu",
    intro:
      "A glass React dropdown menu with icons, shortcuts, groups, checkbox and radio items and submenus, whose highlight glides from item to item.",
    secondary: ["dropdown menu tailwind", "animated dropdown react"],
  },
  "/overlays/hover-card": {
    title: "React Hover Card for Link & Profile Previews",
    description:
      "A glass React hover card that previews a profile or page on hover or focus, with a tap-to-open rule for touch screens. Base UI, Tailwind CSS v4, MIT.",
    keyword: "react hover card",
    h1: "React Hover Card",
    intro:
      "A glass React hover card that previews what is behind a link, opening on hover or keyboard focus after a short delay.",
    secondary: ["link preview react", "profile preview popover"],
  },
  "/overlays/kbd": {
    title: "Kbd Component for React Keyboard Shortcuts",
    description:
      "A Kbd component for React: write mod+k once and it shows ⌘K on Mac and Ctrl+K elsewhere, while screen readers hear key names. Tailwind CSS v4, MIT.",
    keyword: "kbd component react",
    h1: "Kbd Component for React",
    intro:
      "The Kbd component renders keyboard shortcuts as glass key caps in React, showing ⌘K on a Mac and Ctrl+K on Windows and Linux from one definition.",
    secondary: ["keyboard shortcut component", "kbd tailwind"],
  },
  "/overlays/menubar": {
    title: "React Menubar: Desktop-Style App Menu",
    description:
      "A glass desktop-style menubar for React (File, Edit, View) with arrow-key navigation and a tint that glides to the open menu. Base UI, Tailwind CSS v4.",
    keyword: "react menubar",
    h1: "React Menubar",
    intro:
      "A glass desktop-style React menubar with File, Edit and View menus, reached with one Tab stop and walked with the arrow keys.",
    secondary: ["desktop menu bar react", "app menu bar component"],
  },
  "/overlays/side-drawer": {
    title: "React Slide-Over Panel for Edit & Detail Views",
    description:
      "A glass React slide-over panel (side drawer) to view and edit records without leaving the page: validated form, unsaved-change guard, tabs, next/previous.",
    keyword: "react slide-over panel",
    h1: "React Slide-Over Panel (Side Drawer)",
    intro:
      "A glass React slide-over panel, or side drawer, that slides in to edit a record or show its details, with an edit form that guards unsaved changes.",
    secondary: ["side drawer react", "edit record drawer", "slide over tailwind"],
  },
};
