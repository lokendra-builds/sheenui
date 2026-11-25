"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useIsPresent,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type PanInfo,
} from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";
import { Avatar } from "../../components/avatar/avatar";
import { Button } from "../../components/button/button";
import { KbdShortcut } from "../../components/kbd/kbd";
import { Tooltip } from "../../components/tooltip/tooltip";
import { type NotificationItem, type NotificationCenterLabels } from "./model";
import { Icon, CheckIcon, DotIcon, XIcon, TrashIcon, kindIcons, kindTone } from "./icons";
import { type Dismissed } from "./panel-body";

/* ---------- Row ---------- */

/** The props of one notification row. @internal */
export type RowProps = {
  item: NotificationItem;
  fresh: boolean;
  onSeen: () => void;
  /** "5m", "09:41"…; null when the item's time can't be read (nothing is shown). */
  time: string | null;
  fullTime?: string;
  dateTime?: string;
  L: NotificationCenterLabels;
  onSelect: (item: NotificationItem) => void;
  onToggleRead: (read: boolean) => void;
  onDismiss: (item: NotificationItem, moveFocus: boolean) => void;
};

/** Past this many px (or a quick flick), letting go dismisses. */
export const SWIPE_DISTANCE = 96;
/** The swipe speed, in pixels per second, that dismisses a row. @internal */
export const SWIPE_VELOCITY = 600;

