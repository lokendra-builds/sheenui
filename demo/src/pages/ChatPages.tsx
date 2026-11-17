import { useState } from "react";
import { Switch } from "@sheenui/theme";
import { ChatAppStage } from "./BlockStages.chat";
import { Page, PropsTable } from "../layout/Page";
import { Example } from "../layout/Example";
import { A11yNotes, KeyboardTable } from "./DocSections";
import * as PROPS from "../generated/component-props";
import { CompactListDemo, InboxDemo } from "./ChatPages/list-demos";
import { DirectThreadDemo, GroupThreadDemo } from "./ChatPages/thread-demos";
import { AppDemo, DashboardMock } from "./ChatPages/app-demo";
import { SupportWidget } from "./ChatPages/support-widget";
import { ShowcaseStage } from "../layout/ShowcaseStage";
import type { ChatListScene as ChatListSceneData } from "../layout/ShowcaseStage.chat-list";
import { ChatListScene } from "../layout/ShowcaseStage.chat-list.scene";
import type { ChatThreadScene as ChatThreadSceneData } from "../layout/ShowcaseStage.chat-thread";
import { ChatThreadScene } from "../layout/ShowcaseStage.chat-thread.scene";
import type { ChatWidgetScene as ChatWidgetSceneData } from "../layout/ShowcaseStage.chat-widget";
import { ChatWidgetScene } from "../layout/ShowcaseStage.chat-widget.scene";

