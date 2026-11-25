"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type InputEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Field } from "@base-ui/react/field";

import { cn } from "../../lib/cn";
import type { FieldSize } from "../../lib/field-size";
import { useControllable } from "../../hooks/use-controllable";
import { useMergedRef } from "../../lib/form";

/**
 * Every user-facing string of `Textarea` (accessible names, announcements, placeholders); pass a
 * partial `labels` prop to translate or reword them. Entries that need a count or a name are
 * functions.
 */
export type TextareaLabels = {
  /** Read with the field (not live): "12 of 280 characters". */
  count: (count: number, max: number | undefined) => string;
  /** Announced politely as the limit approaches. */
  remaining: (left: number) => string;
  /** Announced when the text reaches the limit. */
  reached: string;
  /** Announced when the text goes past the limit (`limit="warn"`). */
  over: (over: number) => string;
};

const characters = (n: number) => `${n} ${n === 1 ? "character" : "characters"}`;

/**
 * Default English strings of `TextareaLabels`; spread it and override single keys to reword. Plain
 * data with no DOM access: safe to read while prerendering. The module is `"use client"`, so a React
 * Server Component receives a client reference instead of the object: read it from a client component.
 */
export const defaultTextareaLabels: TextareaLabels = {
  count: (count, max) => (max === undefined ? characters(count) : `${count} of ${characters(max)} used`),
  remaining: (left) => `${characters(left)} left`,
  reached: "Character limit reached",
  over: (over) => `${characters(over)} over the limit`,
};

/**
 * Props of `Textarea`: the native `<textarea>` props plus its own options, each documented on its
 * field.
 */
export type TextareaProps = Omit<ComponentProps<"textarea">, "rows" | "size"> & {
  /** Padding that matches `Input` at the same size: "sm" (one line is 32px tall), "md" (40px) or "lg" (48px); sm and md are 44px on touch screens. Default "md". */
  size?: FieldSize;
  /** Text above the field, linked to the textarea as its accessible name. */
  label?: ReactNode;
  /** Muted helper text under the field. */
  description?: ReactNode;
  /** Error message; marks the field invalid and is announced politely to screen readers when it appears. */
  error?: ReactNode;
  /** Grow with the content between minRows and maxRows. Default true. */
  autoResize?: boolean;
  /** Height in lines when empty (and the fixed height when autoResize is off). Default 3. */
  minRows?: number;
  /** Sets how tall it grows before scrolling, in lines. Default 10. */
  maxRows?: number;
  /** Character limit; shows the counter. */
  maxLength?: number;
  /** "block" (default) stops typing at maxLength; "warn" allows more but marks the field invalid. */
  limit?: "block" | "warn";
  /** Show the counter. Defaults to on when maxLength is set. Without maxLength it counts up. */
  showCount?: boolean;
  /** Content for the bottom row inside the field, left of the counter (e.g. buttons). */
  footer?: ReactNode;
  /** Screen-reader strings for the counter (i18n). */
  labels?: Partial<TextareaLabels>;
  /** Class for the outer wrapper (label + field + messages). */
  className?: string;
  /** Adds extra classes to the native <textarea>. */
  textareaClassName?: string;
};

/* ---------- Auto-resize: an off-screen twin measures the content height ---------- */

const MIRRORED = [
  "box-sizing",
  "width",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant-numeric",
  "font-feature-settings",
  "letter-spacing",
  "line-height",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "text-indent",
  "text-transform",
  "word-break",
  "overflow-wrap",
  "white-space",
  "tab-size",
] as const;

let mirror: HTMLTextAreaElement | null = null;
let mirrorUsers = 0;

function acquireMirror() {
  mirrorUsers += 1;
  if (!mirror) {
    mirror = document.createElement("textarea");
    mirror.setAttribute("aria-hidden", "true");
    mirror.setAttribute("tabindex", "-1");
    mirror.setAttribute("data-sheen-textarea-mirror", "");
    // Fixed + hidden: never affects layout or scroll, never read by assistive tech.
    mirror.style.cssText =
      "position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;z-index:-1;height:0;min-height:0;max-height:none;overflow:hidden;";
    document.body.appendChild(mirror);
  }
  return mirror;
}

function releaseMirror() {
  mirrorUsers -= 1;
  if (mirrorUsers <= 0 && mirror) {
    mirror.remove();
    mirror = null;
    mirrorUsers = 0;
  }
}

