"use client";

import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../lib/heading";
import { isValidElement, useId, useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "motion/react";

import { cn } from "../lib/cn";
import { duration, ease, spring } from "../motion/tokens";
import { useSheenReducedMotion } from "../hooks/use-preferences";
import { GlassCard } from "../components/glass-card/glass-card";

import { VisibleContext } from "./bento-grid/context";
import {
  type BentoChartLabels,
  BentoChartDemo,
  type BentoToastLabels,
  BentoToastDemo,
  type BentoOtpLabels,
  BentoOtpDemo,
  type BentoSwitchLabels,
  BentoSwitchDemo,
  type BentoAvatarLabels,
  BentoAvatarDemo,
} from "./bento-grid/demos";
import { ChartIcon, BellIcon, KeyIcon, LayersIcon, UsersIcon, ArrowRightIcon } from "./bento-grid/icons";

export { useBentoCellVisible } from "./bento-grid/context";
export {
  type BentoChartPeriod,
  type BentoChartLabels,
  defaultBentoChartLabels,
  type BentoChartDemoProps,
  BentoChartDemo,
  type BentoToast,
  defaultBentoToastLabels,
  type BentoToastLabels,
  type BentoToastDemoProps,
  BentoToastDemo,
  defaultBentoOtpLabels,
  type BentoOtpLabels,
  type BentoOtpDemoProps,
  BentoOtpDemo,
  defaultBentoSwitchLabels,
  type BentoSwitchLabels,
  type BentoSwitchDemoProps,
  BentoSwitchDemo,
  defaultBentoAvatarLabels,
  type BentoAvatarLabels,
  type BentoAvatarDemoProps,
  BentoAvatarDemo,
} from "./bento-grid/demos";

/**
 * Bento grid: an asymmetric grid of feature cells, each with a live mini-demo built from real
 * SheenUI components (sparkline, toast stack, OTP input, switches, avatar group).
 *
 *   <FeatureBento />                       // the ready-made block
 *
 *   <BentoGrid>                            // or compose your own
 *     <BentoCell colSpan={2} title="Analytics" visual={<BentoChartDemo />} />
 *     <BentoCell rowSpan={2} title="Notifications" visual={<BentoToastDemo />} />
 *   </BentoGrid>
 *
 * Lazy: a cell's visual mounts the first time the cell scrolls into view, so its entrance
 * animations play when they can be seen and nothing runs for cells nobody has reached.
 * Looping demos also pause while their cell is off screen (useBentoCellVisible).
 *
 * Motion: cells rise in one after another (the glass cell itself moves, never a wrapper
 * around glass). Reduced motion: cells only fade, demos skip their movement.
 *
 * Layout follows the grid's own width (container queries): 1 column, 2 from 36rem, 3 from 56rem.
 * Spans collapse on the way down, so the grid never overflows.
 */

/* ---------- Grid ---------- */

/** Props of `BentoGrid`. */
export type BentoGridProps = {
  /** Holds the cells (`ReactNode`, required): usually `BentoCell`s. */
  children: ReactNode;
  /** Classes for the outer element (the size container). */
  className?: string;
  /** Classes for the grid itself (gap, row height...). */
  gridClassName?: string;
};

/**
 * Props (see `BentoGridProps`): `children` (required), `className` (the size container) and
 * `gridClassName` (the grid itself: gap, row height). The grid follows its own width: 1 column, 2 from
 * 36rem, 3 from 56rem; cell spans shrink on the way down so it never overflows.
 * Keyboard and accessibility: a plain layout `<div>` with no semantics; cells carry their own headings.
 * Glass and motion: it adds no glass; each `BentoCell` is one glass card and rises in with a stagger.
 *
 * @example
 * ```tsx
 * import { BentoCell, BentoGrid } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoGrid>
 *       <BentoCell title="Fast" description="60 fps with heavy graphics." colSpan={2} />
 *       <BentoCell title="Accessible" description="WCAG AA, keyboard first." />
 *     </BentoGrid>
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoGrid({ children, className, gridClassName }: BentoGridProps) {
  return (
    <div data-slot="bento-grid" className={cn("@container w-full min-w-0", className)}>
      <div
        className={cn(
          "grid grid-flow-row-dense auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @4xl:gap-5",
          gridClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const colSpans = { 1: "", 2: "@xl:col-span-2", 3: "@xl:col-span-2 @4xl:col-span-3" } as const;
const rowSpans = { 1: "", 2: "@xl:row-span-2" } as const;

/** Props of `BentoCell`. */
export type BentoCellProps = {
  /** Sets the cell's heading (`ReactNode`, required). */
  title: ReactNode;
  /** Shows the text under the heading (`ReactNode`). */
  description?: ReactNode;
  /** Shows a small icon before the title. */
  icon?: ReactNode;
  /** Live preview or artwork. Mounted the first time the cell scrolls into view. */
  visual?: ReactNode;
  /** Columns spanned on the widest grid (3 columns); spans shrink with the grid. */
  colSpan?: 1 | 2 | 3;
  /** Sets how many rows the cell spans from 2 columns up. */
  rowSpan?: 1 | 2;
  /** "horizontal" puts the text beside the visual once the cell is wide enough. */
  orientation?: "vertical" | "horizontal";
  /** Adds a "learn more" link under the description. */
  href?: string;
  /** Text of the link (`string`, default "Learn more"). */
  cta?: string;
  /** Sets the position in the grid: staggers the entrance. */
  index?: number;
  /** Heading level of the title (1 to 6, default 3), or `"none"` for a paragraph with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Adds extra classes to the glass card (`string`). */
  className?: string;
  /** Adds extra classes to the visual area. */
  visualClassName?: string;
};

const MotionGlassCard = motion.create(GlassCard);

/* A cell's visual mounts lazily, so its box is reserved up front: the built-in demos are
   measured once (rem, so it follows the text size) and the cell is already its final height when
   the visual arrives, which keeps the page from shifting while it scrolls. */
const visualReserve = new Map<unknown, string>([
  [BentoChartDemo, "min-h-[15.9rem] @xl:min-h-52"],
  [BentoToastDemo, "min-h-[19.3rem]"],
  [BentoOtpDemo, "min-h-[16.9rem]"],
  [BentoSwitchDemo, "min-h-[16.9rem]"],
  [BentoAvatarDemo, "min-h-48"],
]);

/* The cell rises on a spring; its opacity only blinks in (duration.fast), so the glass controls
   inside it (toasts, OTP slots, pills) are never seen half-faded over the cell. */
const cellVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => {
    const delay = Math.min(index, 6) * 0.08;
    return {
      opacity: 1,
      y: 0,
      transition: { y: { ...spring.gentle, delay }, opacity: { duration: duration.fast, ease: ease.out, delay } },
    };
  },
};
const cellVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base } },
};

