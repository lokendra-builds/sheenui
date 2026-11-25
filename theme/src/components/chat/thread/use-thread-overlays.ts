"use client";

import type { Menu as BaseMenu } from "@base-ui/react/menu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMenuHandle } from "../../menu/menu";
import type { ChatComposerEditing } from "../composer";
import { useLongPressMenuGuard } from "../hooks";
import type { ChatReplyRef } from "../types";

/** The photo viewer: which message's photos, the one shown (null = closed) and the one it was opened from. */
export type ThreadLightbox = { messageId: string; index: number | null; from: number };
/** The reaction picker: the message it is for and the bubble it sits beside. */
export type ReactionTarget = { messageId: string; anchor: HTMLElement | null };

/**
 * What the thread shows beside the log: the reply or edit the composer is on, the photo viewer, the reaction picker,
 * the info panel, the message a context menu was opened for, short notices ("Copied") and the flash of a message
 * that was jumped to. One piece of state each, plus the timers that clear the notice and the flash.
 */
export function useThreadOverlays(announce: (text: string) => void) {
  const [replyTo, setReplyTo] = useState<ChatReplyRef | null>(null);
  const [editing, setEditing] = useState<ChatComposerEditing | null>(null);
  const [lightbox, setLightbox] = useState<ThreadLightbox | null>(null);
  const [reactionTarget, setReactionTarget] = useState<ReactionTarget | null>(null);
  const [infoId, setInfoId] = useState<string | null>(null);
  // The message a picker / info panel was opened for: focus goes back to it when that closes.
  const [reactionFromId, setReactionFromId] = useState<string | null>(null);
  const [infoFromId, setInfoFromId] = useState<string | null>(null);
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
  /** The log's context menu opens only on a message (`setContextId` runs first, from the pointer or contextmenu event). */
  const onContextOpenChange = useCallback((open: boolean, details: { cancel: () => void; isCanceled: boolean }) => {
    if (open && !contextRef.current) details.cancel();
    if (!open) contextRef.current = null;
    contextOpen.current = open && !details.isCanceled;
  }, []);
  const onContextOpenChangeComplete = useCallback((open: boolean) => {
    if (!open && !contextRef.current) setContextIdState(null);
  }, []);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  const moreMenu: BaseMenu.Handle<string> = useMemo(() => createMenuHandle<string>(), []);

  useEffect(
    () => () => {
      window.clearTimeout(noticeTimer.current);
      window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const showNotice = useCallback(
    (text: string) => {
      setNotice(text);
      announce(text);
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(null), 1800);
    },
    [announce],
  );

  /** Highlight a message briefly (after a jump to it). */
  const flash = useCallback((id: string) => {
    setFlashId(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 1400);
  }, []);

  return {
    replyTo,
    setReplyTo,
    editing,
    setEditing,
    lightbox,
    setLightbox,
    reactionTarget,
    setReactionTarget,
    infoId,
    setInfoId,
    reactionFromId,
    setReactionFromId,
    infoFromId,
    setInfoFromId,
    contextId,
    setContextId,
    onContextOpenChange,
    onContextOpenChangeComplete,
    longPressGuard,
    notice,
    showNotice,
    flashId,
    flash,
    moreMenu,
  };
}