function fit(el: HTMLTextAreaElement, twin: HTMLTextAreaElement, minRows: number, maxRows: number | undefined) {
  // Reads first: every computed value is taken before anything is written, so the twin's writes never invalidate
  // a style that is read afterwards (one style recalc and one layout per fit, the layout at `scrollHeight`).
  const style = getComputedStyle(el);
  const mirrored = MIRRORED.map((property) => style.getPropertyValue(property));
  const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const value = el.value;

  // Writes to the twin, then its single layout read.
  MIRRORED.forEach((property, index) => twin.style.setProperty(property, mirrored[index] ?? ""));
  twin.value = value;
  const scrollHeight = twin.scrollHeight;

  const min = minRows * line + padding + border;
  const max = maxRows === undefined ? Infinity : Math.max(min, maxRows * line + padding + border);
  const content = scrollHeight + border;
  const height = Math.min(max, Math.max(min, content));

  // Writes to the field, after every read.
  el.style.height = `${height}px`;
  el.style.overflowY = content > max + 0.5 ? "auto" : "hidden";
}

/* ---------- Counter ---------- */

type Tone = "neutral" | "near" | "limit" | "over";

/** How close to the limit, for colour and announcements. */
function toneOf(count: number, max: number | undefined): Tone {
  if (max === undefined) return "neutral";
  const left = max - count;
  if (left < 0) return "over";
  if (left === 0) return "limit";
  if (left <= Math.max(10, Math.round(max * 0.1))) return "near";
  return "neutral";
}

const RING = 2 * Math.PI * 7;

function CounterRing({ ratio, tone }: { ratio: number; tone: Tone }) {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className="size-[1.125rem] shrink-0 -rotate-90">
      <circle cx="9" cy="9" r="7" fill="none" strokeWidth="2" className="stroke-sheen-border" />
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING}
        strokeDashoffset={RING * (1 - Math.min(1, ratio))}
        className={cn(
          "transition-[stroke-dashoffset,stroke] duration-(--sheen-duration-base) ease-sheen-out",
          tone === "neutral" && "stroke-sheen-accent",
          tone === "near" && "stroke-sheen-warning",
          (tone === "limit" || tone === "over") && "stroke-sheen-danger",
          "forced-colors:stroke-[CanvasText]",
        )}
      />
    </svg>
  );
}

/**
 * A glass multi-line field. Label, description and error are wired up by Base UI's Field, like `Input`. Use it for comments, bios and messages; use `Input` for one line. `className` styles the outer wrapper and `textareaClassName` the native textarea; every other prop
 * (`value`, `onChange`, `placeholder`, `name`, ...) goes to the textarea.
 *
 * - Auto-resize: grows with its content between `minRows` and `maxRows`, then scrolls. Measured on an off-screen twin, so the page never jumps while you type. `autoResize={false}` gives a fixed height with a resize handle.
 * - Character counter: a small progress ring and "count / max" that turn amber near the limit and red at it. Screen readers hear the count with the field, plus a polite announcement at 20 and 10 characters left and at the limit (not on every keystroke).
 * - `limit="block"` (default) stops typing at `maxLength` and gives the counter a little shake when you try to go past; `limit="warn"` lets people type on and marks the field invalid until they trim it.
 * - `footer` puts content (buttons) in the bottom row, left of the counter; `showCount` overrides when the counter shows; `error` marks the field invalid; `labels` translates the counter strings.
 *
 * Keyboard: Tab focuses the textarea; everything the native control does works (typing, selection, undo). Accessibility: the label, description, error and count are linked with `aria-labelledby` / `aria-describedby`; an `error` is announced politely; 16px text on touch screens so iOS does not zoom.
 * Glass and motion: `glass-1` surface with an accent ring on focus; the counter ring and shake use transform and colour only; reduced motion drops the shake.
 *
 * @example
 * ```tsx
 * import { Textarea } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <Textarea label="Bio" maxLength={280} minRows={3} description="Shown on your public profile." />
 *   );
 * }
 * ```
 *
 * @see /forms/textarea
 */
