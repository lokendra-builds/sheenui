// ScrollProgress: a scaleX bar tied to scroll. Decorative unless labelled; tracks a container; exact under reduced motion.

import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { ScrollProgress } from "../../src/components/scroll-progress/scroll-progress";
import { frames, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const bar = () => document.querySelector<HTMLElement>('[data-slot="scroll-progress"]')!;
const fill = () => bar().firstElementChild as HTMLElement;
const scale = () =>
  new DOMMatrixReadOnly(getComputedStyle(fill()).transform === "none" ? undefined : getComputedStyle(fill()).transform)
    .a;

function Panel({ label, smooth }: { label?: string; smooth?: boolean }) {
  return (
    <div>
      <ScrollProgress placement="inline" label={label} smooth={smooth} container={{ current: null }} />
      <div id="panel" style={{ height: 200, overflowY: "auto" }}>
        <div style={{ height: 1000 }} />
      </div>
    </div>
  );
}

describeVariants((variant) => {
  describe(`ScrollProgress in ${variant.theme} / ${variant.style}`, () => {
    it("is hidden decoration by default and passes axe", async () => {
      renderUi(<ScrollProgress />, variant);
      expect(bar()).toHaveAttribute("aria-hidden", "true");
      expect(bar()).not.toHaveAttribute("role");
      expect(getComputedStyle(bar()).position).toBe("fixed");
      expect((await runAxe()).violations).toEqual([]);
    });

    it("with a label is a named progressbar and passes axe", async () => {
      renderUi(<ScrollProgress label="Reading progress" />, variant);
      expect(screen.getByRole("progressbar", { name: "Reading progress" })).toHaveAttribute("aria-valuemax", "100");
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("ScrollProgress scroll", () => {
  it("fills as the page scrolls (scaleX) and its value moves in 5 % steps", async () => {
    renderUi(
      <div>
        <ScrollProgress label="Progress" smooth={false} />
        <div style={{ height: "300vh" }} />
      </div>,
    );
    await frames(5);
    expect(scale()).toBeLessThan(0.05);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(scale, { timeout: 5000 }).toBeGreaterThan(0.95);
    await expect.poll(() => Number(bar().getAttribute("aria-valuenow"))).toBe(100);
    window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2);
    await expect.poll(() => Number(bar().getAttribute("aria-valuenow"))).toBe(50);
    expect(Number(bar().getAttribute("aria-valuenow")) % 5).toBe(0);
    window.scrollTo(0, 0);
  });

  it("with reduced motion still tracks the scroll exactly, with no spring", async () => {
    reduceMotion();
    renderUi(
      <div>
        <ScrollProgress />
        <div style={{ height: "300vh" }} />
      </div>,
    );
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(scale, { timeout: 5000 }).toBeGreaterThan(0.99);
    window.scrollTo(0, 0);
  });

  it("renders in the flow with placement inline", () => {
    renderUi(<Panel />);
    expect(getComputedStyle(bar()).position).toBe("relative");
  });
});
