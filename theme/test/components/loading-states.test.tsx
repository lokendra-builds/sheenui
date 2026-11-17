import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { ChartCard } from "../../src/components/charts/chart-parts";
import { Select } from "../../src/components/select/select";
import { renderUi } from "../render";

it("ChartCard loading shows a named skeleton status instead of the chart", () => {
  renderUi(
    <ChartCard title="Revenue">
      <p>the chart</p>
    </ChartCard>,
  );
  expect(screen.getByText("the chart")).toBeInTheDocument();
});

it("ChartCard loading={true} swaps the chart for a polite status and loading labels translate it", () => {
  renderUi(
    <ChartCard title="Revenue" loading labels={{ loading: "Chargement" }}>
      <p>the chart</p>
    </ChartCard>,
  );
  expect(screen.queryByText("the chart")).toBeNull();
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
});

it("Select loading marks the trigger busy and shows a spinner instead of the chevron", () => {
  renderUi(<Select label="City" items={[]} loading />);
  const trigger = screen.getByRole("combobox", { name: "City" });
  expect(trigger).toHaveAttribute("aria-busy", "true");
  expect(trigger.querySelector(".sheen-spinner")).not.toBeNull();
});
