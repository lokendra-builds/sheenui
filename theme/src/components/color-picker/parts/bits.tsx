"use client";

import { type ReactNode } from "react";

import { cn } from "../../../lib/cn";
import { type RGBA } from "../color-utils";

/* ---------- bits ---------- */

/** Formats a colour as a CSS `rgb(r g b / a)` string, keeping its alpha. @internal */
export function hexWithAlpha(c: RGBA) {
  return `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`;
}

/** A small icon button used in the picker toolbar. @internal */
export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex size-8 items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
        "transition-[background-color,color,scale] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover hover:text-sheen-fg motion-ok:active:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
        "any-pointer-coarse:size-11 disabled:opacity-55",
      )}
    >
      {children}
    </button>
  );
}

/** The shared SVG stroke attributes of the picker icons. @internal */
export const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** The eyedropper icon. @internal */
export function EyedropperIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="m14.5 6.5 3 3M19.3 4.7a2.4 2.4 0 0 0-3.4 0l-2.6 2.6 3.4 3.4 2.6-2.6a2.4 2.4 0 0 0 0-3.4z" />
      <path d="M13.3 7.3 5 15.6V19h3.4l8.3-8.3" />
    </svg>
  );
}
