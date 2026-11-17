// The backdrop engine: SheenBackdrop (both styles), the Aurora sky canvas + floor + sky ticks,
// the shared sky state, auto-Lite glass (decision table + frame measuring) and the grain tile.

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";

import { SheenBackdrop, useOsSolidGlass, useResolvedTheme } from "../../src/components/backdrop/backdrop";
import AuroraSky from "../../src/components/backdrop/aurora-sky";
import LiquidSky from "../../src/components/backdrop/liquid-sky";
import { auroraSky, registerAuroraFloor, useSkyTick } from "../../src/components/backdrop/sky-state";
import { isWeakDevice, useAutoLiteGlass } from "../../src/components/backdrop/auto-lite";
import { grainTile } from "../../src/components/backdrop/grain";
import { renderUi } from "../render";
import { frames } from "../helpers";

const html = document.documentElement;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  for (const key of ["deviceMemory", "hardwareConcurrency", "connection"]) Reflect.deleteProperty(navigator, key);
  auroraSky.tick.clear();
  auroraSky.reflection = null;
  auroraSky.measureFloor = null;
});

function stubMatches(map: Record<string, boolean>) {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    const key = Object.keys(map).find((k) => query.includes(k));
    if (!key) return real(query);
    return {
      matches: map[key],
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList;
  });
}

describe("grainTile", () => {
  // grain.ts caches its promise at module level, so each failure mode gets its own module instance
  // (a query string makes Vite serve the file again as a separate module).
  type Grain = typeof import("../../src/components/backdrop/grain");
  const fresh = async (tag: "no-ctx" | "throws" | "no-blob" | "ok") => {
    // The imports are untyped (see the @ts-expect-error notes), so the module is typed here.
    const mod = (
      tag === "no-ctx"
        ? await import(
            // @ts-expect-error a query string is a separate module instance, which TypeScript cannot resolve
            "../../src/components/backdrop/grain.ts?no-ctx"
          )
        : tag === "throws"
          ? await import(
              // @ts-expect-error a query string is a separate module instance, which TypeScript cannot resolve
              "../../src/components/backdrop/grain.ts?throws"
            )
          : tag === "no-blob"
            ? await import(
                // @ts-expect-error a query string is a separate module instance, which TypeScript cannot resolve
                "../../src/components/backdrop/grain.ts?no-blob"
              )
            : await import(
                // @ts-expect-error a query string is a separate module instance, which TypeScript cannot resolve
                "../../src/components/backdrop/grain.ts?ok"
              )
    ) as Grain;
    return mod.grainTile;
  };

  it("resolves to null when the canvas has no 2d context", async () => {
    const tile = await fresh("no-ctx");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(await tile()).toBeNull();
  });

  it("resolves to null when drawing throws", async () => {
    const tile = await fresh("throws");
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("boom");
    });
    expect(await tile()).toBeNull();
  });

  it("resolves to null when the canvas cannot make a blob", async () => {
    const tile = await fresh("no-blob");
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => cb(null));
    expect(await tile(64)).toBeNull();
  });

  it("makes one PNG blob URL (honouring size and colour), and returns the same promise afterwards", async () => {
    const tile = await fresh("ok");
    const first = tile(50, [10, 20, 30], 0.5);
    const url = await first;
    expect(url).toMatch(/^blob:/);
    const blob = await (await fetch(url!)).blob();
    expect(blob.type).toBe("image/png");
    expect(tile(300)).toBe(first);
    // The shipped module works too.
    expect(await grainTile()).toMatch(/^blob:/);
  });
});

