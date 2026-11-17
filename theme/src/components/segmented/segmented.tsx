"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { groupBlur, useFocusProxyRef, useMergedRef, type FormControlProps } from "../../lib/form";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { spring } from "../../motion/tokens";

/** One segment of a `SegmentedControl`: its value, label and optional icon. */
export type SegmentedControlItem = {
  /** The value this segment stands for. */
  value: string;
  /** What the segment shows. */
  label: ReactNode;
  /** An icon before the label (decorative; the label names the segment). */
  icon?: ReactNode;
  /** Not selectable. */
  disabled?: boolean;
  /** Accessible name when the label is not plain text (or hidden with `iconOnly`). */
  "aria-label"?: string;
};

const sizes = {
  // The track adds 8px of padding: segment + 8 = the shared control height.
  sm: "h-[calc(var(--sheen-control-h-sm)-0.5rem)] gap-1.5 px-3 text-xs [&_svg]:size-3.5",
  md: "h-[calc(var(--sheen-control-h-md)-0.5rem)] gap-1.5 px-3.5 text-sm [&_svg]:size-4",
  lg: "h-[calc(var(--sheen-control-h-lg)-0.5rem)] gap-2 px-4.5 text-base [&_svg]:size-[1.125rem]",
} as const;

/** Adaptive steps when space runs out (set on the track as data-fit by the fitting effect). */
const tightSizes = {
  sm: "group-data-[fit=tight]/segmented:px-1.5",
  md: "group-data-[fit=tight]/segmented:px-2",
  lg: "group-data-[fit=tight]/segmented:px-3",
} as const;

const collapsedSizes = {
  sm: "group-data-[fit=icons]/segmented:w-[calc(var(--sheen-control-h-sm)-0.5rem)] group-data-[fit=icons]/segmented:px-0",
  md: "group-data-[fit=icons]/segmented:w-[calc(var(--sheen-control-h-md)-0.5rem)] group-data-[fit=icons]/segmented:px-0",
  lg: "group-data-[fit=icons]/segmented:w-[calc(var(--sheen-control-h-lg)-0.5rem)] group-data-[fit=icons]/segmented:px-0",
} as const;

const iconOnlySizes = {
  sm: "size-[calc(var(--sheen-control-h-sm)-0.5rem)] [&_svg]:size-3.5",
  md: "size-[calc(var(--sheen-control-h-md)-0.5rem)] [&_svg]:size-4",
  lg: "size-[calc(var(--sheen-control-h-lg)-0.5rem)] [&_svg]:size-[1.125rem]",
} as const;

/** Props of `SegmentedControl`; each option is documented on its field. */
export type SegmentedControlProps = Omit<FormControlProps<HTMLDivElement>, "required"> & {
  /** The segments to show, in order. */
  items: SegmentedControlItem[];
  /** Sets the chosen value when controlled. */
  value?: string;
  /** Sets the starting value when uncontrolled. Defaults to the first enabled item. */
  defaultValue?: string;
  /** Called with the new value when a different segment is chosen. */
  onValueChange?: (value: string) => void;
  /** Height and text size: "sm" (28px), "md" (32px, default) or "lg" (40px). */
  size?: keyof typeof sizes;
  /** Stretch to the container's width; segments share it equally. Default false. */
  fullWidth?: boolean;
  /** Show only the icons. Each item's label (or aria-label) becomes its accessible name and tooltip. Default false. */
  iconOnly?: boolean;
  /**
   * When the container is too narrow: tighten the padding, then (if every segment has an icon)
   * show icons only, then truncate labels. Off: labels truncate straight away. Default true.
   */
  adaptive?: boolean;
  /** Disables every segment of the control. */
  disabled?: boolean;
  /** Submits the chosen value with a form (a hidden input). */
  name?: string;
  /** Name of the control for screen readers, when no visible label points at it. */
  "aria-label"?: string;
  /** Id of an element that names the control. */
  "aria-labelledby"?: string;
  /** Adds extra classes to the glass track. */
  className?: string;
};

/** Plain text of a label, for accessible names. */
function textOf(node: ReactNode): string | undefined {
  return typeof node === "string" || typeof node === "number" ? String(node) : undefined;
}

type Fit = "full" | "tight" | "icons";

/**
 * Picks the roomiest fit in which no label is cut off. Synchronous DOM reads and writes (no
 * React state), so trying a step never paints. Labels' natural widths are read once, with
 * shrinking switched off, then compared with their widths in each step.
 */
