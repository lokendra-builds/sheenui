"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { animate, frame, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { Toolbar } from "@base-ui/react/toolbar";

import { cn } from "../../lib/cn";
import { ease, follow, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { COARSE_POINTER_QUERY, FINE_POINTER_QUERY, useMediaQuery } from "../../hooks/use-media-query";

/** Which edge the dock sits on: "bottom" (default) or "top". */
export type DockSide = "bottom" | "top";

/** Icon sizes at rest, in px: `sm` 40, `md` 48 (default), `lg` 56. Touch screens never go below 44. */
const dockSizes = { sm: 40, md: 48, lg: 56 } as const;

type DockContextValue = {
  size: number;
  side: DockSide;
  reduced: boolean;
  scrolls: boolean;
  activeLabel: string;
  notch: boolean;
};

/** Row padding of the dock bar (`p-2`), in px: the gap between the bar edge and an icon. */
const ROW_PAD = 8;

/** How far an active icon lifts out of its notch, in px, for an icon `size` px wide: its centre ends up just inside the bar edge. */
const liftFor = (size: number) => Math.round(size * 0.42 + ROW_PAD);

type NotchShape = {
  width: number;
  height: number;
  cornerX: number;
  cornerY: number;
  x: number;
  radiusX: number;
  radiusY: number;
  /** How far the notch centre sits inside the bar edge (px). */
  depth: number;
  edge: DockSide;
};

/** Points of an elliptical arc around (cx, cy), from angle `from` to `to` (radians, y down), as `x y` pairs. */
function arcPoints(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps: number) {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    points.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
  }
  return points;
}

/**
 * A rounded rectangle with an elliptical notch bitten out of the edge the icons lift away from, as a `clip-path`
 * polygon(). A polygon, not path(): Chromium paints a curved path() clip over a backdrop-filter surface as a flat yellow
 * fill, while polygon() keeps the blur.
 */
function notchPath({ width: w, height: h, cornerX, cornerY, x, radiusX, radiusY, depth, edge }: NotchShape) {
  const rx = Math.min(cornerX, w / 2);
  const ry = Math.min(cornerY, h / 2);
  const half = depth < radiusY ? radiusX * Math.sqrt(1 - (depth / radiusY) ** 2) : 0;
  const left = Math.min(Math.max(x - half, rx), w - rx - 2 * half);
  const cx = left + half;
  const pi = Math.PI;
  // Clockwise from the top-left corner. The notch is a run of points along the ellipse around (cx, edge +/- depth).
  const points: [number, number][] = [...arcPoints(rx, ry, rx, ry, pi, 1.5 * pi, 8)];
  const a = Math.asin(Math.min(1, depth / radiusY));
  if (half > 0 && edge === "bottom") {
    // Left rim point, down around the bottom of the ellipse, up to the right rim point.
    points.push(...arcPoints(cx, depth, radiusX, radiusY, pi + a, -a, 28));
  }
  points.push(...arcPoints(w - rx, ry, rx, ry, 1.5 * pi, 2 * pi, 8));
  points.push(...arcPoints(w - rx, h - ry, rx, ry, 0, 0.5 * pi, 8));
  if (half > 0 && edge === "top") {
    // Right rim point, over the top of the ellipse, down to the left rim point.
    points.push(...arcPoints(cx, h - depth, radiusX, radiusY, 2 * pi + a, pi - a, 28));
  }
  points.push(...arcPoints(rx, h - ry, rx, ry, 0.5 * pi, pi, 8));
  return `polygon(${points.map(([px, py]) => `${Math.round(px * 100) / 100}px ${Math.round(py * 100) / 100}px`).join(",")})`;
}

/** Every English string {@link Dock} renders; pass a partial through its `labels` prop to translate it. */
export type DockLabels = {
  /** Added to the accessible name of active button items, e.g. "Finder, open". Links use aria-current instead. */
  active: string;
};

/** The English strings of {@link Dock}. Spread it to build your own set. */
export const defaultDockLabels: DockLabels = {
  active: "open",
};

const DockContext = createContext<DockContextValue | null>(null);

function useDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("DockItem and DockSeparator must be used inside <Dock>.");
  return ctx;
}

/** Smooth bell: 1 at the pointer, easing to 0 at `range` px away. */
function falloff(distance: number, range: number) {
  const t = Math.abs(distance) / range;
  return t >= 1 ? 0 : (1 + Math.cos(Math.PI * t)) / 2;
}

