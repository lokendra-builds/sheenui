Canonical: https://lokendra-builds.github.io/sheenui/components/tooltip

# React Tooltip Component with Glass Style

URL: https://lokendra-builds.github.io/sheenui/components/tooltip
Sidebar name: Tooltip

A small glass tooltip for React that opens on hover and keyboard focus, with instant hand-off between tooltips. Base UI, Tailwind CSS v4, free, MIT.

What it is: A glass React tooltip that appears on hover and keyboard focus; inside a provider, moving between tooltips is instant. Use Tooltip as a glass tooltip to name an icon-only toolbar button on hover or focus, such as Bold or Export, adding the shortcut in the text when there is one.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/tooltip.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Tooltip

Files to copy from `theme/src/`:

- `components/tooltip/`
- `hooks/use-controllable.ts`
- `lib/{cn.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: tooltip. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Tooltip, TooltipProvider } from "@/components/sheenui/tooltip/tooltip";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | ReactNode | required | What the tooltip says. |
| children | ReactElement<unknown, string \| JSXElementConstructor<any>> | required | The element that shows the tooltip on hover, keyboard focus or (touch) a long press. Must accept a ref (a native element or a SheenUI component). |
| side | "top" \| "bottom" \| "left" \| "right" | "top" | Which side of the trigger it opens on. It flips when there is no room. |
| align | "center" \| "end" \| "start" | "center" | Alignment along that side: "start", "center" or "end". |
| delay | number | 300 | Sets the delay before showing, in ms. |
| open | boolean | optional, no default | Open state (controlled). Pair with onOpenChange. Leave it out to let hover, focus and touch decide. |
| defaultOpen | boolean | false | Starting open state when uncontrolled. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the tooltip wants to open or close (hover, focus, Escape, touch hold). |
| disabled | boolean | false | Never show the tooltip (the trigger still works). |
| className | string | optional, no default | Adds extra classes to the tooltip bubble. |

## Example 1 of 2: Icon toolbar

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Tooltip, TooltipProvider } from "@/components/sheenui/tooltip/tooltip";
// Package build (after the first npm release, or a packed tarball): import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";
import { Bold as BoldIcon, Italic as ItalicIcon } from "lucide-react";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Bold">
        <Button variant="glass" size="icon" aria-label="Bold"><BoldIcon /></Button>
      </Tooltip>
      <Tooltip content="Italic" side="bottom">
        <Button variant="glass" size="icon" aria-label="Italic"><ItalicIcon /></Button>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Example 2 of 2: Sides and delay

side picks the edge it opens on. delay is how long the pointer must rest before it opens; 0 shows it at once. A TooltipProvider makes moving between tooltips instant.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Tooltip, TooltipProvider } from "@/components/sheenui/tooltip/tooltip";
// Package build (after the first npm release, or a packed tarball): import { Button, Tooltip, TooltipProvider } from "@sheenui/theme";

export function Example() {
  return (
    <TooltipProvider>
      <Tooltip content="Opens above (the default)">
        <Button variant="glass">Top</Button>
      </Tooltip>
      <Tooltip content="Opens to the right" side="right">
        <Button variant="glass">Right</Button>
      </Tooltip>
      <Tooltip content="Opens at once" delay={0}>
        <Button variant="glass">No delay</Button>
      </Tooltip>
      <Tooltip content="Waits a full second" delay={1000} side="bottom">
        <Button variant="glass">Slow</Button>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Focusing the trigger shows the tooltip; leaving it hides it. |
| Escape | Dismiss the tooltip while keeping focus on the trigger. |

## Accessibility

- Tooltip adds no tab stop of its own; the trigger keeps its own. The bubble has role=“tooltip” and, while it is open, the trigger points to it with aria-describedby (added to any description it already has), so the text is announced as its description. It describes, it does not name: an icon-only trigger still needs its own aria-label.
- Keep it to a short label. Anything interactive belongs in a Popover; essential text must not live only in a tooltip.
- The bubble stays open while the pointer moves onto it (so it can be read while magnified) but holds no controls. On touch screens a long press (about half a second) shows it for a couple of seconds, and lifting the finger does not activate the trigger; a plain tap never shows it, so never hide the only label of a control in a tooltip. Under reduced motion it only fades.

## When to use Tooltip

- Use Tooltip to label icon-only buttons in an editor toolbar (Bold, Italic, Export) on hover and on keyboard focus, and put the shortcut, such as Ctrl+B, beside the name.
- Use it for short supplementary hints on a form, like why a field wants a particular format, where the hint is useful but nobody is blocked without it.
- Use TooltipProvider once near the app root so moving between neighboring triggers shows the next tip at once, and use delay to tune the 300ms default.
- Skip it when the content is essential, long or interactive. Use Popover for controls, HoverCard for a rich preview, and plain visible text when a label must always be readable.
- Pair it with Button using size icon, Kbd to show shortcuts inside the tip, and Avatar or Badge when a name or status needs a short explanation.


## Frequently asked questions

### How do I add a react tooltip with SheenUI?

Wrap a single element that accepts a ref in Tooltip and pass content as the text. Choose side, which defaults to top and flips near the viewport edge, align, and delay in ms, 300 by default. Use open with onOpenChange to control it, or disabled to switch it off.

### Does the tooltip work with the keyboard and touch?

It shows when the trigger gets focus and hides on blur or Escape, and the trigger keeps its own tab stop. On touch, a long press of about half a second shows it for a couple of seconds, and lifting the finger does not activate the trigger.

### Is the tooltip text announced by screen readers?

The bubble has role tooltip and, while open, the trigger points to it with aria-describedby, merged with any description the trigger already has. It describes but does not name, so an icon-only button still needs its own aria-label. Never hide a control's only label inside a tooltip.

### Why use TooltipProvider?

It lets people move from one trigger to the next and see the next tooltip instantly instead of waiting out the delay again. Place it once near the app root. It renders no element and adds no tab stops, and each Tooltip inside keeps its own behavior.


## Related pages

- [Alert](https://lokendra-builds.github.io/sheenui/components/alert)
- [Avatar](https://lokendra-builds.github.io/sheenui/components/avatar)
- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Button group](https://lokendra-builds.github.io/sheenui/components/button-group)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
