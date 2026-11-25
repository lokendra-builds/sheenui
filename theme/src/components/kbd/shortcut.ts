/**
 * Keyboard shortcut helpers shared by Kbd, the menus and the command palette.
 *
 * Shortcuts are written once, platform-neutral: "mod+k", "shift+mod+p", "alt+arrowup", "?".
 * `mod` is ⌘ Command on Apple platforms and Ctrl elsewhere. Keys are case-insensitive and
 * joined with "+"; use "plus" for the plus key itself (or pass an array: ["mod", "+"]).
 */

export type ShortcutPlatform = "mac" | "other";

/** Spoken names (screen readers) and visible text for keys. Override any of them for i18n. */
export type KbdLabels = {
  /** Visible text for each key on Apple platforms, e.g. { mod: "⌘" }. */
  mac: Record<string, string>;
  /** Visible text for each key elsewhere, e.g. { mod: "Ctrl" }. */
  other: Record<string, string>;
  /** Spoken name for each key on Apple platforms, e.g. { mod: "Command" }. */
  macSpoken: Record<string, string>;
  /** Spoken name for each key elsewhere, e.g. { mod: "Control" }. */
  otherSpoken: Record<string, string>;
};

/** Canonical key names: what each alias in a shortcut string means. */
const ALIASES: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  super: "meta",
  win: "meta",
  control: "ctrl",
  option: "alt",
  opt: "alt",
  return: "enter",
  esc: "escape",
  del: "delete",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  pgup: "pageup",
  pgdn: "pagedown",
  plus: "+",
  spacebar: "space",
  " ": "space",
};

const MODIFIERS = ["mod", "ctrl", "alt", "shift", "meta"] as const;
type Modifier = (typeof MODIFIERS)[number];

/* Apple's menu order is ⌃ ⌥ ⇧ ⌘; Windows writes Ctrl+Alt+Shift. `mod` takes the place of
   Command on a Mac and Control elsewhere. */
const ORDER: Record<ShortcutPlatform, readonly string[]> = {
  mac: ["ctrl", "alt", "shift", "mod", "meta"],
  other: ["mod", "ctrl", "meta", "alt", "shift"],
};

/**
 * Default key-cap glyphs and spoken names per platform (`mac` and `other`, plus their `*Spoken`
 * variants). Plain data in a module without `"use client"`: safe on the server.
 */
export const defaultKbdLabels: KbdLabels = {
  mac: {
    mod: "⌘",
    meta: "⌘",
    ctrl: "⌃",
    alt: "⌥",
    shift: "⇧",
    enter: "↵",
    escape: "Esc",
    backspace: "⌫",
    delete: "⌦",
    tab: "⇥",
    space: "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    pageup: "PgUp",
    pagedown: "PgDn",
    home: "Home",
    end: "End",
    capslock: "⇪",
  },
  other: {
    mod: "Ctrl",
    meta: "Win",
    ctrl: "Ctrl",
    alt: "Alt",
    shift: "Shift",
    enter: "Enter",
    escape: "Esc",
    backspace: "Backspace",
    delete: "Del",
    tab: "Tab",
    space: "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    pageup: "PgUp",
    pagedown: "PgDn",
    home: "Home",
    end: "End",
    capslock: "Caps Lock",
  },
  macSpoken: {
    mod: "Command",
    meta: "Command",
    ctrl: "Control",
    alt: "Option",
    shift: "Shift",
    enter: "Return",
    escape: "Escape",
    backspace: "Delete",
    delete: "Forward Delete",
    tab: "Tab",
    space: "Space",
    arrowup: "Up Arrow",
    arrowdown: "Down Arrow",
    arrowleft: "Left Arrow",
    arrowright: "Right Arrow",
    pageup: "Page Up",
    pagedown: "Page Down",
    "+": "Plus",
    "-": "Minus",
    ",": "Comma",
    ".": "Period",
    "/": "Slash",
    "?": "Question mark",
  },
  otherSpoken: {
    mod: "Control",
    meta: "Windows",
    ctrl: "Control",
    alt: "Alt",
    shift: "Shift",
    enter: "Enter",
    escape: "Escape",
    backspace: "Backspace",
    delete: "Delete",
    tab: "Tab",
    space: "Space",
    arrowup: "Up Arrow",
    arrowdown: "Down Arrow",
    arrowleft: "Left Arrow",
    arrowright: "Right Arrow",
    pageup: "Page Up",
    pagedown: "Page Down",
    "+": "Plus",
    "-": "Minus",
    ",": "Comma",
    ".": "Period",
    "/": "Slash",
    "?": "Question mark",
  },
};

/** Key names used by aria-keyshortcuts (they follow KeyboardEvent.key). */
const ARIA_NAMES: Record<string, string> = {
  ctrl: "Control",
  alt: "Alt",
  shift: "Shift",
  meta: "Meta",
  enter: "Enter",
  escape: "Escape",
  backspace: "Backspace",
  delete: "Delete",
  tab: "Tab",
  space: "Space",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  pageup: "PageUp",
  pagedown: "PageDown",
  home: "Home",
  end: "End",
  "+": "Plus",
};