/**
 * Free space beside an element (the narrower side, in px) before something would clip it:
 * the viewport, or the nearest ancestors that clip or scroll sideways.
 */
function sideRoom(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  let left = 0;
  let right = document.documentElement.clientWidth;
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX !== "visible") {
      const clip = node.getBoundingClientRect();
      left = Math.max(left, clip.left + node.clientLeft);
      right = Math.min(right, clip.left + node.clientLeft + node.clientWidth);
    }
    // A fixed box escapes the clipping of everything above it.
    if (style.position === "fixed") break;
  }
  return Math.min(box.left - left, right - box.right);
}

type Slot = {
  el: HTMLElement;
  center: number;
  magnifies: boolean;
  mover: HTMLElement | null;
  label: HTMLElement | null;
  dot: HTMLElement | null;
};

/** Props of `Dock`; each option is documented on its field. */
export type DockProps = {
  /** Holds the dock items and separators. */
  children: ReactNode;
  /** Sets the accessible name of the toolbar. */
  label?: string;
  /** Translatable strings: `labels.active` ("open") is added to the accessible name of active button items, e.g. "Finder, open". Links use aria-current instead. */
  labels?: Partial<DockLabels>;
  /** Icon size at rest: `sm` 40px, `md` 48px or `lg` 56px (never below 44px on touch screens). Default "md". */
  size?: keyof typeof dockSizes;
  /** How much the icon under the pointer grows: 1 (off) to 2. Reduced to fit when there is little room beside the dock. Default 1.6. */
  magnification?: number;
  /** How far the swell reaches either side of the pointer, in px. Defaults to 2.75 × size. */
  distance?: number;
  /** Which edge the dock sits on. Icons grow away from it, labels show on the far side. Default "bottom". */
  side?: DockSide;
  /**
   * The active item lifts out of a round notch cut into the glass bar (the notch is part of the bar's own surface, not
   * an overlay) and glides to the next active item with the snappy spring. Needs an `active` item; without one the bar is
   * plain. Reduced motion: the notch and the lift jump.
   *
   * @default false
   */
  notch?: boolean;
  /** Adds extra classes to the dock bar. */
  className?: string;
};

/**
 * Dock: a macOS-style launcher bar. Icons near the pointer swell and push their neighbours apart, then settle back as it leaves. Use it for app launchers and quick-action rails; use `Toolbar` for editor controls and `Navbar` for site navigation.
 * `label` names the toolbar, `size` ("sm" | "md" | "lg") is the icon size at rest, `magnification` (1 to 2) and `distance` shape the swell, `side` picks the screen edge, and `labels.active` ("open") is added to the name of active button items ("Finder, open").
 *
 * With `notch`, the active item lifts out of a round notch in the glass bar (mask on the bar itself) and glides to the next active item.
 *
 * Motion (transform only):
 * - Every slot keeps its layout size. Each frame the dock works out every icon's scale from the (spring-smoothed) pointer position, then shifts every slot sideways by the extra width of the icons before it, so neighbours part exactly as much as the icons grew.
 *   The glass bar stretches with scaleX, with its corner radius counter-scaled so the ends stay round.
 * - Nothing goes through React state while the pointer moves: one frame callback writes transforms straight to the elements.
 * - The swell grows the dock sideways, past its own box (as on macOS). It needs free space beside the dock before the viewport or a clipping ancestor; with less, the swell is scaled down to fit, and with almost none it is left off.
 *
 * Keyboard: it is a Base UI toolbar (one Tab stop, arrow keys / Home / End move between items). The focused item is magnified as if the pointer were on it, with its label above. Escape hides the label (WCAG 1.4.13).
 * Accessibility: `role="toolbar"` named by `label`; labels are drawn by the dock (not a Tooltip) so they can ride on top of the magnified icon every frame; they are `aria-hidden`: each control carries its label as its accessible name. Links get `aria-current="page"` when active.
 * Glass and motion: one `glass-2` bar. Plain bar (no magnification): touch screens and coarse pointers, reduced motion, and too little room beside the dock. Only when the bar itself is wider than its container does it scroll sideways inside itself; then the label is drawn
 * outside the scrolling row so it is never clipped, and the launch bounce stays inside the bar.
 *
 * @example
 * ```tsx
 * import { Dock, DockItem, DockSeparator } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const FinderIcon: () => React.JSX.Element;
 * declare const MailIcon: () => React.JSX.Element;
 * declare const TrashIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <Dock label="Apps">
 *       <DockItem label="Finder" icon={<FinderIcon />} active />
 *       <DockItem label="Mail" icon={<MailIcon />} badge={3} badgeLabel="3 unread" />
 *       <DockSeparator />
 *       <DockItem label="Trash" icon={<TrashIcon />} />
 *     </Dock>
 *   );
 * }
 * ```
 *
 * @see /effects/macos-dock
 */
