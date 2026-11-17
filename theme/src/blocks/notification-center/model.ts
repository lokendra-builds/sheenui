import type { HeadingLevelOption } from "../../lib/heading";
import { type ReactNode } from "react";

/* ---------- Types ---------- */

/** What a notification is about; it picks the small badge on the avatar (or the large icon of a system notice). */
export type NotificationKind =
  "mention" | "comment" | "reaction" | "invite" | "assign" | "system" | "success" | "warning";

/** One notification: id, optional actor, kind, title (also the row's accessible name), description, time, read state, mention flag, link and extra action buttons. */
export type NotificationItem = {
  id: string;
  /** Who did it, shown as an avatar (initials when there is no image). Leave out for system notices. */
  actor?: { name: string; avatar?: string };
  /** What happened: a small badge on the avatar (or the large icon of a system notice). */
  kind?: NotificationKind;
  /** The sentence, e.g. <><b>Ada</b> mentioned you in <b>Q3 plan</b></>. It is also the row's accessible name. */
  title: ReactNode;
  /** Optional second line: a quote, a file name… Clamped to two lines. */
  description?: ReactNode;
  /** When it happened (Date, ISO string or epoch ms). An unparsable value is listed last, under "Undated". */
  time: Date | string | number;
  read?: boolean;
  /** Whether the notification is listed under the Mentions tab. Defaults to kind === "mention". */
  mention?: boolean;
  /** Opening the notification follows this link. */
  href?: string;
  /** Extra buttons under the text, e.g. Accept / Decline an invite. */
  actions?: ReactNode;
};

/** A tab of the notification inbox: all, unread or mentions. */
export type NotificationTab = "all" | "unread" | "mentions";

/** Every user-facing string (i18n). */
export type NotificationCenterLabels = {
  /** Accessible name of the bell button. */
  trigger: (unread: number) => string;
  title: string;
  markAllRead: string;
  /** Close button of the phone sheet. */
  close: string;
  /** Name of the tab list. */
  tabs: string;
  all: string;
  unread: string;
  mentions: string;
  today: string;
  yesterday: string;
  /** Day heading for notifications whose `time` can't be read. */
  undated: string;
  justNow: string;
  /** Read after an unread notification's text. */
  unreadState: string;
  markRead: string;
  markUnread: string;
  dismiss: string;
  /** Shown behind a row while it is swiped. */
  swipeDismiss: string;
  dismissed: string;
  undo: string;
  viewAll: string;
  emptyAllTitle: string;
  emptyAllDescription: string;
  emptyUnreadTitle: string;
  emptyUnreadDescription: string;
  emptyMentionsTitle: string;
  emptyMentionsDescription: string;
  /** Announced when new notifications arrive. */
  announceNew: (count: number) => string;
  announceAllRead: string;
  /** Announced after a dismissal; receives the spoken undo shortcut ("Command Z" / "Control Z"). */
  announceDismissed: (undoShortcut: string) => string;
  announceRestored: string;
};

/** The English `NotificationCenterLabels` used when `labels` is omitted; a partial `labels` prop is merged over them. */
export const defaultNotificationCenterLabels: NotificationCenterLabels = {
  trigger: (n) => (n > 0 ? `Notifications, ${n} unread` : "Notifications"),
  title: "Notifications",
  markAllRead: "Mark all as read",
  close: "Close notifications",
  tabs: "Filter notifications",
  all: "All",
  unread: "Unread",
  mentions: "Mentions",
  today: "Today",
  yesterday: "Yesterday",
  undated: "Undated",
  justNow: "Just now",
  unreadState: "unread",
  markRead: "Mark as read",
  markUnread: "Mark as unread",
  dismiss: "Dismiss",
  swipeDismiss: "Dismiss",
  dismissed: "Notification dismissed",
  undo: "Undo",
  viewAll: "View all notifications",
  emptyAllTitle: "No notifications yet",
  emptyAllDescription: "When teammates mention you, comment or invite you, it shows up here.",
  emptyUnreadTitle: "You're all caught up",
  emptyUnreadDescription: "Nothing new since you last looked. Enjoy the quiet.",
  emptyMentionsTitle: "No mentions",
  emptyMentionsDescription: "When someone @mentions you, you'll find it here.",
  announceNew: (n) => (n === 1 ? "1 new notification" : `${n} new notifications`),
  announceAllRead: "All notifications marked as read",
  announceDismissed: (shortcut) => `Notification dismissed. Press ${shortcut} to undo.`,
  announceRestored: "Notification restored",
};

