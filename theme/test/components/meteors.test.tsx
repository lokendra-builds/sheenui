// Meteors: occasional streaks. Decorative, capped, one transform + opacity animation each, still when motion is reduced.

import { describe, expect, it } from "vitest";

import { Meteors } from "../../src/components/meteors/meteors";
import { holdFor, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const host = (props: Parameters<typeof Meteors>[0] = {}) => (
  <div className="relative h-56 w-96 rounded-2xl">
    <Meteors {...props} />
  </div>
);
const root = () => document.querySelector<HTMLElement>('[data-slot="meteors"]')!;
const streaks = () => root().querySelectorAll("[data-meteor]");
/** The streaks are driven by the shared 30 Hz beat: "running" means the animation clock advanced over ~120 ms. */
const running = async () => {
  const all = root().getAnimations({ subtree: true });
  const before = all.map((a) => Number(a.currentTime ?? 0));
  await holdFor(120);
  return all.filter((a, i) => Number(a.currentTime ?? 0) > (before[i] ?? 0)).length;
};

describeVariants((variant) => {
  describe(`Meteors in ${variant.theme} / ${variant.style}`, () => {
    it("is decorative, click-through and passes axe", async () => {
      renderUi(host({ count: 5 }), variant);
      expect(root()).toHaveAttribute("aria-hidden", "true");
      expect(getComputedStyle(root()).pointerEvents).toBe("none");
      expect(streaks()).toHaveLength(5);
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("Meteors motion", () => {
  it("caps the count at 24", () => {
    renderUi(host({ count: 500 }));
    expect(streaks()).toHaveLength(24);
  });

  it("flies by transform and opacity only, and `paused` holds every streak", async () => {
    const view = renderUi(host({ count: 4 }));
    await expect.poll(running).toBe(4);
    const keys = new Set(
      root()
        .getAnimations({ subtree: true })
        .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))),
    );
    for (const key of ["transform", "opacity"]) expect(keys.has(key)).toBe(true);
    expect(
      [...keys].filter((k) => !["offset", "computedOffset", "easing", "composite", "transform", "opacity"].includes(k)),
    ).toEqual([]);
    view.rerender(host({ count: 4, paused: true }));
    await expect.poll(running).toBe(0);
    expect(root()).toHaveAttribute("data-paused");
    view.rerender(host({ count: 4 }));
    await expect.poll(running).toBe(4);
  });

  it("with reduced motion shows a few still streaks and nothing animates", async () => {
    reduceMotion();
    renderUi(host({ count: 10 }));
    await expect.poll(() => root().querySelectorAll("span").length).toBeGreaterThan(0);
    expect(root().querySelectorAll("span").length).toBeLessThanOrEqual(4);
    expect(streaks()).toHaveLength(0);
    expect(await running()).toBe(0);
  });
});
