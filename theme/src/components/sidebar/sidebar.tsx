"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger, type CollapsibleProps } from "../collapsible/collapsible";

const SidebarContext = createContext<{ collapsed: boolean; morph: boolean; setCollapsed: (next: boolean) => void }>({
  collapsed: false,
  morph: false,
  setCollapsed: () => undefined,
});

/** The shapes of {@link Sidebar}: a plain rounded column or one whose trailing edge bows outward like a curved glass sheet. */
export type SidebarShape = "rect" | "curved";

/**
 * The curved sheet, built from the glass element's own elliptical corner radii (so the blur, the lit rim and the
 * shadow all follow the curve, and no mask or clip-path sits on or above the glass). The trailing corners are one
 * ellipse as tall as the sidebar, which makes the whole inline-end edge a smooth bow; `--sidebar-curve` is the
 * shorthand `<horizontal> <vertical>` of both corners, and the apex light is a radial gradient on the glass at the
 * bow's widest point. Reduced transparency (OS or app toggle), more contrast and forced colours drop both back to the
 * plain rounded rectangle.
 */
const CURVED = [
  "[border-start-end-radius:var(--sidebar-curve)] [border-end-end-radius:var(--sidebar-curve)]",
  "[--sidebar-apex:radial-gradient(ellipse_26%_9%_at_100%_50%,var(--sheen-glass-spot),transparent),radial-gradient(ellipse_48%_22%_at_100%_50%,var(--sheen-glass-spot),transparent),radial-gradient(ellipse_50%_20%_at_100%_50%,color-mix(in_oklab,var(--sheen-accent-glow)_55%,transparent),transparent),radial-gradient(ellipse_90%_40%_at_100%_50%,color-mix(in_oklab,var(--sheen-accent-glow)_38%,transparent),transparent)]",
  "rtl:[--sidebar-apex:radial-gradient(ellipse_26%_9%_at_0%_50%,var(--sheen-glass-spot),transparent),radial-gradient(ellipse_48%_22%_at_0%_50%,var(--sheen-glass-spot),transparent),radial-gradient(ellipse_50%_20%_at_0%_50%,color-mix(in_oklab,var(--sheen-accent-glow)_55%,transparent),transparent),radial-gradient(ellipse_90%_40%_at_0%_50%,color-mix(in_oklab,var(--sheen-accent-glow)_38%,transparent),transparent)]",
  "[--sidebar-lit:inset_-14px_0_20px_-14px_var(--sheen-glass-spot),inset_-1px_0_0_0_var(--sheen-glass-spot)]",
  "rtl:[--sidebar-lit:inset_14px_0_20px_-14px_var(--sheen-glass-spot),inset_1px_0_0_0_var(--sheen-glass-spot)]",
  "[box-shadow:var(--sheen-glass-2-box),var(--sidebar-lit)]",
  "[background-image:var(--sidebar-apex),var(--sheen-glass-specular),var(--sheen-glass-noise)]",
  "[--sidebar-size:100%_100%,100%_100%,100%_100%,100%_100%,100%_100%,var(--sheen-glass-noise-size)]",
  "[background-size:var(--sidebar-size)]",
  "[@media(prefers-reduced-transparency:reduce)]:[--sidebar-curve:var(--sheen-radius-xl)]",
  "[@media(prefers-reduced-transparency:reduce)]:[--sidebar-apex:none]",
  "[@media(prefers-reduced-transparency:reduce)]:[--sidebar-size:100%_100%,100%_100%,var(--sheen-glass-noise-size)]",
  "[@media(prefers-reduced-transparency:reduce)]:[--sidebar-lit:0_0_0_0_transparent]",
  "[@media(prefers-contrast:more)]:[--sidebar-curve:var(--sheen-radius-xl)]",
  "[@media(prefers-contrast:more)]:[--sidebar-apex:none]",
  "[@media(prefers-contrast:more)]:[--sidebar-size:100%_100%,100%_100%,var(--sheen-glass-noise-size)]",
  "[@media(prefers-contrast:more)]:[--sidebar-lit:0_0_0_0_transparent]",
  "[@media(forced-colors:active)]:[--sidebar-curve:var(--sheen-radius-xl)]",
  "[@media(forced-colors:active)]:[--sidebar-apex:none]",
  "[@media(forced-colors:active)]:[--sidebar-size:100%_100%,100%_100%,var(--sheen-glass-noise-size)]",
  "[@media(forced-colors:active)]:[--sidebar-lit:0_0_0_0_transparent]",
  "[[data-transparency=reduced]_&]:[--sidebar-curve:var(--sheen-radius-xl)]",
  "[[data-transparency=reduced]_&]:[--sidebar-apex:none]",
  "[[data-transparency=reduced]_&]:[--sidebar-size:100%_100%,100%_100%,var(--sheen-glass-noise-size)]",
  "[[data-transparency=reduced]_&]:[--sidebar-lit:0_0_0_0_transparent]",
].join(" ");

