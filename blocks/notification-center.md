Canonical: https://lokendra-builds.github.io/sheenui/blocks/notification-center

# Notification Center for React: Glass Inbox

URL: https://lokendra-builds.github.io/sheenui/blocks/notification-center
Sidebar name: Notification center

A React notification center: a bell with a live unread count, a glass inbox with tabs, day groups, inline actions, mark read and swipe to dismiss. MIT.

What it is: A React notification center: a bell with a live unread count that opens a glass inbox with tabs, day groups and inline actions.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/notification-center.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Notification center

Files to copy from `theme/src/`:

- `blocks/notification-center.tsx`
- `components/avatar/`
- `components/button/`
- `components/empty-state/`
- `components/kbd/`
- `components/spinner/`
- `components/tabs/`
- `components/tooltip/`
- `blocks/notification-center/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, tokens.ts}`
- `lib/{cn.ts, form.ts, heading.ts, initials.ts, popup-motion.ts, state-light.tsx, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: notification-center. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { NotificationCenter, NotificationPanel } from "@/components/sheenui/blocks/notification-center";
import { type NotificationItem } from "@/components/sheenui/blocks/notification-center/model";
import { Button } from "@/components/sheenui/button/button";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { Button, NotificationCenter, type NotificationItem, NotificationPanel } from "@sheenui/theme";
```

## NotificationCenter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| notifications | NotificationItem[] | optional, no default | The notifications to show, when you control the list yourself (pair it with the change callbacks). |
| defaultNotifications | NotificationItem[] | optional, no default | Sets the starting list when uncontrolled. |
| onNotificationsChange | ((next: NotificationItem[]) => void) | optional, no default | Called with the whole new list after any change (read, unread, dismiss, undo). |
| onSelect | ((item: NotificationItem) => void) | optional, no default | Called when a notification is opened (it is marked as read first). |
| onDismiss | ((item: NotificationItem) => void) | optional, no default | Called as soon as a notification is dismissed (button, Delete key or swipe). Undo can still bring it back: see onRestore. |
| onRestore | ((item: NotificationItem) => void) | optional, no default | Called when Undo brings a dismissed notification back. |
| onDismissCommit | ((item: NotificationItem) => void) | optional, no default | Called once a dismissal can no longer be undone: the undo bar timed out, another notification was dismissed, or the inbox closed. Delete it on your server here. |
| viewAllHref | string | optional, no default | Shows a "View all notifications" link at the bottom. |
| headerActions | ReactNode | optional, no default | Extra controls in the header, after "Mark all as read" (e.g. a settings link). |
| defaultTab | NotificationTab | "all" | The tab that is selected when the panel first renders. |
| now | Date | the real clock, refreshed every 30 seconds | The current time for "5m ago" and the day groups. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates. |
| locale | string | the browser's | Sets the BCP 47 locale for day headings and times. |
| labels | Partial<NotificationCenterLabels> | defaultNotificationCenterLabels | Every other string, for translation: labels={{ trigger: "…" }}; omitted keys keep the English of defaultNotificationCenterLabels. All 30 keys of NotificationCenterLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Heading level of the panel title (2 \| 3 \| 4, default 2); day groups sit one level below. "none" renders paragraphs with no heading role (for an example). |
| open | boolean | optional, no default | Whether the panel is open (controlled). |
| defaultOpen | boolean | false | Whether the panel is open at first when open is not controlled (boolean, default false). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called when the panel opens or closes. |
| side | "top" \| "bottom" \| "left" \| "right" | "bottom" | Which side of the bell the panel opens on ("top" \| "bottom" \| "left" \| "right", default "bottom"). |
| align | "center" \| "end" \| "start" | "end" | Sets the alignment against the bell ("start" \| "center" \| "end", default "end"). |
| max | number | 99 | Counts above this show as "99+" (number, default 99). |
| className | string | optional, no default | Classes for the bell button (the outer element; the panel is portaled). |
| panelClassName | string | optional, no default | Adds extra classes to the glass panel. |

## NotificationItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | optional, no default | Stable identifier of the notification, used as the React key and in callbacks. |
| title | ReactNode | optional, no default | The sentence; wrap names in <b>. Also the row’s accessible name. |
| time | Date \| string \| number | optional, no default | When it happened. An unreadable value never breaks the inbox: the item is listed last, under “Undated”. |
| actor | { name, avatar? } | optional, no default | Shown as an avatar (initials without an image). Leave out for system notices. |
| kind | "mention" \| "comment" \| "reaction" \| "invite" \| "assign" \| "system" \| "success" \| "warning" | optional, no default | Badge on the avatar, or the icon of a system notice. |
| description | ReactNode | optional, no default | A quote or detail, clamped to two lines. |
| read | boolean | false | Read rows lose the dot and tint. |
| mention | boolean | kind === "mention" | Lists the notification under the Mentions tab. |
| href | string | optional, no default | Opening the row follows this link. |
| actions | ReactNode | optional, no default | Buttons under the text (Accept / Decline …). |

## NotificationPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| notifications | NotificationItem[] | optional, no default | The notifications to show, when you control the list yourself (pair it with the change callbacks). |
| defaultNotifications | NotificationItem[] | optional, no default | Sets the starting list when uncontrolled. |
| onNotificationsChange | ((next: NotificationItem[]) => void) | optional, no default | Called with the whole new list after any change (read, unread, dismiss, undo). |
| onSelect | ((item: NotificationItem) => void) | optional, no default | Called when a notification is opened (it is marked as read first). |
| onDismiss | ((item: NotificationItem) => void) | optional, no default | Called as soon as a notification is dismissed (button, Delete key or swipe). Undo can still bring it back: see onRestore. |
| onRestore | ((item: NotificationItem) => void) | optional, no default | Called when Undo brings a dismissed notification back. |
| onDismissCommit | ((item: NotificationItem) => void) | optional, no default | Called once a dismissal can no longer be undone: the undo bar timed out, another notification was dismissed, or the inbox closed. Delete it on your server here. |
| viewAllHref | string | optional, no default | Shows a "View all notifications" link at the bottom. |
| headerActions | ReactNode | optional, no default | Extra controls in the header, after "Mark all as read" (e.g. a settings link). |
| defaultTab | NotificationTab | "all" | The tab that is selected when the panel first renders. |
| now | Date | the real clock, refreshed every 30 seconds | The current time for "5m ago" and the day groups. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates. |
| locale | string | the browser's | Sets the BCP 47 locale for day headings and times. |
| labels | Partial<NotificationCenterLabels> | defaultNotificationCenterLabels | Every other string, for translation: labels={{ trigger: "…" }}; omitted keys keep the English of defaultNotificationCenterLabels. All 30 keys of NotificationCenterLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 2 | Heading level of the panel title (2 \| 3 \| 4, default 2); day groups sit one level below. "none" renders paragraphs with no heading role (for an example). |
| className | string | 32rem | Classes for the glass card (set its height here; it defaults to 32rem). |

## Example 1 of 3: Bell and inbox

Open the bell, then try “Simulate a notification”: the bell rings, the count pops and the new row glows once. Hover a row for its actions, accept the invite, or press Delete on a focused row (Undo or ⌘Z / Ctrl+Z brings it back). On a phone the inbox opens as a sheet from the bottom of the screen.

```tsx
import { useState } from "react";

import { NotificationCenter } from "@/components/sheenui/blocks/notification-center";
import { type NotificationItem } from "@/components/sheenui/blocks/notification-center/model";
// Package build (after the first npm release, or a packed tarball): import { NotificationCenter, type NotificationItem } from "@sheenui/theme";

const router = { push: (to: string) => window.location.assign(to) };

const api = {
  deleteNotification: (id: string) => fetch("/api/notifications/" + id, { method: "DELETE" }),
};

export function Example() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: "n1",
      kind: "mention",
      actor: { name: "Ada Lovelace", avatar: "/ada.jpg" },
      title: <><b>Ada Lovelace</b> mentioned you in <b>Q3 roadmap</b></>,
      description: "“@you could you sanity-check the contrast numbers?”",
      time: "2026-10-30T09:41:00Z",
      href: "#demo-q3-roadmap-c12",
    },
    // …
  ]);

  return (
    <NotificationCenter
      notifications={items}
      onNotificationsChange={setItems}
      onSelect={(n) => {
        if (n.href) router.push(n.href);
      }}
      // Delete on the server once Undo is no longer possible.
      onDismissCommit={(n) => api.deleteNotification(n.id)}
      viewAllHref="/notifications"
    />
  );
}
```

## Example 2 of 3: Inline panel

NotificationPanel is the same inbox without the bell, as a glass card for a notifications page, a drawer or a dashboard column. Add your own header controls next to “Mark all as read”.

```tsx
import { NotificationPanel } from "@/components/sheenui/blocks/notification-center";
import { type NotificationItem } from "@/components/sheenui/blocks/notification-center/model";
import { Button } from "@/components/sheenui/button/button";
// Package build (after the first npm release, or a packed tarball): import { NotificationPanel, Button, type NotificationItem } from "@sheenui/theme";

const items: NotificationItem[] = [
  {
    id: "n1",
    kind: "mention",
    actor: { name: "Ada Lovelace" },
    title: <><b>Ada Lovelace</b> mentioned you in <b>Q3 roadmap</b></>,
    description: "“@you could you sanity-check the contrast numbers?”",
    time: "2026-10-30T09:41:00Z",
  },
  { id: "n2", kind: "success", title: "Deploy finished", time: "2026-10-30T08:12:00Z", read: true },
];

export function Example() {
  return (
    <NotificationPanel
      defaultNotifications={items}
      defaultTab="unread"
      viewAllHref="/notifications"
      headerActions={
        <Button variant="ghost" size="icon" aria-label="Notification settings" render={<a href="#demo-settings-notifications" />}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          </svg>
        </Button>
      }
      className="h-[30rem]"
    />
  );
}
```

## Example 3 of 3: Any language

Every string is a label, and day headings and times come from Intl for the locale: Heute, Gestern, then weekdays. Mark everything read on the Ungelesen tab to reach the empty state.

