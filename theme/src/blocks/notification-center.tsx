"use client";

import { useCallback, useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { AnimatePresence, animate, motion } from "motion/react";

import { cn } from "../lib/cn";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { duration, ease, spring } from "../motion/tokens";
import { Button } from "../components/button/button";
import { TooltipProvider } from "../components/tooltip/tooltip";

import {
  type NotificationTab,
  defaultNotificationCenterLabels,
  type NotificationPanelProps,
  type NotificationCenterProps,
} from "./notification-center/model";
import { BellIcon, XIcon } from "./notification-center/icons";
import { settleNestedGlass, useNotificationList } from "./notification-center/utils";
import { PanelBody } from "./notification-center/panel-body";

export {
  type NotificationKind,
  type NotificationItem,
  type NotificationTab,
  type NotificationCenterLabels,
  defaultNotificationCenterLabels,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- deprecated alias, kept for one release
  defaultNotificationLabels,
  type NotificationPanelProps,
  type NotificationCenterProps,
} from "./notification-center/model";

/**
 * Notification center: a bell with an unread count that opens a glass inbox.
 *
 *   <NotificationCenter defaultNotifications={items} onSelect={(n) => router.push(n.href)} />
 *
 * - Tabs: All / Unread / Mentions, each grouped by day (Today, Yesterday, weekday, date),
 *   with sticky day headings and relative times that keep themselves fresh.
 * - Every row: avatar with a small "what happened" badge, the sentence, an optional quote and
 *   actions (Accept / Decline …), the time, and hover / focus actions: mark (un)read, dismiss.
 * - Touch: swipe a row left to dismiss it (a red "Dismiss" panel follows your finger; a light
 *   haptic tick when letting go would dismiss). The dismiss button stays as the
 *   single-pointer alternative. Every dismissal can be undone for a few seconds.
 * - Keyboard: Tab into the list, ↑ ↓ Home End move between notifications, Enter opens one,
 *   Delete dismisses it (focus moves to the next one), ⌘Z / Ctrl+Z undoes a dismissal,
 *   Escape closes the panel.
 * - Undo: stays up while focus is in the inbox (or the pointer is on the bar), and leaves
 *   6s after you move on. `onDismiss` fires at once (optimistic); `onRestore` when undone;
 *   `onDismissCommit` once Undo is gone for good (delete on the server there).
 * - Screen readers: the bell says "Notifications, 3 unread"; new arrivals, "all read",
 *   dismissals (with the undo shortcut) and undo are announced politely.
 * - Phones (< 40rem): the inbox docks to the bottom of the screen as a sheet over a scrim,
 *   wherever the bell is, so it always gets most of the screen.
 *
 * Motion: the glass panel itself scales and fades from the bell (a sheet slides up on phones;
 * shorter exit, no overshoot). Nested glass (tab track, avatars) drops its blur while the
 * panel fades, so no backdrop-filter ever sits inside a fading element. The bell rings and
 * the count pops when something new arrives; a dismissed row slides out and the rest glide
 * up (transforms only: rows hold glass avatars, so nothing that wraps them ever fades).
 * Reduced motion: everything changes at once; swiping still tracks the finger (that is
 * direct manipulation, not animation).
 *
 * Also exported: NotificationPanel, the same inbox as an inline glass card (for a page, a
 * drawer or a dashboard column).
 */

/* ---------- Inline panel ---------- */

/**
 * The inbox as an inline glass card (no bell): for a page, a drawer or a dashboard column.
 *
 * Props (see `NotificationPanelProps`): the shared inbox props (`notifications` / `defaultNotifications` /
 * `onNotificationsChange`, `onSelect`, `onDismiss`, `onRestore`, `onDismissCommit`, `viewAllHref`,
 * `headerActions`, `defaultTab` (`"all"`), `now`, `locale`, `labels`, `headingLevel` (`2`)) and
 * `className` (set the height; default 32rem).
 * Keyboard: Tab enters the tabs and then the list; Up, Down, Home and End move between notifications,
 * Enter opens one, Delete dismisses it (focus moves on) and Ctrl or Cmd + Z undoes a dismissal.
 * Accessibility: dismissals (with the undo shortcut), arrivals and "all read" are announced politely;
 * swipe-to-dismiss on touch always has the dismiss button as an alternative.
 * Glass and motion: one glass card (one backdrop blur); rows slide out on dismiss and the undo bar rises
 * in. Reduced motion removes the movement.
 *
 * @example
 * ```tsx
 * import { NotificationPanel, type NotificationItem } from "@sheenui/theme";
 *
 * const items: NotificationItem[] = [{ id: "1", kind: "comment", title: "Ada commented on your design", time: new Date() }];
 *
 * export function Example() {
 *   return <NotificationPanel defaultNotifications={items} className="h-[28rem]" onSelect={(n) => console.log(n.id)} />;
 * }
 * ```
 *
 * @see /blocks/notification-center
 */
export function NotificationPanel({
  notifications,
  defaultNotifications,
  onNotificationsChange,
  onSelect,
  onDismiss,
  onRestore,
  onDismissCommit,
  viewAllHref,
  headerActions,
  defaultTab = "all",
  now,
  locale,
  labels,
  headingLevel = 2,
  className,
}: NotificationPanelProps) {
  const L = { ...defaultNotificationCenterLabels, ...labels };
  const titleId = useId();
  const [items, update] = useNotificationList(notifications, defaultNotifications, onNotificationsChange);
  const [tab, setTab] = useState<NotificationTab>(defaultTab);

  return (
    <TooltipProvider delay={500}>
      <section
        role="group"
        aria-labelledby={titleId}
        data-slot="notification-panel"
        className={cn(
          "glass-2 flex h-[32rem] w-full max-w-md min-w-0 flex-col overflow-hidden rounded-sheen-xl",
          className,
        )}
      >
        <PanelBody
          items={items}
          update={update}
          tab={tab}
          onTabChange={setTab}
          onSelect={onSelect}
          onDismiss={onDismiss}
          onRestore={onRestore}
          onDismissCommit={onDismissCommit}
          viewAllHref={viewAllHref}
          headerActions={headerActions}
          now={now}
          locale={locale}
          L={L}
          titleId={titleId}
          headingLevel={headingLevel}
        />
      </section>
    </TooltipProvider>
  );
}

/* ---------- Bell + popover ---------- */

/**
 * Props (see `NotificationCenterProps`): the shared inbox props (`notifications` / `defaultNotifications`
 * / `onNotificationsChange`, `onSelect`, `onDismiss`, `onRestore`, `onDismissCommit`, `viewAllHref`,
 * `headerActions`, `defaultTab` (`"all"`), `now`, `locale`, `labels`, `headingLevel` (`2`)) plus `open` /
 * `defaultOpen` (`false`) / `onOpenChange`, `side` (`"bottom"`), `align` (`"end"`), `max` (`99`),
 * `className` (the bell) and `panelClassName`.
 * Keyboard: the bell is a button (Enter or Space opens the panel, Escape closes it and returns focus);
 * inside, the same keys as `NotificationPanel` apply.
 * Accessibility: the bell is named "Notifications, 3 unread" and the count is text; the panel is a
 * labelled popover.
 * Glass and motion: the bell rings when something new arrives (not under reduced motion); the panel is
 * one portaled glass card.
 *
 * @example
 * ```tsx
 * import { NotificationCenter, type NotificationItem } from "@sheenui/theme";
 *
 * const items: NotificationItem[] = [{ id: "1", kind: "mention", title: "Grace mentioned you", time: new Date() }];
 *
 * export function Example() {
 *   return <NotificationCenter defaultNotifications={items} onSelect={(n) => window.location.assign(`/inbox/${n.id}`)} />;
 * }
 * ```
 *
 * @see /blocks/notification-center
 */
export function NotificationCenter({
  notifications,
  defaultNotifications,
  onNotificationsChange,
  onSelect,
  onDismiss,
  onRestore,
  onDismissCommit,
  viewAllHref,
  headerActions,
  defaultTab = "all",
  now,
  locale,
  labels,
  headingLevel = 2,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "end",
  max = 99,
  className,
  panelClassName,
}: NotificationCenterProps) {
  const L = { ...defaultNotificationCenterLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const titleId = useId();
  const [items, update] = useNotificationList(notifications, defaultNotifications, onNotificationsChange);
  const [tab, setTab] = useState<NotificationTab>(defaultTab);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const popupRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLSpanElement>(null);
  // What the person has already seen in the panel; what arrives while it is closed glows on the next open.
  const [seen] = useState(() => new Set(items.map((i) => i.id)));

  const unread = items.filter((i) => !i.read).length;
  const count = unread > max ? `${max}+` : String(unread);

  const setOpen = useCallback(
    (next: boolean) => {
      // Closing: the panel fades out, so its nested glass drops its blur first.
      if (!next) settleNestedGlass(popupRef.current, true);
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  // Opening: the popup mounts with its nested glass unblurred (this runs before its first
  // frame, with the whole subtree in place); onOpenChangeComplete restores it once the fade is done.
  const popupCallbackRef = useCallback((node: HTMLDivElement | null) => {
    popupRef.current = node;
    if (node) settleNestedGlass(node, true);
  }, []);

  // Something new arrived: ring the bell and tell screen readers (not on first render).
  // Every id ever listed is remembered, so a notification brought back by Undo is not "new".
  const [announcement, setAnnouncement] = useState("");
  const known = useRef<Set<string> | null>(null);
  known.current ??= new Set(items.map((i) => i.id));
  // The wording is read when new items arrive: labels are rebuilt each render and must not re-run this.
  const announceNew = useEffectEvent((count: number) => setAnnouncement(L.announceNew(count)));
  useEffect(() => {
    const ids = known.current;
    if (!ids) return;
    const arrived = items.filter((i) => !ids.has(i.id) && !i.read).length;
    for (const item of items) ids.add(item.id);
    if (arrived === 0) return;
    announceNew(arrived);
    if (!reduced && bellRef.current) {
      animate(
        bellRef.current,
        { rotate: [0, 18, -14, 10, -6, 3, 0] },
        { duration: duration.slower * 1.3, ease: ease.inOut },
      );
    }
  }, [items, reduced]);

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen) settleNestedGlass(popupRef.current, false);
      }}
    >
      <BasePopover.Trigger
        render={<Button variant="glass" size="icon" />}
        aria-label={L.trigger(unread)}
        className={cn("relative data-popup-open:bg-sheen-accent-soft data-popup-open:text-sheen-accent", className)}
      >
        <span ref={bellRef} className="flex origin-[50%_10%]">
          <BellIcon className="size-5" />
        </span>
        <AnimatePresence initial={false}>
          {unread > 0 && (
            <motion.span
              key="badge"
              aria-hidden
              initial={reduced ? false : { scale: 0 }}
              animate={{ scale: 1, transition: reduced ? { duration: 0 } : spring.bouncy }}
              exit={{ scale: 0, transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit } }}
              className={cn(
                "sheen-fill pointer-events-none absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center rounded-sheen-full px-1.5",
                "text-2xs font-semibold text-sheen-accent-fg tabular-nums [background-image:var(--sheen-accent-fill)]",
                "shadow-[0_0_0_2px_var(--sheen-bg),0_4px_12px_-4px_var(--sheen-accent-glow)]",
                "forced-colors:border forced-colors:border-[CanvasText]",
              )}
            >
              {/* The number pops on change. */}
              <motion.span
                key={count}
                initial={reduced ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={spring.bouncy}
              >
                {count}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </BasePopover.Trigger>
      {/* Outside the button: a live region inside a named button is not reliably read. */}
      <span role="status" className="sr-only">
        {announcement}
      </span>

      <BasePopover.Portal>
        {/* Phones: the sheet sits over a scrim; tapping it closes the inbox. */}
        <BasePopover.Backdrop
          className={cn(
            "fixed inset-0 z-50 hidden bg-sheen-scrim max-sm:block",
            "transition-opacity duration-(--sheen-duration-base) ease-sheen-out data-starting-style:opacity-0",
            "data-ending-style:opacity-0 data-ending-style:duration-(--sheen-duration-exit) data-ending-style:ease-sheen-exit",
          )}
        />
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={10}
          collisionPadding={8}
          className={cn(
            "z-50",
            // Phones: dock to the bottom of the screen as a sheet, wherever the bell happens to be.
            "max-sm:fixed! max-sm:inset-x-0! max-sm:top-auto! max-sm:bottom-0! max-sm:transform-none!",
          )}
        >
          <BasePopover.Popup
            ref={popupCallbackRef}
            aria-labelledby={titleId}
            data-slot="notification-center"
            // Keyboard: land on the active tab (not on "Mark all as read", one Enter away from a bulk action).
            initialFocus={(type) => {
              if (type === "touch") return true;
              return popupRef.current?.querySelector<HTMLElement>("[role='tab'][aria-selected='true']") ?? true;
            }}
            className={cn(
              "glass-3 flex flex-col overflow-hidden rounded-sheen-xl outline-none",
              "[transition:opacity_var(--sheen-duration-fast)_var(--sheen-ease-out),scale_var(--sheen-duration-snappy)_var(--sheen-ease-snappy),translate_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)]",
              "data-starting-style:opacity-0 data-ending-style:opacity-0",
              "data-ending-style:[transition:opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit),scale_var(--sheen-duration-exit)_var(--sheen-ease-exit),translate_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
              // From the bell: grows out of it, settles with a spring.
              "sm:h-[min(34rem,var(--available-height))] sm:w-[min(25rem,calc(100vw-1rem))] sm:origin-(--transform-origin)",
              "motion-ok:sm:data-starting-style:scale-[0.96] motion-ok:sm:data-ending-style:scale-[0.98]",
              // Phones: a bottom sheet that slides up (no overshoot, so no gap ever opens under it).
              "max-sm:h-[min(42rem,calc(100dvh-3.5rem))] max-sm:w-full max-sm:rounded-b-none max-sm:border-b-0 max-sm:pb-[env(safe-area-inset-bottom)]",
              "motion-ok:max-sm:data-starting-style:translate-y-16 motion-ok:max-sm:data-ending-style:translate-y-10",
              panelClassName,
            )}
          >
            <TooltipProvider delay={500}>
              <PanelBody
                items={items}
                update={update}
                tab={tab}
                onTabChange={setTab}
                onSelect={onSelect}
                onDismiss={onDismiss}
                onRestore={onRestore}
                onDismissCommit={onDismissCommit}
                onClose={() => setOpen(false)}
                seen={seen}
                viewAllHref={viewAllHref}
                headerActions={headerActions}
                closeButton={
                  // Phones only: a sheet needs a visible way out (Escape and the scrim work too).
                  <BasePopover.Close
                    render={<Button variant="ghost" size="icon" aria-label={L.close} />}
                    className="size-8 text-sheen-fg-muted hover:text-sheen-fg sm:hidden"
                  >
                    <XIcon />
                  </BasePopover.Close>
                }
                now={now}
                locale={locale}
                L={L}
                titleId={titleId}
                headingLevel={headingLevel}
              />
            </TooltipProvider>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
