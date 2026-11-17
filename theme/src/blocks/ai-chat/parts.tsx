"use client";

import { memo, useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import type { HeadingTag } from "../../lib/heading";
import { duration, ease, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { Button } from "../../components/button/button";
import { Tooltip } from "../../components/tooltip/tooltip";
import { type AiChatAttachment, type AiChatMessage, type AiChatFeedback, type AiChatLabels } from "./types";
import { formatBytes } from "./utils";
import { Markdown } from "./markdown";
import { SparkIcon, StopIcon, CopyIcon, CheckIcon, ThumbIcon, RetryIcon, FileIcon, XIcon, AlertIcon } from "./icons";

/* ---------- Orb (the assistant's avatar) ---------- */

/** The orb of the empty state and the assistant avatar; it pulses while `busy` and holds still under reduced motion. */
export function Orb({
  busy,
  size = "sm",
  reduced,
  className,
}: {
  busy: boolean;
  size?: "sm" | "md" | "lg";
  reduced: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "sheen-fill relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-sheen-accent-fg",
        "shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_6px_18px_-8px_var(--sheen-accent)] forced-colors:border forced-colors:border-[CanvasText]",
        size === "sm" && "size-8",
        size === "md" && "size-9",
        size === "lg" &&
          "size-16 shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_18px_48px_-14px_var(--sheen-accent)]",
        className,
      )}
    >
      {/* A conic swirl that turns while the assistant works. */}
      <span
        className={cn(
          "absolute inset-[-40%] [background:conic-gradient(from_0deg,var(--sheen-accent),var(--sheen-accent-2),var(--sheen-accent))]",
          busy && !reduced && "motion-ok:animate-[sheen-spin_var(--sheen-duration-loop-calm)_linear_infinite]",
        )}
      />
      <span className="absolute inset-[18%] rounded-full [background:radial-gradient(circle_at_35%_30%,var(--sheen-glass-highlight),transparent_65%)]" />
      <SparkIcon className={cn("relative", size === "lg" ? "size-7" : "size-4")} />
    </span>
  );
}

/* ---------- Thinking shimmer ---------- */

/**
 * "Thinking" with a band of light sweeping across it, over three skeleton lines.
 * The band is a window that slides right while the accent copy inside it slides left by
 * the same amount, so the copy stays exactly over the real letters (transform only).
 * Driven imperatively (WAAPI transforms): it stays smooth while replies re-render, and an
 * ancestor's AnimatePresence initial={false} can't freeze it.
 */
export function Thinking({ label, reduced }: { label: string; reduced: boolean }) {
  const windowRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    // Short sweeps so the band crosses the word early. Native WAAPI loop (compositor transform): the pause
    // between sweeps is baked into the keyframes (offset 0.85), so no JS ticks and no `repeatDelay`.
    const sweep = (el: HTMLElement | null, from: string, to: string, delay = 0) =>
      el?.animate([{ transform: from }, { transform: to, offset: 0.85 }, { transform: to }], {
        duration: 1350,
        easing: `cubic-bezier(${ease.inOut.join(",")})`,
        iterations: Infinity,
        delay,
        fill: "backwards",
      });
    const bars = Array.from(barsRef.current?.querySelectorAll<HTMLElement>("[data-sweep]") ?? []);
    const controls = [
      sweep(windowRef.current, "translateX(-100%)", "translateX(250%)"),
      sweep(copyRef.current, "translateX(40%)", "translateX(-100%)"),
      ...bars.map((bar, i) => sweep(bar, "translateX(-100%)", "translateX(200%)", i * 120)),
    ];
    return () => controls.forEach((c) => c?.cancel());
  }, [reduced]);

  return (
    <div className="flex flex-col gap-3 pt-1">
      <span className="relative inline-flex w-fit overflow-clip text-sm leading-7 font-medium whitespace-nowrap text-sheen-fg-muted">
        {label}
        {!reduced && (
          <span
            ref={windowRef}
            aria-hidden
            style={{ transform: "translateX(-100%)" }}
            className="pointer-events-none absolute inset-y-0 left-0 w-2/5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_35%,#000_65%,transparent)] forced-colors:hidden"
          >
            <span
              ref={copyRef}
              style={{ transform: "translateX(40%)" }}
              className="absolute inset-y-0 left-0 w-[250%] text-sheen-accent"
            >
              {label}
            </span>
          </span>
        )}
      </span>
      <span ref={barsRef} aria-hidden className="flex flex-col gap-2.5">
        {[92, 74, 48].map((width) => (
          <span
            key={width}
            className="relative block h-2.5 overflow-hidden rounded-full bg-sheen-hover forced-colors:border forced-colors:border-[CanvasText]"
            style={{ width: `${width}%` }}
          >
            {!reduced && (
              <span
                data-sweep
                style={{ transform: "translateX(-100%)" }}
                className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-(--sheen-glass-highlight) to-transparent"
              />
            )}
          </span>
        ))}
      </span>
    </div>
  );
}

