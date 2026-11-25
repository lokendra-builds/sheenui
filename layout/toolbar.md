Canonical: https://lokendra-builds.github.io/sheenui/layout/toolbar

# Accessible React Toolbar with Toggle Groups

URL: https://lokendra-builds.github.io/sheenui/layout/toolbar
Sidebar name: Toolbar

A glass React toolbar with one tab stop and arrow-key navigation across buttons, toggles, menus and links, with a sliding pill for single-choice groups.

What it is: A glass React toolbar that groups related controls behind a single tab stop, moved through with the arrow keys.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toolbar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Toolbar

Files to copy from `theme/src/`:

- `components/toolbar/`
- `components/kbd/`
- `components/tooltip/`
- `hooks/{use-controllable.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, popup-motion.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: toolbar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/sheenui/menu/menu";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarSeparator, ToolbarSpacer, ToolbarToggle, ToolbarToggleGroup } from "@/components/sheenui/toolbar/toolbar";
```

These examples also use menu: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/menu.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger, Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarSeparator, ToolbarSpacer, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
```

## Toolbar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | Sets the layout direction of the toolbar and its arrow-key navigation. |
| variant | "glass" \| "plain" \| "floating" | "glass" | "glass" panel (default), "floating" pill for selection / canvas toolbars, or "plain" (no surface). |
| size | ToolbarSize | "md" | Control height: "sm" (32px) or "md" (36px, default). |
| overflow | "wrap" \| "scroll" | "wrap" | Horizontal toolbars on narrow screens: wrap onto more rows (default), or scroll sideways in one row. |
| className | string | optional, no default | Adds a class name to the toolbar element. |
| contentClassName | string | optional, no default | overflow="scroll" only: the scrolling row inside the toolbar. |
| loopFocus | boolean | true | Arrow keys wrap from the last control to the first. |
| disabled | boolean | false | Disables every control in the toolbar. |
| aria-label | string | optional, no default | Name of the toolbar (required when there is more than one). |

## ToolbarButton / ToolbarToggle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tooltip | ReactNode | optional, no default | Tooltip text. For an icon-only control it also becomes the accessible name (unless aria-label is set). |
| shortcut | string | optional, no default | Keyboard shortcut shown in the tooltip, e.g. "mod+b". Also set as aria-keyshortcuts. |
| tooltipSide | "top" \| "bottom" \| "left" \| "right" | "top" ("right" in a vertical toolbar) | Which side the tooltip opens on. |
| iconOnly | boolean | optional, no default | Square button for a lone icon. Detected automatically for a single element child. |
| className | string | optional, no default | Adds extra classes to the button. |
| disabled | boolean | false | Dimmed but still focusable. |
| render | ReactElement | optional, no default | ToolbarButton: render as a popup trigger, e.g. <MenuTrigger />. |
| value | string | optional, no default | Names the ToolbarToggle inside a ToolbarToggleGroup. |
| pressed / defaultPressed / onPressedChange | boolean / boolean / (pressed) => void | optional, no default | ToolbarToggle on its own. |

## ToolbarToggleGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| multiple | boolean | false | When false only one item in the group can be pressed. If any item in the group becomes pressed, the others will become unpressed. When true multiple items can be pressed. |
| required | boolean | false | Single choice: one option always stays pressed (pressing the pressed one again does nothing), e.g. text alignment or the active tool. |
| className | string | optional, no default | Extra classes for the group. |
| value / defaultValue | string[] | optional, no default | Values of the buttons that are pressed (controlled or initial). |
| onValueChange | (value: string[]) => void | optional, no default | Called with the new pressed values. |
| aria-label | string | optional, no default | Name of the group, e.g. “Alignment”. |

## ToolbarGroup, ToolbarSeparator, ToolbarSpacer, ToolbarLink, ToolbarInput

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| ToolbarGroup | aria-label, disabled | optional, no default | A labeled cluster of controls. |
| ToolbarSeparator | className | optional, no default | Draws a hairline between clusters, perpendicular to the toolbar. |
| ToolbarSpacer | className | optional, no default | Pushes what follows to the far end. |
| ToolbarLink | href, render | optional, no default | A link in the arrow-key order (render your router's Link). |
| ToolbarInput | input props | optional, no default | A text field; at most one, as the last control. 16px text on touch screens. |

## Example 1 of 4: Text editor

Tab into the toolbar once, then use the arrow keys (Home and End jump). The disabled Redo stays focusable so it can be discovered. Try the formatting on the paragraph below.

```tsx
import { useState } from "react";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/sheenui/menu/menu";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink, ToolbarSeparator, ToolbarSpacer, ToolbarToggle, ToolbarToggleGroup } from "@/components/sheenui/toolbar/toolbar";
// Package build (after the first npm release, or a packed tarball): import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger, Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink, ToolbarSeparator, ToolbarSpacer, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { AlignCenter as AlignCenterIcon, AlignLeft as AlignLeftIcon, AlignRight as AlignRightIcon, Bold as BoldIcon, ChevronDown as ChevronIcon, Italic as ItalicIcon, Link as LinkIcon, Redo2 as RedoIcon, Underline as UnderlineIcon, Undo2 as UndoIcon } from "lucide-react";

