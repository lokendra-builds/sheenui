import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Progress } from "../../src/components/progress/progress";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const fill = () => document.querySelector<HTMLElement>("[data-slot=progress-indicator], [class*='sheen-fill']")!;

describeVariants((variant) => {
  it("is a labelled progressbar with its value and a percentage readout", () => {
    renderUi(<Progress label="Uploading" value={42} locale="en-US" />, variant);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveTextContent("42%");
  });

  it("slides the fill with a transform: 0 -> -100%, 100 -> 0", () => {
    const { rerender } = renderUi(<Progress label="P" value={0} />, variant);
    expect(fill().style.transform).toBe("translateX(-100%)");
    rerender(<Progress label="P" value={100} />);
    expect(fill().style.transform).toBe("translateX(0%)");
    rerender(<Progress label="P" value={25} />);
    expect(fill().style.transform).toBe("translateX(-75%)");
  });

  it("clamps the visual fill for out-of-range values", () => {
    const { rerender } = renderUi(<Progress label="P" value={150} />, variant);
    expect(fill().style.transform).toBe("translateX(0%)");
    rerender(<Progress label="P" value={-20} />);
    expect(fill().style.transform).toBe("translateX(-100%)");
  });

  it("null is indeterminate: no valuenow and no percentage", () => {
    renderUi(<Progress label="Loading" value={null} />, variant);
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveTextContent("%");
    expect(fill()).toHaveAttribute("data-indeterminate");
  });

  it("showValue={false} hides the readout and the bar is nameable via aria-label", () => {
    renderUi(<Progress value={60} showValue={false} aria-label="Install" {...({} as object)} />, variant);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).not.toHaveTextContent("60");
  });

  it("formats the percentage with the given locale", () => {
    renderUi(<Progress label="DE" value={18} locale="de-DE" />, variant);
    // German writes "18 %" with a (narrow) no-break space.
    expect(screen.getByRole("progressbar", { name: "DE" }).textContent).toMatch(/18\s%/);
  });

  it("has no axe violations (determinate and indeterminate)", async () => {
    renderUi(
      <div className="grid gap-4">
        <Progress label="Determinate" value={64} />
        <Progress label="Indeterminate" value={null} />
        <Progress label="Done" value={100} />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the indeterminate bar is a still full-width half-tone bar", () => {
  reduceMotion();
  renderUi(<Progress label="Loading" value={null} />);
  expect(getComputedStyle(fill()).animationName).toBe("none");
  expect(Number(getComputedStyle(fill()).opacity)).toBeCloseTo(0.5, 1);
});

it("normally the indeterminate bar animates", () => {
  renderUi(<Progress label="Loading" value={null} />);
  expect(getComputedStyle(fill()).animationName).not.toBe("none");
});
