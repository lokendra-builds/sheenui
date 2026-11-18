Canonical: https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu

# Animated React Dropdown Menu with Submenus

URL: https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu
Sidebar name: Dropdown menu

A glass React dropdown menu with icons, shortcuts, checkbox and radio items and submenus. The highlight glides with Motion. Base UI, Tailwind CSS v4, MIT.

What it is: A glass React dropdown menu with icons, shortcuts, groups, checkbox and radio items and submenus, whose highlight glides from item to item.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/menu.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Dropdown menu

Files to copy from `theme/src/`:

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

Registry item: menu. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { CopyIcon } from "@/components/sheenui/description-list/copy-button";
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuHeader, MenuItem, MenuLabel, MenuLinkItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/sheenui/menu/menu";
```

These examples also use avatar, badge, button, description-list: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/badge.json https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/description-list.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Badge, Button, CopyIcon, Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuHeader, MenuItem, MenuLabel, MenuLinkItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@sheenui/theme";
```

## Menu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| mobile | MobilePresentation | "popup" | How the menu opens on a phone-width screen (max-width: 640px): "popup" is the usual menu next to the trigger; "sheet" is a bottom sheet with a drag handle, swipe-down to dismiss, scrolling items capped at 85 dvh and home-indicator padding. Escape closes and focus returns to the trigger in both. |
| open / defaultOpen | boolean | false | Controlled or uncontrolled open state. |
| onOpenChange | (open, details) => void | optional, no default | Called when the menu opens or closes; details.reason says why. |
| modal | boolean | true | Lock page scroll and outside clicks while open. |
| loopFocus | boolean | true | Arrow keys wrap from the last item to the first. |
| MenuTrigger render | ReactElement | optional, no default | Render the trigger as your own element, e.g. render={<Button />}. openOnHover and delay are also supported. |
| Menu ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example highlightItemOnHover, onOpenChangeComplete, onItemHighlighted, orientation, disabled, closeParentOnEsc). |
| MenuTrigger ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example disabled, handle, payload, delay, closeDelay, openOnHover). |

## MenuContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| side | "top" \| "bottom" \| "left" \| "right" \| "inline-start" \| "inline-end" | "bottom" | Preferred side of the trigger; it flips when there is no room. |
| align | "center" \| "end" \| "start" | "start" | Sets the alignment along that side. |
| sideOffset | number | 6 | Gap between the trigger and the menu, in px (each part has its own default). |
| alignOffset | number | 0 | Shift along the alignment axis, in px (each part has its own default). |
| collisionPadding | number | 12 | Space kept from the viewport edges, in px. |
| matchTriggerWidth | boolean | false | Make the menu at least as wide as its trigger. |
| anchor | Element \| VirtualElement \| RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null | optional, no default | Element to position against instead of the trigger. |
| positionerClassName | string | optional, no default | Classes for the positioner (the fixed element around the popup). |
| labels | Partial<MenuLabels> | defaultMenuLabels | Spoken text. Merged over defaultMenuLabels. Every other string, for translation: labels={{ submenu: "…" }}; omitted keys keep the English of defaultMenuLabels. All 2 keys of MenuLabels are listed in the key table under the props table. |

## MenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | Shows an icon before the label (decorative). |
| description | ReactNode | optional, no default | Shows the second line under the label. |
| shortcut | string \| readonly string[] | optional, no default | Keyboard shortcut to show, e.g. "mod+c" (⌘C on a Mac, Ctrl+C elsewhere). It is also set as aria-keyshortcuts. Showing it does not bind it: handle the key yourself. |
| shortcutLabels | Partial<KbdLabels> | defaultKbdLabels | Key names for the shortcut (i18n). Every other string, for translation: shortcutLabels={{ mac: "…" }}; omitted keys keep the English of defaultKbdLabels. All 4 keys of KbdLabels are listed in the key table under the props table. |
| trailing | ReactNode | optional, no default | Anything else at the end of the row (a badge, a count). |
| inset | boolean | optional, no default | Leave the icon slot empty so the label lines up with items that have icons. |
| tone | "neutral" \| "danger" | "neutral" | "danger" for destructive actions: red text and a red highlight. |
| disabled / closeOnClick / onClick / label | Base UI Menu.Item props | optional, no default | label overrides the text used for typeahead. |

