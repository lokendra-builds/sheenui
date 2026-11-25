Canonical: https://lokendra-builds.github.io/sheenui/chat/thread

# React Chat UI: Message Bubbles & Threads

URL: https://lokendra-builds.github.io/sheenui/chat/thread
Sidebar name: Chat view

A React chat UI in WhatsApp and iMessage style: grouped bubbles, day labels, replies, reactions, photos, files, link previews and typing. Glass, MIT.

What it is: A React chat UI for one conversation: bubbles grouped by sender, sticky day labels, replies, reactions, photos and typing.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/chat.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Chat view

Files to copy from `theme/src/`:

- `components/chat/{chat-thread.tsx, composer.tsx, message-row.tsx, chat-parts.tsx, emoji-picker.tsx, emoji.ts, format.ts, hooks.ts, icons.tsx, labels.ts, message-parts.tsx, toolbar-store.ts, types.ts}`
- `components/alert-dialog/`
- `components/avatar/`
- `components/button/`
- `components/chat/thread/`
- `components/context-menu/`
- `components/description-list/`
- `components/dialog/`
- `components/drawer/`
- `components/file-upload/file-utils.ts`
- `components/input/`
- `components/kbd/`
- `components/menu/`
- `components/popover/`
- `components/skeleton/`
- `components/spinner/`
- `components/status-icons/`
- `components/tooltip/`
- `hooks/{use-controllable.ts, use-direction.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts}`
- `motion/{gate.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, glide-highlight.tsx, heading.ts, ime.ts, initials.ts, modal-flag.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, uid.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: chat. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { ChatThread } from "@/components/sheenui/chat/chat-thread";
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant, ChatThread } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| conversation | ChatConversation | required | The conversation being shown (kind, title, members). |
| messages | ChatMessage[] | required | The messages of the conversation, oldest first: the thread shows them in this order, newest at the bottom. |
| participants | ChatParticipant[] | required | Everyone who can appear in the chat (names, avatars, presence). |
| currentUserId | string | required | Your id: your messages sit on the right (left in RTL) in the accent colour. |
| onSend | ((draft: ChatDraft) => void) | optional, no default | The composer sent a message. Add it to messages at once with status "sending" (optimistic), then update it. |
| onEdit | ((messageId: string, text: string) => void) | optional, no default | Called when you save an edit of your message. |
| onDelete | ((message: ChatMessage) => void) | optional, no default | You confirmed deleting your message. Keep it with deleted: true (it shows a placeholder). |
| onReact | ((message: ChatMessage, emoji: string, add: boolean) => void) | optional, no default | Add (add true) or remove your reaction. |
| onRetry | ((message: ChatMessage) => void) | optional, no default | "Retry" on a message whose status is "failed". |
| onLoadOlder | (() => void) | optional, no default | The reader reached the top: load earlier messages and prepend them (the scroll position is kept). |
| hasOlder | boolean | false | There are earlier messages to load. |
| loadingOlder | boolean | false | Earlier messages are loading: skeleton bubbles show at the top. |
| onRead | ((lastMessageId: string) => void) | optional, no default | The newest message was seen (the reader is at the bottom): mark the chat read. |
| onTyping | ((typing: boolean) => void) | optional, no default | Called with true when you start typing and false when you stop. |
| firstUnreadId | string \| null | optional, no default | Show a "New messages" line above this message (the first unread one when the chat opened). |
| showHeader | boolean | true | Show the header (avatar, name, presence, call buttons). |
| onBack | (() => void) | optional, no default | Shows a back button in the header (phones: back to the chat list). |
| onCall | (() => void) | optional, no default | Shows a call button in the header. |
| onVideoCall | (() => void) | optional, no default | Shows a video-call button in the header. |
| onInfo | (() => void) | optional, no default | Shows an info button (opens contact or group info). |
| headerActions | ReactNode | optional, no default | Extra buttons at the end of the header. |
| headingLevel | HeadingLevelOption | 2 | Level of the chat's name (2 \| 3), or "none" for a paragraph with no heading role (for an example). |
| headingRef | Ref<HTMLHeadingElement> | optional, no default | The heading element (to move focus to it, e.g. after opening the chat on a phone). |
| showComposer | boolean | true | Shows the message composer below the thread. |
| draft | string | optional, no default | The unsent text (controlled), e.g. a draft per chat. |
| onDraftChange | ((text: string) => void) | optional, no default | Called with the unsent text as it changes. |
| quickReplies | string[] | optional, no default | Chips that send a ready-made reply (support chats). |
| quickReactions | readonly string[] | defaultQuickReactions | The reactions offered as one-tap choices on a message. |
| allowAttachments | boolean | true | Let people attach files and photos. |
| accept | string | optional, no default | The accept attribute of the file picker, e.g. "image/*,.pdf". |
| composerRef | Ref<ChatComposerHandle> | optional, no default | Receives the ref to the composer's handle (focus(), setText()...). |
| autoFocus | boolean | false | Focus the composer on mount. |
| density | "compact" \| "comfortable" | "comfortable" | "compact": smaller type and spacing (the chat widget). |
| surface | "glass" \| "none" | "glass" | "glass": its own glass panel. "none": no surface (inside ChatApp or your own card). |
| emptyState | ReactNode | optional, no default | Shown instead of the log when there are no messages. |
| now | Date | optional, no default | Fixes the current time used for relative dates (for tests and screenshots). |
| locale | string | optional, no default | BCP 47 locale for times and day labels. Pass one for prerendered pages. |
| labels | Partial<ChatLabels> | defaultChatLabels | Any UI string (i18n); see ChatLabels (every key is listed below the table). Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the outer element. |

## ChatComposer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onSend | (draft: ChatDraft) => void | required | Called with the text, picked files and the quoted message. Hand-over: image preview URLs now belong to you (revoke them when the message goes). |
| value | string | optional, no default | The draft text (controlled). Keep a draft per conversation by storing it per id. |
| defaultValue | string | "" | The draft text on mount (uncontrolled). |
| onValueChange | ((text: string) => void) | optional, no default | Called with the text as it changes. |
| replyTo | ChatReplyRef \| null | optional, no default | The message being replied to: shows a bar above the field with a cancel button. |
| onCancelReply | (() => void) | optional, no default | Called when the reply bar's cancel button is pressed. |
| editing | ChatComposerEditing \| null | optional, no default | Edit mode: the field holds this message's text; Enter saves, Escape cancels. |
| onSaveEdit | ((id: string, text: string) => void) | optional, no default | Called with the message id and new text when an edit is saved. |
| onCancelEdit | (() => void) | optional, no default | Called when an edit is cancelled. |
| onEditLast | (() => void) | optional, no default | ↑ in an empty field: start editing your last message. |
| onTyping | ((typing: boolean) => void) | optional, no default | true while the person types, false after 4s of quiet, on send and on blur. |
| nameOf | ((participantId: string) => string) | optional, no default | Name of a sender, for the reply bar. |
| title | string | optional, no default | The conversation's name, for the placeholder ("Message Riya"). |
| placeholder | string | "Message {title}" | Sets the placeholder text. |
| allowAttachments | boolean | true | Show the attach button and accept pasted or dropped files. |
| accept | string | optional, no default | File types the picker offers (input accept). |
| maxAttachments | number | 10 | Maximum number of files a person can attach to one message. |
| quickReplies | string[] | optional, no default | Text tapped to send at once (support chats): shown as chips above the field. |
| maxRows | number | 6 | Tallest the field grows before it scrolls, in lines. |
| disabled | boolean | false | Disable the field and every button. |
| autoFocus | boolean | false | Focus the field on mount. |
| density | "compact" \| "comfortable" | "comfortable" | Sets the row density: "compact" uses tighter padding (the chat widget). |
| locale | string | the browser's | BCP 47 locale for file sizes. |
| labels | Partial<ChatLabels> | defaultChatLabels | Any UI string (i18n); see ChatLabels (every key is listed below the table). Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the composer. |

## DeliveryStatus props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| status | ChatMessageStatus | required | "sending", "sent", "delivered", "read" or "failed". |
| labels | Pick<ChatLabels, "status"> | defaultChatLabels | The chat labels; only status (the spoken text per state) is used. Spread defaultChatLabels and override single keys, e.g. labels={{ ...defaultChatLabels, status: "…" }}. Its only key is listed in the key table under the props table. |
| variant | "list" \| "bubble" | "list" | "bubble": on the accent fill of your own bubble. "list": on glass. |
| tone | "list" \| "bubble" | undefined | Old name of variant (it is a visual form, not a semantic colour). Still honoured; variant wins. |
| spoken | boolean | true | Say the state to screen readers here (off when you say it elsewhere, e.g. after the text). |
| className | string | optional, no default | Adds extra classes to the icon wrapper. |

## EmojiPicker props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| onSelect | (emoji: string) => void | required | Called with the emoji character. |
| categories | ChatEmojiCategory[] | defaultEmojiCategories | The emoji to offer, by category (defaults to a curated ~170). |
| frequent | readonly string[] | optional, no default | Emoji shown first under "Frequently used" (e.g. the quick reactions). |
| selected | readonly string[] | [] | Emoji to mark as chosen (your current reactions): aria-pressed + a tint. |
| autoFocusSearch | boolean | false | Focus the search field when it mounts (off on touch screens, where it would raise the keyboard). |
| labels | Partial<ChatLabels> | defaultChatLabels | Any UI string (i18n); see ChatLabels (every key is listed below the table). Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Adds extra classes to the picker. |

## ImageLightbox props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| images | ChatAttachment[] | required | Takes the photos to page through. |
| index | number \| null | 0 | The open photo's index, or null when closed (controlled). |
| onIndexChange | (index: number \| null) => void | required | Called with the new index when the person pages, or null to close. |
| labels | ChatLabels | defaultChatLabels | Translated text for the viewer: its dialog name, the "2 of 5" position, the previous/next buttons and download. Spread defaultChatLabels and override single keys, e.g. labels={{ ...defaultChatLabels, you: "…" }}. All 140 keys of ChatLabels are listed in the key table under the props table. |
| caption | ReactNode | optional, no default | Line under the photo, e.g. "Riya Sharma · Yesterday, 18:40". |
| finalFocus | (() => HTMLElement \| null \| undefined) | what had focus before | Where focus goes on close (defaults to what had focus before; pass the photo that opened it, since Safari doesn't focus tapped buttons). |

## Example 1 of 2: Direct chat

Send a message and watch the ticks: sending, sent, delivered, read; then Riya types and replies. Your third message fails: retry it. Hover a message for the toolbar, right-click (or long-press) for every action, or use the keyboard: ↑ ↓ between messages, Enter for actions, R to reply, E to edit. ↑ in an empty composer edits your last message.

```tsx
import { ChatThread } from "@/components/sheenui/chat/chat-thread";
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ChatThread, type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const chat: ChatConversation;
declare const people: ChatParticipant[];
declare const messages: ChatMessage[];
declare const firstUnreadId: string | undefined;
declare const hasOlder: boolean;
declare const loading: boolean;
declare function loadOlder(): void;
declare function startCall(): void;
declare function startVideo(): void;
declare function openContact(): void;
declare const api: {
  send(chatId: string, draft: ChatDraft): void;
  edit(id: string, text: string): void;
  delete(id: string): void;
  react(id: string, emoji: string, add: boolean): void;
  retry(id: string): void;
  markRead(chatId: string, lastId: string): void;
};

