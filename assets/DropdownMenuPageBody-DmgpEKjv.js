import{t as e}from"./button-8i4LQrEk.js";import{d as t,h as n,o as r,r as i,t as a}from"./menu-C-6Bb3go.js";import{i as o,n as s,o as c,r as l}from"./Page-ClekXXh-.js";import{t as u}from"./ShowcaseStage-qzIATPiV.js";import{a as d,c as f,d as p,f as m,i as h,l as g,m as _,n as v,o as y,p as b,r as x,s as S,t as C,u as w}from"./dropdown-menu-Dg2CqwAb.js";import{t as T}from"./Example-jva669kg.js";import{t as E}from"./vendor-react-D30i__oY.js";import{t as D}from"./preload-helper-BrmCrVM7.js";var O=E();function k(){return(0,O.jsxs)(s,{eyebrow:`Overlay`,title:`Dropdown menu`,description:`A glass list of actions under a button: icons, shortcuts, groups, checkbox and radio items, submenus and destructive actions. The highlight glides from item to item; arrow keys, Home/End and typing a letter all work.`,source:`theme/src/components/menu/menu.tsx`,children:[(0,O.jsx)(u,{label:`Dropdown menu demo`,story:()=>D(()=>import(`./ShowcaseStage.dropdown-menu-KcYFjjMt.js`),[]),initial:{open:!1,hot:null,picked:``},minHeight:`26rem`,onInterrupt:`keep`,children:(e,t)=>(0,O.jsx)(h,{scene:e,ctx:t})}),(0,O.jsx)(T,{title:`Account menu`,description:`Icons, shortcut hints (⌘ on a Mac, Ctrl elsewhere), a badge, a submenu, a disabled item and a destructive one. Open it with Enter, Space or ↓, then move with the arrow keys; → opens the submenu.`,stageClassName:`min-h-80`,code:`
import {
Avatar,
Badge,
Button,
Menu,
MenuContent,
MenuHeader,
MenuItem,
MenuSeparator,
MenuSub,
MenuSubContent,
MenuSubTrigger,
MenuTrigger,
} from "@sheenui/theme";
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
}`,children:(0,O.jsx)(C,{})}),(0,O.jsx)(T,{title:`Checkbox and radio items`,description:`Toggles and a single choice that keep the menu open, so several can be changed in one go. The preview below follows along.`,stageClassName:`min-h-80`,code:`
import { useState } from "react";
import {
Button,
Menu,
MenuCheckboxItem,
MenuContent,
MenuGroup,
MenuLabel,
MenuRadioGroup,
MenuRadioItem,
MenuSeparator,
MenuTrigger,
} from "@sheenui/theme";
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
}`,children:(0,O.jsx)(x,{})}),(0,O.jsx)(T,{title:`Row actions`,description:`An icon button per row with the menu aligned to its end. "Open on GitHub" is a real link (MenuLinkItem), so ⌘/Ctrl-click opens it in a new tab.`,stageClassName:`min-h-80`,code:`
import {
Button,
CopyIcon,
Menu,
MenuContent,
MenuItem,
MenuLinkItem,
MenuSeparator,
MenuTrigger,
} from "@sheenui/theme";
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
}`,children:(0,O.jsx)(v,{})}),(0,O.jsx)(T,{title:`Bottom sheet on phones`,phonePreview:!0,description:`mobile='sheet' opens the menu as a bottom sheet under 640px wide: full width, a drag handle you can swipe down, items scrolling inside a 85dvh cap, safe-area padding. The default, 'popup', keeps the anchored menu. Press “Preview on a phone” to try it on a desktop screen (or narrow the window).`,code:`
import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@sheenui/theme";

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
}`,children:(0,O.jsxs)(a,{mobile:`sheet`,children:[(0,O.jsx)(n,{render:(0,O.jsx)(e,{variant:`glass`}),children:`Options`}),(0,O.jsxs)(i,{children:[(0,O.jsx)(r,{children:`Rename`}),(0,O.jsx)(r,{children:`Duplicate`}),(0,O.jsx)(t,{}),(0,O.jsx)(r,{tone:`danger`,children:`Delete`})]})]})}),(0,O.jsxs)(`section`,{className:`flex flex-col gap-8`,children:[(0,O.jsx)(`h2`,{id:`api`,className:`text-xl font-semibold tracking-tight`,children:`API`}),(0,O.jsx)(l,{as:`h3`,title:`Menu`,of:_,rows:[[`open / defaultOpen`,`boolean`,`false`,`Controlled or uncontrolled open state.`],[`onOpenChange`,`(open, details) => void`,``,`Called when the menu opens or closes; details.reason says why.`],[`modal`,`boolean`,`true`,`Lock page scroll and outside clicks while open.`],[`loopFocus`,`boolean`,`true`,`Arrow keys wrap from the last item to the first.`],[`MenuTrigger render`,`ReactElement`,``,`Render the trigger as your own element, e.g. render={<Button />}. openOnHover and delay are also supported.`],[`Menu ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example highlightItemOnHover, onOpenChangeComplete, onItemHighlighted, orientation, disabled, closeParentOnEsc).`],[`MenuTrigger ...props`,`Base UI props`,``,`The rest is passed to the underlying Base UI part (for example disabled, handle, payload, delay, closeDelay, openOnHover).`]]}),(0,O.jsx)(l,{as:`h3`,title:`MenuContent`,of:m}),(0,O.jsx)(l,{as:`h3`,title:`MenuItem`,of:w,rows:[[`disabled / closeOnClick / onClick / label`,`Base UI Menu.Item props`,``,`label overrides the text used for typeahead.`]]}),(0,O.jsx)(l,{as:`h3`,title:`Inherited Base UI props`,rows:[[`MenuCheckboxItem: checked / defaultChecked / onCheckedChange`,`boolean / boolean / (checked: boolean) => void`,``,`Controlled or uncontrolled checked state (Base UI).`],[`MenuRadioGroup: value / defaultValue / onValueChange`,`string / string / (value: string) => void`,``,"The chosen item of a radio group; give each MenuRadioItem its own `value` (Base UI)."],[`MenuSubTrigger: openOnHover / delay`,`boolean / number`,``,`Open the submenu on hover, after the delay in ms (Base UI).`]]}),(0,O.jsx)(l,{of:b,title:`MenuCheckboxItem props`,as:`h3`}),(0,O.jsx)(l,{of:p,title:`MenuHighlight props`,as:`h3`}),(0,O.jsx)(l,{of:g,title:`MenuLabel props`,as:`h3`}),(0,O.jsx)(l,{of:f,title:`MenuLinkItem props`,as:`h3`}),(0,O.jsx)(l,{of:S,title:`MenuRadioItem props`,as:`h3`}),(0,O.jsx)(l,{of:y,title:`MenuSubContent props`,as:`h3`}),(0,O.jsx)(l,{of:d,title:`MenuSubTrigger props`,as:`h3`})]}),(0,O.jsx)(c,{rows:[[`Enter / Space / Arrow Down`,`Open the menu from the trigger.`],[`Arrow Down / Arrow Up`,`Move between items; the list wraps.`],[`Home / End`,`Jump to the first or last item.`],[`Type a letter`,`Jump to the next item that starts with it (typeahead).`],[`Enter / Space`,`Run the highlighted item (a checkbox or radio item toggles and keeps the menu open).`],[`Arrow Right / Arrow Left`,`Open or close a submenu (flipped in right-to-left pages).`],[`Escape`,`Close the menu and return focus to the trigger.`]]}),(0,O.jsx)(o,{items:[`role="menu" with menuitem, menuitemcheckbox and menuitemradio children (Base UI); the trigger has aria-haspopup="menu" and aria-expanded.`,`Give an icon-only trigger an aria-label. A disabled item stays visible and is skipped by the arrow keys.`,`Shortcut hints are shown as keys and exposed through aria-keyshortcuts for the visitor's platform; touch rows are 44 px tall.`]})]})}export{k as DropdownMenuPage};