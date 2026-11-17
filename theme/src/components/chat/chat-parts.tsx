"use client";

import { useRef, type ComponentProps } from "react";
import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { Avatar } from "../avatar/avatar";
import type { ChatLabels } from "./labels";
import type { ChatMessageStatus, ChatParticipant, ChatPresence } from "./types";
import { useLoopPlayback } from "../../motion/gate";
import { CheckCheckIcon, CheckIcon, ClockIcon } from "./icons";
import { AlertIcon } from "../status-icons/icons";

/* ---------- Keyframes and chat tokens ---------- */

/*
 * Chat-only keyframes and component tokens. React 19 hoists a <style> with href + precedence
 * into <head> once, however many chat components render it. Transform/opacity only. Reduced
 * motion (OS or [data-motion="reduced"]) finishes every CSS animation at once (styles/motion.css),
 * so the dots rest and nothing pulses; entrances then use a short opacity transition instead.
 *
 * Tokens (tier 3, built from the theme's primitives, no literal colours; override them on any
 * ancestor). :where() keeps them at zero specificity.
 *   --sheen-chat-in-fill         incoming bubbles and day labels: a light lift over the chat's
 *                                glass (no blur of their own), text-sheen-fg on it
 *   --sheen-chat-own-well(-hover) quote, file and link wells inside your own (accent) bubble
 *   --sheen-chat-media-scrim(-strong) veils over photos (time, +N, the photo viewer) that keep
 *                                --sheen-chat-media-fg text >= 4.5:1 on any photo
 */
const KEYFRAMES = `
:where(:root) {
  --sheen-chat-in-fill: light-dark(color-mix(in oklab, var(--sheen-ink-0) 82%, transparent), color-mix(in oklab, var(--sheen-ink-0) 9%, transparent));
  --sheen-chat-own-well: color-mix(in oklab, var(--sheen-ink-950) 18%, transparent);
  --sheen-chat-own-well-hover: color-mix(in oklab, var(--sheen-ink-950) 26%, transparent);
  --sheen-chat-media-scrim: color-mix(in oklab, var(--sheen-ink-950) 58%, transparent);
  --sheen-chat-media-scrim-strong: color-mix(in oklab, var(--sheen-ink-950) 80%, transparent);
  --sheen-chat-media-fg: var(--sheen-ink-0);
}
@keyframes sheen-chat-typing { 0%, 60%, 100% { transform: translateY(0); opacity: .45 } 30% { transform: translateY(-3px); opacity: 1 } }
@keyframes sheen-chat-attention { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.65); opacity: 0 } }
@keyframes sheen-chat-flash { 0%, 100% { opacity: 0 } 18%, 60% { opacity: 1 } }
@keyframes sheen-chat-in { from { transform: translateY(8px) scale(.96) } to { transform: none } }
@keyframes sheen-chat-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sheen-chat-pop { 0% { transform: scale(.4) } 60% { transform: scale(1.18) } 100% { transform: scale(1) } }
`;

/**
 * Accessibility: Styles only; renders no visible element.
 * Motion: Defines the chat keyframes; the components that use them wrap them in `motion-ok:` so reduced motion cuts them.
 *
 * @internal Injects the chat's keyframes and tokens (typing wave, attention ring, message entrance) once per page as a hoisted `<style>`. Chat components render it for you; no props.
 *
 * @example
 * ```tsx
 * import { ChatKeyframes } from "./chat-parts";
 *
 * export const Root = () => (
 *   <>
 *     <ChatKeyframes />
 *     <div className="motion-ok:animate-[sheen-chat-in_.3s_ease-out]">New message</div>
 *   </>
 * );
 * ```
 *
 * @see /chat/thread
 */
export function ChatKeyframes() {
  return (
    <style href="sheen-chat-keyframes" precedence="default">
      {KEYFRAMES}
    </style>
  );
}

/*
 * Something new appearing (a message, the typing bubble, a badge). With motion: the keyframe
 * (rise + scale + fade). Reduced motion: CSS animations are cut to 1ms there, so it fades in
 * with a 150ms opacity transition from @starting-style instead (state changes stay visible).
 */
/** The glass look (fill, rim, shadow) without its own backdrop blur: for glass that sits on the chat's glass already (keeps the page within its blur budget). */
export const chatNoBlur = "[-webkit-backdrop-filter:none] [backdrop-filter:none]";

/** Reduced-motion counterpart of the chat's entrance animations: a short opacity fade-in (via `starting:opacity-0`), to add next to a `motion-ok:animate-*` class. */
export const chatAppearReduced =
  "motion-reduced:transition-opacity motion-reduced:duration-(--sheen-duration-fast) motion-reduced:ease-sheen-out motion-reduced:starting:opacity-0";

