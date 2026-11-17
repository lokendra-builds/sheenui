"use client";

import type { ComponentProps, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { useControllable } from "../../hooks/use-controllable";
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon, WarningIcon } from "../status-icons/icons";
import { motionSafeProps, type MotionSafeProps } from "../../lib/motion-props";

/** Translatable text of {@link Alert}. */
export type AlertLabels = {
  /** Accessible name of the dismiss button. */
  dismiss: string;
};

/** The English {@link AlertLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultAlertLabels: AlertLabels = { dismiss: "Dismiss" };

const tones = {
  info: "[--tint:var(--sheen-accent-soft)] text-sheen-accent border-sheen-accent-border",
  success: "[--tint:var(--sheen-success-soft)] text-sheen-success-text border-sheen-success-text/30",
  warning: "[--tint:var(--sheen-warning-soft)] text-sheen-warning-text border-sheen-warning-text/30",
  danger: "[--tint:var(--sheen-danger-soft)] text-sheen-danger-text border-sheen-danger-text/30",
} as const;

/** The colour roles of an {@link Alert}. */
export type AlertTone = keyof typeof tones;

function ToneIcon({ tone }: { tone: AlertTone }) {
  if (tone === "success") return <CheckIcon className="size-5" strokeWidth={2.4} />;
  if (tone === "warning") return <WarningIcon className="size-5" />;
  if (tone === "danger") return <AlertIcon className="size-5" />;
  return <InfoIcon className="size-5" />;
}

/** Props of {@link Alert}. The attributes of a `div` plus the ones below. */
export type AlertProps = Omit<MotionSafeProps<ComponentProps<"div">>, "title"> & {
  /** Sets the colour role and the default icon of the alert. Default "info". */
  tone?: AlertTone;
  /** A bold first line shown above the message. */
  title?: ReactNode;
  /** Replaces the tone's icon; `false` hides it. */
  icon?: ReactNode | false;
  /** A button or link at the end, such as "Undo" or "Upgrade". Keep it a real control. */
  action?: ReactNode;
  /** Show a close button. The alert hides itself when it is pressed. Default false. */
  dismissible?: boolean;
  /** Whether the alert is shown (controlled). Pair with `onOpenChange`. */
  open?: boolean;
  /** Whether the alert starts shown when uncontrolled. Default true. */
  defaultOpen?: boolean;
  /** Called with `false` when the dismiss button is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Every string, for translation. */
  labels?: Partial<AlertLabels>;
};

/**
 * An inline message that stays in the page flow: a form-level error, a saved confirmation, a plan limit.
 * Use `Toast` for a message that should vanish by itself and `Dialog` when the person must answer first.
 *
 * - `tone` is "info", "success", "warning" or "danger"; each has its own icon and colour. The words always carry
 *   the meaning, colour is only a hint.
 * - `title` is the bold first line, `children` the explanation, `action` a button or link on the end.
 * - `dismissible` adds a close button; `open` / `defaultOpen` / `onOpenChange` control whether it is shown.
 * - `role` defaults to "alert" (announced at once) for "danger" and "warning" and to "status" (announced politely)
 *   for "info" and "success". Pass `role="none"` for a message that is already on screen when the page loads.
 *
 * Keyboard: the alert itself is not focusable; the dismiss button and `action` are normal tab stops (Enter or Space).
 * Accessibility: live-region role per tone; the icon is decorative; the dismiss button is named by `labels.dismiss` and is
 * 44px on touch screens; text keeps 4.5:1 on the tinted surface in light, dark and forced colors.
 * Glass and motion: a near-opaque tinted surface with a coloured edge (no backdrop blur). It rises 6px and fades in, and leaves
 * with a shorter fade; reduced motion fades only.
 *
 * @example
 * ```tsx
 * import { Alert, Button } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Alert tone="warning" title="Your trial ends in 3 days" action={<Button size="sm">Upgrade</Button>} dismissible>
 *       Add a payment method to keep your projects.
 *     </Alert>
 *   );
 * }
 * ```
 *
 * @see /components/alert
 */
export function Alert({
  tone = "info",
  title,
  icon,
  action,
  dismissible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  labels: labelsProp,
  role,
  className,
  children,
  ...props
}: AlertProps) {
  const labels = { ...defaultAlertLabels, ...labelsProp };
  const reduced = useSheenReducedMotion();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const resolvedRole = role ?? (tone === "danger" || tone === "warning" ? "alert" : "status");

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="alert"
          {...motionSafeProps(props)}
          role={resolvedRole === "none" ? undefined : resolvedRole}
          data-slot="alert"
          data-tone={tone}
          initial={{ opacity: 0, y: reduced ? 0 : -6 }}
          animate={{ opacity: 1, y: 0, transition: reduced ? { duration: duration.fast } : spring.smooth }}
          exit={{ opacity: 0, y: 0, transition: { duration: duration.exit, ease: ease.exit } }}
          className={cn(
            "relative flex w-full items-start gap-3 rounded-sheen-lg border p-4 text-sm",
            // The tint sits over a near-opaque surface, so text keeps contrast on glass, photos and blobs.
            "bg-sheen-surface/90 [background-image:linear-gradient(var(--tint),var(--tint))]",
            "shadow-[inset_0_1px_0_var(--sheen-glass-highlight)]",
            "forced-colors:border-[CanvasText]",
            tones[tone],
            className,
          )}
        >
          {icon !== false && (
            <span aria-hidden className="mt-0.5 flex shrink-0">
              {icon ?? <ToneIcon tone={tone} />}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sheen-fg">
            {title && <p className="font-semibold">{title}</p>}
            {children && (
              <div className={cn("leading-relaxed", title ? "text-sheen-fg-muted" : "text-sheen-fg")}>{children}</div>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center self-center">{action}</div>}
          {dismissible && (
            <button
              type="button"
              aria-label={labels.dismiss}
              onClick={() => setOpen(false)}
              className={cn(
                "relative -my-1 -me-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
                "transition-[background-color,color] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover hover:text-sheen-fg",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
                "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-11 any-pointer-coarse:after:-translate-1/2",
              )}
            >
              <CloseIcon className="size-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
