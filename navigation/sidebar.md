Canonical: https://lokendra-builds.github.io/sheenui/navigation/sidebar

# React Sidebar with Collapsible Groups

URL: https://lokendra-builds.github.io/sheenui/navigation/sidebar
Sidebar name: Sidebar

A glass React sidebar for app shells: collapsible groups, badges, a footer and an icon-rail mode. Accessible nav landmark, Tailwind CSS v4, MIT.

What it is: A glass React sidebar for app shells with collapsible groups, badges and a collapsed icon rail. Use Sidebar for an app shell: a glass column with a header, collapsible groups of links and a footer for the user menu.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/sidebar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Sidebar

Files to copy from `theme/src/`:

- `components/sidebar/`
- `components/collapsible/`
- `components/status-icons/`
- `hooks/use-controllable.ts`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: sidebar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { DrawerBody, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@/components/sheenui/sidebar/sidebar";
```

These examples also use avatar, badge, button, drawer: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/badge.json https://lokendra-builds.github.io/sheenui/r/button.json https://lokendra-builds.github.io/sheenui/r/drawer.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@sheenui/theme";
```

## Sidebar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| aria-label | string | labels?.name ?? defaultSidebarLabels.name | Defines a string value that labels the current element. |
| children | ReactNode | optional, no default | Holds SidebarHeader, SidebarGroups, SidebarItems and SidebarFooter. |
| collapsed | boolean | false | Show only the icons (a 64px rail). Labels stay as accessible names and tooltips; groups stay open. |
| defaultCollapsed | boolean | false | Starts as an icon rail when uncontrolled (collapsed left out). Change it from your own toggle with useSidebar().setCollapsed. |
| onCollapsedChange | ((collapsed: boolean) => void) | optional, no default | Called with the new state when a part inside the sidebar asks to collapse or expand it (useSidebar().setCollapsed). |
| morph | boolean | false | Morph between the rail and the full panel instead of swapping them: icons stay exactly where they are, labels and badges fade and slide in on the content (opacity and translate only), and group headings keep their place. The width itself changes once, never through a transition, so nothing outside the sidebar shifts. Reduced motion: the labels switch in one frame. |
| shape | SidebarShape | "rect" | The outline of the glass. "curved" bows the trailing edge (inline-end, so it flips in right-to-left layouts) outward like a curved glass sheet: the blur, the lit rim and the shadow follow the curve and a soft light sits on its apex. The curve is the glass element's own corner radii, never a mask on a wrapper. With collapsed or morph the rail bows more gently. Reduced transparency, more contrast and forced colours fall back to "rect". |
| labels | Partial<SidebarLabels> | defaultSidebarLabels | Every string, for translation: { name: "Sidebar" } (the default landmark name; aria-label wins over it). Every other string, for translation: labels={{ name: "…" }}; omitted keys keep the English of defaultSidebarLabels. Its only key is listed in the key table under the props table. |

## SidebarGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| defaultOpen | boolean | true | Open at first when uncontrolled. |
| label | ReactNode | required | The group's heading, which is also the button that opens and closes it. |
| icon | ReactNode | optional, no default | Shows an icon before the heading. |
| children | ReactNode | optional, no default | Holds the items of the group. |

## SidebarItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | Shows an icon before the label. |
| badge | ReactNode | optional, no default | A count or tag at the end, such as "3". Hidden in a collapsed sidebar. A 0 is hidden unless showZero is set. |
| showZero | boolean | false | Show the badge when it is 0. |
| active | boolean | false | Marks the current page (aria-current="page") and fills the item. |
| disabled | boolean | false | Makes the item unclickable: it is dimmed and skipped by the keyboard. |

## Other parts

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| SidebarHeader / SidebarFooter | div props | optional, no default | Top and bottom areas; the footer is pushed down. |
| useSidebar() | { collapsed: boolean } | optional, no default | Read the collapsed state from custom header or footer content. |

## Example 1 of 3: A full app shell

Sidebar with groups and badges, a header with search and actions, stat cards and an activity list. Use Collapse to turn the sidebar into an icon rail; VerticalNav is the shorter choice for a flat list of sections.

```tsx
import { useState } from "react";
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@/components/sheenui/sidebar/sidebar";
// Package build (after the first npm release, or a packed tarball): import { Avatar, Badge, Button, Sidebar, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@sheenui/theme";

export function Example() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[30rem] w-full gap-3">
      <Sidebar aria-label="Acme workspace" collapsed={collapsed} className="shrink-0">
        <SidebarHeader>
          <strong className={collapsed ? "sr-only" : "text-sm"}>Acme Cloud</strong>
        </SidebarHeader>
        <SidebarItem href="#overview" active>Overview</SidebarItem>
        <SidebarGroup label="Workspace">
          <SidebarItem href="#projects" badge="12">Projects</SidebarItem>
          <SidebarItem href="#reports">Reports</SidebarItem>
          <SidebarItem href="#deploys" badge="3">Deployments</SidebarItem>
        </SidebarGroup>
        <SidebarGroup label="Team">
          <SidebarItem href="#members">Members</SidebarItem>
          <SidebarItem href="#billing">Billing</SidebarItem>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarItem onClick={() => setCollapsed((c) => !c)}>Collapse</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="glass-2 flex items-center gap-3 rounded-sheen-xl px-3 py-2">
          <h3 className="m-0 flex-1 text-sm font-semibold">Overview</h3>
          <Button size="sm">New project</Button>
          <Avatar name="Maya Chen" size="sm" />
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Active users 12,480", "Revenue $48.2k", "Error rate 0.42%"].map((stat) => (
            <div key={stat} className="glass-2 flex flex-col gap-1 rounded-sheen-xl p-3 text-sm">
              {stat}
              <Badge tone="success" className="w-fit">+8.2%</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Example 2 of 3: A curved glass sheet

shape="curved" bows the trailing edge outward (the inline-end edge, so it flips in right-to-left layouts). The curve is the glass element's own corner radii, so the blur, the lit rim and the shadow follow it, and a soft light sits on the apex. With morph and the collapse item the rail bows more gently. Reduced transparency, more contrast and forced colours fall back to a plain rectangle.

```tsx
import { useState } from "react";
import { Sidebar, SidebarGroup, SidebarItem } from "@/components/sheenui/sidebar/sidebar";
// Package build (after the first npm release, or a packed tarball): import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

function Dot() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}

