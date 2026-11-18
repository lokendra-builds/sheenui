Canonical: https://lokendra-builds.github.io/sheenui/navigation/navbar

# Glassmorphism Navbar for React & Tailwind

URL: https://lokendra-builds.github.io/sheenui/navigation/navbar
Sidebar name: Navbar

A glassmorphism navbar for React: a floating Apple-style pill with a morphing highlight, or a full-width glass bar. Shrinks on scroll. Tailwind v4, MIT.

What it is: A glassmorphism navbar for React comes in two forms: a floating Apple-style pill whose highlight morphs between items, and a full-width top bar with a sliding underline.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/navbar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Navbar

Files to copy from `theme/src/`:

- `components/navbar/`
- `components/drawer/parts/sheet.tsx`
- `components/popover/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: navbar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Navbar } from "@/components/sheenui/navbar/navbar";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Navbar } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | NavbarItem[] | required | Takes the navigation items, in order. |
| value | string | required | Sets the value of the active item when controlled. |
| onValueChange | ((value: string) => void) | optional, no default | Called with an item's value when it is chosen (a plain left click on a link also calls it). |
| brand | ReactNode | optional, no default | Shows the logo or product name on the left. |
| actions | ReactNode | optional, no default | Buttons on the right (theme toggle, sign in, ...). |
| renderLink | ((props: NavLinkProps, item: NavbarItem) => ReactElement) | a plain <a> | Render items that have an href through your router's link component. See NavLinkProps. |
| shrinkOnScroll | number \| false | 24 | Once the page scrolls past this many px, the bar tightens and turns more opaque (the floating pill also shrinks a touch). false turns it off. |
| hideOnScroll | number \| boolean | false | Slide the bar out of view while scrolling down and bring it back on any scroll up. true starts hiding after 64px; pass a number for a different distance. Make the navbar sticky or fixed for this to make sense. |
| scrollContainer | RefObject<HTMLElement \| null> | optional, no default | Track this element's scroll instead of the window's (e.g. an app shell's scrolling <main>). |
| variant | "floating" \| "bar" | "floating" | "floating" = centred glass pill, highlight morphs between items (Apple style). "bar" = full-width top bar, a sliding underline marks the active item. |
| collapsible | boolean | true | When the items don't fit next to the brand and actions (phones, narrow containers), fold them into a menu button that opens a glass popover. false lets them scroll sideways instead. |
| labels | Partial<NavbarLabels> | defaultNavbarLabels | Every string, for translation: { menu: "Menu", name: "Main" } (accessible name of the menu button shown when the items are folded away, and the default landmark name). Every other string, for translation: labels={{ menu: "…" }}; omitted keys keep the English of defaultNavbarLabels. All 2 keys of NavbarLabels are listed in the key table under the props table. |
| aria-label | string | labels.name | Landmark name. Give each navigation on a page its own, e.g. "Main" and "Account". |
| className | string | optional, no default | Extra classes for the <nav> (position it with sticky, fixed or margins). |

## Example 1 of 3: Floating pill

Click the items to watch the highlight morph.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Navbar } from "@/components/sheenui/navbar/navbar";
// Package build (after the first npm release, or a packed tarball): import { Button, Navbar } from "@sheenui/theme";

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={[
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
        { value: "pricing", label: "Pricing" },
        { value: "blog", label: "Blog" },
      ]}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
    />
  );
}
```

## Example 2 of 3: Full-width bar

variant="bar": for app headers. The underline slides to the active item.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Navbar } from "@/components/sheenui/navbar/navbar";
// Package build (after the first npm release, or a packed tarball): import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  return (
    <Navbar
      variant="bar"
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm" variant="glass">Sign in</Button>}
    />
  );
}
```

## Example 3 of 3: Folds into a menu

When the items don't fit next to the brand and actions, they fold into a menu button. It opens a glass popover listing every item, with the current one checked; choosing one closes it and returns focus to the button. Pick a width to watch it fold and unfold.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Navbar } from "@/components/sheenui/navbar/navbar";
// Package build (after the first npm release, or a packed tarball): import { Button, Navbar } from "@sheenui/theme";

const items = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "pricing", label: "Pricing" },
  { value: "blog", label: "Blog" },
  { value: "docs", label: "Docs" },
  { value: "changelog", label: "Changelog" },
];

export function Example() {
  const [active, setActive] = useState("home");

  // Nothing to set up: the nav measures itself and folds when it must.

  return (
    <Navbar
      aria-label="Main"
      brand={<span>Sheen</span>}
      items={items}
      value={active}
      onValueChange={setActive}
      actions={<Button size="sm">Sign in</Button>}
      labels={{ menu: "Menu" }} // the menu button's name; collapsible={false} scrolls instead
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move through the brand, items and actions. |
| Enter | Follow a link or select an item. |
| Arrow Down / Arrow Up / Home / End | In the folded menu: move between items. |
| Escape | Close the folded menu and return focus to the menu button. |

## Accessibility

- A <nav> landmark: pass aria-label ("Main") and give a second bar a different name. The current item has aria-current="page".
- A bar hidden by hideOnScroll comes back when focus enters it, so keyboard users never tab into an off-screen bar.
- The folded menu button reports aria-expanded and is named by labels.menu. Targets are 44 px on touch screens.

## All exports on this page

- Navbar — Horizontal navigation.
- defaultNavbarLabels — The English NavbarLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use Navbar

- Use it as a floating navbar, the glass pill, for a marketing site header with four or five destinations, where the highlight morphing between Home, Work, Pricing and Blog gives the page a polished, app-like first impression.
- Use variant="bar" for the top of a dashboard or documentation app, where a full-width header with a sliding underline and a Sign in action on the right is what users expect.
- It suits sites that must work on phones without a second mobile menu, because items that no longer fit next to the brand and actions fold into a menu button on their own.
- Skip it when your destinations open rich dropdown panels with descriptions and images; Navigation menu is built for that, while this component is a flat list of links or buttons.
- Pair it with Button for the Sign in action, GlassCard for the page sections underneath, and Avatar in the actions slot to show the signed-in user.


## Frequently asked questions

### How do I build a glassmorphism navbar in React with SheenUI?

Import Navbar from @sheenui/theme and pass brand, items, value and onValueChange. The default variant is a floating glass pill with a morphing highlight. Add actions for a Button on the right, and position it with className, for example sticky or fixed plus top margin.

### What happens when the items do not fit on a small screen?

With collapsible left at its default of true, the navbar measures itself and folds the items into a menu button that opens a glass popover. The current item shows a checkmark, choosing one closes the popover, and ArrowDown, ArrowUp, Home and End move between items while Escape closes it. Set collapsible={false} to scroll the items sideways instead.

### How do I use it with React Router or Next.js links?

Give items an href and pass renderLink, a function that receives the link props and the item and returns your router's Link element. The same function renders the links inside the folded menu. Without renderLink, items with an href render as plain anchors. The component file starts with "use client".

### Can the navbar hide or shrink while I scroll?

Yes. shrinkOnScroll tightens the bar after 24px of scrolling by default, or pass false to disable it. hideOnScroll slides it away while scrolling down and brings it back on any upward scroll or when focus enters it. Use scrollContainer to track an inner scrolling element instead of the window.


## Related pages

- [Vertical nav](https://lokendra-builds.github.io/sheenui/navigation/vertical-nav)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Navigation menu](https://lokendra-builds.github.io/sheenui/navigation/navigation-menu)
- [Sidebar](https://lokendra-builds.github.io/sheenui/navigation/sidebar)

### Guides that cover it

- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)
- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
