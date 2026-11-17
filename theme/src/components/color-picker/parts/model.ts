"use client";

import { useCallback, useState } from "react";

import { useLatest } from "../../../hooks/use-latest";
import { type FormControlProps } from "../../../lib/form";
import { hsvToRgb, normalizeColor, parseColor, rgbToHex, rgbToHsv, type ColorFormat, type HSVA } from "../color-utils";

/**
 * ColorPicker: a saturation / brightness area, hue and opacity sliders, typed values
 * (hex, RGB or HSL), swatches, copy, and the screen eyedropper where the browser has one.
 * ColorField: the same picker behind a swatch + hex text field: a glass popover from 640px
 * up, a bottom sheet on phones.
 *
 * Keyboard: the area is a 2-D slider (←/→ saturation, ↑/↓ brightness, Shift for steps of
 * 10, Page Up / Down for brightness by 10, Home / End for saturation 0 / 100); hue and
 * opacity are Base UI sliders; swatches and formats are radio groups (arrow keys).
 *
 * The value is always emitted as hex ("#7c5cff", or "#7c5cff80" with opacity). Any
 * hex / rgb() / hsl() string is accepted as input. Hue is kept while you drag through
 * greys and black, where the colour itself has none.
 *
 * Motion: the thumbs follow the pointer directly (no easing lag); the copy tick pops.
 * The colour graphics opt out of forced colours (they are content, like an image).
 */

/** A preset colour: any hex, rgb() or hsl() string, or `{ value, label }` to give it an accessible name. */
export type ColorSwatch = string | { value: string; label: string };

/** Every UI string of {@link ColorPicker}; pass a partial through its `labels` prop to translate it. */
export type ColorPickerLabels = {
  /** Accessible name of the saturation / brightness area. */
  area: string;
  /** Spoken value of the area: (saturation %, brightness %) → "Saturation 64%, brightness 100%". */
  areaValue: (saturation: number, brightness: number) => string;
  /** Accessible name of the hue slider. */
  hue: string;
  /** Spoken value of the hue slider. */
  hueValue: (degrees: number) => string;
  /** Accessible name of the opacity slider. */
  alpha: string;
  /** Spoken value of the opacity slider. */
  alphaValue: (percent: number) => string;
  /** Accessible name of the format switch, and the format names. */
  format: string;
  formats: Record<ColorFormat, string>;
  /** Accessible names of the channel inputs. */
  hex: string;
  /** Red channel input. */
  red: string;
  /** Green channel input. */
  green: string;
  /** Blue channel input. */
  blue: string;
  /** Hue channel input. */
  hueShort: string;
  /** Saturation channel input. */
  saturation: string;
  /** Lightness channel input. */
  lightness: string;
  /** Opacity channel input. */
  opacity: string;
  /** Visible one-letter captions under the channel inputs. */
  captions: { hex: string; r: string; g: string; b: string; h: string; s: string; l: string; a: string };
  /** Accessible name of the eyedropper button. */
  eyeDropper: string;
  /** Sets the accessible name of the copy button. */
  copy: string;
  /** Polite announcement after copying: (value) → "Copied #7c5cff". */
  copied: (value: string) => string;
  /** Accessible name of the swatch group. */
  swatches: string;
  /** ColorField: accessible name of the swatch button that opens the picker. */
  open: string;
  /** ColorField: picker heading (phone sheet) and accessible name when the field has no string `label`. */
  pickerTitle: string;
  /** ColorField: accessible name of the phone sheet's close button. */
  close: string;
  /** Accessible name of a swatch without its own label. */
  swatch: (value: string) => string;
};

/** The English strings of {@link ColorPicker}. Spread it to build your own set. */
export const defaultColorPickerLabels: ColorPickerLabels = {
  area: "Saturation and brightness",
  areaValue: (s, v) => `Saturation ${s}%, brightness ${v}%`,
  hue: "Hue",
  hueValue: (h) => `${h} degrees`,
  alpha: "Opacity",
  alphaValue: (a) => `${a}%`,
  format: "Colour format",
  formats: { hex: "Hex", rgb: "RGB", hsl: "HSL" },
  hex: "Hex colour",
  red: "Red",
  green: "Green",
  blue: "Blue",
  hueShort: "Hue",
  saturation: "Saturation",
  lightness: "Lightness",
  opacity: "Opacity",
  captions: { hex: "Hex", r: "R", g: "G", b: "B", h: "H", s: "S", l: "L", a: "A" },
  eyeDropper: "Pick a colour from the screen",
  copy: "Copy colour",
  copied: (value) => `Copied ${value}`,
  swatches: "Swatches",
  open: "Open colour picker",
  pickerTitle: "Choose a colour",
  close: "Close",
  swatch: (value) => value,
};

