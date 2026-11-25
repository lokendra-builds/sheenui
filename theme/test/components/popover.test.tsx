import { expect, it } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "../../src/components/popover/popover";
import { reduceMotion, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Example({ side }: { side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="glass" />}>Share</PopoverTrigger>
      <PopoverContent side={side} aria-label="Share options">
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can view.</PopoverDescription>
        <input aria-label="Link" defaultValue="https://example.com" />
        <PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

const popup = () => document.querySelector<HTMLElement>("[data-slot=popover-content]");

describeVariants((variant) => {
  it("opens from its trigger, is labelled by its title and described by its description", async () => {
    renderUi(<Example />, variant);
    const trigger = screen.getByRole("button", { name: "Share" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(popup()).toBeNull();

    await userEvent.click(trigger);
    await expect.poll(popup).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => screen.getByText("Share this page")).toBeVisible();
    expect(popup()).toHaveAccessibleDescription("Anyone with the link can view.");
  });

  it("Enter/Space on the trigger opens it, Escape closes it and focus returns to the trigger", async () => {
    renderUi(<Example />, variant);
    const trigger = screen.getByRole("button", { name: "Share" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(popup).not.toBeNull();
    // Focus moves into the popup so keyboard users can reach its controls.
    await expect.poll(() => popup()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(popup).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);

    await userEvent.keyboard(" ");
    await expect.poll(popup).not.toBeNull();
  });

  it("Tab moves through the content; PopoverClose closes it", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    await expect.poll(popup).not.toBeNull();
    screen.getByRole("textbox", { name: "Link" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(popup).toBeNull();
  });

  it("clicking outside dismisses it", async () => {
    renderUi(
      <>
        <button>outside</button>
        <Example />
      </>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    await expect.poll(popup).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "outside" }));
    await expect.poll(popup).toBeNull();
  });

  it("controlled open state", async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={<Button />}>Menu</PopoverTrigger>
          <PopoverContent aria-label="Panel">
            <PopoverTitle>Open from the start</PopoverTitle>
          </PopoverContent>
        </Popover>
      );
    }
    renderUi(<Controlled />, variant);
    await expect.poll(popup).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(popup).toBeNull();
  });

  it.each(["top", "bottom", "left", "right"] as const)("places itself on the %s side", async (side) => {
    renderUi(
      <div style={{ padding: 360 }}>
        <Example side={side} />
      </div>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    await expect.poll(popup).not.toBeNull();
    const positioner = popup()!.parentElement!;
    await expect.poll(() => positioner.getAttribute("data-side")).toBe(side);
  });

  it("has no axe violations while open", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    await expect.poll(popup).not.toBeNull();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion: the popup fades without a scale", async () => {
  reduceMotion();
  renderUi(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Share" }));
  await expect.poll(popup).not.toBeNull();
  await expect.poll(() => getComputedStyle(popup()!).opacity).toBe("1");
  expect(popup()!.className).toContain("motion-ok:data-starting-style:scale-[0.96]");
});
