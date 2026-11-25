"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { AnimatePresence, motion } from "motion/react";

import { StateLightLayer } from "../../lib/state-light";
import { cn } from "../../lib/cn";
import { groupBlur, joinIds, useFocusProxyRef, type FormControlProps } from "../../lib/form";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Visual and spoken state of an `OtpInput`: `idle`, `error` or `success`. */
export type OtpStatus = "idle" | "error" | "success";

/**
 * What plays when `status` becomes "success": "seal" (default) scans the slots with a band of light, folds them into
 * one glass seal with a drawn check, a green bloom, rays and sparks; "ring" ripples a ring round each slot; "none"
 * only recolours the slots.
 */
export type OtpSuccessEffect = "seal" | "ring" | "none";

/** Translatable text of `OtpInput`. */
export type OtpInputLabels = {
  /** Accessible name of the field when no visible `label` or `aria-label` is given. */
  name: string;
};

/** The English `OtpInputLabels` used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultOtpInputLabels: OtpInputLabels = { name: "Verification code" };

/** Props of `OtpInput`; each option is documented on its field. */
export type OtpInputProps = FormControlProps<HTMLDivElement> & {
  /** Slot size, in step with the other controls: "sm", "md" (default) or "lg". */
  size?: "sm" | "md" | "lg";
  /** Number of digits the code has. Default 6. */
  length?: number;
  /** Sets the code so far when controlled. Digits only. */
  value?: string;
  /** Sets the starting code when uncontrolled. */
  defaultValue?: string;
  /** Called on every change with the digits entered so far. */
  onValueChange?: (value: string) => void;
  /** Fires once every slot is filled. */
  onComplete?: (value: string) => void;
  /** "error" shakes the field and glows red; "success" plays `successEffect`. Set back to "idle" before re-triggering. */
  status?: OtpStatus;
  /**
   * What "success" plays: "seal" (the slots fold into one glass seal with a drawn check), "ring" (a ring ripples
   * round each slot) or "none" (colour only). Reduced motion fades the seal in and skips the rest.
   *
   * @default "seal"
   */
  successEffect?: OtpSuccessEffect;
  /**
   * Lights the row by `status`: a red aura and lit edge for "error", green for "success" (`data-state` on the row,
   * drawn on its own layer). The status is always written as text and border colour too.
   * @default true
   */
  stateLight?: boolean;
  /** Visible text above the slots; it names the first slot. */
  label?: ReactNode;
  /** Every string, for translation: `{ name: "Verification code" }` (the default accessible name). */
  labels?: Partial<OtpInputLabels>;
  /** Accessible name when no visible `label` is shown. Default `labels.name` ("Verification code"). */
  "aria-label"?: string;
  /** Id of an element that names the field (instead of `label` / `aria-label`). */
  "aria-labelledby"?: string;
  /** Muted helper text under the slots. */
  description?: ReactNode;
  /** Shown and announced while `status` is "error". */
  errorMessage?: ReactNode;
  /** Shown and announced while `status` is "success". */
  successMessage?: ReactNode;
  /** Accessible name of slots 2…n. Translate it with the rest of your UI. */
  digitLabel?: (position: number, length: number) => string;
  /** Visually split the slots into two groups (e.g. 3 + 3). Default false. */
  grouped?: boolean;
  /** Hide the digits like a password field. Default false. */
  mask?: boolean;
  /** Disables every digit slot of the field. */
  disabled?: boolean;
  /** Mark the field as required for form validation. */
  required?: boolean;
  /** Focus the first slot on mount. Use it only when the code is the one thing on the screen. */
  autoFocus?: boolean;
  /**
   * Id of the first slot; a generated one is used when omitted.
   *
   * @default generated
   */
  id?: string;
  /** Form field name (the joined code is submitted under it). */
  name?: string;
  /** Class for the outer wrapper (label + slots + messages). */
  className?: string;
};

