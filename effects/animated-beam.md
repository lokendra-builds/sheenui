Canonical: https://lokendra-builds.github.io/sheenui/effects/animated-beam

# Animated Beam: Light Along a Path for React

URL: https://lokendra-builds.github.io/sheenui/effects/animated-beam
Sidebar name: Animated beam

An animated beam for React: a light travels along an SVG path between two elements, for integration diagrams. Transform only, rests off-screen. MIT.

What it is: AnimatedBeam is a React effect that sends a light along an SVG path between two elements, measured from refs. Use it for integration diagrams and data-flow maps; it moves by transform only and rests off-screen.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/animated-beam.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Animated beam

Files to copy from `theme/src/`:

- `components/animated-beam/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{beat-animations.ts, beat.ts, gate.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: animated-beam. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { AnimatedBeam } from "@/components/sheenui/animated-beam/animated-beam";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use glass-card, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AnimatedBeam, GlassCard, Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| containerRef | RefObject<HTMLElement \| null> | required | The positioned element that holds both ends (the beam fills it). Pass the same ref you put on that element. |
| fromRef | RefObject<HTMLElement \| null> | required | Element the beam leaves from. Must be inside containerRef's element. |
| toRef | RefObject<HTMLElement \| null> | required | Element the beam arrives at. Must be inside containerRef's element. |
| curvature | number | 0 | Bend of the path in px, measured sideways from the straight line between the two elements. Positive bends to the left of the direction of travel; 0 draws a straight line. |
| reverse | boolean | false | Run from toRef to fromRef instead. |
| duration | number | 2.4 | Seconds one pass of the beam takes from one end to the other. |
| interval | number | 1.2 | Seconds the path rests, empty, between two passes. |
| delay | number | 0 | Seconds before the first pass (lets several beams in one diagram run out of step). |
| length | number | 96 | Length of the travelling light in px, measured along the path. |
| thickness | number | 2.5 | Thickness of the light and of the track in px. |
| gap | number | 6 | Gap in px kept between the path and the edge of each element. |
| colorFrom | string | "var(--sheen-accent)" | Colour at the tail of the light, any CSS colour. |
| colorTo | string | "var(--sheen-accent-2)" | Colour at the bright head of the light, any CSS colour. |
| track | boolean | true | Draw the faint static track under the light, so the connection reads even between passes. |
| fromOffset | BeamOffset | optional, no default | Nudges where the beam leaves fromRef, in px from its centre. |
| toOffset | BeamOffset | optional, no default | Nudges where the beam arrives at toRef, in px from its centre. |
| paused | boolean | false | Hold the light where it is (it carries on from there when unpaused). |
| className | string | optional, no default | Adds extra classes to the overlay. |
| style | CSSProperties | optional, no default | Applies an inline style to the overlay. |

## Example 1 of 2: Integration diagram

Three sources feed one hub. Each beam is staggered with delay and bent with curvature, so the network reads as alive without any one beam competing. The beam is decorative (aria-hidden), so say what is connected in the labels.

```tsx
import { useRef, useState } from "react";
import { AnimatedBeam } from "@/components/sheenui/animated-beam/animated-beam";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { AnimatedBeam, GlassCard, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);

  return (
    <>
      <Switch label="Pause beams" checked={paused} onCheckedChange={setPaused} />
      <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
        <div className="flex flex-col gap-8">
          <GlassCard ref={a} className="grid size-16 place-items-center text-sm font-semibold">Billing</GlassCard>
          <GlassCard ref={b} className="grid size-16 place-items-center text-sm font-semibold">Chat</GlassCard>
          <GlassCard ref={c} className="grid size-16 place-items-center text-sm font-semibold">Docs</GlassCard>
        </div>
        <GlassCard ref={hub} tint className="grid size-24 place-items-center font-semibold">Your app</GlassCard>
        <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.8} paused={paused} />
        <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.6} paused={paused} />
      </div>
    </>
  );
}
```

## Example 2 of 2: One connection, your colours

colorFrom and colorTo take any CSS colour (the defaults are the accent tokens), length and thickness shape the comet, and reverse sends it the other way, for a reply travelling back.

```tsx
import { useRef } from "react";
import { AnimatedBeam } from "@/components/sheenui/animated-beam/animated-beam";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
// Package build (after the first npm release, or a packed tarball): import { AnimatedBeam, GlassCard } from "@sheenui/theme";

export function Example() {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);

  return (
    <div ref={container} className="relative flex w-full max-w-md items-center justify-between py-6">
      <GlassCard ref={from} className="grid size-16 place-items-center text-sm font-semibold">API</GlassCard>
      <GlassCard ref={to} className="grid size-16 place-items-center text-sm font-semibold">Client</GlassCard>
      <AnimatedBeam
        containerRef={container}
        fromRef={from}
        toRef={to}
        reverse
        length={96}
        thickness={3}
        colorFrom="var(--sheen-accent-2)"
        colorTo="var(--sheen-accent)"
      />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the beam never takes focus or pointer events, so the elements it connects stay usable. |

## Accessibility

- Decorative: the overlay is aria-hidden. The connection must also be in text (a label, a heading or a sentence), because the picture is invisible to assistive technology.
- paused holds the light where it is, so a page can offer a stop control (WCAG 2.2.2). It also rests off-screen and in hidden tabs.
- Under reduced motion there is no light, only the faint still track between the elements.
- The light is one element moved by transform and faded by opacity along positions sampled from the real path; nothing blurs, masks or filters the glass nodes.

## When to use the animated beam effect

- Use it in an integration diagram: a source card, your product in the middle and a destination, with a light running along the connection to show data flowing.
- Use it in a "connected to" section or an architecture map, with several beams staggered by delay so the network feels alive without any of them competing.
- Bend a path with curvature to route around a centre node, or reverse it for a response going back; the beam leaves from the edge of each element, not its centre.
- Skip it when the relationship is the point of the content and nothing else says so; the beam is aria-hidden, so name the connection in text as well.
- Pair it with GlassCard nodes, Badge labels on the nodes, and a Switch wired to the paused prop for a stop control.


## Frequently asked questions

### How do I draw an animated beam between two elements in React?

Put the elements and the AnimatedBeam in one relative container, then pass containerRef, fromRef and toRef. It measures them, draws a track from edge to edge and sends a comet of light along it; curvature bends the path and reverse flips the direction.

### Is it expensive to animate?

No. The light is one element moved by transform along positions sampled from the real path, and it fades by opacity, so nothing repaints per frame. It pauses off-screen and in hidden tabs.

### How is it made accessible?

It is decorative and aria-hidden, and never takes pointer events. Describe the connection in text too. The paused prop holds the light so a page can offer a stop control, and reduced motion leaves only the still track.

### Does the beam keep running off-screen?

No. It pauses when it scrolls out of view and in hidden tabs, so several beams on a long page cost nothing while unseen. Use delay to stagger the ones in view.


## Related pages

- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)
- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)
- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)
- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)
- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)
- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