/* ---------- Avatars ---------- */

const avatarBox = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-14",
  "2xl": "size-20",
} as const;

/*
 * Avatar's circle is glass-1. Here it sits on the chat's own glass, where a second blur shows
 * nothing and costs a backdrop-filter pass per avatar (a list shows a dozen): the circle keeps
 * its glass fill and rim, without the blur.
 */
const avatarNoBlur = "[&>span:first-child]:[-webkit-backdrop-filter:none] [&>span:first-child]:[backdrop-filter:none]";

/* Avatar ships sm (32) / md (40) / lg (56): lg here is resized to 48px and 2xl to 80px through its root. */
const avatarBase = { sm: "sm", md: "md", lg: "md", xl: "lg", "2xl": "lg" } as const;
const avatarResize = {
  sm: "",
  md: "",
  lg: "[&>span:first-child]:size-12 [&>span:first-child]:text-sm",
  xl: "",
  "2xl": "[&>span:first-child]:size-20 [&>span:first-child]:text-2xl",
} as const;

const presenceStyle: Record<ChatPresence, string> = {
  online: "bg-sheen-success",
  away: "bg-sheen-warning",
  // Offline is a hollow ring: the three states differ by shape, not only colour.
  offline: "bg-(--sheen-surface-solid) border-2 border-sheen-fg-subtle",
};

/** Avatar diameter: "sm" 32px, "md" 40px, "lg" 48px, "xl" 56px, "2xl" 80px. */
export type ChatAvatarSize = keyof typeof avatarBox;

/** Props of {@link PresenceDot}. */
export type PresenceDotProps = {
  /** "online", "away" or "offline" (a hollow ring, so the states differ by shape too). */
  presence: ChatPresence;
  /**
   * The avatar size the dot sits on; it scales with it.
   * @default "md"
   */
  size?: ChatAvatarSize;
  /** Adds extra classes to the dot. */
  className?: string;
};

/**
 * The presence dot on an avatar. Decorative: say the presence in words next to it. Place it
 * inside a `relative` wrapper; it anchors to the bottom end corner.
 *
 * Accessibility: `aria-hidden`: the state must be written next to it. Offline is a hollow ring, and forced colors use system colours with an edge.
 *
 * @example
 * ```tsx
 * import { PresenceDot } from "@sheenui/theme";
 *
 * export const Online = () => (
 *   <span className="relative inline-block size-10 rounded-full bg-sheen-hover">
 *     <PresenceDot presence="online" />
 *   </span>
 * );
 * ```
 *
 * @see /chat/list
 */
export function PresenceDot({ presence, size = "md", className }: PresenceDotProps) {
  return (
    <span
      aria-hidden
      data-slot="presence-dot"
      data-presence={presence}
      className={cn(
        "absolute end-0 bottom-0 rounded-full ring-2 ring-(--sheen-surface-solid)",
        size === "sm" ? "size-2.5" : size === "2xl" ? "end-1 bottom-1 size-4" : size === "xl" ? "size-3.5" : "size-3",
        presenceStyle[presence],
        "forced-colors:border forced-colors:border-[CanvasText] forced-colors:ring-[Canvas]",
        presence === "online" && "forced-colors:bg-[CanvasText]",
        className,
      )}
    />
  );
}

/** Props of {@link ChatAvatar}. */
export type ChatAvatarProps = {
  /** One person (direct chat or a sender), or the group's members for a stacked group avatar. */
  people: ChatParticipant[];
  /** Group photo (wins over the stack). */
  src?: string;
  /** Group name, for its initials when there is a photo but it fails to load. */
  name?: string;
  /**
   * Diameter of the avatar: "sm" 32px, "md" 40px, "lg" 48px, "xl" 56px or "2xl" 80px.
   * @default "md"
   */
  size?: ChatAvatarSize;
  /** Show this presence dot (direct chats). */
  presence?: ChatPresence;
  /** Adds extra classes to the avatar. */
  className?: string;
};

/**
 * A person's avatar (photo or initials) with an optional presence dot, or two stacked
 * avatars for a group without a photo. Always decorative here: the name is written next to
 * it, so it is hidden from screen readers.
 *
 * Accessibility: `aria-hidden`: always shown beside the person's written name. Without a photo it shows initials on a soft accent tint over a near-opaque surface (4.5:1).
 * Glass: The circle keeps glass-1's fill and rim without its own backdrop blur, so a list of a dozen avatars costs no extra blur passes.
 *
 * @example
 * ```tsx
 * import { ChatAvatar } from "@sheenui/theme";
 *
 * export const Sender = () => <ChatAvatar people={[{ id: "u1", name: "Ada Lovelace" }]} presence="online" size="lg" />;
 * ```
 *
 * @see /chat/list
 */
