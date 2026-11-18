Canonical: https://lokendra-builds.github.io/sheenui/chat/widget

# React Chat Widget: Intercom-Style Support Chat

URL: https://lokendra-builds.github.io/sheenui/chat/widget
Sidebar name: Popover chat

An Intercom-style support chat widget for React: a launcher with an unread badge springs open a glass panel with greeting, recent chats and full chat. MIT.

What it is: A React chat widget for support: a launcher in the corner of the page springs open a glass panel with a greeting and recent conversations.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/chat.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Components](https://lokendra-builds.github.io/sheenui/components/) > Popover chat

Files to copy from `theme/src/`:

- `components/chat/{chat-thread.tsx, chat-widget.tsx, chat-parts.tsx, composer.tsx, emoji-picker.tsx, emoji.ts, format.ts, hooks.ts, icons.tsx, labels.ts, message-parts.tsx, message-row.tsx, toolbar-store.ts, types.ts}`
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
import { ChatWidget } from "@/components/sheenui/chat/chat-widget";
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant, ChatWidget } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| conversations | ChatConversation[] | required | The support chats this visitor has had, newest activity first. |
| messages | Record<string, ChatMessage[] \| undefined> | required | Takes messages per chat id (oldest first). |
| participants | ChatParticipant[] | required | Everyone who can appear: the visitor and the team. |
| currentUserId | string | required | Id of the visitor, used to tell which messages are theirs. |
| teamIds | string[] | everyone except you | The team shown in the header (participant ids); defaults to everyone except you. |
| open | boolean | optional, no default | Whether the panel is open (controlled). |
| defaultOpen | boolean | false | Whether the panel starts open (uncontrolled). |
| onOpenChange | ((open: boolean) => void) | optional, no default | Called with the new state when the panel opens or closes. |
| conversationId | string \| null | optional, no default | The chat shown in the panel; null shows the home view. |
| defaultConversationId | string \| null | null | The chat shown on mount (uncontrolled); null is the home view. |
| onConversationChange | ((conversationId: string \| null) => void) | optional, no default | Called with the chat id when the visitor opens a chat, or null when they go back home. |
| onNewConversation | (() => string) \| (() => void) | optional, no default | "Send us a message": create a chat and return its id (it opens once it is in conversations). |
| onSend | ((conversationId: string, draft: ChatDraft) => void) | optional, no default | The visitor sent a message in the chat with this id. |
| onReact | ((conversationId: string, message: ChatMessage, emoji: string, add: boolean) => void) | optional, no default | Called when the visitor adds or removes a reaction. |
| onRetry | ((conversationId: string, message: ChatMessage) => void) | optional, no default | The visitor pressed Retry on a failed message. |
| onRead | ((conversationId: string) => void) | optional, no default | The visitor saw the newest message of this chat: mark it read. |
| quickReplies | string[] | optional, no default | Chips that send a ready-made message (shown in a chat until you write something). |
| threadProps | Partial<ChatThreadProps> | optional, no default | Extra props for the chat view inside the panel. |
| homeContent | ReactNode | optional, no default | Content above "Send us a message" on the home view (a status line…). |
| helpLinks | ChatWidgetLink[] | optional, no default | Help articles under the recent conversations on the home view ("Find an answer"). |
| position | "left" \| "right" | "right" | Sets the physical corner of the launcher. |
| strategy | "absolute" \| "fixed" | "fixed" | "fixed" to the window, or "absolute" inside a positioned box (previews, docs). |
| unreadCount | number | the unread count of every chat | The launcher's badge; defaults to the unread count of every chat. |
| now | Date | the real clock, refreshed every 30 seconds | The current time for "5m" labels. On a prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser renders when it hydrates. |
| locale | string | the browser's | Sets the BCP 47 locale for times and dates. |
| labels | Partial<ChatLabels> | defaultChatLabels | Any UI string (i18n); see ChatLabels (every key is listed below the table). Every other string, for translation: labels={{ you: "…" }}; omitted keys keep the English of defaultChatLabels. All 140 keys of ChatLabels are listed in the key table under the props table. |
| headingLevel | HeadingLevelOption | 3 | Heading level (2 or 3) of the panel's headings ("Recent conversations", help articles) and of the open conversation's title, to fit the page outline. "none" renders them as paragraphs, for a widget shown as an example. |
| className | string | optional, no default | Classes for the outer element (the launcher's corner). |

## Example 1 of 2: Support widget

Press the launcher in the bottom-right corner. Start a new conversation, tap a quick reply, and the team answers. In your app use the default strategy="fixed"; this preview keeps it inside the frame.

```tsx
import { ChatWidget } from "@/components/sheenui/chat/chat-widget";
import { type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ChatWidget, type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data and handlers.
declare const supportChats: ChatConversation[];
declare const messagesById: Record<string, ChatMessage[]>;
declare const people: ChatParticipant[];
declare const api: {
  startConversation(): string;
  send(chatId: string, draft: ChatDraft): void;
  markRead(chatId: string): void;
};

export function Example() {
  return (
    <ChatWidget
      conversations={supportChats}
      messages={messagesById}
      participants={people}
      currentUserId="me"
      teamIds={["sana", "leo", "maya"]}
      onNewConversation={() => api.startConversation()} // return the new chat's id
      onSend={(chatId, draft) => api.send(chatId, draft)}
      onRead={(chatId) => api.markRead(chatId)}
      quickReplies={["I have a billing question 💳", "Report a bug 🐞", "Talk to sales"]}
      helpLinks={[
        { label: "Install SheenUI in a Vite app", description: "Getting started", href: "#install" },
        { label: "Theming, tokens and dark mode", description: "Guides", href: "#theming" },
        { label: "Billing and invoices", description: "Account", href: "#billing" },
      ]}
    />
  );
}
```

## Example 2 of 2: On the left, in Hindi

position="left" for right-to-left layouts or when something else lives in the right corner. Every string is a label.

```tsx
import { ChatWidget } from "@/components/sheenui/chat/chat-widget";
import { type ChatConversation, type ChatMessage, type ChatParticipant } from "@/components/sheenui/chat/types";
// Package build (after the first npm release, or a packed tarball): import { ChatWidget, type ChatConversation, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

// Your data layer: replace these with real data.
declare const conversations: ChatConversation[];
declare const messagesById: Record<string, ChatMessage[]>;
declare const people: ChatParticipant[];

export function Example() {
  return (
    <ChatWidget
      conversations={conversations}
      messages={messagesById}
      participants={people}
      currentUserId="me"
      position="left"
      labels={{
        greeting: "नमस्ते 🙏",
        greetingDescription: "कुछ भी पूछिए, हम मदद के लिए यहाँ हैं।",
        widgetTitle: "SheenUI सहायता",
        widgetSubtitle: "हम आमतौर पर कुछ ही मिनटों में जवाब देते हैं",
        sendUsMessage: "हमें संदेश भेजें",
        recentConversations: "हाल की बातचीत",
        openChat: "चैट खोलें",
        closeChat: "चैट बंद करें",
        minimize: "चैट छोटा करें",
        backToHome: "वापस",
        placeholder: () => "संदेश लिखें…",
        helpHeading: "जवाब खोजें",
      }}
      helpLinks={[{ label: "शुरू कैसे करें", href: "#install" }]}
    />
  );
}
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter / Space | Open the panel from the launcher. |
| Escape | Close the panel and return focus to the launcher (inside a menu or the emoji picker it closes only that). |
| Tab / Shift + Tab | On phones the full-screen sheet is modal: focus stays inside. |
| Chat keys | Inside a chat the ChatThread keys apply. |

## Accessibility

- A dialog named by the team header (aria-modal only on phones, where the sheet covers the page); the launcher has aria-expanded and the unread count in its name.
- The sheet makes the page behind inert and keeps the composer above the on-screen keyboard.
- Every string is translatable through labels, including right-to-left layouts.

## When to use the popover chat widget

- Use it as an Intercom-style live chat widget in the bottom corner of a marketing site or web app, with a launcher, an unread badge and a panel that springs out of the launcher.
- Use homeContent and helpLinks to add a status line and a Find an answer card with help articles, so visitors can self-serve before starting a conversation.
- Use position="left" when another element already lives in the right corner, strategy="absolute" to keep it inside a positioned box, and translate every string through labels.
- Skip it when chat is the main screen of your product; Chat list with Chat view gives a full-page messaging layout, and a Dialog is better for a one-off message form.
- Pair it with the Chat view through threadProps, quickReplies for chips that send a ready-made message, and Toast for your own notification when the team replies.


## Frequently asked questions

### How do I add a react chat widget to my site?

Render ChatWidget with conversations, messages as a record keyed by chat id, participants and currentUserId. Control it with open and onOpenChange, or let it manage itself with defaultOpen. onNewConversation creates a chat for Send us a message and returns its id. The default strategy is fixed to the window.

### Is the panel modal? How does focus behave?

On wide screens it is a non-modal dialog, so the page behind stays usable. Escape or the minimize button returns focus to the launcher, and inside a menu or the emoji picker Escape closes only that. Below 640px it becomes a full-screen modal sheet, the page is inert and focus stays inside.

### How do I keep it inside a container for previews or tests?

Set strategy to absolute so it positions inside a positioned box instead of the window. On prerendered pages, pass a fixed now date so the relative times in the HTML match what the browser renders. The unread badge defaults to the sum of unread counts, and unreadCount overrides it.

### Can I show quick replies and help articles?

quickReplies shows chips that send a ready-made message until the visitor writes their own. helpLinks takes label, href, description and newTab for a Find an answer card under recent conversations, and homeContent adds a block above Send us a message. The home view shows the newest three chats.


## Related pages

- [Chat list](https://lokendra-builds.github.io/sheenui/chat/list)
- [Chat view](https://lokendra-builds.github.io/sheenui/chat/thread)

67 components pages in all: browse them on [All components](https://lokendra-builds.github.io/sheenui/components/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
