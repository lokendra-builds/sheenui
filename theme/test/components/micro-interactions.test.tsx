// Micro-interaction layer (motion.css "Micro-interaction layer"): magnetic pull, sweep of light, icon motion,
// underline draw, focus pulse. Each in the four looks, with axe and with reduced motion.

import { useRef } from "react";
import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/dialog/dialog";
import { GlassCard } from "../../src/components/glass-card/glass-card";
import { useMagnetic } from "../../src/hooks/use-magnetic";
import { holdFor } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function move(x: number, y: number) {
  document.dispatchEvent(
    new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType: "mouse", bubbles: true }),
  );
}

function Pull() {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);
  return (
    <a ref={ref} href="#go" style={{ display: "inline-block", margin: 40, padding: 12 }}>
      Get started
    </a>
  );
}

describeVariants((variant) => {
  it("useMagnetic leans the element toward the pointer within 8 px, caps the pull, and lets go", async () => {
    renderUi(<Pull />, variant);
    const el = screen.getByRole("link", { name: "Get started" });
    const box = el.getBoundingClientRect();
    // 5 px outside the right edge, level with the centre: inside the 8 px reach.
    move(box.right + 5, box.top + box.height / 2);
    await expect.poll(() => el.style.transform).toMatch(/^translate3d\(/);
    await expect.poll(() => Math.abs(parseFloat(el.style.transform.slice(12)))).toBeGreaterThan(0.2);
    // Never more than distance.magneticMax (6 px), however far inside.
    move(box.right + 8, box.bottom + 8);
    await expect
      .poll(() =>
        (el.style.transform.match(/-?\d+(\.\d+)?(?=px)/g) ?? []).every((n) => Math.abs(parseFloat(n)) <= 6.01),
      )
      .toBe(true);
    // 40 px away: springs home.
    move(box.right + 40, box.top - 40);
    await expect.poll(() => el.style.transform, { timeout: 3000 }).toBe("");
  });

  it("useMagnetic does nothing with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<Pull />, variant);
    const el = screen.getByRole("link", { name: "Get started" });
    const box = el.getBoundingClientRect();
    move(box.right + 4, box.top + box.height / 2);
    await holdFor(150);
    expect(el.style.transform).toBe("");
  });

  it("primary buttons are magnetic; other variants and disabled buttons are not", async () => {
    renderUi(
      <div style={{ display: "flex", gap: 80, padding: 40 }}>
        <Button>Primary</Button>
        <Button variant="glass">Glass</Button>
        <Button disabled>Off</Button>
      </div>,
      variant,
    );
    const primary = screen.getByRole("button", { name: "Primary" });
    const glass = screen.getByRole("button", { name: "Glass" });
    const box = primary.getBoundingClientRect();
    move(box.left - 4, box.top + box.height / 2);
    await expect.poll(() => primary.style.transform).toMatch(/translate3d/);
    const gbox = glass.getBoundingClientRect();
    move(gbox.left - 4, gbox.top + gbox.height / 2);
    await holdFor(100);
    expect(glass.style.transform).toBe("");
  });

  it("a GlassCard sweeps light across itself on hover, and not with reduced motion", async () => {
    renderUi(<GlassCard data-testid="card">Plan details</GlassCard>, variant);
    const card = screen.getByTestId("card");
    const band = card.querySelector<HTMLElement>('[data-slot="sheen-sweep"] > i')!;
    expect(band.parentElement).toHaveAttribute("aria-hidden", "true");
    await userEvent.hover(card);
    await expect
      .poll(() => band.getAnimations().some((a) => (a as CSSAnimation).animationName === "sheen-sweep"))
      .toBe(true);
    expect(await runAxe()).toHaveNoViolations();
  });

  it("a GlassCard does not sweep with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<GlassCard data-testid="card">Plan details</GlassCard>, variant);
    const card = screen.getByTestId("card");
    const band = card.querySelector<HTMLElement>('[data-slot="sheen-sweep"] > i')!;
    await userEvent.hover(card);
    await holdFor(100);
    expect(band.getAnimations().filter((a) => (a as CSSAnimation).animationName === "sheen-sweep")).toEqual([]);
  });

  it("a Dialog sweeps light across its glass as it opens, and its close icon turns on hover", async () => {
    renderUi(
      <Dialog>
        <DialogTrigger render={<Button variant="glass" />}>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription>Change things.</DialogDescription>
        </DialogContent>
      </Dialog>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    const band = dialog.querySelector<HTMLElement>('[data-slot="sheen-sweep"] > i')!;
    await expect
      .poll(() => band.getAnimations().some((a) => (a as CSSAnimation).animationName === "sheen-sweep"))
      .toBe(true);
    const close = screen.getByRole("button", { name: "Close" });
    await userEvent.hover(close);
    await expect.poll(() => getComputedStyle(close.querySelector("svg")!).rotate).toBe("90deg");
    expect(await runAxe()).toHaveNoViolations();
  });

  it("a trailing arrow in a button slides on hover; the label does not move", async () => {
    renderUi(
      <Button
        variant="glass"
        trailing={
          <svg aria-hidden data-testid="arrow" viewBox="0 0 24 24" width="16" height="16">
            <path d="M5 12h14" />
          </svg>
        }
      >
        Next
      </Button>,
      variant,
    );
    const arrow = screen.getByTestId("arrow").parentElement!;
    expect(getComputedStyle(arrow).translate).toBe("none");
    await userEvent.hover(screen.getByRole("button", { name: "Next" }));
    await expect.poll(() => parseFloat(getComputedStyle(arrow).translate)).toBeGreaterThan(0);
  });

  it("a link button draws its underline from the start on hover (scaleX), instantly with reduced motion", async () => {
    renderUi(<Button variant="link">Read the docs</Button>, variant);
    const link = screen.getByRole("button", { name: "Read the docs" });
    expect(link).toHaveClass("sheen-underline");
    expect(getComputedStyle(link, "::before").transform).toMatch(/^matrix\(0,/);
    await userEvent.hover(link);
    await expect.poll(() => getComputedStyle(link, "::before").transform).toMatch(/^matrix\(1,/);
    expect(await runAxe()).toHaveNoViolations();
  });

  it("keyboard focus pulses the ring once (outline colour); with reduced motion there is no pulse", async () => {
    renderUi(<Button variant="glass">Focus me</Button>, variant);
    await userEvent.tab();
    const button = screen.getByRole("button", { name: "Focus me" });
    expect(button).toHaveFocus();
    expect(button.getAnimations().some((a) => (a as CSSAnimation).animationName === "sheen-focus-pulse")).toBe(true);
  });

  it("keyboard focus does not pulse with reduced motion", async () => {
    document.documentElement.setAttribute("data-motion", "reduced");
    renderUi(<Button variant="glass">Focus me</Button>, variant);
    await userEvent.tab();
    const button = screen.getByRole("button", { name: "Focus me" });
    expect(button.getAnimations().filter((a) => (a as CSSAnimation).animationName === "sheen-focus-pulse")).toEqual([]);
  });
});
