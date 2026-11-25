"use client";

import type { ComponentProps } from "react";
import {
  createElement,
  memo,
  startTransition,
  useContext,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { motion } from "motion/react";
import { observeIntersection } from "../../hooks/use-intersection";
import { cn } from "../../lib/cn";
import { isScrolling } from "../../motion/beat";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

import { TabsList, TabsTab } from "../../tabs/tabs";
import { Button } from "../../button/button";

import { LegendKey, type LegendItem } from "../../charts/chart-parts";
import { budgetDelay, useInViewSettled } from "../../charts/chart-utils";
import { AlertIcon, RefreshIcon } from "../icons";
import { type AnalyticsLabels } from "./labels";
import { useLoopPlayback } from "../../motion/gate";
import { GlassBudgetContext, PanelHeadingContext, flatCard, noBlur } from "./glass";

/* ====================================================================================
 * Grid + panel
 * ==================================================================================== */

/** Columns a panel spans: in the 2-column (md) and 4-column (lg) layouts. Phones: always 1. */
export type PanelSpan = { md?: 1 | 2; lg?: 1 | 2 | 3 | 4 };

const SPAN_MD = { 1: "@2xl:col-span-1", 2: "@2xl:col-span-2" } as const;

const SPAN_LG = { 1: "@5xl:col-span-1", 2: "@5xl:col-span-2", 3: "@5xl:col-span-3", 4: "@5xl:col-span-4" } as const;

/**
 * 1 column below 42rem of container width, 2 up to 64rem, then 4.
 *
 * Props: `children` (`ReactNode`, required, usually `AnalyticsPanel`s) and `className` (`string`).
 * Accessibility and keyboard: a plain `<div>`, no semantics of its own; keep the source order
 * meaningful because the visual order follows it. Glass and motion: none of its own.
 *
 * @example
 * ```tsx
 * import { AnalyticsGrid, AnalyticsPanel, defaultAnalyticsLabels } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <AnalyticsGrid>
 *       <AnalyticsPanel title="Visitors" span={{ md: 2, lg: 2 }} minHeight={280} ready labels={defaultAnalyticsLabels}>…</AnalyticsPanel>
 *     </AnalyticsGrid>
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function AnalyticsGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-slot="analytics-grid"
      className={cn("grid min-w-0 grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-5", className)}
    >
      {children}
    </div>
  );
}

/** Props of `AnalyticsPanel`. */
export type AnalyticsPanelProps = {
  /** The panel's heading (`string`, required); it also names the chart / table views. */
  title: string;
  /** A line under the title (`ReactNode`): what is shown, its unit. */
  description?: ReactNode;
  /** Top right, before the Chart / Table switch (a headline number, a small control). */
  aside?: ReactNode;
  /** Legend under the header (two or more series only). `kind: "dashed"` keys a dashed line. */
  legend?: PanelLegendItem[];
  /** The table view of the chart. When given, the panel gets a Chart / Table switch. */
  table?: ReactNode;
  /** Columns the panel spans (`PanelSpan`, default one column everywhere): `md` in the 2-column layout, `lg` in the 4-column one. */
  span?: PanelSpan;
  /** Height reserved for the body before its chart mounts, so nothing shifts. */
  minHeight: number;
  /** Data is present. While false the body is a skeleton. */
  ready: boolean;
  /** Entrance order (staggered, at most 400 ms across the dashboard). */
  index?: number;
  /** How many panels share the entrance (for the stagger budget). */
  count?: number;
  /** id of the panel's root (e.g. for aria-controls). */
  id?: string;
  /**
   * What the chart depends on. With it, the chart re-renders only when one of these changes
   * (not when the panel turns busy), and a change lands one frame after the panel before it:
   * new data ripples across the dashboard instead of landing in one long task.
   */
  deps?: readonly unknown[];
  /** Strings of the Chart / Table switch (`Pick<AnalyticsLabels, "chart" | "table" | "viewAs">`, required). */
  labels: Pick<AnalyticsLabels, "chart" | "table" | "viewAs">;
  /** The chart. A function is only called once the panel is near the viewport. */
  children: ReactNode | (() => ReactNode);
  /** Adds extra classes to the glass card (`string`). */
  className?: string;
  /** Classes for the body under the header (`string`). */
  bodyClassName?: string;
};

const viewTabClass =
  "h-7 px-3 text-xs any-pointer-coarse:h-7 any-pointer-coarse:text-xs " +
  "any-pointer-coarse:before:absolute any-pointer-coarse:before:inset-x-0 any-pointer-coarse:before:-inset-y-2";

const panelBodyClass =
  "flex min-w-0 flex-col gap-3 rounded-sheen-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus";

/**
 * Chart mounts go one at a time, a frame pair apart. A row of panels (or a whole screen on a fast
 * scroll) comes "near" in the same instant; without this, every chart in it commits its SVG, its
 * layout effects and its first measurements in ONE task (60-90 ms on a 4x-throttled CPU). The
 * charts still appear in order, just one beat apart, which reads as the ripple they already have.
 */
const mountQueue: (() => void)[] = [];

let mountTimer = 0;

/** A chart commit mid-scroll lands in the frame being scrolled: wait for the scroll to settle, but never longer than this (ms). */
const SCROLL_DEFER_MAX = 450;
let deferredSince = 0;

function pumpMounts() {
  mountTimer = window.setTimeout(() => {
    mountTimer = 0;
    if (isScrolling() && mountQueue.length) {
      deferredSince ||= performance.now();
      if (performance.now() - deferredSince < SCROLL_DEFER_MAX) {
        pumpMounts();
        return;
      }
    }
    deferredSince = 0;
    mountQueue.shift()?.();
    if (mountQueue.length) pumpMounts();
  }, 32);
}

function queueMount(mount: () => void) {
  mountQueue.push(mount);
  if (!mountTimer) pumpMounts();
  return () => {
    const i = mountQueue.indexOf(mount);
    if (i >= 0) mountQueue.splice(i, 1);
  };
}

/** True one queued slot after `near` first turns true (then stays true). */
function useMountSlot(near: boolean) {
  const [slot, setSlot] = useState(false);
  useEffect(() => {
    if (!near || slot) return;
    return queueMount(() => setSlot(true));
  }, [near, slot]);
  return slot;
}

function AnalyticsPanelImpl({
  title,
  description,
  aside,
  legend,
  table,
  span,
  minHeight,
  ready,
  index = 0,
  count = 8,
  id,
  deps,
  labels,
  children,
  className,
  bodyClassName,
}: AnalyticsPanelProps) {
  const reduced = useSheenReducedMotion();
  const flat = useContext(GlassBudgetContext) === "flat";
  const ref = useRef<HTMLDivElement>(null);
  const near = useInViewSettled(ref, { margin: "320px 0px" });
  const [view, setView] = useState<string>("chart");
  const titleId = useId();
  // The chart mounts in its queued slot, in a deferred (time-sliced) render: scrolling a panel into
  // view never blocks a frame, and two panels never commit their charts in the same task.
  const slot = useMountSlot(near);
  const mounted = useDeferredValue(slot && ready);
  const version = useStaggeredVersion(deps, index, ref);

  const headingLevel = useContext(PanelHeadingContext);
  const render = typeof children === "function" ? children : () => children;
  // The skeleton only pulses once the panel is near the viewport (it is unmounted before anyone could see it).
  const body = mounted ? (
    <PanelBody render={render} version={deps ? version : NaN} />
  ) : (
    <PanelSkeleton height={minHeight} pulse={near} />
  );
  const content = (
    <div className={cn("relative min-w-0", bodyClassName)} style={{ minHeight }}>
      {/* While the dashboard loads (data-busy on its root), the content dims: CSS only, no re-render.
          `[[data-busy]_&]` (an ancestor attribute selector) rather than `group-data-busy/dash:` on purpose: the
          group variant compiles to `:is(:where(.group)[data-busy] *)`, whose universal descendant makes Chrome
          recalculate the style of the WHOLE dashboard subtree every time the attribute flips (a 10+ ms task on
          a range switch); the attribute selector only invalidates the elements carrying this class. */}
      <div className="min-w-0 transition-opacity duration-(--sheen-duration-base) ease-sheen-out [[data-busy]_&]:opacity-50">
        {body}
      </div>
    </div>
  );

  // `table` is `null` (not `undefined`) while a dashboard has no data yet: keep the Chart/Table switch's room, so the
  // header does not grow (and wrap) when the data arrives.
  const pendingTable = table === null && !ready;
  const header = (
    <header role="none" className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        {createElement(headingLevel, { id: titleId, className: "text-[0.9375rem] leading-snug font-semibold" }, title)}
        {description && <p className="mt-0.5 text-sm text-sheen-fg-muted">{description}</p>}
      </div>
      {(Boolean(aside) || Boolean(table) || pendingTable) && (
        <div className="flex flex-wrap items-center gap-2">
          {aside}
          {(Boolean(table) || pendingTable) && (
            <TabsList
              aria-label={labels.viewAs(title)}
              className={cn(noBlur, pendingTable && "invisible")}
              {...(pendingTable ? { inert: true, "aria-hidden": true } : null)}
            >
              <TabsTab value="chart" className={viewTabClass}>
                {labels.chart}
              </TabsTab>
              <TabsTab value="table" className={viewTabClass}>
                {labels.table}
              </TabsTab>
            </TabsList>
          )}
        </div>
      )}
    </header>
  );
  const legendEl = legend && legend.length > 1 ? <PanelLegend items={legend} /> : null;
  const rootClass = cn(
    "glass-2 relative flex min-w-0 flex-col gap-4 rounded-sheen-lg p-4 @2xl:p-5",
    flatCard,
    span?.md && SPAN_MD[span.md],
    span?.lg && SPAN_LG[span.lg],
    className,
  );
  const motionProps = {
    ref,
    id,
    // A named group, not a region landmark: a dozen landmarks per dashboard is noise (headings
    // still navigate); the dashboard itself is the landmark.
    role: "group",
    "aria-labelledby": titleId,
    // Flat (budget) glass: no pointer light either. Lighting a panel promotes its rim to a compositor
    // layer and re-rasters the whole surface (50-110 ms on a 4x-throttled CPU the first time).
    "data-sheen-light": flat ? "off" : undefined,
    "data-sheen-reveal": "",
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: reduced
      ? { duration: duration.base }
      : {
          y: { type: "spring" as const, visualDuration: 0.55, bounce: 0.18, delay: budgetDelay(index, count, 0.07) },
          opacity: { duration: duration.base, ease: ease.out, delay: budgetDelay(index, count, 0.07) },
        },
  };

  // One root element whether or not a table arrives: swapping the root's element type (a plain div, then Tabs) would
  // remount the panel's DOM node while the viewport observers above still watch the old one, and a panel that began
  // below the fold would never be seen.
  return (
    <BaseTabs.Root
      value={view}
      onValueChange={(v) => setView(String(v))}
      render={<motion.div data-slot="analytics-panel" {...motionProps} />}
      className={rootClass}
    >
      {header}
      {table ? (
        <>
          {/* The chart is focusable itself, so its panel isn't an extra tab stop. */}
          <BaseTabs.Panel value="chart" tabIndex={-1} className={panelBodyClass}>
            {legendEl}
            {content}
          </BaseTabs.Panel>
          <BaseTabs.Panel value="table" className={panelBodyClass}>
            {mounted ? table : <PanelSkeleton height={minHeight} pulse={near} />}
          </BaseTabs.Panel>
        </>
      ) : (
        <>
          {legendEl}
          {content}
        </>
      )}
      <BusyScan />
    </BaseTabs.Root>
  );
}

/** A legend item; "dashed" draws the key of a previous-period line. */
export type PanelLegendItem = Omit<LegendItem, "kind"> & { kind?: LegendItem["kind"] | "dashed" };

/** Like ChartLegend, plus a dashed key. Keys are SVG (they survive forced colours); text stays in text colours. */
function PanelLegend({ items }: { items: PanelLegendItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sheen-fg-muted">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1.5">
          {item.kind === "dashed" ? (
            <svg aria-hidden width={16} height={10} viewBox="0 0 16 10" className="shrink-0 forced-color-adjust-none">
              <line
                x1={1}
                x2={15}
                y1={5}
                y2={5}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray="3 3"
                strokeLinecap="round"
                className="forced-colors:stroke-[CanvasText]"
              />
            </svg>
          ) : (
            <LegendKey color={item.color} kind={item.kind} />
          )}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

const sameDeps = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) =>
  a === b || (!!a && !!b && a.length === b.length && a.every((d, i) => Object.is(d, b[i])));

/**
 * Bumps a version when `deps` change, in a transition: `index` frames later when the panel is
 * near the viewport (charts ripple one after another), otherwise in idle time or as soon as it
 * scrolls near, whichever comes first. A range switch only pays for what can be seen. Nearness
 * is tracked by an IntersectionObserver in a ref (never state): scrolling re-renders nothing.
 */
function useStaggeredVersion(deps: readonly unknown[] | undefined, index: number, ref: RefObject<HTMLElement | null>) {
  const [version, setVersion] = useState(0);
  const last = useRef(deps);
  const pending = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const idle = useRef<number | undefined>(undefined);
  const nearRef = useRef(false);

  const cancel = () => {
    window.clearTimeout(timer.current);
    if (idle.current !== undefined && typeof window.cancelIdleCallback === "function")
      window.cancelIdleCallback(idle.current);
    idle.current = undefined;
  };
  const flush = useCallback(() => {
    cancel();
    if (!pending.current) return;
    pending.current = false;
    startTransition(() => setVersion((v) => v + 1));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeIntersection(
      el,
      (entry) => {
        nearRef.current = entry.isIntersecting;
        // Scrolled near with an update waiting: apply it now.
        if (nearRef.current && pending.current) {
          cancel();
          timer.current = window.setTimeout(flush, 16);
        }
      },
      { rootMargin: "120px 0px" },
    );
  }, [ref, flush]);

  useEffect(() => {
    const prev = last.current;
    last.current = deps;
    if (!deps || !prev || sameDeps(prev, deps)) return;
    // A newer change replaces a pending one; unrelated re-renders leave it alone.
    pending.current = true;
    cancel();
    if (nearRef.current) timer.current = window.setTimeout(flush, 24 + index * 34);
    // Safari has no requestIdleCallback.
    else if (typeof window.requestIdleCallback === "function")
      idle.current = window.requestIdleCallback(flush, { timeout: 2500 });
    else timer.current = window.setTimeout(flush, 600 + index * 60);
  });
  useEffect(() => cancel, []);
  return version;
}

/** The chart of a panel. With a version (deps given), it only re-renders when the version moves. */
const PanelBody = memo(
  function PanelBody({ render }: { render: () => ReactNode; version: number }) {
    return <>{render()}</>;
  },
  (a, b) => !Number.isNaN(b.version) && a.version === b.version,
);

/**
 * A glass card for one chart. Its frame (header + reserved height) renders straight away; the
 * chart itself mounts the first time the panel comes within 320px of the viewport. It rises in
 * once on first view (opacity on the glass element itself, never a wrapper). Use one per chart
 * inside an `AnalyticsGrid`.
 *
 * With `deps`, the panel trusts them: its chart, table and legend are only rebuilt when a dep
 * changes (or its frame props do). A dashboard re-render (a click, a live tick elsewhere) skips it.
 *
 * Props (see `AnalyticsPanelProps`): `title`, `minHeight`, `ready`, `labels` and `children` are
 * required; `description`, `aside`, `legend`, `table`, `span`, `index`, `count`, `id`, `deps`,
 * `className` and `bodyClassName` are optional.
 *
 * Keyboard: with a `table`, the Chart / Table switch is a tab list (Left and Right move, Home and
 * End jump); the chart itself is the focusable element (arrow keys read its points), so the panel
 * adds no extra tab stop.
 * Accessibility: the title is a heading one level below the dashboard's; while `ready` is false
 * the body is an `aria-hidden` skeleton; the table view gives screen readers the same numbers.
 * Glass and motion: a `glass-2` card (frosted solid in the flat glass budget); it rises in once
 * on first view and dims with a thin scan line while the shell is loading. Reduced motion shows
 * the final state at once.
 *
 * @example
 * ```tsx
 * import { AnalyticsPanel, TrendChart, defaultAnalyticsLabels, type TrendDatum } from "@sheenui/theme";
 *
 * function Visitors({ data }: { data: TrendDatum[] | null }) {
 *   return (
 *     <AnalyticsPanel title="Visitors" minHeight={280} ready={data !== null} labels={defaultAnalyticsLabels} span={{ md: 2, lg: 3 }}>
 *       {() => <TrendChart data={data ?? []} seriesLabel="Visitors" aria-label="Visitors over time" />}
 *     </AnalyticsPanel>
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export const AnalyticsPanel = memo(AnalyticsPanelImpl, (a, b) => {
  if (!a.deps || !b.deps) return false;
  return (
    sameDeps(a.deps, b.deps) &&
    a.title === b.title &&
    a.description === b.description &&
    a.aside === b.aside &&
    a.ready === b.ready &&
    a.minHeight === b.minHeight &&
    a.index === b.index &&
    a.count === b.count &&
    a.id === b.id &&
    a.labels === b.labels &&
    a.className === b.className &&
    a.bodyClassName === b.bodyClassName &&
    a.span?.md === b.span?.md &&
    a.span?.lg === b.span?.lg &&
    Boolean(a.table) === Boolean(b.table)
  );
});

/** A light running along the panel's top edge while the dashboard loads. Hidden (no animation) otherwise. */
function BusyScan() {
  const reduced = useSheenReducedMotion();
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-5 top-0 hidden h-0.5 overflow-hidden rounded-full [[data-busy]_&]:block"
    >
      <span
        className={cn(
          "block h-full w-1/3 bg-[linear-gradient(90deg,transparent,var(--sheen-accent),transparent)]",
          !reduced &&
            "animate-[sheen-indeterminate_var(--sheen-duration-loop-quick)_var(--sheen-ease-in-out)_infinite]",
        )}
      />
    </span>
  );
}

/**
 * Placeholder body: faint bars where the chart will be (opacity pulse only; still under reduced motion).
 * The loop runs only while the skeleton itself is near the viewport and the tab is visible (a
 * `once` flag is not enough: a loading example scrolled past, or a dashboard in a hidden tab, would
 * keep 7 animations per panel ticking for good). `pulse` false parks it regardless.
 *
 * Props: `height` (`number`, required, pixels the chart will need), `pulse` (`boolean`, default `true`;
 * `false` parks the animation) and `className` (`string`). Accessibility: `aria-hidden` (the panel's
 * own status says it is loading); no keyboard behaviour. Motion: an opacity pulse only, running only
 * while the skeleton is near the viewport and the tab is visible; under reduced motion it stays still.
 *
 * @example
 * ```tsx
 * import { PanelSkeleton } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <PanelSkeleton height={280} />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function PanelSkeleton({
  height,
  pulse = true,
  className,
}: {
  /** Height of the placeholder in px, matching the panel body it stands in for. */
  height: number;
  /** Sweep a light band across the placeholder while it is on screen. Default true. */
  pulse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useLoopPlayback(ref, { respectReducedMotion: false });
  const running = pulse && visible;
  const bars = [0.55, 0.8, 0.42, 0.68, 0.9, 0.6, 0.74];
  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="panel-skeleton"
      className={cn("flex w-full items-end gap-2 px-1 pb-1", className)}
      style={{ height }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-sheen-sm bg-sheen-hover motion-ok:animate-pulse"
          style={{
            height: `${h * 70}%`,
            animationDelay: `${i * 90}ms`,
            animationPlayState: running ? undefined : "paused",
          }}
        />
      ))}
    </div>
  );
}

