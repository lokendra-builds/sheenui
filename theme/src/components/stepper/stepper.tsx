"use client";

import { AlertIcon, CheckIcon } from "../status-icons/icons";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/form";

/** State of a stepper step: `complete`, `current`, `upcoming` or `error`. */
export type StepStatus = "complete" | "current" | "upcoming" | "error";

/** One step of a `Stepper`: its title, optional description and an optional status override. */
export type StepperStep = {
  /** The step's name. */
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** Override the status derived from `current` (e.g. "error"). */
  status?: StepStatus;
  /** Shows the "Optional" hint. */
  optional?: boolean;
  /** Replaces the step number (complete steps still show a check, errors an alert). */
  icon?: ReactNode;
  /** Not clickable even when other steps are. */
  disabled?: boolean;
  /** Vertical only: content shown under the step while it is current. */
  content?: ReactNode;
  /** Stable key (defaults to the position). */
  id?: string;
};

/**
 * Every user-facing string of `Stepper` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type StepperLabels = {
  /** Accessible name of the <nav>. */
  nav: string;
  /** Compact (phone) header, e.g. "Step 2 of 5". */
  stepOf: (step: number, total: number) => string;
  /** Status words read after each step's title. */
  complete: string;
  /** Status word for the current step. */
  current: string;
  /** Status word for a step not started yet. */
  upcoming: string;
  /** Status word for a step that needs attention. */
  error: string;
  /**
   * Screen-reader text appended to a step's title, built from its status words (one word, or
   * two for a current step with an error: [current, error]). Punctuation included.
   */
  status: (words: string[]) => string;
  /** Hint shown on steps marked `optional`. */
  optional: string;
  /** Compact view: the line naming the next step. `title` is that step's title. */
  next: (title: ReactNode) => ReactNode;
  /** Compact view: shown once every step is complete. */
  done: string;
};

/**
 * Default English strings of `StepperLabels`; spread it and override single keys to reword. Plain data
 * with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React Server
 * Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultStepperLabels: StepperLabels = {
  nav: "Progress",
  stepOf: (step, total) => `Step ${step} of ${total}`,
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  error: "needs attention",
  status: (words) => `, ${words.join(", ")}`,
  optional: "Optional",
  next: (title) => (
    <>
      Next: <strong>{title}</strong>
    </>
  ),
  done: "All steps complete",
};

/** Props of `Stepper`; each option is documented on its field. */
export type StepperProps = {
  /** The steps to show, in order. */
  steps: StepperStep[];
  /** Index of the current step (0-based). `steps.length` = all complete. */
  current: number;
  /** Direction the steps are laid out in. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Horizontal only: labels under the dots ("bottom", default) or beside them ("end"). */
  labelPlacement?: "bottom" | "end";
  /** Makes steps clickable buttons. */
  onStepClick?: (index: number) => void;
  /** Which steps `onStepClick` applies to: "completed" (default) or "all". */
  clickable?: "completed" | "all";
  /** Horizontal only: "auto" (default) collapses to "Step x of y" when there is not enough room. */
  collapse?: "auto" | "always" | "never";
  /** Room (px) each step needs before "auto" collapses. Default 136. */
  minStepWidth?: number;
  /** Sets the dot and text size. Default "md". */
  size?: "sm" | "md";
  /** Override the strings (i18n). Give each stepper on a page its own `nav`. */
  labels?: Partial<StepperLabels>;
  /** Extra classes for the `<nav>` that wraps the steps (set its width or spacing here). */
  className?: string;
};

function statusOf(step: StepperStep, index: number, current: number): StepStatus {
  if (step.status) return step.status;
  if (index < current) return "complete";
  return index === current ? "current" : "upcoming";
}

/** Screen-reader status text for a step. The current step says so even when its status is overridden. */
function statusText(labels: StepperLabels, status: StepStatus, isCurrent: boolean) {
  const words = isCurrent && status !== "current" ? [labels.current, labels[status]] : [labels[status]];
  return labels.status(words);
}

/** How a step's header renders: a real button, the current step (an inert button), or plain. */
type ControlMode = "clickable" | "current" | "static";

/**
 * Keeps keyboard focus in the stepper when `current` changes. If focus was inside the stepper
 * and the focused element is gone (the current step's content unmounted, say), focus moves to
 * the new current step's header. Focus that moved elsewhere on purpose is left alone.
 */
