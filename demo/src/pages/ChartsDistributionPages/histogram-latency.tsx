import { useMemo, useState } from "react";
import { Slider, Switch } from "@sheenui/theme";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { Histogram, HistogramTable, histogramLegend, type BinMethod } from "@sheenui/theme";
import { CARD, makeLatencies, ms } from "./shared";

/** Its own component, so re-binning re-renders this example only. */
export function LatencyExample() {
  const latencies = useMemo(() => makeLatencies(), []);
  const [auto, setAuto] = useState(true);
  const [bins, setBins] = useState(24);
  const [density, setDensity] = useState(true);
  const [week, setWeek] = useState<"this" | "last">("this");
  const sample = useMemo(
    () => (week === "this" ? latencies : makeLatencies(11, 1100).map((v) => Math.round(v * 1.18))),
    [week, latencies],
  );
  const binSetting: number | BinMethod = auto ? "auto" : bins;
  return (
    <Example
      title="Latency with percentiles"
      description="1,200 API response times. Drag the slider to re-bin: bars morph to the new edges. The dashed lines mark the median, p95 and an SLO of 300 ms; hover, tap or arrow through the bins."
      variant="bare"
      controls={
        <>
          <Segmented
            label="Week"
            size="sm"
            options={[
              { value: "this", label: "This week" },
              { value: "last", label: "Last week" },
            ]}
            value={week}
            onValueChange={setWeek}
          />
          <Switch label="Automatic bins" checked={auto} onCheckedChange={setAuto} />
          {!auto && (
            <Slider
              label="Bins"
              min={4}
              max={60}
              value={bins}
              onValueChange={(v) => setBins(v as number)}
              className="w-48"
            />
          )}
          <Switch label="Density curve" checked={density} onCheckedChange={setDensity} />
        </>
      }
      code={`
import { ChartCard, histogramLegend, HistogramTable, Histogram } from "@sheenui/theme";

// Response times in ms (a sample; yours is the full list)
const latencies: number[] = [
  84, 92, 97, 101, 104, 108, 111, 113, 116, 118, 121, 124, 127, 131, 135, 140,
  146, 153, 161, 172, 188, 206, 233, 271, 342, 96, 109, 119, 129, 150,
];
const ms = (n: number) => Math.round(n) + " ms";

export function Example() {
  return (
    <ChartCard
      title="API latency"
      description="Response times, this week"
      legend={histogramLegend({ density: true, labels: { bins: "Requests" } })}
      table={<HistogramTable values={latencies} bins="auto" format={ms} caption="API latency by range" />}
    >
      <Histogram
        values={latencies}
        bins="auto"
        density
        markers={["median", "p95", { value: 300, label: "SLO" }]}
        format={ms}
        xLabel="Response time"
        aria-label="Distribution of API response times"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className={`w-full ${CARD}`}
        title="API latency"
        description={`Response times, ${week === "this" ? "this" : "last"} week`}
        legend={histogramLegend({ density, labels: { bins: "Requests" } })}
        table={<HistogramTable values={sample} bins={binSetting} format={ms} caption="API latency by range" />}
      >
        <Histogram
          values={sample}
          bins={binSetting}
          density={density}
          markers={["median", "p95", { value: 300, label: "SLO" }]}
          format={ms}
          xLabel="Response time"
          aria-label="Distribution of API response times"
        />
      </ChartCard>
    </Example>
  );
}
