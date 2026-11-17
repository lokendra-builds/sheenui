"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "../lib/cn";
import { Button } from "../components/button/button";
import { DescriptionList } from "../components/description-list/description-list";
import { EmptyState } from "../components/empty-state/empty-state";
import { SideDrawer, SideDrawerBody, SideDrawerContent, SideDrawerHeader } from "../components/side-drawer/side-drawer";
import { Switch } from "../components/switch/switch";
import { ChatAvatar, chatNoBlur } from "../components/chat/chat-parts";
import { ChatThread, type ChatThreadProps } from "../components/chat/chat-thread";
import type { ChatComposerHandle } from "../components/chat/composer";
import {
  ConversationList,
  type ConversationListHandle,
  type ConversationListProps,
} from "../components/chat/conversation-list";
import {
  conversationTitle,
  formatRelative,
  isGroup,
  otherMembers,
  toDate,
  toParticipantMap,
} from "../components/chat/format";
import { useNow } from "../components/chat/hooks";
import { resolveChatLabels, type ChatLabels } from "../components/chat/labels";
import { ImageLightbox } from "../components/chat/message-parts";
import type {
  ChatConversation,
  ChatConversationAction,
  ChatDraft,
  ChatMessage,
  ChatParticipant,
} from "../components/chat/types";
import { BanIcon, ChatsIcon, LogOutIcon } from "../components/chat/icons";

/** Props of `ChatApp`. Every `on*` callback is optional; without one the matching control is hidden or does nothing. */
export type ChatAppProps = {
  /** Lists the chats to show (`ChatConversation[]`). */
  conversations: ChatConversation[];
  /** Everyone who appears in the chats, including the current user (`ChatParticipant[]`). */
  participants: ChatParticipant[];
  /** The `id` of the signed-in participant: their messages sit on the right. */
  currentUserId: string;
  /** Messages per chat id, oldest first (load a chat's messages when it is selected). */
  messages: Record<string, ChatMessage[] | undefined>;
  /** The open chat (controlled); null shows the list on phones and "Pick a chat" on wide screens. */
  selectedId?: string | null;
  /** The chat open at first when `selectedId` is not controlled (`string | null`, default `null`). */
  defaultSelectedId?: string | null;
  /** Called when a chat is opened or closed: keep it in the URL to deep-link a chat. */
  onSelectedIdChange?: (conversationId: string | null) => void;
  /** Shows skeleton rows in the conversation list while it loads. */
  loading?: boolean;
  /** Whether a chat has earlier messages to load. */
  hasOlder?: (conversationId: string) => boolean;
  /** The chat whose earlier messages are loading. */
  loadingOlderId?: string | null;
  /** Load a chat's earlier messages (the thread asks when its top is reached). */
  onLoadOlder?: (conversationId: string) => void;
  /** A message (text, attachments, reply) was sent from the composer. */
  onSend?: (conversationId: string, draft: ChatDraft) => void;
  /** A sent message's text was edited. */
  onEdit?: (conversationId: string, messageId: string, text: string) => void;
  /** A message was deleted. */
  onDelete?: (conversationId: string, message: ChatMessage) => void;
  /** A reaction was added (`add: true`) or removed. */
  onReact?: (conversationId: string, message: ChatMessage, emoji: string, add: boolean) => void;
  /** "Retry" was pressed on a message that failed to send. */
  onRetry?: (conversationId: string, message: ChatMessage) => void;
  /** The newest message of a chat was seen: clear its unread count. */
  onRead?: (conversationId: string) => void;
  /** The current user started or stopped typing: send it on to the other side. */
  onTyping?: (conversationId: string, typing: boolean) => void;
  /** Store a chat's unsent text (shown as "Draft: …" in the list). Without it, drafts are kept in memory. */
  onDraftChange?: (conversationId: string, text: string) => void;
  /** Pin, mute, archive, mark read… (list and info panel). */
  onConversationAction?: (conversation: ChatConversation, action: ChatConversationAction) => void;
  /** Shows a call button in the chat header. */
  onCall?: (conversation: ChatConversation) => void;
  /** Shows a video-call button in the chat header. */
  onVideoCall?: (conversation: ChatConversation) => void;
  /** Shows "Block" in a person's info panel. */
  onBlock?: (participant: ChatParticipant) => void;
  /** Shows "Leave group" in a group's info panel. */
  onLeaveGroup?: (conversation: ChatConversation) => void;
  /** Extra props for the list and the chat view. */
  listProps?: Partial<ConversationListProps>;
  /** Passes extra props to the chat view (`Partial<ChatThreadProps>`). */
  threadProps?: Partial<ChatThreadProps>;
  /** Container width (px) below which the panes stack (list, then chat). Default 640: from there up, a tablet in portrait gets both panes. */
  stackBelow?: number;
  /**
   * The current time for "5m" and "last seen" labels. Default: the real clock, refreshed every
   * 30 seconds. On a prerendered or server-rendered page pass a fixed date, so the HTML matches
   * what the browser renders when it hydrates (and move it forward yourself after mounting).
   */
  now?: Date;
  /** Sets the BCP 47 locale for times and dates. Default: the browser's; pass one on prerendered pages. */
  locale?: string;
  /** Overrides for the built-in English strings (`Partial<ChatLabels>`). */
  labels?: Partial<ChatLabels>;
  /** Classes for the outer element (give it a height). */
  className?: string;
};