/** Split "shift+mod+k" (or an array) into canonical, lower-case key names. */
export function parseShortcut(keys: string | readonly string[]): string[] {
  const parts =
    typeof keys === "string"
      ? // A trailing "++" means the plus key: "mod++" → ["mod", "+"].
        keys.endsWith("++")
        ? [...keys.slice(0, -2).split("+"), "+"]
        : keys === "+"
          ? ["+"]
          : keys.split("+")
      : [...keys];
  return parts
    .map((part) => (part.length === 1 ? part : part.trim()).toLowerCase())
    .filter((part) => part.length > 0)
    .map((part) => ALIASES[part] ?? part);
}

function isModifier(key: string): key is Modifier {
  return (MODIFIERS as readonly string[]).includes(key);
}

/** Modifiers first (in the platform's usual order), then the other keys as written. */
export function orderShortcut(keys: string[], platform: ShortcutPlatform): string[] {
  const order = ORDER[platform];
  const mods = keys.filter(isModifier).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return [...new Set(mods), ...keys.filter((k) => !isModifier(k))];
}

function titleCase(key: string) {
  if (key.length === 1) return key.toUpperCase();
  // f1…f24 stay upper-case; other names get a capital.
  if (/^f\d{1,2}$/.test(key)) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * A shortcut ready to render: one visible label per key, the words for screen readers and the
 * `aria-keyshortcuts` value.
 */
export type FormattedShortcut = {
  /** One visible label per key, e.g. ["⇧", "⌘", "P"] or ["Ctrl", "Shift", "P"]. */
  keys: string[];
  /** Words for screen readers, e.g. "Shift Command P". */
  spoken: string;
  /** Value for aria-keyshortcuts, e.g. "Shift+Meta+P". */
  aria: string;
};

/**
 * Formats a shortcut (`"mod+shift+p"` or an array of keys) for a platform: visible key labels, spoken
 * words and the `aria-keyshortcuts` value. The platform is passed in, nothing is detected, so it is
 * safe to call on the server.
 */
export function formatShortcut(
  keys: string | readonly string[],
  platform: ShortcutPlatform,
  labels: Partial<KbdLabels> = {},
): FormattedShortcut {
  const ordered = orderShortcut(parseShortcut(keys), platform);
  const visible = { ...defaultKbdLabels[platform], ...labels[platform] };
  const spokenNames = {
    ...defaultKbdLabels[platform === "mac" ? "macSpoken" : "otherSpoken"],
    ...labels[platform === "mac" ? "macSpoken" : "otherSpoken"],
  };
  return {
    keys: ordered.map((k) => visible[k] ?? titleCase(k)),
    spoken: ordered.map((k) => spokenNames[k] ?? titleCase(k)).join(" "),
    aria: toAriaKeyShortcuts(ordered, platform),
  };
}

/** aria-keyshortcuts value for a shortcut, resolving `mod` for the platform. */
export function toAriaKeyShortcuts(keys: string | readonly string[], platform: ShortcutPlatform): string {
  return parseShortcut(keys)
    .map((k) => (k === "mod" ? (platform === "mac" ? "Meta" : "Control") : (ARIA_NAMES[k] ?? titleCase(k))))
    .join("+");
}

/** True on macOS, iOS and iPadOS, where `mod` means ⌘ Command. False during SSR. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = [nav.userAgentData?.platform, nav.platform].find(Boolean) ?? nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

const CODE_KEYS: Record<string, string> = { space: " " };

/**
 * Does a keydown event match a shortcut? Modifiers must match exactly (an extra Shift is a
 * different shortcut), except for keys that need Shift to type (e.g. "?"). Letters follow
 * the layout (Dvorak, AZERTY); the physical key is used only when the key typed something
 * other than a Latin letter or digit (Mac Option symbols, Cyrillic, Greek…).
 */
export function matchesShortcut(
  event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  keys: string | readonly string[],
  platform: ShortcutPlatform = isApplePlatform() ? "mac" : "other",
): boolean {
  const parts = parseShortcut(keys);
  const main = parts.filter((k) => !isModifier(k));
  const key = main[0];
  if (main.length !== 1 || key === undefined) return false;

  const wants = {
    meta: parts.includes("meta") || (platform === "mac" && parts.includes("mod")),
    ctrl: parts.includes("ctrl") || (platform === "other" && parts.includes("mod")),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
  };
  // Characters such as "?" or "+" are typed with Shift on many layouts; don't demand it be absent.
  const shiftFree = key.length === 1 && !/[a-z0-9]/.test(key);
  if (event.metaKey !== wants.meta || event.ctrlKey !== wants.ctrl || event.altKey !== wants.alt) return false;
  if (!shiftFree && event.shiftKey !== wants.shift) return false;

  const pressed = event.key.toLowerCase();
  if (pressed === key || pressed === (CODE_KEYS[key] ?? key)) return true;
  // The key typed a different Latin letter or digit: that is another shortcut, even if the
  // physical key matches (⌘T on Dvorak sits where QWERTY has K; AZERTY swaps A and Q).
  if (/^[a-z0-9]$/.test(pressed)) return false;
  // Option on a Mac turns letters into symbols (⌥K types "˚"), and non-Latin layouts type
  // other scripts (Ctrl+л on a Russian layout): fall back to the physical key.
  if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return event.code === `Digit${key}`;
  return false;
}
