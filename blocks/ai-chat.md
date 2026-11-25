Canonical: https://lokendra-builds.github.io/sheenui/blocks/ai-chat

# AI Chat UI for React with Streaming Replies

URL: https://lokendra-builds.github.io/sheenui/blocks/ai-chat
Sidebar name: AI chat

A glass AI chat UI for React: streaming replies, thinking shimmer, Markdown and code, attachments, model picker, stop and regenerate. Tailwind v4.

What it is: An AI chat UI for React with replies that stream in word by word, a “thinking” shimmer, Markdown with code blocks and a model picker.

Install:

```bash
npx shadcn@latest add https://lokendra-builds.github.io/sheenui/r/ai-chat.json
```

By Lokendra Singh Rathore. Published November 8, 2026, updated November 17, 2026.

Breadcrumb: [Home](https://lokendra-builds.github.io/sheenui/) > [Blocks](https://lokendra-builds.github.io/sheenui/blocks/) > AI chat

Files to copy from `theme/src/`:

- `blocks/ai-chat.tsx`
- `components/button/`
- `components/code-block/tokenize.ts`
- `components/drawer/parts/sheet.tsx`
- `components/glass-card/`
- `components/select/`
- `components/spinner/`
- `components/status-icons/`
- `components/tooltip/`
- `blocks/ai-chat/`
- `hooks/{use-controllable.ts, use-latest.ts, use-magnetic.ts, use-media-query.ts, use-preferences.ts, use-virtual-window.ts}`
- `motion/{gate.ts, light-follower.ts, presets.ts, tokens.ts}`
- `lib/{cn.ts, field-size.ts, form.ts, glide-highlight.tsx, group-segments.ts, heading.ts, ime.ts, page-size.ts, popup-a11y.ts, popup-motion.ts, state-light.tsx, uid.ts, warn-once.ts}`
- `styles/`

Packages:

```bash
pnpm add @base-ui/react clsx motion tailwind-merge
```

Registry item: ai-chat. The styles need the [Tailwind v4 glass UI setup](https://lokendra-builds.github.io/sheenui/docs/tailwind-v4).

Import (after `shadcn add` or copying the files, use this today):

```tsx
import { AiChat } from "@/components/sheenui/blocks/ai-chat";
import { type AiChatMessage } from "@/components/sheenui/blocks/ai-chat/types";
```

Import from the package (after the first npm release, or a packed tarball):

```tsx
import { AiChat, type AiChatMessage } from "@sheenui/theme";
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| respond | AiChatRespond | demoRespond | Produces the reply (AiChatRespond). Returns a string (typed out for you), a promise of one, or an async iterable of chunks (real streaming). Defaults to canned demo replies. The default is sample content for demos and prototypes: pass your own in production. |
| defaultMessages | AiChatMessage[] | [] | Conversation to start with (shown without animation). |
| messages | AiChatMessage[] | optional, no default | The conversation (controlled). Passing a new array replaces what is shown (load history, switch threads) without animation and stops a reply in progress. Keep it in sync with onMessagesChange; leave it out to let the chat own it. |
| isTyping | boolean | false | Show the assistant's "thinking" row although no reply is running here, for chats whose replies come from your own backend (controlled messages). |
| onMessagesChange | ((messages: AiChatMessage[]) => void) | optional, no default | Called with the whole conversation whenever it settles: a reply ends, stops or fails, or the chat is cleared. |
| onSend | ((message: AiChatMessage) => void) | optional, no default | Called when the person sends a message. |
| onFeedback | ((message: AiChatMessage, feedback: AiChatFeedback) => void) | optional, no default | Called when a reply is rated (null = rating removed). |
| models | AiChatModel[] | defaultModels | Models for the picker; the picker hides with fewer than two. The default is sample content for demos and prototypes: pass your own in production. |
| model | string | optional, no default | Sets the selected model's value when controlled. |
| defaultModel | string | optional, no default | The model selected at first when model is not controlled; the first of models when omitted. |
| onModelChange | ((model: string) => void) | optional, no default | Called when another model is picked. |
| suggestions | string[] | defaultSuggestions | Prompts offered as chips while the chat is empty. |
| allowAttachments | boolean | true | Show the attach button and accept dropped files. |
| accept | string | optional, no default | accept for the file picker, e.g. "image/*,.pdf". |
| maxAttachments | number | 4 | Most files one message can carry. |
| simulateStreaming | boolean | true | Type out string replies word by word (turn it off to show them whole). Streams are never delayed. |
| typingSpeed | number | 160 | Characters per second for the typed-out reply. |
| thinkingDelay | number | 900 | Shortest "thinking" time (ms) before a string reply starts, so it never flashes. |
| maxRows | number | 8 | Tallest the message field grows, in lines, before it scrolls. |
| headingLevel | HeadingLevelOption | 2 | Heading level of the assistant name; message headings are one level below. "none" renders them all as paragraphs with no heading role (for an example). |
| autoFocus | boolean | false | Focus the message field on mount. Off by default: only use it when the chat is the page's main task. |
| locale | string | "en-US" | BCP 47 locale for file sizes. |
| labels | Partial<AiChatLabels> | defaultAiChatLabels | Every other string, for translation: labels={{ assistant: "…" }}; omitted keys keep the English of defaultAiChatLabels. All 46 keys of AiChatLabels are listed in the key table under the props table. |
| className | string | optional, no default | Classes for the outer glass panel (set its height here). |

## AiChatRequest

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| prompt | string | optional, no default | The text of the message being answered. |
| attachments | AiChatAttachment[] | optional, no default | { id, name, size, type, previewUrl, file } for files sent with it. |
| messages | AiChatMessage[] | optional, no default | The conversation so far, oldest first, ending with this prompt. |
| model | string | optional, no default | Holds the value of the model the person chose. |
| attempt | number | optional, no default | 0 for a new prompt; 1, 2… for each regenerate or retry. |
| signal | AbortSignal | optional, no default | Aborted by Stop, New chat or unmount. Pass it to fetch. |

## AiChatMessage

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| id | string | optional, no default | Stable identifier of the message, used as the React key and in callbacks. |
| role | "user" \| "assistant" | optional, no default | Says who wrote the message: the person ("user") or the model ("assistant"). |
| content | string | optional, no default | Light Markdown: **bold**, code, fenced code blocks, - and 1. lists, [links](https://…). User messages show as plain text. |
| attachments | AiChatAttachment[] | optional, no default | Lists the files shown above a user message. |
| model | string | optional, no default | Sets the model value shown under an assistant reply. |
| status | "thinking" \| "streaming" \| "done" \| "stopped" \| "error" | "done" | Progress of an assistant reply; user messages have no status. |
| error | string | optional, no default | Shown when status is error. |

## Example 1 of 3: Assistant

Pick a suggestion or type a message. Press Stop (or Escape) while it writes, regenerate the last reply, attach or drop a file, and scroll up mid-reply to see the jump button.

```tsx
import { AiChat } from "@/components/sheenui/blocks/ai-chat";
// Package build (after the first npm release, or a packed tarball): import { AiChat } from "@sheenui/theme";

// Your analytics call
function track(event: string, properties: Record<string, unknown>) {
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  });
}