export function Dock({
  children,
  label = "Dock",
  labels,
  size: sizeToken = "md",
  magnification = 1.6,
  distance,
  side = "bottom",
  notch = false,
  className,
}: DockProps) {
  const activeLabel = labels?.active ?? defaultDockLabels.active;
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const floatRef = useRef<HTMLSpanElement>(null);
  const reduced = useSheenReducedMotion();
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const coarse = useMediaQuery(COARSE_POINTER_QUERY);
  const sizeProp = dockSizes[sizeToken];
  const size = coarse ? Math.max(sizeProp, 44) : sizeProp;
  const scale = Math.min(Math.max(magnification, 1), 2);
  const range = distance ?? size * 2.75;

  // Measured (see measure()): does the bar overflow its container, and how far may the icons
  // swell before the dock runs out of room beside it.
  const [scrolls, setScrolls] = useState(false);
  const [roomScale, setRoomScale] = useState(2);
  const swell = Math.min(scale, roomScale);
  // Below a quarter of the asked-for swell it is not worth the motion: plain bar.
  const magnify = finePointer && !reduced && !scrolls && swell > 1.001 && swell - 1 >= (scale - 1) / 4;

  // Pointer x (spring-smoothed) and how strongly the swell applies (0 at rest, 1 under the pointer).
  const target = useMotionValue(0);
  const pointerX = useSpring(target, follow.pointer);
  const strength = useSpring(0, follow.pointer);
  const hovered = useRef(false);

  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const geometry = useRef<{ slots: Slot[]; width: number; radius: number }>({ slots: [], width: 0, radius: 0 });
  const settings = useRef({ magnify, scale, swell, range, size, side, scrolls, notch });
  settings.current = { magnify, scale, swell, range, size, side, scrolls, notch };
  // Centre (px, in the bar's own coordinates) of the notch; springs to the active item.
  const notchX = useMotionValue(0);
  const notchAnimation = useRef<{ stop: () => void } | null>(null);
  const notchTarget = useRef<number | null>(null);

  /** Writes every transform for the current pointer position. Runs at most once per frame. */
  const apply = useRef(() => {
    const { slots, width, radius } = geometry.current;
    const { magnify: on, swell: max, range: reach, size: base, side: edge } = settings.current;
    const k = on ? strength.get() : 0;
    const x = pointerX.get();
    const scales = slots.map((slot) =>
      slot.magnifies && k > 0.001 ? 1 + (max - 1) * k * falloff(x - slot.center, reach) : 1,
    );
    const extras = scales.map((s) => (s - 1) * base);
    const total = extras.reduce((sum, e) => sum + e, 0);
    const rest = total < 0.05;
    const lift = edge === "bottom" ? -1 : 1;

    let before = 0;
    let activeOffset = 0;
    slots.forEach((slot, i) => {
      const s = scales[i] ?? 1;
      const e = extras[i] ?? 0;
      const offset = before + e / 2 - total / 2;
      before += e;
      if (slot.el.hasAttribute("data-active")) activeOffset = offset;
      if (rest) {
        slot.el.style.transform = "";
        if (slot.mover) slot.mover.style.transform = "";
        if (slot.label) slot.label.style.transform = "";
        if (slot.dot) slot.dot.style.transform = "";
        return;
      }
      if (!slot.magnifies) {
        slot.el.style.transform = `translateX(${offset}px)`;
        return;
      }
      if (slot.mover) slot.mover.style.transform = `translateX(${offset}px) scale(${s})`;
      if (slot.label) slot.label.style.transform = `translate(${offset}px, ${lift * (s - 1) * base}px)`;
      if (slot.dot) slot.dot.style.transform = `translateX(${offset}px)`;
    });

    const bar = barRef.current;
    if (bar && width > 0) {
      let stretch = 1;
      if (rest) {
        bar.style.transform = "";
        bar.style.borderRadius = "";
      } else {
        stretch = (width + total) / width;
        bar.style.transform = `scaleX(${stretch})`;
        // Counter-scale the horizontal radius so the stretched ends stay round.
        bar.style.borderRadius = `${radius / stretch}px / ${radius}px`;
      }
      if (settings.current.notch && bar.hasAttribute("data-notch")) {
        // The notch is a clip-path on the glass bar itself (never on a wrapper of glass). The bar is stretched by `stretch`
        // around its centre, so the path is drawn in the bar's pre-stretch coordinates: the notch stays under the (shifted)
        // active icon and stays round, like the counter-scaled corners.
        const cx = width / 2;
        const x = cx + (notchX.get() + (rest ? 0 : activeOffset) - cx) / stretch;
        bar.style.clipPath = notchPath({
          width: bar.offsetWidth,
          height: bar.offsetHeight,
          cornerX: radius / stretch,
          cornerY: radius,
          x,
          radiusX: (base / 2 + 5) / stretch,
          radiusY: base / 2 + 5,
          depth: ROW_PAD + base / 2 - liftFor(base),
          edge,
        });
      } else if (bar.style.clipPath) {
        bar.style.clipPath = "";
      }
    }
  }).current;

  const schedule = useCallback(() => frame.render(apply), [apply]);
  useMotionValueEvent(notchX, "change", schedule);
  useMotionValueEvent(pointerX, "change", schedule);
  useMotionValueEvent(strength, "change", schedule);

  /** Reads slot centres and the bar radius, whether the bar overflows, and the room to swell. */
  const measure = useCallback(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    const bar = barRef.current;
    if (!root || !row || !bar) return;
    const slots: Slot[] = Array.from(row.querySelectorAll<HTMLElement>("[data-dock-slot]")).map((el) => ({
      el,
      center: el.offsetLeft + el.offsetWidth / 2,
      magnifies: el.hasAttribute("data-dock-item"),
      mover: el.querySelector<HTMLElement>("[data-dock-mover]"),
      label: el.querySelector<HTMLElement>("[data-dock-label]"),
      dot: el.querySelector<HTMLElement>("[data-dock-dot]"),
    }));
    const last = slots[slots.length - 1];
    const padding = parseFloat(getComputedStyle(row).paddingRight) || 0;
    // Layout offsets, not rects: transforms (the swell) never count.
    const natural = last ? last.el.offsetLeft + last.el.offsetWidth + padding : 0;
    const previousRadius = bar.style.borderRadius;
    bar.style.borderRadius = "";
    const radius = parseFloat(getComputedStyle(bar).borderTopLeftRadius) || 0;
    bar.style.borderRadius = previousRadius;
    geometry.current = { slots, width: natural, radius };

    // The notch follows the active item: jump on first sight (and under reduced motion), glide afterwards.
    const activeSlot = slots.find((slot) => slot.el.hasAttribute("data-active"));
    if (settings.current.notch && activeSlot) {
      bar.setAttribute("data-notch", "");
      const at = activeSlot.center - row.scrollLeft;
      if (notchTarget.current !== at) {
        const first = notchTarget.current === null;
        notchTarget.current = at;
        notchAnimation.current?.stop();
        if (first || reducedRef.current) notchX.jump(at);
        else notchAnimation.current = animate(notchX, at, spring.snappy);
      }
    } else {
      bar.removeAttribute("data-notch");
      bar.style.clipPath = "";
      notchTarget.current = null;
    }

    // Scroll only when the bar at rest is wider than the space it is allowed (max-width: 100%).
    const overflows = natural > row.clientWidth + 1;
    setScrolls(overflows);

    // The swell widens the dock by up to `spread` px per unit of extra scale, half on each side.
    const { scale: max, range: reach, size: base } = settings.current;
    let spread = 0;
    for (const at of slots) {
      if (!at.magnifies) continue;
      const sum = slots.reduce(
        (acc, slot) => acc + (slot.magnifies ? base * falloff(at.center - slot.center, reach) : 0),
        0,
      );
      spread = Math.max(spread, sum);
    }
    let fit = 2;
    if (!overflows && max > 1 && spread > 0) fit = 1 + Math.max(0, (2 * sideRoom(root)) / spread);
    setRoomScale(Math.min(2, Math.floor(fit * 100) / 100));
    schedule();
  }, [schedule, notchX]);

  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    if (root.parentElement) observer.observe(root.parentElement);
    // The room beside the dock also changes with the viewport, even when the dock does not.
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Leaving magnify mode (touch, reduced motion, no room): settle everything back at once.
  useEffect(() => {
    if (!magnify) {
      strength.jump(0);
      schedule();
    }
  }, [magnify, strength, schedule]);

  /* ----- The label while the row scrolls: one label outside the scrolling row, so it is never clipped. ----- */

  const floatFor = useRef<HTMLElement | null>(null);

  /** Positions the scrolling-mode label over its item (kept inside the dock), or hides it. */
  const placeLabel = useCallback(() => {
    const float = floatRef.current;
    const root = rootRef.current;
    const row = rowRef.current;
    const slot = floatFor.current;
    if (!float || !root || !row) return;
    if (!slot || root.hasAttribute("data-labels-hidden")) {
      float.removeAttribute("data-open");
      return;
    }
    const rowBox = row.getBoundingClientRect();
    const slotBox = slot.getBoundingClientRect();
    const center = slotBox.left + slotBox.width / 2;
    // Scrolled out of sight: no label for it.
    if (center < rowBox.left || center > rowBox.right) {
      float.removeAttribute("data-open");
      return;
    }
    const rootBox = root.getBoundingClientRect();
    const width = float.offsetWidth;
    const left = Math.min(Math.max(center - rootBox.left - width / 2, 0), Math.max(0, rootBox.width - width));
    float.style.left = `${left}px`;
    float.setAttribute("data-open", "");
  }, []);

  function showLabel(slot: HTMLElement | null) {
    if (!scrolls) return;
    const float = floatRef.current;
    if (!float) return;
    if (slot && slot !== floatFor.current)
      float.textContent = slot.querySelector("[data-dock-label]")?.textContent ?? "";
    floatFor.current = slot;
    placeLabel();
  }

  function focusedSlot() {
    return rootRef.current?.querySelector(":focus-visible")?.closest<HTMLElement>("[data-dock-item]") ?? null;
  }

  useEffect(() => {
    if (!scrolls) floatFor.current = null;
  }, [scrolls]);

  /* ----- Pointer and keyboard ----- */

  function localX(clientX: number) {
    const row = rowRef.current;
    return row ? clientX - row.getBoundingClientRect().left : 0;
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    hovered.current = true;
    if (!magnify) return;
    const x = localX(event.clientX);
    if (strength.get() < 0.05) {
      target.jump(x);
      pointerX.jump(x);
    }
    strength.set(1);
  }

  function handlePointerOver(event: PointerEvent<HTMLDivElement>) {
    if (!scrolls || event.pointerType === "touch") return;
    const over = event.target as Element;
    // On the label itself (it is hoverable): keep it.
    if (floatRef.current?.contains(over)) return;
    showLabel(over.closest<HTMLElement>("[data-dock-item]") ?? focusedSlot());
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    hovered.current = true;
    const root = rootRef.current;
    if (root?.hasAttribute("data-labels-hidden")) {
      // Escape hid the labels; moving the pointer brings them back.
      root.removeAttribute("data-labels-hidden");
      if (scrolls) showLabel((event.target as Element).closest<HTMLElement>("[data-dock-item]") ?? floatFor.current);
    }
    if (!magnify) return;
    target.set(localX(event.clientX));
    strength.set(1);
  }

  function handlePointerLeave() {
    hovered.current = false;
    const focused = rootRef.current?.querySelector(":focus-visible");
    if (focused) focusItem(focused);
    else strength.set(0);
    if (scrolls) showLabel(focusedSlot());
  }

  function focusItem(el: Element) {
    const slot = el.closest<HTMLElement>("[data-dock-item]");
    if (!slot || !magnify) return;
    const center = slot.offsetLeft + slot.offsetWidth / 2;
    if (strength.get() < 0.05) {
      target.jump(center);
      pointerX.jump(center);
    } else {
      target.set(center);
    }
    strength.set(1);
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    rootRef.current?.removeAttribute("data-labels-hidden");
    if (!event.target.matches(":focus-visible")) return;
    if (!hovered.current) focusItem(event.target);
    if (scrolls) showLabel(event.target.closest<HTMLElement>("[data-dock-item]"));
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (rootRef.current?.contains(event.relatedTarget)) return;
    if (!hovered.current) {
      strength.set(0);
      if (scrolls) showLabel(null);
    }
  }

  /* ----- Touch: no hover, so the label shows while a finger is on the icon (and lingers a moment after a tap) ----- */

  const releaseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || !scrolls) return; // wide docks show the label through CSS (:active)
    clearTimeout(releaseTimer.current);
    const slot = (event.target as Element).closest<HTMLElement>("[data-dock-item]");
    if (slot) showLabel(slot);
  }

  function handlePointerRelease(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || !scrolls) return;
    clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => showLabel(hovered.current ? floatFor.current : focusedSlot()), 900);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root) return;
    if (event.key === "Escape" && !root.hasAttribute("data-labels-hidden")) {
      root.setAttribute("data-labels-hidden", "");
      placeLabel();
      event.stopPropagation();
      return;
    }
    // Home / End jump to the first / last item (the toolbar itself only handles the arrows).
    if ((event.key === "Home" || event.key === "End") && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const items = Array.from(root.querySelectorAll<HTMLElement>("[data-dock-item] :is(a, button)"));
      const next = event.key === "Home" ? items[0] : items[items.length - 1];
      if (next) {
        event.preventDefault();
        next.focus();
      }
    }
  }

  return (
    <DockContext value={{ size, side, reduced, scrolls, activeLabel, notch }}>
      <Toolbar.Root
        ref={rootRef}
        aria-label={label}
        data-slot="dock"
        data-side={side}
        data-magnify={magnify ? "" : undefined}
        data-scrolls={scrolls ? "" : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerRelease}
        onPointerCancel={handlePointerRelease}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("group/dock relative isolate inline-flex max-w-full", className)}
      >
        {/* The glass bar: a sibling behind the icons (never a wrapper), stretched with scaleX. */}
        <span
          ref={barRef}
          aria-hidden
          data-slot="dock-bar"
          className={cn("glass-2 pointer-events-none absolute inset-0 -z-10 origin-center rounded-sheen-lg")}
        />
        <div
          ref={rowRef}
          onScroll={scrolls ? placeLabel : undefined}
          className={cn(
            // min-w-0: the row may be narrower than its items; then (and only then) it scrolls.
            "relative flex min-w-0 gap-2 p-2",
            side === "bottom" ? "items-end" : "items-start",
            // Wider than its container: scroll inside the dock, never the page.
            scrolls && "overflow-x-auto overscroll-x-contain [scrollbar-width:none]",
          )}
        >
          {children}
        </div>
        {scrolls && (
          <span
            ref={floatRef}
            aria-hidden
            data-slot="dock-label"
            className={cn(
              "glass-3 pointer-events-none absolute left-0 z-10 rounded-sheen-sm px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sheen-fg",
              // Hoverable (WCAG 1.4.13): the shown label takes the pointer, and a bridge spans the gap to the bar.
              "before:absolute before:inset-x-0 before:h-3.5 data-open:pointer-events-auto",
              side === "bottom" ? "bottom-full mb-3 before:top-full" : "top-full mt-3 before:bottom-full",
              // `invisible` while closed: a hidden label must not count as a blurred surface (glass budget),
              // and the visibility transition keeps it visible until the fade-out has finished.
              "invisible opacity-0 data-open:visible data-open:opacity-100 motion-ok:transition-[opacity,visibility] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
            )}
          />
        )}
      </Toolbar.Root>
    </DockContext>
  );
}

