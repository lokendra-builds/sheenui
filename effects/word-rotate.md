Canonical: https://lokendra-builds.github.io/sheenui/effects/word-rotate

# Rotating Text Animation for React (Word Rotate)

URL: https://lokendra-builds.github.io/sheenui/effects/word-rotate
Sidebar name: Word rotate

Rotating text for React headlines: each word slides through a clipped slot sized to the longest, so the sentence never reflows. Pauses off-screen. MIT.

What it is: A rotating text animation for React: one slot in a sentence cycles through words, each sliding up through a clipped window.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/text-effects.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Effects](https://lokendra-builds.github.io/sheenui/effects/) > Word rotate

Files to copy from `theme/src/`:

- `components/text-effects/{text-utils.ts, word-rotate.tsx}`
- `hooks/{use-controllable.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: text-effects. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Switch } from "@/components/sheenui/switch/switch";
import { WordRotate } from "@/components/sheenui/text-effects/word-rotate";
```

These examples also use switch: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/switch.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Switch, WordRotate } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| words | readonly string[] | required | The words to cycle through, in order. |
| interval | number | 2.6 | Seconds each word stays. |
| direction | "up" \| "down" | "up" | Which way words travel: "up" (in from below, default) or "down" (in from above). |
| align | "center" \| "end" \| "start" | "start" | Where a shorter word sits in the slot (the slot is as wide as the longest word). |
| paused | boolean | false | Stop cycling (e.g. from a pause button). |
| pauseOnHover | boolean | true | Pause while a mouse or pen rests on the words. |
| index | number | optional, no default | Controlled index of the word shown. |
| defaultIndex | number | 0 | Sets the index shown first when uncontrolled. |
| onIndexChange | ((index: number) => void) | optional, no default | Called with the index of each new word. |
| label | string | optional, no default | What screen readers hear instead of the list of words. |
| locales | Intl.LocalesArgument | optional, no default | Locale(s) for the default list label (Intl.ListFormat). |
| wordClassName | string | optional, no default | Classes for each word (padding, gradient text). Put a highlight's padding here. |
| highlightClassName | string | optional, no default | Classes for a highlight behind the current word (e.g. "rounded-sheen-md bg-sheen-accent-soft"). It morphs to fit each word. |

## Example 1 of 2: In a headline

highlightClassName draws a pill behind the current word: watch it morph between short and long words (transforms only, corners stay round). Padding goes in wordClassName so the pill and the word line up. Rest the pointer on it, or use the switch, to pause.

```tsx
import { useState } from "react";
import { Switch } from "@/components/sheenui/switch/switch";
import { WordRotate } from "@/components/sheenui/text-effects/word-rotate";
// Package build (after the first npm release, or a packed tarball): import { Switch, WordRotate } from "@sheenui/theme";

export function Example() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Switch label="Pause" checked={paused} onCheckedChange={setPaused} />
      <p className="text-center text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        Built for{" "}
        <WordRotate
          words={["designers", "developers", "founders", "everyone"]}
          paused={paused}
          className="text-sheen-accent"
          wordClassName="px-3"
          highlightClassName="rounded-sheen-md bg-sheen-accent-soft"
        />
      </p>
    </>
  );
}
```

## Example 2 of 2: Inside running text

direction="down" brings words in from above; align="center" centers shorter words in the slot. A custom label gives screen readers a better sentence than the plain list.

```tsx
import { WordRotate } from "@/components/sheenui/text-effects/word-rotate";
// Package build (after the first npm release, or a packed tarball): import { WordRotate } from "@sheenui/theme";

export function Example() {
  return (
    <p className="max-w-md text-center text-xl text-pretty sm:text-2xl">
      Your dashboard,{" "}
      <WordRotate
        words={["faster", "clearer", "calmer"]}
        direction="down"
        align="center"
        interval={2}
        label="faster, clearer and calmer"
        className="font-semibold text-sheen-accent"
      />{" "}
      than ever.
    </p>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: this is text. |

## Accessibility

- Screen readers get the words once, as plain text (override it with label); the rotating word is not re-announced every few seconds.
- Under reduced motion it stays on the current word.

## When to use the word rotate effect

- Use it as a word rotate animation for one changing word in a headline, such as Design for designers, developers and everyone, where each word slides in from below as the last slides out the top. Use it as a text loop in React that cycles through a few phrases inside one headline.
- Use it for a feature tagline in a product page that lists audiences or use cases, with highlightClassName adding a pill behind the current word that morphs to fit each one. It is a quiet way to flip words in a headline without moving the layout under the text.
- Use controlled index with onIndexChange when other UI, like tabs or an illustration, should follow the word that is currently shown.
- Skip it when you need whole phrases typed out: Typewriter fits that, and a static sentence fits better when the words are important content, since users may not wait for every one.
- Pair it with BlurIn for the rest of the headline, Button for the action, and a Switch or your own button that sets paused so people can stop the cycling.


## Frequently asked questions

### How do I make rotating text in React with WordRotate?

Put WordRotate inside your heading and pass words in order. interval is seconds per word (default 2.6), direction is up or down, and align places a shorter word in the slot. Use defaultIndex to choose the first word when uncontrolled.

### Will the sentence reflow as the words change?

No. The slot is as wide as the longest word from the first paint, so the text around it never reflows or jumps while a word is in flight. The clipped window uses clip-path as well as overflow, so words in flight are clipped too.

### How do screen readers and keyboard users experience it?

Screen readers hear every word once as a list, such as designers, developers, and everyone, not a stream of changes. Override that with label, and set the list language with locales. It has no keyboard interaction, because it is text.

### Can visitors pause it, and what about reduced motion?

It pauses while off screen, while the tab is hidden and while a mouse or pen rests on it, with pauseOnHover turning the last one off. paused stops it from outside, for WCAG 2.2.2. With reduced motion it stays on the current word, static.


## Related pages

- [Animated beam](https://lokendra-builds.github.io/sheenui/effects/animated-beam)
- [Confetti](https://lokendra-builds.github.io/sheenui/effects/confetti)
- [Meteors](https://lokendra-builds.github.io/sheenui/effects/meteors)
- [Orbiting circles](https://lokendra-builds.github.io/sheenui/effects/orbiting-circles)
- [Particles](https://lokendra-builds.github.io/sheenui/effects/particles)
- [Scroll progress](https://lokendra-builds.github.io/sheenui/effects/scroll-progress)

19 effects pages in all: browse them on [All effects](https://lokendra-builds.github.io/sheenui/effects/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
