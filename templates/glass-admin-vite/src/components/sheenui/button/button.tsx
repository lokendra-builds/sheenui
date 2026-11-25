"use client";

import { isValidElement, useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "../lib/cn";
import { duration, ease } from "../motion/tokens";
import { useMergedRef } from "../lib/form";
import { useMagnetic } from "../hooks/use-magnetic";
import { SpinnerIcon } from "../spinner/spinner";
import { REDUCED_MOTION_QUERY } from "../hooks/use-media-query";
import { StateLightLayer, type SheenLightState } from "../lib/state-light";

/**
 * Button: lifts on hover, presses down on tap, and filled variants catch a sweep of light.
 *
 * Composition: pass `render` to give another element the button's look and behaviour,
 * e.g. a router link (link semantics are kept, `type`/`disabled` are not added):
 *
 *   <Button render={<Link to="/pricing" />}>See pricing</Button>
 *
 * It can also be the `render` target of Base UI triggers: <DialogTrigger render={<Button />}>.
 *
 * Content: children are laid out in the button's own centred flex row (gap set by `size`),
 * so an icon-only child is optically centred and an absolutely positioned child
 * (e.g. <BorderBeam />) is positioned against the button. Wrap mixed inline text such as
 * "Delete <b>3</b> files" in a <span> to keep it one flowing label.
 *
 * Motion is CSS (translate/scale) plus, on primary buttons, a magnetic pull (`useMagnetic`: a spring
 * transform within 8 px of the box, mouse only). Icons nudge on hover (trailing arrows slide, see
 * motion.css "Micro-interaction layer"). All of it is removed with reduced motion: the OS
 * setting or the in-app [data-motion="reduced"] toggle (Tailwind `motion-ok:` variant).
 */

const variants = {
  /** Filled accent gradient with a light sweep on hover. */
  primary: {
    base: "sheen-fill sheen-glow text-sheen-accent-fg [background-image:var(--sheen-accent-fill)] shadow-(--sheen-accent-fill-shadow)",
    hover: "hover:brightness-[1.18]",
    // Pressed: clearly darker than hover (which brightens) and pushed in, with the glow dimmed (motion.css).
    active: "active:brightness-[0.86] active:shadow-[inset_0_2px_7px_oklch(0%_0_0/0.34)]",
  },
  /** Frosted glass button. */
  glass: {
    base: "glass-1 text-sheen-fg",
    hover: "hover:bg-[color-mix(in_oklab,var(--sheen-glass-1-bg),white_34%)]",
    active: "active:bg-[color-mix(in_oklab,var(--sheen-glass-1-bg),black_18%)]",
  },
  /** Transparent with a visible 3:1 edge: the secondary action next to a primary one. */
  outline: {
    base: "border border-sheen-control-border bg-transparent text-sheen-fg",
    hover: "hover:bg-sheen-hover",
    active:
      "active:bg-[color-mix(in_oklab,var(--sheen-hover),var(--sheen-fg)_16%)] active:shadow-[inset_0_1px_5px_oklch(0%_0_0/0.2)]",
  },
  /** Looks like an inline link (accent text, underline on hover) but is still a button. */
  link: {
    // Forced colors draws the ButtonText border and the focus outline around the box: give it padding so they enclose the whole hit area, not the glyphs.
    base: "sheen-underline !h-auto rounded-sheen-sm !px-0.5 text-sheen-accent underline-offset-4 forced-colors:!px-2 forced-colors:!py-1",
    hover: "",
    active: "active:opacity-75",
  },
  /** Text-only button for low-emphasis actions. */
  ghost: {
    base: "text-sheen-fg",
    hover: "hover:bg-sheen-hover",
    active:
      "active:bg-[color-mix(in_oklab,var(--sheen-hover),var(--sheen-fg)_16%)] active:shadow-[inset_0_1px_5px_oklch(0%_0_0/0.2)]",
  },
  /**
   * Destructive action. The fill is a gradient (background-image) over a solid colour of the same
   * red, so it never shows through transparent. To recolour it, override the image too:
   * className="bg-orange-700 [background-image:none]", or set --sheen-danger-fill.
   */
  danger: {
    base: "sheen-glow [--sheen-glow-color:var(--sheen-danger-glow)] bg-(color:--sheen-danger-solid) text-sheen-accent-fg [background-image:var(--sheen-danger-fill)] shadow-(--sheen-danger-fill-shadow)",
    hover: "hover:brightness-[1.18]",
    active: "active:brightness-[0.86] active:shadow-[inset_0_2px_7px_oklch(0%_0_0/0.34)]",
  },
} as const;

const sizes = {
  sm: "h-(--sheen-control-h-sm) px-3 text-xs gap-1.5 rounded-sheen-sm",
  md: "h-(--sheen-control-h-md) px-4 text-sm gap-2 rounded-sheen-md",
  lg: "h-(--sheen-control-h-lg) px-6 text-base gap-2.5 rounded-sheen-md",
  icon: "size-(--sheen-control-h-md) rounded-sheen-md motion-ok:active:scale-[0.92]",
} as const;

/** Props of {@link Button}. The attributes of a `button` (plus Base UI's `render`) and the ones below. */
export type ButtonProps = useRender.ComponentProps<"button"> & {
  /**
   * Look: "primary" (accent fill), "glass" (frosted), "outline" (edge only), "ghost" (text only), "link" (inline link look) or "danger" (destructive).
   * @default "primary"
   */
  variant?: keyof typeof variants;
  /**
   * Height and padding, the same scale as every form field: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), or "icon" for a square as tall as "md".
   * @default "md"
   */
  size?: keyof typeof sizes;
  /**
   * Shows a spinner, ignores clicks and sets aria-busy. Focus stays on the button.
   * @default false
   */
  loading?: boolean;
  /** Renders an icon before the children. */
  leading?: ReactNode;
  /** Renders an icon after the children. */
  trailing?: ReactNode;
  /**
   * Stretch to the full width of the container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Lights the button by state: `loading` glows in the accent colour (`data-state="working"`), and a `data-state` of
   * `"success"`, `"warning"` or `"error"` flashes its own glow once (an aura, a light pool and a lit edge, drawn on the
   * button's own layer). The state is never conveyed by light alone: keep the label or icon that says it. Off with
   * reduced transparency and forced colours; instant with reduced motion.
   * @default false
   */
  stateLight?: boolean;
  /**
   * Whether the rendered element is a native `<button>`. Defaults to true, or to false when
   * `render` is something else (e.g. a link): then `type`/`disabled` are not added and the
   * disabled state is announced with `aria-disabled` instead.
   */
  nativeButton?: boolean;
};

/**
 * The button: lifts on hover, presses down on tap, and filled variants catch a sweep of light.
 * Use it for every action; pass `render` to give another element (a router link, a Base UI
 * trigger) the button's look and behaviour.
 *
 * Props: see {@link ButtonProps} (`variant`, `size`, `loading`, `leading`, `trailing`,
 * `fullWidth`, `stateLight`, `nativeButton`, `render`, `disabled`, `className`, plus all `button` attributes).
 *
 * Keyboard: Tab focuses it (a visible focus ring); Enter or Space activates a button. With `render` set to a link, Enter activates it like any link.
 * Accessibility: Native `<button type="button">` by default. While `loading` it stays focusable (`aria-disabled`, `aria-busy`) and ignores clicks, so focus is never lost. Touch targets are at least 44x44 px. Forced colors keep a `ButtonText` border.
 * Glass: The "glass" variant is one `glass-1` surface; the filled variants are flat gradients with no blur.
 * Motion: Hover lift, press scale, the light sweep and the icon nudge are CSS; primary buttons also lean toward the pointer (magnetic spring, 8 px max). All removed under reduced motion (OS or in-app toggle).
 *
 * @example
 * ```tsx
 * import { Button } from "@sheenui/theme";
 *
 * export function Save({ saving }: { saving: boolean }) {
 *   return (
 *     <Button variant="primary" size="md" loading={saving} onClick={() => console.log("saved")}>
 *       Save changes
 *     </Button>
 *   );
 * }
 * ```
 *
 * @see /components/button
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leading,
  trailing,
  fullWidth = false,
  stateLight = false,
  nativeButton,
  render,
  disabled = false,
  className,
  children,
  type,
  tabIndex,
  onClick,
  ref: userRef,
  ...props
}: ButtonProps) {
  const native = nativeButton ?? (render === undefined || (isValidElement(render) && render.type === "button"));
  const blocked = disabled || loading;
  const shine = (variant === "primary" || variant === "danger") && !blocked;
  const ownRef = useRef<HTMLElement>(null);
  const ref = useMergedRef<HTMLElement>(ownRef, userRef);
  useMagnetic(ownRef, { enabled: variant === "primary" && !blocked });

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // A loading button keeps focus (aria-disabled, not disabled), so ignore activation here.
    // preventDefault also cancels a form submit and link navigation.
    if (blocked) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  // Glass buttons: a ripple of light grows from the press point. One transient layer made on
  // pointer down (transform + opacity, WAAPI), removed when done; nothing in React state.
  const userPointerDown = props.onPointerDown;
  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    userPointerDown?.(event);
    if (variant !== "glass" || blocked || event.button !== 0) return;
    if (document.documentElement.dataset.motion === "reduced" || window.matchMedia(REDUCED_MOTION_QUERY).matches)
      return;
    const host = event.currentTarget;
    const box = host.getBoundingClientRect();
    const size = Math.hypot(box.width, box.height) * 2;
    const layer = document.createElement("span");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      "position:absolute;inset:0;z-index:-1;overflow:clip;border-radius:inherit;pointer-events:none";
    const dot = document.createElement("span");
    dot.style.cssText = `position:absolute;left:${event.clientX - box.left - size / 2}px;top:${event.clientY - box.top - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;opacity:0;background:radial-gradient(circle closest-side,var(--sheen-glass-sheen),transparent)`;
    layer.append(dot);
    host.append(layer);
    const run = dot.animate(
      [
        { transform: "scale(0.1)", opacity: 0.9 },
        { transform: "scale(1)", opacity: 0 },
      ],
      { duration: duration.slower * 1000, easing: `cubic-bezier(${ease.out.join(",")})`, fill: "both" },
    );
    run.onfinish = run.oncancel = () => layer.remove();
  }

  // Keep an aria-disabled passed in by a Base UI trigger that renders this button.
  const passedAriaDisabled = props["aria-disabled"];
  const elementProps = native
    ? // Native button: truly disabled when disabled; only aria-disabled while loading so focus isn't lost.
      {
        type: type ?? "button",
        disabled: disabled && !loading,
        tabIndex,
        "aria-disabled": loading || passedAriaDisabled,
      }
    : // Link or other element: no button-only attributes.
      { type, tabIndex: disabled ? -1 : tabIndex, "aria-disabled": blocked || passedAriaDisabled };

  return useRender({
    defaultTagName: "button",
    render,
    props: {
      ...props,
      ref,
      ...elementProps,
      "aria-busy": loading || undefined,
      "data-slot": "button",
      "data-disabled": disabled ? "" : undefined,
      "data-loading": loading ? "" : undefined,
      // The state light reads data-state: a state the caller passed wins, else loading is "working".
      ...(stateLight && {
        "data-state": (props as { "data-state"?: SheenLightState })["data-state"] ?? (loading ? "working" : "idle"),
      }),
      onClick: handleClick,
      onPointerDown: handlePointerDown,
      className: cn(
        // Children are flex items of the button itself, so icons centre on the button (not on a
        // text baseline) and absolutely positioned children (a BorderBeam, a badge) frame the button.
        // `isolate` keeps the shine's negative z-index inside the button: above its fill, below the label.
        "group/button relative isolate inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap",
        "[&_svg]:shrink-0",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        // Colour feedback always; movement only when motion is welcome (translate/scale are never set otherwise).
        // Per-property timing, in the property order above: colour (and the filled variants' brightness) fades in 150 ms
        // with ease.out; the lift and the press scale are transform-only and finish within 220 ms (duration.base).
        "transition-[filter,background-color,translate,scale] [transition-duration:var(--sheen-duration-fast),var(--sheen-duration-fast),var(--sheen-duration-base),var(--sheen-duration-base)]",
        "[transition-timing-function:var(--sheen-ease-out)]",
        "focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-sheen-focus",
        "data-disabled:cursor-not-allowed data-disabled:opacity-55 data-loading:cursor-progress",
        // High contrast drops background images: keep the button's edge visible.
        "forced-colors:border forced-colors:border-[ButtonText]",
        variants[variant].base,
        !blocked && [
          variants[variant].hover,
          variants[variant].active,
          "motion-ok:hover:-translate-y-1 motion-ok:data-popup-open:hover:translate-y-0 motion-ok:active:translate-y-0 motion-ok:active:scale-[0.95] motion-ok:active:duration-(--sheen-duration-instant)",
        ],
        sizes[size],
        fullWidth && "w-full",
        className,
      ),
      children: (
        <>
          {stateLight && <StateLightLayer className="[--sl-pool:0.8]" />}
          {shine && (
            // Clipped on its own layer, so the button keeps overflow visible for the hit area.
            // -z-10 inside the isolated button: painted over the fill, under the label and icons. The layer mirrors in right-to-left text, so the sweep starts at the inline start.
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] rtl:-scale-x-100"
            >
              <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-sheen-accent-fg/35 to-transparent opacity-0 motion-ok:group-hover/button:opacity-100 motion-ok:group-hover/button:animate-[sheen-shine_var(--sheen-duration-gentle)_var(--sheen-ease-out)_both]" />
            </span>
          )}
          {/* Invisible hit area: at least 44×44 px on touch screens, without changing the look. A real
              element, not ::after: glass surfaces own their ::after (the rim) and the filled variants
              their ::before (the glow), and a pseudo-element sharing the rim's `inset: 0` was anchored
              to the right edge in right-to-left text, overhanging the page by half a button. */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 hidden size-full min-h-11 min-w-11 -translate-1/2 any-pointer-coarse:block"
          />
          {loading ? <SpinnerIcon className="size-4" /> : leading}
          {children}
          {!loading && trailing && (
            // Its own box, so the hover nudge (motion.css) moves the icon and never the label.
            <span data-slot="button-trailing" className="inline-flex shrink-0 items-center">
              {trailing}
            </span>
          )}
        </>
      ),
    },
  });
}
