import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { SegmentedControl, type SegmentedControlItem } from "../../src/components/segmented/segmented";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const items: SegmentedControlItem[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
  { value: "year", label: "Year" },
];

const pressed = (name: string) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describeVariants((variant) => {
  it("is a named group of toggle buttons with the chosen segment pressed", () => {
    renderUi(<SegmentedControl aria-label="Range" items={items} defaultValue="week" />, variant);
    expect(screen.getByRole("group", { name: "Range" })).toBeInTheDocument();
    expect(pressed("Week")).toBe("true");
    expect(pressed("Day")).toBe("false");
    expect(screen.getByRole("button", { name: "Month" })).toBeDisabled();
  });

  it("click picks a segment and reports it; clicking the chosen one does nothing", async () => {
    const onValueChange = vi.fn();
    renderUi(
      <SegmentedControl aria-label="Range" items={items} defaultValue="day" onValueChange={onValueChange} />,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Year" }));
    expect(pressed("Year")).toBe("true");
    expect(pressed("Day")).toBe("false");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("year");
    await userEvent.click(screen.getByRole("button", { name: "Year" }));
    expect(pressed("Year")).toBe("true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("Tab lands on the chosen segment; arrows move focus (skipping disabled), Enter/Space pick, Home/End jump", async () => {
    renderUi(
      <>
        <button>before</button>
        <SegmentedControl aria-label="Range" items={items} defaultValue="week" />
        <button>after</button>
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    const week = screen.getByRole("button", { name: "Week" });
    expect(week).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    // Month is disabled, so focus skips to Year.
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Year" }));
    await userEvent.keyboard("{Enter}");
    expect(pressed("Year")).toBe("true");
    await userEvent.keyboard("{Home}");
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Day" }));
    await userEvent.keyboard(" ");
    expect(pressed("Day")).toBe("true");
    await userEvent.keyboard("{End}");
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Year" }));
    // One tab stop: Tab leaves the control.
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("day");
      return (
        <>
          <SegmentedControl aria-label="Range" items={items} value={v} onValueChange={setV} />
          <button onClick={() => setV("year")}>to year</button>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(screen.getByRole("button", { name: "to year" }));
    expect(pressed("Year")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(pressed("Week")).toBe("true");
  });

  it("iconOnly uses each label as the accessible name and tooltip", () => {
    const icon = <svg width="16" height="16" aria-hidden="true" />;
    renderUi(
      <SegmentedControl
        aria-label="View"
        iconOnly
        defaultValue="grid"
        items={[
          { value: "grid", label: "Grid view", icon },
          { value: "list", label: "List view", icon, "aria-label": "List" },
        ]}
      />,
      variant,
    );
    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("title", "Grid view");
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
  });

  it("fullWidth stretches across the container", () => {
    renderUi(
      <div style={{ width: 400 }}>
        <SegmentedControl aria-label="Range" items={items} fullWidth data-testid="seg" />
      </div>,
      variant,
    );
    const group = screen.getByRole("group", { name: "Range" });
    expect(Math.round(group.getBoundingClientRect().width)).toBe(400);
  });

  it("adaptive: in a very narrow container with icons on every segment it collapses to icons only", async () => {
    const icon = <svg width="16" height="16" aria-hidden="true" />;
    renderUi(
      <div style={{ width: 120 }}>
        <SegmentedControl
          aria-label="Layout"
          defaultValue="a"
          items={[
            { value: "a", label: "Overview", icon },
            { value: "b", label: "Analytics", icon },
            { value: "c", label: "Settings", icon },
          ]}
        />
      </div>,
      variant,
    );
    const group = screen.getByRole("group", { name: "Layout" });
    await expect.poll(() => group.getAttribute("data-fit")).toBe("icons");
    // It never widens the page.
    expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(121);
  });

  it("disabled disables every segment; name submits a hidden input", async () => {
    const { rerender } = renderUi(<SegmentedControl aria-label="Range" items={items} disabled />, variant);
    for (const b of screen.getAllByRole("button")) expect(b).toBeDisabled();
    rerender(
      <form data-testid="f">
        <SegmentedControl aria-label="Range" items={items} name="range" defaultValue="day" />
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(new FormData(screen.getByTestId<HTMLFormElement>("f")).get("range")).toBe("week");
  });

  it("has no axe violations", async () => {
    const icon = <svg width="16" height="16" aria-hidden="true" />;
    renderUi(
      <div className="grid gap-4">
        <SegmentedControl aria-label="Range" items={items} defaultValue="day" />
        <SegmentedControl
          aria-label="View"
          iconOnly
          items={[
            { value: "g", label: "Grid", icon },
            { value: "l", label: "List", icon },
          ]}
          defaultValue="g"
        />
        <SegmentedControl aria-label="Big" size="lg" fullWidth items={items} defaultValue="year" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the pill jumps to the chosen segment (no spring)", async () => {
  reduceMotion();
  renderUi(<SegmentedControl aria-label="Range" items={items} defaultValue="day" />);
  await userEvent.click(screen.getByRole("button", { name: "Year" }));
  expect(pressed("Year")).toBe("true");
  const pill = document.querySelector<HTMLElement>("[data-slot=segmented-control-pill]");
  expect(pill).not.toBeNull();
  await expect.poll(() => document.getAnimations().filter((a) => a.playState === "running").length).toBe(0);
});
