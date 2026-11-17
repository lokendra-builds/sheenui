import { expect, it } from "vitest";

import { SheenScene } from "../../src/components/backdrop/scene";
import { pixel, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("renders a decorative picture with lazy, async, low-priority attributes", async () => {
    const { container } = renderUi(<SheenScene src={pixel} avifSrc={pixel} />, variant);
    const root = container.querySelector("[data-sheen-scene]")!;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    const img = root.querySelector("img")!;
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
    expect(img.getAttribute("fetchpriority")).toBe("low");
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("width")).toBe("1600");
    expect(img.getAttribute("height")).toBe("900");
    expect(root.querySelector("source")?.getAttribute("type")).toBe("image/avif");
    expect((await runAxe()).violations).toEqual([]);
  });

  it("loads eagerly with high priority above the fold", () => {
    const { container } = renderUi(<SheenScene src={pixel} priority fixed dim={2} />, variant);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
    expect(container.querySelector("[data-fixed]")).not.toBeNull();
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--sheen-scene-dim")).toBe("1");
  });

  it("drifts only when parallax is on and motion is not reduced", () => {
    const on = renderUi(<SheenScene src={pixel} parallax />, variant);
    expect(on.container.querySelector("[data-parallax]")).not.toBeNull();
    on.unmount();
    reduceMotion();
    const off = renderUi(<SheenScene src={pixel} parallax />, variant);
    expect(off.container.querySelector("[data-parallax]")).toBeNull();
  });
});
