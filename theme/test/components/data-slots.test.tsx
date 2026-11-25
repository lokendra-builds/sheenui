// Every component root carries a data-slot, so consumers and CSS can target it without relying on
// class names. The list of components is derived from the package barrel: every exported React component that
// renders a DOM root on its own must put a data-slot on that root, so a new root without one fails this test.
// Components that need props to render are given them in `props`; those that cannot render bare are skipped
// (their root is a Base UI part or a context-bound part, covered by its own folder's tests).

import { Component, createElement, type ComponentType, type ReactNode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import * as sheen from "../../src/index";
import { SheenMotionProvider } from "../../src/motion/provider";

type Props = Record<string, unknown>;

/** Props for the roots that cannot render bare (a required label, a data set or a child). */
const props: Record<string, Props> = {
  Avatar: { name: "Ravi Kumar" },
  Combobox: { label: "Country", options: [{ value: "in", label: "India" }] },
  DataTable: {
    caption: "People",
    data: [{ name: "Ravi" }],
    columns: [{ id: "name", header: "Name", accessorKey: "name" }],
    getRowLabel: (row: { name: string }) => row.name,
  },
  DatePicker: { label: "Day" },
  DateRangePicker: { label: "Stay" },
  FileUpload: { label: "Files" },
  Input: { label: "Name" },
  Meter: { value: 40, label: "Disk" },
  OtpInput: { labels: { name: "Code" } },
  Pagination: { page: 2, pageCount: 5 },
  Progress: { value: 40, label: "Upload" },
  Rating: { "aria-label": "Stars" },
  Select: { label: "Fruit", items: [{ value: "a", label: "Apple" }] },
  Slider: { "aria-label": "Volume" },
  TagsInput: { label: "Tags" },
};

/**
 * Baseline of roots that still render without a `data-slot` (a shrink-only list: add a slot to the component, then
 * delete its name here; a new component with no slot is not allowed to join the list).
 */
const knownGaps = new Set<string>([]);

const REACT_TYPES = new Set(["react.memo", "react.forward_ref", "react.lazy"]);

/** True when a barrel export is a React component (function, memo or forwardRef), not a context or a helper. */
function isComponent(name: string, value: unknown): value is ComponentType<Props> {
  if (!/^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/.test(name)) return false;
  if (typeof value === "function") return true;
  if (typeof value !== "object" || value === null || !("$$typeof" in value)) return false;
  return REACT_TYPES.has(String((value.$$typeof as symbol).description));
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

afterEach(cleanup);

const barrel = sheen as Record<string, unknown>;
const components = Object.entries(barrel)
  .filter(([name, value]) => isComponent(name, value))
  .map(([name]) => name)
  .sort();

it("the barrel exports React components for this test to scan", () => {
  expect(components.length).toBeGreaterThan(100);
  for (const name of Object.keys(props)) expect(components, name).toContain(name);
});

it("every barrel component that renders a root carries a data-slot on it", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const rendered: string[] = [];
  const missing: string[] = [];
  try {
    for (const name of components) {
      const type = barrel[name] as ComponentType<Props>;
      const { container, unmount } = render(
        createElement(SheenMotionProvider, null, createElement(Boundary, null, createElement(type, props[name] ?? {}))),
      );
      const root = container.firstElementChild;
      if (root) {
        rendered.push(name);
        if (!root.hasAttribute("data-slot")) missing.push(name);
      }
      unmount();
    }
  } finally {
    consoleError.mockRestore();
  }
  // A scan that renders nothing would pass vacuously: the known roots must be among the rendered ones.
  for (const name of Object.keys(props)) expect(rendered, `${name} rendered a root`).toContain(name);
  // Only the baseline may lack a slot, and a baseline entry that gained one must leave the list.
  expect(
    missing.filter((name) => !knownGaps.has(name)),
    "barrel components whose root has no data-slot (add `data-slot` to the root)",
  ).toEqual([]);
  expect(
    [...knownGaps].filter((name) => !missing.includes(name)),
    "baseline entries that now have a data-slot (remove them from knownGaps)",
  ).toEqual([]);
});
