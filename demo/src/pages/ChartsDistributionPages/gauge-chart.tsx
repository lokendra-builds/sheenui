import { useState } from "react";
import { Button, Slider } from "@sheenui/theme";
import { ChartCard } from "../../layout/ExampleChartCard";
import { Example } from "../../layout/Example";
import { GaugeChart, GaugeTable, type GaugeBand } from "@sheenui/theme";
import { CARD } from "./shared";

/** Thousands of dollars: $25K, $68.4K (one decimal only when there is one). */
export const kusd = (n: number) => `$${Number(n.toFixed(1))}K`;

/* ====================================================================== */
/* Gauge                                                                  */
/* ====================================================================== */

export const apdexBands: GaugeBand[] = [
  { to: 0.7, label: "Poor", tone: "danger" },
  { to: 0.85, label: "Fair", tone: "warning" },
  { to: 1, label: "Good", tone: "success" },
];

const loadBands: GaugeBand[] = [
  { to: 60, label: "Normal", tone: "success" },
  { to: 85, label: "Busy", tone: "warning" },
  { to: 100, label: "Overloaded", tone: "danger" },
];

const APDEX_READINGS = [0.91, 0.78, 0.62, 0.95];

/** Its own component, so the slider re-renders this example only. */
export function CpuExample() {
  const [cpu, setCpu] = useState(72);
  return (
    <Example
      title="Speedometer"
      description='shape="speedometer" sweeps 270°. Drag the slider: the needle chases the value on a spring. higherIsBetter={false} turns a value above the target into a warning.'
      variant="bare"
      controls={
        <Slider
          label="CPU load"
          min={0}
          max={100}
          value={cpu}
          onValueChange={(v) => setCpu(v as number)}
          className="w-56"
        />
      }
      code={`
import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 60, label: "Normal", tone: "success" },
  { to: 85, label: "Busy", tone: "warning" },
  { to: 100, label: "Overloaded", tone: "danger" },
];

export function Example() {
  const cpu = 72; // percent, from your metrics
  return (
    <GaugeChart
      shape="speedometer"
      value={cpu}
      target={80}
      higherIsBetter={false}
      bands={bands}
      label="CPU load"
      numberFormat={{ style: "unit", unit: "percent" }}
      aria-label="CPU load"
    />
  );
}`}
    >
      <ChartCard
        className={CARD}
        title="Cluster CPU"
        description="Average across 12 nodes"
        table={
          <GaugeTable
            value={cpu}
            target={80}
            bands={loadBands}
            measure="CPU load"
            numberFormat={{ style: "unit", unit: "percent" }}
            caption="CPU load"
          />
        }
      >
        <GaugeChart
          shape="speedometer"
          value={cpu}
          target={80}
          higherIsBetter={false}
          bands={loadBands}
          label="CPU load"
          numberFormat={{ style: "unit", unit: "percent" }}
          aria-label="CPU load"
        />
      </ChartCard>
    </Example>
  );
}

/** Its own component, so a new reading re-renders this example only. */
export function ApdexExample() {
  const [reading, setReading] = useState(0);
  const apdex = APDEX_READINGS[reading % APDEX_READINGS.length] ?? 0.91;
  return (
    <Example
      title="Semicircle with bands and a target"
      description="Apdex score. Take a new reading: the needle springs to it and the digits roll. Hover a band, the target or the needle, or focus the gauge and use the arrow keys."
      variant="bare"
      controls={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReading((r) => r + 1)}
          className="border border-sheen-control-border any-pointer-coarse:h-11"
        >
          New reading
        </Button>
      }
      code={`
import { GaugeChart, type GaugeBand } from "@sheenui/theme";

const bands: GaugeBand[] = [
  { to: 0.7, label: "Poor", tone: "danger" },
  { to: 0.85, label: "Fair", tone: "warning" },
  { to: 1, label: "Good", tone: "success" },
];

export function Example() {
  const apdex = 0.91; // your latest reading
  return (
    <GaugeChart
      value={apdex}
      min={0}
      max={1}
      target={0.85}
      bands={bands}
      label="Apdex"
      numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      aria-label="Apdex score"
    />
  );
}`}
    >
      <ChartCard
        className={CARD}
        title="Application health"
        description="Apdex, last 15 minutes"
        table={
          <GaugeTable
            value={apdex}
            min={0}
            max={1}
            target={0.85}
            bands={apdexBands}
            measure="Apdex"
            numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            caption="Apdex score"
          />
        }
      >
        <GaugeChart
          value={apdex}
          min={0}
          max={1}
          target={0.85}
          bands={apdexBands}
          label="Apdex"
          numberFormat={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          aria-label="Apdex score"
        />
      </ChartCard>
    </Example>
  );
}
