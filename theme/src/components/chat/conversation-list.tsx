"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow } from "../../lib/heading";
import { useControllable } from "../../hooks/use-controllable";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "../context-menu/context-menu";
import { EmptyState } from "../empty-state/empty-state";
import { Input } from "../input/input";
import { Menu, MenuContent, MenuItem, MenuSeparator, createMenuHandle } from "../menu/menu";
import { SegmentedControl } from "../segmented/segmented";
import { Skeleton, SkeletonGroup } from "../skeleton/skeleton";
import { ChatKeyframes, chatNoBlur } from "./chat-parts";
import { conversationTitle, toParticipantMap } from "./format";
import { useAnnouncer, useCoarsePointer, useLongPressMenuGuard, useNow } from "./hooks";
import { useLatest } from "../../hooks/use-latest";
import { resolveChatLabels } from "./labels";
import type { ChatConversation, ChatConversationAction, ChatListFilter } from "./types";
import {
  ArchiveIcon,
  BellIcon,
  BellOffIcon,
  ChatsIcon,
  MailDotIcon,
  MailOpenIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  UnarchiveIcon,
  UsersIcon,
  XIcon,
} from "./icons";

import {
  type ConversationListProps,
  type Item,
  HEADER_HEIGHT,
  ROW_HEIGHT,
  activity,
  haystack,
  inFilter,
} from "./conversation-list/model";
import { ListWindow, type RowActions, ConversationRow } from "./conversation-list/row";

export { type ConversationListHandle, type ConversationListProps } from "./conversation-list/model";
/**
 * The chat list ("inbox"): search that filters and highlights, All / Unread / Groups / Archived
 * with counts, Pinned and All chats sections, and rows with avatar and presence, name, the
 * last message (or "typing…", or your draft), time, unread count, pinned / muted marks and
 * delivery ticks for your own last message.
 *
 * Accessibility: a single-select listbox. It is one tab stop: ↑ / ↓, Home / End and
 * Page Up / Down move between chats, typing a name jumps to it, Enter or Space opens one
 * (aria-selected marks the open chat), Shift + F10 or the Menu key opens a chat's actions.
 * The ⋯ button (mouse) and swipe actions (touch) are shortcuts to the same menu.
 *
 * Thousands of chats: above `windowThreshold` rows only the rows in view (plus a few) are in the
 * page; each row says its position (aria-posinset / aria-setsize).
 *
 * Props: see {@link ConversationListProps}. Data: `conversations`, `participants`,
 * `currentUserId`, `selectedId`. Events: `onSelect`, `onAction` (pin, mute, archive, mark read),
 * `onFilterChange`, `onQueryChange`. Look: `title`, `headingLevel` 2, `headerActions`,
 * `showSearch` true, `showFilters` true, `swipeActions` true, `emptyAction`, `density`
 * "comfortable", `windowThreshold` 150, `loading`, `labels`, `locale`, `now`, `ref`.
 *
 * Keyboard: One tab stop: Up / Down, Home / End and Page Up / Down move between chats, typing a name jumps to it, Enter or Space opens one, Shift+F10 or the Menu key opens its actions. The search field and filters are ordinary tab stops.
 * Accessibility: A single-select listbox (`aria-selected` marks the open chat); rows read as name, last message, time, unread count and state; each row says its position (aria-posinset / aria-setsize) even when windowed; filter and search results are announced politely. The swipe and "more" buttons are shortcuts to the same menu, so nothing is gesture-only. Presence is written in words.
 * Glass: One glass panel; rows reuse the look without extra blur.
 * Motion: Rows slide in, the swipe follows the finger, and the typing dots wave and pause off screen; reduced motion removes the movement.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ConversationList, type ChatConversation } from "@sheenui/theme";
 *
 * const people = [
 *   { id: "me", name: "You" },
 *   { id: "riya", name: "Riya Sharma", presence: "online" as const },
 * ];
 * const chats: ChatConversation[] = [
 *   { id: "c1", participantIds: ["me", "riya"], unreadCount: 2, lastMessage: { id: "m1", senderId: "riya", text: "See you at 6?", createdAt: "2026-11-08T09:00:00Z" } },
 * ];
 *
 * export function Inbox() {
 *   const [selected, setSelected] = useState<string | null>(null);
 *   return <ConversationList conversations={chats} participants={people} currentUserId="me" selectedId={selected} onSelect={(c) => setSelected(c.id)} />;
 * }
 * ```
 *
 * @see /chat/list
 */
