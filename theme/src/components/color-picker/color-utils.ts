/**
 * Colour math for ColorPicker: parsing, conversions and formatting. Depends only on lib/math.
 *
 *   RGBA: r, g, b 0–255, a 0–1
 *   HSVA: h 0–360, s, v 0–100, a 0–1 (what the picker edits: area = s × v, slider = h)
 *   HSLA: h 0–360, s, l 0–100, a 0–1
 */

import { clamp } from "../../lib/math";

/** A colour as red, green and blue (0-255) plus alpha (0-1). */
export type RGBA = { r: number; g: number; b: number; a: number };
/** A colour as hue (0-360), saturation and value (0-100) plus alpha. */
export type HSVA = { h: number; s: number; v: number; a: number };
/** A colour as hue (0-360), saturation and lightness (0-100) plus alpha. */
export type HSLA = { h: number; s: number; l: number; a: number };
/** Text formats the colour picker can show and parse: hex, rgb() or hsl(). */
export type ColorFormat = "hex" | "rgb" | "hsl";

const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

/**
 * Converts hue (0-360), saturation and value (0-100) to 0-255 RGB; alpha passes through. Pure; no DOM
 * access, so it is safe to call on the server.
 */
export function hsvToRgb({ h, s, v, a }: HSVA): RGBA {
  const sat = s / 100;
  const val = v / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => val - val * sat * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return { r: round(f(5) * 255), g: round(f(3) * 255), b: round(f(1) * 255), a };
}

/**
 * Converts 0-255 RGB to hue (0-360), saturation and value (0-100); alpha passes through. Pure; no DOM
 * access, so it is safe to call on the server.
 */
export function rgbToHsv({ r, g, b, a }: RGBA): HSVA {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100, a };
}

/**
 * Converts 0-255 RGB to hue (0-360), saturation and lightness (0-100); alpha passes through. Pure; no
 * DOM access, so it is safe to call on the server.
 */
export function rgbToHsl({ r, g, b, a }: RGBA): HSLA {
  const { h, s: sv, v } = rgbToHsv({ r, g, b, a });
  const l = v * (1 - sv / 200);
  const s = l === 0 || l === 100 ? 0 : ((v - l) / Math.min(l, 100 - l)) * 100;
  return { h, s, l, a };
}

/**
 * Converts hue (0-360), saturation and lightness (0-100) to 0-255 RGB; alpha passes through. Pure; no
 * DOM access, so it is safe to call on the server.
 */
export function hslToRgb({ h, s, l, a }: HSLA): RGBA {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const m = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - m * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: round(f(0) * 255), g: round(f(8) * 255), b: round(f(4) * 255), a };
}

const hex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");

/** "#7c5cff", or "#7c5cff80" when not fully opaque. */
export function rgbToHex({ r, g, b, a }: RGBA): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;
}

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa (with or without #), rgb()/rgba() and hsl()/hsla(). */
export function parseColor(input: string): RGBA | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;

  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if (hex?.[1]) {
    let body = hex[1];
    if (body.length <= 4) body = Array.from(body, (c) => c + c).join("");
    const n = (i: number) => parseInt(body.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: body.length === 8 ? round(n(6) / 255, 3) : 1 };
  }

  const fn = /^(rgba?|hsla?)\(\s*([^)]*)\)$/.exec(text);
  if (!fn?.[1] || fn[2] === undefined) return null;
  const parts = fn[2]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((p) => p.trim());
  if (parts.length < 3 || parts.length > 4) return null;
  const num = (p: string | undefined, scale: number) => {
    if (p === undefined) return NaN;
    if (p.endsWith("%")) return (parseFloat(p) / 100) * scale;
    return parseFloat(p.replace(/deg$/, ""));
  };
  const alphaPart = parts[3];
  const a = alphaPart === undefined ? 1 : alphaPart.endsWith("%") ? parseFloat(alphaPart) / 100 : parseFloat(alphaPart);
  if (Number.isNaN(a)) return null;

  if (fn[1].startsWith("rgb")) {
    const [r, g, b] = [num(parts[0], 255), num(parts[1], 255), num(parts[2], 255)];
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r: clamp(round(r), 0, 255), g: clamp(round(g), 0, 255), b: clamp(round(b), 0, 255), a: clamp(a, 0, 1) };
  }
  const h = num(parts[0], 360);
  const s = parseFloat(parts[1] ?? "");
  const l = parseFloat(parts[2] ?? "");
  if ([h, s, l].some(Number.isNaN)) return null;
  return hslToRgb({ h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100), a: clamp(a, 0, 1) });
}

/** Normalised hex of any parsable colour (for comparisons), or null. */
export function normalizeColor(input: string): string | null {
  const rgba = parseColor(input);
  return rgba ? rgbToHex(rgba) : null;
}

/** The colour as text in a format: "#7c5cff", "rgb(124 92 255 / 50%)", "hsl(252 100% 68%)". */
export function formatColor(rgba: RGBA, format: ColorFormat): string {
  if (format === "hex") return rgbToHex(rgba);
  const alpha = rgba.a < 1 ? ` / ${round(rgba.a * 100)}%` : "";
  if (format === "rgb") return `rgb(${rgba.r} ${rgba.g} ${rgba.b}${alpha})`;
  const { h, s, l } = rgbToHsl(rgba);
  return `hsl(${round(h)} ${round(s)}% ${round(l)}%${alpha})`;
}

/** WCAG relative luminance (0–1), ignoring alpha. */
export function luminance({ r, g, b }: RGBA): number {
  const lin = (c: number) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Whether dark marks (text, a tick) read better than light ones on this colour. */
export function prefersDarkForeground(rgba: RGBA): boolean {
  // Contrast with black vs. white: pick the larger.
  const L = luminance(rgba);
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05);
}
