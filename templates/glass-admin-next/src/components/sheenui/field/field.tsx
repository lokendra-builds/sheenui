"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";

import { cn } from "../lib/cn";
import { joinIds, useMergedRef } from "../lib/form";

/**
 * What a control receives from its {@link Field}: spread it on the control (or let {@link FieldControl} do it).
 * It also carries the event handlers and the `ref` Base UI uses for validation and focus tracking, so spread the whole object.
 */
export type FieldControlRenderProps = {
  /** Id for the control; the label's `for` points at it. */
  id: string;
  /** Ids of the description and the error message, when they are rendered. */
  "aria-describedby": string | undefined;
  /** The label's id, so the control is named even when it is not a labelable element. */
  "aria-labelledby": string | undefined;
  /** "true" while the field is invalid. */
  "aria-invalid": true | undefined;
  /** Required marker for the control. */
  required: boolean | undefined;
  /** Disabled state for the control. */
  disabled: boolean | undefined;
};

/** The state of the surrounding {@link Field}, as read by {@link useField}. */
export type FieldState = {
  /** Id of the control when `controlId` was given; otherwise Base UI generates it. */
  controlId: string | undefined;
  /** Whether the field is marked invalid. */
  invalid: boolean;
  /** Whether the field is marked required. */
  required: boolean;
  /** Whether the field is disabled. */
  disabled: boolean;
};

const FieldContext = createContext<FieldState | null>(null);

/**
 * The state of the surrounding {@link Field} (`invalid`, `required`, `disabled`, `controlId`). The ids and the
 * aria wiring are handled by Base UI's Field underneath. Use it to build your own field parts. Returns `null` outside a `Field`.
 *
 * @example
 * ```tsx
 * import { useField } from "@sheenui/theme";
 *
 * export function FieldHint() {
 *   const field = useField();
 *   return <span>{field?.invalid ? "Fix this field" : "Looks good"}</span>;
 * }
 * ```
 *
 * @see /forms/field
 */
export function useField() {
  return useContext(FieldContext);
}

/** Props of {@link Field}. The attributes of a `div` plus the ones below. */
export type FieldProps = ComponentProps<"div"> & {
  /** Marks the field invalid: the control gets `aria-invalid` and `FieldError` is shown. Default false. */
  invalid?: boolean;
  /** Disables the control inside the field. Default false. */
  disabled?: boolean;
  /** Marks the control required and adds an asterisk to the label. Default false. */
  required?: boolean;
  /**
   * Id of the control; a generated one is used when omitted.
   *
   * @default generated
   */
  controlId?: string;
};

/**
 * A form field wrapper that wires a label, a description and an error message to any control. It is Base UI's Field
 * (the same one `Input`, `Textarea` and `NumberField` use), so there is one wiring mechanism: put a `FieldLabel`, one
 * control and optional `FieldDescription` and `FieldError` in it. Base UI generates the ids, so the label names the control,
 * the description and the error are read with it, and an invalid state is announced.
 *
 * - `invalid` shows `FieldError` and sets `aria-invalid` on the control; `required` and `disabled` reach the control too.
 * - A control's own `disabled`, `required`, `aria-invalid`, `id` and `aria-describedby` are kept: the field's values are merged in, never overwritten.
 * - It also works with react-hook-form: pass `invalid={fieldState.invalid}` and the message as the `FieldError` children.
 * - Base UI controls (`Switch`, `Checkbox`, `Select`, `Slider`, `Input`) join the field on their own; use `FieldControl` for a native
 *   element or your own component. `Input`, `Select` and the other form components also take `label`, `description` and `error` directly.
 *
 * Keyboard: the field adds no tab stops; clicking the label focuses the control. Accessibility: `<label for>` names the control,
 * `aria-describedby` lists the description and the error (only while they are rendered), `FieldError` is an alert (announced at once), and
 * the required asterisk is hidden from screen readers (the control carries `required`).
 * Glass and motion: layout only, no surface. The error rises 6px into place; reduced motion shows it at once.
 *
 * @example
 * ```tsx
 * import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Field required invalid>
 *       <FieldLabel>Email</FieldLabel>
 *       <FieldControl>
 *         <input type="email" />
 *       </FieldControl>
 *       <FieldDescription>We only use it to send receipts.</FieldDescription>
 *       <FieldError>Enter a valid email address.</FieldError>
 *     </Field>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function Field({
  invalid = false,
  disabled = false,
  required = false,
  controlId,
  className,
  children,
  ...props
}: FieldProps) {
  const value = useMemo<FieldState>(
    () => ({ controlId, invalid, required, disabled }),
    [controlId, invalid, required, disabled],
  );
  return (
    <FieldContext value={value}>
      <BaseField.Root
        invalid={invalid}
        disabled={disabled}
        data-slot="field"
        className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
        {...props}
      >
        {children}
      </BaseField.Root>
    </FieldContext>
  );
}

/** Props of {@link Label}. The attributes of a `label` plus the ones below. */
export type LabelProps = ComponentProps<"label"> & {
  /** Adds an asterisk after the text. It is decorative: mark the control `required` for assistive tech. Default false. */
  required?: boolean;
  /** Text shown after the label, such as "(optional)", muted. */
  hint?: ReactNode;
};

