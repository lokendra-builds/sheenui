"use client";

import { memo, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { createMenuHandle, MenuTrigger } from "../menu/menu";
import { Tooltip } from "../tooltip/tooltip";
import { ChatAvatar, TypingDots, chatAppearReduced } from "./chat-parts";
import { isJumboEmoji } from "./emoji";
import { formatTime, messageSummary, textDirection, toDate } from "./format";
import type { ChatLabels } from "./labels";
import {
  AttachmentGrid,
  FileChip,
  LinkPreviewCard,
  MessageMeta,
  MessageText,
  QuoteBlock,
  ReactionChips,
} from "./message-parts";
import { useToolbarShown, type ToolbarStore } from "./toolbar-store";
import type { ChatMessage, ChatParticipant } from "./types";
import { BanIcon, MoreIcon, ReplyIcon, RetryIcon, SmilePlusIcon } from "./icons";
import { AlertIcon } from "../status-icons/icons";
import { isRtlAt } from "../../hooks/use-direction";

/** The ⋯ menu shared by every message (one menu for the whole thread; the payload is the message id). */
export type MessageMenuHandle = ReturnType<typeof createMenuHandle<string>>;

/** Stable callbacks from the thread (one object for every row, so rows stay memoised). */
export type MessageRowActions = {
  focus: (id: string) => void;
  hover: (id: string | null) => void;
  /** The thread's hover-toolbar store: each row listens to its own flag, so a hover does not re-render the thread. */
  toolbar: ToolbarStore;
  keyDown: (event: KeyboardEvent<HTMLElement>, message: ChatMessage) => void;
  react: (message: ChatMessage, emoji: string, add: boolean) => void;
  openReactions: (message: ChatMessage, anchor: HTMLElement) => void;
  reply: (message: ChatMessage) => void;
  retry: (message: ChatMessage) => void;
  jumpTo: (id: string) => void;
  openImage: (message: ChatMessage, index: number) => void;
  nameOf: (id: string) => string;
  moreMenu: MessageMenuHandle;
};

/** Props of {@link MessageRow}. */
export type MessageRowProps = {
  /** The message to draw (a bubble, or a centred note when `kind` is "system"). */
  message: ChatMessage;
  /** Sent by the current user (accent bubble at the end side, delivery ticks). */
  own: boolean;
  /** The sender, for the avatar. */
  sender?: ChatParticipant;
  /** The sender's display name (shown on the first message of a run in groups). */
  senderName: string;
  /** Position in a run of messages from the same sender. */
  first: boolean;
  /** Last message of its run (rounds the bubble's tail corner). */
  last: boolean;
  /** Groups: the avatar column is shown (avatar on the run's first message, a spacer otherwise). */
  avatarColumn: boolean;
  /** Show the sender's name above the bubble (first of a run, in groups). */
  showName: boolean;
  /** The thread's one tab stop. */
  active: boolean;
  /** Spring in (sent or received after the thread opened). */
  appear: boolean;
  /** Briefly tinted (jumped to from a quote). */
  flash: boolean;
  /** Text of the quoted message's sender. */
  quoteName?: string;
  /** Unique DOM id prefix for this row (used by `aria-activedescendant`-style references). */
  domId: string;
  /** The current user's id (to tell your own reactions apart). */
  currentUserId: string;
  /** "comfortable" or "compact" spacing. */
  density: "comfortable" | "compact";
  /** BCP 47 locale for times. Default: the browser's. */
  locale?: string;
  /** Translated text for the row; passed down to its meta line, attachments, reactions and viewer. */
  labels: ChatLabels;
  /** Stable callbacks from the thread (one object for every row, so rows stay memoised). */
  actions: MessageRowActions;
};

/* Bubble corners: tight where a run continues (logical, so RTL mirrors them). */
function corners(own: boolean, first: boolean, last: boolean) {
  if (own) return cn("rounded-[1.25rem]", !first && "rounded-se-[0.375rem]", !last && "rounded-ee-[0.375rem]");
  return cn("rounded-[1.25rem]", !first && "rounded-ss-[0.375rem]", !last && "rounded-es-[0.375rem]");
}

/*
 * Incoming bubbles use the glass look (rim, specular, translucent fill) without their own
 * backdrop blur: hundreds of blurred layers would make scrolling heavy, and the thread's glass
 * panel behind them is already blurred.
 */
const incomingBubble = cn(
  "glass-1 [-webkit-backdrop-filter:none] [backdrop-filter:none] text-sheen-fg",
  "bg-(--sheen-chat-in-fill)",
);

/* Your bubbles: the accent fill (accent-fg text >= 4.5:1 across the gradient). High contrast: a framed system-colour bubble. */
const ownBubble = cn(
  "text-sheen-accent-fg bg-(--sheen-violet-700) [background-image:var(--chat-own-fill,var(--sheen-accent-fill))]",
  "shadow-[inset_0_1px_0_color-mix(in_oklab,var(--sheen-accent-fg)_22%,transparent),0_6px_18px_-10px_var(--sheen-accent-glow)]",
  "forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:[background-image:none] forced-colors:text-[CanvasText]",
);

/**
 * Keyboard: The thread keeps one tab stop on the active row: Up / Down / Home / End / Page Up / Page Down move between rows, Enter or Space opens the actions menu, R replies and E edits your own message (the thread owns these keys). The hover toolbar is a roving-focus group (Left / Right, Home / End).
 * Accessibility: Each row is an `article` named by its spoken summary (sender, text, time, delivery state); the toolbar has its own name; system notes are plain paragraphs.
 * Glass: Incoming bubbles use the glass look without a backdrop blur of their own (hundreds of blurred layers would make scrolling heavy); your bubbles are a flat accent fill.
 * Motion: New messages spring in; reduced motion fades them with a short opacity transition.
 *
 * @internal One message in {@link ChatThread}: avatar, bubble (text, quote, photos, files, link
 * preview), reactions, time and delivery ticks, plus a hover toolbar (react, reply, more) and a
 * failed-send "Retry". Memoised so only changed rows re-render; ChatThread builds the props.
 * See {@link MessageRowProps}.
 *
 * @example
 * ```tsx
 * import type { MessageRowProps } from "./message-row";
 * import { MessageRow } from "./message-row";
 *
 * export const Row = (props: MessageRowProps) => <MessageRow {...props} />;
 * ```
 *
 * @see /chat/thread
 */
export const MessageRow = memo(function MessageRow({
  message,
  own,
  sender,
  senderName,
  first,
  last,
  avatarColumn,
  showName,
  active,
  appear,
  flash,
  quoteName,
  domId,
  currentUserId,
  density,
  locale,
  labels: L,
  actions,
}: MessageRowProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  // Desktop pointer: this row shows its hover toolbar (the thread does not re-render for it).
  const toolbar = useToolbarShown(actions.toolbar, message.id);
  const toolbarRef = useRef<HTMLDivElement>(null);
  /*
   * The hover toolbar sits beside the bubble. Where there is no room for it (a narrow chat: the
   * widget, a sidebar), it moves above the bubble, or below it at the top of the log.
   */
  const [toolbarAt, setToolbarAt] = useState<"side" | "above" | "below">("side");
  // Roving focus inside the toolbar: one Tab stop, ← / → (Home / End) between its buttons.
  const [toolbarIndex, setToolbarIndex] = useState(0);
  useLayoutEffect(() => {
    const bar = toolbarRef.current;
    if (!toolbar || !bar) {
      setToolbarAt("side");
      return;
    }
    if (toolbarAt !== "side") return;
    const log = bar.closest("[data-chat-log]");
    const column = bar.parentElement;
    if (!log || !column) return;
    const b = bar.getBoundingClientRect();
    const box = log.getBoundingClientRect();
    if (b.left >= box.left + 4 && b.right <= box.right - 4) return;
    setToolbarAt(column.getBoundingClientRect().top - b.height - 4 >= box.top + 4 ? "above" : "below");
  }, [toolbar, toolbarAt]);
  const date = toDate(message.createdAt);
  const time = date ? formatTime(date, locale) : "";
  const compact = density === "compact";
  const replyToId = message.replyTo?.id;

  /* ----- System note ("Riya joined") ----- */
  if (message.kind === "system") {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- roving-tabindex feed item: the key handler implements the arrow-key navigation between messages (WAI-ARIA feed pattern)
      <div
        id={domId}
        data-message-id={message.id}
        data-system=""
        role="article"
        aria-roledescription={L.messageRole}
        aria-label={`${message.text ?? ""}${time ? `, ${time}` : ""}`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- roving tabindex: the active message is the thread's single tab stop
        tabIndex={active ? 0 : -1}
        onFocus={(e) => e.target === e.currentTarget && actions.focus(message.id)}
        onKeyDown={(e) => actions.keyDown(e, message)}
        className="flex scroll-mt-14 scroll-mb-4 justify-center px-3 py-2 outline-none focus-visible:[&>span]:outline-2 focus-visible:[&>span]:outline-offset-2 focus-visible:[&>span]:outline-sheen-focus"
      >
        <span
          dir="auto"
          className="max-w-[85%] rounded-full bg-sheen-hover px-3 py-1 text-center text-xs text-sheen-fg-muted forced-colors:border forced-colors:border-[CanvasText]"
        >
          {message.text}
        </span>
      </div>
    );
  }

  const deleted = Boolean(message.deleted);
  // A deleted message has no delivery state left to report (or retry).
  const status = own && !deleted ? (message.status ?? "sent") : undefined;
  const failed = status === "failed";
  const images = deleted ? [] : (message.attachments ?? []).filter((a) => a.kind === "image");
  const files = deleted ? [] : (message.attachments ?? []).filter((a) => a.kind === "file");
  const text = deleted ? undefined : message.text?.trim();
  const jumbo =
    !deleted &&
    images.length === 0 &&
    files.length === 0 &&
    !message.replyTo &&
    !message.linkPreview &&
    isJumboEmoji(text);
  const onlyImages =
    !deleted && images.length > 0 && !text && files.length === 0 && !message.replyTo && !message.linkPreview;
  const summary = messageSummary(message, L, own);

  // What a screen reader hears when the message itself is focused.
  const spoken = [
    L.messageFrom(own ? L.you : senderName, time),
    message.replyTo ? `${L.replyingTo(quoteName ?? "")}: ${message.replyTo.text ?? ""}` : "",
    summary,
    message.editedAt && !deleted ? L.edited : "",
    status ? L.status[status] : "",
    message.reactions?.length ? message.reactions.map((r) => `${r.emoji} ${r.userIds.length}`).join(", ") : "",
  ]
    .filter(Boolean)
    .join(". ");

  const tabbable = active;

  // A deleted message of yours sits in a glass bubble, not the accent one: muted text, no ticks.
  const meta = (
    <MessageMeta
      message={message}
      own={own}
      locale={locale}
      labels={L}
      variant={onlyImages ? "overlay" : jumbo || deleted ? "plain" : "bubble"}
    />
  );

  /* The footer floats at the end of the last line (WhatsApp): an invisible copy of it holds its space. */
  const metaSpacer = (
    <span aria-hidden className="invisible ms-2 inline-block align-bottom">
      <MessageMeta message={message} own={own} locale={locale} labels={L} variant={deleted ? "plain" : "bubble"} />
    </span>
  );

  let body: ReactNode;
  if (deleted) {
    body = (
      <p className="flex items-center gap-1.5 text-sm text-sheen-fg-muted italic">
        <BanIcon className="size-3.5" />
        {summary}
        {metaSpacer}
      </p>
    );
  } else if (jumbo) {
    body = (
      <p className="text-[2.75rem] leading-[1.15] tracking-[0.08em]" aria-hidden={false}>
        {text}
      </p>
    );
  } else {
    body = (
      <>
        {message.replyTo && (
          <QuoteBlock
            variant={own ? "own" : "other"}
            senderName={quoteName ?? ""}
            text={
              message.replyTo.text ??
              (message.replyTo.attachmentKind ? L.attachmentSummary(message.replyTo.attachmentKind, 1) : "")
            }
            label={L.goToQuoted(quoteName ?? "")}
            onClick={() => {
              if (replyToId !== undefined) actions.jumpTo(replyToId);
            }}
            tabbable={tabbable}
            className="mb-1"
          />
        )}
        {images.length > 0 && (
          <AttachmentGrid
            images={images}
            labels={L}
            tabbable={tabbable}
            onOpen={(i) => actions.openImage(message, i)}
            overlay={onlyImages ? meta : undefined}
            className={cn(onlyImages ? "rounded-[1rem]" : "mb-1")}
          />
        )}
        {files.length > 0 && (
          <div className="mb-1 flex flex-col gap-1">
            {files.map((f) => (
              <FileChip key={f.id} file={f} own={own} locale={locale} labels={L} tabbable={tabbable} />
            ))}
          </div>
        )}
        {text && (
          <p
            className={cn(
              "px-1 text-[0.9375rem] leading-[1.4] whitespace-pre-wrap [overflow-wrap:anywhere]",
              compact && "text-sm",
            )}
          >
            <MessageText text={text} own={own} tabbable={tabbable} />
            {metaSpacer}
          </p>
        )}
        {message.linkPreview && (
          <div className="mt-1">
            <LinkPreviewCard preview={message.linkPreview} own={own} tabbable={tabbable} />
          </div>
        )}
        {!text && !onlyImages && <span className="block h-4" />}
      </>
    );
  }

  const bubble = jumbo ? (
    <div ref={bubbleRef} className="flex flex-col items-end gap-0.5 px-1">
      {body}
      <span className="rounded-full bg-sheen-hover px-1.5 py-0.5">{meta}</span>
    </div>
  ) : (
    <div
      ref={bubbleRef}
      // The bubble reads in its text's direction (time at that text's end), whatever the page's.
      dir={textDirection(text ?? message.replyTo?.text)}
      className={cn(
        "relative min-w-0 max-w-full",
        deleted ? cn(incomingBubble, "border-dashed") : own ? ownBubble : incomingBubble,
        corners(own, first, last),
        onlyImages
          ? "p-1"
          : images.length > 0 || message.replyTo || files.length || message.linkPreview
            ? "px-1.5 pt-1.5 pb-1.5"
            : "px-2.5 py-1.5",
      )}
    >
      {body}
      {!onlyImages && <span className="absolute end-2.5 bottom-1.5">{meta}</span>}
      {/* Jumped to from a quote: a soft tint that fades (colour only, so it also shows with reduced motion). */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] bg-sheen-accent-soft ring-2 ring-sheen-accent-border transition-opacity duration-(--sheen-duration-slower) ease-sheen-out",
          flash ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );

  const avatar = avatarColumn ? (
    <span className={cn("w-8 shrink-0 self-end", compact && "w-7")}>
      {first && sender ? <ChatAvatar people={[sender]} size="sm" className={cn(compact && "size-7")} /> : null}
    </span>
  ) : null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- roving-tabindex feed item: the key handler implements the arrow-key navigation between messages (WAI-ARIA feed pattern)
    <div
      id={domId}
      data-message-id={message.id}
      data-own={own || undefined}
      role="article"
      aria-roledescription={L.messageRole}
      aria-labelledby={`${domId}-spoken`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- roving tabindex: the active message is the thread's single tab stop
      tabIndex={active ? 0 : -1}
      onFocus={(e) => e.target === e.currentTarget && actions.focus(message.id)}
      onKeyDown={(e) => actions.keyDown(e, message)}
      onPointerEnter={(e) => e.pointerType !== "touch" && actions.hover(message.id)}
      onPointerLeave={(e) => e.pointerType !== "touch" && actions.hover(null)}
      className={cn(
        "group/msg relative flex scroll-mt-14 scroll-mb-4 gap-2 px-3 outline-none @lg:px-4",
        own ? "flex-row-reverse" : "flex-row",
        first ? "pt-2.5" : "pt-0.5",
        // Keyboard focus: a ring around the whole row (the bubble may be any colour).
        "focus-visible:bg-sheen-hover focus-visible:shadow-[inset_3px_0_0_var(--sheen-focus)] rtl:focus-visible:shadow-[inset_-3px_0_0_var(--sheen-focus)]",
        "forced-colors:focus-visible:outline-2 forced-colors:focus-visible:-outline-offset-2",
      )}
    >
      <span id={`${domId}-spoken`} hidden>
        {spoken}
      </span>
      {avatar}
      <div
        className={cn(
          "relative flex min-w-0 flex-col",
          own ? "items-end" : "items-start",
          // Room beside the bubble for the hover toolbar on desktop; wider bubbles on phones.
          compact ? "max-w-[min(30rem,calc(100%-3.5rem))]" : "max-w-[min(34rem,calc(100%-7rem))]",
          "pointer-coarse:max-w-[min(34rem,86%)]",
          appear && (own ? "origin-bottom-right rtl:origin-bottom-left" : "origin-bottom-left rtl:origin-bottom-right"),
          appear &&
            cn(
              "motion-ok:animate-[sheen-chat-in_var(--sheen-duration-smooth)_var(--sheen-ease-smooth)_both,sheen-chat-fade_var(--sheen-duration-fast)_var(--sheen-ease-out)_both]",
              chatAppearReduced,
            ),
        )}
      >
        {showName && !own && (
          <span className="mb-0.5 max-w-full truncate px-3 text-xs font-semibold text-sheen-accent">
            <span className="sr-only">{"​"}</span>
            {senderName}
          </span>
        )}
        {!showName && (
          <span className="sr-only">
            {own ? L.you : senderName}
            {": "}
          </span>
        )}
        {bubble}

        {failed && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-sheen-danger-text">
            <AlertIcon className="size-3.5 shrink-0" />
            {L.notDelivered}
            <span aria-hidden>·</span>
            <button
              type="button"
              tabIndex={tabbable ? undefined : -1}
              onClick={() => actions.retry(message)}
              className="relative inline-flex cursor-pointer items-center gap-1 rounded-sm font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11 any-pointer-coarse:justify-center"
            >
              <RetryIcon className="size-3.5" />
              {L.retry}
            </button>
          </p>
        )}

        {message.reactions && message.reactions.length > 0 && !deleted && (
          <ReactionChips
            reactions={message.reactions}
            currentUserId={currentUserId}
            labels={L}
            nameOf={actions.nameOf}
            own={own}
            tabbable={tabbable}
            onToggle={(emoji, add) => actions.react(message, emoji, add)}
            className={cn("-mt-1.5 px-2", own ? "pe-3" : "ps-3")}
          />
        )}

        {toolbar && !deleted && (
          <div
            ref={toolbarRef}
            role="toolbar"
            aria-label={L.moreActions}
            onKeyDown={(e) => {
              const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button"));
              const at = buttons.indexOf(document.activeElement as HTMLElement);
              const rtl = isRtlAt(e.currentTarget);
              let to = -1;
              if (e.key === "ArrowRight" || e.key === "ArrowLeft")
                to = at + ((e.key === "ArrowRight") !== rtl ? 1 : -1);
              else if (e.key === "Home") to = 0;
              else if (e.key === "End") to = buttons.length - 1;
              if (to === -1 && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const next = (to + buttons.length) % buttons.length;
              setToolbarIndex(next);
              buttons[next]?.focus();
            }}
            onFocus={(e) => {
              const i = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button")).indexOf(e.target);
              if (i >= 0) setToolbarIndex(i);
            }}
            className={cn(
              "glass-3 absolute z-[3] flex items-center gap-0.5 rounded-full p-0.5",
              toolbarAt === "side"
                ? cn("top-0", own ? "end-[calc(100%+0.375rem)]" : "start-[calc(100%+0.375rem)]")
                : cn(
                    toolbarAt === "above" ? "bottom-[calc(100%+0.25rem)]" : "top-[calc(100%+0.25rem)]",
                    own ? "end-1" : "start-1",
                  ),
              "motion-ok:animate-[sheen-chat-pop_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)_both]",
            )}
          >
            <Tooltip content={L.react} delay={250}>
              <button
                type="button"
                aria-label={L.react}
                aria-haspopup="dialog"
                tabIndex={tabbable && toolbarIndex === 0 ? undefined : -1}
                onClick={() => bubbleRef.current && actions.openReactions(message, bubbleRef.current)}
                className={toolbarButton}
              >
                <SmilePlusIcon />
              </button>
            </Tooltip>
            <Tooltip content={L.reply} delay={250}>
              <button
                type="button"
                aria-label={L.reply}
                tabIndex={tabbable && toolbarIndex === 1 ? undefined : -1}
                onClick={() => actions.reply(message)}
                className={toolbarButton}
              >
                <ReplyIcon />
              </button>
            </Tooltip>
            <Tooltip content={L.moreActions} delay={250}>
              <MenuTrigger
                handle={actions.moreMenu}
                payload={message.id}
                aria-label={L.moreActions}
                tabIndex={tabbable && toolbarIndex === 2 ? undefined : -1}
                className={cn(toolbarButton, "data-popup-open:bg-sheen-hover")}
              >
                <MoreIcon />
              </MenuTrigger>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
});

const toolbarButton = cn(
  "flex size-7 cursor-pointer items-center justify-center rounded-full text-sheen-fg-muted",
  "transition-[background-color,color,scale] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg motion-ok:active:scale-90",
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus [&_svg]:size-4",
);

/**
 * Accessibility: `aria-hidden`: the thread announces who is typing in its live region instead.
 * Motion: Springs in; the dots wave and pause off screen. Reduced motion shows a short fade and still dots.
 *
 * @internal "Riya is typing…" as a bubble at the end of the thread. Props: `people` (who is typing; the first avatar is shown), `avatarColumn` (leave room for the avatar column), `label` (the words, as a tooltip).
 *
 * @example
 * ```tsx
 * import { TypingBubble } from "./message-row";
 *
 * export const Typing = () => <TypingBubble people={[{ id: "u1", name: "Riya" }]} avatarColumn label="Riya is typing" />;
 * ```
 *
 * @see /chat/thread
 */
export function TypingBubble({
  people,
  avatarColumn,
  label,
}: {
  people: ChatParticipant[];
  avatarColumn: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-2 px-3 pt-2.5 @lg:px-4" aria-hidden>
      {avatarColumn && (
        <span className="w-8 shrink-0 self-end">
          {people[0] && <ChatAvatar people={people.slice(0, 1)} size="sm" />}
        </span>
      )}
      <div
        title={label}
        className={cn(
          incomingBubble,
          "flex h-9 items-center rounded-[1.25rem] px-3.5 text-sheen-fg-muted origin-bottom-left rtl:origin-bottom-right",
          "motion-ok:animate-[sheen-chat-in_var(--sheen-duration-smooth)_var(--sheen-ease-smooth)_both,sheen-chat-fade_var(--sheen-duration-fast)_var(--sheen-ease-out)_both]",
          chatAppearReduced,
        )}
      >
        <TypingDots />
      </div>
    </div>
  );
}