export function Textarea({
  label,
  description,
  error,
  autoResize = true,
  minRows = 3,
  maxRows = 10,
  maxLength,
  limit = "block",
  showCount,
  footer,
  labels: labelsProp,
  className,
  textareaClassName,
  size = "md",
  disabled,
  name,
  id,
  value,
  defaultValue,
  onChange,
  onBeforeInput,
  ref,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const labels = { ...defaultTextareaLabels, ...labelsProp };
  const autoId = useId();
  const countId = `${autoId}-count`;
  const elementRef = useRef<HTMLTextAreaElement | null>(null);

  // Track the text for the counter in both controlled and uncontrolled use.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- `value` is typed without null, but JS callers and loosely typed forms do pass null: treat it as empty
  const controlledText = value === undefined ? undefined : value == null ? "" : String(value);
  const [text, setText] = useControllable(controlledText, () => (defaultValue == null ? "" : String(defaultValue)));
  const count = text.length;
  const counting = showCount ?? maxLength !== undefined;
  const tone = toneOf(count, maxLength);
  const over = tone === "over";
  const invalid = Boolean(error) || over;

  const setRefs = useMergedRef(elementRef, ref);

  /* Auto-resize: refit when the text, the row limits or the field's width change. */
  const refit = useCallback(() => {
    const el = elementRef.current;
    if (!el || !autoResize || !mirror) return;
    fit(el, mirror, minRows, maxRows);
  }, [autoResize, minRows, maxRows]);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!autoResize || !el) return;
    acquireMirror();
    // The width comes from the observer's entries (computed after layout), never from a synchronous
    // offsetWidth read here: inside a dialog's or drawer's open commit such a read forces a style and
    // layout pass of the whole popup before it has painted. The observer's first report is the initial
    // size and does not refit (the mount effect below already did).
    let width = -1;
    // Refit on the next frame: resizing inside the callback would change the observed box in the same
    // frame and raise "ResizeObserver loop completed with undelivered notifications".
    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? el.offsetWidth;
      const first = width < 0;
      if (next === width) return;
      width = next;
      if (first) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refit);
    });
    observer.observe(el);
    // Web fonts change line metrics once they load; fonts that are already in need no second fit.
    let alive = true;
    const fonts = document.fonts as FontFaceSet | undefined;
    if (fonts && fonts.status !== "loaded") void fonts.ready.then(() => alive && refit());
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.style.height = "";
      el.style.overflowY = "";
      releaseMirror();
    };
  }, [autoResize, refit]);

  useLayoutEffect(() => {
    refit();
  }, [text, refit]);

  // Uncontrolled: a form reset changes the text without a change event; resync the counter.
  const controlled = value !== undefined;
  useEffect(() => {
    const form = elementRef.current?.form;
    if (controlled || !form) return;
    let frame = 0;
    const onReset = () => {
      frame = requestAnimationFrame(() => setText(elementRef.current?.value ?? ""));
    };
    form.addEventListener("reset", onReset);
    return () => {
      cancelAnimationFrame(frame);
      form.removeEventListener("reset", onReset);
    };
  }, [controlled, setText]);

  /* Announce the limit at a few thresholds only, never on every keystroke. */
  const [announcement, setAnnouncement] = useState("");
  const lastStage = useRef<string | null>(null);
  // The frame that sets the message must outlive the effect re-running on the next keystroke
  // (paste + type, key repeat); it is only replaced by a newer stage or dropped on unmount.
  const announceFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(announceFrame.current), []);
  // The wording is read when a stage is announced: `labels` is rebuilt every render and must not restart the effect.
  const messageFor = useEffectEvent((stage: string, left: number) =>
    stage === "over" ? labels.over(-left) : stage === "limit" ? labels.reached : labels.remaining(left),
  );
  useEffect(() => {
    if (maxLength === undefined) return;
    const left = maxLength - count;
    const stage = left < 0 ? "over" : left === 0 ? "limit" : left <= 10 ? "10" : left <= 20 ? "20" : "ok";
    const previous = lastStage.current;
    lastStage.current = stage;
    if (previous === null || stage === previous) return;
    cancelAnimationFrame(announceFrame.current);
    // Back under the thresholds: clear, so stale text isn't read later and the same note can
    // be announced again next time.
    setAnnouncement("");
    if (stage === "ok") return;
    const message = messageFor(stage, left);
    // Set on the next frame: an emptied region that then gets the text is a change screen
    // readers announce, even when it is the same message as last time.
    announceFrame.current = requestAnimationFrame(() => setAnnouncement(message));
  }, [count, maxLength]);

  /* A little shake when typing is blocked at the limit. */
  const [shake, setShake] = useState(0);
  function handleBeforeInput(event: InputEvent<HTMLTextAreaElement>) {
    onBeforeInput?.(event);
    if (limit !== "block" || maxLength === undefined) return;
    const el = event.currentTarget;
    const selected = Math.abs(el.selectionEnd - el.selectionStart);
    if (event.data && el.value.length - selected >= maxLength) setShake((n) => n + 1);
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.currentTarget.value);
    onChange?.(event);
  }

  // Clicking the empty part of the field (the footer row) puts the caret in the text.
  function focusText(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    elementRef.current?.focus();
  }

  const describedBy = [ariaDescribedBy, counting ? countId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={invalid}
      data-slot="textarea-root"
      className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
    >
      {label && <Field.Label className="text-sm font-medium text-sheen-fg">{label}</Field.Label>}

      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- a pointer convenience: clicking the padding focuses the textarea (the textarea itself is the keyboard target) */}
      <div
        data-slot="textarea-field"
        onMouseDown={focusText}
        className={cn(
          "glass-1 flex w-full min-w-0 cursor-text flex-col rounded-sheen-md",
          "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
          "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
          // Solid focus outline around the whole field (not just the bare textarea).
          "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-solid has-[textarea:focus-visible]:outline-sheen-focus",
          invalid &&
            "border-sheen-danger-border focus-within:border-sheen-danger-border focus-within:shadow-[0_0_0_4px_var(--sheen-danger-soft)]",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <Field.Control
          id={id}
          {...(describedBy && { "aria-describedby": describedBy })}
          render={
            <textarea
              {...props}
              ref={setRefs}
              rows={minRows}
              value={value}
              defaultValue={defaultValue}
              maxLength={limit === "block" ? maxLength : undefined}
              onChange={handleChange}
              onBeforeInput={handleBeforeInput}
              data-slot="textarea"
              data-sheen-inner-focus=""
              className={cn(
                size === "sm"
                  ? "py-1 any-pointer-coarse:py-2.5"
                  : size === "lg"
                    ? "py-3"
                    : "py-2 any-pointer-coarse:py-2.5",
                "block w-full min-w-0 bg-transparent px-3.5 text-sm leading-6 text-sheen-fg outline-none placeholder:text-sheen-fg-subtle",
                // High contrast: the field draws the focus ring, so the textarea skips the global one.
                "forced-colors:focus-visible:outline-none!",
                "[scrollbar-width:thin] disabled:cursor-not-allowed any-pointer-coarse:text-base",
                autoResize ? "resize-none" : "min-h-16 resize-y",
                textareaClassName,
              )}
            />
          }
        />

        {(Boolean(footer) || counting) && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- same pointer convenience as the field above
          <div onMouseDown={focusText} className="flex min-w-0 items-center justify-between gap-3 px-3 pb-2">
            <div className="flex min-w-0 items-center gap-1">{footer}</div>
            {counting && (
              <span
                key={shake}
                aria-hidden
                data-slot="textarea-counter"
                data-tone={tone}
                className={cn(
                  "pointer-events-none ms-auto flex shrink-0 items-center gap-1.5 text-xs font-medium tabular-nums",
                  tone === "neutral" && "text-sheen-fg-subtle",
                  tone === "near" && "text-sheen-warning-text",
                  shake > 0 && "motion-ok:animate-[sheen-shake_var(--sheen-duration-slow)_var(--sheen-ease-out)]",
                )}
              >
                {maxLength !== undefined && <CounterRing ratio={count / maxLength} tone={tone} />}
                <span
                  className={cn(
                    // At or over the limit the number sits on a solid danger chip: white on the
                    // danger fill stays >= 5.6:1 whatever colour shows through the glass.
                    (tone === "limit" || tone === "over") &&
                      "-my-0.5 rounded-sheen-full px-1.5 py-0.5 text-sheen-accent-fg [background-image:var(--sheen-danger-fill)] forced-colors:px-0",
                  )}
                >
                  {maxLength === undefined ? count : over ? `−${count - maxLength}` : `${count}/${maxLength}`}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {counting && (
        <>
          <span id={countId} className="sr-only">
            {labels.count(count, maxLength)}
          </span>
          <span aria-live="polite" className="sr-only">
            {announcement}
          </span>
        </>
      )}
      {description && !error && (
        <Field.Description className="text-xs text-sheen-fg-muted">{description}</Field.Description>
      )}
      {/* A live region that is always there, so an error that appears is announced politely.
          Taken out of the flow while empty, so it adds no gap. */}
      <div aria-live="polite" aria-atomic="true" className="empty:absolute">
        {error && (
          <Field.Error match className="text-xs font-medium text-sheen-danger-text">
            {error}
          </Field.Error>
        )}
      </div>
    </Field.Root>
  );
}
