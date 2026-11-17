import type { CSSProperties, ReactNode } from "react";
import { ChartLegend, ChartWidthHint, type ChartLegendProps } from "@sheenui/theme";

import { ShowcaseStage } from "./ShowcaseStage";
import type { ChartStageScene } from "./ShowcaseStage.chart";

type ChartStageProps = {
  /** Accessible name of the stage group, for example "Line chart demo". */
  label: string;
  /** The line above the chart on the plate, for example "Monthly revenue". */
  title: string;
  /** The chart's first palette slot (1 to 8): the stage light takes this colour. */
  hue: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** The height reserved for the chart, a CSS length (default 15rem): the idle frame holds it so nothing shifts. */
  height?: string;
  /** The height reserved at 36rem of chart width and below (a CSS length), when the chart is taller or shorter there; default `height`. */
  narrowHeight?: string;
  /** A compact key for a multi-series chart, on its own line under the title. The stage reserves the line, so the stage never changes height. */
  legend?: ChartLegendProps["items"];
  /** The chart itself, with the page's own data. It mounts when the story starts, so its enter animation plays on the stage. */
  children: ReactNode;
};

/**
 * The stage at the top of a chart page: the page's first chart is on the plate from the first frame (never empty axes), draws in with its own enter animation, and Replay draws it again,
 * the light in the chart's palette colour. The chart code is the page's own (already in its chunk); only the story is a
 * separate chunk. The chart is not interactive on the stage in any way that matters to the story, but it stays live
 * (hover and keys read it) and touching it ends the story, as on every stage.
 */
/** The stage's own chrome around the chart (padding, title, plate), measured: 178px. */
const CHROME_REM = 11.125;
/** The legend line (1.25rem) and the gap above it (0.75rem). */
const LEGEND_REM = 2;
const reserve = (height: string, legend = false) => {
  const extra = CHROME_REM + (legend ? LEGEND_REM : 0);
  const rem = /^(\d+(?:\.\d+)?)rem$/.exec(height);
  return rem ? `${Number(rem[1]) + extra}rem` : `calc(${height} + ${extra}rem)`;
};

/**
 * The width a chart can assume before it has measured itself: the plate is 46rem (736px) with 1.5rem of padding each side
 * (ShowcaseStage.chart.css). A chart that sizes itself from its width (waffle, chord, radial bar, a map) would otherwise
 * draw its first frame, the prerendered one, at width 0 and jump when measured.
 */
const PLATE_INNER_PX = 688;

/** The stage floor is the smaller of the two heights (both rem), so the one that is taller grows the stage in the idle frame, never later. */
const smaller = (a: string, b?: string) => {
  const x = /^(\d+(?:\.\d+)?)rem$/.exec(a);
  const y = /^(\d+(?:\.\d+)?)rem$/.exec(b ?? "");
  return x?.[1] && y?.[1] && Number(y[1]) < Number(x[1]) ? (b ?? a) : a;
};

export function ChartStage({ label, title, hue, height = "15rem", narrowHeight, legend, children }: ChartStageProps) {
  return (
    <ShowcaseStage<ChartStageScene>
      label={label}
      story={() => import("./ShowcaseStage.chart")}
      initial={{ shown: true }}
      minHeight={reserve(smaller(height, narrowHeight), Boolean(legend?.length))}
      onInterrupt="keep"
      className={`sheen-stage-chart sheen-stage-hue-${hue}`}
    >
      {(scene) => (
        <div className="sheen-stage-chart-body">
          <p className="sheen-stage-title">{title}</p>
          {legend?.length ? <ChartLegend items={legend} className="sheen-stage-chart-legend" /> : null}
          <div
            className="sheen-stage-chart-area"
            style={{ "--chart-h": height, "--chart-h-narrow": narrowHeight ?? height } as CSSProperties}
          >
            {scene.shown ? <ChartWidthHint value={PLATE_INNER_PX}>{children}</ChartWidthHint> : null}
          </div>
        </div>
      )}
    </ShowcaseStage>
  );
}

/** Page.tsx finds a page's stage among its children by this mark (see ShowcaseStage.tsx). */
ChartStage.isShowcaseStage = true;
