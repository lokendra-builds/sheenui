"use client";

import type { ComponentProps } from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

import { classNameWith, cn } from "../../lib/cn";
import { ChevronDownIcon } from "../status-icons/icons";

/** Props of {@link Collapsible}: everything Base UI's `Collapsible.Root` takes (`open`, `defaultOpen`, `onOpenChange`, `disabled`) plus `className`. */
export type CollapsibleProps = ComponentProps<typeof BaseCollapsible.Root>;

/**
 * One section that shows or hides its content: "Show advanced options", a long list behind "Show more", a details
 * panel under a row. Use `Accordion` for a stack of sections where one opening closes another.
 *
 * - Compose `Collapsible`, `CollapsibleTrigger` (the button) and `CollapsiblePanel` (the content).
 * - Controlled with `open` + `onOpenChange`, or uncontrolled with `defaultOpen`; `disabled` locks it.
 * - `CollapsiblePanel` keeps closed content out of the page (use `keepMounted` to hold it for forms, or `hiddenUntilFound`
 *   so find-in-page can open it).
 *
 * Keyboard: Tab focuses the trigger; Enter or Space toggles. Accessibility: the trigger is a real `button` with
 * `aria-expanded` and `aria-controls`; closed content is hidden from assistive tech and from the tab order.
 * Glass and motion: no surface of its own, so you can put it inside a card. The panel's height opens in 220 ms and closes
 * in 150 ms (the one allowed height exception, as in `Accordion`), the content drifts in with a transform, and the chevron
 * turns; reduced motion jumps straight to the end state.
 *
 * @example
 * ```tsx
 * import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Collapsible>
 *       <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
 *       <CollapsiblePanel>Retry limit, timeouts and proxy settings.</CollapsiblePanel>
 *     </Collapsible>
 *   );
 * }
 * ```
 *
 * @see /layout/collapsible
 */
export function Collapsible({ className, ...props }: CollapsibleProps) {
  return (
    <BaseCollapsible.Root
      data-slot="collapsible"
      className={classNameWith(className, (extra) => cn("flex w-full min-w-0 flex-col", extra))}
      {...props}
    />
  );
}

/** Props of {@link CollapsibleTrigger}: everything Base UI's `Collapsible.Trigger` takes, plus `hideIcon`. */
export type CollapsibleTriggerProps = ComponentProps<typeof BaseCollapsible.Trigger> & {
  /** Hide the chevron (for a custom indicator; read `data-panel-open` on the trigger). Default false. */
  hideIcon?: boolean;
};

/**
 * The button that toggles a {@link Collapsible}. The chevron turns when it opens; style it with `className` or swap the
 * whole element with `render`.
 *
 * Keyboard: Enter or Space. Accessibility: `aria-expanded` / `aria-controls` come from Base UI; the chevron is decorative.
 *
 * @example
 * ```tsx
 * import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Collapsible defaultOpen>
 *       <CollapsibleTrigger className="font-semibold">Details</CollapsibleTrigger>
 *       <CollapsiblePanel>Shown at first.</CollapsiblePanel>
 *     </Collapsible>
 *   );
 * }
 * ```
 *
 * @see /layout/collapsible
 */
export function CollapsibleTrigger({ className, hideIcon = false, children, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      data-slot="collapsible-trigger"
      className={classNameWith(className, (extra) =>
        cn(
          "group/trigger flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-sheen-md px-2 py-2 text-start text-sm font-medium text-sheen-fg",
          "touch-manipulation [-webkit-tap-highlight-color:transparent] any-pointer-coarse:min-h-11",
          "transition-[background-color,color] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          extra,
        ),
      )}
      {...props}
    >
      {children}
      {!hideIcon && (
        <ChevronDownIcon className="size-4 shrink-0 text-sheen-fg-muted motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out group-data-panel-open/trigger:rotate-180" />
      )}
    </BaseCollapsible.Trigger>
  );
}

/** Props of {@link CollapsiblePanel}: everything Base UI's `Collapsible.Panel` takes (`keepMounted`, `hiddenUntilFound`), plus `contentClassName`. */
export type CollapsiblePanelProps = ComponentProps<typeof BaseCollapsible.Panel> & {
  /** Extra classes for the padded box inside the panel. */
  contentClassName?: string;
};

/**
 * The content of a {@link Collapsible}. Its height follows Base UI's `--collapsible-panel-height`; put any content inside.
 *
 * Keyboard: content inside is reachable only while open. Accessibility: hidden from assistive tech when closed.
 *
 * @example
 * ```tsx
 * import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Collapsible>
 *       <CollapsibleTrigger>Shipping</CollapsibleTrigger>
 *       <CollapsiblePanel keepMounted contentClassName="text-sheen-fg-muted">Ships in 2 days.</CollapsiblePanel>
 *     </Collapsible>
 *   );
 * }
 * ```
 *
 * @see /layout/collapsible
 */
export function CollapsiblePanel({ className, contentClassName, children, ...props }: CollapsiblePanelProps) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-panel"
      className={classNameWith(className, (extra) =>
        cn(
          "group/panel h-(--collapsible-panel-height) overflow-hidden",
          // The one allowed `height` exception: 220ms ease-out open, 150ms ease-exit close.
          "motion-ok:transition-[height] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
          "motion-ok:data-ending-style:duration-(--sheen-duration-exit) motion-ok:data-ending-style:ease-sheen-exit",
          "data-starting-style:h-0 data-ending-style:h-0",
          extra,
        ),
      )}
      {...props}
    >
      <div
        className={cn(
          "px-2 pt-1 pb-3 text-sm leading-relaxed text-sheen-fg-muted [overflow-wrap:anywhere]",
          // Content drifts down into place as the panel opens (transform only: keeps nested glass blurred).
          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-slow) motion-ok:ease-sheen-out",
          "group-data-starting-style/panel:-translate-y-2 group-data-ending-style/panel:-translate-y-1",
          contentClassName,
        )}
      >
        {children}
      </div>
    </BaseCollapsible.Panel>
  );
}
