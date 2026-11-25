import type { HeadingLevelOption } from "../../../lib/heading";
import { type ReactNode, type Ref } from "react";

import { conversationTitle, isGroup, otherMembers, toTime, type ParticipantMap } from "../format";
import { type ChatLabels } from "../labels";
import type { ChatConversation, ChatConversationAction, ChatListFilter, ChatParticipant } from "../types";

/** Imperative handle of {@link ConversationList}: focus a row from your own code. */
export type ConversationListHandle = {
  /** Focus a chat's row (the selected one, or the first, when no id is given). */
  focus: (conversationId?: string | null) => void;
};

/** Props of {@link ConversationList}. Required: `conversations`, `participants`, `currentUserId`. */
export type ConversationListProps = {
  /** The chats to list (any order: pinned first, then newest activity). */
  conversations: ChatConversation[];
  /** Everyone who can appear: names, avatars and presence come from here. */
  participants: ChatParticipant[];
  /** Your id (to name direct chats after the other person, and to mark your own last message). */
  currentUserId: string;
  /** The open chat: marked as selected (aria-selected). */
  selectedId?: string | null;
  /** A row was opened (click, tap, Enter or Space). `via` tells keyboard from pointer, to move focus sensibly. */
  onSelect?: (conversation: ChatConversation, via: "pointer" | "keyboard") => void;
  /** Pin, mute, archive, mark read… from the ⋯ menu, right-click, long-press or a swipe. Leave out to hide them. */
  onAction?: (conversation: ChatConversation, action: ChatConversationAction) => void;
  /** The active filter: "all", "unread", "groups" or "archived" (controlled). */
  filter?: ChatListFilter;
  /**
   * The filter on mount (uncontrolled).
   * @default "all"
   */
  defaultFilter?: ChatListFilter;
  /** Called with the new filter. */
  onFilterChange?: (filter: ChatListFilter) => void;
  /** Sets the search text when controlled. */
  query?: string;
  /**
   * The search text on mount (uncontrolled).
   * @default ""
   */
  defaultQuery?: string;
  /** Called with the search text as it changes. */
  onQueryChange?: (query: string) => void;
  /**
   * Shows skeleton rows while the list loads.
   * @default false
   */
  loading?: boolean;
  /** Heading above the list (defaults to "Chats"); false hides it (it stays the list's name). */
  title?: ReactNode | false;
  /**
   * Level of the list's heading.
   * Pass `"none"` for a paragraph with no heading role (for an example).
   * @default 2
   */
  headingLevel?: HeadingLevelOption;
  /** Shows the buttons beside the heading ("New chat"). */
  headerActions?: ReactNode;
  /**
   * Show the search field.
   * @default true
   */
  showSearch?: boolean;
  /**
   * Show the All / Unread / Groups / Archived filters.
   * @default true
   */
  showFilters?: boolean;
  /**
   * Touch: swipe a row towards the start to reveal Pin / Mute / Archive.
   * @default true
   */
  swipeActions?: boolean;
  /** Under the "No chats yet" message (a "Start a chat" button). */
  emptyAction?: ReactNode;
  /**
   * Sets the row height: 72px comfortable, 64px compact.
   * @default "comfortable"
   */
  density?: "comfortable" | "compact";
  /**
   * Above this many rows, only the visible ones are rendered (smooth with thousands of chats).
   * @default 150
   */
  windowThreshold?: number;
  /** Ref to the imperative handle ({@link ConversationListHandle}). */
  ref?: Ref<ConversationListHandle>;
  /** Fixes the current time used for relative dates (for tests and screenshots). */
  now?: Date;
  /** BCP 47 locale for times. Pass one for prerendered pages. */
  locale?: string;
  /** Any UI string (i18n); see {@link ChatLabels}. */
  labels?: Partial<ChatLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** One virtual list item: a group header or a conversation row. @internal */
export type Item =
  | { type: "header"; key: string; label: string }
  | { type: "row"; key: string; conversation: ChatConversation; index: number };

/** The height of a group header, in pixels. @internal */
export const HEADER_HEIGHT = 34;
/** The height of a conversation row for each density, in pixels. @internal */
export const ROW_HEIGHT = { comfortable: 72, compact: 64 } as const;
/** The extra rows rendered beyond the viewport. @internal */
export const OVERSCAN = 8;
/** The width of the revealed swipe actions, in pixels. @internal */
export const SWIPE_ACTION_WIDTH = 72;

/** Newest activity first. */
export function activity(c: ChatConversation) {
  return Math.max(toTime(c.lastMessage?.createdAt), toTime(c.updatedAt));
}

/** What search looks through: the name, the members, the last message and the draft (lower case). */
export function haystack(c: ChatConversation, people: ParticipantMap, currentUserId: string) {
  return [
    conversationTitle(c, people, currentUserId),
    ...otherMembers(c, people, currentUserId).map((p) => p.name),
    c.lastMessage?.deleted ? "" : (c.lastMessage?.text ?? ""),
    c.draft ?? "",
  ]
    .join("\n")
    .toLocaleLowerCase();
}

/** True when a conversation matches a list filter. @internal */
export function inFilter(c: ChatConversation, filter: ChatListFilter) {
  if (filter === "archived") return Boolean(c.archived);
  if (c.archived) return false;
  if (filter === "unread") return (c.unreadCount ?? 0) > 0;
  if (filter === "groups") return isGroup(c);
  return true;
}
