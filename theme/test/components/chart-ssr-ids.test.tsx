import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { BarList } from "../../src/components/charts/bar-list";
import { ChartWidthHint } from "../../src/components/charts/chart-utils";
import { SankeyChart } from "../../src/components/charts/sankey-chart";

const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
const links = [
  { source: "a", target: "b", value: 4 },
  { source: "b", target: "c", value: 3 },
];
const chart = (
  <ChartWidthHint.Provider value={600}>
    <SankeyChart nodes={nodes} links={links} aria-label="Flows" />
  </ChartWidthHint.Provider>
);

// A chart paints its marks by the `data-id` it rendered. The HTML parser turns NUL into U+FFFD, so an id with a NUL in it
// no longer matched after the prerendered page hydrated: the ribbons kept an empty `d` until the chart remounted.
it("SankeyChart keeps every mark id intact through the HTML parser, so a hydrated chart paints its ribbons", async () => {
  const html = renderToString(chart);
  expect(html).not.toContain("\u0000");
  const host = document.createElement("div");
  host.innerHTML = html; // parsed like a prerendered page
  document.body.append(host);
  act(() => {
    hydrateRoot(host, chart);
  });
  const ribbons = [...host.querySelectorAll<SVGPathElement>("path[pathLength][data-id]")];
  expect(ribbons.length).toBeGreaterThanOrEqual(2);
  await expect.poll(() => ribbons.every((p) => (p.getAttribute("d") ?? "") !== "")).toBe(true);
  host.remove();
});

it("BarList carries no NUL in its row keys", () => {
  const html = renderToString(<BarList data={[{ name: "A", value: 2 }]} aria-label="Rows" />);
  expect(html).not.toContain("\u0000");
});
