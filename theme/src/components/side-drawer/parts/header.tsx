"use client";

import { useContext, type ComponentProps, type ReactNode } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { AnimatePresence, motion } from "motion/react";

import { cn, classNameWith } from "../../../lib/cn";
import { useSheenReducedMotion } from "../../../hooks/use-preferences";
import { duration, ease, spring } from "../../../motion/tokens";
import { DrawerDescription, DrawerTitle } from "../../drawer/drawer";
import { Kbd } from "../../kbd/kbd";
import { Tooltip } from "../../tooltip/tooltip";
import { CheckCircleIcon, CloseIcon } from "../icons";
import { NoticeContext, useSideDrawerContext } from "./model";
import { ScrollContext } from "./content";

/* ---------- Notice ("Saved", "Archived") ---------- */

/** Says the current notice politely. Lives in the panel, so it works with a modal drawer too. */
export function NoticeAnnouncer() {
  const notice = useContext(NoticeContext);
  return (
    <span role="status" className="sr-only">
      {notice ? <span key={notice.id}>{notice.announce}</span> : null}
    </span>
  );
}

/** Props of `SideDrawerNotice`; each option is documented on its field. */
export type SideDrawerNoticeProps = {
  /** Adds extra classes to the notice. */
  className?: string;
  /** "inline": check + message, for the title row. "badge": just the check, pinned to the corner of an avatar / icon (its parent must be positioned). */
  variant?: "inline" | "badge";
};

/**
 * The visible half of `useSideDrawer().notify()`: a check and a short message that pops in next to the title and fades away. `SideDrawerHeader` renders it; place it yourself in a custom header.
 * Plain text, no glass, so it may fade. On a narrow panel only the check shows (the message is still announced), and with a leading avatar it sits on the avatar's corner instead (`variant="badge"`, its parent must be positioned),
 * so the title row never re-wraps. Hidden from screen readers: the panel's live region speaks for it.
 *
 * Keyboard: none. Accessibility: `aria-hidden`; the message is announced by the panel's polite live region. Glass and motion: the check pops in with a spring and fades out; reduced motion only fades.
 *
 * @example
 * ```tsx
 * import { SideDrawerNotice, SideDrawerTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <SideDrawerTitle>Order #1042</SideDrawerTitle>
 *       <SideDrawerNotice />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerNotice({ className, variant = "inline" }: SideDrawerNoticeProps) {
  const notice = useContext(NoticeContext);
  const reduced = useSheenReducedMotion();
  return (
    <AnimatePresence initial={false} mode="wait">
      {notice && (
        <motion.span
          key={notice.id}
          aria-hidden
          data-slot="side-drawer-notice"
          data-variant={variant}
          title={typeof notice.message === "string" ? notice.message : undefined}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: variant === "badge" ? 0.3 : 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: reduced ? { duration: duration.fast } : spring.bouncy }}
          exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
          className={cn(
            variant === "inline"
              ? "inline-flex min-w-0 origin-left items-center gap-1 text-xs font-medium whitespace-nowrap text-sheen-success-text rtl:origin-right"
              : [
                  "pointer-events-none absolute -end-1 -bottom-1 grid size-[1.125rem] place-items-center rounded-full",
                  "bg-[var(--sheen-bg)] text-sheen-success-text forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
                ],
            className,
          )}
        >
          <CheckCircleIcon className="size-4 shrink-0" />
          {variant === "inline" && <span className="truncate @max-md/side-drawer:hidden">{notice.message}</span>}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ---------- Header ---------- */

/** Ghost icon button used in drawer headers / footers: 36px, 44px hit area on touch screens. */
export const sideDrawerIconButtonClass = cn(
  "relative inline-flex size-9 shrink-0 items-center justify-center rounded-sheen-md text-sheen-fg-muted [&_svg]:size-[1.125rem]",
  "transition-[color,background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
  "data-popup-open:bg-sheen-hover data-popup-open:text-sheen-fg",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-sheen-fg-muted",
  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
  "any-pointer-coarse:after:absolute any-pointer-coarse:after:-inset-1",
  "forced-colors:border forced-colors:border-[ButtonText]",
);

/** Props of `SideDrawerCloseButton`: the Base UI `Drawer.Close` props minus the ones it sets itself. */
export type SideDrawerCloseButtonProps = Omit<ComponentProps<typeof BaseDrawer.Close>, "children">;

/**
 * The × button, with an "Esc" tooltip. Closes through the close guards. `SideDrawerHeader` renders it (turn it off with `showClose={false}`); place it yourself in a custom header.
 *
 * Keyboard: Enter or Space closes. Accessibility: a labelled button (`labels.close`) with a 44px hit area on touch screens. Glass and motion: colour transitions only.
 *
 * @example
 * ```tsx
 * import { SideDrawerCloseButton } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerCloseButton />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerCloseButton({ className, ...props }: SideDrawerCloseButtonProps) {
  const { labels } = useSideDrawerContext("SideDrawerCloseButton");
  return (
    <Tooltip
      content={
        <span className="flex items-center gap-2">
          {labels.close}
          <Kbd>{labels.escapeKey}</Kbd>
        </span>
      }
    >
      <BaseDrawer.Close
        data-slot="side-drawer-close"
        aria-label={labels.close}
        className={classNameWith(className, (extra) => cn(sideDrawerIconButtonClass, extra))}
        {...props}
      >
        <CloseIcon />
      </BaseDrawer.Close>
    </Tooltip>
  );
}

/**
 * Props of `SideDrawerHeader`: the native `<div>` props plus its own options, each documented on its
 * field.
 */
