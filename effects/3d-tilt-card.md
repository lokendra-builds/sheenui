Canonical: https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card

# 3D Tilt Card for React with Glare Effect

URL: https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card
Sidebar name: 3D tilt card

A 3D tilt card for React that leans toward the pointer on Motion springs, with a glare sliding across real glass. Still on touch and for reduced motion.

What it is: A 3D tilt card for React that leans toward the pointer, up to 8°, with a glare sliding across its glass surface on springs. Use it as a tilt effect for a hero tile or a featured product card that leans toward the pointer in 3D, with a glare and a rim light sliding across the glass.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/tilt-card.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > 3D tilt card

Files to copy from `theme/src/`:

- `components/tilt-card/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: tilt-card. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { TiltCard, TiltCardLayer } from "@/components/sheenui/tilt-card/tilt-card";
```

These examples also use badge: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Badge, TiltCard, TiltCardLayer } from "@sheenui/theme";
```

## TiltCard props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| level | 2 \| 1 \| 3 | 2 | Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque. |
| tint | boolean | false | Tints the surface with the accent colour. |
| maxTilt | number | 6 | Largest tilt in degrees, 0 to 8 (clamped). |
| glare | boolean | true | Draws a light that slides across the surface. |
| glareColor | string | a white light, stronger in light mode | Colour of the glare (any CSS colour, keep it translucent). |
| hoverScale | number | 1.02 | Scale while the pointer is on the card (1 for none). |
| perspective | number | 1000 | Distance to the "camera" in px: smaller is more dramatic. |
| style | CSSProperties | optional, no default | Inline styles for the card (merged with the tilt transform, which wins). |

## TiltCardLayer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| depth | number | 10 | How far (px) the layer drifts toward the pointer at the card's edge. Negative drifts away. |
| style | CSSProperties | optional, no default | Inline styles for the layer (the drift transform is added to them). |

## Example 1 of 2: Membership card

TiltCardLayer adds parallax: layers drift toward the pointer by their depth, so the card reads as layered without preserve-3d (which glass cannot use). A glare and a diagonal streak of light slide across the glass, and its edge catches the light nearest the pointer. Rest the pointer near a corner: the card holds still.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { TiltCard, TiltCardLayer } from "@/components/sheenui/tilt-card/tilt-card";
// Package build (after the first npm release, or a packed tarball): import { Badge, TiltCard, TiltCardLayer } from "@sheenui/theme";
import { Sparkles as SparkIcon } from "lucide-react";

export function Example() {
  return (
    <TiltCard tint className="flex aspect-[1.586] w-full max-w-sm flex-col p-5 sm:p-6">
      {/* Lights behind the content that drift the other way (negative depth). */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <TiltCardLayer
          depth={-14}
          className="absolute -top-1/3 -end-1/4 aspect-square w-3/4 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-accent)_30%,transparent),transparent)]"
        />
        <TiltCardLayer
          depth={-8}
          className="absolute -end-[15%] -bottom-1/2 aspect-square w-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--sheen-teal-500)_22%,transparent),transparent)]"
        />
      </span>
      <TiltCardLayer depth={6} className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="sheen-fill grid size-8 place-items-center rounded-sheen-sm text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]">
            <SparkIcon /> {/* any 16px svg icon */}
          </span>
          Sheen Pay
        </span>
        <Badge tone="accent">Pro</Badge>
      </TiltCardLayer>
      {/* The chip */}
      <TiltCardLayer depth={10} className="mt-3 sm:mt-5">
        <span aria-hidden className="block h-8 w-11 rounded-md border border-sheen-border [background:linear-gradient(135deg,var(--sheen-chart-4),var(--sheen-chart-2))] opacity-80" />
      </TiltCardLayer>
      <TiltCardLayer depth={16} className="mt-auto flex flex-col gap-1">
        <p className="font-sheen-mono text-base tracking-wider sm:text-lg">
          <span className="sr-only">Card ending in 0815</span>
          <span aria-hidden>4921 ···· ···· 0815</span>
        </p>
        <p className="text-sm text-sheen-fg-muted">Ada Lovelace · 09/29</p>
      </TiltCardLayer>
    </TiltCard>
  );
}
```

