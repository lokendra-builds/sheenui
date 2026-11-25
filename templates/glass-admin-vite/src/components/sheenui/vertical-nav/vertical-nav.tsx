"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { motion } from "motion/react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "../lib/cn";
import { tooltipMotion } from "../lib/popup-motion";
import { spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { isPlainLeftClick, type NavLinkProps } from "../navbar/navbar";

/**
 * One item of the `VerticalNav`: its `value`, label, icon, optional badge and `href` (a link) or none
 * (a button).
 */
export type VerticalNavItem = {
  /** Unique id of the item; compared with the nav's `value` to find the active one. */
  value: string;
  /** Visible text (also the tooltip on the collapsed rail and the link's accessible name). */
  label: string;
  /** Needed for the collapsed rail, where only icons show. */
  icon?: ReactNode;
  /** Small count or tag on the right, e.g. unread messages. Shows as a dot on the rail. */
  badge?: ReactNode;
  /** Makes the item a link (through `renderLink` if given). Without it the item is a button. */
  href?: string;
  /** Not selectable; drops out of the tab order. */
  disabled?: boolean;
};

/** A group of `VerticalNav` items with an optional heading. */
export type VerticalNavSection = {
  /** Optional heading above the group. Also names the group for screen readers. */
  title?: string;
  items: VerticalNavItem[];
};

/** Translatable text of {@link VerticalNav}. */
export type VerticalNavLabels = {
  /** Landmark name of the `<nav>` when `aria-label` is not given. */
  name: string;
};

/** The English {@link VerticalNavLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultVerticalNavLabels: VerticalNavLabels = { name: "Sidebar" };

/** Props of `VerticalNav`; each option is documented on its field. */
export type VerticalNavProps = {
  /** Groups of items, each with an optional heading. */
  sections: VerticalNavSection[];
  /** Sets the `value` of the active item when controlled. */
  value: string;
  /** Called with an item's `value` when it is chosen (a plain left click on a link also calls it). */
  onValueChange?: (value: string) => void;
  /**
   * Render items that have an `href` through your router's link component.
   * Defaults to a plain <a>. Same contract as Navbar's `renderLink` (see `NavLinkProps`).
   */
  renderLink?: (props: NavLinkProps, item: VerticalNavItem) => ReactElement;
  /** Logo / product name at the top. Left-aligned; a 28px mark sits centred on the rail. */
  header?: ReactNode;
  /** Pinned to the bottom, e.g. a user card or settings. Clipped (not reflowed) on the rail. */
  footer?: ReactNode;
  /** Icon-only rail; labels appear as tooltips. Default false. */
  collapsed?: boolean;
  /** Every string, for translation: `{ name: "Sidebar" }` (the default landmark name). */
  labels?: Partial<VerticalNavLabels>;
  /** Landmark name. Give each navigation on a page its own. Default `labels.name` ("Sidebar"). */
  "aria-label"?: string;
  /** Whether the `<nav>` is a navigation landmark (`boolean`). Set `false` (a named `role="group"`) for a nav inside a block that can appear twice on one page, so landmark names stay unique. Default `true`. */
  landmark?: boolean;
  /** Extra classes for the `<nav>` (set its height; it fills its parent by default). */
  className?: string;
};

/** Matches rounded-sheen-md until the real value is read from the theme on mount. */
const FALLBACK_RADIUS = 14;

/*
 * Collapse choreography. The nav's width eases between w-64 and the rail; nothing
 * inside it reflows. Items stay full width with fixed padding, so the icon never moves and
 * sits centred in the 44px rail, while text is clipped by its own wrapper. Text that only
 * belongs to one state cross-fades: leaving fades out at once and fast (before it can be
 * clipped mid-word), arriving waits for the width to mostly settle.
 *
 * With `slide`, text also drifts toward the rail as it leaves and back out as it arrives
 * (8px, translate only). Only the text spans move: never the glass nav or an ancestor of it.
 * Each clip box has 8px of inline-start room (labels: -ms-2 ps-2; titles: px-3), so the slide
 * never shaves a first letter against its own clip edge.
 * Reduced motion: everything snaps in one frame (width and text), so a narrowed rail never
 * shows clipped text ("WOR", "ACC") while it fades.
 */
function reveal(visible: boolean, slide = false) {
  return cn(
    "motion-ok:transition-[opacity,translate]",
    visible
      ? "opacity-100 motion-ok:delay-(--sheen-duration-fast) motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out"
      : cn(
          "opacity-0 motion-ok:duration-(--sheen-duration-instant) motion-ok:ease-sheen-exit",
          slide && "motion-ok:-translate-x-2 motion-ok:rtl:translate-x-2",
        ),
  );
}

/**
 * Vertical (sidebar) navigation on glass. The active highlight slides between
 * items with a shared layout animation; collapsed mode becomes an icon rail. Use it for app sidebars;
 * use `Navbar` for a top bar and `Tabs` to switch panels in place.
 *
 * - `sections` are groups of items (`value`, `label`, `icon`, `badge`, `href`, `disabled`) with optional titles.
 * - `value` is the active item; items with an `href` are links (pass `renderLink` to use your router's link
 *   component, same contract as `Navbar`), the rest are buttons that call `onValueChange`.
 * - `collapsed` turns it into a 44px icon rail with tooltips; `header` and `footer` pin content to the top and bottom.
 *
 * Keyboard: a normal list of links and buttons: Tab and Shift+Tab move between items, Enter follows or selects
 * (Space also presses buttons). Disabled items leave the tab order. Collapsed-rail tooltips show on focus too.
 * Accessibility: a `<nav>` landmark (name it with `aria-label`); each section is a labelled group; the active item has
 * `aria-current="page"`; item touch targets are 44px on touch screens. Forced colors keep the active item visible.
 * Glass and motion: one `glass-2` surface (collapsed tooltips are `glass-3`). The active pill slides with a shared
 * layout animation and the width eases between the full and rail sizes; text cross-fades. With reduced motion
 * everything snaps in one frame, so a narrowed rail never shows half-clipped text.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { VerticalNav } from "@sheenui/theme";
 *
 * export function Example() {
 *   const [page, setPage] = useState("home");
 *
 *   return (
 *     <VerticalNav
 *       aria-label="Main"
 *       value={page}
 *       onValueChange={setPage}
 *       sections={[{ items: [{ value: "home", label: "Home" }, { value: "inbox", label: "Inbox", badge: 3 }] }]}
 *     />
 *   );
 * }
 * ```
 *
 * @see /navigation/vertical-nav
 */
export function VerticalNav({
  sections,
  value,
  onValueChange,
  renderLink,
  header,
  footer,
  collapsed = false,
  labels,
  "aria-label": ariaLabelProp,
  landmark = true,
  className,
}: VerticalNavProps) {
  const ariaLabel = ariaLabelProp ?? labels?.name ?? defaultVerticalNavLabels.name;
  const layoutId = useId();
  const sectionId = useId();
  const reduced = useSheenReducedMotion();
  const navRef = useRef<HTMLDivElement>(null);

  // Motion can only keep the pill's corners round while it slides when the radius is in px,
  // so read what rounded-sheen-md resolves to (themes may change --sheen-radius-md).
  const [pillRadius, setPillRadius] = useState(FALLBACK_RADIUS);
  useLayoutEffect(() => {
    const item = navRef.current?.querySelector<HTMLElement>("[data-slot='vertical-nav-item']");
    const px = item ? parseFloat(getComputedStyle(item).borderTopLeftRadius) : NaN;
    if (Number.isFinite(px)) setPillRadius(px);
  }, []);

  // A named group instead of a landmark when the nav sits in a block that can appear twice on one page.
  const Root = (landmark ? "nav" : "div") as "div";

  return (
    <Root
      ref={navRef}
      role={landmark ? undefined : "group"}
      aria-label={ariaLabel}
      data-slot="vertical-nav"
      data-collapsed={collapsed || undefined}
      className={cn(
        "glass-2 flex h-full flex-col gap-4 rounded-sheen-xl p-3",
        // Rail = 44px item (touch target) + 2 × 12px padding + 2 × 1px glass border. The width changes once,
        // never through a transition: animating `width` re-lays out the neighbours every frame (layout shift).
        // The labels fade (opacity) instead.
        collapsed ? "w-[4.375rem]" : "w-64",
        className,
      )}
    >
      {header && (
        // py-1/px-2 inside the clip leaves room for a focus outline on a header link.
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 overflow-hidden px-2 py-1">{header}</div>
      )}

      <BaseTooltip.Provider delay={150}>
        {/* -m-1 p-1: the scroller clips both axes, so give focus outlines 4px of room. */}
        <div className="-m-1 flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin]">
          {sections.map((section, si) => {
            const titleId = section.title ? `${sectionId}-${si}` : undefined;
            return (
              <div key={section.title ?? si} className="flex flex-col gap-0.5">
                {section.title && (
                  // Same height in both states (min-h, so user text spacing can still grow it), so the list never jumps vertically while collapsing.
                  <div className="relative flex min-h-6 shrink-0 items-end overflow-hidden px-3 pb-1">
                    <p
                      id={titleId}
                      className={cn(
                        "text-2xs font-semibold tracking-[0.12em] whitespace-nowrap text-sheen-fg-subtle uppercase",
                        reveal(!collapsed, true),
                      )}
                    >
                      {section.title}
                    </p>
                    {si > 0 && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 bg-sheen-border",
                          reveal(collapsed),
                        )}
                      />
                    )}
                  </div>
                )}

                <ul aria-labelledby={titleId} className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = item.value === value;
                    const content = (
                      <>
                        {active && (
                          <motion.span
                            aria-hidden
                            // Reduced motion: no shared layout at all, so the highlight simply appears on the new item.
                            layoutId={reduced ? undefined : layoutId}
                            transition={spring.snappy}
                            style={{ borderRadius: pillRadius }}
                            className="absolute inset-0 -z-10 bg-sheen-indicator shadow-[inset_0_1px_0_var(--sheen-glass-border),0_1px_6px_-2px_var(--sheen-shadow-far)]"
                          >
                            <span className="absolute top-1/2 start-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-sheen-accent" />
                          </motion.span>
                        )}
                        {item.icon && (
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center",
                              active && "text-sheen-accent",
                            )}
                          >
                            {item.icon}
                          </span>
                        )}
                        {/*
                         * Label and badge are clipped here (not by the item), so the pill can slide in from another
                         * row unclipped. While collapsing the label keeps its natural width and the closing edge
                         * wipes over it, instead of re-truncating to "I…" on every frame. -ms-2 ps-2 reaches 8px
                         * into the gap after the icon, so the label's 8px slide stays inside the clip.
                         */}
                        <span className="-ms-2 flex min-w-0 flex-1 items-center gap-3 overflow-hidden ps-2">
                          {/* Faded out on the rail but still in the DOM, so it stays the item's accessible name. */}
                          <span className={cn(collapsed ? "shrink-0" : "min-w-0 truncate", reveal(!collapsed, true))}>
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "ms-auto shrink-0 rounded-sheen-full bg-sheen-hover px-1.5 py-0.5 text-2xs font-semibold text-sheen-fg tabular-nums",
                                reveal(!collapsed, true),
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute top-1.5 end-1.5 size-1.5 rounded-full bg-sheen-accent",
                              reveal(collapsed),
                            )}
                          />
                        )}
                      </>
                    );

                    const itemClass = cn(
                      "relative z-0 flex h-10 w-full items-center gap-3 rounded-sheen-md px-3 text-start text-sm font-medium whitespace-nowrap",
                      "any-pointer-coarse:h-11",
                      "transition-colors duration-(--sheen-duration-fast)",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                      active ? "text-sheen-fg" : "text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg",
                      item.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-sheen-fg-muted",
                    );
                    const select = () => onValueChange?.(item.value);

                    let element: ReactElement;
                    if (item.href && !item.disabled) {
                      const linkProps: NavLinkProps = {
                        href: item.href,
                        "data-slot": "vertical-nav-item",
                        className: itemClass,
                        "aria-current": active ? "page" : undefined,
                        onClick: (event) => {
                          if (isPlainLeftClick(event)) select();
                        },
                        children: content,
                      };
                      element = renderLink ? renderLink(linkProps, item) : <a {...linkProps}>{content}</a>;
                    } else if (item.href) {
                      // A disabled link has no href, so it drops out of the tab order like a disabled button.
                      element = (
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid -- the ARIA disabled-link pattern: no href on purpose
                        <a data-slot="vertical-nav-item" role="link" aria-disabled="true" className={itemClass}>
                          {content}
                        </a>
                      );
                    } else {
                      element = (
                        <button
                          data-slot="vertical-nav-item"
                          type="button"
                          aria-current={active ? "page" : undefined}
                          disabled={item.disabled}
                          onClick={select}
                          className={itemClass}
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <li key={item.value}>
                        {/* Always the same tree (tooltip just disabled when expanded), so items never remount on toggle. */}
                        <BaseTooltip.Root disabled={!collapsed}>
                          <BaseTooltip.Trigger render={element} />
                          <BaseTooltip.Portal>
                            <BaseTooltip.Positioner side="right" sideOffset={10} collisionPadding={8} className="z-50">
                              <BaseTooltip.Popup
                                className={cn(
                                  "glass-3 origin-(--transform-origin) rounded-sheen-sm px-2.5 py-1.5 text-xs font-medium",
                                  tooltipMotion,
                                )}
                              >
                                {item.label}
                              </BaseTooltip.Popup>
                            </BaseTooltip.Positioner>
                          </BaseTooltip.Portal>
                        </BaseTooltip.Root>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </BaseTooltip.Provider>

      {footer && (
        // -mx-1 px-1: focus room inside the clip; the divider stays content-width.
        <div className="-mx-1 shrink-0 overflow-hidden px-1 pb-1 -mb-1">
          <div className="border-t border-sheen-border pt-3">{footer}</div>
        </div>
      )}
    </Root>
  );
}
