Canonical: https://lokendra-builds.github.io/sheenui/effects/scroll-progress

# Scroll Progress Bar for React: Reading Progress

URL: https://lokendra-builds.github.io/sheenui/effects/scroll-progress
Sidebar name: Scroll progress

A scroll progress bar for React: a thin scaleX bar tied to page or container scroll. Decorative by default, a named progressbar with a label. MIT.

What it is: ScrollProgress is a React effect: a thin bar that fills with page or container scroll through a scaleX transform. It is decorative by default and becomes a named progressbar only when you pass a label.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/scroll-progress.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Scroll progress

Files to copy from `theme/src/`:

- `components/scroll-progress/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: scroll-progress. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ScrollProgress } from "@/components/sheenui/scroll-progress/scroll-progress";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, ScrollProgress } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| placement | ScrollProgressPlacement | "top" | Fixed to the top or bottom edge of the viewport, or "inline" to sit in the flow (for example inside a card header or a sticky bar of your own). |
| container | RefObject<HTMLElement \| null> | the page | The scrollable element to follow. |
| thickness | number | 4 | Sets the height of the bar in px. |
| smooth | boolean | true | Ease the bar after the scroll with the scroll spring, so it glides instead of stepping. Ignored under reduced motion, where it follows the scroll exactly. |
| colorFrom | string | "var(--sheen-accent)" | Colour at the start of the bar, any CSS colour. |
| colorTo | string | "var(--sheen-accent-2)" | Colour at the leading end of the bar, any CSS colour. |
| label | string | optional, no default | Accessible name. Leave it out (the default) when the bar only decorates a page that already has a scrollbar: the bar is then hidden from assistive technology. Set it ("Reading progress") when the position matters, and the bar becomes a progressbar whose value updates in 5 % steps. |

## Example 1 of 2: Following a panel

container follows a scrollable element and placement="inline" keeps the bar in the flow, here above the content inside a glass card. With label the bar is exposed as a progressbar that updates in 5 % steps.

```tsx
import { useRef } from "react";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ScrollProgress } from "@/components/sheenui/scroll-progress/scroll-progress";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, ScrollProgress } from "@sheenui/theme";

export function Example() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <GlassCard className="w-full max-w-md overflow-hidden">
      <ScrollProgress placement="inline" container={scroller} label="Reading progress" />
      <div ref={scroller} className="h-72 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold">A long read</h2>
        <p className="mt-2 h-[48rem] text-sm text-sheen-fg-muted">Scroll this panel and watch the bar fill.</p>
      </div>
    </GlassCard>
  );
}
```

## Example 2 of 2: Fixed to the page

The default placement is the top edge of the viewport and follows the page scroll. This site shows it as a thin strip while you read; colours default to the accent tokens and can be overridden with colorFrom and colorTo.

```tsx
import { ScrollProgress } from "@/components/sheenui/scroll-progress/scroll-progress";
// Package build (after the first npm release, or a packed tarball): import { ScrollProgress } from "@sheenui/theme";

export function Example() {
  return <ScrollProgress thickness={4} />;
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable and never takes pointer events. |

## Accessibility

- Decision: decorative by default and aria-hidden, because browsers already show and announce scroll position and a role that changes on every scroll would be noise.
- Pass label only where the position carries meaning (a course, a long form): the bar becomes a progressbar with that name and a value that updates in 5 % steps, never on every pixel.
- Reduced motion: the bar still tracks the scroll exactly (a direct mapping, not an animation) but without the spring. In forced colors it uses the system highlight colour.
- The fill is a scaleX transform driven by the scroll position: no layout, no paint, no loop, so there is nothing to pause. It grows from the inline start in right-to-left pages.

## When to use the scroll progress effect

- Use it on long articles, docs and guides to show how far through the reader is, fixed to the top edge.
- Pass a container ref to follow a scrollable panel, or placement="inline" to put the bar inside your own header.
- Pass label only where position matters (a course or long form); the bar then becomes a progressbar updating in 5 % steps.
- Skip the label on ordinary pages; browsers already convey scroll position and a changing role would be noise.
- Pair it with TextReveal, a sticky header and Breadcrumb.


## Frequently asked questions

### How do I add a scroll progress bar in React?

Render ScrollProgress anywhere; it fixes itself to the top and fills with the page scroll through a scaleX transform. Use container for a scrollable panel and placement for bottom or inline.

### Is a scroll progress bar accessible?

By default it is decorative and aria-hidden. With label it is a named progressbar whose value changes in 5 % steps, so screen readers are not flooded. In forced colors it uses the system highlight.

### Does it follow reduced motion?

The bar still tracks the scroll exactly, since that is a direct mapping, but without the easing spring.

### How do I follow a panel instead of the whole page?

Pass the scrollable element as container, a ref such as useRef<HTMLDivElement>(null). placement can be top, bottom or inline: the first two fix the bar to the viewport edge, inline keeps it in the flow, for example in a card header. thickness sets the height in px (default 4).

### When should the bar have an accessible name?

Only when the position carries meaning, such as a reading-progress bar in a course or a long form. Pass label and it becomes a progressbar whose value updates in 5% steps. Without label the bar is aria-hidden, because browsers already show and announce scroll position.


## Related pages

- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)
- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)
- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
