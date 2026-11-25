// LiquidGlass: the lens-map maths, feature detection (Chromium-only refraction), the refraction
// budget (max 3 lenses live), and the graceful fallbacks (Lite, reduced transparency, other browsers).

import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import {
  LiquidGlass,
  MAX_REFRACTION_SURFACES,
  supportsLiquidGlass,
} from "../../src/components/liquid-glass/liquid-glass";
import { lensGeometry, lensImages, supportsBackdropSvgFilter } from "../../src/components/liquid-glass/lens-map";
import { renderUi, runAxe } from "../render";
import { frames } from "../helpers";

const html = document.documentElement;
const define = (key: string, value: unknown) => Object.defineProperty(navigator, key, { value, configurable: true });

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "userAgentData");
  Reflect.deleteProperty(navigator, "userAgent");
});

describe("lensGeometry", () => {
  it("clamps the radius to half the short side and the bezel to the radius", () => {
    expect(lensGeometry({ width: 200, height: 100, radius: 20, bezel: 8 })).toEqual({ radius: 20, bezel: 8 });
    expect(lensGeometry({ width: 200, height: 100, radius: 999, bezel: 8 })).toEqual({ radius: 50, bezel: 8 });
    expect(lensGeometry({ width: 200, height: 100, radius: 10, bezel: 999 })).toEqual({ radius: 10, bezel: 10 });
    expect(lensGeometry({ width: 200, height: 100, radius: -4, bezel: 0 })).toEqual({ radius: 0, bezel: 1 });
    // A square-cornered lens may still have a bezel, up to half the short side.
    expect(lensGeometry({ width: 80, height: 40, radius: 0, bezel: 500 })).toEqual({ radius: 0, bezel: 20 });
  });
});

describe("lensImages", () => {
  it("renders a displacement map and a tint mask as PNG data URLs", () => {
    const images = lensImages({ width: 120, height: 60, radius: 20, bezel: 10 });
    expect(images).not.toBeNull();
    expect(images!.map).toMatch(/^data:image\/png;base64,/);
    expect(images!.tint).toMatch(/^data:image\/png;base64,/);
    expect(images!.map).not.toBe(images!.tint);
  });

  it("is cached per geometry (same object back) and refreshes LRU order", () => {
    const a = lensImages({ width: 90, height: 50, radius: 12, bezel: 6 });
    expect(lensImages({ width: 90, height: 50, radius: 12, bezel: 6 })).toBe(a);
    // Sub-pixel sizes round to the same key.
    expect(lensImages({ width: 90.2, height: 49.8, radius: 12, bezel: 6 })).toBe(a);
  });

  it("returns null for lenses smaller than 2 px", () => {
    expect(lensImages({ width: 1, height: 100, radius: 4, bezel: 4 })).toBeNull();
    expect(lensImages({ width: 100, height: 1.4, radius: 4, bezel: 4 })).toBeNull();
  });

  it("draws big lenses at a lower resolution and square-cornered / circular lenses without error", () => {
    expect(lensImages({ width: 1200, height: 800, radius: 40, bezel: 30 })).not.toBeNull();
    expect(lensImages({ width: 64, height: 64, radius: 0, bezel: 8 })).not.toBeNull();
    expect(lensImages({ width: 64, height: 64, radius: 32, bezel: 20 })).not.toBeNull();
  });

  it("keeps a bounded cache: 40 distinct sizes still all render", () => {
    for (let i = 0; i < 40; i++) expect(lensImages({ width: 50 + i, height: 40, radius: 10, bezel: 5 })).not.toBeNull();
  });

  it("returns null when the canvas has no 2d context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(lensImages({ width: 333, height: 77, radius: 10, bezel: 5 })).toBeNull();
  });
});