/**
 * Use it inside a `BentoGrid`. Props (see `BentoCellProps`): `title` (required), `description`, `icon`,
 * `visual` (mounted the first time the cell scrolls into view), `colSpan` (`1`), `rowSpan` (`1`),
 * `orientation` (`"vertical"`), `href` and `cta`, `index` (`0`, staggers the entrance), `headingLevel`
 * (`"h3"`), `className`, `visualClassName`.
 * Keyboard: the optional link is the only tab stop the cell adds. Accessibility: a heading plus text;
 * the visual is lazy, so cells nobody reached cost nothing, and decorative visuals should be `aria-hidden`.
 * Glass and motion: one glass card that rises in (the card itself moves, never a wrapper); reduced
 * motion only fades.
 *
 * @example
 * ```tsx
 * import { BentoCell, BentoChartDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoCell title="Analytics" description="Charts that tween." colSpan={2} visual={<BentoChartDemo />} href="/charts" />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoCell({
  title,
  description,
  icon,
  visual,
  colSpan = 1,
  rowSpan = 1,
  orientation = "vertical",
  href,
  cta = "Learn more",
  index = 0,
  headingLevel = 3,
  className,
  visualClassName,
}: BentoCellProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const reduced = useSheenReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Any part of the cell in view (minus a strip at the bottom edge): a fraction of a tall cell
  // could be out of reach on a short landscape screen.
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const visible = useInView(ref, { amount: 0 });
  const horizontal = orientation === "horizontal";

  return (
    <MotionGlassCard
      ref={ref}
      level={2}
      role="group"
      aria-labelledby={titleId}
      custom={index}
      variants={reduced ? cellVariantsReduced : cellVariants}
      initial="hidden"
      animate={seen ? "visible" : "hidden"}
      className={cn(
        "group/bento relative flex min-w-0 flex-col overflow-hidden rounded-sheen-xl",
        horizontal && "@4xl:flex-row",
        colSpans[colSpan],
        rowSpans[rowSpan],
        className,
      )}
    >
      {/* Soft accent wash in the corner: decorative, and it never sits behind text. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -end-24 -z-10 size-64 rounded-full opacity-60 [background:radial-gradient(closest-side,var(--sheen-accent-soft),transparent)]"
      />
      {visual !== undefined && (
        <div
          className={cn(
            "relative flex min-h-44 min-w-0 flex-1 items-center justify-center p-5",
            isValidElement(visual) && visualReserve.get(visual.type),
            horizontal && "@4xl:order-2 @4xl:basis-3/5",
            visualClassName,
          )}
        >
          <VisibleContext value={visible}>{seen ? visual : null}</VisibleContext>
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1.5 p-5 pt-0",
          visual === undefined && "pt-5",
          horizontal && "@4xl:basis-2/5 @4xl:justify-center @4xl:p-8",
        )}
      >
        <Heading id={titleId} className="flex items-center gap-2 text-base font-semibold tracking-tight">
          {icon && (
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-sheen-sm bg-sheen-accent-soft text-sheen-accent [&_svg]:size-4"
            >
              {icon}
            </span>
          )}
          {title}
        </Heading>
        {description && <p className="text-sm text-pretty text-sheen-fg-muted">{description}</p>}
        {href && (
          <a
            href={href}
            className={cn(
              "group/link mt-1 inline-flex w-fit items-center gap-1 rounded-sheen-sm text-sm font-medium text-sheen-accent",
              "underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
              "relative any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
            )}
          >
            {cta}
            <ArrowRightIcon className="size-3.5 motion-ok:transition-transform motion-ok:duration-(--sheen-duration-base) motion-ok:ease-sheen-out motion-ok:group-hover/link:translate-x-0.5 rtl:motion-ok:group-hover/link:-translate-x-0.5" />
          </a>
        )}
      </div>
    </MotionGlassCard>
  );
}

/* =====================================================================
 * Ready-made block
 * ===================================================================== */

