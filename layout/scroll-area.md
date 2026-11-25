Canonical: https://lokendra-builds.github.io/sheenui/layout/scroll-area

# Custom Scrollbar for React: Glass Scroll Area

URL: https://lokendra-builds.github.io/sheenui/layout/scroll-area
Sidebar name: Scroll area

A React scroll area with custom glass scrollbars and fading edges that keeps native wheel, touch, keyboard and find-in-page scrolling. Base UI, MIT.

What it is: A React scroll area that keeps native scrolling but adds slim custom scrollbars in glass, with edges that fade only where there is more to see.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/scroll-area.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Scroll area

Files to copy from `theme/src/`:

- `components/scroll-area/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: scroll-area. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ScrollArea } from "@/components/sheenui/scroll-area/scroll-area";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, ScrollArea } from "@sheenui/theme";
```

## ScrollArea

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| overflowEdgeThreshold | number \| Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number; }> | 1 | The threshold in pixels that must be passed before the overflow edge attributes are applied. Accepts a single number for all edges or an object to configure them individually. |
| children | ReactNode | optional, no default | Holds the content that scrolls. |
| style | CSSProperties | optional, no default | Sets the inline styles for the root element. |
| className | string | optional, no default | Root element: give it a height (vertical) or width (horizontal). |
| orientation | "horizontal" \| "vertical" \| "both" | "vertical" | Which way the content scrolls. |
| fade | "mask" \| "none" \| "shadow" | "mask" | How the edges show there is more content. |
| fadeSize | number | 32 | Length of the edge fade, in px. |
| scrollbars | "always" \| "hover" | "hover" | "hover" (default): scrollbars appear on hover / scroll / focus. "always": always shown. |
| label | string | optional, no default | Accessible name for the scrollable region (adds role="region"). |
| viewportClassName | string | optional, no default | Adds classes to the scrolling element (Base UI Viewport). |
| contentClassName | string | optional, no default | Adds classes to the content wrapper inside the viewport. |
| viewportRef | Ref<HTMLDivElement> | optional, no default | Ref to the scrolling element, e.g. to scroll programmatically. |

## Example 1 of 3: Vertical

The top edge stays crisp until you scroll; the bottom fades while there is more. Tab to the list and use the arrow keys.

```tsx
import { ScrollArea } from "@/components/sheenui/scroll-area/scroll-area";
// Package build (after the first npm release, or a packed tarball): import { ScrollArea } from "@sheenui/theme";

const releases = [
  { version: "2.14.0", notes: "Stepper and Timeline." },
  { version: "2.13.0", notes: "Data table density." },
  { version: "2.12.0", notes: "Side drawer." },
];

export function Example() {
  // Round it like its card: the keyboard focus ring follows the radius.

  return (
    <ScrollArea className="h-72 rounded-b-sheen-lg" label="Release notes">
      <ul>{releases.map((r) => <li key={r.version}>
            <b>{r.version}</b> {r.notes}
          </li>)}</ul>
    </ScrollArea>
  );
}
```

## Example 2 of 3: Horizontal, with glass inside

Scroll shadows instead of a mask, so the cards keep their blur.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ScrollArea } from "@/components/sheenui/scroll-area/scroll-area";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, ScrollArea } from "@sheenui/theme";

const themes = ["Aurora", "Liquid", "Midnight", "Paper", "Sunset", "Mono"];

