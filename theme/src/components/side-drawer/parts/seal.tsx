"use client";

import type { ReactNode } from "react";

import { cn } from "../../../lib/cn";
import { duration } from "../../../motion/tokens";

/** How long the success seal stays before the form finishes (ms): its fold-in plus a beat to read it. @internal */
export const SEAL_HOLD_MS = Math.round((duration.slow + duration.slower) * 1000);
/** The same with reduced motion: nothing folds, so the seal is only held long enough to read. @internal */
export const SEAL_HOLD_REDUCED_MS = Math.round(duration.slower * 1000);

/** Whether movement is switched off (the OS setting or the in-app toggle). @internal */
export function motionIsReduced(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.dataset.motion === "reduced" ||
    (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

/**
 * The success seal of a `SideDrawerForm` with `successSeal`: a layer over the form where a check in a green-lit
 * disc folds in from the Save button's corner of the panel, with one soft pulse. Decorative (`aria-hidden`; the
 * form's status region says "Saved"). Only the layer's own transform and opacity move, so nothing glass fades.
 * @internal
 */
export function SuccessSeal({ label }: { label: ReactNode }) {
  return (
    <div
      aria-hidden
      data-slot="side-drawer-seal"
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 rounded-[inherit]",
        "animate-[sheen-fade-in_var(--sheen-duration-base)_var(--sheen-ease-out)_backwards]",
      )}
    >
      {/* The scrim layer dims the form behind the seal, so the glass inputs never sit under a faded wrapper. */}
      <span className="absolute inset-0 -z-10 rounded-[inherit] bg-sheen-surface/85" />
      <span
        className={cn(
          "relative grid size-28 place-items-center rounded-full text-sheen-success-text",
          "bg-sheen-surface ring-2 ring-sheen-success-text/40 [box-shadow:0_0_64px_14px_var(--sheen-success-glow)]",
          "motion-ok:animate-[sheen-seal-in_var(--sheen-duration-snappy)_var(--sheen-ease-snappy)_backwards]",
          "forced-colors:ring-[CanvasText]",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full border-2 border-sheen-success-text/50 opacity-0 forced-colors:hidden",
            "motion-ok:animate-[sheen-halo_var(--sheen-duration-slower)_var(--sheen-ease-out)_var(--sheen-duration-base)_1_both]",
          )}
        />
        <svg
          viewBox="0 0 24 24"
          className="size-14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="m6 12.5 4 4 8-9"
            pathLength={1}
            strokeDasharray={1}
            className="motion-ok:animate-[sheen-seal-draw_var(--sheen-duration-slow)_var(--sheen-ease-out)_var(--sheen-duration-base)_backwards]"
          />
        </svg>
      </span>
      <span className="rounded-full bg-sheen-surface px-4 py-1.5 text-base font-semibold text-sheen-success-text shadow-[0_0_0_1px_var(--sheen-glass-edge)]">
        {label}
      </span>
    </div>
  );
}
