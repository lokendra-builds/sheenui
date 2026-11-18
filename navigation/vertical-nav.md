Canonical: https://lokendra-builds.github.io/sheenui/navigation/vertical-nav

# Glass Sidebar for React: Collapsible Icon Rail

URL: https://lokendra-builds.github.io/sheenui/navigation/vertical-nav
Sidebar name: Vertical nav

A glassmorphism sidebar for React with grouped items, icons and counts, a sliding active highlight and a collapsed icon-rail mode. Tailwind CSS v4, MIT.

What it is: A glass sidebar navigation for React with grouped items, icons and counts that collapses into an icon rail with tooltips.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/vertical-nav.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Vertical nav

Files to copy from `theme/src/`:

- `components/vertical-nav/`
- `components/drawer/parts/sheet.tsx`
- `components/navbar/`
- `components/popover/`
- `hooks/{use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, form.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: vertical-nav. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { SheenLogo } from "@/components/sheenui/logo/logo";
import { VerticalNav, type VerticalNavSection } from "@/components/sheenui/vertical-nav/vertical-nav";
```

These examples also use avatar, glass-card, logo: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json https://lokendra-builds.github.io/sheenui/r/glass-card.json https://lokendra-builds.github.io/sheenui/r/logo.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, GlassCard, SheenLogo, VerticalNav, type VerticalNavSection } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| sections | VerticalNavSection[] | required | Groups of items, each with an optional heading. |
| value | string | required | Sets the value of the active item when controlled. |
| onValueChange | ((value: string) => void) | optional, no default | Called with an item's value when it is chosen (a plain left click on a link also calls it). |
| renderLink | ((props: NavLinkProps, item: VerticalNavItem) => ReactElement) | a plain <a> | Render items that have an href through your router's link component. Same contract as Navbar's renderLink (see NavLinkProps). |
| header | ReactNode | optional, no default | Logo / product name at the top. Left-aligned; a 28px mark sits centred on the rail. |
| footer | ReactNode | optional, no default | Pinned to the bottom, e.g. a user card or settings. Clipped (not reflowed) on the rail. |
| collapsed | boolean | false | Icon-only rail; labels appear as tooltips. |
| labels | Partial<VerticalNavLabels> | defaultVerticalNavLabels | Every string, for translation: { name: "Sidebar" } (the default landmark name). Every other string, for translation: labels={{ name: "…" }}; omitted keys keep the English of defaultVerticalNavLabels. Its only key is listed in the key table under the props table. |
| aria-label | string | labels.name ("Sidebar") | Landmark name. Give each navigation on a page its own. |
| landmark | boolean | true | Whether the <nav> is a navigation landmark (boolean). Set false (a named role="group") for a nav inside a block that can appear twice on one page, so landmark names stay unique. |
| className | string | optional, no default | Extra classes for the <nav> (set its height; it fills its parent by default). |

## Example 1 of 2: Sidebar and icon rail

Click items to watch the highlight slide; toggle the rail. On a phone, collapse it to see the page beside it.

```tsx
import { useState } from "react";
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { SheenLogo } from "@/components/sheenui/logo/logo";
import { VerticalNav, type VerticalNavSection } from "@/components/sheenui/vertical-nav/vertical-nav";
// Package build (after the first npm release, or a packed tarball): import { Avatar, GlassCard, SheenLogo, VerticalNav, type VerticalNavSection } from "@sheenui/theme";

// Inline 24px line icons: use any icon set (for example lucide-react) instead.
const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const sections: VerticalNavSection[] = [
  {
    title: "Workspace",
    items: [
      { value: "home", label: "Home", icon: icon("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
      { value: "inbox", label: "Inbox", icon: icon("M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z"), badge: 12 },
      { value: "projects", label: "Projects", icon: icon("M3 7h7l2 2h9v10H3z") },
      { value: "analytics", label: "Analytics", icon: icon("M4 20V10M10 20V4M16 20v-7M22 20H2") },
    ],
  },
  {
    title: "Account",
    items: [
      { value: "team", label: "Team", icon: icon("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-3-3M17 5.5a3 3 0 0 1 0 5") },
      { value: "billing", label: "Billing", icon: icon("M3 6h18v12H3zM3 10h18") },
      { value: "settings", label: "Settings", icon: icon("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-2-4-2 .5-1.5-1.5.5-2-4-2-1 2h-2l-1-2-4 2 .5 2L5 6.5 3 7l-2 4 2 1v2l-2 1 2 4 2-.5 1.5 1.5-.5 2 4 2 1-2h2l1 2 4-2-.5-2 1.5-1.5 2 .5 2-4-2-1z") },
    ],
  },
];

const labels = Object.fromEntries(sections.flatMap((s) => s.items.map((item) => [item.value, item.label])));

export function Example() {
  const [value, setValue] = useState("inbox");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex gap-4">
      <VerticalNav
        aria-label="Workspace"
        collapsed={collapsed}
        header={<SheenLogo px={28} variant={collapsed ? "mark" : "full"} glow={false} />}
        sections={sections}
        value={value}
        onValueChange={setValue}
        footer={
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name="Ada Lovelace" size="sm" status="online" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">Ada</span>
                <span className="block truncate text-xs text-sheen-fg-muted">Pro plan</span>
              </span>
            )}
          </div>
        }
      />
      <GlassCard level={2} sheen={false} className="min-w-0 flex-1 self-start px-5 py-4">
        <h3 className="text-lg font-semibold tracking-tight">{labels[value]}</h3>
        <button onClick={() => setCollapsed((c) => !c)}>Toggle icon rail</button>
      </GlassCard>
    </div>
  );
}
```