/** The "New messages" line of the open chat. `pending`: its messages are not loaded yet. */
type UnreadMark = { id: string; value: string | null; pending: boolean };

/*
 * Stacked panes slide (translate only: they hold glass). Tailwind's translate-* utilities set the
 * separate `translate` property, so that is what transitions. A pane turns invisible after its
 * slide out, visible at once. Reduced motion drops `translate` from transitions (motion.css): it jumps.
 */
const slideHide =
  "[transition:translate_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),visibility_0s_linear_var(--sheen-duration-slow)]";
const slideShow =
  "[transition:translate_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),visibility_0s_linear_0s]";

/** The image attachments shared in a chat's messages (deleted messages excluded), recomputed only when the thread changes. */
function useSharedPhotos(thread: ChatMessage[] | undefined) {
  return useMemo(
    () => (thread ?? []).flatMap((m) => (m.deleted ? [] : (m.attachments ?? []).filter((a) => a.kind === "image"))),
    [thread],
  );
}

/**
 * A messaging app: the chat list and the open chat side by side on wide containers; on narrow
 * ones (by the block's own width, not the screen's) the list, then the chat sliding in over it
 * with a back button. Focus follows: opening a chat on a phone moves focus to its name, going
 * back returns it to the chat's row; opening one with the keyboard on a wide layout moves it
 * to the composer. Contact or group info opens in a side drawer: avatar, about, phone and
 * email (with copy buttons), members, shared photos, mute and block / leave.
 *
 * Props (see `ChatAppProps`): `conversations`, `participants`, `currentUserId` and `messages`
 * (a map of chat id to messages) are required; `selectedId` / `defaultSelectedId` /
 * `onSelectedIdChange` open a chat (controlled or not); `onSend`, `onEdit`, `onDelete`,
 * `onReact`, `onRetry`, `onRead`, `onTyping`, `onDraftChange`, `onConversationAction`, `onCall`,
 * `onVideoCall`, `onBlock`, `onLeaveGroup` report what the person did; `stackBelow` (`640`),
 * `now`, `locale`, `labels`, `listProps`, `threadProps` and `className` adjust the rest.
 *
 * Keyboard: Tab moves between the list, the chat and the composer; in the list the arrow keys
 * move between chats and Enter opens one; Escape closes the info drawer; Enter sends, Shift+Enter
 * adds a line. Focus is managed on every pane change (see above).
 * Accessibility: the list and the thread are labelled regions; new messages and typing are
 * announced politely; message status (sent, delivered, failed) is text, not colour alone.
 * Glass and motion: the list, the chat header and the composer are glass panes, the message
 * area is not (blur is kept off scrolling content). The pane slide uses `translate` only;
 * reduced motion makes it a jump and reduced transparency makes the glass solid.
 *
 * @example
 * ```tsx
 * import { ChatApp } from "@sheenui/theme";
 *
 * const send = (conversationId: string, draft: unknown) =>
 *   fetch(`/api/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify(draft) });
 *
 * export function Example() {
 *   return (
 *     <ChatApp
 *       className="h-[640px]"
 *       currentUserId="me"
 *       participants={[{ id: "me", name: "You" }, { id: "ada", name: "Ada Lovelace", presence: "online" }]}
 *       conversations={[{ id: "c1", participantIds: ["me", "ada"], unreadCount: 0 }]}
 *       messages={{ c1: [{ id: "m1", senderId: "ada", text: "Hello!", createdAt: new Date().toISOString() }] }}
 *       onSend={(conversationId, draft) => send(conversationId, draft)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/chat-app
 */
