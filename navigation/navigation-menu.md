Canonical: https://lokendra-builds.github.io/sheenui/navigation/navigation-menu

# React Navigation Menu with Mega Dropdowns

URL: https://lokendra-builds.github.io/sheenui/navigation/navigation-menu
Sidebar name: Navigation menu

A glass React navigation menu with rich dropdown panels that resize and slide between items, hover intent and full keyboard support. Base UI, Tailwind v4.

What it is: A glass React navigation menu whose items open rich dropdown panels, with hover intent, a panel that morphs between items, and full keyboard support.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/navigation-menu.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Navigation menu

Files to copy from `theme/src/`:

- `components/navigation-menu/`
- `components/status-icons/`
- `lib/{cn.ts, popup-a11y.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: navigation-menu. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/sheenui/navigation-menu/navigation-menu";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@sheenui/theme";
```

## NavigationMenu props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| delay | number | 120 | How long to wait before opening the navigation popup. Specified in milliseconds. |
| closeDelay | number | 150 | How long to wait before closing the navigation popup. Specified in milliseconds. |
| children | ReactNode | optional, no default | NavigationMenuList and anything else that belongs in the nav. |
| popupClassName | string | optional, no default | Adds extra classes to the shared dropdown panel. |
| sideOffset | number | 10 | Distance between the bar and the panel, in px. |
| value / defaultValue | string \| null | optional, no default | Which item's panel is open (controlled / uncontrolled). Each item has a value. |
| onValueChange | (value: string \| null) => void | optional, no default | Called when the open item changes. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Sets the direction of arrow-key navigation. |
| aria-label | string | optional, no default | Names the nav landmark. |

## Parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| NavigationMenuList | ul props | optional, no default | The glass pill that holds the items; wraps on narrow screens. |
| NavigationMenuItem | li props + value? | optional, no default | One entry: a trigger with its content, or a link. |
| NavigationMenuTrigger | button props | optional, no default | Opens an item's panel; the chevron turns while it is open. |
| NavigationMenuContent | div props | optional, no default | What the panel shows for this item. Up to 36rem wide. |
| NavigationMenuLink | a props + active?, plain?, closeOnClick?, render? | optional, no default | A link; plain skips the pill styling for use inside a panel; render swaps in a router link. |

## NavigationMenuLink props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| plain | boolean | false | A block row with a hover tint instead of the bar's pill: for links inside a NavigationMenuContent panel. |

## Example: A site header with rich panels

Hover or focus Products: a featured card beside icon links. Move to Developers and the panel resizes while the content slides in from the side you came from.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/sheenui/navigation-menu/navigation-menu";
// Package build (after the first npm release, or a packed tarball): import { Button, NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@sheenui/theme";

const products = [
  { title: "Charts", text: "Accessible chart components, each with a data table." },
  { title: "Blocks", text: "Login, checkout, settings and notification centre." },
  { title: "Dashboards", text: "Five analytics templates with live data." },
];

export function Example() {
  return (
    <div className="glass-2 flex items-center gap-3 rounded-sheen-full py-2 ps-5 pe-2">
      <strong>Acme</strong>
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent className="w-[min(40rem,calc(100vw-2rem))]">
              <div className="grid gap-2 sm:grid-cols-[13rem_1fr]">
                <NavigationMenuLink plain href="#featured" className="flex flex-col justify-end gap-1 rounded-sheen-lg p-4 text-white [background-image:linear-gradient(160deg,var(--sheen-accent),oklch(55%_0.2_320))]">
                  <span className="text-base font-semibold">Liquid Glass</span>
                  <span className="text-xs">Real refraction for hero surfaces.</span>
                </NavigationMenuLink>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {products.map((p) => (
                    <li key={p.title}>
                      <NavigationMenuLink plain href={`#${p.title.toLowerCase()}`}>
                        <span className="block text-sm font-medium text-sheen-fg">{p.title}</span>
                        <span className="block text-xs text-sheen-fg-muted">{p.text}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active>Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Button size="sm" className="ms-auto">Sign in</Button>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Enters the bar; Tab again moves into an open panel's links and then out. |
| ← / → | Move between the items of the bar. |
| Enter / Space / ↓ | Open the focused item's panel and move into it. |
| Escape | Close the panel and return focus to its trigger. |

## Accessibility

- Renders a <nav> landmark: give it an aria-label ("Main", "Docs") so it is told apart from other navigation.
- Triggers are buttons with aria-expanded and aria-controls; links use aria-current="page" when active.
- The dropdown is not a menu role: it is a region of ordinary links, which is what site navigation should be.
- Hover opens after delay (120 ms) and closes after closeDelay (150 ms); clicking and the keyboard open it at once, so touch and keyboard users never depend on hover.
- On touch screens targets are 44px. Under reduced motion the panel fades and does not resize or slide.

## When to use the navigation menu

- Use it as a mega menu for a product site header where Products, Solutions and Resources each open a panel of titled links with short descriptions, the kind of mega-menu pattern that a flat list of links cannot carry.
- Use it for a documentation site whose top bar groups guides, API reference and examples, so visitors can scan every section from one shared glass panel without leaving the current page.
- The shared panel resizes to each item's content and slides between items, so it suits menus with panels of different sizes, from a three-link list to a grid up to 36rem wide.
- Skip it when you only have a handful of plain links with no dropdowns; Horizontal nav is simpler and folds into a menu on narrow screens, while Menu is the right tool for action lists.
- Pair it with Button for a call to action beside the bar, Badge for a New label inside a panel link, and Drawer to hold the navigation on phones.


## Frequently asked questions

### How do I build a react navigation menu with dropdown panels?

Compose NavigationMenu, NavigationMenuList and one NavigationMenuItem per entry. Inside an item put a NavigationMenuTrigger and a NavigationMenuContent holding NavigationMenuLink elements, or use a link directly for items with no panel. Give the root an aria-label such as Main.

### Is the dropdown a menu role? How does keyboard navigation work?

No. The panel is a region of ordinary links, which is what site navigation needs. Left and Right arrows move between bar items, Enter, Space or Down opens the focused item's panel and moves into it, Tab walks the panel's links, and Escape closes it and returns focus to the trigger.

### Does it only open on hover?

No. Hover opens a panel after the delay prop, 120 ms by default, and closes it after closeDelay, 150 ms, so crossing the bar does not flicker. Clicking or using the keyboard opens it immediately, so touch and keyboard users never depend on hover.

### How do I use my router's link component inside the panel?

NavigationMenuLink accepts a render prop that swaps the anchor for your router link. Use the plain prop to skip the pill styling when the link sits inside a panel, and closeOnClick to control whether choosing it closes the panel. Active links get aria-current="page".


## Related pages

- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)
- [Vertical nav](https://lokendra-builds.github.io/sheenui/navigation/vertical-nav)
- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Sidebar](https://lokendra-builds.github.io/sheenui/navigation/sidebar)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