## Inherited Base UI props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| MenuCheckboxItem: checked / defaultChecked / onCheckedChange | boolean / boolean / (checked: boolean) => void | optional, no default | Controlled or uncontrolled checked state (Base UI). |
| MenuRadioGroup: value / defaultValue / onValueChange | string / string / (value: string) => void | optional, no default | The chosen item of a radio group; give each MenuRadioItem its own value (Base UI). |
| MenuSubTrigger: openOnHover / delay | boolean / number | optional, no default | Open the submenu on hover, after the delay in ms (Base UI). |

## MenuCheckboxItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| shortcut | string \| readonly string[] | optional, no default | Keyboard shortcut to show, e.g. "mod+c" (⌘C on a Mac, Ctrl+C elsewhere). It is also set as aria-keyshortcuts. Showing it does not bind it: handle the key yourself. |
| shortcutLabels | Partial<KbdLabels> | defaultKbdLabels | Key names for the shortcut (i18n). Every other string, for translation: shortcutLabels={{ mac: "…" }}; omitted keys keep the English of defaultKbdLabels. All 4 keys of KbdLabels are listed in the key table under the props table. |
| description | ReactNode | optional, no default | Shows the second line under the label. |
| trailing | ReactNode | optional, no default | Anything else at the end of the row (a badge, a count). |

## MenuHighlight props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| active | boolean | required | Show the pill (pass the item's highlighted state). |
| tone | "neutral" \| "danger" | "neutral" | "danger" tints it red, for destructive items. |
| className | string | optional, no default | Adds extra classes to the pill. |

## MenuLabel props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| inset | boolean | false | Indent to line up with item labels that sit after an icon. |

## MenuLinkItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | Shows an icon before the label (decorative). |
| description | ReactNode | optional, no default | Shows the second line under the label. |
| trailing | ReactNode | optional, no default | Anything else at the end of the row (a badge, a count). |
| inset | boolean | optional, no default | Leave the icon slot empty so the label lines up with items that have icons. |

## MenuRadioItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| shortcut | string \| readonly string[] | optional, no default | Keyboard shortcut to show, e.g. "mod+c" (⌘C on a Mac, Ctrl+C elsewhere). It is also set as aria-keyshortcuts. Showing it does not bind it: handle the key yourself. |
| shortcutLabels | Partial<KbdLabels> | defaultKbdLabels | Key names for the shortcut (i18n). Every other string, for translation: shortcutLabels={{ mac: "…" }}; omitted keys keep the English of defaultKbdLabels. All 4 keys of KbdLabels are listed in the key table under the props table. |
| description | ReactNode | optional, no default | Shows the second line under the label. |
| trailing | ReactNode | optional, no default | Anything else at the end of the row (a badge, a count). |

## MenuSubContent props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| labels | Partial<MenuLabels> | defaultMenuLabels | Spoken text. Merged over defaultMenuLabels. Every other string, for translation: labels={{ submenu: "…" }}; omitted keys keep the English of defaultMenuLabels. All 2 keys of MenuLabels are listed in the key table under the props table. |
| anchor | Element \| VirtualElement \| RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null | optional, no default | Element to position against instead of the trigger. |
| sideOffset | number | 4 | Gap between the trigger and the menu, in px (each part has its own default). |
| alignOffset | number | -6 | Shift along the alignment axis, in px (each part has its own default). |
| collisionPadding | number | 12 | Space kept from the viewport edges, in px. |
| positionerClassName | string | optional, no default | Classes for the positioner (the fixed element around the popup). |

## MenuSubTrigger props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | Shows an icon before the label (decorative). |
| description | ReactNode | optional, no default | Shows the second line under the label. |
| trailing | ReactNode | optional, no default | Anything else at the end of the row (a badge, a count). |
| inset | boolean | optional, no default | Leave the icon slot empty so the label lines up with items that have icons. |

## Example 1 of 4: Account menu

