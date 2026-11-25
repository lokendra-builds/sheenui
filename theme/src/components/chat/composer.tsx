"use client";

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type Ref,
  type SyntheticEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { isImeComposing } from "../../lib/ime";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Tooltip } from "../tooltip/tooltip";
import { chatIconButton, chatNoBlur } from "./chat-parts";
import { EmojiPicker } from "./emoji-picker";
import { formatFileSize } from "./format";
import { chatUid, useAnnouncer, useCoarsePointer } from "./hooks";
import { useLatest } from "../../hooks/use-latest";
import { resolveChatLabels, type ChatLabels } from "./labels";
import { QuoteBlock } from "./message-parts";
import type { ChatDraft, ChatDraftAttachment, ChatReplyRef } from "./types";
import { FileIcon, PaperclipIcon, PencilIcon, ReplyIcon, SendIcon, SmileIcon, XIcon } from "./icons";

/** A message being edited in the composer: its `id` and the text to start from. */
export type ChatComposerEditing = { id: string; text: string };

/** Imperative handle: focus the field, insert text at the caret. */
export type ChatComposerHandle = {
  /** Move focus into the text field. */
  focus: () => void;
  /** Insert `text` at the caret (or replace the selection). */
  insert: (text: string) => void;
  /** The underlying `<textarea>` (null before mount). */
  textarea: HTMLTextAreaElement | null;
};

/** Props of {@link ChatComposer}. Only `onSend` is required. */
export type ChatComposerProps = {
  /** Called with the text, picked files and the quoted message. Hand-over: image preview URLs now belong to you (revoke them when the message goes). */
  onSend: (draft: ChatDraft) => void;
  /** The draft text (controlled). Keep a draft per conversation by storing it per id. */
  value?: string;
  /**
   * The draft text on mount (uncontrolled).
   * @default ""
   */
  defaultValue?: string;
  /** Called with the text as it changes. */
  onValueChange?: (text: string) => void;
  /** The message being replied to: shows a bar above the field with a cancel button. */
  replyTo?: ChatReplyRef | null;
  /** Called when the reply bar's cancel button is pressed. */
  onCancelReply?: () => void;
  /** Edit mode: the field holds this message's text; Enter saves, Escape cancels. */
  editing?: ChatComposerEditing | null;
  /** Called with the message id and new text when an edit is saved. */
  onSaveEdit?: (id: string, text: string) => void;
  /** Called when an edit is cancelled. */
  onCancelEdit?: () => void;
  /** ↑ in an empty field: start editing your last message. */
  onEditLast?: () => void;
  /** true while the person types, false after 4s of quiet, on send and on blur. */
  onTyping?: (typing: boolean) => void;
  /** Name of a sender, for the reply bar. */
  nameOf?: (participantId: string) => string;
  /** The conversation's name, for the placeholder ("Message Riya"). */
  title?: string;
  /** Sets the placeholder text. Default: "Message {title}". */
  placeholder?: string;
  /**
   * Show the attach button and accept pasted or dropped files.
   * @default true
   */
  allowAttachments?: boolean;
  /** File types the picker offers (input accept). */
  accept?: string;
  /**
   * Maximum number of files a person can attach to one message.
   * @default 10
   */
  maxAttachments?: number;
  /** Text tapped to send at once (support chats): shown as chips above the field. */
  quickReplies?: string[];
  /**
   * Tallest the field grows before it scrolls, in lines.
   * @default 6
   */
  maxRows?: number;
  /**
   * Disable the field and every button.
   * @default false
   */
  disabled?: boolean;
  /**
   * Focus the field on mount.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Sets the row density: "compact" uses tighter padding (the chat widget).
   * @default "comfortable"
   */
  density?: "comfortable" | "compact";
  /** Ref to the imperative handle ({@link ChatComposerHandle}). */
  ref?: Ref<ChatComposerHandle>;
  /** BCP 47 locale for file sizes. Default: the browser's. */
  locale?: string;
  /** Any UI string (i18n); see {@link ChatLabels}. */
  labels?: Partial<ChatLabels>;
  /** Adds extra classes to the composer. */
  className?: string;
};

const TYPING_IDLE = 4000;

