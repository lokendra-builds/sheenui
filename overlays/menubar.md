Canonical: https://lokendra-builds.github.io/sheenui/overlays/menubar

# React Menubar: Desktop-Style App Menu

URL: https://lokendra-builds.github.io/sheenui/overlays/menubar
Sidebar name: Menubar

A glass desktop-style menubar for React (File, Edit, View) with arrow-key navigation and a tint that glides to the open menu. Base UI, Tailwind CSS v4.

What it is: A glass desktop-style React menubar with File, Edit and View menus, reached with one Tab stop and walked with the arrow keys.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/menubar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Menubar

Files to copy from `theme/src/`:

- `components/menu/`
- `components/menubar/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/status-icons/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, glide-highlight.tsx, popup-a11y.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: menubar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { MenuCheckboxItem, MenuItem, MenuLabel, MenuLinkItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@/components/sheenui/menu/menu";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "@/components/sheenui/menubar/menubar";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger, MenuCheckboxItem, MenuItem, MenuLabel, MenuLinkItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@sheenui/theme";
```

## Menubar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | Which arrow keys move between menus. |
| loopFocus | boolean | true | Arrow keys wrap from the last menu to the first. |
| modal | boolean | true | Lock page scroll and outside clicks while a menu is open. |
| disabled | boolean | false | Disable the whole bar. |
| className | string | optional, no default | Classes for the glass bar. It scrolls sideways if the menus don't fit. |
| Menubar ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style, render). |
| Menu ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example defaultOpen, loopFocus, highlightItemOnHover, modal, onOpenChange, onOpenChangeComplete). |

## MenubarMenu · MenubarTrigger · MenubarContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<MenuLabels> | defaultMenuLabels | Spoken text. Merged over defaultMenuLabels. Every other string, for translation: labels={{ submenu: "…" }}; omitted keys keep the English of defaultMenuLabels. All 2 keys of MenuLabels are listed in the key table under the props table. |
| anchor | Element \| VirtualElement \| RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null | optional, no default | Element to position against instead of the trigger. |
| side | "top" \| "bottom" \| "left" \| "right" \| "inline-start" \| "inline-end" | "bottom" | Preferred side of the trigger; it flips when there is no room. |
| align | "center" \| "end" \| "start" | "start" | Sets the alignment along that side. |
| sideOffset | number | 8 | Gap between the trigger and the menu, in px (each part has its own default). |
| alignOffset | number | -4 | Shift along the alignment axis, in px (each part has its own default). |
| collisionPadding | number | 12 | Space kept from the viewport edges, in px. |
| positionerClassName | string | optional, no default | Classes for the positioner (the fixed element around the popup). |
| MenubarMenu | Menu props (open, onOpenChange…) | optional, no default | Holds one menu in the bar. |
| MenubarTrigger disabled | boolean | false | Disables this menu so it cannot be opened. |

## Example 1 of 2: Notes app

View toggles the sidebar, the word count and the text size; File → Open recent switches notes. Everything else shows a toast.

```tsx
import { useState } from "react";
import { MenuCheckboxItem, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@/components/sheenui/menu/menu";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "@/components/sheenui/menubar/menubar";
// Package build (after the first npm release, or a packed tarball): import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger, MenuCheckboxItem, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@sheenui/theme";
import { File as FileIcon, Printer as PrinterIcon } from "lucide-react";

export function Example() {
  const [sidebar, setSidebar] = useState(true);
  const [size, setSize] = useState("md");

  return (
    <Menubar aria-label="Application menu">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenuItem icon={<FileIcon />} shortcut="mod+n">New note</MenuItem>
          <MenuSub>
            <MenuSubTrigger inset>Open recent</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Meeting notes</MenuItem>
              <MenuItem>Shopping list</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuItem icon={<PrinterIcon />} shortcut="mod+p">Print…</MenuItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenuCheckboxItem checked={sidebar} onCheckedChange={setSidebar} shortcut="mod+\">
            Sidebar
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup value={size} onValueChange={setSize}>
            <MenuLabel>Text size</MenuLabel>
            <MenuRadioItem value="sm" shortcut="mod+-">Small</MenuRadioItem>
            <MenuRadioItem value="md" shortcut="mod+0">Medium</MenuRadioItem>
          </MenuRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## Example 2 of 2: Edit and Help menus

Shortcut hints, a disabled item and a link item. The hints are display only: wire the handlers yourself.

```tsx
import { MenuItem, MenuLinkItem, MenuSeparator } from "@/components/sheenui/menu/menu";
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "@/components/sheenui/menubar/menubar";
// Package build (after the first npm release, or a packed tarball): import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger, MenuItem, MenuLinkItem, MenuSeparator } from "@sheenui/theme";