export function Example() {
  return (
    <AiChat
      respond={async ({ messages, model, signal }) => {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ model, messages }),
          signal, // Stop aborts the request
        });
        return res.text(); // a string is typed out word by word
      }}
      onFeedback={(message, rating) => track("feedback", { id: message.id, rating })}
    />
  );
}
```

## Example 2 of 3: Real streaming and history

Return an async iterable to stream tokens as they arrive. This one continues an earlier conversation, uses its own assistant name and models, and turns attachments off.

```tsx
import { AiChat } from "@/components/sheenui/blocks/ai-chat";
import { type AiChatMessage } from "@/components/sheenui/blocks/ai-chat/types";
// Package build (after the first npm release, or a packed tarball): import { AiChat, type AiChatMessage } from "@sheenui/theme";

// An earlier conversation, e.g. loaded from your database
const savedMessages: AiChatMessage[] = [
  { id: "h1", role: "user", content: "How do I debounce a search field in React?" },
  {
    id: "h2",
    role: "assistant",
    model: "nova-large",
    content: "Keep the input instant and debounce the **value** you search with, then fetch with the debounced value instead of the raw one.",
  },
];

export function Example() {
  return (
    <AiChat
      defaultMessages={savedMessages}
      models={[
        { value: "nova-large", label: "Nova Large", description: "Most capable" },
        { value: "nova-small", label: "Nova Small", description: "Fastest" },
      ]}
      allowAttachments={false}
      labels={{ assistant: "Nova", placeholder: "Ask Nova…" }}
      respond={async function* ({ messages, model, signal }) {
        const res = await fetch("/api/chat/stream", { method: "POST", body: JSON.stringify({ model, messages }), signal });
        const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) return;
          yield value; // each chunk is appended as it arrives
        }
      }}
    />
  );
}
```

## Example 3 of 3: Errors and retry

Throw from respond to show an error under the reply. This one fails the first time and works on Try again. Give each chat on a page its own assistant name: it names the chat for screen readers.

```tsx
import { AiChat } from "@/components/sheenui/blocks/ai-chat";
// Package build (after the first npm release, or a packed tarball): import { AiChat } from "@sheenui/theme";

