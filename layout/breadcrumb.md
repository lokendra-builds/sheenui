Canonical: https://lokendra-builds.github.io/sheenui/layout/breadcrumb

# React Breadcrumb that Collapses When Narrow

URL: https://lokendra-builds.github.io/sheenui/layout/breadcrumb
Sidebar name: Breadcrumb

A responsive React breadcrumb: when the trail runs out of room the middle folds into a menu, measured before paint so it never flickers. Tailwind v4, MIT.

What it is: A responsive React breadcrumb whose middle items fold into a menu when space runs out, and unfold again when there is room.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/breadcrumb.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Breadcrumb

Files to copy from `theme/src/`:

- `components/breadcrumb/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, popup-a11y.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: breadcrumb. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Breadcrumb, type BreadcrumbItem } from "@/components/sheenui/breadcrumb/breadcrumb";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";
```

## Breadcrumb

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | BreadcrumbItem[] | required | The trail, root first. The last item is the current page. |
| separator | ReactNode | "chevron" | Between items: the presets "chevron", "slash" or "dot", or any node (rendered decoratively). |
| collapse | "auto" \| "never" | "auto" | "auto" folds middle items into a menu when the trail does not fit; "never" wraps instead. |
| maxItems | number | no limit | Always collapse when there are more items than this. |
| itemsBefore | number | 1 | Items always shown before the "…" menu. |
| itemsAfter | number | 1 | Items kept after the "…" when maxItems collapses (width-driven collapse keeps at least 1). |
| renderLink | ((item: BreadcrumbItem) => ReactElement) | optional, no default | Render every link as your router's link: (item) => <Link to={item.href!} />. |
| variant | "glass" \| "plain" | "plain" | Picks a "plain" text trail or a "glass" pill. |
| size | "sm" \| "md" | "md" | Sets the text and row size. |
| labels | Partial<BreadcrumbLabels> | defaultBreadcrumbLabels | Any UI string (i18n): nav and more. Give each breadcrumb on a page its own nav. Every other string, for translation: labels={{ nav: "…" }}; omitted keys keep the English of defaultBreadcrumbLabels. All 2 keys of BreadcrumbLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the <nav>. |

## BreadcrumbItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label | ReactNode | optional, no default | Sets the text shown for the item. |
| href | string | optional, no default | Link target. Without one (and for the last item) it is plain text. |
| icon | ReactNode | optional, no default | Shows an icon before the label. |
| iconOnly | boolean | false | Show only the icon; the label stays for screen readers. |
| textValue | string | optional, no default | Plain text for menu typeahead when the label is not a string. |
| render | ReactElement | optional, no default | Element for this one link (overrides renderLink). |
| id | string | optional, no default | Stable key that identifies the item between renders. |

## Example 1 of 3: Collapses to fit

Drag the slider: middle items fold into the “…” menu (arrow keys, typeahead and Escape work inside it) and come back as the row widens. The last item is the current page, with aria-current="page".

```tsx
import { Breadcrumb } from "@/components/sheenui/breadcrumb/breadcrumb";
// Package build (after the first npm release, or a packed tarball): import { Breadcrumb } from "@sheenui/theme";
import { House as HomeIcon } from "lucide-react";

export function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/", icon: <HomeIcon />, iconOnly: true },
        { label: "Acme workspace", href: "/acme" },
        { label: "Engineering", href: "/acme/engineering" },
        { label: "Platform team", href: "/acme/engineering/platform" },
        { label: "Projects", href: "/acme/engineering/platform/projects" },
        { label: "Q3 roadmap", href: "/acme/engineering/platform/projects/q3" },
        { label: "Launch checklist" }, // the current page
      ]}
    />
  );
}
```

## Example 2 of 3: Styles

A glass pill, slash and dot separators, a small size, and maxItems to always collapse long trails.

