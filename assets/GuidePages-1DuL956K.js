import{t as e}from"./GuideArticle-HJW9W3wR.js";import"./guides-BOD_LkRi.js";import"./guide-images-CcTVZ8vq.js";import"./router-gsYXKOBR.js";import{t}from"./vendor-react-D30i__oY.js";var n=`---
title: "Accessible React Charts with a Table Fallback | SheenUI"
description: "Accessible React charts with a table fallback: color-blind-safe palettes, keyboard reading, screen-reader summaries, never relying on color. Tested code."
slug: "accessible-react-charts"
route: "/guides/accessible-react-charts"
targetKeyword: "accessible react charts"
secondaryKeywords: ["colorblind safe chart colors", "react chart keyboard navigation", "chart accessibility"]
published: "2026-11-08"
updated: "2026-11-15"
relatedRoutes: ["/charts", "/charts/heatmap", "/charts/pie-chart", "/components/meter", "/dashboards/saas"]
---

# Accessible React Charts

Accessible React charts need four things: colors that stay distinct for color-blind readers, a way to read values from the keyboard, a text summary for screen readers, and a table of the same data. Everything else, such as animation and tooltips, is decoration on top of those four. Every SheenUI chart ships a table fallback: the Chart / Table tabs switch to a real HTML table with the same values, so no number depends on color, hover or sight.

The table view is one prop on the card (the full example is in the table fallback section below):

\`\`\`tsx fragment
// data and series as in the full example below
declare const data: ChartRow[];
declare const series: CompareSeries[];

<ChartCard title="Revenue by channel" table={<ChartTable data={data} index="month" series={series} />}>
  <LineChart data={data} index="month" series={series} aria-label="Monthly revenue by channel" />
</ChartCard>
\`\`\`

This guide shows each rule with code, including a palette check we wrote and ran, and a keyboard test we ran against SheenUI's chart gallery on 8 Nov 2026. Read it as a chart accessibility checklist you can run against any library. SheenUI is our library; we say so wherever its behavior is the example. See the [charts gallery](https://lokendra-builds.github.io/sheenui/charts/) for the live versions.

Basis: the WCAG 2.2 criteria as linked, the palette check and the keyboard test described below (the text says the keyboard test was run against SheenUI's chart gallery on 8 Nov 2026) and SheenUI's own source. First published 8 Nov 2026, last revised 15 Nov 2026; a revision date marks an edit of the text, not a new test run.

## The four rules

1. **Color is never the only carrier.** WCAG's [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) criterion says information cannot rest on color alone. Every series needs a second cue: a label, a legend key shape, a dash style.
2. **Keyboard reading.** Someone who cannot use a pointer must be able to move through the data points and hear or see each value.
3. **A summary and an accessible name.** A screen reader should hear what the chart is and what it shows before it reads any point.
4. **A table view.** A real \`<table>\` with the same values is the most reliable accessible view of any chart.

## Color-blind-safe palettes

Colorblind safe chart colors have to hold up in three ways: the colors must stand apart from each other for normal vision and for the common kinds of color-blindness, and each must have enough contrast against the chart surface.

SheenUI's token file defines eight categorical slots, assigned in a fixed order and never cycled; a ninth series is drawn in neutral gray, so you fold extra series into "Other". Its comments say the palette was validated with a lightness band, a chroma floor, color-blind separation of adjacent slots and a normal-vision floor, against its light (\`#f6f6fa\`) and dark (\`#1d1e29\`) surfaces. We did not reproduce those checks. Instead we wrote an independent one that you can run on any palette: contrast against the surface, and the distance between colors after simulating color-blindness with the matrices from [Machado, Oliveira and Fernandes (2009)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) at severity 1.0, measured in [OKLab](https://bottosson.github.io/posts/oklab/) and scaled by 100. The authors' page does not state the color space; we apply the matrices to linear sRGB, which is the usual convention, and another choice would shift the numbers slightly.

\`\`\`ts
// file: palette-check.ts
type RGB = [number, number, number];

const palette = {
  light: ["#4a3aa7", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#2a78d6", "#e34948"],
  dark: ["#9085e9", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#3987e5", "#e66767"],
};
const surface = { light: "#f6f6fa", dark: "#1d1e29" };

const cvd = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
} as const;

const toRgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const toLinear = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (c: RGB) => 0.2126 * toLinear(c[0]) + 0.7152 * toLinear(c[1]) + 0.0722 * toLinear(c[2]);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

function oklab([r, g, b]: RGB): RGB {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function simulate(color: RGB, kind: keyof typeof cvd | "normal"): RGB {
  if (kind === "normal") return color;
  const linear = color.map(toLinear);
  return cvd[kind].map((row) => {
    const v = Math.min(1, Math.max(0, row[0] * linear[0]! + row[1] * linear[1]! + row[2] * linear[2]!));
    return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055) * 255);
  }) as RGB;
}

const distance = (a: RGB, b: RGB) => 100 * Math.hypot(...(oklab(a).map((v, i) => v - oklab(b)[i]!) as RGB));

for (const theme of ["light", "dark"] as const) {
  const colors = palette[theme].map(toRgb);
  console.log(\`\${theme}: contrast against \${surface[theme]}\`, colors.map((c) => contrast(c, toRgb(surface[theme])).toFixed(1)).join(" "));
  for (const kind of ["normal", "protan", "deutan", "tritan"] as const) {
    const seen = colors.map((c) => simulate(c, kind));
    let worst = { pair: "", d: Infinity };
    for (let i = 0; i < seen.length; i++) {
      for (let j = i + 1; j < seen.length; j++) {
        const d = distance(seen[i]!, seen[j]!);
        if (d < worst.d) worst = { pair: \`\${i + 1}-\${j + 1}\`, d };
      }
    }
    const adjacent = Math.min(...seen.slice(1).map((c, i) => distance(seen[i]!, c)));
    console.log(\`  \${kind}: closest pair \${worst.pair} at \${worst.d.toFixed(1)}, closest adjacent slots \${adjacent.toFixed(1)}\`);
  }
}
\`\`\`

Here is what it printed for SheenUI's eight slots (the "adjacent" column is the closest two neighboring slots; "any pair" is the closest of all 28):

| Theme and vision | Closest adjacent slots | Closest pair of any two slots |
|---|---|---|
| Light, normal | 19.6 | 7.1 (slots 2 and 8) |
| Light, protanopia | 9.1 | 3.3 (slots 2 and 6) |
| Light, deuteranopia | 9.2 | 5.7 (slots 2 and 8) |
| Light, tritanopia | 6.0 | 5.1 (slots 2 and 8) |
| Dark, normal | 19.3 | 7.1 (slots 2 and 8) |
| Dark, protanopia | 8.3 | 1.8 (slots 1 and 7) |
| Dark, deuteranopia | 9.3 | 1.5 (slots 3 and 5) |
| Dark, tritanopia | 8.6 | 2.9 (slots 2 and 5) |

Contrast against the surface, slots 1 to 8, was 7.9, 3.0, 2.6, 2.0, 2.5, 4.6, 4.1 and 3.7 in light and 5.3, 4.3, 4.9, 5.4, 4.2, 3.3, 4.5 and 5.1 in dark.

Read these honestly. Neighboring slots stay apart in every simulation, which is what a fixed-order palette can promise. But non-neighbors can nearly collide: in dark mode, slots 3 and 5 are 1.5 apart under deuteranopia, a very small distance. And on the light surface slots 2 to 5 fall under the 3:1 that [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks for graphics, which SheenUI's own comments also note. So no categorical palette alone makes a chart accessible. That is the case for the next three rules, and for assigning each series a fixed slot so that filtering never recolors it.

## Never color alone: labels, patterns and icons

Give every series a second cue the reader can use without color:

- **Direct labels.** \`LineChart\` can label the end of each line (\`endLabels\`) when they do not collide, and \`BarChart\` can print values (\`showValues\`).
- **Shape and dash.** A previous-period line is dashed and muted, and legend keys are drawn as SVG, not CSS backgrounds, so they survive forced colors, where they also gain a \`CanvasText\` outline.
- **A legend that works.** Legend items name each series, and in SheenUI they are toggle buttons, so a reader can isolate one series.

SheenUI's bar, line and area charts do not use pattern fills (its heatmap and map hatch cells with missing data); where color cannot be enough it relies on the legend, direct labels and the table. If your chart has more than a few series, add patterns yourself.

## Keyboard reading and tooltips

React chart keyboard navigation should be one focus stop, with arrow keys moving through points. We checked how SheenUI's charts behave, against the live gallery:

\`\`\`ts
// file: keyboard-check.ts
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:5180/sheenui/charts");
await page.waitForSelector('svg[aria-roledescription="chart"]');

const announced = () =>
  page.evaluate(() => [...document.querySelectorAll('[aria-live="polite"]')].map((el) => el.textContent?.trim()).filter(Boolean));

await page.locator('svg[role="figure"][tabindex="0"]').first().focus();
for (const key of ["ArrowRight", "ArrowRight", "End", "Escape"]) {
  await page.keyboard.press(key);
  await page.waitForTimeout(300);
  console.log(key, await announced());
}
await browser.close();
\`\`\`

Each interactive chart is an \`svg\` with \`role="figure"\`, \`aria-roledescription="chart"\` and \`tabindex="0"\`. The accessible name is the chart title; the instructions ("Use left and right arrow keys to read values.") are its description (\`aria-describedby\`, a \`<desc>\` inside the svg). Inside a \`ChartCard\` with a \`table\`, \`aria-details\` points at the table view, the full text alternative. A chart that is not interactive is not a tab stop. ArrowRight announced "Aug 21: Organic $6,882, Organic (previous) $5,678, Paid $3,672, Paid (previous) $3,172" through a polite live region; End jumped to the last point and Escape cleared the selection. The tooltip showed the same values for sighted keyboard users, and the focus outline is a real \`outline\` that holds up in forced colors.

## Table fallback: a data table for every chart

The name should say what the chart is and give the headline facts. SheenUI's \`Sparkline\` generates a summary and appends it to your label; on the gallery page we read "Orders trend: 42 points, min 186, max 381, latest 267". A function that produces the same kind of label:

\`\`\`ts
export function summarize(label: string, values: number[], format: (n: number) => string = String) {
  if (values.length === 0) return \`\${label}: no data\`;
  const latest = values[values.length - 1] as number;
  return \`\${label}: \${values.length} points, min \${format(Math.min(...values))}, max \${format(Math.max(...values))}, latest \${format(latest)}\`;
}
\`\`\`

Then provide the table. In SheenUI, \`ChartCard\` takes a \`table\` prop and shows Chart and Table tabs; the table is a real \`<table>\` with a caption and header cells, and it scrolls inside a focusable region if it is wider than the card. SheenUI's chart docs say every chart has a table view:

\`\`\`tsx
import { ChartCard } from "@/components/sheenui/charts/chart-parts/chart-card";
import { ChartTable } from "@/components/sheenui/charts/chart-parts/empty-table";
import { seriesLegend } from "@/components/sheenui/charts/chart-parts/legend-tooltip";
import { type ChartRow, type CompareSeries } from "@/components/sheenui/charts/chart-utils";
import { LineChart } from "@/components/sheenui/charts/line-chart";
// Package build (after the first npm release, or a packed tarball): import { ChartCard, ChartTable, LineChart, seriesLegend, type ChartRow, type CompareSeries } from "@sheenui/theme";

const data: ChartRow[] = [
  { month: "Jan", organic: 4200, paid: 1800 },
  { month: "Feb", organic: 4900, paid: 2100 },
  { month: "Mar", organic: 5600, paid: 2600 },
];
const series: CompareSeries[] = [
  { key: "organic", label: "Organic", color: 1 },
  { key: "paid", label: "Paid", color: 2 },
];
const usd = (n: number) => \`$\${n.toLocaleString("en")}\`;

export function Revenue() {
  return (
    <ChartCard
      title="Revenue by channel"
      description="Monthly, US dollars"
      legend={seriesLegend(series, "line")}
      table={<ChartTable data={data} index="month" indexLabel="Month" series={series} format={usd} caption="Monthly revenue by channel" />}
    >
      <LineChart data={data} index="month" series={series} format={usd} aria-label="Monthly revenue by channel, organic and paid" endLabels />
    </ChartCard>
  );
}
\`\`\`

The \`aria-label\` is required on the charts and names what is plotted. Use a descriptive one, not "Chart".

## Reduced motion for animated charts

Chart animation is fine until it plays on every update. Respect the OS setting, and keep the end state identical. In your own SVG charts, drop the entrance when motion is reduced:

\`\`\`tsx
import { motion, useReducedMotion } from "motion/react";

export function Bars({ values }: { values: number[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...values, 1);
  return (
    <svg role="img" aria-label={\`Bar chart, \${values.length} values, highest \${max}\`} viewBox="0 0 100 40" className="h-40 w-full">
      {values.map((value, i) => {
        const height = (value / max) * 36;
        return (
          <motion.rect
            key={i}
            x={i * 10 + 1}
            y={40 - height}
            width={8}
            height={height}
            rx={1.5}
            fill="currentColor"
            initial={reduce ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            style={{ originY: 1, transformBox: "fill-box" }}
            transition={reduce ? { duration: 0 } : { type: "spring", visualDuration: 0.4, bounce: 0.1, delay: i * 0.03 }}
          />
        );
      })}
    </svg>
  );
}
\`\`\`

SheenUI's charts read both the OS setting and an in-app toggle through \`useSheenReducedMotion\`. More patterns are in [Framer Motion examples](https://lokendra-builds.github.io/sheenui/guides/framer-motion-examples).

## Testing

- **Color-blindness.** Chromium can emulate vision deficiencies through the DevTools Protocol ([\`Emulation.setEmulatedVisionDeficiency\`](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/)). Screenshot your chart under \`deuteranopia\`, \`protanopia\` and \`tritanopia\`, and check that every series is still tellable from its neighbors and its legend.
- **Keyboard.** The script above is the model: focus, arrow through, read the announcement.
- **axe-core.** It catches missing names and roles, but cannot judge contrast over gradients; see [the accessible glassmorphism guide](https://lokendra-builds.github.io/sheenui/guides/accessible-glassmorphism) for pixel sampling.
- **Forced colors and zoom.** Emulate \`forced-colors: active\` and zoom to 400% at a 320 px width.

## When not to rely on these charts

A table view is not practical for thousands of points; offer a downloadable CSV and a summary of the key values instead (SheenUI's \`ChartCard\` has an \`exportable\` option for PNG, SVG and CSV). Eight colors is a hard ceiling for identification by color; past that, use labels. Complex chart types, such as Sankey or chord diagrams, need an extra written description of what the shape means. And a chart is the wrong tool for a single number: use text, or the [meter](https://lokendra-builds.github.io/sheenui/components/meter) for a level in a known range.

## Frequently asked questions

### How do I add a table fallback to an accessible React chart?

Render a real HTML table with the same values and offer it beside the chart, so no number depends on color, hover or sight. In SheenUI, pass \`table={<ChartTable ... />}\` to \`ChartCard\`: it shows Chart and Table tabs, the table has a caption and header cells, and it scrolls inside a focusable region when it is wider than the card. With your own chart, add a \`<table>\` of the data and point the chart's \`aria-details\` at it.

### How many colors can an accessible chart use?

As few as you can. Our check shows that even a carefully ordered eight-color palette can have close pairs for color-blind viewers, so beyond three or four series, rely on labels, direct values and the table.

### Do I need a table for every chart?

Provide some text alternative for every chart. A table is the most complete one, and it also serves people who simply prefer numbers. SheenUI's docs say each of its charts has one.

### Are red and green always a problem?

Red and green are the classic confusion pair, but our results show other combinations can collapse too, for example slots 3 and 5 in dark mode under deuteranopia. Test the actual pairs. How the theme switches between light and dark is in the [dark mode docs](https://lokendra-builds.github.io/sheenui/docs/dark-mode); the charts install as shown on the [installation page](https://lokendra-builds.github.io/sheenui/docs/installation).

### Does axe-core check charts?

It checks names, roles and some contrast, but it cannot verify that a chart's data is understandable. Test with the keyboard and a screen reader. See the [charts gallery](https://lokendra-builds.github.io/sheenui/charts/) and the [heatmap](https://lokendra-builds.github.io/sheenui/charts/heatmap) and [pie chart](https://lokendra-builds.github.io/sheenui/charts/pie-chart) pages for how SheenUI handles their tables.
`,r=t();function i(){return(0,r.jsx)(e,{slug:`accessible-react-charts`,markdown:n})}export{i as default};