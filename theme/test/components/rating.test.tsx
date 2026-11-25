import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Rating } from "../../src/components/rating/rating";
import { describeVariants, renderUi, runAxe } from "../render";

const checked = () => screen.queryAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true");

describeVariants((variant) => {
  it("is a named radiogroup with one radio per star", () => {
    renderUi(<Rating label="Quality" defaultValue={3} />, variant);
    expect(screen.getByRole("radiogroup", { name: "Quality" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["3 stars"]);
    expect(screen.getByRole("radio", { name: "1 star" })).toBeInTheDocument();
  });

  it("clicking a star picks it and reports the value; arrow keys step", async () => {
    const onValueChange = vi.fn();
    renderUi(<Rating aria-label="Rate" onValueChange={onValueChange} />, variant);
    await userEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["4 stars"]);
    await userEvent.keyboard("{ArrowRight}");
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["5 stars"]);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["3 stars"]);
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it("is a single tab stop", async () => {
    renderUi(
      <>
        <button>before</button>
        <Rating aria-label="Rate" defaultValue={2} />
        <button>after</button>
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "2 stars" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("allowHalf adds half-star radios with decimal names", async () => {
    renderUi(<Rating aria-label="Rate" allowHalf defaultValue={2.5} />, variant);
    expect(screen.getAllByRole("radio")).toHaveLength(10);
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["2.5 stars"]);
    await userEvent.click(screen.getByRole("radio", { name: "0.5 stars" }));
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["0.5 stars"]);
  });

  it("clearable: Backspace and Delete clear the rating and report null; the hint is described", async () => {
    const onValueChange = vi.fn();
    renderUi(<Rating aria-label="Rate" defaultValue={4} clearable onValueChange={onValueChange} />, variant);
    const group = screen.getByRole("radiogroup", { name: "Rate" });
    expect(group).toHaveAccessibleDescription("Press Backspace to clear");
    screen.getByRole("radio", { name: "4 stars" }).focus();
    await userEvent.keyboard("{Backspace}");
    expect(checked()).toHaveLength(0);
    await userEvent.click(screen.getByRole("radio", { name: "2 stars" }));
    await userEvent.keyboard("{Delete}");
    expect(checked()).toHaveLength(0);
  });

  it("clearable: clicking the current value clears it", async () => {
    renderUi(<Rating aria-label="Rate" defaultValue={3} clearable />, variant);
    await userEvent.click(screen.getByRole("radio", { name: "3 stars" }));
    await expect.poll(() => checked()).toHaveLength(0);
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<number | null>(1);
      return (
        <>
          <Rating aria-label="Rate" value={v} onValueChange={setV} />
          <button onClick={() => setV(5)}>five</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "five" }));
    expect(checked().map((r) => r.getAttribute("aria-label"))).toEqual(["5 stars"]);
  });

  it("readOnly is a single image named 'Rated 4 out of 5' with no radios", () => {
    renderUi(<Rating readOnly value={4} />, variant);
    expect(screen.getByRole("img", { name: "Rated 4 out of 5" })).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("disabled ratings cannot be changed", () => {
    const onValueChange = vi.fn();
    renderUi(<Rating aria-label="Rate" disabled defaultValue={2} onValueChange={onValueChange} />, variant);
    screen.getByRole("radio", { name: "5 stars" }).click();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("max, valueLabels and showValue", () => {
    renderUi(<Rating aria-label="Rate" max={3} valueLabels={["Poor", "Fine", "Great"]} defaultValue={2} />, variant);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByText("Fine")).toBeInTheDocument();
    renderUi(<Rating aria-label="Num" showValue defaultValue={4} />, variant);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("labels override the radio and read-only names (i18n); name submits with a form", async () => {
    renderUi(
      <form data-testid="f">
        <Rating aria-label="Bewertung" name="stars" labels={{ item: (v) => `${v} Sterne` }} />
        <Rating readOnly value={3} labels={{ readOnly: (v, m) => `Bewertet mit ${v} von ${m}` }} />
      </form>,
      variant,
    );
    await userEvent.click(screen.getByRole("radio", { name: "4 Sterne" }));
    expect(screen.getByRole("img", { name: "Bewertet mit 3 von 5" })).toBeInTheDocument();
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("stars")).toBe("4");
  });

  it("has no axe violations", async () => {
    renderUi(
      <div className="grid gap-4">
        <Rating label="Quality" description="How was it?" defaultValue={3} clearable />
        <Rating aria-label="Half" allowHalf defaultValue={2.5} />
        <Rating readOnly value={4.5} allowHalf showValue />
        <Rating aria-label="Off" disabled defaultValue={1} />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