describe("sky state", () => {
  it("registerAuroraFloor measures and repaints once, and only the registered canvas can unregister", () => {
    const redraw = vi.spyOn(auroraSky, "redraw");
    const measure = vi.fn();
    const a = document.createElement("canvas");
    const b = document.createElement("canvas");
    const offA = registerAuroraFloor(a, measure);
    expect(measure).toHaveBeenCalledTimes(1);
    expect(redraw).toHaveBeenCalledTimes(1);
    expect(auroraSky.reflection).toBe(a);
    expect(auroraSky.measureFloor).toBe(measure);

    const offB = registerAuroraFloor(b, vi.fn());
    offA(); // a was replaced by b: it must not unregister b
    expect(auroraSky.reflection).toBe(b);
    offB();
    expect(auroraSky.reflection).toBeNull();
    expect(auroraSky.measureFloor).toBeNull();
  });

  it("useSkyTick registers the latest callback, and null or unmount removes it", () => {
    const one = vi.fn();
    const two = vi.fn();
    const { rerender, unmount } = renderHook(({ cb }) => useSkyTick(cb), {
      initialProps: { cb: one as ((t: number) => void) | null },
    });
    expect(auroraSky.tick.size).toBe(1);
    rerender({ cb: two });
    [...auroraSky.tick][0]!(12);
    expect(one).not.toHaveBeenCalled();
    expect(two).toHaveBeenCalledWith(12);
    rerender({ cb: null });
    expect(auroraSky.tick.size).toBe(0);
    rerender({ cb: two });
    expect(auroraSky.tick.size).toBe(1);
    unmount();
    expect(auroraSky.tick.size).toBe(0);
  });
});

describe("auto-Lite glass", () => {
  const def = (key: string, value: unknown) => Object.defineProperty(navigator, key, { value, configurable: true });
  function Auto() {
    useAutoLiteGlass();
    return null;
  }

  it("isWeakDevice: low memory, few cores or Save-Data are weak; a capable device is not", () => {
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    expect(isWeakDevice()).toBe(false);
    def("deviceMemory", 4);
    expect(isWeakDevice()).toBe(true);
    def("deviceMemory", 8);
    def("hardwareConcurrency", 4);
    expect(isWeakDevice()).toBe(true);
    def("hardwareConcurrency", 12);
    def("connection", { saveData: true });
    expect(isWeakDevice()).toBe(true);
    def("connection", { saveData: false });
    expect(isWeakDevice()).toBe(false);
  });

  it("a weak device gets Lite straight away", () => {
    def("deviceMemory", 2);
    render(<Auto />);
    expect(html).toHaveAttribute("data-glass", "lite");
  });

  it("a saved choice (localStorage or data-glass=full) always wins", () => {
    def("deviceMemory", 2);
    localStorage.setItem("sheen:glass", "full");
    const view = render(<Auto />);
    expect(html).not.toHaveAttribute("data-glass");
    view.unmount();
    localStorage.clear();
    html.setAttribute("data-glass", "full");
    render(<Auto />);
    expect(html).toHaveAttribute("data-glass", "full");
  });

  it("still decides when storage is blocked", () => {
    def("deviceMemory", 2);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render(<Auto />);
    expect(html).toHaveAttribute("data-glass", "lite");
  });

  /** Drive the frame measurement by hand: a fake setTimeout, and requestAnimationFrame stepped with exact timestamps. */
  function frames() {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    def("deviceMemory", 8);
    def("hardwareConcurrency", 12);
    let queue: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => queue.push(cb));
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      queue = [];
    });
    return {
      /** Run frames every `step` ms from `from` for `count` frames. */
      run(from: number, step: number, count: number) {
        for (let i = 0; i < count; i++) {
          const cb = queue.shift();
          if (!cb) return i;
          cb(from + i * step);
        }
        return count;
      },
      pending: () => queue.length,
    };
  }

  it("measures after the entrance settles and switches to Lite when frames are slow (10 fps for 2 s)", () => {
    const f = frames();
    render(<Auto />);
    expect(f.pending()).toBe(0);
    vi.advanceTimersByTime(2600);
    expect(f.pending()).toBe(1);
    f.run(1000, 100, 30);
    expect(html).toHaveAttribute("data-glass", "lite");
  });

  it("stays on full glass when frames are healthy, and stops measuring after three good windows", () => {
    const f = frames();
    render(<Auto />);
    vi.advanceTimersByTime(2600);
    const ran = f.run(0, 16, 1000);
    expect(html).not.toHaveAttribute("data-glass");
    expect(ran).toBeLessThan(1000); // the loop ended on its own
    expect(f.pending()).toBe(0);
  });

  it("does not count frames while the tab is hidden", () => {
    const f = frames();
    render(<Auto />);
    vi.advanceTimersByTime(2600);
    const state = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    // Slow frames, but hidden: ignored.
    f.run(0, 500, 20);
    expect(html).not.toHaveAttribute("data-glass");
    expect(f.pending()).toBe(1);
    state.mockReturnValue("visible");
    f.run(10_000, 100, 30);
    expect(html).toHaveAttribute("data-glass", "lite");
  });

  it("requests no frame while idle, and engages Lite when frames are slow during a scroll", () => {
    const f = frames();
    render(<Auto />);
    vi.advanceTimersByTime(2600);
    f.run(0, 16, 2); // the load look is cut short when nothing is moving
    vi.advanceTimersByTime(3000);
    expect(f.pending()).toBe(0);
    window.dispatchEvent(new Event("scroll"));
    expect(f.pending()).toBe(1);
    f.run(10_000, 100, 30);
    expect(html).toHaveAttribute("data-glass", "lite");
  });

  it("cancels its timer and frame loop on unmount", () => {
    const f = frames();
    const view = render(<Auto />);
    vi.advanceTimersByTime(2600);
    view.unmount();
    expect(f.pending()).toBe(0);
    vi.advanceTimersByTime(5000);
    expect(html).not.toHaveAttribute("data-glass");
  });
});

