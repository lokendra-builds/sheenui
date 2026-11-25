Canonical: https://lokendra-builds.github.io/sheenui/blocks/chat-app

# React Chat App Template: Full Messenger UI

URL: https://lokendra-builds.github.io/sheenui/blocks/chat-app
Sidebar name: Chat app

A complete React chat app template: chat list and conversation side by side, stacking on narrow screens, with contact info in a side drawer. Tailwind v4.

What it is: A complete React chat app template: the chat list and the open chat side by side, stacking into list then chat on narrow screens.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/chat-app.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > Chat app

Files to copy from `theme/src/`:

- `blocks/chat-app.tsx`
- `components/chat/{chat-thread.tsx, conversation-list.tsx, chat-parts.tsx, composer.tsx, emoji-picker.tsx, emoji.ts, format.ts, hooks.ts, icons.tsx, labels.ts, message-parts.tsx, message-row.tsx, toolbar-store.ts, types.ts}`
- `components/alert-dialog/`
- `components/avatar/`
- `components/button/`
- `components/chat/conversation-list/`
- `components/chat/thread/`
- `components/context-menu/`
- `components/description-list/`
- `components/dialog/`
- `components/drawer/`
- `components/empty-state/`
- `components/file-upload/file-utils.ts`
- `components/input/`
- `components/kbd/`
- `components/menu/`
- `components/popover/`
- `components/segmented/`
- `components/side-drawer/{icons.tsx, side-drawer.tsx}`
- `components/side-drawer/parts/{body.tsx, content.tsx, header.tsx, model.ts, resize.tsx}`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `components/switch/`
- `components/tooltip/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, field-control-shell.tsx, field-size.ts, form.ts, glide-highlight.tsx, heading.ts, ime.ts, initials.ts, math.ts, modal-flag.ts, modal-tab-trap.ts, motion-props.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, uid.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: chat-app. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChatApp } from "@/components/sheenui/blocks/chat-app";
import { type ChatConversation, type ChatConversationAction, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { ChatApp, type ChatConversation, type ChatConversationAction, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| conversations | ChatConversation[] | required | Lists the chats to show (ChatConversation[]). |
| participants | ChatParticipant[] | required | Everyone who appears in the chats, including the current user (ChatParticipant[]). |
| currentUserId | string | required | The id of the signed-in participant: their messages sit on the right. |
| messages | Record<string, ChatMessage[] \| undefined> | required | Messages per chat id, oldest first (load a chat's messages when it is selected). |
| selectedId | string \| null | optional, no default | The open chat (controlled); null shows the list on phones and "Pick a chat" on wide screens. |
| defaultSelectedId | string \| null | null | The chat open at first when selectedId is not controlled (string \| null, default null). |
| onSelectedIdChange | ((conversationId: string \| null) => void) | optional, no default | Called when a chat is opened or closed: keep it in the URL to deep-link a chat. |
| loading | boolean | false | Shows skeleton rows in the conversation list while it loads. |
| hasOlder | ((conversationId: string) => boolean) | optional, no default | Whether a chat has earlier messages to load. |
| loadingOlderId | string \| null | null | The chat whose earlier messages are loading. |
| onLoadOlder | ((conversationId: string) => void) | optional, no default | Load a chat's earlier messages (the thread asks when its top is reached). |
| onSend | ((conversationId: string, draft: ChatDraft) => void) | optional, no default | A message (text, attachments, reply) was sent from the composer. |
| onEdit | ((conversationId: string, messageId: string, text: string) => void) | optional, no default | A sent message's text was edited. |
| onDelete | ((conversationId: string, message: ChatMessage) => void) | optional, no default | A message was deleted. |
| onReact | ((conversationId: string, message: ChatMessage, emoji: string, add: boolean) => void) | optional, no default | A reaction was added (add: true) or removed. |
| onRetry | ((conversationId: string, message: ChatMessage) => void) | optional, no default | "Retry" was pressed on a message that failed to send. |
| onRead | ((conversationId: string) => void) | optional, no default | The newest message of a chat was seen: clear its unread count. |
| onTyping | ((conversationId: string, typing: boolean) => void) | optional, no default | The current user started or stopped typing: send it on to the other side. |
| onDraftChange | ((conversationId: string, text: string) => void) | optional, no default | Store a chat's unsent text (shown as "Draft: …" in the list). Without it, drafts are kept in memory. |
| onConversationAction | ((conversation: ChatConversation, action: ChatConversationAction) => void) | optional, no default | Pin, mute, archive, mark read… (list and info panel). |
| onCall | ((conversation: ChatConversation) => void) | optional, no default | Shows a call button in the chat header. |
| onVideoCall | ((conversation: ChatConversation) => void) | optional, no default | Shows a video-call button in the chat header. |
| onBlock | ((participant: ChatParticipant) => void) | optional, no default | Shows "Block" in a person's info panel. |
| onLeaveGroup | ((conversation: ChatConversation) => void) | optional, no default | Shows "Leave group" in a group's info panel. |
| listProps | Partial<ConversationListProps> | optional, no default | Extra props for the list and the chat view. |
| threadProps | Partial<ChatThreadProps> | optional, no default | Passes extra props to the chat view (Partial<ChatThreadProps>). |
| stackBelow | number | 640 | Container width (px) below which the panes stack (list, then chat). |
| now | Date | the real clock, refreshed every 30 seconds | The current time for "5m" and "last seen" labels. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates (and move it forward yourself after mounting). |
| locale | string | the browser's | Sets the BCP 47 locale for times and dates. |
| labels | Partial<ChatLabels> | defaultChatLabels | Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Classes for the outer element (give it a height). |

## Example: Messenger

Open chats, send messages (replies arrive with typing and read receipts), pin or archive from a row's menu, and open the info panel from a chat's header. Narrow your window (or open this on a phone) to see the stacked layout.

```tsx
import { useState } from "react";
import { ChatApp } from "@/components/sheenui/blocks/chat-app";
import { type ChatConversation, type ChatConversationAction, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ChatApp, type ChatConversation, type ChatConversationAction, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const chats: ChatConversation[];
declare const people: ChatParticipant[];
declare const messagesById: Record<string, ChatMessage[]>;
declare const cursors: Record<string, string | null>;
declare function loadOlder(chatId: string): void;
declare const api: {
  send(chatId: string, draft: ChatDraft): void;
  edit(messageId: string, text: string): void;
  delete(messageId: string): void;
  react(messageId: string, emoji: string, add: boolean): void;
  markRead(chatId: string): void;
  updateChat(chatId: string, action: ChatConversationAction): void;
  block(personId: string): void;
};

export function Example() {
  // Keep the open chat in the URL (?chat=c-riya) so it can be linked to.
  const [chatId, setChatId] = useState<string | undefined>(() => new URLSearchParams(location.search).get("chat") ?? undefined);

  return (
    <ChatApp
      conversations={chats}
      participants={people}
      currentUserId="me"
      messages={messagesById}
      selectedId={chatId}
      onSelectedIdChange={(id) => setChatId(id ?? undefined)}
      hasOlder={(id) => cursors[id] !== null}
      onLoadOlder={(id) => loadOlder(id)}
      onSend={(id, draft) => api.send(id, draft)}
      onEdit={(id, messageId, text) => api.edit(messageId, text)}
      onDelete={(id, message) => api.delete(message.id)}
      onReact={(id, message, emoji, add) => api.react(message.id, emoji, add)}
      onRead={(id) => api.markRead(id)}
      onConversationAction={(chat, action) => api.updateChat(chat.id, action)}
      onBlock={(person) => api.block(person.id)}
      className="h-[44rem]"
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab / Shift + Tab | Moves between the chat list, the open chat and the composer. The list is one tab stop; the search field, filters and message actions are ordinary tab stops. |
| Arrow Up / Arrow Down, Home / End | In the list: move between chats. Type a name to jump to that chat. |
| Enter / Space | In the list: open the focused chat. On a wide layout focus moves to the composer; on a narrow one it moves to the chat's name. |
| Shift + F10 / Menu key | Open a chat's actions (pin, mute, archive, mark read). |
| Arrow Up / Arrow Down, Enter, R, E | In the chat: move between messages, open a message's actions, reply, edit your own message. |
| Enter / Shift + Enter | Composer: send / add a line (on touch keyboards Return adds a line). Arrow Up in an empty composer edits your last message. |
| Escape | Closes the contact or group info drawer and returns focus to the control that opened it. |
| Back button | On a narrow block, returns to the list and puts focus back on the chat's row. |

## Accessibility

- The list and the chat are labeled regions. Focus is managed on every pane change: opening a chat on a phone moves it to the chat's name, going back returns it to the row, and a keyboard open on a wide layout lands in the composer.
- New messages and typing are announced politely (aria-live); message status (sending, sent, delivered, read, failed) is written text, not color alone, and presence is written in words.
- The info panel is a side drawer (a modal dialog with a focus trap); swipe and hover actions all have keyboard and menu equivalents, so nothing is gesture-only.
- Reduced motion makes the pane slide a jump; reduced transparency makes the glass panes solid; the message area never uses blur, so scrolling stays fast.

## When to use the chat app

- Use ChatApp as a messenger UI for a messaging screen in a marketplace or support tool, where a conversation list sits beside the open chat on wide containers and stacks on narrow ones.
- Use it for a team inbox with direct messages and groups, wiring onSend, onEdit, onDelete, onReact and onRetry to your backend while you hold the messages map in state.
- Use it when contact info matters, since opening a chat's info drawer shows avatar, about, phone, email, members, shared photos, and mute and block or leave actions.
- Skip it when you only need a floating help bubble on a marketing page; ChatWidget is lighter, and AiChat fits a person talking to a model rather than to other people.
- Pair it with ConversationList and ChatThread when you want a custom layout from the same parts, and with EmptyState and SideDrawer for screens around the chat.


## Frequently asked questions

### How do I get a React chat app template running with ChatApp?

Pass conversations, participants, currentUserId and a messages map from chat id to message array; all four are required. Give the block a height with className, and handle onSend(conversationId, draft) to store the message. selectedId or defaultSelectedId chooses the open chat.

### When does ChatApp switch from two panes to one?

It stacks below a container width set by stackBelow, 640 by default, measured on the block itself and not the screen. On narrow widths the chat slides over the list with a back button. Reduced motion turns the slide into a jump, and reduced transparency makes the glass solid.

### How is keyboard focus handled when opening and closing chats?

In the list, arrow keys move between chats and Enter opens one. On a wide layout, opening a chat with the keyboard moves focus to the composer; on a phone it moves to the chat name, and going back returns it to the chat's row. Escape closes the info drawer, and Enter sends while Shift plus Enter adds a line.

### Why is the message area not blurred glass?

The list, chat header and composer are glass panes, but the scrolling message area is deliberately not, because blur is kept off scrolling content. Message status such as sent, delivered or failed is shown as text rather than color alone, and new messages and typing are announced politely.


## Related pages

- [Chat list](https://lokendra-builds.github.io/sheenui/chat/list)
- [Chat view](https://lokendra-builds.github.io/sheenui/chat/thread)
- [Popover chat](https://lokendra-builds.github.io/sheenui/chat/widget)
- [Notification center](https://lokendra-builds.github.io/sheenui/blocks/notification-center)
- [Pricing](https://lokendra-builds.github.io/sheenui/blocks/pricing)
- [Settings page](https://lokendra-builds.github.io/sheenui/blocks/settings-page)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
