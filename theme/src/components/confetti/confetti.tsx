"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/cn";
import { deviceBudget, resolveCssColor, useHydrated } from "../../lib/canvas-effects";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/** Where a burst starts: an element (its centre) or a point as a fraction of the viewport (`{ x: 0.5, y: 0.5 }` is the middle). */
export type ConfettiOrigin = HTMLElement | { x: number; y: number };

/** Options of one burst, passed to `fire()`. Every field falls back to the matching prop of {@link Confetti}. */
export type ConfettiFireOptions = {
  /** Where the burst starts. Defaults to a point a little below the middle of the viewport. */
  origin?: ConfettiOrigin;
  /** Number of pieces for this burst (capped by `maxCount`). */
  count?: number;
  /** Sets the width of the fan in degrees. */
  spread?: number;
  /** Direction of the centre of the fan in degrees, counter-clockwise from pointing right (90 is straight up). */
  angle?: number;
  /** Sets the launch speed in px per second. */
  velocity?: number;
  /** Colours of the pieces, any CSS colours. Defaults to the accent tokens plus success, warning and danger. */
  colors?: string[];
};

/** What a ref to {@link Confetti} (or `useConfetti().ref`) gives you. */
export type ConfettiHandle = {
  /** Starts one burst. Under reduced motion it shows the `badge` instead and draws nothing. */
  fire: (options?: ConfettiFireOptions) => void;
  /** Removes every piece at once. */
  clear: () => void;
};

/** Props of {@link Confetti}. */
export type ConfettiProps = {
  /** Ref that receives the `fire()` / `clear()` handle. Usually `useConfetti().ref`. */
  ref?: Ref<ConfettiHandle>;
  /**
   * Sets how many pieces each burst draws.
   * @default 120
   */
  count?: number;
  /**
   * The most pieces a single burst ever draws, whatever `count` asks for. Halved on weak devices.
   * @default 200
   */
  maxCount?: number;
  /**
   * Sets the width of the fan in degrees.
   * @default 75
   */
  spread?: number;
  /**
   * Direction of the centre of the fan in degrees, counter-clockwise from pointing right.
   * @default 120
   */
  angle?: number;
  /**
   * Sets the launch speed in px per second.
   * @default 720
   */
  velocity?: number;
  /**
   * Sets the colours of the pieces, any CSS colours.
   * @default the accent, second accent, success, warning and danger tokens
   */
  colors?: string[];
  /** Shown instead of a burst when reduced motion is on, in a polite live region, so the moment is still marked (and announced). Without it a reduced-motion `fire()` does nothing. */
  badge?: ReactNode;
  /**
   * Seconds the badge stays up.
   * @default 2.6
   */
  badgeDuration?: number;
  /** Adds extra classes to the badge wrapper (a fixed, centred strip near the top). */
  className?: string;
};

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  round: boolean;
  /** 0 rectangle, 1 disc, 2 thin ribbon, 3 triangle, 4 four-point star. */
  shape: number;
  /** Air resistance multiplier: light pieces hang, heavy ones fall. */
  weight: number;
  rotation: number;
  spin: number;
  flutter: number;
  phase: number;
  color: string;
  age: number;
  life: number;
};

const HARD_CAP = 220;
const DPR_CAP = 2;
const GRAVITY = 1100;
const DRAG = 1.9;

const FALLBACK_COLORS = [
  "var(--sheen-accent)",
  "var(--sheen-accent-2)",
  "var(--sheen-success)",
  "var(--sheen-warning)",
  "var(--sheen-danger)",
];

/** Fills one piece in its own (already rotated and tilted) coordinates. */
function drawPiece(ctx: CanvasRenderingContext2D, p: Piece) {
  const r = p.w / 2;
  if (p.shape === 1 || p.round) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 2) {
    ctx.fillRect(-p.w * 0.9, -p.h * 0.22, p.w * 1.8, p.h * 0.44);
  } else if (p.shape === 3) {
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.lineTo(r * 1.05, r * 0.8);
    ctx.lineTo(-r * 1.05, r * 0.8);
    ctx.closePath();
    ctx.fill();
  } else if (p.shape === 4) {
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.quadraticCurveTo(0, 0, r * 1.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, r * 1.2);
    ctx.quadraticCurveTo(0, 0, -r * 1.2, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r * 1.2);
    ctx.fill();
  } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
}

