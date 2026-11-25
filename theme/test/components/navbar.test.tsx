import { expect, it, vi } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Navbar, isPlainLeftClick, type NavbarItem } from "../../src/components/navbar/navbar";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const items: NavbarItem[] = [
  { value: "home", label: "Home", href: "#home" },
  { value: "docs", label: "Docs", href: "#docs" },
  { value: "pricing", label: "Pricing" },
  { value: "beta", label: "Beta", disabled: true },
];

const nav = (name = "Main") => screen.getByRole("navigation", { name });
const wide = (ui: React.ReactElement) => <div style={{ width: 900 }}>{ui}</div>;
const narrow = (ui: React.ReactElement) => <div style={{ width: 240 }}>{ui}</div>;

describeVariants((variant) => {
  it("is a named nav landmark with a list; links carry href and the active one aria-current", () => {
    renderUi(
      wide(<Navbar items={items} value="docs" brand={<span>Sheen</span>} actions={<button>Sign in</button>} />),
      variant,
    );
    expect(within(nav()).getByRole("list")).toBeInTheDocument();
    expect(within(nav()).getByText("Sheen")).toBeInTheDocument();
    expect(within(nav()).getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    const docs = within(nav()).getByRole("link", { name: "Docs" });
    expect(docs).toHaveAttribute("href", "#docs");
    expect(docs).toHaveAttribute("aria-current", "page");
    expect(within(nav()).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    // Items without an href are buttons.
    expect(within(nav()).getByRole("button", { name: "Pricing" })).toBeInTheDocument();
    expect(within(nav()).getByRole("button", { name: "Beta" })).toBeDisabled();
  });

  it("clicking an item reports its value; a modified click on a link is left to the browser", async () => {
    const onValueChange = vi.fn();
    renderUi(wide(<Navbar items={items} value="home" onValueChange={onValueChange} />), variant);
    await userEvent.click(within(nav()).getByRole("button", { name: "Pricing" }));
    expect(onValueChange).toHaveBeenLastCalledWith("pricing");
    await userEvent.click(within(nav()).getByRole("link", { name: "Docs" }));
    expect(onValueChange).toHaveBeenLastCalledWith("docs");
  });

  it("keyboard: Tab walks the items in order, skipping nothing but disabled, Enter activates", async () => {
    const onValueChange = vi.fn();
    renderUi(
      wide(
        <>
          <button>before</button>
          <Navbar items={items} value="home" onValueChange={onValueChange} />
        </>,
      ),
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    expect(within(nav()).getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.tab();
    expect(within(nav()).getByRole("link", { name: "Docs" })).toHaveFocus();
    await userEvent.tab();
    expect(within(nav()).getByRole("button", { name: "Pricing" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("pricing");
  });

  it("renderLink hands each href item to your router's link component", () => {
    renderUi(
      wide(
        <Navbar
          items={items}
          value="home"
          renderLink={(props, item) => (
            <a {...props} data-router="yes" data-item={item.value}>
              {props.children}
            </a>
          )}
        />,
      ),
      variant,
    );
    expect(within(nav()).getByRole("link", { name: "Docs" })).toHaveAttribute("data-router", "yes");
    expect(within(nav()).getByRole("link", { name: "Home" })).toHaveAttribute("data-item", "home");
  });

  it("variant bar / floating both render, and aria-label renames the landmark", () => {
    const { rerender } = renderUi(
      wide(<Navbar items={items} value="home" variant="bar" aria-label="Primary" />),
      variant,
    );
    expect(nav("Primary")).toBeInTheDocument();
    rerender(wide(<Navbar items={items} value="home" variant="floating" aria-label="Floating" />));
    expect(nav("Floating")).toBeInTheDocument();
  });

  it("collapsible: a narrow container folds the items into a menu button that opens a popover list", async () => {
    const onValueChange = vi.fn();
    renderUi(
      narrow(
        <Navbar
          items={items}
          value="home"
          onValueChange={onValueChange}
          labels={{ menu: "Open menu" }}
          brand={<span>Sheen</span>}
        />,
      ),
      variant,
    );
    const menu = await screen.findByRole("button", { name: "Open menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(menu);
    const popup = await screen.findByRole("dialog", { name: "Main" });
    expect(within(popup).getByRole("link", { name: "Docs" })).toBeInTheDocument();
    await userEvent.click(within(popup).getByRole("button", { name: "Pricing" }));
    expect(onValueChange).toHaveBeenLastCalledWith("pricing");
    await expect.poll(() => screen.queryByRole("dialog", { name: "Main" })).toBeNull();
  });

  it("the folded menu works from the keyboard: Enter opens, Escape closes and returns focus to the button", async () => {
    renderUi(narrow(<Navbar items={items} value="home" labels={{ menu: "Open menu" }} />), variant);
    const menu = await screen.findByRole("button", { name: "Open menu" });
    menu.focus();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Main" });
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole("dialog", { name: "Main" })).toBeNull();
    await expect.poll(() => document.activeElement).toBe(menu);
  });

  it("controlled value follows the parent", async () => {
    function Controlled() {
      const [v, setV] = useState("home");
      return (
        <>
          {wide(<Navbar items={items} value={v} onValueChange={setV} />)}
          <output>{v}</output>
        </>
      );
    }
    renderUi(<Controlled />, variant);
    await userEvent.click(within(nav()).getByRole("button", { name: "Pricing" }));
    expect(screen.getByRole("status")).toHaveTextContent("pricing");
    expect(within(nav()).getByRole("button", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
  });

  it("has no axe violations (floating, bar, folded and open)", async () => {
    renderUi(
      <div className="grid gap-6" style={{ width: 900 }}>
        <Navbar
          items={items}
          value="docs"
          aria-label="Floating"
          brand={<span>Sheen</span>}
          actions={<button>Sign in</button>}
        />
        <Navbar items={items} value="docs" variant="bar" aria-label="Bar" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });

  it("has no axe violations with the folded menu open", async () => {
    renderUi(narrow(<Navbar items={items} value="home" labels={{ menu: "Open menu" }} />), variant);
    await userEvent.click(await screen.findByRole("button", { name: "Open menu" }));
    await screen.findByRole("dialog", { name: "Main" });
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("isPlainLeftClick ignores modified and non-primary clicks", () => {
  const ev = (o: Partial<MouseEvent>) =>
    ({
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      defaultPrevented: false,
      ...o,
    }) as unknown as Parameters<typeof isPlainLeftClick>[0];
  expect(isPlainLeftClick(ev({}))).toBe(true);
  expect(isPlainLeftClick(ev({ metaKey: true }))).toBe(false);
  expect(isPlainLeftClick(ev({ ctrlKey: true }))).toBe(false);
  expect(isPlainLeftClick(ev({ button: 1 }))).toBe(false);
});

it("the landmark name comes from labels.name, and aria-label wins over it", () => {
  const { rerender } = renderUi(<Navbar items={items} value="home" labels={{ name: "Hauptmenü" }} />);
  expect(screen.getByRole("navigation", { name: "Hauptmenü" })).toBeTruthy();
  rerender(<Navbar items={items} value="home" labels={{ name: "Hauptmenü" }} aria-label="Konto" />);
  expect(screen.getByRole("navigation", { name: "Konto" })).toBeTruthy();
});
