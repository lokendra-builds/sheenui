"use client";

import { memo, useEffectEvent, useRef, type RefObject, useLayoutEffect } from "react";
import { usePresence } from "motion/react";
import { duration, ease } from "../../../motion/tokens";
import { LegendKey } from "../chart-parts";
import { clamp, slotColor, TOOLTIP_DOCK_SPACE, type ChartColor } from "../chart-utils";
import { ChartTip } from "../heatmap";

/* ======================================================================
 * Small pieces
 * ====================================================================== */

/** Height of the band a narrow touch chart reserves above the timeline for the docked readout (two lines). */
export const DOCK_BAND = TOOLTIP_DOCK_SPACE + 18;

/** Height of the top header band of the timeline (the months), in px. */
export const HEADER_TOP = 24;
/** Height of the bottom header band of the timeline (the days or weeks), in px. */
export const HEADER_BOTTOM = 26;
/** Total height of the timeline header, in px. */
export const HEADER = HEADER_TOP + HEADER_BOTTOM;
/** Height of a task bar, in px. */
export const BAR_H = 20;
/** Size of a milestone diamond, in px. */
export const DIAMOND = 13;
/** Width of the fade at an edge of the timeline that has more plan beyond it. */
export const FADE = 28;
/** SVG labels keep their contrast where a line crosses them: a halo in the surface colour, under the glyphs. */
export const HALO =
  "[paint-order:stroke] [stroke-linejoin:round] [stroke-width:3px] [stroke:var(--sheen-chart-surface)] forced-colors:[stroke:Canvas]";

/** Wraps text in a first-strong isolate, so dates and numbers never reorder inside right-to-left text. */
export const isolate = (text: string) => (text ? `⁨${text}⁩` : text);
/** Formats an easing curve (four numbers) as a CSS `cubic-bezier()`. */
export const cssEase = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;
/** A drop-shadow filter that makes a bar glow in the colour of its slot in dark mode. */
export const glow = (slot: ChartColor | 0) =>
  `drop-shadow(0 0 6px light-dark(transparent, color-mix(in oklab, ${slotColor(slot)} 65%, transparent)))`;
/** The entrance cascade: row `order` starts `base` seconds in, a little after the row above. */
export const cascadeDelay = (order: number, base: number) => base + Math.min(0.7, order * 0.045);

/*
 * Rows are plain elements moved by Web Animations, not Motion components: a zoom or a collapse
 * re-renders every row of a long plan, and plain elements keep that cheap (no per-row animation
 * engine, no per-frame JavaScript).
 */

/**
 * A row's motion. Its place is baked into its geometry (no transform at rest: hundreds of rows
 * must not each become a transform node that every repaint has to layerize). When `y` changes (a
 * phase above collapsed or expanded) the row glides there: one Web Animation from its old place
 * (a FLIP offset) to none. A row added after the first view fades in when `appear` says so; a row
 * being removed fades out first (AnimatePresence). Long plans (`glide` false) just jump.
 */
export function useRow(
  ref: RefObject<HTMLElement | SVGElement | null>,
  y: number,
  reduced: boolean,
  firstView: RefObject<boolean>,
  { appear = false, glide = true }: { appear?: boolean; glide?: boolean } = {},
) {
  const [isPresent, safeToRemove] = usePresence();
  const lastY = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const prev = lastY.current;
    lastY.current = y;
    if (!el || reduced || typeof el.animate !== "function") return;
    if (prev === null) {
      if (appear && !firstView.current)
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration.base * 1000, easing: cssEase(ease.out) });
      return;
    }
    if (prev === y) return;
    // Where the row shows now: its old place, plus what is left of a glide still running.
    let offset = prev - y;
    const running = el.getAnimations().filter((a) => a.id === "glide");
    if (running.length) {
      offset += new DOMMatrix(getComputedStyle(el).transform).f;
      running.forEach((a) => a.cancel());
    }
    if (!glide) return;
    const anim = el.animate([{ transform: `translateY(${offset}px)` }, { transform: "none" }], {
      duration: duration.slower * 1000,
      easing: cssEase(ease.out),
    });
    anim.id = "glide";
  }, [y, reduced, appear, glide, ref, firstView]);
  useLayoutEffect(() => {
    if (isPresent) return;
    const el = ref.current;
    if (!el || reduced || typeof el.animate !== "function") {
      safeToRemove();
      return;
    }
    const out = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration.exit * 1000,
      easing: cssEase(ease.exit),
      fill: "forwards",
    });
    out.finished.then(
      () => safeToRemove(),
      () => undefined,
    );
    return () => out.cancel();
  }, [isPresent, reduced, ref, safeToRemove]);
}

/**
 * A mark's first-view entrance: `keyframes` (one Web Animation, held at its first frame until its
 * delay is up), started when `play` turns on, or on mount after that. Returns true while the mark
 * waits for its entrance (style it invisible then).
 */
