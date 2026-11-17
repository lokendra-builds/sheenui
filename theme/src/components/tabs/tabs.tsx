"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { cn, classNameWith } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { isRtlAt, useResolvedDirection, watchDirection } from "../../hooks/use-direction";
import { useMergedRef } from "../../lib/form";
import { cssTimeToMs } from "./css-time";

/**
 * Tabs with a sliding glass pill: switch between panels of related content in the same place. This is the
 * root; compose it with `TabsList` > `TabsTab` and one `TabsPanel` per tab. Use `SegmentedControl` for a compact
 * choice that changes a value rather than a panel, and `VerticalNav` for site navigation.
 *
 * - Uncontrolled with `defaultValue`, or controlled with `value` + `onValueChange`. Each `TabsTab` and
 *   `TabsPanel` pair share a `value`.
 * - `className` styles the root (a flex column with a 1rem gap); `orientation` and other Base UI Tabs props pass through.
 *
 * Keyboard: Tab enters the tab list once (on the active tab) and then moves to the panel; ← → move between tabs
 * (↑ ↓ when vertical), Home and End jump to the first and last, and Enter or Space activates the focused tab
 * (set `activateOnFocus` on `TabsList` to activate as focus moves).
 * Accessibility: `tablist`, `tab` and `tabpanel` roles with `aria-selected` and `aria-controls` wired by Base UI;
 * touch targets are 44px tall; the active tab also gets an underline in forced colors, so it never relies on the pill alone.
 * Glass and motion: the pill is positioned by Base UI's `--active-tab-*` CSS variables, so the slide is pure CSS
 * (a `translate` transition, no layout properties) on the `glass-1` track. It uses the `snappy` spring twin
 * (`--sheen-ease-snappy` over `--sheen-duration-snappy`) and jumps instead of sliding with reduced motion.
 * When the tabs don't fit (phones, narrow cards) the list scrolls sideways instead of clipping: the
 * scrollbar is hidden, tabs snap into place, the edges fade where there is more to see, and the active tab is
 * scrolled into view whenever it changes.
 *
 * @example
 * ```tsx
 * import { Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Tabs defaultValue="overview">
 *       <TabsList aria-label="Project">
 *         <TabsTab value="overview">Overview</TabsTab>
 *         <TabsTab value="activity">Activity</TabsTab>
 *       </TabsList>
 *       <TabsPanel value="overview">Summary of the project.</TabsPanel>
 *       <TabsPanel value="activity">Recent changes.</TabsPanel>
 *     </Tabs>
 *   );
 * }
 * ```
 *
 * @see /components/tabs
 */
export function Tabs({ className, ...props }: ComponentProps<typeof BaseTabs.Root>) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      className={classNameWith(className, (extra) => cn("flex flex-col gap-4", extra))}
      {...props}
    />
  );
}

/** Set by `TabsList` when `morph` is on, so its tabs know to collapse to their icon. */
const TabsMorphContext = createContext(false);

/** Width (px) of the edge fade, and the scroll padding that keeps a revealed tab clear of it. */
const FADE = 24;

type Overflow = { scrolls: boolean; left: boolean; right: boolean };
const NO_OVERFLOW: Overflow = { scrolls: false, left: false, right: false };

/** The tabs of a list in DOM order (each one is a scroll-snap position at its inline start). */
function tabsOf(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLElement>("[role='tab']"));
}

/**
 * Scroll the list (never the page) so `tab` is fully visible, landing on a snap position
 * so scroll snapping doesn't nudge it back under the fade.
 */