type Block = "paragraph" | "h1";
const blockLabels: Record<Block, string> = { paragraph: "Paragraph", h1: "Heading 1" };

export function Example() {
  const [marks, setMarks] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string[]>(["left"]);
  const [block, setBlock] = useState<Block>("paragraph");

  return (
    <Toolbar aria-label="Formatting">
      <ToolbarGroup aria-label="History">
        <ToolbarButton tooltip="Undo" shortcut="mod+z"><UndoIcon /></ToolbarButton>
        <ToolbarButton tooltip="Redo" shortcut="shift+mod+z" disabled><RedoIcon /></ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <Menu>
        <ToolbarButton render={<MenuTrigger />}>{blockLabels[block]} <ChevronIcon /></ToolbarButton>
        <MenuContent>
          <MenuRadioGroup value={block} onValueChange={setBlock}>
            <MenuRadioItem value="paragraph">Paragraph</MenuRadioItem>
            <MenuRadioItem value="h1">Heading 1</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <ToolbarSeparator />
      <ToolbarToggleGroup multiple value={marks} onValueChange={setMarks} aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
        <ToolbarToggle value="underline" tooltip="Underline" shortcut="mod+u"><UnderlineIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      {/* Single choice: one accent pill glides between the options; required keeps one pressed. */}
      <ToolbarToggleGroup required value={align} onValueChange={setAlign} aria-label="Alignment">
        <ToolbarToggle value="left" tooltip="Align left"><AlignLeftIcon /></ToolbarToggle>
        <ToolbarToggle value="center" tooltip="Align center"><AlignCenterIcon /></ToolbarToggle>
        <ToolbarToggle value="right" tooltip="Align right"><AlignRightIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Insert link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarSpacer />
      <ToolbarLink href={"/history"}>Edited 2m ago</ToolbarLink>
    </Toolbar>
  );
}
```

## Example 2 of 4: Floating selection toolbar

variant="floating" is a glass pill for selection menus and canvases.

```tsx
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@/components/sheenui/toolbar/toolbar";
// Package build (after the first npm release, or a packed tarball): import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Bold as BoldIcon, MessageSquare as CommentIcon, Italic as ItalicIcon, Link as LinkIcon, Sparkles as SparkleIcon } from "lucide-react";

export function Example() {
  return (
    <Toolbar variant="floating" size="sm" aria-label="Selection">
      <ToolbarToggleGroup multiple aria-label="Text style">
        <ToolbarToggle value="bold" tooltip="Bold" shortcut="mod+b"><BoldIcon /></ToolbarToggle>
        <ToolbarToggle value="italic" tooltip="Italic" shortcut="mod+i"><ItalicIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarButton tooltip="Link" shortcut="mod+k"><LinkIcon /></ToolbarButton>
      <ToolbarButton tooltip="Comment"><CommentIcon /></ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton><SparkleIcon /> Ask AI</ToolbarButton>
    </Toolbar>
  );
}
```

## Example 3 of 4: Vertical tool palette

Up and Down move between tools; the tooltips open to the side.

```tsx
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@/components/sheenui/toolbar/toolbar";
// Package build (after the first npm release, or a packed tarball): import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@sheenui/theme";
import { Hand as HandIcon, Minus as MinusIcon, Pen as PenIcon, Plus as PlusIcon, MousePointer2 as PointerIcon, Square as SquareIcon, Type as TypeIcon } from "lucide-react";

export function Example() {
  const [tool, setTool] = useState<string[]>(["select"]);

  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <ToolbarToggleGroup required value={tool} onValueChange={setTool} aria-label="Tool">
        <ToolbarToggle value="select" tooltip="Select" shortcut="v"><PointerIcon /></ToolbarToggle>
        <ToolbarToggle value="hand" tooltip="Hand" shortcut="h"><HandIcon /></ToolbarToggle>
        <ToolbarToggle value="pen" tooltip="Pen" shortcut="p"><PenIcon /></ToolbarToggle>
        <ToolbarToggle value="shape" tooltip="Rectangle" shortcut="r"><SquareIcon /></ToolbarToggle>
        <ToolbarToggle value="text" tooltip="Text" shortcut="t"><TypeIcon /></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Zoom in" shortcut="mod+="><PlusIcon /></ToolbarButton>
      <ToolbarButton tooltip="Zoom out" shortcut="mod+-"><MinusIcon /></ToolbarButton>
    </Toolbar>
  );
}
```

## Example 4 of 4: Narrow screens

overflow="scroll" keeps one row that scrolls sideways inside the toolbar; the default wraps onto more rows. Both stay inside their container at 320px.

```tsx
import { Toolbar, ToolbarButton, ToolbarInput } from "@/components/sheenui/toolbar/toolbar";
// Package build (after the first npm release, or a packed tarball): import { Toolbar, ToolbarButton, ToolbarInput } from "@sheenui/theme";

