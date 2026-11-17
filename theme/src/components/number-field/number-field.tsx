"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { Field } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { cn } from "../../lib/cn";
import { fieldHeight, type FieldSize } from "../../lib/field-size";
import { useMergedRef } from "../../lib/form";
import { COARSE_POINTER_QUERY } from "../../hooks/use-media-query";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";

/** Translatable text of {@link NumberField}. */
export type NumberFieldLabels = {
  /** Accessible name of the + button. */
  increment: string;
  /** Accessible name of the − button. */
  decrement: string;
};

/** The English {@link NumberFieldLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultNumberFieldLabels: NumberFieldLabels = { increment: "Increase", decrement: "Decrease" };

/** Props of `NumberField`: the Base UI `NumberField.Root` props minus the ones it sets itself. */
export type NumberFieldProps = Omit<
  ComponentProps<typeof BaseNumberField.Root>,
  "className" | "render" | "children" | "style" | "onValueChange" | "ref" | "onBlur"
> & {
  /** Ref to the text input (focus target), not the wrapper. Form libraries use it to focus the field after a failed validation. */
  ref?: Ref<HTMLInputElement>;
  /** Called when the input loses focus (react-hook-form: marks the field touched). */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Marks the input invalid without an `error` message. */
  "aria-invalid"?: boolean | "true" | "false";
  /** Id of extra describing text, merged with the description and error. */
  "aria-describedby"?: string;
  /** Called with the new value (null when cleared). Base UI's change details come second. */
  onValueChange?: ComponentProps<typeof BaseNumberField.Root>["onValueChange"];
  /** Text above the field, linked to the input as its accessible name. */
  label?: ReactNode;
  /** Muted helper text under the field. */
  description?: ReactNode;
  /** Error message; marks the field invalid and is announced politely to screen readers when it appears. */
  error?: ReactNode;
  /** Where the − / + buttons go: "split" (default), "stacked" or "none". "stacked" falls back to "split" on touch screens (bigger targets). */
  steppers?: "split" | "stacked" | "none";
  /** Drag the label sideways to change the value. Default false. */
  scrub?: boolean;
  /** Slide changed digits when the value steps. Off with reduced motion. Default true. */
  animated?: boolean;
  /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
  size?: FieldSize;
  /** Hint shown while the field is empty. */
  placeholder?: string;
  /** Every string, for translation: `{ increment: "Increase", decrement: "Decrease" }` (accessible names of the + and − buttons). */
  labels?: Partial<NumberFieldLabels>;
  /** Name for screen readers when there is no visible label. */
  "aria-label"?: string;
  /** Class for the outer wrapper (label + field + messages). */
  className?: string;
  /** Adds extra classes to the native <input>. */
  inputClassName?: string;
};

/* ---------- Icons ---------- */

function MinusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

function ScrubIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M4 12h16" />
    </svg>
  );
}

/* ---------- Odometer digits ---------- */

/** +1 when the value went up (new digits rise from below), -1 when it went down. */
type Direction = 1 | -1;

const digitVariants: Variants = {
  enter: (dir: Direction) => ({ y: dir > 0 ? "70%" : "-70%", opacity: 0 }),
  center: { y: "0%", opacity: 1, transition: spring.snappy },
  exit: (dir: Direction) => ({
    y: dir > 0 ? "-70%" : "70%",
    opacity: 0,
    transition: { duration: duration.exit, ease: ease.exit },
  }),
};

/** Text metrics the overlay copies from the input, so the digits sit exactly on the real text. */
const COPIED = [
  // Longhands: the `font` shorthand reads as "" whenever it can't express a value (tabular-nums).
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "font-kerning",
  "font-variant-numeric",
  "font-feature-settings",
  "font-variation-settings",
  "line-height",
  "letter-spacing",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
] as const;

/**
 * The formatted value drawn over the (transparent) input text, one slot per character.
 * Slots are keyed from the right, so units stay put and a new leading digit just appears.
 */