function reveal(list: HTMLElement, tab: HTMLElement, smooth: boolean) {
  const max = list.scrollWidth - list.clientWidth;
  if (max <= 1) return;
  const rtl = isRtlAt(list);
  const l = list.getBoundingClientRect();
  const t = tab.getBoundingClientRect();
  // Distance of the tab from the list's scroll origin, independent of the current scroll.
  const start = rtl ? l.right - t.right + Math.abs(list.scrollLeft) : t.left - l.left + list.scrollLeft;
  const end = start + t.width;
  const current = Math.abs(list.scrollLeft);
  const view = list.clientWidth;

  let target = current;
  if (start < current + FADE) {
    target = start - FADE;
  } else if (end > current + view - FADE) {
    // The first tab start (a snap position) far enough along that the tab's end clears the fade.
    const needed = end + FADE - view;
    const snap = tabsOf(list)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return (rtl ? l.right - r.right + current : r.left - l.left + current) - FADE;
      })
      .find((s) => s >= needed - 0.5);
    target = snap ?? start - FADE;
  }
  target = Math.min(max, Math.max(0, target));
  if (Math.abs(target - current) < 1) return;
  // "auto" rather than "instant": older WebKit throws on the newer keyword.
  list.scrollTo({ left: rtl ? -target : target, behavior: smooth ? "smooth" : "auto" });
}

/**
 * The tab list. `className` styles the glass track; every other prop goes to Base UI's
 * Tabs.List (the element with role="tablist"). Name it with `aria-label` (or `aria-labelledby`) when the
 * surrounding page does not already name it. It scrolls sideways when the tabs do not fit, and the sliding pill follows the active tab.
 *
 * Keyboard and accessibility: see `Tabs`. Glass and motion: `glass-1` track; the pill springs between tabs
 * (instant under reduced motion); in forced colors it is outlined with `Highlight`. With `morph`, tabs that carry an `icon`
 * collapse to the icon and the active one widens to show its label (the layout changes at once; tabs and icons slide with transforms, the text fades with opacity).
 *
 * @example
 * ```tsx
 * import { TabsList, TabsTab } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TabsList aria-label="Settings sections">
 *       <TabsTab value="profile">Profile</TabsTab>
 *       <TabsTab value="billing">Billing</TabsTab>
 *     </TabsList>
 *   );
 * }
 * ```
 *
 * @see /components/tabs
 */
