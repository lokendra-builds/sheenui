Canonical: https://lokendra-builds.github.io/sheenui/components/tabs

# Animated Tabs for React with Sliding Pill

URL: https://lokendra-builds.github.io/sheenui/components/tabs
Sidebar name: Tabs

Animated React tabs: a glass pill slides to the active tab, arrow keys move between tabs and long tab lists scroll. Base UI Tabs, Tailwind CSS v4, MIT.

What it is: Animated tabs for React are a Base UI tab list where a glass pill slides to the active tab, driven by the indicator variables, with full arrow-key support.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/tabs.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Tabs

Files to copy from `theme/src/`:

- `components/tabs/`
- `hooks/{use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `lib/{cn.ts, form.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: tabs. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
```

These examples also use glass-card: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/glass-card.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| Tabs value / defaultValue | string | optional, no default | Sets the active tab (controlled or uncontrolled). |
| Tabs onValueChange | (value) => void | optional, no default | Called when the active tab changes. |
| TabsList className | string | optional, no default | Styles the glass track. Other props (aria-label, activateOnFocus, ...) go to the tablist itself. |
| TabsList activateOnFocus | boolean | false | Activate tabs as arrow keys move focus (otherwise Enter / Space). |
| TabsList morph | boolean | false | Tabs with an icon collapse to just the icon; the active tab grows to show its label. |
| TabsTab value | string | optional, no default | Matches a TabsPanel value. |
| TabsTab icon | ReactNode | optional, no default | A decorative glyph before the label (aria-hidden). With morph on the list, the label shows only while the tab is active. |
| TabsTab disabled | boolean | false | Disables this tab so it cannot be selected. |
| TabsPanel value | string | optional, no default | Shown when its tab is active. |
| Tabs ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example orientation, style, className, render). |
| TabsList ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style, render, loopFocus). |
| TabsTab ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style, className, render, nativeButton). |
| TabsPanel ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example style, className, render, keepMounted). |

## Example 1 of 3: Basic

Workspace stats and recent activity.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        {panels.map(([value, label]) => (
          <TabsTab key={value} value={value}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}
```

## Example 2 of 3: More tabs than room

When the tabs don't fit, the track scrolls sideways instead of clipping: swipe or shift-scroll it, and tabs snap into place. The edges fade only where more tabs are hiding, and choosing a tab (or arrowing to it) scrolls it fully into view. The pill stays on its tab while the track scrolls.

```tsx
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const manyTabs = ["Overview", "Projects", "Members", "Billing", "Integrations", "Security", "Settings"];

export function Example() {
  // Nothing to configure: TabsList scrolls on its own when it overflows.

  return (
    <Tabs defaultValue="billing" className="w-full max-w-xs">
      <TabsList aria-label="Workspace">
        {manyTabs.map((label) => (
          <TabsTab key={label} value={label.toLowerCase()}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
      {manyTabs.map((label) => (
        <TabsPanel key={label} value={label.toLowerCase()}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">The {label.toLowerCase()} panel.</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}
```

## Example 3 of 3: Morphing tabs

With morph on TabsList, tabs that carry an icon collapse to just the icon, and the active tab grows to reveal its label as the pill glides over. Tabs without an icon keep their label.

```tsx
import { Folder as FolderIcon, House as HomeIcon, Settings as GearIcon } from "lucide-react";
import { GlassCard } from "@/components/sheenui/glass-card/glass-card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/sheenui/tabs/tabs";
// Package build (after the first npm release, or a packed tarball): import { GlassCard, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

const panels = [
  ["overview", "Overview", "Workspace stats and recent activity."],
  ["projects", "Projects", "Milestones, owners and deadlines."],
  ["settings", "Settings", "Profile, billing and preferences."],
] as const;

export function Example() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList morph aria-label="Workspace">
        <TabsTab value="overview" icon={<HomeIcon />}>
          Overview
        </TabsTab>
        <TabsTab value="projects" icon={<FolderIcon />}>
          Projects
        </TabsTab>
        <TabsTab value="settings" icon={<GearIcon />}>
          Settings
        </TabsTab>
      </TabsList>
      {panels.map(([value, label, body]) => (
        <TabsPanel key={value} value={value}>
          <GlassCard level={2} className="p-5">
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-sheen-fg-muted">{body}</p>
          </GlassCard>
        </TabsPanel>
      ))}
    </Tabs>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Enter the tab list once (on the active tab); the next Tab moves to the panel. |
| Arrow Left / Arrow Right | Move focus between tabs (Arrow Up / Down when vertical). |
| Home / End | Jump to the first or last tab. |
| Enter / Space | Activate the focused tab (set activateOnFocus on TabsList to activate as focus moves). |

## Accessibility

- role="tablist", tab and tabpanel with aria-selected and aria-controls from Base UI; name the list with aria-label.
- When the tabs do not fit, the list scrolls sideways and a focused tab is scrolled into view.
- The gliding pill is decorative: the active tab is announced through aria-selected. Under reduced motion the pill jumps instead of sliding.

## When to use Tabs

- Use Tabs as a React tabs component with a sliding indicator for a settings page with Profile, Billing and Security sections, where related panels share one place and the sliding glass pill shows the current section.
- Use it for a product page with Overview, Specs and Reviews, keeping a panel mounted through keepMounted when it holds state such as a half-filled form.
- Use activateOnFocus on TabsList when selection should follow keyboard focus, and the controlled value with onValueChange when the active tab should live in app state or the URL.
- Skip it when the choice changes a value, not a panel, where SegmentedControl is lighter, or when the links navigate to separate pages, where VerticalNav or Navbar fit better.
- Pair it with GlassCard for the panel content, Badge for counts inside a tab label, and Select on narrow screens when you have more sections than fit.


## Frequently asked questions

### How do I build animated tabs in React with SheenUI?

Compose Tabs with TabsList, TabsTab and TabsPanel. Give each TabsTab and TabsPanel the same value, and use defaultValue, or value with onValueChange, to control it. The pill slides through Base UI CSS variables, a translate transition on the glass track, and jumps instead of sliding under reduced motion.

### Which keys work on the tab list?

Tab enters the list once, on the active tab, then moves on to the panel. Left and Right arrows move between tabs, Up and Down when vertical, Home and End jump to the ends, and Enter or Space activates the focused tab. The panel itself is focusable so scrollable content stays reachable.

### What happens when the tabs do not fit?

The list scrolls sideways instead of clipping. The scrollbar is hidden, tabs snap into place, the edges fade where more is hidden, and the active tab scrolls into view whenever it changes. Name the list with aria-label when the page does not already name it.

### Are inactive panels kept in the DOM?

No, inactive panels are hidden, and the leaving panel is removed at once so quick switching never shows two panels. Add keepMounted to a TabsPanel to keep it rendered. The entering panel rises 6px using a transform only; with reduced motion it simply appears.


## Related pages

- [Segmented control](https://lokendra-builds.github.io/sheenui/forms/segmented-control)
- [Navbar](https://lokendra-builds.github.io/sheenui/navigation/navbar)
- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Tooltip](https://lokendra-builds.github.io/sheenui/components/tooltip)
- [Alert](https://lokendra-builds.github.io/sheenui/components/alert)
- [Avatar](https://lokendra-builds.github.io/sheenui/components/avatar)

### Guides that cover it

- [Install SheenUI Glass Components in Next.js and Vite](https://lokendra-builds.github.io/sheenui/guides/install-frameworks)
- [Framer Motion Examples: 12 Animated React Patterns](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples)
- [Framer Motion Is Now Motion](https://lokendra-builds.github.io/sheenui/guides/framer-motion-to-motion)
- [Base UI vs Radix UI for React in 2026](https://lokendra-builds.github.io/sheenui/guides/base-ui-vs-radix)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