/** Props of `DockItem`; each option is documented on its field. */
export type DockItemProps = {
  /** Accessible name, and the label shown above the icon. */
  label: string;
  /** The icon (an svg or an image). Sized to ~46% of the tile unless you size it. */
  icon: ReactNode;
  /** Address to open on click: the tile then renders as a link (an anchor) instead of a button. */
  href?: string;
  /** Link target, e.g. "_blank". */
  target?: string;
  /** Link relationship, e.g. "noopener". */
  rel?: string;
  /** Render the link as another element, e.g. your router's <Link to="…" />. */
  render?: ReactElement;
  /** Called when the item is pressed or activated with Enter / Space. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Open app / current page: a dot under the icon. Links get aria-current="page"; buttons add
   * `labels.active` of the Dock to their accessible name ("Finder, open").
   */
  active?: boolean;
  /** Overrides the Dock's `labels.active` for this item (i18n). */
  activeLabel?: string;
  /** A count or short text on the corner of the icon. */
  badge?: ReactNode;
  /** What screen readers hear for the badge, e.g. "3 unread". Defaults to the badge text. */
  badgeLabel?: string;
  /** Bounce like a launching app when activated (never with reduced motion). Default false. */
  bounce?: boolean;
  /** Disable the item. It stays focusable, as in any toolbar. A disabled link item renders as a disabled button (a link cannot be disabled). */
  disabled?: boolean;
  /** Classes for the item's outer slot (layout, margins). */
  className?: string;
  /** Adds extra classes to the icon tile (background, colour). */
  tileClassName?: string;
};

