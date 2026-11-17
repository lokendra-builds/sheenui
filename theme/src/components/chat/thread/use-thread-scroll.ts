"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLatest } from "../../../hooks/use-latest";
import type { ChatComposerHandle } from "../composer";
import { messageSummary } from "../format";
import type { ChatLabels } from "../labels";
import type { ChatConversation, ChatMessage, ChatParticipant } from "../types";
import { BOTTOM_SLACK } from "./layout";
import { createJumpStore } from "./parts";

/** What {@link useThreadScroll} reads from the thread. */
export type ThreadScrollInput = {
  messages: readonly ChatMessage[];
  conversation: ChatConversation;
  people: ReadonlyMap<string, ChatParticipant>;
  currentUserId: string;
  lastId: string | null;
  hiddenOlder: number;
  firstUnreadId: string | null | undefined;
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: (() => void) | undefined;
  onRead: ((id: string) => void) | undefined;
  reduced: boolean;
  showComposer: boolean;
  composer: RefObject<ChatComposerHandle | null>;
  domIdOf: (id: string) => string;
  announce: (text: string) => void;
  L: ChatLabels;
  nameOf: (id: string) => string;
};

/**
 * All the scrolling behaviour of `ChatThread`: keeping the reader's place when messages arrive or history loads, following
 * the newest message while pinned to the bottom, the floating day pill, the jump-to-latest store, read receipts and
 * loading older messages near the top. Returns the refs to attach to the log and the handlers it needs.
 *
 * @internal
 */