/**
 * The message field: grows with its text, emoji picker, attachments with thumbnails, reply and
 * edit bars, and a send button. Enter sends, Shift + Enter adds a line (touch keyboards: the
 * Return key adds a line, the button sends). Input methods that compose text (Japanese, Chinese,
 * Korean) are left alone until the word is committed. ↑ in an empty field edits your last message.
 * Text is 16px on touch screens, so iOS doesn't zoom the page when the field is focused.
 *
 * Props: see {@link ChatComposerProps} (`onSend` required; `value` / `defaultValue` /
 * `onValueChange`, `replyTo`, `editing`, `onTyping`, `quickReplies`, `allowAttachments` true,
 * `accept`, `maxAttachments` 10, `maxRows` 6, `disabled`, `autoFocus`, `density`, `ref`, `labels`).
 *
 * Keyboard: Enter sends (on touch keyboards Return adds a line and the button sends), Shift+Enter adds a line, Up in an empty field edits your last message, Escape cancels a reply or an edit. Attach, emoji and send are buttons in the tab order; pasting or dropping files attaches them.
 * Accessibility: The field is a labelled textarea with a hint (how to send, how many files are allowed); attaching, removing, replying and errors are announced politely; buttons have names and 44px hit areas on touch; text is 16px on touch screens so iOS does not zoom. Input methods that compose text are left alone until the word is committed.
 * Glass: One glass field; the emoji popover is the shared glass popover. Reply and attachment bars reuse the look without extra blur.
 * Motion: Bars and chips slide in and out with the SheenUI spring; reduced motion removes the movement.
 *
 * @example
 * ```tsx
 * import { ChatComposer } from "@sheenui/theme";
 *
 * export const Reply = () => (
 *   <ChatComposer title="Riya" onSend={(draft) => console.log(draft.text, draft.attachments.length)} quickReplies={["Thanks!", "On it"]} />
 * );
 * ```
 *
 * @see /chat/thread
 */