```tsx
import { Breadcrumb, type BreadcrumbItem } from "@/components/sheenui/breadcrumb/breadcrumb";
// Package build (after the first npm release, or a packed tarball): import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#projects" },
  { label: "SheenUI" },
];

const trail: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Acme", href: "#acme" },
  { label: "Engineering", href: "#engineering" },
  { label: "Platform", href: "#platform" },
  { label: "Billing service" },
];

export function Example() {
  // Several breadcrumbs on one page: give each nav its own name.
  return (
    <>
      <Breadcrumb variant="glass" items={items} labels={{ nav: "Breadcrumb (glass)" }} />
      <Breadcrumb separator="slash" items={items} labels={{ nav: "Breadcrumb (slash)" }} />
      <Breadcrumb separator="dot" size="sm" items={items} labels={{ nav: "Breadcrumb (dot)" }} />
      {/* maxItems always keeps the first item, a "…" menu and the last items */}
      <Breadcrumb maxItems={3} items={trail} labels={{ nav: "Breadcrumb (collapsed)" }} />
    </>
  );
}
```

## Example 3 of 3: Router links and translations

renderLink renders every link through your router, including the links inside the collapse menu. Every string the component adds is a prop.

```tsx
import { Breadcrumb, type BreadcrumbItem } from "@/components/sheenui/breadcrumb/breadcrumb";
// Package build (after the first npm release, or a packed tarball): import { Breadcrumb, type BreadcrumbItem } from "@sheenui/theme";
import { Link } from "react-router";

const items: BreadcrumbItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Projets", href: "/projets" },
  { label: "SheenUI" },
];

export function Example() {
  // Every link (inline and inside the "…" menu) renders as your router's Link.

  return (
    <Breadcrumb
      items={items}
      renderLink={(item) => <Link to={item.href!} />}
      labels={{ nav: "Fil d'Ariane", more: (n) => `Afficher ${n} pages masquées` }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move through the links and the "…" button. |
| Enter | Follow a link, or open the collapsed-items menu. |
| Arrow keys, typeahead, Escape | Work inside the menu as in any menu. |

## Accessibility

- A <nav aria-label="Breadcrumb"> with an ordered list; the last item has aria-current="page". Give a second breadcrumb on the page its own labels.nav.
- Separators are hidden from assistive tech. An icon-only item keeps its label for screen readers.
- The "…" menu lists the hidden pages as real links.

## All exports on this page

- Breadcrumb — Where the current page sits in the hierarchy.
- defaultBreadcrumbLabels — The English strings of Breadcrumb ("Breadcrumb" for the landmark, "Show N hidden pages" for the "…" button).


## When to use Breadcrumb

- Use it as a collapsible breadcrumb on a documentation or e-commerce page that sits several levels deep, such as Home, Products, Shoes, Running, so people can jump back to any ancestor without using the browser's Back button.
- Use maxItems with itemsBefore and itemsAfter for deeply nested file or category trees, where you always want the root and the current page visible and the middle folded into a menu.
- The collapse is measured before paint, so it suits responsive layouts where the same trail must fit a phone header and a wide desktop header without a flash of overflow.
- Skip it for linear multi-step flows such as checkout; Stepper shows progress and state there, and breadcrumbs describe site hierarchy rather than the order of tasks.
- Pair it with Navbar or Vertical nav for primary navigation, with Menu behavior already built in for the folded items, and with a page heading and Button actions below the trail.


## Frequently asked questions

### How do I build a react breadcrumb with SheenUI?

Pass an items array, root first, to Breadcrumb. Each item has a label and an optional href, and the last item is treated as the current page with aria-current="page" and no link. Choose separator chevron, slash or dot, or supply your own node.

### What happens when the trail is too long for the screen?

With collapse set to auto, the default, the middle items fold into a menu button, and they come back when the row widens. The hidden pages are listed as real links, and arrow keys, typeahead and Escape work in it. Set collapse to never to let the trail wrap instead.

### How do I use my router's Link and translate the labels?

Pass renderLink, for example (item) => <Link to={item.href!} />, and it is used for every link, including those in the collapse menu. A single item can override it with render. The labels prop holds the accessible names, nav and more(count), so you can translate them.

### Can I show an icon-only item such as a home icon?

Yes. Give an item in the items array an icon and set iconOnly, and only the icon is drawn while the label stays available to screen readers. When the label is not a plain string, add textValue so typeahead in the collapse menu has text to match.


## Related pages

- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)
- [Pagination](https://lokendra-builds.github.io/sheenui/layout/pagination)
- [Resizable panels](https://lokendra-builds.github.io/sheenui/layout/resizable)
- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)
- [Separator](https://lokendra-builds.github.io/sheenui/layout/separator)
- [Stepper](https://lokendra-builds.github.io/sheenui/layout/stepper)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
