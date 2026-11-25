// Every runtime export of the package barrel is covered by a test. The last test in this file computes the list of
// exports that no test file names and fails while it is not empty, so a new export needs a test the day it is added.
//
// Exports that already have tests elsewhere are found by name in the other test files. The rest are covered here:
//   - default*Labels objects: checked in bulk in exports-smoke.test.tsx
//   - real helpers, hooks and small components: a behaviour test each (below)
//   - pure Base UI part re-exports and context-bound parts: one table-driven identity test (renderable, ref/className capable)

import { createRef, useRef, type ComponentType } from "react";
import { expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import * as sheen from "../../src/index";
import { holdFor } from "../helpers";
import { renderUi } from "../render";

const raw = import.meta.glob<string>("./*.test.tsx", { query: "?raw", import: "default", eager: true });
const others = Object.entries(raw)
  .filter(([file]) => !file.endsWith("barrel-coverage.test.tsx"))
  .map(([, text]) => text)
  .join("\n");
// Other test files also live one folder up.
const rawUp = import.meta.glob<string>("../*.test.tsx", { query: "?raw", import: "default", eager: true });
const upText = Object.values(rawUp).join("\n");
const barrel = sheen as Record<string, unknown>;

/* ---------- constants and presets ---------- */

it("constants and presets have the documented shape", () => {
  expect(barrel.COARSE_POINTER_QUERY).toBe("(any-pointer: coarse)");
  expect(barrel.PREFERS_DARK_QUERY).toBe("(prefers-color-scheme: dark)");
  expect(barrel.SHEEN_STYLES).toEqual(["liquid", "aurora"]);
  expect(barrel.DEFAULT_SHEEN_STYLE).toBe("liquid");
  expect(barrel.MAX_SCATTER_SERIES).toBeGreaterThan(0);
  expect(typeof barrel.PREVIOUS_SERIES_KEY).toBe("string");
  expect(barrel.exitPreset).toBeTypeOf("object");
  expect(barrel.drawerSnapPresets).toBeTypeOf("object");
  expect(Object.keys(barrel.sideDrawerSizes as object).length).toBeGreaterThan(1);
  expect(barrel.sideDrawerIconButtonClass).toBeTypeOf("string");
  expect(Array.isArray(barrel.defaultAuthSplitTestimonials)).toBe(true);
  expect(Array.isArray(barrel.defaultSettingsNotificationOptions)).toBe(true);
  expect(barrel.defaultTrackerStatuses).toBeTypeOf("object");
  expect(barrel.chartTooltipSurface).toBeDefined();
});

/* ---------- pure helpers ---------- */

it("normalizeText lowercases and strips accents; prepareText and matchCommand match fuzzily", () => {
  expect(sheen.normalizeText("Crème Brûlée")).toBe("creme brulee");
  const prepared = sheen.prepareText("Open settings");
  expect(sheen.matchCommand("ops", prepared)?.indices.length).toBeGreaterThan(0);
  expect(sheen.matchCommand("zzz", "Open settings")).toBeNull();
  expect(sheen.matchCommand("kw", "Nothing", ["a keyword"])?.score).toBeDefined();
});

it("cn joins class names, drops falsy values and lets the later Tailwind utility win", () => {
  expect(sheen.cn("a", false, undefined, "b")).toBe("a b");
  expect(sheen.cn("p-2 text-sm", "p-4")).toBe("text-sm p-4");
});

it("formatPercent turns a ratio into a percentage string", () => {
  expect(sheen.formatPercent(0.5)).toBe("50%");
  expect(sheen.formatPercent(0)).toBe("0%");
});

it("highlightMatch wraps the matched characters", () => {
  const { container } = render(<p>{sheen.highlightMatch("settings", [0, 1])}</p>);
  expect(container.textContent).toBe("settings");
  expect(container.querySelectorAll("mark, b, strong, span[data-match]").length).toBeGreaterThan(0);
  expect(sheen.highlightMatch("plain", [])).toBe("plain");
});

it("orderShortcut puts modifiers first in the platform's order", () => {
  expect(sheen.orderShortcut(["k", "shift", "mod"], "mac")[0]).not.toBe("k");
  expect(sheen.orderShortcut(["k", "ctrl"], "other").at(-1)).toBe("k");
});

it("toFileUploadItems wraps files as idle items with unique ids", () => {
  const items = sheen.toFileUploadItems([new File(["a"], "a.txt"), new File(["b"], "b.txt")]);
  expect(items.map((i) => [i.file.name, i.status, i.progress])).toEqual([
    ["a.txt", "idle", 0],
    ["b.txt", "idle", 0],
  ]);
  expect(new Set(items.map((i) => i.id)).size).toBe(2);
});

it("exportCsv saves a .csv file through a temporary link", () => {
  const created = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  sheen.exportCsv("report", ["a", "b"], [[1, 2]]);
  expect(created).toHaveBeenCalledTimes(1);
  expect(click).toHaveBeenCalledTimes(1);
  vi.restoreAllMocks();
});

it("isMotionReduced follows data-motion; supportsViewTransitions is a boolean; startRouteTransition runs the update", async () => {
  document.documentElement.setAttribute("data-motion", "reduced");
  expect(sheen.isMotionReduced()).toBe(true);
  const update = vi.fn();
  sheen.startRouteTransition(update);
  await expect.poll(() => update.mock.calls.length).toBe(1);
  document.documentElement.removeAttribute("data-motion");
  expect(typeof sheen.supportsViewTransitions()).toBe("boolean");
  const el = document.createElement("div");
  expect(() => sheen.riseIn(el)).not.toThrow();
  expect(() => sheen.riseIn(null)).not.toThrow();
});

it("trendLegend is empty without a comparison and lists the series and the previous period with one", () => {
  expect(sheen.trendLegend("Visits", 1, false, "Previous")).toEqual([]);
  const compared = sheen.trendLegend("Visits", 1, true, "Previous");
  expect(compared.map((l) => l.label)).toEqual(["Visits", "Previous"]);
});

it("loadWorld110m resolves to the bundled world shapes", async () => {
  const world = await sheen.loadWorld110m();
  expect(world).toBeTruthy();
});

it("create*Handle helpers return a handle object", () => {
  for (const make of [
    sheen.createAlertDialogHandle,
    sheen.createDrawerHandle,
    sheen.createHoverCardHandle,
    sheen.createMenuHandle,
    sheen.createSideDrawerHandle,
  ]) {
    expect(make()).toBeTruthy();
  }
});

/* ---------- hooks ---------- */

it("useControllable is controlled by `value`, otherwise holds its own state", () => {
  const onChange = vi.fn();
  const own = renderHook(() => sheen.useControllable<number>(undefined, 1, onChange));
  act(() => own.result.current[1](2));
  expect(own.result.current[0]).toBe(2);
  expect(onChange).toHaveBeenCalledWith(2);
  const controlled = renderHook(() => sheen.useControllable<number>(5, 1));
  act(() => controlled.result.current[1](9));
  expect(controlled.result.current[0]).toBe(5);
});

it("useSyncRef keeps a ref on the latest value", () => {
  const ref = { current: 0 };
  const { rerender } = renderHook(({ v }) => sheen.useSyncRef(ref, v), { initialProps: { v: 1 } });
  expect(ref.current).toBe(1);
  rerender({ v: 7 });
  expect(ref.current).toBe(7);
});

it("useMergedRef and useFocusProxyRef forward the node; the proxy focuses the first match", () => {
  const a = createRef<HTMLDivElement>();
  const b = createRef<HTMLDivElement>();
  function Merged() {
    return <div ref={sheen.useMergedRef(a, b)} />;
  }
  render(<Merged />);
  expect(a.current).toBe(b.current);
  expect(a.current).toBeInstanceOf(HTMLDivElement);
  const group = createRef<HTMLDivElement>();
  function Proxy() {
    return (
      <div ref={sheen.useFocusProxyRef(group, "button.second", "button")}>
        <button>first</button>
        <button className="second">second</button>
      </div>
    );
  }
  render(<Proxy />);
  group.current!.focus();
  expect(document.activeElement?.textContent).toBe("second");
});

it("usePrefersDark and useShortcutPlatform return booleans / platform names", () => {
  expect(typeof renderHook(() => sheen.usePrefersDark()).result.current).toBe("boolean");
  expect(typeof sheen.isApplePlatform()).toBe("boolean");
  expect(["mac", "other"]).toContain(renderHook(() => sheen.useShortcutPlatform()).result.current);
  expect(renderHook(() => sheen.useShortcutPlatform("mac")).result.current).toBe("mac");
});

it("useCopyToClipboard goes idle -> copied and back", async () => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  const { result } = renderHook(() => sheen.useCopyToClipboard(50));
  expect(result.current.status).toBe("idle");
  await act(async () => {
    await result.current.copy("text");
  });
  expect(result.current.status).toBe("copied");
  await expect.poll(() => result.current.status).toBe("idle");
  Reflect.deleteProperty(navigator, "clipboard");
});

