// Particles: a capped canvas field. Decorative, loops only while visible and not paused, still under reduced motion.

import { afterEach, describe, expect, it, vi } from "vitest";

import { Particles } from "../../src/components/particles/particles";
import { frames, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

afterEach(() => vi.restoreAllMocks());

const host = (props: Parameters<typeof Particles>[0] = {}) => (
  <div className="relative h-64 w-96">
    <Particles {...props} />
  </div>
);
const arcs = () => vi.spyOn(CanvasRenderingContext2D.prototype, "arc");

describeVariants((variant) => {
  describe(`Particles in ${variant.theme} / ${variant.style}`, () => {
    it("is a decorative canvas and passes axe", async () => {
      renderUi(host(), variant);
      const root = document.querySelector<HTMLElement>('[data-slot="particles"]')!;
      expect(root).toHaveAttribute("aria-hidden", "true");
      expect(getComputedStyle(root).pointerEvents).toBe("none");
      expect(root.querySelector("canvas")).not.toBeNull();
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("Particles density and motion", () => {
  it("never draws more than maxCount particles, however high the density", async () => {
    // Log every clearRect (one per drawn frame) and arc radius in call order, then read ONE whole frame
    // (the arcs between two consecutive clearRects) so the count never lands mid-frame.
    const log: (number | "frame")[] = [];
    vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect").mockImplementation(() => {
      log.push("frame");
    });
    vi.spyOn(CanvasRenderingContext2D.prototype, "arc").mockImplementation((_x, _y, r) => {
      log.push(r);
    });
    renderUi(host({ density: 500, maxCount: 12 }));
    await expect.poll(() => log.filter((e) => e === "frame").length).toBeGreaterThanOrEqual(3);
    const first = log.indexOf("frame");
    const second = log.indexOf("frame", first + 1);
    const radii = log.slice(first + 1, second) as number[];
    // A particle is one core disc, or (near layer) a 3.2x halo + a 1.8x halo + the core.
    let particles = 0;
    for (let i = 0; i < radii.length; particles++) {
      const halo = i + 2 < radii.length && Math.abs(radii[i + 1]! / radii[i]! - 1.8 / 3.2) < 1e-6;
      i += halo ? 3 : 1;
    }
    expect(particles).toBe(12);
  });

  it("animates while visible and stops while `paused`", async () => {
    const spy = arcs();
    const view = renderUi(host({ maxCount: 10 }));
    await expect.poll(() => spy.mock.calls.length, { timeout: 5000 }).toBeGreaterThan(30);
    view.rerender(host({ maxCount: 10, paused: true }));
    await frames(4);
    const before = spy.mock.calls.length;
    await frames(20);
    expect(spy.mock.calls.length).toBe(before);
    expect(document.querySelector('[data-slot="particles"]')).toHaveAttribute("data-paused");
  });

  it("with reduced motion draws one still frame and no loop", async () => {
    reduceMotion();
    const spy = arcs();
    renderUi(host({ maxCount: 10 }));
    await expect.poll(() => spy.mock.calls.length).toBeGreaterThan(0);
    await frames(5);
    const before = spy.mock.calls.length;
    await frames(25);
    expect(spy.mock.calls.length).toBe(before);
  });

  it("pointer none still draws", async () => {
    const spy = arcs();
    renderUi(host({ pointer: "none", maxCount: 6 }));
    await expect.poll(() => spy.mock.calls.length).toBeGreaterThan(0);
  });
});
