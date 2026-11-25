Canonical: https://lokendra-builds.github.io/sheenui/components/badge

# React Badge Component: Status & Count Badges

URL: https://lokendra-builds.github.io/sheenui/components/badge
Sidebar name: Badge

Glass status and count badges for React and Tailwind CSS v4. Every status carries words, never color alone. Accessible, MIT, copy the source.

What it is: A React badge is a small glass label for status and counts that stays readable on any background and never relies on color alone. Use Badge as a status badge next to a table row or card title, such as Paid, Draft or Beta, where one short word explains the state at a glance.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 25, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Badge

Files to copy from `theme/src/`:

- `components/badge/`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: badge. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
```

These examples also use button: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/button.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Badge, Button } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| tone | "neutral" \| "accent" \| "success" \| "warning" \| "danger" \| "solid" | "neutral" | Colour role: "neutral" (glass), "accent", "success", "warning" or "danger". "solid" still works but is deprecated: it means variant="solid" and logs a development warning once. |
| variant | "solid" \| "soft" | "soft" | Visual form: "soft" (the tone's tint) or "solid" (the filled accent gradient; it ignores tone). |
| dot | boolean | false | Small dot before the text, e.g. for statuses. |
| pulse | boolean | false | Pulsing dot for live states. Pings a few times, then rests; still with reduced motion. |

## Example 1 of 2: Tones

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
// Package build (after the first npm release, or a packed tarball): import { Badge } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success" dot>Active</Badge>
      <Badge tone="warning" dot>Pending</Badge>
      <Badge tone="danger" dot>Failed</Badge>
      <Badge variant="solid">Pro</Badge>
      <Badge tone="success" pulse>Live</Badge>
    </>
  );
}
```

## Example 2 of 2: Counts and inline status

Badges sit beside the thing they describe: a count on a button, a status next to a name.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { Badge, Button } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Button variant="glass">
        Inbox <Badge tone="accent">12</Badge>
      </Button>
      <p className="flex items-center gap-2 text-sm">
        Production deploy <Badge tone="success" dot>Passing</Badge>
      </p>
      <p className="flex items-center gap-2 text-sm">
        Billing <Badge tone="warning" dot>Past due</Badge>
      </p>
      <Badge tone="danger">3 failed</Badge>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: a Badge is not interactive. Put it inside a button or link if it should be. |

## Accessibility

- A badge always carries words, so color is never the only signal; the dot is aria-hidden.
- The tint sits on a near-opaque surface, so text keeps 4.5:1 contrast over glass or photos.
- The pulse stops after four pings (WCAG 2.2.2) and is off under reduced motion.

## When to use Badge

- Use Badge on an invoice list or a project card to label an item Paid, Draft or Beta in one short word, with a dot or an icon beside it so the state never rests on color alone.
- Use it for a count beside a navigation item, for example 3 new beside Inbox, and choose the accent or solid tone to separate it from neutral labels.
- Use the dot and pulse props for a live state like a running deploy or an active stream; the ping runs a few times then rests, and stays still under reduced motion.
- Skip it when the label must be clicked, toggled or removed. A Badge takes no focus, so use Button for an action or Toggle for a pressed state instead.
- Pair it with Avatar for a role under a name, DataTable cells for status columns, and Progress when a state needs a number and not only a word.


## Frequently asked questions

### Which tones does the react badge component offer?

The tone prop takes neutral, accent, success, warning, danger or solid, with neutral as the default. Neutral is a glass surface, the colored tones are flat tints over a near-opaque base, and solid is a filled accent. Every badge carries words so color is never the only signal.

### Does the pulsing dot loop forever?

No. The pulse prop pings the dot a few times, four according to the source comments, and then rests with a solid dot, which keeps it within WCAG 2.2.2 on endless motion. Under reduced motion the ping is skipped and only the static dot remains.

### Can I use Badge as a button?

Not directly. Badge renders a span with the normal span attributes and is not interactive or focusable. For something clickable, use a Button, for example the ghost or glass variant at the sm size, so keyboard users get a real tab stop and Enter or Space activation.

### Will badge text stay readable over images?

Yes for the colored tones. The tint is layered over a near-opaque surface, so the tone text color keeps a 4.5:1 contrast ratio over glass, photos or blobs. The neutral tone uses a single glass surface, and the status dot is aria-hidden so screen readers only read the words.


## Related pages

- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Button group](https://lokendra-builds.github.io/sheenui/components/button-group)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)
- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)
- [Dialog](https://lokendra-builds.github.io/sheenui/components/dialog)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
