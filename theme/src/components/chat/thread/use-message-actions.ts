"use client";

import { useCallback, useMemo, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { useLatest } from "../../../hooks/use-latest";
import type { ConfirmOptions } from "../../alert-dialog/alert-dialog";
import type { ChatComposerEditing } from "../composer";
import { emojiName } from "../emoji";
import type { ChatLabels } from "../labels";
import type { MessageMenuHandle, MessageRowActions } from "../message-row";
import type { ToolbarStore } from "../toolbar-store";
import type { ChatMessage, ChatReplyRef } from "../types";
import type { ChatThreadProps } from "./types";
import type { ReactionTarget, ThreadLightbox } from "./use-thread-overlays";

/** What the message actions need from the thread: its callbacks, labels, ids and the overlay setters they drive. */
export type MessageActionsInput = Pick<
  ChatThreadProps,
  "onEdit" | "onDelete" | "onReact" | "onRetry" | "onLoadOlder"
> & {
  /** The messages on the page, oldest first (the deferred list the rows are drawn from). */
  messages: ChatMessage[];
  currentUserId: string;
  hasOlder: boolean;
  loadingOlder: boolean;
  L: ChatLabels;
  reduced: boolean;
  nameOf: (id: string) => string;
  domIdOf: (id: string) => string;
  announce: (text: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showNotice: (text: string) => void;
  flash: (id: string) => void;
  setStick: (follow: boolean) => void;
  setPendingFocusUp: (id: string | null) => void;
  toolbar: ToolbarStore;
  moreMenu: MessageMenuHandle;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  setReplyTo: Dispatch<SetStateAction<ChatReplyRef | null>>;
  setEditing: Dispatch<SetStateAction<ChatComposerEditing | null>>;
  setLightbox: Dispatch<SetStateAction<ThreadLightbox | null>>;
  setReactionTarget: Dispatch<SetStateAction<ReactionTarget | null>>;
  setReactionFromId: Dispatch<SetStateAction<string | null>>;
};

/**
 * Everything a message can be asked to do: reply, edit, react, copy, delete, retry, jump to the original, open its
 * actions menu, and the keyboard model of the log (↑ / ↓, Page keys, Home / End, Enter, R, E). Returns the stable
 * `actions` object the rows share (so a new inline handler from the parent never re-renders every message) and the
 * handlers the thread's menus call.
 */
export function useMessageActions({
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
  showNotice,
  flash,
  setStick,
  setPendingFocusUp,
  toolbar,
  moreMenu,
  setActiveId,
  setReplyTo,
  setEditing,
  setLightbox,
  setReactionTarget,
  setReactionFromId,
}: MessageActionsInput) {
  const setHoverId = toolbar.setHover;
  const setPinnedId = toolbar.setPinned;

  const focusMessage = useCallback(
    (id: string) => {
      const node = document.getElementById(domIdOf(id));
      if (!node) return;
      node.focus({ preventScroll: true });
      node.scrollIntoView({ block: "nearest" });
    },
    [domIdOf],
  );

  const startReply = useCallback(
    (m: ChatMessage) => {
      if (m.deleted || m.kind === "system") return;
      const kind = m.attachments?.[0]?.kind;
      setEditing(null);
      const trimmed = m.text?.trim() ?? "";
      setReplyTo({
        id: m.id,
        senderId: m.senderId,
        text: trimmed || undefined,
        attachmentKind: trimmed ? undefined : kind,
      });
      announce(L.announceReplying(nameOf(m.senderId)));
    },
    [announce, L, nameOf, setEditing, setReplyTo],
  );

  const canEdit = useCallback(
    (m: ChatMessage) =>
      m.senderId === currentUserId && !m.deleted && m.kind !== "system" && Boolean(m.text?.trim()) && Boolean(onEdit),
    [currentUserId, onEdit],
  );

  const startEdit = useCallback(
    (m: ChatMessage) => {
      if (!canEdit(m)) return;
      setReplyTo(null);
      setEditing({ id: m.id, text: m.text ?? "" });
      announce(L.announceEditing);
    },
    [canEdit, announce, L, setEditing, setReplyTo],
  );

  // Callbacks from props are read through refs: an inline handler from the parent must not
  // change the rows' shared `actions` object (that would re-render every message).
  const callbacksRef = useLatest({ onReact, onRetry });
  const react = useCallback(
    (m: ChatMessage, emoji: string, add: boolean) => {
      callbacksRef.current.onReact?.(m, emoji, add);
      announce(L.announceReaction(emojiName(emoji), add));
    },
    [callbacksRef, announce, L],
  );

  const toggleReaction = useCallback(
    (m: ChatMessage, emoji: string) => {
      const mine = m.reactions?.find((r) => r.emoji === emoji)?.userIds.includes(currentUserId) ?? false;
      react(m, emoji, !mine);
    },
    [react, currentUserId],
  );

  const copy = useCallback(
    (m: ChatMessage) => {
      const text = m.text ?? "";
      // Missing on insecure origins, although the DOM types say it always exists.
      const clipboard = (navigator as Partial<Navigator>).clipboard;
      if (!clipboard) {
        showNotice(L.copyFailed);
        return;
      }
      clipboard.writeText(text).then(
        () => showNotice(L.copied),
        () => showNotice(L.copyFailed),
      );
    },
    [showNotice, L],
  );

  const remove = useCallback(
    async (m: ChatMessage) => {
      const id = domIdOf(m.id);
      const ok = await confirm({
        tone: "danger",
        title: L.deleteTitle,
        description: L.deleteDescription,
        confirmLabel: L.deleteConfirm,
        cancelLabel: L.cancel,
        finalFocus: () => document.getElementById(id),
      });
      if (!ok) return;
      onDelete?.(m);
      announce(L.announceDeleted);
    },
    [confirm, L, onDelete, announce, domIdOf],
  );

  const jumpTo = useCallback(
    (id: string) => {
      const node = document.getElementById(domIdOf(id));
      if (!node) {
        showNotice(L.originalNotLoaded);
        return;
      }
      setStick(false);
      node.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      node.focus({ preventScroll: true });
      flash(id);
    },
    [domIdOf, reduced, showNotice, L, setStick, flash],
  );

  /** Opens the actions menu at a message (Enter, or the keyboard's menu key). */
  const openMenuAt = useCallback((node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    const own = node.dataset.own !== undefined;
    const bubble = node.querySelector<HTMLElement>(":scope > div:last-child") ?? node;
    const b = bubble.getBoundingClientRect();
    node.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: own ? Math.max(rect.left + 8, b.right - 16) : b.left + 16,
        clientY: Math.min(b.bottom - 4, b.top + 28),
      }),
    );
  }, []);

  const messagesListRef = useLatest(messages);
  const liveRef = useLatest({ hasOlder, onLoadOlder, loadingOlder, startReply, startEdit, focusMessage, openMenuAt });

  const actions = useMemo<MessageRowActions>(
    () => ({
      focus: (id) => setActiveId(id),
      hover: setHoverId,
      toolbar,
      keyDown: (event: KeyboardEvent<HTMLElement>, message: ChatMessage) => {
        const self = event.target === event.currentTarget;
        if (!self) {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.focus();
          }
          return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const list = messagesListRef.current;
        const index = list.findIndex((m) => m.id === message.id);
        const move = (to: number) => {
          const target = list[Math.max(0, Math.min(list.length - 1, to))];
          if (target) liveRef.current.focusMessage(target.id);
        };
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            if (index === 0 && liveRef.current.hasOlder && liveRef.current.onLoadOlder) {
              setPendingFocusUp(message.id);
              if (!liveRef.current.loadingOlder) liveRef.current.onLoadOlder();
            } else move(index - 1);
            break;
          case "ArrowDown":
            event.preventDefault();
            move(index + 1);
            break;
          case "PageUp":
            event.preventDefault();
            move(index - 10);
            break;
          case "PageDown":
            event.preventDefault();
            move(index + 10);
            break;
          case "Home":
            event.preventDefault();
            move(0);
            break;
          case "End":
            event.preventDefault();
            move(list.length - 1);
            break;
          case "Enter":
          case " ":
            if (message.kind === "system" || message.deleted) return;
            event.preventDefault();
            liveRef.current.openMenuAt(event.currentTarget);
            break;
          case "r":
          case "R":
            if (message.kind === "system" || message.deleted) return;
            event.preventDefault();
            liveRef.current.startReply(message);
            break;
          case "e":
          case "E":
            event.preventDefault();
            liveRef.current.startEdit(message);
            break;
        }
      },
      react,
      openReactions: (message, anchorEl) => {
        setPinnedId(message.id);
        setReactionFromId(message.id);
        setReactionTarget({ messageId: message.id, anchor: anchorEl });
      },
      reply: (message) => liveRef.current.startReply(message),
      retry: (message) => callbacksRef.current.onRetry?.(message),
      jumpTo,
      openImage: (message, index) => setLightbox({ messageId: message.id, index, from: index }),
      nameOf,
      moreMenu,
    }),
    [
      react,
      jumpTo,
      nameOf,
      moreMenu,
      callbacksRef,
      liveRef,
      messagesListRef,
      setHoverId,
      setPinnedId,
      toolbar,
      setPendingFocusUp,
      setActiveId,
      setReactionFromId,
      setReactionTarget,
      setLightbox,
    ],
  );

  /* ----- Edit your last message (↑ in an empty composer) ----- */
  const editLast = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m && canEdit(m)) {
        startEdit(m);
        return;
      }
    }
  }, [messages, canEdit, startEdit]);

  return { startReply, canEdit, startEdit, toggleReaction, copy, remove, actions, editLast };
}
