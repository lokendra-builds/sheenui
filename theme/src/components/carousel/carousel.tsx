"use client";

import { useCoarsePointer } from "../../hooks/use-media-query";
import {
  Children,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { animate, motion, useDragControls, useMotionValue, type PanInfo } from "motion/react";

import { cn } from "../../lib/cn";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { observeIntersection } from "../../hooks/use-intersection";
import { useResolvedDirection } from "../../hooks/use-direction";
import { Button } from "../button/button";
import { useMergedRef } from "../../lib/form";

import {
  defaultCarouselLabels,
  type CarouselProps,
  FLING,
  clamp,
  mod,
  resolvePerView,
  computeLayout,
  snapX,
  nearestPos,
  slideOffset,
  visibleRange,
  currentSlide,
  toPublic,
  PauseIcon,
  PlayIcon,
} from "./parts/model";
import { ArrowButton, Dots } from "./parts/parts";

export { type CarouselLabels, defaultCarouselLabels, type CarouselProps } from "./parts/model";
/**
 * Swipeable slides with arrows, dots, autoplay and loop. Every child is one slide. Use it for
 * galleries, featured cards and onboarding steps; slides can be glass, because only the track's
 * transform is animated.
 *
 * Props: see {@link CarouselProps} (`label` required, `slidesPerView` 1 or breakpoints by the
 * carousel's own width, `gap` 16, `align`, `loop`, `slidesToScroll`, `autoplay`, `arrows`,
 * `dots`, `index` / `defaultIndex` / `onIndexChange`, `effect`, `labels`, `slideClassName`,
 * `viewportClassName`, `className`).
 *
 * Captions over image slides: use `CarouselCaption`, a bar on a fixed dark scrim that keeps its text at 4.5:1 over any image.
 *
 * Keyboard: Tab reaches the pause button, the dots and the arrows; on any of them Left / Right go to the previous / next slide and Home / End to the first / last (swapped in right-to-left pages). With no arrows and no dots the slide area itself takes focus and answers the same keys. Focusing a partly visible slide brings it into view.
 * Accessibility: Follows the WAI-ARIA carousel pattern: a `section` with `aria-roledescription="carousel"`, slides as groups named "3 of 8", a polite live region that announces what is in view after navigating (silent while autoplay runs), and fully off-screen slides are `inert`. Autoplay pauses on hover, drag, a hidden tab or off-screen, and stops for good when keyboard focus enters (press Play to resume).
 * Motion: Drag or swipe with momentum, rubber-banding at the ends without `loop`, one SheenUI spring for arrows, dots and autoplay. Reduced motion: dragging still follows the finger, every move snaps, and autoplay never starts by itself.
 *
 * @example
 * ```tsx
 * import { Carousel } from "@sheenui/theme";
 *
 * export function Featured() {
 *   return (
 *     <Carousel aria-label="Featured templates" slidesPerView={{ 0: 1.15, 640: 2, 1024: 3 }} loop>
 *       <div className="glass-1 p-6">One</div>
 *       <div className="glass-1 p-6">Two</div>
 *       <div className="glass-1 p-6">Three</div>
 *     </Carousel>
 *   );
 * }
 * ```
 *
 * @see /components/carousel
 */
export function Carousel({
  children,
  "aria-label": label,
  slidesPerView = 1,
  gap = 16,
  align = "start",
  loop = false,
  slidesToScroll = 1,
  autoplay = false,
  arrows = "bottom",
  dots = true,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  effect = "none",
  labels: labelsProp,
  slideClassName,
  viewportClassName,
  className,
  onKeyDown,
  ref,
  ...props
}: CarouselProps) {
  const labels = { ...defaultCarouselLabels, ...labelsProp };
  const slides = Children.toArray(children);
  const count = slides.length;
  const reduced = useSheenReducedMotion();
  const statusId = useId();

  // Elements are kept in state, so measuring starts whenever they mount: a carousel that first
  // renders with no slides (data still loading) and fills later is measured like a fresh one.
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const attachRoot = useMergedRef(rootRef, setRoot, ref);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [width, setWidth] = useState(0);
  const rtl = useResolvedDirection(undefined, rootRef) === "rtl";
  const sign = rtl ? -1 : 1;

  const perView = resolvePerView(slidesPerView, width);
  const layout = useMemo(
    () => computeLayout(width, count, perView, gap, align, loop, slidesToScroll),
    [width, count, perView, gap, align, loop, slidesToScroll],
  );
  const layoutRef = useRef(layout);
  const signRef = useRef(sign);

  /** Physical translateX of the track. Logical position = x * sign. */
  const x = useMotionValue(0);
  const controlled = indexProp !== undefined;
  const [pos, setPos] = useState(indexProp ?? defaultIndex);
  const posRef = useRef(pos);
  const [announcement, setAnnouncement] = useState("");
  // Read inside the callbacks through refs, so they (and the effects that use them) stay stable.
  const latest = useRef({ reduced, labels, onIndexChange, controlled });
  // Refreshed after every commit, before the effects below run (effects run in order), and never during render.
  useLayoutEffect(() => {
    layoutRef.current = layout;
    signRef.current = sign;
    posRef.current = pos;
    latest.current = { reduced, labels, onIndexChange, controlled };
  });
  /** A move the user asked for while controlled: announced when the prop follows. */
  const pending = useRef<{ index: number; announce: boolean } | null>(null);

  const publicIndex = toPublic(layout, pos);
  const positions = layout.loop ? count : layout.snaps.length;
  const scrollable = layout.ready ? (layout.loop ? count > 1 : layout.snaps.length > 1) : count > 1;
  const canDrag = scrollable && layout.ready;
  // Asked to loop but too few slides to wrap seamlessly: the arrows rewind instead of stopping.
  const rewinds = loop && !layout.loop && positions > 1;
  const canPrev = layout.loop || rewinds || publicIndex > 0;
  const canNext = layout.loop || rewinds || publicIndex < positions - 1;

  /* ----- Measure (width) ----- */
  useLayoutEffect(() => {
    if (!viewport) return;
    const measure = () => setWidth(viewport.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewport]);

  /* ----- Move the track (no onIndexChange: callers decide) ----- */
  const moveTo = useCallback(
    (target: number, options: { velocity?: number; instant?: boolean; announce?: boolean } = {}) => {
      const l = layoutRef.current;
      const p = l.loop ? target : clamp(target, 0, Math.max(0, l.snaps.length - 1));
      setPos(p);
      posRef.current = p;
      const to = snapX(l, p) * signRef.current;
      const { reduced: still, labels: words } = latest.current;
      if (still || options.instant || !l.ready) {
        x.stop();
        x.set(to);
      } else {
        // Physics spring (the numbers behind `spring.smooth`, no overshoot): time-defined springs
        // (`visualDuration`) ignore the release velocity and restart from rest, which reads as a dip.
        // Without an explicit velocity Motion carries on from the value's current velocity.
        const v = options.velocity;
        const distance = Math.abs(to - x.get());
        if (v !== undefined && Math.abs(v) > 500 && distance > 8) {
          // A throw leaves at the speed of the hand and only slows down: an ease-out whose opening slope (2) matches the
          // release speed (duration = 2 x distance / speed). A spring covering the rest of a slide accelerated to ~2x.
          animate(x, to, {
            duration: Math.min(0.7, Math.max(0.25, (2 * distance) / Math.abs(v))),
            ease: [0.25, 0.5, 0.4, 1],
          });
        } else {
          animate(x, to, { ...FLING, ...(v !== undefined && { velocity: v }) });
        }
      }
      if (options.announce !== false && l.ready) {
        const range = visibleRange(l, p);
        setAnnouncement(
          range && range[0] !== range[1]
            ? words.statusRange(range[0] + 1, range[1] + 1, l.count)
            : words.status((range ? range[0] : currentSlide(l, p)) + 1, l.count),
        );
      }
    },
    [x],
  );

  /* ----- A user or autoplay move: move (uncontrolled) or ask the owner (controlled) ----- */
  const go = useCallback(
    (next: number, options: { velocity?: number; announce?: boolean; settle?: boolean } = {}) => {
      const l = layoutRef.current;
      const target = l.loop ? next : clamp(next, 0, Math.max(0, l.snaps.length - 1));
      const from = toPublic(l, posRef.current);
      const to = toPublic(l, target);
      const { onIndexChange: notify, controlled: isControlled } = latest.current;
      if (isControlled) {
        // Only the prop moves a controlled carousel. A released drag springs back meanwhile;
        // if the owner accepts, the prop change redirects that spring to the new slide.
        if (options.settle) moveTo(posRef.current, { velocity: options.velocity, announce: false });
        if (to !== from) {
          pending.current = { index: to, announce: options.announce !== false };
          notify?.(to);
        }
        return;
      }
      moveTo(target, options);
      if (to !== from) notify?.(to);
    },
    [moveTo],
  );

  // Re-snap (instantly) when the geometry or direction changes: resize, slides per view, slide count.
  useLayoutEffect(() => {
    if (!layout.ready) return;
    const p = layout.loop ? posRef.current : clamp(posRef.current, 0, layout.snaps.length - 1);
    if (p !== posRef.current) {
      posRef.current = p;
      setPos(p);
    }
    x.stop();
    x.set(snapX(layout, p) * sign);
  }, [layout, sign, x]);

  // Controlled index: follow the prop (silent unless the user asked for this move).
  useEffect(() => {
    if (indexProp === undefined || !layout.ready) return;
    const current = toPublic(layout, posRef.current);
    const wanted = layout.loop ? mod(indexProp, count) : clamp(indexProp, 0, layout.snaps.length - 1);
    const asked = pending.current;
    pending.current = null;
    if (wanted === current) return;
    const announce = asked?.index === wanted && asked.announce;
    if (layout.loop) {
      let delta = mod(wanted - current, count);
      if (delta > count / 2) delta -= count;
      moveTo(posRef.current + delta, { announce });
    } else moveTo(wanted, { announce });
  }, [indexProp, layout, count, moveTo]);

  /* ----- Per-slide transforms: loop wrapping and the scale effect ----- */
  const transformsActive = layout.loop || effect === "scale";
  useEffect(() => {
    const els = slideRefs.current;
    if (!layout.ready || !transformsActive) {
      els.forEach((el) => el && (el.style.transform = ""));
      return;
    }
    const apply = (physical: number) => {
      const at = physical * sign;
      for (let i = 0; i < layout.count; i++) {
        const el = els[i];
        if (!el) continue;
        const natural = i * layout.stride + at;
        const shown = slideOffset(layout, i, at);
        let scale = 1;
        if (effect === "scale") {
          const distance = Math.abs(shown - layout.offset0) / (layout.stride || 1);
          scale = 1 - 0.08 * Math.min(1, distance);
        }
        const dx = (shown - natural) * sign;
        // Only slides that are actually displaced or scaled get a transform (no no-op writes per frame).
        const next =
          Math.abs(dx) < 0.01 && scale === 1
            ? ""
            : `translate3d(${dx}px,0,0)${scale !== 1 ? ` scale(${scale.toFixed(4)})` : ""}`;
        if (el.style.transform !== next) el.style.transform = next;
      }
    };
    apply(x.get());
    return x.on("change", apply);
  }, [layout, transformsActive, effect, sign, x]);

  /* ----- Which slides are on screen (the rest are inert) ----- */
  const target = layout.ready ? snapX(layout, pos) : 0;
  const current = currentSlide(layout, pos);
  const visibility = slides.map((_, i) => {
    if (!layout.ready) return i < Math.ceil(perView) ? "full" : "none";
    const p = slideOffset(layout, i, target);
    if (p >= -0.5 && p + layout.slideW <= layout.width + 0.5) return "full";
    if (p < layout.width - 0.5 && p + layout.slideW > 0.5) return "partial";
    return "none";
  });

  /** Keyboard focus landed in a slide that is only partly visible: bring it into view. */
  const revealSlide = (i: number) => {
    const l = layoutRef.current;
    if (!l.ready) return;
    if (l.loop) {
      let delta = mod(i - mod(posRef.current, l.count), l.count);
      if (delta > l.count / 2) delta -= l.count;
      go(posRef.current + delta);
    } else go(nearestPos(l, clamp(l.offset0 - i * l.stride, -l.maxScroll, 0)));
  };

  /* ----- Drag ----- */
  const dragStart = useRef(0);
  const dragged = useRef(false);
  // Motion's own drag listener forces `touch-action: pan-y`, which also blocks the browser's page pinch-zoom over
  // the track. We start the drag ourselves (dragListener off) so the track can say `pan-y pinch-zoom`.
  const dragControls = useDragControls();
  const [dragging, setDragging] = useState(false);

  const onDragStart = () => {
    dragStart.current = posRef.current;
    dragged.current = true;
    setDragging(true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const l = layoutRef.current;
    const v = info.velocity.x * sign; // logical: negative = towards the next slides
    // Momentum: project with what the spring itself would coast (v / (omega * e) ~ 0.02 s of travel; 0.05 s
    // is generous), snap to the nearest position, and allow one slide per throw unless the throw is very fast.
    // A far projection made the track accelerate after release (the spring had to cover ~10x its own coast).
    let next = nearestPos(l, x.get() * sign + v * 0.05);
    const reach = Math.abs(v) > 4000 ? 3 : 1;
    next = Math.min(dragStart.current + reach, Math.max(dragStart.current - reach, next));
    if (next === dragStart.current && Math.abs(v) > 350) next += v < 0 ? 1 : -1;
    // A slow but deliberate drag (about a quarter of a slide, or 72px) also turns the page, as native swipers do.
    const travelled = snapX(l, dragStart.current) - x.get() * sign; // > 0: dragged towards the next slides
    if (next === dragStart.current && Math.abs(travelled) > Math.min(72, 0.25 * (l.stride || 1)))
      next += travelled > 0 ? 1 : -1;
    go(next, { velocity: info.velocity.x, settle: true });
  };

  /* ----- Autoplay ----- */
  const interval = typeof autoplay === "number" ? Math.max(1000, autoplay) : 5000;
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = Boolean(autoplay) && (userPlaying ?? !reduced);
  const [hovered, setHovered] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const running = playing && scrollable && layout.ready && !hovered && !dragging && !hiddenTab && !offscreen;
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!autoplay || !root) return;
    const onVisibility = () => setHiddenTab(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    const stopObserving = observeIntersection(root, (entry) => setOffscreen(!entry.isIntersecting));
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopObserving();
    };
  }, [autoplay, root]);

  // A new position restarts the countdown.
  useEffect(() => {
    progress.set(0);
  }, [pos, progress]);

  useEffect(() => {
    if (!running) return;
    const remaining = (1 - progress.get()) * interval;
    const controls = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => {
        const l = layoutRef.current;
        const atEnd = !l.loop && posRef.current >= l.snaps.length - 1;
        // Rotation is silent: the live region is off while it plays.
        go(atEnd ? 0 : posRef.current + (l.loop ? l.step : 1), { announce: false });
      },
    });
    return () => controls.stop();
  }, [running, interval, progress, go, pos]);

  const onFocusCapture = (event: FocusEvent<HTMLElement>) => {
    // APG: keyboard focus entering the carousel stops rotation until Play is pressed.
    const from = event.relatedTarget;
    const entering = !from || !event.currentTarget.contains(from);
    if (entering && playing && event.target.matches(":focus-visible")) setUserPlaying(false);
  };

  /* ----- Navigation helpers ----- */
  const prev = () => {
    if (!canPrev) return;
    if (rewinds && posRef.current <= 0) go(positions - 1);
    else go(posRef.current - (layout.loop ? layout.step : 1));
  };
  const next = () => {
    if (!canNext) return;
    if (rewinds && posRef.current >= positions - 1) go(0);
    else go(posRef.current + (layout.loop ? layout.step : 1));
  };
  const goToDot = (d: number) => {
    if (layout.loop) {
      let delta = mod(d - mod(posRef.current, count), count);
      if (delta > count / 2) delta -= count;
      go(posRef.current + delta);
    } else go(d);
  };

  /** ←/→ (mirrored in RTL), Home and End: on the control row, the overlay arrows and a focusable viewport. */
  const onNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: rtl ? next : prev,
      ArrowRight: rtl ? prev : next,
      Home: () => goToDot(0),
      End: () => goToDot(positions - 1),
    };
    const action = keys[event.key];
    if (!action || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    action();
    // Roving focus on the dots: keep focus on the active one.
    const dot = (event.target as HTMLElement).closest("[data-carousel-dot]");
    if (dot) {
      requestAnimationFrame(() => {
        rootRef.current?.querySelector<HTMLElement>("[data-carousel-dot][aria-current='true']")?.focus();
      });
    }
  };

  // Dots must fit: on touch screens each needs a 44px target, otherwise 24px.
  const coarse = useCoarsePointer();
  const dotSize = coarse ? 44 : 24;
  const reserved = (autoplay ? 52 : 0) + (arrows === "bottom" ? 2 * (coarse ? 48 : 44) + 16 : 0);
  const dotsFit = !layout.ready || positions * dotSize <= layout.width - reserved;
  const showControls = scrollable && (dots || arrows === "bottom" || autoplay);
  // No arrows and no dots to Tab to: the slide area itself takes focus and the arrow keys.
  const focusViewport = canDrag && arrows === false && !(dots && dotsFit);

  // Accessible names of the dots: the slide (or slides) each one shows.
  const dotLabels = Array.from({ length: positions }, (_, d) => {
    const range = layout.loop ? ([d, d] as const) : visibleRange(layout, d);
    if (range && range[0] !== range[1]) return labels.goToRange(range[0] + 1, range[1] + 1, count);
    return labels.goTo((range ? range[0] : layout.loop ? d : currentSlide(layout, d)) + 1, count);
  });

  if (count === 0) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- APG carousel: the region only catches the keys (arrows, Home, End) and focus bubbling up from the controls and slides inside it
    <section
      ref={attachRoot}
      aria-roledescription={labels.carousel}
      aria-label={label}
      data-slot="carousel"
      className={cn("relative flex w-full min-w-0 flex-col gap-4", className)}
      onFocusCapture={onFocusCapture}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onKeyDown={onKeyDown}
      {...props}
    >
      {showControls && (
        // First in the DOM (APG: the rotation control comes before the slides), shown below them.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- arrow keys pressed on the buttons and dots inside are handled here; the row is not a control itself
        <div className="order-last flex min-h-10 items-center gap-3" onKeyDown={onNavKeyDown}>
          {autoplay && (
            <Button
              variant="glass"
              size="icon"
              onClick={() => setUserPlaying(!playing)}
              aria-label={playing ? labels.pause : labels.play}
              className="size-9 shrink-0 rounded-sheen-full"
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
          )}
          {dots &&
            (dotsFit ? (
              <Dots
                count={positions}
                active={publicIndex}
                onSelect={goToDot}
                progress={progress}
                showProgress={running && !reduced}
                coarse={coarse}
                reduced={reduced}
                rtl={rtl}
                names={dotLabels}
                label={labels.picker}
              />
            ) : (
              <span aria-hidden className="px-1 text-sm font-medium text-sheen-fg-muted tabular-nums">
                {labels.counter(publicIndex + 1, positions)}
              </span>
            ))}
          {arrows === "bottom" && (
            <div className="ms-auto flex shrink-0 gap-2">
              <ArrowButton side="prev" rtl={rtl} disabled={!canPrev} onClick={prev} label={labels.previous} />
              <ArrowButton side="next" rtl={rtl} disabled={!canNext} onClick={next} label={labels.next} />
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {/* overflow-x: clip, not hidden: focus can't scroll it, and vertical shadows aren't cut. */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- it becomes a focusable "group" (role, name and key handler) only when there is no other control to focus (`focusViewport`) */}
        <div
          ref={setViewport}
          role={focusViewport ? "group" : undefined}
          aria-label={focusViewport ? labels.viewport : undefined}
          aria-keyshortcuts={focusViewport ? "ArrowLeft ArrowRight Home End" : undefined}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- only set together with the group role and its key handler above (`focusViewport`)
          tabIndex={focusViewport ? 0 : undefined}
          onKeyDown={focusViewport ? (e) => e.target === e.currentTarget && onNavKeyDown(e) : undefined}
          className={cn(
            "min-w-0 overflow-x-clip py-1 [overflow-clip-margin:4px]",
            focusViewport &&
              "rounded-sheen-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
            viewportClassName,
          )}
          onDragStartCapture={(e) => e.preventDefault()}
          onPointerDownCapture={() => {
            dragged.current = false;
          }}
          onClickCapture={(e) => {
            // A drag that ends over a link or button must not also click it.
            if (dragged.current) {
              e.preventDefault();
              e.stopPropagation();
              dragged.current = false;
            }
          }}
        >
          <motion.div
            data-slot="carousel-track"
            drag={canDrag ? "x" : false}
            dragConstraints={
              layout.loop
                ? undefined
                : rtl
                  ? { left: -(layout.snaps[0] ?? 0), right: -(layout.snaps[layout.snaps.length - 1] ?? 0) }
                  : { left: layout.snaps[layout.snaps.length - 1] ?? 0, right: layout.snaps[0] ?? 0 }
            }
            dragElastic={0.18}
            dragMomentum={false}
            dragListener={false}
            dragControls={dragControls}
            onPointerDown={(event) => {
              if (canDrag && event.button === 0) dragControls.start(event, { snapToCursor: false });
            }}
            dragDirectionLock
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            style={{ x, gap, touchAction: "pan-y pinch-zoom", WebkitTouchCallout: "none" }}
            className={cn(
              "flex select-none [&_img]:[-webkit-user-drag:none]",
              canDrag && "cursor-grab active:cursor-grabbing",
            )}
          >
            {slides.map((slide, i) => (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onFocus only reveals a partly visible slide when keyboard focus lands inside it
              <div
                key={i}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                role="group"
                aria-roledescription={labels.slide}
                aria-label={labels.slideLabel(i + 1, count)}
                inert={visibility[i] === "none"}
                data-visible={visibility[i]}
                data-current={i === current || undefined}
                onFocus={(e) => {
                  if (visibility[i] !== "full" && (e.target as HTMLElement).matches(":focus-visible")) revealSlide(i);
                }}
                style={{
                  flex: `0 0 calc((100% - ${perView - 1} * ${gap}px) / ${perView})`,
                }}
                className={cn("min-w-0 origin-center", slideClassName)}
              >
                {slide}
              </div>
            ))}
          </motion.div>
        </div>

        {arrows === "overlay" && scrollable && (
          <>
            <ArrowButton
              side="prev"
              overlay
              rtl={rtl}
              disabled={!canPrev}
              onClick={prev}
              onKeyDown={onNavKeyDown}
              label={labels.previous}
            />
            <ArrowButton
              side="next"
              overlay
              rtl={rtl}
              disabled={!canNext}
              onClick={next}
              onKeyDown={onNavKeyDown}
              label={labels.next}
            />
          </>
        )}
      </div>

      {/* Polite while you navigate; off while it rotates on its own (APG). */}
      <div id={statusId} aria-live={running ? "off" : "polite"} aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </section>
  );
}
