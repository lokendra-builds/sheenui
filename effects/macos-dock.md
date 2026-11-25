Canonical: https://lokendra-builds.github.io/sheenui/effects/macos-dock

# macOS Dock for React with Magnification

URL: https://lokendra-builds.github.io/sheenui/effects/macos-dock
Sidebar name: macOS dock

A macOS-style dock for React: icons swell near the pointer and push neighbors apart, transform-only with no re-renders. A plain bar on touch screens. MIT.

What it is: A macOS dock for React with magnification: icons near the pointer swell and push their neighbors apart, with labels riding on top.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/dock.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > macOS dock

Files to copy from `theme/src/`:

- `components/dock/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: dock. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Dock, DockItem, DockSeparator } from "@/components/sheenui/dock/dock";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Dock, DockItem, DockSeparator, useToast } from "@sheenui/theme";
```

## Dock props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | Holds the dock items and separators. |
| label | string | "Dock" | Sets the accessible name of the toolbar. |
| labels | Partial<DockLabels> | defaultDockLabels | Translatable strings: labels.active ("open") is added to the accessible name of active button items, e.g. "Finder, open". Links use aria-current instead. Every other string, for translation: labels={{ active: "…" }}; omitted keys keep the English of defaultDockLabels. Its only key is listed in the key table under the props table. |
| size | "sm" \| "md" \| "lg" | "md" | Icon size at rest: sm 40px, md 48px or lg 56px (never below 44px on touch screens). |
| magnification | number | 1.6 | How much the icon under the pointer grows: 1 (off) to 2. Reduced to fit when there is little room beside the dock. |
| distance | number | 2.75 × size | How far the swell reaches either side of the pointer, in px. |
| side | DockSide | "bottom" | Which edge the dock sits on. Icons grow away from it, labels show on the far side. |
| notch | boolean | false | The active item lifts out of a round notch cut into the glass bar (the notch is part of the bar's own surface, not an overlay) and glides to the next active item with the snappy spring. Needs an active item; without one the bar is plain. Reduced motion: the notch and the lift jump. |
| className | string | optional, no default | Adds extra classes to the dock bar. |

## DockItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | required | Accessible name, and the label shown above the icon. |
| icon | ReactNode | required | The icon (an svg or an image). Sized to ~46% of the tile unless you size it. |
| href | string | optional, no default | Address to open on click: the tile then renders as a link (an anchor) instead of a button. |
| target | string | optional, no default | Link target, e.g. "_blank". |
| rel | string | optional, no default | Link relationship, e.g. "noopener". |
| render | ReactElement<unknown, string \| JSXElementConstructor<any>> | optional, no default | Render the link as another element, e.g. your router's <Link to="…" />. |
| onClick | ((event: MouseEvent<HTMLElement>) => void) | optional, no default | Called when the item is pressed or activated with Enter / Space. |
| active | boolean | false | Open app / current page: a dot under the icon. Links get aria-current="page"; buttons add labels.active of the Dock to their accessible name ("Finder, open"). |
| activeLabel | string | optional, no default | Overrides the Dock's labels.active for this item (i18n). |
| badge | ReactNode | optional, no default | A count or short text on the corner of the icon. |
| badgeLabel | string | the badge text | What screen readers hear for the badge, e.g. "3 unread". |
| bounce | boolean | false | Bounce like a launching app when activated (never with reduced motion). |
| disabled | boolean | false | Disable the item. It stays focusable, as in any toolbar. A disabled link item renders as a disabled button (a link cannot be disabled). |
| className | string | optional, no default | Classes for the item's outer slot (layout, margins). |
| tileClassName | string | optional, no default | Adds extra classes to the icon tile (background, colour). |

## DockSeparator props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | optional, no default | Adds extra classes to the separator slot. |

## Example 1 of 3: App dock

Move the pointer along it. Click an app to see it bounce. Keyboard: Tab into it, then arrow keys, Home and End; the focused app swells too, and Escape hides its label. Open apps (the dot) say so to screen readers: “Finder, open”. In a narrow window it turns into a plain bar that scrolls inside itself, with the label drawn above the bar.

```tsx
import type { ReactNode } from "react";
import { Dock, DockItem, DockSeparator } from "@/components/sheenui/dock/dock";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Dock, DockItem, DockSeparator, useToast } from "@sheenui/theme";
import {
  Calendar as CalendarIcon,
  MessageCircle as ChatIcon,
  Download as DownloadIcon,
  Smile as FaceIcon,
  Flower as FlowerIcon,
  Mail as MailIcon,
  Music as MusicIcon,
  Settings as GearIcon,
  Trash2 as TrashIcon,
} from "lucide-react";

type App = { label: string; icon: ReactNode; tile: string; active?: boolean; badge?: number; badgeLabel?: string };

const apps: App[] = [
  { label: "Finder", icon: <FaceIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-1))]", active: true },
  { label: "Mail", icon: <MailIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-7),var(--sheen-chart-3))]", badge: 3, badgeLabel: "3 unread" },
  { label: "Calendar", icon: <CalendarIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-8),var(--sheen-chart-2))]" },
  { label: "Music", icon: <MusicIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-5),var(--sheen-chart-8))]", active: true },
  { label: "Photos", icon: <FlowerIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-4),var(--sheen-chart-2))]" },
  { label: "Messages", icon: <ChatIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-chart-3),var(--sheen-chart-6))]" },
  { label: "Settings", icon: <GearIcon />, tile: "[background:linear-gradient(160deg,var(--sheen-ink-500),var(--sheen-ink-700))]" },
];

export function Example() {
  const toast = useToast();

  return (
    <Dock label="Apps" labels={{ active: "open" }}>
      {apps.map((app) => (
        <DockItem
          key={app.label}
          label={app.label}
          icon={app.icon}
          active={app.active}
          badge={app.badge}
          badgeLabel={app.badgeLabel}
          bounce
          onClick={() => toast.info(`Opening ${app.label}`)}
          tileClassName={`${app.tile} text-sheen-accent-fg`}
        />
      ))}
      <DockSeparator />
      <DockItem label="Downloads" icon={<DownloadIcon />} onClick={() => toast.info("Opening Downloads")} />
      <DockItem label="Trash" icon={<TrashIcon />} onClick={() => toast.info("Trash is empty")} />
    </Dock>
  );
}
```

## Example 2 of 3: Navigation links, at the top

Items with href are links (aria-current marks the active one). side="top" grows the icons downward with labels underneath. Smaller icons, a gentler swell.

```tsx
import { Dock, DockItem } from "@/components/sheenui/dock/dock";
// Package build (after the first npm release, or a packed tarball): import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  return (
    <Dock label="Sections" side="top" size="sm" magnification={1.45}>
      <DockItem label="Home" icon={<HomeIcon />} href="#home" active />
      <DockItem label="Search" icon={<SearchIcon />} href="#search" />
      <DockItem label="Library" icon={<FolderIcon />} href="#library" />
      <DockItem label="Profile" icon={<UserIcon />} href="#profile" />
    </Dock>
  );
}
```

## Example 3 of 3: Notch

With notch, the active item lifts out of a round notch cut into the glass bar and glides to the next active item. Click an icon to move it. Needs an active item.

```tsx
import { useState } from "react";
import { Dock, DockItem } from "@/components/sheenui/dock/dock";
// Package build (after the first npm release, or a packed tarball): import { Dock, DockItem } from "@sheenui/theme";
import { Folder as FolderIcon, House as HomeIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export function Example() {
  const [active, setActive] = useState("Home");
  const items = [
    { label: "Home", icon: <HomeIcon /> },
    { label: "Search", icon: <SearchIcon /> },
    { label: "Library", icon: <FolderIcon /> },
    { label: "Profile", icon: <UserIcon /> },
  ];

  return (
    <Dock label="Sections" notch>
      {items.map((item) => (
        <DockItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          active={active === item.label}
          onClick={() => setActive(item.label)}
        />
      ))}
    </Dock>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Enter or leave the dock once (one tab stop). |
| Arrow Left / Arrow Right | Move between items; the focused item is magnified with its label above. |
| Home / End | Jump to the first or last item. |
| Enter / Space | Press the focused item. |
| Escape | Hide the labels (WCAG 1.4.13); moving the pointer brings them back. |

## Accessibility

- A Base UI toolbar: roving focus, with aria-label on the dock and a name on each item (the label is also its accessible name).
- Magnification is decorative.
- Under reduced motion items do not scale; the label still shows on focus.

## All exports on this page

- Dock — Dock: a macOS-style launcher bar.
- DockItem — One icon in a Dock: a button, or a link when you give it an href (or render your router's <Link>).
- DockSeparator — A thin divider between groups of items (e.g.
- defaultDockLabels — The English strings of Dock.


## When to use the macOS dock effect

- Use it as a floating dock with magnification for an app launcher or quick-action bar in a desktop-style web app, where icons near the pointer swell and push neighbors apart like the macOS Dock.
- Use it as a floating bottom bar in a portfolio or a docs playground, with DockItem links to sections, a DockSeparator before utility items and a badge on an inbox icon.
- Set side="top" to pin the bar to the top edge instead of the default bottom; icons grow away from that edge and labels appear on the far side. Only top and bottom are supported, so use VerticalNav for a vertical rail.
- Skip it when you need editor controls or primary site navigation: use Toolbar for formatting controls and Navbar for site navigation, since magnification adds nothing to a menu of text links.
- Pair it with Dialog or MorphingDialog so an item opens a window-like panel, Badge for status elsewhere in the shell, and DockItem badge for counts; no Tooltip is needed because the dock draws its own labels.


## Frequently asked questions

### How do I build a macOS dock in React with SheenUI?

Wrap DockItem children in Dock and give the dock a label. Each DockItem needs a label and an icon, plus onClick or href. Use size for the resting icon size (default 48), magnification from 1 to 2 (default 1.6) and distance for how far the swell reaches.

### How do keyboard users and screen readers work with the dock?

It is a Base UI toolbar: one Tab stop, with arrow keys, Home and End moving between items. The focused item magnifies and shows its label; Escape hides the label. Each control carries its label as its accessible name, and active links get aria-current="page".

### What happens on touch screens or when there is no room to magnify?

The dock falls back to a plain bar on touch screens and coarse pointers, under reduced motion, and when there is too little room beside it. With limited room the swell is scaled down to fit. If the bar is wider than its container it scrolls inside itself.

### How do I mark an item as open or show a badge?

Set active on a DockItem to draw a dot under the icon. Links get aria-current, and buttons add labels.active to their name, such as Finder, open. The badge prop shows a count on the corner, and badgeLabel sets what screen readers hear, like 3 unread.


## Related pages

- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