## Example 2 of 2: Text only, for settings

Icons, titles and the header are all optional. A badge still counts things to look at.

```tsx
import { useState } from "react";
import { VerticalNav } from "@/components/sheenui/vertical-nav/vertical-nav";
// Package build (after the first npm release, or a packed tarball): import { VerticalNav } from "@sheenui/theme";

export function Example() {
  const [value, setValue] = useState("profile");

  return (
    <VerticalNav
      aria-label="Settings"
      value={value}
      onValueChange={setValue}
      sections={[
        {
          items: [
            { value: "profile", label: "Profile" },
            { value: "security", label: "Security" },
            { value: "notifications", label: "Notifications", badge: 3 },
            { value: "billing", label: "Billing" },
          ],
        },
      ]}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Move between items; a normal list of links and buttons. |
| Enter / Space | Follow a link or select an item. |

## Accessibility

- A <nav> with a list; the current item has aria-current="page". Name the nav with aria-label.
- In the icon rail every item keeps its text as an accessible name and shows it in a tooltip on hover and focus.
- Under reduced motion the rail snaps open and shut in one frame.

## All exports on this page

- VerticalNav — Vertical (sidebar) navigation on glass.
- defaultVerticalNavLabels — The English VerticalNavLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the vertical nav

- Use it as a React sidebar for an admin dashboard, with Workspace and Account sections, icons on every row and an unread badge on Inbox, so people can reach any screen in one click.
- Use it for a settings page where Profile, Security, Notifications and Billing sit in a narrow column beside the form, with no icons or section titles needed.
- The collapsed prop turns it into an icon-only rail, which suits apps where the content area needs the width on small laptops but power users still want one-click navigation.
- Skip it when the navigation has only a few top-level destinations and lives across the top of the page; Horizontal nav fits there, and Tabs fits switching views inside a single page.
- Pair it with Avatar in the footer slot for the signed-in user, SheenLogo in the header, and Tooltip behavior already built in for the collapsed rail.


## Frequently asked questions

### How do I build a glass sidebar in React?

Render VerticalNav with sections, value and onValueChange. Each section takes an optional title and items shaped as value, label, icon, badge, href and disabled. Use header for a logo and footer for a user card. The nav fills its parent's height, so set one on className or the parent.

### How does the collapsed icon rail stay accessible?

Every item keeps its text as an accessible name when collapsed, and the label shows in a tooltip on hover and focus. The rail is a nav with a list, the current item carries aria-current="page", and under reduced motion the rail snaps open and shut in one frame.

### Can items be real links with my router?

Yes. Give an item an href and pass renderLink, a function receiving the link props and the item that returns your router's Link element. Items without an href render as buttons. Tab moves between items, Enter follows a link, and Enter or Space presses a button item.

### How do I name the sidebar when there are several navigations?

Pass aria-label, which defaults to Sidebar. Give each navigation landmark on the page its own name, for example Workspace for the sidebar and Main for a top bar, so screen reader users can tell the regions apart in the landmarks list.


## Related pages

- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Accordion](https://lokendra-builds.github.io/sheenui/layout/accordion)
- [Navigation menu](https://lokendra-builds.github.io/sheenui/navigation/navigation-menu)
- [Sidebar](https://lokendra-builds.github.io/sheenui/navigation/sidebar)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
