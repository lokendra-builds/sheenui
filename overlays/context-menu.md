Canonical: https://lokendra-builds.github.io/sheenui/overlays/context-menu

# React Context Menu: Right-Click & Long-Press

URL: https://lokendra-builds.github.io/sheenui/overlays/context-menu
Sidebar name: Context menu

A glass right-click context menu for React that also opens on long-press and Shift+F10, sharing parts with the dropdown menu. Base UI, Tailwind CSS v4.

What it is: A glass React context menu that opens on right-click, on long-press on touch screens, or with Shift+F10, right where you pressed.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/context-menu.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Context menu

Files to copy from `theme/src/`:

- `components/context-menu/`
- `components/menu/`
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

Registry item: context-menu. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/sheenui/context-menu/context-menu";
import { CopyIcon } from "@/components/sheenui/description-list/copy-button";
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/sheenui/menu/menu";
```

These examples also use button, description-list: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/description-list.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, ContextMenu, ContextMenuContent, ContextMenuTrigger, CopyIcon, Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@sheenui/theme";
```

## ContextMenu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| open / defaultOpen / onOpenChange | boolean / (open, details) => void | optional, no default | Controlled or uncontrolled open state. details.event is what opened it: a MouseEvent (right-click, Shift+F10) or a TouchEvent (long-press). |
| disabled | boolean | false | Let the browser's own menu through. |
| children | ReactNode | optional, no default | Takes a ContextMenuTrigger and a ContextMenuContent. |
| ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example closeParentOnEsc, orientation, loopFocus, highlightItemOnHover, onOpenChangeComplete, onItemHighlighted). |

## ContextMenuTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tabIndex | number | optional, no default | Set 0 on a non-control area so keyboard users can focus it and press Shift+F10 or the Menu key. The menu then opens at the focused element, not the screen corner. |
| className / render | string / ReactElement | optional, no default | Style it, or render it as your own element. Text selection and the iOS callout are off while long-pressing. |
| ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style). |

## ContextMenuContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| side | "top" \| "bottom" \| "left" \| "right" \| "inline-start" \| "inline-end" | "bottom" | Preferred side of the trigger; it flips when there is no room. |
| align | "center" \| "end" \| "start" | "start" | Sets the alignment along that side. |
| sideOffset | number | 2 | Gap between the trigger and the menu, in px (each part has its own default). |
| alignOffset | number | 0 | Shift along the alignment axis, in px (each part has its own default). |
| collisionPadding | number | 12 | Space kept from the viewport edges, in px. |
| positionerClassName | string | optional, no default | Classes for the positioner (the fixed element around the popup). |
| labels | Partial<ContextMenuLabels> | defaultContextMenuLabels | Spoken text: menu names the popup (it is announced when the menu opens) and submenu names a nested popup. Merged over defaultContextMenuLabels. Every other string, for translation: labels={{ menu: "…" }}; omitted keys keep the English of defaultContextMenuLabels. All 2 keys of ContextMenuLabels are listed in the key table under the props table. |

## Example 1 of 2: Photo grid

Right-click (or long-press) a photo. Every action is also behind the visible ⋯ button: a context menu should be a shortcut, never the only way in.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/sheenui/context-menu/context-menu";
import { CopyIcon } from "@/components/sheenui/description-list/copy-button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { Button, ContextMenu, ContextMenuContent, ContextMenuTrigger, CopyIcon, Menu, MenuContent, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@sheenui/theme";
import { Ellipsis as DotsIcon, Pencil as PencilIcon, Share2 as ShareIcon, Trash2 as TrashIcon } from "lucide-react";

function PhotoActions({ name }: { name: string }) {
  return (
    <>
      <MenuItem icon={<PencilIcon />} shortcut="enter" onClick={() => console.log("rename", name)}>
        Rename
      </MenuItem>
      <MenuItem icon={<CopyIcon />} shortcut="mod+d">Duplicate</MenuItem>
      <MenuSub>
        <MenuSubTrigger icon={<ShareIcon />}>Share</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>Copy link</MenuItem>
          <MenuItem>Email</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} tone="danger">Move to bin</MenuItem>
    </>
  );
}

