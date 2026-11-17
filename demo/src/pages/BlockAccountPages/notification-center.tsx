import { type ComponentProps } from "react";
import { Button, cn } from "@sheenui/theme";
import type { NotificationCenterLabels, NotificationItem } from "@sheenui/theme";
import { lazyBlock } from "../../layout/lazy-block";
import { DEMO_NOW_MS } from "../../demo-clock";

// Heavy blocks are islands (see layout/lazy-block.tsx): the page chunk holds the docs, each block is a chunk of its own,
// fetched while the page hydrates (each is the subject of its page).
export const NotificationCenter = lazyBlock(
  () => import("../../../../theme/src/blocks/notification-center").then((m) => m.NotificationCenter),
  { minHeight: "0", eager: true },
);

export const NotificationPanel = lazyBlock(
  () => import("../../../../theme/src/blocks/notification-center").then((m) => m.NotificationPanel),
  { minHeight: "28rem", eager: true },
);

function Icon({ children, className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export const GearIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);

export const SearchIcon = (p: ComponentProps<"svg">) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

/* =====================================================================
 * Notification center
 * ===================================================================== */

// Relative to the demos' fixed "now": the page is prerendered, so the real clock must not leak into the HTML.
const minutesAgo = (n: number) => new Date(DEMO_NOW_MS - n * 60_000);

const daysAgo = (n: number, hour = 10, minute = 0) => {
  const d = new Date(DEMO_NOW_MS);
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export function sampleNotifications(): NotificationItem[] {
  return [
    {
      id: "n1",
      kind: "mention",
      actor: { name: "Ada Lovelace" },
      title: (
        <>
          <b>Ada Lovelace</b> mentioned you in <b>Q3 roadmap</b>
        </>
      ),
      description: "“@you could you sanity-check the contrast numbers before Friday’s review?”",
      time: minutesAgo(4),
    },
    {
      id: "n2",
      kind: "comment",
      actor: { name: "Linus Park" },
      title: (
        <>
          <b>Linus Park</b> commented on <b>Pricing page v2</b>
        </>
      ),
      description: "“Love the odometer prices. Ship it.”",
      time: minutesAgo(38),
    },
    {
      id: "n3",
      kind: "invite",
      actor: { name: "Priya Raman" },
      title: (
        <>
          <b>Priya Raman</b> invited you to the <b>Northwind</b> workspace
        </>
      ),
      time: minutesAgo(130),
    },
    {
      id: "n4",
      kind: "success",
      title: (
        <>
          Deploy of <b>sheen-docs</b> finished in 48 s
        </>
      ),
      description: "Production · commit 7f3a9c2",
      time: minutesAgo(300),
      read: true,
    },
    {
      id: "n5",
      kind: "assign",
      actor: { name: "Grace Hopper" },
      title: (
        <>
          <b>Grace Hopper</b> assigned you <b>Fix focus ring in Safari</b>
        </>
      ),
      time: daysAgo(1, 16, 20),
    },
    {
      id: "n6",
      kind: "reaction",
      actor: { name: "Mateo Ruiz" },
      title: (
        <>
          <b>Mateo Ruiz</b> liked your comment on <b>Glass tokens</b>
        </>
      ),
      time: daysAgo(1, 9, 5),
      read: true,
    },
    {
      id: "n7",
      kind: "warning",
      title: "Your trial ends in 3 days",
      description: "Pick a plan to keep your workspaces and history.",
      time: daysAgo(3, 8, 0),
      read: true,
    },
    {
      id: "n8",
      kind: "mention",
      actor: { name: "Yuki Tanaka" },
      title: (
        <>
          <b>Yuki Tanaka</b> mentioned you in <b>Design crit notes</b>
        </>
      ),
      time: daysAgo(9, 14, 30),
      read: true,
    },
  ];
}

export const arrivals: Omit<NotificationItem, "id" | "time">[] = [
  {
    kind: "mention",
    actor: { name: "Noor Haddad" },
    title: (
      <>
        <b>Noor Haddad</b> mentioned you in <b>Launch checklist</b>
      </>
    ),
    description: "“Can you own the reduced-motion pass?”",
  },
  {
    kind: "comment",
    actor: { name: "Ada Lovelace" },
    title: (
      <>
        <b>Ada Lovelace</b> replied to your comment
      </>
    ),
    description: "“Numbers check out. 4.5:1 everywhere.”",
  },
  {
    kind: "reaction",
    actor: { name: "Linus Park" },
    title: (
      <>
        <b>Linus Park</b> liked <b>Settings page</b>
      </>
    ),
  },
];

/** The invite row's Accept / Decline buttons, wired to the demo's own state. */
export function withInviteActions(
  items: NotificationItem[],
  answer: (id: string, accepted: boolean) => void,
): NotificationItem[] {
  return items.map((item) =>
    item.kind === "invite" && !item.actions && !item.read
      ? {
          ...item,
          actions: (
            <>
              <Button size="sm" onClick={() => answer(item.id, true)}>
                Accept
              </Button>
              <Button size="sm" variant="glass" onClick={() => answer(item.id, false)}>
                Decline
              </Button>
            </>
          ),
        }
      : item,
  );
}

export const germanLabels: Partial<NotificationCenterLabels> = {
  title: "Mitteilungen",
  markAllRead: "Alle gelesen",
  close: "Mitteilungen schließen",
  tabs: "Mitteilungen filtern",
  all: "Alle",
  unread: "Ungelesen",
  mentions: "Erwähnungen",
  today: "Heute",
  yesterday: "Gestern",
  undated: "Ohne Datum",
  justNow: "Gerade eben",
  unreadState: "ungelesen",
  markRead: "Als gelesen markieren",
  markUnread: "Als ungelesen markieren",
  dismiss: "Entfernen",
  swipeDismiss: "Entfernen",
  dismissed: "Mitteilung entfernt",
  undo: "Rückgängig",
  emptyAllTitle: "Noch keine Mitteilungen",
  emptyAllDescription: "Erwähnungen, Kommentare und Einladungen erscheinen hier.",
  emptyUnreadTitle: "Alles erledigt",
  emptyUnreadDescription: "Seit deinem letzten Besuch ist nichts Neues passiert.",
  emptyMentionsTitle: "Keine Erwähnungen",
  emptyMentionsDescription: "Wenn dich jemand mit @ erwähnt, findest du es hier.",
  announceNew: (n) => (n === 1 ? "1 neue Mitteilung" : `${n} neue Mitteilungen`),
  announceAllRead: "Alle Mitteilungen als gelesen markiert",
  announceDismissed: (shortcut) => `Mitteilung entfernt. ${shortcut} macht es rückgängig.`,
  announceRestored: "Mitteilung wiederhergestellt",
};

export const germanItems = (): NotificationItem[] => [
  {
    id: "d1",
    kind: "mention",
    actor: { name: "Jonas Weber" },
    title: (
      <>
        <b>Jonas Weber</b> hat dich in <b>Sprint-Planung</b> erwähnt
      </>
    ),
    time: minutesAgo(12),
  },
  {
    id: "d2",
    kind: "invite",
    actor: { name: "Lea Schmidt" },
    title: (
      <>
        <b>Lea Schmidt</b> hat dich zu <b>Design-System</b> eingeladen
      </>
    ),
    time: daysAgo(1, 11, 15),
    read: true,
  },
  {
    id: "d3",
    kind: "system",
    title: "Wartung am Sonntag von 02:00 bis 03:00 Uhr",
    time: daysAgo(4, 14, 0),
    read: true,
  },
];
