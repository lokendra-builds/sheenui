Canonical: https://lokendra-builds.github.io/sheenui/effects/spotlight-card

# Spotlight Card: Cursor Glow Effect for React

URL: https://lokendra-builds.github.io/sheenui/effects/spotlight-card
Sidebar name: Spotlight card

A React spotlight card: a soft glow follows the pointer across glass, with a rim that catches the light, via CSS variables and no re-renders. Tailwind v4.

What it is: A spotlight card for React: a glass card lit by a soft glow that follows the pointer, written straight to CSS variables.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/spotlight.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Spotlight card

Files to copy from `theme/src/`:

- `components/spotlight/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/light-follower.ts`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: spotlight. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { SpotlightCard, SpotlightGroup } from "@/components/sheenui/spotlight/spotlight";
```

These examples also use badge, button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Badge, Button, SpotlightCard, SpotlightGroup } from "@sheenui/theme";
```

## SpotlightCard props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| color | string | a soft accent | Colour of the glow inside the card (any CSS colour). |
| level | 2 \| 1 \| 3 | 2 | Sets the glass level: 1 = subtle, 2 = cards (default), 3 = most opaque. |
| tint | boolean | false | Tints the surface with the accent colour. |
| diameter | number | the card's width, at most 380px | Sets the diameter of the glow in px. |
| rimColor | string | the accent | Sets the colour of the light on the rim. |
| rim | boolean | true | Makes the rim light up near the pointer. |

## SpotlightGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| ...props | div props | optional, no default | A plain div that shares one pointer with every SpotlightCard inside it. Lay the cards out with className. |

## Example 1 of 2: Feature grid

In a SpotlightGroup every card shares the pointer, so the rims of neighboring cards light up as you move between them. On touch screens the glow rests near the top of each card.

```tsx
import { SpotlightCard, SpotlightGroup } from "@/components/sheenui/spotlight/spotlight";
// Package build (after the first npm release, or a packed tarball): import { SpotlightCard, SpotlightGroup } from "@sheenui/theme";

const features = [
  { title: "Fast", body: "Compositor-only animation.", icon: "⚡" },
  { title: "Accessible", body: "Keyboard and screen reader tested.", icon: "♿" },
  { title: "Themeable", body: "Tokens for every color.", icon: "🎨" },
];

export function Example() {
  return (
    <SpotlightGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <SpotlightCard key={feature.title} className="p-6">
          <span className="grid size-10 place-items-center rounded-sheen-md bg-sheen-accent-soft text-sheen-accent">
            {feature.icon}
          </span>
          <h3 className="mt-4 font-semibold">{feature.title}</h3>
          <p className="mt-1 text-sm text-pretty text-sheen-fg-muted">{feature.body}</p>
        </SpotlightCard>
      ))}
    </SpotlightGroup>
  );
}
```

## Example 2 of 2: Custom colors, as a link

Any CSS color works for the glow and the rim. Keyboard focus inside the card lights it too.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { SpotlightCard } from "@/components/sheenui/spotlight/spotlight";
// Package build (after the first npm release, or a packed tarball): import { Badge, Button, SpotlightCard } from "@sheenui/theme";

export function Example() {
  return (
    <SpotlightCard
      tint
      color="color-mix(in oklab, var(--sheen-accent-2) 18%, transparent)"
      rimColor="var(--sheen-accent-2)"
      className="flex w-full max-w-sm flex-col gap-4 p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="pro" className="text-lg font-semibold">Pro</h3>
        <Badge tone="accent">Most popular</Badge>
      </div>
      <p className="text-4xl font-semibold tracking-tight">
        $24<span className="text-sm font-normal text-sheen-fg-muted">/mo</span>
      </p>
      <ul className="flex flex-col gap-2 text-sm text-sheen-fg-muted">
        <li>Unlimited projects</li>
        <li>Preview deployments</li>
        <li>Priority support</li>
      </ul>
      <Button render={<a href="#pricing" />} fullWidth>
        Choose Pro
      </Button>
    </SpotlightCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a plain card is not focusable. Keyboard focus inside the card lights it too, so interactive children are never in the dark. |

## Accessibility

- No role of its own; reading order is the DOM order. SpotlightGroup shares one pointer listener across the cards.
- The glow and rim are aria-hidden and hidden in forced colors. On touch screens the glow is static.

## When to use the spotlight card effect

- Use it as a cursor glow effect for a feature grid on a landing page, where a soft glow follows the pointer across each glass card and the rim lights up as the cursor nears an edge.
- Use it for pricing tiles or integration cards in a dashboard, with tint to give one accent-colored tile more weight than its neighbors.
- Wrap neighboring cards in SpotlightGroup so a card's rim picks up the light even while the pointer is still over the next card, as on Linear-style grids.
- Skip it when you want a calm surface or a card that physically leans: use GlassCard for static panels and TiltCard for 3D movement toward the pointer, since glow adds noise to dense lists.
- Pair it with SpotlightGroup for the grid, Badge for a plan label, and Button or Switch inside the cards, which keep their own focus rings while the glow reacts to focus.


## Frequently asked questions

### How do I make a spotlight card in React?

Render SpotlightCard like a div with padding. level (1 to 3, default 2) and tint pick the glass; size sets the glow diameter in px, defaulting to 90 percent of the card width up to 320px. color sets the glow, rimColor the edge light, and rim={false} removes the rim.

### How does it avoid re-rendering on every mouse move?

The pointer position is handled at most once per frame, with no React state, and written straight to the glow layers. Those layers are pre-painted gradients moved with translate, so a pointer move never repaints the card or touches its backdrop blur.

### What happens on touch screens and with the keyboard?

Tracking is mouse and pen only, because a finger dragging across a card is scrolling. Without hover the glow stays static near the top. A plain card is not focusable, but keyboard focus inside it lights it, so interactive children still get the glow.

### Is it accessible, and what about reduced motion?

The glow and rim are aria-hidden and hidden in forced colors. Text contrast is measured against the glass, not the glow. Reduced motion removes the fades. The card is one backdrop-filter surface, and the glow layers sit inside it behind your content.


## Related pages

- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)
- [Word rotate](https://lokendra-builds.github.io/sheenui/effects/word-rotate)
- [Animated beam](https://lokendra-builds.github.io/sheenui/effects/animated-beam)
- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)
- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
