"use client";

import { useId, type ReactNode } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";

import { cn } from "../../lib/cn";
import { joinIds, type FormControlProps } from "../../lib/form";
import { warnOnce } from "../../lib/warn-once";
import { useField } from "../field/field";

/** Translatable text of {@link Slider}. */
export type SliderLabels = {
  /** Accessible name of the first thumb of a range (when there is no `aria-label`). */
  minimum: string;
  /** Accessible name of the second thumb of a range (when there is no `aria-label`). */
  maximum: string;
};

/** The English {@link SliderLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultSliderLabels: SliderLabels = { minimum: "Minimum", maximum: "Maximum" };

/** Props of `Slider`; each option is documented on its field. */
export type SliderProps = Omit<FormControlProps<HTMLInputElement>, "required"> & {
  /** Takes one number, or two for a range. */
  value?: number | number[];
  /** Sets the starting value when uncontrolled. */
  defaultValue?: number | number[];
  /** Called on every change while dragging or using the keyboard. */
  onValueChange?: (value: number | number[]) => void;
  /** Called once when a change ends: the pointer is released, or a key press is done. Use it to save, instead of saving on every step. */
  onValueCommitted?: (value: number | number[]) => void;
  /** Lowest selectable value, the value at the left end of the track; keep it below `max`. Default 0. */
  min?: number;
  /** Highest selectable value, the value at the right end of the track; keep it above `min`. Default 100. */
  max?: number;
  /** Sets the size of one step. Default 1. */
  step?: number;
  /**
   * Sets the step for PageUp / PageDown and Shift + arrows. Default 10 (a change of 10 in the value, not ten
   * steps).
   */
  largeStep?: number;
  /**
   * For a range: the smallest allowed gap between two thumbs, in steps.
   * @default 0
   */
  minStepsBetweenValues?: number;
  /** Id of the slider root (a label or a form library can point at it). */
  id?: string;
  /** Id of a `<form>` element to submit with when the slider is outside it. */
  form?: string;
  /** Text above the track, also the slider's accessible name. */
  label?: ReactNode;
  /** Show the current value(s) next to the label. Default true. */
  showValue?: boolean;
  /** Show a bubble with the value above the thumb while dragging (useful on touch, where a finger covers the thumb). Default true. */
  showBubble?: boolean;
  /** Label for screen readers when there is no visible label. */
  "aria-label"?: string;
  /** Id of an element that names the slider (instead of `label`). */
  "aria-labelledby"?: string;
  /** Disables the slider so it cannot be moved. */
  disabled?: boolean;
  /** Every string, for translation: the names of the two range thumbs. Default {@link defaultSliderLabels}. */
  labels?: Partial<SliderLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A slider for picking a number (volume, price) or a range between two numbers. Use `NumberField` when
 * people need to type an exact value.
 *
 * - Pass one number for a single thumb, or an array of two for a range (a thumb per entry).
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
 * - `showValue` prints the value(s) next to the `label`; `showBubble` shows the value above the thumb while dragging.
 * - Without a visible `label`, pass `aria-label` or `aria-labelledby` (a dev warning fires when a single slider has no name at all); range thumbs are named "Minimum" and "Maximum" (`labels`, for translation) unless you do.
 * - Forms: `name` submits the value (one hidden range input per thumb), `ref` and `onBlur` go to the thumb input(s), `aria-invalid` and `aria-describedby` too; `onValueCommitted` fires once when a change ends.
 *
 * Keyboard: Tab focuses each thumb; ← → ↑ ↓ change the value by one step, PageUp and PageDown by 10
 * (the value, not ten steps), Home and End jump to the ends. Accessibility: each thumb is a native `input type="range"`, so it
 * reports its value, min and max; the track is 44px tall on touch screens and the track edge has a 3:1 border.
 * Forced colors draw the thumb as a solid disc.
 * Glass and motion: `glass-1` track with an accent fill. The thumb scales on hover and drag and the bubble
 * springs in (movement is gated by `motion-ok:`); reduced motion keeps only the colour and opacity changes.
 *
 * @example
 * ```tsx
 * import { Slider } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Slider label="Volume" defaultValue={40} />
 *       <Slider label="Price" defaultValue={[20, 80]} min={0} max={200} step={5} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /components/slider
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  minStepsBetweenValues,
  id,
  form,
  name,
  ref,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  label,
  showValue = true,
  showBubble = true,
  "aria-label": ariaLabel,
  disabled,
  labels: labelsProp,
  className,
}: SliderProps) {
  const labels = { ...defaultSliderLabels, ...labelsProp };
  const initial = value ?? defaultValue ?? min;
  const thumbs = Array.isArray(initial) ? initial.length : 1;
  // Our own label id (not Base UI's effect-registered one), so the thumb is named on the very first render, in SSR and after hydration.
  const labelId = useId();
  const inField = useField() !== null;
  const thumbLabelledBy = ariaLabelledBy ?? (label && !ariaLabel && thumbs === 1 ? labelId : undefined);
  if (!label && !ariaLabel && !ariaLabelledBy && thumbs === 1 && !inField) {
    warnOnce(
      "Slider: no accessible name. Pass `label`, `aria-label` or `aria-labelledby` (or put it in a Field with a label).",
    );
  }

  return (
    <BaseSlider.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v)}
      onValueCommitted={onValueCommitted ? (v) => onValueCommitted(v) : undefined}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      minStepsBetweenValues={minStepsBetweenValues}
      id={id}
      name={name}
      form={form}
      disabled={disabled}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      {(Boolean(label) || showValue) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label && (
            <BaseSlider.Label render={(props) => <div {...props} id={labelId} />} className="font-medium">
              {label}
            </BaseSlider.Label>
          )}
          {showValue && <BaseSlider.Value className="text-sheen-fg-muted tabular-nums" />}
        </div>
      )}
      {/* py makes the whole control a ≥ 44px-tall touch target on coarse pointers. */}
      <BaseSlider.Control
        data-slot="slider-control"
        className="flex w-full touch-none items-center py-2 select-none any-pointer-coarse:py-[1.125rem] data-disabled:opacity-50"
      >
        {/* The track's edge shows the slider's extent: the >= 3:1 control boundary (WCAG 1.4.11). */}
        <BaseSlider.Track
          data-slot="slider-track"
          className="glass-1 relative h-2 w-full rounded-sheen-full border-sheen-control-border"
        >
          {/* Base UI's inline `height: inherit` copies the track's 8px border-box height into its 6px content
              box, so the fill hung 1px low over the bottom edge. h-full! keeps it inside the border. */}
          <BaseSlider.Indicator
            data-slot="slider-indicator"
            className="sheen-fill h-full! rounded-sheen-full [background-image:var(--sheen-accent-fill)]"
          />
          {Array.from({ length: thumbs }, (_, i) => (
            <BaseSlider.Thumb
              data-slot="slider-thumb"
              key={i}
              index={i}
              inputRef={i === 0 ? ref : undefined}
              onBlur={onBlur}
              // Only defined keys: an explicit `undefined` would wipe Base UI's label wiring.
              {...(thumbLabelledBy !== undefined && { "aria-labelledby": thumbLabelledBy })}
              {...(ariaDescribedBy !== undefined && { "aria-describedby": joinIds(ariaDescribedBy) })}
              {...(ariaInvalid === true || ariaInvalid === "true" ? { "aria-invalid": true } : {})}
              aria-label={ariaLabel ?? (thumbs > 1 ? (i === 0 ? labels.minimum : labels.maximum) : undefined)}
              className={cn(
                "group/thumb size-5 cursor-grab rounded-full bg-sheen-thumb shadow-(--sheen-thumb-shadow-raised)",
                "transition-[scale] duration-(--sheen-duration-fast) ease-sheen-out data-dragging:cursor-grabbing",
                "motion-ok:hover:scale-110 motion-ok:data-dragging:scale-115",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sheen-focus",
                "data-disabled:cursor-not-allowed",
                // High contrast: a Canvas disc with a solid edge stays visible on both track and fill.
                "forced-colors:border-2 forced-colors:border-[CanvasText] forced-colors:bg-[Canvas]",
              )}
              render={(thumbProps, state) => {
                const active = showBubble && state.dragging && state.activeThumbIndex === i;
                return (
                  <div {...thumbProps}>
                    {thumbProps.children}
                    <span
                      aria-hidden
                      data-open={active ? "" : undefined}
                      className={cn(
                        "pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 rounded-sheen-sm px-2 py-1",
                        "sheen-fill text-xs font-semibold text-sheen-accent-fg tabular-nums whitespace-nowrap [background-image:var(--sheen-accent-fill)]",
                        "shadow-[0_6px_16px_-6px_var(--sheen-accent-glow)]",
                        // Exit faster than enter; movement only when motion is welcome.
                        "origin-bottom opacity-0 transition-[opacity,scale,translate] duration-(--sheen-duration-exit) ease-sheen-exit",
                        "motion-ok:translate-y-1 motion-ok:scale-90",
                        "data-open:opacity-100 data-open:duration-(--sheen-duration-snappy) data-open:ease-sheen-snappy",
                        "motion-ok:data-open:translate-y-0 motion-ok:data-open:scale-100",
                      )}
                    >
                      {state.values[i]}
                    </span>
                  </div>
                );
              }}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