describe("useResolvedTheme / useOsSolidGlass", () => {
  it("an explicit theme wins; system follows prefers-color-scheme", () => {
    const { result, rerender } = renderHook(() => useResolvedTheme());
    html.setAttribute("data-theme", "dark");
    rerender();
    expect(result.current).toBe("dark");
    html.setAttribute("data-theme", "light");
    rerender();
    expect(result.current).toBe("light");
    html.removeAttribute("data-theme");
    stubMatches({ "prefers-color-scheme: dark": true });
    const dark = renderHook(() => useResolvedTheme());
    expect(dark.result.current).toBe("dark");
  });

  it("system with a light OS resolves to light", () => {
    stubMatches({ "prefers-color-scheme: dark": false });
    expect(renderHook(() => useResolvedTheme()).result.current).toBe("light");
  });

  it("useOsSolidGlass reports reduced transparency, more contrast or forced colours", () => {
    stubMatches({ "prefers-reduced-transparency": true });
    expect(renderHook(() => useOsSolidGlass()).result.current).toBe(true);
    vi.restoreAllMocks();
    stubMatches({ "prefers-reduced-transparency": false });
    expect(renderHook(() => useOsSolidGlass()).result.current).toBe(false);
  });
});

describe("SheenBackdrop", () => {
  it("Liquid: a decorative fixed sky with base, lazy liquid layer and grain; marks <html> and cleans up", async () => {
    const { container, unmount } = renderUi(<SheenBackdrop mode="hero" className="extra" />);
    const sky = container.querySelector<HTMLElement>(".sheen-sky")!;
    expect(sky).toHaveAttribute("aria-hidden", "true");
    expect(sky).toHaveAttribute("data-style", "liquid");
    expect(sky).toHaveAttribute("data-mode", "hero");
    expect(sky).toHaveClass("extra");
    expect(sky.querySelector(".sheen-sky__base")).not.toBeNull();
    expect(sky.querySelector(".sheen-sky__grain")).not.toBeNull();
    expect(html).toHaveAttribute("data-sheen-backdrop", "liquid");
    await expect.poll(() => sky.querySelector(".sheen-sky__liquid")).not.toBeNull();
    // The grain is a pre-baked tile in backdrop.css: nothing is built (or set inline) at mount.
    expect(sky.style.getPropertyValue("--sheen-grain-img")).toBe("");
    unmount();
    expect(html).not.toHaveAttribute("data-sheen-backdrop");
  });

  it("Aurora: loads the canvas sky, and the style prop beats the saved style", async () => {
    const { container } = renderUi(<SheenBackdrop style="aurora" />);
    const sky = container.querySelector<HTMLElement>(".sheen-sky")!;
    expect(sky).toHaveAttribute("data-style", "aurora");
    expect(sky).toHaveAttribute("data-mode", "page");
    expect(html).toHaveAttribute("data-sheen-backdrop", "aurora");
    await expect.poll(() => sky.querySelector("canvas.sheen-sky__aurora")).not.toBeNull();
    expect(sky.querySelector(".sheen-sky__liquid")).toBeNull();
  });

  it("uses the saved style when the prop is not given", () => {
    const { container } = renderUi(<SheenBackdrop />, { theme: "light", style: "aurora" });
    expect(container.querySelector(".sheen-sky")).toHaveAttribute("data-style", "aurora");
  });

  it("plays only while on screen and not paused", async () => {
    const view = renderUi(<SheenBackdrop />);
    const sky = view.container.querySelector<HTMLElement>(".sheen-sky")!;
    await expect.poll(() => sky.hasAttribute("data-live")).toBe(true);
    view.unmount();
    const paused = renderUi(<SheenBackdrop paused />);
    await frames(10);
    expect(paused.container.querySelector(".sheen-sky")).not.toHaveAttribute("data-live");
  });

  it("solid glass (reduced transparency preference) draws only the flat base and grain", async () => {
    html.setAttribute("data-transparency", "reduced");
    const { container } = renderUi(<SheenBackdrop />);
    const sky = container.querySelector<HTMLElement>(".sheen-sky")!;
    await frames(10);
    expect(sky.children).toHaveLength(2);
    expect(sky).not.toHaveAttribute("data-live");
  });

  it("OS-level solid glass does the same; Lite glass slows the beat and still renders the sky", async () => {
    stubMatches({ "prefers-reduced-transparency": true });
    const solid = renderUi(<SheenBackdrop />);
    await frames(7);
    expect(solid.container.querySelector(".sheen-sky")!.children).toHaveLength(2);
    solid.unmount();
    vi.restoreAllMocks();

    html.setAttribute("data-glass", "lite");
    const lite = renderUi(<SheenBackdrop />);
    await expect.poll(() => lite.container.querySelector(".sheen-sky__liquid")).not.toBeNull();
  });
});

