"use client";

import type { ComponentProps, ReactNode } from "react";
import { Field } from "@base-ui/react/field";

import { cn } from "../../lib/cn";
import { fieldHeight, type FieldSize } from "../../lib/field-size";
import { SpinnerIcon } from "../spinner/spinner";

const paddings = {
  sm: "px-3",
  md: "px-3.5",
  lg: "px-4",
} as const;

/** Props of `Input`: the native `<input>` props plus its own options, each documented on its field. */
export type InputProps = Omit<
  ComponentProps<"input">,
  "size" | "name" | "readOnly" | "required" | "autoComplete" | "enterKeyHint"
> & {
  /** Height and padding, the same scale as `Button` and every other field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens). Default "md". */
  size?: FieldSize;
  /** Text above the field, linked to the input as its accessible name. */
  label?: ReactNode;
  /** Muted helper text under the field. Hidden while an `error` shows. */
  description?: ReactNode;
  /** Error message; marks the field invalid and is announced to screen readers. */
  error?: ReactNode;
  /** Icon or text shown inside the field, on the left. */
  leading?: ReactNode;
  /** Icon, text or button shown inside the field, on the right. */
  trailing?: ReactNode;
  /** Shows a spinner at the field's trailing edge and sets `aria-busy` (a lookup or validation is running). The field stays editable. Default false. */
  loading?: boolean;
  /** Field name for form submission and for matching an `error` from a form library. */
  name?: string;
  /** The value can be selected and copied but not edited; the field stays focusable and is submitted with the form. Default false. */
  readOnly?: boolean;
  /** The field must be filled before the form can be submitted. Default false. */
  required?: boolean;
  /** Autofill hint (the HTML `autocomplete` token, for example "email" or "one-time-code"). Defaults to "email" for `type="email"`; otherwise the browser decides. */
  autoComplete?: string;
  /** Label of the on-screen keyboard's Enter key. Defaults to "search" for `type="search"`; otherwise the browser decides. */
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  /** Called when the field loses focus (native `onBlur`; also the point where a form library marks the field touched). */
  onBlur?: ComponentProps<"input">["onBlur"];
  /** Class for the outer wrapper (label + field + messages), same as Select and Combobox. */
  className?: string;
  /** Adds extra classes to the native <input> element. */
  inputClassName?: string;
};

/**
 * A glass text field. Label, description and error are linked to the input by Base UI's Field
 * (aria-labelledby, aria-describedby and aria-invalid). Use it for single-line text, email, password,
 * search and number-like entry; use `Textarea` for several lines and `NumberField` for steppers.
 *
 * `className` styles the outer wrapper; `inputClassName` the native input. Every other prop
 * (type, value, onChange, ...) goes to the input. `leading` and `trailing` put an icon, text
 * or button inside the field's edges.
 *
 * Keyboard: Tab focuses the input; everything the native input does (typing, selection, autofill) works.
 * Accessibility: pass `label` (or an `aria-label`); `error` sets `aria-invalid` and is announced; the field is
 * 44px tall (`h-11`) with 16px text on touch to stop iOS zoom; the control border is 3:1 (WCAG 1.4.11).
 * Glass and motion: `glass-1` surface with an accent ring on focus. Only border and ring colours transition.
 * Forced colors keep a visible border.
 *
 * @example
 * ```tsx
 * import { Input } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Input label="Email" type="email" placeholder="you@example.com" description="We never share it." />
 *       <Input label="Username" error="That name is taken." defaultValue="sheen" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /components/input
 */
export function Input({
  label,
  description,
  error,
  leading,
  trailing,
  className,
  inputClassName,
  size = "md",
  disabled,
  name,
  loading = false,
  autoComplete,
  enterKeyHint,
  ...props
}: InputProps) {
  const invalid = Boolean(error);

  return (
    <Field.Root
      data-slot="input"
      name={name}
      disabled={disabled}
      invalid={invalid}
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label && (
        <Field.Label data-slot="input-label" className="text-sm font-medium text-sheen-fg">
          {label}
        </Field.Label>
      )}

      <div
        className={cn(
          // The field's edge is its only outline: the >= 3:1 control boundary (WCAG 1.4.11).
          "glass-1 group/input flex items-center gap-2 rounded-sheen-md border-sheen-control-border",
          fieldHeight[size],
          paddings[size],
          "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
          "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
          // Solid focus outline around the whole field (not just the bare input).
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
          invalid &&
            "border-sheen-danger-border focus-within:border-sheen-danger-border focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        {leading && <span className="flex shrink-0 text-sheen-fg-muted">{leading}</span>}
        <Field.Control
          className={cn(
            "h-full w-full min-w-0 bg-transparent text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle",
            // The field shell draws the one focus ring; presets' bare-control focus rings must not draw a second, inner one.
            "focus-visible:animate-none! focus-visible:shadow-none!",
            "any-pointer-coarse:h-11 any-pointer-coarse:text-base disabled:cursor-not-allowed",
            inputClassName,
          )}
          autoComplete={autoComplete ?? (props.type === "email" ? "email" : undefined)}
          enterKeyHint={enterKeyHint ?? (props.type === "search" ? "search" : undefined)}
          aria-busy={loading || undefined}
          {...props}
        />
        {loading && <SpinnerIcon className="size-4 shrink-0 text-sheen-fg-muted" />}
        {trailing && <span className="flex shrink-0 text-sheen-fg-muted">{trailing}</span>}
      </div>

      {description && !error && (
        <Field.Description data-slot="input-description" className="text-xs text-sheen-fg-muted">
          {description}
        </Field.Description>
      )}
      {error && (
        <Field.Error match data-slot="input-error" className="text-xs font-medium text-sheen-danger-text">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
