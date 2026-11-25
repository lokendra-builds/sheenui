"use client";

import { createContext, useContext, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";

import { cn } from "../../lib/cn";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";

/**
 * Accordion: stacked sections that expand in place (Base UI Accordion).
 *
 *   <Accordion defaultValue={["shipping"]}>
 *     <AccordionItem value="shipping">
 *       <AccordionTrigger>How long does shipping take?</AccordionTrigger>
 *       <AccordionPanel>Three to five business days.</AccordionPanel>
 *     </AccordionItem>
 *   </Accordion>
 *
 * Variants:
 *   - "glass"     one glass card; the open item rises as a lighter pane inside it (default)
 *   - "separated" every item is its own glass card
 *   - "plain"     no surface, hairlines between items (inside an existing card)
 *
 * Motion: the panel's height follows Base UI's --accordion-panel-height in 220 ms (150 ms on close), while its
 * content drifts down into place
 * (transform only, so glass inside a panel keeps its blur). The chevron turns with the
 * same spring. All of it is skipped under reduced motion (OS or in-app toggle).
 *
 * Keyboard: each trigger is a native button in the tab order (Enter / Space toggles), per
 * the current APG guidance. `hiddenUntilFound` lets find-in-page open matching panels.
 */

export type AccordionVariant = "glass" | "separated" | "plain";

const VariantContext = createContext<AccordionVariant>("glass");
/** Whether the root enabled `hiddenUntilFound`; the panel needs it to render `hidden="until-found"` on the server too. */
const UntilFoundContext = createContext(false);

/** Props of {@link Accordion}. Everything else is forwarded to Base UI's `Accordion.Root` (`value`, `defaultValue`, `onValueChange`, `multiple`, `disabled`, `hiddenUntilFound`). */
export type AccordionProps = Omit<ComponentProps<typeof BaseAccordion.Root>, "className"> & {
  /**
   * Surface style: "glass" is one glass card, "separated" gives every item its own card, "plain" has no surface.
   * @default "glass"
   */
  variant?: AccordionVariant;
  /** Adds extra classes to the outer element. */
  className?: string;
};

const rootStyles: Record<AccordionVariant, string> = {
  glass: "glass-2 rounded-sheen-xl p-1.5",
  separated: "gap-2.5",
  plain: "",
};

/**
 * Accordion: stacked sections that expand in place. Use it for FAQs, settings groups and any list
 * where only one or two sections need to be read at a time. Compose it with `AccordionItem`,
 * `AccordionTrigger` and `AccordionPanel`.
 *
 * Props (see {@link AccordionProps}): `variant` ("glass" | "separated" | "plain", default "glass"),
 * `className`, plus Base UI's `value`, `defaultValue`, `onValueChange`, `multiple` (open several
 * items at once, default false), `disabled` and `hiddenUntilFound`.
 *
 * Keyboard: Tab moves between triggers; Arrow Up / Down move between them (wrapping), Home and End jump to the first and last; Enter or Space opens and closes the focused item.
 * Accessibility: Panels are named groups (`role="group"`, labelled by their trigger), not landmarks, so many items never flood the landmark list. Each trigger is a native button inside a heading (`headingLevel` sets the level) and controls its panel; `hiddenUntilFound` lets find-in-page open matching panels.
 * Glass: The "glass" variant draws one backdrop-blurred card; the open item is a lighter pane with no second blur. Forced colors add a real border.
 * Motion: The panel height opens in 220 ms (ease-out) and closes in 150 ms; skipped under reduced motion (OS or in-app toggle).
 *
 * @example
 * ```tsx
 * import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
 *
 * export function Faq() {
 *   return (
 *     <Accordion defaultValue={["shipping"]}>
 *       <AccordionItem value="shipping">
 *         <AccordionTrigger>How long does shipping take?</AccordionTrigger>
 *         <AccordionPanel>Three to five business days.</AccordionPanel>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 *
 * @see /layout/accordion
 */
export function Accordion({ variant = "glass", className, onKeyDown, ...props }: AccordionProps) {
  // The WAI-ARIA accordion keyboard pattern, which Base UI leaves out: Arrow Up / Down, Home and End move between the headers.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    (onKeyDown as ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined)?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const key = event.key;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
    const root = event.currentTarget;
    const current = (event.target as HTMLElement).closest<HTMLElement>('[data-slot="accordion-trigger"]');
    if (current?.closest('[data-slot="accordion"]') !== root) return;
    const triggers = Array.from(root.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]')).filter(
      (el) =>
        el.closest('[data-slot="accordion"]') === root &&
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-disabled") !== "true",
    );
    const at = triggers.indexOf(current);
    if (at < 0 || triggers.length === 0) return;
    const next =
      key === "Home"
        ? 0
        : key === "End"
          ? triggers.length - 1
          : (at + (key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
    event.preventDefault();
    triggers[next]?.focus();
  };
  return (
    <VariantContext value={variant}>
      <UntilFoundContext value={props.hiddenUntilFound === true}>
        <BaseAccordion.Root
          data-slot="accordion"
          data-variant={variant}
          className={cn("flex w-full min-w-0 flex-col", rootStyles[variant], className)}
          {...props}
          onKeyDown={handleKeyDown}
        />
      </UntilFoundContext>
    </VariantContext>
  );
}

/** Props of {@link AccordionItem}. Everything else is forwarded to Base UI's `Accordion.Item` (`value`, `disabled`, `onOpenChange`). */
export type AccordionItemProps = Omit<ComponentProps<typeof BaseAccordion.Item>, "className"> & {
  /** Adds extra classes to the item element. */
  className?: string;
};

const itemStyles: Record<AccordionVariant, string> = {
  // Inset hairline above every item but the first; it hides next to the open (raised) item.
  glass: cn(
    "rounded-sheen-lg [--acc-px:1rem]",
    "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-sheen-border first:before:hidden",
    "before:transition-opacity before:duration-(--sheen-duration-base) data-open:before:opacity-0 [[data-open]+&]:before:opacity-0",
    // The open item rises as a lighter pane (glass tokens, no second backdrop blur).
    "transition-[background-color,box-shadow] duration-(--sheen-duration-base) ease-sheen-out",
    "data-open:bg-(--sheen-glass-1-bg) data-open:shadow-[var(--sheen-glass-rim),var(--sheen-glass-1-shadow)]",
    "forced-colors:data-open:border forced-colors:data-open:border-[CanvasText]",
  ),
  separated: cn(
    "glass-2 rounded-sheen-lg [--acc-px:1.25rem]",
    "transition-[border-color] duration-(--sheen-duration-base) data-open:border-sheen-accent-border",
  ),
  plain: "border-b border-sheen-border last:border-b-0 [--acc-px:0.5rem]",
};

/**
 * One section of an {@link Accordion}: holds a trigger and its panel. Give it a unique `value`
 * (matches the Accordion's `value` / `defaultValue`); `disabled` locks just this item.
 *
 * Accessibility: A disabled item is skipped by the tab order and announced as dimmed.
 *
 * @example
 * ```tsx
 * import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
 *
 * export const Item = () => (
 *   <Accordion>
 *     <AccordionItem value="a" disabled>
 *       <AccordionTrigger>Locked section</AccordionTrigger>
 *       <AccordionPanel>Not reachable.</AccordionPanel>
 *     </AccordionItem>
 *   </Accordion>
 * );
 * ```
 *
 * @see /layout/accordion
 */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  const variant = useContext(VariantContext);
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      className={cn(
        "relative min-w-0",
        // Content lines up with the title when the trigger has a leading icon.
        "has-[[data-slot=accordion-icon]]:[--acc-indent:calc(var(--acc-px)+2.75rem)]",
        itemStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Props of {@link AccordionTrigger}. Everything else is forwarded to Base UI's `Accordion.Trigger`. */
export type AccordionTriggerProps = Omit<ComponentProps<typeof BaseAccordion.Trigger>, "className"> & {
  /** Leading icon in a small tile; it picks up the accent while the item is open. Hidden from screen readers. */
  icon?: ReactNode;
  /** Shows a secondary line under the title. */
  description?: ReactNode;
  /**
   * "chevron" turns over; "plus" becomes a minus.
   * @default "chevron"
   */
  indicator?: "chevron" | "plus";
  /**
   * Heading level of the wrapping header (`2` to `6`), to fit the page outline, or `"none"` for a paragraph with no heading role (for an example).
   * @default 3
   */
  headingLevel?: HeadingLevelOption;
  /** Extra classes for the trigger button. */
  className?: string;
};

// Explicit radii: the trigger sits in a <hN> header, so `inherit` would pick up the header's 0.
const triggerStyles: Record<AccordionVariant, string> = {
  glass: "rounded-sheen-lg hover:bg-sheen-hover data-panel-open:hover:bg-transparent",
  // Same radius as the item card, so the hover wash and the focus ring follow its corners.
  separated: "rounded-sheen-lg hover:bg-sheen-hover data-panel-open:hover:bg-transparent",
  plain: "rounded-sheen-md hover:bg-sheen-hover",
};

/**
 * The always-visible title row of an {@link AccordionItem}: a button inside a heading. Children
 * are the title; `icon`, `description` and `indicator` dress it up.
 *
 * Keyboard: Enter or Space toggles the item; a visible focus ring marks the focused trigger.
 * Accessibility: Native button, `aria-expanded` and `aria-controls` come from Base UI; the indicator and icon tile are `aria-hidden`.
 * Motion: The chevron turns with the SheenUI spring; none of it runs under reduced motion.
 *
 * @example
 * ```tsx
 * import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
 *
 * export const Row = () => (
 *   <Accordion>
 *     <AccordionItem value="a">
 *       <AccordionTrigger description="Usually 3 to 5 days" indicator="plus" headingLevel={2}>
 *         Shipping
 *       </AccordionTrigger>
 *       <AccordionPanel>Details.</AccordionPanel>
 *     </AccordionItem>
 *   </Accordion>
 * );
 * ```
 *
 * @see /layout/accordion
 */
export function AccordionTrigger({
  icon,
  description,
  indicator = "chevron",
  headingLevel = 3,
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const variant = useContext(VariantContext);
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];

  return (
    <BaseAccordion.Header render={<Heading />} data-slot="accordion-header" className="m-0 flex">
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger relative flex min-h-12 w-full min-w-0 items-center gap-3 px-(--acc-px) py-3.5 text-start",
          "text-sm font-medium text-sheen-fg select-none",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "transition-[background-color] duration-(--sheen-duration-fast)",
          "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent",
          triggerStyles[variant],
          className,
        )}
        {...props}
      >
        {icon && (
          <span
            data-slot="accordion-icon"
            aria-hidden
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-sheen-sm border border-sheen-border bg-sheen-hover text-sheen-fg-muted [&_svg]:size-4",
              "transition-colors duration-(--sheen-duration-base) ease-sheen-out",
              "group-data-panel-open/trigger:border-sheen-accent-border group-data-panel-open/trigger:bg-sheen-accent-soft group-data-panel-open/trigger:text-sheen-accent",
            )}
          >
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="[overflow-wrap:anywhere] text-pretty">{children}</span>
          {description && (
            <span className="text-xs font-normal text-sheen-fg-muted [overflow-wrap:anywhere]">{description}</span>
          )}
        </span>
        <Indicator kind={indicator} />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

function Indicator({ kind }: { kind: "chevron" | "plus" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-sheen-full text-sheen-fg-muted",
        "transition-colors duration-(--sheen-duration-base) ease-sheen-out",
        "group-hover/trigger:text-sheen-fg",
        "group-data-panel-open/trigger:bg-sheen-accent-soft group-data-panel-open/trigger:text-sheen-accent",
      )}
    >
      {kind === "chevron" ? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-4 group-data-panel-open/trigger:rotate-180",
            "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy",
          )}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M3.5 8h9" />
          {/* The vertical bar folds away: plus → minus. */}
          <path
            d="M8 3.5v9"
            className={cn(
              "origin-center [transform-box:fill-box] group-data-panel-open/trigger:scale-y-0 group-data-panel-open/trigger:rotate-90",
              "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy",
            )}
          />
        </svg>
      )}
    </span>
  );
}

