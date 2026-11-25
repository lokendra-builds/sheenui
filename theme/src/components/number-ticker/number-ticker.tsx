"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react";
import { AnimatePresence, motion, useInView, type Transition } from "motion/react";

import { cn } from "../../lib/cn";
import { useHydrated } from "../../lib/canvas-effects";
import { duration as durations, ease } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";

/**
 * Props of `NumberTicker`: the native `<span>` props plus its own options, each documented on its
 * field.
 */
export type NumberTickerProps = Omit<ComponentProps<"span">, "children" | "prefix"> & {
  /** The number to show. */
  value: number;
  /** Where the first roll starts from. Set it to `value` to skip the intro roll. Default 0. */
  from?: number;
  /** Sets the BCP 47 locale(s) for Intl.NumberFormat. Defaults to the browser's. */
  locales?: Intl.LocalesArgument;
  /** Intl.NumberFormat options, e.g. { style: "currency", currency: "EUR" }. */
  format?: Intl.NumberFormatOptions;
  /** Text before the number (read by screen readers too). */
  prefix?: string;
  /** Text after the number (read by screen readers too). */
  suffix?: string;
  /** Wait until the ticker is on screen before the first roll. Default true. */
  animateOnView?: boolean;
  /** Sets the number of seconds before the first roll. Default 0. */
  delay?: number;
  /** Seconds a roll takes, capped at 0.9 (longer values are clamped so digits are never unreadable for long).
   *
   * @default 0.6
   */
  duration?: number;
  /** Which way digits roll: with the change ("auto", default), or always up / down. */
  trend?: "auto" | "up" | "down";
  /** How screen readers hear later changes: "polite" (default), "assertive", or "off" for numbers that change constantly. */
  live?: "polite" | "assertive" | "off";
};

/**
 * The pieces of the visual order: the prefix, each part before the digits (sign, currency…),
 * the digits with their separators as one block ("core", always read left to right), each part
 * after them (currency, percent, compact word…), and the suffix.
 */
type UnitId = string;
type Unit = { id: UnitId; text: string };
type DigitPart = { kind: "digit"; key: string; digit: number; place: number; unit: UnitId };
type TextPart = { kind: "text"; key: string; text: string; unit: UnitId };
type Part = DigitPart | TextPart;

const RTL_LANGUAGES = new Set(["ar", "arc", "ckb", "dv", "fa", "he", "iw", "ks", "ps", "sd", "syr", "ug", "ur", "yi"]);
const RTL_SCRIPTS = new Set(["Arab", "Hebr", "Thaa", "Syrc", "Nkoo", "Adlm", "Rohg"]);

/** Writing direction of a locale (Intl.Locale text info where available, else by language and script). */
function localeDirection(locale: string): "ltr" | "rtl" {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getTextInfo?: () => { direction?: string };
      textInfo?: { direction?: string };
    };
    const direction = (info.getTextInfo?.() ?? info.textInfo)?.direction;
    if (direction) return direction === "rtl" ? "rtl" : "ltr";
    if (info.script) return RTL_SCRIPTS.has(info.script) ? "rtl" : "ltr";
    return RTL_LANGUAGES.has(info.language) ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

/** The ten digit glyphs of a formatter's numbering system ("0".."9", "٠".."٩", …). */
function digitGlyphs(formatter: Intl.NumberFormat) {
  const { locale, numberingSystem } = formatter.resolvedOptions();
  const plain = new Intl.NumberFormat(locale, { numberingSystem, useGrouping: false });
  return Array.from({ length: 10 }, (_, d) => plain.format(d));
}

/**
 * Splits a formatted number into parts with stable keys: integer digits by place (units = i0),
 * fraction digits by position (f0 = tenths), group separators by the place they follow, and
 * everything else (sign, currency, percent, compact suffix, literals) by type and occurrence.
 * Also returns the units of the visual order, in reading order, with their text.
 */