/** Translatable text of {@link Sidebar}. */
export type SidebarLabels = {
  /** Landmark name of the `<nav>` when `aria-label` is not given. */
  name: string;
};

/** The English {@link SidebarLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultSidebarLabels: SidebarLabels = { name: "Sidebar" };

/** Props of {@link Sidebar}. The attributes of a `nav` plus the ones below. */
export type SidebarProps = Omit<ComponentProps<"nav">, "children"> & {
  /** Holds `SidebarHeader`, `SidebarGroup`s, `SidebarItem`s and `SidebarFooter`. */
  children?: ReactNode;
  /** Show only the icons (a 64px rail). Labels stay as accessible names and tooltips; groups stay open. Default false. */
  collapsed?: boolean;
  /** Starts as an icon rail when uncontrolled (`collapsed` left out). Change it from your own toggle with `useSidebar().setCollapsed`. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the new state when a part inside the sidebar asks to collapse or expand it (`useSidebar().setCollapsed`). */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Morph between the rail and the full panel instead of swapping them: icons stay exactly where they are, labels and
   * badges fade and slide in on the content (opacity and translate only), and group headings keep their place. The
   * width itself changes once, never through a transition, so nothing outside the sidebar shifts. Reduced motion: the
   * labels switch in one frame.
   *
   * @default false
   */
  morph?: boolean;
  /**
   * The outline of the glass. `"curved"` bows the trailing edge (inline-end, so it flips in right-to-left layouts) outward
   * like a curved glass sheet: the blur, the lit rim and the shadow follow the curve and a soft light sits on its apex.
   * The curve is the glass element's own corner radii, never a mask on a wrapper. With `collapsed` or `morph` the rail
   * bows more gently. Reduced transparency, more contrast and forced colours fall back to `"rect"`.
   *
   * @default "rect"
   */
  shape?: SidebarShape;
  /** Every string, for translation: `{ name: "Sidebar" }` (the default landmark name; `aria-label` wins over it). */
  labels?: Partial<SidebarLabels>;
};

