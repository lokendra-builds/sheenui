Canonical: https://lokendra-builds.github.io/sheenui/layout/collapsible

# React Collapsible with Animated Height

URL: https://lokendra-builds.github.io/sheenui/layout/collapsible
Sidebar name: Collapsible

A React collapsible section with an animated height, a turning chevron and closed content kept out of the tab order. Base UI, Tailwind CSS v4, MIT.

What it is: A React collapsible section that animates its height and keeps closed content out of the page and the tab order. Use it as an expandable section for an Advanced options link at the bottom of a form, so retry limits, timeouts and proxy settings stay out of the way until someone needs them.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/collapsible.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Collapsible

Files to copy from `theme/src/`:

- `components/collapsible/`
- `components/status-icons/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: collapsible. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/sheenui/collapsible/collapsible";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";
```

## Collapsible props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| open / defaultOpen | boolean | false | Controlled / uncontrolled open state. |
| onOpenChange | (open: boolean) => void | optional, no default | Called when it opens or closes. |
| disabled | boolean | false | Locks the section so it cannot be toggled. |
| className | string | optional, no default | Adds extra classes to the root. |

## CollapsibleTrigger and CollapsiblePanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| hideIcon | boolean | false | Hide the chevron (for a custom indicator; read data-panel-open on the trigger). |
| contentClassName | string | optional, no default | Extra classes for the padded box inside the panel. |
| render (Trigger) | ReactElement | optional, no default | Replaces the button with another element. |
| keepMounted (Panel) | boolean | false | Keep closed content in the DOM, hidden. |
| hiddenUntilFound (Panel) | boolean | false | Use hidden=until-found so find-in-page opens it. |

## Example 1 of 2: Basic

Use Accordion when opening one section should close another.

```tsx
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/sheenui/collapsible/collapsible";
// Package build (after the first npm release, or a packed tarball): import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Collapsible className="glass-2 max-w-md rounded-sheen-xl p-2">
      <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
      <CollapsiblePanel>
        Retry limit, request timeout and proxy settings live here. The panel animates its height and keeps
        closed content out of the page.
      </CollapsiblePanel>
    </Collapsible>
  );
}
```

## Example 2 of 2: Controlled

open and onOpenChange drive it from outside. keepMounted holds the content in the DOM (hidden) so form fields inside keep their values.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/sheenui/collapsible/collapsible";
// Package build (after the first npm release, or a packed tarball): import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Button variant="glass" size="sm" className="self-start" onClick={() => setOpen((o) => !o)}>
        {open ? "Collapse" : "Expand"} from outside
      </Button>
      <Collapsible open={open} onOpenChange={setOpen} className="glass-2 rounded-sheen-xl p-2">
        <CollapsibleTrigger>12 more files</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <ul className="list-disc ps-5">
            <li>report-q1.pdf</li>
            <li>report-q2.pdf</li>
            <li>report-q3.pdf</li>
          </ul>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focuses the trigger. |
| Enter / Space | Opens or closes the panel. |

## Accessibility

- The trigger is a real <button> with aria-expanded and aria-controls (Base UI Collapsible).
- Closed content is removed from the page, so its links and fields are neither tabbable nor read. keepMounted keeps it in the DOM but hidden; hiddenUntilFound lets find-in-page open it.
- The chevron is decorative. Triggers are 44px tall on touch screens and show a focus ring.
- Under reduced motion the panel jumps to its open or closed height with no travel.

## When to use Collapsible

- Use it for rarely needed settings at the end of a form, such as retry limits, timeouts and proxy fields behind an Advanced options toggle, so the common path stays short.
- Use it for a Show more list in a file panel or a changelog, where twelve extra rows hide behind one trigger and the section can also be opened from a button elsewhere.
- Use keepMounted when fields inside the section must keep their values while closed, or hiddenUntilFound when the hidden text should still be reachable with the browser's find-in-page.
- Skip it when opening one section should close the others; Accordion manages that for a group, and Dialog or Popover is better when the content should not push the page down.
- Pair it with Button to open it from outside using open and onOpenChange, with Switch and Field for the options inside the panel, and Badge to show a count in the trigger.


## Frequently asked questions

### How do I make a react collapsible section with animated height?

Compose Collapsible, CollapsibleTrigger and CollapsiblePanel. The panel animates its height, the chevron turns, and closed content leaves the tab order. Use defaultOpen for an uncontrolled start, or open with onOpenChange to control it from state. The primitive underneath is Base UI Collapsible.

### Are closed fields still submitted or focusable?

By default closed content is removed from the page, so its links and fields are not tabbable or read by screen readers. Set keepMounted on CollapsiblePanel to keep it in the DOM, hidden, so form fields inside retain their values and still take part in the form.

### How do I use my own indicator instead of the chevron?

Set hideIcon on CollapsibleTrigger and style your indicator from the data-panel-open attribute that the trigger exposes. To change the trigger element, pass render with another element. The trigger is a real button with aria-expanded and aria-controls, 44px tall on touch screens, with a visible focus ring.

### What does it do under prefers-reduced-motion?

The panel jumps straight to its open or closed height with no travel. Nothing else changes: the same keys apply, with Tab focusing the trigger and Enter or Space toggling the panel. The disabled prop locks the section while keeping it visible.


## Related pages

- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Popover](https://lokendra-builds.github.io/sheenui/components/popover)
- [Pagination](https://lokendra-builds.github.io/sheenui/layout/pagination)
- [Resizable panels](https://lokendra-builds.github.io/sheenui/layout/resizable)
- [Scroll area](https://lokendra-builds.github.io/sheenui/layout/scroll-area)
- [Separator](https://lokendra-builds.github.io/sheenui/layout/separator)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
