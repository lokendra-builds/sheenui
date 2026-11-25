Canonical: https://lokendra-builds.github.io/sheenui/overlays/command-palette

# React Command Palette (Cmd+K) with Fuzzy Search

URL: https://lokendra-builds.github.io/sheenui/overlays/command-palette
Sidebar name: Command palette (⌘K)

A glass ⌘K command palette for React: fuzzy search with highlighted matches, recent picks, nested pages and arrow-key navigation. A cmdk alternative. MIT.

What it is: A glass React command palette that opens with ⌘K or Ctrl+K, with fuzzy search, recent picks first and nested pages.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/command.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Command palette (⌘K)

Files to copy from `theme/src/`:

- `components/command/`
- `components/dialog/`
- `components/drawer/parts/sheet.tsx`
- `components/kbd/`
- `components/spinner/`
- `hooks/{use-controllable.ts, use-latest.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/{presets.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, group-segments.ts, ime.ts, modal-flag.ts, modal-tab-trap.ts, page-size.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: command. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Button } from "@/components/sheenui/button/button";
import { CommandPalette } from "@/components/sheenui/command/command";
import { type CommandItem } from "@/components/sheenui/command/parts/model";
import { useCommandShortcut } from "@/components/sheenui/command/use-command-shortcut";
import { KbdShortcut } from "@/components/sheenui/kbd/kbd";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, type CommandItem, CommandPalette, KbdShortcut, useCommandShortcut } from "@sheenui/theme";
```