/** Props of {@link AccordionPanel}. Everything else is forwarded to Base UI's `Accordion.Panel` (`keepMounted`, `hiddenUntilFound`). */
export type AccordionPanelProps = Omit<ComponentProps<typeof BaseAccordion.Panel>, "className"> & {
  /** Extra classes for the panel (height-animated, clips while it moves). */
  className?: string;
  /** Extra classes for the padded content box inside the panel. */
  contentClassName?: string;
};

/**
 * The collapsible body of an {@link AccordionItem}. Put any content inside; it animates its
 * height as the item opens and closes.
 *
 * Accessibility: Closed panels are hidden from the accessibility tree (or `hidden="until-found"` when enabled), so their links are not tabbable.
 * Motion: Height opens in 220 ms and closes in 150 ms (the one allowed height exception); the content drifts in with a transform only, so glass inside keeps its blur. Skipped under reduced motion.
 *
 * @example
 * ```tsx
 * import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sheenui/theme";
 *
 * export const Body = () => (
 *   <Accordion defaultValue={["a"]}>
 *     <AccordionItem value="a">
 *       <AccordionTrigger>Title</AccordionTrigger>
 *       <AccordionPanel contentClassName="text-base">Any content.</AccordionPanel>
 *     </AccordionItem>
 *   </Accordion>
 * );
 * ```
 *
 * @see /layout/accordion
 */
