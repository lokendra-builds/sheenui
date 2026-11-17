"use client";

import { useCallback, useDeferredValue, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useConfirm } from "../alert-dialog/alert-dialog";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "../context-menu/context-menu";
import { Menu, MenuContent } from "../menu/menu";
import { Skeleton } from "../skeleton/skeleton";
import { ChatAvatar, ChatKeyframes } from "./chat-parts";
import { ChatComposer, type ChatComposerHandle } from "./composer";
import { defaultQuickReactions } from "./emoji";
import {
  conversationTitle,
  firstName,
  formatDateTime,
  isGroup,
  otherMembers,
  toDate,
  toParticipantMap,
} from "./format";
import { useAnnouncer, useCoarsePointer, useKeyboardInset, useNow } from "./hooks";
import { resolveChatLabels } from "./labels";
import { ImageLightbox } from "./message-parts";
import { TypingBubble } from "./message-row";
import { createToolbarStore } from "./toolbar-store";
import type { ChatMessage } from "./types";
import { type ChatThreadProps } from "./thread/types";
import { buildDays, type Day } from "./thread/layout";
import { usePrependedMessages } from "./thread/use-prepend";
import { useThreadOverlays } from "./thread/use-thread-overlays";
import { useMessageActions } from "./thread/use-message-actions";
import { useThreadScroll } from "./thread/use-thread-scroll";
import { MessageMenuItems, type MessageMenuContext } from "./thread/menu-items";
import { ThreadDays } from "./thread/days";
import { ThreadHeader } from "./thread/header";
import { ReactionPanel, ReactionPicker, MessageInfo, JumpToLatest, ThreadNotice } from "./thread/parts";
import { useMergedRef } from "../../lib/form";

export { type ChatThreadProps } from "./thread/types";

/**
 * One conversation: header, the message log and the composer. WhatsApp / iMessage-style
 * bubbles grouped by sender, sticky day labels, replies, reactions, photos, files, link
 * previews, delivery ticks, edits and deletes, typing, "Jump to latest" and loading of earlier
 * messages that keeps the reader's place.
 *
 * Keyboard: the log is one tab stop. ↑ / ↓ move between messages (Home / End, Page Up / Down),
 * Enter opens a message's actions, R replies, E edits your own; Tab moves on through that
 * message's links and buttons, then out of the log. Right-click (or long-press on touch, or
 * Shift + F10) opens the same actions.
 *
 * Screen readers: the log is role="log", but it is not a live region itself: only new incoming
 * messages are announced (once), never history that loads above or your own messages.
 *
 * Props: see {@link ChatThreadProps}. The chat is controlled: pass `conversation`, `messages`
 * (oldest first), `participants` and `currentUserId`, and handle `onSend`, `onEdit`, `onDelete`,
 * `onReact`, `onRetry`, `onLoadOlder` (with `hasOlder` / `loadingOlder`), `onRead`, `onTyping`.
 * Look: `showHeader` true, `showComposer` true, `density` "comfortable", `surface` "glass",
 * `labels`, `locale`, `className`.
 *
 * Accessibility: The header names the chat (heading level set by `headingLevel`); presence is written in words; delivery state, reactions and typing are spoken; the "Jump to latest" button and composer controls have names. Targets are 44px on touch screens, and forced colors give bubbles real borders.
 * Glass: One glass panel (`surface="glass"`); incoming bubbles reuse the look without their own blur so a long thread stays within the backdrop-blur budget.
 * Motion: New messages spring in, the typing dots wave and the log scrolls smoothly; reduced motion shortens these to fades and instant jumps.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ChatThread, type ChatDraft, type ChatMessage } from "@sheenui/theme";
 *
 * const people = [
 *   { id: "me", name: "You" },
 *   { id: "riya", name: "Riya Sharma", presence: "online" as const },
 * ];
 *
 * export function Support() {
 *   const [messages, setMessages] = useState<ChatMessage[]>([
 *     { id: "1", senderId: "riya", text: "Hi! How can I help?", createdAt: "2026-11-08T09:00:00Z" },
 *   ]);
 *   const send = (draft: ChatDraft) =>
 *     setMessages((list) => [...list, { id: String(list.length + 1), senderId: "me", text: draft.text, createdAt: new Date(), status: "sent" }]);
 *   return (
 *     <ChatThread
 *       conversation={{ id: "c1", participantIds: ["me", "riya"] }}
 *       messages={messages}
 *       participants={people}
 *       currentUserId="me"
 *       onSend={send}
 *     />
 *   );
 * }
 * ```
 *
 * @see /chat/thread
 */
