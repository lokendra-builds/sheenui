import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { type ChartSeries } from "@sheenui/theme";
import { ChartCard } from "../../layout/ExampleChartCard";
import { DEMO_NOW_UTC_MS } from "../../demo-clock";
import { StreamingChart, StreamingTable, useStreamingData } from "@sheenui/theme";

/* ====================================================================== */
/* Streaming                                                              */
/* ====================================================================== */

const loadSeries: ChartSeries[] = [
  { key: "cpu", label: "CPU", color: 1 },
  { key: "memory", label: "Memory", color: 3 },
];

const percent = (n: number) => `${Math.round(n)}%`;

/** A believable server: a slow daily swing, bursts, and memory that creeps up and is collected. */
function serverLoad(time: number) {
  const s = time / 1000;
  const noise = Math.sin(s * 12.9898) * 43758.5453;
  const jitter = noise - Math.floor(noise);
  const burst = Math.max(0, Math.sin(s / 9)) ** 6 * 30;
  return {
    cpu: Math.min(98, Math.max(4, 34 + Math.sin(s / 23) * 12 + burst + (jitter - 0.5) * 9)),
    memory: 52 + ((s % 90) / 90) * 18 + (jitter - 0.5) * 2,
  };
}

function requestRate(time: number) {
  const s = time / 500;
  const noise = Math.sin(s * 78.233) * 12543.123;
  const jitter = noise - Math.floor(noise);
  return Math.round(1180 + Math.sin(s / 17) * 260 + Math.sin(s / 5.3) * 90 + (jitter - 0.5) * 140);
}

const rpsSeries: ChartSeries[] = [{ key: "rps", label: "Requests / s", color: 7 }];

/*
 * Each live card owns its buffer: a new sample re-renders that card only, never the docs page.
 * Off-screen the simulated feed rests (`idle`), and the gap is filled in when it comes back.
 */
export function ServerLoadCard() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "200px" });
  const load = useStreamingData(serverLoad, {
    rate: 1000,
    history: 60,
    capacity: 180,
    idle: !near,
    startAt: DEMO_NOW_UTC_MS,
  });
  const [paused, setPaused] = useState(false);
  return (
    <div ref={ref} className="w-full">
      <ChartCard
        className="w-full"
        title="web-01"
        description="us-east-1 · last 60 seconds"
        table={
          <StreamingTable
            data={load}
            series={loadSeries}
            format={percent}
            locale="en-US"
            timeZone="UTC"
            caption="Latest samples of web-01"
          />
        }
      >
        <StreamingChart
          data={load}
          series={loadSeries}
          rate={1000}
          window={60}
          format={percent}
          locale="en-US"
          timeZone="UTC"
          paused={paused}
          onPausedChange={setPaused}
          aria-label="CPU and memory of web-01, last minute"
        />
      </ChartCard>
    </div>
  );
}

export function EdgeRequestsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "200px" });
  const requests = useStreamingData(requestRate, {
    rate: 500,
    history: 100,
    capacity: 240,
    valueKey: "rps",
    idle: !near,
    startAt: DEMO_NOW_UTC_MS,
  });
  return (
    <div ref={ref} className="w-full">
      <ChartCard
        className="w-full"
        title="Edge requests"
        description="All regions, requests per second"
        table={
          <StreamingTable
            data={requests}
            series={rpsSeries}
            locale="en-US"
            timeZone="UTC"
            caption="Latest request rates"
          />
        }
      >
        <StreamingChart
          data={requests}
          series={rpsSeries}
          rate={500}
          window={80}
          zero
          height={200}
          locale="en-US"
          timeZone="UTC"
          aria-label="Requests per second"
        />
      </ChartCard>
    </div>
  );
}