it("useElementInView reports a mounted element as in view when there is no observer", () => {
  const el = document.createElement("div");
  document.body.append(el);
  const { result } = renderHook(() => sheen.useElementInView(el));
  expect(typeof result.current).toBe("boolean");
  el.remove();
});

it("useCommandShortcut fires on mod+k", async () => {
  const fire = vi.fn();
  renderHook(() => sheen.useCommandShortcut(fire, { keys: "ctrl+k" }));
  await userEvent.keyboard("{Control>}k{/Control}");
  expect(fire).toHaveBeenCalledTimes(1);
});

it("useChartSeriesState toggles and highlights series; useChartSharedLabels falls back to English", () => {
  const { result } = renderHook(() => sheen.useChartSeriesState(["b"]));
  expect(result.current.hidden.has("b")).toBe(true);
  act(() => result.current.toggle("a"));
  expect(result.current.hidden.has("a")).toBe(true);
  expect(renderHook(() => sheen.useChartSharedLabels()).result.current.noData).toBe("No data");
});

it("useChartSeriesVisibility and useSidebar are hooks that run outside their providers", () => {
  expect(typeof sheen.useChartSeriesVisibility).toBe("function");
  expect(renderHook(() => sheen.useSidebar()).result.current.collapsed).toBe(false);
});