export function Example() {
  return (
    <ChatThread
      conversation={chat}
      messages={messages}
      participants={people}
      currentUserId="me"
      firstUnreadId={firstUnreadId}
      hasOlder={hasOlder}
      loadingOlder={loading}
      onLoadOlder={loadOlder}
      onSend={(draft) => api.send(chat.id, draft)} // add it with status "sending", then update it
      onEdit={(id, text) => api.edit(id, text)}
      onDelete={(message) => api.delete(message.id)}
      onReact={(message, emoji, add) => api.react(message.id, emoji, add)}
      onRetry={(message) => api.retry(message.id)}
      onRead={(lastId) => api.markRead(chat.id, lastId)}
      onCall={startCall}
      onVideoCall={startVideo}
      onInfo={openContact}
      className="h-[40rem]"
    />
  );
}
```

## Example 2 of 2: Group chat

Sender names and avatars on the first message of each run, system notes, a four-photo grid with “+2”, and reactions from several people.

```tsx
import { ChatThread } from "@/components/sheenui/chat/chat-thread";
import { type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ChatThread, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const messages: ChatMessage[];
declare const people: ChatParticipant[];
declare function send(draft: ChatDraft): void;
declare function react(message: ChatMessage, emoji: string, add: boolean): void;

export function Example() {
  return (
    <ChatThread
      conversation={{ id: "design", kind: "group", title: "Design Crew 🎨", participantIds: ["me", "riya", "mei", "arjun"] }}
      messages={messages}
      participants={people}
      currentUserId="me"
      onSend={send}
      onReact={react}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Tab | The message list is one tab stop on the active row; the composer and header buttons are ordinary tab stops. |
| Arrow Up / Arrow Down, Home / End, Page Up / Page Down | Move between messages. |
| Enter / Space | Open the message's actions menu. |
| R / E | Reply to, or edit (your own), the focused message. |
| Enter / Shift + Enter | Composer: send / add a line (on touch keyboards Return adds a line). |
| Arrow Up in an empty composer | Edit your last message. |
| Escape | Cancel a reply or an edit. |

## Accessibility

- Each row is an article named by a spoken summary (sender, text, time, delivery state); the header names the chat and presence is written in words.
- Delivery state, reactions and typing are spoken in a polite live region; the "Jump to latest" button and composer controls have names.
- Targets are 44 px on touch screens, text is 16 px so iOS does not zoom, and forced colors give bubbles real borders.

## All exports on this page

- ChatComposer — The message field: grows with its text, emoji picker, attachments with thumbnails, reply and edit bars, and a send button.
- ChatThread — One conversation: header, the message log and the composer.
- DeliveryStatus — sending (clock) → sent (✓) → delivered (✓✓) → read (✓✓, coloured), failed (!).
- EmojiPicker — A compact emoji picker: search, category shortcuts and a grid.
- ImageLightbox — Full-size photos in a dialog: Left / Right (and swipe) between them, a counter and a download link.
- TypingDots — Three dots in a wave.
- defaultChatLabels — The English ChatLabels every chat component starts from; resolveChatLabels merges a partial override over them.


## When to use the chat view

- Use it as a message thread for the main pane of a messaging app, with bubbles grouped by sender, day labels, a New messages line, replies, reactions, photos, files and delivery ticks.
- Use it for a customer support console, where agents see typing indicators, failed messages with Retry and a message list that loads earlier messages when the reader reaches the top without losing their place.
- Use onSend, onEdit, onDelete and onReact to connect your backend; append the new message at once with status sending so the ticks can move from sending to sent, delivered and read.
- Skip it when you need a one-shot AI prompt and answer layout; AI chat block suits a streaming assistant, and Popover chat already wraps this view for a corner support widget.
- Pair it with Chat list to pick conversations, Avatar for senders, and AlertDialog behavior already used for confirming delete.


## Frequently asked questions

### How do I build a react chat UI with message replies and reactions?

Render ChatThread with conversation, messages oldest first, participants and currentUserId. Add onReact to enable reactions, onEdit for editing and onDelete for deleting, since controls without a handler are hidden. Reply is in each message's menu, or press R on a focused message, and clicking the quoted text jumps to the original message.

### What keyboard shortcuts does the message list have?

The list is one tab stop. Arrow Up and Down, Home, End, Page Up and Page Down move between messages, Enter or Space opens the actions menu, R replies and E edits your own message. In the composer Enter sends, Shift+Enter adds a line, Up in an empty composer edits your last message, Escape cancels.

### How do I load older messages and show unread ones?

Use onLoadOlder, hasOlder and loadingOlder: skeleton bubbles show while loading and the reader's place is kept. Set firstUnreadId to show a New messages line above that message and to open the chat there. onRead reports when the newest incoming message was seen.

### Is it usable on phones and with screen readers?

Each row is an article named by a spoken summary of sender, text, time and delivery state. Delivery state and reactions are part of each row's spoken summary, and new incoming messages and actions like replying, editing, reacting and deleting go to one polite live region. Targets are 44px on touch screens, composer text is 16px so iOS does not zoom, and forced colors give bubbles real borders.


## Related pages

- [Popover chat](https://lokendra-builds.github.io/sheenui/chat/widget)
- [Chat list](https://lokendra-builds.github.io/sheenui/chat/list)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
