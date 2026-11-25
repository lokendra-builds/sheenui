// The keyboard-instructions label is one key on every chart: `labels.instructions`, a string or a function of a
// small layout context (LollipopChart and BoxPlot pass `{ horizontal }`, Beeswarm passes `{ rows }`).
// Also the two helpers behind it and the data keys reported by the cell-click callbacks.
import { describe, expect, it } from "vitest";

import { BoxPlot } from "../../src/components/charts/box-plot";
import { Beeswarm } from "../../src/components/charts/beeswarm";
import { LollipopChart } from "../../src/components/charts/lollipop-chart";
import { itemAt, resolveInstructions } from "../../src/components/charts/chart-utils";
import { renderUi } from "../render";
import { box, chartGroup, figureText } from "../helpers-charts";

describe("resolveInstructions", () => {
  it("returns a string as it is", () => {
    expect(resolveInstructions("Use the arrow keys.")).toBe("Use the arrow keys.");
  });

  it("calls a function with the context", () => {
    expect(
      resolveInstructions(
        ({ horizontal }: { horizontal: boolean }) => (horizontal ? "up and down" : "left and right"),
        { horizontal: true },
      ),
    ).toBe("up and down");
  });

  it("calls a function without a context for charts that have none", () => {
    expect(resolveInstructions(() => "Pfeiltasten")).toBe("Pfeiltasten");
  });
});

describe("itemAt", () => {
  it("returns the item at an index in range", () => {
    expect(itemAt(["a", "b"], 1)).toBe("b");
    expect(itemAt(new Float64Array([1.5, 2.5]), 0)).toBe(1.5);
  });

  it("throws a RangeError instead of returning undefined", () => {
    expect(() => itemAt(["a"], 3)).toThrow(RangeError);
  });
});

const cities = [
  { label: "Berlin", value: 82 },
  { label: "Paris", value: 74 },
];

describe("labels.instructions takes a string or a function", () => {
  it("LollipopChart: a function receives { horizontal } for each layout", async () => {
    const instructions = ({ horizontal }: { horizontal: boolean }) => (horizontal ? "H-keys" : "V-keys");
    const { unmount } = renderUi(
      box(<LollipopChart data={cities} aria-label="Cities" layout="horizontal" labels={{ instructions }} />),
    );
    expect(figureText(await chartGroup("Cities"))).toContain("H-keys");
    unmount();
    renderUi(box(<LollipopChart data={cities} aria-label="Cities" labels={{ instructions }} />));
    expect(figureText(await chartGroup("Cities"))).toContain("V-keys");
  });

  it("LollipopChart: a plain string works (it used to throw)", async () => {
    renderUi(
      box(<LollipopChart data={cities} aria-label="Cities" labels={{ instructions: "Mit Pfeiltasten lesen." }} />),
    );
    expect(figureText(await chartGroup("Cities"))).toContain("Mit Pfeiltasten lesen.");
  });

  it("BoxPlot: a plain string works (it used to throw)", async () => {
    const plans = [{ label: "Free", values: [2, 3, 3, 4, 5, 6, 9] }];
    renderUi(box(<BoxPlot data={plans} aria-label="Sessions" labels={{ instructions: "Mit Pfeiltasten lesen." }} />));
    expect(figureText(await chartGroup("Sessions"))).toContain("Mit Pfeiltasten lesen.");
  });

  it("Beeswarm: a function receives { rows }", async () => {
    const points = [
      { value: 12, group: "EU" },
      { value: 30, group: "US" },
    ];
    renderUi(
      box(
        <Beeswarm
          data={points}
          aria-label="Orders"
          labels={{ instructions: ({ rows }: { rows: boolean }) => (rows ? "rows-keys" : "swarm-keys") }}
        />,
      ),
    );
    expect(figureText(await chartGroup("Orders"))).toContain("rows-keys");
  });
});