/** Every user-facing string of the `FeatureBento` showcase: the chart, toast, one-time-code, switch and avatar cells. */
export type FeatureBentoLabels = {
  chartTitle: string;
  chartDescription: string;
  toastTitle: string;
  toastDescription: string;
  otpTitle: string;
  otpDescription: string;
  switchTitle: string;
  switchDescription: string;
  avatarTitle: string;
  avatarDescription: string;
  chart: Partial<BentoChartLabels>;
  toast: Partial<BentoToastLabels>;
  otp: Partial<BentoOtpLabels>;
  switches: Partial<BentoSwitchLabels>;
  avatars: Partial<BentoAvatarLabels>;
};

/** Props of `FeatureBento`. */
export type FeatureBentoProps = {
  /** Section heading (`ReactNode`); leave out for none. */
  title?: ReactNode;
  /** Shows text under the heading (`ReactNode`). */
  description?: ReactNode;
  /** Heading level of `title`; cell titles are one level below (`2 | 3`, default 2). `"none"` renders them all as paragraphs with no heading role (for an example). */
  headingLevel?: HeadingLevelOption;
  /** Overrides for the built-in English strings (`Partial<FeatureBentoLabels>`). */
  labels?: Partial<FeatureBentoLabels>;
  /** Adds extra classes to the outer `<section>`. */
  className?: string;
};