/**
 * A text label for a control. Standalone, give it `htmlFor`; inside a `Field` use `FieldLabel`, which fills it in.
 * Clicking it focuses or toggles the control it names.
 *
 * Keyboard: not focusable. Accessibility: a real `<label>`; the asterisk is `aria-hidden`.
 * Glass and motion: plain text, no motion.
 *
 * @example
 * ```tsx
 * import { Label } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Label htmlFor="nick" hint="(optional)">Nickname</Label>
 *       <input id="nick" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function Label({ required = false, hint, className, children, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn("w-fit text-sm font-medium text-sheen-fg select-none", "data-disabled:opacity-60", className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden className="ms-0.5 text-sheen-danger-text">
          *
        </span>
      )}
      {hint && <span className="ms-1.5 font-normal text-sheen-fg-muted">{hint}</span>}
    </label>
  );
}

/**
 * The label of a {@link Field}: `Label` already pointing at the field's control, with the required asterisk.
 *
 * Keyboard: not focusable; clicking it focuses the control. Accessibility: a real `<label for>`.
 * Glass and motion: plain text, no motion.
 *
 * @example
 * ```tsx
 * import { Field, FieldControl, FieldLabel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Field>
 *       <FieldLabel>Name</FieldLabel>
 *       <FieldControl><input /></FieldControl>
 *     </Field>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function FieldLabel({ children, ...props }: Omit<LabelProps, "htmlFor" | "required">) {
  const field = useField();
  return (
    <BaseField.Label
      render={(labelProps) => (
        <Label {...(labelProps as ComponentProps<"label">)} required={field?.required}>
          {children}
        </Label>
      )}
      {...props}
    />
  );
}

/**
 * Muted helper text under the control; its id is added to the control's `aria-describedby` while it is rendered.
 *
 * Keyboard: not focusable. Accessibility: read with the control as its description. Glass and motion: plain text.
 *
 * @example
 * ```tsx
 * import { Field, FieldControl, FieldDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Field>
 *       <FieldControl><input aria-label="Name" /></FieldControl>
 *       <FieldDescription>Shown on your profile.</FieldDescription>
 *     </Field>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn("text-xs text-sheen-fg-muted", className)}
      {...props}
    />
  );
}

/** Props of {@link FieldError}. */
export type FieldErrorProps = ComponentProps<"p"> & {
  /** Show it even when the field is not marked `invalid` (for example a server error you render yourself). Default false. */
  forceMatch?: boolean;
};

