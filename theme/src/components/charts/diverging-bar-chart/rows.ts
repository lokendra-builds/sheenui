import type { TooltipRow } from "../chart-parts";
import type { Readout } from "../chart-fit";
import { num, type ChartRow } from "../chart-utils";
import { isolate } from "../chart-pointer";
import { netText, type DivergingBarChartLabels, type DivRow, type LevelInfo, type Side } from "./model";

/**
 * Turn the data rows into plotted rows: Likert rows as shares of their own total, butterfly sides as
 * counts or shares of the grand total.
 * @internal
 */
export function buildDivergingRows(
  data: readonly ChartRow[],
  info: LevelInfo[],
  keys: string[],
  index: string,
  butterfly: boolean,
  norm: boolean,
): DivRow[] {
  const grand = butterfly
    ? data.reduce((s, row) => s + info.reduce((a, l) => a + Math.max(0, num(row[l.key])), 0), 0)
    : 0;
  return data.map((row, ri) => {
    const raw = info.map((l) => Math.max(0, num(row[l.key])));
    const total = raw.reduce((a, b) => a + b, 0);
    const shares = raw.map((v) => (butterfly ? (grand > 0 ? v / grand : 0) : total > 0 ? v / total : 0));
    const plotted = norm ? shares : raw;
    const sum = (side: Side, of: number[]) => info.reduce((s, l, i) => s + (l.side === side ? (of[i] ?? 0) : 0), 0);
    const negShare = sum("negative", shares);
    const posShare = sum("positive", shares);
    return {
      key: keys[ri] ?? "",
      label: String(row[index] ?? ""),
      raw,
      total,
      shares,
      plotted,
      negSum: sum("negative", plotted),
      posSum: sum("positive", plotted),
      neutralVal: sum("neutral", plotted),
      net: posShare - negShare,
      negShare,
      posShare,
    };
  });
}

/** How one segment of a row reads in the tooltip or the docked band. @internal */
export function divergingReadout(
  r: DivRow,
  s: number,
  o: {
    butterfly: boolean;
    info: LevelInfo[];
    norm: boolean;
    t: DivergingBarChartLabels;
    pct: (n: number) => string;
    format: (n: number) => string;
  },
): Readout {
  const { butterfly, info, norm, t, pct, format } = o;
  // Numbers are isolated so right-to-left pages keep each one whole ("−4", not "4−").
  const P = (n: number) => isolate(pct(n));
  const F = (n: number) => isolate(format(n));
  if (butterfly) {
    const out: TooltipRow[] = info.map((l, i) => ({
      label: l.label,
      value: norm ? P(r.shares[i] ?? 0) : F(r.raw[i] ?? 0),
      color: l.color,
      kind: "rect",
    }));
    out.push({
      label: t.total,
      value: norm ? P((r.shares[0] ?? 0) + (r.shares[1] ?? 0)) : F(r.total),
      color: "transparent",
    });
    return { title: r.label, rows: out };
  }
  const l = info[s];
  const out: TooltipRow[] = [];
  if (l)
    out.push({
      label: l.label,
      value: `${P(r.shares[s] ?? 0)}${norm && r.total > 0 ? ` (${F(r.raw[s] ?? 0)})` : ""}`,
      color: l.color,
      kind: "rect",
    });
  if (l?.side === "negative") out.push({ label: t.totalNegative, value: P(r.negShare), color: "transparent" });
  if (l?.side === "positive") out.push({ label: t.totalPositive, value: P(r.posShare), color: "transparent" });
  out.push({ label: t.net, value: isolate(netText(r.net, pct)), color: "transparent" });
  return { title: r.label, rows: out };
}
