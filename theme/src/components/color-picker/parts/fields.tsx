"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Slider } from "@base-ui/react/slider";

import { cn } from "../../../lib/cn";
import { clamp } from "../../../lib/math";
import { useLatest } from "../../../hooks/use-latest";
import {
  hsvToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  type ColorFormat,
  type HSVA,
  type RGBA,
} from "../color-utils";
import { type ColorPickerLabels } from "./model";

/* ---------- area ---------- */

/** The saturation and value area with a draggable thumb. @internal */
export function ColorArea({
  hsva,
  disabled,
  labels,
  onChange,
  onCommit,
}: {
  hsva: HSVA;
  disabled: boolean;
  labels: ColorPickerLabels;
  onChange: (next: HSVA) => void;
  onCommit: (next: HSVA) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const latestRef = useLatest(hsva);

  function fromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const next = {
      ...latestRef.current,
      s: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp(100 - ((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
    latestRef.current = next;
    onChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 1;
    const { s, v } = hsva;
    let next: Partial<HSVA>;
    switch (event.key) {
      case "ArrowLeft":
        next = { s: clamp(s - step, 0, 100) };
        break;
      case "ArrowRight":
        next = { s: clamp(s + step, 0, 100) };
        break;
      case "ArrowUp":
        next = { v: clamp(v + step, 0, 100) };
        break;
      case "ArrowDown":
        next = { v: clamp(v - step, 0, 100) };
        break;
      case "PageUp":
        next = { v: clamp(v + 10, 0, 100) };
        break;
      case "PageDown":
        next = { v: clamp(v - 10, 0, 100) };
        break;
      case "Home":
        next = { s: 0 };
        break;
      case "End":
        next = { s: 100 };
        break;
      default:
        return;
    }
    event.preventDefault();
    const merged = { ...hsva, ...next };
    onChange(merged);
    onCommit(merged);
  }

  const s = Math.round(hsva.s);
  const v = Math.round(hsva.v);
  const opaque = hsvToRgb({ ...hsva, a: 1 });

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      dir="ltr"
      // Dragging here never swipes a surrounding bottom sheet closed.
      data-base-ui-swipe-ignore=""
      aria-label={labels.area}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={s}
      aria-valuetext={labels.areaValue(s, v)}
      aria-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus({ preventScroll: true });
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
      }}
      onPointerUp={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit(latestRef.current);
      }}
      onKeyDown={onKeyDown}
      style={{ backgroundColor: `hsl(${hsva.h} 100% 50%)` }}
      className={cn(
        "group/area relative h-40 w-full [container-type:size] cursor-crosshair touch-none rounded-sheen-md select-none forced-color-adjust-none aria-disabled:opacity-55",
        "shadow-[inset_0_0_0_1px_var(--sheen-border)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(to_right,white,transparent)]"
      />
      <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(to_top,black,transparent)]" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 size-5 rounded-full border-[3px] border-(--sheen-ink-0)",
          "shadow-[0_0_0_1px_var(--sheen-shadow-far),0_2px_8px_var(--sheen-shadow-far)]",
          "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out",
          "motion-ok:group-focus-visible/area:scale-125 motion-ok:group-active/area:scale-110",
        )}
        // Placed by transform (cq units are the area's own size, 0.625rem is half the thumb): moving it never lays out again.
        style={{
          translate: `calc(${hsva.s}cqw - 0.625rem) calc(${100 - hsva.v}cqh - 0.625rem)`,
          backgroundColor: rgbToHex(opaque),
        }}
      />
    </div>
  );
}

/* ---------- hue / opacity sliders ---------- */

/** The gradient behind the hue slider. @internal */
export const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";