export function ChatApp({
  conversations,
  participants,
  currentUserId,
  messages,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedIdChange,
  loading = false,
  hasOlder,
  loadingOlderId = null,
  onLoadOlder,
  onSend,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onRead,
  onTyping,
  onDraftChange,
  onConversationAction,
  onCall,
  onVideoCall,
  onBlock,
  onLeaveGroup,
  listProps,
  threadProps,
  stackBelow = 640,
  now: nowProp,
  locale,
  labels: labelsProp,
  className,
}: ChatAppProps) {
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  const now = useNow(nowProp);
  const people = useMemo(() => toParticipantMap(participants), [participants]);

  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelectedId);
  const selectedId = selectedProp !== undefined ? selectedProp : innerSelected;
  const select = useCallback(
    (id: string | null) => {
      if (selectedProp === undefined) setInnerSelected(id);
      onSelectedIdChange?.(id);
    },
    [selectedProp, onSelectedIdChange],
  );

  /* ----- Width: two panes or a stack ----- */
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setNarrow(el.getBoundingClientRect().width < stackBelow);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stackBelow]);

  /* ----- The open chat (kept while it slides out on a phone) ----- */
  const selected = selectedId ? conversations.find((c) => c.id === selectedId) : undefined;
  const [shownId, setShownId] = useState<string | null>(selectedId);
  if (selectedId && selectedId !== shownId) setShownId(selectedId);
  const shown = selected ?? (shownId ? conversations.find((c) => c.id === shownId) : undefined);
  const threadOpen = Boolean(selected);

  /*
   * The first unread message when the chat was opened: "New messages" stays there while it is
   * open. Worked out in the same render that selects the chat (React re-renders before the
   * children mount), so ChatThread mounts with it and opens at that line, not at the bottom.
   * Opening the chat again later starts afresh.
   */
  const markFor = (id: string | null): UnreadMark | null => {
    if (!id) return null;
    const conversation = conversations.find((c) => c.id === id);
    const list = messages[id];
    if (!list) return { id, value: null, pending: true };
    if (!conversation) return { id, value: null, pending: false };
    const unread = conversation.unreadCount ?? 0;
    // The first message from someone else among the unread ones (more unread than loaded: the first loaded).
    const candidate =
      unread > 0
        ? list.slice(Math.max(0, list.length - unread)).find((m) => m.senderId !== currentUserId && m.kind !== "system")
        : undefined;
    return { id, value: candidate?.id ?? null, pending: false };
  };
  const [unreadMark, setUnreadMark] = useState<UnreadMark | null>(() => markFor(selectedId));
  const [markedSelection, setMarkedSelection] = useState(selectedId);
  if (markedSelection !== selectedId) {
    setMarkedSelection(selectedId);
    // Closing keeps the mark of the chat that slides out.
    if (selectedId) setUnreadMark(markFor(selectedId));
  } else if (selectedId && unreadMark?.id === selectedId && unreadMark.pending && messages[selectedId]) {
    setUnreadMark(markFor(selectedId));
  }

  /* ----- Drafts (kept here when the app doesn't store them) ----- */
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draftOf = (c: ChatConversation) => (onDraftChange ? (c.draft ?? "") : (drafts[c.id] ?? ""));
  const setDraft = (id: string, text: string) => {
    if (onDraftChange) onDraftChange(id, text);
    else setDrafts((all) => ({ ...all, [id]: text }));
  };

  // The list shows other chats' drafts, not the one you are typing in.
  const listConversations = useMemo(
    () =>
      conversations.map((c) => {
        const draft = onDraftChange ? c.draft : drafts[c.id];
        if (c.id === selectedId) return c.draft ? { ...c, draft: undefined } : c;
        return draft !== c.draft ? { ...c, draft: draft === "" ? undefined : draft } : c;
      }),
    [conversations, drafts, onDraftChange, selectedId],
  );

  /* ----- Focus ----- */
  const listRef = useRef<ConversationListHandle>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const composerRef = useRef<ChatComposerHandle | null>(null);
  const pendingFocus = useRef<"heading" | "composer" | null>(null);
  const selectedKey = selected?.id ?? null;
  useEffect(() => {
    if (!pendingFocus.current || !selectedKey) return;
    const frame = requestAnimationFrame(() => {
      const target = pendingFocus.current;
      pendingFocus.current = null;
      if (target === "heading") headingRef.current?.focus({ preventScroll: true });
      else if (target === "composer") composerRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedKey]);

  function open(conversation: ChatConversation, via: "pointer" | "keyboard") {
    if (narrow) pendingFocus.current = "heading";
    else if (via === "keyboard") pendingFocus.current = "composer";
    select(conversation.id);
  }

  function back() {
    const id = selectedId;
    select(null);
    requestAnimationFrame(() => listRef.current?.focus(id));
  }

  /* ----- Info panel ----- */
  const [infoOpen, setInfoOpen] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  // The shared photo that opened the viewer: focus goes back to it on close.
  const photoFrom = useRef(0);
  const info = shown;
  const group = info ? isGroup(info) : false;
  const others = info ? otherMembers(info, people, currentUserId) : [];
  const person = info && !group ? others[0] : undefined;
  const title = info ? conversationTitle(info, people, currentUserId) : "";
  const photos = useSharedPhotos(info ? messages[info.id] : undefined);

  const presenceText = (p: ChatParticipant | undefined) => {
    if (!p) return undefined;
    if (p.presence === "online") return L.online;
    if (p.presence === "away") return L.away;
    const seen = toDate(p.lastSeenAt);
    return seen ? L.lastSeen(formatRelative(seen, now, locale)) : undefined;
  };

  return (
    <div
      ref={rootRef}
      data-slot="chat-app"
      data-layout={narrow ? "stack" : "split"}
      className={cn(
        "glass-3 relative flex h-[40rem] min-h-0 w-full min-w-0 overflow-hidden rounded-sheen-xl",
        className,
      )}
    >
      {/* List */}
      <div
        inert={narrow && threadOpen}
        className={cn(
          "flex min-h-0 min-w-0 flex-col",
          narrow
            ? cn(
                "absolute inset-0",
                // Hidden only once the chat has slid over it; shown at once when going back.
                threadOpen
                  ? cn(slideHide, "invisible -translate-x-1/4 rtl:translate-x-1/4")
                  : cn(slideShow, "visible translate-x-0"),
              )
            : "w-[clamp(15rem,40%,24rem)] shrink-0 border-e border-sheen-border",
        )}
      >
        <ConversationList
          ref={listRef}
          conversations={listConversations}
          participants={participants}
          currentUserId={currentUserId}
          selectedId={selectedId}
          onSelect={open}
          onAction={onConversationAction}
          loading={loading}
          now={now}
          locale={locale}
          labels={labelsProp}
          {...listProps}
        />
        {/* Dims the list while a chat slides over it (phones). */}
        {narrow && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 bg-sheen-scrim transition-opacity duration-(--sheen-duration-slow) ease-sheen-out",
              threadOpen ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>

      {/* Chat */}
      <div
        inert={narrow && !threadOpen}
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          narrow &&
            cn(
              "absolute inset-0 bg-(--sheen-glass-3-bg) shadow-[-12px_0_32px_-16px_var(--sheen-shadow-far)] rtl:shadow-[12px_0_32px_-16px_var(--sheen-shadow-far)]",
              threadOpen
                ? cn(slideShow, "visible translate-x-0")
                : cn(slideHide, "invisible translate-x-full rtl:-translate-x-full"),
            ),
        )}
      >
        {shown && (threadOpen || narrow) ? (
          <ChatThread
            key={shown.id}
            conversation={shown}
            messages={messages[shown.id] ?? []}
            participants={participants}
            currentUserId={currentUserId}
            surface="none"
            headingRef={headingRef}
            composerRef={composerRef}
            firstUnreadId={unreadMark?.id === shown.id ? unreadMark.value : null}
            hasOlder={hasOlder?.(shown.id) ?? false}
            loadingOlder={loadingOlderId === shown.id}
            onLoadOlder={onLoadOlder ? () => onLoadOlder(shown.id) : undefined}
            onSend={onSend ? (d) => onSend(shown.id, d) : undefined}
            onEdit={onEdit ? (id, text) => onEdit(shown.id, id, text) : undefined}
            onDelete={onDelete ? (m) => onDelete(shown.id, m) : undefined}
            onReact={onReact ? (m, e, add) => onReact(shown.id, m, e, add) : undefined}
            onRetry={onRetry ? (m) => onRetry(shown.id, m) : undefined}
            onRead={onRead ? () => onRead(shown.id) : undefined}
            onTyping={onTyping ? (t) => onTyping(shown.id, t) : undefined}
            draft={draftOf(shown)}
            onDraftChange={(t) => setDraft(shown.id, t)}
            onBack={narrow ? back : undefined}
            onCall={onCall ? () => onCall(shown) : undefined}
            onVideoCall={onVideoCall ? () => onVideoCall(shown) : undefined}
            onInfo={() => setInfoOpen(true)}
            now={now}
            locale={locale}
            labels={labelsProp}
            {...threadProps}
          />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ChatsIcon className="size-6" />}
              title={L.selectChatTitle}
              description={L.selectChatDescription}
              headingLevel={false}
            />
          </div>
        )}
      </div>

      {/* Contact / group info */}
      <SideDrawer open={infoOpen && Boolean(info)} onOpenChange={setInfoOpen}>
        <SideDrawerContent
          size="sm"
          // Back to the chat's info button (Safari doesn't focus a tapped button, so "the trigger" may be unknown).
          finalFocus={() =>
            rootRef.current?.querySelector<HTMLElement>("[data-slot=chat-thread] [data-chat-info]") ?? true
          }
        >
          <SideDrawerHeader title={group ? L.groupInfo : L.contactInfo} />
          <SideDrawerBody>
            {info && (
              <div className="flex flex-col gap-6 px-4 pb-6 @sm/side-drawer:px-5">
                <div className="flex flex-col items-center gap-2 pt-2 text-center">
                  <ChatAvatar
                    people={others.slice(0, 2)}
                    src={info.avatarUrl}
                    name={title}
                    size="2xl"
                    presence={person?.presence}
                  />
                  <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-sheen-fg-muted">
                    {group
                      ? L.members(info.participantIds.length, others.filter((p) => p.presence === "online").length)
                      : presenceText(person)}
                  </p>
                  {person?.about && <p className="max-w-xs text-sm text-pretty">{person.about}</p>}
                </div>

                {person && (Boolean(person.phone) || person.email) && (
                  <DescriptionList
                    variant="glass"
                    size="sm"
                    items={[
                      ...(person.phone
                        ? [
                            {
                              id: "phone",
                              label: L.phone,
                              value: (
                                <a
                                  href={`tel:${person.phone.replace(/\s+/g, "")}`}
                                  className="text-sheen-accent underline-offset-2 hover:underline"
                                >
                                  {person.phone}
                                </a>
                              ),
                              copyValue: person.phone,
                            },
                          ]
                        : []),
                      ...(person.email
                        ? [
                            {
                              id: "email",
                              label: L.email,
                              value: (
                                <a
                                  href={`mailto:${person.email}`}
                                  className="text-sheen-accent underline-offset-2 hover:underline"
                                >
                                  {person.email}
                                </a>
                              ),
                              copyValue: person.email,
                            },
                          ]
                        : []),
                    ]}
                  />
                )}

                {group && (
                  <section className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold tracking-wide text-sheen-fg-muted uppercase">
                      {L.membersHeading(info.participantIds.length)}
                    </h4>
                    <ul className={cn("glass-2 flex flex-col rounded-sheen-lg py-1", chatNoBlur)}>
                      {info.participantIds.map((pid) => {
                        const p = people.get(pid);
                        if (!p) return null;
                        return (
                          <li key={pid} className="flex items-center gap-3 px-3 py-2">
                            <ChatAvatar people={[p]} size="sm" presence={p.presence} />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {pid === currentUserId ? `${p.name} (${L.you})` : p.name}
                            </span>
                            <span className="shrink-0 text-xs text-sheen-fg-muted">{p.role ?? presenceText(p)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                <section className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold tracking-wide text-sheen-fg-muted uppercase">{L.sharedMedia}</h4>
                  {photos.length ? (
                    <ul className="grid grid-cols-3 gap-1.5">
                      {photos.slice(0, 9).map((p, i) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            data-shared-photo={i}
                            onClick={() => {
                              photoFrom.current = i;
                              setPhoto(i);
                            }}
                            aria-label={L.openImage(p.alt ?? p.name)}
                            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-sheen-sm bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus"
                          >
                            <img
                              src={p.thumbnailUrl ?? p.url}
                              alt=""
                              className="size-full object-cover transition-[scale] duration-(--sheen-duration-slow) motion-ok:hover:scale-105"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-sheen-fg-muted">{L.noSharedMedia}</p>
                  )}
                </section>

                <div className={cn("glass-2 flex flex-col gap-1 rounded-sheen-lg p-2", chatNoBlur)}>
                  {onConversationAction && (
                    <div className="px-2 py-1.5">
                      <Switch
                        label={L.muteNotifications}
                        checked={Boolean(info.muted)}
                        onCheckedChange={(on) => onConversationAction(info, on ? "mute" : "unmute")}
                      />
                    </div>
                  )}
                  {person && onBlock && (
                    <Button
                      variant="ghost"
                      leading={<BanIcon className="size-4" />}
                      onClick={() => onBlock(person)}
                      className="justify-start text-sheen-danger-text"
                    >
                      {L.block(person.name)}
                    </Button>
                  )}
                  {group && onLeaveGroup && (
                    <Button
                      variant="ghost"
                      leading={<LogOutIcon className="size-4" />}
                      onClick={() => onLeaveGroup(info)}
                      className="justify-start text-sheen-danger-text"
                    >
                      {L.leaveGroup}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </SideDrawerBody>
        </SideDrawerContent>
      </SideDrawer>
      <ImageLightbox
        images={photos}
        index={photo}
        onIndexChange={setPhoto}
        labels={L}
        finalFocus={() =>
          document.querySelector<HTMLElement>(`[data-slot=side-drawer] [data-shared-photo="${photoFrom.current}"]`)
        }
      />
    </div>
  );
}