export type SideDrawerHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  /** The drawer's name (rendered as its accessible title). */
  title?: ReactNode;
  /** One line under the title (rendered as the accessible description). */
  description?: ReactNode;
  /** Shows an avatar or icon before the title. */
  leading?: ReactNode;
  /** Next to the title: a status Badge, a count. */
  status?: ReactNode;
  /** Shows the buttons before the ×: Edit, a ⋯ menu. */
  actions?: ReactNode;
  /** Shows the × close button in the header. Default true. */
  showClose?: boolean;
  /** Below the title row: Tabs, filters, a toolbar. */
  children?: ReactNode;
};

/**
 * Sticky header: an optional leading slot, the title with its status, the actions and a close button, with the description underneath. The description runs under the actions too, so on a narrow panel an email or id keeps the full width. Gets a hairline once the body scrolls.
 * `title` is the drawer's accessible name and `description` its description; `leading` is an avatar or icon; `status` a Badge or count; `actions` buttons before the ×; `children` render below the title row (Tabs, filters, a toolbar).
 *
 * Keyboard: the actions and × are normal tab stops. Accessibility: the title is an `h2`; see `SideDrawer`. Glass and motion: flat; the hairline fades in with scroll.
 *
 * @example
 * ```tsx
 * import { Avatar, Badge, SideDrawerHeader } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerHeader
 *       title="Ada Lovelace"
 *       description="ada@example.com"
 *       leading={<Avatar name="Ada Lovelace" />}
 *       status={<Badge>Pro</Badge>}
 *     />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerHeader({
  title,
  description,
  leading,
  status,
  actions,
  showClose = true,
  className,
  children,
  ...props
}: SideDrawerHeaderProps) {
  const { scroll } = useContext(ScrollContext);
  const hasActions = Boolean(actions) || showClose;
  return (
    <div
      data-slot="side-drawer-header"
      data-scrolled={!scroll.atTop || undefined}
      className={cn(
        "relative z-10 flex shrink-0 flex-col gap-3 border-b border-transparent px-4 pt-4 pb-3 @sm/side-drawer:px-5",
        "transition-[border-color] duration-(--sheen-duration-base) ease-sheen-out data-scrolled:border-sheen-border",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "grid min-w-0 items-start gap-x-3 gap-y-1",
          leading
            ? hasActions
              ? "grid-cols-[auto_minmax(0,1fr)_auto]"
              : "grid-cols-[auto_minmax(0,1fr)]"
            : hasActions
              ? "grid-cols-[minmax(0,1fr)_auto]"
              : "grid-cols-1",
        )}
      >
        {leading && (
          <div className="row-span-2 flex items-center">
            <span className="relative inline-flex">
              {leading}
              {/* Narrow panel: the check rides on the avatar, so the title row keeps its shape. */}
              <SideDrawerNotice variant="badge" className="hidden @max-md/side-drawer:grid" />
            </span>
          </div>
        )}
        <div className="flex min-h-9 min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {title && <SideDrawerTitle>{title}</SideDrawerTitle>}
          {status}
          <SideDrawerNotice className={leading ? "@max-md/side-drawer:hidden" : undefined} />
        </div>
        {hasActions && (
          <div className="-me-1.5 flex items-center gap-0.5">
            {actions}
            {showClose && <SideDrawerCloseButton />}
          </div>
        )}
        {description && (
          <SideDrawerDescription render={<div />} className={cn(leading ? "col-start-2 -col-end-1" : "col-span-full")}>
            {description}
          </SideDrawerDescription>
        )}
      </div>
      {children}
    </div>
  );
}

/** Props of `SideDrawerTitle`: the `DrawerTitle` props, unchanged. */
export type SideDrawerTitleProps = ComponentProps<typeof DrawerTitle>;
/** Props of `SideDrawerDescription`: the `DrawerDescription` props, unchanged. */
export type SideDrawerDescriptionProps = ComponentProps<typeof DrawerDescription>;

/**
 * The drawer's heading. It is the dialog's accessible name. `SideDrawerHeader` renders one from its `title` prop; use this directly in a custom header.
 *
 * Keyboard: none. Accessibility: an `h2` wired as `aria-labelledby`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { SideDrawerTitle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerTitle>Order #1042</SideDrawerTitle>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerTitle({ className, ...props }: SideDrawerTitleProps) {
  return (
    <DrawerTitle
      className={classNameWith(className, (extra) =>
        cn(
          "min-w-0 text-base leading-snug font-semibold tracking-tight [overflow-wrap:anywhere] @md/side-drawer:text-lg",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/**
 * Muted helper text under the title. It is the dialog's accessible description. `SideDrawerHeader` renders one from its `description` prop; use this directly in a custom header.
 *
 * Keyboard: none. Accessibility: wired as `aria-describedby`. Glass and motion: none.
 *
 * @example
 * ```tsx
 * import { SideDrawerDescription } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <SideDrawerDescription>Visible to your team.</SideDrawerDescription>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function SideDrawerDescription({ className, ...props }: SideDrawerDescriptionProps) {
  return (
    <DrawerDescription
      className={classNameWith(className, (extra) =>
        cn("min-w-0 text-sm text-sheen-fg-muted [overflow-wrap:anywhere]", extra),
      )}
      {...props}
    />
  );
}
