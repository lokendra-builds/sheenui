"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { useLatest } from "../hooks/use-latest";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/cn";
import { HEADING_TAGS, headingBelow } from "../lib/heading";
import { isImeComposing } from "../lib/ime";
import { duration, spring } from "../motion/tokens";
import { exitTransition } from "../motion/presets";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { Button } from "../components/button/button";
import { GlassCard } from "../components/glass-card/glass-card";
import { Select } from "../components/select/select";
import { Tooltip, TooltipProvider } from "../components/tooltip/tooltip";
import { useCoarsePointer } from "../hooks/use-media-query";
import { type AiChatAttachment, type AiChatMessage, type AiChatFeedback, type AiChatProps } from "./ai-chat/types";
import { defaultAiChatLabels, defaultModels, defaultSuggestions, demoRespond } from "./ai-chat/defaults";
import { uid } from "../lib/uid";
import { abortable, sleep, isAsyncIterable, toAnnouncement } from "./ai-chat/utils";
import { AnnounceContext } from "./ai-chat/code";
import { Orb, AttachmentChip, MessageItem, type MessageActions } from "./ai-chat/parts";
import { EmptyState } from "./ai-chat/empty-state";
import { ArrowUpIcon, ArrowDownIcon, StopIcon, PaperclipIcon, NewChatIcon, AlertIcon } from "./ai-chat/icons";

export {
  type AiChatRole,
  type AiChatStatus,
  type AiChatAttachment,
  type AiChatMessage,
  type AiChatModel,
  type AiChatRequest,
  type AiChatRespond,
  type AiChatFeedback,
  type AiChatLabels,
  type AiChatProps,
} from "./ai-chat/types";
export { defaultAiChatLabels } from "./ai-chat/defaults";

/**
 * AI chat: an assistant panel with a streaming reply, a "thinking" shimmer, light Markdown,
 * attachments, a model picker, stop / regenerate, suggestion chips and scroll-to-latest.
 *
 *   <AiChat respond={async ({ prompt, signal }) => (await fetch(…, { signal })).text()} />
 *
 * `respond` returns either the whole reply (a string or a promise of one), which is typed
 * out word by word, or an async iterable of chunks for real token streaming. Stop aborts
 * `signal`. Without `respond` the block plays canned demo replies.
 *
 * Accessibility
 *   - The conversation is a focusable, scrollable region; every message starts with a
 *     visually hidden heading ("You said:", "Sheen said:"), so screen readers can jump
 *     between messages by heading.
 *   - Streaming text is not read out piece by piece: one polite live region says the
 *     assistant is thinking, then reads the finished reply (or "stopped" / the error).
 *   - Enter sends, Shift + Enter adds a line, Escape stops a reply. On touch keyboards
 *     Enter adds a line and the send button sends.
 *
 * Motion: messages rise in, the reply is typed out, the assistant's orb turns while it
 * works. Reduced motion (OS or [data-motion="reduced"]): messages only fade, replies
 * appear whole, the shimmer and orb rest.
 */

/* ---------- Block ---------- */

/**
 * An assistant chat panel: a message list with streaming replies, a composer, attachments and a model picker.
 * You supply the model call as `respond`; everything else has a default.
 *
 * Props (see `AiChatProps`): `respond`, `defaultMessages`, `messages` (controlled), `isTyping`, `onMessagesChange`, `onSend`, `onFeedback`,
 * `models` / `model` / `defaultModel` / `onModelChange`, `suggestions`, `allowAttachments` (`true`),
 * `accept`, `maxAttachments` (`4`), `simulateStreaming` (`true`), `typingSpeed` (`160`), `thinkingDelay`
 * (`900`), `maxRows` (`8`), `headingLevel` (`2`), `autoFocus` (`false`), `locale` (`"en-US"`),
 * `labels` (`Partial<AiChatLabels>`), `className` (give the panel a height).
 * Keyboard: Enter sends, Shift + Enter adds a line (on touch keyboards Enter adds a line and the send
 * button sends), Escape stops a reply, and Tab reaches the conversation (a scrollable region), the
 * suggestion chips, the attach button, the model picker and send.
 * Accessibility: every message starts with a visually hidden heading ("You said:"), streaming text is
 * not read piece by piece (one polite live region reports thinking, then the finished reply, a stop or
 * an error), and the key hint is linked to the field with `aria-describedby`.
 * Glass and motion: one glass panel (one backdrop blur); messages rise in, replies type out and the
 * orb turns while it works. Reduced motion: messages fade, replies appear whole, shimmer and orb rest.
 *
 * @example
 * ```tsx
 * import { AiChat } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AiChat
 *       className="h-[640px]"
 *       respond={async ({ prompt, signal }) => {
 *         const res = await fetch("/api/chat", { method: "POST", body: prompt, signal });
 *         return res.text(); // or return an async iterable of chunks to stream
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see /blocks/ai-chat
 */