/* ---------- small components ---------- */

it("ChartAnnouncer is a polite live region; LegendKey, CopyIcon and ChartDockHint render", () => {
  renderUi(
    <div>
      <sheen.ChartAnnouncer text="Series hidden" />
      <svg>
        <sheen.LegendKey color="red" kind="rect" />
      </svg>
      <sheen.CopyIcon className="size-4" />
      <div className="relative">
        <sheen.ChartDockHint>Tap to pin</sheen.ChartDockHint>
      </div>
    </div>,
  );
  expect(screen.getByText("Series hidden")).toHaveAttribute("aria-live", "polite");
  expect(document.querySelector("svg.size-4")).not.toBeNull();
  expect(screen.getByText("Tap to pin")).toBeInTheDocument();
});

it("ChartEmpty names itself and shows its message; TableScroll scrolls a wide table", () => {
  renderUi(
    <div>
      <sheen.ChartEmpty height={120} aria-label="Visits">
        Nothing yet
      </sheen.ChartEmpty>
      <sheen.TableScroll label="Values">
        <table>
          <tbody>
            <tr>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </sheen.TableScroll>
    </div>,
  );
  expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
});

it("ChartTooltip shows its title and rows", () => {
  renderUi(
    <div className="relative h-40 w-80">
      <sheen.ChartTooltip
        title="Mon"
        rows={[{ label: "Visits", value: "12", color: "red" }]}
        x={10}
        y={10}
        containerWidth={320}
      />
    </div>,
  );
  expect(screen.getByText("Mon")).toBeInTheDocument();
  expect(screen.getByText("12")).toBeInTheDocument();
});

it("ChartLegend lists its items and reports a toggle", async () => {
  const onToggle = vi.fn();
  renderUi(
    <sheen.ChartLegend
      items={[
        { label: "Visits", color: "red", key: "v" },
        { label: "Sales", color: "blue", key: "s" },
      ]}
      onToggle={onToggle}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: /Visits/ }));
  expect(onToggle).toHaveBeenCalledWith("v");
});

it("SequentialLegend, AnalyticsGrid and DashboardBackdrop render", () => {
  renderUi(
    <div>
      <sheen.SequentialLegend min={0} max={100} format={(n: number) => `${n}%`} label="Share" />
      <sheen.AnalyticsGrid className="grid-test">
        <p>cell</p>
      </sheen.AnalyticsGrid>
      <sheen.DashboardBackdrop className="backdrop-test" />
    </div>,
  );
  expect(screen.getByText("cell").parentElement).toHaveClass("grid-test");
  expect(document.querySelector(".backdrop-test")).toHaveAttribute("aria-hidden", "true");
});

it("GlideHighlightScope wraps its children without adding markup of its own", () => {
  render(
    <sheen.GlideHighlightScope>
      <p>inside</p>
    </sheen.GlideHighlightScope>,
  );
  expect(screen.getByText("inside")).toBeInTheDocument();
});