function toParts(formatter: Intl.NumberFormat, glyphs: string[], value: number, prefix = "", suffix = "") {
  const raw = formatter.formatToParts(value);
  const integers = raw.filter((p) => p.type === "integer").reduce((n, p) => n + Array.from(p.value).length, 0);
  const isNumber = (p: Intl.NumberFormatPart) => p.type === "integer" || p.type === "fraction";
  const first = raw.findIndex(isNumber);
  const last = raw.length - 1 - [...raw].reverse().findIndex(isNumber);
  const parts: Part[] = [];
  const units: Unit[] = [];
  const seen: Record<string, number> = {};
  let intSeen = 0;
  let fracSeen = 0;

  if (prefix) {
    units.push({ id: "prefix", text: prefix });
    parts.push({ kind: "text", key: "prefix", text: prefix, unit: "prefix" });
  }
  for (const [index, part] of raw.entries()) {
    const inCore = first >= 0 && index >= first && index <= last;
    let unit: UnitId;
    if (inCore) {
      unit = "core";
      if (index === first) units.push({ id: unit, text: "" });
      const core = units[units.length - 1];
      if (core) core.text += part.value;
    } else {
      const n = (seen[part.type] = (seen[part.type] ?? 0) + 1);
      unit = `${part.type}${n}`;
      units.push({ id: unit, text: part.value });
      parts.push({ kind: "text", key: unit, text: part.value, unit });
      continue;
    }
    if (part.type === "integer" || part.type === "fraction") {
      for (const char of part.value) {
        const digit = glyphs.indexOf(char);
        const key = part.type === "integer" ? `i${integers - 1 - intSeen}` : `f${fracSeen}`;
        const place = part.type === "integer" ? integers - 1 - intSeen : -1 - fracSeen;
        if (part.type === "integer") intSeen++;
        else fracSeen++;
        parts.push(digit >= 0 ? { kind: "digit", key, digit, place, unit } : { kind: "text", key, text: char, unit });
      }
    } else if (part.type === "group") {
      parts.push({ kind: "text", key: `g${integers - intSeen}`, text: part.value, unit });
    } else {
      const n = (seen[part.type] = (seen[part.type] ?? 0) + 1);
      parts.push({ kind: "text", key: `${part.type}${n}`, text: part.value, unit });
    }
  }
  if (suffix) {
    units.push({ id: "suffix", text: suffix });
    parts.push({ kind: "text", key: "suffix", text: suffix, unit: "suffix" });
  }
  return { parts, units };
}

/** A first guess at the visual order (left to right) before it is measured: mirrored around the digits for RTL locales. */
function guessOrder(units: Unit[], rtl: boolean): UnitId[] {
  const ids = units.map((u) => u.id);
  if (!rtl) return ids;
  const core = ids.indexOf("core");
  if (core < 0) return ids.reverse();
  return [...ids.slice(core + 1).reverse(), "core", ...ids.slice(0, core).reverse()];
}

/**
 * The real visual order: where the browser puts each unit when it lays out the plain formatted
 * text here, in this paragraph's direction (`probe` holds that text, invisible). So the wheels
 * sit exactly like the native string would, in LTR and RTL pages alike.
 */
function measureOrder(probe: HTMLElement, units: Unit[]): UnitId[] | null {
  const text = probe.firstChild;
  if (!(text instanceof Text) || text.length !== units.reduce((n, u) => n + u.text.length, 0)) return null;
  const range = document.createRange();
  const placed: { id: UnitId; x: number; index: number }[] = [];
  let offset = 0;
  for (const [index, unit] of units.entries()) {
    range.setStart(text, offset);
    range.setEnd(text, offset + unit.text.length);
    offset += unit.text.length;
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    placed.push({ id: unit.id, x: rects.length ? Math.min(...rects.map((r) => r.left)) : Number.NaN, index });
  }
  // Invisible units (bidi marks) stay next to the unit before them in reading order.
  placed.forEach((unit, i) => {
    if (Number.isNaN(unit.x))
      unit.x = (placed[i - 1]?.x ?? placed.find((u) => !Number.isNaN(u.x))?.x ?? 0) + 0.001 * (i + 1);
  });
  return placed.sort((a, b) => a.x - b.x || a.index - b.index).map((u) => u.id);
}

