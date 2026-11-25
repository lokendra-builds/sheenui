"use client";

import { createContext, useContext, useState, type ComponentProps, type ReactNode } from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "../../lib/cn";

const sizes = {
  sm: "h-8 min-w-8 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5",
  md: "h-10 min-w-10 gap-2 px-3 text-sm [&_svg]:size-4",
  lg: "h-12 min-w-12 gap-2.5 px-4 text-base [&_svg]:size-5",
} as const;

/** Size of a `Toggle` (`sm`, `md` or `lg`). */
export type ToggleSize = keyof typeof sizes;

const variants = {
  /** Frosted glass button (stand-alone toggles). */
  glass: "glass-1 data-pressed:border-sheen-accent-border",
  /** No surface until pressed (toolbars, toggle groups). */
  ghost: "border border-transparent",
} as const;

/**
 * Look of a `Toggle`: `glass` (frosted button for stand-alone toggles) or `ghost` (no surface until
 * pressed, for toolbars and groups).
 */
export type ToggleVariant = keyof typeof variants;

type GroupContextValue = { size: ToggleSize };
const ToggleGroupContext = createContext<GroupContextValue | null>(null);

/** The state a `Toggle`'s function-children receive. */
export type ToggleState = {
  /** Whether the toggle is switched on. */
  pressed: boolean;
  /** Whether the toggle is disabled. */
  disabled: boolean;
};

/**
 * Props of `Toggle`: the Base UI `Toggle` props plus SheenUI's own options, each documented on its
 * field.
 */
export type ToggleProps = Omit<ComponentProps<typeof BaseToggle>, "className" | "children" | "render"> & {
  /** "glass" (default) on its own; "ghost" for toolbars. Inside a ToggleGroup it is always ghost. */
  variant?: ToggleVariant;
  /** "sm" (32px), "md" (40px, default) or "lg" (48px). Inherited from the ToggleGroup when inside one. */
  size?: ToggleSize;
  /** Square button for a lone icon (give it an aria-label). Default false. */
  iconOnly?: boolean;
  /** Adds extra classes to the button. */
  className?: string;
  /** Content, or a function of the state to swap icons: {({ pressed }) => (pressed ? <StarFilled /> : <Star />)}. */
  children?: ReactNode | ((state: ToggleState) => ReactNode);
};

/**
 * Toggle: a button that stays pressed (`aria-pressed`), e.g. Bold, Mute, Pin, Favourite. Use `Switch` for
 * a setting that applies at once and `Checkbox` for a form value; use `ToggleGroup` for a set of related toggles.
 *
 * - Uncontrolled with `defaultPressed`, or controlled with `pressed` + `onPressedChange`. Inside a
 *   `ToggleGroup` give each toggle a `value` instead.
 * - `variant` is "glass" (stand-alone) or "ghost" (toolbars); `size` is "sm", "md" or "lg"; `iconOnly` makes a
 *   square button for a lone icon, which then needs an `aria-label`.
 * - `children` can be a function of the state, to swap an icon (outline to filled):
 *   `{({ pressed }) => (pressed ? <StarFilled /> : <Star />)}`.
 *
 * Keyboard: Tab focuses it; Enter or Space toggles it.
 * Accessibility: a native `<button>` with `aria-pressed`; 44px minimum hit area on touch screens. High contrast:
 * a pressed toggle is filled with Highlight, so the state never relies on the tint alone.
 * Glass and motion: a "glass" toggle is one `glass-1` surface; "ghost" has none. When pressed, an accent tint
 * blooms out from the centre on its own layer and the label turns accent (full foreground in dark mode, for
 * contrast); the exit is shorter and never overshoots. Pressing squeezes the button a touch, and a lone icon
 * (`iconOnly`) pops as it switches on. Reduced motion: the tint simply fades, nothing scales.
 *
 * @example
 * ```tsx
 * import { Toggle } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <Toggle aria-label="Favourite" iconOnly>
 *   {({ pressed }) => (pressed ? "★" : "☆")}
 *       </Toggle>
 *       <Toggle defaultPressed>Mute</Toggle>
 *     </>
 *   );
 * }
 * ```
 *
 * @see /forms/toggle
 */
