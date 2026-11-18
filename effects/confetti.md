Canonical: https://lokendra-builds.github.io/sheenui/effects/confetti

# Confetti for React: useConfetti Success Burst

URL: https://lokendra-builds.github.io/sheenui/effects/confetti
Sidebar name: Confetti

A confetti effect for React: fire a one-shot burst with useConfetti().fire(). Capped canvas, idle at zero cost, a still badge for reduced motion. MIT.

What it is: Confetti is a React effect that fires a one-shot burst of paper on demand with useConfetti().fire(), for success moments. It idles at zero cost and shows a still badge instead under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/confetti.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Confetti

Files to copy from `theme/src/`:

- `components/confetti/`
- `lib/{canvas-effects.ts, cn.ts}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: confetti. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Confetti, useConfetti } from "@/components/sheenui/confetti/confetti";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Confetti, useConfetti } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| count | number | 120 | Sets how many pieces each burst draws. |
| maxCount | number | 200 | The most pieces a single burst ever draws, whatever count asks for. Halved on weak devices. |
| spread | number | 75 | Sets the width of the fan in degrees. |
| angle | number | 90 | Direction of the centre of the fan in degrees, counter-clockwise from pointing right. |
| velocity | number | 720 | Sets the launch speed in px per second. |
| colors | string[] | the accent, second accent, success, warning and danger tokens | Sets the colours of the pieces, any CSS colours. |
| badge | ReactNode | optional, no default | Shown instead of a burst when reduced motion is on, in a polite live region, so the moment is still marked (and announced). Without it a reduced-motion fire() does nothing. |
| badgeDuration | number | 2.6 | Seconds the badge stays up. |
| className | string | optional, no default | Adds extra classes to the badge wrapper (a fixed, centred strip near the top). |

## Example: Fire from a button

origin takes an element (the burst starts at its centre) or a point of the viewport. Never let confetti be the only sign of success: the text below changes too. With reduced motion the badge appears at the top of the screen instead.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Confetti, useConfetti } from "@/components/sheenui/confetti/confetti";
// Package build (after the first npm release, or a packed tarball): import { Button, Confetti, useConfetti } from "@sheenui/theme";

export function Example() {
  const { ref, fire } = useConfetti();
  const [done, setDone] = useState(0);

  return (
    <>
      <Button
        onClick={(event) => {
          setDone((n) => n + 1);
          fire({ origin: event.currentTarget, count: 140, spread: 100 });
        }}
      >
        Place order
      </Button>
      <p className="text-sm text-sheen-fg-muted">{done === 0 ? "Nothing placed yet." : "Orders placed: " + done}</p>
      <Confetti ref={ref} badge="Order placed" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the canvas never takes pointer events, so the page stays usable during a burst. |

## Accessibility

- The canvas is decorative and aria-hidden. Always show text or a toast too; confetti is never the only sign of success.
- Reduced motion: fire() draws nothing. With the badge prop, a still message appears for badgeDuration seconds in a polite live region (role=status), so the moment is marked and announced.
- Nothing runs while idle. The loop exists only while pieces are in flight, then the canvas hides itself; a hidden tab ends the burst. Count is capped at 220 and halved on devices with little memory, few cores or Save-Data.
- The canvas lives in a portal on body, never inside a glass surface, so it cannot flatten any glass.

## When to use the confetti effect

- Use it for success moments: an order placed, a goal reached, an upload finished, fired from the handler that knows it worked.
- Fire from a button with origin set to that element so the burst starts where the user acted, or from a point of the viewport.
- Always show text or a toast as well; confetti is decoration and never the only sign of success.
- Skip it for routine actions, errors and anything repeated often; it should feel like an occasion.
- Pair it with Button, Toast and the badge prop, which shows a still message instead under reduced motion.


## Frequently asked questions

### How do I fire confetti in React?

Call useConfetti(), render <Confetti ref={confetti.ref} /> once, and call confetti.fire({ origin }) from an event handler. Options set count, spread, angle, velocity and colors.

### Does it cost anything while idle?

No. Nothing runs until fire() is called; the loop exists only while pieces are in flight, the canvas then hides itself, and a hidden tab ends the burst. The piece count is capped at 220 and halved on weak devices.

### What happens with reduced motion?

fire() draws nothing. If you pass badge, it appears for badgeDuration seconds in a polite live region so the moment is still marked and announced.

### Can I change where it starts, how many pieces fall and which colors?

Yes. origin is an element (the burst starts at its centre) or a point of the viewport such as { x: 0.5, y: 0.5 }. count defaults to 120 and is capped by maxCount (200, halved on weak devices), and spread, angle, velocity and colors take any CSS colors. Options passed to fire() override the props for that one burst.

### How do I stop a burst early?

Call confetti.clear(), for example when the route changes. It removes every piece at once.


## Related pages

- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)
- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)
- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)
- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)
- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)
- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
