import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../src/components/navigation-menu/navigation-menu";
import { frames, settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Example({ onValueChange }: { onValueChange?: (value: unknown) => void }) {
  return (
    <NavigationMenu aria-label="Main" onValueChange={onValueChange} delay={0} closeDelay={0}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink plain href="#charts">
              Charts
            </NavigationMenuLink>
            <NavigationMenuLink plain href="#blocks">
              Blocks
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink plain href="#guides">
              Guides
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" active>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const shown = () =>
  expect.poll(() => screen.queryByRole("link", { name: "Charts" }), { timeout: 10_000 }).not.toBeNull();

describeVariants((variant) => {
  it("is a named nav landmark with triggers and links", () => {
    renderUi(<Example />, variant);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
  });

  it("opens a glass panel on click, shows its links and closes with Escape, returning focus", async () => {
    const onValueChange = vi.fn();
    renderUi(<Example onValueChange={onValueChange} />, variant);
    const trigger = screen.getByRole("button", { name: "Products" });
    await userEvent.click(trigger);
    await shown();
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
    await expect.poll(() => onValueChange.mock.calls.some((call) => call[0] === "products")).toBe(true);
    // The open state is committed (expanded, links mounted, animation frames flushed): one Escape must close it, no retry loop.
    await frames(2);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("link", { name: "Charts" }), { timeout: 10_000 }).toBeNull();
    await expect.poll(() => document.activeElement === trigger, { timeout: 10_000 }).toBe(true);
  });

  it("Enter opens from the keyboard and Tab moves into the panel's links", async () => {
    renderUi(<Example />, variant);
    await userEvent.tab();
    await expect.poll(() => document.activeElement?.textContent).toContain("Products");
    await userEvent.keyboard("{Enter}");
    await shown();
    await expect
      .poll(() => screen.getByRole("button", { name: "Products" }).getAttribute("aria-expanded"))
      .toBe("true");
    screen.getByRole("link", { name: "Charts" }).focus();
    await expect.poll(() => document.activeElement?.textContent).toBe("Charts");
  });

  it("hover intent opens an item's panel", async () => {
    renderUi(<Example />, variant);
    await userEvent.hover(screen.getByRole("button", { name: "Products" }));
    await shown();
  });

  it("arrow keys move between the items of the bar", async () => {
    renderUi(<Example />, variant);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement?.textContent).toContain("Learn");
  });

  it("has no axe violations closed and open", async () => {
    renderUi(<Example />, variant);
    expect(await runAxe()).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Products" }));
    await shown();
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