export function useEntranceAnimation(
  ref: RefObject<Element | null>,
  play: boolean,
  reduced: boolean,
  keyframes: () => Keyframe[],
  options: () => KeyframeAnimationOptions,
) {
  const done = useRef(false);
  const start = useEffectEvent(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    el.animate(keyframes(), { fill: "backwards", ...options() });
  });
  useLayoutEffect(() => {
    if (!play || done.current) return;
    done.current = true;
    if (!reduced) start();
  }, [play, reduced]);
  return !play && !reduced;
}

/**
 * The reading on a narrow touch chart, pinned in the band above the timeline: two fixed lines (the
 * task and its dates, then duration, progress, dependencies and owner), each truncated, so it never
 * spills over the header. Every part is bidi-isolated, so dates keep their order on right-to-left
 * pages. Visual only: the chart announces the same through ChartAnnouncer.
 */
export function DockedReadout({
  title,
  value,
  color,
  details,
}: {
  title: string;
  value: string;
  color: string;
  details: string[];
}) {
  return (
    <div
      aria-hidden
      data-slot="chart-readout"
      className="glass-3 pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 flex-col justify-center gap-0.5 rounded-sheen-md px-3 text-xs"
    >
      <p className="flex min-w-0 items-center gap-2">
        <LegendKey color={color} />
        <span dir="auto" className="min-w-0 truncate font-medium text-sheen-fg">
          {title}
        </span>
        <bdi className="ms-auto shrink-0 font-semibold text-sheen-fg tabular-nums">{value}</bdi>
      </p>
      <p dir="auto" className="truncate text-sheen-fg-muted">
        {details.map((part, i) => (
          <span key={i}>
            {i > 0 && " · "}
            <bdi>{part}</bdi>
          </span>
        ))}
      </p>
    </div>
  );
}

/** ChartTip measures itself on every render: render it only when what it shows (or where) changes. */
export const StableTip = memo(ChartTip, (a, b) => JSON.stringify(a) === JSON.stringify(b));

/**
 * Everything that follows the horizontal scroll, written straight to the DOM (no React render per
 * scroll frame): the sticky month / year labels, labels cut by the edge of the view, and the edge
 * fades. Geometry is read from the overlay's data attributes, so this needs no closure.
 */
export function syncTimeline(scroller: HTMLElement, overlay: SVGSVGElement, pos: number) {
  const contentW = Number(overlay.dataset.cw);
  const viewW = Number(overlay.dataset.vw);
  const rtl = overlay.dataset.rtl === "true";
  for (const label of overlay.querySelectorAll<SVGTextElement>("[data-sticky]")) {
    const a = Number(label.dataset.a);
    const b = Number(label.dataset.b);
    const w = Number(label.dataset.w);
    // The label stays in view while any of its segment is; it hides once it's being pushed out.
    const at = clamp(pos + 8, a + 6, Math.max(a + 6, b - w - 6));
    if (at < pos + 2) {
      if (label.getAttribute("visibility") !== "hidden") label.setAttribute("visibility", "hidden");
      continue;
    }
    const x = String(Math.round((rtl ? contentW - at - w : at) * 10) / 10);
    if (label.getAttribute("x") !== x) label.setAttribute("x", x);
    if (label.hasAttribute("visibility")) label.removeAttribute("visibility");
  }
  // A label the edge of the view would cut fades out rather than show a stray "%".
  for (const label of overlay.querySelectorAll<SVGElement>("[data-fit]")) {
    const o = Number(label.dataset.o);
    const w = Number(label.dataset.w);
    label.toggleAttribute("data-out", !(o >= pos - 0.5 && o + w <= pos + viewW - 0.5));
  }
  // Fade an edge only while there is more plan beyond it. (The widths come from the geometry, so
  // this never forces a layout.)
  const max = Math.max(0, contentW - viewW);
  const more = { start: pos > 1, end: pos < max - 1 };
  const left = rtl ? more.end : more.start;
  const right = rtl ? more.start : more.end;
  const key = `${+left}${+right}`;
  if (scroller.dataset.edges !== key) {
    scroller.dataset.edges = key;
    scroller.toggleAttribute("data-fade", left || right);
    scroller.style.setProperty("--gantt-fade-l", `${left ? FADE : 0}px`);
    scroller.style.setProperty("--gantt-fade-r", `${right ? FADE : 0}px`);
  }
}

/** The small round marker, in the group's colour, before a group's name. */
export function GroupDot({ color }: { color: ChartColor | 0 }) {
  return (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full forced-colors:border forced-colors:border-[CanvasText]"
      style={{ backgroundColor: slotColor(color) }}
    />
  );
}

/* ---------- Scrolling in either direction ---------- */

/** Distance scrolled from the inline start (positive in LTR and RTL alike). */
export function scrollStart(el: HTMLElement, rtl: boolean) {
  return rtl ? -el.scrollLeft : el.scrollLeft;
}

/** Scrolls to an offset from the inline start (works in LTR and RTL), optionally smoothly. */
export function setScrollStart(el: HTMLElement, rtl: boolean, offset: number, smooth = false) {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const v = clamp(offset, 0, max);
  el.scrollTo({ left: rtl ? -v : v, behavior: smooth ? "smooth" : "auto" });
}
