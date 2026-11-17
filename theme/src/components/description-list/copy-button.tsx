"use client";

import { CheckIcon, CopyIcon as SharedCopyIcon } from "../status-icons/icons";
import { useCallback, useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

import { cn } from "../../lib/cn";

/**
 * Copy to clipboard: a hook, an icon button and an "ID chip".
 *
 *   <CopyButton value={order.id} label="Copy order ID" />
 *   <CopyChip value="ord_8Hk2Qx" label="Order ID" />
 *
 * Feedback: the icon turns into a check (a small pop, motion only) and a polite live region
 * says "Copied" once, so screen-reader users hear the result without losing their place.
 * Falls back to a hidden textarea + execCommand where the async Clipboard API is missing or
 * blocked (http pages, some embedded webviews).
 */

/* ---------- Hook ---------- */

/** Result of the latest copy attempt: `idle` (nothing yet), `copied` or `failed`. */
export type CopyStatus = "idle" | "copied" | "failed";

/** Last resort for insecure contexts: select a hidden textarea and copy it. */
function legacyCopy(text: string) {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
  document.body.appendChild(area);
  const active = document.activeElement as HTMLElement | null;
  area.select();
  let ok: boolean;
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the only way to copy in an insecure context
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus({ preventScroll: true });
  return ok;
}

/**
 * `const { status, copied, copy } = useCopyToClipboard()`. `copy(text)` resolves true on success (the
 * async Clipboard API, falling back to a hidden textarea in insecure contexts); `status` is "idle",
 * "copied" or "failed" and returns to "idle" after `resetAfter` ms.
 *
 * @param resetAfter How long "copied" or "failed" stays before going back to "idle", in ms. Default 1600.
 * @returns `status`, a `copied` shortcut for `status === "copied"`, and the `copy` function.
 *
 * Accessibility: pair it with a live region (see `CopyButton`) so the outcome is announced.
 *
 * @example
 * ```tsx
 * import { useCopyToClipboard } from "@sheenui/theme";
 *
 * export function Example() {
 *   const { copied, copy } = useCopyToClipboard();
 *
 *   return (
 *     <button type="button" onClick={() => copy("npx shadcn add button")}>
 *       {copied ? "Copied" : "Copy"}
 *     </button>
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function useCopyToClipboard(resetAfter = 1600) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      let ok: boolean;
      try {
        // `navigator.clipboard` is undefined in insecure contexts, whatever the DOM types say.
        const clipboard = navigator.clipboard as Clipboard | undefined;
        if (!clipboard?.writeText) throw new Error("Clipboard API unavailable");
        await clipboard.writeText(text);
        ok = true;
      } catch {
        ok = legacyCopy(text);
      }
      setStatus(ok ? "copied" : "failed");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus("idle"), resetAfter);
      return ok;
    },
    [resetAfter],
  );

  return { status, copied: status === "copied", copy };
}

/* ---------- Labels ---------- */

/**
 * Every user-facing string of `Copy` (accessible names, announcements, placeholders); pass a partial
 * `labels` prop to translate or reword them. Entries that need a count or a name are functions.
 */
export type CopyLabels = {
  /** Accessible name of the button while idle (when no `label` is passed). */
  copy: string;
  /** Announced, and the accessible name, right after a successful copy. */
  copied: string;
  /** Announced when copying is not possible. */
  failed: string;
};

/**
 * Default English strings of `CopyLabels`; spread it and override single keys to reword. Plain data
 * with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React Server
 * Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultCopyLabels: CopyLabels = {
  copy: "Copy",
  copied: "Copied",
  failed: "Couldn’t copy. Select the text and copy it manually.",
};

/* ---------- Icons ---------- */

/**
 * The 16px "copy" (two sheets) icon used by `CopyButton`. Accepts a `className` (default `size-4`).
 *
 * Keyboard: none. Accessibility: decorative, `aria-hidden`. Glass and motion: static.
 *
 * @example
 * ```tsx
 * import { CopyIcon } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CopyIcon className="size-3.5" />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function CopyIcon({ className }: { className?: string }) {
  return <SharedCopyIcon className={cn("size-4", className)} />;
}

/** Swaps the copy icon for a check that pops in (motion only), in the success colour. */
function CopyGlyph({ status, className }: { status: CopyStatus; className?: string }) {
  return status === "copied" ? (
    <CheckIcon
      strokeWidth={2.5}
      className={cn(
        "size-4 text-sheen-success-text motion-ok:animate-[sheen-pop_var(--sheen-duration-slow)_var(--sheen-ease-out)]",
        className,
      )}
    />
  ) : (
    <CopyIcon className={className} />
  );
}

/** Polite, visually hidden: says the outcome once. */
function CopyAnnouncer({ status, labels }: { status: CopyStatus; labels: CopyLabels }) {
  return (
    <span aria-live="polite" className="sr-only">
      {status === "copied" ? labels.copied : status === "failed" ? labels.failed : ""}
    </span>
  );
}

/* ---------- CopyButton ---------- */

/**
 * Props of `CopyButton`: the native `<button>` props plus its own options, each documented on its
 * field.
 */
export type CopyButtonProps = Omit<ComponentProps<"button">, "value" | "children"> & {
  /** The text that is copied. */
  value: string;
  /** Sets the accessible name, e.g. "Copy email address". Defaults to labels.copy. */
  label?: string;
  /** "sm" 28px (rows, chips) or "md" 36px. Both grow to a 44px hit area on touch screens. */
  size?: "sm" | "md";
  /** Override the "Copy", "Copied" and failure strings (i18n). */
  labels?: Partial<CopyLabels>;
  /** Called after a successful copy. */
  onCopied?: (value: string) => void;
};

/**
 * A ghost icon button that copies `value` to the clipboard and swaps its icon for a check mark. Use it
 * next to values people want to paste elsewhere (ids, emails, keys); use `CopyChip` for a pill that shows the value.
 *
 * - `value` is the text to copy; `label` is the accessible name ("Copy email address"); `size` is "sm" (28px) or "md" (36px).
 * - `onCopied` runs after a successful copy; `labels` translates "Copy", "Copied" and the failure text.
 * - Other `button` props pass through; calling `event.preventDefault()` in `onClick` cancels the copy.
 *
 * Keyboard: a normal button; Enter or Space copies. Accessibility: the name changes to "Copied" after a copy
 * and a polite live region announces the outcome (or the failure message); 44px hit area on touch screens.
 * Forced colors draw a `ButtonText` border.
 * Glass and motion: flat, no backdrop blur. The check pops in (`sheen-pop`) only when motion is welcome.
 *
 * @example
 * ```tsx
 * import { CopyButton } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CopyButton value="ada@example.com" label="Copy email address" onCopied={() => console.log("copied")} />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function CopyButton({
  value,
  label,
  size = "sm",
  labels: labelsProp,
  onCopied,
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const labels = { ...defaultCopyLabels, ...labelsProp };
  const { status, copy } = useCopyToClipboard();

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (await copy(value)) onCopied?.(value);
  }

  return (
    <>
      <button
        type="button"
        data-slot="copy-button"
        data-status={status}
        aria-label={status === "copied" ? labels.copied : (label ?? labels.copy)}
        onClick={handleClick}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-sheen-sm text-sheen-fg-muted",
          size === "sm" ? "size-7 [&_svg]:size-3.5" : "size-9 [&_svg]:size-4",
          "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover hover:text-sheen-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sheen-focus",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          // 44 × 44 hit area on touch screens, without changing the look.
          "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:size-11 any-pointer-coarse:after:-translate-1/2",
          "forced-colors:border forced-colors:border-[ButtonText]",
          className,
        )}
        {...props}
      >
        <CopyGlyph status={status} />
      </button>
      <CopyAnnouncer status={status} labels={labels} />
    </>
  );
}

/* ---------- CopyChip ---------- */

/** Props of `CopyChip`: the native `<button>` props plus its own options, each documented on its field. */
export type CopyChipProps = Omit<ComponentProps<"button">, "value" | "children"> & {
  /** The text shown (in mono) and copied, e.g. an id. */
  value: string;
  /** What the value is, for the accessible name: "Order ID" → "Copy Order ID ord_8Hk2Qx". */
  label?: string;
  /** Shown instead of `value` (the full value is still copied). */
  display?: string;
  /** Override the "Copy", "Copied" and failure strings (i18n). */
  labels?: Partial<CopyLabels>;
  /** Called after a successful copy. */
  onCopied?: (value: string) => void;
};

/**
 * A small mono pill that copies its value: ids, keys, hashes. The pill shows `display ?? value` and
 * copies the full `value`; its icon swaps for a check on success.
 *
 * - `label` says what the value is, for the accessible name ("Order ID" gives "Copy Order ID ord_8Hk2Qx").
 * - `onCopied` and `labels` work as on `CopyButton`; other `button` props pass through.
 *
 * Keyboard: a normal button; Enter or Space copies. Accessibility: `aria-label` and `title` carry the full
 * value, a polite live region announces the outcome, and the hit area is 44px tall on touch screens.
 * Glass and motion: flat pill, no backdrop blur; colour transitions only; the check pops in only when motion is welcome.
 *
 * @example
 * ```tsx
 * import { CopyChip } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <CopyChip value="ord_8Hk2Qx9Lw" display="ord_8Hk2…" label="Order ID" />
 *   );
 * }
 * ```
 *
 * @see /overlays/side-drawer
 */
export function CopyChip({
  value,
  label,
  display,
  labels: labelsProp,
  onCopied,
  className,
  onClick,
  ...props
}: CopyChipProps) {
  const labels = { ...defaultCopyLabels, ...labelsProp };
  const { status, copy } = useCopyToClipboard();
  const name = `${labels.copy} ${label ? `${label} ` : ""}${value}`;

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (await copy(value)) onCopied?.(value);
  }

  return (
    <>
      <button
        type="button"
        data-slot="copy-chip"
        data-status={status}
        aria-label={status === "copied" ? `${labels.copied}: ${value}` : name}
        title={status === "copied" ? labels.copied : name}
        onClick={handleClick}
        className={cn(
          "group/chip relative inline-flex h-6 max-w-full min-w-0 shrink items-center gap-1.5 rounded-sheen-full border border-sheen-border bg-sheen-hover px-2",
          "font-sheen-mono text-xs text-sheen-fg-muted",
          "transition-[color,background-color,border-color] duration-(--sheen-duration-fast) hover:border-sheen-accent-border hover:text-sheen-fg",
          "data-[status=copied]:border-sheen-success-text/30 data-[status=copied]:text-sheen-success-text",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          "touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "any-pointer-coarse:after:absolute any-pointer-coarse:after:inset-x-0 any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:-translate-y-1/2",
          "forced-colors:border-[ButtonText]",
          className,
        )}
        {...props}
      >
        <span className="min-w-0 truncate">{display ?? value}</span>
        <CopyGlyph status={status} className="size-3 shrink-0 opacity-80 group-hover/chip:opacity-100" />
      </button>
      <CopyAnnouncer status={status} labels={labels} />
    </>
  );
}

/** Props of {@link CopyIcon}. The 16px two-sheet copy icon used by `CopyButton`. */
export type CopyIconProps = ComponentProps<typeof CopyIcon>;
