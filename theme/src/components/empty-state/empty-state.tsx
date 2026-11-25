"use client";

import { useEffect, type ComponentProps, type ReactNode } from "react";
import { motion, stagger, type Variants } from "motion/react";

import { cn } from "../../lib/cn";
import { warnOnce } from "../../lib/warn-once";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { duration, ease, spring } from "../../motion/tokens";

/* ---------- One long-lived polite live region for the page ---------- */

let liveRegion: HTMLElement | null = null;
let liveTimer: number | undefined;

/** Speak `message` politely through a status region that outlives any component. */
function announcePolitely(message: string) {
  if (typeof document === "undefined" || !message) return;
  let delay = 50;
  if (!liveRegion?.isConnected) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.dataset.slot = "empty-state-announcer";
    // Visually hidden (the sr-only recipe), inline so it needs no stylesheet.
    liveRegion.style.cssText =
      "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0";
    document.body.appendChild(liveRegion);
    // A brand-new region must be in the accessibility tree before its text changes.
    delay = 250;
  }
  const region = liveRegion;
  region.textContent = "";
  window.clearTimeout(liveTimer);
  liveTimer = window.setTimeout(() => {
    region.textContent = message;
  }, delay);
}

const tones = {
  accent: { icon: "text-sheen-accent", tint: "bg-sheen-accent-soft" },
  neutral: { icon: "text-sheen-fg-muted", tint: "bg-sheen-hover" },
  success: { icon: "text-sheen-success-text", tint: "bg-sheen-success-soft" },
  warning: { icon: "text-sheen-warning-text", tint: "bg-sheen-warning-soft" },
  danger: { icon: "text-sheen-danger-text", tint: "bg-sheen-danger-soft" },
} as const;

const surfaces = {
  none: "",
  glass: "glass-2 rounded-sheen-xl",
  dashed: "rounded-sheen-xl border-2 border-dashed border-sheen-fg-subtle/30 forced-colors:border-[GrayText]",
} as const;

/** Colour tone of the empty-state orb or tile: accent, neutral, success, warning or danger. */
export type EmptyStateTone = keyof typeof tones;

/** Props of `EmptyState`: the native `<div>` props plus its own options, each documented on its field. */
export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  /** An icon (24px, currentColor) shown in the glass orb (full) or tile (compact). */
  icon?: ReactNode;
  /** Your own artwork, shown instead of the orb (an SVG or image, sized by you). */
  illustration?: ReactNode;
  /** The heading: say what is missing ("No messages yet"). */
  title: ReactNode;
  /** One sentence on why it is empty and what to do. */
  description?: ReactNode;
  /** The main next step, usually a primary Button. */
  action?: ReactNode;
  /** A lower-emphasis alternative, usually a ghost or glass Button / link. */
  secondaryAction?: ReactNode;
  /** full (default): centred, for pages and panels. compact: one row, for tables and small cards. */
  variant?: "full" | "compact";
  /** none (default), glass (its own card) or dashed (a drop-zone-like outline). */
  surface?: keyof typeof surfaces;
  /** Colour of the icon and its tint (default "accent"). Words carry the meaning; colour only supports it. */
  tone?: EmptyStateTone;
  /** Heading level of the title (1 to 6, default 3), to fit the page outline. `"none"` renders a paragraph with no heading role. `false` is the deprecated spelling of `"none"` (still accepted, removed in 1.0). */
  headingLevel?: HeadingLevelOption | false;
  /** Entrance animation (off under reduced motion either way). Default true. */
  animated?: boolean;
  /**
   * Announce the empty state to screen readers when it appears (e.g. a search with no
   * results): true speaks the title and description (when they are text), a string speaks
   * that. Uses one persistent polite region, so it is read reliably.
   */
  announce?: boolean | string;
};

const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: spring.gentle },
};

/** Transform only: the actions may hold glass buttons, and a fading wrapper would stop their blur. */
const lift: Variants = {
  hidden: { y: 10 },
  visible: { y: 0, transition: spring.gentle },
};

const orb: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: spring.bouncy },
};

const ring: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: duration.slower, ease: ease.out, delay: 0.06 + i * 0.08 },
  }),
};

const cascade: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.06, { startDelay: 0.04 }) } },
};

/**
 * EmptyState: what a list, table, search or page shows when there is nothing in it yet, with one clear next step.
 * Use it instead of a blank area; pair the `action` with a primary `Button`.
 *
 * - `icon` (shown in a glass orb) or your own `illustration`, a `title`, a `description`, an `action` and a quieter `secondaryAction`.
 * - `variant="full"` (centred: a glass orb on soft rings over a fading dot grid) for pages, panels and first-run
 *   screens; `variant="compact"` (one row) for tables, sidebars and small cards.
 * - `surface` is "none" (default), "glass" (its own card) or "dashed" (a drop-zone-like outline); `tone` colours the icon;
 *   `headingLevel` sets the heading level (`"none"` renders a paragraph; `false` is a deprecated alias) so the page outline stays right.
 * - Search results that come back empty are worth announcing: pass `announce` (true speaks the title and description when
 *   they are text; a string speaks that). The message is written into one polite status region that stays mounted for
 *   the whole page (a live region that mounts together with its text, like a role="status" on this component, is often not
 *   read by NVDA and JAWS).
 *
 * Keyboard: not focusable itself; the buttons in `action` and `secondaryAction` are normal tab stops.
 * Accessibility: the title is a real heading (`h3` by default); the orb, rings and dot grid are `aria-hidden`; colour only supports the words.
 * Glass and motion: only the orb itself fades (it IS the glass); the actions row, which may hold glass buttons, only moves (a fading
 * wrapper would stop their blur). The orb springs in, the rings ripple out once, the words rise into place, staggered.
 * Reduced motion: everything is simply there. Forced colors hide the decorative rings and grid.
 *
 * @example
 * ```tsx
 * import { Button, EmptyState } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const InboxIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <EmptyState
 *       icon={<InboxIcon />}
 *       title="No messages yet"
 *       description="When someone writes to you, it shows up here."
 *       action={<Button>Compose</Button>}
 *       secondaryAction={<Button variant="ghost">Learn more</Button>}
 *     />
 *   );
 * }
 * ```
 *
 * @see /components/empty-state
 */
