Canonical: https://lokendra-builds.github.io/sheenui/effects/blur-in

# Blur Text Animation for React with Motion

URL: https://lokendra-builds.github.io/sheenui/effects/blur-in
Sidebar name: Blur in

A blur-in text animation for React: words sharpen out of a blur one by one with Motion. Screen readers get the full sentence; reduced motion shows text.

What it is: A blur text animation for React where words sharpen out of a soft blur one after another: the classic hero-headline reveal.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/text-effects.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Blur in

Files to copy from `theme/src/`:

- `components/text-effects/{blur-in.tsx, text-utils.ts}`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: text-effects. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { BlurIn } from "@/components/sheenui/text-effects/blur-in";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { BlurIn } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| text | string | required | The text to reveal. |
| by | "word" \| "character" | "word" | Reveal word by word (default), or character by character (also the choice for languages written without spaces). |
| delay | number | 0 | Seconds before the first piece starts. |
| stagger | number | 0.07 for words, 0.025 for characters | Sets the seconds between pieces. |
| duration | number | durations.slower | Seconds each piece takes to arrive. |
| blur | number | 10 | Starting blur in px. 0 for a plain fade-up. |
| offset | string | "0.35em" | How far each piece rises, as a CSS length. "0" for none. |
| animateOnView | boolean | true | Wait until the text is on screen. Off: play on mount. |
| once | boolean | true | Play only the first time it enters the view. Off: replay every time it comes back. |
| onComplete | (() => void) | optional, no default | Called when the last piece has landed. |
| pieceClassName | string | optional, no default | Classes for each animated piece (e.g. a gradient per word). |
| render | ReactElement \| function | <span /> | Render as another element: an h1, a p… |

## Example 1 of 2: Hero headline

Render it as any element with render (here paragraphs styled as a headline; use render={<h1 />} for the page's real heading). It plays once, when it scrolls into view.

```tsx
import { BlurIn } from "@/components/sheenui/text-effects/blur-in";
// Package build (after the first npm release, or a packed tarball): import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
      <BlurIn
        render={<p />}
        text="Interfaces you can see through."
        className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl"
      />
      <BlurIn
        render={<p />}
        text="Glass components with motion that stays readable, accessible and fast."
        delay={0.45}
        stagger={0.03}
        blur={6}
        className="max-w-lg text-base text-pretty text-sheen-fg-muted sm:text-lg"
      />
    </div>
  );
}
```

## Example 2 of 2: Character by character

by="character" reveals each letter (emoji and accents stay whole). Words never break apart mid-line. It is also the mode for languages written without spaces.

```tsx
import { BlurIn } from "@/components/sheenui/text-effects/blur-in";
// Package build (after the first npm release, or a packed tarball): import { BlurIn } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BlurIn
        by="character"
        render={<p />}
        text="Ship it ✨"
        blur={12}
        offset="0.5em"
        className="text-5xl font-bold tracking-tight sm:text-6xl"
      />
      <BlurIn
        by="character"
        render={<p />}
        text="こんにちは、世界"
        delay={0.5}
        stagger={0.05}
        lang="ja"
        className="text-xl font-medium text-sheen-fg-muted"
      />
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: this is text. |

## Accessibility

- The text is in the DOM from the start, so screen readers and search engines read it once, whether or not it has animated.
- Under reduced motion it is plain static text, with nothing to wait for.

## When to use the blur in effect

- Use it as a text reveal animation on the one hero headline of a landing page, where each word sharpens out of a soft blur as it rises into place and gives the page a deliberate first impression.
- Use it for an empty-state or onboarding welcome line, such as a first-run greeting in a dashboard, where one short sentence should arrive with a little ceremony instead of simply appearing.
- Switch to by="character" for a short tagline or for languages written without spaces, each word stays one unbreakable box, so letters never wrap on their own.
- Skip it when the text is body copy, a list or anything people scan quickly; animated paragraphs slow reading, so keep plain text there or use Typewriter for a phrase that changes over time.
- Pair it with ShimmerText for a subtitle that lights up after the headline lands, a Button for the call to action, and the useSheenReducedMotion hook if you gate other motion yourself.


## Frequently asked questions

### How do I make a blur text animation in React with BlurIn?

Pass the string as the text prop and choose the element with render, for example render={<h1 />}. Tune it with by, delay, stagger, duration, blur (starting px, default 10) and offset (default 0.35em). It plays once when the text scrolls into view.

### Will screen readers hear the headline word by word?

No. A visually hidden copy of the whole string is read once, and the animated pieces are aria-hidden. That hidden copy is unselectable, so copying the headline gives exactly what is on screen, once, instead of duplicated text.

### How do I replay the animation or run it on mount?

Set animateOnView={false} to play on mount instead of waiting for the viewport, and once={false} to replay each time it scrolls back in. To trigger it from a button, change the component key so it remounts. onComplete fires after the last piece lands.

### What happens with reduced motion, and does it leave a filter on the text?

With the OS setting or the in-app toggle on, you get plain static text with nothing to wait for. When each piece lands its filter is removed, so finished text is ordinary text. Use pieceClassName to style every word, such as a gradient.


## Related pages

- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [macOS dock](https://lokendra-builds.github.io/sheenui/effects/macos-dock)
- [Liquid glass](https://lokendra-builds.github.io/sheenui/effects/liquid-glass)
- [Marquee](https://lokendra-builds.github.io/sheenui/effects/marquee)
- [Morphing dialog](https://lokendra-builds.github.io/sheenui/effects/morphing-dialog)
- [Number ticker](https://lokendra-builds.github.io/sheenui/effects/number-ticker)

### Guides that cover it

- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