Icons, shortcut hints (⌘ on a Mac, Ctrl elsewhere), a badge, a submenu, a disabled item and a destructive one. Open it with Enter, Space or ↓, then move with the arrow keys; → opens the submenu.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { Menu, MenuContent, MenuHeader, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { Avatar, Badge, Button, Menu, MenuContent, MenuHeader, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@sheenui/theme";
import { CreditCard as CardIcon, ChevronDown as ChevronDownIcon, Cloud as CloudIcon, Link as LinkIcon, LogOut as LogoutIcon, Mail as MailIcon, User as UserIcon, UserPlus as UserPlusIcon } from "lucide-react";

export function Example() {
  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="glass" leading={<Avatar name="Ada Lovelace" size="sm" />} trailing={<ChevronDownIcon />} />}
      >
        Ada Lovelace
      </MenuTrigger>
      <MenuContent className="w-72">
        <MenuHeader>
          <b>Ada Lovelace</b>
          <span>ada@example.com</span>
        </MenuHeader>
        <MenuSeparator />
        <MenuItem icon={<UserIcon />} shortcut="shift+mod+p">Profile</MenuItem>
        <MenuItem icon={<CardIcon />} shortcut="mod+b" trailing={<Badge tone="accent">Pro</Badge>}>
          Billing
        </MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger icon={<UserPlusIcon />}>Invite people</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem icon={<MailIcon />}>Email</MenuItem>
            <MenuItem icon={<LinkIcon />}>Copy invite link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem icon={<CloudIcon />} disabled>API keys</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<LogoutIcon />} tone="danger" shortcut="shift+mod+q" onClick={() => console.log("sign out")}>
          Log out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

## Example 2 of 4: Checkbox and radio items

Toggles and a single choice that keep the menu open, so several can be changed in one go. The preview below follows along.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { Button, Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@sheenui/theme";
import { ChevronDown as ChevronDownIcon } from "lucide-react";

export function Example() {
  const [toolbar, setToolbar] = useState(true);
  const [density, setDensity] = useState("comfortable");

  return (
    <Menu>
      <MenuTrigger render={<Button variant="glass" trailing={<ChevronDownIcon />} />}>View</MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuLabel>Show</MenuLabel>
          <MenuCheckboxItem checked={toolbar} onCheckedChange={setToolbar} shortcut="shift+mod+t">
            Toolbar
          </MenuCheckboxItem>
          <MenuCheckboxItem disabled description="Needs a folder">Breadcrumbs</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuRadioGroup value={density} onValueChange={setDensity}>
          <MenuLabel>Density</MenuLabel>
          <MenuRadioItem value="compact">Compact</MenuRadioItem>
          <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
          <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
```

## Example 3 of 4: Row actions

An icon button per row with the menu aligned to its end. "Open on GitHub" is a real link (MenuLinkItem), so ⌘/Ctrl-click opens it in a new tab.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { CopyIcon } from "@/components/sheenui/description-list/copy-button";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { Button, CopyIcon, Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@sheenui/theme";
import { Ellipsis as DotsIcon, ExternalLink as ExternalIcon, Pencil as PencilIcon, Trash2 as TrashIcon } from "lucide-react";

export function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon" aria-label="Actions for Q3 roadmap.pdf" />}>
        <DotsIcon />
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem icon={<PencilIcon />} shortcut="enter">Rename</MenuItem>
        <MenuItem icon={<CopyIcon />} shortcut="mod+d">Duplicate</MenuItem>
        <MenuLinkItem icon={<ExternalIcon />} href="https://github.com/" target="_blank">
          Open on GitHub
        </MenuLinkItem>
        <MenuSeparator />
        <MenuItem icon={<TrashIcon />} tone="danger" shortcut="mod+backspace">Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

## Example 4 of 4: Bottom sheet on phones

mobile='sheet' opens the menu as a bottom sheet under 640px wide: full width, a drag handle you can swipe down, items scrolling inside a 85dvh cap, safe-area padding. The default, 'popup', keeps the anchored menu. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/sheenui/menu/menu";
// Package build (after the first npm release, or a packed tarball): import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@sheenui/theme";

export function Example() {
  return (
    <Menu mobile="sheet">
      <MenuTrigger render={<Button variant="glass" />}>Options</MenuTrigger>
      <MenuContent>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger">Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space / Arrow Down | Open the menu from the trigger. |
| Arrow Down / Arrow Up | Move between items; the list wraps. |
| Home / End | Jump to the first or last item. |
| Type a letter | Jump to the next item that starts with it (typeahead). |
| Enter / Space | Run the highlighted item (a checkbox or radio item toggles and keeps the menu open). |
| Arrow Right / Arrow Left | Open or close a submenu (flipped in right-to-left pages). |
| Escape | Close the menu and return focus to the trigger. |

## Accessibility

- role="menu" with menuitem, menuitemcheckbox and menuitemradio children (Base UI); the trigger has aria-haspopup="menu" and aria-expanded.
- Give an icon-only trigger an aria-label. A disabled item stays visible and is skipped by the arrow keys.
- Shortcut hints are shown as keys and exposed through aria-keyshortcuts for the visitor's platform; touch rows are 44 px tall.

## API

### Menu

### MenuContent

### MenuItem

### Inherited Base UI props

### MenuCheckboxItem props

### MenuHighlight props

### MenuLabel props

### MenuLinkItem props

### MenuRadioItem props

### MenuSubContent props

### MenuSubTrigger props


## All exports on this page

- GlideHighlightScope — Gives every MenuHighlight pill inside it one shared tracker.
- Menu — Dropdown menu on Base UI Menu: arrow keys, Home/End, typeahead, submenus, Escape and focus return.
- MenuCheckboxItem — A toggle (menuitemcheckbox).
- MenuContent — The glass popup of a Menu, portalled to the end of the body and positioned next to the trigger.
- MenuGroup — Groups related items inside a menu; put a MenuLabel first to name it.
- MenuHeader — A non-interactive header row, e.g.
- MenuHighlight — The highlight pill.
- MenuItem — One action in a menu.
- MenuLabel — Heading for a MenuGroup or MenuRadioGroup (place it inside the group).
- MenuLinkItem — A menu item that is a real link (<a href>): opens in a new tab with Cmd/Ctrl-click, shows the URL on hover.
- MenuRadioGroup — Holds the chosen value of a set of MenuRadioItems: controlled with value + onValueChange, or uncontrolled with defaultValue.
- MenuRadioItem — One choice in a MenuRadioGroup (menuitemradio).
- MenuSeparator — A hairline between groups of items.
- MenuSub — Wraps a MenuSubTrigger and its MenuSubContent.
- MenuSubContent — The submenu popup.
- MenuSubTrigger — The item that opens a submenu: hover, click, → (← in RTL) or Enter.
- MenuTrigger — The element that opens a Menu.
- createMenuHandle — For triggers that live outside <Menu>: const handle = createMenuHandle().
- defaultMenuLabels — English defaults of MenuLabels ("Submenu", "Submenu, level 2").


## When to use the dropdown menu

- Use it as an animated dropdown menu for a row actions button in a table, where a three-dot trigger opens Edit, Duplicate and Delete, with tone="danger" marking the destructive item.
- Use it for an account menu in a navbar, with a MenuHeader for the signed-in user, MenuLinkItem entries for Settings and Billing, and a MenuSub for a theme or language choice.
- Use it for view options with MenuCheckboxItem and MenuRadioGroup, such as showing or hiding columns and choosing a sort order, with the chosen state kept in your own React state.
- Skip it when the user is choosing a value for a form field; Select is built for that, and an application menu bar with File, Edit and View belongs in Menubar.
- Pair it with Button via render on MenuTrigger, KbdShortcut or the shortcut prop to show key hints, and AlertDialog to confirm items that cannot be undone.


## Frequently asked questions

### How do I build a dropdown menu in React with submenus?

Compose Menu, MenuTrigger and MenuContent, then add MenuItem rows. Wrap a MenuSubTrigger and its MenuSubContent in MenuSub for a submenu. Right Arrow, or Left in right-to-left, opens it; Left Arrow or Escape closes it. It is built on Base UI Menu.

### Which keys does the menu respond to?

Enter, Space or Down on the trigger opens it, and Up opens with the last item highlighted. Up and Down move, Home and End jump, typing jumps to a matching item, and Enter or Space activates. Escape closes the menu and returns focus to the trigger.

### Does the shortcut prop bind the key?

No. The shortcut on a MenuItem shows a platform-aware key combination and sets aria-keyshortcuts, but it does not bind the key; handle it yourself with your own listener. Use icon, description, trailing and inset to shape each row, and onClick for the action.

### How do I keep the menu open after choosing an item?

The menu closes after an item's onClick by default. Set closeOnClick={false} on that item to keep it open, which suits checkbox items. Disabled items stay in the arrow-key order but cannot be activated. Reduced motion makes the popup fade and the highlight jump.


## Related pages

- [Hover card](https://lokendra-builds.github.io/sheenui/overlays/hover-card)
- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Command palette (⌘K)](https://lokendra-builds.github.io/sheenui/overlays/command-palette)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
