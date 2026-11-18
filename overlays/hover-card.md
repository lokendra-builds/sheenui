Canonical: https://lokendra-builds.github.io/sheenui/overlays/hover-card

# React Hover Card for Link & Profile Previews

URL: https://lokendra-builds.github.io/sheenui/overlays/hover-card
Sidebar name: Hover card

A glass React hover card that previews a profile or page on hover or focus, with a tap-to-open rule for touch screens. Base UI, Tailwind CSS v4, MIT.

What it is: A glass React hover card that previews what is behind a link, opening on hover or keyboard focus after a short delay.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/hover-card.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Hover card

Files to copy from `theme/src/`:

- `components/hover-card/`
- `components/avatar/`
- `hooks/{use-media-query.ts, use-preferences.ts}`
- `motion/light-follower.ts`
- `lib/{cn.ts, initials.ts, popup-a11y.ts, popup-motion.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx tailwind-merge
```

Registry item: hover-card. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { Badge } from "@/components/sheenui/badge/badge";
import { createHoverCardHandle, HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview, ProfilePreview } from "@/components/sheenui/hover-card/hover-card";
```

These examples also use badge: `npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/badge.json`

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Avatar, Badge, createHoverCardHandle, HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview, ProfilePreview } from "@sheenui/theme";
```

## HoverCard

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| open / defaultOpen / onOpenChange | boolean / boolean / (open, details) => void | false | Controlled or uncontrolled (Base UI Preview Card). |
| handle | Handle<Payload> | optional, no default | From createHoverCardHandle(): share one card between detached triggers. |
| children | ReactNode \| ({ payload }) => ReactNode | optional, no default | The content; a function receives the active trigger's payload. |
| ...props | Base UI props | optional, no default | The rest is passed to the underlying Base UI part (for example onOpenChangeComplete, actionsRef, triggerId, defaultTriggerId). |

## HoverCardTrigger / HoverCardContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| delay | number | 500 | How long to wait before the preview card opens. Specified in milliseconds. |
| closeDelay | number | 250 | How long to wait before closing the preview card. Specified in milliseconds. |
| variant | "link" \| "plain" | "link" | "link" (default): accent underlined text for links in a sentence. "plain": only the focus ring (avatars, chips). |
| children | ReactNode | optional, no default | The card's content: your own markup, ProfilePreview or LinkPreview. |
| side | "top" \| "bottom" \| "left" \| "right" | "bottom" | Preferred side of the trigger; it flips when there is no room. |
| align | "center" \| "end" \| "start" | "center" | Sets the alignment along that side. |
| sideOffset | number | 10 | Gap between the trigger and the card, in px. |
| padded | boolean | true | Pad the content (1rem). Turn off for edge-to-edge content such as LinkPreview's image. |
| touchHint | ReactNode | "Tap the link again to open it." | Shown under the content when a tap opened the card, so touch users know how to follow the link. Pass null to hide it (e.g. when the trigger is not a link). |
| container | HTMLElement \| ShadowRoot \| RefObject<HTMLElement \| ShadowRoot \| null> \| null | <body> | Where to portal the card (defaults to <body>). |
| Trigger href | string | optional, no default | It renders an <a>: the link stays the one accessible element. |
| Trigger payload / handle | Payload / Handle | optional, no default | For triggers outside <HoverCard>. |

## Content presets

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| ProfilePreview | { name, handle?, avatarSrc?, status?, badge?, bio?, stats?, joined?, joinedLabel?, locale?, cover? } | optional, no default | Profile layout. stats values are shortened (12 400 → 12.4K); joined is formatted with Intl (a date-only string like "2021-08-01" is read as a local date). |
| LinkPreview | { url, title, description?, image?, imageAlt?, siteName?, favicon? } | optional, no default | Link card. Use with padded={false} on the content. The image fades in once loaded (again when image changes); without an image, or if it fails, the site's initial is shown. |

## LinkPreview props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| url | string | required | The page's address; its host name is shown under the title. |
| title | ReactNode | required | Shows the page's title as the card heading. |
| description | ReactNode | optional, no default | Shows one or two lines about the page. |
| image | string | optional, no default | Sets the preview image (1.91 : 1, the usual social-card shape). |
| imageAlt | string | "" | Sets the alt text for the image. |
| siteName | ReactNode | optional, no default | Shown instead of the host name, e.g. "GitHub". |
| favicon | ReactNode | the site's first letter | Small site icon: an image URL or your own element. |
| className | string | optional, no default | Adds extra classes to the card content. |

