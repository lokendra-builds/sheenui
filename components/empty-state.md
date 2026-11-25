Canonical: https://lokendra-builds.github.io/sheenui/components/empty-state

# Empty State Component for React & Tailwind

URL: https://lokendra-builds.github.io/sheenui/components/empty-state
Sidebar name: Empty state

An animated empty state component for React: a glass orb springs in over soft rings with one clear next step, plus a compact row for tables. MIT.

What it is: An animated React empty state component that shows one clear next step when a page, list or search has nothing in it yet.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/empty-state.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Empty state

Files to copy from `theme/src/`:

- `components/empty-state/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/tokens.ts`
- `lib/{cn.ts, heading.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: empty-state. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { EmptyState } from "@/components/sheenui/empty-state/empty-state";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, EmptyState } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | optional, no default | An icon (24px, currentColor) shown in the glass orb (full) or tile (compact). |
| illustration | ReactNode | optional, no default | Your own artwork, shown instead of the orb (an SVG or image, sized by you). |
| title | ReactNode | required | The heading: say what is missing ("No messages yet"). |
| description | ReactNode | optional, no default | One sentence on why it is empty and what to do. |
| action | ReactNode | optional, no default | The main next step, usually a primary Button. |
| secondaryAction | ReactNode | optional, no default | A lower-emphasis alternative, usually a ghost or glass Button / link. |
| variant | "full" \| "compact" | "full" | full (default): centred, for pages and panels. compact: one row, for tables and small cards. |
| surface | "glass" \| "none" \| "dashed" | "none" | none (default), glass (its own card) or dashed (a drop-zone-like outline). |
| tone | "neutral" \| "accent" \| "success" \| "warning" \| "danger" | "accent" | Colour of the icon and its tint (default "accent"). Words carry the meaning; colour only supports it. |
| headingLevel | false \| HeadingLevelOption | 3 | Heading level of the title (1 to 6, default 3), to fit the page outline. "none" renders a paragraph with no heading role. false is the deprecated spelling of "none" (still accepted, removed in 1.0). |
| animated | boolean | true | Entrance animation (off under reduced motion either way). |
| announce | string \| boolean | optional, no default | Announce the empty state to screen readers when it appears (e.g. a search with no results): true speaks the title and description (when they are text), a string speaks that. Uses one persistent polite region, so it is read reliably. |

## Example 1 of 3: First run

Full variant on a dashed outline: icon, title, description, a primary and a secondary action.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { EmptyState } from "@/components/sheenui/empty-state/empty-state";
// Package build (after the first npm release, or a packed tarball): import { Button, EmptyState } from "@sheenui/theme";
import { Folder as FolderIcon, Plus as PlusIcon } from "lucide-react";

export function Example() {
  return (
    <EmptyState
      surface="dashed"
      icon={<FolderIcon />}
      title="Create your first project"
      description="Projects keep your screens, tokens and assets together. Start from scratch or import a design file."
      action={<Button leading={<PlusIcon />}>New project</Button>}
      secondaryAction={<Button variant="glass">Import a file</Button>}
    />
  );
}
```

## Example 2 of 3: No results

Neutral tone on a glass card. announce reads it out when a search comes back empty, through one status region that stays mounted (a region that mounts with its text is often skipped by screen readers).

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { EmptyState } from "@/components/sheenui/empty-state/empty-state";
// Package build (after the first npm release, or a packed tarball): import { Button, EmptyState } from "@sheenui/theme";
import { Search as SearchIcon } from "lucide-react";

export function Example() {
  const [query, setQuery] = useState("flrbl");

  return (
    <EmptyState
      announce
      surface="glass"
      tone="neutral"
      icon={<SearchIcon />}
      title={`No results for “${query}”`}
      description="Check the spelling or try fewer words."
      action={<Button variant="glass" onClick={() => setQuery("")}>Clear search</Button>}
    />
  );
}
```

## Example 3 of 3: Compact and error

Compact: one row for tables, inboxes and sidebars (it wraps on phones). Tones color the icon only; the words carry the meaning.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { EmptyState } from "@/components/sheenui/empty-state/empty-state";
// Package build (after the first npm release, or a packed tarball): import { Button, EmptyState } from "@sheenui/theme";
import { CloudOff as CloudOffIcon, Inbox as InboxIcon } from "lucide-react";

export function Example() {
  return (
    <>
      <EmptyState
        variant="compact"
        surface="glass"
        icon={<InboxIcon />}
        title="Inbox zero"
        description="New messages from your team show up here."
        action={<Button size="sm" variant="glass">Compose</Button>}
      />
      <EmptyState
        variant="compact"
        surface="glass"
        tone="danger"
        icon={<CloudOffIcon />}
        title="Couldn't load invoices"
        description="The server took too long to answer."
        action={<Button size="sm">Try again</Button>}
      />
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: the block is not focusable. The buttons in action and secondaryAction are normal tab stops. |

## Accessibility

- Plain markup with a heading; the icon is decorative. Pass announce to tell screen readers when the state appears after a search or filter.
- Always offer a way forward (clear the filter, create the first item); do not leave an empty state without an action when one exists.

## When to use the empty state

- Use it as an empty state UI for a first-run dashboard or project list, with an icon, a title, one sentence of explanation, a primary Button to create the first item and a secondary action such as Import.
- Use it for search and filter results that come back empty, with the neutral tone, a hint to check spelling and announce so screen readers hear that nothing matched.
- Use variant="compact" inside tables, inboxes and sidebars, where a single row such as Inbox zero or Couldn't load invoices fits and the danger tone colors the icon and its tint.
- Skip it for content that is still loading; Skeleton holds the layout while data arrives, and Alert is better for a persistent warning or error message above existing content.
- Pair it with Button for the next step, Input in children for a search field, and Skeleton to show the loading state before the empty one.


## Frequently asked questions

### How do I build an empty state component in React?

Render EmptyState with a required title and optionally description, icon, action and secondaryAction. The full variant is centered for pages and panels. Pick a surface of none, glass or dashed, and a tone of accent, neutral, success, warning or danger, which colors the icon and its tint while the words carry the meaning.

### How do I make screen readers announce an empty search result?

Set announce to true to speak the title and description, or pass a string to speak that text. It uses one persistent polite status region, because a region that mounts together with its text is often skipped by screen readers. Do it when results change after a search or filter.

### Which heading level should the title use?

The title renders as an h3 by default. Use headingLevel (1 to 6, or false for a paragraph) to fit the page outline, for instance p inside a small table cell. The icon is decorative and the markup is not focusable, but buttons in action and secondaryAction are normal tab stops.

### Can I replace the glass orb or turn off the animation?

Pass illustration to use your own artwork instead of the orb, and animated={false} to skip the entrance, which is also always off under reduced motion. The icon should be a 24px currentColor icon. Extra content such as links goes in children, under the actions.


## Related pages

- [Meter](https://lokendra-builds.github.io/sheenui/components/meter)
- [Table](https://lokendra-builds.github.io/sheenui/components/table)
- [Skeleton](https://lokendra-builds.github.io/sheenui/components/skeleton)
- [Carousel](https://lokendra-builds.github.io/sheenui/components/carousel)
- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
