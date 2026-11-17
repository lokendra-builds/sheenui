"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

import { cn, classNameWith } from "../../lib/cn";
import { joinIds } from "../../lib/form";
import { FieldControlShell } from "../../lib/field-control-shell";

/** The state Base UI hands to `controlClassName` and style callbacks (`checked`, `indeterminate`, `disabled`, `readOnly`, `required`, `valid`, ...). */
export type CheckboxRootState = BaseCheckbox.Root.State;

/** Props of {@link Checkbox}: everything Base UI's `Checkbox.Root` takes (`checked`, `defaultChecked`, `onCheckedChange`, `indeterminate`, `disabled`, `readOnly`, `required`, `name`, `value`) plus the ones below. */
export type CheckboxProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, "className"> & {
  /** Classes for the outer element: the `<label>` (or the wrapper holding an `error`); the control itself when there is neither. */
  className?: string;
  /** Classes for the checkbox box itself. Base UI's state function form works here. */
  controlClassName?: ComponentProps<typeof BaseCheckbox.Root>["className"];
  /** Text next to the box. Clicking it toggles the checkbox. Without a label, give the checkbox an `aria-label`. */
  label?: ReactNode;
  /** Secondary line under the label. It sits inside the same `<label>`, so screen readers read it with the label. */
  description?: ReactNode;
  /** Error message under the control. Marks it invalid (`aria-invalid`, danger border) and is announced; linked with `aria-describedby`. */
  error?: ReactNode;
};

/** Stroke-draw classes for one mark: draws in (pathLength 0 -> 1, the fast token), un-draws faster. Reduced motion: no draw, the wrapper fades. */
function drawn(on: boolean) {
  return cn(
    "[stroke-dasharray:1]",
    on
      ? "opacity-100 [stroke-dashoffset:0] motion-ok:transition-[stroke-dashoffset] motion-ok:delay-[40ms] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out"
      : // Hidden marks stay out of sight (no round-cap dot at length 0), also with reduced motion.
        "opacity-0 [stroke-dashoffset:0] motion-ok:[stroke-dashoffset:1] motion-ok:transition-[stroke-dashoffset,opacity] motion-ok:duration-(--sheen-duration-instant) motion-ok:ease-sheen-exit",
  );
}

/**
 * A glass checkbox with an optional label and description. Use it for independent yes/no
 * options and for "select all" rows (set `indeterminate` when only some children are checked).
 *
 * Keyboard: Tab focuses it; Space toggles it.
 * Accessibility: A real checkbox role with `aria-checked="mixed"` for indeterminate; the label and description share one `<label>`, so clicking either toggles it; the unchecked border keeps 3:1 contrast and forced colors fill the box with Highlight. Touch hit area is 44x44 px.
 * Glass: One `glass-1` box; the accent fill is a separate layer faded with opacity.
 * Motion: The fill fades in and the check mark draws itself (SVG `pathLength` 0 to 1 over the fast token); going between indeterminate and checked un-draws the dash while the check draws, a morph. Both leave faster than they arrive. Reduced motion: the mark only fades.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Checkbox } from "@sheenui/theme";
 *
 * export function Terms() {
 *   const [agreed, setAgreed] = useState(false);
 *   return (
 *     <Checkbox
 *       checked={agreed}
 *       onCheckedChange={setAgreed}
 *       label="I agree to the terms"
 *       description="You can change this later in settings."
 *     />
 *   );
 * }
 * ```
 *
 * @see /components/checkbox
 */
export function Checkbox({
  label,
  description,
  error,
  className,
  controlClassName,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: CheckboxProps) {
  const errorId = useId();
  const labelId = useId();
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
  // Without a label or an error the control is the only element, so `className` lands on it.
  const standalone = !label && !error;
  const control = (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={classNameWith(controlClassName, (extra) =>
        cn(
          "glass-1 relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[0.4rem] border-sheen-control-border text-sheen-accent-fg",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:[background-image:var(--sheen-accent-fill)]",
          "before:opacity-0 before:transition-opacity before:duration-(--sheen-duration-exit) before:ease-sheen-exit",
          "data-checked:before:opacity-100 data-checked:before:duration-(--sheen-duration-fast) data-checked:before:ease-sheen-out",
          "data-indeterminate:before:opacity-100 data-indeterminate:before:duration-(--sheen-duration-fast) data-indeterminate:before:ease-sheen-out",
          "transition-[border-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
          "data-checked:border-transparent data-indeterminate:border-transparent",
          "motion-ok:active:not-data-disabled:not-data-readonly:scale-[0.92]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "forced-colors:data-checked:border-[Highlight]! forced-colors:data-checked:bg-[Highlight]! forced-colors:data-checked:text-[HighlightText]!",
          "forced-colors:data-indeterminate:border-[Highlight]! forced-colors:data-indeterminate:bg-[Highlight]! forced-colors:data-indeterminate:text-[HighlightText]!",
          invalid && "border-sheen-danger-border data-checked:border-transparent",
          standalone && className,
          extra,
        ),
      )}
      aria-invalid={invalid || undefined}
      // The visible label names the control from the first render (server and client), not after Base UI wires it up.
      aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
      aria-describedby={joinIds(ariaDescribedBy, error && errorId)}
      {...props}
    >
      {/* Invisible hit area: 44×44 px on touch screens. A real element, never ::after (glass owns it). */}
      <span aria-hidden className="sheen-hit-area" />
      <BaseCheckbox.Indicator
        keepMounted
        render={(indicatorProps, state) => {
          const shown = state.checked || state.indeterminate;
          return (
            <span
              {...indicatorProps}
              className={cn(
                "flex",
                // Enter: quick ease-out pop. Exit: shorter, ease-in, no overshoot.
                shown
                  ? "opacity-100 transition-[opacity,scale] duration-(--sheen-duration-fast) ease-sheen-out"
                  : "opacity-0 transition-[opacity,scale] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:scale-75",
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Two marks, each drawn with pathLength 0 -> 1: the check when checked, the dash when indeterminate.
                    Switching between them un-draws one while the other draws, so dash <-> check is a morph. */}
                <path
                  pathLength={1}
                  d="M5 12.5l4.5 4.5L19 7.5"
                  className={drawn(state.checked && !state.indeterminate)}
                />
                <path pathLength={1} d="M6 12h12" className={drawn(state.indeterminate)} />
              </svg>
            </span>
          );
        }}
      />
    </BaseCheckbox.Root>
  );

  return (
    <FieldControlShell
      control={control}
      label={label}
      description={description}
      error={error}
      errorId={errorId}
      labelId={labelId}
      className={className}
    />
  );
}
