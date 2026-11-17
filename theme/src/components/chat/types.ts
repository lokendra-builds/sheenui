/**
 * Chat data model: person-to-person messaging (direct chats and groups).
 *
 * Every chat component is controlled and presentational: you own the data (from your API,
 * a socket, local state) and pass it in; the components call back when people act
 * (onSend, onReact, onDelete, onLoadOlder, onSelect…). Dates accept a Date, an ISO string or
 * epoch milliseconds.
 */

/** Anything a date can come in as: a Date, an ISO string or epoch milliseconds. */
export type ChatDateInput = Date | string | number;

/** online: a green dot · away: an amber dot · offline: a hollow ring (shape differs, not only colour). */
export type ChatPresence = "online" | "away" | "offline";

/** A person in a chat: you, or someone you talk to. */
export type ChatParticipant = {
  /** Stable id; messages refer to it through `senderId`. */
  id: string;
  /** Display name. */
  name: string;
  /** Photo URL. Without one the avatar shows initials. */
  avatarUrl?: string;
  /** Whether they are online, away or offline. */
  presence?: ChatPresence;
  /** When they were last online (shown as "Last seen 5m ago" in direct chats). */
  lastSeenAt?: ChatDateInput;
  /** Phone number (ChatApp's info panel). */
  phone?: string;
  /** Email address (ChatApp's info panel). */
  email?: string;
  /** A short status line ("Building SheenUI ✨"). */
  about?: string;
  /** Job or team role, e.g. "Support" (ChatWidget's team header). */
  role?: string;
};

/**
 * Delivery state of your own message:
 * sending (clock) → sent (✓) → delivered (✓✓) → read (✓✓ accent), or failed ("Not delivered · Retry").
 */
export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

/** A photo or file attached to a message. */
export type ChatAttachment = {
  /** Stable identifier of the attachment, used as the React key and in callbacks. */
  id: string;
  /** "image" shows in the photo grid (with a full-size preview); "file" as a chip with a download link. */
  kind: "image" | "file";
  /** File name, shown on file chips and used as the fallback alt text. */
  name: string;
  /** Full image, or the file's download URL. */
  url?: string;
  /** Smaller image for the grid (defaults to `url`). */
  thumbnailUrl?: string;
  /** Size in bytes. */
  size?: number;
  /** MIME type, e.g. "application/pdf". Picks the file chip's colour and label. */
  mimeType?: string;
  /** Alt text for images (defaults to the file name). */
  alt?: string;
  /** Intrinsic pixel width of the image. With `height` it reserves the right box before the file loads (no layout shift). */
  width?: number;
  /** Intrinsic pixel height of the image. */
  height?: number;
};

/** One emoji and who reacted with it. Your own reaction is the one whose userIds include currentUserId. */
export type ChatReaction = { emoji: string; userIds: string[] };

/** A rich preview of a link in a message. */
export type ChatLinkPreview = {
  /** The link's address. */
  url: string;
  /** The page title. */
  title: string;
  /** A short description under the title. */
  description?: string;
  /** Site name shown above the title (defaults to the URL's host). */
  siteName?: string;
  /** Image or CSS background (gradient) for the card's banner. */
  imageUrl?: string;
};

/**
 * A snapshot of the message being replied to. Stored with the reply, so the quote shows even
 * when the original is not loaded (or was deleted).
 */
export type ChatReplyRef = {
  /** Id of the original message. */
  id: string;
  /** Id of the person who wrote the original. */
  senderId: string;
  /** The original's text at the time of the reply. */
  text?: string;
  /** What the original was when it had no text ("Photo", "File"). */
  attachmentKind?: ChatAttachment["kind"];
};

/** One message (a bubble, or a centred system note). */
export type ChatMessage = {
  /** Stable identifier of the message, used as the React key and in callbacks. */
  id: string;
  /** Id of the sender (a {@link ChatParticipant} `id`). */
  senderId: string;
  /** When it was sent. */
  createdAt: ChatDateInput;
  /** "system": a centred note ("Riya joined"), not a bubble. Defaults to "text". */
  kind?: "text" | "system";
  /** The message text. */
  text?: string;
  /** Photos and files. */
  attachments?: ChatAttachment[];
  /** Emoji reactions. */
  reactions?: ChatReaction[];
  /** The message this one replies to. */
  replyTo?: ChatReplyRef;
  /** A preview card for a link in the text. */
  linkPreview?: ChatLinkPreview;
  /** Set when the text was changed: shows "edited". */
  editedAt?: ChatDateInput;
  /** Deleted for everyone: shows a placeholder instead of the content. */
  deleted?: boolean;
  /** Your own messages only. Left out = "sent". */
  status?: ChatMessageStatus;
  /** When it was delivered (shown in the message details). */
  deliveredAt?: ChatDateInput;
  /** When it was read (shown in the message details). */
  readAt?: ChatDateInput;
};

/** One conversation in the list: a direct chat or a group. */
export type ChatConversation = {
  /** Stable identifier of the conversation, used as the React key and in callbacks. */
  id: string;
  /** "group" shows stacked avatars, sender names and member counts. Defaults to "direct". */
  kind?: "direct" | "group";
  /** Group name. Direct chats use the other person's name. */
  title?: string;
  /** Everyone in the chat (you may be included; you are left out where it matters). */
  participantIds: string[];
  /** Group photo. */
  avatarUrl?: string;
  /** The newest message, for the list's preview line and time. */
  lastMessage?: ChatMessage;
  /** Unread messages; shows a badge when above zero. */
  unreadCount?: number;
  /** Pinned conversations are listed first. */
  pinned?: boolean;
  /** Muted conversations get a quiet badge and a bell-off icon. */
  muted?: boolean;
  /** Archived conversations show under the "Archived" filter only. */
  archived?: boolean;
  /** People typing right now: the preview becomes "typing…" with animated dots. */
  typingIds?: string[];
  /** Unsent text: the preview shows "Draft: …". */
  draft?: string;
  /** Used for sorting and the time when there is no last message. */
  updatedAt?: ChatDateInput;
};

/** A file picked in the composer, before it is sent. */
export type ChatDraftAttachment = {
  /** Generated id. */
  id: string;
  /** The picked file. */
  file: File;
  /** File name. */
  name: string;
  /** Size in bytes. */
  size: number;
  /** MIME type of the file. */
  mimeType: string;
  /** Object URL for image thumbnails (revoked by the composer when removed or unmounted). */
  previewUrl?: string;
};

/** What the composer hands to onSend. */
export type ChatDraft = {
  /** The message text (trimmed). */
  text: string;
  /** Files picked for this message. */
  attachments: ChatDraftAttachment[];
  /** The message being replied to, if any. */
  replyTo?: ChatReplyRef;
};

/** Row actions in the conversation list (⋯ menu, right-click, long-press, swipe). */
export type ChatConversationAction =
  "pin" | "unpin" | "mute" | "unmute" | "archive" | "unarchive" | "markRead" | "markUnread";

/** Filters above the conversation list. */
export type ChatListFilter = "all" | "unread" | "groups" | "archived";
