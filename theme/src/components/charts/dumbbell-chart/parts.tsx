import { cn } from "../../../lib/cn";
import { enterEase } from "../chart-utils";
import { type ChartTipSide } from "../heatmap";
import { type Row } from "./model";

/** The tooltip side order of the slope layout. @internal */
export const SLOPE_TIP: readonly ChartTipSide[] = ["right", "left", "below", "above"];
/** The enter easing as a CSS `cubic-bezier` string, built at call time so no client-only value is read at import. @internal */
export const easeOut = (): string => `cubic-bezier(${enterEase.join(",")})`;

/** A dumbbell row's change: ▲ / ▼ and the signed difference, in a success or danger tone. */
export function ChangeText({
  row,
  x,
  rtl,
  text,
  arrow,
  tone,
  ...rest
}: {
  row: Row;
  x: number;
  rtl: boolean;
  text: string;
  arrow: string;
  tone: string;
  "data-part"?: string;
}) {
  return (
    <text
      {...rest}
      x={x}
      dy="0.32em"
      textAnchor={rtl ? "end" : "start"}
      className={cn("text-xs font-medium tabular-nums", tone)}
    >
      {arrow && <tspan aria-hidden>{arrow} </tspan>}
      {text}
    </text>
  );
}

/** The computed geometry of the slope layout. @internal */
export type SlopeLayout = {
  xL: number;
  xR: number;
  leftY: number[];
  rightY: number[];
  narrow: boolean;
  sideDir: number;
};

/** A slope line's two labels: the name and "before" value on the left, the "after" value (and the name on wide charts) on the right. */
export function SlopeLabels({
  row,
  name,
  strong,
  S,
  i,
  format,
  at,
}: {
  row: Row;
  name: string;
  strong: boolean;
  S: SlopeLayout;
  i: number;
  format: (n: number) => string;
  at?: [number, number];
}) {
  const [ly, ry] = at ?? [S.leftY[i] ?? 0, S.rightY[i] ?? 0];
  const rtl = S.sideDir < 0;
  return (
    <>
      <text
        data-part="lt"
        x={S.xL - 12 * S.sideDir}
        dy="0.32em"
        transform={`translate(0 ${ly.toFixed(1)})`}
        textAnchor={rtl ? "start" : "end"}
        className="text-xs"
      >
        <tspan className={strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted"}>
          {name}
          {name !== row.label && <title>{row.label}</title>}
        </tspan>
        <tspan className="fill-sheen-fg font-medium tabular-nums" dx={6}>
          {format(row.from)}
        </tspan>
      </text>
      <text
        data-part="rt"
        x={S.xR + 12 * S.sideDir}
        dy="0.32em"
        transform={`translate(0 ${ry.toFixed(1)})`}
        textAnchor={rtl ? "end" : "start"}
        className="text-xs"
      >
        <tspan className="fill-sheen-fg font-semibold tabular-nums">{format(row.to)}</tspan>
        {!S.narrow && (
          <tspan className={strong ? "fill-sheen-fg font-medium" : "fill-sheen-fg-muted"} dx={6}>
            {name}
          </tspan>
        )}
      </text>
    </>
  );
}