/**
 * The error message of a {@link Field}. It renders only while the field is `invalid` (or `forceMatch`), as an alert (announced at once),
 * and its id is added to the control's `aria-describedby`.
 *
 * Keyboard: not focusable. Accessibility: `role="alert"`, so it is announced when it appears. Glass and motion: the text
 * rises 6px into place; reduced motion shows it at once.
 *
 * @example
 * ```tsx
 * import { Field, FieldControl, FieldError } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Field invalid>
 *       <FieldControl><input aria-label="Name" /></FieldControl>
 *       <FieldError>Name is required.</FieldError>
 *     </Field>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function FieldError({ forceMatch = false, className, children, ...props }: FieldErrorProps) {
  const field = useField();
  const show = Boolean(children) && (forceMatch || (field?.invalid ?? true));
  return (
    <BaseField.Error
      match={show}
      role="alert"
      data-slot="field-error"
      className={cn(
        "text-xs font-medium text-sheen-danger-text motion-ok:animate-[sheen-panel-in_var(--sheen-duration-fast)_var(--sheen-ease-out)_both]",
        className,
      )}
      {...props}
    >
      {children}
    </BaseField.Error>
  );
}

/** Props of {@link FieldControl}. */
export type FieldControlProps = {
  /** One control element, or a function that gets the wiring props and returns the control. */
  children: ReactElement<Partial<FieldControlRenderProps>> | ((props: FieldControlRenderProps) => ReactNode);
};

type WiringProps = Record<string, unknown> & { ref?: Ref<HTMLElement> };

/** The element form of FieldControl: merges the field's wiring into the control's own props (the control's own values win). */
function WiredControl({
  wiring,
  control,
  required,
}: {
  wiring: WiringProps;
  control: ReactElement<WiringProps>;
  required: boolean;
}) {
  const own = control.props;
  const ref = useMergedRef<HTMLElement>(wiring.ref, own.ref);
  const merged: WiringProps = mergeProps(wiring, own) as WiringProps;
  merged.ref = ref;
  merged["aria-describedby"] = joinIds(own["aria-describedby"], wiring["aria-describedby"]);
  // A control that is invalid on its own stays invalid, whatever the field says; the field can only add the flag.
  const ownInvalid = own["aria-invalid"];
  merged["aria-invalid"] =
    ownInvalid !== undefined && ownInvalid !== false && ownInvalid !== "false" ? ownInvalid : wiring["aria-invalid"];
  for (const key of ["id", "disabled", "required"] as const) if (own[key] !== undefined) merged[key] = own[key];
  if (own.required === undefined && required) merged.required = true;
  return cloneElement(control, merged);
}

/**
 * Wires the one control inside it to its {@link Field}: the element gets `id`, `aria-describedby`, `aria-invalid`,
 * `required` and `disabled`. The control's own props win: its `disabled`, `required`, `aria-invalid` and `id` are kept,
 * its `aria-describedby` is joined with the field's ids, and its event handlers and `ref` are composed. Pass a function
 * to place the props yourself (its type is `FieldControlRenderProps`). Outside a `Field` the element is returned as it is and a function child renders nothing, because there is no field to wire.
 *
 * @example
 * ```tsx
 * import { Field, FieldControl, FieldLabel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Field>
 *       <FieldLabel>Plan</FieldLabel>
 *       <FieldControl>{(props) => <select {...props}><option>Free</option></select>}</FieldControl>
 *     </Field>
 *   );
 * }
 * ```
 *
 * @see /forms/field
 */
export function FieldControl({ children }: FieldControlProps) {
  const field = useField();
  if (!field) return typeof children === "function" ? null : children;
  if (typeof children === "function") {
    return (
      <BaseField.Control
        id={field.controlId}
        render={(props) => {
          const wired = { ...props, required: field.required || undefined } as unknown as FieldControlRenderProps;
          return <>{children(wired)}</>;
        }}
      />
    );
  }
  if (!isValidElement<WiringProps>(children)) return children;
  const own = children.props;
  return (
    <BaseField.Control
      id={typeof own.id === "string" ? own.id : field.controlId}
      disabled={typeof own.disabled === "boolean" ? own.disabled : undefined}
      render={(props) => <WiredControl wiring={props as WiringProps} control={children} required={field.required} />}
    />
  );
}

/** Props of {@link FieldLabel}. The label of a {@link Field}: `Label` already pointing at the field's control, with the required asterisk. */
export type FieldLabelProps = ComponentProps<typeof FieldLabel>;

/** Props of {@link FieldDescription}. Muted helper text under the control; its id is added to the control's `aria-describedby` while it is rendered. */
export type FieldDescriptionProps = ComponentProps<typeof FieldDescription>;