export function Example() {
  // Glass cards inside: use the "shadow" fade (a mask would stop their blur), and level 1 for a long
  // strip of small tiles (it has no blur of its own, so six tiles in view stay inside the glass budget).

  return (
    <ScrollArea orientation="horizontal" fade="shadow" label="Recently viewed">
      <ul className="flex w-max gap-3">
        {themes.map((t) => <li key={t}><GlassCard level={1} className="w-44 p-4">
              {t}
            </GlassCard></li>)}
      </ul>
    </ScrollArea>
  );
}
```

## Example 3 of 3: Both directions

A wide table in a fixed box. scrollbars="always" keeps the bars visible.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ScrollArea } from "@/components/sheenui/scroll-area/scroll-area";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, ScrollArea } from "@sheenui/theme";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const regions = [
  "Amsterdam", "Bengaluru", "Cape Town", "Dublin", "Frankfurt", "Jakarta", "London", "Montréal", "Mumbai", "Oregon",
  "Osaka", "Paris", "São Paulo", "Seoul", "Singapore", "Stockholm", "Sydney", "Tokyo", "Virginia", "Zürich",
];

export function Example() {
  return (
    <GlassCard className="w-full max-w-2xl overflow-hidden p-0">
      <ScrollArea orientation="both" className="h-80 rounded-sheen-lg" scrollbars="always" label="Usage by region">
        <table className="w-max text-start [:where(&)_th]:text-start text-sm">
          <thead className="text-xs text-sheen-fg-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Region
              </th>
              {months.map((m) => (
                <th key={m} scope="col" className="px-4 py-3 text-end font-medium">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region, r) => (
              <tr key={region} className="border-t border-sheen-border">
                <th scope="row" className="px-4 py-2.5 font-medium whitespace-nowrap">
                  {region}
                </th>
                {months.map((m, c) => (
                  <td key={m} className="px-4 py-2.5 text-end text-sheen-fg-muted tabular-nums">
                    {(((r + 3) * (c + 7) * 37) % 900) + 100}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </GlassCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Arrow keys, Page Up / Page Down, Home / End, Space | Scroll the focused area natively. |
| Tab | The viewport is focusable only while it can scroll, so keyboard users can reach it. |

## Accessibility

- Scrolling stays native (wheel, touch, keys, find-in-page); the viewport gets a name from label and role="region".
- Scrollbars appear on hover, while scrolling and while the viewport has keyboard focus; the focus ring is drawn inside the edge.
- The edge fades are decorative. Use fade="shadow" when glass cards sit inside, so their blur is not masked.

## When to use the scroll area

- Use it as a React scroll area for a fixed-height list inside a card, such as a notification list or a long set of options, where you want slim glass scrollbars instead of the browser's chunky default. It draws a glass scrollbar in CSS that matches the theme, instead of the browser default.
- Use orientation="horizontal" for a row of cards or chips that scrolls sideways, with fade="shadow" so the glass cards inside keep their backdrop blur.
- Use orientation="both" for a wide table in a fixed box with scrollbars="always", when users must see at a glance that the content continues in both directions.
- Skip it when the whole page scrolls; let the browser handle it. For a long list of thousands of rows, the windowed Chat list, which renders only the visible rows, or a paginated Data table is a better fit than scrolling a plain container.
- Pair it with GlassCard as the container, Separator between sections of the scrolled content, and Skeleton to hold the layout while the content loads.


## Frequently asked questions

### How do I add a custom scrollbar in React without breaking native scrolling?

Wrap the content in ScrollArea and give the root a height for vertical scrolling or a width for horizontal. Scrolling stays native, so wheel, touch, keyboard and find-in-page all work. Only the scrollbars are drawn by the component, and they show on hover, while scrolling and on focus.

### How does the keyboard reach a scroll area?

The viewport becomes focusable only while it can actually scroll, so Tab reaches it. Then the arrow keys, Page Up, Page Down, Home, End and Space scroll natively. Pass label to name the region for screen readers; the viewport gets role="region" and a focus ring inside its edge.

### What are the edge fades, and when should I turn them off?

The fade prop shows there is more to see: mask, the default, fades the content at the edges only where it can scroll, shadow draws scroll shadows, and none removes it. Use shadow when glass cards sit inside, because a mask would stop their blur. fadeSize defaults to 32px.

### How do I scroll to an item programmatically?

Pass a ref to viewportRef, which points at the scrolling element, and call scrollTo or scrollIntoView on it or on a child. Use viewportClassName and contentClassName to style the scroller and its content wrapper, and set the root's border radius so the keyboard focus ring matches.


## Related pages

- [Separator](https://lokendra-builds.github.io/sheenui/layout/separator)
- [Stepper](https://lokendra-builds.github.io/sheenui/layout/stepper)
- [Timeline](https://lokendra-builds.github.io/sheenui/layout/timeline)
- [Toolbar](https://lokendra-builds.github.io/sheenui/layout/toolbar)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
