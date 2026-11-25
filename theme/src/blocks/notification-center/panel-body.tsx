"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useLatest } from "../../hooks/use-latest";
import { AnimatePresence } from "motion/react";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingTag, type HeadingLevelOption } from "../../lib/heading";
import { Button } from "../../components/button/button";
import { EmptyState } from "../../components/empty-state/empty-state";
import { useShortcutPlatform } from "../../components/kbd/kbd";
import { formatShortcut, matchesShortcut, toAriaKeyShortcuts } from "../../components/kbd/shortcut";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../../components/tabs/tabs";
import { type NotificationItem, type NotificationTab, type NotificationCenterLabels } from "./model";
import { Icon, CheckAllIcon, ArrowRightIcon, InboxIcon, SparkleCheckIcon, kindIcons } from "./icons";
import { toDate, byNewest, useFormatters, groupLabel, timeLabel, useNow, type Update, isMention } from "./utils";
import { NotificationRow, UndoBar } from "./row";

/* ---------- Panel body (shared by the popover and the inline card) ---------- */

/** The props of the notification panel body. @internal */
export type BodyProps = {
  items: NotificationItem[];
  update: Update;
  tab: NotificationTab;
  onTabChange: (tab: NotificationTab) => void;
  onSelect?: (item: NotificationItem) => void;
  onDismiss?: (item: NotificationItem) => void;
  onRestore?: (item: NotificationItem) => void;
  onDismissCommit?: (item: NotificationItem) => void;
  /** Close the surrounding popover after a notification is opened. */
  onClose?: () => void;
  viewAllHref?: string;
  headerActions?: ReactNode;
  /** Shown last in the header, e.g. the phone sheet's close button. */
  closeButton?: ReactNode;
  now?: Date;
  locale?: string;
  L: NotificationCenterLabels;
  titleId: string;
  headingLevel: HeadingLevelOption;
  /** Ids already shown. The popover keeps this across openings, so arrivals while it was closed glow once. */
  seen?: Set<string>;
};

/** A dismissed notification and its original index, kept so undo can restore it. @internal */
export type Dismissed = { item: NotificationItem; index: number };

/** The filter tabs of the panel, in display order. @internal */
export const TABS: NotificationTab[] = ["all", "unread", "mentions"];

/** How long the undo bar stays once the person has moved on (focus and pointer elsewhere). */
export const UNDO_MS = 6000;

