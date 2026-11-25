"use client";

import { type KeyboardEvent } from "react";
import { motion, type MotionValue } from "motion/react";

import { cn } from "../../../lib/cn";
import { spring } from "../../../motion/tokens";
import { Button } from "../../button/button";
import { LeftIcon, RightIcon } from "./model";

/* ---------- Controls ---------- */

/** The previous or next arrow button. @internal */
export function ArrowButton({
  side,
  overlay,
  rtl,
  disabled,
  onClick,
  onKeyDown,
  label,
}: {
  side: "prev" | "next";
  overlay?: boolean;
  rtl: boolean;
  disabled: boolean;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  label: string;
}) {
  // "Previous" points towards the start edge: left in LTR, right in RTL.
  const pointsLeft = (side === "prev") !== rtl;
  const button = (
    <Button
      variant="glass"
      size="icon"
      aria-label={label}
      // aria-disabled (not disabled) so focus never drops to <body> at the ends.
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onClick()}
      onKeyDown={onKeyDown}
      className={cn(
        "rounded-sheen-full aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
        !overlay && "size-9",
        // Over slide art: a page-coloured veil under the icon keeps it legible on any image,
        // and the focus outline gets a page-coloured halo on both sides (two-tone ring).
        overlay && "focus-visible:shadow-[var(--sheen-glass-rim),0_0_0_6px_var(--sheen-bg)]",
      )}
    >
      {overlay && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-bg/55 forced-colors:hidden"
        />
      )}
      {pointsLeft ? <LeftIcon /> : <RightIcon />}
    </Button>
  );
  if (!overlay) return button;
  // Centred by a plain wrapper, so the button's own hover lift (translate) can't fight it.
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 flex items-center [&>*]:pointer-events-auto",
        side === "prev" ? "start-3" : "end-3",
      )}
    >
      {button}
    </div>
  );
}

/** The pagination dots, one per snap position. @internal */
export function Dots({
  count,
  active,
  onSelect,
  progress,
  showProgress,
  coarse,
  reduced,
  rtl,
  names,
  label,
}: {
  count: number;
  active: number;
  onSelect: (i: number) => void;
  progress: MotionValue<number>;
  showProgress: boolean;
  coarse: boolean;
  reduced: boolean;
  rtl: boolean;
  names: string[];
  label: string;
}) {
  const size = coarse ? 44 : 24;
  return (
    <div role="group" aria-label={label} className="relative flex items-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          data-carousel-dot=""
          aria-label={names[i]}
          aria-current={i === active ? "true" : undefined}
          // Roving: only the active dot is in the tab order; arrow keys move between positions.
          tabIndex={i === active ? 0 : -1}
          onClick={() => onSelect(i)}
          style={{ width: size, height: size }}
          className={cn(
            "group/dot relative grid shrink-0 place-items-center rounded-sheen-full",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
            "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              // control-border: >= 3:1 against the page and glass in both themes (WCAG 1.4.11).
              "size-2 rounded-full bg-sheen-control-border group-hover/dot:bg-sheen-fg-muted",
              "motion-ok:transition-colors motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
              i === active && "bg-transparent group-hover/dot:bg-transparent",
              "forced-colors:bg-[GrayText]",
            )}
          />
        </button>
      ))}
      {/*
        The active pill slides between dots (transform) and fills up while autoplay counts down.
        Its accent outline keeps it >= 3:1 even while it is still empty.
      */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: (rtl ? -1 : 1) * (active * size + size / 2 - 12) }}
        transition={reduced ? { duration: 0 } : spring.snappy}
        className="pointer-events-none absolute start-0 top-1/2 h-2 w-6 -translate-y-1/2 overflow-hidden rounded-full bg-sheen-accent-soft shadow-[inset_0_0_0_1.5px_var(--sheen-accent)] forced-colors:bg-[Highlight]"
      >
        <motion.span
          className="sheen-fill absolute inset-0 rounded-full [background-image:var(--sheen-accent-fill)]"
          style={{ scaleX: showProgress ? progress : 1, originX: rtl ? 1 : 0 }}
        />
      </motion.span>
    </div>
  );
}