## CommandPalette

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| items | readonly CommandItem[] | required | The commands. Order is kept when the search field is empty. |
| open | boolean | optional, no default | Whether the palette is open (controlled). |
| defaultOpen | boolean | false | Whether it starts open (uncontrolled). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called with the new state when the palette opens or closes. |
| modal | boolean | true | Whether the rest of the page is blocked while it is open (Base UI dialog semantics). false leaves the page interactive, drops the scrim and does not trap focus: for previews and demos that open on their own. |
| initialFocus | boolean \| RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| HTMLElement \| null \| void) | the search field | Where focus lands when it opens: an element, a ref, or a function (Base UI's initialFocus). false moves focus nowhere, so a palette that opens by itself never steals it. |
| container | HTMLElement \| ShadowRoot \| RefObject<HTMLElement \| ShadowRoot \| null> \| null | the end of document.body | Where the palette is portalled. Pass an element to keep it inside a region instead of the end of the body. |
| trigger | ReactElement<unknown, string \| JSXElementConstructor<any>> | optional, no default | Rendered as the button that opens the palette (focus returns to it on close). |
| shortcut | string \| false | "mod+k" | Global shortcut that toggles the palette. false to register none. |
| onSelect | ((item: CommandItem) => void) | optional, no default | Called after any command runs (besides its own onSelect). |
| query | string | optional, no default | Sets the search text when controlled. |
| defaultQuery | string | "" | The search text on mount (uncontrolled). |
| onQueryChange | ((query: string) => void) | optional, no default | Called with the search text as it changes (fetch your own results here). |
| filter | false \| CommandFilter | defaultFilter | How results are matched. Default: fuzzy match on label, description and keywords. Pass a function to match your way, or false to show items as given (e.g. results you fetched yourself in onQueryChange); matches are still highlighted. |
| deepSearch | boolean | true | From the top level, also search commands inside nested pages. |
| maxResults | number | 100 | Most results listed while searching (the best ones). Keeps typing quick with thousands of commands. |
| virtualized | boolean \| "auto" | "auto" | Windows the result list so only the rows near the viewport are in the DOM: true always, false never, "auto" only above 200 results (a long list with no query, or a large maxResults). The active command, the keyboard keys (aria-activedescendant stays on the search field), aria-setsize / aria-posinset and the scroll height work across every result. Windowed rows are a fixed height (a description is cut to fit) and the group headings are visual only. |
| recent | readonly string[] | optional, no default | Lists the ids of recent commands, newest first, when controlled. |
| onRecentChange | ((ids: string[]) => void) | optional, no default | Called with the new list of recent ids after a command runs. |
| recentStorageKey | string | optional, no default | Remember recents in localStorage under this key (uncontrolled). |
| maxRecent | number | 5 | How many recents to keep. 0 turns the Recent group off. |
| loading | boolean | false | Shows a spinner in the field (and "Searching…" while there are no results yet). |
| emptyState | ReactNode \| ((query: string) => ReactNode) | optional, no default | Replaces the empty state. Gets the query. |
| footer | ReactNode | optional, no default | Extra content at the end of the key-hint footer, or false to hide the footer. Hidden on touch screens. |
| labels | Partial<CommandPaletteLabels> | defaultCommandPaletteLabels | Every other string, for translation: labels={{ title: "…" }}; omitted keys keep the English of defaultCommandPaletteLabels. All 17 keys of CommandPaletteLabels are listed in the key table under the props table. |
| shortcutLabels | Partial<KbdLabels> | defaultKbdLabels | Key names in the shortcut hints (i18n). Every other string, for translation: shortcutLabels={{ mac: "…" }}; omitted keys keep the English of defaultKbdLabels. All 4 keys of KbdLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the dialog panel. |

## CommandItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | optional, no default | Unique across the tree (recents and keys use it). |
| label / description | string | optional, no default | What is shown and searched. |
| keywords | string[] | optional, no default | Extra words that find it but aren't shown. |
| group | string | optional, no default | Heading it is listed under. |
| icon / hint / shortcut | ReactNode / ReactNode / string | optional, no default | Icon tile, trailing text or badge (shown on every screen) and a shortcut hint (display only; hidden on phones). |
| onSelect | (item) => void | optional, no default | Runs when chosen. The palette then closes unless keepOpen. |
| items / placeholder | CommandItem[] / string | optional, no default | Turns the command into a nested page, with its own placeholder. |
| disabled / keepOpen / recordRecent | boolean | false / false / true | Skip it, stay open after running, list it under Recent. |

## useCommandShortcut(callback, options)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| keys | string \| string[] | "mod+k" | Shortcut such as "mod+k", "/" or "shift+mod+p". |
| enabled | boolean | true | Keeps listening only while true. |
| allowInInputs | boolean | true | Fire while typing in a field. Turn off for bare keys like "/". |
| preventDefault | boolean | true | Stop the browser's own action for the shortcut. |

## Example 1 of 3: ⌘K anywhere

Try "dsh" for Dashboard, "prefs" (a hidden keyword) for Settings, or "dark" to reach a theme inside the "Change theme…" page straight from the top. Enter runs a command; Escape or Backspace in an empty field steps back out of a page. Your last picks show under Recent next time.

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { CommandPalette } from "@/components/sheenui/command/command";
import { type CommandItem } from "@/components/sheenui/command/parts/model";
import { useCommandShortcut } from "@/components/sheenui/command/use-command-shortcut";
import { KbdShortcut } from "@/components/sheenui/kbd/kbd";
// Package build (after the first npm release, or a packed tarball): import { Button, CommandPalette, KbdShortcut, useCommandShortcut, type CommandItem } from "@sheenui/theme";
import { House as HomeIcon, Search as SearchIcon } from "lucide-react";

export function Example() {
  const [open, setOpen] = useState(false);
  const setTheme = (theme: "light" | "dark") => document.documentElement.setAttribute("data-theme", theme);

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", group: "Navigation", icon: <HomeIcon />, onSelect: () => location.assign("/") },
    {
      id: "settings",
      label: "Settings",
      keywords: ["preferences", "account"],
      group: "Navigation",
      shortcut: "mod+,",
      onSelect: () => location.assign("/settings"),
    },
    {
      id: "theme",
      label: "Change theme…",
      group: "Actions",
      placeholder: "Choose a theme…",
      items: [
        { id: "theme-light", label: "Light", onSelect: () => setTheme("light") },
        { id: "theme-dark", label: "Dark", onSelect: () => setTheme("dark") },
      ],
    },
    { id: "export", label: "Export workspace", group: "Actions", disabled: true },
  ];

  // Only need the shortcut? The hook works on its own ("mod+k" by default):
  useCommandShortcut(() => setOpen((value) => !value));

  // ⌘K / Ctrl+K toggles the palette; focus returns to the trigger on close.
  return (
    <CommandPalette
      items={commands}
      open={open}
      onOpenChange={setOpen}
      recentStorageKey="my-app:recent-commands"
      trigger={
        <Button variant="glass" leading={<SearchIcon />} trailing={<KbdShortcut keys="mod+k" className="ms-auto" />}>
          Search or jump to…
        </Button>
      }
    />
  );
}
```

## Example 2 of 3: Thousands of commands

Long lists are windowed on their own (virtualized defaults to auto, above 200 results), so the palette stays fast with a big command list. This one lists 3,000 commands and sets maxResults high enough to search them all: arrow down, press Page Down, or type a number.

```tsx
import { Button } from "@/components/sheenui/button/button";
import { CommandPalette } from "@/components/sheenui/command/command";
// Package build (after the first npm release, or a packed tarball): import { Button, CommandPalette } from "@sheenui/theme";

const commands = Array.from({ length: 3000 }, (_, i) => ({
  id: `cmd-${i + 1}`,
  label: `Command ${String(i + 1).padStart(4, "0")}`,
  group: i < 1500 ? "Alpha" : "Beta",
}));

export function Example() {
  return (
    <CommandPalette
      items={commands}
      maxResults={3000}
      shortcut={false}
      trigger={<Button variant="glass">Browse 3,000 commands</Button>}
    />
  );
}
```

## Example 3 of 3: Your own results

filter={false} shows the items you pass, as they are: search a server in onQueryChange and set loading meanwhile. Matches are still highlighted. This one has no global shortcut (shortcut={false}).

```tsx
import { useState } from "react";
import { Button } from "@/components/sheenui/button/button";
import { CommandPalette } from "@/components/sheenui/command/command";
// Package build (after the first npm release, or a packed tarball): import { Button, CommandPalette } from "@sheenui/theme";

