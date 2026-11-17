import type { HeadingLevelOption } from "../../../lib/heading";
import { type ReactNode, type Ref } from "react";
import { type ChatComposerHandle } from "../composer";
import { type ChatLabels } from "../labels";
import type { ChatConversation, ChatDraft, ChatMessage, ChatParticipant } from "../types";

/** Props of {@link ChatThread}. Required: `conversation`, `messages`, `participants`, `currentUserId`. */
export type ChatThreadProps = {
  /** The conversation being shown (kind, title, members). */
  conversation: ChatConversation;
  /** The messages of the conversation, oldest first: the thread shows them in this order, newest at the bottom. */
  messages: ChatMessage[];
  /** Everyone who can appear in the chat (names, avatars, presence). */
  participants: ChatParticipant[];
  /** Your id: your messages sit on the right (left in RTL) in the accent colour. */
  currentUserId: string;

  /** The composer sent a message. Add it to `messages` at once with status "sending" (optimistic), then update it. */
  onSend?: (draft: ChatDraft) => void;
  /** Called when you save an edit of your message. */
  onEdit?: (messageId: string, text: string) => void;
  /** You confirmed deleting your message. Keep it with `deleted: true` (it shows a placeholder). */
  onDelete?: (message: ChatMessage) => void;
  /** Add (`add` true) or remove your reaction. */
  onReact?: (message: ChatMessage, emoji: string, add: boolean) => void;
  /** "Retry" on a message whose status is "failed". */
  onRetry?: (message: ChatMessage) => void;
  /** The reader reached the top: load earlier messages and prepend them (the scroll position is kept). */
  onLoadOlder?: () => void;
  /** There are earlier messages to load. */
  hasOlder?: boolean;
  /** Earlier messages are loading: skeleton bubbles show at the top. */
  loadingOlder?: boolean;
  /** The newest message was seen (the reader is at the bottom): mark the chat read. */
  onRead?: (lastMessageId: string) => void;
  /** Called with true when you start typing and false when you stop. */
  onTyping?: (typing: boolean) => void;
  /** Show a "New messages" line above this message (the first unread one when the chat opened). */
  firstUnreadId?: string | null;

  /**
   * Show the header (avatar, name, presence, call buttons).
   * @default true
   */
  showHeader?: boolean;
  /** Shows a back button in the header (phones: back to the chat list). */
  onBack?: () => void;
  /** Shows a call button in the header. */
  onCall?: () => void;
  /** Shows a video-call button in the header. */
  onVideoCall?: () => void;
  /** Shows an info button (opens contact or group info). */
  onInfo?: () => void;
  /** Extra buttons at the end of the header. */
  headerActions?: ReactNode;
  /**
   * Level of the chat's name (`2 | 3`), or `"none"` for a paragraph with no heading role (for an example).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** The heading element (to move focus to it, e.g. after opening the chat on a phone). */
  headingRef?: Ref<HTMLHeadingElement>;

  /**
   * Shows the message composer below the thread.
   * @default true
   */
  showComposer?: boolean;
  /** The unsent text (controlled), e.g. a draft per chat. */
  draft?: string;
  /** Called with the unsent text as it changes. */
  onDraftChange?: (text: string) => void;
  /** Chips that send a ready-made reply (support chats). */
  quickReplies?: string[];
  /** The reactions offered as one-tap choices on a message. */
  quickReactions?: readonly string[];
  /**
   * Let people attach files and photos.
   * @default true
   */
  allowAttachments?: boolean;
  /** The `accept` attribute of the file picker, e.g. "image/*,.pdf". */
  accept?: string;
  /** Receives the ref to the composer's handle (`focus()`, `setText()`...). */
  composerRef?: Ref<ChatComposerHandle>;
  /** Focus the composer on mount. */
  autoFocus?: boolean;

  /**
   * "compact": smaller type and spacing (the chat widget).
   * @default "comfortable"
   */
  density?: "comfortable" | "compact";
  /**
   * "glass": its own glass panel. "none": no surface (inside ChatApp or your own card).
   * @default "glass"
   */
  surface?: "glass" | "none";
  /** Shown instead of the log when there are no messages. */
  emptyState?: ReactNode;
  /** Fixes the current time used for relative dates (for tests and screenshots). */
  now?: Date;
  /** BCP 47 locale for times and day labels. Pass one for prerendered pages. */
  locale?: string;
  /** Any UI string (i18n); see {@link ChatLabels}. */
  labels?: Partial<ChatLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};