## ProfilePreview props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| name | string | required | Shows the person's name as the card heading. |
| handle | string | optional, no default | Sets the username, shown as "@handle". |
| avatarSrc | string | optional, no default | Avatar image URL; without it the avatar shows initials. |
| status | "online" \| "away" \| "offline" | optional, no default | Shows the presence dot on the avatar ("online", "away", ...). |
| badge | ReactNode | optional, no default | Small element next to the name, e.g. <Badge tone="accent">Pro</Badge>. |
| bio | ReactNode | optional, no default | Shows a line or two about the person. |
| stats | ProfilePreviewStat[] | optional, no default | Numbers are shortened for the locale (12 400 → "12.4K"). |
| joined | string \| number \| Date | optional, no default | Join date; formatted with Intl for locale. |
| joinedLabel | ((formattedDate: string) => ReactNode) | (date) => `Joined ${date}` | Wording around the formatted join date (i18n). |
| locale | string | the browser's | Locale for numbers and dates (defaults to the browser's). |
| cover | boolean | true | Draws a decorative gradient band behind the avatar. |
| className | string | optional, no default | Adds extra classes to the card content. |

## Example 1 of 4: Profile preview

Hover or Tab to a mention. ProfilePreview formats numbers and the join date for the locale.

```tsx
import { Badge } from "@/components/sheenui/badge/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@/components/sheenui/hover-card/hover-card";
// Package build (after the first npm release, or a packed tarball): import { Badge, HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@sheenui/theme";

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://example.com/ada-lovelace">@ada-lovelace</HoverCardTrigger>
      <HoverCardContent>
        <ProfilePreview
          name="Ada Lovelace"
          handle="ada-lovelace"
          status="online"
          badge={<Badge tone="accent">Maintainer</Badge>}
          bio="Builds SheenUI. Likes glass, springs and contrast ratios above 4.5."
          stats={[{ label: "followers", value: 12400 }, { label: "following", value: 183 }]}
          joined="2019-03-14"
        />
      </HoverCardContent>
    </HoverCard>
  );
}
```

## Example 2 of 4: Link preview

Image, site, title and description. Motion's card has an image (it fades in once loaded) and an image favicon; Base UI and Tailwind CSS have none, so a soft gradient with the site's initial keeps the card's shape. A broken image falls back to the same initial.

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@/components/sheenui/hover-card/hover-card";
// Package build (after the first npm release, or a packed tarball): import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@sheenui/theme";

