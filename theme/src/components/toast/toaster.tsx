"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";

import { PHONE_QUERY, useMediaQuery } from "../../hooks/use-media-query";
import { useResolvedDirection } from "../../hooks/use-direction";
import { cn } from "../../lib/cn";
import { duration } from "../../motion/tokens";
import { StateLightLayer, type SheenLightState } from "../../lib/state-light";
import { SpinnerIcon } from "../spinner/spinner";
import {
  defaultToasterLabels,
  type ToastPosition,
  type ToastPositionProp,
  type ToasterProps,
  type ToastType,
} from "./toast";

/*
 * The toast viewport and its list. Kept apart from toast.tsx (the provider and `useToast`) so an app
 * can load it after first paint: Base UI's toast root, swipe handling and viewport are ~9 KB gzip that
 * only matter once a toast is shown. `Toaster` is still exported from "./toast".
 */

/* Viewport: fixed to its corner, clear of notches and home indicators (safe-area insets).
   Phones: full width minus 16px gutters. From sm: a 360px column 32px from the edges. */
const viewportEdge = {
  top: "top-[max(1rem,env(safe-area-inset-top))] bottom-auto sm:top-[max(2rem,env(safe-area-inset-top))]",
  bottom: "top-auto bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-[max(2rem,env(safe-area-inset-bottom))]",
};
const viewportAlign = {
  right: "sm:right-[max(2rem,env(safe-area-inset-right))] sm:left-auto",
  left: "sm:right-auto sm:left-[max(2rem,env(safe-area-inset-left))]",
  // Equal insets + auto margins centre a fixed-width box without a transform.
  center: "sm:mx-auto",
};

/* Root, per edge. --toast-offset-y (from Base UI) is the summed height of the newer toasts
   in front; --toast-index counts from the front (0 = newest). */
