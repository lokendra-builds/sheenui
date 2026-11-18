Canonical: https://lokendra-builds.github.io/sheenui/overlays/kbd

# Kbd Component for React Keyboard Shortcuts

URL: https://lokendra-builds.github.io/sheenui/overlays/kbd
Sidebar name: Kbd

A Kbd component for React: write mod+k once and it shows ⌘K on Mac and Ctrl+K elsewhere, while screen readers hear key names. Tailwind CSS v4, MIT.

What it is: The Kbd component renders keyboard shortcuts as glass key caps in React, showing ⌘K on a Mac and Ctrl+K on Windows and Linux from one definition.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/kbd.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Kbd

Files to copy from `theme/src/`:

- `components/kbd/`
- `lib/cn.ts`
- `styles/`

Packages:

```bash
pnpm add clsx tailwind-merge
```

Registry item: kbd. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Kbd, KbdShortcut } from "@/components/sheenui/kbd/kbd";
import { formatShortcut, matchesShortcut } from "@/components/sheenui/kbd/shortcut";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { formatShortcut, Kbd, KbdShortcut, matchesShortcut } from "@sheenui/theme";
```

## KbdShortcut

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| keys | string \| readonly string[] | required | The shortcut: "mod+k", "shift+mod+p", "?" or an array of keys. mod = ⌘ on Apple, Ctrl elsewhere. |
| variant | "chips" \| "inline" | "chips" | "chips": one key cap per key. "inline": plain text as in menus (⇧⌘P, Ctrl+Shift+P). |
| platform | ShortcutPlatform \| "auto" | "auto" | Force a platform, e.g. to document both. |
| size | "sm" \| "md" | "sm" | Size of the key caps in the "chips" variant. |
| labels | Partial<KbdLabels> | defaultKbdLabels | Override the visible or spoken key names (i18n). Every other string, for translation: labels={{ mac: "…" }}; omitted keys keep the English of defaultKbdLabels. All 4 keys of KbdLabels are listed in the key table under the props table. |
| announce | boolean | true | Read the shortcut to screen readers ("Command K"). Turn off when the parent already exposes it, e.g. a menu item with aria-keyshortcuts. |

## Kbd and helpers

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| size | "sm" \| "md" | "sm" | Height of the key cap: "sm" (default, 20px) or "md" (24px). |
| <Kbd size> | "sm" \| "md" | "sm" | One key cap; any text or symbol inside. |
| formatShortcut(keys, platform, labels?) | { keys, spoken, aria } | optional, no default | Visible keys, words for screen readers and an aria-keyshortcuts value. |
| matchesShortcut(event, keys, platform?) | boolean | optional, no default | Does a keydown event match? Modifiers must match exactly. |
| useShortcutPlatform(platform?) | "mac" \| "other" | optional, no default | Returns the visitor's platform ("other" during server rendering). |

## Example 1 of 2: Keys and shortcuts

Press CtrlKControl K to search, ? for every shortcut.

```tsx
import { Kbd, KbdShortcut } from "@/components/sheenui/kbd/kbd";
// Package build (after the first npm release, or a packed tarball): import { Kbd, KbdShortcut } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Kbd>Esc</Kbd>
      <Kbd>↵</Kbd>
      <KbdShortcut keys="mod+k" />
      <KbdShortcut keys="shift+mod+p" />
      <KbdShortcut keys="mod+k" size="md" />

      <p>Press <KbdShortcut keys="mod+k" /> to search.</p>
    </>
  );
}
```

## Example 2 of 2: Every platform

Chips for hints in text; inline for menus (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere), in each platform's own modifier order. Pin a platform to document both.

```tsx
import { useEffect } from "react";
import { KbdShortcut } from "@/components/sheenui/kbd/kbd";
import { formatShortcut, matchesShortcut } from "@/components/sheenui/kbd/shortcut";
// Package build (after the first npm release, or a packed tarball): import { KbdShortcut, formatShortcut, matchesShortcut } from "@sheenui/theme";

export function Example() {
  // Helpers
  const parts = formatShortcut("shift+mod+p", "other"); // { keys: ["Ctrl", "Shift", "P"], spoken: "Control Shift P", aria: "Control+Shift+P" }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (matchesShortcut(event, "mod+k")) console.log("palette"); // in a keydown handler
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <p>{parts.spoken}</p>
      <KbdShortcut keys="shift+mod+p" /> {/* chips */}
      <KbdShortcut keys="shift+mod+p" variant="inline" /> {/* menu text */}
      <KbdShortcut keys="shift+mod+p" platform="mac" /> {/* always ⇧ ⌘ P */}
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: Kbd and KbdShortcut only display keys. |

## Accessibility

- Keys render in <kbd> elements. KbdShortcut adds a visually hidden spoken form ("Control Shift P") unless announce is false.
- Pass platform to force Mac or other symbols; by default the visitor's platform decides, so "mod" shows Cmd on a Mac and Ctrl elsewhere.
- A shortcut shown in a menu item is only a hint: wire the handler yourself (see useCommandShortcut and matchesShortcut).

## API

### KbdShortcut

### Kbd and helpers


## When to use the Kbd component

- Use it as a keyboard shortcut component in help text and docs to show a single key, such as pressing Esc to close a panel, as a native kbd element with a sm or md size.
- Use KbdShortcut next to a search button or a menu item to show a combination like mod+k, which reads as the Command symbol and K on a Mac and Ctrl K elsewhere.
- Use it inside an onboarding checklist or a shortcuts cheat sheet, where variant="inline" writes plain text like Ctrl+Shift+P and the chips variant draws one cap per key.
- Skip it when the element is clickable or needs behavior; Kbd is a label and not a control, so Button fits an action, and binding the key still needs your own handler.
- Pair it with Dropdown menu or Command palette items, which already show shortcuts, Tooltip to reveal a key when hovering an icon button, and the useShortcutPlatform hook for custom text.


## Frequently asked questions

### How do I show a keyboard shortcut in React?

Use KbdShortcut with keys as a string like shift+mod+p or an array. The word mod means Command on Apple platforms and Ctrl elsewhere. It only displays the shortcut; binding the key is up to you, for example with matchesShortcut or the useCommandShortcut hook.

### Does it cause hydration mismatches for Mac and Windows?

useShortcutPlatform reads the browser once and returns other during server rendering, so the server and client agree on the first render. Pass platform="mac" or "other" to force one, which is useful for docs that show both platforms side by side.

### How do screen readers read the key caps?

The visible keys are aria-hidden and a visually hidden span reads the key names, such as Command K, instead of symbols. Set announce={false} when a parent already exposes it, for instance a menu item with aria-keyshortcuts. Single Kbd text is read as written.

### Can I rename keys for another language?

Yes. KbdShortcut takes a labels prop that overrides key names for i18n, and defaultKbdLabels holds the default glyphs and spoken names per platform. The key caps are flat with no backdrop blur and no motion, and forced colors draw a CanvasText border.


## Related pages

- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Command palette (⌘K)](https://lokendra-builds.github.io/sheenui/overlays/command-palette)
- [Context menu](https://lokendra-builds.github.io/sheenui/overlays/context-menu)
- [Drawer / Sheet](https://lokendra-builds.github.io/sheenui/overlays/drawer)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
