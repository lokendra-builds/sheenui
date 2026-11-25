"use client";

import {
  memo,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion } from "motion/react";

import { cn } from "../../../lib/cn";
import { spring } from "../../../motion/tokens";
import { MenuTrigger, createMenuHandle } from "../../menu/menu";
import { ChatAvatar, DeliveryStatus, TypingDots, UnreadBadge, chatAppearReduced } from "../chat-parts";
import {
  conversationTitle,
  firstName,
  formatListTime,
  isGroup,
  messageSummary,
  otherMembers,
  toDate,
  type ParticipantMap,
} from "../format";
import { type ChatLabels } from "../labels";
import { Highlight } from "../message-parts";
import type { ChatConversation, ChatConversationAction } from "../types";
import { ArchiveIcon, BellIcon, BellOffIcon, MoreIcon, PinIcon, PinOffIcon, UnarchiveIcon } from "../icons";
import { isRtlAt } from "../../../hooks/use-direction";
import { type Item, OVERSCAN, SWIPE_ACTION_WIDTH } from "./model";

/* ---------- Windowing ---------- */

/*
 * The rows in view (plus overscan), and the focused row when it is scrolled away (so focus is
 * never lost). It owns the scroll position, so scrolling re-renders only this, never the
 * heading, search or filters above (whose sliding indicator would measure layout every time),
 * and only when the window moves by half the overscan (4 rows). One sorted array: a row that
 * moves between "kept" and "in view" stays the same node (from two arrays React would remount
 * it and drop its focus).
 */
/** Renders the visible window of the virtual conversation list, keeping the focused row mounted. @internal */
export function ListWindow({
  items,
  offsets,
  rowHeight,
  keepIndex,
  scroller,
  renderItem,
  afterRender,
}: {
  items: Item[];
  offsets: number[];
  rowHeight: number;
  /** The focused row's index in `items` (-1: none). */
  keepIndex: number;
  /** The scrolling element (null until it is attached, then the effect below binds to it). */
  scroller: HTMLDivElement | null;
  renderItem: (item: Item, index: number) => ReactNode;
  /** Runs after each render of the window (focus a row that just came into the page). */
  afterRender: () => void;
}) {
  const [viewport, setViewport] = useState({ top: 0, height: 800 });
  useLayoutEffect(() => afterRender());
  useLayoutEffect(() => {
    const el = scroller;
    if (!el) return;
    const chunk = (OVERSCAN / 2) * rowHeight;
    let height = el.clientHeight;
    let idle = 0;
    // Layout is read outside React's render (never inside a state updater).
    const update = () => {
      const top = Math.floor(el.scrollTop / chunk) * chunk;
      setViewport((v) => (v.top === top && v.height === height ? v : { top, height }));
    };
    const onScroll = () => {
      update();
      // While it scrolls, rows passing under a still pointer don't light up (no repaint, no hit-testing per row).
      el.setAttribute("data-scrolling", "");
      window.clearTimeout(idle);
      idle = window.setTimeout(() => el.removeAttribute("data-scrolling"), 120);
    };
    update();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            height = el.clientHeight;
            update();
          });
    observer?.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
      el.removeAttribute("data-scrolling");
    };
  }, [scroller, rowHeight]);

  const top = viewport.top - OVERSCAN * rowHeight;
  const bottom = viewport.top + viewport.height + OVERSCAN * rowHeight;
  let start = 0;
  while (start < items.length && (offsets[start + 1] ?? 0) < top) start++;
  let end = start;
  while (end < items.length && (offsets[end] ?? 0) < bottom) end++;

  const indices: number[] = [];
  if (keepIndex >= 0 && keepIndex < start) indices.push(keepIndex);
  for (let i = start; i < end; i++) indices.push(i);
  if (keepIndex >= end) indices.push(keepIndex);
  return (
    <>
      {indices.map((i) => {
        const item = items[i];
        return item ? renderItem(item, i) : null;
      })}
    </>
  );
}

/* ---------- Row ---------- */

/** The row action callbacks: select, pin, mute, archive and delete. @internal */
export type RowActions = {
  select: (conversation: ChatConversation, via: "pointer" | "keyboard") => void;
  focus: (index: number) => void;
  swipe: (conversationId: string, open: boolean) => void;
  action: (conversation: ChatConversation, action: ChatConversationAction) => void;
  keyDown: (event: KeyboardEvent<HTMLDivElement>, index: number) => void;
};