/**
 * The app-shell sidebar: a glass column with a header, groups of links that fold open and shut, and a footer. For a flat
 * list of sections with one value, `VerticalNav` is the shorter way; reach for `Sidebar` when you need collapsible groups
 * or your own header and footer content.
 *
 * - Compose `SidebarHeader`, `SidebarGroup` (a collapsible section with a label), `SidebarItem` (a link or button with an icon,
 *   a badge and an `active` state) and `SidebarFooter`.
 * - `morph` (opt-in) animates the change between the rail and the panel: icons stay put and the labels slide and fade in.
 * - `shape="curved"` bows the trailing edge like a curved glass sheet, with the lit rim following the curve.
 * - `collapsed` turns it into an icon rail: labels become accessible names (and `title` tooltips), groups lose their headings. Controlled with `collapsed` + `onCollapsedChange`, or uncontrolled with `defaultCollapsed` and a toggle that calls `useSidebar().setCollapsed`.
 * - Give the `nav` an `aria-label` (default "Sidebar"). Put it in a container with the height you want; it scrolls inside.
 *
 * Keyboard: Tab moves through group headings and items in order; Enter or Space opens or closes a group and activates an item.
 * Accessibility: a `nav` landmark; group headings are real buttons with `aria-expanded`; the current page uses `aria-current="page"`;
 * icons are decorative; targets are 44px on touch screens.
 * Glass and motion: one `glass-2` surface (no extra blur or refraction layer; `shape="curved"` only reshapes its corners and adds one gradient). With `morph`, labels and badges cross-fade with an 8px slide (transform and opacity only; the width changes once). Group bodies open with the shared height animation and the chevrons turn; items
 * fade their hover tint; reduced motion jumps straight to the end state.
 *
 * @example
 * ```tsx
 * import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sidebar aria-label="Workspace" className="w-64">
 *       <SidebarGroup label="Projects" defaultOpen>
 *         <SidebarItem href="#alpha" active>Alpha</SidebarItem>
 *         <SidebarItem href="#beta" badge="3">Beta</SidebarItem>
 *       </SidebarGroup>
 *       <SidebarItem href="#settings">Settings</SidebarItem>
 *     </Sidebar>
 *   );
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function Sidebar({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  morph = false,
  shape = "rect",
  className,
  children,
  labels,
  "aria-label": ariaLabel = labels?.name ?? defaultSidebarLabels.name,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = useControllable(collapsedProp, defaultCollapsed, onCollapsedChange);
  const context = useMemo(() => ({ collapsed, morph, setCollapsed }), [collapsed, morph, setCollapsed]);
  return (
    <SidebarContext value={context}>
      <nav
        aria-label={ariaLabel}
        data-slot="sidebar"
        data-collapsed={collapsed ? "" : undefined}
        data-morph={morph ? "" : undefined}
        data-shape={shape === "curved" ? "curved" : undefined}
        className={cn(
          "glass-2 flex h-full min-h-0 flex-col gap-1 overflow-y-auto rounded-sheen-xl p-2 [scrollbar-width:thin]",
          morph && "overflow-x-hidden",
          collapsed ? "w-16" : "w-64",
          shape === "curved" &&
            cn(CURVED, collapsed ? "[--sidebar-curve:0.75rem_50%]" : "[--sidebar-curve:1.75rem_50%] pe-5"),
          className,
        )}
        {...props}
      >
        {children}
      </nav>
    </SidebarContext>
  );
}

/**
 * The top of a {@link Sidebar}: a logo or a workspace switcher.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Sidebar, SidebarHeader } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sidebar>
 *       <SidebarHeader>Acme</SidebarHeader>
 *     </Sidebar>
 *   );
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-header" className={cn("flex items-center gap-2 px-2 pt-1 pb-2", className)} {...props} />
  );
}

/**
 * The bottom of a {@link Sidebar}, pushed down by `mt-auto`: a user menu or a help link.
 *
 * Keyboard and accessibility: plain markup that adds no tab stops or roles of its own. Glass and motion: styling only, no movement.
 *
 * @example
 * ```tsx
 * import { Sidebar, SidebarFooter, SidebarItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sidebar>
 *       <SidebarFooter>
 *         <SidebarItem href="#help">Help</SidebarItem>
 *       </SidebarFooter>
 *     </Sidebar>
 *   );
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto flex items-center gap-2 border-t border-sheen-border px-2 pt-2", className)}
      {...props}
    />
  );
}

/**
 * Whether the surrounding {@link Sidebar} is collapsed to its icon rail. Use it in custom header or footer content; outside a Sidebar it returns `{ collapsed: false }`. It also returns `setCollapsed(next)` to collapse or expand the sidebar from your own toggle (it fires `onCollapsedChange`).
 *
 * A hook: it renders nothing and has no keyboard or accessibility behaviour of its own; use it inside the parts of a `Sidebar` (`SidebarHeader`, `SidebarFooter`, your own items).
 *
 * @example
 * ```tsx
 * import { useSidebar } from "@sheenui/theme";
 *
 * export function Brand() {
 *   const { collapsed } = useSidebar();
 *   return <strong>{collapsed ? "A" : "Acme"}</strong>;
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function useSidebar() {
  return useContext(SidebarContext);
}

/** The label state of a morphing sidebar: arrives after the width settles, leaves at once (opacity and translate only). */
function morphReveal(visible: boolean) {
  return cn(
    "motion-ok:transition-[opacity,translate]",
    visible
      ? "opacity-100 motion-ok:delay-(--sheen-duration-fast) motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out"
      : "pointer-events-none opacity-0 motion-ok:-translate-x-2 motion-ok:rtl:translate-x-2 motion-ok:duration-(--sheen-duration-instant) motion-ok:ease-sheen-exit",
  );
}

