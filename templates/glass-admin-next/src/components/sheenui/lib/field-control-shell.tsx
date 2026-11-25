import type { ReactNode } from "react";

import { cn } from "./cn";

/** Props of {@link FieldControlShell}. */
export type FieldControlShellProps = {
  /** The control itself (a Switch track, a Checkbox box). */
  control: ReactNode;
  /** Text next to the control; it and the control share one `<label>`. Without it, the control stands alone. */
  label?: ReactNode;
  /** Secondary line under the label, inside the same `<label>`. Only shown with `label`. */
  description?: ReactNode;
  /** Error text, shown as an alert below. It needs `errorId` so the control can point at it. */
  error?: ReactNode;
  /** The id the label text takes, so the control can name itself from it (`aria-labelledby`) on the first render instead of waiting for Base UI to wire it up after hydration. */
  labelId?: string;
  /** The id the error paragraph takes (the control's `aria-describedby`). */
  errorId: string;
  /** Classes for the outermost element: the `<label>`, the wrapper holding an `error`, or the bare control's own. */
  className?: string;
};

/**
 * The label, description and error layout Switch and Checkbox share. The outer element, which takes `className`,
 * depends on what is set: the `<label>` when only a label is, a `<div>` wrapper once there is an `error`, and with
 * neither label nor error no wrapper at all (the caller puts `className` on the control).
 *
 * @internal Not part of the public barrel: the example documents the module's own helpers.
 * @example
 * ```tsx
 * import { FieldControlShell } from "./field-control-shell";
 *
 * export const Row = () => (
 *   <FieldControlShell control={<input type="checkbox" />} label="Agree" errorId="agree-error" error="Required" />
 * );
 * ```
 *
 * @see /components/switch
 */
export function FieldControlShell({
  control,
  label,
  description,
  error,
  errorId,
  labelId,
  className,
}: FieldControlShellProps) {
  const message = error ? (
    <p id={errorId} role="alert" className="text-xs font-medium text-sheen-danger-text">
      {error}
    </p>
  ) : null;

  if (!label)
    return message ? (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {control}
        {message}
      </div>
    ) : (
      control
    );

  const field = (
    <label className={cn("flex cursor-pointer items-start gap-3", message ? undefined : className)}>
      <span className="pt-0.5">{control}</span>
      <span className="flex flex-col gap-0.5">
        <span id={labelId} className="text-sm font-medium">
          {label}
        </span>
        {description && <span className="text-xs text-sheen-fg-muted">{description}</span>}
      </span>
    </label>
  );
  return message ? (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {field}
      {message}
    </div>
  ) : (
    field
  );
}
