"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type FocusEvent,
  type ReactNode,
} from "react";

import { cn } from "../../lib/cn";
import { useControllable } from "../../hooks/use-controllable";
import { observeIntersection } from "../../hooks/use-intersection";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { isRtlAt, useResolvedDirection, watchDirection } from "../../hooks/use-direction";
import { Button } from "../button/button";

/**
 * Every user-facing string of `Marquee` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type MarqueeLabels = {
  /** Button label while it moves. Default "Pause animation". */
  pause: string;
  /** Button label while it is paused. Default "Play animation". */
  play: string;
};

/** The English {@link MarqueeLabels} used when `labels` is omitted; a partial `labels` prop is merged over it. */
export const defaultMarqueeLabels: MarqueeLabels = { pause: "Pause animation", play: "Play animation" };

/** Props of `Marquee`: the native `<div>` props plus its own options, each documented on its field. */
export type MarqueeProps = Omit<ComponentProps<"div">, "children"> & {
  /** The items: each child is one item (a logo, a card…). */
  children: ReactNode;
  /** Sets the speed in px per second. Default 40. */
  speed?: number;
  /** Move towards the end (right in LTR, or down when vertical) instead of the start. Default false. */
  reverse?: boolean;
  /** Scroll vertically. Give the marquee a height with className (default h-96). Default false. */
  vertical?: boolean;
  /** Sets the space between items, in px. Default 24. */
  gap?: number;
  /** Ease to a stop while the mouse is over it. Default true. */
  pauseOnHover?: boolean;
  /** Fades out the two edges of the strip. Default true. */
  fade?: boolean;
  /** Length of each faded edge, in px (at most 12% of the strip, so narrow strips stay readable). Default 64. */
  fadeSize?: number;
  /** Show the Pause / Play button. Keep it unless you provide your own control (WCAG 2.2.2). Default true. */
  controls?: boolean;
  /** Paused (controlled). Use with onPausedChange, e.g. to drive several marquees from one button. */
  paused?: boolean;
  /** Starts in the paused state (uncontrolled). Default false. */
  defaultPaused?: boolean;
  /** Called when the Pause / Play button is pressed. */
  onPausedChange?: (paused: boolean) => void;
  /** Accessible name for the list of items, e.g. "Customers". */
  listLabel?: string;
  /** Classes for every item (<li>). Put a glass class here to make each item a glass card. */
  itemClassName?: string;
  /** Text of the Pause / Play button; a partial object over the English defaults, so pass only the keys you translate. */
  labels?: Partial<MarqueeLabels>;
};

/** How quickly the speed follows its target (pause, resume): about 300ms to settle. */
const EASE_RATE = 9;
/** How quickly a focused item glides into view. */
/** The faded edges never take more than this share of the strip each. */
const FADE_SHARE = 0.12;

const FOCUSABLE =
  "a[href], area[href], button, input, select, textarea, iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), [tabindex]";

type Item = {
  /** Start of the <li> along the axis, in track coordinates, and its length. */
  start: number;
  size: number;
  /** What fades: the item's glass surface, its start and length (track coordinates). */
  target: HTMLElement;
  targetStart: number;
  targetSize: number;
  /** The mask last written, so unchanged items are not touched. */
  mask: string;
};
type Layout = {
  /** One copy plus one gap: the distance after which the strip looks exactly the same. */
  loop: number;
  /** Visible length of the strip. */
  viewport: number;
  items: Item[];
  /** Fade item by item (there is glass inside) instead of masking the whole strip. */
  perItem: boolean;
};

function hasBackdropFilter(el: Element) {
  const style = getComputedStyle(el);
  const value = style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter");
  return Boolean(value) && value !== "none";
}

/** What to fade for an item: its glass surface if it has one, since masking a wrapper of glass breaks the blur. */
function fadeTarget(li: HTMLElement): { target: HTMLElement; glass: boolean } {
  if (hasBackdropFilter(li)) return { target: li, glass: true };
  for (const el of li.querySelectorAll<HTMLElement>("*")) {
    if (hasBackdropFilter(el)) return { target: el, glass: true };
  }
  return { target: li, glass: false };
}