/** What {@link useConfetti} returns. */
export type UseConfettiReturn = {
  /** Pass to `<Confetti ref={ref} />`. */
  ref: RefObject<ConfettiHandle | null>;
  /** Starts one burst (does nothing until a `<Confetti>` with this ref is mounted). */
  fire: (options?: ConfettiFireOptions) => void;
  /** Removes every piece at once. */
  clear: () => void;
};

/**
 * Confetti: a one-shot burst of coloured paper for success moments (an order placed, a goal reached, an upload finished). Render it once, anywhere, and fire it from an event handler.
 *
 * `<Confetti>` draws nothing until `fire()` is called. A burst starts at an element (`origin={buttonElement}`) or at a point of the viewport, fans out, falls with drag and flutter and is gone in about three seconds; the canvas then hides itself and nothing runs. The number of pieces is capped (`maxCount`, 220 at most, halved on weak devices), and several bursts can overlap. Use `useConfetti()` to get the handle without a manual ref.
 *
 * Keyboard: Not focusable; it never takes pointer events, so the page underneath stays usable during a burst.
 * Accessibility: The canvas is decorative and `aria-hidden`. Never let confetti be the only sign of success: also show text or a toast. With reduced motion `fire()` draws nothing; pass `badge` to show a still, polite live-region message instead.
 * Glass: A fixed full-viewport canvas in a portal on `<body>`, so it is never inside a glass surface and never blurs, masks or filters one.
 * Motion: Pieces are painted on a 2D canvas by one `requestAnimationFrame` loop that exists only while pieces are in flight; a hidden tab ends the burst. Reduced motion: no burst.
 *
 * @example
 * ```tsx
 * import { Button, Confetti, useConfetti } from "@sheenui/theme";
 *
 * export function Checkout() {
 *   const { ref, fire } = useConfetti();
 *
 *   return (
 *     <>
 *       <Button onClick={(event) => fire({ origin: event.currentTarget })}>Place order</Button>
 *       <Confetti ref={ref} badge="Order placed" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /effects/confetti
 */