export function Example() {
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger tabIndex={0} role="group" aria-label="Aurora.jpg" aria-describedby="hint">
          <img src="aurora.jpg" alt="" />
        </ContextMenuTrigger>
        <ContextMenuContent><PhotoActions name="Aurora.jpg" /></ContextMenuContent>
      </ContextMenu>

      {/* The same actions behind a visible button */}
      <Menu>
        <MenuTrigger render={<Button variant="glass" size="icon" aria-label="Actions for Aurora.jpg" />}>
          <DotsIcon />
        </MenuTrigger>
        <MenuContent align="end"><PhotoActions name="Aurora.jpg" /></MenuContent>
      </Menu>
    </>
  );
}
```

## Example 2 of 2: Canvas

A submenu that adds shapes where you pressed (right-click, long-press or Shift+F10), toggles that keep the menu open, a zoom choice and a disabled item. It opens at the pointer and flips to stay on screen near the edges.

```tsx
import { useRef, useState } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/sheenui/context-menu/context-menu";
import { MenuCheckboxItem, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuCheckboxItem, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from "@sheenui/theme";
import { Plus as PlusIcon } from "lucide-react";

// onOpenChange gets the event that opened the menu: a MouseEvent for a right-click or
// Shift+F10, the TouchEvent for a long-press (iOS sends no contextmenu event).
export function Example() {
  const point = useRef({ x: 0, y: 0 });
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState("100");
  const addSquare = () => console.log("add square at", point.current);

  function rememberPoint(open: boolean, { event }: { event: Event }) {
    const at = event instanceof TouchEvent ? event.touches[0] : (event as MouseEvent);
    if (open && at) point.current = { x: at.clientX, y: at.clientY };
  }

  return (
    <ContextMenu onOpenChange={rememberPoint}>
      <ContextMenuTrigger tabIndex={0} role="group" aria-label="Canvas">
        Right-click, press Shift+F10 or long-press here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuSub>
          <MenuSubTrigger icon={<PlusIcon />}>Add shape</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem onClick={addSquare}>Square</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem shortcut="mod+v" disabled>Paste</MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem checked={snap} onCheckedChange={setSnap}>Snap to grid</MenuCheckboxItem>
        <MenuRadioGroup value={zoom} onValueChange={(value) => setZoom(value as string)}>
          <MenuLabel>Zoom</MenuLabel>
          <MenuRadioItem value="100">100%</MenuRadioItem>
        </MenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Right-click / Long-press / Shift + F10 / Menu key | Open the menu at the pointer or the focused element. |
| Arrow Down / Arrow Up | Move between items; the list wraps. |
| Home / End | Jump to the first or last item. |
| Type a letter | Jump to the next item that starts with it (typeahead). |
| Enter / Space | Run the highlighted item (a checkbox or radio item toggles and keeps the menu open). |
| Escape | Close and return focus to the trigger. |

## Accessibility

- A context menu is a shortcut, never the only way to an action: also show the same actions in a visible menu button.
- Give the trigger an accessible name that mentions the shortcut; role="menu" with menuitem children, and focus moves into the menu on open.
- Text selection and the iOS callout are disabled on the trigger so a long press opens the menu.

## API

### ContextMenu

### ContextMenuTrigger

### ContextMenuContent


## All exports on this page

- ContextMenu — Root of a context menu: holds the open state for a ContextMenuTrigger and its ContextMenuContent.
- ContextMenuContent — The menu popup.
- ContextMenuTrigger — The area that opens the menu.
- defaultContextMenuLabels — English defaults of ContextMenuLabels: the popup is "Context menu (Shift+F10)".


## When to use the context menu

- Use it as a right-click menu for a file list or photo grid where right-click on an item offers Duplicate, Rename and Delete, sharing the same MenuItem parts as a visible three-dot menu button.
- Use it for a canvas or whiteboard where the menu should open at the exact pointer position, flipping to stay on screen when the click is near an edge.
- Use it on touch devices where a 500 millisecond long-press opens the menu, with text selection and the iOS callout disabled on the trigger so the press is not stolen.
- Skip it when an action must be discoverable; a context menu is a shortcut, never the only way, so show the same actions in a Dropdown menu button on the item too.
- Pair it with Dropdown menu parts such as MenuItem, MenuSeparator and MenuCheckboxItem, with KbdShortcut for shown key combinations, and AlertDialog to confirm destructive entries like Delete.


## Frequently asked questions

### How do I add a right-click menu in React?

Wrap the area in ContextMenuTrigger and put MenuItem children inside ContextMenuContent. It opens on right-click, on a 500 millisecond long-press on touch, or with Shift+F10 or the Menu key on a focused trigger. Items and popup are the dropdown menu's own parts.

### How can keyboard users open the context menu?

Make the trigger focusable with tabIndex={0} if it is not already a control, then press Shift+F10 or the Menu key; the menu opens just inside the element's top-left corner. Arrow keys, Home and End, typeahead, Enter and Escape work as in any menu.

### What should the trigger's accessible name say?

Give it a name that mentions the shortcut, for example Photo, press Shift+F10 for actions, so screen reader users learn that a menu exists. The popup is role="menu" with menuitem children, and focus moves into it when it opens.

### Does it look the same as the dropdown menu?

Yes. It reuses the dropdown menu's glass popup, a single backdrop blur, and the same entrance and exit. Reduced motion keeps a fade. By default it opens with side bottom, align start and a sideOffset of 2, and it flips to stay on screen.


## Related pages

- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)
- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Hover card](https://lokendra-builds.github.io/sheenui/overlays/hover-card)
- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