export function ChatThread({
  conversation,
  messages: messagesProp,
  participants,
  currentUserId,
  onSend,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onLoadOlder,
  hasOlder = false,
  loadingOlder = false,
  onRead,
  onTyping,
  firstUnreadId,
  showHeader = true,
  onBack,
  onCall,
  onVideoCall,
  onInfo,
  headerActions,
  headingLevel = 2,
  headingRef,
  showComposer = true,
  draft,
  onDraftChange,
  quickReplies,
  quickReactions = defaultQuickReactions,
  allowAttachments = true,
  accept,
  composerRef: composerRefProp,
  autoFocus = false,
  density = "comfortable",
  surface = "glass",
  emptyState,
  now: nowProp,
  locale,
  labels: labelsProp,
  className,
}: ChatThreadProps) {
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  /*
   * A big change (30 earlier messages at once) renders in the background in small slices, so
   * scrolling and typing never wait for it; a single new message still shows in the next frame.
   * Everything below works from this value, so what is measured is what is on screen.
   */
  const messages = useDeferredValue(messagesProp);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const now = useNow(nowProp);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const hintId = `${baseId}-hint`;
  const [announce, announcer] = useAnnouncer();
  const [confirm, confirmDialog] = useConfirm();

  const people = useMemo(() => toParticipantMap(participants), [participants]);
  const group = isGroup(conversation);
  const others = useMemo(
    () => otherMembers(conversation, people, currentUserId),
    [conversation, people, currentUserId],
  );
  const title = conversationTitle(conversation, people, currentUserId);
  const nameOf = useCallback(
    (id: string) => (id === currentUserId ? L.you : (people.get(id)?.name ?? id)),
    [people, currentUserId, L.you],
  );
  const domIdOf = useCallback((id: string) => `${baseId}-m-${id}`, [baseId]);
  const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);

  /* ----- Earlier messages, a few at a time (see thread/use-prepend.ts) ----- */
  const { hiddenOlder, shown } = usePrependedMessages(messages);

  /* ----- Days and runs ----- */
  const days = useMemo<Day[]>(
    () => buildDays(shown, { firstUnreadId, now, locale, group, currentUserId }),
    [shown, firstUnreadId, now, locale, group, currentUserId],
  );

  /* ----- Roving focus ----- */
  const lastId = messages[messages.length - 1]?.id ?? null;
  const [activeIdState, setActiveId] = useState<string | null>(null);
  const activeId = activeIdState && byId.has(activeIdState) ? activeIdState : lastId;
  /*
   * Which row shows the hover toolbar (pinned while its menu is open, else hovered, else keyboard-focused).
   * An external store, not state: a hover re-renders the two rows involved, not the whole thread.
   */
  const [toolbar] = useState(createToolbarStore);
  const setPinnedId = toolbar.setPinned;
  const setKeyboardFocusId = toolbar.setKeyboard;
  useLayoutEffect(() => toolbar.setCoarse(coarse), [toolbar, coarse]);

  /* ----- Overlays: reply / edit, photos, reactions, info, context menu, notices (see thread/use-thread-overlays.ts) ----- */
  const ov = useThreadOverlays(announce);

  /* ----- Composer ref (ours + the caller's) ----- */
  const composer = useRef<ChatComposerHandle | null>(null);
  const setComposer = useMergedRef(composer, composerRefProp);

  /* ----- On-screen keyboard: the composer stays just above it (touch, while typing) ----- */
  const sectionRef = useRef<HTMLElement>(null);
  const [typingHere, setTypingHere] = useState(false);
  const keyboardInset = useKeyboardInset(sectionRef, coarse && typingHere && showComposer);

  /* ----- Scrolling (see thread/use-thread-scroll.ts) ----- */
  const {
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
  } = useThreadScroll({
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
  });

  /* ----- Message actions and the log's keyboard model (see thread/use-message-actions.ts) ----- */
  const { startReply, canEdit, startEdit, toggleReaction, copy, remove, actions, editLast } = useMessageActions({
    messages,
    currentUserId,
    hasOlder,
    loadingOlder,
    onEdit,
    onDelete,
    onReact,
    onRetry,
    onLoadOlder,
    L,
    reduced,
    nameOf,
    domIdOf,
    announce,
    confirm,
    showNotice: ov.showNotice,
    flash: ov.flash,
    setStick,
    setPendingFocusUp,
    toolbar,
    moreMenu: ov.moreMenu,
    setActiveId,
    setReplyTo: ov.setReplyTo,
    setEditing: ov.setEditing,
    setLightbox: ov.setLightbox,
    setReactionTarget: ov.setReactionTarget,
    setReactionFromId: ov.setReactionFromId,
  });

  /* ----- Menus ----- */
  const menuMessage = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
  const contextMessage = menuMessage(ov.contextId);

  const openReactionsFor = (m: ChatMessage) => {
    const node = document.getElementById(domIdOf(m.id));
    setPinnedId(m.id);
    ov.setReactionFromId(m.id);
    ov.setReactionTarget({
      messageId: m.id,
      anchor: node?.querySelector<HTMLElement>("[data-message-id] > div:last-child") ?? node,
    });
  };
  const openInfoFor = (m: ChatMessage) => {
    ov.setInfoFromId(m.id);
    ov.setInfoId(m.id);
  };
  const menuContext: MessageMenuContext = {
    currentUserId,
    L,
    coarse,
    quickReactions,
    hasReact: Boolean(onReact),
    onRetry,
    hasDelete: Boolean(onDelete),
    toggleReaction,
    openReactionsFor,
    openInfoFor,
    startReply,
    startEdit,
    canEdit,
    copy,
    remove,
  };

  const messageIdFrom = (target: EventTarget | null) => {
    const node = target instanceof Element ? target.closest<HTMLElement>("[data-message-id]") : null;
    if (!node || node.dataset.system !== undefined) return null;
    const m = byId.get(node.dataset.messageId ?? "");
    return m && !m.deleted ? m.id : null;
  };

  const reactionMessage = menuMessage(ov.reactionTarget?.messageId);
  const infoMessage = menuMessage(ov.infoId);
  const lightboxMessage = menuMessage(ov.lightbox?.messageId);
  const lightboxImages = (lightboxMessage?.attachments ?? []).filter((a) => a.kind === "image");
  const empty = messages.length === 0;

  const closeReactions = () => {
    ov.setReactionTarget(null);
    setPinnedId(null);
  };
  /*
   * Back to the message once the picker (or info) has closed. Base UI moves focus there itself
   * after its exit, only when focus was still inside the popup: a click elsewhere keeps its focus.
   */
  const messageNode = (id: string | null) => () => (id ? document.getElementById(domIdOf(id)) : null) ?? true;

  return (
    <section
      ref={sectionRef}
      role="group"
      aria-labelledby={titleId}
      data-slot="chat-thread"
      className={cn(
        "@container relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden [--chat-own-fill:var(--sheen-accent-fill)]",
        surface === "glass" && "glass-3 rounded-sheen-xl",
        className,
      )}
    >
      <ChatKeyframes />

      <ThreadHeader
        showHeader={showHeader}
        conversation={conversation}
        others={others}
        typingPeople={typingPeople}
        group={group}
        title={title}
        titleId={titleId}
        headingLevel={headingLevel}
        headingRef={headingRef}
        density={density}
        L={L}
        now={now}
        locale={locale}
        onBack={onBack}
        onCall={onCall}
        onVideoCall={onVideoCall}
        onInfo={onInfo}
        headerActions={headerActions}
      />

      {/* Log */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          data-chat-log=""
          // Observer-only listeners: any scroll gesture or key press tells the log the reader took over; the messages inside carry the roles.
          role="presentation"
          onScroll={onScroll}
          onWheel={noteUserScroll}
          onTouchStart={noteUserScroll}
          onKeyDown={noteUserScroll}
          // The scrollbar (a press on the log itself, not on a message).
          onPointerDown={(e) => e.target === e.currentTarget && noteUserScroll()}
          className={cn(
            "group/log min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [overflow-anchor:none] [scrollbar-gutter:stable] [scrollbar-width:thin]",
            // A faint dotted wallpaper, like a chat app's background.
            "[background-image:radial-gradient(var(--sheen-border)_1px,transparent_1.2px)] [background-size:20px_20px]",
          )}
        >
          {empty ? (
            (emptyState ?? (
              <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <ChatAvatar people={others.slice(0, 2)} src={conversation.avatarUrl} name={title} size="xl" />
                <p className="text-base font-semibold">{title}</p>
                <p className="max-w-xs text-sm text-sheen-fg-muted">{L.beginning(title)}</p>
              </div>
            ))
          ) : (
            <ContextMenu onOpenChangeComplete={ov.onContextOpenChangeComplete} onOpenChange={ov.onContextOpenChange}>
              <ContextMenuTrigger
                {...ov.longPressGuard}
                role="log"
                aria-live="off"
                aria-label={L.messagesWith(title)}
                aria-describedby={hintId}
                aria-busy={loadingOlder || hiddenOlder > 0 || undefined}
                onPointerDownCapture={(e) =>
                  (e.button === 2 || e.pointerType === "touch") && ov.setContextId(messageIdFrom(e.target))
                }
                onContextMenuCapture={(e) => {
                  const id = messageIdFrom(e.target);
                  if (!id) {
                    // Not on a message: leave the browser's own menu alone.
                    e.stopPropagation();
                    return;
                  }
                  ov.setContextId(id);
                }}
                onFocusCapture={(e) => {
                  const node = (e.target as HTMLElement).closest<HTMLElement>("[data-message-id]");
                  const visible = (e.target as HTMLElement).matches(":focus-visible");
                  setKeyboardFocusId(node && visible ? (node.dataset.messageId ?? null) : null);
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setKeyboardFocusId(null);
                }}
                className="flex min-h-full flex-col justify-end pb-3 select-text group-data-[scrolling]/log:pointer-events-none pointer-coarse:select-none focus-visible:outline-none"
              >
                <div ref={contentRef} className="flex flex-col">
                  {/* Top: earlier messages loading, or the start of the chat */}
                  {hasOlder || hiddenOlder > 0 ? (
                    // The space is kept (no jump when loading starts); the shimmering skeletons exist only while loading.
                    <div aria-hidden className="flex flex-col gap-2 px-4 pt-4" style={{ height: 136 }}>
                      {(loadingOlder || hiddenOlder > 0) && (
                        <>
                          <Skeleton shape="rect" width="52%" height={36} className="rounded-[1.25rem]" />
                          <Skeleton shape="rect" width="38%" height={36} className="ms-auto rounded-[1.25rem]" />
                          <Skeleton shape="rect" width="44%" height={36} className="rounded-[1.25rem]" />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-2 text-center">
                      <ChatAvatar people={others.slice(0, 2)} src={conversation.avatarUrl} name={title} size="lg" />
                      <p className="max-w-xs text-xs text-sheen-fg-muted">{L.beginning(title)}</p>
                    </div>
                  )}
                  {loadingOlder && <p className="sr-only">{L.loadingOlder}</p>}

                  <ThreadDays
                    days={days}
                    people={people}
                    currentUserId={currentUserId}
                    group={group}
                    activeId={activeId}
                    flashId={ov.flashId}
                    appearing={appearing}
                    nameOf={nameOf}
                    domIdOf={domIdOf}
                    density={density}
                    locale={locale}
                    L={L}
                    actions={actions}
                  />

                  {typingPeople.length > 0 && (
                    <TypingBubble
                      people={typingPeople}
                      avatarColumn={group}
                      label={L.typing(
                        typingPeople.map((p) => firstName(p.name)),
                        group,
                      )}
                    />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-60">
                {contextMessage ? <MessageMenuItems message={contextMessage} from="context" ctx={menuContext} /> : null}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>

        <p id={hintId} hidden>
          {L.logHint}
        </p>

        {/* The day at the top of the log, while scrolling (see updateDayPill). Its own glass fades, nothing else. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-2 z-[2] flex justify-center">
          <span
            ref={dayPillRef}
            className={cn(
              "glass-2 rounded-full px-3 py-1 text-xs font-medium text-sheen-fg-muted shadow-sm empty:hidden",
              "opacity-0 transition-opacity duration-(--sheen-duration-fast) ease-sheen-out data-show:opacity-100",
            )}
          />
        </div>

        {/* Jump to latest */}
        <div className="pointer-events-none absolute end-3 bottom-3 z-[3] flex flex-col items-end gap-2 @lg:end-5">
          <JumpToLatest
            store={jump}
            empty={empty}
            reduced={reduced}
            label={L.jumpToLatest}
            newBelow={L.newBelow}
            onJump={jumpToLatest}
          />
        </div>

        {/* "Copied" and similar short notes */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[3] flex justify-center px-16">
          <ThreadNotice notice={ov.notice} reduced={reduced} />
        </div>
      </div>

      {showComposer && (
        <div
          className="relative z-[4] shrink-0 border-t border-sheen-border"
          // Raised above the on-screen keyboard; the log shrinks (and keeps its newest message in view).
          style={keyboardInset ? { paddingBottom: keyboardInset } : undefined}
          onFocusCapture={(e) => (e.target as HTMLElement).localName === "textarea" && setTypingHere(true)}
          onBlurCapture={(e) => (e.target as HTMLElement).localName === "textarea" && setTypingHere(false)}
        >
          <ChatComposer
            ref={setComposer}
            onSend={(d) => {
              onSend?.(d);
              ov.setReplyTo(null);
              setStick(true);
            }}
            value={draft}
            onValueChange={onDraftChange}
            replyTo={ov.replyTo}
            onCancelReply={() => ov.setReplyTo(null)}
            editing={ov.editing}
            onSaveEdit={(id, text) => {
              onEdit?.(id, text);
              ov.setEditing(null);
            }}
            onCancelEdit={() => ov.setEditing(null)}
            onEditLast={onEdit ? editLast : undefined}
            onTyping={onTyping}
            nameOf={nameOf}
            title={title}
            quickReplies={quickReplies}
            allowAttachments={allowAttachments}
            accept={accept}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- an opt-in prop (default false) forwarded to the composer; the integrator decides when the thread is the page's main task
            autoFocus={autoFocus}
            density={density}
            locale={locale}
            labels={labelsProp}
          />
        </div>
      )}

      {/* The ⋯ menu of the hover toolbar (one for every message) */}
      <Menu
        handle={ov.moreMenu}
        onOpenChange={(open, details) => {
          if (open) {
            const id = (details.trigger as HTMLElement | undefined)?.closest<HTMLElement>("[data-message-id]")?.dataset
              .messageId;
            if (id) setPinnedId(id);
          } else if (!ov.reactionTarget) setPinnedId(null);
        }}
      >
        {({ payload }: { payload: string | undefined }) => {
          const m = menuMessage(payload);
          return (
            <MenuContent className="min-w-60" side="bottom" align="end">
              {m ? <MessageMenuItems message={m} from="more" ctx={menuContext} /> : null}
            </MenuContent>
          );
        }}
      </Menu>

      {/* Reaction picker: a popover beside the bubble (mouse), a bottom sheet (touch) */}
      <ReactionPicker
        open={Boolean(reactionMessage)}
        coarse={coarse}
        anchor={ov.reactionTarget?.anchor ?? null}
        align={reactionMessage?.senderId === currentUserId ? "end" : "start"}
        label={L.addReaction}
        finalFocus={messageNode(ov.reactionFromId)}
        onClose={closeReactions}
      >
        {reactionMessage && (
          <ReactionPanel
            message={reactionMessage}
            currentUserId={currentUserId}
            quickReactions={quickReactions}
            labels={L}
            labelsProp={labelsProp}
            coarse={coarse}
            onPick={(emoji) => {
              toggleReaction(reactionMessage, emoji);
              closeReactions();
            }}
          />
        )}
      </ReactionPicker>

      {/* Message info */}
      <MessageInfo
        message={infoMessage}
        coarse={coarse}
        locale={locale}
        labels={L}
        returnFocus={messageNode(ov.infoFromId)}
        onClose={() => ov.setInfoId(null)}
      />

      {/* Photos */}
      <ImageLightbox
        images={lightboxImages}
        index={ov.lightbox?.index ?? null}
        onIndexChange={(index) => ov.setLightbox((l) => (l ? { ...l, index } : null))}
        labels={L}
        caption={
          lightboxMessage
            ? `${nameOf(lightboxMessage.senderId)} · ${formatDateTime(toDate(lightboxMessage.createdAt) ?? now, locale)}`
            : undefined
        }
        finalFocus={() =>
          ov.lightbox
            ? document
                .getElementById(domIdOf(ov.lightbox.messageId))
                ?.querySelector<HTMLElement>(`[data-photo-index="${ov.lightbox.from}"]`)
            : null
        }
      />

      {confirmDialog}
      {announcer}
    </section>
  );
}
