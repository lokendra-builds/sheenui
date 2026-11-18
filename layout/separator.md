Canonical: https://lokendra-builds.github.io/sheenui/layout/separator

# React Separator & Divider with Label

URL: https://lokendra-builds.github.io/sheenui/layout/separator
Sidebar name: Separator

A React separator for horizontal or vertical dividers, solid, fading or dashed, with an optional label. Built from borders, so High Contrast mode keeps it.

What it is: A React separator for hairline dividers, horizontal or vertical, solid, fading or dashed, with an optional label. Use it as a React divider between groups in a settings page, such as Account and Notifications, where a fading or solid hairline gives the page rhythm without adding another card.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/separator.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Separator

Files to copy from `theme/src/`:

- `components/separator/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: separator. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Input } from "@/components/sheenui/input/input";
import { Separator } from "@/components/sheenui/separator/separator";
```

These examples also use button, input: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/input.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Input, Separator } from "@sheenui/theme";
```

## Separator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | Direction of the line. Vertical separators stretch to the height of their row. |
| variant | "line" \| "fade" \| "dashed" | "line" | "line" hairline (default), "fade" softens toward the ends, "dashed" for looser groupings. |
| label | ReactNode | optional, no default | Text or node in the middle of the line, e.g. "or", "Today". |
| labelAlign | "center" \| "end" \| "start" | "center" | Where the label sits along the line. |
| labelVariant | "text" \| "pill" | "text" | "text" (default) or "pill": the label sits in a small glass chip. |
| decorative | boolean | false | Purely visual: hidden from assistive tech (no role="separator"). |
| className | string | optional, no default | Extra classes for the outer element, merged after the built-in ones so they can override its spacing or color. |
| labelClassName | string | optional, no default | Adds a class name to the label element. |

## Example 1 of 2: Variants and orientation

Vertical separators stretch to the height of their row.

```tsx
import { Separator } from "@/components/sheenui/separator/separator";
// Package build (after the first npm release, or a packed tarball): import { Separator } from "@sheenui/theme";

export function Example() {
  return (
    <>
      {/* "line" is a hairline, "fade" fades out at both ends */}
      {(["line", "fade", "dashed"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs">variant="{variant}"</span>
          <Separator variant={variant} />
        </div>
      ))}

      <div className="flex h-5 items-center gap-3">
        <a href={"/docs"}>Docs</a>
        <Separator orientation="vertical" />
        <a href={"/blog"}>Blog</a>
        <Separator orientation="vertical" variant="fade" />
        <a href={"/changelog"}>Changelog</a>
      </div>
    </>
  );
}
```

## Example 2 of 2: Labeled

A label in the middle (“or”), in a glass pill, or at the start of the line. Screen readers hear the label as the separator's name.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Input } from "@/components/sheenui/input/input";
import { Separator } from "@/components/sheenui/separator/separator";
// Package build (after the first npm release, or a packed tarball): import { Button, Input, Separator } from "@sheenui/theme";
import { Code as GithubIcon, Globe as GoogleIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <Button variant="glass" fullWidth leading={<GoogleIcon />}>Continue with Google</Button>
      <Button variant="glass" fullWidth leading={<GithubIcon />}>Continue with GitHub</Button>
      <Separator label="or" variant="fade" />
      <Input label="Email" type="email" />

      <Separator label="Today" labelVariant="pill" />
      <Separator label="Advanced" labelAlign="start" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a separator is not interactive. |

## Accessibility

- role="separator" with the matching orientation; a separator with a label keeps its text readable and its children are presentational to assistive tech.
- Use a decorative separator only to group visually; it does not replace headings or landmarks.

## When to use Separator

- Use it to split a toolbar into clusters with a vertical hairline, or to divide Account from Notifications settings with a fading rule and a centered label, instead of nesting another card.
- Use a labeled separator with the word or between a password form and social sign-in buttons, with labelVariant="pill" when the label should sit in a small glass chip.
- Use orientation="vertical" between items in a row, such as a toolbar of stats or a footer's links, where the line stretches to the height of its row.
- Skip it when the break is structural and a screen reader user should find it; use a real heading or landmark, because a decorative separator does not replace either.
- Pair it with GlassCard to divide its sections, Toolbar, which has its own ToolbarSeparator for control groups, and Menu for dividing action groups in a dropdown.


## Frequently asked questions

### How do I add a react separator with text in the middle?

Pass label to Separator, for example "or". Choose where it sits with labelAlign, start, center or end, and its look with labelVariant, text or pill. The label also names the separator for screen readers, and labelClassName styles it. A line segment runs on each side of the label, and with labelAlign start or end the segment before or after it shrinks to a short lead-in.

### Is a separator announced by screen readers?

By default it has role="separator" with the matching orientation, and a labeled one keeps its text readable. If the line is purely visual, set decorative and it is hidden from assistive technology. It is not focusable, so Tab skips it either way.

### What line styles are available?

The variant prop takes line, a plain hairline, fade, which fades toward the ends, or dashed. Orientation is horizontal or vertical. Line and dashed are drawn with borders, and the fade gradient falls back to a real border in forced colors, so the line survives Windows High Contrast mode, which would otherwise drop backgrounds.

### Why is my vertical separator not showing?

A vertical separator stretches to the height of its row with self-stretch, which only works inside a flex or grid container. On its own it falls back to a minimum height of 16px, or 4rem with a label. Put it in a flex row that has a height, such as h-6 items-center, and it fills that height.


## Related pages

- [Stepper](https://lokendra-builds.github.io/sheenui/layout/stepper)
- [Timeline](https://lokendra-builds.github.io/sheenui/layout/timeline)
- [Toolbar](https://lokendra-builds.github.io/sheenui/layout/toolbar)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)
- [Breadcrumb](https://lokendra-builds.github.io/sheenui/layout/breadcrumb)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