export function Example() {
  // Any image URL or data: URI works; 1.91 : 1 is the usual social-card shape.
  const springOgImage = "https://example.com/og/motion.png";
  const springIcon = "https://motion.dev/favicon.ico";

  return (
    <>
      <HoverCard>
        <HoverCardTrigger href="https://motion.dev" target="_blank" rel="noopener">Motion</HoverCardTrigger>
        <HoverCardContent padded={false}>
          <LinkPreview
            url="https://motion.dev"
            siteName="Motion"
            title="Motion – A modern animation library for JavaScript and React"
            description="Springs, gestures, layout animations and scroll effects."
            image={springOgImage}
            imageAlt="A spring curve that overshoots once, then settles on its target."
            favicon={springIcon}
          />
        </HoverCardContent>
      </HoverCard>

      {/* No image: the card shows a gradient with the site's initial. */}
      <LinkPreview url="https://tailwindcss.com" siteName="Tailwind CSS" title="Tailwind CSS" description="A utility-first CSS framework." />
    </>
  );
}
```

## Example 3 of 4: One card, many triggers

A handle links one HoverCard to triggers anywhere; each passes its own payload. Moving between avatars swaps the content without closing.

```tsx
import { Avatar } from "@/components/sheenui/avatar/avatar";
import { createHoverCardHandle, HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@/components/sheenui/hover-card/hover-card";
// Package build (after the first npm release, or a packed tarball): import { Avatar, createHoverCardHandle, HoverCard, HoverCardContent, HoverCardTrigger, ProfilePreview } from "@sheenui/theme";

type Person = { name: string; handle: string; href: string; bio: string };

const team: Person[] = [
  { name: "Asha Verma", handle: "@asha", href: "https://example.com/asha", bio: "Design systems." },
  { name: "Ravi Kumar", handle: "@ravi", href: "https://example.com/ravi", bio: "Frontend platform." },
  { name: "Meera Iyer", handle: "@meera", href: "https://example.com/meera", bio: "Accessibility." },
];

export function Example() {
  const teamCard = createHoverCardHandle<Person>();

  return (
    <>
      <div className="flex -space-x-2.5 any-pointer-coarse:space-x-1">
        {team.map((person) => (
          <HoverCardTrigger key={person.handle} handle={teamCard} payload={person} href={person.href} target="_blank" rel="noopener" variant="plain">
            <Avatar name={person.name} />
          </HoverCardTrigger>
        ))}
      </div>

      <HoverCard handle={teamCard}>
        {({ payload }) => payload && (
          <HoverCardContent>
            <ProfilePreview {...payload} />
          </HoverCardContent>
        )}
      </HoverCard>
    </>
  );
}
```

## Example 4 of 4: Placement and delay

side flips to the other side when there is no room. delay is how long the pointer must rest on the link; closeDelay gives it time to reach the card.

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@/components/sheenui/hover-card/hover-card";
// Package build (after the first npm release, or a packed tarball): import { HoverCard, HoverCardContent, HoverCardTrigger, LinkPreview } from "@sheenui/theme";

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://base-ui.com" target="_blank" rel="noopener" delay={500} closeDelay={250}>
        Base UI
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" sideOffset={10} padded={false}>
        <LinkPreview url="https://base-ui.com" siteName="Base UI" title="Base UI" description="Unstyled, accessible React components." />
      </HoverCardContent>
    </HoverCard>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Focusing the link opens the card after the delay. |
| Enter | Follow the link. |
| Escape | Close the card. |

## Accessibility

- A hover card is an extra for links: it is not announced, so the link text must make sense alone and the card must not hold the only copy of anything.
- On touch screens the first tap opens the card and a second tap follows the link.
- Content inside is not reachable by Tab; use a Popover for interactive content.

## All exports on this page

- HoverCard — Hover card: a glass preview of what is behind a link (a profile, a page) shown on hover or keyboard focus.
- HoverCardContent — The glass card, portalled to the end of the body and positioned next to the trigger.
- HoverCardTrigger — The link that opens the card.
- LinkPreview — Link card content: image, site, title and description.
- ProfilePreview — Profile card content: avatar, name, handle, bio, stats and join date.
- createHoverCardHandle — Connects one HoverCard to triggers rendered elsewhere; pass payload on each trigger.


## When to use the hover card

- Use it as a profile preview popover for @mentions in a comment thread, where hovering a username link shows a profile preview with avatar, bio, stats and join date after a short delay.
- Use it for external links in documentation, with LinkPreview content showing the site, title, description and a 1.91 to 1 image so readers can judge a link before leaving.
- Use it for a link in a table or feed where passing the pointer across should do nothing: the default delay is 500 milliseconds, with a closeDelay of 250, so quick passes stay quiet.
- Skip it when the content is interactive or essential; the card is not reachable by Tab, so Popover fits buttons and forms, and Tooltip fits a short label for an icon.
- Pair it with Avatar and Badge inside ProfilePreview, Link-styled triggers using variant="link", and the page the link opens, where the essential version of the information should live.


## Frequently asked questions

### How do I make a React hover card for a link preview?

Use HoverCard with a HoverCardTrigger, which renders an a element, so pass href, and HoverCardContent holding ProfilePreview or LinkPreview. Place it with side, align and sideOffset. Use padded={false} for edge-to-edge content like a preview image.

### Can keyboard and screen reader users reach the hover card?

Focusing the link opens the card after the delay and Escape closes it, but the card content is not reachable by Tab or read by screen readers. Base UI keeps the link as the one accessible element, so keep essential information on the destination page and avoid buttons inside.

### What happens on touch screens, where there is no hover?

The first tap on the trigger opens the card and a second tap follows the link; a tap outside closes it. The touchHint prop on HoverCardContent sets the line shown after the first tap, and null hides it, for example when the trigger is not a link. Plain triggers get a 44px tap area.

### How do I change the delay or style the trigger?

Set delay (default 500) and closeDelay (default 250) in milliseconds on HoverCardTrigger. variant="link" gives accent underlined text for links in a sentence, and "plain" leaves only the focus ring, suiting avatars and chips. Reduced motion makes the card fade only.


## Related pages

- [Kbd](https://lokendra-builds.github.io/sheenui/overlays/kbd)
- [Menubar](https://lokendra-builds.github.io/sheenui/overlays/menubar)
- [Side drawer](https://lokendra-builds.github.io/sheenui/overlays/side-drawer)
- [Alert dialog](https://lokendra-builds.github.io/sheenui/overlays/alert-dialog)
- [Command palette (⌘K)](https://lokendra-builds.github.io/sheenui/overlays/command-palette)
- [Context menu](https://lokendra-builds.github.io/sheenui/overlays/context-menu)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