/**
 * One icon in a `Dock`: a button, or a link when you give it an `href` (or `render` your router's `<Link>`). `label` is the accessible name and the label shown above the icon; `icon` is an svg or image; `active` shows a dot (open app / current page);
 * `badge` and `badgeLabel` add a count on the corner; `bounce` plays a launch bounce; `disabled` keeps it focusable, as in any toolbar.
 *
 * Keyboard: reached with the arrow keys; Enter or Space presses a button, Enter follows a link. Accessibility: a native button or anchor named by `label` (active buttons add "open"; active links get `aria-current="page"`); 44px minimum on touch screens.
 * Glass and motion: the tile is flat glass that swells with the pointer; the bounce and swell are skipped under reduced motion.
 *
 * @example
 * ```tsx
 * import { DockItem } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const MailIcon: () => React.JSX.Element;
 * declare const BookIcon: () => React.JSX.Element;
 * declare function openMail(): void;
 *
 * export function Example() {
 *   return (
 *     <>
 *       <DockItem label="Mail" icon={<MailIcon />} badge={3} badgeLabel="3 unread" onClick={openMail} />
 *       <DockItem label="Docs" icon={<BookIcon />} href="/docs" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /effects/macos-dock
 */
export function DockItem({
  label,
  icon,
  href,
  target,
  rel,
  render,
  onClick,
  active = false,
  activeLabel: activeLabelProp,
  badge,
  badgeLabel,
  bounce = false,
  disabled = false,
  className,
  tileClassName,
}: DockItemProps) {
  const { size, side, reduced, scrolls, activeLabel, notch } = useDock();
  const lifted = notch && active && !disabled;
  const tileRef = useRef<HTMLElement>(null);
  const isLink = (href !== undefined || render !== undefined) && !disabled;
  const badgeText = badgeLabel ?? (typeof badge === "string" || typeof badge === "number" ? String(badge) : undefined);
  // Links carry "current" as aria-current; buttons say it in their name.
  const name = [label, active && !isLink ? (activeLabelProp ?? activeLabel) : undefined, badgeText]
    .filter(Boolean)
    .join(", ");

  function handleClick(event: MouseEvent<HTMLElement>) {
    onClick?.(event);
    const tile = tileRef.current;
    if (bounce && !reduced && tile && !event.defaultPrevented) {
      // Away from the edge the dock sits on. While the row scrolls, a small hop that stays inside the bar.
      const away = side === "bottom" ? -1 : 1;
      const hop = scrolls ? 6 : size * 0.55;
      animate(
        tile,
        { y: [0, away * hop, 0, away * hop * 0.4, 0] },
        {
          duration: scrolls ? 0.6 : 0.9,
          times: [0, 0.3, 0.6, 0.8, 1],
          ease: [ease.out, ease.exit, ease.out, ease.exit],
        },
      );
    }
  }

  const tileClass = cn(
    "glass-1 relative grid size-full place-items-center rounded-[28%] text-sheen-fg",
    "[&_svg]:size-[46%] [&_svg]:shrink-0 [&_img]:size-full [&_img]:rounded-[inherit] [&_img]:object-cover",
    "touch-manipulation select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]",
    // Press: a small squeeze (the CSS scale property, so it composes with the bounce and the swell).
    "motion-ok:transition-[scale,translate] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out motion-ok:active:scale-[0.92]",
    // Lifting out of the notch uses the controls' spring twin; reduced motion jumps.
    "motion-ok:data-lifted:duration-(--sheen-duration-snappy) motion-ok:data-lifted:ease-sheen-snappy",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
    "forced-colors:border forced-colors:border-[ButtonText]",
    tileClassName,
  );

  const liftStyle = { translate: lifted ? `0 ${(side === "bottom" ? -1 : 1) * liftFor(size)}px` : undefined };

  const content = (
    <>
      {icon}
      {badge != null && badge !== false && (
        <span
          aria-hidden
          className="sheen-fill absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-sheen-full px-1.5 text-2xs font-semibold text-sheen-accent-fg ring-2 ring-sheen-surface [background-image:var(--sheen-accent-fill)]"
        >
          {badge}
        </span>
      )}
    </>
  );

  return (
    <div
      data-dock-slot
      data-dock-item
      data-active={active ? "" : undefined}
      className={cn("group/dock-slot relative flex shrink-0 justify-center", className)}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        data-dock-label
        className={cn(
          "glass-3 pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-sheen-sm px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sheen-fg",
          // Hoverable (WCAG 1.4.13): the shown label takes the pointer, and a bridge spans the gap to the icon.
          "group-hover/dock-slot:pointer-events-auto before:absolute before:inset-x-0 before:h-3.5",
          side === "bottom" ? "bottom-full mb-3 before:top-full" : "top-full mt-3 before:bottom-full",
          // `invisible` while closed: one blurred label per icon would blow the glass budget (13 icons = 13
          // surfaces). The visibility transition keeps a label visible until its fade-out has finished.
          "invisible opacity-0 motion-ok:transition-[opacity,visibility] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
          "group-hover/dock-slot:visible group-hover/dock-slot:opacity-100 group-has-[:focus-visible]/dock-slot:visible group-has-[:focus-visible]/dock-slot:opacity-100",
          // Touch has no hover: the label shows while a finger is pressed on the icon (and while a mouse button is).
          "group-has-[:active]/dock-slot:visible group-has-[:active]/dock-slot:opacity-100",
          "group-data-[labels-hidden]/dock:invisible! group-data-[labels-hidden]/dock:opacity-0!",
          // While the row scrolls it would be clipped: the dock shows one label outside the row instead.
          "group-data-[scrolls]/dock:hidden",
        )}
      >
        {label}
      </span>
      <span data-dock-mover className={cn("flex size-full", side === "bottom" ? "origin-bottom" : "origin-top")}>
        {isLink ? (
          <Toolbar.Link
            ref={tileRef as Ref<HTMLAnchorElement>}
            href={href}
            target={target}
            rel={rel}
            render={render}
            aria-label={name}
            aria-current={active ? "page" : undefined}
            data-lifted={lifted ? "" : undefined}
            style={liftStyle}
            onClick={handleClick}
            className={tileClass}
          >
            {content}
          </Toolbar.Link>
        ) : (
          <Toolbar.Button
            ref={tileRef as Ref<HTMLButtonElement>}
            aria-label={name}
            disabled={disabled}
            data-lifted={lifted ? "" : undefined}
            style={liftStyle}
            onClick={handleClick}
            className={tileClass}
          >
            {content}
          </Toolbar.Button>
        )}
      </span>
      {active && (
        <span
          aria-hidden
          data-dock-dot
          className={cn(
            "absolute left-1/2 size-1 -translate-x-1/2 rounded-full bg-sheen-fg forced-colors:bg-[CanvasText]",
            side === "bottom" ? "-bottom-1.5" : "-top-1.5",
          )}
        />
      )}
    </div>
  );
}

