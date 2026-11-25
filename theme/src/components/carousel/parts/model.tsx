import { type ComponentProps, type ReactNode } from "react";

import { cn } from "../../../lib/cn";
import { clamp } from "../../../lib/math";

/** The physics behind `spring.smooth`: used for moves that must inherit the release velocity. */
export const FLING = { type: "spring", stiffness: 305, damping: 34.9, mass: 1 } as const;

/**
 * Carousel: swipeable slides with arrows, dots, autoplay and loop.
 *
 *   <Carousel aria-label="Featured templates" slidesPerView={{ 0: 1.15, 640: 2, 1024: 3 }} loop>
 *     <TemplateCard … />
 *     <TemplateCard … />
 *   </Carousel>
 *
 * Every child is one slide. Accessibility follows the WAI-ARIA APG carousel pattern:
 * a <section> with aria-roledescription="carousel", slides as role="group" +
 * aria-roledescription="slide" ("3 of 8"), a polite live region that announces what is in
 * view when you navigate ("Slide 3 of 8", or "Slides 4 to 6 of 8" when several fit), silent
 * while it rotates on its own, and slides that are fully off screen are `inert` (not
 * focusable, not read). Focusing a slide that is only partly in view brings it into view.
 *
 * Keyboard: Tab reaches the pause button, the dots and the arrows (bottom or overlay). On
 * any of them, ←/→ go to the previous / next slide and Home / End to the first / last.
 * With arrows={false} and no dots, the slide area itself takes focus and answers the same keys.
 *
 * Motion: drag or swipe the track (Motion drag): release projects your velocity forward
 * (momentum) and springs to the nearest slide, so a hard flick travels several slides.
 * Without loop the ends rubber-band. With loop, slides wrap around individually (no
 * cloned DOM), so it is endless in both directions. Arrows, dots and autoplay use the
 * same spring. Reduced motion: dragging still follows your finger (direct manipulation),
 * but every move snaps instantly, and autoplay does not start on its own.
 *
 * Autoplay pauses while the pointer is over the carousel, while it is being dragged,
 * while the tab is hidden or the carousel is off screen, and stops for good when keyboard
 * focus enters it (press Play to resume). The active dot fills up as the next slide nears.
 *
 * Direction: follows the page. In a right-to-left page the first slide sits on the right,
 * "next" moves leftwards, the arrows and the dot pill mirror, and ←/→ swap meaning.
 *
 * Controlled: pass `index` and update it from `onIndexChange`; the carousel only moves
 * when the prop changes (a drag that isn't accepted springs back). onIndexChange fires for
 * user and autoplay moves, never on mount or when following the prop.
 *
 * Only transform is animated. Slides may be glass: nothing fades or masks their wrappers.
 */

/* ---------- Labels ---------- */

/** Every UI string of {@link Carousel}; pass a partial through its `labels` prop to translate it. */
export type CarouselLabels = {
  /** aria-roledescription of the whole carousel. */
  carousel: string;
  /** aria-roledescription of each slide. */
  slide: string;
  /** Accessible name of a slide: (position, total) → "3 of 8". */
  slideLabel: (position: number, total: number) => string;
  /** Accessible name of the previous arrow. */
  previous: string;
  /** Accessible name of the next arrow. */
  next: string;
  /** Accessible name of a dot that shows one slide: (slide, total) → "Slide 3". */
  goTo: (position: number, total: number) => string;
  /** Accessible name of a dot that shows several slides: (first, last, total) → "Slides 4 to 6". */
  goToRange: (first: number, last: number, total: number) => string;
  /** Accessible name of the dot group. */
  picker: string;
  /** Play button (autoplay is stopped). */
  play: string;
  /** Pause button (autoplay is running). */
  pause: string;
  /** Live announcement after navigating to one slide: (slide, total) → "Slide 3 of 8". */
  status: (position: number, total: number) => string;
  /** Live announcement when several slides are in view: (first, last, total) → "Slides 4 to 6 of 8". */
  statusRange: (first: number, last: number, total: number) => string;
  /** Compact visible counter used when the dots don't fit: (position, total) → "3 / 12". */
  counter: (position: number, total: number) => string;
  /** Accessible name of the slide area when it takes keyboard focus itself (no arrows, no dots). */
  viewport: string;
};

/** The English strings of {@link Carousel}. Spread it to build your own set. */
export const defaultCarouselLabels: CarouselLabels = {
  carousel: "carousel",
  slide: "slide",
  slideLabel: (i, n) => `${i} of ${n}`,
  previous: "Previous slide",
  next: "Next slide",
  goTo: (i) => `Slide ${i}`,
  goToRange: (a, b) => `Slides ${a} to ${b}`,
  picker: "Choose a slide",
  play: "Start automatic slide show",
  pause: "Pause automatic slide show",
  status: (i, n) => `Slide ${i} of ${n}`,
  statusRange: (a, b, n) => `Slides ${a} to ${b} of ${n}`,
  counter: (i, n) => `${i} / ${n}`,
  viewport: "Slides",
};

