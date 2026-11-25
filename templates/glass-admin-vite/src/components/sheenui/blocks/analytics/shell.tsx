"use client";

import type { ComponentProps } from "react";
import {
  memo,
  startTransition,
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { NoScriptReveal } from "../../lib/no-script-reveal";
import { HEADING_TAGS, headingBelow, type HeadingLevelOption } from "../../lib/heading";
import { duration, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { SegmentedControl } from "../../segmented/segmented";

import { Button } from "../../button/button";

import { CheckIcon } from "../icons";
import { ANALYTICS_RANGES, type AnalyticsRange } from "./data";
import { type AnalyticsLabels } from "./labels";
import { useLoopPlayback } from "../../motion/gate";
import {
  type AnalyticsGlass,
  DashboardBackdrop,
  GlassBudgetContext,
  PanelHeadingContext,
  noBlur,
  useAdaptiveGlass,
} from "./glass";
import { useMergedRef } from "../../lib/form";

/** A filter chip of `AnalyticsShell`: `value` is what `activeFilters` holds, `label` is the chip text. */
export type AnalyticsFilter = { value: string; label: string };

/** Props of `AnalyticsShell`. The state props (`range`, `live`, `compare`, `activeFilters`…) come straight from `useAnalyticsDashboard`. */
export type AnalyticsShellProps = {
  /** The root element (e.g. for useLiveTicker). */
  ref?: Ref<HTMLElement>;
  /** The dashboard's title (`ReactNode`, required), rendered as the heading `headingLevel`. */
  title: ReactNode;
  /** Shows a line under the title (`ReactNode`). */
  subtitle?: ReactNode;
  /** A small mark before the title. */
  icon?: ReactNode;
  /** Shown beside the title (e.g. a live visitors pill). */
  status?: ReactNode;
  /** The `id` of the title heading (`string`, required): the section is `aria-labelledby` it. */
  headingId: string;
  /** Heading level of the dashboard title (1 to 6), to fit the page outline, or `"none"` for a paragraph with no heading role (panel titles follow). Default 2. */
  headingLevel?: HeadingLevelOption;
  /** Sets the selected range (`AnalyticsRange`, required). */
  range: AnalyticsRange;
  /** Called when another range is picked (required). */
  onRangeChange: (range: AnalyticsRange) => void;
  /** The ranges offered (`readonly AnalyticsRange[]`, default all five: 24h, 7d, 30d, 90d, 12m). */
  ranges?: readonly AnalyticsRange[];
  /** Filter chips shown next to the range control; none when omitted or empty. */
  filters?: readonly AnalyticsFilter[];
  /** The `value`s of the chips that are on (required). */
  activeFilters: readonly string[];
  /** Called with the new list of active chip values (required). */
  onFiltersChange: (filters: string[]) => void;
  /** Whether live updates run (required); the Live toggle must stay (WCAG 2.2.2). */
  live: boolean;
  /** Called when the Live toggle is pressed (required). */
  onLiveChange: (live: boolean) => void;
  /** Whether the previous period is drawn (required). */
  compare: boolean;
  /** Called when the Compare toggle is pressed (required). */
  onCompareChange: (compare: boolean) => void;
  /** Called by the Export button. Omit to hide it. */
  onExport?: () => void;
  /** Keep Export disabled (`boolean`, default `false`), e.g. until the first data arrives: the button is always there, so the toolbar never shifts. */
  exportDisabled?: boolean;
  /** New data is on its way (`boolean`, default `false`): panels dim and scan, `aria-busy` is set, and "Loading" / "Updated" are announced once each. */
  loading?: boolean;
  /**
   * Glass on the panels: "auto" (default) keeps real glass while the device keeps up and falls
   * back to a frosted solid surface on weak devices or when frames drop; "full" / "flat" force one.
   */
  glass?: AnalyticsGlass;
  /** Draws a soft colour light behind the dashboard. Default true. */
  backdrop?: boolean;
  /** Every string of the shell and its panels (`AnalyticsLabels`, required): start from `defaultAnalyticsLabels`. */
  labels: AnalyticsLabels;
  /** The dashboard body, usually an `AnalyticsGrid` of `AnalyticsPanel`s. */
  children: ReactNode;
  /** Adds extra classes to the root `<section>` (`string`). */
  className?: string;
};

/**
 * The frame of a dashboard: a container-query root (the grid adapts to the space it gets, not to
 * the window) with a glass header. Its controls drop their own blur: one backdrop-filter, not six.
 * Use it to build a dashboard of your own; the five ready-made ones (web, SaaS, e-commerce,
 * product, finance) are built on it.
 *
 * Props (see `AnalyticsShellProps`): `title`, `headingId`, `range` / `onRangeChange`,
 * `activeFilters` / `onFiltersChange`, `live` / `onLiveChange`, `compare` / `onCompareChange` and
 * `labels` are required; `subtitle`, `icon`, `status`, `headingLevel` (`2`), `ranges`, `filters`,
 * `onExport`, `loading` (`false`), `glass` (`"auto"`), `backdrop` (`true`), `ref` and `className`
 * are optional.
 *
 * Keyboard: Tab reaches the range control (arrow keys move inside it), the filter chips (Space
 * or Enter toggles, `aria-pressed`), the Live and Compare toggles and Export. Pressed states use
 * a shape cue as well as colour.
 * Accessibility: a named `<section role="group">` (labelled by the title; not a landmark, so a dashboard can appear twice on a page) with `aria-busy` while loading; two polite live regions
 * announce loads once each; panels get a heading one level below the title.
 * Glass and motion: the header is the one `glass-3` surface that keeps its blur; panels follow
 * the adaptive glass budget (frosted solid when the device cannot keep up). The soft backdrop is
 * static; reduced motion removes the load scan and the entrance rise.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { AnalyticsGrid, AnalyticsPanel, AnalyticsShell, defaultAnalyticsLabels, type AnalyticsRange } from "@sheenui/theme";
 *
 * function Traffic() {
 *   const [range, setRange] = useState<AnalyticsRange>("30d");
 *   const [live, setLive] = useState(false);
 *   const [compare, setCompare] = useState(false);
 *   const [filters, setFilters] = useState<string[]>([]);
 *   return (
 *     <AnalyticsShell
 *       title="Traffic"
 *       headingId="traffic-title"
 *       range={range}
 *       onRangeChange={setRange}
 *       activeFilters={filters}
 *       onFiltersChange={setFilters}
 *       live={live}
 *       onLiveChange={setLive}
 *       compare={compare}
 *       onCompareChange={setCompare}
 *       labels={defaultAnalyticsLabels}
 *     >
 *       <AnalyticsGrid>
 *         <AnalyticsPanel title="Visitors" span={{ lg: 2 }} minHeight={240} ready labels={defaultAnalyticsLabels}>
 *           <p>Your chart or table goes here.</p>
 *         </AnalyticsPanel>
 *       </AnalyticsGrid>
 *     </AnalyticsShell>
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function AnalyticsShell({
  ref,
  title,
  subtitle,
  icon,
  status,
  headingId,
  headingLevel = 2,
  range,
  onRangeChange,
  ranges = ANALYTICS_RANGES,
  filters,
  activeFilters,
  onFiltersChange,
  live,
  onLiveChange,
  compare,
  onCompareChange,
  onExport,
  exportDisabled = false,
  loading = false,
  glass = "auto",
  backdrop = true,
  labels,
  children,
  className,
}: AnalyticsShellProps) {
  const Heading = HEADING_TAGS[headingBelow(headingLevel, 0)];
  const reduced = useSheenReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const setRoot = useMergedRef(rootRef, ref);
  const glassBudget = useAdaptiveGlass(rootRef, glass);
  const [exported, setExported] = useState(false);
  const exportTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(exportTimer.current), []);

  // Announce loads once each (not every live tick): "Loading new data…" → "Dashboard updated".
  const [announce, setAnnounce] = useState("");
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (loading && !wasLoading.current) setAnnounce(labels.loading);
    else if (!loading && wasLoading.current) setAnnounce(labels.loaded);
    wasLoading.current = loading;
  }, [loading, labels.loading, labels.loaded]);

  return (
    <section
      ref={setRoot}
      role="group"
      data-slot="analytics-shell"
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
      // Panels dim and show their scan line from this attribute (CSS): loading never re-renders them.
      data-busy={loading || undefined}
      data-glass-budget={glassBudget}
      className={cn(
        "group/dash @container relative flex w-full min-w-0 flex-col gap-4 @5xl:gap-5",
        // Glass budget: blur cost grows with radius × area, and these panels are large. Over the soft
        // backdrop a 14px blur reads exactly like 20px; phones go lighter still.
        "[--sheen-glass-2-blur:14px] [--sheen-glass-3-blur:24px] max-sm:[--sheen-glass-2-blur:10px] max-sm:[--sheen-glass-3-blur:16px]",
        className,
      )}
    >
      <NoScriptReveal />
      {backdrop && <DashboardBackdrop />}
      <header role="none" className="glass-3 flex min-w-0 flex-col gap-4 rounded-sheen-xl p-4 @2xl:p-5">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <span
                aria-hidden
                className="sheen-fill grid size-10 shrink-0 place-items-center rounded-sheen-md text-sheen-accent-fg shadow-(--sheen-accent-fill-shadow) [background-image:var(--sheen-accent-fill)]"
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <Heading
                  id={headingId}
                  className="text-lg leading-tight font-semibold tracking-tight text-balance @2xl:text-xl"
                >
                  {/* bdi: a name like "Lumen & Co." keeps its punctuation in place on right-to-left pages. */}
                  <bdi>{title}</bdi>
                </Heading>
                {status}
              </div>
              {subtitle && <p className="mt-0.5 text-sm text-pretty text-sheen-fg-muted">{subtitle}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <HeaderToggles
              live={live}
              compare={compare}
              onLiveChange={onLiveChange}
              onCompareChange={onCompareChange}
              labels={labels}
            />
            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                // Mounted from the first paint (a dashboard passes its handler before its data arrives) so the
                // toolbar keeps its width; there is nothing to export while the data loads.
                disabled={loading || exportDisabled}
                className="h-9 rounded-sheen-full border border-sheen-border px-3.5 text-sm any-pointer-coarse:h-11"
                leading={exported ? <CheckIcon className="size-4 text-sheen-success-text" /> : <DownloadIcon />}
                onClick={() => {
                  onExport();
                  setExported(true);
                  window.clearTimeout(exportTimer.current);
                  exportTimer.current = window.setTimeout(() => setExported(false), 2200);
                }}
              >
                {labels.export}
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <RangeControl range={range} ranges={ranges} onRangeChange={onRangeChange} labels={labels} />
          {filters && filters.length > 0 && (
            <FilterChips filters={filters} active={activeFilters} onChange={onFiltersChange} label={labels.filters} />
          )}
        </div>
        {/* Busy scan: a thin light runs along the header's bottom edge while data loads. */}
        <AnimatePresence>
          {loading && (
            <motion.span
              aria-hidden
              key="scan"
              className="pointer-events-none absolute inset-x-4 bottom-0 h-0.5 overflow-hidden rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: duration.exit, ease: ease.exit } }}
            >
              <span
                className={cn(
                  "block h-full w-1/3 bg-[linear-gradient(90deg,transparent,var(--sheen-accent),transparent)]",
                  !reduced &&
                    "animate-[sheen-indeterminate_var(--sheen-duration-loop-quick)_var(--sheen-ease-in-out)_infinite]",
                )}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </header>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <p aria-live="polite" className="sr-only">
        {exported ? labels.exported : ""}
      </p>

      <GlassBudgetContext value={glassBudget}>
        <PanelHeadingContext value={Heading === "p" ? "p" : Heading === "h1" ? "h2" : Heading === "h2" ? "h3" : "h4"}>
          {children}
        </PanelHeadingContext>
      </GlassBudgetContext>
    </section>
  );
}

/*
 * The header's controls are memoised pieces, each with its own optimistic state: a click answers
 * at once (only that control re-renders), while the dashboard re-renders in a transition that
 * React renders in slices, so a click never blocks the next frame.
 */

const RangeControl = memo(function RangeControl({
  range,
  ranges,
  onRangeChange,
  labels,
}: {
  range: AnalyticsRange;
  ranges: readonly AnalyticsRange[];
  onRangeChange: (range: AnalyticsRange) => void;
  labels: AnalyticsLabels;
}) {
  const [shown, setShown] = useOptimistic(range);
  // The accessible name starts with the visible text ("7d, Last 7 days"; WCAG 2.5.3 Label in Name), so
  // "click 7d" works for voice control. A long name that already contains the visible text is used as is.
  const items = useMemo(
    () =>
      ranges.map((r) => {
        const text = labels.ranges[r];
        const name = labels.rangeNames[r];
        return {
          value: r,
          label: text,
          "aria-label": name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ? name : `${text}, ${name}`,
        };
      }),
    [ranges, labels],
  );
  return (
    <SegmentedControl
      aria-label={labels.range}
      size="sm"
      value={shown}
      onValueChange={(v) =>
        startTransition(() => {
          setShown(v as AnalyticsRange);
          onRangeChange(v as AnalyticsRange);
        })
      }
      items={items}
      className={cn(noBlur, "max-w-full")}
    />
  );
});

const FilterChips = memo(function FilterChips({
  filters,
  active,
  onChange,
  label,
}: {
  filters: readonly AnalyticsFilter[];
  active: readonly string[];
  onChange: (filters: string[]) => void;
  label: string;
}) {
  const [shown, setShown] = useOptimistic(active);
  const toggle = (value: string) => {
    const next = shown.includes(value) ? shown.filter((f) => f !== value) : [...shown, value];
    startTransition(() => {
      setShown(next);
      onChange(next);
    });
  };
  return (
    <div role="group" aria-label={label} className="flex min-w-0 flex-wrap items-center gap-1.5">
      {filters.map((f) => (
        <PillToggle
          key={f.value}
          size="sm"
          pressed={shown.includes(f.value)}
          onPressedChange={() => toggle(f.value)}
          check
        >
          {f.label}
        </PillToggle>
      ))}
    </div>
  );
});

const HeaderToggles = memo(function HeaderToggles({
  live,
  compare,
  onLiveChange,
  onCompareChange,
  labels,
}: {
  live: boolean;
  compare: boolean;
  onLiveChange: (live: boolean) => void;
  onCompareChange: (compare: boolean) => void;
  labels: AnalyticsLabels;
}) {
  const [shownLive, setShownLive] = useOptimistic(live);
  const [shownCompare, setShownCompare] = useOptimistic(compare);
  const liveDescId = useId();
  const compareDescId = useId();
  return (
    <>
      <PillToggle
        pressed={shownLive}
        onPressedChange={(next) =>
          startTransition(() => {
            setShownLive(next);
            onLiveChange(next);
          })
        }
        describedBy={liveDescId}
        icon={<LiveDot on={shownLive} />}
      >
        {labels.live}
      </PillToggle>
      <span id={liveDescId} hidden>
        {labels.liveDescription}
      </span>
      <PillToggle
        pressed={shownCompare}
        onPressedChange={(next) =>
          startTransition(() => {
            setShownCompare(next);
            onCompareChange(next);
          })
        }
        describedBy={compareDescId}
        icon={<CompareIcon />}
      >
        {labels.compare}
      </PillToggle>
      <span id={compareDescId} hidden>
        {labels.compareDescription}
      </span>
    </>
  );
});

/** A pill toggle button (aria-pressed). Pressed: accent tint + a shape cue (✓ or a filled dot). */
function PillToggle({
  pressed,
  onPressedChange,
  icon,
  check = false,
  size = "md",
  describedBy,
  children,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  icon?: ReactNode;
  check?: boolean;
  size?: "sm" | "md";
  describedBy?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-describedby={describedBy}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-sheen-full border font-medium whitespace-nowrap select-none",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "transition-[color,background-color,border-color,scale] duration-(--sheen-duration-fast) ease-sheen-out motion-ok:active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        size === "sm" ? "h-8 px-3 text-xs any-pointer-coarse:h-11" : "h-9 px-3.5 text-sm any-pointer-coarse:h-11",
        pressed
          ? "border-sheen-accent-border bg-sheen-accent-soft text-sheen-accent"
          : "border-sheen-border text-sheen-fg-muted hover:bg-sheen-hover hover:text-sheen-fg",
        "forced-colors:aria-pressed:border-[Highlight] forced-colors:aria-pressed:underline forced-colors:aria-pressed:decoration-2 forced-colors:aria-pressed:underline-offset-4",
      )}
    >
      {check ? (
        <span
          aria-hidden
          className={cn(
            "grid size-3.5 place-items-center transition-opacity duration-(--sheen-duration-fast)",
            pressed ? "opacity-100" : "-ms-1 w-0 opacity-0",
          )}
        >
          {pressed && <CheckIcon className="size-3.5" />}
        </span>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

/**
 * The live indicator: a ring that pings while live (paused off-screen and in hidden tabs).
 *
 * Props: `on` (`boolean`, required: pinging ring and filled dot when true, a hollow dot when false) and
 * `className` (`string`). Accessibility: `aria-hidden`; the state is also a shape (filled or hollow) and
 * forced colours use `CanvasText`, so say "Live" in text beside it. Keyboard: none.
 * Motion: the ping runs only while the dot is on screen and the tab is visible, and not at all under
 * reduced motion.
 *
 * @example
 * ```tsx
 * import { LiveDot } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <span className="inline-flex items-center gap-2"><LiveDot on /> Live</span>
 *   );
 * }
 * ```
 *
 * @see /dashboards/web-analytics
 */
export function LiveDot({
  on,
  className,
}: {
  /** Whether the dot pulses: true while live updates are running. */
  on: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useLoopPlayback(ref, { respectReducedMotion: false });
  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="live-dot"
      className={cn("relative inline-flex size-2.5 shrink-0", className)}
    >
      {on && (
        <span
          className="absolute inset-0 rounded-full bg-sheen-success motion-ok:animate-ping"
          style={{ animationPlayState: visible ? "running" : "paused" }}
        />
      )}
      <span
        className={cn(
          "relative size-2.5 rounded-full border-2",
          on ? "border-sheen-success bg-sheen-success" : "border-sheen-fg-subtle bg-transparent",
          "forced-colors:border-[CanvasText]",
          on && "forced-colors:bg-[CanvasText]",
        )}
      />
    </span>
  );
}

/* ====================================================================================
 * Icons (decorative, currentColor)
 * ==================================================================================== */

function DownloadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M3 16c3-5 6-7 9-5s6 0 9-5" />
      <path d="M3 20c3-3 6-4 9-3s6-1 9-4" strokeDasharray="2.5 3" />
    </svg>
  );
}

/** Props of {@link LiveDot}. The live indicator: a ring that pings while live (paused off-screen and in hidden tabs). */
export type LiveDotProps = ComponentProps<typeof LiveDot>;