/** What the wheels last rolled for: the value on screen, and the direction and size of the change. */
type Roll = { shown: number; direction: number; size: number; id: number };

/**
 * Number ticker: every digit is a little wheel that rolls to its new value, like an odometer. Use it for KPIs, prices and counters that change; for a static number, plain text is better.
 *
 * - Formatting is Intl.NumberFormat (`locales`, `format`: currency, percent, compact, units, any locale and numbering system). Each digit keeps its place (units, tens, ...) when the number grows or shrinks, so new places slide in and old ones fade out
 *   instead of everything jumping.
 * - Digits roll up when the value rises and down when it falls (`trend` forces a direction). Places that went through a full cycle (0 to 48,250: the units passed 9 thousands of times) spin one extra turn.
 * - It starts from `from` and rolls to `value` when it first scrolls into view (`animateOnView={false}` rolls on mount; `delay` and `duration` tune the first roll).
 * - `prefix` and `suffix` add text before and after the number (read by screen readers too).
 * - Right-to-left text (Arabic, Hebrew, Persian..., or an RTL page): the digits and separators always read left to right, and the currency, sign, percent and compact words sit exactly where the browser puts them in the plain formatted string (measured, not guessed).
 *
 * Keyboard: none, it is text. Accessibility: the wheels are `aria-hidden`; the final value is in a visually hidden live region (`live`: "polite" by default), so it is read once, correctly formatted, not digit by digit.
 * Glass and motion: no backdrop blur; digits move with transforms and fade. Reduced motion: the value just changes, no rolling.
 *
 * @example
 * ```tsx
 * import { NumberTicker } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <NumberTicker value={48250} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} className="text-4xl font-semibold" />
 *   );
 * }
 * ```
 *
 * @see /effects/number-ticker
 */
