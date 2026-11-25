"use client";

import { CheckIcon, CopyIcon } from "../status-icons/icons";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../lib/cn";
import { fieldHeight, type FieldSize } from "../../lib/field-size";
import { useControllable } from "../../hooks/use-controllable";
import { groupBlur, joinIds, useFocusProxyRef, type FormControlProps } from "../../lib/form";
import { duration, ease, spring } from "../../motion/tokens";
import { useSheenReducedMotion } from "../../hooks/use-preferences";
import { PICKER_SHEET_QUERY, PickerSurface, useMediaQuery } from "../date-picker/picker-surface";
import {
  formatColor,
  hsvToRgb,
  normalizeColor,
  parseColor,
  prefersDarkForeground,
  rgbToHex,
  rgbToHsv,
  type ColorFormat,
  type HSVA,
} from "./color-utils";

import {
  defaultColorPickerLabels,
  type ColorPickerProps,
  hexOf,
  edge,
  checker,
  subscribeNever,
  hasEyeDropper,
  type EyeDropperCtor,
  useColorState,
} from "./parts/model";
import { ColorArea, HUE_GRADIENT, ChannelSlider, ChannelInputs } from "./parts/fields";
import { hexWithAlpha, IconButton, EyedropperIcon } from "./parts/bits";

export {
  type ColorSwatch,
  type ColorPickerLabels,
  defaultColorPickerLabels,
  type ColorPickerProps,
} from "./parts/model";
/**
 * A colour picker: a saturation / brightness area, hue and opacity sliders, typed values (hex,
 * RGB or HSL), swatches, copy, and the screen eyedropper where the browser has one. The value
 * is always emitted as hex ("#7c5cff", or "#7c5cff80" with opacity); any hex, rgb() or hsl()
 * string is accepted as input. For a form field, use {@link ColorField}.
 *
 * Props: see {@link ColorPickerProps} (`value` / `defaultValue` / `onValueChange` /
 * `onValueCommit`, `alpha` true, `format` / `defaultFormat` "hex" / `onFormatChange`, `formats`,
 * `swatches`, `eyeDropper` true, `copyButton` true, `disabled`, `variant` "card", `aria-label`,
 * `labels`, `className`).
 *
 * Keyboard: The area is a 2-D slider: Left / Right change saturation, Up / Down brightness (Shift for steps of 10), Page Up / Down brightness by 10, Home / End saturation 0 / 100. Hue and opacity are sliders (arrow keys, Page Up / Down, Home / End); swatches and formats are radio groups (arrow keys).
 * Accessibility: The area, sliders and inputs each have a name and a spoken value ("Saturation 64%, brightness 100%"); channel inputs show one-letter captions; copy announces the copied value politely. The colour graphics opt out of forced colors (they are content, like an image), while the controls around them keep system colors.
 * Glass: The "card" variant is one glass card; "plain" has no surface so it can sit in a popover or your own layout.
 * Motion: Thumbs follow the pointer directly with no easing lag; the copy tick pops (not under reduced motion).
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ColorPicker } from "@sheenui/theme";
 *
 * export function Brand() {
 *   const [color, setColor] = useState("#7c5cff");
 *   return <ColorPicker value={color} onValueChange={setColor} swatches={["#7c5cff", "#0ea5e9"]} aria-label="Brand colour" />;
 * }
 * ```
 *
 * @see /forms/color-picker
 */
