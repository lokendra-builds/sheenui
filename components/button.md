Canonical: https://lokendra-builds.github.io/sheenui/components/button

# Glass Button for React: Animated & Accessible

URL: https://lokendra-builds.github.io/sheenui/components/button
Sidebar name: Button

Glassy React buttons with Motion: they lift on hover, press on tap, and filled ones catch a sweep of light. Base UI, Tailwind CSS v4, reduced-motion safe.

What it is: A glass button for React is a button that lifts on hover and presses down on tap, with a sweep of light across the filled variants, animated with Motion and kept still under reduced motion.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Button

Files to copy from `theme/src/`:

- `components/button/`
- `components/spinner/`
- `hooks/{use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, state-light.tsx}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: button. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "link" \| "danger" \| "primary" \| "glass" \| "outline" \| "ghost" | "primary" | Look: "primary" (accent fill), "glass" (frosted), "outline" (edge only), "ghost" (text only), "link" (inline link look) or "danger" (destructive). |
| size | "sm" \| "md" \| "lg" \| "icon" | "md" | Height and padding, the same scale as every form field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), or "icon" for a square as tall as "md". |
| loading | boolean | false | Shows a spinner, ignores clicks and sets aria-busy. Focus stays on the button. |
| leading | ReactNode | optional, no default | Renders an icon before the children. |
| trailing | ReactNode | optional, no default | Renders an icon after the children. |
| fullWidth | boolean | false | Stretch to the full width of the container. |
| stateLight | boolean | false | Lights the button by state: loading glows in the accent colour (data-state="working"), and a data-state of "success", "warning" or "error" flashes its own glow once (an aura, a light pool and a lit edge, drawn on the button's own layer). The state is never conveyed by light alone: keep the label or icon that says it. Off with reduced transparency and forced colours; instant with reduced motion. |
| nativeButton | boolean | true; false when render is a non-button element | Whether the rendered element is a native <button>. Defaults to true, or to false when render is something else (e.g. a link): then type/disabled are not added and the disabled state is announced with aria-disabled instead. |
| render | ReactElement | optional, no default | Render as another element with the button's look, e.g. a router link: render={<Link to="/" />}. |

## Example 1 of 3: Variants

```tsx
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="danger">Delete</Button>
    </>
  );
}
```

## Example 2 of 3: Sizes and icons

```tsx
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button } from "@sheenui/theme";
import { ArrowRight as Arrow } from "lucide-react";

export function Example() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="md" trailing={<Arrow />}>Continue</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="glass" aria-label="Next"><Arrow /></Button>
    </>
  );
}
```

## Example 3 of 3: Loading and disabled

Loading shows a spinner, disables the button and sets aria-busy.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button } from "@sheenui/theme";

export function Example() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
        Save changes
      </Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move focus to or from the button (visible focus ring). |
| Enter / Space | Activate it. When render is a link, Enter follows the link like any link. |

## Accessibility

- A native <button type="button"> by default; with render it becomes a link or your router's Link with the same look.
- While loading, the button stays focusable (aria-disabled, aria-busy) and ignores clicks, so focus is never lost.
- An icon-only button (size="icon") needs an aria-label.
- Touch targets are at least 44 x 44 px; forced colors keep a ButtonText border.

## When to use Button

- Use Button as a glassy, animated button in React for the main call to action on a landing page, with the primary variant for the one action you want taken and glass or ghost for secondary choices beside it.
- Use the loading prop on a Save or Pay button so the click is ignored while a request runs, the spinner shows, and focus stays on the button.
- Use the render prop to make a router link look and behave like a button, for example a See pricing link, without nesting an anchor inside a button element.
- Skip it when the control chooses a value or a view, not an action. Use Toggle for a pressed state, SegmentedControl for one of a few options, and Tabs for switching panels.
- Pair it with Dialog and Popover triggers through the render prop, Spinner or BorderBeam as children, and Tooltip to name an icon-only button with the icon size.


## Frequently asked questions

### How do I build a glass button in React with SheenUI?

Set variant to glass. It renders one frosted glass-1 surface with a light ripple from the press point. The other variants are primary, outline, ghost, link and danger. Sizes are sm, md and lg, plus icon for a 40px square, and fullWidth stretches it across its container.

### What happens to a button while loading is true?

It shows a spinner, ignores clicks and sets aria-busy. It uses aria-disabled instead of the disabled attribute, so keyboard focus is never lost mid-action. A click handler is skipped, and preventDefault also cancels a form submit or a link navigation while the work runs.

### Can the button render as a link or a Base UI trigger?

Yes, through the render prop: Button render={<Link to="/pricing" />}. Link semantics are kept, and type and disabled are not added; a disabled state is announced with aria-disabled. It also works as the render target of Base UI triggers such as DialogTrigger.

### How do I recolor the danger button?

The danger fill is a gradient background-image over a solid color of the same red. To recolor, override both, for example className bg-orange-700 with the arbitrary class [background-image:none], or set the --sheen-danger-fill variable. Overriding only the background color leaves the gradient visible.


## Related pages

- [Border beam](https://lokendra-builds.github.io/sheenui/effects/border-beam)
- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Button group](https://lokendra-builds.github.io/sheenui/components/button-group)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)
- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)

### Guides that cover it

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)
- [Glassmorphism in React: A Step-by-Step Tutorial](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-react-tutorial)
- [Apple Liquid Glass in CSS and React](https://lokendra-builds.github.io/sheenui/guides/liquid-glass-css-react)
- [Accessible Glassmorphism](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism)
- [Glassmorphism vs Liquid Glass vs Neumorphism](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-vs-liquid-glass)
- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)
- [Base UI vs Radix UI for React in 2026](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix)
- [shadcn Glassmorphism: Three Ways to Get a Glass UI](https://lokendra-builds.github.io/sheenui/guides/shadcn-glassmorphism)
- [Glassmorphism UI Prompts for AI Coding Agents](https://lokendra-builds.github.io/sheenui/guides/glassmorphism-ui-prompt)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