export function Confetti({
  ref,
  count = 120,
  maxCount = 200,
  spread = 75,
  angle = 90,
  velocity = 720,
  colors,
  badge,
  badgeDuration = 2.6,
  className,
}: ConfettiProps) {
  const reduced = useSheenReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mounted = useHydrated();
  const [badgeOn, setBadgeOn] = useState(false);
  const defaults = useRef({
    count,
    maxCount,
    spread,
    angle,
    velocity,
    colors,
    badgeDuration,
    hasBadge: badge != null,
    reduced,
  });
  const loop = useRef({ pieces: [] as Piece[], raf: 0, last: 0, badgeTimer: 0 });

  useEffect(() => {
    defaults.current = {
      count,
      maxCount,
      spread,
      angle,
      velocity,
      colors,
      badgeDuration,
      hasBadge: badge != null,
      reduced,
    };
  });

  const stop = useCallback(() => {
    const l = loop.current;
    cancelAnimationFrame(l.raf);
    l.raf = 0;
    l.last = 0;
    l.pieces = [];
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    if (canvas) canvas.style.display = "none";
  }, []);

  const frame = useCallback(
    function frame(now: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const l = loop.current;
      if (!canvas || !ctx) {
        stop();
        return;
      }
      const dt = l.last ? Math.min((now - l.last) / 1000, 0.05) : 1 / 60;
      l.last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      l.pieces = l.pieces.filter((p) => {
        p.age += dt;
        if (p.age >= p.life || p.y > window.innerHeight + 40) return false;
        const pd = Math.exp(-DRAG * p.weight * dt);
        p.vx *= pd;
        p.vy = p.vy * pd + GRAVITY * (0.75 + p.weight * 0.25) * dt;
        p.x += p.vx * dt + Math.sin(p.phase + p.age * 7) * p.flutter * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        const fade = Math.min(1, (p.life - p.age) / (p.life * 0.3));
        const tilt = Math.cos(p.phase + p.age * 9);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, tilt);
        // A piece turning edge-on catches the light: it brightens as it flips.
        ctx.globalAlpha = Math.max(0, fade) * (0.8 + 0.2 * Math.abs(tilt));
        ctx.fillStyle = p.color;
        drawPiece(ctx, p);
        return true;
      });
      ctx.globalAlpha = 1;
      if (l.pieces.length === 0) stop();
      else l.raf = requestAnimationFrame(frame);
    },
    [stop],
  );

  const fire = useCallback(
    (options: ConfettiFireOptions = {}) => {
      const d = defaults.current;
      const l = loop.current;
      if (d.reduced) {
        if (d.hasBadge) {
          setBadgeOn(true);
          window.clearTimeout(l.badgeTimer);
          l.badgeTimer = window.setTimeout(() => setBadgeOn(false), d.badgeDuration * 1000);
        }
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas || document.visibilityState === "hidden") return;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      canvas.style.display = "block";

      const origin = options.origin;
      let ox = width / 2;
      let oy = height * 0.6;
      if (origin instanceof Element) {
        const rect = origin.getBoundingClientRect();
        ox = rect.left + rect.width / 2;
        oy = rect.top + rect.height / 2;
      } else if (origin) {
        ox = origin.x * width;
        oy = origin.y * height;
      }

      const palette = (options.colors ?? d.colors ?? FALLBACK_COLORS).map((c) => resolveCssColor(canvas, c));
      const wanted = Math.min(options.count ?? d.count, d.maxCount, HARD_CAP) * deviceBudget();
      const total = Math.max(0, Math.round(wanted));
      const fan = ((options.spread ?? d.spread) * Math.PI) / 180;
      const centre = ((options.angle ?? d.angle) * Math.PI) / 180;
      const power = options.velocity ?? d.velocity;
      for (let i = 0; i < total; i++) {
        const a = centre + (Math.random() - 0.5) * fan;
        const v = power * (0.4 + Math.random() * 0.6);
        const w = 6 + Math.random() * 7;
        const shape = Math.floor(Math.random() * 5);
        l.pieces.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * v,
          vy: -Math.sin(a) * v,
          w,
          h: w * (0.45 + Math.random() * 0.2),
          round: false,
          shape,
          weight: 0.7 + Math.random() * 0.9,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 12,
          flutter: 30 + Math.random() * 50,
          phase: Math.random() * Math.PI * 2,
          color: palette[Math.floor(Math.random() * palette.length)] ?? "transparent",
          age: 0,
          life: 2.2 + Math.random() * 1.1,
        });
      }
      if (!l.raf && l.pieces.length > 0) l.raf = requestAnimationFrame(frame);
    },
    [frame],
  );

  useImperativeHandle(ref, () => ({ fire, clear: stop }), [fire, stop]);

  // A hidden tab ends the burst (no frames run there), and unmounting leaves nothing behind.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", onHide);
    const timers = loop.current;
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      cancelAnimationFrame(timers.raf);
      window.clearTimeout(timers.badgeTimer);
    };
  }, [stop]);

  if (!mounted) return null;
  return createPortal(
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-slot="confetti"
        className="pointer-events-none fixed inset-0 z-[70] hidden size-full"
      />
      {badge != null && (
        <div
          role="status"
          data-slot="confetti-badge"
          className={cn("pointer-events-none fixed inset-x-0 top-6 z-[70] flex justify-center px-4", className)}
        >
          {badgeOn && reduced && (
            <span className="glass-2 rounded-sheen-full px-4 py-2 text-sm font-medium text-sheen-fg">{badge}</span>
          )}
        </div>
      )}
    </>,
    document.body,
  );
}

/**
 * The handle of a {@link Confetti} without a manual ref: render `<Confetti ref={ref} />` once and call `fire()` from any handler.
 *
 * Returns `{ ref, fire, clear }`. `fire(options?)` starts a burst (see `ConfettiFireOptions`: `origin`, `count`, `spread`, `angle`, `velocity`, `colors`); it does nothing while no `<Confetti>` is mounted with this `ref`, and with reduced motion it shows the component's `badge` instead of a burst. `clear()` removes the pieces at once. The functions are stable between renders.
 *
 * Accessibility: No UI of its own; the burst is decorative, so pair it with visible text.
 * Motion: Nothing runs until `fire()` is called.
 *
 * @example
 * ```tsx
 * import { Button, Confetti, useConfetti } from "@sheenui/theme";
 *
 * export function Save() {
 *   const { ref, fire } = useConfetti();
 *   return (
 *     <>
 *       <Button onClick={() => fire({ origin: { x: 0.5, y: 0.4 }, count: 60 })}>Save</Button>
 *       <Confetti ref={ref} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /effects/confetti
 */
export function useConfetti(): UseConfettiReturn {
  const ref = useRef<ConfettiHandle | null>(null);
  const fire = useCallback((options?: ConfettiFireOptions) => ref.current?.fire(options), []);
  const clear = useCallback(() => ref.current?.clear(), []);
  return { ref, fire, clear };
}
