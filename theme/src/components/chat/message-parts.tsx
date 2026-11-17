"use client";

import { Fragment, memo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../dialog/dialog";
import { fileKind } from "../file-upload/file-utils";
import { ChatKeyframes, DeliveryStatus } from "./chat-parts";
import { emojiName } from "./emoji";
import { formatDateTime, formatFileSize, formatTime, toDate } from "./format";
import type { ChatLabels } from "./labels";
import type { ChatAttachment, ChatLinkPreview, ChatMessage, ChatReaction } from "./types";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileIcon, ImageIcon, LinkIcon, PencilIcon } from "./icons";
import { isRtlAt } from "../../hooks/use-direction";

/* ---------- Links in message text ---------- */

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]}])/gi;

/**
 * Keyboard: Links are focusable (Enter opens); rows that are not the list's current one pass `tabbable={false}` to stay out of the tab order.
 * Accessibility: Links open in a new tab with `rel="noopener noreferrer"`, keep a visible underline and a focus ring, and wrap long addresses instead of overflowing.
 *
 * @internal Message text with web addresses turned into links (opened in a new tab). Props: `text`, `own` (inside your own accent bubble, for link colours), `highlight` (a search query to mark), `tabbable` (default true: links are in the tab order).
 *
 * @example
 * ```tsx
 * import { MessageText } from "./message-parts";
 *
 * export const Body = () => <MessageText text="Docs at www.example.com/docs" own={false} />;
 * ```
 *
 * @see /chat/thread
 */
