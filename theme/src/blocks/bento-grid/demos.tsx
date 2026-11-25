"use client";

import { useEffect, useEffectEvent, useId, useMemo, useRef, useState, type FocusEvent } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "../../lib/cn";
import { duration, ease, spring } from "../../motion/tokens";
import { exitTransition } from "../../motion/presets";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { Avatar, AvatarGroup } from "../../components/avatar/avatar";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { OtpInput, type OtpStatus } from "../../components/otp-input/otp-input";
import { Sparkline } from "../../components/charts/sparkline";
import { Switch } from "../../components/switch/switch";
import { useBentoCellVisible } from "./context";
import { BellIcon, TrendIcon, PlusIcon } from "./icons";

/* =====================================================================
 * Mini-demos
 * ===================================================================== */

/* ---------- Small radio pills (period pickers) ---------- */

/** A small segmented pill selector used inside the tile demos. @internal */
export function Pills<T extends string>({
  value,
  options,
  onChange,
  label,
  optionLabel,
  optionName,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
  optionLabel: (value: T) => string;
  optionName: (value: T) => string;
}) {
  const reduced = useSheenReducedMotion();
  const pillId = useId();
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next)}
      aria-label={label}
      className="glass-1 inline-flex items-center gap-0.5 rounded-sheen-full p-0.5"
    >
      {options.map((option) => (
        <Radio.Root
          key={option}
          value={option}
          aria-label={optionName(option)}
          className={cn(
            "relative isolate inline-flex h-7 min-w-9 cursor-pointer items-center justify-center rounded-sheen-full px-2.5 text-xs font-semibold tabular-nums select-none",
            "text-sheen-fg-muted transition-colors duration-(--sheen-duration-fast) hover:text-sheen-fg data-checked:text-sheen-fg",
            "touch-manipulation focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
            // 44px hit area on touch screens without changing the look.
            "any-pointer-coarse:after:absolute any-pointer-coarse:after:top-1/2 any-pointer-coarse:after:left-1/2 any-pointer-coarse:after:h-11 any-pointer-coarse:after:w-full any-pointer-coarse:after:min-w-11 any-pointer-coarse:after:-translate-1/2",
            "forced-colors:data-checked:underline forced-colors:data-checked:decoration-2 forced-colors:data-checked:underline-offset-4",
          )}
        >
          {value === option && (
            <motion.span
              aria-hidden
              layoutId={pillId}
              transition={reduced ? { duration: 0 } : spring.snappy}
              // The tabs' indicator token: the glass highlight's 0.34 white at night left the chosen label under 4.5:1.
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-(--sheen-indicator) shadow-[inset_0_1px_0_var(--sheen-glass-highlight),0_0_0_1px_var(--sheen-glass-edge),0_1px_2px_var(--sheen-shadow-near)]"
            />
          )}
          <span aria-hidden>{optionLabel(option)}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

/* ---------- Chart ---------- */

/** One selectable period of the bento chart: its headline `total`, the `change` against the previous period in percent (8.2 = +8.2%) and the `values` plotted. */
export type BentoChartPeriod = { total: number; change: number; values: number[] };

/** Every user-facing string of the bento chart cell (metric name, period picker and period names). */
export type BentoChartLabels = {
  metric: string;
  /** Accessible name of the period picker. */
  period: string;
  /** Short text on a period pill ("7d" → "7D"). */
  periodShort: (key: string) => string;
  /** Spoken name of a period ("7d" → "Last 7 days"). */
  periodName: (key: string) => string;
  /** Change badge; receives the formatted percentage. */
  change: (direction: "up" | "down", amount: string) => string;
  /** Accessible name of the sparkline; receives the spoken change ("up 12.4%"). */
  trend: (metric: string, period: string, change: string) => string;
};

/** Props of `BentoChartDemo`. */
export type BentoChartDemoProps = {
  /** Figures per period (`Record<string, BentoChartPeriod>`, default: sample revenue); the keys become the period buttons. */
  data?: Record<string, BentoChartPeriod>;
  /** Sets the ISO 4217 currency (`string`, default `"USD"`). */
  currency?: string;
  /** Sets the BCP 47 locale (`string`, default `"en-US"`). */
  locale?: string;
  /** Overrides for the built-in English strings. */
  labels?: Partial<BentoChartLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The English strings of the chart tile; pass `labels` to override any of them. */
export const defaultBentoChartLabels: BentoChartLabels = {
  metric: "Revenue",
  period: "Period",
  periodShort: (key) => key.toUpperCase(),
  periodName: (key) => {
    const match = /^(\d+)\s*([dwmy])$/i.exec(key);
    if (!match) return key;
    const n = Number(match[1]);
    const unit = { d: "day", w: "week", m: "month", y: "year" }[
      (match[2] ?? "d").toLowerCase() as "d" | "w" | "m" | "y"
    ];
    return `Last ${n} ${unit}${n === 1 ? "" : "s"}`;
  },
  change: (direction, amount) => `${direction === "up" ? "Up" : "Down"} ${amount}`,
  trend: (metric, period, change) => `${metric} trend, ${period.toLowerCase()}, ${change.toLowerCase()}`,
};

/** The default per-period series of the chart tile. @internal */
export const defaultChartData: Record<string, BentoChartPeriod> = {
  "7d": { total: 12480, change: 8.2, values: [1.1, 1.3, 1.2, 1.5, 1.4, 1.7, 1.6, 1.8, 1.7, 2.0, 1.9, 2.2] },
  "30d": { total: 48250, change: 12.4, values: [3.1, 3.4, 3.2, 3.8, 4.2, 4.0, 4.6, 4.4, 4.9, 5.3, 5.1, 5.8] },
  "90d": {
    total: 139900,
    change: -3.6,
    values: [14, 13.2, 13.8, 12.9, 12.4, 12.9, 12.1, 11.6, 12.2, 11.8, 11.1, 11.5],
  },
};

/**
 * A bento visual: a revenue total that counts up beside a sparkline, with period buttons that change
 * both. Props (see `BentoChartDemoProps`): `data`, `currency` (`"USD"`), `locale` (`"en-US"`), `labels`,
 * `className`. Keyboard: the period pills are a radio group; Tab enters it and the arrow keys change the period. Accessibility: the
 * total is read once as text, the sparkline has a text name. Motion: the count-up and the sparkline
 * draw-in run once; reduced motion shows the final values.
 *
 * @example
 * ```tsx
 * import { BentoChartDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoChartDemo currency="EUR" locale="de-DE" />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoChartDemo({
  data = defaultChartData,
  currency = "USD",
  locale = "en-US",
  labels,
  className,
}: BentoChartDemoProps) {
  const L = { ...defaultBentoChartLabels, ...labels };
  const keys = Object.keys(data);
  const [period, setPeriod] = useState(keys[1] ?? keys[0] ?? "");
  const current = data[period];
  const reduced = useSheenReducedMotion();
  const { money, pct } = useMemo(
    () => ({
      money: new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }),
      pct: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }),
    }),
    [locale, currency],
  );

  // Count to the new total whenever the period changes (straight to it with reduced motion).
  const total = useMotionValue(0);
  const text = useTransform(total, (n) => money.format(n));
  useEffect(() => {
    if (!current) return;
    if (reduced) {
      total.set(current.total);
      return;
    }
    const controls = animate(total, current.total, { duration: duration.slower * 1.4, ease: ease.out });
    return () => controls.stop();
  }, [current, reduced, total]);

  if (!current) return null;
  const up = current.change >= 0;
  const amount = pct.format(Math.abs(current.change) / 100);
  const changeText = L.change(up ? "up" : "down", amount);

  return (
    <div data-slot="bento-chart-demo" className={cn("flex w-full max-w-xl flex-col gap-4 self-stretch", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-sheen-fg-muted">{L.metric}</p>
          <p className="flex items-center gap-2.5">
            {/* The final figure sets the width from the start, so the count-up never changes
                where the header wraps (a wrap flip would jump the whole cell). */}
            <span aria-hidden className="inline-grid text-3xl font-semibold tracking-tight tabular-nums">
              <span className="invisible col-start-1 row-start-1">{money.format(current.total)}</span>
              <motion.span className="col-start-1 row-start-1">{text}</motion.span>
            </span>
            <span className="sr-only">{money.format(current.total)}</span>
            <Badge tone={up ? "success" : "danger"} className="h-5 gap-1 px-2 text-2xs font-semibold">
              <TrendIcon up={up} className="size-3" />
              {changeText}
            </Badge>
          </p>
        </div>
        <Pills
          value={period}
          options={keys}
          onChange={setPeriod}
          label={L.period}
          optionLabel={L.periodShort}
          optionName={L.periodName}
        />
      </div>
      <Sparkline values={current.values} height={96} aria-label={L.trend(L.metric, L.periodName(period), changeText)} />
    </div>
  );
}

/* ---------- Toast stack ---------- */

/** A notification in the bento toast stack: a tone (`success`, `info` or `error`), a title and a description. */
export type BentoToast = { tone: "success" | "info" | "danger"; title: string; description: string };

/** Every user-facing string of the bento toast cell (stack name and the send button). */
export type BentoToastLabels = {
  /** Accessible name of the stack. */
  region: string;
  send: string;
};

/** The English strings of the toast tile; pass `labels` to override any of them. */
export const defaultBentoToastLabels: BentoToastLabels = { region: "Sample notifications", send: "Send notification" };

/** Props of `BentoToastDemo`. */
export type BentoToastDemoProps = {
  /** Notifications to cycle through. The first three play on their own when the cell appears. */
  notifications?: BentoToast[];
  /** Overrides for the built-in English strings. */
  labels?: Partial<BentoToastLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The default notifications of the toast-stack tile. @internal */
export const defaultToasts: BentoToast[] = [
  { tone: "success", title: "Deploy finished", description: "sheen-web is live on production." },
  { tone: "info", title: "New comment", description: "Maya replied to “Glass tokens”." },
  { tone: "success", title: "Payment received", description: "$249.00 from Northwind." },
  { tone: "danger", title: "Build failed", description: "2 type errors in pricing.tsx." },
  { tone: "info", title: "Invite accepted", description: "Leo joined the Design team." },
];

/** The colour and icon path of each toast tone. @internal */
export const toneIcon = {
  success: { color: "text-sheen-success-text", path: "M8 12.5l2.5 2.5L16 9.5" },
  info: { color: "text-sheen-accent", path: "M12 16v-4m0-4h.01" },
  danger: { color: "text-sheen-danger-text", path: "M12 8v4m0 4h.01" },
} as const;

/** The height of one stacked toast, in pixels. @internal */
export const TOAST_H = 64;
/** The gap between toasts when the stack is fanned out, in pixels. @internal */
export const TOAST_GAP = 8;
/** How far each toast behind the front one peeks out, in pixels. @internal */
export const TOAST_PEEK = 10;
/** The number of toasts visible in the collapsed stack. @internal */
export const STACK = 3;
/** The number of toasts that arrive during the intro animation. @internal */
export const INTRO_COUNT = 3;
/* The region is tall enough for the fanned-out stack; at rest the stack sits in its middle. */
/** The height of the toast stack when it is fanned out, in pixels. @internal */
export const STACK_FANNED = STACK * TOAST_H + (STACK - 1) * TOAST_GAP;
/** The vertical offset that centres the collapsed toast stack. @internal */
export const STACK_REST_Y = (STACK_FANNED - (TOAST_H + (STACK - 1) * TOAST_PEEK)) / 2;

/**
 * A bento visual: a stack of glass notifications that plays three on its own, spreads on hover or
 * focus, and has a button to send another. Props (see `BentoToastDemoProps`): `notifications`
 * (sample list, cycled), `labels`, `className`.
 * Keyboard: Tab reaches the send button; the stack expands while focus is inside it. Accessibility: the
 * stack is a focusable `group` named "Sample notifications" (not "Notifications", which is usually the app's own toast
 * region; a group, not a landmark) and new items are announced politely. Motion: items slide in; the loop pauses while the cell
 * is off screen; reduced motion adds items without movement.
 *
 * @example
 * ```tsx
 * import { BentoToastDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoToastDemo notifications={[{ tone: "success", title: "Deploy finished", description: "acme-web is live" }]} />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoToastDemo({ notifications = defaultToasts, labels, className }: BentoToastDemoProps) {
  // Not "Notifications": that is usually the app's real toast region.
  const L = { ...defaultBentoToastLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const visible = useBentoCellVisible();
  const [items, setItems] = useState<(BentoToast & { id: number })[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const next = useRef(0);
  const pointer = useRef("");

  function push(announce: boolean) {
    if (notifications.length === 0) return;
    const toast = notifications[next.current % notifications.length];
    if (!toast) return;
    const id = next.current++;
    setItems((list) => [{ ...toast, id }, ...list].slice(0, STACK + 1));
    if (announce) setAnnouncement(`${toast.title}. ${toast.description}`);
  }

  // Three notifications arrive on their own (about 2.5 s in all), then the stack rests. Only
  // once: if the cell scrolls away mid-intro, the rest arrive when it is back; never again after.
  const introFired = useRef(0);
  // `push` only reads refs and props, so a new identity must not reset the timers: it is read when a timer fires.
  const pushIntro = useEffectEvent(() => push(false));
  useEffect(() => {
    const left = INTRO_COUNT - introFired.current;
    if (left <= 0 || !visible) return;
    const timers = Array.from({ length: left }, (_, i) =>
      window.setTimeout(
        () => {
          introFired.current++;
          pushIntro();
        },
        300 + i * 1000,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [visible]);

  function leave(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
  }

  const shown = items.slice(0, STACK);

  return (
    <div data-slot="bento-toast-demo" className={cn("flex w-full max-w-80 flex-col items-center gap-4", className)}>
      {/* Hover or focus fans the stack out (a tap toggles it on touch screens). */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a tap toggles the fanned stack on touch screens; keyboard users get the same result from focus (onFocus below), so no key handler is needed */}
      <div
        role="group"
        aria-label={L.region}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard focus is what fans the stack out and reveals every notification
        tabIndex={0}
        onPointerEnter={(e) => e.pointerType === "mouse" && setExpanded(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setExpanded(false)}
        onPointerDown={(e) => {
          pointer.current = e.pointerType;
        }}
        onClick={() => pointer.current !== "mouse" && setExpanded((open) => !open)}
        // Keyboard focus fans it out; a tap's focus is left to the click above.
        onFocus={(e) => e.target.matches(":focus-visible") && setExpanded(true)}
        onBlur={leave}
        className="relative w-full rounded-sheen-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheen-focus"
        style={{ height: STACK_FANNED }}
      >
        <ol className="contents">
          <AnimatePresence initial={false}>
            {shown.map((toast, i) => {
              const front = i === 0;
              const y = expanded ? i * (TOAST_H + TOAST_GAP) : STACK_REST_Y + i * TOAST_PEEK;
              const scale = expanded || reduced ? 1 : 1 - i * 0.06;
              return (
                <motion.li
                  key={toast.id}
                  // The glass toast moves and fades itself (no wrapper around the glass).
                  className="glass-2 absolute inset-x-0 top-0 flex origin-top items-center gap-3 rounded-sheen-lg px-3.5 select-none"
                  style={{ height: TOAST_H, zIndex: STACK - i }}
                  initial={reduced ? { opacity: 0, y } : { opacity: 0, y: y - TOAST_H * 0.6, scale: 0.96 }}
                  animate={{ opacity: 1, y, scale }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: exitTransition }
                      : { opacity: 0, scale: scale - 0.04, transition: exitTransition }
                  }
                  transition={reduced ? { duration: 0, opacity: { duration: duration.fast } } : spring.gentle}
                >
                  <motion.span
                    className="flex min-w-0 flex-1 items-center gap-3"
                    // Toasts behind the front one show only their edge, so their text fades out.
                    animate={{ opacity: front || expanded ? 1 : 0 }}
                    transition={{ duration: duration.fast }}
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className={cn("size-5 shrink-0", toneIcon[toast.tone].color)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d={toneIcon[toast.tone].path} />
                    </svg>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">{toast.title}</span>
                      <span className="truncate text-xs text-sheen-fg-muted">{toast.description}</span>
                    </span>
                  </motion.span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
      <Button variant="glass" size="sm" onClick={() => push(true)} leading={<BellIcon className="size-3.5" />}>
        {L.send}
      </Button>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

/* ---------- OTP ---------- */

/** Every user-facing string of the bento one-time-code cell (label, hint, success and error text, reset button). */
export type BentoOtpLabels = {
  label: string;
  /** Hint under the slots; receives the demo code. */
  hint: (code: string) => string;
  success: string;
  error: string;
  reset: string;
};

/** The English strings of the one-time-code tile; pass `labels` to override any of them. */
export const defaultBentoOtpLabels: BentoOtpLabels = {
  label: "Verification code",
  hint: (c) => `Hint: the code is ${c}`,
  success: "Verified. Welcome in.",
  error: "That code doesn't match.",
  reset: "Try again",
};

/** Props of `BentoOtpDemo`. */
export type BentoOtpDemoProps = {
  /** The code that verifies (`string`, default `"2468"`). Its length sets the number of slots. */
  code?: string;
  /** Overrides for the built-in English strings. */
  labels?: Partial<BentoOtpLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A bento visual: a working one-time-code field with a hint, a success state and a wrong-code shake.
 * Props (see `BentoOtpDemoProps`): `code` (`"2468"`), `labels`, `className`.
 * Keyboard: type or paste the digits; Backspace steps back; "Try again" is a button. Accessibility:
 * the field is named "Verification code" and the result is announced. Motion: a short shake on a wrong
 * code; reduced motion drops the shake.
 *
 * @example
 * ```tsx
 * import { BentoOtpDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoOtpDemo code="1234" />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoOtpDemo({ code = "2468", labels, className }: BentoOtpDemoProps) {
  const L: BentoOtpLabels = { ...defaultBentoOtpLabels, ...labels };
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} data-slot="bento-otp-demo" className={cn("flex w-full flex-col items-center gap-3", className)}>
      <OtpInput
        length={code.length}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          if (status !== "idle") setStatus("idle");
        }}
        onComplete={(v) => setStatus(v === code ? "success" : "error")}
        status={status}
        aria-label={L.label}
        description={status === "idle" ? L.hint(code) : undefined}
        errorMessage={L.error}
        successMessage={L.success}
        // Left enabled on success: disabling the slot that has focus would drop focus to <body>.
      />
      {status === "success" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue("");
            setStatus("idle");
            // This button goes away: put the caret back in the first slot.
            rootRef.current
              ?.querySelector<HTMLInputElement>("input:not([type=hidden]):not([aria-hidden=true])")
              ?.focus();
          }}
        >
          {L.reset}
        </Button>
      )}
    </div>
  );
}

/* ---------- Switches (live glass preview) ---------- */

/** Every user-facing string of the bento switch cell (preview name, the frost, tint and float switches, and the sample text). */
export type BentoSwitchLabels = {
  /** Accessible name of the preview tile. */
  preview: string;
  frost: string;
  tint: string;
  float: string;
  /** Text on the preview tile. */
  sample: string;
};

/** The English strings of the glass-switch tile; pass `labels` to override any of them. */
export const defaultBentoSwitchLabels: BentoSwitchLabels = {
  preview: "Glass preview",
  frost: "Frosted glass",
  tint: "Accent tint",
  float: "Float",
  sample: "Aa",
};

/** Props of `BentoSwitchDemo`. */
export type BentoSwitchDemoProps = {
  /** Overrides for the built-in English strings. */
  labels?: Partial<BentoSwitchLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/**
 * A bento visual: three switches (frosted glass, accent tint, float) that change a live glass tile over
 * coloured shapes, so the blur is easy to see. Props (see `BentoSwitchDemoProps`): `labels`, `className`.
 * Keyboard: Tab reaches each switch; Space toggles. Accessibility: real switches with visible labels;
 * the preview is a named image. Motion: the float switch drives a gentle bob that pauses off screen;
 * reduced motion keeps the tile still.
 *
 * @example
 * ```tsx
 * import { BentoSwitchDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoSwitchDemo />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoSwitchDemo({ labels, className }: BentoSwitchDemoProps) {
  const L: BentoSwitchLabels = { ...defaultBentoSwitchLabels, ...labels };
  const visible = useBentoCellVisible();
  const [frost, setFrost] = useState(true);
  const [tint, setTint] = useState(true);
  const [float, setFloat] = useState(true);

  return (
    <div data-slot="bento-switch-demo" className={cn("flex w-full flex-col gap-4", className)}>
      {/* Crisp shapes behind the tile, so the blur (or its absence) is easy to see. */}
      <div role="img" aria-label={L.preview} className="relative flex h-24 items-center justify-center">
        <span aria-hidden className="absolute top-2 start-[22%] size-14 rounded-full bg-(--sheen-chart-1)" />
        <span
          aria-hidden
          className="absolute end-[24%] bottom-1 size-12 rotate-12 rounded-sheen-md bg-(--sheen-chart-5)"
        />
        <span
          aria-hidden
          className="absolute top-8 start-[46%] h-1.5 w-20 -rotate-12 rounded-full bg-(--sheen-chart-3)"
        />
        <span
          aria-hidden
          className={cn(
            "relative flex h-20 w-32 items-center justify-center rounded-sheen-lg text-2xl font-semibold",
            "transition-[background-color,border-color,box-shadow] duration-(--sheen-duration-base) ease-sheen-out",
            frost ? "glass-2" : "border border-sheen-border bg-transparent text-sheen-fg",
            frost && tint && "glass-tint",
            float &&
              "motion-ok:animate-[sheen-float_var(--sheen-duration-loop-float)_var(--sheen-ease-in-out)_infinite]",
            !visible && "[animation-play-state:paused]",
          )}
        >
          {L.sample}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <Switch label={L.frost} checked={frost} onCheckedChange={setFrost} />
        <Switch label={L.tint} checked={tint} onCheckedChange={setTint} disabled={!frost} />
        <Switch label={L.float} checked={float} onCheckedChange={setFloat} />
      </div>
    </div>
  );
}

/* ---------- Avatars ---------- */

/** Every user-facing string of the bento avatar cell (invite and reset buttons and the presence line). */
export type BentoAvatarLabels = {
  invite: string;
  reset: string;
  /** Presence line; receives the people shown. */
  here: (names: string[]) => string;
  /** Overflow chip for people not shown ("+12"); and its spoken form. */
  more: (count: number) => string;
  moreLong: (count: number) => string;
};

/** The English strings of the avatar tile; pass `labels` to override any of them. */
export const defaultBentoAvatarLabels: BentoAvatarLabels = {
  invite: "Invite teammate",
  reset: "Reset",
  here: (names) =>
    names.length <= 2
      ? `${names.join(" and ")} ${names.length === 1 ? "is" : "are"} editing`
      : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more are editing`,
  more: (n) => `+${n}`,
  moreLong: (n) => `and ${n} more people`,
};

/** Props of `BentoAvatarDemo`. */
export type BentoAvatarDemoProps = {
  /** Names of the people who can join (`string[]`, default: sample names). */
  people?: string[];
  /** People beyond the list, shown as "+N" (`number`, default 12). */
  extra?: number;
  /** Overrides for the built-in English strings. */
  labels?: Partial<BentoAvatarLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The default names shown in the avatar-group tile. @internal */
export const defaultPeople = ["Maya Chen", "Leo Park", "Ava Singh", "Noah Kim", "Iris Patel", "Omar Haddad"];

/**
 * A bento visual: an avatar group where an "Invite teammate" button adds people one by one and a
 * sentence says who is editing. Props (see `BentoAvatarDemoProps`): `people`, `extra` (`12`), `labels`,
 * `className`. Keyboard: Tab reaches Invite and Reset; Space or Enter presses them.
 * Accessibility: the group has a text name, "+N" has a long form for screen readers, and changes are
 * announced. Motion: new avatars spring in; reduced motion adds them without movement.
 *
 * @example
 * ```tsx
 * import { BentoAvatarDemo } from "@sheenui/theme";
 *
 * export function Example() {
 *   return (
 *     <BentoAvatarDemo people={["Ada Lovelace", "Grace Hopper", "Alan Turing"]} extra={5} />
 *   );
 * }
 * ```
 *
 * @see /blocks/bento-grid
 */
export function BentoAvatarDemo({ people = defaultPeople, extra = 12, labels, className }: BentoAvatarDemoProps) {
  const L: BentoAvatarLabels = { ...defaultBentoAvatarLabels, ...labels };
  const reduced = useSheenReducedMotion();
  const start = Math.min(3, people.length);
  const [count, setCount] = useState(start);
  const shown = people.slice(0, count);
  const full = count >= people.length;

  return (
    <div
      data-slot="bento-avatar-demo"
      className={cn("flex w-full flex-col items-center gap-4 @4xl:items-start", className)}
    >
      <AvatarGroup aria-label={L.here(shown.map((p) => p.split(" ")[0] ?? p))} role="group">
        <AnimatePresence initial={!reduced}>
          {shown.map((name, i) => (
            // Scale only (no fade): the avatar inside is glass, and a fading wrapper would break its blur.
            <motion.span
              key={name}
              className="inline-flex"
              initial={reduced ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              exit={reduced ? undefined : { scale: 0, transition: exitTransition }}
              transition={reduced ? { duration: 0 } : { ...spring.bouncy, delay: count === start ? i * 0.08 : 0 }}
            >
              <Avatar name={name} size="lg" status={i < 3 ? "online" : undefined} />
            </motion.span>
          ))}
        </AnimatePresence>
        {extra > 0 && (
          <span className="glass-1 inline-flex size-14 items-center justify-center rounded-full text-sm font-semibold text-sheen-fg-muted">
            <span aria-hidden>{L.more(extra)}</span>
            <span className="sr-only">{L.moreLong(extra)}</span>
          </span>
        )}
      </AvatarGroup>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge tone="success" pulse>
          {L.here(shown.map((p) => p.split(" ")[0] ?? p))}
        </Badge>
        <Button
          variant="glass"
          size="sm"
          onClick={() => setCount((c) => (full ? start : c + 1))}
          leading={full ? undefined : <PlusIcon className="size-3.5" />}
        >
          {full ? L.reset : L.invite}
        </Button>
      </div>
    </div>
  );
}