/* ---------- Props ---------- */

/** Props of {@link Carousel}. The attributes of a `section` (minus `aria-label`) and the ones below. */
export type CarouselProps = Omit<ComponentProps<"section">, "children" | "aria-label"> & {
  /** Each child becomes one slide of the carousel. */
  children?: ReactNode;
  /** Accessible name of the carousel, e.g. "Featured products". Required. */
  "aria-label": string;
  /**
   * Slides visible at once. A number, or breakpoints keyed by the carousel's own width in px
   * (container width, not the window): { 0: 1.15, 640: 2, 1024: 3 }. Fractions show a peek
   * of the next slide.
   */
  slidesPerView?: number | Record<number, number>;
  /**
   * Sets the space left between slides, in px.
   * @default 16
   */
  gap?: number;
  /**
   * Where the current slide sits: at the start, or centred (great with a fractional view + loop).
   * @default "start"
   */
  align?: "start" | "center";
  /**
   * Endless in both directions. Needs enough slides to fill the view plus one; otherwise it rewinds.
   * @default false
   */
  loop?: boolean;
  /**
   * How far the arrows move: a number of slides, or "page" (the slides in view).
   * @default 1
   */
  slidesToScroll?: number | "page";
  /**
   * Advance on its own: true (every 5 s) or an interval in ms. Never starts by itself under reduced motion.
   * @default false
   */
  autoplay?: boolean | number;
  /**
   * "bottom": in the control row. "overlay": floating on the slides' edges. false: none.
   * @default "bottom"
   */
  arrows?: "bottom" | "overlay" | false;
  /**
   * Show the dots (a "3 / 12" counter replaces them when they don't fit).
   * @default true
   */
  dots?: boolean;
  /** Controlled position (snap index; with loop, the slide index). Update it from onIndexChange. */
  index?: number;
  /**
   * Sets the starting position when uncontrolled.
   * @default 0
   */
  defaultIndex?: number;
  /** A user or autoplay move asks for a new position (never fired on mount or when following `index`). */
  onIndexChange?: (index: number) => void;
  /**
   * "scale": slides away from the current one shrink a little (transform only).
   * @default "none"
   */
  effect?: "none" | "scale";
  /** Override any UI string (i18n). */
  labels?: Partial<CarouselLabels>;
  /** Adds extra classes to each slide wrapper. */
  slideClassName?: string;
  /** Adds extra classes to the clipping viewport. */
  viewportClassName?: string;
};

/* ---------- Geometry ---------- */

/*
 * All geometry is "logical": distances are measured from the start edge (left in LTR, right
 * in RTL) and a negative track position moves slides towards the start. The motion value
 * `x` is physical (translateX); `sign` (+1 LTR, -1 RTL) converts between the two.
 */
/** The computed geometry of the track: slide size, stride, offsets and snap positions. @internal */
export type Layout = {
  ready: boolean;
  width: number;
  perView: number;
  slideW: number;
  stride: number;
  count: number;
  offset0: number;
  maxScroll: number;
  loop: boolean;
  /** Loop: slides are wrapped into [lo, lo + total). */
  lo: number;
  total: number;
  /** Non-loop: x of each snap point. */
  snaps: number[];
  /** Positions the arrows move by. */
  step: number;
};

/** Re-exports the shared `clamp` so the carousel parts import it from one place. @internal */
export { clamp };
/** A modulo that stays non-negative for negative values. @internal */
export const mod = (v: number, n: number) => ((v % n) + n) % n;
/** Wraps a value into the half-open range from `min` to `max`. @internal */
export const wrap = (min: number, max: number, v: number) => min + mod(v - min, max - min);

/** Resolves the slides-per-view spec to a number for a viewport width. @internal */
export function resolvePerView(spec: CarouselProps["slidesPerView"], width: number) {
  if (typeof spec === "number") return Math.max(1, spec);
  const entries = Object.entries(spec ?? { 0: 1 })
    .map(([k, v]) => [Number(k), v] as const)
    .sort((a, b) => a[0] - b[0]);
  let value = entries[0]?.[1] ?? 1;
  for (const [min, v] of entries) if (width >= min) value = v;
  return Math.max(1, value);
}