const rootEdge = {
  top: cn(
    "top-0 origin-top",
    "[--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
    // Collapsed: older toasts shrink and peek out BELOW the newest one.
    "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
    // Keeps the pointer "inside" the stack while it crosses the gaps of the fanned-out list.
    "before:bottom-full",
    "motion-ok:data-starting-style:[transform:translateY(-24px)_scale(0.96)]",
    "motion-ok:[&[data-ending-style]:not([data-limited]):not([data-behind]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
  ),
  bottom: cn(
    "bottom-0 origin-bottom",
    "[--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
    // Collapsed: older toasts shrink and peek out ABOVE the newest one.
    "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
    "before:top-full",
    "motion-ok:data-starting-style:[transform:translateY(24px)_scale(0.96)]",
    "motion-ok:[&[data-ending-style]:not([data-limited]):not([data-behind]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  ),
};

/** Swipe towards the nearest edges to dismiss: up (or down) plus the side the stack is on. */
/** Turns a logical `…-start` / `…-end` position into the physical corner for the text direction. */
function resolveToastPosition(position: ToastPositionProp, dir: "ltr" | "rtl"): ToastPosition {
  if (!position.endsWith("-start") && !position.endsWith("-end")) return position as ToastPosition;
  const [edge, logical] = position.split("-") as ["top" | "bottom", "start" | "end"];
  const left = (logical === "start") === (dir === "ltr");
  return `${edge}-${left ? "left" : "right"}`;
}

const swipeDirections: Record<ToastPosition, ("up" | "down" | "left" | "right")[]> = {
  "top-right": ["up", "right"],
  "top-left": ["up", "left"],
  "top-center": ["up", "left", "right"],
  "bottom-right": ["down", "right"],
  "bottom-left": ["down", "left"],
  "bottom-center": ["down", "left", "right"],
};

/*
 * Swipe velocity: the pointer's speed is sampled while it drags, and on release the exit duration becomes
 * (distance left) / (speed), clamped to 60 ms - duration.base (never longer than the entrance), so the toast leaves at the speed of the finger.
 * Base UI does the drag itself; this only sets one CSS variable.
 */
const swipeSamples = new WeakMap<Element, { x: number; y: number; t: number; v: number }>();
function trackSwipe(event: PointerEvent<HTMLElement>) {
  if (event.buttons === 0 && event.pointerType === "mouse") return;
  const el = event.currentTarget;
  const prev = swipeSamples.get(el);
  const now = event.timeStamp;
  if (prev && now > prev.t) {
    const v = Math.hypot(event.clientX - prev.x, event.clientY - prev.y) / (now - prev.t);
    swipeSamples.set(el, { x: event.clientX, y: event.clientY, t: now, v: prev.v * 0.5 + v * 0.5 });
  } else if (!prev) {
    swipeSamples.set(el, { x: event.clientX, y: event.clientY, t: now, v: 0 });
  }
}
function releaseSwipe(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const sample = swipeSamples.get(el);
  swipeSamples.delete(el);
  if (!sample || sample.v < 0.2 || event.timeStamp - sample.t > 80) {
    el.style.removeProperty("--sheen-swipe-dur");
    return;
  }
  // Distance still to cover: the exit ends 150% of the toast away along the swipe axis. Duration = distance /
  // measured speed, with no multiplier, so the toast leaves at the speed of the finger.
  const mx = Math.abs(parseFloat(el.style.getPropertyValue("--toast-swipe-movement-x")) || 0);
  const my = Math.abs(parseFloat(el.style.getPropertyValue("--toast-swipe-movement-y")) || 0);
  const horizontal = mx >= my;
  const remaining = Math.max(0, (horizontal ? el.offsetWidth : el.offsetHeight) * 1.5 - (horizontal ? mx : my));
  el.style.setProperty(
    "--sheen-swipe-dur",
    `${Math.round(Math.min(duration.base * 1000, Math.max(60, remaining / sample.v)))}ms`,
  );
}

/* On a phone the stack spans the screen, so a swipe to either side is the natural dismiss gesture. */
/**
 * The fixed viewport that renders the toast stack. Render exactly one inside `ToastProvider`.
 * `position` picks the corner or edge ("top-right" by default, "bottom-center", ...); `className` styles the viewport.
 * On phones every position spans the screen width (minus 16px gutters), so only top or bottom matters there.
 *
 * Keyboard: Tab reaches the toasts' Dismiss buttons while the stack is open; swipe towards the nearest edge to
 * dismiss on touch (on a phone, to either side). Accessibility: a live region announces new toasts; the viewport sits clear of safe-area insets.
 * Glass and motion: see `ToastProvider` (glass-2 toasts, slide-in, fan-out on hover, fade-only under reduced motion).
 *
 * @example
 * ```tsx
 * import { Toaster, ToastProvider } from "@sheenui/theme";
 *
 * // Placeholders for your own code:
 * declare const App: () => React.JSX.Element;
 *
 * export function Example() {
 *   return (
 *     <ToastProvider>
 *       <App />
 *       <Toaster position="bottom-right" />
 *     </ToastProvider>
 *   );
 * }
 * ```
 *
 * @see /components/toast
 */
export function Toaster({
  position: positionProp = "top-right",
  className,
  onlyPositioned = false,
  container,
  labels,
}: ToasterProps) {
  const dir = useResolvedDirection();
  const position = resolveToastPosition(positionProp, dir);
  const dismiss = labels?.dismiss ?? defaultToasterLabels.dismiss;
  const loadingLabel = labels?.loading ?? defaultToasterLabels.loading;
  const actionHint = labels?.actionHint ?? defaultToasterLabels.actionHint;
  const [edge, align] = position.split("-") as ["top" | "bottom", "left" | "center" | "right"];
  const phone = useMediaQuery(PHONE_QUERY);
  useRestoreFocusAfterToast();
  const swipe = phone
    ? [...new Set([...swipeDirections[position], "left" as const, "right" as const])]
    : swipeDirections[position];
  return (
    <BaseToast.Portal container={container ?? undefined}>
      <BaseToast.Viewport
        data-slot="toaster"
        aria-label={labels?.region ?? defaultToasterLabels.region}
        data-position={position}
        className={cn(
          "z-[60] sm:w-[22.5rem]",
          container ? "absolute" : "fixed",
          "right-[max(1rem,env(safe-area-inset-right))] left-[max(1rem,env(safe-area-inset-left))]",
          viewportEdge[edge],
          viewportAlign[align],
          className,
        )}
      >
        <ToastList
          edge={edge}
          swipeDirection={swipe}
          dismissLabel={dismiss}
          loadingLabel={loadingLabel}
          actionHint={actionHint}
          position={position}
          dir={dir}
          onlyPositioned={onlyPositioned}
        />
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

const icons: Record<Exclude<ToastType, "loading">, ReactNode> = {
  info: <path d="M12 16v-4m0-4h.01" />,
  success: <path d="M8 12.5l2.5 2.5L16 9.5" />,
  warning: <path d="M12 8v4m0 4h.01" />,
  danger: <path d="M12 8v4m0 4h.01" />,
};

/* The status light of each type: --glow feeds the soft wash behind the icon (the Content's background). Loading is accent. */
const glowColor: Record<ToastType, string> = {
  info: "[--glow:var(--sheen-accent-glow)]",
  success: "[--glow:var(--sheen-success-glow)]",
  warning: "[--glow:var(--sheen-warning-glow)]",
  danger: "[--glow:var(--sheen-danger-glow)]",
  loading: "[--glow:var(--sheen-accent-glow)]",
};

/** The state light of each toast type (`data-state` on the toast): info stays unlit; loading is working; danger is error. */
const lightState: Record<ToastType, SheenLightState> = {
  info: "idle",
  success: "success",
  warning: "warning",
  danger: "error",
  loading: "working",
};

const iconColor: Record<ToastType, string> = {
  info: "text-sheen-accent",
  success: "text-sheen-success-text",
  warning: "text-sheen-warning-text",
  danger: "text-sheen-danger-text",
  loading: "text-sheen-accent",
};

/*
 * F6 moves focus into the toast viewport (Base UI). Remember where it came from, and when Escape (or a dismiss)
 * leaves focus on nothing useful (the body or the viewport region), put it back on that element.
 */
function useRestoreFocusAfterToast() {
  const origin = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const inToaster = (node: Element | null) => !!node?.closest("[data-slot=toaster],[data-slot=toast]");
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (event.key === "F6" && active instanceof HTMLElement && !inToaster(active)) origin.current = active;
      if (event.key === "Escape" && inToaster(active)) {
        const target = origin.current;
        origin.current = null;
        if (target?.isConnected)
          // After Base UI has handled the key and dismissed the toast.
          setTimeout(() => {
            if (
              !document.activeElement ||
              document.activeElement === document.body ||
              inToaster(document.activeElement)
            )
              target.focus({ preventScroll: true });
          }, 0);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);
}

/* Base UI hides toast parts from assistive tech (aria-hidden): a high-priority toast until focus enters it (a live
 * region announces it instead), and every Close button while the stack is collapsed and unfocused. A focusable control
 * inside aria-hidden is an a11y violation, so such a button leaves the tab order, and returns as soon as aria-hidden
 * is lifted (the stack expands or takes focus). */
function useTabbableWhenShown() {
  const [tabIndex, setTabIndex] = useState<number | undefined>(undefined);
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return undefined;
    const toast = node.closest("[data-slot=toast]");
    // Focus inside the toast (the toast itself included) keeps its buttons tabbable, so keyboard users can reach them
    // from the toast; they are only taken out of the tab order while nobody is in the toast and they are hidden.
    const sync = () =>
      setTabIndex(node.closest("[aria-hidden=true]") && !toast?.contains(document.activeElement) ? -1 : undefined);
    sync();
    toast?.addEventListener("focusin", sync);
    const onOut = () => queueMicrotask(sync);
    toast?.addEventListener("focusout", onOut);
    const observer = new MutationObserver(sync);
    const options = { attributes: true, attributeFilter: ["aria-hidden"] };
    // aria-hidden can sit on any ancestor up to the toast (Base UI puts it on the Content), so watch the whole chain.
    for (let el: HTMLElement | null = node; el; el = el === toast ? null : el.parentElement)
      observer.observe(el, options);
    return () => {
      observer.disconnect();
      toast?.removeEventListener("focusin", sync);
      toast?.removeEventListener("focusout", onOut);
    };
  }, []);
  return { ref, tabIndex };
}

function ToastAction(props: ComponentProps<typeof BaseToast.Action>) {
  const { ref, tabIndex } = useTabbableWhenShown();
  return <BaseToast.Action ref={ref} tabIndex={tabIndex} {...props} />;
}

function ToastDismiss(props: ComponentProps<typeof BaseToast.Close>) {
  const { ref, tabIndex } = useTabbableWhenShown();
  return <BaseToast.Close ref={ref} tabIndex={tabIndex} {...props} />;
}

function ToastList({
  edge,
  swipeDirection,
  dismissLabel,
  loadingLabel,
  actionHint,
  position,
  dir,
  onlyPositioned,
}: {
  edge: "top" | "bottom";
  swipeDirection: ("up" | "down" | "left" | "right")[];
  dismissLabel: string;
  loadingLabel: string;
  actionHint: (action: string) => string;
  position: ToastPosition;
  dir: "ltr" | "rtl";
  onlyPositioned: boolean;
}) {
  const { toasts } = BaseToast.useToastManager();
  const mine = toasts.filter((toast) => {
    const own = (toast.data as { position?: ToastPositionProp } | undefined)?.position;
    return own === undefined ? !onlyPositioned : resolveToastPosition(own, dir) === position;
  });

  return mine.map((toast) => {
    const type: ToastType =
      toast.type === "loading" || (toast.type as ToastType) in icons ? (toast.type as ToastType) : "info";
    return (
      <BaseToast.Root
        data-slot="toast"
        data-state={lightState[type]}
        key={toast.id}
        toast={toast}
        swipeDirection={swipeDirection}
        onPointerMove={trackSwipe}
        onPointerUp={releaseSwipe}
        className={cn(
          "glass-2 absolute right-0 left-0 w-full rounded-sheen-lg select-none",
          // Stacking: newer toasts sit in front, older ones peek out behind.
          "[--gap:0.75rem] [--peek:0.5rem] sm:[--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
          "[--height:var(--toast-frontmost-height,var(--toast-height))]",
          "z-[calc(1000-var(--toast-index))] h-(--height) data-expanded:h-(--toast-height)",
          // The hover bridge lives in ::before: glass-2 paints its lit rim in ::after, which must keep the toast's own box.
          "before:absolute before:left-0 before:h-[calc(var(--gap)+1px)] before:w-full before:content-['']",
          rootEdge[edge],
          glowColor[type],
          // The state light (a lit edge and a faint aura; the wash behind the icon is the pool). Peeking layers stay unlit.
          "[&[data-behind]:not([data-expanded])>[data-slot=state-light]]:hidden",
          // Peeking layers (collapsed, behind the newest): only the lit hairline, no cast shadow, so stacked shadows
          // never pile into a dark smudge under the toast in front.
          "[&[data-behind]:not([data-expanded])]:[box-shadow:var(--sheen-glass-rim)]",
          // Expanded (hover / focus): the stack fans out away from its edge, one gap apart.
          "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          // Enter / exit: always a fade; the slide only when motion is welcome.
          "data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:opacity-0",
          "motion-ok:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
          "motion-ok:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
          "motion-ok:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "motion-ok:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
          // Reduced motion: opacity only, so stack changes jump instead of sliding. Height is never transitioned: a bottom-anchored toast that animates its height moves its top edge every frame (layout shift).
          "[transition:opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
          // In and reflow on `smooth` (a settle without overshoot); the hover fan-out is snappier.
          "motion-ok:[transition:transform_var(--sheen-duration-smooth)_var(--sheen-ease-smooth),opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
          "motion-ok:data-expanded:[transition:transform_var(--sheen-duration-snappy)_var(--sheen-ease-snappy),opacity_var(--sheen-duration-base)_var(--sheen-ease-out)]",
          // Exits: shorter, ease-in, never overshoot (incl. swipe-away). Reduced motion: fade only.
          "data-ending-style:[transition:opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
          "motion-ok:data-ending-style:[transition:transform_var(--sheen-duration-exit)_var(--sheen-ease-exit),opacity_var(--sheen-duration-exit)_var(--sheen-ease-exit)]",
          // A swipe leaves at the finger's release speed (--sheen-swipe-dur, set on pointer up, at most duration.base), with ease.exit.
          "motion-ok:data-ending-style:data-swipe-direction:[transition:transform_var(--sheen-swipe-dur,var(--sheen-duration-exit))_var(--sheen-ease-exit),opacity_var(--sheen-swipe-dur,var(--sheen-duration-exit))_var(--sheen-ease-exit)]",
        )}
      >
        <StateLightLayer className="[--sl-pool:0] [--sl-aura:0.55] [--sl-strength:0.85]" />
        <BaseToast.Content className="flex items-start gap-3 overflow-hidden rounded-[inherit] bg-[radial-gradient(circle_at_1.75rem_1.5rem,color-mix(in_oklab,var(--glow)_50%,transparent),transparent_10rem)] p-3.5 sm:p-4 transition-opacity duration-(--sheen-duration-instant) ease-sheen-exit data-behind:opacity-0 data-behind:duration-0 data-expanded:opacity-100 data-expanded:delay-75 data-expanded:duration-(--sheen-duration-base) data-expanded:ease-sheen-out">
          <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center", iconColor[type])}>
            {type === "loading" ? (
              <span className="flex">
                <SpinnerIcon className="size-5" strokeWidth={2.4} />
                <span className="sr-only">{loadingLabel}</span>
              </span>
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                {icons[type]}
              </svg>
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {/* A div, not Base UI's default h2: toasts sit before <main> and would start the page outline with h2s. */}
            <BaseToast.Title render={<div />} className="text-sm font-semibold text-sheen-fg" />
            <BaseToast.Description className="text-sm text-sheen-fg-muted" />
            {typeof toast.actionProps?.children === "string" && (
              <span className="sr-only">{actionHint(toast.actionProps.children)}</span>
            )}
            <ToastAction
              className={cn(
                "mt-2 inline-flex min-h-8 w-fit cursor-pointer items-center rounded-sheen-sm px-2.5 text-xs font-semibold text-sheen-accent",
                "border border-sheen-control-border transition-[color,background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus any-pointer-coarse:min-h-11",
              )}
            />
          </div>
          <ToastDismiss
            aria-label={dismissLabel}
            className={cn(
              "relative flex size-6 shrink-0 items-center justify-center rounded-sheen-full text-sheen-fg-muted",
              "transition-[color,background-color] duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
              "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
              // 44×44 on touch screens; negative margins keep the layout unchanged.
              "any-pointer-coarse:-my-2.5 any-pointer-coarse:-me-2.5 any-pointer-coarse:size-11",
            )}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </ToastDismiss>
        </BaseToast.Content>
      </BaseToast.Root>
    );
  });
}