function useFocusFollowsCurrent(navRef: RefObject<HTMLElement | null>, current: number, focusIndex: number) {
  const inside = useRef(false);
  const previous = useRef(current);

  useLayoutEffect(() => {
    if (previous.current === current) return;
    previous.current = current;
    const nav = navRef.current;
    if (!nav || !inside.current) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    nav.querySelector<HTMLElement>(`[data-step-index="${focusIndex}"]`)?.focus();
  }, [current, focusIndex, navRef]);

  return {
    onFocus: () => {
      inside.current = true;
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      const nav = navRef.current;
      const next = event.relatedTarget as Node | null;
      if (next) {
        inside.current = Boolean(nav?.contains(next));
        return;
      }
      // Focus went nowhere: a click on the page, or the focused element was removed. Decide
      // after this frame, so a `current` change committing right now still sees "inside".
      requestAnimationFrame(() => {
        const active = document.activeElement;
        inside.current = Boolean(nav && active && active !== document.body && nav.contains(active));
      });
    },
  };
}

/**
 * Stagger for the connector fills: when you jump several steps, the lines fill one after
 * another in the direction of travel (ms). Only lines that change state are delayed.
 */
function useConnectorDelays(current: number) {
  const previous = useRef(current);
  const from = previous.current;
  useEffect(() => {
    previous.current = current;
  });
  return (i: number) => {
    if (current > from && i >= from && i < current) return (i - from) * 140;
    if (current < from && i >= current && i < from) return (from - 1 - i) * 90;
    return 0;
  };
}

/** The element's content width, measured before paint and kept current with a ResizeObserver. */
function useWidth() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  // The first measurement happens in the ref callback (during commit, before paint); the observer keeps it current.
  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
    if (node) setWidth(Math.floor(node.clientWidth));
  }, []);
  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [ref, width] as const;
}

/**
 * Stepper: progress through a multi-step flow (checkout, onboarding, setup wizards). Use `Progress` for a single percentage and `Tabs` for sections that can be visited in any order.
 *
 * - Statuses come from `current` (before = complete, at = current, after = upcoming); any step can override it, e.g. `status: "error"` for a step that failed validation. `current={steps.length}` marks the whole flow complete.
 * - Horizontal (labels under or beside the dots) or vertical (with optional per-step `content` shown under the current step).
 * - The connecting lines fill with the accent as you advance, one after another when you jump several steps (transform only; instant under reduced motion).
 * - Clickable steps: pass `onStepClick`. By default only completed steps are clickable (`clickable="all"` allows jumping ahead). Clickable steps are real buttons. The current step is then a button too (`aria-disabled`), so keyboard focus
 *   stays on a step you activate. If the focused element disappears when `current` changes (e.g. a "Continue" button inside a vertical step's content), focus moves to the new current step instead of the page.
 * - Phones: a horizontal stepper that runs out of room collapses to "Step 2 of 5", the current title and a segmented progress bar (the full list stays available to screen readers). `collapse` forces or forbids it.
 *
 * Keyboard: clickable steps are normal tab stops; Enter or Space activates; non-clickable steps are not focusable.
 * Accessibility: `<nav aria-label="Progress"><ol>`, `aria-current="step"` on the current step (also when it has an error), and status words on every step for screen readers. All strings are props (`labels`); give each stepper on a page its own `labels.nav`.
 * Glass and motion: flat dots and lines (no backdrop blur). Connectors fill with transforms only; reduced motion makes them instant.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { Stepper } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [current, goTo] = useState(1);
 *   return (
 *     <Stepper
 *       current={current}
 *       steps={[{ title: "Account" }, { title: "Shipping" }, { title: "Payment", optional: true }]}
 *       onStepClick={(index) => goTo(index)}
 *     />
 *   );
 * }
 * ```
 *
 * @see /layout/stepper
 */
