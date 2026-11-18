Canonical: https://lokendra-builds.github.io/sheenui/components/button-group

# React Button Group with Roving Focus

URL: https://lokendra-builds.github.io/sheenui/components/button-group
Sidebar name: Button group

A React button group: buttons joined into one control with squared inner corners, one tab stop and arrow-key navigation. Tailwind CSS v4, MIT.

What it is: A React button group that joins related buttons into one control, with attached corners and arrow-key roving focus. Use ButtonGroup to join related buttons into one control: a Day, Week, Month switch, a split action, or an editor toolbar with Cut, Copy and Paste.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button-group.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Button group

Files to copy from `theme/src/`:

- `components/button-group/`
- `hooks/{use-direction.ts, use-latest.ts}`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: button-group. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ButtonGroup } from "@/components/sheenui/button-group/button-group";
import { Button } from "@/components/sheenui/button/button";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, ButtonGroup } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-label | string | optional, no default | Accessible name of the group, e.g. "Text alignment". Give one when the buttons only make sense together. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Direction of the row and of the arrow keys. |

## Example: Horizontal and vertical

Any Button variant works inside; keep one size in a group.

```tsx
import { ButtonGroup } from "@/components/sheenui/button-group/button-group";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Button, ButtonGroup } from "@sheenui/theme";

export function Example() {
  return (
    <div className="flex flex-col items-start gap-5">
      <ButtonGroup aria-label="View">
        <Button variant="glass">Day</Button>
        <Button variant="glass">Week</Button>
        <Button variant="glass">Month</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Actions" orientation="vertical">
        <Button variant="outline" size="sm">Copy</Button>
        <Button variant="outline" size="sm">Paste</Button>
        <Button variant="outline" size="sm" disabled>Cut</Button>
      </ButtonGroup>
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Focuses the group once, on the button that was last focused (the first at first). |
| ← / → | Move to the previous or next button (↑ / ↓ when vertical). It wraps. |
| Home / End | Jump to the first or last button. |
| Enter / Space | Press the focused button. |

## Accessibility

- The group is role="group"; name it with aria-label when the buttons only make sense together ("View", "Text alignment").
- Each button keeps its own name and state: use aria-pressed on toggle buttons. Disabled buttons are skipped by the arrow keys.
- Roving focus keeps a long toolbar to one tab stop. Targets stay 44px on touch screens.
- In right-to-left pages the arrow keys follow the reading direction.

## When to use the button group

- Use ButtonGroup for a Day, Week, Month switch above a chart, a split action with a dropdown caret, or the Cut, Copy and Paste buttons of an editor toolbar.
- Use orientation="vertical" for a stacked group, for example next to a sidebar; the arrow keys follow the direction.
- Give the group an aria-label so the role="group" has a name, and give toggle buttons aria-pressed so their state is announced.
- Skip it when the choice is exclusive and belongs to a form. Use SegmentedControl for one of a few values and Toggle or ToggleGroup for pressed states.
- Pair it with Tooltip on icon-only buttons and DropdownMenu for a split button's menu.


## Button group, toggle group or segmented control?

The three look alike and answer different questions. ButtonGroup joins buttons that each run their own action (Copy, Paste, Cut). ToggleGroup keeps a pressed state for each button, for formatting such as bold and italic. SegmentedControl holds exactly one selected value and belongs in a form. Pick by what the control remembers: nothing, a set of pressed buttons, or one value.


## Frequently asked questions

### How do I group buttons in React with SheenUI?

Wrap Button elements in ButtonGroup. It adds no surface of its own: the buttons keep their variant, hover and press motion, and the group only joins their edges and handles the keys.

### How does keyboard navigation work?

Tab focuses the group once. The arrow keys move between the buttons, Home and End jump to the ends, and Enter or Space presses the focused one. Disabled buttons are skipped.

### Can I mix links and buttons?

Yes. Any Button, including one rendered as a link through the render prop, can sit in the group.

### Is ButtonGroup the same as SegmentedControl?

No. ButtonGroup arranges independent actions. SegmentedControl is a form control that holds one selected value.

### Why does the group have one tab stop?

The group uses roving focus: Tab lands on one button and the arrow keys move between the rest. A toolbar of ten buttons then costs a keyboard user one Tab press instead of ten, and focus returns to the button that was last used.

### What do I pass for a vertical group, and does it work right to left?

Pass orientation="vertical". The arrow keys then move with up and down. On a right-to-left page the left and right arrows follow the reading direction.


## Related pages

- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Toolbar](https://lokendra-builds.github.io/sheenui/layout/toolbar)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)
- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
