Canonical: https://lokendra-builds.github.io/sheenui/effects/meteors

# Meteors Effect for React: Light Streaks on Cards

URL: https://lokendra-builds.github.io/sheenui/effects/meteors
Sidebar name: Meteors

A meteors effect for React: occasional streaks of light cross a card background, moved by transform only. Pauses off-screen and stops for reduced motion.

What it is: Meteors is a React effect that sends occasional streaks of light across a card or section background. Use it for quiet depth; each streak moves by transform and opacity only and stays still under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/meteors.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Meteors

Files to copy from `theme/src/`:

- `components/meteors/`
- `lib/{canvas-effects.ts, cn.ts}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{beat-animations.ts, beat.ts, gate.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: meteors. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Meteors } from "@/components/sheenui/meteors/meteors";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use badge, glass-card, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Badge, GlassCard, Meteors, Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| count | number | 12 | How many meteors share the field. Each one flies, then rests for a few seconds, so only a couple are ever in view at once. Capped at 24. |
| angle | number | 125 | Direction of travel in degrees, clockwise from pointing right: 90 flies straight down, 125 down and to the left, 45 down and to the right. |
| length | number | 140 | Length of a streak in px; each one varies a little around it. |
| duration | number | 1.6 | Seconds one flight takes, on average. |
| interval | number | 3.2 | Seconds a meteor rests between flights, on average; this is what keeps them occasional. |
| color | string | "var(--sheen-accent-2)" | Colour of the bright head, any CSS colour. |
| paused | boolean | false | Hold every streak where it is (they carry on from there when unpaused). |
| seed | number | 3 | Seed for the layout and timing, so the same card looks the same on the server and in the browser. |
| className | string | optional, no default | Adds extra classes to the overlay. It fills its relative parent and takes the parent's corner radius. |
| style | CSSProperties | optional, no default | Applies an inline style to the overlay. |

## Example 1 of 2: On a glass card

Meteors fills its relative parent, takes the parent's corner radius and clips to it. Put it before the content so the text sits above the streaks, and keep count low: a long interval is what keeps it occasional.

```tsx
import { useState } from "react";
import { Badge } from "@/components/sheenui/badge/badge";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Meteors } from "@/components/sheenui/meteors/meteors";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { Badge, GlassCard, Meteors, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
        <Meteors count={8} paused={paused} />
        <Badge className="relative">Launch week</Badge>
        <h2 className="relative mt-3 text-xl font-semibold">Ship the quiet details</h2>
        <p className="relative mt-1 text-sm text-sheen-fg-muted">A streak crosses now and then, never twice at once.</p>
      </GlassCard>
    </>
  );
}
```

## Example 2 of 2: Angle, length and rhythm

angle is the direction of travel in degrees clockwise from pointing right (90 is straight down). A shorter interval and more meteors make a shower; keep that for a one-off hero.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Meteors } from "@/components/sheenui/meteors/meteors";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Meteors } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="relative w-full max-w-sm overflow-hidden p-8">
      <Meteors count={14} angle={70} length={150} duration={1.2} interval={2.5} />
      <p className="relative text-sm">A faster shower at 70 degrees.</p>
    </GlassCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the layer is click-through and never takes focus. |

## Accessibility

- Decorative: the layer is aria-hidden. Streaks are thin and fade quickly; use paused where a card sits next to long text (WCAG 2.2.2).
- Reduced motion: nothing flies. Up to four faint still streaks stay as texture.
- Each streak is one element moved by transform and faded by opacity on the compositor, with no blur, mask or filter. They pause off-screen and in hidden tabs.
- The layout is seeded (seed), so the server and the browser render the same streaks and there is no hydration mismatch or layout shift.

## When to use the meteors effect

- Use it on a feature card or a section background to add a quiet sense of space, with a streak crossing now and then.
- Tune count, interval and angle: a long interval keeps it occasional, which is what makes it feel premium rather than busy.
- Put it behind glass content so the glass blurs the streaks, or above flat content; it clips to the parent's corner radius.
- Skip it on cards with a lot of text, or use paused; moving light near reading is distracting.
- Pair it with GlassCard, BorderBeam on the same card for a stronger moment, and Badge for a launch label.


## Frequently asked questions

### How do I add a meteor effect to a card in React?

Put Meteors inside a relative card. It fills the card, clips to its radius and sends up to 24 streaks across it, each flying for about a second and a half, then resting for a few seconds.

### Is it GPU friendly?

Each streak is one element moved by transform and faded by opacity on the compositor. Nothing blurs or filters, and it pauses off-screen and in hidden tabs.

### What does reduced motion do?

Nothing flies. A few faint still streaks stay as texture, and the layer is aria-hidden.

### How do I make the meteors rarer or change their direction?

Tune count, interval and angle: a longer interval keeps the streaks occasional, a lower count thins them out, and angle sets the direction they cross at. A quiet field reads as premium; a busy one competes with the text.


## Related pages

- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)
- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)
- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)
- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)
- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)
- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
