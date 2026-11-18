Canonical: https://lokendra-builds.github.io/sheenui/components/spinner

# React Loading Spinner with Reduced Motion

URL: https://lokendra-builds.github.io/sheenui/components/spinner
Sidebar name: Spinner

A React loading spinner in five sizes and three colors with a screen-reader label; it holds still as a static arc under reduced motion. Tailwind v4, MIT.

What it is: A React loading spinner for work with no known length, announced politely and held still as a static arc under reduced motion. Use Spinner as a loading indicator in React for a wait with no known length, such as a route transition, a panel waiting for data or a search that has just been submitted.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/spinner.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Spinner

Files to copy from `theme/src/`:

- `components/spinner/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: spinner. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Spinner } from "@/components/sheenui/spinner/spinner";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Spinner } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| size | "sm" \| "md" \| "lg" \| "xl" \| "xs" | "md" | "xs" (12px), "sm" (16px), "md" (24px), "lg" (32px) or "xl" (48px). |
| tone | "accent" \| "current" \| "muted" | "accent" | "current" follows the surrounding text colour, "accent" or "muted". |
| showLabel | boolean | false | Print the label next to the spinner instead of hiding it from sight. |
| labels | Partial<SpinnerLabels> | defaultSpinnerLabels | Every other string, for translation: labels={{ loading: "…" }}; omitted keys keep the English of defaultSpinnerLabels. Its only key is listed in the key table under the props table. |

## Example: Sizes, tones and loading buttons

Five sizes on glass with their names, a labelled panel, muted and current-colour tones, and a row of busy buttons. showLabel prints the text; the label is always read aloud.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Spinner } from "@/components/sheenui/spinner/spinner";
// Package build (after the first npm release, or a packed tarball): import { Button, Spinner } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="glass-2 grid grid-cols-5 gap-3 rounded-sheen-xl p-5">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-3">
            <Spinner size={size} />
            <span className="text-xs font-medium text-sheen-fg-muted">{size}</span>
          </div>
        ))}
      </div>
      <div className="glass-2 flex flex-col items-center gap-3 rounded-sheen-xl p-6">
        <Spinner size="xl" showLabel labels={{ loading: "Loading your projects" }} className="flex-col" />
      </div>
      <div className="glass-2 flex flex-wrap items-center gap-3 rounded-sheen-xl p-5">
        <Button aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Saving" }} />
          Saving
        </Button>
        <Button variant="glass" aria-busy disabled>
          <Spinner size="sm" tone="current" labels={{ loading: "Syncing" }} />
          Syncing files
        </Button>
        <Button loading>Button prop</Button>
      </div>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a spinner is a read-out. Put it inside a control that is busy, not on a tab stop of its own. |

## Accessibility

- It is a role="status" live region with a visually hidden label ("Loading" by default), so mounting it announces politely. Remove it when the work is done.
- The ring itself is aria-hidden. Use labels.loading to say what is loading, in the page language.
- Reduced motion (OS setting or the in-app toggle) keeps the arc turning, slower: it is the loading signal itself. Everything else about the page stops moving.
- The track keeps 3:1 against the surface; forced colors draw it in CanvasText.

## All exports on this page

- Spinner — A loading spinner for something that has no known length (a button, a panel, a route).
- defaultSpinnerLabels — The English SpinnerLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use Spinner

- Use Spinner next to a Saving label or inside a disabled button while a request runs and you cannot say how long it will take; switch to Progress once you can report how far along it is.
- Use showLabel to print the word Loading next to the ring in an empty state, and keep the default hidden label for places where the ring alone is clear.
- Use tone current to inherit the surrounding text color inside a button or a badge, and the xs or sm sizes to fit a line of text.
- Skip it when the task has a measurable end, where Progress fits, or when you know the shape of the incoming content, where Skeleton gives a calmer placeholder.
- Pair it with Button, which shows its own spinner through the loading prop, useOffscreenLoops near the app root to pause off-screen loops, and EmptyState for a loading panel.


## Frequently asked questions

### How do I add a loading spinner in React with SheenUI?

Render Spinner. Choose size from xs at 12px to xl at 48px, with md at 24px as the default, and tone from accent, current or muted. It is a role status live region with a hidden Loading label, so mounting it announces Loading politely. Remove it when the work finishes.

### How do I translate the spinner label?

Pass labels with a loading string, for example labels={{ loading: "Chargement" }}. That text is what a screen reader says and what showLabel prints. The default is Loading, and the partial object you pass is merged over the English defaults.

### What happens with reduced motion?

The arc stops turning and shows as a static arc on its track, with the same Loading label for screen readers. Normally it turns once a second using a CSS rotation transform. The track keeps 3:1 contrast and forced colors draw it in CanvasText.

### Should the spinner go inside a button?

Put it next to the content it replaces, or inside a button that has aria-busy. If you use SheenUI Button, set its loading prop instead, which shows the spinner, ignores clicks and sets aria-busy for you, so you do not need to compose the pieces by hand.


## Related pages

- [Progress](https://lokendra-builds.github.io/sheenui/components/progress)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)
- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Tooltip](https://lokendra-builds.github.io/sheenui/components/tooltip)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
