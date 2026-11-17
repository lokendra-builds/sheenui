"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";
import { useControllable } from "../../hooks/use-controllable";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Button } from "../button/button";
import { Tooltip } from "../tooltip/tooltip";
import { ChatAvatar, ChatKeyframes, UnreadBadge, chatAppearReduced, chatIconButton } from "./chat-parts";
import { ChatThread, type ChatThreadProps } from "./chat-thread";
import type { ChatComposerHandle } from "./composer";
import { conversationTitle, formatListTime, messageSummary, toDate, toParticipantMap, toTime } from "./format";
import { PHONE_QUERY, useCoarsePointer, useMediaQuery, useModalIsolation, useNow, useVisualViewport } from "./hooks";
import { resolveChatLabels, type ChatLabels } from "./labels";
import type { ChatConversation, ChatDraft, ChatMessage, ChatParticipant } from "./types";
import { ChatFilledIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, SendIcon } from "./icons";

/** Props of {@link ChatWidget}. Required: `conversations`, `messages`, `participants`, `currentUserId`. */
export type ChatWidgetProps = {
  /** The support chats this visitor has had, newest activity first. */
  conversations: ChatConversation[];
  /** Takes messages per chat id (oldest first). */
  messages: Record<string, ChatMessage[] | undefined>;
  /** Everyone who can appear: the visitor and the team. */
  participants: ChatParticipant[];
  /** Id of the visitor, used to tell which messages are theirs. */
  currentUserId: string;
  /** The team shown in the header (participant ids); defaults to everyone except you. */
  teamIds?: string[];
  /** Whether the panel is open (controlled). */
  open?: boolean;
  /**
   * Whether the panel starts open (uncontrolled).
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the new state when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The chat shown in the panel; null shows the home view. */
  conversationId?: string | null;
  /**
   * The chat shown on mount (uncontrolled); null is the home view.
   * @default null
   */
  defaultConversationId?: string | null;
  /** Called with the chat id when the visitor opens a chat, or null when they go back home. */
  onConversationChange?: (conversationId: string | null) => void;
  /** "Send us a message": create a chat and return its id (it opens once it is in `conversations`). */
  onNewConversation?: (() => string) | (() => void);
  /** The visitor sent a message in the chat with this id. */
  onSend?: (conversationId: string, draft: ChatDraft) => void;
  /** Called when the visitor adds or removes a reaction. */
  onReact?: (conversationId: string, message: ChatMessage, emoji: string, add: boolean) => void;
  /** The visitor pressed Retry on a failed message. */
  onRetry?: (conversationId: string, message: ChatMessage) => void;
  /** The visitor saw the newest message of this chat: mark it read. */
  onRead?: (conversationId: string) => void;
  /** Chips that send a ready-made message (shown in a chat until you write something). */
  quickReplies?: string[];
  /** Extra props for the chat view inside the panel. */
  threadProps?: Partial<ChatThreadProps>;
  /** Content above "Send us a message" on the home view (a status line…). */
  homeContent?: ReactNode;
  /** Help articles under the recent conversations on the home view ("Find an answer"). */
  helpLinks?: ChatWidgetLink[];
  /**
   * Sets the physical corner of the launcher.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * "fixed" to the window, or "absolute" inside a positioned box (previews, docs).
   * @default "fixed"
   */
  strategy?: "fixed" | "absolute";
  /** The launcher's badge; defaults to the unread count of every chat. */
  unreadCount?: number;
  /**
   * The current time for "5m" labels. Default: the real clock, refreshed every 30 seconds. On a
   * prerendered or server-rendered page pass a fixed date, so the HTML matches what the browser
   * renders when it hydrates.
   */
  now?: Date;
  /** Sets the BCP 47 locale for times and dates. Default: the browser's; pass one on prerendered pages. */
  locale?: string;
  /** Any UI string (i18n); see {@link ChatLabels}. */
  labels?: Partial<ChatLabels>;
  /**
   * Heading level (2 or 3) of the panel's headings ("Recent conversations", help articles) and of the open conversation's title, to fit the page outline.
   * `"none"` renders them as paragraphs, for a widget shown as an example.
   * @default 3
   */
  headingLevel?: HeadingLevelOption;
  /** Classes for the outer element (the launcher's corner). */
  className?: string;
};