## Example 2 of 2: Pricing cards

A gentler tilt (maxTilt={5}) on cards that are links. The whole card is clickable through a stretched link, and keyboard focus shows a solid ring.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { TiltCard } from "@/components/sheenui/tilt-card/tilt-card";
// Package build (after the first npm release, or a packed tarball): import { Badge, TiltCard } from "@sheenui/theme";

export function Example() {
  const plans = [
    { name: "Starter", price: "$0", note: "For side projects", href: "#starter" },
    { name: "Pro", price: "$24", note: "For growing teams", href: "#pro", tint: true },
    { name: "Scale", price: "$79", note: "For serious traffic", href: "#scale" },
  ];

  return (
    <ul className="grid w-full gap-4 sm:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.name}>
          <TiltCard
            maxTilt={5}
            tint={plan.tint}
            className="relative flex flex-col gap-2 p-6 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sheen-focus"
          >
            <h3 className="flex items-center justify-between gap-2 font-semibold">
              {/* A stretched link: the whole card is clickable. */}
              <a href={plan.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                {plan.name}
              </a>
              {plan.tint && <Badge tone="accent">Popular</Badge>}
            </h3>
            <p className="text-3xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
            </p>
            <p className="text-sm text-sheen-fg-muted">{plan.note}</p>
          </TiltCard>
        </li>
      ))}
    </ul>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a plain card is not focusable. Interactive children keep their own tab stops, and the tilt never moves them out of reach. |

## Accessibility

- A plain div that does not change reading order. The tilt is transform-only and reads the pointer, not focus.
- It is off for touch (a finger on a card is scrolling) and under reduced motion; TiltCardLayer adds decorative depth.

## When to use the 3D tilt card effect

- Use it on a hero tile, a pricing card or a product card that should feel physical under the pointer: it tilts in 3D, and the glare and rim light slide across the glass as it moves.
- Use it for a pricing card or a profile showcase, wrapping the title in TiltCardLayer with a depth so it drifts toward the pointer and appears to float above the surface.
- Tune the motion with maxTilt (0 to 8 degrees), hoverScale and perspective, and set glare={false} when you want the lean without the light.
- Skip it when the card is large, dense or full of controls; a flat glow from SpotlightCard or a calm GlassCard is easier to read, and tilting a form makes it harder to aim.
- Pair it with TiltCardLayer for parallax, Badge for a Featured tag, and Button inside the card, whose tab stops and focus ring stay put while the card tilts.


## Frequently asked questions

### How do I build a 3D tilt card in React?

Render TiltCard with padding and optionally maxTilt, a value from 0 to 8 degrees with a default of 6. hoverScale defaults to 1.02, and perspective defaults to 1000 px, where a smaller number is more dramatic. level and tint choose the glass, like other cards.

### Does tilting break the glass blur?

No. The tilt is applied to the glass element itself, as a perspective, rotateX and rotateY transform, never to a wrapper, so the backdrop blur keeps working. TiltCardLayer fakes depth without preserve-3d, which glass cannot use, by drifting toward the pointer.

### Why does the card not shake when the pointer rests near a corner?

Whether the pointer is on the card is decided against the card's untilted box, not the tilted shape. A tilted corner pulls in a few pixels, and testing against the moving shape would make the card jitter. It also eases into the lean even when entering at an edge.

### What happens on touch and with reduced motion?

Tilt is off for touch, since a finger on a card is scrolling, and under reduced motion; you then get a still glass card. The glare, streak and rim are aria-hidden and hidden in forced colors, and the glare sits behind your content so text stays crisp.


## Related pages

- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)
- [Word rotate](https://lokendra-builds.github.io/sheenui/effects/word-rotate)
- [Animated beam](https://lokendra-builds.github.io/sheenui/effects/animated-beam)
- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)
- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)
- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