export function ChatAvatar({ people, src, name, size = "md", presence, className }: ChatAvatarProps) {
  const first = people[0];
  const second = people[1];
  if (!src && first && second) {
    // Two members, overlapping corner to corner (iMessage style).
    const inner =
      size === "sm"
        ? "[&>span:first-child]:size-5 [&>span:first-child]:text-[0.5rem]"
        : size === "md"
          ? "[&>span:first-child]:size-7 [&>span:first-child]:text-2xs"
          : size === "lg"
            ? "[&>span:first-child]:size-8 [&>span:first-child]:text-xs"
            : size === "xl"
              ? "[&>span:first-child]:size-10 [&>span:first-child]:text-sm"
              : "[&>span:first-child]:size-14 [&>span:first-child]:text-base";
    return (
      <span aria-hidden className={cn("relative inline-flex shrink-0", avatarBox[size], className)}>
        <Avatar
          name={second.name}
          src={second.avatarUrl}
          size="sm"
          className={cn("absolute end-0 top-0", inner, avatarNoBlur)}
        />
        <Avatar
          name={first.name}
          src={first.avatarUrl}
          size="sm"
          className={cn(
            "absolute start-0 bottom-0 rounded-full ring-2 ring-(--sheen-surface-solid)",
            inner,
            avatarNoBlur,
          )}
        />
      </span>
    );
  }
  const person = first;
  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", avatarBox[size], className)}>
      <Avatar
        name={src ? (name ?? person?.name ?? "") : (person?.name ?? name ?? "")}
        src={src ?? person?.avatarUrl}
        size={avatarBase[size]}
        className={cn(avatarResize[size], avatarNoBlur)}
      />
      {presence && <PresenceDot presence={presence} size={size} />}
    </span>
  );
}

/* ---------- Delivery ticks ---------- */

/** Props of {@link DeliveryStatus}. */
export type DeliveryStatusProps = {
  /** "sending", "sent", "delivered", "read" or "failed". */
  status: ChatMessageStatus;
  /** The chat labels; only `status` (the spoken text per state) is used. */
  labels: Pick<ChatLabels, "status">;
  /**
   * "bubble": on the accent fill of your own bubble. "list": on glass.
   * @default "list"
   */
  variant?: "bubble" | "list";
  /**
   * Old name of `variant` (it is a visual form, not a semantic colour). Still honoured; `variant` wins.
   * @deprecated Use `variant`.
   * @default undefined
   */
  tone?: "bubble" | "list";
  /**
   * Say the state to screen readers here (off when you say it elsewhere, e.g. after the text).
   * @default true
   */
  spoken?: boolean;
  /** Adds extra classes to the icon wrapper. */
  className?: string;
};

/**
 * sending (clock) → sent (✓) → delivered (✓✓) → read (✓✓, coloured), failed (!). The state is
 * also written for screen readers, and the shapes differ, so colour is never the only cue.
 *
 * Accessibility: A hidden text ("Read") is spoken next to the icon unless `spoken` is false. Forced colors use the current text colour.
 *
 * @example
 * ```tsx
 * import { DeliveryStatus, defaultChatLabels } from "@sheenui/theme";
 *
 * export const Ticks = () => <DeliveryStatus status="read" labels={defaultChatLabels} />;
 * ```
 *
 * @see /chat/thread
 */
export function DeliveryStatus({
  status,
  labels,
  variant: variantProp,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated alias is still honoured for one release
  tone,
  spoken = true,
  className,
}: DeliveryStatusProps) {
  if (tone !== undefined) warnOnce("DeliveryStatus: `tone` is deprecated, use `variant`.");
  const variant = variantProp ?? tone ?? "list";
  const icon =
    status === "sending" ? (
      <ClockIcon className="size-3.5" />
    ) : status === "sent" ? (
      <CheckIcon className="size-3.5" />
    ) : status === "failed" ? (
      <AlertIcon className="size-3.5 shrink-0" />
    ) : (
      <CheckCheckIcon className="size-4" />
    );
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex shrink-0 items-center",
        variant === "list"
          ? status === "read"
            ? "text-sheen-accent"
            : status === "failed"
              ? "text-sheen-danger-text"
              : "text-sheen-fg-subtle"
          : status === "read"
            ? // A light teal on the violet fill: >= 3:1 as a graphic, distinct from the white ticks.
              "text-(--sheen-teal-300)"
            : "text-sheen-accent-fg",
        "forced-colors:text-current",
        className,
      )}
    >
      {icon}
      {spoken && <span className="sr-only">{labels.status[status]}</span>}
    </span>
  );
}

