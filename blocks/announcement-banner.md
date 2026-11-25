Canonical: https://lokendra-builds.github.io/sheenui/blocks/announcement-banner

# React Announcement Banner: Dismissible Glass Bar

URL: https://lokendra-builds.github.io/sheenui/blocks/announcement-banner
Sidebar name: Announcement banner

A React announcement banner on glass with a tone, a link and a dismiss button that reports the dismissal through a callback. Stores nothing. MIT.

What it is: AnnouncementBanner is a React announcement banner: a dismissible top bar on glass with a tone, an optional link and static copy. It stores nothing and reports the dismissal through onDismiss so you can remember it.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/announcement-banner.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Announcement banner

Files to copy from `theme/src/`:

- `blocks/announcement-banner.tsx`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{presets.ts, tokens.ts}`
- `lib/{cn.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add clsx motion tailwind-merge
```

Registry item: announcement-banner. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { AnnouncementBanner, type AnnouncementTone } from "@/components/sheenui/blocks/announcement-banner";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AnnouncementBanner, type AnnouncementTone } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | required | The announcement text (ReactNode). Keep it to a sentence; it is static copy, not a live countdown. |
| tone | AnnouncementTone | "accent" | The semantic colour and icon ("accent" \| "info" \| "success" \| "warning" \| "danger" \| "neutral"). The words carry the meaning; the colour only lights the edge. |
| link | AnnouncementLink | optional, no default | A link after the text (AnnouncementLink). |
| icon | ReactNode | optional, no default | Replaces the tone's icon (ReactNode); it is aria-hidden. Pass null for none. |
| dismissible | boolean | true | Show the dismiss button (boolean). |
| open | boolean | optional, no default | Controls whether the banner is shown (boolean). Use with onOpenChange; leave it out to let the block keep the state. |
| defaultOpen | boolean | true | Whether the banner is shown at first when uncontrolled (boolean). Pass false when you have already stored that this visitor dismissed it. |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called whenever the banner is shown or hidden ((open: boolean) => void). |
| onDismiss | (() => void) | optional, no default | Called once when the visitor presses dismiss (() => void). The block stores nothing: save the choice here (a cookie, localStorage, your account settings) and pass defaultOpen={false} next time. |
| restoreFocusTo | RefObject<HTMLElement \| null> | optional, no default | Where focus goes when the banner is dismissed (RefObject<HTMLElement \| null>). Without it, focus moves to the next focusable element after the banner, or to the <main> landmark when there is none. |
| labels | Partial<AnnouncementBannerLabels> | defaultAnnouncementBannerLabels | Every other string, for translation: labels={{ region: "…" }}; omitted keys keep the English of defaultAnnouncementBannerLabels. All 3 keys of AnnouncementBannerLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the banner (string). |

## Example 1 of 2: Remember the dismissal yourself

Controlled with open and onOpenChange; onDismiss fires once when the visitor presses the button, which is where you save it (a cookie, localStorage or an account setting) and pass defaultOpen={false} next time.

```tsx
import { useState } from "react";
import { AnnouncementBanner } from "@/components/sheenui/blocks/announcement-banner";
// Package build (after the first npm release, or a packed tarball): import { AnnouncementBanner } from "@sheenui/theme";

// Your own storage: the banner only reports the dismissal.
const remember = () => window.localStorage.setItem("banner-v2", "dismissed");

export function Example() {
  const [open, setOpen] = useState(true);
  return (
    <AnnouncementBanner
      open={open}
      onOpenChange={setOpen}
      onDismiss={remember}
      link={{ label: "Read the notes", href: "/changelog" }}
    >
      Version 2 is out: new blocks and a faster build.
    </AnnouncementBanner>
  );
}
```

## Example 2 of 2: Tones

The words carry the meaning; the tone only lights the edge and picks the icon. Set dismissible={false} for a notice that must stay.

```tsx
import { AnnouncementBanner, type AnnouncementTone } from "@/components/sheenui/blocks/announcement-banner";
// Package build (after the first npm release, or a packed tarball): import { AnnouncementBanner, type AnnouncementTone } from "@sheenui/theme";

const tones: AnnouncementTone[] = ["accent", "info", "success", "warning", "danger", "neutral"];

export function Example() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tones.map((tone) => (
        <AnnouncementBanner key={tone} tone={tone} dismissible={tone === "accent"}>
          This is a {tone} announcement.
        </AnnouncementBanner>
      ))}
    </div>
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The link, then the dismiss button. |
| Enter / Space on dismiss | Dismiss the banner and call onDismiss. |

## Accessibility

- A labelled group (labels.region), not a landmark and deliberately not a live region, so it is not read out on every page load. Dismissing moves focus on and announces it politely.
- Tone is never the only signal: the text says it and the icon is aria-hidden. Keep the copy static; a live countdown would be a moving target for assistive tech.
- The dismiss button has an accessible name and a 44 px target. The banner stores nothing, so there is no hidden persistence to explain.
- It slides up by transform and fades on its own surface, faster on the way out. Reduced motion: a short fade.

## All exports on this page

- AnnouncementBanner — A dismissible announcement bar for the top of a page: one sentence, an optional link and a close button.
- defaultAnnouncementBannerLabels — The English AnnouncementBannerLabels used when labels is omitted; a partial labels prop is merged over it.


## When to use the announcement banner

- Use AnnouncementBanner above the navbar for a release, a maintenance window or a promotion, with one sentence and a link to the details.
- Use onDismiss to save the choice in your own storage (a cookie, localStorage or an account setting) and pass defaultOpen={false} on the next visit, so the component itself never touches storage.
- Use tone to pick the icon and light the edge: accent, info, success, warning, danger or neutral; the wording always says what it means, so colour is never the only signal.
- Skip live countdowns and rotating text inside it; a moving banner is hard to read with assistive technology, and the component is designed for static copy.
- Pair it with HeroSection and Navbar below it, and use dismissible={false} for a notice that must stay visible, such as a legal change.


## Frequently asked questions

### How do I build a dismissible announcement banner in React?

Render AnnouncementBanner with your sentence as children, an optional link={{ label, href }}, and onDismiss to remember the choice. Control it with open and onOpenChange if the parent needs to show it again. Pass defaultOpen={false} when you already know the visitor dismissed it.

### Where does the banner store the dismissal?

Nowhere. It keeps no cookie or localStorage entry. It calls onDismiss once when the visitor presses the button, and you save the choice wherever suits your app. That keeps the block free of hidden persistence and consent questions.

### Is the banner announced to screen readers?

It is a labelled region landmark, deliberately not a live region, so it is not read out on every page load. The dismiss button has an accessible name and a 44 px target, and the tone icon is aria-hidden because the text carries the meaning.

### How does it animate?

It slides down by transform and fades in on its own glass surface, then slides up and fades faster on the way out with no overshoot. With reduced motion it only fades for a short time.


## Related pages

- [Alert](https://lokendra-builds.github.io/sheenui/components/alert)
- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Glass login](https://lokendra-builds.github.io/sheenui/blocks/glass-login)
- [Lamp login](https://lokendra-builds.github.io/sheenui/blocks/lamp-login)
- [OTP verification](https://lokendra-builds.github.io/sheenui/blocks/otp-verification)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
