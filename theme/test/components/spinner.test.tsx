import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Spinner } from "../../src/components/spinner/spinner";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("is a status region named Loading, with a hidden label by default", () => {
    renderUi(<Spinner />, variant);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading");
    expect(screen.getByText("Loading")).toHaveClass("sr-only");
    expect(status.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("showLabel prints the label; labels translate it", () => {
    renderUi(<Spinner showLabel labels={{ loading: "Chargement" }} />, variant);
    expect(screen.getByText("Chargement")).not.toHaveClass("sr-only");
  });

  it("sizes and tones change the ring", () => {
    renderUi(<Spinner size="xl" tone="muted" data-testid="s" />, variant);
    expect(screen.getByTestId("s").querySelector("svg")).toHaveClass("size-12");
    expect(screen.getByTestId("s")).toHaveClass("text-sheen-fg-muted");
  });

  it("spins forever at normal motion: the ring runs the sheen-spin animation", () => {
    renderUi(<Spinner />, variant);
    const ring = screen.getByRole("status").querySelector("svg")!;
    const style = getComputedStyle(ring);
    expect(style.animationName).toContain("sheen-spin");
    expect(style.animationIterationCount).toBe("infinite");
    expect(style.animationTimingFunction).toBe("linear");
    expect(parseFloat(style.animationDuration)).toBeGreaterThan(0.1);
  });

  it("does not rotate under reduced motion: no animation, a static arc on its track, the same label", async () => {
    renderUi(<Spinner showLabel />, variant);
    const status = screen.getByRole("status");
    const ring = status.querySelector("svg")!;
    expect(getComputedStyle(ring).animationName).toContain("sheen-spin");
    reduceMotion();
    await expect.poll(() => getComputedStyle(ring).animationName).toBe("none");
    // Nothing turns: no transform is applied either, whatever moment it is sampled.
    expect(getComputedStyle(ring).transform).toBe("none");
    // The indicator is still there: the track and the arc, and the announcement is unchanged.
    expect(ring.querySelectorAll("circle, path")).toHaveLength(2);
    expect(ring).toHaveAttribute("aria-hidden", "true");
    expect(status).toHaveTextContent("Loading");
    expect(status).toBeVisible();
  });

  it("has no axe violations", async () => {
    renderUi(<Spinner showLabel />, variant);
    expect(await runAxe()).toHaveNoViolations();
  });
});