function fitSegments(root: HTMLElement, canCollapse: boolean) {
  const labels = [...root.querySelectorAll<HTMLElement>("[data-slot=segmented-control-label]")];
  const widths = () => labels.map((label) => label.getBoundingClientRect().width);

  root.dataset.fit = "full";
  for (const label of labels) label.style.minWidth = "max-content";
  const natural = widths();
  for (const label of labels) label.style.minWidth = "";

  const cut = () => widths().map((width, i) => (natural[i] ?? 0) - width > 0.25);
  let truncated = cut();
  let fit: Fit = "full";
  if (truncated.some(Boolean)) {
    fit = "tight";
    root.dataset.fit = fit;
    truncated = cut();
    if (truncated.some(Boolean) && canCollapse) {
      fit = "icons";
      root.dataset.fit = fit;
    }
  }

  // Labels that can't be read in full become the segment's tooltip.
  labels.forEach((label, i) => {
    const item = label.closest<HTMLElement>("[data-slot=segmented-control-item]");
    if (!item || (item.title && !item.hasAttribute("data-fit-title"))) return;
    if (fit === "icons" || (fit === "tight" && truncated[i])) {
      item.title = label.textContent;
      item.setAttribute("data-fit-title", "");
    } else if (item.hasAttribute("data-fit-title")) {
      item.removeAttribute("title");
      item.removeAttribute("data-fit-title");
    }
  });
}

/**
 * Segmented control: pick one of a few views or modes (Day / Week / Month, List / Grid). Use `Tabs` when the choice
 * swaps a panel of content, and `RadioGroup` for a form answer with longer labels.
 *
 * A Base UI ToggleGroup with one pressed item. A glass pill slides to the chosen segment through Motion's shared layout
 * (transform only, with the corner radius corrected while it stretches); with reduced motion it jumps. It never ends up empty:
 * pressing the chosen segment again keeps it chosen.
 *
 * - `items` are `{ value, label, icon?, disabled?, "aria-label"? }`; controlled with `value` + `onValueChange`, or uncontrolled
 *   with `defaultValue`; `name` submits the value with a form.
 * - `size` is "sm", "md" or "lg"; `fullWidth` shares the row equally; `iconOnly` shows icons only (labels become names and tooltips).
 * - It never widens the page. When its container gets too narrow (`adaptive`, on by default) it adapts, in steps: tighter padding
 *   first; then, if every segment has an icon, icons only (the labels stay as accessible names and become tooltips); only then do labels
 *   truncate. Like any shrinkable content, it needs a width-constrained parent: in a flex row or column that sizes to its content, give the
 *   parent `min-w-0` (and `w-full`).
 *
 * Keyboard: Tab enters the control once, on the chosen segment; ← → (↑ ↓) move between segments, Home / End jump to the ends, Enter or
 * Space picks the focused segment.
 * Accessibility: a group of toggle buttons with `aria-pressed`; name the group with `aria-label` or `aria-labelledby`; segments are 44px
 * tall on touch screens; in forced colors the chosen segment is outlined and underlined (the pill's fill is dropped).
 * Glass and motion: one `glass-1` track. The pill slides with `spring.snappy` using transform only; reduced motion: it jumps.
 *
 * @example
 * ```tsx
 * import { SegmentedControl } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SegmentedControl
 *       aria-label="Range"
 *       defaultValue="week"
 *       items={[
 *         { value: "day", label: "Day" },
 *         { value: "week", label: "Week" },
 *         { value: "month", label: "Month" },
 *       ]}
 *       onValueChange={(range) => console.log(range)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /forms/segmented-control
 */
