Canonical: https://lokendra-builds.github.io/sheenui/effects/orbiting-circles

# Orbiting Circles for React: Icons on Rings

URL: https://lokendra-builds.github.io/sheenui/effects/orbiting-circles
Sidebar name: Orbiting circles

Orbiting circles for React: icons or avatars circle a centre on rings with transform only. Holds still on hover and focus, static for reduced motion.

What it is: OrbitingCircles is a React effect that spins icons or avatars around a centre on rings, using transform only. Use it for integration sections; it holds still on hover and focus and is static under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/orbiting-circles.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Orbiting circles

Files to copy from `theme/src/`:

- `components/orbiting-circles/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/gate.ts`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: orbiting-circles. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { OrbitingCircles } from "@/components/sheenui/orbiting-circles/orbiting-circles";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use glass-card, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, OrbitingCircles, Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | The orbiting items (icons, logos, avatars): each child sits on the ring, evenly spaced. |
| radius | number | 120 | Radius of the ring in px, from the centre of the parent. |
| duration | number | 28 | Seconds one full turn takes. Slow reads as calm: 20 to 40 suits a hero. |
| reverse | boolean | false | Turn anticlockwise instead of clockwise. |
| startAngle | number | 0 | Angle of the first item in degrees, clockwise from the top. The others follow evenly; use it to offset one ring from another. |
| path | boolean | true | Draw the faint ring the items sit on. |
| pauseOnHover | boolean | true | Hold the ring still while the pointer or keyboard focus is on one of its items, so an item is never a moving target. |
| label | string | optional, no default | Accessible name for the group. Set it when the items mean something (integrations, team) and the ring is exposed as a labelled list; without it the whole ring is decorative and hidden from assistive technology. |
| paused | boolean | false | Hold the ring where it is (it carries on from there when unpaused). |
| className | string | optional, no default | Adds extra classes to the overlay. It fills a relative parent; the ring is centred in it. |
| itemClassName | string | optional, no default | Classes for every item's box (sizing, glass, rounding). |
| style | CSSProperties | optional, no default | Applies an inline style to the overlay. |

## Example: Two rings

Stack rings with different radius, duration, reverse and startAngle around a central card. Give the ring a label when the items mean something: it then becomes a labelled list. Glass items use level-2 glass; keep a handful in view.

```tsx
import { useState } from "react";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { OrbitingCircles } from "@/components/sheenui/orbiting-circles/orbiting-circles";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, OrbitingCircles, Switch } from "@sheenui/theme";

const GLYPHS = ["A", "B", "C", "D", "E", "F"];

function Glyph({ children }: { children: string }) {
  return <span className="glass-2 grid size-10 place-items-center rounded-full text-sm font-semibold">{children}</span>;
}

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <div className="relative grid size-[22rem] place-items-center">
        <GlassCard tint className="relative grid size-20 place-items-center text-sm font-semibold">Core</GlassCard>
        <OrbitingCircles label="Inner integrations" radius={96} duration={24} paused={paused}>
          {GLYPHS.slice(0, 3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
        <OrbitingCircles label="Outer integrations" radius={160} duration={36} reverse startAngle={30} paused={paused}>
          {GLYPHS.slice(3).map((g) => (
            <Glyph key={g}>{g}</Glyph>
          ))}
        </OrbitingCircles>
      </div>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves through any links or buttons inside the items, in their order. The ring itself is not focusable. |
| Focus on an item | Holds the ring still (pauseOnHover) so nobody chases a moving control. |

## Accessibility

- Without label the ring is decorative and aria-hidden; never put interactive items in a hidden ring. With label it is a labelled list with one item per child, in order.
- pauseOnHover holds the ring while the pointer or focus is on an item; paused gives a page a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.
- Reduced motion: the items rest on the ring, still, in the same places.
- Two transform rotations per item on the compositor (the ring turns, the item turns back); nothing blurs, masks or filters the items.

## When to use the orbiting circles effect

- Use it in a works-with or integrations section: logos circling your product mark on one or two rings.
- Stack rings with different radius, duration, reverse and startAngle for a system of orbits around a central glass card.
- Pass label when the items mean something so the ring becomes a labelled list; without it the ring is decorative and hidden.
- Skip it when people must click items quickly; it holds still on hover and focus, but a static grid is easier to use.
- Pair it with GlassCard in the centre, Avatar for team members and itemClassName for glass items.


## Frequently asked questions

### How do I make items orbit in React?

Put OrbitingCircles in a sized relative parent and pass each item as a child. They are spaced evenly on a ring of the given radius and turn once per duration seconds, staying upright.

### Is it transform only?

Yes. The ring rotates and each item rotates back by the same amount, two transforms per item on the compositor. It pauses off-screen, in hidden tabs and while an item is hovered or focused.

### What about accessibility and reduced motion?

Without label it is aria-hidden; with label it is a labelled list in order. Reduced motion leaves the items resting on the ring.

### Does it keep running off-screen?

No. The orbit pauses off-screen, in hidden tabs and while an item is hovered or focused, so a long integrations page pays nothing for rings nobody sees.


## Related pages

- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)
- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)
- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)
- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)
- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
