"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate } from "motion/react";

import { cn } from "./cn";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { spring } from "../motion/tokens";

/** Per open popup: which pill is showing, so the next one can glide from it (never across popups). */
type HighlightTracker = {
  /** The pill that is shown, or was shown last. */
  current: HTMLElement | null;
  /** When `current` was hidden; 0 while it is shown. */
  hiddenAt: number;
};

const HighlightContext = createContext<HighlightTracker | null>(null);

/** A pill hidden longer ago than this (the pointer left the menu) isn't glided from. */
const GLIDE_WINDOW_MS = 120;

/**
 * Makes `el` the pill that is shown. Returns where the previous pill is on screen right now
 * (mid-glide included) if it just left, and whether keyboard focus moved it. The tracker is shared,
 * mutable state by design (one per open popup), so the writes live here, outside the component.
 */
function claimHighlight(tracker: HighlightTracker, el: HTMLElement) {
  const prev = tracker.current;
  let from: DOMRect | null = null;
  let viaKeyboard = false;
  if (prev && prev !== el) {
    if (prev.isConnected && tracker.hiddenAt > 0 && performance.now() - tracker.hiddenAt < GLIDE_WINDOW_MS) {
      from = prev.getBoundingClientRect();
      viaKeyboard = prev.parentElement?.matches(":focus-visible") ?? false;
    }
    prev.style.transform = "";
  }
  tracker.current = el;
  tracker.hiddenAt = 0;
  el.style.transform = "";
  return { from, viaKeyboard };
}

/** Notes when the shown pill `el` was hidden, so the next pill can glide from it (see `claimHighlight`). */
function releaseHighlight(tracker: HighlightTracker, el: HTMLElement) {
  if (tracker.current === el) tracker.hiddenAt = performance.now();
}

/** Props of `MenuHighlight`; each option is documented on its field. */
export type MenuHighlightProps = {
  /** Show the pill (pass the item's `highlighted` state). */
  active: boolean;
  /** "danger" tints it red, for destructive items. Default "neutral". */
  tone?: "neutral" | "danger";
  /** Adds extra classes to the pill. */
  className?: string;
};

/**
 * The highlight pill. Every item renders one; only the highlighted item's is visible, and it
 * glides in from wherever the previous pill was on screen. Use it as the first child of your
 * own items built on Base UI Menu parts, inside a MenuContent.
 *
 * The glide is worked out in screen space and re-read every frame, so it stays smooth when
 * the menu scrolls to reveal the next item (a shared-layout animation measures the start
 * and end at different scroll offsets there, and jumps).
 *
 * Keyboard: none, it is decorative. Accessibility: `aria-hidden`; hidden in forced colors, where the item itself
 * switches to `Highlight`. Glass and motion: transform and opacity only; reduced motion makes it jump.
 *
 * Wrap the list of items in `GlideHighlightScope` (the `MenuContent` of this library already does): without it the pill
 * still lights the highlighted item but does not glide from the previous one.
 *
 * @example
 * ```tsx
 * import { Menu as BaseMenu } from "@base-ui/react/menu";
 * import { GlideHighlightScope, MenuHighlight } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BaseMenu.Root>
 *       <BaseMenu.Trigger>Actions</BaseMenu.Trigger>
 *       <BaseMenu.Portal>
 *         <BaseMenu.Positioner>
 *           <BaseMenu.Popup>
 *             <GlideHighlightScope>
 *               <BaseMenu.Item render={(props, state) => (
 *                 <div {...props}><MenuHighlight active={state.highlighted} />{props.children}</div>
 *               )}>Rename</BaseMenu.Item>
 *             </GlideHighlightScope>
 *           </BaseMenu.Popup>
 *         </BaseMenu.Positioner>
 *       </BaseMenu.Portal>
 *     </BaseMenu.Root>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function MenuHighlight({ active, tone = "neutral", className }: MenuHighlightProps) {
  const tracker = useContext(HighlightContext);
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const item = el?.parentElement;
    if (!active || !el || !item || !tracker) return;

    const { from, viaKeyboard } = claimHighlight(tracker, el);

    let stop: (() => void) | undefined;
    if (from && from.height > 0 && !reduced) {
      // Base UI scrolls a keyboard-highlighted item into view a frame later; do it now, so the
      // glide starts from what was on screen and ends where the item will stay.
      if (viaKeyboard) item.scrollIntoView({ block: "nearest", inline: "nearest" });
      const start = from;
      const place = (progress: number) => {
        const to = item.getBoundingClientRect();
        if (to.height === 0) return;
        const top = start.top + (to.top - start.top) * progress;
        const height = start.height + (to.height - start.height) * progress;
        el.style.transform = `translateY(${top - to.top}px) scaleY(${height / to.height})`;
      };
      place(0);
      const controls = animate(0, 1, {
        ...spring.snappy,
        onUpdate: place,
        onComplete: () => {
          el.style.transform = "";
        },
      });
      stop = () => controls.stop();
    }

    return () => {
      // Leave any mid-glide transform in place: the next pill reads it as its start.
      stop?.();
      releaseHighlight(tracker, el);
    };
  }, [active, reduced, tracker]);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="menu-highlight"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 origin-top rounded-sheen-sm",
        active ? "opacity-100" : "opacity-0",
        tone === "danger" ? "bg-sheen-danger-soft" : "bg-sheen-hover",
        // Keyboard focus: a solid ring that travels with the pill (the tint alone is too faint).
        "[:focus-visible>&]:shadow-[inset_0_0_0_2px_var(--sheen-focus)]",
        // High contrast drops the tint: the item itself switches to Highlight (see itemBase).
        "forced-colors:hidden",
        className,
      )}
    />
  );
}

/**
 * Gives every `MenuHighlight` pill inside it one shared tracker, so the pill glides between items of the same
 * popup (Menu, Select, Combobox) and never in from another popup. `MenuContent` wraps its children in it; use it
 * around the list of your own Base UI popup.
 *
 * Keyboard: none. Accessibility: renders no element. Glass and motion: see `MenuHighlight`.
 *
 * @example
 * ```tsx
 * import { Select as BaseSelect } from "@base-ui/react/select";
 * import { GlideHighlightScope } from "@sheenui/theme";
 *
 * export function Example({ children }: { children: React.ReactNode }) {
 *   return (
 *     <BaseSelect.Popup><GlideHighlightScope>{children}</GlideHighlightScope></BaseSelect.Popup>
 *   );
 * }
 * ```
 *
 * @see /overlays/dropdown-menu
 */
export function GlideHighlightScope({ children }: { children: ReactNode }) {
  const [tracker] = useState<HighlightTracker>(() => ({ current: null, hiddenAt: 0 }));
  return <HighlightContext value={tracker}>{children}</HighlightContext>;
}