/** Props of {@link ColorPicker}. */
export type ColorPickerProps = Omit<FormControlProps<HTMLDivElement>, "required"> & {
  /** The colour (controlled): any hex, rgb() or hsl() string. */
  value?: string;
  /** The colour on mount (uncontrolled). Default: a violet. */
  defaultValue?: string;
  /** Called while the colour changes (dragging, typing), with hex. */
  onValueChange?: (value: string) => void;
  /** Called once a change is done (pointer up, Enter, blur), with hex. */
  onValueCommit?: (value: string) => void;
  /**
   * Show the opacity slider and channel.
   * @default true
   */
  alpha?: boolean;
  /** The channel format shown under the sliders (controlled): "hex", "rgb" or "hsl". */
  format?: ColorFormat;
  /**
   * The channel format on mount (uncontrolled).
   * @default "hex"
   */
  defaultFormat?: ColorFormat;
  /** Called with the new format when the format switch changes. */
  onFormatChange?: (format: ColorFormat) => void;
  /**
   * Formats offered by the switch.
   * @default ["hex", "rgb", "hsl"]
   */
  formats?: ColorFormat[];
  /** Sets the preset colours, as strings or `{ value, label }`. */
  swatches?: ColorSwatch[];
  /**
   * Offer the screen eyedropper (only shown where window.EyeDropper exists).
   * @default true
   */
  eyeDropper?: boolean;
  /**
   * Show the copy button.
   * @default true
   */
  copyButton?: boolean;
  /**
   * Disables every control in the picker.
   * @default false
   */
  disabled?: boolean;
  /**
   * "card": its own glass card. "plain": no surface, for popovers and your own layouts.
   * @default "card"
   */
  variant?: "card" | "plain";
  /** Accessible name of the whole picker group. */
  "aria-label"?: string;
  /** Any UI string (i18n). */
  labels?: Partial<ColorPickerLabels>;
  /** Adds extra classes to the outer element. */
  className?: string;
};

/** The colour the picker uses when the value cannot be parsed. @internal */
export const FALLBACK: HSVA = { h: 252, s: 64, v: 100, a: 1 };
/** The hex string of an HSVA colour. @internal */
export const hexOf = (c: HSVA) => rgbToHex(hsvToRgb(c));

/* A hairline drawn ABOVE the colour (an inset shadow would sit under the colour layer), so
   swatches close to the surface colour (white on light glass, ink on dark) keep an edge. */
/** The hairline classes drawn above a swatch colour so it keeps an edge on any surface. @internal */
export const edge =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--sheen-border)] after:content-['']";

/* Checkerboard behind translucent colours (theme ink tokens, light in both themes). */
/** The checkerboard classes shown behind translucent colours. @internal */
export const checker =
  "bg-[repeating-conic-gradient(var(--sheen-ink-200)_0%_25%,var(--sheen-ink-0)_0%_50%)] bg-[length:10px_10px] bg-center";

/** `useSyncExternalStore` subscription for a value that never changes (feature detection). */
export const subscribeNever = () => () => undefined;
/** True when the browser supports the EyeDropper API. @internal */
export const hasEyeDropper = () => "EyeDropper" in window;

/** The constructor type of the EyeDropper API. @internal */
export type EyeDropperCtor = new () => { open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }> };

/** HSV state that follows a hex value, but keeps hue / saturation where hex loses them. */
export function useColorState(
  value: string | undefined,
  defaultValue: string | undefined,
  onChange?: (hex: string) => void,
) {
  const toHsv = (v: string | undefined) => {
    const c = v ? parseColor(v) : null;
    return c ? rgbToHsv(c) : null;
  };
  const [hsva, setInner] = useState<HSVA>(() => toHsv(value ?? defaultValue) ?? FALLBACK);
  const [seen, setSeen] = useState(value);
  if (value !== undefined && value !== seen) {
    setSeen(value);
    const next = toHsv(value);
    if (next && normalizeColor(value) !== hexOf(hsva)) {
      setInner({ ...next, h: next.s === 0 || next.v === 0 ? hsva.h : next.h, s: next.v === 0 ? hsva.s : next.s });
    }
  }
  const onChangeRef = useLatest(onChange);
  const set = useCallback(
    (next: HSVA) => {
      setInner(next);
      const hex = hexOf(next);
      setSeen(hex);
      onChangeRef.current?.(hex);
    },
    [onChangeRef],
  );
  return [hsva, set] as const;
}
