Canonical: https://lokendra-builds.github.io/sheenui/effects/liquid-glass

# Liquid Glass UI for React (iOS 26 Style)

URL: https://lokendra-builds.github.io/sheenui/effects/liquid-glass
Sidebar name: Liquid glass

Apple Liquid Glass for React: real SVG refraction in Chrome and Edge, frosted fallback in Safari and Firefox. Tailwind v4 + Motion. Copy the source.

What it is: A Liquid Glass effect for React in the style of Apple's iOS 26 design: a lens that refracts the page behind it through an SVG displacement map, with a specular rim.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/liquid-glass.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Liquid glass

In this browser:Frosted fallback

Files to copy from `theme/src/`:

- `components/liquid-glass/`
- `hooks/{use-intersection.ts, use-media-query.ts, use-preferences.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: liquid-glass. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { LiquidGlass } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| shape | "circle" \| "rect" \| "pill" | "rect" | Outline of the lens. "rect" uses the element's own border radius (rounded-sheen-xl by default, override with className); "pill" and "circle" are fully rounded. |
| variant | "regular" \| "clear" | "regular" | "regular": frosted and tinted, for text and controls (legible on anything). "clear": barely tinted, most see-through. For icons and bold labels over media. |
| refraction | number | 1 | How strongly the rim bends the backdrop. 0 = flat glass, 1 = default, up to 2. |
| bezel | number | most of the corner radius (capped at 40) | Sets the width of the curved rim in px. |
| frost | number | 12 (regular) or 1 (clear) | Sets the frost inside the lens, in px. |
| saturation | number | 1.5 | Colour boost of the backdrop seen through the lens (1 = none). |
| aberration | number | 0 | Splits the refracted edge into its colours, like a prism (0 to 1). |
| specular | boolean | true | Adds a bright specular rim along the edge. |
| interactive | boolean | false | Grows slightly on hover and presses in on tap (scale only; none with reduced motion). |
| render | ReactElement \| function | <div /> | Render as another element: a button, a nav, a motion.div… |

## Example 1 of 3: Drag the lens

A clear circle lens over crisp artwork. Drag it (or focus it and use the arrow keys) and watch the lines bend and split into color at the rim.

```tsx
import { useRef, type KeyboardEvent } from "react";
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
// Package build (after the first npm release, or a packed tarball): import { LiquidGlass } from "@sheenui/theme";
import { motion, useMotionValue } from "motion/react";

const moves: Partial<Record<string, [number, number]>> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
// Written out here on purpose: the library's clamp is internal, and this example has to run on its own.
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function Example() {
  const areaRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Arrow keys move the lens (Shift for bigger steps), kept inside the artwork.
  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    const move = moves[event.key];
    const area = areaRef.current;
    if (!move || !area) return;
    event.preventDefault();
    const lens = event.currentTarget;
    const step = event.shiftKey ? 64 : 16;
    x.set(clamp(x.get() + move[0] * step, -lens.offsetLeft, area.clientWidth - lens.offsetLeft - lens.offsetWidth));
    y.set(clamp(y.get() + move[1] * step, -lens.offsetTop, area.clientHeight - lens.offsetTop - lens.offsetHeight));
  }

  return (
    <div ref={areaRef} className="relative h-96 overflow-hidden rounded-sheen-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400">
      <LiquidGlass
        shape="circle"
        variant="clear"
        aberration={0.6}
        render={
          <motion.div
            drag
            dragConstraints={areaRef}
            dragElastic={0.12}
            whileDrag={{ scale: 1.06 }}
            style={{ x, y }}
          />
        }
        tabIndex={0}
        role="group"
        aria-roledescription="movable lens"
        aria-label="Lens. Drag it, or use the arrow keys to move it."
        onKeyDown={nudge}
        className="absolute top-1/2 left-1/2 -mt-20 -ml-20 size-40 cursor-grab touch-none"
      />
    </div>
  );
}
```

## Example 2 of 3: Floating tab bar

A pill of regular liquid glass over scrolling content, the way iOS 26 floats its tab bars. Its tint thins out towards the rim, so the tiles visibly bend at the edge while the labels keep a solid backplate.

```tsx
import { useState } from "react";
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
// Package build (after the first npm release, or a packed tarball): import { LiquidGlass } from "@sheenui/theme";

const tabs = [
  { id: "all", label: "All", icon: null },
  { id: "albums", label: "Albums", icon: null },
  { id: "shared", label: "Shared", icon: null },
];