/** The props of one conversation row. @internal */
export type ConversationRowProps = {
  conversation: ChatConversation;
  index: number;
  count: number;
  domId: string;
  selected: boolean;
  tabbable: boolean;
  swiped: boolean;
  swipeEnabled: boolean;
  people: ParticipantMap;
  currentUserId: string;
  query: string;
  now: Date;
  locale?: string;
  labels: ChatLabels;
  density: "comfortable" | "compact";
  reduced: boolean;
  selectionId: string;
  actions: RowActions;
  rowMenu: ReturnType<typeof createMenuHandle<string>> | null;
  hasActions: boolean;
  /** Windowed: the row's offset from the top of the list (it is absolutely positioned). */
  windowTop?: number;
};

/** One conversation row with swipe actions and a context menu. @internal */
export const ConversationRow = memo(function ConversationRow({
  conversation: c,
  index,
  count,
  domId,
  selected,
  tabbable,
  swiped,
  swipeEnabled,
  people,
  currentUserId,
  query,
  now,
  locale,
  labels: L,
  density,
  reduced,
  selectionId,
  actions,
  rowMenu,
  hasActions,
  windowTop,
}: ConversationRowProps) {
  const onSwipe = (open: boolean) => actions.swipe(c.id, open);
  const onAction = hasActions ? (action: ChatConversationAction) => actions.action(c, action) : undefined;
  const others = otherMembers(c, people, currentUserId);
  const group = isGroup(c);
  const title = conversationTitle(c, people, currentUserId);
  const direct = group ? undefined : others[0];
  const unread = c.unreadCount ?? 0;
  const last = c.lastMessage;
  const lastDate = toDate(last?.createdAt ?? c.updatedAt);
  const time = lastDate ? formatListTime(lastDate, now, locale, L.justNow) : null;
  const typing = (c.typingIds ?? []).filter((t) => t !== currentUserId);
  const ownLast = last?.senderId === currentUserId;
  const compact = density === "compact";

  /* Preview line */
  let preview: ReactNode;
  if (typing.length) {
    const names = typing.map((t) => firstName(people.get(t)?.name ?? ""));
    preview = (
      <span className="flex min-w-0 items-center gap-1.5 font-medium text-sheen-accent">
        <span className="truncate">{L.typing(names, group)}</span>
        <TypingDots className="shrink-0" />
      </span>
    );
  } else if (c.draft) {
    preview = (
      <span dir="auto" className="min-w-0 truncate text-start">
        <span className="font-semibold text-sheen-danger-text">{L.draftPrefix} </span>
        <Highlight text={c.draft} query={query} />
      </span>
    );
  } else if (last) {
    const summary = last.kind === "system" ? (last.text ?? "") : messageSummary(last, L, ownLast);
    const prefix =
      last.kind === "system"
        ? ""
        : ownLast
          ? L.youPrefix
          : group
            ? `${firstName(people.get(last.senderId)?.name ?? "")}:`
            : "";
    const ticks = ownLast && !last.deleted && last.kind !== "system";
    preview = (
      <span className="flex min-w-0 items-center gap-1">
        {ticks && <DeliveryStatus status={last.status ?? "sent"} labels={L} spoken={false} />}
        <span dir="auto" className={cn("min-w-0 truncate text-start", last.deleted && "italic")}>
          {prefix && <span className={cn(ownLast ? "" : "font-medium text-sheen-fg")}>{prefix} </span>}
          <Highlight text={summary} query={query} />
          {/* Ticks come first on screen (WhatsApp); spoken after the text: "You: see you there, Read". */}
          {ticks && <span className="sr-only">, {L.status[last.status ?? "sent"]}</span>}
        </span>
      </span>
    );
  }

  /* Swipe: drag the row towards the start to reveal its actions. */
  const rowRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; dx: number; active: boolean; pointerId: number; base: number } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const actionsWidth = SWIPE_ACTION_WIDTH * 3;
  const openOffset = -actionsWidth;

  const setOffset = (px: number, animate: boolean) => {
    const el = rowRef.current;
    if (!el) return;
    const rtl = isRtlAt(el);
    el.style.transition =
      animate && !reduced ? "transform var(--sheen-duration-smooth) var(--sheen-ease-smooth)" : "none";
    el.style.transform = px === 0 ? "" : `translateX(${rtl ? -px : px}px)`;
  };

  // Opened / closed from outside (another row, a tap elsewhere). Not on mount: a row that mounts
  // closed has nothing to move (and reading its direction would force a style pass per row while
  // a long list scrolls).
  const wasSwiped = useRef(swiped);
  // Reads the live drag and offset when the outside state changes: a changed offset mid-drag must not re-run it.
  const followOutside = useEffectEvent((open: boolean) => {
    if (!drag.current?.active) setOffset(open ? openOffset : 0, true);
  });
  useEffect(() => {
    if (wasSwiped.current === swiped) return;
    wasSwiped.current = swiped;
    followOutside(swiped);
  }, [swiped]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeEnabled || e.pointerType !== "touch") return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      active: false,
      pointerId: e.pointerId,
      base: swiped ? openOffset : 0,
    };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    const rtl = isRtlAt(e.currentTarget);
    const raw = (e.clientX - d.x) * (rtl ? -1 : 1);
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(raw)) {
        drag.current = null; // a scroll
        return;
      }
      if (Math.abs(raw) < 8) return;
      d.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.parentElement?.setAttribute("data-dragging", "");
    }
    // Resist past the open position (rubber band) and past the closed one.
    let next = d.base + raw;
    if (next > 0) next = next * 0.25;
    if (next < openOffset) next = openOffset + (next - openOffset) * 0.35;
    d.dx = next;
    setOffset(next, false);
  };
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.active || e.pointerId !== d.pointerId) return;
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    const open = d.dx < openOffset / 2.5;
    setOffset(open ? openOffset : 0, true);
    onSwipe(open);
    const wrapper = e.currentTarget.parentElement;
    window.setTimeout(() => wrapper?.removeAttribute("data-dragging"), open ? 0 : 400);
  };

  const timeTone = unread > 0 && !c.muted ? "font-semibold text-sheen-accent" : "text-sheen-fg-muted";

  return (
    <div
      role="none"
      data-conversation-row={c.id}
      style={
        windowTop === undefined
          ? undefined
          : { position: "absolute", top: windowTop, insetInline: 0, height: compact ? 64 : 72 }
      }
      className={cn("group/row relative isolate overflow-hidden", compact ? "h-16" : "h-[72px]")}
    >
      {/* Swipe actions, under the row */}
      {swipeEnabled && onAction && (
        <div
          aria-hidden
          className={cn("absolute inset-y-0 end-0 flex", !swiped && "invisible group-data-[dragging]/row:visible")}
          data-swipe-actions=""
        >
          {[
            {
              key: "pin",
              label: c.pinned ? L.unpin : L.pin,
              icon: c.pinned ? <PinOffIcon /> : <PinIcon />,
              action: (c.pinned ? "unpin" : "pin") as ChatConversationAction,
              tone: "bg-(--sheen-violet-700)",
            },
            {
              key: "mute",
              label: c.muted ? L.unmute : L.mute,
              icon: c.muted ? <BellIcon /> : <BellOffIcon />,
              action: (c.muted ? "unmute" : "mute") as ChatConversationAction,
              tone: "bg-(--sheen-amber-700)",
            },
            {
              key: "archive",
              label: c.archived ? L.unarchive : L.archive,
              icon: c.archived ? <UnarchiveIcon /> : <ArchiveIcon />,
              action: (c.archived ? "unarchive" : "archive") as ChatConversationAction,
              tone: "bg-(--sheen-ink-600)",
            },
          ].map((a) => (
            <button
              key={a.key}
              type="button"
              tabIndex={-1}
              onClick={() => {
                onAction(a.action);
                onSwipe(false);
              }}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-2xs font-semibold text-sheen-accent-fg [&_svg]:size-5",
                a.tone,
                "forced-colors:border forced-colors:border-[ButtonText]",
              )}
              style={{ width: SWIPE_ACTION_WIDTH }}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={rowRef}
        id={domId}
        role="option"
        aria-selected={selected}
        aria-posinset={index + 1}
        aria-setsize={count}
        tabIndex={tabbable ? 0 : -1}
        onClick={() => {
          if (suppressClick.current) return;
          if (swiped) {
            onSwipe(false);
            return;
          }
          actions.select(c, "pointer");
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Escape" && swiped) {
            onSwipe(false);
            return;
          }
          actions.keyDown(e, index);
        }}
        onFocus={(e) => e.target === e.currentTarget && actions.focus(index)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className={cn(
          // Its own layer above the swipe actions (its tints sit inside it).
          "relative isolate z-[1] flex h-full cursor-pointer items-center gap-3 px-3 outline-none select-none @sm:px-4",
          "[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] touch-pan-y touch-pinch-zoom",
          "focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-x-1.5 focus-visible:after:inset-y-1 focus-visible:after:rounded-sheen-md focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-sheen-focus",
          "forced-colors:aria-selected:outline-2 forced-colors:aria-selected:-outline-offset-4 forced-colors:aria-selected:outline-[Highlight]",
        )}
      >
        {/* Surface: solid while swiping (covers the actions), hover / selected tints */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-1.5 inset-y-1 -z-10 rounded-sheen-md transition-[background-color] duration-(--sheen-duration-fast)",
            !selected && "group-hover/row:bg-sheen-hover",
          )}
        />
        {swipeEnabled && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 -z-20 bg-(--sheen-surface-solid)",
              !swiped && "opacity-0 group-data-[dragging]/row:opacity-100",
            )}
          />
        )}
        {selected && (
          <motion.span
            aria-hidden
            layoutId={reduced ? undefined : selectionId}
            transition={spring.snappy}
            className="absolute inset-x-1.5 inset-y-1 -z-10 rounded-sheen-md border border-sheen-accent-border bg-sheen-accent-soft"
          />
        )}

        <ChatAvatar
          people={others.slice(0, 2)}
          src={c.avatarUrl}
          name={title}
          size={compact ? "md" : "lg"}
          presence={direct?.presence}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              dir="auto"
              className={cn(
                "min-w-0 flex-1 truncate text-start text-[0.9375rem] leading-5",
                unread > 0 ? "font-semibold text-sheen-fg" : "font-medium text-sheen-fg",
              )}
            >
              <Highlight text={title} query={query} />
            </span>
            {c.muted && (
              <span className="shrink-0 text-sheen-fg-subtle">
                <BellOffIcon className="size-3.5" />
                <span className="sr-only">, {L.muted}</span>
              </span>
            )}
            {time && (
              <time
                dir="auto"
                dateTime={lastDate?.toISOString()}
                title={time.long}
                className={cn("shrink-0 text-xs tabular-nums", timeTone)}
              >
                <span aria-hidden>{time.short}</span>
                <span className="sr-only">, {time.long}</span>
              </time>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-sm leading-5 text-sheen-fg-muted">
            <span className="sr-only">, </span>
            <span className="flex min-w-0 flex-1">{preview}</span>
            {c.pinned && (
              <span className="shrink-0 text-sheen-fg-subtle">
                <PinIcon className="size-3.5 rotate-45" />
                <span className="sr-only">, {L.pinned}</span>
              </span>
            )}
            {unread > 0 && (
              <>
                <span className="sr-only">, </span>
                <UnreadBadge
                  count={unread}
                  muted={c.muted}
                  overflow={L.unreadOverflow}
                  label={L.unreadCount(unread)}
                  className={cn(
                    "motion-ok:animate-[sheen-chat-pop_var(--sheen-duration-smooth)_var(--sheen-ease-smooth)]",
                    chatAppearReduced,
                  )}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ⋯ (mouse): a shortcut to the same actions as the context menu (Shift + F10) */}
      {rowMenu && onAction && (
        <MenuTrigger
          handle={rowMenu}
          payload={c.id}
          tabIndex={-1}
          aria-hidden
          className={cn(
            // A solid little button (no blur: one per row would blow the glass budget, even while hidden).
            "absolute end-3 top-1/2 z-[2] flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-sheen-border bg-sheen-surface text-sheen-fg-muted shadow-sm",
            "opacity-0 transition-opacity duration-(--sheen-duration-fast) group-hover/row:opacity-100 data-popup-open:opacity-100 hover:text-sheen-fg",
            "pointer-coarse:hidden",
          )}
        >
          <MoreIcon className="size-4" />
        </MenuTrigger>
      )}
    </div>
  );
});
