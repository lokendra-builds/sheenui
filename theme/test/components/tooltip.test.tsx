import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { Tooltip, TooltipProvider } from "../../src/components/tooltip/tooltip";
import { holdFor, parkPointer, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

// The real pointer stays where an earlier test left it; a hover-driven widget under it would open on its own.
beforeEach(parkPointer);

// Find the bubble by its text (the role="tooltip" test below covers the semantics).
const tip = (text: string) => screen.queryByText(text);

describeVariants((variant) => {
  it("shows on keyboard focus, describes the trigger, and hides on Escape", async () => {
    renderUi(
      <Tooltip content="Save changes" delay={0}>
        <Button>Save</Button>
      </Tooltip>,
      variant,
    );
    expect(tip("Save changes")).toBeNull();
    await userEvent.tab();
    const trigger = screen.getByRole("button", { name: "Save" });
    expect(trigger).toHaveFocus();
    await expect.poll(() => tip("Save changes")).not.toBeNull();
    // Focus is not stolen from the trigger.
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => tip("Save changes")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("is a plain tooltip: no landmark wrapper, trigger described by the bubble", async () => {
    renderUi(
      <Tooltip content="Save changes" delay={0}>
        <Button>Save</Button>
      </Tooltip>,
      variant,
    );
    await userEvent.tab();
    await expect.poll(() => tip("Save changes")).not.toBeNull();
    const bubble = screen.getByRole("tooltip");
    expect(bubble.closest('[role="region"]')).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-describedby")).toContain(bubble.id);
  });

  it("shows on hover and hides when the pointer leaves", async () => {
    renderUi(
      <>
        <Tooltip content="Delete" delay={0}>
          <Button>Trash</Button>
        </Tooltip>
        <p>elsewhere</p>
      </>,
      variant,
    );
    await userEvent.hover(screen.getByRole("button", { name: "Trash" }));
    await expect.poll(() => tip("Delete")).not.toBeNull();
    await userEvent.hover(screen.getByText("elsewhere"));
    await expect.poll(() => tip("Delete")).toBeNull();
  });

  it("respects the delay: not shown instantly when delay is long", async () => {
    renderUi(
      <Tooltip content="Slow" delay={600}>
        <Button>Wait</Button>
      </Tooltip>,
      variant,
    );
    await userEvent.hover(screen.getByRole("button", { name: "Wait" }));
    expect(tip("Slow")).toBeNull();
    await expect.poll(() => tip("Slow"), { timeout: 3000 }).not.toBeNull();
  });

  it.each(["top", "bottom", "left", "right"] as const)("side=%s", async (side) => {
    renderUi(
      <div style={{ padding: 120 }}>
        <Tooltip content="Side" side={side} delay={0}>
          <Button>Trigger</Button>
        </Tooltip>
      </div>,
      variant,
    );
    await userEvent.tab();
    await expect.poll(() => tip("Side")).not.toBeNull();
    await expect.poll(() => tip("Side")!.parentElement!.getAttribute("data-side")).toBe(side);
  });

  it("works inside a TooltipProvider with several triggers", async () => {
    renderUi(
      <TooltipProvider>
        <Tooltip content="First tip" delay={0}>
          <Button>One</Button>
        </Tooltip>
        <Tooltip content="Second tip" delay={0}>
          <Button>Two</Button>
        </Tooltip>
      </TooltipProvider>,
      variant,
    );
    await userEvent.tab();
    await expect.poll(() => tip("First tip")).not.toBeNull();
    await userEvent.tab();
    await expect.poll(() => tip("Second tip")).not.toBeNull();
  });

  it("has no axe violations while shown", async () => {
    renderUi(
      <Tooltip content="Helpful hint" delay={0}>
        <Button>Info</Button>
      </Tooltip>,
      variant,
    );
    await userEvent.tab();
    await expect.poll(() => tip("Helpful hint")).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });

  // The popup carries role="tooltip" and the trigger points to it with aria-describedby while it is open.
  it("exposes the tooltip to assistive tech (role=tooltip + aria-describedby)", async () => {
    renderUi(
      <Tooltip content="Save changes" delay={0}>
        <Button>Save</Button>
      </Tooltip>,
      variant,
    );
    const trigger = screen.getByRole("button", { name: "Save" });
    expect(trigger).not.toHaveAttribute("aria-describedby");
    await userEvent.tab();
    await expect.poll(() => screen.queryByRole("tooltip")).not.toBeNull();
    expect(trigger).toHaveAccessibleDescription("Save changes");
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("tooltip")).toBeNull();
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("keeps a description the trigger already has", async () => {
    renderUi(
      <>
        <p id="own-desc">Saves the draft</p>
        <Tooltip content="Cmd S" delay={0}>
          <Button aria-describedby="own-desc">Save</Button>
        </Tooltip>
      </>,
      variant,
    );
    await userEvent.tab();
    await expect.poll(() => screen.queryByRole("tooltip")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Save" })).toHaveAccessibleDescription("Saves the draft Cmd S");
  });
});

describe("Tooltip touch long press", () => {
  const fireTouch = (
    el: Element,
    type: "pointerDown" | "pointerMove" | "pointerUp" | "pointerCancel",
    x = 10,
    y = 10,
  ) => fireEvent[type](el, { pointerType: "touch", pointerId: 3, clientX: x, clientY: y });

  it("a long press shows the bubble, hides it again, and swallows the click that follows", async () => {
    const onClick = vi.fn();
    renderUi(
      <Tooltip content="Copy link" delay={0}>
        <Button onClick={onClick}>Copy</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Copy" });
    fireTouch(trigger, "pointerDown");
    expect(tip("Copy link")).toBeNull();
    await expect.poll(() => tip("Copy link"), { timeout: 3000 }).not.toBeNull();
    fireTouch(trigger, "pointerUp");
    // The click that iOS sends after a long press must not activate the trigger.
    fireEvent.click(trigger);
    expect(onClick).not.toHaveBeenCalled();
    // The next click is a real one.
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    await expect.poll(() => tip("Copy link"), { timeout: 6000 }).toBeNull();
  });

  it("moving the finger past the slop, or cancelling, cancels the long press", async () => {
    renderUi(
      <Tooltip content="Copy link" delay={0}>
        <Button>Copy</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Copy" });
    fireTouch(trigger, "pointerDown", 10, 10);
    fireTouch(trigger, "pointerMove", 11, 11);
    fireTouch(trigger, "pointerMove", 60, 60);
    await holdFor(700);
    expect(tip("Copy link")).toBeNull();
    fireTouch(trigger, "pointerDown");
    fireTouch(trigger, "pointerCancel");
    await holdFor(700);
    expect(tip("Copy link")).toBeNull();
    // A context menu right after a long press is suppressed; a plain one is not.
    expect(fireEvent.contextMenu(trigger)).toBe(true);
  });

  it("a mouse pointerdown never starts the long press", async () => {
    renderUi(
      <Tooltip content="Copy link" delay={0}>
        <Button>Copy</Button>
      </Tooltip>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Copy" }), { pointerType: "mouse" });
    await holdFor(700);
    expect(tip("Copy link")).toBeNull();
  });
});