export function Example() {
  const [active, setActive] = useState("all");

  return (
    <div className="relative h-[26rem] overflow-hidden">
      <div role="region" aria-label="Photo library" tabIndex={0} className="h-full overflow-y-auto p-3 pb-28">
        {/* tiles */}
      </div>
      <LiquidGlass
        shape="pill"
        render={<nav aria-label="Library sections" />}
        className="absolute inset-x-3 bottom-3 mx-auto flex max-w-md justify-between gap-1 p-1.5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => setActive(tab.id)}
            className="flex min-h-12 flex-1 flex-col items-center justify-center rounded-sheen-full text-2xs font-semibold aria-[current=page]:text-sheen-accent"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </LiquidGlass>
    </div>
  );
}
```

## Example 3 of 3: Shapes and variants

Pill, circle and rounded rectangle, each with its own displacement map. Interactive glass grows a touch on hover and presses in on tap: only its scale ever animates.

```tsx
import { LiquidGlass } from "@/components/sheenui/liquid-glass/liquid-glass";
// Package build (after the first npm release, or a packed tarball): import { LiquidGlass } from "@sheenui/theme";
import { Play as PlayIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <LiquidGlass shape="pill" interactive render={<button type="button" />} className="h-12 px-6 text-sm font-semibold">
        Get started
      </LiquidGlass>

      <LiquidGlass
        shape="circle"
        interactive
        render={<button type="button" aria-label="Play" />}
        className="grid size-14 place-items-center [&>svg]:size-6"
      >
        <PlayIcon />
      </LiquidGlass>

      <LiquidGlass className="flex w-full max-w-72 flex-col gap-1 p-5">
        <p className="font-semibold">Now playing</p>
        <p className="text-sm text-sheen-fg-muted">Glass Animals · Heat Waves</p>
      </LiquidGlass>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: LiquidGlass is decoration. Give it role, tabIndex and handlers when it is a control; interactive adds a solid focus ring. |

## Accessibility

- Pure decoration around your content: text on a regular lens keeps 4.5:1 contrast on any backdrop, and the rim is decorative.
- The lens is Chromium only: Safari and Firefox keep the frosted blur. Reduced transparency, more contrast and forced colors give a solid surface; forced colors drop the rim.
- A draggable lens needs a keyboard alternative: the example moves with the arrow keys (Shift for bigger steps).

## All exports on this page

- LiquidGlass — Liquid glass: a lens that bends the page behind it, like Apple's Liquid Glass.
- MAX_REFRACTION_SURFACES — Refraction budget: SVG refraction on at most MAX_REFRACTION_SURFACES lenses at once, page-wide.
- supportsLiquidGlass — Whether this browser renders SVG filters in backdrop-filter (backdrop-filter: url(#id)).


## When to use the liquid glass effect

- Use it as a liquid glass effect for a few hero surfaces that sit over photos or video, such as a floating media control, a caption overlay or a navigation pill that visibly bends the page behind it in Chromium.
- Use shape="pill" for a floating action bar and shape="circle" for a round play button, with variant="clear" when the content is only an icon or a bold label over imagery.
- Add interactive when the lens is a control, so it grows slightly on hover and presses in on tap, and give it role, tabIndex and handlers yourself.
- Skip it when you have more than a handful of surfaces or ordinary cards: refraction is limited to three lenses per page, so GlassCard is the right tool for lists, grids and panels.
- Pair it with Button for the action inside the lens, GlassCard for everything else on the page, and the supportsLiquidGlass helper when you want to adjust copy or layout by engine.


## Frequently asked questions

### How do I use liquid glass in React, and does it work in every browser?

Render LiquidGlass with a shape and your content. The real refraction runs in Chromium through an SVG filter on backdrop-filter. Safari and Firefox draw nothing for that filter, so they get SheenUI frosted glass instead. supportsLiquidGlass() tells you which one you got.

### Why do only some of my lenses bend the background?

Refraction has a page-wide budget of three lenses near the viewport at once; the rest render as frosted glass until a slot frees up, and a lens that scrolls away hands over its slot. Treat it as an accent for hero surfaces, not a card style.

### Which props tune the look of the lens?

variant is regular (tinted, for text) or clear. refraction runs from 0 to 2 with a default of 1, bezel sets the rim width, frost the blur, saturation the color boost (1.5), aberration splits edge colors from 0 to 1, and specular toggles the bright rim.

### Is text on a lens readable, and what about reduced transparency?

Text on a regular lens is designed to keep 4.5:1 contrast on any backdrop. With reduced transparency, more contrast or no backdrop-filter support you get a solid surface, forced colors use system colors, and no displacement map is drawn. Only scale ever animates.


## Related pages

- [Glass card](https://lokendra-builds.github.io/sheenui/components/glass-card)
- [Foundations](https://lokendra-builds.github.io/sheenui/foundations)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)

### Guides that cover it

- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)
- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)
- [Glassmorphism vs Liquid Glass vs Neumorphism](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass)
- [backdrop-filter Performance: Fast Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/backdrop-filter-performance)
- [Best Glassmorphism React Libraries (2026)](https://lokendra-builds.github.io/sheenui/guides/best-glassmorphism-react-libraries)
- [shadcn Alternatives with Animation: Nine Libraries Compared (2026)](https://lokendra-builds.github.io/sheenui/guides/shadcn-alternatives)
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