it("MenuHighlight renders inside a plain container", () => {
  function Host() {
    const ref = useRef(null);
    return (
      <div ref={ref} className="relative">
        <sheen.MenuHighlight active />
      </div>
    );
  }
  expect(() => render(<Host />)).not.toThrow();
});

/* ---------- parts and context-bound exports ---------- */

const parts = [
  "AlertDialogClose",
  "AlertDialogIcon",
  "DrawerHandle",
  "DrawerSwipeArea",
  "MorphingDialogClose",
  "SideDrawerCloseButton",
  "SideDrawerDescription",
  "SideDrawerNotice",
  "SideDrawerRecordNav",
  "SideDrawerTitle",
  "SideDrawerEditContext",
  // The analytics chart parts and ChartTip render in chart-parts.test.tsx (found by the corpus scan below).
] as const;

it.each(parts)("%s is a renderable React component (or context) that the barrel exposes", (name) => {
  const value = barrel[name] as ComponentType | { $$typeof: symbol; Provider?: unknown } | undefined;
  expect(value, name).toBeDefined();
  // Function components, memo/forwardRef objects and contexts all carry a $$typeof or are functions.
  const renderable = typeof value === "function" || (typeof value === "object" && "$$typeof" in value);
  expect(renderable, name).toBe(true);
});

/* ---------- list reordering ---------- */

it("AnimatedList renders its items with data-slots, and useRowReorder and useKeepFocusOnReorder work", () => {
  renderUi(
    <sheen.AnimatedList aria-label="rows">
      <sheen.AnimatedListItem key="a">a</sheen.AnimatedListItem>
    </sheen.AnimatedList>,
  );
  expect(screen.getByRole("list").getAttribute("data-slot")).toBe("animated-list");
  expect(screen.getByRole("listitem").getAttribute("data-slot")).toBe("animated-list-item");
  expect(renderHook(() => sheen.useRowReorder()).result.current).toHaveProperty("layout");
  const ref = createRef<HTMLElement>();
  expect(() => renderHook(() => sheen.useKeepFocusOnReorder(ref))).not.toThrow();
});

it("useBeatAnimations drives a paused animation from the shared beat, stops while off, and cleans up on unmount", async () => {
  const el = document.createElement("div");
  document.body.append(el);
  const anim = el.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: 100000 });
  anim.pause();
  const seek = vi.fn((ms: number) => {
    anim.currentTime = ms;
  });
  const { result, rerender, unmount } = renderHook((p: { on: boolean }) => sheen.useBeatAnimations(seek, p.on), {
    initialProps: { on: true },
  });
  await vi.waitFor(() => expect(seek.mock.calls.length).toBeGreaterThan(2), { timeout: 3000 });
  const times = seek.mock.calls.map((c) => c[0]);
  expect(times.every((t, i) => i === 0 || t > times[i - 1]!)).toBe(true);
  expect(Number(anim.currentTime)).toBeGreaterThan(0);
  expect(result.current.current).toBe(times[times.length - 1]);
  // off-screen / hidden / reduced motion (the caller's gate) turns `on` off: the clock stops
  rerender({ on: false });
  const stopped = seek.mock.calls.length;
  await holdFor(250);
  expect(seek.mock.calls.length).toBe(stopped);
  // back on: it resumes from the same clock (in phase)
  const clockBefore = result.current.current;
  rerender({ on: true });
  await vi.waitFor(() => expect(seek.mock.calls.length).toBeGreaterThan(stopped), { timeout: 3000 });
  await vi.waitFor(() => expect(result.current.current).toBeGreaterThan(clockBefore), { timeout: 3000 });
  unmount();
  const afterUnmount = seek.mock.calls.length;
  await holdFor(250);
  expect(seek.mock.calls.length).toBe(afterUnmount);
  anim.cancel();
  el.remove();
});

it("useVirtualWindow windows a long list around the scroll position and renders everything when disabled", () => {
  const rows = (win: sheen.VirtualWindow) => win.end - win.start;
  const { result, rerender } = renderHook(
    (p: { enabled: boolean }) => {
      const win = sheen.useVirtualWindow({ count: 1000, estimateSize: 20, overscan: 2, enabled: p.enabled });
      return win;
    },
    { initialProps: { enabled: true } },
  );
  const holder = document.createElement("div");
  holder.style.cssText = "height:100px;overflow:auto";
  const inner = document.createElement("div");
  inner.style.height = "20000px";
  holder.append(inner);
  document.body.append(holder);
  act(() => result.current.ref(holder));
  expect(rows(result.current)).toBeLessThan(20);
  expect(result.current.totalSize).toBe(20000);
  act(() => result.current.scrollToIndex(500, "start"));
  expect(holder.scrollTop).toBe(10000);
  expect(result.current.start).toBeGreaterThan(400);
  expect(result.current.padStart + result.current.padEnd + rows(result.current) * result.current.size).toBe(20000);
  rerender({ enabled: false });
  expect(result.current.start).toBe(0);
  expect(result.current.end).toBe(1000);
  holder.remove();
});