/**
 * One-time code input: a row of single-digit slots for SMS, email and authenticator codes. Typing advances to
 * the next slot, Backspace goes back, and pasting a whole code fills every slot at once. Use `Input` for
 * anything that is not a fixed-length code.
 *
 * - `length` (default 6) sets the digits; `grouped` splits them visually (3 + 3); `mask` hides them.
 * - Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`; `onComplete` fires once every slot is filled.
 * - `status` is "idle", "error" (shakes and glows red, shows `errorMessage`) or "success" (plays `successEffect`, shows
 *   `successMessage`). Set it back to "idle" before re-triggering.
 * - `successEffect` is "seal" (default: a band of light scans the slots, they fold into one glass seal, a check draws
 *   itself and a bloom, rays and sparks burst), "ring" (a ring ripples round each slot) or "none".
 * - `label` or `aria-label`/`aria-labelledby` names the field; `digitLabel` translates the slot names ("Digit 2 of 6").
 * - `name` submits the joined code with a form; the slots use `autoComplete="one-time-code"` (Base UI's default), so phones can offer the SMS code.
 *
 * Keyboard: Tab focuses the first empty slot; digits fill and advance; Backspace clears and moves back; ← → move between
 * slots; paste fills all slots. Accessibility: the first slot is named by the label and the others "Digit n of N"; the error
 * and success messages sit in a polite live region; slots are 44px wide and 48px tall at minimum, with a 3:1 border (WCAG 1.4.11).
 * Glass and motion: each slot is a `glass-1` surface (up to 8 slots stay inside the budget of 8 backdrop-filter surfaces).
 * Filled slots pop, the field shakes on error and the success effect plays; transform and opacity only. Reduced motion
 * skips the fold, rays and sparks (the seal just fades in); forced colours get a solid outlined seal without glow.
 * The seal never leaves the row: the slots keep their space, so nothing shifts.
 *
 * @example
 * ```tsx
 * import { OtpInput } from "@sheenui/theme";
 *
 * const verify = (code: string) => fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
 *
 * export function Example() {
 *   return (
 *     <OtpInput
 *       length={6}
 *       grouped
 *       label="Verification code"
 *       description="We sent it to your phone."
 *       onComplete={(code) => verify(code)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /components/otp-input
 */