/** Props of `DockSeparator`; each option is documented on its field. */
export type DockSeparatorProps = {
  /** Adds extra classes to the separator slot. */
  className?: string;
};

/**
 * A thin divider between groups of items (e.g. apps | folders, trash).
 *
 * Keyboard: skipped by the arrow keys (it is not a control). Accessibility: `role="separator"` inside the toolbar, visible in forced colors.
 * Glass and motion: a flat line that is pushed along with the other slots when icons swell; reduced motion has no swell.
 *
 * @example
 * ```tsx
 * import { Dock, DockItem, DockSeparator } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const FinderIcon: () => React.JSX.Element;
 * declare const TrashIcon: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <Dock label="Apps">
 *       <DockItem label="Finder" icon={<FinderIcon />} />
 *       <DockSeparator />
 *       <DockItem label="Trash" icon={<TrashIcon />} />
 *     </Dock>
 *   );
 * }
 * ```
 *
 * @see /effects/macos-dock
 */
export function DockSeparator({ className }: DockSeparatorProps) {
  return (
    <div data-dock-slot className={cn("flex shrink-0 items-center self-stretch px-0.5", className)}>
      <Toolbar.Separator className="h-3/5 w-px bg-sheen-border forced-colors:bg-[CanvasText]" />
    </div>
  );
}