```tsx
import { NotificationPanel } from "@/components/sheenui/blocks/notification-center";
import { type NotificationItem } from "@/components/sheenui/blocks/notification-center/model";
// Package build (after the first npm release, or a packed tarball): import { NotificationPanel, type NotificationItem } from "@sheenui/theme";

const items: NotificationItem[] = [
  {
    id: "n1",
    kind: "mention",
    actor: { name: "Ada Lovelace" },
    title: <><b>Ada Lovelace</b> hat Sie in <b>Q3-Fahrplan</b> erwähnt</>,
    description: "“@you kannst du die Kontrastwerte prüfen?”",
    time: "2026-10-30T09:41:00Z",
  },
  { id: "n2", kind: "success", title: "Deployment abgeschlossen", time: "2026-10-30T08:12:00Z", read: true },
];

export function Example() {
  return (
    <NotificationPanel
      defaultNotifications={items}
      locale="de-DE"
      labels={{
        title: "Mitteilungen",
        markAllRead: "Alle gelesen",
        all: "Alle", unread: "Ungelesen", mentions: "Erwähnungen",
        today: "Heute", yesterday: "Gestern",
        emptyUnreadTitle: "Alles erledigt",
        // …every other string
      }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space on the bell | Open the panel. |
| Escape | Close the panel and return focus to the bell. |
| Tab | Enter the tabs, then the list. |
| ↑ / ↓ | Previous / next notification. |
| Home / End | First / last notification. |
| Enter | Open the notification (it is marked read first). |
| Delete | Dismiss it; focus moves on. |
| Ctrl / Cmd + Z | Undo the dismissal. |

## Accessibility

- The bell is named “Notifications, 3 unread” and the count is text; the panel is a labeled popover.
- Dismissals (with the undo shortcut), arrivals and “all read” are announced politely.
- Swipe-to-dismiss on touch always has the dismiss button as an alternative.

## All exports on this page

- NotificationCenter — Props (see NotificationCenterProps): the shared inbox props (notifications / defaultNotifications / onNotificationsChange, onSelect, onDismiss, onRestore, onDismissCommit, viewAllHref, headerActions, defaultTab ("all"), now, locale, labels, headingLevel (2)) plus open / defaultOpen (false) / onOpenChange, side ("bottom"), align ("end"), max (99), className (the bell) and panelClassName.
- NotificationPanel — The inbox as an inline glass card (no bell): for a page, a drawer or a dashboard column.
- defaultNotificationCenterLabels — The English NotificationCenterLabels used when labels is omitted; a partial labels prop is merged over them.
- defaultNotificationLabels — The former name of defaultNotificationCenterLabels, kept as an alias for one release.


## When to use the notification center

- Use NotificationCenter as a notification dropdown for the bell in an app header, where an unread count badge opens a popover inbox with All, Unread and Mentions tabs and, with viewAllHref, a link to view everything.
- Use NotificationPanel for a dashboard column or a drawer that shows the inbox inline, giving it a height with className because it defaults to 32rem.
- Use it when dismissals need a safety net, since Delete removes a notification, an undo bar appears, and Ctrl or Cmd plus Z restores it.
- Skip it when you only need a brief confirmation such as "Saved"; a Toast fits transient messages better than a persistent inbox with read state and tabs.
- Pair it with Avatar for sender images, Tooltip for the header actions, and KbdShortcut to teach the undo shortcut, passing items through notifications or defaultNotifications.


## Frequently asked questions

### How do I build a notification center in React with this block?

Render NotificationCenter with defaultNotifications, or notifications plus onNotificationsChange for controlled state. Handle onSelect for opening an item and onDismiss for removal. Use NotificationPanel instead when you want the same inbox inline without the bell. Each item needs an id, title and time; kind, actor and description are optional.

### What does the bell announce to screen readers?

The bell button is named something like "Notifications, 3 unread", and the count is real text. The count caps at max, which defaults to 99. Arrivals, dismissals, the undo shortcut and "all read" are announced politely, and the panel itself is a labeled popover that returns focus on Escape.

### Which keys work inside the notification list?

Tab enters the tabs and then the list. Up, Down, Home and End move between notifications, Enter opens one, and Delete dismisses it while focus moves on. Ctrl or Cmd plus Z undoes a dismissal. Swipe-to-dismiss on touch always has a dismiss button as an alternative.

### Can I control where the popover opens and whether it is open?

Yes. Use open, defaultOpen and onOpenChange for control, side (default bottom) and align (default end) for placement, and panelClassName to style the portaled glass card. The bell rings when something new arrives, except when the visitor prefers reduced motion.


## Related pages

- [Toast](https://lokendra-builds.github.io/sheenui/components/toast)
- [Badge](https://lokendra-builds.github.io/sheenui/components/badge)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)
- [Settings page](https://lokendra-builds.github.io/sheenui/blocks/settings-page)
- [Hero section](https://lokendra-builds.github.io/sheenui/blocks/hero-section)
- [Feature grid](https://lokendra-builds.github.io/sheenui/blocks/feature-grid)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
