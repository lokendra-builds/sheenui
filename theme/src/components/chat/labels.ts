import type { ChatListFilter, ChatMessageStatus } from "./types";

/**
 * Every user-facing string of the chat components (list, thread, composer, widget, app), so
 * they can be translated. Each component takes `labels?: Partial<ChatLabels>`; ChatApp and
 * ChatWidget pass theirs down. Dates and times are never here: they come from Intl with the
 * `locale` prop.
 */
export type ChatLabels = {
  /* ----- Shared ----- */
  you: string;
  /** Before your own last message in the list ("You: see you there"). */
  youPrefix: string;
  /** "Riya is typing…", "Riya and Arjun are typing…", "3 people are typing…". `group` = more than one other person in the chat. */
  typing: (names: string[], group: boolean) => string;
  /** Before an unsent draft in the list. */
  draftPrefix: string;
  /** Preview of a message that only has attachments. */
  attachmentSummary: (kind: "image" | "file", count: number) => string;
  deletedMessage: string;
  deletedOwnMessage: string;
  /** Delivery states (read with your own messages). */
  status: Record<ChatMessageStatus, string>;
  online: string;
  away: string;
  /** Receives Intl's relative time ("5 minutes ago"). */
  lastSeen: (relative: string) => string;
  /** Group subtitle. */
  members: (count: number, online: number) => string;
  /** The list's "now" (under a minute). */
  justNow: string;

  /* ----- Conversation list ----- */
  chats: string;
  search: string;
  searchPlaceholder: string;
  clearSearch: string;
  filtersLabel: string;
  filters: Record<ChatListFilter, string>;
  pinnedSection: string;
  allSection: string;
  /** Screen-reader count, e.g. "3 unread messages". */
  unreadCount: (count: number) => string;
  /** The unread badge text over 99. */
  unreadOverflow: string;
  pinned: string;
  muted: string;
  /** Read once with the list: how to use it with a keyboard. */
  listHint: string;
  /** The ⋯ button of a row. */
  chatActions: (name: string) => string;
  pin: string;
  unpin: string;
  mute: string;
  unmute: string;
  archive: string;
  unarchive: string;
  markRead: string;
  markUnread: string;
  loadingChats: string;
  noChatsTitle: string;
  noChatsDescription: string;
  noResultsTitle: (query: string) => string;
  noResultsDescription: string;
  /** Empty filter tabs. */
  emptyFilter: Record<Exclude<ChatListFilter, "all">, string>;
  /** Announced when a filter or search changes the list. */
  resultsCount: (count: number) => string;

  /* ----- Thread ----- */
  /** Accessible name of the message log. */
  messagesWith: (title: string) => string;
  back: string;
  call: string;
  videoCall: string;
  contactInfo: string;
  groupInfo: string;
  /** Spoken role of each message ("message" instead of "article"). */
  messageRole: string;
  newMessages: string;
  edited: string;
  /** Hidden prefix of a message: "Riya Sharma, 10:42". */
  messageFrom: (name: string, time: string) => string;
  reply: string;
  react: string;
  copy: string;
  copied: string;
  copyFailed: string;
  edit: string;
  delete: string;
  messageInfo: string;
  moreActions: string;
  retry: string;
  notDelivered: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteConfirm: string;
  cancel: string;
  close: string;
  sentAt: string;
  deliveredAt: string;
  readAt: string;
  notYet: string;
  replyingTo: (name: string) => string;
  cancelReply: string;
  editingMessage: string;
  cancelEdit: string;
  /** "Go to the message from Riya" (a quote's button; read before the quoted text: "Go to the message from Riya: See you at 6?"). */
  goToQuoted: (name: string) => string;
  originalNotLoaded: string;
  jumpToLatest: string;
  newBelow: (count: number) => string;
  loadingOlder: string;
  /** Shown at the top once all history is loaded. */
  beginning: (title: string) => string;
  addReaction: string;
  moreEmoji: string;
  /** A reaction chip: "❤️ 3, including you". */
  reactionChip: (emoji: string, count: number, mine: boolean) => string;
  /** Quick reactions toolbar / list name. */
  reactions: string;
  openImage: (name: string) => string;
  imageViewer: string;
  previousImage: string;
  nextImage: string;
  imagePosition: (index: number, count: number) => string;
  download: (name: string) => string;
  morePhotos: (count: number) => string;
  /** Keyboard help, read with the log. */
  logHint: string;

  /* ----- Composer ----- */
  message: string;
  placeholder: (title: string | undefined) => string;
  send: string;
  saveEdit: string;
  attach: string;
  emoji: string;
  attachments: string;
  removeAttachment: (name: string) => string;
  keyHint: string;
  keyHintTouch: string;
  editHint: string;

  /* ----- Emoji picker ----- */
  searchEmoji: string;
  noEmoji: string;
  emojiCategories: Record<"smileys" | "people" | "hearts" | "nature" | "food" | "activities" | "objects", string>;

  /* ----- Announcements (polite live region) ----- */
  announceIncoming: (name: string, text: string) => string;
  announceFailed: string;
  announceDeleted: string;
  announceReaction: (emoji: string, added: boolean) => string;
  announceOlderLoaded: (count: number) => string;
  announceReplying: (name: string) => string;
  announceEditing: string;

  /* ----- Widget ----- */
  openChat: string;
  closeChat: string;
  minimize: string;
  widgetTitle: string;
  widgetSubtitle: string;
  greeting: string;
  greetingDescription: string;
  recentConversations: string;
  sendUsMessage: string;
  quickReplies: string;
  backToHome: string;
  /** Heading of the widget's help links. */
  helpHeading: string;
  /** Launcher badge (screen readers). */
  widgetUnread: (count: number) => string;

  /* ----- App ----- */
  selectChatTitle: string;
  selectChatDescription: string;
  about: string;
  phone: string;
  email: string;
  sharedMedia: string;
  noSharedMedia: string;
  muteNotifications: string;
  unmuteNotifications: string;
  block: (name: string) => string;
  leaveGroup: string;
  membersHeading: (count: number) => string;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The English `ChatLabels` every chat component starts from; `resolveChatLabels` merges a partial override over them. */
export const defaultChatLabels: ChatLabels = {
  you: "You",
  youPrefix: "You:",
  typing: (names, group) => {
    if (!group || names.length === 0) return "typing…";
    if (names.length === 1) return `${names[0]} is typing…`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
    return `${names.length} people are typing…`;
  },
  draftPrefix: "Draft:",
  attachmentSummary: (kind, count) =>
    kind === "image" ? (count === 1 ? "Photo" : `${count} photos`) : count === 1 ? "File" : `${count} files`,
  deletedMessage: "This message was deleted",
  deletedOwnMessage: "You deleted this message",
  status: { sending: "Sending", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Not delivered" },
  online: "Online",
  away: "Away",
  lastSeen: (relative) => `Last seen ${relative}`,
  members: (count, online) =>
    online > 0 ? `${plural(count, "member", "members")}, ${online} online` : plural(count, "member", "members"),
  justNow: "now",

  chats: "Chats",
  search: "Search chats",
  searchPlaceholder: "Search",
  clearSearch: "Clear search",
  filtersLabel: "Filter chats",
  filters: { all: "All", unread: "Unread", groups: "Groups", archived: "Archived" },
  pinnedSection: "Pinned",
  allSection: "All chats",
  unreadCount: (count) => plural(count, "unread message", "unread messages"),
  unreadOverflow: "99+",
  pinned: "Pinned",
  muted: "Muted",
  listHint: "Arrow keys move between chats, Enter opens one, Shift+F10 shows its actions.",
  chatActions: (name) => `Actions for ${name}`,
  pin: "Pin",
  unpin: "Unpin",
  mute: "Mute",
  unmute: "Unmute",
  archive: "Archive",
  unarchive: "Unarchive",
  markRead: "Mark as read",
  markUnread: "Mark as unread",
  loadingChats: "Loading chats…",
  noChatsTitle: "No chats yet",
  noChatsDescription: "When you start a conversation, it shows up here.",
  noResultsTitle: (query) => `No chats match “${query}”`,
  noResultsDescription: "Check the spelling, or search for a name or a word from a message.",
  emptyFilter: { unread: "You're all caught up", groups: "No group chats yet", archived: "No archived chats" },
  resultsCount: (count) => plural(count, "chat", "chats"),

  messagesWith: (title) => `Messages with ${title}`,
  back: "Back to chats",
  call: "Voice call",
  videoCall: "Video call",
  contactInfo: "Contact info",
  groupInfo: "Group info",
  messageRole: "message",
  newMessages: "New messages",
  edited: "edited",
  messageFrom: (name, time) => `${name}, ${time}`,
  reply: "Reply",
  react: "React",
  copy: "Copy text",
  copied: "Copied",
  copyFailed: "Couldn't copy. Select the text and copy it instead.",
  edit: "Edit",
  delete: "Delete",
  messageInfo: "Message info",
  moreActions: "More actions",
  retry: "Retry",
  notDelivered: "Not delivered",
  deleteTitle: "Delete this message?",
  deleteDescription: "It will be removed for everyone in this chat. This can't be undone.",
  deleteConfirm: "Delete for everyone",
  cancel: "Cancel",
  close: "Close",
  sentAt: "Sent",
  deliveredAt: "Delivered",
  readAt: "Read",
  notYet: "Not yet",
  replyingTo: (name) => `Replying to ${name}`,
  cancelReply: "Cancel reply",
  editingMessage: "Editing message",
  cancelEdit: "Cancel editing",
  goToQuoted: (name) => `Go to the message from ${name}`,
  originalNotLoaded: "The original message isn't loaded yet.",
  jumpToLatest: "Jump to latest message",
  newBelow: (count) => plural(count, "new message", "new messages"),
  loadingOlder: "Loading earlier messages…",
  beginning: (title) => `This is the beginning of your chat with ${title}.`,
  addReaction: "Add reaction",
  moreEmoji: "More emoji",
  reactionChip: (emoji, count, mine) => `${emoji} ${count}${mine ? ", including you" : ""}`,
  reactions: "Reactions",
  openImage: (name) => `Open ${name}`,
  imageViewer: "Photo",
  previousImage: "Previous photo",
  nextImage: "Next photo",
  imagePosition: (index, count) => `${index} of ${count}`,
  download: (name) => `Download ${name}`,
  morePhotos: (count) => `+${count}`,
  logHint: "Up and Down arrows move between messages. Enter shows actions, R replies, E edits your own message.",

  message: "Message",
  placeholder: (title) => (title ? `Message ${title}` : "Write a message…"),
  send: "Send",
  saveEdit: "Save changes",
  attach: "Attach files",
  emoji: "Emoji",
  attachments: "Attachments",
  removeAttachment: (name) => `Remove ${name}`,
  keyHint: "Enter to send, Shift + Enter for a new line, Up arrow to edit your last message",
  keyHintTouch: "Use the send button to send",
  editHint: "Esc to cancel",

  searchEmoji: "Search emoji",
  noEmoji: "No emoji found",
  emojiCategories: {
    smileys: "Smileys",
    people: "People",
    hearts: "Hearts",
    nature: "Nature",
    food: "Food",
    activities: "Activities",
    objects: "Objects",
  },

  announceIncoming: (name, text) => `${name}: ${text}`,
  announceFailed: "Message not delivered",
  announceDeleted: "Message deleted",
  announceReaction: (emoji, added) => (added ? `Reacted ${emoji}` : `Removed ${emoji}`),
  announceOlderLoaded: (count) => `Loaded ${plural(count, "earlier message", "earlier messages")}`,
  announceReplying: (name) => `Replying to ${name}. Type your reply.`,
  announceEditing: "Editing your message. Press Escape to cancel.",

  openChat: "Open chat",
  closeChat: "Close chat",
  minimize: "Minimise chat",
  widgetTitle: "SheenUI Support",
  widgetSubtitle: "We typically reply in a few minutes",
  greeting: "Hi there 👋",
  greetingDescription: "Ask us anything: we're real people and happy to help.",
  recentConversations: "Recent conversations",
  sendUsMessage: "Send us a message",
  quickReplies: "Suggested replies",
  backToHome: "Back",
  helpHeading: "Find an answer",
  widgetUnread: (count) => plural(count, "unread message", "unread messages"),

  selectChatTitle: "Pick a chat",
  selectChatDescription: "Choose a conversation from the list to read and reply.",
  about: "About",
  phone: "Phone",
  email: "Email",
  sharedMedia: "Shared photos",
  noSharedMedia: "No photos shared yet.",
  muteNotifications: "Mute notifications",
  unmuteNotifications: "Unmute notifications",
  block: (name) => `Block ${name}`,
  leaveGroup: "Leave group",
  membersHeading: (count) => plural(count, "member", "members"),
};

/** Merge partial labels over the defaults (nested records too). */
export function resolveChatLabels(labels: Partial<ChatLabels> | undefined): ChatLabels {
  if (!labels) return defaultChatLabels;
  return {
    ...defaultChatLabels,
    ...labels,
    status: { ...defaultChatLabels.status, ...labels.status },
    filters: { ...defaultChatLabels.filters, ...labels.filters },
    emptyFilter: { ...defaultChatLabels.emptyFilter, ...labels.emptyFilter },
    emojiCategories: { ...defaultChatLabels.emojiCategories, ...labels.emojiCategories },
  };
}
