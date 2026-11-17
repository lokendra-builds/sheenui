// OrbitingCircles: items on rings, two transform rotations each; labelled list or hidden decoration; held still on hover.

import { describe, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";

import { OrbitingCircles } from "../../src/components/orbiting-circles/orbiting-circles";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const ring = (props: Parameters<typeof OrbitingCircles>[0] extends infer P ? Partial<P> : never = {}) => (
  <div className="relative size-80">
    <OrbitingCircles radius={90} duration={10} {...props}>
      <a href="#a">One</a>
      <a href="#b">Two</a>
      <a href="#c">Three</a>
    </OrbitingCircles>
  </div>
);
const root = () => document.querySelector<HTMLElement>('[data-slot="orbiting-circles"]')!;
const running = () =>
  root()
    .getAnimations({ subtree: true })
    .filter((a) => a.playState === "running").length;

describeVariants((variant) => {
  describe(`OrbitingCircles in ${variant.theme} / ${variant.style}`, () => {
    it("with a label is a labelled list of its items and passes axe", async () => {
      renderUi(ring({ label: "Integrations" }), variant);
      expect(screen.getByRole("list", { name: "Integrations" })).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect((await runAxe()).violations).toEqual([]);
    });

    it("without a label is decorative and hidden", async () => {
      renderUi(
        <div className="relative size-80">
          <OrbitingCircles radius={90}>
            <span>x</span>
            <span>y</span>
          </OrbitingCircles>
        </div>,
        variant,
      );
      expect(root()).toHaveAttribute("aria-hidden", "true");
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("OrbitingCircles motion", () => {
  it("runs the ring plus one counter-rotation per item, holds while paused, and uses transform only", async () => {
    const view = renderUi(ring({ label: "L" }));
    await expect.poll(running).toBe(4);
    const props = new Set(
      root()
        .getAnimations({ subtree: true })
        .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))),
    );
    expect(props.has("transform")).toBe(true);
    expect(props.has("opacity")).toBe(false);
    view.rerender(ring({ label: "L", paused: true }));
    await expect.poll(running).toBe(0);
    view.rerender(ring({ label: "L" }));
    await expect.poll(running).toBe(4);
  });

  it("holds still while an item is hovered or focused, and resumes after", async () => {
    renderUi(ring({ label: "L" }));
    await expect.poll(running).toBe(4);
    // The items move, so drive the events directly instead of aiming a real pointer at a target in motion.
    const link = screen.getByRole("link", { name: "Two" });
    fireEvent.pointerEnter(link.parentElement!);
    await expect.poll(running).toBe(0);
    fireEvent.pointerLeave(link.parentElement!);
    await expect.poll(running).toBe(4);
    act(() => link.focus());
    await expect.poll(running).toBe(0);
    act(() => link.blur());
    await expect.poll(running).toBe(4);
  });

  it("with reduced motion the items rest on the ring and nothing animates", async () => {
    reduceMotion();
    renderUi(ring({ label: "L" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(running()).toBe(0);
  });
});
