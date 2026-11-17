import { fitTicks } from "../chart-fit";
import { axisFormat, clamp, linear, thinLabels } from "../chart-utils";
import { textWidth } from "../chart-pointer";
import { axisLabelsShown, edgeAnchor } from "../histogram/model";
import { chartMirror, fitText } from "../kits/histogram-kit/kit";
import { CHAR_W, HEAD_R, type Row } from "./model";

/** What the lollipop layout depends on. @internal */
export type LollipopLayoutInput = {
  baseline: number;
  rows: Row[];
  hasRef: boolean;
  refValue: number | undefined;
  formatProp: ((v: number) => string) | undefined;
  showValues: boolean;
  format: (v: number) => string;
  horizontal: boolean;
  widestName: number;
  width: number;
  n: number;
  rowH: number;
  dock: number;
  valueLabel: string | undefined;
  height: number;
  rtl: boolean;
};

/**
 * Everything the lollipop chart lays out that does not depend on which item is being read: value domain,
 * margins, scale, ticks and the placement of every stem, head, value and name.
 * @internal
 */
export function computeLollipopLayout(p: LollipopLayoutInput) {
  const { baseline, rows, hasRef, refValue, formatProp, showValues, format, horizontal, widestName } = p;
  const { width, n, rowH, dock, valueLabel, height, rtl } = p;
  // Value domain: the baseline, every value and the reference.
  let lo = baseline;
  let hi = baseline;
  for (const r of rows) {
    lo = Math.min(lo, r.value);
    hi = Math.max(hi, r.value);
  }
  if (hasRef && refValue !== undefined && Number.isFinite(refValue)) {
    lo = Math.min(lo, refValue);
    hi = Math.max(hi, refValue);
  }
  if (lo === hi) hi = lo + 1;

  const fmtAxis = axisFormat(formatProp);
  // Room past a head for its value: the head's radius, a 6px gap, the text and a hair to spare.
  const widestValue = showValues
    ? rows.reduce((m, r) => Math.max(m, textWidth(format(r.value), 12, true)), 0) + HEAD_R + 10
    : 0;
  // Sideways: a name column as wide as the widest name, up to about a third of the chart (40% on narrow ones; longer names are cut to fit).
  const labelCol = horizontal
    ? clamp(Math.ceil(widestName) + 16, 44, Math.max(44, Math.floor(width * (width < 400 ? 0.4 : 0.36))))
    : 0;
  const refRow = hasRef ? 18 : 0;
  const chartH = horizontal ? n * rowH + dock + refRow + 30 + (valueLabel ? 20 : 0) : height + dock;
  const top =
    8 + dock + refRow + (!horizontal && valueLabel ? 20 : 0) + (!horizontal && showValues && hi > baseline ? 16 : 0);
  const bottom = horizontal ? 24 + (valueLabel ? 20 : 0) : 28 + (showValues && lo < baseline ? 16 : 0);
  const innerH = Math.max(0, chartH - top - bottom);

  const yTicks = horizontal ? [] : fitTicks(lo, hi, { length: innerH, axis: "y", format: fmtAxis });
  const axisW = horizontal
    ? labelCol
    : clamp(Math.ceil(yTicks.reduce((m, tk) => Math.max(m, textWidth(fmtAxis(tk))), 0)) + 14, 28, 84);
  // Room past the heads for the value labels (both ends when values fall below the baseline).
  const endPad = horizontal ? Math.max(14, hi > baseline ? widestValue : 0) : 12;
  const startPad = horizontal && lo < baseline ? widestValue : 0;
  const M = { start: axisW, end: endPad };
  const innerW = Math.max(0, width - M.start - M.end);
  const ticks = horizontal
    ? fitTicks(lo, hi, { length: Math.max(0, innerW - startPad), axis: "x", format: fmtAxis })
    : yTicks;
  const t0 = ticks[0] ?? lo;
  const t1 = ticks[ticks.length - 1] ?? hi;
  const sv = horizontal ? linear(t0, t1, startPad, innerW) : linear(t0, t1, innerH, 0);
  const band = (horizontal ? innerH : innerW) / Math.max(1, n);
  const mirror = chartMirror(rtl, innerW);
  const originX = rtl ? M.end : M.start;
  const vBase = sv(clamp(baseline, t0, t1));
  /** Physical x of a value-axis pixel (horizontal) or a category centre (vertical). */
  const X = (p: number) => mirror.x(p);
  // Sideways: value-axis labels thinned so none collide (the last one is pinned to the edge).
  // Value labels stay off the name column (it swaps sides right to left); other text may use the whole svg.
  const axisLo = rtl ? -M.end : -12;
  const axisHi = rtl ? innerW + 12 : innerW + M.end;
  const edgeLo = -originX;
  const edgeHi = width - originX;
  const xShown = horizontal
    ? axisLabelsShown(
        ticks.map((tk) => ({ x: X(sv(tk)), text: fmtAxis(tk) })),
        axisLo,
        axisHi,
      )
    : null;
  // Upright: values print over every head or none (only the active one), so they never collide
  // and never look randomly missing.
  const valuesFit = horizontal || rows.every((r) => textWidth(format(r.value), 12, true) <= band - 2);
  const centre = (i: number) => band * (i + 0.5);
  const shownCategories = horizontal
    ? null
    : thinLabels(
        rows.map((r) => r.label),
        band,
        CHAR_W,
      );
  const categoryRoom = horizontal
    ? labelCol - 16
    : band * Math.max(1, rows.length / Math.max(1, shownCategories?.size ?? 1)) - 8;

  // Stems are thin rect paths (a zero-height <line> can't take a bounding-box gradient).
  const stem = (v: number) => {
    const vh = sv(v);
    const a = Math.min(vh, vBase);
    const len = Math.abs(vh - vBase);
    if (horizontal) {
      const x = mirror.left(a, len);
      return {
        d: `M${x.toFixed(1)},-1 h${len.toFixed(1)} v2 h${(-len).toFixed(1)} Z`,
        origin: mirror.x(vBase) <= x + 0.5 ? 0 : 1,
      };
    }
    return { d: `M-1,${a.toFixed(1)} h2 v${len.toFixed(1)} h-2 Z`, origin: vBase <= a + 0.5 ? 0 : 1 };
  };
  /** A stem, head and value position from the value's pixel `vh` and the baseline's `vb` (recomputed every frame of a change). */
  const fromPixels = (vh: number, vb: number) => {
    const a = Math.min(vh, vb);
    const len = Math.abs(vh - vb);
    const below = horizontal ? vh < vb : vh > vb;
    if (horizontal) {
      const x = mirror.left(a, len);
      return {
        stem: `M${x.toFixed(1)},-1 h${len.toFixed(1)} v2 h${(-len).toFixed(1)} Z`,
        hx: X(vh),
        hy: 0,
        vx: X(vh) + (below !== rtl ? -(HEAD_R + 6) : HEAD_R + 6),
        vy: 0,
      };
    }
    return {
      stem: `M-1,${a.toFixed(1)} h2 v${len.toFixed(1)} h-2 Z`,
      hx: 0,
      hy: vh,
      vx: 0,
      vy: vh + (below ? HEAD_R + 14 : -(HEAD_R + 6)),
    };
  };
  /** Where an item's head, value and name sit (in its row's own coordinates). */
  const place = (r: Row, i: number) => {
    const vh = sv(r.value);
    const below = r.value < baseline;
    const towards: "start" | "end" = horizontal ? (below !== rtl ? "start" : "end") : below ? "start" : "end";
    const valueAnchor: "start" | "middle" | "end" = horizontal ? (below !== rtl ? "end" : "start") : "middle";
    return {
      s: stem(r.value),
      below,
      towards,
      headX: horizontal ? X(vh) : 0,
      headY: horizontal ? 0 : vh,
      baseX: horizontal ? X(vBase) : 0,
      baseY: horizontal ? 0 : vBase,
      valueX: horizontal ? X(vh) + (below !== rtl ? -(HEAD_R + 6) : HEAD_R + 6) : 0,
      valueY: horizontal ? 0 : vh + (below ? HEAD_R + 14 : -(HEAD_R + 6)),
      valueAnchor,
      name: fitText(r.label, categoryRoom, 12, true),
      nameX: horizontal ? (rtl ? innerW + 12 : -12) : 0,
      nameY: horizontal ? 0 : innerH + 18,
      nameAnchor: horizontal
        ? rtl
          ? "start"
          : "end"
        : edgeAnchor(X(centre(i)), textWidth(fitText(r.label, categoryRoom, 12, true), 12, true), edgeLo, edgeHi),
      at: horizontal ? { x: 0, y: centre(i) } : { x: X(centre(i)), y: 0 },
    };
  };
  return {
    lo,
    hi,
    fmtAxis,
    labelCol,
    refRow,
    chartH,
    top,
    innerH,
    M,
    innerW,
    ticks,
    sv,
    band,
    mirror,
    originX,
    vBase,
    X,
    axisLo,
    axisHi,
    edgeLo,
    edgeHi,
    xShown,
    valuesFit,
    centre,
    shownCategories,
    place,
    fromPixels,
    startPad,
  };
}