/** Computes slide width, stride, offsets and snap positions for the current size. @internal */
export function computeLayout(
  width: number,
  count: number,
  perView: number,
  gap: number,
  align: "start" | "center",
  wantLoop: boolean,
  slidesToScroll: number | "page",
): Layout {
  const slideW = width > 0 ? (width - gap * (perView - 1)) / perView : 0;
  const stride = slideW + gap;
  const total = count * stride;
  const offset0 = align === "center" ? (width - slideW) / 2 : 0;
  const maxScroll = Math.max(0, total - gap - width);
  const step = slidesToScroll === "page" ? Math.max(1, Math.floor(perView)) : Math.max(1, Math.round(slidesToScroll));
  // Endless only when every slide can sit off screen while the view is full: total >= view + one slide.
  const loop = wantLoop && count > 1 && width > 0 && total >= width + slideW + 1;
  const lo = (width - total - slideW) / 2;

  const snaps: number[] = [];
  if (!loop) {
    for (let i = 0; i < count; i += step) {
      const x = clamp(offset0 - i * stride, -maxScroll, 0);
      const last = snaps[snaps.length - 1];
      if (last === undefined || Math.abs(last - x) > 0.5) snaps.push(x);
    }
    if (snaps.length === 0) snaps.push(0);
    // Make sure the very end is reachable.
    if (Math.abs((snaps[snaps.length - 1] ?? 0) + maxScroll) > 0.5 && maxScroll > 0) snaps.push(-maxScroll);
  }
  return {
    ready: width > 0 && count > 0,
    width,
    perView,
    slideW,
    stride,
    count,
    offset0,
    maxScroll,
    loop,
    lo,
    total,
    snaps,
    step,
  };
}

/** The track offset of a snap position. @internal */
export function snapX(layout: Layout, pos: number) {
  if (layout.loop) return layout.offset0 - pos * layout.stride;
  return layout.snaps[clamp(pos, 0, layout.snaps.length - 1)] ?? 0;
}

/** The snap position nearest to a track offset. @internal */
export function nearestPos(layout: Layout, x: number) {
  if (layout.loop) return Math.round((layout.offset0 - x) / (layout.stride || 1));
  let best = 0;
  layout.snaps.forEach((s, i) => {
    if (Math.abs(s - x) < Math.abs((layout.snaps[best] ?? 0) - x)) best = i;
  });
  return best;
}

/** Where slide `i` sits in the viewport (px from its start edge) when the track is at `x`. */
export function slideOffset(layout: Layout, i: number, x: number) {
  const p = i * layout.stride + x;
  return layout.loop ? wrap(layout.lo, layout.lo + layout.total, p) : p;
}

/**
 * The slides fully in view at position `pos`, as [first, last] slide indices, when they are a
 * contiguous run (null otherwise, e.g. a loop that wraps from the last slide to the first).
 */
export function visibleRange(layout: Layout, pos: number): [number, number] | null {
  if (!layout.ready) return null;
  const tx = snapX(layout, pos);
  const shown: { i: number; at: number }[] = [];
  for (let i = 0; i < layout.count; i++) {
    const at = slideOffset(layout, i, tx);
    if (at >= -0.5 && at + layout.slideW <= layout.width + 0.5) shown.push({ i, at });
  }
  shown.sort((a, b) => a.at - b.at);
  const first = shown[0]?.i;
  if (first === undefined) return null;
  return shown.every((s, k) => s.i === first + k) ? [first, first + shown.length - 1] : null;
}

/** The slide closest to the start / centre line at position `pos`. */
export function currentSlide(layout: Layout, pos: number) {
  if (!layout.ready) return 0;
  const tx = snapX(layout, pos);
  let current = 0;
  let best = Infinity;
  for (let i = 0; i < layout.count; i++) {
    const d = Math.abs(slideOffset(layout, i, tx) - layout.offset0);
    if (d < best) {
      best = d;
      current = i;
    }
  }
  return current;
}

/** Public index: the snap index, or (loop) the slide index. */
export function toPublic(layout: Layout, pos: number) {
  return layout.loop ? mod(pos, Math.max(1, layout.count)) : clamp(pos, 0, Math.max(0, layout.snaps.length - 1));
}

/* ---------- Icons ---------- */

/** The shared 24px stroke SVG frame of the carousel icons. @internal */
export function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path d={d} />
    </svg>
  );
}

/** The previous arrow icon. @internal */
export const LeftIcon = () => <Icon d="M14.5 6 8.5 12l6 6" />;
/** The next arrow icon. @internal */
export const RightIcon = () => <Icon d="m9.5 6 6 6-6 6" />;
/** The pause icon of the autoplay control. @internal */
export const PauseIcon = () => <Icon d="M9 6.5v11M15 6.5v11" />;
/** The play icon of the autoplay control. @internal */
export const PlayIcon = () => (
  // The triangle points "forward": mirrored in RTL.
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="currentColor">
    <path d="M8.5 6.2v11.6a.8.8 0 0 0 1.2.7l9.2-5.8a.8.8 0 0 0 0-1.4L9.7 5.5a.8.8 0 0 0-1.2.7Z" />
  </svg>
);

/* ---------- Carousel ---------- */