export function NumberTicker({
  value,
  from = 0,
  locales,
  format,
  prefix,
  suffix,
  animateOnView = true,
  delay = 0,
  duration,
  trend = "auto",
  live = "polite",
  className,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const reduced = useSheenReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const started = !animateOnView || inView;
  // Options are compared by value, so an inline `format={{ … }}` doesn't rebuild the formatter every render.
  const localesKey = String(locales ?? "");
  const optionsKey = JSON.stringify(format ?? {});
  // The formatter is rebuilt from the keys themselves, so the keys are its real inputs.
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(
        localesKey === "" ? undefined : localesKey.split(","),
        JSON.parse(optionsKey) as Intl.NumberFormatOptions,
      ),
    [localesKey, optionsKey],
  );
  const glyphs = useMemo(() => digitGlyphs(formatter), [formatter]);
  const rtlLocale = useMemo(() => localeDirection(formatter.resolvedOptions().locale) === "rtl", [formatter]);

  // The value on screen (`from` until the first roll, then `value`), with the change that led to
  // it. Kept in state, so every render reads a committed change and nothing is mutated while rendering.
  const [roll, setRoll] = useState<Roll>(() => ({ shown: reduced ? value : from, direction: 1, size: 0, id: 0 }));
  const firstRoll = useRef(true);
  // `delay` only applies to the first roll and `trend` to the next change: read when a roll starts, not watched.
  const settings = useEffectEvent(() => ({ delay, trend }));
  useEffect(() => {
    const { delay: wait, trend: bias } = settings();
    const advance = (next: number) =>
      setRoll((prev) =>
        Object.is(prev.shown, next)
          ? prev
          : {
              shown: next,
              direction: bias === "up" ? 1 : bias === "down" ? -1 : next < prev.shown ? -1 : 1,
              size: Math.abs(next - prev.shown),
              id: prev.id + 1,
            },
      );
    if (reduced) {
      advance(value);
      return;
    }
    if (!started) return;
    if (wait <= 0 || !firstRoll.current) {
      firstRoll.current = false;
      advance(value);
      return;
    }
    const timer = window.setTimeout(() => {
      firstRoll.current = false;
      advance(value);
    }, wait * 1000);
    return () => window.clearTimeout(timer);
  }, [started, value, reduced]);

  // Server render and the first client render (hydration) show the final value as plain text, so crawlers and readers
  // without JavaScript get the real number; the client render swaps in the `from` value and the wheels before the first paint.
  const mounted = useHydrated();
  const { shown } = roll;
  const animated = Number.isFinite(shown) && !reduced && mounted;
  const finalText = `${prefix ?? ""}${formatter.format(value)}${suffix ?? ""}`;
  const plainText = mounted ? `${prefix ?? ""}${formatter.format(shown)}${suffix ?? ""}` : finalText;
  const { parts, units } = animated ? toParts(formatter, glyphs, shown, prefix, suffix) : { parts: [], units: [] };
  const unitsKey = units.map((u) => u.id).join(" ");
  // Reduced motion: the digits swap at once with a 100 ms fade (opacity only), never a roll.
  const plainRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = plainRef.current;
    if (!el || !reduced || roll.id === 0 || typeof el.animate !== "function") return;
    el.animate([{ opacity: 0.4 }, { opacity: 1 }], {
      duration: durations.instant * 1000,
      easing: `cubic-bezier(${ease.out.join(",")})`,
    });
  }, [plainText, reduced, roll.id]);

  // The measured visual order, for the current set of units. Until the first measurement the
  // plain text is rendered (never painted: the measurement re-renders before paint).
  const [measured, setMeasured] = useState<{ key: string; order: UnitId[]; epoch: number } | null>(null);
  // The order only depends on the set of units and on glyph metrics, so it is measured once per set of units (a value that
  // changes every second keeps the same one) and again when the web fonts have loaded or the container is resized.
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    const bump = () => setEpoch((n) => n + 1);
    // `document.fonts` is missing in some embedded webviews, whatever the DOM types say.
    const fonts = document.fonts as FontFaceSet | undefined;
    void fonts?.ready.then(bump);
    const probe = probeRef.current;
    if (!probe || typeof ResizeObserver === "undefined") return;
    let width = probe.parentElement?.offsetWidth ?? 0;
    const ro = new ResizeObserver(() => {
      const next = probe.parentElement?.offsetWidth ?? 0;
      if (next !== width) {
        width = next;
        bump();
      }
    });
    if (probe.parentElement) ro.observe(probe.parentElement);
    return () => ro.disconnect();
  }, []);
  // The effect has no dependency array on purpose: it runs after every commit, but returns before any layout read when the order is already known.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a measure-after-every-commit layout effect: the DOM (fonts, container width) changes without React knowing, and the equality guard below stops any loop
  useLayoutEffect(() => {
    const probe = probeRef.current;
    if (!animated || !probe) return;
    if (measured?.key === unitsKey && measured.epoch === epoch) return; // known: no layout read
    const order = measureOrder(probe, units);
    if (!order) return;
    // Compared with this render's state, not inside an updater: when nothing changed, no update is queued at all.
    // (An updater that returns the same state still counts as a nested update while a hydrating tree has pending
    // work, and this effect runs after every commit: that loop ended in "Maximum update depth exceeded".)
    if (measured?.key === unitsKey && measured.order.join(" ") === order.join(" ")) return;
    setMeasured({ key: unitsKey, order, epoch });
  });
  const order = measured?.key === unitsKey ? measured.order : guessOrder(units, rtlLocale);
  const rank = new Map(order.map((id, i) => [id, i]));
  // Stable sort: parts keep their reading order inside a unit (the digits).
  const visual = [...parts].sort((a, b) => (rank.get(a.unit) ?? 0) - (rank.get(b.unit) ?? 0));
  // visualDuration: the roll looks done at `duration` (0.6 s), so the digits are unreadable for a short, defined time.
  const transition: Transition = {
    type: "spring",
    visualDuration: Math.min(duration ?? durations.slower, MAX_ROLL),
    bounce: 0.05,
  };

  return (
    <span
      ref={ref}
      data-slot="number-ticker"
      className={cn("relative inline-block whitespace-nowrap tabular-nums text-end", className)}
      {...props}
    >
      {animated && measured ? (
        // Laid out left to right on purpose: the parts are already in the measured visual order.
        // min-w-full + text-end: the wheel row always spans the ticker (whose width is the reserved final width), so the row's
        // left edge stays put while places are added on its end side (a count-up from 0): the digits do not shift as layout.
        // dir="ltr" turns "end" into the right edge, so a right-to-left ticker aligns to the left instead (rtl:text-start).
        <span aria-hidden className="relative inline-block min-w-full text-end rtl:text-start" dir="ltr">
          <AnimatePresence initial={false} mode="popLayout">
            {visual.map((part) =>
              part.kind === "digit" ? (
                <Wheel
                  key={part.key}
                  digit={part.digit}
                  glyphs={glyphs}
                  direction={roll.direction}
                  // A place that went through a full cycle of its digits spins one extra turn.
                  extraTurn={roll.size >= 10 ** (part.place + 1)}
                  roll={roll.id}
                  transition={transition}
                  // Places on screen before the first change start on their digit; later ones roll in.
                  instant={roll.id === 0}
                />
              ) : (
                <Literal key={part.key} text={part.text} />
              ),
            )}
          </AnimatePresence>
        </span>
      ) : (
        // Plain text, laid out by the browser (reduced motion, or the instant before the first measurement).
        // The text is CSS-generated content (`data-text`), not a text node: the value is in the DOM text once, in the
        // visually hidden live region below, so text extraction (a crawler, a Markdown twin, "select all") reads it once.
        <span
          ref={plainRef}
          aria-hidden
          data-text={plainText}
          className="inline-block before:content-[attr(data-text)]"
        />
      )}
      {animated && (
        // The same text, invisible, so the visual order of its parts can be measured.
        <span
          ref={probeRef}
          aria-hidden
          className="pointer-events-none invisible absolute inset-0 overflow-hidden whitespace-pre"
        >
          {plainText}
        </span>
      )}
      {/* Reserves the final value's width (zero height, invisible), so a count that adds or drops a place never
          resizes the ticker: no sibling moves while it rolls. Digits are tabular, so the final width is the widest.
          Its text is CSS-generated (`data-text`), so the value is not repeated in the DOM text. Rendered in the server HTML and on the first client render as well (not only once `animated`), so the width
          is already the final one before hydration and a ticker that starts from a lower value never widens then. */}
      <span
        aria-hidden
        data-text={finalText}
        className="pointer-events-none invisible block h-0 overflow-hidden whitespace-pre before:content-[attr(data-text)]"
      />
      <span className="sr-only" aria-live={live} aria-atomic="true">
        {finalText}
      </span>
    </span>
  );
}