export function OtpInput({
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  status = "idle",
  successEffect = "seal",
  stateLight = true,
  label,
  labels,
  "aria-label": ariaLabel = labels?.name ?? defaultOtpInputLabels.name,
  "aria-labelledby": ariaLabelledBy,
  description,
  errorMessage,
  successMessage,
  digitLabel = (position, total) => `Digit ${position} of ${total}`,
  grouped = false,
  mask = false,
  disabled,
  required,
  autoFocus,
  id: idProp,
  name,
  className,
  size = "md",
  ref,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: OtpInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const descriptionId = `${autoId}-description`;
  const messageId = `${autoId}-message`;
  const half = Math.ceil(length / 2);
  const reduced = useSheenReducedMotion();
  const success = status === "success";
  const sealed = success && successEffect === "seal";

  const hasMessages = errorMessage != null || successMessage != null;
  const message = status === "error" ? errorMessage : status === "success" ? successMessage : null;
  const describedBy = joinIds(
    ariaDescribedBy,
    description ? descriptionId : undefined,
    message ? messageId : undefined,
  );
  const rootRef = useFocusProxyRef(ref, "input:not([data-filled]):not(:disabled)", "input:not(:disabled)");
  const invalid = status === "error" || ariaInvalid === true || ariaInvalid === "true";

  return (
    <div data-slot="otp-input" className={cn("flex max-w-full flex-col items-center gap-2", className)}>
      {/* The first slot is named by this label; slots 2…n get "Digit n of N". */}
      {!ariaLabelledBy && (
        <label
          data-slot="otp-input-label"
          htmlFor={id}
          className={label ? "text-sm font-medium text-sheen-fg" : "sr-only"}
        >
          {label ?? ariaLabel}
        </label>
      )}

      <OTPField.Root
        id={id}
        ref={rootRef}
        onBlur={groupBlur(onBlur)}
        name={name}
        length={length}
        value={value}
        defaultValue={defaultValue}
        mask={mask}
        disabled={disabled}
        required={required}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={describedBy}
        onValueChange={(v) => onValueChange?.(v)}
        onValueComplete={(v) => onComplete?.(v)}
        data-status={status}
        data-state={stateLight ? status : undefined}
        data-success-effect={successEffect}
        className={cn(
          "relative isolate",
          // Tighter gaps on narrow phones keep six 44px slots (plus the group dash) on one row at 360px.
          "flex max-w-full items-center gap-1 any-pointer-coarse:max-[399px]:gap-0.5 min-[400px]:gap-2",
          // The group itself (not a glass wrapper) shakes; transform only.
          status === "error" && "motion-ok:animate-[sheen-shake_var(--sheen-duration-slow)_var(--sheen-ease-out)]",
        )}
      >
        {Array.from({ length }, (_, index) => (
          <Slot
            key={index}
            index={index}
            name={index === 0 ? undefined : digitLabel(index + 1, length)}
            labelledBy={index === 0 ? ariaLabelledBy : undefined}
            status={status}
            size={size}
            invalid={invalid}
            ripple={success && successEffect === "ring" && !reduced}
            fold={sealed}
            reduced={reduced}
            count={length}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- opt-in: only when the caller passes autoFocus
            autoFocus={autoFocus && index === 0}
            separatorBefore={grouped && index === half}
          />
        ))}
        <AnimatePresence>{sealed && <SealEffect key="seal" size={size} reduced={reduced} />}</AnimatePresence>
        {status === "error" && !reduced && <ErrorGlow />}
        {stateLight && (
          <StateLightLayer className="-inset-1.5 rounded-sheen-lg [--sl-pool:0.5] [--sl-edge:0.6] [--sl-strength:0.7]" />
        )}
      </OTPField.Root>

      {description && (
        <p id={descriptionId} className="text-center text-xs text-sheen-fg-muted">
          {description}
        </p>
      )}
      {hasMessages && (
        <p
          id={messageId}
          aria-live="polite"
          className={cn(
            "min-h-4 text-center text-xs font-medium",
            status === "error" ? "text-sheen-danger-text" : "text-sheen-success-text",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function Slot({
  index,
  name,
  labelledBy,
  status,
  size,
  invalid,
  ripple,
  fold,
  reduced,
  count,
  autoFocus,
  separatorBefore,
}: {
  index: number;
  name: string | undefined;
  labelledBy: string | undefined;
  status: OtpStatus;
  size: "sm" | "md" | "lg";
  invalid: boolean;
  ripple: boolean;
  /** Success "seal": the slot folds into the middle of the row and fades out. */
  fold: boolean;
  reduced: boolean;
  count: number;
  autoFocus?: boolean;
  separatorBefore?: boolean;
}) {
  const box = useRef<HTMLSpanElement>(null);
  // How far this slot sits from the middle of the row; measured (rect-based, so RTL folds mirrored) when the fold starts.
  const [toMiddle, setToMiddle] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    const row = el?.parentElement;
    if (!fold || !el || !row) return;
    const slot = el.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    setToMiddle(rowBox.left + rowBox.width / 2 - (slot.left + slot.width / 2));
  }, [fold]);
  const folded = fold
    ? reduced
      ? { opacity: 0 }
      : { x: toMiddle, scale: 0.5, opacity: 0 }
    : { x: 0, scale: 1, opacity: 1 };

  return (
    <>
      {separatorBefore && (
        <motion.span
          aria-hidden
          animate={{ opacity: fold ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : duration.slow, ease: ease.out }}
          className="mx-0.5 h-0.5 w-2.5 shrink-0 any-pointer-coarse:max-[399px]:mx-0 rounded-full bg-sheen-fg-subtle min-[400px]:mx-1 min-[400px]:w-3"
        />
      )}
      {/* 44px wide (48px tall) at minimum; slots only shrink below that on very narrow screens. */}
      <motion.span
        ref={box}
        initial={false}
        animate={folded}
        transition={
          reduced
            ? { duration: 0 }
            : {
                duration: duration.slow,
                ease: ease.inOut,
                delay: fold ? SCAN_LEAD + Math.abs(index - (count - 1) / 2) * 0.022 : 0,
              }
        }
        className="relative flex w-11 min-w-0 any-pointer-coarse:min-w-(--sheen-hit-size) sm:w-14"
      >
        <OTPField.Input
          // eslint-disable-next-line jsx-a11y/no-autofocus -- opt-in: only when the caller passes autoFocus
          autoFocus={autoFocus}
          aria-label={name}
          aria-labelledby={labelledBy}
          aria-invalid={invalid || undefined}
          className={cn(
            // Each slot's edge is its only outline: the >= 3:1 control boundary (WCAG 1.4.11).
            size === "sm"
              ? "h-(--sheen-control-h-md) text-lg sm:text-xl"
              : size === "lg"
                ? "h-14 text-2xl sm:text-3xl"
                : "h-(--sheen-control-h-lg) text-xl sm:text-2xl",
            "glass-1 w-full min-w-0 rounded-sheen-md border-sheen-control-border text-center font-sheen-mono font-semibold text-sheen-fg caret-sheen-accent",
            "transition-[border-color,box-shadow] duration-(--sheen-duration-fast) ease-sheen-out",
            "focus:border-sheen-accent focus:shadow-[0_0_0_4px_var(--sheen-ring)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sheen-focus",
            "data-filled:motion-ok:animate-[sheen-pop_var(--sheen-duration-base)_var(--sheen-ease-out)]",
            // Filled slots trade the neutral edge for the accent (also >= 3:1), so progress reads at a glance.
            "data-filled:border-sheen-accent",
            "disabled:cursor-not-allowed disabled:opacity-55",
            status === "error" && "border-sheen-danger-border! text-sheen-danger-text",
            status === "success" && "border-sheen-success-border! text-sheen-success-text",
          )}
        />
        {/* Success ripple: a ring that grows and fades (transform + opacity only). */}
        {ripple && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-sheen-md border-2 border-sheen-success"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: duration.slower, ease: ease.out, delay: index * 0.04 }}
          />
        )}
      </motion.span>
    </>
  );
}

/** Seconds the band of light has to cross the row before the slots start folding. */
const SCAN_LEAD = 0.2;
/** Sparks scale with the slot height (sm 40, md 48, lg 56 px) so the burst stays inside the row's width. */
const SPARK_SCALE = { sm: 0.85, md: 1, lg: 1.15 } as const;
const SPARKS = 14;

/**
 * The success seal: a band of light scans the row, the slots fold into the middle and one glass seal pops with a
 * drawn check, a bloom, a ripple, rays and sparks. It is as tall as the row and sits on top of it, so nothing shifts.
 * Reduced motion: the seal fades in and the check is already drawn; no scan, bloom, rays, ripple or sparks.
 */
function SealEffect({ size, reduced }: { size: "sm" | "md" | "lg"; reduced: boolean }) {
  const lead = reduced ? 0 : SCAN_LEAD + 0.3;
  const k = SPARK_SCALE[size];
  return (
    <motion.span
      aria-hidden
      data-slot="otp-seal"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
    >
      {!reduced && (
        <>
          {/* The scan: a band of light crossing the row, clipped to it. */}
          <span className="absolute inset-0 overflow-hidden rounded-sheen-md forced-colors:hidden">
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-sheen-accent-fg/45 to-transparent"
              initial={{ x: "-100%", opacity: 1 }}
              animate={{ x: "300%", opacity: 1 }}
              transition={{ duration: duration.slower, ease: ease.inOut }}
            />
          </span>
          <motion.span
            className="absolute -z-10 aspect-square h-[280%] rounded-full forced-colors:hidden"
            style={{
              background:
                "radial-gradient(circle, var(--sheen-success-glow, color-mix(in oklab, var(--sheen-success) 60%, transparent)) 0%, color-mix(in oklab, var(--sheen-success) 18%, transparent) 36%, transparent 68%)",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0.7], scale: [0.2, 1.1, 1] }}
            transition={{ duration: duration.slower * 2, delay: lead, ease: ease.out, times: [0, 0.5, 1] }}
          />
          <motion.span
            className="absolute aspect-square h-[240%] rounded-full forced-colors:hidden"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, color-mix(in oklab, var(--sheen-success) 38%, transparent) 0deg 4deg, transparent 4deg 22deg)",
              maskImage: "radial-gradient(closest-side, black 18%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(closest-side, black 18%, transparent 100%)",
            }}
            initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.9, 0.3], rotate: [0, 18, 40], scale: [0.6, 1, 1.08] }}
            transition={{ duration: duration.slower * 3, delay: lead, ease: ease.out, times: [0, 0.35, 1] }}
          />
          <motion.span
            className="absolute aspect-square h-full rounded-full border-[1.5px] border-sheen-success forced-colors:hidden"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 2.8 }}
            transition={{ duration: duration.slower * 1.5, delay: lead + 0.1, ease: ease.out }}
          />
          {Array.from({ length: SPARKS }, (_, i) => {
            const angle = (i / SPARKS) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
            const dist = (50 + (i % 3) * 18) * k;
            return (
              <motion.span
                key={i}
                className="absolute size-1.5 rounded-full bg-sheen-success forced-colors:hidden"
                style={{ boxShadow: "0 0 10px var(--sheen-success)" }}
                initial={{ x: 0, y: 0, scale: i % 3 === 0 ? 1.2 : 0.75, opacity: 1 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0.2, opacity: 0 }}
                transition={{ duration: duration.slower + (i % 4) * 0.09, delay: lead + 0.12, ease: ease.out }}
              />
            );
          })}
        </>
      )}
      <motion.span
        className="relative grid aspect-square h-full place-items-center rounded-full border border-sheen-success-border bg-sheen-success-soft shadow-[inset_0_2px_1px_rgb(255_255_255/0.45),inset_0_-8px_14px_-6px_var(--sheen-success),0_10px_32px_-8px_var(--sheen-success-glow,var(--sheen-success))] backdrop-blur-sm forced-colors:border-2 forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:shadow-none forced-colors:backdrop-blur-none"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : { ...spring.bouncy, delay: lead - 0.1 }}
      >
        <svg viewBox="0 0 40 40" className="size-[62%] overflow-visible">
          <motion.path
            d="M11 21 l6 6 l12 -13"
            fill="none"
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-sheen-success-text forced-colors:stroke-[CanvasText]"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration.slow, delay: reduced ? 0 : lead + 0.15, ease: ease.out }}
          />
        </svg>
      </motion.span>
    </motion.span>
  );
}

/** A wrong code: a red bloom flashes behind the row once (the slots themselves already turn red and shake). */
function ErrorGlow() {
  return (
    <motion.span
      aria-hidden
      data-slot="otp-error-glow"
      className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[200%] -translate-y-1/2 forced-colors:hidden"
      style={{
        background:
          "radial-gradient(closest-side, var(--sheen-danger-glow, color-mix(in oklab, var(--sheen-danger) 50%, transparent)), transparent)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.85, 0] }}
      transition={{ duration: duration.slower * 1.5, ease: ease.out, times: [0, 0.3, 1] }}
    />
  );
}