/** A slider for one colour channel. @internal */
export function ChannelSlider({
  label,
  value,
  max,
  valueText,
  disabled,
  trackClassName,
  trackStyle,
  overlay,
  thumbColor,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  max: number;
  valueText: (value: number) => string;
  disabled: boolean;
  trackClassName?: string;
  trackStyle?: CSSProperties;
  overlay?: string;
  thumbColor: string;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  return (
    <Slider.Root
      dir="ltr"
      value={value}
      min={0}
      max={max}
      step={1}
      largeStep={max === 360 ? 15 : 10}
      thumbAlignment="edge"
      disabled={disabled}
      onValueChange={(v) => onChange(v)}
      onValueCommitted={(v) => onCommit(v)}
      className="w-full data-disabled:opacity-55"
    >
      {/* py makes the control a 44px-tall touch target on coarse pointers. */}
      <Slider.Control
        // Horizontal drags belong to the slider; vertical ones can still swipe a bottom sheet.
        data-base-ui-swipe-ignore="x"
        className="flex w-full cursor-pointer touch-none items-center py-1 select-none any-pointer-coarse:py-4"
      >
        <Slider.Track
          className={cn(
            "relative h-3 w-full rounded-sheen-full shadow-[inset_0_0_0_1px_var(--sheen-border)] forced-color-adjust-none",
            trackClassName,
          )}
          style={trackStyle}
        >
          {overlay && <span aria-hidden className={cn("absolute inset-0 rounded-[inherit]", overlay)} />}
          <Slider.Thumb
            aria-label={label}
            getAriaValueText={(_, v) => valueText(v)}
            className={cn(
              "size-5 rounded-full border-[3px] border-(--sheen-ink-0) forced-color-adjust-none",
              "shadow-[0_0_0_1px_var(--sheen-shadow-far),0_2px_6px_var(--sheen-shadow-far)]",
              "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out motion-ok:hover:scale-110 motion-ok:data-dragging:scale-115",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sheen-focus",
            )}
            style={{ backgroundColor: thumbColor }}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

/* ---------- typed values ---------- */

/** The numeric inputs of the active colour model. @internal */
export function ChannelInputs({
  format,
  hsva,
  alpha,
  disabled,
  labels,
  onChange,
  onCommit,
}: {
  format: ColorFormat;
  hsva: HSVA;
  alpha: boolean;
  disabled: boolean;
  labels: ColorPickerLabels;
  onChange: (next: HSVA) => void;
  onCommit: (next: HSVA) => void;
}) {
  const rgba = hsvToRgb(hsva);
  const a = Math.round(hsva.a * 100);
  const set = (next: HSVA, done: boolean) => {
    onChange(next);
    if (done) onCommit(next);
  };
  const fromRgb = (patch: Partial<RGBA>) => {
    const next = rgbToHsv({ ...rgba, ...patch });
    // Keep the hue when the new colour is grey.
    return { ...next, h: next.s === 0 ? hsva.h : next.h };
  };
  const alphaInput = alpha && (
    <NumberChannel
      label={labels.opacity}
      caption={labels.captions.a}
      value={a}
      max={100}
      disabled={disabled}
      onValue={(n, done) => set({ ...hsva, a: n / 100 }, done)}
    />
  );

  if (format === "hex") {
    return (
      <div className={cn("grid gap-2", alpha ? "grid-cols-[minmax(0,1fr)_3.75rem]" : "grid-cols-1")}>
        <HexChannel
          label={labels.hex}
          caption={labels.captions.hex}
          hex={rgbToHex({ ...rgba, a: 1 })}
          disabled={disabled}
          onValue={(c, done, withAlpha) => {
            const next = rgbToHsv(c);
            // 4 / 8 digits carry their own opacity (even "ff"); 3 / 6 digits keep the current one.
            set({ ...next, h: next.s === 0 ? hsva.h : next.h, a: withAlpha ? c.a : hsva.a }, done);
          }}
        />
        {alphaInput}
      </div>
    );
  }

  if (format === "rgb") {
    return (
      <div className={cn("grid gap-2", alpha ? "grid-cols-4" : "grid-cols-3")}>
        <NumberChannel
          label={labels.red}
          caption={labels.captions.r}
          value={rgba.r}
          max={255}
          disabled={disabled}
          onValue={(n, done) => set(fromRgb({ r: n }), done)}
        />
        <NumberChannel
          label={labels.green}
          caption={labels.captions.g}
          value={rgba.g}
          max={255}
          disabled={disabled}
          onValue={(n, done) => set(fromRgb({ g: n }), done)}
        />
        <NumberChannel
          label={labels.blue}
          caption={labels.captions.b}
          value={rgba.b}
          max={255}
          disabled={disabled}
          onValue={(n, done) => set(fromRgb({ b: n }), done)}
        />
        {alphaInput}
      </div>
    );
  }

  const hsl = rgbToHsl(rgba);
  const fromHsl = (patch: Partial<{ h: number; s: number; l: number }>) => {
    const merged = { h: Math.round(hsva.h), s: Math.round(hsl.s), l: Math.round(hsl.l), ...patch };
    const c = parseColor(`hsl(${merged.h} ${merged.s}% ${merged.l}%)`);
    if (!c) return hsva;
    const next = rgbToHsv({ ...c, a: hsva.a });
    return { ...next, h: merged.h };
  };
  return (
    <div className={cn("grid gap-2", alpha ? "grid-cols-4" : "grid-cols-3")}>
      <NumberChannel
        label={labels.hueShort}
        caption={labels.captions.h}
        value={Math.round(hsva.h)}
        max={360}
        disabled={disabled}
        onValue={(n, done) => set(fromHsl({ h: n }), done)}
      />
      <NumberChannel
        label={labels.saturation}
        caption={labels.captions.s}
        value={Math.round(hsl.s)}
        max={100}
        disabled={disabled}
        onValue={(n, done) => set(fromHsl({ s: n }), done)}
      />
      <NumberChannel
        label={labels.lightness}
        caption={labels.captions.l}
        value={Math.round(hsl.l)}
        max={100}
        disabled={disabled}
        onValue={(n, done) => set(fromHsl({ l: n }), done)}
      />
      {alphaInput}
    </div>
  );
}

/** The class string of a channel number input. @internal */
export const channelInput = cn(
  "glass-1 h-9 w-full min-w-0 rounded-sheen-sm px-2 text-center font-sheen-mono text-sm text-sheen-fg tabular-nums outline-none",
  "any-pointer-coarse:h-11 any-pointer-coarse:text-base",
  "transition-[border-color,box-shadow] duration-(--sheen-duration-fast) ease-sheen-out",
  "focus:border-sheen-accent focus:shadow-[0_0_0_3px_var(--sheen-ring)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-sheen-focus",
  "aria-invalid:border-sheen-danger disabled:cursor-not-allowed disabled:opacity-55",
);

/** One captioned channel input. @internal */
export function Channel({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-1">
      {children}
      <span aria-hidden className="text-2xs font-medium tracking-wide text-sheen-fg-muted uppercase">
        {caption}
      </span>
    </span>
  );
}

/** A number box: type, or use ↑ / ↓ (Shift for 10). Invalid text reverts on blur. */
export function NumberChannel({
  label,
  caption,
  value,
  max,
  disabled,
  onValue,
}: {
  label: string;
  caption: string;
  value: number;
  max: number;
  disabled: boolean;
  onValue: (value: number, done: boolean) => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? String(value);
  const parse = (t: string) => {
    if (!/^\s*\d{1,3}\s*$/.test(t)) return null;
    const n = Number(t);
    return n >= 0 && n <= max ? n : null;
  };
  const invalid = text !== null && parse(text) === null;

  return (
    <Channel caption={caption}>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        value={shown}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setText(e.target.value);
          const n = parse(e.target.value);
          if (n !== null) onValue(n, false);
        }}
        onBlur={() => {
          if (text !== null) {
            const n = parse(text);
            if (n !== null) onValue(n, true);
          }
          setText(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
            return;
          }
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const delta = (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1);
          const n = Math.min(max, Math.max(0, (parse(shown) ?? value) + delta));
          setText(null);
          onValue(n, true);
        }}
        className={channelInput}
      />
    </Channel>
  );
}

/** The hex text input with validation. @internal */
export function HexChannel({
  label,
  caption,
  hex,
  disabled,
  onValue,
}: {
  label: string;
  caption: string;
  hex: string;
  disabled: boolean;
  /** `withAlpha`: the typed value had 4 or 8 digits. */
  onValue: (color: RGBA, done: boolean, withAlpha: boolean) => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? hex.slice(1).toUpperCase();
  const digits = (t: string) => t.trim().replace(/^#/, "").length;
  const isHex = (t: string) => /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t.trim());
  const invalid = text !== null && !isHex(text);

  return (
    <Channel caption={caption}>
      <span className="relative flex w-full">
        {/* z-1: the glass input (position: relative) would otherwise paint over it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-2.5 z-1 flex items-center font-sheen-mono text-sm text-sheen-fg-subtle any-pointer-coarse:text-base"
        >
          #
        </span>
        <input
          type="text"
          aria-label={label}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={shown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={9}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const t = e.target.value;
            setText(t);
            // Live update on full 6 / 8-digit values; short forms apply on Enter or blur.
            const body = t.trim().replace(/^#/, "");
            if ((body.length === 6 || body.length === 8) && isHex(body)) {
              const c = parseColor(body);
              if (c) onValue(c, false, body.length === 8);
            }
          }}
          onBlur={() => {
            if (text !== null && isHex(text)) {
              const c = parseColor(text);
              const n = digits(text);
              if (c) onValue(c, true, n === 4 || n === 8);
            }
            setText(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape" && text !== null) {
              e.preventDefault();
              e.stopPropagation();
              setText(null);
            }
          }}
          className={cn(channelInput, "ps-6 text-start uppercase")}
        />
      </span>
    </Channel>
  );
}