export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  alpha = true,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  formats = ["hex", "rgb", "hsl"],
  swatches,
  eyeDropper = true,
  copyButton = true,
  disabled = false,
  variant = "card",
  "aria-label": ariaLabel,
  labels: labelsProp,
  className,
  name,
  ref,
  onBlur,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: ColorPickerProps) {
  const labels = {
    ...defaultColorPickerLabels,
    ...labelsProp,
    captions: { ...defaultColorPickerLabels.captions, ...labelsProp?.captions },
  };
  const [hsva, setHsva] = useColorState(value, defaultValue, onValueChange);
  const [innerFormat, setInnerFormat] = useState<ColorFormat>(defaultFormat);
  const format = formatProp ?? innerFormat;
  const setFormat = (f: ColorFormat) => {
    if (formatProp === undefined) setInnerFormat(f);
    onFormatChange?.(f);
  };
  const reduced = useSheenReducedMotion();
  const rgba = hsvToRgb(hsva);
  const hex = rgbToHex(rgba);
  const rootRef = useFocusProxyRef(
    ref,
    '[role="slider"]:not([aria-disabled="true"])',
    "input:not(:disabled)",
    "button:not(:disabled)",
  );
  const commit = (c: HSVA = hsva) => onValueCommit?.(hexOf(c));

  // ---- eyedropper (Chromium) ----
  const canPick = useSyncExternalStore(subscribeNever, hasEyeDropper, () => false);
  async function pickFromScreen() {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      const c = parseColor(result.sRGBHex);
      if (c) {
        const next = { ...rgbToHsv(c), a: hsva.a };
        setHsva(next);
        commit(next);
      }
    } catch {
      /* the user pressed Escape */
    }
  }

  // ---- copy ----
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  async function copy() {
    const text = formatColor(rgba, format);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setAnnouncement(labels.copied(text));
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setCopied(false);
        setAnnouncement("");
      }, 1600);
    } catch {
      /* clipboard blocked: nothing to undo */
    }
  }

  // ---- swatches ----
  const swatchList = (swatches ?? [])
    .map((s) => (typeof s === "string" ? { value: s, label: undefined } : s))
    .map((s) => ({ ...s, hex: normalizeColor(s.value) }))
    .filter((s): s is { value: string; label: string | undefined; hex: string } => s.hex !== null);
  const currentSwatch = swatchList.find((s) => s.hex === hex)?.hex ?? null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onBlur only reports focus leaving the group to a form library; the group has no interaction of its own
    <div
      role="group"
      ref={rootRef}
      onBlur={groupBlur(onBlur)}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid === true || ariaInvalid === "true" ? true : undefined}
      aria-describedby={joinIds(ariaDescribedBy)}
      data-slot="color-picker"
      className={cn(
        "flex w-full max-w-[18rem] min-w-0 flex-col gap-3",
        variant === "card" && "glass-2 rounded-sheen-xl p-3",
        // Each control dims itself: fading this wrapper would also flatten the glass inputs' blur.
        disabled && "pointer-events-none",
        className,
      )}
    >
      <ColorArea hsva={hsva} disabled={disabled} labels={labels} onChange={setHsva} onCommit={commit} />

      <div className="flex items-center gap-3">
        {/* Current colour over a checkerboard, so opacity shows. */}
        <span
          aria-hidden
          className={cn(
            "relative size-10 shrink-0 overflow-hidden rounded-full",
            edge,
            checker,
            disabled && "opacity-55",
          )}
        >
          <span className="absolute inset-0 forced-color-adjust-none" style={{ backgroundColor: hexWithAlpha(rgba) }} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <ChannelSlider
            label={labels.hue}
            value={Math.round(hsva.h)}
            max={360}
            valueText={(v) => labels.hueValue(v)}
            disabled={disabled}
            trackStyle={{ backgroundImage: HUE_GRADIENT }}
            thumbColor={`hsl(${hsva.h} 100% 50%)`}
            onChange={(h) => setHsva({ ...hsva, h })}
            onCommit={(h) => commit({ ...hsva, h })}
          />
          {alpha && (
            <ChannelSlider
              label={labels.alpha}
              value={Math.round(hsva.a * 100)}
              max={100}
              valueText={(v) => labels.alphaValue(v)}
              disabled={disabled}
              trackClassName={checker}
              trackStyle={{ ["--to" as string]: hex.slice(0, 7) }}
              overlay="bg-[linear-gradient(to_right,transparent,var(--to))]"
              thumbColor={hexWithAlpha(rgba)}
              onChange={(a) => setHsva({ ...hsva, a: a / 100 })}
              onCommit={(a) => commit({ ...hsva, a: a / 100 })}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {formats.length > 1 ? (
          <RadioGroup
            aria-label={labels.format}
            value={format}
            onValueChange={(f) => setFormat(f)}
            disabled={disabled}
            className="flex rounded-sheen-sm bg-sheen-hover p-0.5 data-disabled:opacity-55"
          >
            {formats.map((f) => (
              <Radio.Root
                key={f}
                value={f}
                className={cn(
                  "flex h-7 cursor-pointer items-center justify-center rounded-[calc(var(--sheen-radius-sm)-2px)] px-2.5 text-xs font-semibold text-sheen-fg-muted select-none any-pointer-coarse:min-w-11",
                  "any-pointer-coarse:h-11 touch-manipulation",
                  "transition-[background-color,color] duration-(--sheen-duration-fast) hover:text-sheen-fg",
                  "data-checked:bg-sheen-surface data-checked:text-sheen-fg data-checked:shadow-[0_1px_2px_var(--sheen-shadow-near)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-sheen-focus",
                  "forced-colors:data-checked:outline-2 forced-colors:data-checked:outline-[Highlight]",
                )}
              >
                {labels.formats[f]}
              </Radio.Root>
            ))}
          </RadioGroup>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          {eyeDropper && canPick && (
            <IconButton label={labels.eyeDropper} onClick={pickFromScreen} disabled={disabled}>
              <EyedropperIcon className="size-4" />
            </IconButton>
          )}
          {copyButton && (
            <IconButton label={labels.copy} onClick={copy} disabled={disabled}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "done" : "copy"}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, transition: reduced ? { duration: duration.fast } : spring.bouncy }}
                  exit={{
                    opacity: 0,
                    scale: reduced ? 1 : 0.5,
                    transition: { duration: duration.exit, ease: ease.exit },
                  }}
                  className={cn("flex", copied && "text-sheen-success-text")}
                >
                  {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </IconButton>
          )}
        </div>
      </div>

      <ChannelInputs
        format={format}
        hsva={hsva}
        alpha={alpha}
        disabled={disabled}
        labels={labels}
        onChange={setHsva}
        onCommit={commit}
      />

      {swatchList.length > 0 && (
        <RadioGroup
          aria-label={labels.swatches}
          value={currentSwatch}
          onValueChange={(v) => {
            const c = typeof v === "string" ? parseColor(v) : null;
            if (!c) return;
            const next = rgbToHsv(c);
            setHsva(next);
            commit(next);
          }}
          disabled={disabled}
          className="flex flex-wrap gap-2 border-t border-sheen-border pt-3 any-pointer-coarse:gap-1"
        >
          {swatchList.map((s) => {
            const c = parseColor(s.hex);
            if (!c) return null;
            return (
              <Radio.Root
                key={s.hex}
                value={s.hex}
                aria-label={s.label ?? labels.swatch(s.value)}
                className={cn(
                  "group/swatch relative size-6 cursor-pointer overflow-hidden rounded-sheen-sm",
                  edge,
                  "any-pointer-coarse:size-11 touch-manipulation forced-color-adjust-none",
                  "motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-fast) motion-ok:ease-sheen-out motion-ok:hover:scale-110",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                  "data-checked:outline-2 data-checked:outline-offset-2 data-checked:outline-sheen-accent-border",
                  "forced-colors:border forced-colors:border-[CanvasText] forced-colors:data-checked:outline-[Highlight]",
                  "data-disabled:cursor-not-allowed data-disabled:opacity-55",
                  checker,
                )}
              >
                <span aria-hidden className="absolute inset-0" style={{ backgroundColor: hexWithAlpha(c) }} />
                <Radio.Indicator
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    prefersDarkForeground(c) ? "text-(--sheen-ink-950)" : "text-(--sheen-ink-0)",
                  )}
                >
                  <CheckIcon className="size-3.5" />
                </Radio.Indicator>
              </Radio.Root>
            );
          })}
        </RadioGroup>
      )}

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
      {name && <input type="hidden" name={name} value={hexOf(hsva)} />}
    </div>
  );
}

