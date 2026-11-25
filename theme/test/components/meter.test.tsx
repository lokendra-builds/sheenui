import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Meter, getMeterLevel } from "../../src/components/meter/meter";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("is a labelled meter with min/max/now and a description", () => {
    renderUi(<Meter label="Storage" description="4.2 GB of 16 GB used" value={26} />, variant);
    const m = screen.getByRole("meter", { name: "Storage" });
    expect(m).toHaveAttribute("aria-valuenow", "26");
    expect(m).toHaveAttribute("aria-valuemin", "0");
    expect(m).toHaveAttribute("aria-valuemax", "100");
    expect(m).toHaveAccessibleDescription("4.2 GB of 16 GB used");
  });

  it("levels (low/high/optimum) colour the bar and add the level word to aria-valuetext", () => {
    renderUi(
      <>
        <Meter label="Good" value={50} low={30} high={80} showLevel />
        <Meter label="Warn" value={90} low={30} high={80} showLevel />
        <Meter label="Bad" value={90} low={30} high={80} optimum={10} showLevel />
      </>,
      variant,
    );
    expect(screen.getByRole("meter", { name: "Good" })).toHaveAttribute("data-level", "optimum");
    expect(screen.getByRole("meter", { name: "Good" }).getAttribute("aria-valuetext")).toMatch(/Good$/);
    expect(screen.getByRole("meter", { name: "Warn" })).toHaveAttribute("data-level", "suboptimal");
    expect(screen.getByRole("meter", { name: "Warn" }).getAttribute("aria-valuetext")).toMatch(/Warning$/);
    expect(screen.getByRole("meter", { name: "Bad" })).toHaveAttribute("data-level", "critical");
    expect(screen.getByRole("meter", { name: "Bad" }).getAttribute("aria-valuetext")).toMatch(/Critical$/);
    // The visible level word is hidden from AT (it is already in aria-valuetext).
    expect(screen.getByText("Critical")).toHaveAttribute("aria-hidden", "true");
  });

  it("levelLabels overrides the words (i18n)", () => {
    renderUi(
      <Meter
        label="Akku"
        value={10}
        low={20}
        high={80}
        optimum={100}
        showLevel
        levelLabels={{ critical: "Kritisch" }}
      />,
      variant,
    );
    expect(screen.getByRole("meter", { name: "Akku" }).getAttribute("aria-valuetext")).toMatch(/Kritisch$/);
    expect(screen.getByText("Kritisch")).toBeInTheDocument();
  });

  it("valueText: custom node, function, or false to hide the readout", () => {
    renderUi(
      <>
        <Meter label="A" value={42} valueText="42 of 100 seats" />
        <Meter label="B" value={42} valueText={(formatted, v) => `${v} items (${formatted})`} />
        <Meter label="C" value={42} valueText={false} />
      </>,
      variant,
    );
    expect(screen.getByRole("meter", { name: "A" }).getAttribute("aria-valuetext")).toBe("42 of 100 seats");
    expect(screen.getByText("42 of 100 seats")).toBeInTheDocument();
    expect(screen.getByText(/^42 items \(/)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "C" }).textContent).not.toMatch(/42/);
  });

  it("clamps out-of-range and NaN values", () => {
    renderUi(
      <>
        <Meter label="Over" value={500} />
        <Meter label="Under" value={-5} />
        <Meter label="NaN" value={Number.NaN} />
      </>,
      variant,
    );
    expect(screen.getByRole("meter", { name: "Over" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("meter", { name: "Under" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("meter", { name: "NaN" })).toHaveAttribute("aria-valuenow", "0");
  });

  it("segmented variant renders the requested number of cells (min 2)", () => {
    renderUi(
      <>
        <Meter label="Battery" value={60} variant="segmented" segments={5} />
        <Meter label="Signal" value={60} variant="segmented" segments={1} />
      </>,
      variant,
    );
    const cells = (name: string) =>
      screen.getByRole("meter", { name }).querySelectorAll("[data-segment], [class*='flex-1']");
    expect(cells("Battery").length).toBeGreaterThanOrEqual(5);
    expect(cells("Signal").length).toBeGreaterThanOrEqual(2);
  });

  it("works without a visible label when aria-label is given", () => {
    renderUi(<Meter aria-label="CPU load" value={30} />, variant);
    expect(screen.getByRole("meter", { name: "CPU load" })).toBeInTheDocument();
  });

  it("has no axe violations (bar, segmented, levels, thresholds)", async () => {
    renderUi(
      <div className="grid gap-4">
        <Meter label="Disk" value={72} low={50} high={85} optimum={20} showLevel description="Almost full" />
        <Meter label="Battery" value={40} variant="segmented" low={20} high={80} optimum={100} showLevel />
        <Meter label="Plain" value={10} size="lg" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the number is at its value straight away", async () => {
  reduceMotion();
  renderUi(<Meter label="Disk" value={64} />);
  await expect.poll(() => screen.getByRole("meter", { name: "Disk" }).textContent).toMatch(/64/);
});

it("getMeterLevel follows the HTML <meter> regions", () => {
  expect(getMeterLevel(50, { min: 0, max: 100 })).toBeNull();
  expect(getMeterLevel(50, { min: 0, max: 100, low: 30, high: 80 })).toBe("optimum");
  expect(getMeterLevel(10, { min: 0, max: 100, low: 30, high: 80 })).toBe("suboptimal");
  // optimum below `low`: low is best, middle is so-so, high is worst.
  expect(getMeterLevel(10, { min: 0, max: 100, low: 30, high: 80, optimum: 5 })).toBe("optimum");
  expect(getMeterLevel(50, { min: 0, max: 100, low: 30, high: 80, optimum: 5 })).toBe("suboptimal");
  expect(getMeterLevel(95, { min: 0, max: 100, low: 30, high: 80, optimum: 5 })).toBe("critical");
  // optimum above `high`: mirrored.
  expect(getMeterLevel(95, { min: 0, max: 100, low: 30, high: 80, optimum: 100 })).toBe("optimum");
  expect(getMeterLevel(5, { min: 0, max: 100, low: 30, high: 80, optimum: 100 })).toBe("critical");
});
