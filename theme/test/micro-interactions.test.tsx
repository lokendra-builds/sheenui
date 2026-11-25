import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../src/components/button/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../src/components/dialog/dialog";
import { GlassCard } from "../src/components/glass-card/glass-card";
import { distance } from "../src/motion/tokens";
import { frames, reduceMotion } from "./helpers";
import { describeVariants, renderUi } from "./render";

/*
 * The micro-interaction layer (motion.css "Micro-interaction layer" and "Button glow and card
 * spotlight"): a pre-rendered glow on filled buttons whose OPACITY fades (never a box-shadow transition), a pointer
 * spotlight on cards, the 8 px magnetic cap, the sweep of light across a GlassCard on hover and a Dialog on open, the
 * link underline that draws in, the trailing-icon nudge and the close icon's quarter turn. Run in the four looks and
 * again with reduced motion, where none of the movement remains.
 */

const pseudo = (el: Element, which: "::before" | "::after") => getComputedStyle(el, which);
const animationNames = (el: Element) => el.getAnimations().map((a) => (a as CSSAnimation).animationName);

describeVariants((variant) => {
  it("a primary button carries a glow layer that rests at opacity 0 and only transitions opacity", () => {
    renderUi(<Button>Save</Button>, variant);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.classList.contains("sheen-glow")).toBe(true);
    const glow = pseudo(button, "::before");
    expect(glow.opacity).toBe("0");
    expect(glow.transitionProperty).toBe("opacity");
    // The button itself never transitions box-shadow (a paint property).
    expect(getComputedStyle(button).transitionProperty).not.toContain("box-shadow");
  });

  it("danger buttons glow too; glass, outline, ghost and link buttons do not", () => {
    renderUi(
      <>
        <Button variant="danger">Delete</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>,
      variant,
    );
    expect(screen.getByRole("button", { name: "Delete" }).classList.contains("sheen-glow")).toBe(true);
    for (const name of ["Glass", "Outline", "Ghost", "Link"]) {
      expect(screen.getByRole("button", { name }).classList.contains("sheen-glow")).toBe(false);
    }
  });

  it("a disabled button never lights its glow", () => {
    renderUi(<Button disabled>Off</Button>, variant);
    expect(pseudo(screen.getByRole("button", { name: "Off" }), "::before").opacity).toBe("0");
  });

  it("the card spotlight is a pseudo-element under the content with no resting light", () => {
    renderUi(<div className="sheen-spot glass-2 rounded-sheen-lg p-4">Card</div>, variant);
    const card = screen.getByText("Card");
    expect(getComputedStyle(card).isolation).toBe("isolate");
    const spot = pseudo(card, "::before");
    expect(spot.zIndex).toBe("-1");
    // At rest the pointer light sits at its ambient 0.42: the spotlight is fully off.
    expect(spot.opacity).toBe("0");
  });

  it("with reduced motion there is no spotlight layer and the glow is a plain fade", () => {
    reduceMotion();
    renderUi(
      <>
        <Button>Save</Button>
        <div className="sheen-spot glass-2 p-4">Card</div>
      </>,
      variant,
    );
    expect(pseudo(screen.getByText("Card"), "::before").content).toBe("none");
    const glow = pseudo(screen.getByRole("button", { name: "Save" }), "::before");
    expect(glow.opacity).toBe("0");
    expect(Number.parseFloat(glow.transitionDuration)).toBeLessThanOrEqual(0.15);
  });

  it("a GlassCard carries a sweep layer under its content that plays one sweep of light on hover", async () => {
    renderUi(<GlassCard className="p-6">Card</GlassCard>, variant);
    const card = screen.getByText("Card");
    const layer = card.querySelector<HTMLElement>(":scope > .sheen-sweep")!;
    const band = layer.querySelector<HTMLElement>("i")!;
    expect(getComputedStyle(layer).zIndex).toBe("-10");
    // No backdrop-filter of its own: the layer never adds a glass surface to the budget.
    expect(getComputedStyle(layer).backdropFilter).toBe("none");
    expect(getComputedStyle(band).opacity).toBe("0");
    expect(animationNames(band)).not.toContain("sheen-sweep");
    await userEvent.hover(card);
    await expect.poll(() => animationNames(band)).toContain("sheen-sweep");
    await userEvent.unhover(card);
  });

  it("a GlassCard under reduced motion keeps the layer but never sweeps", async () => {
    reduceMotion();
    renderUi(<GlassCard className="p-6">Card</GlassCard>, variant);
    const card = screen.getByText("Card");
    const band = card.querySelector<HTMLElement>(":scope > .sheen-sweep > i")!;
    await userEvent.hover(card);
    await frames(3);
    expect(animationNames(band)).toEqual([]);
    await userEvent.unhover(card);
  });

  it("the link Button draws its underline from the inline start on hover and only moves transform", async () => {
    renderUi(<Button variant="link">Read the docs</Button>, variant);
    const link = screen.getByRole("button", { name: "Read the docs" });
    expect(link.classList.contains("sheen-underline")).toBe(true);
    const line = pseudo(link, "::before");
    // scaleX(0) at rest, anchored at the inline start (x = 0 in LTR).
    expect(line.transform).toBe("matrix(0, 0, 0, 1, 0, 0)");
    expect(line.transitionProperty).toBe("transform");
    await userEvent.hover(link);
    await expect.poll(() => pseudo(link, "::before").transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
    expect(pseudo(link, "::before").transformOrigin.startsWith("0px")).toBe(true);
    await userEvent.unhover(link);
  });

  it("a trailing icon has its own slot and nudges 4 px on hover; a close icon turns a quarter", async () => {
    renderUi(
      <>
        <Button trailing={<svg aria-hidden viewBox="0 0 24 24" className="size-4" />}>Next</Button>
        <button type="button" aria-label="Close" data-sheen-close="">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" />
        </button>
      </>,
      variant,
    );
    const next = screen.getByRole("button", { name: "Next" });
    const slot = next.querySelector<HTMLElement>('[data-slot="button-trailing"]')!;
    expect(slot).not.toBeNull();
    expect(getComputedStyle(slot).translate).toBe("none");
    await userEvent.hover(next);
    // `translate: 4px 0` (the nudge token times two); Chrome serialises the zero y away.
    await expect.poll(() => getComputedStyle(slot).translate).toMatch(/^4px( 0px)?$/);
    await userEvent.unhover(next);
    await expect.poll(() => getComputedStyle(slot).translate).toBe("none");

    const close = screen.getByRole("button", { name: "Close" });
    const icon = close.querySelector("svg")!;
    expect(getComputedStyle(icon).rotate).toBe("none");
    await userEvent.hover(close);
    await expect.poll(() => getComputedStyle(icon).rotate).toBe("90deg");
    await userEvent.unhover(close);
  });

  it("with reduced motion the underline just shows, the icon stays put and the close icon does not turn", async () => {
    reduceMotion();
    renderUi(
      <>
        <Button variant="link">Read the docs</Button>
        <Button trailing={<svg aria-hidden viewBox="0 0 24 24" className="size-4" />}>Next</Button>
        <button type="button" aria-label="Close" data-sheen-close="">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" />
        </button>
      </>,
      variant,
    );
    const link = screen.getByRole("button", { name: "Read the docs" });
    expect(pseudo(link, "::before").transitionProperty).not.toBe("transform");
    await userEvent.hover(link);
    await frames(2);
    expect(pseudo(link, "::before").transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
    const next = screen.getByRole("button", { name: "Next" });
    await userEvent.hover(next);
    await frames(3);
    expect(getComputedStyle(next.querySelector('[data-slot="button-trailing"]')!).translate).toBe("none");
    const close = screen.getByRole("button", { name: "Close" });
    await userEvent.hover(close);
    await frames(3);
    expect(getComputedStyle(close.querySelector("svg")!).rotate).toBe("none");
    await userEvent.unhover(close);
  });

  it("a Dialog sweeps light across its glass once as it opens, never under reduced motion", async () => {
    const ui = (
      <Dialog>
        <DialogTrigger render={<Button variant="glass" />}>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Sweep</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    renderUi(ui, variant);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await expect.poll(() => screen.queryByRole("dialog")).not.toBeNull();
    const panel = screen.getByRole("dialog");
    const band = panel.querySelector<HTMLElement>(":scope > .sheen-sweep > i")!;
    expect(band).not.toBeNull();
    await expect.poll(() => animationNames(band)).toContain("sheen-sweep");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull();

    reduceMotion();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await expect.poll(() => screen.queryByRole("dialog")).not.toBeNull();
    await frames(3);
    const bandReduced = screen.getByRole("dialog").querySelector<HTMLElement>(":scope > .sheen-sweep > i")!;
    expect(animationNames(bandReduced)).not.toContain("sheen-sweep");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
  });
});

it("the magnetic pull is capped at 8 px", () => {
  expect(distance.magneticMax).toBe(8);
});