/** A help article on the widget's home view. */
export type ChatWidgetLink = {
  /** Link text. */
  label: string;
  /** Link address. */
  href: string;
  /** A second line (e.g. the section of the help centre). */
  description?: string;
  /** Open in a new tab. */
  newTab?: boolean;
};

/* Cards on the panel's own glass: the glass look without a second blur (nothing but the panel is behind them). */
const homeCard = "glass-2 [-webkit-backdrop-filter:none] [backdrop-filter:none] flex flex-col rounded-sheen-lg";

/**
 * A support chat in the corner of the page (Intercom style). The launcher shows unread
 * messages and pulses gently until the first open. The glass panel springs out of it (a quick
 * fade with reduced motion) and is a non-modal dialog: the page stays usable, Escape or the
 * minimise button closes it and focus goes back to the launcher. Home shows a greeting, recent
 * chats and "Send us a message"; a chat is the full chat view in compact density, with
 * quick-reply chips. Under 640px wide the panel is a full-screen sheet that stays above the
 * on-screen keyboard.
 *
 * Props: see {@link ChatWidgetProps}. Data: `conversations`, `messages` (per chat id),
 * `participants`, `currentUserId`, `teamIds`. State: `open` / `defaultOpen` / `onOpenChange`,
 * `conversationId` / `defaultConversationId` / `onConversationChange`. Events: `onNewConversation`,
 * `onSend`, `onReact`, `onRetry`, `onRead`. Look: `position` "right", `strategy` "fixed",
 * `quickReplies`, `homeContent`, `helpLinks`, `unreadCount`, `threadProps`, `labels`, `locale`, `now`.
 *
 * Keyboard: Enter or Space on the launcher opens the panel; Escape or the minimise button closes it and returns focus to the launcher (Escape inside a menu, the emoji picker or the photo viewer closes only that). The chat inside follows the ChatThread keys. On phones the full-screen sheet is modal: Tab stays inside it.
 * Accessibility: A dialog named by the team header (`aria-modal` only on phones, where the sheet covers the page); the launcher has `aria-expanded` and an unread count in its name; the sheet makes the page behind inert and keeps the composer above the on-screen keyboard.
 * Glass: One glass panel; home cards and bubbles reuse the look without extra blur layers.
 * Motion: The launcher pulses gently until the first open, and the panel springs out of it; reduced motion uses a quick fade.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ChatWidget, type ChatConversation, type ChatMessage } from "@sheenui/theme";
 *
 * const people = [
 *   { id: "me", name: "You" },
 *   { id: "sam", name: "Sam from Support", role: "Support" },
 * ];
 *
 * export function SupportWidget() {
 *   const [conversations] = useState<ChatConversation[]>([{ id: "c1", participantIds: ["me", "sam"] }]);
 *   const [messages] = useState<Record<string, ChatMessage[]>>({
 *     c1: [{ id: "1", senderId: "sam", text: "Hi! Need a hand?", createdAt: "2026-11-08T09:00:00Z" }],
 *   });
 *   return <ChatWidget conversations={conversations} messages={messages} participants={people} currentUserId="me" onSend={(id, draft) => console.log(id, draft.text)} />;
 * }
 * ```
 *
 * @see /chat/widget
 */
