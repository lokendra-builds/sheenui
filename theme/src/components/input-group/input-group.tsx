"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { fieldHeight, type FieldSize } from "../../lib/field-size";

/** Props of {@link InputGroup}. The attributes of a `div` plus the ones below. */
export type InputGroupProps = Omit<ComponentProps<"div">, "children"> & {
  /** `InputGroupAddon`s and one `InputGroupInput`, in reading order. */
  children?: ReactNode;
  /** Height, the same scale as `Button` and every field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens). Default "md". */
  size?: FieldSize;
  /** Mark the group invalid (danger edge). Pair it with `aria-invalid` on the input. Default false. */
  invalid?: boolean;
  /** Dim the group; disable the input yourself. Default false. */
  disabled?: boolean;
};

/**
 * One field with things attached to it: a prefix ("https://"), a suffix (".com"), an icon, a unit, a button. The
 * addons sit inside the same glass edge as the input, so the whole group reads as one control and shares one focus ring.
 * Use `Input`'s `leading` and `trailing` for a single icon; reach for `InputGroup` when the addon is text or a control.
 *
 * - Compose `InputGroup` > `InputGroupAddon` (a prefix or suffix) and `InputGroupInput` (the text field), in the order you want them shown.
 * - `size` follows the shared control scale, `invalid` shows the danger edge.
 * - `InputGroupText` styles plain text in an addon; put a `Button variant="ghost" size="sm"` in one for an action.
 * - Name the input with `aria-label` or a `Field` label; the addons are not part of its name unless you add `aria-describedby`.
 *
 * Keyboard: Tab goes to the input (and to a button addon); the addon text is not focusable. Accessibility: `role="group"`; the
 * input is a native `<input>`; addon icons should be `aria-hidden`; the danger edge is paired with `aria-invalid`, never colour alone.
 * Glass and motion: one `glass-1` surface with a focus ring when the input is focused; the edge colour fades.
 *
 * @example
 * ```tsx
 * import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <InputGroup>
 *       <InputGroupAddon>
 *         <InputGroupText>https://</InputGroupText>
 *       </InputGroupAddon>
 *       <InputGroupInput aria-label="Domain" placeholder="example" />
 *       <InputGroupAddon align="end">
 *         <InputGroupText>.com</InputGroupText>
 *       </InputGroupAddon>
 *     </InputGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/input-group
 */
export function InputGroup({
  size = "md",
  invalid = false,
  disabled = false,
  className,
  children,
  ...props
}: InputGroupProps) {
  return (
    <div
      role="group"
      data-slot="input-group"
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        // The field's edge is its only outline: the >= 3:1 control boundary (WCAG 1.4.11).
        "glass-1 flex w-full min-w-0 items-center overflow-hidden rounded-sheen-md border-sheen-control-border",
        fieldHeight[size],
        "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
        "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
        "data-invalid:border-sheen-danger-border data-invalid:focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-55",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Props of {@link InputGroupAddon}. */
export type InputGroupAddonProps = ComponentProps<"div"> & {
  /** Which end of the field it sits on: "start" (before the input, default) or "end". It only changes the divider side: put the addon where you want it in the markup (DOM order is the reading order and the visual order). */
  align?: "start" | "end";
};

/**
 * A prefix or suffix inside an {@link InputGroup}: text, an icon or a button. A thin divider separates it from the input.
 *
 * Keyboard: a button inside is a normal tab stop. Accessibility: plain container; keep the meaning of icons in text or `aria-label`.
 * Glass and motion: styling only.
 *
 * @example
 * ```tsx
 * import { InputGroup, InputGroupAddon, InputGroupInput } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <InputGroup>
 *       <InputGroupInput aria-label="Amount" inputMode="decimal" />
 *       <InputGroupAddon align="end">USD</InputGroupAddon>
 *     </InputGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/input-group
 */
export function InputGroupAddon({ align = "start", className, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex h-full shrink-0 items-center gap-2 px-3 text-sm text-sheen-fg-muted [&_svg]:size-4",
        align === "start" ? "border-e border-sheen-border" : "border-s border-sheen-border",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Plain text inside an {@link InputGroupAddon}: a protocol, a unit, a currency code. Rendered as a `span`.
 *
 * Keyboard and accessibility: plain text, read in order with the field. Glass and motion: styling only.
 *
 * @example
 * ```tsx
 * import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <InputGroup>
 *       <InputGroupAddon>
 *         <InputGroupText>$</InputGroupText>
 *       </InputGroupAddon>
 *       <InputGroupInput aria-label="Price" />
 *     </InputGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/input-group
 */
export function InputGroupText({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="input-group-text" className={cn("whitespace-nowrap", className)} {...props} />;
}

/**
 * The text field of an {@link InputGroup}: a native `<input>` without a border of its own, as tall as the group. Takes every
 * `input` attribute and `ref`.
 *
 * Keyboard: normal text input. Accessibility: give it an `aria-label` or a `Field` label. Glass and motion: the group draws the focus ring.
 *
 * @example
 * ```tsx
 * import { InputGroup, InputGroupInput } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <InputGroup>
 *       <InputGroupInput aria-label="Search" type="search" placeholder="Search…" />
 *     </InputGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/input-group
 */
export function InputGroupInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-sheen-fg outline-none placeholder:text-sheen-fg-subtle",
        "any-pointer-coarse:text-base disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
