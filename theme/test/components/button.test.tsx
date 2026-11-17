import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import { describeVariants, renderUi, runAxe } from "../render";

describeVariants((variant) => {
  it("moves with transform only within 220 ms and fades colour in 150 ms, all on ease.out", () => {
    renderUi(<Button>Release</Button>, variant);
    const style = getComputedStyle(screen.getByRole("button", { name: "Release" }));
    const properties = style.transitionProperty.split(",").map((p) => p.trim());
    const durations = style.transitionDuration.split(",").map((d) => parseFloat(d) * 1000);
    expect(durations[properties.indexOf("scale")]).toBe(220);
    expect(durations[properties.indexOf("translate")]).toBe(220);
    expect(durations[properties.indexOf("background-color")]).toBe(150);
    expect(style.transitionTimingFunction).toContain("0.22, 1, 0.36, 1");
  });

  it("renders a native button and activates with click, Enter and Space", async () => {
    const onClick = vi.fn();
    renderUi(<Button onClick={onClick}>Save changes</Button>, variant);
    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-slot", "button");

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    button.focus();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("while loading it keeps focus, announces busy and ignores activation", async () => {
    const onClick = vi.fn();
    renderUi(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
      variant,
    );
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    button.focus();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    // Playwright treats aria-disabled as not actionable; force the click to prove it is ignored.
    await userEvent.click(button, { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled is truly disabled; a link render keeps link semantics", () => {
    renderUi(
      <>
        <Button disabled>Delete</Button>
        <Button render={<a href="#pricing" />}>See pricing</Button>
      </>,
      variant,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    const link = screen.getByRole("link", { name: "See pricing" });
    expect(link).toHaveAttribute("href", "#pricing");
    expect(link).not.toHaveAttribute("type");
  });

  it("has no axe violations across variants and sizes", async () => {
    renderUi(
      <div className="flex flex-wrap gap-3 p-6">
        <Button>Primary</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Settings">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
          </svg>
        </Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

describe("Button API", () => {
  it("merges className onto the outer element and forwards extra props", () => {
    renderUi(
      <Button className="test-class" data-testid="btn" fullWidth>
        Wide
      </Button>,
    );
    const button = screen.getByTestId("btn");
    expect(button).toHaveClass("test-class", "w-full");
  });
});
