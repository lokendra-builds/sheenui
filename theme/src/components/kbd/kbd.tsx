"use client";

import { useSyncExternalStore, type ComponentProps } from "react";

import { cn } from "../../lib/cn";
import { formatShortcut, isApplePlatform, type KbdLabels, type ShortcutPlatform } from "./shortcut";

const sizes = {
  sm: "h-5 min-w-5 px-1 text-2xs",
  md: "h-6 min-w-6 px-1.5 text-xs",
} as const;

/** Props of `Kbd`: the native `<kbd>` props plus its own options, each documented on its field. */
export type KbdProps = ComponentProps<"kbd"> & {
  /** Height of the key cap: "sm" (default, 20px) or "md" (24px). */
  size?: keyof typeof sizes;
};

/**
 * A single key cap. Put a word or symbol inside: `<Kbd>Esc</Kbd>`, `<Kbd>↵</Kbd>`. For a whole combination
 * that adapts to the visitor's platform, use `KbdShortcut`. Renders a native `<kbd>` and accepts its props
 * (`className`, ...); `size` is "sm" (default) or "md".
 *
 * Keyboard: none, it is a label and not a control. Accessibility: the `kbd` element tells assistive tech the
 * text is a key. Prefer words for keys with no obvious symbol readout; screen readers read "Esc" fine, but not "⌥".
 * Glass and motion: key caps are flat (no backdrop blur), so they are cheap and safe inside glass and inside
 * anything that fades. No motion. Forced colors draw a `CanvasText` border.
 *
 * @example
 * ```tsx
 * import { Kbd } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <p>Press <Kbd>Esc</Kbd> to close.</p>
 *   );
 * }
 * ```
 *
 * @see /overlays/kbd
 */
export function Kbd({ size = "sm", className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[calc(var(--sheen-radius-sm)*0.6)] border border-sheen-border bg-sheen-surface/70 font-sheen font-medium leading-none whitespace-nowrap text-sheen-fg-muted",
        // Key-cap depth: a slightly heavier bottom edge.
        "shadow-[inset_0_-1px_0_var(--sheen-border),0_1px_0_var(--sheen-border)]",
        "forced-colors:border-[CanvasText]",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

const noopSubscribe = () => () => undefined;

/**
 * Which platform's key names to show ("mac" or "other"). Reads the browser once; "other" during SSR, so
 * server and client agree on first render. Pass "mac" or "other" to force one (for docs that show both).
 *
 * @param platform "auto" (default) detects the visitor's platform.
 * @returns The platform to format shortcuts for. Pair it with `formatShortcut`.
 *
 * @example
 * ```tsx
 * import { useShortcutPlatform } from "@sheenui/theme";
 *
 * export function Example() {
 *   const platform = useShortcutPlatform();
 *
 *   const label = platform === "mac" ? "⌘K" : "Ctrl K";
 * }
 * ```
 *
 * @see /overlays/kbd
 */
export function useShortcutPlatform(platform: ShortcutPlatform | "auto" = "auto"): ShortcutPlatform {
  const detected = useSyncExternalStore(
    noopSubscribe,
    () => (isApplePlatform() ? "mac" : "other"),
    () => "other" as const,
  );
  return platform === "auto" ? detected : platform;
}

/**
 * Props of `KbdShortcut`: the native `<span>` props plus its own options, each documented on its
 * field.
 */
export type KbdShortcutProps = Omit<ComponentProps<"span">, "children"> & {
  /** The shortcut: "mod+k", "shift+mod+p", "?" or an array of keys. `mod` = ⌘ on Apple, Ctrl elsewhere. */
  keys: string | readonly string[];
  /** "chips": one key cap per key. "inline": plain text as in menus (⇧⌘P, Ctrl+Shift+P). */
  variant?: "chips" | "inline";
  /** Force a platform, e.g. to document both. Defaults to the visitor's. */
  platform?: ShortcutPlatform | "auto";
  /** Size of the key caps in the "chips" variant. Default "sm". */
  size?: KbdProps["size"];
  /** Override the visible or spoken key names (i18n). */
  labels?: Partial<KbdLabels>;
  /**
   * Read the shortcut to screen readers ("Command K"). Turn off when the parent already
   * exposes it, e.g. a menu item with aria-keyshortcuts.
   */
  announce?: boolean;
};

/**
 * A key combination, written the way the visitor's platform writes it: "mod+k" shows "⌘ K" on a Mac and
 * "Ctrl K" elsewhere. Use it next to menu items, buttons and in help text.
 *
 * - `keys` is a string ("mod+k", "shift+mod+p", "?") or an array of keys; `mod` means ⌘ on Apple and Ctrl elsewhere.
 * - `variant="chips"` (default) draws one `Kbd` per key; `"inline"` writes plain text as menus do (⇧⌘P, Ctrl+Shift+P) and is hidden on touch-only screens.
 * - `platform` forces a platform, `labels` overrides key names (i18n), `announce` controls the spoken text.
 * - It only displays the shortcut; binding the key is up to you.
 *
 * Keyboard: none, it is a label. Accessibility: the visible keys are `aria-hidden` and a visually hidden
 * span reads the key names ("Command K") instead of the symbols; set `announce={false}` when the parent already
 * exposes it (for example a menu item with `aria-keyshortcuts`).
 * Glass and motion: flat key caps, no backdrop blur, no motion.
 *
 * @example
 * ```tsx
 * import { KbdShortcut } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <>
 *       <KbdShortcut keys="mod+k" />
 *       <KbdShortcut keys="shift+mod+p" variant="inline" />
 *     </>
 *   );
 * }
 * ```
 *
 * @see /overlays/kbd
 */
export function KbdShortcut({
  keys,
  variant = "chips",
  platform = "auto",
  size = "sm",
  labels,
  announce = true,
  className,
  ...props
}: KbdShortcutProps) {
  const resolved = useShortcutPlatform(platform);
  const formatted = formatShortcut(keys, resolved, labels);
  // macOS writes combos without separators (⇧⌘P); elsewhere keys are joined with "+".
  const joiner = resolved === "mac" ? "" : "+";

  return (
    <span
      data-slot="kbd-shortcut"
      className={cn(
        "inline-flex shrink-0 items-center",
        // Inline hints use fg-muted, not fg-subtle: menus are glass, and over a colourful
        // backdrop fg-subtle drops below 4.5:1.
        variant === "chips"
          ? "gap-1"
          : // Inline hints belong to menus and buttons: a phone has no keyboard, so a touch-only screen drops them.
            "font-sheen text-xs tracking-wide whitespace-nowrap text-sheen-fg-muted tabular-nums [@media(any-pointer:coarse)_and_(not_(any-pointer:fine))]:hidden",
        className,
      )}
      {...props}
    >
      {variant === "chips" ? (
        <kbd aria-hidden className="contents">
          {formatted.keys.map((key, i) => (
            <Kbd key={`${key}-${i}`} size={size}>
              {key}
            </Kbd>
          ))}
        </kbd>
      ) : (
        <kbd aria-hidden className="font-[inherit]">
          {formatted.keys.join(joiner)}
        </kbd>
      )}
      {announce && <span className="sr-only">{formatted.spoken}</span>}
    </span>
  );
}