describe("LiquidSky", () => {
  it("draws orbs, ribbons, spheres, caustics and animates the drift in hero mode while active", async () => {
    const { container } = render(<LiquidSky mode="hero" active lite={false} />);
    expect(container.querySelectorAll(".sheen-sky__orb")).toHaveLength(5);
    expect(container.querySelectorAll(".sheen-sky__sphere")).toHaveLength(2);
    expect(container.querySelectorAll(".sheen-ribbon")).toHaveLength(3);
    expect(container.querySelector("svg.sheen-sky__ribbons")).toHaveAttribute("aria-hidden", "true");
    const drift = container.querySelector<HTMLElement>(".sheen-sky__drift")!;
    const caustic = container.querySelector<HTMLElement>(".sheen-sky__caustics i")!;
    await expect.poll(() => drift.style.transform, { timeout: 4000 }).toMatch(/translate3d/);
    expect(caustic.style.transform).toMatch(/translate3d/);
  });

  it("does not move in page mode or when inactive", async () => {
    const page = render(<LiquidSky mode="page" active lite />);
    const idle = render(<LiquidSky mode="hero" active={false} lite />);
    await frames(13);
    expect(page.container.querySelector<HTMLElement>(".sheen-sky__drift")!.style.transform).toBe("");
    expect(idle.container.querySelector<HTMLElement>(".sheen-sky__drift")!.style.transform).toBe("");
  });
});