export function SegmentedControl({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  fullWidth = false,
  iconOnly = false,
  adaptive = true,
  disabled = false,
  name,
  className,
  ref,
  onBlur,
  ...aria
}: SegmentedControlProps) {
  const reduced = useSheenReducedMotion();
  const pillId = useId();
  const [inner, setInner] = useState<string | undefined>(defaultValue ?? items.find((i) => !i.disabled)?.value);
  const current = value ?? inner;
  const rootRef = useRef<HTMLDivElement>(null);
  const focusRef = useFocusProxyRef(ref, "[aria-pressed='true']:not(:disabled)", "button:not(:disabled)");
  const mergedRootRef = useMergedRef(rootRef, focusRef);
  const fitting = adaptive && !iconOnly;
  const canCollapse = items.every((item) => item.icon != null);
  // Re-fit when what the segments show changes.
  const contentKey = `${size} ${fullWidth} ${items.map((item) => `${item.value}:${textOf(item.label) ?? ""}`).join("|")}`;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!fitting) {
      delete root.dataset.fit;
      return;
    }
    fitSegments(root, canCollapse);
  }, [fitting, canCollapse, contentKey]);

  // Re-fit when the room changes (container or font). Measured on the next frame, outside the
  // observer callback, so a size change caused by the new fit can't loop back into it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !fitting) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitSegments(root, canCollapse));
    };
    // Only a change of WIDTH can change the fit. A height-only change (a panel mounting below it, a wrapped heading next to it)
    // used to re-measure for nothing: several forced layouts in one frame, felt while scrolling a dashboard.
    const widths = new Map<Element, number>();
    const observer = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (widths.get(entry.target) !== width) {
          widths.set(entry.target, width);
          changed = true;
        }
      }
      if (changed) schedule();
    });
    observer.observe(root);
    if (root.parentElement) observer.observe(root.parentElement);
    let alive = true;
    // `document.fonts` is missing in some embedded webviews, whatever the DOM types say.
    const fonts = document.fonts as FontFaceSet | undefined;
    void fonts?.ready.then(() => alive && schedule());
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fitting, canCollapse]);

  return (
    <ToggleGroup
      ref={mergedRootRef}
      onBlur={groupBlur(onBlur)}
      data-slot="segmented-control"
      value={current === undefined ? [] : [current]}
      onValueChange={(next) => {
        // Single choice that can't be cleared: ignore "unpress the current segment".
        const picked = next[0];
        if (picked === undefined || picked === current) return;
        setInner(picked);
        onValueChange?.(picked);
      }}
      disabled={disabled}
      // Tabbing in lands on the chosen segment (like a radio group), not on the first one.
      // Keyboard focus only: a click on another segment must keep its focus.
      onFocus={(event) => {
        const group = event.currentTarget;
        if (group.contains(event.relatedTarget)) return;
        const target = event.target as HTMLElement;
        if (!target.matches(":focus-visible")) return;
        const chosen = group.querySelector<HTMLElement>("[aria-pressed='true']:not(:disabled)");
        if (chosen && chosen !== target) chosen.focus();
      }}
      {...aria}
      className={cn(
        "glass-1 group/segmented relative max-w-full min-w-0 items-center gap-0.5 rounded-sheen-full p-1",
        fullWidth ? "flex w-full" : "inline-flex w-fit",
        "data-disabled:opacity-55",
        className,
      )}
    >
      {items.map((item) => {
        const pressed = item.value === current;
        const text = item["aria-label"] ?? textOf(item.label);
        return (
          <Toggle
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            aria-label={iconOnly ? text : item["aria-label"]}
            title={iconOnly ? text : undefined}
            data-slot="segmented-control-item"
            className={cn(
              // isolate: the pill (z -10) sits behind the label but inside this segment.
              "relative isolate inline-flex min-w-0 shrink cursor-pointer items-center justify-center rounded-sheen-full font-medium whitespace-nowrap select-none",
              "touch-manipulation [-webkit-tap-highlight-color:transparent]",
              "text-sheen-fg-muted transition-[color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
              "hover:text-sheen-fg data-pressed:text-sheen-fg",
              iconOnly ? iconOnlySizes[size] : [sizes[size], tightSizes[size], collapsedSizes[size]],
              // Equal, centred segments (sized by their label on phones, so a long label never truncates next to a short one).
              fullWidth && "flex-1 basis-0 px-1.5 group-data-[fit=tight]/segmented:px-1 max-sm:basis-auto",
              "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
              "motion-ok:active:not-data-disabled:scale-[0.96]",
              "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:text-sheen-fg-muted",
              // 44px touch target: the track grows with it.
              "any-pointer-coarse:min-h-11",
              "any-pointer-coarse:min-w-11",
              // High contrast: the chosen segment is outlined and underlined (the pill's fill is dropped).
              "forced-colors:data-pressed:underline forced-colors:data-pressed:decoration-2 forced-colors:data-pressed:underline-offset-4",
            )}
          >
            {pressed && (
              <motion.span
                aria-hidden
                layoutId={pillId}
                transition={reduced ? { duration: 0 } : spring.snappy}
                // Radius via style, so Motion keeps the ends round while the pill stretches.
                style={{ borderRadius: 9999 }}
                data-slot="segmented-control-pill"
                className={cn(
                  "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
                  // Near-white in light, a lifted ~15% white in dark: the indicator token, as the Tabs pill uses.
                  // (The glass highlight is a rim colour, 34% white in Liquid dark: the chosen label measured 4.4:1 on it.)
                  "bg-sheen-indicator [background-image:var(--sheen-glass-specular)]",
                  "shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_0_0_1px_var(--sheen-glass-edge),0_1px_2px_var(--sheen-shadow-near),0_4px_12px_-6px_var(--sheen-shadow-far)]",
                  "forced-colors:border-2 forced-colors:border-[Highlight]",
                )}
              />
            )}
            {item.icon && (
              <span aria-hidden className="flex shrink-0">
                {item.icon}
              </span>
            )}
            {!iconOnly && (
              <span
                data-slot="segmented-control-label"
                className="min-w-0 truncate group-data-[fit=icons]/segmented:sr-only"
              >
                {item.label}
              </span>
            )}
          </Toggle>
        );
      })}
      {name && <input type="hidden" name={name} value={current ?? ""} disabled={disabled} />}
    </ToggleGroup>
  );
}