/* ---------- ColorField ---------- */

/** Props of {@link ColorField}. The {@link ColorPickerProps} (minus `variant`, `className`, `aria-label`) and the ones below. */
export type ColorFieldProps = Omit<
  ColorPickerProps,
  "variant" | "className" | "aria-label" | "ref" | "onBlur" | "name"
> &
  Pick<FormControlProps<HTMLInputElement>, "ref" | "onBlur" | "name" | "required"> & {
    /** Height, consistent across every form control: "sm" 32px, "md" 40px, "lg" 48px (sm and md are 44px on touch screens), the same scale as Button. Default "md". */
    size?: FieldSize;
    /** Visible label above the field. Without one, pass `aria-label`. */
    label?: ReactNode;
    /** Helper text under the field; replaced by `error` when there is one. */
    description?: ReactNode;
    /** Shows an error message under the field. */
    error?: ReactNode;
    /** Submits the hex value with a form. */
    name?: string;
    /** Sets the id of the text input. */
    id?: string;
    /** Accessible name of the text input when there is no `label`. */
    "aria-label"?: string;
    /**
     * Sets the placeholder of the text input.
     * @default "#000000"
     */
    placeholder?: string;
    /** Adds extra classes to the outer wrapper. */
    className?: string;
  };

/**
 * A hex text field with a swatch button that opens the full {@link ColorPicker} (a glass popover
 * from 640px up, a bottom sheet on phones). Use it in forms; `name` submits the hex value.
 *
 * Props: see {@link ColorFieldProps} (`label`, `description`, `error`, `name`, `id`, `aria-label`,
 * `labels` (including `open`, `pickerTitle` and `close`), `placeholder`, `disabled`, `className`, `defaultValue`
 * "#7c5cff", plus the picker options such as `alpha`, `swatches` and `formats`).
 *
 * Keyboard: Tab reaches the text field and the swatch button; type a hex value and press Enter or leave the field to apply it (Escape discards). Enter or Space on the swatch opens the picker and Escape closes it. Inside, the {@link ColorPicker} keys apply.
 * Accessibility: The label is tied to the input; `description` and `error` are linked with `aria-describedby` and the error uses `role="alert"`. The picker opens in a Base UI popover, or a drawer on phones with a labelled close button.
 * Glass: One `glass-1` field; the picker opens as a glass popover or sheet.
 * Motion: The popover and the phone drawer animate in and out; the swatch and thumbs follow the pointer directly.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { ColorField } from "@sheenui/theme";
 *
 * export function AccentField() {
 *   const [accent, setAccent] = useState("#7c5cff");
 *   return <ColorField label="Accent colour" description="Used for buttons and links." value={accent} onValueChange={setAccent} name="accent" />;
 * }
 * ```
 *
 * @see /forms/color-picker
 */