type Person = { id: string; name: string; role: string };

// Your data hook: queries your API for the text typed so far.
declare function usePeopleSearch(query: string): { data: Person[]; isLoading: boolean };

export function Example() {
  const [query, setQuery] = useState("");
  const { data: people, isLoading } = usePeopleSearch(query);

  return (
    <CommandPalette
      trigger={<Button variant="glass">Find a person</Button>}
      shortcut={false}
      items={people.map((p) => ({ id: p.id, label: p.name, description: p.role, group: "People" }))}
      query={query}
      onQueryChange={setQuery}
      filter={false}
      loading={isLoading}
      maxRecent={0}
      labels={{ placeholder: "Search people…", inputLabel: "Search people" }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Cmd / Ctrl + K | Open or close the palette from anywhere. |
| Arrow Down / Arrow Up (or Ctrl + N / P) | Move through the results. |
| Page Up / Page Down | Jump through the results. |
| Enter | Run the highlighted command. |
| Escape | Go back one page, then close. |
| Backspace in an empty field | Go back one page. |

## Accessibility

- The field is an ARIA combobox that owns a listbox (aria-activedescendant), so focus never leaves it.
- The result count is announced politely and usage instructions are read on open; the dialog is named by labels.title.
- Shortcut hints expose aria-keyshortcuts. Focus returns to the trigger on close. Every string is translatable.

## API

### CommandPalette

### CommandItem

### useCommandShortcut(callback, options)


## All exports on this page

- CommandPalette — Command palette (Cmd/Ctrl+K): a glass dialog with a fuzzy search field over grouped commands.
- defaultCommandPaletteLabels — The English strings of CommandPalette.
- highlightMatch — Wrap the matched characters in <mark>.
- useCommandShortcut — Global keyboard shortcut, ⌘K / Ctrl+K by default.


## When to use the command palette

- Use it as a Cmd+K menu, a global Cmd+K or Ctrl+K search in a dashboard, where people jump to pages and run actions without leaving the keyboard, with fuzzy matching on label, description and hidden keywords. As a cmdk alternative it is a styled command palette with a search field, groups and keyboard shortcuts built in.
- Use it for an app with many settings, where commands with nested items open a page such as Change theme, and deepSearch finds those inner commands straight from the top level. Use it for Spotlight search in React: press the shortcut, type, and pick a command.
- Use it for async results by passing filter={false} and fetching in onQueryChange, so you can show server search results while the palette still highlights the matched characters.
- Skip it when the user simply picks a value for a form field; Combobox or Select belong inside the form, and a Dropdown menu fits a short fixed list of actions behind one button.
- Pair it with KbdShortcut to display the key beside the trigger button, the useCommandShortcut hook for your own bindings, and Button as the trigger element that opens it.


## SheenUI Command Palette or cmdk?

cmdk is a popular unstyled command menu for React that you compose and style yourself. SheenUI's CommandPalette is styled glass and ships the behaviors most apps then build: groups, nested pages, fuzzy search with highlighted matches, recent commands and a Cmd or Ctrl+K shortcut. Pick cmdk when you want full control of the markup and styling; pick this one when you want those behaviors ready to use and the source to copy.


## Frequently asked questions

### How do I add a Cmd+K command palette to a React app?

Render CommandPalette with an items array of objects that have id and label, and optionally group, icon, keywords, shortcut and onSelect. The shortcut prop defaults to mod+k, which is Cmd on Apple and Ctrl elsewhere; pass shortcut={false} to register none. A trigger element adds a button that opens it.

### Which keys work inside the palette?

Up and Down, or Ctrl+N and Ctrl+P, move through results; Enter runs the command; Escape closes it or goes back from a nested page; Page Up and Down jump. Backspace in an empty field also goes back. Focus stays in the field via aria-activedescendant.

### How do recent commands and shortcuts work?

Used commands are listed first under Recent. They are kept in memory, in localStorage with recentStorageKey, or controlled with recent and onRecentChange; maxRecent defaults to 5 and 0 turns it off. A shortcut on an item is displayed only, so you must bind the key yourself.

### Will it stay fast with thousands of commands?

Results while searching are limited by maxResults, which defaults to 100, so only the best matches are listed. The result count is announced politely, and the highlight glides between rows. With reduced motion the pages fade instead of sliding sideways.


## Related pages

- [Dropdown menu](https://lokendra-builds.github.io/sheenui/overlays/dropdown-menu)
- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)
- [Context menu](https://lokendra-builds.github.io/sheenui/overlays/context-menu)
- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)
- [Hover card](https://lokendra-builds.github.io/sheenui/overlays/hover-card)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
