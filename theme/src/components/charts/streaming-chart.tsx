"use client";

import { useMergedRef } from "../../lib/form";
import type { ChartRoot } from "./chart-utils";
import { useRef, useState } from "react";
import { useInView, usePageInView } from "motion/react";

import { cn } from "../../lib/cn";

import { type StreamingChartProps } from "./streaming-chart/model";
import { StreamingBody } from "./streaming-chart/parts";

export {
  type StreamingSource,
  type UseStreamingDataOptions,
  useStreamingData,
  type StreamingChartLabels,
  defaultStreamingChartLabels,
  type StreamingChartProps,
} from "./streaming-chart/model";
export { type StreamingTableProps, StreamingTable } from "./streaming-chart/parts";
/**
 * A live line chart: new samples glide in from the right as the time axis slides smoothly
 * under them, like a heart-rate monitor. For CPU load, requests per second, prices, sensors.
 *
 * - The view trails the newest sample by one interval, so every new point slides into view
 *   instead of popping in; a glowing head dot rides the line at the edge. Only transforms move
 *   each frame; the line itself is rebuilt once per sample.
 * - Pause / Resume (built in, as WCAG 2.2.2 asks of anything that updates on its own). Data
 *   keeps arriving while paused; resuming glides to the present.
 * - Off-screen or in a hidden tab the chart rests: no frame loop, no redraw per sample, no pulse.
 *   Back in view it glides to the present.
 * - Hover, tap or arrow keys hold the view still while you read: a crosshair and tooltip give
 *   every series' value at that moment.
 * - The value axis eases to fit what's in view (a transform on the lines, not a redraw per
 *   frame). Latest values roll in the header.
 * - Reduced motion: no sliding; the chart redraws in place once per sample.
 *
 * Keyboard: Tab focuses the chart; Space (or K) pauses and resumes, Left and Right hold the view still and read the previous or next sample, Escape clears the reading. The Pause / Resume button is a normal tab stop.
 * Accessibility: `role="figure"` named by the chart title, with the keyboard hint as its description (`aria-describedby`, and `aria-details` to the `ChartCard` table view); focusable only when interactive; the Pause button satisfies WCAG 2.2.2 for content that updates on its own, and keyboard moves announce each sample. `StreamingTable` lists the latest samples as the table view.
 * Glass and motion: the tooltip is a solid glass-look overlay (no backdrop blur). Off-screen or in a hidden tab the chart rests with no frame loop; reduced motion draws each sample in place instead of sliding.
 *
 * @example
 * ```tsx
 * import { StreamingChart, useStreamingData } from "@sheenui/theme";
 *
 * function Requests() {
 *   const rows = useStreamingData((_time, i) => 120 + 30 * Math.sin(i / 4));
 *   return <StreamingChart data={rows} series={[{ key: "value", label: "Requests per second" }]} aria-label="Requests per second, live" />;
 * }
 * ```
 *
 * @see /charts/realtime-chart
 */
export function StreamingChart({ ref: outerRef, ...props }: ChartRoot<StreamingChartProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rootMerged = useMergedRef(rootRef, outerRef);
  const near = useInView(rootRef, { margin: "100px" });
  const pageVisible = usePageInView();
  const visible = near && pageVisible;
  // While it can't be seen, the chart keeps drawing the last rows it showed: new samples cost
  // no render at all (the body is memoised on its props).
  const [shown, setShown] = useState(props.data);
  const data = visible || shown.length === 0 ? props.data : shown;
  if (data !== shown) setShown(data);
  return (
    <div ref={rootMerged} className={cn("relative flex w-full min-w-0 flex-col gap-3", props.className)}>
      <StreamingBody {...props} data={data} visible={visible} rootRef={rootRef} />
    </div>
  );
}