export function TabsList({
  className,
  children,
  ref,
  morph = false,
  ...props
}: Omit<ComponentProps<typeof BaseTabs.List>, "className"> & {
  /** Adds extra classes to the glass track. */ className?: string;
  /**
   * Tabs that have an `icon` show only the icon until they are active: the active tab widens to reveal its label
   * and the pill glides and resizes with it. Tabs without an `icon` are unchanged. Give every tab an `icon`
   * (the label stays the accessible name). Reduced motion: the label switches without sliding.
   *
   * @default false
   */
  morph?: boolean;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState<Overflow>(NO_OVERFLOW);
  // Subscribing to the direction re-renders the pill when `dir` flips at runtime (Base UI measures the active tab
  // while rendering, and a flip resizes nothing), through the one shared direction observer.
  const direction = useResolvedDirection(undefined, listRef);
  const reduced = useSheenReducedMotion();

  const setRefs = useMergedRef(listRef, ref);

  // Track whether the tabs overflow, and on which side there is more to scroll to.
  // Measured before paint, so tabs never flash past the edge of the track.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = list.scrollWidth - list.clientWidth;
      const scrolls = max > 1;
      const rtl = isRtlAt(list);
      // RTL scroll positions run from 0 (start, right edge) to -max.
      const fromStart = Math.abs(list.scrollLeft);
      const atStart = fromStart <= 1;
      const atEnd = fromStart >= max - 1;
      const next: Overflow = scrolls
        ? { scrolls, left: rtl ? !atEnd : !atStart, right: rtl ? !atStart : !atEnd }
        : NO_OVERFLOW;
      setOverflow((prev) =>
        prev.scrolls === next.scrolls && prev.left === next.left && prev.right === next.right ? prev : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();

    const resize = new ResizeObserver(schedule);
    const observeAll = () => {
      resize.disconnect();
      resize.observe(list);
      for (const tab of tabsOf(list)) resize.observe(tab);
    };
    observeAll();
    // Tabs added or removed later (and label changes) change the content width.
    const mutations = new MutationObserver(() => {
      observeAll();
      schedule();
    });
    mutations.observe(list, { childList: true, subtree: true, characterData: true });
    list.addEventListener("scroll", schedule, { passive: true });
    const unwatchDirection = watchDirection(schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      unwatchDirection();
      resize.disconnect();
      mutations.disconnect();
      list.removeEventListener("scroll", schedule);
    };
  }, []);

  // `morph`: the new layout (the active tab widened, the old one collapsed) is applied at once; each tab and icon is then
  // slid from where it was to where it is with a compositor transform (FLIP). Nothing reflows during the animation.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !morph) return;
    const layout = () =>
      new Map(
        tabsOf(list).map((tab) => {
          const icon = tab.querySelector<HTMLElement>("[data-morph-icon]");
          return [tab, { tab: tab.offsetLeft, icon: icon ? icon.offsetLeft : 0 }] as const;
        }),
      );
    let before = layout();
    const play = () => {
      const after = layout();
      const style = getComputedStyle(list);
      const duration = cssTimeToMs(style.getPropertyValue("--sheen-duration-snappy")) || 220;
      const easing = style.getPropertyValue("--sheen-ease-snappy").trim() || "linear";
      if (!reduced && typeof list.animate === "function") {
        for (const [tab, now] of after) {
          const was = before.get(tab);
          if (!was) continue;
          const dTab = was.tab - now.tab;
          const options = { duration, easing };
          if (Math.abs(dTab) > 0.5)
            tab.animate([{ transform: `translateX(${dTab}px)` }, { transform: "translateX(0)" }], options);
          // The icon sits inside its tab, which already carries `dTab`: slide only the difference.
          const icon = tab.querySelector<HTMLElement>("[data-morph-icon]");
          const dIcon = was.icon - now.icon;
          if (icon && Math.abs(dIcon) > 0.5)
            icon.animate([{ transform: `translateX(${dIcon}px)` }, { transform: "translateX(0)" }], options);
        }
      }
      before = after;
    };
    const selection = new MutationObserver(play);
    selection.observe(list, { attributes: true, attributeFilter: ["aria-selected"], subtree: true });
    // Resizes, font loads and added tabs change the layout without a selection: just re-measure.
    const resize = new ResizeObserver(() => {
      before = layout();
    });
    resize.observe(list);
    return () => {
      selection.disconnect();
      resize.disconnect();
    };
  }, [morph, reduced]);

  // Keep the active tab in view: instantly when the list first overflows, smoothly on change.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !overflow.scrolls) return;
    const active = list.querySelector<HTMLElement>("[role='tab'][aria-selected='true']");
    if (active) reveal(list, active, false);

    const selection = new MutationObserver((records) => {
      for (const record of records) {
        const tab = record.target as HTMLElement;
        if (tab.getAttribute("aria-selected") === "true") reveal(list, tab, !reduced);
      }
    });
    selection.observe(list, { attributes: true, attributeFilter: ["aria-selected"], subtree: true });
    // Arrow keys move focus before (or without) activating: reveal the focused tab too.
    const onFocus = (event: FocusEvent) => {
      const tab = (event.target as HTMLElement).closest<HTMLElement>("[role='tab']");
      if (tab && list.contains(tab)) reveal(list, tab, !reduced);
    };
    list.addEventListener("focusin", onFocus);
    return () => {
      selection.disconnect();
      list.removeEventListener("focusin", onFocus);
    };
  }, [overflow.scrolls, reduced]);

  return (
    // The glass track is a wrapper, so the edge fade (a mask) never sits on the glass itself:
    // a masked element would become a backdrop root and stop the blur.
    <div
      data-slot="tabs-track"
      className={cn("glass-1 inline-flex w-fit max-w-full min-w-0 rounded-sheen-full", className)}
    >
      <DirectionProvider direction={direction}>
        <TabsMorphContext value={morph}>
          <BaseTabs.List
            ref={setRefs}
            data-slot="tabs-list"
            data-overflow={overflow.scrolls || undefined}
            data-fade-left={overflow.left || undefined}
            data-fade-right={overflow.right || undefined}
            data-morph={morph || undefined}
            className={cn(
              "relative z-0 flex min-w-0 items-center gap-1 rounded-[inherit] p-1",
              // Only a scroll container while it overflows, so focus rings and the 44px touch
              // hit areas aren't clipped when everything fits.
              "data-overflow:snap-x data-overflow:snap-proximity data-overflow:overflow-x-auto data-overflow:overscroll-x-contain",
              "data-overflow:scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              // While scrolling, the track grows to 44px on touch screens so the tabs' hit areas still fit.
              "data-overflow:any-pointer-coarse:py-1.5",
              // Fade only the edges that have more tabs behind them.
              "[--fade-l:0px] [--fade-r:0px] data-fade-left:[--fade-l:24px] data-fade-right:[--fade-r:24px]",
              "data-overflow:[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-l),#000_calc(100%_-_var(--fade-r)),transparent)]",
            )}
            {...props}
          >
            {children}
            <BaseTabs.Indicator
              className={cn(
                "absolute top-1/2 left-0 -z-10 h-(--active-tab-height) w-(--active-tab-width) origin-left translate-x-(--active-tab-left) -translate-y-1/2 rounded-sheen-full",
                "bg-sheen-indicator shadow-(--sheen-indicator-shadow)",
                // Slides and resizes with the shared snappy spring: moving between tabs of different widths glides the
                // pill's width too. The pill is absolute and behind the tabs, so animating width reflows nothing.
                "motion-ok:transition-[translate,width] motion-ok:duration-(--sheen-duration-snappy) motion-ok:ease-sheen-snappy",
                // High contrast drops the pill's fill and shadow: outline it with the system highlight.
                "forced-colors:border-2 forced-colors:border-[Highlight]",
              )}
            />
          </BaseTabs.List>
        </TabsMorphContext>
      </DirectionProvider>
    </div>
  );
}