export function Example() {
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenuItem shortcut="mod+z">Undo</MenuItem>
          <MenuItem shortcut="shift+mod+z" disabled>Redo</MenuItem>
          <MenuSeparator />
          <MenuItem shortcut="mod+x">Cut</MenuItem>
          <MenuItem shortcut="mod+c">Copy</MenuItem>
          <MenuItem shortcut="mod+v">Paste</MenuItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenuLinkItem href="#documentation">Documentation</MenuLinkItem>
          <MenuItem>Keyboard shortcuts</MenuItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Reach the bar once. |
| Arrow Left / Arrow Right | Move between menus; while one is open, switch the open menu. |
| Arrow Down / Enter / Space | Open the focused menu. |
| Arrow Down / Arrow Up | Move between items; the list wraps. |
| Home / End | Jump to the first or last item. |
| Type a letter | Jump to the next item that starts with it (typeahead). |
| Enter / Space | Run the highlighted item (a checkbox or radio item toggles and keeps the menu open). |
| Escape | Close the menu and return focus to its trigger. |

## Accessibility

- role="menubar" with menu triggers (aria-haspopup, aria-expanded); name it with aria-label.
- Items are 44 px tall on touch screens, and the bar scrolls sideways instead of wrapping on narrow screens.
- Shortcut hints are shown as keys and exposed through aria-keyshortcuts.

## API

### Menubar

### MenubarMenu · MenubarTrigger · MenubarContent


## When to use Menubar

- Use it as a desktop-style app menu bar for a web-based editor or admin tool with File, Edit and View menus along the top, where many commands are grouped the way a desktop application groups them.
- Use it when hovering a neighboring trigger should switch the open menu, as in desktop apps, and the accent tint should glide from one trigger to the next.
- Use it on narrow screens, where the bar scrolls sideways instead of wrapping to a second row, and set orientation="vertical" when you want the triggers stacked in a column.
- Skip it when you have one menu behind one button; Dropdown menu is simpler, and a site's top-level links with panels of content belong in a navigation menu instead.
- Pair it with MenuItem, MenuCheckboxItem and MenuSub for the contents, KbdShortcut for shown key combinations, and CommandPalette so rarely used commands are searchable too.


## Frequently asked questions

### How do I build a File Edit View menu bar in React?

Compose Menubar with a MenubarMenu for each menu, each holding a MenubarTrigger and a MenubarContent. Inside the content, use the dropdown menu's parts such as MenuItem, MenuCheckboxItem and MenuSub. It is built on Base UI Menubar and passes its props through.

### Which keys move between menus?

Tab reaches the bar once. Left and Right move between triggers and, while one menu is open, switch the open menu. Down, Enter or Space open one, and Escape closes it and returns focus to its trigger. Inside a menu, Right opens a submenu and Left closes it.

### What ARIA roles does the menubar use?

The bar has role="menubar" and each trigger is a real button with aria-haspopup="menu" and aria-expanded. Menu popups are role="menu". Triggers are 44px tall on touch screens, and an inset focus ring ensures focus is never clipped by the scrolling bar.

### How does the open-menu highlight animate?

The accent tint of the open menu glides between triggers using a shared layout animation. With reduced motion it jumps instead, and in forced colors it is hidden. The bar is a glass-2 surface, and the popup drops below the trigger with left edges aligned.


## Related pages

- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Command palette (⌘K)](https://lokendra-builds.github.io/sheenui/overlays/command-palette)
- [Context menu](https://lokendra-builds.github.io/sheenui/overlays/context-menu)
- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)
- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