export function MessageText({
  text,
  own,
  highlight,
  tabbable = true,
}: {
  text: string;
  own?: boolean;
  highlight?: string;
  tabbable?: boolean;
}) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index;
    const url = match[0];
    if (start > last) parts.push(<Highlight key={`t${last}`} text={text.slice(last, start)} query={highlight} />);
    const href = url.startsWith("www.") ? `https://${url}` : url;
    parts.push(
      <a
        key={`a${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={tabbable ? undefined : -1}
        className={cn(
          "font-medium underline decoration-1 underline-offset-2 [overflow-wrap:anywhere]",
          own
            ? "text-sheen-accent-fg decoration-sheen-accent-fg/70 hover:decoration-2"
            : "text-sheen-accent decoration-sheen-accent/50 hover:decoration-2",
          "focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-1",
          own ? "focus-visible:outline-sheen-accent-fg" : "focus-visible:outline-sheen-focus",
        )}
      >
        {url}
      </a>,
    );
    last = start + url.length;
  }
  if (last < text.length) parts.push(<Highlight key={`t${last}`} text={text.slice(last)} query={highlight} />);
  return <>{parts}</>;
}

/**
 * Accessibility: `<mark>` is announced as highlighted by screen readers; forced colors use the system `Mark` colours.
 *
 * @internal Marks every case-insensitive match of `query` (search results) with a native `<mark>`. Props: `text`, `query` (nothing is marked when empty), `className`.
 *
 * @example
 * ```tsx
 * import { Highlight } from "./message-parts";
 *
 * export const Hit = () => <Highlight text="Lunch at noon?" query="noon" />;
 * ```
 *
 * @see /chat/list
 */
export function Highlight({ text, query, className }: { text: string; query?: string; className?: string }) {
  const q = query?.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLocaleLowerCase();
  const needle = q.toLocaleLowerCase();
  const out: ReactNode[] = [];
  let from = 0;
  for (;;) {
    const at = lower.indexOf(needle, from);
    if (at === -1) break;
    if (at > from) out.push(<Fragment key={`p${from}`}>{text.slice(from, at)}</Fragment>);
    out.push(
      <mark
        key={`m${at}`}
        className={cn(
          "rounded-[0.2em] bg-sheen-accent-soft px-px text-sheen-accent shadow-[0_0_0_1px_var(--sheen-accent-border)] forced-colors:bg-[Mark] forced-colors:text-[MarkText]",
          className,
        )}
      >
        {text.slice(at, at + needle.length)}
      </mark>,
    );
    from = at + needle.length;
  }
  if (from < text.length) out.push(<Fragment key={`p${from}`}>{text.slice(from)}</Fragment>);
  return <>{out}</>;
}

/* ---------- Meta: time · edited · ticks ---------- */

/** Props of {@link MessageMeta}. */
export type MessageMetaProps = {
  /** The message whose time, edited flag and delivery status are shown. */
  message: ChatMessage;
  /** Sent by the current user (shows delivery ticks). */
  own: boolean;
  /** BCP 47 locale for the time. Default: the browser's. */
  locale?: string;
  /** Translated text for the meta line: the "edited" marker. */
  labels: ChatLabels;
  /**
   * "bubble": inside a bubble. "overlay": on a dark pill over a photo. "plain": on the chat surface.
   * @default "bubble"
   */
  variant?: "bubble" | "overlay" | "plain";
  /** Extra classes for the meta line. */
  className?: string;
};

/**
 * Accessibility: A `<time dateTime>` element; the delivery state is spoken once after the text.
 *
 * @internal "10:42 · edited ✓✓". The full date and time are in a tooltip.
 *
 * @example
 * ```tsx
 * import { defaultChatLabels, type ChatMessage } from "@sheenui/theme";
 * import { MessageMeta } from "./message-parts";
 *
 * const message: ChatMessage = { id: "m1", senderId: "me", text: "Hi", createdAt: "2026-11-08T10:42:00Z", status: "read" };
 *
 * export const Meta = () => <MessageMeta message={message} own labels={defaultChatLabels} locale="en-US" />;
 * ```
 *
 * @see /chat/thread
 */
export function MessageMeta({ message, own, locale, labels, variant = "bubble", className }: MessageMetaProps) {
  const date = toDate(message.createdAt);
  const status = message.status ?? "sent";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-2xs leading-4 tabular-nums whitespace-nowrap select-none",
        variant === "overlay" &&
          "rounded-full bg-(--sheen-chat-media-scrim) px-1.5 py-0.5 text-(--sheen-chat-media-fg)",
        variant === "bubble" && (own ? "text-sheen-accent-fg/90" : "text-sheen-fg-muted"),
        variant === "plain" && "text-sheen-fg-muted",
        className,
      )}
    >
      {message.editedAt && !message.deleted && (
        <span className="inline-flex items-center gap-0.5">
          <PencilIcon className="size-2.5" />
          {labels.edited}
        </span>
      )}
      {date && (
        <time dir="auto" dateTime={date.toISOString()} title={formatDateTime(date, locale)}>
          {formatTime(date, locale)}
        </time>
      )}
      {own && !message.deleted && status !== "failed" && (
        <DeliveryStatus status={status} labels={labels} variant={variant === "plain" ? "list" : "bubble"} />
      )}
    </span>
  );
}

/* ---------- Quoted reply ---------- */

/** Props of {@link QuoteBlock}. */
export type QuoteBlockProps = {
  /** Who wrote the quoted message. */
  senderName: string;
  /** The quoted text (cut to two lines). */
  text: string;
  /** Inside your own (accent) bubble, or in the composer. */
  variant: "own" | "other" | "composer";
  /**
   * What the button does ("Go to the message from Riya"). Read before the visible quote as part of
   * the button's name ("Go to the message from Riya: See you at 6?"), so the name always contains the
   * visible text (WCAG 2.5.3) and the visible sender line is hidden from assistive tech (no repeat).
   * It is not an `aria-label`. Used only when `onClick` is set.
   */
  label?: string;
  /** Called when the quote is pressed (jump to the original). Without it the quote is not a button. */
  onClick?: () => void;
  /** Icon or thumbnail after the text. */
  icon?: ReactNode;
  /**
   * Off: out of the tab order (rows that are not the list's current one).
   * @default true
   */
  tabbable?: boolean;
  /** Extra classes for the quote. */
  className?: string;
};

/**
 * Keyboard: Enter or Space jumps to the original when `onClick` is set.
 * Accessibility: A button named from its content: `label`, then the quoted text (the name always contains the visible text); the bar is decorative, and text is truncated visually but available in full to screen readers.
 *
 * @internal A quoted message: accent bar, sender, one or two lines. A button that jumps to the original.
 *
 * @example
 * ```tsx
 * import { QuoteBlock } from "./message-parts";
 *
 * export const Quote = () => <QuoteBlock senderName="Riya" text="See you at 6?" variant="other" onClick={() => undefined} label="Go to the message from Riya" />;
 * ```
 *
 * @see /chat/thread
 */
export function QuoteBlock({
  senderName,
  text,
  variant,
  label,
  onClick,
  icon,
  tabbable = true,
  className,
}: QuoteBlockProps) {
  // As a button the name is made from the content: the action first (it already says who), then the quoted text.
  const named = Boolean(onClick && label);
  const content = (
    <>
      {named && <span className="sr-only">{label}: </span>}
      <span
        aria-hidden={named || undefined}
        className={cn(
          "flex min-w-0 items-center gap-1 truncate text-xs font-semibold",
          variant === "own" ? "text-sheen-accent-fg" : "text-sheen-accent",
        )}
      >
        {icon}
        {senderName}
      </span>
      <span
        dir="auto"
        className={cn(
          "line-clamp-2 min-w-0 text-start text-xs leading-4 [overflow-wrap:anywhere]",
          variant === "own" ? "text-sheen-accent-fg" : "text-sheen-fg-muted",
        )}
      >
        {text}
      </span>
    </>
  );
  const base = cn(
    "flex w-full min-w-0 flex-col gap-0.5 rounded-[0.625rem] border-s-[3px] px-2.5 py-1.5 text-start",
    variant === "own"
      ? "border-sheen-accent-fg/80 bg-(--sheen-chat-own-well)"
      : "border-sheen-accent bg-sheen-accent-soft",
    "forced-colors:border-[CanvasText]",
    className,
  );
  if (!onClick) return <span className={base}>{content}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabbable ? undefined : -1}
      className={cn(
        base,
        "cursor-pointer transition-[background-color] duration-(--sheen-duration-fast)",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
        variant === "own"
          ? "hover:bg-(--sheen-chat-own-well-hover) focus-visible:outline-sheen-accent-fg"
          : "hover:bg-sheen-hover",
      )}
    >
      {content}
    </button>
  );
}

/* ---------- Photos ---------- */

/** Props of {@link AttachmentGrid}. */
export type AttachmentGridProps = {
  /** The photos. Four are shown; more become a "+N" on the fourth. */
  images: ChatAttachment[];
  /** Translated text for the grid: the "+N" overflow count and each photo's "open image" name. */
  labels: ChatLabels;
  /** Called with the photo's index when it is pressed (open the viewer). */
  onOpen: (index: number) => void;
  /** Rounded corners only where the grid touches the bubble's edge. */
  className?: string;
  /** Over the last photo (e.g. the time). */
  overlay?: ReactNode;
  /**
   * Off: out of the tab order.
   * @default true
   */
  tabbable?: boolean;
};

/**
 * Keyboard: Each photo is a button: Enter or Space opens the viewer at that photo.
 * Accessibility: Buttons are named by the photo's `alt` (or file name); the "+N" tile says how many more there are.
 *
 * @internal 1 photo: one frame. 2: side by side. 3: one tall + two. 4+: a 2 x 2 grid, "+N" on the fourth.
 *
 * @example
 * ```tsx
 * import { defaultChatLabels } from "@sheenui/theme";
 * import { AttachmentGrid } from "./message-parts";
 *
 * export const Photos = () => (
 *   <AttachmentGrid
 *     labels={defaultChatLabels}
 *     images={[{ id: "a", kind: "image", name: "beach.jpg", url: "/beach.jpg", alt: "Beach at sunset" }]}
 *     onOpen={(index) => console.log(index)}
 *   />
 * );
 * ```
 *
 * @see /chat/thread
 */
export function AttachmentGrid({ images, labels, onOpen, className, overlay, tabbable = true }: AttachmentGridProps) {
  const shown = images.slice(0, 4);
  const extra = images.length - shown.length;
  const count = shown.length;
  return (
    <div
      className={cn(
        "relative grid w-72 max-w-full gap-0.5 overflow-hidden rounded-[0.875rem]",
        count === 1 && "grid-cols-1",
        count === 2 && "aspect-[2/1] grid-cols-2",
        count === 3 && "aspect-square grid-cols-2 grid-rows-2",
        count >= 4 && "aspect-square grid-cols-2 grid-rows-2",
        className,
      )}
    >
      {shown.map((image, i) => {
        const name = image.alt ?? image.name;
        const more = i === 3 && extra > 0;
        return (
          <button
            key={image.id}
            type="button"
            data-photo-index={i}
            tabIndex={tabbable ? undefined : -1}
            onClick={() => onOpen(i)}
            // WCAG 2.5.3: the name starts with the visible "+N" text.
            aria-label={more ? `${labels.morePhotos(extra)} ${labels.openImage(name)}` : labels.openImage(name)}
            className={cn(
              "group/photo relative block min-h-0 cursor-zoom-in overflow-hidden bg-sheen-hover",
              count === 1 && "aspect-[4/3] max-h-80",
              count === 3 && i === 0 && "row-span-2",
              "focus-visible:z-[1] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
            )}
          >
            {image.thumbnailUrl || image.url ? (
              <img
                src={image.thumbnailUrl ?? image.url}
                alt=""
                // The grid cell already reserves the box; the attributes give the browser the ratio up front all the same.
                width={image.width ?? (count === 1 ? 320 : 144)}
                height={image.height ?? (count === 1 ? 240 : count === 3 && i === 0 ? 288 : 144)}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="size-full object-cover transition-[scale] duration-(--sheen-duration-slow) ease-sheen-out motion-ok:group-hover/photo:scale-[1.03]"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-sheen-fg-muted">
                <ImageIcon className="size-6" />
              </span>
            )}
            {more && (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-(--sheen-chat-media-scrim) text-xl font-semibold text-(--sheen-chat-media-fg)"
              >
                {labels.morePhotos(extra)}
              </span>
            )}
          </button>
        );
      })}
      {/* On the grid, not in the last cell: a cell can be narrower than the time stamp (a phone, or wider text spacing) and would cut it. */}
      {overlay && (
        <span className="pointer-events-none absolute end-1.5 bottom-1.5 z-[2] max-w-[calc(100%-0.75rem)]">
          {overlay}
        </span>
      )}
    </div>
  );
}

/* ---------- Files ---------- */

const kindTint: Record<string, string> = {
  pdf: "bg-(--sheen-rose-700)",
  sheet: "bg-(--sheen-green-700)",
  doc: "bg-(--sheen-violet-600)",
  archive: "bg-(--sheen-amber-700)",
};

/**
 * Keyboard: Enter opens or downloads the file (it is a link or button).
 * Accessibility: Named by the file name and size; the icon tile is decorative and the file type is also written as a short extension.
 *
 * @internal A file attachment as a chip: type-coloured icon with its extension, name, size and a download action. Props: `file` (a ChatAttachment), `own` (inside your own bubble), `locale` (for the size), `labels`, `tabbable` (default true).
 *
 * @example
 * ```tsx
 * import { defaultChatLabels } from "@sheenui/theme";
 * import { FileChip } from "./message-parts";
 *
 * export const Doc = () => (
 *   <FileChip file={{ id: "f1", kind: "file", name: "plan.pdf", url: "/plan.pdf", size: 120_000, mimeType: "application/pdf" }} own={false} labels={defaultChatLabels} />
 * );
 * ```
 *
 * @see /chat/thread
 */
export function FileChip({
  file,
  own,
  locale,
  labels,
  tabbable = true,
}: {
  file: ChatAttachment;
  own: boolean;
  locale?: string;
  labels: ChatLabels;
  tabbable?: boolean;
}) {
  const kind = fileKind({ name: file.name, type: file.mimeType ?? "" });
  const ext = file.name.includes(".") ? file.name.split(".").pop()?.slice(0, 4).toUpperCase() : undefined;
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] text-sheen-accent-fg",
          kindTint[kind] ?? "bg-(--sheen-ink-550)",
        )}
      >
        <FileIcon className="size-5" />
        {ext && (
          <span className="absolute -bottom-1 rounded-sm bg-(--sheen-chat-media-scrim) px-1 text-[0.5625rem] leading-3 font-bold tracking-wide">
            {ext}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          dir="auto"
          className={cn(
            "line-clamp-2 text-start text-sm font-medium [overflow-wrap:anywhere]",
            own ? "text-sheen-accent-fg" : "text-sheen-fg",
          )}
        >
          {file.name}
        </span>
        {file.size !== undefined && (
          <span className={cn("text-xs", own ? "text-sheen-accent-fg/90" : "text-sheen-fg-muted")}>
            {formatFileSize(file.size, locale)}
          </span>
        )}
      </span>
      {file.url && (
        <DownloadIcon
          className={cn("size-[1.125rem] shrink-0", own ? "text-sheen-accent-fg" : "text-sheen-fg-muted")}
        />
      )}
    </>
  );
  const cls = cn(
    "flex w-68 max-w-full min-w-0 items-center gap-3 rounded-[0.75rem] p-2 pe-3 text-start",
    own ? "bg-(--sheen-chat-own-well)" : "bg-sheen-hover",
    "forced-colors:border forced-colors:border-[CanvasText]",
  );
  if (!file.url) return <span className={cls}>{body}</span>;
  return (
    <a
      href={file.url}
      download={file.name}
      aria-label={
        // The name carries every visible word (file name and size), so voice control can say what it sees.
        file.size !== undefined
          ? `${labels.download(file.name)}, ${formatFileSize(file.size, locale)}`
          : labels.download(file.name)
      }
      tabIndex={tabbable ? undefined : -1}
      className={cn(
        cls,
        "transition-[background-color] duration-(--sheen-duration-fast)",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
        own
          ? "hover:bg-(--sheen-chat-own-well-hover) focus-visible:outline-sheen-accent-fg"
          : "hover:bg-sheen-accent-soft",
      )}
    >
      {body}
    </a>
  );
}

/* ---------- Link preview ---------- */

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Keyboard: Enter opens the link.
 * Accessibility: A single link with `rel="noopener noreferrer"`; the title and description are its name.
 *
 * @internal A link preview card: image or gradient, site name, title and description, as one link that opens in a new tab. Props: `preview` (a ChatLinkPreview), `own` (inside your own bubble), `tabbable` (default true).
 *
 * @example
 * ```tsx
 * import { LinkPreviewCard } from "./message-parts";
 *
 * export const Preview = () => (
 *   <LinkPreviewCard preview={{ url: "https://example.com/post", title: "A good read", description: "Why glass works." }} own={false} />
 * );
 * ```
 *
 * @see /chat/thread
 */
export function LinkPreviewCard({
  preview,
  own,
  tabbable = true,
}: {
  preview: ChatLinkPreview;
  own: boolean;
  tabbable?: boolean;
}) {
  const site = preview.siteName ?? hostOf(preview.url);
  const image = preview.imageUrl;
  const isCss = image ? /^(linear|radial|conic)-gradient|^(repeating-)/.test(image) : false;
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabbable ? undefined : -1}
      className={cn(
        "group/link flex w-72 max-w-full min-w-0 flex-col overflow-hidden rounded-[0.75rem] text-start",
        own
          ? "bg-(--sheen-chat-own-well) hover:bg-(--sheen-chat-own-well-hover)"
          : "bg-sheen-hover hover:bg-sheen-accent-soft",
        "transition-[background-color] duration-(--sheen-duration-fast)",
        "focus-visible:outline-2 focus-visible:outline-offset-1",
        own ? "focus-visible:outline-sheen-accent-fg" : "focus-visible:outline-sheen-focus",
        "forced-colors:border forced-colors:border-[CanvasText]",
      )}
    >
      {image && (
        <span
          aria-hidden
          className="block aspect-[1.91/1] w-full bg-cover bg-center"
          style={isCss ? { backgroundImage: image } : { backgroundImage: `url("${image}")` }}
        />
      )}
      <span
        className={cn(
          "flex flex-col gap-0.5 border-s-[3px] px-2.5 py-2",
          own ? "border-sheen-accent-fg/80" : "border-sheen-accent",
        )}
      >
        <span
          className={cn(
            "flex items-center gap-1 text-2xs font-semibold tracking-wide uppercase",
            own ? "text-sheen-accent-fg/90" : "text-sheen-accent",
          )}
        >
          <LinkIcon className="size-3" />
          {site}
        </span>
        <span
          dir="auto"
          className={cn(
            "line-clamp-2 text-start text-sm font-semibold",
            own ? "text-sheen-accent-fg" : "text-sheen-fg",
          )}
        >
          {preview.title}
        </span>
        {preview.description && (
          <span
            dir="auto"
            className={cn("line-clamp-2 text-start text-xs", own ? "text-sheen-accent-fg/90" : "text-sheen-fg-muted")}
          >
            {preview.description}
          </span>
        )}
      </span>
    </a>
  );
}

/* ---------- Reactions ---------- */

/** Props of {@link ReactionChips}. */
export type ReactionChipsProps = {
  /** The reactions on the message. Empty ones are skipped. */
  reactions: ChatReaction[];
  /** The current user's id (to tell which reactions are theirs). */
  currentUserId: string;
  /** Translated text for the chips: the group name, each chip's spoken summary and the "you" in the tooltip. */
  labels: ChatLabels;
  /** Names for the tooltip ("Riya, Arjun and you"). */
  nameOf: (id: string) => string;
  /** Called with the emoji and whether to add (true) or remove (false) the current user's reaction. Without it the chips are read-only. */
  onToggle?: (emoji: string, add: boolean) => void;
  /** Sent by the current user (aligns the chips to the end). */
  own: boolean;
  /**
   * Off: out of the tab order.
   * @default true
   */
  tabbable?: boolean;
  /** Extra classes for the list. */
  className?: string;
};

/**
 * Keyboard: Each chip is a toggle button: Enter or Space adds or removes your reaction.
 * Accessibility: A list of buttons with `aria-pressed` and a spoken name like "thumbs up, 2 reactions, including yours"; the names are in the tooltip.
 * Motion: Chips pop in and out; reduced motion removes the movement.
 *
 * @internal Emoji chips under a bubble: press your own to remove it, another to add yours.
 *
 * @example
 * ```tsx
 * import { defaultChatLabels } from "@sheenui/theme";
 * import { ReactionChips } from "./message-parts";
 *
 * export const Reactions = () => (
 *   <ReactionChips
 *     reactions={[{ emoji: "👍", userIds: ["u1", "me"] }]}
 *     currentUserId="me"
 *     labels={defaultChatLabels}
 *     nameOf={(id) => id}
 *     own={false}
 *     onToggle={(emoji, add) => console.log(emoji, add)}
 *   />
 * );
 * ```
 *
 * @see /chat/thread
 */
export const ReactionChips = memo(function ReactionChips({
  reactions,
  currentUserId,
  labels,
  nameOf,
  onToggle,
  own,
  tabbable = true,
  className,
}: ReactionChipsProps) {
  const reduced = useSheenReducedMotion();
  const list = reactions.filter((r) => r.userIds.length > 0);
  if (list.length === 0) return null;
  return (
    <ul
      aria-label={labels.reactions}
      className={cn(
        "relative z-[1] flex flex-wrap gap-1 any-pointer-coarse:gap-2",
        own ? "justify-end" : "justify-start",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {list.map((r) => {
          const mine = r.userIds.includes(currentUserId);
          const names = r.userIds.map((id) => (id === currentUserId ? labels.you : nameOf(id)));
          return (
            <motion.li
              key={r.emoji}
              layout={reduced ? false : "position"}
              initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={
                reduced
                  ? { opacity: 0, transition: exitTransition }
                  : { scale: 0.6, opacity: 0, transition: exitTransition }
              }
              transition={reduced ? { duration: duration.fast } : spring.bouncy}
            >
              <button
                type="button"
                disabled={!onToggle}
                tabIndex={tabbable ? undefined : -1}
                aria-pressed={mine}
                aria-label={labels.reactionChip(emojiName(r.emoji), r.userIds.length, mine)}
                title={`${r.emoji} ${names.join(", ")}`}
                onClick={() => onToggle?.(r.emoji, !mine)}
                className={cn(
                  "sheen-hit relative inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2 text-xs font-semibold tabular-nums", // .sheen-hit: a 44 x 44 hit area on touch
                  "border shadow-[0_1px_2px_var(--sheen-shadow-near),0_4px_10px_-6px_var(--sheen-shadow-far)]",
                  "transition-[background-color,border-color,scale] duration-(--sheen-duration-fast) ease-sheen-out motion-ok:active:scale-90",
                  mine
                    ? "border-sheen-accent-border bg-[color-mix(in_oklab,var(--sheen-surface-solid)_80%,var(--sheen-accent))] text-sheen-accent"
                    : "border-sheen-border bg-sheen-surface text-sheen-fg-muted hover:text-sheen-fg",
                  "hover:border-sheen-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  "disabled:cursor-default",
                  "forced-colors:border-[ButtonText] forced-colors:aria-pressed:border-2 forced-colors:aria-pressed:border-[Highlight]",
                  "any-pointer-coarse:h-8",
                )}
              >
                <span aria-hidden className="text-sm leading-none">
                  {r.emoji}
                </span>
                {r.userIds.length > 1 && <span aria-hidden>{r.userIds.length}</span>}
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
});

/* ---------- Photo viewer ---------- */

/* Flat dark buttons over the photo (no glass: the dialog fades in, and faded glass loses its blur). */
const navButton = (side: string) =>
  cn(
    "absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-(--sheen-chat-media-scrim) text-(--sheen-chat-media-fg)",
    "transition-[background-color] duration-(--sheen-duration-fast) hover:bg-(--sheen-chat-media-scrim-strong)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sheen-chat-media-fg) any-pointer-coarse:size-11",
    "forced-colors:border forced-colors:border-[ButtonText]",
    side,
  );

/** Props of {@link ImageLightbox}. */
export type ImageLightboxProps = {
  /** Takes the photos to page through. */
  images: ChatAttachment[];
  /** The open photo's index, or `null` when closed (controlled). */
  index: number | null;
  /** Called with the new index when the person pages, or `null` to close. */
  onIndexChange: (index: number | null) => void;
  /** Translated text for the viewer: its dialog name, the "2 of 5" position, the previous/next buttons and download. */
  labels: ChatLabels;
  /** Line under the photo, e.g. "Riya Sharma · Yesterday, 18:40". */
  caption?: ReactNode;
  /** Where focus goes on close (defaults to what had focus before; pass the photo that opened it, since Safari doesn't focus tapped buttons). */
  finalFocus?: () => HTMLElement | null | undefined;
};

/**
 * Full-size photos in a dialog: Left / Right (and swipe) between them, a counter and a download
 * link. Controlled: `index` is the open photo (`null` is closed) and `onIndexChange` moves or
 * closes it.
 *
 * Props: see {@link ImageLightboxProps} (`images`, `index`, `onIndexChange`, `labels`, `caption`,
 * `finalFocus`).
 *
 * Keyboard: Left / Right (swapped in right-to-left pages) show the previous or next photo, Escape closes, Tab stays inside the dialog and focus returns to the photo that opened it.
 * Accessibility: A modal dialog named by the photo's alt text and counter ("2 of 5"); the download link has its own name; focus is trapped and the page behind is inert.
 * Glass: A dark scrim and veils over the photo keep the controls readable; no backdrop blur is added.
 * Motion: Photos slide in the direction of travel and the dialog fades; reduced motion uses fades only.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ImageLightbox, defaultChatLabels } from "@sheenui/theme";
 *
 * const photos = [{ id: "a", kind: "image", name: "beach.jpg", url: "/beach.jpg", alt: "Beach at sunset" }] as const;
 *
 * export function Gallery() {
 *   const [index, setIndex] = useState<number | null>(null);
 *   return (
 *     <>
 *       <button type="button" onClick={() => setIndex(0)}>Open photo</button>
 *       <ImageLightbox images={[...photos]} index={index} onIndexChange={setIndex} labels={defaultChatLabels} caption="Riya · Yesterday, 18:40" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /chat/thread
 */
export function ImageLightbox({ images, index, onIndexChange, labels, caption, finalFocus }: ImageLightboxProps) {
  const reduced = useSheenReducedMotion();
  const open = index !== null && images.length > 0;
  // The photo shown is the index itself (never a render behind); the last one is kept while the dialog animates closed.
  const [kept, setKept] = useState(index ?? 0);
  if (index !== null && index !== kept) setKept(index);
  const shown = index ?? kept;
  const [direction, setDirection] = useState(0);
  const image = images[Math.min(shown, images.length - 1)];
  const many = images.length > 1;

  const go = (step: number) => {
    if (!many) return;
    setDirection(step);
    onIndexChange((shown + step + images.length) % images.length);
  };

  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <ChatKeyframes />
      <DialogContent
        className="w-[min(60rem,calc(100vw-1.5rem))] max-w-none gap-3 p-3 sm:p-4"
        finalFocus={finalFocus ? () => finalFocus() ?? true : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const rtl = isRtlAt(e.currentTarget);
            e.preventDefault();
            go((e.key === "ArrowRight") !== rtl ? 1 : -1);
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-2 pe-10">
          <DialogTitle className="min-w-0 truncate text-sm font-semibold">
            {image?.alt ?? image?.name ?? labels.imageViewer}
          </DialogTitle>
          {many && (
            <span className="shrink-0 text-xs text-sheen-fg-muted tabular-nums" aria-live="polite">
              {labels.imagePosition(shown + 1, images.length)}
            </span>
          )}
        </div>
        {caption && <DialogDescription className="-mt-2 truncate text-xs">{caption}</DialogDescription>}
        <div
          className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-sheen-md bg-(--sheen-chat-media-scrim-strong)"
          onTouchStart={(e) => {
            const t = e.touches[0];
            touch.current = t ? { x: t.clientX, y: t.clientY } : null;
          }}
          onTouchEnd={(e) => {
            const start = touch.current;
            const t = e.changedTouches[0];
            touch.current = null;
            if (!start || !t) return;
            const dx = t.clientX - start.x;
            if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(t.clientY - start.y)) return;
            // A swipe towards the start goes forward (left in LTR, right in RTL), like the arrow keys.
            const rtl = isRtlAt(e.currentTarget);
            go(dx < 0 !== rtl ? 1 : -1);
          }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            {image && (
              <motion.img
                key={image.id}
                src={image.url ?? image.thumbnailUrl}
                alt={image.alt ?? image.name}
                draggable={false}
                custom={direction}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduced
                    ? { opacity: 0, transition: exitTransition }
                    : { opacity: 0, x: direction * -40, transition: exitTransition }
                }
                transition={reduced ? { duration: duration.fast } : spring.snappy}
                className="max-h-[calc(100dvh-10rem)] w-auto max-w-full object-contain select-none"
              />
            )}
          </AnimatePresence>
          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.previousImage}
                className={navButton("start-2")}
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.nextImage} className={navButton("end-2")}>
                <ChevronRightIcon className="size-5" />
              </button>
            </>
          )}
        </div>
        {image?.url && (
          <div className="flex justify-end">
            <a
              href={image.url}
              download={image.name}
              className="glass-1 inline-flex h-9 items-center gap-2 rounded-sheen-full px-3.5 text-sm font-medium [-webkit-backdrop-filter:none] [backdrop-filter:none] hover:bg-sheen-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus any-pointer-coarse:h-11"
            >
              <DownloadIcon className="size-4" />
              {labels.download(image.name)}
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