export function Toggle({
  variant = "glass",
  size,
  iconOnly = false,
  className,
  children,
  onPressedChange,
  ...props
}: ToggleProps) {
  const group = useContext(ToggleGroupContext);
  const resolvedSize = size ?? group?.size ?? "md";
  const resolvedVariant: ToggleVariant = group ? "ghost" : variant;
  // Counts "switched on" interactions: a lone icon pops each time (never on first render).
  const [pops, setPops] = useState(0);
  const content = (state: ToggleState) => (typeof children === "function" ? children(state) : children);

  return (
    <BaseToggle
      data-slot="toggle"
      {...props}
      onPressedChange={(pressed, details) => {
        if (pressed) setPops((n) => n + 1);
        onPressedChange?.(pressed, details);
      }}
      className={cn(
        "group/toggle relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sheen-md font-medium whitespace-nowrap select-none",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "text-sheen-fg-muted transition-[color,border-color,scale] duration-(--sheen-duration-fast) ease-sheen-out",
        // Pressed: accent text in light. In dark the accent is too light on its own tint over a
        // bright backdrop (icons need 3:1, text 4.5:1), so it is the full foreground there.
        "hover:text-sheen-fg data-pressed:[color:light-dark(var(--sheen-accent),var(--sheen-fg))]",
        variants[resolvedVariant],
        sizes[resolvedSize],
        iconOnly && "aspect-square px-0",
        // Hover wash on its own layer, so a glass toggle keeps its background.
        "before:pointer-events-none before:absolute before:inset-0 before:-z-20 before:rounded-[inherit] before:bg-sheen-hover before:opacity-0",
        "before:transition-opacity before:duration-(--sheen-duration-fast) hover:before:opacity-100 data-disabled:hover:before:opacity-0",
        "motion-ok:active:not-data-disabled:scale-95",
        "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        // At least 44×44 on touch screens.
        "any-pointer-coarse:min-h-11 any-pointer-coarse:min-w-11",
        // High contrast: pressed toggles fill with Highlight (`!` beats glass.css's unlayered fallback).
        // forced-color-adjust: none, so the browser draws no Canvas backplate behind the label.
        "forced-colors:border-[ButtonText] forced-colors:before:hidden",
        "forced-colors:data-pressed:border-[Highlight]! forced-colors:data-pressed:bg-[Highlight]! forced-colors:data-pressed:text-[HighlightText]!",
        "forced-colors:data-pressed:[forced-color-adjust:none]",
        className,
      )}
      render={(elementProps, state) => (
        <button {...elementProps}>
          {/* Pressed tint: blooms from the centre on the way in, quick fade on the way out. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-sheen-accent-soft forced-colors:hidden",
              "opacity-0 transition-[opacity,scale] duration-(--sheen-duration-exit) ease-sheen-exit motion-ok:scale-75",
              "group-data-pressed/toggle:opacity-100 group-data-pressed/toggle:duration-(--sheen-duration-snappy) group-data-pressed/toggle:ease-sheen-snappy",
              "motion-ok:group-data-pressed/toggle:scale-100",
            )}
          />
          {iconOnly ? (
            <span
              key={pops}
              className={cn(
                "inline-flex",
                pops > 0 && "motion-ok:animate-[sheen-pop_var(--sheen-duration-slow)_var(--sheen-ease-out)]",
              )}
            >
              {content({ pressed: state.pressed, disabled: state.disabled })}
            </span>
          ) : (
            content({ pressed: state.pressed, disabled: state.disabled })
          )}
        </button>
      )}
    />
  );
}

/**
 * Props of `ToggleGroup`: the Base UI `ToggleGroup` props plus SheenUI's own options, each documented
 * on its field.
 */
export type ToggleGroupProps = Omit<ComponentProps<typeof BaseToggleGroup>, "className"> & {
  /** Size of every toggle in the group. Default "md". */
  size?: ToggleSize;
  /** Adds extra classes to the glass track. */
  className?: string;
};

/**
 * A glass track of toggles, e.g. text formatting (Bold / Italic / Underline) or text alignment. Give each
 * `Toggle` a `value`; the group holds which are pressed.
 *
 * - `multiple` allows independent options (B / I / U); without it only one is pressed at a time and pressing
 *   the active one clears it.
 * - Controlled with `value` (an array of strings) + `onValueChange`, or uncontrolled with `defaultValue`.
 * - `size` sets every toggle's size; `orientation="vertical"` stacks them; `className` styles the track.
 *
 * Keyboard: Tab enters the group once; the arrow keys move between toggles; Enter or Space presses.
 * Accessibility: `role="group"`, so name it with `aria-label` (e.g. "Text formatting").
 * Glass and motion: one `glass-1` track (toggles inside are ghost, so the group is one backdrop surface).
 * Movement follows `Toggle`: none under reduced motion.
 *
 * @example
 * ```tsx
 * import { Toggle, ToggleGroup } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ToggleGroup aria-label="Text formatting" multiple>
 *       <Toggle value="bold" iconOnly aria-label="Bold">B</Toggle>
 *       <Toggle value="italic" iconOnly aria-label="Italic">I</Toggle>
 *     </ToggleGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/toggle
 */
export function ToggleGroup({ size = "md", className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupContext value={{ size }}>
      <BaseToggleGroup
        data-slot="toggle-group"
        {...props}
        className={cn(
          "glass-1 group/toggle-group inline-flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-sheen-md p-1",
          "data-[orientation=vertical]:flex-col",
          "data-disabled:opacity-55",
          className,
        )}
      />
    </ToggleGroupContext>
  );
}

/**
 * A thin divider between clusters of toggles in a toolbar-style `ToggleGroup`. It turns horizontal in a
 * vertical group.
 *
 * Keyboard: none, it is not focusable. Accessibility: decorative (`aria-hidden`). Glass and motion: flat line; forced colors draw it in `CanvasText`.
 *
 * @example
 * ```tsx
 * import { Toggle, ToggleGroup, ToggleGroupSeparator } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <ToggleGroup aria-label="Formatting" multiple>
 *       <Toggle value="bold" iconOnly aria-label="Bold">B</Toggle>
 *       <ToggleGroupSeparator />
 *       <Toggle value="link" iconOnly aria-label="Link">L</Toggle>
 *     </ToggleGroup>
 *   );
 * }
 * ```
 *
 * @see /forms/toggle
 */
export function ToggleGroupSeparator({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="toggle-group-separator"
      className={cn(
        "mx-1 h-5 w-px shrink-0 self-center bg-sheen-border",
        "group-data-[orientation=vertical]/toggle-group:h-px group-data-[orientation=vertical]/toggle-group:w-5",
        "forced-colors:bg-[CanvasText]",
        className,
      )}
      {...props}
    />
  );
}

/** Props of {@link ToggleGroupSeparator}. A thin divider between clusters of toggles in a toolbar-style `ToggleGroup`. */
export type ToggleGroupSeparatorProps = ComponentProps<typeof ToggleGroupSeparator>;