/** One notification row with swipe-to-dismiss and hover actions. @internal */
export function NotificationRow({
  item,
  fresh,
  onSeen,
  time,
  fullTime,
  dateTime,
  L,
  onSelect,
  onToggleRead,
  onDismiss,
}: RowProps) {
  const reduced = useSheenReducedMotion();
  const isPresent = useIsPresent();
  const x = useMotionValue(0);
  const dragControls = useDragControls();
  const dragged = useRef(false);
  const [armed, setArmed] = useState(false);
  const iconScale = useTransform(x, [-SWIPE_DISTANCE - 24, -SWIPE_DISTANCE, -24], [1.2, 1.12, 0.85]);
  const descId = useId();
  const timeId = useId();

  // A one-off glow for rows that arrive while the panel is open.
  const [glow] = useState(fresh);
  useEffect(() => {
    if (fresh) onSeen();
  }, [fresh, onSeen]);

  useMotionValueEvent(x, "change", (value) => {
    const next = value <= -SWIPE_DISTANCE;
    if (next !== armed) {
      setArmed(next);
      // A light tick where supported (Android), so the threshold can be felt.
      if (next && "vibrate" in navigator) navigator.vibrate(8);
    }
  });

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    // Swiping is for fingers. Mouse and pen keep text selection and the hover actions.
    if (event.pointerType !== "touch") return;
    dragged.current = false;
    dragControls.start(event);
  }

  function endDrag(_: unknown, info: PanInfo) {
    if (info.offset.x <= -SWIPE_DISTANCE || info.velocity.x <= -SWIPE_VELOCITY) {
      onDismiss(item, false);
      return;
    }
    animate(x, 0, reduced ? { duration: 0 } : spring.snappy);
  }

  function open(event: MouseEvent) {
    // The click that ends a swipe is not a tap.
    if (dragged.current) {
      event.preventDefault();
      dragged.current = false;
      return;
    }
    onSelect(item);
  }

  const describedBy = [item.description ? descId : null, time ? timeId : null].filter(Boolean).join(" ") || undefined;
  const mainClass = cn(
    "rounded-sheen-sm text-start outline-none",
    // Stretched over the whole row, so the row is one big target; the focus ring draws on that layer.
    "after:absolute after:inset-0 after:content-['']",
    "focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-sheen-focus",
  );
  const mainContent = (
    <>
      {item.title}
      {!item.read && <span className="sr-only">, {L.unreadState}</span>}
    </>
  );

  return (
    <motion.li
      layout={reduced ? false : "position"}
      transition={spring.snappy}
      initial={reduced ? false : { y: -10 }}
      animate={{ y: 0 }}
      data-notification-id={item.id}
      // While it leaves, the row is out of the tab order and ignores clicks.
      inert={!isPresent}
      // Scrolled into view clear of the sticky day heading, and of the undo bar while it shows.
      className="relative scroll-mt-10 overflow-hidden group-data-undo/inbox:scroll-mb-16"
    >
      {/* Swipe panel: sits just past the row's right edge and moves with it, so it never shows through the row. */}
      <motion.div
        aria-hidden
        style={{ x }}
        exit={{
          opacity: 0,
          transition: { duration: reduced ? 0 : duration.exit, ease: ease.exit, delay: reduced ? 0 : 0.16 },
        }}
        className="sheen-fill absolute inset-y-0 left-full flex w-full items-center gap-2 pl-5 text-sm font-semibold text-sheen-accent-fg [background-image:var(--sheen-danger-fill)] forced-colors:bg-[Mark] forced-colors:text-[MarkText]"
      >
        <motion.span style={{ scale: reduced ? 1 : iconScale }} className="flex">
          <TrashIcon className="size-5" />
        </motion.span>
        <span
          className={cn("transition-opacity duration-(--sheen-duration-fast)", armed ? "opacity-100" : "opacity-80")}
        >
          {L.swipeDismiss}
        </span>
      </motion.div>

      <motion.div
        style={{ x }}
        drag="x"
        dragListener={false}
        dragControls={dragControls}
        dragDirectionLock
        dragMomentum={false}
        dragConstraints={{ left: -10_000, right: 0 }}
        dragElastic={{ left: 0, right: 0.06 }}
        onPointerDown={startDrag}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={endDrag}
        exit={{ x: "-100%", transition: reduced ? { duration: 0 } : { duration: duration.base, ease: ease.exit } }}
        data-unread={item.read ? undefined : ""}
        className={cn(
          "group/row relative isolate flex touch-pan-y touch-pinch-zoom gap-3 px-4 py-3",
          "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover",
        )}
      >
        {/* Unread tint on its own layer: it fades (opacity) instead of repainting the row. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 bg-sheen-accent-soft transition-opacity duration-(--sheen-duration-base) ease-sheen-out",
            item.read ? "opacity-0" : "opacity-60",
          )}
        />
        {glow && !reduced && (
          <motion.span
            aria-hidden
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: duration.slower * 3, ease: ease.out, delay: duration.slower }}
            className="pointer-events-none absolute inset-0 -z-10 bg-sheen-accent-soft shadow-[inset_3px_0_0_var(--sheen-accent)]"
          />
        )}

        <ItemAvatar item={item} />

        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className={cn(
              "text-sm leading-snug [overflow-wrap:anywhere] [&_b]:font-semibold [&_b]:text-sheen-fg [&_strong]:font-semibold [&_strong]:text-sheen-fg",
              item.read ? "text-sheen-fg-muted" : "text-sheen-fg",
            )}
          >
            {item.href ? (
              <a
                href={item.href}
                data-slot="notification-main"
                aria-describedby={describedBy}
                aria-keyshortcuts="Delete"
                onClick={open}
                className={mainClass}
              >
                {mainContent}
              </a>
            ) : (
              <button
                type="button"
                data-slot="notification-main"
                aria-describedby={describedBy}
                aria-keyshortcuts="Delete"
                onClick={open}
                className={mainClass}
              >
                {mainContent}
              </button>
            )}
          </p>
          {item.description && (
            <p id={descId} className="mt-1 line-clamp-2 text-sm text-sheen-fg-muted [overflow-wrap:anywhere]">
              {item.description}
            </p>
          )}
          {item.actions && <div className="relative z-10 mt-2.5 flex flex-wrap gap-2">{item.actions}</div>}

          <div className="mt-1.5 flex min-h-7 items-center gap-2">
            {time && (
              <time
                id={timeId}
                dateTime={dateTime}
                title={fullTime}
                className="text-xs text-sheen-fg-muted tabular-nums"
              >
                {time}
              </time>
            )}
            <div
              className={cn(
                "relative z-10 ms-auto -me-1.5 flex items-center gap-0.5 any-pointer-coarse:gap-4",
                // Revealed on hover or focus with a mouse; always there on touch screens.
                "opacity-0 transition-opacity duration-(--sheen-duration-fast) group-hover/row:opacity-100 group-focus-within/row:opacity-100 any-pointer-coarse:opacity-100",
              )}
            >
              <RowAction label={item.read ? L.markUnread : L.markRead} onClick={() => onToggleRead(!item.read)}>
                {item.read ? <DotIcon /> : <CheckIcon />}
              </RowAction>
              <RowAction label={L.dismiss} onClick={() => onDismiss(item, true)}>
                <XIcon />
              </RowAction>
            </div>
          </div>
        </div>

        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full bg-sheen-accent shadow-[0_0_0_3px_var(--sheen-accent-soft)]",
            "transition-[opacity,scale] duration-(--sheen-duration-base) ease-sheen-out forced-colors:bg-[Highlight]",
            item.read ? "opacity-0 motion-ok:scale-50" : "opacity-100",
          )}
        />
      </motion.div>
    </motion.li>
  );
}

/** A small icon button in a notification row. @internal */
export function RowAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip content={label} side="top" delay={500}>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        onClick={onClick}
        className="size-7 px-0 text-sheen-fg-muted hover:text-sheen-fg"
      >
        {children}
      </Button>
    </Tooltip>
  );
}