/** How far an item's mask reaches past its border box, so its shadow fades with it instead of being cut. */
const MASK_BLEED = 64;

function setMask(el: HTMLElement, mask: string) {
  const style = el.style;
  const on = Boolean(mask);
  const set = (property: string, value: string) => {
    style.setProperty(property, on ? value : null);
    style.setProperty(`-webkit-${property}`, on ? value : null);
  };
  set("mask-image", mask);
  set("mask-size", `calc(100% + ${2 * MASK_BLEED}px) calc(100% + ${2 * MASK_BLEED}px)`);
  set("mask-position", `${-MASK_BLEED}px ${-MASK_BLEED}px`);
  set("mask-repeat", "no-repeat");
  set("mask-clip", "no-clip");
}

/** Copies stay clickable, but only the real list is in the tab order. */
function untab(group: Element) {
  for (const el of group.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el.getAttribute("tabindex") !== "-1") el.setAttribute("tabindex", "-1");
  }
}

/** Only keyboard-style focus stops the strip; a click or tap on an item doesn't. */
function isFocusVisible(el: Element) {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Marquee: an endless, seamless row (or column) of logos, testimonials, anything. Use it for "trusted by" strips and review walls; keep it short, as moving content competes for attention.
 *
 * Each child is one item. The list is rendered once for assistive tech and copied as many times as needed to fill the strip. The copies are `aria-hidden` and taken out of the tab order, but stay clickable and hoverable: whatever is under the
 * pointer works. It moves at a steady speed in px per second (`speed`), whatever its length. `reverse` flips the direction, `vertical` scrolls a column, `gap` spaces the items, `itemClassName` styles each `<li>`, `listLabel` names the list ("Customers").
 * - Mouse over it, or keyboard focus inside it, eases it to a stop (and back up after; `pauseOnHover={false}` keeps it running under the mouse). Tabbing to an item that is off to the side glides it into the middle.
 * - A Pause / Play button (WCAG 2.2.2) sits below the strip, at its end, and comes first in the tab order. It can be controlled (`paused` + `onPausedChange`), so one button can drive several marquees. It also rests while off-screen, and in a background tab.
 * - The edges fade (`fade`, `fadeSize`). Plain items get a gradient mask on the strip. Glass items get the same fade one by one, as a mask on their own glass element, because masking a wrapper of glass would switch off its backdrop blur.
 * - Right-to-left: the row runs from the right and moves the other way.
 *
 * Keyboard: Tab reaches the Pause / Play button first (Enter or Space toggles it), then the real items; focusing an item pauses the strip and brings the item into view.
 * Accessibility: a labelled list (`listLabel`) rendered once for assistive tech; copies are `aria-hidden` with their focusable children removed from the tab order; the control is a named button (`labels` translates it).
 * Glass and motion: motion is a transform written once per frame (no React state) and stops off-screen and in hidden tabs. Reduced motion: it doesn't move. A row wraps onto as many lines as it needs; a column keeps its height and scrolls. No copies, no fade, no button.
 *
 * @example
 * ```tsx
 * import { Marquee } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const logos: { name: string; src: string }[];
 *
 * export function Example() {
 *   return (
 *     <Marquee listLabel="Customers" speed={50}>
 *       {logos.map((logo) => <img key={logo.name} src={logo.src} alt={logo.name} className="h-8" />)}
 *     </Marquee>
 *   );
 * }
 * ```
 *
 * @see /effects/marquee
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  vertical = false,
  gap = 24,
  pauseOnHover = true,
  fade = true,
  fadeSize = 64,
  controls = true,
  paused: pausedProp,
  defaultPaused = false,
  onPausedChange,
  listLabel,
  itemClassName,
  labels,
  className,
  ...props
}: MarqueeProps) {
  const L = { ...defaultMarqueeLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const items = Children.toArray(children);
  const [paused, setPaused] = useControllable(pausedProp, defaultPaused, onPausedChange);
  // Copies of the list: one before the real one (so the strip can glide backwards to a focused
  // item), the real one, and enough after it to cover the strip. Worked out once measured.
  const [copies, setCopies] = useState(3);
  const [perItem, setPerItem] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rtl = useResolvedDirection(undefined, rootRef) === "rtl";

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const layout = useRef<Layout>({ loop: 0, viewport: 0, items: [], perItem: false });
  /**
   * The strip is ONE Web Animation of the track's transform (compositor, no per-frame JS). `offset` is how far the
   * real copy has moved past the start, within [0, loop): read from the animation's progress while it exists.
   * `rate` is its playback rate (1 = full speed), eased to 0 on hover, focus and pause. `frame` runs only while the
   * rate is easing or glass items need their edge masks moved.
   */
  const state = useRef({
    offset: 0,
    rate: 1,
    frame: 0,
    last: 0,
    placed: false,
    anim: null as Animation | null,
    key: "",
  });
  // `visible`: the strip is on screen. `hidden`: the browser tab is in the background (document.visibilityState).
  const flags = useRef({ hovered: false, focused: false, visible: true, hidden: false, paused });
  const config = useRef({ speed, reverse, vertical, fade, fadeSize, rtl });
  // The loop reads the latest props from here (synced after render, before the effects below run).
  useLayoutEffect(() => {
    config.current = { ...config.current, speed, reverse, vertical, fade, fadeSize };
  });

  function togglePaused() {
    setPaused(!paused);
  }

  /** Where the strip is right now, within [0, loop). */
  const getOffset = useCallback(() => {
    const s = state.current;
    const { loop } = layout.current;
    const progress = s.anim?.effect?.getComputedTiming().progress;
    return s.anim && typeof progress === "number" && loop > 0 ? progress * loop : s.offset;
  }, []);

  /** Puts the strip at `offset` (within [0, loop)). */
  const setOffset = useCallback((offset: number) => {
    const s = state.current;
    const { loop } = layout.current;
    s.offset = loop > 0 ? mod(offset, loop) : 0;
    const timing = s.anim?.effect?.getComputedTiming();
    if (s.anim && loop > 0 && typeof timing?.duration === "number") {
      const reversed = s.anim.effect?.getTiming().direction === "reverse";
      const fraction = s.offset / loop;
      s.anim.currentTime = (reversed ? 1 - fraction : fraction) * timing.duration;
    }
  }, []);

  /* ---------- Paint: the edge masks of glass items (the track itself moves on the compositor) ---------- */
  const paint = useCallback(() => {
    const { loop, viewport, items: all, perItem: itemFade } = layout.current;
    if (loop <= 0 || !itemFade) return;
    const shift = loop + getOffset();
    const { vertical: v, fade: f, fadeSize: edge } = config.current;
    // The strip's own fade, drawn on each glass item in its own coordinates: transparent at
    // the strip's edges, opaque `zone` px in. Items clear of both edges get no mask at all.
    const zone = f ? Math.min(edge, viewport * FADE_SHARE) : 0;
    const side = v ? "to bottom" : "to right";
    for (const item of all) {
      const at = item.targetStart - shift;
      const end = at + item.targetSize;
      let mask = "";
      if (zone > 0 && end > 0 && at < viewport && (at < zone || end > viewport - zone)) {
        // Mask coordinates start MASK_BLEED px before the item's border box.
        const px = (n: number) => `${(n + MASK_BLEED).toFixed(1)}px`;
        mask = `linear-gradient(${side}, transparent ${px(-at)}, black ${px(zone - at)}, black ${px(viewport - zone - at)}, transparent ${px(viewport - at)})`;
      }
      if (mask !== item.mask) {
        item.mask = mask;
        setMask(item.target, mask);
      }
    }
  }, [getOffset]);

  /** (Re)creates the track animation when the loop length, speed, direction or axis changed, keeping the position. */
  const ensureAnim = useCallback(() => {
    const track = trackRef.current;
    const s = state.current;
    const { loop } = layout.current;
    const { speed: pxPerSecond, reverse: back, vertical: v, rtl: rightToLeft } = config.current;
    if (!track || loop <= 0 || pxPerSecond <= 0 || typeof track.animate !== "function") return;
    // Rows move towards their start side: left in LTR, right in RTL (reverse flips it).
    const backwards = back !== (rightToLeft && !v);
    const key = `${loop}|${pxPerSecond}|${backwards}|${v}`;
    if (s.anim && s.key === key) return;
    const keep = s.anim ? getOffset() : s.offset;
    s.anim?.cancel();
    const at = (n: number) => (v ? `translate3d(0, ${-n}px, 0)` : `translate3d(${-n}px, 0, 0)`);
    s.anim = track.animate([{ transform: at(loop) }, { transform: at(2 * loop) }], {
      duration: (loop / pxPerSecond) * 1000,
      iterations: Infinity,
      direction: backwards ? "reverse" : "normal",
      easing: "linear",
      fill: "both",
    });
    s.key = key;
    s.anim.updatePlaybackRate(s.rate);
    setOffset(keep);
  }, [getOffset, setOffset]);

  /* ---------- The driver: eases the playback rate, moves glass masks, sleeps when nothing changes ---------- */
  const tick = useCallback(
    function tick(now: number) {
      const s = state.current;
      const f = flags.current;
      const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
      s.last = now;

      const away = !f.visible || f.hidden;
      const resting = f.paused || f.hovered || f.focused || away;
      const target = resting ? 0 : 1;
      s.rate = away ? 0 : s.rate + (target - s.rate) * (1 - Math.exp(-dt * EASE_RATE));
      if (Math.abs(s.rate - target) < 0.01) s.rate = target;
      s.anim?.updatePlaybackRate(s.rate);
      // At rate 0 the animation is truly paused (not "running" at zero speed); it plays again as the rate returns.
      if (s.anim) {
        if (s.rate === 0 && s.anim.playState === "running") s.anim.pause();
        else if (s.rate > 0 && s.anim.playState === "paused") s.anim.play();
      }
      paint();

      const moving = s.rate !== 0 && layout.current.perItem;
      s.frame = away || (s.rate === target && !moving) ? 0 : requestAnimationFrame(tick);
      if (!s.frame) s.last = 0;
    },
    [paint],
  );

  const wake = useCallback(() => {
    ensureAnim();
    if (!state.current.frame) state.current.frame = requestAnimationFrame(tick);
  }, [ensureAnim, tick]);

  /** Stops the strip at once (off-screen, hidden tab): rate 0 and a real pause, no easing frame needed. */
  const haltNow = useCallback(() => {
    const s = state.current;
    s.rate = 0;
    s.anim?.updatePlaybackRate(0);
    s.anim?.pause();
  }, []);

  /* ---------- Measure: loop length, copies needed, item positions, glass inside, direction ---------- */
  const measure = useCallback(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track) return;
    const v = config.current.vertical;
    const groups = [...track.querySelectorAll<HTMLElement>(":scope > ul")];
    const real = groups[1];
    if (!real) return;
    const rightToLeft = isRtlAt(root);
    config.current.rtl = rightToLeft;
    const groupSize = v ? real.offsetHeight : real.offsetWidth;
    const viewportSize = v ? viewport.clientHeight : viewport.clientWidth;
    const loop = groupSize + gap;
    const needed = groupSize > 0 ? Math.ceil(viewportSize / loop) + 2 : 3;
    setCopies((c) => (c === needed ? c : needed));

    let glass = false;
    const trackRect = track.getBoundingClientRect();
    const all: Item[] = [];
    for (const group of groups) {
      for (const li of group.querySelectorAll<HTMLElement>(":scope > li")) {
        const found = fadeTarget(li);
        glass ||= found.glass;
        const rect = found.target.getBoundingClientRect();
        // The track is the offsetParent of every item; the fade target may sit inside the item.
        all.push({
          start: v ? li.offsetTop : li.offsetLeft,
          size: v ? li.offsetHeight : li.offsetWidth,
          target: found.target,
          targetStart: v ? rect.top - trackRect.top : rect.left - trackRect.left,
          targetSize: v ? rect.height : rect.width,
          mask: "",
        });
      }
    }
    // Start from a clean slate: paint() writes every mask that is needed again.
    for (const { target } of all) setMask(target, "");
    layout.current = { loop, viewport: viewportSize, items: all, perItem: glass };
    setPerItem(glass);

    const s = state.current;
    if (!s.placed && loop > 0) {
      s.placed = true;
      // Right to left, the list starts at the strip's right edge.
      if (rightToLeft && !v) s.offset = mod(groupSize - viewportSize, loop);
      s.key = "";
    }
    paint();
    wake();
  }, [gap, paint, wake]);

  useLayoutEffect(() => {
    if (reduced) return;
    measure();
    const viewport = viewportRef.current;
    const real = trackRef.current?.querySelectorAll(":scope > ul")[1];
    if (!viewport || !real || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(viewport);
    ro.observe(real);
    // A switch of direction (`dir` on <html> or any ancestor) doesn't resize anything: watch for it.
    const unwatchDirection = watchDirection(measure);
    return () => {
      ro.disconnect();
      unwatchDirection();
    };
  }, [measure, reduced, copies, items.length, vertical, rtl]);

  /* ---------- Copies: out of the tab order, also when an item renders new controls later ---------- */
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (reduced || !track) return;
    const sweep = () => {
      track.querySelectorAll(":scope > ul[aria-hidden]").forEach(untab);
    };
    sweep();
    if (typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(sweep);
    mo.observe(track, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [reduced, copies, items.length]);

  /* ---------- Rest while the tab is in the background ---------- */
  useEffect(() => {
    if (reduced || typeof document === "undefined") return;
    const sync = () => {
      flags.current.hidden = document.visibilityState === "hidden";
      if (!flags.current.hidden) wake();
      else haltNow();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [reduced, wake, haltNow]);

  /* ---------- Rest while off-screen ---------- */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (reduced || !viewport) return;
    return observeIntersection(viewport, (entry) => {
      flags.current.visible = entry.isIntersecting;
      if (flags.current.visible) wake();
      else haltNow();
    });
  }, [reduced, wake, haltNow]);

  useEffect(() => {
    flags.current.paused = paused;
    wake();
  }, [paused, speed, reverse, wake]);

  useEffect(() => {
    const s = state.current;
    return () => {
      cancelAnimationFrame(s.frame);
      s.frame = 0;
      s.anim?.cancel();
      s.anim = null;
      s.key = "";
    };
  }, []);

  /* ---------- Focus: stop, and glide the focused item into the middle if it is off to the side ---------- */
  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    const el = event.target as HTMLElement;
    if (!isFocusVisible(el)) return;
    flags.current.focused = true;
    // Focus stops the strip at once (no easing): the focused item must not drift while it is being brought into view.
    state.current.rate = 0;
    state.current.anim?.updatePlaybackRate(0);
    state.current.anim?.pause();
    const li = el.closest("li");
    const { loop, viewport } = layout.current;
    if (li && loop > 0) {
      const v = config.current.vertical;
      // Items sit in track coordinates; the real copy starts at `loop`.
      const at = v ? li.offsetTop : li.offsetLeft;
      const length = v ? li.offsetHeight : li.offsetWidth;
      const offset = getOffset();
      const shown = at - (loop + offset);
      const margin = config.current.fade ? Math.min(config.current.fadeSize, viewport * FADE_SHARE) : 0;
      if (shown < margin || shown + length > viewport - margin) {
        // Where the same item sits in the real copy, then the offset that centres it: the strip is paused (rate 0
        // below) and jumps there, so the focused item is in view. The copies before and after look identical.
        const start = loop + mod(at - loop, loop);
        setOffset(start - loop - (viewport - length) / 2);
        paint();
      }
    }
    wake();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    flags.current.focused = false;
    wake();
  }

  if (reduced) {
    return (
      <StaticMarquee
        vertical={vertical}
        gap={gap}
        listLabel={listLabel}
        itemClassName={itemClassName}
        className={className}
        {...props}
      >
        {items}
      </StaticMarquee>
    );
  }

  const zone = `min(${fadeSize}px, ${FADE_SHARE * 100}%)`;
  const mask =
    fade && !perItem
      ? `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, black ${zone}, black calc(100% - ${zone}), transparent)`
      : undefined;

  return (
    <div
      ref={rootRef}
      data-slot="marquee"
      data-paused={paused ? "" : undefined}
      className={cn("relative flex flex-col", vertical ? "h-96" : "w-full", className)}
      {...props}
    >
      {controls && (
        // First in the tab order (before any item), shown below the strip at its end, so it
        // never covers an item.
        <div data-slot="marquee-controls" className="order-last flex shrink-0 justify-end pt-1 pe-1">
          <Button
            variant="glass"
            size="icon"
            onClick={togglePaused}
            aria-label={paused ? L.play : L.pause}
            className="size-8 rounded-sheen-full"
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </Button>
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- hover pause is a pointer extra; the Pause button and keyboard focus pause it too */}
      <div
        ref={viewportRef}
        data-slot="marquee-viewport"
        // The strip is laid out left to right (the track starts at its left edge, copies follow to
        // the right); each list inside keeps the page's direction for its own items.
        dir="ltr"
        // overflow: clip (not hidden) so focusing an item can't scroll the strip behind our back.
        className={cn("overflow-clip", vertical ? "min-h-0 flex-1 px-2" : "py-2")}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        onPointerEnter={(event) => {
          if (!pauseOnHover || event.pointerType === "touch") return;
          flags.current.hovered = true;
          wake();
        }}
        onPointerLeave={() => {
          flags.current.hovered = false;
          wake();
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div
          ref={trackRef}
          data-slot="marquee-track"
          className={cn("relative flex will-change-transform", vertical ? "h-max flex-col" : "w-max")}
          style={{ gap }}
        >
          {Array.from({ length: copies }, (_, copy) => (
            <ul
              key={copy}
              dir={rtl ? "rtl" : "ltr"}
              aria-label={copy === 1 ? listLabel : undefined}
              aria-hidden={copy === 1 ? undefined : true}
              className={cn("flex shrink-0 items-center", vertical && "flex-col")}
              style={{ gap }}
            >
              {items.map((item, i) => (
                <li key={i} className={cn("shrink-0", itemClassName)}>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

type StaticMarqueeProps = Omit<ComponentProps<"div">, "children"> & {
  children: ReactNode[];
  vertical: boolean;
  gap: number;
  listLabel?: string;
  itemClassName?: string;
};

/**
 * Reduced motion: one still list. A row wraps onto as many lines as it needs. A column keeps
 * the height it was given and scrolls inside it (focusable only when there is something to scroll).
 */
function StaticMarquee({ children, vertical, gap, listLabel, itemClassName, className, ...props }: StaticMarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!vertical || !el) return;
    const check = () => setScrollable(el.scrollHeight > el.clientHeight + 1);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [vertical]);

  const list = (
    <ul
      aria-label={listLabel}
      className={cn("flex items-center", vertical ? "flex-col flex-nowrap py-2" : "flex-wrap justify-center")}
      style={{ gap }}
    >
      {children.map((item, i) => (
        <li key={i} className={cn("shrink-0", itemClassName)}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      data-slot="marquee"
      data-static=""
      className={cn("relative", vertical ? "flex h-96 flex-col" : "w-full", className)}
      {...props}
    >
      {vertical ? (
        <div
          ref={scrollerRef}
          data-slot="marquee-viewport"
          role={scrollable ? "region" : undefined}
          aria-label={scrollable ? listLabel : undefined}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard focusable
          tabIndex={scrollable ? 0 : undefined}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-sheen-md px-2 [scrollbar-width:thin]",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sheen-focus",
          )}
        >
          {list}
        </div>
      ) : (
        list
      )}
    </div>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
      <path d="M4.5 2.9v10.2a1 1 0 0 0 1.53.85l8.1-5.1a1 1 0 0 0 0-1.7l-8.1-5.1A1 1 0 0 0 4.5 2.9Z" />
    </svg>
  );
}