/** The panel body: tabs, grouped list, empty state and undo bar. @internal */
export function PanelBody({
  items,
  update,
  tab,
  onTabChange,
  onSelect,
  onDismiss,
  onRestore,
  onDismissCommit,
  onClose,
  viewAllHref,
  headerActions,
  closeButton,
  now: nowProp,
  locale,
  L,
  titleId,
  headingLevel,
  seen: seenProp,
}: BodyProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const GroupHeading = HEADING_TAGS[headingBelow(headingLevel, 1)];
  const now = useNow(nowProp);
  const f = useFormatters(locale);
  const platform = useShortcutPlatform();
  const bodyRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [dismissed, setDismissed] = useState<Dismissed | null>(null);
  // Read while the Unread tab is open: kept in place until the tab changes, so rows don't jump away under the pointer.
  const [kept, setKept] = useState<ReadonlySet<string>>(() => new Set());
  // Rows not shown before (they arrived since) glow once.
  const [ownSeen] = useState(() => new Set(items.map((i) => i.id)));
  const seen = seenProp ?? ownSeen;

  // Parse every time once per list (null = unreadable).
  const dates = useMemo(() => new Map(items.map((i) => [i.id, toDate(i.time)])), [items]);
  const sorted = useMemo(() => [...items].sort(byNewest(dates)), [items, dates]);
  const unreadCount = items.filter((i) => !i.read).length;
  const unreadMentions = items.filter((i) => isMention(i) && !i.read).length;
  const lists: Record<NotificationTab, NotificationItem[]> = {
    all: sorted,
    unread: sorted.filter((i) => !i.read || kept.has(i.id)),
    mentions: sorted.filter(isMention),
  };
  const undoShortcut = formatShortcut("mod+z", platform);

  const announce = (text: string) => {
    // Clear first so the same message twice is still read out.
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(text));
  };

  // Move focus after a dismissal or undo, once the list has re-rendered.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const root = bodyRef.current;
    const el =
      target === "#tab"
        ? root?.querySelector<HTMLElement>("[role='tab'][aria-selected='true']")
        : root?.querySelector<HTMLElement>(
            `[data-notification-id="${CSS.escape(target)}"] [data-slot="notification-main"]`,
          );
    el?.focus();
  }, [items]);

  /* ----- Undo window ----- */

  // The dismissal Undo can still revert. It is committed (onDismissCommit) when the window closes.
  const pendingCommit = useRef<NotificationItem | null>(null);
  const commitRef = useLatest(onDismissCommit);
  const commitPending = useCallback(() => {
    const item = pendingCommit.current;
    pendingCommit.current = null;
    if (item) commitRef.current?.(item);
  }, [commitRef]);
  // Closing the inbox (unmount) makes the last dismissal final.
  useEffect(() => commitPending, [commitPending]);

  // The bar waits while focus is anywhere in the inbox or the pointer is on the bar, so
  // keyboard and screen reader users get all the time they need; 6s after they move on, it goes.
  const [focusInside, setFocusInside] = useState(false);
  const [barHovered, setBarHovered] = useState(false);
  useEffect(() => {
    if (!dismissed || focusInside || barHovered) return;
    const timer = window.setTimeout(() => {
      setDismissed(null);
      commitPending();
    }, UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [dismissed, focusInside, barHovered, commitPending]);

  function changeTab(next: NotificationTab) {
    setKept(new Set());
    onTabChange(next);
  }

  function setRead(item: NotificationItem, read: boolean) {
    if (read && tab === "unread") setKept((k) => new Set(k).add(item.id));
    update((prev) => prev.map((i) => (i.id === item.id ? { ...i, read } : i)));
  }

  function markAllRead() {
    // Nothing left to mark: the button stays focusable (aria-disabled) so focus never drops to <body>.
    if (unreadCount === 0) return;
    setKept(new Set());
    update((prev) => prev.map((i) => (i.read ? i : { ...i, read: true })));
    announce(L.announceAllRead);
  }

  function dismiss(item: NotificationItem, moveFocus: boolean) {
    if (moveFocus) {
      const visible = lists[tab];
      const at = visible.findIndex((i) => i.id === item.id);
      const neighbour = visible[at + 1] ?? visible[at - 1];
      pendingFocus.current = neighbour ? neighbour.id : "#tab";
    }
    // Only the latest dismissal can be undone: the one before it is final now.
    commitPending();
    pendingCommit.current = item;
    const index = items.findIndex((i) => i.id === item.id);
    update((prev) => prev.filter((i) => i.id !== item.id));
    setDismissed({ item, index });
    announce(L.announceDismissed(undoShortcut.spoken));
    onDismiss?.(item);
  }

  function undo() {
    if (!dismissed) return;
    const { item, index } = dismissed;
    pendingCommit.current = null;
    update((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const next = [...prev];
      next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
      return next;
    });
    pendingFocus.current = item.id;
    setDismissed(null);
    setBarHovered(false);
    announce(L.announceRestored);
    onRestore?.(item);
  }

  function select(item: NotificationItem) {
    if (!item.read) setRead(item, true);
    onSelect?.(item);
    onClose?.();
  }

  /* ⌘Z / Ctrl+Z anywhere in the inbox brings the last dismissal back (there is no text to edit here). */
  function onBodyKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (dismissed && matchesShortcut(event, "mod+z", platform)) {
      event.preventDefault();
      undo();
    }
  }

  /* ↑ ↓ Home End between rows, Delete to dismiss. */
  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.dataset.slot !== "notification-main") return;
    const mains = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[data-slot='notification-main']"),
    ).filter((el) => !el.closest("[inert]"));
    const at = mains.indexOf(target);
    let next: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = mains[Math.min(at + 1, mains.length - 1)];
        break;
      case "ArrowUp":
        next = mains[Math.max(at - 1, 0)];
        break;
      case "Home":
        next = mains[0];
        break;
      case "End":
        next = mains[mains.length - 1];
        break;
      case "Delete":
      case "Backspace": {
        const id = target.closest<HTMLElement>("[data-notification-id]")?.dataset.notificationId;
        const item = items.find((i) => i.id === id);
        if (item) {
          event.preventDefault();
          dismiss(item, true);
        }
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    if (!next) return;
    next.focus({ preventScroll: true });
    // Bring the whole row (and its row-wide focus ring) into view, clear of the sticky day heading.
    next.closest("li")?.scrollIntoView({ block: "nearest" });
  }

  const empty: Record<
    NotificationTab,
    { icon: ReactNode; title: string; description: string; tone: "accent" | "success" | "neutral" }
  > = {
    all: {
      icon: <InboxIcon className="size-6" />,
      title: L.emptyAllTitle,
      description: L.emptyAllDescription,
      tone: "neutral",
    },
    unread: {
      icon: <SparkleCheckIcon className="size-6" />,
      title: L.emptyUnreadTitle,
      description: L.emptyUnreadDescription,
      tone: "success",
    },
    mentions: {
      icon: <Icon className="size-6">{kindIcons.mention}</Icon>,
      title: L.emptyMentionsTitle,
      description: L.emptyMentionsDescription,
      tone: "accent",
    },
  };

  return (
    <div
      ref={bodyRef}
      // Delegates the inbox's keyboard shortcuts from its focusable children; the wrapper has no role of its own.
      role="presentation"
      data-undo={dismissed ? "" : undefined}
      onKeyDown={onBodyKeyDown}
      onFocus={() => setFocusInside(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
      }}
      className="group/inbox relative flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <Heading id={titleId} className="min-w-0 truncate text-base font-semibold tracking-tight">
          {L.title}
        </Heading>
        <div className="-me-1.5 flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            // aria-disabled, not disabled: pressing it moves nothing, and focus stays on it.
            aria-disabled={unreadCount === 0 || undefined}
            data-unavailable={unreadCount === 0 ? "" : undefined}
            onClick={markAllRead}
            leading={<CheckAllIcon />}
            className="text-sheen-accent data-unavailable:pointer-events-none data-unavailable:opacity-55"
          >
            {L.markAllRead}
          </Button>
          {headerActions}
          {closeButton}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => changeTab(value as NotificationTab)} className="min-h-0 flex-1 gap-0">
        <div className="px-4 pb-3">
          <TabsList aria-label={L.tabs}>
            {TABS.map((t) => {
              const count = t === "unread" ? unreadCount : t === "mentions" ? unreadMentions : 0;
              return (
                <TabsTab key={t} value={t} className="min-w-11 px-3">
                  {L[t]}
                  {count > 0 && (
                    // Tint over a near-opaque surface: accent text keeps AA on the glass track and on the active pill.
                    <span className="flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-sheen-full bg-sheen-surface/90 [background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))] px-1 text-2xs font-semibold text-sheen-accent tabular-nums forced-colors:border forced-colors:border-[CanvasText]">
                      {count}
                    </span>
                  )}
                </TabsTab>
              );
            })}
          </TabsList>
        </div>
        <div aria-hidden className="h-px shrink-0 bg-sheen-border" />

        {TABS.map((t) => {
          const list = lists[t];
          const groups: { label: string; items: NotificationItem[] }[] = [];
          for (const item of list) {
            const label = groupLabel(dates.get(item.id) ?? null, now, f, L);
            const last = groups[groups.length - 1];
            if (last?.label === label) last.items.push(item);
            else groups.push({ label, items: [item] });
          }
          return (
            <TabsPanel
              key={t}
              value={t}
              onKeyDown={onListKeyDown}
              // With rows to focus, the panel itself needn't be a tab stop (it stays one when empty).
              tabIndex={list.length > 0 ? -1 : 0}
              className={cn(
                "relative min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-none [scrollbar-width:thin] focus-visible:-outline-offset-2",
                // While the undo bar floats over the bottom, the last row can still scroll clear of it.
                "group-data-undo/inbox:pb-16",
              )}
            >
              {list.length === 0 ? (
                <EmptyState
                  role="status"
                  icon={empty[t].icon}
                  title={empty[t].title}
                  description={empty[t].description}
                  tone={empty[t].tone}
                  headingLevel={false}
                  className="h-full min-h-56 px-6 py-8"
                />
              ) : (
                groups.map((group) => (
                  <DayGroup key={group.label} label={group.label} Heading={GroupHeading}>
                    <AnimatePresence initial={false}>
                      {group.items.map((item) => {
                        const date = dates.get(item.id) ?? null;
                        return (
                          <NotificationRow
                            key={item.id}
                            item={item}
                            fresh={!seen.has(item.id)}
                            onSeen={() => seen.add(item.id)}
                            time={date ? timeLabel(date, now, f, L) : null}
                            fullTime={date ? f.full.format(date) : undefined}
                            dateTime={date?.toISOString()}
                            L={L}
                            onSelect={select}
                            onToggleRead={(read) => setRead(item, read)}
                            onDismiss={dismiss}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </DayGroup>
                ))
              )}
            </TabsPanel>
          );
        })}
      </Tabs>

      {viewAllHref && (
        <div className="shrink-0 border-t border-sheen-border p-2">
          <Button
            variant="ghost"
            fullWidth
            // eslint-disable-next-line jsx-a11y/anchor-has-content -- Button injects its children (the label) into the anchor given to `render`
            render={<a href={viewAllHref} />}
            trailing={<ArrowRightIcon />}
            className="text-sheen-accent"
          >
            {L.viewAll}
          </Button>
        </div>
      )}

      <UndoBar
        dismissed={dismissed}
        L={L}
        onUndo={undo}
        onHover={setBarHovered}
        ariaShortcut={toAriaKeyShortcuts("mod+z", platform)}
        className={viewAllHref ? "bottom-[4.25rem]" : "bottom-3"}
      />

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

/** One day of notifications. A labelled group, not a <section>: a landmark per day would flood the landmark list. */
export function DayGroup({ label, Heading, children }: { label: string; Heading: HeadingTag; children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <Heading
        id={id}
        // Sticky over the scrolling rows: a near-opaque surface, with no blur of its own. It sits inside a
        // glass panel (already a backdrop root) and one blur per group header would blow the glass budget.
        className="sticky top-0 z-20 bg-sheen-surface/95 px-4 pt-3 pb-1.5 text-2xs font-semibold tracking-[0.12em] text-sheen-fg-subtle uppercase"
      >
        {label}
      </Heading>
      <ul className="flex flex-col pb-1">{children}</ul>
    </div>
  );
}