export function ChatComposer({
  onSend,
  value,
  defaultValue = "",
  onValueChange,
  replyTo,
  onCancelReply,
  editing,
  onSaveEdit,
  onCancelEdit,
  onEditLast,
  onTyping,
  nameOf,
  title,
  placeholder,
  allowAttachments = true,
  accept,
  maxAttachments = 10,
  quickReplies,
  maxRows = 6,
  disabled = false,
  autoFocus = false,
  density = "comfortable",
  ref,
  locale,
  labels: labelsProp,
  className,
}: ChatComposerProps) {
  const L = useMemo(() => resolveChatLabels(labelsProp), [labelsProp]);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const fieldId = useId();
  const hintId = useId();
  const [announce, announcer] = useAnnouncer();

  const [draft, setDraft] = useControllable(value, defaultValue, onValueChange);

  // Edit mode has its own text, so the unsent draft comes back after editing.
  const [editText, setEditText] = useState(editing?.text ?? "");
  const editingId = editing?.id ?? null;
  // Only when a different message is opened for editing (adjusted in the same render, before it paints).
  const [seenEditingId, setSeenEditingId] = useState(editingId);
  if (seenEditingId !== editingId) {
    setSeenEditingId(editingId);
    if (editing) setEditText(editing.text);
  }
  const text = editing ? editText : draft;
  const setText = editing ? setEditText : setDraft;

  const [files, setFiles] = useState<ChatDraftAttachment[]>([]);
  const filesRef = useLatest(files);
  const [dragging, setDragging] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  // Emoji picker focus return: after inserting an emoji, back to the field (keep typing); on a plain dismiss, back to the button that opened it.
  const emojiTrigger = useRef<HTMLButtonElement>(null);
  const emojiPicked = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selection = useRef<{ start: number; end: number } | null>(null);

  /* Revoke previews of files never sent. */
  useEffect(
    () => () => {
      for (const f of filesRef.current) if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    },
    [filesRef],
  );

  /* ----- Auto-grow ----- */
  const resize = useCallback(() => {
    const el = fieldRef.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 24;
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const max = line * maxRows + padding;
    el.style.height = "auto";
    const full = el.scrollHeight;
    el.style.height = `${Math.min(full, max)}px`;
    el.style.overflowY = full > max + 1 ? "auto" : "hidden";
  }, [maxRows]);

  useLayoutEffect(() => {
    resize();
  }, [text, resize]);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resize]);

  useEffect(() => {
    if (autoFocus) fieldRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // Opening a reply or an edit puts the caret in the field (at the end).
  const replyKey = replyTo?.id ?? null;
  useEffect(() => {
    if (!replyKey && !editingId) return;
    const el = fieldRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [replyKey, editingId]);

  /* ----- Typing signal ----- */
  const typing = useRef(false);
  const typingTimer = useRef<number | undefined>(undefined);
  const onTypingRef = useLatest(onTyping);
  const stopTyping = useCallback(() => {
    window.clearTimeout(typingTimer.current);
    if (typing.current) {
      typing.current = false;
      onTypingRef.current?.(false);
    }
  }, [onTypingRef]);
  const noteTyping = () => {
    if (!onTypingRef.current || editing) return;
    if (!typing.current) {
      typing.current = true;
      onTypingRef.current(true);
    }
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(stopTyping, TYPING_IDLE);
  };
  useEffect(() => () => stopTyping(), [stopTyping]);

  /* ----- Imperative handle ----- */
  const insert = useCallback(
    (snippet: string) => {
      const el = fieldRef.current;
      const current = el?.value ?? text;
      const sel = selection.current ?? { start: current.length, end: current.length };
      const next = current.slice(0, sel.start) + snippet + current.slice(sel.end);
      const caret = sel.start + snippet.length;
      selection.current = { start: caret, end: caret };
      setText(next);
      requestAnimationFrame(() => {
        if (!el) return;
        el.setSelectionRange(caret, caret);
      });
    },
    [text, setText],
  );
  useImperativeHandle(
    ref,
    () => ({ focus: () => fieldRef.current?.focus({ preventScroll: true }), insert, textarea: fieldRef.current }),
    [insert],
  );

  /* ----- Files ----- */
  function addFiles(list: FileList | File[]) {
    const picked = Array.from(list);
    if (picked.length === 0) return;
    const room = Math.max(0, maxAttachments - files.length);
    const taken = picked.slice(0, room).map<ChatDraftAttachment>((file) => ({
      id: chatUid("file"),
      file,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    if (taken.length) {
      setFiles((f) => [...f, ...taken]);
      announce(taken.map((t) => t.name).join(", "));
    }
  }

  function removeFile(file: ChatDraftAttachment) {
    setFiles((f) => f.filter((x) => x.id !== file.id));
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    announce(L.removeAttachment(file.name));
    fieldRef.current?.focus({ preventScroll: true });
  }

  /* ----- Send / save ----- */
  const trimmed = text.trim();
  const canSend =
    !disabled &&
    (editing ? trimmed.length > 0 && trimmed !== editing.text.trim() : trimmed.length > 0 || files.length > 0);

  function submit(event?: SyntheticEvent) {
    event?.preventDefault();
    if (!canSend) return;
    if (editing) {
      onSaveEdit?.(editing.id, trimmed);
      setEditText("");
    } else {
      onSend({ text: trimmed, attachments: files, replyTo: replyTo ?? undefined });
      // The previews now belong to the sent message.
      setFiles([]);
      setDraft("");
      stopTyping();
    }
    selection.current = null;
    fieldRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (isImeComposing(event.nativeEvent)) return;
    if (event.key === "Escape") {
      if (editing) {
        event.preventDefault();
        event.stopPropagation();
        onCancelEdit?.();
        return;
      }
      if (replyTo) {
        event.preventDefault();
        event.stopPropagation();
        onCancelReply?.();
        return;
      }
      return;
    }
    if (
      event.key === "ArrowUp" &&
      !editing &&
      text === "" &&
      files.length === 0 &&
      onEditLast &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      event.preventDefault();
      onEditLast();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || event.altKey) return;
    // Touch keyboards: Return adds a line (Cmd/Ctrl + Enter still sends).
    if (coarse && !event.metaKey && !event.ctrlKey) return;
    event.preventDefault();
    submit();
  }

  const hasFiles = (event: DragEvent) =>
    allowAttachments && !editing && Array.from(event.dataTransfer.types).includes("Files");
  const compact = density === "compact";
  const replyName = replyTo ? (nameOf?.(replyTo.senderId) ?? "") : "";
  const banner = editing ? "edit" : replyTo ? "reply" : null;

  const rise = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduced ? { opacity: 0, transition: exitTransition } : { opacity: 0, y: 4, transition: exitTransition },
    transition: reduced ? { duration: duration.fast } : spring.snappy,
  };

  return (
    <form
      onSubmit={submit}
      data-slot="chat-composer"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        compact ? "px-2.5 pt-1.5 pb-2.5" : "px-3 pt-2 pb-3 @lg:px-4",
        className,
      )}
    >
      {quickReplies && quickReplies.length > 0 && !editing && (
        // Touch: py-1 leaves room for the chips' 44px hit area (the scroller clips anything outside its padding).
        <ul
          aria-label={L.quickReplies}
          className="-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-0.5 [scrollbar-width:none] *:shrink-0 any-pointer-coarse:py-1"
        >
          {quickReplies.map((reply) => (
            <li key={reply}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSend({ text: reply, attachments: [] });
                  fieldRef.current?.focus({ preventScroll: true });
                }}
                className={cn(
                  // The glass look without a blur of its own (it sits on the chat's glass already).
                  "glass-1 [-webkit-backdrop-filter:none] [backdrop-filter:none] relative inline-flex h-8 cursor-pointer items-center rounded-full border-sheen-accent-border px-3 text-xs font-medium text-sheen-accent",
                  "transition-[background-color,scale] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-accent-soft motion-ok:active:scale-95",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  // Touch: a 44px-tall hit area (insets are % of the chip's own box, so the border doesn't eat into it).
                  "any-pointer-coarse:h-9 any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:inset-y-[min(0px,calc((100%-2.75rem)/2))]",
                )}
              >
                {reply}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        // Drag and drop is a pointer shortcut; the attach button is the keyboard route.
        role="presentation"
        className="relative flex min-w-0 flex-col"
        onDragEnter={(e) => hasFiles(e) && setDragging(true)}
        onDragOver={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        {/* Reply / edit bar */}
        <AnimatePresence initial={false}>
          {banner && (
            <motion.div key={banner} {...rise} className="mb-1.5 flex min-w-0 items-center gap-2 ps-1">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center text-sheen-accent">
                {banner === "edit" ? <PencilIcon className="size-4" /> : <ReplyIcon className="size-4" />}
              </span>
              <QuoteBlock
                variant="composer"
                senderName={banner === "edit" ? L.editingMessage : L.replyingTo(replyName)}
                text={
                  banner === "edit"
                    ? (editing?.text ?? "")
                    : (replyTo?.text ?? (replyTo?.attachmentKind ? L.attachmentSummary(replyTo.attachmentKind, 1) : ""))
                }
                className="flex-1"
              />
              <Tooltip content={banner === "edit" ? `${L.cancelEdit} (Esc)` : L.cancelReply} delay={300}>
                <button
                  type="button"
                  aria-label={banner === "edit" ? L.cancelEdit : L.cancelReply}
                  onClick={() => {
                    if (banner === "edit") onCancelEdit?.();
                    else onCancelReply?.();
                    fieldRef.current?.focus({ preventScroll: true });
                  }}
                  className={chatIconButton}
                >
                  <XIcon />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Picked files */}
        {files.length > 0 && !editing && (
          <ul
            aria-label={L.attachments}
            className="mb-1.5 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pt-1.5 pb-1 [scrollbar-width:thin] *:shrink-0"
          >
            <AnimatePresence initial={false}>
              {files.map((f) => (
                <motion.li
                  key={f.id}
                  layout={reduced ? false : "position"}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: exitTransition }
                      : { opacity: 0, scale: 0.85, transition: exitTransition }
                  }
                  transition={reduced ? { duration: duration.fast } : spring.snappy}
                  className="relative"
                >
                  {f.previewUrl ? (
                    <img
                      src={f.previewUrl}
                      alt={f.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-sheen-md border border-sheen-border object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-44 items-center gap-2 rounded-sheen-md border border-sheen-border bg-sheen-hover px-2.5">
                      <FileIcon className="size-5 shrink-0 text-sheen-accent" />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-medium">{f.name}</span>
                        <span className="text-2xs text-sheen-fg-muted">{formatFileSize(f.size, locale)}</span>
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(f)}
                    aria-label={L.removeAttachment(f.name)}
                    className={cn(
                      "absolute -end-1.5 -top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-sheen-fg text-sheen-bg shadow-md",
                      "hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                      "forced-colors:border forced-colors:border-[ButtonText]",
                      "any-pointer-coarse:after:absolute any-pointer-coarse:after:size-11",
                    )}
                  >
                    <XIcon className="size-3" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <div className="flex min-w-0 items-end gap-2">
          <div
            // A click on the padding around the field focuses it (a pointer convenience; the field is the real control).
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
                fieldRef.current?.focus();
              }
            }}
            className={cn(
              "glass-2 flex min-w-0 flex-1 items-end gap-0.5 rounded-[1.375rem] border-sheen-control-border/60 p-1",
              // On the chat's glass already: the glass look without a second blur.
              chatNoBlur,
              "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
              "focus-within:border-sheen-accent-border focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
              "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-sheen-focus",
              disabled && "opacity-55",
            )}
          >
            <Popover
              open={emojiOpen}
              onOpenChange={(next) => {
                if (next) emojiPicked.current = false;
                setEmojiOpen(next);
              }}
            >
              <Tooltip content={L.emoji} delay={300}>
                <PopoverTrigger
                  ref={emojiTrigger}
                  disabled={disabled}
                  aria-label={L.emoji}
                  className={cn(chatIconButton, "data-popup-open:bg-sheen-hover data-popup-open:text-sheen-accent")}
                >
                  <SmileIcon />
                </PopoverTrigger>
              </Tooltip>
              <PopoverContent
                side="top"
                align="start"
                sideOffset={12}
                className="w-auto p-3"
                aria-label={L.emoji}
                finalFocus={() => (emojiPicked.current ? fieldRef.current : emojiTrigger.current) ?? true}
              >
                <EmojiPicker
                  autoFocusSearch={!coarse}
                  labels={labelsProp}
                  onSelect={(emoji) => {
                    emojiPicked.current = true;
                    insert(emoji);
                    noteTyping();
                  }}
                />
              </PopoverContent>
            </Popover>

            <label htmlFor={fieldId} className="sr-only">
              {editing ? L.editingMessage : L.message}
            </label>
            <textarea
              ref={fieldRef}
              id={fieldId}
              rows={1}
              value={text}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setText(e.target.value);
                selection.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
                if (e.target.value) noteTyping();
                else stopTyping();
              }}
              onSelect={(e) => {
                const el = e.currentTarget;
                selection.current = { start: el.selectionStart, end: el.selectionEnd };
              }}
              onBlur={() => stopTyping()}
              onKeyDown={onKeyDown}
              onPaste={(e) => {
                if (!allowAttachments || editing || e.clipboardData.files.length === 0) return;
                if (e.clipboardData.getData("text/plain").trim()) return;
                e.preventDefault();
                addFiles(e.clipboardData.files);
              }}
              placeholder={placeholder ?? L.placeholder(title)}
              aria-describedby={hintId}
              enterKeyHint={coarse ? "enter" : "send"}
              autoComplete="off"
              dir="auto"
              spellCheck
              className={cn(
                "block min-h-9 w-full min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[0.9375rem] leading-6 text-sheen-fg outline-none placeholder:truncate placeholder:text-sheen-fg-subtle",
                "[scrollbar-width:thin] any-pointer-coarse:py-2.5 any-pointer-coarse:text-base",
                "disabled:cursor-not-allowed forced-colors:focus-visible:outline-none!",
              )}
            />

            {allowAttachments && !editing && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={accept}
                  tabIndex={-1}
                  aria-hidden
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Tooltip content={L.attach} delay={300}>
                  <button
                    type="button"
                    aria-label={L.attach}
                    disabled={disabled || files.length >= maxAttachments}
                    onClick={() => fileRef.current?.click()}
                    className={chatIconButton}
                  >
                    <PaperclipIcon />
                  </button>
                </Tooltip>
              </>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="icon"
            aria-label={editing ? L.saveEdit : L.send}
            disabled={!canSend}
            className={cn("size-11 shrink-0 rounded-full [&_svg]:size-[1.125rem]", compact && "size-10")}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={editing ? "save" : "send"}
                className="flex"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={
                  reduced
                    ? { opacity: 0, transition: exitTransition }
                    : { opacity: 0, scale: 0.4, transition: exitTransition }
                }
                transition={reduced ? { duration: duration.fast } : spring.bouncy}
              >
                {editing ? <CheckSaveIcon /> : <SendIcon />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>

        {dragging && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-[1.375rem] border-2 border-dashed border-sheen-accent bg-sheen-accent-soft text-sm font-medium text-sheen-accent"
          >
            <PaperclipIcon className="size-4" />
            {L.attach}
          </div>
        )}
      </div>

      <p id={hintId} hidden>
        {editing ? L.editHint : coarse ? L.keyHintTouch : L.keyHint}
      </p>
      {announcer}
    </form>
  );
}

function CheckSaveIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </svg>
  );
}