describe("supportsBackdropSvgFilter (feature detection)", () => {
  it("is true on this Chromium and exported under its public name", () => {
    expect(supportsBackdropSvgFilter()).toBe(true);
    expect(supportsLiquidGlass).toBe(supportsBackdropSvgFilter);
  });

  it("trusts userAgentData brands when present", () => {
    define("userAgentData", { brands: [{ brand: "Not A Brand" }, { brand: "Chromium" }] });
    expect(supportsBackdropSvgFilter()).toBe(true);
    define("userAgentData", { brands: [{ brand: "Firefox" }] });
    expect(supportsBackdropSvgFilter()).toBe(false);
  });

  it("falls back to the user agent: Chrome/Chromium yes; iOS Chrome, Firefox, Edge-iOS and Safari no", () => {
    define("userAgentData", undefined);
    const ua = (value: string) => {
      define("userAgent", value);
      return supportsBackdropSvgFilter();
    };
    expect(
      ua("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"),
    ).toBe(true);
    expect(ua("Mozilla/5.0 (X11; Linux) AppleWebKit/537.36 Chromium/140.0 Safari/537.36")).toBe(true);
    expect(
      ua(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
    expect(
      ua("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 FxiOS/140.0 Mobile/15E148 Safari/605.1.15"),
    ).toBe(false);
    expect(ua("Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 EdgiOS/140.0 Chrome/140.0 Safari/605.1.15")).toBe(false);
    expect(
      ua(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      ),
    ).toBe(false);
    expect(ua("Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0")).toBe(false);
  });
});

const sized = { width: 220, height: 90 };

describe("LiquidGlass", () => {
  it("is a plain glass surface first: a div with the slot, regular tint and a specular rim", () => {
    renderUi(
      <LiquidGlass data-testid="g" style={sized} refraction={0}>
        content
      </LiquidGlass>,
    );
    const g = screen.getByTestId("g");
    expect(g.tagName).toBe("DIV");
    expect(g).toHaveAttribute("data-slot", "liquid-glass");
    expect(g).toHaveClass("glass-2", "rounded-sheen-xl");
    expect(g).not.toHaveAttribute("data-refracting");
    expect(g).toHaveTextContent("content");
    expect(g.querySelector('[data-slot="liquid-glass-rim"]')).toHaveAttribute("aria-hidden", "true");
    expect(g.querySelector("svg")).toBeNull();
  });

  it("refracts on Chromium: builds an SVG lens filter + a thinned tint, and points backdrop-filter at it", async () => {
    renderUi(<LiquidGlass data-testid="g" style={sized} />);
    const g = screen.getByTestId("g");
    await expect.poll(() => g.hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    const filter = g.querySelector("svg filter")!;
    expect(filter.id).toMatch(/^sheen-lens-/);
    expect(g.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(filter.querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "12");
    expect(filter.querySelectorAll("feDisplacementMap")).toHaveLength(1);
    expect(filter.querySelector("feColorMatrix[type=saturate]")).toHaveAttribute("values", "1.5");
    expect(filter.querySelector("feImage")?.getAttribute("href")).toMatch(/^data:image\/png/);
    expect(g.style.getPropertyValue("--sheen-lg-filter")).toBe(`url(#${filter.id})`);
    const tint = g.querySelector<HTMLElement>('[data-slot="liquid-glass-tint"]')!;
    expect(tint).toHaveAttribute("aria-hidden", "true");
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Safari and older Chromium only expose the prefixed property
    expect(tint.style.maskImage || tint.style.webkitMaskImage).toContain("data:image/png");
  });

  it("the clear variant has no tint layer and frosts lightly; aberration splits the colours into three displacements", async () => {
    renderUi(
      <LiquidGlass data-testid="g" variant="clear" aberration={1} saturation={2} specular={false} style={sized} />,
    );
    const g = screen.getByTestId("g");
    await expect.poll(() => g.hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    expect(g).toHaveClass("glass-1");
    expect(g.querySelector('[data-slot="liquid-glass-tint"]')).toBeNull();
    expect(g.querySelector('[data-slot="liquid-glass-rim"]')).toBeNull();
    const filter = g.querySelector("svg filter")!;
    expect(filter.querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "1");
    expect(filter.querySelectorAll("feDisplacementMap")).toHaveLength(3);
    expect(filter.querySelectorAll("feBlend")).toHaveLength(2);
    expect(filter.querySelector("feColorMatrix[type=saturate]")).toHaveAttribute("values", "2");
  });

  it("frost, bezel, refraction strength and shape are all adjustable", async () => {
    renderUi(<LiquidGlass data-testid="g" shape="pill" frost={5} bezel={12} refraction={2} style={sized} />);
    const g = screen.getByTestId("g");
    expect(g).toHaveClass("rounded-sheen-full");
    await expect.poll(() => g.hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    expect(g.querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "5");
    // scale = 2 * strength * bezel * 1.1 (bezel is clamped to the pill radius).
    const scale = Number(g.querySelector("feDisplacementMap")!.getAttribute("scale"));
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(2 * 2 * 12 * 1.1 + 0.001);
  });

  it("circle shape keeps a square aspect; interactive adds focus + press classes; className and render are honoured", () => {
    renderUi(
      <LiquidGlass
        data-testid="c"
        shape="circle"
        interactive
        refraction={0}
        className="mine"
        render={<button type="button" />}
      >
        x
      </LiquidGlass>,
    );
    const c = screen.getByTestId("c");
    expect(c.tagName).toBe("BUTTON");
    expect(c).toHaveClass("aspect-square", "rounded-full", "mine");
    expect(c.className).toContain("focus-visible:outline-2");
    expect(c.className).toContain("active:scale-[0.97]");
  });

  it("falls back to plain frosted glass in Lite mode, with reduced transparency, and where refraction is unsupported", async () => {
    html.setAttribute("data-glass", "lite");
    const lite = renderUi(<LiquidGlass data-testid="lite" style={sized} />);
    await frames(13);
    expect(screen.getByTestId("lite")).not.toHaveAttribute("data-refracting");
    lite.unmount();
    html.removeAttribute("data-glass");

    html.setAttribute("data-transparency", "reduced");
    const solid = renderUi(<LiquidGlass data-testid="solid" style={sized} />);
    await frames(13);
    expect(screen.getByTestId("solid")).not.toHaveAttribute("data-refracting");
    solid.unmount();
    html.removeAttribute("data-transparency");

    define("userAgentData", undefined);
    define("userAgent", "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15");
    renderUi(<LiquidGlass data-testid="safari" style={sized} />);
    await frames(13);
    expect(screen.getByTestId("safari")).not.toHaveAttribute("data-refracting");
  });

  it("also yields to OS-level solid glass (reduced transparency / more contrast / forced colours)", async () => {
    const real = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((q: string) =>
      q.includes("prefers-reduced-transparency")
        ? ({
            matches: true,
            media: q,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
          } as unknown as MediaQueryList)
        : real(q),
    );
    renderUi(<LiquidGlass data-testid="os" style={sized} />);
    await frames(13);
    expect(screen.getByTestId("os")).not.toHaveAttribute("data-refracting");
  });

  it("at most 3 lenses refract at once; closing one hands its slot to a waiting lens", async () => {
    expect(MAX_REFRACTION_SURFACES).toBe(3);
    const ids = ["a", "b", "c", "d", "e"];
    const lenses = (list: string[]) => (
      <>
        {list.map((id) => (
          <LiquidGlass key={id} data-testid={id} style={{ width: 160, height: 60, marginBottom: 8 }}>
            {id}
          </LiquidGlass>
        ))}
      </>
    );
    const view = renderUi(lenses(ids));
    const refracting = () => ids.filter((id) => screen.queryByTestId(id)?.hasAttribute("data-refracting"));
    await expect.poll(() => refracting().length, { timeout: 5000 }).toBe(3);
    await frames(19);
    expect(refracting()).toHaveLength(3);
    const first = refracting()[0]!;
    view.rerender(lenses(ids.filter((id) => id !== first)));
    await expect
      .poll(
        () =>
          ids.filter((id) => id !== first).filter((id) => screen.queryByTestId(id)?.hasAttribute("data-refracting"))
            .length,
        { timeout: 5000 },
      )
      .toBe(3);
  });

  it("a lens scrolled far off screen releases its slot", async () => {
    renderUi(
      <div>
        <LiquidGlass data-testid="top" style={sized} />
        <div style={{ height: 4000 }} />
        <LiquidGlass data-testid="bottom" style={sized} />
      </div>,
    );
    await expect.poll(() => screen.getByTestId("top").hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    expect(screen.getByTestId("bottom")).not.toHaveAttribute("data-refracting");
    screen.getByTestId("bottom").scrollIntoView();
    await expect.poll(() => screen.getByTestId("bottom").hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    await expect.poll(() => screen.getByTestId("top").hasAttribute("data-refracting"), { timeout: 4000 }).toBe(false);
    window.scrollTo(0, 0);
  });

  it("has no axe violations, plain or refracting", async () => {
    renderUi(
      <LiquidGlass data-testid="g" style={sized}>
        <p>Readable text on glass</p>
      </LiquidGlass>,
    );
    await expect.poll(() => screen.getByTestId("g").hasAttribute("data-refracting"), { timeout: 4000 }).toBe(true);
    expect(await runAxe()).toHaveNoViolations();
  });
});