function RollingValue({
  text,
  direction,
  inputRef,
  styleKey,
}: {
  text: string;
  direction: Direction;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Changes when the input's classes change, so the copied text metrics are refreshed. */
  styleKey: string;
}) {
  const overlayRef = useRef<HTMLSpanElement>(null);
  const chars = Array.from(text);

  // Match the input's font, padding and alignment (inputClassName may change them). Runs when the
  // overlay mounts (it remounts after typing) and when the input's classes change, not per step.
  useLayoutEffect(() => {
    const input = inputRef.current;
    const overlay = overlayRef.current;
    if (!input || !overlay) return;
    const copy = () => {
      const style = getComputedStyle(input);
      for (const property of COPIED) overlay.style.setProperty(property, style.getPropertyValue(property));
      const align = style.textAlign;
      overlay.style.justifyContent =
        align === "center" ? "center" : align === "right" || align === "end" ? "flex-end" : "flex-start";
    };
    copy();
    // The text size switches with the pointer type (16px on touch screens).
    const coarse = window.matchMedia(COARSE_POINTER_QUERY);
    coarse.addEventListener("change", copy);
    return () => coarse.removeEventListener("change", copy);
  }, [inputRef, styleKey]);

  return (
    <span
      ref={overlayRef}
      aria-hidden
      data-slot="number-field-digits"
      // Laid over the input (same width, pulled back by a negative start margin) with its
      // padding and line height, then baseline-aligned with it by the flex row: each engine
      // lines the digits up with the text exactly where it draws it. Clipped sideways only,
      // so digits can slide in from above and below.
      className="pointer-events-none flex w-full min-w-0 shrink-0 -ms-[100%] overflow-x-clip whitespace-pre text-sheen-fg forced-colors:hidden"
    >
      {chars.map((char, index) => {
        const slot = chars.length - 1 - index;
        return (
          <span key={`${slot}-${/\d/.test(char) ? "d" : char}`} className="relative inline-flex">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.span
                key={char}
                custom={direction}
                variants={digitVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="inline-block"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

/* ---------- Field ---------- */

const stepperBase = cn(
  "relative flex shrink-0 cursor-pointer items-center justify-center text-sheen-fg-muted select-none",
  // Touch: the hit area also covers the field's 1px border, so the button is a full 44px tall.
  "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:-inset-y-px",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:hover:bg-transparent data-disabled:hover:text-sheen-fg-muted",
  // The icon gives a little squeeze on press; the button itself never moves.
  "[&>svg]:transition-transform [&>svg]:duration-(--sheen-duration-instant) motion-ok:active:not-data-disabled:[&>svg]:scale-75",
  "forced-colors:data-disabled:text-[GrayText]",
);

/**
 * A glass number field on Base UI's NumberField, for quantities, prices and settings where people nudge a number or type an exact
 * one. Use `Slider` for a rough value on a scale and `Input` for text.
 *
 * - − / + steppers (hold to repeat), or a compact stacked pair (`steppers`); ↑ ↓ step by `step`, Shift by `largeStep`, Alt by
 *   `smallStep`; Home / End jump to `min` / `max`.
 * - `scrub`: drag the label sideways to change the value, like a design tool.
 * - `format`: any Intl.NumberFormat options (currency, percent, units), in the user's locale or `locale`. Typing is parsed back in the same format.
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; `name` submits the value with a form; `error` marks it invalid.
 * - When the value steps (buttons, arrow keys, wheel, scrub), the digits that change slide up or down like an odometer. While you type, the plain
 *   input shows; with reduced motion or in high contrast mode it never animates.
 *
 * Label, description and error are wired up by Base UI's Field, like `Input`.
 *
 * Keyboard: Tab focuses the input; ↑ ↓ step (Shift: large step, Alt: small step); Home and End jump to
 * the limits; typing, pasting and clearing work as in any text field; the stepper buttons are not tab stops (the input already offers the same keys).
 * Accessibility: Base UI renders a text input (`type="text"` with a decimal `inputMode`, so phones show a numeric keypad and the user can type any locale's
 * format) that is announced as a "Number field" (`aria-roledescription`), named by the label; it is deliberately not `role="spinbutton"`, so there
 * are no `aria-valuenow/min/max` attributes (the value is the text itself, and `min` / `max` clamp it). The − and + buttons have names
 * (`labels.decrement`, `labels.increment`) and 44px targets on touch screens; an `error` is announced politely when it appears.
 * Glass and motion: `glass-1` field. The odometer digits are a decorative overlay (`aria-hidden`) that is skipped under reduced motion and forced colors.
 *
 * @example
 * ```tsx
 * import { NumberField } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <NumberField label="Guests" defaultValue={2} min={1} max={12} />
 *       <NumberField label="Price" defaultValue={29} format={{ style: "currency", currency: "USD" }} scrub />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /forms/number-field
 */
export function NumberField({
  label,
  description,
  error,
  steppers = "split",
  scrub = false,
  animated = true,
  size = "md",
  placeholder,
  labels: labelsProp,
  className,
  inputClassName,
  disabled,
  name,
  onValueChange,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ref,
  onBlur,
  ...rootProps
}: NumberFieldProps) {
  const { increment: incrementLabel, decrement: decrementLabel } = { ...defaultNumberFieldLabels, ...labelsProp };
  const reduced = useSheenReducedMotion();
  const invalid = Boolean(error);
  // "typing": show the real input text. Otherwise the odometer overlay draws the value.
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRef(inputRef, ref);
  const rolling = animated && !reduced && !typing;

  // The value shown, controlled or not, and which way the digits roll when it changes. Worked out
  // while rendering (not in an effect), so new digits enter from the correct side on the very
  // first frame, also when the parent changes a controlled value itself.
  const controlledValue = rootProps.value;
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(rootProps.defaultValue ?? null);
  const shown = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const [roll, setRoll] = useState<{ value: number | null; direction: Direction }>({ value: shown, direction: 1 });
  let direction = roll.direction;
  if (shown !== roll.value) {
    if (shown !== null && roll.value !== null) direction = shown > roll.value ? 1 : -1;
    setRoll({ value: shown, direction });
  }

  const handleValueChange: NumberFieldProps["onValueChange"] = (next, details) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    if (details.reason.startsWith("input-")) {
      // Typing, pasting or clearing: keep the plain input (blur reformats without a roll).
      if (details.reason !== "input-blur") setTyping(true);
    } else {
      setTyping(false);
    }
    onValueChange?.(next, details);
  };

  const labelNode = label && (
    <Field.Label className={cn("text-sm font-medium text-sheen-fg", scrub && "cursor-ew-resize")}>{label}</Field.Label>
  );

  const decrement = (className?: string, icon: ReactNode = <MinusIcon />) => (
    <BaseNumberField.Decrement aria-label={decrementLabel} className={cn(stepperBase, className)}>
      {icon}
    </BaseNumberField.Decrement>
  );
  const increment = (className?: string, icon: ReactNode = <PlusIcon />) => (
    <BaseNumberField.Increment aria-label={incrementLabel} className={cn(stepperBase, className)}>
      {icon}
    </BaseNumberField.Increment>
  );
  const split = "w-10 any-pointer-coarse:w-11";
  // The group doesn't clip (so touch hit areas can cover its border): round the outer corners here.
  const startCorners = "rounded-s-[calc(var(--sheen-radius-md)-1px)]";
  const endCorners = "rounded-e-[calc(var(--sheen-radius-md)-1px)]";

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={invalid}
      data-slot="number-field-root"
      className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
    >
      <BaseNumberField.Root
        {...rootProps}
        name={name}
        disabled={disabled}
        onValueChange={handleValueChange}
        data-slot="number-field"
        className="flex min-w-0 flex-col gap-1.5"
      >
        {labelNode &&
          (scrub ? (
            // Drag the label (or the arrows beside it) sideways to change the value.
            <BaseNumberField.ScrubArea
              data-slot="number-field-scrub"
              // Base UI ends a scrub on `pointerup` only. A system gesture or a call cancels the touch instead
              // (`pointercancel`), which would leave the field scrubbing: end it with the pointerup it is waiting for.
              onPointerCancel={(event) => {
                event.currentTarget.ownerDocument.defaultView?.dispatchEvent(
                  new PointerEvent("pointerup", {
                    pointerId: event.pointerId,
                    pointerType: event.pointerType,
                    bubbles: true,
                    cancelable: true,
                  }),
                );
              }}
              className="group/scrub flex w-fit cursor-ew-resize touch-none items-center gap-1.5 select-none data-disabled:cursor-not-allowed"
            >
              {labelNode}
              <span className="flex text-sheen-fg-subtle transition-colors group-hover/scrub:text-sheen-accent group-data-scrubbing/scrub:text-sheen-accent">
                <ScrubIcon />
              </span>
              <BaseNumberField.ScrubAreaCursor className="text-sheen-fg drop-shadow-[0_1px_2px_var(--sheen-shadow-far)]">
                <ScrubIcon />
              </BaseNumberField.ScrubAreaCursor>
            </BaseNumberField.ScrubArea>
          ) : (
            labelNode
          ))}

        <BaseNumberField.Group
          data-slot="number-field-group"
          className={cn(
            fieldHeight[size],
            "glass-1 flex w-full min-w-0 items-stretch rounded-sheen-md",
            "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
            "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)] data-scrubbing:border-sheen-accent",
            // Solid focus outline around the whole field (not just the bare input).
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
            invalid &&
              "border-sheen-danger focus-within:border-sheen-danger focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]",
            "data-disabled:cursor-not-allowed data-disabled:opacity-55",
          )}
        >
          {steppers === "split" && decrement(cn(split, startCorners, "border-e border-sheen-border"))}

          <div className="flex min-w-0 flex-1 items-baseline overflow-hidden">
            <BaseNumberField.Input
              ref={mergedInputRef}
              placeholder={placeholder}
              {...(ariaLabel !== undefined && { "aria-label": ariaLabel })}
              {...(ariaDescribedBy !== undefined && { "aria-describedby": ariaDescribedBy })}
              {...(ariaInvalid === true || ariaInvalid === "true" ? { "aria-invalid": true } : {})}
              onBeforeInput={() => setTyping(true)}
              onPaste={() => setTyping(true)}
              onBlur={(event) => {
                setTyping(false);
                onBlur?.(event);
              }}
              data-sheen-inner-focus=""
              className={cn(
                // Full height, so a click anywhere in the field lands in the input. Padding that
                // leaves exactly one line (42px inside the border = 11 + 20 + 11), so no engine has
                // to centre the text itself; the odometer overlay copies these metrics.
                // One line (20px) centred in the field: the padding is what is left of the height.
                size === "sm" ? "py-[5px]" : size === "lg" ? "py-[13px]" : "py-[9px]",
                "h-full w-full min-w-0 shrink-0 bg-transparent px-3 text-sm leading-5 font-medium text-sheen-fg tabular-nums outline-none",
                "placeholder:font-normal placeholder:text-sheen-fg-subtle disabled:cursor-not-allowed",
                "any-pointer-coarse:py-[9px] any-pointer-coarse:text-base any-pointer-coarse:leading-6",
                // High contrast: the field draws the focus ring, so the input skips the global one.
                "forced-colors:focus-visible:outline-none!",
                steppers === "split" ? "text-center" : "text-start",
                inputClassName,
                // The odometer draws the digits; the input keeps its caret and selection.
                // Last, so a text colour in inputClassName can't show the digits twice.
                rolling && "text-transparent caret-sheen-fg forced-colors:text-[CanvasText]",
              )}
              render={(inputProps, state) => (
                <>
                  <input {...inputProps} />
                  {rolling && state.inputValue !== "" && (
                    <RollingValue
                      text={state.inputValue}
                      direction={direction}
                      inputRef={inputRef}
                      styleKey={`${steppers} ${inputClassName ?? ""}`}
                    />
                  )}
                </>
              )}
            />
          </div>

          {steppers === "split" && increment(cn(split, endCorners, "border-s border-sheen-border"))}

          {steppers === "stacked" && (
            <>
              {/* Mouse and pen: a compact pair. Touch: the bigger split buttons. */}
              <div className="flex w-8 shrink-0 flex-col border-s border-sheen-border any-pointer-coarse:hidden">
                {increment(
                  "flex-1 rounded-se-[calc(var(--sheen-radius-md)-1px)] border-b border-sheen-border",
                  <ChevronIcon up />,
                )}
                {decrement("flex-1 rounded-ee-[calc(var(--sheen-radius-md)-1px)]", <ChevronIcon />)}
              </div>
              <div className="hidden shrink-0 any-pointer-coarse:flex">
                {decrement(cn(split, "border-s border-sheen-border"))}
                {increment(cn(split, endCorners, "border-s border-sheen-border"))}
              </div>
            </>
          )}
        </BaseNumberField.Group>
      </BaseNumberField.Root>

      {description && !error && (
        <Field.Description className="text-xs text-sheen-fg-muted">{description}</Field.Description>
      )}
      {/* A live region that is always there, so an error that appears is announced politely.
          Taken out of the flow while empty, so it adds no gap. */}
      <div aria-live="polite" aria-atomic="true" className="empty:absolute">
        {error && (
          <Field.Error match className="text-xs font-medium text-sheen-danger-text">
            {error}
          </Field.Error>
        )}
      </div>
    </Field.Root>
  );
}