export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
  variant = "full",
  surface = "none",
  tone = "accent",
  headingLevel = 3,
  animated = true,
  announce,
  className,
  children,
  ...props
}: EmptyStateProps) {
  if (headingLevel === false) warnOnce('EmptyState: `headingLevel={false}` is deprecated, use `headingLevel="none"`.');
  const Title = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const reduced = useSheenReducedMotion();
  const spoken =
    typeof announce === "string"
      ? announce
      : announce
        ? [title, description].filter((part) => typeof part === "string" || typeof part === "number").join(". ")
        : "";
  useEffect(() => {
    if (spoken) announcePolitely(spoken);
  }, [spoken]);
  const animate = animated && !reduced;
  const hasActions = Boolean(action) || Boolean(secondaryAction);
  const t = tones[tone];

  if (variant === "compact") {
    return (
      <div
        data-slot="empty-state"
        data-variant="compact"
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-3",
          surfaces[surface],
          surface !== "none" && "p-4 sm:px-5",
          className,
        )}
        {...props}
      >
        {(Boolean(illustration) || Boolean(icon)) && (
          <motion.div
            aria-hidden
            initial={animate ? "hidden" : false}
            animate="visible"
            variants={orb}
            className={cn(
              illustration
                ? "shrink-0"
                : "glass-1 relative grid size-11 shrink-0 place-items-center rounded-sheen-md [&_svg]:size-5",
              !illustration && t.icon,
            )}
          >
            {illustration ?? (
              <>
                <span className={cn("absolute inset-0 -z-10 rounded-[inherit]", t.tint)} />
                {icon}
              </>
            )}
          </motion.div>
        )}
        <div className="flex min-w-[min(12rem,100%)] flex-1 flex-col gap-0.5">
          <Title className="text-sm font-semibold text-balance text-sheen-fg">{title}</Title>
          {description && <p className="text-sm text-pretty text-sheen-fg-muted">{description}</p>}
        </div>
        {hasActions && (
          <div className="flex flex-wrap items-center gap-2">
            {secondaryAction}
            {action}
          </div>
        )}
        {children && <div className="basis-full">{children}</div>}
      </div>
    );
  }

  return (
    <motion.div
      data-slot="empty-state"
      data-variant="full"
      initial={animate ? "hidden" : false}
      animate="visible"
      variants={cascade}
      className={cn(
        "relative isolate flex flex-col items-center px-4 text-center",
        surfaces[surface],
        surface === "none" ? "py-6" : "px-6 py-10 sm:px-10 sm:py-12",
        className,
      )}
      {...(props as ComponentProps<typeof motion.div>)}
    >
      {illustration ? (
        <motion.div aria-hidden variants={rise} className="mb-6">
          {illustration}
        </motion.div>
      ) : (
        icon && (
          <div aria-hidden className="relative mb-7 grid size-44 place-items-center">
            {/* Dot grid fading out from the centre: crisp around the orb, frosted under it. */}
            <span className="absolute -inset-6 [background-image:radial-gradient(circle,var(--sheen-border)_1.2px,transparent_1.6px)] [background-size:14px_14px] [mask-image:radial-gradient(closest-side,black_30%,transparent)] forced-colors:hidden" />
            {/* Two hairline rings and a soft glow. */}
            <motion.span
              custom={1}
              variants={ring}
              className="absolute inset-0 rounded-full border border-sheen-border forced-colors:hidden"
            />
            <motion.span
              custom={0}
              variants={ring}
              className={cn(
                "absolute inset-[18%] rounded-full border border-sheen-border forced-colors:hidden",
                t.tint,
              )}
            />
            {/* The orb is the glass: it fades and scales itself (never its wrapper). */}
            <motion.span
              variants={orb}
              className={cn(
                "glass-2 relative grid size-[4.5rem] place-items-center rounded-full [&_svg]:size-7",
                t.icon,
              )}
            >
              <span className={cn("absolute inset-1.5 -z-10 rounded-full opacity-70", t.tint)} />
              {icon}
            </motion.span>
          </div>
        )
      )}

      <motion.div variants={rise}>
        <Title className="text-lg font-semibold tracking-tight text-balance text-sheen-fg sm:text-xl">{title}</Title>
      </motion.div>
      {description && (
        <motion.p variants={rise} className="mt-2 max-w-md text-sm text-pretty text-sheen-fg-muted sm:text-base">
          {description}
        </motion.p>
      )}
      {hasActions && (
        <motion.div
          variants={lift}
          className="mt-6 flex w-full flex-col-reverse items-stretch justify-center gap-2.5 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:items-center"
        >
          {secondaryAction}
          {action}
        </motion.div>
      )}
      {children && (
        <motion.div variants={lift} className="mt-6 w-full max-w-md">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
