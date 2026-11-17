import { startTransition, useState } from "react";
import { Example } from "../../layout/Example";
import { Segmented } from "../../layout/Segmented";
import { SunburstChart, SunburstTable, sunburstLegend, type SunburstNode } from "@sheenui/theme";
import { ChartCard, Headline, formatUsd } from "./shared";

/* ====================================================================== */
/* Sunburst                                                               */
/* ====================================================================== */

export const cloudSpend: SunburstNode[] = [
  {
    label: "Compute",
    children: [
      {
        label: "Kubernetes",
        children: [
          { label: "Web", value: 18400 },
          { label: "Workers", value: 9600 },
          { label: "Cron jobs", value: 2100 },
        ],
      },
      {
        label: "VMs",
        children: [
          { label: "Build agents", value: 7200 },
          { label: "Bastion", value: 600 },
        ],
      },
      { label: "Serverless", value: 3900 },
    ],
  },
  {
    label: "Storage",
    children: [
      {
        label: "Object storage",
        children: [
          { label: "Media", value: 6800 },
          { label: "Backups", value: 4100 },
          { label: "Logs", value: 2700 },
        ],
      },
      { label: "Block storage", value: 5200 },
    ],
  },
  {
    label: "Databases",
    children: [
      {
        label: "Postgres",
        children: [
          { label: "Primary", value: 9800 },
          { label: "Replicas", value: 6200 },
        ],
      },
      { label: "Redis", value: 3100 },
      { label: "Search", value: 4400 },
    ],
  },
  {
    label: "Network",
    children: [
      { label: "CDN", value: 5600 },
      { label: "Egress", value: 3800 },
      { label: "Load balancers", value: 1900 },
    ],
  },
  {
    label: "Observability",
    children: [
      { label: "Metrics", value: 2600 },
      { label: "Tracing", value: 1700 },
      { label: "Logs", value: 2900 },
    ],
  },
];

export const bundle: SunburstNode[] = [
  {
    label: "node_modules",
    children: [
      { label: "react-dom", value: 132 },
      { label: "motion", value: 58 },
      {
        label: "@base-ui",
        children: [
          { label: "dialog", value: 14 },
          { label: "menu", value: 18 },
          { label: "tabs", value: 9 },
          { label: "utils", value: 22 },
        ],
      },
      { label: "tailwind-merge", value: 21 },
      { label: "react", value: 8 },
    ],
  },
  {
    label: "src",
    children: [
      {
        label: "components",
        children: [
          { label: "charts", value: 96 },
          { label: "data-table", value: 41 },
          { label: "forms", value: 37 },
          { label: "overlays", value: 29 },
        ],
      },
      { label: "pages", value: 64 },
      { label: "hooks", value: 9 },
    ],
  },
  { label: "styles", value: 31 },
];

const sunburstPaths = ["Compute", "Databases", "Storage"] as const;

const sumLeaves = (nodes: SunburstNode[]): number =>
  nodes.reduce((s, n) => s + (n.children ? sumLeaves(n.children) : (n.value ?? 0)), 0);

export const formatShare = (n: number) => `${n.toFixed(1)}%`;

const cloudTotal = sumLeaves(cloudSpend);

export function CloudSpendExample() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <Example
      title="Zoomable cloud spend"
      description="Three levels of a monthly bill. Each service family has its own palette slot; its children share the hue in lighter steps outwards. Click Compute (or press Enter on it) to zoom in. The path can be controlled: the buttons below jump straight to a level."
      variant="bare"
      controls={
        <Segmented
          label="Zoom to"
          size="sm"
          options={[{ value: "", label: "All" }, ...sunburstPaths.map((p) => ({ value: p, label: p }))]}
          value={path[0] ?? ""}
          // A zoom re-renders the whole chart: a transition keeps the click from blocking the main thread.
          onValueChange={(v) => startTransition(() => setPath(v ? [v] : []))}
        />
      }
      code={`
import { ChartCard, sunburstLegend, SunburstTable, SunburstChart, type SunburstNode } from "@sheenui/theme";
import { useState } from "react";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const formatUsd = (n: number) => usd.format(n);

const spend: SunburstNode[] = [
  {
    label: "Compute",
    children: [
      { label: "Kubernetes", children: [{ label: "Web", value: 18400 }, { label: "Workers", value: 9600 }, { label: "Cron jobs", value: 2100 }] },
      { label: "VMs", children: [{ label: "Build agents", value: 7200 }, { label: "Bastion", value: 600 }] },
      { label: "Serverless", value: 3900 },
    ],
  },
  {
    label: "Storage",
    children: [
      { label: "Object storage", children: [{ label: "Media", value: 6800 }, { label: "Backups", value: 4100 }, { label: "Logs", value: 2700 }] },
      { label: "Block storage", value: 5200 },
    ],
  },
  // ... Databases, Network, Observability
];

export function Example() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <ChartCard
      title="Cloud spend"
      legend={sunburstLegend(spend)}
      table={<SunburstTable data={spend} format={formatUsd} caption="Spend by service" />}
    >
      <SunburstChart
        data={spend}
        path={path}
        onPathChange={setPath}
        format={formatUsd}
        aria-label="Monthly cloud spend by service"
      />
    </ChartCard>
  );
}`}
    >
      <ChartCard
        className="w-full"
        title="Cloud spend"
        description="October, by service"
        aside={<Headline value={cloudTotal} label="this month" currency />}
        legend={sunburstLegend(cloudSpend)}
        table={<SunburstTable data={cloudSpend} format={formatUsd} caption="Spend by service" />}
      >
        <SunburstChart
          data={cloudSpend}
          path={path}
          onPathChange={setPath}
          format={formatUsd}
          aria-label="Monthly cloud spend by service"
        />
      </ChartCard>
    </Example>
  );
}

export const browsers: SunburstNode[] = [
  { label: "Chrome", value: 64.8 },
  { label: "Safari", value: 18.6 },
  { label: "Edge", value: 5.3 },
  { label: "Firefox", value: 2.7 },
  { label: "Mobile", value: 2.4 },
  { label: "Other", value: 6.2 },
];
