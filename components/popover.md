Canonical: https://lokendra-builds.github.io/sheenui/components/popover

# React Popover Component with Glass Panel

URL: https://lokendra-builds.github.io/sheenui/components/popover
Sidebar name: Popover

A glassmorphism popover for React, anchored to a button for small forms and details. Escape and outside click close it. Base UI, Tailwind CSS v4, MIT.

What it is: A glass React popover anchored to its trigger, for small forms and details; Escape or a click outside closes it. Use Popover as a glass popover for a small filter panel opened from a toolbar button, where a few controls and an Apply action fit in a panel anchored to the button.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/popover.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Popover

Files to copy from `theme/src/`:

- `components/popover/`
- `components/drawer/parts/sheet.tsx`
- `hooks/{use-latest.ts, use-media-query.ts}`
- `lib/{cn.ts, form.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: popover. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Input } from "@/components/sheenui/input/input";
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/sheenui/popover/popover";
```

These examples also use button, input: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/input.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| modal | boolean \| "trap-focus" | false (a sheet: true) | Traps focus and locks scroll while open (Base UI's modal). A sheet is modal unless you set this. |
| mobile | MobilePresentation | "popup" | How the panel opens on a phone-width screen (max-width: 640px): "popup" is the usual panel next to the trigger; "sheet" is a bottom sheet with a drag handle, swipe-down to dismiss, a scrollable body capped at 85 dvh and home-indicator padding. Escape closes and focus returns to the trigger in both. |
| Popover open / defaultOpen | boolean | false | Controls whether the popover is open (open), or sets its initial state (defaultOpen). |
| PopoverTrigger render | ReactElement | optional, no default | Render as your own element, e.g. render={<Button />}. |
| PopoverContent side | "top" \| "bottom" \| "left" \| "right" | "bottom" | Side of the trigger it opens on. |
| PopoverContent align | "start" \| "center" \| "end" | "center" | Sets the alignment along that side. |
| PopoverContent sideOffset | number (px) | 8 | Gap between the trigger and the popover. |
| Popover ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example onOpenChange, onOpenChangeComplete, actionsRef, modal, triggerId, defaultTriggerId). |
| PopoverTrigger ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example nativeButton, id, className, style, handle, payload). |
| PopoverContent ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style, className, render, initialFocus, finalFocus). |

## PopoverContent props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<PopoverLabels> | defaultPopoverLabels | Spoken text. Merged over defaultPopoverLabels. Every other string, for translation: labels={{ close: "…" }}; omitted keys keep the English of defaultPopoverLabels. Its only key is listed in the key table under the props table. |
| side | "top" \| "bottom" \| "left" \| "right" | "bottom" | Preferred side of the trigger. It flips when there is no room. |
| align | "center" \| "end" \| "start" | "center" | Sets the alignment along that side. |
| sideOffset | number | 8 | Gap between trigger and panel, in px. |

## Example 1 of 3: Share link

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Input } from "@/components/sheenui/input/input";
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/sheenui/popover/popover";
// Package build (after the first npm release, or a packed tarball): import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="glass" />}>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
        <Input readOnly defaultValue="https://example.com/blocks" />
        <PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
```

## Example 2 of 3: Placement and a controlled panel

side and align place the panel; open and onOpenChange let your code close it after saving.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Input } from "@/components/sheenui/input/input";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/sheenui/popover/popover";
// Package build (after the first npm release, or a packed tarball): import { Button, Input, Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Q3 roadmap");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="glass" />}>{name}</PopoverTrigger>
      <PopoverContent side="right" align="start" className="flex w-72 flex-col gap-3">
        <PopoverTitle>Rename</PopoverTitle>
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
      </PopoverContent>
    </Popover>
  );
}
```

## Example 3 of 3: Bottom sheet on phones

mobile='sheet' presents the panel as a bottom sheet under 640px wide, modal with a drag handle and swipe-to-dismiss. The default, 'popup', keeps the anchored panel. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/sheenui/popover/popover";
// Package build (after the first npm release, or a packed tarball): import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Popover mobile="sheet">
      <PopoverTrigger render={<Button variant="glass">Details</Button>} />
      <PopoverContent>
        <PopoverTitle>Billing</PopoverTitle>
        <PopoverDescription>Next invoice on 1 Dec.</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open or close it from the trigger; focus moves into the panel. |
| Tab / Shift + Tab | Cycle inside the panel. |
| Escape | Close it and return focus to the trigger. |

## Accessibility

- The trigger gets aria-expanded and aria-haspopup; the panel is labeled by PopoverTitle when you render one.
- Use a Popover for interactive content; use a Tooltip for a short label and a HoverCard for a preview.
- Under reduced motion the panel only fades.

## All exports on this page

- Popover — Glass popover: a small floating panel anchored to a button, for extra controls or details that do not deserve a full dialog.
- PopoverClose — A button inside PopoverContent that closes the popover (for "Done" or "Cancel" actions).
- PopoverContent — The glass panel of a Popover, portalled to the end of the body and positioned next to the trigger.
- PopoverDescription — Muted helper text under the title.
- PopoverTitle — The popover's heading.
- PopoverTrigger — The element that opens a Popover.
- defaultPopoverLabels — English defaults of PopoverLabels.


## When to use Popover

- Use Popover for a Filters or Share button in a toolbar that opens a compact panel with a few fields and a confirm action, kept next to the button so the page behind stays in view.
- Use it for an account menu with a profile summary and a sign out button, or a share panel with a link field, where content stays near the trigger.
- Use side, align and sideOffset on PopoverContent to place the panel, knowing it flips to the other side when there is no room in the viewport.
- Skip it when the content is a plain hint or a list of commands. Use Tooltip for a label on hover, Menu for actions, and Dialog when the task needs the whole page's attention.
- Pair it with Button through the render prop on PopoverTrigger, Field and Switch for settings inside the panel, and Calendar when a date picker needs custom content.


## Frequently asked questions

### How do I build a React popover with SheenUI?

Compose Popover with PopoverTrigger and PopoverContent, then PopoverTitle, PopoverDescription and your controls inside. Popover holds open, defaultOpen and onOpenChange and renders no element. It wraps Base UI Popover, so positioning, outside-press handling and focus management are included.

### How does the popover behave with the keyboard?

Enter or Space on the trigger toggles it, focus moves into the panel, and Tab cycles inside it. Escape or an outside press closes it and returns focus to the trigger. The trigger gets aria-expanded and aria-controls automatically; the panel is a dialog named by PopoverTitle.

### Can I change the popover width and position?

The panel is w-72 and never wider than the viewport minus 2rem; override it with className. side defaults to bottom, align to center and sideOffset to 8px. A preferred side flips when there is no room. Everything else passes to the Base UI popup.

### What does the popover do with reduced motion or transparency?

The panel is a glass-2 surface that fades and springs in from the trigger side. With reduced motion it only fades. Reduced transparency and forced colors both give it a solid surface, so text stays readable when the backdrop blur is switched off by the user.


## Related pages

- [Progress](https://lokendra-builds.github.io/sheenui/components/progress)
- [Select](https://lokendra-builds.github.io/sheenui/components/select)
- [Slider](https://lokendra-builds.github.io/sheenui/components/slider)
- [Switch](https://lokendra-builds.github.io/sheenui/components/switch)
- [Spinner](https://lokendra-builds.github.io/sheenui/components/spinner)
- [Tabs](https://lokendra-builds.github.io/sheenui/components/tabs)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
