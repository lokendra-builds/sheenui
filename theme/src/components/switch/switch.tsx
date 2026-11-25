"use client";

import { useId, useRef, useState, type ComponentProps, type ReactNode, type Ref } from "react";
import { motion } from "motion/react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn, classNameWith } from "../../lib/cn";
import { joinIds, useMergedRef } from "../../lib/form";
import { FieldControlShell } from "../../lib/field-control-shell";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useResolvedDirection } from "../../hooks/use-direction";
import { motionSafeProps } from "../../lib/motion-props";
import { spring } from "../../motion/tokens";
import { StateLightLayer } from "../../lib/state-light";

/** The state Base UI hands to `controlClassName` and style callbacks (`checked`, `disabled`, `readOnly`, `required`, `valid`, ...). */
export type SwitchRootState = BaseSwitch.Root.State;

/**
 * Props of `Switch`: the Base UI `Switch.Root` props plus SheenUI's own options, each documented on
 * its field.
 */
export type SwitchProps = Omit<ComponentProps<typeof BaseSwitch.Root>, "className"> & {
  /** Classes for the outer element: the `<label>` (or the wrapper holding an `error`); the control itself when there is neither. */
  className?: string;
  /** Classes for the switch track itself. Base UI's state function form works here. */
  controlClassName?: ComponentProps<typeof BaseSwitch.Root>["className"];
  /** Text next to the switch. Clicking it toggles the switch. */
  label?: ReactNode;
  /** Muted helper text under the label. Only shown together with `label`. */
  description?: ReactNode;
  /** Error message under the control. Marks it invalid (`aria-invalid`, danger border) and is announced; linked with `aria-describedby`. */
  error?: ReactNode;
  /**
   * A calm accent light round the track while it is on (`data-state="on"`, an aura on its own layer). The checked fill
   * already says "on": this is the glow only. Off with reduced transparency and forced colours.
   * @default false
   */
  stateLight?: boolean;
};

/**
 * An on/off switch for settings that apply at once (dark mode, notifications). Use `Checkbox` instead
 * when the choice is only applied after a form is submitted.
 *
 * - Controlled with `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`. Every
 *   Base UI Switch prop works (`disabled`, `readOnly`, `required`, `name`, `value`, `id`, `render`).
 * - `label` (and `description`) wrap the control in a `<label>`, so clicking the text toggles it. Without
 *   `label`, give the switch an `aria-label`.
 * - `stateLight` (`false` by default) adds a calm accent aura round the track while it is on.
 * - `className` goes on the outer element (the `<label>`, or the wrapper around an `error`); `controlClassName` on the
 *   switch track. With neither a label nor an error the track is the only element and takes both.
 *
 * Keyboard: Tab focuses it; Space toggles it, and so does Enter (it is a button, so Enter never submits a form from it).
 * Accessibility: `role="switch"` with `aria-checked`; the off track has a 3:1 border (WCAG 1.4.11);
 * touch screens get a 44px hit area. Forced colors: the "on" track fills with `Highlight`.
 * Glass and motion: `glass-1` track. The accent fill fades in on its own layer and the thumb springs
 * across, stretching toward its destination while pressed. Reduced motion: the thumb snaps and only the fill fades.
 *
 * @example
 * ```tsx
 * import { Switch } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Switch label="Email notifications" description="Weekly summary, no marketing." defaultChecked />
 *   );
 * }
 * ```
 *
 * @see /components/switch
 */
export function Switch({
  label,
  description,
  error,
  className,
  controlClassName,
  stateLight = false,
  onCheckedChange,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SwitchProps) {
  const errorId = useId();
  const labelId = useId();
  // The light follows `checked`: the prop when controlled, else the switch's own last change.
  const [ownChecked, setOwnChecked] = useState(props.defaultChecked ?? false);
  const lit = stateLight && (props.checked ?? ownChecked);
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
  // Without a label or an error the control is the only element, so `className` lands on it.
  const standalone = !label && !error;
  const control = (
    <BaseSwitch.Root
      data-slot="switch"
      className={classNameWith(controlClassName, (extra) =>
        cn(
          "group/switch glass-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-sheen-full border-sheen-control-border p-0.5",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:[background-image:var(--sheen-accent-fill)]",
          "before:opacity-0 before:transition-opacity before:duration-(--sheen-duration-base) before:ease-sheen-out data-checked:before:opacity-100",
          "transition-[border-color] duration-(--sheen-duration-base) ease-sheen-out data-checked:border-transparent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "forced-colors:data-checked:border-[Highlight]! forced-colors:data-checked:bg-[Highlight]!",
          invalid && "border-sheen-danger-border data-checked:border-transparent",
          standalone && className,
          extra,
        ),
      )}
      aria-invalid={invalid || undefined}
      // The visible label names the control from the first render (server and client), not after Base UI wires it up.
      aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
      aria-describedby={joinIds(ariaDescribedBy, error && errorId)}
      data-state={stateLight ? (lit ? "on" : "idle") : undefined}
      onCheckedChange={(next, details) => {
        setOwnChecked(next);
        onCheckedChange?.(next, details);
      }}
      {...props}
    >
      {stateLight && <StateLightLayer className="[--sl-pool:0] [--sl-edge:0] [--sl-strength:0.6]" />}
      <BaseSwitch.Thumb
        className={cn(
          "block size-5 rounded-full bg-sheen-thumb shadow-(--sheen-thumb-shadow)",
          "origin-left data-checked:origin-right rtl:origin-right rtl:data-checked:origin-left",
          "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy",
          // Press: stretch toward where the thumb is going.
          "motion-ok:group-active/switch:not-data-disabled:not-data-readonly:scale-x-[1.2]",
          "forced-colors:bg-[CanvasText] forced-colors:data-checked:bg-[HighlightText]",
        )}
        // The slide is a Motion spring on `x`, so rapid toggles keep their velocity (a CSS transition restarts from rest).
        render={(thumbProps, state) => <SwitchThumbSlide thumbProps={thumbProps} checked={state.checked} />}
      />
      {/* Invisible hit area: 44 px tall on touch screens. A real element, never ::after (glass owns it). */}
      <span aria-hidden className="sheen-hit-area" />
    </BaseSwitch.Root>
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

/** The thumb as a Motion element: springs to the checked position and carries its velocity when toggled again mid-slide. */
function SwitchThumbSlide({ thumbProps, checked }: { thumbProps: ComponentProps<"span">; checked: boolean }) {
  const reduced = useSheenReducedMotion();
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const rtl = useResolvedDirection(undefined, nodeRef) === "rtl";
  const {
    style,
    ref: baseRef,
    ...rest
  } = motionSafeProps(thumbProps as ComponentProps<"span"> & { ref?: Ref<HTMLSpanElement> });
  const thumbRef = useMergedRef(baseRef, nodeRef);
  return (
    <motion.span
      {...rest}
      ref={thumbRef}
      style={style}
      initial={false}
      animate={{ x: checked ? (rtl ? -20 : 20) : 0 }}
      transition={reduced ? { duration: 0 } : spring.snappy}
    />
  );
}
