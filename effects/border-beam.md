Canonical: https://lokendra-builds.github.io/sheenui/effects/border-beam

# Border Beam: Animated Gradient Border for React

URL: https://lokendra-builds.github.io/sheenui/effects/border-beam
Sidebar name: Border beam

An animated border beam for React: a comet of light runs around any rounded border at one steady speed, rests off-screen, stops for reduced motion. MIT.

What it is: Border beam is an animated gradient border for React: a comet of light that runs around a rounded edge at one steady speed. Use it as a glowing border animation to mark the recommended plan in a pricing table, so one GlassCard carries a comet of light around its edge while the other tiers stay calm.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/border-beam.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Border beam

Files to copy from `theme/src/`:

- `components/border-beam/`
- `hooks/{use-intersection.ts, use-media-query.ts, use-preferences.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: border-beam. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BorderBeam } from "@/components/sheenui/border-beam/border-beam";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Input } from "@/components/sheenui/input/input";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use button, glass-card, input, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/input.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BorderBeam, Button, GlassCard, Input, Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| duration | number | 8 | Seconds one lap around the border takes. |
| delay | number | 0 | Seconds before the first lap (lets several beams run out of step). |
| length | number | 120 | Length of the beam in px, measured along the border. |
| width | number | 1.5 | Sets the thickness of the ring in px. |
| colorFrom | string | "var(--sheen-accent)" | Sets the tail colour (any CSS colour). |
| colorTo | string | "var(--sheen-accent-2)" | Colour of the beam's bright head, any CSS colour; the tail fades in from colorFrom. |
| reverse | boolean | false | Runs the beam anticlockwise instead of clockwise. |
| double | boolean | false | Draws two beams on opposite sides. |
| glow | boolean | true | Soft halo around the beam (skipped for lite glass and reduced transparency). It moves by transform; nothing is blurred per frame. |
| track | boolean | true | Faint, static rim under the beam, so the border reads as lit even between laps. |
| offset | number | -1 | Distance from the parent's padding edge in px. -1 sits on a 1px border. |
| paused | boolean | false | Hold the beam where it is (it carries on from there when unpaused). |
| className | string | optional, no default | Adds extra classes to the beam element. |
| style | CSSProperties | optional, no default | Inline style for the beam element (for example custom properties). |

## Example 1 of 2: On a glass card

Drop it inside any positioned, rounded element: it takes the parent's radius and sits on its border. paused holds the beam exactly where it is.

```tsx
import { useState } from "react";
import { BorderBeam } from "@/components/sheenui/border-beam/border-beam";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { BorderBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause the beam" checked={paused} onCheckedChange={setPaused} />
      <GlassCard className="relative w-full max-w-sm p-6">
        <h3 id="deploying-to-production" className="font-semibold">Deploying to production</h3>
        <p className="text-sm text-sheen-fg-muted">Build 2f9c1a · 14 of 18 steps</p>
        <BorderBeam paused={paused} />
      </GlassCard>
    </>
  );
}
```

## Example 2 of 2: Wide bars, two beams, any color

On a wide search bar the beam keeps its pace along the long sides. double runs two beams on opposite sides; colors take any CSS color (here the warning and danger tokens).

```tsx
import { BorderBeam } from "@/components/sheenui/border-beam/border-beam";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Input } from "@/components/sheenui/input/input";
// Package build (after the first npm release, or a packed tarball): import { BorderBeam, Button, GlassCard, Input } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <div className="relative w-full max-w-xl rounded-sheen-md">
        <Input aria-label="Ask anything" placeholder="Ask anything…" leading={<SearchIcon />} />
        <BorderBeam length={160} duration={6} />
      </div>

      <Button variant="glass" size="lg" className="rounded-sheen-full">
        Upgrade
        <BorderBeam double duration={5} />
      </Button>

      <GlassCard className="relative p-5">
        2 alerts need attention
        <BorderBeam reverse duration={7} colorFrom="var(--sheen-warning)" colorTo="var(--sheen-danger)" />
      </GlassCard>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the beam is decoration. |

## Accessibility

- Purely decorative: aria-hidden, no focus, no pointer events, and hidden in forced colors.
- It sits on a card you provide, so contrast is that of the card. Under reduced motion it is a still beam lit on the top-left corner.

## When to use the border beam effect

- Use it on the recommended plan of a pricing table or one featured card in a grid, so a single comet of light circles that edge while its neighbours stay still.
- Use it on a focused input wrapper or a primary call-to-action button to show an AI prompt box is live or that a card is selected, without adding a heavy glow.
- Use double and reverse to make a featured tile look different from its neighbors, and delay to stagger several beams so they never run in lockstep.
- Skip it when the surface is not a rounded element you control or you need a static highlight; a plain border, or SpotlightCard for a hover-driven glow, fits better than a looping animation.
- Pair it with GlassCard as the parent, Badge for a Recommended label, and Button inside the card so the beam draws attention to the action rather than competing with it.


## Frequently asked questions

### How do I add a border beam in React?

Place BorderBeam as a child of a positioned, rounded element, such as a GlassCard with relative and a radius class. It fills its parent, takes the parent's border radius and is masked to a thin ring, so it never covers content or touches the parent's blur.

### Which props change the beam's speed, size and colors?

duration is seconds per lap (default 8), length is the beam length in px (120), and width is the ring thickness (1.5). colorFrom is the tail and colorTo the head, defaulting to the accent and teal. Also available: reverse, double, glow, track, offset and delay.

### Is it accessible, and does it hurt performance?

It is purely decorative: aria-hidden, not focusable, no pointer events, and hidden in forced colors. It pauses while off screen, and the halo moves by transform with nothing blurred per frame. The paused prop holds it in place until you release it.

### What does the border beam do with reduced motion, and how does it handle a wide bar?

Under reduced motion it shows a still beam lit on the top-left corner. The keyframes follow the real outline, so on a wide bar the beam keeps one speed and one length all the way round instead of racing along the long sides like a spinning gradient.


## Related pages

- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)
- [Shimmer text](https://lokendra-builds.github.io/sheenui/effects/shimmer-text)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
