import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Slider } from "../../src/components/slider/slider";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("translates the range thumb names with labels", () => {
    renderUi(<Slider defaultValue={[10, 90]} labels={{ minimum: "Min", maximum: "Max" }} />, variant);
    expect(screen.getByRole("slider", { name: "Min" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Max" })).toBeInTheDocument();
  });

  it("names the thumb through aria-labelledby pointing at the visible label", () => {
    renderUi(<Slider label="Volume" defaultValue={30} />, variant);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    const labelId = thumb.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent("Volume");
  });

  it("is a labelled slider with min/max/value", () => {
    renderUi(<Slider label="Volume" defaultValue={30} />, variant);
    const s = screen.getByRole("slider", { name: "Volume" });
    // The thumb's <input type="range"> carries min / max natively.
    expect(s).toHaveAttribute("min", "0");
    expect(s).toHaveAttribute("max", "100");
    expect(s).toHaveValue("30");
    // The value readout next to the label.
    expect(document.querySelector("output")).toHaveTextContent("30");
  });

  it("arrow keys step, Shift+Arrow/Page keys take big steps, Home/End jump", async () => {
    const onValueChange = vi.fn();
    renderUi(<Slider label="Volume" defaultValue={50} step={5} onValueChange={onValueChange} />, variant);
    const s = screen.getByRole("slider", { name: "Volume" });
    s.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(s).toHaveValue("55");
    await userEvent.keyboard("{ArrowDown}");
    expect(s).toHaveValue("50");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(s).toHaveValue("40");
    await userEvent.keyboard("{PageUp}");
    expect(Number((s as HTMLInputElement).value)).toBeGreaterThan(40);
    await userEvent.keyboard("{End}");
    expect(s).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    expect(s).toHaveValue("0");
    // Never goes outside [min, max].
    await userEvent.keyboard("{ArrowLeft}");
    expect(s).toHaveValue("0");
    expect(onValueChange).toHaveBeenCalledWith(55);
  });

  it("clicking the track moves the thumb there", async () => {
    renderUi(<Slider label="Volume" defaultValue={0} />, variant);
    const s = screen.getByRole("slider", { name: "Volume" });
    const track = document.querySelector<HTMLElement>("[data-slot=slider-track], [class*='sheen-control-border']")!;
    const r = track.getBoundingClientRect();
    await userEvent.click(track, { position: { x: Math.round(r.width * 0.75), y: Math.round(r.height / 2) } });
    await expect.poll(() => Number((s as HTMLInputElement).value)).toBeGreaterThan(60);
  });

  it("range: two thumbs named Minimum and Maximum that cannot cross", async () => {
    const onValueChange = vi.fn();
    renderUi(<Slider label="Price" defaultValue={[20, 80]} onValueChange={onValueChange} />, variant);
    const min = screen.getByRole("slider", { name: "Minimum" });
    const max = screen.getByRole("slider", { name: "Maximum" });
    expect(min).toHaveValue("20");
    expect(max).toHaveValue("80");
    max.focus();
    await userEvent.keyboard("{Home}");
    expect(Number((max as HTMLInputElement).value)).toBeGreaterThanOrEqual(20);
    expect(onValueChange).toHaveBeenCalled();
    expect(Array.isArray(onValueChange.mock.lastCall![0])).toBe(true);
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState<number | number[]>(10);
      return (
        <>
          <Slider label="Level" value={v} onValueChange={setV} />
          <button onClick={() => setV(90)}>Max</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    const s = screen.getByRole("slider", { name: "Level" });
    expect(s).toHaveValue("10");
    await userEvent.click(screen.getByRole("button", { name: "Max" }));
    expect(s).toHaveValue("90");
  });

  it("honours custom min/max/step and showValue={false}", () => {
    renderUi(<Slider aria-label="Opacity" min={10} max={20} step={2} defaultValue={14} showValue={false} />, variant);
    const s = screen.getByRole("slider", { name: "Opacity" });
    expect(s).toHaveAttribute("min", "10");
    expect(s).toHaveAttribute("max", "20");
    expect(s).toHaveAttribute("step", "2");
    expect(document.querySelector("output")).toBeNull();
  });

  it("disabled sliders cannot be focused", async () => {
    renderUi(<Slider label="Locked" defaultValue={40} disabled />, variant);
    const s = screen.getByRole("slider", { name: "Locked" });
    expect(s).toBeDisabled();
    await userEvent.tab();
    expect(s).not.toHaveFocus();
  });

  it("has no axe violations (single and range)", async () => {
    renderUi(
      <div className="grid gap-6">
        <Slider label="Volume" defaultValue={30} />
        <Slider label="Price" defaultValue={[10, 60]} />
        <Slider aria-label="Bare" defaultValue={5} showValue={false} />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

// Outside describeVariants: warnOnce prints each message once per page load, so this runs a single time.
it("warns in development when a single slider has no accessible name", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  renderUi(<Slider defaultValue={30} />);
  expect(warn.mock.calls.some((c) => String(c[0]).includes("Slider: no accessible name"))).toBe(true);
  warn.mockRestore();
});