export function ColorField({
  value: valueProp,
  defaultValue = "#7c5cff",
  onValueChange,
  onValueCommit,
  label,
  description,
  error,
  name,
  id,
  "aria-label": ariaLabel,
  labels: labelsProp,
  placeholder = "#000000",
  disabled = false,
  className,
  required,
  size = "md",
  ref,
  onBlur,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...pickerProps
}: ColorFieldProps) {
  const { open: openLabel, pickerTitle, close: closeLabel } = { ...defaultColorPickerLabels, ...labelsProp };
  const [value, change] = useControllable(valueProp, defaultValue, onValueChange);
  const auto = useId();
  const inputId = id ?? `${auto}-input`;
  const labelId = `${auto}-label`;
  const helperId = `${auto}-helper`;
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const phone = useMediaQuery(PICKER_SHEET_QUERY);
  const title = typeof label === "string" ? label : (ariaLabel ?? pickerTitle);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  // Open under the whole field, clear of the helper text (or above it, clear of the label).
  const sideOffset = useCallback(({ side }: { side: string }) => {
    const wrap = rootRef.current?.getBoundingClientRect();
    const field = fieldRef.current?.getBoundingClientRect();
    if (!wrap || !field) return 8;
    if (side === "bottom") return 8 + Math.max(0, wrap.bottom - field.bottom);
    if (side === "top") return 8 + Math.max(0, field.top - wrap.top);
    return 8;
  }, []);
  const rgba = parseColor(value);
  const hex = rgba ? rgbToHex(rgba) : value;

  return (
    <div ref={rootRef} data-slot="color-field" className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label id={labelId} htmlFor={inputId} className="w-fit text-sm font-medium text-sheen-fg">
          {label}
        </label>
      )}
      <div
        ref={fieldRef}
        className={cn(
          fieldHeight[size],
          "glass-1 flex w-full items-center gap-2 rounded-sheen-md ps-1.5 pe-3",
          "transition-[box-shadow,border-color] duration-(--sheen-duration-fast) ease-sheen-out",
          "focus-within:border-sheen-accent focus-within:shadow-[0_0_0_4px_var(--sheen-ring)]",
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-sheen-focus",
          error && "border-sheen-danger",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <PickerSurface
          phone={phone}
          open={open}
          onOpenChange={setOpen}
          title={title}
          closeLabel={closeLabel}
          anchor={fieldRef}
          sideOffset={sideOffset}
          trapFocus={false}
          // Land on the saturation / brightness area.
          initialFocusSelector='[role="slider"]'
          popupClassName="w-[18.5rem]"
          trigger={
            <button
              type="button"
              aria-label={openLabel}
              disabled={disabled}
              className={cn(
                "relative size-8 shrink-0 cursor-pointer rounded-sheen-sm forced-color-adjust-none",
                edge,
                // 44px hit area on touch screens (no overflow clipping, so it stays clickable).
                "any-pointer-coarse:before:absolute any-pointer-coarse:before:-inset-1.5 any-pointer-coarse:before:content-['']",
                "touch-manipulation motion-ok:transition-[scale] motion-ok:duration-(--sheen-duration-fast) motion-ok:hover:scale-105 motion-ok:active:scale-95",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
                "forced-colors:border forced-colors:border-[CanvasText]",
                checker,
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-[inherit]"
                style={{ backgroundColor: rgba ? hexWithAlpha(rgba) : "transparent" }}
              />
            </button>
          }
        >
          <ColorPicker
            {...pickerProps}
            labels={labelsProp}
            variant="plain"
            value={value}
            onValueChange={change}
            onValueCommit={onValueCommit}
            aria-label={title}
            className="max-w-none"
          />
        </PickerSurface>
        <input
          id={inputId}
          ref={ref}
          type="text"
          disabled={disabled}
          required={required}
          spellCheck={false}
          autoComplete="off"
          placeholder={placeholder}
          aria-label={label ? undefined : ariaLabel}
          aria-describedby={joinIds(ariaDescribedBy, (Boolean(description) || Boolean(error)) && helperId)}
          aria-invalid={
            error || ariaInvalid === true || ariaInvalid === "true" || (text !== null && !normalizeColor(text))
              ? true
              : undefined
          }
          value={text ?? hex.toUpperCase()}
          onChange={(e) => {
            setText(e.target.value);
            const body = e.target.value.trim().replace(/^#/, "");
            const parsed = (body.length === 6 || body.length === 8) && normalizeColor(body);
            if (parsed) change(parsed);
          }}
          onBlur={(event) => {
            const parsed = text !== null ? normalizeColor(text) : null;
            if (parsed) {
              change(parsed);
              onValueCommit?.(parsed);
            }
            setText(null);
            onBlur?.(event);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="h-full min-w-0 flex-1 bg-transparent font-sheen-mono text-sm text-sheen-fg uppercase outline-none placeholder:text-sheen-fg-subtle any-pointer-coarse:-my-px any-pointer-coarse:h-[calc(100%+2px)] any-pointer-coarse:text-base"
        />
      </div>
      {(Boolean(error) || description) && (
        <p
          id={helperId}
          role={error ? "alert" : undefined}
          className={cn("text-xs", error ? "font-medium text-sheen-danger-text" : "text-sheen-fg-muted")}
        >
          {error ?? description}
        </p>
      )}
      {name && <input type="hidden" name={name} value={hex} />}
    </div>
  );
}
