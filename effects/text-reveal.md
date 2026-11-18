Canonical: https://lokendra-builds.github.io/sheenui/effects/text-reveal

# Text Reveal on Scroll for React: Word by Word

URL: https://lokendra-builds.github.io/sheenui/effects/text-reveal
Sidebar name: Text reveal

A scroll text reveal for React: words light up one by one with scroll progress. Real text, readable without JS, no layout shift, static for reduced motion.

What it is: TextReveal is a React effect that lights up the words of a statement one by one as you scroll. The text stays real, readable without JavaScript, never shifts layout and is fully visible under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/text-reveal.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 16, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Text reveal

Files to copy from `theme/src/`:

- `components/text-reveal/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `lib/{canvas-effects.ts, cn.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: text-reveal. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { TextReveal } from "@/components/sheenui/text-reveal/text-reveal";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { TextReveal } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | string | required | The text to reveal, as one plain string. Words are split on whitespace. |
| as | TextRevealTag | "p" | The element to render: a paragraph for running text, a heading for a statement. |
| dim | number | 0.28 | How dim a word is before the scroll reaches it, from 0 (invisible) to 1 (no effect). Keep it at 0.25 or above so the unread words stay legible. |
| offset | ScrollOffset | ["start 0.9", "end 0.5"] | Which part of the scroll drives the reveal, in Motion's offset format: ["start 0.9", "end 0.5"] starts when the top of the text reaches 90 % of the viewport height and finishes when its bottom reaches the middle. |
| container | RefObject<HTMLElement \| null> | the page | The scrollable element that drives the reveal. |

## Example 1 of 2: Scroll inside the panel

Pass container to follow a scrollable panel instead of the page. offset sets where the reveal starts and ends; here it begins as the text enters the panel and finishes at the middle. Scroll back and the words dim again.

```tsx
import { useRef } from "react";
import { TextReveal } from "@/components/sheenui/text-reveal/text-reveal";
// Package build (after the first npm release, or a packed tarball): import { TextReveal } from "@sheenui/theme";

export function Example() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div ref={scroller} role="region" aria-label="Manifesto" tabIndex={0} className="h-96 w-full overflow-y-auto p-8 focus-visible:outline-2 focus-visible:outline-sheen-focus">
      <div className="h-40" />
      <TextReveal
        as="h2"
        container={scroller}
        offset={["start 0.9", "end 0.5"]}
        className="text-3xl font-semibold tracking-tight text-balance"
      >
        We build interfaces that feel like light passing through glass: calm, precise and never in the way of the thing you came to do.
      </TextReveal>
      <div className="h-96" />
    </div>
  );
}
```

## Example 2 of 2: On the page, as a paragraph

Without container it follows the page scroll. Raise dim towards 1 for a subtler reveal; keep it at 0.25 or above so unread words stay legible.

```tsx
import { TextReveal } from "@/components/sheenui/text-reveal/text-reveal";
// Package build (after the first npm release, or a packed tarball): import { TextReveal } from "@sheenui/theme";

export function Example() {
  return (
    <TextReveal dim={0.4} className="max-w-xl text-lg text-pretty">
      Each word arrives as you reach it, left to right, like a progress bar made of language.
    </TextReveal>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the text is plain content in the normal reading order. |

## Accessibility

- The words are real text with normal spaces, in order: selectable, searchable and read by screen readers whatever their opacity. Before hydration (or without JavaScript) every word is fully visible.
- Dimmed words are lower contrast until revealed: keep dim at 0.25 or above, and avoid the effect on text that must be read at once (instructions, legal copy).
- Use as="h2" only for a heading that belongs in the outline.
- Only opacity changes, driven by the scroll position through MotionValues: no layout shift, no React renders while scrolling, no loop to pause. Reduced motion shows every word at full opacity.

## When to use the text reveal effect

- Use it for a manifesto, mission line or long hero statement where the scroll sets the pace of reading.
- Use as="h2" for a heading statement, or leave it a paragraph; tune offset to start and finish the reveal where you want.
- Keep dim at 0.25 or above so unrevealed words stay legible.
- Skip it for instructions, legal copy or anything that must be read at once.
- Pair it with ScrollProgress for a reading cue and a calm background.


## Frequently asked questions

### How do I reveal text on scroll in React?

Pass one string to TextReveal. Each word goes from dim to full opacity across its own slice of the scroll range, left to right, driven by the scroll position.

### Is it readable without JavaScript?

Yes. The words are real text in the HTML and every word is fully visible until the page hydrates. Opacity is the only thing that changes, so the layout never shifts.

### What does reduced motion do?

Every word is fully visible and nothing is scroll-linked.

### Which props control how fast the words appear?

dim sets how faint a word is before the scroll reaches it (default 0.28; keep it at 0.25 or above so unread words stay legible). offset says which part of the scroll drives the reveal, in Motion's offset format, and defaults to ["start 0.9", "end 0.5"]: it starts when the top of the text reaches 90% of the viewport and ends when its bottom reaches the middle. container follows a scrollable panel instead of the page.

### Should I use it for body copy?

No. Dimmed words have lower contrast until the reader reaches them, so keep it for a manifesto, a mission line or a long hero sentence. Avoid it on instructions and legal copy that must be read at once, and use as="h2" only for a heading that belongs in the outline.


## Related pages

- [Blur in](https://lokendra-builds.github.io/sheenui/effects/blur-in)
- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
