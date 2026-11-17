"use client";

import { cn } from "../../../lib/cn";
import { SegmentedControl } from "../../segmented/segmented";
import type { GanttChartLabels, GanttScale } from "./types";

/** Narrows the switch's string value to a scale; anything else is ignored. */
function isGanttScale(v: unknown): v is GanttScale {
  return v === "day" || v === "week" || v === "month";
}

/** The Today button and the day / week / month switch above the timeline. */
export function GanttToolbar({
  labels,
  scale,
  onScale,
  showToday,
  todayEnabled,
  onToday,
}: {
  labels: GanttChartLabels;
  scale: GanttScale;
  onScale: (scale: GanttScale) => void;
  /** Whether the plan has a today date to jump to. */
  showToday: boolean;
  /** Whether that date falls inside the plan's range. */
  todayEnabled: boolean;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {showToday && (
        <button
          type="button"
          disabled={!todayEnabled}
          onClick={onToday}
          className={cn(
            "glass-1 inline-flex h-7 items-center gap-1.5 rounded-sheen-full px-3 text-xs font-medium text-sheen-fg",
            "transition-colors duration-(--sheen-duration-fast) hover:bg-sheen-hover disabled:text-sheen-fg-subtle disabled:hover:bg-transparent",
            "any-pointer-coarse:h-11 motion-ok:active:scale-[0.97]",
            "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheen-focus",
          )}
        >
          <svg aria-hidden width={12} height={12} viewBox="0 0 12 12" className="shrink-0">
            <circle cx={6} cy={6} r={2.5} className="fill-sheen-accent" />
            <circle cx={6} cy={6} r={5} fill="none" className="stroke-sheen-accent" strokeWidth={1} opacity={0.5} />
          </svg>
          {labels.today}
        </button>
      )}
      <SegmentedControl
        size="sm"
        aria-label={labels.scaleLabel}
        value={scale}
        onValueChange={(v) => {
          if (isGanttScale(v)) onScale(v);
        }}
        items={[
          { value: "day", label: labels.day },
          { value: "week", label: labels.week },
          { value: "month", label: labels.month },
        ]}
      />
    </div>
  );
}