/**
 * One tab button. `value` links it to the `TabsPanel` with the same value; `disabled` skips it. Keep labels
 * short; an icon plus text is fine.
 *
 * Keyboard: ← → (or ↑ ↓) move focus along the list, Enter or Space activates the focused tab.
 * Accessibility: `role="tab"` with `aria-selected`; the hit area is 44px tall on touch; in forced colors the active
 * tab is underlined. Glass and motion: the pill behind the active tab slides (see `Tabs`); the label colour fades. With `icon` inside a `TabsList` with `morph`, only the icon shows until the tab is active.
 *
 * @example
 * ```tsx
 * import { TabsTab } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TabsTab value="billing">Billing</TabsTab>
 *   );
 * }
 * ```
 *
 * @see /components/tabs
 */
export function TabsTab({
  className,
  icon,
  children,
  ...props
}: ComponentProps<typeof BaseTabs.Tab> & {
  /** A decorative glyph before the label (rendered `aria-hidden`). In a `TabsList` with `morph`, the label shows only while the tab is active.
   *
   * @default undefined
   */
  icon?: ReactNode;
}) {
  const morph = useContext(TabsMorphContext) && icon != null;
  return (
    <BaseTabs.Tab
      data-slot="tabs-tab"
      className={classNameWith(className, (extra) =>
        cn(
          "group/tab relative inline-flex h-8 shrink-0 snap-start items-center justify-center gap-1.5 rounded-sheen-full px-4 text-sm font-medium whitespace-nowrap",
          "text-sheen-fg-muted transition-[color] duration-(--sheen-duration-fast) select-none",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "hover:text-sheen-fg data-active:text-sheen-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "sheen-hit",
          "forced-colors:data-active:underline forced-colors:data-active:decoration-[Highlight] forced-colors:data-active:decoration-2 forced-colors:data-active:underline-offset-4",
          // The final layout is applied at once; `TabsList` FLIPs the tabs and icons with transforms (never padding or widths).
          // Icon-only tabs sit 4 px apart, so their 44 px hit areas would overlap: on touch the tab itself is 44 px wide.
          morph && "gap-0 px-2.5 data-active:px-3.5 any-pointer-coarse:min-w-11",
          extra,
        ),
      )}
      {...props}
    >
      {icon != null && (
        <span aria-hidden data-morph-icon="" className="flex shrink-0 items-center [&_svg]:size-4">
          {icon}
        </span>
      )}
      {morph ? (
        // The label stays in the DOM (it is the tab's name). Inactive: out of flow, zero width and clipped, so the tab is
        // icon-sized at once; active: in flow at its natural width. No layout property is transitioned: `TabsList`
        // slides the tabs and icons with transforms, and the text fades in with opacity.
        <span className="absolute w-0 overflow-hidden group-data-active/tab:static group-data-active/tab:w-auto">
          <span
            data-morph-label=""
            className={cn(
              "block min-w-0 opacity-0 transition-opacity duration-(--sheen-duration-exit) motion-reduce:transition-none",
              "group-data-active/tab:opacity-100 group-data-active/tab:duration-(--sheen-duration-base)",
            )}
          >
            <span className="block ps-1.5">{children}</span>
          </span>
        </span>
      ) : (
        children
      )}
    </BaseTabs.Tab>
  );
}