describe("AuroraSky", () => {
  const paint = (c: HTMLCanvasElement) => {
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) return true;
    return false;
  };

  it.each([
    ["dark", "hero"],
    ["dark", "page"],
    ["light", "hero"],
    ["light", "page"],
  ] as const)("%s / %s: paints an opaque sky canvas and keeps the decorative layers", (theme, mode) => {
    const { container } = render(<AuroraSky theme={theme} reduced active={false} lite={false} mode={mode} />);
    const canvas = container.querySelector<HTMLCanvasElement>("canvas.sheen-sky__aurora")!;
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas.width).toBeGreaterThanOrEqual(48);
    expect(canvas.height).toBeGreaterThanOrEqual(48);
    expect(paint(canvas)).toBe(true);
    for (const cls of ["grid", "veil", "vignette"])
      expect(container.querySelector(`.sheen-sky__${cls}`)).not.toBeNull();
  });

  it("Lite renders a coarser canvas than full", () => {
    const full = render(<AuroraSky theme="dark" reduced active={false} lite={false} mode="page" />);
    const lite = render(<AuroraSky theme="dark" reduced active={false} lite mode="page" />);
    const wFull = full.container.querySelector("canvas")!.width;
    const wLite = lite.container.querySelector("canvas")!.width;
    expect(wLite).toBeLessThan(wFull);
  });

  it("while active it runs on the beat: the sky clock advances, ticks fire, and it stops when paused or reduced", async () => {
    const tick = vi.fn();
    function Ticker() {
      useSkyTick(tick);
      return null;
    }
    const clock0 = auroraSky.clock;
    const view = render(
      <>
        <Ticker />
        <AuroraSky theme="dark" reduced={false} active lite={false} mode="hero" />
      </>,
    );
    await expect.poll(() => auroraSky.clock, { timeout: 4000 }).toBeGreaterThan(clock0);
    expect(tick).toHaveBeenCalled();
    expect(typeof tick.mock.calls[0]![0]).toBe("number");

    // Paused: the loop is removed and the still sky is the fully risen one.
    view.rerender(
      <>
        <Ticker />
        <AuroraSky theme="dark" reduced={false} active={false} lite={false} mode="hero" />
      </>,
    );
    await frames(8);
    const frozen = auroraSky.clock;
    await frames(16);
    expect(auroraSky.clock).toBe(frozen);

    // Back on, then reduced motion: no loop at all.
    view.rerender(
      <>
        <Ticker />
        <AuroraSky theme="dark" reduced={false} active lite={false} mode="hero" />
      </>,
    );
    await expect.poll(() => auroraSky.clock, { timeout: 4000 }).toBeGreaterThan(frozen);
    view.rerender(
      <>
        <Ticker />
        <AuroraSky theme="dark" reduced active lite={false} mode="hero" />
      </>,
    );
    await frames(8);
    const still = auroraSky.clock;
    await frames(16);
    expect(auroraSky.clock).toBe(still);
  });

  it("reflects the light into a registered floor canvas (and clears it in Lite)", () => {
    const floor = document.createElement("canvas");
    floor.width = 200;
    floor.height = 100;
    const measure = vi.fn(() => {
      auroraSky.floorTop = 0;
      auroraSky.floorH = 100;
    });
    const off = registerAuroraFloor(floor, measure);
    const view = render(<AuroraSky theme="dark" reduced active={false} lite={false} mode="hero" />);
    expect(paint(floor)).toBe(true);
    view.unmount();
    off();

    const flat = document.createElement("canvas");
    flat.width = 200;
    flat.height = 100;
    const off2 = registerAuroraFloor(flat, measure);
    render(<AuroraSky theme="dark" reduced active={false} lite mode="hero" />);
    expect(paint(flat)).toBe(false);
    off2();
  });

  it("skips the reflection when the floor is far below the viewport", () => {
    const floor = document.createElement("canvas");
    floor.width = 200;
    floor.height = 100;
    const off = registerAuroraFloor(floor, () => {
      auroraSky.floorTop = 9000;
      auroraSky.floorH = 100;
    });
    render(<AuroraSky theme="light" reduced active={false} lite={false} mode="page" />);
    expect(paint(floor)).toBe(false);
    off();
  });

  it("lifts as the page scrolls, repaints on resize, and removes its redraw hook on unmount", async () => {
    const spacer = render(<div style={{ height: 5000 }} />);
    const view = render(<AuroraSky theme="light" reduced={false} active={false} lite={false} mode="hero" />);
    const before = auroraSky.redraw;
    window.scrollTo(0, 1800);
    await expect.poll(() => auroraSky.lift, { timeout: 3000 }).toBeGreaterThan(0.5);
    window.scrollTo(0, 0);
    await expect.poll(() => auroraSky.lift, { timeout: 3000 }).toBeLessThan(0.1);
    window.dispatchEvent(new Event("resize"));
    const canvas = view.container.querySelector("canvas")!;
    expect(paint(canvas)).toBe(true);
    view.unmount();
    expect(auroraSky.redraw).not.toBe(before);
    expect(() => auroraSky.redraw()).not.toThrow();
    spacer.unmount();
  });
});
