"use client";

import type { ComponentProps } from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";

import { cn } from "../../lib/cn";
import { initials } from "../../lib/initials";

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const;

/** Intrinsic pixel size per `size`, written on the `<img>` so the browser reserves the box before the image loads. */
const pixels = { sm: 32, md: 40, lg: 56 } as const;

/** Offline is a hollow ring, so the three states differ by shape too, not only colour. */
const statusStyle = {
  online: "bg-sheen-success",
  away: "bg-sheen-warning",
  offline: "bg-[var(--sheen-bg)] border-2 border-sheen-fg-subtle",
} as const;

/** Props of {@link Avatar}. */
export type AvatarProps = {
  /** Full name: used for alt text and the initials fallback. */
  name: string;
  /** Image URL. While it loads (or if it fails) the initials show instead. */
  src?: string;
  /**
   * Sets the diameter: "sm" 32px, "md" 40px, "lg" 56px.
   * @default "md"
   */
  size?: keyof typeof sizes;
  /** Presence dot at the bottom-right corner: online, away or offline (a hollow ring). Hidden when omitted. */
  status?: keyof typeof statusStyle;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A round profile picture with an initials fallback and an optional presence dot. Use it for
 * people in lists, comments, headers and {@link AvatarGroup} stacks.
 *
 * Keyboard: Not interactive: it takes no focus. Wrap it in a button or link when it should be clickable.
 * Accessibility: The image has `alt` set to `name`; the initials fallback is `role="img"` with the full name as its label, and the presence dot is its own labelled image ("online", "away", "offline"). Offline is a hollow ring, so the states differ by shape, not only colour. Forced colors use system colours with an edge.
 * Glass: A single `glass-1` surface behind the image or initials.
 *
 * @example
 * ```tsx
 * import { Avatar } from "@sheenui/theme";
 *
 * export const Me = () => <Avatar name="Ada Lovelace" src="/ada.jpg" size="lg" status="online" />;
 * ```
 *
 * @see /components/avatar
 */
export function Avatar({ name, src, size = "md", status, className }: AvatarProps) {
  return (
    <span data-slot="avatar" className={cn("relative inline-flex shrink-0", className)}>
      <BaseAvatar.Root
        data-slot="avatar-image"
        className={cn(
          "glass-1 inline-flex items-center justify-center overflow-hidden rounded-full font-semibold select-none",
          sizes[size],
        )}
      >
        {src && (
          <BaseAvatar.Image
            src={src}
            alt={name}
            width={pixels[size]}
            height={pixels[size]}
            className="size-full object-cover"
          />
        )}
        <BaseAvatar.Fallback
          delay={src ? 400 : 0}
          // Accent initials on a soft accent tint over a near-opaque surface: >= 4.5:1 on any backdrop.
          className="flex size-full items-center justify-center bg-sheen-surface/85 [background-image:linear-gradient(var(--sheen-accent-soft),var(--sheen-accent-soft))] text-sheen-accent"
          aria-label={name}
          role="img"
        >
          <span aria-hidden>{initials(name)}</span>
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
      {status && (
        <span
          data-slot="avatar-status"
          role="img"
          aria-label={status}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
          className={cn(
            "absolute end-0 bottom-0 size-2.5 rounded-full ring-2 ring-[var(--sheen-bg)]",
            statusStyle[status],
            size === "lg" && "size-3.5",
            // High contrast: system colours, with an edge so the dot never disappears.
            "forced-colors:border forced-colors:border-[CanvasText] forced-colors:ring-[Canvas]",
            status === "online" && "forced-colors:bg-[CanvasText]",
          )}
        />
      )}
    </span>
  );
}

/**
 * Overlapping stack of avatars, e.g. "people in this project". Takes the attributes of a `div`;
 * children are {@link Avatar}s, each ringed in the page background so the overlap reads cleanly.
 *
 * Accessibility: Plain group; add an `aria-label` that says who the people are. Each avatar keeps its own name.
 *
 * @example
 * ```tsx
 * import { Avatar, AvatarGroup } from "@sheenui/theme";
 *
 * export const Team = () => (
 *   <AvatarGroup aria-label="Project members">
 *     <Avatar name="Ada Lovelace" />
 *     <Avatar name="Alan Turing" />
 *   </AvatarGroup>
 * );
 * ```
 *
 * @see /components/avatar
 */
export function AvatarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex items-center -space-x-2.5 [&>*]:ring-2 [&>*]:ring-[var(--sheen-bg)] [&>*]:rounded-full",
        className,
      )}
      {...props}
    />
  );
}

/** Props of {@link AvatarGroup}. Overlapping stack of avatars, e.g. */
export type AvatarGroupProps = ComponentProps<typeof AvatarGroup>;