/** Props of {@link SidebarGroup}. */
export type SidebarGroupProps = Omit<CollapsibleProps, "children"> & {
  /** The group's heading, which is also the button that opens and closes it. */
  label: ReactNode;
  /** Shows an icon before the heading. */
  icon?: ReactNode;
  /** Open at first when uncontrolled. Default true. */
  defaultOpen?: boolean;
  /** Holds the items of the group. */
  children?: ReactNode;
};

/**
 * A collapsible section of a {@link Sidebar}: a heading button and the items under it. Controlled with `open` and
 * `onOpenChange`, or uncontrolled with `defaultOpen` (default true). In a collapsed sidebar the heading is hidden and the items stay visible.
 *
 * Keyboard: Enter or Space on the heading toggles it. Accessibility: a `button` with `aria-expanded`; closed items leave the tab order.
 * Glass and motion: the shared Collapsible height animation; reduced motion jumps.
 *
 * @example
 * ```tsx
 * import { Sidebar, SidebarGroup, SidebarItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sidebar>
 *       <SidebarGroup label="Team" defaultOpen={false}>
 *         <SidebarItem href="#members">Members</SidebarItem>
 *       </SidebarGroup>
 *     </Sidebar>
 *   );
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function SidebarGroup({ label, icon, defaultOpen = true, className, children, ...props }: SidebarGroupProps) {
  const { collapsed, morph } = useSidebar();
  const [openState, setOpenState] = useState(defaultOpen);
  if (morph) {
    // One tree in both states, so the items inside never remount and their labels can animate. The rail keeps the
    // items open and hides the (disabled) heading; the group is still named for assistive tech.
    const { open, onOpenChange, ...rest } = props;
    const { "aria-label": ariaLabel } = props as { "aria-label"?: string };
    const isOpen = collapsed || (open ?? openState);
    return (
      <Collapsible
        data-slot="sidebar-group"
        className={className}
        {...rest}
        open={isOpen}
        disabled={collapsed || rest.disabled}
        onOpenChange={(next, details) => {
          setOpenState(next);
          onOpenChange?.(next, details);
        }}
        {...(collapsed && {
          role: "group",
          "aria-label": ariaLabel ?? (typeof label === "string" ? label : undefined),
        })}
      >
        <CollapsibleTrigger
          className={cn("text-xs font-semibold tracking-wide text-sheen-fg-muted uppercase", collapsed && "hidden")}
        >
          <span className="flex items-center gap-2">
            {icon && (
              <span aria-hidden className="flex shrink-0">
                {icon}
              </span>
            )}
            {label}
          </span>
        </CollapsibleTrigger>
        <CollapsiblePanel contentClassName="flex flex-col gap-0.5 p-0 pb-1">{children}</CollapsiblePanel>
      </Collapsible>
    );
  }
  if (collapsed) {
    // The heading is hidden in the rail, so the group keeps its name from `aria-label` (or the label when it is plain text).
    const { "aria-label": ariaLabel, id } = props as { "aria-label"?: string; id?: string };
    return (
      <div
        role="group"
        id={id}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        className={cn("flex flex-col gap-0.5 border-t border-sheen-border pt-1 first:border-t-0 first:pt-0", className)}
      >
        {children}
      </div>
    );
  }
  return (
    <Collapsible defaultOpen={defaultOpen} data-slot="sidebar-group" className={className} {...props}>
      <CollapsibleTrigger className="text-xs font-semibold tracking-wide text-sheen-fg-muted uppercase">
        <span className="flex items-center gap-2">
          {icon && (
            <span aria-hidden className="flex shrink-0">
              {icon}
            </span>
          )}
          {label}
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel contentClassName="flex flex-col gap-0.5 p-0 pb-1">{children}</CollapsiblePanel>
    </Collapsible>
  );
}

/** Props of {@link SidebarItem}. The attributes of an `a` (with `href`) or a `button` (without), plus Base UI's `render` and the ones below. */
export type SidebarItemProps = useRender.ComponentProps<"a"> & {
  /** Shows an icon before the label. */
  icon?: ReactNode;
  /** A count or tag at the end, such as "3". Hidden in a collapsed sidebar. A `0` is hidden unless `showZero` is set. */
  badge?: ReactNode;
  /** Show the badge when it is `0`. Default false (an empty count is noise). */
  showZero?: boolean;
  /** Marks the current page (`aria-current="page"`) and fills the item. Default false. */
  active?: boolean;
  /** Makes the item unclickable: it is dimmed and skipped by the keyboard. Default false. */
  disabled?: boolean;
};