<AiChat
  labels={{ assistant: "Atlas" }}
  suggestions={["Summarize my week"]}
  respond={async ({ attempt }) => {
    if (attempt === 0) throw new Error("The model is busy right now (429).");
    return "Back online…";
  }}
/>
```

## Keyboard

| Keys | Action |
| --- | --- |
| Enter | Send the message (on touch keyboards Enter adds a line and the send button sends). |
| Shift + Enter | Add a line. |
| Escape | Stop a reply. |
| Tab | The conversation (a scrollable region), the suggestion chips, the attach button, the model picker, then send. |

## Accessibility

- Every message starts with a visually hidden heading (“You said:”), so the conversation can be navigated by heading.
- Streaming text is not read piece by piece: one polite live region reports thinking, then the finished reply, a stop or an error.
- The key hint is linked to the field with aria-describedby. Give each chat on a page its own assistant name: it names the chat for screen readers.

## All exports on this page

- AiChat — An assistant chat panel: a message list with streaming replies, a composer, attachments and a model picker.
- defaultAiChatLabels — The English strings used when the labels prop is omitted (an AiChatLabels); the block merges a partial labels over them.


## When to use the AI chat block

- Use AiChat as a streaming chat UI for an assistant panel inside a product, such as a help sidebar or docs search, where you supply a respond function that calls your model API and returns text or an async iterable of chunks. Use it as a chatbot UI in React and Tailwind that you connect to your own model.
- Use it for a prompt playground with a model picker, passing models and onModelChange, plus suggestion chips so first-time visitors have a starting prompt. It is a ChatGPT UI clone in React in layout only: you bring the model and the streaming.
- Use it when users need to attach screenshots or files, since allowAttachments defaults to true and accept and maxAttachments (default 4) limit what the composer takes.
- Skip it when the conversation is between people rather than a person and a model; ChatApp has conversation lists, presence, read state and message actions that AiChat does not.
- Pair it with useSheenReducedMotion if the rest of your page animates around the panel, and Toast for notices outside the chat. Give the panel a fixed height through className.


## Frequently asked questions

### How do I build an AI chat UI in React with AiChat?

Render AiChat with a className that sets a height, then provide respond({ prompt, signal }). Return a string for a finished reply or an async iterable to stream it. The signal aborts when the user presses Escape. Use messages and onMessagesChange for controlled state.

### Which keyboard shortcuts does the chat composer support?

Enter sends and Shift plus Enter adds a new line. On touch keyboards Enter adds a line and the send button sends. Escape stops a reply in progress. Tab reaches the scrollable conversation, suggestion chips, attach button, model picker and send button in that order.

### How does AiChat stay accessible while text streams in?

Streaming text is not read piece by piece. One polite live region reports thinking, then the finished reply, a stop or an error. Each message begins with a visually hidden heading like "You said:", and the key hint is linked to the field with aria-describedby.

### What formatting do assistant replies support, and can I turn off the typing effect?

Message text accepts light Markdown: bold, inline code, fenced code blocks, bulleted and numbered lists, and links. The typing animation comes from simulateStreaming, which defaults to true; set it to false to show replies whole. typingSpeed and thinkingDelay tune the timing. Reduced motion shows replies whole automatically.


## Related pages

- [Chat view](https://lokendra-builds.github.io/sheenui/chat/thread)
- [Code block](https://lokendra-builds.github.io/sheenui/components/code-block)
- [Sign-up page](https://lokendra-builds.github.io/sheenui/blocks/signup-page)
- [Bento grid](https://lokendra-builds.github.io/sheenui/blocks/bento-grid)
- [Chat app](https://lokendra-builds.github.io/sheenui/blocks/chat-app)
- [Notification center](https://lokendra-builds.github.io/sheenui/blocks/notification-center)

20 blocks pages in all: browse them on [All blocks](https://lokendra-builds.github.io/sheenui/blocks/).


---

Part of SheenUI (https://lokendra-builds.github.io/sheenui/llms.txt). MIT license.