export function CurvedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-96">
      <Sidebar shape="curved" morph collapsed={collapsed} aria-label="Workspace">
        <SidebarGroup label="Projects">
          <SidebarItem href="#alpha" active icon={<Dot />}>
            Alpha
          </SidebarItem>
          <SidebarItem href="#beta" icon={<Dot />} badge="3">
            Beta
          </SidebarItem>
          <SidebarItem href="#gamma" icon={<Dot />}>
            Gamma
          </SidebarItem>
        </SidebarGroup>
        <SidebarItem onClick={() => setCollapsed((c) => !c)} icon={<Dot />}>
          {collapsed ? "Expand" : "Collapse"}
        </SidebarItem>
      </Sidebar>
    </div>
  );
}
```

## Example 3 of 3: On phones

The sidebar is a column, so on a narrow screen put the same Sidebar inside a Drawer that opens from the left (side="start" follows the reading direction) and give the page a Menu button. Keep the in-layout Sidebar for lg and up.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { Drawer, DrawerTrigger } from "@/components/sheenui/drawer/drawer";
import { DrawerContent } from "@/components/sheenui/drawer/parts/content";
import { DrawerBody, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/sheenui/drawer/parts/parts";
import { Sidebar, SidebarGroup, SidebarItem } from "@/components/sheenui/sidebar/sidebar";
// Package build (after the first npm release, or a packed tarball): import { Button, Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";

// Below lg, show the same sidebar in a Drawer that opens from a menu button; from lg up render <Sidebar> in the layout as usual.
export function PhoneNav() {
  return (
    <Drawer side="start">
      <DrawerTrigger render={<Button variant="glass" />}>Menu</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Pages of the workspace</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Sidebar aria-label="Workspace">
            <SidebarGroup label="Projects" defaultOpen>
              <SidebarItem href="#alpha" active>Alpha</SidebarItem>
              <SidebarItem href="#beta">Beta</SidebarItem>
            </SidebarGroup>
            <SidebarItem href="#settings">Settings</SidebarItem>
          </Sidebar>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Moves through group headings and items in order. |
| Enter / Space | Opens or closes a focused group heading; follows a link or presses a button item. |

## Accessibility

- A <nav> landmark (aria-label defaults to "Sidebar"; change it when a page has more than one).
- Group headings are buttons with aria-expanded; closed items leave the tab order. The current page uses aria-current="page".
- In the collapsed rail the labels stay as accessible names and as title tooltips; the icons are decorative.
- Targets are 44px on touch screens. Under reduced motion the groups jump open and shut.

## All exports on this page

- Sidebar — The app-shell sidebar: a glass column with a header, groups of links that fold open and shut, and a footer.
- SidebarFooter — The bottom of a Sidebar, pushed down by mt-auto: a user menu or a help link.
- SidebarGroup — A collapsible section of a Sidebar: a heading button and the items under it.
- SidebarHeader — The top of a Sidebar: a logo or a workspace switcher.
- SidebarItem — One link (or, without href, one button) of a Sidebar.
- defaultSidebarLabels — The English SidebarLabels used when labels is omitted; a partial labels prop is merged over it.
- useSidebar — Whether the surrounding Sidebar is collapsed to its icon rail.


## When to use Sidebar

- Use Sidebar for the left navigation of an admin or dashboard app, where groups of links collapse, badges show unread counts and the whole column folds down to an icon rail.
- Use collapsed to turn it into an icon rail on a narrow layout. Labels stay available as accessible names and title tooltips.
- Give the nav an aria-label such as Workspace and mark the current page with the active prop, which sets aria-current="page".
- Skip it for a short flat list of sections. VerticalNav is shorter, and Navbar suits a top bar on a marketing site.
- Pair it with Drawer for a phone menu, Badge in SidebarItem for counts, and Breadcrumb inside the page header.


## Frequently asked questions

### How do I build a collapsible sidebar in React?

Compose SidebarHeader, SidebarGroup (a section with a label and defaultOpen), SidebarItem and SidebarFooter inside Sidebar. Groups fold open and shut with the shared height animation.

### How does the keyboard work?

Tab moves through group headings and items in order. Enter or Space opens or closes a group and activates an item. Group headings are real buttons with aria-expanded.

### What does collapsed do?

It turns the sidebar into an icon rail: labels become accessible names, groups lose their headings, and the width shrinks. Control it from your own button.

### Sidebar or VerticalNav?

Use VerticalNav for a flat list with one selected value. Use Sidebar when you need collapsible groups or your own header and footer content.

### Do toggle buttons inside a group keep their pressed state?

Yes. The group adds no state of its own: each button keeps its own name and state, so a toggle keeps aria-pressed, and disabled buttons are skipped by the arrow keys. Name the group with aria-label when the buttons share one meaning.

### Which variant and size should the buttons use?

Any variant, but the same size, so the joined edges line up. The group squares the corners where buttons touch, overlaps their edges by a pixel and lifts the focused button above its neighbours; the buttons keep their own hover and press motion.


## Related pages

- [Vertical nav](https://lokendra-builds.github.io/sheenui/navigation/vertical-nav)
- [Collapsible](https://lokendra-builds.github.io/sheenui/layout/collapsible)
- [Navigation menu](https://lokendra-builds.github.io/sheenui/navigation/navigation-menu)
- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