const enter = { opacity: 0 };
const present = { opacity: 1, transition: { duration: durations.base, ease: ease.out } };
const leave = { opacity: 0, transition: { duration: durations.exit, ease: ease.exit } };
const slide: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/** Text between the digits: its own direction comes from its letters (a right-to-left currency reads right to left). */
function Literal({ text, ref }: { text: string; ref?: Ref<HTMLSpanElement> }) {
  return (
    <motion.span
      ref={ref}
      dir="auto"
      layout="position"
      transition={{ layout: slide }}
      initial={enter}
      animate={present}
      exit={leave}
      className="inline-block whitespace-pre"
    >
      {text}
    </motion.span>
  );
}

type WheelProps = {
  digit: number;
  glyphs: string[];
  direction: number;
  extraTurn: boolean;
  /** Changes on every change of the value (even when this digit stays the same: it may still spin a full turn). */
  roll: number;
  transition: Transition;
  /** Start on `digit` (first render) instead of rolling in from 0. */
  instant: boolean;
  ref?: Ref<HTMLSpanElement>;
};

const wrap10 = (n: number) => ((n % 10) + 10) % 10;

/** Cells in a wheel's column: eight turns of 0-9, so a roll (even an interrupted one) never leaves the column. */
const CELLS = 80;
const REST = 40;