/** The "Chat list" docs page (/chat/list): live examples, props and notes. */
export function ChatListPage() {
  const [loading, setLoading] = useState(false);
  const [many, setMany] = useState(false);
  const [empty, setEmpty] = useState(false);

  return (
    <Page
      eyebrow="Chat"
      title="Chat list"
      description="The inbox of a messaging app: search that filters and highlights, All / Unread / Groups / Archived with counts, Pinned and All chats sections, avatars with presence, “typing…”, drafts, delivery ticks, unread counts and pinned / muted marks. Row actions sit behind a ⋯ menu, right-click, long-press and a swipe on touch screens. It stays smooth with thousands of chats."
      source={["theme/src/components/chat/conversation-list.tsx", "theme/src/components/chat/types.ts"]}
    >
      <ShowcaseStage<ChatListSceneData>
        label="Chat list demo"
        story={() => import("../layout/ShowcaseStage.chat-list")}
        initial={{ step: 0 }}
        minHeight="29rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,24rem)]! [&_.sheen-showcase-plate]:p-3!"
      >
        {(scene, ctx) => <ChatListScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Inbox"
        description="Arrow keys move between chats, Enter opens one, typing a name jumps to it and Shift+F10 opens a chat's actions. On a phone, swipe a row to the left. Turn on 1,200 more chats to feel the windowing."
        stageClassName="p-0 sm:p-6"
        controls={
          <>
            <Switch label="Loading" checked={loading} onCheckedChange={setLoading} />
            <Switch label="1,200 more chats" checked={many} onCheckedChange={setMany} />
            <Switch label="No chats" checked={empty} onCheckedChange={setEmpty} />
          </>
        }
        code={`
import { useState } from "react";
import { ConversationList, type ChatConversation, type ChatConversationAction, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <InboxDemo loading={loading} many={many} empty={empty} />
      </Example>

      <Example
        title="Compact, no filters"
        description="A narrower sidebar: compact rows, the heading hidden (it still names the list), and German labels with dates from Intl."
        stageClassName="p-0 sm:p-6"
        code={`
import { ConversationList, type ChatConversation, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <CompactListDemo />
      </Example>

      <PropsTable of={PROPS.ConversationList} />
      <PropsTable of={PROPS.ChatAvatar} title="ChatAvatar props" as="h3" />
      <PropsTable of={PROPS.PresenceDot} title="PresenceDot props" as="h3" />
      <PropsTable of={PROPS.UnreadBadge} title="UnreadBadge props" as="h3" />
      <KeyboardTable
        rows={[
          ["Tab", "The list is one tab stop; the search field and filters are ordinary tab stops."],
          ["Arrow Up / Arrow Down, Home / End, Page Up / Page Down", "Move between chats."],
          ["Type a name", "Jump to that chat."],
          ["Enter / Space", "Open the focused chat."],
          ["Shift + F10 / Menu key", "Open the chat's actions (pin, mute, archive, mark read)."],
        ]}
      />
      <A11yNotes
        items={[
          "A single-select listbox: aria-selected marks the open chat, and each row reads as name, last message, time, unread count and state.",
          "Rows say their position (aria-posinset, aria-setsize) even when the list is windowed. Filter and search results are announced politely.",
          'The swipe and "more" buttons are shortcuts to the same menu, so nothing is gesture-only. Presence is written in words.',
        ]}
      />
    </Page>
  );
}

/** The "Chat view" docs page (/chat/thread): live examples, props and notes. */
export function ChatThreadPage() {
  return (
    <Page
      eyebrow="Chat"
      title="Chat view"
      description="One conversation, WhatsApp / iMessage style: bubbles grouped by sender, day labels (the day floats at the top while you scroll), a “New messages” line, replies that jump to the original, reactions, photos with a viewer, files, link previews, edits and deletes, delivery ticks, typing, a jump-to-latest button and 200 earlier messages that load as you scroll up without losing your place."
      source={[
        "theme/src/components/chat/chat-thread.tsx",
        "theme/src/components/chat/message-row.tsx",
        "theme/src/components/chat/composer.tsx",
      ]}
    >
      <ShowcaseStage<ChatThreadSceneData>
        label="Chat view demo"
        story={() => import("../layout/ShowcaseStage.chat-thread")}
        initial={{ step: 0 }}
        minHeight="33rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,30rem)]! [&_.sheen-showcase-plate]:p-3!"
      >
        {(scene, ctx) => <ChatThreadScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Direct chat"
        description="Send a message and watch the ticks: sending, sent, delivered, read; then Riya types and replies. Your third message fails: retry it. Hover a message for the toolbar, right-click (or long-press) for every action, or use the keyboard: ↑ ↓ between messages, Enter for actions, R to reply, E to edit. ↑ in an empty composer edits your last message."
        stageClassName="p-0 sm:p-6"
        code={`
import { ChatThread, type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <DirectThreadDemo />
      </Example>

      <Example
        title="Group chat"
        lazyPreview
        intrinsicHeight={700}
        description="Sender names and avatars on the first message of each run, system notes, a four-photo grid with “+2”, and reactions from several people."
        stageClassName="p-0 sm:p-6"
        code={`
import { ChatThread, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <GroupThreadDemo />
      </Example>

      <PropsTable of={PROPS.ChatThread} />
      <PropsTable of={PROPS.ChatComposer} title="ChatComposer props" as="h3" />
      <PropsTable of={PROPS.DeliveryStatus} title="DeliveryStatus props" as="h3" />
      <PropsTable of={PROPS.EmojiPicker} title="EmojiPicker props" as="h3" />
      <PropsTable of={PROPS.ImageLightbox} title="ImageLightbox props" as="h3" />
      <KeyboardTable
        rows={[
          [
            "Tab",
            "The message list is one tab stop on the active row; the composer and header buttons are ordinary tab stops.",
          ],
          ["Arrow Up / Arrow Down, Home / End, Page Up / Page Down", "Move between messages."],
          ["Enter / Space", "Open the message's actions menu."],
          ["R / E", "Reply to, or edit (your own), the focused message."],
          ["Enter / Shift + Enter", "Composer: send / add a line (on touch keyboards Return adds a line)."],
          ["Arrow Up in an empty composer", "Edit your last message."],
          ["Escape", "Cancel a reply or an edit."],
        ]}
      />
      <A11yNotes
        items={[
          "Each row is an article named by a spoken summary (sender, text, time, delivery state); the header names the chat and presence is written in words.",
          'Delivery state, reactions and typing are spoken in a polite live region; the "Jump to latest" button and composer controls have names.',
          "Targets are 44 px on touch screens, text is 16 px so iOS does not zoom, and forced colors give bubbles real borders.",
        ]}
      />
    </Page>
  );
}

/** The "Popover chat" docs page (/chat/widget): live examples, props and notes. */
export function ChatWidgetPage() {
  return (
    <Page
      eyebrow="Chat"
      title="Popover chat"
      description="A support chat in the corner of the page, like Intercom: a launcher with an unread badge and a gentle pulse, and a glass panel that springs out of it. Home has a greeting, recent conversations and “Send us a message”; a conversation is the full chat view in compact density with quick-reply chips. The panel is a non-modal dialog (the page stays usable), Escape or minimize returns focus to the launcher, and on phones it becomes a full-screen modal sheet that stays above the keyboard."
      source={["theme/src/components/chat/chat-widget.tsx", "theme/src/components/chat/chat-thread.tsx"]}
    >
      <ShowcaseStage<ChatWidgetSceneData>
        label="Popover chat demo"
        story={() => import("../layout/ShowcaseStage.chat-widget")}
        initial={{ step: 0 }}
        minHeight="34rem"
        className="[&_.sheen-showcase-plate]:w-[min(100%,30rem)]! [&_.sheen-showcase-plate]:p-3!"
      >
        {(scene, ctx) => <ChatWidgetScene scene={scene} ctx={ctx} />}
      </ShowcaseStage>

      <Example
        title="Support widget"
        description='Press the launcher in the bottom-right corner. Start a new conversation, tap a quick reply, and the team answers. In your app use the default strategy="fixed"; this preview keeps it inside the frame.'
        frame="example.com/dashboard"
        stageClassName="relative h-[44rem] max-h-[calc(100dvh-6rem)] p-0 sm:p-0"
        code={`
import { ChatWidget, type ChatConversation, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <div className="relative w-full">
          <DashboardMock />
          <SupportWidget />
        </div>
      </Example>

      <Example
        title="On the left, in Hindi"
        description='position="left" for right-to-left layouts or when something else lives in the right corner. Every string is a label.'
        frame="example.com/settings"
        stageClassName="relative h-[40rem] max-h-[calc(100dvh-6rem)] p-0 sm:p-0"
        code={`
import { ChatWidget, type ChatConversation, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <div className="relative w-full">
          <DashboardMock />
          <SupportWidget
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
        </div>
      </Example>

      <PropsTable of={PROPS.ChatWidget} />
      <KeyboardTable
        rows={[
          ["Enter / Space", "Open the panel from the launcher."],
          [
            "Escape",
            "Close the panel and return focus to the launcher (inside a menu or the emoji picker it closes only that).",
          ],
          ["Tab / Shift + Tab", "On phones the full-screen sheet is modal: focus stays inside."],
          ["Chat keys", "Inside a chat the ChatThread keys apply."],
        ]}
      />
      <A11yNotes
        items={[
          "A dialog named by the team header (aria-modal only on phones, where the sheet covers the page); the launcher has aria-expanded and the unread count in its name.",
          "The sheet makes the page behind inert and keeps the composer above the on-screen keyboard.",
          "Every string is translatable through labels, including right-to-left layouts.",
        ]}
      />
    </Page>
  );
}

/** The "Chat app" docs page (/blocks/chat-app): live examples, props and notes. */
export function ChatAppPage() {
  const [selected, setSelected] = useState<string | null>("c-riya");

  return (
    <Page
      eyebrow="Block"
      title="Chat app"
      description="A complete messenger: the chat list and the open chat side by side, stacking into list → chat with a slide and a back button when the block is narrow (by its own width, so it also works in a sidebar). Contact and group info open in a side drawer with phone and email, members, shared photos, mute and block. The selected chat is a prop, so it can live in your URL."
      source={[
        "theme/src/blocks/chat-app.tsx",
        "theme/src/components/chat/conversation-list.tsx",
        "theme/src/components/chat/chat-thread.tsx",
      ]}
    >
      <ChatAppStage />
      <Example
        title="Messenger"
        description="Open chats, send messages (replies arrive with typing and read receipts), pin or archive from a row's menu, and open the info panel from a chat's header. Narrow your window (or open this on a phone) to see the stacked layout."
        frame={`example.com/${selected ?? "inbox"}`}
        stageClassName="p-0 sm:p-0"
        code={`
import { useState } from "react";
import { ChatApp, type ChatConversation, type ChatConversationAction, type ChatDraft, type ChatMessage, type ChatParticipant } from "@sheenui/theme";

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
}`}
      >
        <AppDemo selected={selected} onSelectedChange={setSelected} />
      </Example>

      <PropsTable of={PROPS.ChatApp} />
      <KeyboardTable
        rows={[
          [
            "Tab / Shift + Tab",
            "Moves between the chat list, the open chat and the composer. The list is one tab stop; the search field, filters and message actions are ordinary tab stops.",
          ],
          ["Arrow Up / Arrow Down, Home / End", "In the list: move between chats. Type a name to jump to that chat."],
          [
            "Enter / Space",
            "In the list: open the focused chat. On a wide layout focus moves to the composer; on a narrow one it moves to the chat's name.",
          ],
          ["Shift + F10 / Menu key", "Open a chat's actions (pin, mute, archive, mark read)."],
          [
            "Arrow Up / Arrow Down, Enter, R, E",
            "In the chat: move between messages, open a message's actions, reply, edit your own message.",
          ],
          [
            "Enter / Shift + Enter",
            "Composer: send / add a line (on touch keyboards Return adds a line). Arrow Up in an empty composer edits your last message.",
          ],
          ["Escape", "Closes the contact or group info drawer and returns focus to the control that opened it."],
          ["Back button", "On a narrow block, returns to the list and puts focus back on the chat's row."],
        ]}
      />
      <A11yNotes
        items={[
          "The list and the chat are labeled regions. Focus is managed on every pane change: opening a chat on a phone moves it to the chat's name, going back returns it to the row, and a keyboard open on a wide layout lands in the composer.",
          "New messages and typing are announced politely (aria-live); message status (sending, sent, delivered, read, failed) is written text, not color alone, and presence is written in words.",
          "The info panel is a side drawer (a modal dialog with a focus trap); swipe and hover actions all have keyboard and menu equivalents, so nothing is gesture-only.",
          "Reduced motion makes the pane slide a jump; reduced transparency makes the glass panes solid; the message area never uses blur, so scrolling stays fast.",
        ]}
      />
    </Page>
  );
}