export function ConversationList({
  conversations,
  participants,
  currentUserId,
  selectedId = null,
  onSelect,
  onAction,
  filter: filterProp,
  defaultFilter = "all",
  onFilterChange,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  loading = false,
  title,
  headingLevel = 2,
  headerActions,
  showSearch = true,
  showFilters = true,
  swipeActions = true,
  emptyAction,
  density = "comfortable",
  windowThreshold = 150,
  ref,
  now: nowProp,
  locale,
  labels: labelsProp,
  className,
}: ConversationListProps) {
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const now = useNow(nowProp);
  const id = useId();
  const headingId = `${id}-heading`;
  const hintId = `${id}-hint`;
  const [announce, announcer] = useAnnouncer();
  const people = useMemo(() => toParticipantMap(participants), [participants]);

  const [filter, setFilter] = useControllable<ChatListFilter>(filterProp, defaultFilter, onFilterChange);
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange);
  // Typing stays instant with thousands of chats: the list catches up in a background render.
  const deferredQuery = useDeferredValue(query);
  const q = deferredQuery.trim().toLocaleLowerCase();

  /* ----- Counts, filtering, sections ----- */
  const counts = useMemo(() => {
    const c: Record<ChatListFilter, number> = { all: 0, unread: 0, groups: 0, archived: 0 };
    for (const conv of conversations)
      for (const f of ["all", "unread", "groups", "archived"] as const) if (inFilter(conv, f)) c[f] += 1;
    return c;
  }, [conversations]);

  // Built once per change of the chats, not on every keystroke.
  const haystacks = useMemo(
    () => new Map(conversations.map((c) => [c.id, haystack(c, people, currentUserId)])),
    [conversations, people, currentUserId],
  );

  // Newest first, sorted once per change of the chats (filtering keeps the order).
  const sorted = useMemo(
    () =>
      conversations
        .map((c) => ({ c, t: activity(c) }))
        .sort((a, b) => b.t - a.t)
        .map((x) => x.c),
    [conversations],
  );

  const items = useMemo<Item[]>(() => {
    const visible = sorted.filter((c) => inFilter(c, filter) && (!q || (haystacks.get(c.id) ?? "").includes(q)));
    const pinned = filter === "archived" ? [] : visible.filter((c) => c.pinned);
    const rest = filter === "archived" ? visible : visible.filter((c) => !c.pinned);
    const out: Item[] = [];
    let index = 0;
    if (pinned.length) {
      out.push({ type: "header", key: "h-pinned", label: L.pinnedSection });
      for (const c of pinned) out.push({ type: "row", key: c.id, conversation: c, index: index++ });
    }
    if (rest.length) {
      if (pinned.length)
        out.push({ type: "header", key: "h-all", label: filter === "archived" ? L.filters.archived : L.allSection });
      for (const c of rest) out.push({ type: "row", key: c.id, conversation: c, index: index++ });
    }
    return out;
  }, [sorted, filter, q, haystacks, L]);

  const rows = useMemo(() => items.filter((i): i is Extract<Item, { type: "row" }> => i.type === "row"), [items]);
  const rowCount = rows.length;

  // Announce how many chats match, once typing pauses.
  const firstAnnounce = useRef(true);
  // The count and the wording are read when the timer fires: only a new query or filter announces.
  const speakCount = useEffectEvent(() => announce(L.resultsCount(rowCount)));
  useEffect(() => {
    if (firstAnnounce.current) {
      firstAnnounce.current = false;
      return;
    }
    const timer = window.setTimeout(speakCount, 600);
    return () => window.clearTimeout(timer);
  }, [q, filter]);

  /* ----- Layout (offsets for windowing) ----- */
  const rowHeight = ROW_HEIGHT[density];
  const windowed = rowCount > windowThreshold;
  const offsets = useMemo(() => {
    const out: number[] = [];
    let y = 0;
    for (const item of items) {
      out.push(y);
      y += item.type === "header" ? HEADER_HEIGHT : rowHeight;
    }
    out.push(y);
    return out;
  }, [items, rowHeight]);
  const total = offsets[offsets.length - 1] ?? 0;

  // The scroller is also held in state (a callback ref): the windowed rows are its children, so their
  // effects run before a plain ref is attached on the very first commit; state re-runs them once it is.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const attachScroller = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScroller(node);
  }, []);

  /* ----- Roving focus ----- */
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = rows.findIndex((r) => r.conversation.id === selectedId);
  const current = Math.min(Math.max(0, activeIndex), Math.max(0, rowCount - 1));
  const tabStop = activeIndex < 0 || activeIndex >= rowCount ? Math.max(0, selectedIndex) : current;
  const tabRow = rows[tabStop];
  // The list's tab stop follows the open chat until the person moves it.
  const followSelection = useRef(true);
  useEffect(() => {
    if (followSelection.current && selectedIndex >= 0) setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  const pendingFocus = useRef<number | null>(null);
  const domIdOf = useCallback((conversationId: string) => `${id}-c-${conversationId}`, [id]);

  const focusRow = useCallback(
    (index: number) => {
      const target = rows[Math.max(0, Math.min(rowCount - 1, index))];
      if (!target) return;
      followSelection.current = false;
      setActiveIndex(target.index);
      const el = scrollRef.current;
      const itemIndex = items.indexOf(target);
      const node = document.getElementById(domIdOf(target.conversation.id));
      if (node) {
        node.focus({ preventScroll: true });
        node.scrollIntoView({ block: "nearest" });
      } else if (el) {
        // Not rendered yet (windowed): scroll it into view, focus after the render.
        const y = offsets[itemIndex] ?? 0;
        if (y < el.scrollTop) el.scrollTop = y - HEADER_HEIGHT;
        else el.scrollTop = y + rowHeight - el.clientHeight;
        pendingFocus.current = target.index;
      }
    },
    [rows, rowCount, items, offsets, rowHeight, domIdOf],
  );

  // A row asked for focus before it was rendered (windowed): focus it once it is in the page.
  const flushPendingFocus = () => {
    if (pendingFocus.current === null) return;
    const target = rows[pendingFocus.current];
    const node = target ? document.getElementById(domIdOf(target.conversation.id)) : null;
    if (node) {
      pendingFocus.current = null;
      node.focus({ preventScroll: true });
      node.scrollIntoView({ block: "nearest" });
    }
  };
  useLayoutEffect(flushPendingFocus);

  useImperativeHandle(
    ref,
    () => ({
      focus: (conversationId) => {
        const index = rows.findIndex((r) => r.conversation.id === (conversationId ?? selectedId));
        focusRow(index >= 0 ? index : 0);
      },
    }),
    [rows, selectedId, focusRow],
  );

  /* ----- Type-ahead ----- */
  const typeahead = useRef({ text: "", timer: 0 });
  function typeAhead(char: string, from: number) {
    const t = typeahead.current;
    window.clearTimeout(t.timer);
    t.text += char.toLocaleLowerCase();
    t.timer = window.setTimeout(() => (t.text = ""), 600);
    const titles = rows.map((r) => conversationTitle(r.conversation, people, currentUserId).toLocaleLowerCase());
    const start = t.text.length === 1 ? from + 1 : from;
    for (let k = 0; k < rowCount; k++) {
      const i = (start + k) % rowCount;
      if (titles[i]?.startsWith(t.text)) {
        focusRow(i);
        return;
      }
    }
  }

  const liveRef = useLatest({ onSelect, rows, focusRow, rowCount, onAction, typeAhead });
  const onRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, index: number) => {
      const { onSelect: select, rows: list, focusRow: focus, rowCount: count, typeAhead: search } = liveRef.current;
      const row = list[index];
      if (!row) return;
      const page = Math.max(1, Math.floor((scrollRef.current?.clientHeight ?? 400) / ROW_HEIGHT.comfortable) - 1);
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focus(index + 1);
          return;
        case "ArrowUp":
          event.preventDefault();
          focus(index - 1);
          return;
        case "Home":
          event.preventDefault();
          focus(0);
          return;
        case "End":
          event.preventDefault();
          focus(count - 1);
          return;
        case "PageDown":
          event.preventDefault();
          focus(index + page);
          return;
        case "PageUp":
          event.preventDefault();
          focus(index - page);
          return;
        case "Enter":
        case " ":
          event.preventDefault();
          select?.(row.conversation, "keyboard");
          return;
      }
      if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        search(event.key, index);
      }
    },
    [liveRef],
  );

  /* ----- Row actions: one ⋯ menu and one context menu for every row ----- */
  const rowMenu = useMemo(() => createMenuHandle<string>(), []);
  const [contextId, setContextIdState] = useState<string | null>(null);
  // Read synchronously when the menu opens (the state is a render behind for keyboard opens).
  const contextRef = useRef<string | null>(null);
  const setContextId = useCallback((value: string | null) => {
    contextRef.current = value;
    setContextIdState(value);
  }, []);
  // A long-press menu stays open when the finger is held past a second (see useLongPressMenuGuard).
  const contextOpen = useRef(false);
  const longPressGuard = useLongPressMenuGuard(useCallback(() => contextOpen.current, []));
  const byId = useMemo(() => new Map(conversations.map((c) => [c.id, c])), [conversations]);
  const contextConversation = contextId ? byId.get(contextId) : undefined;

  const runAction = useCallback(
    (conversation: ChatConversation, action: ChatConversationAction) => {
      onAction?.(conversation, action);
      const name = conversationTitle(conversation, people, currentUserId);
      const words: Record<ChatConversationAction, string> = {
        pin: L.pin,
        unpin: L.unpin,
        mute: L.mute,
        unmute: L.unmute,
        archive: L.archive,
        unarchive: L.unarchive,
        markRead: L.markRead,
        markUnread: L.markUnread,
      };
      announce(`${words[action]}: ${name}`);
    },
    [onAction, people, currentUserId, L, announce],
  );

  function actionItems(c: ChatConversation) {
    const unread = (c.unreadCount ?? 0) > 0;
    return [
      <MenuItem
        key="pin"
        icon={c.pinned ? <PinOffIcon /> : <PinIcon />}
        onClick={() => runAction(c, c.pinned ? "unpin" : "pin")}
        disabled={Boolean(c.archived)}
      >
        {c.pinned ? L.unpin : L.pin}
      </MenuItem>,
      <MenuItem
        key="mute"
        icon={c.muted ? <BellIcon /> : <BellOffIcon />}
        onClick={() => runAction(c, c.muted ? "unmute" : "mute")}
      >
        {c.muted ? L.unmute : L.mute}
      </MenuItem>,
      <MenuItem
        key="read"
        icon={unread ? <MailOpenIcon /> : <MailDotIcon />}
        onClick={() => runAction(c, unread ? "markRead" : "markUnread")}
      >
        {unread ? L.markRead : L.markUnread}
      </MenuItem>,
      <MenuSeparator key="sep" />,
      <MenuItem
        key="archive"
        icon={c.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
        onClick={() => runAction(c, c.archived ? "unarchive" : "archive")}
      >
        {c.archived ? L.unarchive : L.archive}
      </MenuItem>,
    ];
  }

  /* ----- Swipe (touch) ----- */
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // One stable object for every row, so rows stay memoised.
  const rowActionsRef = useLatest({ onSelect, runAction });
  const rowActions = useMemo<RowActions>(
    () => ({
      select: (c, via) => rowActionsRef.current.onSelect?.(c, via),
      focus: (index) => {
        followSelection.current = false;
        setActiveIndex(index);
      },
      swipe: (conversationId, open) =>
        setSwipedId((current) => (open ? conversationId : current === conversationId ? null : current)),
      action: (c, action) => rowActionsRef.current.runAction(c, action),
      keyDown: onRowKeyDown,
    }),
    [rowActionsRef, onRowKeyDown],
  );
  useEffect(() => {
    if (!swipedId) return;
    // Any tap outside the open row closes it.
    const close = (event: PointerEvent) => {
      const row = (event.target as Element | null)?.closest("[data-conversation-row]");
      if (row?.getAttribute("data-conversation-row") !== swipedId) setSwipedId(null);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [swipedId]);

  /* ----- Render ----- */
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const showTitle = title !== false;
  const filterItems = (["all", "unread", "groups", "archived"] as const).map((f) => ({
    value: f,
    "aria-label": f === "all" ? L.filters[f] : `${L.filters[f]}, ${L.resultsCount(counts[f])}`,
    label: (
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate">{L.filters[f]}</span>
        {/* A real space, so the visible text reads "Unread 2" and contains the start of the name ("Unread, 2 chats"). */}
        {counts[f] > 0 && f !== "all" && " "}
        {counts[f] > 0 && f !== "all" && (
          <span
            aria-hidden
            className="shrink-0 rounded-full bg-sheen-hover px-1 text-2xs leading-4 font-semibold tabular-nums text-sheen-fg-muted group-data-[fit=tight]/segmented:hidden"
          >
            {counts[f] > 99 ? L.unreadOverflow : counts[f]}
          </span>
        )}
      </span>
    ),
  }));

  const empty = !loading && rowCount === 0;

  const renderItem = (item: Item, i: number) => {
    const style = windowed
      ? {
          position: "absolute" as const,
          top: offsets[i],
          insetInline: 0,
          height: item.type === "header" ? HEADER_HEIGHT : rowHeight,
        }
      : undefined;
    if (item.type === "header") {
      return (
        <div key={item.key} role="none" style={style} className="flex h-[34px] items-end px-4 pb-1.5">
          <span aria-hidden className="text-2xs font-semibold tracking-[0.08em] text-sheen-fg-muted uppercase">
            {item.label}
          </span>
        </div>
      );
    }
    const c = item.conversation;
    return (
      <ConversationRow
        key={item.key}
        // A number, not a style object: a fresh object every render would defeat the row's memo.
        windowTop={windowed ? offsets[i] : undefined}
        conversation={c}
        index={item.index}
        count={rowCount}
        domId={domIdOf(c.id)}
        selected={c.id === selectedId}
        tabbable={item.index === tabStop}
        swiped={swipedId === c.id}
        swipeEnabled={swipeActions && Boolean(onAction) && coarse}
        people={people}
        currentUserId={currentUserId}
        query={q}
        now={now}
        locale={locale}
        labels={L}
        density={density}
        reduced={reduced}
        selectionId={`${id}-selection`}
        actions={rowActions}
        rowMenu={onAction ? rowMenu : null}
        hasActions={Boolean(onAction)}
      />
    );
  };

  return (
    <section
      role="group"
      aria-labelledby={headingId}
      data-slot="conversation-list"
      className={cn("@container flex h-full min-h-0 w-full min-w-0 flex-col", className)}
    >
      <ChatKeyframes />
      <div className="flex shrink-0 flex-col gap-3 px-3 pt-3 pb-2 @sm:px-4">
        <div className={cn("flex min-h-9 items-center gap-2", !showTitle && "sr-only")}>
          <Heading id={headingId} className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
            {showTitle ? (title ?? L.chats) : L.chats}
          </Heading>
          {headerActions}
        </div>
        {showSearch && (
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && rowCount > 0) {
                e.preventDefault();
                focusRow(0);
              } else if (e.key === "Escape" && query) {
                e.preventDefault();
                e.stopPropagation();
                setQuery("");
              }
            }}
            aria-label={L.search}
            placeholder={L.searchPlaceholder}
            enterKeyHint="search"
            autoComplete="off"
            // Its field is glass-1 inside the wrapper: no second blur on the list's surface.
            className="w-full [&_.glass-1]:[-webkit-backdrop-filter:none] [&_.glass-1]:[backdrop-filter:none]"
            inputClassName="[&::-webkit-search-cancel-button]:hidden"
            leading={<SearchIcon className="size-4" />}
            trailing={
              query ? (
                <button
                  type="button"
                  onClick={(e) => {
                    setQuery("");
                    (
                      e.currentTarget
                        .closest("[data-slot='conversation-list']")
                        ?.querySelector("input[type='search']") as HTMLInputElement | null
                    )?.focus();
                  }}
                  aria-label={L.clearSearch}
                  className="relative -me-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-sheen-hover hover:text-sheen-fg focus-visible:outline-2 focus-visible:outline-sheen-focus any-pointer-coarse:after:absolute any-pointer-coarse:after:size-11"
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : undefined
            }
          />
        )}
        {showFilters && (
          <SegmentedControl
            aria-label={L.filtersLabel}
            items={filterItems}
            value={filter}
            onValueChange={(v) => setFilter(v as ChatListFilter)}
            size="sm"
            fullWidth
            className={chatNoBlur}
          />
        )}
      </div>

      <div
        ref={attachScroller}
        className="group/scroller relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:thin]"
      >
        {loading ? (
          <SkeletonGroup labels={{ loading: L.loadingChats }} className="flex flex-col">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex h-[72px] items-center gap-3 px-4">
                <Skeleton shape="circle" width={48} />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex justify-between gap-6">
                    <Skeleton shape="text" width={`${45 + ((i * 17) % 30)}%`} height={12} />
                    <Skeleton shape="text" width={32} height={10} />
                  </div>
                  <Skeleton shape="text" width={`${60 + ((i * 23) % 35)}%`} height={10} />
                </div>
              </div>
            ))}
          </SkeletonGroup>
        ) : empty ? (
          <div className="flex min-h-full items-center justify-center p-6">
            {q ? (
              <EmptyState
                icon={<SearchIcon className="size-6" />}
                title={L.noResultsTitle(query.trim())}
                description={L.noResultsDescription}
                headingLevel={false}
                announce
              />
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={<ChatsIcon className="size-6" />}
                title={L.noChatsTitle}
                description={L.noChatsDescription}
                action={emptyAction}
                headingLevel={false}
              />
            ) : (
              <EmptyState
                variant="compact"
                icon={
                  filter === "archived" ? (
                    <ArchiveIcon className="size-6" />
                  ) : filter === "groups" ? (
                    <UsersIcon className="size-6" />
                  ) : (
                    <MailOpenIcon className="size-6" />
                  )
                }
                title={filter === "all" ? L.noChatsTitle : L.emptyFilter[filter]}
                headingLevel={false}
              />
            )}
          </div>
        ) : (
          <ContextMenu
            onOpenChangeComplete={(open) => !open && !contextRef.current && setContextIdState(null)}
            onOpenChange={(open, details) => {
              if (open && !contextRef.current) details.cancel();
              if (!open) contextRef.current = null;
              contextOpen.current = open && !details.isCanceled;
            }}
          >
            <ContextMenuTrigger
              {...longPressGuard}
              role="listbox"
              aria-labelledby={headingId}
              aria-describedby={hintId}
              aria-orientation="vertical"
              onPointerDownCapture={(e) => {
                if (e.button !== 2 && e.pointerType !== "touch") return;
                const row = (e.target as Element).closest<HTMLElement>("[data-conversation-row]");
                setContextId(onAction && row ? (row.dataset.conversationRow ?? null) : null);
              }}
              onContextMenuCapture={(e) => {
                const row = (e.target as Element).closest<HTMLElement>("[data-conversation-row]");
                if (!row || !onAction) {
                  e.stopPropagation();
                  return;
                }
                setContextId(row.dataset.conversationRow ?? null);
              }}
              className={cn(
                "relative pb-2 select-auto focus-visible:outline-none group-data-[scrolling]/scroller:pointer-events-none",
                windowed && "contain-strict",
              )}
              style={windowed ? { height: total + 8 } : undefined}
            >
              {windowed ? (
                <ListWindow
                  items={items}
                  offsets={offsets}
                  rowHeight={rowHeight}
                  keepIndex={tabRow ? items.indexOf(tabRow) : -1}
                  scroller={scroller}
                  renderItem={renderItem}
                  afterRender={flushPendingFocus}
                />
              ) : (
                items.map(renderItem)
              )}
            </ContextMenuTrigger>
            <ContextMenuContent className="min-w-52">
              {contextConversation ? actionItems(contextConversation) : null}
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>

      <p id={hintId} hidden>
        {L.listHint}
      </p>

      {onAction && (
        <Menu handle={rowMenu}>
          {({ payload }: { payload: string | undefined }) => {
            const c = payload ? byId.get(payload) : undefined;
            return (
              // Back to the chat's row (the ⋯ button is a mouse shortcut, hidden from screen readers and the Tab order).
              <MenuContent
                className="min-w-52"
                align="end"
                finalFocus={() => (payload ? document.getElementById(domIdOf(payload)) : null) ?? true}
              >
                {c ? actionItems(c) : null}
              </MenuContent>
            );
          }}
        </Menu>
      )}
      {announcer}
    </section>
  );
}
