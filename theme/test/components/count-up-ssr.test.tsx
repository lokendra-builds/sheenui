import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { GaugeChart } from "../../src/components/charts/gauge-chart";
import { ChartWidthHint } from "../../src/components/charts/chart-utils";
import { Meter } from "../../src/components/meter/meter";

const text = (html: string) => html.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");

// The server render (crawlers, no-JS) shows the real reading; the count-up runs only once the page is live.
it("Meter renders its final value and a full fill in the server HTML", () => {
  const html = renderToString(<Meter value={34} aria-label="CPU" />);
  expect(text(html)).toContain("34%");
  expect(html).toContain("translateX(-66%)");
  const segments = renderToString(<Meter value={100} label="Disk" variant="segmented" segments={2} />);
  expect(segments).toMatch(/transform:(none|scaleX\(1\))/);
  expect(segments).not.toContain("scaleX(0)");
});

it("GaugeChart renders its final value in the server HTML, with or without a custom format", () => {
  const plain = renderToString(
    <ChartWidthHint.Provider value={400}>
      <GaugeChart value={72} min={0} max={100} aria-label="CPU" />
    </ChartWidthHint.Provider>,
  );
  expect(text(plain)).toContain("|72|");
  const own = renderToString(
    <ChartWidthHint.Provider value={400}>
      <GaugeChart value={72} min={0} max={100} aria-label="CPU" format={(n) => `${Math.round(n)} pts`} />
    </ChartWidthHint.Provider>,
  );
  expect(text(own)).toContain("|72 pts|");
});