export function AccordionPanel({ className, contentClassName, children, ...props }: AccordionPanelProps) {
  const rootUntilFound = useContext(UntilFoundContext);
  const untilFound = props.hiddenUntilFound ?? rootUntilFound;
  return (
    <BaseAccordion.Panel
      data-slot="accordion-panel"
      // Base UI makes each panel a `region` landmark. With many items (or the same questions twice on a page) that floods the
      // landmark list with duplicate names; a named group keeps the question as its name without becoming a landmark.
      role="group"
      // React's server renderer always writes `hidden=""` (it cannot emit hidden="until-found"; the client upgrades it in an
      // effect). This marker lets a prerender step rewrite the closed panels to until-found so static HTML matches the live DOM.
      data-until-found={untilFound ? "" : undefined}
      className={cn(
        "group/panel h-(--accordion-panel-height) overflow-hidden",
        // The one allowed `height` exception: 220ms ease-out open, 150ms ease-exit close.
        "motion-ok:transition-[height] motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
        "motion-ok:data-ending-style:duration-(--sheen-duration-exit) motion-ok:data-ending-style:ease-sheen-exit",
        "data-starting-style:h-0 data-ending-style:h-0",
        className,
      )}
      {...props}
    >
      <div
        data-slot="accordion-content"
        className={cn(
          "ps-(--acc-indent,var(--acc-px)) pe-(--acc-px) pt-0.5 pb-4 text-sm leading-relaxed text-sheen-fg-muted [overflow-wrap:anywhere]",
          // Content drifts down into place as the panel opens (transform only: keeps nested glass blurred).
          "motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out",
          "motion-ok:group-data-ending-style/panel:duration-(--sheen-duration-exit) motion-ok:group-data-ending-style/panel:ease-sheen-exit",
          "group-data-starting-style/panel:-translate-y-2 group-data-ending-style/panel:-translate-y-1",
          contentClassName,
        )}
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}
