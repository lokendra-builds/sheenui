// TextReveal: scroll-linked word opacity. Real text, readable before hydration, plain under reduced motion.

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextReveal } from "../../src/components/text-reveal/text-reveal";
import { frames, reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const TEXT = "Light passes through glass and the words arrive one by one";
const page = (dim?: number) => (
  <div>
    <div style={{ height: "150vh" }} />
    <TextReveal as="h2" dim={dim} data-testid="t">
      {TEXT}
    </TextReveal>
    <div style={{ height: "150vh" }} />
  </div>
);
const words = () => [...document.querySelectorAll<HTMLElement>('[data-slot="text-reveal"] > span')];

describeVariants((variant) => {
  describe(`TextReveal in ${variant.theme} / ${variant.style}`, () => {
    it("keeps the text intact as real words in order and passes axe", async () => {
      renderUi(page(1), variant);
      const el = document.querySelector('[data-slot="text-reveal"]')!;
      expect(el.tagName).toBe("H2");
      expect(el.textContent).toBe(TEXT);
      expect(words()).toHaveLength(TEXT.split(" ").length);
      expect((await runAxe()).violations).toEqual([]);
    });
  });
});

describe("TextReveal scroll", () => {
  it("is plain, fully visible text in the server markup (readable without JavaScript)", () => {
    const html = renderToString(<TextReveal>{TEXT}</TextReveal>);
    expect(html).not.toMatch(/opacity/);
    expect(html).toContain(">Light </span>");
  });

  it("dims unrevealed words, and reveals them as the page scrolls to the text", async () => {
    renderUi(page(0.3));
    await expect.poll(() => Number(getComputedStyle(words()[0]!).opacity)).toBeCloseTo(0.3, 1);
    const target = document.querySelector('[data-slot="text-reveal"]')!;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.1);
    await frames(10);
    window.scrollTo(0, top + 400);
    await expect.poll(() => Number(getComputedStyle(words().at(-1)!).opacity), { timeout: 5000 }).toBeGreaterThan(0.95);
    window.scrollTo(0, 0);
  });

  it("with reduced motion every word is at full opacity", async () => {
    reduceMotion();
    renderUi(page(0.3));
    await frames(5);
    for (const w of words()) expect(getComputedStyle(w).opacity).toBe("1");
  });
});
