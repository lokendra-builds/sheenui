// Small behaviour checks for public exports that no other test names: the English label sets, the shared icons,
// the form-library ref helpers, and a few pure helpers.

import { expect, it, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";

import * as sheen from "../../src/index";
import { groupBlur, mergeRefs } from "../../src/lib/form";
import { renderUi } from "../render";

it("every default*Labels export is a non-empty object whose entries are strings or functions", () => {
  const sets = Object.entries(sheen).filter(([name]) => /^default\w*Labels$/.test(name));
  expect(sets.length).toBeGreaterThan(60);
  for (const [name, value] of sets) {
    expect(typeof value, name).toBe("object");
    const entries = Object.entries(value as Record<string, unknown>);
    expect(entries.length, name).toBeGreaterThan(0);
    for (const [key, entry] of entries) {
      expect(["string", "function", "object"].includes(typeof entry), `${name}.${key}`).toBe(true);
    }
  }
});

it("the shared icons render decorative svgs that take className", () => {
  renderUi(
    <div>
      <sheen.CheckIcon className="size-4" />
      <sheen.CloseIcon className="size-4" />
      <sheen.AlertIcon className="size-4" />
    </div>,
  );
  const svgs = document.querySelectorAll("svg");
  expect(svgs).toHaveLength(3);
  for (const svg of svgs) {
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-4");
  }
});

it("mergeRefs fills object and callback refs and clears them again", () => {
  const object = createRef<HTMLDivElement>();
  const calls: (HTMLDivElement | null)[] = [];
  const merged = mergeRefs<HTMLDivElement>(object, (node) => void calls.push(node), undefined);
  const node = document.createElement("div");
  const cleanup = merged(node);
  expect(object.current).toBe(node);
  expect(calls).toEqual([node]);
  (cleanup as () => void)();
  expect(object.current).toBeNull();
});

it("groupBlur fires only when focus leaves the group", () => {
  const onBlur = vi.fn();
  render(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the test needs a focus-leaving listener on a plain group
    <fieldset data-testid="group" onBlur={groupBlur(onBlur)}>
      <button>a</button>
      <button>b</button>
    </fieldset>,
  );
  const [a, b] = screen.getAllByRole("button");
  a!.focus();
  b!.focus();
  expect(onBlur).not.toHaveBeenCalled();
  b!.blur();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

it("placeChartTip puts a tooltip beside the mark and keeps it inside the chart", () => {
  const spot = sheen.placeChartTip({ x: 10, y: 10, w: 20, h: 20 }, { w: 80, h: 40 }, { w: 300, h: 200 });
  expect(spot.x).toBeGreaterThanOrEqual(30);
  const edge = sheen.placeChartTip({ x: 280, y: 10, w: 10, h: 10 }, { w: 80, h: 40 }, { w: 300, h: 200 });
  expect(edge.x + 80).toBeLessThanOrEqual(300);
});

it("shared chart pieces render: MissingValue and ChartValueTable's empty state", () => {
  renderUi(
    <div>
      <sheen.MissingValue label="n/a" />
      <sheen.MissingValue />
      <sheen.MissingValue labels={{ noData: "Keine Daten" }} />
      <sheen.ChartValueTable columns={[{ label: "A" }]} rows={[]} caption="Values" emptyState="Nothing here" />
    </div>,
  );
  expect(screen.getByText("n/a")).toBeInTheDocument();
  expect(screen.getByText(sheen.defaultHeatmapLabels.noData)).toBeInTheDocument();
  expect(screen.getByText("Keine Daten")).toBeInTheDocument();
  expect(screen.getByText("Nothing here")).toBeInTheDocument();
});

it("the barrel exports useOffscreenLoops (the docs tell people to call it) and no longer leaks internals", () => {
  expect(typeof sheen.useOffscreenLoops).toBe("function");
  const barrel = sheen as Record<string, unknown>;
  for (const internal of [
    "fadeColor",
    "linePath",
    "indexOfKey",
    "markScrolling",
    "setBeatRate",
    "shareStructure",
    "noBlur",
    "springs",
    "durations",
    "auroraSky",
    "registerAuroraFloor",
    "useSkyTick",
    "addAmbient",
    "addFollower",
    "wakeBeat",
    "misc",
    "GlassBudgetContext",
    "chartSpring",
    "chartGlow",
    "areaPath",
    "resolveInstructions",
  ]) {
    expect(barrel[internal], internal).toBeUndefined();
  }
});
