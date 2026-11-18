Canonical: https://lokendra-builds.github.io/sheenui/effects/typewriter

# Typewriter Effect for React (Typing Animation)

URL: https://lokendra-builds.github.io/sheenui/effects/typewriter
Sidebar name: Typewriter

A typewriter effect for React that types with a human rhythm, deletes and types the next phrase, reserving space so nothing shifts. Reduced-motion safe.

What it is: A typewriter effect for React that types each phrase with a human rhythm, holds it, deletes it and types the next. Use it as a typing animation for a hero line that cycles through a few phrases, such as I build design systems, fast websites and accessible apps, typed and deleted one after another.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/text-effects.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Typewriter

Files to copy from `theme/src/`:

- `components/text-effects/{text-utils.ts, typewriter.tsx}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/gate.ts`
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
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Typewriter } from "@/components/sheenui/text-effects/typewriter";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use avatar, glass-card, toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, GlassCard, Typewriter, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| words | string \| readonly string[] | required | A phrase, or phrases to type one after another. |
| typeSpeed | number | 0.055 | Sets the seconds per typed character (on average). |
| deleteSpeed | number | 0.028 | Sets the seconds per deleted character. |
| hold | number | 1.8 | Seconds a finished phrase stays before it is deleted. |
| startDelay | number | 0.2 | Sets the number of seconds before the first character. |
| loop | boolean | true when there are several phrases | Start again after the last phrase. |
| cursor | boolean | true | Show the caret. When typing ends (no loop), it blinks a few times and fades. |
| cursorClassName | string | optional, no default | Adds extra classes to the caret (colour, width). |
| reserveSpace | boolean | true | Reserve the space of the longest phrase so nothing around it moves. |
| paused | boolean | false | Stop typing (e.g. from a pause button). |
| pauseOnHover | boolean | true | Pause while a mouse or pen rests on the text. |
| label | string | every phrase, in order | Sets what screen readers hear. |
| onComplete | (() => void) | optional, no default | Called once the last phrase is typed (when not looping). |

## Example 1 of 3: Rotating phrases

Several phrases loop. It pauses while off screen, in a hidden tab, or under the pointer; paused, the caret holds still.

```tsx
import { Typewriter } from "@/components/sheenui/text-effects/typewriter";
// Package build (after the first npm release, or a packed tarball): import { Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <p className="text-center text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
      I build{" "}
      <Typewriter
        words={["design systems.", "fast websites.", "accessible apps."]}
        className="text-sheen-accent"
      />
    </p>
  );
}
```

## Example 2 of 3: Terminal

Monospace, a block-ish caret, quicker keys. The reserved space keeps the card from jumping; in a flex row next to the prompt, a long command wraps inside its own column on narrow screens.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Typewriter } from "@/components/sheenui/text-effects/typewriter";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Typewriter } from "@sheenui/theme";

export function Example() {
  return (
    <GlassCard level={3} sheen={false} className="w-full max-w-md overflow-hidden">
      {/* Window controls (decorative) */}
      <div aria-hidden className="flex items-center gap-1.5 border-b border-sheen-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-sheen-danger" />
        <span className="size-2.5 rounded-full bg-sheen-warning" />
        <span className="size-2.5 rounded-full bg-sheen-success" />
      </div>
      <p className="flex gap-[1ch] p-5 font-sheen-mono text-sm">
        <span aria-hidden className="text-sheen-fg-subtle">$</span>
        <Typewriter
          words={["pnpm add @sheenui/theme", "pnpm dev --open", "git push origin main"]}
          typeSpeed={0.04}
          hold={1.4}
          cursorClassName="w-[0.6em] rounded-none bg-sheen-fg-muted"
          className="min-w-0"
        />
      </p>
    </GlassCard>
  );
}
```

## Example 3 of 3: Type once

A single phrase types once (loop is off by default for one phrase); the caret blinks a few times, then fades. onComplete fires at the end. The paragraph is already full height before the first letter.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Typewriter } from "@/components/sheenui/text-effects/typewriter";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Avatar, GlassCard, Typewriter, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <GlassCard className="flex w-full max-w-md gap-3 p-5">
      <Avatar name="Sheen Assistant" size="sm" />
      <p className="text-sm text-pretty">
        <Typewriter
          words="Your workspace is ready. We imported 24 components, set up dark mode and turned on reduced-motion support."
          typeSpeed={0.025}
          onComplete={() => toast.success("Setup complete")}
        />
      </p>
    </GlassCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: this is text. |

## Accessibility

- Screen readers get every phrase once, as plain text (override it with label); the typing itself is aria-hidden.
- That copy is unselectable, so copying gets only what is on screen. It waits until it is on screen and pauses in a hidden tab or while the pointer rests on it: a pointer convenience, not a WCAG 2.2.2 mechanism, since keyboard and touch users cannot hover. A loop that runs longer than 5 s needs a visible pause button wired to paused. Under reduced motion it shows the first phrase, complete, with no caret.

## When to use the typewriter effect

- Use it for the rotating tagline in a portfolio or landing page hero, where one line has to say several things in turn: each phrase is typed out, held long enough to read, then deleted.
- Use it for a terminal-style intro or a demo of a search box suggestion, where one phrase types once with the caret blinking and fading at the end.
- Use typeSpeed, deleteSpeed, hold and startDelay to tune the rhythm; typing already has uneven keystrokes and a beat after punctuation, so it reads as human.
- Skip it when only a single word changes inside a sentence, where WordRotate slides words in a fixed slot, or when the text matters for scanning; BlurIn is better for a one-time headline reveal.
- Pair it with Button for the call to action below the line, ShimmerText for a supporting status line, and reserveSpace so the layout under the text never moves.


## Frequently asked questions

### How do I create a typewriter effect in React?

Pass words as a string or an array to Typewriter. With several phrases, loop defaults to true; with one it types once and onComplete fires after the last phrase. typeSpeed defaults to 0.055 seconds per character, deleteSpeed to 0.028, hold to 1.8 and startDelay to 0.2.

### Does the text jump around while it types?

Not by default. reserveSpace is true, so the space of the longest phrase is reserved up front and nothing around it moves. Characters are grapheme clusters through Intl.Segmenter, so emoji and accents never split in the middle of a character.

### What do screen readers read, and can people stop it?

Screen readers get every phrase once as plain text, or whatever you pass in label; the typing itself is aria-hidden. It pauses while the tab is hidden or the pointer rests on it, and the paused prop pauses it from your own button, for WCAG 2.2.2.

### How does the caret behave, and what is the reduced-motion result?

The caret is solid while typing and blinks while waiting, and solid and still when paused. Style it with cursorClassName or hide it with cursor={false}. With reduced motion you get the first phrase, complete, with no caret and nothing to wait for.


## Related pages

- [Word rotate](https://lokendra-builds.github.io/sheenui/effects/word-rotate)
- [Animated beam](https://lokendra-builds.github.io/sheenui/effects/animated-beam)
- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)
- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)
- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)
- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
