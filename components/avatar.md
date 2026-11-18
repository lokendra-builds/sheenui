Canonical: https://lokendra-builds.github.io/sheenui/components/avatar

# React Avatar Component with Status & Initials

URL: https://lokendra-builds.github.io/sheenui/components/avatar
Sidebar name: Avatar

A glass React avatar component with an image, a gradient-initials fallback and an online status dot. Accessible, Tailwind CSS v4, copy-paste source. MIT.

What it is: A glass React avatar component that shows an image, falls back to gradient initials, and can show an online status dot.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/avatar.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Avatar

Files to copy from `theme/src/`:

- `components/avatar/`
- `lib/{cn.ts, initials.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: avatar. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar, AvatarGroup } from "@/components/sheenui/avatar/avatar";
import { useToast } from "@/components/sheenui/toast/toast";
```

These examples also use toast: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/toast.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, AvatarGroup, useToast } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| name | string | required | Full name: used for alt text and the initials fallback. |
| src | string | optional, no default | Image URL. While it loads (or if it fails) the initials show instead. |
| size | "sm" \| "md" \| "lg" | "md" | Sets the diameter: "sm" 32px, "md" 40px, "lg" 56px. |
| status | "online" \| "away" \| "offline" | optional, no default | Presence dot at the bottom-right corner: online, away or offline (a hollow ring). Hidden when omitted. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## Example 1 of 2: Sizes, status and groups

```tsx
import { Avatar, AvatarGroup } from "@/components/sheenui/avatar/avatar";
// Package build (after the first npm release, or a packed tarball): import { Avatar, AvatarGroup } from "@sheenui/theme";

export function Example() {
  return (
    <>
      <Avatar name="Ada Lovelace" size="lg" status="online" />
      <Avatar name="Asha Verma" status="away" />
      <AvatarGroup>
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}
```

## Example 2 of 2: Clickable and labeled

An avatar is not interactive: wrap it in a button with a name, and label a group so people know who it shows.

```tsx
import { Avatar, AvatarGroup } from "@/components/sheenui/avatar/avatar";
import { useToast } from "@/components/sheenui/toast/toast";
// Package build (after the first npm release, or a packed tarball): import { Avatar, AvatarGroup, useToast } from "@sheenui/theme";

export function Example() {
  const toast = useToast();

  return (
    <>
      <button
        type="button"
        aria-label="AL, open Ada Lovelace's profile"
        onClick={() => toast.success("Opening profile")}
        className="sheen-hit rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
      >
        <Avatar name="Ada Lovelace" status="online" />
      </button>

      <Avatar name="Grace Hopper" size="lg" status="away" />

      <AvatarGroup aria-label="Design team: Ravi, Meera and John">
        <Avatar name="Ravi Kumar" size="sm" />
        <Avatar name="Meera Iyer" size="sm" />
        <Avatar name="John Doe" size="sm" />
      </AvatarGroup>
    </>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | Not focusable: an Avatar is not interactive. Wrap it in a button or link when it should be clickable. |

## Accessibility

- An image avatar uses the person's name as its alt text. The initials fallback is role="img" with the full name as its label.
- The presence dot is its own labeled image (online, away, offline). Offline is a hollow ring, so states differ by shape, not only by color.
- In AvatarGroup, pass an aria-label that says who the people are; each avatar keeps its own name.
- Forced colors use system colors with an edge, so the status dot stays visible.

## When to use Avatar

- Use Avatar with an initials fallback beside each author in a comment thread or activity feed, where a profile picture gives people a quick visual anchor and initials cover users who never uploaded one.
- Use the status prop for an avatar with status in a team directory or chat sidebar that shows who is online, away or offline, with the hollow ring marking offline so color is not the only cue.
- Use AvatarGroup for a stack of project members on a card header, labeled with an aria-label that says who the people are, such as Project members.
- Skip it when the picture itself must be clicked or must act as a control. Avatar takes no focus, so wrap it in a Button or a link, or use a Badge for non-person labels.
- Pair it with Tooltip to reveal a full name on hover, DataTable for a user column with a picture, and Badge for a role label placed under the name.


## Frequently asked questions

### What does the React avatar component show when the image fails to load?

It shows initials built from the name prop, taking the first letters of up to the first two words, uppercased. With an image, the initials appear after a short 400ms delay if it is still loading, and stay if it fails. Under the hood it uses Base UI Avatar, so the fallback swaps in without extra state in your code.

### How do I make an avatar accessible?

Pass the full name. It becomes the alt text of the image, and the initials fallback is exposed as role img with the name as its label. The presence dot is its own labeled image reading online, away or offline. The avatar itself is not interactive and takes no focus.

### What sizes does the SheenUI Avatar support?

Three sizes through the size prop: sm at 32px, md at 40px, which is the default, and lg at 56px. The pixel width and height are also written on the img element, so the browser reserves the box before the image arrives and the layout does not shift.

### How do I make an avatar clickable?

Avatar is deliberately not interactive, so wrap it in a Button (for example the ghost variant) or a link with its own accessible name. That keeps focus and keyboard activation on a real control, and the avatar inside stays a plain image with its label.


## Related pages

- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)
- [Button](https://lokendra-builds.github.io/sheenui/components/button)
- [Button group](https://lokendra-builds.github.io/sheenui/components/button-group)
- [Checkbox](https://lokendra-builds.github.io/sheenui/components/checkbox)
- [Combobox (Select2)](https://lokendra-builds.github.io/sheenui/components/combobox)
- [Data table](https://lokendra-builds.github.io/sheenui/components/data-table)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