/* ---------- Attachments ---------- */

/** A chip for one attached file: its name and size, with an optional remove button. */
export function AttachmentChip({
  attachment,
  locale,
  onRemove,
  removeLabel,
  reduced,
  appear = true,
}: {
  attachment: AiChatAttachment;
  locale: string;
  onRemove?: () => void;
  removeLabel?: string;
  reduced: boolean;
  /** Animate in on mount (off for messages that were there from the start). */
  appear?: boolean;
}) {
  const ext = attachment.name.includes(".") ? (attachment.name.split(".").pop() ?? "").toUpperCase() : "";
  const meta = [ext, attachment.size !== undefined ? formatBytes(attachment.size, locale) : ""]
    .filter(Boolean)
    .join(" · ");
  return (
    <motion.li
      layout={!reduced}
      initial={!appear ? false : reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        reduced ? { opacity: 0, transition: exitTransition } : { opacity: 0, scale: 0.92, transition: exitTransition }
      }
      transition={reduced ? { duration: duration.fast } : spring.snappy}
      className="flex max-w-60 min-w-0 items-center gap-2.5 rounded-sheen-md border border-sheen-border bg-sheen-surface/70 py-1.5 pe-1.5 ps-1.5"
    >
      {attachment.previewUrl ? (
        <img src={attachment.previewUrl} alt="" className="size-9 shrink-0 rounded-sheen-sm object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-sheen-sm bg-sheen-accent-soft text-sheen-accent"
        >
          <FileIcon className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col pe-1 text-start">
        <span className="truncate text-xs font-medium text-sheen-fg">{attachment.name}</span>
        {meta && <span className="truncate text-2xs text-sheen-fg-muted">{meta}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className={cn(
            "relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-sheen-fg-muted",
            "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
            "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-11 any-pointer-coarse:after:-translate-1/2",
          )}
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </motion.li>
  );
}

/* ---------- Message ---------- */

/** The callbacks the message actions need: copy, feedback and regenerate. */
export type MessageActions = {
  copy: (message: AiChatMessage) => void;
  feedback: (message: AiChatMessage, value: AiChatFeedback) => void;
  regenerate: () => void;
};

/** An icon-only action button with a tooltip and an accessible name. */
export const IconAction = ({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) => (
  <Tooltip content={label} delay={300}>
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "size-8 rounded-sheen-sm text-sheen-fg-muted hover:text-sheen-fg [&_svg]:size-4",
        pressed && "bg-sheen-accent-soft text-sheen-accent hover:text-sheen-accent",
        // High contrast flattens the tint: a pressed rating becomes a Highlight-filled button.
        "forced-colors:aria-pressed:forced-color-adjust-none forced-colors:aria-pressed:border-[Highlight] forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]",
      )}
    >
      {children}
    </Button>
  </Tooltip>
);

/** Props of `MessageItem`: the message, its state and the shared labels and actions. */
export type MessageItemProps = {
  message: AiChatMessage;
  last: boolean;
  /** Animate in on mount (off for messages present from the start). */
  appear: boolean;
  copied: boolean;
  feedback: AiChatFeedback;
  modelLabel?: string;
  labels: AiChatLabels;
  locale: string;
  reduced: boolean;
  headingTag: HeadingTag;
  actions: MessageActions;
};

/** One message of the thread: the bubble or answer, its attachments and (for answers) the copy, feedback and regenerate actions. */
export const MessageItem = memo(function MessageItem({
  message,
  last,
  appear,
  copied,
  feedback,
  modelLabel,
  labels,
  locale,
  reduced,
  headingTag: Heading,
  actions,
}: MessageItemProps) {
  const enter = appear
    ? reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: duration.fast } }
      : {
          initial: { opacity: 0, y: 14, scale: message.role === "user" ? 0.97 : 1 },
          animate: { opacity: 1, y: 0, scale: 1 },
          // The fade is a short tween; only the movement springs (a fade that springs lingers ~900 ms).
          transition: { ...spring.smooth, opacity: { duration: duration.fast, ease: ease.out } },
        }
    : { initial: false as const };

  if (message.role === "user") {
    return (
      <motion.li {...enter} className="flex min-w-0 flex-col items-end gap-2 [transform-origin:100%_100%]">
        <Heading className="sr-only">{labels.youSaid}</Heading>
        {message.attachments && message.attachments.length > 0 && (
          <ul className="flex max-w-[85%] flex-wrap justify-end gap-2">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} locale={locale} reduced={reduced} appear={appear} />
            ))}
          </ul>
        )}
        {message.content && (
          <div
            className={cn(
              "sheen-fill max-w-[85%] rounded-[1.25rem] rounded-ee-[0.375rem] px-4 py-2.5 text-[0.9375rem] leading-6 whitespace-pre-wrap text-sheen-accent-fg [overflow-wrap:anywhere] @lg:max-w-[75%]",
              "[background-image:var(--sheen-accent-fill)] shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_10px_24px_-14px_var(--sheen-accent)]",
              "forced-colors:border forced-colors:border-[CanvasText]",
            )}
          >
            {message.content}
          </div>
        )}
      </motion.li>
    );
  }

  const status = message.status ?? "done";
  const settled = status === "done" || status === "stopped";
  const working = status === "thinking" || status === "streaming";

  return (
    <motion.li {...enter} className="group/msg flex min-w-0 gap-3">
      {/* Narrow panels give the text the full width; the header still shows the status. */}
      <Orb busy={working} reduced={reduced} className="hidden @md:inline-flex" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <Heading className="sr-only">{labels.assistantSaid(labels.assistant)}</Heading>
        {status === "thinking" ? (
          <Thinking label={labels.thinking} reduced={reduced} />
        ) : message.content ? (
          <Markdown
            text={message.content}
            streaming={status === "streaming"}
            partial={status !== "done"}
            labels={labels}
          />
        ) : status === "stopped" ? (
          <p className="text-sm leading-7 text-sheen-fg-muted italic">{labels.stoppedEarly}</p>
        ) : null}

        {status === "error" && (
          <div className="flex flex-wrap items-center gap-3 rounded-sheen-md border border-sheen-danger-text/25 bg-sheen-danger-soft px-3.5 py-2.5 text-sm text-sheen-danger-text">
            <AlertIcon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">{(message.error ?? "") || labels.errorFallback}</span>
            {last && (
              <Button
                variant="glass"
                size="sm"
                onClick={actions.regenerate}
                leading={<RetryIcon className="size-3.5" />}
              >
                {labels.retry}
              </Button>
            )}
          </div>
        )}

        {settled && (
          <div
            className={cn(
              "-ms-1.5 flex flex-wrap items-center gap-0.5 any-pointer-coarse:gap-3",
              // Older replies show their actions on hover or focus (always on touch screens).
              !last &&
                "opacity-0 transition-opacity duration-(--sheen-duration-fast) group-hover/msg:opacity-100 group-focus-within/msg:opacity-100 any-pointer-coarse:opacity-100",
            )}
          >
            {message.content && (
              <IconAction label={copied ? labels.copied : labels.copy} onClick={() => actions.copy(message)}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconAction>
            )}
            {message.content && (
              <>
                <IconAction
                  label={labels.goodResponse}
                  pressed={feedback === "up"}
                  onClick={() => actions.feedback(message, feedback === "up" ? null : "up")}
                >
                  <ThumbIcon filled={feedback === "up"} />
                </IconAction>
                <IconAction
                  label={labels.badResponse}
                  pressed={feedback === "down"}
                  onClick={() => actions.feedback(message, feedback === "down" ? null : "down")}
                >
                  <ThumbIcon down filled={feedback === "down"} />
                </IconAction>
              </>
            )}
            {last && (
              <IconAction label={labels.regenerate} onClick={actions.regenerate}>
                <RetryIcon />
              </IconAction>
            )}
            {(status === "stopped" && message.content) || modelLabel ? (
              <span className="ms-1.5 flex items-center gap-1.5 text-2xs font-medium text-sheen-fg-muted">
                {status === "stopped" && message.content && (
                  <span className="inline-flex items-center gap-1">
                    <StopIcon className="size-2.5" />
                    {labels.stopped}
                  </span>
                )}
                {status === "stopped" && message.content && modelLabel && <span aria-hidden>·</span>}
                {modelLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </motion.li>
  );
});