/* ---------- Unread badge ---------- */

/** Props of {@link UnreadBadge}. */
export type UnreadBadgeProps = {
  /** Unread messages. Zero or less renders nothing. */
  count: number;
  /** Muted chats get a quiet grey badge. */
  muted?: boolean;
  /**
   * Text shown when the count is above 99.
   * @default "99+"
   */
  overflow?: string;
  /** Sets the screen-reader text, e.g. "3 unread messages". */
  label?: string;
  /** Adds extra classes to the badge. */
  className?: string;
};

/**
 * A round count badge for unread messages. Nothing renders at zero; above 99 it shows `overflow`.
 *
 * Accessibility: The visible number is `aria-hidden` and `label` is spoken instead, so screen readers get a full sentence. Muted badges keep an edge in forced colors.
 *
 * @example
 * ```tsx
 * import { UnreadBadge } from "@sheenui/theme";
 *
 * export const Unread = () => <UnreadBadge count={3} label="3 unread messages" />;
 * ```
 *
 * @see /chat/list
 */
export function UnreadBadge({ count, muted, overflow = "99+", label, className }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      data-slot="unread-badge"
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-2xs font-semibold tabular-nums",
        muted
          ? "bg-sheen-fg-subtle text-(--sheen-surface-solid) forced-colors:border forced-colors:border-[CanvasText]"
          : "sheen-fill text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-[0_4px_12px_-6px_var(--sheen-accent-glow)]",
        className,
      )}
    >
      <span aria-hidden>{count > 99 ? overflow : count}</span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

/* ---------- Typing dots ---------- */

/**
 * Three dots in a wave. The loop pauses while it is off screen or the tab is hidden, and rests
 * under reduced motion. Takes `className` (the dots use the current text colour).
 *
 * Accessibility: Decorative (`aria-hidden`): announce who is typing in text next to it.
 * Motion: A 1.2 s wave, paused off screen and in hidden tabs; at rest under reduced motion.
 *
 * @example
 * ```tsx
 * import { TypingDots } from "@sheenui/theme";
 *
 * export const Typing = () => (
 *   <span className="text-sheen-fg-muted">
 *     <TypingDots />
 *     <span className="sr-only">Ada is typing</span>
 *   </span>
 * );
 * ```
 *
 * @see /chat/thread
 */
export function TypingDots({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // The wave is CSS, which already rests under reduced motion; it pauses off screen and in a hidden tab (`data-paused`).
  const playing = useLoopPlayback(ref, { respectReducedMotion: false });
  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="typing-dots"
      data-paused={playing ? undefined : ""}
      className={cn("inline-flex items-center gap-[3px] data-paused:*:[animation-play-state:paused]", className)}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-[5px] rounded-full bg-current opacity-60 motion-ok:animate-[sheen-chat-typing_var(--sheen-duration-loop-quick)_var(--sheen-ease-in-out)_infinite]"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

/* ---------- Small round icon button used across the chat UI ---------- */

/** Class list for the round 36 px ghost icon buttons used across the chat UI (hover tint, focus ring, press scale). */
export const chatIconButton = cn(
  "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-sheen-fg-muted",
  "transition-[color,background-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
  "hover:bg-sheen-hover hover:text-sheen-fg motion-ok:active:scale-95",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
  "touch-manipulation [-webkit-tap-highlight-color:transparent] [&_svg]:size-[1.125rem]",
  // 44px hit area on touch screens without changing the look.
  "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-11 any-pointer-coarse:after:-translate-1/2",
);

/**
 * Accessibility: Read by screen readers, hidden visually.
 *
 * @internal Text for screen readers only (the `sr-only` pattern): present in the accessibility tree, invisible on screen.
 *
 * @example
 * ```tsx
 * import { VisuallyHidden } from "./chat-parts";
 *
 * export const Count = () => (
 *   <button type="button">
 *     3<VisuallyHidden> unread messages</VisuallyHidden>
 *   </button>
 * );
 * ```
 *
 * @see /chat/list
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/** Props of {@link TypingDots}. Three dots in a wave. */
export type TypingDotsProps = ComponentProps<typeof TypingDots>;