export function useThreadScroll({
  messages,
  conversation,
  people,
  currentUserId,
  lastId,
  hiddenOlder,
  firstUnreadId,
  hasOlder,
  loadingOlder,
  onLoadOlder,
  onRead,
  reduced,
  showComposer,
  composer,
  domIdOf,
  announce,
  L,
  nameOf,
}: ThreadScrollInput) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const gliding = useRef(false);
  const anchor = useRef<{ id: string; offset: number } | null>(null);
  // The jump-to-latest pill lives in its own store and component: crossing the 240 px mark while
  // scrolling must not re-render the whole message list (a 100+ ms commit with a long history).
  const jump = useMemo(() => createJumpStore(), []);
  const setShowJump = jump.setShow;
  const setUnseen = jump.setUnseen;

  /** The first message whose bottom is below the log's top edge (rows are in order: a binary search, a few reads per scroll). */
  const topRow = useCallback((el: HTMLElement) => {
    const top = el.getBoundingClientRect().top;
    const rows = el.querySelectorAll<HTMLElement>("[data-message-id]");
    let lo = 0;
    let hi = rows.length - 1;
    let found: HTMLElement | null = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const row = rows[mid];
      if (!row) break;
      if (row.getBoundingClientRect().bottom > top + 1) {
        found = row;
        hi = mid - 1;
      } else lo = mid + 1;
    }
    return { row: found, top };
  }, []);

  const measureAnchor = useCallback(
    (found?: { row: HTMLElement | null; top: number }) => {
      const el = scrollRef.current;
      if (!el) return;
      const { row, top } = found ?? topRow(el);
      anchor.current = row ? { id: row.dataset.messageId ?? "", offset: row.getBoundingClientRect().top - top } : null;
    },
    [topRow],
  );

  const restoreAnchor = useCallback(() => {
    const el = scrollRef.current;
    const a = anchor.current;
    if (!el || !a) return;
    const row = el.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(a.id)}"]`);
    if (!row) return;
    const delta = row.getBoundingClientRect().top - el.getBoundingClientRect().top - a.offset;
    if (Math.abs(delta) > 0.5) el.scrollTop += delta;
  }, []);

  const pinBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadRef = useLatest({ onLoadOlder, hasOlder, loadingOlder, revealing: hiddenOlder > 0 });
  const maybeLoadOlder = useCallback(() => {
    const el = scrollRef.current;
    const { onLoadOlder: load, hasOlder: more, loadingOlder: busy, revealing } = loadRef.current;
    if (!el || !load || !more || busy || revealing) return;
    if (el.scrollTop < 320) load();
  }, [loadRef]);

  const readRef = useLatest({ onRead, lastId, messages, currentUserId });
  const lastReported = useRef<string | null>(null);
  const reportRead = useCallback(() => {
    const { onRead: read, lastId: id, messages: list, currentUserId: me } = readRef.current;
    if (!read || !id || lastReported.current === id) return;
    const last = list[list.length - 1];
    if (!last || last.senderId === me) return;
    lastReported.current = id;
    read(id);
  }, [readRef]);

  /*
   * The floating day pill (WhatsApp / Telegram): while the reader scrolls, the day of the
   * messages at the top floats over the log, then fades out a second after scrolling stops. The
   * day labels in the log itself stay put, so nothing is covered while reading. Written straight
   * to the DOM (text + data-show) from the scroll frame: no React render per scroll event.
   */
  const dayPillRef = useRef<HTMLSpanElement>(null);
  // The reader scrolled by hand since the chat opened (a late "New messages" line then leaves them be).
  const readerMoved = useRef(false);
  const userScrolling = useRef(false);
  const dayPillTimer = useRef<number | undefined>(undefined);
  const updateDayPill = useCallback((found: { row: HTMLElement | null; top: number }) => {
    const pill = dayPillRef.current;
    if (!pill) return;
    let show = false;
    if (userScrolling.current) {
      const { row, top } = found;
      const day = row?.closest<HTMLElement>("[data-day]");
      const label = day?.firstElementChild?.getBoundingClientRect();
      // Hidden while that day's own label is on screen at the top (no double pill).
      if (day && label && label.bottom <= top + 4) {
        if (pill.textContent !== day.dataset.day) pill.textContent = day.dataset.day ?? "";
        show = true;
      }
    }
    pill.toggleAttribute("data-show", show);
  }, []);

  /** Scrolling stopped a second ago: the day pill fades out. */
  const settleDayPill = () => {
    window.clearTimeout(dayPillTimer.current);
    dayPillTimer.current = window.setTimeout(() => {
      userScrolling.current = false;
      dayPillRef.current?.removeAttribute("data-show");
    }, 1000);
  };

  /** The reader is scrolling by hand (wheel, touch, keys, the scrollbar): the day pill may show. */
  const noteUserScroll = () => {
    readerMoved.current = true;
    gliding.current = false;
    userScrolling.current = true;
    settleDayPill();
  };

  const scrollFrame = useRef(0);
  const scrollIdle = useRef<number | undefined>(undefined);
  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance <= BOTTOM_SLACK;
    if (gliding.current) {
      if (atBottom) gliding.current = false;
    } else {
      stick.current = atBottom;
    }
    setShowJump(distance > 240);
    if (atBottom) {
      setUnseen(0);
      reportRead();
    }
    cancelAnimationFrame(scrollFrame.current);
    // One read pass per frame (layout is clean here): the top row serves both.
    scrollFrame.current = requestAnimationFrame(() => {
      const found = topRow(el);
      measureAnchor(found);
      updateDayPill(found);
    });
    // While the log scrolls, messages passing under a still pointer don't show their toolbar (no re-render, no hit-testing per row).
    el.setAttribute("data-scrolling", "");
    window.clearTimeout(scrollIdle.current);
    scrollIdle.current = window.setTimeout(() => el.removeAttribute("data-scrolling"), 120);
    if (userScrolling.current) settleDayPill();
    maybeLoadOlder();
  }
  useEffect(
    () => () => {
      cancelAnimationFrame(scrollFrame.current);
      window.clearTimeout(dayPillTimer.current);
      window.clearTimeout(scrollIdle.current);
    },
    [],
  );

  function jumpToLatest() {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = true;
    gliding.current = !reduced;
    setUnseen(0);
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    if (showComposer) composer.current?.focus();
    else if (lastId) document.getElementById(domIdOf(lastId))?.focus({ preventScroll: true });
  }

  /* After each change: keep the reader's place, or follow the newest message. */
  const typingIds = useMemo(
    () => (conversation.typingIds ?? []).filter((id) => id !== currentUserId),
    [conversation.typingIds, currentUserId],
  );
  const typingPeople = useMemo(() => typingIds.flatMap((id) => people.get(id) ?? []), [typingIds, people]);
  const prev = useRef<{ first: string | null; last: string | null; mounted: boolean }>({
    first: null,
    last: null,
    mounted: false,
  });
  const knownIds = useRef(new Set<string>());
  /*
   * Messages that arrive after the thread opened (sent or received, at the end) animate in, and
   * keep that flag for the length of the entrance even when the thread re-renders meanwhile (a
   * status change must not cut it short). History loaded above never animates.
   */
  const lastMessageId = messages[messages.length - 1]?.id ?? null;
  const [arrivals, setArrivals] = useState<{ last: string | null; ids: ReadonlySet<string> }>({
    last: lastMessageId,
    ids: new Set(),
  });
  // Adjusting state while rendering (the pattern React documents for "previous value" logic): the
  // message is flagged in the very render that first shows it, with no ref or clock read.
  if (arrivals.last !== lastMessageId) {
    const lastIndex = arrivals.last ? messages.findIndex((m) => m.id === arrivals.last) : -1;
    const ids = new Set(arrivals.ids);
    // (Several messages into an empty log at once are history, like the layout effect below says.)
    if (lastIndex >= 0 || (arrivals.last === null && messages.length === 1)) {
      for (let i = lastIndex + 1; i < messages.length; i++) {
        const id = messages[i]?.id;
        if (id !== undefined) ids.add(id);
      }
    }
    setArrivals({ last: lastMessageId, ids });
  }
  // The flag lasts for the entrance (700 ms), and survives re-renders meanwhile.
  useEffect(() => {
    if (arrivals.ids.size === 0) return;
    const timer = window.setTimeout(() => setArrivals((p) => ({ last: p.last, ids: new Set() })), 700);
    return () => window.clearTimeout(timer);
  }, [arrivals.ids]);
  const appearing = (id: string) => arrivals.ids.has(id);
  const pendingFocusUp = useRef<string | null>(null);

  /** Open at the first unread message ("New messages"), otherwise at the newest. */
  const openAtStart = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const divider = el.querySelector<HTMLElement>("[data-unread-divider]");
    if (divider) {
      el.scrollTop += divider.getBoundingClientRect().top - el.getBoundingClientRect().top - 56;
      // The newest message counts as seen only when it is on screen too.
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
    } else {
      stick.current = true;
      pinBottom();
    }
  }, [pinBottom]);

  // Who "me" is and how names and labels read: current values for this effect without making it re-run when they change identity.
  const identityRef = useLatest({ currentUserId, L, nameOf });
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const { currentUserId: me, L: text, nameOf: name } = identityRef.current;
    const firstId = messages[0]?.id ?? null;
    if (!el) return;
    const before = prev.current;
    // The first messages to show (several at once into an empty log: history, not news).
    const initial = !before.mounted || (before.last === null && messages.length > 1);
    if (initial) {
      openAtStart();
      for (const m of messages) knownIds.current.add(m.id);
    } else {
      const lastIndex = before.last ? messages.findIndex((m) => m.id === before.last) : -1;
      const added = lastIndex >= 0 ? messages.slice(lastIndex + 1) : before.last === null ? messages : [];
      const fresh = added.filter((m) => !knownIds.current.has(m.id));
      const mine = fresh.some((m) => m.senderId === me);
      if (mine) {
        stick.current = true;
        pinBottom();
      } else if (stick.current) {
        pinBottom();
      } else {
        restoreAnchor();
      }
      const incoming = fresh.filter((m) => m.senderId !== me && m.kind !== "system");
      if (incoming.length && !stick.current) setUnseen((n) => n + incoming.length);
      const latest = incoming[incoming.length - 1];
      if (latest) announce(text.announceIncoming(name(latest.senderId), messageSummary(latest, text)));
      for (const m of messages) knownIds.current.add(m.id);

      // ↑ on the first message loaded more: move on to the one just above it.
      if (pendingFocusUp.current && firstId !== before.first) {
        const index = messages.findIndex((m) => m.id === pendingFocusUp.current);
        const target = index > 0 ? messages[index - 1] : undefined;
        pendingFocusUp.current = null;
        if (target) {
          const node = document.getElementById(domIdOf(target.id));
          node?.focus({ preventScroll: true });
          node?.scrollIntoView({ block: "nearest" });
        }
      }
    }
    prev.current = { first: firstId, last: messages[messages.length - 1]?.id ?? null, mounted: true };
    measureAnchor();
    if (stick.current) reportRead();
    // Short history: load more until the log can scroll.
    maybeLoadOlder();
  }, [
    messages,
    loadingOlder,
    hasOlder,
    typingPeople.length,
    hiddenOlder,
    announce,
    openAtStart,
    pinBottom,
    restoreAnchor,
    measureAnchor,
    reportRead,
    maybeLoadOlder,
    identityRef,
    domIdOf,
    setUnseen,
  ]);

  // "New messages" decided after the chat opened (its messages arrived late): go there, unless the reader already scrolled.
  const placedUnread = useRef(firstUnreadId ?? null);
  useLayoutEffect(() => {
    if (!firstUnreadId || placedUnread.current === firstUnreadId) return;
    placedUnread.current = firstUnreadId;
    if (!prev.current.mounted || readerMoved.current) return;
    openAtStart();
    measureAnchor();
  }, [firstUnreadId, openAtStart, measureAnchor]);

  // Content that changes height on its own (photos loading, reactions, fonts).
  useEffect(() => {
    const content = contentRef.current;
    const el = scrollRef.current;
    if (!content || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (stick.current && !gliding.current) pinBottom();
      else if (!gliding.current) restoreAnchor();
    });
    observer.observe(content);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pinBottom, restoreAnchor]);

  /** Follow the newest message from now on (`true`), or stay where the reader is (`false`). */
  const setStick = useCallback((follow: boolean) => {
    stick.current = follow;
  }, []);
  /** After the next batch of older messages loads, move focus to the message just above this one. */
  const setPendingFocusUp = useCallback((id: string | null) => {
    pendingFocusUp.current = id;
  }, []);
  return {
    scrollRef,
    contentRef,
    setStick,
    jump,
    dayPillRef,
    noteUserScroll,
    onScroll,
    jumpToLatest,
    typingPeople,
    appearing,
    setPendingFocusUp,
  };
}