/** The English strings of `FeatureBento`; pass `labels` to override any of them. */
export const defaultFeatureBentoLabels: FeatureBentoLabels = {
  chartTitle: "Charts that move with your data",
  chartDescription: "Sparklines draw themselves in and morph between periods. Every number counts up.",
  toastTitle: "Toasts that stack",
  toastDescription: "Newest in front, older ones peek out behind. Hover or focus to fan them out.",
  otpTitle: "One-time codes",
  otpDescription: "Auto-advance, paste a whole code, shake on a miss.",
  switchTitle: "Real glass, live",
  switchDescription: "Frost, tint and float the tile and watch the blur react.",
  avatarTitle: "Built for teams",
  avatarDescription:
    "Presence, avatars and invites, with springs that feel physical and stay still for anyone who asks for less motion.",
  chart: {},
  toast: {},
  otp: {},
  switches: {},
  avatars: {},
};

/**
 * The ready-made feature section: a heading and a `BentoGrid` of cells, each with a live mini-demo
 * (chart, toasts, OTP, switches, avatars). Props (see `FeatureBentoProps`): `title`, `description`,
 * `headingLevel` (`2`), `labels`, `className`.
 * Keyboard: Tab visits the controls inside each demo in reading order. Accessibility: a labelled
 * `<section>` when it has a title; one heading per cell. Glass and motion: one glass card per cell, which
 * rise in with a stagger; demos mount when they scroll into view and pause off screen; reduced motion
 * only fades.
 *
 * @example
 * ```tsx
 * import { FeatureBento } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <FeatureBento title="Everything you need" description="Glass, motion and accessibility, built in." />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function FeatureBento({ title, description, headingLevel = 2, labels, className }: FeatureBentoProps) {
  const L = { ...defaultFeatureBentoLabels, ...labels };
  const headingId = useId();
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const cellHeading = headingBelow(headingLevel);

  return (
    <section
      role="group"
      aria-labelledby={title ? headingId : undefined}
      data-slot="feature-bento"
      className={cn("flex w-full min-w-0 flex-col gap-8", className)}
    >
      {(Boolean(title) || description) && (
        <div className="flex flex-col items-center gap-3 text-center">
          {title && (
            <Heading id={headingId} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </Heading>
          )}
          {description && <p className="max-w-xl text-base text-pretty text-sheen-fg-muted">{description}</p>}
        </div>
      )}
      <BentoGrid>
        <BentoCell
          index={0}
          colSpan={2}
          headingLevel={cellHeading}
          icon={<ChartIcon />}
          title={L.chartTitle}
          description={L.chartDescription}
          visual={<BentoChartDemo labels={L.chart} />}
        />
        <BentoCell
          index={1}
          rowSpan={2}
          headingLevel={cellHeading}
          icon={<BellIcon />}
          title={L.toastTitle}
          description={L.toastDescription}
          visual={<BentoToastDemo labels={L.toast} />}
        />
        <BentoCell
          index={2}
          headingLevel={cellHeading}
          icon={<KeyIcon />}
          title={L.otpTitle}
          description={L.otpDescription}
          visual={<BentoOtpDemo labels={L.otp} />}
        />
        <BentoCell
          index={3}
          headingLevel={cellHeading}
          icon={<LayersIcon />}
          title={L.switchTitle}
          description={L.switchDescription}
          visual={<BentoSwitchDemo labels={L.switches} />}
        />
        <BentoCell
          index={4}
          colSpan={3}
          orientation="horizontal"
          headingLevel={cellHeading}
          icon={<UsersIcon />}
          title={L.avatarTitle}
          description={L.avatarDescription}
          visual={<BentoAvatarDemo labels={L.avatars} />}
        />
      </BentoGrid>
    </section>
  );
}