export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  labelPlacement = "bottom",
  onStepClick,
  clickable = "completed",
  collapse = "auto",
  minStepWidth = 136,
  size = "md",
  labels: labelsProp,
  className,
}: StepperProps) {
  const labels = { ...defaultStepperLabels, ...labelsProp };
  const [measureRef, width] = useWidth();
  const navRef = useRef<HTMLElement | null>(null);
  const setNavRef = useMergedRef(navRef, measureRef);
  const delayFor = useConnectorDelays(current);
  const n = steps.length;
  const horizontal = orientation === "horizontal";
  const compact =
    horizontal && n > 1 && (collapse === "always" || (collapse === "auto" && width > 0 && width < n * minStepWidth));
  // The step that receives focus when focus has to move (the last one once all are complete).
  const focusIndex = Math.max(0, Math.min(current, n - 1));
  const focusHandlers = useFocusFollowsCurrent(navRef, current, focusIndex);

  const modeOf = (i: number): ControlMode => {
    if (!onStepClick) return "static";
    if (i === current) return "current";
    return !steps[i]?.disabled && (clickable === "all" || i < current) ? "clickable" : "static";
  };

  const sizeVars = { "--ind": size === "sm" ? "1.75rem" : "2rem" } as CSSProperties;

  return (
    <nav
      ref={setNavRef}
      aria-label={labels.nav}
      data-slot="stepper"
      className={cn("w-full min-w-0", className)}
      style={sizeVars}
      {...focusHandlers}
    >
      {n === 0 ? null : compact ? (
        <CompactStepper steps={steps} current={current} labels={labels} size={size} delayFor={delayFor} />
      ) : horizontal ? (
        <ol className={cn("flex w-full min-w-0", labelPlacement === "end" ? "items-center" : "items-start")}>
          {steps.map((step, i) => {
            const status = statusOf(step, i, current);
            const isCurrent = i === current;
            const last = i === n - 1;
            const control = (
              <StepControl
                index={i}
                mode={modeOf(i)}
                focusTarget={i === focusIndex}
                onClick={onStepClick}
                className={cn(
                  labelPlacement === "bottom"
                    ? "flex max-w-full flex-col items-center gap-2 px-2 pb-1 text-center"
                    : "flex min-w-0 items-center gap-3 pe-1 text-start",
                )}
              >
                <StepIndicator status={status} index={i} icon={step.icon} size={size} />
                <StepText
                  step={step}
                  status={status}
                  labels={labels}
                  srStatus={statusText(labels, status, isCurrent)}
                  align={labelPlacement === "bottom" ? "center" : "start"}
                />
              </StepControl>
            );
            return labelPlacement === "bottom" ? (
              <li
                key={step.id ?? i}
                aria-current={isCurrent ? "step" : undefined}
                className="relative flex min-w-0 flex-1 flex-col items-center"
              >
                {!last && (
                  <Connector
                    filled={i < current}
                    delay={delayFor(i)}
                    className="absolute start-[calc(50%+var(--ind)/2+0.5rem)] end-[calc(-50%+var(--ind)/2+0.5rem)] top-[calc(var(--ind)/2-1px)]"
                  />
                )}
                {control}
              </li>
            ) : (
              <li
                key={step.id ?? i}
                aria-current={isCurrent ? "step" : undefined}
                className={cn("flex min-w-0 items-center", !last && "flex-1")}
              >
                {control}
                {!last && <Connector filled={i < current} delay={delayFor(i)} className="mx-3 min-w-6 flex-1" />}
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="flex flex-col">
          {steps.map((step, i) => {
            const status = statusOf(step, i, current);
            const isCurrent = i === current;
            const last = i === n - 1;
            return (
              <li
                key={step.id ?? i}
                aria-current={isCurrent ? "step" : undefined}
                className={cn("relative flex min-w-0 flex-col", !last && "pb-7")}
              >
                {!last && (
                  <Connector
                    vertical
                    filled={i < current}
                    delay={delayFor(i)}
                    className="absolute start-[calc(var(--ind)/2-1px)] top-[calc(var(--ind)+0.5rem)] bottom-2"
                  />
                )}
                <StepControl
                  index={i}
                  mode={modeOf(i)}
                  focusTarget={i === focusIndex}
                  onClick={onStepClick}
                  className="flex min-w-0 items-start gap-3.5 self-start text-start"
                >
                  <StepIndicator status={status} index={i} icon={step.icon} size={size} />
                  <StepText
                    step={step}
                    status={status}
                    labels={labels}
                    srStatus={statusText(labels, status, isCurrent)}
                    align="start"
                    className={size === "sm" ? "pt-1" : "pt-1.5"}
                  />
                </StepControl>
                {isCurrent && step.content && (
                  <div
                    data-slot="stepper-content"
                    className="min-w-0 ps-[calc(var(--ind)+0.875rem)] pt-3 motion-ok:animate-[sheen-panel-in_var(--sheen-duration-slow)_var(--sheen-ease-out)]"
                  >
                    {step.content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

/* ---------- Parts ---------- */

function StepControl({
  index,
  mode,
  focusTarget,
  onClick,
  className,
  children,
}: {
  index: number;
  mode: ControlMode;
  /** Plain steps: make this one focusable from script (where focus goes when it has to move). */
  focusTarget: boolean;
  onClick?: (index: number) => void;
  className?: string;
  children: ReactNode;
}) {
  const base = cn(
    "relative min-w-0 rounded-sheen-md",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
    className,
  );
  if (mode === "static") {
    return (
      <div data-step-index={index} tabIndex={focusTarget ? -1 : undefined} className={base}>
        {children}
      </div>
    );
  }
  const interactive = mode === "clickable";
  return (
    <button
      type="button"
      data-step-index={index}
      // The current step stays a button (so focus survives activating a step) but does nothing.
      aria-disabled={interactive ? undefined : true}
      onClick={interactive ? () => onClick?.(index) : undefined}
      className={cn(
        base,
        // Only steps that act on a click get the hover affordances (group/step) and the hand cursor.
        interactive ? "group/step cursor-pointer" : "cursor-default",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        // 44px tall hit area on touch screens.
        "any-pointer-coarse:min-h-11",
      )}
    >
      {children}
    </button>
  );
}

const tinted = "bg-sheen-surface/85 [background-image:linear-gradient(var(--tint),var(--tint))]";

function StepIndicator({
  status,
  index,
  icon,
  size,
}: {
  status: StepStatus;
  index: number;
  icon?: ReactNode;
  size: "sm" | "md";
}) {
  const box = cn(
    "relative z-10 grid size-(--ind) shrink-0 place-items-center rounded-full font-semibold tabular-nums select-none",
    size === "sm" ? "text-xs [&_svg]:size-3.5" : "text-sm [&_svg]:size-4",
    // Clickable steps lift a touch under the pointer.
    "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy motion-ok:group-hover/step:scale-110",
  );

  if (status === "complete") {
    return (
      <span
        data-status={status}
        className={cn(
          box,
          "sheen-fill text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-(--sheen-accent-fill-shadow)",
        )}
      >
        {/* Remounts on completion, so the check pops in (transform/opacity keyframes). */}
        <CheckIcon
          strokeWidth={2.25}
          className="motion-ok:animate-[sheen-pop_var(--sheen-duration-slow)_var(--sheen-ease-out)_both]"
        />
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        data-status={status}
        className={cn(
          box,
          tinted,
          "border-2 border-sheen-danger text-sheen-danger-text [--tint:var(--sheen-danger-soft)]",
          "motion-ok:animate-[sheen-shake_var(--sheen-duration-slower)_var(--sheen-ease-out)]",
        )}
      >
        <AlertIcon strokeWidth={2.25} />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span
        data-status={status}
        className={cn(
          box,
          tinted,
          "border-2 border-sheen-accent text-sheen-accent [--tint:var(--sheen-accent-soft)]",
          // Soft halo; it eases in when the step becomes current.
          "ring-4 ring-sheen-accent-soft motion-ok:animate-[sheen-pop_var(--sheen-duration-slow)_var(--sheen-ease-out)]",
          "forced-colors:border-[Highlight]",
        )}
      >
        {icon ?? index + 1}
      </span>
    );
  }

  return (
    <span data-status={status} className={cn(box, "glass-1 text-sheen-fg-muted")}>
      {icon ?? index + 1}
    </span>
  );
}

function StepText({
  step,
  status,
  labels,
  srStatus,
  align,
  className,
}: {
  step: StepperStep;
  status: StepStatus;
  labels: StepperLabels;
  /** Screen-reader status text, punctuation included (labels.status). */
  srStatus: string;
  align: "center" | "start";
  className?: string;
}) {
  return (
    <span
      className={cn("flex min-w-0 flex-col gap-0.5", align === "center" ? "items-center" : "items-start", className)}
    >
      <span
        className={cn(
          "text-sm leading-5 font-medium text-pretty [overflow-wrap:anywhere]",
          status === "upcoming"
            ? "text-sheen-fg-muted"
            : status === "error"
              ? "text-sheen-danger-text"
              : "text-sheen-fg",
          // group/step exists only on clickable steps.
          "group-hover/step:underline group-hover/step:decoration-sheen-fg-subtle group-hover/step:underline-offset-4",
        )}
      >
        {step.title}
        <span className="sr-only">{srStatus}</span>
      </span>
      {step.optional && <span className="text-2xs font-medium text-sheen-fg-subtle">{labels.optional}</span>}
      {step.description && (
        <span
          className={cn(
            "text-xs text-pretty [overflow-wrap:anywhere]",
            status === "error" ? "text-sheen-danger-text" : "text-sheen-fg-muted",
          )}
        >
          {step.description}
        </span>
      )}
    </span>
  );
}

function Connector({
  filled,
  delay,
  vertical = false,
  className,
}: {
  filled: boolean;
  delay: number;
  vertical?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none block overflow-hidden rounded-full bg-sheen-fg-subtle/25",
        vertical ? "w-0.5" : "h-0.5",
        // High contrast replaces background colours: draw the track in GrayText.
        "forced-colors:bg-[GrayText] forced-colors:[forced-color-adjust:none]",
        className,
      )}
    >
      <span
        style={{ transitionDelay: `${delay}ms` }}
        className={cn(
          "sheen-fill block size-full [background-image:var(--sheen-accent-fill)]",
          vertical ? "origin-top" : "origin-left rtl:origin-right",
          filled ? "scale-100" : vertical ? "scale-y-0" : "scale-x-0",
          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-slower) motion-ok:ease-sheen-out",
        )}
      />
    </span>
  );
}

/** Phones: "Step 2 of 5", the current title and a segmented bar. The list stays in the a11y tree. */
function CompactStepper({
  steps,
  current,
  labels,
  size,
  delayFor,
}: {
  steps: StepperStep[];
  current: number;
  labels: StepperLabels;
  size: "sm" | "md";
  delayFor: (i: number) => number;
}) {
  const n = steps.length;
  const done = current >= n;
  const index = Math.min(Math.max(current, 0), n - 1);
  const step = steps[index];
  if (!step) return null;
  const status = done ? "complete" : statusOf(step, index, current);
  const next = done ? undefined : steps[index + 1];

  return (
    <div data-slot="stepper-compact" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <StepIndicator status={status} index={index} icon={step.icon} size={size} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-xs font-medium text-sheen-fg-muted tabular-nums">
            {done ? labels.done : labels.stepOf(index + 1, n)}
          </p>
          <p
            className={cn(
              "text-sm font-semibold [overflow-wrap:anywhere]",
              status === "error" ? "text-sheen-danger-text" : "text-sheen-fg",
            )}
          >
            {step.title}
            {step.optional && <span className="ms-2 text-2xs font-medium text-sheen-fg-subtle">{labels.optional}</span>}
          </p>
        </div>
      </div>
      <ol className="flex gap-1">
        {steps.map((s, i) => {
          const st = done ? "complete" : statusOf(s, i, current);
          const isCurrent = !done && i === current;
          return (
            <li key={s.id ?? i} aria-current={isCurrent ? "step" : undefined} className="relative flex-1">
              <span
                aria-hidden
                className="block h-1.5 overflow-hidden rounded-full bg-sheen-fg-subtle/25 forced-colors:bg-[GrayText] forced-colors:[forced-color-adjust:none]"
              >
                <span
                  style={{ transitionDelay: `${delayFor(i)}ms` }}
                  className={cn(
                    "block size-full origin-left rtl:origin-right",
                    st === "error"
                      ? "bg-sheen-danger forced-colors:bg-[Mark] forced-colors:[forced-color-adjust:none]"
                      : "sheen-fill [background-image:var(--sheen-accent-fill)]",
                    st === "complete" || st === "error" ? "scale-x-100" : st === "current" ? "scale-x-50" : "scale-x-0",
                    "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-slower) motion-ok:ease-sheen-out",
                  )}
                />
              </span>
              <span className="sr-only">
                {s.title}
                {statusText(labels, st, isCurrent)}
              </span>
            </li>
          );
        })}
      </ol>
      {next && (
        <p className="text-xs text-sheen-fg-muted [overflow-wrap:anywhere] [&_b]:font-medium [&_b]:text-sheen-fg [&_strong]:font-medium [&_strong]:text-sheen-fg">
          {labels.next(next.title)}
        </p>
      )}
    </div>
  );
}
