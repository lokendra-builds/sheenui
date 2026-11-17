"use client";

import type { ComponentProps } from "react";

import { cn } from "../../lib/cn";

/** Translatable text of {@link Spinner}. */
export type SpinnerLabels = {
  /** What a screen reader says (and what `showLabel` prints). */
  loading: string;
};

/** The English {@link SpinnerLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultSpinnerLabels: SpinnerLabels = { loading: "Loading" };

const sizes = {
  xs: { icon: "size-3", text: "text-xs" },
  sm: { icon: "size-4", text: "text-sm" },
  md: { icon: "size-6", text: "text-sm" },
  lg: { icon: "size-8", text: "text-base" },
  xl: { icon: "size-12", text: "text-base" },
} as const;

const tones = {
  current: "",
  accent: "text-sheen-accent",
  muted: "text-sheen-fg-muted",
} as const;

/** Props of {@link Spinner}. The attributes of a `span` plus the ones below. */
export type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  /** "xs" (12px), "sm" (16px), "md" (24px), "lg" (32px) or "xl" (48px). Default "md". */
  size?: keyof typeof sizes;
  /** "current" follows the surrounding text colour, "accent" or "muted". Default "accent". */
  tone?: keyof typeof tones;
  /** Print the label next to the spinner instead of hiding it from sight. Default false. */
  showLabel?: boolean;
  /** Every string, for translation. */
  labels?: Partial<SpinnerLabels>;
};

/**
 * Accessibility: Decorative (`aria-hidden`): the control that shows it carries the busy state (`aria-busy`, a status text).
 *
 * @internal The spinning arc on its track, without the status role or the label: the one glyph behind `Spinner` and every
 * inline loading state (Button, Select, Combobox, Command, Toaster). Sized with `className` (for example `size-4`); it
 * inherits `currentColor`, turns with `.sheen-spinner` (a static arc under reduced motion) and uses `CanvasText` in forced colours.
 *
 * @example
 * ```tsx
 * import { SpinnerIcon } from "../spinner/spinner";
 *
 * export function Example() {
 *   return <SpinnerIcon className="size-4 text-sheen-fg-muted" />;
 * }
 * ```
 *
 * @see /components/spinner
 */
export function SpinnerIcon({ className, strokeWidth = 3, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("sheen-spinner shrink-0 forced-colors:text-[CanvasText]", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth={strokeWidth} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A loading spinner for something that has no known length (a button, a panel, a route). For a task with
 * progress use `Progress`; for the shape of content that is coming use `Skeleton`.
 *
 * - `size` is "xs" to "xl", `tone` picks the colour, `labels.loading` is the text a screen reader hears
 *   (`showLabel` prints it too).
 * - It is a `role="status"` live region, so mounting it announces "Loading" politely; remove it when the work is done.
 * - Put it next to the content it replaces, or inside a button that has `aria-busy`.
 *
 * Keyboard: not focusable. Accessibility: `role="status"` with a visually hidden label; the ring itself is decorative; the
 * track keeps 3:1 against the surface and forced colors draw it in `CanvasText`.
 * Glass and motion: no surface. The arc turns once a second (`.sheen-spinner`, rotation is a transform); reduced motion
 * stops it: a static arc on its track, with the same "Loading" label. `SheenMotionProvider` (which calls `useOffscreenLoops()`) pauses it while it is off-screen.
 *
 * @example
 * ```tsx
 * import { Spinner } from "@sheenui/theme";
 *
 * export function Example() {
 *   return <Spinner size="lg" showLabel labels={{ loading: "Loading your projects" }} />;
 * }
 * ```
 *
 * @see /components/spinner
 */
export function Spinner({
  size = "md",
  tone = "accent",
  showLabel = false,
  labels: labelsProp,
  className,
  ...props
}: SpinnerProps) {
  const labels = { ...defaultSpinnerLabels, ...labelsProp };
  const s = sizes[size];
  return (
    <span
      role="status"
      data-slot="spinner"
      className={cn("inline-flex items-center gap-2", tones[tone], className)}
      {...props}
    >
      <SpinnerIcon className={s.icon} />
      <span className={showLabel ? cn("font-medium text-sheen-fg", s.text) : "sr-only"}>{labels.loading}</span>
    </span>
  );
}
