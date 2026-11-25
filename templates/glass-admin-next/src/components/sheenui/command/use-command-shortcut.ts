"use client";

import { useEffect, useEffectEvent } from "react";

import { isImeComposing } from "../lib/ime";
import { isApplePlatform, matchesShortcut } from "../kbd/shortcut";

/** Options of {@link useCommandShortcut}. */
export type UseCommandShortcutOptions = {
  /**
   * The shortcut, e.g. "mod+k" (⌘K on Apple, Ctrl+K elsewhere), "/" or "shift+mod+p".
   * @default "mod+k"
   */
  keys?: string | readonly string[];
  /**
   * Listen only while true.
   * @default true
   */
  enabled?: boolean;
  /**
   * Also fire while typing in a text field. On by default for modifier shortcuts like ⌘K;
   * turn it off for bare keys such as "/" so people can still type them.
   * @default true
   */
  allowInInputs?: boolean;
  /**
   * Stop the browser's own action (Ctrl+K focuses the address bar in some browsers).
   * @default true
   */
  preventDefault?: boolean;
};

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * Global keyboard shortcut, ⌘K / Ctrl+K by default. Ignores key repeat and IME composition.
 *
 *   useCommandShortcut(() => setOpen((o) => !o));
 *   useCommandShortcut(focusSearch, { keys: "/", allowInInputs: false });
 *
 * `onTrigger(event)` runs when the shortcut is pressed. Options (`UseCommandShortcutOptions`):
 * `keys` (default "mod+k"; "mod" is Cmd on Apple platforms and Ctrl elsewhere, or an array of
 * key names), `enabled` (default true), `allowInInputs` (default true: fires while typing in a
 * field), `preventDefault` (default true: stops the browser's own handling). The latest
 * `onTrigger` is always used, so an inline function is fine.
 *
 * Keyboard: Listens on `window` for the shortcut; ignores key repeat and IME composition, and skips events another handler already cancelled.
 * Accessibility: No UI of its own. Pair it with a visible trigger (a button showing the shortcut) so the feature is reachable without the keyboard.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { useCommandShortcut } from "@sheenui/theme";
 *
 * export function ShortcutDemo() {
 *   const [open, setOpen] = useState(false);
 *   useCommandShortcut(() => setOpen((o) => !o));
 *   return <p>{open ? "Open" : "Press Cmd/Ctrl+K"}</p>;
 * }
 * ```
 *
 * @see /overlays/command-palette
 */
export function useCommandShortcut(onTrigger: (event: KeyboardEvent) => void, options: UseCommandShortcutOptions = {}) {
  const { keys = "mod+k", enabled = true, allowInInputs = true, preventDefault = true } = options;
  const shortcut = typeof keys === "string" ? keys : keys.join("+");
  const fire = useEffectEvent(onTrigger);

  useEffect(() => {
    if (!enabled) return;
    const platform = isApplePlatform() ? "mac" : "other";
    function onKeyDown(event: KeyboardEvent) {
      // keyCode 229: Safari sends the key that confirms an IME composition after compositionend.
      if (isImeComposing(event) || event.repeat || event.defaultPrevented) return;
      if (!matchesShortcut(event, shortcut, platform)) return;
      if (!allowInInputs && isEditable(event.target)) return;
      if (preventDefault) event.preventDefault();
      fire(event);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, enabled, allowInInputs, preventDefault]);
}