/**
 * The content for one tab. `value` matches the `TabsTab`. Inactive panels are hidden (add `keepMounted` to keep
 * them in the DOM). The panel is focusable so keyboard users can reach scrollable content.
 *
 * Keyboard: Tab from the tab list lands on the panel. Accessibility: `role="tabpanel"` labelled by its tab.
 * Glass and motion: the panel rises 6px into place (`sheen-panel-in`, transform only because panels often hold glass); the leaving panel is removed at once, so switching quickly never shows two panels or jumps the height. With reduced motion it fades in over 100 ms with no movement.
 *
 * @example
 * ```tsx
 * import { TabsPanel } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <TabsPanel value="billing">Invoices and payment method.</TabsPanel>
 *   );
 * }
 * ```
 *
 * @see /components/tabs
 */
export function TabsPanel({ className, ref, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  const reduced = useSheenReducedMotion();
  // State, not a ref: Base UI renders nothing for an inactive panel, so the element appears (and disappears) later.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const setRefs = useMergedRef(setPanel, ref);

  // Reduced motion: the movement-free entrance is a short opacity fade (the shared instant duration token, 100 ms), never a
  // hard cut. The global reduced rule forces CSS animations to 1 ms, so the fade runs as a Web Animation.
  useEffect(() => {
    if (!reduced || !panel || typeof panel.animate !== "function") return;
    const fade = () => {
      if (panel.hidden) return;
      const ms = cssTimeToMs(getComputedStyle(panel).getPropertyValue("--sheen-duration-instant")) || 100;
      panel.animate({ opacity: [0, 1] }, { duration: Math.min(ms, 120), easing: "linear" });
    };
    fade();
    // keepMounted panels stay in the DOM and are only un-hidden.
    const observer = new MutationObserver(fade);
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    return () => observer.disconnect();
  }, [reduced, panel]);

  return (
    <BaseTabs.Panel
      ref={setRefs}
      data-slot="tabs-panel"
      className={classNameWith(className, (extra) =>
        cn(
          "rounded-sheen-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "data-ending-style:hidden",
          "motion-ok:animate-[sheen-panel-in_var(--sheen-duration-base)_var(--sheen-ease-out)]",
          extra,
        ),
      )}
      {...props}
    />
  );
}

/** Props of {@link Tabs}. Tabs with a sliding glass pill: switch between panels of related content in the same place. */
export type TabsProps = ComponentProps<typeof Tabs>;

/** Props of {@link TabsList}. The tab list. */
export type TabsListProps = ComponentProps<typeof TabsList>;

/** Props of {@link TabsTab}. One tab button. */
export type TabsTabProps = ComponentProps<typeof TabsTab>;

/** Props of {@link TabsPanel}. The content for one tab. */
export type TabsPanelProps = ComponentProps<typeof TabsPanel>;
