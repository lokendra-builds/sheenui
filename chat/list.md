Canonical: https://lokendra-builds.github.io/sheenui/chat/list

# Chat List UI for React: Messaging Inbox

URL: https://lokendra-builds.github.io/sheenui/chat/list
Sidebar name: Chat list

A React chat list UI like WhatsApp: search with highlights, tabs with counts, pinned chats, presence, typing, drafts, ticks and unread badges. Glass, MIT.

What it is: A React chat list UI for a messaging app, with search, filters with counts, pinned chats, presence and unread badges.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/chat.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Chat list

Files to copy from `theme/src/`:

- `components/chat/{conversation-list.tsx, types.ts, chat-parts.tsx, emoji.ts, format.ts, hooks.ts, icons.tsx, labels.ts, message-parts.tsx}`
- `components/avatar/`
- `components/chat/conversation-list/`
- `components/context-menu/`
- `components/dialog/`
- `components/drawer/parts/sheet.tsx`
- `components/empty-state/`
- `components/file-upload/file-utils.ts`
- `components/input/`
- `components/kbd/`
- `components/menu/`
- `components/segmented/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, glide-highlight.tsx, heading.ts, initials.ts, modal-flag.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, uid.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: chat. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ConversationList } from "@/components/sheenui/chat/conversation-list";
import { type ChatConversation, type ChatConversationAction, type ChatParticipant } from "@/components/sheenui/chat/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type ChatConversation, type ChatConversationAction, type ChatParticipant, ConversationList } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| conversations | ChatConversation[] | required | The chats to list (any order: pinned first, then newest activity). |
| participants | ChatParticipant[] | required | Everyone who can appear: names, avatars and presence come from here. |
| currentUserId | string | required | Your id (to name direct chats after the other person, and to mark your own last message). |
| selectedId | string \| null | null | The open chat: marked as selected (aria-selected). |
| onSelect | ((conversation: ChatConversation, via: "pointer" \| "keyboard") => void) | optional, no default | A row was opened (click, tap, Enter or Space). via tells keyboard from pointer, to move focus sensibly. |
| onAction | ((conversation: ChatConversation, action: ChatConversationAction) => void) | optional, no default | Pin, mute, archive, mark read… from the ⋯ menu, right-click, long-press or a swipe. Leave out to hide them. |
| filter | ChatListFilter | optional, no default | The active filter: "all", "unread", "groups" or "archived" (controlled). |
| defaultFilter | ChatListFilter | "all" | The filter on mount (uncontrolled). |
| onFilterChange | ((filter: ChatListFilter) => void) | optional, no default | Called with the new filter. |
| query | string | optional, no default | Sets the search text when controlled. |
| defaultQuery | string | "" | The search text on mount (uncontrolled). |
| onQueryChange | ((query: string) => void) | optional, no default | Called with the search text as it changes. |
| loading | boolean | false | Shows skeleton rows while the list loads. |
| title | ReactNode | "Chats" | Heading above the list (defaults to "Chats"); false hides it (it stays the list's name). |
| headingLevel | HeadingLevelOption | 2 | Level of the list's heading. Pass "none" for a paragraph with no heading role (for an example). |
| headerActions | ReactNode | optional, no default | Shows the buttons beside the heading ("New chat"). |
| showSearch | boolean | true | Show the search field. |
| showFilters | boolean | true | Show the All / Unread / Groups / Archived filters. |
| swipeActions | boolean | true | Touch: swipe a row towards the start to reveal Pin / Mute / Archive. |
| emptyAction | ReactNode | optional, no default | Under the "No chats yet" message (a "Start a chat" button). |
| density | "compact" \| "comfortable" | "comfortable" | Sets the row height: 72px comfortable, 64px compact. |
| windowThreshold | number | 150 | Above this many rows, only the visible ones are rendered (smooth with thousands of chats). |
| now | Date | optional, no default | Fixes the current time used for relative dates (for tests and screenshots). |
| locale | string | optional, no default | BCP 47 locale for times. Pass one for prerendered pages. |
| labels | Partial<ChatLabels> | defaultChatLabels | Any UI string (i18n); see ChatLabels (every key is listed below the table). Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## ChatAvatar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| people | ChatParticipant[] | required | One person (direct chat or a sender), or the group's members for a stacked group avatar. |
| src | string | optional, no default | Group photo (wins over the stack). |
| name | string | optional, no default | Group name, for its initials when there is a photo but it fails to load. |
| size | "sm" \| "md" \| "lg" \| "xl" \| "2xl" | "md" | Diameter of the avatar: "sm" 32px, "md" 40px, "lg" 48px, "xl" 56px or "2xl" 80px. |
| presence | ChatPresence | optional, no default | Show this presence dot (direct chats). |
| className | string | optional, no default | Adds extra classes to the avatar. |

## PresenceDot props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| presence | ChatPresence | required | "online", "away" or "offline" (a hollow ring, so the states differ by shape too). |
| size | "sm" \| "md" \| "lg" \| "xl" \| "2xl" | "md" | The avatar size the dot sits on; it scales with it. |
| className | string | optional, no default | Adds extra classes to the dot. |

## UnreadBadge props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| count | number | required | Unread messages. Zero or less renders nothing. |
| muted | boolean | optional, no default | Muted chats get a quiet grey badge. |
| overflow | string | "99+" | Text shown when the count is above 99. |
| label | string | optional, no default | Sets the screen-reader text, e.g. "3 unread messages". |
| className | string | optional, no default | Adds extra classes to the badge. |

## Example 1 of 2: Inbox

Arrow keys move between chats, Enter opens one, typing a name jumps to it and Shift+F10 opens a chat's actions. On a phone, swipe a row to the left. Turn on 1,200 more chats to feel the windowing.

```tsx
import { useState } from "react";
import { ConversationList } from "@/components/sheenui/chat/conversation-list";
import { type ChatConversation, type ChatConversationAction, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ConversationList, type ChatConversation, type ChatConversationAction, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const conversations: ChatConversation[];
declare const people: ChatParticipant[];
declare const api: { updateChat(id: string, action: ChatConversationAction): void };

export function Example() {
  const [openId, setOpenId] = useState<string | undefined>();

  return (
    <ConversationList
      conversations={conversations}
      participants={people}
      currentUserId="me"
      selectedId={openId}
      onSelect={(chat) => setOpenId(chat.id)}
      onAction={(chat, action) => api.updateChat(chat.id, action)} // pin, mute, archive, markRead…
      locale="en-US"
      className="h-[36rem]"
    />
  );
}
```

## Example 2 of 2: Compact, no filters

A narrower sidebar: compact rows, the heading hidden (it still names the list), and German labels with dates from Intl.

```tsx
import { ConversationList } from "@/components/sheenui/chat/conversation-list";
import { type ChatConversation, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ConversationList, type ChatConversation, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const conversations: ChatConversation[];
declare const people: ChatParticipant[];

export function Example() {
  return (
    <ConversationList
      conversations={conversations}
      participants={people}
      currentUserId="me"
      density="compact"
      showFilters={false}
      title={false}
      locale="de-DE"
      labels={{ chats: "Unterhaltungen", search: "Unterhaltungen durchsuchen", searchPlaceholder: "Suchen", youPrefix: "Du:", pinnedSection: "Angeheftet", allSection: "Alle Chats", justNow: "jetzt", typing: () => "schreibt…" }}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The list is one tab stop; the search field and filters are ordinary tab stops. |
| Arrow Up / Arrow Down, Home / End, Page Up / Page Down | Move between chats. |
| Type a name | Jump to that chat. |
| Enter / Space | Open the focused chat. |
| Shift + F10 / Menu key | Open the chat's actions (pin, mute, archive, mark read). |

## Accessibility

- A single-select listbox: aria-selected marks the open chat, and each row reads as name, last message, time, unread count and state.
- Rows say their position (aria-posinset, aria-setsize) even when the list is windowed. Filter and search results are announced politely.
- The swipe and "more" buttons are shortcuts to the same menu, so nothing is gesture-only. Presence is written in words.

## When to use the chat list

- Use it as a messaging inbox UI, the sidebar of a messaging app or customer inbox, with search that filters and highlights, All, Unread, Groups and Archived tabs with counts, and Pinned and All chats sections.
- Use it for a support dashboard with thousands of conversations, since above windowThreshold, 150 rows by default, only the visible rows are rendered while positions are still announced.
- Use onAction for pin, mute, archive and mark as read, which appear in a menu, on right-click and long-press, and as swipe actions on touch screens.
- Skip it for a short list of static links; Vertical nav is simpler, and a Data table fits when users need sortable columns and bulk actions instead of conversation previews.
- Pair it with Chat view for the open conversation, Popover chat for a support widget, and Avatar presence dots, which the rows already use for online, away and offline.


## Frequently asked questions

### How do I build a chat list UI in React with search and filters?

Render ConversationList with conversations, participants and currentUserId, all required. Search and the filter tabs are built in, and each can be controlled through query and filter, or turned off with showSearch and showFilters. Search matches names, members, the last message and drafts, and highlights them.

### How does keyboard navigation work in the list?

The list is one tab stop and behaves as a single-select listbox. Arrow Up and Down, Home, End, Page Up and Page Down move between chats, typing a name jumps to it, Enter or Space opens it, and Shift+F10 or the Menu key opens that chat's actions.

### Are the swipe and row actions gesture-only?

No. The swipe and the more button are shortcuts to the same menu, so nothing depends on a gesture. Provide onAction to enable the menu, right-click and swipe; leave it out and they are hidden. Set swipeActions to false to disable swipe on touch screens.

### How do I handle translation, time and loading?

locale controls dates, times and numbers through Intl, labels holds every string, and now freezes the clock for tests and screenshots. Set loading for skeleton rows announced once as Loading chats. density is comfortable, 72px rows, or compact, 64px, and title can be false to hide the heading.


## Related pages

- [Chat view](https://lokendra-builds.github.io/sheenui/chat/thread)
- [Popover chat](https://lokendra-builds.github.io/sheenui/chat/widget)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