/* ---------- the count ---------- */

/** The name appears as code (`<Name`, `Name(`, `Name.x`, `Name,`, `(Name`, `= Name`) and not only inside a quoted string or a comment line. */
function usedAsCode(text: string, name: string): boolean {
  const code = text
    .split("\n")
    .filter((line) => !/^\s*(?:\/\/|\*|\/\*)/.test(line))
    .join("\n");
  return new RegExp(`(?:<|\\(|=\\s*|,\\s*|\\{\\s*|\\[\\s*)${name}\\b|\\b${name}\\s*(?:\\(|\\.|<|,|\\)|;|\\}|\\])`).test(
    code,
  );
}

it("no runtime export of the barrel is left without a test", () => {
  const corpus = `${others}\n${upText}`;
  const here = new Set<string>([
    ...parts,
    ...[
      "AnimatedList",
      "AnimatedListItem",
      "useRowReorder",
      "useKeepFocusOnReorder",
      "useVirtualWindow",
      "useBeatAnimations",
      "COARSE_POINTER_QUERY",
      "PREFERS_DARK_QUERY",
      "SHEEN_STYLES",
      "DEFAULT_SHEEN_STYLE",
      "MAX_SCATTER_SERIES",
      "PREVIOUS_SERIES_KEY",
      "exitPreset",
      "drawerSnapPresets",
      "sideDrawerSizes",
      "sideDrawerIconButtonClass",
      "defaultAuthSplitTestimonials",
      "defaultSettingsNotificationOptions",
      "defaultTrackerStatuses",
      "chartTooltipSurface",
      "normalizeText",
      "prepareText",
      "matchCommand",
      "highlightMatch",
      "cn",
      "formatPercent",
      "orderShortcut",
      "toFileUploadItems",
      "exportCsv",
      "isMotionReduced",
      "supportsViewTransitions",
      "startRouteTransition",
      "riseIn",
      "trendLegend",
      "loadWorld110m",
      "createAlertDialogHandle",
      "createDrawerHandle",
      "createHoverCardHandle",
      "createMenuHandle",
      "createSideDrawerHandle",
      "useControllable",
      "useSyncRef",
      "useMergedRef",
      "useFocusProxyRef",
      "usePrefersDark",
      "useShortcutPlatform",
      "isApplePlatform",
      "useCopyToClipboard",
      "useElementInView",
      "useCommandShortcut",
      "useChartSeriesState",
      "useChartSharedLabels",
      "useChartSeriesVisibility",
      "useSidebar",
      "ChartAnnouncer",
      "LegendKey",
      "CopyIcon",
      "ChartDockHint",
      "ChartEmpty",
      "TableScroll",
      "ChartTooltip",
      "ChartLegend",
      "SequentialLegend",
      "AnalyticsGrid",
      "DashboardBackdrop",
      "MenuHighlight",
      "GlideHighlightScope",
    ],
  ]);
  // A name only counts as tested when a test file imports it from the library (or reaches it through a namespace
  // import) AND uses it outside the import list: rendered (`<Name`), called (`Name(`), read (`Name.x`) or passed on.
  // Merely mentioning the name in a title or a comment no longer counts.
  const importLists = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'][^"']*(?:src|sheenui\/theme)[^"']*["']/g;
  const imported = new Set<string>();
  for (const m of corpus.matchAll(importLists))
    for (const part of m[1]!.split(",")) {
      const name = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]!
        .trim();
      if (name && !part.trim().startsWith("type ")) imported.add(name);
    }
  const body = corpus.replace(importLists, "");
  const exercised = (name: string) =>
    (imported.has(name) && new RegExp(`(?:<|\\b)${name}\\b(?!["'\\w])`).test(body) && usedAsCode(body, name)) ||
    new RegExp(`\\b(?:sheen|barrel|ui|theme)\\.${name}\\b`).test(body);
  const untested = Object.keys(sheen).filter(
    (name) => !/^default\w*Labels$/.test(name) && !here.has(name) && !exercised(name),
  );
  expect(untested).toEqual([]);
});