export function ChatWidget({
  conversations,
  messages,
  participants,
  currentUserId,
  teamIds,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  conversationId: conversationProp,
  defaultConversationId = null,
  onConversationChange,
  onNewConversation,
  onSend,
  onReact,
  onRetry,
  onRead,
  quickReplies,
  threadProps,
  homeContent,
  helpLinks,
  position = "right",
  strategy = "fixed",
  unreadCount,
  now: nowProp,
  locale,
  labels: labelsProp,
  headingLevel = 3,
  className,
}: ChatWidgetProps) {
  const SectionHeading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const now = useNow(nowProp);
  const id = useId();
  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const subtitleId = `${id}-subtitle`;
  const people = useMemo(() => toParticipantMap(participants), [participants]);
  // Inside the panel the chat is "with the team": a neutral placeholder and start note.
  const threadLabels = useMemo<Partial<ChatLabels>>(
    () => ({ placeholder: () => L.placeholder(undefined), beginning: () => L.greetingDescription, ...labelsProp }),
    [L, labelsProp],
  );

  const [open, setOpenValue] = useControllable(openProp, defaultOpen, onOpenChange);
  const [conversationId, setConversation] = useControllable<string | null>(
    conversationProp,
    defaultConversationId,
    onConversationChange,
  );

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ChatComposerHandle | null>(null);
  const [opened, setOpened] = useState(defaultOpen);

  const setOpen = useCallback(
    (next: boolean, returnFocus = true) => {
      if (next) setOpened(true);
      setOpenValue(next);
      if (!next && returnFocus) {
        // Back to the launcher when focus was in the panel (or on the launcher).
        const active = document.activeElement;
        if (
          !active ||
          active === document.body ||
          panelRef.current?.contains(active) ||
          active === launcherRef.current
        ) {
          requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
        }
      }
    },
    [setOpenValue],
  );

  // Open: focus moves into the panel (the dialog itself, so its name is read first).
  useEffect(() => {
    if (open) requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  const narrow = useMediaQuery(PHONE_QUERY);
  const sheet = narrow;
  const box = useVisualViewport(open && sheet && strategy === "fixed");
  /*
   * A full-screen sheet covers the whole page, so it is modal (aria-modal, the page behind is
   * inert and doesn't scroll): Tab and a screen reader's swipe stay in the chat. The desktop
   * panel (and a sheet inside a box, strategy="absolute") stays non-modal: the page is usable.
   */
  const modal = sheet && strategy === "fixed";
  useModalIsolation(panelRef, open && modal);

  const team = useMemo(() => {
    const ids = teamIds ?? participants.filter((p) => p.id !== currentUserId).map((p) => p.id);
    return ids.flatMap((pid) => people.get(pid) ?? []);
  }, [teamIds, participants, currentUserId, people]);

  const badge = unreadCount ?? conversations.reduce((n, c) => n + (c.unreadCount ?? 0), 0);
  const conversation = conversationId ? conversations.find((c) => c.id === conversationId) : undefined;
  const recent = useMemo(
    () =>
      [...conversations]
        .sort(
          (a, b) => toTime(b.lastMessage?.createdAt ?? b.updatedAt) - toTime(a.lastMessage?.createdAt ?? a.updatedAt),
        )
        .slice(0, 3),
    [conversations],
  );

  // Where to put focus after switching views.
  const view = conversation ? "thread" : "home";
  const lastView = useRef(view);
  const backTarget = useRef<string | null>(null);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      if (view === "thread") {
        if (!coarse) composerRef.current?.focus();
        else panel.querySelector<HTMLElement>("[data-widget-back]")?.focus({ preventScroll: true });
      } else {
        const target = backTarget.current
          ? panel.querySelector<HTMLElement>(`[data-widget-conversation="${CSS.escape(backTarget.current)}"]`)
          : null;
        (target ?? panel.querySelector<HTMLElement>("[data-widget-start]"))?.focus({ preventScroll: true });
      }
    });
  }, [view, coarse]);

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    // React events bubble out of portals: Escape in a menu, the emoji picker or the photo viewer
    // opened from the panel closes that popup, not the whole chat.
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
    event.preventDefault();
    setOpen(false);
  }

  function startNew() {
    const created = onNewConversation?.();
    if (created) {
      backTarget.current = null;
      setConversation(created);
    }
  }

  const right = position === "right";
  const corner = right
    ? "right-[max(1.25rem,env(safe-area-inset-right))]"
    : "left-[max(1.25rem,env(safe-area-inset-left))]";
  const origin = right ? "bottom right" : "bottom left";

  const headerPeople = team.slice(0, 3);
  const agent = conversation
    ? (conversation.participantIds.map((p) => people.get(p)).find((p) => p && p.id !== currentUserId) ?? team[0])
    : team[0];

  /* ----- Panel ----- */
  const panelMotion = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: duration.fast } },
        exit: { opacity: 0, transition: exitTransition },
      }
    : sheet
      ? {
          initial: { y: "100%" },
          animate: { y: 0, transition: spring.gentle },
          exit: { y: "100%", transition: { ...exitTransition, duration: duration.base } },
        }
      : {
          initial: { opacity: 0, scale: 0.4, y: 28 },
          animate: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { ...spring.gentle, opacity: { duration: duration.fast } },
          },
          exit: { opacity: 0, scale: 0.85, y: 16, transition: exitTransition },
        };

  const slide = (direction: 1 | -1) =>
    reduced
      ? { initial: false as const, animate: { x: 0 }, exit: { x: 0, transition: { duration: 0 } } }
      : {
          initial: { x: `${direction * 100}%` },
          animate: { x: 0, transition: spring.gentle },
          exit: { x: `${direction * -30}%`, transition: exitTransition },
        };

  const minimize = (
    <Tooltip content={L.minimize} delay={300}>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={L.minimize}
        className={cn(chatIconButton, "text-current hover:bg-sheen-accent-fg/15 hover:text-current")}
      >
        <ChevronDownIcon className="size-5" />
      </button>
    </Tooltip>
  );

  return (
    <>
      <ChatKeyframes />
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal={modal ? "true" : "false"}
            aria-labelledby={titleId}
            aria-describedby={subtitleId}
            tabIndex={-1}
            onKeyDown={onPanelKeyDown}
            data-slot="chat-widget-panel"
            {...panelMotion}
            style={{
              transformOrigin: origin,
              ...(box && sheet ? { top: box.offsetTop, height: box.height, bottom: "auto" } : null),
            }}
            className={cn(
              "glass-3 z-50 flex flex-col overflow-hidden overscroll-contain outline-none [--chat-own-fill:var(--sheen-accent-fill)]",
              strategy === "fixed" ? "fixed" : "absolute",
              sheet
                ? cn(
                    "inset-x-0 bottom-0 rounded-none border-0",
                    // Fixed: the whole screen (above the keyboard via visualViewport). Absolute: the whole box it lives in.
                    strategy === "fixed"
                      ? "h-dvh max-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
                      : "top-0",
                  )
                : cn(
                    "bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4.5rem)] h-[min(40rem,calc(100dvh-7.5rem))] w-[min(24rem,calc(100vw-2.5rem))] rounded-sheen-xl",
                    corner,
                    strategy === "absolute" && "h-[min(40rem,calc(100%-7.5rem))]",
                  ),
            )}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {conversation ? (
                  <motion.div
                    key={`thread-${conversation.id}`}
                    {...slide(1)}
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Thread header */}
                    <div className="flex shrink-0 items-center gap-2 border-b border-sheen-border px-2 py-2">
                      <Tooltip content={L.backToHome} delay={300}>
                        <button
                          type="button"
                          data-widget-back=""
                          onClick={() => {
                            backTarget.current = conversation.id;
                            setConversation(null);
                          }}
                          aria-label={L.backToHome}
                          className={chatIconButton}
                        >
                          <ChevronLeftIcon className="size-5" />
                        </button>
                      </Tooltip>
                      {agent && <ChatAvatar people={[agent]} size="md" presence={agent.presence} />}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p id={titleId} className="truncate text-sm leading-5 font-semibold">
                          {agent?.name ?? L.widgetTitle}
                        </p>
                        <p id={subtitleId} className="truncate text-xs leading-4 text-sheen-fg-muted">
                          {(conversation.typingIds ?? []).some((t) => t !== currentUserId) ? (
                            <span className="font-medium text-sheen-accent">{L.typing([], false)}</span>
                          ) : (
                            L.widgetSubtitle
                          )}
                        </p>
                      </div>
                      <Tooltip content={L.minimize} delay={300}>
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          aria-label={L.minimize}
                          className={chatIconButton}
                        >
                          <ChevronDownIcon className="size-5" />
                        </button>
                      </Tooltip>
                    </div>
                    <ChatThread
                      conversation={conversation}
                      messages={messages[conversation.id] ?? []}
                      participants={participants}
                      currentUserId={currentUserId}
                      showHeader={false}
                      headingLevel={headingLevel}
                      surface="none"
                      density="compact"
                      quickReplies={
                        (messages[conversation.id] ?? []).some((m) => m.senderId === currentUserId)
                          ? undefined
                          : quickReplies
                      }
                      onSend={(draft) => onSend?.(conversation.id, draft)}
                      onReact={onReact ? (m, emoji, add) => onReact(conversation.id, m, emoji, add) : undefined}
                      onRetry={onRetry ? (m) => onRetry(conversation.id, m) : undefined}
                      onRead={() => onRead?.(conversation.id)}
                      composerRef={composerRef}
                      now={now}
                      locale={locale}
                      labels={threadLabels}
                      {...threadProps}
                      className={cn("min-h-0 flex-1", threadProps?.className)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="home"
                    {...slide(-1)}
                    className="absolute inset-0 flex flex-col overflow-y-auto overscroll-contain [scrollbar-width:thin]"
                  >
                    {/* Hero */}
                    {/* Fades out under the greeting card (a mask on the hero itself, which holds no glass), so no hard edge shows through. */}
                    <div className="sheen-fill relative shrink-0 overflow-hidden px-5 pt-4 pb-14 text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] [mask-image:linear-gradient(to_bottom,var(--sheen-ink-0)_calc(100%-3.5rem),transparent)]">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -end-10 -top-16 size-48 rounded-full bg-sheen-accent-fg/12 blur-2xl"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-20 -start-8 size-40 rounded-full bg-(--sheen-teal-400)/35 blur-2xl"
                      />
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="flex -space-x-2.5">
                          {headerPeople.map((p) => (
                            <ChatAvatar
                              key={p.id}
                              people={[p]}
                              size="md"
                              className="rounded-full ring-2 ring-sheen-accent-fg/70"
                            />
                          ))}
                        </span>
                        {minimize}
                      </div>
                      <p className="relative mt-5 text-2xl leading-tight font-semibold tracking-tight">{L.greeting}</p>
                      <p id={titleId} className="relative mt-1 text-sm font-medium text-sheen-accent-fg">
                        {L.widgetTitle}
                      </p>
                      <p
                        id={subtitleId}
                        className="relative mt-0.5 flex items-center gap-1.5 text-xs text-sheen-accent-fg"
                      >
                        <span
                          aria-hidden
                          className="size-2 rounded-full bg-(--sheen-green-400) ring-2 ring-sheen-accent-fg/30 forced-colors:bg-[CanvasText]"
                        />
                        {L.widgetSubtitle}
                      </p>
                    </div>

                    <div className="relative -mt-9 flex flex-col gap-3 px-3 pb-4">
                      {/* The one card that blurs (it sits over the hero); the rest sit on the panel's own glass. */}
                      <div className="glass-2 flex flex-col gap-3 rounded-sheen-lg p-4">
                        <p className="text-sm text-sheen-fg-muted">{L.greetingDescription}</p>
                        {homeContent}
                        <Button
                          data-widget-start=""
                          onClick={startNew}
                          disabled={!onNewConversation}
                          trailing={<SendIcon className="size-4" />}
                          fullWidth
                          className="any-pointer-coarse:h-11"
                        >
                          {L.sendUsMessage}
                        </Button>
                      </div>

                      {recent.length > 0 && (
                        <section aria-labelledby={`${id}-recent`} className={cn(homeCard, "py-2")}>
                          <SectionHeading
                            id={`${id}-recent`}
                            className="px-4 pt-1 pb-1.5 text-xs font-semibold text-sheen-fg-muted"
                          >
                            {L.recentConversations}
                          </SectionHeading>
                          <ul className="flex flex-col">
                            {recent.map((c) => {
                              const last = c.lastMessage;
                              const sender = last ? people.get(last.senderId) : undefined;
                              const date = toDate(last?.createdAt ?? c.updatedAt);
                              const time = date ? formatListTime(date, now, locale, L.justNow) : null;
                              const unread = c.unreadCount ?? 0;
                              const name = conversationTitle(c, people, currentUserId);
                              return (
                                <li key={c.id}>
                                  <button
                                    type="button"
                                    data-widget-conversation={c.id}
                                    onClick={() => setConversation(c.id)}
                                    className={cn(
                                      "group/recent flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-start",
                                      "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
                                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
                                    )}
                                  >
                                    <ChatAvatar
                                      people={sender && sender.id !== currentUserId ? [sender] : team.slice(0, 1)}
                                      size="md"
                                    />
                                    <span className="flex min-w-0 flex-1 flex-col">
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={cn(
                                            "min-w-0 flex-1 truncate text-sm",
                                            unread ? "font-semibold" : "font-medium",
                                          )}
                                        >
                                          {name}
                                        </span>
                                        {time && (
                                          <span className="shrink-0 text-xs text-sheen-fg-muted">
                                            <span aria-hidden>{time.short}</span>
                                            <span className="sr-only">, {time.long}</span>
                                          </span>
                                        )}
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <span className="min-w-0 flex-1 truncate text-xs text-sheen-fg-muted">
                                          {last
                                            ? `${last.senderId === currentUserId ? `${L.youPrefix} ` : ""}${messageSummary(last, L, last.senderId === currentUserId)}`
                                            : ""}
                                        </span>
                                        <UnreadBadge count={unread} label={L.unreadCount(unread)} />
                                      </span>
                                    </span>
                                    <ChevronRightIcon className="size-4 shrink-0 text-sheen-fg-muted transition-[translate] duration-(--sheen-duration-fast) motion-ok:group-hover/recent:translate-x-0.5 rtl:motion-ok:group-hover/recent:-translate-x-0.5" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </section>
                      )}

                      {helpLinks && helpLinks.length > 0 && (
                        <nav aria-labelledby={`${id}-help`} className={cn(homeCard, "py-2")}>
                          <SectionHeading
                            id={`${id}-help`}
                            className="px-4 pt-1 pb-1.5 text-xs font-semibold text-sheen-fg-muted"
                          >
                            {L.helpHeading}
                          </SectionHeading>
                          <ul className="flex flex-col">
                            {helpLinks.map((link) => (
                              <li key={link.href}>
                                <a
                                  href={link.href}
                                  target={link.newTab ? "_blank" : undefined}
                                  rel={link.newTab ? "noopener noreferrer" : undefined}
                                  className={cn(
                                    "group/help flex min-h-11 items-center gap-3 px-4 py-2 text-start",
                                    "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
                                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
                                  )}
                                >
                                  <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-medium">{link.label}</span>
                                    {link.description && (
                                      <span className="truncate text-xs text-sheen-fg-muted">{link.description}</span>
                                    )}
                                  </span>
                                  <ChevronRightIcon className="size-4 shrink-0 text-sheen-fg-muted transition-[translate] duration-(--sheen-duration-fast) motion-ok:group-hover/help:translate-x-0.5 rtl:motion-ok:group-hover/help:-translate-x-0.5" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <div
        className={cn(
          strategy === "fixed" ? "fixed" : "absolute",
          "bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50",
          corner,
          open && sheet && "hidden",
          className,
        )}
      >
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? L.closeChat : badge > 0 ? `${L.openChat}, ${L.widgetUnread(badge)}` : L.openChat}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-haspopup="dialog"
          className={cn(
            "sheen-fill group/launcher relative flex size-14 cursor-pointer items-center justify-center rounded-full text-sheen-accent-fg [background-image:var(--sheen-accent-fill)]",
            "shadow-(--sheen-accent-fill-shadow)",
            "transition-[scale,filter] duration-(--sheen-duration-snappy) ease-sheen-snappy hover:brightness-110 motion-ok:hover:scale-105 motion-ok:active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheen-focus",
          )}
        >
          {/*
            A gentle pulse until the first open: two rings (under 5s, so it never needs a pause
            button), again whenever the unread count goes up. Gone with reduced motion.
          */}
          {!opened && (
            <span
              key={badge}
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full bg-sheen-accent opacity-0 motion-ok:animate-[sheen-chat-attention_var(--sheen-duration-loop-slow)_var(--sheen-ease-out)_2] forced-colors:hidden"
            />
          )}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={open ? "close" : "chat"}
              className="relative flex"
              initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: open ? -90 : 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={
                reduced
                  ? { opacity: 0, transition: exitTransition }
                  : { opacity: 0, rotate: open ? 90 : -90, scale: 0.5, transition: exitTransition }
              }
              transition={reduced ? { duration: duration.fast } : spring.bouncy}
            >
              {open ? <ChevronDownIcon className="size-7" /> : <ChatFilledIcon className="size-7" />}
            </motion.span>
          </AnimatePresence>
          {!open && badge > 0 && (
            <UnreadBadge
              count={badge}
              overflow={L.unreadOverflow}
              label={L.widgetUnread(badge)}
              className={cn(
                "absolute -end-0.5 -top-0.5 bg-(--sheen-danger-solid) [background-image:var(--sheen-danger-fill)] shadow-none ring-2 ring-(--sheen-surface-solid)",
                "motion-ok:animate-[sheen-chat-pop_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)]",
                chatAppearReduced,
              )}
            />
          )}
        </button>
      </div>
    </>
  );
}