/** The longest a roll may take (seconds): digits are unreadable while they spin. */
const MAX_ROLL = 0.9;

/**
 * One digit place: an odometer wheel. A column of eight stacked 0-9 turns sits behind a clipped window (soft
 * edges, fixed-width cells, `tabular-nums`), and the roll is ONE Web Animation of the column's `transform`
 * (compositor, no per-frame JS). `position` grows without bound (each step is one digit), so the wheel turns
 * forwards or backwards past 9 → 0 forever. A change during a roll continues from where the wheel is right now.
 */
function Wheel({ digit, glyphs, direction, extraTurn, roll, transition, instant, ref }: WheelProps) {
  const column = useRef<HTMLSpanElement>(null);
  const target = useRef(instant ? digit : 0);
  const running = useRef<{ run: Animation; from: number; to: number } | null>(null);
  // The last change this wheel has turned for: makes the effect safe to run twice (Strict Mode).
  const handled = useRef<number | null>(instant ? roll : null);
  const [startDigit] = useState(instant ? digit : 0);
  const at = (cell: number) => `translateY(${(-cell * 100) / CELLS}%)`;

  useEffect(() => {
    const el = column.current;
    if (!el) return;
    if (handled.current === roll) return;
    handled.current = roll;
    // Where the wheel is right now (a roll in flight reports its eased progress).
    const flight = running.current;
    const cur = flight
      ? flight.from + (flight.to - flight.from) * (flight.run.effect?.getComputedTiming().progress ?? 1)
      : target.current;
    const current = wrap10(target.current);
    let step = direction > 0 ? wrap10(digit - current) : -wrap10(current - digit);
    if (extraTurn) step += 10 * direction;
    target.current += step;
    const from = REST + wrap10(cur);
    const to = from + (target.current - cur);
    flight?.run.cancel();
    const rest = at(REST + wrap10(target.current));
    const visual = (transition as { visualDuration?: number }).visualDuration ?? 0.6;
    if (typeof el.animate !== "function" || target.current === cur) {
      el.style.transform = rest;
      running.current = null;
      el.parentElement?.removeAttribute("data-rolling");
      return;
    }
    const win = el.parentElement;
    win?.setAttribute("data-rolling", "");
    const run = el.animate([{ transform: at(from) }, { transform: at(to) }], {
      duration: visual * 1000,
      easing: `cubic-bezier(${ease.out.join(",")})`,
      fill: "both",
    });
    running.current = { run, from: cur, to: target.current };
    run.onfinish = () => {
      win?.removeAttribute("data-rolling");
      el.style.transform = rest;
      run.cancel();
      if (running.current?.run === run) running.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- turns once per change of the value (`roll`) or digit
  }, [roll, digit]);

  return (
    <motion.span
      ref={ref}
      layout="position"
      transition={{ layout: slide }}
      initial={enter}
      animate={present}
      exit={leave}
      // One tabular digit is 1ch wide: the place reserves at least that box up front, so rolling (transform only,
      // inside the clipped window below) never changes a width and no layout happens during a roll.
      className="relative inline-block min-w-[1ch]"
    >
      {/* Gives the place the text baseline and its height. */}
      <span className="invisible">{glyphs[0]}</span>
      <span
        className="absolute inset-x-0 -top-[0.25em] -bottom-[0.25em] overflow-hidden [clip-path:inset(0.25em_0)] data-[rolling]:[clip-path:none]"
        style={{ maskImage: "linear-gradient(transparent, black 0.25em, black calc(100% - 0.25em), transparent)" }}
      >
        <span
          ref={column}
          className="absolute inset-x-0 top-[0.25em] flex flex-col will-change-transform"
          style={{ transform: at(REST + startDigit) }}
        >
          {Array.from({ length: CELLS }, (_, i) => (
            <span key={i} className="block h-[1lh] text-center">
              {glyphs[i % 10]}
            </span>
          ))}
        </span>
      </span>
    </motion.span>
  );
}