export function AiChat({
  respond = demoRespond,
  defaultMessages = [],
  messages: messagesProp,
  isTyping = false,
  onMessagesChange,
  onSend,
  onFeedback,
  models = defaultModels,
  model: modelProp,
  defaultModel,
  onModelChange,
  suggestions = defaultSuggestions,
  allowAttachments = true,
  accept,
  maxAttachments = 4,
  simulateStreaming = true,
  typingSpeed = 160,
  thinkingDelay = 900,
  maxRows = 8,
  headingLevel = 2,
  autoFocus = false,
  locale = "en-US",
  labels: labelsProp,
  className,
}: AiChatProps) {
  const L = useMemo(() => ({ ...defaultAiChatLabels, ...labelsProp }), [labelsProp]);
  const reduced = useSheenReducedMotion();
  const coarse = useCoarsePointer();
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const messageHeading = HEADING_TAGS[headingBelow(headingLevel, 1)];
  const titleId = useId();
  const conversationId = useId();
  const hintId = useId();
  const fieldId = useId();

  const [messages, setMessages] = useState<AiChatMessage[]>(messagesProp ?? defaultMessages);
  // Controlled `messages`: a new array from outside replaces the conversation (an echo of our own report is a no-op).
  const [syncedProp, setSyncedProp] = useState(messagesProp);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<AiChatAttachment[]>([]);
  const [innerModel, setInnerModel] = useState(defaultModel ?? models[0]?.value ?? "");
  const model = modelProp ?? innerModel;
  const [feedback, setFeedback] = useState<Record<string, AiChatFeedback>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  const controllerRef = useRef<AbortController | null>(null);
  const attemptsRef = useRef<Record<string, number>>({});
  const objectUrls = useRef(new Set<string>());
  // Messages present on mount appear without an entrance animation.
  const [initialIds] = useState(() => new Set((messagesProp ?? defaultMessages).map((m) => m.id)));
  if (messagesProp !== undefined && messagesProp !== syncedProp) {
    setSyncedProp(messagesProp);
    if (messagesProp !== messages) {
      for (const m of messagesProp) initialIds.add(m.id);
      setMessages(messagesProp);
    }
  }
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<number | undefined>(undefined);

  const busy = busyId !== null;
  const busyStatus = busy ? messages.find((m) => m.id === busyId)?.status : undefined;
  const modelLabels = useMemo(() => new Map(models.map((m) => [m.value, m.label])), [models]);

  /* ----- Live region ----- */

  const announceFrame = useRef(0);
  const announce = useCallback((text: string) => {
    // Clear first so the same words are read again.
    setAnnouncement("");
    cancelAnimationFrame(announceFrame.current);
    announceFrame.current = requestAnimationFrame(() => setAnnouncement(text));
  }, []);

  /* ----- Settled conversation → onMessagesChange ----- */

  // Compared by identity, so the starting conversation is never reported (StrictMode included).
  const reported = useRef(messages);
  const onMessagesChangeRef = useLatest(onMessagesChange);
  const messagesPropRef = useLatest(messagesProp);
  useEffect(() => {
    if (busy || messages === reported.current) return;
    reported.current = messages;
    // History handed in from outside is not news to the owner.
    if (messages === messagesPropRef.current) return;
    onMessagesChangeRef.current?.(messages);
  }, [messages, busy, messagesPropRef, onMessagesChangeRef]);
  // New history from outside while a reply is running: that reply belongs to the old thread.
  useEffect(() => {
    if (messagesProp === undefined || messagesProp === reported.current) return;
    controllerRef.current?.abort();
    setBusyId(null);
  }, [messagesProp]);

  /* ----- Cleanup ----- */

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      controllerRef.current?.abort();
      cancelAnimationFrame(announceFrame.current);
      window.clearTimeout(copiedTimer.current);
      window.clearTimeout(noticeTimer.current);
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    if (autoFocus) fieldRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  /* ----- Scrolling: follow the newest words while the reader is at the bottom ----- */

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const gliding = useRef(false);
  // Where we last pinned the scroll. Content can grow again before that scroll's event
  // arrives; only a reader moving above this point means "stop following".
  const pinnedTop = useRef(0);
  const pin = (el: HTMLElement) => {
    el.scrollTop = el.scrollHeight;
    pinnedTop.current = el.scrollTop;
  };
  const [showJump, setShowJump] = useState(false);
  const [unseen, setUnseen] = useState(false);

  const atBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight <= 32;

  // The empty state reads from the top; a conversation opens at its latest message.
  const emptyRef = useRef(messages.length === 0);
  useLayoutEffect(() => {
    emptyRef.current = messages.length === 0;
  });

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    if (!emptyRef.current) pin(el);
    let lastHeight = content.offsetHeight;
    const observer = new ResizeObserver(() => {
      const grew = content.offsetHeight > lastHeight;
      lastHeight = content.offsetHeight;
      if (emptyRef.current) return;
      if (stick.current && !gliding.current) pin(el);
      else if (grew && !atBottom(el)) setUnseen(true);
    });
    observer.observe(content);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = atBottom(el);
    if (gliding.current) {
      if (bottom) gliding.current = false;
      return;
    }
    if (!bottom && stick.current && el.scrollTop >= pinnedTop.current - 2) return;
    stick.current = bottom;
    setShowJump(!bottom);
    if (bottom) setUnseen(false);
  }

  // Any sign the reader is scrolling by hand cancels a glide to the bottom.
  function cancelGlide() {
    gliding.current = false;
  }

  function jumpToLatest(focusField = true) {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = true;
    gliding.current = !reduced;
    setShowJump(false);
    setUnseen(false);
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    // The button disappears; keep focus somewhere useful.
    if (focusField) fieldRef.current?.focus({ preventScroll: true });
  }

  /* ----- Autosize the message field ----- */

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
  }, [draft, resize]);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    let width = el.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resize]);

  /* ----- Replying ----- */

  const update = useCallback((id: string, patch: Partial<AiChatMessage>) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  async function reply(history: AiChatMessage[], prompt: string, attachments: AiChatAttachment[], attempt: number) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;
    const id = uid("assistant");

    setMessages([...history, { id, role: "assistant", content: "", model, status: "thinking" }]);
    setBusyId(id);
    stick.current = true;
    announce(L.thinkingAnnouncement);

    const started = performance.now();
    let text = "";
    try {
      const result = respond({ prompt, attachments, messages: history, model, attempt, signal });

      if (isAsyncIterable(result)) {
        // Real streaming: append chunks, at most one render per frame.
        const iterator = result[Symbol.asyncIterator]();
        let frame = 0;
        const paint = () => {
          frame = 0;
          update(id, { content: text, status: "streaming" });
        };
        try {
          for (;;) {
            const step = await abortable(iterator.next(), signal);
            if (step.done) break;
            text += step.value;
            if (!frame) frame = requestAnimationFrame(paint);
          }
        } finally {
          cancelAnimationFrame(frame);
          if (signal.aborted) void iterator.return?.();
        }
      } else {
        text = await abortable(Promise.resolve(result), signal);
        // Let the thinking state register before words appear.
        await sleep(Math.max(0, thinkingDelay - (performance.now() - started)), signal);
        if (simulateStreaming && !reduced) {
          // Typewriter: reveal whole words at about `typingSpeed` characters a second.
          let shown = 0;
          let last = performance.now();
          while (shown < text.length) {
            await sleep(28 + Math.random() * 36, signal);
            const now = performance.now();
            let end = Math.min(text.length, shown + Math.max(1, Math.round(((now - last) * typingSpeed) / 1000)));
            last = now;
            while (end < text.length && /\S/.test(text.charAt(end))) end++;
            shown = end;
            update(id, { content: text.slice(0, shown), status: "streaming" });
          }
        }
      }

      if (signal.aborted) return;
      update(id, { content: text, status: "done" });
      announce(L.replied(L.assistant, toAnnouncement(text, L)));
    } catch (error) {
      // Stop and New chat handle their own state.
      if (signal.aborted) return;
      const message = error instanceof Error && error.message ? error.message : L.errorFallback;
      update(id, { content: text, status: "error", error: message });
      announce(message);
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setBusyId(null);
      }
    }
  }

  function send(text: string, attachments: AiChatAttachment[] = []) {
    const prompt = text.trim();
    // The ref is set synchronously by reply(), so a rapid second trigger can't slip through.
    if ((!prompt && attachments.length === 0) || busy || controllerRef.current) return;
    const message: AiChatMessage = {
      id: uid("user"),
      role: "user",
      content: prompt,
      attachments: attachments.length ? attachments : undefined,
    };
    onSend?.(message);
    attemptsRef.current[message.id] = 0;
    void reply([...messages, message], prompt, attachments, 0);
  }

  function submit(event?: SyntheticEvent) {
    event?.preventDefault();
    if (busy) return;
    if (!draft.trim() && pending.length === 0) return;
    send(draft, pending);
    setDraft("");
    setPending([]);
    setNotice(null);
    fieldRef.current?.focus({ preventScroll: true });
  }

  function stop() {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.abort();
    controllerRef.current = null;
    if (busyId) update(busyId, { status: "stopped" });
    setBusyId(null);
    announce(L.stoppedAnnouncement);
  }

  function regenerate() {
    if (busy) return;
    // The latest prompt is the last user message; everything after it is replaced.
    let index = messages.length - 1;
    while (index >= 0 && messages[index]?.role !== "user") index--;
    const prompt = messages[index];
    if (!prompt) return;
    const attempt = (attemptsRef.current[prompt.id] ?? 0) + 1;
    attemptsRef.current[prompt.id] = attempt;
    // The pressed button goes away with the old reply: move focus to the field.
    fieldRef.current?.focus({ preventScroll: true });
    void reply(messages.slice(0, index + 1), prompt.content, prompt.attachments ?? [], attempt);
  }

  function clear() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    // Free the image previews of the messages going away (the composer's pending files stay).
    for (const m of messages) {
      for (const a of m.attachments ?? []) {
        if (a.previewUrl && objectUrls.current.delete(a.previewUrl)) URL.revokeObjectURL(a.previewUrl);
      }
    }
    setBusyId(null);
    setMessages([]);
    setFeedback({});
    stick.current = true;
    setShowJump(false);
    setUnseen(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    announce(L.cleared);
    fieldRef.current?.focus({ preventScroll: true });
  }

  // Stable handlers for the memoised messages (they read the latest state through a ref).
  const live = useRef({ regenerate, onFeedback, announce, L });
  useLayoutEffect(() => {
    live.current = { regenerate, onFeedback, announce, L };
  });
  const actions = useMemo<MessageActions>(
    () => ({
      copy: (message) => {
        navigator.clipboard.writeText(message.content).then(
          () => {
            setCopiedId(message.id);
            live.current.announce(live.current.L.copied);
            window.clearTimeout(copiedTimer.current);
            copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1600);
          },
          () => live.current.announce(live.current.L.copyFailed),
        );
      },
      feedback: (message, value) => {
        setFeedback((all) => ({ ...all, [message.id]: value }));
        live.current.onFeedback?.(message, value);
        if (value) live.current.announce(live.current.L.feedbackThanks);
      },
      regenerate: () => live.current.regenerate(),
    }),
    [],
  );

  /* ----- Composer ----- */

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" && busy) {
      event.preventDefault();
      stop();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || isImeComposing(event.nativeEvent)) return;
    // Touch keyboards: Enter adds a line (Cmd/Ctrl + Enter still sends).
    if (coarse && !event.metaKey && !event.ctrlKey) return;
    event.preventDefault();
    submit();
  }

  function addFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    const room = Math.max(0, maxAttachments - pending.length);
    const taken = files.slice(0, room).map<AiChatAttachment>((file) => {
      let previewUrl: string | undefined;
      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
        objectUrls.current.add(previewUrl);
      }
      return { id: uid("file"), name: file.name, size: file.size, type: file.type, previewUrl, file };
    });
    if (taken.length) setPending((p) => [...p, ...taken]);
    if (files.length > room) {
      // Said on screen as well as to screen readers: some files were left out.
      const text = L.tooManyFiles(maxAttachments);
      setNotice(text);
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(null), 5000);
      announce(taken.length ? `${L.attached(taken.map((t) => t.name))}. ${text}` : text);
    } else {
      announce(L.attached(taken.map((t) => t.name)));
    }
  }

  function removeAttachment(attachment: AiChatAttachment) {
    setPending((p) => p.filter((a) => a.id !== attachment.id));
    setNotice(null);
    if (attachment.previewUrl && objectUrls.current.has(attachment.previewUrl)) {
      URL.revokeObjectURL(attachment.previewUrl);
      objectUrls.current.delete(attachment.previewUrl);
    }
    announce(L.removed(attachment.name));
    fieldRef.current?.focus({ preventScroll: true });
  }

  const hasFiles = (event: DragEvent) => allowAttachments && Array.from(event.dataTransfer.types).includes("Files");

  const canSend = (draft.trim().length > 0 || pending.length > 0) && !busy;
  const statusText = busyStatus === "thinking" ? `${L.thinking}…` : busyStatus === "streaming" ? L.writing : L.online;
  const shown = useMemo<AiChatMessage[]>(
    () =>
      isTyping && !busy
        ? [...messages, { id: "sheen-ai-typing", role: "assistant", content: "", status: "thinking" }]
        : messages,
    [isTyping, busy, messages],
  );
  const empty = shown.length === 0;

  return (
    <AnnounceContext value={announce}>
      <TooltipProvider>
        <GlassCard
          level={3}
          sheen={false}
          role="group"
          aria-labelledby={titleId}
          className={cn(
            "@container flex h-[40rem] max-h-[calc(100dvh-2rem)] min-h-96 w-full min-w-0 flex-col overflow-hidden rounded-sheen-xl",
            className,
          )}
        >
          <span id={conversationId} hidden>
            {L.conversation}
          </span>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-sheen-border px-4 py-3 @lg:px-5">
            <Orb busy={false} size="md" reduced={reduced} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Heading id={titleId} className="truncate text-sm leading-5 font-semibold">
                {L.assistant}
              </Heading>
              <p className="flex items-center gap-1.5 text-xs leading-4 text-sheen-fg-muted">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full forced-colors:bg-[CanvasText]",
                    busy ? "bg-sheen-accent motion-ok:animate-pulse" : "bg-sheen-success",
                  )}
                />
                <span className="truncate">{statusText}</span>
              </p>
            </div>
            <Tooltip content={L.newChat} side="bottom" delay={300}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={L.newChat}
                disabled={empty}
                onClick={clear}
                className="size-9 rounded-sheen-md [&_svg]:size-[1.125rem]"
              >
                <NewChatIcon />
              </Button>
            </Tooltip>
          </div>

          {/* Conversation */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* Listeners only cancel the follow-the-newest glide when the reader scrolls or presses a key; the region is focusable so the conversation can be scrolled by keyboard. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- observer-only listeners (scroll, wheel, touch, key) that cancel the auto-scroll glide; they activate nothing */}
            <div
              ref={scrollRef}
              role="group"
              // "Sheen Conversation": unique per chat, even with several chats on a page.
              aria-labelledby={`${titleId} ${conversationId}`}
              aria-busy={busy || undefined}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable so the conversation can be scrolled without a mouse (WCAG 2.1.1)
              tabIndex={0}
              onScroll={onScroll}
              onWheel={cancelGlide}
              onTouchStart={cancelGlide}
              onKeyDown={cancelGlide}
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus"
            >
              <div ref={contentRef} className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 @lg:px-6">
                {empty ? (
                  <EmptyState
                    suggestions={suggestions}
                    labels={L}
                    reduced={reduced}
                    onPick={(s) => {
                      send(s);
                      // The chips go away with the empty state: keep focus in the field.
                      fieldRef.current?.focus({ preventScroll: true });
                    }}
                  />
                ) : (
                  // No AnimatePresence here: messages never animate out, and a freshly mounted
                  // AnimatePresence initial={false} would block the first exchange's entrance.
                  <ol className="flex flex-col gap-7">
                    {shown.map((m, i) => (
                      <MessageItem
                        key={m.id}
                        message={m}
                        last={i === shown.length - 1}
                        appear={!initialIds.has(m.id)}
                        copied={copiedId === m.id}
                        feedback={feedback[m.id] ?? null}
                        modelLabel={m.role === "assistant" && m.model ? modelLabels.get(m.model) : undefined}
                        labels={L}
                        locale={locale}
                        reduced={reduced}
                        headingTag={messageHeading}
                        actions={actions}
                      />
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* Scroll to latest: a glass button that rises in when the reader scrolls up. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
              <AnimatePresence>
                {showJump && !empty && (
                  <motion.button
                    key="jump"
                    type="button"
                    onClick={() => jumpToLatest()}
                    aria-label={L.scrollToBottom}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      reduced
                        ? { opacity: 0, transition: exitTransition }
                        : { opacity: 0, y: 6, scale: 0.95, transition: exitTransition }
                    }
                    transition={reduced ? { duration: duration.fast } : spring.snappy}
                    className={cn(
                      "glass-3 pointer-events-auto relative flex size-10 cursor-pointer items-center justify-center rounded-full text-sheen-fg",
                      "hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                      "any-pointer-coarse:size-11",
                    )}
                  >
                    <ArrowDownIcon className="size-[1.125rem]" />
                    {unseen && (
                      <span
                        aria-hidden
                        className="absolute top-0.5 end-0.5 size-2.5 rounded-full bg-sheen-accent ring-2 ring-(--sheen-surface-solid) forced-colors:bg-[Highlight]"
                      />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Composer */}
          <form onSubmit={submit} className="mx-auto w-full max-w-3xl px-3 pt-1 pb-3 @lg:px-5 @lg:pb-4">
            <div
              role="presentation"
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
              onMouseDown={(e) => {
                // Clicking the padding around the field puts the caret in it.
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                  fieldRef.current?.focus();
                }
              }}
              className={cn(
                "glass-2 relative flex flex-col rounded-[1.375rem]",
                "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-sheen-focus",
              )}
            >
              {notice && (
                <p className="flex items-center gap-1.5 px-4 pt-3 text-xs font-medium text-sheen-warning-text">
                  <AlertIcon className="size-3.5 shrink-0" />
                  {notice}
                </p>
              )}
              {pending.length > 0 && (
                // Narrow panels: one row that scrolls sideways, so files never push the conversation away.
                <ul
                  aria-label={L.attachments}
                  className="flex gap-2 overflow-x-auto overscroll-x-contain px-3 pt-3 [scrollbar-width:thin] *:shrink-0 @md:flex-wrap @md:overflow-x-visible"
                >
                  <AnimatePresence>
                    {pending.map((a) => (
                      <AttachmentChip
                        key={a.id}
                        attachment={a}
                        locale={locale}
                        reduced={reduced}
                        removeLabel={L.removeAttachment(a.name)}
                        onRemove={() => removeAttachment(a)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              <label htmlFor={fieldId} className="sr-only">
                {L.message}
              </label>
              <textarea
                ref={fieldRef}
                id={fieldId}
                rows={1}
                value={draft}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={(e) => {
                  // Rich copies (spreadsheet cells, a picture with its caption) carry text and an
                  // image: paste the text. Only a clipboard of files alone becomes attachments.
                  if (!allowAttachments || e.clipboardData.files.length === 0) return;
                  if (e.clipboardData.getData("text/plain").trim()) return;
                  e.preventDefault();
                  addFiles(e.clipboardData.files);
                }}
                placeholder={L.placeholder}
                aria-describedby={hintId}
                enterKeyHint={coarse ? "enter" : "send"}
                className={cn(
                  "block w-full resize-none bg-transparent px-4 pt-3.5 pb-1.5 text-[0.9375rem] leading-6 text-sheen-fg outline-none placeholder:text-sheen-fg-subtle",
                  "[scrollbar-width:thin] any-pointer-coarse:text-base",
                  // The composer's rounded ring is the focus indicator; high contrast would add a square one.
                  "forced-colors:focus-visible:outline-none!",
                )}
              />

              <div
                role="presentation"
                className="flex min-w-0 items-center gap-1.5 px-2.5 pt-1 pb-2.5"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    e.preventDefault();
                    fieldRef.current?.focus();
                  }
                }}
              >
                {allowAttachments && (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={L.attach}
                        disabled={pending.length >= maxAttachments}
                        onClick={() => fileRef.current?.click()}
                        className="size-9 rounded-full text-sheen-fg-muted hover:text-sheen-fg [&_svg]:size-[1.125rem]"
                      >
                        <PaperclipIcon />
                      </Button>
                    </Tooltip>
                  </>
                )}
                {models.length > 1 && (
                  <Select
                    aria-label={L.model}
                    items={models.map((m) => ({ value: m.value, label: m.label, description: m.description }))}
                    value={model}
                    onValueChange={(next) => {
                      if (!next) return;
                      setInnerModel(next);
                      onModelChange?.(next);
                    }}
                    className="w-auto min-w-0 shrink"
                    triggerClassName={cn(
                      // A ghost pill inside the composer: no glass of its own (no fill, rim or blur).
                      "h-9 w-auto min-w-0 gap-1.5 rounded-sheen-full border-transparent bg-transparent px-3 text-xs font-medium shadow-none [background-image:none] [-webkit-backdrop-filter:none] [backdrop-filter:none]",
                      "hover:bg-sheen-hover any-pointer-coarse:text-sm",
                    )}
                  />
                )}
                <Button
                  type={busy ? "button" : "submit"}
                  variant="primary"
                  size="icon"
                  aria-label={busy ? L.stop : L.send}
                  disabled={!busy && !canSend}
                  onClick={
                    busy
                      ? () => {
                          // The button turns back into a disabled Send: keep focus in the field.
                          stop();
                          fieldRef.current?.focus({ preventScroll: true });
                        }
                      : undefined
                  }
                  className="ms-auto size-9 rounded-full [&_svg]:size-[1.125rem]"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={busy ? "stop" : "send"}
                      className="flex"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={
                        reduced
                          ? { opacity: 0, transition: exitTransition }
                          : { opacity: 0, scale: 0.5, transition: exitTransition }
                      }
                      transition={reduced ? { duration: duration.fast } : spring.snappy}
                    >
                      {busy ? <StopIcon /> : <ArrowUpIcon />}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </div>

              {dragging && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-[inherit] border-2 border-dashed border-sheen-accent bg-sheen-accent-soft text-sm font-medium text-sheen-accent"
                >
                  <PaperclipIcon className="size-4" />
                  {L.dropFiles}
                </div>
              )}
            </div>

            <p className="mt-2 flex flex-wrap justify-center gap-x-1 px-2 text-center text-2xs text-sheen-fg-muted">
              {L.disclaimer && <span>{L.disclaimer}</span>}
              <span id={hintId} className={cn(L.disclaimer && "sr-only @md:not-sr-only")}>
                {L.disclaimer && <span aria-hidden>· </span>}
                {coarse ? L.keyHintTouch : L.keyHint}
              </span>
            </p>
          </form>

          <p aria-live="polite" aria-atomic className="sr-only">
            {announcement}
          </p>
        </GlassCard>
      </TooltipProvider>
    </AnnounceContext>
  );
}
