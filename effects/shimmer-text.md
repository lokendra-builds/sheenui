Canonical: https://lokendra-builds.github.io/sheenui/effects/shimmer-text

# Shimmer Text Animation for React & CSS

URL: https://lokendra-builds.github.io/sheenui/effects/shimmer-text
Sidebar name: Shimmer text

A shimmer text animation for React: a band of light sweeps across the letters once, on hover or on a loop, with transforms only. Text stays readable.

What it is: A shimmer text animation for React: a band of light sweeps across the letters while the real text stays whole and selectable.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/text-effects.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Shimmer text

Files to copy from `theme/src/`:

- `components/text-effects/{shimmer-text.tsx, text-utils.ts}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: text-effects. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Button } from "@/components/sheenui/button/button";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ShimmerText } from "@/components/sheenui/text-effects/shimmer-text";
```

These examples also use avatar, button, glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Button, GlassCard, ShimmerText } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| color | string | the accent, which keeps AA contrast | Highlight colour, any CSS colour. |
| children | ReactNode | required | Text (and inline icons). Avoid interactive content: it is copied for the highlight layer. |
| trigger | "view" \| "hover" \| "loop" \| "mount" | "view" | When the light sweeps: "view" once, the first time the text scrolls into view (default) "hover" each time a pointer enters it, or keyboard focus reaches the control around it "loop" continuously while on screen (status lines); pauses off screen and in hidden tabs "mount" once, right away. |
| duration | number | 1.6 | Seconds one sweep takes. |
| delay | number | 0 | Sets the number of seconds before the first sweep. |
| repeatDelay | number | 1 | Sets the number of seconds between sweeps when looping. |
| spread | number | 5 | Sets the width of the light band, in em. |
| paused | boolean | false | Stop a looping shimmer. |

## Example 1 of 2: Status line

trigger="loop" for work in progress. It only runs while on screen, and stops with reduced motion.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { ShimmerText } from "@/components/sheenui/text-effects/shimmer-text";
// Package build (after the first npm release, or a packed tarball): import { Avatar, GlassCard, ShimmerText } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard className="flex w-full max-w-md flex-col gap-4 p-5">
      <p className="ms-auto max-w-[85%] rounded-sheen-lg rounded-ee-sheen-sm bg-sheen-accent-soft px-4 py-2.5 text-sm">
        Which plan fits a team of twelve?
      </p>
      <div className="flex items-center gap-3">
        <Avatar name="Sheen Assistant" size="sm" />
        <ShimmerText trigger="loop" className="text-sm font-medium text-sheen-fg-muted">
          Thinking through your question…
        </ShimmerText>
      </div>
    </GlassCard>
  );
}
```

## Example 2 of 2: On view and on hover

The headline sweeps once as it scrolls in. In a link or button, hover (or keyboard focus) anywhere on the control replays it.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { ShimmerText } from "@/components/sheenui/text-effects/shimmer-text";
// Package build (after the first npm release, or a packed tarball): import { Button, ShimmerText } from "@sheenui/theme";
import { ArrowRight as ArrowIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <ShimmerText className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Meet the new glass
      </ShimmerText>

      {/* ArrowIcon: any 16px svg icon */}
      <Button variant="glass" render={<a href="#changelog" />} trailing={<ArrowIcon />}>
        <ShimmerText trigger="hover" duration={1.1}>See what's new</ShimmerText>
      </Button>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: this is text. With "hover", keyboard focus reaching the control around it triggers the sweep too. |

## Accessibility

- The highlight copy is aria-hidden, so the text is read once. The default highlight is the accent, which keeps AA contrast.
- Under reduced motion there is no overlay at all, just the text; in forced colors the overlay is hidden.

## When to use the shimmer text effect

- Use it as a text shine effect for a Thinking or Generating your report status line, with trigger="loop" so a band of light keeps sweeping while the work is pending.
- Use it to draw the eye to a badge or announcement link once, with trigger="view" (the default) so the light passes the first time the text scrolls into view.
- Use trigger="hover" inside a link or button so the sweep runs when a pointer enters the control or keyboard focus reaches it, padding included.
- Skip it when you want a text reveal rather than a highlight: BlurIn arrives word by word on a headline, Typewriter types phrases, and neither fits a status that should simply stay readable.
- Pair it with Badge for an announcement pill, Button for a hover-triggered label, and the paused prop plus your own loading state to stop the loop when work finishes.


## Frequently asked questions

### How do I add a shimmer text animation in React?

Wrap your text in ShimmerText and choose a trigger: view, hover, loop or mount. duration (default 1.6 seconds), delay, repeatDelay (1 second between loop sweeps), color and spread (band width in em, default 5) shape the sweep. children can include inline icons.

### Does shimmer text change what screen readers read?

No. The real text is untouched and stays the accessible text, nothing is split or hidden. The highlight is an aria-hidden copy in the highlight color seen through a soft-edged band. The default color is the accent, which keeps AA contrast.

### Why is it cheap to run, and does it stop when off screen?

The sweep is transform only, using native Web Animations on two transforms, with no per-frame paint. A looping shimmer pauses off screen and in hidden tabs, and paused stops it from outside. The overlay is clipped sideways so it can never widen the page.

### What happens with reduced motion or forced colors?

With reduced motion there is no overlay at all, just the text. In forced colors the overlay is hidden. Avoid interactive content in children, because the content is copied for the highlight layer and a duplicate control would be confusing.


## Related pages

- [Spotlight card](https://lokendra-builds.github.io/sheenui/effects/spotlight-card)
- [3D tilt card](https://lokendra-builds.github.io/sheenui/effects/3d-tilt-card)
- [Typewriter](https://lokendra-builds.github.io/sheenui/effects/typewriter)
- [Word rotate](https://lokendra-builds.github.io/sheenui/effects/word-rotate)
- [Animated beam](https://lokendra-builds.github.io/sheenui/effects/animated-beam)
- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