/**
 * The former name of `defaultNotificationCenterLabels`, kept as an alias for one release.
 *
 * @deprecated Renamed `defaultNotificationCenterLabels`; this alias is removed after one release.
 */
export const defaultNotificationLabels = defaultNotificationCenterLabels;

/** Props shared by `NotificationCenter` (bell + popover) and `NotificationPanel` (inline card). */
export type SharedProps = {
  /** The notifications to show, when you control the list yourself (pair it with the change callbacks). */
  notifications?: NotificationItem[];
  /** Sets the starting list when uncontrolled. */
  defaultNotifications?: NotificationItem[];
  /** Called with the whole new list after any change (read, unread, dismiss, undo). */
  onNotificationsChange?: (next: NotificationItem[]) => void;
  /** Called when a notification is opened (it is marked as read first). */
  onSelect?: (item: NotificationItem) => void;
  /** Called as soon as a notification is dismissed (button, Delete key or swipe). Undo can still bring it back: see onRestore. */
  onDismiss?: (item: NotificationItem) => void;
  /** Called when Undo brings a dismissed notification back. */
  onRestore?: (item: NotificationItem) => void;
  /**
   * Called once a dismissal can no longer be undone: the undo bar timed out, another
   * notification was dismissed, or the inbox closed. Delete it on your server here.
   */
  onDismissCommit?: (item: NotificationItem) => void;
  /** Shows a "View all notifications" link at the bottom. */
  viewAllHref?: string;
  /** Extra controls in the header, after "Mark all as read" (e.g. a settings link). */
  headerActions?: ReactNode;
  /** The tab that is selected when the panel first renders. */
  defaultTab?: NotificationTab;
  /**
   * The current time for "5m ago" and the day groups. Default: the real clock, refreshed every
   * 30 seconds. On a prerendered or server-rendered page pass a fixed date, so the HTML matches
   * what the browser renders when it hydrates.
   */
  now?: Date;
  /** Sets the BCP 47 locale for day headings and times. Default: the browser's; pass one on prerendered pages. */
  locale?: string;
  /** Any UI string (i18n). */
  labels?: Partial<NotificationCenterLabels>;
  /** Heading level of the panel title (`2 | 3 | 4`, default 2); day groups sit one level below. `"none"` renders paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
};

/** Props of `NotificationPanel`: the shared inbox props plus `className`. */
export type NotificationPanelProps = SharedProps & {
  /** Classes for the glass card (set its height here; it defaults to 32rem). */
  className?: string;
};

/** Props of `NotificationCenter`: the shared inbox props plus the popover ones below. */
export type NotificationCenterProps = SharedProps & {
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /** Whether the panel is open at first when `open` is not controlled (`boolean`, default `false`). */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the bell the panel opens on (`"top" | "bottom" | "left" | "right"`, default `"bottom"`). */
  side?: "top" | "bottom" | "left" | "right";
  /** Sets the alignment against the bell (`"start" | "center" | "end"`, default `"end"`). */
  align?: "start" | "center" | "end";
  /** Counts above this show as "99+" (`number`, default 99). */
  max?: number;
  /** Classes for the bell button (the outer element; the panel is portaled). */
  className?: string;
  /** Adds extra classes to the glass panel. */
  panelClassName?: string;
};