/** The attributes only an anchor understands; a `SidebarItem` without `href` renders a button and drops them. */
function blockClick(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

const ANCHOR_ONLY = ["target", "rel", "download", "hrefLang", "ping", "referrerPolicy", "type"] as const;

/**
 * One link (or, without `href`, one button) of a {@link Sidebar}. In a collapsed sidebar only the icon shows; the label stays as the
 * accessible name and the tooltip. Mark the current page with `active`.
 *
 * - Pass `render` to use your router's link (`<SidebarItem render={<Link to="/inbox" />}>Inbox</SidebarItem>`): it keeps the look, the
 *   `aria-current` state and the collapsed-rail label. `ref` reaches the rendered element.
 * - `badge` shows a count or tag; a `0` is hidden unless `showZero` is set.
 *
 * Keyboard: Tab to focus, Enter follows the link (Space also presses the button). Accessibility: `aria-current="page"` when
 * active; the icon is decorative. Glass and motion: a hover tint that fades; no movement.
 *
 * @example
 * ```tsx
 * import { Sidebar, SidebarItem } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Sidebar>
 *       <SidebarItem href="#home" active>Home</SidebarItem>
 *       <SidebarItem onClick={() => undefined} badge="2">Inbox</SidebarItem>
 *     </Sidebar>
 *   );
 * }
 * ```
 *
 * @see /navigation/sidebar
 */
export function SidebarItem({
  icon,
  badge,
  showZero = false,
  active = false,
  disabled = false,
  className,
  children,
  href,
  render,
  ref,
  ...props
}: SidebarItemProps) {
  const { collapsed, morph } = useSidebar();
  const classes = cn(
    "relative flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-sheen-md px-2.5 py-2 text-start text-sm font-medium text-sheen-fg-muted no-underline",
    "touch-manipulation transition-[background-color,color] duration-(--sheen-duration-fast) ease-sheen-out hover:bg-sheen-hover hover:text-sheen-fg any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11",
    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sheen-focus",
    "aria-[current=page]:bg-sheen-hover aria-[current=page]:text-sheen-fg aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    // Morph: the same box in both states (the icon is centred in the 48px rail and never moves); only the text changes.
    morph ? "px-3.5" : collapsed && "justify-center px-0",
    className,
  );
  const hasBadge = badge != null && badge !== false && badge !== "" && (badge !== 0 || showZero);
  const content = (
    <>
      {icon && (
        <span aria-hidden className="flex shrink-0">
          {icon}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1",
          morph ? cn("whitespace-nowrap", morphReveal(!collapsed)) : cn("truncate", collapsed && "sr-only"),
        )}
      >
        {children}
      </span>
      {hasBadge && (morph || !collapsed) && (
        <span
          className={cn(
            "shrink-0 rounded-sheen-full bg-sheen-hover px-2 text-xs tabular-nums",
            morph && morphReveal(!collapsed),
          )}
        >
          {badge}
        </span>
      )}
    </>
  );
  const title = collapsed && typeof children === "string" ? children : undefined;
  const isLink = href !== undefined || render !== undefined;
  const rest: ComponentProps<"a"> = { ...props };
  if (!isLink) for (const key of ANCHOR_ONLY) Reflect.deleteProperty(rest, key);
  // A disabled link never runs the consumer's onClick (nor a `render` element's own handler):
  // the capture handler stops the event before either, and the item leaves the tab order.
  if (isLink && disabled) delete rest.onClick;
  return useRender({
    defaultTagName: isLink ? "a" : "button",
    render,
    ref,
    props: {
      ...rest,
      ...(isLink
        ? {
            href: disabled ? undefined : href,
            "aria-disabled": disabled || undefined,
            ...(disabled && { tabIndex: -1, onClickCapture: blockClick }),
          }
        : { type: "button", disabled }),
      "aria-current": active ? "page" : undefined,
      "data-slot": "sidebar-item",
      title,
      className: classes,
      children: content,
    },
  });
}
