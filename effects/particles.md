Canonical: https://lokendra-builds.github.io/sheenui/effects/particles

# Particles Background for React: Canvas Effect

URL: https://lokendra-builds.github.io/sheenui/effects/particles
Sidebar name: Particles

A particles background for React: a capped canvas field of drifting lights that lean away from the pointer. Pauses off-screen, still for reduced motion.

What it is: Particles is a React canvas effect: a capped field of small drifting lights that lean softly away from the pointer. Use it behind a hero or glass card; it draws one still frame under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/particles.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Particles

Files to copy from `theme/src/`:

- `components/particles/`
- `lib/{canvas-effects.ts, cn.ts}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{beat.ts, gate.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: particles. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Particles } from "@/components/sheenui/particles/particles";
import { Switch } from "@/components/sheenui/switch/switch";
```

These examples also use glass-card, switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, Particles, Switch } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| density | number | 1.4 | How many particles per 10,000 px² of the field (a 1000 x 600 field at 1 draws 60). The count is always capped by maxCount, and halved on devices with little memory, few cores or Save-Data. |
| maxCount | number | 120 | The most particles ever drawn, whatever the density and the size of the field. |
| radius | number | 2 | Radius of a particle in px; each one varies a little around it. |
| speed | number | 10 | Sets the drift speed in px per second. |
| pointer | ParticlesPointer | "repel" | What a nearby pointer does: push particles away softly, draw them in, or nothing. Only mouse and trackpad react; touch screens and reduced motion never do. |
| pointerRadius | number | 120 | Distance in px within which the pointer moves particles. |
| color | string | "var(--sheen-accent)" | Sets the colour of most particles, any CSS colour. |
| colorTo | string | "var(--sheen-accent-2)" | Colour of the rest (about a third), any CSS colour. |
| paused | boolean | false | Hold the particles where they are (they carry on from there when unpaused). |
| seed | number | 1 | Seed for the starting positions, so a field looks the same on every visit and on the server. |
| className | string | optional, no default | Adds extra classes to the overlay. Size it with inset-0 inside a relative parent, or give it its own size. |
| style | CSSProperties | optional, no default | Applies an inline style to the overlay. |

## Example 1 of 2: Behind glass

The particles are what the glass blurs, which makes the frosted card read as real. Move the mouse over it: nearby particles ease away (or towards the pointer), then settle back. Touch screens and reduced motion never react to the pointer.

```tsx
import { useState } from "react";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Particles } from "@/components/sheenui/particles/particles";
import { Switch } from "@/components/sheenui/switch/switch";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Particles, Switch } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <div className="relative grid min-h-80 w-full place-items-center overflow-hidden rounded-sheen-xl">
        <Particles density={1.4} pointer="repel" paused={paused} />
        <GlassCard className="relative max-w-xs p-6 text-center">
          <h2 className="text-lg font-semibold">Build something calm</h2>
          <p className="mt-1 text-sm text-sheen-fg-muted">A soft field of light behind frosted glass.</p>
        </GlassCard>
      </div>
    </>
  );
}
```

## Example 2 of 2: Dense and capped

density is particles per 10,000 px². Raise it as far as you like: maxCount is the hard ceiling (120 by default, 400 at most), and devices with little memory, few cores or Save-Data draw half.

```tsx
import { Particles } from "@/components/sheenui/particles/particles";
// Package build (after the first npm release, or a packed tarball): import { Particles } from "@sheenui/theme";

export function Example() {
  return (
    <div className="relative min-h-56 w-full overflow-hidden rounded-sheen-xl">
      <Particles density={6} maxCount={90} radius={1.2} speed={6} pointer="none" />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the canvas is click-through and never takes focus. |

## Accessibility

- Decorative: the layer is aria-hidden and carries no information. Particles are small and low in contrast so text above stays readable.
- Offer paused as a control where the field sits behind long reading (WCAG 2.2.2). It also rests off-screen and in hidden tabs.
- Reduced motion draws one still frame, with no loop and no pointer reaction. Colours are the accent tokens read from the page, redrawn when the theme or style preset changes.
- Cost: one canvas on the shared ambient beat (about 30 Hz, fewer while scrolling), device pixel ratio capped at 2, count capped and halved on weak devices.

## When to use the particles effect

- Use it behind a hero or a glass card for depth: the particles are what the glass blurs, which makes frosted panels look real without a photo.
- Use it on a landing section that needs a calm, living background; keep density low and let the text carry the page.
- Set pointer to attract or none to change how it answers the cursor; only a mouse or trackpad reacts, never touch.
- Skip it behind long reading or dense tables; a moving field competes with text, so use paused or leave it out.
- Pair it with GlassCard, Backdrop and ShimmerText for a hero that feels layered.


## Frequently asked questions

### How many particles does it draw?

Density is particles per 10,000 square pixels, always capped by maxCount (400 at most) and halved on devices with little memory, few cores or Save-Data, so a large hero stays cheap.

### Does it hurt performance?

It is one canvas drawn on the shared ambient beat, about 30 Hz and slower while scrolling, and only while the field is on screen and the tab is visible.

### What happens with reduced motion?

It draws one still frame, with no loop and no pointer reaction. The canvas is aria-hidden and click-through either way.

### How do I tune the count, speed and pointer reaction?

density is particles per 10,000 px² (default 1.4) and maxCount caps the total (default 120, never more than 400). radius and speed set the size and the drift in px per second. pointer is repel, attract or none, within pointerRadius (default 120); only a mouse or trackpad reacts, never touch or reduced motion.

### Can the field look the same on every visit?

Yes. seed (default 1) fixes the starting positions, so the field looks the same on the server and on every visit. color and colorTo set the two particle colors; by default they are the accent and second-accent tokens, so a theme or style switch recolors them.

### Can readers pause it?

Yes: paused holds the particles where they are and they carry on from there when unpaused. Offer it as a control where the field sits behind long reading, which is what WCAG 2.2.2 asks for.


## Related pages

- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)
- [Text reveal](https://lokendra-builds.github.io/sheenui/effects/text-reveal)
- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)
- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
