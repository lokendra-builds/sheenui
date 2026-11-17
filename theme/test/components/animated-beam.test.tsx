// AnimatedBeam: a light travelling between two measured elements. Decorative, one transform animation, paused when asked.

import { useRef, type ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { AnimatedBeam } from "../../src/components/animated-beam/animated-beam";
import { holdFor, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Diagram(props: Partial<ComponentProps<typeof AnimatedBeam>>) {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);
  return (
    <div ref={container} className="relative flex w-96 items-center justify-between p-4">
      <div ref={from} className="size-12">
        A
      </div>
      <div ref={to} className="size-12">
        B
      </div>
      <AnimatedBeam containerRef={container} fromRef={from} toRef={to} {...props} />
    </div>
  );
}

const root = () => document.querySelector<HTMLElement>('[data-slot="animated-beam"]')!;
const light = () => document.querySelector<HTMLElement>('[data-slot="animated-beam-light"]');
/** The light is driven by the shared 30 Hz beat: "running" means the animation clock advanced over ~120 ms. */
const running = async () => {
  const all = (light()?.getAnimations() ?? []).filter((a) => a.effect?.getComputedTiming().iterations === Infinity);
  const before = all.map((a) => Number(a.currentTime ?? 0));
  await holdFor(120);
  return all.filter((a, i) => Number(a.currentTime ?? 0) > (before[i] ?? 0)).length;
};

describeVariants((variant) => {
  describe(`AnimatedBeam in ${variant.theme} / ${variant.style}`, () => {
    it("draws a track between the elements, is decorative and passes axe", async () => {
      renderUi(<Diagram curvature={30} />, variant);
      await expect.poll(() => root().querySelector("path")?.getAttribute("d") ?? "").toMatch(/^M [\d.]+ [\d.]+ Q /);
      expect(root()).toHaveAttribute("aria-hidden", "true");
      expect(getComputedStyle(root()).pointerEvents).toBe("none");
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("AnimatedBeam motion", () => {
  it("runs one transform animation while visible, and `paused` holds it", async () => {
    const view = renderUi(<Diagram />);
    await expect.poll(running).toBe(1);
    const animated = light()!.getAnimations()[0]!;
    const props = (animated.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k));
    expect(new Set(props.filter((p) => !["offset", "computedOffset", "easing", "composite"].includes(p)))).toEqual(
      new Set(["transform", "opacity"]),
    );
    view.rerender(<Diagram paused />);
    await expect.poll(running).toBe(0);
    expect(root()).toHaveAttribute("data-paused");
    view.rerender(<Diagram />);
    await expect.poll(running).toBe(1);
  });

  it("reverse and curvature still produce a running light", async () => {
    renderUi(<Diagram reverse curvature={-40} interval={0} duration={1.5} />);
    await expect.poll(running).toBe(1);
  });

  it("with reduced motion shows only the still track: no light, no animation", async () => {
    reduceMotion();
    renderUi(<Diagram />);
    await expect.poll(() => root().querySelector("path")?.getAttribute("d")).toBeTruthy();
    expect(light()).toBeNull();
    expect(root().getAnimations({ subtree: true })).toHaveLength(0);
  });
});