/* ====================================================================================
 * Empty + error
 * ==================================================================================== */

/**
 * Whole-dashboard state under the header: no data, or the loader failed (with Retry).
 *
 * Props: `kind` (`"empty" | "error"`, required), `labels` (`AnalyticsLabels`, required; uses the
 * `empty*` / `error*` / `retry` strings) and `onRetry` (`() => void`; without it an error has no
 * Retry button). Use it under the shell when `useAnalyticsDashboard` reports `"empty"` or `"error"`.
 * Keyboard: Tab reaches the Retry button; Enter or Space presses it.
 * Accessibility: `role="alert"` for an error (announced at once) and `role="status"` for empty;
 * the heading level follows the dashboard's outline.
 * Glass and motion: one `glass-2` card (frosted solid in the flat budget); static.
 *
 * @example
 * ```tsx
 * import { AnalyticsState, defaultAnalyticsLabels } from "@sheenui/theme";
 *
 * const reload = () => window.location.reload();
 *
 * export function Example() {
 *   return (
 *     <AnalyticsState kind="error" labels={defaultAnalyticsLabels} onRetry={() => reload()} />
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function AnalyticsState({
  kind,
  labels,
  onRetry,
}: {
  /** "empty" when the query returned nothing, "error" when loading failed (it then offers Retry). */
  kind: "empty" | "error";
  /** The dashboard's strings (the state's title, description and Retry label). */
  labels: AnalyticsLabels;
  /** Called by the Retry button of the error state. Without it no Retry button shows. */
  onRetry?: () => void;
}) {
  const titleId = useId();
  const headingLevel = useContext(PanelHeadingContext);
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-labelledby={titleId}
      className={cn(
        "glass-2 flex min-h-72 flex-col items-center justify-center gap-3 rounded-sheen-xl px-6 py-12 text-center",
        flatCard,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-12 place-items-center rounded-full",
          kind === "error" ? "bg-sheen-danger-soft text-sheen-danger-text" : "bg-sheen-accent-soft text-sheen-accent",
        )}
      >
        {kind === "error" ? <AlertIcon className="size-6" /> : <EmptyChartIcon />}
      </span>
      {createElement(
        headingLevel,
        { id: titleId, className: "text-base font-semibold" },
        kind === "error" ? labels.errorTitle : labels.emptyTitle,
      )}
      <p className="max-w-md text-sm text-pretty text-sheen-fg-muted">
        {kind === "error" ? labels.errorDescription : labels.emptyDescription}
      </p>
      {kind === "error" && onRetry && (
        <Button
          variant="primary"
          size="sm"
          className="mt-1 any-pointer-coarse:h-11"
          leading={<RefreshIcon className="size-4" />}
          onClick={onRetry}
        >
          {labels.retry}
        </Button>
      )}
    </div>
  );
}

function EmptyChartIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V5M4 20h16" />
      <path d="M8 16v-3M12 16V9M16 16v-5" strokeDasharray="0.01 3.2" />
    </svg>
  );
}

/** Props of {@link AnalyticsGrid}. 1 column below 42rem of container width, 2 up to 64rem, then 4. */
export type AnalyticsGridProps = ComponentProps<typeof AnalyticsGrid>;

/** Props of {@link AnalyticsState}. Whole-dashboard state under the header: no data, or the loader failed (with Retry). */
export type AnalyticsStateProps = ComponentProps<typeof AnalyticsState>;

/** Props of {@link PanelSkeleton}. Placeholder body: faint bars where the chart will be (opacity pulse only; still under reduced motion). */
export type PanelSkeletonProps = ComponentProps<typeof PanelSkeleton>;
