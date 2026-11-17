import { fitTicks } from "../chart-fit";
import { axisFormat, clamp, itemAt, linear } from "../chart-utils";
import { textWidth } from "../chart-pointer";
import { axisLabelsShown } from "../histogram/model";
import { chartMirror } from "../kits/histogram-kit/kit";
import { arrowOf, spreadLabels, type Row } from "./model";

/** The value domain `[lo, hi]` of the rows, widened to include zero when asked. @internal */
export function dumbbellDomain(rows: readonly Row[], includeZero: boolean): [number, number] {
  let a = Infinity;
  let b = -Infinity;
  for (const r of rows) {
    a = Math.min(a, r.from, r.to);
    b = Math.max(b, r.from, r.to);
  }
  if (!Number.isFinite(a)) [a, b] = [0, 1];
  if (includeZero) {
    a = Math.min(a, 0);
    b = Math.max(b, 0);
  }
  return a === b ? [a - 1, b + 1] : [a, b];
}

/** Layout of the slope variant: two columns, the value scale and the de-overlapped label positions. @internal */
export function computeSlopeLayout(p: {
  rows: Row[];
  width: number;
  height: number;
  dock: number;
  valueLabel: string | undefined;
  lo: number;
  hi: number;
  format: (v: number) => string;
  rtl: boolean;
  n: number;
}) {
  const { rows, width, height, dock, valueLabel, lo, hi, format, rtl, n } = p;
  const narrow = width < 520;
  const top = 30 + dock;
  const bottom = 16 + (valueLabel ? 18 : 0);
  const innerH = Math.max(0, height - top - bottom);
  const sy = linear(lo, hi, innerH, 0);
  const widestName = rows.reduce((m, r) => Math.max(m, textWidth(r.label, 12, true)), 0);
  const valueW = rows.reduce(
    (m, r) => Math.max(m, textWidth(format(r.from), 12, true), textWidth(format(r.to), 12, true)),
    0,
  );
  // Names sit outside the left column (and the right one on wide charts), values next to the dots.
  const nameW = Math.min(widestName, Math.max(36, width * (narrow ? 0.34 : 0.22)));
  const sideL = nameW + valueW + 22;
  const sideR = (narrow ? 0 : nameW + 8) + valueW + 22;
  const xL = rtl ? width - sideL : sideL;
  const xR = rtl ? sideR : width - sideR;
  const gap = 15;
  const spreadOk = n * gap <= innerH + gap;
  const leftY = spreadLabels(
    rows.map((r) => sy(r.from)),
    gap,
    0,
    innerH,
  );
  const rightY = spreadLabels(
    rows.map((r) => sy(r.to)),
    gap,
    0,
    innerH,
  );
  const orderTopDown = rows.map((_, i) => i).sort((a, b) => sy(itemAt(rows, a).to) - sy(itemAt(rows, b).to));
  return { narrow, top, innerH, sy, nameW, xL, xR, spreadOk, leftY, rightY, orderTopDown, sideDir: rtl ? -1 : 1 };
}

/** Layout of the dumbbell variant: name column, change column, value axis and its ticks. @internal */
export function computeDumbbellLayout(p: {
  rows: Row[];
  width: number;
  change: string;
  changeText: (r: Row) => string;
  dock: number;
  n: number;
  rowH: number;
  valueLabel: string | undefined;
  formatProp: ((v: number) => string) | undefined;
  lo: number;
  hi: number;
  rtl: boolean;
}) {
  const { rows, width, change, changeText, dock, n, rowH, valueLabel, formatProp, lo, hi, rtl } = p;
  // A name column as wide as the widest name, up to a third of the chart (40% on narrow ones; longer names are cut to fit).
  const widestName = rows.reduce((m, r) => Math.max(m, textWidth(r.label, 12, true)), 0);
  const labelCol = clamp(Math.ceil(widestName) + 16, 44, Math.max(44, Math.floor(width * (width < 400 ? 0.4 : 0.34))));
  // Change column: "▲ +12%" in 12px medium text, after a 10px gap (and a hair to spare).
  const changeW =
    change === "none"
      ? 0
      : rows.reduce(
          (m, r) => Math.max(m, textWidth(`${arrowOf(r) ? `${arrowOf(r)} ` : ""}${changeText(r)}`, 12, true)),
          0,
        ) + 14;
  const top = 8 + dock;
  const chartH = n * rowH + top + 26 + (valueLabel ? 20 : 0);
  const innerH = n * rowH;
  const M = { start: labelCol, end: Math.max(16, changeW) };
  const innerW = Math.max(0, width - M.start - M.end);
  const fmtAxis = axisFormat(formatProp);
  const ticks = fitTicks(lo, hi, { length: Math.max(0, innerW - 16), axis: "x", format: fmtAxis });
  const t0 = ticks[0] ?? lo;
  const t1 = ticks[ticks.length - 1] ?? hi;
  const sx = linear(t0, t1, 8, Math.max(8, innerW - 8));
  const mirror = chartMirror(rtl, innerW);
  const X = (v: number) => mirror.x(sx(v));
  // Value labels stay off the name column (it swaps sides right to left).
  const axisLo = rtl ? -M.end : -12;
  const axisHi = rtl ? innerW + 12 : innerW + M.end;
  const xShown = axisLabelsShown(
    ticks.map((tk) => ({ x: X(tk), text: fmtAxis(tk) })),
    axisLo,
    axisHi,
  );
  return {
    labelCol,
    top,
    chartH,
    innerH,
    M,
    innerW,
    fmtAxis,
    ticks,
    X,
    originX: rtl ? M.end : M.start,
    axisLo,
    axisHi,
    xShown,
  };
}