export function Example() {
  // One row that scrolls sideways on narrow screens, with fades on the edges that have more.

  return (
    <>
      <Toolbar overflow="scroll" aria-label="Formatting">
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>

      {/* A search field: at most one, and last (arrow keys move its caret). */}
      <ToolbarInput aria-label="Search in document" placeholder="Search" />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Enter or leave the toolbar once (one tab stop). |
| Arrow Left / Arrow Right (Up / Down when vertical) | Move between controls. |
| Home / End | Jump to the first / last control (also from a disabled control; in a text field the keys move the caret). |
| Enter / Space | Press a button or toggle. |

## Accessibility

- role="toolbar" with roving focus (Base UI): name it with aria-label and set orientation to match.
- Toggles use aria-pressed; a toolbar toggle group is role="group" and needs its own aria-label.
- tooltip and shortcut add a tooltip and aria-keyshortcuts; an icon-only button needs a tooltip or aria-label.

## All exports on this page

- Toolbar — Toolbar: a row (or column) of related controls with ONE tab stop (Base UI Toolbar).
- ToolbarButton — A button in the toolbar's arrow-key order.
- ToolbarGroup — A labelled cluster of controls (aria-label it, e.g.
- ToolbarInput — A text field in the toolbar (e.g.
- ToolbarLink — A link in the toolbar's arrow-key order, e.g.
- ToolbarSeparator — A hairline between clusters; vertical in a horizontal toolbar and vice versa.
- ToolbarSpacer — Pushes what follows to the far end of the toolbar (a flexible, empty gap).
- ToolbarToggle — A pressable toggle (aria-pressed).
- ToolbarToggleGroup — A set of toggles inside a toolbar.


## When to use Toolbar

- Use it as an editor toolbar for a rich-text editor's formatting row, where Tab enters once and arrow keys move between Bold, Italic, alignment and menu buttons instead of tabbing through twenty controls. It is an accessible toolbar with roving tabindex: Tab enters it once and the arrow keys move between the controls.
- Use variant="floating" for a selection toolbar over text or a canvas, a glass pill that appears next to the thing being edited.
- Use orientation="vertical" for a tool palette in a design or whiteboard app, where Up and Down move between tools and tooltips open to the side.
- Skip it for a handful of unrelated buttons in a page header; plain Buttons are simpler there, and Menubar fits an application's File and Edit menus with dropdowns.
- Pair it with Menu through ToolbarButton's render prop, Tooltip text already built in through the tooltip prop, and Kbd to show a shortcut such as mod+b.


## Frequently asked questions

### How do I build a react toolbar with arrow key navigation?

Wrap controls in Toolbar and use ToolbarButton, ToolbarToggle, ToolbarLink and ToolbarInput. The toolbar is a single tab stop: arrow keys move focus, Home and End jump to the ends, and loopFocus, on by default, wraps from last to first. Give it an aria-label.

### How do toggle groups differ for single and multiple choice?

ToolbarToggleGroup is single choice by default, with one accent pill gliding between options; add required to keep one pressed, as with alignment. With multiple, toggles are independent, such as bold, italic and underline, and each blooms its own tint. value takes an array of strings.

### How do icon-only buttons get an accessible name and a shortcut?

Set tooltip on ToolbarButton or ToolbarToggle. It shows the tooltip and, for an icon-only control, becomes the accessible name. Add shortcut, such as "mod+b", to show it in the tooltip and expose it as aria-keyshortcuts. A disabled control stays focusable so it can be discovered.

### What happens on narrow screens?

The default overflow="wrap" flows controls onto more rows. Set overflow="scroll" to keep one row that scrolls sideways inside the toolbar, styled through contentClassName. The scrolling row fades at the edges that hide more controls and scrolls a focused control into view, and controls grow to at least 44px on touch screens regardless of size.


## Related pages

- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Aspect ratio](https://lokendra-builds.github.io/sheenui/layout/aspect-ratio)
- [Breadcrumb](https://lokendra-builds.github.io/sheenui/layout/breadcrumb)
- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)
- [Pagination](https://lokendra-builds.github.io/sheenui/layout/pagination)
- [Resizable panels](https://lokendra-builds.github.io/sheenui/layout/resizable)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