/** The avatar (or kind icon) of a notification. @internal */
export function ItemAvatar({ item }: { item: NotificationItem }) {
  const kind = item.kind ?? "system";
  if (!item.actor) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full forced-colors:border forced-colors:border-[CanvasText]",
          kindTone[kind],
        )}
      >
        <Icon className="size-5">{kindIcons[kind]}</Icon>
      </span>
    );
  }
  return (
    <span className="relative h-fit shrink-0">
      <Avatar name={item.actor.name} src={item.actor.avatar} size="md" />
      {item.kind && (
        <span
          aria-hidden
          className={cn(
            "absolute -end-1 -bottom-1 flex size-5 items-center justify-center rounded-full ring-2 ring-sheen-surface forced-colors:border forced-colors:border-[CanvasText]",
            kindTone[item.kind],
          )}
        >
          <Icon className="size-3" strokeWidth="2.2">
            {kindIcons[item.kind]}
          </Icon>
        </span>
      )}
    </span>
  );
}

/** The bar that offers to undo the last dismissal. @internal */
export function UndoBar({
  dismissed,
  L,
  onUndo,
  onHover,
  ariaShortcut,
  className,
}: {
  dismissed: Dismissed | null;
  L: NotificationCenterLabels;
  onUndo: () => void;
  onHover: (hovered: boolean) => void;
  /** aria-keyshortcuts value of the undo shortcut. */
  ariaShortcut: string;
  className?: string;
}) {
  const reduced = useSheenReducedMotion();
  return (
    <AnimatePresence>
      {dismissed && (
        <motion.div
          key={dismissed.item.id}
          // Springs up; leaves quicker, without overshoot.
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: duration.fast } : spring.snappy }}
          exit={{ opacity: 0, y: reduced ? 0 : 8, transition: { duration: duration.exit, ease: ease.exit } }}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
          // A solid surface (not glass): it floats over rows, and text under frosted glass would show through.
          className={cn(
            "absolute inset-x-3 z-30 flex items-center justify-between gap-3 rounded-sheen-lg border border-sheen-border bg-sheen-surface py-1.5 ps-4 pe-1.5 text-sm",
            "shadow-[0_1px_2px_var(--sheen-shadow-near),0_12px_32px_-8px_var(--sheen-shadow-far)] forced-colors:border-[CanvasText]",
            className,
          )}
        >
          <span className="min-w-0 truncate text-sheen-fg-muted">{L.dismissed}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            aria-keyshortcuts={ariaShortcut}
            className="text-sheen-accent"
          >
            {L.undo}
            {/* The shortcut, for keyboards (hidden on touch-only screens). */}
            <KbdShortcut keys="mod+z" announce={false} className="hidden pointer-fine:inline-flex" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
